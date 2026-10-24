import * as THREE from 'three';
import { VoxelVolume } from './voxel.js';
import { C, mulberry32, noise2, fbm } from './palette.js';

function makeStarTexture() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,247,225,0.95)');
  g.addColorStop(0.42, 'rgba(255,226,178,0.22)');
  g.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.globalCompositeOperation = 'lighter';
  const h = ctx.createLinearGradient(0, s / 2, s, s / 2);
  h.addColorStop(0, 'rgba(255,240,210,0)');
  h.addColorStop(0.5, 'rgba(255,250,235,0.72)');
  h.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = h;
  ctx.fillRect(0, s / 2 - 1, s, 2);
  const v = ctx.createLinearGradient(s / 2, 0, s / 2, s);
  v.addColorStop(0, 'rgba(255,240,210,0)');
  v.addColorStop(0.5, 'rgba(255,250,235,0.55)');
  v.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = v;
  ctx.fillRect(s / 2 - 1, 0, 2, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStars() {
  const rand = mulberry32(90210);
  const positions = [];
  const colors = [];
  const sizes = [];
  const phases = [];
  const palette = [
    [0.78, 0.88, 1.0],
    [0.98, 0.96, 0.9],
    [1.0, 0.87, 0.64],
    [0.72, 0.9, 0.94],
    [1.0, 0.78, 0.72],
  ];
  const addStar = (x, y, z, size, color) => {
    const len = Math.hypot(x, y, z);
    positions.push((x / len) * 690, (y / len) * 690, (z / len) * 690);
    colors.push(color[0], color[1], color[2]);
    sizes.push(size);
    phases.push(rand() * 20);
  };
  for (let i = 0; i < 1450; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const y = Math.abs(u) * 0.94 - 0.06;
    let x = r * Math.cos(phi);
    let z = r * Math.sin(phi);
    const cc = palette[Math.floor(rand() * palette.length)];
    addStar(x, y, z, 1.4 + rand() * 2.4, cc);
  }
  // a faint diagonal river of stars
  for (let i = 0; i < 900; i++) {
    const t = rand() * Math.PI * 2;
    const spread = (rand() + rand() + rand() - 1.5) * 0.18;
    const ax = Math.cos(t), ay = Math.sin(t) * 0.6 + 0.32, az = Math.sin(t) * 0.5 + 0.54;
    const nx = -0.16, ny = 0.72, nz = 0.32;
    let x = ax + nx * spread * 3;
    let y = ay + ny * spread;
    let z = az + nz * spread * 3;
    const len = Math.hypot(x, y, z);
    if (y / len < 0.02) continue;
    const cc = palette[Math.floor(rand() * palette.length)];
    addStar(x, y, z, 0.9 + rand() * 1.6, cc);
  }
  // hero stars
  for (let i = 0; i < 34; i++) {
    const u = 0.06 + rand() * 0.8;
    const phi = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const cc = palette[Math.floor(rand() * 3)];
    addStar(r * Math.cos(phi), u, r * Math.sin(phi), 4.2 + rand() * 6.5, cc);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.98 },
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = aColor;
        vTwinkle = 0.72 + 0.28 * sin(uTime * 0.55 + aPhase * 3.7);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.6, aSize * uPixelRatio * (0.85 + 0.2 * vTwinkle));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float d = length(p);
        float core = smoothstep(0.16, 0.0, d);
        float halo = smoothstep(0.5, 0.0, d) * 0.42;
        float crossH = smoothstep(0.055, 0.0, abs(p.y)) * smoothstep(0.34, 0.0, abs(p.x));
        float crossV = smoothstep(0.055, 0.0, abs(p.x)) * smoothstep(0.34, 0.0, abs(p.y));
        float a = (core + halo + (crossH + crossV) * 0.45) * vTwinkle * uOpacity;
        if (a < 0.006) discard;
        gl_FragColor = vec4(vColor * (0.9 + core * 1.4), a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -20;
  return pts;
}

function makeGlowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,249,226,0.95)');
  g.addColorStop(0.15, 'rgba(240,226,190,0.62)');
  g.addColorStop(0.4, 'rgba(190,214,213,0.16)');
  g.addColorStop(1, 'rgba(120,160,170,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildMoon() {
  const vol = new VoxelVolume([-42, -42, -42], [42, 42, 42]);
  const R = 39;
  const B = 3;
  const base = 0xeee5d3;
  const cells = Math.floor(R / B);
  const lx = -0.5, ly = 0.42, lz = 0.78;
  const inv = 1 / Math.hypot(lx, ly, lz);
  for (let ix = -cells; ix <= cells; ix++) {
    for (let iy = -cells; iy <= cells; iy++) {
      for (let iz = -cells; iz <= cells; iz++) {
        const bx = ix * B, by = iy * B, bz = iz * B;
        const r = Math.hypot(bx + 1, by + 1, bz + 1);
        if (r > R - B * 0.55) continue;
        const nx = (bx + 1) / r, ny = (by + 1) / r, nz = (bz + 1) / r;
        const diff = Math.max(0, nx * lx * inv + ny * ly * inv + nz * lz * inv);
        // two enormous, very quiet seas; no rings, no flower shapes
        const m1 = Math.exp(-Math.pow(Math.hypot(nx + 0.24, ny - 0.12, nz - 0.94) / 0.42, 2));
        const m2 = Math.exp(-Math.pow(Math.hypot(nx - 0.38, ny + 0.28, nz - 0.86) / 0.5, 2));
        const sea = Math.min(0.12, m1 * 0.1 + m2 * 0.08);
        const limb = Math.pow(Math.max(0, 1 - nz), 1.6);
        const shade = (0.72 + diff * 0.28) * (1 - sea) * (1 - limb * 0.1);
        const rimWarm = 0.97 + diff * 0.03;
        const rr = Math.min(255, Math.round(238 * shade * rimWarm));
        const gg = Math.min(255, Math.round(229 * shade * rimWarm));
        const bb = Math.min(255, Math.round(211 * shade * rimWarm));
        const packed = (rr << 16) | (gg << 8) | bb;
        for (let x = bx; x < bx + B; x++) {
          for (let y = by; y < by + B; y++) {
            for (let z = bz; z < bz + B; z++) {
              vol.set(x, y, z, packed, 0, 0);
            }
          }
        }
      }
    }
  }
  const group = vol.buildMeshes();
  const moonMat = new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color(0xece2cf).convertSRGBToLinear() },
      uShade: { value: new THREE.Color(0x9b9a90).convertSRGBToLinear() },
      uGlow: { value: new THREE.Color(0xfff4dc).convertSRGBToLinear() },
      uLight: { value: new THREE.Vector3(-0.5, 0.44, 0.78).normalize() },
    },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vN = normalize(position);
        vP = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec3 uBase;
      uniform vec3 uShade;
      uniform vec3 uGlow;
      uniform vec3 uLight;
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vec3 n = normalize(vN);
        float d = max(0.0, dot(n, normalize(uLight)));
        float lit = smoothstep(-0.12, 0.85, d);
        vec3 col = mix(uShade, uBase, lit);
        // soft lunar seas, aligned to the near face
        float m1 = smoothstep(0.74, 0.99, dot(n, normalize(vec3(-0.38, 0.1, 0.92))));
        float m2 = smoothstep(0.76, 0.99, dot(n, normalize(vec3(0.34, -0.25, 0.9))));
        col *= 1.0 - m1 * 0.08 - m2 * 0.06;
        // a quiet warm limb and a cool shadow limb
        float limb = 1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0)));
        col += uGlow * pow(max(0.0, d), 5.0) * 0.055;
        col *= 1.0 - pow(limb, 2.5) * 0.1;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    fog: false,
  });
  group.children.forEach((mesh) => {
    const pos = mesh.geometry.attributes.position;
    const normals = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const l = Math.hypot(x, y, z) || 1;
      normals[i * 3] = x / l;
      normals[i * 3 + 1] = y / l;
      normals[i * 3 + 2] = z / l;
    }
    mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    mesh.material = moonMat;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
  return group;
}

function makeNebulaTexture() {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(554);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 38; i++) {
    const x = S * (0.2 + rand() * 0.6);
    const y = S * (0.2 + rand() * 0.6);
    const r = 50 + rand() * 150;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (i % 4 === 0) {
      g.addColorStop(0, 'rgba(184,126,104,0.055)');
    } else if (i % 3 === 0) {
      g.addColorStop(0, 'rgba(61,122,127,0.07)');
    } else {
      g.addColorStop(0, 'rgba(101,161,156,0.045)');
    }
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWispTexture(seed) {
  const W = 512, H = 180;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const rand = mulberry32(seed);
  const ox = rand() * 20;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W * 2 - 1;
      const ny = y / H * 2 - 1;
      const ellipse = 1 - Math.sqrt(nx * nx + ny * ny * 5.5);
      let n = Math.sin(x * 0.013 + ox) * 0.5 + 0.5;
      n = n * 0.55 + (Math.sin(x * 0.053 + y * 0.091) * 0.5 + 0.5) * 0.25
        + (Math.sin(y * 0.12 + x * 0.007) * 0.5 + 0.5) * 0.2;
      let a = Math.max(0, ellipse) * Math.max(0, n - 0.35) * 1.7;
      a = Math.min(0.65, a);
      const i = (y * W + x) * 4;
      img.data[i] = 188;
      img.data[i + 1] = 210;
      img.data[i + 2] = 207;
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSky(scene) {
  const sky = new THREE.Group();
  sky.name = 'sky';

  const skyGeo = new THREE.SphereGeometry(950, 48, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color(0x040a13).convertSRGBToLinear() },
      uMid: { value: new THREE.Color(0x0b1b2a).convertSRGBToLinear() },
      uHorizon: { value: new THREE.Color(0x2a4450).convertSRGBToLinear() },
      uDeep: { value: new THREE.Color(0x07111a).convertSRGBToLinear() },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uDeep;
      varying vec3 vPos;
      void main() {
        float h = vPos.y;
        float band = smoothstep(-0.08, 0.5, h);
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
        col = mix(col, uTop, smoothstep(0.18, 0.8, h));
        col = mix(uDeep, col, smoothstep(-0.2, 0.03, h));
        // a whisper of high atmospheric mist
        float veil = smoothstep(0.03, 0.26, h) * exp(-pow((h - 0.12) * 7.5, 2.0));
        col += vec3(0.018, 0.038, 0.042) * veil;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(skyGeo, skyMat);
  dome.renderOrder = -100;
  dome.frustumCulled = false;
  sky.add(dome);

  const stars = createStars();
  sky.add(stars);

  const moonGroup = buildMoon();
  const moonPos = new THREE.Vector3(-60, 158, -300);
  moonGroup.position.copy(moonPos);
  moonGroup.rotation.set(0.12, -0.35, 0.18);
  moonGroup.scale.setScalar(0.73);
  moonGroup.name = 'voxel-moon';
  sky.add(moonGroup);

  const glowTex = makeGlowTexture();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(0xbfd6d7).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.42,
    fog: false,
  }));
  halo.position.copy(moonPos);
  halo.scale.set(205, 205, 1);
  halo.renderOrder = -30;
  sky.add(halo);

  const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(0x7ea9b5).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.15,
    fog: false,
  }));
  halo2.position.copy(moonPos);
  halo2.scale.set(420, 420, 1);
  halo2.renderOrder = -31;
  sky.add(halo2);

  const nebula = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeNebulaTexture(),
    color: new THREE.Color(0xb7d8d2).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.8,
    fog: false,
  }));
  nebula.position.set(-250, 205, -360);
  nebula.scale.set(680, 410, 1);
  nebula.renderOrder = -32;
  sky.add(nebula);

  const wispMat1 = new THREE.SpriteMaterial({
    map: makeWispTexture(13),
    color: new THREE.Color(0xb9cfcd).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    opacity: 0.62,
    fog: false,
  });
  const wisp1 = new THREE.Sprite(wispMat1);
  wisp1.position.copy(moonPos).add(new THREE.Vector3(-12, 7, 43));
  wisp1.scale.set(235, 72, 1);
  wisp1.renderOrder = -5;
  sky.add(wisp1);
  const wispMat2 = new THREE.SpriteMaterial({
    map: makeWispTexture(29),
    color: new THREE.Color(0x9cb7ba).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    opacity: 0.48,
    fog: false,
  });
  const wisp2 = new THREE.Sprite(wispMat2);
  wisp2.position.copy(moonPos).add(new THREE.Vector3(18, -6, 45));
  wisp2.scale.set(190, 52, 1);
  wisp2.renderOrder = -4;
  sky.add(wisp2);

  scene.add(sky);

  return {
    group: sky,
    stars,
    moon: moonGroup,
    moonPos,
    update(time, camera) {
      stars.material.uniforms.uTime.value = time;
      // the whole sky drifts a hair, so the scene feels alive without being busy
      sky.rotation.y = Math.sin(time * 0.006) * 0.012;
      if (camera) {
        dome.position.copy(camera.position);
      }
    },
    setPixelRatio(pr) {
      stars.material.uniforms.uPixelRatio.value = pr;
    },
  };
}
