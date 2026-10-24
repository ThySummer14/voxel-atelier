/**
 * 体素场 + 面剔除网格 + 顶点 AO
 */

export const MAT = {
  // 鲲
  WHALE_BACK: 0,
  WHALE_MID: 1,
  WHALE_SIDE: 2,
  WHALE_BELLY: 3,
  WHALE_BELLY_LITE: 4,
  WHALE_FIN: 5,
  WHALE_RIDGE: 6,
  WHALE_SCAR: 7,
  EYE: 8,
  EYE_CORE: 9,
  MOUTH: 10,
  GLOW_SPOT: 11,
  // 山岩
  ROCK_DARK: 12,
  ROCK: 13,
  ROCK_LITE: 14,
  MOSS: 15,
  GRASS: 16,
  GRASS_LITE: 17,
  SNOW: 18,
  // 松
  PINE_DARK: 19,
  PINE: 20,
  PINE_LITE: 21,
  TRUNK: 22,
  // 楼阁
  WOOD: 23,
  WOOD_DARK: 24,
  WOOD_LITE: 25,
  PLASTER: 26,
  ROOF: 27,
  ROOF_DARK: 28,
  ROOF_LITE: 29,
  GOLD: 30,
  GOLD_LITE: 31,
  STONE_STEP: 32,
  // 灯
  LANTERN: 33,
  LANTERN_CORE: 34,
  WINDOW: 35,
  // 水
  WATER: 36,
  WATER_DEEP: 37,
  FOAM: 38,
  STARFALL: 39,
  // 云雾
  CLOUD: 40,
  CLOUD_DARK: 41,
  CLOUD_LITE: 42,
  // 鳌甲
  SHELL_DARK: 43,
  SHELL: 44,
  SHELL_LITE: 45,
  SHELL_RIM: 46,
  SHELL_SCUTE: 47,
};

export const COLORS = [
  0x1a2a48, // WHALE_BACK
  0x2c4568, // WHALE_MID
  0x406088, // WHALE_SIDE
  0x5a84a8, // WHALE_BELLY
  0x82a8c8, // WHALE_BELLY_LITE
  0x1A2840, // WHALE_FIN
  0x152030, // WHALE_RIDGE
  0x4a6080, // WHALE_SCAR
  0x7ec8ff, // EYE
  0xd0f0ff, // EYE_CORE
  0x1a1520, // MOUTH
  0x6ec8ff, // GLOW_SPOT
  0x3a3542, // ROCK_DARK
  0x5a5260, // ROCK
  0x7a7280, // ROCK_LITE
  0x3a5a48, // MOSS
  0x4a7a58, // GRASS
  0x5a8a68, // GRASS_LITE
  0xd8e8f0, // SNOW
  0x1e4a3a, // PINE_DARK
  0x2a5a48, // PINE
  0x3a6a58, // PINE_LITE
  0x5a3a28, // TRUNK
  0x8b5a3c, // WOOD
  0x5c3a22, // WOOD_DARK
  0xb08050, // WOOD_LITE
  0xe0d4c0, // PLASTER
  0x2a6a5a, // ROOF
  0x1a4a3e, // ROOF_DARK
  0x3a8a72, // ROOF_LITE
  0xc4a050, // GOLD
  0xe0c878, // GOLD_LITE
  0x8a8090, // STONE_STEP
  0xffb347, // LANTERN
  0xffd28a, // LANTERN_CORE
  0xffaa50, // WINDOW
  0x7ec8ff, // WATER
  0x3a8ab0, // WATER_DEEP
  0xe8f8ff, // FOAM
  0xa0d8ff, // STARFALL
  0xa8b8d0, // CLOUD
  0x6a7a98, // CLOUD_DARK
  0xd0dcf0, // CLOUD_LITE
  0x1a3a38, // SHELL_DARK
  0x2a5a52, // SHELL
  0x3a7a6a, // SHELL_LITE
  0xc4a050, // SHELL_RIM (鎏金甲缘)
  0x1e4a42, // SHELL_SCUTE
];

export const EMISSIVE = new Set([
  MAT.EYE,
  MAT.EYE_CORE,
  MAT.GLOW_SPOT,
  MAT.LANTERN,
  MAT.LANTERN_CORE,
  MAT.WINDOW,
  MAT.STARFALL,
  MAT.FOAM,
]);

export const WATERISH = new Set([
  MAT.WATER,
  MAT.WATER_DEEP,
  MAT.FOAM,
  MAT.STARFALL,
]);

const key = (x, y, z) => `${x},${y},${z}`;

export class Voxels {
  constructor() {
    this.map = new Map();
  }

  set(x, y, z, mat) {
    if (mat === undefined || mat === null) return;
    this.map.set(key(x | 0, y | 0, z | 0), mat | 0);
  }

  get(x, y, z) {
    return this.map.get(key(x | 0, y | 0, z | 0));
  }

  has(x, y, z) {
    return this.map.has(key(x | 0, y | 0, z | 0));
  }

  delete(x, y, z) {
    this.map.delete(key(x | 0, y | 0, z | 0));
  }

  fillBox(x0, y0, z0, x1, y1, z1, mat) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          this.set(x, y, z, mat);
  }

  hollowBox(x0, y0, z0, x1, y1, z1, mat, keepBottom = true) {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const ay = Math.min(y0, y1), by = Math.max(y0, y1);
    const az = Math.min(z0, z1), bz = Math.max(z0, z1);
    for (let x = ax; x <= bx; x++)
      for (let y = ay; y <= by; y++)
        for (let z = az; z <= bz; z++) {
          const shell = x === ax || x === bx || y === ay || y === by || z === az || z === bz;
          if (!shell) continue;
          if (!keepBottom && y === ay) continue;
          this.set(x, y, z, mat);
        }
  }

  /** 超椭球填充（用于鲸体、云团） */
  fillSuperEllipsoid(cx, cy, cz, rx, ry, rz, n, matFn) {
    const x0 = Math.floor(cx - rx) - 1, x1 = Math.ceil(cx + rx) + 1;
    const y0 = Math.floor(cy - ry) - 1, y1 = Math.ceil(cy + ry) + 1;
    const z0 = Math.floor(cz - rz) - 1, z1 = Math.ceil(cz + rz) + 1;
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          const dx = Math.abs((x + 0.5 - cx) / rx);
          const dy = Math.abs((y + 0.5 - cy) / ry);
          const dz = Math.abs((z + 0.5 - cz) / rz);
          const d = Math.pow(dx, n) + Math.pow(dy, n) + Math.pow(dz, n);
          if (d > 1) continue;
          const mat = typeof matFn === "function" ? matFn(x, y, z, d) : matFn;
          if (mat !== undefined && mat !== null) this.set(x, y, z, mat);
        }
  }

  *entries() {
    yield* this.map.entries();
  }

  get size() {
    return this.map.size;
  }
}

const FACES = [
  {
    n: [0, 1, 0],
    shade: 1.0,
    corners: [
      { p: [0, 1, 0], s1: [-1, 1, 0], s2: [0, 1, -1], c: [-1, 1, -1] },
      { p: [1, 1, 0], s1: [1, 1, 0], s2: [0, 1, -1], c: [1, 1, -1] },
      { p: [1, 1, 1], s1: [1, 1, 0], s2: [0, 1, 1], c: [1, 1, 1] },
      { p: [0, 1, 1], s1: [-1, 1, 0], s2: [0, 1, 1], c: [-1, 1, 1] },
    ],
  },
  {
    n: [0, -1, 0],
    shade: 0.42,
    corners: [
      { p: [0, 0, 1], s1: [-1, -1, 0], s2: [0, -1, 1], c: [-1, -1, 1] },
      { p: [1, 0, 1], s1: [1, -1, 0], s2: [0, -1, 1], c: [1, -1, 1] },
      { p: [1, 0, 0], s1: [1, -1, 0], s2: [0, -1, -1], c: [1, -1, -1] },
      { p: [0, 0, 0], s1: [-1, -1, 0], s2: [0, -1, -1], c: [-1, -1, -1] },
    ],
  },
  {
    n: [1, 0, 0],
    shade: 0.78,
    corners: [
      { p: [1, 0, 1], s1: [1, -1, 0], s2: [1, 0, 1], c: [1, -1, 1] },
      { p: [1, 0, 0], s1: [1, -1, 0], s2: [1, 0, -1], c: [1, -1, -1] },
      { p: [1, 1, 0], s1: [1, 1, 0], s2: [1, 0, -1], c: [1, 1, -1] },
      { p: [1, 1, 1], s1: [1, 1, 0], s2: [1, 0, 1], c: [1, 1, 1] },
    ],
  },
  {
    n: [-1, 0, 0],
    shade: 0.62,
    corners: [
      { p: [0, 0, 0], s1: [-1, -1, 0], s2: [-1, 0, -1], c: [-1, -1, -1] },
      { p: [0, 0, 1], s1: [-1, -1, 0], s2: [-1, 0, 1], c: [-1, -1, 1] },
      { p: [0, 1, 1], s1: [-1, 1, 0], s2: [-1, 0, 1], c: [-1, 1, 1] },
      { p: [0, 1, 0], s1: [-1, 1, 0], s2: [-1, 0, -1], c: [-1, 1, -1] },
    ],
  },
  {
    n: [0, 0, 1],
    shade: 0.88,
    corners: [
      { p: [1, 0, 1], s1: [1, 0, 1], s2: [0, -1, 1], c: [1, -1, 1] },
      { p: [0, 0, 1], s1: [-1, 0, 1], s2: [0, -1, 1], c: [-1, -1, 1] },
      { p: [0, 1, 1], s1: [-1, 0, 1], s2: [0, 1, 1], c: [-1, 1, 1] },
      { p: [1, 1, 1], s1: [1, 0, 1], s2: [0, 1, 1], c: [1, 1, 1] },
    ],
  },
  {
    n: [0, 0, -1],
    shade: 0.7,
    corners: [
      { p: [0, 0, 0], s1: [-1, 0, -1], s2: [0, -1, -1], c: [-1, -1, -1] },
      { p: [1, 0, 0], s1: [1, 0, -1], s2: [0, -1, -1], c: [1, -1, -1] },
      { p: [1, 1, 0], s1: [1, 0, -1], s2: [0, 1, -1], c: [1, 1, -1] },
      { p: [0, 1, 0], s1: [-1, 0, -1], s2: [0, 1, -1], c: [-1, 1, -1] },
    ],
  },
];

// fix -Z face corner c for AO (diagonal)
FACES[5].corners[0].c = [-1, -1, -1];
FACES[5].corners[1].c = [1, -1, -1];
FACES[5].corners[2].c = [1, 1, -1];
FACES[5].corners[3].c = [-1, 1, -1];

function aoLevel(s1, s2, c) {
  if (s1 && s2) return 0;
  return 3 - (s1 + s2 + c);
}

const AO_CURVE = [0.4, 0.6, 0.82, 1.0];

function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * 烘焙 BufferGeometry（顶点色 + AO）
 * group: 'solid' | 'emissive' | 'water'
 */
export function buildGeometry(voxels, opts = {}) {
  const scale = opts.scale ?? 1;
  const origin = opts.origin ?? [0, 0, 0];
  const group = opts.group ?? "solid";

  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const roughness = [];

  function writeColor(out, hex, mult, jitter) {
    const r = ((hex >> 16) & 255) / 255;
    const g = ((hex >> 8) & 255) / 255;
    const b = (hex & 255) / 255;
    out.push(r * mult * jitter, g * mult * jitter, b * mult * jitter);
  }

  let vi = 0;

  for (const [k, mat] of voxels.entries()) {
    const parts = k.split(",");
    const x = +parts[0], y = +parts[1], z = +parts[2];
    const isEm = EMISSIVE.has(mat);
    const isWat = WATERISH.has(mat);
    if (group === "emissive" && !isEm) continue;
    if (group === "water" && !isWat) continue;
    if (group === "solid" && (isEm || isWat)) continue;

    const hex = COLORS[mat] ?? 0xff00ff;
    const jitter = 0.94 + hash3(x, y, z) * 0.12;

    for (const face of FACES) {
      const nx = x + face.n[0];
      const ny = y + face.n[1];
      const nz = z + face.n[2];
      const nb = voxels.get(nx, ny, nz);
      if (nb !== undefined) {
        if (group === "water") {
          if (WATERISH.has(nb)) continue;
        } else if (group === "emissive") {
          if (EMISSIVE.has(nb)) continue;
        } else if (!WATERISH.has(nb)) {
          continue;
        }
      }

      const faceShade = face.shade;
      const base = vi;
      const ao = [];

      for (let i = 0; i < 4; i++) {
        const corner = face.corners[i];
        const s1 = voxels.has(x + corner.s1[0], y + corner.s1[1], z + corner.s1[2]) ? 1 : 0;
        const s2 = voxels.has(x + corner.s2[0], y + corner.s2[1], z + corner.s2[2]) ? 1 : 0;
        const cc = voxels.has(x + corner.c[0], y + corner.c[1], z + corner.c[2]) ? 1 : 0;
        const level = aoLevel(s1, s2, cc);
        ao.push(level);

        const px = (x + corner.p[0] + origin[0]) * scale;
        const py = (y + corner.p[1] + origin[1]) * scale;
        const pz = (z + corner.p[2] + origin[2]) * scale;
        positions.push(px, py, pz);
        normals.push(face.n[0], face.n[1], face.n[2]);

        const aoMul = isEm ? 1 : AO_CURVE[level];
        const shade = isEm ? 1.05 : faceShade * aoMul;
        const topBoost = face.n[1] === 1 ? 1.06 : 1;
        writeColor(colors, hex, shade * topBoost, jitter);
        roughness.push(isEm ? 0.5 : 0.92);
        vi++;
      }

      if (ao[0] + ao[2] > ao[1] + ao[3]) {
        indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
      } else {
        indices.push(base + 1, base + 3, base + 2, base + 1, base, base + 3);
      }
    }
  }

  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      if (positions[i + a] < min[a]) min[a] = positions[i + a];
      if (positions[i + a] > max[a]) max[a] = positions[i + a];
    }
  }
  if (!positions.length) {
    min = [0, 0, 0];
    max = [0, 0, 0];
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    roughness: new Float32Array(roughness),
    bounds: { min, max },
  };
}

export function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
