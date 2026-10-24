#!/usr/bin/env python3
"""accept-web.py — 浏览器验收：控制台零错 / 渲染非空 / 交互状态机 / 拾取 / 齐奏 / 解构。
需先 node tools/serve.mjs（默认 :8943）。"""
import asyncio, sys, time
from playwright.async_api import async_playwright

URL = 'http://localhost:8943/'
passed, failed = 0, 0

def ok(cond, name, detail=''):
    global passed, failed
    if cond:
        passed += 1; print(f'  ✓ {name}')
    else:
        failed += 1; print(f'  ✗ {name} {detail}')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--use-angle=metal'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(URL, wait_until='networkidle')
        await page.wait_for_function('window.HF !== undefined', timeout=15000)
        await page.wait_for_timeout(2500)

        print('─ 渲染 ─')
        ok(len(errors) == 0, '控制台零错误', errors[:3])
        st = await page.evaluate('HF.state()')
        ok(30000 < st['triangles'] < 250000, '三角数在预算内', st['triangles'])
        ok(st['fps'] >= 25, '帧率达标', st['fps'])
        px = await page.evaluate('''() => {
          const c = document.getElementById('scene');
          const t = document.createElement('canvas'); t.width = 160; t.height = 100;
          const x = t.getContext('2d'); x.drawImage(c, 0, 0, 160, 100);
          const d = x.getImageData(0, 0, 160, 100).data;
          let sum = 0, sum2 = 0, bright = 0, n = 0;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.3*d[i] + 0.6*d[i+1] + 0.1*d[i+2];
            sum += lum; sum2 += lum*lum; n++;
            if (lum > 60) bright++;
          }
          const mean = sum / n;
          return { mean, sd: Math.sqrt(Math.max(0, sum2/n - mean*mean)), brightRatio: bright/n };
        }''')
        ok(px['brightRatio'] > 0.12, '画面非空（主体可见）', px)
        ok(px['sd'] > 10, '画面对比度正常', px)

        print('─ 候震状态机 ─')
        await page.evaluate('HF.quake(0, 5)')
        await page.wait_for_timeout(400)
        st = await page.evaluate('HF.state()')
        ok(st['balls'][0] == 'dropping', '吐丸中', st['balls'])
        await page.wait_for_timeout(800)
        st = await page.evaluate('HF.state()')
        ok(st['balls'][0] == 'caught', '蟾已衔丸', st['balls'])
        await page.wait_for_timeout(3200)
        st = await page.evaluate('HF.state()')
        ok(st['balls'][0] == 'held', '丸已归位', st['balls'])
        ok(st['drops'] == 1, '落丸计数', st['drops'])

        print('─ 拾取与键盘 ─')
        # 点击龙首（k=1 东北，默认相机近侧无遮挡）
        pos = await page.evaluate('HF.screenPos(1)')
        await page.mouse.click(pos['x'], pos['y'])
        await page.wait_for_timeout(300)
        st = await page.evaluate('HF.state()')
        ok(st['balls'][1] == 'dropping', '点击龙首触发候震', st['balls'])
        await page.wait_for_timeout(3500)
        # 键盘 3 → k=2
        await page.keyboard.press('3')
        await page.wait_for_timeout(300)
        st = await page.evaluate('HF.state()')
        ok(st['balls'][2] == 'dropping', '数字键候震', st['balls'])
        await page.wait_for_timeout(3500)

        print('─ 八龙齐奏 ─')
        d0 = (await page.evaluate('HF.state()'))['drops']
        await page.evaluate('HF.melody()')
        await page.wait_for_timeout(9000)
        st = await page.evaluate('HF.state()')
        ok(st['drops'] - d0 == 8, '八龙皆吐丸', st['drops'] - d0)
        ok(all(s == 'held' for s in st['balls']), '齐奏后全部归位', st['balls'])

        print('─ 解构 / 自动 / 静音 ─')
        await page.evaluate('HF.explode(true)')
        await page.wait_for_timeout(1200)
        await page.evaluate('HF.explode(false)')
        await page.wait_for_timeout(1200)
        await page.evaluate('HF.auto(true)')
        await page.wait_for_timeout(100)
        st = await page.evaluate('HF.state()')
        ok(st['auto'] == True, '自动候震开启')
        await page.evaluate('HF.auto(false)')
        await page.evaluate('HF.mute(true)')
        await page.evaluate('HF.mute(false)')
        ok(len(errors) == 0, '全程控制台零错误', errors[:3])

        await page.screenshot(path='/tmp/accept-final.png')
        print(f'\n{passed} 通过, {failed} 失败')
        await browser.close()
        sys.exit(1 if failed else 0)

asyncio.run(main())
