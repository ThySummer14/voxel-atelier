#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""干净静帧(隐藏HUD) + 展厅封面 1600x1000 / 800x500."""
import os, io
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..")
OUT = os.path.join(HERE, "..", "renders")
COVERS = os.path.join(ROOT, "assets", "covers")
os.makedirs(OUT, exist_ok=True); os.makedirs(COVERS, exist_ok=True)
URL = "http://localhost:8899/kongque/"
VIEWS = ["front", "threeq", "side", "top", "eye"]

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/Users/thysummer/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell", args=["--use-angle=metal", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox"])
    pg = b.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(3500)
    pg.add_style_tag(content="#hud-top,#hud-side,#hud-bottom{opacity:0!important} #loader{display:none!important}")
    for tid in ("#tglRotate", "#tglPetal"):
        btn = pg.query_selector(tid)
        if btn and "on" in (btn.get_attribute("class") or ""):
            btn.click(); pg.wait_for_timeout(150)
    for v in VIEWS:
        pg.click(f'[data-view="{v}"]'); pg.wait_for_timeout(2200)
        pg.screenshot(path=os.path.join(OUT, f"clean_{v}.png"))
        print("clean", v)
    b.close()

hero = Image.open(os.path.join(OUT, "clean_front.png")).convert("RGB")
hero.save(os.path.join(COVERS, "kongque.jpg"), quality=92)
hero.resize((800, 500), Image.LANCZOS).save(os.path.join(COVERS, "kongque@800.jpg"), quality=90)
print("covers written")