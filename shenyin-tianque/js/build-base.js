// build-base.js — 地基 / 水域 / 栈道 / 屋顶生成算法 / 唐破风门首

import { VoxelWorld, shade, mulberry32 } from './voxel.js';
import { C } from './palette.js';

const R = mulberry32(20260925);

export function buildBaseAndSea(solid, water) {
  // 1. 广袤灵海与海底
  solid.box(-135, 1, -110, 135, 2, 110, C.seaBed);
  water.box(-133, 3, -108, 133, 4, 108);

  // 2. 油屋基底巨岩与海蚀台
  const BASE_X0 = -46, BASE_X1 = 20;
  const BASE_Z0 = -42, BASE_Z1 = 22;

  for (let x = BASE_X0 - 5; x <= BASE_X1 + 5; x++) {
    for (let z = BASE_Z0 - 5; z <= BASE_Z1 + 5; z++) {
      const dx0 = x - (BASE_X0 - 3), dx1 = (BASE_X1 + 3) - x;
      const dz0 = z - (BASE_Z0 - 3), dz1 = (BASE_Z1 + 3) - z;
      const margin = Math.min(dx0, dx1, dz0, dz1);
      if (margin >= 0) {
        const h = Math.min(7, 3 + margin);
        for (let y = 2; y <= h; y++) {
          const col = y <= 4
            ? (R() < 0.35 ? C.rockDark : C.rockMid)
            : (R() < 0.25 ? C.rockLight : C.rockMid);
          solid.set(x, y, z, col);
        }
      }
    }
  }

  // 亲水基台顶面
  solid.box(BASE_X0, 7, BASE_Z0, BASE_X1, 8, BASE_Z1, C.rockLight);

  // 临河驳岸木栈道与缆桩
  solid.box(6, 6, 22, 14, 7, 28, C.wharfPlank);
  for (const bx of [6, 14]) {
    for (const bz of [22, 28]) {
      solid.box(bx, 5, bz, bx, 8, bz, C.wharfWood);
      solid.set(bx, 9, bz, C.timberDark); // 缆桩
    }
  }
}

// 递进飞檐歇山顶构建器
export function buildRoof(solid, glow, rx0, rx1, rz0, rz1, yBase, eaveOver = 2, curved = true) {
  const spanX = rx1 - rx0 + 1, spanZ = rz1 - rz0 + 1;
  const steps = Math.floor(Math.min(spanX, spanZ) / 2) + 1;
  const maxSteps = Math.min(steps, 6);

  for (let step = 0; step <= maxSteps; step++) {
    const y = yBase + step;
    const x0 = rx0 - (maxSteps - step) - (step === 0 ? eaveOver : 0);
    const x1 = rx1 + (maxSteps - step) + (step === 0 ? eaveOver : 0);
    const z0 = rz0 - (maxSteps - step) - (step === 0 ? eaveOver : 0);
    const z1 = rz1 + (maxSteps - step) + (step === 0 ? eaveOver : 0);

    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        const isEdgeX = (x === x0 || x === x1);
        const isEdgeZ = (z === z0 || z === z1);
        const isCorner = isEdgeX && isEdgeZ;

        let col = (step % 2 === 0) ? C.tealRoof : C.tealRoofDark;
        if (step === 0) {
          col = (isEdgeX || isEdgeZ) ? C.gold : C.tealRoofDark;
        }
        solid.set(x, y, z, col);

        // 飞檐起翘与檐角悬灯
        if (step === 0 && isCorner && curved) {
          solid.set(x, y + 1, z, C.goldBright);
          solid.set(x, y + 2, z, C.gold);
          glow.set(x, y - 1, z, C.lanternOrange);
        }
      }
    }

    // 正脊与鸱吻
    if (step === maxSteps) {
      const zc = Math.floor((z0 + z1) / 2);
      for (let x = x0; x <= x1; x++) {
        solid.set(x, y + 1, zc, C.gold);
      }
      solid.box(x0 - 1, y + 1, zc - 1, x0, y + 3, zc + 1, C.goldBright);
      solid.box(x1, y + 1, zc - 1, x1 + 1, y + 3, zc + 1, C.goldBright);
    }
  }
}

// 正门挑空「唐破风」弧形金顶门首
export function buildKarahafu(solid, glow, kx0, kx1, kz, kyBase) {
  const kw = kx1 - kx0 + 1;
  const km = (kx0 + kx1) / 2;

  for (let x = kx0 - 1; x <= kx1 + 1; x++) {
    const dx = Math.abs(x - km);
    const dy = Math.round(3.4 * (1.0 - (dx / (kw * 0.58)) ** 2));
    const y = kyBase + Math.max(0, dy);

    for (let z = kz - 3; z <= kz + 1; z++) {
      solid.set(x, y, z, C.goldBright);
      solid.set(x, y - 1, z, C.vermilion);
    }

    if (Math.abs(x - km) <= 0.6) {
      // 门楣悬挂「天阙」金匾与中央大红灯笼
      solid.set(x, y - 2, kz - 1, C.gold);
      glow.box(x - 1, y - 4, kz - 2, x + 1, y - 3, kz, C.lanternOrange);
    }
  }
}
