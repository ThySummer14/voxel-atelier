// people.js — 市井人物系统：细步幅体素小人（0.42 缩放），巷道行走 + 桥心凭栏 + 摊贩 + 船工 + 骆驼

import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry, mulberry32 } from './voxel.js';

const ROBES = [0x4a6a8a, 0x8a6a4a, 0x6a7a72, 0x9a4a3c, 0xd8cdb4, 0x3c3a38, 0x8a6a7a, 0xb0924e, 0x5a7a5a];
const SKIN = 0xe8c39a;
const PANTS = 0x3a3430;
const HAT = 0xc9a86a, FUTOU = 0x2c2c2c;
const BASKET = 0xb98d4f;

const rng = mulberry32(88);

function figMesh(w) {
  const { geometry } = buildGeometry(w, { jitter: 0.03 });
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const m = new THREE.Mesh(geometry, mat);
  m.scale.setScalar(0.42);
  m.castShadow = true;
  return m;
}

/** 人物：2宽×4高 细分体素；opts: {hat:'straw'|'futou'|null, pole, umbrella, bundle} */
export function makeFigure(opts = {}) {
  const w = new VoxelWorld();
  const robe = opts.robe || ROBES[Math.floor(rng() * ROBES.length)];
  w.set(0, 0, 0, PANTS); w.set(1, 0, 0, PANTS);
  for (let y = 1; y <= 2; y++) { w.set(0, y, 0, robe); w.set(1, y, 0, robe); }
  w.set(0, 3, 0, SKIN); w.set(1, 3, 0, SKIN);
  if (opts.hat === 'straw') { w.set(0, 4, 0, HAT); w.set(1, 4, 0, HAT); }
  else if (opts.hat === 'futou') { w.set(0, 4, 0, FUTOU); w.set(1, 4, 0, FUTOU); }
  if (opts.bundle) { w.set(0, 2, 1, 0xb0924e); w.set(1, 2, 1, 0xb0924e); }
  const g = new THREE.Group();
  g.add(figMesh(w));
  if (opts.pole) { // 挑担
    for (let z = -2; z <= 2; z++) {
      const p = new THREE.Mesh(boxGeo(0.12, 0.12, 0.5), poleMat);
      p.position.set(0.21, 1.95, z * 0.5 + 0.25); g.add(p);
    }
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(boxGeo(0.3, 0.28, 0.3), basketMat);
      b.position.set(0.21, 1.55, s * 1.05); g.add(b);
    }
  }
  if (opts.umbrella) {
    const uc = [0xe6d9b8, 0xb3593c, 0x4e7d76][Math.floor(rng() * 3)];
    const stick = new THREE.Mesh(boxGeo(0.08, 1.5, 0.08), poleMat);
    stick.position.set(0.21, 2.6, 0.21); g.add(stick);
    const canopy = new THREE.Mesh(boxGeo(1.1, 0.14, 1.1), new THREE.MeshLambertMaterial({ color: uc }));
    canopy.position.set(0.21, 3.3, 0.21); canopy.castShadow = true; g.add(canopy);
  }
  return g;
}

let poleMat, basketMat, boxGeoFn;
function boxGeo(x, y, z) { return new THREE.BoxGeometry(x, y, z); }
poleMat = new THREE.MeshLambertMaterial({ color: 0x5a4432 });
basketMat = new THREE.MeshLambertMaterial({ color: BASKET });

/** 骆驼（世界尺度体素） */
function makeCamel() {
  const w = new VoxelWorld();
  w.box(0, 1, 0, 4, 2, 1, 0xb08a5a);            // 身
  w.set(1, 3, 0, 0x9a7a4c); w.set(3, 3, 0, 0x9a7a4c); // 双峰
  w.box(4, 3, 0, 4, 5, 0, 0xb08a5a);            // 颈
  w.set(4, 5, 0, 0x8a6a40);                     // 头
  w.set(5, 5, 0, 0x8a6a40);
  for (const lx of [0, 1, 3, 4]) { w.set(lx, 0, 0, 0x8a6a44); w.set(lx, 0, 1, 0x8a6a44); }
  const { geometry } = buildGeometry(w, { jitter: 0.04 });
  const m = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.castShadow = true;
  return m;
}

/**
 * 人群系统。deckY(z)：虹桥桥面高度函数。
 */
export function createCrowd(root, deckY) {
  const crowd = new THREE.Group();
  root.add(crowd);

  // —— 巷道 ——
  const L = [];
  const lane = (x0, z0, x1, z1, n, yFn, w = 0.8) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) {
      const fig = makeFigure({
        hat: rng() < 0.4 ? 'straw' : rng() < 0.5 ? 'futou' : null,
        pole: rng() < 0.16, umbrella: rng() < 0.1, bundle: rng() < 0.15,
      });
      crowd.add(fig);
      L.push({
        fig, x0, z0, x1, z1, len, yFn, w,
        t: rng(), dir: rng() < 0.5 ? 1 : -1,
        speed: 1.1 + rng() * 1.3, off: (rng() - 0.5) * 2 * w,
        phase: rng() * Math.PI * 2,
      });
    }
  };
  lane(-46, -20.5, 46, -20.5, 15, () => 8);
  lane(-46, 20.5, 46, 20.5, 11, () => 8);
  lane(-0.9, -19, -0.9, 19, 6, (x, z) => bridgeY(z), 0.3);
  lane(1.6, 19, 1.6, -19, 6, (x, z) => bridgeY(z), 0.3);
  lane(-42, -15.8, 42, -15.8, 10, () => 8);
  lane(-42, 15.8, 42, 15.8, 8, () => 8);
  lane(18, 24, 18, 42, 4, () => 8);

  function bridgeY(z) {
    const a = Math.abs(z);
    if (a <= 15) return deckY(z) + 1;
    if (a <= 18.5) return 9;
    return 8;
  }

  // —— 桥头凭栏看客 ——
  const lookers = [];
  for (let i = 0; i < 9; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -12 + Math.floor(rng() * 24);
    const fig = makeFigure({ hat: rng() < 0.5 ? 'futou' : null });
    fig.position.set(side * 2.2, deckY(z) + 1, z + (rng() - 0.5));
    fig.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    crowd.add(fig);
    lookers.push(fig);
  }

  // —— 摊贩（位置由 build.stalls 提供，桥面摊位带 y 与朝向）——
  function addVendors(stalls) {
    for (const st of stalls) {
      const fig = makeFigure({ hat: rng() < 0.5 ? 'straw' : null });
      if (st.face !== undefined) {
        fig.position.set(st.x, st.y, st.z);
        fig.rotation.y = st.face > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        fig.position.set(st.x + (rng() - 0.5), 8, st.z + (st.z > 0 ? 1.2 : -1.2));
        fig.rotation.y = st.z > 0 ? Math.PI : 0;
      }
      crowd.add(fig);
    }
  }

  // —— 船工 ——
  function addBoatCrew(boatGroup) {
    for (const [lx, lz, face] of [[-9, 1.6, Math.PI], [-10.5, -1.6, Math.PI], [-12, 1.2, Math.PI]]) {
      const fig = makeFigure({ hat: rng() < 0.4 ? 'straw' : null, robe: 0x6a5a3c });
      fig.position.set(lx, 4, lz);
      fig.rotation.y = face;
      boatGroup.add(fig);
    }
    // 橹 ×2（尾部两侧，摇橹动画由 main 驱动）
    const oars = [];
    for (const s of [1, -1]) {
      const oar = new THREE.Mesh(boxGeo(0.22, 0.22, 6.5), poleMat);
      oar.geometry.translate(0, 0, 2.6);
      oar.position.set(-11, 4.6, s * 1.6);
      oar.rotation.x = s > 0 ? 0.55 : -0.55;
      boatGroup.add(oar);
      oars.push({ mesh: oar, s });
    }
    return oars;
  }
  function addSampanCrew(sampanGroup, withPole) {
    const fig = makeFigure({ hat: 'straw', robe: 0x4a5a4a });
    fig.position.set(withPole ? 4.5 : -4.5, 3, 0);
    fig.rotation.y = withPole ? Math.PI : 0;
    sampanGroup.add(fig);
    let pole = null;
    if (withPole) {
      pole = new THREE.Mesh(boxGeo(0.14, 7, 0.14), poleMat);
      pole.geometry.translate(0, 3.5, 0);
      pole.position.set(4.5, 3, 0.8);
      pole.rotation.z = 0.35;
      sampanGroup.add(pole);
    }
    return { fig, pole };
  }

  // —— 骆驼队（通城楼街）——
  const caravan = [];
  for (let i = 0; i < 2; i++) {
    const c = makeCamel();
    crowd.add(c);
    caravan.push({ mesh: c, t: 0.1 + i * 0.3 });
  }
  const leader = makeFigure({ hat: 'futou', robe: 0x8a6a4a });
  crowd.add(leader);
  const camelLane = { t0: new THREE.Vector2(18, 42), t1: new THREE.Vector2(18, 26) };

  const clock = { t: 0 };
  function update(dt) {
    clock.t += dt;
    for (const w of L) {
      w.t += (w.dir * w.speed * dt) / w.len;
      if (w.t > 1) { w.t = 1; w.dir = -1; }
      if (w.t < 0) { w.t = 0; w.dir = 1; }
      const x = w.x0 + (w.x1 - w.x0) * w.t;
      const z = w.z0 + (w.z1 - w.z0) * w.t;
      // 垂直巷道方向的偏移
      const dx = w.x1 - w.x0, dz = w.z1 - w.z0;
      const il = 1 / (w.len || 1);
      const px = -dz * il * w.off, pz = dx * il * w.off;
      const y = w.yFn ? w.yFn(x, z + pz) : 8;
      const bob = Math.abs(Math.sin(w.phase + clock.t * w.speed * 2.6)) * 0.16;
      w.fig.position.set(x + px, y + bob, z + pz);
      const target = Math.atan2(dx * w.dir, dz * w.dir);
      w.fig.rotation.y = target;
    }
    // 骆驼队往返
    for (const c of caravan) {
      c.t += dt * 0.018;
      if (c.t > 1) c.t = 0;
      const e = c.t < 0.5 ? c.t * 2 : 2 - c.t * 2; // 往返
      c.mesh.position.set(16.2 + (rng() - 0.5) * 0.001, 8, camelLane.t0.y + (camelLane.t1.y - camelLane.t0.y) * e);
      c.mesh.rotation.y = c.t < 0.5 ? Math.PI : 0;
    }
    leader.position.set(19.6, 8, camelLane.t0.y + (camelLane.t1.y - camelLane.t0.y) * (caravan[0].t < 0.5 ? caravan[0].t * 2 : 2 - caravan[0].t * 2) + 2.5);
    leader.rotation.y = caravan[0].t < 0.5 ? Math.PI : 0;
  }

  return { update, addVendors, addBoatCrew, addSampanCrew, makeFigure };
}
