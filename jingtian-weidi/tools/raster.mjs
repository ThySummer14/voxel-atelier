#!/usr/bin/env node
// 离线软光栅预览器：与浏览器共用 js/ 下的几何与顶点色（烘焙光照），用来秒级看图。
// 用法：node tools/raster.mjs --out /tmp/a.png --cam cover [--w 960 --h 700 --ss 2 --only k1,k2]
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildScene, buildDyn, panelPart } from '../js/build.js';
import { makeSchedule, sampleFrame } from '../js/weave.js';
import { poseAll, clothRows, weftPart } from '../js/pose.js';
import * as M4 from '../js/mat4.js';
import * as M from '../js/mat4.js';
import { CAMERAS, LIGHT } from '../js/spec.js';
import { PH as PAT_PH } from '../js/patterns.js';
import { linearToSrgbByte } from '../js/voxel.js';
import { writePNG } from './png.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

const out = arg('out', '/tmp/raster.png');
const W = parseInt(arg('w', '960')), H = parseInt(arg('h', '700'));
const ss = Math.max(1, Math.min(3, parseFloat(arg('ss', '2'))));
const fov = parseFloat(arg('fov', '34')) * Math.PI / 180;
const only = arg('only', '').split(',').map(s => s.trim()).filter(Boolean);
const statsOnly = has('stats');
const bgTop = arg('bg', '#1a2029'), bgBot = arg('bg2', '#0a0c10');
const vign = parseFloat(arg('vign', '0.30'));
const camName = arg('cam', 'cover');
let cam;
if (camName !== 'custom') {
  const c = CAMERAS[camName];
  if (!c) throw new Error('未知机位 ' + camName);
  cam = { yaw: c.yaw, pitch: c.pitch, dist: c.dist, look: c.look };
} else {
  cam = {
    yaw: parseFloat(arg('yaw', '0.6')), pitch: parseFloat(arg('pitch', '0.44')),
    dist: parseFloat(arg('dist', '400')),
    look: arg('look', '0,46,10').split(',').map(Number),
  };
}

if (has('flat')) LIGHT.debugFlat = true;
const t0 = Date.now();
const { statics, stats, ctx } = buildScene();
const patternIdx = parseInt(arg('pattern', '1'));
const rows = parseInt(arg('rows', '-1'));
const { pattern, parts: dynRaw } = buildDyn(ctx, patternIdx);
const sched = makeSchedule(pattern);
const timeArg = arg('time', null);
const frame = timeArg !== null ? sampleFrame(sched, parseFloat(timeArg)) : null;
let dyn = dynRaw;
if (frame) {
  dyn = dyn.filter(p => p.key !== 'cloth' && p.key !== 'weft');
  dyn.push(clothRows(ctx, pattern, frame.rowsPlaced));
  dyn.push(weftPart(ctx, frame));
  if (frame.panel) dyn.push(panelPart(ctx, pattern, 'panel'));
}
const full = panelPart(ctx, pattern, 'cloth');
let parts;
if (has('clothonly')) parts = [full];
else if (has('dyn') || has('pattern') || rows >= 0 || frame) parts = [...statics, ...dyn];
else parts = statics;
const poses = frame ? poseAll(frame, pattern) : null;
const renderParts = only.length ? parts.filter(p => only.some(k => p.key.startsWith(k))) : parts;
if (has('list')) { for (const p of parts) console.log(p.key.padEnd(22), 'quads', String(p.quads).padStart(6), 'vox', p.rawFaces, p.emissive ? 'EMIT' : ''); process.exit(0); }
if (statsOnly) process.exit(0);

const { eye, view } = M.cameraMatrix(cam.yaw, cam.pitch, cam.dist, cam.look);
const proj = M.perspective(fov, W / H, 2, 3000);
const viewProj = M.multiply(proj, view);

const PW = W * ss, PH = H * ss;
const fb = new Uint8Array(PW * PH * 3);
const depth = new Float32Array(PW * PH).fill(Infinity);
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const [btR, btG, btB] = hexRGB(bgTop), [bbR, bbG, bbB] = hexRGB(bgBot);

let triCount = 0, clipped = 0;
for (const part of renderParts) {
  const pz = poses ? poses.get(part.key) : null;
  const model = M.fromTRS(
    [part.pivot[0] + (pz ? pz.t[0] : 0), part.pivot[1] + (pz ? pz.t[1] : 0), part.pivot[2] + (pz ? pz.t[2] : 0)],
    pz ? pz.r : [0, 0, 0],
    pz ? pz.s : [1, 1, 1]);
  const mvp = M.multiply(viewProj, model);
  const pos = part.positions, col = part.colors, idx = part.indices;
  const nTri = idx.length / 3;
  triCount += nTri;
  const vbuf = new Float64Array(7 * 4);
  for (let t = 0; t < nTri; t++) {
    const i0 = idx[t * 3], i1 = idx[t * 3 + 1], i2 = idx[t * 3 + 2];
    const n = emitClip(vbuf, mvp, pos, col, i0, i1, i2);
    if (n === 0) { clipped++; continue; }
    // vbuf: 每顶点 7 个分量 x,y,z,w,r,g,b
    const p = [];
    for (let k = 0; k < n; k++) {
      const o = k * 7;
      const w = vbuf[o + 3];
      if (w <= 1e-6) continue;
      p.push({
        x: (vbuf[o] / w * 0.5 + 0.5) * PW,
        y: (0.5 - vbuf[o + 1] / w * 0.5) * PH,
        z: vbuf[o + 2] / w,
        iw: 1 / w,
        r: vbuf[o + 4], g: vbuf[o + 5], b: vbuf[o + 6],
      });
    }
    for (let k = 1; k + 1 < p.length; k++) rasterTri(fb, depth, PW, PH, p[0], p[k], p[k + 1]);
  }
}

function emitClip(vbuf, m, pos, col, i0, i1, i2) {
  const vs = [];
  for (const i of [i0, i1, i2]) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    vs.push([
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14],
      m[3] * x + m[7] * y + m[11] * z + m[15],
      col[i * 3], col[i * 3 + 1], col[i * 3 + 2],
    ]);
  }
  const d = vs.map(v => v[2] + v[3] - 1e-4);
  if (d[0] <= 0 && d[1] <= 0 && d[2] <= 0) return 0;
  let poly = vs;
  if (!(d[0] > 0 && d[1] > 0 && d[2] > 0)) {
    poly = [];
    for (let i = 0; i < 3; i++) {
      const a = vs[i], b = vs[(i + 1) % 3];
      const da = a[2] + a[3] - 1e-4, db = b[2] + b[3] - 1e-4;
      if (da > 0) poly.push(a);
      if ((da > 0) !== (db > 0)) {
        const tt = da / (da - db);
        poly.push(a.map((v, k) => v + (b[k] - v) * tt));
      }
    }
  }
  if (poly.length < 3) return 0;
  for (let k = 0; k < poly.length; k++) for (let c = 0; c < 7; c++) vbuf[k * 7 + c] = poly[k][c];
  return poly.length;
}

function rasterTri(fb, depth, W, H, a, b, c) {
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
  if (minX > maxX || minY > maxY) return;
  const area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  if (area >= 0) return;              // 屏幕 y 向下：逆时针（外法线）面面积为负
  const inv = 1 / area;
  for (let y = minY; y <= maxY; y++) {
    const py = y + 0.5;
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const w0 = ((b.x - a.x) * (py - a.y) - (px - a.x) * (b.y - a.y)) * inv;
      if (w0 < 0) continue;
      const w1 = ((c.x - b.x) * (py - b.y) - (px - b.x) * (c.y - b.y)) * inv;
      if (w1 < 0) continue;
      const w2 = 1 - w0 - w1;
      if (w2 < 0) continue;
      const z = w0 * c.z + w1 * a.z + w2 * b.z;
      const o = y * W + x;
      if (z >= depth[o]) continue;
      const iw = w0 * c.iw + w1 * a.iw + w2 * b.iw;
      depth[o] = z;
      const r = (w0 * c.r * c.iw + w1 * a.r * a.iw + w2 * b.r * b.iw) / iw;
      const g = (w0 * c.g * c.iw + w1 * a.g * a.iw + w2 * b.g * b.iw) / iw;
      const bl = (w0 * c.b * c.iw + w1 * a.b * a.iw + w2 * b.b * b.iw) / iw;
      fb[o * 3] = linearToSrgbByte(r);
      fb[o * 3 + 1] = linearToSrgbByte(g);
      fb[o * 3 + 2] = linearToSrgbByte(bl);
    }
  }
}

// 背景（未命中像素）+ 暗角
const cx = PW / 2, cy = PH / 2, rmax = Math.hypot(cx, cy);
for (let y = 0; y < PH; y++) {
  for (let x = 0; x < PW; x++) {
    const o = y * PW + x;
    let r, g, b;
    if (depth[o] === Infinity) {
      const t = y / PH;
      r = btR + (bbR - btR) * t; g = btG + (bbG - btG) * t; b = btB + (bbB - btB) * t;
    } else { r = fb[o * 3]; g = fb[o * 3 + 1]; b = fb[o * 3 + 2]; }
    if (vign > 0) {
      const d = Math.hypot(x - cx, y - cy) / rmax;
      const k = 1 - vign * d * d;
      r *= k; g *= k; b *= k;
    }
    fb[o * 3] = Math.max(0, Math.min(255, Math.round(r)));
    fb[o * 3 + 1] = Math.max(0, Math.min(255, Math.round(g)));
    fb[o * 3 + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }
}

// 超采样降采样
let outImg = fb, outW = PW, outH = PH;
if (ss > 1) {
  outW = W; outH = H;
  outImg = new Uint8Array(W * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < ss; dy++) for (let dx = 0; dx < ss; dx++) {
      const o = ((y * ss + dy) * PW + x * ss + dx) * 3;
      r += fb[o]; g += fb[o + 1]; b += fb[o + 2];
    }
    const n = ss * ss, o = (y * W + x) * 3;
    outImg[o] = r / n; outImg[o + 1] = g / n; outImg[o + 2] = b / n;
  }
}

writePNG(out, outW, outH, outImg);
console.log(`→ ${out}  ${outW}x${outH}  三角 ${triCount}  剔除 ${clipped}  eye ${eye.map(v => v.toFixed(0)).join(',')}  ${Date.now() - t0}ms`);
