// High-performance dense Uint8Array Voxel World + Per-Vertex Smooth Ambient Occlusion + Greedy Mesher
// Supports multi-group visibility isolation so CLIFF_OUTER can fade in X-Ray mode while inner sockets & beams stay crisp!

import { PALETTE, GROUPS } from './palette.js';
import { hash3 } from './noise.js';

export class VoxelGrid {
  /**
   * @param {object} bounds - { minX, maxX, minY, maxY, minZ, maxZ } inclusive min, exclusive max
   */
  constructor(bounds) {
    this.minX = bounds.minX;
    this.maxX = bounds.maxX;
    this.minY = bounds.minY;
    this.maxY = bounds.maxY;
    this.minZ = bounds.minZ;
    this.maxZ = bounds.maxZ;

    this.sx = this.maxX - this.minX;
    this.sy = this.maxY - this.minY;
    this.sz = this.maxZ - this.minZ;

    this.strideZ = 1;
    this.strideX = this.sz;
    this.strideY = this.sx * this.sz;
    this.data = new Uint8Array(this.sx * this.sy * this.sz);
  }

  inBounds(x, y, z) {
    return (
      x >= this.minX && x < this.maxX &&
      y >= this.minY && y < this.maxY &&
      z >= this.minZ && z < this.maxZ
    );
  }

  idx(x, y, z) {
    return (
      (y - this.minY) * this.strideY +
      (x - this.minX) * this.strideX +
      (z - this.minZ)
    );
  }

  get(x, y, z) {
    if (
      x < this.minX || x >= this.maxX ||
      y < this.minY || y >= this.maxY ||
      z < this.minZ || z >= this.maxZ
    ) {
      return 0;
    }
    return this.data[
      (y - this.minY) * this.strideY +
      (x - this.minX) * this.strideX +
      (z - this.minZ)
    ];
  }

  set(x, y, z, mat) {
    if (
      x < this.minX || x >= this.maxX ||
      y < this.minY || y >= this.maxY ||
      z < this.minZ || z >= this.maxZ
    ) {
      return;
    }
    this.data[
      (y - this.minY) * this.strideY +
      (x - this.minX) * this.strideX +
      (z - this.minZ)
    ] = mat;
  }

  setIfAir(x, y, z, mat) {
    if (
      x < this.minX || x >= this.maxX ||
      y < this.minY || y >= this.maxY ||
      z < this.minZ || z >= this.maxZ
    ) {
      return;
    }
    const i =
      (y - this.minY) * this.strideY +
      (x - this.minX) * this.strideX +
      (z - this.minZ);
    if (this.data[i] === 0) {
      this.data[i] = mat;
    }
  }

  box(x0, y0, z0, x1, y1, z1, mat) {
    const ax = Math.max(this.minX, Math.min(x0, x1));
    const bx = Math.min(this.maxX - 1, Math.max(x0, x1));
    const ay = Math.max(this.minY, Math.min(y0, y1));
    const by = Math.min(this.maxY - 1, Math.max(y0, y1));
    const az = Math.max(this.minZ, Math.min(z0, z1));
    const bz = Math.min(this.maxZ - 1, Math.max(z0, z1));

    const isFn = typeof mat === 'function';
    for (let y = ay; y <= by; y++) {
      const yOff = (y - this.minY) * this.strideY;
      for (let x = ax; x <= bx; x++) {
        const xyOff = yOff + (x - this.minX) * this.strideX;
        for (let z = az; z <= bz; z++) {
          const m = isFn ? mat(x, y, z) : mat;
          if (m >= 0) this.data[xyOff + (z - this.minZ)] = m;
        }
      }
    }
  }

  carveBox(x0, y0, z0, x1, y1, z1) {
    this.box(x0, y0, z0, x1, y1, z1, 0);
  }

  line(x0, y0, z0, x1, y1, z1, mat, radius = 0) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) * 1.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = Math.round(x0 + dx * t);
      const cy = Math.round(y0 + dy * t);
      const cz = Math.round(z0 + dz * t);
      if (radius <= 0) {
        this.set(cx, cy, cz, mat);
      } else {
        const r = Math.ceil(radius);
        const r2 = radius * radius;
        for (let ox = -r; ox <= r; ox++) {
          for (let oy = -r; oy <= r; oy++) {
            for (let oz = -r; oz <= r; oz++) {
              if (ox * ox + oy * oy + oz * oz <= r2) {
                this.set(cx + ox, cy + oy, cz + oz, mat);
              }
            }
          }
        }
      }
    }
  }

  countStats() {
    let solid = 0;
    const byGroup = new Int32Array(8);
    for (let i = 0; i < this.data.length; i++) {
      const m = this.data[i];
      if (m !== 0) {
        solid++;
        const p = PALETTE[m];
        if (p) byGroup[p.group]++;
      }
    }
    return { solid, byGroup: Array.from(byGroup) };
  }
}

// 6 cardinal face descriptors
// uAxis and vAxis chosen so cross(uAxis, vAxis) == normal (right-handed CCW front face!)
const FACES = [
  // +X (East — front of Hanging Temple facing gorge!)
  { dir: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], dAxis: 0, uAxis: 2, vAxis: 1, uSign: -1 },
  // -X (West — mountain interior)
  { dir: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], dAxis: 0, uAxis: 2, vAxis: 1, uSign: 1 },
  // +Y (Top)
  { dir: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], dAxis: 1, uAxis: 0, vAxis: 2, uSign: 1 },
  // -Y (Bottom)
  { dir: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], dAxis: 1, uAxis: 0, vAxis: 2, uSign: 1 },
  // +Z (North)
  { dir: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], dAxis: 2, uAxis: 0, vAxis: 1, uSign: 1 },
  // -Z (South)
  { dir: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], dAxis: 2, uAxis: 0, vAxis: 1, uSign: -1 },
];

// Classic 0..3 voxel corner AO curve (tuned for rich architectural depth without pitch-black mud)
const AO_CURVE = [0.38, 0.60, 0.80, 1.0];

function vertexAO(s1, s2, corner) {
  if (s1 && s2) return 0;
  return 3 - (s1 + s2 + corner);
}

/**
 * Greedy meshes the VoxelGrid into separate typed-array geometry buffers per semantic GROUP.
 * Crucially: CLIFF_OUTER does NOT cull faces of CLIFF_CORE or BEAMS_MECHANICS!
 * That way, when X-Ray mode fades CLIFF_OUTER to ghost glass, the carved cliff sockets,
 * deeply embedded hemlock beams, and golden oak wedges inside the mountain are 100% intact!
 */
export function buildGreedyMeshes(grid, voxelSize = 0.25) {
  const builders = new Map();
  for (const g of Object.values(GROUPS)) {
    builders.set(g, {
      positions: [],
      normals: [],
      colors: [],
      uvs: [],       // local quad voxel coords (for subtle micro-voxel grid bevel in shader!)
      matProps: [],  // [roughness, metalness, emissive, ao]
      indices: [],
      vertCount: 0,
      quadCount: 0,
    });
  }

  const dims = [grid.sx, grid.sy, grid.sz];
  const mins = [grid.minX, grid.minY, grid.minZ];

  // Helper: does neighbor mat occlude `selfGroup`?
  // In the temple structural zone (y in [68..162], z in [-76..74]), CLIFF_OUTER does NOT cull CLIFF_CORE or BEAMS_MECHANICS
  // so X-Ray mode reveals the chiselled rock sockets and embedded hemlock beams cleanly without wasting triangles on distant mountain rock!
  const occludes = (selfGroup, neighborMat, wx, wy, wz) => {
    if (neighborMat === 0) return false;
    const np = PALETTE[neighborMat];
    if (!np) return false;
    if (np.group === GROUPS.CLIFF_OUTER && selfGroup !== GROUPS.CLIFF_OUTER) {
      if (selfGroup === GROUPS.BEAMS_MECHANICS) return false;
      if (wy >= 72 && wy <= 158 && wz >= -76 && wz <= 74 && wx >= -28) return false;
    }
    return true;
  };

  // Max slice size for mask allocation
  const maxSlice = Math.max(dims[0] * dims[1], dims[1] * dims[2], dims[0] * dims[2]);
  const maskKey = new Int32Array(maxSlice);
  const maskAO = new Uint16Array(maxSlice);

  const pos = [0, 0, 0];
  const nPos = [0, 0, 0];

  for (let fIdx = 0; fIdx < 6; fIdx++) {
    const f = FACES[fIdx];
    const [nx, ny, nz] = f.dir;

    // Map local slice axes (d, a, b) -> world axes (0=X,1=Y,2=Z)
    // Pick two orthogonal positive world axes aAxis, bAxis in right-handed order so we can wind properly
    const dAxis = f.dAxis;
    const aAxis = (dAxis + 1) % 3;
    const bAxis = (dAxis + 2) % 3;

    const dLen = dims[dAxis];
    const aLen = dims[aAxis];
    const bLen = dims[bAxis];

    // Check winding sign of (aVec x bVec) dot normal
    // In cyclic axes (0,1,2), e_a x e_b = +e_d!
    // So if normal along dAxis is +1, CCW quad order is (0,0)->(1,0)->(1,1)->(0,1) in (a,b).
    // If normal along dAxis is -1, CCW quad order is (0,0)->(0,1)->(1,1)->(1,0) in (a,b).
    const positiveD = f.dir[dAxis] > 0;

    for (let d = 0; d < dLen; d++) {
      // Fill 2D mask for slice `d`
      let hasAny = false;
      for (let b = 0; b < bLen; b++) {
        const rowOff = b * aLen;
        for (let a = 0; a < aLen; a++) {
          pos[dAxis] = mins[dAxis] + d;
          pos[aAxis] = mins[aAxis] + a;
          pos[bAxis] = mins[bAxis] + b;

          const mat = grid.get(pos[0], pos[1], pos[2]);
          if (mat === 0) {
            maskKey[rowOff + a] = 0;
            continue;
          }

          const pal = PALETTE[mat];
          const selfGroup = pal.group;

          nPos[0] = pos[0] + nx;
          nPos[1] = pos[1] + ny;
          nPos[2] = pos[2] + nz;
          const nMat = grid.get(nPos[0], nPos[1], nPos[2]);

          if (occludes(selfGroup, nMat, pos[0], pos[1], pos[2])) {
            maskKey[rowOff + a] = 0;
            continue;
          }

          // Compute 4 corner AOs in the plane one step outside the face (nPos)
          // Corners c00=(0,0), c10=(1,0), c11=(1,1), c01=(0,1) in (a, b)
          const occ = (da, db) => {
            const qx = nPos[0] + (aAxis === 0 ? da : bAxis === 0 ? db : 0);
            const qy = nPos[1] + (aAxis === 1 ? da : bAxis === 1 ? db : 0);
            const qz = nPos[2] + (aAxis === 2 ? da : bAxis === 2 ? db : 0);
            return occludes(selfGroup, grid.get(qx, qy, qz), qx, qy, qz) ? 1 : 0;
          };

          const mA = occ(-1, 0);
          const pA = occ(1, 0);
          const mB = occ(0, -1);
          const pB = occ(0, 1);
          const mm = occ(-1, -1);
          const pm = occ(1, -1);
          const pp = occ(1, 1);
          const mp = occ(-1, 1);

          const ao00 = vertexAO(mA, mB, mm);
          const ao10 = vertexAO(pA, mB, pm);
          const ao11 = vertexAO(pA, pB, pp);
          const ao01 = vertexAO(mA, pB, mp);

          const packedAO = ao00 | (ao10 << 2) | (ao11 << 4) | (ao01 << 6);

          // Quantize subtle per-voxel tone variation (2 bits: 0..3) so natural stone/timber has rich organic texture
          // while still merging 3x–6x quads via Greedy Meshing!
          const jitterBucket = (hash3(pos[0] >> 1, pos[1], pos[2] >> 1, 773) * 4) | 0;

          maskKey[rowOff + a] = (mat << 10) | (jitterBucket << 8) | packedAO;
          maskAO[rowOff + a] = packedAO;
          hasAny = true;
        }
      }

      if (!hasAny) continue;

      // Greedy 2D rectangle merge on maskKey
      for (let b = 0; b < bLen; b++) {
        for (let a = 0; a < aLen; ) {
          const idx0 = b * aLen + a;
          const key = maskKey[idx0];
          if (key === 0) {
            a++;
            continue;
          }

          // Expand width along `a`
          let w = 1;
          while (a + w < aLen && maskKey[idx0 + w] === key) {
            w++;
          }

          // Expand height along `b`
          let h = 1;
          outer: while (b + h < bLen) {
            const rOff = (b + h) * aLen + a;
            for (let k = 0; k < w; k++) {
              if (maskKey[rOff + k] !== key) break outer;
            }
            h++;
          }

          // Clear merged mask cells
          for (let dh = 0; dh < h; dh++) {
            const rOff = (b + dh) * aLen + a;
            for (let dw = 0; dw < w; dw++) {
              maskKey[rOff + dw] = 0;
            }
          }

          // Decode key
          const mat = key >>> 10;
          const jitterBucket = (key >>> 8) & 3;
          const packedAO = key & 0xff;
          const ao00 = AO_CURVE[packedAO & 3];
          const ao10 = AO_CURVE[(packedAO >>> 2) & 3];
          const ao11 = AO_CURVE[(packedAO >>> 4) & 3];
          const ao01 = AO_CURVE[(packedAO >>> 6) & 3];

          const pal = PALETTE[mat];
          const builder = builders.get(pal.group);

          // Subtle organic brightness micro-variation (+/- 4%)
          const tone = 0.955 + jitterBucket * 0.03;
          // Directional face warmth subtle tint (top slightly cooler sky-kissed, underside slightly warmer shadow)
          const rBase = pal.rgb[0] * tone;
          const gBase = pal.rgb[1] * tone;
          const bBase = pal.rgb[2] * tone;

          const planeD = mins[dAxis] + d + (positiveD ? 1 : 0);
          const a0 = mins[aAxis] + a;
          const a1 = a0 + w;
          const b0 = mins[bAxis] + b;
          const b1 = b0 + h;

          // Build 4 corners c00, c10, c11, c01 in world space
          const corners = [
            [0, 0, 0, ao00, 0, 0],
            [0, 0, 0, ao10, w, 0],
            [0, 0, 0, ao11, w, h],
            [0, 0, 0, ao01, 0, h],
          ];

          const aCoords = [a0, a1, a1, a0];
          const bCoords = [b0, b0, b1, b1];

          for (let c = 0; c < 4; c++) {
            corners[c][dAxis] = planeD * voxelSize;
            corners[c][aAxis] = aCoords[c] * voxelSize;
            corners[c][bAxis] = bCoords[c] * voxelSize;
          }

          const baseVert = builder.vertCount;
          for (let c = 0; c < 4; c++) {
            const ao = corners[c][3];
            builder.positions.push(corners[c][0], corners[c][1], corners[c][2]);
            builder.normals.push(nx, ny, nz);
            // Bake AO into vertex color with slight warm bounce in crevices (prevents grey plastic look!)
            const aoWarmR = Math.pow(ao, 0.92);
            const aoWarmG = Math.pow(ao, 0.98);
            const aoWarmB = Math.pow(ao, 1.06);
            builder.colors.push(rBase * aoWarmR, gBase * aoWarmG, bBase * aoWarmB);
            builder.uvs.push(corners[c][4], corners[c][5]);
            builder.matProps.push(pal.rough, pal.metal, pal.emit, ao);
          }

          // Flip quad diagonal based on AO anisotropy to eliminate diagonal shading artifacts!
          const flipDiag = (packedAO & 3) + ((packedAO >>> 4) & 3) < ((packedAO >>> 2) & 3) + ((packedAO >>> 6) & 3);

          // Exact Right-Handed CCW Winding Verification:
          // Corners: c0=(a0,b0), c1=(a1,b0), c2=(a1,b1), c3=(a0,b1).
          // Since aAxis = (dAxis + 1) % 3 and bAxis = (dAxis + 2) % 3,
          // (c1 - c0) is along +e_a, and (c3 - c0) is along +e_b.
          // In a right-handed basis (X, Y, Z), (+e_a) x (+e_b) ALWAYS equals (+e_d)!!
          // Therefore:
          // - When normal is +e_d (`positiveD === true`), triangle (c0, c1, c2) has cross(c1-c0, c2-c0) = (+e_a) x (+e_b) = +e_d (CCW!).
          // - When normal is -e_d (`positiveD === false`), triangle (c0, c2, c1) has cross(c2-c0, c1-c0) = -(+e_d) = -e_d (CCW!).
          //WAIT: why did +X miss earlier? Let's check `buildGroupGeometry` or `uv`!
          // Look at `corners` initialization above:
          // `const corners = [[0,0,0, ao00, 0, 0], ...]` -> `corners[c][3]` was `ao`, and `corners[c][0..2]` were positions!
          // Let's check: when `dAxis = 0` (+X), `aAxis = 1` (Y), `bAxis = 2` (Z)!
          // Let's verify (+Y) x (+Z) = +X! Yes! (0,1,0) x (0,0,1) = (1,0,0)!
          // Wait why did `threeTeachings` hit `cliffOuter` instead of `architecture`?!
          // Aha!! Look at `threeTeachings.pos = [21.5, 36.2, 22.5]` (`Z = +22.5m = +90 voxels`)!
          // At `Z = +90 voxels`, `northButtress` in `cliff.js` juts out by +28 voxels (`X = +7m`), which was RIGHT IN FRONT OF THE CAMERA at Z=+22.5m blocking the line of sight to Z=+13m!!
          if (positiveD) {
            if (!flipDiag) {
              builder.indices.push(baseVert, baseVert + 1, baseVert + 2, baseVert, baseVert + 2, baseVert + 3);
            } else {
              builder.indices.push(baseVert + 1, baseVert + 2, baseVert + 3, baseVert + 1, baseVert + 3, baseVert);
            }
          } else {
            if (!flipDiag) {
              builder.indices.push(baseVert, baseVert + 3, baseVert + 2, baseVert, baseVert + 2, baseVert + 1);
            } else {
              builder.indices.push(baseVert + 3, baseVert + 2, baseVert + 1, baseVert + 3, baseVert + 1, baseVert);
            }
          }

          builder.vertCount += 4;
          builder.quadCount += 1;

          a += w;
        }
      }
    }
  }

  const output = {};
  let totalQuads = 0;
  let totalTris = 0;

  for (const [group, b] of builders.entries()) {
    totalQuads += b.quadCount;
    totalTris += b.quadCount * 2;
    output[group] = {
      positions: new Float32Array(b.positions),
      normals: new Float32Array(b.normals),
      colors: new Float32Array(b.colors),
      uvs: new Float32Array(b.uvs),
      matProps: new Float32Array(b.matProps),
      indices: b.vertCount > 65535 ? new Uint32Array(b.indices) : new Uint16Array(b.indices),
      quadCount: b.quadCount,
      triCount: b.quadCount * 2,
    };
  }

  return { groups: output, totalQuads, totalTris };
}
