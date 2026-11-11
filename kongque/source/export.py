#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""导出 MagicaVoxel .vox 与 Minecraft Sponge .schem (v2, gzip NBT).
颜色->方块 最近邻映射; 裁剪到包围盒; 读回校验."""
import numpy as np, json, os, struct, gzip, io

HERE = os.path.dirname(os.path.abspath(__file__))
EX = os.path.join(HERE, "..", "export")
JS = os.path.join(HERE, "..", "js")
pal = json.load(open(os.path.join(JS, "palette.json")))
d = np.load(os.path.join(EX, "full.npz"))
pos, pidx, origin, dims = d["pos"], d["pal"], d["origin"], d["dims"]

# crop to bbox
mn = pos.min(axis=0); mx = pos.max(axis=0)
size = (mx - mn + 1)
local = pos - mn
NX, NY, NZ = int(size[0]), int(size[1]), int(size[2])
print("crop dims", NX, NY, NZ, "voxels", len(pos))

# ---------------- MagicaVoxel .vox (z-up, tiled <=255 + scene graph) ----------------
def write_vox(path):
    TX = (NX + 255) // 256; TY = (NY + 255) // 256
    tiles = []
    for ty in range(TY):
        for tx in range(TX):
            sel = (local[:, 0] >= tx * 256) & (local[:, 0] < (tx + 1) * 256) & \
                  (local[:, 1] >= ty * 256) & (local[:, 1] < (ty + 1) * 256)
            lp = local[sel] - np.array([tx * 256, ty * 256, 0])
            tiles.append((tx, ty, lp, pidx[sel]))
    out = io.BytesIO()
    def chunk(cid, payload):
        out.write(cid); out.write(struct.pack("<II", len(payload), 0)); out.write(payload)
    def sstr(s):
        b = s.encode(); return struct.pack("<i", len(b)) + b
    def dic(d):
        b = struct.pack("<i", len(d))
        for k, v in d.items(): b += sstr(k) + sstr(v)
        return b
    # models: SIZE + XYZI per tile
    for (tx, ty, lp, cp) in tiles:
        w = min(256, NX - tx * 256); h = min(256, NY - ty * 256)
        chunk(b"SIZE", struct.pack("<iii", w, NZ, h))
        xyz = bytearray()
        for (x, y, z), c in zip(lp, cp):
            xyz += struct.pack("<BBBB", int(x), int(z), int(y), int(c))
        chunk(b"XYZI", struct.pack("<i", len(lp)) + bytes(xyz))
    # scene graph: root group -> transform -> shape per tile
    n = len(tiles)
    grp = struct.pack("<i", 0) + dic({}) + struct.pack("<i", n)
    for m in range(n): grp += struct.pack("<i", 1 + m)
    chunk(b"nGRP", grp)
    for m, (tx, ty, lp, cp) in enumerate(tiles):
        trn = struct.pack("<i", 1 + m) + dic({}) + struct.pack("<iii", 5 + m, -1, -1)
        trn += struct.pack("<i", 1) + dic({"_t": f"{tx*256} 0 {ty*256}"})
        chunk(b"nTRN", trn)
    for m in range(n):
        shp = struct.pack("<i", 5 + m) + dic({}) + struct.pack("<i", 1)
        shp += struct.pack("<i", m) + dic({})
        chunk(b"nSHP", shp)
    rgba = bytearray()
    for i in range(256):
        if i < len(pal):
            r, g, b = pal[i]["rgb"]; rgba += bytes([r, g, b, 255])
        else:
            rgba += bytes([0, 0, 0, 255])
    chunk(b"RGBA", bytes(rgba))
    main = out.getvalue()
    with open(path, "wb") as f:
        f.write(b"VOX "); f.write(struct.pack("<i", 150))
        f.write(b"MAIN"); f.write(struct.pack("<II", 0, len(main))); f.write(main)
    return len(local), n

# ---------------- Minecraft block palette ----------------
BLOCKS = {
    "white_concrete": (207, 213, 214), "orange_concrete": (224, 97, 0), "magenta_concrete": (169, 48, 159),
    "light_blue_concrete": (35, 137, 198), "yellow_concrete": (240, 175, 21), "lime_concrete": (94, 168, 24),
    "pink_concrete": (213, 101, 142), "gray_concrete": (54, 57, 61), "light_gray_concrete": (125, 125, 115),
    "cyan_concrete": (21, 119, 136), "purple_concrete": (100, 31, 156), "blue_concrete": (44, 46, 143),
    "brown_concrete": (96, 59, 31), "green_concrete": (73, 91, 36), "red_concrete": (142, 32, 32),
    "black_concrete": (8, 10, 15), "white_wool": (233, 236, 236), "cream_wool": (220, 215, 200),
    "terracotta": (152, 94, 67), "white_terracotta": (209, 178, 161), "orange_terracotta": (161, 83, 37),
    "gold_block": (246, 208, 61), "iron_block": (220, 220, 220), "lapis_block": (30, 67, 140),
    "emerald_block": (42, 176, 71), "diamond_block": (98, 219, 214), "obsidian": (15, 10, 25),
    "copper_block": (192, 107, 79), "exposed_copper": (161, 125, 103), "oxidized_copper": (82, 162, 132),
    "moss_block": (89, 109, 45), "dirt": (134, 96, 67), "stone": (125, 125, 125), "andesite": (136, 136, 136),
    "deepslate": (80, 80, 82), "sand": (219, 207, 163), "hay_block": (166, 136, 38),
    "sea_lantern": (172, 199, 190), "glowstone": (249, 212, 156), "amethyst_block": (133, 97, 191),
    "calcite": (223, 224, 220), "tuff": (108, 109, 102), "packed_mud": (142, 106, 79),
    "warped_planks": (43, 104, 99), "oak_planks": (162, 130, 78), "spruce_planks": (114, 84, 48),
    "birch_planks": (192, 175, 121), "dark_oak_planks": (60, 46, 26), "cherry_planks": (226, 178, 172),
    "bamboo_planks": (194, 173, 80), "mangrove_planks": (117, 54, 48), "blue_ice": (116, 167, 253),
    "prismarine": (99, 156, 151), "dark_prismarine": (51, 91, 75), "netherite_block": (66, 61, 63),
}
# remove fake cream_wool (not a real block) -> map to white_wool/calcite
BLOCKS.pop("cream_wool")
names = list(BLOCKS); cols = np.array([BLOCKS[n] for n in names], dtype=float)
def nearest(rgb):
    dist = ((cols - np.array(rgb, dtype=float)) ** 2).sum(axis=1)
    return names[int(dist.argmin())]
pal_block = [nearest(p["rgb"]) if i > 0 else "air" for i, p in enumerate(pal)]
used = sorted(set(pal_block[1:]))
block_id = {n: i for i, n in enumerate(used)}
print("blocks used:", len(used))

# ---------------- NBT writer ----------------
def nbt_string(s):
    b = s.encode("utf-8"); return struct.pack(">H", len(b)) + b
def varint(v):
    out = bytearray()
    while True:
        b = v & 0x7f; v >>= 7
        if v: out.append(b | 0x80)
        else: out.append(b); break
    return bytes(out)
def write_schem(path):
    W, H, L = NX, NY, NZ
    grid = np.zeros((H, L, W), dtype=np.int32)  # [y,z,x]
    for (x, y, z), c in zip(local, pidx):
        grid[int(y), int(z), int(x)] = block_id[pal_block[int(c)]] + 1  # 0=air
    flat = grid.reshape(-1)
    assert len(used) < 127, "palette too large for single-byte varint"
    data = flat.astype("<u1").tobytes()  # ids <128 -> single-byte varint
    buf = io.BytesIO()
    def tag(t, name, payload): buf.write(bytes([t])); buf.write(nbt_string(name)); buf.write(payload)
    def compound_body(items):
        b = io.BytesIO()
        for t, name, payload in items:
            b.write(bytes([t])); b.write(nbt_string(name)); b.write(payload)
        b.write(b"\x00"); return b.getvalue()
    palette_items = [(3, "minecraft:" + n, struct.pack(">i", i)) for n, i in block_id.items()]
    root_items = [
        (3, "Version", struct.pack(">i", 2)),
        (3, "DataVersion", struct.pack(">i", 3700)),
        (2, "Width", struct.pack(">h", W)),
        (2, "Height", struct.pack(">h", H)),
        (2, "Length", struct.pack(">h", L)),
        (3, "PaletteMax", struct.pack(">i", len(used))),
        (10, "Palette", compound_body(palette_items)),
        (7, "BlockData", struct.pack(">i", len(data)) + data),
        (10, "Metadata", compound_body([(8, "Name", nbt_string("kongque-peacock")), (8, "Author", nbt_string("Qwen4-Max-Preview"))])),
    ]
    buf.write(bytes([10])); buf.write(nbt_string("Schematic")); buf.write(compound_body(root_items))
    raw = buf.getvalue()
    with gzip.open(path, "wb") as f:
        f.write(raw)
    return len(raw), len(data)

nv = write_vox(os.path.join(EX, "peacock.vox"))
rawlen, datalen = write_schem(os.path.join(EX, "peacock.schem"))
print("vox voxels", nv, "schem raw", rawlen, "blockdata", datalen)

# ---------------- verify read-back ----------------
with open(os.path.join(EX, "peacock.vox"), "rb") as f:
    assert f.read(4) == b"VOX "; f.read(4)
    assert f.read(4) == b"MAIN"; _, cl = struct.unpack("<II", f.read(8))
    body = f.read(cl)
    assert body[:4] == b"SIZE"
    sx, sy, sz = struct.unpack("<iii", body[12:24])
    print("vox first-tile SIZE", sx, sy, sz)

def read_nbt(buf, off):
    t = buf[off]; off += 1
    if t == 0: return None, off
    ln = struct.unpack(">H", buf[off:off+2])[0]; off += 2
    name = buf[off:off+ln].decode(); off += ln
    if t == 1: v = buf[off]; off += 1
    elif t == 2: v = struct.unpack(">h", buf[off:off+2])[0]; off += 2
    elif t == 3: v = struct.unpack(">i", buf[off:off+4])[0]; off += 4
    elif t == 7:
        n = struct.unpack(">i", buf[off:off+4])[0]; off += 4; v = n; off += n
    elif t == 8:
        n = struct.unpack(">H", buf[off:off+2])[0]; off += 2; v = buf[off:off+n].decode(); off += n
    elif t == 10:
        v = {}
        while True:
            ct = buf[off]
            if ct == 0: off += 1; break
            cv, off = read_nbt(buf, off); v[cv[0]] = cv[1]
        return (name, v), off
    else: raise ValueError("tag %d" % t)
    return (name, v), off

with gzip.open(os.path.join(EX, "peacock.schem"), "rb") as f:
    raw = f.read()
(name, root), _ = read_nbt(raw, 0)
print("schem root", name, "W/H/L", root["Width"], root["Height"], root["Length"],
      "PaletteMax", root["PaletteMax"], "BlockData", root["BlockData"])
assert root["Width"] * root["Height"] * root["Length"] == root["BlockData"]
json.dump({"blocks": used, "crop_dims": [NX, NY, NZ], "voxels": int(len(pos))},
          open(os.path.join(EX, "export_info.json"), "w"), indent=2)
print("export OK")