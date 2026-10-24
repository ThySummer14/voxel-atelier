#!/usr/bin/env python3
"""冒烟：加载页面、收控制台错误、查 BK 状态。"""
import asyncio, subprocess, sys
from playwright.async_api import async_playwright

async def main():
    errs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 860})
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errs.append(str(e)))
        await page.goto('http://localhost:8951/', wait_until='networkidle')
        await page.wait_for_timeout(2500)
        ok = await page.evaluate('!!window.BK')
        st = await page.evaluate('window.BK && window.BK.stats()')
        state = await page.evaluate('window.BK && window.BK.state()')
        ke = await page.evaluate('document.getElementById("keText").textContent')
        print('BK:', ok)
        print('stats:', st)
        print('state:', {k: state[k] for k in ['simT', 'speed', 'fill', 'step', 'cutsOn']})
        print('keText:', ke)
        await page.screenshot(path='/tmp/bk_smoke.png')
        await browser.close()
    print('console errors:', len(errs))
    for e in errs[:8]: print('  ERR:', e[:300])
    return 0 if ok and not errs else 1

sys.exit(asyncio.run(main()))
