// 《百刻周天》——水运仪象台。全部可调旋钮集中于此。
// 纯模块：不 import 任何 DOM / three 依赖，Node 与浏览器共用。
// 坐标：+Z 南（正面），−Z 北，+X 东，y 向上。1 体素 ≈ 10cm。

export const L = {
  courtHalf: 120,
  base: { half: 42, y0: 0, y1: 6, railTop: 9 },
  stair: { w: 14, zOut: 42, zIn: 30 },
  lower: { half: 31, wallIn: 30, yFloor: 8, arcadeTop: 20, wallTop: 54 },
  doorRows: [13, 23, 31, 39, 47],
  eave1: { y0: 54, y1: 58, out: 38 },
  roof1: { y0: 58, y1: 70, r0: 38, r1: 26 },
  globRoom: { half: 25, wallIn: 24, y0: 70, y1: 86 },
  eave2: { y0: 86, y1: 88, out: 31 },
  roof2: { y0: 88, y1: 94, r0: 31, r1: 19 },
  terrace: { half: 20, y0: 94, y1: 98, railTop: 100 },
  arm: {
    colX: 11, colY0: 98, colY1: 108,
    ringC: [0, 118, 0],
    axis: [0, 0.57, -0.82],
    rMerid: 13, rHoriz: 14.5, rEq: 12, rEcl: 11.5, rLuna: 11, rTour: 10.5,
    tubeR: 1.5, tubeHalf: 6,
  },
  wheel: {
    cx: 10, cy: 27, cz: -8,
    rimIn: 14, rimOut: 16, scoops: 36,
    axleZ: [-19, 3],
    spokes: [20, 80, 140, 200, 260, 320],
    period: 43200,
  },
  column: { x: 0, z: 0, y0: 8, y1: 104 },
  camY: [14, 24, 32, 40, 48],
  camR: 6,
  slider: { zCam: 9, zDoor: 28 },
  lever: { pivot: [28, 47, -19], beamX: [11, 28], y: 47, pawl: [11, 41, -16] },
  tank: { x: [6, 8], y: [48, 55], z: [-26, -19], water: 54 },
  pot: { x: [7, 13], y: [47, 52], z: [-17, -11], water: 50 },
  drip: [10, 47, -14],
  pipeY: 55,
  chain: {
    cx: 7, zc: -22, r: 4,
    bottom: [7, 15, -22], top: [7, 60, -22],
    axleZ: [-28, -16],
    buckets: 24, bucketOffset: 6.5,
  },
  gearP2: { c: [10, 26, -18], r: 4.5, teeth: 32 },
  gearW: { c: [7, 15, -17], r: 6, teeth: 16 },
  basin: { x: [4, 13], y: [8, 12], z: [-27, -22], water: 11 },
  channel: { y: 8, seg1: [-6, 26, -11, -9], seg2: [19, 21, -23, -9], seg3: [13, 19, -23, -21] },
  gearA: { c: [10, 27, 2], r: 5, teeth: 20 },
  gearB: { c: [0, 28, 0], r: 5.5, teeth: 40 },
  globe: { c: [0, 76, 12], r: 8 },
  globeDrive: { armY0: 64, armY1: 66, armZ: 12, r: 5, teeth: 36, tiltR: 4.5 },
  topArm: { from: [0, 104, 0], to: [0, 103, 8] },
  gearG2: { c: [0, 103, 8], r: 3, teeth: 36 },
  gearH: { c: [0, 110.6, 10.7], r: 4, teeth: 36, axisT: -13 },
};

export const GEAR = {
  wheelScoops: 36,
  wheelPeriod: 43200,
  A: 20, B: 40,
  P2: 32, W: 16,
  chainBuckets: 24,
  camCounts: [100, 24, 2, 5, 20],
  camVisible: [44, 24, 2, 5, 20],
  globe: 36, globeF: 36, top: 36, topH: 36,
};

export const WATER = {
  scoopCells: 24,
  bucketCells: 18,
  day: 86400,
};

export const CUTS = [
  { name: 'frontLower', a0: -20, a1: 20, y0: 8, y1: 57, r: 33 },
  { name: 'frontUpper', a0: -20, a1: 20, y0: 70, y1: 86, r: 27 },
  { name: 'east', a0: 95, a1: 140, y0: 8, y1: 54, r: 33 },
];

export const KE = {
  zhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  kePerDay: 100,
  nightStart: 18 * 3600,
  nightEnd: 6 * 3600,
  gengCount: 5,
  dawn: 6 * 3600,
  dusk: 18 * 3600,
};

export const DAY = 86400;

export function shiChen(t) {
  const h = Math.floor((t / 3600) % 24);
  const idx = Math.floor(((h + 1) / 2) % 12);
  const half = h % 2 === 0 ? '正' : '初';
  return { h, idx, half, name: KE.zhi[idx] + half };
}

export function keIndex(t) {
  return Math.floor(((t % DAY) + DAY) % DAY / 864);
}

export function gengOf(t) {
  const d = (t % DAY + DAY) % DAY;
  let rel = d - KE.nightStart;
  if (rel < 0) rel += DAY;
  const nightLen = DAY - KE.nightStart + KE.nightEnd;
  if (rel >= nightLen) return null;
  const len = nightLen / KE.gengCount;
  const n = Math.floor(rel / len);
  return { n: n + 1, frac: (rel % len) / len };
}

export function keText(t) {
  const d = (t % DAY + DAY) % DAY;
  const sc = shiChen(d);
  const kInShi = Math.floor((d % 7200) / 864);
  return `${sc.name}${'零一二三四五六七八'[Math.min(kInShi, 8)]}刻`;
}
