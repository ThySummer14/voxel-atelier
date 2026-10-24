// 离线验收：唯一可信口径之一。node tools/accept-node.mjs
import { L, GEAR, WATER, shiChen, keText, gengOf, keIndex } from '../js/spec.js';
import { buildAll, buildScoopWater, buildTower } from '../js/mech.js';
import { buildEvents, derivePeriods } from '../js/events.js';
import { pose, wheelAngle, scoopFill, allFinite } from '../js/pose.js';
import { bucketPath } from '../js/mech.js';
import { STARS, GAL_POLE, AXIS, starDir, rotAxis } from '../js/catalog.js';
import { mergeAll, statsOf } from '../js/mesh.js';

let pass = 0, fail = 0;
function ok(cond, name, detail = '') {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${detail}`); }
}
function sect(name) { console.log(`\n== ${name}`); }

sect('传动恒等式（齿表推导）');
{
  const p = derivePeriods();
  ok(Math.abs(p.wheelRevPerDay - 2) < 1e-9, '枢轮 2 转/日', p.wheelRevPerDay);
  ok(Math.abs(p.scoopsPerDay - 72) < 1e-9, '受水 72 勺/日', p.scoopsPerDay);
  ok(Math.abs(p.columnRevPerDay - 1) < 1e-9, '天柱 1 转/日', p.columnRevPerDay);
  ok(Math.abs(p.chainRevPerDay - 4) < 1e-9, '斗链 4 循环/日', p.chainRevPerDay);
  ok(Math.abs(p.bucketsPerDay - 96) < 1e-9, '升水 96 斗/日', p.bucketsPerDay);
  ok(Math.abs(wheelAngle(86400) - 4 * Math.PI) < 1e-9, '枢轮一日两转角', wheelAngle(86400));
}

sect('水量守恒（勺出 = 斗入）');
{
  const per = derivePeriods();
  const outFlow = per.scoopsPerDay * WATER.scoopCells;
  const inFlow = per.bucketsPerDay * WATER.bucketCells;
  ok(outFlow === 1728 && inFlow === 1728, `72×24 = 96×18 = 1728 (${outFlow}/${inFlow})`);
}

sect('凸轮事件调度');
{
  const ev = buildEvents();
  ok(ev.length === 151, '事件总数 151', ev.length);
  const perLayer = [0, 0, 0, 0, 0];
  for (const e of ev) perLayer[e.layer]++;
  ok(JSON.stringify(perLayer) === '[100,24,2,5,20]', '五层凸齿数', perLayer);
  ok(GEAR.camCounts.join() === '100,24,2,5,20', '齿表与事件一致');
  ok(ev.every(e => e.t >= 0 && e.t < 86400), '事件时刻在日内');
  let sorted = true;
  for (let i = 1; i < ev.length; i++) if (ev[i].t < ev[i - 1].t) sorted = false;
  ok(sorted, '事件按时刻排序');
  const bells = ev.filter(e => e.kind === 'bell');
  ok(bells.every((e, i) => Math.abs(e.t - i * 864) < 1e-9), '百刻铃在每刻 (864s)');
  const plaques = ev.filter(e => e.kind === 'plaque');
  ok(plaques.length === 24 && plaques[12].label === '午正' && plaques[23].label === '子初', '时牌名', plaques[12].label + '/' + plaques[23].label);
  const gengs = ev.filter(e => e.kind === 'geng');
  ok(gengs.map(g => g.t).join() === '4320,12960,64800,73440,82080', '五更起点', gengs.map(g => g.t));
}

sect('十二时辰 / 百刻换算');
{
  ok(shiChen(0).name === '子正', '0 点 = 子正', shiChen(0).name);
  ok(shiChen(3600).name === '丑初', '1 点 = 丑初');
  ok(shiChen(43200).name === '午正', '12 点 = 午正');
  ok(shiChen(82800).name === '子初', '23 点 = 子初');
  ok(keText(43200) === '午正零刻', 'keText 43200', keText(43200));
  ok(keText(43200 + 864 * 3) === '午正三刻', 'keText +3刻', keText(43200 + 864 * 3));
  ok(keIndex(86399) === 99, '末刻 99', keIndex(86399));
  ok(gengOf(75600).n === 2, '21:00 = 二更', JSON.stringify(gengOf(75600)));
  ok(gengOf(43200) === null, '正午无更');
}

sect('星表与极轴');
{
  let poleLocked = true;
  for (let t = 0; t < 86400; t += 3000) {
    const d = starDir(2.53, 89.3, t);
    const m = Math.hypot(AXIS[0], AXIS[1], AXIS[2]);
    const dot = d[0] * AXIS[0] / m + d[1] * AXIS[1] / m + d[2] * AXIS[2] / m;
    if (Math.abs(dot) < 0.9999) poleLocked = false;
  }
  ok(poleLocked, '北极星锁定极轴（全天）');
  const dipper = STARS.slice(1, 8);
  let minA = 99, maxA = 0;
  for (let i = 0; i < 7; i++)
    for (let j = i + 1; j < 7; j++) {
      const a = dipper[i], b = dipper[j];
      const d = starDir(a[0], a[1], 0), e = starDir(b[0], b[1], 0);
      const dot = d[0] * e[0] + d[1] * e[1] + d[2] * e[2];
      const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
      minA = Math.min(minA, ang); maxA = Math.max(maxA, ang);
    }
  ok(minA > 3 && maxA < 32, `北斗七星角距 ${minA.toFixed(1)}°..${maxA.toFixed(1)}°`);
  const tubeHalf = Math.atan(L.arm.tubeR / (L.arm.tubeHalf * 2));
  const pol = starDir(2.53, 89.3, 0);
  const m = Math.hypot(AXIS[0], AXIS[1], AXIS[2]);
  const axAng = Math.acos(Math.max(-1, Math.min(1, pol[0] * AXIS[0] / m + pol[1] * AXIS[1] / m + pol[2] * AXIS[2] / m)));
  ok(axAng < tubeHalf * 0.5, `望筒视场罩住北极星 (管半角 ${(tubeHalf * 57.3).toFixed(1)}°, 偏 ${(axAng * 57.3).toFixed(2)}°)`);
  const gp = starDir(GAL_POLE[0], GAL_POLE[1], 0);
  let galOk = true;
  for (let t = 0; t < 86400; t += 7200) {
    const g2 = starDir(GAL_POLE[0], GAL_POLE[1], t);
    const s = starDir(6.75, -16.7, 0);
    const s2 = starDir(6.75, -16.7, t);
    const m = Math.hypot(AXIS[0], AXIS[1], AXIS[2]);
    const n = [AXIS[0] / m, AXIS[1] / m, AXIS[2] / m];
    const rr = rotAxis(gp, n, 2 * Math.PI * t / 86400);
    if (Math.hypot(g2[0] - rr[0], g2[1] - rr[1], g2[2] - rr[2]) > 1e-9) galOk = false;
    void s; void s2;
  }
  ok(galOk, '星位随极轴匀旋（银道极同律）');
  ok(STARS.length >= 50, '星表 ≥50 颗', STARS.length);
}

sect('pose 键与部件键严格互配');
{
  const parts = buildAll();
  const partKeys = new Set(parts.map(p => p.key));
  const poseKeys = new Set(Object.keys(pose(0)));
  let missing = [];
  for (const k of poseKeys) if (!partKeys.has(k)) missing.push(k);
  ok(missing.length === 0, 'pose 无悬空键', missing);
  let orphan = [];
  for (const k of partKeys) if (!poseKeys.has(k)) {
    const p = parts.find(pp => pp.key === k);
    if (p.dyn) orphan.push(k);
  }
  ok(orphan.length === 0, '活动部件皆有 pose', orphan);
  const statics = parts.filter(p => !p.dyn);
  ok(statics.length === 8, '静止部件 8', statics.length);
}

sect('运动学与路径');
{
  let mono = true;
  for (let t = 0; t < 86400; t += 600) {
    if (wheelAngle(t + 600) < wheelAngle(t) - 1e-9) mono = false;
  }
  ok(mono, '枢轮角单调不减');
  let cont = true, maxStep = 0;
  for (let s = 0; s < 400; s += 0.5) {
    const a = bucketPath(s), b = bucketPath(s + 0.5);
    const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    maxStep = Math.max(maxStep, d);
    if (d > 2.1) cont = false;
  }
  ok(cont, `斗链路径连续（0.5 步长最大位移 ${maxStep.toFixed(2)})`);
  const c = bucketPath(0);
  ok(Math.abs(c[0] - (L.chain.cx + L.chain.bucketOffset)) < 1e-6, '斗链起点在东侧链');
  let noNaN = true;
  for (let i = 0; i < 200; i++) {
    const r = allFinite(Math.random() * 86400, { ext: [1, 0, 1, 0, 1], doors: [0, 1, 0, 1, 0] });
    if (r) { noNaN = false; console.log('   NaN at', r); }
  }
  ok(noNaN, 'pose 200 次随机采样全有限');
  ok(scoopFill(0) === 0 && scoopFill(1190) === 4, '勺水四档', `${scoopFill(0)}/${scoopFill(1190)}`);
  const sl = pose(0, { ext: [1, 1, 1, 1, 1], doors: [1, 1, 1, 1, 1] });
  ok(sl.slider0.pos[2] === 6 && sl.door0.pos[1] === 6, '木人滑出 6 格 / 门升 6 格');
}

sect('几何预算');
{
  const parts = buildAll();
  const meshes = mergeAll(parts);
  const st = statsOf(meshes);
  ok(st.parts === 51, '部件 51', st.parts);
  ok(st.cells < 260000, `体素 ${st.cells} < 260000`);
  ok(st.quads < 60000, `面片 ${st.quads} < 60000`);
  ok(st.quads / st.cells < 0.32, `合并率 ${(100 * (1 - st.quads / st.cells)).toFixed(1)}% > 68%`);
}

sect('剖切');
{
  const on = buildTower(true), off = buildTower(false);
  ok(on.cells.size < off.cells.size - 800, `前+东剖切有效 (${off.cells.size - on.cells.size} 格)`);
  const scoop = buildScoopWater(4, Math.PI / 2);
  ok(scoop.cells.size === 24, '满勺水 24 格', scoop.cells.size);
}

sect('空间不相交（咬合例外除外）');
{
  const parts = buildAll();
  const t0 = pose(0);
  const occ = new Map();
  const exceptions = new Set([
    'wheel|column', 'column|wheel',
    'wheel|chainWheel1', 'chainWheel1|wheel',
    'column|globe', 'globe|column',
    'column|sanchen', 'sanchen|column',
    'lever|wheel', 'wheel|lever',
    'chainWheel1|water', 'water|chainWheel1',
    'scoopWater|wheel', 'wheel|scoopWater',
    'bucket0|chainWheel1', 'chainWheel1|bucket0',
    'armillary|sanchen', 'sanchen|armillary',
  ]);
  function rotCell(x, y, z, axis, c, ang) {
    if (!ang) return [x, y, z];
    const co = Math.cos(ang), si = Math.sin(ang);
    const [ax, ay, az] = axis;
    let px = x - c[0], py = y - c[1], pz = z - c[2];
    const d = ax * px + ay * py + az * pz;
    return [
      Math.round(px * co + (ay * pz - az * py) * si + ax * d * (1 - co) + c[0]),
      Math.round(py * co + (az * px - ax * pz) * si + ay * d * (1 - co) + c[1]),
      Math.round(pz * co + (ax * py - ay * px) * si + az * d * (1 - co) + c[2]),
    ];
  }
  const clashes = [];
  for (const p of parts) {
    const tf = t0[p.key];
    for (const key of p.cells.keys()) {
      let [x, y, z] = key.split(',').map(Number);
      if (tf && tf.rot) [x, y, z] = rotCell(x, y, z, tf.rot.axis, tf.rot.center, tf.rot.angle);
      if (tf && tf.pos) { x += tf.pos[0]; y += tf.pos[1]; z += tf.pos[2]; }
      const k2 = `${x},${y},${z}`;
      const prev = occ.get(k2);
      if (prev !== undefined && prev !== p.key) {
        const pair = prev + '|' + p.key;
        const dip = (prev.startsWith('bucket') && p.key === 'water') || (p.key.startsWith('bucket') && prev === 'water');
        if (!exceptions.has(pair) && !dip) clashes.push(`${pair} @ ${k2}`);
        if (clashes.length > 40) break;
      } else occ.set(k2, p.key);
    }
    if (clashes.length > 40) break;
  }
  ok(clashes.length === 0, '部件互不相交', clashes.slice(0, 12));
}

console.log(`\n===== accept-node: ${pass} ok, ${fail} FAIL =====`);
process.exit(fail ? 1 : 0);
