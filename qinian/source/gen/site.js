import { NX, NZ, S, Y0, iyOf, cellX, cellZ, HALF } from './config.js';
import { P } from './palette.js';
import { hash2, hash3 } from './util.js';

// Square diorama block (天圆地方: the round altar stands on a square court).
export function buildBase(vol) {
  const edge = HALF - 0.2;          // brick face
  const plinthOut = HALF - 0.1;
  const copeOut = HALF - 0.1;
  const yPlinthTop = iyOf(-2.7);
  const yCope = iyOf(-0.2);
  for (let iz = 0; iz < NZ; iz++) {
    const z = cellZ(iz);
    for (let ix = 0; ix < NX; ix++) {
      const x = cellX(ix);
      const m = Math.max(Math.abs(x), Math.abs(z));
      for (let iy = 0; iy < Y0; iy++) {
        let c = 0;
        if (iy < yPlinthTop) {
          if (m < plinthOut) c = iy === yPlinthTop - 1 && m > plinthOut - 0.2 ? P.plinthLine : P.plinth;
        } else if (iy >= yCope) {
          if (m < copeOut) c = P.coping;
        } else if (m < edge) {
          c = brickFace(ix, iy, iz, x, z, m, edge);
        }
        if (c) vol.data[iy * vol.layer + iz * NX + ix] = c;
      }
    }
  }
}

function brickFace(ix, iy, iz, x, z, m, edge) {
  if (m < edge - 0.25) return P.wallBrick;
  // running bond: 1-voxel courses, 5-voxel bricks, alternate offset
  const along = Math.abs(x) > Math.abs(z) ? iz : ix;
  const course = iy;
  if (course % 3 === 2) return P.wallMortar;
  const off = (Math.floor(course / 3) % 2) * 3;
  const k = along + off;
  if (k % 6 === 5) return P.wallMortar;
  return hash2(Math.floor(k / 6), Math.floor(course / 3)) < 0.45 ? P.wallBrickB : P.wallBrick;
}

// Courtyard paving with the central divine way leading south.
export function buildCourt(vol) {
  const iy = Y0 - 1;
  for (let iz = 0; iz < NZ; iz++) {
    const z = cellZ(iz);
    for (let ix = 0; ix < NX; ix++) {
      const x = cellX(ix);
      if (Math.max(Math.abs(x), Math.abs(z)) >= HALF - 0.1) continue;
      let c;
      const ax = Math.abs(x);
      if (z > 44 && ax < 2.6) {
        c = ax > 2.3 || iz % 12 === 0 || ax < 0.15 ? P.pathEdge : P.path;
      } else {
        const gx = Math.floor((x + HALF) / 1.0), gz = Math.floor((z + HALF) / 1.0);
        const lx = ix % 10, lz = iz % 10;
        if (lx === 0 || lz === 0) c = P.yardJoint;
        else c = hash2(gx, gz) < 0.42 ? P.yardB : P.yard;
      }
      vol.data[iy * vol.layer + iz * NX + ix] = c;
    }
  }
}

// Red palace-lantern stands lining the way (seen in modern photographs of the court).
export function buildLanterns(vol) {
  const spots = [];
  for (const z of [47.5, 51.0]) for (const x of [-4.2, 4.2]) spots.push([x, z]);
  for (const a of [-1, 1]) for (const k of [0, 1, 2]) {
    const ang = a * (0.36 + k * 0.17);
    const r = 48.6;
    spots.push([Math.sin(ang) * r, Math.cos(ang) * r]);
  }
  for (const [x, z] of spots) lantern(vol, x, z);
  return spots.length;
}

function lantern(vol, x, z) {
  const cx = Math.round(x / S + NX / 2), cz = Math.round(z / S + NZ / 2);
  const y0 = Y0;
  // tripod base
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    if (Math.abs(dx) + Math.abs(dz) > 3) continue;
    vol.set(cx + dx, y0, cz + dz, P.lampPole);
  }
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) vol.set(cx + dx, y0 + 1, cz + dz, P.lampPole);
  for (let y = 2; y < 24; y++) vol.set(cx, y0 + y, cz, P.lampPole);
  // lantern box with glowing panes
  for (let y = 24; y < 31; y++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    const edge = Math.abs(dx) === 2 && Math.abs(dz) === 2;
    const cap = y === 24 || y === 30;
    let c;
    if (cap) c = P.lampRed;
    else if (edge) c = P.lampRed;
    else if (Math.abs(dx) === 2 || Math.abs(dz) === 2) c = (y === 27) ? P.lampRed : P.lampGlow;
    else c = P.lampGlow;
    vol.set(cx + dx, y0 + y, cz + dz, c);
  }
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) vol.set(cx + dx, y0 + 31, cz + dz, P.lampRed);
  vol.set(cx, y0 + 32, cz, P.gold);
}

// Visitors for scale: 1.7 m figures (0.4 m shoulders) in muted autumn coats, facing along the axes,
// each standing on the highest surface under its footprint.
const FIGURES = [
  [-1.0, 50.6, 2, 'coatNavy'], [0.9, 49.3, 2, 'coatCamel'], [1.5, 52.2, 2, 'coatGrey'],
  [-5.6, 43.6, 1, 'coatRed'], [6.2, 43.1, 3, 'coatNavy'],
  [-12.2, 37.2, 2, 'coatGrey'], [10.4, 37.6, 0, 'coatWhite'],
  [2.4, 35.6, 2, 'coatGrey'], [-2.3, 36.3, 2, 'coatRed'], [-2.9, 35.0, 2, 'coatNavy'],
  [-4.7, 29.7, 3, 'coatCamel'], [-6.4, 20.2, 2, 'coatNavy'], [4.1, 18.4, 0, 'coatRed'],
  [8.6, 22.1, 1, 'coatGrey'], [-10.2, 24.0, 2, 'coatWhite'], [0.6, 16.6, 2, 'coatCamel'],
];
export function buildFigures(vol) {
  for (const [x, z, face, coat] of FIGURES) figure(vol, x, z, face, P[coat]);
  return FIGURES.length;
}

function figure(vol, x, z, face, coat) {
  const cx = Math.round(x / S + NX / 2), cz = Math.round(z / S + NZ / 2);
  // face: 0 south · 1 west · 2 north · 3 east. Local a: across the shoulders (−2..1) · d: front to back (0..1)
  const A = [[1, 0], [0, 1], [-1, 0], [0, -1]][face], D = [[0, -1], [1, 0], [0, 1], [-1, 0]][face];
  const at = (a, d) => [cx + a * A[0] + d * D[0], cz + a * A[1] + d * D[1]];
  let base = 0;
  for (let a = -2; a <= 1; a++) for (let d = 0; d <= 1; d++) {
    const [ix, iz] = at(a, d);
    for (let iy = iyOf(8); iy >= 0; iy--) if (vol.get(ix, iy, iz)) { base = Math.max(base, iy + 1); break; }
  }
  for (let y = 0; y < 17; y++) for (let a = -2; a <= 1; a++) for (let d = 0; d <= 1; d++) {
    let c = 0;
    if (y < 5) c = (a === -2 || a === 1) ? P.trousers : 0;          // legs
    else if (y < 14) c = coat;                                       // coat and arms
    else if (a === -1 || a === 0) c = y === 16 || (d === 1 && y === 15) ? P.figHair : P.figSkin;
    if (!c) continue;
    const [ix, iz] = at(a, d);
    vol.set(ix, base + y, iz, c);
  }
}

// Bronze tripod censers (鼎炉): four before the top tier, two before each lower tier, two at the foot.
export function buildCensers(vol, tiers) {
  const list = [];
  const put = (r, ang, y) => list.push([Math.sin(ang) * r, Math.cos(ang) * r, y]);
  const t3 = tiers[2], t2 = tiers[1], t1 = tiers[0];
  for (const a of [-0.2, -0.105, 0.105, 0.2]) put(t3.r - 3.2, a, t3.y1);
  for (const a of [-0.13, 0.13]) put(t2.r - 2.6, a, t2.y1);
  for (const a of [-0.12, 0.12]) put(t1.r - 2.6, a, t1.y1);
  for (const a of [-0.105, 0.105]) put(t1.r + 4.6, a, 0);
  for (const [x, z, y] of list) censer(vol, x, z, y);
  return list.length;
}

// Bronze ding as photographed on the terrace: a wide round belly (≈1.45 m), two tall upright ears
// set across the stair axis, three stout legs, open top; it stands straight on the paving.
function censer(vol, x, z, ym) {
  const cx = x / S + NX / 2, cz = z / S + NZ / 2;
  const y0 = iyOf(ym);
  const a = Math.atan2(x, z);
  const tx = Math.cos(a), tz = -Math.sin(a);           // across the stair axis
  const put = (dx, y, dz, c) => vol.set(Math.floor(cx + dx), y0 + y, Math.floor(cz + dz), c);
  // legs: 0.3 m, set on a 0.45 m circle
  for (let k = 0; k < 3; k++) {
    const la = a + Math.PI + (k / 3) * Math.PI * 2;
    const lx = Math.sin(la) * 4.4, lz = Math.cos(la) * 4.4;
    for (let y = 0; y < 3; y++) for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
      if (y < 2 && ox * oz !== 0) continue;
      put(lx + ox, y, lz + oz, P.bronze);
    }
  }
  // belly profile by layer (radius in voxels), lip at the top, hollow above the ash line
  const prof = [3.8, 5.6, 6.6, 7.2, 7.4, 7.3, 7.0, 6.7, 7.2];
  for (let i = 0; i < prof.length; i++) {
    const y = 3 + i, R = prof[i];
    for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) {
      const d = Math.hypot(dx + 0.5, dz + 0.5);
      if (d > R) continue;
      if (i >= 6 && d < R - 1.3) { if (i === 6) put(dx, y, dz, P.iron); continue; }
      const lip = i === prof.length - 1 || i === 4;
      put(dx, y, dz, lip ? P.bronzeLight : hash3(dx, y, dz) < 0.05 ? P.bronzeGreen : P.bronze);
    }
  }
  // two upright ears on the rim, 0.5 m tall, open in the middle and bent slightly outwards at the top
  for (const s of [-1, 1]) for (let y = 11; y < 17; y++) for (let w = -2; w <= 2; w++) for (let k = 0; k < 2; k++) {
    const hole = Math.abs(w) < 2 && y > 11 && y < 16;
    if (hole) continue;
    const r = 6.6 + k + (y >= 15 ? 0.8 : 0);
    put(s * tx * r + w * tz, y, s * tz * r - w * tx, P.bronze);
  }
}
