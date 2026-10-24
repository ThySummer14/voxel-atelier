// 建筑与道具：风车、农舍、谷仓、桥、树、篱笆、草垛、水井。
// 全部直接写进大世界；风车叶片与窗玻璃单独成网格（要动、要发光）。

import { VoxelSet } from './voxel.js';
import { streamZ, SITE, PATH } from './world.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// 太阳在西北低空：朝 -x / -z 的面更亮一点，让体块自带体积感
function litBias(x, y, z, cx, cy, cz) {
  const dx = x - cx, dy = y - cy, dz = z - cz;
  return -dx * 0.55 - dz * 0.62 + dy * 0.45;
}

function flatten(ctx, x0, z0, x1, z1, level) {
  const { world, height } = ctx;
  for (let z = z0; z <= z1; z++)
    for (let x = x0; x <= x1; x++) {
      const h = height[z * ctx.W + x];
      for (let y = Math.min(h, level); y <= Math.max(h, level); y++) {
        if (y < 1) continue;
        world.set(x, y, z, level >= h ? 0x7d7458 : ctx.C.soilMid);
      }
      height[z * ctx.W + x] = level;
    }
}

// ---------------- 风车 ----------------
export function buildWindmill(ctx) {
  const { world, sails, glow, C, height, W } = ctx;
  const [cx, cz] = SITE.mill;
  const gy = Math.max(height[cz * W + cx], height[cz * W + cx + 2]);
  const base = gy - 3;

  flatten(ctx, cx - 7, cz - 7, cx + 7, cz + 7, gy - 2);

  // 塔身：石砌，收分
  const towerH = 25;
  for (let i = 0; i <= towerH; i++) {
    const t = i / towerH;
    const r = 6.1 - t * 2.2;
    const y = base + i;
    for (let dz = -8; dz <= 8; dz++)
      for (let dx = -8; dx <= 8; dx++) {
        if (dx * dx + dz * dz > r * r) continue;
        const c = ((dx + dz + i) % 3 === 0) ? C.stone2 : ((dx * dz + i) % 5 === 0 ? C.stone3 : C.stone);
        world.set(cx + dx, y, cz + dz, c);
      }
  }
  // 环带
  for (let dz = -7; dz <= 7; dz++)
    for (let dx = -7; dx <= 7; dx++) {
      if (dx * dx + dz * dz > 49) continue;
      world.set(cx + dx, base + 20, cz + dz, C.stoneDark);
      world.set(cx + dx, base + 21, cz + dz, C.stone2);
    }
  // 门与窗
  world.box(cx - 1, base + 1, cz + 5, cx + 1, base + 5, cz + 7, C.door);
  glow.box(cx - 1, base + 13, cz + 5, cx + 1, base + 15, cz + 6, 0xffe0a8);
  glow.box(cx + 5, base + 9, cz - 1, cx + 6, base + 11, cz + 1, 0xffd79a);

  // 圆顶
  const capY = base + towerH;
  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    const r = 5.0 * Math.sqrt(Math.max(0, 1 - t * t)) + 0.4;
    const y = capY + i;
    for (let dz = -6; dz <= 6; dz++)
      for (let dx = -6; dx <= 6; dx++) {
        if (dx * dx + dz * dz > r * r) continue;
        world.set(cx + dx, y, cz + dz, (dx + dz + i) % 2 ? C.slate : C.slate2);
      }
  }
  world.post(cx, cz, 1, capY + 7, capY + 9, 0x3f434a);

  // 叶片：以轮毂为原点建在 XY 平面，绕 z 轴转
  const hubY = base + 21;
  for (let arm = 0; arm < 4; arm++) {
    const th = (arm * Math.PI) / 2;
    const cs = Math.cos(th), sn = Math.sin(th);
    const put = (ax, ay, c, sway = 0) => {
      const rx = Math.round(ax * cs - ay * sn);
      const ry = Math.round(ax * sn + ay * cs);
      sails.set(rx, ry, 0, c, sway);
    };
    // 轮辐
    for (let x = 3; x <= 21; x++) put(x, 0, C.wood);
    for (let x = 5; x <= 20; x += 3) { put(x, 1, C.wood); put(x, -1, C.wood); }
    // 帆布格
    for (let x = 6; x <= 20; x++)
      for (let y = -3; y <= 3; y++) {
        const edge = Math.abs(y) === 3 || x === 20;
        if (!edge && (x + y) % 2 !== 0) continue;
        if (x < 8 && Math.abs(y) === 3) continue;
        const red = arm === 1 && x > 12 && y >= 0 && y <= 2;
        put(x, y, red ? C.sailRed : (Math.abs(y) >= 2 ? C.sailShade : C.sail), 90);
      }
  }
  // 轮毂画在叶片集合的原点，随叶片一起转
  for (let dz = -2; dz <= 2; dz++)
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const r = Math.hypot(dx, dy, dz);
        if (r > 2.3) continue;
        sails.set(dx, dy, dz, r < 1.5 ? C.iron : C.wood);
      }

  return { hub: [cx, hubY, cz + 6], base, cx, cz };
}

// ---------------- 农舍 ----------------
export function buildCottage(ctx) {
  const { world, glow, C, height, W } = ctx;
  const [cx, cz] = SITE.cottage;
  const hx = 9, hz = 6;               // 半尺寸
  const floor = Math.round(height[cz * W + cx]) - 1;
  flatten(ctx, cx - hx - 3, cz - hz - 3, cx + hx + 3, cz + hz + 3, floor);

  const wallH = 9;
  for (let y = floor + 1; y <= floor + wallH; y++)
    for (let z = cz - hz; z <= cz + hz; z++)
      for (let x = cx - hx; x <= cx + hx; x++) {
        const corner = Math.abs(x - cx) >= hx || Math.abs(z - cz) >= hz;
        const n = (x * 7 + z * 13 + y * 5) % 11;
        let c;
        if (y === floor + 1) c = C.stone2;
        else if (corner && n < 3) c = C.stone;
        else c = n < 2 ? C.plasterShade : n > 9 ? C.plasterWarm : C.plaster;
        world.set(x, y, z, c);
      }

  // 内部掏空 + 地板
  for (let y = floor + 2; y <= floor + wallH - 1; y++)
    for (let z = cz - hz + 1; z <= cz + hz - 1; z++)
      for (let x = cx - hx + 1; x <= cx + hx - 1; x++) {
        const i = world.idx(x, y, z);
        if (y < world.h) world.solid[i] = 0;
      }
  for (let z = cz - hz + 1; z <= cz + hz - 1; z++)
    for (let x = cx - hx + 1; x <= cx + hx - 1; x++)
      world.set(x, floor + 1, z, C.woodDark);

  // 双坡顶
  const roofBase = floor + wallH;
  for (let x = cx - hx - 1; x <= cx + hx + 1; x++)
    for (let z = cz - hz - 1; z <= cz + hz + 1; z++) {
      const t = Math.abs(z - cz) / (hz + 1);
      const top = roofBase + Math.round((1 - t) * 6);
      for (let y = roofBase + 1; y <= top; y++) {
        const ridge = y >= top - 1;
        const c = ridge ? C.roofC : ((x + z + y) % 3 === 0 ? C.roofB : (y % 2 ? C.roofA : C.roofC));
        world.set(x, y, z, c);
      }
    }
  // 屋脊
  for (let x = cx - hx - 1; x <= cx + hx + 1; x++) {
    world.set(x, roofBase + 7, cz, C.roofD);
    world.set(x, roofBase + 7, cz - 1, C.roofD);
    world.set(x, roofBase + 7, cz + 1, C.roofD);
  }

  // 烟囱
  const chx = cx + hx - 2, chz = cz - 2;
  for (let y = floor + 1; y <= roofBase + 10; y++)
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.abs(dx) + Math.abs(dz) > 1 && y < roofBase + 6) continue;
        world.set(chx + dx, y, chz + dz, (dx + dz + y) % 3 === 0 ? C.stone2 : C.stone);
      }

  // 门（朝 +z，正对相机）
  const dz0 = cz + hz;
  world.box(cx - 1, floor + 1, dz0, cx + 1, floor + 5, dz0, C.door);
  world.box(cx - 2, floor + 6, dz0, cx + 2, floor + 6, dz0, C.wood);
  // 窗（发光玻璃）
  for (const [wx, wy] of [[cx - 5, floor + 5], [cx + 5, floor + 5], [cx, floor + 6]]) {
    glow.box(wx - 1, wy, dz0, wx + 1, wy + 2, dz0, 0xffdca0);
    world.box(wx - 1, wy - 1, dz0 - 1, wx + 1, wy - 1, dz0 + 1, C.wood);
    world.box(wx - 1, wy + 3, dz0 - 1, wx + 1, wy + 3, dz0 + 1, C.wood);
    world.box(wx - 2, wy - 1, dz0, wx - 2, wy + 3, dz0, C.wood);
    world.box(wx + 2, wy - 1, dz0, wx + 2, wy + 3, dz0, C.wood);
  }
  // 侧窗
  glow.box(cx + hx, floor + 5, cz - 2, cx + hx, floor + 7, cz + 2, 0xffd79a);

  return { floor, roofBase, chimney: [chx, roofBase + 11, chz], cx, cz, hx: hx + 1, hz: hz + 1, top: roofBase + 8 };
}

// ---------------- 谷仓 ----------------
export function buildBarn(ctx) {
  const { world, glow, C, height, W } = ctx;
  const [cx, cz] = SITE.barn;
  const hx = 6, hz = 5;
  const floor = Math.round(height[cz * W + cx]) - 1;
  flatten(ctx, cx - hx - 3, cz - hz - 3, cx + hx + 3, cz + hz + 3, floor);

  for (let y = floor + 1; y <= floor + 11; y++)
    for (let z = cz - hz; z <= cz + hz; z++)
      for (let x = cx - hx; x <= cx + hx; x++) {
        const plank = (y - floor - 1) % 3 === 0;
        const c = plank ? 0x9a4433 : ((x + y) % 4 === 0 ? 0xa94d38 : 0xb45540);
        world.set(x, y, z, c);
      }
  for (let y = floor + 2; y <= floor + 10; y++)
    for (let z = cz - hz + 1; z <= cz + hz - 1; z++)
      for (let x = cx - hx + 1; x <= cx + hx - 1; x++) {
        const i = world.idx(x, y, z);
        if (y < world.h) world.solid[i] = 0;
      }
  // 交叉木构（白色 X 撑）
  for (let k = 0; k <= 10; k++) {
    const y = floor + 1 + k;
    world.set(cx - hx - 1 + k, y, cz - hz, 0xe8dcc4);
    world.set(cx - hx - 1 + (10 - k), y, cz - hz, 0xe8dcc4);
    world.set(cx - hx - 1 + k, y, cz + hz, 0xe8dcc4);
    world.set(cx - hx - 1 + (10 - k), y, cz + hz, 0xe8dcc4);
  }
  // 门
  world.box(cx - 3, floor + 1, cz + hz, cx + 3, floor + 8, cz + hz, 0x54371f);
  world.box(cx, floor + 1, cz + hz, cx, floor + 8, cz + hz, 0x6b4527);
  // 顶
  for (let x = cx - hx - 1; x <= cx + hx + 1; x++)
    for (let z = cz - hz - 1; z <= cz + hz + 1; z++) {
      const t = Math.abs(z - cz) / (hz + 1);
      const top = floor + 11 + Math.round((1 - t) * 5);
      for (let y = floor + 12; y <= top; y++) world.set(x, y, z, (x + y) % 3 === 0 ? C.slate2 : C.slate);
    }
  glow.box(cx - 5, floor + 8, cz + hz, cx - 4, floor + 9, cz + hz, 0xffcf8c);
  glow.box(cx + 4, floor + 8, cz + hz, cx + 5, floor + 9, cz + hz, 0xffcf8c);
  return { floor, cx, cz, hx: hx + 1, hz: hz + 1, top: floor + 16 };
}

// ---------------- 小桥 ----------------
export function bridgeCrossing(ctx) {
  // 沿 PATH 找与溪流中线相交处
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1];
    const s0 = az - streamZ(ax), s1 = bz - streamZ(bx);
    if (s0 * s1 <= 0) {
      const t = s0 / (s0 - s1);
      return [Math.round(ax + (bx - ax) * t), Math.round(az + (bz - az) * t)];
    }
  }
  return [97, 138];
}

export function buildBridge(ctx, [bx, bz]) {
  const { world, C, height, W } = ctx;
  const y = 8;
  // 桥墩
  for (const off of [-4, 4])
    for (let dz = -2; dz <= 2; dz++)
      for (let dx = -1; dx <= 1; dx++)
        world.post(bx + off, bz + dz, 1, 3, y - 1, C.stoneDark);
  // 桥面
  for (let dz = -6; dz <= 6; dz++)
    for (let dx = -1; dx <= 1; dx++) {
      const rise = Math.round(2 * Math.cos((dz / 6) * Math.PI * 0.5));
      const yy = y + rise;
      world.set(bx + dx, yy, bz + dz, (dz + dx) % 2 ? C.woodLight : C.wood);
      for (let k = 1; k <= rise; k++) world.set(bx + dx, yy - k, bz + dz, C.woodDark);
    }
  // 栏杆
  for (let dz = -6; dz <= 6; dz++) {
    const rise = Math.round(2 * Math.cos((dz / 6) * Math.PI * 0.5));
    for (const dx of [-1, 1]) {
      world.set(bx + dx, y + rise + 1, bz + dz, C.wood);
      world.set(bx + dx, y + rise + 2, bz + dz, C.woodDark);
    }
    if (dz % 2 === 0) {
      for (const dx of [-1, 1]) world.set(bx + dx, y + rise + 3, bz + dz, C.woodLight);
    }
  }
  // 引桥两端接回地面
  for (const dir of [-1, 1])
    for (let dz = 7; dz <= 12; dz++) {
      const zz = bz + dir * dz;
      const h = height[clamp(zz, 0, W - 1) * W + bx];
      const yy = y + 1 + Math.round(-(dz - 6) * 0.55);
      for (let k = Math.min(h, yy); k <= Math.max(h, yy); k++) world.set(bx, k, zz, C.path);
    }
}

// ---------------- 树 ----------------
function oak(ctx, cx, cz, scale, seedIdx) {
  const { world, C, N, height, W } = ctx;
  const gy = height[cz * W + cx];
  const trunkH = Math.round((7 + N.value2(seedIdx, 3.1) * 4) * scale);
  const r = scale > 1.1 ? 1.8 : 1.2;
  world.post(cx, cz, r, gy, gy + trunkH, C.wood);
  world.post(cx, cz, r * 0.7, gy + trunkH, gy + trunkH + 2, C.woodLight);
  // 树冠：椭球 + 噪声
  const cr = (5.4 + N.value2(seedIdx, 7.7) * 2.2) * scale;
  const cyy = gy + trunkH + cr * 0.55;
  const cz2 = cr * 0.82;
  for (let y = Math.floor(gy + trunkH - 1); y <= Math.ceil(cyy + cr * 0.9); y++)
    for (let dz = -Math.ceil(cr); dz <= Math.ceil(cr); dz++)
      for (let dx = -Math.ceil(cr); dx <= Math.ceil(cr); dx++) {
        const ex = dx / cr, ey = (y - cyy) / cr, ez = dz / cz2;
        const dd = ex * ex + ey * ey + ez * ez;
        const wob = N.value3((cx + dx) * 0.22 + seedIdx, y * 0.22, (cz + dz) * 0.22) * 0.42;
        if (dd > 1 + wob - 0.22) continue;
        if (dd < 0.12) continue;
        const bias = litBias(cx + dx, y, cz + dz, cx, cyy, cz);
        const nz = N.value3((cx + dx) * 0.5, y * 0.5, (cz + dz) * 0.5);
        let c;
        if (bias > 1.1) c = nz > 0.55 ? C.leafGold3 : C.leafGold;
        else if (bias > -0.4) c = nz > 0.5 ? C.leafGold : C.leafOlive;
        else c = nz > 0.6 ? C.leafGold2 : C.leafDeep;
        world.set(cx + dx, y, cz + dz, c);
      }
  return gy;
}

function poplar(ctx, cx, cz, seedIdx) {
  const { world, C, N, height, W } = ctx;
  const gy = height[cz * W + cx];
  const hgt = Math.round(12 + N.value2(seedIdx, 11.3) * 7);
  world.post(cx, cz, 1, gy, gy + hgt, C.wood);
  for (let i = 0; i <= hgt + 6; i++) {
    const t = i / hgt;
    const r = 2.6 * Math.sin(Math.min(1, t * 1.12) * Math.PI) + 0.5;
    const yy = gy + Math.round(t * hgt * 0.92);
    for (let dz = -4; dz <= 4; dz++)
      for (let dx = -4; dx <= 4; dx++) {
        if (dx * dx + dz * dz > r * r) continue;
        if (Math.hypot(dx, dz) < 1.0 && t < 0.55) continue;
        const bias = litBias(cx + dx, yy, cz + dz, cx, yy, cz);
        const nz = N.value3((cx + dx) * 0.4, yy * 0.4, (cz + dz) * 0.4);
        const c = bias > 1 ? (nz > 0.5 ? C.leafGold3 : C.leafGold)
          : bias > -0.5 ? (nz > 0.55 ? C.leafOlive : C.leafGreen)
            : C.leafDeep;
        world.set(cx + dx, yy, cz + dz, c);
      }
  }
}

function bush(ctx, cx, cz, seedIdx) {
  const { world, C, N } = ctx;
  const r = 1.6 + N.value2(seedIdx, 2.2) * 1.6;
  const hgt = Math.max(2, Math.round(r));
  for (let y = 0; y <= hgt; y++)
    for (let dz = -3; dz <= 3; dz++)
      for (let dx = -3; dx <= 3; dx++) {
        const dd = (dx * dx + dz * dz) / (r * r) + (y - hgt * 0.6) * (y - hgt * 0.6) / (r * r);
        if (dd > 1) continue;
        if (dd < 0.2 && y === 0) continue;
        const bias = litBias(cx + dx, y, cz + dz, cx, hgt * 0.6, cz);
        const nz = N.value3((cx + dx) * 0.7, y * 0.7, (cz + dz) * 0.7);
        const c = bias > 1 ? (nz > 0.5 ? C.leafGold3 : C.leafGold) : bias > -0.6 ? (nz > 0.6 ? C.leafOlive : C.leafGreen) : C.leafDeep;
        world.setIfEmpty(cx + dx, y, cz + dz, c, 60);
      }
}

export function buildTrees(ctx) {
  const { N, W, D } = ctx;
  const [mx, mz] = SITE.mill, [ox, oz] = SITE.cottage, [bx, bz] = SITE.barn;

  // 农舍周围的橡树群（避开小路与桥）
  oak(ctx, 76, 124, 1.15, 1.2);
  oak(ctx, 78, 108, 1.0, 2.7);
  oak(ctx, 117, 115, 1.25, 3.4);
  oak(ctx, 121, 141, 0.95, 4.1);
  oak(ctx, 66, 143, 1.05, 5.6);
  oak(ctx, 132, 122, 0.9, 6.9);

  // 风车山两侧的大树，给主体做陪衬
  oak(ctx, 168, 76, 1.3, 7.2);
  oak(ctx, 138, 68, 1.1, 8.4);
  oak(ctx, 186, 116, 1.05, 9.1);

  // 远处坡上的孤树
  oak(ctx, 58, 56, 1.15, 10.7);
  oak(ctx, 108, 42, 1.2, 11.3);
  oak(ctx, 200, 62, 1.0, 12.9);
  oak(ctx, 32, 84, 0.95, 13.6);

  // 溪边白杨列
  for (let i = 0; i < 7; i++) {
    const x = 132 + i * 11;
    const z = streamZ(x) - 7 - (i % 2) * 1.5;
    poplar(ctx, Math.round(x), Math.round(z), 20 + i * 1.7);
  }
  for (let i = 0; i < 5; i++) {
    const x = 22 + i * 13;
    const z = streamZ(x) + 8 + (i % 3);
    poplar(ctx, Math.round(x), Math.round(z), 40 + i * 2.3);
  }
  for (let i = 0; i < 4; i++) {
    const x = 148 + i * 12;
    poplar(ctx, Math.round(x), Math.round(streamZ(x) + 9), 60 + i * 1.1);
  }

  // 灌木丛：沿篱笆与河岸
  for (let i = 0; i < 110; i++) {
    const x = 8 + N.value2(i * 1.7, 0.5) * (W - 16);
    const z = 8 + N.value2(0.5, i * 2.3) * (D - 16);
    const near = Math.abs(z - streamZ(x)) < 9;
    const nearPath = Math.min(
      Math.hypot(x - 96, z - 140), Math.hypot(x - 96, z - 126), Math.hypot(x - 152, z - 96),
    ) < 20;
    if (!near && !nearPath && N.value2(i * 3.1, i * 1.3) > 0.5) continue;
    if (Math.hypot(x - mx, z - mz) < 12 || Math.hypot(x - ox, z - oz) < 15 || Math.hypot(x - bx, z - bz) < 12) continue;
    bush(ctx, Math.round(x), Math.round(z), i * 5.3);
  }
}

// ---------------- 篱笆 / 草垛 / 水井 ----------------
export function buildFences(ctx) {
  const { world, C, height, W, D } = ctx;
  const post = (x, z) => {
    const gy = height[clamp(z, 0, D - 1) * W + clamp(x, 0, W - 1)];
    for (let y = gy + 1; y <= gy + 3; y++) world.set(x, y, z, y === gy + 3 ? C.woodLight : C.wood);
    return gy;
  };
  const rail = (x0, z0, x1, z1) => {
    const steps = Math.ceil(Math.hypot(x1 - x0, z1 - z0));
    let py = null;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(x0 + (x1 - x0) * t), z = Math.round(z0 + (z1 - z0) * t);
      if (i % 4 === 0) { py = post(x, z); continue; }
      const gy = height[clamp(z, 0, D - 1) * W + clamp(x, 0, W - 1)];
      if (py === null) py = gy;
      world.set(x, py + 2, z, C.wood);
      world.set(x, py + 3, z, C.woodDark);
      py = gy;
    }
  };
  // 前景：小路东侧的篱笆，顺着引导线往画面深处收
  rail(126, 206, 118, 190);
  rail(118, 190, 112, 178);
  // 农舍的菜园
  rail(80, 138, 68, 140);
  rail(68, 140, 66, 154);
  rail(110, 136, 122, 140);
  // 谷仓旁的牧场
  rail(162, 116, 156, 128);
  rail(188, 110, 196, 122);
}

export function buildHaystacks(ctx) {
  const { world, C, height, W, N } = ctx;
  const spots = [[166, 114], [173, 118], [161, 120], [126, 152], [134, 158], [142, 112]];
  spots.forEach(([cx, cz], i) => {
    const gy = height[cz * W + cx];
    const r = 3.4 + N.value2(i * 3.3, 1.1) * 1.2;
    for (let y = 0; y <= Math.round(r * 1.9); y++) {
      const t = y / (r * 1.9);
      const rr = r * (1 - t * t * 0.92) + 0.4;
      for (let dz = -5; dz <= 5; dz++)
        for (let dx = -5; dx <= 5; dx++) {
          if (dx * dx + dz * dz > rr * rr) continue;
          const bias = litBias(cx + dx, gy + y, cz + dz, cx, gy + r, cz);
          const c = bias > 1 ? C.straw : bias > -0.8 ? C.straw2 : C.strawDark;
          world.set(cx + dx, gy + y + 1, cz + dz, c);
        }
    }
    world.post(cx, cz, 1, gy + Math.round(r * 1.9) + 1, gy + Math.round(r * 1.9) + 2, C.wood);
  });
}

export function buildWell(ctx) {
  const { world, glow, C, height, W } = ctx;
  const cx = 80, cz = 138;
  const gy = height[cz * W + cx];
  for (let y = gy + 1; y <= gy + 3; y++)
    for (let dz = -2; dz <= 2; dz++)
      for (let dx = -2; dx <= 2; dx++) {
        const d = Math.hypot(dx, dz);
        if (d > 2.3) continue;
        if (d > 1.3 && y < gy + 3) continue;
        world.set(cx + dx, y, cz + dz, (dx + dz + y) % 3 === 0 ? C.stone2 : C.stone);
      }
  world.disc(cx, cz, 1.2, gy + 3, 0x2a3038);
  for (const dx of [-2, 2]) world.post(cx + dx, cz, 1, gy + 3, gy + 8, C.wood);
  for (let x = cx - 3; x <= cx + 3; x++)
    for (let z = cz - 2; z <= cz + 2; z++) {
      const t = Math.abs(x - cx) / 3.4;
      const top = gy + 9 - Math.round(t * 2);
      for (let y = gy + 8; y <= top; y++) world.set(x, y, z, (x + y) % 2 ? C.roofB : C.roofA);
    }
  glow.set(cx, gy + 5, cz + 1, 0xffcf8c);
  world.set(cx, gy + 6, cz + 1, C.wood);
}
