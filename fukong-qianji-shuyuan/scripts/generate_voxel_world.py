#!/usr/bin/env python3
"""
Procedural Voxel & MagicaVoxel (.vox) Generator for:
《浮空千机书院》(The Floating Clockwork Academy / Armillary Sanctuary)

Generates:
1. /Users/thysummer/工作流/code/体素/fukong-qianji-shuyuan/浮空千机书院.vox (MagicaVoxel standard format)
2. /Users/thysummer/工作流/code/体素/fukong-qianji-shuyuan/voxel_data.js (Compact RLE/typed data for WebGL/Three.js & Offline Renderer)
3. /Users/thysummer/工作流/code/体素/fukong-qianji-shuyuan/preview_renders.py (High-res isometric software raycaster for visual verification)
"""

import math
import struct
import json
import os
import random

random.seed(42)

# Grid dimensions for .vox (126 x 126 x 126 fits in a single standard MagicaVoxel SIZE chunk)
# Wait: we can also build a rich 126x126x126 master grid where every single voxel is packed with detail!
NX, NY, NZ = 126, 126, 126  # X: width, Y: height (up in our logic, converted to Z-up for .vox), Z: depth

# Palette definition (1-indexed, up to 255 colors)
# Each entry: (R, G, B, mat_type, emit,rough,metal,alpha, name)
# mat_type: 0=matte/stone/wood, 1=metal/brass/gold, 2=emissive, 3=glass/water/jade
PALETTE_DEFS = [
    # 0: unused placeholder
    (0, 0, 0, 0, 0.0, 1.0, 0.0, 1.0, "Air"),
    
    # 1-8: Deep玄武岩 & 浮空山体 (Floating Island Basalt & Cliffs)
    (28, 31, 42, 0, 0.0, 0.9, 0.05, 1.0, "Basalt Abyss"),
    (38, 42, 56, 0, 0.0, 0.9, 0.05, 1.0, "Basalt Dark"),
    (50, 56, 72, 0, 0.0, 0.85, 0.05, 1.0, "Basalt Mid"),
    (65, 72, 90, 0, 0.0, 0.85, 0.05, 1.0, "Basalt Light"),
    (82, 88, 106, 0, 0.0, 0.8, 0.05, 1.0, "Slate Grey"),
    (58, 52, 64, 0, 0.0, 0.85, 0.05, 1.0, "Warm Cliff Dark"),
    (76, 68, 82, 0, 0.0, 0.85, 0.05, 1.0, "Warm Cliff Light"),
    (98, 92, 105, 0, 0.0, 0.8, 0.05, 1.0, "Weathered Stone"),

    # 9-14: 汉白玉 & 台基 (White Jade Marble & Courtyards)
    (238, 235, 228, 0, 0.0, 0.4, 0.05, 1.0, "White Marble Pure"),
    (218, 214, 206, 0, 0.0, 0.45, 0.05, 1.0, "White Marble Shade"),
    (195, 190, 182, 0, 0.0, 0.5, 0.05, 1.0, "Marble Carved"),
    (168, 164, 158, 0, 0.0, 0.6, 0.05, 1.0, "Courtyard Tile Light"),
    (142, 138, 134, 0, 0.0, 0.65, 0.05, 1.0, "Courtyard Tile Dark"),
    (118, 114, 112, 0, 0.0, 0.7, 0.05, 1.0, "Stone Mortar"),

    # 15-22: 千年乌木、楠木与朱漆 (Timber, Ebony, Crimson Lacquer)
    (42, 26, 22, 0, 0.0, 0.7, 0.05, 1.0, "Aged Ebony"),
    (64, 38, 30, 0, 0.0, 0.65, 0.05, 1.0, "Dark Rosewood"),
    (92, 54, 38, 0, 0.0, 0.6, 0.05, 1.0, "Teak Wood"),
    (122, 74, 48, 0, 0.0, 0.55, 0.05, 1.0, "Warm Cedar"),
    (145, 32, 30, 0, 0.0, 0.35, 0.1, 1.0, "Crimson Lacquer Deep"),
    (178, 42, 38, 0, 0.0, 0.3, 0.1, 1.0, "Crimson Pillar"),
    (208, 58, 48, 0, 0.0, 0.3, 0.1, 1.0, "Vermilion Bright"),
    (232, 92, 68, 0, 0.0, 0.35, 0.1, 1.0, "Coral Trim"),

    # 23-30: 孔雀蓝琉璃瓦 & 翠玉瓦 (Peacock Cyan & Jade Glazed Roof Tiles)
    (18, 58, 72, 1, 0.0, 0.25, 0.3, 1.0, "Glazed Roof Abyss"),
    (24, 82, 98, 1, 0.0, 0.22, 0.3, 1.0, "Glazed Roof Dark"),
    (34, 112, 128, 1, 0.0, 0.2, 0.35, 1.0, "Glazed Peacock Mid"),
    (48, 145, 158, 1, 0.0, 0.18, 0.35, 1.0, "Glazed Peacock Light"),
    (72, 178, 185, 1, 0.0, 0.15, 0.4, 1.0, "Glazed Cyan Ridge"),
    (110, 208, 205, 1, 0.0, 0.15, 0.4, 1.0, "Glazed Seafoam Highlight"),
    (28, 95, 78, 1, 0.0, 0.22, 0.3, 1.0, "Celadon Roof Dark"),
    (46, 132, 108, 1, 0.0, 0.2, 0.3, 1.0, "Celadon Roof Light"),

    # 31-38: 千机黄铜、赤金与陨铁齿轮 (Clockwork Brass, Gold & Meteoric Iron)
    (112, 78, 28, 1, 0.0, 0.3, 0.85, 1.0, "Antique Bronze"),
    (148, 106, 38, 1, 0.0, 0.25, 0.88, 1.0, "Clockwork Brass Dark"),
    (186, 138, 52, 1, 0.0, 0.22, 0.9, 1.0, "Clockwork Brass Mid"),
    (220, 172, 72, 1, 0.0, 0.18, 0.92, 1.0, "Imperial Gold"),
    (248, 208, 104, 1, 0.0, 0.15, 0.95, 1.0, "Sunlit Gold Highlight"),
    (255, 236, 168, 1, 0.15, 0.12, 0.95, 1.0, "Gilded Finial Gleam"),
    (48, 54, 68, 1, 0.0, 0.35, 0.8, 1.0, "Meteoric Iron Dark"),
    (78, 86, 104, 1, 0.0, 0.3, 0.82, 1.0, "Meteoric Iron Polished"),

    # 39-46: 植被：青苔、古松、金秋银杏、绯樱 (Foliage: Moss, Pine, Ginkgo, Blossom)
    (36, 72, 48, 0, 0.0, 0.75, 0.0, 1.0, "Deep Pine Needle"),
    (52, 98, 62, 0, 0.0, 0.7, 0.0, 1.0, "Ancient Pine Mid"),
    (74, 128, 78, 0, 0.0, 0.65, 0.0, 1.0, "Hanging Moss Green"),
    (102, 158, 92, 0, 0.0, 0.65, 0.0, 1.0, "Spring Moss Light"),
    (218, 152, 34, 0, 0.0, 0.6, 0.0, 1.0, "Autumn Ginkgo Deep"),
    (242, 188, 52, 0, 0.0, 0.55, 0.0, 1.0, "Autumn Ginkgo Gold"),
    (252, 218, 92, 0, 0.05, 0.5, 0.0, 1.0, "Ginkgo Sunlit Tip"),
    (242, 148, 168, 0, 0.05, 0.55, 0.0, 1.0, "Spirit Blossom Pink"),

    # 47-54: 灵泉瀑布与寒潭水体 (Waterfall, Spirit Pool & Mist)
    (22, 74, 118, 3, 0.05, 0.1, 0.1, 0.82, "Deep Pool Azure"),
    (36, 108, 158, 3, 0.08, 0.1, 0.1, 0.80, "Waterfall Mid Blue"),
    (64, 148, 198, 3, 0.12, 0.08, 0.1, 0.78, "Cascading Stream Cyan"),
    (112, 192, 232, 3, 0.18, 0.08, 0.1, 0.75, "Water Crest Aqua"),
    (185, 232, 250, 3, 0.25, 0.15, 0.05, 0.85, "Waterfall Foam White"),
    (235, 248, 255, 2, 0.35, 0.2, 0.0, 0.9, "Mist Spray Glow"),
    (215, 222, 238, 0, 0.08, 0.85, 0.0, 0.88, "Cloud Sea Shadow"),
    (246, 248, 255, 0, 0.15, 0.8, 0.0, 0.92, "Cloud Sea Pure"),

    # 55-64: 发光材质：地脉以太晶簇、万卷灯火、星盘光轨、孔明灯 (Emissives!)
    (16, 185, 218, 2, 0.65, 0.1, 0.2, 0.95, "Aether Crystal Dark"),
    (48, 228, 248, 2, 0.85, 0.05, 0.2, 0.95, "Aether Crystal Cyan"),
    (148, 250, 255, 2, 1.0, 0.05, 0.1, 1.0, "Aether Core White-Cyan"),
    (138, 72, 232, 2, 0.75, 0.1, 0.2, 0.95, "Void Amethyst Crystal"),
    (192, 128, 255, 2, 0.92, 0.05, 0.1, 0.95, "Void Amethyst Core"),
    (242, 138, 42, 2, 0.75, 0.2, 0.0, 1.0, "Warm Paper Window"),
    (255, 182, 72, 2, 0.9, 0.15, 0.0, 1.0, "Lantern Amber Glow"),
    (255, 228, 148, 2, 1.0, 0.1, 0.0, 1.0, "Lantern Core Bright"),
    (255, 92, 64, 2, 0.85, 0.15, 0.0, 1.0, "Cinnabar Seal Rune"),
    (120, 245, 175, 2, 0.88, 0.1, 0.1, 0.95, "Jade Astrolabe Rune"),
]

# Simple deterministic 3D value noise for organic rock/clouds/foliage
def hash3(x, y, z):
    n = x * 374761393 + y * 668265263 + z * 2147483647
    n = (n ^ (n >> 13)) * 1274126177
    return ((n ^ (n >> 16)) & 0x7fffffff) / 2147483647.0

def smooth_noise(x, y, z, scale=8.0):
    sx, sy, sz = x / scale, y / scale, z / scale
    ix, iy, iz = int(math.floor(sx)), int(math.floor(sy)), int(math.floor(sz))
    fx, fy, fz = sx - ix, sy - iy, sz - iz
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    fz = fz * fz * (3 - 2 * fz)
    
    c000 = hash3(ix, iy, iz)
    c100 = hash3(ix+1, iy, iz)
    c010 = hash3(ix, iy+1, iz)
    c110 = hash3(ix+1, iy+1, iz)
    c001 = hash3(ix, iy, iz+1)
    c101 = hash3(ix+1, iy, iz+1)
    c011 = hash3(ix, iy+1, iz+1)
    c111 = hash3(ix+1, iy+1, iz+1)
    
    c00 = c000 * (1 - fx) + c100 * fx
    c01 = c001 * (1 - fx) + c101 * fx
    c10 = c010 * (1 - fx) + c110 * fx
    c11 = c011 * (1 - fx) + c111 * fx
    
    c0 = c00 * (1 - fy) + c10 * fy
    c1 = c01 * (1 - fy) + c11 * fy
    return c0 * (1 - fz) + c1 * fz

def fbm(x, y, z, scale=12.0):
    return 0.65 * smooth_noise(x, y, z, scale) + 0.35 * smooth_noise(x, y, z, scale * 0.45)

class VoxelWorld:
    def __init__(self, nx, ny, nz):
        self.nx = nx
        self.ny = ny
        self.nz = nz
        # Use bytearray for fast 3D storage: index = (y * nx * nz) + (z * nx) + x
        self.grid = bytearray(nx * ny * nz)

    def set(self, x, y, z, c):
        if 0 <= x < self.nx and 0 <= y < self.ny and 0 <= z < self.nz:
            self.grid[(y * self.nx * self.nz) + (z * self.nx) + x] = c

    def get(self, x, y, z):
        if 0 <= x < self.nx and 0 <= y < self.ny and 0 <= z < self.nz:
            return self.grid[(y * self.nx * self.nz) + (z * self.nx) + x]
        return 0

    def fill_box(self, x1, y1, z1, x2, y2, z2, c):
        for y in range(max(0, y1), min(self.ny, y2 + 1)):
            for z in range(max(0, z1), min(self.nz, z2 + 1)):
                for x in range(max(0, x1), min(self.nx, x2 + 1)):
                    self.set(x, y, z, c)

    def fill_cylinder_y(self, cx, cz, y1, y2, r, c, hollow=False):
        r2 = r * r
        ir2 = (r - 1.2) * (r - 1.2) if hollow else -1
        for y in range(max(0, int(y1)), min(self.ny, int(y2) + 1)):
            for z in range(max(0, int(cz - r - 1)), min(self.nz, int(cz + r + 2))):
                for x in range(max(0, int(cx - r - 1)), min(self.nx, int(cx + r + 2))):
                    d2 = (x - cx)**2 + (z - cz)**2
                    if ir2 < d2 <= r2:
                        self.set(x, y, z, c)

    def draw_line(self, x1, y1, z1, x2, y2, z2, c, radius=0.0):
        dist = max(1, int(math.ceil(math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2) * 2)))
        for i in range(dist + 1):
            t = i / dist
            px = x1 + (x2 - x1) * t
            py = y1 + (y2 - y1) * t
            pz = z1 + (z2 - z1) * t
            if radius <= 0.5:
                self.set(int(round(px)), int(round(py)), int(round(pz)), c)
            else:
                ir = int(math.ceil(radius))
                for dy in range(-ir, ir + 1):
                    for dz in range(-ir, ir + 1):
                        for dx in range(-ir, ir + 1):
                            if dx*dx + dy*dy + dz*dz <= radius*radius:
                                self.set(int(round(px))+dx, int(round(py))+dy, int(round(pz))+dz, c)

def build_eastern_roof(world, cx, cz, y_base, half_w, half_d, height, style="hip", ridge_dir="x", is_octagonal=False, color_scheme="peacock"):
    """
    Builds a richly detailed traditional Chinese curved roof (飞檐翘角) with:
    - Dougong (斗拱) brackets underneath
    - Rafters (飞椽) in dark ebony & gold
    - Curved concave roof slope (反宇)
    - Upturned corner eaves (翘角)
    - Glazed ridge (正脊/垂脊) with Chiwen (鸱吻) & roof beasts (脊兽)
    """
    if color_scheme == "peacock":
        c_dark, c_mid, c_light, c_ridge, c_gleam = 24, 25, 26, 27, 28
    else:
        c_dark, c_mid, c_light, c_ridge, c_gleam = 29, 30, 26, 27, 28

    # 1. Dougong (斗拱) bracket layer under the eaves (y_base - 2 to y_base - 1)
    dg_w = max(2, half_w - 3)
    dg_d = max(2, half_d - 3)
    for dy in range(-2, 0):
        y = y_base + dy
        ext = 1 if dy == -1 else 0
        for dz in range(-dg_d - ext, dg_d + ext + 1):
            for dx in range(-dg_w - ext, dg_w + ext + 1):
                if is_octagonal and abs(dx) + abs(dz) > int((dg_w + ext) * 1.42):
                    continue
                on_edge = (abs(dx) >= dg_w + ext - 1) or (abs(dz) >= dg_d + ext - 1)
                if is_octagonal:
                    on_edge = on_edge or (abs(dx) + abs(dz) >= int((dg_w + ext) * 1.42) - 1)
                if on_edge:
                    # Alternating bracket blocks (斗与拱)
                    if (dx + dz) % 2 == 0:
                        world.set(cx + dx, y, cz + dz, 20 if dy == -2 else 17)  # Crimson / Teak
                    elif dy == -1:
                        world.set(cx + dx, y, cz + dz, 33)  # Brass accent on bracket tip

    # 2. Roof surface & upturned corners
    for dy in range(height + 3):
        t = min(1.0, dy / max(1.0, float(height)))
        # Concave curve: shrinks faster near top, flares out at bottom
        curve = math.pow(1.0 - t, 0.72)
        cur_w = half_w * curve
        cur_d = half_d * curve
        
        if cur_w < 0.5 and cur_d < 0.5:
            break

        iw = int(math.ceil(cur_w)) + 2
        id_ = int(math.ceil(cur_d)) + 2
        for dz in range(-id_, id_ + 1):
            for dx in range(-iw, iw + 1):
                adx, adz = abs(dx), abs(dz)
                if is_octagonal:
                    dist_metric = max(adx / max(1.0, cur_w), adz / max(1.0, cur_d), (adx + adz) / max(1.0, (cur_w + cur_d) * 0.74))
                elif style == "gable_x":
                    # X-ridge roof (歇山/悬山)
                    dist_metric = max(adx / max(1.0, half_w * (1.0 - t * 0.38)), adz / max(1.0, cur_d))
                else:
                    dist_metric = max(adx / max(1.0, cur_w), adz / max(1.0, cur_d))

                if dist_metric <= 1.05:
                    # Calculate corner upturn (飞檐翘角)
                    corner_factor = (adx / max(1.0, half_w)) * (adz / max(1.0, half_d))
                    upturn = int(round(corner_factor * 2.8)) if t < 0.45 else 0
                    ry = y_base + dy + upturn

                    # Underside timber rafters
                    if dist_metric > 0.86 and dy <= 1:
                        world.set(cx + dx, ry - 1, cz + dz, 15)  # Ebony eave underside

                    # Bamboo-like tile ribs (瓦垄)
                    rib = ((dx if adz >= adx else dz) % 2 == 0)
                    is_diag_ridge = abs(adx - adz) <= 1 and not is_octagonal
                    if is_octagonal:
                        is_diag_ridge = (adx <= 1) or (adz <= 1) or (abs(adx - adz) <= 1)

                    if dist_metric > 0.92:
                        # Eave drip-tile edge (瓦当滴水) with gold & cyan
                        world.set(cx + dx, ry, cz + dz, 34 if (dx + dz) % 3 == 0 else c_ridge)
                    elif is_diag_ridge:
                        # Diagonal hip ridge (垂脊/戗脊)
                        world.set(cx + dx, ry, cz + dz, c_ridge)
                        if dy % 2 == 0 and dist_metric > 0.55:
                            # Roof beasts (仙人走兽) on the hip ridges!
                            world.set(cx + dx, ry + 1, cz + dz, 35 if dist_metric > 0.82 else c_gleam)
                    else:
                        # Main glazed tiles with subtle gradient and ribs
                        if t > 0.7:
                            tc = c_light if rib else c_mid
                        elif t > 0.3:
                            tc = c_mid if rib else c_dark
                        else:
                            tc = c_light if rib else c_mid
                        world.set(cx + dx, ry, cz + dz, tc)

    # 3. Top Crest / Main Ridge (正脊与鸱吻 / 攒尖宝顶)
    top_y = y_base + height
    if is_octagonal or style == "pyramid":
        # Gilded Lotus & Astral Spire Finial (鎏金宝顶)
        world.fill_box(cx - 1, top_y, cz - 1, cx + 1, top_y + 1, cz + 1, 33)
        for sy in range(top_y + 2, top_y + 8):
            world.set(cx, sy, cz, 35 if sy < top_y + 6 else 57)
        # Floating halo ring around the spire
        for ang in range(0, 360, 15):
            rad = math.radians(ang)
            hx = cx + int(round(2.5 * math.cos(rad)))
            hz = cz + int(round(2.5 * math.sin(rad)))
            world.set(hx, top_y + 4, hz, 34)
    else:
        ridge_len = int(half_w * 0.62)
        for rx in range(cx - ridge_len, cx + ridge_len + 1):
            world.set(rx, top_y, cz, c_ridge)
            world.set(rx, top_y + 1, cz, 34 if rx % 2 == 0 else c_gleam)
        # Chiwen (鸱吻 dragon-tail ornaments at both ends of main ridge)
        for side in (-1, 1):
            end_x = cx + side * ridge_len
            world.set(end_x, top_y + 2, cz, 35)
            world.set(end_x + side, top_y + 2, cz, 28)
            world.set(end_x + side, top_y + 3, cz, 35)
        # Central brass astral pearl on roof center
        world.set(cx, top_y + 2, cz, 34)
        world.set(cx, top_y + 3, cz, 62)


def draw_gear_3d(world, cx, cy, cz, radius, thickness, plane="xz", teeth=12, c_rim=34, c_spoke=32, c_hub=57):
    """Draws an intricate mechanical clockwork gear with teeth, hollow cutouts, spokes, and glowing hub."""
    ir = int(radius + 3)
    for d1 in range(-ir, ir + 1):
        for d2 in range(-ir, ir + 1):
            r = math.sqrt(d1*d1 + d2*d2)
            ang = math.atan2(d2, d1)
            # Tooth profile
            tooth_wave = math.cos(ang * teeth)
            is_tooth = (radius < r <= radius + 1.8) and (tooth_wave > 0.25)
            is_outer_ring = (radius - 1.8 <= r <= radius)
            is_inner_ring = (radius * 0.35 <= r <= radius * 0.5)
            is_hub = (r < radius * 0.25)
            # 6 radial spokes
            spoke_wave = math.cos(ang * 6)
            is_spoke = (radius * 0.45 <= r <= radius - 1.5) and (spoke_wave > 0.78)

            if not (is_tooth or is_outer_ring or is_inner_ring or is_hub or is_spoke):
                continue

            for t in range(-thickness // 2, thickness // 2 + 1):
                if is_spoke and abs(t) > 0 and thickness > 1:
                    continue
                col = c_hub if (is_hub and t == 0) else (
                    35 if is_tooth else (c_rim if is_outer_ring or is_inner_ring else c_spoke)
                )
                if plane == "xz":
                    world.set(cx + d1, cy + t, cz + d2, col)
                elif plane == "xy":
                    world.set(cx + d1, cy + d2, cz + t, col)
                elif plane == "yz":
                    world.set(cx + t, cy + d1, cz + d2, col)


def draw_torus_ring(world, cx, cy, cz, radius, nx_n, ny_n, nz_n, c_main, c_rune, thickness=1.35):
    """Draws a 3D tilted armillary ring (浑天仪环) with engraved glowing celestial runes."""
    # Normalize normal vector
    length = math.sqrt(nx_n*nx_n + ny_n*ny_n + nz_n*nz_n)
    nx_n, ny_n, nz_n = nx_n/length, ny_n/length, nz_n/length
    # Find two orthonormal basis vectors u, v in the plane
    if abs(ny_n) < 0.9:
        ux, uy, uz = -nz_n, 0.0, nx_n
    else:
        ux, uy, uz = 1.0, 0.0, 0.0
    ul = math.sqrt(ux*ux + uy*uy + uz*uz)
    ux, uy, uz = ux/ul, uy/ul, uz/ul
    vx = ny_n*uz - nz_n*uy
    vy = nz_n*ux - nx_n*uz
    vz = nx_n*uy - ny_n*ux

    steps = int(radius * 16)
    for i in range(steps):
        ang = 2.0 * math.pi * i / steps
        ca, sa = math.cos(ang), math.sin(ang)
        px = cx + radius * (ca * ux + sa * vx)
        py = cy + radius * (ca * uy + sa * vy)
        pz = cz + radius * (ca * uz + sa * vz)

        is_degree_mark = (i % 6 == 0)
        for dx in range(-1, 2):
            for dy in range(-1, 2):
                for dz in range(-1, 2):
                    if dx*dx + dy*dy + dz*dz <= thickness:
                        col = c_rune if (is_degree_mark and dx == 0 and dy == 0 and dz == 0) else c_main
                        world.set(int(round(px + dx)), int(round(py + dy)), int(round(pz + dz)), col)


def generate_scene():
    world = VoxelWorld(NX, NY, NZ)
    CX, CZ = 63, 63
    PLATFORM_Y = 48  # Main courtyard deck height

    print("[1/9] Sculpting Floating Basalt Archipelagos & Inverted Crystal Cavern...")
    # Main island + 2 satellite sub-islands connected by bridges/chains:
    # - Main island centered at (63, 63), radius ~ 38
    # - Front-Left Tea & Pine Pavilion Island centered at (24, 90), radius ~ 14
    # - Back-Right Bell & Scroll Forge Island centered at (100, 32), radius ~ 13
    # - Front-Right Dock Pier projection at (92, 92), radius ~ 11

    for z in range(NZ):
        for x in range(NX):
            # Distance to island centers
            d_main = math.sqrt(((x - CX) / 39.0)**2 + ((z - CZ) / 37.0)**2)
            d_tea = math.sqrt(((x - 24) / 14.5)**2 + ((z - 90) / 14.5)**2)
            d_bell = math.sqrt(((x - 100) / 13.5)**2 + ((z - 32) / 13.5)**2)
            d_dock = math.sqrt(((x - 94) / 11.5)**2 + ((z - 92) / 11.5)**2)

            n1 = fbm(x, 0, z, 11.0)
            n2 = smooth_noise(x, 40, z, 5.0)
            edge_warp = (n1 - 0.5) * 0.24 + (n2 - 0.5) * 0.10

            # Main Island Rock Mass
            if d_main + edge_warp < 1.0:
                eff_d = max(0.0, d_main + edge_warp)
                # Inverted stalactite cone depth: deep in the center, sharp crags around
                cone_depth = int((1.0 - eff_d**1.45) * 38.0 + n2 * 9.0)
                # Sharp hanging rock spires
                spire = int(max(0.0, (smooth_noise(x, 10, z, 3.2) - 0.58) * 28.0 * (1.0 - eff_d * 0.7)))
                y_bot = max(4, PLATFORM_Y - cone_depth - spire)
                y_top = PLATFORM_Y

                # Carve central Astral Engine Well & Waterfall Channel
                r_center = math.sqrt((x - CX)**2 + (z - CZ)**2)
                is_waterfall_gorge = (57 <= x <= 69 and z >= 63)

                for y in range(y_bot, y_top + 1):
                    # Hollow out the glowing Mechanical Core Cavern inside the island belly (y: 16..44, r < 22)
                    if 16 <= y <= 44 and r_center < 21.5 - (abs(y - 31) * 0.32):
                        continue
                    # Carve wide viewing galleries & arches into the island belly (on all 4 cardinal & diagonal sides) so the internal gears & crystal shine out!
                    if 21 <= y <= 42:
                        arch_h = 42 - int((abs(x - CX) if abs(x - CX) < abs(z - CZ) else abs(z - CZ)) * 0.45)
                        if y <= arch_h and (abs(x - CX) < 15 or abs(z - CZ) < 15 or abs(abs(x - CX) - abs(z - CZ)) < 9):
                            if r_center > 12:
                                continue

                    # Rock strata coloration
                    strata = (y + int(n1 * 6)) % 7
                    if y == y_top:
                        # Top surface: moss on outer rim, stone tiles inside
                        if d_main > 0.78:
                            col = 41 if n2 > 0.45 else (42 if n2 > 0.65 else 4)
                        else:
                            # Courtyard pattern
                            checker = ((x // 3) + (z // 3)) % 2
                            col = 12 if checker == 0 else 13
                    elif y > y_top - 3 and d_main > 0.82:
                        col = 40 if n2 > 0.5 else 3
                    elif strata == 0:
                        col = 6
                    elif strata in (1, 2):
                        col = 2
                    elif strata in (3, 4):
                        col = 3
                    else:
                        col = 4 if n2 > 0.5 else 1
                    world.set(x, y, z, col)

                # Hanging moss vines on the outer cliff edge (skip in front of the 4 cardinal gear viewing arches!)
                in_arch_zone = (abs(x - CX) < 16 or abs(z - CZ) < 16)
                if not in_arch_zone and 0.85 < d_main + edge_warp < 0.99 and hash3(x, 1, z) > 0.68:
                    vine_len = int(2 + hash3(x, 2, z) * 6)
                    for vy in range(y_bot - vine_len, y_bot + 2):
                        if vy > 6:
                            world.set(x, vy, z, 41 if vy % 2 == 0 else 42)

            # Satellite Island 1: Front-Left Tea & Ginkgo Island (center 24, 90, top Y=44)
            if d_tea + edge_warp * 0.8 < 1.0:
                eff_d = max(0.0, d_tea + edge_warp * 0.8)
                top_tea = 44
                depth = int((1.0 - eff_d**1.5) * 20.0 + n2 * 6.0)
                for y in range(max(10, top_tea - depth), top_tea + 1):
                    col = (41 if n2 > 0.4 else 11) if y == top_tea else (2 if y % 3 == 0 else 3)
                    world.set(x, y, z, col)

            # Satellite Island 2: Back-Right Bell & Observatory Forge Island (center 100, 32, top Y=52)
            if d_bell + edge_warp * 0.8 < 1.0:
                eff_d = max(0.0, d_bell + edge_warp * 0.8)
                top_bell = 52
                depth = int((1.0 - eff_d**1.5) * 22.0 + n2 * 6.0)
                for y in range(max(14, top_bell - depth), top_bell + 1):
                    col = (12 if eff_d < 0.65 else 41) if y == top_bell else (3 if y % 3 == 0 else 2)
                    world.set(x, y, z, col)

            # Satellite Island 3: Front-Right Crane Airship Dock Island (center 94, 92, top Y=46)
            if d_dock + edge_warp * 0.8 < 1.0:
                eff_d = max(0.0, d_dock + edge_warp * 0.8)
                top_dock = 46
                depth = int((1.0 - eff_d**1.5) * 18.0 + n2 * 5.0)
                for y in range(max(14, top_dock - depth), top_dock + 1):
                    if y == top_dock:
                        col = 33 if abs(eff_d - 0.72) < 0.08 else (10 if (x + z) % 2 == 0 else 12)
                    else:
                        col = 2 if y % 2 == 0 else 4
                    world.set(x, y, z, col)

    print("[2/9] Installing Subterranean Aether Crystal Core & Giant Clockwork Gear Train...")
    # Central glowing Aether Crystal Cluster hanging from the bottom of the island & inside the core (Y: 4 to 38)
    crystal_spikes = [
        (CX, 32, CZ, CX, 5, CZ, 4.2, 57, 56),
        (CX-3, 30, CZ-2, CX-8, 10, CZ-5, 2.6, 56, 55),
        (CX+4, 30, CZ-3, CX+9, 11, CZ-6, 2.5, 56, 55),
        (CX-4, 29, CZ+4, CX-9, 12, CZ+8, 2.5, 59, 58),
        (CX+3, 29, CZ+3, CX+8, 9, CZ+7, 2.7, 56, 55),
        (CX-6, 26, CZ, CX-13, 15, CZ+1, 2.0, 59, 58),
        (CX+6, 26, CZ, CX+13, 14, CZ-1, 2.0, 56, 55),
        # Upward crystal clusters inside the cavern
        (CX-8, 22, CZ-8, CX-11, 33, CZ-11, 1.8, 56, 57),
        (CX+8, 22, CZ-8, CX+11, 33, CZ-11, 1.8, 59, 60),
        (CX-8, 22, CZ+8, CX-11, 33, CZ+11, 1.8, 56, 57),
        (CX+8, 22, CZ+8, CX+11, 33, CZ+11, 1.8, 59, 60),
    ]
    for x1, y1, z1, x2, y2, z2, r_base, c_core, c_outer in crystal_spikes:
        steps = 40
        for i in range(steps + 1):
            t = i / steps
            px = x1 + (x2 - x1) * t
            py = y1 + (y2 - y1) * t
            pz = z1 + (z2 - z1) * t
            cr = r_base * (1.0 - t * 0.85)
            ir = int(math.ceil(cr))
            for dy in range(-ir, ir + 1):
                for dz in range(-ir, dz_max := ir + 1):
                    for dx in range(-ir, ir + 1):
                        d = math.sqrt(dx*dx + dy*dy + dz*dz)
                        if d <= cr:
                            world.set(int(px)+dx, int(py)+dy, int(pz)+dz, c_core if d < cr * 0.55 else c_outer)

    # Giant Horizontal & Vertical Clockwork Gears inside and protruding from the island's mechanical belly!
    # 1. Master Horizontal Sun-Gear at Y=32 (radius 24, teeth protruding out of the stone arches!)
    draw_gear_3d(world, CX, 32, CZ, radius=24.0, thickness=2, plane="xz", teeth=20, c_rim=35, c_spoke=33, c_hub=57)
    # 2. Lower Counter-Rotating Planetary Gear at Y=24 (radius 18)
    draw_gear_3d(world, CX, 24, CZ, radius=18.0, thickness=2, plane="xz", teeth=16, c_rim=34, c_spoke=32, c_hub=57)
    # 3. Four Vertical Escapement Gears exposed on the N/S/E/W cliff arches!
    draw_gear_3d(world, CX - 26, 33, CZ, radius=11.0, thickness=2, plane="yz", teeth=12, c_rim=35, c_spoke=33, c_hub=62)
    draw_gear_3d(world, CX + 26, 33, CZ, radius=11.0, thickness=2, plane="yz", teeth=12, c_rim=35, c_spoke=33, c_hub=62)
    draw_gear_3d(world, CX, 33, CZ - 26, radius=11.0, thickness=2, plane="xy", teeth=12, c_rim=35, c_spoke=33, c_hub=62)
    draw_gear_3d(world, CX, 33, CZ + 26, radius=11.0, thickness=2, plane="xy", teeth=12, c_rim=35, c_spoke=33, c_hub=62)
    # Central vertical drive shaft (天枢铜柱) running from Y=20 all the way up to Y=105!
    world.fill_cylinder_y(CX, CZ, 22, 102, 2.2, 33)
    world.fill_cylinder_y(CX, CZ, 22, 102, 1.2, 57)  # Glowing aether core inside shaft

    print("[3/9] Carving White Marble Terraces, Balustrades & Spirit Waterfall...")
    # Grand Octagonal White Marble Terrace (汉白玉须弥座台基) at center of Main Island (Y: 49 to 54)
    for y in range(PLATFORM_Y + 1, PLATFORM_Y + 6):
        tier_shrink = (y - PLATFORM_Y - 1) * 1.5
        r_terrace = 24.0 - tier_shrink
        for dz in range(-26, 27):
            for dx in range(-26, 27):
                adx, adz = abs(dx), abs(dz)
                oct_d = max(adx, adz, (adx + adz) * 0.72)
                if oct_d <= r_terrace:
                    # Leave central circular well open so you can look down into the glowing clockwork core!
                    r_well = math.sqrt(dx*dx + dz*dz)
                    if r_well < 6.5:
                        if r_well >= 5.2 and y == PLATFORM_Y + 5:
                            world.set(CX + dx, y, CZ + dz, 34)  # Brass well rim
                        continue
                    on_rim = (oct_d >= r_terrace - 1.2)
                    if y in (PLATFORM_Y + 1, PLATFORM_Y + 5) and on_rim:
                        world.set(CX + dx, y, CZ + dz, 9)  # Pure white marble cornice
                    elif on_rim:
                        world.set(CX + dx, y, CZ + dz, 11 if (dx + dz) % 2 == 0 else 33)  # Carved relief with brass inlay
                    else:
                        world.set(CX + dx, y, CZ + dz, 10 if (dx + dz) % 4 == 0 else 9)

    # Marble balustrades (汉白玉栏杆与望柱) on top of the terrace (Y = 55, 56)
    r_bal = 18.0
    for dz in range(-20, 21):
        for dx in range(-20, 21):
            adx, adz = abs(dx), abs(dz)
            oct_d = max(adx, adz, (adx + adz) * 0.72)
            # Leave openings on N, S, E, W for grand staircases
            if adx <= 3 or adz <= 3:
                continue
            if abs(oct_d - r_bal) < 0.75:
                world.set(CX + dx, PLATFORM_Y + 6, CZ + dz, 9)
                if (dx + dz) % 3 == 0:
                    world.set(CX + dx, PLATFORM_Y + 7, CZ + dz, 9)
                    world.set(CX + dx, PLATFORM_Y + 8, CZ + dz, 34)  # Gold finial on post

    # Four Cardinal Marble Staircases (陛阶与御路) on N, S, E, W
    for step in range(6):
        sy = PLATFORM_Y + 5 - step
        dist = 18 + step
        for w in range(-3, 4):
            col = 33 if abs(w) == 3 else (11 if abs(w) <= 1 else 9)
            world.set(CX + w, sy, CZ + dist, col)  # South stairs
            world.set(CX + w, sy, CZ - dist, col)  # North stairs
            world.set(CX + dist, sy, CZ + w, col)  # East stairs
            world.set(CX - dist, sy, CZ + w, col)  # West stairs

    # Spirit Pool & Cascading Waterfall on the Front-Right / South-East cliff (feeding a waterwheel!)
    for z in range(66, 93):
        for x in range(66, 82):
            dist_pool = math.sqrt(((x - 74) / 7.5)**2 + ((z - 78) / 11.0)**2)
            if dist_pool < 1.0:
                world.set(x, PLATFORM_Y - 1, z, 47)
                world.set(x, PLATFORM_Y, z, 48 if dist_pool > 0.6 else 49)
                if hash3(x, 5, z) > 0.78:
                    world.set(x, PLATFORM_Y, z, 50)  # Water ripple highlight

    # Waterfall plunging off the cliff edge at X: 71..77, Z: 88..94 down to Y=6
    for y in range(6, PLATFORM_Y + 1):
        drop = PLATFORM_Y - y
        z_center = 88 + int(math.sqrt(max(0, drop)) * 1.15)
        for x in range(71, 78):
            for dz in range(-1, 2):
                wz = z_center + dz + (1 if x in (73, 74, 75) else 0)
                if dz == 1 or (y + x) % 5 == 0:
                    col = 51 if y > 14 else 52  # Foam / mist
                elif x in (73, 74, 75):
                    col = 50  # Bright aqua stream
                else:
                    col = 49
                world.set(x, y, wz, col)
        # Mist cloud at the bottom of the waterfall (Y: 5..14)
        if y < 15:
            for mx in range(67, 82):
                for mz in range(91, 103):
                    if math.sqrt((mx - 74)**2 + (mz - 96)**2 + (y - 9)**2) < 6.5 - smooth_noise(mx, y, mz, 3.0) * 2.5:
                        world.set(mx, y, mz, 52 if y > 9 else 54)

    # Giant Cliffside Brass Waterwheel driven by the waterfall at X=70, Y=36, Z=89
    draw_gear_3d(world, 70, 36, 89, radius=8.5, thickness=2, plane="yz", teeth=12, c_rim=33, c_spoke=17, c_hub=35)

    print("[4/9] Constructing the 3-Tier Octagonal Clockwork Library Tower (天枢藏书阁)...")
    # Tier 1: Y = 54 to 64 (Octagonal radius = 13)
    # Tier 2: Y = 65 to 74 (Octagonal radius = 10)
    # Tier 3: Y = 75 to 84 (Octagonal radius = 8)
    tiers = [
        (54, 64, 13, 18, 6),  # y_start, y_end, wall_r, roof_r, roof_h
        (65, 74, 10, 15, 6),
        (75, 84, 8,  13, 7),
    ]
    for t_idx, (y1, y2, wr, rr, rh) in enumerate(tiers):
        for y in range(y1, y2 + 1):
            for dz in range(-wr - 2, wr + 3):
                for dx in range(-wr - 2, wr + 3):
                    adx, adz = abs(dx), abs(dz)
                    oct_d = max(adx, adz, int((adx + adz) * 0.72))
                    
                    # Exterior balcony / veranda railing at bottom of Tier 2 and Tier 3
                    if t_idx > 0 and y in (y1, y1 + 1) and wr + 1 <= oct_d <= wr + 2:
                        if oct_d == wr + 2:
                            world.set(CX + dx, y, CZ + dz, 16 if y == y1 else (34 if (dx + dz) % 2 == 0 else 20))
                        else:
                            world.set(CX + dx, y, CZ + dz, 17)
                        continue

                    if oct_d == wr:
                        # Corner Vermilion Pillars vs Delicate Lattice Mullion Windows
                        is_corner_pillar = (adx == wr and adz in (0, int(wr * 0.45))) or (adz == wr and adx in (0, int(wr * 0.45))) or (abs(adx - adz) <= 1)
                        is_doorway = (adx <= 2 or adz <= 2) and (y < y1 + 6)
                        if is_corner_pillar:
                            world.set(CX + dx, y, CZ + dz, 20 if y < y2 else 33)
                        elif is_doorway:
                            if y == y1 + 5:
                                world.set(CX + dx, y, CZ + dz, 34)  # Gilded door lintel
                            elif adx == 2 or adz == 2 or y == y1 + 3:
                                world.set(CX + dx, y, CZ + dz, 19)  # Door frame & crossbar
                            else:
                                # Warm glowing paper screen with wooden muntins
                                world.set(CX + dx, y, CZ + dz, 60 if (y + dx + dz) % 2 == 0 else 17)
                        else:
                            # Lattice windows with dark rosewood mullions (棂窗) and warm lantern glow behind!
                            if y in (y1, y1 + 1, y2 - 1, y2):
                                world.set(CX + dx, y, CZ + dz, 16 if y != y2 - 1 else 20)  # Dark timber wainscot & crimson frieze
                            else:
                                is_mullion = ((dx + dz) % 2 == 0) or (y == (y1 + y2) // 2)
                                world.set(CX + dx, y, CZ + dz, 17 if is_mullion else 60)
                    elif oct_d == wr - 1 and y < y2:
                        # Inner ring of dark ebony bookshelves with occasional warm amber scroll glow
                        world.set(CX + dx, y, CZ + dz, 61 if (y % 3 == 1 and (dx + dz) % 2 == 0) else 16)

        # Build the ornate upturned octagonal glazed roof for this tier!
        build_eastern_roof(
            world, CX, CZ, y2 + 1,
            half_w=rr, half_d=rr, height=rh,
            is_octagonal=True,
            color_scheme="peacock"
        )
        # Hang glowing red & gold palace lanterns (宫灯) from the 8 roof corners!
        for sx in (-1, 0, 1):
            for sz in (-1, 0, 1):
                if sx == 0 and sz == 0:
                    continue
                if sx != 0 and sz != 0:
                    lx = CX + int(sx * rr * 0.78)
                    lz = CZ + int(sz * rr * 0.78)
                else:
                    lx = CX + sx * rr
                    lz = CZ + sz * rr
                ly = y2 + 2
                world.set(lx, ly, lz, 33)      # Chain
                world.set(lx, ly - 1, lz, 21)  # Lantern cap
                world.set(lx, ly - 2, lz, 62)  # Bright lantern core
                world.set(lx, ly - 3, lz, 61)  # Amber glow
                world.set(lx, ly - 4, lz, 21)  # Tassel

    print("[5/9] Forging the Colossal Celestial Armillary Sphere (九重浑天仪) at the Crown...")
    # Centered above the top roof at (CX, 98, CZ), radius 16..24!
    ARM_Y = 98
    # Central blazing Astral Sun Core (天枢日晷核心)
    for dy in range(-4, 5):
        for dz in range(-4, 5):
            for dx in range(-4, 5):
                d = math.sqrt(dx*dx + dy*dy + dz*dz)
                if d <= 3.6:
                    world.set(CX + dx, ARM_Y + dy, CZ + dz, 57 if d < 2.2 else (62 if d < 3.0 else 35))

    # 4 Interlocking 3D Armillary Rings (黄道环、赤道环、子午环、游仪环)
    # 1. Outer Meridian Ring (Vertical XY/YZ diagonal, Gold & Cyan Runes)
    draw_torus_ring(world, CX, ARM_Y, CZ, radius=21.0, nx_n=1.0, ny_n=0.0, nz_n=1.0, c_main=34, c_rune=57, thickness=1.5)
    # 2. Ecliptic Ring (Tilted 28 degrees, Brass & Amber Runes)
    draw_torus_ring(world, CX, ARM_Y, CZ, radius=18.0, nx_n=0.35, ny_n=0.88, nz_n=-0.32, c_main=33, c_rune=62, thickness=1.4)
    # 3. Equatorial Ring (Tilted -32 degrees, Imperial Gold & Jade Runes)
    draw_torus_ring(world, CX, ARM_Y, CZ, radius=14.5, nx_n=-0.42, ny_n=0.82, nz_n=0.38, c_main=35, c_rune=64, thickness=1.3)
    # 4. Inner Astrolabe Ring (Steeply tilted, Meteoric Iron & Amethyst Runes)
    draw_torus_ring(world, CX, ARM_Y, CZ, radius=10.5, nx_n=0.75, ny_n=0.35, nz_n=-0.56, c_main=38, c_rune=60, thickness=1.2)

    # Dragon-carved Bronze Support Pillars (四象蟠龙托架) rising from the 3rd-tier roof to hold the outer ring
    for side in (-1, 1):
        px = CX + side * 15
        pz = CZ - side * 15
        world.draw_line(CX + side * 6, 86, CZ - side * 6, px, ARM_Y, pz, 33, radius=1.2)
        world.set(px, ARM_Y + 1, pz, 57)

    print("[6/9] Building Side Pavilions, Covered Bridges, Bell Tower & Airship Dock...")
    # A. West Wing Pavilion: 藏经偏殿 (Scroll Hall) at (30, 49..58, 56)
    wx, wz = 31, 56
    world.fill_box(wx - 7, PLATFORM_Y + 1, wz - 9, wx + 7, PLATFORM_Y + 2, wz + 9, 10)  # Marble base
    for y in range(PLATFORM_Y + 3, PLATFORM_Y + 10):
        for dz in range(-8, 9):
            for dx in range(-6, 7):
                if abs(dx) == 6 or abs(dz) == 8:
                    is_pillar = (abs(dx) == 6 and abs(dz) in (0, 4, 8)) or (abs(dz) == 8 and abs(dx) in (0, 6))
                    if is_pillar:
                        world.set(wx + dx, y, wz + dz, 20)
                    elif y in (PLATFORM_Y + 3, PLATFORM_Y + 9):
                        world.set(wx + dx, y, wz + dz, 16)
                    else:
                        world.set(wx + dx, y, wz + dz, 60 if (dx + dz + y) % 2 == 0 else 17)
    build_eastern_roof(world, wx, wz, PLATFORM_Y + 10, half_w=9, half_d=11, height=6, style="gable_x", color_scheme="peacock")

    # B. North Gatehouse / Mountain Gate (北玄天门阙) at (63, 49..59, 28)
    nx_g, nz_g = 63, 28
    world.fill_box(nx_g - 10, PLATFORM_Y + 1, nz_g - 4, nx_g + 10, PLATFORM_Y + 3, nz_g + 4, 10)
    # Clear central archway through base
    world.fill_box(nx_g - 3, PLATFORM_Y + 1, nz_g - 4, nx_g + 3, PLATFORM_Y + 5, nz_g + 4, 0)
    for y in range(PLATFORM_Y + 4, PLATFORM_Y + 10):
        for dz in range(-3, 4):
            for dx in range(-9, 10):
                if abs(dx) <= 2 and y < PLATFORM_Y + 7:
                    continue
                if abs(dx) == 9 or abs(dz) == 3:
                    world.set(nx_g + dx, y, nz_g + dz, 20 if (dx + dz) % 3 == 0 else 61)
    build_eastern_roof(world, nx_g, nz_g, PLATFORM_Y + 10, half_w=12, half_d=6, height=5, style="gable_x", color_scheme="peacock")

    # C. South Grand Memorial Archway (南天棂星牌坊) at the front entrance of the main island (63, 49..62, 92)
    px_f, pz_f = 63, 92
    for px_off in (-9, -3, 3, 9):
        # Marble base drum (抱鼓石)
        world.fill_box(px_f + px_off - 1, PLATFORM_Y, pz_f - 1, px_f + px_off + 1, PLATFORM_Y + 2, pz_f + 1, 9)
        # Crimson & Gold Pillars
        top_p = PLATFORM_Y + (13 if abs(px_off) == 3 else 10)
        for y in range(PLATFORM_Y + 3, top_p + 1):
            world.set(px_f + px_off, y, pz_f, 20 if y < top_p - 1 else 34)
    # Lintels & Plaque (额枋与牌匾)
    world.fill_box(px_f - 10, PLATFORM_Y + 8, pz_f, px_f + 10, PLATFORM_Y + 9, pz_f, 33)
    world.fill_box(px_f - 4, PLATFORM_Y + 10, pz_f, px_f + 4, PLATFORM_Y + 12, pz_f, 19)
    world.set(px_f, PLATFORM_Y + 11, pz_f, 35)  # Gold calligraphy plaque
    # Three mini upturned roofs on the archway (三间四柱五楼牌坊)
    build_eastern_roof(world, px_f, pz_f, PLATFORM_Y + 13, half_w=5, half_d=3, height=3, color_scheme="peacock")
    build_eastern_roof(world, px_f - 7, pz_f, PLATFORM_Y + 10, half_w=4, half_d=3, height=3, color_scheme="peacock")
    build_eastern_roof(world, px_f + 7, pz_f, PLATFORM_Y + 10, half_w=4, half_d=3, height=3, color_scheme="peacock")

    # D. Satellite 1 Pavilion: Front-Left Tea Pavilion (听松茶寮) at (24, 45..53, 90)
    tx, tz, ty = 24, 90, 44
    for ang in range(0, 360, 60):
        rad = math.radians(ang)
        px = tx + int(round(4.5 * math.cos(rad)))
        pz = tz + int(round(4.5 * math.sin(rad)))
        for y in range(ty + 1, ty + 7):
            world.set(px, y, pz, 20)
    # Stone tea table & glowing teapot in center
    world.fill_box(tx - 1, ty + 1, tz - 1, tx + 1, ty + 2, tz + 1, 9)
    world.set(tx, ty + 3, tz, 64)  # Jade spirit tea glow
    build_eastern_roof(world, tx, tz, ty + 7, half_w=7, half_d=7, height=5, is_octagonal=True, color_scheme="celadon")

    # E. Arched Rainbow Bridge (飞虹廊桥) connecting Main Island (38, 48, 76) to Tea Island (28, 44, 85)
    steps_b = 28
    for i in range(steps_b + 1):
        t = i / steps_b
        bx = 39 + (28 - 39) * t
        bz = 76 + (85 - 76) * t
        arch = math.sin(t * math.pi) * 4.2
        by = 48 + (44 - 48) * t + arch
        for w in range(-2, 3):
            wx_b = int(round(bx + w * 0.7))
            wz_b = int(round(bz - w * 0.7))
            wy_b = int(round(by))
            world.set(wx_b, wy_b, wz_b, 17 if abs(w) < 2 else 9)
            if abs(w) == 2:
                world.set(wx_b, wy_b + 1, wz_b, 20)
                if i % 4 == 0:
                    world.set(wx_b, wy_b + 2, wz_b, 62)  # Bridge post lantern

    # F. Satellite 2 Pavilion: Back-Right Bell & Gear Forge Tower (晨钟天工阁) at (100, 52..64, 32)
    bx_t, bz_t, by_t = 100, 32, 52
    world.fill_box(bx_t - 5, by_t + 1, bz_t - 5, bx_t + 5, by_t + 2, bz_t + 5, 10)
    for y in range(by_t + 3, by_t + 11):
        for sx in (-4, 4):
            for sz in (-4, 4):
                world.set(bx_t + sx, y, bz_t + sz, 20)
    # Giant Bronze Bell hanging inside (洪钟)
    world.fill_cylinder_y(bx_t, bz_t, by_t + 5, by_t + 9, 2.2, 33)
    world.set(bx_t, by_t + 4, bz_t, 62)
    build_eastern_roof(world, bx_t, bz_t, by_t + 11, half_w=7, half_d=7, height=6, is_octagonal=True, color_scheme="peacock")

    # Heavy Bronze & Aether Suspension Chains connecting Main Island to Bell Island & Underbelly!
    for i in range(36):
        t = i / 35.0
        cx_c = 82 + (95 - 82) * t
        cz_c = 46 + (36 - 46) * t
        cy_c = 49 + (53 - 49) * t - math.sin(t * math.pi) * 3.0
        world.set(int(round(cx_c)), int(round(cy_c)), int(round(cz_c)), 33 if i % 2 == 0 else 57)
        world.set(int(round(cx_c)), int(round(cy_c)) + 4, int(round(cz_c)), 20 if i % 3 == 0 else 17)

    # G. Satellite 3: Front-Right Airship Pier & Mechanical Crane Skiff (千机机关飞舟与云津渡口) at (94, 46, 92)
    dx_p, dz_p, dy_p = 94, 92, 46
    # Timber & brass jetty extending from main island (79, 48, 82) to dock island (90, 46, 89)
    world.draw_line(79, 48, 82, 91, 46, 89, 17, radius=1.6)
    # Dock crane tower
    for y in range(dy_p + 1, dy_p + 10):
        world.set(dx_p - 3, y, dz_p - 3, 16)
        world.set(dx_p + 3, y, dz_p - 3, 16)
    world.draw_line(dx_p - 3, dy_p + 9, dz_p - 3, dx_p + 8, dy_p + 13, dz_p + 5, 33, radius=0.8)

    # Moored Clockwork Flying Ship (机关云舟) hovering at (104, 52, 96)
    sx_a, sy_a, sz_a = 104, 52, 96
    for dz in range(-7, 8):
        for dx in range(-3, 4):
            hull_w = 3.2 * (1.0 - (dz / 8.0)**2)
            if abs(dx) <= hull_w:
                world.set(sx_a + dx, sy_a, sz_a + dz, 16)
                world.set(sx_a + dx, sy_a + 1, sz_a + dz, 18 if abs(dx) < hull_w - 0.8 else 34)
                if abs(dx) < 1.5 and abs(dz) < 4:
                    world.set(sx_a + dx, sy_a - 1, sz_a + dz, 57)  # Glowing aether thruster keel!
    # Mechanical golden wings & glowing sails on the airship
    for w_side in (-1, 1):
        for w_len in range(1, 8):
            world.set(sx_a + w_side * (2 + w_len), sy_a + 1 + (w_len // 3), sz_a, 34)
            world.set(sx_a + w_side * (2 + w_len), sy_a + 1 + (w_len // 3), sz_a - 1, 61)
    # Mast & sail
    for y in range(sy_a + 2, sy_a + 11):
        world.set(sx_a, y, sz_a, 33)
        for sw in range(-3, 4):
            if sy_a + 3 <= y <= sy_a + 9:
                world.set(sx_a + sw, y, sz_a + int(math.sin((y - sy_a) * 0.5)), 62 if abs(sw) == 3 else 9)

    print("[7/9] Planting Ancient Ginkgo Trees & Cliffside Welcoming Pines...")
    # 1. Giant Golden Autumn Ginkgo Tree (千年古银杏) on the West Courtyard (X=40, Y=49, Z=74)
    gx, gy, gz = 40, 49, 73
    # Gnarled trunk & roots
    world.draw_line(gx, gy, gz, gx - 1, gy + 9, gz + 1, 16, radius=1.6)
    branches = [
        (gx - 1, gy + 8, gz + 1, gx - 6, gy + 14, gz + 4, 4.8),
        (gx - 1, gy + 9, gz + 1, gx + 4, gy + 15, gz - 2, 4.5),
        (gx - 1, gy + 9, gz + 1, gx - 2, gy + 17, gz - 3, 5.2),
        (gx - 1, gy + 7, gz + 1, gx + 3, gy + 12, gz + 5, 4.0),
    ]
    for bx1, by1, bz1, bx2, by2, bz2, br in branches:
        world.draw_line(bx1, by1, bz1, bx2, by2, bz2, 16, radius=0.9)
        ir = int(math.ceil(br))
        for dy in range(-ir, ir + 1):
            for dz in range(-ir, ir + 1):
                for dx in range(-ir, ir + 1):
                    d = math.sqrt(dx*dx + (dy*1.3)**2 + dz*dz)
                    if d <= br - smooth_noise(bx2+dx, by2+dy, bz2+dz, 2.5) * 1.6:
                        col = 45 if dy > 1 else (44 if (dx + dz) % 2 == 0 else 43)
                        world.set(bx2 + dx, by2 + dy, bz2 + dz, col)
    # Fallen golden ginkgo leaves carpet on the courtyard below
    for dz in range(-7, 8):
        for dx in range(-7, 8):
            if dx*dx + dz*dz <= 45 and hash3(gx+dx, 99, gz+dz) > 0.55:
                if world.get(gx+dx, PLATFORM_Y, gz+dz) in (12, 13, 41):
                    world.set(gx+dx, PLATFORM_Y, gz+dz, 44 if (dx+dz)%2==0 else 43)

    # 2. Ancient Welcoming Pine (迎客古松) cantilevering out from the Tea Island cliff (X=16, Y=44, Z=94)
    px_t, py_t, pz_t = 16, 44, 94
    world.draw_line(px_t, py_t, pz_t, px_t - 5, py_t + 6, pz_t + 4, 15, radius=1.3)
    world.draw_line(px_t - 5, py_t + 6, pz_t + 4, px_t - 10, py_t + 7, pz_t + 7, 15, radius=0.9)
    pine_pads = [
        (px_t - 5, py_t + 7, pz_t + 4, 5.0, 2.0),
        (px_t - 10, py_t + 8, pz_t + 7, 5.5, 2.0),
        (px_t - 2, py_t + 9, pz_t + 1, 4.5, 2.0),
    ]
    for cx_p, cy_p, cz_p, rx_p, ry_p in pine_pads:
        for dy in range(-2, 3):
            for dz in range(-6, 7):
                for dx in range(-6, 7):
                    if (dx/rx_p)**2 + (dy/ry_p)**2 + (dz/rx_p)**2 <= 1.0:
                        world.set(cx_p + dx, cy_p + dy, cz_p + dz, 41 if dy >= 0 else 39)

    # 3. Spirit Blossom Tree (仙樱树) on the North-East Terrace (X=84, Y=49, Z=50)
    sx_t, sy_t, sz_t = 84, 49, 50
    world.draw_line(sx_t, sy_t, sz_t, sx_t + 2, sy_t + 8, sz_t - 1, 16, radius=1.3)
    for bx_o, by_o, bz_o, br in [(0, 9, 0, 5.0), (4, 8, -2, 4.2), (-3, 7, 3, 4.0)]:
        for dy in range(-3, 4):
            for dz in range(-5, 6):
                for dx in range(-5, 6):
                    if math.sqrt(dx*dx + (dy*1.3)**2 + dz*dz) <= br - smooth_noise(dx, dy, dz, 2.0):
                        world.set(sx_t + bx_o + dx, sy_t + by_o + dy, sz_t + bz_o + dz, 46 if (dx+dy+dz)%2==0 else 22)

    print("[8/9] Sculpting Swirling Cloud Sea, Floating Runes & Sky Lanterns...")
    # Swirling auspicious cloud ribbons (流云飞霭) encircling the base at Y=8..20
    cloud_arcs = [
        (32, 14, 102, 16.0, 4.0),
        (48, 11, 108, 14.0, 3.5),
        (92, 16, 106, 15.0, 3.8),
        (18, 18, 62, 14.0, 3.5),
        (108, 19, 64, 15.0, 3.8),
        (42, 15, 20, 16.0, 3.8),
        (82, 14, 18, 15.0, 3.5),
    ]
    for cx_cl, cy_cl, cz_cl, r_xz, r_y in cloud_arcs:
        ir = int(r_xz + 2)
        for dy in range(-4, 5):
            for dz in range(-ir, ir + 1):
                for dx in range(-ir, ir + 1):
                    d = math.sqrt((dx / r_xz)**2 + (dy / r_y)**2 + (dz / (r_xz * 0.65))**2)
                    n_c = smooth_noise(cx_cl + dx, cy_cl + dy, cz_cl + dz, 4.0)
                    if d + (n_c - 0.5) * 0.35 < 0.85:
                        if world.get(cx_cl + dx, cy_cl + dy, cz_cl + dz) == 0:
                            world.set(cx_cl + dx, cy_cl + dy, cz_cl + dz, 54 if dy >= 0 else 53)

    # Floating Sky Lanterns (孔明灯) & Orbiting Aether Astrolabe Fragments across the sky!
    lanterns = [
        (18, 72, 88), (28, 84, 104), (44, 96, 96), (86, 90, 92),
        (106, 78, 78), (94, 102, 54), (34, 104, 42), (76, 112, 74),
        (50, 114, 56), (22, 62, 44), (108, 68, 48), (58, 82, 108),
    ]
    for lx, ly, lz in lanterns:
        world.fill_box(lx - 1, ly, lz - 1, lx + 1, ly + 2, lz + 1, 61)
        world.set(lx, ly + 1, lz, 62)   # Bright core
        world.set(lx, ly + 3, lz, 21)   # Red cap
        world.set(lx, ly - 1, lz, 35)   # Gold tassel
        world.set(lx, ly - 2, lz, 63)

    return world


def export_vox(world, filepath):
    """Writes standard MagicaVoxel .vox v150 format (converting Y-up to MagicaVoxel Z-up)."""
    voxels = []
    nx, ny, nz = world.nx, world.ny, world.nz
    grid = world.grid
    # Collect surface voxels only (hollow out completely interior invisible blocks for fast MagicaVoxel & WebGL performance!)
    for y in range(ny):
        y_off = y * nx * nz
        for z in range(nz):
            z_off = y_off + z * nx
            for x in range(nx):
                c = grid[z_off + x]
                if c == 0:
                    continue
                # Check 6 neighbors; if all 6 are opaque (>0 and not glass/water), we can cull interior voxel
                if 0 < x < nx - 1 and 0 < y < ny - 1 and 0 < z < nz - 1:
                    n_xm = grid[z_off + x - 1]
                    n_xp = grid[z_off + x + 1]
                    n_zm = grid[y_off + (z - 1) * nx + x]
                    n_zp = grid[y_off + (z + 1) * nx + x]
                    n_ym = grid[(y - 1) * nx * nz + z * nx + x]
                    n_yp = grid[(y + 1) * nx * nz + z * nx + x]
                    if n_xm and n_xp and n_zm and n_zp and n_ym and n_yp:
                        # Keep if any neighbor is semi-transparent water (47..51)
                        if not any(47 <= nb <= 51 for nb in (n_xm, n_xp, n_zm, n_zp, n_ym, n_yp)):
                            continue
                # In MagicaVoxel: X is right, Y is depth (our Z), Z is up (our Y)
                voxels.append((x, (nz - 1 - z), y, c))

    print(f"[9/9] Exporting {len(voxels):,} surface voxels to {filepath} ...")

    # Build SIZE chunk
    size_data = struct.pack("<iii", nx, nz, ny)
    size_chunk = b"SIZE" + struct.pack("<ii", len(size_data), 0) + size_data

    # Build XYZI chunk
    xyzi_payload = bytearray(struct.pack("<i", len(voxels)))
    for vx, vy, vz, vc in voxels:
        xyzi_payload.extend(struct.pack("<BBBB", vx, vy, vz, vc))
    xyzi_chunk = b"XYZI" + struct.pack("<ii", len(xyzi_payload), 0) + bytes(xyzi_payload)

    # Build RGBA chunk (256 entries; index i in voxel maps to palette entry i-1 in RGBA chunk)
    rgba_payload = bytearray()
    for i in range(1, 257):
        if i < len(PALETTE_DEFS):
            r, g, b = PALETTE_DEFS[i][0], PALETTE_DEFS[i][1], PALETTE_DEFS[i][2]
            rgba_payload.extend(struct.pack("<BBBB", r, g, b, 255))
        else:
            rgba_payload.extend(struct.pack("<BBBB", 0, 0, 0, 255))
    rgba_chunk = b"RGBA" + struct.pack("<ii", len(rgba_payload), 0) + bytes(rgba_payload)

    children = size_chunk + xyzi_chunk + rgba_chunk
    main_chunk = b"MAIN" + struct.pack("<ii", 0, len(children)) + children

    with open(filepath, "wb") as f:
        f.write(b"VOX " + struct.pack("<i", 150) + main_chunk)

    return voxels


def export_web_data(world, voxels, js_filepath):
    """Exports compact base64-encoded binary voxel buffer + rich material palette for the WebGL viewer."""
    import base64
    # Pack each surface voxel as 4 bytes: x, y, z, color_index (in our Y-up coordinate system)
    raw = bytearray()
    nx, ny, nz = world.nx, world.ny, world.nz
    grid = world.grid

    # Also compute quick 6-bit face visibility mask + ambient occlusion byte per voxel so WebGL can render with crisp AO!
    # Wait: 4 bytes per voxel (x, y, z, c) is super clean and only ~280 KB in base64!
    for vx, mv_y, mv_z, vc in voxels:
        x = vx
        y = mv_z
        z = (nz - 1) - mv_y
        raw.extend((x, y, z, vc))

    b64_str = base64.b64encode(bytes(raw)).decode("ascii")

    palette_json = []
    for i, p in enumerate(PALETTE_DEFS):
        palette_json.append({
            "id": i,
            "r": p[0], "g": p[1], "b": p[2],
            "type": p[3],
            "emit": p[4],
            "rough": p[5],
            "metal": p[6],
            "alpha": p[7],
            "name": p[8]
        })

    content = f"""// Auto-generated Voxel Scene Data for 《浮空千机书院》
window.VOXEL_SCENE = {{
  dimensions: [{nx}, {ny}, {nz}],
  voxelCount: {len(voxels)},
  palette: {json.dumps(palette_json, ensure_ascii=False)},
  dataB64: "{b64_str}"
}};
"""
    with open(js_filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Exported WebGL data ({len(b64_str)//1024} KB) to {js_filepath}")


if __name__ == "__main__":
    out_dir = "/Users/thysummer/工作流/code/体素/fukong-qianji-shuyuan"
    world = generate_scene()
    vox_path = os.path.join(out_dir, "浮空千机书院.vox")
    js_path = os.path.join(out_dir, "voxel_data.js")
    voxels = export_vox(world, vox_path)
    export_web_data(world, voxels, js_path)
    print("Done!")
