#!/usr/bin/env python3
"""青绿千里截图器；保留旧 CLI，并把 GPU、错误、FPS 和可选 JSON 清单纳入验收。"""
import argparse
import json
import os
import statistics
import sys
import time
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--w", type=int, default=1600)
ap.add_argument("--h", type=int, default=1000)
ap.add_argument("--url", default="http://127.0.0.1:8912/index.html")
ap.add_argument("--chapter", type=int, default=-1)
ap.add_argument("--time", type=float, default=-1)
ap.add_argument("--wait", type=int, default=6500)
ap.add_argument("--settle", type=int, default=1600)
ap.add_argument("--gl", default="metal", choices=["metal", "swiftshader", "default"])
ap.add_argument("--fps", action="store_true")
ap.add_argument("--stats", action="store_true", help="打印 window.QL.stats")
ap.add_argument("--dye", type=float, default=-1)
ap.add_argument("--redye", type=int, default=-1)
ap.add_argument("--silk", type=int, default=0)
ap.add_argument("--scroll", type=float, default=-1)
ap.add_argument("--lamps", type=int, default=0)
ap.add_argument("--cam", default="", help="x y z tx ty tz fov")
ap.add_argument("--still", action="store_true")
ap.add_argument("--hide", default="")
ap.add_argument("--hide3d", default="")
ap.add_argument("--shadows", type=int, default=-1)
ap.add_argument("--pr", type=float, default=-1)
ap.add_argument("--measure", action="store_true", help="量 fps：连续采样 3 秒")
ap.add_argument("--min-fps", type=float, default=None, help="FPS 中位数下限；不足时退出 1")
ap.add_argument("--manifest", nargs="?", const=None, default=None, help="输出 JSON 清单；省略路径时与截图同名 .json")
a = ap.parse_args()

args = ["--no-sandbox"]
if a.gl == "metal":
    args += ["--use-gl=angle", "--use-angle=metal"]
elif a.gl == "swiftshader":
    args += ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

manifest_path = a.manifest
if manifest_path is None and "--manifest" in sys.argv:
    manifest_path = os.path.splitext(a.out)[0] + ".json"
errors = []
manifest = {"out": a.out, "url": a.url, "gl": a.gl, "viewport": {"width": a.w, "height": a.h, "dpr": None}}
failed = False
browser = None
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=args)
        page = browser.new_page(viewport={"width": a.w, "height": a.h}, device_scale_factor=1)
        page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
        t0 = time.time()
        page.goto(a.url, wait_until="load")
        page.wait_for_selector("#loader.gone", timeout=180000)
        page.wait_for_timeout(a.settle)
        manifest["dpr"] = page.evaluate("window.devicePixelRatio || 1")
        manifest["viewport"]["dpr"] = manifest["dpr"]
        manifest["webgl"] = page.evaluate("window.QL && window.QL.webglInfo ? window.QL.webglInfo() : null")
        renderer = str((manifest["webgl"] or {}).get("renderer", ""))
        if a.gl == "metal" and not ("apple" in renderer.lower() and "metal" in renderer.lower()):
            errors.append(f"[gpu] Metal requested but renderer is not Apple/Metal: {renderer}")
        manifest["stats"] = page.evaluate("window.QL && window.QL.stats ? window.QL.stats : null")
        manifest["chapter"] = page.evaluate("window.QL && window.QL.chapterIdx ? window.QL.chapterIdx() : null")
        manifest["time"] = page.evaluate("document.getElementById('time')?.value ?? null")
        manifest["file"] = os.path.abspath(a.out)

        if a.chapter >= 0:
            page.evaluate(f"window.QL && window.QL.chapter({a.chapter})")
            page.wait_for_timeout(2900)
        if a.time >= 0:
            page.evaluate(f"window.QL && window.QL.time({a.time})")
        if a.cam:
            v = [float(t) for t in a.cam.split()]
            page.evaluate("(v)=>window.QL&&window.QL.cam(...v)", v)
            page.wait_for_timeout(800)
        if a.scroll >= 0:
            page.evaluate(f"window.QL && window.QL.scroll({a.scroll})")
        if a.lamps:
            page.evaluate("window.QL && window.QL.lamps(true)")
        if a.silk:
            page.evaluate("window.QL && window.QL.silk(true)")
            page.wait_for_timeout(1500)
        if a.dye >= 0:
            page.evaluate(f"window.QL && window.QL.dye({a.dye})")
        if a.shadows >= 0:
            page.evaluate(f"window.QL && window.QL.shadows({bool(a.shadows)})")
        if a.pr >= 0:
            page.evaluate(f"window.QL && window.QL.pr({a.pr})")
        if a.still:
            # QL.spin()/QL.play() 返回 undefined，用 && 串会在第一个就短路，
            # 于是 --still 从来没真的停掉自动展卷。
            page.evaluate("()=>{window.QL.spin(false); window.QL.play(false);}")
            page.wait_for_timeout(1400)
        if a.hide3d:
            for name in [s.strip() for s in a.hide3d.split(",") if s.strip()]:
                page.evaluate(f"window.QL && window.QL.hide('{name}', true)")
        if a.hide:
            page.evaluate("(s)=>{for(const e of document.querySelectorAll(s)) e.style.display='none';}", a.hide)
        page.wait_for_timeout(a.wait)
        if a.redye >= 0:
            page.evaluate("window.QL && window.QL.redye()")
            page.wait_for_timeout(a.redye)

        manifest["stats"] = page.evaluate("window.QL && window.QL.stats ? window.QL.stats : null")
        manifest["chapter"] = page.evaluate("window.QL && window.QL.chapterIdx ? window.QL.chapterIdx() : null")
        manifest["time"] = page.evaluate("document.getElementById('time')?.value ?? null")
        fps_samples = None
        if a.measure or a.min_fps is not None:
            fps_samples = page.evaluate("""()=>new Promise(r=>{const a=[];let n=0;const t=setInterval(()=>{a.push(+document.getElementById('st-fps').textContent||0);if(++n>=6){clearInterval(t);r(a)}},500)})""")
            manifest["fpsSamples"] = fps_samples
            median_fps = statistics.median(fps_samples)
            manifest["fpsMedian"] = median_fps
            if a.min_fps is not None and median_fps < a.min_fps:
                errors.append(f"[fps] median {median_fps} < --min-fps {a.min_fps}")
        elif a.fps:
            manifest["fps"] = page.evaluate("document.getElementById('st-fps').textContent")
        page.screenshot(path=a.out)
        manifest["elapsedSec"] = round(time.time() - t0, 2)
        if a.stats:
            print("stats:", json.dumps(manifest["stats"], ensure_ascii=False))
        if a.fps or a.measure or a.min_fps is not None:
            print("fps:", manifest.get("fpsMedian", manifest.get("fps")))
        print(f"shot {a.out} in {manifest['elapsedSec']:.1f}s  gl={a.gl}")
except Exception as exc:
    errors.append(f"[fatal] {type(exc).__name__}: {exc}")
    manifest["fatal"] = errors[-1]

manifest["consoleErrorWarning"] = errors
manifest["pass"] = len(errors) == 0
if manifest_path:
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
if errors:
    print(f"console error/warning: {len(errors)}")
    for e in errors[:16]:
        print("  ", e[:240])
    failed = True
else:
    print("console error/warning: 0")
print(json.dumps(manifest, ensure_ascii=False, indent=1))
sys.exit(1 if failed else 0)
