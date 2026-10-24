# -*- coding: utf-8 -*-
"""
render — 体素光域烘焙 + CPU 光线投射渲染器
==========================================
核心思想：把光照**预烘焙进体素网格**（天光传播 + 灯彩彩色传播），渲染时只需一次
DDA 光线投射 + 采样光域，即可得到几何正确的软阴影、多色灯笼辉光与体积雾。

管线
----
  bake_sky   天光：自上而下 + 水平衰减传播
  bake_lamp  灯彩：自发光体素多源 RGB 传播（可穿纸窗）
  gradient   光域梯度 → 用于镜面高光方向
  cast       向量化 DDA 光线投射
  shade      直接光 + 天光环境 + 灯彩 + AO + 镜面
  fog        体积雾（沿射线采样灯彩光域）
  water      水面镜像二次投射
  post       bloom / ACES / 暗角 / 颗粒
"""

import numpy as np
from scipy.ndimage import gaussian_filter
import voxlib as V

SRGB_TO_LIN = (np.arange(256, dtype=np.float32) / 255.0) ** 2.2


def lin(rgb8):
    """sRGB uint8 → 线性 float"""
    return SRGB_TO_LIN[np.asarray(rgb8, np.uint8)]


# ==========================================================================
# 光域烘焙
# ==========================================================================
def _shift(a, axis, d, fill=0.0):
    """无环绕平移：a[i] → out[i+d]（沿 +axis 传播）"""
    out = np.full_like(a, fill)
    dst = [slice(None)] * a.ndim
    src = [slice(None)] * a.ndim
    if d > 0:
        dst[axis] = slice(d, None)
        src[axis] = slice(0, -d)
    else:
        dst[axis] = slice(0, d)
        src[axis] = slice(-d, None)
    out[tuple(dst)] = a[tuple(src)]
    return out


def bake_sky(g, sun_from_top=True):
    """天光：开阔处 1.0；水平传播每格衰减，向下不衰减。

    返回 sky (nx,ny,nz) float32，仅空气/透光体素非零。
    """
    solid = g.mat != 0
    opaque = solid & (V.MAT_TRANS[g.mat] < 0.5)
    nx, ny, nz = g.mat.shape
    # 自下而上：某体素若其下方全部透明则开天
    open_to_sky = np.ones((nx, nz), bool)
    sky = np.zeros((nx, ny, nz), np.float32)
    for y in range(ny - 1, -1, -1):
        sky[:, y, :] = open_to_sky.astype(np.float32)
        open_to_sky &= ~opaque[:, y, :]
    sky[opaque] = 0.0

    # 水平 + 向上带衰减扩散（让巷子深处渐暗、檐下变柔）
    dec = {(0, 1): 0.86, (0, -1): 0.86, (1, 1): 0.78,
           (1, -1): 0.97, (2, 1): 0.86, (2, -1): 0.86}
    air = ~opaque
    for _ in range(22):
        best = sky
        for (ax, d), k in dec.items():
            best = np.maximum(best, _shift(sky, ax, d) * k)
        sky = best * air
    sky = gaussian_filter(sky, (0.8, 0.8, 0.8))
    return np.clip(sky, 0, 1).astype(np.float32)


def bake_lamp(g, iters=30, decay=0.74, gain=1.0):
    """灯彩：自发光体素为源，RGB 各通道独立传播。

    逐通道传播以控制内存；纸(透射 0.9)/窗纸允许透光，使灯笼整体透亮。
    返回 lamp (nx,ny,nz,3) float32。
    """
    mat = g.mat
    emit = V.MAT_EMIT[mat] * gain
    trans = V.MAT_TRANS[mat]
    alb = lin(g.rgb)
    pass_k = np.where(mat == 0, 1.0, trans).astype(np.float32)
    pass_k = np.clip(pass_k, 0, 1)
    # 传播时的介质权重（0.35 底 + 通透度）
    wgt = (0.30 + 0.70 * pass_k).astype(np.float32)
    open_ok = pass_k > 0.02

    out = np.zeros(mat.shape + (3,), np.float32)
    for ch in range(3):
        src = (alb[..., ch] * emit).astype(np.float32)
        light = src.copy()
        scr = np.empty_like(light)
        best = np.empty_like(light)
        for _ in range(int(iters)):
            np.copyto(best, light)
            for ax, d in ((0, 1), (0, -1), (1, 1), (1, -1), (2, 1), (2, -1)):
                _shift_into(light, scr, ax, d, decay)
                np.maximum(best, scr, out=best)
            np.multiply(best, wgt, out=scr)
            np.copyto(light, np.where(open_ok, scr, 0.0))
            np.maximum(light, src, out=light)
        out[..., ch] = light
    return out


def _shift_into(a, out, axis, d, k=1.0):
    """无环绕平移 + 缩放：out[i+d,axis] = a[i,axis]*k（越界为 0）"""
    out.fill(0.0)
    dst = [slice(None)] * a.ndim
    src = [slice(None)] * a.ndim
    if d > 0:
        dst[axis] = slice(d, None)
        src[axis] = slice(0, -d)
    else:
        dst[axis] = slice(0, d)
        src[axis] = slice(-d, None)
    np.multiply(a[tuple(src)], k, out=out[tuple(dst)])


def light_gradient(lamp, blur=2.0):
    """灯彩光域亮度梯度：指向光源，用于镜面高光。"""
    lum = gaussian_filter(lamp.sum(-1), blur)
    gx = np.gradient(lum, axis=0)
    gy = np.gradient(lum, axis=1)
    gz = np.gradient(lum, axis=2)
    G = np.stack([gx, gy, gz], -1).astype(np.float32)
    n = np.linalg.norm(G, axis=-1, keepdims=True) + 1e-6
    return -(G / n).astype(np.float32), np.linalg.norm(G, axis=-1).astype(np.float32)


# ==========================================================================
# 相机
# ==========================================================================
class Camera:
    def __init__(self, eye, target, up=(0, 1, 0), fov=42.0, W=960, H=540,
                 shift=None, roll=0.0):
        self.eye = np.asarray(eye, np.float32)
        self.target = np.asarray(target, np.float32)
        self.fov = float(fov)
        self.W, self.H = int(W), int(H)
        fwd = self.target - self.eye
        fwd /= np.linalg.norm(fwd)
        upv = np.asarray(up, np.float32)
        right = np.cross(fwd, upv)
        right /= np.linalg.norm(right)
        tup = np.cross(right, fwd)
        if roll:
            a = np.radians(roll)
            r2 = right * np.cos(a) + tup * np.sin(a)
            u2 = -right * np.sin(a) + tup * np.cos(a)
            right, tup = r2, u2
        self.fwd, self.right, self.up = fwd, right, tup
        self.shift = np.array(shift if shift is not None else [0.0, 0.0], np.float32)

    def rays(self, jitter=0.0, rng=None):
        W, H = self.W, self.H
        jx = jy = 0.0
        if jitter > 0 and rng is not None:
            jx = (rng.random((H, W), np.float32) - 0.5) * jitter
            jy = (rng.random((H, W), np.float32) - 0.5) * jitter
        # 屏幕坐标 → NDC（保留 (H,W) 形状，jx/jy 已是 (H,W) 或标量）
        xs = (np.arange(W, dtype=np.float32)[None, :] + 0.5 + jx) / W * 2 - 1
        ys = 1 - (np.arange(H, dtype=np.float32)[:, None] + 0.5 + jy) / H * 2
        xs = xs + self.shift[0] * 2
        ys = ys + self.shift[1] * 2
        th = np.tan(np.radians(self.fov) * 0.5)
        asp = W / H
        # 展平为 (H*W,) 再做外积，避免形状错配
        xf = xs.reshape(-1)
        yf = ys.reshape(-1)
        D = (self.fwd[None, :]
             + self.right[None, :] * (xf * th * asp)[:, None]
             + self.up[None, :] * (yf * th)[:, None])
        D /= np.linalg.norm(D, axis=-1, keepdims=True)
        return D.astype(np.float32)


# ==========================================================================
# DDA 光线投射
# ==========================================================================
def cast(g, origin, D, max_steps=420):
    """向量化 DDA。origin 可为 (3,) 统一原点，或 (N,3) 逐射线原点。

    返回 dict: hit, solid_flat, air_flat, axis, sgn, t
    """
    nx, ny, nz = g.mat.shape
    solid_flat = (g.mat != 0).reshape(-1)

    D = np.asarray(D, np.float32)
    n = len(D)
    origin = np.asarray(origin, np.float32)
    if origin.ndim == 1:
        origin = np.broadcast_to(origin, (n, 3)).copy()

    lo = np.array([0.0, 0.0, 0.0], np.float32)
    hi = np.array([nx, ny, nz], np.float32)
    safeD = np.where(np.abs(D) < 1e-9, 1e-9, D)
    with np.errstate(divide="ignore", invalid="ignore"):
        inv = 1.0 / safeD
        t1 = (lo - origin) * inv
        t2 = (hi - origin) * inv
    tmin = np.maximum(np.minimum(t1, t2).max(axis=1), 0.0)
    tmax_all = np.maximum(t1, t2).min(axis=1)
    valid = tmax_all > tmin
    tmin = np.where(np.isfinite(tmin), tmin, 0.0)

    pos = origin + D * (tmin[:, None] + 1e-3)
    ix = np.floor(pos).astype(np.int32)
    step = np.where(D > 0, 1, -1).astype(np.int32)
    invd = np.where(np.abs(D) < 1e-9, 1e9, 1.0 / np.abs(D)).astype(np.float32)
    nextb = ix.astype(np.float32) + (step > 0).astype(np.float32)
    tmax = np.abs((nextb - pos) * np.where(np.abs(D) < 1e-9, 1e9, 1.0 / D))
    tdelta = invd

    hit = np.zeros(n, bool)
    done = ~valid
    hit_axis = np.full(n, 0, np.int64)
    hit_sgn = np.ones(n, np.int8)
    hit_flat = np.full(n, -1, np.int64)
    prev_flat = np.full(n, -1, np.int64)
    hit_t = np.full(n, 1e9, np.float32)
    ix = np.clip(ix, -1, np.array([nx, ny, nz], np.int32)[None, :])
    tmax = np.clip(tmax, 0, 1e9).astype(np.float32)
    tdelta = np.clip(tdelta, 0, 1e9).astype(np.float32)
    ar = np.arange(n)

    for _ in range(int(max_steps)):
        alive = ~done
        if not alive.any():
            break
        ax = np.argmin(tmax, axis=1)
        t_cur = tmax[ar, ax]
        prev = ix.copy()
        for a in range(3):
            sel = alive & (ax == a)
            if sel.any():
                ix[sel, a] += step[sel, a]
                tmax[sel, a] += tdelta[sel, a]
        inside = (alive & (ix[:, 0] >= 0) & (ix[:, 0] < nx) & (ix[:, 1] >= 0) &
                  (ix[:, 1] < ny) & (ix[:, 2] >= 0) & (ix[:, 2] < nz))
        done |= alive & ~inside
        if not inside.any():
            continue
        ixc = np.clip(ix, 0, None)
        f = (ixc[:, 0].astype(np.int64) * ny + ixc[:, 1].astype(np.int64)) * nz + ixc[:, 2].astype(np.int64)
        is_solid = np.zeros(n, bool)
        is_solid[inside] = solid_flat[f[inside]]
        nh = inside & is_solid
        if nh.any():
            hidx = np.nonzero(nh)[0]
            hit[hidx] = True
            done |= nh
            hit_axis[hidx] = ax[hidx]
            hit_sgn[hidx] = step[hidx, ax[hidx]]
            hit_flat[hidx] = f[hidx]
            pv = prev[hidx]
            prev_flat[hidx] = ((pv[:, 0].astype(np.int64) * ny + pv[:, 1].astype(np.int64)) * nz
                               + pv[:, 2].astype(np.int64))
            hit_t[hidx] = tmin[hidx] + t_cur[hidx]

    return dict(hit=hit, solid_flat=hit_flat, air_flat=prev_flat,
                axis=hit_axis, sgn=hit_sgn, t=hit_t)


def flat_coords(flat, shape):
    nx, ny, nz = shape
    z = flat % nz
    y = (flat // nz) % ny
    x = flat // (nz * ny)
    return x, y, z


# ==========================================================================
# 背景天空
# ==========================================================================
def make_sky(scene):
    """返回 f(D)->HDR 的函数"""
    D = None

    def f(D):
        up = np.clip(D[:, 1], -1, 1)
        t = np.clip((up + 1) * 0.5, 0, 1)
        zen = np.asarray(scene["sky_zenith"], np.float32)
        hor = np.asarray(scene["sky_horizon"], np.float32)
        col = hor[None, :] * (1 - t[:, None] ** 0.55) + zen[None, :] * (t[:, None] ** 0.55)
        # 低空压暗
        col *= (0.30 + 0.70 * np.clip(up * 3 + 0.5, 0, 1))[:, None]
        # 星空
        if scene.get("stars", 0) > 0:
            h = np.sin(D[:, 0] * 431.7 + 3.1) * np.sin(D[:, 1] * 297.3 + 1.7) * \
                np.sin(D[:, 2] * 517.3 + 5.3)
            h2 = np.sin(D[:, 0] * 1237.1 + 9.1) * np.sin(D[:, 1] * 911.3 + 2.3) * \
                 np.sin(D[:, 2] * 1439.7 + 7.7)
            star = np.clip(h * h2 * 14.0, 0, 1) ** 3
            col += (star * np.clip(up * 4, 0, 1) * scene["stars"])[:, None]
        # 月/日
        md = scene.get("moon_dir")
        if md is not None:
            md = np.asarray(md, np.float32)
            md = md / np.linalg.norm(md)
            cs = D @ md
            r = scene.get("moon_r", 0.045)
            disc = np.clip((cs - (1 - r * 1.2)) / (r * 0.25), 0, 1)
            col += (disc ** 1.5)[:, None] * np.asarray(scene.get("moon_color", (9, 8.4, 7.2)), np.float32)[None, :]
            glow = np.clip(cs, 0, 1) ** 90 * 0.55
            col += glow[:, None] * np.asarray(scene.get("moon_glow", (0.5, 0.5, 0.62)), np.float32)[None, :]
            halo = np.clip(cs, 0, 1) ** 7 * 0.10
            col += halo[:, None] * np.asarray(scene.get("moon_glow", (0.5, 0.5, 0.62)), np.float32)[None, :]
        return col.astype(np.float32)

    return f


# ==========================================================================
# 场景烘焙容器
# ==========================================================================
class Baked:
    def __init__(self, g, scene):
        self.g = g
        self.scene = scene
        self.sky = bake_sky(g)
        self.lamp = bake_lamp(g, iters=scene.get("lamp_iters", 30),
                              decay=scene.get("lamp_decay", 0.74))
        if scene.get("fog", 0) > 0:
            self.lamp_blur = np.stack(
                [gaussian_filter(self.lamp[..., i], scene.get("fog_blur", 3.5))
                 for i in range(3)], -1).astype(np.float32)
        else:
            self.lamp_blur = self.lamp
        self.lgrad, self.lgmag = light_gradient(self.lamp,
                                                scene.get("spec_blur", 2.2))
        self.solid_flat = (g.mat != 0).reshape(-1)
        self.mat_flat = g.mat.reshape(-1)
        self.rgb_lin = (lin(g.rgb)).reshape(-1, 3)
        self.shape = g.mat.shape
        self.emit_flat = np.repeat(V.MAT_EMIT[g.mat].reshape(-1, 1), 3, 1) * self.rgb_lin
        self.sky_flat = self.sky.reshape(-1)
        self.lamp_flat = self.lamp.reshape(-1, 3)
        self.lampb_flat = self.lamp_blur.reshape(-1, 3)
        self.lgrad_flat = self.lgrad.reshape(-1, 3)
        self.lgmag_flat = self.lgmag.reshape(-1)
        self.spec_flat = V.MAT_SPEC[self.mat_flat]
        self.rough_flat = V.MAT_ROUGH[self.mat_flat]


def _gather_occ(bk, flat, dx=0, dy=0, dz=0):
    nx, ny, nz = bk.shape
    x, y, z = flat_coords(flat, bk.shape)
    x = np.clip(x + dx, 0, nx - 1)
    y = np.clip(y + dy, 0, ny - 1)
    z = np.clip(z + dz, 0, nz - 1)
    return bk.solid_flat[(x * ny + y) * nz + z]


def compute_ao(bk, air_flat, axis, sgn):
    """面向体素 AO（Minecraft 风格 4 角采样）。

    axis:(N,) int  面法线所在轴；sgn:(N,) int  法线朝向。
    返回 (N,) ∈[0,1]，1 = 完全开阔。
    """
    n = len(air_flat)
    ao = np.zeros(n, np.float32)
    axis = np.asarray(axis).astype(np.int64)
    for corner in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        acc = np.zeros(n, np.float32)
        for a in range(3):
            m = axis == a
            if not m.any():
                continue
            u, v = [k for k in range(3) if k != a]
            e1 = np.zeros(3, np.int32); e1[u] = corner[0]
            e2 = np.zeros(3, np.int32); e2[v] = corner[1]
            af = air_flat[m]
            o1 = _gather_occ(bk, af, e1[0], e1[1], e1[2]).astype(np.float32)
            o2 = _gather_occ(bk, af, e2[0], e2[1], e2[2]).astype(np.float32)
            oc = _gather_occ(bk, af, e1[0] + e2[0], e1[1] + e2[1],
                             e1[2] + e2[2]).astype(np.float32)
            acc[m] = np.where(o1 * o2 > 0, 0.0, 3.0 - (o1 + o2 + oc))
        ao += acc
    ao /= 12.0
    return np.clip(1.0 - ao, 0.0, 1.0)


# --------------------------------------------------------------------------
# 体积雾（灯彩光域 + 天光沿射线累积 → 灯笼光晕 / 雾气纵深）
# --------------------------------------------------------------------------
def apply_fog(bk, cam, D, t_end, col, scene):
    """col:(N,3) 已着色；t_end:(N,) 命中距离或远平面。原地返回新 col。"""
    dens = scene.get("fog", 0.0)
    if dens <= 0:
        return col
    nx, ny, nz = bk.shape
    steps = int(scene.get("fog_steps", 26))
    tmax = float(scene.get("fog_range", 260.0))
    t_end = np.minimum(np.asarray(t_end, np.float32), tmax)
    dt = t_end / steps
    gl = np.zeros_like(col)
    gs = np.zeros_like(col)
    lamp_k = np.asarray(scene.get("fog_lamp", 0.85), np.float32)
    sky_c = np.asarray(scene.get("fog_sky", [0.10, 0.13, 0.22]), np.float32)
    lamp_b = bk.lampb_flat
    sky_f = bk.sky_flat
    for s in range(steps):
        t = (s + 0.5) * dt
        P = cam.eye[None, :] + D * t[:, None]
        ix = np.clip(np.floor(P[:, 0]).astype(np.int32), 0, nx - 1)
        iy = np.clip(np.floor(P[:, 1]).astype(np.int32), 0, ny - 1)
        iz = np.clip(np.floor(P[:, 2]).astype(np.int32), 0, nz - 1)
        f = (ix.astype(np.int64) * ny + iy.astype(np.int64)) * nz + iz.astype(np.int64)
        gl += lamp_b[f] * (dt[:, None] * dens)
        gs += (sky_f[f] * np.clip(1.0 - iy / float(ny), 0, 1))[:, None]
        del f
    gl *= lamp_k
    gs *= (dt[:, None] * dens) * 0.9
    gs *= sky_c[None, :]
    # 反照率随雾衰减
    trans = np.exp(-dens * t_end)[:, None]
    return col * trans + gl + gs



# ==========================================================================
# 渲染
# ==========================================================================
def render(bk, cam, spp=1, seed=0, want_water=True):
    g = bk.g
    sc = bk.scene
    nx, ny, nz = bk.shape
    f = make_sky(sc)
    rng = np.random.default_rng(seed)
    H, W = cam.H, cam.W
    acc = np.zeros((H * W, 3), np.float32)

    for s in range(spp):
        D = cam.rays(jitter=1.0 if spp > 1 else 0.0, rng=rng)
        res = cast(g, cam.eye, D, max_steps=sc.get("max_steps", 420))
        hit = res["hit"]
        col = np.zeros((len(D), 3), np.float32)
        miss = ~hit
        if miss.any():
            col[miss] = f(D[miss])

        idx = np.nonzero(hit)[0]
        if len(idx):
            af = res["air_flat"][idx]
            sf = res["solid_flat"][idx]
            ax = res["axis"][idx].astype(np.int64)
            sg = res["sgn"][idx].astype(np.float32)
            N = np.zeros((len(idx), 3), np.float32)
            N[np.arange(len(idx)), ax] = sg

            alb = bk.rgb_lin[sf]
            spec = bk.spec_flat[sf]
            rough = bk.rough_flat[sf]
            emit = bk.emit_flat[sf]

            sky = bk.sky_flat[af]
            lamp = bk.lamp_flat[af]
            ao = compute_ao(bk, af, ax, sg)
            ao = 0.30 + 0.70 * ao

            sd = np.asarray(sc["sun_dir"], np.float32); sd /= np.linalg.norm(sd)
            ndl = np.clip(N @ sd, 0, 1)
            sun = np.asarray(sc["sun_color"], np.float32)

            # --- 天光环境（半球）---
            hemi = 0.5 + 0.5 * N[:, 1]
            amb_c = np.asarray(sc["sky_ambient"], np.float32)
            rise = np.asarray(sc.get("sky_rim", [0.0, 0.0, 0.0]), np.float32)
            amb = (amb_c[None, :] * (0.45 + 0.55 * hemi[:, None])
                   + rise[None, :] * np.clip(1 - np.abs(N[:, 1]), 0, 1)[:, None] * 0.5)
            ambient = amb * (sky[:, None] ** 1.25) * ao[:, None]

            direct = sun[None, :] * (ndl[:, None] ** 0.9) * (sky[:, None] > 0.05) * ao[:, None]

            diffuse = alb * (ambient + direct)

            # --- 灯彩 ---
            lamp_amt = np.asarray(sc.get("lamp_gain", 1.6), np.float32)
            lamp_c = lamp * lamp_amt * ao[:, None]
            diffuse += alb * lamp_c

            # --- 镜面 ---
            Vv = -D[idx]
            h = sd[None, :] + Vv
            h /= (np.linalg.norm(h, axis=1, keepdims=True) + 1e-6)
            ndh = np.clip((N * h).sum(1), 0, 1)
            sh = 8.0 + 120.0 * (1 - rough)
            spec_sun = spec[:, None] * np.power(ndh[:, None], sh[:, None]) * \
                       sun[None, :] * (sky[:, None] > 0.05) * (ndl > 0)[:, None]

            Ld = bk.lgrad_flat[af]
            ndl2 = np.clip((N * Ld).sum(1), 0, 1)
            hh = Ld + Vv
            hh /= (np.linalg.norm(hh, axis=1, keepdims=True) + 1e-6)
            ndh2 = np.clip((N * hh).sum(1), 0, 1)
            lamp_lum = lamp.sum(1) * 0.05
            spec_lamp = spec[:, None] * np.power(ndh2[:, None], (sh * 0.8)[:, None]) * \
                        np.clip(lamp_lum, 0, 3)[:, None] * lamp * 0.55
            spec_lamp += spec[:, None] * np.power(ndl2[:, None], 2.0) * \
                         np.clip(bk.lgmag_flat[af], 0, 6)[:, None] * 0.10

            out = diffuse + spec_sun + spec_lamp + emit * np.asarray(sc.get("emit_gain", 1.0), np.float32)

            # 自发光体素：直接出射
            is_emit = V.MAT_EMIT[bk.mat_flat[sf]] > 0.5
            if is_emit.any():
                out[is_emit] = emit[is_emit] * np.asarray(sc.get("emit_gain", 1.0), np.float32)

            # --- 水面：镜像反射 ---
            water_id = 9
            if want_water:
                wm = (bk.mat_flat[sf] == water_id)
                if wm.any():
                    wi = np.nonzero(wm)[0]
                    gidx = idx[wi]
                    nrm = N[wi].copy()
                    pw = cam.eye[None, :] + D[gidx] * res["t"][gidx][:, None]
                    rip = sc.get("ripple", 0.0)
                    if rip > 0:
                        ph = pw * float(sc.get("ripple_freq", 0.35))
                        fx = np.asarray(sc.get("ripple_f", [1.7, 2.3]), np.float32)
                        nrm[:, 0] += rip * np.sin(ph[:, 0] * fx[0] + ph[:, 2] * fx[1])
                        nrm[:, 2] += rip * np.cos(ph[:, 0] * fx[1] * 1.3 - ph[:, 2] * fx[0] * 0.8)
                        nrm /= (np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9)
                    Dd = D[gidx]
                    R = Dd - 2 * (Dd * nrm).sum(1, keepdims=True) * nrm
                    ro = pw + nrm * 0.05
                    rres = cast(g, ro, R, max_steps=sc.get("max_steps", 420))
                    rcol = shade_generic(bk, cam, ro, R, rres, sc, f)
                    cosi = np.clip(-(Dd * nrm).sum(1), 0, 1)
                    fres = (0.02 + 0.98 * (1 - cosi) ** 5.0) * float(sc.get("refl", 0.85))
                    fres = np.clip(fres, 0, 1)
                    tint = np.asarray(sc.get("water_tint", (0.05, 0.07, 0.09)), np.float32)
                    wcolor = alb[wi] * tint[None, :]
                    base_w = out[wi]
                    out[wi] = (rcol * fres[:, None] + (wcolor + base_w * 0.35)
                               * (1 - fres[:, None]))
                    # 灯影在水面拉出竖直光柱
                    out[wi] += spec_lamp[wi] * float(sc.get("water_spec", 1.6))

            col[idx] = out

        # --- 体积雾 ---
        if sc.get("fog", 0) > 0:
            t_end = np.where(hit, res["t"], float(sc.get("fog_range", 260.0)))
            col = apply_fog(bk, cam, D, t_end, col, sc)

        acc += col
    acc /= max(1, spp)
    return acc.reshape(H, W, 3)


def shade_generic(bk, cam, origins, D, res, sc, skf):
    """用 cast 结果 + 逐射线起点做一次标准着色（水面反射、二次弹射共用）"""
    n = len(D)
    out = np.zeros((n, 3), np.float32)
    hit = res["hit"]
    if (~hit).any():
        out[~hit] = skf(D[~hit])
    if not hit.any():
        return out
    i = np.nonzero(hit)[0]
    sf = res["solid_flat"][i]
    af = res["air_flat"][i]
    ax = res["axis"][i].astype(np.int64)
    sg = res["sgn"][i].astype(np.float32)
    N = np.zeros((len(i), 3), np.float32)
    N[np.arange(len(i)), ax] = sg
    alb = bk.rgb_lin[sf]
    sky = bk.sky_flat[af]
    lamp = bk.lamp_flat[af]
    spec = bk.spec_flat[sf]
    rough = bk.rough_flat[sf]
    emit = bk.emit_flat[sf]
    ao = 0.30 + 0.70 * compute_ao(bk, af, ax, sg)
    sd = np.asarray(sc["sun_dir"], np.float32); sd /= np.linalg.norm(sd)
    ndl = np.clip(N @ sd, 0, 1)
    sun = np.asarray(sc["sun_color"], np.float32)
    amb = np.asarray(sc["sky_ambient"], np.float32)
    base = alb * (amb[None, :] * (0.45 + 0.55 * (0.5 + 0.5 * N[:, 1]))[:, None]
                  * (sky[:, None] ** 1.25) * ao[:, None]
                  + sun[None, :] * (ndl[:, None] ** 0.9) * (sky[:, None] > 0.05)[:, None] * ao[:, None])
    base += alb * lamp * float(sc.get("lamp_gain", 1.6)) * ao[:, None]
    # 高光
    Vv = -D[i]
    h = sd[None, :] + Vv
    h /= (np.linalg.norm(h, axis=1, keepdims=True) + 1e-6)
    ndh = np.clip((N * h).sum(1), 0, 1)
    sh = 8.0 + 120.0 * (1 - rough)
    base += spec[:, None] * np.power(ndh[:, None], sh[:, None]) * sun[None, :] * (sky[:, None] > 0.05)
    Ld = bk.lgrad_flat[af]
    hh = Ld + Vv
    hh /= (np.linalg.norm(hh, axis=1, keepdims=True) + 1e-6)
    ndh2 = np.clip((N * hh).sum(1), 0, 1)
    base += spec[:, None] * np.power(ndh2[:, None], (sh * 0.8)[:, None]) * \
        np.clip(lamp.sum(1) * 0.05, 0, 3)[:, None] * lamp * 0.55
    is_emit = V.MAT_EMIT[bk.mat_flat[sf]] > 0.5
    eg = np.asarray(sc.get("emit_gain", 1.0), np.float32)
    base[is_emit] = emit[is_emit] * eg
    out[i] = base * np.asarray(sc.get("refl_dim", 1.0), np.float32)
    return out


# ==========================================================================
# 后处理
# ==========================================================================
def post(img, sc, exposure=1.0, bloom=1.0, vignette=0.30, grain=0.006, seed=1):
    x = img * exposure
    if bloom > 0:
        lum = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        br = np.clip(lum - sc.get("bloom_thr", 0.85), 0, None)
        b = np.zeros_like(x)
        for s, w in ((sc.get("bloom1", 5.0), 0.55), (sc.get("bloom2", 14.0), 0.32),
                     (sc.get("bloom3", 38.0), 0.20)):
            for c in range(3):
                b[..., c] = gaussian_filter(br * (x[..., c] / (lum + 1e-4)), s)
            pass
        # 加权合成
        bb = np.zeros_like(x)
        for s, w in ((sc.get("bloom1", 5.0), 0.55), (sc.get("bloom2", 14.0), 0.32),
                     (sc.get("bloom3", 38.0), 0.20)):
            tmp = np.zeros_like(x)
            for c in range(3):
                tmp[..., c] = gaussian_filter(br * (x[..., c] / (lum + 1e-4)), s)
            bb += tmp * w
        x = x + bb * bloom * sc.get("bloom_amt", 0.9)
    if vignette > 0:
        H, W = x.shape[:2]
        yy = (np.arange(H, dtype=np.float32) / (H - 1) * 2 - 1)[:, None]
        xx = (np.arange(W, dtype=np.float32) / (W - 1) * 2 - 1)[None, :]
        r = np.sqrt(xx ** 2 + yy ** 2) / np.sqrt(2)
        x = x * (1 - vignette * r ** 2.2)[..., None]
    # ACES
    a, b_, c_, d, e = 2.51, 0.03, 2.43, 0.59, 0.14
    x = np.clip((x * (a * x + b_)) / (x * (c_ * x + d) + e), 0, 1)
    if grain > 0:
        rng = np.random.default_rng(seed)
        x = x + (rng.random(x.shape, np.float32) - 0.5) * grain
    return np.clip(x, 0, 1)


def save_png(arr01, path):
    from PIL import Image
    im = (np.clip(arr01, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(im).save(path)
    return path
