import { C, noise2, mulberry32, fbm } from './palette.js';

function set(vol, x, y, z, color, kind = 0, jitter = 0.05) {
  vol.set(x, y, z, color, kind, jitter);
}

function boulder(vol, cx, cy, cz, rx, ry, rz, seed = 1, mossy = true) {
  const rand = mulberry32(seed);
  const bounds = Math.ceil(Math.max(rx, ry, rz));
  for (let x = -bounds; x <= bounds; x++) {
    for (let y = -bounds; y <= bounds; y++) {
      for (let z = -bounds; z <= bounds; z++) {
        const r = Math.sqrt((x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz));
        const n = noise2((cx + x) * 0.31, (cz + z) * 0.31 + y * 0.23, seed) * 0.22;
        if (r > 0.86 + n) continue;
        let color = y > 0 ? C.rock3 : C.rock2;
        if (rand() < 0.17) color = C.rock1;
        if (mossy && y > ry * 0.3 && rand() < 0.55) color = rand() < 0.35 ? C.moss3 : C.moss2;
        set(vol, cx + x, cy + y, cz + z, color, 0, 0.07);
      }
    }
  }
}

function needlePad(vol, cx, cy, cz, rx, ry, rz, seed, palette = [C.pine2, C.pine3, C.pine4], sparse = 0.11) {
  const rand = mulberry32(seed);
  const bx = Math.ceil(rx), by = Math.ceil(ry), bz = Math.ceil(rz);
  for (let x = -bx; x <= bx; x++) {
    for (let y = -by; y <= by + 1; y++) {
      for (let z = -bz; z <= bz; z++) {
        const r = Math.sqrt((x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz));
        if (r > 1) continue;
        if (rand() < sparse && r > 0.6) continue;
        const edge = r > 0.78;
        let color = palette[Math.floor(rand() * palette.length)];
        if (edge && rand() < 0.45) color = palette[0];
        if (y > 0 && rand() < 0.3) color = palette[palette.length - 1];
        set(vol, cx + x, cy + y, cz + z, color, 0, 0.08);
      }
    }
  }
}

export function buildPine(vol, x, ground, z, height, seed, girth = 1) {
  const rand = mulberry32(seed);
  let tx = x, tz = z;
  const leanA = (rand() - 0.5) * 0.35;
  const leanB = (rand() - 0.5) * 0.2;
  for (let y = 0; y < height; y++) {
    const t = y / height;
    tx = x + Math.round(Math.sin(y * 0.23 + seed) * t * height * leanA + t * height * leanB);
    tz = z + Math.round(Math.cos(y * 0.19 + seed * 0.4) * t * height * leanA * 0.7);
    set(vol, tx, ground + y, tz, (y < 3 ? C.timber1 : (y % 5 === 0 ? C.timber2 : 0x40372f)), 0, 0.06);
    if (girth > 1 && y < height * 0.35) {
      set(vol, tx + 1, ground + y, tz, C.timber1, 0, 0.05);
      set(vol, tx, ground + y, tz + 1, C.timber1, 0, 0.05);
    }
    // exposed roots
    if (y < 2) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (rand() < 0.6) set(vol, tx + dx, ground + (rand() < 0.4 ? 1 : 0), tz + dz, C.timber1, 0, 0.04);
      }
    }
  }

  const levels = Math.max(4, Math.floor(height / 3.1));
  for (let i = 0; i < levels; i++) {
    const t = (i + 1) / (levels + 1);
    const by = ground + Math.round(height * (0.3 + t * 0.72));
    const angle = i * 2.399 + seed * 0.3;
    const reach = (1.6 + (1 - t) * 3.4) * (0.75 + rand() * 0.6);
    const bx = Math.round(Math.cos(angle) * reach);
    const bz = Math.round(Math.sin(angle) * reach);
    const branchY = by - Math.round(reach * 0.2);
    const steps = Math.max(2, Math.round(Math.hypot(bx, bz)));
    for (let s = 1; s <= steps; s++) {
      const f = s / steps;
      const px = x + Math.round(Math.sin(by * 0.23 + seed) * by * 0.02 * 0 + bx * f + Math.sin(by * 0.2) * 0.7);
      const pz = z + Math.round(bz * f + Math.cos(by * 0.17) * 0.5);
      const py = branchY + Math.round(f * reach * 0.28);
      set(vol, px, py, pz, C.timber2, 0, 0.05);
    }
    const px = x + bx + Math.round(Math.sin(by * 0.2) * 0.7);
    const pz = z + bz + Math.round(Math.cos(by * 0.17) * 0.5);
    const py = branchY + Math.round(reach * 0.28);
    const padR = 2.1 + (1 - Math.abs(t - 0.45)) * 2.4 + rand() * 0.8;
    needlePad(vol, px, py, pz, padR, 1.1 + rand() * 0.7, padR * (0.75 + rand() * 0.35), seed + i * 13);
    if (i % 2 === 0 && reach > 3.5) {
      needlePad(vol, px - Math.round(bx * 0.35), py - 1, pz - Math.round(bz * 0.35), padR * 0.62, 0.9, padR * 0.55, seed + i * 7 + 3);
    }
  }
  const topX = x + Math.round(Math.sin(height * 0.23 + seed) * height * leanA + height * leanB);
  const topZ = z + Math.round(Math.cos(height * 0.19 + seed * 0.4) * height * leanA * 0.7);
  needlePad(vol, topX, ground + height, topZ, 2.4 + rand() * 0.8, 1.6, 2.2, seed + 99);
  needlePad(vol, topX, ground + height + 1, topZ, 1.4, 0.9, 1.3, seed + 101);
  // hanging tufts
  for (let i = 0; i < 4; i++) {
    const px = topX + Math.round((rand() - 0.5) * 5);
    const pz = topZ + Math.round((rand() - 0.5) * 5);
    set(vol, px, ground + height - 1 - Math.floor(rand() * 2), pz, C.pine3, 0, 0.05);
  }
}

export function buildGinkgo(vol, x, ground, z, height, seed) {
  const rand = mulberry32(seed);
  let tx = x, tz = z;
  for (let y = 0; y < height; y++) {
    const t = y / height;
    tx = x + Math.round(Math.sin(y * 0.35 + seed) * 1.5 * t);
    tz = z + Math.round(Math.cos(y * 0.29) * 1.0 * t);
    set(vol, tx, ground + y, tz, y < 3 ? C.timber1 : C.timber2, 0, 0.05);
  }
  const levels = Math.max(3, Math.floor(height / 4));
  for (let i = 0; i < levels; i++) {
    const t = (i + 1) / (levels + 1);
    const by = ground + Math.round(height * (0.4 + t * 0.6));
    const angle = i * 2.399 + seed;
    const reach = 2 + rand() * 3.5;
    const px = tx + Math.round(Math.cos(angle) * reach);
    const pz = tz + Math.round(Math.sin(angle) * reach);
    for (let s = 1; s <= reach; s++) {
      const f = s / reach;
      set(vol, tx + Math.round(Math.cos(angle) * reach * f), by + Math.round(f * 1.5), tz + Math.round(Math.sin(angle) * reach * f), C.timber2, 0, 0.04);
    }
    needlePad(vol, px, by + 1, pz, 2.2 + rand() * 1.3, 1.3, 2.2 + rand() * 1.3, seed + i, [0xb9863d, 0xd3a84f, 0xe6c56e, 0xc8943f], 0.2);
  }
  needlePad(vol, tx, ground + height, tz, 3.2, 1.8, 3.0, seed + 77, [0xc79645, 0xe0b65d, 0xe9cb79], 0.16);
}

function shrub(vol, x, y, z, seed, size = 2, palette = [C.moss2, C.moss3, C.moss4]) {
  const rand = mulberry32(seed);
  for (let i = 0; i < 5 + Math.floor(rand() * 4); i++) {
    const dx = Math.round((rand() - 0.5) * size * 2);
    const dz = Math.round((rand() - 0.5) * size * 2);
    const dy = Math.round(rand() * 1.5);
    if (dx * dx + dz * dz > size * size) continue;
    set(vol, x + dx, y + dy, z + dz, palette[Math.floor(rand() * palette.length)], 0, 0.08);
  }
}

function crystalCluster(vol, x, y, z, seed, count = 5) {
  const rand = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const height = 1 + Math.floor(rand() * 4);
    const dx = Math.round((rand() - 0.5) * 3);
    const dz = Math.round((rand() - 0.5) * 3);
    for (let h = 0; h < height; h++) {
      set(vol, x + dx, y + h, z + dz, h === height - 1 ? C.glowCyan : C.glowTeal, 2, 0.02);
    }
  }
}

function flowers(vol, x, z, y, seed, warm = false) {
  const rand = mulberry32(seed);
  for (let i = 0; i < 6; i++) {
    const dx = Math.round((rand() - 0.5) * 8);
    const dz = Math.round((rand() - 0.5) * 8);
    const yy = y + Math.round(noise2((x + dx) * 0.2, (z + dz) * 0.2, seed) * 1);
    set(vol, x + dx, yy + 1, z + dz, warm ? C.ember : C.glowCyan, 2, 0.01);
    if (rand() > 0.5) set(vol, x + dx + 1, yy + 1, z + dz, C.moss4, 0, 0.04);
  }
}

export function buildNature(vol, heightAt) {
  const g = heightAt;

  // Focal pines around the atelier and on the cliff shoulders
  buildPine(vol, -68, g(-68, 46), 46, 21, 101, 2);
  buildPine(vol, -67, g(-67, 61), 61, 12, 103, 1);
  buildPine(vol, 54, 50, 25, 19, 104, 2);
  buildPine(vol, 30, 50, 25, 12, 105, 1);
  buildPine(vol, -14, 50, 45, 14, 108, 1);
  buildPine(vol, -44, g(-44, -28), -28, 18, 109, 1);
  buildPine(vol, -57, g(-57, -18), -18, 16, 110, 1);
  buildPine(vol, -30, g(-30, -52), -52, 17, 111, 1);
  buildPine(vol, 54, g(54, -30), -30, 16, 112, 1);
  buildPine(vol, 66, g(66, -21), -21, 13, 113, 1);
  buildPine(vol, -71, g(-71, -2), -2, 14, 114, 1);
  buildPine(vol, -75, g(-75, 6), 6, 9, 115, 1);

  buildGinkgo(vol, 64, 50, 18, 17, 201);
  buildGinkgo(vol, 24, 50, 29, 11, 202);

  // Cliff outcrops: break the otherwise smooth massif edges
  boulder(vol, -20, 47, 49, 8, 5, 7, 301, true);
  boulder(vol, -8, 46, 54, 5, 4, 6, 302, true);
  boulder(vol, 25, 45, 55, 6, 5, 5, 303, true);
  boulder(vol, 47, 47, 34, 7, 4, 6, 304, true);
  boulder(vol, 68, 49, 23, 6, 5, 7, 305, true);
  boulder(vol, -62, 35, 64, 7, 4, 6, 306, true);
  boulder(vol, -42, 52, 45, 4, 4, 4, 307, true);
  boulder(vol, -52, 58, -18, 7, 5, 5, 308, true);
  boulder(vol, -73, 64, -8, 4, 5, 4, 309, false);
  boulder(vol, 32, 59, -20, 5, 4, 5, 310, true);
  boulder(vol, 61, 55, -26, 6, 4, 5, 311, true);
  boulder(vol, -25, 51, 37, 3, 2, 3, 312, true);
  boulder(vol, -36, 51, 44, 4, 3, 3, 313, true);
  boulder(vol, -44, 51, 48, 3, 2, 3, 314, true);

  // moss and shrubs
  const shrubs = [
    [-18, 51, 24], [17, 51, 24], [-24, 51, 28], [24, 51, 22], [64, 51, 14],
    [-33, 51, 43], [-37, 51, 47], [-67, 38, 44], [-44, 38, 64], [59, 51, 25],
    [-8, 51, 26], [13, 51, 12], [-22, 51, 12], [48, 51, 29], [-12, 51, 34],
    [33, 51, 40], [21, 51, 45], [-48, 51, 34], [-53, 51, 28], [55, 51, -8],
  ];
  shrubs.forEach(([x, y, z], i) => shrub(vol, x, y, z, 500 + i, 2 + (i % 3)));

  // luminous mineral seams near the water and cliff silhouettes
  crystalCluster(vol, -34, 50, 46, 601, 6);
  crystalCluster(vol, -16, 50, 47, 602, 5);
  crystalCluster(vol, -67, 38, 50, 603, 5);
  crystalCluster(vol, 61, 51, 22, 604, 4);
  crystalCluster(vol, -40, 54, -20, 605, 4);
  crystalCluster(vol, 30, 58, -26, 606, 3);
  crystalCluster(vol, -2, 51, 30, 607, 3);

  // glowing flowers and ground light
  flowers(vol, -12, 39, 50, 701, true);
  flowers(vol, 8, 26, 50, 702, false);
  flowers(vol, 54, 28, 50, 703, true);
  flowers(vol, -48, 55, 37, 704, false);
  flowers(vol, 33, 34, 50, 705, false);

  // reeds at the water's edge
  for (let i = 0; i < 18; i++) {
    const x = -34 + Math.floor(noise2(i * 1.7, 2.3) * 14);
    const z = 43 + Math.floor(noise2(i * 2.9, 5.1) * 5);
    for (let h = 0; h < 2 + (i % 3); h++) {
      set(vol, x, 51 + h, z, h === 0 ? C.moss2 : C.moss3, 0, 0.06);
    }
  }


  // mossy vines along the places where the cliff breaks into the cloud
  for (let x = -92; x <= 92; x += 2) {
    for (let z = 30; z <= 78; z += 2) {
      const h = heightAt(x, z);
      if (h < 22 || h > 54) continue;
      const hx = heightAt(x + 2, z);
      const hz = heightAt(x, z + 2);
      if (h - hx < 4 && h - hz < 4) continue;
      if (noise2(x * 0.13, z * 0.13, 771) < 0.55) continue;
      const len = 3 + Math.floor(noise2(x * 0.21, z * 0.21, 772) * 11);
      const sway = noise2(x * 0.1, z * 0.1, 773) > 0.5 ? 1 : -1;
      for (let i = 0; i < len; i++) {
        const vx = x + Math.round(Math.sin(i * 0.65 + x) * 0.7 * sway);
        const vz = z + Math.round(Math.cos(i * 0.6 + z) * 0.5 * sway);
        set(vol, vx, h - i, vz, i < 2 ? C.moss2 : (i % 4 === 0 ? C.moss3 : C.moss1), 0, 0.08);
        if (i === len - 1 && noise2(x, z, 774) > 0.5) set(vol, vx, h - i, vz, C.glowCyan, 2, 0.01);
      }
    }
  }

  // little clusters of ledge flowers on the cliff face
  for (let i = 0; i < 18; i++) {
    const x = -80 + Math.floor(noise2(i * 2.7, 1.9, 881) * 160);
    const z = 32 + Math.floor(noise2(i * 1.3, 4.7, 882) * 35);
    const h = heightAt(x, z);
    if (h > 20 && h < 52) {
      set(vol, x, h, z, noise2(i, 2.2, 883) > 0.5 ? C.ember : C.glowCyan, 2, 0.01);
    }
  }

  // cliff vines
  for (let i = 0; i < 12; i++) {
    const x = -28 + Math.floor(noise2(i * 2.3, 1.1) * 64);
    const z = 48 + Math.floor(noise2(i * 1.9, 4.7) * 8);
    const startY = 50;
    const len = 4 + Math.floor(noise2(i, 9.1) * 10);
    for (let h = 0; h < len; h++) {
      set(vol, x + Math.round(Math.sin(h * 0.7 + i) * 0.7), startY - h, z, h % 4 === 0 ? C.moss3 : C.moss1, 0, 0.08);
    }
  }
}
