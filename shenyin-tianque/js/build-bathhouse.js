// build-bathhouse.js — 油屋神殿主体（八层神殿建筑、柱网、障子透光窗、金匾、大水车、顶层天池）

import { C } from './palette.js';
import { buildRoof, buildKarahafu } from './build-base.js';

export function buildBathhouse(solid, glow, water) {
  // ─── 第一层（入口大堂与外回廊，y: 8..19） ───
  solid.box(-40, 8, -36, 14, 19, 18, C.plasterCream);

  // 朱红巨柱网架
  for (let x = -40; x <= 14; x += 6) {
    for (let z = -36; z <= 18; z += 6) {
      solid.box(x, 8, z, x + 1, 19, z + 1, C.vermilionDark);
    }
    // 檐下大额枋
    solid.box(x, 19, -36, x + 1, 19, 18, C.vermilion);
  }

  // 障子透光门窗
  for (let x = -39; x <= 13; x += 6) {
    for (let y = 11; y <= 16; y += 3) {
      glow.box(x + 2, y, 18, x + 4, y + 1, 18, C.paperWarm);
      solid.box(x + 1, y - 1, 18, x + 5, y - 1, 18, C.timberDark);
      solid.box(x + 1, y + 2, 18, x + 5, y + 2, 18, C.timberDark);
    }
  }

  // 大门通道与唐破风金门首
  solid.carve(7, 8, 17, 13, 16, 19);
  glow.box(7, 8, 16, 13, 15, 16, C.paperWarm); // 门内金碧辉煌透光
  buildKarahafu(solid, glow, 6, 14, 19, 17);

  // 金匾「天阙」
  solid.box(8, 18, 20, 12, 20, 20, C.timberDark);
  solid.box(9, 18, 21, 11, 19, 21, C.goldBright);

  // 第一层重檐飞角
  buildRoof(solid, glow, -42, 16, -38, 20, 20, 3, true);

  // ─── 第二至三层（中层宴会雅阁与出挑回廊，y: 22..35） ───
  solid.box(-36, 22, -32, 10, 35, 14, C.plasterTan);

  // 朱柱与格栅
  for (let x = -36; x <= 10; x += 6) {
    for (let z = -32; z <= 14; z += 6) {
      solid.box(x, 22, z, x + 1, 35, z + 1, C.vermilion);
    }
  }

  // 出挑观景回廊
  solid.box(-34, 22, 14, 8, 23, 17, C.wharfPlank);
  for (let x = -34; x <= 8; x++) {
    solid.set(x, 24, 17, C.vermilionLight);
    if (x % 3 === 0) solid.box(x, 24, 17, x, 25, 17, C.gold);
  }

  // 连排悬挂红灯笼
  for (let x = -32; x <= 6; x += 4) {
    solid.set(x, 29, 16, C.timberDark);
    glow.box(x - 1, 26, 15, x + 1, 28, 16, C.lanternOrange);
  }

  // 第二层重檐飞角
  buildRoof(solid, glow, -38, 12, -34, 16, 36, 3, true);

  // ─── 第四至五层（上层汤殿，收分紧凑，y: 38..51） ───
  solid.box(-30, 38, -28, 4, 51, 8, C.plasterCream);
  for (let x = -30; x <= 4; x += 5) {
    solid.box(x, 38, -28, x + 1, 51, -27, C.vermilion);
    solid.box(x, 38, 7, x + 1, 51, 8, C.vermilion);
  }
  for (let x = -28; x <= 2; x += 4) {
    glow.box(x, 41, 8, x + 2, 44, 8, C.paperWarm);
    glow.box(x, 46, 8, x + 2, 49, 8, C.paperWarm);
  }

  // 第三层重檐飞角
  buildRoof(solid, glow, -32, 6, -30, 10, 52, 3, true);

  // ─── 第六至七层（高耸主阁，层层递进，y: 54..68） ───
  solid.box(-24, 54, -22, -2, 68, 2, C.vermilion);
  solid.box(-23, 55, -21, -3, 67, 1, C.plasterCream);
  for (let x = -22; x <= -4; x += 4) {
    glow.box(x, 57, 2, x + 2, 63, 2, C.paperWarm);
    glow.box(x, 57, -22, x + 2, 63, -22, C.paperWarm);
  }

  // 第四层重檐飞角
  buildRoof(solid, glow, -27, 1, -25, 5, 69, 4, true);

  // ─── 第八层（天阙八角金顶与宝顶金珠，y: 72..96） ───
  solid.box(-18, 72, -15, -8, 81, -5, C.gold);
  glow.box(-17, 74, -4, -9, 78, -4, C.paperWarm);

  // 阶梯金顶
  for (let step = 0; step <= 5; step++) {
    const r = 5 - step;
    solid.box(-13 - r, 82 + step, -10 - r, -13 + r, 82 + step, -10 + r, C.goldBright);
  }
  // 宝顶金刹与顶上神明宝珠
  solid.box(-13, 87, -10, -13, 97, -10, C.goldBright);
  glow.box(-14, 96, -11, -12, 98, -9, C.fireGold);

  // ─── 水车基座支架 ───
  const WW_X = 16, WW_CY = 15, WW_CZ = -4;
  solid.box(WW_X - 3, 5, WW_CZ - 1, WW_X - 1, WW_CY + 1, WW_CZ + 1, C.timberDark);

  // ─── 顶层露天金汤温泉天池 ───
  solid.box(-24, 72, -16, -18, 73, -7, C.rockMid);
  water.box(-23, 73, -15, -19, 74, -8);

  return {};
}

