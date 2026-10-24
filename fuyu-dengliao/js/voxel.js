/**
 * 体素世界：调色板、写入、面剔除网格 + 顶点 AO
 */

export const MAT = {
  GRASS: 0,
  GRASS_DARK: 1,
  DIRT: 2,
  DIRT_DARK: 3,
  STONE: 4,
  STONE_DARK: 5,
  STONE_LIGHT: 6,
  WOOD: 7,
  WOOD_DARK: 8,
  WOOD_LIGHT: 9,
  ROOF: 10,
  ROOF_DARK: 11,
  WALL: 12,
  WALL_SHADE: 13,
  WINDOW: 14,
  LANTERN: 15,
  LANTERN_CORE: 16,
  WATER: 17,
  FOAM: 18,
  LEAF: 19,
  LEAF_LIGHT: 20,
  LEAF_DARK: 21,
  TRUNK: 22,
  MOSS: 23,
  PATH: 24,
  CLOUD: 25,
  PLANK: 26,
  PAPER: 27,
  COPPER: 28,
  SNOW_FOAM: 29,
};

export const COLORS = [
  0x6ecf7a, // grass 亮绿
  0x3f9a55, // grass dark
  0x7a5230, // dirt
  0x543822, // dirt dark
  0x7a8088, // stone
  0x4a525c, // stone dark
  0x9aa2aa, // stone light
  0xa87040, // wood 暖木
  0x6e4828, // wood dark
  0xc49a6a, // wood light
  0x5a6878, // roof 石板青
  0x3a4654, // roof dark
  0xe8d8c0, // wall 暖纸白
  0xc8b498, // wall shade
  0xffb040, // window glow 更琥珀
  0xff8020, // lantern
  0xffcc66, // lantern core
  0x40b8d8, // water
  0xb8ecf8, // foam
  0xf08840, // leaf 秋橙
  0xffb060, // leaf light
  0xd06028, // leaf dark
  0x7a4a28, // trunk
  0x50a860, // moss
  0xd4c090, // path
  0xa8c8e0, // cloud
  0xb88858, // plank
  0xf0e6d0, // paper
  0xd08840, // copper
  0xe8f8ff, // snow foam
];

export const EMISSIVE = new Set([
  MAT.WINDOW,
  MAT.LANTERN,
  MAT.LANTERN_CORE,
]);

export const WATERISH = new Set([MAT.WATER, MAT.FOAM]);

const key = (x, y, z) => `${x},${y},${z}`;

export class Voxels {
  constructor() {
    this.map = new Map();
  }

  set(x, y, z, mat) {
    if (mat === undefined || mat === null) return;
    this.map.set(key(x, y, z), mat | 0);
  }

  get(x, y, z) {
    return this.map.get(key(x, y, z));
  }

  has(x, y, z) {
    return this.map.has(key(x, y, z));
  }

  delete(x, y, z) {
    this.map.delete(key(x, y, z));
  }

  fillBox(x0, y0, z0, x1, y1, z1, mat) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) this.set(x, y, z, mat);
  }

  hollowBox(x0, y0, z0, x1, y1, z1, mat, keepBottom = true) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          const shell =
            x === x0 ||
            x === x1 ||
            y === y0 ||
            y === y1 ||
            z === z0 ||
            z === z1;
          if (!shell) continue;
          if (!keepBottom && y === y0) continue;
          this.set(x, y, z, mat);
        }
  }

  *entries() {
    yield* this.map.entries();
  }

  get size() {
    return this.map.size;
  }
}

// 六个面：法线、四角位置、以及用于 AO 的三个邻接采样偏移
// 角点顺序：CCW 从外面看
const FACES = [
  {
    // +Y top
    n: [0, 1, 0],
    shade: 1.0,
    corners: [
      {
        p: [0, 1, 0],
        s1: [-1, 1, 0],
        s2: [0, 1, -1],
        c: [-1, 1, -1],
      },
      {
        p: [1, 1, 0],
        s1: [1, 1, 0],
        s2: [0, 1, -1],
        c: [1, 1, -1],
      },
      {
        p: [1, 1, 1],
        s1: [1, 1, 0],
        s2: [0, 1, 1],
        c: [1, 1, 1],
      },
      {
        p: [0, 1, 1],
        s1: [-1, 1, 0],
        s2: [0, 1, 1],
        c: [-1, 1, 1],
      },
    ],
  },
  {
    // -Y bottom
    n: [0, -1, 0],
    shade: 0.45,
    corners: [
      {
        p: [0, 0, 1],
        s1: [-1, -1, 0],
        s2: [0, -1, 1],
        c: [-1, -1, 1],
      },
      {
        p: [1, 0, 1],
        s1: [1, -1, 0],
        s2: [0, -1, 1],
        c: [1, -1, 1],
      },
      {
        p: [1, 0, 0],
        s1: [1, -1, 0],
        s2: [0, -1, -1],
        c: [1, -1, -1],
      },
      {
        p: [0, 0, 0],
        s1: [-1, -1, 0],
        s2: [0, -1, -1],
        c: [-1, -1, -1],
      },
    ],
  },
  {
    // +X right
    n: [1, 0, 0],
    shade: 0.78,
    corners: [
      {
        p: [1, 0, 1],
        s1: [1, -1, 0],
        s2: [1, 0, 1],
        c: [1, -1, 1],
      },
      {
        p: [1, 0, 0],
        s1: [1, -1, 0],
        s2: [1, 0, -1],
        c: [1, -1, -1],
      },
      {
        p: [1, 1, 0],
        s1: [1, 1, 0],
        s2: [1, 0, -1],
        c: [1, 1, -1],
      },
      {
        p: [1, 1, 1],
        s1: [1, 1, 0],
        s2: [1, 0, 1],
        c: [1, 1, 1],
      },
    ],
  },
  {
    // -X left
    n: [-1, 0, 0],
    shade: 0.62,
    corners: [
      {
        p: [0, 0, 0],
        s1: [-1, -1, 0],
        s2: [-1, 0, -1],
        c: [-1, -1, -1],
      },
      {
        p: [0, 0, 1],
        s1: [-1, -1, 0],
        s2: [-1, 0, 1],
        c: [-1, -1, 1],
      },
      {
        p: [0, 1, 1],
        s1: [-1, 1, 0],
        s2: [-1, 0, 1],
        c: [-1, 1, 1],
      },
      {
        p: [0, 1, 0],
        s1: [-1, 1, 0],
        s2: [-1, 0, -1],
        c: [-1, 1, -1],
      },
    ],
  },
  {
    // +Z back
    n: [0, 0, 1],
    shade: 0.88,
    corners: [
      {
        p: [1, 0, 1],
        s1: [1, 0, 1],
        s2: [0, -1, 1],
        c: [1, -1, 1],
      },
      {
        p: [0, 0, 1],
        s1: [-1, 0, 1],
        s2: [0, -1, 1],
        c: [-1, -1, 1],
      },
      {
        p: [0, 1, 1],
        s1: [-1, 0, 1],
        s2: [0, 1, 1],
        c: [-1, 1, 1],
      },
      {
        p: [1, 1, 1],
        s1: [1, 0, 1],
        s2: [0, 1, 1],
        c: [1, 1, 1],
      },
    ],
  },
  {
    // -Z front
    n: [0, 0, -1],
    shade: 0.7,
    corners: [
      {
        p: [0, 0, 0],
        s1: [-1, 0, -1],
        s2: [0, -1, -1],
        c: [-1, -1, -1],
      },
      {
        p: [1, 0, 0],
        s1: [1, 0, -1],
        s2: [0, -1, -1],
        c: [1, -1, -1],
      },
      {
        p: [1, 1, 0],
        s1: [1, 0, -1],
        s2: [0, 1, -1],
        c: [1, 1, -1],
      },
      {
        p: [0, 1, 0],
        s1: [-1, 0, -1],
        s2: [0, 1, -1],
        c: [-1, 1, -1],
      },
    ],
  },
];

function aoLevel(s1, s2, c) {
  if (s1 && s2) return 0;
  return 3 - (s1 + s2 + c);
}

const AO_CURVE = [0.42, 0.62, 0.82, 1.0];

function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * 将体素场烘焙成 BufferGeometry（顶点色 + AO + 面向明暗）
 * @param {Voxels} voxels
 * @param {object} opts
 *   - group: 'solid' | 'emissive' | 'water'
 *   - scale: 世界单位
 *   - origin: [x,y,z] 平移
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
    const [x, y, z] = k.split(",").map(Number);
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
        // 水面不挡实体；同材质水互相挡；发光块之间互相挡
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
        const s1 = voxels.has(x + corner.s1[0], y + corner.s1[1], z + corner.s1[2])
          ? 1
          : 0;
        const s2 = voxels.has(x + corner.s2[0], y + corner.s2[1], z + corner.s2[2])
          ? 1
          : 0;
        const cc = voxels.has(x + corner.c[0], y + corner.c[1], z + corner.c[2])
          ? 1
          : 0;
        // 相邻方块自身遮挡已由 face 邻接处理；AO 看对角
        const level = aoLevel(s1, s2, cc);
        ao.push(level);

        const px = (x + corner.p[0] + origin[0]) * scale;
        const py = (y + corner.p[1] + origin[1]) * scale;
        const pz = (z + corner.p[2] + origin[2]) * scale;
        positions.push(px, py, pz);
        normals.push(face.n[0], face.n[1], face.n[2]);

        const aoMul = isEm ? 1 : AO_CURVE[level];
        const shade = isEm ? 1 : faceShade * aoMul;
        // 微调：顶面再亮一点，营造舞台顶光
        const topBoost = face.n[1] === 1 ? 1.05 : 1;
        writeColor(colors, hex, shade * topBoost, jitter);
        roughness.push(isEm ? 0.55 : 0.92);
        vi++;
      }

      // 双三角；绕序需与外向法线一致（CCW 朝外），否则被背面剔除
      if (ao[0] + ao[2] > ao[1] + ao[3]) {
        indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
      } else {
        indices.push(base + 1, base + 3, base + 2, base + 1, base, base + 3);
      }
    }
  }

  // 顺手返回包围盒
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      if (positions[i + a] < min[a]) min[a] = positions[i + a];
      if (positions[i + a] > max[a]) max[a] = positions[i + a];
    }
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
