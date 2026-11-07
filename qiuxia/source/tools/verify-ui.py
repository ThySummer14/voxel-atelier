#!/usr/bin/env python3
"""Exercise every interaction, the audio graph, and portrait layout; assert no console errors."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'output'
checks = []
errors = []

def ok(name, cond, extra=''):
    checks.append({'check': name, 'pass': bool(cond), 'extra': extra})

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=['--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 1600, 'height': 1000})
    pg.on('console', lambda m: errors.append(f'console:{m.text}') if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errors.append(f'pageerror:{e}'))
    pg.goto('http://127.0.0.1:5173', wait_until='networkidle', timeout=60000)
    pg.wait_for_function('window.QX && window.QX.ready === true', timeout=120000)
    pg.wait_for_timeout(800)

    # view buttons
    for v in ['overview', 'bridge', 'platform', 'gorge', 'gear', 'portal', 'follow']:
        pg.click(f'#views button[data-view="{v}"]')
        pg.wait_for_timeout(120)
        got = pg.evaluate('QX.stats().view')
        ok(f'view button {v}', got == v, got)

    # run / pause
    pg.click('#btn-run'); pg.wait_for_timeout(100)
    paused = pg.evaluate('document.getElementById("ico-play").style.display !== "none"')
    ok('pause toggles icon', paused)
    pg.click('#btn-run'); pg.wait_for_timeout(100)
    running = pg.evaluate('document.getElementById("ico-pause").style.display !== "none"')
    ok('run toggles icon', running)

    # time slider
    pg.evaluate('document.getElementById("time").value = 6.0; document.getElementById("time").dispatchEvent(new Event("input"))')
    pg.wait_for_timeout(100)
    h = pg.evaluate('QX.stats().hour')
    ok('time slider sets hour', abs(h - 6.0) < 0.01, h)

    # audio enable + whistle
    pg.click('#btn-sound'); pg.wait_for_timeout(300)
    astate = pg.evaluate('({ enabled: QX.audio.enabled })')
    ok('audio enabled', astate['enabled'], astate)
    pg.evaluate('QX.whistle()'); pg.wait_for_timeout(300)
    pg.evaluate('QX.setTime(17.3)')
    ok('whistle no throw', True)

    # hide UI
    pg.click('#btn-hide'); pg.wait_for_timeout(100)
    hidden = pg.evaluate('document.body.classList.contains("ui-hidden")')
    ok('hide UI', hidden)
    pg.evaluate('QX.hideUI(false)')

    # keyboard
    pg.keyboard.press('2'); pg.wait_for_timeout(120)
    ok('key 2 -> bridge', pg.evaluate('QX.stats().view') == 'bridge')
    pg.keyboard.press('Space'); pg.wait_for_timeout(100)
    ok('space pauses', pg.evaluate('document.getElementById("ico-play").style.display !== "none"'))
    pg.keyboard.press('Space')

    fps = pg.evaluate('QX.stats().fps')
    ok('fps >= 50 @1600x1000', fps >= 50, fps)
    pg.screenshot(path=str(out / 'verify-desktop.png'))
    pg.close()

    # portrait
    mp = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    mp.on('console', lambda m: errors.append(f'mobile-console:{m.text}') if m.type == 'error' else None)
    mp.on('pageerror', lambda e: errors.append(f'mobile-pageerror:{e}'))
    mp.goto('http://127.0.0.1:5173', wait_until='networkidle', timeout=60000)
    mp.wait_for_function('window.QX && window.QX.ready === true', timeout=120000)
    mp.wait_for_timeout(1500)
    hud = mp.evaluate('(() => { const h = document.getElementById("hud"); const r = h.getBoundingClientRect(); return { w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, overflowX: document.documentElement.scrollWidth > innerWidth }; })()')
    ok('portrait hud fits width', hud['w'] <= hud['vw'] + 1, hud)
    ok('portrait no horizontal overflow', not hud['overflowX'], hud)
    mp.evaluate('QX.setView("bridge", true)')
    mp.wait_for_timeout(500)
    mp.screenshot(path=str(out / 'verify-portrait.png'))
    mfps = mp.evaluate('QX.stats().fps')
    ok('portrait fps >= 30', mfps >= 30, mfps)
    mp.close()
    b.close()

print(json.dumps({'checks': checks, 'errors': errors}, ensure_ascii=False, indent=2))
failed = [c for c in checks if not c['pass']]
sys.exit(1 if failed or errors else 0)