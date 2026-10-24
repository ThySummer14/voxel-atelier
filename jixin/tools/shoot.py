#!/usr/bin/env python3
"""真 GPU 截图器：复用同一个 page，一次出多张，并回报 FPS / 三角数 / 控制台错误。

  python3 tools/shoot.py --url http://127.0.0.1:8931/ --out renders --shots cover,macro
  python3 tools/shoot.py --list            # 看有哪些机位
前置：先起服务 `node tools/serve.cjs`（默认 8931）。
"""
import argparse, json, os, sys, time
from playwright.sync_api import sync_playwright

SHOTS = {
    "cover":   dict(cam=dict(yaw=-31, pitch=34, dist=474, look=[0, 50, 4], fov=31), hide=True),
    "front":   dict(cam=dict(yaw=0, pitch=21, dist=492, look=[0, 54, 0], fov=30), hide=True),
    "macro":   dict(cam=dict(yaw=-24, pitch=52, dist=196, look=[0, 56, 34], fov=26), hide=True, crystal=False),
    "cage":    dict(cam=dict(yaw=-14, pitch=46, dist=150, look=[0, 56, 34], fov=24), hide=True, crystal=False),
    "balance": dict(cam=dict(yaw=22, pitch=58, dist=118, look=[0, 58, 27], fov=22), hide=True, crystal=False),
    "barrel":  dict(cam=dict(yaw=-52, pitch=44, dist=172, look=[-34, 56, -24], fov=24), hide=True, crystal=False),
    "dial":    dict(cam=dict(yaw=-8, pitch=74, dist=430, look=[0, 58, 0], fov=30), hide=True, crystal=False),
    "lume":    dict(cam=dict(yaw=-30, pitch=34, dist=390, look=[0, 52, 6], fov=31), lume=1, hide=True, crystal=False),
    "explode": dict(cam=dict(yaw=-34, pitch=17, dist=760, look=[0, 116, 6], fov=33), explode=1, hide=True, crystal=False),
    "loupe":   dict(cam=dict(yaw=-18, pitch=46, dist=392, look=[0, 54, 16], fov=30), loupe=dict(on=True, x=0.56, y=0.63, zoom=3.2), hide=True),
    "hack":    dict(cam=dict(yaw=-40, pitch=36, dist=270, look=[86, 52, 0], fov=28), hack=True, hide=True),
    "wound":   dict(cam=dict(yaw=-32, pitch=38, dist=402, look=[0, 52, 6], fov=31), power=1.0, hide=True),
    "drained": dict(cam=dict(yaw=-32, pitch=38, dist=402, look=[0, 52, 6], fov=31), power=0.02, hide=True),
    "low":     dict(cam=dict(yaw=-58, pitch=11, dist=470, look=[0, 50, 6], fov=30), hide=True),
}


BASELINE = [
    "JX.hack(false)", "JX.lume(0)", "JX.explode(0)", "JX.loupe({on:false})",
    "JX.crystal(true)", "JX.drain(0)", "JX.power(0.62)", "JX.hide(false)",
]


def apply(page, s, settle):
    # 每张都先回到基线，否则上一张的状态会串进来（曾经让 wound/drained 全在停秒状态下拍）
    js = list(BASELINE)
    if s.get("cam"):
        js.append("JX.cam(%s)" % json.dumps(s["cam"]))
    if "lume" in s:
        js.append("JX.lume(%s)" % s["lume"])
    if "explode" in s:
        js.append("JX.explode(%s)" % s["explode"])
    if "power" in s:
        js.append("JX.power(%s)" % s["power"])
    if "hack" in s:
        js.append("JX.hack(%s)" % ("true" if s["hack"] else "false"))
    if "crystal" in s:
        js.append("JX.crystal(%s)" % ("true" if s["crystal"] else "false"))
    if "sound" in s:
        js.append("JX.sound(%s)" % ("true" if s["sound"] else "false"))
    if s.get("loupe"):
        js.append("JX.loupe(%s)" % json.dumps(s["loupe"]))
    elif "loupe" in s:
        js.append("JX.loupe({on:false})")
    js.append("JX.hide(%s)" % ("true" if s.get("hide") else "false"))
    for code in js:
        page.evaluate(code)
    page.wait_for_timeout(settle)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8931/")
    ap.add_argument("--out", default="renders")
    ap.add_argument("--shots", default="cover")
    ap.add_argument("--w", type=int, default=1600)
    ap.add_argument("--h", type=int, default=1000)
    ap.add_argument("--settle", type=int, default=2600, help="改状态后等多少毫秒再拍")
    ap.add_argument("--still", default="1")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        print("\n".join(SHOTS))
        return 0
    names = [n for n in a.shots.split(",") if n]
    for n in names:
        if n not in SHOTS:
            print("未知机位:", n, file=sys.stderr)
            return 2
    os.makedirs(a.out, exist_ok=True)
    errs, rows = [], []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={"width": a.w, "height": a.h}, device_scale_factor=1)
        pg.on("console", lambda m: errs.append(m.text) if m.type in ("error",) else None)
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        t0 = time.time()
        pg.goto(a.url, wait_until="load")
        pg.wait_for_function("() => window.JX && window.JX.ready", timeout=90000)
        if a.still == "1":
            pg.evaluate("JX.still(true)")
        pg.wait_for_timeout(1200)
        base = pg.evaluate("JX.stats()")
        for n in names:
            apply(pg, SHOTS[n], a.settle)
            path = os.path.join(a.out, n + ".png")
            pg.screenshot(path=path)
            pr = pg.evaluate("JX.probe()")
            rows.append(dict(shot=n, file=path, fps=pr["fps"], beats=pr["beats"],
                             power=pr["power"], amp=pr["amp"], running=pr["running"],
                             hacked=pr["hacked"], lume=SHOTS[n].get("lume"),
                             explode=SHOTS[n].get("explode")))
        st = pg.evaluate("JX.stats()")
        b.close()
    print(json.dumps(dict(
        shots=rows, seconds=round(time.time() - t0, 1),
        build=dict(filled=base["filled"], tris=st["triangles"], faces=st["faces"],
                   meshes=st["meshes"], drawCalls=st["drawCalls"], sculptMs=st["buildMs"]),
        consoleErrors=errs[:12], errorCount=len(errs)), ensure_ascii=False, indent=1))
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
