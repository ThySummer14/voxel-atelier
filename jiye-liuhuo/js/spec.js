// 极夜流火 · 核心工程规格与物理常数 (Engineering Specs & Physical Constants)
// 1928 年太平洋型 4-6-2 (Pacific 4-6-2) 准高速干线客运蒸汽机车

export const SPEC = {
  // --- 体素标定 (Voxel Scale Calibration) ---
  VOXEL_SIZE_M: 0.05, // 1 体素格 = 0.05 米 (50 毫米)

  // --- 轮系与机车几何度量 (Running Gear Geometry, in Voxels) ---
  TRACK_GAUGE: 28,      // 标准轨距 1435mm ≈ 28 格 (中心对称 ±14)
  RAIL_TOP_Y: 10,       // 轨顶基准 Y 标高

  // 动轮 (Driving Wheels: 4-6-2 中间的 3 对大动轮)
  DRIVER_COUNT: 3,
  DRIVER_RADIUS: 20,    // 动轮半径 20 格 (直径 2.0 米)
  DRIVER_SPACING: 46,   // 动轮轴距 46 格 (2.3 米)
  DRIVER_AXLE_Y: 30,    // 动轮轴心 Y 标高 = 轨顶 10 + 半径 20
  DRIVER_Z_POS: [18, -28, -74], // 前动轮、主驱动轮(中)、后动轮 Z 坐标

  // 导轮 (Leading Pilot Truck: 前端 2 轴 4 轮)
  PILOT_RADIUS: 10,     // 导轮半径 10 格 (直径 1.0 米)
  PILOT_AXLE_Y: 20,
  PILOT_Z_POS: [84, 114],

  // 从轮 (Trailing Truck: 后端 1 轴 2 轮，承托深火箱)
  TRAILING_RADIUS: 12,  // 从轮半径 12 格 (直径 1.2 米)
  TRAILING_AXLE_Y: 22,
  TRAILING_Z_POS: [-118],

  // --- 华氏配气机构 (Walschaerts Valve Gear Parameters, in Voxels) ---
  CRANK_RADIUS: 7.0,          // 主曲柄销旋转半径 (冲程 14 格 = 700mm)
  CONN_ROD_LENGTH: 42.0,      // 主连杆长度 (活塞十字头到主曲柄销)
  CROSSHEAD_GUIDE_LENGTH: 22.0,// 十字头滑板长度
  CROSSHEAD_Y: 30.0,          // 十字头中心 Y 高度 (与轴心对齐)
  CYLINDER_CENTER_Z: 44.0,    // 汽缸冲程中心 Z 位置

  // 配气机构杆系
  ECCENTRIC_RADIUS: 3.2,      // 偏心回转曲柄偏心距
  ECCENTRIC_ROD_LENGTH: 34.0, // 偏心拉杆长度
  EXPANSION_LINK_RADIUS: 24.0,// 膨胀导弯管曲率半径
  EXPANSION_LINK_PIVOT_Y: 36.0,
  EXPANSION_LINK_PIVOT_Z: -12.0,
  RADIUS_ROD_LENGTH: 24.0,    // 滑板连杆 (滑销连接至合并杆)
  VALVE_ROD_Y: 42.0,          // 配气阀杆中心高 (高于主气缸 12 格)
  COMBINATION_LEVER_A: 3.5,   // 合并杆上臂 (滑杆接点到配气阀杆)
  COMBINATION_LEVER_B: 14.0,  // 合并杆下臂 (滑杆接点到十字头吊杆)

  // --- 锅炉与上部结构 (Boiler & Superstructure, in Voxels) ---
  BOILER_RADIUS: 19,          // 锅炉筒体内径 19 格 (外径 38 格 = 1.9 米)
  BOILER_CENTER_Y: 54,        // 锅炉中心轴线高 (轨顶以上 2.2 米)
  BOILER_FRONT_Z: 66,         // 烟箱前壁 Z
  BOILER_REAR_Z: -82,         // 锅炉后筒壁 (火箱前沿) Z
  FIREBOX_LENGTH: 48,         // 火箱长度 (-82 到 -130)
  CAB_LENGTH: 42,             // 驾驶室 (-92 到 -134)
  CAB_WIDTH: 46,              // 驾驶室宽度 (±23)
  CAB_HEIGHT: 40,             // 驾驶室顶标高 Y = 84
  TENDER_FRONT_Z: -140,       // 煤水车前沿
  TENDER_REAR_Z: -240,        // 煤水车后沿 (长 100 格 = 5.0 米)
  TENDER_WIDTH: 44,

  // 内部烟管与火箱剖切 (Cutaway Specs)
  FLUE_TUBE_ROWS: 7,          // 烟管阵列行数
  FLUE_TUBE_COLS: 12,         // 烟管阵列列数
  FLUE_TUBE_RADIUS: 1.0,      // 细烟管半径
  SUPERHEATER_FLUE_RADIUS: 2.2,// 大过热管半径

  // --- 桥梁、极地峡谷与世界范围 (Viaduct & World Extents) ---
  VIADUCT_LENGTH: 420,        // 钢桁梁总长 (-210 到 +210)
  VIADUCT_PIER_SPACING: 120,  // 桥墩间距
  GORGE_DEPTH: 70,            // 峡谷深冰面 Y = -60
  FOREST_SPRUCE_COUNT: 48,    // 针叶冷杉树木数量

  // --- 物理与动力学常数 (Thermodynamics & Motion) ---
  NOMINAL_SPEED_KMH: 72.0,    // 标称巡航车速 72 km/h
  MAX_SPEED_KMH: 120.0,       // 极速 120 km/h
  BOILER_MAX_PRESSURE_BAR: 16.0, // 锅炉最大允许工作压强 (1.6 MPa)
  CHUFFS_PER_REV: 4,          // 双缸四冲程每轮转动排汽拍数 = 4 拍

  // --- 相机预设机位 (Cinematic Views, in World Meters) ---
  CAMERAS: {
    hero: {
      pos: [14.0, 4.8, 12.0],
      target: [0, 2.2, -1.0],
      fov: 42,
      name: '铁流破晓 · 全景'
    },
    gear: {
      pos: [-5.2, 1.6, -1.0],
      target: [-1.2, 1.5, -1.0],
      fov: 42,
      name: '华氏配气 · 微距'
    },
    cutaway: {
      pos: [-7.8, 3.4, 2.0],
      target: [-0.6, 2.3, -2.2],
      fov: 40,
      name: '万钧机心 · 剖切'
    },
    cab: {
      pos: [0.2, 3.1, -5.8],
      target: [0, 2.8, -4.4],
      fov: 65,
      name: '司炉罗盘 · 驾驶室'
    },
    front: {
      pos: [2.2, 1.5, 9.2],
      target: [0, 2.2, 3.5],
      fov: 45,
      name: '破雪先锋 · 探照灯'
    },
    aurora: {
      pos: [18.0, 13.0, -5.0],
      target: [0, 2.0, -2.0],
      fov: 48,
      name: '极光巡礼 · 苍穹'
    }
  }
};
