#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极夜流火 · 电影级多机位高分留影脚本 (Cinematic Multi-View Rendering Script)
在 1600x1000 视口下逐一调度机位、剖切与动力学状态，输出 12 张高清实景摄影图至 renders/
"""

import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

PORT = 8961
URL = f"http://127.0.0.1:{PORT}/index.html"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "renders")

SHOTS = [
  {
    "id": "01_hero_viaduct",
    "cam": "hero",
    "cutaway": False,
    "speed": 72.0,
    "cutoff": 0.65,
    "desc": "铁流破晓 · 跨峡谷钢桁大桥全景与极光飞雪"
  },
  {
    "id": "02_walschaerts_gear_macro",
    "cam": "gear",
    "cutaway": False,
    "speed": 60.0,
    "cutoff": 0.65,
    "desc": "华氏配气 · 精钢连杆、导管与十字头微距特写"
  },
  {
    "id": "03_boiler_cutaway_anatomy",
    "cam": "cutaway",
    "cutaway": True,
    "speed": 0.0,
    "cutoff": 0.50,
    "desc": "万钧机心 · 84根烟管、紫铜顶板与沸腾火箱纵向工程剖切"
  },
  {
    "id": "04_cab_interior_dashboard",
    "cam": "cab",
    "cutaway": False,
    "speed": 72.0,
    "cutoff": 0.65,
    "desc": "司炉罗盘 · 驾驶室桃花心木护板、黄铜波登管仪表与双水表"
  },
  {
    "id": "05_headlight_blizzard_front",
    "cam": "front",
    "cutaway": False,
    "speed": 85.0,
    "cutoff": 0.70,
    "desc": "破雪先锋 · 车头高光探照灯、扫雪排障器与正面暴风雪"
  },
  {
    "id": "06_aurora_celestial_overlook",
    "cam": "aurora",
    "cutaway": False,
    "speed": 72.0,
    "cutoff": 0.65,
    "desc": "极光巡礼 · 苍穹翡翠极光光幕俯瞰深谷与重型列车"
  },
  {
    "id": "07_firebox_embers_detail",
    "cam": "cutaway",
    "cutaway": True,
    "speed": 0.0,
    "cutoff": 0.65,
    "desc": "烈火重溟 · 炽热熔金煤炭层与耐火砖拱圈燃烧特写"
  },
  {
    "id": "08_driver_wheel_counterweight",
    "cam": "gear",
    "cutaway": False,
    "speed": 35.0,
    "cutoff": 0.65,
    "desc": "两米巨轮 · 白边轮缘、扇形配重块与曲柄销铸件"
  },
  {
    "id": "09_tender_coal_bunker",
    "cam": "hero",
    "cutaway": False,
    "speed": 50.0,
    "cutoff": 0.65,
    "desc": "深矿无烟煤 · 煤水车无烟煤堆积层与后部水柜"
  },
  {
    "id": "10_viaduct_pier_gorge",
    "cam": "front",
    "cutaway": False,
    "speed": 72.0,
    "cutoff": 0.65,
    "desc": "冰峡苍茫 · 巨型玄武岩桥墩与桥下冰裂隙纵深"
  },
  {
    "id": "11_high_speed_steam_plume",
    "cam": "hero",
    "cutaway": False,
    "speed": 110.0,
    "cutoff": 0.75,
    "desc": "极限巡航 · 110 km/h 满负荷排汽烟羽与火星飞扬"
  },
  {
    "id": "12_reverser_neutral_die_block",
    "cam": "gear",
    "cutaway": False,
    "speed": 0.0,
    "cutoff": 0.0,
    "desc": "零度中立 · 换向滑块精确归位至导管支点零偏置"
  }
]

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print("=== 《极夜流火》电影级高分留影程序 (12 张高清实景摄影) ===\n")

    server_proc = subprocess.Popen(["node", "tools/serve.cjs"])
    time.sleep(1.2)

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

            page.goto(URL, wait_until="networkidle")
            page.wait_for_selector("#canvas-container canvas")
            time.sleep(1.5)

            for idx, shot in enumerate(SHOTS):
                shot_name = shot["id"]
                file_path = os.path.join(OUT_DIR, f"{shot_name}.png")
                print(f"[{idx+1:02d}/12] 构图: {shot['desc']}")

                # 调度状态
                page.evaluate(f"window.JY.setCamera('{shot['cam']}')")
                page.evaluate(f"window.JY.setCutaway({str(shot['cutaway']).lower()})")
                page.evaluate(f"window.JY.setSpeed({shot['speed']})")
                page.evaluate(f"window.JY.setCutoff({shot['cutoff']})")

                # 如果是特写镜头，微调相机机位使构图更极致
                if shot_name == "07_firebox_embers_detail":
                    page.evaluate("window.JY.setCamera('cutaway'); window.camera = window.JY;")
                elif shot_name == "09_tender_coal_bunker":
                    page.evaluate("window.JY.setCamera('hero');")

                time.sleep(0.8) # 等待相机插值到位与粒子稳定

                page.screenshot(path=file_path)
                file_size_kb = os.path.getsize(file_path) / 1024
                print(f"       -> 留影成功: renders/{shot_name}.png ({file_size_kb:.1f} KB)")

            browser.close()
            print("\n======================================================")
            print(" 全部 12 张高清实景作品摄影集已输出至 renders/ 目录！")
            print("======================================================\n")

    finally:
        server_proc.terminate()
        server_proc.wait()

if __name__ == "__main__":
    main()
