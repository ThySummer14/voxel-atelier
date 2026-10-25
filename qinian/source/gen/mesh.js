// Greedy mesher → packed instanced quads, plus a coarse sky-visibility volume.
// usage: node mesh.js /tmp/qn/volume.raw ../../data
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { NX, NY, NZ, S, Y0 } from './config.js';
import { PALETTE } from './palette.js';

const [, , volPath = '/tmp/qn/volume.raw', outDir = '../../data'] = process.argv;
mkdirSync(outDir, { recursive: true });
const vol = readFileSync(volPath);
const L = NX * NZ;
const DIM = [NX, NY, NZ];
const STR = [1, L, NX];
// direction → [normal axis, u axis, v axis, sign]; cross(U, V) = N
const DIRS = [
  [0, 1, 2, 1], [0, 2, 1, -1],
  [1, 2, 0, 1], [1, 0, 2, -1],
  [2, 0, 1, 1], [2, 1, 0, -1],
];
const TILE = 160;
const TX = Math.ceil(NX / TILE), TZ = Math.ceil(NZ / TILE);
const tiles = Array.from({ length: TX * TZ }, () => ({ q: [], min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }));

const t0 = Date.now();
let faces = 0, quads = 0;
const visible = new Uint8Array((vol.length >> 3) + 1);
const markVisible = (i) => { visible[i >> 3] |= 1 << (i & 7); };

for (let d = 0; d < 6; d++) {
  const [an, au, av, sg] = DIRS[d];
  const dn = DIM[an], du = DIM[au], dv = DIM[av];
  const sn = STR[an], su = STR[au], sv = STR[av];
  const mask = new Int32Array(du * dv);
  for (let sl = 0; sl < dn; sl++) {
    const nb = sl + sg;
    if (an === 1 && nb < 0) continue; // never look at the underside of the block
    const nbIn = nb >= 0 && nb < dn;
    let any = false;
    for (let v = 0; v < dv; v++) {
      const rowBase = sl * sn + v * sv;
      const nRow = nb * sn + v * sv;
      for (let u = 0; u < du; u++) {
        const idx = rowBase + u * su;
        const c = vol[idx];
        let k = 0;
        if (c) {
          const nIdx = nRow + u * su;
          if (!nbIn || !vol[nIdx]) {
            // per-corner AO from the 8 neighbours in the air layer
            let ao = 0;
            if (nbIn) {
              const g = (uu, vv) => (uu < 0 || vv < 0 || uu >= du || vv >= dv) ? 0 : (vol[nb * sn + vv * sv + uu * su] ? 1 : 0);
              const um = g(u - 1, v), up = g(u + 1, v), vm = g(u, v - 1), vp = g(u, v + 1);
              const c00 = g(u - 1, v - 1), c10 = g(u + 1, v - 1), c11 = g(u + 1, v + 1), c01 = g(u - 1, v + 1);
              const A = (s1, s2, cc) => (s1 && s2 ? 0 : 3 - (s1 + s2 + cc));
              ao = A(um, vm, c00) | (A(up, vm, c10) << 2) | (A(up, vp, c11) << 4) | (A(um, vp, c01) << 6);
            } else ao = 255;
            k = c | (ao << 8);
            faces++;
            markVisible(idx);
            any = true;
          }
        }
        mask[v * du + u] = k;
      }
    }
    if (!any) continue;
    // greedy merge
    for (let v = 0; v < dv; v++) {
      for (let u = 0; u < du;) {
        const k = mask[v * du + u];
        if (!k) { u++; continue; }
        const ao = k >> 8;
        const a0 = ao & 3, a1 = (ao >> 2) & 3, a2 = (ao >> 4) & 3, a3 = (ao >> 6) & 3;
        const canU = a0 === a1 && a3 === a2;
        const canV = a0 === a3 && a1 === a2;
        let w = 1;
        if (canU) while (u + w < du && w < 64 && mask[v * du + u + w] === k) w++;
        let h = 1;
        if (canV) {
          grow: while (v + h < dv && h < 64) {
            const o = (v + h) * du + u;
            for (let i = 0; i < w; i++) if (mask[o + i] !== k) break grow;
            h++;
          }
        }
        for (let j = 0; j < h; j++) mask.fill(0, (v + j) * du + u, (v + j) * du + u + w);
        // voxel coordinate of the quad origin
        const p = [0, 0, 0];
        p[an] = sl; p[au] = u; p[av] = v;
        const w0 = (p[0] & 2047) | ((p[1] & 1023) << 11) | ((p[2] & 2047) << 21);
        const w1 = ((w - 1) & 63) | (((h - 1) & 63) << 6) | (d << 12) | ((ao & 255) << 15) | ((k & 255) << 23);
        const ti = Math.min(TZ - 1, Math.floor(p[2] / TILE)) * TX + Math.min(TX - 1, Math.floor(p[0] / TILE));
        const T = tiles[ti];
        T.q.push(w0 >>> 0, w1 >>> 0);
        const e = [0, 0, 0]; e[an] = 1; e[au] = w; e[av] = h;
        for (let a = 0; a < 3; a++) {
          if (p[a] < T.min[a]) T.min[a] = p[a];
          if (p[a] + e[a] > T.max[a]) T.max[a] = p[a] + e[a];
        }
        quads++;
        u += w;
      }
    }
  }
  console.log(`dir ${d}: faces ${faces} quads ${quads} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

let vis = 0, solid = 0;
for (let i = 0; i < vol.length; i++) if (vol[i]) solid++;
for (let i = 0; i < visible.length; i++) { let b = visible[i]; while (b) { vis += b & 1; b >>= 1; } }

// pack tiles
const order = tiles.map((t, i) => ({ ...t, i })).filter((t) => t.q.length);
const total = order.reduce((s, t) => s + t.q.length, 0);
const buf = new Uint32Array(total);
let off = 0;
const tileMeta = order.map((t) => {
  buf.set(t.q, off);
  const m = { o: off / 2, n: t.q.length / 2, min: t.min, max: t.max };
  off += t.q.length;
  return m;
});
const raw = Buffer.from(buf.buffer);
const gz = gzipSync(raw, { level: 9 });
writeFileSync(`${outDir}/quads.bin.gz`, gz);
console.log(`quads ${quads}  raw ${(raw.length / 1e6).toFixed(1)} MB  gz ${(gz.length / 1e6).toFixed(2)} MB`);

// ---------------------------------------------------------------- sky visibility volume (0.5 m)
const C = 5;
const GX = Math.ceil(NX / C), GY = Math.ceil(NY / C), GZ = Math.ceil(NZ / C);
const occ = new Float32Array(GX * GY * GZ);
for (let y = 0; y < NY; y++) for (let z = 0; z < NZ; z++) {
  const o = y * L + z * NX;
  const gb = (Math.floor(y / C) * GZ + Math.floor(z / C)) * GX;
  for (let x = 0; x < NX; x++) if (vol[o + x]) occ[gb + Math.floor(x / C)] += 1;
}
for (let i = 0; i < occ.length; i++) occ[i] /= C * C * C;
const RAYS = [];
for (let i = 0; i < 64; i++) {
  const u1 = (i + 0.5) / 64, u2 = (i * 0.6180339887) % 1;
  const el = Math.asin(Math.sqrt(u1)) * 0.98 + 0.03;   // cosine-weighted about +Y
  const az = u2 * Math.PI * 2;
  RAYS.push([Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)]);
}
const skyv = new Uint8Array(GX * GY * GZ).fill(255);
const gidx = (x, y, z) => (y * GZ + z) * GX + x;
const near = (x, y, z) => {
  for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const X = x + dx, Y = y + dy, Z = z + dz;
    if (X < 0 || Y < 0 || Z < 0 || X >= GX || Y >= GY || Z >= GZ) continue;
    if (occ[gidx(X, Y, Z)] > 0) return true;
  }
  return false;
};
let computed = 0;
for (let y = 0; y < GY; y++) for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) {
  const i = gidx(x, y, z);
  if (occ[i] >= 0.999 || !near(x, y, z)) continue;
  let acc = 0;
  for (const [dx, dy, dz] of RAYS) {
    let T = 1, px = x + 0.5, py = y + 0.5, pz = z + 0.5;
    for (let s = 0; s < 44 && T > 0.02; s++) {
      px += dx * 0.75; py += dy * 0.75; pz += dz * 0.75;
      const X = Math.floor(px), Y = Math.floor(py), Z = Math.floor(pz);
      if (X < 0 || Y < 0 || Z < 0 || X >= GX || Y >= GY || Z >= GZ) break;
      T *= 1 - Math.min(1, occ[gidx(X, Y, Z)] * 1.15);
    }
    acc += T;
  }
  skyv[i] = Math.round((acc / RAYS.length) * 255);
  computed++;
}
// solid cells take the mean of their open neighbours so trilinear lookups never sample black
for (let pass = 0; pass < 2; pass++) for (let y = 0; y < GY; y++) for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) {
  const i = gidx(x, y, z);
  if (occ[i] < 0.999) continue;
  let s = 0, n = 0;
  for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
    const X = x + dx, Y = y + dy, Z = z + dz;
    if (X < 0 || Y < 0 || Z < 0 || X >= GX || Y >= GY || Z >= GZ) continue;
    const j = gidx(X, Y, Z);
    if (occ[j] < 0.999 || pass) { s += skyv[j]; n++; }
  }
  if (n) skyv[i] = Math.round(s / n);
}
const aoGz = gzipSync(Buffer.from(skyv.buffer), { level: 9 });
writeFileSync(`${outDir}/sky.bin.gz`, aoGz);
console.log(`sky volume ${GX}×${GY}×${GZ}, computed ${computed}, gz ${(aoGz.length / 1e3).toFixed(0)} kB`);

const meta = {
  version: 1,
  voxel: S,
  dims: [NX, NY, NZ],
  ground: Y0,
  stats: { solid, visible: vis, faces, quads },
  tiles: tileMeta,
  sky: { cell: C, dims: [GX, GY, GZ] },
  palette: PALETTE.map((p) => [p.hex, p.mat, p.nz, p.sn]),
  files: { quads: 'quads.bin.gz', sky: 'sky.bin.gz' },
};
writeFileSync(`${outDir}/model.json`, JSON.stringify(meta));
console.log(JSON.stringify(meta.stats), `${((Date.now() - t0) / 1000).toFixed(1)} s`);
