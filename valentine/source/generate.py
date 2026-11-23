#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import random
import struct
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UNIT = 0.13

PALETTE = [
    ("valentine", "#d92e27"),
    ("signal_red", "#f04a38"),
    ("oxide_red", "#9d201e"),
    ("ink_black", "#17191a"),
    ("soft_black", "#2b2d2e"),
    ("graphite", "#45494a"),
    ("steel", "#989e9c"),
    ("dark_steel", "#555d5e"),
    ("paper", "#f3eddc"),
    ("paper_shade", "#ded5c1"),
    ("ivory", "#fff8e6"),
    ("ribbon", "#371b1c"),
    ("rubber", "#101315"),
    ("chrome", "#d8dcd8"),
    ("copper", "#a85a3e"),
]
C = {name: i + 1 for i, (name, _) in enumerate(PALETTE)}
rng = random.Random(1969)


class Voxels:
    def __init__(self):
        self.data: dict[tuple[int, int, int], int] = {}

    def set(self, x, y, z, color):
        if color:
            self.data[(int(x), int(y), int(z))] = int(color)

    def box(self, x0, x1, y0, y1, z0, z1, color):
        for x in range(math.floor(x0), math.ceil(x1) + 1):
            for y in range(math.floor(y0), math.ceil(y1) + 1):
                for z in range(math.floor(z0), math.ceil(z1) + 1):
                    self.set(x, y, z, color)

    def erase(self, x0, x1, y0, y1, z0, z1):
        for x in range(math.floor(x0), math.ceil(x1) + 1):
            for y in range(math.floor(y0), math.ceil(y1) + 1):
                for z in range(math.floor(z0), math.ceil(z1) + 1):
                    self.data.pop((x, y, z), None)

    def rounded_box(self, x0, x1, y0, y1, z0, z1, rx, ry, rz, color):
        cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
        hx, hy, hz = (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2
        for x in range(math.floor(x0), math.ceil(x1) + 1):
            for y in range(math.floor(y0), math.ceil(y1) + 1):
                for z in range(math.floor(z0), math.ceil(z1) + 1):
                    dx = max(abs(x - cx) - (hx - rx), 0)
                    dy = max(abs(y - cy) - (hy - ry), 0)
                    dz = max(abs(z - cz) - (hz - rz), 0)
                    if dx * dx + dy * dy + dz * dz <= min(rx, ry, rz) ** 2:
                        self.set(x, y, z, color)

    def cylinder(self, axis, a0, a1, b, c, radius, color, hollow=0):
        for a in range(math.floor(a0), math.ceil(a1) + 1):
            for u in range(math.floor(b - radius), math.ceil(b + radius) + 1):
                for v in range(math.floor(c - radius), math.ceil(c + radius) + 1):
                    d2 = (u - b) ** 2 + (v - c) ** 2
                    if hollow * hollow <= d2 <= radius * radius + 0.6:
                        if axis == "x":
                            self.set(a, u, v, color)
                        elif axis == "y":
                            self.set(u, a, v, color)
                        else:
                            self.set(u, v, a, color)

    def line(self, p0, p1, radius, color):
        length = math.dist(p0, p1)
        steps = max(1, math.ceil(length * 1.8))
        for i in range(steps + 1):
            t = i / steps
            p = tuple(p0[j] + (p1[j] - p0[j]) * t for j in range(3))
            r = max(0, round(radius))
            for dx in range(-r, r + 1):
                for dy in range(-r, r + 1):
                    for dz in range(-r, r + 1):
                        if dx * dx + dy * dy + dz * dz <= radius * radius + 0.25:
                            self.set(round(p[0]) + dx, round(p[1]) + dy, round(p[2]) + dz, color)

    def gear(self, cx, cy, cz, radius, teeth, thickness, color):
        for x in range(cx - radius - 2, cx + radius + 3):
            for z in range(cz - radius - 2, cz + radius + 3):
                dx, dz = x - cx, z - cz
                angle = math.atan2(dz, dx)
                outer = radius + (1.6 if math.cos(angle * teeth) > 0.25 else 0)
                if dx * dx + dz * dz <= outer * outer:
                    self.box(x, x, cy - thickness // 2, cy + thickness // 2, z, z, color)
        self.cylinder("y", cy - thickness, cy + thickness, cx, cz, max(1, radius // 4), C["dark_steel"], hollow=max(0, radius // 4 - 1))


GLYPHS = {
    "1": ["010", "110", "010", "010", "111"],
    "2": ["110", "001", "010", "100", "111"],
    "3": ["110", "001", "010", "001", "110"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "110", "001", "110"],
    "6": ["011", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "110"],
    "0": ["111", "101", "101", "101", "111"],
    "-": ["000", "000", "111", "000", "000"],
    "=": ["000", "111", "000", "111", "000"],
    "Q": ["111", "101", "101", "111", "011"],
    "W": ["101", "101", "101", "111", "101"],
    "E": ["111", "100", "110", "100", "111"],
    "R": ["110", "101", "110", "101", "101"],
    "T": ["111", "010", "010", "010", "010"],
    "Y": ["101", "101", "010", "010", "010"],
    "U": ["101", "101", "101", "101", "111"],
    "I": ["111", "010", "010", "010", "111"],
    "O": ["111", "101", "101", "101", "111"],
    "P": ["110", "101", "110", "100", "100"],
    "[": ["110", "100", "100", "100", "110"],
    "A": ["010", "101", "111", "101", "101"],
    "S": ["111", "100", "111", "001", "111"],
    "D": ["110", "101", "101", "101", "110"],
    "F": ["111", "100", "110", "100", "100"],
    "G": ["111", "100", "101", "101", "111"],
    "H": ["101", "101", "111", "101", "101"],
    "J": ["001", "001", "001", "101", "111"],
    "K": ["101", "101", "110", "101", "101"],
    "L": ["100", "100", "100", "100", "111"],
    ";": ["000", "010", "000", "010", "100"],
    "'": ["010", "010", "000", "000", "000"],
    "Z": ["111", "001", "010", "100", "111"],
    "X": ["101", "101", "010", "101", "101"],
    "C": ["111", "100", "100", "100", "111"],
    "V": ["101", "101", "101", "101", "010"],
    "B": ["110", "101", "110", "101", "110"],
    "N": ["101", "111", "111", "111", "101"],
    "M": ["101", "111", "111", "101", "101"],
    ",": ["000", "000", "000", "010", "100"],
    ".": ["000", "000", "000", "000", "010"],
    "/": ["001", "001", "010", "100", "100"],
    "↵": ["000", "101", "111", "101", "000"],
}


def top_body(z):
    return round(33 - (z + 32) * 0.15)


def add_glyph(v, char, x, y, z, color, plane="top"):
    glyph = GLYPHS.get(char.upper(), GLYPHS["."])
    for row, line in enumerate(glyph):
        for col, bit in enumerate(line):
            if bit != "1":
                continue
            if plane == "top":
                v.set(x + col, y, z + row - 2, color)
            else:
                v.set(x + col, y - row, z, color)


def new_group(name, kind, visible=True, offset=(0, 0, 0)):
    return {"name": name, "kind": kind, "visible": visible, "offset": list(offset), "voxels": Voxels()}


def make_case():
    g = new_group("case", "plastic", offset=(0, 0, 0))
    v = g["voxels"]
    v.rounded_box(-49, 49, 4, 9, -34, 37, 4, 2, 4, C["rubber"])
    v.rounded_box(-48, 48, 8, 15, -33, 36, 6, 3, 5, C["oxide_red"])

    for z in range(-32, 35):
        top = top_body(z)
        edge_distance = min(z + 32, 34 - z)
        corner = 6
        if edge_distance < corner:
            inset = round(corner - math.sqrt(max(0, corner * corner - edge_distance * edge_distance)))
        else:
            inset = 0
        for y in range(13, top + 1):
            bevel = 2 if y >= top - 2 or y <= 15 else 0
            half = 48 - inset - bevel
            for x in range(-half, half + 1):
                if y == top:
                    color = C["signal_red"] if rng.random() > 0.18 else C["valentine"]
                elif abs(x) >= half - 1:
                    color = C["oxide_red"]
                else:
                    color = C["valentine"] if rng.random() > 0.08 else C["signal_red"]
                v.set(x, y, z, color)

    v.erase(-41, 41, top_body(15) - 4, 36, -1, 31)
    v.erase(-41, 41, top_body(-12) - 4, 36, -21, -4)

    v.box(-20, 20, 15, 16, 37, 37, C["signal_red"])
    for side in (-1, 1):
        for z in range(-13, 15, 3):
            v.box(side * 48, side * 49, 18, 23, z, z + 1, C["oxide_red"])
        v.cylinder("x", side * 48, side * 49, 7, -25, 3, C["rubber"])
        v.cylinder("x", side * 48, side * 49, 7, 27, 3, C["rubber"])

    label = "OLIVETTI"
    start = -16
    for i, char in enumerate(label):
        add_glyph(v, char, start + i * 4, 24, 37, C["ivory"], plane="front")
    v.box(-16, 18, 20, 20, 38, 38, C["ivory"])
    return g


def make_keyboard():
    g = new_group("keyboard", "plastic", offset=(0, 1.25, 0.65))
    v = g["voxels"]
    for z in range(0, 32):
        y = top_body(z) - 3
        for x in range(-42, 43):
            color = C["soft_black"] if (x + z) % 7 else C["graphite"]
            v.set(x, y, z, color)
        for x in (-42, 42):
            v.set(x, y + 1, z, C["signal_red"])
    v.box(-39, 39, top_body(29) - 2, top_body(29) - 1, 31, 33, C["oxide_red"])
    return g


def make_key(char, index):
    g = new_group(f"key_{index:02d}", "key", offset=(0, 2.5, 1.2))
    g["char"] = char
    g["key"] = True
    v = g["voxels"]
    v.box(-1, 1, -4, -1, -1, 1, C["dark_steel"])
    v.box(-2, 2, 0, 1, -2, 2, C["ink_black"])
    v.box(-2, 2, 2, 2, -1, 1, C["soft_black"])
    add_glyph(v, char, -1, 3, 0, C["ivory"])
    return g


def make_special_key(name, char, width=13, red=False):
    g = new_group(name, "key", offset=(0, 2.5, 1.2))
    g["char"] = char
    g["key"] = True
    v = g["voxels"]
    v.rounded_box(-width // 2, width // 2, 0, 2, -2, 2, 2, 1, 2, C["signal_red"] if red else C["ink_black"])
    v.box(-width // 2 + 2, width // 2 - 2, -3, -1, -1, 1, C["dark_steel"])
    if char == "↵":
        add_glyph(v, char, -1, 3, 0, C["ivory"])
    return g


def make_ribbon_cover():
    g = new_group("ribbon_cover", "plastic", offset=(0, 2.25, -0.15))
    v = g["voxels"]
    v.rounded_box(-40, 40, 31, 34, -20, -5, 4, 2, 3, C["ink_black"])
    v.box(-36, 36, 35, 35, -7, -5, C["chrome"])
    v.box(-29, 29, 34, 34, -4, -4, C["ribbon"])
    for x in (-34, 34):
        v.box(x, x + 1, 35, 38, -17, -16, C["signal_red"])
    return g


def make_ribbon():
    g = new_group("ribbon", "rubber", visible=False, offset=(0, 1.8, -0.25))
    v = g["voxels"]
    for x in (-27, 27):
        v.cylinder("y", 29, 33, x, -12, 6, C["ribbon"])
        v.cylinder("y", 28, 35, x, -12, 2, C["chrome"])
        for a in range(0, 360, 45):
            xx = x + round(math.cos(math.radians(a)) * 5)
            zz = -12 + round(math.sin(math.radians(a)) * 5)
            v.box(xx, xx, 31, 33, zz, zz, C["soft_black"])
    v.box(-30, 30, 34, 35, -5, -4, C["ribbon"])
    v.box(-30, 30, 34, 35, -5, -5, C["signal_red"])
    return g


def make_carriage_frame():
    g = new_group("carriage_frame", "metal", offset=(0, 2.7, -1.35))
    v = g["voxels"]
    v.cylinder("x", -47, 47, 40, -23, 1.6, C["chrome"])
    v.cylinder("x", -47, 47, 36, -26, 1.2, C["dark_steel"])
    v.box(-42, 42, 41, 43, -23, -20, C["ink_black"])
    v.box(-43, 43, 43, 44, -24, -22, C["chrome"])
    for x in (-40, 40):
        v.rounded_box(x - 3, x + 3, 36, 45, -29, -18, 2, 2, 2, C["dark_steel"])
    return g


def make_platen():
    g = new_group("platen", "rubber", offset=(0, 2.7, -1.35))
    v = g["voxels"]
    v.cylinder("x", -43, 43, 48, -27, 5, C["rubber"])
    v.cylinder("x", -44, 44, 48, -27, 1.5, C["chrome"])
    for side in (-1, 1):
        v.cylinder("x", side * 44, side * 52, 48, -27, 7, C["signal_red"])
        v.cylinder("x", side * 52, side * 53, 48, -27, 5, C["oxide_red"])
        for a in range(0, 360, 30):
            y = 48 + round(math.cos(math.radians(a)) * 6)
            z = -27 + round(math.sin(math.radians(a)) * 6)
            v.box(side * 50, side * 52, y, y, z, z, C["ink_black"])
    return g


def make_paper():
    g = new_group("paper", "paper", offset=(0, 2.7, -1.35))
    v = g["voxels"]
    for x in range(-32, 33):
        top = 80 - (1 if abs(x) > 28 else 0)
        for y in range(43, top + 1):
            curve = round((y - 43) * 0.045)
            z = -31 + curve + (1 if abs(x) >= 30 else 0)
            color = C["paper"] if (x + y) % 13 else C["paper_shade"]
            v.set(x, y, z, color)
    for x in range(-31, 32):
        v.set(x, 44, -29, C["paper_shade"])
        v.set(x, 45, -28, C["paper"])
    return g


def make_paper_bail():
    g = new_group("paper_bail", "metal", offset=(0, 2.7, -1.35))
    v = g["voxels"]
    v.cylinder("x", -35, 35, 54, -23, 1.2, C["chrome"])
    for x in (-35, 35):
        v.line((x, 45, -27), (x, 55, -23), 1, C["dark_steel"])
        v.cylinder("x", x - 2, x + 2, 54, -23, 2.4, C["rubber"])
    v.line((-24, 43, -35), (-24, 67, -36), 1, C["chrome"])
    v.line((24, 43, -35), (24, 67, -36), 1, C["chrome"])
    for y in (51, 59, 67):
        v.line((-24, y, -36), (24, y, -36), 1, C["chrome"])
    return g


def make_mechanism():
    g = new_group("mechanism", "metal", visible=False, offset=(0, 1.9, 0))
    v = g["voxels"]
    v.rounded_box(-40, 40, 11, 14, -20, 23, 3, 1, 3, C["dark_steel"])
    v.cylinder("x", -37, 37, 18, 0, 1.5, C["chrome"])
    v.gear(-23, 16, -7, 8, 14, 3, C["steel"])
    v.gear(23, 16, -7, 8, 14, 3, C["steel"])
    v.gear(0, 18, -15, 7, 20, 2, C["steel"])
    v.cylinder("y", 13, 21, 0, -15, 1.5, C["chrome"])

    for i in range(21):
        t = i / 20
        x = round(-32 + t * 64)
        z = round(18 - t * 4)
        v.line((x, 16, z), (x * 0.55, 22, -9), 0.8, C["steel"])
        v.box(round(x * 0.55) - 1, round(x * 0.55) + 1, 21, 23, -10, -8, C["ink_black"])

    for i in range(15):
        angle = math.radians(-80 + i * 11.4)
        start = (round(math.sin(angle) * 7), 24, -10)
        end = (round(math.sin(angle) * 31), 28 + round(math.cos(angle) * 4), -10 - round(math.cos(angle) * 19))
        v.line(start, end, 1, C["steel"])
        v.box(end[0] - 1, end[0] + 1, end[1], end[1] + 2, end[2] - 1, end[2] + 1, C["ink_black"])

    for side in (-1, 1):
        for i in range(6):
            y = 16 + i * 2
            v.line((side * 31, y, 13), (side * 38, y, -15), 0.8, C["copper"])
    return g


def make_side_controls():
    g = new_group("side_controls", "plastic", offset=(0, 0.75, 0.65))
    v = g["voxels"]
    v.cylinder("x", 47, 54, 26, -13, 5, C["ink_black"])
    v.cylinder("x", 54, 55, 26, -13, 3, C["signal_red"])
    for x in (-43, 43):
        v.rounded_box(x - 3, x + 3, 30, 35, -24, -20, 2, 1, 2, C["ink_black"])
    return g


def build():
    groups = [make_case(), make_keyboard(), make_ribbon_cover(), make_ribbon(), make_carriage_frame(), make_platen(), make_paper(), make_paper_bail(), make_mechanism(), make_side_controls()]

    rows = [
        (list("1234567890-="), -1, -38),
        (list("QWERTYUIOP["), 6, -35),
        (list("ASDFGHJKL;'"), 13, -35),
        (list("ZXCVBNM,./"), 20, -32),
    ]
    index = 0
    for chars, z, start_x in rows:
        for j, char in enumerate(chars):
            g = make_key(char, index)
            x = start_x + j * 7
            g["position"] = [x, top_body(z) - 1, z]
            g["rotation"] = [0.15, 0, 0]
            groups.append(g)
            index += 1

    tab = make_special_key("key_tab", "\t", 7)
    tab["position"] = [-43, top_body(13) - 1, 13]
    tab["rotation"] = [0.15, 0, 0]
    groups.append(tab)
    ret = make_special_key("key_return", "↵", 8, red=True)
    ret["position"] = [43, top_body(20) - 1, 20]
    ret["rotation"] = [0.15, 0, 0]
    groups.append(ret)
    space = make_special_key("key_space", " ", 25)
    space["position"] = [0, top_body(28) - 1, 28]
    space["rotation"] = [0.15, 0, 0]
    groups.append(space)
    return groups


def export_binary(groups):
    out = bytearray(b"VXV1" + struct.pack("<I", len(groups)))
    for g in groups:
        name = g["name"].encode("utf-8")
        out += struct.pack("<I", len(name)) + name
        out += struct.pack("<I", len(g["voxels"].data))
        for (x, y, z), color in sorted(g["voxels"].data.items()):
            out += struct.pack("<hhhB", x, y, z, color)
    (ROOT / "js" / "voxels.bin").write_bytes(out)


def export_meta(groups):
    meta = []
    total = 0
    surface = 0
    for g in groups:
        total += len(g["voxels"].data)
        visible_names = {"case", "keyboard", "ribbon_cover", "carriage_frame", "platen", "paper", "paper_bail", "side_controls"}
        count_surface = g["name"] in visible_names or g.get("key")
        if count_surface:
            for x, y, z in g["voxels"].data:
                for dx, dy, dz in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)):
                    if (x + dx, y + dy, z + dz) not in g["voxels"].data:
                        surface += 1
        meta.append({
            "name": g["name"],
            "kind": g["kind"],
            "visible": g["visible"],
            "offset": g["offset"],
            "position": g.get("position", [0, 0, 0]),
            "rotation": g.get("rotation", [0, 0, 0]),
            "char": g.get("char"),
            "key": g.get("key", False),
        })

    stats = {
        "title": "VALENTINE",
        "artist": "HungerG (Qwen)",
        "voxelCount": total,
        "surfaceFaces": surface,
        "groupCount": len(groups),
        "unitMeters": UNIT,
        "dimensionsVoxels": [108, 82, 76],
        "palette": [{"name": name, "hex": hex_value} for name, hex_value in PALETTE],
    }
    (ROOT / "js" / "model.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "js" / "stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "js" / "palette.json").write_text(json.dumps([hex_value for _, hex_value in PALETTE], indent=2), encoding="utf-8")


def chunk(tag, content=b"", children=b""):
    return tag + struct.pack("<II", len(content), len(children)) + content + children


def export_vox(groups):
    models = []
    bounds = []
    for g in groups:
        pos = g.get("position", [0, 0, 0])
        voxels = [(x + pos[0], y + pos[1], z + pos[2], c) for (x, y, z), c in g["voxels"].data.items()]
        xs, ys, zs = [p[0] for p in voxels], [p[1] for p in voxels], [p[2] for p in voxels]
        bounds.append((min(xs), min(ys), min(zs), max(xs), max(ys), max(zs)))
    minx = min(b[0] for b in bounds)
    miny = min(b[1] for b in bounds)
    minz = min(b[2] for b in bounds)
    maxx = max(b[3] for b in bounds)
    maxy = max(b[4] for b in bounds)
    maxz = max(b[5] for b in bounds)
    size = (maxx - minx + 1, maxy - miny + 1, maxz - minz + 1)
    if max(size) > 256:
        raise ValueError(f"MagicaVoxel model exceeds 256 voxels: {size}")

    for g, b in zip(groups, bounds):
        pos = g.get("position", [0, 0, 0])
        xyz = bytearray(struct.pack("<I", len(g["voxels"].data)))
        for (x, y, z), color in sorted(g["voxels"].data.items()):
            gx, gy, gz = x + pos[0], y + pos[1], z + pos[2]
            xyz += bytes((gx - minx, gy - miny, gz - minz, color))
        models.append(chunk(b"SIZE", struct.pack("<III", *size)) + chunk(b"XYZI", bytes(xyz)))

    rgba = bytearray()
    for i in range(256):
        if i < len(PALETTE):
            value = PALETTE[i][1].lstrip("#")
            rgba += bytes((int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), 255))
        else:
            rgba += bytes((0, 0, 0, 255))
    children = chunk(b"PACK", struct.pack("<I", len(groups))) + b"".join(models) + chunk(b"RGBA", bytes(rgba))
    data = b"VOX " + struct.pack("<I", 150) + chunk(b"MAIN", b"", children)
    (ROOT / "export" / "valentine.vox").write_bytes(data)
    info = {
        "title": "VALENTINE",
        "artist": "HungerG (Qwen)",
        "format": "MagicaVoxel 150",
        "models": len(groups),
        "modelSizeVoxels": list(size),
        "voxels": sum(len(g["voxels"].data) for g in groups),
        "note": "Separate models preserve the keyboard, carriage, paper and mechanism for editing.",
    }
    (ROOT / "export" / "export_info.json").write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    groups = build()
    export_binary(groups)
    export_meta(groups)
    export_vox(groups)
    stats = json.loads((ROOT / "js" / "stats.json").read_text())
    print(json.dumps({k: stats[k] for k in ("voxelCount", "surfaceFaces", "groupCount")}, indent=2))


if __name__ == "__main__":
    main()
