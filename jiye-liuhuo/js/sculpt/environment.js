// 极夜流火 · 极地峡谷与高空钢桁架特大桥体素环境雕刻 (Environment Sculptor)
// 包含 420 格重型铆接钢桁梁大桥、双线重轨、冰封深峡与雾凇冷杉森林

import { VoxelGrid } from '../voxel/grid.js';
import { VoxelPrimitives as Prim } from '../voxel/primitives.js';
import { SPEC } from '../spec.js';
import { COLOR_ID as C } from '../palette.js';

export class EnvironmentSculptor {
  // 构建高空特大钢桁架铁路桥与铁轨
  static buildViaduct() {
    const grid = new VoxelGrid();

    // 1. 铁道路基轨枕与重型钢轨 (Rail Ties & Tracks)
    // Z: [-220, 220]
    for (let z = -220; z <= 220; z++) {
      // 轨枕 (每隔 3 格铺设一根防腐木枕木，宽 X: [-18, 18], 高 Y: [7, 9])
      if (Math.abs(z) % 3 === 0) {
        Prim.box(grid, -18, 7, z, 18, 9, z + 1, C.rail_ties);
        // 枕木两端积雪
        grid.set(-18, 10, z, C.snow_fresh);
        grid.set(18, 10, z, C.snow_fresh);
      }
      // 左右双线重型钢轨 (Standard Gauge ±14)
      for (const sign of [-1, 1]) {
        const rx = sign * 14;
        // 轨底与轨腰 (Y: [10, 11])
        grid.set(rx, 10, z, C.dark_steel);
        // 轨顶磨耗银亮接触面 (Y: 12)
        grid.set(rx, 11, z, C.rail_crown);
      }
      // 桥面避车木道板 (两旁走道)
      if (Math.abs(z) % 2 === 0) {
        grid.set(-22, 9, z, C.rail_ties);
        grid.set(-21, 9, z, C.rail_ties);
        grid.set(21, 9, z, C.rail_ties);
        grid.set(22, 9, z, C.rail_ties);
      }
    }

    // 2. 桥下纵梁与主桁架 (Viaduct Main Steel Girders & Cross Bracing)
    // 左右主桁架 X: ±24, 高 Y: [-18, 7]
    for (const sign of [-1, 1]) {
      const gx = sign * 24;
      // 上弦杆与下弦杆
      Prim.box(grid, gx - 1, 5, -220, gx + 1, 7, 220, C.viaduct_steel);
      Prim.box(grid, gx - 1, -18, -220, gx + 1, -16, 220, C.viaduct_steel);
      // 上弦杆顶部积雪
      for (let z = -220; z <= 220; z++) {
        if (z % 4 !== 0) {
          grid.set(gx, 8, z, C.snow_fresh);
        }
      }

      // 斜撑与竖杆 (华伦式桁架 Warren Truss with Verticals)
      // 每 15 格为一个桁架节间 (Panel)
      for (let z = -220; z < 210; z += 15) {
        // 竖杆
        Prim.rod3D(grid, gx, -18, z, gx, 6, z, 1.2, C.viaduct_steel);
        // 交叉对角斜撑
        Prim.rod3D(grid, gx, -18, z, gx, 6, z + 15, 1.0, C.viaduct_steel);
        Prim.rod3D(grid, gx, 6, z, gx, -18, z + 15, 1.0, C.viaduct_steel);
      }
    }

    // 底部横向风撑 (Bottom Lateral Sway Bracing)
    for (let z = -220; z <= 220; z += 15) {
      Prim.rod3D(grid, -24, -17, z, 24, -17, z, 1.2, C.viaduct_steel);
      Prim.rod3D(grid, -24, 6, z, 24, 6, z, 1.2, C.viaduct_steel);
    }

    // 3. 巨型玄武岩花岗石桥墩 (Granite Masonry Piers)
    // 分布在 Z = -160, -40, 80, 200 处，立于冰峡底部 (Y: [-60, -18])
    const pierZList = [-150, -30, 90];
    for (const pz of pierZList) {
      // 桥墩自下而上略有收分 (Tapered Pier)
      for (let y = -60; y <= -18; y++) {
        const progress = (y - (-60)) / 42; // 0.0 bottom, 1.0 top
        const halfW = Math.round(28 - progress * 4); // 28 -> 24
        const halfL = Math.round(18 - progress * 3); // 18 -> 15

        for (let x = -halfW; x <= halfW; x++) {
          for (let z = pz - halfL; z <= pz + halfL; z++) {
            const isEdge = (Math.abs(x) === halfW || Math.abs(z - pz) === halfL);
            if (isEdge || y === -18 || y === -60) {
              // 石块砌缝灰白分色
              const isJoint = (y % 4 === 0 || (x + z) % 6 === 0);
              grid.set(x, y, z, isJoint ? C.dark_steel : C.rock_basalt);
            }
          }
        }
      }
      // 桥墩托盘与铸钢支座 (Pier Cap & Steel Bearings)
      Prim.box(grid, -26, -18, pz - 16, 26, -16, pz + 16, C.rock_basalt);
      Prim.box(grid, -24, -16, pz - 4, -22, -15, pz + 4, C.dark_steel);
      Prim.box(grid, 22, -16, pz - 4, 24, -15, pz + 4, C.dark_steel);
    }

    return grid;
  }

  // 构建深冰峡谷、冰裂隙与玄武岩绝壁
  static buildGorgeTerrain() {
    const grid = new VoxelGrid();

    // 峡谷冰封河面 Y: [-64, -60], Z: [-220, 220], X: [-100, 100]
    for (let x = -90; x <= 90; x += 2) {
      for (let z = -220; z <= 220; z += 2) {
        const distFromCenter = Math.abs(x);
        // 河谷中心为清冽青冰 (Glacial Blue Ice)
        if (distFromCenter < 35) {
          const isCrack = (Math.sin(x * 0.15) * Math.cos(z * 0.08) > 0.6);
          const iceCid = isCrack ? C.glacial_ice : C.snow_shadow;
          grid.set(x, -60, z, iceCid);
          grid.set(x + 1, -60, z, iceCid);
          grid.set(x, -60, z + 1, iceCid);
          grid.set(x + 1, -60, z + 1, iceCid);
        }
        // 两侧岸坡逐渐抬升至玄武岩雪坡 (Basalt Snow Slopes)
        else {
          const elev = Math.round(-60 + Math.pow((distFromCenter - 35) / 55, 1.8) * 65);
          for (let y = -60; y <= Math.min(15, elev); y += 3) {
            const isTop = (y >= elev - 3);
            const cid = isTop ? C.snow_fresh : C.rock_basalt;
            grid.set(x, y, z, cid);
            grid.set(x + 1, y, z, cid);
          }
        }
      }
    }

    // 岸坡上的雾凇冷杉森林 (Frosted Taiga Spruce Trees)
    const treeCoords = [
      [-52, -18, -120], [-68, -8, -80], [-58, 2, -40], [-72, 8, 20], [-64, 4, 90], [-55, -12, 140],
      [54, -16, -110], [70, -6, -70], [62, 0, -30], [75, 6, 40], [66, 2, 110], [58, -10, 160],
      [-78, 12, -160], [80, 10, -150], [-82, 14, 180], [84, 12, 170]
    ];

    for (const [tx, ty, tz] of treeCoords) {
      this.plantSpruce(grid, tx, ty, tz, 22);
    }

    return grid;
  }

  // 种植一棵体素雾凇冷杉
  static plantSpruce(grid, cx, baseY, cz, height) {
    // 树干 (Trunk)
    Prim.cylinderY(grid, cx, baseY, baseY + height * 0.4, cz, 1.4, C.pine_trunk);

    // 4 层塔状松枝 (Tiered Conical Foliage)
    const tiers = 4;
    for (let t = 0; t < tiers; t++) {
      const tierBottom = Math.round(baseY + 4 + t * (height / tiers) * 0.9);
      const tierH = Math.round((height / tiers) * 1.1);
      const maxR = Math.round((tiers - t) * 2.8 + 2);

      for (let dy = 0; dy <= tierH; dy++) {
        const r = Math.round(maxR * (1 - dy / tierH));
        const y = tierBottom + dy;
        const isSnowTop = (dy === tierH || dy === tierH - 1);
        const cid = isSnowTop ? C.snow_fresh : C.pine_green;

        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            if (dx * dx + dz * dz <= r * r) {
              grid.set(cx + dx, y, cz + dz, cid);
            }
          }
        }
      }
    }
  }
}
