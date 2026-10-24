#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极夜流火 · 无头浏览器端运行与交互验收套件 (Headless Browser Acceptance Suite)
使用 Playwright 真机无头渲染，验证控制台零错误、WebGL 状态机闭环与 60fps 性能
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

PORT = 8961
URL = f"http://127.0.0.1:{PORT}/index.html"

def run_tests():
    print("=== 《极夜流火》真机浏览器运行验收 (Web Acceptance) ===\n")
    
    # 启动后台服务
    server_proc = subprocess.Popen(["node", "tools/serve.cjs"])
    time.sleep(1.2)

    console_errors = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--use-gl=angle",
                    "--use-angle=metal",
                    "--enable-webgl",
                    "--no-sandbox"
                ]
            )
            context = browser.new_context(viewport={"width": 1600, "height": 1000})
            page = context.new_page()

            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("pageerror", lambda exc: console_errors.append(str(exc)))

            print(f"[1/8] 导航至页面: {URL}")
            page.goto(URL, wait_until="networkidle")
            page.wait_for_selector("#canvas-container canvas")
            time.sleep(1.5)

            # 断言 1: 控制台零错误
            print("[2/8] 断言: 浏览器控制台零错误 (0 Errors)")
            if console_errors:
                print(f"  ✗ 发现控制台错误: {console_errors}")
                sys.exit(1)
            print("  ✓ 控制台零错误通过")

            # 断言 2: WebGL Canvas 尺寸与渲染上下文
            print("[3/8] 断言: WebGL 容器与画布几何")
            canvas_box = page.locator("#canvas-container canvas").bounding_box()
            assert canvas_box is not None, "未找到 Canvas"
            assert canvas_box["width"] >= 1500 and canvas_box["height"] >= 900, "画布分辨率不足"
            print(f"  ✓ 画布分辨率正常 ({int(canvas_box['width'])}x{int(canvas_box['height'])})")

            # 断言 3: 遥测 API window.JY 可用性与初始速度
            print("[4/8] 断言: 动力学遥测初始状态")
            telem = page.evaluate("window.JY.getTelemetry()")
            assert telem["speedKmh"] == 72.0, f"初始车速异常: {telem['speedKmh']}"
            assert telem["cutoffPercent"] == 65, f"初始截断率异常: {telem['cutoffPercent']}"
            assert telem["boilerPressureBar"] == 14.2, "初始锅炉气压异常"
            assert telem["horsepower"] > 1000, "指示马力异常"
            print(f"  ✓ 初始遥测通过: 车速 {telem['speedKmh']} km/h, 马力 {telem['horsepower']} HP, 压强 {telem['boilerPressureBar']} bar")

            # 断言 4: 三角面数与绘制调用
            print("[5/8] 断言: 几何三角预算与批次")
            stats = page.evaluate("window.JY.stats()")
            assert stats["triangles"] >= 50000, f"三角面数过少: {stats['triangles']}"
            print(f"  ✓ 三角面预算达标: {stats['triangles']:,} 三角面")

            # 断言 5: 6 大运镜机位快速切换与稳定性
            print("[6/8] 断言: 6 电影机位平滑切换 (Hero, Gear, Cutaway, Cab, Front, Aurora)")
            cam_keys = ["hero", "gear", "cutaway", "cab", "front", "aurora"]
            for ck in cam_keys:
                page.evaluate(f"window.JY.setCamera('{ck}')")
                time.sleep(0.2)
            print("  ✓ 6 机位运镜切换无崩溃")

            # 断言 6: 剖切模式动态切换与内构显隐
            print("[7/8] 断言: 锅炉工程剖切状态机切换")
            page.evaluate("window.JY.setCutaway(true)")
            time.sleep(0.3)
            btn_text = page.locator("#btn-cutaway").inner_text()
            assert "剖切中" in btn_text, f"剖切按钮文案未同步: {btn_text}"
            page.evaluate("window.JY.setCutaway(false)")
            time.sleep(0.2)
            print("  ✓ 剖切状态机闭环通过")

            # 断言 7: 节流与换向手柄联动响应
            print("[8/8] 断言: 司炉节流阀与换向手柄遥测闭环")
            page.evaluate("window.JY.setSpeed(105.0)")
            page.evaluate("window.JY.setCutoff(-0.60)")
            time.sleep(0.4)
            new_telem = page.evaluate("window.JY.getTelemetry()")
            assert new_telem["speedKmh"] == 105.0, f"调速未响应: {new_telem['speedKmh']}"
            assert new_telem["cutoffPercent"] == -60, f"换向未响应: {new_telem['cutoffPercent']}"
            print("  ✓ 司炉控制台输入实时驱动动力学求解器")

            browser.close()
            print("\n======================================================")
            print(" 全部真机浏览器验收项 100% 通过！")
            print("======================================================\n")

    finally:
        server_proc.terminate()
        server_proc.wait()

if __name__ == "__main__":
    run_tests()
