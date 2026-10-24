// sculpt.js — 候风地动仪 · 体素雕刻器
// 纯模块：输出整数格体素 {x,y,z,c}（c 为 PAL 索引），浏览器与 Node 工具链共用。
// 静态件合并渲染；动态件（龙口/铜丸/蟾口/火焰）单独返回，由主程序驱动。

import { PAL, L, DIRS, dirVec, angOf } from './spec.js';

// 确定性伪随机（浏览器与 Node 完全一致）
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 基础 builder ──────────────────────────────────────────────────────
function box(arr, x0, y0, z0, x1, y1, z1, c) {
  for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
        arr.push({ x, y, z, c });
}

// 圆柱/圆环壳（可加角度过滤）
function cyl(arr, cx, cz, rOut, rIn, y0, y1, c, filter) {
  const R = Math.ceil(rOut);
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const d = Math.hypot(x, z);
      if (d > rOut || d < rIn) continue;
      for (let y = y0; y <= y1; y++) {
        if (filter && !filter(x, z, d, y)) continue;
        arr.push({ x: x + cx, y, z: z + cz, c });
      }
    }
}

function dedupe(voxels) {
  const m = new Map();
  for (const v of voxels) m.set(`${v.x},${v.y},${v.z}`, v);
  return [...m.values()];
}

// 剖面判定：中心在 k=0（东）的半宽 wedgeHalf 度窗口内
function inWedge(x, z, y) {
  if (y < L.wedgeY0 || y > L.wedgeY1) return false;
  const a = angOf(x, z);
  const d = Math.min(a, 360 - a);
  return d <= L.wedgeHalf;
}

// ── 龙首（局部坐标：r 径向朝外，t 切向，y 高）────────────────────────
function buildDragon(parts, k) {
  const { x: dx, z: dz } = dirVec(k);
  const tx = -dz, tz = dx; // 切向
  const neck = [], head = [], jaw = [], horns = [], eyes = [];
  const put = (arr, r, t, y, c) => {
    const wx = Math.round(dx * r + tx * t);
    const wz = Math.round(dz * r + tz * t);
    arr.push({ x: wx, y, z: wz, c });
  };
  const boxK = (arr, r0, r1, t0, t1, y0, y1, c) => {
    for (let r = r0; r <= r1; r++)
      for (let t = t0; t <= t1; t++)
        for (let y = y0; y <= y1; y++) put(arr, r, t, y, c);
  };
  // 颈部（自壳内伸出）
  boxK(neck, 12, 17, -2, 2, L.dragonY - 1, L.dragonY + 1, PAL.bronze);
  boxK(neck, 13, 16, -2, 2, L.dragonY + 2, L.dragonY + 2, PAL.bronzeDark); // 颈脊
  // 鬃毛（颈脊上的铜绿立鬃）
  boxK(neck, 12, 16, 0, 0, L.dragonY + 3, L.dragonY + 3, PAL.patina);
  put(neck, 13, -2, L.dragonY + 2, PAL.patinaDark);
  put(neck, 13, 2, L.dragonY + 2, PAL.patinaDark);
  // 颅
  boxK(head, 15, 19, -2, 2, L.dragonY + 1, L.dragonY + 4, PAL.bronze);
  // 吻部（上颚固定，与下颚间留口含丸缝）
  boxK(head, 19, 21, -1, 1, L.dragonY + 3, L.dragonY + 4, PAL.bronze);
  boxK(head, 21, 21, -1, 1, L.dragonY + 4, L.dragonY + 4, PAL.bronzeLight); // 吻端高光
  // 龙目（颅顶前角，俯视可见）
  put(eyes, 16, -3, L.dragonY + 5, PAL.eyeGlow);
  put(eyes, 16, 3, L.dragonY + 5, PAL.eyeGlow);
  // 龙须（吻端两侧下垂）
  put(head, 20, -2, L.dragonY + 3, PAL.gold);
  put(head, 20, -2, L.dragonY + 4, PAL.gold);
  put(head, 20, 2, L.dragonY + 3, PAL.gold);
  put(head, 20, 2, L.dragonY + 4, PAL.gold);
  // 双角（后掠，双排）
  for (const t0 of [-2, -1, 1, 2]) {
    put(horns, 15, t0, L.dragonY + 5, PAL.bronzeDark);
    put(horns, 14, t0, L.dragonY + 6, PAL.bronzeDark);
    put(horns, 13, t0, L.dragonY + 7, PAL.gold);
  }
  // 下颚（动态件，绕 r=19 铰链下旋）
  boxK(jaw, 19, 21, -1, 1, L.dragonY + 1, L.dragonY + 1, PAL.bronzeDark);
  put(jaw, 21, 0, L.dragonY + 1, PAL.gold); // 颚端金饰

  parts.push({ key: `neck${k}`, voxels: dedupe(neck) });
  parts.push({ key: `head${k}`, voxels: dedupe(head) });
  // 角与眼并入首件（静态）
  parts[parts.length - 1].voxels = dedupe([...parts[parts.length - 1].voxels, ...horns, ...eyes]);
  const pivot = { x: Math.round(dx * 19), y: L.dragonY + 1, z: Math.round(dz * 19) };
  return {
    jawVoxels: dedupe(jaw).map((v) => ({ x: v.x - pivot.x, y: v.y - pivot.y, z: v.z - pivot.z, c: v.c })),
    pivot,
  };
}

// ── 蟾蜍（伏于底座沿，张口承丸）──────────────────────────────────────
function buildToad(parts, k) {
  const { x: dx, z: dz } = dirVec(k);
  const tx = -dz, tz = dx;
  const body = [], glow = [];
  const boxK = (arr, r0, r1, t0, t1, y0, y1, c) => {
    for (let r = r0; r <= r1; r++)
      for (let t = t0; t <= t1; t++)
        for (let y = y0; y <= y1; y++)
          arr.push({ x: Math.round(dx * r + tx * t), y, z: Math.round(dz * r + tz * t), c });
  };
  const put = (arr, r, t, y, c) =>
    arr.push({ x: Math.round(dx * r + tx * t), y, z: Math.round(dz * r + tz * t), c });
  const baseY = L.pedestalY1;
  // 体
  boxK(body, 14, 18, -2, 2, baseY, baseY + 3, PAL.toad);
  boxK(body, 15, 17, -1, 1, baseY + 4, baseY + 4, PAL.toad);
  // 吻部（前伸）
  boxK(body, 18, 20, -1, 1, baseY + 1, baseY + 4, PAL.toad);
  // 口腔（挖空：r19..20, y+3..+4）
  boxK(glow, 19, 20, -1, 1, baseY + 1, baseY + 2, PAL.toadGlow); // 承丸底板（暖光）
  // 疣粒
  put(body, 16, 0, baseY + 5, PAL.toadDark);
  put(body, 16, -2, baseY + 5, PAL.toadDark);
  put(body, 16, 2, baseY + 5, PAL.toadDark);
  // 目（顶部外突）
  put(body, 17, -2, baseY + 5, PAL.toadDark);
  put(body, 17, 2, baseY + 5, PAL.toadDark);
  put(glow, 17, -2, baseY + 5, PAL.eyeGlow);
  put(glow, 17, 2, baseY + 5, PAL.eyeGlow);
  // 四肢暗示
  put(body, 14, -2, baseY, PAL.toadDark);
  put(body, 14, 2, baseY, PAL.toadDark);

  const mouth = {
    x: Math.round(dx * 19.5 + tx * 0),
    y: baseY + 2.5,
    z: Math.round(dz * 19.5 + tz * 0),
  };
  parts.push({ key: `toad${k}`, voxels: dedupe(body) });
  return { glowVoxels: dedupe(glow), mouth };
}

// ── 主构建 ────────────────────────────────────────────────────────────
export function build() {
  const rnd = mulberry32(20260926);
  const parts = [];
  const dynamic = { jaws: [], balls: [], toadGlows: [], fires: [] };
  const meta = { ballHome: [], toadMouth: [], jawPivot: [], firePos: [] };

  // ── 浮岩岛 ──
  const rock = [], moss = [], shards = [];
  const jag = new Map(); // 每 3° 一个底深
  for (let a = 0; a < 360; a += 3) jag.set(a, 6 + Math.floor(rnd() * 4));
  cyl(rock, 0, 0, L.rockR - 1, 0, 0, 0, PAL.rock); // 顶面
  for (let y = 1; y <= -L.rockBot; y++) {
    const rr = L.rockR - 1 - y * 1.4;
    if (rr < 3) break;
    cyl(rock, 0, 0, rr, Math.max(0, rr - 2.5), -y, -y, y % 2 ? PAL.rock : PAL.rockDark);
  }
  // 锯齿底缘 + 垂锥
  for (let a = 0; a < 360; a += 3) {
    const d = jag.get(a);
    const rad = ((a * Math.PI) / 180);
    const rr = L.rockR - 1 - d * 1.4;
    if (rr < 2) continue;
    for (let y = -d + 2; y <= -d + 5; y++) {
      const x = Math.round(Math.cos(rad) * rr), z = Math.round(Math.sin(rad) * rr);
      rock.push({ x, y, z, c: PAL.rockDark });
    }
  }
  // 顶面苔斑
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, r = 19 + rnd() * 6;
    moss.push({ x: Math.round(Math.cos(a) * r), y: 0, z: Math.round(Math.sin(a) * r), c: PAL.moss });
  }
  // 浮石碎块
  const shardDefs = [
    { a: 100, r: 38, y: 2, s: 16 }, { a: 205, r: 42, y: -3, s: 11 }, { a: 320, r: 36, y: 5, s: 8 },
  ];
  for (const sd of shardDefs) {
    const srnd = mulberry32(sd.s);
    const cx = Math.cos((sd.a * Math.PI) / 180) * sd.r;
    const cz = Math.sin((sd.a * Math.PI) / 180) * sd.r;
    for (let i = 0; i < sd.s; i++) {
      const ox = Math.round((srnd() - 0.5) * 6), oy = Math.round((srnd() - 0.5) * 4), oz = Math.round((srnd() - 0.5) * 6);
      shards.push({ x: Math.round(cx) + ox, y: sd.y + oy, z: Math.round(cz) + oz, c: srnd() > 0.5 ? PAL.rock : PAL.rockDark });
    }
  }
  parts.push({ key: 'rock', voxels: dedupe([...rock, ...moss]) });
  parts.push({ key: 'shards', voxels: dedupe(shards) });

  // ── 石底座（两层）──
  const ped = [];
  cyl(ped, 0, 0, L.pedestalR, 0, 0, 1, PAL.stone);
  cyl(ped, 0, 0, L.pedestalR - 1, 0, 2, L.pedestalY1, PAL.stoneDark);
  for (let k = 0; k < 8; k++) { // 八方定位凹记
    const { x: dx, z: dz } = dirVec(k);
    ped.push({ x: Math.round(dx * 17), y: L.pedestalY1, z: Math.round(dz * 17), c: PAL.stone });
  }
  parts.push({ key: 'pedestal', voxels: dedupe(ped) });

  // ── 尊体下段（y3..5，含足檐；铜绿淤积）──
  const shellLow = [];
  cyl(shellLow, 0, 0, L.R + 0.5, L.R - 2.5, L.shellY0, L.shellY0, PAL.bronzeDark);
  cyl(shellLow, 0, 0, L.R, L.R - 2.5, L.shellY0 + 1, L.shellY1 - 3, PAL.bronze);
  for (const v of shellLow) { // 底部铜绿淤积（确定性）
    if (v.y <= L.shellY0 + 2 && rnd() < 0.16) v.c = PAL.patinaDark;
  }
  parts.push({ key: 'shellLow', voxels: dedupe(shellLow) });

  // ── 尊体中段（y6..19，剖面开窗 + 乳钉纹）──
  const shellMid = [], studs = [];
  cyl(shellMid, 0, 0, L.R, L.R - 2.5, L.wedgeY0, L.wedgeY1, PAL.bronze, (x, z, d, y) => !inWedge(x, z, y));
  for (let i = 0; i < 24; i++) {
    const a = ((i * 15) * Math.PI) / 180;
    const x = Math.round(Math.cos(a) * (L.R + 0.5)), z = Math.round(Math.sin(a) * (L.R + 0.5));
    if (Math.min(angOf(x, z), 360 - angOf(x, z)) < 32) continue; // 避开剖面
    for (const y of [8, 16]) studs.push({ x, y, z, c: PAL.bronzeLight });
  }
  parts.push({ key: 'shellMid', voxels: dedupe([...shellMid, ...studs]) });

  // ── 剖面窗框（门柱 + 上下横梁）──
  const frame = [];
  for (const s of [-1, 1]) {
    const a = ((s * 28) * Math.PI) / 180;
    const x = Math.cos(a) * (L.R - 0.5), z = Math.sin(a) * (L.R - 0.5);
    box(frame, Math.round(x) - 1, L.wedgeY0, Math.round(z) - 1, Math.round(x) + 1, L.wedgeY1, Math.round(z) + 1, PAL.bronzeDark);
  }
  for (const y of [L.wedgeY0, L.wedgeY1]) { // 横梁
    for (let a = -L.wedgeHalf; a <= L.wedgeHalf; a += 1) {
      const rad = (a * Math.PI) / 180;
      frame.push({ x: Math.round(Math.cos(rad) * (L.R - 0.5)), y, z: Math.round(Math.sin(rad) * (L.R - 0.5)), c: PAL.bronzeDark });
    }
  }
  parts.push({ key: 'frame', voxels: dedupe(frame) });

  // ── 尊体上段（y20..21 完整环 + 龙颈台）──
  const shellUp = [], mounts = [];
  cyl(shellUp, 0, 0, L.R - 0.5, L.R - 3, L.shellY1 - 2, L.shellY1 - 1, PAL.bronze);
  for (let k = 0; k < 8; k++) {
    const { x: dx, z: dz } = dirVec(k);
    const tx = -dz, tz = dx;
    for (let r = L.R - 3; r <= L.R + 2; r++)
      for (let t = -2; t <= 2; t++)
        for (let y = L.shellY1 - 2; y <= L.shellY1 + 1; y++)
          mounts.push({ x: Math.round(dx * r + tx * t), y, z: Math.round(dz * r + tz * t), c: PAL.bronzeDark });
  }
  parts.push({ key: 'shellUp', voxels: dedupe([...shellUp, ...mounts]) });

  // ── 盖（阶梯穹 + 鎏金乳钉 + 中钮）──
  const lid = [];
  cyl(lid, 0, 0, L.R - 0.5, 0, L.lidY0, L.lidY0, PAL.bronzeDark);
  cyl(lid, 0, 0, L.R - 2.5, 3, L.lidY0 + 1, L.lidY0 + 1, PAL.bronze);
  cyl(lid, 0, 0, 8, 3, L.lidY0 + 2, L.lidY0 + 2, PAL.bronze);
  cyl(lid, 0, 0, 3, 0, L.lidY0 + 3, L.lidY1, PAL.bronzeLight);
  for (let k = 0; k < 8; k++) {
    const { x: dx, z: dz } = dirVec(k);
    lid.push({ x: Math.round(dx * (L.R - 1.5)), y: L.lidY0 + 1, z: Math.round(dz * (L.R - 1.5)), c: PAL.gold });
  }
  parts.push({ key: 'lid', voxels: dedupe(lid) });

  // ── 都柱（中央，剖面可见）──
  const pillar = [];
  cyl(pillar, 0, 0, 5, 0, L.pillarY0, L.pivotY, PAL.bronzeDark);
  cyl(pillar, 0, 0, L.pillarR, 0, L.pivotY, 19, PAL.bronze);
  cyl(pillar, 0, 0, 4, L.pillarR - 1, 11, 12, PAL.gold); // 金箍
  cyl(pillar, 0, 0, 4, L.pillarR - 1, 19, 20, PAL.bronzeLight); // 柱头
  parts.push({ key: 'pillar', voxels: dedupe(pillar) });

  // ── 八道（辐条杠杆 + 触发销）──
  const levers = [];
  for (let k = 0; k < 8; k++) {
    const { x: dx, z: dz } = dirVec(k);
    const tx = -dz, tz = dx;
    for (let r = 4; r <= 12; r++)
      for (let t = -1; t <= 1; t++)
        for (let y = L.leverY - 1; y <= L.leverY; y++)
          levers.push({ x: Math.round(dx * r + tx * t), y, z: Math.round(dz * r + tz * t), c: r > 10 ? PAL.bronzeDark : PAL.bronze });
    for (const t of [-1, 0, 1]) // 触发销（金尖）
      for (let y = L.leverY + 1; y <= L.leverY + 2; y++)
        levers.push({ x: Math.round(dx * 12 + tx * t), y, z: Math.round(dz * 12 + tz * t), c: y === L.leverY + 2 ? PAL.gold : PAL.bronzeDark });
  }
  cyl(levers, 0, 0, 4, 0, L.leverY - 1, L.leverY, PAL.bronzeDark); // 轮毂
  parts.push({ key: 'levers', voxels: dedupe(levers) });

  // ── 八龙 + 八蟾 + 铜丸 ──
  for (let k = 0; k < 8; k++) {
    const { x: dx, z: dz } = dirVec(k);
    const d = buildDragon(parts, k);
    dynamic.jaws.push({ k, key: `jaw${k}`, voxels: d.jawVoxels, pivot: d.pivot });
    meta.jawPivot.push(d.pivot);
    // 铜丸（2×2×2，口含露半）
    const bx = [], tx = -dz, tz = dx;
    for (let r = 21; r <= 22; r++)
      for (let t = 0; t <= 1; t++)
        for (let y = L.dragonY + 2; y <= L.dragonY + 3; y++)
          bx.push({ x: Math.round(dx * r + tx * t), y, z: Math.round(dz * r + tz * t), c: PAL.ball });
    dynamic.balls.push({ k, key: `ball${k}`, voxels: dedupe(bx) });
    meta.ballHome.push({ x: dx * 21.5, y: L.dragonY + 2.5, z: dz * 21.5 });

    const t = buildToad(parts, k);
    dynamic.toadGlows.push({ k, key: `toadGlow${k}`, voxels: t.glowVoxels });
    meta.toadMouth.push(t.mouth);
  }

  // ── 八座火盆（错开 22.5°）──
  const brazier = [], fire = [];
  // ── 悬灯（套在都柱上的灯环，照亮八道）──
  const lamp = [];
  for (let a = 0; a < 360; a += 3) {
    const rad = (a * Math.PI) / 180;
    const x = Math.cos(rad) * 4.6, z = Math.sin(rad) * 4.6;
    lamp.push({ x: Math.round(x), y: 13, z: Math.round(z), c: PAL.bronzeDark });
  }
  fire.push({ x: 4, y: 14, z: 0, c: PAL.fireHot });
  fire.push({ x: -4, y: 14, z: 0, c: PAL.fire });
  fire.push({ x: 0, y: 14, z: 4, c: PAL.fire });
  fire.push({ x: 0, y: 14, z: -4, c: PAL.ember });
  meta.firePos.push({ x: 0, y: 14.5, z: 0 });
  for (let k = 0; k < 8; k++) {
    const a = (((k * 45 + 22.5) * Math.PI) / 180);
    const cx = Math.round(Math.cos(a) * L.brazierR), cz = Math.round(Math.sin(a) * L.brazierR);
    box(brazier, cx - 1, L.pedestalY1, cz - 1, cx + 1, L.pedestalY1 + 1, cz + 1, PAL.wood);
    box(brazier, cx - 1, L.pedestalY1 + 2, cz - 1, cx + 1, L.pedestalY1 + 3, cz + 1, PAL.bronzeDark);
    box(fire, cx - 1, L.pedestalY1 + 3, cz, cx, L.pedestalY1 + 4, cz, PAL.fire);
    fire.push({ x: cx, y: L.pedestalY1 + 4, z: cz, c: PAL.fireHot });
    fire.push({ x: cx + 1, y: L.pedestalY1 + 3, z: cz + 1, c: PAL.ember });
    meta.firePos.push({ x: cx, y: L.pedestalY1 + 4, z: cz });
  }
  parts.push({ key: 'braziers', voxels: dedupe(brazier) });
  dynamic.fires.push({ key: 'fireAll', voxels: dedupe(fire) });
  parts.push({ key: 'lampRing', voxels: dedupe(lamp) });

  return { static: parts, dynamic, meta };
}
