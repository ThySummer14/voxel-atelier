import { World, jitter, mix, shade, hash3, fbm2, vnoise2, clamp, smoothstep } from './voxel.js';

// ============================================================================
//  《晚照盐田》 场景内容
//  退潮后的海岸盐场：盐池按盐度泛出薄荷/金/珊瑚/玫红，夕阳压海，
//  风车水轮汲海水上池，渔村亮灯，白鹭在浅池踱步。
// ============================================================================

// ---------------- 色板 ----------------
const SKY = { top: 0x1c1843, up: 0x453a72, mid: 0x7f4f7a, low: 0xcd6d5c, hz: 0xf5a35c, glow: 0xffd8a2, ground: 0x6b4a5e };
const SEA = { shal: 0x3d6274, mid: 0x2e4a6c, deep: 0x21375a, warm: 0xb8794f, gl: 0xffc98c, foam: 0xe8e0d2 };
const DRY = 0xe3d2b2, DRY_PINK = 0xe7c7b1, DRY_W = 0xf0e6d0, WET = 0x9d8d78, WET_D = 0x7d7263, POOL = 0x527a78, ALGAE = 0x62855a;
const CRUST = 0xeee7d8, CRUST_HI = 0xfbf7ec, CRUST_DIM = 0xd4c9b6, SALT = 0xf6f1e2, STONE = 0x8d7a63, STONE_D = 0x77664f;
const POND = [0x8fd0ac, 0xb6cf7e, 0xebcb7c, 0xef9d6a, 0xe07a86, 0xc471a4];
const PFLOOR = [0xa8bda0, 0xbcbe94, 0xcfbc8c, 0xd0a684, 0xc08f88, 0xb28a97];
const WOOD = 0x6b4a33, WOOD_D = 0x3f2c1f, WOOD_L = 0x8a6642, BAMBOO = 0xb8a468;
const PLASTER = 0xd6bd9b, PLASTER_D = 0xaf9474, ROOF = 0x39464f, ROOF_L = 0x4d5f68, THATCH = 0xb69758, THATCH_D = 0x93772f;
const GRASS = 0x76874a, GRASS_D = 0x55633a, STRAW = 0xc3a862, REED = 0x9aa063;
const ROBE = 0x3a4a6d, ROBE2 = 0x7c4f3c, ROBE3 = 0x5a5f6e, HAT = 0xd9b46f, SKIN = 0xc0946c, HAIR = 0x2a2320;
const EGRET = 0xf4efe4, BEAK = 0xd8a13c, LEG = 0x2b2a30, BIRD = 0x2a2430;
const MTN = 0x2f2a4a, MTN2 = 0x453d63, LAMP = 0xffbe63, LAMP2 = 0xff9a3c, SUNC = 0xfff2c8;

// ---------------- 布局 ----------------
const SEA_Z0 = -396, SEA_Z1 = -150;          // 海域（负 z 为远）
const FLAT_X = 300, FLAT_Z0 = -152, FLAT_Z1 = 236;  // 滩涂/晒场
const PIER = { x0: 146, x1: 162, z0: 20, z1: -168 };
const VIL = { x0: -146, z0: 8, x1: -72, z1: 88 };
// 6 级盐田：由海向陆逐级抬升（每级 34 深 + 5 埂）
const ROWS = [
  { z0: -110, z1: -76, xl: -118, xr: 104, f: 2, seed: 11 },
  { z0: -71, z1: -37, xl: -112, xr: 108, f: 3, seed: 23 },
  { z0: -32, z1: 2, xl: -100, xr: 112, f: 4, seed: 37 },
  { z0: 7, z1: 41, xl: -76, xr: 116, f: 5, seed: 53 },
  { z0: 46, z1: 80, xl: -52, xr: 118, f: 6, seed: 71 },
  { z0: 85, z1: 121, xl: -34, xr: 120, f: 7, seed: 89 },
];
const MOON = 0xbfd0ff;

// 太阳（低角度、偏右后方）：水平分量 cos(el)，仰角 sin(el)
export const SUN_AZ = 0.20, SUN_EL = 5.6 * Math.PI / 180;
export const SUN_DIR = (() => {
  const c = Math.cos(SUN_EL), s = Math.sin(SUN_EL);
  return [Math.sin(SUN_AZ) * c, s, -Math.cos(SUN_AZ) * c];
})();

// ============================================================================
//  海面：单层体素水，按离岸距离/日落方位分色，含日辉光路
// ============================================================================
function buildSea(far, glint) {
  for (let z = SEA_Z0; z <= SEA_Z1; z++) {
    const depth = clamp((SEA_Z1 - z) / 250, 0, 1);          // 0 近岸 → 1 远海
    // 横向浪带（低频正弦，避免大面积死板）
    const band = Math.sin(z * 0.16 + Math.sin(z * 0.041) * 3.1) * 0.5 + 0.5;
    for (let x = -432; x <= 432; x++) {
      const n = vnoise2(x * 0.021, z * 0.021, 5);
      let c = mix(SEA.shal, SEA.mid, smoothstep(0.05, 0.45, depth));
      c = mix(c, SEA.deep, smoothstep(0.4, 1.0, depth) * 0.9);
      c = shade(c, (band * 0.5 + n * 0.5 - 0.5) * 0.12);
      // 日辉光路：自太阳向岸铺出的窄暖通道
      const axis = -5.4 + (z + 150) * 0.037;
      const w = 11 + depth * 46;
      const g = 1 - clamp(Math.abs(x - axis) / w, 0, 1);
      c = mix(c, SEA.warm, Math.pow(g, 2.3) * 0.62);
      far.set(x, 0, z, jitter(c, x, 0, z, 0.05));
    }
  }
  // 日辉碎光（加色微网格）
  for (let z = SEA_Z1 - 2; z > SEA_Z0 + 4; z -= 2) {
    const depth = clamp((SEA_Z1 - z) / 250, 0, 1);
    const axis = -5.4 + (z + 150) * 0.037;
    const w = 11 + depth * 46;
    for (let x = Math.ceil(axis - w); x <= axis + w; x++) {
      const g = 1 - clamp(Math.abs(x - axis) / w, 0, 1);
      if (hash3(x, z, 3) > Math.pow(g, 3.0) * 0.42 * (0.35 + depth * 0.9)) continue;
      glint.set(x, 1, z, jitter(mix(SEA.gl, 0xffffff, hash3(x, z, 9) * 0.6), x, 1, z, 0.05));
    }
  }
}

// ============================================================================
//  滩涂 + 晒盐场：单层地表，湿度由远及近渐变，含潮沟/潮池/盐霜
// ============================================================================
function buildFlats(far) {
  for (let z = FLAT_Z0; z <= FLAT_Z1; z++) {
    const wet = 1 - smoothstep(-150, 40, z);                   // 近岸湿度
    for (let x = -FLAT_X; x <= FLAT_X; x++) {
      const n = fbm2(x * 0.011, z * 0.011, 3, 17);
      const n2 = fbm2(x * 0.043, z * 0.043, 2, 91);
      let c = mix(DRY, DRY_PINK, smoothstep(0.42, 0.78, n));
      c = mix(c, DRY_W, smoothstep(0.30, 0.62, n2) * 0.75);
      // 近岸：湿泥 + 潮沟
      const chan = Math.abs(Math.sin(x * 0.013 + Math.sin(z * 0.02) * 2.4));
      c = mix(c, mix(WET, WET_D, n2), wet * smoothstep(0.55, 0.95, chan) * 0.9);
      c = mix(c, WET, wet * 0.55);
      // 潮池
      if (z < -60) {
        const p = fbm2(x * 0.02 + 40, z * 0.02, 2, 55);
        if (p > 0.62) c = mix(POOL, ALGAE, smoothstep(0.6, 0.85, p));
      }
      far.set(x, 0, z, jitter(c, x, 0, z, 0.05));
    }
  }
}

// ============================================================================
//  盐田梯田：6 级台地，每级切分为数个子池（按盐度取色）
// ============================================================================
function buildTerraces(main, water) {
  for (let ri = 0; ri < ROWS.length; ri++) {
    const r = ROWS[ri];
    const f = r.f;

    // —— 台体（实心） ——
    for (let y = 1; y < f; y++) {
      const isTop = (y === f - 1);
      for (let x = r.xl; x <= r.xr; x++)
        for (let z = r.z0; z <= r.z1; z++) {
          if (isTop) continue;
          const n = fbm2(x * 0.02, z * 0.02 + ri * 7, 2, ri * 13);
          main.set(x, y, z, jitter(mix(STONE, STONE_D, n), x, y, z, 0.05));
        }
    }

    // —— 子池划分（纵向田埂把每级切成 2~4 个子池） ——
    const inner0 = r.xl + 2, inner1 = r.xr - 2;
    const span = inner1 - inner0;
    const k = 2 + (Math.floor(hash3(ri, 3, 7) * 1000) % 3);
    const cuts = [];
    for (let i = 1; i < k; i++) cuts.push(Math.round((inner0 + span * (i / k)) / 4) * 4);

    const damX = new Set([r.xl, r.xl + 1, r.xr, r.xr - 1]);
    for (const cx of cuts) { damX.add(cx); damX.add(cx + 1); }

    const segs = [];
    let sx = inner0;
    const ends = cuts.concat([inner1 + 1]);
    for (let pi = 0; pi < ends.length; pi++) {
      const ex = ends[pi] - 1;
      if (ex - sx >= 8) {
        const cx = (sx + ex) / 2;
        // 盐度：低频噪声主导 + 随级数微升 → 子池颜色成 quilt 状交错
        const n = fbm2(cx * 0.026, ri * 3.7, 3, ri * 31);
        const t2 = clamp((n - 0.5) * 2.6 + 0.5, 0, 1);
        const ci = Math.round(clamp(t2 * 5 + ri * 0.22, 0, 5));
        // 少量子池已收盐（露白盐霜 + 耙痕）
        segs.push({ x0: sx, x1: ex, ci, harvested: hash3(ri, pi, 19) < 0.17 });
      }
      sx = ends[pi] + 2;
    }
    const segAt = new Map();
    for (const s of segs) for (let x = s.x0; x <= s.x1; x++) segAt.set(x, s);

    const gz = clamp((r.z0 + 150) / 250, 0, 1);   // 越靠海反射天光越强

    for (let x = r.xl; x <= r.xr; x++) {
      const sg = segAt.get(x);
      const dam = !sg || damX.has(x);
      for (let z = r.z0; z <= r.z1; z++) {
        if (dam) {                                    // 纵向田埂
          main.set(x, f - 1, z, jitter(CRUST, x, f, z, 0.05));
          main.set(x, f, z, jitter(CRUST_HI, x, f + 1, z, 0.045));
          continue;
        }
        const edge = Math.min(x - sg.x0, sg.x1 - x, z - r.z0, r.z1 - z);
        // 池底
        const wet = 1 - smoothstep(0, 5, edge);
        let c = jitter(PFLOOR[sg.ci], x, f, z, 0.06);
        c = mix(c, shade(PFLOOR[sg.ci], -0.32), wet * 0.7);
        if (sg.harvested) {
          const rake = ((x + z * 2) % 11 < 4) ? CRUST_HI : CRUST;
          c = mix(rake, mix(CRUST, PFLOOR[sg.ci], 0.3), smoothstep(0, 3, edge) * 0.5);
          c = mix(c, shade(CRUST, -0.2), (1 - smoothstep(0, 4, edge)) * 0.85);
        }
        main.set(x, f - 1, z, c);

        // 池水：低盐薄荷 → 高盐玫红；映暮色天光（偏冷紫），远侧带一线暖反光
        if (!sg.harvested) {
          const ao = 0.56 + 0.44 * smoothstep(0, 4, edge);      // 贴岸假 AO
          const refl = mix(0x8a7aa6, SKY.hz, 0.34);
          let w = mix(POND[sg.ci], refl, 0.17 - 0.08 * gz);
          w = mix(w, SEA.gl, 0.20 * (1 - smoothstep(0, 16, z - r.z0)));
          w = mix(w, 0xffffff, 0.07);
          const band = Math.sin(z * 0.5 + Math.sin(x * 0.22) * 1.4) * 0.5 + 0.5;
          w = shade(w, (band - 0.5) * 0.07 + (hash3(x, z, 77) - 0.5) * 0.05);
          water.set(x, f, z, shade(w, -0.34 + 0.34 * ao));
        }
      }
    }

    // —— 行间主坝（坝顶与上级水面齐平，含闸门与木槽） ——
    if (ri > 0) {
      const lo = ROWS[ri - 1];
      const dz0 = lo.z1 + 1, dz1 = r.z0 - 1;
      const dx0 = Math.max(lo.xl, r.xl) - 2, dx1 = Math.min(lo.xr, r.xr) + 2;
      const yTop = r.f;
      for (let x = dx0; x <= dx1; x++)
        for (let z = dz0; z <= dz1; z++) {
          const n = fbm2(x * 0.03, z * 0.3, 2, 23);
          main.set(x, yTop, z, jitter(mix(CRUST, CRUST_DIM, n * 0.5), x, yTop, z, 0.05));
          for (let y = 1; y < yTop; y++) main.set(x, y, z, jitter(STONE_D, x, y, z, 0.05));
        }
      // 闸口：木闸板 + 绞盘
      const gx = Math.round((dx0 + dx1) * 0.5 + 40);
      for (let x = gx - 2; x <= gx + 2; x++) {
        main.del(x, yTop, dz0);
        for (let y = yTop - 1; y >= yTop - 3; y--) main.set(x, y, dz0, WOOD_D);
      }
      for (let x = gx - 3; x <= gx + 3; x++) {
        main.set(x, yTop + 1, dz0, WOOD_L);
        main.set(x, yTop + 2, dz0, x % 2 ? WOOD : BAMBOO);
        if (x === gx) main.set(x, yTop + 3, dz0, BAMBOO);
      }
      // 沿坝的木引水槽（把上一级水引入下一级，水面与坝顶齐平）
      for (let x = gx + 5; x < gx + 28; x++) {
        main.set(x, yTop + 1, dz0, WOOD_L);
        main.set(x, yTop + 1, dz0 + 1, WOOD_L);
        main.del(x, yTop, dz0);
        water.set(x, yTop, dz0, mix(0x35525a, 0x8fb0a6, 0.42));
      }
    }
  }
}

// ============================================================================
//  晒盐场：盐堆、席子、木耙、扁担车
// ============================================================================
function saltPile(main, cx, cy, cz, r, h, seed) {
  for (let dz = -r; dz <= r; dz++)
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d > r) continue;
      const top = Math.max(0, Math.round(h * (1 - d / (r + 0.6))));
      for (let y = 0; y <= top; y++) {
        const c = y === top ? SALT : (y > top * 0.55 ? CRUST_HI : CRUST);
        main.set(cx + dx, cy + y, cz + dz, jitter(c, cx + dx, cy + y, cz + dz, 0.045));
      }
    }
}

function buildYard(main) {
  // 大盐堆（前景主角：近右一座大垛，其余错落）
  const piles = [[104, 202, 9, 11], [44, 176, 7, 8], [-6, 196, 6, 7], [150, 150, 5, 6],
                 [86, 150, 5, 6], [178, 196, 5, 5], [-52, 158, 4, 5]];
  piles.forEach((p, i) => saltPile(main, p[0], 1, p[1], p[2], p[3], i));

  // 摊晒的盐席（浅色方块阵，压低对比）
  for (let i = 0; i < 7; i++) {
    const x = -30 + Math.floor(hash3(i, 1, 3) * 190);
    const z = 138 + Math.floor(hash3(i, 2, 5) * 72);
    const w = 8 + Math.floor(hash3(i, 3, 7) * 8);
    const d = 6 + Math.floor(hash3(i, 4, 11) * 6);
    if (x > PIER.x0 - 14 && x < PIER.x1 + 14 && z < 60) continue;
    for (let dx = 0; dx < w; dx++) for (let dz = 0; dz < d; dz++) {
      const t = ((dx + dz) % 6 < 2) ? mix(CRUST_HI, DRY_W, 0.5) : mix(CRUST, DRY, 0.45);
      main.set(x + dx, 1, z + dz, jitter(t, x + dx, 1, z + dz, 0.05));
    }
  }

  // 木耙 / 铁锹 / 竹筐
  for (let i = 0; i < 14; i++) {
    const x = -60 + Math.floor(hash3(i, 5, 3) * 250);
    const z = 130 + Math.floor(hash3(i, 6, 5) * 96);
    main.set(x, 1, z, WOOD_L);
    main.set(x + 1, 1, z, WOOD_L);
    main.set(x + 2, 1, z, WOOD_D);
    if (i % 3 === 0) { main.set(x, 2, z, BAMBOO); main.set(x + 1, 2, z, BAMBOO); }
  }
  for (let i = 0; i < 9; i++) {
    const x = -50 + Math.floor(hash3(i, 7, 3) * 230);
    const z = 126 + Math.floor(hash3(i, 8, 5) * 96);
    main.set(x, 1, z, BAMBOO); main.set(x + 1, 1, z, BAMBOO);
    main.set(x, 2, z, shade(BAMBOO, -0.2)); main.set(x + 1, 2, z, shade(BAMBOO, -0.2));
  }
  // 草丛（贴地一格，避免长影噪点）
  for (let i = 0; i < 70; i++) {
    const x = -290 + Math.floor(hash3(i, 11, 1) * 580);
    const z = 124 + Math.floor(hash3(i, 12, 2) * 112);
    if (x > VIL.x0 - 8 && x < VIL.x1 + 8 && z > VIL.z0 - 8 && z < VIL.z1 + 8) continue;
    if (x > PIER.x0 - 8 && x < PIER.x1 + 8 && z < 40) continue;
    const c = hash3(i, 14, 4) < 0.4 ? REED : GRASS;
    main.set(x, 1, z, jitter(c, x, 1, z, 0.12));
  }
  // 盐仓（给前景一栋体量）
  house(main, null, 168, 176, 16, 12, 1, { h: 8, thatch: true, win: null });
  for (let i = 0; i < 20; i++) {
    const x = 152 + Math.floor(hash3(i, 21, 3) * 8);
    const z = 164 + Math.floor(hash3(i, 22, 5) * 10);
    main.set(x, 1, z, jitter(SALT, x, 1, z, 0.06));
    main.set(x, 2, z, jitter(SALT, x, 2, z, 0.06));
  }
}

// ============================================================================
//  渔村：4 幢屋 + 晒网架 + 井 + 灯笼
// ============================================================================
function house(main, lamp, x0, z0, w, d, y, o) {
  const wall = o.wall || PLASTER;
  const roofCol = o.thatch ? THATCH : ROOF;
  const ridgeX = o.ridgeX !== false;   // 山墙沿 x 轴
  const h = o.h || 10;

  // 台基
  for (let x = x0 - 1; x <= x0 + w; x++)
    for (let z = z0 - 1; z <= z0 + d; z++) main.set(x, y, z, jitter(STONE, x, y, z, 0.05));

  // 墙体
  for (let yy = 1; yy <= h; yy++) {
    for (let x = x0; x <= x0 + w - 1; x++)
      for (let z = z0; z <= z0 + d - 1; z++) {
        const edge = (x === x0 || x === x0 + w - 1 || z === z0 || z === z0 + d - 1);
        if (!edge) continue;
        const isWin = o.win && o.win.some(q => q[0] === x - x0 && q[1] === z - z0 && q[2] === yy);
        if (isWin) { if (yy >= 4) lamp.set(x, y + yy, z, o.lit || LAMP); continue; }
        const isDoor = (z === z0 + d - 1 && x === x0 + Math.floor(w / 2) && yy <= 3);
        const c = isDoor ? WOOD_D
          : jitter(mix(wall, PLASTER_D, hash3(x, z, yy) * 0.5), x, y + yy, z, 0.04);
        main.set(x, y + yy, z, c);
      }
  }
  // 勒脚
  for (let x = x0; x <= x0 + w - 1; x++) {
    main.set(x, y + 1, z0, shade(wall, -0.28)); main.set(x, y + 1, z0 + d - 1, shade(wall, -0.28));
  }

  // 屋顶（阶梯山墙）
  const rh = o.thatch ? 6 : 5;
  const yb = y + h + 1;
  for (let i = 0; i <= rh; i++) {
    const yy = yb + i;
    if (ridgeX) {
      for (let x = x0 - 1; x <= x0 + w; x++)
        for (let z = z0 - 1 + i; z <= z0 + d + 1 - i; z++) {
          const tile = ((x + i * 2) % 4 < 2) ? roofCol : shade(roofCol, 0.12);
          main.set(x, yy, z, jitter(o.thatch ? mix(tile, THATCH_D, ((x * 3 + z) % 5) * 0.16) : tile, x, yy, z, 0.05));
        }
    } else {
      for (let z = z0 - 1; z <= z0 + d; z++)
        for (let x = x0 - 1 + i; x <= x0 + w + 1 - i; x++) {
          const tile = ((z + i * 2) % 4 < 2) ? roofCol : shade(roofCol, 0.12);
          main.set(x, yy, z, jitter(o.thatch ? mix(tile, THATCH_D, ((x + z * 3) % 5) * 0.16) : tile, x, yy, z, 0.05));
        }
    }
  }
  // 屋脊压顶
  if (ridgeX) for (let x = x0 - 1; x <= x0 + w; x++) main.set(x, yb + rh + 1, Math.floor((z0 + d) / 2), shade(roofCol, 0.22));
  else for (let z = z0 - 1; z <= z0 + d; z++) main.set(Math.floor((x0 + w) / 2), yb + rh + 1, z, shade(roofCol, 0.22));

  // 烟囱
  const cx = o.chimney ? o.chimney[0] : x0 + 1;
  const cz = o.chimney ? o.chimney[1] : z0 + 1;
  const top = yb + rh + 3;
  for (let yy = y + 2; yy <= top; yy++)
    for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++)
      main.set(cx + dx, yy, cz + dz, jitter(yy > top - 2 ? STONE : mix(STONE, STONE_D, 0.4), cx + dx, yy, cz + dz, 0.05));
  main.set(cx, top + 1, cz, STONE); main.set(cx + 1, top + 1, cz, STONE);
  main.set(cx, top + 1, cz + 1, STONE); main.set(cx + 1, top + 1, cz + 1, STONE);

  return { chimney: [cx, top + 2, cz], top: yb + rh };
}

function buildVillage(main, lamp) {
  const chimneys = [];
  const H = [
    { x: -146, z: 12, w: 18, d: 14, h: 10, thatch: false },
    { x: -120, z: 28, w: 16, d: 13, h: 9, thatch: true },
    { x: -146, z: 50, w: 20, d: 15, h: 11, thatch: false, ridgeX: false },
    { x: -116, z: 60, w: 15, d: 12, h: 9, thatch: true, ridgeX: false },
    { x: -92, z: 34, w: 14, d: 12, h: 9, thatch: false },
  ];
  for (const h of H) {
    const wins = [];
    const nw = 1 + Math.floor(hash3(h.x, h.z, 3) * 2);
    for (let i = 0; i < nw; i++) wins.push([3 + i * 6, h.d - 1, 5 + (i % 2)]);
    wins.push([h.w - 1, Math.floor(h.d / 2), 6]);
    const r = house(main, lamp, h.x, h.z, h.w, h.d, 1, {
      h: h.h, thatch: h.thatch, ridgeX: h.ridgeX, win: wins, lit: LAMP,
    });
    chimneys.push(r.chimney);
  }

  // 晒网架
  const racks = [[-140, 40, 24, 1], [-100, 66, 20, 0]];
  for (const [x, z, len, dir] of racks) {
    for (let i = 0; i <= len; i++) {
      const px = x + (dir ? 0 : i), pz = z + (dir ? i : 0);
      main.set(px, 1, pz, WOOD_D); main.set(px, 2, pz, WOOD_D);
      main.set(px, 3, pz, WOOD_D); main.set(px, 4, pz, WOOD);
    }
    for (let i = 2; i < len - 1; i++) {
      const px = x + (dir ? 0 : i), pz = z + (dir ? i : 0);
      for (let yy = 2; yy <= 4; yy++)
        for (let s = -2; s <= 2; s++) {
          const qx = px + (dir ? s : 0), qz = pz + (dir ? 0 : s);
          if (hash3(qx, yy, qz) < 0.42) continue;
          main.set(qx, yy, qz, mix(BAMBOO, 0x8fa39a, 0.35));
        }
    }
  }
  // 晒鱼架
  for (let i = 0; i < 36; i++) {
    const x = -96 + Math.floor(hash3(i, 2, 3) * 14);
    const z = 20 + Math.floor(hash3(i, 3, 5) * 18);
    const yy = 3 + Math.floor(hash3(i, 4, 7) * 3);
    main.set(x, yy, z, jitter(mix(0xd8c9a8, 0xb59a70, hash3(i, 5, 9)), x, yy, z, 0.1));
  }

  // 水井
  main.fill(-106, 1, 64, -100, 2, 70, STONE);
  main.fill(-105, 3, 65, -101, 3, 69, 0x1d2a30);
  main.set(-106, 3, 67, WOOD); main.set(-100, 3, 67, WOOD);
  main.set(-103, 4, 67, BAMBOO);

  // 灯笼
  const lamps = [[-138, 12, 12], [-122, 22, 28], [-88, 15, 34], [-132, 16, 52], [156, 9, -40], [150, 9, -110]];
  for (const [x, y, z] of lamps) {
    main.set(x, y - 1, z, WOOD_D);
    lamp.set(x, y, z, LAMP2);
  }
  // 村口旗杆
  main.set(-86, 1, 14, WOOD_D); main.set(-86, 2, 14, WOOD_D);
  main.set(-86, 3, 14, WOOD_D); main.set(-86, 4, 14, WOOD_D);
  lamp.set(-85, 5, 14, 0xe8604a); lamp.set(-86, 5, 14, 0xe8604a);

  // 柴堆 / 木桶 / 渔网堆
  for (let i = 0; i < 30; i++) {
    const x = -150 + Math.floor(hash3(i, 7, 3) * 68);
    const z = 10 + Math.floor(hash3(i, 8, 5) * 74);
    const yy = 1 + Math.floor(hash3(i, 9, 7) * 2);
    main.set(x, yy, z, jitter(WOOD_D, x, yy, z, 0.08));
  }
  // 院墙（矮土墙）
  for (let x = VIL.x0; x <= VIL.x1; x += 1) {
    if (x % 3 === 0) { main.set(x, 1, VIL.z1, shade(PLASTER_D, -0.1)); main.set(x, 2, VIL.z1, PLASTER_D); }
  }
  for (let z = 10; z <= VIL.z1; z += 1) {
    if (z % 3 === 0) { main.set(VIL.x0, 1, z, shade(PLASTER_D, -0.1)); main.set(VIL.x0, 2, z, PLASTER_D); }
  }
  return chimneys;
}

// ============================================================================
//  木栈桥 + 渔船（渔船可动）
// ============================================================================
function buildPier(main, lamp) {
  const y = 2;
  for (let z = PIER.z1; z <= PIER.z0; z++) {
    for (let x = PIER.x0; x <= PIER.x1; x++) {
      const plank = (x % 3 === 0) ? shade(WOOD, 0.1) : WOOD;
      main.set(x, y, z, jitter(plank, x, y, z, 0.07));
    }
    // 桥桩
    if (z % 7 === 0) {
      main.set(PIER.x0, 1, z, WOOD_D); main.set(PIER.x1, 1, z, WOOD_D);
      main.set(PIER.x0, 0, z, WOOD_D); main.set(PIER.x1, 0, z, WOOD_D);
    }
    // 栏杆
    if (z % 4 === 0) {
      main.set(PIER.x0 - 1, y + 1, z, WOOD_D); main.set(PIER.x1 + 1, y + 1, z, WOOD_D);
      main.set(PIER.x0 - 1, y + 2, z, WOOD); main.set(PIER.x1 + 1, y + 2, z, WOOD);
    }
  }
  // 桥头小屋
  for (let x = PIER.x0 - 6; x <= PIER.x1 + 6; x++)
    for (let z = PIER.z0 - 8; z <= PIER.z0 - 1; z++) main.set(x, 1, z, jitter(STONE, x, 1, z, 0.05));
  house(main, lamp, PIER.x0 - 4, PIER.z0 - 7, 9, 7, 2, {
    h: 7, thatch: true, win: [[3, 6, 4]], lit: LAMP2,
  });
  // 桩上挂灯
  for (const z of [PIER.z1 + 6, PIER.z1 + 40, -110, -70, -30, 6]) {
    main.set(PIER.x0 - 1, y + 3, z, WOOD_D);
    lamp.set(PIER.x0 - 1, y + 2, z, LAMP2);
    main.set(PIER.x1 + 1, y + 3, z, WOOD_D);
    lamp.set(PIER.x1 + 1, y + 2, z, LAMP2);
  }
}

export function makeBoat(mat) {
  const w = new World();
  const L = 11, W = 5;
  for (let z = -L; z <= L; z++)
    for (let x = -W; x <= W; x++) {
      const taper = Math.abs(z) / L;
      if (Math.abs(x) > (W - taper * (W - 1))) continue;
      w.set(x, 0, z, ((x + z) % 2 === 0) ? WOOD : shade(WOOD, 0.08));
      w.set(x, -1, z, WOOD_D);
      w.set(x, -2, z, WOOD_D);
    }
  // 舷墙
  for (let z = -L + 1; z <= L - 1; z++) {
    const hx = Math.round(W - (Math.abs(z) / L) * (W - 1));
    w.set(-hx, 1, z, WOOD_L); w.set(hx, 1, z, WOOD_L);
  }
  // 船舱 + 桅杆 + 帆
  w.fill(-1, 1, -2, 1, 2, 2, mix(WOOD_D, BAMBOO, 0.4));
  w.set(0, 1, 3, WOOD_L); w.set(0, 2, 3, WOOD_L);
  for (let y = 2; y <= 9; y++) w.set(0, y, -3, WOOD_D);
  for (let y = 4; y <= 8; y++) {
    const ww = y - 3;
    for (let x = -ww; x <= ww; x++) w.set(x, y, -3, jitter(mix(0xe6dcc4, 0xc9b78e, hash3(x, y, 2)), x, y, -3, 0.05));
  }
  w.set(0, 10, -3, WOOD_D);
  // 船灯 + 桨
  w.set(0, 2, 4, 0xffb055);
  w.set(-3, 1, 3, WOOD_L); w.set(-4, 1, 5, WOOD_L);
  return w.buildMesh(mat);
}

// ============================================================================
//  风车水轮（可动）
// ============================================================================
export function makeWaterWheel(mat) {
  const w = new World();
  const R = 10, Wd = 5;
  // 轮圈
  for (let a = 0; a < 64; a++) {
    const th = a / 64 * Math.PI * 2;
    for (let z = -Wd; z <= Wd; z++) {
      if (Math.abs(z) !== Wd && a % 8 !== 0) continue;
      const x = Math.round(Math.cos(th) * R), y = Math.round(Math.sin(th) * R);
      w.set(x, y, z, WOOD_D);
    }
  }
  // 辐条
  for (let s = 0; s < 10; s++) {
    const th = s / 10 * Math.PI * 2;
    for (let r = 1; r < R; r++) {
      const x = Math.round(Math.cos(th) * r), y = Math.round(Math.sin(th) * r);
      for (let z = -1; z <= 1; z++) w.set(x, y, z, WOOD);
    }
  }
  // 叶片
  for (let s = 0; s < 10; s++) {
    const th = s / 10 * Math.PI * 2 + 0.16;
    for (let r = 6; r <= R; r += 2) {
      const x = Math.round(Math.cos(th) * r), y = Math.round(Math.sin(th) * r);
      for (let z = -Wd; z <= Wd; z++) w.set(x, y, z, WOOD_L);
    }
  }
  // 轮毂
  w.fill(-1, -1, -2, 1, 1, 2, WOOD_D);
  return w.buildMesh(mat);
}

// ============================================================================
//  白鹭（可动）
// ============================================================================
export function makeHeron(mat) {
  const w = new World();
  // 腿
  w.set(-1, 0, 0, LEG); w.set(1, 0, 0, LEG);
  w.set(-1, 1, 0, LEG); w.set(1, 1, 0, LEG);
  w.set(-1, 2, 0, LEG); w.set(1, 2, 0, LEG);
  // 身
  for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) w.set(x, 3, z, EGRET);
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) w.set(x, 4, z, EGRET);
  // 颈 + 头
  w.set(1, 5, 0, EGRET); w.set(1, 6, 0, EGRET); w.set(1, 7, 0, EGRET);
  w.set(2, 7, 0, EGRET); w.set(3, 7, 0, BEAK); w.set(4, 7, 0, shade(BEAK, -0.15));
  // 尾
  w.set(-3, 3, 0, EGRET);
  // 翅
  w.set(-2, 4, -1, shade(EGRET, -0.1)); w.set(-2, 4, 1, shade(EGRET, -0.1));
  return w.buildMesh(mat);
}

// ============================================================================
//  人物（盐工 / 渔妇）
// ============================================================================
function person(main, x, y, z, kind, robe) {
  const c = robe || ROBE;
  // 腿
  main.set(x - 1, y, z, shade(c, -0.25)); main.set(x + 1, y, z, shade(c, -0.25));
  // 身
  for (let yy = 1; yy <= 4; yy++) {
    for (let dx = -1; dx <= 1; dx++) main.set(x + dx, y + yy, z, dx === 0 && yy > 2 ? shade(c, 0.08) : c);
    main.set(x - 1, y + yy, z + 1, shade(c, -0.08));
    main.set(x + 1, y + yy, z + 1, shade(c, -0.08));
  }
  // 臂
  main.set(x - 2, y + 3, z, SKIN); main.set(x + 2, y + 3, z, SKIN);
  main.set(x - 2, y + 4, z, shade(c, 0.1)); main.set(x + 2, y + 4, z, shade(c, 0.1));
  // 头 + 斗笠
  main.set(x, y + 5, z, SKIN);
  main.set(x, y + 5, z + 1, shade(SKIN, -0.12));
  for (let dx = -2; dx <= 2; dx++) for (let dz = -1; dz <= 1; dz++) {
    if (Math.abs(dx) + Math.abs(dz) > 3) continue;
    main.set(x + dx, y + 6, z + dz, dx === 0 && dz === 0 ? shade(HAT, -0.1) : HAT);
  }
  // 工具
  if (kind === 'rake') {
    main.set(x + 3, y + 1, z, WOOD_L); main.set(x + 3, y + 2, z, WOOD_L);
    main.set(x + 3, y + 3, z, WOOD_L); main.set(x + 3, y + 4, z, WOOD);
    for (let dx = 0; dx <= 3; dx++) main.set(x + 3 + dx, y + 1, z, WOOD_D);
  } else if (kind === 'carry') {
    main.set(x - 3, y + 5, z, WOOD_L); main.set(x + 3, y + 5, z, WOOD_L);
    main.set(x - 2, y + 4, z, BAMBOO); main.set(x - 2, y + 4, z - 1, BAMBOO);
    main.set(x - 3, y + 4, z, shade(BAMBOO, -0.2));
  } else if (kind === 'push') {
    main.set(x - 3, y + 1, z, WOOD); main.set(x - 2, y + 1, z, WOOD);
    main.set(x - 4, y + 1, z, WOOD_D); main.set(x - 4, y + 2, z, BAMBOO);
    main.set(x - 4, y + 3, z, BAMBOO);
  } else if (kind === 'shovel') {
    main.set(x + 3, y + 1, z, WOOD_L); main.set(x + 3, y + 2, z, WOOD_L);
    main.set(x + 3, y + 3, z, WOOD_L);
    main.set(x + 3, y, z, shade(0x5c5a58, 0.2));
  }
}

function buildPeople(main) {
  // 池中耙盐 / 掌闸 / 收盐
  person(main, 30, 5, 20, 'rake', ROBE);
  person(main, -20, 4, -16, 'rake', ROBE3);
  person(main, 76, 6, 58, 'rake', ROBE2);
  person(main, 60, 7, 100, 'rake', ROBE);
  person(main, 104, 4, -6, 'shovel', ROBE2);
  person(main, 12, 6, 60, 'rest', ROBE3);
  person(main, -60, 3, 64, 'rake', ROBE2);
  // 晒场
  person(main, 88, 1, 168, 'carry', ROBE);
  person(main, -14, 1, 176, 'push', ROBE3);
  person(main, 136, 1, 190, 'rake', ROBE2);
  person(main, 34, 1, 204, 'rest', ROBE);
  person(main, 172, 1, 160, 'carry', ROBE3);
  // 村里
  person(main, -104, 1, 44, 'carry', ROBE2);
  person(main, -134, 1, 46, 'rest', ROBE3);
  person(main, -86, 1, 66, 'rake', ROBE);
  person(main, -120, 1, 14, 'carry', ROBE);
  // 码头 / 水车
  person(main, 156, 2, -46, 'rest', ROBE2);
  person(main, 140, 2, -14, 'carry', ROBE);
  person(main, 126, 1, 92, 'shovel', ROBE3);
  // 狗
  main.fill(58, 1, 182, 59, 1, 184, shade(WOOD_D, 0.1));
  main.set(60, 2, 183, shade(WOOD_D, 0.18));
  main.set(58, 2, 184, shade(WOOD_D, 0.05));
  main.set(57, 1, 183, shade(WOOD_D, 0.05));
}

// ============================================================================
//  远山 + 岛屿
// ============================================================================
function buildMountains(far) {
  const ranges = [
    { z0: -396, z1: -344, x0: 30, x1: 360, h: 30, c: MTN2, seed: 3 },
    { z0: -352, z1: -306, x0: -300, x1: -40, h: 36, c: MTN, seed: 8 },
    { z0: -340, z1: -300, x0: 120, x1: 300, h: 22, c: MTN2, seed: 15 },
  ];
  for (const r of ranges) {
    for (let x = r.x0; x <= r.x1; x++) {
      const t = (x - r.x0) / (r.x1 - r.x0);
      const ridge = Math.sin(t * 7.1 + r.seed) * 0.5 + Math.sin(t * 17.3 + r.seed * 2) * 0.28 + 0.5;
      const hgt = Math.max(2, Math.round(r.h * (0.35 + ridge * 0.65) * (0.7 + vnoise2(x * 0.03, r.seed, 3) * 0.6)));
      for (let z = r.z0; z <= r.z1; z++) {
        const dz = 1 - Math.abs((z - (r.z0 + r.z1) / 2) / ((r.z1 - r.z0) / 2));
        const hh = Math.max(1, Math.round(hgt * (0.35 + dz * 0.65)));
        for (let y = 1; y <= hh; y++) {
          const c = mix(r.c, shade(r.c, 0.22), smoothstep(0, hh, y) * 0.7);
          far.set(x, y, z, jitter(c, x, y, z, 0.04));
        }
      }
    }
  }
}

// ============================================================================
//  泊船 / 岸上小船 / 浮标
// ============================================================================
function buildBoatsOnShore(main) {
  // 搁浅小船
  const bx = -14, bz = -122;
  for (let z = -9; z <= 9; z++)
    for (let x = -4; x <= 4; x++) {
      const taper = Math.abs(z) / 9;
      if (Math.abs(x) > 4 - taper * 2.6) continue;
      main.set(bx + x, 1 + Math.round(taper * 1.4), bz + z, jitter(z % 4 < 2 ? WOOD : shade(WOOD, 0.1), bx + x, 1, bz + z, 0.07));
    }
  for (let z = -6; z <= 6; z++) { main.set(bx - 2, 2, bz + z, WOOD_L); main.set(bx + 2, 2, bz + z, WOOD_L); }
  main.set(bx, 2, bz, WOOD_D);
  for (let y = 3; y <= 8; y++) main.set(bx + 3, y, bz - 2, WOOD_D);
  // 桅杆倒伏的帆骨
  for (let i = 0; i < 8; i++) main.set(bx + 3 - i, 2 + i, bz - 2, WOOD_L);
}

// ============================================================================
//  入口
// ============================================================================
export function buildAll() {
  const far = new World();
  const main = new World();
  const water = new World();
  const lamp = new World();
  const glint = new World();

  buildSea(far, glint);
  buildFlats(far);
  buildMountains(far);
  buildTerraces(main, water);
  buildYard(main);
  const chimneys = buildVillage(main, lamp);
  buildPier(main, lamp);
  buildPeople(main);
  buildBoatsOnShore(main);

  // ============ 水车：进水渠 → 水斗 → 木槽 → 最高级盐池 ============
  const wx = 132, wz = 78, wy = 13;
  // 进水渠：自海沿梯田东侧北上，再折向水车
  for (let z = -150; z <= 84; z++) {
    let cx = z < 66 ? 178 + Math.sin(z * 0.021) * 6 + Math.sin(z * 0.007) * 4
                    : 178 - (z - 66) / 18 * (178 - wx);
    if (z > 80) cx = wx;
    const halfW = 2 + Math.round(vnoise2(z * 0.05, 3, 7) * 1.7);
    for (let x = Math.floor(cx - halfW); x <= Math.ceil(cx + halfW); x++) {
      far.del(x, 0, z);
      far.set(x, -1, z, jitter(mix(WET_D, 0x4d5c54, 0.45), x, -1, z, 0.08));
      water.set(x, 0, z, jitter(mix(SEA.shal, 0x9dc0c4, 0.2), x, 0, z, 0.05));
    }
  }
  // 石台 + 水斗
  for (let x = wx - 12; x <= wx + 12; x++)
    for (let z = wz - 12; z <= wz + 12; z++) main.set(x, 1, z, jitter(STONE, x, 1, z, 0.05));
  for (let x = wx - 9; x <= wx + 9; x++)
    for (let z = wz - 9; z <= wz + 8; z++) {
      if (Math.abs(x - wx) === 9 || Math.abs(z - wz) === 9 || z === wz + 8) {
        main.set(x, 2, z, WOOD_L); main.set(x, 3, z, WOOD);
        water.set(x, 1, z, mix(SEA.shal, 0x9cc4bd, 0.3));
      }
    }
  // 木槽：自轮顶斜插入最高级盐池（逐级下落的滑道）
  for (let k = 0; k < 15; k++) {
    const x = wx - 10 - k, y = 22 - k;
    const z = wz + 6 + Math.round(k * 0.6);
    for (let dz = -1; dz <= 1; dz++) {
      main.set(x, y, z + dz, WOOD_L);
      main.set(x, y + 1, z + dz, dz === 0 ? 0 : shade(WOOD_L, -0.2));
      if (dz === 0) water.set(x, y, z, mix(0x3a5a60, 0x9dc0b4, 0.5));
    }
    if (k % 3 === 0) for (let dy = 1; y - dy > 1; dy++) main.set(x, y - dy, z, WOOD_D);
  }
  // 落水口
  for (let i = 0; i < 12; i++) {
    const x = wx - 26 + Math.floor(hash3(i, 2, 3) * 5);
    const z = wz + 14 + Math.floor(hash3(i, 3, 5) * 4);
    main.set(x, 7, z, i % 2 ? CRUST_HI : shade(SEA.foam, -0.05));
  }
  // 工具棚
  for (let x = wx - 8; x <= wx + 4; x++)
    for (let z = wz + 16; z <= wz + 26; z++) main.set(x, 1, z, jitter(STONE, x, 1, z, 0.05));
  house(main, lamp, wx - 7, wz + 17, 10, 8, 1, { h: 6, thatch: true, win: [[4, 7, 4]], lit: LAMP2 });

  return { far, main, water, lamp, glint, chimneys, wheel: [wx, wy, wz], boat: PIER };
}

export { POND, CRUST_HI, WOOD, LAMP, SUNC, EGRET, LEG, BIRD, SKY, SEA };
