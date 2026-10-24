// 《经天纬地》—— 全部可调旋钮集中在此。
// 单位：格（voxel）。格 (x,y,z) 占据立方体 [x,x+1)×[y,y+1)×[z,z+1)。
// 坐标：X 左右（经线排列、梭飞行方向），Y 上，Z 前后（经线走向：后 = -Z 经轴，前 = +Z 卷布轴）。

export const GRID = { x0: -144, nx: 289, y0: -6, ny: 165, z0: -108, nz: 217 };

export const ROOM = {
  wallX: 140,          // 左右墙内表面 |x|
  wallZ: -100,         // 后墙内表面 z
  wallTop: 150,        // 墙高
  floorY: 0,           // 地面（上表面）
  floorSlab: -6,       // 地板厚（到 y=-6）
  frontZ: 108,         // 地面向前延伸到此
  wallThick: 4,
};

export const WARP = { n: 60, pitch: 2, x0: -60 };   // 60 根经线；第 i 根在 x = x0+2i 左格
export const CELLW = 2;                              // 布格宽（覆盖 2i, 2i+1 两格）
export const PICKS = 42;                             // 每匹 42 纬

export const LOOM = {
  postX: 72,           // 立柱中心 |x|
  postW: 5,
  backZ: -58, midZ: 6, frontZ: 66,
  railY: 44,           // 侧梁中心高
  towerTopY: 118,      // 花楼顶梁中心
  roofY: 124,          // 花楼屋面
  warpBeam: { y: 29, z: -58, r: 7 },      // 经轴
  breastBeam: { y: 32, z: 44, r: 4 },     // 胸梁（顶面与经面齐平）
  clothBeam: { y: 28, z: 56, r: 8 },      // 卷布轴（顶面与经面齐平）
  warpY: 36,           // 经面高度
  heddleZ: -10,        // 综眼（提花线系点）
  fellZ: 16,           // 织口
  shedLift: 10,        // 开口抬升（梭道净空 ≥3）
  runZ: 6,             // 梭飞行线（weft 落点）
  reedRestZ: 0,        // 筘静止位
  reedPivot: [0, 112, -2], reedBeat: -0.172, // 打手轴与打纬摆角
};

export const TAPE = {                // 花本带（打孔卡）：卡面在 z=TAPE.z，孔=提起的经线
  z: -30, cardW: 120, cardH: 18, cardY0: 98, pitch: 126,
  holeY0: 103, holeY1: 105,          // 孔带（一行 60 孔，正对经线）
  rollX: 124, rollY: 97, rollR: 10,
  lightZ: -35, backZ: -37, hookZ: -30, gateZ: -27,
};

export const RACK = {                // 晾锦架（成品挂架，左前方）
  x0: -138, x1: -18, z: 78, postW: 2,   // 立柱细，别挡住织机
  rails: [48, 92, 136], height: 144,
};

export const LIGHT = {
  sunColor: [0.80, 0.88, 1.0],   // 窗光（冷）
  sunI: 1.00,
  sunDir: [0.58, -0.66, 0.48],   // 由左墙窗射入（+x 进厅，+z 向前）
  skyUp: 0.36, skySide: 0.19, skyDown: 0.12,
  skyTint: [0.72, 0.80, 0.95],
  lamps: [                                   // 点光列表：油灯（暖·主光）/ 读卡灯（照花本）
    { pos: [-62, 62, 90], color: [1.0, 0.62, 0.30], I: 1.85, R: 186 },
    { pos: [0, 100, -1], color: [1.0, 0.80, 0.52], I: 1.25, R: 62 },
  ],
  lampPos: [-62, 62, 90],                    // 火焰位置（取主灯）
  aoLevels: [0.60, 0.735, 0.86, 1.0],
  debugFlat: false,   // 索引 = AO 等级，3 = 无遮蔽
  quant: 6,                      // 顶点色量化位数（合并率 vs 带宽）
};

// ---------- 丝色（sRGB 十六进制；银/月白是纬线彩，素白是经线地色） ----------
export const SILK = {
  ivory:    '#efe3cb',   // 素白
  cord:     '#c3b596',   // 提花线束
  gold:     '#c9a227',   // 金
  verm:     '#b8382e',   // 朱
  azure:    '#1f4b7a',   // 石青
  indigo:   '#161f36',   // 靛（最深的夜）
  crimson:  '#6d1f28',   // 绛
  jade:     '#4a7f68',   // 玉
  moon:     '#9fc0e0',   // 月白（星晕）
  pale:     '#5d80a8',   // 淡青（银河）
  silver:   '#eef3f8',   // 银白（北斗亮星）
  darkgold: '#8a6c22',   // 暗金（星图连线）
  azure2:   '#4a86c0',   // 石青经（经面亮于地纬）
  crimson2: '#a84b5a',   // 绛经
  indigo2:  '#38466e',   // 靛经
};

export const WOOD = {
  dark:   '#68492c',   // 深栗（主架）
  mid:    '#936a3e',   // 中木
  light:  '#b98d5e',   // 浅木（凳、架）
  bamboo: '#c2ab74',   // 竹
  card:   '#a08c52',   // 花本卡（竹片）
  brass:  '#c9a34a',   // 铜
  iron:   '#5b6771',   // 铁
  brick:  '#7c807a',   // 青砖
  brick2: '#6f736d',
  plaster:'#c2b9a8',   // 壁（灰泥）
  plaster2:'#b3aa98',
  paper:  '#e8dcc0',   // 窗纸
  ink:    '#33322c',   // 墨（窗棂/铁件）
  night:  '#2b3c58',   // 窗外夜色
};

export const TIMING = {
  lift: 0.18, beat: 0.26, advance: 0.08, rest: 0.03,
  carry: 0.06,                          // 梭从停靠位掠入梭道
  flyBase: 0.040, flyPerCell: 0.0050, minFly: 0.07,
  flyBack: 0.5,                         // 回程（不引纬）用时比例
  home: 0.06,
  completeHold: 2.4, unload: 2.8,
};

// 五把梭的停靠位（与 sculpt/loom.js 一致）
export const SHUTTLES = { x: 95, y: 41, z0: 56, dz: 9 };
export const warpX = (i) => WARP.x0 + WARP.pitch * i;
export const slotHome = (k) => [SHUTTLES.x, SHUTTLES.y, SHUTTLES.z0 + SHUTTLES.dz * k];

export const CAMERAS = {           // yaw: 0 = +Z；pitch: 0 = 水平
  cover:  { yaw: 0.32, pitch: 0.50, dist: 330, look: [-4, 42, 22] },
  fell:   { yaw: 0.22, pitch: 0.42, dist: 168, look: [4, 40, 24] },
  tower:  { yaw: 0.34, pitch: 0.20, dist: 230, look: [0, 86, -12] },
  tape:   { yaw: 0.05, pitch: 0.10, dist: 182, look: [4, 102, -28] },
  side:   { yaw: -0.92, pitch: 0.16, dist: 330, look: [0, 42, 4] },
  top:    { yaw: 0.52, pitch: 0.95, dist: 430, look: [-8, 30, 20] },
  rack:   { yaw: 0.11, pitch: 0.17, dist: 268, look: [-76, 60, 74] },
};

export const PATTERNS = ['菱格回纹', '缠枝宝相花', '星图·北斗'];

// 织造：地组织为 3/1 斜纹（经线浮在纬上 ≈ 1/4 格），花 = 彩纬浮起
export const TWILL = { period: 4, keep: 1, shift: 2 };
export function twillLifted(i, p) {
  return (i + TWILL.shift * p) % TWILL.period === 0;
}