#!/usr/bin/env python3
"""交互快测：触发候震，验证状态机与截图。"""
import asyncio, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:8943/', wait_until='networkidle')
        await page.wait_for_timeout(2500)

        # 触发 k=2（北）震级 6
        await page.evaluate('HF.quake(2, 6)')
        await page.wait_for_timeout(500)
        st = await page.evaluate('HF.state()')
        print('mid-drop balls:', st['balls'])
        await page.screenshot(path='/tmp/hf_drop.png')

        await page.wait_for_timeout(900)
        st = await page.evaluate('HF.state()')
        print('after catch:', st['balls'])
        await page.screenshot(path='/tmp/hf_catch.png')

        # 等归位
        await page.wait_for_timeout(3000)
        st = await page.evaluate('HF.state()')
        print('returned:', st['balls'])

        # 齐奏
        await page.evaluate('HF.melody()')
        await page.wait_for_timeout(2000)
        st = await page.evaluate('HF.state()')
        print('melody mid:', st['balls'])
        await page.screenshot(path='/tmp/hf_melody.png')
        await page.wait_for_timeout(6000)
        st = await page.evaluate('HF.state()')
        print('melody done:', st['balls'])

        # 解构
        await page.evaluate('HF.explode(true)')
        await page.wait_for_timeout(1500)
        await page.screenshot(path='/tmp/hf_explode.png')
        await page.evaluate('HF.explode(false)')

        # 相机推到剖面
        await page.evaluate('HF.cam(-10, 14, 80, 10)')
        await page.wait_for_timeout(1200)
        await page.screenshot(path='/tmp/hf_window.png')

        if errors:
            print('CONSOLE ERRORS:')
            for e in errors[:8]: print(' -', e[:240])
            sys.exit(1)
        print('interaction OK')
        await browser.close()

asyncio.run(main())
