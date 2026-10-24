/* 离线预览器：雕刻 -> 三角光栅 -> PNG（无需浏览器，秒级迭代）
 * 用法: node tools/preview.mjs out.png [--w 900] [--h 600] [--az 40] [--el 12] [--dist 700]
 */
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { buildMeshes, VIEW_CENTER } from "../js/sculpt/build.js";
import { KIND } from "../js/palette.js";

const argv = process.argv.slice(2);
const outPath = argv[0] || "output/preview.png";
const arg = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? parseFloat(argv[i + 1]) : d;
};
const flag = (k) => argv.includes(k);

const SS = arg("--ss", 2) | 0;
const OW = arg("--w", 900) | 0;
const OH = arg("--h", 600) | 0;
const W = OW * SS, H = OH * SS;
const az = (arg("--az", 38) * Math.PI) / 180;
const el = (arg("--el", 13) * Math.PI) / 180;
const dist = arg("--dist", 640);
const tx = arg("--tx", 0);
const tz = arg("--tz", 0);
const fy = arg("--fy", 120);
const fov = (arg("--fov", 30) * Math.PI) / 180;
const sunAz = (arg("--sun-az", -55) * Math.PI) / 180;
const sunEl = (arg("--sun-el", 34) * Math.PI) / 180;

/* ---------- 场景 ---------- */
const t0 = Date.now();
const scene = buildMeshes({});
const tBuild = Date.now() - t0;

/* 分块装配：把每块的六个网格组摊平成一张绘制列表。--only 可只画某几组，用来定位伪影 */
const onlyList = flag("--only") ? argv[argv.indexOf("--only") + 1].split(",") : null;
const groups = [];
for (const ch of scene.chunks) {
  for (const [k, kind] of [["matte", KIND.SOLID], ["gloss", KIND.SOLID], ["cloud", KIND.SOLID], ["fall", KIND.ALPHA], ["spray", KIND.ALPHA], ["far", KIND.SOLID], ["emit", KIND.EMIT], ["emitSoft", KIND.EMIT], ["emitCore", KIND.EMIT], ["mist", KIND.ALPHA], ["wheel", KIND.SOLID]]) {
    if (onlyList && !onlyList.includes(k)) continue;
    if (ch.parts[k] && ch.parts[k].stats.faces) groups.push({ data: ch.parts[k], kind, name: k });
  }
}
let totalFaces = 0;
const byKind = {};
for (const g of groups) { totalFaces += g.data.stats.faces; byKind[g.name] = (byKind[g.name] || 0) + g.data.stats.faces; }
const tMesh = Date.now() - t0;

const eye = [
  tx + Math.cos(el) * Math.sin(az) * dist,
  fy + Math.sin(el) * dist,
  tz + Math.cos(el) * Math.cos(az) * dist,
];
const target = [tx, fy, tz];
let f = [target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]];
const fl = Math.hypot(...f); f = f.map((v) => v / fl);
let up0 = [0, 1, 0];
let r = [f[1] * up0[2] - f[2] * up0[1], f[2] * up0[0] - f[0] * up0[2], f[0] * up0[1] - f[1] * up0[0]];
let rl = Math.hypot(...r); r = rl > 1e-6 ? r.map((v) => v / rl) : [1, 0, 0];
const u = [
  r[1] * f[2] - r[2] * f[1],
  r[2] * f[0] - r[0] * f[2],
  r[0] * f[1] - r[1] * f[0],
];
const tanHalf = Math.tan(fov / 2);
const near = 1;

const L = [Math.cos(sunEl) * Math.sin(sunAz), Math.sin(sunEl), Math.cos(sunEl) * Math.cos(sunAz)];
const SUN = [0.92, 0.88, 0.76];
const AMB = arg("--amb", 1.28);
/* 青绿山水的天光：绢色地平 + 花青天顶 */
const SKY_A = [0.62, 0.70, 0.68];
const GND = [0.62, 0.55, 0.42];
const FOG_COL = [0.86, 0.84, 0.74];
const FOG_K = flag("--nofog") ? 0 : 0.00042;
const EXPO = arg("--expo", 1.06);

function project(p, o) {
  const x = p[0] + VIEW_CENTER[0] - o[0], y = p[1] + VIEW_CENTER[1] - o[1], z = p[2] + VIEW_CENTER[2] - o[2];
  const vz = x * f[0] + y * f[1] + z * f[2];
  if (vz <= near) return null;
  const vx = x * r[0] + y * r[1] + z * r[2];
  const vy = x * u[0] + y * u[1] + z * u[2];
  const s = (W * 0.5) / tanHalf;
  return [W / 2 + (vx / vz) * s, H / 2 - (vy / vz) * s * (W / W), vz];
}

const zbuf = new Float32Array(W * H).fill(1e30);
const img = new Float32Array(W * H * 3);

/* 天空背景 */
for (let py = 0; py < H; py++) {
  const t = py / H;
  const k = Math.pow(1 - t, 0.8);
  const base = [
    GND[0] + (SKY_A[0] - GND[0]) * k,
    GND[1] + (SKY_A[1] - GND[1]) * k,
    GND[2] + (SKY_A[2] - GND[2]) * k,
  ];
  for (let px = 0; px < W; px++) {
    const i = (py * W + px) * 3;
    img[i] = base[0]; img[i + 1] = base[1]; img[i + 2] = base[2];
  }
}

function shade(nx, ny, nz, cr, cg, cb, kind, depth) {
  const ndl = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
  let amb;
  if (ny > 0.5) amb = SKY_A;
  else if (ny < -0.5) amb = GND;
  else amb = [(SKY_A[0] + GND[0]) / 2, (SKY_A[1] + GND[1]) / 2, (SKY_A[2] + GND[2]) / 2];
  const w = Math.max(0, (ndl + 0.22) / 1.22);
  let lr = AMB * amb[0] + w * SUN[0];
  let lg = AMB * amb[1] + w * SUN[1];
  let lb = AMB * amb[2] + w * SUN[2];
  // 背光侧补天光冷色 + 地面反弹
  const back = Math.max(0, -ndl);
  lr += back * 0.30; lg += back * 0.36; lb += back * 0.52;
  const bounce = Math.max(0, -ny) * 0.18;
  lr += bounce * 0.5; lg += bounce * 0.4; lb += bounce * 0.3;
  let R = cr * lr, G = cg * lg, B = cb * lb;
  if (kind === KIND.EMIT) { R = cr * 1.6; G = cg * 1.45; B = cb * 1.2; }
  if (FOG_K) {
    const fog = 1 - Math.exp(-FOG_K * depth);
    R += (FOG_COL[0] - R) * fog; G += (FOG_COL[1] - G) * fog; B += (FOG_COL[2] - B) * fog;
  }
  return [R, G, B];
}

const t1 = Date.now();
for (const grp of groups) {
  const d = grp.data;
  const nV = d.position.length / 3;
  const idx = d.index;
  for (let ti = 0; ti < idx.length; ti += 3) {
    const a = idx[ti], b = idx[ti + 1], c = idx[ti + 2];
    const pa = [d.position[a * 3], d.position[a * 3 + 1], d.position[a * 3 + 2]];
    const pb = [d.position[b * 3], d.position[b * 3 + 1], d.position[b * 3 + 2]];
    const pc = [d.position[c * 3], d.position[c * 3 + 1], d.position[c * 3 + 2]];
    const sa = project(pa, eye), sb = project(pb, eye), sc = project(pc, eye);
    if (!sa || !sb || !sc) continue;
    const area = (sb[0] - sa[0]) * (sc[1] - sa[1]) - (sc[0] - sa[0]) * (sb[1] - sa[1]);
    if (area === 0) continue;
    /* --nocull：判别实验。洞在关剔除后消失 = 绕序反；还在 = 面根本没进索引缓冲 */
    if (!flag("--nocull") && area < 0) continue;
    const nx = d.normal[a * 3] / 127, ny = d.normal[a * 3 + 1] / 127, nz = d.normal[a * 3 + 2] / 127;
    const cr = d.color[a * 3] / 255, cg = d.color[a * 3 + 1] / 255, cb2 = d.color[a * 3 + 2] / 255;
    /* --flat：不过光照，直接看烘焙顶点色。白还在=烘焙错；白消失=法线/光照错 */
    const col = flag("--flat") ? [cr, cg, cb2] : shade(nx, ny, nz, cr, cg, cb2, grp.kind, (sa[2] + sb[2] + sc[2]) / 3);
    const alpha = grp.kind === KIND.ALPHA ? 0.3 : 1;

    let minx = Math.max(0, Math.floor(Math.min(sa[0], sb[0], sc[0])));
    let maxx = Math.min(W - 1, Math.ceil(Math.max(sa[0], sb[0], sc[0])));
    let miny = Math.max(0, Math.floor(Math.min(sa[1], sb[1], sc[1])));
    let maxy = Math.min(H - 1, Math.ceil(Math.max(sa[1], sb[1], sc[1])));
    if (maxx < minx || maxy < miny) continue;
    const inv = 1 / area;
    const z0 = sa[2], z1 = sb[2], z2 = sc[2];
    for (let py = miny; py <= maxy; py++) {
      for (let px = minx; px <= maxx; px++) {
        const x = px + 0.5, y = py + 0.5;
        const w0 = (y - sb[1]) * (sc[0] - sb[0]) - (x - sb[0]) * (sc[1] - sb[1]);
        const w1 = (y - sc[1]) * (sa[0] - sc[0]) - (x - sc[0]) * (sa[1] - sc[1]);
        const w2 = area - w0 - w1;
        const inside = area > 0 ? (w0 >= 0 && w1 >= 0 && w2 >= 0) : (w0 <= 0 && w1 <= 0 && w2 <= 0);
        if (!inside) continue;
        const l0 = w0 * inv, l1 = w1 * inv, l2 = w2 * inv;
        const z = l0 * z0 + l1 * z1 + l2 * z2;
        const zi = py * W + px;
        if (z >= zbuf[zi]) continue;
        zbuf[zi] = z;
        const i = zi * 3;
        if (alpha >= 1) {
          img[i] = col[0]; img[i + 1] = col[1]; img[i + 2] = col[2];
        } else {
          img[i] += (col[0] - img[i]) * alpha;
          img[i + 1] += (col[1] - img[i + 1]) * alpha;
          img[i + 2] += (col[2] - img[i + 2]) * alpha;
        }
      }
    }
  }
}
const tDraw = Date.now() - t1;

/* ---------- PNG 输出 ---------- */
function tonemap(v) {
  v = Math.max(0, v);
  v = v / (1 + v * 0.30); // 轻色调映射
  v = Math.pow(v * EXPO, 0.90);
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
/* 降采样 */
const small = new Float32Array(OW * OH * 3);
for (let y = 0; y < OH; y++)
  for (let x = 0; x < OW; x++) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = 0; dy < SS; dy++)
      for (let dx = 0; dx < SS; dx++) {
        const i = ((y * SS + dy) * W + x * SS + dx) * 3;
        r += img[i]; g += img[i + 1]; b += img[i + 2]; n++;
      }
    const o = (y * OW + x) * 3;
    small[o] = r / n; small[o + 1] = g / n; small[o + 2] = b / n;
  }
const raw = Buffer.alloc(OH * (OW * 3 + 1));
for (let y = 0; y < OH; y++) {
  raw[y * (OW * 3 + 1)] = 0;
  for (let x = 0; x < OW; x++) {
    const i = (y * OW + x) * 3, o = y * (OW * 3 + 1) + 1 + x * 3;
    raw[o] = tonemap(small[i]); raw[o + 1] = tonemap(small[i + 1]); raw[o + 2] = tonemap(small[i + 2]);
  }
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(OW, 0); ihdr.writeUInt32BE(OH, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, png);

console.log(JSON.stringify({
  out: outPath, W: OW, H: OH, ss: SS,
  voxels: scene.stats.voxels, quads: scene.stats.faces, tris: scene.stats.triangles,
  groups: groups.length, byKind, totalFaces,
  buildMs: tBuild, meshMs: tMesh - tBuild, drawMs: tDraw,
}, null, 1));
