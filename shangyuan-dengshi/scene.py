# -*- coding: utf-8 -*-
"""
scene — 《上元灯市》
====================
上元夜，河上灯市。

构图（自南向北）：
    河面与河灯（前景，含倒影）
      石拱桥 / 埠头 / 画舫
        临河铺面一排（正面朝南，灯火通明）
          市街灯廊 + 牌楼
            第二排屋脊 / 灯楼 / 远处塔影（背景剪影）

坐标：x 东西（沿街），y 上，z 南北（0 = 最北，越大越靠南）
"""

import numpy as np
import voxlib as V
import parts as P
from voxlib import Grid, catmull_rom

# ==========================================================================
# 场景尺寸
# ==========================================================================
NX, NY, NZ = 208, 92, 196

Y_GROUND = 7          # 北岸地面顶
Y_WATER = 6           # 水面顶（水占 y=5,6）
Z_QUAY = 100          # 岸线（z >= 100 为河）
Z_WATER0, Z_WATER1 = 100, 168

# 临河铺面：z 62..98，正面朝 +z
Z_FRONT0, Z_FRONT1 = 62, 98
# 市街走廊：z 44..62
Z_STREET0, Z_STREET1 = 42, 62
# 第二排：z 6..42
Z_BACK0, Z_BACK1 = 6, 42

PAL = P.PAL


# ==========================================================================
def build_background(g):
    """远景：北岸腹地的坡地、树影、远处塔，做出层次与剪影。"""
    rng = np.random.default_rng(7)
    # 缓坡地台
    g.jitter_box(0, NX, 0, Y_GROUND, 0, Z_WATER1 + 8, 1,
                 np.array((72, 76, 84), np.uint8), 6, 11)
    # 河床（水下，深色，避免倒影穿地）
    g.jitter_box(0, NX, 0, Y_WATER - 1, Z_WATER0, Z_WATER1, 1,
                 np.array((24, 30, 38), np.uint8), 5, 12)

    # 远处山影（北端，最暗，几乎只留轮廓）
    for k in range(9):
        cx = 12 + k * 24 + rng.integers(-5, 6)
        h = 26 + rng.integers(-8, 16)
        r = 16 + rng.integers(-4, 7)
        g.ellipsoid(cx, Y_GROUND - 6, rng.integers(-40, -14), r, h * 0.5, r,
                    1, np.array((46, 52, 64), np.uint8))
    # 远塔（北偏东，剪影）
    tx, tz = 158, 12
    for L in range(7):
        rr = 7 - L * 0.75
        yb = Y_GROUND + L * 7
        g.tube_y(yb, yb + 6, tx, tz, rr, 1, np.array((40, 45, 56), np.uint8),
                 hollow=True)
        g.box(tx - rr - 2, tx + rr + 2, yb + 6, yb + 7, tz - rr - 2, tz + rr + 2, 1,
              np.array((38, 43, 53), np.uint8))
    g.cone(tx, tz, Y_GROUND + 49, Y_GROUND + 56, 6, 1, 1,
           np.array((40, 45, 56), np.uint8))


def build_water(g):
    """河面 + 埠头 + 河堤。"""
    stone = np.array(PAL["stone"], np.uint8)
    pale = np.array(PAL["stone_pale"], np.uint8)
    # 水面（单层足够，顶部面 y=7 参与倒影）
    g.box(0, NX, Y_WATER, Y_WATER + 1, Z_WATER0, Z_WATER1, 9, PAL["water"])
    # 河堤石墙
    g.jitter_box(0, NX, 0, Y_GROUND + 1, Z_QUAY, Z_WATER0 + 1, 37, stone, 6, 21)
    # 压顶
    g.box(0, NX, Y_GROUND + 1, Y_GROUND + 2, Z_QUAY, Z_WATER0 + 1, 37, pale)

    # 河埠头（石阶下到水面）—— 两组
    for sx in (24, 138):
        for i in range(6):
            g.box(sx, sx + 12, Y_GROUND - i, Y_GROUND - i + 1,
                  Z_WATER0 - 3 - i, Z_WATER0 + 2 - i, 37,
                  pale if i % 2 == 0 else stone)
        # 埠头两侧矮墙
        for zz in (Z_WATER0 - 3, Z_WATER0 + 2):
            g.box(sx, sx + 1, Y_GROUND - 3, Y_GROUND + 1, zz, zz + 1, 37, pale)
            g.box(sx + 11, sx + 12, Y_GROUND - 3, Y_GROUND + 1, zz, zz + 1, 37, pale)

    # 系船柱 + 灯笼（沿河一排，营造节奏）
    for i, x in enumerate(range(14, NX - 10, 26)):
        zz = Z_QUAY + 1
        g.box(x, x + 2, Y_GROUND + 1, Y_GROUND + 4, zz, zz + 2, 3,
              np.array(PAL["wood_dark"], np.uint8))
        lantern(g, x + 1.0, Y_GROUND + 2.0, zz + 3.6, 1.7, 2.4, 8, 13, 24,
                PAL["core_warm"], True, False,
                PAL["lantern_red"] if i % 2 == 0 else PAL["lantern_gold"])
        # 挑杆
        g.box(x, x + 2, Y_GROUND + 4, Y_GROUND + 5, zz, zz + 4, 3,
              np.array(PAL["wood_mid"], np.uint8))
        g.box(x + 0.5, x + 1.5, Y_GROUND + 4, Y_GROUND + 5.4, zz + 3, zz + 4, 16,
              np.array((40, 36, 32), np.uint8))


def build_front_row(g):
    """临河铺面一排：正面朝向河（+z），灯火通明。"""
    x = 4
    idx = 0
    specs = [
        dict(w=24, storeys=2, floors=(10, 8), seed=11, ridge=5.0, n=3),
        dict(w=20, storeys=3, floors=(9, 7, 6), seed=12, ridge=4.4, n=2),
        dict(w=26, storeys=2, floors=(11, 9), seed=13, ridge=5.6, n=4),
        dict(w=18, storeys=2, floors=(9, 8), seed=14, ridge=4.6, n=2),
        dict(w=28, storeys=3, floors=(10, 8, 7), seed=15, ridge=5.2, n=4),
        dict(w=22, storeys=2, floors=(10, 9), seed=16, ridge=5.0, n=3),
        dict(w=24, storeys=3, floors=(9, 8, 7), seed=17, ridge=4.8, n=3),
        dict(w=20, storeys=2, floors=(10, 8), seed=18, ridge=5.4, n=2),
    ]
    for sp in specs:
        if x + sp["w"] > NX - 4:
            break
        P.shophouse(g, x, x + sp["w"], Z_FRONT0, Z_FRONT1, Y_GROUND,
                    sp["storeys"], sp["floors"], facing=1, ridge_drop=sp["ridge"],
                    seed=sp["seed"], lantern_n=sp["n"])
        # 后侧（朝河）加一段露台栏杆 & 挂灯，让背面也有内容
        for zz in (Z_FRONT1 + 1,):
            g.box(x + 1, x + sp["w"] - 1, Y_GROUND + 1, Y_GROUND + 2, zz, zz + 2, 3,
                  np.array(PAL["wood_mid"], np.uint8))
        x += sp["w"] + 2
        idx += 1
    return idx


def build_back_row(g):
    """第二排：比临河排高，露出屋脊与山墙，构成层层叠叠的剪影。"""
    x = 10
    specs = [
        dict(w=30, storeys=3, floors=(11, 9, 8), seed=31, ridge=5.6, z0=10, z1=40),
        dict(w=26, storeys=2, floors=(12, 10), seed=32, ridge=6.2, z0=12, z1=40),
        dict(w=34, storeys=3, floors=(10, 9, 8), seed=33, ridge=5.4, z0=8, z1=40),
        dict(w=28, storeys=3, floors=(12, 9, 7), seed=34, ridge=6.0, z0=10, z1=38),
        dict(w=30, storeys=2, floors=(13, 10), seed=35, ridge=6.4, z0=8, z1=40),
        dict(w=26, storeys=3, floors=(11, 9, 8), seed=36, ridge=5.2, z0=12, z1=38),
    ]
    for sp in specs:
        if x + sp["w"] > NX - 8:
            break
        P.shophouse(g, x, x + sp["w"], sp["z0"], sp["z1"], Y_GROUND,
                    sp["storeys"], sp["floors"], facing=1, ridge_drop=sp["ridge"],
                    seed=sp["seed"], lantern_n=2, balcony=False)
        x += sp["w"] + 6


def build_street(g):
    """市街走廊：牌楼、灯笼长串、摊位、幌子、行人。"""
    y0 = Y_GROUND
    zc = (Z_STREET0 + Z_STREET1) * 0.5

    # --- 牌楼（跨街木构牌坊）---
    for px in (58, 118):
        P.paifang(g, px, Z_STREET0 - 1, Z_STREET1 + 1, y0, h=17,
                  seed=px, main=(px == 118))

    # --- 街面石板 ---
    g.jitter_box(2, NX - 2, y0 + 1, y0 + 2, Z_STREET0, Z_STREET1, 37,
                 np.array((132, 128, 120), np.uint8), 7, 41)

    # --- 灯笼长串（沿街两道）---
    for zz in (Z_STREET0 + 5, Z_STREET1 - 5):
        for x0 in range(6, NX - 20, 30):
            P.lantern_string(g, (x0, y0 + 14, zz), (x0 + 30, y0 + 14, zz),
                             10, sag=2.6, r=1.25, h=1.9,
                             paper_col=PAL["lantern_red"] if (x0 // 30) % 2 == 0
                             else PAL["lantern_gold"])

    # --- 摊位 ---
    for i, x in enumerate(range(16, NX - 20, 34)):
        P.stall(g, x, x + 11, zc - 8, zc + 2, y0 + 2, seed=50 + i,
                awn_col=(168, 62, 46) if i % 2 else (150, 122, 52))

    # --- 幌子 / 挑旗 ---
    for i, x in enumerate(range(26, NX - 20, 21)):
        P.flag_banner(g, x, y0 + 12, Z_STREET1 - 8, h=11, w=3.0,
                      col=(146, 40, 34) if i % 2 else (44, 76, 92))

    # --- 行人 ---
    rng = np.random.default_rng(6)
    for _ in range(38):
        px = rng.integers(8, NX - 8)
        pz = rng.integers(Z_STREET0 + 2, Z_STREET1 - 2)
        c = [(36, 32, 38), (52, 40, 44), (30, 36, 44)][int(rng.integers(0, 3))]
        P.person(g, px, y0 + 2, pz, col=c, hat=rng.random() > 0.4,
                 h=4 + int(rng.integers(0, 2)))


def build_tower(g):
    """主景灯楼：六角/圆形层层收分，中景偏右的高点。"""
    P.lantern_tower(g, 96, 26, Y_GROUND, levels=5, r0=9.5, dr=1.35, fh=10,
                    seed=9, eaves=True, col_style=1)
    # 底部台基与围栏
    g.tube_y(Y_GROUND + 1, Y_GROUND + 2, 96, 26, 12.5, 37,
             np.array(PAL["stone_pale"], np.uint8))
    for k in range(12):
        a = 2 * np.pi * k / 12
        lx = 96 + np.cos(a) * 12.2
        lz = 26 + np.sin(a) * 12.2
        P.lantern(g, lx, Y_GROUND + 2.4, lz, 1.35, 1.9, 8, 13, 24,
                  PAL["core_warm"], False, False,
                  PAL["lantern_red"] if k % 2 == 0 else PAL["lantern_gold"])


def build_bridge(g):
    """石拱桥：横跨河面，桥上有亭与灯，桥洞下可行船。"""
    x0, x1 = 34, 84
    z0, z1 = Z_WATER0 - 10, Z_WATER1 + 6
    y_deck = 16
    P.arch_bridge(g, x0, x1, z0, z1, y_deck, rise=4, arches=3, arch_h=11,
                  arch_w=12, seed=5)

    # 桥上小亭（中央）
    cx, cz = (x0 + x1) * 0.5, (z0 + z1) * 0.5
    P.pavilion(g, cx, cz, y_deck + 5, r=7.0, h=9, seed=3,
               lanterns=True)

    # 桥面行人
    rng = np.random.default_rng(8)
    for _ in range(9):
        px = rng.integers(x0 + 2, x1 - 2)
        pz = rng.integers(z0 + 3, z1 - 3)
        P.person(g, px, y_deck + 1, pz, col=(40, 34, 40), hat=True, h=4)

    # 桥下小船
    P.boat(g, cx - 6, Y_WATER + 1, z0 - 8, length=13, width=4.5, cabin=False,
           with_lantern=True, seed=2)


def build_river_life(g):
    """河面：画舫、小船、莲花河灯。"""
    rng = np.random.default_rng(3)
    # 画舫（右前，构图重点）
    P.boat(g, 150, Y_WATER + 1, 138, length=22, width=7, along="x", cabin=True,
           with_lantern=True, seed=4)
    # 小船散布
    for (bx, bz, ln, wd, cb, sd) in [(56, 132, 12, 4.0, False, 5),
                                     (110, 152, 14, 4.5, False, 6),
                                     (24, 118, 11, 3.6, False, 7),
                                     (176, 122, 13, 4.2, True, 8)]:
        P.boat(g, bx, Y_WATER + 1, bz, length=ln, width=wd, cabin=cb,
               with_lantern=True, seed=sd)
    # 莲花河灯（成片，前景亮点）
    for _ in range(120):
        lx = rng.integers(6, NX - 6)
        lz = rng.integers(Z_WATER0 + 6, Z_WATER1 - 4)
        # 避开船体
        if 140 < lx < 162 and 128 < lz < 148:
            continue
        col = [PAL["lantern_wm"], PAL["lantern_red"], PAL["lantern_gold"],
               (255, 210, 170)][int(rng.integers(0, 4))]
        P.river_lantern(g, lx, Y_WATER + 1, lz, 1.0 + rng.random() * 0.7,
                        paper=8, core=24, col=col)


def build_ground_detail(g):
    """岸上细节：树、石灯、井、灯笼架，填补空白并做出远近层次。"""
    rng = np.random.default_rng(9)
    # 岸边垂柳
    for x in (8, 30, 92, 132, 168, 196):
        P.tree(g, x, Y_GROUND + 1, Z_QUAY - 4, h=22 + int(rng.integers(0, 8)),
               r=6.5, seed=x, style="willow")
    # 后排阔叶树
    for x in (22, 74, 150, 190):
        P.tree(g, x, Y_GROUND + 1, 46, h=19 + int(rng.integers(0, 6)),
               r=6.0, seed=x + 100, style="round")
    # 石灯笼点缀
    for i, x in enumerate(range(20, NX - 16, 40)):
        P.stone_lamp(g, x, Y_GROUND + 1, Z_QUAY - 1, h=6,
                     lit=(i % 2 == 0))


def build(g=None, verbose=False):
    """生成完整场景网格。"""
    if g is None:
        g = Grid(NX, NY, NZ)
    t0 = __import__("time").time()
    steps = [
        ("background", build_background),
        ("water", build_water),
        ("front row", build_front_row),
        ("back row", build_back_row),
        ("tower", build_tower),
        ("street", build_street),
        ("bridge", build_bridge),
        ("river", build_river_life),
        ("detail", build_ground_detail),
    ]
    for name, fn in steps:
        fn(g)
        if verbose:
            print("  %-12s nonair=%d  (%.1fs)" % (name, int((g.mat != 0).sum()),
                                                  __import__("time").time() - t0))
    return g


# ==========================================================================
# 相机
# ==========================================================================
def cameras():
    return {
        # 主视角：河上偏左，斜看灯市（层次最厚）
        "hero": dict(eye=(-14, 46, 190), target=(104, 26, 56), fov=40),
        # 河对岸平视：桥为前景
        "bridge": dict(eye=(20, 30, 186), target=(90, 22, 70), fov=46),
        # 街内低视点：灯串与牌楼纵深
        "street": dict(eye=(10, 13, 52), target=(150, 20, 50), fov=62),
        # 高处俯瞰全景
        "aerial": dict(eye=(-10, 78, 176), target=(110, 20, 60), fov=46),
        # 近景：河灯与画舫
        "near": dict(eye=(120, 15, 168), target=(150, 14, 138), fov=44),
    }
