// 离线体素光栅预览器（CLI）。秒级出图，用来迭代几何，不必开浏览器。
//   node tools/raster.mjs --out /tmp/p.png --w 520 --yaw -32 --pitch 38 --dist 470 --look 0,50,4
//   --only cageFrame,balance  只雕这些零件（其余留空，便于单件体检）
import { renderPng } from './lib-raster.mjs';
import { buildScene } from '../js/sculpt/parts.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const num = (k, d) => Number(arg(k, d));

const t0 = Date.now();
const only = arg('only', '');
const scene = buildScene({ embedHairspring: true, only: only ? only.split(',') : null });
const buildMs = Date.now() - t0;
const out = arg('out', '/tmp/voxel-preview.png');
const img = renderPng({
  scene, W: num('w', 520), H: num('h', 0) || undefined, ss: num('ss', 2),
  yaw: num('yaw', -32), pitch: num('pitch', 38), dist: num('dist', 470),
  fov: num('fov', 31), look: arg('look', '0,50,4').split(',').map(Number),
  lume: num('lume', 0),
});
img.saveTo(out);
console.log(JSON.stringify({
  out, W: img.W, H: img.H, buildMs, totalMs: Date.now() - t0,
  filled: scene.v.filled, hits: img.hits,
  cam: { yaw: num('yaw', -32), pitch: num('pitch', 38), dist: num('dist', 470), look: arg('look', '0,50,4') },
}));
