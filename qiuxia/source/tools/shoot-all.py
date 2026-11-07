#!/usr/bin/env python3
"""Batch locked-camera screenshots reusing one browser page (fast iteration)."""
import argparse, json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--url', default='http://127.0.0.1:5173')
ap.add_argument('--width', type=int, default=1600)
ap.add_argument('--height', type=int, default=1000)
ap.add_argument('--only', default='')
ap.add_argument('--prefix', default='')
args = ap.parse_args()

root = Path(__file__).resolve().parents[1]
outdir = root / 'output'
outdir.mkdir(parents=True, exist_ok=True)

SPECS = [
    ('bridge',   'bridge',   17.3, 352),
    ('overview', 'overview', 17.3, 352),
    ('gorge',    'gorge',    17.3, 352),
    ('portal',   'portal',   17.3, 480),
    ('platform', 'platform', 17.3, 440),
    ('gear',     'gear',     17.3, 320),
    ('follow',   'follow',   12.5, 310),
    ('night',    'bridge',   21.5, 352),
    ('noon',     'overview', 12.5, 352),
]
if args.only:
    keep = set(args.only.split(','))
    SPECS = [s for s in SPECS if s[0] in keep]

errors = []
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=[
        '--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist',
    ])
    page = browser.new_page(viewport={'width': args.width, 'height': args.height}, device_scale_factor=1)
    page.on('console', lambda m: errors.append(f'console:{m.type}:{m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'pageerror:{e}'))
    page.goto(args.url, wait_until='networkidle', timeout=60000)
    page.wait_for_function('window.QX && window.QX.ready === true', timeout=120000)
    page.wait_for_timeout(2600)
    page.evaluate('QX.hideUI(true)')
    page.evaluate('QX.freeze(true)')
    for name, view, t, train in SPECS:
        page.evaluate('([v]) => QX.setView(v, true)', [view])
        page.evaluate('([t]) => QX.setTime(t)', [t])
        page.evaluate('([p]) => QX.setTrain(p)', [train])
        page.wait_for_timeout(500)
        out = outdir / f'{args.prefix}{name}.png'
        page.screenshot(path=str(out))
        results.append(str(out))
    stats = page.evaluate('QX.stats()')
    browser.close()

print(json.dumps({'images': results, 'stats': stats, 'errors': errors}, ensure_ascii=False, indent=2))
if errors:
    sys.exit(1)