/* 全场景装配：塔 + 三重须弥座石台 + 浮屠岛 + 庭院小品 + 云海 */
import {
  Grid, fbm2, valueNoise2, hash3, lerp, octR, mulberry32,
} from "../voxel/core.js";
import { BlockField } from "../voxel/blocks.js";
import {
  STONE, STONE_LT, STONE_DK, MARBLE, MARBLE_LT, STELE, GRASS, MOSS,
  TRUNK, TRUNK_LT, PINE, PINE_DK, PINE_LT,
  RED, RED_LT, WOOD_DK, GOLD, GOLD_LT, BRONZE,
  TILE_G, TILE_Y_LT, PAINT_BLUE,
  LANTERN, LANTERN_CORE, DARK,
  CLOUD, CLOUD_DK, CLOUD_LT, SMOKE, ROBE, ROBE_BROWN, SKIN,
  ROCK, ROCK_DK, ROCK_LT,
} from "../palette.js";
import { buildTower, tierBaseY, BODY_TOP } from "./tower.js";

export const TOWER_Y0 = 34;          // 塔身底层底面
export const PLATEAU_Y = 10;         // 山顶庭院地坪
const rnd = mulberry32(20260923);

/* ---------------------------------------------------------------- 石台 */

function octDisc(g, a, y, fn) {
  const R = Math.ceil(a * 1.2072) + 1;
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      if (octR(x, z) > a + 0.5) continue;
      const m = fn(x, y, z);
      if (m) g.set(x, y, z, m);
    }
}

function balustrade(g, a, y, n = 4) {
  octDisc(g, a, y, () => STONE);
  const R = Math.ceil(a * 1.2072) + 1;
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const r = octR(x, z);
      if (r > a + 0.4 || r <= a - 1.6) continue;
      const ax = Math.abs(x), az = Math.abs(z);
      const q = (ax + az) % 7;
      const post = q < 1.2 || Math.max(ax, az) === r && (x + z * 3) % 8 === 0;
      for (let k = 1; k <= n; k++) {
        let m;
        if (k === 1) m = MARBLE;
        else if (k === 2) m = post ? MARBLE_LT : MARBLE;
        else if (k === 3) m = post ? MARBLE_LT : 0;
        else m = post ? GOLD_LT : RED_LT;
        if (m) g.set(x, y + k, z, m);
      }
    }
}

function terrace(g) {
  const tiers = [
    { a: 82, y0: PLATEAU_Y, y1: PLATEAU_Y + 8 },
    { a: 69, y0: PLATEAU_Y + 8, y1: PLATEAU_Y + 16 },
    { a: 56, y0: PLATEAU_Y + 16, y1: TOWER_Y0 },
  ];
  tiers.forEach((t, k) => {
    for (let y = t.y0; y < t.y1; y++) {
      const ly = y - t.y0;
      // 须弥座：上下枋外闪、束腰内收
      const bulge = ly < 2 ? 2.4 : ly > t.y1 - t.y0 - 3 ? 1.6 : 0;
      octDisc(g, t.a + bulge, y, (x, yy, z) => {
        if (ly === 0) return STONE_DK;
        if (bulge > 2) return MARBLE_LT;
        if (bulge > 0) return MARBLE;
        return ly % 4 === 3 ? STONE_DK : STONE;
      });
    }
    // 台面
    octDisc(g, t.a + 2.4, t.y1 - 1, () => STONE_LT);
    if (k < 2) balustrade(g, t.a + 2.2, t.y1 - 1, 4);
  });
  balustrade(g, 56 + 2.2, TOWER_Y0 - 1, 4);

  /* 踏道：四面（0/2/4/6）逐层而下，中间御路、两侧登阶 */
  const flights = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
  ];
  for (const side of [0, 2, 4, 6]) {
    const ang = side * (Math.PI / 4);
    const dx = Math.cos(ang), dz = Math.sin(ang);
    for (const f of flights) {
      const a0 = f.from === 0 ? 82 + 2.4 : tiers[f.from].a + 2.4;
      const yTop = f.to === 3 ? TOWER_Y0 : tiers[f.to].y0;
      const yBot = tiers[f.from].y0;
      const n = yTop - yBot;
      for (let s = 0; s < n; s++) {
        const y = yTop - 1 - s;
        const rr = a0 + 1 + s * 1.6;
        for (let w = -11; w <= 11; w++) {
          // 御路居中斜坡，两侧台阶
          const px = Math.round(rr * dx - w * dz * 0.7);
          const pz = Math.round(rr * dz + w * dx * 0.7);
          if (Math.abs(w) < 4) {
            if (s % 2 === 0) g.set(px, y, pz, w === 0 ? MARBLE_LT : MARBLE);
          } else {
            for (let yy = y; yy <= yTop - 1; yy++) g.set(px, yy, pz, yy === yTop - 1 ? STONE_LT : STONE);
          }
        }
      }
    }
    // 台角石灯
    for (const sgn of [-1, 1]) {
      const rr = 82 + 3;
      const px = Math.round(rr * Math.cos(ang + sgn * 0.16));
      const pz = Math.round(rr * Math.sin(ang + sgn * 0.16));
      stoneLantern(g, px, PLATEAU_Y, pz);
    }
  }
}

function stoneLantern(g, x, y, z) {
  g.set(x, y, z, STONE_DK);
  g.set(x, y + 1, z, STONE);
  g.set(x, y + 2, z, STONE_LT);
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.set(x + a, y + 3, z + b, STONE);
  g.set(x, y + 3, z, LANTERN);
  g.set(x, y + 4, z, STONE_LT);
  g.set(x, y + 5, z, STONE);
}

/* -------------------------------------------------------------- 浮屠岛 */

/* 岛体只雕"看得见的皮"：顶盖一环 + 外崖一壳。
   实心锥要 140 万格；云床在 -26 封底，崖脚埋到 -36 即永不可见。 */
const ISLE_TOP = PLATEAU_Y;
const ISLE_BOT = -24;        // 云床表层占 -22..-11，脚埋到 -24 即封住

function rock(g) {
  for (let y = ISLE_BOT; y <= ISLE_TOP; y++) {
    const t = (ISLE_TOP - y) / (ISLE_TOP - ISLE_BOT);      // 0 顶 → 1 脚
    const base = lerp(100, 80, t * t);
    const R = Math.ceil(base) + 12;
    const cap = y === ISLE_TOP;
    for (let x = -R; x <= R; x++)
      for (let z = -R; z <= R; z++) {
        const r = Math.hypot(x, z);
        const n = fbm2(x * 0.021 + y * 0.01, z * 0.021 - y * 0.013, 4, 91) - 0.5;
        const ridge = Math.abs(n) * 26;
        /* 顶缘收静、崖脚放野：口沿一乱，整座岛就读成齿轮 */
        const amp = 0.28 + 0.72 * t;
        const rr = base + (n * 30 - ridge * 0.3 + Math.sin(Math.atan2(z, x) * 5 + y * 0.05) * 6) * amp;
        if (r > rr) continue;
        if (cap) { if (r < 84) continue; }                  // 内圈由须弥座占位
        else if (r < rr - 2.6) continue;                    // 中空不外露，省一格是一格
        let m = ROCK;
        if (cap) m = GRASS;
        else if (r > rr - 1.6) {
          const s = valueNoise2(x * 0.06 + y * 0.1, z * 0.06, 17);
          m = s > 0.62 ? ROCK_LT : s > 0.34 ? ROCK : ROCK_DK;
          if (y > ISLE_TOP - 6 && s < 0.3) m = MOSS;
        } else m = ROCK_DK;
        g.set(x, y, z, m);
      }
  }
}

/* ---------------------------------------------------------------- 庭院 */

function pine(g, x0, y0, z0, h, spread, seed = 0) {
  const r = mulberry32(seed * 7 + 13);
  let x = x0, z = z0;
  for (let k = 0; k < h; k++) {
    const y = y0 + k;
    const lean = Math.sin(k * 0.22 + seed) * 0.5;
    x = x0 + Math.round(lean * k * 0.22);
    z = z0 + Math.round(Math.cos(k * 0.3 + seed) * k * 0.12);
    g.set(x, y, z, k > h * 0.62 ? TRUNK_LT : TRUNK);
    if (k > 2 && k % 3 === 0) g.set(x + (r() > 0.5 ? 1 : -1), y, z, TRUNK);
  }
  const layers = 3 + Math.floor(r() * 3);
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const cy = y0 + Math.round(h * (0.42 + t * 0.62));
    const rad = Math.max(2, spread * (1.15 - t * 0.72));
    const ox = Math.round((r() - 0.5) * spread * 0.8);
    const oz = Math.round((r() - 0.5) * spread * 0.8);
    const cx = x0 + ox + Math.round(Math.sin(t * 5 + seed) * 1.5);
    const cz = z0 + oz;
    for (let dx = -rad - 1; dx <= rad + 1; dx++)
      for (let dz = -rad - 1; dz <= rad + 1; dz++)
        for (let dy = -2; dy <= 2; dy++) {
          const d = (dx * dx + dz * dz) / (rad * rad) + (dy * dy) / 5.5;
          if (d > 1) continue;
          if (hash3(cx + dx, cy + dy, cz + dz) < 0.22 + d * 0.2) continue; // 疏密
          const m = dy > 0 ? PINE_LT : d > 0.55 ? PINE_DK : PINE;
          g.setIfEmpty(cx + dx, cy + dy, cz + dz, m);
        }
  }
}

function pavilion(g, cx, cy, cz, w) {
  // 四柱 + 重檐方亭 + 碑
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    for (let k = 0; k < 12; k++) g.set(cx + sx * w, cy + k, cz + sz * w, RED);
  }
  g.box(cx - w, cy + 12, cz - w, cx + w, cy + 12, cz + w, STONE_LT);
  g.box(cx - w - 2, cy + 13, cz - w - 2, cx + w + 2, cy + 14, cz + w + 2, WOOD_DK);
  for (let e = 0; e < 2; e++) {
    const yy = cy + 16 + e * 5;
    const ext = w + 5 - e * 3;
    for (let x = -ext; x <= ext; x++)
      for (let z = -ext; z <= ext; z++) {
        const edge = Math.abs(x) >= ext - 1 || Math.abs(z) >= ext - 1;
        const t = Math.max(Math.abs(x), Math.abs(z)) / ext;
        const y = yy + Math.round((1 - t) * 3);
        if (Math.max(Math.abs(x), Math.abs(z)) > ext) continue;
        g.set(cx + x, y, cz + z, edge ? TILE_Y_LT : TILE_G);
        g.set(cx + x, y - 1, cz + z, e === 0 && t > 0.6 ? PAINT_BLUE : WOOD_DK);
      }
  }
  g.box(cx - 1, cy + 26, cz - 1, cx + 1, cy + 28, cz + 1, GOLD_LT);
  // 碑
  g.box(cx - 2, cy + 1, cz - 1, cx + 2, cy + 9, cz + 1, STELE);
  g.box(cx - 2, cy + 10, cz - 1, cx + 2, cy + 11, cz + 1, STONE_LT);
}

function censer(g, cx, cy, cz) {
  for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) g.set(cx + a, cy, cz + b, BRONZE);
  g.box(cx - 2, cy + 1, cz - 2, cx + 2, cy + 4, cz + 2, BRONZE);
  g.hollowBox(cx - 3, cy + 5, cz - 3, cx + 3, cy + 5, cz + 3, GOLD);
  g.set(cx, cy + 6, cz, LANTERN_CORE);
  for (const [a, b] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) g.set(cx + a, cy + 6, cz + b, GOLD);
  for (let k = 0; k < 9; k++) {
    const t = k / 9;
    g.setIfEmpty(cx + Math.round(Math.sin(t * 7) * 2), cy + 7 + k, cz + Math.round(Math.cos(t * 5) * 2), SMOKE);
  }
}

/** 僧侣：7 格高（约 1.75m），全场景的尺度基准 */
function monk(g, x, y, z, c = ROBE) {
  g.set(x, y, z, ROBE_BROWN);
  g.set(x, y + 1, z, c);
  g.set(x, y + 2, z, c);
  g.set(x, y + 3, z, c);
  g.set(x, y + 4, z, c);
  g.set(x, y + 5, z, SKIN);
  g.set(x, y + 6, z, DARK);
}

function courtyard(g) {
  const spots = [
    [-62, 40], [-40, 62], [62, -40], [40, -62], [-64, -44], [58, 48],
    [-30, -70], [26, 70], [70, 22], [-72, 8],
  ];
  spots.forEach(([x, z], i) => {
    pine(g, x, PLATEAU_Y + 1, z, 16 + Math.floor(rnd() * 10), 5 + Math.floor(rnd() * 3), i * 3 + 1);
  });
  // 台顶庭院：碑亭二、香炉一、数株古松、行僧
  pavilion(g, -34, TOWER_Y0 - 1, 34, 5);
  pavilion(g, 34, TOWER_Y0 - 1, -34, 5);
  censer(g, 26, TOWER_Y0 - 1, 30);
  pine(g, -50, TOWER_Y0 - 1, -8, 22, 7, 77);
  pine(g, 46, TOWER_Y0 - 1, 12, 19, 6, 91);
  const monkSpots = [[64, 0], [70, 4], [-52, 52], [30, -66], [12, 78], [-78, -12], [46, 44]];
  monkSpots.forEach(([x, z], i) => monk(g, x, PLATEAU_Y + 1 + (i % 2), z, i % 3 ? ROBE : ROBE_BROWN));
  // 登阶上的僧人
  monk(g, 88, PLATEAU_Y + 4, 0);
  monk(g, 0, PLATEAU_Y + 12, -92, ROBE_BROWN);
}

/* ---------------------------------------------------------------- 云海 */

/* 云床只铺一层、不留台地：任何内部高度边界在掠射角下都会因为
   "格间断口透出背后的远云海"而放射成一把梳齿，无论边界是圆是方。
   云面的层次改由绕塔雾丘（wisps）在近景承担。 */
const PLAIN_LV = -3;         // 云床基准层：顶面落在 y = -22

const CLOUD_HALF = 860;   // 雾丘可活动的半径
function inCloud(x, z) {
  return Math.hypot(x, z) <= CLOUD_HALF;
}

/* 云床不再落体素：它整层只有一个高度，逐格化只会留下一张可见的格纹网。
   改由 main.js 铺一张光滑云面（buildCloudDeck），体素只保留近塔的雾丘。 */

/** 绕塔云气：六团平顶雾台，脚埋进云床、顶到三四层之下，
 *  在近景承担云海的层次——这里一格有几十像素，不会摩尔。 */
function wisps(field) {
  const cell = field.cell;
  const blobs = [
    [168, 74, 2, 66], [-140, 108, 2, 58], [58, -168, 1, 62],
    [-196, -74, 1, 54], [120, 190, 1, 50], [-40, -206, 2, 46],
  ];
  for (const [bx, bz, up, br] of blobs) {
    const ir = Math.ceil(br * 1.5 / cell) + 1;
    const ci = Math.round(bx / cell), cj = Math.round(bz / cell);
    for (let dx = -ir; dx <= ir; dx++)
      for (let dz = -ir; dz <= ir; dz++) {
        const i = ci + dx, j = cj + dz;
        const x = i * cell, z = j * cell;
        if (!inCloud(x, z)) continue;
        const d = Math.hypot(x - bx, z - bz);
        const edge = br * (1 + 0.42 * (fbm2(x * 0.0038 + up * 7, z * 0.0038 - up * 3, 2, 55) - 0.5) * 2);
        if (d > edge) continue;
        const t = PLAIN_LV + up;
        field.set(i, t, j, CLOUD_LT);
        field.set(i, t - 1, j, CLOUD);
        field.set(i, t - 2, j, CLOUD_DK);
      }
  }
}

/* ---------------------------------------------------------------- 装配 */

export function buildScene(opts = {}) {
  const on = (k) => opts[k] !== false;
  const g = new Grid();
  let meta = null;
  if (on("tower")) meta = buildTower(g, TOWER_Y0);
  else meta = { topY: TOWER_Y0 + BODY_TOP, bodyTop: TOWER_Y0 + BODY_TOP, ys: tierBaseY().map((y) => y + TOWER_Y0), tiers: [] };
  if (on("terrace")) terrace(g);
  if (on("rock")) rock(g);
  if (on("courtyard")) courtyard(g);

  const clouds = new BlockField(11);
  if (on("wisps")) wisps(clouds);

  // 远山由天幕着色器绘制（见 main.js 山脊线），此处不再落体素

  return { grid: g, cloudField: clouds, meta };
}
