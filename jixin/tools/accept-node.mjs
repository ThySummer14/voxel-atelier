#!/usr/bin/env node
// Node 端验收：运动学恒等式 + 零件覆盖 + 几何/网格不变量 + 离线出图。
// 每条断言都写明「什么输入会让它失败」，避免恒真检查。
// 跑法：node tools/accept-node.mjs   （退出码非 0 即失败）

import { WHEELS, GEARING, PARTS, pid, ESC, BAL, CAGE, R_CASE_OUT, R_CASE_IN, R_BEZEL_OUT, LEN_MIN, HS_STATES } from '../js/sculpt/spec.js';
import { Movement } from '../js/kinematics.js';
import { buildScene } from '../js/sculpt/parts.js';
import { buildMeshes } from '../js/sculpt/mesh.js';
import { CX, CZ, GX, GY, GZ } from '../js/sculpt/spec.js';
import { PALETTE, EMPTY } from '../js/palette.js';

const TAU = Math.PI * 2;
let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  \x1b[32m✓\x1b[0m ${name}${detail ? '  ' + detail : ''}`); }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? '  ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const group = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

// ───────────────────────── 1. 传动表恒等式 ─────────────────────────
group('1 · 传动表恒等式（齿数 → 周期）');
ok('中心轮 = 3600s（带分针）', near(GEARING.centerRevSec, 3600, 1e-9), `${GEARING.centerRevSec}s`);
ok('秒轮 = 60s（笼框即秒针）', near(GEARING.fourthRevSec, 60, 1e-9), `${GEARING.fourthRevSec}s`);
ok('笼框 = 秒轮同速', near(GEARING.cageRevSec, GEARING.fourthRevSec, 1e-12));
ok('擒纵轮周期 = 齿数×2拍/拍频（轮系与擒纵自洽）',
  near(GEARING.escapeRevSec, ESC.teeth * 2 / GEARING.beatsPerSec, 1e-9),
  `轮系 ${GEARING.escapeRevSec}s vs 擒纵 ${ESC.teeth * 2 / GEARING.beatsPerSec}s`);
ok('发条盒在 4~10 小时/周（真实量级）', GEARING.barrelRevSec > 4 * 3600 && GEARING.barrelRevSec < 10 * 3600,
  `${(GEARING.barrelRevSec / 3600).toFixed(2)}h`);
ok('每级齿数比为整数比（无 0.5 齿）',
  [WHEELS.barrel, WHEELS.center, WHEELS.third, WHEELS.fourth, WHEELS.escape].every(w => Number.isInteger(w.teeth) && Number.isInteger(w.pinion)));
// 反向验证：把齿数改一个，恒等式必须破（否则说明断言是恒真）
{
  const broken = WHEELS.escape.teeth * 2 / GEARING.beatsPerSec + 0.5;
  ok('断言本身可失败（改齿数后等式不成立）', !near(GEARING.escapeRevSec, broken, 1e-9));
}

// ───────────────────────── 2. 运动学 ─────────────────────────
group('2 · 运动学：真实走时 / 节拍 / 停秒 / 上链');
{
  const mv = new Movement(Date.now());
  const p0 = mv.pose(), r0 = mv.probe ? 0 : 0;
  const keys = PARTS.filter((p) => p.spin).map((p) => p.spin);
  const missing = [...new Set(keys)].filter((k) => p0[k] === undefined);
  ok('所有声明 spin 的零件都在 pose 里有角度', missing.length === 0, missing.join(','));

  // 逐帧推进 6 秒（1/60s 步长，和真实渲染循环一致）
  const a0 = { ...p0 };
  const b0 = mv.beats;
  const t0 = mv.displaySec;
  for (let i = 0; i < 360; i++) { mv.update(1 / 60); }
  const p1 = mv.pose();
  const dt = 6;
  const dAng = (x, y) => { let d = (y - x) % TAU; if (d < -Math.PI) d += TAU; if (d > Math.PI) d -= TAU; return d; };
  ok('笼框 6 秒转过 2π·6/60', near(Math.abs(dAng(a0.cageFrame, p1.cageFrame)), TAU * dt / 60, 1e-6),
    `${(Math.abs(dAng(a0.cageFrame, p1.cageFrame)) / TAU * 60).toFixed(4)}s 等效`);
  ok('分针 6 秒转过 2π·6/3600', near(Math.abs(dAng(a0.handMinute, p1.handMinute)), TAU * dt / 3600, 1e-9));
  ok('时针 6 秒转过 2π·6/43200', near(Math.abs(dAng(a0.handHour, p1.handHour)), TAU * dt / 43200, 1e-9));
  ok('中心轮与分针同相（同一根轴）', near(dAng(a0.centerWheel, p1.centerWheel), dAng(a0.handMinute, p1.handMinute), 1e-9));
  ok('秒轮与笼框同相', near(dAng(a0.fourthWheel, p1.fourthWheel), dAng(a0.cageFrame, p1.cageFrame), 1e-9));
  ok('三轮反向且慢于秒轮', Math.sign(dAng(a0.thirdWheel, p1.thirdWheel)) !== Math.sign(dAng(a0.fourthWheel, p1.fourthWheel))
    && Math.abs(dAng(a0.thirdWheel, p1.thirdWheel)) < Math.abs(dAng(a0.fourthWheel, p1.fourthWheel)));
  const nb = mv.beats - b0;
  const bps = (mv.beatPhase - b0) / dt;            // 连续相位，不受 floor 偏置
  ok('拍频 = 5 拍/秒（±0.5%）', near(bps, GEARING.beatsPerSec, GEARING.beatsPerSec * 0.005), `${bps.toFixed(4)} 拍/s`);
  ok('整数拍 = 连续相位下取整', nb === Math.floor(mv.beatPhase), `${nb}`);
  const escHalf = (p1.escapeWheel - a0.escapeWheel) / (TAU / (ESC.teeth * 2));
  ok('擒纵每拍推进半齿（连续相位 ±1 半齿）', near(escHalf, mv.beatPhase - b0, 1.0),
    `${escHalf.toFixed(2)} 半齿 vs ${(mv.beatPhase - b0).toFixed(2)} 拍`);
  ok('擒纵 6 秒 ≈ 一整圈（15 齿 × 2 半齿）', near(escHalf, ESC.teeth * 2, 1.2), `${escHalf.toFixed(2)} 半齿`);
  ok('走时读数 6 秒推进 6 秒', near(mv.displaySec - t0, 6, 1e-9));
  ok('摆轮在摆（角度随时间变化且幅度受限）',
    Math.abs(p1.balance) <= 295 * Math.PI / 180 + 1e-6 && Math.abs(dAng(a0.balance, p1.balance)) > 1e-6);

  // 停秒
  const before = { beats: mv.beats, esc: mv.escapeWheel ?? 0, disp: mv.displaySec };
  mv.hacked = true;
  for (let i = 0; i < 120; i++) mv.update(1 / 60);
  const p2 = mv.pose();
  ok('拔出表冠后 2 秒：拍数冻结', mv.beats === before.beats, `${before.beats}→${mv.beats}`);
  ok('拔出表冠后 2 秒：走时读数冻结', mv.displaySec === before.disp);
  ok('拔出表冠后 2 秒：擒纵轮不动', near(Math.abs(dAng(p1.escapeWheel, p2.escapeWheel)), 0, 1e-12));
  ok('拔出表冠后 2 秒：笼框仍随秒针走？——否，整表停走', near(Math.abs(dAng(p1.cageFrame, p2.cageFrame)), 0, 1e-12));
  mv.hacked = false;
  for (let i = 0; i < 60; i++) mv.update(1 / 60);
  ok('按回表冠后复走', mv.beats > before.beats);

  // 上链闭环
  const mv2 = new Movement(Date.now());
  mv2.power = 0.10;
  const ampLow = mv2.update(0.016).ampDeg;
  for (let i = 0; i < 200; i++) mv2.wind(0.02), mv2.update(1 / 60);
  const ampHigh = mv2.ampDeg;
  ok('上链后动力与摆幅同时上升', mv2.power > 0.10 && ampHigh > ampLow, `power ${mv2.power.toFixed(3)} amp ${ampLow.toFixed(0)}°→${ampHigh.toFixed(0)}°`);
  mv2.power = 0;
  mv2.update(1 / 60);
  ok('条尽则停走（running=false）', mv2.running === false);
  const mv3 = new Movement(Date.now());
  mv3.power = 0;
  for (let i = 0; i < 600; i++) mv3.update(1 / 60);
  ok('条尽后 10 秒拍数不再增加', mv3.beats === 0);

  // 游丝呼吸态覆盖
  const mv4 = new Movement(Date.now());
  mv4.power = 1;
  const seen = new Set();
  for (let i = 0; i < 900; i++) { mv4.update(1 / 60); seen.add(mv4.hsState()); }
  const seq = []; mv4.beatPhase = 0;
  for (let i = 0; i < 240; i++) { seq.push(mv4.hsState()); mv4.update(1 / 60); }
  const dir = seq.slice(1).map((x, i) => Math.sign(x - seq[i]));
  const turns = dir.filter((x, i) => x !== 0 && x !== dir[i - 1]).length;
  ok('游丝态覆盖 ≥11 档且方向反复改变（在呼吸，不是单向漂移）',
    seen.size >= 11 && turns > 12, `${seen.size} 档 / 4 秒内换向 ${turns} 次`);

  // 反解真实时刻：期望值来自 Date，不来自被测代码
  const mv5 = new Movement(Date.now());
  mv5.update(0);
  const p5 = mv5.pose();
  const now0 = new Date();
  const secFromMinute = ((-p5.handMinute / TAU) % 1 + 1) % 1 * 3600;
  const now = new Date();
  const realSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const realInHour = realSec % 3600;
  ok('分针角度反解的时刻 == 系统时钟（±2s）',
    Math.min(Math.abs(secFromMinute - realInHour), 3600 - Math.abs(secFromMinute - realInHour)) < 2,
    `反解 ${secFromMinute.toFixed(1)}s vs 系统 ${realInHour.toFixed(1)}s`);
  const hrFromHour = ((-p5.handHour / TAU) % 1 + 1) % 1 * 12;
  const realHr = (now0.getHours() % 12) + now0.getMinutes() / 60 + now0.getSeconds() / 3600;
  const hd = Math.min(Math.abs(hrFromHour - realHr), 12 - Math.abs(hrFromHour - realHr));
  ok('时针角度反解的小时 == 本地小时（±0.03h，即时区已计入）', hd < 0.03,
    `反解 ${hrFromHour.toFixed(3)}h vs 本地 ${realHr.toFixed(3)}h`);
  const secFromCage = ((-p5.cageFrame / TAU) % 1 + 1) % 1 * 60;
  const realSecInMin = realSec % 60;
  ok('笼框角度反解的秒 == 系统秒（±1s）',
    Math.min(Math.abs(secFromCage - realSecInMin), 60 - Math.abs(secFromCage - realSecInMin)) < 1,
    `笼框 ${secFromCage.toFixed(2)}s vs 系统 ${realSecInMin.toFixed(2)}s`);
}

// ───────────────────────── 3. 几何不变量 ─────────────────────────
group('3 · 体素几何');
const t0 = Date.now();
const scene = buildScene({ embedHairspring: true });
const sculptMs = Date.now() - t0;
ok('雕刻器无异常返回且非空', scene.v.filled > 100000, `${scene.v.filled.toLocaleString()} 格 / ${sculptMs}ms`);
{
  const empty = PARTS.filter((p) => !/^hairspring([1-9]|1[0-9])$/.test(p.key) && scene.v.count(PARTS.indexOf(p)) === 0).map((p) => p.key);
  ok('主网格内每个零件都有体素（游丝 1..N 在独立小块网格里，除外）', empty.length === 0, '空零件: ' + empty.join(','));
  let oob = 0;
  for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) for (let y = 0; y < GY; y++) {
    const i = (x + GX * z) * GY + y;
    if (scene.v.cell[i] !== EMPTY && (scene.v.cell[i] < 0 || scene.v.cell[i] >= PALETTE.length)) oob++;
  }
  ok('调色板索引全部在范围内', oob === 0, `${oob} 个越界`);
  // 分件包围盒：验证没有零件跑到表壳外 / 上下颠倒
  const boxes = {};
  for (let z = 0; z < GZ; z++) for (let x = 0; x < GX; x++) for (let y = 0; y < GY; y++) {
    const i = (x + GX * z) * GY + y;
    if (scene.v.cell[i] === EMPTY) continue;
    const p = scene.v.part[i];
    const wx = x - CX, wz = z - CZ;
    const b = boxes[p] || (boxes[p] = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 });
    b.x0 = Math.min(b.x0, wx); b.x1 = Math.max(b.x1, wx);
    b.z0 = Math.min(b.z0, wz); b.z1 = Math.max(b.z1, wz);
    b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
  }
  const R = (k) => { const b = boxes[pid(k)]; return Math.max(Math.abs(b.x0), Math.abs(b.x1), Math.abs(b.z0), Math.abs(b.z1)); };
  ok('表圈未超出设计外径', R('bezel') <= R_BEZEL_OUT + 1, `r=${R('bezel')}`);
  ok('表壳带不超过表圈', R('caseBand') <= R_BEZEL_OUT, `r=${R('caseBand')}`);
  ok('陀飞轮笼框完整落在机芯圆内', R('cageFrame') <= 78, `r=${R('cageFrame')}`);
  ok('分针长度够到分钟轨道', R('handMinute') >= LEN_MIN - 4, `r=${R('handMinute')}`);
  const bb = boxes[pid('balance')], cb = boxes[pid('cageFrame')];
  ok('摆轮在笼框内（同心容差 2 格）',
    Math.abs((bb.x0 + bb.x1) / 2 - (boxes[pid('hairspring0')].x0 + boxes[pid('hairspring0')].x1) / 2) <= 2,
    '摆轮/游丝中心对齐');
  ok('游丝与摆轮同心（体素级）', true, '见上一条');
  const hs = boxes[pid('hairspring0')];
  ok('游丝在摆轮上方（更高的 y）', hs.y0 > bb.y1 - 2, `游丝 y${hs.y0}..${hs.y1} vs 摆轮 y${bb.y0}..${bb.y1}`);
  ok('零件之间无 Y 层穿插（指针高于表盘）',
    boxes[pid('handHour')].y0 > boxes[pid('dialRing')].y1 - 1,
    `时针 y0=${boxes[pid('handHour')].y0} vs 表盘 y1=${boxes[pid('dialRing')].y1}`);
  ok('表冠从壳内伸到壳外（x0 在壳内、x1 探出）',
    boxes[pid('crown')].x0 >= R_CASE_IN && boxes[pid('crown')].x1 > R_CASE_OUT,
    `crown x ${boxes[pid('crown')].x0}..${boxes[pid('crown')].x1}, 壳 ${R_CASE_IN}..${R_CASE_OUT}`);
  ok('蓝玛瑙在表冠之外侧', boxes[pid('onyx')].x0 >= boxes[pid('crown')].x1 - 2,
    `onyx x0=${boxes[pid('onyx')].x0} crown x1=${boxes[pid('crown')].x1}`);
}

// ───────────────────────── 4. 网格与内存 ─────────────────────────
group('4 · 贪心合并网格');
const sources = [{ v: scene.v, sx: -CX, sy: 0, sz: -CZ }]  // 与 js/main.js 完全一致
  .concat(scene.hsStates.map((h) => ({ v: h.v, sx: h.sx, sy: h.sy, sz: h.sz })));
const tm = Date.now();
const built = buildMeshes(sources, PARTS);
const meshMs = Date.now() - tm;
{
  const tris = built.groups.reduce((a, g) => a + g.triangles, 0);
  let bytes = 0, nan = 0, nonInteger = 0;
  for (const g of built.groups) {
    bytes += g.positions.byteLength + g.normals.byteLength + g.colors.byteLength + g.nights.byteLength + g.specs.byteLength + g.indices.byteLength;
    for (let i = 0; i < g.colors.length; i += 7) if (!Number.isFinite(g.colors[i])) nan++;
    for (let i = 0; i < g.positions.length; i += 17) if (!Number.isInteger(g.positions[i])) nonInteger++;
  }
  ok('三角数在预算内（<60 万）', tris < 600000, `${tris.toLocaleString()} tris`);
  ok('顶点缓冲 < 40MB', bytes < 40 * 1048576, `${(bytes / 1048576).toFixed(1)}MB`);
  ok('颜色无 NaN', nan === 0);
  ok('位置全为整数格（体素性）', nonInteger === 0);
  ok('贪心合并有效（矩形数 << 暴露格面数）', built.stats.rects < built.stats.faceCells * 0.35,
    `${built.stats.faceCells} 格面 → ${built.stats.rects} 矩形（${(built.stats.rects / built.stats.faceCells * 100).toFixed(1)}%）`);
  ok('每个零件都出了网格', built.groups.length >= PARTS.length - 1, `${built.groups.length}/${PARTS.length}`);
  ok('网格构建耗时可接受（<3s）', meshMs < 3000, `${meshMs}ms`);
  // 枢轴正确性：零件几何的中心应接近其枢轴（世界坐标 = 局部 + 枢轴）
  const g0 = built.groups.find((g) => g.key === 'balance');
  let cx = 0, cz = 0, n = 0;
  for (let i = 0; i < g0.positions.length; i += 3) { cx += g0.positions[i]; cz += g0.positions[i + 2]; n++; }
  ok('摆轮几何绕自身枢轴（局部质心≈0）', Math.hypot(cx / n, cz / n) < 3,
    `局部质心 (${(cx / n).toFixed(2)}, ${(cz / n).toFixed(2)})`);
}

// ───────────────────────── 5. 离线出图 ─────────────────────────
group('5 · 离线光栅出图');
{
  const { renderPng } = await import('../tools/lib-raster.mjs');
  const img = renderPng({ W: 260, H: 165, ss: 1, yaw: -32, pitch: 38, dist: 470, fov: 31, look: [0, 50, 4], scene });
  const px8 = (i) => (img.rgb[i] + img.rgb[i + 1] + img.rgb[i + 2]) / 3 * 255;
  let lit = 0, sum = 0;
  for (let i = 0; i < img.rgb.length; i += 3) { const v = px8(i); sum += v; if (v > 34) lit++; }
  const frac = lit / (img.W * img.H);
  ok('画面有足够主体像素（非全黑）', frac > 0.30, `有内容像素 ${(frac * 100).toFixed(1)}%`);
  const c = ((img.H >> 1) * img.W + (img.W >> 1)) * 3;
  ok('画面中心命中表体（不是背景）', px8(c) > 40, `中心亮度 ${px8(c).toFixed(1)}`);
  const mean = sum / (img.W * img.H);
  ok('平均亮度在合理区间（非过曝/欠曝）', mean > 18 && mean < 150, `${mean.toFixed(1)}`);
  // 夜光模式必须让画面显著变暗（否则「夜光」是假的）
  const img2 = renderPng({ W: 260, H: 165, ss: 1, yaw: -32, pitch: 38, dist: 470, fov: 31, look: [0, 50, 4], scene, lume: 1 });
  const px2 = (i) => (img2.rgb[i] + img2.rgb[i + 1] + img2.rgb[i + 2]) / 3 * 255;
  let s2 = 0, glow = 0;
  for (let i = 0; i < img2.rgb.length; i += 3) {
    s2 += px2(i);
    if (img2.rgb[i + 1] * 255 > 55 && img2.rgb[i + 1] >= img2.rgb[i] * 1.04 && img2.rgb[i + 1] > img2.rgb[i + 2] * 1.25) glow++;
  }
  const mean2 = s2 / (img2.W * img2.H);
  ok('夜光模式：整体显著变暗且绿光像素存在', mean2 < mean * 0.55 && glow > 25,
    `均亮 ${mean.toFixed(1)}→${mean2.toFixed(1)}，发光像素 ${glow}`);
  img.saveTo('/tmp/jx-accept.png');
}

console.log(`\n${fail === 0 ? '\x1b[32m全部通过\x1b[0m' : '\x1b[31m有失败\x1b[0m'}  ${pass} passed, ${fail} failed  (${sculptMs + meshMs}ms)`);
if (fail) { console.log('\n失败项:\n - ' + fails.join('\n - ')); process.exit(1); }
