// 天空穹顶、远山剪影、体素云、飞鸟、太阳。

import * as THREE from 'three';
import { VoxelSet } from './voxel.js';
import { meshSet } from './mesher.js';

// 太阳：正北偏西 6.5°、仰角 12°（由 tools/search.mjs 与地标投影反解出来的角度）
export const SUN_DIR = new THREE.Vector3(-0.1117, 0.2079, -0.9719).normalize();

// ---------- 天空穹顶 ----------
export function makeSky() {
  const geo = new THREE.SphereGeometry(900, 48, 32);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uSun: { value: SUN_DIR.clone() },
      uTop: { value: new THREE.Color(0x2e63ad) },
      uMid: { value: new THREE.Color(0x9ec9e8) },
      uPeach: { value: new THREE.Color(0xf7b46a) },
      uHorizon: { value: new THREE.Color(0xffa845) },
      uGround: { value: new THREE.Color(0xa48f68) },
    },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec3 vDir;
      uniform vec3 uSun, uTop, uMid, uPeach, uHorizon, uGround;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col;
        if (h >= 0.0) {
          // 四段渐变：金 → 蜜桃 → 淡蓝 → 深蓝。
          // 中间那档必须还是暖色，直接金→灰蓝会在 10° 仰角处把暖光洗没。
          float t = clamp(h, 0.0, 1.0);
          float a1 = smoothstep(0.00, 0.05, t);
          float a2 = smoothstep(0.08, 0.26, t);
          float a3 = smoothstep(0.18, 0.50, t);
          col = mix(mix(mix(uHorizon, uPeach, a1), uMid, a2), uTop, a3);
        } else {
          col = mix(uHorizon, uGround, smoothstep(0.0, -0.35, h));
        }
        // 太阳附近的暖辉：收得紧一点，否则整片天空会被推成灰白
        float s = max(dot(d, normalize(uSun)), 0.0);
        col += vec3(1.0, 0.60, 0.22) * pow(s, 7.0) * 0.34;
        col += vec3(1.0, 0.80, 0.46) * pow(s, 110.0) * 0.60;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  m.renderOrder = -100;
  return m;
}

// ---------- 太阳本体 ----------
export function makeSun() {
  const geo = new THREE.PlaneGeometry(170, 170);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uSun: { value: SUN_DIR.clone() } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        // 本体只占很小一块，亮度也压住：ACES 会把过亮的暖色洗成纯白
        float disc = smoothstep(0.135, 0.108, r);
        float halo = pow(max(1.0 - r, 0.0), 2.2);
        vec3 c = vec3(1.0, 0.90, 0.70) * disc * 1.5 + vec3(1.0, 0.62, 0.26) * halo * 0.62;
        gl_FragColor = vec4(c, clamp(disc * 0.9 + halo * 0.42, 0.0, 1.0));
      }
    `,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = -90;
  m.frustumCulled = false;
  return m;
}

// ---------- 远山剪影：几层递远的山脊，越远越贴近地平线色 ----------
export function makeSkyline(N, eyeY = 50) {
  const group = new THREE.Group();
  // 用「从相机看过去占几个角度」来定山高，而不是绝对高度：相机一动，山不会突然长高
  const layers = [
    { r: 430, aMin: 0.25, aMax: 1.25, c: 0x6d8299, o: 0.55, seed: 11, step: 5 },
    { r: 600, aMin: 0.45, aMax: 1.85, c: 0x8093a8, o: 0.66, seed: 27, step: 6 },
    { r: 790, aMin: 0.65, aMax: 2.45, c: 0x94a5b6, o: 0.78, seed: 43, step: 7 },
  ];
  for (const L of layers) {
    const segs = Math.ceil((Math.PI * 2 * L.r) / L.step);
    const pos = [];
    const idx = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = Math.cos(a) * L.r, z = Math.sin(a) * L.r;
      const nx = x / L.r * 2.6, nz = z / L.r * 2.6;
      const n = N.ridge2(nx + L.seed, nz + L.seed, 4);
      const ang = (L.aMin + (L.aMax - L.aMin) * n) * Math.PI / 180;
      const top = eyeY + L.r * Math.tan(ang);
      pos.push(x, top, z);
      pos.push(x, eyeY - 120, z);
      if (i < segs) {
        const a0 = i * 2;
        idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      color: L.c, transparent: true, opacity: L.o, depthWrite: false, fog: false, side: THREE.DoubleSide,
    }));
    m.renderOrder = -80;
    group.add(m);
  }
  return group;
}

// ---------- 体素云 ----------
export function makeClouds(N, eye = [112, 50, 214]) {
  const set = new VoxelSet();
  // 云的配色别用接近纯白的值：逆光下 ACES 会把它顶成一块死白斑，看着像曝点。
  // 压暗并往暖里调，靠近日轮一侧再单独提亮一点。
  const puffCols = [0xf7e6cc, 0xefd9b6, 0xe1c7a2, 0xcfb28d, 0xb99f80];

  // 7 朵，明确摆在主画面的天空带里：方位 -22°~+46°，仰角 3.5°~12°
  const spots = [
    [-20, 300, 4.0, 7], [-6, 380, 7.5, 9], [10, 265, 5.0, 8],
    [22, 420, 10.0, 10], [33, 320, 6.5, 8], [44, 470, 11.5, 9],
    [-14, 520, 9.0, 11],
  ];
  for (let i = 0; i < spots.length; i++) {
    const [azDeg, rad, elDeg, puffs] = spots[i];
    const az = azDeg * Math.PI / 180, el = elDeg * Math.PI / 180;
    const cx = Math.round(eye[0] + Math.sin(az) * Math.cos(el) * rad);
    const cz = Math.round(eye[2] - Math.cos(az) * Math.cos(el) * rad);
    const cy = Math.round(eye[1] + Math.sin(el) * rad);
    const scale = 4.2 + N.value2(i * 3.1, 0.7) * 3.4;
    for (let p = 0; p < puffs; p++) {
      const ox = Math.round((N.value2(i * 11 + p, 1.3) - 0.5) * scale * 2.6);
      const oz = Math.round((N.value2(i * 13 + p, 2.7) - 0.5) * scale * 1.6);
      const oy = Math.round((N.value2(i * 17 + p, 3.9) - 0.5) * scale * 0.45);
      const rr = scale * (0.5 + N.value2(i * 19 + p, 5.1) * 0.5);
      for (let y = -Math.ceil(rr); y <= Math.ceil(rr); y++)
        for (let z = -Math.ceil(rr * 0.7); z <= Math.ceil(rr * 0.7); z++)
          for (let x = -Math.ceil(rr * 1.3); x <= Math.ceil(rr * 1.3); x++) {
            const dd = (x * x) / (rr * rr * 1.7) + (y * y) / (rr * rr * 0.42) + (z * z) / (rr * rr);
            if (dd > 1) continue;
            if (dd > 0.55 && N.value3(x * 0.7 + i, y * 0.7, z * 0.7) > 0.45) continue;
            const t = (y + rr) / (2 * rr);
            let ci = Math.min(puffCols.length - 1, Math.floor((1 - t) * 3.0 + N.value3(x, y, z) * 1.5));
            // 靠近日轮一侧（-z 方向）提亮一档，做出逆光边缘
            if (z < 0 && ci > 0) ci -= 1;
            set.set(cx + ox + x, cy + oy + y, cz + oz + z, puffCols[ci]);
          }
    }
  }
  const geo = meshSet(set);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
  mesh.frustumCulled = false;
  return mesh;
}

// ---------- 飞鸟 ----------
export function makeBirds(N) {
  const birds = [];
  const mat = new THREE.MeshBasicMaterial({ color: 0x6b5f4c, fog: false, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.1, 0.5, 2.6);
    const body = new THREE.Mesh(bodyGeo, mat);
    g.add(body);
    const wingGeo = new THREE.BoxGeometry(3.6, 0.22, 1.1);
    const wl = new THREE.Mesh(wingGeo, mat);
    wl.position.set(-1.9, 0.35, 0);
    const wr = new THREE.Mesh(wingGeo, mat);
    wr.position.set(1.9, 0.35, 0);
    g.add(wl, wr);
    g.scale.setScalar(0.72);
    birds.push({
      g, wl, wr,
      r: 80 + i * 30 + N.value2(i, 1) * 40,
      cx: 70 + i * 18, cz: -20 + i * 22,
      y: 54 + N.value2(i, 2) * 20,
      speed: 0.10 + i * 0.012,
      phase: N.value2(i, 3) * 6.28,
      flap: 4 + i * 0.7,
    });
  }
  return birds;
}

export function updateBirds(birds, t) {
  for (const b of birds) {
    const a = t * b.speed + b.phase;
    b.g.position.set(b.cx + Math.cos(a) * b.r, b.y + Math.sin(a * 2.1) * 3.5, b.cz + Math.sin(a) * b.r);
    b.g.rotation.y = -a + Math.PI / 2;
    b.g.rotation.z = Math.sin(a * 2.1) * 0.12;
    const f = Math.sin(t * b.flap + b.phase) * 0.55;
    b.wl.rotation.z = f;
    b.wr.rotation.z = -f;
  }
}