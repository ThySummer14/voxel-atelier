from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'renders'
OUT.mkdir(exist_ok=True)
results = []

def check(name, condition, detail=''):
    assert condition, f'{name}: {detail}'
    results.append({'name': name, 'detail': detail})
    print('✓', name, detail)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--use-angle=metal'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1, has_touch=True)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    response = page.goto('http://127.0.0.1:8964', wait_until='networkidle')
    check('页面响应', response.status == 200)
    page.wait_for_function('window.MSM && window.MSM.probe().ready')
    page.wait_for_timeout(1800)
    page.evaluate('MSM.reset()')
    page.wait_for_timeout(700)
    probe = page.evaluate('MSM.probe()')
    check('真实 WebGL 场景已渲染', probe['triangles'] > 100000, str(probe))
    check('持续渲染帧率', probe['fps'] >= 30, f"{probe['fps']} fps")
    check('体素建筑体量', probe['voxels'] > 25000, f"{probe['voxels']:,} voxels")
    check('桌面画布尺寸', probe['canvas'] == [1440, 1000], str(probe['canvas']))
    page.screenshot(path=str(OUT / '01-overview.png'))

    page.evaluate("MSM.setHour(6.1,true)")
    page.wait_for_timeout(120)
    high = page.evaluate('MSM.probe()')
    page.evaluate("MSM.setHour(6.1+MSM.M2_PERIOD/2,true)")
    page.wait_for_timeout(120)
    low = page.evaluate('MSM.probe()')
    check('高潮真实抬升水面', high['waterY'] > 3.7 and high['tide']['causewayDry'] is False, str(high['waterY']))
    check('低潮露出滩涂与栈桥', low['waterY'] < -3 and low['tide']['causewayDry'] is True, str(low['waterY']))
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / '02-low-tide.png'))

    page.evaluate('MSM.setHour(12,true)')
    page.wait_for_timeout(120)
    day_windows = page.evaluate('MSM.probe().windows')
    page.evaluate('MSM.setHour(22.2,true)')
    page.wait_for_timeout(120)
    night_windows = page.evaluate('MSM.probe().windows')
    check('昼夜改变窗户发光', day_windows != night_windows, f'{day_windows} → {night_windows}')
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / '03-night.png'))

    page.evaluate("MSM.setHour(17.4,true);MSM.setView('abbey',true)")
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / '04-abbey.png'))
    check('修道院近景机位', page.evaluate('MSM.state.view') == 'abbey')
    page.evaluate("MSM.setView('aerial',true)")
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / '05-aerial.png'))

    page.click('#noteButton')
    check('藏品笔记展开', page.get_attribute('#storyPanel', 'aria-hidden') == 'false')
    page.click('#closeStory')
    check('藏品笔记关闭', page.get_attribute('#storyPanel', 'aria-hidden') == 'true')
    page.click('#tourButton')
    check('导览启动', page.evaluate('MSM.state.touring') is True)
    page.click('#tourButton')
    check('导览停止', page.evaluate('MSM.state.touring') is False)
    page.evaluate("MSM.setView('overview',true)")
    before = page.evaluate('MSM.camera.position.toArray()')
    page.mouse.move(700, 450); page.mouse.down(); page.mouse.move(810, 485, steps=8); page.mouse.up(); page.wait_for_timeout(700)
    after = page.evaluate('MSM.camera.position.toArray()')
    check('拖拽改变相机', before != after)
    page.keyboard.press('h'); check('快捷键隐藏界面', page.evaluate('!MSM.state.ui'))
    page.keyboard.press('h'); check('快捷键恢复界面', page.evaluate('MSM.state.ui'))
    page.click('#playButton'); check('播放按钮联动', page.evaluate('MSM.state.playing'))
    page.click('#playButton'); check('暂停按钮联动', not page.evaluate('MSM.state.playing'))
    page.click('#soundButton'); check('环境声可开启', page.evaluate('MSM.state.sound'))
    page.click('#soundButton'); check('环境声可关闭', not page.evaluate('MSM.state.sound'))
    with page.expect_download() as download_info:
        page.click('#captureButton')
    download = download_info.value
    check('画面可导出 PNG', download.suggested_filename.endswith('.png'), download.suggested_filename)

    page.evaluate('MSM.reset()')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.wait_for_timeout(900)
    mobile = page.evaluate('MSM.probe()')
    check('移动端画布自适应', mobile['canvas'] == [390, 844], str(mobile['canvas']))
    check('移动端无横向溢出', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    dock = page.locator('.control-dock').bounding_box()
    check('移动端控制栏完整可见', dock['x'] >= 0 and dock['x'] + dock['width'] <= 390 and dock['y'] + dock['height'] <= 844)
    page.locator('[data-tide="low"]').tap()
    page.wait_for_timeout(150)
    check('触屏低潮按钮生效', page.evaluate('MSM.probe().tide.causewayDry'))
    page.locator('[data-tide="high"]').tap()
    page.evaluate('MSM.reset()')
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT / '06-mobile.png'))
    check('浏览器无脚本或着色器错误', len(errors) == 0, '; '.join(errors))
    (OUT / 'acceptance.json').write_text(json.dumps({'passed': len(results), 'results': results, 'finalProbe': mobile}, ensure_ascii=False, indent=2))
    browser.close()

print(f'\n{len(results)} 项浏览器验收通过；6 张实测图位于 renders/。')
