// 网格阶段：每个部件的体素 Map → 贪心合并的面片（顶点+双色+索引）。
// 合并键 = 调色板索引；深度分量由"邻居不存在才出面"保证。
import { PI, PAL, IDX, EMISSIVE, faceLight } from './palette.js';

const DIRS = [
  { n: [1, 0, 0], u: [0, 1, 0], w: [0, 0, 1] },
  { n: [-1, 0, 0], u: [0, 1, 0], w: [0, 0, -1] },
  { n: [0, 1, 0], u: [0, 0, 1], w: [1, 0, 0] },
  { n: [0, -1, 0], u: [0, 0, -1], w: [1, 0, 0] },
  { n: [0, 0, 1], u: [1, 0, 0], w: [0, 1, 0] },
  { n: [0, 0, -1], u: [-1, 0, 0], w: [0, 1, 0] },
];

function cellKey(x, y, z) { return `${x},${y},${z}`; }

export function mergePart(part) {
  const cells = part.cells;
  const pos = [];
  const colD = [];
  const colN = [];
  const idx = [];
  let quads = 0;

  for (const dir of DIRS) {
    const [nx, ny, nz] = dir.n;
    const mask = new Map();
    for (const key of cells.keys()) {
      const [x, y, z] = key.split(',').map(Number);
      if (cells.has(cellKey(x + nx, y + ny, z + nz))) continue;
      const c = cells.get(key);
      const d = x * nx + y * ny + z * nz;
      const u = x * dir.u[0] + y * dir.u[1] + z * dir.u[2];
      const w = x * dir.w[0] + y * dir.w[1] + z * dir.w[2];
      mask.set(`${d},${u},${w}`, { d, u, w, c, x, y, z });
    }
    const byLayer = new Map();
    for (const m of mask.values()) {
      if (!byLayer.has(m.d)) byLayer.set(m.d, []);
      byLayer.get(m.d).push(m);
    }
    for (const items of byLayer.values()) {
      const grid = new Map();
      for (const it of items) grid.set(`${it.u},${it.w}`, it);
      const done = new Set();
      for (const it of items) {
        if (done.has(`${it.u},${it.w}`)) continue;
        let u1 = it.u;
        while (grid.has(`${u1 + 1},${it.w}`) && grid.get(`${u1 + 1},${it.w}`).c === it.c && !done.has(`${u1 + 1},${it.w}`)) u1++;
        let w1 = it.w;
        outer:
        while (true) {
          for (let u = it.u; u <= u1; u++) {
            const g = grid.get(`${u},${w1 + 1}`);
            if (!g || g.c !== it.c || done.has(`${u},${w1 + 1}`)) break outer;
          }
          w1++;
        }
        for (let u = it.u; u <= u1; u++)
          for (let w = it.w; w <= w1; w++) done.add(`${u},${w}`);
        emitQuad(dir, it, u1, w1, pos, colD, colN, idx);
        quads++;
      }
    }
  }
  return { key: part.key, dyn: part.dyn, pos, colD, colN, idx, quads, cells: cells.size };
}

function emitQuad(dir, it, u1, w1, pos, colD, colN, idx) {
  const [nx, ny, nz] = dir.n;
  const [ux, uy, uz] = dir.u;
  const [wx, wy, wz] = dir.w;
  const base = [it.x, it.y, it.z];
  const U = u1 - it.u + 1;
  const W = w1 - it.w + 1;
  const corners = [
    base,
    [base[0] + ux * U, base[1] + uy * U, base[2] + uz * U],
    [base[0] + ux * U + wx * W, base[1] + uy * U + wy * W, base[2] + uz * U + wz * W],
    [base[0] + wx * W, base[1] + wy * W, base[2] + wz * W],
  ];
  const fc = [base[0] + (ux * U + wx * W) / 2, base[1] + (uy * U + wy * W) / 2, base[2] + (uz * U + wz * W) / 2];
  const name = IDX[it.c];
  let rgb = PAL[name];
  const emissive = EMISSIVE.has(it.c);
  const n = [nx, ny, nz];
  const ld = emissive ? [1, 1, 1] : faceLight(n, fc, 'day');
  const ln = emissive ? [1, 1, 1] : faceLight(n, fc, 'night');
  const nightName = name === 'paper' ? 'paperN' : name;
  let rgbN = PAL[nightName] || rgb;
  const v0 = pos.length / 3;
  for (const c of corners) {
    pos.push(c[0], c[1], c[2]);
    colD.push(rgb[0] * ld[0], rgb[1] * ld[1], rgb[2] * ld[2]);
    colN.push(rgbN[0] * ln[0], rgbN[1] * ln[1], rgbN[2] * ln[2]);
  }
  idx.push(v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3);
}

export function mergeAll(parts) {
  return parts.map(mergePart);
}

export function statsOf(meshes) {
  let quads = 0, cells = 0;
  for (const m of meshes) { quads += m.quads; cells += m.cells; }
  return { parts: meshes.length, quads, tris: quads * 2, cells };
}
