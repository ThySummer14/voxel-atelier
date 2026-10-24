#!/usr/bin/env python3
"""浏览器验收：连跑两轮（防状态泄漏）。先 node tools/serve.mjs (:8951)。"""
import asyncio, sys
from playwright.async_api import async_playwright

PASS, FAIL = 0, 0
def ok(cond, name, detail=''):
    global PASS, FAIL
    if cond: PASS += 1; print(f'  ok  {name}')
    else: FAIL += 1; print(f'FAIL  {name} {detail}')

async def run_round(page, rnd):
    print(f'\n== 第 {rnd} 轮')
    st = await page.evaluate('window.BK.state()')
    ok(st is not None and 'simT' in st, 'BK.state 可用')
    stats = await page.evaluate('window.BK.stats()')
    ok(stats['parts'] == 51, '部件 51', stats['parts'])
    ok(stats['tris'] < 120000, f'三角 {stats["tris"]} < 120000')
    ok(stats['fps'] > 25, f'帧率 {stats["fps"]:.0f} > 25')

    await page.evaluate('window.BK.time(43200, 1)')
    await page.wait_for_timeout(400)
    ke = await page.evaluate('document.getElementById("keText").textContent')
    ok(ke == '午正零刻', 'HUD 午正零刻', ke)
    await page.evaluate('window.BK.time(75600, 1)')
    await page.wait_for_timeout(600)
    ke2 = await page.evaluate('document.getElementById("keText").textContent')
    ok(ke2.startswith('亥'), 'HUD 亥时', ke2)
    bg = await page.evaluate('getComputedStyle(document.getElementById("bg")).backgroundImage')
    ok('rgb(5, 7, 15)' in bg or 'rgb(42, 51, 80)' in bg, '夜空背景生效', bg[:60])

    await page.evaluate('window.BK.time(43199.5, 1)')
    await page.evaluate('window.BK.next()')
    await page.wait_for_timeout(900)
    st = await page.evaluate('window.BK.state()')
    ok(max(st['doors']) > 0.4, '报时开门', st['doors'])
    ok(max(st['sliders']) > 0.2, '木人滑出', st['sliders'])
    banner = await page.evaluate('document.getElementById("banner").textContent')
    ok(len(banner) > 2, '报时横幅', banner)

    p0 = await page.evaluate('window.BK.pose(0)["wheel"].rot.angle')
    p1 = await page.evaluate('window.BK.pose(43200)["wheel"].rot.angle')
    ok(abs(p1 - p0 - 2 * 3.14159265) < 1e-3, '枢轮半日一转角', f'{p0:.2f}->{p1:.2f}')
    b0 = await page.evaluate('window.BK.probe()["bucket0"]')
    b1 = await page.evaluate('window.BK.time(3600, 1) || window.BK.probe()["bucket0"]')
    ok(b0 != b1, '斗链移动', f'{b0} -> {b1}')

    tris_on = stats['tris']
    await page.evaluate('window.BK.cuts(false)')
    await page.wait_for_timeout(400)
    tris_off = await page.evaluate('window.BK.stats()["tris"]')
    ok(tris_off > tris_on, '剖切切换增面', f'{tris_on} -> {tris_off}')
    await page.evaluate('window.BK.cuts(true)')
    await page.wait_for_timeout(400)

    await page.evaluate('window.BK.cam("wheel")')
    await page.wait_for_timeout(500)
    w, h = page.viewport_size['width'], page.viewport_size['height']
    hit = await page.evaluate(f'window.BK.pick({w // 2}, {h // 2})')
    ok(hit and hit['key'] in ('wheel', 'tower', 'water', 'chainStatic', 'chainWheel1', 'lever', 'column'), '中心拾取命中机构', hit)
    await page.evaluate('window.BK.sound(true)')
    await page.wait_for_timeout(300)
    snd = await page.evaluate('window.BK.state()["soundOn"]')
    ok(snd, '音效开关')

async def main():
    errs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1180, 'height': 800})
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errs.append(str(e)))
        await page.goto('http://localhost:8951/', wait_until='networkidle')
        await page.wait_for_timeout(2000)
        await page.click('#intro', position={'x': 10, 'y': 10})
        await page.wait_for_timeout(600)
        ok(errs == [], '无控制台错误', errs[:3])
        await run_round(page, 1)
        await run_round(page, 2)
        await browser.close()
    print(f'\n===== accept-web: {PASS} ok, {FAIL} FAIL =====')
    return 1 if FAIL else 0

sys.exit(asyncio.run(main()))
