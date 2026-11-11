#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""软件预览/静帧渲染器 (painter's algorithm, per-face lambert + baked AO).
用法: python3 render.py [front|iso|side|top] [scale] [out.png]
"""
import numpy as np, json, os, sys, struct, math
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(HERE, "..", "js")

def load():
    with open(os.path.join(JS, "voxels.bin"), "rb") as f:
        magic = f.read(4); n = struct.unpack("<I", f.read(4))[0]
        dims = struct.unpack("<HHH", f.read(6)); origin = struct.unpack("<hhh", f.read(6))
        pos = np.frombuffer(f.read(n*6), dtype="<i2").reshape(n, 3)
        pal = np.frombuffer(f.read(n), dtype=np.uint8)
        ao = np.frombuffer(f.read(n), dtype=np.uint8)
        mat = np.frombuffer(f.read(n), dtype=np.uint8)
        seed = np.frombuffer(f.read(n), dtype=np.uint8)
    palette = json.load(open(os.path.join(JS, "palette.json")))
    return pos, pal, ao, mat, seed, palette, origin, dims

def render(mode="iso", scale=3, out=None, light=(0.5, 0.8, 0.6)):
    pos, pal, ao, mat, seed, palette, origin, dims = load()
    rgb = np.array([p["rgb"] for p in palette], dtype=float)
    base = rgb[pal]                      # (n,3)
    aof = ao.astype(float)/255.0
    x, y, z = pos[:, 0].astype(float), pos[:, 1].astype(float), pos[:, 2].astype(float)

    # occupancy set for face culling
    occ = set(map(tuple, pos))
    def empty(px, py, pz): return (px, py, pz) not in occ

    if mode == "front":
        depth = z
        order = np.argsort(depth)
        def proj(px, py, pz): return (px, -py)
        faces = [(0, 0, 1, 0.75)]
    elif mode == "side":
        depth = x
        order = np.argsort(depth)
        def proj(px, py, pz): return (pz, -py)
        faces = [(1, 0, 0, 0.85)]
    elif mode == "top":
        depth = -y
        order = np.argsort(depth)
        def proj(px, py, pz): return (px, pz)
        faces = [(0, 1, 0, 1.0)]
    else:  # iso
        depth = x + y + z
        order = np.argsort(depth)
        def proj(px, py, pz): return ((px - pz)*0.866, (px + pz)*0.5 - py)
        faces = [(1, 0, 0, 0.80), (0, 1, 0, 1.0), (0, 0, 1, 0.62)]

    # gather projected bounds
    pts = np.array([proj(xx, yy, zz) for xx, yy, zz in zip(x, y, z)])
    minx, miny = pts.min(axis=0); maxx, maxy = pts.max(axis=0)
    W = int((maxx-minx)*scale) + 40; H = int((maxy-miny)*scale) + 40
    img = Image.new("RGB", (W, H), (18, 22, 30))
    dr = ImageDraw.Draw(img)
    # gradient bg
    for yy in range(H):
        t = yy/H
        c = (int(20+30*t), int(26+30*t), int(38+26*t))
        dr.line([(0, yy), (W, yy)], fill=c)

    s = scale
    ox = 20 - minx*s; oy = 20 - miny*s
    # face polygon offsets in projected space for a unit cube
    def face_poly(px, py, pz, n):
        # return 4 corners of the face with normal n
        if n == (0, 0, 1):
            cs = [(px, py, pz+1), (px+1, py, pz+1), (px+1, py+1, pz+1), (px, py+1, pz+1)]
        elif n == (1, 0, 0):
            cs = [(px+1, py, pz), (px+1, py, pz+1), (px+1, py+1, pz+1), (px+1, py+1, pz)]
        elif n == (0, 1, 0):
            cs = [(px, py+1, pz), (px+1, py+1, pz), (px+1, py+1, pz+1), (px, py+1, pz+1)]
        return [(proj(*c)[0]*s+ox, proj(*c)[1]*s+oy) for c in cs]

    for i in order:
        px, py, pz = int(x[i]), int(y[i]), int(z[i])
        col = base[i]*aof[i]
        for (nx, ny, nz, bright) in faces:
            if not empty(px+nx, py+ny, pz+nz): continue
            c = tuple(int(min(255, v*bright)) for v in col)
            dr.polygon(face_poly(px, py, pz, (nx, ny, nz)), fill=c)
    if out is None:
        out = os.path.join(HERE, "..", "renders", f"preview_{mode}.png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out)
    print("saved", out, img.size)
    return out

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "iso"
    scale = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    out = sys.argv[3] if len(sys.argv) > 3 else None
    render(mode, scale, out)