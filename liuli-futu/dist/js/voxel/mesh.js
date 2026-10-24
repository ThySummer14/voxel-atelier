/* 网格化：面剔除 + 四角顶点 AO + 烘焙顶点色/光泽/显形因子
 * 索引式输出（每面 4 顶点），属性：
 *   position f32x3 · normal i8x3 · color u8x3 · gloss u8 · reveal u8x2
 */
import { KIND, MATERIALS, SOFT_SIDE, shadeOf } from "../palette.js";
import { hash3 } from "./core.js";

const FACES = [
  { n: [0, 1, 0], dir: 0, c: [
      { p: [0, 1, 0], s1: [-1, 1, 0], s2: [0, 1, -1], cn: [-1, 1, -1] },
      { p: [1, 1, 0], s1: [1, 1, 0], s2: [0, 1, -1], cn: [1, 1, -1] },
      { p: [1, 1, 1], s1: [1, 1, 0], s2: [0, 1, 1], cn: [1, 1, 1] },
      { p: [0, 1, 1], s1: [-1, 1, 0], s2: [0, 1, 1], cn: [-1, 1, 1] } ] },
  { n: [0, -1, 0], dir: 1, c: [
      { p: [0, 0, 1], s1: [-1, -1, 0], s2: [0, -1, 1], cn: [-1, -1, 1] },
      { p: [1, 0, 1], s1: [1, -1, 0], s2: [0, -1, 1], cn: [1, -1, 1] },
      { p: [1, 0, 0], s1: [1, -1, 0], s2: [0, -1, -1], cn: [1, -1, -1] },
      { p: [0, 0, 0], s1: [-1, -1, 0], s2: [0, -1, -1], cn: [-1, -1, -1] } ] },
  { n: [1, 0, 0], dir: 2, c: [
      { p: [1, 0, 1], s1: [1, -1, 0], s2: [1, 0, 1], cn: [1, -1, 1] },
      { p: [1, 0, 0], s1: [1, -1, 0], s2: [1, 0, -1], cn: [1, -1, -1] },
      { p: [1, 1, 0], s1: [1, 1, 0], s2: [1, 0, -1], cn: [1, 1, -1] },
      { p: [1, 1, 1], s1: [1, 1, 0], s2: [1, 0, 1], cn: [1, 1, 1] } ] },
  { n: [-1, 0, 0], dir: 3, c: [
      { p: [0, 0, 0], s1: [-1, -1, 0], s2: [-1, 0, -1], cn: [-1, -1, -1] },
      { p: [0, 0, 1], s1: [-1, -1, 0], s2: [-1, 0, 1], cn: [-1, -1, 1] },
      { p: [0, 1, 1], s1: [-1, 1, 0], s2: [-1, 0, 1], cn: [-1, 1, 1] },
      { p: [0, 1, 0], s1: [-1, 1, 0], s2: [-1, 0, -1], cn: [-1, 1, -1] } ] },
  { n: [0, 0, 1], dir: 4, c: [
      { p: [1, 0, 1], s1: [1, 0, 1], s2: [0, -1, 1], cn: [1, -1, 1] },
      { p: [0, 0, 1], s1: [-1, 0, 1], s2: [0, -1, 1], cn: [-1, -1, 1] },
      { p: [0, 1, 1], s1: [-1, 0, 1], s2: [0, 1, 1], cn: [-1, 1, 1] },
      { p: [1, 1, 1], s1: [1, 0, 1], s2: [0, 1, 1], cn: [1, 1, 1] } ] },
  { n: [0, 0, -1], dir: 5, c: [
      { p: [0, 0, 0], s1: [-1, 0, -1], s2: [0, -1, -1], cn: [-1, -1, -1] },
      { p: [1, 0, 0], s1: [1, 0, -1], s2: [0, -1, -1], cn: [1, -1, -1] },
      { p: [1, 1, 0], s1: [1, 0, -1], s2: [0, 1, -1], cn: [1, 1, -1] },
      { p: [0, 1, 0], s1: [-1, 0, -1], s2: [0, 1, -1], cn: [-1, 1, -1] } ] },
];

/* 统一绕序：使每个面的四角按“从外侧看为逆时针”排列 */
for (const F of FACES) {
  const [a, b, c] = F.c;
  const e1 = [b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]];
  const e2 = [c.p[0] - a.p[0], c.p[1] - a.p[1], c.p[2] - a.p[2]];
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  if (nx * F.n[0] + ny * F.n[1] + nz * F.n[2] < 0) F.c.reverse();
}

const AO_CURVE = [0.62, 0.77, 0.90, 1.0];
const aoLevel = (s1, s2, c) => (s1 && s2 ? 0 : 3 - (s1 + s2 + c));

class Buf {
  constructor(Ctor, stride, cap) {
    this.Ctor = Ctor; this.stride = stride; this.n = 0;
    this.a = new Ctor(cap * stride);
  }
  ensure(k) {
    const need = (this.n + k) * this.stride;
    if (need <= this.a.length) return;
    let cap = this.a.length / this.stride * 2;
    while (cap * this.stride < need) cap *= 2;
    const b = new this.Ctor(cap * this.stride);
    b.set(this.a);
    this.a = b;
  }
  push(...vals) {
    this.ensure(1);
    const o = this.n * this.stride;
    for (let i = 0; i < vals.length; i++) this.a[o + i] = vals[i];
    this.n++;
  }
  setAt(vi, vals) {
    const o = vi * this.stride;
    for (let i = 0; i < vals.length; i++) this.a[o + i] = vals[i];
  }
  out() { return this.a.slice(0, this.n * this.stride); }
}

/**
 * @param {import('./core.js').Grid} grid
 * @param {object} o { kind, scale, center, ao, yMin, ySpan, matFilter }
 */
export function buildGeometry(grid, o = {}) {
  const kind = o.kind ?? KIND.SOLID;
  const scale = o.scale ?? 1;
  const cx = o.center?.[0] ?? 0, cy = o.center?.[1] ?? 0, cz = o.center?.[2] ?? 0;
  const useAO = o.ao !== false;
  const yMin = o.yMin ?? -1e9;
  const ySpan = o.ySpan ?? 400;
  const matFilter = o.matFilter ?? null;

  const P = new Buf(Float32Array, 3, 1 << 16);
  const N = new Buf(Int8Array, 3, 1 << 16);
  const C = new Buf(Uint8Array, 3, 1 << 16);
  const G = new Buf(Uint8Array, 1, 1 << 16);
  const R = new Buf(Uint8Array, 2, 1 << 16);
  const idxArr = [];
  let faces = 0;

  grid.forEachVoxel((x, y, z, m) => {
    const M = MATERIALS[m];
    if (!M || M.kind !== kind || y < yMin) return;
    if (matFilter && !matFilter(m)) return;
    const emissive = kind === KIND.EMIT;
    const rgb = shadeOf(m, x, y, z, 0);
    const jitter = 0.96 + hash3(x, y, z) * 0.08;
    const revT = Math.max(0, Math.min(255, ((y - yMin) / ySpan) * 255)) | 0;
    const revR = (hash3(x * 3 + 1, y * 7 + 3, z * 5 + 9) * 255) | 0;

    /* 45° 斜向梯面：同一斜面上的两个正交面合成斜面法线，消除明暗条纹 */
    const diag = [0, 0, 0, 0, 0, 0];
    const dn = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const SIDE = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // 面 2,3,4,5 的 (dx,dz)
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++) {
        const [ax, az] = SIDE[i], [bx, bz] = SIDE[j];
        if (ax === bx || az === bz) continue;            // 需两轴不同
        const dx = ax, dz = bz;
        const fa = i + 2, fb = j + 2;
        if (grid.has(x + dx, y, z + dz)) continue;
        if (!grid.has(x - dx, y, z + dz) || !grid.has(x + dx, y, z - dz)) continue;
        const l = 0.7071;
        diag[fa] = diag[fb] = 1;
        dn[fa] = [dx * l, 0, dz * l];
        dn[fb] = [dx * l, 0, dz * l];
      }

    for (let fi = 0; fi < 6; fi++) {
      const F = FACES[fi];
      let fx = F.n[0], fy = F.n[1], fz = F.n[2];
      if (diag[fi]) { fx = dn[fi][0]; fy = dn[fi][1]; fz = dn[fi][2]; }
      /* 瓦面是筒瓦密排的浅阶：低角度阳光下每级立水都吃不到直射，
         整片坡面就黑成方格网。这里把立水法线上抬并补一份瓦间互反光，
         让"瓦楞"读成瓦楞而不是窟窿。 */
      const tileSide = SOFT_SIDE.has(m) && F.dir >= 2;
      if (tileSide) {
        const inv = 1 / Math.hypot(fx, 0.55, fz);
        fx *= inv; fy = 0.55 * inv; fz *= inv;
      }
      const nb = grid.get(x + F.n[0], y + F.n[1], z + F.n[2]);
      if (nb) {
        const nk = MATERIALS[nb] ? MATERIALS[nb].kind : KIND.SOLID;
        // 实体面只在对着“空/半透明”时输出；其它组只对着空时输出
        if (!(nk === KIND.ALPHA && kind === KIND.SOLID)) continue;
      }
      const topSun = F.dir === 0 ? 1.06 : tileSide ? 1.55 : 1;
      const start = P.n;
      const ao = [0, 0, 0, 0];
      for (let ci = 0; ci < 4; ci++) {
        const c = F.c[ci];
        let a = 1;
        if (useAO && !emissive) {
          const s1 = grid.has(x + c.s1[0], y + c.s1[1], z + c.s1[2]) ? 1 : 0;
          const s2 = grid.has(x + c.s2[0], y + c.s2[1], z + c.s2[2]) ? 1 : 0;
          const cc = grid.has(x + c.cn[0], y + c.cn[1], z + c.cn[2]) ? 1 : 0;
          a = AO_CURVE[aoLevel(s1, s2, cc)];
          if (SOFT_SIDE.has(m)) a = 1 - (1 - a) * 0.45;
        }
        ao[ci] = a;
        const k = (emissive ? 1.18 : a) * jitter * topSun;
        P.push((x + c.p[0] - cx) * scale, (y + c.p[1] - cy) * scale, (z + c.p[2] - cz) * scale);
        N.push(fx * 127, fy * 127, fz * 127);
        C.push(
          Math.min(255, rgb[0] * k * 255) | 0,
          Math.min(255, rgb[1] * k * 255) | 0,
          Math.min(255, rgb[2] * k * 255) | 0
        );
        G.push((M.gloss * 255) | 0);
        R.push(revT, revR);
      }
      // 沿 AO 较亮一侧的对角线拆分，减少明暗撕裂
      if (ao[0] + ao[2] > ao[1] + ao[3]) idxArr.push(start + 1, start + 2, start + 3, start + 1, start + 3, start + 0);
      else idxArr.push(start + 0, start + 1, start + 2, start + 0, start + 2, start + 3);
      faces++;
    }
  });

  return {
    position: P.out(),
    normal: N.out(),
    color: C.out(),
    gloss: G.out(),
    reveal: R.out(),
    index: Uint32Array.from(idxArr),
    stats: { vertices: P.n, faces },
  };
}

/** 每种材质的体素数，用于检查细节密度 */
export function materialCensus(grid) {
  const t = new Array(MATERIALS.length).fill(0);
  grid.forEachVoxel((x, y, z, m) => { t[m]++; });
  return t.map((n, i) => ({ id: i, name: MATERIALS[i]?.name ?? "-", n }))
    .filter((e) => e.n > 0)
    .sort((a, b) => b.n - a.n);
}
