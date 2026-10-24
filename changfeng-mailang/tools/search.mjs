// 机位参数搜索：把构图目标写成区间，逐格搜出最合适的 pos/target/fov。
// 目标（画面横坐标 0..1，纵坐标 0=顶）：
//   地平线 0.33-0.42   太阳 y 0.06-0.20 / x 0.10-0.35
//   风车 帆顶 y 0.03-0.16、帆宽 ≥0.20、x 0.54-0.74
//   农舍 屋顶 x 0.10-0.32、y 0.28-0.50，且不被地形遮挡
//   小桥 y 0.70-0.96，且不被地形遮挡
import { makeProjector, occluded, SUN, SUN_EL, landmarks } from './geom.mjs';

const pts = landmarks();
const band = (v, a, b) => (v < a ? a - v : v > b ? v - b : 0);
const ok = (v, a, b) => v >= a && v <= b;

const cands = [];
for (const camX of [104, 108, 112]) {
  for (const camY of [44, 47, 50, 53]) {
    for (const camZ of [214, 218, 222]) {
      for (const tx of [136, 140, 144]) {
        for (const ty of [26, 29, 32]) {
          for (const fov of [46, 48, 50, 52]) {
            const pos = [camX, camY, camZ], target = [tx, ty, 102];
            const proj = makeProjector(pos, target, fov);
            const P = {};
            for (const [k, p] of Object.entries(pts)) {
              if (k === '太阳') P[k] = proj([pos[0] + SUN[0] * 900, pos[1] + SUN[1] * 900, pos[2] + SUN[2] * 900]);
              else P[k] = proj(p);
            }
            const horizon = proj([pos[0], pos[1], pos[2] - 900]);
            let pen = 0;
            pen += band(horizon.y, 0.33, 0.42) * 3;
            pen += band(P['太阳'].y, 0.06, 0.20) * 3 + band(P['太阳'].x, 0.10, 0.35) * 3;
            pen += band(P['风车帆顶'].y, 0.03, 0.16) * 4;
            pen += band(P['风车帆右'].x - P['风车帆左'].x, 0.20, 0.40) * 4;
            pen += band(P['风车轮毂'].x, 0.54, 0.74) * 3;
            pen += band(P['风车台地'].y, 0.40, 0.58) * 2;
            pen += band(P['农舍屋顶'].x, 0.10, 0.32) * 3 + band(P['农舍屋顶'].y, 0.28, 0.50) * 2;
            pen += band(P['小桥'].y, 0.70, 0.96) * 2;
            if (occluded(pos, pts['农舍屋顶'])) pen += 5;
            if (occluded(pos, pts['农舍左墙'])) pen += 5;
            if (occluded(pos, pts['小桥'])) pen += 6;
            if (occluded(pos, pts['风车轮毂'])) pen += 6;
            if (!ok(P['农舍屋顶'].x, -0.05, 1.05) || !ok(P['小桥'].x, -0.05, 1.05)) pen += 20;
            if (P['太阳'].y < 0) pen += 8;
            cands.push({ pen, pos, target, fov });
          }
        }
      }
    }
  }
}

cands.sort((a, b) => a.pen - b.pen);
console.log(`共 ${cands.length} 组，前 8：`);
const seen = new Set();
let shown = 0;
for (const c of cands) {
  const key = `${c.pos.join()}|${c.fov}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`pen=${c.pen.toFixed(3)}  pos=${JSON.stringify(c.pos)} target=${JSON.stringify(c.target)} fov=${c.fov}`);
  if (++shown >= 8) break;
}
console.log('\n太阳仰角 =', SUN_EL, '度');