#!/usr/bin/env python3
"""Capture the gear at two crank phases to prove the linkage moves without disconnecting."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'output'
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=['--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1600, 'height': 1000})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:5173', wait_until='networkidle', timeout=60000)
    pg.wait_for_function('window.QX && window.QX.ready === true', timeout=120000)
    pg.wait_for_timeout(1200)
    pg.evaluate('QX.hideUI(true); QX.freeze(true); QX.setView("gear", true)')
    for tag, tp in [('a', 320), ('b', 323), ('c', 326)]:
        pg.evaluate('([p]) => QX.setTrain(p)', [tp])
        pg.wait_for_timeout(350)
        pg.screenshot(path=str(out / f'gear-motion-{tag}.png'))
    print('errors:', errs)
    b.close()