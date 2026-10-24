/* 全卷装配：高度场 → 山体 → 植被 → 建筑 → 水瀑 → 勾云 → 生灵 → 远峰 */
import { Grid, mulberry32, fbm2, valueNoise2, hash3, clamp, smoothstep } from "../voxel/core.js";
import { BlockField } from "../voxel/blocks.js";
import { WORLD, GROUPS, VILLAGES, TEMPLES, MILL, PAVILIONS, HERMITAGES, LONG_BRIDGE, BRIDGES, FERRIES } from "./score.js";
import { buildHeightfield, carve, plant, path, topAt, CORE, NX, NZ, TERRAIN_STATE } from "./terrain.js";
import { village, temple, longBridge, smallBridge, waterPavilion, mill, hermitage, stoneLantern, BRIDGE_DECK_Y, BRIDGE_CAMBER } from "./arch.js";
import { waterfalls, clouds, mist, CLOUD_CELL } from "./water.js";
import { populate } from "./life.js";
import * as P from "../palette.js";

export const FAR_CELL = 8;

/* ---------------------------------------------------------------- 远峰 */

/** 平远的尽头：三重淡色远峰，粗格表达。
 *  只放在 −Z 一侧：默认机位与展卷机位都从 +Z 看过来，
 *  +Z 放远峰会把相机埋进山体里（第一版就栽在这儿）。
 *
 *  旧版读起来是"灰白色的现代城市天际线"，三处原因：
 *   1. 用「顶格深色、其余浅色」分色 → 每一列都扣了一个暗盖，而横视时
 *      几乎只看得到侧面，整片退成浅灰积木；
 *   2. 沿 X 连续铺满 → 一堵墙，而不是"一座座山岛"；
 *   3. 中频 peak 波长太短，峰谷密得像楼群。
 *  现在按**绝对海拔**统一分色（脚没雾白、淡墨收顶），低频掩码把墙切成岛链，
 *  再在山脚补一条稀疏的蛤白雾带。 */
function farRanges(field) {
  const cell = field.cell;
  const bands = [
    { z0: -330, z1: -480, h: 96, seed: 7, tone: [P.FAR_1, P.FAR_2, P.FAR_3] },
    { z0: -540, z1: -760, h: 142, seed: 13, tone: [P.FAR_1, P.FAR_2, P.FAR_3] },
    { z0: -840, z1: -1120, h: 178, seed: 19, tone: [P.FAR_2, P.FAR_3, P.FAR_3] },
  ];
  const segments = [];
  let total = 0;
  for (const b of bands) {
    const zNear = Math.min(b.z0, b.z1);
    const zFar = Math.max(b.z0, b.z1);
    const zc = (zNear + zFar) / 2, zh = (zFar - zNear) / 2;
    let blocks = 0, fogBlocks = 0, peakY = 0;
    const toneAt = (wy) => {
      const t = wy / Math.max(1, b.h);
      return t > 0.72 ? b.tone[0] : t > 0.34 ? b.tone[1] : b.tone[2];
    };
    for (let x = WORLD.x0; x <= WORLD.x1; x += cell) {
      /* 岛链掩码：低于阈值的整列留空，露出天与水 */
      const island = fbm2(x * 0.0042 + b.seed * 2.1, b.seed * 1.7, 3, b.seed + 3);
      if (island < 0.47) continue;
      const gate = smoothstep(0.47, 0.63, island);
      /* 一重远峰就是一条起伏的脊：低频定轮廓，中频定峰谷 */
      const prof = fbm2(x * 0.0032 + b.seed, b.seed * 3.7, 4, b.seed);
      const peak = fbm2(x * 0.0065 - b.seed * 2, b.seed, 3, b.seed + 5);
      const h = b.h * (0.34 + 0.66 * Math.pow(clamp(prof * 1.25, 0, 1), 1.25)) * (0.60 + 0.60 * peak) * gate;
      if (h < 12) continue;
      const depth = zh * (0.6 + 0.5 * fbm2(x * 0.006, b.seed * 11, 2, b.seed + 9));
      const ix = Math.floor(x / cell);
      for (let z = zc - depth; z <= zc + depth; z += cell) {
        const edge = Math.abs(z - zc) / Math.max(1, depth);
        const hh = Math.round(h * (1 - edge * edge * 0.55));
        const iy1 = Math.max(1, Math.ceil(hh / cell));
        const iz = Math.floor(z / cell);
        for (let iy = 0; iy < iy1; iy++) {
          field.set(ix, iy, iz, toneAt(iy * cell));
          blocks++;
        }
        peakY = Math.max(peakY, iy1 * cell);
        /* 山脚雾带：蛤白粗格稀疏铺在岛链身前，把"积木落地"的硬脚线化开 */
        const fogTop = Math.round((12 + 24 * valueNoise2(x * 0.009 + b.seed, b.seed * 5)) / cell);
        for (let iy = 0; iy <= fogTop; iy++) {
          if (hash3(ix, iy, iz + b.seed * 31) > 0.52) continue;
          if (field.has(ix, iy, iz)) continue;
          field.set(ix, iy, iz, P.MIST);
          fogBlocks++;
        }
      }
    }
    total += blocks + fogBlocks;
    segments.push({ z0: zNear, z1: zFar, blocks, fogBlocks, peakY });
  }
  return { total, segments };
}

/* ---------------------------------------------------------------- 装配 */

export function buildScene(opts = {}) {
  const on = (k) => opts[k] !== false;
  const rnd = mulberry32(20260923);
  const t = { hf: 0, carve: 0, plant: 0, arch: 0, water: 0, life: 0, far: 0 };
  let s = Date.now();

  const g = new Grid();
  const core = new BlockField(CORE);
  const far = new BlockField(FAR_CELL);
  const wheel = new Grid();
  const cloud = new BlockField(CLOUD_CELL);
  const ctx = {};

  if (on("terrain")) {
    buildHeightfield();
    t.hf = Date.now() - s; s = Date.now();
    ctx.carved = carve(g, core);
    t.carve = Date.now() - s; s = Date.now();
    if (on("flora")) {
      ctx.planted = plant(g);
      t.plant = Date.now() - s; s = Date.now();
    }
  }

  if (on("arch")) {
    /* 曲径通幽：自每个村落向山上盘一条石径 */
    for (let i = 0; i < VILLAGES.length; i++) {
      const v = VILLAGES[i];
      path(g, v.cx + Math.round((rnd() - 0.5) * v.spread), v.cz, 90 + Math.floor(rnd() * 70), i * 17 + 5, 52 + (i % 3) * 26);
    }
    const lb = longBridge(g, LONG_BRIDGE);
    ctx.longBridge = { ...LONG_BRIDGE, deckY: BRIDGE_DECK_Y, camber: BRIDGE_CAMBER, ...lb };
    for (const b of BRIDGES) smallBridge(g, b);
    ctx.temples = TEMPLES.map((tp) => temple(g, tp, rnd)).filter(Boolean);
    ctx.pavilions = PAVILIONS.map((p) => waterPavilion(g, p)).filter(Boolean);
    ctx.hermitages = HERMITAGES.map((h) => hermitage(g, h)).filter(Boolean);
    ctx.mill = mill(g, MILL, wheel);
    ctx.villages = VILLAGES.map((v) => ({ ...v, houseCount: village(g, v, rnd).length }));
    /* 野渡石灯、村口石灯 */
    for (const f of FERRIES) {
      const t2 = topAt(f.x, f.z);
      if (t2 > 0) stoneLantern(g, f.x, t2 + 1, f.z);
    }
    for (const v of VILLAGES) {
      const t2 = topAt(v.cx + v.spread, v.cz);
      if (t2 > 0 && t2 < 22) stoneLantern(g, v.cx + v.spread, t2 + 1, v.cz);
    }
    t.arch = Date.now() - s; s = Date.now();
  }

  if (on("water")) {
    ctx.falls = waterfalls(g);
    clouds(cloud);
    mist(cloud);
    t.water = Date.now() - s; s = Date.now();
  }

  if (on("life")) {
    ctx.pop = populate(g, ctx);
    t.life = Date.now() - s; s = Date.now();
  }

  if (on("far")) {
    const summary = farRanges(far);
    ctx.far = summary;
    ctx.farBlocks = summary.total;
    t.far = Date.now() - s; s = Date.now();
  }

  /* 灯位表：网巾水要画渔火的倒影，倒影是几何量（灯关于水面的镜像），
     所以必须知道灯在哪儿，而不能只靠三盏 PointLight 蒙。 */
  const lampSpots = [];
  g.forEachVoxel((x, y, z, m) => {
    if (m === P.LAMP_CORE) lampSpots.push(x, y, z);
  });
  ctx.lamps = lampSpots;

  return {
    grid: g, core, far, wheel, cloud, ctx, timings: t,
    terrain: {
      top: TERRAIN_STATE.top ? TERRAIN_STATE.top.slice() : null,
      nx: NX,
      nz: NZ,
      x0: WORLD.x0,
      z0: WORLD.z0,
    },
    meta: { groups: GROUPS.length },
  };
}
