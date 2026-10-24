# -*- coding: utf-8 -*-
"""
parts — 上元灯市 建筑 / 器物构件库
==================================
中式木构市街的构件：飞檐屋顶、铺面、灯楼、石拱桥、灯笼、河灯、画舫、船、树……

约定：所有函数第一个参数是 Grid，坐标为世界坐标（体素），y 向上。
"""

import numpy as np
import voxlib as V
from voxlib import Grid

# --------------------------------------------------------------------------
# 调色板
# --------------------------------------------------------------------------
PAL = dict(
    # 屋顶
    tile_dark   = (46, 54, 62),
    tile_mid    = (58, 70, 80),
    tile_hi     = (74, 90, 102),
    tile_green  = (44, 74, 62),
    tile_yellow = (118, 96, 40),
    ridge       = (40, 46, 54),
    ridge_gold  = (150, 118, 44),
    # 木构
    wood_dark   = (62, 42, 30),
    wood_mid    = (96, 66, 44),
    wood_warm   = (124, 86, 56),
    wood_pale   = (156, 116, 78),
    lacquer_red = (140, 40, 32),
    lacquer_br  = (168, 54, 38),
    # 墙
    plaster     = (196, 188, 170),
    plaster_dim = (150, 144, 132),
    stone       = (128, 126, 120),
    stone_dark  = (84, 84, 82),
    stone_pale  = (162, 158, 148),
    # 灯
    lantern_red = (216, 62, 40),
    lantern_wm  = (255, 186, 120),
    lantern_gold= (238, 176, 78),
    core_warm   = (255, 214, 156),
    core_red    = (255, 130, 70),
    core_pale   = (255, 236, 208),
    # 自然
    leaf_dark   = (38, 60, 42),
    leaf_mid    = (52, 82, 52),
    leaf_warm   = (86, 96, 54),
    bark        = (52, 42, 34),
    water       = (18, 30, 38),
)


def _rgb(t):
    return np.array(t, np.uint8)


# --------------------------------------------------------------------------
# 飞檐屋顶
# --------------------------------------------------------------------------
def chinese_roof(g, x0, x1, z0, z1, y_ridge, drop, tilt_axis_z=True,
                 curve=1.9, corner_lift=4.2, corner_pow=2.6,
                 thick=2, mat=5, ridge_h=1, ridge_mat=5,
                 colors=None, seed=0, ridge_along="x", eave_extra=2,
                 upturn=True):
    """中式双坡飞檐屋顶（脊线沿 x 或沿 z）。

    屋面高度 = y_ridge - drop*tz**curve + corner_lift*tz^2.4*tx^corner_pow
    后一项让四角（翼角）明显起翘。檐口再额外加厚并上翻，形成「飞檐」。

    返回屋面顶高图 (dx,dz) int32，便于在其上继续加脊饰。
    """
    x0, x1 = int(x0), int(x1)
    z0, z1 = int(z0), int(z1)
    if x1 <= x0 or z1 <= z0:
        return None
    xc, zc = (x0 + x1 - 1) * 0.5, (z0 + z1 - 1) * 0.5
    hx = max(0.5, (x1 - x0 - 1) * 0.5)
    hz = max(0.5, (z1 - z0 - 1) * 0.5)
    X, Z = np.meshgrid(np.arange(x0, x1), np.arange(z0, z1), indexing="ij")
    if ridge_along == "x":
        tz = np.clip(np.abs(Z + 0.5 - zc - 0.5) / hz, 0, 1)
        tx = np.clip(np.abs(X + 0.5 - xc - 0.5) / hx, 0, 1)
    else:
        tz = np.clip(np.abs(X + 0.5 - xc - 0.5) / hx, 0, 1)
        tx = np.clip(np.abs(Z + 0.5 - zc - 0.5) / hz, 0, 1)

    ytop_f = (y_ridge - drop * (tz ** curve)
              + corner_lift * (tz ** 2.4) * (tx ** corner_pow))
    # 檐口上翻（飞檐）：最外一圈再抬 1-2 格
    if upturn:
        eave = (tz > 0.90)
        ytop_f = ytop_f + np.where(eave, 1.4 * ((tz - 0.90) / 0.10) ** 1.4 * (0.45 + 0.55 * tx), 0.0)
    ytop = np.floor(ytop_f + 1e-6).astype(np.int32)

    # 逐列写入（含瓦垄配色）
    cols = colors or [PAL["tile_dark"], PAL["tile_mid"], PAL["tile_hi"]]
    dx, dz = x1 - x0, z1 - z0
    ymin = int(ytop.min()) - thick - 2
    ymax = int(ytop.max()) + 1
    hh = ymax - ymin
    mask = np.zeros((dx, hh, dz), bool)
    col = np.zeros((dx, hh, dz, 3), np.uint8)
    # 瓦垄：沿脊向每 2 格一条筒瓦（亮），中间为板瓦（暗）
    if ridge_along == "x":
        ridge_line = (np.arange(dx)[:, None] % 2 == 0)
        course = (np.arange(dz)[None, :] // 2)
    else:
        ridge_line = (np.arange(dz)[None, :] % 2 == 0)
        course = (np.arange(dx)[:, None] // 2)
    rng = np.random.default_rng(seed)
    for i in range(dx):
        for j in range(dz):
            yt = ytop[i, j]
            th = thick + (eave_extra if tz[i, j] > 0.90 else 0)
            a = max(0, yt - th + 1 - ymin)
            b = min(hh, yt - ymin + 1)
            if b <= a:
                continue
            mask[i, a:b, j] = True
            if ridge_line[i, j]:
                base = np.array(cols[2], np.int16)
            else:
                base = np.array(cols[0], np.int16)
            # 每两垄压一道筒瓦，产生横向节奏
            if int(course[i, j]) % 3 == 0 and not ridge_line[i, j]:
                base = np.array(cols[1], np.int16)
            # 檐口最亮
            if tz[i, j] > 0.90:
                base = np.array(cols[2], np.int16)
            jit = int(rng.integers(-7, 8))
            col[i, a:b, j] = np.clip(base + jit, 0, 255).astype(np.uint8)
    g.mask_write(x0, ymin, z0, mask, mat, col)

    # 正脊 + 脊饰
    if ridge_h > 0:
        if ridge_along == "x":
            zi = int(round(zc - z0))
            g.box(x0, x1, y_ridge + 1, y_ridge + 1 + ridge_h, z0 + zi, z0 + zi + 1,
                  ridge_mat, _rgb(PAL["ridge"]))
            for xe in (x0, x1 - 2):
                g.box(xe, xe + 2, y_ridge + 1, y_ridge + 2 + ridge_h,
                      z0 + zi - 1, z0 + zi + 2, ridge_mat, _rgb(PAL["ridge_gold"]))
                g.box(xe, xe + 2, y_ridge + 2 + ridge_h, y_ridge + 3 + ridge_h,
                      z0 + zi, z0 + zi + 1, ridge_mat, _rgb(PAL["ridge_gold"]))
        else:
            xi = int(round(xc - x0))
            g.box(x0 + xi, x0 + xi + 1, y_ridge + 1, y_ridge + 1 + ridge_h, z0, z1,
                  ridge_mat, _rgb(PAL["ridge"]))
            for ze in (z0, z1 - 2):
                g.box(x0 + xi - 1, x0 + xi + 2, y_ridge + 1, y_ridge + 2 + ridge_h,
                      ze, ze + 2, ridge_mat, _rgb(PAL["ridge_gold"]))
    return ytop


# --------------------------------------------------------------------------
# 灯笼
# --------------------------------------------------------------------------
def lantern(g, cx, cy, cz, r=2.6, h=3.4, paper=8, cap=13,
            core=24, core_col=None, tassel=True, ribs=False,
            paper_col=None, squash=1.0):
    """一枚灯笼（纸壳自发光 + 内部光核 + 上下金盖 + 流苏）。"""
    cx, cy, cz = float(cx), float(cy), float(cz)
    pcol = _rgb(paper_col or PAL["lantern_red"])
    ccol = _rgb(core_col or PAL["core_warm"])
    # 纸壳（空心，让内部核透出）
    g.ellipsoid(cx, cy + h * 0.5, cz, r, h * 0.5, r, paper, pcol, inner=0.0)
    g.ellipsoid(cx, cy + h * 0.5, cz, r - 0.9, h * 0.5 - 0.9, r - 0.9, 0, _rgb((0, 0, 0)))
    # 内部光核
    g.ellipsoid(cx, cy + h * 0.5, cz, max(0.8, r * 0.55), max(0.9, h * 0.3),
                max(0.8, r * 0.55), core, ccol)
    # 上下盖
    g.box(cx - r * 0.62, cx + r * 0.62, cy + h - 0.9, cy + h + 0.55,
          cz - r * 0.62, cz + r * 0.62, cap, _rgb(PAL["lantern_gold"]))
    g.box(cx - r * 0.62, cx + r * 0.62, cy - 0.55, cy + 0.6,
          cz - r * 0.62, cz + r * 0.62, cap, _rgb(PAL["lantern_gold"]))
    # 竖骨（可选，细灯笼）
    if ribs:
        for a in np.linspace(0, 2 * np.pi, 8, endpoint=False):
            g.box(cx + np.cos(a) * r - 0.5, cx + np.cos(a) * r + 0.5,
                  cy + 1, cy + h - 1,
                  cz + np.sin(a) * r - 0.5, cz + np.sin(a) * r + 0.5,
                  cap, _rgb(PAL["lantern_gold"]))
    if tassel:
        g.box(cx - 0.5, cx + 0.5, cy - 2.2, cy - 0.4, cz - 0.5, cz + 0.5,
              16, _rgb(PAL["lantern_gold"]))


def lantern_row(g, pts, r=1.4, h=2.0, paper=8, every=1, paper_col=None,
                core_col=None, rng=None):
    """沿给定点列挂一串小灯笼。"""
    for i in range(0, len(pts), every):
        x, y, z = pts[i]
        jr = r * (1.0 + 0.12 * ((i * 37) % 5 - 2) / 2.0)
        lantern(g, x, y, z, jr, h, paper, 13, 24, core_col, True, False, paper_col)


def lantern_string(g, p0, p1, n, sag=3.0, r=1.15, h=1.7, paper=8,
                   rope_mat=16, paper_col=None, core_col=None, wire=True):
    """两柱之间悬一串灯（悬链线）。"""
    p0 = np.asarray(p0, np.float64); p1 = np.asarray(p1, np.float64)
    t = np.linspace(0, 1, max(2, n))[:, None]
    pts = p0[None, :] * (1 - t) + p1[None, :] * t
    pts[:, 1] -= sag * np.sin(np.pi * t[:, 0])
    if wire:
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            steps = int(max(1, np.abs(b - a).max()))
            for k in range(steps):
                q = a + (b - a) * (k / steps)
                g.box(q[0], q[0] + 1, q[1], q[1] + 1, q[2], q[2] + 1, rope_mat,
                      _rgb((40, 36, 32)))
    lantern_row(g, pts, r, h, paper, 1, paper_col, core_col)
    return pts


# --------------------------------------------------------------------------
# 铺面（沿街店铺）
# --------------------------------------------------------------------------
def shophouse(g, x0, x1, z0, z1, y0, storeys=2, floors=(7, 6),
              facing=1, ridge_drop=4.0, seed=0, lit=True,
              wall_mat=3, balcony=True, sign=True, lantern_n=2,
              hue_shift=0):
    """一间木构铺面。

    facing=+1 表示正面朝 +z；-1 朝 -z。
    floors: 每层高度。
    """
    x0, x1, z0, z1 = int(x0), int(x1), int(z0), int(z1)
    w, d = x1 - x0, z1 - z0
    rng = np.random.default_rng(seed)
    pal = PAL
    hsum = sum(floors[:storeys])
    ytop = y0 + hsum

    # --- 台基 ---
    g.jitter_box(x0 - 1, x1 + 1, y0 - 2, y0, z0 - 1, z1 + 1, 37,
                 _rgb(pal["stone_pale"] if (seed % 2) else pal["stone"]), 5, seed)
    # --- 木柱（角柱 + 间柱）---
    col_c = pal["lacquer_red"] if (seed % 3 != 2) else pal["wood_dark"]
    for xc in range(x0, x1 + 1, max(3, w // 4)):
        g.box(xc, xc + 1, y0, ytop, z0, z0 + 1, 31, _rgb(col_c))
        g.box(xc, xc + 1, y0, ytop, z1 - 1, z1, 31, _rgb(col_c))
    g.box(x0 - 1, x0, y0, ytop, z0 - 1, z1 + 1, 31, _rgb(col_c))
    g.box(x1, x1 + 1, y0, ytop, z0 - 1, z1 + 1, 31, _rgb(col_c))

    # --- 楼层与墙体 ---
    y = y0
    for si in range(storeys):
        fh = floors[si]
        ym = y + fh
        # 后墙与两侧墙：抹灰
        g.jitter_box(x0 + 1, x1 - 1, y, ym, z0 + 1, z0 + 2, 36,
                     _rgb(pal["plaster_dim"]), 6, seed + si)
        # 楼层间隔（腰檐/平座）
        if si < storeys - 1:
            g.box(x0 - 1, x1 + 1, ym - 1, ym, z0 - 1, z1 + 1, 3, _rgb(pal["wood_mid"]))
        # 正面：一层为板门 + 铺窗，二层为长窗
        if facing > 0:
            zf = z1 - 1
            zin = z1 - 2
        else:
            zf = z0
            zin = z0 + 1
        if si == 0:
            # 门洞（开敞铺面）
            dw = min(4, max(2, w // 3))
            g.carve(x0 + 1 + dw, x1 - 1 - dw, y, ym - 1, zin - 1, zin + 2)
            g.box(x0 + 1 + dw, x1 - 1 - dw, y, y + 1, zf, zf + 1, 3, _rgb(pal["wood_dark"]))
            # 门楣
            g.box(x0 + 1, x1 - 1, ym - 2, ym - 1, zf, zf + 1, 3, _rgb(pal["wood_warm"]))
            if lit:
                g.box(x0 + 2 + dw // 2, x1 - 1 - dw // 2, y + 1, ym - 3, zf, zf + 1,
                      25, _rgb(pal["core_red"]))
        else:
            # 二层长窗：格子窗 + 暖光
            g.box(x0 + 1, x1 - 1, y + 1, ym - 2, zf, zf + 1, 25,
                  _rgb(pal["core_pale"] if lit else pal["plaster_dim"]))
            # 窗棂
            for xc in range(x0 + 1, x1 - 1, 2):
                g.box(xc, xc + 1, y + 1, ym - 2, zf - 1, zf, 3, _rgb(pal["wood_dark"]))
            g.box(x0 + 1, x1 - 1, y, y + 1, zf - 1, zf, 3, _rgb(pal["wood_warm"]))
        y = ym

    # --- 上层挑出的腰檐 / 平座 ---
    if balcony and storeys >= 2:
        yb = y0 + floors[0]
        g.box(x0 - 1, x1 + 1, yb, yb + 1, (z1 if facing > 0 else z0 - 1),
              (z1 + 3 if facing > 0 else z0 + 2), 3, _rgb(pal["wood_mid"]))
    g.box(x0 - 1, x1 + 1, ytop, ytop + 1, z0 - 1, z1 + 1, 3, _rgb(pal["wood_mid"]))

    # --- 屋顶 ---
    oh = 2
    y_ridge = ytop + ridge_drop + 1
    chinese_roof(g, x0 - oh, x1 + oh, z0 - oh, z1 + oh, y_ridge, ridge_drop,
                 curve=1.7, corner_lift=2.6, thick=2, mat=5,
                 colors=[pal["tile_dark"], pal["tile_mid"], pal["tile_hi"]],
                 seed=seed, ridge_along="x")

    # --- 匾额 ---
    if sign:
        g.box(x0 + 1, x1 - 1, ytop - 3, ytop - 1,
              (z1 if facing > 0 else z0 - 1), (z1 + 1 if facing > 0 else z0 + 1),
              4, _rgb(pal["wood_dark"]))
        g.box(x0 + 2, x1 - 2, ytop - 3, ytop - 2,
              (z1 + 1 if facing > 0 else z0 - 2), (z1 + 2 if facing > 0 else z0 - 1),
              29, _rgb(pal["lantern_gold"]))

    # --- 檐下灯笼 ---
    if lantern_n > 0:
        for k in range(lantern_n):
            fx = x0 + 2 + (x1 - x0 - 4) * (k + 0.5) / lantern_n
            zl = (z1 + 2) if facing > 0 else (z0 - 3)
            col = pal["lantern_red"] if (k + seed) % 2 == 0 else pal["lantern_gold"]
            g.box(fx, fx + 1, ytop - 1, ytop + 1, zl, zl + 1, 16, _rgb((30, 26, 24)))
            lantern(g, fx + 0.5, ytop - 3.0, zl + 0.5, 1.5, 2.0, 8, 13, 24,
                    pal["core_warm"], False, False, col)
    return ytop


# --------------------------------------------------------------------------
# 石拱桥
# --------------------------------------------------------------------------
def arch_bridge(g, x0, x1, z0, z1, y_deck, rise=0.0, arches=3, arch_h=8,
                arch_w=9, mat=37, rail_mat=37, railing=True, lantern_pair=True,
                parapet=True, seed=3):
    """石拱桥：桥面沿 z 跨越（沿 x 方向为宽），拱洞沿 z 贯通。

    y_deck 为桥面顶部高度；arches 个拱洞沿 x 排布。
    """
    x0, x1, z0, z1 = int(x0), int(x1), int(z0), int(z1)
    w = x1 - x0
    stone = _rgb(PAL["stone"])
    stone_d = _rgb(PAL["stone_dark"])
    pale = _rgb(PAL["stone_pale"])

    # 桥身
    g.jitter_box(x0, x1, 0, y_deck, z0, z1, mat, stone, 6, seed)
    # 拱洞
    span = w / arches
    for a in range(arches):
        acx = x0 + span * (a + 0.5)
        ah = arch_h - abs(a - (arches - 1) / 2) * 1.6
        aw = min(arch_w, span - 3) * 0.5
        # 半圆拱：以 (acx, 0) 为圆心
        for zz in range(z0, z1):
            for xx in range(x0, x1):
                dx = (xx + 0.5 - acx)
                if abs(dx) > aw:
                    continue
                top = ah * np.sqrt(max(0.0, 1 - (dx / aw) ** 2))
                g.carve(xx, xx + 1, 0, top, zz, zz + 1)
        # 拱券石（描边）
        for zz in range(z0, z1):
            for xx in range(x0, x1):
                dx = (xx + 0.5 - acx)
                if abs(dx) > aw + 1.2:
                    continue
                top = ah * np.sqrt(max(0.0, 1 - (dx / aw) ** 2))
                g.box(xx, xx + 1, top, top + 1.6, zz, zz + 1, mat,
                      pale if (int(dx * 2) % 2 == 0) else stone_d)

    # 桥面缓拱（中间略高）
    for zz in range(z0, z1):
        t = abs(zz + 0.5 - (z0 + z1) * 0.5) / max(0.5, (z1 - z0) * 0.5)
        h = rise * (1 - t ** 1.6)
        yt = y_deck + int(round(h))
        g.box(x0 - 2, x1 + 2, yt - 1, yt, zz, zz + 1, 37, pale)

    # 石栏板
    if railing or parapet:
        for zz in range(z0 - 1, z1 + 1):
            t = abs(zz + 0.5 - (z0 + z1) * 0.5) / max(0.5, (z1 - z0) * 0.5)
            h = rise * (1 - t ** 1.6)
            yt = y_deck + int(round(h))
            for side in (x0 - 2, x1 + 1):
                g.box(side, side + 1, yt, yt + 1, zz, zz + 1, rail_mat, pale)
                if (zz % 3) != 1:
                    g.box(side, side + 1, yt + 1, yt + 3, zz, zz + 1, rail_mat, pale)
                else:
                    g.box(side, side + 1, yt + 1, yt + 2, zz, zz + 1, rail_mat, stone_d)
            # 望柱
            if zz % 6 == 0:
                for side in (x0 - 2, x1 + 1):
                    g.box(side, side + 1, yt, yt + 4, zz, zz + 1, rail_mat, pale)
                    g.box(side, side + 1, yt + 4, yt + 5, zz, zz + 1, rail_mat,
                          _rgb(PAL["ridge_gold"]))

    # 桥头灯柱
    if lantern_pair:
        for zz in (z0 - 2, z1 + 1):
            for side in (x0 - 3, x1 + 2):
                g.box(side, side + 1, 0, y_deck + 8, zz, zz + 1, 3, _rgb(PAL["wood_dark"]))
                lantern(g, side + 0.5, y_deck + 5.4, zz + 0.5, 2.0, 2.8, 8, 13, 24,
                        PAL["core_warm"], True, False, PAL["lantern_red"])
    return y_deck


# --------------------------------------------------------------------------
# 灯楼 / 塔
# --------------------------------------------------------------------------
def lantern_tower(g, cx, cz, y0, levels=4, r0=7.0, dr=1.5, fh=9,
                  mat=3, paper=32, core=24, seed=0, eaves=True,
                  col_style=0):
    """灯楼：层层收分、层层檐口的木构灯塔。"""
    cx, cz = float(cx), float(cz)
    r = float(r0)
    for L in range(levels):
        yb = y0 + L * fh
        yt = yb + fh - 1
        rr = r - L * dr
        if rr < 2:
            break
        # 楼身：柱 + 透光纸壁
        g.tube_y(yb, yt, cx, cz, rr, mat, _rgb(PAL["lacquer_red"]), hollow=True)
        # 内部光核
        g.tube_y(yb + 1, yt - 1, cx, cz, rr - 1.8, core,
                 _rgb(PAL["core_warm"] if L % 2 == 0 else PAL["core_red"]))
        # 四面开敞门洞
        for a in (0, np.pi / 2, np.pi, 1.5 * np.pi):
            dx, dz = np.cos(a), np.sin(a)
            g.carve(cx + dx * (rr - 2.2) - 1.4, cx + dx * (rr + 0.6) + 1.4,
                    yb + 1, yt - 1, cz + dz * (rr - 2.2) - 1.4, cz + dz * (rr + 0.6) + 1.4)
        # 檐口
        if eaves:
            ov = rr + 2.2
            g.box(cx - ov, cx + ov, yt, yt + 1, cz - ov, cz + ov, 5,
                  _rgb(PAL["tile_dark"]))
            g.box(cx - ov, cx + ov, yt + 1, yt + 2, cz - ov, cz + ov, 5,
                  _rgb(PAL["tile_mid"]))
            # 微翘四角
            for sx in (-1, 1):
                for sz in (-1, 1):
                    g.box(cx + sx * ov - 1, cx + sx * ov + 1, yt + 1, yt + 3,
                          cz + sz * ov - 1, cz + sz * ov + 1, 13,
                          _rgb(PAL["ridge_gold"]))
        # 每层环挂小灯
        for k in range(int(rr * 1.6)):
            a = 2 * np.pi * k / max(1, int(rr * 1.6))
            lx = cx + np.cos(a) * (rr + 0.8)
            lz = cz + np.sin(a) * (rr + 0.8)
            col = PAL["lantern_red"] if k % 2 == 0 else PAL["lantern_gold"]
            lantern(g, lx, yt - 3.0, lz, 1.15, 1.7, 8, 13, 24,
                    PAL["core_warm"], False, False, col)
        r = rr
    # 攒尖顶
    yt = y0 + levels * fh - 1
    g.cone(cx, cz, yt + 2, yt + 2 + int(r * 1.5), r + 1.5, 0.6, 5,
           _rgb(PAL["tile_dark"]))
    g.box(cx - 0.5, cx + 0.5, yt + 2 + int(r * 1.5), yt + 4 + int(r * 1.5),
          cz - 0.5, cz + 0.5, 13, _rgb(PAL["ridge_gold"]))
    g.sphere(cx, yt + 5 + int(r * 1.5), cz, 1.2, 24, _rgb(PAL["core_pale"]))
    return yt


# --------------------------------------------------------------------------
# 河灯 / 画舫 / 小船 / 树
# --------------------------------------------------------------------------
def river_lantern(g, cx, cy, cz, r=1.3, paper=8, core=24, col=None):
    """水面漂的莲花灯。"""
    cx, cy, cz = float(cx), float(cy), float(cz)
    g.ellipsoid(cx, cy + 0.6, cz, r, 0.9, r, paper, _rgb(col or PAL["lantern_wm"]))
    g.ellipsoid(cx, cy + 0.6, cz, r * 0.5, 0.5, r * 0.5, core, _rgb(PAL["core_warm"]))
    # 花瓣
    for a in np.linspace(0, 2 * np.pi, 6, endpoint=False):
        g.box(cx + np.cos(a) * r * 0.9 - 0.5, cx + np.cos(a) * r * 0.9 + 0.6,
              cy + 0.4, cy + 1.6,
              cz + np.sin(a) * r * 0.9 - 0.5, cz + np.sin(a) * r * 0.9 + 0.6,
              paper, _rgb(col or PAL["lantern_wm"]))


def boat(g, cx, cy, cz, length=16, width=5, along="x", cabin=False,
         with_lantern=True, seed=0):
    """小舟 / 画舫。"""
    cx, cy, cz = float(cx), float(cy), float(cz)
    hw = width * 0.5
    L = length
    if along == "x":
        x0, x1 = int(cx - L / 2), int(cx + L / 2)
        # 船体
        for i in range(x0, x1):
            t = (i - x0) / max(1, L - 1)
            w2 = hw * (0.35 + 0.65 * np.sin(np.pi * min(1, max(0, t)) ** 0.85))
            g.box(i, i + 1, int(cy), int(cy) + 3, cz - w2, cz + w2, 3,
                  _rgb(PAL["wood_dark"]))
            g.box(i, i + 1, int(cy) + 3, int(cy) + 4, cz - w2 - 0.6, cz + w2 + 0.6, 3,
                  _rgb(PAL["wood_mid"]))
        if cabin:
            g.box(cx - L * 0.22, cx + L * 0.22, cy + 4, cy + 7, cz - hw * 0.8,
                  cz + hw * 0.8, 3, _rgb(PAL["wood_warm"]))
            chinese_roof(g, cx - L * 0.28, cx + L * 0.28, cz - hw - 2, cz + hw + 2,
                         cy + 10, 2.0, curve=1.6, corner_lift=1.6, thick=1, mat=5,
                         colors=[PAL["tile_dark"], PAL["tile_mid"], PAL["tile_hi"]],
                         seed=seed)
            g.box(cx - L * 0.18, cx + L * 0.18, cy + 5, cy + 7, cz - hw * 0.8 - 1,
                  cz - hw * 0.8, 25, _rgb(PAL["core_pale"]))
        if lantern:
            for zz in (cz - hw - 1, cz + hw + 1):
                g.box(cx + L * 0.42, cx + L * 0.42 + 1, cy + 4, cy + 8, zz, zz + 1,
                      3, _rgb(PAL["wood_dark"]))
                lantern(g, cx + L * 0.42 + 0.5, cy + 5.0, zz + 0.5, 1.4, 2.0, 8, 13, 24,
                        PAL["core_warm"], False, False, PAL["lantern_red"])
    return None


def tree(g, cx, cy, cz, h=20, r=5.5, seed=0, style="willow"):
    """树：willow 垂柳 / round 阔叶 / pine 松。"""
    cx, cy, cz = float(cx), float(cy), float(cz)
    rng = np.random.default_rng(seed)
    # 主干
    for i in range(int(h * 0.55)):
        t = i / max(1, h * 0.55)
        w = 1.6 * (1 - t * 0.55)
        g.box(cx - w, cx + w, cy + i, cy + i + 1, cz - w, cz + w, 18,
              _rgb(PAL["bark"]))
    # 枝
    nb = 5
    for k in range(nb):
        a = 2 * np.pi * k / nb + rng.random() * 0.7
        yb = cy + h * (0.36 + 0.22 * rng.random())
        ln = r * (0.8 + 0.5 * rng.random())
        for i in range(int(ln * 1.2)):
            t = i / max(1, ln * 1.2)
            px = cx + np.cos(a) * ln * t
            pz = cz + np.sin(a) * ln * t
            py = yb + 3.2 * np.sin(np.pi * t * 0.75)
            g.box(px - 0.7, px + 0.7, py, py + 1, pz - 0.7, pz + 0.7, 18,
                  _rgb(PAL["bark"]))
    # 冠
    if style == "willow":
        for k in range(26):
            a = 2 * np.pi * rng.random()
            rad = r * (0.55 + 0.6 * rng.random())
            px = cx + np.cos(a) * rad
            pz = cz + np.sin(a) * rad
            py0 = cy + h * (0.5 + 0.22 * rng.random())
            dl = h * (0.28 + 0.30 * rng.random())
            for i in range(int(dl)):
                q = py0 - i
                sw = 0.9 * np.sin(np.pi * min(1, i / max(1, dl)) * 0.9) + 0.35
                g.box(px - sw, px + sw, q, q + 1, pz - sw, pz + sw, 10,
                      _rgb(PAL["leaf_mid"] if (k + i) % 3 else PAL["leaf_dark"]))
    elif style == "pine":
        for L in range(4):
            yy = cy + h * 0.42 + L * h * 0.16
            rr = r * (1.0 - L * 0.21)
            g.cone(cx, cz, yy, yy + h * 0.20, rr, rr * 0.35, 10,
                   _rgb(PAL["leaf_dark"]))
    else:
        for _ in range(int(r * r * 1.3)):
            a = 2 * np.pi * rng.random()
            rad = r * rng.random() ** 0.6
            px = cx + np.cos(a) * rad
            pz = cz + np.sin(a) * rad
            py = cy + h * 0.62 + (r * rng.random() - r * 0.5) * 0.8
            rr = 1.3 + rng.random() * 1.2
            g.ellipsoid(px, py, pz, rr, rr * 0.85, rr, 10,
                        _rgb(PAL["leaf_mid"] if rng.random() > 0.35 else PAL["leaf_dark"]))


def person(g, cx, cy, cz, col=(38, 34, 40), hat=True, h=4):
    """路人剪影（很小，做点景用）。"""
    cx, cy, cz = int(cx), int(cy), int(cz)
    g.box(cx, cx + 1, cy, cy + h - 1, cz, cz + 1, 11, _rgb(col))
    if hat:
        g.box(cx - 1, cx + 2, cy + h - 1, cy + h, cz - 1, cz + 2, 11, _rgb(col))


def flag_banner(g, cx, cy, cz, h=10, w=2.5, col=(150, 40, 34), along="z"):
    """幌子 / 旗。"""
    g.box(cx, cx + 1, cy, cy + h, cz, cz + 1, 3, _rgb(PAL["wood_dark"]))
    if along == "z":
        g.box(cx + 1, cx + 1 + w, cy + h * 0.35, cy + h - 1, cz, cz + 1, 11, _rgb(col))
    else:
        g.box(cx, cx + 1, cy + h * 0.35, cy + h - 1, cz + 1, cz + 1 + w, 11, _rgb(col))


def stall(g, x0, x1, z0, z1, y0, seed=0, awn_col=(160, 60, 46)):
    """摊位：小摊 + 布篷。"""
    x0, x1, z0, z1 = int(x0), int(x1), int(z0), int(z1)
    for xx in (x0, x1 - 1):
        for zz in (z0, z1 - 1):
            g.box(xx, xx + 1, y0, y0 + 5, zz, zz + 1, 3, _rgb(PAL["wood_mid"]))
    g.box(x0, x1, y0 + 5, y0 + 6, z0 - 1, z1 + 1, 11, _rgb(awn_col))
    g.box(x0, x1, y0 + 6, y0 + 7, z0 - 1, z1 + 1, 11, _rgb(tuple(
        int(c * 0.8) for c in awn_col)))
    g.jitter_box(x0 + 1, x1 - 1, y0 + 2, y0 + 3, z0 + 1, z1 - 1, 4,
                 _rgb(PAL["wood_pale"]), 8, seed)
    lantern(g, (x0 + x1) * 0.5, y0 + 3.2, (z0 + z1) * 0.5, 1.1, 1.6, 8, 13, 24,
            PAL["core_warm"], False, False, PAL["lantern_gold"])
