#!/usr/bin/env python3
"""快速冒烟：开页面、收控制台错误、截一张图。"""
import asyncio, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type in ('error',) else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:8943/', wait_until='networkidle')
        await page.wait_for_timeout(3500)
        state = await page.evaluate('window.HF ? HF.state() : null')
        print('HF.state:', state)
        await page.screenshot(path='/tmp/hf_smoke.png')
        if errors:
            print('CONSOLE ERRORS:')
            for e in errors[:10]:
                print(' -', e[:300])
            sys.exit(1)
        print('smoke OK, no console errors')
        await browser.close()

asyncio.run(main())
