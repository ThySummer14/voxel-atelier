// raster.js — Node 软件光栅器：体素 → PNG
// 画家算法 + 平面着色三角形扫描线填充。与浏览器共用 bake.js 与 orbitCam。

import { orbitCam, clamp } from './spec.js';

// ── 极简 PNG 编码（zlib + CRC32）──────────────────────────────────────
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
export function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  }
  const { deflateSync } = require_zlib();
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
import { deflateSync as _deflate } from 'zlib';
function require_zlib() { return { deflateSync: _deflate }; }

// ── 天空背景（夜色渐变 + 星点，确定性）──────────────────────────────
function skyColors() {
  return {
    top: [8, 12, 26],
    mid: [18, 24, 44],
    hor: [52, 40, 46],
  };
}
function hashRand(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ── 主光栅 ────────────────────────────────────────────────────────────
// baked: bakeAll 的输出；view: {yaw, pitch, dist, target, w, h, fov}
export function rasterize(baked, voxels, view) {
  const { w, h } = view;
  const cam = orbitCam(view.yaw, view.pitch, view.dist, view.target || { x: 0, y: 10, z: 0 });
  const fov = ((view.fov || 38) * Math.PI) / 180;
  const focal = h / 2 / Math.tan(fov / 2);
  const img = new Float64Array(w * h * 3);
  const sky = skyColors();

  // 背景
  for (let y = 0; y < h; y++) {
    const t = y / h;
    const c = t < 0.55
      ? [sky.top[0] + (sky.mid[0] - sky.top[0]) * (t / 0.55), sky.top[1] + (sky.mid[1] - sky.top[1]) * (t / 0.55), sky.top[2] + (sky.mid[2] - sky.top[2]) * (t / 0.55)]
      : [sky.mid[0] + (sky.hor[0] - sky.mid[0]) * ((t - 0.55) / 0.45), sky.mid[1] + (sky.hor[1] - sky.mid[1]) * ((t - 0.55) / 0.45), sky.mid[2] + (sky.hor[2] - sky.mid[2]) * ((t - 0.55) / 0.45)];
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2];
    }
  }
  // 星
  for (let i = 0; i < 240; i++) {
    const sx = Math.floor(hashRand(i, 7) * w);
    const sy = Math.floor(hashRand(i, 13) * h * 0.7);
    const b = 120 + hashRand(i, 29) * 135;
    const idx = (sy * w + sx) * 3;
    if (idx >= 0 && idx < img.length - 2) { img[idx] = b; img[idx + 1] = b; img[idx + 2] = b * 0.95; }
  }

  // 收集可见面
  const quads = [];
  for (const v of voxels) {
    const rec = baked.get(`${v.x},${v.y},${v.z}`);
    if (!rec) continue;
    for (const key of Object.keys(rec)) {
      const nrm = { px: [1, 0, 0], nx: [-1, 0, 0], py: [0, 1, 0], ny: [0, -1, 0], pz: [0, 0, 1], nz: [0, 0, -1] }[key];
      const fc = { x: v.x + 0.5 + nrm[0] * 0.5, y: v.y + 0.5 + nrm[1] * 0.5, z: v.z + 0.5 + nrm[2] * 0.5 };
      const toCam = { x: cam.pos.x - fc.x, y: cam.pos.y - fc.y, z: cam.pos.z - fc.z };
      if (nrm[0] * toCam.x + nrm[1] * toCam.y + nrm[2] * toCam.z <= 0) continue;
      // 四角投影
      const CORN = {
        px: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
        nx: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
        py: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
        ny: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]],
        pz: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]],
        nz: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
      }[key];
      const pts = [];
      let depth = 0;
      for (const c of CORN) {
        const wx = v.x + c[0], wy = v.y + c[1], wz = v.z + c[2];
        const dx = wx - cam.pos.x, dy = wy - cam.pos.y, dz = wz - cam.pos.z;
        const cz = dx * cam.fwd.x + dy * cam.fwd.y + dz * cam.fwd.z;
        if (cz < 0.5) { depth = -1; break; }
        const cx = dx * cam.right.x + dy * cam.right.y + dz * cam.right.z;
        const cy = dx * cam.up.x + dy * cam.up.y + dz * cam.up.z;
        pts.push({ x: w / 2 + (cx / cz) * focal, y: h / 2 - (cy / cz) * focal });
        depth += cz;
      }
      if (depth < 0) continue;
      quads.push({ depth: depth / 4, pts, col: rec[key] });
    }
  }
  quads.sort((a, b) => b.depth - a.depth);

  // 填充
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = img[i * 3]; rgba[i * 4 + 1] = img[i * 3 + 1]; rgba[i * 4 + 2] = img[i * 3 + 2]; rgba[i * 4 + 3] = 255;
  }
  for (const q of quads) {
    fillTri(rgba, w, h, q.pts[0], q.pts[1], q.pts[2], q.col);
    fillTri(rgba, w, h, q.pts[0], q.pts[2], q.pts[3], q.col);
  }
  return { w, h, rgba };
}

function fillTri(rgba, w, h, a, b, c, col) {
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
  if (minX > maxX || minY > maxY) return;
  const d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(d) < 1e-9) return;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / d;
      const w1 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / d;
      const w2 = 1 - w0 - w1;
      if (w0 < -0.001 || w1 < -0.001 || w2 < -0.001) continue;
      const i = (y * w + x) * 4;
      rgba[i] = col[0]; rgba[i + 1] = col[1]; rgba[i + 2] = col[2]; rgba[i + 3] = 255;
    }
  }
}
