#!/usr/bin/env python3
"""神隐天阙截图与渲染验证工具"""
import argparse
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--w", type=int, default=1600)
ap.add_argument("--h", type=int, default=1000)
ap.add_argument("--url", default="http://127.0.0.1:8341/index.html")
ap.add_argument("--cam", type=int, default=-1)
ap.add_argument("--phase", type=int, default=-1)
ap.add_argument("--wait", type=int, default=3000)
ap.add_argument("--settle", type=int, default=1200)
ap.add_argument("--gl", default="metal", choices=["metal", "swiftshader", "default"])
ap.add_argument("--hide-ui", action="store_true")
a = ap.parse_args()

args = ["--no-sandbox"]
if a.gl == "metal":
    args += ["--use-gl=angle", "--use-angle=metal"]
elif a.gl == "swiftshader":
    args += ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

errors = []
manifest = {"out": a.out, "url": a.url, "gl": a.gl, "viewport": {"width": a.w, "height": a.h}}

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=args)
        page = browser.new_page(viewport={"width": a.w, "height": a.h}, device_scale_factor=1)
        page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
        
        t0 = time.time()
        page.goto(a.url, wait_until="load")
        page.wait_for_selector("#veil.gone", timeout=30000)
        page.wait_for_timeout(a.settle)
        
        if a.cam >= 0:
            page.evaluate(f"window.APP && window.APP.switchCamera({a.cam})")
            page.wait_for_timeout(1800)
            
        if a.phase >= 0:
            page.evaluate(f"window.APP && window.APP.setPhase({a.phase})")
            page.wait_for_timeout(1600)
            
        if a.hide_ui:
            page.evaluate("""
                document.querySelectorAll('#brand, #ui, #hint').forEach(el => el.style.display = 'none');
            """)
            
        page.wait_for_timeout(a.wait)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        page.screenshot(path=a.out)
        manifest["elapsedSec"] = round(time.time() - t0, 2)
        print(f"Captured {a.out} in {manifest['elapsedSec']}s")
except Exception as exc:
    errors.append(f"[fatal] {type(exc).__name__}: {exc}")
    print("Fatal exception:", exc)

if errors:
    print(f"Errors/warnings detected ({len(errors)}):")
    for err in errors:
        print("  ", err)
    sys.exit(1)
else:
    print("Zero errors/warnings! Pass.")
    sys.exit(0)
