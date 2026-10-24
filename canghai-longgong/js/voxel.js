import * as THREE from '../vendor/three.module.js';

// ---------- 稀疏体素世界 ----------
const OFF = 512;
const kkey = (x, y, z) => (x + OFF) | ((y + OFF) << 10) | ((z + OFF) << 20);

export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = ((h ^ (h >>> 13)) * 1103515245) | 0;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

export function jitter(hex, x, y, z, amt) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const f = 1 + (hash3(x, y, z) - 0.5) * 2 * amt;
  const cl = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return (cl(r) << 16) | (cl(g) << 8) | cl(b);
}

export function mix(hexA, hexB, t) {
  const ar = (hexA >> 16) & 255, ag = (hexA >> 8) & 255, ab = hexA & 255;
  const br = (hexB >> 16) & 255, bg = (hexB >> 8) & 255, bb = hexB & 255;
  return (Math.round(ar + (br - ar) * t) << 16) |
         (Math.round(ag + (bg - ag) * t) << 8) |
          Math.round(ab + (bb - ab) * t);
}

export function pick(x, y, z, p, hexA, hexB) {
  return hash3(x, y, z) < p ? hexA : hexB;
}

export function shade(hexC, f) {
  const r = (hexC >> 16) & 255, g = (hexC >> 8) & 255, b = hexC & 255;
  const cl = v => Math.max(0, Math.min(255, Math.round(v)));
  if (f >= 0) return (cl(r + (255 - r) * f) << 16) | (cl(g + (255 - g) * f) << 8) | cl(b + (255 - b) * f);
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

export class World {
  constructor() {
    this.m = new Map();
    this._colCache = new Map();
  }

  set(x, y, z, hex) { this.m.set(kkey(x, y, z), hex); }
  get(x, y, z) { return this.m.get(kkey(x, y, z)); }
  has(x, y, z) { return this.m.has(kkey(x, y, z)); }
  del(x, y, z) { this.m.delete(kkey(x, y, z)); }

  fill(x1, y1, z1, x2, y2, z2, hex) {
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        for (let z = z1; z <= z2; z++)
          this.set(x, y, z, typeof hex === 'function' ? hex(x, y, z) : hex);
  }

  carve(x1, y1, z1, x2, y2, z2) {
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        for (let z = z1; z <= z2; z++) this.del(x, y, z);
  }

  boxFrame(x1, y1, z1, x2, y2, z2, hex) {
    this.fill(x1, y1, z1, x2, y1, z2, hex);
    this.fill(x1, y2, z1, x2, y2, z2, hex);
    this.fill(x1, y1, z1, x1, y2, z2, hex);
    this.fill(x2, y1, z1, x2, y2, z2, hex);
    this.fill(x1, y1, z1, x2, y2, z1, hex);
    this.fill(x1, y1, z2, x2, y2, z2, hex);
  }

  get voxelCount() { return this.m.size; }

  buildMesh(material) {
    const FACES = [
      { dir: [-1, 0, 0], a1: [0, 1, 0], a2: [0, 0, 1], corners: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]], tint: 0.93 },
      { dir: [1, 0, 0], a1: [0, 1, 0], a2: [0, 0, 1], corners: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]], tint: 0.93 },
      { dir: [0, -1, 0], a1: [1, 0, 0], a2: [0, 0, 1], corners: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]], tint: 0.66 },
      { dir: [0, 1, 0], a1: [1, 0, 0], a2: [0, 0, 1], corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]], tint: 1.0 },
      { dir: [0, 0, -1], a1: [1, 0, 0], a2: [0, 1, 0], corners: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]], tint: 0.86 },
      { dir: [0, 0, 1], a1: [1, 0, 0], a2: [0, 1, 0], corners: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], tint: 0.86 },
    ];

    const AO_LUT = [0.42, 0.62, 0.82, 1.0];
    const solid = (x, y, z) => this.m.has(kkey(x, y, z));

    const positions = [], normals = [], colors = [], indices = [];
    const tmpColor = new THREE.Color();

    for (const [key, hex] of this.m) {
      const vx = (key & 1023) - OFF;
      const vy = ((key >> 10) & 1023) - OFF;
      const vz = ((key >> 20) & 1023) - OFF;

      if (!this._colCache.has(hex)) {
        tmpColor.setHex(hex);
        this._colCache.set(hex, tmpColor.clone());
      }
      const base = this._colCache.get(hex);

      for (const face of FACES) {
        const dx = vx + face.dir[0], dy = vy + face.dir[1], dz = vz + face.dir[2];
        if (solid(dx, dy, dz)) continue;

        const vbase = positions.length / 3;
        const aoOfCorner = [];
        const vertical = face.dir[1] === 0;
        const yTangential = face.a2[1] === 1;

        for (const co of face.corners) {
          positions.push(vx + co[0], vy + co[1], vz + co[2]);
          normals.push(face.dir[0], face.dir[1], face.dir[2]);

          const u1 = co[0] * face.a1[0] + co[1] * face.a1[1] + co[2] * face.a1[2];
          const u2 = co[0] * face.a2[0] + co[1] * face.a2[1] + co[2] * face.a2[2];
          const s1 = u1 === 1 ? 1 : -1;
          const s2 = u2 === 1 ? 1 : -1;
          const skipLower = vertical && yTangential && s2 === -1;
          const side1 = solid(dx + face.a1[0] * s1, dy + face.a1[1] * s1, dz + face.a1[2] * s1);
          const side2 = skipLower ? false : solid(dx + face.a2[0] * s2, dy + face.a2[1] * s2, dz + face.a2[2] * s2);
          const corner = skipLower ? false : solid(
            dx + face.a1[0] * s1 + face.a2[0] * s2,
            dy + face.a1[1] * s1 + face.a2[1] * s2,
            dz + face.a1[2] * s1 + face.a2[2] * s2);

          const ao = (side1 && side2) ? 0 : 3 - ((side1 ? 1 : 0) + (side2 ? 1 : 0) + (corner ? 1 : 0));
          aoOfCorner.push(ao);

          const lum = AO_LUT[ao] * face.tint;
          colors.push(base.r * lum, base.g * lum, base.b * lum);
        }

        if (aoOfCorner[0] + aoOfCorner[3] > aoOfCorner[1] + aoOfCorner[2]) {
          indices.push(vbase, vbase + 1, vbase + 3, vbase, vbase + 3, vbase + 2);
        } else {
          indices.push(vbase, vbase + 1, vbase + 2, vbase + 2, vbase + 1, vbase + 3);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    return new THREE.Mesh(geo, material);
  }

  // 无 AO 无面朝向着色的简版（用于自发光体素）
  buildGlowMesh(material) {
    const FACES = [
      { dir: [-1, 0, 0], corners: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]] },
      { dir: [1, 0, 0], corners: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]] },
      { dir: [0, -1, 0], corners: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]] },
      { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]] },
      { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]] },
      { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]] },
    ];
    const solid = (x, y, z) => this.m.has(kkey(x, y, z));
    const positions = [], normals = [], colors = [], indices = [];
    const tmpColor = new THREE.Color();

    for (const [key, hex] of this.m) {
      const vx = (key & 1023) - OFF;
      const vy = ((key >> 10) & 1023) - OFF;
      const vz = ((key >> 20) & 1023) - OFF;
      if (!this._colCache.has(hex)) { tmpColor.setHex(hex); this._colCache.set(hex, tmpColor.clone()); }
      const base = this._colCache.get(hex);

      for (const face of FACES) {
        const dx = vx + face.dir[0], dy = vy + face.dir[1], dz = vz + face.dir[2];
        if (solid(dx, dy, dz)) continue;
        const vbase = positions.length / 3;
        for (const co of face.corners) {
          positions.push(vx + co[0], vy + co[1], vz + co[2]);
          normals.push(face.dir[0], face.dir[1], face.dir[2]);
          colors.push(base.r, base.g, base.b);
        }
        indices.push(vbase, vbase + 1, vbase + 3, vbase, vbase + 3, vbase + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    return new THREE.Mesh(geo, material);
  }
}
