// 体素缓存 + 贪心合并网格化 + 光照烘焙（全部写进顶点色，无实时灯光）
// 约定：几何以「部件枢轴」为原点输出，枢轴记在 part 元数据里，浏览器与离线光栅器共用同一套变换。
import { GRID, LIGHT, SILK, WOOD } from './spec.js';

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function hexToLinear(h) {
  const n = parseInt(h.slice(1), 16);
  return [srgbToLinear((n >> 16) & 255), srgbToLinear((n >> 8) & 255), srgbToLinear(n & 255)];
}
export function linearToSrgbByte(x) {
  const c = x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

export const PAL = (() => {
  const names = [];
  for (const k of Object.keys(SILK)) names.push('silk.' + k);
  for (const k of Object.keys(WOOD)) names.push('wood.' + k);
  names.push('emissive.lamp', 'emissive.panel', 'emissive.star');
  const hexes = [...Object.values(SILK), ...Object.values(WOOD), '#ffb054', '#f3d9a4', '#ffffff'];
  const idx = {};
  names.forEach((n, i) => { idx[n] = i + 1; });
  return { names, idx, hexes, linear: hexes.map(hexToLinear), count: names.length };
})();

const { nx: NX, ny: NY, nz: NZ, x0: X0, y0: Y0, z0: Z0 } = GRID;
const IDX = NX * NY * NZ;
const ORIGIN = [X0, Y0, Z0];
export const CELL_OF = (x, y, z) => (x - X0) + NX * ((y - Y0) + NY * (z - Z0));
const insideGrid = (x, y, z) => x >= X0 && x < X0 + NX && y >= Y0 && y < Y0 + NY && z >= Z0 && z < Z0 + NZ;

export class Vox {
  constructor() {
    this.color = new Uint8Array(IDX);
    this.part = new Uint8Array(IDX);
    this.parts = [];
    this.partIdx = new Map();
    this.cur = 0;
    this.n = 0;
  }
  begin(key, { emissive = false, pivot = [0, 0, 0] } = {}) {
    let id = this.partIdx.get(key);
    if (id === undefined) {
      id = this.parts.length + 1;
      if (id > 255) throw new Error('部件数超过 255');
      this.partIdx.set(key, id);
      this.parts.push({ id, key, emissive, pivot: [...pivot], voxels: 0 });
    }
    this.cur = id;
    return id;
  }
  set(x, y, z, c) {
    if (!insideGrid(x, y, z)) throw new Error(`越界 ${x},${y},${z}`);
    const i = CELL_OF(x, y, z);
    if (this.color[i] === 0) { this.n++; this.parts[this.cur - 1].voxels++; }
    this.color[i] = c; this.part[i] = this.cur;
  }
  get(x, y, z) { return insideGrid(x, y, z) ? this.color[CELL_OF(x, y, z)] : 0; }
  filled(x, y, z) { return this.get(x, y, z) !== 0; }
  box(x0, y0, z0, x1, y1, z1, c, fn) {
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (fn && !fn(x, y, z)) continue;
      this.set(x, y, z, c);
    }
  }
  clearBox(x0, y0, z0, x1, y1, z1) {
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!insideGrid(x, y, z)) continue;
      const i = CELL_OF(x, y, z);
      if (this.color[i] !== 0) { this.color[i] = 0; this.part[i] = 0; this.n--; }
    }
  }
  shellBox(x0, y0, z0, x1, y1, z1, c) {
    this.box(x0, y0, z0, x1, y1, z1, c, (x, y, z) =>
      x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1);
  }
  cyl(axis, a0, a1, cu, cv, r, c, fn) {
    for (let a = a0; a <= a1; a++) {
      for (let u = Math.floor(cu - r); u <= Math.ceil(cu + r); u++) {
        for (let v = Math.floor(cv - r); v <= Math.ceil(cv + r); v++) {
          const du = u + 0.5 - cu, dv = v + 0.5 - cv;
          if (du * du + dv * dv > r * r) continue;
          let x, y, z;
          if (axis === 0) { x = a; y = u; z = v; }
          else if (axis === 1) { y = a; x = u; z = v; }
          else { z = a; x = u; y = v; }
          if (!insideGrid(x, y, z)) continue;
          if (fn && !fn(x, y, z, a, u, v)) continue;
          this.set(x, y, z, c);
        }
      }
    }
  }
  ball(cx, cy, cz, r, c, fn) {
    const R = Math.ceil(r);
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) {
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > r) continue;
      if (fn && !fn(cx + dx, cy + dy, cz + dz, d)) continue;
      this.set(cx + dx, cy + dy, cz + dz, c);
    }
  }
}

// ---------- 光照烘焙 ----------
const D = LIGHT.sunDir;
const DM = Math.hypot(D[0], D[1], D[2]);
const DN = [D[0] / DM, D[1] / DM, D[2] / DM];
const SUN_STEP = 1 / Math.max(Math.abs(DN[0]), Math.abs(DN[1]), Math.abs(DN[2]));
const SUN_MAX = 320;
const FLAT = [1, 1, 1];
const AO = LIGHT.aoLevels;                       // level 3 = 无遮蔽
const Q = Math.pow(2, LIGHT.quant) - 1;
const LIMAX = (Q + 1) ** 3;

export function bakeVisibility(v) {
  const solid = new Uint8Array(IDX);
  const color = v.color;
  for (let i = 0; i < IDX; i++) if (color[i] !== 0) solid[i] = 1;
  const sunV = new Uint8Array(IDX), skyV = new Float32Array(IDX);
  const lampV = LIGHT.lamps.map(() => new Uint8Array(IDX));
  const sol = (x, y, z) => (insideGrid(x, y, z) && solid[CELL_OF(x, y, z)]) ? 1 : 0;
  const yTop = Y0 + NY;
  for (let z = Z0; z < Z0 + NZ; z++) {
    for (let y = Y0; y < yTop; y++) {
      for (let x = X0; x < X0 + NX; x++) {
        const i = CELL_OF(x, y, z);
        if (!solid[i]) continue;
        if (sol(x - 1, y, z) && sol(x + 1, y, z) && sol(x, y - 1, z) && sol(x, y + 1, z)
          && sol(x, y, z - 1) && sol(x, y, z + 1)) continue;   // 内部格不参与着色
        // 太阳（方向光，硬投影）
        let px = x + 0.5, py = y + 0.5, pz = z + 0.5, t = 0, hit = 0;
        while (t < SUN_MAX) {                     // 逆着光走 = 朝太阳
          px -= DN[0] * SUN_STEP; py -= DN[1] * SUN_STEP; pz -= DN[2] * SUN_STEP;
          t += SUN_STEP;
          const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
          if (iy >= yTop || ix < X0 || ix >= X0 + NX || iz < Z0 || iz >= Z0 + NZ) break;
          if (solid[CELL_OF(ix, iy, iz)]) { hit = 1; break; }
        }
        sunV[i] = hit ? 0 : 1;
        // 点光（硬投影）
        for (let li = 0; li < LIGHT.lamps.length; li++) {
          const LP = LIGHT.lamps[li];
          const ex = LP.pos[0] + 0.5 - (x + 0.5), ey = LP.pos[1] + 0.5 - (y + 0.5), ez = LP.pos[2] + 0.5 - (z + 0.5);
          const dist = Math.hypot(ex, ey, ez) || 1;
          lampV[li][i] = 0;
          if (dist < LP.R * 1.7) {
            const step = dist / Math.max(Math.abs(ex), Math.abs(ey), Math.abs(ez));
            let k = 0, lhit = 0, qx = x + 0.5, qy = y + 0.5, qz = z + 0.5;
            const ux = ex / dist * step, uy = ey / dist * step, uz = ez / dist * step;
            while (k < dist - 1) {
              qx += ux; qy += uy; qz += uz; k += step;
              const ix = Math.floor(qx), iy = Math.floor(qy), iz = Math.floor(qz);
              if (ix < X0 || ix >= X0 + NX || iy < Y0 || iy >= yTop || iz < Z0 || iz >= Z0 + NZ) break;
              if (solid[CELL_OF(ix, iy, iz)]) { lhit = 1; break; }
            }
            lampV[li][i] = lhit ? 0 : 1;
          }
        }
        // 天光遮蔽：向上抽 7 条
        let s = 0, tot = 0;
        for (const [ox, w] of SKY_PROBES) {
          tot += w;
          let clear = 1;
          for (let yy = y + 6; yy < yTop; yy += 5) if (sol(x + ox, yy, z)) { clear = 0; break; }
          s += w * clear;
        }
        skyV[i] = s / tot;
      }
    }
  }
  return { solid, sunV, lampV, skyV };
}
const SKY_PROBES = [[0, 2.0], [-5, 1.0], [5, 1.0], [0, 1.0]];

// 六向基：u × v == n（右手系），故顶点序 [u0v0,u1v0,u1v1,u0v1] 从外侧看恒为逆时针
const DIRS = [
  { n: [1, 0, 0], ua: 1, va: 2, ta: 0 },
  { n: [-1, 0, 0], ua: 2, va: 1, ta: 0 },
  { n: [0, 1, 0], ua: 2, va: 0, ta: 1 },
  { n: [0, -1, 0], ua: 0, va: 2, ta: 1 },
  { n: [0, 0, 1], ua: 0, va: 1, ta: 2 },
  { n: [0, 0, -1], ua: 1, va: 0, ta: 2 },
];
const DIMS = [NX, NY, NZ];

export function buildMeshes(v, { onProgress, vis: visIn } = {}) {
  const vis = visIn || bakeVisibility(v);
  const { solid, sunV, lampV, skyV } = vis;
  const color = v.color, part = v.part;
  const gmap = new Map();
  const getPart = (id) => {
    if (!gmap.has(id)) {
      const meta = v.parts[id - 1];
      gmap.set(id, { key: meta.key, emissive: meta.emissive, pivot: meta.pivot, pos: [], col: [], quads: 0, rawFaces: 0 });
    }
    return gmap.get(id);
  };
  let totalFaces = 0;
  for (const dir of DIRS) {
    const { n, ua, va, ta } = dir;
    const axisOfN = n[0] !== 0 ? 0 : (n[1] !== 0 ? 1 : 2);
    const planeOff = n[axisOfN] > 0 ? 1 : 0;
    const nu = DIMS[ua], nv = DIMS[va], ns = DIMS[ta];
    const mask = new Float64Array(nu * nv);
    const used = new Uint8Array(nu * nv);
    for (let s = 0; s < ns; s++) {
      mask.fill(0); used.fill(0);
      let any = false;
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          const c = [0, 0, 0];
          c[ta] = s; c[ua] = i; c[va] = j;
          const wx = c[0] + X0, wy = c[1] + Y0, wz = c[2] + Z0;
          const cI = CELL_OF(wx, wy, wz);
          const col = color[cI];
          if (col === 0) continue;
          const nxp = wx + n[0], nyp = wy + n[1], nzp = wz + n[2];
          if (insideGrid(nxp, nyp, nzp) && solid[CELL_OF(nxp, nyp, nzp)]) continue;
          // AO：顶点序 u0v0, u1v0, u1v1, u0v1
          let aoPacked = 0;
          for (let t = 0; t < 4; t++) {
            const ou = (t === 1 || t === 2) ? 1 : -1;
            const ov = (t === 2 || t === 3) ? 1 : -1;
            const q = [nxp, nyp, nzp]; q[ua] += ou; q[va] += ov;
            const q1 = [nxp, nyp, nzp]; q1[ua] += ou;
            const q2 = [nxp, nyp, nzp]; q2[va] += ov;
            const s1 = solAt(solid, q1[0], q1[1], q1[2]);
            const s2 = solAt(solid, q2[0], q2[1], q2[2]);
            const cc = solAt(solid, q[0], q[1], q[2]);
            const lvl = (s1 && s2) ? 0 : 3 - (s1 + s2 + cc);
            aoPacked = aoPacked * 4 + lvl;
          }
          const pid = part[cI];
          const meta = v.parts[pid - 1];
          let li = 0;
          if (!meta.emissive) {
            const sk = n[1] > 0 ? LIGHT.skyUp : (n[1] < 0 ? LIGHT.skyDown : LIGHT.skySide);
            const amb = sk * (0.62 + 0.38 * skyV[cI]);   // skyV=0 时仍有屋内冷底光
            const nd = -(n[0] * DN[0] + n[1] * DN[1] + n[2] * DN[2]);   // DN 是光行方向，取反才是「指向光源」
            const sun = nd > 0 && sunV[cI] ? LIGHT.sunI * nd : 0;
            let lr = 0, lg = 0, lb = 0;
            for (let li = 0; li < LIGHT.lamps.length; li++) {
              const LP = LIGHT.lamps[li];
              const lx = LP.pos[0] + 0.5 - (wx + 0.5), ly = LP.pos[1] + 0.5 - (wy + 0.5), lz = LP.pos[2] + 0.5 - (wz + 0.5);
              const dist = Math.hypot(lx, ly, lz) || 1;
              const nl = (n[0] * lx + n[1] * ly + n[2] * lz) / dist;
              if (nl <= 0 || !lampV[li][cI]) continue;
              const f = Math.max(0, 1 - dist / LP.R);
              const k = LP.I * nl * f * f;
              lr += LP.color[0] * k; lg += LP.color[1] * k; lb += LP.color[2] * k;
            }
            const r = LIGHT.skyTint[0] * amb + LIGHT.sunColor[0] * sun + lr;
            const g = LIGHT.skyTint[1] * amb + LIGHT.sunColor[1] * sun + lg;
            const b = LIGHT.skyTint[2] * amb + LIGHT.sunColor[2] * sun + lb;
            li = Math.round(Math.min(1, r) * Q) * (Q + 1) * (Q + 1)
              + Math.round(Math.min(1, g) * Q) * (Q + 1)
              + Math.round(Math.min(1, b) * Q);
          }
          mask[j * nu + i] = (((pid * 256 + col) * 256 + aoPacked) * LIMAX + li) + 1;
          any = true; totalFaces++;
        }
      }
      if (!any) continue;
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          const k0 = mask[j * nu + i];
          if (k0 === 0 || used[j * nu + i]) continue;
          let w = 1;
          while (i + w < nu && mask[j * nu + i + w] === k0 && !used[j * nu + i + w]) w++;
          let h = 1;
          outer:
          while (j + h < nv) {
            for (let q = 0; q < w; q++) {
              if (mask[(j + h) * nu + i + q] !== k0 || used[(j + h) * nu + i + q]) break outer;
            }
            h++;
          }
          for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) used[(j + b) * nu + i + a] = 1;
          const key = k0 - 1;
          const li = key % LIMAX;
          const rest = (key - li) / LIMAX;
          const aoPacked = rest % 256;
          const rest2 = (rest - aoPacked) / 256;
          const colIdx = rest2 % 256;
          const pid = (rest2 - colIdx) / 256;
          const g = getPart(pid);
          g.rawFaces += w * h;
          const piv = g.pivot;
          const planeCoord = s + planeOff + ORIGIN[ta];
          const lr = Math.floor(li / ((Q + 1) ** 2)) / Q;
          const lg = (Math.floor(li / (Q + 1)) % (Q + 1)) / Q;
          const lb = (li % (Q + 1)) / Q;
          const base = LIGHT.debugFlat ? FLAT : PAL.linear[colIdx - 1];
          let ap = aoPacked;
          const ao4 = [0, 0, 0, 0];
          for (let t = 3; t >= 0; t--) { ao4[t] = ap % 4; ap = Math.floor(ap / 4); }
          const duv = [[0, 0], [w, 0], [w, h], [0, h]];
          for (let t = 0; t < 4; t++) {
            const p = [0, 0, 0];
            p[ta] = planeCoord;
            p[ua] = i + duv[t][0] + ORIGIN[ua];
            p[va] = j + duv[t][1] + ORIGIN[va];
            g.pos.push(p[0] - piv[0], p[1] - piv[1], p[2] - piv[2]);
            const aoF = g.emissive ? 1 : AO[ao4[t]];
            if (g.emissive) g.col.push(base[0], base[1], base[2]);
            else g.col.push(base[0] * lr * aoF, base[1] * lg * aoF, base[2] * lb * aoF);
          }
          g.quads++;
        }
      }
    }
    if (onProgress) onProgress(ta + 1, 6);
  }
  const parts = [];
  for (const g of gmap.values()) {
    if (!g.quads) continue;
    const idx = new Uint32Array(g.quads * 6);
    for (let q = 0, o = 0; q < g.quads; q++, o += 4) {
      idx[q * 6] = o; idx[q * 6 + 1] = o + 1; idx[q * 6 + 2] = o + 2;
      idx[q * 6 + 3] = o; idx[q * 6 + 4] = o + 2; idx[q * 6 + 5] = o + 3;
    }
    parts.push({
      key: g.key, emissive: g.emissive, pivot: g.pivot,
      positions: new Float32Array(g.pos), colors: new Float32Array(g.col), indices: idx,
      quads: g.quads, rawFaces: g.rawFaces, tris: g.quads * 2,
    });
  }
  let tris = 0, quads = 0, verts = 0;
  for (const p of parts) { tris += p.tris; quads += p.quads; verts += p.positions.length / 3; }
  return {
    parts,
    stats: {
      voxels: v.n, parts: parts.length, rawFaces: totalFaces, quads, tris, verts,
      mergeRate: totalFaces ? 1 - quads / totalFaces : 0,
    },
  };
}

function solAt(solid, x, y, z) {
  if (!insideGrid(x, y, z)) return 0;
  return solid[CELL_OF(x, y, z)] ? 1 : 0;
}

// ---------- 动态件的轻量光照：按需抽样静态可见性（不缓存，几千次调用足够快） ----------
export function sampleLight(v, vis, x, y, z, n) {
  const solid = vis.solid;
  const sol = (xx, yy, zz) => (insideGrid(xx, yy, zz) && solid[CELL_OF(xx, yy, zz)]) ? 1 : 0;
  const yTop = Y0 + NY;
  let px = x + n[0] * 0.5 + 0.5, py = y + n[1] * 0.5 + 0.5, pz = z + n[2] * 0.5 + 0.5;
  let t = 0, sun = 1;
  while (t < SUN_MAX) {
    px -= DN[0] * SUN_STEP; py -= DN[1] * SUN_STEP; pz -= DN[2] * SUN_STEP;
    t += SUN_STEP;
    const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
    if (iy >= yTop || ix < X0 || ix >= X0 + NX || iz < Z0 || iz >= Z0 + NZ) break;
    if (solid[CELL_OF(ix, iy, iz)]) { sun = 0; break; }
  }
  let lr = 0, lg = 0, lb = 0;
  for (const LP of LIGHT.lamps) {
    const ex = LP.pos[0] + 0.5 - (x + 0.5), ey = LP.pos[1] + 0.5 - (y + 0.5), ez = LP.pos[2] + 0.5 - (z + 0.5);
    const dist = Math.hypot(ex, ey, ez) || 1;
    const nl = (n[0] * ex + n[1] * ey + n[2] * ez) / dist;
    if (nl <= 0 || dist > LP.R * 1.7) continue;
    const step = dist / Math.max(Math.abs(ex), Math.abs(ey), Math.abs(ez));
    let k = 0, lhit = 0, qx = x + 0.5, qy = y + 0.5, qz = z + 0.5;
    const ux = ex / dist * step, uy = ey / dist * step, uz = ez / dist * step;
    while (k < dist - 1) {
      qx += ux; qy += uy; qz += uz; k += step;
      const ix = Math.floor(qx), iy = Math.floor(qy), iz = Math.floor(qz);
      if (ix < X0 || ix >= X0 + NX || iy < Y0 || iy >= yTop || iz < Z0 || iz >= Z0 + NZ) break;
      if (solid[CELL_OF(ix, iy, iz)]) { lhit = 1; break; }
    }
    if (lhit) continue;
    const f = Math.max(0, 1 - dist / LP.R);
    const kk = LP.I * nl * f * f;
    lr += LP.color[0] * kk; lg += LP.color[1] * kk; lb += LP.color[2] * kk;
  }
  let skyC = 0, tot = 0;
  for (const [ox, w] of SKY_PROBES) {
    tot += w;
    let clear = 1;
    for (let yy = y + 6; yy < yTop; yy += 5) if (sol(x + ox, yy, z)) { clear = 0; break; }
    skyC += w * clear;
  }
  const skyVv = skyC / tot;
  const sk = n[1] > 0 ? LIGHT.skyUp : (n[1] < 0 ? LIGHT.skyDown : LIGHT.skySide);
  const amb = sk * (0.62 + 0.38 * skyVv);
  const nd = -(n[0] * DN[0] + n[1] * DN[1] + n[2] * DN[2]);   // DN 是光行方向，取反才是「指向光源」
  const sunT = nd > 0 && sun ? LIGHT.sunI * nd : 0;
  return [
    Math.min(1, LIGHT.skyTint[0] * amb + LIGHT.sunColor[0] * sunT + lr),
    Math.min(1, LIGHT.skyTint[1] * amb + LIGHT.sunColor[1] * sunT + lg),
    Math.min(1, LIGHT.skyTint[2] * amb + LIGHT.sunColor[2] * sunT + lb),
  ];
}
