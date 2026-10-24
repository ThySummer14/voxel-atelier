// 离线体素 DDA 光栅器（可被 CLI 与验收脚本共用）。
// 与浏览器共用 js/lighting.js，所以这里看到的明暗就是最终渲染的明暗。
import zlib from 'node:zlib';
import fs from 'node:fs';
import { PALETTE, PAL_SPEC, PAL_EMIS, EMPTY } from '../js/palette.js';
import { shadePixel, BG } from '../js/lighting.js';
import { CX, CZ } from '../js/sculpt/spec.js';
import { buildScene } from '../js/sculpt/parts.js';

const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };

export function renderPng(o) {
  const scene = o.scene || buildScene({ embedHairspring: true });
  const v = scene.v;
  const { GX, GY, GZ } = v;
  const cell = v.cell;
  const W = o.W || 520, H = o.H || Math.round(W * 0.62), SS = o.ss || 2;
  const yaw = (o.yaw ?? -32) * Math.PI / 180;
  const pitch = (o.pitch ?? 38) * Math.PI / 180;
  const dist = o.dist ?? 470;
  const fov = (o.fov ?? 31) * Math.PI / 180;
  const look = o.look || [0, 50, 4];
  const lume = o.lume || 0;

  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const eye = [look[0] + dist * cp * Math.sin(yaw), look[1] + dist * sp, look[2] + dist * cp * Math.cos(yaw)];
  const fwd = norm3(look[0] - eye[0], look[1] - eye[1], look[2] - eye[2]);
  const right = norm3(...cross3(fwd, [0, 1, 0]));
  const up = cross3(right, fwd);
  const tan = Math.tan(fov / 2), asp = W / H;
  const rgb = new Float64Array(W * H * 3);
  const tmp = [0, 0, 0];
  let hits = 0;

  const solidAt = (ix, iy, iz) => {
    if (ix < 0 || iy < 0 || iz < 0 || ix >= GX || iy >= GY || iz >= GZ) return 0;
    return cell[(ix + GX * iz) * GY + iy] === EMPTY ? 0 : 1;
  };

  function castRay(rx, ry, rz, dx, dy, dz) {
    const x0 = rx + CX, y0 = ry, z0 = rz + CZ;
    const idx = dx === 0 ? 1e9 : 1 / dx, idy = dy === 0 ? 1e9 : 1 / dy, idz = dz === 0 ? 1e9 : 1 / dz;
    let ta = Math.max(Math.min((0 - x0) * idx, (GX - x0) * idx),
      Math.min((0 - y0) * idy, (GY - y0) * idy),
      Math.min((0 - z0) * idz, (GZ - z0) * idz));
    const tb = Math.min(Math.max((GX - x0) * idx, (0 - x0) * idx),
      Math.max((GY - y0) * idy, (0 - y0) * idy),
      Math.max((GZ - z0) * idz, (0 - z0) * idz));
    if (tb < 0 || tb < ta) return null;
    ta = Math.max(ta, 0);
    let x = x0 + dx * (ta + 1e-6), y = y0 + dy * (ta + 1e-6), z = z0 + dz * (ta + 1e-6);
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    let ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const tdx = Math.abs(idx), tdy = Math.abs(idy), tdz = Math.abs(idz);
    let tmx = (sx > 0 ? ix + 1 - x : x - ix) * tdx;
    let tmy = (sy > 0 ? iy + 1 - y : y - iy) * tdy;
    let tmz = (sz > 0 ? iz + 1 - z : z - iz) * tdz;
    let axis = -1, sgn = 1, t = ta;
    for (let i = 0; i < 6000; i++) {
      if (t > tb) return null;
      if (ix >= 0 && iy >= 0 && iz >= 0 && ix < GX && iy < GY && iz < GZ) {
        const c = cell[(ix + GX * iz) * GY + iy];
        if (c !== EMPTY) return { c, ix, iy, iz, axis, sgn, t };
      }
      if (tmx < tmy && tmx < tmz) { t = tmx; ix += sx; tmx += tdx; axis = 0; sgn = -sx; }
      else if (tmy < tmz) { t = tmy; iy += sy; tmy += tdy; axis = 1; sgn = -sy; }
      else { t = tmz; iz += sz; tmz += tdz; axis = 2; sgn = -sz; }
    }
    return null;
  }

  function aoAt(ix, iy, iz, axis, sgn, dx, dy, dz) {
    const [u, w] = axis === 0 ? [1, 2] : axis === 1 ? [0, 2] : [0, 1];
    const d = [dx, dy, dz];
    const pu = d[u] >= 0 ? -1 : 1, pw = d[w] >= 0 ? -1 : 1;
    const off = sgn > 0 ? 1 : -1;
    const a = [ix, iy, iz]; a[u] += pu; a[axis] += off;
    const b = [ix, iy, iz]; b[w] += pw; b[axis] += off;
    const c = [ix, iy, iz]; c[u] += pu; c[w] += pw; c[axis] += off;
    const s1 = solidAt(a[0], a[1], a[2]), s2 = solidAt(b[0], b[1], b[2]), sc = solidAt(c[0], c[1], c[2]);
    return Math.min(3, (s1 && s2) ? 3 : s1 + s2 + sc);
  }

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = ((px + (sx + 0.5) / SS) / W) * 2 - 1;
          const vv = 1 - ((py + (sy + 0.5) / SS) / H) * 2;
          const d = norm3(
            fwd[0] + u * tan * asp * right[0] + vv * tan * up[0],
            fwd[1] + u * tan * asp * right[1] + vv * tan * up[1],
            fwd[2] + u * tan * asp * right[2] + vv * tan * up[2]);
          const h = castRay(eye[0], eye[1], eye[2], d[0], d[1], d[2]);
          if (!h) { r += BG[0]; g += BG[1]; b += BG[2]; continue; }
          hits++;
          const n = [0, 0, 0]; n[h.axis] = h.sgn;
          const col = PALETTE[h.c];
          const ao = aoAt(h.ix, h.iy, h.iz, h.axis, h.sgn, d[0], d[1], d[2]);
          shadePixel([col[0] / 255, col[1] / 255, col[2] / 255], n, ao, PAL_SPEC[h.c], PAL_EMIS[h.c], tmp);
          const e = PAL_EMIS[h.c];
          r += tmp[0] * (1 - lume) + (e * e * 0.9) * lume;
          g += tmp[1] * (1 - lume) + (e * e * 1.0) * lume;
          b += tmp[2] * (1 - lume) + (e * e * 0.62) * lume;
        }
      }
      const n = SS * SS, o3 = (py * W + px) * 3;
      rgb[o3] = r / n; rgb[o3 + 1] = g / n; rgb[o3 + 2] = b / n;
    }
  }
  return {
    rgb, W, H, hits,
    saveTo(path) { fs.mkdirSync(require_dir(path), { recursive: true }); fs.writeFileSync(path, encodePng(W, H, rgb)); return path; },
  };
}
function require_dir(p) { const i = p.lastIndexOf('/'); return i > 0 ? p.slice(0, i) : '.'; }

export function encodePng(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  let p = 0;
  for (let y = 0; y < h; y++) {
    raw[p++] = 0;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 3;
      raw[p++] = Math.max(0, Math.min(255, Math.round(rgb[o] * 255)));
      raw[p++] = Math.max(0, Math.min(255, Math.round(rgb[o + 1] * 255)));
      raw[p++] = Math.max(0, Math.min(255, Math.round(rgb[o + 2] * 255)));
    }
  }
  const crcTable = makeCrc();
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    let c = 0xffffffff;
    for (const b of td) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    const crc = Buffer.alloc(4); crc.writeUInt32BE((c ^ 0xffffffff) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function makeCrc() {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
}
