// world.js — 沧海龙宫：场景构建
// 坐标约定：龙宫中心 (0,0,0)，水面 y=20，基座底 y=0，主殿顶 ~y=65

import { World, jitter, mix, pick, shade, hash3, mulberry32 } from './voxel.js';

const R = mulberry32(20260928);

// ========== 调色板 ==========
const C = {
  // 海底与礁岩
  reef: 0x4a5a5a, reefD: 0x3a4a4a, reefL: 0x5a6a68,
  sand: 0x8a7a5a, sandD: 0x7a6a4a,
  coralRed: 0xd04a3a, coralRedD: 0xb03828,
  coralOrange: 0xe08040, coralOrangeD: 0xc06830,
  coralPink: 0xd06a7a, coralPinkD: 0xb05a6a,
  coralPurple: 0x8a4a7a, coralPurpleD: 0x6a3a62,
  coralYellow: 0xd0a040, coralYellowD: 0xb08a30,
  seaweed: 0x2a6a4a, seaweedD: 0x1a5a3a, seaweedL: 0x3a8a5a,
  // 台基与栏杆
  jade: 0xb0c8ba, jadeD: 0x8aaa98, jadeL: 0xc8daca,
  marble: 0xe4e0d8, marbleD: 0xd4d0c8, marbleL: 0xf0ece4,
  // 宫殿
  pillar: 0xa03020, pillarD: 0x8a2818,  // 朱红立柱
  wall: 0xe8e0d0, wallD: 0xdad2c2,       // 白玉墙
  beam: 0x7a5030, beamD: 0x5e3e24,       // 木梁
  roofG: 0x3aaa90, roofGD: 0x2a8a72,     // 琉璃碧瓦
  roofGold: 0xdaa040, roofGoldD: 0xb88830, // 金脊
  ridge: 0xc8a030,                         // 屋脊
  eave: 0x2a7a6a,                          // 檐下
  // 龙
  dragonG: 0x2a8a6a, dragonGD: 0x1a6a4a, dragonGL: 0x3aaa7a,
  dragonGold: 0xc8a030, dragonGoldD: 0xa88020,
  dragonWhite: 0xe8e4d8,
  dragonHorn: 0xdaa050,
  dragonEye: 0xff4030,
  // 灯火与装饰
  lanternR: 0xc03020,
  glow: 0xffb060, glowWarm: 0xffc27a,
  gold: 0xdaa040, goldD: 0xb88830,
  // 远景
  mist: 0x3a6080,
  farMtn: 0x2a4a5a, farMtnL: 0x3a5a6a,
};

// ========== 主入口 ==========
export function buildWorld() {
  const solid = new World();
  const glow = new World();

  seaFloor(solid);
  coralReef(solid);
  platform(solid);
  mainHall(solid, glow);
  sideGates(solid, glow);
  corridors(solid, glow);
  frontGate(solid, glow);
  dragonSculpture(solid);
  farMountains(solid);
  seaweedClusters(solid);
  seaCreatures(solid);
  treasures(solid, glow);

  return { solid, glow };
}

// ========== 海底 ==========
function seaFloor(w) {
  // 底座平台：从 y=0 到 y=5，中心区域宽阔
  w.fill(-80, 0, -60, 80, 2, 60, (x, y, z) =>
    jitter(pick(x, y, z, 0.6, C.sand, C.sandD), x, y, z, 0.08));

  // 中央高台（龙宫基座）y=0~12
  for (let y = 0; y <= 12; y++) {
    const shrink = Math.floor(y * 0.5);
    const x0 = -40 + shrink, x1 = 40 - shrink;
    const z0 = -30 + shrink, z1 = 30 - shrink;
    w.fill(x0, y, z0, x1, y, z1, (x, yy, z) =>
      jitter(pick(x, yy, z, 0.5, C.reef, C.reefD), x, yy, z, 0.06));
  }

  // 台基面（y=12 ~ y=15）：白玉石基 + 望柱栏杆
  const stoneHex = (x, y, z) => jitter(pick(x, y, z, 0.5, C.marble, C.marbleD), x, y, z, 0.04);
  w.fill(-34, 12, -24, 34, 15, 24, stoneHex);

  // 栏杆（y=16~17，沿边缘）
  for (let x = -34; x <= 34; x += 3) {
    for (const z of [-24, 24]) {
      w.set(x, 16, z, C.marbleL);
      w.set(x, 17, z, C.jadeL);
    }
  }
  for (let z = -24; z <= 24; z += 3) {
    for (const x of [-34, 34]) {
      w.set(x, 16, z, C.marbleL);
      w.set(x, 17, z, C.jadeL);
    }
  }
  // 连续栏杆横档
  w.fill(-34, 17, -24, 34, 17, -24, C.jade);
  w.fill(-34, 17, 24, 34, 17, 24, C.jade);
  w.fill(-34, 17, -24, -34, 17, 24, C.jade);
  w.fill(34, 17, -24, 34, 17, 24, C.jade);
}

// ========== 珊瑚礁群 ==========
function coralReef(w) {
  const coralTypes = [
    { c: C.coralRed, cd: C.coralRedD },
    { c: C.coralOrange, cd: C.coralOrangeD },
    { c: C.coralPink, cd: C.coralPinkD },
    { c: C.coralPurple, cd: C.coralPurpleD },
    { c: C.coralYellow, cd: C.coralYellowD },
  ];

  // 散布珊瑚在基座周围
  for (let i = 0; i < 40; i++) {
    const cx = Math.floor(-65 + R() * 130);
    const cz = Math.floor(-50 + R() * 100);
    // 跳过龙宫主体区域
    if (Math.abs(cx) < 38 && Math.abs(cz) < 28) continue;
    const type = coralTypes[Math.floor(R() * coralTypes.length)];
    const style = Math.floor(R() * 3);

    if (style === 0) {
      // 柱状珊瑚
      const h = 3 + Math.floor(R() * 6);
      for (let y = 1; y <= h; y++) {
        w.set(cx, y, cz, jitter(type.c, cx, y, cz, 0.1));
        if (R() < 0.4) w.set(cx + 1, y, cz, jitter(type.cd, cx + 1, y, cz, 0.1));
        if (R() < 0.3) w.set(cx, y, cz + 1, jitter(type.cd, cx, y, cz + 1, 0.1));
      }
      // 珊瑚顶部分叉
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++)
          if (R() < 0.5)
            w.set(cx + dx, h + 1, cz + dz, jitter(type.c, cx + dx, h + 1, cz + dz, 0.12));
    } else if (style === 1) {
      // 扇形珊瑚
      const h = 4 + Math.floor(R() * 4);
      const width = 2 + Math.floor(R() * 3);
      for (let y = 1; y <= h; y++)
        for (let dx = -Math.min(width, y); dx <= Math.min(width, y); dx++)
          if (R() < 0.75)
            w.set(cx + dx, y, cz, jitter(pick(cx + dx, y, cz, 0.6, type.c, type.cd), cx + dx, y, cz, 0.1));
    } else {
      // 团状珊瑚
      const r = 2 + Math.floor(R() * 2);
      for (let dx = -r; dx <= r; dx++)
        for (let dy = 0; dy <= r; dy++)
          for (let dz = -r; dz <= r; dz++)
            if (dx * dx + dy * dy * 1.5 + dz * dz <= r * r && R() < 0.8)
              w.set(cx + dx, 1 + dy, cz + dz, jitter(type.c, cx + dx, dy, cz + dz, 0.1));
    }
  }
}

// ========== 龙宫台基 ==========
function platform(w) {
  // 第二层台基（y=15~18）
  const jadeHex = (x, y, z) => jitter(pick(x, y, z, 0.5, C.jade, C.jadeD), x, y, z, 0.04);
  w.fill(-30, 15, -20, 30, 18, 20, jadeHex);

  // 前台阶（南面 z=20~24，向下逐级）
  for (let i = 0; i < 4; i++) {
    w.fill(-8 + i, 15 - i, 20 + i, 8 - i, 15 - i, 20 + i,
      (x, y, z) => jitter(C.marbleL, x, y, z, 0.03));
  }

  // 中心通道台阶（联通前门到主殿）
  w.fill(-6, 18, -20, 6, 18, 20, (x, y, z) => jitter(C.marbleL, x, y, z, 0.03));
}

// ========== 主殿（三重檐） ==========
function mainHall(w, glow) {
  const base = 18;

  // —— 柱网 ——
  const pillars = [];
  for (const px of [-18, -12, -6, 0, 6, 12, 18]) {
    for (const pz of [-14, -7, 0, 7, 14]) {
      // 只在外围放柱
      if (Math.abs(px) === 18 || Math.abs(pz) === 14 ||
        (Math.abs(px) >= 12 && Math.abs(pz) >= 7)) {
        for (let y = base; y <= base + 12; y++) {
          w.set(px, y, pz, jitter(C.pillar, px, y, pz, 0.06));
        }
        pillars.push([px, pz]);
      }
    }
  }

  // —— 墙体 ——
  const wallTop = base + 12;
  // 前墙（z = 14）
  w.fill(-18, base, 14, 18, wallTop, 14, (x, y, z) => jitter(C.wall, x, y, z, 0.03));
  // 后墙（z = -14）
  w.fill(-18, base, -14, 18, wallTop, -14, (x, y, z) => jitter(C.wall, x, y, z, 0.03));
  // 左墙（x = -18）
  w.fill(-18, base, -14, -18, wallTop, 14, (x, y, z) => jitter(C.wall, x, y, z, 0.03));
  // 右墙（x = 18）
  w.fill(18, base, -14, 18, wallTop, 14, (x, y, z) => jitter(C.wall, x, y, z, 0.03));

  // 门洞（前面正中）
  w.carve(-4, base, 14, 4, base + 8, 14);
  // 门框
  for (const dx of [-4, 4]) {
    w.fill(dx, base, 14, dx, base + 8, 14, C.pillarD);
  }
  w.fill(-4, base + 8, 14, 4, base + 8, 14, C.beamD);

  // 窗洞（前墙左右）
  for (const wx of [-14, -10, 10, 14]) {
    w.carve(wx - 1, base + 5, 14, wx, base + 7, 14);
    glow.fill(wx - 1, base + 5, 14, wx, base + 7, 14, C.glowWarm);
  }
  // 侧墙窗洞
  for (const wz of [-8, 0, 8]) {
    for (const sx of [-18, 18]) {
      w.carve(sx, base + 5, wz - 1, sx, base + 7, wz);
      glow.fill(sx, base + 5, wz - 1, sx, base + 7, wz, C.glowWarm);
    }
  }

  // —— 额枋与斗拱层（y = wallTop ~ wallTop+1）——
  w.fill(-20, wallTop, -16, 20, wallTop + 1, 16, (x, y, z) => jitter(C.beam, x, y, z, 0.05));

  // —— 第一重檐（庑殿式，四坡向外收分）——
  hipRoof(w, -22, wallTop + 2, -18, 22, wallTop + 7, 18, C.roofG, C.roofGD, C.ridge);

  // —— 二层楼体 ——
  const base2 = wallTop + 8;
  w.fill(-14, base2, -10, 14, base2 + 8, 10, (x, y, z) => jitter(C.wall, x, y, z, 0.03));
  // 二层柱
  for (const px of [-14, -7, 0, 7, 14]) {
    for (const pz of [-10, 10]) {
      for (let y = base2; y <= base2 + 8; y++)
        w.set(px, y, pz, jitter(C.pillar, px, y, pz, 0.06));
    }
  }
  // 二层窗
  for (const wx of [-10, -4, 4, 10]) {
    w.carve(wx - 1, base2 + 3, 10, wx, base2 + 5, 10);
    glow.fill(wx - 1, base2 + 3, 10, wx, base2 + 5, 10, C.glowWarm);
  }
  // 二层檐枋
  w.fill(-16, base2 + 8, -12, 16, base2 + 9, 12, (x, y, z) => jitter(C.beam, x, y, z, 0.05));

  // —— 第二重檐 ——
  hipRoof(w, -18, base2 + 10, -14, 18, base2 + 14, 14, C.roofG, C.roofGD, C.ridge);

  // —— 三层宝顶 ——
  const base3 = base2 + 15;
  w.fill(-8, base3, -6, 8, base3 + 6, 6, (x, y, z) => jitter(C.wall, x, y, z, 0.03));
  for (const px of [-8, 0, 8]) {
    for (const pz of [-6, 6]) {
      for (let y = base3; y <= base3 + 6; y++)
        w.set(px, y, pz, jitter(C.pillar, px, y, pz, 0.06));
    }
  }
  // 三层窗
  for (const wx of [-4, 4]) {
    w.carve(wx - 1, base3 + 2, 6, wx, base3 + 4, 6);
    glow.fill(wx - 1, base3 + 2, 6, wx, base3 + 4, 6, C.glowWarm);
  }
  w.fill(-10, base3 + 6, -8, 10, base3 + 7, 8, (x, y, z) => jitter(C.beam, x, y, z, 0.05));

  // —— 第三重檐（最高 ——
  hipRoof(w, -12, base3 + 8, -10, 12, base3 + 13, 10, C.roofG, C.roofGD, C.ridge);

  // —— 宝顶 ——
  for (let y = base3 + 14; y <= base3 + 17; y++) {
    w.set(0, y, 0, C.gold);
  }
  w.fill(-1, base3 + 17, -1, 1, base3 + 17, 1, C.gold);

  // —— 宫灯（门口两盏，挂于柱上）——
  for (const dx of [-6, 6]) {
    glow.set(dx, base + 9, 15, C.glow);
    glow.set(dx, base + 8, 15, C.lanternR);
    glow.set(dx, base + 7, 15, C.lanternR);
    glow.set(dx, base + 10, 15, C.goldD);
  }

  // 殿内大灯
  glow.fill(-2, base + 8, 0, 2, base + 10, 0, C.glow);
}

// 庑殿式屋顶（四坡向中心升高）
function hipRoof(w, x0, y0, z0, x1, y1, z1, tileC, tileCD, ridgeC) {
  const xc = (x0 + x1) / 2, zc = (z0 + z1) / 2;
  const halfX = (x1 - x0) / 2, halfZ = (z1 - z0) / 2;
  const h = y1 - y0;

  for (let dy = 0; dy <= h; dy++) {
    const t = dy / h;
    const sx = Math.round(halfX * (1 - t * 0.7));
    const sz = Math.round(halfZ * (1 - t * 0.7));
    const y = y0 + dy;
    const cx = Math.round(xc), cz = Math.round(zc);

    for (let x = cx - sx; x <= cx + sx; x++) {
      for (let z = cz - sz; z <= cz + sz; z++) {
        const edgeX = Math.abs(x - xc) >= sx - 0.5;
        const edgeZ = Math.abs(z - zc) >= sz - 0.5;
        if (dy === h) {
          // 屋脊
          w.set(x, y, z, jitter(ridgeC, x, y, z, 0.06));
        } else if (edgeX || edgeZ) {
          // 檐口与坡边
          w.set(x, y, z, jitter(tileCD, x, y, z, 0.06));
        } else {
          w.set(x, y, z, jitter(tileC, x, y, z, 0.06));
        }
      }
    }

    // 翘角飞檐（四角外翘）
    if (dy <= 1) {
      const ext = 2 - dy;
      for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let e = 1; e <= ext; e++) {
          w.set(cx + dx * (sx + e), y0 + 1, cz + dz * (sz + e),
            jitter(tileCD, cx + dx * (sx + e), y0, cz + dz * (sz + e), 0.06));
        }
      }
    }
  }

  // 鸱尾（屋脊两端竖起的装饰）
  const cx = Math.round(xc), cz = Math.round(zc);
  const topSX = Math.round(halfX * 0.3);
  for (const dx of [-1, 1]) {
    w.set(cx + dx * topSX, y1 + 1, cz, ridgeC);
    w.set(cx + dx * topSX, y1 + 2, cz, C.gold);
  }
}

// ========== 阙楼（龙宫两侧的塔楼）==========
function sideGates(w, glow) {
  for (const side of [-1, 1]) {
    const gx = side * 42;
    const gz = 0;
    const base = 12;

    // 台基
    w.fill(gx - 6, base, gz - 6, gx + 6, base + 3, gz + 6,
      (x, y, z) => jitter(C.marble, x, y, z, 0.04));

    // 阙身
    w.fill(gx - 4, base + 3, gz - 4, gx + 4, base + 12, gz + 4,
      (x, y, z) => jitter(C.wall, x, y, z, 0.03));

    // 柱
    for (const [dx, dz] of [[-4, -4], [-4, 4], [4, -4], [4, 4]]) {
      for (let y = base + 3; y <= base + 12; y++) {
        w.set(gx + dx, y, gz + dz, jitter(C.pillar, gx + dx, y, gz + dz, 0.06));
      }
    }

    // 窗
    for (const dz of [-4, 4]) {
      w.carve(gx - 1, base + 7, gz + dz, gx + 1, base + 9, gz + dz);
      glow.fill(gx - 1, base + 7, gz + dz, gx + 1, base + 9, gz + dz, C.glowWarm);
    }

    // 檐
    w.fill(gx - 6, base + 12, gz - 6, gx + 6, base + 13, gz + 6,
      (x, y, z) => jitter(C.beam, x, y, z, 0.05));
    hipRoof(w, gx - 7, base + 14, gz - 7, gx + 7, base + 18, gz + 7,
      C.roofG, C.roofGD, C.ridge);

    // 宝顶
    w.set(gx, base + 19, gz, C.gold);
    w.set(gx, base + 20, gz, C.gold);

    // 灯笼
    glow.set(gx, base + 11, gz + 5, C.glow);
    glow.set(gx, base + 11, gz - 5, C.glow);
    glow.set(gx, base + 10, gz + 5, C.lanternR);
    glow.set(gx, base + 10, gz - 5, C.lanternR);
  }
}

// ========== 廊桥（连接主殿与阙楼）==========
function corridors(w, glow) {
  for (const side of [-1, 1]) {
    const xStart = side * 20;
    const xEnd = side * 38;
    const x0 = Math.min(xStart, xEnd);
    const x1 = Math.max(xStart, xEnd);
    const base = 15;

    // 廊道地面
    w.fill(x0, base, -3, x1, base, 3,
      (x, y, z) => jitter(C.marbleL, x, y, z, 0.03));

    // 柱子（每隔 4 格）
    for (let x = x0; x <= x1; x += 4) {
      for (const z of [-3, 3]) {
        for (let y = base; y <= base + 6; y++) {
          w.set(x, y, z, jitter(C.pillar, x, y, z, 0.06));
        }
      }
    }

    // 顶盖
    w.fill(x0, base + 6, -4, x1, base + 7, 4,
      (x, y, z) => jitter(C.roofG, x, y, z, 0.05));
    // 脊线
    w.fill(x0, base + 8, 0, x1, base + 8, 0, C.ridge);

    // 栏杆
    for (let x = x0; x <= x1; x += 2) {
      w.set(x, base + 1, -3, C.jade);
      w.set(x, base + 1, 3, C.jade);
    }
    w.fill(x0, base + 2, -3, x1, base + 2, -3, C.jade);
    w.fill(x0, base + 2, 3, x1, base + 2, 3, C.jade);

    // 廊灯
    for (let x = x0 + 2; x <= x1 - 2; x += 8) {
      glow.set(x, base + 5, -4, C.glow);
      glow.set(x, base + 5, 4, C.glow);
    }
  }
}

// ========== 前门牌坊 ==========
function frontGate(w, glow) {
  const base = 12;
  const gz = 28;

  // 牌坊台基
  w.fill(-16, base, gz - 2, 16, base + 2, gz + 2,
    (x, y, z) => jitter(C.marble, x, y, z, 0.04));

  // 四柱
  for (const px of [-14, -6, 6, 14]) {
    for (let y = base + 2; y <= base + 14; y++) {
      w.set(px, y, gz, jitter(C.pillar, px, y, gz, 0.06));
      w.set(px, y, gz + 1, jitter(C.pillar, px, y, gz + 1, 0.06));
    }
  }

  // 额枋（连接柱顶）
  w.fill(-14, base + 11, gz, 14, base + 12, gz + 1,
    (x, y, z) => jitter(C.beam, x, y, z, 0.05));

  // 中间横额（「龙宫」匾位）
  w.fill(-5, base + 9, gz, 5, base + 10, gz, C.gold);

  // 三开间上方各一小屋顶
  for (const [cx, hw] of [[0, 5], [-10, 3], [10, 3]]) {
    for (let dy = 0; dy <= 3; dy++) {
      const span = hw + 1 - dy;
      for (let dx = -span; dx <= span; dx++) {
        w.set(cx + dx, base + 13 + dy, gz,
          jitter(dy === 3 ? C.ridge : C.roofG, cx + dx, base + 13 + dy, gz, 0.06));
        w.set(cx + dx, base + 13 + dy, gz + 1,
          jitter(dy === 3 ? C.ridge : C.roofGD, cx + dx, base + 13 + dy, gz + 1, 0.06));
      }
    }
    // 翘角
    for (const dx of [-1, 1]) {
      w.set(cx + dx * (hw + 2), base + 14, gz, jitter(C.roofGD, 0, 0, 0, 0.06));
    }
  }
  // 宝顶
  w.set(0, base + 17, gz, C.gold);
  w.set(0, base + 18, gz, C.gold);

  // 门灯
  for (const dx of [-6, 6]) {
    glow.set(dx, base + 9, gz + 2, C.glow);
    glow.set(dx, base + 8, gz + 2, C.lanternR);
    glow.set(dx, base + 7, gz + 2, C.lanternR);
  }

  // 前台阶（牌坊正前方通向海面下方）
  for (let i = 0; i < 8; i++) {
    w.fill(-6 + Math.floor(i / 2), base - i, gz + 3 + i, 6 - Math.floor(i / 2), base - i, gz + 3 + i,
      (x, y, z) => jitter(C.marbleL, x, y, z, 0.03));
  }
}

// ========== 体素神龙 ==========
function dragonSculpture(w) {
  const points = [];
  const tangents = [];
  const N = 160;

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const angle = t * Math.PI * 2.2 + 0.5;
    const rr = 48 - t * 12;
    const x = rr * Math.cos(angle);
    const z = rr * Math.sin(angle) * 0.7;
    const y = 5 + t * 60 + Math.sin(t * Math.PI * 3) * 5;
    points.push([x, y, z]);
  }
  for (let i = 0; i <= N; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[Math.min(N, i + 1)];
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    tangents.push([dx / len, dy / len, dz / len]);
  }

  for (let i = 0; i < points.length; i++) {
    const [cx, cy, cz] = points[i];
    const [tx, ty, tz] = tangents[i];
    const t = i / points.length;

    let radius;
    if (t < 0.06) radius = 1 + t * 30;
    else if (t > 0.94) radius = 3 * (1 - (t - 0.94) / 0.06);
    else radius = 3.2 + Math.sin(t * Math.PI * 0.8) * 0.6;
    const r = Math.max(1, Math.round(radius));

    let ux = 0, uy = 1, uz = 0;
    let rx = ty * uz - tz * uy, ry = tz * ux - tx * uz, rz = tx * uy - ty * ux;
    let rl = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
    rx /= rl; ry /= rl; rz /= rl;
    ux = ry * tz - rz * ty; uy = rz * tx - rx * tz; uz = rx * ty - ry * tx;

    for (let du = -r; du <= r; du++) {
      for (let dv = -r; dv <= r; dv++) {
        if (du * du + dv * dv > r * r) continue;
        const px = Math.round(cx + rx * du + ux * dv);
        const py = Math.round(cy + ry * du + uy * dv);
        const pz = Math.round(cz + rz * du + uz * dv);

        let color;
        if (dv > 0) {
          color = jitter(pick(px, py, pz, 0.6, C.dragonG, C.dragonGD), px, py, pz, 0.08);
          if (dv >= r - 1 && du === 0 && i % 3 === 0 && t > 0.04 && t < 0.92) {
            w.set(Math.round(cx + ux * (r + 1)), Math.round(cy + uy * (r + 1)),
              Math.round(cz + uz * (r + 1)), jitter(C.dragonGL, 0, 0, 0, 0.1));
          }
        } else {
          color = jitter(pick(px, py, pz, 0.5, C.dragonGold, C.dragonGoldD), px, py, pz, 0.08);
        }
        w.set(px, py, pz, color);
      }
    }

    // 龙爪
    if (t > 0.15 && t < 0.85 && (i === 40 || i === 80 || i === 55 || i === 100)) {
      for (const side of [-1, 1]) {
        for (let leg = 1; leg <= 3; leg++) {
          w.set(Math.round(cx + rx * side * (r + leg)),
            Math.round(cy + ry * side * (r + leg) - leg * 0.5),
            Math.round(cz + rz * side * (r + leg)),
            jitter(C.dragonGD, 0, leg, 0, 0.08));
        }
        w.set(Math.round(cx + rx * side * (r + 4)),
          Math.round(cy + ry * side * (r + 4) - 2),
          Math.round(cz + rz * side * (r + 4)), C.dragonWhite);
      }
    }

    // 龙鬃
    if (t > 0.82 && t < 0.95) {
      for (let m = 1; m <= 3; m++) {
        w.set(Math.round(cx + ux * (r + m) + rx * (hash3(i, m, 0) - 0.5) * 3),
          Math.round(cy + uy * (r + m)),
          Math.round(cz + uz * (r + m) + rz * (hash3(i, m, 1) - 0.5) * 3),
          jitter(C.dragonGL, i, m, 0, 0.12));
      }
    }
  }

  // 龙头精雕
  const head = points[points.length - 1];
  const [hx, hy, hz] = head.map(Math.round);
  for (let i = 1; i <= 6; i++) {
    const sp = i > 3 ? 1 : 0;
    w.set(hx - 2 - sp, hy + i, hz, C.dragonHorn);
    w.set(hx + 2 + sp, hy + i, hz, C.dragonHorn);
  }
  w.set(hx - 4, hy + 5, hz, C.dragonHorn);
  w.set(hx + 4, hy + 5, hz, C.dragonHorn);
  w.set(hx - 2, hy, hz + 2, C.dragonEye);
  w.set(hx + 2, hy, hz + 2, C.dragonEye);
  for (let dz = 1; dz <= 4; dz++) {
    const w2 = Math.max(1, 3 - Math.floor(dz / 2));
    for (let dx = -w2; dx <= w2; dx++)
      w.set(hx + dx, hy - 1, hz + dz + 1, jitter(C.dragonGD, hx + dx, hy, hz + dz, 0.08));
  }
  for (const side of [-1, 1]) {
    for (let wl = 1; wl <= 8; wl++)
      w.set(Math.round(hx + side * (2 + wl * 0.3)), Math.round(hy - 2 + Math.sin(wl * 0.4) * 1.5),
        Math.round(hz + 3 + wl * 0.6), jitter(C.dragonWhite, 0, wl, 0, 0.1));
  }
  // 龙珠
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++)
        if (dx * dx + dy * dy + dz * dz <= 1)
          w.set(hx + dx, hy + dy, hz + 6 + dz, C.gold);
}

// ========== 远山剪影 ==========
function farMountains(w) {
  for (let i = 0; i < 20; i++) {
    const mx = -120 + Math.floor(R() * 240);
    const mz = -80 - Math.floor(R() * 40);
    const h = 5 + Math.floor(R() * 15);
    const r = 4 + Math.floor(R() * 8);

    for (let dx = -r; dx <= r; dx++) {
      const colH = Math.round(h * (1 - (dx / r) ** 2));
      for (let y = 0; y <= colH; y++) {
        for (let dz = -2; dz <= 2; dz++) {
          w.set(mx + dx, y, mz + dz,
            jitter(pick(mx + dx, y, mz + dz, 0.5, C.farMtn, C.farMtnL), mx + dx, y, mz + dz, 0.05));
        }
      }
    }
  }
}

// ========== 海草丛 ==========
function seaweedClusters(w) {
  for (let i = 0; i < 60; i++) {
    const sx = Math.floor(-70 + R() * 140);
    const sz = Math.floor(-50 + R() * 100);
    if (Math.abs(sx) < 36 && Math.abs(sz) < 26) continue;

    const h = 3 + Math.floor(R() * 7);
    const sway = (R() - 0.5) * 2;

    for (let y = 1; y <= h; y++) {
      const lean = Math.round(sway * y * 0.15);
      const c = y > h - 2 ? C.seaweedL : pick(sx, y, sz, 0.5, C.seaweed, C.seaweedD);
      w.set(sx + lean, y, sz, jitter(c, sx + lean, y, sz, 0.12));
      if (R() < 0.3) w.set(sx + lean + 1, y, sz, jitter(c, sx + lean + 1, y, sz, 0.12));
    }
  }
}

// ========== 海底生物 ==========
function seaCreatures(w) {
  // 海星
  const starColors = [0xd04a3a, 0xe08040, 0x8a4a7a, 0xd06a7a];
  for (let i = 0; i < 15; i++) {
    const sx = Math.floor(-65 + R() * 130);
    const sz = Math.floor(-45 + R() * 90);
    if (Math.abs(sx) < 38 && Math.abs(sz) < 26) continue;
    const sc = starColors[Math.floor(R() * starColors.length)];
    // 五角海星（简化为十字 + 对角）
    w.set(sx, 1, sz, sc);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1]]) {
      w.set(sx + dx, 1, sz + dz, jitter(sc, sx + dx, 1, sz + dz, 0.1));
    }
  }

  // 贝壳
  for (let i = 0; i < 12; i++) {
    const bx = Math.floor(-70 + R() * 140);
    const bz = Math.floor(-50 + R() * 100);
    if (Math.abs(bx) < 36 && Math.abs(bz) < 26) continue;
    const shellC = R() < 0.5 ? 0xf0e8d0 : 0xe0c8a0;
    w.set(bx, 1, bz, shellC);
    w.set(bx + 1, 1, bz, jitter(shellC, bx + 1, 1, bz, 0.05));
    w.set(bx, 2, bz, jitter(shellC, bx, 2, bz, 0.08));
    // 珍珠（偶尔出现）
    if (R() < 0.3) {
      w.set(bx, 2, bz, 0xf8f4ea);
    }
  }

  // 海龟（一只大海龟在龙宫前方）
  const tx = 20, tz = 40;
  // 龟壳
  for (let dx = -2; dx <= 2; dx++)
    for (let dz = -2; dz <= 2; dz++)
      if (dx * dx + dz * dz <= 5)
        w.set(tx + dx, 3, tz + dz, jitter(0x4a6a4a, tx + dx, 3, tz + dz, 0.08));
  // 龟壳隆起
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++)
      w.set(tx + dx, 4, tz + dz, jitter(0x5a7a5a, tx + dx, 4, tz + dz, 0.08));
  // 头
  w.set(tx, 3, tz + 3, 0x5a8a5a);
  w.set(tx, 3, tz + 4, 0x5a8a5a);
  // 鳍
  w.set(tx - 3, 3, tz - 1, 0x4a6a4a);
  w.set(tx + 3, 3, tz - 1, 0x4a6a4a);
  w.set(tx - 2, 3, tz + 2, 0x4a6a4a);
  w.set(tx + 2, 3, tz + 2, 0x4a6a4a);
}

// ========== 宝库细节：龙柱、灯台 ==========
function treasures(w, glow) {
  // 龙柱（主殿前两根盘龙柱）
  for (const side of [-1, 1]) {
    const px = side * 10;
    const pz = 18;
    // 柱身
    for (let y = 15; y <= 30; y++) {
      w.set(px, y, pz, jitter(C.pillar, px, y, pz, 0.06));
      w.set(px + 1, y, pz, jitter(C.pillar, px + 1, y, pz, 0.06));
      // 盘龙纹（螺旋上的小突起）
      if (y % 3 === 0) {
        const angle = y * 0.8 + side;
        const dx = Math.round(Math.cos(angle) * 1.5);
        const dz = Math.round(Math.sin(angle) * 1.5);
        w.set(px + dx, y, pz + dz, C.gold);
      }
    }
    // 柱顶宝珠
    w.set(px, 31, pz, C.gold);
    glow.set(px, 31, pz, C.glow);
  }

  // 台阶两侧的灯台
  for (const side of [-1, 1]) {
    for (const [lx, lz] of [[side * 12, 24], [side * 16, 28]]) {
      w.fill(lx - 1, 12, lz - 1, lx + 1, 12, lz + 1, C.marble);
      for (let y = 13; y <= 17; y++)
        w.set(lx, y, lz, C.jade);
      glow.set(lx, 18, lz, C.glow);
      glow.set(lx, 17, lz, C.lanternR);
    }
  }

  // 水中发光珍珠柱（龙宫外围的定海神针风格装饰）
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const px = Math.round(Math.cos(angle) * 55);
    const pz = Math.round(Math.sin(angle) * 40);
    for (let y = 1; y <= 18; y++)
      w.set(px, y, pz, jitter(C.jade, px, y, pz, 0.06));
    w.set(px, 19, pz, C.gold);
    glow.set(px, 20, pz, C.glow);
  }
}
