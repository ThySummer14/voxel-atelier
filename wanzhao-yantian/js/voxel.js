import * as THREE from '../vendor/three.module.js';

// ============================================================================
//  稀疏体素世界 · 单次网格化
//  面剔除 + 逐顶点 AO（对角翻转防插值瑕疵）+ 面向微调 + 分片异步构建
// ============================================================================

const OFF = 512;
const kkey = (x, y, z) => (x + OFF) | ((y + OFF) << 10) | ((z + OFF) << 20);

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

// 确定性坐标 hash：同坐标永远同结果（刷新画面一致）
export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = ((h ^ (h >>> 13)) * 1103515245) | 0;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

// 亮度抖动：amt = 相对幅度（0.08 → ±8%）
export function jitter(hex, x, y, z, amt) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const f = 1 + (hash3(x, y, z) - 0.5) * 2 * amt;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v * f));
  return (cl(r) << 16) | (cl(g) << 8) | cl(b);
}

export function mix(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16)
       | (Math.round(ag + (bg - ag) * t) << 8)
       | Math.round(ab + (bb - ab) * t);
}

// 变亮/变暗（t>0 提亮到白，t<0 压暗到黑）
export function shade(hex, t) {
  return t >= 0 ? mix(hex, 0xffffff, t) : mix(hex, 0x000000, -t);
}

// 二维值噪声 + fbm：低频色斑（盐霜花、云影、地表湿度）
export function vnoise2(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash3(xi, yi, seed), b = hash3(xi + 1, yi, seed);
  const c = hash3(xi, yi + 1, seed), d = hash3(xi + 1, yi + 1, seed);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
export function fbm2(x, y, oct = 3, seed = 0) {
  let s = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise2(x * f, y * f, seed + i * 37);
    norm += amp; amp *= 0.5; f *= 2.07;
  }
  return s / norm;
}

// 面定义：dir = 朝外法线，a1/a2 = 两切向，corners = 4 角（单位格内）
const FACES = [
  { dir: [-1, 0, 0], a1: [0, 1, 0], a2: [0, 0, 1], corners: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]], tint: 0.93 },
  { dir: [1, 0, 0], a1: [0, 1, 0], a2: [0, 0, 1], corners: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]], tint: 0.93 },
  { dir: [0, -1, 0], a1: [1, 0, 0], a2: [0, 0, 1], corners: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]], tint: 0.66 },
  { dir: [0, 1, 0], a1: [1, 0, 0], a2: [0, 0, 1], corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]], tint: 1.0 },
  { dir: [0, 0, -1], a1: [1, 0, 0], a2: [0, 1, 0], corners: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]], tint: 0.86 },
  { dir: [0, 0, 1], a1: [1, 0, 0], a2: [0, 1, 0], corners: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], tint: 0.86 },
];
const AO_LUT = [0.40, 0.61, 0.81, 1.0];
const TRI = [[0, 1, 3, 0, 3, 2], [0, 1, 2, 2, 1, 3]];   // 两种四边形切分

export class World {
  constructor() {
    this.m = new Map();
    this._colCache = new Map();
  }

  set(x, y, z, hex) { this.m.set(kkey(x, y, z), hex); return this; }
  get(x, y, z) { return this.m.get(kkey(x, y, z)); }
  has(x, y, z) { return this.m.has(kkey(x, y, z)); }
  del(x, y, z) { this.m.delete(kkey(x, y, z)); return this; }
  clear() { this.m.clear(); return this; }
  get size() { return this.m.size; }

  fill(x1, y1, z1, x2, y2, z2, hex) {
    const fn = typeof hex === 'function';
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        for (let z = z1; z <= z2; z++)
          this.set(x, y, z, fn ? hex(x, y, z) : hex);
    return this;
  }

  plate(x1, z1, x2, z2, y, hex) { return this.fill(x1, y, z1, x2, y, z2, hex); }

  boxFrame(x1, y1, z1, x2, y2, z2, hex) {
    this.fill(x1, y1, z1, x2, y1, z2, hex);
    this.fill(x1, y2, z1, x2, y2, z2, hex);
    this.fill(x1, y1, z1, x1, y2, z2, hex);
    this.fill(x2, y1, z1, x2, y2, z2, hex);
    this.fill(x1, y1, z1, x2, y2, z1, hex);
    this.fill(x1, y1, z2, x2, y2, z2, hex);
    return this;
  }

  ring(x1, z1, x2, z2, y, hex) {
    for (let x = x1; x <= x2; x++) { this.set(x, y, z1, hex); this.set(x, y, z2, hex); }
    for (let z = z1; z <= z2; z++) { this.set(x1, y, z, hex); this.set(x2, y, z, hex); }
    return this;
  }

  _linear(hex) {
    let c = this._colCache.get(hex);
    if (c === undefined) {
      // setHex 走 sRGB→working color space，顶点色不会被二次提亮
      c = new THREE.Color().setHex(hex);
      this._colCache.set(hex, c);
    }
    return c;
  }

  // 生成器式网格化：每 16k 体素让出一次，便于分片异步
  *_meshify(opt) {
    const o = opt || {};
    const useAO = o.ao !== false;
    const skipBottom = !!o.skipBottom;
    const bright = o.bright === undefined ? 1 : o.bright;
    const tintK = o.tint === undefined ? 1 : o.tint;
    const aoLut = o.aoLut || AO_LUT;

    const pos = [], nor = [], col = [], idx = [];
    const solid = (x, y, z) => this.m.has(kkey(x, y, z));
    let v = 0;

    for (const [key, hex] of this.m) {
      if ((v & 0x3fff) === 0 && v > 0) yield v / this.m.size;
      const vx = (key & 1023) - OFF;
      const vy = ((key >> 10) & 1023) - OFF;
      const vz = ((key >> 20) & 1023) - OFF;
      const base = this._linear(hex);

      for (let fi = 0; fi < 6; fi++) {
        if (skipBottom && fi === 2) continue;
        const f = FACES[fi];
        const dx = vx + f.dir[0], dy = vy + f.dir[1], dz = vz + f.dir[2];
        if (solid(dx, dy, dz)) continue;

        const v0 = v;
        const vertical = f.dir[1] === 0;
        const yTangential = f.a2[1] === 1;
        const tint = f.tint * tintK;
        let a0 = -1, a1 = -1, a2 = -1, a3 = -1;

        for (let ci = 0; ci < 4; ci++) {
          const co = f.corners[ci];
          pos.push(vx + co[0], vy + co[1], vz + co[2]);
          nor.push(f.dir[0], f.dir[1], f.dir[2]);
          let lum = tint;
          if (useAO) {
            const u1 = co[0] * f.a1[0] + co[1] * f.a1[1] + co[2] * f.a1[2];
            const u2 = co[0] * f.a2[0] + co[1] * f.a2[1] + co[2] * f.a2[2];
            const s1 = u1 === 1 ? 1 : -1;
            const s2 = u2 === 1 ? 1 : -1;
            // 竖直面沿竖直切向的下侧邻居（下一阶台面）不算遮挡，
            // 否则整片阶梯坡会被系统性压暗
            const skipLower = vertical && yTangential && s2 === -1;
            const s1x = dx + f.a1[0] * s1, s1y = dy + f.a1[1] * s1, s1z = dz + f.a1[2] * s1;
            const side1 = solid(s1x, s1y, s1z);
            const side2 = skipLower ? false : solid(dx + f.a2[0] * s2, dy + f.a2[1] * s2, dz + f.a2[2] * s2);
            const corner = skipLower ? false : solid(s1x + f.a2[0] * s2, s1y + f.a2[1] * s2, s1z + f.a2[2] * s2);
            const ao = (side1 && side2) ? 0 : 3 - ((side1 ? 1 : 0) + (side2 ? 1 : 0) + (corner ? 1 : 0));
            lum = aoLut[ao] * tint;
            if (ci === 0) a0 = ao; else if (ci === 1) a1 = ao; else if (ci === 2) a2 = ao; else a3 = ao;
          }
          col.push(base.r * lum * bright, base.g * lum * bright, base.b * lum * bright);
        }

        // AO 对角翻转：避免插值出现三角形状瑕疵
        const t = (a0 >= 0 && a0 + a3 > a1 + a2) ? TRI[0] : TRI[1];
        idx.push(v0 + t[0], v0 + t[1], v0 + t[2], v0 + t[3], v0 + t[4], v0 + t[5]);
        v += 4;
      }
    }
    yield 1;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(idx), 1));
    geo.computeBoundingSphere();
    return { geo, faces: idx.length / 3 };
  }

  buildMesh(material, opt) {
    const it = this._meshify(opt);
    let r = it.next();
    while (!r.done) r = it.next();
    const mesh = new THREE.Mesh(r.value.geo, material);
    mesh.userData.faces = r.value.faces;
    return mesh;
  }

  async buildMeshAsync(material, opt, onProgress) {
    const it = this._meshify(opt);
    let r = it.next();
    while (!r.done) {
      if (onProgress) onProgress(r.value);
      await new Promise(res => requestAnimationFrame(res));
      r = it.next();
    }
    const mesh = new THREE.Mesh(r.value.geo, material);
    mesh.userData.faces = r.value.faces;
    return mesh;
  }
}
