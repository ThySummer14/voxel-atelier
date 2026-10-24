#!/usr/bin/env python3
"""
Captures multi-angle high-resolution screenshots of 《浮空千机书院》 using headless Chromium & Playwright.
Saves renders to both the project directory and the artifacts directory for visual inspection.
"""

import os
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

PROJECT_DIR = "/Users/thysummer/工作流/code/体素/fukong-qianji-shuyuan"
ARTIFACT_DIR = "/Users/thysummer/.gemini/antigravity/brain/ade29c66-09e6-43eb-8e0e-67d4328562cb"
RENDERS_DIR = os.path.join(PROJECT_DIR, "renders")
os.makedirs(RENDERS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

PORT = 8765

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
        httpd.serve_forever()

def capture_all():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(0.5)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"])
        page = browser.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
        page.wait_for_timeout(2000)

        shots = [
            ("01_overview_starlight_ui.png", "overview", "starlight", False),
            ("02_overview_starlight_clean.png", "overview", "starlight", True),
            ("03_overview_sunset_clean.png", "overview", "sunset", True),
            ("04_armillary_crown.png", "armillary", "starlight", True),
            ("05_subterranean_gear_core.png", "core", "starlight", True),
            ("06_tea_island_rainbow_bridge.png", "bridge", "dawn", True),
            ("07_airship_dock_waterfall.png", "dock", "sunset", True),
        ]

        for filename, view_key, preset_key, hide_ui in shots:
            page.evaluate(f"window.jumpToView('{view_key}', '{preset_key}')")
            is_hidden = page.evaluate("document.body.classList.contains('ui-hidden')")
            if hide_ui != is_hidden:
                page.evaluate("document.getElementById('btn-toggle-ui').click()")
            page.wait_for_timeout(600)
            out_proj = os.path.join(RENDERS_DIR, filename)
            out_art = os.path.join(ARTIFACT_DIR, filename)
            page.screenshot(path=out_proj)
            page.screenshot(path=out_art)
            print(f"Saved {filename}")

        browser.close()

if __name__ == "__main__":
    capture_all()
