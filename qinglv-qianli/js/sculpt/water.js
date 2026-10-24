/* 水与云
 *
 * 瀑布：第 4 组「高山耸立，山峦层叠，瀑布悬垂」，两山之间四叠而下。
 * 勾云：考据 #7 ——「留出云白……勾染白云……并在绢背面复染蛤粉以衬云白」，
 *       故此卷的云**不是空气**，是有墨线轮廓的白色薄片。云带缠在山腰与组间谷口，
 *       既是「迷茫幽深」「山间似有烟雾」的原文，也顺手遮住岩芯与细壳的交界。
 * 水面本体不落体素：整层等高的东西逐格化只会留下一张格纹网（琉璃浮屠上已付过学费），
 *       改由 main.js 的网巾水着色器承担。
 */
import { WORLD, FALLS, GROUPS } from "./score.js";
import { topAt, heightAt, slopeAt, CFG } from "./terrain.js";
import { fbm2, valueNoise2, hash3, mulberry32, clamp } from "../voxel/core.js";
import * as P from "../palette.js";

/** 最陡下降方向（4 邻域） */
function descent(x, z) {
  let best = null, bh = topAt(x, z);
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const h = topAt(x + dx, z + dz);
    if (h >= 0 && h < bh) { bh = h; best = [dx, dz]; }
  }
  return best;
}

/** 向上找水源：自 (x,z) 爬到附近的局部高点 */
function source(x, z, steps = 40) {
  let cx = x, cz = z, ch = topAt(x, z);
  for (let i = 0; i < steps; i++) {
    let best = null, bh = ch;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 1], [-2, -1], [1, 2], [-1, -2]]) {
      const h = topAt(cx + dx, cz + dz);
      if (h > bh) { bh = h; best = [cx + dx, cz + dz]; }
    }
    if (!best) break;
    cx = best[0]; cz = best[1]; ch = bh;
  }
  return { x: cx, z: cz, y: ch };
}

/**
 * 瀑布：沿最陡下降一路而下，每一叠的帘高 = 这一段**累积的真实落差**。
 *
 * 旧版对每一叠都固定画 tierH（27 格）高，而本卷地形经量化后相邻列之间
 * 只有 1–3 格的落差：帘子有一半埋进山体里，只有坡面断开处露出几格白，
 * 从远处看就是一道惨白的梳齿横在山腰（深远章实拍就是这个）。
 * 现在缓段只留一道溪面，真正断崖处才立帘。
 */
export function waterfall(g, spec) {
  const src = source(spec.x, spec.z, 10);
  let x = src.x, z = src.z;
  let y = Math.max(topAt(x, z), 4);
  const hw = Math.max(1, Math.floor(spec.width / 2));
  const span = Math.max(24, Math.round(spec.drop * CFG.hMul));
  const tierLen = Math.max(4, Math.round(span / spec.tiers / 4));
  const trail = [];
  let segTop = y, drawn = 0;

  /* 瀑口 */
  for (let dx = -hw; dx <= hw; dx++)
    for (let dz = -1; dz <= 1; dz++) g.set(x + dx, y, z + dz, P.FALL);

  for (let i = 0; i < span && y > 0; i++) {
    const d = descent(x, z);
    if (!d) break;
    const nx = x + d[0], nz = z + d[1];
    const there = topAt(nx, nz);
    x = nx; z = nz;
    if (there < 0) break;                       // 入江，瀑布到此为止
    const px = -d[1], pz = d[0];                // 横向
    const drop = segTop - there;
    if (drop >= 5 || (drop >= 2 && i % tierLen === 0)) {
      const H = Math.min(30, Math.max(3, Math.round(drop)));
      for (let k = 0; k <= H; k++) {
        for (let w = -hw; w <= hw; w++) {
          const X = x + px * w, Z = z + pz * w;
          const edge = Math.abs(w) === hw || k === 0;
          g.set(X, there + H - k, Z, edge ? P.SPRAY : P.FALL);
          /* 水帘后的岩壁压暗，才有「悬」的感觉 */
          g.setIfEmpty(X - d[0], there + H - k, Z - d[1], P.CLIFF_DK);
        }
      }
      drawn++;
      trail.push({ x, z, y: there });
    } else {
      /* 缓段只留一道溪面 */
      for (let w = -hw; w <= hw; w++) g.set(x + px * w, there, z + pz * w, P.FALL);
    }
    segTop = there;
    y = there;
  }

  /* 瀑脚飞沫 */
  const rnd = mulberry32(spec.x * 7 + spec.z);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, r = 1 + rnd() * (hw + 4);
    const X = Math.round(x + Math.cos(a) * r), Z = Math.round(z + Math.sin(a) * r);
    const h = 1 + Math.floor(rnd() * 9);
    for (let k = 0; k < h; k++) if (rnd() > 0.45) g.setIfEmpty(X, y + k, Z, P.SPRAY);
  }
  return { x, z, y, trail, src, tiers: drawn };
}

export function waterfalls(g) {
  return FALLS.map((f) => waterfall(g, f));
}

/* ---------------------------------------------------------------- 勾云 */

export const CLOUD_CELL = 3;

/**
 * 云带：绕山腰、堵谷口。薄片 + 墨线勾边。
 * 落进粗格场而不是细格场：云是一整片等高的薄片，逐格化既贵又会在掠射角下
 * 摩爾成放射状斜纹（琉璃浮屠的云床上付过这笔学费）。
 */
function cloudBlob(f, cx, cz, cy, rx, rz, seed, thick = 1) {
  const C = f.cell;
  const R = Math.max(rx, rz) + 6;
  for (let x = Math.round(cx - R); x <= Math.round(cx + R); x += C)
    for (let z = Math.round(cz - R); z <= Math.round(cz + R); z += C) {
      if (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0 || z > WORLD.z1) continue;
      const nx = (x - cx) / rx, nz = (z - cz) / rz;
      const d = Math.sqrt(nx * nx + nz * nz);
      const wobble = 1 + 0.34 * (fbm2(x * 0.017 + seed, z * 0.017 - seed, 3, seed * 5) - 0.5) * 2;
      if (d > wobble) continue;
      const edge = d > wobble - 0.18;
      /* 云带是水平的一片，穿过山腰：地形比云高的格子直接跳过（云埋进山里），
         于是它只在山的两翼与身前露头，读作「缠在山腰」，而不是一块浮空的白板。 */
      const t = topAt(x, z);
      if (t >= cy) continue;
      /* 云要「缠」在山腰，不是浮在江面上空：离地太高的一格薄片会被读成
         一张飘在空中的白纸板，或干脆是山体上的一块白斑。 */
      if (cy - t > 74) continue;
      const wob = Math.round((fbm2(x * 0.05 + seed, z * 0.05 - seed, 2, seed + 31) - 0.5) * 1.2);
      const iy = Math.floor((cy + wob) / C);
      for (let k = 0; k < thick; k++) {
        const m = edge ? P.CLOUD_EDGE : k === 0 ? P.CLOUD : P.CLOUD_DK;
        f.set(Math.floor(x / C), iy + k, Math.floor(z / C), m);
      }
    }
}

export function clouds(f) {
  const rnd = mulberry32(4242);
  let n = 0;
  /* 每组山的山腰缠一到两道云带；组间谷口堵一道。
     高度必须乘 hMul：总谱里的 top 是未缩放的原始高度，直接用会把云带甩到石青山头上，
     在青顶撒一脸白点（第一版就是这个病）。 */
  for (const grp of GROUPS) {
    const top = grp.top * CFG.hMul;
    /* 腰云要落在山最宽的那一段：旧版 0.26–0.36 加第二道 1.7×，
       第二道已经上到窄窄的山头，被地形切成一脸白点。
       下限 30 格是给村落留的：第 1 组只有 50 格高，按比例算出来的
       腰云正好糊在村口屋背上，读成一块浮空的白板。 */
    const waist = Math.max(30, top * (0.19 + rnd() * 0.08));
    const cx = grp.cx + (rnd() - 0.5) * 40;
    const cz = -30 + (rnd() - 0.5) * 50;
    cloudBlob(f, cx, cz, Math.round(waist), 62 + rnd() * 34, 34 + rnd() * 18, grp.id * 3 + 1, 2);
    n++;
    if (top > 150) {
      cloudBlob(f, cx + (rnd() - 0.5) * 90, cz + (rnd() - 0.5) * 60, Math.round(waist * 1.45), 44 + rnd() * 22, 24 + rnd() * 12, grp.id * 5 + 2, 2);
      n++;
    }
  }
  /* 云只缠山腰：贴在水面上的云带会读成浮冰（第一版栽在这儿）。
     水面的「留白」由网巾水着色器承担，谷口的雾气交给半透明 MIST。 */
  return { bands: n };
}

/** 半透明雾气（ALPHA）：只在山谷里飘几片，给「迷茫幽深」一点体积。
 *  必须堆厚：单层 3 格的薄片从侧面看就是一排竖立的白刀片，铺成一片就变成
 *  横在山腰的白色梳齿（深远章实拍踩过）。改成 3–5 层自下而上渐稀的软块。 */
export function mist(f) {
  const rnd = mulberry32(99);
  const C = f.cell;
  let n = 0;
  for (let i = 0; i < 26; i++) {
    const grp = GROUPS[Math.floor(rnd() * GROUPS.length)];
    const cx = grp.cx + (rnd() - 0.5) * 170;
    const cz = (rnd() - 0.5) * 150;   // 谷雾留在山谷里，别糊到近岸水面上
    const cy = 12 + rnd() * Math.min(58, grp.top * CFG.hMul * 0.36);
    const rx = 26 + rnd() * 40, rz = 14 + rnd() * 22;
    const thick = 3 + Math.floor(rnd() * 3);
    for (let x = Math.round(cx - rx); x <= Math.round(cx + rx); x += C)
      for (let z = Math.round(cz - rz); z <= Math.round(cz + rz); z += C) {
        const d = Math.hypot((x - cx) / rx, (z - cz) / rz);
        const w = 1 + 0.3 * (valueNoise2(x * 0.03, z * 0.03, i) - 0.5) * 2;
        if (d > w) continue;
        if (hash3(x, i, z) > 0.55) continue;
        const t = topAt(x, z);
        const base = Math.round(cy + (t > 0 ? Math.min(6, t * 0.06) : 0));
        const ix = Math.floor(x / C), iz = Math.floor(z / C);
        const iy = Math.floor(base / C);
        for (let k = 0; k < thick; k++) {
          /* 越往上越稀：底部 80% 保留，逐层减 */
          if (hash3(ix, i * 13 + k, iz) > 0.82 - k * 0.19) continue;
          if (!f.has(ix, iy + k, iz)) {
            f.set(ix, iy + k, iz, P.MIST);
            n++;
          }
        }
      }
  }
  return { voxels: n };
}
