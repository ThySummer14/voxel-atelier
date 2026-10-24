// 场景装配：体素世界 → 静态网格 + 动态件（浏览器与离线光栅器共用同一套构建代码）
import { Vox, buildMeshes, bakeVisibility } from './voxel.js';
import { buildFloor, buildWalls, buildWindowLeft, buildLampStand, buildCeiling, buildDoor, buildClothShelf } from './sculpt/room.js';
import {
  buildLoomStatic, buildBeamsDyn, buildReedDyn, buildWarpThreadsDyn, tapeCards,
  buildShuttlesDyn, buildSpoolsDyn, buildFlameDyn, buildTapeRollsDyn, clothPart,
} from './sculpt/loom.js';
import { clothRows, weftPart } from './pose.js';
import { buildPattern, PW, PH } from './patterns.js';
import { LIGHT } from './spec.js';

export { PW, PH };

export function buildScene({ onProgress } = {}) {
  const v = new Vox();
  buildFloor(v);
  buildWalls(v);
  buildWindowLeft(v);
  buildCeiling(v);
  buildDoor(v);
  buildClothShelf(v);
  buildLampStand(v, LIGHT.lampPos);
  buildLoomStatic(v);
  const vis = bakeVisibility(v);
  const { parts, stats } = buildMeshes(v, { vis, onProgress });
  return { v, vis, ctx: { v, vis }, statics: parts, stats };
}

export function buildDyn(ctx, patternIdx) {
  const pattern = buildPattern(patternIdx);
  const lift0 = new Array(PW).fill(false);
  const parts = [
    ...buildBeamsDyn(ctx, pattern),
    buildReedDyn(ctx),
    ...buildWarpThreadsDyn(ctx, pattern.warp),
    clothRows(ctx, pattern, 0),
    weftPart(ctx, { weftHidden: true }),
    ...buildTapeRollsDyn(ctx),
    tapeCards(ctx, pattern),
    ...buildShuttlesDyn(ctx, pattern),
    ...buildSpoolsDyn(ctx, pattern),
    buildFlameDyn(ctx),
  ];
  return { pattern, parts };
}

export function panelPart(ctx, pattern, key) {
  return clothPart(ctx, pattern, key, PH);
}
