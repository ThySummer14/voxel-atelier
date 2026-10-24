// 极夜流火 · 1928 太平洋型 4-6-2 蒸汽机车体素雕刻工厂 (Locomotive Voxel Sculptor)
// 包含外壳机体、煤水车、动轮组、驾驶室精密内饰与纵向工程剖切内构

import { VoxelGrid } from '../voxel/grid.js';
import { VoxelPrimitives as Prim } from '../voxel/primitives.js';
import { SPEC } from '../spec.js';
import { COLOR_ID as C } from '../palette.js';

export class LocomotiveSculptor {
  // 构建主车体静态部分 (底盘、主框架、烟箱、锅炉外壳、驾驶室、汽缸座)
  static buildBody(isCutaway = false) {
    const grid = new VoxelGrid();

    // 1. 重型钢质主底盘大梁 (Main Chassis Beams)
    // 贯通 Z: [-134, 126], 高 Y: [22, 31], 宽 X: [-13, 13]
    Prim.box(grid, -13, 22, -134, 13, 27, 126, C.dark_steel);
    Prim.box(grid, -11, 28, -134, 11, 31, 126, C.iron_black);

    // 2. 前导缓冲梁与撞击器 (Front Buffer Beam & Buffers)
    Prim.box(grid, -22, 20, 124, 22, 30, 127, C.buffer_red);
    // 左右钢质缓冲盘
    Prim.discX(grid, -18, -18, 25, 132, 4, C.polished_steel);
    Prim.rod3D(grid, -18, 25, 127, -18, 25, 132, 1.5, C.dark_steel);
    Prim.discX(grid, 18, 18, 25, 132, 4, C.polished_steel);
    Prim.rod3D(grid, 18, 25, 127, 18, 25, 132, 1.5, C.dark_steel);
    // 詹式自动车钩基座
    Prim.box(grid, -3, 22, 127, 3, 27, 134, C.dark_steel);

    // 3. 经典楔形扫雪排障器 (Snowplow Cowcatcher)
    Prim.cowcatcher(grid, 146, 126, 42, 16, 11, C.iron_black, C.gold_leaf);

    // 4. 前部主探照灯 (Locomotive Headlight High Beam)
    // 位于烟箱正前方中心 (X:0, Y:72, Z:80)
    Prim.box(grid, -6, 68, 76, 6, 80, 84, C.brass_gold);
    Prim.discX(grid, -4, 4, 74, 85, 4.5, C.headlight_core);
    Prim.box(grid, -5, 69, 85, 5, 79, 86, C.headlight_core); // 发光灯芯
    Prim.cylinderY(grid, 0, 60, 68, 80, 1.8, C.dark_steel); // 探照灯支架

    // 5. 烟箱与烟箱门 (Smokebox & Front Hinged Door)
    // Z: [52, 74], 半径 19, Y: 54
    Prim.cylinderZ(grid, 0, 54, 52, 74, 19, C.graphite_gray);
    // 烟箱铰链门与锁紧手柄
    Prim.discX(grid, -17, 17, 54, 75, 17.5, C.graphite_gray);
    Prim.discX(grid, -2, 2, 54, 76, 3, C.brass_gold); // 中心徽标与把手
    Prim.rod3D(grid, -6, 54, 76, 6, 54, 76, 0.8, C.polished_steel); // 十字锁手柄

    // 6. 烟囱与排汽喷管 (Chimneystack)
    // 位于烟箱顶部 (X:0, Y: [73, 91], Z: 62)
    Prim.cylinderY(grid, 0, 73, 91, 62, 5.5, C.graphite_gray);
    Prim.cylinderY(grid, 0, 89, 92, 62, 6.8, C.brass_gold); // 烟囱口黄铜饰圈

    // 7. 主锅炉筒体 (Boiler Barrel)
    // 沿 Z 轴: [-80, 52], 半径 19, 中心 Y: 54
    if (!isCutaway) {
      // 完整外壳: 普鲁士深蓝护甲 + 6 道黄铜紧固箍带
      Prim.cylinderZ(grid, 0, 54, -80, 52, 19, C.boiler_blue);
      // 黄铜箍带 (Brass Boiler Bands)
      const bandZList = [44, 22, 0, -22, -44, -68];
      for (const bz of bandZList) {
        Prim.tubeZ(grid, 0, 54, bz, bz + 1, 19, 19.8, C.brass_gold);
      }
    } else {
      // 剖切状态: 切除左半侧 (X < 0)，露出锅炉内部结构
      // 右半侧保留完整蓝色外壳 (X >= 0)
      const r2 = 19 * 19;
      for (let dx = 0; dx <= 19; dx++) {
        for (let dy = -19; dy <= 19; dy++) {
          if (dx * dx + dy * dy <= r2) {
            for (let z = -80; z <= 52; z++) {
              grid.set(dx, 54 + dy, z, C.boiler_blue);
            }
          }
        }
      }
      // 剖切边缘黄铜剖面标识
      for (let dy = -19; dy <= 19; dy++) {
        const topX = 0;
        const topY = 54 + dy;
        grid.set(topX, topY, -80, C.brass_gold);
        grid.set(topX, topY, 52, C.brass_gold);
      }
    }

    // 8. 汽包与砂箱穹顶 (Steam Dome & Sand Dome)
    // 汽包 (Steam Dome, X:0, Z: 20, Y: [73, 87], 半径 7)
    Prim.cylinderY(grid, 0, 73, 85, 20, 6.8, C.brass_gold);
    Prim.sphere(grid, 0, 85, 20, 6.5, C.brass_gold);
    // 砂箱 (Sand Dome, X:0, Z: -36, Y: [73, 84], 半径 5.5)
    Prim.cylinderY(grid, 0, 73, 83, -36, 5.5, C.brass_gold);
    Prim.sphere(grid, 0, 83, -36, 5.2, C.brass_gold);
    // 五音阶客运汽笛 (5-Chime Whistle, Z: -68)
    Prim.cylinderY(grid, -4, 73, 82, -68, 1.2, C.brass_gold);
    Prim.cylinderY(grid, -1.5, 73, 84, -68, 1.2, C.brass_gold);
    Prim.cylinderY(grid, 1.5, 73, 81, -68, 1.2, C.brass_gold);

    // 9. 左右双联主汽缸与阀箱铸件 (Cylinder Castings & Valve Chests)
    // 左右 X: ±22, Y: [23, 47], Z: [30, 58]
    for (const sign of [-1, 1]) {
      const cx = sign * 22;
      // 主汽缸筒 (中心 Y: 30, 半径 8)
      Prim.cylinderZ(grid, cx, 30, 30, 58, 8, C.dark_steel);
      Prim.discX(grid, cx - sign * 8.5, cx + sign * 8.5, 30, 59, 8.2, C.iron_black); // 前后缸盖
      Prim.discX(grid, cx - sign * 8.5, cx + sign * 8.5, 30, 29, 8.2, C.iron_black);
      // 上方配气活塞阀箱 (中心 Y: 42, 半径 5)
      Prim.cylinderZ(grid, cx, 42, 28, 60, 5, C.dark_steel);
      // 铸钢连接肋板
      Prim.box(grid, cx - sign * 5, 30, 32, cx + sign * 5, 42, 56, C.dark_steel);
      // 铜质排污阀管 (Cylinder Drain Cocks)
      Prim.rod3D(grid, cx, 22, 34, cx + sign * 6, 16, 34, 1.0, C.copper);
      Prim.rod3D(grid, cx, 22, 54, cx + sign * 6, 16, 54, 1.0, C.copper);
    }

    // 10. 驾驶室 (Cab)
    // Z: [-130, -84], Y: [30, 85], 宽 X: [-23, 23]
    // 驾驶室底板
    Prim.box(grid, -22, 30, -130, 22, 32, -84, C.dark_steel);
    // 驾驶室左右壁与侧窗
    for (const sign of [-1, 1]) {
      const wallX = sign * 22;
      for (let z = -130; z <= -84; z++) {
        for (let y = 32; y <= 82; y++) {
          // 留出侧观景大窗 (Z: [-118, -96], Y: [52, 74])
          const isWindow = (z >= -118 && z <= -96 && y >= 52 && y <= 74);
          if (isWindow) {
            // 金色窗框四周
            if (z === -118 || z === -96 || y === 52 || y === 74) {
              grid.set(wallX, y, z, C.gold_leaf);
            }
          } else {
            grid.set(wallX, y, z, C.boiler_blue);
            grid.set(wallX - sign, y, z, C.mahogany); // 内衬木板
          }
        }
      }
    }
    // 驾驶室拱形穹顶 (Cab Arched Roof)
    for (let x = -23; x <= 23; x++) {
      const roofY = Math.round(83 + (1 - (x / 23) * (x / 23)) * 3);
      for (let z = -132; z <= -82; z++) {
        grid.set(x, roofY, z, C.iron_black);
        grid.set(x, roofY - 1, z, C.mahogany); // 室内桃花心木天花
      }
    }
    // 驾驶室内饰：火箱后壁 (Backhead)、仪表群、水表与司炉暖汽灯
    // 位于 Z: -86 处
    Prim.cylinderZ(grid, 0, 52, -86, -85, 17, C.dark_steel);
    // 双扇蝴蝶形火门 (Butterfly Firehole Doors)
    Prim.box(grid, -6, 38, -87, 6, 48, -86, C.iron_black);
    // 火门观察窥孔透出炽热熔金火光
    Prim.box(grid, -2, 42, -87, 2, 44, -86, C.fire_yellow);
    // 仪表盘 (波登管压强表、真空刹车表、速度表)
    Prim.discX(grid, -10, -9, 64, -87, 3, C.gauge_face);
    Prim.box(grid, -10, 64, -87, -10, 66, -87, C.needle_red); // 红指针
    Prim.discX(grid, 10, 11, 64, -87, 3, C.gauge_face);
    Prim.box(grid, 10, 64, -87, 10, 66, -87, C.needle_red);
    // 垂直玻璃双管水位计
    Prim.rod3D(grid, -15, 50, -87, -15, 62, -87, 1.0, C.gauge_glass);
    Prim.rod3D(grid, 15, 50, -87, 15, 62, -87, 1.0, C.gauge_glass);
    // 室内悬挂式暖色汽灯 (Cab Amber Lamp)
    Prim.sphere(grid, 0, 78, -104, 2.5, C.cab_amber);

    return grid;
  }

  // 构建煤水车 (Tender)
  static buildTender() {
    const grid = new VoxelGrid();
    // 煤水车箱体 Z: [-234, -142], Y: [18, 64], X: [-21, 21]
    // 1. 底盘大梁与车钩
    Prim.box(grid, -20, 18, -234, 20, 24, -142, C.dark_steel);
    // 2. 水柜侧壁与前/后外壁 (Prussian Blue Tank)
    Prim.hollowBox(grid, -21, 24, -234, 21, 62, -142, 2, C.boiler_blue);
    // 3. 煤斗 (Coal Bunker) 与高耸无烟煤块 (Anthracite Coal Bed)
    // 煤堆沿前高后低倾斜堆积
    for (let z = -200; z <= -144; z++) {
      const coalTopY = Math.round(52 + ((z + 200) / 56) * 12);
      for (let x = -18; x <= 18; x++) {
        for (let y = 30; y <= coalTopY; y++) {
          grid.set(x, y, z, C.coal_black);
        }
      }
    }
    // 4. 后部水柜注水口顶盖与检修爬梯
    Prim.cylinderY(grid, 0, 62, 66, -216, 5, C.brass_gold);
    // 爬梯 (Ladder)
    for (let y = 24; y <= 62; y += 4) {
      Prim.box(grid, 12, y, -235, 18, y + 1, -234, C.polished_steel);
    }
    // 5. 煤水车转向架与轮对 (两组 3 轴重型转向架)
    const tenderAxleZ = [-160, -178, -196, -212];
    for (const az of tenderAxleZ) {
      for (const sign of [-1, 1]) {
        Prim.discX(grid, sign * 16 - 2, sign * 16 + 2, 20, az, 8, C.dark_steel);
        Prim.discX(grid, sign * 18, sign * 18, 20, az, 8, C.rim_white);
      }
    }
    return grid;
  }

  // 构建万钧机心 · 锅炉纵向工程剖切内构 (Internal Boiler Cutaway Anatomy)
  static buildCutawayInterior() {
    const grid = new VoxelGrid();

    // 1. 火箱深处燃烧室 (Firebox Interior)
    // Z: [-128, -80], Y: [28, 56], X: [-18, 0]
    // 耐火砖拱圈 (Firebrick Arch)
    Prim.box(grid, -16, 36, -114, -2, 40, -100, C.firebrick);
    // 炽热沸腾煤炭层与熔金烈火 (Yellow / Orange / Crimson Glow)
    for (let z = -126; z <= -82; z++) {
      for (let x = -17; x <= -2; x++) {
        // 底层黑晶煤炭
        grid.set(x, 28, z, C.coal_black);
        grid.set(x, 29, z, C.fire_crimson);
        grid.set(x, 30, z, C.fire_orange);
        // 上层飞窜烈火
        if ((x + z) % 2 === 0) {
          grid.set(x, 31, z, C.fire_yellow);
        }
        if ((x * 3 + z * 5) % 7 === 0) {
          grid.set(x, 32, z, C.fire_yellow);
        }
      }
    }
    // 紫铜火箱顶板与留栓矩阵 (Copper Crown Sheet & Staybolts)
    Prim.box(grid, -18, 55, -126, 0, 56, -80, C.copper);
    for (let z = -124; z <= -82; z += 6) {
      for (let x = -16; x <= -2; x += 4) {
        Prim.rod3D(grid, x, 56, z, x, 70, z, 0.6, C.dark_steel); // 悬吊顶栓
      }
    }

    // 2. 84 根锅炉火管烟管阵列 (Flue Tubes Array)
    // 贯通火箱管板 (Z: -80) 至烟箱管板 (Z: 50)
    // 沿半径 18 的半圆截面紧密蜂窝状排列
    const tubeCols = [-16, -13, -10, -7, -4, -2];
    const tubeRows = [40, 44, 48, 52, 56, 60, 64];

    for (const tx of tubeCols) {
      for (const ty of tubeRows) {
        const dy = ty - 54;
        const dist2 = tx * tx + dy * dy;
        if (dist2 <= 17 * 17) {
          // 下方细烟管 (Small Fire Flues, 半径 1.0)
          if (ty <= 52) {
            Prim.tubeZ(grid, tx, ty, -80, 50, 0.8, 1.4, C.boiler_tube);
          }
          // 上方大过热管 (Large Superheater Flues, 半径 2.0，内置四曲过热蒸汽蛇形管)
          else if (tx % 6 === 0 && ty % 8 === 0) {
            Prim.tubeZ(grid, tx, ty, -80, 50, 1.6, 2.2, C.dark_steel);
            // 内部过热管 (紫铜)
            Prim.rod3D(grid, tx, ty, -78, 48, ty, 0.6, C.copper);
          }
        }
      }
    }

    // 3. 主饱和蒸汽收集总管与调速器阀 (Internal Steam Collector Pipe & Throttle)
    // 位于锅炉最高处 (Y: 66, X: -4)
    Prim.rod3D(grid, -4, 66, -70, -4, 66, 40, 1.8, C.copper);
    // 汽包内部调节节流阀 (Throttle Regulator)
    Prim.cylinderY(grid, -4, 66, 78, 20, 2.8, C.brass_gold);

    // 4. 左侧汽缸与阀箱剖切 (Left Cylinder & Piston Internal Cutaway)
    // X: -22, Y: 30 (气缸), Y: 42 (阀箱), Z: [32, 56]
    // 剖开半边缸壁露出活塞腔
    Prim.tubeZ(grid, -22, 30, 32, 56, 6.0, 7.8, C.dark_steel);
    // 活塞头 (Piston Head, 双铸铁活塞环)
    Prim.cylinderZ(grid, -22, 30, 42, 45, 5.8, C.polished_steel);
    // 蒸汽进排汽水道 (Steam Ports)
    Prim.box(grid, -22, 36, 34, -20, 40, 37, C.dark_steel);
    Prim.box(grid, -22, 36, 51, -20, 40, 54, C.dark_steel);
    // 阀箱活塞阀芯 (Piston Valve Spool)
    Prim.cylinderZ(grid, -22, 42, 38, 50, 3.8, C.polished_steel);

    return grid;
  }

  // 构建独立动轮几何 (用于随车速实时旋转)
  // isRightSide: true 为右侧 (相位超前 90°)
  static buildDriverWheelGeom(radius, width, crankRadius, isRightSide = false) {
    const grid = new VoxelGrid();
    const paletteIds = {
      darkSteel: C.dark_steel,
      rimWhite: C.rim_white,
      polishedSteel: C.polished_steel
    };
    // 在局部坐标原点 (0, 0, 0) 构建车轮，曲柄销位于初始角 0
    Prim.buildDriverWheel(grid, 0, 0, 0, radius, width, crankRadius, 0, paletteIds);
    return grid;
  }
}
