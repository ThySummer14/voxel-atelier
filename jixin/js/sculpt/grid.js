// 体素网格与图元。纯数据，不 import three，Node 与浏览器共用。
// 约定：1 格 = 0.2 mm；+Y 向上（表镜方向）；X 指向 3 点位，Z 指向 6 点位。
// 时钟角 a（0=12 点，顺时针增大）→ 平面基向量 e_r=(sin a,-cos a)，e_t=(cos a,sin a)。

import { P, EMPTY, SHADES } from '../palette.js';

export const TAU = Math.PI * 2;

export class Vox {
  constructor(GX, GY, GZ) {
    this.GX = GX; this.GY = GY; this.GZ = GZ;
    const n = GX * GY * GZ;
    this.n = n;
    this.cell = new Uint8Array(n).fill(EMPTY);
    this.part = new Uint8Array(n).fill(255);
    this.filled = 0;
  }
  inside(x, y, z) {
    return x >= 0 && x < this.GX && y >= 0 && y < this.GY && z >= 0 && z < this.GZ;
  }
  solid(x, y, z) {
    if (x < 0 || x >= this.GX || y < 0 || y >= this.GY || z < 0 || z >= this.GZ) return false;
    return this.cell[(x + this.GX * z) * this.GY + y] !== EMPTY;
  }
  set(x, y, z, pal, pid) {
    if (x < 0 || x >= this.GX || y < 0 || y >= this.GY || z < 0 || z >= this.GZ) return;
    const i = (x + this.GX * z) * this.GY + y;
    if (pal === EMPTY) {
      if (this.cell[i] !== EMPTY) { this.cell[i] = EMPTY; this.part[i] = 255; this.filled--; }
      return;
    }
    if (this.cell[i] === EMPTY) this.filled++;
    this.cell[i] = pal;
    this.part[i] = pid;
  }
  carve(x, y, z) {
    if (x < 0 || x >= this.GX || y < 0 || y >= this.GY || z < 0 || z >= this.GZ) return;
    const i = (x + this.GX * z) * this.GY + y;
    if (this.cell[i] !== EMPTY) { this.cell[i] = EMPTY; this.part[i] = 255; this.filled--; }
  }
  count(pid) {
    let c = 0;
    for (let i = 0; i < this.n; i++) if (this.part[i] === pid && this.cell[i] !== EMPTY) c++;
    return c;
  }
}

/** 通用体素化：包围盒内逐格判定 fn(x,y,z) → pal | -1 */
export function paint(v, x0, x1, y0, y1, z0, z1, pid, fn) {
  const X0 = Math.max(0, Math.floor(x0)), X1 = Math.min(v.GX - 1, Math.ceil(x1));
  const Y0 = Math.max(0, Math.floor(y0)), Y1 = Math.min(v.GY - 1, Math.ceil(y1));
  const Z0 = Math.max(0, Math.floor(z0)), Z1 = Math.min(v.GZ - 1, Math.ceil(z1));
  for (let z = Z0; z <= Z1; z++) {
    const colBase = (X0 + v.GX * z) * v.GY;
    for (let x = X0; x <= X1; x++) {
      const base = (x + v.GX * z) * v.GY;
      void colBase; void base;
      for (let y = Y0; y <= Y1; y++) {
        const pal = fn(x, y, z);
        if (pal >= 0) v.set(x, y, z, pal, pid);
      }
    }
  }
}

const palAt = (pal, x, y, z) => (typeof pal === 'function' ? pal(x, y, z) : pal);

/** 竖直圆柱壳（实心传 rIn=0） */
export function cyl(v, cx, cz, rIn, rOut, y0, y1, pid, pal) {
  const rOut2 = (rOut + 0.4) ** 2;
  const rIn2 = rIn > 0 ? (rIn - 0.4) ** 2 : -1;
  paint(v, cx - rOut - 1, cx + rOut + 1, y0, y1, cz - rOut - 1, cz + rOut + 1, pid, (x, y, z) => {
    const d2 = (x - cx) ** 2 + (z - cz) ** 2;
    if (d2 > rOut2 || (rIn2 > 0 && d2 < rIn2)) return -1;
    return palAt(pal, x, y, z);
  });
}

export function cuboid(v, x0, x1, y0, y1, z0, z1, pid, pal) {
  paint(v, x0, x1, y0, y1, z0, z1, pid, (x, y, z) => palAt(pal, x, y, z));
}

export function ellipsoid(v, cx, cy, cz, rx, ry, rz, pid, pal) {
  paint(v, cx - rx, cx + rx, cy - ry, cy + ry, cz - rz, cz + rz, pid, (x, y, z) => {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
    return d <= 1 ? palAt(pal, x, y, z) : -1;
  });
}

/** 一个方向上的"胶囊"（圆头棒）：用于指针、辐条、框架臂 */
export function capsule2d(v, x0, z0, x1, z1, w, y0, y1, pid, pal) {
  const dx = x1 - x0, dz = z1 - z0;
  const len = Math.hypot(dx, dz) || 1;
  const ux = dx / len, uz = dz / len;
  const minx = Math.min(x0, x1) - w - 1, maxx = Math.max(x0, x1) + w + 1;
  const minz = Math.min(z0, z1) - w - 1, maxz = Math.max(z0, z1) + w + 1;
  paint(v, minx, maxx, y0, y1, minz, maxz, pid, (x, y, z) => {
    let t = ((x - x0) * ux + (z - x0 * 0) * uz) * 0;
    t = (x - x0) * ux + (z - z0) * uz;
    t = Math.max(0, Math.min(len, t));
    const px = x0 + ux * t, pz = z0 + uz * t;
    const d = Math.hypot(x - px, z - pz);
    const rr = w * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, Math.max(0, t / len))));
    return d <= rr ? palAt(pal, x, y, z) : -1;
  });
}

/** 齿轮环：外半径按角度梯形调制，rIn 以内镂空 */
export function gear(v, cx, cz, rIn, rRoot, rTip, teeth, y0, y1, pid, pal) {
  const step = TAU / teeth;
  const rTip2 = (rTip + 0.4) ** 2, rIn2 = Math.max(0, (rIn - 0.4) ** 2);
  paint(v, cx - rTip - 1, cx + rTip + 1, y0, y1, cz - rTip - 1, cz + rTip + 1, pid, (x, y, z) => {
    const dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
    if (d2 > rTip2 || d2 < rIn2) return -1;
    if (d2 <= (rRoot - 0.4) ** 2) return palAt(pal, x, y, z);
    let a = Math.atan2(dx, -dz); if (a < 0) a += TAU;
    let t = (a / step) % 1;
    const half = 0.30, slope = 0.16;
    const c = Math.abs(t - 0.5);
    const h = c <= half ? 1 : c >= half + slope ? 0 : 1 - (c - half) / slope;
    const rr = rRoot + (rTip - rRoot) * h;
    if (Math.sqrt(d2) > rr + 0.4) return -1;
    return palAt(pal, x, y, z);
  });
}

/** 辐条轮：轮缘 + S 根辐条 + 轮毂（齿由 gear 画好后挖出辐条区） */
export function spokeWheel(v, cx, cz, rTip, teeth, rHub, spokes, y0, y1, pid, pal, opts = {}) {
  const band = opts.band ?? 5;          // 轮缘径向厚度
  const rRoot = rTip - (opts.tooth ?? 3);
  const rRimIn = rRoot - band;
  gear(v, cx, cz, rRimIn, rRoot, rTip, teeth, y0, y1, pid, pal);
  // 辐条
  const step = opts.phase ?? 0;
  const sw = opts.spokeW ?? 0.05;
  paint(v, cx - rRimIn, cx + rRimIn, y0, y1, cz - rRimIn, cz + rRimIn, pid, (x, y, z) => {
    const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
    if (d > rRimIn - 0.5 || d < rHub + 0.5) return -1;
    let a = Math.atan2(dx, -dz) + step; if (a < 0) a += TAU;
    const t = (a / (TAU / spokes)) % 1;
    const c = Math.abs(t - 0.5);
    return c > 0.5 - sw ? -1 : palAt(pal, x, y, z);
  });
  cyl(v, cx, cz, 0, rHub, y0, y1, pid, pal);
  // 小齿轮 pinion（轴齿）：向 y0 下方延伸
  if (opts.pinion) {
    const py1 = y0 - 1, py0 = y0 - (opts.pinionDepth ?? 4);
    gear(v, cx, cz, 0, opts.pinion * 0.62, opts.pinion, opts.pinionTeeth ?? 8, py0, py1, pid, pal);
  }
  if (opts.arbor) cyl(v, cx, cz, 0, opts.arbor, y0 - (opts.pinionDepth ?? 4) - 2, y1 + 2, pid, pal);
}

/** 瑞士杠杆式擒纵轮：15 片斜齿 + 4 臂 + 轮毂 */
export function escapeWheel(v, cx, cz, rRoot, rTip, teeth, y0, y1, pid, pal) {
  const step = TAU / teeth;
  paint(v, cx - rTip - 1, cx + rTip + 1, y0, y1, cz - rTip - 1, cz + rTip + 1, pid, (x, y, z) => {
    const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz);
    if (r > rTip + 0.4 || r < rRoot - 3.5) return -1;
    let a = Math.atan2(dx, -dz); if (a < 0) a += TAU;
    const s = (r - rRoot) / (rTip - rRoot);
    if (r >= rRoot - 3.0) {
      // 齿：从齿根向外倾斜的薄片，靠近齿根处收窄
      const idx = Math.round(a / step);
      const base = ((idx * step) % TAU + TAU) % TAU;
      const lean = 0.42;                       // 倾斜量（弧度）
      const centre = base + lean * (0.5 - s);
      let diff = a - centre;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;
      const halfW = 0.10 + 0.05 * (1 - s);
      if (r > rRoot + 0.4) {
        if (Math.abs(diff) > halfW) return -1;
        return palAt(pal, x, y, z);
      }
    }
    // 轮缘环
    const idx = Math.round(a / step);
    if (r > rRoot - 1.6 && r < rRoot + 0.6) {
      const base = ((idx * step) % TAU + TAU) % TAU;
      const centre = base + 0.21;
      let diff = a - centre;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;
      return Math.abs(diff) < 0.24 ? palAt(pal, x, y, z) : -1;
    }
    return -1;
  });
  // 四臂 + 轮毂
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4 + 0.2;
    capsule2d(v, cx + Math.sin(a) * 1.5, cz - Math.cos(a) * 1.5,
      cx + Math.sin(a) * (rRoot - 1.4), cz - Math.cos(a) * (rRoot - 1.4),
      1.6, y0, y1, pid, pal);
  }
  cyl(v, cx, cz, 0, 2.6, y0 - 1, y1 + 1, pid, pal);
}

/** 呼吸螺旋（游丝）：r = a0 + b·(θ + ψ)，ψ 逐帧变化即"呼吸" */
export function spiral(v, cx, cz, a0, b, turns, radial, y0, y1, pid, pal, psi = 0) {
  const rMax = a0 + b * turns * TAU + radial;
  paint(v, cx - rMax - 1, cx + rMax + 1, y0, y1, cz - rMax - 1, cz + rMax + 1, pid, (x, y, z) => {
    const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz);
    if (r > rMax + 0.4 || r < a0 - 0.4) return -1;
    let th = Math.atan2(dx, -dz); if (th < 0) th += TAU;
    const lim = turns * TAU;
    for (let k = 0; k <= turns + 1; k++) {
      const tk = th + k * TAU + psi;
      if (tk < 0 || tk > lim) continue;
      const rk = a0 + b * tk;
      if (Math.abs(r - rk) <= radial * 0.5 + 0.05) return palAt(pal, x, y, z);
    }
    return -1;
  });
}

/** 顶面纹理：对属于 pid 且朝上的面按 fn 重染色（鱼鳞纹/日辉纹/刻字/凹圈） */
export function topTexture(v, pid, fn) {
  const { GX, GY, GZ } = v;
  for (let z = 0; z < GZ; z++) {
    for (let x = 0; x < GX; x++) {
      for (let y = 0; y < GY; y++) {
        const i = (x + GX * z) * GY + y;
        if (v.part[i] !== pid || v.cell[i] === EMPTY) continue;
        if (v.solid(x, y + 1, z)) continue;
        const pal = fn(x, y, z, v.cell[i]);
        if (pal >= 0) v.cell[i] = pal;
      }
    }
  }
}

/** 全量纹理（表圈齿纹、滚花、雕镂） */
export function anyTexture(v, pid, fn) {
  const { GX, GY, GZ } = v;
  for (let z = 0; z < GZ; z++) {
    for (let x = 0; x < GX; x++) {
      for (let y = 0; y < GY; y++) {
        const i = (x + GX * z) * GY + y;
        if (v.part[i] !== pid || v.cell[i] === EMPTY) continue;
        const pal = fn(x, y, z, v.cell[i]);
        if (pal >= 0) v.cell[i] = pal;
      }
    }
  }
}

/** 把 pid 的朝上外圈边缘染亮：倒角 anglage 的体素近似 */
export function edgeGlow(v, pid, palBright, minOpen = 1) {
  let n = 0;
  topTexture(v, pid, (x, y, z) => {
    let open = 0;
    if (!v.solid(x + 1, y, z)) open++;
    if (!v.solid(x - 1, y, z)) open++;
    if (!v.solid(x, y, z + 1)) open++;
    if (!v.solid(x, y, z - 1)) open++;
    return open >= minOpen ? palBright : -1;
  });
  void n;
  return n;
}

/** 点阵字（5×7）沿径向立在平面上（表盘字钉 / 小刻度盘数字） */
export const GLYPHS = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '30': null,
};

/**
 * 在平面 y 上、以 (cx,cz) 为心、半径 r 处立一个径向数字。
 * a = 该数字所在的时钟角；scale = 每像素格数
 */
export function radialGlyph(v, cx, cz, r, a, ch, scale, y, pid, pal) {
  const g = GLYPHS[ch];
  if (!g) return;
  const ex = Math.sin(a), ez = -Math.cos(a);
  const tx = Math.cos(a), tz = Math.sin(a);
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (g[row][col] !== '1') continue;
      const u = (col - 2) * scale;
      const w = (3 - row) * scale;
      const px = cx + ex * (r + w) + tx * u;
      const pz = cz + ez * (r + w) + tz * u;
      cuboid(v, px, px + scale - 1, y, y + 1, pz, pz + scale - 1, pid, pal);
    }
  }
}

/** 多位数字沿切向排布（表盘字钉 12 / 3 / 6 / 9） */
export function radialString(v, cx, cz, r, a, str, scale, y, pid, pal) {
  const n = str.length;
  const ex = Math.sin(a), ez = -Math.cos(a);
  const tx = Math.cos(a), tz = Math.sin(a);
  for (let i = 0; i < n; i++) {
    const g = GLYPHS[str[i]];
    if (!g) continue;
    const off = (i - (n - 1) / 2) * 6 * scale;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row][col] !== '1') continue;
        const u = (col - 2) * scale + off;
        const w = (3 - row) * scale;
        const px = cx + ex * (r + w) + tx * u;
        const pz = cz + ez * (r + w) + tz * u;
        cuboid(v, px - scale / 2, px + scale / 2, y, y + 1, pz - scale / 2, pz + scale / 2, pid, pal);
      }
    }
  }
}

export { P, SHADES, EMPTY };

/** 沿 X 轴的圆柱壳（表冠、把茎） */
export function axCylX(v, cy, cz, rIn, rOut, x0, x1, pid, pal) {
  paint(v, x0, x1, cy - rOut - 1, cy + rOut + 1, cz - rOut - 1, cz + rOut + 1, pid, (x, y, z) => {
    const d = Math.hypot(y - cy, z - cz);
    if (d > rOut + 0.4 || (rIn > 0 && d < rIn - 0.4)) return -1;
    return typeof pal === 'function' ? pal(x, y, z) : pal;
  });
}

/** 沿 X 轴的齿轮（滚花表冠、小钢轮）：lobes 按绕 X 的角度调制半径 */
export function gearX(v, cy, cz, rRoot, rTip, teeth, x0, x1, pid, pal, barrel = 0) {
  const step = TAU / teeth;
  paint(v, x0, x1, cy - rTip - 1, cy + rTip + 1, cz - rTip - 1, cz + rTip + 1, pid, (x, y, z) => {
    const dy = y - cy, dz = z - cz;
    const k = 1 - barrel * ((x - (x0 + x1) / 2) / ((x1 - x0) / 2)) ** 2;
    const r = Math.hypot(dy, dz);
    if (r > (rTip + 0.4) * k) return -1;
    if (r <= rRoot * k) return typeof pal === 'function' ? pal(x, y, z) : pal;
    let a = Math.atan2(dz, dy); if (a < 0) a += TAU;
    const t = (a / step) % 1;
    const c = Math.abs(t - 0.5);
    const half = 0.32, slope = 0.12;
    const h = c <= half ? 1 : c >= half + slope ? 0 : 1 - (c - half) / slope;
    const rr = (rRoot + (rTip - rRoot) * h) * k;
    return r <= rr + 0.4 ? (typeof pal === 'function' ? pal(x, y, z) : pal) : -1;
  });
}
