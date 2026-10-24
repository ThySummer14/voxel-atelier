// 动态件轻量几何：盒体拼装 + 按面抽样光照（与静态件共用 sampleLight），产出与体素网格器同构的部件。
import { PAL, sampleLight } from './voxel.js';

export function newPart(key, { pivot = [0, 0, 0], emissive = false, tint = false } = {}) {
  return { key, pivot, emissive, tint, pos: [], col: [], quads: 0, rawFaces: 0, boxes: 0 };
}

// faces 位掩码：1=+X 2=-X 4=+Y 8=-Y 16=+Z 32=-Z（默认 63 全开）
export function box(ctx, p, x0, y0, z0, x1, y1, z1, colorIdx, opt = {}) {
  const faces = opt.faces === undefined ? 63 : opt.faces;
  const base = p.tint || opt.white ? [1, 1, 1] : PAL.linear[colorIdx - 1];
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  const cell = [Math.floor(cx), Math.floor(cy), Math.floor(cz)];
  const OFF = [
    [1, 0, 0, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    [-1, 0, 0, [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
    [0, 1, 0, [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
    [0, -1, 0, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    [0, 0, 1, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    [0, 0, -1, [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
  ];
  for (let f = 0; f < 6; f++) {
    if (!(faces & (1 << f))) continue;
    const [nx, ny, nz, quad] = OFF[f];
    let l = [1, 1, 1];
    if (!p.emissive) {
      l = sampleLight(ctx.v, ctx.vis, cell[0] + nx, cell[1] + ny, cell[2] + nz, [nx, ny, nz]);
    }
    for (const c of quad) {
      p.pos.push(c[0] - p.pivot[0], c[1] - p.pivot[1], c[2] - p.pivot[2]);
      p.col.push(base[0] * l[0], base[1] * l[1], base[2] * l[2]);
    }
    p.quads++; p.rawFaces++;
  }
  p.boxes++;
}

// 沿一条轴把「点列」连成 1 格粗的线盒（用于经线、提花线束、花本连线）
export function strand(ctx, p, x, y, z0, z1, colorIdx, opt = {}) {
  box(ctx, p, x, y, z0, x + 1, y + 1, z1 + 1, colorIdx, opt);
}

export function finish(p) {
  const n = p.quads;
  const idx = new Uint32Array(n * 6);
  for (let q = 0, o = 0; q < n; q++, o += 4) {
    idx[q * 6] = o; idx[q * 6 + 1] = o + 1; idx[q * 6 + 2] = o + 2;
    idx[q * 6 + 3] = o; idx[q * 6 + 4] = o + 2; idx[q * 6 + 5] = o + 3;
  }
  return {
    key: p.key, pivot: p.pivot, emissive: p.emissive, tint: p.tint,
    positions: new Float32Array(p.pos), colors: new Float32Array(p.col), indices: idx,
    quads: n, rawFaces: p.rawFaces, tris: n * 2, boxes: p.boxes,
  };
}