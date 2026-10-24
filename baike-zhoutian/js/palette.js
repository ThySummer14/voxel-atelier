// 调色板与光照烘焙常量。光照全部烘进顶点色（两份：日/夜），
// 浏览器与 Node 软光栅共用同一份常数——离线看到什么就交付什么。

export const PAL = {
  stoneL: [0x8a / 255, 0x85 / 255, 0x78 / 255, 1],
  stoneD: [0x69 / 255, 0x64 / 255, 0x59 / 255, 1],
  verm: [0xa6 / 255, 0x3b / 255, 0x2a / 255, 1],
  vermD: [0x76 / 255, 0x28 / 255, 0x1c / 255, 1],
  wall: [0xe6 / 255, 0xd8 / 255, 0xb4 / 255, 1],
  paper: [0xf0 / 255, 0xe2 / 255, 0xbc / 255, 1],
  paperN: [1.0, 0.82, 0.47, 1],
  lattice: [0x45 / 255, 0x2f / 255, 0x1d / 255, 1],
  tile: [0x2e / 255, 0x7a / 255, 0x64 / 255, 1],
  tileD: [0x1b / 255, 0x4c / 255, 0x3e / 255, 1],
  tileL: [0x41 / 255, 0x9e / 255, 0x7c / 255, 1],
  gold: [0xd8 / 255, 0xaf / 255, 0x37 / 255, 1],
  bronze: [0x93 / 255, 0x74 / 255, 0x4a / 255, 1],
  bronzeG: [0x5f / 255, 0x8f / 255, 0x7a / 255, 1],
  wood: [0x8b / 255, 0x5e / 255, 0x3c / 255, 1],
  woodD: [0x57 / 255, 0x36 / 255, 0x22 / 255, 1],
  water: [0x4a / 255, 0x90 / 255, 0xc2 / 255, 1],
  waterD: [0x28 / 255, 0x5a / 255, 0x7a / 255, 1],
  waterL: [0x8a / 255, 0xca / 255, 0xec / 255, 1],
  sky: [0x1a / 255, 0x21 / 255, 0x30 / 255, 1],
  star: [0xf2 / 255, 0xe6 / 255, 0xc4 / 255, 1],
  starHi: [1.0, 0.96, 0.85, 1],
  iron: [0x55 / 255, 0x52 / 255, 0x4c / 255, 1],
  lamp: [1.0, 0.81, 0.48, 1],
  robe: [0x3a / 255, 0x6e / 255, 0x8c / 255, 1],
  robe2: [0x8a / 255, 0x5a / 255, 0x86 / 255, 1],
};

// 调色板索引（体素单元用小整数，网格阶段映射回 RGB）
export const PI = {
  stoneL: 1, stoneD: 2, verm: 3, vermD: 4, wall: 5, paper: 6, lattice: 7,
  tile: 8, tileD: 9, tileL: 10, gold: 11, bronze: 12, bronzeG: 13,
  wood: 14, woodD: 15, water: 16, waterD: 17, waterL: 18,
  sky: 19, star: 20, starHi: 21, iron: 22, lamp: 23,
  robe: 24, robe2: 25, paperN: 26,
};

export const IDX = [];
for (const k of Object.keys(PI)) IDX[PI[k]] = k;

// 夜间自发光的索引（夜烘 = 原色直出）
export const EMISSIVE = new Set([PI.paperN, PI.lamp, PI.star, PI.starHi, PI.waterL]);

export const BAKE = {
  day: {
    sun: [0.42, 0.62, 0.66],
    sunI: 0.82,
    sunC: [1.0, 0.94, 0.82],
    amb: [0.34, 0.37, 0.40],
    lanterns: [
      [10, 40, 24, 0.72], [10, 52, -8, 0.62], [0, 60, 24, 0.5], [0, 34, 16, 0.55],
      [0, 80, 12, 0.55], [0, 104, 10, 0.4], [24, 30, -8, 0.45], [-8, 20, -22, 0.55],
    ],
    lanternC: [0.98, 0.95, 0.88],
    lanternR: 34,
  },
  night: {
    moon: [-0.18, 0.72, -0.55],
    moonI: 0.55,
    moonC: [0.62, 0.72, 0.95],
    amb: [0.16, 0.19, 0.28],
    lanterns: [
      [10, 52, -8, 3.4], [0, 51, 14, 2.8], [-20, 18, 20, 2.6], [20, 18, 20, 2.6],
      [0, 84, 12, 2.8], [17, 100, 17, 2.3], [-17, 100, 17, 2.3],
      [17, 100, -17, 2.0], [-17, 100, -17, 2.0],
      [36, 55, 36, 2.4], [-36, 55, 36, 2.4], [36, 55, -36, 2.2], [-36, 55, -36, 2.2],
    ],
    lanternC: [1.0, 0.70, 0.36],
    lanternR: 26,
  },
};

function nrm(v) { const m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; }
BAKE.day.sun = nrm(BAKE.day.sun);
BAKE.night.moon = nrm(BAKE.night.moon);

export function faceLight(n, pos, which) {
  const B = which === 'night' ? BAKE.night : BAKE.day;
  if (which === 'night') {
    let r = B.amb[0], g = B.amb[1], b = B.amb[2];
    const md = Math.max(0, n[0] * B.moon[0] + n[1] * B.moon[1] + n[2] * B.moon[2]);
    r += B.moonI * B.moonC[0] * md; g += B.moonI * B.moonC[1] * md; b += B.moonI * B.moonC[2] * md;
    for (const [lx, ly, lz, inten] of B.lanterns) {
      const dx = lx - pos[0], dy = ly - pos[1], dz = lz - pos[2];
      const d2 = dx * dx + dy * dy + dz * dz;
      const d = Math.sqrt(d2) || 1;
      const fall = inten / (1 + d2 / (B.lanternR * B.lanternR));
      const ndl = Math.max(0.22, (n[0] * dx + n[1] * dy + n[2] * dz) / d);
      const w = fall * ndl;
      r += w * B.lanternC[0]; g += w * B.lanternC[1]; b += w * B.lanternC[2];
    }
    return [Math.min(1.15, r), Math.min(1.15, g), Math.min(1.15, b)];
  }
  const sd = Math.max(0, n[0] * B.sun[0] + n[1] * B.sun[1] + n[2] * B.sun[2]);
  let r = B.amb[0] + B.sunI * B.sunC[0] * sd;
  let g = B.amb[1] + B.sunI * B.sunC[1] * sd;
  let b = B.amb[2] + B.sunI * B.sunC[2] * sd;
  for (const [lx, ly, lz, inten] of B.lanterns) {
    const dx = lx - pos[0], dy = ly - pos[1], dz = lz - pos[2];
    const d2 = dx * dx + dy * dy + dz * dz;
    const d = Math.sqrt(d2) || 1;
    const fall = inten / (1 + d2 / (B.lanternR * B.lanternR));
    const ndl = Math.max(0.22, (n[0] * dx + n[1] * dy + n[2] * dz) / d);
    const w = fall * ndl;
    r += w * B.lanternC[0]; g += w * B.lanternC[1]; b += w * B.lanternC[2];
  }
  return [Math.min(1.2, r), Math.min(1.2, g), Math.min(1.2, b)];
}
