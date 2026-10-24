// spec.js — 候风地动仪 · 全部设计常量与共享数学
// 纯模块：浏览器与 Node 工具链共用，禁止引入 three 或 DOM。

export const V = 1; // 体素边长

// ── 八方（俯视逆时针，k=0 为东，+x；+z 为南）────────────────────────────
export const DIRS = [
  { name: '东',   angle: 0 },
  { name: '东北', angle: 45 },
  { name: '北',   angle: 90 },
  { name: '西北', angle: 135 },
  { name: '西',   angle: 180 },
  { name: '西南', angle: 225 },
  { name: '南',   angle: 270 },
  { name: '东南', angle: 315 },
];

export function dirVec(k) {
  const a = (DIRS[k].angle * Math.PI) / 180;
  return { x: Math.cos(a), z: -Math.sin(a) }; // k=0 → +x（东），逆时针（俯视）
}

export function angOf(x, z) {
  return ((Math.atan2(-z, x) * 180) / Math.PI + 360) % 360;
}

// ── 八音（五声 + 高八度，齐奏用）────────────────────────────────────────
// 宫 商 角 徵 羽 · 宫 商 角
export const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
export const NOTE_NAMES = ['宫', '商', '角', '徵', '羽', '宫̇', '商̇', '角̇'];

// 震级 → 古称
export const QUAKE_WORDS = {
  1: '微', 2: '轻', 3: '小', 4: '中', 5: '强', 6: '大', 7: '剧', 8: '裂', 9: '灾',
};

// ── 调色板（十六进制 int，烘焙进顶点色）────────────────────────────────
export const PAL = {
  bronze:      0x8a6a3b, // 青铜主色
  bronzeLight: 0xb08d57, // 青铜受光
  bronzeDark:  0x503b20, // 青铜阴影/铸造缝
  patina:      0x4f9e8f, // 铜绿
  patinaDark:  0x35706a,
  gold:        0xd4af6a, // 鎏金饰件
  eyeGlow:     0xffb347, // 龙目（琥珀）
  ball:        0xc9a15a, // 铜丸
  toad:        0x5d7a52, // 蟾蜍（铜绿重）
  toadDark:    0x42583d,
  toadGlow:    0xff9d3c, // 蟾口承丸（暖橙）
  fire:        0xff9a3c, // 火
  fireHot:     0xffd27a,
  ember:       0xcc5a1e,
  stone:       0x6e6357, // 底座石
  stoneDark:   0x524a40,
  rock:        0x5a5148, // 浮岩
  rockDark:    0x443d36,
  moss:        0x4c6b4a,
  wood:        0x7a5a38, // 火盆架
  sky:         0x1a2438, // 天穹（仅烘焙参考，不雕刻）
};

// ── 布局常量（体素格；仪器底座顶面 y=0）────────────────────────────────
export const L = {
  R: 15,            // 尊体半径
  shellY0: 3,       // 尊体底（坐于底座）
  shellY1: 22,      // 尊体顶
  lidY0: 22, lidY1: 24, // 盖
  wedgeHalf: 26,    // 剖面半宽（度），中心在 k=0（东）
  wedgeY0: 6, wedgeY1: 19, // 剖开高度区间
  pillarR: 3, pillarY0: 4, pillarY1: 20, pivotY: 6, // 都柱
  leverY: 10,       // 八道高度
  dragonY: 21,      // 龙首基准高
  toadR: 16.2,      // 蟾蜍中心半径
  toadMouthR: 19.2, // 蟾口中心半径
  dragonMouthR: 19.6, // 龙口铜丸半径
  pedestalR: 19, pedestalY0: 0, pedestalY1: 3, // 石底座
  brazierR: 16.8,   // 火盆（八座，错开 22.5°）
  rockR: 26, rockTop: 0, rockBot: -9, // 浮岩
};

// 烘焙光照（离线光栅与浏览器共用同一组常数——所见即所得）
export const BAKE = {
  keyDir: { x: -0.55, y: 0.72, z: 0.42 },  // 主光（火色暖光，从东南上方来）
  keyColor: [1.18, 1.0, 0.78],
  fillDir: { x: 0.6, y: 0.25, z: -0.55 },
  fillColor: [0.44, 0.52, 0.66],           // 冷色补光（夜色）
  hemiSky: [0.44, 0.50, 0.64],
  hemiGround: [0.24, 0.19, 0.15],
  aoStrength: 0.34,                         // 邻接遮挡强度
  fireGlow: 0.55,                           // 火盆暖光上限
};

// ── 工具 ──────────────────────────────────────────────────────────────
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInQuad = (t) => t * t;

// 轨道相机（yaw 度、pitch 度、距离、目标点）→ 相机基向量
// 与 three.js 主渲染共用同一约定，保证离线截图与在线视角一致。
export function orbitCam(yawDeg, pitchDeg, dist, target) {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cp = Math.cos(pitch);
  const pos = {
    x: target.x + dist * cp * Math.cos(yaw),
    y: target.y + dist * Math.sin(pitch),
    z: target.z + dist * cp * Math.sin(yaw),
  };
  const fwd = norm3({ x: target.x - pos.x, y: target.y - pos.y, z: target.z - pos.z });
  const right = norm3(cross(fwd, { x: 0, y: 1, z: 0 }));
  const up = cross(right, fwd);
  return { pos, fwd, right, up };
}
export function cross(a, b) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
export function norm3(a) {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}
