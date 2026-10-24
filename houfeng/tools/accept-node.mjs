// accept-node.mjs — 离线验收：设计恒等式 / 几何不变量 / 烘焙 / 光栅冒烟
// 全部纯 Node，不启浏览器。断言失败即非零退出。
import { build } from '../js/sculpt.js';
import { bakeAll } from '../js/bake.js';
import { rasterize, encodePng } from '../js/raster.js';
import { writeFileSync } from 'node:fs';
import { DIRS, NOTES, QUAKE_WORDS, L, PAL, angOf, dirVec } from '../js/spec.js';

let passed = 0, failed = 0;
function ok(cond, name, detail = '') {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.error(`  ✗ ${name} ${detail}`); }
}
const near = (a, b, eps = 0.6) => Math.abs(a - b) <= eps;

console.log('─ spec 恒等式 ─');
ok(DIRS.length === 8, '八方齐全');
ok(DIRS.every((d, i) => d.angle === i * 45), '方位角 45° 等差');
ok(NOTES.length === 8 && new Set(NOTES).size === 8, '八音互不相同');
ok(NOTES.every((f, i) => i === 0 || f > NOTES[i - 1]), '八音上行');
ok(NOTES[7] / NOTES[0] > 2.4 && NOTES[7] / NOTES[0] < 2.7, '音域两个八度强', (NOTES[7] / NOTES[0]).toFixed(2));
ok(Object.keys(QUAKE_WORDS).length === 9, '震级九档');
for (let k = 0; k < 8; k++) {
  const v = dirVec(k);
  ok(near(Math.hypot(v.x, v.z), 1, 1e-6), `方位 ${k} 单位向量`);
}

console.log('─ 几何不变量 ─');
const { static: parts, dynamic, meta } = build();
const all = [
  ...parts.flatMap((p) => p.voxels),
  ...dynamic.jaws.flatMap((j) => j.voxels.map((v) => ({ ...v, x: v.x + j.pivot.x, y: v.y + j.pivot.y, z: v.z + j.pivot.z }))),
  ...dynamic.balls.flatMap((b) => b.voxels),
  ...dynamic.toadGlows.flatMap((g) => g.voxels),
  ...dynamic.fires.flatMap((f) => f.voxels),
];
ok(all.length > 15000 && all.length < 32000, '体素总量在预算内', all.length);
const rMax = Math.max(...all.map((v) => Math.hypot(v.x, v.z)));
const yMin = Math.min(...all.map((v) => v.y)), yMax = Math.max(...all.map((v) => v.y));
ok(rMax < 45, '半径有界', rMax);
ok(yMin > -14 && yMax < 34, '高度有界', `${yMin}..${yMax}`);

for (let k = 0; k < 8; k++) {
  const head = parts.find((p) => p.key === `head${k}`).voxels.length;
  const neck = parts.find((p) => p.key === `neck${k}`).voxels.length;
  const toad = parts.find((p) => p.key === `toad${k}`).voxels.length;
  ok(head >= 60 && neck >= 30 && toad >= 60, `龙${k}/蟾${k} 体量`, `head=${head} neck=${neck} toad=${toad}`);
  // 丸落在蟾口正上方（水平偏差 < 3.2 格）
  const dx = meta.ballHome[k].x - meta.toadMouth[k].x;
  const dz = meta.ballHome[k].z - meta.toadMouth[k].z;
  ok(Math.hypot(dx, dz) < 3.2, `丸${k}对位蟾口`, `Δ=${Math.hypot(dx, dz).toFixed(2)}`);
  // 颚片径向包在枢轴外（切向 ±1）
  const jaw = dynamic.jaws.find((j) => j.k === k);
  const dv = dirVec(k);
  const bad = jaw.voxels.filter((v) => {
    const r = v.x * dv.x + v.z * dv.z;        // 径向（相对枢轴，含斜向取整）
    const t = -v.x * dv.z + v.z * dv.x;       // 切向
    return r < -0.5 || r > 3.0 || Math.abs(t) > 1.5;
  }).length;
  ok(bad === 0, `颚${k}绕枢轴`, bad);
  // 球在龙口高度
  ok(meta.ballHome[k].y > L.dragonY + 1 && meta.ballHome[k].y < L.dragonY + 4, `丸${k}含于龙口`);
}
// 剖面：中段在开窗区无体素
const mid = parts.find((p) => p.key === 'shellMid').voxels;
const inWedgeVox = mid.filter((v) => {
  const a = Math.min(angOf(v.x, v.z), 360 - angOf(v.x, v.z));
  return a <= L.wedgeHalf && v.y >= L.wedgeY0 && v.y <= L.wedgeY1;
});
ok(inWedgeVox.length === 0, '剖面中段无残留', inWedgeVox.length);
// 都柱居中
const pillar = parts.find((p) => p.key === 'pillar').voxels;
const offAxis = pillar.filter((v) => Math.hypot(v.x, v.z) > 5.5).length;
ok(offAxis === 0, '都柱居中', offAxis);
// 八龙体量一致（旋转对称）
const headCounts = [...Array(8)].map((_, k) => parts.find((p) => p.key === `head${k}`).voxels.length);
ok(Math.max(...headCounts) - Math.min(...headCounts) <= 20, '八龙体量一致（对角取整差）', headCounts);
const toadCounts = [...Array(8)].map((_, k) => parts.find((p) => p.key === `toad${k}`).voxels.length);
ok(Math.max(...toadCounts) - Math.min(...toadCounts) <= 20, '八蟾体量一致（对角取整差）', toadCounts);

console.log('─ 烘焙 ─');
const baked = bakeAll(all, { firePos: meta.firePos });
let badColor = 0, faceCount = 0;
for (const v of all) {
  const rec = baked.get(`${v.x},${v.y},${v.z}`);
  if (!rec) continue;
  faceCount += Object.keys(rec).length;
  for (const c of Object.values(rec)) {
    if (c.some((x) => !(x >= 0 && x <= 255))) badColor++;
  }
}
ok(faceCount > 15000, '暴露面数量充足', faceCount);
ok(badColor === 0, '颜色值域合法', badColor);
// 自发光件满亮
const eyeRec = baked.get(`${Math.round(meta.ballHome[0].x)},${Math.round(meta.ballHome[0].y)},${Math.round(meta.ballHome[0].z)}`);
ok(eyeRec && Object.values(eyeRec).every((c) => c[0] > 200), '铜丸受光可见');
// 离线在线共用同一组常数
ok(Array.isArray(L) === false && L.R === 15, '布局常数');

console.log('─ 光栅冒烟 ─');
function pngStats(view) {
  const { w, h, rgba } = rasterize(baked, all, view);
  let sum = 0, sum2 = 0, bright = 0, n = 0;
  for (let y = Math.floor(h * 0.3); y < h * 0.8; y += 2) {
    for (let x = Math.floor(w * 0.3); x < w * 0.7; x += 2) {
      const i = (y * w + x) * 4;
      const lum = 0.3 * rgba[i] + 0.6 * rgba[i + 1] + 0.1 * rgba[i + 2];
      sum += lum; sum2 += lum * lum; n++;
      if (lum > 60) bright++;
    }
  }
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  return { mean, sd, brightRatio: bright / n, w, h, rgba };
}
const s1 = pngStats({ yaw: -35, pitch: 18, dist: 118, target: { x: 0, y: 12, z: 0 }, w: 480, h: 300 });
ok(s1.brightRatio > 0.25, '默认视角主体可见', s1.brightRatio.toFixed(2));
ok(s1.sd > 12, '画面对比度正常', s1.sd.toFixed(1));
const s2 = pngStats({ yaw: 160, pitch: 30, dist: 130, target: { x: 0, y: 12, z: 0 }, w: 480, h: 300 });
ok(s2.brightRatio > 0.2, '另一视角同样成立', s2.brightRatio.toFixed(2));
const png = encodePng(s1.w, s1.h, s1.rgba);
ok(png.length > 20000, 'PNG 非空', png.length);
writeFileSync('/tmp/accept-node.png', png);

console.log(`\n${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
