// voxel.js — 神隐天阙：体素空间哈希内核 / 面剔除 / 四角顶点 AO 烘焙 / 几何合并
import * as THREE from '../vendor/three.module.js';

export const AO_CURVE = [0.52, 0.72, 0.88, 1.0];

function hash3(x, y, z) {
  let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1440662683)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

export class VoxelWorld {
  constructor() {
    this.map = new Map();
  }
  static k(x, y, z) { return `${x | 0}|${y | 0}|${z | 0}`; }
  set(x, y, z, c) { this.map.set(VoxelWorld.k(x, y, z), c); }
  get(x, y, z) { return this.map.get(VoxelWorld.k(x, y, z)); }
  has(x, y, z) { return this.map.has(VoxelWorld.k(x, y, z)); }
  del(x, y, z) { this.map.delete(VoxelWorld.k(x, y, z)); }
  get size() { return this.map.size; }

  // 轴对齐实心长方体
  box(x0, y0, z0, x1, y1, z1, c) {
    const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          this.set(x, y, z, c);
        }
      }
    }
  }

  // 挖空
  carve(x0, y0, z0, x1, y1, z1) {
    const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          this.del(x, y, z);
        }
      }
    }
  }
}

// 6 面拓扑定义：u × v = n（逆时针外向绕序）
const FACES = [
  { n: [ 1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], base: [1, 0, 0] }, // +X
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], base: [0, 0, 0] }, // -X
  { n: [ 0, 1, 0], u: [0, 0, 1], v: [1, 0, 0], base: [0, 1, 0] }, // +Y
  { n: [ 0,-1, 0], u: [1, 0, 0], v: [0, 0, 1], base: [0, 0, 0] }, // -Y
  { n: [ 0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], base: [0, 0, 1] }, // +Z
  { n: [ 0, 0,-1], u: [0, 1, 0], v: [1, 0, 0], base: [0, 0, 0] }, // -Z
];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];

/**
 * 将 VoxelWorld 网格化为 BufferGeometry
 */
export function buildGeometry(world, opts = {}) {
  const { jitter = 0.035, ao = true, curve = AO_CURVE } = opts;
  const pos = [], nor = [], col = [], idx = [];
  let vi = 0;

  const tmp = [0, 0, 0];
  const srgb = new THREE.Color();

  for (const [key, hex] of world.map) {
    const parts = key.split('|');
    const x = +parts[0], y = +parts[1], z = +parts[2];

    srgb.setHex(hex);
    const r = srgb.r, g = srgb.g, b = srgb.b;
    const jit = jitter ? 1 + (hash3(x, y, z) - 0.5) * 2 * jitter : 1;

    for (let fi = 0; fi < 6; fi++) {
      const f = FACES[fi];
      const nx = f.n[0], ny = f.n[1], nz = f.n[2];

      if (world.has(x + nx, y + ny, z + nz)) continue;

      for (let ci = 0; ci < 4; ci++) {
        const cu = CORNERS[ci][0], cv = CORNERS[ci][1];
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

      const i0 = vi, i1 = vi + 1, i2 = vi + 2, i3 = vi + 3;
      const a0 = col[i0 * 3], a1 = col[i1 * 3], a2 = col[i2 * 3], a3 = col[i3 * 3];

      if (a0 + a2 >= a1 + a3) {
        idx.push(i0, i1, i2, i0, i2, i3);
      } else {
        idx.push(i1, i2, i3, i1, i3, i0);
      }
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

export function shade(hexC, f) {
  const r = (hexC >> 16) & 255, g = (hexC >> 8) & 255, b = hexC & 255;
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  if (f >= 0) {
    return (cl(r + (255 - r) * f) << 16) | (cl(g + (255 - g) * f) << 8) | cl(b + (255 - b) * f);
  }
  return (cl(r * (1 + f)) << 16) | (cl(g * (1 + f)) << 8) | cl(b * (1 + f));
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
