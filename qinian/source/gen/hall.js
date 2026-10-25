import {
  S, NX, NZ, iyOf, cellX, cellZ, FLOOR, STOREYS, ROOFS, LIP, CEIL, WALL_IN, R_MID_IN, R_TOP_IN,
  FINIAL, BAY, TIAO, R_EAVE_COL, D_EAVE_COL, R_GOLD_COL, D_GOLD_COL, R_WELL_COL, D_WELL_COL,
} from './config.js';
import { P } from './palette.js';
import { hash2, hash3, TAU, clamp, fbm } from './util.js';
import { glyphAt, GLYPH_W, GLYPH_H } from './glyphs.js';

const DEG = Math.PI / 180;
const frac = (v) => v - Math.floor(v);

// ---------------------------------------------------------------- shared geometry
export function roofT(k, r) {
  const R = ROOFS[k];
  const t = clamp((R.rOut - r) / (R.rOut - R.rIn), 0, 1);
  return R.hOut + (R.hIn - R.hOut) * (R.lin * t + (1 - R.lin) * Math.pow(t, R.pw));
}
const Rp = (k) => STOREYS[k].rCol + STOREYS[k].tiao * TIAO;
function soffitH(k, r) {
  const R = ROOFS[k];
  const t = clamp((R.rOut - r) / (R.rOut - Rp(k)), 0, 1);
  return R.hOut - LIP + (STOREYS[k].purlin[1] - (R.hOut - LIP)) * t;
}

// bays are centred on the axes; columns sit at ±15°
function bay(th) {
  const a = th / BAY;
  const n = Math.round(a);
  return [((n % 12) + 12) % 12, a - n + 0.5];
}
function nearestCol(th) {
  return (Math.round((th - 15 * DEG) / BAY) * BAY) + 15 * DEG;
}
function colDist(r, th, R) {
  const tc = nearestCol(th);
  const d = th - tc;
  return Math.hypot(r * Math.cos(d) - R, r * Math.sin(d));
}

// ---------------------------------------------------------------- painting (龙凤和玺)
function lightOf(c) {
  return c === P.qing ? P.qingLight : c === P.lv ? P.lvLight : c;
}
// A gilt walking dragon (行龙): w −1..1 along the panel, v 0..1 across. Thick sinuous body,
// head at the leading end, two legs, a few flames.
function dragon(w, v, seed) {
  if (Math.abs(w) > 0.95) return false;
  const yc = (t) => 0.5 + 0.2 * Math.sin(t * Math.PI * 1.25 + seed);
  const th = 0.1 + 0.07 * Math.cos(w * Math.PI * 0.5);
  if (Math.abs(v - yc(w)) < th) return true;
  if (Math.hypot((w - 0.72) * 3, v - yc(0.72)) < 0.21) return true;
  for (const lw of [-0.35, 0.25]) if (Math.abs(w - lw) < 0.05 && Math.abs(v - yc(lw)) < 0.34) return true;
  return hash2(Math.floor(w * 40 + 99), Math.floor(v * 10)) > 0.93;
}
function hexi(level, b, u, v, seed) {
  // u: 0..1 column to column · v: 0..1 bottom to top
  const A = (b + level) % 2 === 0 ? P.qing : P.lv;
  const B = A === P.qing ? P.lv : P.qing;
  const m = u > 0.5 ? 1 - u : u; // mirror
  const cv = Math.abs(v * 2 - 1);  // 0 centre, 1 edge
  if (v < 0.1 || v > 0.9) return lightOf(A);             // 晕色 edge bands
  if (m < 0.03) return A;                                // 箍头 next to the column
  if (Math.abs(m - 0.04) < 0.008) return P.gold;
  if (m < 0.105) {                                       // 盒子: gilt roundel on the light ground
    const d = Math.hypot((m - 0.0725) * 14, (v - 0.5) * 1.6);
    return d < 0.42 ? (d < 0.2 ? P.goldPale : P.gold) : lightOf(A);
  }
  if (Math.abs(m - 0.11) < 0.008) return P.gold;
  const chev1 = 0.17 + 0.07 * cv;                        // 圭线光: W-shaped gilt lines
  if (Math.abs(m - chev1) < 0.011) return P.gold;
  const chev2 = 0.29 - 0.07 * (1 - cv);                  // 方心头
  if (Math.abs(m - chev2) < 0.011) return P.gold;
  if (m < chev1) return lightOf(B);
  if (m < chev2) return B;
  return dragon((u - 0.5) / 0.22, v, seed) ? P.gold : A; // 方心
}
function dianban(b, u, v) {
  if (v < 0.14 || v > 0.86) return P.zhuDeep;
  // two gilt dragons per bay walking towards the centre
  const w = u < 0.5 ? u * 4 - 1 : (1 - u) * 4 - 1;
  return dragon(w, v, b * 0.7) ? P.gold : P.zhu;
}
function pingban(th, r, v) {
  if (v < 0.2 || v > 0.8) return P.qingDeep;
  const n = Math.round(r * TAU / 0.32);
  return frac(th / TAU * n) < 0.2 ? P.gold : P.qingDeep;
}

// ---------------------------------------------------------------- bracket sets (斗栱)
// Hand-built voxel templates: [layer][radial][tangential] → code
// codes: 1 block (斗) · 2 arm (栱 / 翘 / 昂) · 3 gilded nose · 4 continuous ring · 5 beam head · 6 gilt arm end
function buildTemplate(n, halfW) {
  const H = 2 * n + 4;
  const reach = 3 * n + 3;
  const t = [];
  for (let le = 0; le < H; le++) {
    const layer = [];
    for (let ld = -reach; ld <= reach; ld++) {
      const row = new Uint8Array(2 * halfW + 1);
      layer.push(row);
    }
    t.push(layer);
  }
  const put = (le, ld, lt, c) => {
    if (le < 0 || le >= H || Math.abs(ld) > reach || Math.abs(lt) > halfW) return;
    const cur = t[le][ld + reach][lt + halfW];
    if (!cur || c === 4) t[le][ld + reach][lt + halfW] = c;
  };
  // 坐斗
  for (const le of [0, 1]) for (let ld = -1; ld <= 1; ld++) for (let lt = -1; lt <= 1; lt++) put(le, ld, lt, 1);
  for (let i = 1; i <= n; i++) {
    const le = 2 * i;
    for (let ld = -3 * i; ld <= 3 * i; ld++) put(le, ld, 0, 2);                // 翘 / 昂
    for (let j = -i; j <= i; j++) {
      const len = Math.abs(j) === i ? 2 : 3;
      put(le, 3 * j, len, 6);
      put(le, 3 * j, -len, 6);
      for (let lt = -len; lt <= len; lt++) put(le, 3 * j, lt, 2);              // 瓜栱 / 万栱
      // 斗 on the arm ends (upper sub-layer)
      put(le + 1, 3 * j, 0, 1);
      put(le + 1, 3 * j, len, 1);
      put(le + 1, 3 * j, -len, 1);
    }
    if (i === n || i === n - 1) {
      put(le - 1, 3 * i + 1, 0, 3);                                          // 昂嘴 dips below
      put(le, 3 * i + 1, 0, 2);
    }
  }
  const le1 = 2 * n + 2, le2 = 2 * n + 3;
  for (let ld = -3 * n - 1; ld <= 3 * n + 2; ld++) put(le1, ld, 0, ld > 3 * n ? 3 : 2);   // 耍头
  for (let lt = -3; lt <= 3; lt++) { put(le1, 3 * n, lt, 2); put(le1, -3 * n, lt, 2); }  // 厢栱
  for (let ld = -3 * n; ld <= 3 * n; ld++) put(le2, ld, 0, 2);                           // 撑头木
  for (const ld of [0, 3 * n, -3 * n]) for (let lt = -halfW; lt <= halfW; lt++) { put(le1, ld === 0 ? 0 : 99, lt, 4); put(le2, ld, lt, 4); }
  for (let lt = -halfW; lt <= halfW; lt++) put(le1, 0, lt, 4);
  return { t, H, reach, halfW };
}
const TPL = [buildTemplate(2, 5), buildTemplate(3, 5), buildTemplate(4, 6)];

function dougongCell(k, r, th, h) {
  const St = STOREYS[k];
  const [d0, d1] = St.dougong;
  if (h < d0 || h >= d1) return undefined;
  const T = TPL[k];
  const ld = Math.round((r - St.rCol) / S);
  if (Math.abs(ld) > T.reach) return undefined;
  const step = TAU / St.sets;
  const base = 15 * DEG;
  const si = Math.round((th - base) / step);
  const tc = base + si * step;
  const lt = Math.round(((th - tc) * St.rCol) / S);
  const le = clamp(Math.floor((h - d0) / S), 0, T.H - 1);
  const isCol = ((si % (St.sets / 12)) + St.sets / 12) % (St.sets / 12) === 0;
  let code = Math.abs(lt) <= T.halfW ? T.t[le][ld + T.reach][lt + T.halfW] : 0;
  if (isCol && !code) {
    // column-head set: wider seat and a protruding beam head (桃尖梁头)
    if (le < 2 && Math.abs(lt) <= 2 && Math.abs(ld) <= 1) code = 1;
    if (le >= T.H - 3 && ld >= 0 && ld <= 3 * St.tiao + 3 && Math.abs(lt) <= 1) code = 5;
  }
  const alt = ((si % 2) + 2) % 2;
  const A = alt ? P.lv : P.qing, B = alt ? P.qing : P.lv;
  switch (code) {
    case 1: return A;
    case 2: return B;
    case 3: return P.goldDim;
    case 4: return le === T.H - 1 ? P.qingDeep : P.lvDeep;
    case 5: return (le === T.H - 1 || Math.abs(lt) === 1) ? P.gold : P.lv;
    case 6: return lightOf(B);
  }
  // 垫栱板 between sets on the column line: dark red, recessed, with a small gilt flame
  if (Math.abs(r - St.rCol) < 0.06 && le >= 1) {
    const flame = Math.abs(lt) <= Math.max(0, 4 - Math.abs(le - (T.H >> 1))) && Math.abs(Math.abs(lt) - T.halfW) > 3;
    return flame ? P.goldDim : P.gongPanel;
  }
  return 0;
}

// ---------------------------------------------------------------- roofs
function rowCount(k, r) {
  if (k < 2) return ROOFS[k].rows;
  return r > 5.2 ? 132 : r > 2.7 ? 66 : 33;
}
function roofCell(k, r, th, h) {
  const R = ROOFS[k];
  if (r < R.rIn || r > R.rOut + 0.065) return undefined;
  const rr = Math.min(r, R.rOut);
  const T = roofT(k, rr);
  const f = frac((th / TAU) * rowCount(k, r));
  const roll = f < 0.5;
  const top = T + (roll ? 0.1 : 0);
  const rp = Rp(k);
  const lo = r >= rp + 0.14 ? soffitH(k, r) : STOREYS[k].purlin[1];
  if (h < lo || h >= top) {
    // drip tiles (滴水) hang over the red fascia between roll rows
    if (r > R.rOut - 0.06 && !roll && f > 0.55 && f < 0.9) {
      const hb = h - (R.hOut - LIP);
      if (hb >= 0.2 && hb < 0.3) return P.tileEdge;
    }
    return undefined;
  }
  if (r > R.rOut) {
    // tile ends overhang by one voxel: 勾头 on roll rows only
    const hb = h - (R.hOut - LIP);
    if (hb < 0.3) return 0;
    return roll ? P.tileRoll : 0;
  }
  if (r > R.rOut - 0.45) {
    const hb = h - (R.hOut - LIP);
    const fr = frac((th / TAU) * R.rafters);
    const ri = Math.floor((th / TAU) * R.rafters);
    const edge = R.rOut - r;
    if (hb < 0.1) {
      if (edge < 0.3) return 0;
      return fr < 0.5 ? (ri % 2 ? P.lv : P.qing) : 0;             // 檐椽头
    }
    if (hb < 0.2) {
      if (edge > 0.32) return P.zhu;                               // 小连檐 board behind
      if (fr >= 0.5) return 0;
      return edge < 0.1 ? P.gold : P.lv;                           // 飞椽头 (gold 万字)
    }
    if (hb < 0.3) return P.redBright;                              // 大连檐
    if (h > T - 0.1) return roll ? P.tileRoll : P.tileEdge;
    return P.tileDeep;
  }
  if (h >= T - 0.1) return roll ? P.tileRoll : P.tile;
  if (r >= rp + 0.14 && h < lo + 0.2) {
    // soffit: green rafters over red boards
    const fr = frac((th / TAU) * R.rafters);
    if (fr < 0.45) return h < lo + 0.1 ? P.lvDeep : P.lv;
    return h < lo + 0.1 ? 0 : P.zhuDeep;
  }
  return P.structure;
}

// purlins over the bracket sets
function purlinCell(k, r, th, h) {
  const St = STOREYS[k];
  const [p0, p1] = St.purlin;
  if (h < p0 || h >= p1) return undefined;
  const rp = Rp(k);
  const inner = k === 0 ? R_MID_IN : k === 1 ? R_TOP_IN : 3.6;
  if (r > rp + 0.14 || r < inner) return undefined;
  const v = (h - p0) / (p1 - p0);
  if (r > rp - 0.14) {
    const [b, u] = bay(th);
    return v > 0.75 ? P.qingDeep : hexi(1, b, u, 0.2 + v * 0.6, 2.1);
  }
  if (Math.abs(r - St.rCol) < 0.16) return v > 0.5 ? P.qing : P.lv;
  return P.lvDeep;
}

// ---------------------------------------------------------------- walls
function groundCell(r, th, h) {
  const St = STOREYS[0];
  if (h >= St.dougong[0]) return undefined;
  const [b, u] = bay(th);
  if (h >= St.pingban[0]) {
    if (r < 11.73 || r > 12.47) return undefined;
    const v = (h - St.pingban[0]) / (St.pingban[1] - St.pingban[0]);
    if (r > 12.37 || r < 11.83) return pingban(th, r, v);
    return P.structure;
  }
  if (h >= 4.4) {
    if (r < 11.78 || r > 12.42) return undefined;
    if (r > 12.32 || r < 11.88) {
      for (const [kind, a, c] of St.beams) {
        if (h >= a && h < c) {
          const v = (h - a) / (c - a);
          if (kind === 'dian') return dianban(b, u, v);
          return hexi(kind === 'da' ? 1 : 0, b, u, v, kind === 'da' ? 0.7 : 2.4);
        }
      }
    }
    return P.structure;
  }
  // columns
  const cd = colDist(r, th, R_EAVE_COL);
  if (cd < D_EAVE_COL / 2) return h < 0.12 ? P.qingbai : P.red;
  if (cd < D_EAVE_COL / 2 + 0.1 && h < 0.12) return P.qingbai;
  if (r < 11.98 || r > 12.22) return undefined;
  return infill(b, u, r, th, h);
}

function infill(b, u, r, th, h) {
  const along = (u - 0.5) * BAY * R_EAVE_COL;   // metres from bay centre
  const a = Math.abs(along);
  const outer = r >= 12.1;
  const door = (b === 0 || b === 1 || b === 11) && a < 1.3 && h < 3.6;
  if (door) {
    if (h < 0.26 && r < 12.15 && r > 12.02) return P.red;  // threshold
    return 0;
  }
  if (a > 2.6) return P.redDark;                       // 抱框
  if (h >= 4.25) return P.red;                         // 上槛
  if (h >= 3.75) {
    // transom (横批) lattice in three panels
    const p = Math.abs(a - 0.87) < 0.06 ? 1 : 0;
    if (p || h < 3.82 || h > 4.18) return P.redDark;
    return lattice(along, h, outer);
  }
  if (h >= 3.6) return P.red;                          // 中槛
  const lf = frac((along + 2.6) / 1.3);
  if (lf < 0.05 || lf > 0.95) return P.redDark;         // 边梃
  if (h < 0.1 || (h >= 1.0 && h < 1.08) || (h >= 1.26 && h < 1.34) || (h >= 3.3 && h < 3.38)) return P.redDark;
  if (h < 1.0) {
    // 裙板: gilded frame
    if (!outer) return P.red;
    const inFrame = lf > 0.14 && lf < 0.86 && h > 0.22 && h < 0.88;
    const onFrame = inFrame && (lf < 0.2 || lf > 0.8 || h < 0.28 || h > 0.82);
    return onFrame ? P.goldDim : P.red;
  }
  if (h < 1.26) return outer && lf > 0.2 && lf < 0.8 && h > 1.12 && h < 1.2 ? P.goldDim : P.red;
  if (h < 3.3) return lattice(along, h, outer);
  return outer && lf > 0.2 && lf < 0.8 && h > 3.42 && h < 3.5 ? P.goldDim : P.red;
}

function lattice(along, h, outer) {
  const iu = Math.round(along / S) + 400, iv = Math.round(h / S);
  const d1 = (iu + iv) % 4, d2 = (((iu - iv) % 4) + 4) % 4;
  const bar = d1 === 0 || d2 === 0;
  if (!outer) return P.latticeHole;
  if (!bar) return 0;
  return d1 === 0 && d2 === 0 && ((iu >> 2) + (iv >> 2)) % 2 === 0 ? P.goldDim : P.latticeBar;
}

function drumCell(k, r, th, h) {
  const St = STOREYS[k];
  const rin = k === 1 ? R_MID_IN : R_TOP_IN;
  const below = k === 1 ? 6.86 : 12.3;
  if (h < below || h >= St.dougong[0] || r < rin) return undefined;
  const face = St.face;
  const [r0, r1] = St.ridge;
  let outer;
  if (h < r0) outer = ROOFS[k - 1].rIn;
  else if (h < r1) {
    const q = (h - r0) / (r1 - r0);
    outer = q < 0.3 ? face + 0.4 : q < 0.72 ? face + 0.32 : face + 0.22;
  } else if (h < St.pingban[0]) outer = face;
  else outer = face + 0.05;
  if (r > outer) return undefined;
  const [b, u] = bay(th);
  if (r > outer - 0.1) {
    if (h < r0) return h < CEIL.outer + 0.2 && k === 1 ? hexi(0, b, u, 0.5, 1) : P.structure;
    if (h < r1) {
      const q = (h - r0) / (r1 - r0);
      if (q < 0.3) return P.ridge;
      if (q < 0.72) return frac(th / TAU * Math.round(face * TAU / 0.3)) < 0.1 ? P.tileDeep : P.ridgeLight;
      return P.ridge;
    }
    const [w0, w1] = St.tileWall;
    if (h < w1) {
      const course = Math.floor((h - w0) / 0.1);
      const j = frac(th / TAU * Math.round(face * TAU / 0.32) + (course % 2) * 0.5);
      return j < 0.12 ? P.tileDeep : P.ridge;
    }
    if (h < St.pingban[0]) {
      const [, a, c] = St.beams[0];
      return hexi(k + 1, b, u, (h - a) / (c - a), 1.3 + k);
    }
    return pingban(th, r, (h - St.pingban[0]) / (St.pingban[1] - St.pingban[0]));
  }
  if (r < rin + 0.1) {
    // the inner well, as seen from the hall floor: painted beam, gilt fillet, a ring of small
    // brackets flaring upwards, a vermilion frieze, repeated every 1.2 m
    if (h < below + 0.1) return P.gold;
    const q = frac((h - below) / 1.2);
    if (q < 0.5) return hexi(k + 2, b, u, q / 0.5, 0.4 * k);
    if (q < 0.58) return P.gold;
    if (q < 0.84) {
      const t = frac((th / TAU) * Math.round((rin * TAU) / 0.5));
      const lvl = Math.floor((q - 0.58) / 0.085);
      return Math.abs(t - 0.5) < 0.18 + lvl * 0.12 ? (lvl % 2 ? P.lv : P.qing) : P.gongPanel;
    }
    return frac((th / TAU) * 72) < 0.1 ? P.gold : P.zhu;
  }
  return P.structure;
}

// ---------------------------------------------------------------- interior
function ceilingAt(r) {
  if (r >= R_MID_IN) return CEIL.outer;
  if (r >= R_TOP_IN) return CEIL.middle;
  if (r >= 3.6) return CEIL.centre;
  if (r >= 2.7) return CEIL.centre + 0.9;
  if (r >= 1.8) return CEIL.centre + 1.8;
  return CEIL.centre + 2.8;
}

function coffer(x, z, k) {
  const ix = Math.floor(x / 0.6 + 1000), iz = Math.floor(z / 0.6 + 1000);
  const fx = frac(x / 0.6), fz = frac(z / 0.6);
  if (fx < 0.17 || fz < 0.17) return (fx < 0.17 && fz < 0.17) ? P.gold : P.lv;
  const cx = fx - 0.58, cz = fz - 0.58;
  const d = Math.hypot(cx, cz);
  if (d < 0.12) return P.gold;
  if (d < 0.27) return k % 2 ? P.lvLight : P.white;
  return (ix + iz) % 2 ? P.qing : P.qing;
}

function interiorCell(x, z, r, th, h) {
  // columns
  const dg = colDist(r, th, R_GOLD_COL);
  if (dg < D_GOLD_COL / 2) {
    if (h < 0.12) return P.qingbai;
    return P.red;
  }
  // dragon-well columns on the diagonals, short posts elsewhere
  const tc = nearestCol(th);
  const dd = Math.hypot(r * Math.cos(th - tc) - R_WELL_COL, r * Math.sin(th - tc));
  const isWell = Math.abs(((Math.round((tc / DEG - 15) / 30) % 3) + 3) % 3 - 1) === 0;
  if (isWell && dd < D_WELL_COL / 2) {
    if (h < 0.12) return P.qingbai;
    // gilded 宝相花 on vermilion
    const a = Math.floor((th - tc) * 60 + 100), b = Math.floor(h * 6);
    const g = fbm((th - tc) * 9, h * 1.4, 3, 3);
    return g > 0.5 || hash2(a, b) > 0.78 ? P.gold : P.red;
  }
  if (!isWell && dd < 0.42 && h > CEIL.middle - 0.01) return frac(h * 2) < 0.15 ? P.gold : P.red;
  if (dd < 0.52 && h < 0.12) return isWell ? P.qingbai : 0;
  // radial tie beams (穿插枋) between eave and golden columns
  const dt = Math.abs(r * Math.sin(th - tc));
  if (r > R_GOLD_COL && r < R_EAVE_COL && dt < 0.22 && h > 5.6 && h < 6.3) return hexi(0, 0, (r - 9.8) / 2.3, (h - 5.6) / 0.7, 0.2);
  if (r > R_WELL_COL && r < R_GOLD_COL && dt < 0.25 && h > 11.3 && h < 12.1) return hexi(1, 1, (r - R_WELL_COL) / (R_GOLD_COL - R_WELL_COL), (h - 11.3) / 0.8, 0.8);
  // ceilings: the cell just under the next solid layer gets a coffer
  const c = ceilingAt(r);
  if (h >= c - 0.1) {
    if (r < 1.8) return goldDragonDisk(x, z);
    if (r < 3.6) return frac(r / 0.9) < 0.25 ? P.gold : coffer(x, z, 1);
    return coffer(x, z, r < R_TOP_IN ? 1 : 0);
  }
  // throne platform, screen and spirit tablet on the north side
  const tz = -z;
  if (Math.abs(x) < 2.3 && tz > 4.6 && tz < 7.2) {
    if (h < 0.9) {
      if (h > 0.8) return P.marbleLight;
      return frac(h / 0.3) < 0.2 ? P.marbleShade : P.marble;
    }
    if (h < 1.3 && (Math.abs(x) > 2.15 || tz < 4.75)) return frac(Math.abs(x) * 4) < 0.5 ? P.red : 0;
    if (tz > 6.85 && h < 4.4) {
      const top = 4.4 - Math.abs(x) * 0.25;
      if (h > top) return 0;
      const panel = frac((x + 2.3) / 0.92);
      if (panel < 0.06 || h > top - 0.12) return P.goldDim;
      return fbm(x * 3, h * 3, 9, 2) > 0.62 ? P.goldDim : P.screen;
    }
    if (Math.abs(x) < 0.9 && tz > 5.6 && tz < 6.6 && h < 2.3) {
      if (h < 1.5) return P.red;
      if (Math.abs(x) < 0.3 && tz < 6.0 && h < 2.2) return h > 1.6 && h < 2.1 ? P.qing : P.gold;
      return tz > 6.4 ? P.gold : 0;
    }
  }
  // altar table with vessels in front of the throne
  if (Math.abs(x) < 1.6 && tz > 3.4 && tz < 4.2) {
    if (h < 0.85) return h > 0.75 ? P.redBright : (Math.abs(x) > 1.5 || tz < 3.5 || tz > 4.1 ? P.redDark : 0);
    if (h < 1.05 && hash2(Math.floor(x / 0.2), 3) > 0.5 && frac(x / 0.2) < 0.5 && Math.abs(tz - 3.8) < 0.1) return hash2(Math.floor(x / 0.2), 9) > 0.5 ? P.gold : P.bronze;
  }
  // side altars (配位) east and west
  for (const sx of [-1, 1]) {
    const ax = x * sx;
    if (ax > 5.0 && ax < 7.4 && Math.abs(z + 1.0) < 1.5) {
      if (h < 0.6) return h > 0.5 ? P.marbleLight : P.marble;
      if (ax > 7.1 && h < 3.0) return fbm(z * 3, h * 3, 4, 2) > 0.6 ? P.goldDim : P.screen;
      if (ax > 6.0 && ax < 6.9 && Math.abs(z + 1.0) < 0.5 && h < 1.6) return h > 1.1 ? P.gold : P.red;
    }
  }
  return 0;
}

function goldDragonDisk(x, z) {
  const a = Math.atan2(x, z), r = Math.hypot(x, z);
  const coil = Math.abs(frac((a / TAU) * 2 + r * 0.9) - 0.5);
  if (r < 0.35) return P.goldPale;
  return coil < 0.16 ? P.goldPale : P.gold;
}

function floorCell(x, z, r, th) {
  if (r < 1.0) {
    // 龙凤石: marble with dark natural veins
    const n = fbm(x * 2.4 + 3, z * 2.4 - 1, 21, 4);
    return Math.abs(n - 0.5) < 0.04 ? P.dragonVein : P.dragonStone;
  }
  if (r < 1.1) return P.aiyeDark;
  const ring = Math.floor((r - 1.1) / 1.21);
  const fr = frac((r - 1.1) / 1.21);
  if (fr < 0.07) return P.aiyeDark;
  const n = 9 * (ring + 2);
  const fa = frac((th / TAU) * n);
  if (fa < 0.035) return P.aiyeDark;
  return hash2(ring, Math.floor((th / TAU) * n)) < 0.4 ? P.aiyeDark : P.aiye;
}

// ---------------------------------------------------------------- finial (鎏金宝顶)
function finialCell(r, th, h) {
  const [b0, b1] = FINIAL.base, [c0, c1] = FINIAL.collar, [g0, g1] = FINIAL.ball;
  if (h < b0 || h >= g1) return undefined;
  let rad, col;
  if (h < b1) {
    // blue glazed 须弥座 with a flared foot and gilded upper rim
    const q = (h - b0) / (b1 - b0);
    if (q < 0.1) rad = 1.62;
    else if (q < 0.18) rad = 1.52;
    else if (q < 0.42) rad = 1.5 - (q - 0.18) * 1.15;
    else if (q < 0.72) rad = 1.2;
    else if (q < 0.8) rad = 1.34;
    else if (q < 0.88) rad = 1.26;
    else rad = 1.02;
    if (q < 0.1 || (q >= 0.72 && q < 0.8)) col = P.ridgeLight;
    else if (q >= 0.42 && q < 0.72) col = frac(th / TAU * 36) < 0.18 ? P.goldDim : P.ridge;
    else if (q >= 0.88) col = P.goldDim;
    else col = P.ridge;
  } else if (h < c1) {
    const q = (h - c0) / (c1 - c0);
    rad = q < 0.12 ? 0.92 : q > 0.88 ? 0.95 : 0.8;
    col = q < 0.12 || q > 0.88 ? P.goldPale : (hash3(Math.floor(th * 30), Math.floor(q * 9), 5) > 0.55 ? P.goldDim : P.gold);
  } else {
    const q = (h - g0) / (g1 - g0);
    // vase-shaped pearl: 下口 1.23 m, 腰 1.98 m, 顶 1.55 m
    const prof = [[0, 0.62], [0.12, 0.74], [0.3, 0.92], [0.55, 0.99], [0.75, 0.94], [0.86, 0.82], [0.94, 0.6], [0.985, 0.32], [1, 0.0]];
    let i = 0;
    while (i < prof.length - 2 && prof[i + 1][0] < q) i++;
    const [qa, ra] = prof[i], [qb, rb] = prof[i + 1];
    const t = (q - qa) / (qb - qa);
    rad = ra + (rb - ra) * (t * t * (3 - 2 * t));
    col = P.gold;
  }
  return r <= rad ? col : 0;
}

// ---------------------------------------------------------------- plaque (九龙华带匾)
// 3.4 × 3.7 m, as measured on the south photograph: 9-voxel carved side bands, 3-voxel top and
// bottom bands, a 16 × 31 ultramarine field with raised gilt characters. It leans forward 0.2 voxel per row.
const PLAQUE = { cols: 34, rows: 37, fw: 9, fh: 3, h0: 16.75, z0: 7.5, tilt: 0.2, depth: 4 };
function plaqueCell(x, z, h) {
  const { cols, rows, fw, fh, depth } = PLAQUE;
  const ci = Math.floor(x / S + cols / 2);
  const ri = Math.floor((h - PLAQUE.h0) / S);
  if (ci < 0 || ci >= cols || ri < 0 || ri >= rows) return undefined;
  const zb = PLAQUE.z0 + ri * S * PLAQUE.tilt;
  const dz = Math.floor((z - zb) / S);
  if (dz < 0 || dz >= depth) return undefined;
  const FW = cols - 2 * fw, FH = rows - 2 * fh;
  const fc = ci - fw, fr = ri - fh;
  const front = dz === depth - 1;
  if (fc >= 0 && fc < FW && fr >= 0 && fr < FH) {
    const g = glyphAt(fc - (FW - GLYPH_W) / 2, FH - 2 - fr);
    if (front) return g ? P.goldPale : 0;
    if (dz === depth - 2) return g ? P.gold : P.plaqueBlue;
    return P.plaqueBlueDeep;
  }
  if (!front) return dz === depth - 2 ? P.gold : P.goldDim;
  // front relief: an outer and an inner bead, dragons climbing the side bands, pearls along the top and bottom
  if (ci === 0 || ci === cols - 1 || ri === 0 || ri === rows - 1) return P.goldPale;
  if (fc >= -1 && fc <= FW && fr >= -1 && fr <= FH) return P.goldPale;
  if (fc < 0 || fc >= FW) {
    const side = fc < 0 ? 0 : 1;
    const xs = side ? cols - 1 - ci : ci;
    const ph = (ri / rows) * TAU * 2.2 + side * 1.3;
    const xc = 4 + 2.0 * Math.sin(ph);
    const d = Math.abs(xs - xc);
    if (d < 1.15) return (ri + side) % 3 === 0 ? P.gold : P.goldPale;
    if (Math.sin(ph) > 0.93 && d < 2.3) return P.goldPale;                       // heads at the crests
    if (d > 2.0 && hash2(ci, ri + 77) > 0.8) return P.goldPale;                  // clouds
    return 0;
  }
  return ci % 3 === 1 ? P.goldPale : 0;
}

// ---------------------------------------------------------------- main pass
export function buildHall(vol) {
  const rMax = 15.0;
  const i0 = Math.floor(-rMax / S + NX / 2), i1 = Math.ceil(rMax / S + NX / 2);
  const ya = iyOf(FLOOR - 0.1), yb = iyOf(FLOOR + FINIAL.ball[1] + 0.1);
  let count = 0;
  for (let iy = ya; iy < yb; iy++) {
    const h = (iy - iyOf(FLOOR) + 0.5) * S;
    for (let iz = i0; iz < i1; iz++) {
      const z = cellZ(iz);
      const o = iy * vol.layer + iz * NX;
      for (let ix = i0; ix < i1; ix++) {
        const x = cellX(ix);
        const r = Math.hypot(x, z);
        if (r > rMax) continue;
        let th = Math.atan2(x, z);
        if (th < 0) th += TAU;
        let c;
        if (h < 0) {
          if (r < WALL_IN) vol.data[o + ix] = floorCell(x, z, r, th);
          continue;
        }
        c = cellAt(x, z, r, th, h);
        if (c) { vol.data[o + ix] = c; count++; }
      }
    }
  }
  return count;
}

function cellAt(x, z, r, th, h) {
  let c;
  if (r < 1.6) { c = finialCell(r, th, h); if (c !== undefined) return c; }
  c = plaqueCell(x, z, h); if (c !== undefined) return c;
  for (let k = 0; k < 3; k++) { c = roofCell(k, r, th, h); if (c !== undefined) return c; }
  for (let k = 0; k < 3; k++) { c = dougongCell(k, r, th, h); if (c !== undefined) return c; }
  for (let k = 0; k < 3; k++) { c = purlinCell(k, r, th, h); if (c !== undefined) return c; }
  c = groundCell(r, th, h); if (c !== undefined) return c;
  for (let k = 1; k < 3; k++) { c = drumCell(k, r, th, h); if (c !== undefined) return c; }
  // solid core above the ceilings and below the roof surfaces
  if (r < WALL_IN) {
    const ce = ceilingAt(r);
    if (h < ce) return interiorCell(x, z, r, th, h);
    if (h < ceilingAt(r) + 0.1) return interiorCell(x, z, r, th, h) || P.structure;
    // inside the envelope?
    if (r >= ROOFS[0].rIn) return h < roofT(0, r) ? P.structure : 0;
    if (r >= ROOFS[1].rIn) {
      if (r > STOREYS[1].face + 0.0 && h > STOREYS[1].ridge[0]) return 0;
      return h < roofT(1, r) ? P.structure : 0;
    }
    if (r >= ROOFS[2].rIn) {
      if (r > STOREYS[2].face && h > STOREYS[2].ridge[0]) return 0;
      return h < roofT(2, r) ? P.structure : 0;
    }
    return h < FINIAL.base[0] ? P.structure : 0;
  }
  return 0;
}
