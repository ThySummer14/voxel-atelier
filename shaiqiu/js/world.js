import { World, jitter, mix, pick, hash3 } from './voxel.js';

// ---------- 调色板：秋日午后的暖 ----------
const C = {
  wall: 0xf0e8d5, wallStain: 0xe0d3ba,
  rammed: 0xb58a58, rammedD: 0x9c7344,            // 夯土墙
  tile: 0x5a6570, tileD: 0x48515c, tileEave: 0x39414b,
  wood: 0x7b5433, woodD: 0x5e3f26, plank: 0x8a6740,
  stone: 0x8e8574, stoneD: 0x7a7263, stoneHi: 0xa59c8b,
  slab: 0x948d7e, slabD: 0x837b6c,
  earth: 0xb0976a, earthD: 0x9c8258,
  paddy: 0xc9a44e, paddyD: 0xb08c3c, stubble: 0xcbb684, stubbleD: 0xb59f6e,
  water: 0x86b3aa, waterHi: 0xc6dcd6, waterD: 0x6fa39b,
  red: 0xce3a20, redD: 0xac2813, redHi: 0xe65a30,
  gold: 0xe2a43a, goldD: 0xc68a26,
  orange: 0xe0742c, orangeD: 0xc65e1c,
  dryWhite: 0xefe9d8,
  bamboo: 0xc2a267, bambooD: 0xa78a52,
  leafRed: 0xae4a28, leafOrange: 0xc8782e, leafGold: 0xd6a644,
  leafPine: 0x55684a, leafOlive: 0x7c7c48, trunk: 0x4e3a26,
  skin: 0xe5c29c, indigo: 0x3d5870, hat: 0xd9b765,
  lantern: 0xc13a24,
  far1: 0x87a0b2, far2: 0x9db2c0,
};

// ---------- 主入口 ----------
export function buildWorld() {
  const w = new World();
  groundBase(w);       // 大地基准面（防穿帮）
  plateau(w);          // 三层台地 + 石阶
  rearHill(w);         // 后山秋林
  farMountains(w);     // 远山两重
  waterAndFields(w);   // 溪、滩、田、稻草垛
  bridge(w);           // 石拱桥
  houses(w);           // 全部建筑
  trays(w);            // 晒匾阵列（画面核心）
  racks(w);            // 晒架、玉米串、辣椒串
  trees(w);            // 树
  figures(w);          // 人、猫、鸡
  return w;
}

// 大地基准面：近村枯草黄，向北渐转山麓青灰
function groundBase(w) {
  w.fill(-175, 0, -175, 175, 0, 100, (x, y, z) => {
    const t = Math.min(1, Math.max(0, (-30 - z) / 80));
    return jitter(mix(0xb0a468, 0x8f9568, t), x, y, z, 0.08);
  });
}

const stoneHex = (x, y, z) => pick(x, y, z, 0.55, C.stone, pick(x + 7, y, z, 0.5, C.stoneD, C.stoneHi));
const slabHex = (x, y, z) => pick(x, y, z, 0.5, C.slab, pick(x * 3 + 1, y, z, 0.5, C.slabD, C.stoneHi));
const earthHex = (x, y, z) => pick(x, y, z, 0.6, C.earth, C.earthD);

// ---------- 三层台地 ----------
function plateau(w) {
  // 台地1（晒场层，顶 y=12）
  w.fill(-52, 0, -10, 52, 11, 34, stoneHex);
  w.fill(-52, 12, -10, 52, 12, 34, slabHex);
  // 台地2（主村层，顶 y=20）: 土面掺秋草与石板碎点
  w.fill(-60, 0, -44, 60, 19, -11, stoneHex);
  w.fill(-60, 20, -44, 60, 20, -11, (x, y, z) =>
    pick(x, y, z, 0.08, 0x8f9568, pick(x * 5 + 3, y, z, 0.1, C.slab, earthHex(x, y, z))));
  // 台地3（后排层，顶 y=27）
  w.fill(-46, 0, -72, 46, 26, -45, stoneHex);
  w.fill(-46, 27, -72, 46, 27, -45, earthHex);
  // 台面石板路
  w.fill(-6, 20, -44, 8, 20, -11, slabHex);
  w.fill(-6, 27, -72, 8, 27, -45, slabHex);
  // 上台地3 的贴壁石阶（台地2 顶 y20 → 台地3 顶 y27，凸出立面南侧）
  for (let i = 0; i < 7; i++) {
    const z = -44 + i;
    w.fill(-2, 21, z, 3, 26 - i, z, slabHex);
  }
  // 村口石阶：贴台地1 南立面（顶 y12 → 地面 y0，凸出楔形）
  for (let i = 0; i < 12; i++) {
    const z = 35 + i;
    w.fill(-6, 0, z, 5, 11 - i, z, slabHex);
  }
  // 晒场边花台
  flowerBed(w, -34, 13, 26); flowerBed(w, 34, 13, 26);
}

function flowerBed(w, x, y, z) {
  w.fill(x - 2, y - 1, z - 2, x + 2, y - 1, z + 2, stoneHex);
  w.fill(x - 1, y, z - 1, x + 1, y, z + 1, stoneHex);
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++)
      w.set(x + dx, y + 1, z + dz, pick(x + dx, y, z + dz, 0.5, C.gold, C.orange));
  w.set(x, y + 2, z, C.gold);
}

// ---------- 后山秋林（低缓、成片色块、两端沉入地平） ----------
function rearHill(w) {
  const ridge = (x) =>
      15 * Math.exp(-((x + 52) ** 2) / 2400)
    + 21 * Math.exp(-((x - 24) ** 2) / 2000)
    + 8 * Math.exp(-((x - 110) ** 2) / 3200)
    + 3 * Math.sin(x * 0.13) + 2 * Math.sin(x * 0.29 + 2);
  for (let x = -160; x <= 160; x++) {
    const fade = Math.max(0, 1 - Math.max(0, Math.abs(x) - 115) / 45);
    for (let z = -108; z <= -73; z++) {
      const depth = -73 - z;
      // 山脚缓起：近村处山体沉到台地3 顶以下，避免垂直断崖
      const h = Math.round(Math.min(38, Math.max(0, (depth - 5) * 0.62 + ridge(x) * Math.min(1, depth / 12))) * fade);
      if (h <= 0) continue;
      const top = 27 + h;
      // 低频色块：成片的红/橙/金，再叠颗粒；两端衰减区退成草坡色
      const patch = Math.sin(x * 0.045 + z * 0.08) + Math.sin(x * 0.021 - z * 0.05 + 3) * 0.7;
      for (let y = 0; y <= top; y++) {
        let hex;
        if (fade < 0.99) {
          // 端部衰减区:淡秋色草坡,避免断面穿帮
          const r = hash3(x, y, z);
          hex = jitter(mix(0x9a9168, r < 0.5 ? C.leafOrange : C.leafOlive, 0.5), x, y, z, 0.1);
        } else if (y === top || y > top - 10) {
          // 山脊与近村立面都挂秋色（林冠厚 10 格），避免大面脏棕
          const r = hash3(x, y, z);
          if (patch > 0.55) hex = r < 0.78 ? C.leafRed : C.leafOrange;
          else if (patch > -0.15) hex = r < 0.5 ? C.leafOrange : C.leafGold;
          else hex = r < 0.55 ? C.leafOlive : C.leafPine;
          hex = jitter(hex, x, y, z, 0.12);
        } else {
          hex = pick(x, y, z, 0.5, 0x6e675c, 0x5e574d);
        }
        w.set(x, y, z, hex);
      }
      if (fade >= 0.99 && hash3(x, 999, z) < 0.14 && h > 5) {
        const r = hash3(x, 998, z);
        const crown = patch > 0.4 ? C.leafRed : r < 0.6 ? C.leafOrange : C.leafGold;
        w.set(x, top + 1, z, jitter(crown, x, top, z, 0.12));
      }
    }
  }
  // 山脚衔接林带（贴台地3 后缘与北缘的矮秋林，掩住接缝）
  for (let x = -110; x <= 110; x++) {
    const r = hash3(x, 777, 0);
    const hh = 1 + Math.floor(hash3(x, 555, 0) * 2.4);
    for (const z of [-73, -74, -75]) {
      const h2 = hh - (z + 75);
      for (let i = 1; i <= Math.max(1, h2); i++) {
        w.set(x, 27 + i, z, jitter(r < 0.4 ? C.leafRed : r < 0.75 ? C.leafOrange : C.leafGold, x, i, z, 0.12));
      }
    }
  }
}

// ---------- 远山两重（厚 3 的斜坡剪影，两端沉入地平） ----------
function farMountains(w) {
  const layer = (z0, z1, base, amp, hex, jitterAmt) => {
    for (let x = -170; x <= 170; x++) {
      const fade = Math.max(0, 1 - Math.max(0, Math.abs(x) - 120) / 50);
      const h = Math.round((base
        + amp * Math.exp(-((x + 60) ** 2) / 5000)
        + amp * 0.8 * Math.exp(-((x - 70) ** 2) / 6000)
        + 5 * Math.sin(x * 0.07) + 3 * Math.sin(x * 0.19 + 1)) * fade);
      for (let y = 8; y <= 28 + h; y++) {
        const zLine = z0 + Math.round(Math.min(1, Math.max(0, (y - 8) / Math.max(1, h + 20))) * (z1 - z0));
        for (let z = zLine; z <= zLine + 2; z++) {
          w.set(x, y, z, jitter(hex, x, y, z, jitterAmt));
        }
      }
    }
  };
  layer(-104, -128, 26, 26, C.far1, 0.05);
  layer(-132, -164, 34, 30, C.far2, 0.04);
}

// ---------- 溪（两段，村前留渡口草滩）、滩、稻田、稻草垛 ----------
function waterAndFields(w) {
  // 溪床水面 y=-1（比地面低一格）
  const streamSeg = (xa, xb) => {
    w.fill(xa, -1, 42, xb, -1, 45, (x, y, z) =>
      pick(x, y, z, 0.12, C.waterHi, pick(x + 3, y, z, 0.3, C.waterD, C.water)));
    w.fill(xa, 0, 41, xb, 0, 41, (x, y, z) => pick(x, y, z, 0.5, C.stoneHi, C.slab));
    w.fill(xa, 0, 46, xb, 0, 46, (x, y, z) => pick(x, y, z, 0.5, C.stoneHi, C.slab));
  };
  streamSeg(-115, -20);
  streamSeg(26, 115);
  // 村前渡口草滩（两溪段之间）
  w.fill(-19, 0, 41, 25, 0, 46, (x, y, z) =>
    pick(x, y, z, 0.45, C.earth, pick(x + 9, y, z, 0.4, C.stoneHi, 0xb8a05e)));

  // 金黄稻田
  for (let x = -115; x <= 115; x++) {
    for (let z = 48; z <= 96; z++) {
      if (x >= -56 && x <= -18 && z >= 64) continue;      // 收割角
      const furrow = (z % 4) < 2 ? 0.12 : 0;
      const hex = jitter(mix(C.paddy, C.paddyD, furrow + hash3(x, 5, z) * 0.15), x, 0, z, 0.06);
      w.set(x, 0, z, hex);
    }
  }
  // 收割茬地
  w.fill(-56, 0, 64, -18, 0, 96, (x, y, z) => pick(x, y, z, 0.75, C.stubble, C.stubbleD));
  // 田埂
  w.fill(-115, 0, 47, 115, 0, 47, earthHex);
  w.fill(31, 0, 48, 33, 0, 96, earthHex);                  // 南北田埂小径
  w.fill(-56, 0, 63, -18, 0, 63, earthHex);
  // 南岸石板路（沿溪，连村口与桥）
  w.fill(-20, 0, 47, 27, 0, 48, slabHex);

  // 稻草垛
  haystack(w, -70, 1, 78); haystack(w, -32, 1, 88);
  haystack(w, 44, 1, 82); haystack(w, 78, 1, 72);
}

function haystack(w, x, y, z) {
  for (let dy = 0; dy < 5; dy++) {
    const r = 3 - dy * 0.6;
    for (let dx = -3; dx <= 3; dx++)
      for (let dz = -3; dz <= 3; dz++)
        if (dx * dx + dz * dz <= r * r)
          w.set(x + dx, y + dy, z + dz, jitter(pick(x + dx, dy, z + dz, 0.4, C.paddy, C.paddyD), x, dy, z, 0.08));
  }
  w.set(x, y + 5, z, C.goldD);
}

// ---------- 石拱桥（跨东段溪，x 28..37） ----------
function bridge(w) {
  w.fill(28, 0, 39, 37, 3, 50, stoneHex);
  // 掏拱洞（水从洞下 y-1 流过）
  for (let x = 29; x <= 36; x++)
    for (let z = 41; z <= 46; z++)
      for (let y = 1; y <= 2; y++) w.del(x, y, z);
  // 桥面石板
  w.fill(28, 3, 39, 37, 3, 50, slabHex);
  // 两端下坡
  w.fill(28, 2, 38, 37, 2, 38, slabHex);
  w.fill(28, 1, 37, 37, 1, 36, slabHex);
  w.fill(28, 2, 51, 37, 2, 51, slabHex);
  w.fill(28, 1, 52, 37, 1, 53, slabHex);
  // 石栏
  for (const rx of [28, 37]) {
    for (let z = 39; z <= 50; z += 2) w.set(rx, 4, z, C.stoneHi);
  }
}

// ---------- 建筑 ----------
function houses(w) {
  // 台地1 谷仓两栋（靠北侧）
  barn(w, -22, -8, -10, 0, 12, { wallH: 6, ridge: 3 });
  barn(w, 14, -8, 26, 2, 12, { wallH: 6, ridge: 3 });

  // 台地2：横屋(马头墙朝南) — 主屋 — 主屋 — 横屋 — 晒台房
  houseZ(w, -52, -38, -38, -28, 20, { wallH: 9, ridge: 5 });
  house(w, -34, -16, -37, -27, 20, { wallH: 9, ridge: 5 });
  house(w, -12, 6, -37, -27, 20, { wallH: 10, ridge: 5 });
  houseZ(w, 10, 24, -38, -28, 20, { wallH: 9, ridge: 5 });
  flatroof(w, 28, 44, -38, -28, 20, { wallH: 7 });

  // 台地3 后排
  house(w, -36, -20, -68, -58, 27, { wallH: 8, ridge: 4 });
  flatroof(w, -8, 8, -70, -60, 27, { wallH: 7 });
  house(w, 20, 34, -66, -56, 27, { wallH: 8, ridge: 4 });
}

// 白墙黛瓦马头墙民居（屋脊沿 x，南面朝 +z）
function house(w, x0, x1, z0, z1, gY, opts) {
  const { wallH, ridge } = opts;
  const wallTop = gY + wallH - 1;
  const wallHex = (x, y, z) => pick(x, y, z, 0.06, C.wallStain, C.wall);

  w.fill(x0, gY, z0, x1, gY, z1, stoneHex);          // 石基
  w.fill(x0, gY + 1, z0, x1, wallTop, z1, wallHex);  // 白墙

  // 南立面：门 + 窗
  const doorX = Math.floor((x0 + x1) / 2);
  w.fill(doorX - 1, gY + 1, z1, doorX + 1, gY + 4, z1, C.woodD);
  w.set(doorX, gY + 3, z1, C.wood);
  const winY = gY + Math.floor(wallH * 0.55);
  for (const wx of [x0 + 3, x1 - 5]) {
    w.fill(wx, winY, z1, wx + 2, winY + 1, z1, 0x2e2a26);
    w.set(wx, winY + 1, z1, C.woodD); w.set(wx + 2, winY + 1, z1, C.woodD);
    w.set(wx + 1, winY + 1, z1, C.woodD);
  }
  // 东西立面小窗
  const winY2 = gY + Math.floor(wallH * 0.5);
  const zWin = Math.floor((z0 + z1) / 2);
  w.fill(x0, winY2, zWin, x0, winY2 + 1, zWin + 1, 0x2e2a26);
  w.fill(x1, winY2, zWin, x1, winY2 + 1, zWin + 1, 0x2e2a26);

  // 双坡屋面：屋脊沿 x，脊线 zc；檐口挑出一格
  const zcLo = Math.floor((z0 + z1) / 2), zcHi = Math.ceil((z0 + z1) / 2);
  const spanS = zcLo - (z0 - 1), spanN = (z1 + 1) - zcHi;
  for (let z = z0 - 1; z <= z1 + 1; z++) {
    let u;                                            // 0=檐 1=脊
    if (z <= zcLo) u = (z - (z0 - 1)) / spanS;
    else u = ((z1 + 1) - z) / spanN;
    const y = wallTop + 1 + Math.round(u * ridge);
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      const tileHex = (x % 2 === 0) ? C.tile : C.tileD;
      w.set(x, y, z, jitter(tileHex, x, y, z, 0.06));
    }
    // 檐板（檐口正下方一格，只贴正面一列）
    if (z === z0 - 1 || z === z1 + 1) {
      for (let x = x0 - 1; x <= x1 + 1; x++) w.set(x, y - 1, z, C.wood);
    }
  }
  // 屋脊
  for (let x = x0 - 1; x <= x1 + 1; x++) {
    w.set(x, wallTop + 1 + ridge, zcLo, C.tileEave);
    if (zcHi !== zcLo) w.set(x, wallTop + 1 + ridge, zcHi, C.tileEave);
  }
  // 马头墙：两端阶梯轮廓 + 压顶瓦（高出屋面）
  const capY = wallTop + 1 + ridge + 3;
  for (const side of [x0 - 1, x1 + 1]) {
    let stepY = wallTop + 2;
    for (let z = z0 - 1; z <= zcLo; z += 2) {
      const yTop = Math.min(capY, stepY);
      w.fill(side, gY + 1, z, side, yTop, z, wallHex);
      w.set(side, yTop + 1, z, C.tileD);
      stepY += 1;
    }
  }
  // 红灯笼一对（门两侧）
  w.set(doorX - 3, gY + wallH - 2, z1 + 1, C.lantern);
  w.set(doorX + 3, gY + wallH - 2, z1 + 1, C.lantern);
}

// 纵深屋脊民居：南端阶梯马头墙正对镜头（徽派巷视）
function houseZ(w, x0, x1, z0, z1, gY, opts) {
  const { wallH, ridge } = opts;
  const wallTop = gY + wallH - 1;
  const wallHex = (x, y, z) => pick(x, y, z, 0.06, C.wallStain, C.wall);
  const capY = wallTop + 2 + ridge;

  w.fill(x0, gY, z0, x1, gY, z1, stoneHex);
  w.fill(x0, gY + 1, z0, x1, wallTop, z1, wallHex);

  // 南立面（山墙下）：门 + 窗
  const doorX = Math.floor((x0 + x1) / 2);
  w.fill(doorX - 1, gY + 1, z1, doorX + 1, gY + 4, z1, C.woodD);
  const winY = gY + Math.floor(wallH * 0.55);
  for (const wx of [x0 + 2, x1 - 3]) {
    w.fill(wx, winY, z1, wx + 1, winY + 1, z1, 0x2e2a26);
    w.set(wx, winY + 1, z1, C.woodD); w.set(wx + 1, winY + 1, z1, C.woodD);
  }

  // 双坡屋面：脊线 xc，坡朝东西
  const xcF = Math.floor((x0 + x1) / 2), xcC = Math.ceil((x0 + x1) / 2);
  const spanX = xcF - (x0 - 1);
  for (let x = x0 - 1; x <= x1 + 1; x++) {
    const u = 1 - Math.abs(x - (x0 + x1) / 2) / spanX;
    const y = wallTop + 1 + Math.round(Math.max(0, u) * ridge);
    for (let z = z0 - 1; z <= z1 + 1; z++) {
      const tileHex = (z % 2 === 0) ? C.tile : C.tileD;
      w.set(x, y, z, jitter(tileHex, x, y, z, 0.06));
    }
    if (x === x0 - 1 || x === x1 + 1) {
      for (let z = z0 - 1; z <= z1 + 1; z++) w.set(x, y - 1, z, C.wood);
    }
  }
  for (let z = z0 - 1; z <= z1 + 1; z++) {
    w.set(xcF, wallTop + 1 + ridge, z, C.tileEave);
    if (xcC !== xcF) w.set(xcC, wallTop + 1 + ridge, z, C.tileEave);
  }

  // 南北两端阶梯马头墙（高出屋面，压顶瓦线）
  for (const side of [z0 - 1, z1 + 1]) {
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      const d = Math.abs(x - (x0 + x1) / 2);
      const yTop = Math.min(capY, wallTop + 2 + ridge - Math.floor(d / 2));
      w.fill(x, gY + 1, side, x, yTop, side, wallHex);
      w.set(x, yTop + 1, side, C.tileD);
    }
  }
}

// 木板谷仓
function barn(w, x0, z0, x1, z1, gY, opts) {
  const { wallH, ridge } = opts;
  const wallTop = gY + wallH - 1;
  w.fill(x0, gY, z0, x1, gY, z1, stoneHex);
  w.fill(x0, gY + 1, z0, x1, wallTop, z1, (x, y, z) => {
    const plankHex = (y % 3 === 0) ? C.woodD : C.plank;
    return jitter(plankHex, x, y, z, 0.07);
  });
  const doorX = Math.floor((x0 + x1) / 2);
  w.fill(doorX - 1, gY + 1, z1, doorX + 1, gY + 3, z1, C.woodD);
  const zc = Math.floor((z0 + z1) / 2);
  for (let z = z0 - 1; z <= z1 + 1; z++) {
    const y = wallTop + 1 + Math.max(0, ridge - Math.abs(z - zc));
    for (let x = x0 - 1; x <= x1 + 1; x++)
      w.set(x, y, z, jitter((x % 2 === 0) ? C.tile : C.tileD, x, y, z, 0.06));
  }
}

// 夯土平顶晒台房（晒秋主舞台）
function flatroof(w, x0, x1, z0, z1, gY, opts) {
  const { wallH } = opts;
  const wallTop = gY + wallH - 1;
  const mudHex = (x, y, z) => pick(x, y, z, 0.12, C.rammedD, C.rammed);
  w.fill(x0, gY, z0, x1, gY, z1, stoneHex);
  w.fill(x0, gY + 1, z0, x1, wallTop, z1, mudHex);
  // 平顶
  w.fill(x0, wallTop + 1, z0, x1, wallTop + 1, z1, (x, y, z) =>
    jitter(pick(x, y, z, 0.3, 0xc9bfa8, 0xbdb29a), x, y, z, 0.05));
  // 四周矮埂
  w.boxFrame(x0, wallTop + 2, z0, x1, wallTop + 2, z1, mudHex);
  // 小门 + 窗
  const doorX = Math.floor((x0 + x1) / 2);
  w.fill(doorX, gY + 1, z1, doorX + 1, gY + 3, z1, C.woodD);
  w.set(x0 + 2, gY + 4, z1, 0x2e2a26); w.set(x1 - 2, gY + 4, z1, 0x2e2a26);
  // 上屋面的木梯（贴东墙）
  for (let i = 0; i < wallH + 2; i++) w.set(x1 + 1, gY + 1 + i, z1 - 1, C.bambooD);
}

// ---------- 晒匾阵列（画面核心） ----------
function tray(w, cx, cy, cz, r, type, opts = {}) {
  const innerR2 = (r - 1.2) * (r - 1.2);
  const rimR2Hi = (r + 0.4) * (r + 0.4);
  for (let dx = -r; dx <= r; dx++) {
    for (let dz = -r; dz <= r; dz++) {
      const d2 = dx * dx + dz * dz;
      if (d2 > rimR2Hi) continue;
      const x = cx + dx, z = cz + dz;
      if (d2 >= innerR2) {
        w.set(x, cy, z, jitter(pick(x, cy, z, 0.4, C.bamboo, C.bambooD), x, cy, z, 0.08));
      } else {
        let hex;
        const h = hash3(x, 31, z);
        switch (type) {
          case 'red':
            hex = h < 0.14 ? C.redD : h < 0.92 ? C.red : h < 0.97 ? C.redHi : 0x5d7a3a;
            break;
          case 'gold':
            hex = h < 0.25 ? C.goldD : C.gold;
            break;
          case 'orange':
            hex = h < 0.3 ? C.orangeD : C.orange;       // 柿饼满匾
            break;
          case 'white':
            hex = h < 0.2 ? 0xe0d8c4 : C.dryWhite;
            break;
        }
        w.set(x, cy, z, jitter(hex, x, cy, z, 0.09));
      }
    }
  }
  if (opts.legs) {
    for (const [lx, lz] of [[-r + 2, 0], [r - 2, 0], [0, r - 2]]) {
      w.set(cx + lx, cy - 1, cz + lz, C.bambooD);
    }
  }
}

function trays(w) {
  // 晒场三排大阵（台地1）——红色为绝对主角
  const y1 = 13;
  tray(w, -30, y1, 14, 5, 'red');
  tray(w, -14, y1, 14, 6, 'red');
  tray(w, 2, y1, 14, 5, 'gold');
  tray(w, 18, y1, 14, 5, 'white');
  tray(w, 32, y1, 14, 5, 'red');
  tray(w, -22, y1, 22, 5, 'orange');
  tray(w, -6, y1, 22, 6, 'red');
  tray(w, 10, y1, 22, 5, 'red');
  tray(w, 26, y1, 22, 5, 'red');
  tray(w, -12, y1, 30, 5, 'red');
  tray(w, 4, y1, 30, 5, 'gold');
  tray(w, 20, y1, 30, 5, 'orange');

  // 台地2 院坝
  const y2 = 21;
  tray(w, -34, y2, -16, 5, 'red', { legs: true });
  tray(w, -19, y2, -14, 6, 'red', { legs: true });
  tray(w, -3, y2, -15, 5, 'gold', { legs: true });
  tray(w, 13, y2, -16, 5, 'red', { legs: true });

  // 夯土晒台房顶（台地2 右）
  const yF = 20 + 7 + 2;
  tray(w, 32, yF, -33, 4, 'red');
  tray(w, 39, yF, -33, 4, 'gold');
  tray(w, 36, yF, -30, 3, 'orange');

  // 台地3 屋顶晒台（天际线上的红）
  const yR = 27 + 7 + 2;
  tray(w, -3, yR, -66, 4, 'red');
  tray(w, 4, yR, -66, 4, 'red');
  tray(w, 0, yR, -62, 3, 'gold');

  // 前景大匾（田埂旁，画面下方最近的红）
  tray(w, 20, 1, 52, 7, 'red', { legs: true });
  // 近景稻草垛两座（画面下缘左右）
  haystack(w, -40, 1, 50);
  haystack(w, 60, 1, 50);
}

// ---------- 晒架与挂串 ----------
function racks(w) {
  rack(w, -40, 12, 8, 6, 4);
  rack(w, 32, 12, 4, 6, 3);
  // 台地2 南缘墙挂串（贴 z=-11 立面，成组）
  for (let i = 0; i < 3; i++) {
    hangCorn(w, -52 + i * 5, 18, -11);
    hangChili(w, -50 + i * 5, 18, -11);
  }
  for (let i = 0; i < 2; i++) {
    hangCorn(w, 46 + i * 5, 18, -11);
    hangChili(w, 48 + i * 5, 18, -11);
  }
}

function rack(w, x, gY, z, h, len) {
  w.fill(x, gY + 1, z, x, gY + h, z, C.bamboo);                 // 柱
  w.fill(x + len, gY + 1, z, x + len, gY + h, z, C.bamboo);     // 柱
  w.fill(x, gY + h + 1, z, x + len, gY + h + 1, z, C.bamboo);   // 横杆
  for (let i = 1; i < len; i++) {
    if (i % 2 === 1) cornString(w, x + i, gY + h, z);
    else chiliString(w, x + i, gY + h, z);
  }
}

function cornString(w, x, yTop, z) {
  for (let i = 0; i < 3; i++) w.set(x, yTop - i, z, jitter(i === 0 ? C.gold : C.goldD, x, yTop - i, z, 0.1));
}
function chiliString(w, x, yTop, z) {
  for (let i = 0; i < 3; i++) w.set(x, yTop - i, z, jitter(i === 0 ? C.red : C.redD, x, yTop - i, z, 0.1));
}
function hangCorn(w, x, y, z) { for (let i = 0; i < 5; i++) w.set(x, y - i, z, jitter(C.gold, x, y - i, z, 0.1)); }
function hangChili(w, x, y, z) { for (let i = 0; i < 5; i++) w.set(x, y - i, z, jitter(C.red, x, y - i, z, 0.1)); }

// ---------- 树 ----------
function ballCanopy(w, cx, cy, cz, r, palette) {
  for (let dx = -r; dx <= r; dx++)
    for (let dy = -r; dy <= r; dy++)
      for (let dz = -r; dz <= r; dz++) {
        const d2 = dx * dx + dy * dy * 1.4 + dz * dz;
        if (d2 > r * r) continue;
        if (d2 > (r - 1) * (r - 1) && hash3(cx + dx, cy + dy, cz + dz) < 0.35) continue;
        w.set(cx + dx, cy + dy, cz + dz, palette(cx + dx, cy + dy, cz + dz));
      }
}

const autumnPalette = (x, y, z) => {
  const r = hash3(x, y, z);
  return jitter(r < 0.35 ? C.leafRed : r < 0.65 ? C.leafOrange : r < 0.88 ? C.leafGold : C.leafOlive, x, y, z, 0.1);
};
const persimmonPalette = (x, y, z) => {
  const r = hash3(x, y, z);
  return r < 0.55 ? jitter(C.orange, x, y, z, 0.08)
       : r < 0.75 ? jitter(C.leafOrange, x, y, z, 0.1)
       : jitter(C.leafOlive, x, y, z, 0.1);
};
const goldPalette = (x, y, z) => jitter(hash3(x, y, z) < 0.7 ? C.leafGold : C.leafOrange, x, y, z, 0.1);
const pinePalette = (x, y, z) => jitter(C.leafPine, x, y, z, 0.12);
const camphorPalette = (x, y, z) => jitter(hash3(x, y, z) < 0.8 ? C.leafPine : C.leafOlive, x, y, z, 0.1);

function trunkTo(w, x, y0, z, y1, leanX = 0, leanZ = 0) {
  const n = y1 - y0;
  for (let i = 0; i <= n; i++) {
    const t = i / Math.max(1, n);
    const px = Math.round(x + leanX * t * t);
    const pz = Math.round(z + leanZ * t * t);
    w.set(px, y0 + i, pz, jitter(C.trunk, px, y0 + i, pz, 0.15));
    if (n > 4) w.set(px + 1, y0 + i, pz, jitter(C.trunk, px + 1, y0 + i, pz, 0.15));
  }
}

function trees(w) {
  // 前景大柿子树（左画框）
  trunkTo(w, -56, 0, 36, 13, 2, -1);
  ballCanopy(w, -58, 16, 34, 7, persimmonPalette);
  ballCanopy(w, -52, 14, 37, 5, persimmonPalette);
  // 前景银杏（右）
  trunkTo(w, 62, 0, 40, 11);
  ballCanopy(w, 62, 14, 39, 6, goldPalette);
  // 水口大树
  trunkTo(w, -76, 0, 38, 12, 1);
  ballCanopy(w, -77, 15, 37, 7, autumnPalette);
  trunkTo(w, 88, 0, 28, 13);
  ballCanopy(w, 89, 16, 27, 8, camphorPalette);
  // 村里点缀
  trunkTo(w, -52, 20, -14, 8); ballCanopy(w, -53, 30, -15, 4, autumnPalette);
  trunkTo(w, 44, 27, -48, 8);  ballCanopy(w, 45, 37, -49, 4, goldPalette);
  trunkTo(w, -20, 12, 30, 7);  ballCanopy(w, -21, 21, 30, 4, persimmonPalette);
  pine(w, -14, 27, -74); pine(w, 52, 20, -42);
  bambooClump(w, -58, 12, 2); bambooClump(w, 56, 12, 20); bambooClump(w, -18, 20, -12);
}

function pine(w, x, y, z) {
  for (let i = 0; i < 4; i++) w.set(x, y + 1 + i, z, jitter(C.trunk, x, y + 1 + i, z, 0.1));
  for (let layer = 0; layer < 4; layer++) {
    const r = 3 - layer * 0.7;
    for (let dx = -3; dx <= 3; dx++)
      for (let dz = -3; dz <= 3; dz++)
        if (dx * dx + dz * dz <= r * r)
          w.set(x + dx, y + 4 + layer * 2, z + dz, pinePalette(x + dx, y + 4 + layer * 2, z + dz));
  }
}

function bambooClump(w, x, y, z) {
  for (const [dx, dz] of [[0, 0], [2, 1], [-1, 2], [1, -2]]) {
    const h = 5 + Math.floor(hash3(x + dx, y, z + dz) * 4);
    for (let i = 1; i <= h; i++)
      w.set(x + dx, y + i, z + dz, jitter(C.bamboo, x + dx, y + i, z + dz, 0.15));
    w.set(x + dx, y + h + 1, z + dz, C.leafOlive);
  }
}

// ---------- 人物与小动物 ----------
// 双格宽小人：腿 y，身 y+1..y+2，头 y+3，斗笠 y+4
function person(w, x, y, z, opts = {}) {
  const { body = C.indigo, hat = true, bend = false } = opts;
  w.set(x, y, z, 0x3a3430); w.set(x + 1, y, z, 0x3a3430);          // 腿
  w.set(x, y + 1, z, body); w.set(x + 1, y + 1, z, body);          // 身
  w.set(x, y + 2, z, body); w.set(x + 1, y + 2, z, body);
  const hx = bend ? x - 1 : x;                                      // 弯腰时头前探
  w.set(hx, y + 3, z, C.skin);
  if (bend) w.set(x + 1, y + 3, z, body);
  else w.set(x + 1, y + 3, z, C.skin);
  if (hat) {
    w.set(hx - 1, y + 4, z, C.hat); w.set(hx, y + 4, z, C.hat); w.set(hx + 1, y + 4, z, C.hat);
  }
}

function chicken(w, x, y, z) {
  w.set(x, y, z, 0xf2efe6);
  w.set(x + 1, y, z, 0xf2efe6);
  w.set(x, y + 1, z, 0xf2efe6);
  w.set(x, y + 2, z, 0xc93a22);
}

function figures(w) {
  // 桥上挑担人（桥面 y3）
  person(w, 32, 4, 44, { body: C.indigo });
  w.set(31, 6, 44, C.wood); w.set(34, 6, 44, C.wood);              // 扁担
  w.set(31, 5, 44, C.goldD); w.set(34, 5, 44, C.goldD);            // 两筐
  // 晒场翻椒人（弯腰，在红匾旁）
  person(w, -31, 13, 19, { body: 0x8a4a3a, bend: true });
  // 院坝坐歇人
  person(w, 18, 21, -13, { body: 0x4a5a44, hat: false });
  // 猫：主屋B 屋脊（脊 y35）
  w.set(-3, 36, -30, 0xf2efe6); w.set(-2, 36, -30, 0x35322e); w.set(-4, 36, -30, 0x35322e);
  // 鸡
  chicken(w, 40, 13, 24); chicken(w, 43, 13, 22);
  // 狗（晒场东缘）
  w.set(38, 13, 30, 0x8a7a5e); w.set(39, 13, 30, 0x8a7a5e); w.set(38, 14, 30, 0x8a7a5e);
}
