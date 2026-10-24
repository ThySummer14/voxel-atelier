/* 山体：高度场 → 平台整平 → 层叠台阶化 → 雕刻
 *
 * 色彩按考据执行垂直色带：赭石打底于山坡水岸 → 山腰汁绿/石绿 → 山头厚石青，
 * 「山头颜色厚重饱满，山脚颜色轻薄」。
 *
 * 实心性：粗格岩芯（cell 3）自 y=−6 填到 L，细格壳自 L 填到地表 top，
 * L 取 3×3 足迹内最低地表的 3 的整倍数下界，故 L ≤ 每一列的 top，
 * 两段并起来恰好是 [−6, top] 连续实心——山体在任何机位都不透光，也不会有粗块戳出地表。
 */
import { WORLD, GROUPS, VILLAGES, TEMPLES, MILL, PAVILIONS, HERMITAGES, LONG_BRIDGE, BRIDGES } from "./score.js";
import { fbm2, valueNoise2, valueNoise3, hash3, mulberry32, clamp, lerp, smoothstep } from "../voxel/core.js";
import { BlockField } from "../voxel/blocks.js";
import * as P from "../palette.js";

export const NX = WORLD.x1 - WORLD.x0 + 1;
export const NZ = WORLD.z1 - WORLD.z0 + 1;
export const CORE = 3;              // 岩芯格尺寸
export const CORE_BOT = -2;         // 岩芯底：水面是 opaque 着色器平面，其下一律不可见，只留 2 格压住岸线

const ix = (x) => x - WORLD.x0;
const iz = (z) => z - WORLD.z0;
const at = (x, z) => ix(x) * NZ + iz(z);

let H = null;          // 浮点高度场
let TOP = null;        // 整数量化地表
let SLP = null;        // 坡度 0..1
let LOW = null;        // 每列所属 3×3 足迹的岩芯顶 L

/** 供 Worker 传输的地形快照；只含数据，不携带采样函数。 */
export const TERRAIN_STATE = { top: null };

/* 体量调节旋钮：山太胖会把内存吃光（每面约 104 B），
   半径系数是唯一能同时压住陆格数与平均坡度的杠杆。tools/stats.mjs 会扫它。
   hMul/rMul 一起调「高宽比」：第一版 h/r 太大，整座山是 61° 的锥，
   青绿色带没有落脚的缓坡，全被陡壁分支吃掉了。 */
export const CFG = { rMul: 1.08, profAdd: -0.25, detail: 1.0, hMul: 0.68 };

/* ---------------------------------------------------------------- 高度场 */

function addSpine(out, sp) {
  const n = sp.nodes;
  const segs = n.length === 1 ? [[n[0], n[0]]] : n.slice(0, -1).map((a, i) => [a, n[i + 1]]);
  for (const [A, B] of segs) {
    const [ax, az, ah, ar] = A, [bx, bz, bh, br] = B;
    const rmax = Math.max(ar, br) * 1.3 + 4;
    const x0 = Math.max(WORLD.x0, Math.floor(Math.min(ax, bx) - rmax));
    const x1 = Math.min(WORLD.x1, Math.ceil(Math.max(ax, bx) + rmax));
    const z0 = Math.max(WORLD.z0, Math.floor(Math.min(az, bz) - rmax));
    const z1 = Math.min(WORLD.z1, Math.ceil(Math.max(az, bz) + rmax));
    const dx = bx - ax, dz = bz - az;
    const L2 = dx * dx + dz * dz || 1;
    const sd = sp.seed;
    for (let x = x0; x <= x1; x++)
      for (let z = z0; z <= z1; z++) {
        let t = ((x - ax) * dx + (z - az) * dz) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const px = ax + dx * t, pz = az + dz * t;
        const ex = x - px, ez = z - pz;
        const d = Math.sqrt(ex * ex + ez * ez);
        const h = (ah + (bh - ah) * t) * CFG.hMul;
        const r = (ar + (br - ar) * t) * CFG.rMul * (1 + sp.twist * (fbm2(x * 0.026 + sd, z * 0.026 - sd, 3, sd * 7 + 3) - 0.5) * 2);
        if (d >= r) continue;
        const u = d / r;
        /* 峰形：主项给出陡脊圆顶，副项在坡面拗出沟壑（荷叶皴自峰顶放射下披的形态） */
        let v = h * Math.pow(1 - u, sp.prof + CFG.profAdd);
        v *= 1 + 0.16 * (fbm2(x * 0.05 + sd * 3, z * 0.05 - sd, 3, sd * 13 + 5) - 0.5) * 2;
        const gully = Math.sin(Math.atan2(ez, ex) * 7 + fbm2(x * 0.02, z * 0.02, 2, sd) * 5);
        v *= 1 - 0.055 * Math.max(0, gully) * u;
        const k = at(x, z);
        if (v > out[k]) out[k] = v;
      }
  }
}

/** 平台整平：把 (cx,cz) 半径 r 内的高度压到 level，边缘羽化 */
function platform(out, cx, cz, r, level, feather = 0.45) {
  const x0 = Math.max(WORLD.x0, Math.floor(cx - r - 6)), x1 = Math.min(WORLD.x1, Math.ceil(cx + r + 6));
  const z0 = Math.max(WORLD.z0, Math.floor(cz - r - 6)), z1 = Math.min(WORLD.z1, Math.ceil(cz + r + 6));
  for (let x = x0; x <= x1; x++)
    for (let z = z0; z <= z1; z++) {
      const d = Math.hypot(x - cx, z - cz);
      if (d > r * (1 + feather)) continue;
      const k = at(x, z);
      const w = 1 - smoothstep(r * (1 - feather), r * (1 + feather), d);
      out[k] = out[k] * (1 - w) + level * w;
    }
}

/** 在高度场上压出一条水平带（桥的两岸、栈道） */
function levelStrip(out, x0, z0, x1, z1, w, level) {
  const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0));
  const dx = (x1 - x0) / n, dz = (z1 - z0) / n;
  const nx = -dz, nz = dx;
  const nl = Math.hypot(nx, nz) || 1;
  for (let i = 0; i <= n; i++) {
    const cx = x0 + dx * i, cz = z0 + dz * i;
    for (let s = -w; s <= w; s++) {
      const x = Math.round(cx + (nx / nl) * s), z = Math.round(cz + (nz / nl) * s);
      if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) continue;
      const k = at(x, z);
      const w2 = 1 - smoothstep(w * 0.55, w, Math.abs(s));
      out[k] = out[k] * (1 - w2) + level * w2;
    }
  }
}

export function buildHeightfield() {
  H = new Float32Array(NX * NZ);

  for (const g of GROUPS) for (const sp of g.spines) addSpine(H, sp);

  /* 全局细节：山体越高，起伏越大。
     波长必须远大于 1 格：第三版用 0.048×3 octaves，最短波长只有 5.2 格、
     幅度 ±0.8，量化成整数后每 5 格翻一个 ±1 的台阶——坡面整片读成人工草皮
     的棋盘麻点。手工感本来就该由烘进顶点色的皴纹承担，不该由地形抖出来。 */
  for (let x = WORLD.x0; x <= WORLD.x1; x++)
    for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const k = at(x, z);
      const h = H[k];
      if (h <= 0.5) continue;
      const fine = (fbm2(x * 0.026, z * 0.026, 2, 101) - 0.5) * (0.8 + h * 0.010) * CFG.detail;
      const broad = (fbm2(x * 0.017 + 40, z * 0.017 - 20, 3, 103) - 0.5) * (h * 0.13);
      let v = h + fine + broad;
      /* 主峰一带再抽高脊线：宋画主峰「拔地而起」靠的是脊而不是胖 */
      if (h > 115) v += (h - 115) * 0.20 * smoothstep(0.45, 0.95, fbm2(x * 0.04, z * 0.04, 2, 107));
      H[k] = v;
    }

  /* 量化前一次 1-2-1 低通：把残余的单格尖峰抹平，但保留坡形。
     权重按坡度给——陡壁上的台阶是要的，缓坡上的麻点不是。 */
  {
    const src = H;
    const dst = new Float32Array(src.length);
    for (let x = WORLD.x0; x <= WORLD.x1; x++)
      for (let z = WORLD.z0; z <= WORLD.z1; z++) {
        const k = at(x, z);
        const xa = x > WORLD.x0 ? k - NZ : k, xb = x < WORLD.x1 ? k + NZ : k;
        const za = z > WORLD.z0 ? k - 1 : k, zb = z < WORLD.z1 ? k + 1 : k;
        const s = Math.abs(src[xb] - src[xa]) + Math.abs(src[zb] - src[za]);
        const w = 0.55 * Math.max(0, 1 - s * 0.22);
        const blur = (src[xa] + src[xb] + src[za] + src[zb] + src[k] * 4) / 8;
        dst[k] = src[k] * (1 - w) + blur * w;
      }
    H = dst;
  }

  /* 母题基座：先量出该处原始高度，再压平 */
  for (const v of VILLAGES) {
    const lv = sampleRaw(v.cx, v.cz);
    platform(H, v.cx, v.cz, v.spread * 0.72, Math.max(2, lv), 0.5);
  }
  for (const t of TEMPLES) {
    const lv = sampleRaw(t.x, t.z);
    platform(H, t.x, t.z, t.w + 9, Math.max(3, lv), 0.5);
  }
  for (const p of PAVILIONS) {
    const lv = Math.max(1.5, sampleRaw(p.x, p.z - 6));
    platform(H, p.x, p.z, p.w + 4, lv, 0.5);
  }
  for (const h of HERMITAGES) {
    const lv = sampleRaw(h.x, h.z);
    platform(H, h.x, h.z, h.w + 5, lv, 0.45);
  }
  {
    const lv = sampleRaw(MILL.x, MILL.z);
    platform(H, MILL.x, MILL.z, MILL.dam * 0.8, Math.max(2, lv - 2), 0.5);
  }
  /* 桥的两端要落到实地：把端点附近压到接近水面的低台 */
  levelStrip(H, LONG_BRIDGE.x0, LONG_BRIDGE.z0, LONG_BRIDGE.x1, LONG_BRIDGE.z1, 9, 3.2);
  for (const b of BRIDGES) levelStrip(H, b.x0, b.z0, b.x1, b.z1, 6, 2.6);

  /* 层叠台阶化：只在陡坡上做，缓坡保持圆润。
     「山峦层叠」是第 4 组的性格，靠 3 格一台的岩层读出来。
     阈值不能太低：3 格一台在 1.5 格/2 格的坡上就会全线触发，而 SLP 又把
     这种台阶自己读成陡壁——于是赭石岩层爬满半座山，青绿没有落脚的地方。 */
  for (let x = WORLD.x0 + 1; x < WORLD.x1; x++)
    for (let z = WORLD.z0 + 1; z < WORLD.z1; z++) {
      const k = at(x, z);
      const h = H[k];
      if (h < 6) continue;
      const gx = H[at(x + 1, z)] - H[at(x - 1, z)];
      const gz = H[at(x, z + 1)] - H[at(x, z - 1)];
      const s = Math.hypot(gx, gz) * 0.5;
      const w = smoothstep(2.1, 3.9, s) * smoothstep(16, 64, h);
      if (w <= 0.01) continue;
      const step = 3;
      const q = Math.round(h / step) * step;
      H[k] = lerp(h, q, w * 0.7);
    }

  /* 岸线：水陆交接处压出一道缓滩，赭石水岸才铺得开 */
  for (let x = WORLD.x0; x <= WORLD.x1; x++)
    for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const k = at(x, z);
      const h = H[k];
      if (h <= 0 || h > 9) continue;
      H[k] = h * 0.62 + 0.4;
    }

  quantize();
  return H;
}

function sampleRaw(x, z) {
  x = clamp(Math.round(x), WORLD.x0, WORLD.x1);
  z = clamp(Math.round(z), WORLD.z0, WORLD.z1);
  return H[at(x, z)];
}

function quantize() {
  TOP = new Int16Array(NX * NZ);
  TERRAIN_STATE.top = TOP;
  SLP = new Uint8Array(NX * NZ);
  for (let x = WORLD.x0; x <= WORLD.x1; x++)
    for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const k = at(x, z);
      const h = H[k];
      TOP[k] = h <= 0.35 ? -1 : Math.max(1, Math.round(h));
    }
  /* 坡度（量化后算，台阶才会被识别成陡壁） */
  for (let x = WORLD.x0; x <= WORLD.x1; x++)
    for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const k = at(x, z);
      const xa = x > WORLD.x0 ? x - 1 : x, xb = x < WORLD.x1 ? x + 1 : x;
      const za = z > WORLD.z0 ? z - 1 : z, zb = z < WORLD.z1 ? z + 1 : z;
      const gx = (TOP[at(xb, z)] - TOP[at(xa, z)]) / Math.max(1, xb - xa);
      const gz = (TOP[at(x, zb)] - TOP[at(x, za)]) / Math.max(1, zb - za);
      SLP[k] = clamp(Math.round(Math.hypot(gx, gz) * 60), 0, 255);
    }
  /* 岩芯顶 L：每 3×3 足迹取最低地表，向下取到 CORE 的整倍数。
     足迹必须对齐到 CORE 的整倍数网格，否则与 carve() 里的粗格块错位，
     岩芯会整片裸露（面数直接爆掉十倍）。 */
  LOW = new Int16Array(NX * NZ);
  for (const [bx, bz] of footprints()) {
    let lo = 1e9;
    for (let x = bx; x < bx + CORE; x++)
      for (let z = bz; z < bz + CORE; z++) {
        if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) continue;
        const t = TOP[at(x, z)];
        if (t < lo) lo = t;
      }
    if (lo > 1e8) continue;
    const L = Math.max(0, Math.floor(Math.max(0, lo) / CORE) * CORE);
    for (let x = bx; x < bx + CORE; x++)
      for (let z = bz; z < bz + CORE; z++) {
        if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) continue;
        LOW[at(x, z)] = L;
      }
  }
}

/** 对齐到 CORE 整数倍的足迹起点序列 */
export function footprints() {
  const out = [];
  const x0 = Math.floor(WORLD.x0 / CORE) * CORE;
  const z0 = Math.floor(WORLD.z0 / CORE) * CORE;
  for (let bx = x0; bx <= WORLD.x1; bx += CORE)
    for (let bz = z0; bz <= WORLD.z1; bz += CORE) out.push([bx, bz]);
  return out;
}

/** 地表高度（整数，−1 = 水）；浮点坐标先 floor，越界统一按无地形处理。 */
export function topAt(x, z) {
  x = Math.floor(x); z = Math.floor(z);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return -1;
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return -1;
  return TOP ? TOP[at(x, z)] : -1;
}
export function slopeAt(x, z) {
  x = Math.floor(x); z = Math.floor(z);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return 0;
  if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) return 0;
  return SLP ? SLP[at(x, z)] / 60 : 0;
}
/** 连续高度（供建筑/船只落位） */
export function heightAt(x, z) {
  x = clamp(Math.round(x), WORLD.x0, WORLD.x1);
  z = clamp(Math.round(z), WORLD.z0, WORLD.z1);
  return H[at(x, z)];
}
export function isWater(x, z) { return topAt(x, z) < 0; }

/* ---------------------------------------------------------------- 材质分带 */

/** 垂直色带：山脚赭石 → 山腰二绿三绿 → 山头厚石青（考据 #5）。
 *  色带按全卷最高峰归一，这样七组山共用同一条「分染次序」，
 *  矮山自然只染到绿、主峰才压得上头青——和画里的逻辑一致。 */
const H_MAX = 215;
function bandOf(t, s, x, y, z) {
  /* 分染是大片晕染：带内取色用低频噪声（几十格一片），
     逐格高频只留给矿物颗粒。第一版用逐格噪声翻色，青顶读成一脸棋盘。 */
  const wash = fbm2(x * 0.021 + y * 0.008, z * 0.021 - y * 0.006, 3, 211);
  const hh = (t + (wash - 0.5) * 12) / H_MAX;

  /* 陡壁：只有真正近乎垂直的面才露岩层，其余一律走色带。
     阈值 3.1 而不是 2.4：台阶化自己会把坡面读数推到 3 附近，
     2.4 等于让半座山的立水都去领岩层色，青绿就只剩山顶一小块。 */
  if (s > 3.1) {
    const q = valueNoise3(x * 0.2, y * 0.34, z * 0.2, 229);
    if (q > 0.84) return P.MOSS_DK;                       // 岩缝里的墨绿
    if (q < 0.10) return P.INK_SOFT;                      // 勾廓墨线
    if (hh > 0.60) return P.BLUE_DK;
    if (hh > 0.42) return P.CLIFF_DK;
    if (hh > 0.10) return P.GREEN_DK;                     // 绿区的台地立水仍要读作绿
    return wash > 0.5 ? P.CLIFF : P.CLIFF_DK;
  }
  /* 滩涂：画里的江岸是「留白 + 一层薄绿」，不是黄土。
     旧版这里 60–68% 取赭石，配上量化出来的 1 格台阶，
     岸坡被读成一架棕色的梯子（入画章实拍就是这个）。 */
  if (t <= 1) return wash > 0.62 ? P.OCHRE_LT : P.OCHRE;             // 水线一道赭石
  if (t <= 5) return wash > 0.30 ? P.GREEN_3 : P.OCHRE_LT;           // 滩头薄绿
  if (hh < 0.055) return wash > 0.28 ? P.GREEN_3 : P.OCHRE;
  if (hh < 0.27) return wash > 0.55 ? P.GREEN_2 : P.GREEN_3;
  if (hh < 0.56) return wash > 0.58 ? P.GREEN_1 : P.GREEN_2;
  if (hh < 0.78) return wash > 0.60 ? P.BLUE_3 : P.GREEN_1;
  if (hh < 0.90) return wash > 0.62 ? P.BLUE_2 : P.BLUE_3;
  return wash > 0.70 ? P.BLUE_1 : P.BLUE_2;                          // 山头厚石青
}

/** 岩芯用色：只在山脚露面，取赭石暗部与墨 */
function coreOf(y, x, z) {
  const n = valueNoise2(x * 0.05, z * 0.05, 241);
  if (y < -2) return P.OCHRE_DK;
  return n > 0.66 ? P.CLIFF_DK : n > 0.34 ? P.OCHRE_DK : P.EARTH;
}

/* ---------------------------------------------------------------- 雕刻 */

export function carve(g, core, opt = {}) {
  const rnd = mulberry32(20260924);
  let land = 0;

  /* 岩芯：粗格，自水面下 CORE_BOT 到 L。足迹与 LOW 用同一套对齐网格。 */
  for (const [bx, bz] of footprints()) {
    let L = -1, anyLand = false, sy = 0;
    for (let x = bx; x < bx + CORE; x++)
      for (let z = bz; z < bz + CORE; z++) {
        if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) continue;
        const k = at(x, z);
        if (TOP[k] >= 0) { anyLand = true; L = LOW[k]; sy = TOP[k]; }
      }
    if (!anyLand) continue;
    const cx3 = bx / CORE, cz3 = bz / CORE;
    for (let iy = Math.floor(CORE_BOT / CORE); iy * CORE < L; iy++)
      core.set(cx3, iy, cz3, coreOf(iy * CORE, bx, bz));
    land++;
  }

  /* 细格壳：自 L 到 top */
  for (let x = WORLD.x0; x <= WORLD.x1; x++)
    for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const k = at(x, z);
      const t = TOP[k];
      if (t < 0) continue;
      const L = LOW[k];
      const s = SLP[k] / 60;
      const topMat = bandOf(t, s, x, t, z);
      const edge = s > 1.15;
      for (let y = L; y <= t; y++) {
        let m;
        if (y === t) {
          m = topMat;
          /* 苔点：稀疏、墨绿混点。密集有序的苔点阵是南宋以后的新法，北宋不用 */
          if (!edge && t > 8 && hash3(x, t, z) > 0.965) m = rnd() > 0.5 ? P.MOSS : P.MOSS_DK;
          /* 台地边缘勾一道墨线，读作勾廓 */
          if (!edge && t > 3) {
            const nb = TOP[at(Math.min(x + 1, WORLD.x1), z)];
            if (t - nb >= 2 && hash3(x, 7, z) > 0.42) m = P.INK_SOFT;
          }
        } else if (y >= t - 2) {
          /* 顶面下两格的立水：让它继承本列的色带色，而不是一律 OCHRE_DK。
             一律压暗的结果是每一级台阶都镶一条深棕边，缓坡被读成一架棕色梯子。
             只有真陡壁才需要 CLIFF 的岩层读法。 */
          m = edge ? topMat : (s > 0.9 ? P.CLIFF : topMat);
        } else {
          m = coreOf(y, x, z);
        }
        g.set(x, y, z, m);
      }
    }
  return { landFootprints: land };
}

/* ---------------------------------------------------------------- 植被 */

/** 攒三聚五：叶簇是压扁的小团，靠堆叠出层次，不是一个球。
 *  squash<1 把竖直半径压短——旧版用 r*r*1.15（比横半径还大），
 *  于是每棵树都是一个标准棒棒糖，满山都是高尔夫球座。 */
function clump(g, cx, cy, cz, r, mats, rnd, dens = 0.62, squash = 0.6) {
  const ry = Math.max(1, r * squash);
  const R = Math.ceil(r);
  const Y = Math.ceil(ry);
  for (let dx = -R; dx <= R; dx++)
    for (let dz = -R; dz <= R; dz++)
      for (let dy = -Y; dy <= Y; dy++) {
        const d2 = (dx * dx + dz * dz) / (r * r) + (dy * dy) / (ry * ry);
        if (d2 > 1) continue;
        if (hash3(cx + dx, cy + dy, cz + dz) > dens + (1 - d2) * 0.3) continue;
        const m = dy > ry * 0.3 ? mats[2] : d2 > 0.5 ? mats[0] : mats[1];
        g.setIfEmpty(cx + dx, cy + dy, cz + dz, m);
      }
}

/** 松：塔形层叠，自下而上三到五层，层与层必须互相搭住。
 *  层间距一旦大于层厚，树就变成一根杆上串几个圆盘——远看是一排十字架。 */
function pine(g, x, y, z, h, rnd) {
  const lean = Math.round((rnd() - 0.5) * 2);
  for (let k = 0; k < h; k++) {
    g.set(x + Math.round(lean * k / h), y + k, z, k > h * 0.7 ? P.TRUNK_LT : P.TRUNK);
  }
  const n = 3 + Math.floor(rnd() * 3);             // 攒三聚五
  const squash = 0.62;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const cy = y + Math.round(h * (0.50 + t * 0.55));
    const r = 3.3 - t * 1.7 + rnd() * 0.8;
    const a = rnd() * Math.PI * 2, off = (0.42 - t * 0.34) * r;
    clump(g, x + Math.round(Math.cos(a) * off) + lean, cy,
      z + Math.round(Math.sin(a) * off), r, [P.PINE_DK, P.PINE, P.PINE_LT], rnd, 0.6, squash);
  }
}

/** 杂树（交柯）：两三个偏心的圆团挤在一根短干上，与松的塔形错开读。 */
function broadleaf(g, x, y, z, h, rnd) {
  for (let k = 0; k < h; k++) g.set(x, y + k, z, k > h * 0.45 ? P.TRUNK_LT : P.TRUNK);
  const n = 2 + Math.floor(rnd() * 2);
  const mats = rnd() > 0.72 ? [P.WILLOW_DK, P.WILLOW, P.WILLOW_LT] : [P.PINE_DK, P.PINE_LT, P.WILLOW];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 1.4;
    const r = 1.9 + rnd() * 1.5;
    clump(g, x + Math.round(Math.cos(a) * r * 0.7), y + h + Math.round(rnd() * 2 - 1),
      z + Math.round(Math.sin(a) * r * 0.7), r, mats, rnd, 0.58, 0.66);
  }
  if (rnd() > 0.86) g.setIfEmpty(x + 1, y + h + 1, z, P.BLOSSOM);   // 红花
}

function willow(g, x, y, z, h, rnd) {
  for (let k = 0; k < h; k++) g.set(x, y + k, z, k > h * 0.5 ? P.TRUNK_LT : P.TRUNK);
  const cy = y + h;
  clump(g, x, cy, z, 3.4, [P.WILLOW_DK, P.WILLOW, P.WILLOW_LT], rnd, 0.5);
  /* 垂枝：自冠缘下垂 3–6 格 */
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rnd();
    const bx = x + Math.round(Math.cos(a) * 3), bz = z + Math.round(Math.sin(a) * 3);
    const len = 3 + Math.floor(rnd() * 4);
    for (let k = 0; k < len; k++) g.setIfEmpty(bx, cy - k, bz, k > len - 2 ? P.WILLOW_LT : P.WILLOW);
  }
  if (rnd() > 0.62) g.setIfEmpty(x + 1, cy + 2, z, P.BLOSSOM);   // 绿柳红花
  if (rnd() > 0.8) g.setIfEmpty(x - 1, cy + 2, z + 1, P.BLOSSOM);
}

function bamboo(g, x, y, z, rnd) {
  const n = 3 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const bx = x + Math.round((rnd() - 0.5) * 4), bz = z + Math.round((rnd() - 0.5) * 4);
    const h = 6 + Math.floor(rnd() * 5);
    const t = topAt(bx, bz);
    if (t < 1) continue;
    for (let k = 0; k < h; k++) g.setIfEmpty(bx, t + 1 + k, bz, k % 3 === 2 ? P.BAMBOO : P.PINE_LT);
    clump(g, bx, t + h + 1, bz, 1.9, [P.BAMBOO, P.PINE_LT, P.WILLOW], rnd, 0.55);
  }
}

export function plant(g, opt = {}) {
  const rnd = mulberry32(777);
  const step = opt.step ?? 5;
  let n = 0;
  for (let x = WORLD.x0 + 2; x <= WORLD.x1 - 2; x += step)
    for (let z = WORLD.z0 + 2; z <= WORLD.z1 - 2; z += step) {
      const t = topAt(x, z);
      if (t < 1) continue;
      /* 抖动必须大于格距的一半，否则树还是站在一张看不见的 5×5 网格上。 */
      const jx = x + Math.round((hash3(x, 3, z) - 0.5) * step * 1.9);
      const jz = z + Math.round((hash3(x, 9, z) - 0.5) * step * 1.9);
      const tt = topAt(jx, jz);
      if (tt < 1 || slopeAt(jx, jz) > 1.5) continue;

      /* 柳只在水岸：top ≤ 6 且邻近水面 */
      if (tt <= 6) {
        let near = false;
        for (let d = 1; d <= 5 && !near; d++)
          if (topAt(jx + d, jz) < 0 || topAt(jx - d, jz) < 0 || topAt(jx, jz + d) < 0 || topAt(jx, jz - d) < 0) near = true;
        if (near && hash3(jx, 11, jz) > 0.80) { willow(g, jx, tt + 1, jz, 7 + Math.floor(rnd() * 5), rnd); n++; continue; }
      }
      /* 树只长在缓坡与林地里：open 陡坡上撒树是 Minecraft 味，不是宋画味。
         先用低频噪声圈出「林地」，再在林地内按攒三聚五的密度撒。 */
      if (slopeAt(jx, jz) > 1.25) continue;
      if (valueNoise2(jx * 0.032, jz * 0.032, 301) < 0.42) continue;
      const p = hash3(jx, 17, jz);
      /* 山头是裸的矿物色，不该长树：旧版反着来（越高越密），
         结果石青顶上撒满绿球，「山头厚重饱满」被读成一顶假发。 */
      const density = tt > 165 ? 0.995 : tt > 120 ? 0.975 : tt > 60 ? 0.92 : 0.945;
      if (p > density) {
        const h = 8 + Math.floor(rnd() * 9);
        if (rnd() > 0.42) pine(g, jx, tt + 1, jz, h, rnd);
        else broadleaf(g, jx, tt + 1, jz, 5 + Math.floor(rnd() * 4), rnd);
        n++;
      }
    }
  /* 竹：村落旁 */
  for (const v of VILLAGES) {
    for (let i = 0; i < 5; i++) {
      const a = rnd() * Math.PI * 2, r = v.spread * (0.7 + rnd() * 0.6);
      bamboo(g, Math.round(v.cx + Math.cos(a) * r), 0, Math.round(v.cz + Math.sin(a) * r), rnd);
    }
  }
  return { trees: n };
}

/* ---------------------------------------------------------------- 曲径石阶 */

/** 曲径通幽：自水岸向山上盘一条石径，陡处自动成阶。
 *  步长必须 ≤1.2 格：第一版用 2.1，径身变成一串点状白痕爬满山坡。
 *  宽也一样要紧：三格宽的浅色带横在绿坡上读成塌方，不是路。
 *  真径只铺中缝一格，两侧隔几格点一块界石。 */
export function path(g, x0, z0, len, seed, maxH = 96) {
  const rnd = mulberry32(seed);
  let x = x0, z = z0, ang = rnd() * Math.PI * 2;
  let lastY = -99;
  for (let i = 0; i < len; i++) {
    /* 朝上坡方向偏转，加随机游走 */
    let best = ang, bh = -1e9;
    for (let k = 0; k < 7; k++) {
      const a = ang + (k - 3) * 0.42;
      const h = heightAt(x + Math.cos(a) * 3, z + Math.sin(a) * 3);
      const score = h + (k === 3 ? 3 : 0) - Math.abs(k - 3) * 0.8;
      if (score > bh) { bh = score; best = a; }
    }
    ang = best + (rnd() - 0.5) * 0.5;
    x += Math.cos(ang) * 1.1; z += Math.sin(ang) * 1.1;
    const X = Math.round(x), Z = Math.round(z);
    const t = topAt(X, Z);
    if (t < 1 || t > maxH) break;
    const step = t - lastY >= 2;
    g.set(X, t, Z, step ? P.STONE_LT : P.STONE);
    if (step && lastY > -90) g.set(X, t - 1, Z, P.STONE_DK);
    /* 界石与苔：让路有边，而不是一条亮带 */
    for (const sgn of [-1, 1]) {
      if ((i + (sgn > 0 ? 0 : 2)) % 5 !== 0) continue;
      const px = X + Math.round(Math.cos(ang + Math.PI / 2) * sgn);
      const pz = Z + Math.round(Math.sin(ang + Math.PI / 2) * sgn);
      const pt = topAt(px, pz);
      if (pt < 1) continue;
      g.setIfEmpty(px, pt, pz, hash3(px, 5, pz) > 0.5 ? P.STONE_DK : P.MOSS_DK);
    }
    lastY = t;
  }
}
