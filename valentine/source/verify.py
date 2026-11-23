#!/usr/bin/env python3
from __future__ import annotations

import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CHROME = "/Users/thysummer/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def start_server():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_port}/valentine/"


def check(condition, message, results):
    if not condition:
        raise AssertionError(message)
    results.append(message)
    print(f"PASS · {message}")


def state(page):
    return page.evaluate("VALENTINE.getState()")


def main():
    results = []
    vox = (ROOT / "valentine" / "export" / "valentine.vox").read_bytes()
    check(vox[:4] == b"VOX " and int.from_bytes(vox[4:8], "little") == 150, "导出为 MagicaVoxel 150 格式", results)
    check(vox[8:12] == b"MAIN" and vox[20:24] == b"PACK", ".vox 包含多模型 PACK 声明", results)
    check(int.from_bytes(vox[32:36], "little") == 57 and vox.count(b"SIZE") == 57, ".vox 保留全部 57 个组件模型", results)
    server, url = start_server()
    console = []
    failures = []
    report = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, executable_path=CHROME, args=["--use-gl=angle", "--use-angle=metal", "--enable-webgl"])
            context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
            page = context.new_page()
            page.on("console", lambda msg: console.append({"type": msg.type, "text": msg.text}))
            page.on("pageerror", lambda error: console.append({"type": "pageerror", "text": str(error)}))
            page.on("requestfailed", lambda request: failures.append({"url": request.url, "failure": request.failure}))
            page.goto(url, wait_until="networkidle")
            page.wait_for_function("window.__VALENTINE_READY__ === true", timeout=60000)
            page.evaluate("VALENTINE.setAutoRotate(false); VALENTINE.setNight(false)")
            page.wait_for_timeout(1200)
            initial = state(page)
            check(initial["triangles"] > 200000 and initial["drawCalls"] > 50, "真实 WebGL 网格已渲染", results)

            page.locator("#sound-button").click()
            check(state(page)["sound"] is False, "声音开关可关闭", results)

            lines_before_space = state(page)["lines"]
            page.locator("#explode-button").focus()
            page.keyboard.press("Space")
            page.wait_for_timeout(250)
            check(state(page)["exploded"] is True, "按钮聚焦时空格执行原生点击", results)
            check(state(page)["lines"] == lines_before_space, "按钮空格不会误输入到纸面", results)
            page.locator("#explode-button").click()
            page.wait_for_function("VALENTINE.getState().explosion < 0.04", timeout=5000)

            page.locator("#viewport").focus()
            yaw_before_keys = state(page)["camera"]["yaw"]
            zoom_before_keys = state(page)["camera"]["zoom"]
            page.keyboard.press("ArrowLeft")
            page.keyboard.press("=")
            page.wait_for_timeout(650)
            check(state(page)["camera"]["yaw"] > yaw_before_keys, "视口方向键可旋转", results)
            check(state(page)["camera"]["zoom"] > zoom_before_keys, "视口加减键可缩放", results)
            page.evaluate("VALENTINE.setView('overview')")
            page.wait_for_timeout(900)

            page.evaluate("VALENTINE.setCamera({yaw: Math.PI, pitch: 0.1, zoom: 0.86, target: [0, 4.3, 0]})")
            page.wait_for_timeout(1100)
            blocked_point = page.evaluate("VALENTINE.projectKey('Q')")
            lines_before_blocked = state(page)["lines"]
            page.mouse.click(blocked_point["x"], blocked_point["y"])
            page.wait_for_timeout(250)
            check(state(page)["lines"] == lines_before_blocked, "被机壳遮挡的体素键不会穿透点击", results)
            page.evaluate("VALENTINE.setView('overview')")
            page.wait_for_timeout(1000)

            page.locator('[data-view="keyboard"]').click()
            page.wait_for_timeout(1300)
            check(state(page)["view"] == "keyboard", "键盘观察模式切换成功", results)
            check(page.locator('[data-view="keyboard"]').get_attribute("aria-pressed") == "true", "键盘模式按钮状态同步", results)

            point = page.evaluate("VALENTINE.projectKey('Q')")
            check(point is not None, "可计算体素键的屏幕坐标", results)
            page.mouse.click(point["x"], point["y"])
            page.wait_for_timeout(250)
            check(state(page)["lines"][-1].endswith("Q"), "真实鼠标点击体素键完成输入", results)

            page.keyboard.press("a")
            page.wait_for_timeout(200)
            check(state(page)["lines"][-1].endswith("QA"), "硬件键盘输入与纸面文字同步", results)
            before_return = state(page)
            page.keyboard.press("Enter")
            page.wait_for_timeout(650)
            after_return = state(page)
            check(after_return["lines"][-1] == "", "回车创建新行", results)
            check(after_return["paperFeed"] > before_return["paperFeed"], "回车驱动纸页进给", results)
            check(abs(after_return["roller"]) > abs(before_return["roller"]), "回车驱动滚筒旋转", results)
            check(after_return["carriageX"] > before_return["carriageX"], "回车驱动字车归位", results)

            page.locator("#type-button").click()
            page.wait_for_function("!document.getElementById('type-button').disabled", timeout=10000)
            typed = state(page)
            check(any("CIAO, MONDO" in line for line in typed["lines"]), "自动打字完整执行", results)

            page.locator("#explode-button").click()
            page.wait_for_function("VALENTINE.getState().explosion > 0.96", timeout=5000)
            check(state(page)["exploded"] is True, "拆解状态与动画完成", results)
            check(page.locator("#explode-button").inner_text().strip() == "合上机身", "拆解按钮文案切换", results)
            page.locator("#light-button").click()
            page.wait_for_timeout(500)
            check(state(page)["night"] is True and page.locator("body").evaluate("el => el.classList.contains('night')"), "夜班灯光与页面主题同步", results)

            canvas = page.locator("#viewport canvas").bounding_box()
            yaw_before = state(page)["camera"]["yaw"]
            page.mouse.move(canvas["x"] + canvas["width"] * 0.55, canvas["y"] + canvas["height"] * 0.55)
            page.mouse.down()
            page.mouse.move(canvas["x"] + canvas["width"] * 0.55 + 95, canvas["y"] + canvas["height"] * 0.55 + 24, steps=8)
            page.mouse.up()
            page.wait_for_timeout(650)
            dragged = state(page)
            check(abs(dragged["camera"]["yaw"] - yaw_before) > 0.2, "拖拽真实改变观察角度", results)
            check(dragged["autoRotate"] is False, "拖拽后暂停自动环绕", results)
            zoom_before = dragged["camera"]["zoom"]
            page.mouse.wheel(0, -240)
            page.wait_for_timeout(650)
            check(state(page)["camera"]["zoom"] > zoom_before, "滚轮真实改变缩放", results)

            page.locator("#reset-button").click()
            page.wait_for_function("VALENTINE.getState().explosion < 0.04", timeout=5000)
            reset = state(page)
            check(reset["view"] == "overview" and reset["exploded"] is False and reset["night"] is False, "复位恢复整体白昼视图", results)
            check(reset["lines"] == ["A SMALL RED REVOLUTION.", "OLIVETTI · IVREA · 1969", ""], "复位恢复初始纸面", results)

            page.set_viewport_size({"width": 390, "height": 844})
            page.wait_for_timeout(900)
            overflow = page.evaluate("({ scroll: document.documentElement.scrollWidth, width: window.innerWidth })")
            check(overflow["scroll"] <= overflow["width"] + 1, "390px 窄屏无横向溢出", results)
            check(page.locator("#explode-button").is_visible() and page.locator('[data-view="mechanism"]').is_visible(), "窄屏控制与部件导航可见", results)
            report["mobile"] = {"overflow": overflow, "state": state(page)}
            context.close()

            reduced_context = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
            reduced_page = reduced_context.new_page()
            reduced_page.goto(url, wait_until="networkidle")
            reduced_page.wait_for_function("window.__VALENTINE_READY__ === true", timeout=60000)
            check(state(reduced_page)["autoRotate"] is False, "尊重减少动态效果偏好", results)
            reduced_page.goto(url.replace("/valentine/", "/"), wait_until="networkidle")
            check(reduced_page.evaluate("window.WORKS.length") == 32, "展厅作品清单收录 32 件", results)
            check(reduced_page.locator("#grid .card").count() == 32, "展厅实际渲染 32 张卡片", results)
            check(reduced_page.locator("#nav-count").inner_text() == "32", "展厅导航计数同步", results)
            check(reduced_page.locator("#stat-models").inner_text() == "18", "展厅模型计数同步", results)
            reduced_page.locator('.chip[data-type="model"][data-value="HungerG（Qwen）"]').click()
            check(reduced_page.locator("#grid .card").count() == 1, "按 HungerG（Qwen）筛选仅显示新作", results)
            check(reduced_page.locator("#grid .card").get_attribute("href") == "./valentine/", "新作卡片链接正确", results)
            cover = reduced_page.locator("#grid img")
            cover.scroll_into_view_if_needed()
            reduced_page.wait_for_function("document.querySelector('#grid img').complete && document.querySelector('#grid img').naturalWidth > 0")
            check(cover.evaluate("img => img.complete && img.naturalWidth > 0 && img.currentSrc.includes('valentine@800.jpg')"), "新作 800px 封面真实加载", results)
            reduced_page.screenshot(path=str(ROOT / "valentine" / "renders" / "gallery-home.png"), full_page=False)
            reduced_context.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    report["passed"] = results
    report["console"] = console
    report["failedRequests"] = failures
    output = ROOT / "valentine" / "renders" / "verification.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    errors = [item for item in console if item["type"] in ("error", "pageerror")]
    if errors or failures:
        raise SystemExit(f"Browser errors or failed requests: {errors or failures}")
    print(f"ALL {len(results)} CHECKS PASSED")


if __name__ == "__main__":
    main()
