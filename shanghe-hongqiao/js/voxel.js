// voxel.js — 自研体素内核：稀疏 Map → 面剔除 → 四角顶点 AO → 合并 BufferGeometry
// 沿用前作（灯寮/北冥/琉璃）验证过的管线，本作三组世界：solid / glow / water。

import * as THREE from '../vendor/three.module.js';

export const AO_CURVE = [0.55, 0.74, 0.90, 1.0];

function hash3(x, y, z) {
  // 整数哈希（Math.imul 防 32 位溢出精度损失，否则会产生条纹伪影）
  let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1440662683)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

export class VoxelWorld {
  constructor() {
    this.map = new Map();
  }
  static k(x, y, z) { return x + '|' + y + '|' + z; }
  set(x, y, z, c) { this.map.set(VoxelWorld.k(x, y, z), c); }
  get(x, y, z) { return this.map.get(VoxelWorld.k(x, y, z)); }
  has(x, y, z) { return this.map.has(VoxelWorld.k(x, y, z)); }
  del(x, y, z) { this.map.delete(VoxelWorld.k(x, y, z)); }
  get size() { return this.map.size; }

  // 轴对齐实心长方体填充（含端点）
  box(x0, y0, z0, x1, y1, z1, c) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) this.set(x, y, z, c);
  }
  // 挖空
  carve(x0, y0, z0, x1, y1, z1) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) this.del(x, y, z);
  }
}

// 面定义：u × v = n（保证外向绕序），base 为面基准点偏移
const FACES = [
  { n: [ 1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], base: [1, 0, 0] }, // +x
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], base: [0, 0, 0] }, // -x
  { n: [ 0, 1, 0], u: [0, 0, 1], v: [1, 0, 0], base: [0, 1, 0] }, // +y
  { n: [ 0,-1, 0], u: [1, 0, 0], v: [0, 0, 1], base: [0, 0, 0] }, // -y
  { n: [ 0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], base: [0, 0, 1] }, // +z
  { n: [ 0, 0,-1], u: [0, 1, 0], v: [1, 0, 0], base: [0, 0, 0] }, // -z
];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];

/**
 * world → 索引化 BufferGeometry（position/normal/color）
 * opts: jitter(每体素明度抖动), ao(是否烘 AO), curve(AO 曲线)
 */
export function buildGeometry(world, opts = {}) {
  const { jitter = 0.045, ao = true, curve = AO_CURVE } = opts;
  const pos = [], nor = [], col = [], idx = [];
  let vi = 0;

  const tmp = [0, 0, 0];
  const srgbLane = new THREE.Color();
  for (const [key, hex] of world.map) {
    const [x, y, z] = key.split('|').map(Number);
    // hex 是 sRGB 值；顶点色按线性空间使用，必须先转到线性，否则输出会被二次提亮成粉彩
    srgbLane.setHex(hex);
    const r = srgbLane.r, g = srgbLane.g, b = srgbLane.b;
    const jit = jitter ? 1 + (hash3(x, y, z) - 0.5) * 2 * jitter : 1;

    for (const f of FACES) {
      const [nx, ny, nz] = f.n;
      if (world.has(x + nx, y + ny, z + nz)) continue;

      for (const [cu, cv] of CORNERS) {
        const su = cu ? 1 : -1, sv = cv ? 1 : -1;
        tmp[0] = x + f.base[0] + f.u[0] * cu + f.v[0] * cv;
        tmp[1] = y + f.base[1] + f.u[1] * cu + f.v[1] * cv;
        tmp[2] = z + f.base[2] + f.u[2] * cu + f.v[2] * cv;
        pos.push(tmp[0], tmp[1], tmp[2]);
        nor.push(nx, ny, nz);

        let m = jit;
        if (ao) {
          const s1 = world.has(x + nx + f.u[0] * su, y + ny + f.u[1] * su, z + nz + f.u[2] * su) ? 1 : 0;
          const s2 = world.has(x + nx + f.v[0] * sv, y + ny + f.v[1] * sv, z + nz + f.v[2] * sv) ? 1 : 0;
          const cc = world.has(
            x + nx + f.u[0] * su + f.v[0] * sv,
            y + ny + f.u[1] * su + f.v[1] * sv,
            z + nz + f.u[2] * su + f.v[2] * sv
          ) ? 1 : 0;
          const level = (s1 && s2) ? 0 : 3 - (s1 + s2 + cc);
          m *= curve[level];
        }
        col.push(Math.min(1, r * m), Math.min(1, g * m), Math.min(1, b * m));
      }

      // 四点顺序 v0(0,0) v1(1,0) v2(1,1) v3(0,1)；AO 各向异性翻转
      const [i0, i1, i2, i3] = [vi, vi + 1, vi + 2, vi + 3];
      const a0 = col[(i0) * 3], a1 = col[(i1) * 3], a2 = col[(i2) * 3], a3 = col[(i3) * 3];
      if (a0 + a2 >= a1 + a3) idx.push(i0, i1, i2, i0, i2, i3);
      else idx.push(i1, i2, i3, i1, i3, i0);
      vi += 4;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return { geometry: geo, quads: idx.length / 6, voxels: world.size };
}

// —— 调色板工具 ——
export function hex(c) { return c; } // 0xRRGGBB 直用
export function shade(hexC, f) {
  // f>0 提亮 f<0 压暗（0..1）
  const r = (hexC >> 16) & 255, g = (hexC >> 8) & 255, b = hexC & 255;
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  if (f >= 0) {
    return (cl(r + (255 - r) * f) << 16) | (cl(g + (255 - g) * f) << 8) | cl(b + (255 - b) * f);
  }
  return (cl(r * (1 + f)) << 16) | (cl(g * (1 + f)) << 8) | cl(b * (1 + f));
}

// 可复现随机
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
