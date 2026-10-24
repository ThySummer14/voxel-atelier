// raster2png.mjs — 离线出图：node tools/raster2png.mjs --out /tmp/p.png --yaw 0 --pitch 25 --dist 110
import { writeFileSync } from 'node:fs';
import { build } from '../js/sculpt.js';
import { bakeAll } from '../js/bake.js';
import { rasterize, encodePng } from '../js/raster.js';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const num = (k, d) => parseFloat(get(k, d));

const out = get('out', '/tmp/houfeng.png');
const yaw = num('yaw', -32), pitch = num('pitch', 24), dist = num('dist', 120);
const look = (get('look', '0,10,0')).split(',').map(Number);
const W = num('w', 960), H = num('h', 600);

const t0 = Date.now();
const { static: parts, dynamic, meta } = build();
const voxels = [
  ...parts.flatMap((p) => p.voxels),
  ...dynamic.jaws.flatMap((j) => j.voxels.map((v) => ({ ...v, x: v.x + j.pivot.x, y: v.y + j.pivot.y, z: v.z + j.pivot.z }))),
  ...dynamic.balls.flatMap((b) => b.voxels),
  ...dynamic.toadGlows.flatMap((g) => g.voxels),
  ...dynamic.fires.flatMap((f) => f.voxels),
];
const baked = bakeAll(voxels, { firePos: meta.firePos });
const { w, h, rgba } = rasterize(baked, voxels, { yaw, pitch, dist, target: { x: look[0], y: look[1], z: look[2] }, w: W, h: H });
const png = encodePng(w, h, rgba);
writeFileSync(out, png);
console.log(`voxels=${voxels.length} bakedFaces=${baked.size} png=${(png.length / 1024).toFixed(0)}KB ${W}x${H} ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${out}`);
