#!/usr/bin/env python3
"""shoot.py — 出图：renders/ 下一组美图。需先 node tools/serve.mjs。"""
import asyncio, os
from playwright.async_api import async_playwright

OUT = os.path.join(os.path.dirname(__file__), '..', 'renders')
os.makedirs(OUT, exist_ok=True)

SHOTS = [
    # (名, 相机yaw/pitch/dist/ty/tx/tz, 动作JS, 动作后等待ms)
    ('cover',    (-35, 18, 118, 12, 0, 0), None, 0),
    ('quake',    (-35, 18, 118, 12, 0, 0), 'HF.quake(1, 6)', 620),
    ('catch',    (-35, 18, 118, 12, 0, 0), 'HF.quake(7, 5)', 1500),
    ('melody',   (-40, 20, 112, 12, 0, 0), 'HF.melody()', 2600),
    ('explode',  (-38, 24, 150, 14, 0, 0), 'HF.explode(true)', 1600),
    ('window',   (-10, 12, 68, 9, 0, 0), None, 0),
    ('dragon',   (-45, 26, 52, 25, 13, -13), None, 0),
    ('top',      (-30, 55, 150, 4, 0, 0), None, 0),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:8943/', wait_until='networkidle')
        await page.wait_for_function('window.HF !== undefined', timeout=15000)
        await page.wait_for_timeout(2200)
        for name, (yaw, pitch, dist, ty, tx, tz), action, wait_ms in SHOTS:
            await page.evaluate(f'HF.still(true); HF.cam({yaw}, {pitch}, {dist}, {ty}, {tx}, {tz})')
            await page.wait_for_timeout(1300)
            if action:
                await page.evaluate(action)
                await page.wait_for_timeout(wait_ms)
            await page.screenshot(path=os.path.join(OUT, f'{name}.png'))
            print(f'  {name}.png')
            if action:
                # 还原：等归位再拍下一张
                await page.wait_for_timeout(3600)
                await page.evaluate('HF.explode(false)')
                await page.wait_for_timeout(600)
        if errors:
            print('PAGE ERRORS:', errors[:5])
        await browser.close()

asyncio.run(main())
