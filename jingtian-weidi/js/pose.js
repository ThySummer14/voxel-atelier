// 姿态映射：编织引擎的一帧 → 每个动态部件的变换（浏览器与离线光栅器共用）
import { LOOM, TAPE, WARP, RACK, SHUTTLES, warpX, slotHome } from './spec.js';
import { PW, PH } from './patterns.js';
import { newPart, box, finish } from './dynmesh.js';
import { PAL } from './voxel.js';

const C = (k) => PAL.idx[k];
const dz = LOOM.heddleZ - LOOM.fellZ;                 // -26
export const SHED_ANGLE = Math.asin(LOOM.shedLift / Math.abs(dz));
export const BACK_ANGLE = Math.asin(LOOM.shedLift / Math.abs(LOOM.heddleZ - (LOOM.warpBeam.z + 4)));

// 织入中的布：行 j 建在 fellZ - j（供整体前移）
export function clothRows(ctx, pattern, rows) {
  const p = newPart('cloth', { pivot: [0, LOOM.warpY, LOOM.fellZ] });
  for (let j = 0; j < rows; j++) {
    let i = 0;
    while (i < PW) {
      const c = topOf(pattern, i, j);
      let k = i;
      while (k + 1 < PW && topOf(pattern, k + 1, j) === c) k++;
      box(ctx, p, warpX(i), LOOM.warpY, LOOM.fellZ - j, warpX(k) + 2, LOOM.warpY + 1, LOOM.fellZ - j + 1, C('silk.' + c));
      i = k + 1;
    }
  }
  return finish(p);
}
const topOf = (pat, i, j) => {
  const m = pat.cells[j][i];
  if (m !== null) return m;
  return ((i + 2 * j) % 4) === 0 ? pat.warp : pat.ground;
};

// 棚内纬线（梭刚引进去、还没打紧）
export function weftPart(ctx, frame) {
  const p = newPart('weft', { pivot: [0, 0, 0] });
  if (frame.weftHidden) return finish(p);
  for (const s of frame.strips) {
    box(ctx, p, warpX(s.i0), frame.weftY, frame.weftZ, warpX(s.i1) + 2, frame.weftY + 1, frame.weftZ + 1, C('silk.' + s.c));
  }
  return finish(p);
}

// 花本带整体平移（卡片建在第 j 张位于 x = j*pitch 处）
export const tapeTrans = (frame) => [-frame.tapeShift * TAPE.pitch, 0, 0];

export function poseAll(frame, pattern) {
  const M = new Map();
  const put = (k, t = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => M.set(k, { t, r, s });
  if (frame.panel) {
    // 落机：平板从织口翻到晾锦架
    const u = frame.panel.progress;
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const rail = RACK.rails[(pattern.tape && pattern.tape.slot) || 0];
    put('cloth', [0, 0, PH + 400 * e], [0, 0, 0]);     // 织机上的布让位（飞到架上的那张才是真身）
    put('panel', [
      -76 * e,
      (rail - 21 - 56.5) * e + Math.sin(Math.PI * e) * 18,
      (RACK.z - LOOM.fellZ) * e + Math.sin(Math.PI * e) * 46 + (1 - e) * 0,
    ], [Math.PI / 2 * e, 0, 0]);
  } else {
    put('cloth', [0, 0, frame.clothShift], [0, 0, 0]);
  }
  for (let i = 0; i < PW; i++) {
    put(`warp.shed.${i}`, [0, 0, 0], [SHED_ANGLE * frame.openness[i], 0, 0]);
    put(`warp.back.${i}`, [0, 0, 0], [-BACK_ANGLE * frame.openness[i], 0, 0]);
  }
  put('reed', [0, 0, 0], [LOOM.reedBeat * frame.reed, 0, 0]);
  put('beam.warp', [0, 0, 0], [frame.warpBeamAngle, 0, 0]);
  put('beam.cloth', [0, 0, 0], [frame.clothBeamAngle, 0, 0]);
  put('tape.cards', tapeTrans(frame));
  put('tape.roll.L', [0, 0, 0], [0, 0, frame.rollAngle]);
  put('tape.roll.R', [0, 0, 0], [0, 0, -frame.rollAngle * 0.6]);
  for (let k = 0; k < 5; k++) {
    const home = slotHome(k);
    const flying = frame.shuttle && frame.shuttle.slot === k ? frame.shuttle : null;
    const t = flying ? [flying.pos[0] - home[0], flying.pos[1] - home[1], flying.pos[2] - home[2]] : [0, 0, 0];
    put(`shuttle.${k}`, t);
    const use = frame.bobbinUse ? (frame.bobbinUse[k] ?? 1) : 1;
    const s = 0.42 + 0.58 * Math.max(0, 1 - use);
    put(`shuttle.${k}.bobbin`, t, [0, 0, 0], [1, s, s]);
  }
  // 火焰跳动
  const tw = frame.t !== undefined ? frame.t : 0;
  const f = 1 + 0.10 * Math.sin(tw * 9.1) + 0.06 * Math.sin(tw * 23.7);
  put('lamp.flame', [0, 0.6 * f, 0], [0, 0, 0.06 * Math.sin(tw * 5.3)], [1, f, 1]);
  return M;
}

// 晾锦架上的成品（花纹已织好，竖直挂着）
export function rackPose(slot) {
  const rail = RACK.rails[slot];
  return {
    t: [-76, rail - 21 - 56.5, RACK.z - LOOM.fellZ],
    r: [Math.PI / 2, 0, 0],
    s: [1, 1, 1],
  };
}
// 把布面几何的顶面片按面积栅格化回 60×42 格，返回每格实测色（去光照后的原始顶点色均值）
export function clothSample(part, pattern) {
  const pos = part.positions, col = part.colors;
  const acc = [];
  for (let j = 0; j < PH; j++) acc.push(new Array(PW).fill(null).map(() => [0, 0, 0, 0]));
  const nQuad = pos.length / 12;
  for (let q = 0; q < nQuad; q++) {
    const o = q * 12;
    let cy = 0, z0 = Infinity, z1 = -Infinity, x0 = Infinity, x1 = -Infinity;
    for (let k = 0; k < 4; k++) {
      cy += pos[o + k * 3 + 1];
      z0 = Math.min(z0, pos[o + k * 3 + 2]); z1 = Math.max(z1, pos[o + k * 3 + 2]);
      x0 = Math.min(x0, pos[o + k * 3]); x1 = Math.max(x1, pos[o + k * 3]);
    }
    if (Math.abs(cy / 4 - 1) > 0.02) continue;                 // 只看顶面（枢轴在经面）
    for (let j = 0; j < PH; j++) {
      const rz0 = LOOM.fellZ - j - (LOOM.fellZ), rz1 = rz0 + 1;  // 局部 z：-j..-j+1
      const oz = Math.min(z1, rz1) - Math.max(z0, rz0);
      if (oz <= 0) continue;
      for (let i = 0; i < PW; i++) {
        const rx0 = warpX(i), rx1 = warpX(i) + 2;
        const ox = Math.min(x1, rx1) - Math.max(x0, rx0);
        if (ox <= 0) continue;
        const a = ox * oz;
        const t = acc[j][i];
        t[0] += col[o] * a; t[1] += col[o + 1] * a; t[2] += col[o + 2] * a; t[3] += a;
      }
    }
  }
  return acc.map(row => row.map(t => t[3] > 0.5 ? [t[0] / t[3], t[1] / t[3], t[2] / t[3]] : null));
}
