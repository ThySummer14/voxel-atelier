// CPU-simulated voxel puff particles rendered as soft square point sprites.
// Smoke bursts are fired by the crank (4 exhaust chuffs per driver revolution).

import * as THREE from 'three';
import { mulberry32 } from '../core/rng.js';

const MAX = 900;

const VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vAlpha = aAlpha;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * (340.0 / max(1.0, -mv.z)), 1.0, 420.0);
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = max(abs(uv.x), abs(uv.y));
  float a = smoothstep(0.5, 0.30, d) * vAlpha;
  if (a < 0.012) discard;
  gl_FragColor = vec4(vColor, a);
}
`;

export function createParticles(scene) {
  const rnd = mulberry32(4242);
  const pos = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const col = new Float32Array(MAX * 3);
  const size = new Float32Array(MAX);
  const alpha = new Float32Array(MAX);
  const life = new Float32Array(MAX);
  const maxLife = new Float32Array(MAX);
  const grow = new Float32Array(MAX);
  const drag = new Float32Array(MAX);
  const kind = new Uint8Array(MAX);     // 0 smoke 1 steam 2 ember 3 mist 4 leaf
  const seed = new Float32Array(MAX);
  const baseCol = new Float32Array(MAX * 3);
  const endCol = new Float32Array(MAX * 3);
  let head = 0;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  scene.add(points);

  function spawn(x, y, z, vx, vy, vz, s, g, lf, dr, k, c0, c1, a0) {
    const i = head; head = (head + 1) % MAX;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
    size[i] = s; grow[i] = g; life[i] = lf; maxLife[i] = lf; drag[i] = dr;
    kind[i] = k; seed[i] = rnd() * 100; alpha[i] = a0;
    baseCol[i * 3] = c0[0]; baseCol[i * 3 + 1] = c0[1]; baseCol[i * 3 + 2] = c0[2];
    endCol[i * 3] = c1[0]; endCol[i * 3 + 1] = c1[1]; endCol[i * 3 + 2] = c1[2];
  }

  // one exhaust chuff: stack smoke + both cylinder cocks
  function chuff(trainP, speed) {
    const cx = trainP - 10, cy = 107, cz = 100;
    const n = 5 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const sp = 6 + rnd() * 5 + speed * 0.4;
      spawn(cx + (rnd() - 0.5) * 2, cy + rnd(), cz + (rnd() - 0.5) * 2,
        speed * 0.22 + (rnd() - 0.5) * 1.5, sp, (rnd() - 0.5) * 1.6,
        2.2 + rnd() * 1.5, 4.5 + rnd() * 2, 2.6 + rnd() * 1.4, 0.7, 0,
        [0.10, 0.10, 0.11], [0.42, 0.43, 0.46], 0.5);
    }
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        spawn(trainP - 9, 80 + rnd() * 2, 100 + s * 8,
          -1 + rnd(), 1 + rnd() * 2, s * (3 + rnd() * 4),
          1.4 + rnd(), 3.5, 0.6 + rnd() * 0.3, 1.6, 1,
          [0.82, 0.84, 0.88], [0.9, 0.92, 0.95], 0.42);
      }
    }
  }

  let mistAcc = 0, leafAcc = 0, emberAcc = 0, smokeAcc = 0;
  function update(dt, ctx) {
    const { running, trainP, day } = ctx;
    // continuous emitters
    if (running) {
      smokeAcc += dt;
      if (smokeAcc > 0.05) {
        smokeAcc = 0;
        spawn(trainP - 10 + (rnd() - 0.5), 107, 100 + (rnd() - 0.5),
          ctx.speed * 0.2 + (rnd() - 0.5), 5 + rnd() * 3, (rnd() - 0.5) * 1.2,
          1.6 + rnd(), 3.5, 2.2 + rnd(), 0.7, 0,
          [0.12, 0.12, 0.13], [0.40, 0.41, 0.44], 0.32);
      }
    }
    mistAcc += dt;
    if (mistAcc > 0.22) {
      mistAcc = 0;
      spawn(250 + rnd() * 120, 27 + rnd() * 5, 80 + rnd() * 40,
        0.4 + rnd() * 0.4, 0.15, (rnd() - 0.5) * 0.3,
        16 + rnd() * 18, 1.5, 5 + rnd() * 3, 0.1, 3,
        [0.78, 0.82, 0.86], [0.86, 0.89, 0.92], 0.05 + 0.03 * day);
    }
    leafAcc += dt;
    if (leafAcc > 0.12) {
      leafAcc = 0;
      const lx = 176 + rnd() * 70, lz = 118 + rnd() * 46;
      const autumn = [[0.85, 0.42, 0.12], [0.78, 0.22, 0.10], [0.88, 0.62, 0.16], [0.65, 0.30, 0.10]];
      const c = autumn[Math.floor(rnd() * autumn.length)];
      spawn(lx, 86 + rnd() * 10, lz, (rnd() - 0.5) * 1.2, -1.5 - rnd() * 1.5, (rnd() - 0.5) * 1.2,
        0.7 + rnd() * 0.4, 0, 4 + rnd() * 2, 0.2, 4, c, c, 0.9);
    }
    if (running) {
      emberAcc += dt;
      if (emberAcc > 0.10) {
        emberAcc = 0;
        spawn(trainP - 81 + (rnd() - 0.5) * 4, 82, 100 + (rnd() - 0.5) * 4,
          (rnd() - 0.5) * 2 - 1, 3 + rnd() * 4, (rnd() - 0.5) * 2,
          0.5 + rnd() * 0.3, 0, 0.7 + rnd() * 0.5, 0.4, 2,
          [1.0, 0.5, 0.12], [1.0, 0.25, 0.05], 0.95);
      }
    }
    // integrate
    const t = ctx.t;
    for (let i = 0; i < MAX; i++) {
      if (life[i] <= 0) { alpha[i] = 0; continue; }
      life[i] -= dt;
      const u = 1 - Math.max(0, life[i]) / maxLife[i];
      const dr = Math.exp(-drag[i] * dt);
      vel[i * 3] *= dr; vel[i * 3 + 1] *= dr; vel[i * 3 + 2] *= dr;
      if (kind[i] === 0) vel[i * 3 + 1] += 1.2 * dt;        // smoke buoyancy
      if (kind[i] === 4) {                                  // leaf flutter
        vel[i * 3] += Math.sin(t * 3 + seed[i]) * 1.5 * dt;
        vel[i * 3 + 2] += Math.cos(t * 2.3 + seed[i]) * 1.5 * dt;
      }
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      size[i] += grow[i] * dt;
      const a0 = kind[i] === 3 ? alpha[i] : (kind[i] === 2 ? 0.95 : (kind[i] === 4 ? 0.9 : (kind[i] === 1 ? 0.42 : 0.5)));
      alpha[i] = a0 * (kind[i] === 3 ? Math.sin(Math.PI * u) : (1 - u) * (u < 0.1 ? u / 0.1 : 1));
      col[i * 3] = baseCol[i * 3] + (endCol[i * 3] - baseCol[i * 3]) * u;
      col[i * 3 + 1] = baseCol[i * 3 + 1] + (endCol[i * 3 + 1] - baseCol[i * 3 + 1]) * u;
      col[i * 3 + 2] = baseCol[i * 3 + 2] + (endCol[i * 3 + 2] - baseCol[i * 3 + 2]) * u;
      if (life[i] <= 0) alpha[i] = 0;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aColor.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
  }

  return { points, chuff, update };
}