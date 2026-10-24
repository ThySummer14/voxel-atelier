/* 建筑：宋式民间与寺观
 *
 * 考据约束：
 *  · 桥「画中有五六座」，主长桥「三十三组构架，共三十二跨……中间建桥亭」
 *  · 寺「两座」，主建筑为二层楼阁，上层宽五间深三四间，多置山顶
 *  · 村落「没有展示任何城堡、村庄、门墙和其他防御设施」→ **一律不加围墙**
 *  · 水磨「先在河上建砖坝，在坝上建房，下设水轮」，位置在山坳里
 *  · 水榭「在房子正厅中轴线前面修建临水亭」
 *  · 泥金只「复勾……殿宇、台、桥等轮廓」，不铺大面积
 *
 * 屋面统一用「举折」：坡面自檐口向脊凹曲（s^1.34），翼角起翘随角距三次方爬升。
 */
import { clamp, lerp, mulberry32, hash3 } from "../voxel/core.js";
import { topAt, heightAt } from "./terrain.js";
import * as P from "../palette.js";

/* ---------------------------------------------------------------- 屋面 */

/**
 * 悬山/歇山屋面，正脊沿 X。
 * @param o { hip: 收山做成歇山, lift: 翼角起翘, thick, gold: 泥金勾脊, thatch: 茅草 }
 */
export function gableRoof(g, cx, y, cz, w, d, rise, o = {}) {
  const tile = o.thatch ? P.THATCH : P.TILE;
  const tileLt = o.thatch ? P.THATCH_DK : P.TILE_LT;
  const tileDk = o.thatch ? P.THATCH_DK : P.TILE_DK;
  const ridgeM = o.gold ? P.GOLD : o.thatch ? P.THATCH_DK : P.INK_SOFT;
  const lift = o.lift ?? Math.max(1, Math.round(rise * 0.30));
  const thick = o.thick ?? 2;
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  const curve = o.thatch ? 1.15 : 1.42;

  for (let dz = -hd - 1; dz <= hd + 1; dz++) {
    const s = 1 - clamp(Math.abs(dz) / (hd + 1), 0, 1);      // 0 檐口 → 1 脊
    const yy = Math.round(y + rise * Math.pow(s, curve));
    /* 檐口外挑一格并起翘 */
    const corner = clamp((Math.abs(dz) - hd + 1) / 2, 0, 1);
    for (let dx = -hw - 1; dx <= hw + 1; dx++) {
      const endT = clamp((Math.abs(dx) - hw + 1) / 2, 0, 1);
      const tip = endT > 0 && corner > 0;
      const eaveY = tip ? yy + Math.round(lift * Math.pow(endT, 2.2)) : yy;
      if (Math.abs(dx) > hw + 1 || Math.abs(dz) > hd + 1) continue;
      const eave = Math.abs(dz) >= hd;                       // 檐口一线
      const rib = ((dx + 999) % 2 === 0);
      let m = rib ? tile : tileLt;
      if (s > 0.94) m = ridgeM;
      else if (eave) m = o.gold && rib ? P.GOLD_LT : tileDk;
      for (let k = 0; k < thick; k++) {
        const Y = eaveY - k;
        g.set(cx + dx, Y, cz + dz, k === 0 ? m : (s > 0.94 ? ridgeM : tileDk));
      }
      /* 檐下椽头：只在檐口露一格木色 */
      if (eave && !tip) g.setIfEmpty(cx + dx, eaveY - thick, cz + dz, rib ? P.WOOD : P.WOOD_LT);
    }
  }
  /* 鸱吻：正脊两端 */
  if (!o.thatch) {
    for (const s of [-1, 1]) {
      g.set(cx + s * (hw + 1), y + rise + 1, cz, o.gold ? P.GOLD_LT : P.INK);
      g.set(cx + s * (hw + 1), y + rise + 2, cz, o.gold ? P.GOLD : P.INK_SOFT);
    }
  }
  /* 歇山：两端收山，补三角形山花 */
  if (o.hip) {
    for (const s of [-1, 1])
      for (let dz = -hd; dz <= hd; dz++) {
        const s2 = 1 - clamp(Math.abs(dz) / (hd + 1), 0, 1);
        const yy = Math.round(y + rise * Math.pow(s2, curve));
        g.set(cx + s * hw, yy, cz + dz, P.WALL_DK);
      }
  }
  return y + rise;
}

/** 攒尖顶（亭、桥亭） */
export function pyramidRoof(g, cx, y, cz, r, rise, o = {}) {
  const tile = o.thatch ? P.THATCH : P.TILE;
  const tileLt = o.thatch ? P.THATCH_DK : P.TILE_LT;
  const R = r + 1;
  for (let dx = -R; dx <= R; dx++)
    for (let dz = -R; dz <= R; dz++) {
      const q = Math.max(Math.abs(dx), Math.abs(dz));
      if (q > R) continue;
      const s = 1 - clamp(q / R, 0, 1);
      const corner = clamp((q - r + 1) / 2, 0, 1) * clamp((Math.min(Math.abs(dx), Math.abs(dz)) - r + 2) / 2, 0, 1);
      const yy = Math.round(y + rise * Math.pow(s, 1.4) + corner * rise * 0.22);
      const rib = ((dx + dz + 999) % 2 === 0);
      const m = s > 0.9 ? (o.gold ? P.GOLD_LT : P.INK_SOFT) : q >= r ? P.TILE_DK : rib ? tile : tileLt;
      for (let k = 0; k < 2; k++) g.set(cx + dx, yy - k, cz + dz, k === 0 ? m : P.TILE_DK);
    }
  /* 宝顶 */
  g.set(cx, y + rise + 1, cz, o.gold ? P.GOLD : P.INK_SOFT);
  g.set(cx, y + rise + 2, cz, o.gold ? P.GOLD_LT : P.STONE_LT);
  return y + rise + 2;
}

/** 斗拱：檐下一跳，栌斗与间缝相间 */
function brackets(g, cx, y, cz, w, d, n) {
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  for (let dx = -hw; dx <= hw; dx++)
    for (let dz = -hd; dz <= hd; dz++) {
      const edge = Math.abs(dx) === hw || Math.abs(dz) === hd;
      if (!edge) continue;
      const on = ((Math.abs(dx) + Math.abs(dz)) % n) < n - 1;
      g.set(cx + dx, y, cz + dz, on ? P.WOOD_LT : P.REDWOOD);
      if (on) g.setIfEmpty(cx + dx, y + 1, cz + dz, P.WOOD);
    }
}

/* ---------------------------------------------------------------- 屋宇 */

/**
 * 单体屋宇。茅屋草舍（thatch）或瓦房。
 * @returns 屋脊高度
 */
export function house(g, cx, y, cz, w, d, wallH, o = {}) {
  const rnd = o.rnd ?? mulberry32(cx * 31 + cz * 17);
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  /* 台基 */
  if (o.plinth !== false)
    for (let dx = -hw - 1; dx <= hw + 1; dx++)
      for (let dz = -hd - 1; dz <= hd + 1; dz++)
        g.set(cx + dx, y - 1, cz + dz, rnd() > 0.7 ? P.STONE_LT : P.STONE);
  /* 墙身：白墙 + 木柱角 */
  for (let dx = -hw; dx <= hw; dx++)
    for (let dz = -hd; dz <= hd; dz++) {
      const edge = Math.abs(dx) === hw || Math.abs(dz) === hd;
      if (!edge) continue;
      const corner = Math.abs(dx) === hw && Math.abs(dz) === hd;
      for (let k = 0; k < wallH; k++) {
        const Y = y + k;
        let m = corner ? P.WOOD_DK : P.WALL;
        if (k === 0) m = P.WALL_DK;
        if (k === wallH - 1) m = P.WOOD;
        /* 门与窗：正面（+Z）居中开门，两侧开窗 */
        const front = dz === hd && dx === 0 && !corner;
        if (front && k < wallH - 2) m = k === 0 ? P.STONE_DK : P.WOOD_DK;
        const win = !corner && k > 1 && k < wallH - 1 &&
          ((dz === hd && Math.abs(dx) === Math.max(1, hw - 2)) || (dz === -hd && Math.abs(dx) === 1));
        if (win) m = P.WINDOW;
        g.set(cx + dx, Y, cz + dz, m);
      }
    }
  /* 室内地面 */
  for (let dx = -hw + 1; dx <= hw - 1; dx++)
    for (let dz = -hd + 1; dz <= hd - 1; dz++) g.set(cx + dx, y - 1, cz + dz, P.WOOD_DK);
  /* 檐枋 */
  for (let dx = -hw - 1; dx <= hw + 1; dx++)
    for (let dz = -hd - 1; dz <= hd + 1; dz++) {
      if (Math.abs(dx) <= hw - 1 && Math.abs(dz) <= hd - 1) continue;
      g.set(cx + dx, y + wallH, cz + dz, P.WOOD);
    }
  const rise = o.thatch ? Math.round(d * 0.62) : Math.round(d * 0.5);
  return gableRoof(g, cx, y + wallH + 1, cz, w + 2, d + 1, rise, o);
}

/** 院落：散列 / 一字 / 丁字 / 曲尺，**绝无门墙**（考据 #11） */
export function village(g, spec, rnd) {
  const laid = [];
  const n = spec.n;
  for (let i = 0; i < n; i++) {
    /* 螺旋撒点 + 抖动，落在缝隙地上 */
    const a = i * 2.399 + rnd() * 0.7;
    const r = spec.spread * (0.18 + 0.82 * Math.sqrt((i + rnd() * 0.6) / n));
    let x = Math.round(spec.cx + Math.cos(a) * r);
    let z = Math.round(spec.cz + Math.sin(a) * r * 0.72);
    /* 推到水岸附近：村落「大多画在山水边的缝隙地上」 */
    let best = null, bd = 1e9;
    for (let k = 0; k < 26; k++) {
      const px = x + Math.round((rnd() - 0.5) * 12), pz = z + Math.round((rnd() - 0.5) * 10);
      const t = topAt(px, pz);
      if (t < 1 || t > 26) continue;
      let water = 99;
      for (let d = 1; d <= 16; d++)
        if (topAt(px + d, pz) < 0 || topAt(px - d, pz) < 0 || topAt(px, pz + d) < 0 || topAt(px, pz - d) < 0) { water = d; break; }
      const sc = Math.abs(water - 7) * 2 + t;
      if (sc < bd) { bd = sc; best = { x: px, z: pz, t }; }
    }
    if (!best) continue;
    /* 避免压到已建 */
    if (laid.some((p) => Math.abs(p.x - best.x) < 9 && Math.abs(p.z - best.z) < 8)) continue;
    laid.push(best);

    const w = 5 + Math.floor(rnd() * 4);
    const d = 4 + Math.floor(rnd() * 3);
    const wh = 4 + Math.floor(rnd() * 2);
    const thatch = spec.kind !== "water" ? rnd() > 0.42 : rnd() > 0.66;
    const y = best.t + 1;
    levelPad(g, best.x, y - 1, best.z, w + 3, d + 3);
    house(g, best.x, y, best.z, w, d, wh, { thatch, rnd, plinth: !thatch });

    /* 丁字 / 曲尺：再挂一间偏房 */
    if (rnd() > 0.55) {
      const side = rnd() > 0.5 ? 1 : -1;
      const ox = best.x + side * (w + 3), oz = best.z + Math.round((rnd() - 0.5) * 3);
      if (topAt(ox, oz) > 0) {
        levelPad(g, ox, y - 1, oz, 6, 6);
        house(g, ox, y, oz, 4, 3, 3, { thatch: rnd() > 0.5, rnd });
      }
    }
    /* 篱笆不是围墙：只三两面矮竹篱，且必留口 */
    if (rnd() > 0.72) {
      const fx = best.x, fz = best.z + d + 2;
      for (let k = -5; k <= 5; k++) {
        if (Math.abs(k) < 2) continue;                       // 必留出入口
        const t = topAt(fx + k, fz);
        if (t < 1) continue;
        g.set(fx + k, t + 1, fz, P.BAMBOO);
        if (k % 2 === 0) g.set(fx + k, t + 2, fz, P.BAMBOO);
      }
    }
  }
  return laid;
}

/** 把建筑基座范围内的地表压平到 y */
function levelPad(g, cx, y, cz, w, d) {
  for (let dx = -w; dx <= w; dx++)
    for (let dz = -d; dz <= d; dz++) {
      const x = cx + dx, z = cz + dz;
      const t = topAt(x, z);
      if (t < 0) continue;
      if (t > y) g.set(x, y, z, P.EARTH);
    }
}

/* ---------------------------------------------------------------- 寺观 */

/** 二层楼阁：上层宽五间深三四间（考据 #10） */
export function temple(g, spec, rnd) {
  const t = topAt(spec.x, spec.z);
  if (t < 0) return null;
  const y = t + 1;
  const w = spec.w, d = spec.d;
  /* 石台基 + 踏道 */
  for (let k = 0; k < 3; k++) {
    const e = 3 - k;
    for (let dx = -w - e; dx <= w + e; dx++)
      for (let dz = -d - e; dz <= d + e; dz++) {
        const edge = Math.abs(dx) >= w + e - 1 || Math.abs(dz) >= d + e - 1;
        g.set(spec.x + dx, y - 1 + k - 2, spec.z + dz, edge ? (k === 2 ? P.STONE_LT : P.STONE) : P.STONE_DK);
      }
  }
  for (let s = 0; s < 7; s++)
    for (let dx = -3; dx <= 3; dx++)
      g.set(spec.x + dx, y - 1 - s, spec.z + d + 4 + s, s % 2 ? P.STONE : P.STONE_LT);

  const y1 = y + 2;
  /* 一层：五间，红柱白墙 */
  const h1 = 11;
  for (let dx = -w; dx <= w; dx++)
    for (let dz = -d; dz <= d; dz++) {
      const edge = Math.abs(dx) === w || Math.abs(dz) === d;
      if (!edge) continue;
      const bay = (dx + w) % Math.max(1, Math.floor((2 * w) / 5));
      for (let k = 0; k < h1; k++) {
        let m = P.WALL;
        if (Math.abs(dx) === w) m = P.REDWOOD;                       // 角柱
        else if (dz === d && Math.abs(dx) <= 1) m = k < h1 - 3 ? P.WOOD_DK : P.WALL;  // 门
        else if (bay === 0) m = P.REDWOOD;                           // 檐柱
        if (k === 0) m = P.STONE_DK;
        g.set(spec.x + dx, y1 + k, spec.z + dz, m);
      }
    }
  /* 一层檐 + 斗拱 */
  brackets(g, spec.x, y1 + h1, spec.z, w * 2 + 3, d * 2 + 3, 3);
  gableRoof(g, spec.x, y1 + h1 + 2, spec.z, w * 2 + 6, d * 2 + 4, 7, { gold: true, hip: true });

  /* 平座 + 二层：宽五间、深三四间 */
  const y2 = y1 + h1 + 9;
  for (let dx = -w - 1; dx <= w + 1; dx++)
    for (let dz = -d - 1; dz <= d + 1; dz++) {
      const edge = Math.abs(dx) >= w || Math.abs(dz) >= d;
      g.set(spec.x + dx, y2 - 1, spec.z + dz, edge ? P.STONE_LT : P.WOOD_DK);
      if (edge) {
        g.set(spec.x + dx, y2, spec.z + dz, P.STONE);
        if ((Math.abs(dx) + Math.abs(dz)) % 4 === 0) g.set(spec.x + dx, y2 + 1, spec.z + dz, P.STONE_LT);
        if ((Math.abs(dx) + Math.abs(dz)) % 4 === 0) g.set(spec.x + dx, y2 + 2, spec.z + dz, P.GOLD);
      }
    }
  const w2 = Math.max(3, w - 2), d2 = Math.max(2, d - 2), h2 = 9;
  for (let dx = -w2; dx <= w2; dx++)
    for (let dz = -d2; dz <= d2; dz++) {
      const edge = Math.abs(dx) === w2 || Math.abs(dz) === d2;
      if (!edge) continue;
      for (let k = 0; k < h2; k++) {
        let m = P.WALL;
        if (Math.abs(dx) === w2 || (dz === d2 && Math.abs(dx) % 3 === 0)) m = P.REDWOOD;
        if (dz === d2 && Math.abs(dx) <= 1 && k < h2 - 3) m = P.WINDOW;
        if (dz === -d2 && Math.abs(dx) > 1 && Math.abs(dx) < w2 && k > 1 && k < h2 - 3) m = P.WINDOW;
        g.set(spec.x + dx, y2 + 1 + k, spec.z + dz, m);
      }
    }
  brackets(g, spec.x, y2 + h2 + 1, spec.z, w2 * 2 + 3, d2 * 2 + 3, 3);
  const topY = gableRoof(g, spec.x, y2 + h2 + 3, spec.z, w2 * 2 + 7, d2 * 2 + 5, 9, { gold: true, hip: true, lift: 3 });
  /* 宝顶 */
  g.set(spec.x, topY + 1, spec.z, P.GOLD);
  g.set(spec.x, topY + 2, spec.z, P.GOLD_LT);
  g.set(spec.x, topY + 3, spec.z, P.GOLD);
  /* 匾 */
  for (let dx = -2; dx <= 2; dx++) g.set(spec.x + dx, y2 + h2 - 1, spec.z + d2 + 1, P.GOLD_LT);
  return { topY };
}

/* ---------------------------------------------------------------- 桥 */

/** 长桥：32 跨，每跨木梁铺木板，中间建桥亭（考据 #9） */
export const BRIDGE_DECK_Y = 9;
export const BRIDGE_CAMBER = 7;

export function longBridge(g, spec) {
  const n = spec.spans;
  const L = Math.hypot(spec.x1 - spec.x0, spec.z1 - spec.z0);
  const span = L / n;
  const dx = (spec.x1 - spec.x0) / L, dz = (spec.z1 - spec.z0) / L;
  const nx = -dz, nz = dx;
  const hw = Math.floor(spec.deck / 2);
  const deckY = BRIDGE_DECK_Y;
  const camber = BRIDGE_CAMBER;
  const piers = [];
  const deck = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const cx = spec.x0 + (spec.x1 - spec.x0) * t;
    const cz = spec.z0 + (spec.z1 - spec.z0) * t;
    const y = Math.round(deckY + camber * Math.sin(Math.PI * t));
    /* 桥墩：三十三组构架 → 每组三根桩，自水面下打起 */
    for (const s of [-hw, 0, hw]) {
      const px = Math.round(cx + nx * s), pz = Math.round(cz + nz * s);
      for (let k = -2; k <= y - 1; k++) g.set(px, k, pz, k > y - 4 ? P.WOOD_LT : P.WOOD_DK);
    }
    piers.push({ x: Math.round(cx), z: Math.round(cz), y });
    /* 桥面：每跨木梁 + 木板 */
    const steps = Math.ceil(span);
    for (let k = 0; k < steps; k++) {
      const tt = Math.min(1, (i + k / steps) / n);
      const bx = spec.x0 + (spec.x1 - spec.x0) * tt;
      const bz = spec.z0 + (spec.z1 - spec.z0) * tt;
      const by = Math.round(deckY + camber * Math.sin(Math.PI * tt));
      for (let s = -hw; s <= hw; s++) {
        const px = Math.round(bx + nx * s), pz = Math.round(bz + nz * s);
        const beam = k === 0 || k === steps - 1;
        g.set(px, by - 1, pz, beam ? P.WOOD_DK : P.WOOD);
        g.set(px, by, pz, (Math.abs(s) === hw) ? P.WOOD_LT : (Math.round(tt * n * 3) % 2 ? P.WOOD_LT : P.WOOD));
        deck.push({ x: px, y: by, z: pz });
      }
      /* 栏杆：望柱每 4 格一根，栏板两道 */
      for (const s of [-hw, hw]) {
        const px = Math.round(bx + nx * s), pz = Math.round(bz + nz * s);
        const post = (i * steps + k) % 4 === 0;
        if (post) {
          g.set(px, by + 1, pz, P.WOOD_LT);
          g.set(px, by + 2, pz, P.WOOD_LT);
          g.set(px, by + 3, pz, P.WOOD);
        } else {
          g.set(px, by + 2, pz, P.WOOD);
        }
      }
    }
  }

  /* 桥亭：中间建桥亭（第 spec.pavilion 跨） */
  const pt = spec.pavilion / n;
  const px = Math.round(spec.x0 + (spec.x1 - spec.x0) * pt);
  const pz = Math.round(spec.z0 + (spec.z1 - spec.z0) * pt);
  const py = Math.round(deckY + camber * Math.sin(Math.PI * pt));
  const COLS = [[-hw, -2], [hw, -2], [-hw, 2], [hw, 2]];
  for (const [sx, sz] of COLS) {
    /* 角柱要同时沿桥纵向（sx）和横向（sz）错开：只偏横向的话四根柱子会
       两两重合，桥亭读成一根门框。 */
    const cxp = Math.round(px + nx * sz + dx * sx);
    const czp = Math.round(pz + nz * sz + dz * sx);
    for (let k = 1; k <= 8; k++) g.set(cxp, py + k, czp, P.REDWOOD);
  }
  for (let dd = -3; dd <= 3; dd++)
    for (let s = -hw - 1; s <= hw + 1; s++) {
      const qx = Math.round(px + nx * dd), qz = Math.round(pz + nz * dd);
      g.set(qx + Math.round(dx * s), py + 9, qz + Math.round(dz * s), P.WOOD);
    }
  pyramidRoof(g, px, py + 10, pz, hw + 2, 7, { gold: true });
  lampAt(g, px, py + 1, pz);

  return { piers: piers.length, deckLen: deck.length, px, pz, py };
}

/** 小桥 / 板桥 / 草桥 */
export function smallBridge(g, spec) {
  const L = Math.hypot(spec.x1 - spec.x0, spec.z1 - spec.z0);
  const steps = Math.max(2, Math.ceil(L));
  /* ux/uz 是单位方向；dx/dz 是每步增量。法线必须取单位方向的垂线——
     早先用「每步增量 / L」当法线，长度约 1/L，整条桥被压成一格宽的线。 */
  const ux = (spec.x1 - spec.x0) / L, uz = (spec.z1 - spec.z0) / L;
  const dx = ux * (L / steps), dz = uz * (L / steps);
  const nx = -uz, nz = ux;
  const hw = Math.floor(spec.w / 2);
  const y0 = Math.max(2, topAt(Math.round(spec.x0), Math.round(spec.z0)) + 1);
  const y1 = Math.max(2, topAt(Math.round(spec.x1), Math.round(spec.z1)) + 1);
  const base = Math.max(y0, y1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = spec.x0 + dx * i, cz = spec.z0 + dz * i;
    const y = Math.round(base + spec.arch * Math.sin(Math.PI * t));
    for (let s = -hw; s <= hw; s++) {
      const px = Math.round(cx + nx * s), pz = Math.round(cz + nz * s);
      const m = spec.k === "grass" ? (i % 2 ? P.THATCH : P.THATCH_DK) : spec.k === "plank" ? P.WOOD : P.STONE_LT;
      g.set(px, y, pz, m);
      g.set(px, y - 1, pz, spec.k === "grass" ? P.WOOD_DK : P.STONE);
      for (let k = y - 2; k >= -1; k--) g.setIfEmpty(px, k, pz, P.WOOD_DK);
    }
    /* 板桥「无栏杆」；草桥也无；只有 small 有 */
    if (spec.k === "small")
      for (const s of [-hw, hw]) {
        const px = Math.round(cx + nx * s), pz = Math.round(cz + nz * s);
        if (i % 3 === 0) { g.set(px, y + 1, pz, P.STONE); g.set(px, y + 2, pz, P.STONE_LT); }
        else g.set(px, y + 2, pz, P.STONE);
      }
  }
  return { steps };
}

/* ---------------------------------------------------------------- 水榭 · 水磨 · 隐居 */

/** 临水亭：正厅中轴线前面临水建的亭（考据 #13） */
export function waterPavilion(g, spec) {
  /* 自 spec.z 向 +Z 走出岸线，再退回水里四格：亭子要真的临水 */
  let z = clamp(spec.z, -180, 180);
  while (z < 180 && topAt(spec.x, z) >= 0) z++;
  while (z > -180 && topAt(spec.x, z) < 0) z--;
  z = Math.min(180, z + 4);
  const y = 3;
  const w = spec.w;
  /* 石柱础 + 木柱，直接立在水里 */
  for (const [ox, oz] of [[-w, -w], [w, -w], [-w, w], [w, w], [0, 0]])
    for (let k = -3; k <= 7; k++) g.set(spec.x + ox, y + k, z + oz, k < 0 ? P.STONE_DK : P.REDWOOD);
  for (let dx = -w - 1; dx <= w + 1; dx++)
    for (let dz = -w - 1; dz <= w + 1; dz++) g.set(spec.x + dx, y + 8, z + dz, P.WOOD);
  /* 美人靠 */
  for (let dx = -w; dx <= w; dx++)
    for (let dz = -w; dz <= w; dz++) {
      if (Math.abs(dx) !== w && Math.abs(dz) !== w) continue;
      if (dz === -w && Math.abs(dx) < 2) continue;                     // 与正厅相接处留口
      g.set(spec.x + dx, y + 1, z + dz, P.WOOD_LT);
      if ((dx + dz) % 3 === 0) g.set(spec.x + dx, y + 2, z + dz, P.REDWOOD);
    }
  pyramidRoof(g, spec.x, y + 9, z, w + 2, 8, { gold: true });
  lampAt(g, spec.x, y + 1, z);
  return { x: spec.x, z, y: y + 1 };
}

/** 水磨：河上砖坝，坝上建房；水轮写入独立 wheel 场（考据 #12）。 */
export function mill(g, spec, wheel = null) {
  let z = clamp(spec.z, -180, 180);
  let tries = 0;
  while (tries++ < 60 && z < 180 && topAt(spec.x, z) >= 0) z += 1;
  while (tries++ < 120 && z > -180 && topAt(spec.x, z) < 0) z -= 1;
  const x = spec.x;
  const y = 2;
  /* 砖坝横在水口 */
  for (let dz = -3; dz <= 3; dz++)
    for (let k = -2; k <= 3; k++)
      for (let dx = -spec.dam / 2; dx <= spec.dam / 2; dx++)
        g.set(Math.round(x + dx), y + k, Math.round(z + dz), k === 3 ? P.STONE_LT : (Math.round(x + dx) % 3 === 0 ? P.BRICK : P.STONE_DK));
  /* 磨房立在坝上 */
  house(g, x, y + 4, z, 9, 6, 5, { thatch: false, gold: false });
  /* 水轮：竖轮，直径 spec.wheel；不写入主 Grid，便于单独切块和剔除。 */
  const r = spec.wheel;
  const wx = x + 7, wy = y + 1, wz = z + 5;
  if (wheel) {
    for (let a = 0; a < 360; a += 6) {
      const rad = (a * Math.PI) / 180;
      const px = Math.round(wx + Math.cos(rad) * r), py = Math.round(wy + Math.sin(rad) * r);
      wheel.set(px, py, wz, P.WOOD_LT);
      wheel.set(px, py, wz + 1, P.WOOD);
      /* 轮辐 */
      for (let s = 0.3; s < 1; s += 0.22)
        wheel.setIfEmpty(Math.round(wx + Math.cos(rad) * r * s), Math.round(wy + Math.sin(rad) * r * s), wz, P.WOOD_DK);
    }
    wheel.set(wx, wy, wz, P.WOOD_DK); wheel.set(wx, wy, wz + 1, P.WOOD_DK);
  }
  /* 引水槽仍属于磨坊主体 */
  for (let k = 0; k < 10; k++) { g.set(x + 4 + k, y + r + 1, wz, P.WOOD); g.set(x + 4 + k, y + r, wz - 1, P.WOOD_DK); }
  return {
    x, z, y,
    wheelR: r,
    wheelX: wx,
    wheelY: wy,
    wheelZ: wz,
    wheelAxis: { x: wx, y: wy, z: wz },
    wheelBlocks: wheel ? wheel.count : 0,
  };
}

/** 崖上隐居：立在陡坡上的小屋，用木柱架空（考据 #「悬崖之上的隐居」） */
export function hermitage(g, spec) {
  const t = topAt(spec.x, spec.z);
  if (t < 0) return null;
  const y = t + 1;
  /* 找下方更低的坡面，架柱 */
  for (let dx = -spec.w; dx <= spec.w; dx++)
    for (let dz = -spec.w; dz <= spec.w; dz++) {
      const x = spec.x + dx, z = spec.z + dz;
      const tt = topAt(x, z);
      if (tt < 0 || tt >= y - 1) continue;
      for (let k = tt + 1; k < y - 1; k++) g.set(x, k, z, k % 3 === 0 ? P.WOOD_LT : P.WOOD_DK);
    }
  house(g, spec.x, y, spec.z, spec.w * 2 - 1, spec.w * 2 - 2, 4, { thatch: true });
  /* 门前一小片平台与石灯 */
  g.set(spec.x + spec.w + 1, y - 1, spec.z, P.STONE_LT);
  g.set(spec.x + spec.w + 1, y, spec.z, P.STONE);
  lampAt(g, spec.x + spec.w + 1, y + 1, spec.z);
  return { x: spec.x, z: spec.z, y };
}

/** 一处灯：最里一格是灯芯（LAMP_CORE，发光强度 2.4），
 *  外圈空格各点一盏灯罩（LAMP）。旧版只有 LAMP，于是
 *  ① emitCore 那一组网格恒为 0 面、材质与分组全是死码；
 *  ② 夜里全卷一百多盏灯都是同样大小的一颗点， bloom 吃不到面积，
 *    「渔火」读成撒了一把芝麻而不是灯火。 */
export function lampAt(g, x, y, z) {
  g.set(x, y, z, P.LAMP_CORE);
  /* 只铺四侧，留出顶底：六个方向全围的话灯芯被自己的光晕包死，
     面剔除会把芯剔成 0 面（emitCore 组整组消失，实测踩过）。 */
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
    g.setIfEmpty(x + dx, y, z + dz, P.LAMP);
}

/** 石灯（野渡、村口） */
export function stoneLantern(g, x, y, z) {
  g.set(x, y, z, P.STONE_DK);
  g.set(x, y + 1, z, P.STONE);
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.set(x + a, y + 2, z + b, P.STONE_LT);
  lampAt(g, x, y + 2, z);
  g.set(x, y + 3, z, P.STONE_LT);
  g.setIfEmpty(x, y + 4, z, P.STONE);
}
