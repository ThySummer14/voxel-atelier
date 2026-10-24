#!/usr/bin/env python3
"""浏览器验收：《经天纬地》网页端真跑一遍（要求 tools/serve.mjs 已在 :8945 起好）。
口径：无控制台报错 + 场景确实建起来 + 逐纬采样自洽 + 织成的布与花本一一对应 + 交互真的生效。"""
import sys, json, math, time
from playwright.sync_api import sync_playwright

URL = "http://localhost:8945/index.html"
FAIL = []
OK = []

def check(cond, msg, extra=""):
    (OK if cond else FAIL).append(msg + (f"  [{extra}]" if extra else ""))
    print(("  ✓ " if cond else "  ✗ ") + msg + (f"   {extra}" if extra else ""))

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=[
            "--use-angle=metal", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox",
            "--no-sandbox", "--enable-webgl", "--ignore-gpu-blocklist",
        ])
        page = browser.new_page(viewport={"width": 1280, "height": 820})
        errors, logs = [], []
        page.on("console", lambda m: (logs.append(m.text), errors.append(m.text) if m.type == "error" else None))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_function("window.JT && window.JT.ready()", timeout=120_000)
        time.sleep(1.5)

        print("— 场景 —")
        stats = page.evaluate("JT.stats()")
        counts = page.evaluate("JT.counts()")
        check(stats and stats["tris"] > 80_000, "静态网格三角数 > 80k", f"tris={stats['tris'] if stats else None}")
        check(counts["statics"] > 18, "可见静态件 > 18", f"{counts}")
        check(counts["dyn"] > 70, "动态件（经线/梭/花本…）> 70", f"{counts['dyn']}")
        app = {"stats": stats, "counts": counts}

        print("— 逐纬采样自洽 —")
        total = page.evaluate("JT.total()")
        dur = page.evaluate("JT.duration()")
        check(total > 30, "一匹总时长 > 30s", f"total={total:.1f}s duration={dur:.1f}s")
        lifted = page.evaluate("JT.liftSets()")
        bad_rows, bad_open, bad_shut = [], [], []
        prev_rows = -1
        samples = [round(total * k / 24, 3) for k in range(25)]
        for t in samples:
            f = page.evaluate("t => { JT.setTime(t); return JT.frame(); }", t)
            if f["rowsPlaced"] < prev_rows:
                bad_rows.append(t)
            prev_rows = f["rowsPlaced"]
            for v in f["openness"]:
                if not (0.0 <= v <= 1.0001):
                    bad_open.append(t); break
            if f["shuttle"]:
                x, y, z = f["shuttle"]["pos"]
                carrying = f["shuttle"].get("carrying")
                if carrying:
                    # 引纬时必须在梭道里：y≈38、z≈6、x 在幅内
                    if not (20 <= y <= 42 and -2 <= z <= 12 and -70 <= x <= 72):
                        bad_shut.append(("flight", round(t, 2), round(x), round(y), round(z)))
                elif not (-80 <= x <= 130 and 20 <= y <= 70 and -14 <= z <= 96):
                    bad_shut.append(("idle", round(t, 2), round(x), round(y), round(z)))
        check(not bad_rows, "已织纬数随时间是单调不减的", f"{bad_rows[:4]}")
        check(not bad_open, "提综开口度全部在 [0,1]", f"{bad_open[:4]}")
        check(not bad_shut, "梭始终在梭道许可范围内", f"{bad_shut[:3]}")
        # 每纬开局时提起的经线 = 花本该纬的孔
        ok_lift = True
        for j in range(0, 42, 7):
            f = page.evaluate("t => { JT.setTime(t); return JT.frame(); }", page.evaluate("JT.total()") * j / 42 + 0.05)
            opened = {i for i, v in enumerate(f["openness"]) if v > 0.5}
            expect = set(lifted[j]) if j < len(lifted) else set()
            if j > 0 and not opened.issubset(expect | set(lifted[j - 1])):
                ok_lift = False
        check(ok_lift, "提起的经线 ⊆ 本纬/上纬花本孔")

        print("— 织成的布 = 花本 —")
        page.evaluate("JT.setTime(JT.total() - 0.001)")
        time.sleep(0.4)
        rows = page.evaluate("JT.frame().rowsPlaced")
        check(rows == 42, "42 纬全部织入", f"rows={rows}")
        # 布面自查（与离线同一口径）：把实测面片栅格化后与「花本期望色×光照」比方向
        page.evaluate("JT.setTime(JT.total() - 0.001)")
        time.sleep(0.6)
        cc = page.evaluate("JT.clothCheck()")
        check(cc["bad"] == 0 and cc["missing"] == 0,
              f"布面实测色 = 花本期望色（{cc['tested']} 格全覆盖）",
              f"不符 {cc['bad']}，缺面 {cc['missing']}，最大偏差 {cc['worst']}")

        print("— 交互 —")
        p0 = page.evaluate("JT.probe()")
        page.click("#bPlay")
        time.sleep(0.25)
        p1 = page.evaluate("JT.probe()")
        check(p0["playing"] != p1["playing"], "开织/停机按钮真的停得下来")
        page.click("#bPlay")
        name0 = page.evaluate("JT.patternName()")
        page.click("#bNext")
        time.sleep(0.4)
        name1 = page.evaluate("JT.patternName()")
        check(name0 != name1, "换花本真的换了本子", f"{name0} → {name1}")
        page.evaluate("JT.camera('fell')")
        time.sleep(0.9)
        look = page.evaluate("JT.look()")
        check(abs(look["yaw"] - 0.30) < 0.25, "机位切换生效（织口）", f"yaw={look['yaw']}")
        page.evaluate("JT.toggleLamp()")
        time.sleep(0.2)
        check(page.evaluate("JT.lampOn()") is False, "熄灯开关生效")
        page.evaluate("JT.toggleLamp()")
        page.evaluate("JT.toggleFrame()")
        time.sleep(0.2)
        st = page.evaluate("JT.counts()")
        check(st["statics"] < counts["statics"], "去机架真的隐去了构件", f"{counts['statics']} → {st['statics']}")
        page.evaluate("JT.toggleFrame()")
        page.evaluate("JT.toggleCords()")
        time.sleep(0.2)
        page.evaluate("JT.toggleCords()")

        print("— 帧率 —")
        page.evaluate("JT.camera('cover'); JT.pattern(1); JT.setTime(0); JT.play(true); JT.speed(2)")
        time.sleep(4.0)
        probe = page.evaluate("JT.probe()")
        check(probe["fps"] > 20, "实时帧率 > 20fps（headless 软栅格下）", f"fps={probe['fps']:.1f}")
        check(probe["clock"] > 2, "时间在前行", f"clock={probe['clock']:.1f}")
        app["probe"] = probe

        print("— 控制台 —")
        real = [e for e in errors if "favicon" not in e and "Download the React" not in e]
        check(not real, "无控制台错误", f"{real[:2]}")

        browser.close()
    print(f"\n通过 {len(OK)} 条，失败 {len(FAIL)} 条")
    if FAIL:
        for m in FAIL:
            print("  ✗ " + m)
        sys.exit(1)

if __name__ == "__main__":
    main()