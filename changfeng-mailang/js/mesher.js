// 体素 → BufferGeometry。
// 三条硬规矩（都是实测踩过的坑）：
// 1) 角点偏移变量一律叫 du/dv，绝不与颜色变量抢名字（抢名字会让蓝通道被写成角点坐标）；
// 2) 顶点色在 linear 工作空间计算（sRGB hex → linear），否则输出时会被二次提亮；
// 3) 竖直面（法线 y=0）做 AO 时忽略“向下”那一侧的邻居，否则整片屋顶/坡面发闷。

import * as THREE from 'three';

const AO_LEVELS = [0.40, 0.63, 0.84, 1.0];
const FACE_SHADE = [0.955, 0.955, 1.0, 0.66, 0.905, 0.875]; // +x -x +y -y +z -z

// 每个面的法线与两个切向轴，满足 cross(u, v) = n
const DIRS = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

const linCache = new Map();
function linearRGB(packed) {
  let v = linCache.get(packed);
  if (v === undefined) {
    v = [
      srgbToLinear(((packed >> 16) & 255) / 255),
      srgbToLinear(((packed >> 8) & 255) / 255),
      srgbToLinear((packed & 255) / 255),
    ];
    linCache.set(packed, v);
  }
  return v;
}

function growable(Ctor, cap = 1 << 16) {
  return {
    a: new Ctor(cap), n: 0,
    reserve(k) {
      if (this.n + k <= this.a.length) return;
      let c = this.a.length;
      while (c < this.n + k) c *= 2;
      const b = new Ctor(c);
      b.set(this.a.subarray(0, this.n));
      this.a = b;
    },
  };
}

class MeshBuilder {
  constructor() {
    this.pos = growable(Float32Array);
    this.nor = growable(Int8Array);
    this.col = growable(Float32Array);
    this.swy = growable(Float32Array);
    this.idx = growable(Uint32Array);
    this.vertCount = 0;
  }

  // solid(x,y,z) 非 0 表示被占据；colorOf 取该体素颜色；swayOf 取风摆强度
  voxel(x, y, z, color, solid, sway255 = 0) {
    const base = linearRGB(color);
    const swayF = sway255 / 255;

    for (let d = 0; d < 6; d++) {
      const D = DIRS[d];
      const n = D.n, u = D.u, v = D.v;
      const nx = x + n[0], ny = y + n[1], nz = z + n[2];
      if (solid(nx, ny, nz)) continue;

      const vertical = n[1] === 0;
      const shade = FACE_SHADE[d];

      // 体素占 [x,x+1]³，面的基点
      const bx = x + (n[0] > 0 ? 1 : 0);
      const by = y + (n[1] > 0 ? 1 : 0);
      const bz = z + (n[2] > 0 ? 1 : 0);

      for (let c = 0; c < 4; c++) {
        const cu = (c === 1 || c === 2) ? 1 : 0;
        const cv = (c === 2 || c === 3) ? 1 : 0;
        const du = cu ? 1 : -1;
        const dv = cv ? 1 : -1;

        const side1 = solid(nx + u[0] * du, ny + u[1] * du, nz + u[2] * du) ? 1 : 0;
        // 竖直面的下侧邻居是下一阶台阶，不算遮挡
        const skipDown = vertical && dv < 0;
        const side2 = skipDown ? 0 : (solid(nx + v[0] * dv, ny + v[1] * dv, nz + v[2] * dv) ? 1 : 0);
        const corn = skipDown ? 0 : (solid(nx + u[0] * du + v[0] * dv, ny + u[1] * du + v[1] * dv, nz + u[2] * du + v[2] * dv) ? 1 : 0);

        let lvl;
        if (side1 && side2) lvl = 0;
        else lvl = 3 - (side1 + side2 + corn);

        const f = AO_LEVELS[lvl] * shade;
        this.pos.reserve(3); this.nor.reserve(3); this.col.reserve(3); this.swy.reserve(3);
        const P = this.pos.a, Pi = this.pos.n;
        P[Pi] = bx + u[0] * cu + v[0] * cv;
        P[Pi + 1] = by + u[1] * cu + v[1] * cv;
        P[Pi + 2] = bz + u[2] * cu + v[2] * cv;
        this.pos.n += 3;

        const N = this.nor.a, Ni = this.nor.n;
        N[Ni] = n[0]; N[Ni + 1] = n[1]; N[Ni + 2] = n[2];
        this.nor.n += 3;

        const C = this.col.a, Ci = this.col.n;
        C[Ci] = base[0] * f; C[Ci + 1] = base[1] * f; C[Ci + 2] = base[2] * f;
        this.col.n += 3;

        const S = this.swy.a, Si = this.swy.n;
        S[Si] = swayF; S[Si + 1] = swayF; S[Si + 2] = swayF;
        this.swy.n += 3;
      }

      const b = this.vertCount;
      this.idx.reserve(6);
      const I = this.idx.a, Ii = this.idx.n;
      I[Ii] = b; I[Ii + 1] = b + 1; I[Ii + 2] = b + 2;
      I[Ii + 3] = b; I[Ii + 4] = b + 2; I[Ii + 5] = b + 3;
      this.idx.n += 6;
      this.vertCount += 4;
    }
  }

  finish() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos.a.slice(0, this.pos.n), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor.a.slice(0, this.nor.n), 3, true));
    g.setAttribute('color', new THREE.BufferAttribute(this.col.a.slice(0, this.col.n), 3));
    // 注意：swy 是每顶点 3 个 float，itemSize 必须是 3。填 1 会让着色器只读到前 1/3，
    // 而那一段恰好全是地下的土层 —— 风摆值全在后面，表现就是「风永远不动」。
    g.setAttribute('aWind', new THREE.BufferAttribute(this.swy.a.slice(0, this.swy.n), 3));
    g.setIndex(new THREE.BufferAttribute(this.idx.a.slice(0, this.idx.n), 1));
    g.computeBoundingSphere();
    g.userData.quads = this.vertCount / 4;
    return g;
  }
}

export function meshWorld(world, onProgress) {
  const { w, h, d, solid, col, sway } = world;
  const idx = (x, y, z) => (y * d + z) * w + x;
  const solidAt = (x, y, z) => {
    if (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= d) return 0;
    return solid[(y * d + z) * w + x];
  };
  const mb = new MeshBuilder();
  let count = 0;
  for (let y = 0; y < h; y++) {
    for (let z = 0; z < d; z++) {
      const rowBase = y * d * w + z * w;
      for (let x = 0; x < w; x++) {
        const i = rowBase + x;
        if (!solid[i]) continue;
        mb.voxel(x, y, z, col[i], solidAt, sway[i]);
      }
    }
    count++;
    if (onProgress && (y & 15) === 0) onProgress(count / (h * 1));
  }
  return mb.finish();
}

export function meshSet(set) {
  const solidAt = (x, y, z) => (set.has(x, y, z) ? 1 : 0);
  const mb = new MeshBuilder();
  for (const k of set.map.keys()) {
    const c = k.indexOf(',');
    const c2 = k.indexOf(',', c + 1);
    const x = +k.slice(0, c), y = +k.slice(c + 1, c2), z = +k.slice(c2 + 1);
    mb.voxel(x, y, z, set.get(x, y, z), solidAt, set.swayAt(x, y, z));
  }
  return mb.finish();
}

export { linearRGB, srgbToLinear };