# -*- coding: utf-8 -*-
"""
voxlib — 体素建模核心库
========================
致密网格容器 + 材质表 + 绘图原语 + SDF 雕刻 + 扫掠 + 网格导出

坐标约定
--------
  x : 东
  y : 上
  z : 南
绘图函数一律使用**世界坐标**（体素单位），y 向上。
"""

import numpy as np
from scipy.spatial import cKDTree

AIR = 0

# id -> (名称, 镜面, 粗糙, 自发光, 透射)
MAT_DEF = {
    0:  ("air",      0.00, 1.00, 0.0, 1.00),
    1:  ("stone",    0.06, 0.78, 0.0, 0.00),
    2:  ("stone_w",  0.06, 0.74, 0.0, 0.00),
    3:  ("wood",     0.07, 0.72, 0.0, 0.00),
    4:  ("wood_red", 0.10, 0.66, 0.0, 0.00),
    5:  ("tile",     0.30, 0.34, 0.0, 0.00),
    6:  ("paper",    0.03, 0.92, 0.0, 0.55),
    7:  ("lamp_w",   0.05, 0.90, 0.85, 0.90),
    8:  ("lamp_r",   0.05, 0.90, 0.85, 0.90),
    9:  ("water",    0.90, 0.04, 0.0, 0.00),
    10: ("leaf",     0.10, 0.66, 0.0, 0.30),
    11: ("cloth",    0.05, 0.88, 0.0, 0.20),
    12: ("metal",    0.80, 0.22, 0.0, 0.00),
    13: ("gold",     0.92, 0.14, 0.0, 0.00),
    14: ("glass",    0.60, 0.10, 0.0, 0.90),
    15: ("flame",    0.00, 1.00, 2.6, 1.00),
    16: ("rope",     0.03, 0.90, 0.0, 0.00),
    17: ("jade",     0.45, 0.20, 0.0, 0.25),
    18: ("bark",     0.04, 0.88, 0.0, 0.00),
    19: ("silk",     0.22, 0.44, 0.0, 0.30),
    20: ("scale_g",  0.62, 0.18, 0.0, 0.00),   # 龙鳞·金
    21: ("scale_j",  0.55, 0.16, 0.0, 0.15),   # 龙鳞·青玉
    22: ("scale_d",  0.40, 0.30, 0.0, 0.00),   # 龙鳞·暗
    23: ("horn",     0.28, 0.36, 0.0, 0.10),   # 角
    24: ("glow",     0.00, 1.00, 4.0, 1.00),   # 内发光核（灯心）
    25: ("winpaper", 0.03, 0.92, 0.50, 0.92),  # 窗纸（透光微光）
    26: ("mist",     0.00, 1.00, 0.0, 0.92),
    27: ("cloud",    0.00, 1.00, 0.40, 0.70),  # 云
    28: ("eye",      0.55, 0.12, 0.0, 0.00),
    29: ("motif",    0.16, 0.60, 0.30, 0.20),  # 纹饰微光
    30: ("bone",     0.10, 0.62, 0.0, 0.00),
    31: ("lacquer",  0.36, 0.28, 0.0, 0.00),   # 朱漆
    32: ("lantern_o",0.05, 0.90, 0.95, 0.93),  # 灯笼纸·浓
    33: ("spark",    0.00, 1.00, 3.2, 1.00),   # 火星
    34: ("tile_g",   0.34, 0.32, 0.0, 0.00),   # 琉璃瓦·绿
    35: ("tile_y",   0.34, 0.32, 0.0, 0.00),   # 琉璃瓦·黄
    36: ("plaster",  0.04, 0.86, 0.0, 0.00),
    37: ("granite",  0.15, 0.54, 0.0, 0.00),
    38: ("plank",    0.09, 0.68, 0.0, 0.00),
}

NMAT = max(MAT_DEF) + 1
MAT_NAME = {k: v[0] for k, v in MAT_DEF.items()}
MAT_SPEC = np.array([MAT_DEF.get(i, MAT_DEF[0])[1] for i in range(NMAT)], np.float32)
MAT_ROUGH = np.array([MAT_DEF.get(i, MAT_DEF[0])[2] for i in range(NMAT)], np.float32)
MAT_EMIT = np.array([MAT_DEF.get(i, MAT_DEF[0])[3] for i in range(NMAT)], np.float32)
MAT_TRANS = np.array([MAT_DEF.get(i, MAT_DEF[0])[4] for i in range(NMAT)], np.float32)


def c(r, g, b):
    return np.array([r, g, b], np.uint8)


# --------------------------------------------------------------------------
# 网格
# --------------------------------------------------------------------------
class Grid:
    def __init__(self, nx, ny, nz):
        self.nx, self.ny, self.nz = int(nx), int(ny), int(nz)
        self.mat = np.zeros((self.nx, self.ny, self.nz), np.uint8)
        self.rgb = np.zeros((self.nx, self.ny, self.nz, 3), np.uint8)

    # ---------- 边界 ----------
    def _clip(self, x0, x1, y0, y1, z0, z1):
        x0, x1 = int(np.floor(min(x0, x1))), int(np.ceil(max(x0, x1)))
        y0, y1 = int(np.floor(min(y0, y1))), int(np.ceil(max(y0, y1)))
        z0, z1 = int(np.floor(min(z0, z1))), int(np.ceil(max(z0, z1)))
        return (max(0, x0), min(self.nx, x1), max(0, y0), min(self.ny, y1),
                max(0, z0), min(self.nz, z1))

    # ---------- 写入内核 ----------
    def _write(self, X0, X1, Y0, Y1, Z0, Z1, mask, mat, rgb):
        """mask:(dx,dy,dz) bool；mat 标量；rgb: (3,) 或 (dx,dy,dz,3)"""
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0 or not mask.any():
            return
        tgt = (slice(X0, X1), slice(Y0, Y1), slice(Z0, Z1))
        self.mat[tgt] = np.where(mask, np.uint8(mat), self.mat[tgt])
        rr = np.asarray(rgb, np.uint8)
        if rr.ndim == 1:
            rr = rr.reshape(1, 1, 1, 3)
        self.rgb[tgt] = np.where(mask[..., None], rr, self.rgb[tgt])

    # ---------- 基础图元 ----------
    def box(self, x0, x1, y0, y1, z0, z1, mat, rgb):
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x1, y0, y1, z0, z1)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        m = np.ones((X1 - X0, Y1 - Y0, Z1 - Z0), bool)
        self._write(X0, X1, Y0, Y1, Z0, Z1, m, mat, rgb)

    def carve(self, x0, x1, y0, y1, z0, z1):
        self.box(x0, x1, y0, y1, z0, z1, 0, (0, 0, 0))

    def jitter_box(self, x0, x1, y0, y1, z0, z1, mat, rgb, amp=7, seed=0, grain=4):
        """带逐体素 + 低频抖动的实心盒，让大面积表面不呆板"""
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x1, y0, y1, z0, z1)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        rng = np.random.default_rng(seed)
        sh = (X1 - X0, Y1 - Y0, Z1 - Z0)
        n = rng.integers(-amp, amp + 1, size=sh).astype(np.float32)
        lo_sh = tuple(s // grain + 2 for s in sh)
        lo = rng.integers(-amp, amp + 1, size=lo_sh).astype(np.float32)
        lo = np.repeat(np.repeat(np.repeat(lo, grain, 0), grain, 1), grain, 2)[:sh[0], :sh[1], :sh[2]]
        base = np.asarray(rgb, np.float32).reshape(1, 1, 1, 3)
        col = np.clip(base + n[..., None] + lo[..., None], 0, 255).astype(np.uint8)
        self.mat[X0:X1, Y0:Y1, Z0:Z1] = np.uint8(mat)
        self.rgb[X0:X1, Y0:Y1, Z0:Z1] = col

    # ---------- 通用函数式写入 ----------
    def apply_fn(self, x0, x1, y0, y1, z0, z1, fn):
        """fn(P)->(mask, rgb)：P 为 (dx,dy,dz,3) 世界坐标（体素中心）。"""
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x1, y0, y1, z0, z1)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        xs = np.arange(X0, X1, dtype=np.float32) + 0.5
        ys = np.arange(Y0, Y1, dtype=np.float32) + 0.5
        zs = np.arange(Z0, Z1, dtype=np.float32) + 0.5
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
        P = np.stack([X, Y, Z], -1)
        mask, rgb = fn(P)
        self._write(X0, X1, Y0, Y1, Z0, Z1, mask, rgb if np.ndim(rgb) else int(rgb), rgb)

    def mask_write(self, x0, y0, z0, mask, mat, rgb):
        """mask 的 (0,0,0) 对应对齐到体素 (x0,y0,z0)"""
        dx, dy, dz = mask.shape
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x0 + dx, y0, y0 + dy, z0, z0 + dz)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        sub = mask[(X0 - x0):(X1 - x0), (Y0 - y0):(Y1 - y0), (Z0 - z0):(Z1 - z0)]
        self._write(X0, X1, Y0, Y1, Z0, Z1, sub, mat, rgb)

    # ---------- 二次曲面 ----------
    def ellipsoid(self, cx, cy, cz, rx, ry, rz, mat, rgb, inner=0.0,
                  rot=None, squash=None):
        """椭球（inner>0 时只保留壳层 inner..1）。rot 为 3x3 行正交旋转。"""
        return self._quad(cx, cy, cz, rx, ry, rz, mat, rgb, "ellip",
                          inner=inner, rot=rot)

    def sphere(self, cx, cy, cz, r, mat, rgb, inner=0.0):
        return self._quad(cx, cy, cz, r, r, r, mat, rgb, "ellip", inner=inner)

    def cone(self, cx, cz, y0, y1, r0, r1, mat, rgb, hollow=False):
        """沿 y 的圆锥/圆台：y0 处半径 r0，y1 处半径 r1。"""
        y0i, y1i = int(np.floor(y0)), int(np.ceil(y1))
        rr = int(np.ceil(max(r0, r1))) + 2
        xs = np.arange(int(cx) - rr, int(cx) + rr + 1)
        ys = np.arange(y0i, y1i)
        zs = np.arange(int(cz) - rr, int(cz) + rr + 1)
        if not len(ys):
            return
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
        t = np.clip((Y + 0.5 - y0) / max(1e-6, (y1 - y0)), 0, 1)
        R = r0 + (r1 - r0) * t
        d = np.sqrt((X + 0.5 - cx) ** 2 + (Z + 0.5 - cz) ** 2)
        m = ((d >= R - 1) & (d <= R)) if hollow else (d <= R)
        self._write_stamp(xs, ys, zs, m, mat, rgb)

    def _write_stamp(self, xs, ys, zs, mask, mat, rgb):
        X0, X1 = max(0, xs[0]), min(self.nx, xs[-1] + 1)
        Y0, Y1 = max(0, ys[0]), min(self.ny, ys[-1] + 1)
        Z0, Z1 = max(0, zs[0]), min(self.nz, zs[-1] + 1)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        sub = mask[(X0 - xs[0]):(X1 - xs[0]), (Y0 - ys[0]):(Y1 - ys[0]),
                   (Z0 - zs[0]):(Z1 - zs[0])]
        self._write(X0, X1, Y0, Y1, Z0, Z1, sub, mat, rgb)

    def _quad(self, cx, cy, cz, rx, ry, rz, mat, rgb, kind,
              inner=0.0, rot=None):
        rx = max(0.35, float(rx)); ry = max(0.35, float(ry)); rz = max(0.35, float(rz))
        rr = int(np.ceil(max(rx, ry, rz))) + 2
        xs = np.arange(int(np.floor(cx - rr)), int(np.ceil(cx + rr)) + 1)
        ys = np.arange(int(np.floor(cy - rr)), int(np.ceil(cy + rr)) + 1)
        zs = np.arange(int(np.floor(cz - rr)), int(np.ceil(cz + rr)) + 1)
        if not (len(xs) and len(ys) and len(zs)):
            return
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
        Qx = X + 0.5 - cx
        Qy = Y + 0.5 - cy
        Qz = Z + 0.5 - cz
        if rot is not None:
            Rm = np.asarray(rot, np.float32)
            qx = Qx * Rm[0, 0] + Qy * Rm[1, 0] + Qz * Rm[2, 0]
            qy = Qx * Rm[0, 1] + Qy * Rm[1, 1] + Qz * Rm[2, 1]
            qz = Qx * Rm[0, 2] + Qy * Rm[1, 2] + Qz * Rm[2, 2]
            Qx, Qy, Qz = qx, qy, qz
        d = (Qx / rx) ** 2 + (Qy / ry) ** 2 + (Qz / rz) ** 2
        m = d <= 1.0
        if inner > 0:
            m &= d >= inner * inner
        self._write_stamp(xs, ys, zs, m, mat, rgb)

    def tube_x(self, x0, x1, cy, cz, r, mat, rgb, hollow=False):
        return self._tube(0, x0, x1, cy, cz, r, mat, rgb, hollow)

    def tube_y(self, y0, y1, cx, cz, r, mat, rgb, hollow=False):
        return self._tube(1, y0, y1, cx, cz, r, mat, rgb, hollow)

    def tube_z(self, z0, z1, cy, cx, r, mat, rgb, hollow=False):
        return self._tube(2, z0, z1, cy, cx, r, mat, rgb, hollow)

    def _tube(self, axis, a0, a1, c1, c2, r, mat, rgb, hollow):
        r = float(r)
        rr = int(np.ceil(r)) + 2
        ai = np.arange(int(np.floor(a0)), int(np.ceil(a1)))
        b1 = np.arange(int(c1) - rr, int(c1) + rr + 1)
        b2 = np.arange(int(c2) - rr, int(c2) + rr + 1)
        if not len(ai):
            return
        o = [None, None, None]
        o[axis] = ai
        rem = [k for k in range(3) if k != axis]
        o[rem[0]] = b1
        o[rem[1]] = b2
        X, Y, Z = np.meshgrid(o[0], o[1], o[2], indexing="ij")
        dd = [X, Y, Z]
        d = np.sqrt((dd[rem[0]] + 0.5 - c1) ** 2 + (dd[rem[1]] + 0.5 - c2) ** 2)
        m = ((d >= r - 1) & (d <= r)) if hollow else (d <= r)
        self._write_stamp(o[0], o[1], o[2], m, mat, rgb)

    # ---------- 有机体：椭球隐式场 ----------
    def blobs(self, prims, bbox, mat, rgb0, smooth=0.0, rgb_fn=None):
        """prims: [(cx,cy,cz, rx,ry,rz, rot3x3 或 None)]，取并集。

        smooth>0 时做 smooth-min 融合（黏土感）。rgb_fn(P, normalish)->(dx,dy,dz,3)
        """
        x0, x1, y0, y1, z0, z1 = bbox
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x1, y0, y1, z0, z1)
        if X1 <= X0:
            return
        xs = np.arange(X0, X1, dtype=np.float32) + 0.5
        ys = np.arange(Y0, Y1, dtype=np.float32) + 0.5
        zs = np.arange(Z0, Z1, dtype=np.float32) + 0.5
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
        P = np.stack([X, Y, Z], -1)

        def smin(a, b, k):
            if k <= 0:
                return np.minimum(a, b)
            h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
            return b + (a - b) * h - k * h * (1 - h)

        acc = None
        for (px, py, pz, rx, ry, rz, rot) in prims:
            Q = P - np.array([px, py, pz], np.float32)
            if rot is not None:
                Q = Q @ np.asarray(rot, np.float32)   # rot 为行正交：Q_local = Q_world @ R
            d = (Q[..., 0] / rx) ** 2 + (Q[..., 1] / ry) ** 2 + (Q[..., 2] / rz) ** 2
            acc = d if acc is None else smin(acc, d, smooth)
        mask = acc <= 1.0
        if rgb_fn is not None:
            rgb = rgb_fn(P, mask)
        else:
            rgb = np.asarray(rgb0, np.uint8).reshape(1, 1, 1, 3)
            rgb = np.broadcast_to(rgb, mask.shape + (3,)).copy()
        self._write(X0, X1, Y0, Y1, Z0, Z1, mask, mat, rgb)

    # ---------- 扫掠（龙身等） ----------
    def sweep(self, spine, radii, mat, bbox=None, rgb_fn=None, k=1.6,
              flatten=1.0, radius2=None, smooth=0.0):
        """沿脊线扫掠出平滑身体。

        spine : (N,3) 世界坐标控制点序列（建议先用样条加密）
        radii : (N,) 或标量，沿脊线半径
        radius2: (N,) 次要半径（法平面内另一方向），用于压扁截面
        rgb_fn(P, t, dist, local)->颜色
        """
        spine = np.asarray(spine, np.float32)
        N = len(spine)
        rad = np.full(N, radii, np.float32) if np.isscalar(radii) else np.asarray(radii, np.float32)
        rad2 = rad if radius2 is None else (
            np.full(N, radius2, np.float32) if np.isscalar(radius2) else np.asarray(radius2, np.float32))
        tree = cKDTree(spine)
        if bbox is None:
            pad = float(rad.max()) + 2
            bbox = (spine[:, 0].min() - pad, spine[:, 0].max() + pad + 1,
                    spine[:, 1].min() - pad, spine[:, 1].max() + pad + 1,
                    spine[:, 2].min() - pad, spine[:, 2].max() + pad + 1)
        x0, x1, y0, y1, z0, z1 = bbox
        X0, X1, Y0, Y1, Z0, Z1 = self._clip(x0, x1, y0, y1, z0, z1)
        if X1 <= X0:
            return
        xs = np.arange(X0, X1, dtype=np.float32) + 0.5
        ys = np.arange(Y0, Y1, dtype=np.float32) + 0.5
        zs = np.arange(Z0, Z1, dtype=np.float32) + 0.5
        X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
        P = np.stack([X, Y, Z], -1)
        flat = P.reshape(-1, 3)
        dist, idx = tree.query(flat, workers=-1)
        dist = dist.reshape(X.shape)
        idx = idx.reshape(X.shape)
        rr = rad[idx]
        rr2 = rad2[idx]
        # 用最近点的切向把法向距离压扁
        tan = np.zeros_like(P)
        nxt = np.clip(idx + 1, 0, N - 1)
        prv = np.clip(idx - 1, 0, N - 1)
        T = spine[nxt] - spine[prv]
        T /= (np.linalg.norm(T, axis=-1, keepdims=True) + 1e-6)
        off = P - spine[idx]
        along = np.sum(off * T, -1, keepdims=True)
        perp = off - along * T
        dperp = np.linalg.norm(perp, axis=-1)
        # 以 body-frame 的 up 定义截面主轴，做椭圆截面
        up = np.array([0.0, 1.0, 0.0], np.float32)
        side = np.cross(T, up)
        sl = np.linalg.norm(side, axis=-1, keepdims=True)
        side = np.where(sl > 1e-4, side / (sl + 1e-6), np.array([1.0, 0, 0], np.float32))
        vert = np.cross(side, T)
        u = np.sum(perp * side, -1)
        v = np.sum(perp * vert, -1)
        d = np.sqrt((u / np.maximum(rr, 0.1)) ** 2 + (v / np.maximum(rr2 * flatten, 0.1)) ** 2)
        mask = d <= 1.0
        mask &= dist <= (rr.max() + 2)
        if rgb_fn is not None:
            rgb = rgb_fn(P, idx.astype(np.float32) / max(1, N - 1), d, (u, v, T, side, vert))
        else:
            rgb = np.asarray(mat and (200, 200, 200), np.uint8).reshape(1, 1, 1, 3)
        self._write(X0, X1, Y0, Y1, Z0, Z1, mask, mat, rgb)
        return idx, d, mask

    # ---------- 对称 ----------
    def mirror_x(self, cx):
        """把 x < cx 的部分镜像到 x > cx（cx 为对称面，含中线体素自身不重复）"""
        cx = int(cx)
        n = min(cx, self.nx - cx - 1)
        if n <= 0:
            return
        src = self.mat[cx - n:cx][::-1]
        dst = self.mat[cx + 1:cx + 1 + n]
        srgbs = self.rgb[cx - n:cx][::-1]
        drgbs = self.rgb[cx + 1:cx + 1 + n]
        m = src != 0
        dst[:] = np.where(m, src, dst)
        drgbs[:] = np.where(m[..., None], srgbs, drgbs)

    # ---------- 模板放置 ----------
    def blit(self, src, ox, oy, oz, rot=0, skip_air=True):
        """把 src 网格以 rot×90° 旋转后贴到 (ox,oy,oz)。

        rot 0/1/2/3 分别让模板的「正面」(局部 +z) 朝向世界 +z / +x / -z / -x。
        """
        k = int(rot) % 4
        M = src.mat if k == 0 else np.rot90(src.mat, k, axes=(0, 2))
        C = src.rgb if k == 0 else np.rot90(src.rgb, k, axes=(0, 2))
        # 保证内存连续，切片写入更快
        M = np.ascontiguousarray(M)
        C = np.ascontiguousarray(C)
        a, b, c = M.shape
        X0, X1 = max(0, ox), min(self.nx, ox + a)
        Y0, Y1 = max(0, oy), min(self.ny, oy + b)
        Z0, Z1 = max(0, oz), min(self.nz, oz + c)
        if X1 <= X0 or Y1 <= Y0 or Z1 <= Z0:
            return
        sub = M[(X0 - ox):(X1 - ox), (Y0 - oy):(Y1 - oy), (Z0 - oz):(Z1 - oz)]
        csub = C[(X0 - ox):(X1 - ox), (Y0 - oy):(Y1 - oy), (Z0 - oz):(Z1 - oz)]
        tgt = (slice(X0, X1), slice(Y0, Y1), slice(Z0, Z1))
        if skip_air:
            m = sub != 0
            self.mat[tgt] = np.where(m, sub, self.mat[tgt])
            self.rgb[tgt] = np.where(m[..., None], csub, self.rgb[tgt])
        else:
            self.mat[tgt] = sub
            self.rgb[tgt] = csub

    # ---------- 统计 ----------
    def stats(self):
        vals, cnt = np.unique(self.mat, return_counts=True)
        return {MAT_NAME.get(int(v), str(v)): int(n) for v, n in zip(vals, cnt)
                if v != 0}

    def bbox_of(self, mat_id=None):
        m = self.mat != 0 if mat_id is None else (self.mat == mat_id)
        idx = np.argwhere(m)
        return (idx.min(0), idx.max(0)) if len(idx) else (None, None)

    def occlusion(self):
        """用于渲染加速的致密实体掩码"""
        return self.mat != 0


# --------------------------------------------------------------------------
# 样条
# --------------------------------------------------------------------------
def catmull_rom(pts, samples_per_seg=24, closed=False):
    """Catmull-Rom 样条加密"""
    pts = np.asarray(pts, np.float64)
    if closed:
        P = np.vstack([pts[-1], pts, pts[0], pts[1]])
    else:
        P = np.vstack([pts[0] + (pts[0] - pts[1]), pts, pts[-1] + (pts[-1] - pts[-2])])
    out = []
    for i in range(len(P) - 3):
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        t = np.linspace(0, 1, samples_per_seg, endpoint=False)[:, None]
        t2, t3 = t * t, t * t * t
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t +
                          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                          (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2][None, :])
    return np.vstack(out).astype(np.float32)


def smoothstep(a, b, x):
    t = np.clip((x - a) / max(1e-9, (b - a)), 0, 1)
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def mix_col(c1, c2, t):
    return tuple(int(round(a + (b - a) * t)) for a, b in zip(c1, c2))


def hsl_to_rgb(h, s, l):
    """h,s,l ∈ [0,1] → (r,g,b) 0-255"""
    import colorsys
    r, g, b = colorsys.hls_to_rgb(h % 1.0, np.clip(l, 0, 1), np.clip(s, 0, 1))
    return (int(r * 255), int(g * 255), int(b * 255))


# --------------------------------------------------------------------------
# 导出
# --------------------------------------------------------------------------
def build_mesh(g):
    """提取暴露面：返回 P(F,4,3) N(F,3) C(F,3) M(F,)"""
    solid = g.mat != 0
    Ps, Ns, Cs, Ms = [], [], [], []
    for axis in range(3):
        for sgn in (1, -1):
            nb = np.zeros_like(solid)
            dst = [slice(None)] * 3
            src = [slice(None)] * 3
            n = solid.shape[axis]
            if sgn > 0:
                dst[axis] = slice(0, n - 1); src[axis] = slice(1, n)
            else:
                dst[axis] = slice(1, n); src[axis] = slice(0, n - 1)
            nb[tuple(dst)] = solid[tuple(src)]
            exposed = solid & (~nb)
            idx = np.argwhere(exposed)
            if not len(idx):
                continue
            f = len(idx)
            base = idx.astype(np.float32)
            a1, a2 = [a for a in range(3) if a != axis]
            quads = np.zeros((f, 4, 3), np.float32)
            corners = [(0, 0), (1, 0), (1, 1), (0, 1)] if sgn > 0 else \
                      [(0, 0), (0, 1), (1, 1), (1, 0)]
            off = 1.0 if sgn > 0 else 0.0
            for k, (uu, vv) in enumerate(corners):
                quads[:, k, a1] = base[:, a1] + uu
                quads[:, k, a2] = base[:, a2] + vv
                quads[:, k, axis] = base[:, axis] + off
            Ps.append(quads)
            nvec = np.zeros((f, 3), np.float32); nvec[:, axis] = sgn
            Ns.append(nvec)
            Cs.append(idx.astype(np.int32))
            Ms.append(g.mat[exposed])
    if not Ps:
        return (np.zeros((0, 4, 3), np.float32), np.zeros((0, 3), np.float32),
                np.zeros((0, 3), np.int32), np.zeros((0,), np.uint8))
    return (np.concatenate(Ps), np.concatenate(Ns), np.concatenate(Cs),
            np.concatenate(Ms))


def export_ply(g, path):
    """二进制 PLY，逐面顶点色（Blender / MeshLab 可直接导入）。"""
    P, N, C, M = build_mesh(g)
    if not len(P):
        return 0
    col = g.rgb[C[:, 0], C[:, 1], C[:, 2]].astype(np.uint8)
    V = P.reshape(-1, 3)
    FN = np.repeat(N, 4, axis=0)
    VC = np.repeat(col, 4, axis=0)
    nv, nf = len(V), len(P)
    faces = np.arange(nv, dtype=np.int32).reshape(-1, 4)
    with open(path, "wb") as f:
        hdr = (f"ply\nformat binary_little_endian 1.0\ncomment voxlib export\n"
               f"element vertex {nv}\n"
               f"property float x\nproperty float y\nproperty float z\n"
               f"property float nx\nproperty float ny\nproperty float nz\n"
               f"property uchar red\nproperty uchar green\nproperty uchar blue\n"
               f"element face {nf}\nproperty list uchar int vertex_indices\n"
               f"end_header\n")
        f.write(hdr.encode())
        vdt = np.dtype([("x", "<f4"), ("y", "<f4"), ("z", "<f4"),
                        ("nx", "<f4"), ("ny", "<f4"), ("nz", "<f4"),
                        ("r", "u1"), ("g", "u1"), ("b", "u1")])
        vb = np.empty(nv, dtype=vdt)
        vb["x"], vb["y"], vb["z"] = V[:, 0], V[:, 1], V[:, 2]
        vb["nx"], vb["ny"], vb["nz"] = FN[:, 0], FN[:, 1], FN[:, 2]
        vb["r"], vb["g"], vb["b"] = VC[:, 0], VC[:, 1], VC[:, 2]
        f.write(vb.tobytes())
        fdt = np.dtype([("n", "u1"), ("v", "<i4", (4,))])
        fb = np.empty(nf, dtype=fdt)
        fb["n"] = 4
        fb["v"] = faces
        f.write(fb.tobytes())
    return nv, nf
