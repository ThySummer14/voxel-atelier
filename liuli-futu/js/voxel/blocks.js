/* 粗粒度方块场：云海与远山用 4~6 格大立方体表达，避免体素数爆炸 */
import { KIND, MATERIALS, shadeOf } from "../palette.js";
import { hash3 } from "./core.js";

const FACES = [
  { n: [1, 0, 0], d: 2 }, { n: [-1, 0, 0], d: 3 },
  { n: [0, 1, 0], d: 0 }, { n: [0, -1, 0], d: 1 },
  { n: [0, 0, 1], d: 4 }, { n: [0, 0, -1], d: 5 },
];
const CORNERS = [
  [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
  [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
  [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
  [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
  [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]],
  [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
];
/* 与 fine mesher 相同的自动定向 */
const FACE_CORNERS_RAW = [
  [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]],   // +Y
  [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]],   // -Y
  [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],   // +X
  [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],   // -X
  [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]],   // +Z
  [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],   // -Z
];
const FACE_CORNERS = FACE_CORNERS_RAW.map((cs, i) => {
  const n = FACES[i].n;
  const e1 = [cs[1][0] - cs[0][0], cs[1][1] - cs[0][1], cs[1][2] - cs[0][2]];
  const e2 = [cs[2][0] - cs[0][0], cs[2][1] - cs[0][1], cs[2][2] - cs[0][2]];
  const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  const d = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2];
  return d < 0 ? cs.slice().reverse() : cs;
});

const key = (x, y, z) => (x + 2048) * 16777216 + (y + 2048) * 4096 + (z + 2048);

export class BlockField {
  constructor(cell = 4) {
    this.cell = cell;
    this.map = new Map();
  }
  set(ix, iy, iz, m) { this.map.set(key(ix, iy, iz), m); }
  get(ix, iy, iz) { return this.map.get(key(ix, iy, iz)); }
  has(ix, iy, iz) { return this.map.has(key(ix, iy, iz)); }
  get size() { return this.map.size; }
}

/** 把 BlockField 网格化（cell 大小倍率的立方体） */
export function buildBlockGeometry(field, o = {}) {
  const cell = field.cell;
  const kind = o.kind ?? KIND.SOLID;
  const cx = o.center?.[0] ?? 0, cy = o.center?.[1] ?? 0, cz = o.center?.[2] ?? 0;
  const yMin = o.yMin ?? -1e9;
  const ySpan = o.ySpan ?? 400;
  const matFilter = o.matFilter ?? null;

  const pos = [], nrm = [], col = [], glo = [], rev = [], idx = [];
  let vi = 0, faces = 0;

  for (const [k, m] of field.map) {
    const iz = (k % 4096) - 2048;
    const iy = (Math.floor(k / 4096) % 4096) - 2048;
    const ix = Math.floor(k / 16777216) - 2048;
    const M = MATERIALS[m];
    if (!M || M.kind !== kind) continue;
    if (matFilter && !matFilter(m)) continue;
    const wx = ix * cell, wy = iy * cell, wz = iz * cell;
    if (wy < yMin) continue;
    const rgb = shadeOf(m, wx, wy, wz, 0);
    const jitter = o.flatColor ? 1 : 0.98 + hash3(ix, iy, iz) * 0.04;
    const revT = Math.max(0, Math.min(255, ((wy - yMin) / ySpan) * 255)) | 0;
    const revR = (hash3(ix * 3 + 1, iy * 7 + 3, iz * 5 + 9) * 255) | 0;

    for (let fi = 0; fi < 6; fi++) {
      const F = FACES[fi];
      if (o.skipBottom && F.d === 1) continue;      // 云床底面：镜头恒在云面之上，永不入画
      if (field.has(ix + F.n[0], iy + F.n[1], iz + F.n[2])) continue;
      /* 云是散射体，不是不透明兰伯特面：把侧壁法线往上混，
         云台边缘的明暗交替（掠射角下读成斜纹）随之消失。 */
      let nx = F.n[0], ny = F.n[1], nz = F.n[2];
      if (o.softUp && F.d >= 2) {
        const s = o.softUp;
        nx *= 1 - s; ny = ny * (1 - s) + s; nz *= 1 - s;
        const inv = 1 / Math.hypot(nx, ny, nz);
        nx *= inv; ny *= inv; nz *= inv;
      }
      const start = vi;
      for (let ci = 0; ci < 4; ci++) {
        const c = FACE_CORNERS[fi][ci];
        pos.push(
          (wx + c[0] * cell - cx), (wy + c[1] * cell - cy), (wz + c[2] * cell - cz)
        );
        nrm.push(nx * 127, ny * 127, nz * 127);
        const k2 = jitter * (F.d === 0 ? (o.softUp ? 1.02 : 1.08) : 1);
        col.push(
          Math.min(255, rgb[0] * k2 * 255) | 0,
          Math.min(255, rgb[1] * k2 * 255) | 0,
          Math.min(255, rgb[2] * k2 * 255) | 0
        );
        glo.push((M.gloss * 255) | 0);
        rev.push(revT, revR);
        vi++;
      }
      idx.push(start, start + 1, start + 2, start, start + 2, start + 3);
      faces++;
    }
  }
  return {
    position: new Float32Array(pos),
    normal: new Int8Array(nrm),
    color: new Uint8Array(col),
    gloss: new Uint8Array(glo),
    reveal: new Uint8Array(rev),
    index: new Uint32Array(idx),
    stats: { vertices: vi, faces },
  };
}
