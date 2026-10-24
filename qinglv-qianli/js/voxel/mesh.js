/* 网格化：面剔除 + 四角顶点 AO + 烘焙顶点色/显形因子
 * 索引式输出（每面 4 顶点），属性：
 *   position f32x3 · normal i8x3 · color u8x3 · dye u8x2
 * 只输出着色器真正读取的属性：曾经每顶点还产出 gloss(u8)+reveal(u8x2)，
 * 但 toGeometry 从不上传、shader 从不读取、mergeGeoms 直接丢弃——
 * 1.9M 面 × 4 顶点 × 3 B ≈ 22 MB 与 1500 万次 push 全是白做的功。
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
  _grow(k) {
    let cap = this.a.length / this.stride * 2;
    while (cap * this.stride < (this.n + k) * this.stride) cap *= 2;
    const b = new this.Ctor(cap * this.stride);
    b.set(this.a);
    this.a = b;
  }
  push3(x, y, z) {
    const n = this.n, s = this.stride, a = this.a;
    if ((n + 1) * s > a.length) this._grow(1);
    const o = n * s, t = this.a;
    t[o] = x; t[o + 1] = y; t[o + 2] = z;
    this.n = n + 1;
  }
  push2(x, y) {
    const n = this.n, s = this.stride, a = this.a;
    if ((n + 1) * s > a.length) this._grow(1);
    const o = n * s, t = this.a;
    t[o] = x; t[o + 1] = y;
    this.n = n + 1;
  }
  out() { return this.a.slice(0, this.n * this.stride); }
}

/* 索引缓冲：原来用普通数组存 1100 万个数（V8 里是 88 MB 的 double 数组），
   再 Uint32Array.from 整份拷一遍。改成定长增长 + 直接写 u32。 */
class IndexBuf {
  constructor(cap) { this.a = new Uint32Array(cap); this.n = 0; }
  _grow() {
    const b = new Uint32Array(this.a.length * 2);
    b.set(this.a);
    this.a = b;
  }
  quad(v0, v1, v2, v3) {
    if (this.n + 6 > this.a.length) this._grow();
    const a = this.a, i = this.n;
    a[i] = v1; a[i + 1] = v2; a[i + 2] = v3;
    a[i + 3] = v1; a[i + 4] = v3; a[i + 5] = v0;
    this.n = i + 6;
  }
  quadAlt(v0, v1, v2, v3) {
    if (this.n + 6 > this.a.length) this._grow();
    const a = this.a, i = this.n;
    a[i] = v0; a[i + 1] = v1; a[i + 2] = v2;
    a[i + 3] = v0; a[i + 4] = v2; a[i + 5] = v3;
    this.n = i + 6;
  }
  out() { return this.a.slice(0, this.n); }
}

/**
 * 一次遍历、多路输出。
 *
 * 原来每个分段要对同一个 Grid 调 11 次 buildGeometry（matte/gloss/emit×3/
 * fall/spray/mist/far…），每次都在回调里把不属于自己的体素判掉再 return——
 * 193 万体素被访问 2100 万次，而且每次都要把整张 chunk Map 从头扫一遍。
 * 这里改成：材质 id → 目标组 的查表路由，一次遍历把面写进各自的缓冲。
 *
 * @param {import('./core.js').Grid} grid
 * @param {Array<{kind?:number, matFilter?:Function}>} groups 首个命中的组生效，故特例要排在通例前
 * @param {object} o { scale, center, ao, yMin, ySpan, x0, x1, occlude }
 *   x0/x1：只输出这个 X 区间，用于把长卷切成可被视锥剔除的网格块
 *   染色层（aDye）：x = 出现阈值，y = 落色阈值，均 0..1
 * @returns {Array<object|null>} 与 groups 一一对应
 */
export function buildGeometrySet(grid, groups, o = {}) {
  const nG = groups.length;
  const scale = o.scale ?? 1;
  const cx = o.center?.[0] ?? 0, cy = o.center?.[1] ?? 0, cz = o.center?.[2] ?? 0;
  const useAO = o.ao !== false;
  const yMin = o.yMin ?? -1e9;
  const ySpan = o.ySpan ?? 400;
  const hasRange = o.x0 !== undefined && o.x1 !== undefined;
  /* 互为遮挡：细壳朝着粗格岩芯的那些面必须剔掉，否则每一列都白出一张底面，
     坡面上 L 跳变处还会成片白出侧向面（实测这一项就值 180 万面）。 */
  const occ = o.occlude ?? null;
  const solid = occ ? (x, y, z) => grid.hasI(x, y, z) || occ(x, y, z) : (x, y, z) => grid.hasI(x, y, z);
  /* 网格坐标恒为整数（来自 forEachVoxel），走跳过 Math.floor 的快路径。 */
  const at = (x, y, z) => grid.getI(x, y, z);

  const route = new Int16Array(MATERIALS.length).fill(-1);
  const gEmit = new Uint8Array(nG);
  const gSolid = new Uint8Array(nG);
  for (let gi = 0; gi < nG; gi++) {
    const g = groups[gi];
    const kind = g.kind ?? KIND.SOLID;
    gEmit[gi] = kind === KIND.EMIT ? 1 : 0;
    gSolid[gi] = kind === KIND.SOLID ? 1 : 0;
    for (let mi = 1; mi < MATERIALS.length; mi++) {
      if (route[mi] >= 0) continue;
      const M = MATERIALS[mi];
      if (!M || M.kind !== kind) continue;
      if (g.matFilter && !g.matFilter(mi)) continue;
      route[mi] = gi;
    }
  }

  const P = [], N = [], C = [], D = [], IX = [], faceCount = new Int32Array(nG);
  for (let gi = 0; gi < nG; gi++) {
    P.push(new Buf(Float32Array, 3, 1 << 14));
    N.push(new Buf(Int8Array, 3, 1 << 14));
    C.push(new Buf(Uint8Array, 3, 1 << 14));
    D.push(new Buf(Uint8Array, 2, 1 << 14));
    IX.push(new IndexBuf(1 << 16));
  }

  const visit = hasRange
    ? (fn) => grid.forEachVoxelX(o.x0, o.x1, fn)
    : (fn) => grid.forEachVoxel(fn);

  /* 45° 斜向梯面的暂存区：原来每个体素都新建 1 个 6 元数组 + 最多 6 个
     3 元数组，1.9M 体素就是 1400 万次分配、纯喂 GC。提到循环外复用。 */
  const diag = new Int8Array(6);
  const dnx = new Float64Array(6);
  const dnz = new Float64Array(6);
  const SADX = [1, -1, 0, 0], SADZ = [0, 0, 1, -1]; // 面 2,3,4,5 的 (dx,dz)

  visit((x, y, z, m) => {
    const gi = m < route.length ? route[m] : -1;
    if (gi < 0 || y < yMin) return;
    const M = MATERIALS[m];
    const emissive = gEmit[gi] === 1;
    const jitter = 0.96 + hash3(x, y, z) * 0.08;

    /* ---- 染色层：三矾九染的时间轴 ----
       山体（dye=0）按高度排先后：赭石打底自山脚 soaked 上来，
       落色也自山脚先绿、山头最后压石青——「山头厚重、山脚轻薄」的时序化。
       泥金(1)、生灵(2)、勾云(3) 各自排在末尾，是最后几笔。 */
    const h = Math.max(0, Math.min(1, (y - yMin) / ySpan));
    const r1 = hash3(x * 5 + 11, y * 3 + 7, z * 13 + 3);
    const r2 = hash3(x * 7 + 3, y * 11 + 5, z * 5 + 17);
    let appear, colorT;
    if (M.dye >= 3) { appear = 0.79 + r2 * 0.06; colorT = 0.885; }
    else if (M.dye >= 2.6) { appear = 0.86 + r2 * 0.05; colorT = 0.95; }
    else if (M.dye >= 2.5) { appear = 0.89 + r2 * 0.045; colorT = 0.96; }
    else if (M.dye >= 2.4) { appear = 0.92 + r2 * 0.04; colorT = 0.975; }
    else if (M.dye >= 2) { appear = 0.925 + r2 * 0.055; colorT = 0.985; }
    else if (M.dye >= 1) { appear = 0.855 + r2 * 0.05; colorT = 0.925; }
    else { appear = 0.02 + h * 0.13 + r2 * 0.055; colorT = 0.255 + h * 0.37 + r1 * 0.05; }
    const dA = Math.max(0, Math.min(255, appear * 255)) | 0;
    const dC = Math.max(0, Math.min(255, colorT * 255)) | 0;

    /* 45° 斜向梯面：同一斜面上的两个正交面合成斜面法线，消除明暗条纹 */
    diag[0] = diag[1] = diag[2] = diag[3] = diag[4] = diag[5] = 0;
    for (let i = 0; i < 4; i++) {
      const ax = SADX[i], az = SADZ[i];
      for (let j = i + 1; j < 4; j++) {
        const bx = SADX[j], bz = SADZ[j];
        if (ax === bx || az === bz) continue;            // 需两轴不同
        const dx = ax, dz = bz;
        const fa = i + 2, fb = j + 2;
        if (at(x + dx, y, z + dz)) continue;
        if (!at(x - dx, y, z + dz) || !at(x + dx, y, z - dz)) continue;
        const l = 0.7071;
        diag[fa] = 1; diag[fb] = 1;
        dnx[fa] = dnx[fb] = dx * l;
        dnz[fa] = dnz[fb] = dz * l;
      }
    }

    const Pb = P[gi], Nb = N[gi], Cb = C[gi], Db = D[gi], Xb = IX[gi];
    const soft = SOFT_SIDE.has(m);

    for (let fi = 0; fi < 6; fi++) {
      const F = FACES[fi];
      const fnx = F.n[0], fny = F.n[1], fnz = F.n[2];
      let fx = fnx, fy = fny, fz = fnz;
      if (diag[fi]) { fx = dnx[fi]; fy = 0; fz = dnz[fi]; }
      /* 瓦面是筒瓦密排的浅阶：低角度阳光下每级立水都吃不到直射，
         整片坡面就黑成方格网。这里把立水法线上抬并补一份瓦间互反光，
         让"瓦楞"读成瓦楞而不是窟窿。 */
      const tileSide = soft && F.dir >= 2;
      if (tileSide) {
        const inv = 1 / Math.hypot(fx, 0.55, fz);
        fx *= inv; fy = 0.55 * inv; fz *= inv;
      }
      const nb = at(x + fnx, y + fny, z + fnz);
      if (nb) {
        const nk = MATERIALS[nb] ? MATERIALS[nb].kind : KIND.SOLID;
        // 实体面只在对着“空/半透明”时输出；其它组只对着空时输出
        if (!(nk === KIND.ALPHA && gSolid[gi] === 1)) continue;
      } else if (occ && occ(x + fnx, y + fny, z + fnz)) {
        continue;
      }
      const topSun = F.dir === 0 ? 1.06 : tileSide ? 1.55 : 1;
      const rgb = shadeOf(m, x, y, z, F.dir);
      const start = Pb.n;
      let a01 = 0, a23 = 0;
      for (let ci = 0; ci < 4; ci++) {
        const c = F.c[ci];
        let a = 1;
        if (useAO && !emissive) {
          const s1 = solid(x + c.s1[0], y + c.s1[1], z + c.s1[2]) ? 1 : 0;
          const s2 = solid(x + c.s2[0], y + c.s2[1], z + c.s2[2]) ? 1 : 0;
          const cc = solid(x + c.cn[0], y + c.cn[1], z + c.cn[2]) ? 1 : 0;
          a = AO_CURVE[aoLevel(s1, s2, cc)];
          if (soft) a = 1 - (1 - a) * 0.45;
        }
        if (ci === 0) a01 = a; else if (ci === 1) a01 += a;
        else if (ci === 2) a23 = a; else a23 += a;
        const k = (emissive ? 1.18 : a) * jitter * topSun;
        Pb.push3((x + c.p[0] - cx) * scale, (y + c.p[1] - cy) * scale, (z + c.p[2] - cz) * scale);
        Nb.push3(fx * 127, fy * 127, fz * 127);
        Cb.push3(
          Math.min(255, rgb[0] * k * 255) | 0,
          Math.min(255, rgb[1] * k * 255) | 0,
          Math.min(255, rgb[2] * k * 255) | 0
        );
        Db.push2(dA, dC);
      }
      // 沿 AO 较亮一侧的对角线拆分，减少明暗撕裂
      if (a01 > a23) Xb.quad(start, start + 1, start + 2, start + 3);
      else Xb.quadAlt(start, start + 1, start + 2, start + 3);
      faceCount[gi]++;
    }
  });

  const out = [];
  for (let gi = 0; gi < nG; gi++) {
    if (!faceCount[gi]) { out.push(null); continue; }
    out.push({
      position: P[gi].out(),
      normal: N[gi].out(),
      color: C[gi].out(),
      dye: D[gi].out(),
      index: IX[gi].out(),
      stats: { vertices: P[gi].n, faces: faceCount[gi] },
    });
  }
  return out;
}

/** 单组输出的旧接口。 */
export function buildGeometry(grid, o = {}) {
  return buildGeometrySet(grid, [o], o)[0];
}

/** 每种材质的体素数，用于检查细节密度 */
export function materialCensus(grid) {
  const t = new Array(MATERIALS.length).fill(0);
  grid.forEachVoxel((x, y, z, m) => { t[m]++; });
  return t.map((n, i) => ({ id: i, name: MATERIALS[i]?.name ?? "-", n }))
    .filter((e) => e.n > 0)
    .sort((a, b) => b.n - a.n);
}
