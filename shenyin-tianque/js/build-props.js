// build-props.js — 朱桥 / 鸟居 / 水上铁道 / 水上复古蒸汽列车 / 白龙 / 神怪生灵

import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry } from './voxel.js';
import { C } from './palette.js';

export function buildProps(solid, glow) {
  // ─── 1. 凌波朱桥（连通彼岸大鸟居与油屋大门） ───
  const BR_X = 10, BR_W = 3;
  const BR_Z0 = 26, BR_Z1 = 92;
  const bridgeDeckY = (z) => {
    const u = (z - BR_Z0) / (BR_Z1 - BR_Z0);
    return 7 + Math.round(7.2 * Math.sin(u * Math.PI));
  };

  for (let z = BR_Z0; z <= BR_Z1; z++) {
    const y = bridgeDeckY(z);
    // 桥面木板铺装
    solid.box(BR_X - BR_W, y, z, BR_X + BR_W, y, z, (z % 2 === 0 ? C.wharfPlank : C.timberDark));
    // 桥腹朱红承重拱圈
    const archThick = (z === BR_Z0 || z === BR_Z1) ? y - 3 : Math.min(3, y - 4);
    solid.box(BR_X - BR_W, y - archThick, z, BR_X + BR_W, y - 1, z, C.bridgeRed);

    // 两侧朱红望柱与鎏金扶手
    for (const sx of [BR_X - BR_W, BR_X + BR_W]) {
      solid.set(sx, y + 1, z, C.vermilionLight);
      solid.set(sx, y + 2, z, C.gold);
      // 间隔立望柱与悬挂红灯笼
      if ((z - BR_Z0) % 4 === 0) {
        solid.box(sx, y + 1, z, sx, y + 3, z, C.vermilionDark);
        solid.set(sx, y + 4, z, C.goldBright);
        glow.set(sx, y + 3, (sx < BR_X ? z - 1 : z + 1), C.lanternOrange);
      }
    }
  }

  // 桥头彼岸大鸟居（Torii）
  const T_X = 10, T_Z = 92;
  solid.box(T_X - 6, 4, T_Z, T_X - 5, 21, T_Z + 1, C.bridgeRed);
  solid.box(T_X + 5, 4, T_Z, T_X + 6, 21, T_Z + 1, C.bridgeRed);
  solid.box(T_X - 8, 19, T_Z, T_X + 8, 20, T_Z + 1, C.bridgeRed);
  solid.box(T_X - 9, 22, T_Z - 1, T_X + 9, 23, T_Z + 2, C.gold);

  // ─── 2. 水上铁轨（横贯水面，穿桥而过） ───
  const RAIL_Z = 8, RAIL_Y = 4;
  for (let x = -115; x <= 115; x++) {
    if (x % 3 === 0) {
      solid.box(x, RAIL_Y, RAIL_Z - 3, x, RAIL_Y, RAIL_Z + 3, C.sleeperWood);
    }
    solid.set(x, RAIL_Y + 1, RAIL_Z - 2, C.railIron);
    solid.set(x, RAIL_Y + 1, RAIL_Z + 2, C.railIron);
  }

  // ─── 3. 独立可移动组件：水上复古蒸汽列车 ───
  const trainGroup = new THREE.Group();
  const trainWorld = new VoxelWorld();
  const trainGlow = new VoxelWorld();

  // 车体与底盘
  trainWorld.box(-14, 1, -3, 14, 5, 3, C.trainRed);
  trainWorld.box(-14, 0, -3, 14, 0, 3, C.timberDark);
  // 透光车窗
  for (let tx = -11; tx <= 11; tx += 3) {
    trainGlow.box(tx, 3, -3, tx + 1, 4, -3, C.trainWindow);
    trainGlow.box(tx, 3, 3, tx + 1, 4, 3, C.trainWindow);
  }
  // 车头驾驶舱与大暖灯
  trainWorld.box(13, 2, -2, 14, 5, 2, C.trainRed);
  trainGlow.box(14, 3, -1, 14, 4, 1, C.goldBright);
  // 车顶弧面与烟囱
  trainWorld.box(-15, 6, -3, 15, 6, 3, C.trainRoof);
  trainWorld.box(7, 7, -1, 9, 10, 1, C.railIron);

  const trainGeo = buildGeometry(trainWorld, { jitter: 0.02 });
  const trainGlowGeo = buildGeometry(trainGlow, { jitter: 0.0 });
  const trainMesh = new THREE.Mesh(trainGeo.geometry, new THREE.MeshLambertMaterial({ vertexColors: true }));
  trainMesh.castShadow = true;
  const trainGlowMesh = new THREE.Mesh(trainGlowGeo.geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  trainGroup.add(trainMesh, trainGlowMesh);

  // ─── 4. 独立神明生物：盘旋银鳞白龙（赈早见琥珀主） ───
  const dragonGroup = new THREE.Group();
  const dragonWorld = new VoxelWorld();
  const dragonPoints = [
    { x: -10, y: 76, z: -8 },
    { x: -6,  y: 74, z: -16 },
    { x: -14, y: 68, z: -24 },
    { x: -26, y: 62, z: -22 },
    { x: -34, y: 56, z: -14 },
    { x: -40, y: 50, z: -4 },
  ];
  for (let i = 0; i < dragonPoints.length - 1; i++) {
    const p0 = dragonPoints[i], p1 = dragonPoints[i + 1];
    const segs = 7;
    for (let s = 0; s <= segs; s++) {
      const u = s / segs;
      const x = Math.round(p0.x + (p1.x - p0.x) * u);
      const y = Math.round(p0.y + (p1.y - p0.y) * u);
      const z = Math.round(p0.z + (p1.z - p0.z) * u);
      const r = (i === 0) ? 2 : 1;
      dragonWorld.box(x - r, y - r, z - r, x + r, y + r, z + r, C.dragonWhite);
      dragonWorld.box(x, y + r + 1, z, x, y + r + 2, z, C.dragonCyan);
    }
  }
  // 威严龙首与金色龙角
  const DH = dragonPoints[0];
  dragonWorld.box(DH.x - 2, DH.y - 1, DH.z - 2, DH.x + 3, DH.y + 2, DH.z + 2, C.dragonWhite);
  dragonWorld.box(DH.x + 2, DH.y + 1, DH.z - 1, DH.x + 4, DH.y + 2, DH.z + 1, C.dragonCyan);
  dragonWorld.set(DH.x + 1, DH.y + 1, DH.z - 2, C.dragonGold);
  dragonWorld.set(DH.x + 1, DH.y + 1, DH.z + 2, C.dragonGold);

  const dragonGeo = buildGeometry(dragonWorld, { jitter: 0.02 });
  const dragonMesh = new THREE.Mesh(dragonGeo.geometry, new THREE.MeshLambertMaterial({ vertexColors: true }));
  dragonMesh.castShadow = true;
  dragonGroup.add(dragonMesh);

  // ─── 5. 异界生灵驻场 ───
  // 朱桥桥头：无脸男（高约 7 格，黑袍 + 白色面具 + 紫色面纹）
  solid.box(8, 13, 34, 10, 19, 36, C.nofaceBlack);
  solid.box(9, 17, 33, 9, 19, 33, C.nofaceMask);
  solid.set(9, 19, 33, C.nofacePurple);
  solid.set(9, 17, 33, C.nofacePurple);

  // 顶层天池：白萝卜神（惬意泡澡，白胖身躯 + 头顶青翠菜叶）
  solid.box(-22, 74, -13, -18, 78, -9, C.radishWhite);
  solid.set(-20, 77, -13, 0x222222);
  solid.box(-21, 79, -12, -19, 80, -10, C.radishGreen);

  // 露台赏景仙客：侍客提灯仙童与鸟首仙客
  solid.box(-10, 24, 15, -9, 27, 16, C.vermilionBright); // 仙童
  glow.set(-9, 26, 17, C.lanternOrange); // 提灯
  solid.box(0, 24, 15, 1, 28, 16, C.birdFeather); // 鸟首仙客
  solid.set(1, 28, 17, C.birdBeak);

  return {
    train: {
      group: trainGroup,
      x: -60,
      speed: 15.0,
      railZ: RAIL_Z,
      railY: RAIL_Y,
      chimney: new THREE.Vector3(8, 10, 0),
    },
    dragon: { group: dragonGroup },
  };
}
