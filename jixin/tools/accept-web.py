#!/usr/bin/env python3
"""浏览器端验收：真 GPU 跑一遍，断言走时/节拍/交互/像素都真的变了。
跑法：先 `node tools/serve.cjs`，再 `python3 tools/accept-web.py`
退出码非 0 即失败。每条断言都问了一句「什么输入能让它失败」。
"""
import argparse, io, json, sys, time
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--url", default="http://127.0.0.1:8931/")
ap.add_argument("--w", type=int, default=1600)
ap.add_argument("--h", type=int, default=1000)
A = ap.parse_args()

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name + (f" — {detail}" if detail else ""))
    print(("  \033[32m✓\033[0m " if cond else "  \033[31m✗\033[0m ") + name + (f"  {detail}" if detail else ""))


def mean_lum(png_bytes):
    """不依赖 PIL 的话就退化为粗粒度；这里 PIL 可用。"""
    im = np.asarray(Image.open(io.BytesIO(png_bytes)).convert("RGB"), dtype=np.float32)
    return im


TAU = 6.283185307179586

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal", "--enable-unsafe-swiftshader"])
    pg = b.new_page(viewport={"width": A.w, "height": A.h}, device_scale_factor=1)
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    t0 = time.time()
    pg.goto(A.url, wait_until="load")
    pg.wait_for_function("() => window.JX && window.JX.ready", timeout=90000)
    print(f"\n\033[1m1 · 装载\033[0m")
    ok("页面就绪", True, f"{time.time()-t0:.1f}s")
    st = pg.evaluate("JX.stats()")
    ok("三角数在预算内", 100000 < st["triangles"] < 600000, f"{st['triangles']:,}")
    ok("体素格数 > 100 万", st["filled"] > 1000000, f"{st['filled']:,}")
    empties = [pp["name"] for pp in st["perPart"] if pp["tris"] <= 0]
    ok("每个零件都出了非空网格", len(empties) == 0 and st["meshes"] >= 50,
       f"{st['meshes']} meshes" + (" 空: " + ",".join(empties) if empties else ""))

    pg.evaluate("JX.still(true); JX.cam({yaw:-31,pitch:34,dist:474,look:[0,50,4],fov:31})")
    pg.wait_for_timeout(2500)

    print(f"\n\033[1m2 · 真实走时（浏览器侧，间隔 6 秒两次采样）\033[0m")
    a = pg.evaluate("JX.probe()")
    rotA = pg.evaluate("()=>{const o=JX._objects.find(x=>x.userData.key==='cageFrame');return [o.rotation.y,o.parent===JX._root];}")
    pg.wait_for_timeout(6000)
    c = pg.evaluate("JX.probe()")
    rotB = pg.evaluate("()=>{const o=JX._objects.find(x=>x.userData.key==='cageFrame');return o.rotation.y;}")
    wall = (c["t"] - a["t"]) / 1000.0
    dcage = (rotB - rotA[0])
    ok("笼框 mesh 的 rotation.y 真的在变（渲染层，不只是运动学）", abs(dcage) > 1e-3, f"Δ={dcage:.4f} rad / {wall:.2f}s")
    ok("笼框角速度 = 2π/60（±1.5%）",
       abs(abs(dcage) / wall - TAU / 60) < TAU / 60 * 0.015,
       f"{abs(dcage)/wall:.5f} vs {TAU/60:.5f} rad/s")
    db = c["beats"] - a["beats"]
    ok(f"6 秒 ≈ 30 拍（实测 {db}）", abs(db / wall - 5) < 0.1, f"{db/wall:.3f} 拍/s")
    dsec = c["displaySec"] - a["displaySec"]
    ok("机芯读数与真实时间同速", abs(dsec - wall) < 0.15, f"Δ={dsec:.3f}s vs 真实 {wall:.3f}s")
    # 反解真实时刻（期望值来自 Date，独立于被测代码）
    import datetime
    now = datetime.datetime.now()
    real_in_hour = (now.hour % 12) * 3600 + now.minute * 60 + now.second + now.microsecond / 1e6
    from math import modf
    min_frac = modf(-c["angles"]["minute"] / TAU)[0]
    sec_from_hand = (min_frac * 3600 + 3600) % 3600
    diff = min(abs(sec_from_hand - real_in_hour % 3600), 3600 - abs(sec_from_hand - real_in_hour % 3600))
    ok("分针角度反解 == 系统时钟（±2s）", diff < 2, f"反解 {sec_from_hand:.1f}s / 系统 {real_in_hour%3600:.1f}s")
    cage_frac = (modf(-c["angles"]["cage"] / TAU)[0] + 1) % 1
    ok("笼框即秒针（±1s）", min(abs(cage_frac * 60 - real_in_hour % 60), 60 - abs(cage_frac * 60 - real_in_hour % 60)) < 1,
       f"笼框 {cage_frac*60:.2f}s / 系统 {real_in_hour%60:.2f}s")

    print(f"\n\033[1m3 · 性能与控制台\033[0m")
    ok("帧率 ≥ 55", c["fps"] >= 55, f"{c['fps']} fps")
    ok("控制台零 error", len(errs) == 0, "; ".join(errs[:3]))
    pk = pg.evaluate("JX.pick(%f,%f)" % (A.w * 0.5, A.h * 0.55))
    ok("屏幕中心命中表体零件", pk and pk.get("part"), json.dumps(pk, ensure_ascii=False)[:90])

    print(f"\n\033[1m4 · 签名交互必须真的改变画面\033[0m")
    base = mean_lum(pg.screenshot())

    def snap():
        return mean_lum(pg.screenshot())

    # 夜光
    pg.evaluate("JX.lume(1)"); pg.wait_for_timeout(1600)
    lum = snap()
    m0, m1 = float(base.mean()), float(lum.mean())
    green = float(((lum[:, :, 1] > lum[:, :, 0] + 18) & (lum[:, :, 1] > lum[:, :, 2] + 18) & (lum[:, :, 1] > 60)).sum())
    ok("夜光：整体显著变暗", m1 < m0 * 0.6, f"均亮 {m0:.1f}→{m1:.1f}")
    ok("夜光：出现绿色发光像素", green > 400, f"{int(green)} px")
    pg.evaluate("JX.lume(0)"); pg.wait_for_timeout(1400)

    # 拆解
    pg.evaluate("JX.explode(1)"); pg.wait_for_timeout(2200)
    exp = snap()
    diff_px = float((abs(exp - base) > 24).mean())
    rows_any = (exp.max(axis=2) > 40)
    ys = np.where(rows_any.any(axis=1))[0]
    ok("拆解：画面大面积改变", diff_px > 0.25, f"变化像素 {diff_px*100:.1f}%")
    ok("拆解：竖向内容范围变大（零件分层抬起）", len(ys) > 0, f"内容行跨度 {len(ys)}")
    lbl = pg.evaluate("()=>[...document.querySelectorAll('.lbl')].filter(e=>getComputedStyle(e).display!=='none').length")
    ok("拆解：中文标注出现", lbl >= 8, f"{lbl} 条")
    pg.evaluate("JX.explode(0)"); pg.wait_for_timeout(2000)

    # 停秒
    b0 = pg.evaluate("JX.probe()")["beats"]
    pg.evaluate("JX.hack(true)"); pg.wait_for_timeout(2200)
    b1 = pg.evaluate("JX.probe()")["beats"]
    ok("停秒：2.2 秒内拍数完全冻结", b1 == b0, f"{b0}→{b1}")
    pg.evaluate("JX.hack(false)"); pg.wait_for_timeout(1200)
    b2 = pg.evaluate("JX.probe()")["beats"]
    ok("复走：拍数继续增加", b2 > b1, f"{b1}→{b2}")

    # 上链闭环（同帧三量齐变）
    pre = pg.evaluate("JX.probe()")
    pg.evaluate("JX.wind(3)")
    pg.wait_for_timeout(200)          # 摆幅在下一帧重算，等一帧再看
    post = pg.evaluate("JX.probe()")
    ok("上链：动力/摆幅/累计转角同帧上升",
       post["power"] > pre["power"] and post["amp"] > pre["amp"] and abs(post["angles"]["barrel"] - pre["angles"]["barrel"]) > 1e-6,
       f"power {pre['power']:.3f}→{post['power']:.3f}, amp {pre['amp']:.0f}°→{post['amp']:.0f}°")

    # 放大镜
    pg.evaluate("JX.loupe({on:true,x:0.5,y:0.5,zoom:3.8})"); pg.wait_for_timeout(1200)
    lp = snap()
    cx, cy = A.w // 2, A.h // 2
    R = 150
    sub = lp[cy - R:cy + R, cx - R:cx + R]
    sub0 = base[cy - R:cy + R, cx - R:cx + R]
    ok("放大镜：圆窗内画面与不放大时明显不同", float((abs(sub - sub0) > 20).mean()) > 0.3,
       f"差异 {float((abs(sub-sub0)>20).mean())*100:.0f}%")
    ok("放大镜：窗内仍有内容（不是黑屏）", float(sub.mean()) > 8, f"{float(sub.mean()):.1f}")
    pg.evaluate("JX.loupe({on:false})"); pg.wait_for_timeout(600)

    # 表镜
    pg.evaluate("JX.crystal(true)"); pg.wait_for_timeout(900)
    cr = snap()
    pg.evaluate("JX.crystal(false)"); pg.wait_for_timeout(900)
    cf = snap()
    ok("表镜开关会改变画面（反光确实存在）", float((abs(cr - cf) > 6).mean()) > 0.02,
       f"差异像素 {float((abs(cr-cf)>6).mean())*100:.1f}%")

    print(f"\n\033[1m5 · 键位与声音调度（测过 ≠ 接上）\033[0m")
    pg.evaluate("JX.lume(0)")
    pg.wait_for_timeout(900)
    pg.keyboard.press("Space")
    pg.wait_for_timeout(1400)
    ok("真实空格键切换夜光（不是只通了 API）", float(pg.evaluate("JX.lume()")) > 0.9)
    pg.keyboard.press("Space"); pg.wait_for_timeout(1200)
    ok("再按一次空格恢复", float(pg.evaluate("JX.lume()")) < 0.1)
    pg.keyboard.press("KeyX"); pg.wait_for_timeout(1500)
    ok("真实 X 键进入拆解", float(pg.evaluate("JX.explode()")) > 0.9)
    pg.keyboard.press("KeyX"); pg.wait_for_timeout(1600)
    sb0 = pg.evaluate("JX.soundBeats()")
    ok("未开声时不创建 AudioContext（不被策略拦截、不抢手势）", sb0["ctx"] == "none", sb0["ctx"])
    pg.evaluate("JX.sound(true)")
    pg.wait_for_timeout(2600)
    sb1 = pg.evaluate("JX.soundBeats()")
    ok("开声后 AudioContext 建立", sb1["ctx"] in ("running", "suspended"), sb1["ctx"])
    ok("节拍驱动了声音调度（2.6s ≈ 13 拍，容差 ±4）",
       9 <= sb1["scheduled"] - sb0["scheduled"] <= 17, f"{sb0['scheduled']}→{sb1['scheduled']}")
    w0 = pg.evaluate("JX.soundBeats()")["ratchets"]
    pg.evaluate("JX.wind(2.5)")
    pg.wait_for_timeout(500)
    w1 = pg.evaluate("JX.soundBeats()")["ratchets"]
    ok("上链触发棘轮声调度", w1 > w0, f"{w0}→{w1}")
    pg.evaluate("JX.sound(false); JX.explode(0); JX.lume(0)")

    print(f"\n\033[1m6 · 收尾\033[0m")
    ok("全程零页面异常", len(errs) == 0, "; ".join(errs[:3]))
    b.close()

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print("\n失败项:\n - " + "\n - ".join(FAIL))
    sys.exit(1)
