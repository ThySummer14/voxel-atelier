// Face-culled meshing with per-vertex ambient occlusion and baked vertex colour.
// Dependency-free: returns plain typed arrays grouped by render material group.

import { PALETTE, GROUPS } from './palette.js';
import { hash3 } from './rng.js';

const FACES = [
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], t: [1, 2], shade: 0.82 },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], t: [1, 2], shade: 0.82 },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], t: [0, 2], shade: 1.0 },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], t: [0, 2], shade: 0.55 },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], t: [0, 1], shade: 0.74 },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], t: [0, 1], shade: 0.74 },
];

const AO_LUT = [0.42, 0.62, 0.8, 1.0];

class Grow {
  constructor() {
    this.pos = new Float32Array(1 << 14);
    this.nrm = new Float32Array(1 << 14);
    this.col = new Float32Array(1 << 14);
    this.idx = new Uint32Array(1 << 14);
    this.nv = 0;
    this.ni = 0;
  }
  growV(need) {
    if (this.nv + need <= this.pos.length / 3) return;
    let cap = this.pos.length / 3;
    while (cap < this.nv + need) cap *= 2;
    const p = new Float32Array(cap * 3); p.set(this.pos); this.pos = p;
    const n = new Float32Array(cap * 3); n.set(this.nrm); this.nrm = n;
    const c = new Float32Array(cap * 3); c.set(this.col); this.col = c;
  }
  growI(need) {
    if (this.ni + need <= this.idx.length) return;
    let cap = this.idx.length;
    while (cap < this.ni + need) cap *= 2;
    const i = new Uint32Array(cap); i.set(this.idx); this.idx = i;
  }
  quad(x, y, z, face, colors, flip) {
    this.growV(4);
    this.growI(6);
    const base = this.nv;
    const n = face.n;
    for (let k = 0; k < 4; k++) {
      const c = face.c[k];
      const o = (this.nv + k) * 3;
      this.pos[o] = x + c[0];
      this.pos[o + 1] = y + c[1];
      this.pos[o + 2] = z + c[2];
      this.nrm[o] = n[0];
      this.nrm[o + 1] = n[1];
      this.nrm[o + 2] = n[2];
      this.col[o] = colors[k][0];
      this.col[o + 1] = colors[k][1];
      this.col[o + 2] = colors[k][2];
    }
    this.nv += 4;
    const ii = this.ni;
    if (!flip) {
      this.idx[ii] = base; this.idx[ii + 1] = base + 1; this.idx[ii + 2] = base + 2;
      this.idx[ii + 3] = base; this.idx[ii + 4] = base + 2; this.idx[ii + 5] = base + 3;
    } else {
      this.idx[ii] = base + 1; this.idx[ii + 1] = base + 2; this.idx[ii + 2] = base + 3;
      this.idx[ii + 3] = base + 1; this.idx[ii + 4] = base + 3; this.idx[ii + 5] = base;
    }
    this.ni += 6;
  }
  finish() {
    return {
      position: this.pos.subarray(0, this.nv * 3),
      normal: this.nrm.subarray(0, this.nv * 3),
      color: this.col.subarray(0, this.nv * 3),
      index: this.idx.subarray(0, this.ni),
      vertices: this.nv,
      faces: this.ni / 6,
    };
  }
}

export function meshWorld(world, opts = {}) {
  const useAO = opts.ao !== false;
  const buckets = new Map();
  for (const g of GROUPS) buckets.set(g, new Grow());
  const { nx, ny, nz, data } = world;
  const get = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= nx || y >= ny || z >= nz ? 0 : data[(z * ny + y) * nx + x]);
  const occludes = (id) => id !== 0 && !PALETTE[id].seeThrough;

  let faces = 0;
  const colors = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const ao = [0, 0, 0, 0];

  for (let z = 0; z < nz; z++) {
    for (let y = 0; y < ny; y++) {
      const rowBase = (z * ny + y) * nx;
      for (let x = 0; x < nx; x++) {
        const id = data[rowBase + x];
        if (id === 0) continue;
        const m = PALETTE[id];
        const bucket = buckets.get(m.group);
        const emissive = m.group !== 'opaque' && m.group !== 'metal' && m.group !== 'glass';
        const h = hash3(x, y, z);
        const jf = 1 + (h - 0.5) * 2 * m.jitter;

        for (let f = 0; f < 6; f++) {
          const face = FACES[f];
          const n = face.n;
          const nb = get(x + n[0], y + n[1], z + n[2]);
          if (nb !== 0 && !(PALETTE[nb].seeThrough && !m.seeThrough)) continue;
          if (nb !== 0 && m.seeThrough && PALETTE[nb].group === m.group) continue;

          const shade = emissive ? 1 : face.shade;
          const t0 = face.t[0], t1 = face.t[1];
          for (let k = 0; k < 4; k++) {
            const c = face.c[k];
            let a = 1;
            if (useAO && !emissive) {
              const o0 = c[t0] === 1 ? 1 : -1;
              const o1 = c[t1] === 1 ? 1 : -1;
              const bx = x + n[0], by = y + n[1], bz = z + n[2];
              const p0 = [bx, by, bz]; p0[t0] += o0;
              const p1 = [bx, by, bz]; p1[t1] += o1;
              const pc = [bx, by, bz]; pc[t0] += o0; pc[t1] += o1;
              const s0 = occludes(get(p0[0], p0[1], p0[2])) ? 1 : 0;
              const s1 = occludes(get(p1[0], p1[1], p1[2])) ? 1 : 0;
              const sc = occludes(get(pc[0], pc[1], pc[2])) ? 1 : 0;
              const level = s0 && s1 ? 0 : 3 - (s0 + s1 + sc);
              ao[k] = level;
              a = AO_LUT[level];
            } else ao[k] = 3;
            const s = shade * a * jf;
            colors[k][0] = m.lin[0] * s;
            colors[k][1] = m.lin[1] * s;
            colors[k][2] = m.lin[2] * s;
          }
          const flip = ao[0] + ao[2] < ao[1] + ao[3];
          bucket.quad(x, y, z, face, colors, flip);
          faces++;
        }
      }
    }
  }

  const groups = {};
  let verts = 0;
  for (const [g, b] of buckets) {
    if (b.ni === 0) continue;
    groups[g] = b.finish();
    verts += b.nv;
  }
  return { groups, faces, verts, voxels: world.solidCount };
}