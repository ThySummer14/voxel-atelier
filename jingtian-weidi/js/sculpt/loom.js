// 花楼提花机本体：静态构件进体素网格；动态构件（会转/会飞/会长的）用 dynmesh 另建。
import { PAL } from '../voxel.js';
import { newPart, box, finish } from '../dynmesh.js';
import { LOOM, WARP, TAPE, RACK, LIGHT } from '../spec.js';
import { PW, PH, topColor } from '../patterns.js';

const C = (k) => PAL.idx[k];
const warpX = (i) => WARP.x0 + WARP.pitch * i;      // 第 i 根经线的左格
const P = LOOM.postX, HALF = (LOOM.postW - 1) / 2;

// ============ 静态 ============
export function buildLoomStatic(v) {
  // 立柱：后柱与中柱直升到花楼顶，前柱只到侧梁
  v.begin('loom.post');
  for (const sx of [-1, 1]) {                       // 后柱：直上花楼顶（细一档）
    const x = sx * P;
    v.box(x - 1, 0, LOOM.backZ - HALF, x + 1, LOOM.towerTopY, LOOM.backZ + HALF, C('wood.mid'));
    for (let y = 8; y < LOOM.towerTopY - 6; y += 9) {
      v.box(x - 1, y, LOOM.backZ - HALF, x - 1, y + 1, LOOM.backZ + HALF, C('wood.dark'));
      v.box(x + 1, y, LOOM.backZ - HALF, x + 1, y + 1, LOOM.backZ + HALF, C('wood.dark'));
    }
  }
  for (const sx of [-1, 1]) {                       // 中柱/前柱：只到侧梁（让织口通透）
    for (const z of [LOOM.midZ, LOOM.frontZ]) {
      const x = sx * P;
      const h = z === LOOM.midZ ? 2 : HALF;
      v.box(x - h, 0, z - HALF, x + h, LOOM.railY + 4, z + HALF, C('wood.mid'));
      for (let y = 8; y < LOOM.railY; y += 9) v.box(x - h, y, z - HALF, x - h, y + 1, z + HALF, C('wood.dark'));
    }
  }
  for (const sx of [-1, 1]) {                       // 打手轴立柱（细）
    const x = sx * P;
    v.box(x - 1, LOOM.railY + 2, LOOM.reedPivot[2] - 2, x + 1, LOOM.reedPivot[1] - 1, LOOM.reedPivot[2] + 2, C('wood.mid'));
  }
  // 花楼横撑：连后柱与花楼前缘
  v.begin('loom.tower');
  for (const sx of [-1, 1]) {
    const x = sx * P;
    v.box(x - HALF, LOOM.towerTopY - 6, -18, x + HALF, LOOM.towerTopY + 2, -10, C('wood.dark'), (xx, y, z) => y > LOOM.towerTopY - 4 || z < -14);
  }

  v.begin('loom.rail');
  for (const sx of [-1, 1]) v.box(sx * P - HALF, LOOM.railY - 2, LOOM.backZ - HALF, sx * P + HALF, LOOM.railY + 2, LOOM.frontZ + HALF, C('wood.mid'));
  for (const z of [LOOM.backZ, LOOM.midZ]) {
    v.box(-P - HALF, LOOM.railY - 2, z - HALF + 1, P + HALF, LOOM.railY + 2, z + HALF - 1, C('wood.mid'), (x, y, zz) => ((x + 4096) % 29) > 2);
  }

  // 花楼顶梁 + 悬山屋面
  v.begin('loom.tower');
  for (const sx of [-1, 1]) v.box(sx * P - HALF, LOOM.towerTopY - 2, LOOM.backZ - HALF, sx * P + HALF, LOOM.towerTopY + 2, -12, C('wood.dark'));
  for (const z of [LOOM.backZ, -14]) {
    v.box(-P - HALF, LOOM.towerTopY - 2, z - HALF, P + HALF, LOOM.towerTopY + 2, z + HALF, C('wood.mid'), (x, y, zz) => ((x + 4096) % 29) > 2);
  }
  v.begin('loom.roof');
  {
    const ridgeY = LOOM.roofY + 8, span = 92, z0 = LOOM.backZ - 10, z1 = LOOM.backZ + 14;   // 只披在经轴上方，别挡住天井光
    for (let x = -span; x <= span; x++) {
      const h = Math.round(ridgeY - (Math.abs(x) / span) * 13);
      for (let z = z0; z <= z1; z++) {
        const tile = ((x + 4096) % 6) === 0 ? C('wood.dark') : (Math.abs(x) < 4 ? C('wood.mid') : C('wood.dark'));
        v.set(x, h, z, tile);
        if (((z + 4096) % 13) === 0) v.set(x, h, z, C('wood.mid'));
      }
      for (let y = h - 1; y >= LOOM.towerTopY + 2; y--) {
        if (y < LOOM.towerTopY + 4 && Math.abs(x) > 78) v.set(x, y, z0 + 2, C('wood.dark'));
      }
    }
    v.box(-6, ridgeY + 1, z0 - 2, 6, ridgeY + 2, z1 + 2, C('wood.ink'));
  }

  // 打手轴（吊筘）
  v.begin('loom.beaterAxle');
  {
    const [px, py, pz] = LOOM.reedPivot;
    v.box(-P + HALF, py - 2, pz - 2, P - HALF, py + 2, pz + 2, C('wood.mid'), (x, y, z) => ((x + 4096) % 23) > 2);
    for (const sx of [-1, 1]) v.box(sx * P - HALF, py - 3, pz - 3, sx * P + HALF, py + 3, pz + 3, C('wood.dark'));
  }

  // 胸梁（顶面与经面齐平）
  v.begin('beam.breast');
  v.cyl(0, -P + 2, P - 2, LOOM.breastBeam.y, LOOM.breastBeam.z, LOOM.breastBeam.r, C('wood.mid'), (x, y, z, a, u, w) => u >= LOOM.breastBeam.y - 1);
  v.cyl(0, -P + 2, P - 2, LOOM.breastBeam.y, LOOM.breastBeam.z, LOOM.breastBeam.r - 1, C('wood.light'));

  buildBraces(v);
  buildHarness(v);
  buildTapeStatic(v);
  buildDryingRack(v);
  buildProps(v);
}


// 机架斜撑、踏杆、机前踏板 —— 让机架read起来是"一台机器"
function buildBraces(v) {
  const P = LOOM.postX;
  v.begin('loom.brace');
  for (const sx of [-1, 1]) {
    for (const [z0, z1] of [[LOOM.backZ, LOOM.midZ], [LOOM.midZ, LOOM.frontZ]]) {
      const n = 14;
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        const z = Math.round(z0 + (z1 - z0) * t);
        const y = Math.round(4 + (LOOM.railY - 6) * t);
        for (let d = 0; d < 3; d++) v.set(sx * (P - 4 + d), y, z, C('wood.dark'));
      }
    }
  }
  // 前踏杆（两根，连到提综）
  for (const sx of [-1, 1]) {
    v.box(sx * 40 - 8, 2, 22, sx * 40 + 8, 5, 30, C('wood.mid'), (x, y, z) => y === 4 || ((x + 4096) % 21) < 3);
    for (let k = 0; k <= 16; k++) {
      const t = k / 16;
      const y = Math.round(5 + (LOOM.railY - 6 - 5) * t);
      v.set(sx * 40, y, Math.round(30 + 16 * t), C('wood.dark'));
    }
  }
  // 机前踏板（织工脚下）
  v.box(-56, 0, 92, 56, 3, 108, C('wood.mid'), (x, y, z) => y === 2 || ((x + 4096) % 37) < 4);
  for (const sx of [-1, 1]) for (const dz of [-6, 6]) {
    v.box(sx * 52 - 3, 0, 98 + dz - 3, sx * 52 + 3, 3, 98 + dz + 3, C('wood.dark'));
  }
}

// 提花线束：60 根丝线自综眼上方升起（y≤96），再折向花本带（阶梯斜线），末端接提花子
function buildHarness(v) {
  v.begin('harness.cord');
  for (let i = 0; i < PW; i++) {
    const x = warpX(i);
    v.box(x, 50, LOOM.heddleZ, x, 96, LOOM.heddleZ, C('silk.cord'), (xx, y, z) => ((y + 4096) % 19) !== 0);
  }
  v.begin('harness.fan');
  for (let i = 0; i < PW; i++) {
    const x = warpX(i);
    const n = 20;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const z = Math.round(LOOM.heddleZ + (TAPE.hookZ - LOOM.heddleZ) * t);
      const y = Math.round(96 + (TAPE.holeY0 - 1 - 96) * t);
      v.set(x, y, z, C('silk.cord'));
    }
  }
  v.begin('harness.hook');
  for (let i = 0; i < PW; i++) {
    const x = warpX(i);
    v.box(x, TAPE.holeY0 - 1, TAPE.hookZ, x, TAPE.holeY1, TAPE.hookZ + 1, C('wood.brass'));
  }
  v.begin('harness.bar');
  v.box(-P - 2, 92, LOOM.heddleZ - 2, P + 2, 95, LOOM.heddleZ + 2, C('wood.dark'), (x, y, z) => y === 94 || Math.abs(x) > P - 3);
  for (const sx of [-1, 1]) {                        // 斜吊（从花楼顶梁吊下线束横梁）
    for (let k = 0; k <= 18; k++) {
      const t = k / 18;
      const x = sx * (P - t * 0 - 0);
      const y = Math.round(95 + (LOOM.towerTopY - 4 - 95) * t);
      const z = Math.round((LOOM.heddleZ + 2) + (-13 - (LOOM.heddleZ + 2)) * t);
      v.set(sx * (P - 1), y, z, C('wood.dark'));
      v.set(sx * (P + 1), y, z, C('wood.dark'));
    }
  }
}

function buildTapeStatic(v) {
  const LX = TAPE.rollX, y0 = TAPE.cardY0 - 5, y1 = TAPE.cardY0 + TAPE.cardH + 4;
  v.begin('tape.house');
  v.box(-LX - 16, y0, TAPE.backZ - 1, LX + 16, y1, TAPE.backZ, C('wood.dark'));
  v.box(-LX - 16, y0, TAPE.z - 9, -LX - 13, y1, TAPE.z + 2, C('wood.dark'));
  v.box(LX + 13, y0, TAPE.z - 9, LX + 16, y1, TAPE.z + 2, C('wood.dark'));
  v.box(-LX - 16, y0, TAPE.z - 9, LX + 16, y0 + 2, TAPE.z + 2, C('wood.dark'));
  v.box(-LX - 16, y1 - 2, TAPE.z - 9, LX + 16, y1, TAPE.z + 2, C('wood.dark'));
  v.begin('tape.light', { emissive: true });
  v.box(-LX + 2, y0 + 4, TAPE.lightZ, LX - 2, y1 - 4, TAPE.lightZ, C('emissive.panel'));
  v.begin('tape.bracket');
  for (const sx of [-1, 1]) {
    v.box(sx * LX - 6, TAPE.rollY, TAPE.z - 12, sx * LX + 6, TAPE.rollY + 6, TAPE.z + 6, C('wood.dark'));
    v.box(sx * LX - 4, TAPE.rollY - 14, TAPE.z - 8, sx * LX + 4, TAPE.rollY, TAPE.z + 2, C('wood.mid'), (x, y, z) => Math.abs(x - sx * LX) > 2);
    v.box(sx * P - 4, TAPE.rollY + 2, TAPE.z - 6, sx * LX - 2, TAPE.rollY + 10, TAPE.z - 1, C('wood.mid'));
  }
  v.begin('tape.gate');
  v.box(-64, TAPE.cardY0 - 2, TAPE.gateZ, -61, TAPE.cardY0 + TAPE.cardH + 2, TAPE.gateZ + 2, C('wood.brass'));
  v.box(61, TAPE.cardY0 - 2, TAPE.gateZ, 64, TAPE.cardY0 + TAPE.cardH + 2, TAPE.gateZ + 2, C('wood.brass'));
  v.box(-64, TAPE.cardY0 - 2, TAPE.gateZ, 64, TAPE.cardY0 + 1, TAPE.gateZ + 2, C('wood.brass'));
  v.box(-64, TAPE.cardY0 + TAPE.cardH - 1, TAPE.gateZ, 64, TAPE.cardY0 + TAPE.cardH + 2, TAPE.gateZ + 2, C('wood.brass'));
}

function buildDryingRack(v) {
  const { x0, x1, z, postW, rails, height } = RACK;
  v.begin('dryrack');
  for (const x of [x0, x1]) v.box(x - postW, 0, z - postW, x + postW, height, z + postW, C('wood.dark'));
  v.box(x0 - postW, 0, z - postW, x1 + postW, 4, z + postW, C('wood.mid'), (x, y, zz) => y === 3 || ((x + 4096) % 31) < 3);
  for (const r of rails) v.box(x0, r, z - 4, x1, r + 3, z - 1, C('wood.mid'), (x, y, zz) => y === r + 2 || ((x + 4096) % 37) < 3);
}

function buildProps(v) {
  // 丝线架（立柱 + 六格架）
  const sx = -108, sz = 62;
  v.begin('spoolRack');
  for (const sz2 of [sz - 26, sz + 26]) {
    v.box(sx - 12, 0, sz2 - 2, sx + 12, 46, sz2 + 2, C('wood.dark'));
  }
  v.box(sx - 12, 30, sz - 28, sx + 12, 33, sz + 28, C('wood.mid'), (x, y, z) => ((x + 4096) % 23) > 2);
  v.box(sx - 12, 44, sz - 28, sx + 12, 46, sz + 28, C('wood.dark'));
  for (let k = 0; k < 6; k++) {
    v.box(sx - 12, 33, sz - 24 + k * 9, sx + 12, 34, sz - 22 + k * 9, C('wood.dark'));
    v.box(sx - 12, 33, sz - 20 + k * 9, sx + 12, 34, sz - 18 + k * 9, C('wood.dark'));
  }
  // 坐凳
  v.begin('stool');
  const stx = -46, stz = 74;
  v.box(stx - 16, 16, stz - 10, stx + 16, 19, stz + 10, C('wood.light'), (x, y, z) => ((x + 4096) % 27) > 2);
  for (const [dx, dz] of [[-13, -7], [13, -7], [-13, 7], [13, 7]]) {
    v.box(stx + dx - 2, 0, stz + dz - 2, stx + dx + 2, 16, stz + dz + 2, C('wood.dark'));
  }
  // 竹筐（装线团）
  v.begin('basket');
  const bx = -92, bz = 96;
  for (let y = 0; y < 16; y++) {
    const r = 13 - y * 0.30;
    v.cyl(1, y, y, bx, bz, r, C('wood.bamboo'), (x, yy, z) => {
      const d = Math.hypot(x + 0.5 - bx, z + 0.5 - bz);
      return ((y % 3) === 0) || d > r - 1.6;
    });
  }
  v.box(bx - 8, 14, bz - 8, bx + 8, 17, bz + 8, C('wood.bamboo'), (x, y, z) => ((x + z + 8192) % 7) < 3);
}

// ============ 动态 ============
export function buildBeamsDyn(ctx, pattern) {
  const dyn = [];
  {
    const { y, z, r } = LOOM.warpBeam;
    const p = newPart('beam.warp', { pivot: [0, y, z] });
    box(ctx, p, -P + 4, y - r, z - r, P - 4, y + r, z + r, C('wood.mid'));
    for (let a = -P + 4; a <= P - 10; a += 9) box(ctx, p, a, y - r - 1, z - r, a + 3, y + r + 1, z + r, C('silk.' + (pattern ? pattern.warp : 'ivory')));
    for (const sx of [-1, 1]) {
      box(ctx, p, sx * (P - 6), y - 11, z - 4, sx * (P - 2), y + 11, z + 4, C('wood.brass'));
      for (let k = 0; k < 8; k++) {
        const th = k * Math.PI / 4;
        const ry = Math.round(y + 12 * Math.sin(th)), rz = Math.round(z + 12 * Math.cos(th));
        box(ctx, p, sx * (P - 6), ry, rz - 1, sx * (P - 2), ry + 2, rz + 1, C('wood.brass'));
      }
    }
    dyn.push(finish(p));
  }
  {
    const { y, z, r } = LOOM.clothBeam;
    const p = newPart('beam.cloth', { pivot: [0, y, z] });
    box(ctx, p, -P + 6, y - r, z - r, P - 6, y + r, z + r, C('wood.mid'));
    for (let a = -P + 6; a <= P - 12; a += 11) box(ctx, p, a, y - r - 1, z - r, a + 3, y + r + 1, z + r, C('wood.light'));
    for (let a = -P + 18; a <= P - 24; a += 37) box(ctx, p, a, y - r - 1, z - r, a + 5, y + r + 1, z + r, C('wood.dark'));
    for (const sx of [-1, 1]) box(ctx, p, sx * (P - 6), y - 9, z - 3, sx * (P - 2), y + 9, z + 3, C('wood.brass'));
    dyn.push(finish(p));
  }
  return dyn;
}

export function buildReedDyn(ctx) {
  const p = newPart('reed', { pivot: LOOM.reedPivot });
  const [, pvy] = LOOM.reedPivot;
  const zr = LOOM.reedRestZ;
  for (const sx of [-1, 1]) box(ctx, p, sx * 66 - 2, 46, zr - 2, sx * 66 + 2, pvy - 2, zr + 2, C('wood.dark'));
  box(ctx, p, -68, 28, zr - 2, 68, 30, zr + 1, C('wood.dark'));
  box(ctx, p, -68, 44, zr - 2, 68, 46, zr + 1, C('wood.dark'));
  for (const sx of [-1, 1]) box(ctx, p, sx * 67, 28, zr - 2, sx * 68, 46, zr + 1, C('wood.dark'));
  for (let i = 0; i < PW + 1; i++) {
    const x = warpX(i) - 1;
    if (x < -65 || x > 64) continue;
    box(ctx, p, x, 30, zr - 1, x + 1, 44, zr + 1, C('wood.bamboo'));
  }
  return finish(p);
}

// 经线：每根一个部件（综眼→织口 / 经轴→综眼），逐根按开口度绕轴转
export function buildWarpThreadsDyn(ctx, warpCol = 'ivory') {
  const dyn = [];
  for (let i = 0; i < PW; i++) {
    const x = warpX(i);
    const shed = newPart(`warp.shed.${i}`, { pivot: [0, LOOM.warpY, LOOM.fellZ] });
    box(ctx, shed, x, LOOM.warpY, LOOM.heddleZ, x + 1, LOOM.warpY + 1, LOOM.fellZ, C('silk.' + warpCol));
    dyn.push(finish(shed));
    const back = newPart(`warp.back.${i}`, { pivot: [0, LOOM.warpY, LOOM.warpBeam.z + 4] });
    box(ctx, back, x, LOOM.warpY, LOOM.warpBeam.z + 4, x + 1, LOOM.warpY + 1, LOOM.heddleZ, C('silk.' + warpCol));
    dyn.push(finish(back));
  }
  return dyn;
}

// 织成的布：42 纬 × 60 格，逐行长出（rowLimit）
export function clothPart(ctx, pattern, key, rowLimit = PH) {
  const p = newPart(key, { pivot: [0, LOOM.warpY, LOOM.fellZ] });
  for (let j = 0; j < rowLimit; j++) {
    let i = 0;
    while (i < PW) {
      const c = topColor(pattern, i, j);
      let k = i;
      while (k + 1 < PW && topColor(pattern, k + 1, j) === c) k++;
      box(ctx, p, warpX(i), LOOM.warpY, LOOM.fellZ + j, warpX(k) + 2, LOOM.warpY + 1, LOOM.fellZ + j + 1, C('silk.' + c));
      i = k + 1;
    }
  }
  return finish(p);
}

// 花本卡：42 张，孔位 = 提起的经线（正面朝 +Z，背后是背光板）
export function tapeCards(ctx, pattern) {
  const p = newPart('tape.cards', { pivot: [0, 0, 0] });
  const { z, cardY0, cardW, cardH, holeY0, holeY1 } = TAPE;
  for (let j = 0; j < PH; j++) {
    const ox = j * TAPE.pitch;
    const x0 = ox - cardW / 2, x1 = ox + cardW / 2;
    box(ctx, p, x0, cardY0, z, x1, holeY0 - 1, z + 1, C('wood.card'));
    box(ctx, p, x0, holeY1 + 1, z, x1, cardY0 + cardH - 1, z + 1, C('wood.card'));
    const lift = new Set(cardHoles(pattern, j));
    let i = 0;                       // 孔带：提起处留孔，其余连成实条
    while (i < PW) {
      if (lift.has(i)) { i++; continue; }
      let k = i;
      while (k + 1 < PW && !lift.has(k + 1)) k++;
      box(ctx, p, warpX(i), holeY0, z, warpX(k) + 2, holeY1 + 1, z + 1, C('wood.card'));
      i = k + 1;
    }
    for (const sx of [x0, x1 - 2]) box(ctx, p, sx, holeY0 - 3, z, sx + 2, holeY1 + 4, z + 1, C('wood.bamboo'));
  }
  return finish(p);
}

/** 花本卡第 j 张的孔位（= 该纬提起的经线）——卡片几何与提综表共此一份来源 */
export function cardHoles(pattern, j) {
  if (pattern.liftSets) return pattern.liftSets[j];
  const out = [];
  for (let i = 0; i < PW; i++) {
    if (pattern.cells[j][i] !== null) continue;
    if (((i + 2 * j) % 4) === 0) out.push(i);
  }
  return out;
}

// 五把梭 + 丝线团（按花本色号着色；线团可缩放表示余线）
export function buildShuttlesDyn(ctx, pattern) {
  const dyn = [];
  const palette = [pattern.ground, ...pattern.motifs];
  for (let k = 0; k < 5; k++) {
    const slotZ = 56 + 9 * k;
    const col = palette[k % palette.length];
    const p = newPart(`shuttle.${k}`, { pivot: [95, 41, slotZ] });
    for (let i = -7; i <= 7; i++) {
      const h = Math.abs(i) >= 6 ? 0 : (Math.abs(i) >= 3 ? 1 : 2);
      const w = Math.abs(i) >= 6 ? 2 : (Math.abs(i) >= 3 ? 3 : 4);
      box(ctx, p, 95 + i, 40 + h, slotZ - w, 95 + i + 1, 42 + h, slotZ + w + 1, C('wood.light'));
    }
    box(ctx, p, 95 - 3, 44, slotZ - 2, 95 + 4, 45, slotZ + 3, C('wood.brass'));
    dyn.push(finish(p));
    const b = newPart(`shuttle.${k}.bobbin`, { pivot: [95, 41, slotZ + 1] });
    box(ctx, b, 95 - 5, 41, slotZ - 2, 95 + 6, 43, slotZ + 3, C('silk.' + col));
    dyn.push(finish(b));
  }
  return dyn;
}

export function buildSpoolsDyn(ctx, pattern) {
  const dyn = [];
  const sx = -108, sz = 62;
  const palette = [pattern.ground, ...pattern.motifs, 'ivory', 'moon'];
  for (let k = 0; k < 6; k++) {
    const zc = sz - 23 + k * 9.2;
    const p = newPart(`spool.${k}`, { pivot: [sx, 0, zc] });
    const col = palette[k % palette.length];
    for (let y = 0; y < 22; y++) {                         // 锥形丝线（底宽顶尖）
      const r = Math.max(0.7, 6.2 - y * 0.27);
      box(ctx, p, sx - r, 32 + y, zc - r, sx + r, 33 + y, zc + r, C('silk.' + col), { faces: 63 });
    }
    box(ctx, p, sx - 1.2, 32 + 22, zc - 1.2, sx + 1.2, 34 + 22, zc + 1.2, C('wood.brass'));
    dyn.push(finish(p));
  }
  return dyn;
}

export function buildFlameDyn(ctx) {
  const [lx, ly, lz] = LIGHT.lampPos;
  const p = newPart('lamp.flame', { pivot: [lx, ly, lz], emissive: true });
  box(ctx, p, lx - 1, ly - 4, lz - 1, lx + 2, ly + 2, lz + 2, C('emissive.lamp'));
  box(ctx, p, lx, ly + 2, lz, lx + 1, ly + 5, lz + 1, C('emissive.lamp'));
  return finish(p);
}

// 花本带两卷（会随进度转）
export function buildTapeRollsDyn(ctx) {
  const dyn = [];
  for (const s of [-1, 1]) {
    const p = newPart(s < 0 ? 'tape.roll.L' : 'tape.roll.R', { pivot: [s * TAPE.rollX, TAPE.rollY, TAPE.z] });
    const r = TAPE.rollR;
    for (let dz = -4; dz <= 2; dz++) {
      for (let dy = -r; dy <= r; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
        box(ctx, p, s * TAPE.rollX - dx, TAPE.rollY + dy, TAPE.z + dz, s * TAPE.rollX + dx + 1, TAPE.rollY + dy + 1, TAPE.z + dz + 1,
          ((dz + 4096) % 3) === 0 ? C('wood.card') : C('wood.bamboo'));
      }
    }
    box(ctx, p, s * TAPE.rollX - 2, TAPE.rollY - 2, TAPE.z - 6, s * TAPE.rollX + 2, TAPE.rollY + 2, TAPE.z + 4, C('wood.brass'));
    dyn.push(finish(p));
  }
  return dyn;
}