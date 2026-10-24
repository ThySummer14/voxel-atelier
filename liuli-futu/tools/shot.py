#!/usr/bin/env python3
"""琉璃浮屠 · 截图器
用法: python3 tools/shot.py out.png [--w 1600 --h 1000 --chapter 0 --time 0.13 --wait 7000 --gl metal]
"""
import argparse, sys, time
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--w", type=int, default=1600)
ap.add_argument("--h", type=int, default=1000)
ap.add_argument("--url", default="http://127.0.0.1:8911/index.html")
ap.add_argument("--chapter", type=int, default=-1)
ap.add_argument("--time", type=float, default=-1)
ap.add_argument("--wait", type=int, default=8000)
ap.add_argument("--settle", type=int, default=2600)
ap.add_argument("--gl", default="metal", choices=["metal", "swiftshader", "default"])
ap.add_argument("--fps", action="store_true")
ap.add_argument("--reveal", type=int, default=-1, help="触发显形动画后 N 毫秒截图")
ap.add_argument("--rub", type=int, default=0)
ap.add_argument("--lamps", type=int, default=0)
ap.add_argument("--cam", default="", help="x y z tx ty tz fov")
ap.add_argument("--still", action="store_true", help="关掉自动环绕，便于前后对比")
ap.add_argument("--hide", default="", help="截图前 display:none 的选择器，用于剥离 UI 看纯画面")
a = ap.parse_args()

args = ["--no-sandbox"]
if a.gl == "metal":
    args += ["--use-gl=angle", "--use-angle=metal"]
elif a.gl == "swiftshader":
    args += ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=args)
    pg = b.new_page(viewport={"width": a.w, "height": a.h}, device_scale_factor=1)
    errs = []
    pg.on("console", lambda m: errs.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"[pageerror] {e}"))
    t0 = time.time()
    pg.goto(a.url, wait_until="load")
    pg.wait_for_selector("#loader.gone", timeout=90000)
    if a.chapter >= 0:
        pg.evaluate(f"window.LL && window.LL.chapter({a.chapter})")
    if a.time >= 0:
        pg.evaluate(f"window.LL && window.LL.time({a.time})")
    if a.cam:
        v=[float(t) for t in a.cam.split()]
        pg.evaluate("(v)=>window.LL&&window.LL.cam(...v)", v)
        pg.wait_for_timeout(900)
    if a.lamps:
        pg.evaluate("window.LL && window.LL.lamps(true)")
    if a.rub:
        pg.evaluate("window.LL && window.LL.rub(true)")
        pg.wait_for_timeout(1400)
    if a.still:
        pg.evaluate("window.LL && window.LL.spin(false)")
        pg.wait_for_timeout(1500)
    if a.hide:
        pg.evaluate("(s)=>{for(const e of document.querySelectorAll(s)) e.style.display='none';}", a.hide)
    pg.wait_for_timeout(a.wait)
    if a.reveal >= 0:
        pg.evaluate("window.LL && window.LL.reveal()")
        pg.wait_for_timeout(a.reveal)
    if a.fps:
        print("fps:", pg.evaluate("document.getElementById('st-fps').textContent"))
    pg.screenshot(path=a.out)
    print(f"shot {a.out} in {time.time()-t0:.1f}s  gl={a.gl}")
    for e in errs[:14]:
        print("  ", e[:220])
    b.close()
