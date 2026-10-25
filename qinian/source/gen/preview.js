// CPU preview: two-level DDA ray marching through the raw volume with sun shadows and voxel AO.
// usage: node preview.js out.png --eye x,y,z --at x,y,z --fov deg --size WxH [--sun az,el]
import { readFileSync } from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { NX, NY, NZ, S, Y0 } from './config.js';
import { PALETTE } from './palette.js';
import { writePNG } from './png.js';

const B = 8;
const BX = Math.ceil(NX / B), BY = Math.ceil(NY / B), BZ = Math.ceil(NZ / B);
const LAYER = NX * NZ;

function srgbToLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function linToSrgb(c) { c = Math.max(0, Math.min(1, c)); return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255); }
const PAL = PALETTE.map((p) => {
  const h = p.hex;
  return [srgbToLin(parseInt(h.slice(1, 3), 16)), srgbToLin(parseInt(h.slice(3, 5), 16)), srgbToLin(parseInt(h.slice(5, 7), 16)), p.mat];
});

function makeTracer(vox, bricks) {
  const get = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= NX || y >= NY || z >= NZ) ? 0 : vox[y * LAYER + z * NX + x];
  // returns [hit, x, y, z, axis, sign, t]
  function trace(ox, oy, oz, dx, dy, dz, tMax) {
    // clip to grid box
    let t0 = 0, t1 = tMax;
    const lo = [0, 0, 0], hi = [NX, NY, NZ], o = [ox, oy, oz], d = [dx, dy, dz];
    for (let a = 0; a < 3; a++) {
      if (Math.abs(d[a]) < 1e-12) { if (o[a] < lo[a] || o[a] > hi[a]) return null; continue; }
      let ta = (lo[a] - o[a]) / d[a], tb = (hi[a] - o[a]) / d[a];
      if (ta > tb) { const s = ta; ta = tb; tb = s; }
      if (ta > t0) t0 = ta;
      if (tb < t1) t1 = tb;
      if (t0 > t1) return null;
    }
    let t = t0 + 1e-6;
    // brick-level DDA
    let px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;
    let bx = Math.min(BX - 1, Math.max(0, Math.floor(px / B)));
    let by = Math.min(BY - 1, Math.max(0, Math.floor(py / B)));
    let bz = Math.min(BZ - 1, Math.max(0, Math.floor(pz / B)));
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const idx = 1 / dx, idy = 1 / dy, idz = 1 / dz;
    let tmx = dx !== 0 ? ((bx + (sx > 0 ? 1 : 0)) * B - ox) * idx : Infinity;
    let tmy = dy !== 0 ? ((by + (sy > 0 ? 1 : 0)) * B - oy) * idy : Infinity;
    let tmz = dz !== 0 ? ((bz + (sz > 0 ? 1 : 0)) * B - oz) * idz : Infinity;
    const tdx = Math.abs(B * idx), tdy = Math.abs(B * idy), tdz = Math.abs(B * idz);
    let tEnter = t;
    let enterAxis = -1;
    while (t < t1) {
      if (bricks[(by * BZ + bz) * BX + bx]) {
        // voxel DDA inside this brick
        const tb = Math.max(tEnter, t0) + 1e-6;
        let vx = Math.floor(ox + dx * tb), vy = Math.floor(oy + dy * tb), vz = Math.floor(oz + dz * tb);
        vx = Math.min(Math.max(vx, bx * B), bx * B + B - 1);
        vy = Math.min(Math.max(vy, by * B), by * B + B - 1);
        vz = Math.min(Math.max(vz, bz * B), bz * B + B - 1);
        let vmx = dx !== 0 ? ((vx + (sx > 0 ? 1 : 0)) - ox) * idx : Infinity;
        let vmy = dy !== 0 ? ((vy + (sy > 0 ? 1 : 0)) - oy) * idy : Infinity;
        let vmz = dz !== 0 ? ((vz + (sz > 0 ? 1 : 0)) - oz) * idz : Infinity;
        const vdx = Math.abs(idx), vdy = Math.abs(idy), vdz = Math.abs(idz);
        let axis = enterAxis, tv = tb;
        for (let i = 0; i < 3 * B + 2; i++) {
          if (vx < bx * B || vy < by * B || vz < bz * B || vx >= bx * B + B || vy >= by * B + B || vz >= bz * B + B) break;
          const c = get(vx, vy, vz);
          if (c) return [c, vx, vy, vz, axis, axis === 0 ? -sx : axis === 1 ? -sy : -sz, tv];
          if (vmx < vmy && vmx < vmz) { vx += sx; tv = vmx; vmx += vdx; axis = 0; }
          else if (vmy < vmz) { vy += sy; tv = vmy; vmy += vdy; axis = 1; }
          else { vz += sz; tv = vmz; vmz += vdz; axis = 2; }
        }
      }
      if (tmx < tmy && tmx < tmz) { bx += sx; t = tmx; tEnter = tmx; tmx += tdx; enterAxis = 0; }
      else if (tmy < tmz) { by += sy; t = tmy; tEnter = tmy; tmy += tdy; enterAxis = 1; }
      else { bz += sz; t = tmz; tEnter = tmz; tmz += tdz; enterAxis = 2; }
      if (bx < 0 || by < 0 || bz < 0 || bx >= BX || by >= BY || bz >= BZ) return null;
    }
    return null;
  }
  return { trace, get };
}

function render(job, vox, bricks) {
  const { W, H, eye, at, fov, sun, y0, y1, shadows } = job;
  const { trace, get } = makeTracer(vox, bricks);
  const toG = (p) => [p[0] / S + NX / 2, p[1] / S + Y0, p[2] / S + NZ / 2];
  const E = toG(eye), A = toG(at);
  let fx = A[0] - E[0], fy = A[1] - E[1], fz = A[2] - E[2];
  const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
  let rx = -fz, ry = 0, rz = fx; const rl = Math.hypot(rx, rz); rx /= rl; rz /= rl; // right = f × up
  const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  const tanH = Math.tan((fov * Math.PI) / 360);
  const [saz, sel] = sun;
  const L = [Math.sin(saz) * Math.cos(sel), Math.sin(sel), Math.cos(saz) * Math.cos(sel)];
  const out = new Uint8Array(W * (y1 - y0) * 3);
  const sunC = [1.0, 0.93, 0.82], skyC = [0.45, 0.55, 0.72], gndC = [0.38, 0.35, 0.3];
  for (let py = y0; py < y1; py++) {
    for (let px = 0; px < W; px++) {
      const sxn = ((px + 0.5) / W * 2 - 1) * tanH * (W / H);
      const syn = (1 - (py + 0.5) / H * 2) * tanH;
      let dx = fx + rx * sxn + ux * syn, dy = fy + ry * sxn + uy * syn, dz = fz + rz * sxn + uz * syn;
      const dl = Math.hypot(dx, dy, dz); dx /= dl; dy /= dl; dz /= dl;
      const hit = trace(E[0], E[1], E[2], dx, dy, dz, 1e7);
      let col;
      if (!hit) {
        const k = Math.max(0, dy);
        col = [0.62 - 0.25 * k, 0.72 - 0.18 * k, 0.86 - 0.05 * k];
      } else {
        const [c, vx, vy, vz, axis, sign] = hit;
        const n = [0, 0, 0];
        if (axis >= 0) n[axis] = sign; else n[1] = 1;
        const base = PAL[c];
        // AO from the 8 voxels in the layer in front of the face
        const fxv = vx + n[0], fyv = vy + n[1], fzv = vz + n[2];
        let occ = 0;
        const ta = axis === 0 ? [0, 1, 0] : [1, 0, 0], tb = axis === 2 ? [0, 1, 0] : [0, 0, 1];
        const ua = axis === 1 ? [1, 0, 0] : ta, ub = axis === 1 ? [0, 0, 1] : tb;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
          if (!i && !j) continue;
          if (get(fxv + ua[0] * i + ub[0] * j, fyv + ua[1] * i + ub[1] * j, fzv + ua[2] * i + ub[2] * j)) occ++;
        }
        let ao = 1 - occ * 0.075;
        if (job.aoRays) {
          // short-range hemisphere visibility for large-scale occlusion (eaves, recesses)
          let vis = 0;
          const ox = vx + 0.5 + n[0] * 0.51, oy = vy + 0.5 + n[1] * 0.51, oz = vz + 0.5 + n[2] * 0.51;
          for (let k = 0; k < job.aoRays; k++) {
            const u1 = (k + 0.5) / job.aoRays, u2 = ((k * 0.618034 + px * 0.13 + py * 0.71) % 1);
            const rr = Math.sqrt(u1), ph = 6.2831853 * u2;
            const lx = rr * Math.cos(ph), ly = rr * Math.sin(ph), lz = Math.sqrt(1 - u1);
            // tangent frame around n
            const tx = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
            const bx = [n[1] * tx[2] - n[2] * tx[1], n[2] * tx[0] - n[0] * tx[2], n[0] * tx[1] - n[1] * tx[0]];
            const cx = [bx[1] * n[2] - bx[2] * n[1], bx[2] * n[0] - bx[0] * n[2], bx[0] * n[1] - bx[1] * n[0]];
            const d0 = bx[0] * lx + cx[0] * ly + n[0] * lz, d1 = bx[1] * lx + cx[1] * ly + n[1] * lz, d2 = bx[2] * lx + cx[2] * ly + n[2] * lz;
            if (!trace(ox, oy, oz, d0, d1, d2, 45)) vis++;
          }
          ao *= 0.25 + 0.75 * (vis / job.aoRays);
        }
        const ndl = n[0] * L[0] + n[1] * L[1] + n[2] * L[2];
        let sh = ndl > 0 ? 1 : 0;
        if (shadows && ndl > 0) {
          const ox = vx + 0.5 + n[0] * 0.51, oy = vy + 0.5 + n[1] * 0.51, oz = vz + 0.5 + n[2] * 0.51;
          if (trace(ox, oy, oz, L[0], L[1], L[2], 4000)) sh = 0;
        }
        const hemi = 0.5 + 0.5 * n[1];
        const amb = [skyC[0] * hemi + gndC[0] * (1 - hemi), skyC[1] * hemi + gndC[1] * (1 - hemi), skyC[2] * hemi + gndC[2] * (1 - hemi)];
        col = [0, 1, 2].map((i) => base[i] * (sunC[i] * 2.1 * Math.max(0, ndl) * sh + amb[i] * 1.05 * ao));
        if (base[3] === 6) col = [base[0] * 1.2, base[1] * 1.2, base[2] * 1.2];
        // mild aerial perspective
        const dist = hit[6] * S;
        const f = 1 - Math.exp(-dist / 900);
        col = col.map((v, i) => v * (1 - f) + [0.6, 0.68, 0.8][i] * f);
      }
      const o = ((py - y0) * W + px) * 3;
      // simple filmic curve
      for (let i = 0; i < 3; i++) {
        const x = col[i] * 0.9;
        out[o + i] = linToSrgb(x / (1 + x * 0.35));
      }
    }
  }
  return out;
}

if (isMainThread) {
  const args = process.argv.slice(2);
  const outPath = args[0];
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const v3 = (s) => s.split(',').map(Number);
  const [W, H] = opt('size', '960x600').split('x').map(Number);
  const job = {
    W, H,
    eye: v3(opt('eye', '62,34,78')),
    at: v3(opt('at', '0,12,0')),
    fov: Number(opt('fov', '30')),
    sun: v3(opt('sun', '135,42')).map((d) => (d * Math.PI) / 180),
    shadows: opt('shadows', '1') === '1',
    aoRays: Number(opt('ao', '0')),
  };
  const raw = readFileSync(opt('vol', '/tmp/qn/volume.raw'));
  const shared = new SharedArrayBuffer(raw.length);
  const vox = new Uint8Array(shared); vox.set(raw);
  const bshared = new SharedArrayBuffer(BX * BY * BZ);
  const bricks = new Uint8Array(bshared);
  for (let y = 0; y < NY; y++) for (let z = 0; z < NZ; z++) {
    const o = y * LAYER + z * NX;
    const bb = (Math.floor(y / B) * BZ + Math.floor(z / B)) * BX;
    for (let x = 0; x < NX; x++) if (vox[o + x]) bricks[bb + (x >> 3)] = 1;
  }
  const T = Number(opt('threads', '4'));
  const rgb = new Uint8Array(W * H * 3);
  let done = 0;
  const t0 = Date.now();
  for (let k = 0; k < T; k++) {
    const y0 = Math.floor((H * k) / T), y1 = Math.floor((H * (k + 1)) / T);
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: { job: { ...job, y0, y1 }, shared, bshared } });
    w.on('message', (buf) => {
      rgb.set(buf, y0 * W * 3);
      if (++done === T) {
        writePNG(outPath, W, H, rgb);
        console.log(outPath, `${((Date.now() - t0) / 1000).toFixed(1)} s`);
      }
    });
  }
} else {
  const { job, shared, bshared } = workerData;
  const out = render(job, new Uint8Array(shared), new Uint8Array(bshared));
  parentPort.postMessage(out);
}
