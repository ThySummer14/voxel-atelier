/* 《琉璃浮屠》主体：八面九层永乐大报恩寺琉璃塔
 * 每层构件（自下而上）：塔身（白琉璃 + 逐层旋转 45° 的四面券门 + 五色琉璃壁）
 *   → 平座栏杆 → 斗拱 → 出檐（凹曲屋面 + 翼角起翘 + 滴水 + 角梁套兽 + 风铃 + 檐灯）
 * 顶部：仰莲 + 覆钵 + 九层相轮 + 宝珠 + 八道铁索
 */
import { Grid, octR, clamp, lerp, rotXZ } from "../voxel/core.js";
import {
  GLZ_WHITE, GLZ_WHITE_DK, GLZ_YELLOW, GLZ_GREEN, GLZ_RED, GLZ_BROWN, GLZ_BLUE,
  TILE_Y, TILE_Y_DK, TILE_Y_LT, TILE_G, RIDGE,
  RED, RED_DK, RED_LT, WOOD, WOOD_DK, WOOD_LT,
  PAINT_BLUE, PAINT_GREEN, PAINT_LITE, GOLD, GOLD_LT, BRONZE,
  MARBLE, MARBLE_LT, STONE, STONE_LT, STONE_DK,
  LANTERN, LANTERN_CORE, WINDOW, DARK,
} from "../palette.js";

const SQ = Math.SQRT1_2;
export const STORIES = 9;

/** 八分面极坐标：side = 0..7（0 = +X 面心），u = 面内 -1..1，r = 八边形半径 */
export function polar(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const r = Math.max(ax, az, (ax + az) * SQ);
  const ang = Math.atan2(z, x);
  const step = Math.PI / 4;
  const k = Math.round(ang / step);
  const side = ((k % 8) + 8) % 8;
  const u = clamp((ang / step - k) * 2, -1, 1);
  return { side, u, r };
}

/** 每层几何参数 */
export function tier(i) {
  const t = i / (STORIES - 1);
  return {
    i, t,
    a: Math.round(lerp(31, 12.5, Math.pow(t, 0.86)) * 2) / 2, // 塔身内切半径
    hb: Math.round(lerp(27, 14, t)),                          // 塔身净高
    he: Math.round(lerp(10, 6, t)),                           // 檐部总高
    ov: Math.round(lerp(13, 6.5, t)),                         // 出檐水平深度
    lift: Math.round(lerp(4.5, 2, t)),                        // 翼角起翘
  };
}

export function tierBaseY() {
  const ys = [];
  let y = 0;
  for (let i = 0; i < STORIES; i++) {
    ys.push(y);
    const p = tier(i);
    y += p.hb + p.he;
  }
  return ys;
}

export const BODY_TOP = (() => {
  const ys = tierBaseY();
  return ys[STORIES - 1] + tier(STORIES - 1).hb;
})();

const PANEL = [GLZ_YELLOW, GLZ_GREEN, GLZ_RED, GLZ_BROWN, GLZ_BLUE];

function wallShell(g, a, t, y0, y1, fn) {
  const R = Math.ceil(a * 1.2072) + 1;
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const r = octR(x, z);
      if (r > a + 0.5 || r <= a - t) continue;
      const { side, u } = polar(x, z);
      for (let y = y0; y <= y1; y++) {
        const m = fn(side, u, y - y0, r, x, z, y);
        if (m) g.set(x, y, z, m);
      }
    }
}

function ring(g, a, w, y, fn) {
  const R = Math.ceil(a * 1.2072) + 1;
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const r = octR(x, z);
      if (r > a + 0.5 || r <= a - w) continue;
      const { side, u } = polar(x, z);
      const m = fn(side, u, r, x, z);
      if (m) g.set(x, y, z, m);
    }
}

/* ---------------------------------------------------------- 塔身 */
function body(g, p, y0) {
  const { a, hb } = p;
  const doorSides = new Set([0, 2, 4, 6].map((s) => (s + (p.i % 2)) % 8));
  const topBand = hb - 3;

  wallShell(g, a, 3, y0, y0 + hb - 1, (side, u, ly, r) => {
    if (r <= a - 2.4) return 0;
    if (ly === 0) return STONE_DK;
    if (ly === 1) return STONE;
    if (ly === 2) return STONE_LT;
    if (ly >= topBand) {
      if (ly === hb - 1) return PAINT_LITE;
      if (ly === hb - 2) return RED_LT;
      return RED;
    }
    const q = Math.abs(u);
    const outer = r > a - 1.2;

    if (doorSides.has(side)) {
      /* 券门：门向逐层错开 45° */
      if (q < 0.30) {
        const dh = (hb - 6) * 0.8;
        const arch = dh * (1 - 0.4 * Math.pow(q / 0.3, 2.6));
        if (ly > 3 && ly < 4 + arch) return 0;
        if (ly === Math.round(4 + arch) && outer) return GLZ_WHITE_DK;
        if (q > 0.235 && outer) return GLZ_WHITE_DK;
        return GLZ_WHITE;
      }
      /* 门侧琉璃窗（夜间透光） */
      if (q > 0.5 && q < 0.7 && ly > hb * 0.4 && ly < hb * 0.64) {
        const frame = q < 0.555 || q > 0.645 || ly < hb * 0.45 || ly > hb * 0.59;
        return frame ? GLZ_WHITE_DK : outer ? WINDOW : GLZ_WHITE_DK;
      }
      if (q > 0.88) return GLZ_WHITE_DK;
      return GLZ_WHITE;
    }

    /* 非门面：整面五色琉璃壁，白琉璃边框与角柱 */
    if (q > 0.86) return GLZ_WHITE_DK;
    if (q > 0.7) return GLZ_WHITE;
    if (ly === 4 || ly === topBand - 1) return GLZ_WHITE_DK;
    const ci = (p.i * 4 + side) % PANEL.length;
    return r > a - 2.2 ? PANEL[ci] : GLZ_WHITE_DK;
  });

  /* 门洞内佛龛灯火 */
  for (const side of doorSides) {
    const ang = side * (Math.PI / 4);
    const [dx, dz] = rotXZ(1, 0, ang);
    const ix = Math.round((a - 4.2) * dx), iz = Math.round((a - 4.2) * dz);
    for (let k = 0; k < 3; k++) {
      const yy = y0 + 4 + k * 2;
      if (g.get(ix, yy, iz) === 0) g.set(ix, yy, iz, k === 1 ? LANTERN : DARK);
    }
  }

  /* ---- 平座与栏杆 ---- */
  const yP = y0 + hb - 1;
  const ap = a + 3;
  ring(g, ap, 3.6, yP, () => MARBLE);
  ring(g, ap, 3.6, yP - 1, (s, u, r) => (r > ap - 1.4 ? STONE : 0));
  ring(g, ap + 0.3, 1.3, yP + 1, () => STONE_LT);
  ring(g, ap + 0.3, 1.3, yP + 2, () => MARBLE);
  ring(g, ap + 0.3, 1.3, yP + 3, (s, u) => {
    const q = Math.abs(u);
    return q > 0.965 || Math.abs(q - 0.47) < 0.075 ? MARBLE_LT : MARBLE;
  });
  ring(g, ap + 0.3, 1.3, yP + 4, (s, u) => {
    const q = Math.abs(u);
    return q > 0.965 || Math.abs(q - 0.47) < 0.075 ? MARBLE_LT : RED;
  });
  ring(g, ap + 0.3, 1.3, yP + 5, (s, u) => {
    const q = Math.abs(u);
    return q > 0.975 || Math.abs(q - 0.47) < 0.04 ? GOLD_LT : 0;
  });

  /* ---- 斗拱：逐跳外挑，栌斗与间缝相间 ---- */
  const yB = yP + 6;
  const rows = Math.max(2, p.he - 4);
  for (let k = 0; k < rows; k++) {
    const aB = a + 1.2 + (k + 1) * ((p.ov - 2.4) / rows);
    ring(g, aB, 2.6, yB + k, (side, u, r, x, z) => {
      const t = (((Math.atan2(z, x) / (Math.PI / 8)) % 1) + 1) % 1;
      const on = t < 0.46;
      if (k === rows - 1) return on ? RED : RED_DK;
      return on ? (k % 2 ? WOOD : WOOD_LT) : PAINT_BLUE;
    });
  }
  return { yEave: yB + rows, ap };
}

/* ---------------------------------------------------------- 屋檐
 * 以“正八边形边界极坐标”生成凹曲屋面：s=0 为檐口、s=1 为塔身壁面，
 * 翼角起翘随角距（面心→角）三次方爬升，保证曲面连续不撕裂。
 */
function eave(g, p, yEave) {
  const { a, ov, lift } = p;
  const rTip = a + 2 + ov;
  const rise = Math.max(3, Math.round((rTip - a) * 0.40));
  const STEP = Math.PI / 4, HALF = STEP / 2;
  const rIn = a * 0.9;
  const R = Math.ceil(rTip * 1.0825) + 1;

  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const rho = Math.hypot(x, z);
      if (rho < rIn || rho > rTip + 1.2) continue;
      const ang = Math.atan2(z, x);
      let d = ((ang % STEP) + STEP) % STEP;
      d = Math.abs(d - HALF);
      const rb = a / Math.cos(d);
      const rt = rTip / Math.cos(d);
      if (rho > rt) continue;
      const s = clamp((rt - rho) / (rt - rb), 0, 1);
      const cornerT = d / HALF;
      /* 顶层作攒尖：坡面越过壁面后继续向心升高，收口于塔刹 */
      const crown = p.i === STORIES - 1 && rho < rb ? (rb - rho) * 0.46 : 0;
      const y = Math.round(
        yEave + rise * Math.pow(s, 1.34) + crown + lift * Math.pow(cornerT, 3.6) * Math.pow(1 - s, 1.4)
      );
      const rib = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 72);
      const ridge = cornerT > 0.96 && s > 0.25;
      let top;
      if (s < 0.085) top = TILE_Y_LT;
      else if (ridge) top = GOLD;
      else if (s < 0.26) top = TILE_G;
      else top = TILE_Y;
      const thick = (s > 0.86 || crown > 1) ? 3 : 1;
      for (let k = 0; k < thick; k++) {
        const m = k === 0 ? top : ridge ? RIDGE : TILE_Y_DK;
        g.set(x, y - k, z, m);
      }
      /* 檐下：整体压暗，只在檐口一线露椽头 */
      const yu = y - thick;
      if (g.get(x, yu, z) === 0 && s < 0.14)
        g.set(x, yu, z, rib % 2 === 0 ? WOOD_LT : WOOD);
    }

  /* 角梁端套兽、风铃、檐灯 */
  const rt = rTip / Math.cos(HALF), rb = a / Math.cos(HALF);
  const eaveY = (rho) => {
    const s = clamp((rt - rho) / (rt - rb), 0, 1);
    return Math.round(yEave + rise * Math.pow(s, 1.34) + lift * Math.pow(1 - s, 1.4));
  };
  for (let t = 0; t < 8; t++) {
    const ang = t * (Math.PI / 4);
    const [dx, dz] = rotXZ(1, 0, ang);
    const rr = rt - 0.9;
    const cx = Math.round(rr * dx), cz = Math.round(rr * dz);
    const cy = eaveY(rr);
    g.set(cx, cy, cz, BRONZE);                            /* 套兽：与瓦面齐平，不许冒尖 */
    for (let k = 1; k <= 2; k++) g.set(cx, cy - k, cz, k === 2 ? GOLD : BRONZE);
    const lx = Math.round((rr - 3) * dx), lz = Math.round((rr - 3) * dz);
    const ly = eaveY(rr - 3);
    g.set(lx, ly - 1, lz, LANTERN);
    g.set(lx, ly - 2, lz, LANTERN_CORE);
  }
}

/* ---------------------------------------------------------- 塔刹 */
function finial(g, y0, aBase) {
  let y = y0;
  /* 刹座封盘：堵住攒尖收口 */
  for (let k = 0; k < 3; k++) ring(g, aBase + 2.6 - k * 0.5, aBase + 3, y + k, () => (k === 2 ? STONE_LT : STONE));
  y += 3;
  ring(g, aBase + 1.5, 3, y, () => STONE); y++;
  ring(g, aBase + 0.5, 3, y, () => STONE_LT); y++;
  for (let k = 0; k < 3; k++)
    ring(g, aBase - k * 0.9, 2.6, y + k, (s, u) => (Math.abs(u) > 0.5 ? GOLD : GOLD_LT));
  y += 3;
  g.ellipsoid(0, y + 2.5, 0, aBase * 0.62, 3.4, aBase * 0.62, (x, yy, z) =>
    yy > y + 2.5 ? GOLD_LT : GOLD);
  y += 6;
  for (let k = 0; k < 9; k++) {
    const rr = Math.max(1.4, 5.0 - k * 0.40);
    ring(g, rr, rr - 0.2, y + k * 2, () => (k % 2 ? GOLD : BRONZE));
    g.set(0, y + k * 2, 0, BRONZE);
    if (k < 8) { g.set(0, y + k * 2 + 1, 0, BRONZE); }
  }
  y += 17;
  ring(g, 4.4, 4.2, y, () => GOLD);                      /* 宝盖 */
  g.ellipsoid(0, y + 4.2, 0, 2.9, 3.2, 2.9, (x, yy, z) => (yy > y + 4.2 ? GOLD_LT : GOLD));  /* 宝珠 */
  g.ellipsoid(0, y + 8.0, 0, 1.5, 2.6, 1.5, () => GOLD_LT);
  g.set(0, y + 11, 0, GOLD_LT);
  g.set(0, y + 12, 0, GOLD);
  return y + 13;
}

/* ---------------------------------------------------------- 铁索 */
function chains(g, topY, aBase) {
  const ys = tierBaseY();
  for (let s = 0; s < 8; s++) {
    const ang = s * (Math.PI / 4);
    const [dx, dz] = rotXZ(1, 0, ang);
    for (let i = 4; i < STORIES; i += 2) {
      const p = tier(i);
      const r0 = aBase + 1, r1 = p.a + 2 + p.ov;
      const y0 = topY - 6, y1 = ys[i] + p.hb + p.he - 3;
      const steps = 40;
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const r = lerp(r0, r1, t);
        const yy = lerp(y0, y1, t) - Math.sin(t * Math.PI) * 2.2;
        const X = Math.round(r * dx), Z = Math.round(r * dz), Y = Math.round(yy);
        if (g.get(X, Y, Z) === 0) g.set(X, Y, Z, BRONZE);
        const nx = Math.round(lerp(r0, r1, (k + 1) / steps) * dx);
        const nz = Math.round(lerp(r0, r1, (k + 1) / steps) * dz);
        const ny = Math.round(lerp(y0, y1, (k + 1) / steps) - Math.sin(((k + 1) / steps) * Math.PI) * 2.2);
        for (let m = 0; m <= Math.max(Math.abs(nx - X), Math.abs(ny - Y), Math.abs(nz - Z)); m++) {
          const tt = m / Math.max(1, Math.max(Math.abs(nx - X), Math.abs(ny - Y), Math.abs(nz - Z)));
          const px = Math.round(X + (nx - X) * tt), py = Math.round(Y + (ny - Y) * tt), pz = Math.round(Z + (nz - Z) * tt);
          if (g.get(px, py, pz) === 0) g.set(px, py, pz, BRONZE);
        }
      }
    }
  }
}

/* ---------------------------------------------------------- 装配 */
export function buildTower(g, oy = 0) {
  const ys = tierBaseY().map((y) => y + oy);
  for (let i = 0; i < STORIES; i++) {
    const p = tier(i);
    p.i = i;
    const { yEave } = body(g, p, ys[i]);
    eave(g, p, yEave);
  }
  const topY = finial(g, ys[STORIES - 1] + tier(STORIES - 1).hb, tier(STORIES - 1).a);
  // 铁索在体素尺度下读作脚手架，舍弃：留白给塔刹本身
  return {
    grid: g,
    meta: { ys, topY, bodyTop: BODY_TOP + oy, tiers: Array.from({ length: STORIES }, (_, i) => tier(i)) },
  };
}

export const TOWER_HEIGHT = BODY_TOP + 36;
