// QJ-class (前进) 2-10-2 steam locomotive + tender, proportioned from the real
// photograph. Moving gear is driven by a precomputed Walschaerts kinematic table.

import * as THREE from 'three';
import { World } from '../core/world.js';
import { meshWorld } from '../core/mesher.js';
import { M } from '../core/palette.js';
import { mulberry32, clamp } from '../core/rng.js';

const Z = (v) => v + 12;           // signed local z -> array index
const DRIVER_R = 5.5;
const CRANK_R = 2.6;
const DRIVER_X = [22, 34, 46, 58, 70];
const MAIN_X = 46;
const CROSS_Y = 6;
const MAIN_ROD_L = 29;
const ECC_R = 1.5;
const TRUNNION = [33, 11];
const LINK_HALF = 3.6;
const ECC_ROD_L = 14.0;
const UNION_L = 6.8;
const RADIUS_L = 16.0;
const VALVE_Y = 9;

function circleIntersect(c0, r0, c1, r1, branch = 1) {
  const dx = c1[0] - c0[0], dy = c1[1] - c0[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h2 = r0 * r0 - a * a;
  const h = Math.sqrt(Math.max(0, h2));
  const mx = c0[0] + (a * dx) / d, my = c0[1] + (a * dy) / d;
  return [mx + (branch * h * -dy) / d, my + (branch * h * dx) / d];
}

function buildLUT() {
  const N = 360;
  const lut = new Float32Array(N * 12);
  let psiPrev = 0;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const cx = MAIN_X + CRANK_R * Math.cos(th);
    const cy = DRIVER_R + CRANK_R * Math.sin(th);
    const dy = cy - CROSS_Y;
    const crossX = cx - Math.sqrt(Math.max(1, MAIN_ROD_L * MAIN_ROD_L - dy * dy));
    const mainAng = Math.atan2(cy - CROSS_Y, cx - crossX);
    const ex = cx + ECC_R * Math.cos(th + Math.PI / 2);
    const ey = cy + ECC_R * Math.sin(th + Math.PI / 2);
    // expansion link angle
    const Ax = ex - TRUNNION[0], Ay = ey - TRUNNION[1];
    const R = Math.hypot(Ax, Ay) || 1e-6;
    const delta = Math.atan2(Ay, Ax);
    const C = (LINK_HALF * LINK_HALF + R * R - ECC_ROD_L * ECC_ROD_L) / (2 * LINK_HALF);
    const phi = delta + Math.asin(clamp(C / R, -1, 1));
    const eccAng = Math.atan2(TRUNNION[1] - LINK_HALF * Math.cos(phi) - ey, TRUNNION[0] + LINK_HALF * Math.sin(phi) - ex);
    const dieF = 0.62;
    const dl = -LINK_HALF + dieF * 2 * LINK_HALF;
    const die = [TRUNNION[0] - dl * Math.sin(phi), TRUNNION[1] + dl * Math.cos(phi)];
    // combination lever: solve psi so that bottom pin y == VALVE_Y
    const U = [crossX, CROSS_Y - 1.6];
    const vm = [0, 2.2], vp = [0, 4.4];
    const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
    const bottomFor = (psi) => {
      const rm = rot(vm, psi), rp = rot(vp, psi);
      const c0 = [U[0] - rm[0], U[1] - rm[1]];
      const c1 = [die[0] - rp[0], die[1] - rp[1]];
      return circleIntersect(c0, UNION_L, c1, RADIUS_L, 1);
    };
    let lo = -1.0, hi = 1.0;
    let psi = psiPrev;
    for (let k = 0; k < 40; k++) {
      const b = bottomFor(psi);
      const g = b[1] - VALVE_Y;
      if (Math.abs(g) < 1e-5) break;
      const b2 = bottomFor(psi + 0.01);
      const g2 = b2[1] - VALVE_Y;
      const dg = (g2 - g) / 0.01 || 1e-6;
      psi = clamp(psi - g / dg, lo, hi);
    }
    psiPrev = psi;
    const B = bottomFor(psi);
    const rm = rot(vm, psi), rp = rot(vp, psi);
    const Mp = [B[0] + rm[0], B[1] + rm[1]];
    const Pp = [B[0] + rp[0], B[1] + rp[1]];
    const o = i * 12;
    lut[o] = crossX; lut[o + 1] = mainAng; lut[o + 2] = eccAng; lut[o + 3] = phi;
    lut[o + 4] = die[0]; lut[o + 5] = die[1];
    lut[o + 6] = Math.atan2(Pp[1] - die[1], Pp[0] - die[0]);
    lut[o + 7] = psi; lut[o + 8] = B[0];
    lut[o + 9] = Math.atan2(Mp[1] - U[1], Mp[0] - U[0]);
    lut[o + 10] = cx; lut[o + 11] = cy;
  }
  return lut;
}

function sampleLUT(lut, th) {
  const N = 360;
  let a = ((th % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const f = (a / (Math.PI * 2)) * N;
  const i0 = Math.floor(f) % N, i1 = (i0 + 1) % N, t = f - Math.floor(f);
  const out = new Array(12);
  for (let k = 0; k < 12; k++) {
    let v0 = lut[i0 * 12 + k], v1 = lut[i1 * 12 + k];
    if (k === 1 || k === 2 || k === 3 || k === 6 || k === 7 || k === 9) {
      while (v1 - v0 > Math.PI) v1 -= Math.PI * 2;
      while (v1 - v0 < -Math.PI) v1 += Math.PI * 2;
    }
    out[k] = v0 + (v1 - v0) * t;
  }
  return out;
}

// ---------- static body ----------
function buildBody() {
  const w = new World(100, 40, 24);

  // pilot / cowcatcher + buffer beam
  for (let i = 0; i < 5; i++) {
    const x = i;
    const yTop = 4 - Math.floor(i * 0.6);
    for (let z = -8; z <= 8; z += 2) w.line(x, 1, Z(z), x + 1, yTop, Z(z), M.LOCO_RED);
  }
  w.box(2, 4, Z(-9), 4, 7, Z(9), M.LOCO_RED);
  w.box(0, 5, Z(-1), 2, 6, Z(1), M.ROD_D);
  w.box(2, 5, Z(-7), 3, 6, Z(-5), M.ROD_D);
  w.box(2, 5, Z(5), 3, 6, Z(7), M.ROD_D);

  // smokebox + boiler
  w.cylX(17, 0, 7, 4, 26, M.SMOKEBOX);
  w.cylX(17, 0, 7.2, 26, 70, M.BOILER);
  // smokebox front door
  w.cylX(17, 0, 6.4, 3, 4, M.SMOKEBOX_D);
  w.cylX(17, 0, 2.2, 2, 3, M.SMOKEBOX_D);
  w.set(2, 17, Z(0), M.BRASS);
  // boiler bands + washout plugs
  for (const x of [32, 42, 52, 62]) w.cylX(17, 0, 7.3, x, x, M.LOCO_BLACK2);
  for (let x = 30; x <= 68; x += 6) { w.set(x, 12, Z(-6), M.BRASS); w.set(x, 12, Z(6), M.BRASS); }
  // white lining along boiler side
  for (let x = 27; x <= 69; x++) { w.set(x, 20, Z(-7), M.LINING); w.set(x, 20, Z(7), M.LINING); }

  // chimney
  w.cylY(10, 0, 2.4, 23, 30, M.SMOKEBOX);
  w.cylY(10, 0, 3.0, 30, 31, M.SMOKEBOX_D);
  w.cylY(10, 0, 2.0, 31, 32, M.LOCO_BLACK);
  // steam dome + sandbox
  w.sphere(40, 24, 0, 3.2, M.BOILER);
  w.cylY(40, 0, 2.6, 24, 27, M.BOILER);
  w.cylY(40, 0, 2.9, 27, 27, M.BRASS);
  w.cylY(52, 0, 2.6, 23, 26, M.BOILER);
  w.cylY(52, 0, 2.8, 26, 26, M.LOCO_BLACK2);
  // safety valves
  w.cylY(64, 0, 1.2, 24, 27, M.BRASS);
  w.set(64, 28, Z(0), M.BRASS);

  // headlight
  w.box(5, 25, Z(-1), 7, 27, Z(1), M.LOCO_BLACK2);
  w.box(4, 25, Z(-1), 4, 27, Z(1), M.HEADLIGHT);
  // number plate on smokebox side
  w.box(8, 15, Z(-8), 14, 18, Z(-8), M.PLATE);
  w.box(8, 15, Z(8), 14, 18, Z(8), M.PLATE);

  // running boards + handrails
  for (let x = 5; x <= 70; x++) {
    w.set(x, 9, Z(-8), M.LOCO_BLACK2); w.set(x, 9, Z(-9), M.LOCO_BLACK2);
    w.set(x, 9, Z(8), M.LOCO_BLACK2); w.set(x, 9, Z(9), M.LOCO_BLACK2);
  }
  for (let x = 6; x <= 69; x += 1) { w.set(x, 21, Z(-8), M.LINING); w.set(x, 21, Z(8), M.LINING); }
  for (const x of [8, 20, 32, 44, 56, 68]) { w.set(x, 20, Z(-8), M.LINING); w.set(x, 20, Z(8), M.LINING); }

  // cylinders + steam chests
  for (const s of [-1, 1]) {
    w.box(4, 3, Z(s * 6), 14, 8, Z(s * 9), M.LOCO_BLACK2);
    w.cylX(5.5, s * 7.5, 2.6, 3, 5, M.SMOKEBOX_D);
    w.box(6, 8, Z(s * 6), 12, 9, Z(s * 9), M.LOCO_BLACK);
    w.box(4, 9, Z(s * 6), 14, 10, Z(s * 9), M.LOCO_BLACK2);
  }

  // cab
  for (let x = 70; x <= 94; x++)
    for (let z = -8; z <= 8; z++)
      for (let y = 9; y <= 27; y++) {
        const shell = x === 70 || x === 94 || z === -8 || z === 8;
        if (!shell) continue;
        w.set(x, y, Z(z), M.LOCO_BLACK);
      }
  // cab side windows + front windows
  for (let x = 76; x <= 83; x++)
    for (let y = 18; y <= 23; y++) { w.set(x, y, Z(-8), M.CAB_GLASS); w.set(x, y, Z(8), M.CAB_GLASS); }
  for (let z = -5; z <= -2; z++)
    for (let y = 18; y <= 23; y++) w.set(70, y, Z(z), M.CAB_GLASS);
  for (let z = 2; z <= 5; z++)
    for (let y = 18; y <= 23; y++) w.set(70, y, Z(z), M.CAB_GLASS);
  // cab roof
  for (let x = 68; x <= 97; x++)
    for (let z = -9; z <= 9; z++) w.set(x, 28, Z(z), M.LOCO_BLACK2);
  for (let x = 68; x <= 97; x++) { w.set(x, 29, Z(-9), M.LOCO_BLACK); w.set(x, 29, Z(9), M.LOCO_BLACK); }
  // firebox glow + ashpan
  w.box(78, 10, Z(-2), 84, 13, Z(2), M.FIRE);
  w.box(76, 6, Z(-3), 86, 7, Z(3), M.EMBER);
  // cab rear ladder + handrails
  for (let y = 9; y <= 26; y += 3) w.set(95, y, Z(-6), M.LINING);
  w.line(95, 9, Z(-6), 95, 26, Z(-6), M.LINING);
  w.line(95, 9, Z(6), 95, 26, Z(6), M.LINING);
  // cab side sheets / number
  w.box(86, 14, Z(-8), 92, 17, Z(-8), M.LINING);
  w.box(86, 14, Z(8), 92, 17, Z(8), M.LINING);
  // rear buffer beam
  w.box(94, 4, Z(-9), 96, 7, Z(9), M.LOCO_RED);
  return w;
}

function buildWheel(r, spokes, withCrank) {
  const size = Math.ceil(r * 2) + 4;
  const c = size / 2;
  const w = new World(size, size, 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      if (d > r) continue;
      let id = null;
      if (d > r - 1) id = M.WHEEL_TIRE;
      else if (d > r - 1.9) id = M.WHEEL_RIM;
      else if (d < 1.6) id = M.LOCO_RED;
      else if (spokes) {
        const ang = Math.atan2(y - c, x - c);
        const sector = ((ang / (Math.PI * 2)) * spokes + spokes * 4) % 1;
        if (sector < 0.22 || sector > 0.78) id = M.LOCO_RED;
        else if (withCrank) {
          const opp = Math.cos(ang) < -0.35 && d > r - 3.4;
          if (opp) id = M.LOCO_RED;
        }
      } else id = M.LOCO_RED;
      if (id !== null) { w.set(x, y, 1, id); w.set(x, y, 2, id); }
    }
  if (withCrank) {
    w.box(Math.round(c + CRANK_R) - 1, Math.round(c) - 1, 0, Math.round(c + CRANK_R) + 1, Math.round(c) + 1, 3, M.ROD_D);
  }
  return { w, c };
}

function barWorld(len, hgt, thk, id, eyes = false) {
  const w = new World(len + 4, hgt + 4, thk);
  w.box(2, 2, 0, len + 1, hgt + 1, thk - 1, id);
  if (eyes) {
    w.cylZ(2, 2 + hgt / 2, hgt / 2 + 1, 0, thk - 1, id);
    w.cylZ(len + 1, 2 + hgt / 2, hgt / 2 + 1, 0, thk - 1, id);
  }
  return w;
}


export function buildLocomotive(stage) {
  const lut = buildLUT();
  const root = new THREE.Group();
  root.rotation.y = Math.PI;

  const bodyMeshed = meshWorld(buildBody());
  const body = stage.addMeshed(bodyMeshed, { parent: root, name: 'loco' });
  body.group.position.set(0, 0, -12);

  const parts = { wheels: [], rods: {} };

  // wheels
  const driver = buildWheel(DRIVER_R, 10, true);
  const small = buildWheel(3, 0, false);
  const trailer = buildWheel(3.5, 0, false);
  function wheelMesh(bw, x, y, z, name) {
    const meshed = meshWorld(bw.w);
    const g = stage.addMeshed(meshed, { parent: root, name });
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    g.group.position.set(-bw.c, -bw.c, -2);
    pivot.add(g.group);
    root.add(pivot);
    return pivot;
  }
  for (const x of DRIVER_X)
    for (const s of [-1, 1]) parts.wheels.push({ pivot: wheelMesh(driver, x, DRIVER_R, s * 5, 'driver'), r: DRIVER_R, main: x === MAIN_X, s });
  for (const s of [-1, 1]) parts.wheels.push({ pivot: wheelMesh(small, 8, 3, s * 5, 'leader'), r: 3, s });
  for (const s of [-1, 1]) parts.wheels.push({ pivot: wheelMesh(trailer, 84, 3.5, s * 5, 'trailer'), r: 3.5, s });

  // moving gear, per side
  const gearZ = { '-1': -6.6, '1': 6.6 };
  for (const s of [-1, 1]) {
    const z = gearZ[String(s)];
    const mk = (world, cx, cy, name) => {
      const meshed = meshWorld(world);
      const g = stage.addMeshed(meshed, { parent: root, name });
      const pivot = new THREE.Group();
      g.group.position.set(-cx, -cy, -1);
      pivot.add(g.group);
      root.add(pivot);
      return pivot;
    };
    // side (coupling) rod: spans all drivers, eyes at each crank
    const sr = new World(56, 8, 2);
    sr.box(2, 3, 0, 53, 4, 1, M.ROD);
    for (const dx of [0, 12, 24, 36, 48]) sr.cylZ(2 + dx, 3.5, 2.2, 0, 1, M.ROD_D);
    parts.rods['side' + s] = { pivot: mk(sr, 26, 3.5, 'siderod'), kind: 'side' };
    // main rod
    const mr = barWorld(MAIN_ROD_L, 2, 2, M.ROD, true);
    parts.rods['main' + s] = { pivot: mk(mr, 2, 3, 'mainrod'), kind: 'main' };
    // crosshead + piston rod
    const ch = new World(16, 6, 3);
    ch.box(12, 1, 0, 15, 4, 2, M.ROD_D);
    ch.box(4, 2, 1, 12, 3, 1, M.ROD);
    parts.rods['cross' + s] = { pivot: mk(ch, 14, 2.5, 'crosshead'), kind: 'cross' };
    // eccentric rod
    const er = barWorld(Math.round(ECC_ROD_L), 1, 1, M.ROD_D, true);
    parts.rods['ecc' + s] = { pivot: mk(er, 2, 2.5, 'eccrod'), kind: 'ecc' };
    // expansion link (curved slot)
    const el = new World(8, 12, 2);
    for (let y = 1; y <= 10; y++) {
      const bend = Math.round(Math.sin((y - 5.5) / 5.5 * 1.2) * 1.4);
      el.box(3 + bend, y, 0, 4 + bend, y, 1, M.ROD_D);
    }
    el.box(2, 5, 0, 5, 6, 1, M.ROD);
    parts.rods['link' + s] = { pivot: mk(el, 3.5, 5.5, 'link'), kind: 'link' };
    // radius rod
    const rr = barWorld(Math.round(RADIUS_L), 1, 1, M.ROD, true);
    parts.rods['radius' + s] = { pivot: mk(rr, 2, 2.5, 'radiusrod'), kind: 'radius' };
    // combination lever
    const cl = new World(6, 10, 2);
    cl.box(2, 1, 0, 3, 5, 1, M.ROD_D);
    parts.rods['lever' + s] = { pivot: mk(cl, 2.5, 1, 'lever'), kind: 'lever' };
    // union link
    const ul = barWorld(Math.round(UNION_L), 1, 1, M.ROD_D, true);
    parts.rods['union' + s] = { pivot: mk(ul, 2, 2.5, 'unionlink'), kind: 'union' };
    // valve stem
    const vs = new World(13, 3, 2);
    vs.box(0, 1, 0, 11, 1, 1, M.ROD);
    parts.rods['valve' + s] = { pivot: mk(vs, 11, 1, 'valvestem'), kind: 'valve' };
  }

  // ---------- tender ----------
  const tenderRoot = new THREE.Group();
  const tw = new World(52, 30, 24);
  const rnd = mulberry32(11);
  tw.box(2, 4, Z(-8), 49, 6, Z(8), M.TENDER_RED);
  tw.box(3, 6, Z(-8), 48, 20, Z(8), M.TENDER);
  tw.box(3, 6, Z(-8), 48, 20, Z(-8), M.TENDER_D);
  tw.box(3, 6, Z(8), 48, 20, Z(8), M.TENDER_D);
  // hollow + coal
  tw.box(4, 7, Z(-7), 47, 19, Z(7), 0);
  for (let x = 5; x <= 46; x++)
    for (let z = -7; z <= 7; z++) {
      const hgt = 19 + Math.round(3.4 * Math.exp(-(((x - 26) / 16) ** 2 + (z / 6) ** 2)) + rnd() * 1.4);
      for (let y = 18; y <= hgt; y++) tw.set(x, y, Z(z), rnd() < 0.25 ? M.COAL_SHINE : M.COAL);
    }
  // lining + ladder + buffers
  for (let x = 4; x <= 47; x++) { tw.set(x, 20, Z(-8), M.LINING); tw.set(x, 20, Z(8), M.LINING); }
  for (let y = 6; y <= 20; y += 3) tw.set(49, y, Z(-6), M.LINING);
  tw.line(49, 6, Z(-6), 49, 20, Z(-6), M.LINING);
  tw.box(49, 4, Z(-9), 51, 7, Z(9), M.TENDER_RED);
  tw.box(0, 5, Z(-1), 2, 6, Z(1), M.ROD_D);
  // emblem roundel
  tw.cylX(13, 0, 2.4, 24, 25, M.LINING);
  const tenderMeshed = meshWorld(tw);
  const tenderBody = stage.addMeshed(tenderMeshed, { parent: tenderRoot, name: 'tender' });
  tenderBody.group.position.set(0, 0, -12);
  const tenderWheels = [];
  const twheel = buildWheel(3, 0, false);
  for (const x of [8, 18, 31, 41])
    for (const s of [-1, 1]) {
      const meshed = meshWorld(twheel.w);
      const g = stage.addMeshed(meshed, { parent: tenderRoot, name: 'tenderwheel' });
      const pivot = new THREE.Group();
      pivot.position.set(x, 3, s * 5);
      g.group.position.set(-twheel.c, -twheel.c, -2);
      pivot.add(g.group);
      tenderRoot.add(pivot);
      tenderWheels.push(pivot);
    }

  stage.scene.add(root);
  stage.scene.add(tenderRoot);

  function update(trainP, theta) {
    root.position.set(trainP, 75, 100);
    tenderRoot.position.set(trainP - 150, 75, 100);
    for (const w of parts.wheels) w.pivot.rotation.z = theta * (DRIVER_R / w.r) + (w.s === -1 ? Math.PI / 2 : 0);
    for (const p of tenderWheels) p.rotation.z = theta * (DRIVER_R / 3);
    for (const s of [-1, 1]) {
      const z = gearZ[String(s)];
      const ph = s === 1 ? 0 : Math.PI / 2;   // quartering
      const th = theta + ph;
      const px = MAIN_X + CRANK_R * Math.cos(th);
      const py = DRIVER_R + CRANK_R * Math.sin(th);
      const side = parts.rods['side' + s];
      side.pivot.position.set(px, py, z);
      // recompute side-specific crosshead/main rod for quartered phase
      const dy2 = py - CROSS_Y;
      const cx2 = px - Math.sqrt(Math.max(1, MAIN_ROD_L * MAIN_ROD_L - dy2 * dy2));
      const ma = Math.atan2(py - CROSS_Y, px - cx2);
      const main = parts.rods['main' + s];
      main.pivot.position.set(cx2, CROSS_Y, z);
      main.pivot.rotation.z = ma;
      const cross = parts.rods['cross' + s];
      cross.pivot.position.set(cx2, CROSS_Y, z);
      // valve gear uses the side's own phase: sample LUT at th
      const S = sampleLUT(lut, th);
      const ecc = parts.rods['ecc' + s];
      const ex = px + ECC_R * Math.cos(th + Math.PI / 2);
      const ey = py + ECC_R * Math.sin(th + Math.PI / 2);
      ecc.pivot.position.set(ex, ey, z);
      ecc.pivot.rotation.z = S[2];
      const link = parts.rods['link' + s];
      link.pivot.position.set(TRUNNION[0], TRUNNION[1], z);
      link.pivot.rotation.z = S[3];
      const radius = parts.rods['radius' + s];
      radius.pivot.position.set(S[4], S[5], z);
      radius.pivot.rotation.z = S[6];
      const lever = parts.rods['lever' + s];
      lever.pivot.position.set(S[8], VALVE_Y, z);
      lever.pivot.rotation.z = S[7];
      const union = parts.rods['union' + s];
      union.pivot.position.set(cx2, CROSS_Y - 1.6, z);
      union.pivot.rotation.z = S[9];
      const valve = parts.rods['valve' + s];
      valve.pivot.position.set(S[8], VALVE_Y, z);
    }
  }

  return { root, tenderRoot, update, parts };
}

export { buildLUT, sampleLUT, DRIVER_R };