import { NX, NZ, S, Y0, iyOf, cellX, cellZ, TIERS, RISER, TREAD, PODIUM } from './config.js';
import { P } from './palette.js';
import { hash2, hash3, wrap, TAU, clamp } from './util.js';

const DEG = Math.PI / 180;
const CURB = 0.45;

// Eight stair runs per tier: 南三出陛 (centre + two radial at ±30°), 东西一出陛, 北三出陛 (three parallel runs).
export const RUNS = [
  { id: 'S', ang: 0, w: 7.0, ramp: 2.2 },
  { id: 'SE', ang: 30 * DEG, w: 5.0 },
  { id: 'SW', ang: -30 * DEG, w: 5.0 },
  { id: 'E', ang: 90 * DEG, w: 5.0 },
  { id: 'W', ang: -90 * DEG, w: 5.0 },
  { id: 'N', ang: Math.PI, w: 7.0, ramp: 2.2, off: 0 },
  { id: 'NE', ang: Math.PI, w: 5.0, off: -6.85 },
  { id: 'NW', ang: Math.PI, w: 5.0, off: 6.85 },
];

// Sumeru (须弥座) profile offset from the top fascia radius, by local height.
function sumeru(yl, H) {
  const waistTop = H - 0.5;
  if (yl < 0.1) return 0.16;
  if (yl < 0.26) return 0.1;
  if (yl < 0.46) return 0.02;
  if (yl < 0.56) return -0.06;
  if (yl < waistTop) return -0.17;
  if (yl < waistTop + 0.1) return -0.06;
  return 0;
}

function runFrame(run, x, z) {
  const s = Math.sin(run.ang), c = Math.cos(run.ang);
  const along = x * s + z * c;
  let across = x * c - z * s;
  if (run.off !== undefined) across -= run.off;
  return [along, across];
}

function runStart(run, R) {
  if (run.off) return Math.sqrt(R * R - run.off * run.off);
  return R;
}

export function buildTerrace(vol) {
  // 1. solid tiers with Sumeru profile and paved tops
  for (let t = 0; t < TIERS.length; t++) {
    const T = TIERS[t];
    const H = T.y1 - T.y0;
    const ya = iyOf(T.y0), yb = iyOf(T.y1);
    const rMax = T.r + 0.2;
    const i0 = Math.max(0, Math.floor((-rMax) / S + NX / 2)), i1 = Math.min(NX, Math.ceil(rMax / S + NX / 2));
    for (let iy = ya; iy < yb; iy++) {
      const yl = (iy - ya + 0.5) * S;
      const rr = T.r + sumeru(yl, H);
      const top = iy === yb - 1;
      for (let iz = i0; iz < i1; iz++) {
        const z = cellZ(iz);
        const o = iy * vol.layer + iz * NX;
        for (let ix = i0; ix < i1; ix++) {
          const x = cellX(ix);
          const r = Math.hypot(x, z);
          if (r > rr) continue;
          let c;
          if (top) c = pave(t, x, z, r, T.r, ix, iz);
          else if (r > rr - 0.25) c = faceStone(yl, H, x, z, iy);
          else c = P.marbleShade;
          vol.data[o + ix] = c;
        }
      }
    }
  }
  // 2. stairs
  for (let t = 0; t < TIERS.length; t++) for (const run of RUNS) buildRun(vol, t, run);
  // 3. balustrades + spouts
  const posts = [];
  for (let t = 0; t < TIERS.length; t++) posts.push(buildBalustrade(vol, t));
  return { posts };
}

function faceStone(yl, H, x, z, iy) {
  const waistTop = H - 0.5;
  if (yl >= 0.56 && yl < waistTop) {
    // waist: slightly darker, with small carved posts every ~1.2 m
    const th = Math.atan2(x, z);
    const k = Math.round(th * 30 / Math.PI * 4);
    return hash2(k, 7) < 0.5 ? P.marbleAged : P.marbleShade;
  }
  if (yl < 0.1) return P.marbleAged;
  const th = Math.atan2(x, z);
  const block = Math.floor((th + Math.PI) * 60);
  const course = Math.floor(yl / 0.3);
  return hash2(block, course + iy * 0) < 0.3 ? P.marbleShade : P.marble;
}

function pave(t, x, z, r, R, ix, iz) {
  if (r > R - 1.05) {
    // capping ring stones
    const th = Math.atan2(x, z);
    const k = Math.floor((th + Math.PI) * R / 1.2);
    const d = (th + Math.PI) * R / 1.2 - k;
    if (d < 0.08 && r < R - 0.4) return P.marbleJoint;
    return hash2(k, t) < 0.35 ? P.marbleLight : P.marble;
  }
  if (t === 2) {
    // top tier: 金砖 on the southern half, machine-made grey brick on the north
    const size = 6;
    const lx = ((ix % size) + size) % size, lz = ((iz % size) + size) % size;
    if (z > 0) {
      if (lx === 0 || lz === 0) return P.jinzhuanJoint;
      return hash2(Math.floor(ix / size), Math.floor(iz / size)) < 0.45 ? P.jinzhuanB : P.jinzhuan;
    }
    if (lx === 0 || lz === 0) return P.brickJoint;
    return hash2(Math.floor(ix / size), Math.floor(iz / size) + 99) < 0.45 ? P.brickB : P.brick;
  }
  const size = 5;
  const lx = ((ix % size) + size) % size, lz = ((iz % size) + size) % size;
  if (lx === 0 || lz === 0) return P.brickJoint;
  return hash2(Math.floor(ix / size) + t * 1000, Math.floor(iz / size)) < 0.45 ? P.brickB : P.brick;
}

function buildRun(vol, t, run) {
  const T = TIERS[t];
  const R = T.r;
  const n = T.steps;
  const yTop = T.y1, yBot = T.y0;
  const half = run.w / 2;
  const halfAll = half + CURB;
  const a0 = runStart(run, R);
  const L = (n - 1) * TREAD;
  const reach = Math.hypot(a0 + L + 0.6, halfAll + Math.abs(run.off || 0)) + 0.5;
  const bx0 = Math.max(0, Math.floor(-reach / S + NX / 2)), bx1 = Math.min(NX, Math.ceil(reach / S + NX / 2));
  const yb0 = iyOf(yBot), yb1 = iyOf(yTop + 1.6);
  // only scan the bounding box of the run
  const s = Math.sin(run.ang), c = Math.cos(run.ang);
  const off = run.off || 0;
  const pts = [];
  for (const al of [a0 - 0.6, a0 + L + 0.6]) for (const ac of [-halfAll - 0.6, halfAll + 0.6]) {
    const acr = ac + off;
    pts.push([al * s + acr * c, al * c - acr * s]);
  }
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  const ix0 = clamp(Math.floor(Math.min(...xs) / S + NX / 2), bx0, bx1), ix1 = clamp(Math.ceil(Math.max(...xs) / S + NX / 2), bx0, bx1);
  const iz0 = clamp(Math.floor(Math.min(...zs) / S + NZ / 2), 0, NZ), iz1 = clamp(Math.ceil(Math.max(...zs) / S + NZ / 2), 0, NZ);
  const slope = RISER / TREAD;
  const relief = t === 2 ? 'dragon' : t === 1 ? 'phoenix' : 'cloud';
  for (let iz = iz0; iz < iz1; iz++) {
    const z = cellZ(iz);
    for (let ix = ix0; ix < ix1; ix++) {
      const x = cellX(ix);
      const [along, across] = runFrame(run, x, z);
      const aa = Math.abs(across);
      if (aa > halfAll) continue;
      if (along < a0 - 0.6 || along > a0 + L) continue;
      const d = along - a0; // distance from the tier face
      for (let iy = yb0; iy < yb1; iy++) {
        const y = (iy - Y0 + 0.5) * S;
        let col = 0;
        if (d < 0) {
          // landing fill so the curved face meets the straight stair
          if (y < yTop && aa <= halfAll) col = aa > half ? P.marble : P.marbleLight;
        } else if (aa > half) {
          // 垂带 (curb): sloped strip following the nosing line, 0.12 m proud
          const yc = yTop - d * slope + 0.12;
          if (y < yc && y >= yBot) col = aa > halfAll - 0.06 ? P.marbleShade : P.marble;
        } else if (run.ramp && aa <= run.ramp / 2) {
          // carved imperial ramp (御路): a framed slab, recessed ground, motifs in two relief levels
          const yr = yTop - d * slope;
          const [rh, rc] = rampRelief(relief, d / L, across / (run.ramp / 2));
          if (y < yr + rh * S && y >= yBot) col = y >= yr - S ? rc : P.marble;
        } else {
          const k = Math.floor(d / TREAD) + 1; // step index below the landing
          const ys = yTop - k * RISER;
          if (y < ys && y >= yBot) col = (y > ys - 0.1 && (d % TREAD) < 0.1) ? P.marbleLight : P.marble;
        }
        if (col) vol.data[iy * vol.layer + iz * NX + ix] = col;
      }
    }
  }
  // sloped balustrades on both curbs + drum stones at the foot
  for (const side of [-1, 1]) {
    const ac = side * (half + CURB / 2) + off;
    sideBalustrade(vol, run, t, ac, a0, L, yTop, yBot, slope);
  }
}

// u: 0 at the top landing, 1 at the foot · w: −1..1 across. Returns [relief height in voxels, colour].
function rampRelief(kind, u, w) {
  const aw = Math.abs(w);
  if (aw > 0.84 || u < 0.03 || u > 0.97) return [1, P.marble];              // raised frame
  if (u > 0.8) {
    // 海水江崖: a rock peak rising from rolling waves
    if (aw < 0.16 + (u - 0.8) * 1.4) return [2, P.marbleLight];
    return Math.sin(w * 15 + u * 34) > 0.3 ? [1, P.marbleRelief] : [0, P.marbleAged];
  }
  const yy = (u - 0.42) / 0.36;                                              // −1..1 over the main field
  let m = 0;
  if (kind === 'dragon') {
    // two dragons rising towards a flaming pearl
    if (Math.hypot(w * 1.2, (yy + 0.55) * 0.8) < 0.2) m = 2;
    for (const s of [-1, 1]) {
      const bx = s * (0.5 + 0.2 * Math.sin(yy * 3.1 + (s > 0 ? 1.1 : 0)));
      if (Math.abs(w - bx) < 0.12 && yy > -0.6 && yy < 0.95) m = 2;
      if (Math.hypot(w - s * 0.34, yy + 0.62) < 0.15) m = 2;                   // heads
      if (Math.abs(yy - 0.15 - s * 0.2) < 0.05 && Math.abs(w - bx) < 0.3) m = Math.max(m, 1); // claws
    }
  } else if (kind === 'phoenix') {
    // two phoenixes facing each other, long tails sweeping down
    for (const s of [-1, 1]) {
      const px = s * 0.42, py = -0.35;
      if (Math.hypot(w - px, (yy - py) * 0.9) < 0.16) m = 2;
      if (Math.abs(yy - py + 0.1 - 0.55 * Math.abs(w - px)) < 0.07 && Math.abs(w - px) < 0.38) m = 2;
      const tx = px + s * 0.18 * (yy - py);
      if (yy > py && yy < 0.95 && Math.abs(w - tx) < 0.07 + 0.05 * (yy - py)) m = Math.max(m, 1);
    }
  } else {
    // 山海祥云: two great curling clouds
    for (const s of [-1, 1]) {
      const r = Math.hypot(w - s * 0.3, (yy - s * 0.25) * 0.85);
      if (r > 0.18 && r < 0.36 && Math.atan2(yy - s * 0.25, w - s * 0.3) * s < 2.2) m = 2;
    }
  }
  if (!m) {
    // ground of small cloud scrolls
    const gx = Math.floor((w + 1) * 4), gy = Math.floor(u * 9);
    const d = Math.hypot((w + 1) * 4 - gx - 0.5, u * 9 - gy - 0.5);
    if (hash2(gx, gy + 31) > 0.4 && d > 0.16 && d < 0.4) m = 1;
  }
  return m === 2 ? [2, P.marbleLight] : m === 1 ? [1, P.marbleRelief] : [0, P.marbleAged];
}

function sideBalustrade(vol, run, t, ac, a0, L, yTop, yBot, slope) {
  const s = Math.sin(run.ang), c = Math.cos(run.ang);
  const toXZ = (al, acr) => [al * s + acr * c, al * c - acr * s];
  const postsAlong = [0.05, L * 0.5, L - 0.05];
  // panels: sloped, 0.85 m tall above the curb top, 0.18 m thick
  const steps = Math.ceil((L + 0.4) / (S * 0.5));
  const seen = new Set();
  for (let k = 0; k <= steps; k++) {
    const al = a0 + k * S * 0.5;
    if (al > a0 + L) break;
    const d = al - a0;
    const yc = yTop - d * slope + 0.12;
    for (let w = -0.09; w <= 0.09; w += S * 0.5) {
      const [x, z] = toXZ(al, ac + w);
      const ix = Math.floor(x / S + NX / 2), iz = Math.floor(z / S + NZ / 2);
      const isPost = postsAlong.some((p) => Math.abs(d - p) < 0.13);
      const hTop = isPost ? 1.35 : 0.86;
      const y0 = iyOf(yc), y1 = iyOf(yc + hTop);
      for (let iy = y0; iy < y1; iy++) {
        const key = (iy * NZ + iz) * NX + ix;
        if (seen.has(key)) continue;
        seen.add(key);
        const hl = (iy - y0) * S;
        let col = P.marble;
        if (isPost) col = hl > 1.05 ? P.marbleLight : P.marble;
        else if (hl > 0.72) col = P.marbleLight;
        else if (hl > 0.42 && hl < 0.7 && ((d * 10) % 6 > 1.5) && Math.abs(w) < 0.05) col = 0;
        if (col) vol.set(ix, iy, iz, col);
      }
    }
  }
  // drum stone (抱鼓石) at the foot
  const alF = a0 + L + 0.25;
  const [fx, fz] = toXZ(alF, ac);
  const cx = Math.round(fx / S + NX / 2), cz = Math.round(fz / S + NZ / 2);
  const yb = iyOf(yBot);
  for (let dy = 0; dy < 8; dy++) for (let du = -4; du <= 4; du++) for (let dw = -1; dw <= 1; dw++) {
    const rr = Math.hypot(du, dy - 3.5);
    if (dy >= 2 && rr > 3.8) continue;
    const [ox, oz] = [du * s * S + dw * c * S, du * c * S - dw * s * S];
    const col = dy < 2 ? P.marble : P.marbleLight;
    vol.set(Math.round(cx + ox / S), yb + dy, Math.round(cz + oz / S), col);
  }
}

function runGaps(t) {
  const R = TIERS[t].r - 0.17;
  const gaps = [];
  for (const run of RUNS) {
    const half = run.w / 2 + CURB;
    if (run.off === undefined) {
      const d = Math.asin(half / R);
      gaps.push([run.ang - d, run.ang + d]);
    } else {
      // parallel run heading north (-Z): across = -x - off
      const xa = -(run.off) - half, xb = -(run.off) + half;
      const pos = (a) => (a < 0 ? a + TAU : a);
      const ta = pos(Math.atan2(xa, -Math.sqrt(R * R - xa * xa)));
      const tb = pos(Math.atan2(xb, -Math.sqrt(R * R - xb * xb)));
      gaps.push([Math.min(ta, tb), Math.max(ta, tb)]);
    }
  }
  // normalise to [0, 2π) starting from the south centre run
  const norm = gaps.map(([a, b]) => {
    let A = a, B = b;
    while (A < 0) { A += TAU; B += TAU; }
    return [A, B];
  });
  norm.sort((p, q) => p[0] - q[0]);
  // merge overlaps (the north block touches)
  const merged = [];
  for (const g of norm) {
    const last = merged[merged.length - 1];
    if (last && g[0] <= last[1] + 0.002) last[1] = Math.max(last[1], g[1]);
    else merged.push([...g]);
  }
  return merged;
}

function buildBalustrade(vol, t) {
  const T = TIERS[t];
  const R = T.r;
  const Rb = R - 0.17;
  const gaps = runGaps(t);
  // arcs between gaps (cyclic)
  const arcs = [];
  for (let i = 0; i < gaps.length; i++) {
    const a = gaps[i][1];
    let b = gaps[(i + 1) % gaps.length][0];
    if (b <= a) b += TAU;
    arcs.push([a, b]);
  }
  const total = arcs.reduce((s, [a, b]) => s + (b - a), 0);
  let counts = arcs.map(([a, b]) => Math.max(1, Math.round((108 * (b - a)) / total)));
  let diff = 108 - counts.reduce((s, v) => s + v, 0);
  while (diff !== 0) {
    const i = arcs.map(([a, b], k) => [(b - a) / counts[k], k]).sort((p, q) => (diff > 0 ? q[0] - p[0] : p[0] - q[0]))[0][1];
    counts[i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }
  const postAngles = [];
  const panelOf = []; // [a, b] angle ranges of panels
  arcs.forEach(([a, b], k) => {
    const n = counts[k];
    for (let j = 0; j <= n; j++) postAngles.push(a + ((b - a) * j) / n);
    for (let j = 0; j < n; j++) panelOf.push([a + ((b - a) * j) / n, a + ((b - a) * (j + 1)) / n]);
  });
  const halfPost = 0.13 / Rb;
  const yS = T.y1; // sill bottom
  const ya = iyOf(yS), yb = iyOf(yS + 1.56);
  const rIn = R - 0.42, rOut = R + 0.02;
  const lim = R + 1.2;
  const i0 = Math.max(0, Math.floor(-lim / S + NX / 2)), i1 = Math.min(NX, Math.ceil(lim / S + NX / 2));
  const sortedPosts = postAngles.map((a) => ((a % TAU) + TAU) % TAU).sort((p, q) => p - q);
  const findNear = (th) => {
    let lo = 0, hi = sortedPosts.length - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (sortedPosts[m] < th) lo = m + 1;
      else hi = m;
    }
    let best = sortedPosts[lo], bd = Math.abs(wrap(th - best));
    const p2 = sortedPosts[(lo - 1 + sortedPosts.length) % sortedPosts.length];
    if (Math.abs(wrap(th - p2)) < bd) { best = p2; bd = Math.abs(wrap(th - p2)); }
    return [best, bd];
  };
  const panelRanges = panelOf.map(([a, b]) => [((a % TAU) + TAU) % TAU, b - a]);
  const inPanel = (th) => {
    for (const [a, len] of panelRanges) {
      let d = th - a;
      if (d < 0) d += TAU;
      if (d <= len) return d / len;
    }
    return -1;
  };
  for (let iz = i0; iz < i1; iz++) {
    const z = cellZ(iz);
    for (let ix = i0; ix < i1; ix++) {
      const x = cellX(ix);
      const r = Math.hypot(x, z);
      if (r < rIn || r > rOut) continue;
      let th = Math.atan2(x, z);
      if (th < 0) th += TAU;
      const [pa, pd] = findNear(th);
      const isPost = pd <= halfPost && Math.abs(r - Rb) <= 0.13;
      const u = isPost ? -1 : inPanel(th);
      if (!isPost && u < 0) continue;
      for (let iy = ya; iy < yb; iy++) {
        const h = (iy - ya + 0.5) * S;
        let col = 0;
        if (h < 0.14) {
          if (r > R - 0.38) col = P.marble; // 地栿 sill
        } else if (isPost) {
          col = postVoxel(T.post, h - 0.14, (pd * Rb) / 0.13, r - Rb, th);
        } else if (Math.abs(r - Rb) <= 0.09) {
          col = panelVoxel(u, h - 0.14, pa);
        }
        if (col) vol.data[iy * vol.layer + iz * NX + ix] = col;
      }
    }
  }
  // spouts (出水) under each post
  const ys0 = iyOf(T.y1 - 0.42), ys1 = iyOf(T.y1 - 0.14);
  for (const a of sortedPosts) spout(vol, T, a, ys0, ys1);
  return { tier: t, posts: sortedPosts.length, panels: panelOf.length };
}

function postVoxel(kind, h, tn, dr, th) {
  // shaft 1.1 m, head 0.3 m
  if (h > 1.42) return 0;
  if (h < 1.1) {
    // recessed panel on the shaft face
    return h > 0.15 && h < 1.0 && Math.abs(tn) < 0.55 && Math.abs(dr) > 0.08 ? P.marbleShade : P.marble;
  }
  const hh = h - 1.1;
  if (kind === 'dragon') {
    if (hh < 0.08) return P.marbleShade;
    return (Math.floor(hh / 0.1) + Math.floor(th * 200)) % 2 ? P.marbleLight : P.marbleRelief;
  }
  if (kind === 'phoenix') {
    if (hh < 0.06) return P.marbleShade;
    if (hh > 0.22 && Math.abs(tn) > 0.6) return 0;
    return P.marbleRelief;
  }
  // cloud: rounded cap
  if (hh > 0.2 && (Math.abs(tn) > 0.6 || Math.abs(dr) > 0.09)) return 0;
  return hh < 0.06 ? P.marbleShade : P.marbleLight;
}

function panelVoxel(u, h, seed) {
  if (h > 0.9) return 0;
  if (h > 0.76) return P.marbleLight;                 // 寻杖 handrail
  if (h > 0.46) {
    // vase supports with two openings
    const posts = [0.04, 0.5, 0.96];
    if (posts.some((p) => Math.abs(u - p) < 0.07)) return P.marble;
    return h > 0.72 || h < 0.5 ? P.marble : 0;
  }
  if (h < 0.06) return P.marble;
  // lower panel (华板) with a framed recess
  if (u > 0.08 && u < 0.92 && h > 0.12 && h < 0.4) return P.marbleShade;
  return P.marble;
}

function spout(vol, T, a, ys0, ys1) {
  const R = T.r;
  const s = Math.sin(a), c = Math.cos(a);
  const kind = T.post;
  for (let d = -0.05; d < 0.92; d += S * 0.5) {
    for (let w = -0.16; w <= 0.16; w += S * 0.5) {
      const x = (R + d) * s + w * c, z = (R + d) * c - w * s;
      const ix = Math.floor(x / S + NX / 2), iz = Math.floor(z / S + NZ / 2);
      for (let iy = ys0; iy < ys1; iy++) {
        const hl = (iy - ys0 + 0.5) * S;
        let ok = true;
        const tip = d > 0.62;
        if (kind === 'dragon') {
          if (tip && hl < 0.1 && Math.abs(w) < 0.06) ok = false; // open mouth
          if (d > 0.82 && hl > 0.2) ok = false;
        } else if (kind === 'phoenix') {
          if (d > 0.7 && (hl > 0.18 || Math.abs(w) > 0.1)) ok = false;
        } else {
          if (d > 0.75 && Math.abs(w) > 0.1) ok = false;
        }
        if (!ok) continue;
        vol.set(ix, iy, iz, tip ? P.marbleRelief : P.marble);
      }
    }
  }
}

// Hall podium: three thin bluish-white stone rings
export function buildPodium(vol) {
  for (const ring of PODIUM) {
    const ya = iyOf(ring.y0), yb = iyOf(ring.y1);
    const lim = ring.r + 0.1;
    const i0 = Math.floor(-lim / S + NX / 2), i1 = Math.ceil(lim / S + NX / 2);
    for (let iy = ya; iy < yb; iy++) for (let iz = i0; iz < i1; iz++) {
      const z = cellZ(iz);
      for (let ix = i0; ix < i1; ix++) {
        const x = cellX(ix);
        const r = Math.hypot(x, z);
        if (r > ring.r) continue;
        const th = Math.atan2(x, z);
        const k = Math.floor((th + Math.PI) * ring.r / 1.4);
        vol.data[iy * vol.layer + iz * NX + ix] = r > ring.r - 0.8 ? (hash2(k, ya) < 0.3 ? P.qingbaiDark : P.qingbai) : P.aiye;
      }
    }
  }
}
