#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""playwright 截图验收: 打开作品页, 收集 console/404, 多视角截图."""
import sys, time, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "renders")
os.makedirs(OUT, exist_ok=True)
URL = "http://localhost:8899/kongque/"
VIEWS = sys.argv[1:] or ["threeq", "front", "side", "eye", "top"]

errors, warnings, failed = [], [], []
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/Users/thysummer/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell", args=["--use-angle=metal", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox"])
    pg = b.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
    pg.on("console", lambda m: (errors if m.type == "error" else warnings if m.type == "warning" else []).append(m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
    pg.on("requestfailed", lambda r: failed.append(r.url + " " + str(r.failure)))
    pg.on("response", lambda r: failed.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(3500)
    for tid in ("#tglRotate", "#tglPetal"):
        btn = pg.query_selector(tid)
        if btn and "on" in (btn.get_attribute("class") or ""):
            btn.click(); pg.wait_for_timeout(200)
    for v in VIEWS:
        sel = f'[data-view="{v}"]'
        if pg.query_selector(sel):
            pg.click(sel)
            pg.wait_for_timeout(2200)
        pg.screenshot(path=os.path.join(OUT, f"viewer_{v}.png"))
        print("shot", v)
    b.close()
print("=== console errors ==="); [print(" ", e) for e in errors] or print("  (none)")
print("=== warnings ==="); [print(" ", w) for w in warnings[:10]] or print("  (none)")
print("=== failed/404 ==="); [print(" ", f) for f in failed] or print("  (none)")