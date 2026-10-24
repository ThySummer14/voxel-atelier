import * as THREE from 'three';

const FACES = [
  {
    n: [1, 0, 0], shade: 0.82, kind: 'x+',
    corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
    u: [0, 1, 0], v: [0, 0, 1],
  },
  {
    n: [-1, 0, 0], shade: 0.72, kind: 'x-',
    corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    u: [0, 0, 1], v: [0, 1, 0],
  },
  {
    n: [0, 1, 0], shade: 1.0, kind: 'y+',
    corners: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
    u: [0, 0, 1], v: [1, 0, 0],
  },
  {
    n: [0, -1, 0], shade: 0.48, kind: 'y-',
    corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    u: [1, 0, 0], v: [0, 0, 1],
  },
  {
    n: [0, 0, 1], shade: 0.88, kind: 'z+',
    corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    u: [1, 0, 0], v: [0, 1, 0],
  },
  {
    n: [0, 0, -1], shade: 0.65, kind: 'z-',
    corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
    u: [0, 1, 0], v: [1, 0, 0],
  },
];

const AO_LEVELS = [0.58, 0.76, 0.9, 1.0];

function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

export class VoxelVolume {
  constructor(min, max) {
    this.min = new THREE.Vector3(Math.floor(min[0]), Math.floor(min[1]), Math.floor(min[2]));
    this.max = new THREE.Vector3(Math.ceil(max[0]), Math.ceil(max[1]), Math.ceil(max[2]));
    this.sx = this.max.x - this.min.x + 1;
    this.sy = this.max.y - this.min.y + 1;
    this.sz = this.max.z - this.min.z + 1;
    this.colors = new Uint32Array(this.sx * this.sy * this.sz);
    this.kinds = new Uint8Array(this.sx * this.sy * this.sz);
    this.count = 0;
  }

  index(x, y, z) {
    return ((y - this.min.y) * this.sz + (z - this.min.z)) * this.sx + (x - this.min.x);
  }

  inBounds(x, y, z) {
    return x >= this.min.x && x <= this.max.x
      && y >= this.min.y && y <= this.max.y
      && z >= this.min.z && z <= this.max.z;
  }

  set(x, y, z, color, kind = 0, jitter = 0) {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    if (!this.inBounds(x, y, z)) return false;
    const i = this.index(x, y, z);
    let c = color & 0xffffff;
    if (jitter > 0) {
      const f = 1 + (hash3(x * 3 + 1, y * 5 + 2, z * 7 + 3) - 0.5) * jitter * 2;
      c = scaleColor(c, f);
    }
    if (this.colors[i] === 0) this.count++;
    this.colors[i] = 0x01000000 | c;
    this.kinds[i] = kind;
    return true;
  }

  setIfEmpty(x, y, z, color, kind = 0, jitter = 0) {
    if (!this.inBounds(x, y, z)) return false;
    if (this.colors[this.index(x, y, z)] !== 0) return false;
    return this.set(x, y, z, color, kind, jitter);
  }

  has(x, y, z) {
    if (!this.inBounds(x, y, z)) return false;
    return this.colors[this.index(x, y, z)] !== 0;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return 0;
    return this.colors[this.index(x, y, z)] & 0xffffff;
  }

  fillBox(x0, y0, z0, x1, y1, z1, color, kind = 0, jitter = 0) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++) {
      for (let y = ay; y <= by; y++) {
        for (let z = az; z <= bz; z++) this.set(x, y, z, color, kind, jitter);
      }
    }
  }

  clearBox(x0, y0, z0, x1, y1, z1) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++) {
      for (let y = ay; y <= by; y++) {
        for (let z = az; z <= bz; z++) {
          if (!this.inBounds(x, y, z)) continue;
          const i = this.index(x, y, z);
          if (this.colors[i] !== 0) { this.colors[i] = 0; this.kinds[i] = 0; this.count--; }
        }
      }
    }
  }

  buildMeshes(options = {}) {
    const edgeTexture = options.edgeTexture;
    const collect = [
      { positions: [], normals: [], colors: [], uvs: [], indices: [] },
      { positions: [], normals: [], colors: [], uvs: [], indices: [] },
      { positions: [], normals: [], colors: [], uvs: [], indices: [] },
    ];
    const { min, sx, sy, sz, colors, kinds } = this;

    const occupied = (x, y, z) => {
      if (x < min.x || x >= min.x + sx || y < min.y || y >= min.y + sy || z < min.z || z >= min.z + sz) return 0;
      return colors[((y - min.y) * sz + (z - min.z)) * sx + (x - min.x)] !== 0 ? 1 : 0;
    };

    for (let gy = 0; gy < sy; gy++) {
      const y = gy + min.y;
      for (let gz = 0; gz < sz; gz++) {
        const z = gz + min.z;
        let idx = (gy * sz + gz) * sx;
        for (let gx = 0; gx < sx; gx++, idx++) {
          const packed = colors[idx];
          if (!packed) continue;
          const x = gx + min.x;
          const kind = kinds[idx];
          const base = unpackColor(packed & 0xffffff);
          const buffer = collect[kind];
          for (let f = 0; f < 6; f++) {
            const face = FACES[f];
            if (occupied(x + face.n[0], y + face.n[1], z + face.n[2])) continue;
            let sum = 0;
            const ao = [0, 0, 0, 0];
            const cornerSpec = [[0, 0], [1, 0], [1, 1], [0, 1]];
            for (let k = 0; k < 4; k++) {
              const [su, sv] = cornerSpec[k];
              const ou = su ? 1 : -1;
              const ov = sv ? 1 : -1;
              const nx = x + face.n[0], ny = y + face.n[1], nz = z + face.n[2];
              const s1 = occupied(nx + face.u[0] * ou, ny + face.u[1] * ou, nz + face.u[2] * ou);
              const s2 = occupied(nx + face.v[0] * ov, ny + face.v[1] * ov, nz + face.v[2] * ov);
              const cr = occupied(nx + face.u[0] * ou + face.v[0] * ov,
                ny + face.u[1] * ou + face.v[1] * ov,
                nz + face.u[2] * ou + face.v[2] * ov);
              const level = (s1 && s2) ? 0 : 3 - (s1 + s2 + cr);
              ao[k] = AO_LEVELS[Math.max(0, level)];
              sum += ao[k];
            }
            const faceJitter = hash3(x * 2 + f, y * 3 + f, z * 5 + f);
            const shade = face.shade * (0.965 + faceJitter * 0.07);
            const vStart = buffer.positions.length / 3;
            for (let k = 0; k < 4; k++) {
              const c = face.corners[k];
              buffer.positions.push(x + c[0], y + c[1], z + c[2]);
              buffer.normals.push(face.n[0], face.n[1], face.n[2]);
              const light = ao[k] * shade;
              const glow = kind === 2 ? 1.6 : 1;
              buffer.colors.push(base.r * light * glow, base.g * light * glow, base.b * light * glow);
              const [su, sv] = cornerSpec[k];
              buffer.uvs.push(su, sv);
            }
            buffer.indices.push(vStart, vStart + 1, vStart + 2, vStart, vStart + 2, vStart + 3);
          }
        }
      }
    }

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.02,
        envMapIntensity: 0.22,
        map: edgeTexture || null,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        roughness: 0.34,
        metalness: 0.5,
        map: edgeTexture || null,
        envMapIntensity: 0.9,
      }),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        map: edgeTexture || null,
        toneMapped: true,
      }),
    ];

    const group = new THREE.Group();
    collect.forEach((buffer, i) => {
      if (!buffer.indices.length) return;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(buffer.positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(buffer.normals, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(buffer.colors, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(buffer.uvs, 2));
      geo.setIndex(buffer.indices);
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, materials[i]);
      mesh.castShadow = i !== 2;
      mesh.receiveShadow = i !== 2;
      mesh.name = ['voxel-solid', 'voxel-metal', 'voxel-glow'][i];
      if (i === 2) mesh.renderOrder = 1;
      group.add(mesh);
    });
    group.userData.voxelCount = this.count;
    return group;
  }
}

function unpackColor(hex) {
  return {
    r: srgbToLinear(((hex >> 16) & 255) / 255),
    g: srgbToLinear(((hex >> 8) & 255) / 255),
    b: srgbToLinear((hex & 255) / 255),
  };
}

export function srgbToLinear(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function makeEdgeTexture() {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.48, '#f4f2ed');
  grad.addColorStop(1, '#dfdcd5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(40,38,34,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(3.5, 3.5, size - 7, size - 7);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function scaleColor(hex, factor) {
  const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((hex & 255) * factor)));
  return (r << 16) | (g << 8) | b;
}

export function mixColor(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16)
    | (Math.round(ag + (bg - ag) * t) << 8)
    | Math.round(ab + (bb - ab) * t);
}

export { hash3 };
