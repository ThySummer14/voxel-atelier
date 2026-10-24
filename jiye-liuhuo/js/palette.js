// 极夜流火 · 工业调色板系统 (Industrial & Atmospheric Palette)
// 36 种精确定义的高阶材质色彩，包含 sRGB、线性空间值及光学漫反射与自发光属性

export const PALETTE_DEF = [
  // 0: 空白 (Air)
  { id: 0, name: 'air', hex: '#000000', r: 0, g: 0, b: 0, emit: 0, rough: 1.0 },

  // --- 机车外部金属与涂装 (Locomotive Exterior Metal & Paint) ---
  // 1: 铸铁黑 (Boiler Cast Iron Black)
  { id: 1, name: 'iron_black', hex: '#16181b', r: 22, g: 24, b: 27, emit: 0, rough: 0.7 },
  // 2: 普鲁士深蓝护甲 (Prussian Blue Boiler Jacket)
  { id: 2, name: 'boiler_blue', hex: '#1b263b', r: 27, g: 38, b: 59, emit: 0, rough: 0.4 },
  // 3: 烟箱石墨灰 (Smokebox Graphite)
  { id: 3, name: 'graphite_gray', hex: '#2b2d31', r: 43, g: 45, b: 49, emit: 0, rough: 0.85 },
  // 4: 抛光精钢 (Polished Machine Steel - Rods & Guides)
  { id: 4, name: 'polished_steel', hex: '#c5cbd3', r: 197, g: 203, b: 211, emit: 0, rough: 0.25 },
  // 5: 淬火暗钢 (Hardened Dark Steel - Wheel Hubs & Frame)
  { id: 5, name: 'dark_steel', hex: '#414853', r: 65, g: 72, b: 83, emit: 0, rough: 0.5 },
  // 6: 轮缘白边 (Whitewall Driver Rim)
  { id: 6, name: 'rim_white', hex: '#dce0e6', r: 220, g: 224, b: 230, emit: 0, rough: 0.4 },
  // 7: 锻造黄铜 (Burnished Brass - Bands, Whistle, Dome)
  { id: 7, name: 'brass_gold', hex: '#d4af37', r: 212, g: 175, b: 55, emit: 0, rough: 0.3 },
  // 8: 亮金嵌线 (Gold Leaf Pinstripe & Nameplate)
  { id: 8, name: 'gold_leaf', hex: '#f3c959', r: 243, g: 201, b: 89, emit: 0, rough: 0.2 },
  // 9: 紫铜管路 (Burnished Copper Tubing & Injector)
  { id: 9, name: 'copper', hex: '#b85d34', r: 184, g: 93, b: 52, emit: 0, rough: 0.4 },
  // 10: 轴箱红漆 (Crankpin & Buffer Beam Crimson Red)
  { id: 10, name: 'buffer_red', hex: '#9e2226', r: 158, g: 34, b: 38, emit: 0, rough: 0.4 },

  // --- 驾驶室与内构剖切 (Cab Interior & Cutaway Anatomy) ---
  // 11: 桃花心木护板 (Mahogany Cab Lining & Bench)
  { id: 11, name: 'mahogany', hex: '#4a2511', r: 74, g: 37, b: 17, emit: 0, rough: 0.6 },
  // 12: 仪表盘米白 (Gauge Enamel Face)
  { id: 12, name: 'gauge_face', hex: '#e9ecef', r: 233, g: 236, b: 239, emit: 0.1, rough: 0.3 },
  // 13: 仪表指针与危标 (Gauge Needle & Warning Mark)
  { id: 13, name: 'needle_red', hex: '#e63946', r: 230, g: 57, b: 70, emit: 0.2, rough: 0.3 },
  // 14: 水位表玻璃与水银 (Water Sight Gauge Glass)
  { id: 14, name: 'gauge_glass', hex: '#8ecae6', r: 142, g: 202, b: 230, emit: 0.3, rough: 0.1 },
  // 15: 耐火砖衬里 (Firebrick Refractory Arch)
  { id: 15, name: 'firebrick', hex: '#8d5b4c', r: 141, g: 91, b: 76, emit: 0, rough: 0.9 },
  // 16: 锅炉烟管内壁 (Boiler Flue Steel Tube)
  { id: 16, name: 'boiler_tube', hex: '#5c677d', r: 92, g: 103, b: 125, emit: 0, rough: 0.6 },
  // 17: 煤层黑晶 (Anthracite Coal Bed)
  { id: 17, name: 'coal_black', hex: '#111215', r: 17, g: 18, b: 21, emit: 0, rough: 0.9 },

  // --- 燃烧与发光能量 (Thermodynamic Fire & Emission) ---
  // 18: 炽热火箱熔金 (Incandescent White-Yellow Fire)
  { id: 18, name: 'fire_yellow', hex: '#fff3b0', r: 255, g: 243, b: 176, emit: 1.0, rough: 0.2 },
  // 19: 沸腾余烬烈橙 (Blazing Firebox Orange)
  { id: 19, name: 'fire_orange', hex: '#ff7b00', r: 255, g: 123, b: 0, emit: 0.85, rough: 0.3 },
  // 20: 炭火暗红 (Deep Embers Red)
  { id: 20, name: 'fire_crimson', hex: '#d00000', r: 208, g: 0, b: 0, emit: 0.6, rough: 0.4 },
  // 21: 车头主探照灯强光 (Locomotive Headlight High Beam)
  { id: 21, name: 'headlight_core', hex: '#fffbe6', r: 255, g: 251, b: 230, emit: 1.0, rough: 0.1 },
  // 22: 驾驶室暖色汽灯 (Cab Amber Oil Lamp Glow)
  { id: 22, name: 'cab_amber', hex: '#ffb703', r: 255, g: 183, b: 3, emit: 0.7, rough: 0.3 },

  // --- 极地环境与钢桥 (Polar Environment & Viaduct) ---
  // 23: 新积白雪 (Pure Fresh Powder Snow)
  { id: 23, name: 'snow_fresh', hex: '#f0f4f8', r: 240, g: 244, b: 248, emit: 0, rough: 0.8 },
  // 24: 压实深雪与雪阴影 (Packed Snow Shadow - Blue Tint)
  { id: 24, name: 'snow_shadow', hex: '#9fb3c8', r: 159, g: 179, b: 200, emit: 0, rough: 0.7 },
  // 25: 冰川裂隙青冰 (Glacial Blue Ice)
  { id: 25, name: 'glacial_ice', hex: '#64dfdf', r: 100, g: 223, b: 223, emit: 0.15, rough: 0.2 },
  // 26: 冻土岩石玄武黑 (Basalt Gorge Rock)
  { id: 26, name: 'rock_basalt', hex: '#212529', r: 33, g: 37, b: 41, emit: 0, rough: 0.9 },
  // 27: 针叶冷杉深苍绿 (Frosted Taiga Pine Foliage)
  { id: 27, name: 'pine_green', hex: '#1b4332', r: 27, g: 67, b: 50, emit: 0, rough: 0.85 },
  // 28: 冷杉树干木褐 (Pine Trunk Bark)
  { id: 28, name: 'pine_trunk', hex: '#3a2e2b', r: 58, g: 46, b: 43, emit: 0, rough: 0.9 },
  // 29: 钢桁架红棕底漆 (Viaduct Structural Red Primer)
  { id: 29, name: 'viaduct_steel', hex: '#483c32', r: 72, g: 60, b: 50, emit: 0, rough: 0.6 },
  // 30: 铁道枕木杂酚油深褐 (Creosoted Rail Ties)
  { id: 30, name: 'rail_ties', hex: '#2d241e', r: 45, g: 36, b: 30, emit: 0, rough: 0.9 },
  // 31: 重轨轨顶磨耗银亮 (Polished Rail Crown)
  { id: 31, name: 'rail_crown', hex: '#b0b8c4', r: 176, g: 184, b: 196, emit: 0, rough: 0.2 },

  // --- 蒸汽、粒子与极光 (Atmospheric Smoke, Particles & Aurora) ---
  // 32: 浓密水汽白云 (Dense Steam Cloud)
  { id: 32, name: 'steam_white', hex: '#e8edf3', r: 232, g: 237, b: 243, emit: 0.1, rough: 0.95 },
  // 33: 煤烟浓灰 (Sooty Coal Smoke)
  { id: 33, name: 'coal_soot', hex: '#343a40', r: 52, g: 58, b: 64, emit: 0, rough: 0.95 },
  // 34: 飞逸火星 (Flying Furnace Spark)
  { id: 34, name: 'spark_gold', hex: '#ffd166', r: 255, g: 209, b: 102, emit: 1.0, rough: 0.1 },
  // 35: 极光翡翠青绿 (Aurora Emerald Glow)
  { id: 35, name: 'aurora_green', hex: '#06d6a0', r: 6, g: 214, b: 160, emit: 0.9, rough: 0.1 }
];

// 预计算线性 RGB 浮点缓冲 (Float32Array [R, G, B] 每色一个)
export const PALETTE_LINEAR = new Float32Array(PALETTE_DEF.length * 3);
// 自发光强度表
export const PALETTE_EMIT = new Float32Array(PALETTE_DEF.length);

// sRGB to Linear Gamma 2.2 转换
for (let i = 0; i < PALETTE_DEF.length; i++) {
  const item = PALETTE_DEF[i];
  const rLin = Math.pow(item.r / 255, 2.2);
  const gLin = Math.pow(item.g / 255, 2.2);
  const bLin = Math.pow(item.b / 255, 2.2);
  PALETTE_LINEAR[i * 3 + 0] = rLin;
  PALETTE_LINEAR[i * 3 + 1] = gLin;
  PALETTE_LINEAR[i * 3 + 2] = bLin;
  PALETTE_EMIT[i] = item.emit;
}

// 快速根据颜色名查找调色板 ID
export const COLOR_ID = {};
for (const item of PALETTE_DEF) {
  COLOR_ID[item.name] = item.id;
}
