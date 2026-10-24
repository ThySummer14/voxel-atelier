#!/usr/bin/env python3
"""出图：浏览器真渲染截图（全页，含界面）。要求 tools/serve.mjs 已在 :8945。
用法：python3 tools/shoot.py [--out renders] [--only cover,fell] [--w 1600 --h 1000]"""
import sys, os, json, time, argparse
from playwright.sync_api import sync_playwright

SHOTS = [
    # name, pattern, camera, time(秒，None=自动), 附加操作
    ("01_cover", 1, "cover", 34.0, None),
    ("02_fell", 1, "fell", 12.0, None),
    ("03_tape", 1, "tape", 36.0, None),
    ("04_tower", 1, "tower", 20.0, None),
    ("05_side", 2, "side", 30.0, None),
    ("06_lattice", 0, "fell", 44.0, None),
    ("07_star", 2, "cover", 52.0, None),
    ("08_done", 1, "cover", None, "done"),
    ("09_unload", 1, "cover", None, "unload"),
    ("10_rack", 0, "rack", None, "all-done"),
    ("11_dark", 1, "cover", 30.0, "lamp-off"),
    ("12_skeleton", 1, "fell", 26.0, "frame-off"),
]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="renders")
    ap.add_argument("--only", default="")
    ap.add_argument("--w", type=int, default=1600)
    ap.add_argument("--h", type=int, default=1000)
    ap.add_argument("--url", default="http://localhost:8945/index.html")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    only = [s.strip() for s in args.only.split(",") if s.strip()]
    shots = [s for s in SHOTS if not only or any(s[0].startswith(o) for o in only)]

    manifest = []
    with sync_playwright() as pw:
        b = pw.chromium.launch(headless=True, args=["--use-angle=metal", "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": args.w, "height": args.h}, device_scale_factor=1)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(args.url, wait_until="domcontentloaded")
        pg.wait_for_function("window.JT && window.JT.ready()", timeout=120_000)
        pg.evaluate("JT.play(false)")
        time.sleep(0.6)
        # 先把三匹都织好挂上（用于 10_rack）
        for (name, pat, cam, t, extra) in shots:
            if extra == "all-done":
                for k in range(3):
                    pg.evaluate("k => JT.pattern(k)", k)
                    time.sleep(0.5)
                    pg.evaluate("JT.setTime(JT.total() - 0.001)")
                    time.sleep(0.6)
                    pg.evaluate("JT.play(true); JT.speed(30)")
                    time.sleep(3.2)
                    pg.evaluate("JT.play(false)")
                    time.sleep(0.5)
                pg.evaluate("JT.camera('rack')")
                time.sleep(1.2)
                pg.screenshot(path=f"{args.out}/{name}.png")
                manifest.append({"name": name, "note": "三匹落机挂架"})
                continue
            pg.evaluate("k => JT.pattern(k)", pat)
            time.sleep(0.5)
            if extra == "lamp-off":
                pg.evaluate("JT.toggleLamp()")
            if extra == "frame-off":
                pg.evaluate("JT.toggleFrame()")
            if extra == "done":
                pg.evaluate("JT.setTime(JT.total() - 0.001)")
            elif extra == "unload":
                pg.evaluate("JT.setTime(JT.duration() - 1.2)")
            elif t is not None:
                pg.evaluate("t => JT.setTime(t)", t)
            pg.evaluate("c => JT.camera(c)", cam)
            time.sleep(1.6)
            st = pg.evaluate("JT.probe()")
            pg.screenshot(path=f"{args.out}/{name}.png")
            manifest.append({"name": name, "pattern": st["pattern"], "cam": cam, "t": round(st["clock"], 1),
                             "fps": round(st["fps"], 1), "rows": st["rows"], "note": extra or ""})
            print(f"  {name}: 花本{st['pattern']} 机位{cam} t={st['clock']:.1f}s 纬{st['rows']} {st['fps']:.0f}fps")
            if extra == "lamp-off":
                pg.evaluate("JT.toggleLamp()")
            if extra == "frame-off":
                pg.evaluate("JT.toggleFrame()")
        b.close()
    with open(f"{args.out}/manifest.json", "w") as f:
        json.dump({"shots": manifest, "errors": errs, "viewport": [args.w, args.h]}, f, ensure_ascii=False, indent=1)
    if errs:
        print("页面报错：", errs[:3])
        sys.exit(1)
    print(f"共 {len(manifest)} 张 → {args.out}/")

if __name__ == "__main__":
    main()