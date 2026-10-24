#!/usr/bin/env python3
"""出图：12 张主图 → renders/ + manifest.json。先 node tools/serve.mjs。"""
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright

SHOTS = [
    ('01_cover',   43000,   'cover',  {}),
    ('02_youzheng', 64802,  'cover',  {'fire': True}),
    ('03_night',   76000,   'night',  {}),
    ('04_wheel',   43200,   'wheel',  {}),
    ('05_tianhen', 43170,   'wheel',  {}),
    ('06_globe',   43000,   'globe',  {}),
    ('07_arm',     43000,   'arm',    {}),
    ('08_tube',    76000,   'tube',   {}),
    ('09_water',   43000,   'east',   {}),
    ('10_dawn',    21602,   'cover',  {'fire': True}),
    ('11_sealed',  43000,   'wide',   {'cuts': False}),
    ('12_golden',  63000,   'cover',  {}),
]

async def main():
    out = pathlib.Path(__file__).resolve().parent.parent / 'renders'
    out.mkdir(exist_ok=True)
    manifest = []
    errs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 860})
        page.on('pageerror', lambda e: errs.append(str(e)))
        await page.goto('http://localhost:8951/', wait_until='networkidle')
        await page.wait_for_timeout(1800)
        await page.click('#intro', position={'x': 10, 'y': 10})
        await page.wait_for_timeout(700)
        for name, t, cam, extra in SHOTS:
            await page.evaluate('window.BK.cuts(true)')
            await page.evaluate(f'window.BK.time({t}, 1)')
            if extra.get('cuts') is False:
                await page.evaluate('window.BK.cuts(false)')
            if extra.get('fire'):
                await page.evaluate('window.BK.next()')
            await page.evaluate(f'window.BK.cam("{cam}")')
            await page.wait_for_timeout(1300)
            file = out / f'{name}.png'
            await page.screenshot(path=str(file))
            state = await page.evaluate('window.BK.state()')
            manifest.append({'shot': name, 'time': t, 'cam': cam, 'file': str(file.relative_to(out.parent)), **{k: state[k] for k in ('simT', 'speed', 'fill', 'step', 'doors', 'sliders')}})
            print(f'  {name} t={t} cam={cam} {file.stat().st_size // 1024}KB')
        await browser.close()
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
    print(f'rendered {len(manifest)} shots -> renders/, pageerrors={len(errs)}')
    return 1 if errs else 0

sys.exit(asyncio.run(main()))
