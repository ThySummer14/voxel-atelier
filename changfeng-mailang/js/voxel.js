// 体素容器 + 几何生成器。
// 约定：x 向右、y 向上、z 向南（相机在 +z 一侧看向 -z）。

export const hex = (h) => (h >>> 0);

// 大世界：扁平数组，mesher 顺序扫描 y→z→x
export class VoxelWorld {
  constructor(w, h, d) {
    this.w = w; this.h = h; this.d = d;
    const n = w * h * d;
    this.solid = new Uint8Array(n);
    this.col = new Uint32Array(n);   // 0xRRGGBB，sRGB
    this.sway = new Uint8Array(n);   // 0..255，风中摆动强度
    this.top = new Int16Array(w * d).fill(-1); // 每列最高实心体素，供散布用
  }

  idx(x, y, z) { return (y * this.d + z) * this.w + x; }
  inBounds(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.h && z < this.d; }

  set(x, y, z, c, sway = 0) {
    if (!this.inBounds(x, y, z)) return;
    const i = this.idx(x, y, z);
    this.solid[i] = 1;
    this.col[i] = c;
    if (sway) this.sway[i] = sway;
    const t = z * this.w + x;
    if (y > this.top[t]) this.top[t] = y;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return 0;
    return this.solid[this.idx(x, y, z)];
  }

  colorAt(x, y, z) {
    if (!this.inBounds(x, y, z)) return 0;
    return this.col[this.idx(x, y, z)];
  }

  swayAt(x, y, z) {
    if (!this.inBounds(x, y, z)) return 0;
    return this.sway[this.idx(x, y, z)];
  }

  // 只在空处写入（不覆盖已有实体）
  setIfEmpty(x, y, z, c, sway = 0) {
    if (!this.inBounds(x, y, z)) return false;
    const i = this.idx(x, y, z);
    if (this.solid[i]) return false;
    this.solid[i] = 1;
    this.col[i] = c;
    if (sway) this.sway[i] = sway;
    const t = z * this.w + x;
    if (y > this.top[t]) this.top[t] = y;
    return true;
  }

  box(x0, y0, z0, x1, y1, z1, c, sway = 0) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) this.set(x, y, z, c, sway);
  }

  // 空心盒（只画四壁与顶底）
  shell(x0, y0, z0, x1, y1, z1, c, sway = 0, opts = {}) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) {
          const edge = x === ax || x === bx || z === az || z === bz || (opts.noTop === false && y === by) || y === ay;
          if (edge) this.set(x, y, z, c, sway);
        }
  }

  cylinder(cx, cz, r, y0, y1, c, sway = 0) {
    const r2 = r * r;
    for (let y = y0; y <= y1; y++)
      for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x - cx, dz = z - cz;
          if (dx * dx + dz * dz <= r2) this.set(x, y, z, c, sway);
        }
  }

  disc(cx, cz, r, y, c, sway = 0) {
    const r2 = r * r;
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x - cx, dz = z - cz;
        if (dx * dx + dz * dz <= r2) this.set(x, y, z, c, sway);
      }
  }

  // 竖直圆柱（树干、烟囱、柱）
  post(cx, cz, r, y0, y1, c) {
    const r2 = r * r;
    for (let y = y0; y <= y1; y++)
      for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x - cx, dz = z - cz;
          if (dx * dx + dz * dz <= r2) this.set(x, y, z, c);
        }
  }
}

// 小道具用的稀疏体素集合（Map 实现，坐标可负）
export class VoxelSet {
  constructor() {
    this.map = new Map(); // key -> packed 0xRRGGBB<<8 | sway
    this.bounds = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  }

  key(x, y, z) { return `${x},${y},${z}`; }

  set(x, y, z, c, sway = 0) {
    this.map.set(this.key(x, y, z), ((c & 0xffffff) << 8) | (sway & 0xff));
    const b = this.bounds;
    if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (z < b[2]) b[2] = z;
    if (x > b[3]) b[3] = x; if (y > b[4]) b[4] = y; if (z > b[5]) b[5] = z;
  }

  get(x, y, z) {
    const v = this.map.get(this.key(x, y, z));
    return v === undefined ? 0 : v >>> 8;
  }

  swayAt(x, y, z) {
    const v = this.map.get(this.key(x, y, z));
    return v === undefined ? 0 : v & 0xff;
  }

  has(x, y, z) { return this.map.has(this.key(x, y, z)); }

  get size() { return this.map.size; }

  // 平移到世界坐标后再写进大世界（旋转由调用方先做）
  stamp(world, ox, oy, oz) {
    for (const [k, v] of this.map) {
      const p = k.split(',');
      world.set(+p[0] + ox, +p[1] + oy, +p[2] + oz, v >>> 8, v & 0xff);
    }
  }

  // 只写入空处（避免与地形互相覆盖）
  stampIfEmpty(world, ox, oy, oz) {
    for (const [k, v] of this.map) {
      const p = k.split(',');
      world.setIfEmpty(+p[0] + ox, +p[1] + oy, +p[2] + oz, v >>> 8, v & 0xff);
    }
  }

  box(x0, y0, z0, x1, y1, z1, c, sway = 0) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) this.set(x, y, z, c, sway);
  }

  // 空心屋壳
  room(x0, y0, z0, x1, y1, z1, c) {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) {
          const shell = x === x0 || x === x1 || z === z0 || z === z1 || y === y0;
          if (shell) this.set(x, y, z, c);
        }
  }

  post(cx, cz, r, y0, y1, c) {
    const r2 = r * r;
    for (let y = y0; y <= y1; y++)
      for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x - cx, dz = z - cz;
          if (dx * dx + dz * dz <= r2) this.set(x, y, z, c);
        }
  }

  disc(cx, cz, r, y, c, sway = 0) {
    const r2 = r * r;
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x - cx, dz = z - cz;
        if (dx * dx + dz * dz <= r2) this.set(x, y, z, c, sway);
      }
  }
}