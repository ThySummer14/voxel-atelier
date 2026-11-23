#!/usr/bin/env python3
from __future__ import annotations

import argparse
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "valentine"
RENDERS = WORK / "renders"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_server():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{server.server_port}/valentine/"


def settle(page, milliseconds=1600):
    page.evaluate("VALENTINE.setAutoRotate(false)")
    page.wait_for_timeout(milliseconds)


def shot(page, path, view, exploded=False, night=False, mobile=False):
    page.evaluate(
        "([view, exploded, night]) => { VALENTINE.setView(view); VALENTINE.setExploded(exploded); VALENTINE.setNight(night); }",
        [view, exploded, night],
    )
    settle(page, 2200 if exploded else 1500)
    page.screenshot(path=str(path))
    state = page.evaluate("VALENTINE.getState()")
    print(json.dumps({"shot": path.name, "state": state}, ensure_ascii=False))


def make_covers():
    overview = Image.open(RENDERS / "01-overview.png").convert("RGB")
    if overview.size != (1600, 1000):
        overview = overview.resize((1600, 1000), Image.Resampling.LANCZOS)
    overview.save(ROOT / "assets" / "covers" / "valentine.jpg", quality=94, subsampling=0)
    overview.resize((800, 500), Image.Resampling.LANCZOS).save(ROOT / "assets" / "covers" / "valentine@800.jpg", quality=92, subsampling=0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--shot", default="all", choices=["all", "overview", "keyboard", "exploded", "typing", "night", "mobile"])
    args = parser.parse_args()
    RENDERS.mkdir(parents=True, exist_ok=True)
    server, url = start_server()
    messages = []
    failures = []
    report = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                executable_path="/Users/thysummer/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
                args=["--use-gl=angle", "--use-angle=metal", "--enable-webgl"],
            )
            page = browser.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
            page.on("console", lambda msg: messages.append({"type": msg.type, "text": msg.text}))
            page.on("pageerror", lambda error: messages.append({"type": "pageerror", "text": str(error)}))
            page.on("requestfailed", lambda request: failures.append({"url": request.url, "failure": request.failure}))
            page.goto(url, wait_until="networkidle")
            page.wait_for_function("window.__VALENTINE_READY__ === true", timeout=60000)
            settle(page)
            report["initial"] = page.evaluate("VALENTINE.getState()")

            if args.shot in ("all", "overview"):
                shot(page, RENDERS / "01-overview.png", "overview")
            if args.shot in ("all", "keyboard"):
                shot(page, RENDERS / "02-keyboard.png", "keyboard")
            if args.shot in ("all", "exploded"):
                shot(page, RENDERS / "03-exploded.png", "overview", exploded=True)
            if args.shot in ("all", "typing"):
                shot(page, RENDERS / "04-typing.png", "carriage")
                page.evaluate("VALENTINE.type('H')")
                page.wait_for_timeout(350)
                shot(page, RENDERS / "04-typing.png", "carriage")
            if args.shot in ("all", "night"):
                shot(page, RENDERS / "06-night.png", "overview", night=True)
            if args.shot in ("all", "mobile"):
                page.set_viewport_size({"width": 390, "height": 844})
                page.evaluate("VALENTINE.setView('overview'); VALENTINE.setExploded(false); VALENTINE.setNight(false)")
                settle(page, 1800)
                page.screenshot(path=str(RENDERS / "05-mobile.png"), full_page=True)
                report["mobile"] = page.evaluate("VALENTINE.getState()")
            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    report["console"] = messages
    report["failedRequests"] = failures
    (RENDERS / "verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.shot in ("all", "overview"):
        make_covers()
    errors = [item for item in messages if item["type"] in ("error", "pageerror")]
    if errors or failures:
        raise SystemExit(f"Browser verification failed: {errors or failures}")


if __name__ == "__main__":
    main()
