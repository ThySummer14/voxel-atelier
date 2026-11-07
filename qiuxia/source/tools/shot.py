#!/usr/bin/env python3
"""Locked-camera screenshot tool for 《秋峡》. Reuse shoot-all.py for batches."""
import argparse, json
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--url', default='http://127.0.0.1:5173')
ap.add_argument('--view', default='bridge')
ap.add_argument('--time', type=float, default=17.3)
ap.add_argument('--train', type=float, default=None)
ap.add_argument('--out', default='output/shot.png')
ap.add_argument('--width', type=int, default=1600)
ap.add_argument('--height', type=int, default=1000)
ap.add_argument('--hide-ui', action='store_true')
ap.add_argument('--live', action='store_true', help='do not freeze (capture motion)')
ap.add_argument('--wait', type=int, default=1500)
args = ap.parse_args()

root = Path(__file__).resolve().parents[1]
out = Path(args.out)
if not out.is_absolute():
    out = root / out
out.parent.mkdir(parents=True, exist_ok=True)
errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=[
        '--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist',
    ])
    page = browser.new_page(viewport={'width': args.width, 'height': args.height}, device_scale_factor=1)
    page.on('console', lambda m: errors.append(f'console:{m.type}:{m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'pageerror:{e}'))
    page.goto(args.url, wait_until='networkidle', timeout=60000)
    page.wait_for_function('window.QX && window.QX.ready === true', timeout=120000)
    page.evaluate('([v]) => QX.setView(v, true)', [args.view])
    page.evaluate('([t]) => QX.setTime(t)', [args.time])
    if args.train is not None:
        page.evaluate('([p]) => QX.setTrain(p)', [args.train])
    if args.hide_ui:
        page.evaluate('QX.hideUI(true)')
    if not args.live:
        page.evaluate('QX.freeze(true)')
    page.wait_for_timeout(args.wait)
    page.screenshot(path=str(out))
    stats = page.evaluate('QX.stats()')
    browser.close()

print(json.dumps({'image': str(out), 'stats': stats, 'errors': errors}, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(1)