/* 场景装配 + 三组网格（solid / alpha / emit）合并，浏览器与离线预览共用 */
import { buildScene } from "./scene.js";
import { buildGeometry } from "../voxel/mesh.js";
import { buildBlockGeometry } from "../voxel/blocks.js";
import { KIND, GLOSSY } from "../palette.js";

export const VIEW_CENTER = [0, 168, 0];
export const Y_MIN = -80;
export const Y_SPAN = 470;

function mergeGeoms(parts) {
  const keep = parts.filter((p) => p && p.stats.faces > 0);
  let v = 0, i = 0;
  for (const p of keep) { v += p.position.length / 3; i += p.index.length; }
  const out = {
    position: new Float32Array(v * 3),
    normal: new Int8Array(v * 3),
    color: new Uint8Array(v * 3),
    gloss: new Uint8Array(v),
    reveal: new Uint8Array(v * 2),
    index: new Uint32Array(i),
    stats: { vertices: v, faces: i / 3 },
  };
  let vo = 0, io = 0;
  for (const p of keep) {
    const n = p.position.length / 3;
    out.position.set(p.position, vo * 3);
    out.normal.set(p.normal, vo * 3);
    out.color.set(p.color, vo * 3);
    out.gloss.set(p.gloss, vo);
    out.reveal.set(p.reveal, vo * 2);
    for (let k = 0; k < p.index.length; k++) out.index[io + k] = p.index[k] + vo;
    vo += n; io += p.index.length;
  }
  return out;
}

export function buildMeshes(opts = {}) {
  const s = buildScene(opts);
  const common = { center: VIEW_CENTER, yMin: Y_MIN, ySpan: Y_SPAN };
  const fine = (kind, matFilter) => buildGeometry(s.grid, { ...common, kind, matFilter });
  const block = (f, kind, matFilter, extra) =>
    f ? buildBlockGeometry(f, { ...common, kind, matFilter, ...extra }) : null;

  const isGlossy = (m) => GLOSSY.has(m);
  const not = (f) => (m) => !f(m);
  s.matte = mergeGeoms([fine(KIND.SOLID, not(isGlossy))]);
  s.gloss = mergeGeoms([fine(KIND.SOLID, isGlossy)]);
  s.far = mergeGeoms([
    block(s.cloudField, KIND.SOLID, null, { skipBottom: true, softUp: 0.55 }),
  ]);
  s.emit = mergeGeoms([fine(KIND.EMIT)]);
  s.mist = mergeGeoms([fine(KIND.ALPHA), block(s.cloudField, KIND.ALPHA)]);
  return s;
}
