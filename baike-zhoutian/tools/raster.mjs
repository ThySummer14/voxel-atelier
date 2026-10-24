// 软光栅：无 three 依赖，Node 直接出图（PPM）。与浏览器共用 sculpt/mesh/pose。
// 用法：node tools/raster.mjs --out /tmp/a.ppm --cam cover --time 70000 [--night] [--only k1,k2]
import { buildAll } from '../js/mech.js';
import { buildScoopWater } from '../js/mech.js';
import { mergeAll, statsOf } from '../js/mesh.js';
import { pose } from '../js/pose.js';
import { scoopFill, wheelStepIndex } from '../js/pose.js';
import { PAL } from '../js/palette.js';

const args = Object.fromEntries(process.argv.slice(2).map((s, i, a) =>
  s.startsWith('--') ? [s.slice(2), a[i + 1]] : []).filter(x => x[0]));

const CAMS = {
  cover: { yaw: 38, pitch: 16, dist: 330, look: [0, 52, 0], fov: 42 },
  wide: { yaw: 25, pitch: 10, dist: 420, look: [0, 50, 0], fov: 40 },
  east: { yaw: 88, pitch: 12, dist: 240, look: [0, 36, 0], fov: 42 },
  cut: { yaw: 62, pitch: 22, dist: 210, look: [0, 34, 0], fov: 40 },
  wheel: { yaw: 128, pitch: 14, dist: 150, look: [10, 30, -8], fov: 40 },
  globe: { yaw: 8, pitch: -2, dist: 95, look: [0, 76, 10], fov: 38 },
  arm: { yaw: 30, pitch: 26, dist: 150, look: [0, 118, 0], fov: 42 },
  tube: { yaw: 0, pitch: -34.8, dist: 42, look: [0, 114, 6], fov: 30 },
  night: { yaw: 205, pitch: 12, dist: 340, look: [0, 54, 0], fov: 42 },
};

const camName = args.cam || 'cover';
const cam = CAMS[camName] || CAMS.cover;
const t = Number(args.time || 70000);
const night = 'night' in args;
const W = 880, H = 600;

const parts = buildAll();
const fill = scoopFill(t);
const stepIdx = wheelStepIndex(t);
const scoopIdx = parts.findIndex(p => p.key === 'scoopWater');
parts[scoopIdx] = buildScoopWater(fill, Math.PI / 2);
const meshes = mergeAll(parts);

const tform = pose(t, { ext: [1, 1, 1, 1, 1].map(() => 0), doors: [0, 0, 0, 0, 0] });
const only = args.only ? new Set(args.only.split(',')) : null;

function rotPoint(p, axis, center, ang) {
  if (!ang) return p;
  const c = Math.cos(ang), s = Math.sin(ang);
  const [ax, ay, az] = axis;
  let x = p[0] - center[0], y = p[1] - center[1], z = p[2] - center[2];
  const d = ax * x + ay * y + az * z;
  const rx = x * c + (ay * z - az * y) * s + ax * d * (1 - c);
  const ry = y * c + (az * x - ax * z) * s + ay * d * (1 - c);
  const rz = z * c + (ax * y - ay * x) * s + az * d * (1 - c);
  return [rx + center[0], ry + center[1], rz + center[2]];
}

const eyeDir = [
  Math.cos(cam.pitch * Math.PI / 180) * Math.sin(cam.yaw * Math.PI / 180),
  Math.sin(cam.pitch * Math.PI / 180),
  Math.cos(cam.pitch * Math.PI / 180) * Math.cos(cam.yaw * Math.PI / 180),
];
const eye = [
  cam.look[0] + cam.dist * eyeDir[0],
  cam.look[1] + cam.dist * eyeDir[1],
  cam.look[2] + cam.dist * eyeDir[2],
];
const fwd = [
  cam.look[0] - eye[0], cam.look[1] - eye[1], cam.look[2] - eye[2],
].map(v => v / cam.dist);
const right = [-fwd[2], 0, fwd[0]].map(v => v / (Math.hypot(fwd[2], 0, fwd[0]) || 1));
const up = [
  right[1] * fwd[2] - right[2] * fwd[1],
  right[2] * fwd[0] - right[0] * fwd[2],
  right[0] * fwd[1] - right[1] * fwd[0],
];
const focal = (H / 2) / Math.tan(cam.fov * Math.PI / 360);

function project(p) {
  const dx = p[0] - eye[0], dy = p[1] - eye[1], dz = p[2] - eye[2];
  const z = dx * fwd[0] + dy * fwd[1] + dz * fwd[2];
  if (z <= 1) return null;
  const x = dx * right[0] + dy * right[1] + dz * right[2];
  const y = dx * up[0] + dy * up[1] + dz * up[2];
  return [W / 2 + x * focal / z, H / 2 - y * focal / z, z];
}

const quads = [];
for (const m of meshes) {
  if (only && !only.has(m.key)) continue;
  const tf = tform[m.key];
  const pos = m.pos, col = night ? m.colN : m.colD, idx = m.idx;
  const n = idx.length;
  for (let i = 0; i < n; i += 6) {
    const vs = [];
    let ok = true;
    for (let k = 0; k < 4; k++) {
      const vi = idx[i + [0, 1, 2, 3][k]] * 3;
      let p = [pos[vi], pos[vi + 1], pos[vi + 2]];
      if (tf) {
        if (tf.rot) p = rotPoint(p, tf.rot.axis, tf.rot.center, tf.rot.angle);
        if (tf.pos) p = [p[0] + tf.pos[0], p[1] + tf.pos[1], p[2] + tf.pos[2]];
      }
      const pr = project(p);
      if (!pr) { ok = false; break; }
      vs.push(pr);
    }
    if (!ok) continue;
    const z = (vs[0][2] + vs[1][2] + vs[2][2] + vs[3][2]) / 4;
    const ci = idx[i] * 3;
    quads.push({ vs, z, r: col[ci], g: col[ci + 1], b: col[ci + 2] });
  }
}
quads.sort((a, b) => b.z - a.z);

const fb = new Float32Array(W * H * 3);
const bg = night ? [10 / 255, 14 / 255, 28 / 255] : [150 / 255, 178 / 255, 196 / 255];
for (let i = 0; i < W * H; i++) {
  fb[i * 3] = bg[0]; fb[i * 3 + 1] = bg[1]; fb[i * 3 + 2] = bg[2];
}

function fillTri(vs, col) {
  const minY = Math.max(0, Math.floor(Math.min(vs[0][1], vs[1][1], vs[2][1])));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(vs[0][1], vs[1][1], vs[2][1])));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let e = 0; e < 3; e++) {
      const a = vs[e], b = vs[(e + 1) % 3];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
    }
    if (xs.length < 2) continue;
    xs.sort((p, q) => p - q);
    const x0 = Math.max(0, Math.floor(xs[0]));
    const x1 = Math.min(W - 1, Math.ceil(xs[1]));
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 3;
      fb[i] = col.r; fb[i + 1] = col.g; fb[i + 2] = col.b;
    }
  }
}

for (const q of quads) {
  fillTri([q.vs[0], q.vs[1], q.vs[2]], q);
  fillTri([q.vs[0], q.vs[2], q.vs[3]], q);
}

const st = statsOf(meshes);
const out = args.out || '/tmp/baike.ppm';
let s = `P6\n${W} ${H}\n255\n`;
const buf = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  buf[i * 3] = Math.max(0, Math.min(255, Math.round(fb[i * 3] * 255)));
  buf[i * 3 + 1] = Math.max(0, Math.min(255, Math.round(fb[i * 3 + 1] * 255)));
  buf[i * 3 + 2] = Math.max(0, Math.min(255, Math.round(fb[i * 3 + 2] * 255)));
}
const { writeFileSync } = await import('fs');
writeFileSync(out, Buffer.concat([Buffer.from(s), buf]));
let msg = `raster ok: ${out} quads=${quads.length}/${st.quads} cells=${st.cells} parts=${st.parts} cam=${camName} t=${t}${night ? ' night' : ''}`;
if (args.marks) {
  for (const m of args.marks.split(';')) {
    const [x, y, z] = m.split(',').map(Number);
    const pr = project([x, y, z]);
    if (!pr) { msg += `\nmark ${m} => behind camera`; continue; }
    const px = Math.max(0, Math.min(W - 1, Math.round(pr[0])));
    const py = Math.max(0, Math.min(H - 1, Math.round(pr[1])));
    const i = (py * W + px) * 3;
    msg += `\nmark ${m} => (${px},${py}) rgb(${buf[i]},${buf[i + 1]},${buf[i + 2]})`;
  }
}
console.log(msg);
