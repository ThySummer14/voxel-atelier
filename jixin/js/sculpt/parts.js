// 全部零件的体素生成。坐标一律用「世界坐标」，由 w() 平移到主网格下标。
// 每件写完都可被 tools/raster.mjs 秒级预览。

import {
  Vox, paint, cyl, cuboid, ellipsoid, capsule2d, gear, spokeWheel, escapeWheel,
  spiral, topTexture, anyTexture, edgeGlow, radialString, P, TAU, axCylX, gearX, EMPTY,
} from './grid.js';
import {
  GX, GY, GZ, CX, CZ, PARTS, pid, TRAIN, CAGE, BAL, ESC, PAL as PALPOS, HS, PR,
  R_CASE_OUT, R_CASE_IN, Y_CASE_BOT, Y_CASE_TOP, Y_BEZEL_BOT, Y_BEZEL_TOP,
  R_BEZEL_OUT, R_BEZEL_IN, N_FLUTE, Y_REHAUT_BOT, Y_REHAUT_TOP, R_MOVE,
  Y_PLATE, Y_PLATE_TOP, Y_WHEEL, Y_BRIDGE, Y_TOURB_BRIDGE, Y_TOURB_BRIDGE_TOP,
  Y_DIAL, R_DIAL_IN, R_DIAL_OUT, R_MIN_TRACK, Y_HAND_MIN, Y_HAND_HOUR, LEN_MIN, LEN_HOUR, HS_STATES,
} from './spec.js';

const X = (x) => x + CX;
const Z = (z) => z + CZ;
const ALT = { bal: Y_WHEEL + 3, esc: Y_WHEEL - 1, pal: Y_WHEEL + 1, hs: Y_WHEEL + 7, cageTop: Y_WHEEL + 11 };
const rnd = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

// —— 明度选择器 ——
const bandY = (step = 4) => (x, y) => P('gilt', Math.floor(y / step) % 4);
const ramp = (t) => (t < 0.5 ? 1 + Math.round(t * 4) : 3 - Math.round((t - 0.5) * 4));

export function buildScene(opts = {}) {
  const v = new Vox(GX, GY, GZ);  const only = opts.only ? new Set(opts.only) : null;
  const has = (k) => !only || only.has(k);
  const t0 = Date.now();
  const log = [];
  const step = (name, fn) => {
    if (only && !only.has(name)) return;
    const a = Date.now();
    fn();
    log.push([name, Date.now() - a, v.filled]);
  };

  // ══════════ 大漆器座 ══════════
  step('plinth', () => {
    const id = pid('plinth');
    const S = 130;                       // 半宽（世界）
    cuboid(v, X(-S), X(S), 5, 27, Z(-S), Z(S), id, () => P('lacquer', 1));
    // 底足
    cyl(v, X(0), Z(0), 0, S - 3, 0, 5, id, () => P('lacquerBody', 1));
    // 束腰 + 顶出檐
    cuboid(v, X(-S - 2), X(S + 2), 28, 29, Z(-S - 2), Z(S + 2), id, () => P('lacquer', 2));
    cuboid(v, X(-S - 1), X(S + 1), 30, 33, Z(-S - 1), Z(S + 1), id, () => P('lacquer', 2));
    // 四面壶门（透雕拱券）
    const carveArch = (u, y) => {
      const au = Math.abs(u);
      if (au > 44 || y < 7) return false;
      if (y <= 15) return true;
      return y <= 15 + Math.sqrt(Math.max(0, 44 * 44 - au * au)) * 0.42 && y <= 24;
    };
    for (let y = 0; y < 34; y++) {
      for (let u = -46; u <= 46; u++) {
        if (!carveArch(u, y)) continue;
        for (let d = -S - 4; d <= S + 4; d++) {
          v.carve(X(d), y, Z(u));
          v.carve(X(u), y, Z(d));
        }
      }
    }
    // 顶面：漆纹 + 描金双线 + 鎏金碎片
    topTexture(v, id, (x, y, z) => {
      const m = Math.max(Math.abs(x - CX), Math.abs(z - CZ));
      const t0 = rnd(x * 1.1, z * 1.1);
      if (m > 120) return P('lacquer', t0 > 0.9 ? 3 : t0 > 0.55 ? 2 : 1);
      if (m >= 118 && m <= 119) return P('goldLine', 3);
      if (m >= 114 && m <= 114) return P('goldLine', 2);
      const t = rnd(x * 2.1, z * 2.7);
      if (t > 0.99965) return P('goldLine', 3);
      return -1;
    });
    // 承托圈（腕表落座处压出的浅痕）
    topTexture(v, id, (x, y, z) => {
      const r = Math.hypot(x - CX, z - CZ);
      if (r > 106 || r < 96) return -1;
      return P('lacquer', 0);
    });
  });

  // ══════════ 表壳 ══════════
  step('caseBand', () => {
    const id = pid('caseBand');
    for (let y = Y_CASE_BOT; y <= Y_CASE_TOP; y++) {
      const t = (y - Y_CASE_BOT) / (Y_CASE_TOP - Y_CASE_BOT);
      const ro = R_CASE_OUT - 1 + t * 1.5;
      const ri = R_CASE_IN + 2 - t * 2;
      cyl(v, X(0), Z(0), ri, ro, y, y, id, (x, yy, z) => {
        const a = Math.atan2(x - CX, -(z - CZ));
        // 抛光壳身：三道宽反射 + 极细拉丝
        const s = Math.sin(a * 3 + 0.6) * 0.94 + Math.sin(a * 220) * 0.06;
        return P('steel', s > 0.62 ? 3 : s > 0.12 ? 2 : s > -0.5 ? 1 : 0);
      });
    }
    // 表耳：四只，沿径向斜出、末端下弯
    const lugAt = (ang) => {
      const id2 = id;
      const ex = Math.sin(ang), ez = -Math.cos(ang);
      const tx = Math.cos(ang), tz = Math.sin(ang);
      paint(v, X(-135), X(135), Y_CASE_BOT + 2, 62, Z(-135), Z(135), id2, (x, y, z) => {
        const dx = x - CX, dz = z - CZ;
        const r = dx * ex + dz * ez;
        const u = Math.abs(dx * tx + dz * tz);
        if (r < 70 || r > 119) return -1;
        const t = (r - 70) / 49;
        const w = 9.6 - 3.0 * t * t;
        if (u > w) return -1;
        const top = 60 - 9.5 * t * t;
        const bot = 43 - 9 * Math.max(0, t - 0.35) * 1.7;
        if (y > top || y < bot) return -1;
        const s = u / w;                       // 侧面圆脊
        if (s > 0.86) return P('gilt', 0);
        return P('gilt', y > top - 1.2 ? 3 : y > top - 4 ? 2 : 1);
      });
    };
    for (const a of [34 * TAU / 360, 326 * TAU / 360, 146 * TAU / 360, 214 * TAU / 360]) lugAt(a);
    // 生耳（连接两耳的细轴）
    for (const a of [30 * TAU / 360, 150 * TAU / 360, 210 * TAU / 360, 330 * TAU / 360]) {
      const ex = Math.sin(a), ez = -Math.cos(a), tx = Math.cos(a), tz = Math.sin(a);
      const cx = ex * 113, cz = ez * 113;
      paint(v, X(cx - 14), X(cx + 14), 44, 47, Z(cz - 14), Z(cz + 14), id, (x, y, z) => {
        const u = (x - CX - cx) * tx + (z - CZ - cz) * tz;
        if (Math.abs(u) > 11.5) return -1;
        const d = Math.hypot(y - 45.5, (x - CX - cx) * ex + (z - CZ - cz) * ez - 118);
        return d < 2.4 ? P('steel', 2) : -1;
      });
    }
  });

  step('caseBack', () => {
    const id = pid('caseBack');
    cyl(v, X(0), Z(0), 0, R_CASE_OUT - 2, Y_CASE_BOT, Y_CASE_BOT + 3, id, () => P('ancelle', 2));
    cyl(v, X(0), Z(0), 0, R_CASE_OUT, Y_CASE_BOT + 1, Y_CASE_BOT + 3, id, () => P('gilt', 1));
    cyl(v, X(0), Z(0), 86, R_CASE_OUT - 1, Y_CASE_BOT, Y_CASE_BOT + 5, id, () => P('gilt', 2));
  });

  step('bezel', () => {
    const id = pid('bezel');
    paint(v, X(-R_BEZEL_OUT - 1), X(R_BEZEL_OUT + 1), Y_BEZEL_BOT, Y_BEZEL_TOP + 1,
      Z(-R_BEZEL_OUT - 1), Z(R_BEZEL_OUT + 1), id, (x, y, z) => {
        const dx = x - CX, dz = z - CZ;
        const r = Math.hypot(dx, dz);
        if (r > R_BEZEL_OUT || r < R_BEZEL_IN) return -1;
        const a = Math.atan2(dx, -dz);
        // 抛光斜面：外高内低，三级台阶（体素倒角），侧壁细拉丝
        const top = Y_BEZEL_TOP - (r > 95 ? 0 : r > 91.5 ? 1 : 2);
        if (y > top || y < Y_BEZEL_BOT) return -1;
        if (y === top) {
          const brush = Math.sin(a * 150) > 0.55 ? 1 : 0;
          return P('gilt', r > 98 ? 3 : r > 94 ? 2 + brush : 1);
        }
        const band = Math.sin(a * 3 - 0.7) * 0.86 + Math.sin(a * 60) * 0.14;
        return P('gilt', y >= top - 1 ? (band > 0.35 ? 3 : 2) : band > 0.1 ? 2 : 1);
      });
    // 内圈压边
    cyl(v, X(0), Z(0), R_BEZEL_IN - 1.5, R_BEZEL_IN + 1, Y_BEZEL_BOT - 3, Y_BEZEL_BOT + 2, id, () => P('gilt', 1));
  });

  step('rehaut', () => {
    const id = pid('rehaut');
    cyl(v, X(0), Z(0), R_CASE_IN - 1, R_CASE_IN + 2, Y_REHAUT_BOT, Y_REHAUT_TOP, id, (x, y, z) => {
      const a = Math.atan2(x - CX, -(z - CZ));
      const s = Math.sin(a * 3 + 2.1) * 0.85 + Math.sin(a * 90) * 0.15;
      return P('gilt', s > 0.5 ? 3 : s > 0 ? 2 : s > -0.55 ? 1 : 0);
    });
  });

  step('crown', () => {
    const id = pid('crown');
    gearX(v, 52, CZ, 9.4, 11.4, 26, X(101), X(116), id, (x, y, z) => {
      const a = Math.atan2(z - CZ, y - 52);
      const tip = Math.abs(x - CX - 108);
      const s = Math.sin(a * 26);
      return P('gilt', s > 0.2 ? (tip > 6 ? 2 : 3) : tip > 6 ? 0 : 1);
    });
    axCylX(v, 52, CZ, 0, 6.4, X(116), X(118), id, () => P('gilt', 2));
    axCylX(v, 52, CZ, 5.5, 8.6, X(96), X(101), id, () => P('gilt', 1));   // 护桥/轴套
    const id2 = pid('onyx');
    paint(v, X(118), X(125), 43, 61, Z(-10), Z(10), id2, (x, y, z) => {
      const r = Math.hypot(y - 52, z - CZ);
      const cap = 1 - Math.max(0, (x - CX - 119) / 5.2) ** 2;
      if (r > 8.4 * Math.sqrt(Math.max(0.05, cap))) return -1;
      return P('onyx', r < 2.6 ? 3 : r < 4.8 ? 2 : r < 6.6 ? 1 : 0);
    });
    const id3 = pid('stem');
    axCylX(v, 52, CZ, 0, 3.4, X(84), X(101), id3, () => P('steel', 2));
    gearX(v, 52, CZ, 4.2, 6.4, 11, X(88), X(96), id3, (x, y, z) => {
      const a = Math.atan2(z - CZ, y - 52);
      return P('steel', Math.sin(a * 11) > 0 ? 2 : 1);
    });
  });

  // ══════════ 主夹板：鱼鳞纹 + 开窗 ══════════
  step('mainPlate', () => {
    const id = pid('mainPlate');
    cyl(v, X(0), Z(0), 0, R_MOVE, Y_PLATE, Y_PLATE_TOP, id, (x, y) => P('maillechort', y === Y_PLATE ? 1 : 2));
    // 外缘波浪（拱形开窗边）
    paint(v, X(-R_MOVE), X(R_MOVE), Y_PLATE, Y_PLATE_TOP, Z(-R_MOVE), Z(R_MOVE), id, (x, y, z) => {
      const r = Math.hypot(x - CX, z - CZ);
      const a = Math.atan2(x - CX, -(z - CZ));
      const rr = R_MOVE - 2.5 + Math.sin(a * 12) * 2.2;
      if (r > rr) return -1;
      return P('maillechort', y === Y_PLATE ? 1 : 2);
    });
    // 轮系开窗
    const holes = [
      [TRAIN.barrel.x, TRAIN.barrel.z, 30], [0, 0, 13], [TRAIN.third.x, TRAIN.third.z, 12],
      [CAGE.x, CAGE.z, 37], [TRAIN.crownWheel.x, TRAIN.crownWheel.z, 15], [TRAIN.idle.x, TRAIN.idle.z, 12],
      [-62, 26, 11], [56, 34, 10], [-58, -52, 12], [26, -54, 12], [66, -8, 9], [-14, 66, 9],
    ];
    for (const [hx, hz, hr] of holes) {
      paint(v, X(hx - hr - 1), X(hx + hr + 1), Y_PLATE - 1, Y_PLATE_TOP + 1,
        Z(hz - hr - 1), Z(hz + hr + 1), id, (x, y, z) => {
          if (Math.hypot(x - CX - hx, z - CZ - hz) <= hr - 0.4) return EMPTY;
          return -1;
        });
    }
    // 鱼鳞纹（顶面重叠圆弧，低反差）
    topTexture(v, id, (x, y, z) => {
      const s = 5;
      const row = Math.round((z - CZ) / s);
      const ox = (Math.abs(row) % 2) * s / 2;
      const bx = Math.round((x - CX - ox) / s) * s + ox;
      const bz = row * s;
      const d = Math.hypot(x - CX - bx, (z - CZ) - bz);
      if (d > 3.4) return P('maillechort', 1);
      if (d > 2.6) return P('maillechort', 2);
      if (d > 1.4) return P('maillechort', 2);
      return P('maillechort', 1);
    });
    edgeGlow(v, id, P('rhodium', 3), 1);
  });

  // ══════════ 轮系 ══════════
  const wheelPal = (key) => (x, y, z) => {
    const r = Math.hypot(x - CX - key[0], z - CZ - key[1]);
    const a = Math.atan2(x - CX - key[0], -(z - CZ - key[1]));
    const s = Math.sin(a * 24 + r * 0.3);
    return P('gilt', s > 0.5 ? 3 : s > -0.2 ? 2 : s > -0.8 ? 1 : 0);
  };

  step('barrel', () => {
    const id = pid('barrel');
    const { x: bx, z: bz, rTip, rRoot, teeth } = TRAIN.barrel;
    gear(v, X(bx), Z(bz), rRoot - 1, rRoot, rTip, teeth, Y_WHEEL, Y_WHEEL + 5, id, wheelPal([bx, bz]));
    // 盒身（发条盒鼓）
    cyl(v, X(bx), Z(bz), rRoot - 3.2, rRoot - 0.2, Y_WHEEL - 1, Y_WHEEL + 6, id, (x, y, z) => {
      const a = Math.atan2(x - CX - bx, -(z - CZ - bz));
      return P('gilt', Math.sin(a * 40) > 0 ? 2 : 1);
    });
    // 盒盖 + 大窗，露出筒状发条
    paint(v, X(bx - rRoot), X(bx + rRoot), Y_WHEEL + 6, Y_WHEEL + 7, Z(bz - rRoot), Z(bz + rRoot), id, (x, y, z) => {
      const r = Math.hypot(x - CX - bx, z - CZ - bz);
      if (r > rRoot - 0.4) return -1;
      if (r < 20.5) return y === Y_WHEEL + 6 ? P('steel', 1) : -1;   // 窗内让出发条
      return wheelPal([bx, bz])(x, y, z);
    });
    // 筒状发条（厚螺旋）
    spiral(v, X(bx), Z(bz), 5.2, (19.6 - 5.2) / (6 * TAU), 6, 1.6, Y_WHEEL + 1, Y_WHEEL + 6, id,
      (x, y, z) => P('steel', y === Y_WHEEL + 6 ? 3 : y === Y_WHEEL + 5 ? 2 : y > Y_WHEEL + 2 ? 1 : 0), 0);
    // 条轴
    cyl(v, X(bx), Z(bz), 0, 3.2, Y_WHEEL - 2, Y_WHEEL + 9, id, () => P('steel', 2));
    edgeGlow(v, id, P('gilt', 3), 1);
  });

  const trainWheel = (key, spec, y0, th, spokes, pal) => {
    step(key, () => {
      const id = pid(key);
      spokeWheel(v, X(spec.x), Z(spec.z), spec.rTip, spec.teeth, spec.rTip * 0.22, spokes,
        y0, y0 + th, id, pal ?? wheelPal([spec.x, spec.z]),
        { band: 4, tooth: spec.rTip - spec.rRoot, pinion: spec.rTip * 0.2, pinionDepth: 4, arbor: 1.6 });
      edgeGlow(v, id, P('gilt', 3), 2);
    });
  };
  trainWheel('centerWheel', TRAIN.center, Y_WHEEL, 4, 5, wheelPal([0, 0]));
  trainWheel('thirdWheel', TRAIN.third, Y_WHEEL, 4, 4, wheelPal([TRAIN.third.x, TRAIN.third.z]));
  trainWheel('fourthWheel', TRAIN.fourth, Y_WHEEL - 3, 3, 4, wheelPal([CAGE.x, CAGE.z]));

  // 上轮系（表冠侧，露在夹板之上供观赏）
  trainWheel('crownWheel', TRAIN.crownWheel, Y_BRIDGE + 2, 3, 5, (x, y, z) => {
    const r = Math.hypot(x - CX - TRAIN.crownWheel.x, z - CZ - TRAIN.crownWheel.z);
    return P('gilt', r > 11.5 ? 3 : (x + z) % 3 === 0 ? 1 : 2);
  });
  trainWheel('idleWheel', TRAIN.idle, Y_BRIDGE + 2, 3, 4, wheelPal([TRAIN.idle.x, TRAIN.idle.z]));
  step('ratchet', () => {
    const id = pid('ratchet');
    const { x, z, rTip, rRoot, teeth } = TRAIN.ratchet;
    gear(v, X(x), Z(z), rRoot - 1, rRoot, rTip, teeth, Y_BRIDGE + 2, Y_BRIDGE + 4, id, (xx, yy, zz) => {
      const a = Math.atan2(xx - CX - x, -(zz - CZ - z));
      return P('gilt', Math.sin(a * teeth) > 0.4 ? 3 : Math.sin(a * teeth) > -0.4 ? 2 : 1);
    });
    cyl(v, X(x), Z(z), 0, 6, Y_BRIDGE + 2, Y_BRIDGE + 5, id, () => P('gilt', 2));
    edgeGlow(v, id, P('gilt', 3), 1);
  });
  step('click', () => {
    const id = pid('click');
    const { x, z, rTip } = TRAIN.ratchet;
    const a0 = 0.62;
    const sx = x + Math.sin(a0) * (rTip + 3), sz = z - Math.cos(a0) * (rTip + 3);
    capsule2d(v, X(sx), Z(sz), X(sx + Math.sin(a0) * 9), Z(sz - Math.cos(a0) * 9), 3.4,
      Y_BRIDGE + 3, Y_BRIDGE + 5, id, () => P('blued', 2));
    cyl(v, X(sx + Math.sin(a0) * 9), Z(sz - Math.cos(a0) * 9), 0, 2.2, Y_BRIDGE + 2, Y_BRIDGE + 6, id, () => P('steel', 2));
  });

  // ══════════ 夹板：日内瓦条纹 + 倒角 ══════════
  const stripes = (x, y, z) => {
    const t = (((x + z * 0.62) % 8) + 8) % 8 / 8;
    return P('rhodium', Math.round(ramp(t) * 0.66));
  };
  const bridgeMask = (bx, bz) => {
    const dx = bx - CX, dz = bz - CZ;
    const inBarrelZone = Math.hypot(dx - TRAIN.barrel.x, dz - TRAIN.barrel.z) < 34;
    const arm = Math.abs(dz + 42) < 15 && dx > -52 && dx < 24;
    const arm2 = Math.abs(dx - (-56)) < 13 && dz > -56 && dz < 6;
    return { keep: inBarrelZone || arm || arm2 };
  };
  step('barrelBridge', () => {
    const id = pid('barrelBridge');
    paint(v, X(-76), X(40), Y_BRIDGE, Y_BRIDGE + 4, Z(-64), Z(16), id, (x, y, z) => {
      const { keep } = bridgeMask(x, z);
      if (!keep) return -1;
      const r = Math.hypot(x - CX - TRAIN.barrel.x, z - CZ - TRAIN.barrel.z);
      if (r < 30.5) {                        // 大窗：露出发条盒
        if (r > 29) return P('rhodium', 3);   // 窗口倒角
        return -1;
      }
      return y === Y_BRIDGE + 4 ? stripes(x, y, z) : P('rhodium', 0);
    });
    edgeGlow(v, id, P('rhodium', 3), 1);
  });
  step('trainBridge', () => {
    const id = pid('trainBridge');
    paint(v, X(-24), X(44), Y_BRIDGE, Y_BRIDGE + 4, Z(-26), Z(20), id, (x, y, z) => {
      const dx = x - CX, dz = z - CZ;
      const nearCenter = Math.hypot(dx, dz) < 21;
      const nearThird = Math.hypot(dx - TRAIN.third.x, dz - TRAIN.third.z) < 19;
      const band = dz > -14 && dx > -6 && dx < 40;
      if (!(nearCenter || nearThird || band)) return -1;
      if (nearCenter && Math.hypot(dx, dz) < 17) return Math.hypot(dx, dz) > 15.6 ? P('rhodium', 3) : -1;
      if (nearThird && Math.hypot(dx - TRAIN.third.x, dz - TRAIN.third.z) < 14.5) {
        return Math.hypot(dx - TRAIN.third.x, dz - TRAIN.third.z) > 13.2 ? P('rhodium', 3) : -1;
      }
      return y === Y_BRIDGE + 4 ? stripes(x, y, z) : P('rhodium', 0);
    });
    edgeGlow(v, id, P('rhodium', 3), 1);
  });
  step('thirdBridge', () => {
    const id = pid('thirdBridge');
    const { x, z } = TRAIN.third;
    // 从主夹板边缘伸向三轮的细臂
    paint(v, X(x - 4), X(x + 20), Y_BRIDGE + 4, Y_BRIDGE + 6, Z(z - 16), Z(z + 16), id, (bx, y, bz) => {
      const dx = bx - CX - x, dz = bz - CZ - z;
      const r = Math.hypot(dx, dz);
      if (r < 6.2 && r > 4.2) return P('steel', 3);
      if (r < 6.2) return -1;
      const along = dx * 0.8 + dz * 0.6, perp = -dx * 0.6 + dz * 0.8;
      if (along > -2 && along < 20 && Math.abs(perp) < 3.4) return P('steel', Math.abs(perp) > 2.4 ? 3 : y === Y_BRIDGE + 6 ? 2 : 1);
      return -1;
    });
  });

  // ══════════ 陀飞轮 ══════════
  step('cageFrame', () => {
    const id = pid('cageFrame');
    const { x, z, r, rIn } = CAGE;
    // 下盘：三环 + 三臂
    cyl(v, X(x), Z(z), 0, r, Y_WHEEL - 4, Y_WHEEL - 3, id, (bx, y, bz) => {
      const rr = Math.hypot(bx - CX - x, bz - CZ - z);
      if (rr > rIn) return P('gilt', 0);
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      const arms = Math.abs(((a / (TAU / 3)) % 1) - 0.5) < 0.13;
      if (rr < 6 || arms) return P('gilt', 2);
      return -1;
      void y;
    });
    // 外框壁 + 轮圈齿（笼框外缘细齿）
    cyl(v, X(x), Z(z), r - 1.8, r, Y_WHEEL - 2, Y_WHEEL + 8, id, (bx, y, bz) => {
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      const open = Math.abs(((a / (TAU / 3)) % 1) - 0.5) < 0.19;   // 三处开窗露出轮系
      return open ? -1 : P('gilt', Math.abs(a % 0.5) < 0.25 ? 3 : 2);
    });
    // 上缘环
    cyl(v, X(x), Z(z), r - 5, r, Y_WHEEL + 8, Y_WHEEL + 10, id, (bx, y, bz) => {
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      const arm = Math.abs(((a / (TAU / 3)) % 1) - 0.5) < 0.2;
      return arm ? -1 : P('gilt', y === Y_WHEEL + 10 ? 3 : 2);
    });
    // 立柱
    for (let k = 0; k < 3; k++) {
      const a = k * TAU / 3 + 0.5;
      const px = x + Math.sin(a) * (r - 2.6), pz = z - Math.cos(a) * (r - 2.6);
      cyl(v, X(px), Z(pz), 0, 2.6, Y_WHEEL - 3, Y_WHEEL + 10, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - px, bz - CZ - pz);
        return P('gilt', d < 1 ? 3 : y > Y_WHEEL + 6 ? 3 : 2);
      });
    }
    edgeGlow(v, id, P('gilt', 3), 1);
  });

  step('cageTop', () => {
    const id = pid('cageTop');
    const { x, z } = CAGE;
    // 摆轮上桥（随笼框转）：横跨摆轮中心
    const ba = Math.atan2(BAL.x - x, -(BAL.z - z));
    paint(v, X(x - CAGE.r), X(x + CAGE.r), Y_WHEEL + 11, Y_WHEEL + 13, Z(z - CAGE.r), Z(z + CAGE.r), id, (bx, y, bz) => {
      const dx = bx - CX - x, dz = bz - CZ - z;
      const along = dx * Math.sin(ba) - dz * Math.cos(ba);
      const perp = dx * Math.cos(ba) + dz * Math.sin(ba);
      if (Math.abs(perp) > 4.2) return -1;
      if (along < -8 || along > CAGE.r - 2) return -1;
      const t = Math.abs(perp) / 4.2;
      return P('gilt', y === Y_WHEEL + 13 ? (t > 0.7 ? 1 : 3) : 2);
    });
    cyl(v, X(BAL.x), Z(BAL.z), 0, 3.4, Y_WHEEL + 11, Y_WHEEL + 14, id, () => P('gilt', 3));
  });

  step('balance', () => {
    const id = pid('balance');
    const { x, z, rRoot, rRim } = BAL;
    const y0 = Y_WHEEL + 3, y1 = Y_WHEEL + 6;
    cyl(v, X(x), Z(z), rRoot, rRim, y0, y1, id, (bx, y, bz) => {
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      return P('gilt', Math.cos(a * 4) > 0 ? 3 : 2);
    });
    for (let k = 0; k < 4; k++) {
      const a = k * TAU / 4 + 0.35;
      capsule2d(v, X(x), Z(z), X(x + Math.sin(a) * rRoot), Z(z - Math.cos(a) * rRoot), 1.7, y0 + 1, y1 - 1, id, () => P('gilt', 2));
    }
    cyl(v, X(x), Z(z), 0, 2.2, y0 - 4, y1 + 3, id, () => P('steel', 2));
    // 惯量螺钉（轮缘上凸出的小金钉）
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8 + 0.2;
      const px = x + Math.sin(a) * (rRim + 1.4), pz = z - Math.cos(a) * (rRim + 1.4);
      cyl(v, X(px), Z(pz), 0, 1.7, y0, y1, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - px, bz - CZ - pz);
        return P('roseGold', d < 0.8 ? 3 : y === y1 ? 3 : 1);
      });
    }
  });

  step('roller', () => {
    const id = pid('roller');
    const { x, z } = BAL;
    const y0 = Y_WHEEL - 1, y1 = Y_WHEEL + 1;
    cyl(v, X(x), Z(z), 3.6, 7.2, y0, y1, id, (bx, y, bz) => {
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      const notch = Math.abs(((a / (TAU / 3)) % 1) - 0.5) < 0.1;
      return notch ? -1 : P('rhodium', y === y1 ? 3 : 1);
    });
    // 冲击销
    const px = x + 5.6, pz = z;
    cyl(v, X(px), Z(pz), 0, 1.5, y0 - 1, y1 + 1, id, () => P('ruby', 2));
    cyl(v, X(x), Z(z), 0, 2, y0 - 2, y1 + 2, id, () => P('steel', 1));
  });

  step('escapeWheel', () => {
    const id = pid('escapeWheel');
    escapeWheel(v, X(ESC.x), Z(ESC.z), ESC.rRoot, ESC.rTip, ESC.teeth, Y_WHEEL - 1, Y_WHEEL + 2, id,
      (x, y, z) => {
        const d = Math.hypot(x - CX - ESC.x, z - CZ - ESC.z);
        return P('rhodium', d > 9 ? 3 : y === Y_WHEEL + 2 ? 3 : 2);
      });
  });

  step('pallet', () => {
    const id = pid('pallet');
    const { x, z } = PALPOS;
    const y0 = Y_WHEEL + 1, y1 = Y_WHEEL + 3;
    // 杠杆本体：朝摆轮一侧分叉成两瓦（进瓦/出瓦在擒纵轮一侧）
    capsule2d(v, X(x), Z(z), X(x), Z(z + 10), 2.0, y0, y1, id, () => P('steel', 2));
    capsule2d(v, X(x), Z(z), X(x - 3.6), Z(z - 8), 1.6, y0, y1, id, () => P('steel', 1));
    capsule2d(v, X(x), Z(z), X(x + 3.6), Z(z - 8), 1.6, y0, y1, id, () => P('steel', 1));
    // 叉头
    capsule2d(v, X(x - 2.4), Z(z - 8), X(x + 2.4), Z(z - 8), 1.8, y0, y1, id, () => P('steel', 2));
    // 红宝石瓦
    for (const [sx, sz] of [[x - 2.2, z + 11.5], [x + 2.2, z + 13.5]]) {
      cyl(v, X(sx), Z(sz), 0, 1.8, y0 - 1, y1 + 1, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - sx, bz - CZ - sz);
        return P('ruby', d < 0.9 ? 3 : y === y1 + 1 ? 3 : 2);
      });
    }
    cyl(v, X(x), Z(z), 0, 1.6, y0 - 3, y1 + 3, id, () => P('steel', 1));
  });

  step('tourbillonBridge', () => {
    const id = pid('tourbillonBridge');
    const { x, z } = CAGE;
    // 从主夹板边缘伸向笼框中心的一整条抛光桥板
    paint(v, X(x - 9), X(x + 9), Y_TOURB_BRIDGE, Y_TOURB_BRIDGE + 3, Z(z - 4), Z(R_MOVE + 3), id,
      (bx, y, bz) => {
        const dz = bz - CZ, dx = bx - CX - x;
        if (dz < z) {                          // 内端圆头（轴承位）
          const r = Math.hypot(dx, dz - z);
          if (r > 5.6) return -1;
          return P('gilt', r < 2.2 ? 3 : y === Y_TOURB_BRIDGE + 3 ? 2 : 1);
        }
        const t = (dz - z) / (R_MOVE + 3 - z);
        const w = 4.2 - 1.1 * t;
        if (Math.abs(dx) > w) return -1;
        const edge = Math.abs(dx) > w - 0.9;
        return P('gilt', edge || y === Y_TOURB_BRIDGE + 3 ? 3 : y === Y_TOURB_BRIDGE ? 0 : 1);
      });
    edgeGlow(v, id, P('gilt', 3), 1);
  });

  // 游丝：7 个呼吸态，各自独立小块网格（浏览器端逐帧切换）；预览可内嵌进主网格
  const drawHairspring = (target, gx, gz, yBase, psi, id) => {
    spiral(target, gx, gz, HS.a0, (HS.rMax - HS.a0) / (HS.turns * TAU), HS.turns, 2.05,
      yBase, yBase + 1, id, (x, y, z) => {
        const d = Math.hypot(x - gx, z - gz);
        return P('blued', y === yBase + 1 ? (d > 13 ? 3 : 2) : 1);
      }, psi);
    cuboid(target, gx - 2, gx + 2, yBase - 1, yBase + 2, gz - 2, gz + 2, id, () => P('steel', 2));
    const ex = gx + HS.rMax * Math.sin(2.4), ez = gz - HS.rMax * Math.cos(2.4);
    cuboid(target, ex - 2, ex + 2, yBase - 1, yBase + 2, ez - 2, ez + 2, id, () => P('steel', 1));
  };
  const hsStates = [];
  for (let i = 0; i < HS_STATES; i++) {
    const size = 46;
    const sv = new Vox(size, 6, size);
    const id = pid('hairspring' + i);
    const psi = (i / (HS_STATES - 1) - 0.5) * 1.7;
    drawHairspring(sv, size / 2, size / 2, 1, psi, id);
    hsStates.push({ v: sv, sx: BAL.x - size / 2, sy: ALT.hs - 1, sz: BAL.z - size / 2, state: i, id });
  }
  if (opts.embedHairspring) {
    drawHairspring(v, X(BAL.x), Z(BAL.z), ALT.hs, 0, pid('hairspring0'));
  }

  // ══════════ 镂空表盘：黑漆底 + 描金轨道 + 立体字钉 ══════════
  step('dialRing', () => {
    const id = pid('dialRing');
    paint(v, X(-R_DIAL_OUT - 1), X(R_DIAL_OUT + 1), Y_DIAL, Y_DIAL + 2,
      Z(-R_DIAL_OUT - 1), Z(R_DIAL_OUT + 1), id, (x, y, z) => {
        const r = Math.hypot(x - CX, z - CZ);
        if (r > R_DIAL_OUT || r < R_DIAL_IN) return -1;
        if (r > R_DIAL_OUT - 1.6) return P('gilt', y === Y_DIAL + 2 ? 3 : 1);   // 外沿金边
        if (y < Y_DIAL + 2) return P('lacquer', 0);
        const t = rnd(x * 1.7, z * 1.9);
        return P('lacquer', t > 0.86 ? 2 : t > 0.4 ? 1 : 0);                     // 漆面微起伏
      });
    // 分钟轨道：金线两道 + 刻度
    topTexture(v, id, (x, y, z) => {
      const r = Math.hypot(x - CX, z - CZ);
      const a = Math.atan2(x - CX, -(z - CZ));
      let aa = a < 0 ? a + TAU : a;
      if (Math.abs(r - 90) < 0.6) return P('goldLine', 3);
      if (Math.abs(r - 84.5) < 0.6) return P('goldLine', 2);
      if (r > 88 && r < 91.2) {
        const m = aa / (TAU / 60);
        const mt = Math.abs((m % 1) - 0.5);
        const is5 = Math.abs(((m / 5) % 1) - 0.5) < 0.06;
        if (mt < 0.055) return P('goldLine', is5 ? 3 : 2);
        if (is5 && r < 89.6) return P('goldLine', 3);
        return -1;
      }
      return -1;
    });
    // 12 / 3 / 6 / 9 立体字钉（金壳 + 夜光芯）
    for (const [txt, ang] of [['12', 0], ['3', TAU / 4], ['6', TAU / 2], ['9', 3 * TAU / 4]]) {
      radialString(v, X(0), Z(0), 78.5, ang, txt, 1.6, Y_DIAL + 3, id, P('gilt', 3));
    }
  });

  step('markers', () => {
    const id = pid('markers');
    for (let h = 0; h < 12; h++) {
      if (h % 3 === 0) continue;                 // 四位由字钉占
      const a = h * TAU / 12;
      const rx = Math.sin(a), rz = -Math.cos(a);
      const tx = Math.cos(a), tz = Math.sin(a);
      for (let d = -7; d <= 7; d++) {
        for (let e = -1; e <= 1; e++) {
          const rr = 79 + d;
          const cx2 = rx * rr + tx * e, cz2 = rz * rr + tz * e;
          cuboid(v, X(cx2), X(cx2), Y_DIAL + 3, Y_DIAL + 4, Z(cz2), Z(cz2), id,
            (bx, y) => (Math.abs(e) === 1 ? P('gilt', y === Y_DIAL + 4 ? 3 : 1) : P('lume', y === Y_DIAL + 4 ? 3 : 2)));
        }
      }
    }
  });

  step('prScale', () => {
    const id = pid('prScale');
    const { x, z, r } = PR;
    cyl(v, X(x), Z(z), 0, r, Y_BRIDGE + 4, Y_BRIDGE + 5, id, (bx, y, bz) => {
      const d = Math.hypot(bx - CX - x, bz - CZ - z);
      if (d > r - 1.6) return P('gilt', y === Y_BRIDGE + 5 ? 3 : 1);
      return P('enamel', y === Y_BRIDGE + 5 ? 3 : 2);
    });
    topTexture(v, id, (bx, y, bz) => {
      const d = Math.hypot(bx - CX - x, bz - CZ - z);
      if (d > r - 1.4 || d < 3) return -1;
      const a = Math.atan2(bx - CX - x, -(bz - CZ - z));
      let aa = (a + TAU * 1.5) % TAU;
      const t = aa / TAU;
      const tick = Math.abs((t * 9) % 1 - 0.5);
      const span = t > 0.62 && t < 0.88;
      if (!span) return -1;
      if (tick < 0.05 && d > r - 4.6) return P('ancelle', 3);
      if (tick < 0.09 && d > r - 3.4) return P('ancelle', 2);
      return -1;
    });
  });

  // ══════════ 指针：蓝钢柳叶针 + 夜光 ══════════
  /**
   * leaf=true → 桃形（柳叶）时针：椭圆身 + 尖头 + 夜光填充
   * leaf=false → 秒/分细针：锥形 + 夜光小菱形
   */
  const handShape = (id, len, y, w, tail, leaf) => {
    paint(v, X(-w - 3), X(w + 3), y, y + 1, Z(-len - 2), Z(tail + 2), id, (x, yy, z) => {
      const dx = x - CX, dz = z - CZ;
      const along = -dz, t = along / len;
      let hw;
      if (along >= 0) {
        if (t > 1) return -1;
        if (leaf) {
          if (t < 0.10) hw = 1.7;
          else if (t < 0.80) {
            const e = (t - 0.45) / 0.35;
            hw = w * Math.sqrt(Math.max(0, 1 - e * e));
          } else hw = Math.max(0.6, w * 0.62 * (1 - t) / 0.2);
        } else {
          hw = Math.max(0.6, w * (1 - 0.80 * t * t));
          if (t > 0.9) hw = Math.min(hw, 0.6 + 0.5 * (1 - t) / 0.1);
        }
      } else {
        const u = -along;
        if (u > tail) return -1;
        hw = Math.sqrt(Math.max(0, 1 - (u / tail) ** 2)) * (w * 1.25) + 0.5;
      }
      if (Math.abs(dx) > hw + 0.3) return -1;
      if (Math.abs(dx) > hw - 0.7) return P('blued', 3);           // 抛光棱线
      const glowBand = leaf ? (t > 0.20 && t < 0.72) : (t > 0.50 && t < 0.80);
      if (glowBand && yy === y + 1 && Math.abs(dx) < Math.max(0.8, hw - 1.6)) return P('lume', 3);
      return P('blued', yy === y + 1 ? 2 : 1);
    });
    cyl(v, X(0), Z(0), 0, w * 1.2, y, y + 1, id, (x, yy, z) => {
      const a = Math.atan2(x - CX, -(z - CZ));
      return P('blued', Math.sin(a * 6) > 0.2 ? 3 : 1);
    });
  };
  step('handMinute', () => {
    const id = pid('handMinute');
    handShape(id, LEN_MIN, Y_HAND_MIN, 3.0, 12, false);
    cyl(v, X(0), Z(0), 0, 3.2, Y_HAND_MIN, Y_HAND_MIN + 6, id, () => P('steel', 2));
  });
  step('handHour', () => {
    const id = pid('handHour');
    handShape(id, LEN_HOUR, Y_HAND_HOUR, 4.6, 9, true);
    cyl(v, X(0), Z(0), 0, 4.6, Y_DIAL + 5, Y_HAND_HOUR, id, () => P('steel', 1));
  });
  step('handPR', () => {
    const id = pid('handPR');
    const { x, z } = PR;
    paint(v, X(x - 13), X(x + 13), Y_BRIDGE + 6, Y_BRIDGE + 6, Z(z - 13), Z(z + 13), id, (bx, y, bz) => {
      const dx = bx - CX - x, dz = bz - CZ - z;
      const r = Math.hypot(dx, dz);
      if (r > 12.4 || r < 2) return -1;
      let a = Math.atan2(dx, -dz); if (a < 0) a += TAU;
      const centre = 1.05;
      let diff = a - centre; while (diff > Math.PI) diff -= TAU; while (diff < -Math.PI) diff += TAU;
      const off = Math.atan2(dz, dx) + Math.PI / 2;
      void off;
      const w = r < 4 ? 2.2 : 1.1;
      // 沿 centre 方向的细长针
      const along = dx * Math.sin(centre) - dz * Math.cos(centre);
      const perp = dx * Math.cos(centre) + dz * Math.sin(centre);
      if (along < -3 || along > 12.2) return -1;
      if (Math.abs(perp) > w * (along > 9 ? (12.2 - along) / 3.2 : 1)) return -1;
      return P('blued', along > 8 ? 3 : 2);
    });
  });

  // ══════════ 宝石轴承与螺丝 ══════════
  step('jewels', () => {
    const id = pid('jewels');
    const spots = [
      [TRAIN.barrel.x, TRAIN.barrel.z, Y_WHEEL + 9, 4.2],
      [0, 0, Y_WHEEL + 6, 4.6],
      [TRAIN.third.x, TRAIN.third.z, Y_WHEEL + 6, 3.6],
      [TRAIN.third.x, TRAIN.third.z, Y_BRIDGE + 6, 3.2],
      [TRAIN.crownWheel.x, TRAIN.crownWheel.z, Y_BRIDGE + 6, 4],
      [TRAIN.idle.x, TRAIN.idle.z, Y_BRIDGE + 6, 3.4],
      [TRAIN.ratchet.x, TRAIN.ratchet.z, Y_BRIDGE + 6, 4],
      [PALPOS.x, PALPOS.z, Y_WHEEL, 2.6],
      [ESC.x, ESC.z, Y_WHEEL + 4, 3],
      [BAL.x, BAL.z, Y_WHEEL + 13, 3.2],
      [CAGE.x, CAGE.z, Y_TOURB_BRIDGE + 4, 4.2],
      [-62, 26, Y_BRIDGE + 3, 3.4],
      [56, 34, Y_BRIDGE + 3, 3.4],
      [-30, 60, Y_BRIDGE + 3, 3.4],
    ];
    for (const [sx, sz, sy, sr] of spots) {
      // 黄金托 chaton
      cyl(v, X(sx), Z(sz), sr * 0.62, sr * 1.26, sy, sy + 2, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - sx, bz - CZ - sz);
        return P('gilt', d > sr * 1.15 ? 3 : 1);
      });
      // 红宝石：中心亮、边缘深的凹面
      cyl(v, X(sx), Z(sz), 0, sr * 0.8, sy + 1, sy + 2, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - sx, bz - CZ - sz);
        const hx = bx - CX - sx, hz = bz - CZ - sz;
        if (d > sr * 0.62) return P('ruby', 1);
        if (hx <= -0.5 && hz <= -0.5 && hx > -sr * 0.55 && hz > -sr * 0.55) return P('ruby', 3);
        return P('ruby', 2);
      });
    }
  });

  step('screws', () => {
    const id = pid('screws');
    const spots = [
      [-56, -46, Y_BRIDGE + 5], [-40, -60, Y_BRIDGE + 5], [22, -46, Y_BRIDGE + 5],
      [-8, 16, Y_BRIDGE + 5], [38, 6, Y_BRIDGE + 5], [10, 60, Y_TOURB_BRIDGE + 4],
      [-8, 72, Y_TOURB_BRIDGE + 4], [0, -30, Y_BRIDGE + 5], [-68, 6, Y_BRIDGE + 5],
      [64, -20, Y_PLATE_TOP + 1], [-70, -30, Y_PLATE_TOP + 1], [40, 56, Y_PLATE_TOP + 1],
      [-46, 48, Y_PLATE_TOP + 1], [66, 22, Y_PLATE_TOP + 1], [-20, -68, Y_PLATE_TOP + 1],
      [26, -20, Y_PLATE_TOP + 1], [70, 44, Y_PLATE_TOP + 1], [-64, -8, Y_PLATE_TOP + 1],
    ];
    for (const [sx, sz, sy] of spots) {
      const r = 1.9;
      cyl(v, X(sx), Z(sz), 0, r, sy, sy + 1, id, (bx, y, bz) => {
        const d = Math.hypot(bx - CX - sx, bz - CZ - sz);
        if (y === sy + 1) {
          const a = Math.atan2(bx - CX - sx, -(bz - CZ - sz));
          const slot = Math.abs(Math.sin(a * 2)) > 0.55;
          return slot && d < r - 0.5 ? P('ancelle', 0) : P('blued', d > r - 1 ? 3 : 2);
        }
        return P('blued', d > r - 1 ? 3 : 1);
      });
    }
  });

  return { v, parts: PARTS, hsStates, log, ms: Date.now() - t0 };
}
