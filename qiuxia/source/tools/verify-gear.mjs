// Numerically verify Walschaerts LUT closure at all 360 crank angles.
import { buildLUT } from '../src/build/locomotive.js';

const MAIN_X = 46, CRANK_R = 2.6, DRIVER_R = 5.5, CROSS_Y = 6, MAIN_ROD_L = 29;
const ECC_R = 1.5, TRUNNION = [33, 11], LINK_HALF = 3.6, ECC_ROD_L = 14.0;
const UNION_L = 6.8, RADIUS_L = 16, VALVE_Y = 9;

function circleIntersect(c0, r0, c1, r1, branch = 1) {
  const dx = c1[0] - c0[0], dy = c1[1] - c0[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = c0[0] + (a * dx) / d, my = c0[1] + (a * dy) / d;
  return [mx + (branch * h * -dy) / d, my + (branch * h * dx) / d];
}
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];

const lut = buildLUT();
let worst = { by: 0, union: 0, radius: 0, ecc: 0, main: 0, psi: 0 };
let fails = 0;
for (let i = 0; i < 360; i++) {
  const th = (i / 360) * Math.PI * 2;
  const o = i * 12;
  const [crossX, , , phi, dieX, dieY, , psi, Bx] = lut.slice(o, o + 12);
  const cx = lut[o + 10], cy = lut[o + 11];
  // main rod length
  const mainErr = Math.abs(Math.hypot(cx - crossX, cy - CROSS_Y) - MAIN_ROD_L);
  // eccentric rod to link bottom
  const ex = cx + ECC_R * Math.cos(th + Math.PI / 2);
  const ey = cy + ECC_R * Math.sin(th + Math.PI / 2);
  const lb = [TRUNNION[0] + LINK_HALF * Math.sin(phi), TRUNNION[1] - LINK_HALF * Math.cos(phi)];
  const eccErr = Math.abs(Math.hypot(lb[0] - ex, lb[1] - ey) - ECC_ROD_L);
  // combination lever closure
  const U = [crossX, CROSS_Y - 1.6];
  const rm = rot([0, 2.2], psi), rp = rot([0, 4.4], psi);
  const B = circleIntersect([U[0] - rm[0], U[1] - rm[1]], UNION_L, [dieX - rp[0], dieY - rp[1]], RADIUS_L, 1);
  const byErr = Math.abs(B[1] - VALVE_Y);
  const Mp = [B[0] + rm[0], B[1] + rm[1]];
  const Pp = [B[0] + rp[0], B[1] + rp[1]];
  const unionErr = Math.abs(Math.hypot(Mp[0] - U[0], Mp[1] - U[1]) - UNION_L);
  const radiusErr = Math.abs(Math.hypot(Pp[0] - dieX, Pp[1] - dieY) - RADIUS_L);
  worst.by = Math.max(worst.by, byErr);
  worst.union = Math.max(worst.union, unionErr);
  worst.radius = Math.max(worst.radius, radiusErr);
  worst.ecc = Math.max(worst.ecc, eccErr);
  worst.main = Math.max(worst.main, mainErr);
  worst.psi = Math.max(worst.psi, Math.abs(psi));
  if (byErr > 0.05 || unionErr > 0.05 || radiusErr > 0.05 || eccErr > 0.05 || mainErr > 0.05) {
    fails++;
    if (fails <= 5) console.log(`FAIL i=${i} by=${byErr.toFixed(3)} union=${unionErr.toFixed(3)} radius=${radiusErr.toFixed(3)} ecc=${eccErr.toFixed(3)} main=${mainErr.toFixed(3)} psi=${psi.toFixed(3)} Bx=${Bx.toFixed(2)}`);
  }
}
console.log('worst errors:', Object.fromEntries(Object.entries(worst).map(([k, v]) => [k, +v.toFixed(4)])));
console.log(fails === 0 ? 'PASS: all 360 samples close within 0.05 voxel' : `FAIL: ${fails}/360 samples`);
process.exit(fails === 0 ? 0 : 1);