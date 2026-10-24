// 零件清单与全部几何常量。1 格 = 0.2 mm。
// 世界坐标：原点在大漆座顶面中心，+Y 朝表镜，X 指向 3 点位，Z 指向 6 点位。
// 主网格把世界坐标平移 (CX, CY0, CZ) 放进数组下标空间。

export const VOX_MM = 0.2;
export const GX = 288, GY = 96, GZ = 288;
export const CX = 144, CZ = 144, CY0 = 0;      // 世界原点 (0,0,0) → 网格 (144,0,144)
export const w2g = (x, y, z) => [x + CX, y + CY0, z + CZ];

// —— 表壳 ——
export const R_CASE_OUT = 102;
export const R_CASE_IN = 92;
export const Y_CASE_BOT = 34, Y_CASE_TOP = 66;
export const Y_BEZEL_BOT = 66, Y_BEZEL_TOP = 78, R_BEZEL_OUT = 104, R_BEZEL_IN = 90;
export const Y_REHAUT_BOT = 58, Y_REHAUT_TOP = 74;
export const N_FLUTE = 30;   // 保留：内影圈细拉丝用

// —— 机芯层 ——
export const R_MOVE = 76;
export const Y_PLATE = 46, Y_PLATE_TOP = 51;
export const Y_WHEEL = 53, Y_WHEEL_TOP = 58;
export const Y_BRIDGE = 59, Y_BRIDGE_TOP = 64;
export const Y_TOURB_BRIDGE = 66, Y_TOURB_BRIDGE_TOP = 71;

// —— 轮系（平面位置，世界坐标）——
export const TRAIN = {
  barrel: { x: -34, z: -24, rTip: 28, rRoot: 24.5, teeth: 84 },
  center: { x: 0, z: 0, rTip: 16, rRoot: 13.5, teeth: 80 },
  third: { x: 23, z: 19, rTip: 13.5, rRoot: 11, teeth: 64 },
  fourth: { x: 0, z: 40, rTip: 19, rRoot: 16.5, teeth: 60 },   // 与笼框同心
  crownWheel: { x: 52, z: -30, rTip: 14, rRoot: 12, teeth: 42 },
  idle: { x: 14, z: -44, rTip: 12, rRoot: 10, teeth: 36 },
  ratchet: { x: -34, z: -24, rTip: 17, rRoot: 14.5, teeth: 24 }, // 棘轮在条轴上
};

// —— 陀飞轮 ——
export const CAGE = { x: 0, z: 40, r: 34, rIn: 30 };
export const BAL = { x: 0, z: 27, r: 22, rRim: 22, rRoot: 19 };
export const ESC = { x: 0, z: 60, rTip: 11.5, rRoot: 8.5, teeth: 15 };
export const PAL = { x: 0, z: 43.5 };        // 杠杆枢轴
export const HS = { a0: 4.5, turns: 4, rMax: 19 };  // 游丝

// —— 表盘/指针 ——
export const Y_DIAL = 68;
export const R_DIAL_IN = 74, R_DIAL_OUT = 92;
export const R_MIN_TRACK = 90;
export const Y_HAND_MIN = 73, Y_HAND_HOUR = 77;
export const LEN_MIN = 84, LEN_HOUR = 54;
export const PR = { x: 0, z: -52, r: 13 };   // 动力储存显示

// 零件表：key 用于运动学与交互，pivot 为旋转中心（世界坐标），
// axis 自转轴，parent 父零件（嵌套旋转），explode 拆解位移。
const Y = { cage: 40, bal: 56, esc: 55, pal: 57, hs: 60 };

export const PARTS = [
  { key: 'plinth', name: '大漆器座', pivot: [0, 0, 0], explode: [0, -64, 0], label: '下承' },
  { key: 'caseBack', name: '底盖', pivot: [0, 34, 0], explode: [0, -40, 0] },
  { key: 'caseBand', name: '中壳·表耳', pivot: [0, 50, 0], explode: [0, 0, 0] },
  { key: 'bezel', name: '齿纹表圈', pivot: [0, 72, 0], explode: [0, 96, 0] },
  { key: 'rehaut', name: '内影圈', pivot: [0, 66, 0], explode: [0, 84, 0] },
  { key: 'crown', name: '表冠', pivot: [108, 52, 0], axis: 'x', explode: [0, 26, 0] },
  { key: 'onyx', name: '蓝玛瑙顶', pivot: [108, 52, 0], axis: 'x', explode: [0, 34, 0] },
  { key: 'stem', name: '把茎·小钢轮', pivot: [96, 52, 0], axis: 'x', explode: [0, 16, 0] },

  { key: 'mainPlate', name: '主夹板', pivot: [0, 48, 0], explode: [0, -22, 0] },
  { key: 'barrel', name: '发条盒', pivot: [TRAIN.barrel.x, Y_WHEEL, TRAIN.barrel.z], spin: 'barrel', explode: [0, 6, 0] },
  { key: 'centerWheel', name: '中心轮', pivot: [0, Y_WHEEL, 0], spin: 'centerWheel', explode: [0, 14, 0] },
  { key: 'thirdWheel', name: '三轮', pivot: [TRAIN.third.x, Y_WHEEL, TRAIN.third.z], spin: 'thirdWheel', explode: [0, 22, 0] },
  { key: 'fourthWheel', name: '秒轮', pivot: [TRAIN.fourth.x, Y_WHEEL, TRAIN.fourth.z], spin: 'fourthWheel', explode: [0, 30, 0] },
  { key: 'crownWheel', name: '大钢轮', pivot: [TRAIN.crownWheel.x, Y_BRIDGE + 3, TRAIN.crownWheel.z], spin: 'crownWheel', explode: [0, 66, 0] },
  { key: 'idleWheel', name: '过轮', pivot: [TRAIN.idle.x, Y_BRIDGE + 3, TRAIN.idle.z], spin: 'idleWheel', explode: [0, 60, 0] },
  { key: 'ratchet', name: '棘轮', pivot: [TRAIN.ratchet.x, Y_BRIDGE + 3, TRAIN.ratchet.z], spin: 'ratchet', explode: [0, 72, 0] },
  { key: 'click', name: '止逆爪', pivot: [TRAIN.ratchet.x + 16, Y_BRIDGE + 4, TRAIN.ratchet.z + 6], spin: 'click', explode: [0, 78, 0] },

  { key: 'barrelBridge', name: '发条盒夹板', pivot: [0, Y_BRIDGE, 0], explode: [0, 44, 0] },
  { key: 'trainBridge', name: '二轮夹板', pivot: [0, Y_BRIDGE, 0], explode: [0, 50, 0] },
  { key: 'thirdBridge', name: '三轮夹板', pivot: [0, Y_BRIDGE, 0], explode: [0, 56, 0] },

  { key: 'cageFrame', name: '陀飞轮框架', pivot: [CAGE.x, 52, CAGE.z], spin: 'cageFrame', explode: [0, 30, 0] },
  { key: 'cageTop', name: '笼框上桥', pivot: [CAGE.x, 52, CAGE.z], spin: 'cageFrame', explode: [0, 36, 0] },
  { key: 'balance', name: '摆轮', parent: 'cageFrame', pivot: [BAL.x, Y.bal, BAL.z], spin: 'balance', explode: [0, 42, 0] },
  { key: 'roller', name: '双盘式冲击轮', parent: 'cageFrame', pivot: [BAL.x, Y.bal - 4, BAL.z], spin: 'roller', explode: [0, 38, 0] },
  { key: 'escapeWheel', name: '擒纵轮', parent: 'cageFrame', pivot: [ESC.x, Y.esc, ESC.z], spin: 'escapeWheel', explode: [0, 48, 0] },
  { key: 'pallet', name: '杠杆', parent: 'cageFrame', pivot: [PAL.x, Y.pal, PAL.z], spin: 'pallet', explode: [0, 54, 0] },
  { key: 'tourbillonBridge', name: '陀飞轮桥板', pivot: [CAGE.x, Y_TOURB_BRIDGE, CAGE.z], explode: [0, 104, 0] },

  { key: 'dialRing', name: '镂空表盘', pivot: [0, Y_DIAL, 0], explode: [0, 118, 0] },
  { key: 'markers', name: '时标与字钉', pivot: [0, Y_DIAL, 0], explode: [0, 126, 0] },
  { key: 'prScale', name: '动力储存盘', pivot: [PR.x, Y_BRIDGE + 5, PR.z], explode: [0, 110, 0] },
  { key: 'handHour', name: '时针', pivot: [0, Y_HAND_HOUR, 0], spin: 'handHour', explode: [0, 150, 0] },
  { key: 'handMinute', name: '分针', pivot: [0, Y_HAND_MIN, 0], spin: 'handMinute', explode: [0, 140, 0] },
  { key: 'handPR', name: '动力针', pivot: [PR.x, Y_BRIDGE + 7, PR.z], spin: 'handPR', explode: [0, 132, 0] },
  { key: 'jewels', name: '红宝石轴承·黄金托', pivot: [0, 0, 0], explode: [0, 88, 0] },
  { key: 'screws', name: '蓝钢螺丝', pivot: [0, 0, 0], explode: [0, 94, 0] },
];

// 游丝呼吸态（独立小块网格），共享同一枢轴与父级
export const HS_STATES = 15;
for (let i = 0; i < HS_STATES; i++) {
  PARTS.push({
    key: 'hairspring' + i, name: '游丝·态' + i, state: i,
    parent: 'cageFrame', pivot: [BAL.x, Y.hs, BAL.z], spin: 'hairspring', explode: [0, 40, 0],
  });
}

export const PART_INDEX = new Map(PARTS.map((p, i) => [p.key, i]));
export const part = (key) => PARTS[PART_INDEX.get(key)];
export const pid = (key) => PART_INDEX.get(key);

// 传动表：由齿数比推出，不是随手填的周期。tools/accept-node.mjs 会验三条恒等式。
// 轮系：发条盒(96) → 中心小齿轮(12) → 中心轮(80) → 三轮小齿轮(8) → 三轮(60)
//       → 秒轮小齿轮(10) → 秒轮(60) → 擒纵小齿轮(6) → 擒纵轮(15)
//       笼框与秒轮同速（一分钟一周），笼框即秒针。
// 视觉简化：轮齿按「几齿并作一齿」雕刻（格宽不足以画下真实模数），
//   雕刻齿数见 TRAIN.*.teeth；运动学一律按本表真实齿数，见 design.md §4。
export const WHEELS = {
  barrel: { teeth: 96, pinion: 12 },
  center: { teeth: 80, pinion: 12 },
  third: { teeth: 60, pinion: 8 },
  fourth: { teeth: 60, pinion: 10 },
  escape: { teeth: ESC.teeth, pinion: 6 },
};

export const GEARING = (() => {
  const TAU = Math.PI * 2;
  const balanceHz = 2.5;                  // 18'000 A/h
  const beatsPerSec = balanceHz * 2;      // 一拍 = 半个周期
  const teethPerBeat = 0.5;               // 瑞士杠杆：一次全摆（两拍）推进一齿
  // 锚点：中心轮带分轮 → 精确一小时一周
  const centerRevSec = 3600;
  const thirdRevSec = centerRevSec * WHEELS.third.pinion / WHEELS.center.teeth;
  const fourthRevSec = thirdRevSec * WHEELS.fourth.pinion / WHEELS.third.teeth;
  const barrelRevSec = centerRevSec * WHEELS.barrel.teeth / WHEELS.center.pinion;
  const escapeRevSec = fourthRevSec * WHEELS.escape.pinion / WHEELS.fourth.teeth;
  return {
    balanceHz, beatsPerSec, teethPerBeat,
    escapeTeeth: ESC.teeth,
    cageRevSec: fourthRevSec,
    fourthRevSec, thirdRevSec, centerRevSec, barrelRevSec, escapeRevSec,
    hourRevSec: 12 * 3600,
    // 角速度（rad/s，符号 = three.js rotation.y 方向；负为从上方看顺时针）
    omega: {
      barrel: TAU / barrelRevSec,
      center: -TAU / centerRevSec,
      third: TAU / thirdRevSec,
      fourth: -TAU / fourthRevSec,
      cage: -TAU / fourthRevSec,
      escape: TAU / escapeRevSec,
      minute: -TAU / 3600,
      hour: -TAU / (12 * 3600),
    },
    powerReserveHours: 42,
    windingTurnsFull: 22,                 // 表冠转 22 圈上满（真实陀飞轮约 20-25）
  };
})();
;
