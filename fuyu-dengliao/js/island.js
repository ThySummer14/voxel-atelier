/**
 * 浮屿灯寮 — 体素岛手工建模
 * 坐标：Y 向上，岛心大致在原点，崖瀑在 -X 侧
 */

import { Voxels, MAT } from "./voxel.js";

const rnd = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 4294967296);
  };
};

function smoothNoise(x, z, seed = 1) {
  const n = (i, j) => {
    const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = n(x0, z0);
  const b = n(x0 + 1, z0);
  const c = n(x0, z0 + 1);
  const d = n(x0 + 1, z0 + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

function blob(v, cx, cy, cz, rx, ry, rz, mat, jitterFn) {
  for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const dz = (z + 0.5 - cz) / rz;
        const d = dx * dx + dy * dy + dz * dz;
        if (d > 1) continue;
        if (jitterFn && !jitterFn(x, y, z, d)) continue;
        const edge = d > 0.7;
        v.set(x, y, z, edge && mat === MAT.LEAF ? MAT.LEAF_DARK : mat);
      }
    }
  }
}

function tree(v, x, y, z, height, radius, rng) {
  // 树干
  for (let i = 0; i < height; i++) {
    v.set(x, y + i, z, MAT.TRUNK);
    if (i < 2) {
      v.set(x + 1, y + i, z, MAT.TRUNK);
      v.set(x, y + i, z + 1, MAT.TRUNK);
      v.set(x + 1, y + i, z + 1, MAT.TRUNK);
    }
  }
  // 根部抓地
  v.set(x - 1, y, z, MAT.TRUNK);
  v.set(x + 2, y, z, MAT.TRUNK);
  v.set(x, y, z - 1, MAT.TRUNK);
  v.set(x, y, z + 2, MAT.TRUNK);

  const top = y + height - 1;
  // 树冠：多层椭球 + 色斑
  const layers = [
    { dy: 0, r: radius, sy: radius * 0.55 },
    { dy: radius * 0.55, r: radius * 0.85, sy: radius * 0.45 },
    { dy: radius * 0.95, r: radius * 0.55, sy: radius * 0.35 },
  ];
  for (const L of layers) {
    blob(
      v,
      x + 0.5,
      top + L.dy,
      z + 0.5,
      L.r,
      L.sy,
      L.r * 0.95,
      MAT.LEAF,
      (px, py, pz, d) => {
        const n = smoothNoise(px * 0.45, pz * 0.45 + py * 0.2, 7);
        if (n < 0.18 && d > 0.35) return false;
        if (n > 0.72) v.set(px, py, pz, MAT.LEAF_LIGHT);
        else if (n < 0.35) v.set(px, py, pz, MAT.LEAF_DARK);
        return true;
      }
    );
  }
  // 几枝伸出
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rng() * 0.4;
    const bx = x + Math.round(Math.cos(a) * (radius * 0.7));
    const bz = z + Math.round(Math.sin(a) * (radius * 0.7));
    const by = top + Math.floor(rng() * 2);
    for (let t = 0; t < 3; t++) {
      v.set(
        x + Math.round(((bx - x) * t) / 2),
        by + Math.floor(t * 0.4),
        z + Math.round(((bz - z) * t) / 2),
        MAT.LEAF
      );
    }
  }
}

function lanternPost(v, x, y, z) {
  // 石灯柱
  for (let i = 0; i < 4; i++) v.set(x, y + i, z, MAT.STONE_LIGHT);
  v.set(x - 1, y + 4, z, MAT.STONE);
  v.set(x + 1, y + 4, z, MAT.STONE);
  v.set(x, y + 4, z - 1, MAT.STONE);
  v.set(x, y + 4, z + 1, MAT.STONE);
  v.set(x, y + 5, z, MAT.LANTERN_CORE);
  v.set(x, y + 6, z, MAT.LANTERN);
  // 檐
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++) v.set(x + dx, y + 7, z + dz, MAT.STONE_DARK);
  v.set(x, y + 8, z, MAT.STONE);
}

function teahouse(v) {
  // 台基
  v.fillBox(1, 6, -4, 11, 7, 4, MAT.STONE);
  v.fillBox(2, 7, -3, 10, 7, 3, MAT.STONE_LIGHT);
  for (let i = 0; i < 3; i++) {
    v.fillBox(5, 5 - i, -5 - i, 7, 5 - i, -5 - i, MAT.STONE_LIGHT);
  }

  // 地板 + 前廊
  v.fillBox(2, 8, -5, 10, 8, 3, MAT.PLANK);

  // 木柱
  for (const px of [2, 6, 10]) {
    for (const pz of [-5, -3, 3]) {
      for (let y = 9; y <= 13; y++) v.set(px, y, pz, MAT.WOOD_DARK);
      v.set(px, 8, pz, MAT.STONE);
    }
  }

  // 阑额
  for (let x = 2; x <= 10; x++) {
    for (const z of [-5, -3, 3]) {
      v.set(x, 13, z, MAT.WOOD);
      v.set(x, 14, z, MAT.WOOD_DARK);
    }
  }
  for (let z = -5; z <= 3; z++) {
    v.set(2, 13, z, MAT.WOOD);
    v.set(10, 13, z, MAT.WOOD);
  }

  // 南墙（观景大窗）
  for (let x = 3; x <= 9; x++) {
    for (let y = 9; y <= 12; y++) {
      if (y >= 10 && y <= 11 && x !== 6) v.set(x, y, -3, MAT.WINDOW);
      else v.set(x, y, -3, x === 6 && y < 12 ? MAT.WOOD_DARK : MAT.WALL);
    }
  }
  // 北墙
  for (let x = 3; x <= 9; x++) {
    for (let y = 9; y <= 12; y++) {
      if (y >= 10 && y <= 11 && (x === 4 || x === 5 || x === 8)) v.set(x, y, 3, MAT.WINDOW);
      else v.set(x, y, 3, MAT.WALL);
    }
  }
  // 东墙 / 西墙
  for (let z = -2; z <= 2; z++) {
    for (let y = 9; y <= 12; y++) {
      if (y >= 10 && y <= 11) {
        v.set(10, y, z, MAT.WINDOW);
        v.set(2, y, z, MAT.WINDOW);
      } else {
        v.set(10, y, z, MAT.WALL_SHADE);
        v.set(2, y, z, MAT.WALL_SHADE);
      }
    }
  }

  // 室内灯火
  v.set(6, 10, 1, MAT.LANTERN_CORE);
  v.set(6, 11, 1, MAT.LANTERN);
  v.set(4, 10, 0, MAT.LANTERN);
  v.set(8, 10, 0, MAT.LANTERN);

  // 廊下灯笼
  for (const px of [3, 9]) {
    v.set(px, 12, -5, MAT.WOOD);
    v.set(px, 11, -5, MAT.LANTERN);
    v.set(px, 10, -5, MAT.LANTERN_CORE);
    v.set(px, 9, -5, MAT.LANTERN);
  }

  // 歇山顶：宽出檐 + 沿长边起脊
  v.fillBox(-1, 15, -7, 13, 15, 6, MAT.ROOF_DARK);
  v.fillBox(0, 16, -6, 12, 16, 5, MAT.ROOF);
  for (let i = 0; i < 5; i++) {
    const y = 17 + i;
    const z0 = -5 + i;
    const z1 = 4 - i;
    const x0 = Math.max(0, i - 1);
    const x1 = Math.min(12, 13 - i);
    if (z0 > z1) break;
    v.fillBox(x0, y, z0, x1, y, z1, i % 2 ? MAT.ROOF_DARK : MAT.ROOF);
  }
  v.fillBox(3, 21, -1, 9, 21, 0, MAT.ROOF_DARK);
  v.fillBox(4, 22, -1, 8, 22, 0, MAT.COPPER);
  v.set(6, 23, 0, MAT.COPPER);

  // 翘角
  for (const [cx, cz, sx, sz] of [
    [-1, -7, -1, -1],
    [13, -7, 1, -1],
    [-1, 6, -1, 1],
    [13, 6, 1, 1],
  ]) {
    v.set(cx + sx, 16, cz + sz, MAT.ROOF);
    v.set(cx + sx * 2, 17, cz + sz * 2, MAT.ROOF_DARK);
    v.set(cx, 16, cz, MAT.ROOF);
  }
}

function bridge(v) {
  // 木桥跨溪，z 从 -8 到 -12，x=6 附近，溪在 z=-10
  for (let z = -12; z <= -8; z++) {
    for (let x = 5; x <= 8; x++) {
      v.set(x, 7, z, MAT.PLANK);
    }
    // 栏杆
    v.set(5, 8, z, MAT.WOOD_DARK);
    v.set(8, 8, z, MAT.WOOD_DARK);
    if (z === -12 || z === -8 || z === -10) {
      v.set(5, 9, z, MAT.WOOD);
      v.set(8, 9, z, MAT.WOOD);
    }
  }
  // 桥墩
  v.fillBox(5, 5, -12, 6, 6, -12, MAT.STONE);
  v.fillBox(7, 5, -8, 8, 6, -8, MAT.STONE);
}

export function buildIsland() {
  const v = new Voxels();
  const rng = rnd(20260323);

  // —— 岛体高度场 ——
  // 有效半径约 18，茶寮台地在 (6, ·, 0) 附近 y≈5
  const R = 18;
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const dist = Math.sqrt(x * x + z * z * 1.1);
      // 不规则边缘
      const nEdge = smoothNoise(x * 0.18, z * 0.18, 3) * 4.5;
      const edge = R - 1.5 - nEdge;
      if (dist > edge) continue;

      // 基础高度：中心山 + 茶寮台地 + 崖口
      let h = 8.5;
      h += Math.max(0, 7.5 - dist * 0.55); // 中央隆起
      h += smoothNoise(x * 0.14, z * 0.14, 11) * 3.2;
      h -= Math.max(0, dist - 10) * 0.25;

      // 茶寮台地平整
      const plat = Math.max(
        0,
        1 - Math.hypot((x - 6) / 8, z / 6.5)
      );
      if (plat > 0.15) {
        const target = 5.2;
        h = h * (1 - plat) + target * plat;
      }

      // 瀑布崖口：-X 侧深切
      const cliff = Math.max(0, 1 - Math.hypot((x + 12) / 5.5, z / 4.5));
      if (cliff > 0.1) {
        h -= cliff * 5.5;
      }

      // 溪谷
      const stream = Math.max(0, 1 - Math.abs(z + 10) / 2.2) * Math.max(0, 1 - Math.abs(x + 2) / 12);
      if (stream > 0.25 && x < 4) {
        h -= 1.4 * stream;
      }

      h = Math.round(h);
      // 表层草
      const topMat =
        h <= 4 && plat < 0.1
          ? MAT.STONE_LIGHT
          : smoothNoise(x * 0.4, z * 0.4, 5) > 0.62
            ? MAT.GRASS_DARK
            : MAT.GRASS;

      // 倒悬岩基
      const depth = Math.max(3, Math.round((1 - dist / (edge + 0.1)) * 16 + 4));
      for (let y = h - 1; y > h - depth; y--) {
        const t = (h - 1 - y) / depth;
        let m = MAT.DIRT;
        if (t > 0.55) m = MAT.STONE_DARK;
        else if (t > 0.3) m = MAT.DIRT_DARK;
        if (y === h - 1 && dist < edge - 1.5) m = MAT.DIRT;
        // 边缘露岩
        if (dist > edge - 2.5 && y < h - 1) {
          m = t > 0.4 ? MAT.STONE_DARK : MAT.STONE;
        }
        // 随机岩脉
        if (smoothNoise(x * 0.3 + y * 0.2, z * 0.3, 9) > 0.78) m = MAT.STONE;
        v.set(x, y, z, m);
      }
      // 倒悬根须收尖
      const tipY = h - depth;
      const tipR = 1.8 * (1 - dist / edge);
      if (tipR > 0.5) {
        for (let t = 0; t < Math.floor(tipR * 3); t++) {
          const y = tipY - t;
          const rr = Math.max(0.3, tipR * (1 - t / (tipR * 3)));
          v.set(x, y, z, t < 2 ? MAT.DIRT_DARK : MAT.STONE_DARK);
          if (rr > 1) {
            v.set(x + 1, y, z, MAT.STONE_DARK);
            v.set(x, y, z + 1, MAT.STONE_DARK);
          }
        }
      }

      // 表面
      v.set(x, h, z, topMat);
      // 苔痕
      if (topMat !== MAT.STONE_LIGHT && smoothNoise(x * 0.55, z * 0.55, 21) > 0.7) {
        v.set(x, h, z, MAT.MOSS);
      }
    }
  }

  // —— 水系 ——
  // 溪：从台地侧流向崖口
  for (let x = -12; x <= 3; x++) {
    const zc = -10 + Math.round(Math.sin(x * 0.35) * 1.2);
    for (let dz = -1; dz <= 1; dz++) {
      const z = zc + dz;
      // 找地面
      for (let y = 2; y <= 10; y++) {
        if (v.has(x, y, z) && !v.has(x, y + 1, z)) {
          // 河床
          v.set(x, y, z, MAT.SAND);
          v.set(x, y + 1, z, MAT.WATER);
          if (dz === 0) v.set(x, y + 2, z, MAT.WATER);
          break;
        }
      }
    }
  }
  // 潭（茶寮前）
  for (let x = 0; x <= 3; x++) {
    for (let z = -12; z <= -8; z++) {
      for (let y = 3; y <= 8; y++) {
        if (v.has(x, y, z) && !v.has(x, y + 1, z)) {
          v.set(x, y, z, MAT.SAND);
          v.set(x, y + 1, z, MAT.WATER);
          break;
        }
      }
    }
  }

  // 瀑布
  for (let y = -4; y <= 6; y++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > 2) continue;
        v.set(-13 + dx, y, dz, MAT.WATER);
        if ((y + dx + dz) % 3 === 0) v.set(-13 + dx, y, dz, MAT.FOAM);
      }
    }
  }
  // 瀑顶嘴
  for (let x = -12; x <= -10; x++) {
    for (let z = -1; z <= 1; z++) {
      v.set(x, 7, z, MAT.FOAM);
      v.set(x, 8, z, MAT.WATER);
    }
  }
  // 溅落雾
  for (let x = -15; x <= -11; x++) {
    for (let z = -2; z <= 2; z++) {
      if (rng() > 0.4) v.set(x, -5, z, MAT.FOAM);
      if (rng() > 0.7) v.set(x, -4, z, MAT.FOAM);
    }
  }

  // —— 建筑 ——
  teahouse(v);
  bridge(v);

  // 石阶小径：桥 → 茶寮台阶
  const path = [
    [5, -7],
    [5, -6],
    [6, -5],
    [6, -4],
    [5, -4],
  ];
  for (const [px, pz] of path) {
    for (let y = 4; y <= 10; y++) {
      if (v.has(px, y, pz) && !v.has(px, y + 1, pz)) {
        v.set(px, y, pz, MAT.PATH);
        break;
      }
    }
  }

  // 灯径
  lanternPost(v, 4, 8, -6);
  lanternPost(v, 8, 8, -6);
  lanternPost(v, 2, 8, -8);
  lanternPost(v, 10, 8, -8);

  // —— 树木 ——
  tree(v, -2, 8, 5, 7, 3.6, rng); // 后侧大枫
  tree(v, 13, 7, -3, 6, 3.2, rng); // 东侧
  tree(v, -4, 7, -8, 5, 2.8, rng); // 溪畔小树
  tree(v, 12, 6, 6, 5, 2.6, rng);

  // 灌木 / 石
  blob(v, -6, 9, 2, 2.2, 1.2, 2.0, MAT.GRASS_DARK);
  blob(v, 14, 7, 2, 1.8, 1.0, 1.8, MAT.LEAF_DARK);
  blob(v, -8, 8, -4, 1.5, 1.2, 1.5, MAT.STONE);
  v.fillBox(-7, 9, -5, -6, 10, -4, MAT.STONE);
  v.set(-8, 10, -5, MAT.STONE_LIGHT);

  // 崖边草
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2;
    const r = 12 + rng() * 5;
    const x = Math.round(Math.cos(a) * r);
    const z = Math.round(Math.sin(a) * r * 0.9);
    for (let y = 2; y <= 12; y++) {
      if (v.has(x, y, z) && !v.has(x, y + 1, z)) {
        if (rng() > 0.5) v.set(x, y + 1, z, rng() > 0.5 ? MAT.GRASS_DARK : MAT.MOSS);
        break;
      }
    }
  }

  // —— 云海 ——
  const clouds = new Voxels();
  for (let i = 0; i < 28; i++) {
    const cx = (rng() - 0.5) * 70;
    const cz = (rng() - 0.5) * 70;
    const cy = -10 - rng() * 14;
    if (Math.hypot(cx, cz) < 14) continue;
    const rx = 3 + rng() * 6;
    const rz = 2 + rng() * 4;
    const ry = 1 + rng() * 1.5;
    blob(clouds, cx, cy, cz, rx, ry, rz, MAT.CLOUD, (px, py, pz, d) => d < 0.85 + rng() * 0.2);
  }
  // 岛下贴身云
  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2;
    const r = 6 + rng() * 8;
    blob(
      clouds,
      Math.cos(a) * r,
      -8 - rng() * 6,
      Math.sin(a) * r,
      3 + rng() * 3,
      1.2,
      3 + rng() * 2,
      MAT.CLOUD
    );
  }

  return { island: v, clouds };
}

export function collectLanternPositions(voxels) {
  const lights = [];
  for (const [k, mat] of voxels.entries()) {
    if (mat !== MAT.LANTERN_CORE && mat !== MAT.WINDOW && mat !== MAT.LANTERN) continue;
    const [x, y, z] = k.split(",").map(Number);
    if (mat === MAT.LANTERN_CORE) {
      lights.push({ x, y, z, intensity: mat === MAT.LANTERN_CORE ? 1.6 : 0.8, kind: "core" });
    }
  }
  return lights;
}
