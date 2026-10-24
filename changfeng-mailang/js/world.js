// 《长风麦浪》世界生成：地形、溪流、麦田、农舍、风车、树、篱笆……全部程序化，无外部素材。
// 坐标：x 向东，y 向上，z 向南（相机在 +z 一侧望向 -z，太阳在北偏西低空）。
// 机位与布局是一起算的：主画面从 (104,48,212) 望向北偏东，
// 风车落在画幅 65% 宽、太阳落在 15% 宽、农舍落在 16% 宽、小路从画面下缘引向农舍。

import { VoxelWorld, VoxelSet } from './voxel.js';
import { makeNoise } from './noise.js';

export const W = 232, D = 232, H = 92;

// 场景里的关键地标（props.js 与 main.js 共用，避免写死两份）
export const SITE = {
  mill: [152, 96],       // 风车山
  cottage: [96, 126],   // 农舍
  barn: [196, 86],      // 谷仓（远处坡上的小红房子，压住画面右缘）
};

// 溪流中心线：z = f(x)
export function streamZ(x) {
  return 170 - 0.2 * x + 15 * Math.sin(x * 0.031 + 0.6);
}
export function streamDist(x, z) {
  return Math.abs(z - streamZ(x));
}

const C = {
  soil: 0x6a4b30, soilDark: 0x51371f, soilMid: 0x5d4028, path: 0x9c7b52, pathDark: 0x82663f,
  grassA: 0x87994a, grassB: 0x94a855, grassC: 0x76873a, grassDry: 0xa79c55, grassDeep: 0x647634,
  bank: 0x8d8752, bank2: 0x9d945b, pebble: 0x9a9384,
  wheatEar: 0xf2d68a, wheatEar2: 0xe2bd66, wheatEar3: 0xcfa54c,
  wheatStalk: 0xcba34e, wheatStalk2: 0xae8c40,
  stubble: 0xc9ae64, stubble2: 0xae9352,
  stone: 0xc7baa5, stone2: 0xb1a38e, stone3: 0x988a7b, stoneDark: 0x6d6254,
  plaster: 0xeadfc8, plasterShade: 0xd7c9af, plasterWarm: 0xe3d2b2,
  roofA: 0xb5573b, roofB: 0x9b4630, roofC: 0xc76c4c, roofD: 0x7f3a28,
  wood: 0x7b5333, woodLight: 0x936840, woodDark: 0x54371f,
  door: 0x4c3722,
  leafGold: 0xcaa848, leafGold2: 0xa98b36, leafGold3: 0xe0c063,
  leafGreen: 0x718c3d, leafDeep: 0x51682a, leafOlive: 0x8a9c46,
  poppy: 0xc9412f, poppy2: 0xe0593f, butter: 0xf0c84a, daisy: 0xf3eee2,
  straw: 0xdbb95f, straw2: 0xc5a34b, strawDark: 0xa8873c,
  sail: 0xf3e7cd, sailShade: 0xdccfb2, sailRed: 0xc25a3e,
  slate: 0x5b6169, slate2: 0x484e56,
  iron: 0x4a4a52,
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function knoll(x, z, cx, cz, r, h) {
  const d = Math.hypot(x - cx, (z - cz) * 1.05);
  const t = clamp(1 - d / r, 0, 1);
  return h * t * t * (3 - 2 * t);
}

// 泥土小路：从画面下缘一路引向小桥与农舍，是画面的引导线
export const PATH = [[132, 216], [124, 198], [116, 180], [112, 160], [112, 138], [104, 133], [96, 132]];

export function distToPath(x, z) {
  let best = 1e9;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1];
    const vx = bx - ax, vz = bz - az;
    const wx = x - ax, wz = z - az;
    const t = clamp((wx * vx + wz * vz) / (vx * vx + vz * vz), 0, 1);
    const d = Math.hypot(x - (ax + vx * t), z - (az + vz * t));
    if (d < best) best = d;
  }
  return best;
}

export function buildWorld(seed = 20261001) {
  const N = makeNoise(seed);
  const world = new VoxelWorld(W, H, D);
  const water = new VoxelSet();
  const glow = new VoxelSet();
  const sails = new VoxelSet();

  const height = new Int16Array(W * D);
  const parcel = new Float32Array(W * D);
  const hi = (x, z) => z * W + x;

  // ---------- 1. 地形 ----------
  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      let hgt = 12.5
        + N.fbm2(x * 0.0105, z * 0.0105, 4) * 12
        + N.fbm2(x * 0.034 + 40, z * 0.034, 3) * 3.2
        + N.fbm2(x * 0.09 + 9, z * 0.09, 2) * 0.8;

      hgt += smoothstep(104, 10, z) * 12;
      hgt += knoll(x, z, SITE.mill[0], SITE.mill[1], 54, 20);
      hgt += knoll(x, z, SITE.cottage[0], SITE.cottage[1], 25, 5);
      hgt += knoll(x, z, SITE.barn[0], SITE.barn[1], 20, 3.4);

      const sd = streamDist(x, z);
      if (sd < 5.6) hgt = Math.min(hgt, 5 + Math.round(sd * 0.28));
      // 河谷放宽、坡放缓：桥落在谷底，低机位才不会先被近岸挡住
      else if (sd < 22) hgt = Math.min(hgt, 7 + Math.pow((sd - 5.6) / 16.4, 1.7) * 12);

      // 近景（相机与溪流之间）压成缓丘：否则中间这道高地会把小桥和溪水整个挡住，
      // 而且起伏的近景在逆光下只会压出一片死黑。
      const nearT = smoothstep(146, 224, z);
      if (nearT > 0) {
        const nearBase = 18 + N.fbm2(x * 0.017 + 13, z * 0.017 + 5, 2) * 3.2;
        hgt = hgt + (nearBase - hgt) * nearT * 0.9;
      }

      height[hi(x, z)] = Math.round(clamp(hgt, 3, H - 30));
    }
  }

  // ---------- 2. 田块分区 ----------
  for (let z = 0; z < D; z++)
    for (let x = 0; x < W; x++)
      parcel[hi(x, z)] = N.value2(x * 0.0165 + 3.1, z * 0.0165 + 7.7) * 0.72 + N.value2(x * 0.05, z * 0.05) * 0.28;

  // ---------- 3. 铺地形 ----------
  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      const h = height[hi(x, z)];
      const sd = streamDist(x, z);
      const slope = (height[hi(Math.min(W - 1, x + 1), z)] - height[hi(Math.max(0, x - 1), z)])
        + (height[hi(x, Math.min(D - 1, z + 1))] - height[hi(x, Math.max(0, z - 1))]);
      const moist = clamp(1 - (sd - 6) / 30, 0, 1);
      const dry = N.value2(x * 0.06 + 21, z * 0.06 + 5);
      const g = N.value2(x * 0.21, z * 0.21);

      let top;
      if (sd < 13) top = g < 0.5 ? C.bank : C.bank2;
      else if (moist > 0.55 && g < 0.45) top = C.grassDeep;
      else if (moist > 0.3) top = g < 0.4 ? C.grassC : C.grassA;
      else top = dry > 0.62 ? C.grassDry : g < 0.5 ? C.grassB : C.grassA;
      if (slope > 2) top = C.bank2;

      for (let y = 1; y <= h; y++) {
        const depth = h - y;
        let c;
        if (depth === 0) c = top;
        else if (depth < 3) c = depth === 1 ? C.soil : C.soilMid;
        else c = depth < 7 ? C.soilDark : (g < 0.5 ? C.stone3 : C.stoneDark);
        world.set(x, y, z, c);
      }
    }
  }

  // ---------- 4. 水面 ----------
  for (let z = 0; z < D; z++) {
    for (let x = 0; x < W; x++) {
      if (streamDist(x, z) < 4.3 && height[hi(x, z)] <= 6) {
        const r = N.value2(x * 0.5, z * 0.5);
        water.set(x, 6, z, r < 0.4 ? 0x39738c : r < 0.75 ? 0x33748d : 0x2f6b84);
      }
    }
  }

  // ---------- 5. 麦田 ----------
  const flowerPts = [];
  const [mx, mz] = SITE.mill, [cx0, cz0] = SITE.cottage, [bx0, bz0] = SITE.barn;
  for (let z = 2; z < D - 2; z++) {
    for (let x = 2; x < W - 2; x++) {
      const sd = streamDist(x, z);
      if (sd < 7.5) continue;
      const par = parcel[hi(x, z)];
      // 画面中近景（相机前方那条带）保证是金黄麦田，否则近景会是一大片暗绿草地
      const nearField = z > 136 && z < 208 && x > 58 && x < 162;
      if (par < 0.52 && !nearField) continue;
      if (distToPath(x, z) < 3.4) continue;
      if (Math.hypot(x - cx0, z - cz0) < 14 || Math.hypot(x - bx0, z - bz0) < 12 || Math.hypot(x - mx, z - mz) < 10) continue;

      const h = height[hi(x, z)];
      const n = N.value2(x * 0.33 + 4, z * 0.33 + 8);
      const dens = nearField ? 1 : clamp((par - 0.5) * 4.4, 0, 1);
      if (n > dens * 0.92 + (nearField ? 0.3 : 0.1)) continue;

      const n2 = N.value2(x * 0.7 + 12, z * 0.7 + 3);
      const ear = n2 < 0.28 ? C.wheatEar : n2 < 0.6 ? C.wheatEar2 : C.wheatEar3;
      const stalk = n2 < 0.4 ? C.wheatStalk : C.wheatStalk2;

      const stub = N.value2(Math.floor(x / 22) * 3.7, Math.floor(z / 22) * 5.1) > 0.68;
      if (stub) {
        world.set(x, h + 1, z, n2 < 0.5 ? C.stubble : C.stubble2);
        if (n2 > 0.9) world.set(x, h + 2, z, C.stubble2);
        continue;
      }

      const tall = n2 < 0.62;
      world.set(x, h + 1, z, stalk, 90);
      if (tall) {
        world.set(x, h + 2, z, stalk, 150);
        world.set(x, h + 3, z, ear, 235);
        if (n2 < 0.16) world.set(x, h + 4, z, C.wheatEar, 255);
      } else {
        world.set(x, h + 2, z, ear, 235);
      }
      if (n2 > 0.9) flowerPts.push([x, z, n]);
    }
  }

  // ---------- 6. 小路 ----------
  for (let z = 1; z < D - 1; z++) {
    for (let x = 1; x < W - 1; x++) {
      const pd = distToPath(x, z);
      if (pd > 2.6) continue;
      const h = height[hi(x, z)];
      if (h <= 6 && streamDist(x, z) < 6) continue;
      for (let y = h; y > h - 3; y--) world.set(x, y, z, pd < 1.3 ? C.path : C.pathDark);
      for (let y = h + 1; y <= h + 4; y++) {
        const i = world.idx(x, y, z);
        if (y < H) world.solid[i] = 0;
      }
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++) {
          if (Math.hypot(dx, dz) > 1.4) continue;
          const px = x + dx, pz = z + dz;
          if (px < 0 || pz < 0 || px >= W || pz >= D) continue;
          const ph = height[hi(px, pz)];
          for (let y = ph + 1; y <= ph + 4; y++) {
            const i = world.idx(px, y, pz);
            if (y < H) world.solid[i] = 0;
          }
        }
    }
  }

  // ---------- 7. 野花 ----------
  const rnd = (i) => N.value2(i * 7.13 + 0.5, i * 3.77 + 1.9);
  for (let i = 0; i < flowerPts.length; i++) {
    if (rnd(i) > 0.16) continue;
    const [x, z] = flowerPts[i];
    const h = height[hi(x, z)];
    const r = rnd(i * 2.3);
    const col = r < 0.34 ? C.poppy : r < 0.5 ? C.poppy2 : r < 0.74 ? C.butter : C.daisy;
    if (r < 0.5) world.set(x, h + 2, z, C.leafGreen, 120);
    world.set(x, h + (r < 0.5 ? 3 : 1), z, col, r < 0.5 ? 235 : 60);
  }

  return { world, water, glow, sails, N, height, parcel, hi, C, W, D, H };
}