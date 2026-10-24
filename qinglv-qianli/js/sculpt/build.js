/* 装配 + 沿 X 分块网格化
 *
 * 长卷必须分块：1880 格长的世界里，任何时刻只有约六分之一在视锥内。
 * 每块单独算包围球交给 three 剔除，看不见的五公里就不进 draw call。
 */
import { buildScene } from "./scene.js";
import { buildGeometrySet } from "../voxel/mesh.js";
import { buildBlockGeometry } from "../voxel/blocks.js";
import { KIND, GLOSSY, FALL, SPRAY, MIST, LAMP, LAMP_CORE, WINDOW } from "../palette.js";
import { WORLD } from "./score.js";

export const VIEW_CENTER = [0, 0, 0];
export const Y_MIN = -8;
export const Y_SPAN = 340;
export const CHUNK = 128;          // 每块 128 格宽 ≈ 画心 81 cm

function mergeGeoms(parts) {
  const keep = parts.filter((p) => p && p.stats && p.stats.faces > 0);
  if (!keep.length) return null;
  let v = 0, i = 0;
  for (const p of keep) { v += p.position.length / 3; i += p.index.length; }
  const out = {
    position: new Float32Array(v * 3),
    normal: new Int8Array(v * 3),
    color: new Uint8Array(v * 3),
    dye: new Uint8Array(v * 2),
    index: new Uint32Array(i),
    stats: { vertices: v, faces: i / 6, tris: i / 3 },   // faces = 四边形面，tris = 三角形
  };
  let vo = 0, io = 0;
  for (const p of keep) {
    const n = p.position.length / 3;
    out.position.set(p.position, vo * 3);
    out.normal.set(p.normal, vo * 3);
    out.color.set(p.color, vo * 3);
    out.dye.set(p.dye, vo * 2);
    for (let k = 0; k < p.index.length; k++) out.index[io + k] = p.index[k] + vo;
    vo += n; io += p.index.length;
  }
  return out;
}

const isGlossy = (m) => GLOSSY.has(m);
const isMatte = (m) => !GLOSSY.has(m);
const isOne = (id) => (m) => m === id;

/** 细格场一次遍历要分路输出的组（顺序即优先级，首个命中生效）。 */
const FINE_GROUPS = [
  { kind: KIND.SOLID, matFilter: isMatte },
  { kind: KIND.SOLID, matFilter: isGlossy },
  { kind: KIND.EMIT, matFilter: isOne(LAMP) },
  { kind: KIND.EMIT, matFilter: isOne(WINDOW) },
  { kind: KIND.EMIT, matFilter: isOne(LAMP_CORE) },
  { kind: KIND.ALPHA, matFilter: isOne(FALL) },
  { kind: KIND.ALPHA, matFilter: isOne(SPRAY) },
  { kind: KIND.ALPHA, matFilter: isOne(MIST) },
];

/** 细格 ↔ 粗格互为遮挡判定。少这一对，面数会翻三倍。 */
export function makeOccluders(s) {
  const c = s.core.cell;
  return {
    core: (x, y, z) => s.core.has(Math.floor(x / c), Math.floor(y / c), Math.floor(z / c)),
    fine: (x, y, z) => s.grid.has(x, y, z),
  };
}

export function buildMeshes(opts = {}) {
  const s = buildScene(opts);
  const common = { center: VIEW_CENTER, yMin: Y_MIN, ySpan: Y_SPAN };
  const oc = makeOccluders(s);

  const chunks = [];
  const total = { faces: 0, vertices: 0 };
  const byKind = { matte: 0, gloss: 0, emit: 0, emitSoft: 0, emitCore: 0, cloud: 0, fall: 0, spray: 0, mist: 0, far: 0, wheel: 0 };

  for (let x0 = WORLD.x0; x0 <= WORLD.x1; x0 += CHUNK) {
    const x1 = Math.min(x0 + CHUNK - 1, WORLD.x1);
    const first = x0 === WORLD.x0, last = x1 === WORLD.x1;
    const blk = (f, kind, extra) => (f && (f.size ?? f.count)
      ? buildBlockGeometry(f, { ...common, kind, x0, x1, first, last, ...extra })
      : null);

    /* 一次遍历出 8 组：以前每个分段都要把整张 chunk Map 和 193 万体素重走 11 遍。 */
    const fine = buildGeometrySet(s.grid, FINE_GROUPS, { ...common, x0, x1, occlude: oc.core });
    const fineWheel = s.wheel.count
      ? buildGeometrySet(s.wheel, [{ kind: KIND.SOLID }], { ...common, x0, x1 })[0]
      : null;

    /* 云是散射体不是兰伯特面：侧壁法线上抬（softUp），否则掠射角下
       云台边缘的明暗交替会读成一片斜纹。底面永不入画，剔掉。 */
    const mistBlk = blk(s.cloud, KIND.ALPHA, { softUp: 0.5 });
    /* 瀑布与飞沫各自独立，便于分别控制透明度和亮度。
       远峰山脚的蛤白雾带也走 mist：它属于空气层，不该有远峰那样的实体明暗。 */
    const farMist = blk(s.far, KIND.ALPHA, { softUp: 0.5 });
    const parts = {
      matte: mergeGeoms([fine[0], blk(s.core, KIND.SOLID, { skipBottom: true, occlude: oc.fine })]),
      gloss: mergeGeoms([fine[1]]),
      emit: mergeGeoms([fine[2]]),
      emitSoft: mergeGeoms([fine[3]]),
      emitCore: mergeGeoms([fine[4]]),
      fall: mergeGeoms([fine[5]]),
      spray: mergeGeoms([fine[6]]),
      mist: mergeGeoms([fine[7], mistBlk, farMist]),
      /* 云是散射体不是兰伯特面：侧壁法线上抬（softUp），否则掠射角下
         云台边缘的明暗交替会读成一片斜纹。底面永不入画，剔掉。 */
      cloud: mergeGeoms([blk(s.cloud, KIND.SOLID, { skipBottom: true, softUp: 0.5 })]),
      /* flatColor：远峰不许有逐格明暗。8 格的块在 800 格外还是 20 px 见方，
         2% 的逐格抖动会被眼睛读成"整片马赛克"，远山就变成了楼群。 */
      far: mergeGeoms([blk(s.far, KIND.SOLID, { skipBottom: true, softUp: 0.35, flatColor: true })]),
      wheel: mergeGeoms([fineWheel]),
    };
    let faces = 0;
    for (const k of Object.keys(parts)) {
      if (!parts[k]) continue;
      faces += parts[k].stats.faces;
      byKind[k] += parts[k].stats.faces;
    }
    if (!faces) continue;
    total.faces += faces;
    chunks.push({ x0, x1, parts, faces });
  }

  return {
    ...s,
    chunks,
    lamps: s.ctx?.lamps ?? [],
    stats: {
      voxels: s.grid.count,
      coreBlocks: s.core.size,
      farBlocks: s.far.size,
      wheelBlocks: s.wheel.count,
      wheelFaces: byKind.wheel,
      sprayFaces: byKind.spray,
      faces: total.faces,
      triangles: total.faces * 2,
      chunks: chunks.length,
      byKind,
    },
    timings: s.timings,
  };
}
