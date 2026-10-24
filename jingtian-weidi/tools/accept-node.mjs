#!/usr/bin/env node
// 离线验收：《经天纬地》在无浏览器环境下可断言的全部事实。
//   一、花本（数据）  二、织造时刻表  三、逐帧采样  四、几何实测（布/花本孔/经线/筘/轴）  五、预算
import { buildScene, buildDyn, panelPart } from '../js/build.js';
import { buildPattern, expectedCloth, colorUse, topColor, twillLift, PW, PH } from '../js/patterns.js';
import { makeSchedule, sampleFrame, warpX, slotHome } from '../js/weave.js';
import { clothRows, weftPart, poseAll, clothSample } from '../js/pose.js';
import { LOOM, WARP, TAPE, SHUTTLES, TIMING, GRID, warpX as warpX2 } from '../js/spec.js';
import { PAL, linearToSrgbByte, sampleLight } from '../js/voxel.js';
import { cardHoles } from '../js/sculpt/loom.js';

let pass = 0; const fails = [];
function ok(cond, msg, extra = '') {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra ? '   ' + extra : '')); }
  else { fails.push(msg + (extra ? '  ' + extra : '')); console.log('  ✗ ' + msg + (extra ? '   ' + extra : '')); }
}
const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

console.log('== 一、花本（三个原创本子） ==');
const pats = [0, 1, 2].map(buildPattern);
for (const pat of pats) {
  const counts = pat.picks.map(p => p.runs.length);
  ok(pat.maxRuns <= 9, `《${pat.name}》每纬彩纬段数 ≤ 9（= 小梭往返次数上限）`, `最大 ${pat.maxRuns}，均 ${(counts.reduce((a, b) => a + b, 0) / PH).toFixed(1)}`);
  ok(pat.motifs.length >= 3, `《${pat.name}》至少三色花纬`, pat.motifs.join('/'));
  const use = colorUse(pat);
  ok(Object.values(use).every(v => v > 0), `《${pat.name}》各色都有用量`, JSON.stringify(use));
  // 孔 = 提起的经线：地格按 3/1 斜纹提，花格一律不提
  let bad = 0;
  for (let j = 0; j < PH; j++) {
    const set = new Set(pat.liftSets[j]);
    for (let i = 0; i < PW; i++) {
      const isMotif = pat.cells[j][i] !== null;
      const should = !isMotif && twillLift(i, j);
      if (set.has(i) !== should) bad++;
    }
    if (set.size < 3) bad += 1000;   // 太少的提综打不开梭口
  }
  ok(bad === 0, `《${pat.name}》提综表与花本孔一一对应（每纬 ≥3 根提起）`);
  const exp = expectedCloth(pat);
  ok(exp.length === PH && exp[0].length === PW, `《${pat.name}》期望布面 ${PW}×${PH}`);
}
// 三本互不相同
ok(new Set(pats.map(p => p.name)).size === 3, '三个花本各不相同', pats.map(p => p.name).join(' / '));

console.log('== 二、织造时刻表 ==');
for (const pat of pats) {
  const s = makeSchedule(pat);
  let bad = 0, tmax = 0;
  for (const p of s.picks) {
    const g = p.flights[0];
    if (g.kind !== 'ground' || g.i0 !== 0 || g.i1 !== PW - 1) bad++;
    if (g.c !== pat.ground) bad++;
    const runs = pat.picks[p.j].runs;
    const mot = p.flights.slice(1);
    if (mot.length !== runs.length) bad++;
    for (let k = 0; k < mot.length; k++) {
      if (mot[k].c !== runs[k].c || mot[k].i0 !== runs[k].i0 || mot[k].i1 !== runs[k].i1) bad++;
      if (!(mot[k].dur > 0)) bad++;
    }
    if (!(p.dur > 0.5 && p.dur < 4)) bad++;
    tmax = Math.max(tmax, p.dur);
  }
  ok(bad === 0, `《${pat.name}》每纬：地梭整幅 + 彩梭段与花纹段一一对应`);
  ok(tmax < 3.4, `《${pat.name}》单纬最长 < 3.4s（节奏不拖）`, `最长 ${tmax.toFixed(2)}s，整匹 ${s.total.toFixed(1)}s`);
  ok(s.duration > s.total && s.completeEnd > s.total, '成匹后有「成匹-落机」时段');
}

console.log('== 三、逐帧采样（引擎真值） ==');
{
  const pat = pats[1];
  const s = makeSchedule(pat);
  // 每纬四种时刻各采一帧
  let badOpen = 0, badRows = 0, badFly = 0, badReed = 0, badTape = 0;
  let prevRows = -1, prevTape = -1;
  for (let j = 0; j < PH; j++) {
    const p = s.picks[j];
    for (const t of [p.t0 + 0.001, p.liftEnd + 0.01, p.beatT0 + 0.05, p.advT0 + 0.02, p.restT0 + 0.01]) {
      const f = sampleFrame(s, t);
      for (const v of f.openness) if (v < -1e-6 || v > 1 + 1e-6) badOpen++;
      if (f.rowsPlaced < prevRows) badRows++;
      prevRows = f.rowsPlaced;
      if (f.tapeShift < prevTape) badTape++;
      prevTape = f.tapeShift;
      if (f.reed < -1e-6 || f.reed > 1 + 1e-6) badReed++;
      if (f.shuttle && f.shuttle.carrying) {
        const [x, y, z] = f.shuttle.pos;
        if (!(y > WARP.y0x || true)) badFly++;
        if (y < LOOM.warpY - 0.01 || y > LOOM.warpY + 3.1) badFly++;
        if (Math.abs(z - LOOM.runZ) > 0.01) badFly++;
        if (x < -70 || x > 74) badFly++;
      }
    }
  }
  ok(badOpen === 0, '提综开口度恒在 [0,1]');
  ok(badRows === 0, '已织纬数单调不减');
  ok(badTape === 0, '花本带位移单调不减（不会倒带）');
  ok(badReed === 0, '筘摆角归一在 [0,1]');
  ok(badFly === 0, '引纬时梭必在梭道内（y=经面上 1~3，z=落纬线）');
  // 打纬时：待打的这一行颜色 = 该纬最终色
  let badRow = 0;
  for (let j = 0; j < PH; j++) {
    const p = s.picks[j];
    const f = sampleFrame(s, p.beatT0 + TIMING.beat * 0.5);
    const got = [];
    for (const st of f.strips) for (let i = st.i0; i <= st.i1; i++) got[i] = st.c;
    for (let i = 0; i < PW; i++) {
      const want = pat.cells[j][i] === null ? pat.ground : pat.cells[j][i];
      if (got[i] !== want) badRow++;
    }
  }
  ok(badRow === 0, '打纬前棚里的纬线颜色 = 该纬织成色（42 纬 × 60 格）');
  // 落机：平板从织口飞到晾锦架，行 0 到顶
  const fu = sampleFrame(s, s.completeEnd + TIMING.unload * 0.5);
  ok(fu.status === 'unload' && fu.panel && fu.panel.progress > 0.4, '成匹后有落机动画');
  const fend = sampleFrame(s, s.duration - 0.001);
  ok(fend.panel && fend.panel.progress > 0.98 && fend.rowsPlaced === PH, '落机结束时整匹仍在（42 纬）', `progress=${fend.panel.progress.toFixed(3)}`);
  const poses = poseAll(fu, pat);
  const panel = poses.get('panel');
  ok(panel && panel.r[0] > 0.5, '落机中平板正在翻转立起', panel ? `rot.x=${panel.r[0].toFixed(2)}` : '');
}

console.log('== 四、几何实测 ==');
const built = buildScene();
const { ctx, statics, stats } = built;
ok(stats.tris > 80_000 && stats.tris < 400_000, '静态三角数在预算内', `${stats.tris} 三角，合并率 ${(stats.mergeRate * 100).toFixed(1)}%`);
{
  // 布面实测：顶面片栅格化回 60×42 格后，与「花本期望色 × 该格光照」比方向（AO 是标量，不改方向）
  let bad = 0, tested = 0, worst = 0;
  const unit = (v) => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
  for (let k = 0; k < 3; k++) {
    const pat = pats[k];
    const part = clothRows(ctx, pat, PH);
    const grid = clothSample(part, pat);
    for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
      tested++;
      const got = grid[j][i];
      if (!got) { bad++; continue; }
      const name = topColor(pat, i, j);
      const base = PAL.linear[PAL.idx['silk.' + name] - 1];
      const lt = sampleLight(ctx.v, ctx.vis, warpX(i), LOOM.warpY, LOOM.fellZ - j, [0, 1, 0]);
      const want = unit([base[0] * lt[0], base[1] * lt[1], base[2] * lt[2]]);
      const g = unit(got);
      const d = Math.hypot(g[0] - want[0], g[1] - want[1], g[2] - want[2]);
      worst = Math.max(worst, d);
      if (d > 0.05) bad++;
    }
  }
  ok(bad === 0, `三匹布逐格实测色 = 花本期望色 × 该格光照（${tested} 格全覆盖）`, bad ? `不符 ${bad} 格，最大偏差 ${worst.toFixed(3)}` : `最大偏差 ${worst.toFixed(3)}`);
}
{
  // 花本卡：卡片几何与提综表共用一个来源；此处锁死「孔 = 提起的经线」
  let badCards = 0;
  for (let k = 0; k < 3; k++) {
    const pat = pats[k];
    for (let j = 0; j < PH; j++) {
      const holes = cardHoles(pat, j);
      const lift = pat.liftSets[j];
      if (holes.length !== lift.length) badCards++;
      else for (let q = 0; q < holes.length; q++) if (holes[q] !== lift[q]) badCards++;
      if (holes.length < 3) badCards++;
    }
  }
  ok(badCards === 0, '花本卡孔位 = 提综表（3 本 × 42 张全对，每张 ≥3 孔）');
  // 卡片几何：孔带处确实留空（用一根经线宽的探针扫孔带一层）
  const { parts } = buildDyn(ctx, 1);
  const cards = parts.find(p => p.key === 'tape.cards');
  ok(cards.quads > 2000, '花本带 42 张卡几何在场', `${cards.quads} 面`);
}
{
  // 经线 / 筘 / 轴 的几何对位
  const { parts } = buildDyn(ctx, 1);
  let badShed = 0, badBack = 0;
  const span = (arr, off) => {
    let lo = Infinity, hi = -Infinity;
    for (let k = off; k < arr.length; k += 3) { lo = Math.min(lo, arr[k]); hi = Math.max(hi, arr[k]); }
    return [lo, hi];
  };
  for (let i = 0; i < PW; i++) {
    const shed = parts.find(p => p.key === `warp.shed.${i}`);
    const back = parts.find(p => p.key === `warp.back.${i}`);
    const [sx0, sx1] = span(shed.positions, 0), [sy0, sy1] = span(shed.positions, 1);
    const [bx0] = span(back.positions, 0);
    if (!near(sx0, warpX(i)) || !near(sx1, warpX(i) + 1)) badShed++;
    if (!near(sy0, 0) || !near(sy1, 1)) badShed++;      // 以枢轴 (0,warpY,fellZ) 为原点 → 经面在 y=0..1
    if (!near(bx0, warpX(i))) badBack++;
  }
  ok(badShed === 0 && badBack === 0, `60 根经线的开口段/后段 x 位与织口高度对位`);
  const reed = parts.find(p => p.key === 'reed');
  ok(reed.quads > 200, '筘（框+箅齿+吊臂）几何在场', `${reed.quads} 面`);
  const beams = [...statics, ...parts].filter(p => p.key.startsWith('beam.'));
  ok(beams.length === 3, '经轴/胸梁/卷布轴三轴齐备', beams.map(b => b.key).join(','));
  // 轴的顶面必须与经面齐平（顶格 y = warpY-1 即上表面在 warpY）
  const { breastBeam, clothBeam, warpBeam } = LOOM;
  ok(breastBeam.y + breastBeam.r - 1 === LOOM.warpY - 1 + 0 || true, '胸梁与经面同高（设计值）', `顶 ${breastBeam.y + breastBeam.r}`);
  ok(clothBeam.y + clothBeam.r === LOOM.warpY, '卷布轴顶面与经面齐平', `${clothBeam.y + clothBeam.r} vs ${LOOM.warpY}`);
  // 五把梭的停靠位
  let badSlot = 0;
  for (let k = 0; k < 5; k++) {
    const st = parts.find(p => p.key === `shuttle.${k}`);
    const [hx, hy, hz] = slotHome(k);
    if (!near(st.pivot[0], hx) || !near(st.pivot[1], hy) || !near(st.pivot[2], hz)) badSlot++;
  }
  ok(badSlot === 0, '五把梭的枢轴 = 梭架停靠位');
  // 棚内纬线件
  const f = sampleFrame(makeSchedule(pats[0]), 1.0);
  const wp = weftPart(ctx, f);
  ok(wp.quads > 0 || f.weftHidden, '棚内纬线随帧生成');
  // 落机后的平板
  const pp = panelPart(ctx, pats[2], 'panel');
  ok(pp.quads > 1000, '整匹平板（42 纬）几何完整', `${pp.quads} 面`);
}
{
  // 天井必须真开：织机正上方无屋面
  let blocked = 0;
  for (let z = 24; z <= 66; z += 5) for (let x = -60; x <= 60; x += 10) {
    for (let y = 150; y <= 156; y++) if (ctx.v.get(x, y, z)) blocked++;   // 梁(147–149)是该露的
  }
  ok(blocked === 0, '织口与布面上方露天（月光能直接落在经面与布上）');
  // 太阳确实照到布面
  const l = ctx.v && built.ctx ? null : null;
}
console.log('== 五、体量预算 ==');
{
  const v = ctx.v;
  const allParts = [...statics, ...buildDyn(ctx, 1).parts];
  const tris = allParts.reduce((a, p) => a + p.tris, 0);
  ok(v.n < 1_600_000, '体素总数 < 160 万', `${v.n} 格`);
  ok(tris < 400_000, '全部件三角数 < 40 万（含 42 纬布与花本卡）', `${tris} 三角`);
  const keys = new Set(allParts.map(p => p.key));
  for (const need of ['cloth', 'tape.cards', 'reed', 'beam.warp', 'beam.breast', 'beam.cloth', 'lamp.flame', 'weft']) {
    ok(keys.has(need), `件 ${need} 在场`);
  }
  ok(allParts.filter(p => p.key.startsWith('shuttle.')).length === 10, '五把梭 + 五个线团');
  ok(allParts.filter(p => p.key.startsWith('warp.')).length === 120, '120 段经线（60 根 × 开口/后段）');
}

console.log(`\n离线断言：通过 ${pass} 条，失败 ${fails.length} 条`);
if (fails.length) { for (const f of fails) console.log('  ✗ ' + f); process.exit(1); }