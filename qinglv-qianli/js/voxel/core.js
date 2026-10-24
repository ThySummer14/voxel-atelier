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
    /* 按 chunk-X 建的二级索引：长卷网格化只碰当前分段的 8 列 chunk。
       没有它时 forEachVoxelX 要把整张 Map（约 6 万 chunk）从头扫一遍，
       而网格化每个分段都要扫一次——索引一次、查询 15 次。 */
    this.byCx = new Map();
    this.count = 0;
  }

  _chunk(cx, cy, cz, create) {
    const k = packKey(cx, cy, cz);
    let c = this.chunks.get(k);
    if (c === undefined && create) {
      c = new Uint8Array(VOL);
      this.chunks.set(k, c);
      let col = this.byCx.get(cx);
      if (col === undefined) this.byCx.set(cx, col = []);
      col.push({ cy, cz, c });
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

  /* 整数快路径：网格化内层每面要做 1 次邻格查询 + 12 次 AO 查询，
     1.9M 面就是 2500 万次调用，省掉 Math.floor 与再一层函数跳转值得上一个量级。 */
  getI(x, y, z) {
    const c = this.chunks.get(packKey(x >> 4, y >> 4, z >> 4));
    if (c === undefined) return 0;
    return c[(x & 15) * CS2 + (y & 15) * CS + (z & 15)];
  }

  hasI(x, y, z) {
    return this.getI(x, y, z) !== 0;
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

  /** 逐个 16³ 存储块回调，带块的网格坐标；网格化按 X 分段时靠它跳过无关块 */
  forEachChunk(fn) {
    for (const [cx, col] of this.byCx)
      for (let i = 0; i < col.length; i++) {
        const e = col[i];
        fn(cx, e.cy, e.cz, e.c);
      }
  }

  forEachVoxel(fn) {
    this.forEachChunk((cx, cy, cz, chunk) => {
      for (let i = 0; i < VOL; i++) {
        const m = chunk[i];
        if (!m) continue;
        const lx = (i / CS2) | 0;
        const ly = ((i / CS) | 0) % CS;
        const lz = i % CS;
        fn(cx * CS + lx, cy * CS + ly, cz * CS + lz, m);
      }
    });
  }

  /** 只遍历 x ∈ [x0,x1] 内的体素 */
  forEachVoxelX(x0, x1, fn) {
    const cx0 = Math.floor(x0) >> 4, cx1 = Math.floor(x1) >> 4;
    for (let cx = cx0; cx <= cx1; cx++) {
      const col = this.byCx.get(cx);
      if (col === undefined) continue;
      const bx = cx * CS;
      for (let i = 0; i < col.length; i++) {
        const { cy, cz, c } = col[i];
        for (let j = 0; j < VOL; j++) {
          const m = c[j];
          if (!m) continue;
          const lx = (j / CS2) | 0;
          const x = bx + lx;
          if (x < x0 || x > x1) continue;
          fn(x, cy * CS + ((j / CS) | 0) % CS, cz * CS + (j % CS), m);
        }
      }
    }
  }

}

/* ---------------- 噪声与随机 ---------------- */

export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
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

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

