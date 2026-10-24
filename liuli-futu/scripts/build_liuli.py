# -*- coding: utf-8 -*-
"""
《琉璃浮屠》Blender 体素巨作
用法:
  blender -b -P build_liuli.py -- --hero
  blender -b -P build_liuli.py -- --close
  blender -b -P build_liuli.py -- --top
  blender -b -P build_liuli.py -- --save
"""
import bpy
import bmesh
import math
import random
import sys
import os
from mathutils import Vector, Color

# ─── CLI ────────────────────────────────────────────────────
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
MODE = argv[0] if argv else "--hero"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(bpy.data.filepath or __file__))), "renders")
if not os.path.isdir(OUT_DIR):
    OUT_DIR = "/Users/thysummer/工作流/code/体素/liuli-futu/renders"
BLEND_DIR = "/Users/thysummer/工作流/code/体素/liuli-futu/blend"

W, H = 1920, 1080
VOX = 1.0

# ─── 调色板 ─────────────────────────────────────────────────
PAL = {
    "void":        (0.008, 0.016, 0.04, 1),
    "nebula":      (0.04, 0.09, 0.18, 1),
    "rock_dk":     (0.08, 0.10, 0.16, 1),
    "rock":        (0.14, 0.18, 0.28, 1),
    "rock_lt":     (0.22, 0.28, 0.40, 1),
    "crystal":     (0.35, 0.55, 0.68, 1),
    "crystal_lt":  (0.55, 0.78, 0.92, 1),
    "crystal_hot": (0.78, 0.95, 1.00, 1),
    "jade_dk":     (0.06, 0.28, 0.24, 1),
    "jade":        (0.10, 0.42, 0.36, 1),
    "jade_lt":     (0.18, 0.55, 0.46, 1),
    "gold":        (0.72, 0.55, 0.22, 1),
    "gold_lt":     (0.92, 0.75, 0.38, 1),
    "window":      (1.00, 0.62, 0.20, 1),
    "window_lt":   (1.00, 0.82, 0.45, 1),
    "beam":        (1.00, 0.94, 0.75, 1),
    "water":       (0.45, 0.75, 0.95, 1),
    "foam":        (0.85, 0.96, 1.00, 1),
    "moss":        (0.14, 0.32, 0.26, 1),
    "pine_dk":     (0.05, 0.18, 0.15, 1),
    "pine":        (0.08, 0.28, 0.22, 1),
    "wood":        (0.28, 0.16, 0.10, 1),
    "plaster":     (0.75, 0.70, 0.60, 1),
}

EMISSIVE = {"window", "window_lt", "beam", "foam", "crystal_hot", "gold_lt"}
GLOWISH = {"crystal", "crystal_lt", "crystal_hot", "window", "window_lt", "beam", "foam", "gold", "gold_lt"}


def rng(a, b=0.0):
    # stable hash noise
    s = math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return s - math.floor(s)


# ─── 体素场 ─────────────────────────────────────────────────
class Vox:
    def __init__(self):
        self.m = {}

    def set(self, x, y, z, mat):
        if mat is None:
            return
        self.m[(int(x), int(y), int(z))] = mat

    def get(self, x, y, z):
        return self.m.get((int(x), int(y), int(z)))

    def has(self, x, y, z):
        return (int(x), int(y), int(z)) in self.m

    def box(self, x0, y0, z0, x1, y1, z1, mat):
        for x in range(min(x0, x1), max(x0, x1) + 1):
            for y in range(min(y0, y1), max(y0, y1) + 1):
                for z in range(min(z0, z1), max(z0, z1) + 1):
                    self.set(x, y, z, mat)

    def count(self):
        return len(self.m)


# ─── 场景构建 ───────────────────────────────────────────────
def build_island(v: Vox):
    """倒锥晶岩浮岛"""
    R = 28
    for x in range(-R, R + 1):
        for z in range(-R, R + 1):
            d2 = (x / R) ** 2 + (z / R) ** 2
            wob = 0.08 * math.sin(x * 0.4) * math.cos(z * 0.35)
            if d2 + wob > 1.0:
                continue
            edge = d2 > 0.72
            # 倒锥深度
            depth = int((1.0 - d2) * 22 + rng(x, z) * 3)
            for y in range(0, -depth, -1):
                t = (-y) / max(1, depth)
                if t < 0.15:
                    mat = "moss" if not edge else "rock"
                elif t < 0.45:
                    n = rng(x * 1.3, z + y)
                    mat = "rock_lt" if n > 0.6 else "rock"
                else:
                    n = rng(x * 1.7, z + y * 0.5)
                    mat = "rock_dk" if n > 0.4 else "rock"
                v.set(x, y, z, mat)
            # 顶面苔
            if d2 < 0.85:
                n = rng(x, z)
                v.set(x, 1, z, "moss" if n > 0.3 else "rock")

    # 晶簇尖（岛缘 + 倒悬晶根）
    for i in range(55):
        a = rng(i, 1) * math.tau
        r = 6 + rng(i, 2) * 20
        x = int(math.cos(a) * r)
        z = int(math.sin(a) * r)
        if (x / R) ** 2 + (z / R) ** 2 > 0.95:
            continue
        d2 = (x / R) ** 2 + (z / R) ** 2
        depth = int((1.0 - d2) * 22)
        if depth < 3:
            continue
        y0 = -depth + 1
        h = 4 + int(rng(i, 3) * 14)  # 悬垂更长
        rad = 1 + int(rng(i, 4) * 2)
        for k in range(h):
            rr = max(0, rad - k // 4)
            for dx in range(-rr, rr + 1):
                for dz in range(-rr, rr + 1):
                    if dx * dx + dz * dz > rr * rr + 0.2:
                        continue
                    mat = "crystal_hot" if k > h - 2 else ("crystal_lt" if k > h * 0.45 else "crystal")
                    v.set(x + dx, y0 - k, z + dz, mat)

    # 石径
    for i in range(18):
        x = 16 - i
        z = 10 - i // 2
        v.set(x, 2, z, "rock_lt")
        v.set(x, 2, z + 1, "rock")


def build_pavilion(v: Vox, cx, y, cz, hw=3, floors=1):
    """侧亭 / 小殿"""
    v.box(cx - hw - 1, y, cz - hw - 1, cx + hw + 1, y, cz + hw + 1, "rock_lt")
    for f in range(floors):
        yy = y + 1 + f * 6
        for x in range(cx - hw, cx + hw + 1):
            for z in range(cz - hw, cz + hw + 1):
                shell = abs(x - cx) == hw or abs(z - cz) == hw
                if not shell:
                    continue
                pillar = (abs(x - cx) == hw and abs(z - cz) == hw) or (
                    abs(x - cx) == hw and z == cz
                ) or (abs(z - cz) == hw and x == cx)
                for dy in range(5):
                    if pillar:
                        v.set(x, yy + dy, z, "wood")
                    elif dy in (0, 4):
                        v.set(x, yy + dy, z, "wood")
                    else:
                        v.set(x, yy + dy, z, "window")
        # 重檐
        roof_y = yy + 5
        for x in range(cx - hw - 2, cx + hw + 3):
            for z in range(cz - hw - 2, cz + hw + 3):
                corner = abs(x - cx) == hw + 2 and abs(z - cz) == hw + 2
                edge = abs(x - cx) == hw + 2 or abs(z - cz) == hw + 2
                ry = roof_y + (1 if corner else 0)
                v.set(x, ry, z, "jade_dk" if edge else "jade")
                if edge:
                    v.set(x, ry - 1, z, "jade_dk")
                if corner:
                    v.set(x, ry + 1, z, "gold")
                    v.set(x + (1 if x > cx else -1), ry + 1, z, "gold_lt")
    # 宝顶
    v.set(cx, y + 1 + floors * 6 + 6, cz, "gold")
    v.set(cx, y + 1 + floors * 6 + 7, cz, "gold_lt")


def build_pine(v: Vox, x, y, z, size=1.0):
    h = int(8 * size + rng(x, z) * 4)
    cx, cz = x, z
    for i in range(h):
        yy = y + 1 + i
        v.set(cx, yy, cz, "wood")
        if i % 2 == 0 and rng(x + i, z) > 0.55:
            cx += 1 if rng(i, x) > 0.5 else -1
        if i > h * 0.3 and i % 2 == 0:
            rad = max(1, int((1 - i / h) * 3.5 * size + 1))
            for dx in range(-rad, rad + 1):
                for dz in range(-rad, rad + 1):
                    if dx * dx + dz * dz > rad * rad:
                        continue
                    mat = "pine" if rng(x + dx, z + dz + i) > 0.35 else "pine_dk"
                    v.set(cx + dx, yy + 1, cz + dz, mat)
    v.set(cx, y + h + 1, cz, "pine")


def build_pagoda(v: Vox, cx, base_y, cz, floors=9):
    """九层琉璃浮屠 —— 逐层收分、重檐飞角、透窗灯暖"""
    # 台基
    v.box(cx - 12, base_y, cz - 12, cx + 12, base_y, cz + 12, "rock_lt")
    v.box(cx - 11, base_y + 1, cz - 11, cx + 11, base_y + 1, cz + 11, "rock_lt")
    for i, r in enumerate((10, 8)):
        yy = base_y + 2 + i
        for x in range(cx - r, cx + r + 1):
            for z in range(cz - r, cz + r + 1):
                if max(abs(x - cx), abs(z - cz)) == r:
                    v.set(x, yy, z, "gold" if i == 0 else "rock_lt")
                else:
                    v.set(x, yy, z, "plaster")

    y = base_y + 4
    hw = 9
    for f in range(floors):
        # 楼板
        for x in range(cx - hw, cx + hw + 1):
            for z in range(cz - hw, cz + hw + 1):
                v.set(x, y, z, "wood")

        wall_h = 5
        for x in range(cx - hw, cx + hw + 1):
            for z in range(cz - hw, cz + hw + 1):
                on = abs(x - cx) == hw or abs(z - cz) == hw
                if not on:
                    continue
                corner = abs(x - cx) == hw and abs(z - cz) == hw
                pillar = corner or (abs(x - cx) == hw and z == cz) or (abs(z - cz) == hw and x == cx)
                for dy in range(1, wall_h + 1):
                    if pillar:
                        mat = "jade_lt" if f % 2 == 0 else "jade"
                    elif dy in (1, wall_h):
                        mat = "jade_dk"
                    else:
                        # 中段透窗
                        mat = "window" if (dy in (2, 3, 4) and not corner) else "jade"
                        if dy == 3 and rng(x, z + f) > 0.7:
                            mat = "window_lt"
                    v.set(x, y + dy, z, mat)

        # 平座栏杆
        for x in range(cx - hw - 1, cx + hw + 2):
            for z in range(cz - hw - 1, cz + hw + 2):
                outer = abs(x - cx) == hw + 1 or abs(z - cz) == hw + 1
                inner = abs(x - cx) <= hw and abs(z - cz) <= hw
                if outer and not inner:
                    v.set(x, y + 1, z, "gold")

        # 重檐（外扩 + 四角起翘）
        ew, ed = hw + 2, hw + 2
        for x in range(cx - ew, cx + ew + 1):
            for z in range(cz - ed, cz + ed + 1):
                corner = abs(x - cx) == ew and abs(z - cz) == ed
                edge = abs(x - cx) == ew or abs(z - cz) == ed
                lift = 2 if corner else 0
                yy = y + wall_h + 1 + lift
                v.set(x, yy, z, "jade_dk" if edge else "jade_lt")
                if edge:
                    v.set(x, yy - 1, z, "jade_dk")
                if corner:
                    for k in range(lift):
                        v.set(x, yy - lift + k, z, "jade_dk")
                    sx = 1 if x > cx else -1
                    sz = 1 if z > cz else -1
                    v.set(x + sx, yy + 1, z, "gold_lt")
                    v.set(x, yy + 1, z + sz, "gold_lt")
                    # 檐角灯
                    v.set(x - sx, y + 3, z - sz, "window")
        # 上收檐
        for x in range(cx - hw, cx + hw + 1):
            for z in range(cz - hw, cz + hw + 1):
                edge = abs(x - cx) == hw or abs(z - cz) == hw
                v.set(x, y + wall_h + 3, z, "jade_dk" if edge else "jade")

        y += wall_h + 4
        hw = max(3, hw - 1)

    # 宝顶 + 光核
    for i in range(6):
        v.set(cx, y + i, cz, "gold_lt" if i % 2 else "gold")
    for i in range(3):
        v.set(cx, y + 6 + i, cz, "beam")
    v.set(cx, y + 9, cz, "beam")
    return y + 9


def build_light_column(v: Vox, cx, top_y, cz, height=36):
    """塔心细光芯（体积光晕由 BeamVolume 完成）"""
    for i in range(height):
        y = top_y + 1 + i
        # 越高越细，末段收束
        w = 1 if i < 20 else (0 if i < 28 else None)
        if w is None:
            continue
        if i % 3 == 0 and i > 8:
            w = 0
        for dx in range(-w, w + 1):
            for dz in range(-w, w + 1):
                v.set(cx + dx, y, cz + dz, "beam")


def build_starfall(v: Vox, x, z, y_top, length=36):
    for i in range(length):
        y = y_top - i
        xx = x + int(math.sin(i * 0.3 + x) * 0.7)
        v.set(xx, y, z, "water")
        v.set(xx, y, z + 1, "foam" if i % 3 == 0 else "water")
        v.set(xx, y, z - 1, "foam" if i % 4 == 0 else "water")
    for dx in range(-1, 2):
        for dz in range(-1, 2):
            v.set(x + dx, y_top + 1, z + dz, "foam")


def build_clouds(v: Vox):
    """极淡的浮云碎晶，不做大团块"""
    for i in range(14):
        a = rng(i, 5) * math.tau
        r = 30 + rng(i, 6) * 25
        cx = int(math.cos(a) * r)
        cz = int(math.sin(a) * r)
        cy = int(8 + rng(i, 7) * 30)
        for dx in range(-3, 4):
            for dy in range(-1, 2):
                for dz in range(-3, 4):
                    if dx * dx + dy * dy * 3 + dz * dz > 8:
                        continue
                    v.set(cx + dx, cy + dy, cz + dz, "plaster" if rng(i + dx, dz) > 0.6 else "rock_lt")


def setup_stars():
    """远景星点"""
    random.seed(7)
    verts, faces, cols = [], [], []
    for i in range(180):
        a = rng(i, 9) * math.tau
        ph = rng(i, 10) * math.pi
        r = 400 + rng(i, 11) * 200
        x = r * math.sin(ph) * math.cos(a)
        y = r * math.cos(ph) * 0.5 + 80
        z = r * math.sin(ph) * math.sin(a)
        s = 1.2 + rng(i, 12) * 2.5
        base = len(verts)
        for dx, dy, dz in ((-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)):
            verts.append((x + dx, y + dz, z + dy))  # billboard-ish
            c = 0.7 + rng(i, 13) * 0.3
            cols.append((c, c, min(1.0, c + 0.1), 1))
        faces.append((base, base + 1, base + 2, base + 3))
    me = bpy.data.meshes.new("Stars")
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new("Stars", me)
    bpy.context.collection.objects.link(obj)
    attr = me.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    for i, c in enumerate(cols):
        attr.data[i].color = c
    mat = bpy.data.materials.new("StarMat")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 8.0
    vc = nt.nodes.new("ShaderNodeVertexColor")
    vc.layer_name = "Col"
    nt.links.new(vc.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    me.materials.append(mat)


def build_world():
    v = Vox()
    build_island(v)
    # 浮屠置于岛心偏后
    top = build_pagoda(v, 0, 3, -2, floors=9)
    # 光柱只靠体积光与射灯，不再堆体素
    # 侧亭与松
    build_pavilion(v, -16, 2, 10, hw=3, floors=1)
    build_pavilion(v, 14, 2, 12, hw=2, floors=1)
    for px, pz, s in [(-10, -12, 1.2), (12, -14, 1.0), (-18, 2, 0.9), (18, 4, 1.0), (6, 14, 0.85)]:
        build_pine(v, px, 2, pz, s)
    # 灯瀑
    build_starfall(v, 18, 16, 0, 40)
    build_starfall(v, -20, 8, 0, 36)
    build_starfall(v, 8, -22, 0, 42)
    return v, top


# ─── 网格烘焙（面剔除） ─────────────────────────────────────
FACES = [
    ((0, 1, 0), 1.0),
    ((0, -1, 0), 0.42),
    ((1, 0, 0), 0.78),
    ((-1, 0, 0), 0.62),
    ((0, 0, 1), 0.88),
    ((0, 0, -1), 0.70),
]


def bake_mesh(vox: Vox, want):
    """want: 'solid' | 'emissive'"""
    verts, faces, cols = [], [], []
    vi = 0
    for (x, y, z), mat in vox.m.items():
        is_em = mat in EMISSIVE
        if want == "emissive" and not is_em:
            continue
        if want == "solid" and is_em:
            continue
        r, g, b, a = PAL.get(mat, (1, 0, 1, 1))
        jitter = 0.92 + rng(x * 1.1 + y * 0.7, z) * 0.14
        for (n, shade) in FACES:
            nx, ny, nz = x + n[0], y + n[1], z + n[2]
            if vox.has(nx, ny, nz):
                nb = vox.get(nx, ny, nz)
                # 同组遮挡
                if (want == "emissive") == (nb in EMISSIVE):
                    continue
            # 四角
            if n[1] != 0:
                corners = [(0, 1, 0), (1, 1, 0), (1, 1, 1), (0, 1, 1)] if n[1] > 0 else [(0, 0, 1), (1, 0, 1), (1, 0, 0), (0, 0, 0)]
            elif n[0] != 0:
                corners = [(1, 0, 1), (1, 0, 0), (1, 1, 0), (1, 1, 1)] if n[0] > 0 else [(0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)]
            else:
                corners = [(1, 0, 1), (0, 0, 1), (0, 1, 1), (1, 1, 1)] if n[2] > 0 else [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0)]
            base = vi
            for cx, cy, cz in corners:
                # Blender Z-up: (x, z, y) → (X, Y, Z)
                verts.append(((x + cx) * VOX, (z + cz) * VOX, (y + cy) * VOX))
                s = 1.0 if is_em else shade
                top = 1.06 if n[1] == 1 else 1.0
                cols.append((r * s * top * jitter, g * s * top * jitter, b * s * top * jitter, 1.0))
                vi += 1
            faces.append((base, base + 1, base + 2, base + 3))
    return verts, faces, cols


def make_object(name, verts, faces, cols, emissive=False, strength=6.0):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    # 顶点色
    attr = me.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    for i, c in enumerate(cols):
        attr.data[i].color = c

    mat = bpy.data.materials.new(name + "_mat")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if emissive:
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Strength"].default_value = strength
        vc = nt.nodes.new("ShaderNodeVertexColor")
        vc.layer_name = "Col"
        nt.links.new(vc.outputs["Color"], em.inputs["Color"])
        nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    else:
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.inputs["Roughness"].default_value = 0.55
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.05
        vc = nt.nodes.new("ShaderNodeVertexColor")
        vc.layer_name = "Col"
        nt.links.new(vc.outputs["Color"], bsdf.inputs["Base Color"])
        # 轻微自发光提亮边缘色
        if "Emission Color" in bsdf.inputs:
            nt.links.new(vc.outputs["Color"], bsdf.inputs["Emission Color"])
            bsdf.inputs["Emission Strength"].default_value = 0.08
        nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    me.materials.append(mat)
    return obj


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def setup_world():
    world = bpy.data.worlds.new("Void")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 0.25
    # 星云噪声 + 星点
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 1.8
    tex.inputs["Detail"].default_value = 8.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = PAL["void"]
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[1].color = PAL["nebula"]
    ramp.color_ramp.elements[1].position = 0.75
    nt.links.new(tex.outputs["Fac"], ramp.inputs["Fac"])
    # 星点：高频 voronoi
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 120.0
    vor.feature = "F1"
    ramp2 = nt.nodes.new("ShaderNodeValToRGB")
    ramp2.color_ramp.elements[0].position = 0.0
    ramp2.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp2.color_ramp.elements[1].position = 0.04
    ramp2.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs["Distance"], ramp2.inputs["Fac"])
    add = nt.nodes.new("ShaderNodeMix")
    if hasattr(add, "data_type"):
        add.data_type = "RGBA"
        add.blend_type = "ADD"
        add.inputs["Factor"].default_value = 1.0
        # Mix RGBA sockets
        try:
            nt.links.new(ramp.outputs["Color"], add.inputs["A"])
            nt.links.new(ramp2.outputs["Color"], add.inputs["B"])
            nt.links.new(add.outputs["Result"], bg.inputs["Color"])
        except Exception:
            nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    else:
        add.blend_type = "ADD"
        add.inputs["Fac"].default_value = 1.0
        nt.links.new(ramp.outputs["Color"], add.inputs["Color1"])
        nt.links.new(ramp2.outputs["Color"], add.inputs["Color2"])
        nt.links.new(add.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])


def setup_lights(top_y):
    # 月光冷主光
    bpy.ops.object.light_add(type="SUN", location=(-40, 30, 60))
    sun = bpy.context.object
    sun.data.energy = 2.5
    sun.data.color = (0.65, 0.75, 1.0)
    sun.rotation_euler = (math.radians(50), math.radians(-25), math.radians(-30))

    # 塔心点光
    bpy.ops.object.light_add(type="POINT", location=(0, 0, top_y * VOX + 8))
    p = bpy.context.object
    p.data.energy = 4000
    p.data.color = (1.0, 0.85, 0.55)
    p.data.shadow_soft_size = 4.0

    # 窗火辅助
    bpy.ops.object.light_add(type="AREA", location=(0, 12, 18))
    a = bpy.context.object
    a.data.energy = 800
    a.data.size = 12
    a.data.color = (1.0, 0.7, 0.35)

    # 冷补光
    bpy.ops.object.light_add(type="AREA", location=(25, -20, 30))
    b = bpy.context.object
    b.data.energy = 400
    b.data.size = 20
    b.data.color = (0.4, 0.55, 0.9)


def setup_volume(top_y=80):
    """环境薄雾 + 光柱体积感"""
    bpy.ops.mesh.primitive_cube_add(size=160, location=(0, 0, 20))
    vol = bpy.context.object
    vol.name = "VolumeFog"
    mat = bpy.data.materials.new("FogMat")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    sc = nt.nodes.new("ShaderNodeVolumeScatter")
    sc.inputs["Color"].default_value = (0.25, 0.35, 0.55, 1)
    sc.inputs["Density"].default_value = 0.004
    nt.links.new(sc.outputs["Volume"], out.inputs["Volume"])
    vol.data.materials.append(mat)
    vol.display_type = "WIRE"

    # 光柱体积（轻）
    bpy.ops.mesh.primitive_cylinder_add(radius=3.5, depth=70, location=(0, 0, 55))
    beam = bpy.context.object
    beam.name = "BeamVolume"
    mat2 = bpy.data.materials.new("BeamMat")
    mat2.use_nodes = True
    nt2 = mat2.node_tree
    nt2.nodes.clear()
    out2 = nt2.nodes.new("ShaderNodeOutputMaterial")
    sc2 = nt2.nodes.new("ShaderNodeVolumeScatter")
    sc2.inputs["Color"].default_value = (1.0, 0.85, 0.55, 1)
    sc2.inputs["Density"].default_value = 0.012
    nt2.links.new(sc2.outputs["Volume"], out2.inputs["Volume"])
    beam.data.materials.append(mat2)
    beam.display_type = "WIRE"
    beam.visible_shadow = False

    # 实体光柱芯
    bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=55, location=(0, 0, top_y * VOX + 22))
    core = bpy.context.object
    core.name = "BeamCore"
    mat3 = bpy.data.materials.new("BeamCoreMat")
    mat3.use_nodes = True
    nt3 = mat3.node_tree
    nt3.nodes.clear()
    out3 = nt3.nodes.new("ShaderNodeOutputMaterial")
    em3 = nt3.nodes.new("ShaderNodeEmission")
    em3.inputs["Color"].default_value = (1.0, 0.95, 0.75, 1)
    em3.inputs["Strength"].default_value = 25.0
    nt3.links.new(em3.outputs["Emission"], out3.inputs["Surface"])
    core.data.materials.append(mat3)

    # 向上射灯制造神光
    bpy.ops.object.light_add(type="SPOT", location=(0, 0, 25))
    spot = bpy.context.object
    spot.name = "BeamSpot"
    spot.data.energy = 20000
    spot.data.color = (1.0, 0.88, 0.6)
    spot.data.spot_size = math.radians(18)
    spot.data.spot_blend = 0.4
    spot.rotation_euler = (0, 0, 0)


def setup_camera(mode):
    bpy.ops.object.camera_add()
    cam = bpy.context.object
    if mode == "--hero":
        cam.data.lens = 35
        cam.location = (95, -135, 50)
        target = Vector((0, 0, 38))
    elif mode == "--close":
        cam.data.lens = 50
        cam.location = (35, -55, 35)
        target = Vector((0, 0, 22))
    elif mode == "--top":
        cam.data.lens = 32
        cam.location = (25, -40, 130)
        target = Vector((0, 0, 20))
    elif mode == "--beam":
        cam.data.lens = 30
        cam.location = (80, -90, 100)
        target = Vector((0, 0, 70))
    elif mode == "--draft":
        cam.data.lens = 35
        cam.location = (95, -135, 50)
        target = Vector((0, 0, 38))
    else:
        cam.data.lens = 35
        cam.location = (95, -135, 50)
        target = Vector((0, 0, 38))
    direction = target - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


def setup_render(mode):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 96 if mode != "--draft" else 24
    sc.cycles.use_denoising = True
    sc.render.resolution_x = W
    sc.render.resolution_y = H
    sc.render.film_transparent = False
    # 尝试 GPU
    try:
        sc.cycles.device = "GPU"
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
    except Exception:
        sc.cycles.device = "CPU"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Punchy"


def main():
    print("[琉璃浮屠] building...", MODE)
    clear_scene()
    v, top_y = build_world()
    print("[琉璃浮屠] voxels", v.count())

    solid_v, solid_f, solid_c = bake_mesh(v, "solid")
    em_v, em_f, em_c = bake_mesh(v, "emissive")
    print("[琉璃浮屠] solid tris", len(solid_f), "emissive quads", len(em_f))

    make_object("StupaSolid", solid_v, solid_f, solid_c, emissive=False)
    make_object("StupaGlow", em_v, em_f, em_c, emissive=True, strength=12.0)

    setup_world()
    setup_lights(top_y)
    setup_volume(top_y)
    setup_camera(MODE)
    setup_render(MODE)

    if MODE == "--save":
        path = os.path.join(BLEND_DIR, "琉璃浮屠.blend")
        os.makedirs(BLEND_DIR, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=path)
        print("[琉璃浮屠] saved", path)
        return

    name = {
        "--hero": "hero",
        "--close": "close",
        "--top": "top",
        "--beam": "beam",
        "--draft": "draft",
    }.get(MODE, "hero")
    out = os.path.join(OUT_DIR, f"{name}.png")
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print("[琉璃浮屠] rendered", out)


if __name__ == "__main__":
    main()
