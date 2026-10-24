/**
 * 巨鲲 —— 北冥之鱼，脊负仙山
 * 剪影：钝首 → 弓背 → 收尾柄 → 圆润叉尾
 */
import { MAT, hash2 } from "./voxel.js";

const TAIL_X = -52;
const NOSE_X = 58;

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function tOfX(x) {
  return (x - TAIL_X) / (NOSE_X - TAIL_X);
}

function bodyRy(t) {
  if (t < 0.1) return lerp(2.2, 4.2, t / 0.1);
  if (t < 0.28) return lerp(4.2, 8.2, (t - 0.1) / 0.18);
  if (t < 0.5) return lerp(8.2, 10.6, (t - 0.28) / 0.22);
  if (t < 0.7) return lerp(10.6, 10.2, (t - 0.5) / 0.2);
  if (t < 0.88) return lerp(10.2, 8.4, (t - 0.7) / 0.18);
  return lerp(8.4, 3.8, (t - 0.88) / 0.12);
}

function bodyRz(t) {
  return bodyRy(t) * 0.8;
}

function bodyCenterY(t) {
  return 1.5 * Math.sin((t - 0.08) * Math.PI * 0.95) - 1.2 * t;
}

function skinAt(x, y, z, ny) {
  const n = hash2(x * 1.9, z * 1.5 + y * 0.4);
  if (ny > 0.55) return n > 0.9 ? MAT.WHALE_RIDGE : MAT.WHALE_BACK;
  if (ny > 0.12) return n > 0.88 ? MAT.WHALE_SCAR : MAT.WHALE_MID;
  if (ny > -0.28) return n > 0.93 ? MAT.WHALE_SCAR : MAT.WHALE_SIDE;
  if (ny > -0.62) return MAT.WHALE_BELLY;
  const lateral = Math.abs(ny + 0.2) < 0.07;
  if (lateral && x % 3 === 0) return MAT.WHALE_SCAR;
  return ny < -0.82 ? MAT.WHALE_BELLY_LITE : MAT.WHALE_BELLY;
}

function buildBody(v) {
  for (let x = TAIL_X + 10; x <= NOSE_X; x++) {
    const t = tOfX(x);
    const ry = bodyRy(t);
    const rz = bodyRz(t);
    const cy = bodyCenterY(t);
    const noseK = t > 0.88 ? lerp(1, 0.7, (t - 0.88) / 0.12) : 1;
    for (let y = Math.floor(cy - ry * noseK) - 1; y <= Math.ceil(cy + ry * noseK) + 1; y++) {
      for (let z = Math.floor(-rz * noseK) - 1; z <= Math.ceil(rz * noseK) + 1; z++) {
        const ny = (y + 0.5 - cy) / (ry * noseK + 1e-4);
        const nz = (z + 0.5) / (rz * noseK + 1e-4);
        const d = Math.pow(Math.abs(ny), ny > 0 ? 2.55 : 2.1) + Math.pow(Math.abs(nz), 2.35);
        if (d > 1) continue;
        v.set(x, y, z, skinAt(x, y, z, ny));
      }
    }
  }
  // 口裂
  for (let x = 42; x <= NOSE_X - 2; x++) {
    const t = tOfX(x);
    const ry = bodyRy(t);
    const rz = bodyRz(t);
    const cy = bodyCenterY(t);
    const ym = Math.round(cy - ry * 0.18);
    for (const side of [-1, 1]) {
      const zb = Math.round(side * rz * 0.45);
      for (let zi = zb; side > 0 ? zi <= zb + 2 : zi >= zb - 2; zi += side) {
        if (v.has(x, ym, zi)) v.set(x, ym, zi, MAT.MOUTH);
      }
    }
  }
  // 鳃裂
  for (let i = 0; i < 3; i++) {
    const x = 36 - i * 2;
    const t = tOfX(x);
    const ry = bodyRy(t);
    const rz = bodyRz(t);
    const cy = bodyCenterY(t);
    for (const side of [-1, 1]) {
      for (let y = Math.round(cy - ry * 0.25); y <= Math.round(cy + ry * 0.4); y++) {
        const z = Math.round(side * rz * 0.88);
        if (v.has(x, y, z)) v.set(x, y, z, MAT.MOUTH);
      }
    }
  }
}

function buildEye(v) {
  const ex = 48;
  const t = tOfX(ex);
  const ry = bodyRy(t);
  const rz = bodyRz(t);
  const cy = bodyCenterY(t);
  const ey = Math.round(cy + ry * 0.25);
  for (const side of [-1, 1]) {
    const ez = Math.round(side * rz * 0.72);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        v.set(ex + dx, ey + dy, ez, MAT.EYE);
        v.set(ex + dx, ey + dy, ez + side, MAT.EYE);
      }
    v.set(ex, ey, ez + side, MAT.EYE_CORE);
    v.set(ex, ey, ez + side * 2, MAT.EYE_CORE);
    v.set(ex + 2, ey + 1, ez + side, MAT.GLOW_SPOT);
  }
}

/** 圆润叉尾 */
function buildCaudal(v) {
  const y0 = Math.round(bodyCenterY(0.05));
  // 尾柄
  for (let x = TAIL_X + 6; x <= TAIL_X + 18; x++) {
    const t = tOfX(x);
    const cy = bodyCenterY(t);
    const ry = Math.max(2.4, bodyRy(t));
    const rz = Math.max(2.0, bodyRz(t));
    for (let y = Math.round(cy - ry); y <= Math.round(cy + ry); y++)
      for (let z = Math.round(-rz); z <= Math.round(rz); z++) {
        const ny = (y + 0.5 - cy) / (ry + 1e-4);
        const nz = (z + 0.5) / (rz + 1e-4);
        if (Math.pow(Math.abs(ny), 2.2) + Math.pow(Math.abs(nz), 2.2) <= 1)
          v.set(x, y, z, MAT.WHALE_FIN);
      }
  }

  // 上下叶：胖水滴，圆尖
  for (const up of [1, -1]) {
    for (let y = y0 + up * 4; up > 0 ? y <= y0 + 28 : y >= y0 - 28; y += up) {
      const ad = Math.abs(y - y0);
      const k = (ad - 4) / 24;
      // 中心向后掠
      const xCenter = TAIL_X + 8 - k * 24;
      // 水滴：根厚 → 中段最宽 → 尖端圆收
      const halfW = k < 0.45 ? lerp(9, 13, k / 0.45) : lerp(13, 1.5, (k - 0.45) / 0.55);
      for (let x = Math.round(xCenter - halfW); x <= Math.round(xCenter + halfW); x++) {
        for (let z = -2; z <= 2; z++) {
          const mat = ad > 16 ? MAT.WHALE_FIN : MAT.WHALE_MID;
          v.set(x, y, z, mat);
        }
      }
    }
  }
  // 尾杆连通
  for (let x = TAIL_X; x <= TAIL_X + 16; x++)
    for (let y = y0 - 5; y <= y0 + 5; y++)
      for (let z = -2; z <= 2; z++) v.set(x, y, z, MAT.WHALE_MID);

  // 叶面色阶
  for (let x = TAIL_X - 20; x <= TAIL_X + 16; x++)
    for (let y = y0 - 28; y <= y0 + 28; y++)
      for (let z = -2; z <= 2; z++)
        if (v.get(x, y, z) === MAT.WHALE_FIN && hash2(x, y) > 0.8)
          v.set(x, y, z, MAT.WHALE_RIDGE);
}

function buildDorsal(v) {
  for (let i = 0; i < 16; i++) {
    const u = i / 15;
    const xBase = Math.round(lerp(-28, -8, u));
    const h = Math.round(3 + Math.sin(u * Math.PI) * 7.5);
    const t = tOfX(xBase);
    const yBase = Math.round(bodyCenterY(t) + bodyRy(t) - 1);
    for (let y = 0; y <= h; y++) {
      const xs = Math.round(xBase - y * 0.5);
      const w = Math.max(1, Math.round(3 * (1 - (y / (h + 1)) * 0.65)));
      const xw = Math.max(1, Math.round(2.4 * (1 - (y / (h + 1)) * 0.5)));
      for (let dx = -xw; dx <= xw; dx++)
        for (let z = -w; z <= w; z++) v.set(xs + dx, yBase + y, z, MAT.WHALE_RIDGE);
    }
  }
}

function buildPectoral(v) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const x = 28 - i;
      const t = tOfX(x);
      const y = Math.round(bodyCenterY(t) - bodyRy(t) * 0.4 - i * 0.3);
      const zBase = Math.round(side * (bodyRz(t) * 0.85 + 0.5));
      const reach = 2 + Math.floor(i / 4);
      for (let dy = -1; dy <= 0; dy++)
        for (let zi = 0; zi <= reach; zi++)
          v.set(x, y + dy, zBase + side * zi, MAT.WHALE_FIN);
    }
  }
}

function buildBiolum(v) {
  for (let i = 0; i < 42; i++) {
    const x = Math.round(lerp(-40, 50, hash2(i, 3.1)));
    const t = tOfX(x);
    const ry = bodyRy(t);
    const rz = bodyRz(t);
    const cy = bodyCenterY(t);
    const side = hash2(i, 7.7) > 0.5 ? 1 : -1;
    const y = Math.round(cy + lerp(-ry * 0.5, ry * 0.15, hash2(i, 11.2)));
    const ny = (y + 0.5 - cy) / ry;
    const rest = 1 - Math.pow(Math.abs(ny), 2.2);
    if (rest <= 0.1) continue;
    const z = Math.round(side * rz * Math.pow(rest, 1 / 2.35) * 0.95);
    if (v.has(x, y, z)) v.set(x, y, z, MAT.GLOW_SPOT);
  }
}

export function buildKun(v) {
  buildBody(v);
  buildCaudal(v);
  buildDorsal(v);
  buildPectoral(v);
  buildEye(v);
  buildBiolum(v);
  return {
    deckY: (x) => {
      const t = tOfX(x);
      return bodyCenterY(t) + bodyRy(t);
    },
    noseX: NOSE_X,
    tailX: TAIL_X,
  };
}

export function collectGlowSpots(v) {
  const pts = [];
  for (const [k, mat] of v.entries()) {
    if (mat === MAT.GLOW_SPOT || mat === MAT.EYE || mat === MAT.EYE_CORE)
      pts.push(k.split(",").map(Number));
  }
  return pts;
}
