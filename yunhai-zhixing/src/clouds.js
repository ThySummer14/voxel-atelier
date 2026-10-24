import * as THREE from 'three';
import { mulberry32, noise2, fbm, C } from './palette.js';

const cloudVertex = `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const cloudFragment = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uHorizon;
  varying vec2 vUv;
  varying vec3 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 9.3;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vWorld.xz * 0.017;
    float t = uTime * 0.008;
    float n1 = fbm(p + vec2(t, t * 0.33));
    float n2 = fbm(p * 2.1 + vec2(-t * 0.7, t * 0.4) + n1 * 0.9);
    float n3 = fbm(p * 4.4 + vec2(t * 0.8, -t * 0.25) + n2 * 0.55);
    float cloud = n1 * 0.52 + n2 * 0.32 + n3 * 0.16;
    cloud = smoothstep(0.34, 0.7, cloud);

    vec3 deep = vec3(0.006, 0.016, 0.024);
    vec3 mid = vec3(0.035, 0.066, 0.082);
    vec3 high = vec3(0.17, 0.245, 0.26);
    vec3 moon = vec3(0.50, 0.57, 0.54);
    vec3 col = mix(deep, mid, smoothstep(0.0, 0.55, cloud));
    col = mix(col, high, smoothstep(0.45, 0.95, cloud) * 0.8);
    col += moon * pow(max(0.0, n3 - 0.56), 2.2) * 1.15;
    // soft ridges catching the moon along the cloud tops
    float ridge = smoothstep(0.58, 0.82, n2) * (0.35 + 0.65 * n3);
    col += vec3(0.10, 0.145, 0.15) * ridge;

    // a broad moonlit path in the far cloud bank
    vec2 md = normalize(vec2(-60.0, -300.0));
    float moonSide = max(0.0, dot(normalize(vWorld.xz + vec2(0.001)), md));
    float moonPath = pow(moonSide, 6.0) * exp(-length(vWorld.xz - vec2(-30.0, -230.0)) * 0.0042);
    col += vec3(0.18, 0.24, 0.22) * moonPath * (0.25 + cloud * 0.75);
    float dist = length(vWorld.xz - cameraPosition.xz);
    float fog = smoothstep(320.0, 680.0, dist);
    col = mix(col, uHorizon, fog);
    // subtle blue depth in the troughs
    col += vec3(0.01, 0.018, 0.02) * (1.0 - cloud);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function makeCloudTexture() {
  const w = 256, h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const rand = mulberry32(3939);
  const seed = rand() * 30;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w * 2 - 1;
      const ny = y / h * 2 - 1;
      const ellipse = 1 - Math.sqrt(nx * nx * 0.75 + ny * ny * 2.4);
      let n = fbm(x * 0.025 + seed, y * 0.04 + seed * 0.5, 3, 4);
      n += fbm(x * 0.07, y * 0.1 + 4.2, 9, 3) * 0.32;
      let alpha = Math.max(0, ellipse) * (n - 0.28) * 2.6;
      alpha = Math.max(0, Math.min(0.82, alpha));
      const i = (y * w + x) * 4;
      const warm = 0.62 + n * 0.35;
      img.data[i] = 225 * warm;
      img.data[i + 1] = 234 * warm;
      img.data[i + 2] = 231;
      img.data[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function createMist(texture) {
  const group = new THREE.Group();
  group.name = 'cloud-mist';
  const rand = mulberry32(7788);
  const specs = [];
  for (let i = 0; i < 26; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 90 + rand() * 220;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 26 + rand() * 46;
    const scale = 55 + rand() * 120;
    const opacity = 0.07 + rand() * 0.14;
    specs.push({ x, y, z, scale, opacity, drift: 1.4 + rand() * 3.5, phase: rand() * 20 });
  }
  // a low veil around the island base
  for (let i = 0; i < 14; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 45 + rand() * 100;
    specs.push({
      x: Math.cos(angle) * radius, y: 25 + rand() * 12, z: Math.sin(angle) * radius,
      scale: 40 + rand() * 70, opacity: 0.14 + rand() * 0.1,
      drift: 0.9 + rand() * 2, phase: rand() * 20,
    });
  }
  // veils that touch the island and a few slow clouds in the near field
  for (let i = 0; i < 10; i++) {
    const a = -2.8 + i * 0.55 + rand() * 0.2;
    specs.push({
      x: Math.cos(a) * (65 + rand() * 45), y: 29 + rand() * 12, z: Math.sin(a) * (65 + rand() * 45),
      scale: 30 + rand() * 45, opacity: 0.09 + rand() * 0.09,
      drift: 0.5 + rand() * 1.2, phase: rand() * 20,
    });
  }
  for (let i = 0; i < 7; i++) {
    specs.push({
      x: -120 + rand() * 260, y: 21 + rand() * 8, z: 110 + rand() * 70,
      scale: 70 + rand() * 70, opacity: 0.1 + rand() * 0.07,
      drift: 0.4 + rand() * 1.0, phase: rand() * 20,
    });
  }
  // low banks that catch the base of the atelier
  for (let i = 0; i < 10; i++) {
    specs.push({
      x: -90 + rand() * 190, y: 32 + rand() * 12, z: 58 + rand() * 46,
      scale: 55 + rand() * 85, opacity: 0.1 + rand() * 0.11,
      drift: 0.35 + rand() * 0.8, phase: rand() * 20,
    });
  }
  for (let i = 0; i < 8; i++) {
    specs.push({
      x: -320 + rand() * 640, y: 32 + rand() * 22, z: -330 + rand() * 120,
      scale: 160 + rand() * 180, opacity: 0.1 + rand() * 0.09,
      drift: 0.25 + rand() * 0.6, phase: rand() * 20,
    });
  }
  // a long, low bank to dissolve the hard line of the cloud sea
  for (let i = 0; i < 7; i++) {
    specs.push({
      x: -420 + i * 140 + rand() * 50, y: 34 + rand() * 10, z: -410 + rand() * 50,
      scale: 220 + rand() * 100, opacity: 0.17 + rand() * 0.09,
      drift: 0.16 + rand() * 0.3, phase: rand() * 20,
    });
  }
  for (let i = 0; i < 18; i++) {
    const angle = -0.3 + rand() * Math.PI + 0.2;
    const radius = 280 + rand() * 170;
    specs.push({
      x: Math.cos(angle) * radius, y: 34 + rand() * 26, z: Math.sin(angle) * radius,
      scale: 170 + rand() * 160, opacity: 0.12 + rand() * 0.09,
      drift: 0.4 + rand() * 1.2, phase: rand() * 20,
    });
  }
  for (const s of specs) {
    const mat = new THREE.SpriteMaterial({
      map: texture,
      color: new THREE.Color(0xa9c4c8).convertSRGBToLinear(),
      transparent: true,
      opacity: s.opacity,
      depthWrite: false,
      fog: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(s.x, s.y, s.z);
    sprite.scale.set(s.scale, s.scale * 0.46, 1);
    sprite.userData = s;
    group.add(sprite);
  }
  group.userData.update = (time) => {
    group.children.forEach((sprite) => {
      const s = sprite.userData;
      sprite.position.x = s.x + Math.sin(time * 0.015 + s.phase) * 12 + time * s.drift * 0.35;
      sprite.position.y = s.y + Math.sin(time * 0.05 + s.phase) * 1.4;
      const wobble = 0.92 + Math.sin(time * 0.03 + s.phase) * 0.08;
      sprite.scale.set(s.scale * wobble, s.scale * 0.46 * wobble, 1);
      sprite.material.opacity = s.opacity * (0.85 + Math.sin(time * 0.07 + s.phase) * 0.15);
    });
  };
  return group;
}

export function createClouds(scene) {
  const horizon = new THREE.Color(0x29424c).convertSRGBToLinear();
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1400, 1400, 1, 1);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uHorizon: { value: horizon },
    },
    vertexShader: cloudVertex,
    fragmentShader: cloudFragment,
    side: THREE.DoubleSide,
  });
  const sea = new THREE.Mesh(geo, mat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 20.5;
  sea.renderOrder = -2;
  sea.frustumCulled = false;
  group.add(sea);

  // a soft atmospheric wall that dissolves the far edge of the cloud sea
  const fogGeo = new THREE.CylinderGeometry(520, 520, 190, 64, 1, true);
  const fogMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x2b4650).convertSRGBToLinear() },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vWorld;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        float h = vWorld.y;
        float band = smoothstep(-8.0, 18.0, h) * (1.0 - smoothstep(48.0, 112.0, h));
        float drift = noise(vec2(vWorld.x * 0.008 + uTime * 0.003, h * 0.02));
        drift = 0.7 + 0.3 * drift;
        float alpha = band * 0.48 * drift;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const fogWall = new THREE.Mesh(fogGeo, fogMat);
  fogWall.position.y = 36;
  fogWall.renderOrder = -1;
  fogWall.frustumCulled = false;
  group.add(fogWall);

  const texture = makeCloudTexture();
  const mist = createMist(texture);
  group.add(mist);
  scene.add(group);

  return {
    group,
    sea,
    mist,
    update(time) {
      mat.uniforms.uTime.value = time;
      fogMat.uniforms.uTime.value = time;
      mist.userData.update(time);
    },
  };
}
