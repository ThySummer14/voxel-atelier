// 贪心合并网格器：体素占用网格 → 按零件分组的三角网格，光照烘焙进顶点色。
// 与 tools/raster.mjs 共用 js/lighting.js，保证「离线预览 == 浏览器渲染」。
//
// sources: [{ v: Vox, sx, sy, sz }] —— 允许多个网格（主网格 + 游丝呼吸态小块），
//   零件 id 全局唯一；输出顶点已换算到世界坐标并减去所属零件枢轴（便于整件旋转）。

import { PALETTE, PAL_SPEC, PAL_EMIS, EMPTY } from '../palette.js';
import { shadePixel, nightRgb } from '../lighting.js';

const MAXRECT = 12;          // 合并上限，保住接触阴影的局部细节
const UAXIS = [1, 0, 0];     // axis=0(X): u=Y, v=Z
const VAXIS = [2, 2, 1];
const CROSS = [1, -1, 1];    // e_u × e_v 相对 e_axis 的符号

const C_U = [0, 1, 1, 0];
const C_V = [0, 0, 1, 1];
const C_DU = [-1, 1, 1, -1];
const C_DV = [-1, -1, 1, 1];

const lp = new Float64Array(12);   // 四角局部格坐标
const cNor = new Float32Array(12);
const cCol = new Float32Array(12);
const cNight = new Float32Array(12);
const cSpec = new Float32Array(12);
const rgb01 = [0, 0, 0], tA = [0, 0, 0], tB = [0, 0, 0];
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ORDER_A = [0, 1, 2, 0, 2, 3];
const ORDER_B = [0, 2, 1, 0, 3, 2];

function runSource(v, ox, oy, oz, parts, out, stats) {
  const dims = [v.GX, v.GY, v.GZ];
  const stride = [v.GY, 1, v.GX * v.GY];
  const cell = v.cell, part = v.part;

  for (let axis = 0; axis < 3; axis++) {
    const ia = axis, iu = UAXIS[axis], iv = VAXIS[axis];
    const da = stride[ia], du = stride[iu], dv = stride[iv];
    const nu = dims[iu], nv = dims[iv], nd = dims[ia];
    const mask = new Int32Array(nu * nv);
    const sign = new Int8Array(nu * nv);

    const solid = (ax, au, av) => {
      if (ax < 0 || ax >= nd || au < 0 || au >= nu || av < 0 || av >= nv) return 0;
      return cell[ax * da + au * du + av * dv] === EMPTY ? 0 : 1;
    };

    const emit = (plane, iu0, iv0, su, sv, pal, sg, pid) => {
      const g = out[pid];
      const pv = parts[pid].pivot;
      const surf = plane + 1;
      const outer = sg > 0 ? plane + 1 : plane - 1;
      const col = PALETTE[pal];
      rgb01[0] = col[0] / 255; rgb01[1] = col[1] / 255; rgb01[2] = col[2] / 255;
      const spec = PAL_SPEC[pal], emis = PAL_EMIS[pal];
      for (let c = 0; c < 4; c++) {
        const o3 = c * 3;
        const uc = iu0 + (C_U[c] ? su : 0);
        const vc = iv0 + (C_V[c] ? sv : 0);
        const au = iu0 + (C_U[c] ? su - 1 : 0);
        const av = iv0 + (C_V[c] ? sv - 1 : 0);
        const s1 = solid(outer, au + C_DU[c], av);
        const s2 = solid(outer, au, av + C_DV[c]);
        const sc = solid(outer, au + C_DU[c], av + C_DV[c]);
        const lvl = Math.min(3, (s1 && s2) ? 3 : s1 + s2 + sc);
        lp[o3] = 0; lp[o3 + 1] = 0; lp[o3 + 2] = 0;
        lp[o3 + ia] = surf; lp[o3 + iu] = uc; lp[o3 + iv] = vc;
        cNor[o3] = 0; cNor[o3 + 1] = 0; cNor[o3 + 2] = 0; cNor[o3 + axis] = sg;
        shadePixel(rgb01, cNor.subarray(o3, o3 + 3), lvl, spec, emis, tA);
        nightRgb(rgb01, emis, lvl, tB);
        cCol[o3] = tA[0]; cCol[o3 + 1] = tA[1]; cCol[o3 + 2] = tA[2];
        cNight[o3] = tB[0]; cNight[o3 + 1] = tB[1]; cNight[o3 + 2] = tB[2];
        cSpec[o3] = spec; cSpec[o3 + 1] = 0; cSpec[o3 + 2] = emis;
      }
      const dx = ox - pv[0], dy = oy - pv[1], dz = oz - pv[2];
      const order = CROSS[axis] * sg > 0 ? ORDER_A : ORDER_B;
      const P = g.pos, N = g.nor, Co = g.col, Kn = g.night, Sp = g.spc, IX = g.idx;
      const v0 = g.verts;
      for (let c = 0; c < 4; c++) {
        const c3 = c * 3;
        P.push(lp[c3] + dx, lp[c3 + 1] + dy, lp[c3 + 2] + dz);
        N.push(cNor[c3], cNor[c3 + 1], cNor[c3 + 2]);
        Co.push(cCol[c3], cCol[c3 + 1], cCol[c3 + 2]);
        Kn.push(cNight[c3], cNight[c3 + 1], cNight[c3 + 2]);
        Sp.push(cSpec[c3], cSpec[c3 + 1], cSpec[c3 + 2]);
      }
      g.verts += 4;
      for (let t = 0; t < 6; t++) IX.push(v0 + order[t]);
    };

    for (let s = 0; s < nd; s++) {
      mask.fill(0);
      const base = s * da;
      const last = s === nd - 1;
      let k = 0;
      for (let j = 0; j < nv; j++) {
        const jb = base + j * dv;
        for (let i = 0; i < nu; i++, k++) {
          const pa = jb + i * du;
          const qa = cell[pa];
          if (qa !== EMPTY) {
            if (last || cell[pa + da] === EMPTY) {
              mask[k] = (part[pa] << 8) | qa; sign[k] = 1; stats.faceCells++;
            }
          } else if (!last) {
            const pb = cell[pa + da];
            if (pb !== EMPTY) {
              mask[k] = (part[pa + da] << 8) | pb; sign[k] = -1; stats.faceCells++;
            }
          }
        }
      }
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu;) {
          const m = mask[j * nu + i];
          if (m === 0) { i++; continue; }
          const sg = sign[j * nu + i];
          let su = 1;
          while (i + su < nu && su < MAXRECT && mask[j * nu + i + su] === m && sign[j * nu + i + su] === sg) su++;
          let sv = 1;
          outer: while (j + sv < nv && sv < MAXRECT) {
            for (let q = 0; q < su; q++) {
              const t = (j + sv) * nu + i + q;
              if (mask[t] !== m || sign[t] !== sg) break outer;
            }
            sv++;
          }
          emit(s, i, j, su, sv, m & 0xff, sg, m >> 8);
          for (let hh = 0; hh < sv; hh++) for (let ww = 0; ww < su; ww++) mask[(j + hh) * nu + i + ww] = 0;
          stats.quads += su * sv;
          i += su;
        }
      }
    }
  }
}

export function buildMeshes(sources, parts) {
  const out = parts.map(() => ({ pos: [], nor: [], col: [], night: [], spc: [], idx: [], verts: 0, quads: 0 }));
  const stats = { faceCells: 0, quads: 0, rects: 0 };
  for (const src of sources) runSource(src.v, src.sx | 0, src.sy | 0, src.sz | 0, parts, out, stats);

  const groups = [];
  for (let i = 0; i < parts.length; i++) {
    const g = out[i];
    if (!g.verts) continue;
    const nv = g.verts;
    const pos = new Int16Array(nv * 3);
    const nor = new Int8Array(nv * 3);
    const col = new Uint8Array(nv * 3);
    const night = new Uint8Array(nv * 3);
    const spc = new Uint8Array(nv * 3);
    for (let k = 0; k < nv * 3; k++) {
      pos[k] = g.pos[k];
      nor[k] = g.nor[k] * 127;
      col[k] = Math.round(clamp01(g.col[k]) * 255);
      night[k] = Math.round(clamp01(g.night[k]) * 255);
      spc[k] = Math.round(clamp01(g.spc[k]) * 255);
    }
    const idx = nv > 65535 ? new Uint32Array(g.idx) : new Uint16Array(g.idx);
    groups.push({
      name: parts[i].name, id: i, key: parts[i].key, pivot: parts[i].pivot,
      positions: pos, normals: nor, colors: col, nights: night, specs: spc, indices: idx,
      vertices: nv, quads: g.verts / 4, triangles: g.idx.length / 3,
    });
  }
  return { groups, stats };
}
