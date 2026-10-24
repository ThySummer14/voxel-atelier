#!/usr/bin/env python3
"""Playwright 验收：读画、生产速率、展卷路径、交互与浏览器错误。"""
import argparse
import json
import sys
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--url", default="http://127.0.0.1:8912/index.html")
args = ap.parse_args()

out = {"pass": False, "url": args.url}
errors = []
page = None
browser = None
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=metal"],
        )
        page = browser.new_page(
            viewport={"width": 1280, "height": 800}, device_scale_factor=1
        )
        page.on(
            "console",
            lambda m: errors.append(f"[{m.type}] {m.text}")
            if m.type in ("error", "warning")
            else None,
        )
        page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
        page.goto(args.url, wait_until="load")
        page.wait_for_selector("#loader.gone", timeout=180000)
        page.wait_for_timeout(2500)

        webgl = page.evaluate("window.QL && window.QL.webglInfo ? window.QL.webglInfo() : null")
        metal = bool(webgl and "apple" in str(webgl.get("renderer", "")).lower() and "metal" in str(webgl.get("renderer", "")).lower())
        out["webgl"] = {"info": webgl, "realMetal": metal, "pass": metal}

        # 编译期自检：三矾九染的落色代码是否真的进了 GLSL。
        # onBeforeCompile 拿到的是**未展开 #include 的原始 shader**，历史上
        # replace 目标写成了展开后的 "diffuseColor.rgb *= vColor;"，于是整条
        # 染色静默失效——画面照样有顶点色，程序照样编译通过，只有落色不生效。
        shp = page.evaluate("window.QL.shaderProbe()")
        out["D6_shader_injection"] = {
            **shp,
            "pass": bool(
                shp["compiled"] >= 5
                and shp["revealGuard"] and shp["dyeCalled"]
                and shp["srgbVertexColor"] and shp["emitScaleApplied"]
                and not shp["leftoverInclude"]
            ),
        }

        # D6：染色真的在换色彩语言吗？遮住天与水，只留山体，
        # 比较「赭石打底阶段」与「完成态」的饱和像素平均色相。
        page.evaluate("window.QL.chapter(2)")
        page.wait_for_timeout(3200)
        page.evaluate("window.QL.hide('sky', true); window.QL.hide('water', true)")
        page.wait_for_timeout(400)
        stages = {}
        for v in (0.20, 0.45, 2.0):
            page.evaluate(f"window.QL.dye({v})")
            page.wait_for_timeout(320)
            stages[str(v)] = page.evaluate("window.QL.probe()")
        page.evaluate("window.QL.dye(2); window.QL.hide('sky', false); window.QL.hide('water', false)")
        page.wait_for_timeout(400)

        def huediff(a, b):
            d = abs(a - b)
            return min(d, 360 - d)

        base = stages["2.0"]
        ochre = stages["0.2"]
        sap = stages["0.45"]
        d_ochre = huediff(base["hueSat"], ochre["hueSat"])
        d_sap = huediff(base["hueSat"], sap["hueSat"])
        rgb_shift = sum(abs(a - b) for a, b in zip(base["rgb"], ochre["rgb"])) / 3
        out["D6_dye_stages"] = {
            "stages": stages,
            "hueOchreVsFinal": round(d_ochre, 1),
            "hueSapVsFinal": round(d_sap, 1),
            "meanRgbDeltaOchreVsFinal": round(rgb_shift, 4),
            "pass": bool(
                d_ochre >= 25 and d_sap >= 8
                and rgb_shift >= 0.03
                and all(s["satPix"] > 400 for s in (base, ochre, sap))
            ),
        }

        # D7：读画前后平均色相位移。
        page.evaluate("window.QL.chapter(2)")
        page.wait_for_timeout(2400)
        world = page.evaluate("window.QL.probe()")
        page.evaluate("window.QL.silk(true)")
        page.wait_for_timeout(1800)
        silk = page.evaluate("window.QL.probe()")
        page.evaluate("window.QL.silk(false)")
        page.wait_for_timeout(1200)
        delta = abs(world["hueSat"] - silk["hueSat"])
        delta = min(delta, 360 - delta)
        out["D7_silk_hue"] = {
            "world": world, "silk": silk, "hueDiffSaturated": round(delta, 1),
            "pass": bool(delta >= 20),
        }

        # D8：生产速率仍按真实巡航测量；同时验证 800 段展卷路径。
        page.evaluate("window.QL.scroll(0)")
        page.wait_for_timeout(700)
        page.evaluate("window.QL.play(true)")
        nums = []
        for _ in range(8):
            page.wait_for_timeout(1000)
            nums.append(float(page.evaluate("window.QL.scrollCm()").split("/")[0].strip()))
        page.evaluate("window.QL.play(false)")
        total = 1191.5
        deltas = [round((nums[i + 1] - nums[i]) % total, 1) for i in range(len(nums) - 1)]
        rate = sum(deltas) / len(deltas)
        mono = all(0 < d < 60 for d in deltas)
        out["D8_scroll"] = {
            "cm": nums, "deltasPerSec": deltas, "rateCmPerSec": round(rate, 1),
            "monotonicWithWrap": mono, "pass": bool(mono and 14 < rate < 34),
        }
        path = page.evaluate("window.QL.scrollPath(800)")
        path_rows = path.get("path", [])
        u_mono = all(path_rows[i + 1]["u"] > path_rows[i]["u"] for i in range(len(path_rows) - 1))
        x_mono = all(path_rows[i + 1]["x"] < path_rows[i]["x"] for i in range(len(path_rows) - 1))
        cm_vals = [r["cm"] for r in path_rows]
        cm_mono = all(cm_vals[i + 1] >= cm_vals[i] for i in range(len(cm_vals) - 1))
        # 展卷机位在 z=322，而世界只到 z=190：相机永远在山体之外，
        # 「脚下净空」在这里恒真。真正要量的是视线起段有没有被地形埋住。
        path_pass = (
            abs(path.get("startCm", -1) - 0.0) < 0.6
            and abs(path.get("endCm", -1) - 1191.5) < 0.6
            and path.get("samples") == 801
            and path.get("buriedSamples", 1) == 0
            and path.get("blockedSamples", 1) == 0
            and path.get("outsideWorldSamples") == 801
            and u_mono and x_mono and cm_mono
        )
        out["D8_scroll_path"] = {
            "samples": path.get("samples"), "startCm": path.get("startCm"),
            "endCm": path.get("endCm"), "minClearance": path.get("minClearance"),
            "buriedSamples": path.get("buriedSamples"),
            "blockedSamples": path.get("blockedSamples"),
            "outsideWorldSamples": path.get("outsideWorldSamples"),
            "sampleCount": len(path_rows), "uMonotonic": u_mono, "xMonotonic": x_mono,
            "cmMonotonic": cm_mono, "pass": path_pass,
        }
        # 探针读完必须还原机位，否则后面的量测全在卷尾做。
        out["D8_probe_restores_camera"] = {
            "u": page.evaluate("window.QL.scrollU()"),
            "pass": page.evaluate("window.QL.scrollU()") < 0.999,
        }

        # D10：拖拽、滚轮、方向键、双击，以及原生键盘/无障碍状态。
        page.evaluate("window.QL.chapter(1)")
        page.wait_for_timeout(3200)
        res = {}
        c0 = page.evaluate("window.QL.camerapos()")
        page.mouse.move(640, 400); page.mouse.down(); page.mouse.move(780, 430, steps=10); page.mouse.up()
        page.wait_for_timeout(1000)
        c1 = page.evaluate("window.QL.camerapos()")
        res["drag"] = c0 != c1
        page.mouse.wheel(0, -260)
        page.wait_for_timeout(1000)
        c2 = page.evaluate("window.QL.camerapos()")
        res["wheel"] = c2 != c1
        focused_idx = page.evaluate("window.QL.chapterIdx()")
        page.locator("#scroll").focus()
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(500)
        res["range_arrow_focus_does_not_change_chapter"] = page.evaluate("window.QL.chapterIdx()") == focused_idx
        page.locator("#btn-scroll").focus()
        before = page.locator("#btn-scroll").get_attribute("aria-pressed")
        page.keyboard.press("Space")
        page.wait_for_timeout(250)
        after = page.locator("#btn-scroll").get_attribute("aria-pressed")
        res["button_space_native_click"] = before != after
        res["button_aria_pressed"] = before in ("true", "false") and after in ("true", "false")
        if after == "true":
            page.locator("#btn-scroll").press("Space")
        page.mouse.dblclick(640, 400)
        page.wait_for_timeout(3200)
        c3 = page.evaluate("window.QL.camerapos()")
        res["dblclick_rehomes"] = c3 != c2
        page.evaluate("window.QL.scroll(1)")
        end_state = page.evaluate("({u: window.QL.scrollU(), cm: window.QL.scrollCm()})")
        end_cm = float(end_state["cm"].split("/")[0].strip())
        res["scroll_end_state"] = end_state["u"] == 1 and end_cm >= 1190
        res["all"] = all(v for k, v in res.items() if k not in ("all", "pass"))
        res["pass"] = res["all"]
        out["D10_interact"] = res

        out["D2_console"] = {"count": len(errors), "first": errors[:8], "pass": len(errors) == 0}
        required = [
            out["webgl"]["pass"], out["D6_shader_injection"]["pass"], out["D6_dye_stages"]["pass"],
            out["D7_silk_hue"]["pass"], out["D8_scroll"]["pass"], out["D8_scroll_path"]["pass"],
            out["D8_probe_restores_camera"]["pass"], out["D10_interact"]["pass"], out["D2_console"]["pass"],
        ]
        out["pass"] = all(required)
        out["failedChecks"] = [
            k for k in ("webgl", "D6_shader_injection", "D6_dye_stages", "D7_silk_hue",
                        "D8_scroll", "D8_scroll_path", "D8_probe_restores_camera",
                        "D10_interact", "D2_console")
            if not out[k]["pass"]
        ]
except Exception as exc:
    out["fatal"] = f"{type(exc).__name__}: {exc}"
    out["D2_console"] = {"count": len(errors), "first": errors[:8], "pass": False}

print(json.dumps(out, ensure_ascii=False, indent=1))
sys.exit(0 if out.get("pass") else 1)
