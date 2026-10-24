// 机构层：浑仪、浑象、枢轮、天衡、天柱凸轮塔、水路、斗链、木人。
import { L } from './spec.js';
import { PI } from './palette.js';
import { P, set, bx } from './sculpt.js';
import { buildCourt, buildBase, buildTower } from './sculpt.js';
export { buildTower } from './sculpt.js';
import { STARS, AXIS } from './catalog.js';

const A = L.arm.axis;
const AXLEN = Math.hypot(A[0], A[1], A[2]);
const AXU = [A[0] / AXLEN, A[1] / AXLEN, A[2] / AXLEN];
const E1 = [1, 0, 0];
const E2 = [AXU[1] * 0 - AXU[2] * 0, AXU[2] * 1 - AXU[0] * 0, AXU[0] * 0 - AXU[1] * 1];

function axPoint(c, t) {
  return [c[0] + AXU[0] * t, c[1] + AXU[1] * t, c[2] + AXU[2] * t];
}

function ringPlane(p, c, r, u, v, c1, thick) {
  const steps = Math.max(24, Math.round(r * 7));
  for (let i = 0; i < steps; i++) {
    const a = i / steps * Math.PI * 2;
    const px = c[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]);
    const py = c[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]);
    const pz = c[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2]);
    set(p, Math.round(px), Math.round(py), Math.round(pz), c1);
    if (thick) {
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      set(p, Math.round(px + n[0]), Math.round(py + n[1]), Math.round(pz + n[2]), c1);
    }
  }
}

function ringDouble(p, c, r, u, v, col, gap) {
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  for (const s of (gap || [-1, 1])) {
    const u2 = u, v2 = v;
    ringPlane(p, [c[0] + s * n[0], c[1] + s * n[1], c[2] + s * n[2]], r, u2, v2, col, false);
  }
}

export function buildArmillary() {
  const p = P('armillary');
  const a = L.arm;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const cx = sx * a.colX, cz = sz * a.colX;
      for (let y = a.colY0; y <= a.colY1; y++) {
        const bend = Math.round(Math.sin((y - a.colY0) * 0.7) * 1.6);
        bx(p, cx - 1, cx + 1, y, y, cz - 1, cz + 1, y % 3 === 0 ? PI.vermD : PI.verm);
        set(p, cx - Math.sign(cx) * 1, y, cz, PI.gold);
      }
      bx(p, cx - 1, cx + 1, a.colY1 + 1, a.colY1 + 1, cz - 2, cz + 2, PI.gold);
      set(p, cx - Math.sign(cx) * 2, a.colY1 + 2, cz, PI.gold);
      set(p, cx, a.colY1 + 2, cz - Math.sign(cz) * 2, PI.gold);
    }
  for (const s of [-1, 1])
    for (let u = -a.colX; u <= a.colX; u++) {
      const z1 = Math.round(u * s);
      for (const dz of [0, 1])
        for (let y = 109; y <= 110; y++) set(p, u, y, z1 + dz, PI.wood);
      for (const dx of [-1, 0, 1]) set(p, u + dx, 109, z1, PI.wood);
    }
  bx(p, -1, 1, 105, 109, -1, 1, PI.wood);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      bx(p, sx * 10 - 1, sx * 10 + 1, 110, 117, sz * 10 - 1, sz * 10 + 1, PI.wood);
  ringPlane(p, a.ringC, a.rHoriz, [1, 0, 0], [0, 0, 1], PI.bronze, true);
  ringDouble(p, a.ringC, a.rMerid, [0, 1, 0], [0, 0, 1], PI.bronze);
  for (const t of [-a.rMerid, a.rMerid]) {
    const q = axPoint(a.ringC, t);
    for (const key of [...p.cells.keys()]) {
      const [x, y, z] = key.split(',').map(Number);
      if (Math.hypot(x - q[0], y - q[1], z - q[2]) < 2.3) p.cells.delete(key);
    }
  }
  return p;
}

export function buildTube() {
  const p = P('tube');
  const a = L.arm;
  for (let s = -a.tubeHalf; s <= a.tubeHalf; s++) {
    const q = axPoint(a.ringC, s);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) < 2) continue;
          set(p, Math.round(q[0] + dx), Math.round(q[1] + dy), Math.round(q[2] + dz),
            Math.abs(s) === a.tubeHalf ? PI.gold : PI.bronze);
        }
  }
  return p;
}

export function buildSanchen() {
  const p = P('sanchen', 'sanchen');
  const a = L.arm;
  const e2b = [
    E2[0] * Math.cos(0.409) + AXU[0] * Math.sin(0.409),
    E2[1] * Math.cos(0.409) + AXU[1] * Math.sin(0.409),
    E2[2] * Math.cos(0.409) + AXU[2] * Math.sin(0.409),
  ];
  ringPlane(p, a.ringC, a.rEq, E1, E2, PI.bronzeG, true);
  ringPlane(p, a.ringC, a.rEcl, E1, e2b, PI.gold, true);
  const e2c = [
    e2b[0] * Math.cos(0.089) + AXU[0] * Math.sin(0.089),
    e2b[1] * Math.cos(0.089) + AXU[1] * Math.sin(0.089),
    e2b[2] * Math.cos(0.089) + AXU[2] * Math.sin(0.089),
  ];
  ringPlane(p, a.ringC, a.rLuna, E1, e2c, PI.bronze, false);
  const hC = axPoint(a.ringC, L.gearH.axisT);
  ringPlane(p, hC, L.gearH.r, E1, E2, PI.bronze, true);
  for (let i = 0; i < 36; i++) {
    const ang = i / 36 * Math.PI * 2;
    const d = [Math.cos(ang) * E1[0] + Math.sin(ang) * E2[0],
      Math.cos(ang) * E1[1] + Math.sin(ang) * E2[1],
      Math.cos(ang) * E1[2] + Math.sin(ang) * E2[2]];
    set(p, Math.round(hC[0] + (L.gearH.r + 1) * d[0]),
      Math.round(hC[1] + (L.gearH.r + 1) * d[1]),
      Math.round(hC[2] + (L.gearH.r + 1) * d[2]), PI.bronze);
  }
  for (const t of [8, 9, 10, 11]) {
    for (const s of [t, -t]) {
      const q = axPoint(a.ringC, s);
      for (const [i, j] of [[3, 3], [3, -3], [-3, 3], [-3, -3]])
        set(p, Math.round(q[0] + i * E1[0] + j * E2[0]),
          Math.round(q[1] + i * E1[1] + j * E2[1]),
          Math.round(q[2] + i * E1[2] + j * E2[2]), Math.abs(s) === 12 ? PI.gold : PI.bronze);
    }
  }
  return p;
}

export function buildSiyou() {
  const p = P('siyou', 'siyou');
  const a = L.arm;
  ringDouble(p, a.ringC, a.rTour, E1, AXU, PI.bronze);
  for (let i = 0; i < 8; i++) {
    if (i === 2 || i === 6) continue;
    const ang = i / 8 * Math.PI * 2;
    const d = [Math.cos(ang) * E1[0] + Math.sin(ang) * AXU[0],
      Math.cos(ang) * E1[1] + Math.sin(ang) * AXU[1],
      Math.cos(ang) * E1[2] + Math.sin(ang) * AXU[2]];
    set(p, Math.round(a.ringC[0] + (a.rTour - 2) * d[0]),
      Math.round(a.ringC[1] + (a.rTour - 2) * d[1]),
      Math.round(a.ringC[2] + (a.rTour - 2) * d[2]), PI.gold);
  }
  return p;
}

export function buildGlobe() {
  const p = P('globe', 'globe');
  const g = L.globe;
  const r = g.r;
  for (let x = -r - 1; x <= r + 1; x++)
    for (let y = -r - 1; y <= r + 1; y++)
      for (let z = -r - 1; z <= r + 1; z++) {
        const d = Math.hypot(x, y, z);
        if (d < r - 1.6 || d > r) continue;
        set(p, g.c[0] + x, g.c[1] + y, g.c[2] + z, (x + y + z) % 4 === 0 ? PI.star : PI.sky);
      }
  for (const [ra, dec, mag] of STARS) {
    const s = starDirAt(ra, dec);
    for (let k = 0; k < mag; k++)
      set(p, Math.round(g.c[0] + (r + 0.5 + k * 0.9) * s[0]),
        Math.round(g.c[1] + (r + 0.5 + k * 0.9) * s[1]),
        Math.round(g.c[2] + (r + 0.5 + k * 0.9) * s[2]),
        mag >= 3 ? PI.starHi : PI.star);
  }
  ringPlane(p, g.c, r - 0.6, E1, E2, PI.bronze, false);
  const e2b = [
    E2[0] * Math.cos(0.409) + AXU[0] * Math.sin(0.409),
    E2[1] * Math.cos(0.409) + AXU[1] * Math.sin(0.409),
    E2[2] * Math.cos(0.409) + AXU[2] * Math.sin(0.409),
  ];
  ringPlane(p, g.c, r - 0.9, E1, e2b, PI.gold, false);
  const fC = [g.c[0] - AXU[0] * 8, g.c[1] - AXU[1] * 8, g.c[2] - AXU[2] * 8];
  ringPlane(p, fC, L.globeDrive.tiltR, E1, E2, PI.bronze, true);
  return p;
}

function starDirAt(raH, dec) {
  const ang = raH / 24 * Math.PI * 2;
  const d = dec / 180 * Math.PI;
  const cd = Math.cos(d);
  return [
    cd * Math.cos(ang) * E1[0] + cd * Math.sin(ang) * E2[0] + Math.sin(d) * AXU[0],
    cd * Math.cos(ang) * E1[1] + cd * Math.sin(ang) * E2[1] + Math.sin(d) * AXU[1],
    cd * Math.cos(ang) * E1[2] + cd * Math.sin(ang) * E2[2] + Math.sin(d) * AXU[2],
  ];
}

export function buildGlobeStand() {
  const p = P('globeStand');
  bx(p, 3, 4, 81, 85, 4, 6, PI.woodD);
  bx(p, -4, -3, 81, 85, 4, 6, PI.woodD);
  bx(p, -2, 2, 80, 80, 5, 5, PI.bronze);
  return p;
}

export function buildWater() {
  const p = P('water');
  const b = L.basin;
  bx(p, b.x[0], b.x[1], b.y[0], b.y[0], b.z[0], b.z[1], PI.stoneD);
  for (const s of [b.x[0], b.x[1]])
    for (let y = b.y[0] + 1; y <= b.y[1]; y++)
      bx(p, s, s, y, y, b.z[0], b.z[1], PI.stoneD);
  for (let z = b.z[0]; z <= b.z[1]; z++)
    for (let x = b.x[0]; x <= b.x[1]; x++) {
      if (z === b.z[1] && Math.abs(x - 7) <= 5) continue;
      for (let y = b.y[0] + 1; y <= b.y[1]; y++) set(p, x, y, z, PI.stoneD);
    }
  for (let x = b.x[0] + 1; x < b.x[1]; x++)
    for (let z = b.z[0] + 1; z < b.z[1]; z++) {
      if (z === b.z[1] && Math.abs(x - 7) <= 5) continue;
      if (z >= -23 && z <= -21 && Math.hypot(x - 7, 6) < 5.5) continue;
      for (let y = b.y[0] + 1; y <= b.water; y++) set(p, x, y, z, y % 2 ? PI.water : PI.waterD);
    }
  const ch = L.channel;
  bx(p, ch.seg1[0], ch.seg1[1], ch.y, ch.y + 1, ch.seg1[2], ch.seg1[3], PI.stoneD);
  bx(p, ch.seg2[0], ch.seg2[1], ch.y, ch.y + 1, ch.seg2[2], ch.seg2[3], PI.stoneD);
  bx(p, ch.seg3[0], ch.seg3[1], ch.y, ch.y + 1, ch.seg3[2], ch.seg3[3], PI.stoneD);
  for (let x = ch.seg1[0]; x <= ch.seg1[1]; x++)
    for (let z = ch.seg1[2]; z <= ch.seg1[3]; z++)
      if (Math.hypot(x - 10, 26) > 15) set(p, x, ch.y + 2, z, PI.water);
  for (let x = ch.seg2[0]; x <= ch.seg2[1]; x++)
    for (let z = ch.seg2[2]; z <= ch.seg2[3]; z++) set(p, x, ch.y + 2, z, PI.water);
  for (let x = ch.seg3[0]; x <= ch.seg3[1]; x++)
    for (let z = ch.seg3[2]; z <= ch.seg3[3]; z++) set(p, x, ch.y + 2, z, PI.water);
  const t = L.tank;
  bx(p, t.x[0], t.x[1], t.y[0], t.y[1], t.z[0], t.z[1], PI.bronze);
  for (let x = t.x[0] + 1; x < t.x[1]; x++)
    for (let y = t.y[0] + 1; y <= t.water; y++)
      for (let z = t.z[0] + 1; z < t.z[1]; z++) set(p, x, y, z, PI.water);
  const pot = L.pot;
  for (let x = pot.x[0]; x <= pot.x[1]; x++)
    for (let y = pot.y[0]; y <= pot.y[1]; y++)
      for (let z = pot.z[0]; z <= pot.z[1]; z++) {
        if (y === pot.y[0] && x >= 9 && x <= 11 && z >= -15 && z <= -13) continue;
        set(p, x, y, z, PI.bronze);
      }
  for (let x = pot.x[0] + 1; x < pot.x[1]; x++)
    for (let y = pot.y[0] + 1; y <= pot.water; y++)
      for (let z = pot.z[0] + 1; z < pot.z[1]; z++) set(p, x, y, z, PI.water);
  set(p, 10, pot.y[0], -14, PI.gold);
  set(p, 11, pot.y[0], -14, PI.gold);
  bx(p, 6, 8, L.pipeY - 1, L.pipeY, -19, -9, PI.bronze);
  bx(p, 7, 13, L.pipeY - 1, L.pipeY, -13, -11, PI.bronze);
  bx(p, 10, 12, L.pipeY - 2, L.pipeY - 1, -13, -11, PI.bronze);
  return p;
}

export function buildWheel() {
  const p = P('wheel', 'wheel');
  const w = L.wheel;
  const steps = 190;
  for (let i = 0; i < steps; i++) {
    const a = i / steps * Math.PI * 2;
    const cx = Math.cos(a), sy = Math.sin(a);
    for (let rr = w.rimIn; rr <= w.rimOut; rr++)
      for (let z = -10; z <= -6; z++)
        set(p, Math.round(w.cx + rr * cx), Math.round(w.cy + rr * sy), w.cz + z,
          (i % 13 < 4) ? PI.woodD : PI.wood);
  }
  for (const sp of w.spokes) {
    const a = sp / 180 * Math.PI;
    for (let rr = 3; rr <= w.rimIn; rr++)
      for (let z = -9; z <= -7; z++)
        set(p, Math.round(w.cx + rr * Math.cos(a)), Math.round(w.cy + rr * Math.sin(a)), w.cz + z,
          Math.round(rr) % 4 === 0 ? PI.gold : PI.wood);
  }
  for (let x = -3; x <= 3; x++)
    for (let y = -3; y <= 3; y++)
      if (Math.hypot(x, y) <= 3.4)
        for (let z = -10; z <= -6; z++)
          set(p, w.cx + x, w.cy + y, w.cz + z, PI.iron);
  bx(p, w.cx - 1, w.cx + 1, w.cy - 1, w.cy + 1, w.axleZ[0], w.axleZ[1], PI.wood);
  set(p, w.cx - 1, w.cy - 1, w.axleZ[0] - 1, PI.iron);
  set(p, w.cx + 1, w.cy + 1, w.axleZ[1] + 1, PI.iron);
  for (let k = 0; k < w.scoops; k++) {
    const a = k / w.scoops * Math.PI * 2;
    const cx = Math.cos(a), sy = Math.sin(a);
    const tx = -sy, ty = cx;
    const base = [w.cx + 15 * cx, w.cy + 15 * sy];
    for (let rr = 0; rr <= 1; rr++)
      for (let tt = -2; tt <= 2; tt++)
        for (let z = -8; z <= -5; z++)
          set(p, Math.round(base[0] + rr * cx + tt * tx), Math.round(base[1] + rr * sy + tt * ty), w.cz + z, PI.bronze);
    for (let rr = 0; rr <= 4; rr++)
      for (let z = -8; z <= -5; z++) {
        set(p, Math.round(base[0] + rr * cx + 2 * tx), Math.round(base[1] + rr * sy + 2 * ty), w.cz + z, PI.bronze);
        set(p, Math.round(base[0] + rr * cx - 2 * tx), Math.round(base[1] + rr * sy - 2 * ty), w.cz + z, PI.bronze);
      }
  }
  const A = L.gearA;
  for (let x = -6; x <= 6; x++)
    for (let y = -6; y <= 6; y++) {
      const d = Math.hypot(x, y);
      if (d > A.r) continue;
      for (let z = 1; z <= 3; z++) set(p, A.c[0] + x, A.c[1] + y, A.c[2] - 1 + z, PI.bronze);
    }
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    for (let rr = A.r + 0.5; rr <= A.r + 1.5; rr++)
      for (let z = 1; z <= 3; z++)
        set(p, Math.round(A.c[0] + rr * Math.cos(a)), Math.round(A.c[1] + rr * Math.sin(a)), A.c[2] - 1 + z, PI.bronze);
  }
  const P2 = L.gearP2;
  for (let x = -6; x <= 6; x++)
    for (let y = -6; y <= 6; y++) {
      const d = Math.hypot(x, y);
      if (d > P2.r) continue;
      for (let z = -19; z <= -17; z++) set(p, P2.c[0] + x, P2.c[1] + y, z, PI.bronze);
    }
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * Math.PI * 2;
    for (let rr = P2.r + 0.5; rr <= P2.r + 1.2; rr++)
      for (let z = -19; z <= -17; z++)
        set(p, Math.round(P2.c[0] + rr * Math.cos(a)), Math.round(P2.c[1] + rr * Math.sin(a)), z, PI.bronze);
  }
  return p;
}

export function buildScoopWater(fill, phase) {
  const p = P('scoopWater', 'wheel');
  const w = L.wheel;
  const a = phase;
  const cx = Math.cos(a), sy = Math.sin(a);
  const tx = -sy, ty = cx;
  const base = [w.cx + 15 * cx, w.cy + 15 * sy];
  for (let lvl = 0; lvl < fill; lvl++)
    for (let tt = -1; tt <= 1; tt++)
      for (let z = -7; z <= -6; z++)
        set(p, Math.round(base[0] + (2 + lvl) * cx + tt * tx),
          Math.round(base[1] + (2 + lvl) * sy + tt * ty), w.cz + z,
          lvl % 2 ? PI.waterL : PI.water);
  return p;
}

export function buildLever() {
  const p = P('lever', 'lever');
  const v = L.lever;
  bx(p, v.beamX[0], v.beamX[1], v.y, v.y + 1, -20, -18, PI.wood);
  bx(p, 27, 29, 40, 48, -20, -18, PI.vermD);
  bx(p, 25, 27, v.y + 2, v.y + 3, -20, -18, PI.bronze);
  bx(p, 10, 12, 41, 46, -17, -15, PI.iron);
  set(p, 11, 40, -16, PI.iron);
  return p;
}

export function buildColumn() {
  const p = P('column', 'column');
  bx(p, -1, 1, L.column.y0, L.column.y1, -1, 1, PI.verm);
  for (let y = L.column.y0; y <= 96; y += 8) {
    bx(p, -2, 2, y, y + 1, -2, 2, PI.vermD);
  }
  for (let i = 0; i < L.camY.length; i++) {
    const y = L.camY[i];
    for (let x = -7; x <= 7; x++)
      for (let z = -7; z <= 7; z++) {
        const d = Math.hypot(x, z);
        if (d > L.camR) continue;
        for (let yy = y - 1; yy <= y + 1; yy++) set(p, x, yy, z, d > 3 ? PI.wood : PI.iron);
      }
    const vis = [44, 24, 2, 5, 20][i];
    for (let k = 0; k < vis; k++) {
      const a = k / vis * Math.PI * 2;
      for (let rr = L.camR + 0.5; rr <= L.camR + 1.5; rr++)
        for (let yy = y - 1; yy <= y + 1; yy++)
          set(p, Math.round(rr * Math.cos(a)), yy, Math.round(rr * Math.sin(a)), PI.bronze);
    }
  }
  const B = L.gearB;
  for (let x = -7; x <= 7; x++)
    for (let z = -7; z <= 7; z++) {
      const d = Math.hypot(x, z);
      if (d > B.r) continue;
      for (let y = B.c[1] - 1; y <= B.c[1] + 1; y++) set(p, x, y, z, PI.bronze);
    }
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2;
    for (let rr = B.r + 0.5; rr <= B.r + 1.5; rr++)
      for (let y = B.c[1] - 1; y <= B.c[1] + 1; y++)
        set(p, Math.round(rr * Math.cos(a)), y, Math.round(rr * Math.sin(a)), PI.bronze);
  }
  const gd = L.globeDrive;
  for (let y = gd.armY0; y <= gd.armY1; y++)
    bx(p, -1, 1, y, y, Math.round((y - gd.armY0) / (gd.armY1 - gd.armY0) * gd.armZ) - 1,
      Math.round((y - gd.armY0) / (gd.armY1 - gd.armY0) * gd.armZ) + 1, PI.wood);
  ringPlane(p, [0, gd.armY1, gd.armZ], gd.r, [1, 0, 0], [0, 0, 1], PI.bronze, true);
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    for (let rr = gd.r + 0.5; rr <= gd.r + 1.3; rr++)
      for (let y = gd.armY1 - 1; y <= gd.armY1 + 1; y++)
        set(p, Math.round(rr * Math.cos(a)), y, Math.round(gd.armZ + rr * Math.sin(a)), PI.bronze);
  }
  const ta = L.topArm;
  for (const sx of [1, -1]) {
    bx(p, sx * 2, sx * 3, 103, 106, 1, 3, PI.wood);
  }
  bx(p, -3, 3, 103, 103, 3, 9, PI.wood);
  const G2 = L.gearG2;
  for (let x = -5; x <= 5; x++)
    for (let z = 0; z <= 14; z++) {
      const d = Math.hypot(x, z - G2.c[2]);
      if (d > G2.r) continue;
      for (let y = G2.c[1] - 1; y <= G2.c[1] + 1; y++) set(p, x, y, z, PI.bronze);
    }
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    for (let rr = G2.r + 0.5; rr <= G2.r + 1.3; rr++)
      for (let y = G2.c[1] - 1; y <= G2.c[1] + 1; y++)
        set(p, Math.round(rr * Math.cos(a)), y, Math.round(G2.c[2] + rr * Math.sin(a)), PI.bronze);
  }
  return p;
}

export function buildChainStatic() {
  const p = P('chainStatic');
  const c = L.chain;
  for (const sx of [c.cx - c.r + 1, c.cx + c.r - 1])
    for (let y = c.bottom[1] + 6; y <= c.top[1] - 5; y++)
      for (let z = c.zc - 1; z <= c.zc + 1; z++)
        bx(p, sx - 1, sx + 1, y, y, z, z, y % 2 ? PI.iron : PI.woodD);
  const tc = c.top;
  bx(p, tc[0] - 1, tc[0] + 1, tc[1] - 1, tc[1] + 1, tc[2] - 6, tc[2] - 3, PI.woodD);
  return p;
}

export function buildChainWheel1() {
  const p = P('chainWheel1', 'chain');
  const c = L.chain;
  bx(p, c.cx - 1, c.cx + 1, c.bottom[1] - 1, c.bottom[1] + 1, c.axleZ[0], c.axleZ[1], PI.wood);
  const W = L.gearW;
  for (let x = -7; x <= 7; x++)
    for (let y = -7; y <= 7; y++) {
      const d = Math.hypot(x, y);
      if (d > W.r) continue;
      for (let z = W.c[2] - 1; z <= W.c[2] + 1; z++)
        set(p, W.c[0] + x, W.c[1] + y, z, PI.bronze);
    }
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    for (let rr = W.r + 0.5; rr <= W.r + 1.5; rr++)
      for (let z = W.c[2] - 1; z <= W.c[2] + 1; z++)
        set(p, Math.round(W.c[0] + rr * Math.cos(a)), Math.round(W.c[1] + rr * Math.sin(a)), z, PI.bronze);
  }
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    for (let rr = c.r - 1; rr <= c.r; rr++)
      for (let z = c.zc - 1; z <= c.zc + 1; z++)
        set(p, Math.round(c.cx + rr * Math.cos(a)), Math.round(c.bottom[1] + rr * Math.sin(a)), z, PI.bronze);
  }
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + 0.5;
    for (let rr = 0; rr <= c.r - 1; rr++)
      set(p, Math.round(c.cx + rr * Math.cos(a)), Math.round(c.bottom[1] + rr * Math.sin(a)), c.zc, PI.wood);
  }
  return p;
}

export function buildChainWheel2() {
  const p = P('chainWheel2', 'chain');
  const c = L.chain;
  const tc = c.top;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    for (let rr = c.r - 1; rr <= c.r + 0.5; rr++)
      for (let z = c.zc - 1; z <= c.zc + 1; z++)
        set(p, Math.round(tc[0] + rr * Math.cos(a)), Math.round(tc[1] + rr * Math.sin(a)), z, PI.bronze);
  }
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + 0.9;
    for (let rr = 0; rr <= c.r - 1; rr++)
      set(p, Math.round(tc[0] + rr * Math.cos(a)), Math.round(tc[1] + rr * Math.sin(a)), c.zc, PI.wood);
  }
  return p;
}

export function buildBucket(idx) {
  const p = P('bucket' + idx, 'bucket');
  const c = L.chain;
  const s = (idx / c.buckets) * 2 * Math.PI;
  bx(p, -1, 1, -1, 1, -1, 0, PI.bronze);
  for (let x = -1; x <= 1; x++)
    for (let z = -1; z <= 0; z++)
      for (let y = -1; y <= 1; y++)
        if (Math.abs(x) === 1 || y === -1 || y === 1)
          set(p, x, y, z, PI.bronze);
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 0; z++)
        if (Math.abs(x) < 1 && Math.abs(y) < 1) set(p, x, y, z, PI.water);
  return p;
}

export function bucketPath(s) {
  const c = L.chain;
  const off = c.bucketOffset;
  const C1 = c.bottom, C2 = c.top;
  const strandLen = C2[1] - C1[1];
  const arcLen = Math.PI * off;
  const per = 2 * (strandLen + arcLen);
  s = ((s % per) + per) % per;
  if (s < strandLen) return [C1[0] + off, C1[1] + s, C1[2]];
  s -= strandLen;
  if (s < arcLen) {
    const phi = s / off;
    return [C2[0] + off * Math.cos(phi), C2[1] + off * Math.sin(phi), C2[2]];
  }
  s -= arcLen;
  if (s < strandLen) return [C1[0] - off, C2[1] - s, C1[2]];
  s -= strandLen;
  const phi = Math.PI + s / off;
  return [C1[0] + off * Math.cos(phi), C1[1] + off * Math.sin(phi), C1[2]];
}

export function buildSlider(i) {
  const p = P('slider' + i, 'slider');
  const row = L.doorRows[i];
  for (let zz = L.slider.zCam; zz <= L.slider.zDoor; zz++)
    bx(p, -1, 1, row, row + 1, zz, zz, zz % 3 === 0 ? PI.woodD : PI.wood);
  const y = row + 2;
  const robe = i % 2 ? PI.robe : PI.robe2;
  for (let dy = 0; dy <= 2; dy++)
    for (let dx = -1; dx <= 1; dx++)
      set(p, dx, y + dy, L.slider.zDoor, dy === 0 ? robe : robe);
  set(p, 0, y + 3, L.slider.zDoor, robe);
  bx(p, -1, 0, y + 3, y + 3, L.slider.zDoor, L.slider.zDoor, PI.gold);
  set(p, 0, y + 4, L.slider.zDoor, PI.gold);
  set(p, 2, y + 1, L.slider.zDoor, robe);
  set(p, -2, y + 1, L.slider.zDoor, robe);
  const prop = [PI.gold, PI.wall, PI.bronze, PI.woodD, PI.bronzeG][i];
  bx(p, 1, 2, y + 2, y + 3, L.slider.zDoor, L.slider.zDoor, prop);
  return p;
}

export function buildDoor(i) {
  const p = P('door' + i, 'door');
  const row = L.doorRows[i];
  for (let x = -4; x <= 4; x++)
    for (let y = row; y <= row + 5; y++) {
      let c = PI.verm;
      if (y === row || y === row + 5) c = PI.vermD;
      if ((x + 4) % 3 === 1 && y > row && y < row + 5) c = PI.gold;
      set(p, x, y, 29, c);
    }
  return p;
}

export function buildAll() {
  return [
    buildCourt(), buildBase(), buildTower(),
    buildArmillary(), buildTube(), buildSanchen(), buildSiyou(),
    buildGlobe(), buildGlobeStand(),
    buildWater(), buildWheel(), buildLever(), buildColumn(),
    buildChainStatic(), buildChainWheel1(), buildChainWheel2(),
    buildSlider(0), buildSlider(1), buildSlider(2), buildSlider(3), buildSlider(4),
    buildDoor(0), buildDoor(1), buildDoor(2), buildDoor(3), buildDoor(4),
    buildScoopWater(0, Math.PI / 2),
    ...Array.from({ length: L.chain.buckets }, (_, i) => buildBucket(i)),
  ];
}
