/**
 * 背负仙山 · 重檐楼阁 · 松 · 星瀑 · 灯火
 * 规模刻意压在鲲体之下，保证「巨鲲负山」剪影
 */
import { MAT, hash2 } from "./voxel.js";

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function mountainHeight(x, z) {
  const main = 18 * Math.exp(-(((x - 2) ** 2) / 160 + (z * z) / 110));
  const side = 9 * Math.exp(-(((x + 10) ** 2) / 70 + ((z - 6) ** 2) / 55));
  const fore = 6 * Math.exp(-(((x - 14) ** 2) / 60 + ((z + 5) ** 2) / 45));
  const n = 1.4 * Math.sin(x * 0.4) * Math.cos(z * 0.35) + 0.9 * hash2(x, z) - 0.5;
  return Math.max(0, main + side + fore + n);
}

function rockMat(depthNorm, y, x, z) {
  const n = hash2(x * 1.3, z * 1.1 + y);
  if (depthNorm > 0.86) return n > 0.55 ? MAT.GRASS_LITE : MAT.GRASS;
  if (depthNorm > 0.76) return n > 0.45 ? MAT.MOSS : MAT.GRASS;
  if (depthNorm > 0.3) return n > 0.62 ? MAT.ROCK_LITE : MAT.ROCK;
  return n > 0.5 ? MAT.ROCK : MAT.ROCK_DARK;
}

function surfaceY(hmap, deckYAt, x, z) {
  const h = hmap.get(`${x},${z}`);
  if (h === undefined) return null;
  return Math.floor(deckYAt(x) - 1 + h);
}

/** 飞檐：底大上收，四角起翘 */
function eaveRoof(v, cx, y, cz, halfW, halfD, mat, matDark) {
  const w1 = halfW + 2;
  const d1 = halfD + 2;
  for (let x = -w1; x <= w1; x++) {
    for (let z = -d1; z <= d1; z++) {
      const isCorner = Math.abs(x) === w1 && Math.abs(z) === d1;
      const isEdge = Math.abs(x) === w1 || Math.abs(z) === d1;
      let yy = y;
      if (isCorner) yy = y + 2;
      v.set(cx + x, yy, cz + z, isEdge ? matDark : mat);
      if (isEdge) v.set(cx + x, yy - 1, cz + z, matDark);
      // 起翘
      if (isCorner) {
        v.set(cx + x, y, cz + z, matDark);
        v.set(cx + x, y + 1, cz + z, matDark);
        const sx = Math.sign(x) || 1;
        const sz = Math.sign(z) || 1;
        v.set(cx + x + sx, y + 3, cz + z, MAT.GOLD);
        v.set(cx + x, y + 3, cz + z + sz, MAT.GOLD);
      }
    }
  }
  // 上收一层
  for (let x = -halfW; x <= halfW; x++)
    for (let z = -halfD; z <= halfD; z++) {
      const edge = Math.abs(x) === halfW || Math.abs(z) === halfD;
      v.set(cx + x, y + 2, cz + z, edge ? matDark : mat);
    }
}

function addStoneLantern(v, x, y, z) {
  v.set(x, y, z, MAT.STONE_STEP);
  v.set(x, y + 1, z, MAT.STONE_STEP);
  v.set(x, y + 2, z, MAT.ROCK_LITE);
  v.set(x, y + 3, z, MAT.LANTERN);
  v.set(x, y + 4, z, MAT.LANTERN_CORE);
  v.set(x, y + 5, z, MAT.ROOF_DARK);
}

/** 三重檐楼阁 */
function addPagoda(v, cx, baseY, cz, floors = 3) {
  // 台基
  for (let x = -5; x <= 5; x++)
    for (let z = -5; z <= 5; z++) {
      v.set(cx + x, baseY, cz + z, MAT.STONE_STEP);
      if (Math.abs(x) === 5 || Math.abs(z) === 5)
        v.set(cx + x, baseY - 1, cz + z, MAT.ROCK_LITE);
    }

  let y = baseY + 1;
  let hw = 4;
  let hd = 4;

  for (let f = 0; f < floors; f++) {
    // 楼板
    for (let x = -hw; x <= hw; x++)
      for (let z = -hd; z <= hd; z++) {
        if (f === 0 || Math.abs(x) < hw || Math.abs(z) < hd)
          v.set(cx + x, y, cz + z, MAT.WOOD_DARK);
      }

    // 柱与墙
    for (let x = -hw; x <= hw; x++)
      for (let z = -hd; z <= hd; z++) {
        const onShell = Math.abs(x) === hw || Math.abs(z) === hd;
        if (!onShell) continue;
        const isCorner = Math.abs(x) === hw && Math.abs(z) === hd;
        const isPillar =
          isCorner ||
          (Math.abs(x) === hw && Math.abs(z) === 0) ||
          (Math.abs(z) === hd && Math.abs(x) === 0);
        for (let dy = 1; dy <= 5; dy++) {
          if (isPillar) v.set(cx + x, y + dy, cz + z, MAT.WOOD);
          else if (dy === 1 || dy === 5) v.set(cx + x, y + dy, cz + z, MAT.WOOD_DARK);
          else v.set(cx + x, y + dy, cz + z, MAT.WINDOW); // 透窗
        }
      }

    // 平座栏杆
    for (let x = -hw - 1; x <= hw + 1; x++)
      for (let z = -hd - 1; z <= hd + 1; z++) {
        const outer = Math.abs(x) === hw + 1 || Math.abs(z) === hd + 1;
        const inner = Math.abs(x) <= hw && Math.abs(z) <= hd;
        if (outer && !inner) v.set(cx + x, y + 1, cz + z, MAT.WOOD_LITE);
      }

    // 层檐
    eaveRoof(v, cx, y + 6, cz, hw, hd, MAT.ROOF, MAT.ROOF_DARK);
    // 檐角灯
    for (const [lx, lz] of [
      [hw + 2, hd + 2],
      [-hw - 2, hd + 2],
      [hw + 2, -hd - 2],
      [-hw - 2, -hd - 2],
    ]) {
      v.set(cx + lx, y + 3, cz + lz, MAT.LANTERN);
      v.set(cx + lx, y + 2, cz + lz, MAT.LANTERN_CORE);
    }

    y += 8;
    hw = Math.max(2, hw - 1);
    hd = Math.max(2, hd - 1);
  }

  // 宝顶
  for (let i = 0; i < 4; i++) v.set(cx, y + i, cz, i % 2 ? MAT.GOLD_LITE : MAT.GOLD);
  v.set(cx, y + 4, cz, MAT.GOLD_LITE);
  return y + 4;
}

function addSidePavilion(v, cx, baseY, cz) {
  for (let x = -3; x <= 3; x++)
    for (let z = -3; z <= 3; z++) v.set(cx + x, baseY, cz + z, MAT.STONE_STEP);
  for (let x = -2; x <= 2; x++)
    for (let z = -2; z <= 2; z++) {
      if (Math.abs(x) !== 2 && Math.abs(z) !== 2) continue;
      const pillar = (Math.abs(x) === 2 && Math.abs(z) === 2) || (Math.abs(x) === 2 && z === 0) || (Math.abs(z) === 2 && x === 0);
      for (let dy = 1; dy <= 4; dy++) {
        v.set(cx + x, baseY + dy, cz + z, pillar ? MAT.WOOD : MAT.WINDOW);
      }
    }
  eaveRoof(v, cx, baseY + 5, cz, 2, 2, MAT.ROOF, MAT.ROOF_DARK);
  v.set(cx, baseY + 8, cz, MAT.GOLD_LITE);
  v.set(cx + 3, baseY + 3, cz + 3, MAT.LANTERN);
  v.set(cx + 3, baseY + 2, cz + 3, MAT.LANTERN_CORE);
  v.set(cx - 3, baseY + 3, cz - 3, MAT.LANTERN);
  v.set(cx - 3, baseY + 2, cz - 3, MAT.LANTERN_CORE);
}

function addCoveredWalk(v, x0, z0, x1, z1, deckYAt, hmap) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(lerp(x0, x1, t));
    const z = Math.round(lerp(z0, z1, t));
    const y = surfaceY(hmap, deckYAt, x, z) ?? Math.floor(deckYAt(x));
    for (let dx = -1; dx <= 1; dx++) v.set(x + dx, y + 1, z, MAT.WOOD_DARK);
    if (i % 2 === 0) {
      v.set(x - 1, y + 2, z, MAT.WOOD);
      v.set(x + 1, y + 2, z, MAT.WOOD);
    }
    for (let dx = -2; dx <= 2; dx++) v.set(x + dx, y + 5, z, MAT.ROOF_DARK);
    if (i % 3 === 0) {
      v.set(x, y + 4, z + 1, MAT.LANTERN);
      v.set(x, y + 3, z + 1, MAT.LANTERN_CORE);
    }
  }
}

function addPine(v, x, baseY, z, size = 1) {
  const h = Math.round(6 * size + hash2(x, z) * 3);
  let cx = x, cz = z;
  for (let i = 0; i < h; i++) {
    const yy = baseY + 1 + i;
    v.set(cx, yy, cz, MAT.TRUNK);
    if (i % 2 === 0 && hash2(x + i, z) > 0.55) cx += hash2(i, x) > 0.5 ? 1 : -1;
    if (i % 3 === 0 && hash2(i, z) > 0.65) cz += hash2(i, z + 1) > 0.5 ? 1 : -1;
    if (i > h * 0.3 && i % 2 === 0) {
      const rad = Math.max(1, Math.round((1 - i / h) * 3.2 * size + 1));
      for (let dx = -rad; dx <= rad; dx++)
        for (let dz = -rad; dz <= rad; dz++) {
          if (dx * dx + dz * dz > rad * rad) continue;
          const n = hash2(x + dx, z + dz + i);
          const m = n > 0.7 ? MAT.PINE_LITE : n > 0.35 ? MAT.PINE : MAT.PINE_DARK;
          v.set(cx + dx, yy + 1, cz + dz, m);
        }
    }
  }
  v.set(cx, baseY + h + 1, cz, MAT.PINE_LITE);
  v.set(cx + 1, baseY + h + 1, cz, MAT.PINE);
  v.set(cx - 1, baseY + h + 1, cz, MAT.PINE);
  v.set(cx, baseY + h + 1, cz + 1, MAT.PINE);
  v.set(cx, baseY + h + 1, cz - 1, MAT.PINE);
}

function addStarfall(v, x, z, deckYAt, hmap) {
  const top = surfaceY(hmap, deckYAt, x, z);
  if (top === null) return;
  const startY = top - 1;
  const length = 30 + Math.floor(hash2(x, z) * 14);
  for (let i = 0; i < length; i++) {
    const y = startY - i;
    const xx = Math.round(x + Math.sin(i * 0.3 + x) * 0.7);
    for (let dz = -1; dz <= 1; dz++) {
      const edge = Math.abs(dz) === 1;
      v.set(xx, y, z + dz, edge ? MAT.FOAM : MAT.STARFALL);
    }
    if (i % 4 === 0) v.set(xx, y, z, MAT.FOAM);
  }
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++) v.set(x + dx, startY + 1, z + dz, MAT.FOAM);
}

function addClouds(v) {
  // 远离鲲体的星云云絮，避免误读成鼓包
  const blobs = [
    [-55, 18, 36, 8, 2, 5],
    [58, 22, -32, 9, 2, 5],
    [-20, -16, -40, 7, 2, 4],
    [70, 8, 28, 6, 2, 4],
    [-70, -4, -18, 8, 2, 4],
  ];
  for (const [cx, cy, cz, rx, ry, rz] of blobs) {
    v.fillSuperEllipsoid(cx, cy, cz, rx, ry, rz, 2.6, (x, y, z) => {
      const n = hash2(x, z + y);
      return n > 0.55 ? MAT.CLOUD : MAT.CLOUD_DARK;
    });
  }
}

export function buildMountainWorld(v, deckYAt) {
  const hmap = new Map();
  let maxH = 0;
  // 山体足迹压在鲲背中段
  for (let x = -14; x <= 18; x++) {
    for (let z = -9; z <= 9; z++) {
      const ex = (x - 2) / 15;
      const ez = z / 8;
      const fall = 1 - (ex * ex + ez * ez);
      if (fall <= 0.04) continue;
      const h = mountainHeight(x, z) * Math.min(1, fall * 1.4);
      if (h < 1.0) continue;
      hmap.set(`${x},${z}`, h);
      if (h > maxH) maxH = h;
    }
  }

  for (const [k, h] of hmap.entries()) {
    const [x, z] = k.split(",").map(Number);
    const baseY = Math.floor(deckYAt(x) - 1);
    const top = Math.floor(baseY + h);
    for (let y = baseY; y <= top; y++) {
      const depthNorm = (y - baseY) / Math.max(1, h);
      v.set(x, y, z, rockMat(depthNorm, y, x, z));
      if (depthNorm < 0.1) {
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (hash2(x + dx, z + dz) > 0.6) {
            const yy = Math.floor(baseY + h * hash2(x, z + dx) * 0.4);
            v.set(x + dx, yy, z + dz, MAT.ROCK_DARK);
          }
        }
      }
    }
    if (h > maxH * 0.8 && hash2(x, z) > 0.45) {
      v.set(x, top + 1, z, MAT.SNOW);
    }
  }

  // 石阶
  for (let i = 0; i < 16; i++) {
    const x = Math.round(lerp(16, 6, i / 15));
    const z = Math.round(lerp(8, 3, i / 15));
    const y = surfaceY(hmap, deckYAt, x, z);
    if (y === null) continue;
    for (let dx = -1; dx <= 1; dx++) v.set(x + dx, y + 1, z, MAT.STONE_STEP);
    if (i === 4) addStoneLantern(v, x + 2, y + 1, z);
    if (i === 11) addStoneLantern(v, x - 2, y + 1, z);
  }

  // 楼阁平台
  const px = 2, pz = 0;
  for (let x = px - 6; x <= px + 6; x++)
    for (let z = pz - 6; z <= pz + 6; z++) {
      const y = surfaceY(hmap, deckYAt, x, z);
      if (y === null) continue;
      for (let yy = y; yy <= y + 2; yy++) {
        v.set(x, yy, z, hash2(x, z) > 0.7 ? MAT.GRASS_LITE : MAT.GRASS);
      }
      hmap.set(`${x},${z}`, y + 2 - (deckYAt(x) - 1));
    }
  const platY = surfaceY(hmap, deckYAt, px, pz) + 1;
  addPagoda(v, px, platY, pz, 3);

  // 侧亭
  const sx = -10, sz = 7;
  for (let x = sx - 3; x <= sx + 3; x++)
    for (let z = sz - 3; z <= sz + 3; z++) {
      const y = surfaceY(hmap, deckYAt, x, z);
      if (y === null) continue;
      v.set(x, y + 1, z, MAT.GRASS);
      hmap.set(`${x},${z}`, y + 1 - (deckYAt(x) - 1));
    }
  addSidePavilion(v, sx, surfaceY(hmap, deckYAt, sx, sz) + 1, sz);
  addCoveredWalk(v, px - 5, pz + 3, sx + 2, sz - 1, deckYAt, hmap);

  // 松
  for (const [pxx, pzz, s] of [
    [14, 7, 0.95],
    [-4, -7, 1.1],
    [-12, -2, 0.8],
    [10, -8, 0.85],
  ]) {
    const y = surfaceY(hmap, deckYAt, pxx, pzz);
    if (y === null) continue;
    addPine(v, pxx, y, pzz, s);
  }

  // 星瀑（必须落在山体足迹内）
  addStarfall(v, 12, 7, deckYAt, hmap);
  addStarfall(v, -4, -7, deckYAt, hmap);
  addStarfall(v, 15, -2, deckYAt, hmap);

  // 云絮改由远景 sprite 承担，避免体素云误读成鼓包

  for (const [lx, lz] of [[8, 6], [-2, 7], [-12, 3]]) {
    const y = surfaceY(hmap, deckYAt, lx, lz);
    if (y === null) continue;
    addStoneLantern(v, lx, y + 1, lz);
  }

  return { hmap, maxH };
}

export function collectLanterns(v) {
  const pts = [];
  for (const [k, mat] of v.entries()) {
    if (mat === MAT.LANTERN || mat === MAT.LANTERN_CORE || mat === MAT.WINDOW) {
      pts.push({ pos: k.split(",").map(Number), mat });
    }
  }
  return pts;
}
