/* 生灵：「人物虽细小如豆，却动态鲜明」（故宫名画记）
 *
 * 尺度基准：人物 4 格高 ≈ 1.75 m → 1 格 ≈ 0.44 m。
 * 全卷尺度都按这个基准读：长桥 32 跨每跨约 3.9 m，屋宇面阔三间约 5 m。
 * 山高是被散点透视压过的，不按此基准换算——这是画，不是测绘。
 *
 * 数量：人物约 250、牲畜 13、船约 70、飞鸟 2 群、鹤 2（考据 #3，数字为网络统计口径，
 *       与古建专业口径矛盾，取此一套并在展签声明）。
 */
import { WORLD, VILLAGES, FERRIES, TEMPLES } from "./score.js";
import { topAt, slopeAt } from "./terrain.js";
import { mulberry32, hash3 } from "../voxel/core.js";
import { lampAt } from "./arch.js";
import * as P from "../palette.js";

/* ---------------------------------------------------------------- 人物 */

const CLOTHES = [P.CLOTH_W, P.CLOTH_B, P.CLOTH_R, P.CLOTH_G, P.CLOTH_W, P.CLOTH_B];

/**
 * 4 格高的人物。pose 决定姿态——「动态鲜明」全靠这一层。
 * @param dir [dx,dz] 朝向
 */
export function figure(g, x, y, z, pose = "stand", cloth = null, dir = [1, 0]) {
  const c = cloth ?? CLOTHES[(hash3(x, y, z) * CLOTHES.length) | 0];
  const [dx, dz] = dir;
  const px = -dz, pz = dx;                       // 侧向
  const S = (ox, oy, oz, m) => g.set(x + ox, y + oy, z + oz, m);

  switch (pose) {
    case "stand":
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      break;
    case "walk":                                  // 两腿前后分开
      S(dx, 0, dz, c); S(-dx, 0, -dz, c);
      S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      S(dx, 2, dz, c);                            // 前伸的手臂
      break;
    case "carry": {                               // 挑担：扁担横肩，两头吊筐
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      S(0, 4, 0, P.STRAW);
      for (let k = -2; k <= 2; k++) g.setIfEmpty(x + px * k, y + 3, z + pz * k, P.WOOD_LT);
      for (const s of [-2, 2]) {
        g.setIfEmpty(x + px * s, y + 2, z + pz * s, P.THATCH_DK);
        g.setIfEmpty(x + px * s, y + 1, z + pz * s, P.THATCH);
      }
      break;
    }
    case "pole":                                  // 撑篙渔父：篙长 7 格
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      S(0, 4, 0, P.STRAW);
      for (let k = -1; k <= 6; k++) g.setIfEmpty(x + dx, y + k, z + dz, P.WOOD_LT);
      S(dx, 2, dz, c);
      break;
    case "sit":                                   // 老者围坐闲议
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, P.SKIN);
      S(dx, 0, dz, c);
      break;
    case "faggot":                                // 樵客攀岭：背一捆柴
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      S(-dx, 1, -dz, P.THATCH); S(-dx, 2, -dz, P.THATCH_DK); S(-dx, 3, -dz, P.THATCH);
      S(dx, 2, dz, c);
      break;
    case "qin":                                   // 书生负琴探友
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      for (let k = 0; k <= 3; k++) g.setIfEmpty(x - dx + px * 0, y + 1 + k, z - dz, P.WOOD_DK);
      break;
    case "plow":                                  // 农耕驱牛：人扶犁
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
      S(0, 4, 0, P.STRAW);
      S(dx, 2, dz, c);
      g.setIfEmpty(x + dx * 2, y, z + dz * 2, P.WOOD_DK);
      break;
    case "child":                                 // 幼童嬉戏：3 格
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, P.SKIN);
      S(dx, 1, dz, c);
      break;
    default:
      S(0, 0, 0, c); S(0, 1, 0, c); S(0, 2, 0, c); S(0, 3, 0, P.SKIN);
  }
}

/** 牲畜：牛/驴，6 长 3 高（考据：13 头牲畜） */
export function beast(g, x, y, z, dir = [1, 0], kind = "ox") {
  const [dx, dz] = dir;
  const c = kind === "ox" ? P.BEAST : P.CLOTH_B;
  for (let i = -2; i <= 2; i++) g.set(x + dx * i, y + 1, z + dz * i, c);
  for (let i = -1; i <= 2; i++) g.set(x + dx * i, y + 2, z + dz * i, c);
  g.set(x + dx * 3, y + 2, z + dz * 3, c);
  g.set(x + dx * 4, y + 2, z + dz * 4, c);          // 头
  g.set(x + dx * 4, y + 3, z + dz * 4, kind === "ox" ? P.STRAW : c);   // 角/耳
  for (const [a, b] of [[-2, -1], [-2, 1], [2, -1], [2, 1]])
    g.set(x + dx * a - dz * b, y, z + dz * a + dx * b, P.INK_SOFT);
  if (kind === "donkey") {                          // 驴背驮货
    g.set(x, y + 3, z, P.THATCH);
    g.set(x + dx, y + 3, z + dz, P.THATCH_DK);
    g.set(x - dx, y + 3, z - dz, P.THATCH);
  }
}

/* ---------------------------------------------------------------- 船 */

/**
 * 船。kind: fish 渔舟 / guest 游船 / sail 帆船 / wheel 脚踏式双体船
 * 船底坐在 y=0（水面），船身 1–2 格，舱篷 2–3 格。
 */
export function boat(g, x, z, kind = "fish", ang = 0, rnd = Math.random) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const toWorld = (lx, ly, lz) => [Math.round(x + lx * ca - lz * sa), ly, Math.round(z + lx * sa + lz * ca)];
  const toDirection = (lx, lz) => [Math.round(lx * ca - lz * sa), Math.round(lx * sa + lz * ca)];
  const put = (lx, ly, lz, m) => {
    const p = toWorld(lx, ly, lz);
    g.set(p[0], p[1], p[2], m);
  };
  const get = (lx, lz) => {
    const [wx, , wz] = toWorld(lx, 0, lz);
    return [wx, wz];
  };

  const SPEC = {
    fish: { L: 9, W: 1, cabin: false, canopy: true, sail: false },
    guest: { L: 14, W: 2, cabin: true, canopy: true, sail: false },
    sail: { L: 12, W: 2, cabin: false, canopy: false, sail: true },
    wheel: { L: 13, W: 2, cabin: true, canopy: false, sail: false, twin: true },
  }[kind] || { L: 9, W: 1, cabin: false, canopy: true, sail: false };

  const hl = Math.floor(SPEC.L / 2);
  const hulls = SPEC.twin ? [-SPEC.W - 1, SPEC.W + 1] : [0];
  /* 船员站位：站得出去、看得见。早先 guest 三人挤在舱顶同一格线上、
     wheel 两人直接埋进船舱里（舱体 y=2..4，人 y=3），等于没有船员。 */
  const localCrew = {
    fish: [{ lx: 0, ly: 2, lz: 0, pose: "pole", dir: [0, 1] }],
    guest: [
      { lx: 5, ly: 2, lz: 0, pose: "stand", dir: [0, 1] },
      { lx: -5, ly: 2, lz: 0, pose: "carry", dir: [0, 1] },
      { lx: 0, ly: 5, lz: 0, pose: "sit", dir: [0, 1] },
    ],
    sail: [
      { lx: 2, ly: 2, lz: 0, pose: "stand", dir: [0, 1] },
      { lx: 4, ly: 2, lz: 0, pose: "pole", dir: [0, 1] },
    ],
    wheel: [
      { lx: 4, ly: 2, lz: -SPEC.W - 1, pose: "pole", dir: [0, 1] },
      { lx: -4, ly: 2, lz: SPEC.W + 1, pose: "stand", dir: [0, 1] },
    ],
  }[kind] ?? [];
  const crew = localCrew.map((c) => {
    const [cx, cy, cz] = toWorld(c.lx, c.ly, c.lz);
    return { x: cx, y: cy, z: cz, pose: c.pose, dir: toDirection(...c.dir) };
  });

  for (const hz of hulls) {
    for (let lx = -hl; lx <= hl; lx++) {
      /* 两端尖翘：半宽随位置正弦收尖 */
      const t = 1 - Math.abs(lx) / (hl + 0.5);
      const hw = Math.max(0, Math.round(SPEC.W * Math.pow(Math.max(0, t), 0.55)));
      for (let lz = -hw; lz <= hw; lz++) {
        put(lx, 0, lz + hz, P.BOAT);
        if (hw > 0) put(lx, 1, lz + hz, Math.abs(lz) === hw ? P.BOAT_LT : P.WOOD_DK);
      }
      /* 翘首翘尾 */
      if (Math.abs(lx) >= hl - 1) put(lx, 2, hz, P.BOAT_LT);
    }
  }

  if (SPEC.canopy) {                                // 乌篷
    for (let lx = -hl + 2; lx <= hl - 3; lx++)
      for (let lz = -SPEC.W; lz <= SPEC.W; lz++) {
        const arch = Math.abs(lz) >= SPEC.W ? 2 : 3;
        put(lx, arch, lz + (hulls[0] ?? 0), lx % 2 ? P.THATCH_DK : P.WOOD_DK);
      }
  }
  if (SPEC.cabin) {                                 // 船舱
    for (let lx = -2; lx <= 3; lx++)
      for (let lz = -SPEC.W; lz <= SPEC.W; lz++) {
        const edge = Math.abs(lz) === SPEC.W || lx === -2 || lx === 3;
        put(lx, 2, lz + (hulls[0] ?? 0), edge ? P.WALL : P.WOOD_DK);
        put(lx, 3, lz + (hulls[0] ?? 0), edge ? P.WALL : P.WOOD_DK);
        put(lx, 4, lz + (hulls[0] ?? 0), P.TILE_DK);
      }
    put(0, 3, SPEC.W + (hulls[0] ?? 0), P.WINDOW);  // 舱窗夜里透光
  }
  if (SPEC.sail) {                                  // 帆：竹篾硬帆，带横档
    for (let k = 0; k <= 13; k++) put(-1, 2 + k, 0, P.WOOD_DK);
    for (let k = 2; k <= 12; k++)
      for (let lz = -4; lz <= 4; lz++) {
        const taper = 1 - Math.abs(k - 7) / 8;
        if (Math.abs(lz) > 4 * taper) continue;
        put(-1, 1 + k, lz, k % 3 === 0 ? P.WOOD_LT : P.SAIL);
      }
  }
  if (SPEC.twin) {                                  // 脚踏水轮：两体之间一架轮
    for (let lx = -1; lx <= 1; lx++) {
      put(lx, 2, 0, P.WOOD);
      put(lx, 3, 0, P.WOOD_LT);
    }
    for (let k = -2; k <= 2; k++) { put(0, 2 + k, -SPEC.W - 2, P.WOOD_LT); put(0, 2 + k, SPEC.W + 2, P.WOOD_LT); }
  }
  /* 船灯：渔舟一盏在艏，客船加舱侧两盏。夜里江面就靠这些点 */
  const putLamp = (lx, ly, lz) => {
    const [wx, wy, wz] = toWorld(lx, ly, lz);
    lampAt(g, wx, wy, wz);
  };
  putLamp(hl - 1, 2, 0);
  if (SPEC.cabin) { putLamp(-3, 3, SPEC.W + 1); putLamp(4, 3, SPEC.W + 1); }
  return { x, z, hl, toWorld, toDirection, crew };
}

/* ---------------------------------------------------------------- 找水 */

function findWater(rnd, x0, x1, clear = 6) {
  for (let i = 0; i < 400; i++) {
    const x = Math.round(x0 + rnd() * (x1 - x0));
    const z = Math.round(WORLD.z0 + 12 + rnd() * (WORLD.z1 - WORLD.z0 - 24));
    if (topAt(x, z) >= 0) continue;
    let ok = true;
    for (let d = 1; d <= clear && ok; d++)
      if (topAt(x + d, z) >= 0 || topAt(x - d, z) >= 0 || topAt(x, z + d) >= 0 || topAt(x, z - d) >= 0) ok = false;
    if (ok) return { x, z };
  }
  return null;
}

/** 岸边落位：找一块 top ∈ [lo,hi] 的平地 */
function findLand(rnd, x0, x1, lo = 1, hi = 20) {
  for (let i = 0; i < 300; i++) {
    const x = Math.round(x0 + rnd() * (x1 - x0));
    const z = Math.round(WORLD.z0 + 8 + rnd() * (WORLD.z1 - WORLD.z0 - 16));
    const t = topAt(x, z);
    if (t >= lo && t <= hi) return { x, z, t };
  }
  return null;
}

/* ---------------------------------------------------------------- 布点 */

export const FLOCKS = [
  { n: 9, cx: 620, cy: 96, cz: -40, r: 90, speed: 0.055, scale: 0.5 },
  { n: 7, cx: -420, cy: 128, cz: 30, r: 110, speed: -0.042, scale: 0.44 },
];
export const CRANES = [
  { cx: 180, cy: 42, cz: 96, r: 70, speed: 0.03, scale: 0.9 },
  { cx: -700, cy: 38, cz: 88, r: 60, speed: -0.026, scale: 0.85 },
];

export function populate(g, ctx = {}) {
  const rnd = mulberry32(20260924);
  const stats = { figures: 0, beasts: 0, boats: 0 };
  const F = (x, y, z, pose, cloth, dir) => { figure(g, x, y, z, pose, cloth, dir); stats.figures++; };

  /* ---- 长桥上的行旅：全卷人最密的一处 ---- */
  const lb = ctx.longBridge;
  if (lb) {
    for (let i = 0; i < 20; i++) {
      const t = (i + rnd() * 0.7) / 20;
      const bx = Math.round(lb.x0 + (lb.x1 - lb.x0) * t);
      const bz = Math.round(lb.z0 + (lb.z1 - lb.z0) * t);
      const by = Math.round(lb.deckY + lb.camber * Math.sin(Math.PI * t)) + 1;
      const s = (i % 3 - 1) * 2;
      const dx = lb.x1 - lb.x0, dz = lb.z1 - lb.z0;
      const l = Math.hypot(dx, dz);
      const pose = i % 5 === 0 ? "carry" : i % 7 === 3 ? "child" : "walk";
      F(bx + Math.round(-dz / l * s), by, bz + Math.round(dx / l * s), pose, CLOTHES[i % CLOTHES.length], [dx / l, dz / l]);
    }
    /* 桥亭里歇脚的两个 */
    F(lb.px - 2, lb.py + 1, lb.pz, "stand", P.CLOTH_B, [0, 1]);
    F(lb.px + 2, lb.py + 1, lb.pz, "sit", P.CLOTH_W, [0, 1]);
  }

  /* ---- 村落：渔、樵、耕、读 ---- */
  for (let vi = 0; vi < VILLAGES.length; vi++) {
    const v = VILLAGES[vi];
    const n = 4 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) {
      const p = findLand(rnd, v.cx - v.spread * 1.3, v.cx + v.spread * 1.3, 1, 26);
      if (!p) continue;
      const near = Math.hypot(p.x - v.cx, p.z - v.cz) < v.spread * 1.1;
      if (!near) continue;
      const roll = rnd();
      const pose = v.kind === "fish"
        ? (roll > 0.66 ? "pole" : roll > 0.4 ? "carry" : "walk")
        : v.kind === "farm"
          ? (roll > 0.7 ? "plow" : roll > 0.45 ? "faggot" : "walk")
          : (roll > 0.75 ? "carry" : roll > 0.5 ? "child" : "walk");
      const d = [Math.cos(rnd() * 6.28), Math.sin(rnd() * 6.28)];
      F(p.x, p.t + 1, p.z, pose, CLOTHES[(vi + i) % CLOTHES.length], [Math.round(d[0]), Math.round(d[1])] || [1, 0]);
    }
    /* 老者围坐闲议：三人一圈 */
    {
      const p = findLand(rnd, v.cx - v.spread, v.cx + v.spread, 1, 20);
      if (p) for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        F(p.x + Math.round(Math.cos(a) * 2), p.t + 1, p.z + Math.round(Math.sin(a) * 2), "sit", CLOTHES[k], [Math.round(-Math.cos(a)), Math.round(-Math.sin(a))]);
      }
    }
    /* 村口迎面的人：观者恒在 +Z 一侧看进来，人若只撒在屋后，
       「人物虽细小如豆，却动态鲜明」这一条就永远进不了画。 */
    for (let k = 0; k < 4; k++) {
      let pick = null;
      for (let tries = 0; tries < 24 && !pick; tries++) {
        const px = Math.round(v.cx + (rnd() - 0.5) * v.spread * 1.6);
        const pz = Math.round(v.cz + v.spread * (0.35 + rnd() * 0.75));
        const t = topAt(px, pz);
        if (t >= 1 && t <= 22 && slopeAt(px, pz) < 1.1) pick = { x: px, z: pz, t };
      }
      if (!pick) continue;
      const pose = ["walk", "carry", "stand", "child"][k % 4];
      F(pick.x, pick.t + 1, pick.z, pose, CLOTHES[(vi * 3 + k) % CLOTHES.length], k % 2 ? [1, 0] : [-1, 0]);
    }
    /* 耕牛 */
    if (v.kind === "farm" && stats.beasts < 9) {
      const p = findLand(rnd, v.cx - v.spread, v.cx + v.spread, 1, 18);
      if (p) { beast(g, p.x, p.t + 1, p.z, [1, 0], "ox"); stats.beasts++; }
    }
  }

  /* ---- 驴队：从后山走出来 ---- */
  for (const spot of [[-470, -60], [330, -46]]) {
    const p = findLand(rnd, spot[0] - 20, spot[0] + 20, 8, 60);
    if (!p) continue;
    for (let k = 0; k < 3 && stats.beasts < 13; k++) {
      const dx = p.x + k * 4;
      const dz = p.z + Math.round(rnd() * 2);
      const dt = topAt(dx, dz);
      beast(g, dx, dt >= 0 ? dt + 1 : p.t + 1, dz, [1, 0], "donkey");
      stats.beasts++;
    }
    const lead = { x: p.x - 4, z: p.z };
    const rear = { x: p.x + 14, z: p.z + 1 };
    const leadT = topAt(lead.x, lead.z), rearT = topAt(rear.x, rear.z);
    F(lead.x, leadT >= 0 ? leadT + 1 : p.t + 1, lead.z, "walk", P.CLOTH_G, [1, 0]);
    F(rear.x, rearT >= 0 ? rearT + 1 : p.t + 1, rear.z, "faggot", P.CLOTH_B, [1, 0]);
  }

  /* ---- 寺观：行僧 ---- */
  for (const t of TEMPLES) {
    const y = topAt(t.x, t.z);
    if (y < 0) continue;
    for (let k = 0; k < 4; k++) {
      const a = rnd() * Math.PI * 2, r = t.w + 4 + rnd() * 6;
      const x = Math.round(t.x + Math.cos(a) * r), z = Math.round(t.z + Math.sin(a) * r);
      const tt = topAt(x, z);
      if (tt < 0) continue;
      F(x, tt + 1, z, k % 2 ? "walk" : "stand", P.STRAW, [Math.round(Math.cos(a)), Math.round(Math.sin(a))]);
    }
  }

  /* ---- 渡口与野渡 ---- */
  for (const f of FERRIES) {
    for (let i = 0; i < f.boats; i++) {
      const w = findWater(rnd, f.x - 40, f.x + 40, 5);
      if (!w) continue;
      const placed = boat(g, w.x, w.z, i % 2 ? "fish" : "sail", rnd() * 0.6 - 0.3, rnd);
      stats.boats++;
      const c = placed.crew[0];
      if (c) F(c.x, c.y, c.z, c.pose, CLOTHES[i], c.dir);
    }
    const p = findLand(rnd, f.x - 24, f.x + 24, 1, 12);
    if (p) { F(p.x, p.t + 1, p.z, "stand", P.CLOTH_W, [0, 1]); F(p.x + 2, p.t + 1, p.z + 1, "carry", P.CLOTH_R, [1, 0]); }
  }

  /* ---- 江面上的船：渔舟游船荡曳其间 ---- */
  const want = 70 - stats.boats;
  for (let i = 0; i < want; i++) {
    const w = findWater(rnd, WORLD.x0 + 40, WORLD.x1 - 40, 7);
    if (!w) continue;
    const roll = rnd();
    const kind = roll > 0.86 ? "wheel" : roll > 0.68 ? "guest" : roll > 0.44 ? "sail" : "fish";
    const placed = boat(g, w.x, w.z, kind, (rnd() - 0.5) * 0.9, rnd);
    stats.boats++;
    for (let k = 0; k < placed.crew.length; k++) {
      const c = placed.crew[k];
      F(c.x, c.y, c.z, c.pose, CLOTHES[(i + k) % CLOTHES.length], c.dir);
    }
  }

  /* ---- 樵客攀岭穿行：散在山径上，但不上山头 ---- */
  for (let i = 0; i < 26; i++) {
    const p = findLand(rnd, WORLD.x0 + 60, WORLD.x1 - 60, 14, 105);
    if (!p) continue;
    F(p.x, p.t + 1, p.z, rnd() > 0.5 ? "faggot" : "walk", CLOTHES[i % CLOTHES.length], [1, 0]);
  }

  /* ---- 文士携童漫游 / 书生负琴探友：水榭与隐居处 ---- */
  for (const pv of ctx.pavilions ?? []) {
    F(pv.x - 3, pv.y, pv.z, "qin", P.CLOTH_W, [1, 0]);
    F(pv.x - 5, pv.y, pv.z + 1, "child", P.CLOTH_R, [1, 0]);
  }
  for (const h of ctx.hermitages ?? []) {
    F(h.x + 2, h.y, h.z + 2, "stand", P.CLOTH_B, [-1, 0]);
    F(h.x - 2, h.y, h.z + 3, "sit", P.CLOTH_W, [1, 0]);
  }
  /* ---- 幼童嬉戏 ---- */
  for (let i = 0; i < 8; i++) {
    const p = findLand(rnd, WORLD.x0 + 80, WORLD.x1 - 80, 1, 14);
    if (!p) continue;
    F(p.x, p.t + 1, p.z, "child", CLOTHES[i % CLOTHES.length], [1, 0]);
  }
  /* ---- 涉水捕钓：站在水边浅处 ---- */
  for (let i = 0; i < 12; i++) {
    const p = findLand(rnd, WORLD.x0 + 60, WORLD.x1 - 60, 1, 3);
    if (!p) continue;
    F(p.x, p.t + 1, p.z, "pole", CLOTHES[(i + 2) % CLOTHES.length], [0, 1]);
  }

  return stats;
}
