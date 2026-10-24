// 把关键地标投影到画面坐标（含地形遮挡检测），用于渲染前定机位。
import { makeProjector, occluded, SUN, SUN_EL, SUN_AZ, landmarks } from './geom.mjs';

const CAMERAS = {
  0: { pos: [112, 50, 214], target: [136, 32, 102], fov: 50 },
  1: { pos: [112, 50, 214], target: [136, 32, 102], fov: 44 },
  2: { pos: [112, 44, 206], target: [146, 34, 96], fov: 42 },
  3: { pos: [112, 62, 214], target: [132, 30, 100], fov: 52 },
  4: { pos: [86, 40, 200], target: [128, 34, 108], fov: 48 },
  5: { pos: [150, 46, 190], target: [136, 36, 92], fov: 44 },
};

const pts = landmarks();
const which = process.argv[2] !== undefined ? process.argv[2].split(',') : ['0'];

console.log(`太阳：仰角 ${SUN_EL}° 方位 ${SUN_AZ}°（正北为 0，向西为正）  画幅 1.6:1`);
for (const i of which) {
  const c = CAMERAS[i];
  if (!c) { console.log('没有 cam' + i); continue; }
  const proj = makeProjector(c.pos, c.target, c.fov);
  console.log(`\n=== cam${i}  pos=${JSON.stringify(c.pos)} target=${JSON.stringify(c.target)} fov=${c.fov} ===`);
  for (const [k, p] of Object.entries(pts)) {
    const q = k === '太阳'
      ? proj([c.pos[0] + SUN[0] * 900, c.pos[1] + SUN[1] * 900, c.pos[2] + SUN[2] * 900])
      : proj(p);
    let mark = q.x < 0 || q.x > 1 || q.y < 0 || q.y > 1 ? '  ✗ 出画' : '';
    if (!mark && k !== '太阳') {
      const oc = occluded(c.pos, p);
      if (oc > 0.35) mark = '  ⚠ 被地形挡住@' + Math.round(oc * 100) + '%';
    }
    console.log(`${k.padEnd(12)} x=${(q.x * 100).toFixed(1)}%  y=${(q.y * 100).toFixed(1)}%  dist=${q.dist.toFixed(0)}${mark}`);
  }
  const h = proj([c.pos[0], c.pos[1], c.pos[2] - 900]);
  console.log(`地平线       y=${(h.y * 100).toFixed(1)}%`);
}
