// build.js — 上河虹桥 场景生成：汴河 / 虹桥 / 漕船 / 街市 / 城楼 / 垂柳 / 远山
// 坐标约定：河沿 X 流向（+x 为下游），桥在 x=0 横跨 Z；水面 y=5，岸顶 y=7。

import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry, shade, mulberry32 } from './voxel.js';

// —— 调色板 ——
const C = {
  woodDark: 0x4e3c2d, wood: 0x7d6244, woodWarm: 0x8f7048, timber: 0x63503a,
  wallCream: 0xe8e2d4, wallWhite: 0xe0dacb, wallTan: 0xd6cfbe, wallGrey: 0xcbc5b6,
  roof: 0x45413a, roofDark: 0x37342e, ridge: 0x2b2924, eave: 0x6e523c,
  red: 0x8f3a2a, redDark: 0x6f2d20,
  street: 0xb3a081, dirt: 0xa8906a, grass: 0x7d9a5e, grassD: 0x6d8a52, mud: 0x98866a,
  stone: 0x8f8a80, stoneD: 0x736f66, stoneL: 0xa39d90,
  bed: 0x7d7060,
  hull: 0x3a2c20, hullDark: 0x2e231a, mat: 0xbdA878, sail: 0xd5cab2,
  bannerW: 0xe5dfd1, bannerI: 0x42546f,
  willow: 0x6f9350, willowD: 0x5a7a42, trunk: 0x52422f,
  glowWarm: 0xffc27a, lantern: 0xb53a28, gold: 0xcf9a3e,
  hill: 0x8fa892, hillD: 0x7d968a, farPag: 0xa8b4a8,
  crane: 0xf0ede2,
};

const R = mulberry32(20260924);

export function buildScene() {
  const solid = new VoxelWorld();   // 受光实体
  const glow = new VoxelWorld();    // 自发光（窗火/灯笼）
  const water = new VoxelWorld();   // 水体

  const solidMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const willowMat = new THREE.MeshLambertMaterial({ vertexColors: true });

  // ============ 大地与汴河 ============
  const X0 = -115, X1 = 115, ZW = 13;      // 水域半宽
  const BANK = 15, EDGE = 62;              // 岸从 z=±14 到 ±62
  // 河床
  solid.box(X0, 1, -ZW - 1, X1, 2, ZW + 1, C.bed);
  // 岸体（两排厚，顶面 y=7）
  for (const s of [-1, 1]) {
    solid.box(X0, 6, s * (ZW + 1), X1, 7, s * EDGE, C.dirt);
  }
  // 石驳岸（水面以上可见的墙）
  for (const s of [-1, 1]) {
    solid.box(X0, 2, s * (ZW + 1), X1, 7, s * (ZW + 2), C.stone);
    solid.box(X0, 7, s * (ZW + 1), X1, 7, s * (ZW + 2), C.stoneL); // 压顶石
  }
  // 水体
  water.box(X0 + 4, 3, -ZW, X1 - 4, 5, ZW);
  // 岸顶铺装：步道条石(z 15..17) / 主街土路(z 19..22)
  for (const s of [-1, 1]) {
    solid.box(X0, 7, s * (ZW + 3), X1, 7, s * (ZW + 4), C.stoneL);
    solid.box(X0, 7, s * (ZW + 6), X1, 7, s * (ZW + 9), C.street);
    solid.box(X0, 7, s * (ZW + 5), X1, 7, s * (ZW + 5), C.stoneD); // 路缘
  }
  // 草地与点缀（street 之外）
  for (let x = X0; x <= X1; x++) {
    for (const s of [-1, 1]) {
      for (let z = ZW + 10; z <= EDGE; z++) {
        const n = R();
        if (n < 0.05) solid.set(x, 7, s * z, C.grassD);
        else if (n < 0.35) solid.set(x, 7, s * z, C.grass);
        else if (n < 0.40) solid.set(x, 7, s * z, C.mud);
        else solid.set(x, 7, s * z, shade(C.grass, (R() - 0.5) * 0.06));
      }
    }
  }
  // 疏树与顽石（填充空岸）
  for (let i = 0; i < 14; i++) {
    const tx = Math.floor(-70 + R() * 150);
    const tz = (R() < 0.5 ? -1 : 1) * Math.floor(28 + R() * 26);
    if (Math.abs(tx) < 14 && Math.abs(tz) < 40) continue;
    roundTree(tx, tz, 0.8 + R() * 0.7);
  }
  for (let i = 0; i < 10; i++) {
    const bx = Math.floor(-80 + R() * 170);
    const bz = (R() < 0.5 ? -1 : 1) * Math.floor(18 + R() * 30);
    solid.box(bx, 8, bz, bx + 1 + Math.floor(R() * 2), 8 + Math.floor(R() * 2), bz + 1, R() < 0.5 ? C.stone : C.stoneD);
  }

  // ============ 虹桥 ============
  const stalls = []; // 摊位锚点（桥面 + 两岸伞棚共用）
  const deckY = (z) => 8 + Math.round(9.5 * (1 - (z / 15.2) ** 2));
  const archLow = (z) => 6 + Math.round(7 * (1 - (z / 15) ** 2));
  for (let z = -15; z <= 15; z++) {
    const yt = deckY(z), lo = Math.min(archLow(z), yt - 2);
    // 桥面（木板，中缝走线）
    for (let x = -4; x <= 4; x++) {
      solid.set(x, yt, z, (x === 0) ? shade(C.woodWarm, -0.12) : C.woodWarm);
      // 桥体拱架
      const rim = Math.abs(x) === 4;
      for (let y = lo; y <= yt - 1; y++) {
        solid.set(x, y, z, rim ? 0x6e5a42 : ((z % 3 === 0) ? shade(C.timber, -0.1) : C.timber));
      }
    }
    // 栏杆：望柱 + 单道扶手（朱漆）
    for (const sx of [-4, 4]) {
      if (((z + 15) % 3) === 0) solid.set(sx, yt + 1, z, C.redDark);
      solid.set(sx, yt + 2, z, C.redDark);
    }
  }
  // 桥两端踏步 + 鞍部
  for (const s of [-1, 1]) {
    solid.box(-5, 7, s === -1 ? -19 : 18, 5, 8, s === -1 ? -18 : 19, C.stoneL);
    solid.box(-5, 2, s * 16, 5, 8, s * 17, C.stone);       // 桥台
    solid.box(-5, 8, s === -1 ? -19 : 18, 5, 8, s === -1 ? -18 : 19, C.stoneL);
  }
  // 桥头广场
  solid.box(-9, 7, -19, 9, 7, -18, C.stone);
  solid.box(-9, 7, 18, 9, 7, 19, C.stone);
  // 表木（桥头立柱 + 白鹤）
  for (const sx of [-5, 5]) for (const sz of [-19, 19]) {
    solid.box(sx, 8, sz, sx, 16, sz, C.wood);
    solid.box(sx - 1, 13, sz, sx + 1, 13, sz, C.wood);
    // 白鹤
    solid.box(sx - 1, 17, sz, sx, 17, sz, C.crane);
    solid.set(sx + 1, 18, sz, C.crane);          // 颈
    solid.set(sx + 2, 19, sz, C.crane);          // 头
    solid.set(sx + 3, 19, sz, 0xd98a3a);         // 喙
    solid.set(sx, 18, sz, C.crane);
    solid.set(sx, 16, sz + 1, 0x2c2c28);         // 尾
  }

  // ============ 街市建筑 ============
  const facadeZ = { '-1': -24, '1': 24 }; // 临河立面 z

  function gableRoof(x0, x1, zFront, s, depth, yTop, over = 1) {
    // 悬山屋顶：屋脊沿 X，向 ±z 双坡下落；每层铺 2 格厚，只露顶面（防侧脸条纹）
    const half = Math.ceil(depth / 2) + 1;
    const zc = zFront + s * Math.floor(depth / 2);
    for (let dz = 0; dz <= half; dz++) {
      const y = yTop + (half - dz);
      for (let x = x0 - over; x <= x1 + over; x++) {
        const c = dz === 0 ? C.ridge : (dz >= half - 1 ? C.roofDark : C.roof);
        for (const yy of [y, y - 1]) {
          solid.set(x, yy, zc - s * dz, c);
          if (dz > 0) solid.set(x, yy, zc + s * dz, c);
        }
      }
    }
    return half;
  }

  function shophouse(x0, w, s, seedIdx) {
    // s=岸侧(-1 近岸 / 1 远岸)；立面朝河，屋身向岸后延伸
    const d = 7, x1 = x0 + w - 1;
    const zf = facadeZ[s];
    const zBack = zf + s * (d - 1);
    const floors = R() < 0.32 ? 2 : 1;
    const h = floors === 2 ? 11 : 7;
    const wallC = [C.wallCream, C.wallWhite, C.wallTan, C.wallGrey][Math.floor(R() * 4)];
    // 墙体
    solid.box(x0, 8, Math.min(zf, zBack), x1, 7 + h, Math.max(zf, zBack), wallC);
    // 木柱与梁（立面角柱 + 中柱）
    for (const cx of [x0, Math.floor((x0 + x1) / 2), x1]) {
      solid.box(cx, 8, zf, cx, 7 + h, zf, C.woodDark);
    }
    solid.box(x0, 7 + h, zf, x1, 7 + h, zf, C.woodDark); // 檐梁
    // 门（朝河，向内凹）
    const dx = Math.floor((x0 + x1) / 2) - 1;
    solid.box(dx, 8, zf, dx + 1, 11, zf + s, C.woodDark);
    // 窗（glow 窗洞 + 木格，先挖洞再嵌光）
    for (let i = 0; i < Math.floor(w / 4); i++) {
      const wx = x0 + 2 + i * 4;
      if (wx + 1 >= x1) break;
      const wy = floors === 2 ? 14 : 10;
      solid.carve(wx, wy, zf, wx + 1, wy + 1, zf);
      glow.box(wx, wy, zf, wx + 1, wy + 1, zf, C.glowWarm);
      solid.set(wx, wy + 2, zf, C.woodDark);
      solid.set(wx + 1, wy + 2, zf, C.woodDark);
    }
    // 二层栏杆腰线
    if (floors === 2) solid.box(x0, 13, zf, x1, 13, zf, C.wood);
    // 屋顶
    gableRoof(x0, x1, zf, s, d, 7 + h + 1);
    // 屋脊两端鸱吻
    const zc = zf + s * Math.floor(d / 2);
    solid.set(x0 - 1, 7 + h + 2 + Math.ceil(d / 2), zc, C.ridge);
    solid.set(x1 + 1, 7 + h + 2 + Math.ceil(d / 2), zc, C.ridge);

    // 店铺道具
    if (R() < 0.75) {
      // 酒旗
      const bx = x0 + 1;
      solid.box(bx, 7 + h, zf - s, bx, 7 + h, zf - s * 2, C.woodDark);
      for (let i = 0; i < 5; i++) {
        solid.set(bx, 7 + h - 1 - i, zf - s * 2, i === 4 ? shade(0xece6d8, -0.3) : 0xece6d8);
      }
    }
    if (R() < 0.6) {
      // 门口灯笼
      glow.set(dx, 11, zf - s * 1, C.lantern);
      solid.set(dx, 12, zf - s, C.gold);
    }
    // 门前货摊杂物
    if (R() < 0.5) {
      const gx = x1 + 1 < x0 + w + 2 ? x1 + 1 : x0 - 1;
      solid.box(gx, 8, zf - s, gx, 9, zf - s * 2, 0xb98d4f); // 箩筐
      if (R() < 0.5) solid.set(gx, 10, zf - s, 0xc46a3a);   // 货物
    }
  }

  // 两排街市（近岸 / 远岸），桥头留出广场，向西延伸镇尾
  const rows = [
    { s: -1, fronts: [-24, -35] },
    { s: 1, fronts: [24, 35] },
  ];
  for (const row of rows) {
    for (let ri = 0; ri < row.fronts.length; ri++) {
      const zf = row.fronts[ri] + (ri === 0 ? 0 : R() < 0.5 ? -1 : 1);
      let x = -70;
      while (x < 46) {
        const nearBridge = Math.abs(x - 0) < 12 && ri === 0;
        if (nearBridge) { x += 4; continue; }
        const w = 8 + Math.floor(R() * 6);
        shophouse(x, w, row.s, ri);
        x += w + (R() < 0.3 ? 2 : 1);
      }
    }
  }

  // ============ 城楼（远岸 x=+18 的十字街尽头）============
  function gateTower(gx, gz) {
    // 石城基（门洞沿 z 方向穿通）
    solid.box(gx - 8, 8, gz - 7, gx + 8, 16, gz + 7, C.stoneD);
    solid.box(gx - 3, 8, gz - 7, gx + 3, 16, gz + 7, C.stoneD);
    solid.carve(gx - 3, 8, gz - 8, gx + 3, 14, gz + 8);       // 门洞
    solid.box(gx - 4, 8, gz - 8, gx + 4, 16, gz - 7, C.stoneD);
    solid.box(gx - 4, 8, gz + 7, gx + 4, 16, gz + 7, C.stoneD);
    // 城门钉排 + 门簪
    for (let y = 9; y <= 13; y += 2) for (const dx of [-2, 0, 2]) solid.set(gx + dx, y, gz - 7, 0x4a4038);
    // 城台顶口沿
    solid.box(gx - 9, 17, gz - 8, gx + 9, 17, gz + 8, C.stoneL);
    // 城楼一层（乳白墙 + 木柱，檐下横梁一道）
    solid.box(gx - 6, 18, gz - 5, gx + 6, 24, gz + 5, C.wallCream);
    for (const cx of [gx - 6, gx, gx + 6]) solid.box(cx, 18, gz - 5, cx, 24, gz + 5, C.woodDark);
    for (const cz of [gz - 5, gz + 5]) solid.box(gx - 6, 24, cz, gx + 6, 24, cz, C.woodDark);
    // 一层窗
    for (const wx of [gx - 4, gx, gx + 4]) {
      solid.carve(wx, 20, gz - 5, wx + 1, 21, gz + 5);
      glow.box(wx, 20, gz - 5, wx + 1, 21, gz - 5, C.glowWarm);
      glow.box(wx, 20, gz + 5, wx + 1, 21, gz + 5, C.glowWarm);
    }
    // 一层腰檐（庑殿式一圈收分，每级 2 格厚）
    for (let i = 0; i <= 3; i++) {
      const y = 25 + i, hx = 8 - i, hz = 7 - i;
      for (let x = gx - hx; x <= gx + hx; x++) { solid.set(x, y, gz - hz, C.roof); solid.set(x, y, gz + hz, C.roof); solid.set(x, y - 1, gz - hz, C.roofDark); solid.set(x, y - 1, gz + hz, C.roofDark); }
      for (let z = gz - hz + 1; z <= gz + hz - 1; z++) { solid.set(gx - hx, y, z, C.roof); solid.set(gx + hx, y, z, C.roof); solid.set(gx - hx, y - 1, z, C.roofDark); solid.set(gx + hx, y - 1, z, C.roofDark); }
    }
    // 二层
    solid.box(gx - 5, 29, gz - 4, gx + 5, 34, gz + 4, C.wallCream);
    for (const cx of [gx - 5, gx, gx + 5]) solid.box(cx, 29, gz - 4, cx, 34, gz + 4, C.woodDark);
    for (const cz of [gz - 4, gz + 4]) solid.box(gx - 5, 34, cz, gx + 5, 34, cz, C.woodDark);
    glow.box(gx - 3, 31, gz - 4, gx - 2, 32, gz - 4, C.glowWarm);
    glow.box(gx + 2, 31, gz + 4, gx + 3, 32, gz + 4, C.glowWarm);
    // 二层顶
    for (let i = 0; i <= 3; i++) {
      const y = 35 + i, hx = 7 - i, hz = 6 - i;
      const cc = i === 3 ? C.ridge : C.roof;
      for (let x = gx - hx; x <= gx + hx; x++) { solid.set(x, y, gz - hz, cc); solid.set(x, y, gz + hz, cc); solid.set(x, y - 1, gz - hz, C.roofDark); solid.set(x, y - 1, gz + hz, C.roofDark); }
      for (let z = gz - hz + 1; z <= gz + hz - 1; z++) { solid.set(gx - hx, y, z, cc); solid.set(gx + hx, y, z, cc); solid.set(gx - hx, y - 1, z, C.roofDark); solid.set(gx + hx, y - 1, z, C.roofDark); }
    }
    // 鸱吻与旗
    solid.box(gx - 8, 26, gz - 8, gx - 8, 27, gz - 8, C.ridge);
    solid.box(gx + 8, 26, gz + 8, gx + 8, 27, gz + 8, C.ridge);
    glow.set(gx - 6, 20, gz + 5, C.lantern);
    glow.set(gx + 6, 20, gz + 5, C.lantern);
  }
  gateTower(18, 44);
  // 通城楼十字街
  solid.box(16, 7, 24, 20, 7, 46, C.street);

  // ============ 河亭（西端近岸点景）============
  (function pavilion() {
    const px = -52, pz = -16;
    solid.box(px - 3, 7, pz - 3, px + 3, 7, pz + 3, C.stoneL);       // 台基
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
      solid.box(px + dx, 8, pz + dz, px + dx, 13, pz + dz, C.red);   // 朱柱
    }
    solid.box(px - 3, 13, pz - 3, px + 3, 13, pz + 3, C.woodDark);   // 枋
    for (let i = 0; i <= 3; i++) {                                    // 攒尖顶
      const y = 14 + i, h = 3 - i;
      for (let x = px - h; x <= px + h; x++) for (let z = pz - h; z <= pz + h; z++) {
        if (Math.abs(x - px) === h || Math.abs(z - pz) === h || (i === 3)) solid.set(x, y, z, i === 3 ? C.ridge : C.roof);
      }
    }
    solid.set(px, 18, pz, C.gold);                                    // 宝顶
  })();

  // ============ 远山与孤塔（雾中背景）============
  const hillNoise = mulberry32(77);
  for (let i = 0; i < 26; i++) {
    const hx = -100 + i * 8 + hillNoise() * 6;
    const hz = 80 + hillNoise() * 26;
    const hh = 5 + Math.floor(hillNoise() * 10);
    const cc = hillNoise() < 0.5 ? 0x7f987f : 0x6f8878;
    solid.box(Math.floor(hx) - 4, 8, Math.floor(hz) - 3, Math.floor(hx) + 4, 8 + hh, Math.floor(hz) + 3, cc);
  }
  // 孤塔剪影
  (function pagoda() {
    const px = -46, pz = 84; let y = 9;
    for (let tier = 0; tier < 6; tier++) {
      const hw = 4 - Math.floor(tier / 2);
      solid.box(px - hw, y, pz - hw, px + hw, y + 2, pz + hw, C.farPag);
      solid.box(px - hw - 1, y + 3, pz - hw - 1, px + hw + 1, y + 3, pz + hw + 1, shade(C.farPag, -0.15));
      y += 4;
    }
    solid.set(px, y, pz, C.farPag);
  })();

  // ============ 垂柳 ============
  function roundTree(bx, bz, scale = 1) {
    const h = Math.round(5 * scale);
    solid.box(bx, 8, bz, bx, 8 + h, bz, C.trunk);
    const r = Math.round(2.6 * scale);
    const cy = 8 + h + 1;
    for (let dx = -r; dx <= r; dx++) for (let dy = -1; dy <= 2; dy++) for (let dz = -r; dz <= r; dz++) {
      const d2 = (dx / (r + 0.5)) ** 2 + (dy / 2.2) ** 2 + (dz / (r + 0.5)) ** 2;
      if (d2 < 1 - R() * 0.18) solid.set(bx + dx, cy + dy, bz + dz, R() < 0.45 ? 0x4f6e3e : 0x5d7f49);
    }
  }

  const willows = [];
  function willow(bx, bz, leanX, leanZ, scale = 1) {
    const world = new VoxelWorld();
    let tx = 0, ty = 0, tz = 0;
    const h = Math.round(8 * scale);
    for (let i = 0; i < h; i++) {
      tx = Math.round(leanX * (i / h) * 4);
      tz = Math.round(leanZ * (i / h) * 4);
      world.box(tx, i, tz, tx + 1, i, tz + 1, (i % 3 === 2) ? shade(C.trunk, -0.1) : C.trunk);
    }
    // 树冠（扁平椭圆）
    const blobs = [[0, 0], [3, 1], [-2, 2], [1, -2], [-3, -1]];
    for (const [ox, oz] of blobs) {
      const cx = tx + ox * 2, cz = tz + oz, cy = h + (R() < 0.5 ? 0 : 1);
      for (let dx = -3; dx <= 3; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -2; dz <= 2; dz++) {
        const d2 = (dx / 3.4) ** 2 + (dy / 1.6) ** 2 + (dz / 2.4) ** 2;
        if (d2 < 1 - R() * 0.25) world.set(cx + dx, cy + dy, cz + dz, R() < 0.35 ? C.willowD : C.willow);
      }
    }
    // 垂丝
    for (let i = 0; i < 14; i++) {
      const sx = tx + Math.round((R() - 0.5) * 10);
      const sz = tz + Math.round((R() - 0.5) * 7);
      const len = 3 + Math.floor(R() * 5);
      const top = h + 1;
      for (let k = 0; k < len; k++) {
        if (!world.has(sx, top - k, sz)) world.set(sx, top - k, sz, k > len - 3 ? C.willowD : C.willow);
      }
    }
    const { geometry } = buildGeometry(world, { jitter: 0.06 });
    const mesh = new THREE.Mesh(geometry, willowMat);
    mesh.castShadow = true;
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(bx, 7, bz);
    willows.push({ group: g, phase: R() * Math.PI * 2 });
    return g;
  }
  const willowRoot = new THREE.Group();
  willowRoot.add(
    willow(-58, -13, 0.2, 0.9, 0.9), willow(-26, -13, 0.3, 0.9), willow(30, -12, -0.2, 0.6, 0.85), willow(56, -13, 0, 0.8, 0.9),
    willow(-40, 12, 0.2, -1), willow(6, 13, -0.3, -0.9), willow(44, 12, 0, -0.8, 1.1),
  );

  // ============ 漕船（戏眼）============
  const boat = { group: new THREE.Group(), x: -24, speed: 0.55 };
  {
    const w = new VoxelWorld();
    // 船体：长24 宽5，底 y1 舷 y3
    for (let x = -12; x <= 12; x++) {
      const t = Math.abs(x) / 12;
      const half = Math.round(2.5 - t * 0.8);       // 两端收窄
      const rise = x < -9 || x > 9 ? 1 : 0;          // 首尾起翘
      for (let z = -half; z <= half; z++) {
        w.set(x, 1, z, C.hullDark);
        w.set(x, 2, z, C.hull);
        w.set(x, 3, z, Math.abs(z) === half ? C.hullDark : C.hull);
        if (Math.abs(z) === half) w.set(x, 3 + rise, z, C.woodWarm); // 舷缘
      }
    }
    // 舱与货
    w.box(-8, 4, -1, -4, 5, 1, C.wood);
    w.box(-8, 6, -1, -4, 6, 1, C.mat);              // 席篷
    for (let x = -2; x <= 3; x++) for (let z = -1; z <= 1; z++) {
      if (R() < 0.5) w.set(x, 4, z, R() < 0.5 ? 0xb98d4f : 0xc9b291);
    }
    w.set(4, 4, 0, 0x7a6a52); w.set(4, 5, 0, 0x7a6a52); // 坛
    // 舵
    w.box(-13, 4, 0, -13, 6, 0, C.woodDark);
    // 船头旗
    w.box(12, 4, 0, 12, 7, 0, C.woodDark);
    w.box(11, 6, 0, 12, 7, 0, 0xc8402e);
    const hullGeo = buildGeometry(w, { jitter: 0.05 });
    const hullMesh = new THREE.Mesh(hullGeo.geometry, solidMat);
    hullMesh.castShadow = true;
    boat.group.add(hullMesh);

    // 桅杆组（可倾倒）：放桅过桥的瞬间感
    const mast = new VoxelWorld();
    mast.box(0, 0, 0, 0, 10, 0, C.woodDark);        // 桅
    mast.box(-4, 9, 0, 4, 9, 0, C.wood);            // 帆桁
    for (let x = -4; x <= 4; x++) mast.set(x, 8, 0, C.sail); // 卷帆
    mast.set(0, 11, 0, C.gold);
    // 缆绳
    for (let i = 0; i < 4; i++) mast.set(-4 + i, 5 - Math.floor(i / 2), 0, 0x3c342c);
    const mastGeo = buildGeometry(mast, { jitter: 0.03 });
    boat.mast = new THREE.Mesh(mastGeo.geometry, solidMat);
    boat.mast.castShadow = true;
    boat.mast.position.set(3, 4, 0);
    boat.mast.rotation.z = THREE.MathUtils.degToRad(62);
    boat.group.add(boat.mast);

    boat.group.position.set(boat.x, 3, 3);
  }

  // ============ 舢板（上行 + 泊岸）============
  function sampan(px, pz, dir) {
    const g = new THREE.Group();
    const w = new VoxelWorld();
    for (let x = -6; x <= 6; x++) {
      const half = Math.abs(x) > 4 ? 1 : 1;
      for (let z = -half; z <= half; z++) {
        w.set(x, 1, z, C.hullDark);
        w.set(x, 2, z, Math.abs(z) === half ? C.hull : C.woodWarm);
      }
    }
    w.box(-2, 2, -1, 2, 3, 1, C.mat);  // 竹篷
    const geo = buildGeometry(w, { jitter: 0.05 });
    const m = new THREE.Mesh(geo.geometry, solidMat);
    m.castShadow = true;
    g.add(m);
    g.position.set(px, 3, pz);
    g.rotation.y = dir > 0 ? 0 : Math.PI;
    return g;
  }
  const sampanMove = { group: sampan(-40, -7, -1), x: -40, speed: -0.4 };
  const sampanMoored = sampan(-34, -10.5, 1);
  sampanMoored.rotation.y = Math.PI / 2 + 0.2;

  // 桥面摊贩（原画名场面：桥上列摊）
  for (const [dz, goods] of [[-4, [0xb98d4f, 0xa3824f]], [5, [0xc9b291, 0xb98d4f]]]) {
    const yt = deckY(dz);
    solid.set(3, yt + 1, dz, goods[0]);
    solid.set(3, yt + 1, dz + 1, goods[1]);
    solid.set(3, yt + 2, dz, 0xc46a3a);
    solid.set(-3, yt + 1, dz, goods[1]);
    stalls.push({ x: 2.0, z: dz, y: yt + 1, face: -1 });
    stalls.push({ x: -2.0, z: dz, y: yt + 1, face: 1 });
  }

  // ============ 街具：摊贩伞棚 ============
  function stall(px, pz, facing) {
    const uc = [0xe6d9b8, 0xb3593c, 0x4e7d76, 0xc98a4a][Math.floor(R() * 4)];
    solid.box(px, 8, pz, px + 3, 9, pz + 2, C.wood);         // 摊案
    // 伞
    const ux = px + 1, uz = pz + 1;
    solid.box(ux, 10, uz, ux, 13, uz, C.woodDark);
    for (let dx = -1; dx <= 2; dx++) for (let dz = -1; dz <= 1; dz++) {
      solid.set(ux + dx, 14, uz + dz, shade(uc, (dx + dz) * 0.03));
    }
    for (let dx = -1; dx <= 2; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (dx === -1 || dx === 2 || dz === -1 || dz === 1) solid.set(ux + dx, 13, uz + dz, shade(uc, -0.15));
    }
    // 货品
    const goods = [0xc46a3a, 0xd9a441, 0x9a4a3c, 0x6a8a5a];
    for (let i = 0; i < 4; i++) solid.set(px + Math.floor(R() * 4), 10, pz + Math.floor(R() * 3), goods[Math.floor(R() * 4)]);
    stalls.push({ x: px + 1.5, z: pz + facing, y: 10 });
    return { steam: R() < 0.5, x: px + 1.5, y: 10.5, z: pz + 1 };
  }
  const steamSources = [];
  for (const [x, s] of [[-38, -1], [-30, -1], [-22, -1], [12, -1], [22, -1], [32, -1]]) {
    const st = stall(x, s === -1 ? -17 : 16, s);
    if (st.steam && s === 1) steamSources.push(new THREE.Vector3(st.x, st.y, st.z));
  }
  for (const [x, s] of [[-34, 1], [-16, 1], [8, 1], [26, 1], [40, 1]]) {
    const st = stall(x, s === -1 ? -17 : 16, s);
    if (st.steam && s === 1) steamSources.push(new THREE.Vector3(st.x, st.y, st.z));
  }
  // 炊烟（屋后烟囱）
  const chimneys = [new THREE.Vector3(38, 26, 36), new THREE.Vector3(-20, 26, 38), new THREE.Vector3(-52, 26, 40)];

  // ============ 网格组装 ============
  const solidGeo = buildGeometry(solid, { jitter: 0.028 });
  const solidMesh = new THREE.Mesh(solidGeo.geometry, solidMat);
  solidMesh.castShadow = true; solidMesh.receiveShadow = true;

  const glowGeo = buildGeometry(glow, { jitter: 0.02, ao: false });
  const glowMesh = new THREE.Mesh(glowGeo.geometry, glowMat);

  const waterGeo = buildGeometry(water, { jitter: 0.0, ao: false });

  const root = new THREE.Group();
  root.add(solidMesh, glowMesh, willowRoot, boat.group, sampanMove.group, sampanMoored);

  return {
    root, solidMesh, waterGeo, glowMat, glowMesh, solidMat,
    boat, sampanMove, sampanMoored, stalls, steamSources, chimneys,
    willows, deckY,
    stats: { voxels: solid.size + glow.size + water.size, quads: solidGeo.quads + glowGeo.quads + waterGeo.quads },
  };
}
