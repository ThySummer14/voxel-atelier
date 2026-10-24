// 三个原创花本。花纹在「体素纵横比」坐标里生成：
//   格 (i,j) → 体素坐标 u = 2i-59 (u∈[-59,59])、v = j (v∈[0,41])
// 每格顶面颜色：地格按 3/1 斜纹决定经浮（素白）还是纬浮（地色）；花格一律彩纬浮起。
// 花本卡上的孔 = 该纬提起的经线集合；织出的锦 = 本文件算出的期望色。两者同源，可断言。
// 编织经济性：每行彩纬段数越少越好（段数 = 小梭往返次数），故三个花本都取大块面骨架。

export const PW = 60;    // 经线数 = 格列数
export const PH = 42;    // 每匹纬数 = 格行数
export const TWL = { period: 4, shift: 2 };   // 3/1 斜纹：提起 iff (i + shift*j) % period === 0

export function twillLift(i, j) { return (i + TWL.shift * j) % TWL.period === 0; }

function h32(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- 花本一：落花流水（宋锦经典骨架，长浪 + 落花） ----------
function makeFlowingWater() {
  const ground = 'azure';
  const waves = [];
  for (let k = 0; k < 2; k++) waves.push({ c: 12 + k * 18, A: 6.0, per: 150, ph: k * 62 });
  const blooms = [[-46, 3, 'jade'], [6, 4, 'verm'], [-22, 21, 'verm'], [38, 20, 'jade'], [-52, 40, 'jade'], [22, 40, 'verm']];
  const cellAt = (i, j) => {
    const u = 2 * i - 59, v = j;
    for (const [cu, cv, petal] of blooms) {              // 落花：六瓣
      const du = u - cu, dv = v - cv;
      const r = Math.hypot(du, dv);
      if (r > 8.4) continue;
      const th = Math.atan2(dv, du);
      if (r < 2.4) return 'verm';
      if (r <= 7.7 * (0.52 + 0.48 * Math.pow(Math.abs(Math.cos(3 * th)), 0.7))) return petal;
      if (r > 7.7 && Math.abs(Math.cos(3 * th)) < 0.3) return 'verm';
    }
    for (const w of waves) {                             // 长浪：一浪一行最多交两次
      const line = w.c + w.A * Math.sin(2 * Math.PI * (u + w.ph) / w.per);
      const d = v - line;
      if (Math.abs(d) < 1.7) return 'gold';
      if (d > 1.7 && d < 3.0 && ((u + 300) % 44) < 20) return 'jade';   // 浪花长划
    }
    return null;
  };
  return { name: '落花流水', ground, warp: 'azure2', motifs: ['gold', 'jade', 'verm'], cellAt };
}

// ---------- 花本二：团花宝相（一大团花 + 长藤 + 云带） ----------
function makeBaoxiang() {
  const ground = 'crimson';
  const R = 16.5, CY = 21;
  const cellAt = (i, j) => {
    const u = 2 * i - 59, v = j;
    const du = u, dv = (v - CY) * 0.9;
    const r = Math.hypot(du, dv), th = Math.atan2(dv, du);
    if (r <= R * 1.18) {
      const petal = R * (0.60 + 0.40 * Math.pow(Math.abs(Math.cos(5 * th)), 0.55));
      if (r < 0.26 * R) return 'verm';                       // 花心
      if (r < 0.40 * R) return 'gold';                       // 心外金环
      if (r <= petal) return r > petal * 0.88 ? 'jade' : 'gold';   // 五大瓣：金瓣玉尖
      if (r < R * 1.06 && Math.abs(Math.cos(5 * th)) < 0.26) return 'jade';  // 瓣间小蕾
    }
    for (const [base, amp, per, ph] of [[3.5, 4.0, 96, 0], [38.5, 4.0, 96, 48]]) {   // 上下缠枝
      const line = base + amp * Math.sin(2 * Math.PI * (u + ph) / per);
      if (Math.abs(v - line) < 2.2) return 'jade';
      if (Math.abs(v - line - 3.4) < 1.2 && ((u + 240) % 30) < 13) return 'gold';
    }
    return null;
  };
  return { name: '团花宝相', ground, warp: 'crimson2', motifs: ['gold', 'verm', 'jade'], cellAt };
}

// ---------- 花本三：星图·北斗 ----------
function makeStarChart() {
  const ground = 'indigo';
  const beidou = [[-44, 33], [-33, 28], [-22, 22], [-11, 24], [-3, 16], [8, 13], [12, 4]];
  const cellAt = (i, j) => {
    const u = 2 * i - 59, v = j;
    for (const [base, half] of [[23.5, 1.9], [28.5, 2.4], [34.0, 1.7]]) {   // 银河：数道星河
      const line = base + 5.0 * Math.sin(2 * Math.PI * u / 300) - 0.10 * u;
      if (Math.abs(v - line) < half) return 'pale';
    }
    for (let k = 0; k + 1 < beidou.length; k++) {                 // 连线
      const [x0, y0] = beidou[k], [x1, y1] = beidou[k + 1];
      const dx = x1 - x0, dy = y1 - y0;
      const t = ((u - x0) * dx + (v - y0) * dy) / (dx * dx + dy * dy);
      if (t < 0 || t > 1) continue;
      if (Math.hypot(u - (x0 + dx * t), v - (y0 + dy * t)) < 1.7) return 'darkgold';
    }
    for (const [cu, cv] of beidou) {                              // 七星：银心 + 月白晕
      const d = Math.hypot(u - cu, (v - cv) * 0.9);
      if (d <= 2.4) return 'silver';
      if (d <= 4.2) return 'moon';
    }
    for (const [cu, cv, col] of [[40, 8, 'silver'], [46, 30, 'moon'], [-52, 11, 'moon'], [-40, 39, 'moon'], [30, 39, 'silver']]) {
      const d = Math.hypot(u - cu, (v - cv) * 0.9);
      if (d <= 2.6) return col;
    }
    return null;
  };
  return { name: '星图·北斗', ground, warp: 'indigo2', motifs: ['pale', 'moon', 'silver', 'darkgold'], cellAt };
}

// ---------- 花本 → 织造数据 ----------
export function buildPattern(idx) {
  const raw = [makeFlowingWater, makeBaoxiang, makeStarChart][idx]();
  const cells = [];
  for (let j = 0; j < PH; j++) {
    const row = [];
    for (let i = 0; i < PW; i++) row.push(raw.cellAt(i, j));
    cells.push(row);
  }
  // 织造可行性：每纬至少要留 12 格地组织（经线才有得提、梭才过得去）
  for (let j = 0; j < PH; j++) {
    let ground = 0;
    for (let i = 0; i < PW; i++) if (cells[j][i] === null) ground++;
    let lo = 0, hi = PW - 1;
    while (ground < 24) {
      if ((hi - lo) % 2 === 0) { cells[j][lo] = null; lo++; } else { cells[j][hi] = null; hi--; }
      ground++;
    }
  }
  const picks = [];
  let maxRuns = 0;
  for (let j = 0; j < PH; j++) {
    // 纬色序列：地格 → 地色（素白经浮不算换色，提经即可），花格 → 花本色
    const runs = [];
    let cur = null;
    for (let i = 0; i <= PW; i++) {
      const c = i < PW ? (cells[j][i] === null ? raw.ground : cells[j][i]) : undefined;
      const curC = cur === null ? undefined : cur.c;
      if (c !== curC) {
        if (cur !== null) runs.push({ c: cur.c, i0: cur.start, i1: i - 1 });
        cur = c !== undefined ? { c, start: i } : null;
      }
    }
    // 地色整幅本就由地梭一趟织完，故只把地色段折进地段（首尾相接的地段可并入地趟）
    const packed = [];
    let groundI0 = null, groundI1 = null;
    for (const r of runs) {
      if (r.c === raw.ground) {
        if (groundI0 === null) groundI0 = r.i0;
        groundI1 = r.i1;
      }
    }
    for (const r of runs) {
      if (r.c === raw.ground) continue;
      packed.push(r);
    }
    maxRuns = Math.max(maxRuns, packed.length);
    picks.push({ j, ground: raw.ground, groundSpan: [groundI0, groundI1], runs: packed });
  }
  const pat = { idx, name: raw.name, ground: raw.ground, warp: raw.warp, motifs: raw.motifs, cells, picks, maxRuns };
  pat.liftSets = [];
  for (let j = 0; j < PH; j++) pat.liftSets.push(liftSet(pat, j));
  return pat;
}

// 某纬提起的经线（花本孔）
export function liftSet(pat, j) {
  const row = pat.cells[j];
  const out = [];
  for (let i = 0; i < PW; i++) {
    if (row[i] !== null) continue;            // 花格：彩纬浮起，经不下压 → 不提起
    if (twillLift(i, j)) out.push(i);
  }
  return out;
}

// 织成后该格顶面颜色（期望值；与 3D 布面着色同源）
export function topColor(pat, i, j) {
  const m = pat.cells[j][i];
  if (m !== null) return m;
  return twillLift(i, j) ? pat.warp : pat.ground;   // 经浮 → 经色；纬浮 → 纬色
}

export function expectedCloth(pat) {
  const out = [];
  for (let j = 0; j < PH; j++) {
    const row = [];
    for (let i = 0; i < PW; i++) row.push(topColor(pat, i, j));
    out.push(row);
  }
  return out;
}

// 各色用量（按纬色计，给梭上线团余量）
export function colorUse(pat) {
  const use = {};
  for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
    const m = pat.cells[j][i];
    const c = m === null ? pat.ground : m;
    use[c] = (use[c] || 0) + 1;
  }
  return use;
}
