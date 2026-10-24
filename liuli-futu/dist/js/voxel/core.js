/* 体素场内核：分块稀疏存储 + 噪声 + 雕刻 DSL
 * 材质以 1..255 存储（0 = 空），网格坐标为整数体素，y 轴向上。
 */

const CS = 16;
const CS2 = CS * CS;
const VOL = CS * CS * CS;
const OFF = 512; // chunk 坐标偏移，支持 ±512 个 chunk

const packKey = (cx, cy, cz) =>
  (cx + OFF) * 1048576 + (cy + OFF) * 1024 + (cz + OFF);

export class Grid {
  constructor() {
    this.chunks = new Map();
    this.count = 0;
  }

  _chunk(cx, cy, cz, create) {
    const k = packKey(cx, cy, cz);
    let c = this.chunks.get(k);
    if (c === undefined && create) {
      c = new Uint8Array(VOL);
      this.chunks.set(k, c);
    }
    return c;
  }

  get(x, y, z) {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    const c = this._chunk(x >> 4, y >> 4, z >> 4, false);
    if (c === undefined) return 0;
    return c[(x & 15) * CS2 + (y & 15) * CS + (z & 15)];
  }

  has(x, y, z) {
    return this.get(x, y, z) !== 0;
  }

  set(x, y, z, m) {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    const cx = x >> 4, cy = y >> 4, cz = z >> 4;
    const i = (x & 15) * CS2 + (y & 15) * CS + (z & 15);
    const c = this._chunk(cx, cy, cz, true);
    if (c === undefined) return;
    const v = m | 0;
    if (c[i] === 0 && v !== 0) this.count++;
    else if (c[i] !== 0 && v === 0) this.count--;
    c[i] = v;
  }

  /** 只在为空时写入，用于叠加细节而不覆盖主体 */
  setIfEmpty(x, y, z, m) {
    if (this.get(x, y, z) === 0) this.set(x, y, z, m);
  }

  /** fn(x,y,z) 返回材质（0/undefined = 空）；对包围盒内每个格子求值 */
  field(x0, y0, z0, x1, y1, z1, fn) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          const m = fn(x, y, z);
          if (m) this.set(x, y, z, m);
        }
  }

  box(x0, y0, z0, x1, y1, z1, m) {
    this.field(
      Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1),
      Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1),
      () => m
    );
  }

  /** 只留外壳（六面），keepBottom=false 时去掉底面 */
  shell(x0, y0, z0, x1, y1, z1, m, keepBottom = true) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++)
      for (let y = ay; y <= by; y++)
        for (let z = az; z <= bz; z++) {
          if (!(x === ax || x === bx || y === ay || y === by || z === az || z === bz)) continue;
          if (!keepBottom && y === ay) continue;
          this.set(x, y, z, m);
        }
  }

  /** 只留外壳六面 */
  hollowBox(x0, y0, z0, x1, y1, z1, m, keepBottom = true) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++)
      for (let y = ay; y <= by; y++)
        for (let z = az; z <= bz; z++) {
          if (!(x === ax || x === bx || y === ay || y === by || z === az || z === bz)) continue;
          if (!keepBottom && y === ay) continue;
          this.set(x, y, z, m);
        }
  }

  /** 只描包围盒的 12 条棱 */
  edges(x0, y0, z0, x1, y1, z1, m) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++) {
      this.set(x, ay, az, m); this.set(x, ay, bz, m);
      this.set(x, by, az, m); this.set(x, by, bz, m);
    }
    for (let y = ay; y <= by; y++) {
      this.set(ax, y, az, m); this.set(ax, y, bz, m);
      this.set(bx, y, az, m); this.set(bx, y, bz, m);
    }
    for (let z = az; z <= bz; z++) {
      this.set(ax, ay, z, m); this.set(ax, by, z, m);
      this.set(bx, ay, z, m); this.set(bx, by, z, m);
    }
  }

  ellipsoid(cx, cy, cz, rx, ry, rz, mFn, power = 2) {
    const x0 = Math.floor(cx - rx) - 1, x1 = Math.ceil(cx + rx) + 1;
    const y0 = Math.floor(cy - ry) - 1, y1 = Math.ceil(cy + ry) + 1;
    const z0 = Math.floor(cz - rz) - 1, z1 = Math.ceil(cz + rz) + 1;
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          const a = (x + 0.5 - cx) / rx, b = (y + 0.5 - cy) / ry, c = (z + 0.5 - cz) / rz;
          const d = Math.pow(Math.abs(a), power) + Math.pow(Math.abs(b), power) + Math.pow(Math.abs(c), power);
          if (d > 1) continue;
          const m = typeof mFn === "function" ? mFn(x, y, z, d) : mFn;
          if (m) this.set(x, y, z, m);
        }
  }

  /** 竖直圆柱（可带半径随高度变化） */
  cylinder(cx, cz, y0, y1, rFn, mFn) {
    const r0 = typeof rFn === "function" ? rFn(y0) : rFn;
    const r1 = typeof rFn === "function" ? rFn(y1) : rFn;
    const R = Math.ceil(Math.max(r0, r1)) + 1;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      const r = typeof rFn === "function" ? rFn(y, t) : rFn;
      for (let dx = -R; dx <= R; dx++)
        for (let dz = -R; dz <= R; dz++) {
          if (dx * dx + dz * dz > r * r) continue;
          const m = typeof mFn === "function" ? mFn(cx + dx, y, cz + dz, dx, dz, t) : mFn;
          if (m) this.set(cx + dx, y, cz + dz, m);
        }
    }
  }

  /** 沿 y 堆叠的任意“截面函数”轮廓：inside(x,z,y)->bool, mat(x,z,y)->材质 */
  profile(y0, y1, halfX, halfZ, inside, mat) {
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      for (let dx = -halfX; dx <= halfX; dx++)
        for (let dz = -halfZ; dz <= halfZ; dz++) {
          if (!inside(dx, dz, t, y)) continue;
          const m = typeof mat === "function" ? mat(dx, dz, t, y) : mat;
          if (m) this.set(dx, y, dz, m);
        }
    }
  }

  forEachVoxel(fn) {
    for (const [k, chunk] of this.chunks) {
      const cz = (k % 1024) - OFF;
      const cy = (Math.floor(k / 1024) % 1024) - OFF;
      const cx = Math.floor(k / 1048576) - OFF;
      for (let i = 0; i < VOL; i++) {
        const m = chunk[i];
        if (!m) continue;
        const lx = (i / CS2) | 0;
        const ly = ((i / CS) | 0) % CS;
        const lz = i % CS;
        fn(cx * CS + lx, cy * CS + ly, cz * CS + lz, m);
      }
    }
  }

  bounds() {
    let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    this.forEachVoxel((x, y, z) => {
      if (x < min[0]) min[0] = x; if (x > max[0]) max[0] = x;
      if (y < min[1]) min[1] = y; if (y > max[1]) max[1] = y;
      if (z < min[2]) min[2] = z; if (z > max[2]) max[2] = z;
    });
    if (!isFinite(min[0])) { min = [0, 0, 0]; max = [0, 0, 0]; }
    return { min, max };
  }
}

/* ---------------- 噪声与随机 ---------------- */

export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}

export function hash2(x, y) {
  return hash3(x, y, 7919);
}

function smooth(t) { return t * t * (3 - 2 * t); }

export function valueNoise2(x, z, seed = 0) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = smooth(x - xi), zf = smooth(z - zi);
  const h = (a, b) => hash3(a, b, seed);
  const a = h(xi, zi), b = h(xi + 1, zi), c = h(xi, zi + 1), d = h(xi + 1, zi + 1);
  return (a * (1 - xf) + b * xf) * (1 - zf) + (c * (1 - xf) + d * xf) * zf;
}

export function valueNoise3(x, y, z, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const l = (a, b) => a + (b - a) * xf;
  const n = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz, seed);
  const y00 = l(n(0, 0, 0), n(1, 0, 0));
  const y10 = l(n(0, 1, 0), n(1, 1, 0));
  const y01 = l(n(0, 0, 1), n(1, 0, 1));
  const y11 = l(n(0, 1, 1), n(1, 1, 1));
  const z0 = y00 + (y10 - y00) * yf;
  const z1 = y01 + (y11 - y01) * yf;
  return z0 + (z1 - z0) * zf;
}

export function fbm2(x, z, oct = 4, seed = 0, lac = 2, gain = 0.5) {
  let s = 0, a = 1, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * valueNoise2(x * f, z * f, seed + i * 31);
    n += a; a *= gain; f *= lac;
  }
  return s / n;
}

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- 几何小工具 ---------------- */

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** 正八边形（顶点朝 45°方向）的“半径”度量：<=a 即在八边形内 */
export function octR(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  return Math.max(ax, az, (ax + az) * Math.SQRT1_2);
}

/** 返回体素落在八边形的哪条边上 0..7（-1 = 内部） */
export function octFace(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const s = Math.max(ax, az, (ax + az) * Math.SQRT1_2);
  const eps = 0.001;
  if (Math.abs(ax - s) < eps) return az > ax ? 0 : 4; // |x| 边
  if (Math.abs(az - s) < eps) return ax > az ? 2 : 6; // |z| 边
  if (Math.abs((ax + az) * Math.SQRT1_2 - s) < eps) {
    if (x > 0 && z > 0) return 1;
    if (x < 0 && z > 0) return 3;
    if (x < 0 && z < 0) return 5;
    return 7;
  }
  return -1;
}

/** 绕 y 轴旋转 (x,z)，角度为弧度 */
export function rotXZ(x, z, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return [x * c - z * s, x * s + z * c];
}

/** 把一个回调体以 8 面镜像各放一份（用于非八边形对称细节） */
export function mirror8(fn) {
  for (let i = 0; i < 8; i++) {
    const s = i & 1 ? -1 : 1;
    const t = i & 2 ? -1 : 1;
    const swap = i & 4;
    fn(swap ? 1 : 0, s, t);
  }
}
