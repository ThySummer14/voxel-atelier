#!/usr/bin/env python3
"""一次起一个浏览器，把全部分镜/染色阶段/读画/夜航截完。

shot.py 每张都要重新载入并重建 193 万体素（约 25 s）；调机位与配色时这个
代价没法接受，所以这里复用同一个 page，用 window.QL 直接切状态。
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DEFAULT_SHOTS = [
    {"name": "ch0", "chapter": 0},
    {"name": "ch1", "chapter": 1},
    {"name": "ch2", "chapter": 2},
    {"name": "ch3", "chapter": 3},
    {"name": "ch4", "chapter": 4},
    {"name": "ch5", "chapter": 5},
    {"name": "ch6", "chapter": 6},
    {"name": "silk", "chapter": 2, "silk": 1},
    {"name": "dye-0.06", "chapter": 2, "dye": 0.06},
    {"name": "dye-0.22", "chapter": 2, "dye": 0.22},
    {"name": "dye-0.40", "chapter": 2, "dye": 0.40},
    {"name": "dye-0.62", "chapter": 2, "dye": 0.62},
    {"name": "dye-0.85", "chapter": 2, "dye": 0.85},
]


def free_port():
    import socket
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="output/shots")
    ap.add_argument("--w", type=int, default=1600)
    ap.add_argument("--h", type=int, default=1000)
    ap.add_argument("--port", type=int, default=0)
    ap.add_argument("--quality", default="high")
    ap.add_argument("--url", default="")
    ap.add_argument("--shot", default="", help="只截这些名字，逗号分隔")
    ap.add_argument("--inline", default="",
                    help='临时机位试拍：JSON 数组，如 [{"name":"t1","cam":[200,12,150,90,14,55,42]}]')
    ap.add_argument("--settle", type=int, default=1500)
    ap.add_argument("--move", type=int, default=2900, help="换章后等待运镜结束的毫秒数")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    if args.list:
        for s in DEFAULT_SHOTS:
            print(s["name"])
        return 0

    want = {t.strip() for t in args.shot.split(",") if t.strip()}
    if args.inline:
        shots = json.loads(args.inline)
    else:
        shots = [s for s in DEFAULT_SHOTS if not want or s["name"] in want]

    server = None
    url = args.url
    env = dict(os.environ)
    port = args.port
    if not url:
        port = port or free_port()
        env["PORT"] = str(port)
        server = subprocess.Popen(["node", str(ROOT / ".serve.cjs")], cwd=ROOT,
                                  env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        url = f"http://127.0.0.1:{port}/index.html"
        for _ in range(120):
            if server.poll() is not None:
                raise SystemExit(f"serve failed: {server.stderr.read().decode()[:400]}")
            try:
                with urllib.request.urlopen(url, timeout=1) as r:
                    if r.status == 200:
                        break
            except Exception:
                time.sleep(0.05)
        else:
            raise SystemExit("server never became ready")

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = ROOT / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    code = 0
    report = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True,
                                        args=["--no-sandbox", "--use-gl=angle", "--use-angle=metal"])
            page = browser.new_page(viewport={"width": args.w, "height": args.h},
                                    device_scale_factor=1)
            errors: list[str] = []
            page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}")
                    if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
            t0 = time.time()
            page.goto(f"{url}?quality={args.quality}", wait_until="load")
            page.wait_for_selector("#loader.gone", timeout=240000)
            page.wait_for_timeout(args.settle)
            boot_ms = round(time.time() - t0, 1)
            manifest = page.evaluate("({stats: window.QL.stats, gl: window.QL.webglInfo()})")
            print(f"boot {boot_ms}s  stats {json.dumps(manifest['stats'], ensure_ascii=False)}")
            for s in shots:
                cmds = []
                if "chapter" in s:
                    cmds.append(f"window.QL.chapter({s['chapter']})")
                if "cam" in s:
                    cmds.append(f"window.QL.cam(...{json.dumps(s['cam'])})")
                if "scroll" in s:
                    cmds.append(f"window.QL.scroll({s['scroll']})")
                if "time" in s:
                    cmds.append(f"window.QL.time({s['time']})")
                if "lamps" in s:
                    cmds.append(f"window.QL.lamps({bool(s['lamps'])})")
                for c in cmds:
                    page.evaluate(c)
                page.wait_for_timeout(args.move if "chapter" in s else 700)
                if "dye" in s:
                    page.evaluate(f"window.QL.dye({s['dye']})")
                if s.get("silk"):
                    page.evaluate("window.QL.silk(true)")
                page.wait_for_timeout(900)
                path = out_dir / f"{s['name']}.png"
                page.screenshot(path=str(path))
                probe = page.evaluate("window.QL.probe()")
                entry = {
                    "name": s["name"], "file": str(path), "probe": probe,
                    "spec": {k: v for k, v in s.items()},
                    "stats": page.evaluate("window.QL.stats"),
                    "webgl": page.evaluate("window.QL.webglInfo()"),
                    "viewport": {"width": args.w, "height": args.h},
                    "quality": args.quality,
                }
                report.append(entry)
                path.with_suffix(".json").write_text(
                    json.dumps(entry, ensure_ascii=False, indent=1), encoding="utf-8")
                print(f"  {s['name']:<12} hue={probe['hueSat']:>6} sat={probe['sat']:.3f} "
                      f"rgb={probe['rgb']}")
                if s.get("silk"):
                    page.evaluate("window.QL.silk(false)")
                    page.wait_for_timeout(700)
                if "dye" in s:
                    page.evaluate("window.QL.dye(2)")
            page.evaluate("window.QL.chapter(0)")
            browser.close()
    except Exception as exc:
        errors.append(f"[fatal] {type(exc).__name__}: {exc}")
        code = 1
    finally:
        if server is not None and server.poll() is None:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()

    (out_dir / "shots.json").write_text(
        json.dumps({"shots": report, "consoleErrors": errors}, ensure_ascii=False, indent=1),
        encoding="utf-8")
    if errors:
        print(f"console error/warning: {len(errors)}")
        for e in errors[:10]:
            print("  ", e[:220])
        code = 1
    else:
        print("console error/warning: 0")
    return code


if __name__ == "__main__":
    sys.exit(main())
