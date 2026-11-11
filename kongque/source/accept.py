#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验收自检: 文件/无CDN/体素二进制/调色板/导出读回/封面尺寸/展厅集成. 用法: python3 accept.py"""
import os, sys, json, struct, gzip, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
K = os.path.join(HERE, "..")
ROOT = os.path.join(K, "..")
results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))

# 1 files
need = ["index.html", "js/main.js", "js/voxels.bin", "js/palette.json", "js/stats.json",
        "assets/style.css", "vendor/three.module.js", "vendor/jsm/controls/OrbitControls.js",
        "export/peacock.vox", "export/peacock.schem", "design.md", "README.md"]
for f in need:
    check("file " + f, os.path.exists(os.path.join(K, f)))
for f in ["kongque.jpg", "kongque@800.jpg"]:
    check("cover " + f, os.path.exists(os.path.join(ROOT, "assets", "covers", f)))

# 2 no CDN
cdn = []
for f in ["index.html", "js/main.js"]:
    txt = open(os.path.join(K, f), encoding="utf-8").read()
    cdn += re.findall(r"https?://[^\s\"')]+", txt)
check("no external CDN in entry/main", not cdn, str(cdn[:3]))

# 3 voxels.bin
stats = json.load(open(os.path.join(K, "js/stats.json")))
pal = json.load(open(os.path.join(K, "js/palette.json")))
buf = open(os.path.join(K, "js/voxels.bin"), "rb").read()
magic = buf[:4]; n = struct.unpack("<I", buf[4:8])[0]
off = 8 + 6 + 6
posb = buf[off:off + n * 6]; off += n * 6
palb = buf[off:off + n]; off += n
aob = buf[off:off + n]; off += n
matb = buf[off:off + n]; off += n
seedb = buf[off:off + n]; off += n
check("voxels magic", magic == b"KQV1")
check("voxels count == stats", n == stats["surface_voxels"], f"{n} vs {stats['surface_voxels']}")
check("voxels arrays exact", off == len(buf), f"{off}/{len(buf)}")
check("palette idx in range", max(palb) < len(pal))
check("palette entries == stats", len(pal) == stats["palette_entries"])
check("palette fields", all(set(p) >= {"name", "rgb", "mat", "emis"} for p in pal))

# 4 vox read-back (sum XYZI across tiles)
vb = open(os.path.join(K, "export/peacock.vox"), "rb").read()
check("vox magic", vb[:4] == b"VOX ")
i = 8
assert vb[i:i + 4] == b"MAIN"; i += 4
_, cl = struct.unpack("<II", vb[i:i + 8]); i += 8
body = vb[i:i + cl]; j = 0; total = 0; tiles = 0
while j < len(body):
    cid = body[j:j + 4]; ln = struct.unpack("<I", body[j + 4:j + 8])[0]; j += 12
    if cid == b"XYZI":
        total += struct.unpack("<i", body[j:j + 4])[0]; tiles += 1
    j += ln
check("vox tiles>0", tiles > 0, f"tiles={tiles}")
check("vox voxel sum == solid", total == stats["solid_voxels"], f"{total} vs {stats['solid_voxels']}")

# 5 schem NBT read-back
def read_nbt(b, o):
    t = b[o]; o += 1
    if t == 0: return None, o
    ln = struct.unpack(">H", b[o:o + 2])[0]; o += 2
    name = b[o:o + ln].decode(); o += ln
    if t == 2: v = struct.unpack(">h", b[o:o + 2])[0]; o += 2
    elif t == 3: v = struct.unpack(">i", b[o:o + 4])[0]; o += 4
    elif t == 7:
        c = struct.unpack(">i", b[o:o + 4])[0]; o += 4; v = c; o += c
    elif t == 8:
        c = struct.unpack(">H", b[o:o + 2])[0]; o += 2; v = b[o:o + c].decode(); o += c
    elif t == 10:
        v = {}
        while b[o] != 0:
            cv, o = read_nbt(b, o); v[cv[0]] = cv[1]
        o += 1; return (name, v), o
    else: raise ValueError(t)
    return (name, v), o
raw = gzip.open(os.path.join(K, "export/peacock.schem"), "rb").read()
(_, root), _ = read_nbt(raw, 0)
info = json.load(open(os.path.join(K, "export/export_info.json")))
W, H, L = root["Width"], root["Height"], root["Length"]
check("schem dims == crop", [W, H, L] == info["crop_dims"], f"{[W,H,L]}")
check("schem PaletteMax == blocks", root["PaletteMax"] == len(info["blocks"]))
check("schem BlockData == W*H*L", root["BlockData"] == W * H * L)

# 6 covers dims
check("cover 1600x1000", Image.open(os.path.join(ROOT, "assets/covers/kongque.jpg")).size == (1600, 1000))
check("cover 800x500", Image.open(os.path.join(ROOT, "assets/covers/kongque@800.jpg")).size == (800, 500))

# 7 gallery integration
wj = open(os.path.join(ROOT, "assets/js/works.js"), encoding="utf-8").read()
gj = open(os.path.join(ROOT, "assets/js/gallery.js"), encoding="utf-8").read()
check("works.js has kongque", 'slug: "kongque"' in wj)
check("works.js model credit", "Qwen4-Max-Preview" in wj)
check("gallery cat 生灵", "生灵" in gj)

fails = [r for r in results if not r[1]]
for name, ok, detail in results:
    print(("PASS " if ok else "FAIL ") + name + (("  " + detail) if detail and not ok else ""))
print(f"\n{len(results) - len(fails)}/{len(results)} passed")
sys.exit(1 if fails else 0)