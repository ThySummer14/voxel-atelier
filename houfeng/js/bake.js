// bake.js — 烘焙光照 + 体素 AO → 逐面颜色（0-255 RGB）
// 离线光栅与浏览器共用：同一组 BAKE 常数，离线看到什么就交付什么。

import { BAKE } from './spec.js';

const EMISSIVE = new Set([0xffb347, 0xff9d3c, 0xff9a3c, 0xffd27a, 0xcc5a1e]); // 龙目/蟾口/火
const norm = (v) => { const l = Math.hypot(v.x, v.y, v.z) || 1; return [v.x / l, v.y / l, v.z / l]; };
const keyDir = norm(BAKE.keyDir), fillDir = norm(BAKE.fillDir);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const FACES_N = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] };

export function hexRgb(hex) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

// 确定性颜色微扰（铸造斑驳感）
function vary(x, y, z) {
  const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return 0.94 + (h - Math.floor(h)) * 0.12;
}

// 六面法线
const FACES = [
  { n: FACES_N.px, key: 'px' },
  { n: FACES_N.nx, key: 'nx' },
  { n: FACES_N.py, key: 'py' },
  { n: FACES_N.ny, key: 'ny' },
  { n: FACES_N.pz, key: 'pz' },
  { n: FACES_N.nz, key: 'nz' },
];

// 每个面在相邻层中的 8 个 AO 采样位（4 边 + 4 角）
const AO_OFF = {
  px: [[1, -1, -1], [1, -1, 0], [1, -1, 1], [1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 1, -1], [1, 0, -1]],
  nx: [[-1, -1, 1], [-1, -1, 0], [-1, -1, -1], [-1, 0, -1], [-1, 1, -1], [-1, 1, 0], [-1, 1, 1], [-1, 0, 1]],
  py: [[-1, 1, -1], [0, 1, -1], [1, 1, -1], [1, 1, 0], [1, 1, 1], [0, 1, 1], [-1, 1, 1], [-1, 1, 0]],
  ny: [[-1, -1, 1], [0, -1, 1], [1, -1, 1], [1, -1, 0], [1, -1, -1], [0, -1, -1], [-1, -1, -1], [-1, -1, 0]],
  pz: [[-1, -1, 1], [0, -1, 1], [1, -1, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], [-1, 1, 1], [-1, 0, 1]],
  nz: [[1, -1, -1], [0, -1, -1], [-1, -1, -1], [-1, 0, -1], [-1, 1, -1], [0, 1, -1], [1, 1, -1], [1, 0, -1]],
};

// voxels: [{x,y,z,c}] → Map<"x,y,z", {px:[r,g,b], ...}>（仅暴露面）
// opts.firePos: [{x,y,z}×8] 火盆位置，向面色注入暖光（窗口内的机构被火照亮）
export function bakeAll(voxels, opts = {}) {
  const occ = new Set(voxels.map((v) => `${v.x},${v.y},${v.z}`));
  const fires = opts.firePos || [];
  const out = new Map();
  for (const v of voxels) {
    const base = hexRgb(v.c);
    if (EMISSIVE.has(v.c)) {
      const e = {};
      for (const f of FACES) e[f.key] = base;
      out.set(`${v.x},${v.y},${v.z}`, e);
      continue;
    }
    const vFactor = vary(v.x, v.y, v.z);
    const rec = {};
    for (const f of FACES) {
      const nb = `${v.x + f.n[0]},${v.y + f.n[1]},${v.z + f.n[2]}`;
      if (occ.has(nb)) continue; // 面被挡住
      // AO：相邻层 8 格，边邻权重 1，角邻权重 0.45
      let occN = 0;
      const [ax, ay, az] = [Math.abs(f.n[0]), Math.abs(f.n[1]), Math.abs(f.n[2])];
      for (const [ox, oy, oz] of AO_OFF[f.key]) {
        const isEdge = (ox !== 0) + (oy !== 0) + (oz !== 0) === 2;
        if (occ.has(`${v.x + ox},${v.y + oy},${v.z + oz}`)) occN += isEdge ? 1 : 0.45;
      }
      const ao = 1 - Math.min(occN / 3.2, 1) * BAKE.aoStrength;
      const key = Math.max(0, dot(f.n, keyDir));
      const fill = Math.max(0, dot(f.n, fillDir));
      const hemi = f.n[1] > 0 ? BAKE.hemiSky : (f.n[1] < 0 ? BAKE.hemiGround : null);
      let r, g, b;
      if (hemi) {
        r = hemi[0]; g = hemi[1]; b = hemi[2];
      } else {
        r = (BAKE.hemiSky[0] + BAKE.hemiGround[0]) / 2;
        g = (BAKE.hemiSky[1] + BAKE.hemiGround[1]) / 2;
        b = (BAKE.hemiSky[2] + BAKE.hemiGround[2]) / 2;
      }
      r += key * BAKE.keyColor[0] + fill * BAKE.fillColor[0];
      g += key * BAKE.keyColor[1] + fill * BAKE.fillColor[1];
      b += key * BAKE.keyColor[2] + fill * BAKE.fillColor[2];
      if (fires.length) { // 火盆暖光（距离衰减，限幅）
        let glow = 0;
        for (const f of fires) {
          const dx = v.x - f.x, dy = v.y + 0.5 - f.y, dz = v.z - f.z;
          glow += 950 / (dx * dx + dy * dy + dz * dz + 42);
        }
        glow = Math.min(glow, BAKE.fireGlow);
        r += glow; g += glow * 0.55; b += glow * 0.22;
      }
      rec[f.key] = [
        Math.min(255, Math.round(base[0] * vFactor * ao * r)),
        Math.min(255, Math.round(base[1] * vFactor * ao * g)),
        Math.min(255, Math.round(base[2] * vFactor * ao * b)),
      ];
    }
    out.set(`${v.x},${v.y},${v.z}`, rec);
  }
  return out;
}
