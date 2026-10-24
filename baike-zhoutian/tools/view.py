#!/usr/bin/env python3
"""视觉检查：点掉序幕、设时刻与机位、截图并做 ASCII/直方图分析。"""
import asyncio, sys, collections
from playwright.async_api import async_playwright

def cls(r, g, b):
    if r > 235 and g > 225 and b > 190: return '*'
    if b > 140 and b > r + 25: return '~'
    if g > 85 and g > r + 20 and g > b + 10: return 'G'
    if r > 120 and r > g + 40 and r > b + 40: return 'R'
    if r > 170 and g > 155 and 100 < b < 185: return 'W'
    if r > 85 and g > 55 and b < 105 and r > b + 30: return 'B'
    if r > 140 and g > 100 and b < 95: return 'Y'
    if max(r, g, b) < 55: return 'K'
    return '.'

async def main():
    t = sys.argv[1] if len(sys.argv) > 1 else '43000'
    camname = sys.argv[2] if len(sys.argv) > 2 else 'cover'
    out = sys.argv[3] if len(sys.argv) > 3 else '/tmp/bk_view.png'
    errs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1180, 'height': 800})
        page.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await page.goto('http://localhost:8951/', wait_until='networkidle')
        await page.evaluate('window.BK.time(%s, 1)' % t)
        await page.evaluate('window.BK.cam("%s")' % camname)
        await page.wait_for_timeout(1200)
        await page.click('#intro', position={'x': 10, 'y': 10})
        await page.wait_for_timeout(900)
        await page.screenshot(path=out)
        stats = await page.evaluate('window.BK.stats()')
        state = await page.evaluate('window.BK.state()')
        await browser.close()
    from PIL import Image
    im = Image.open(out).convert('RGB')
    w, h = im.size
    rows = []
    for ry in range(26):
        line = ''
        for rx in range(76):
            cnt = collections.Counter()
            for dy in range(0, h // 26, 7):
                for dx in range(0, w // 76, 7):
                    x = rx * w // 76 + dx; y = ry * h // 26 + dy
                    if x < w and y < h: cnt[cls(*im.getpixel((x, y)))] += 1
            line += cnt.most_common(1)[0][0] if cnt else ' '
        rows.append(line)
    print('\n'.join(rows))
    cnt = collections.Counter()
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            cnt[cls(*im.getpixel((x, y)))] += 1
    print('hist:', dict(cnt))
    print('stats:', stats, 'state:', {k: state[k] for k in ['simT', 'speed', 'fill', 'step']})
    print('pageerrors:', errs[:3])
    return 0

asyncio.run(main())
