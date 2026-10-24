// main.js — 沧海龙宫：渲染器/灯光/相机/天空/水面/粒子/主循环
import * as THREE from '../vendor/three.module.js';
import { buildWorld } from './world.js';
import { World, jitter, hash3, mulberry32 } from './voxel.js';

// ============ 基础 ============
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a3050, 120, 420);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 1200);

// ============ 天空穹顶 ============
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    topColor: { value: new THREE.Color(0x0a1a2e) },
    botColor: { value: new THREE.Color(0x2a5a6a) },
    sunColor: { value: new THREE.Color(0xff9060) },
    sunDir: { value: new THREE.Vector3(-0.4, 0.2, 0.9).normalize() },
    offset: { value: 15 },
    exponent: { value: 0.65 },
  },
  vertexShader: `
    varying vec3 vP;
    void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform vec3 topColor, botColor, sunColor;
    uniform vec3 sunDir;
    uniform float offset, exponent;
    varying vec3 vP;
    void main(){
      vec3 n = normalize(vP + vec3(0.0, offset, 0.0));
      float h = pow(max(n.y, 0.0), exponent);
      vec3 col = mix(botColor, topColor, h);
      // 落日晚霞
      float sunDot = max(0.0, dot(normalize(vP), sunDir));
      col += sunColor * pow(sunDot, 8.0) * 0.4;
      col += sunColor * pow(sunDot, 32.0) * 0.6;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 14), skyMat);
sky.frustumCulled = false;
scene.add(sky);

// ============ 海面 ShaderMaterial ============
const waterMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x1a4a5a) },
      uShal: { value: new THREE.Color(0x2a7a6a) },
      uGlint: { value: new THREE.Color(0xffcc88) },
      uOpacity: { value: 0.78 },
    },
  ]),
  vertexShader: `
    #include <fog_pars_vertex>
    varying vec3 vW;
    uniform float uTime;
    void main(){
      vec4 wp = modelMatrix * vec4(position, 1.0);
      // 波浪起伏
      wp.y += sin(wp.x * 0.15 + uTime * 0.8) * 0.3
            + sin(wp.z * 0.2 + uTime * 0.6) * 0.2;
      vW = wp.xyz;
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    #include <fog_pars_fragment>
    uniform float uTime;
    uniform vec3 uDeep, uShal, uGlint;
    uniform float uOpacity;
    varying vec3 vW;
    void main(){
      // 基础颜色混合
      float band = sin(vW.x * 0.25 + uTime * 0.9) * sin(vW.z * 0.35 - uTime * 0.6);
      vec3 col = mix(uDeep, uShal, 0.5 + 0.3 * band);
      // 流动波纹
      float flow = sin(vW.x * 0.7 - uTime * 1.8 + sin(vW.z * 0.6 + uTime * 0.5) * 0.6);
      col += uGlint * smoothstep(0.88, 0.98, flow) * 0.15;
      // 散点高光
      vec2 cell = floor(vW.xz * 2.0);
      float sp = fract(sin(dot(cell, vec2(12.9898,78.233)) + floor(uTime * 2.0)) * 43758.5);
      col += uGlint * step(0.985, sp) * 0.3;
      gl_FragColor = vec4(col, uOpacity);
      #include <fog_fragment>
    }`,
});
const waterGeo = new THREE.PlaneGeometry(400, 300, 60, 40);
waterGeo.rotateX(-Math.PI / 2);
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.y = 20;
waterMesh.renderOrder = 10;
scene.add(waterMesh);

// ============ 灯光 ============
// 主光：暮色暖阳（低角度，从右后方打来）
const sun = new THREE.DirectionalLight(0xffd0a0, 4.5);
sun.position.set(-100, 80, 100);
sun.target.position.set(0, 20, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -100; sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100; sun.shadow.camera.bottom = -100;
sun.shadow.camera.near = 20; sun.shadow.camera.far = 400;
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 1.4;
scene.add(sun, sun.target);

// 天光
const hemi = new THREE.HemisphereLight(0x4a6a8a, 0x2a4a5a, 2.5);
scene.add(hemi);

// 补光（冷调，从下方海面反射）
const bounce = new THREE.DirectionalLight(0x6a8aaa, 0.8);
bounce.position.set(0, -20, 0);
scene.add(bounce);

// 环境光
scene.add(new THREE.AmbientLight(0x2a3a4a, 0.6));

// ============ 场景构建 ============
const t0 = performance.now();
const { solid, glow } = buildWorld();
const solidMat = new THREE.MeshLambertMaterial({ vertexColors: true });
const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });

const solidMesh = solid.buildMesh(solidMat);
solidMesh.castShadow = true;
solidMesh.receiveShadow = true;
scene.add(solidMesh);

const glowMesh = glow.buildGlowMesh(glowMat);
scene.add(glowMesh);

console.log(`[沧海龙宫] 体素 ${solid.voxelCount + glow.voxelCount} · 生成 ${Math.round(performance.now() - t0)}ms`);

// ============ 体素云 ============
const cloudMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: 0.85 });
const rng = mulberry32(42);

function makeCloud(seed) {
  const cw = new World();
  const blobs = 3 + Math.floor(hash3(seed, 1, 2) * 3);
  let ox = 0;
  for (let b = 0; b < blobs; b++) {
    const r = 3 + Math.floor(hash3(seed, b, 7) * 4);
    const cy = 1 + Math.floor(hash3(seed, b, 13) * 2);
    const czz = Math.floor(hash3(seed, b, 21) * 3);
    for (let dx = -r - 1; dx <= r + 1; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 0; dy <= 2; dy++) {
          const d2 = (dx * dx) / (r * r) + (dz * dz) / 9 + dy * dy / 6;
          if (d2 > 1 - dy * 0.22) continue;
          cw.set(ox + dx, cy + dy, czz + dz,
            jitter(dy > 0 ? 0xd8d4cc : 0xeae4d8, dx, dy, dz, 0.04));
        }
    ox += r + 2;
  }
  return cw.buildMesh(cloudMat);
}

const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = makeCloud(i * 3.7 + 1);
  const scale = 2.0 + rng() * 1.5;
  c.scale.setScalar(scale);
  c.position.set(-280 + rng() * 560, 80 + rng() * 40, -180 + rng() * 120);
  scene.add(c);
  clouds.push(c);
}

// ============ 气泡粒子 ============
const bubbleGeo = new THREE.BufferGeometry();
const bubblePositions = [];
const bubbleData = [];
for (let i = 0; i < 80; i++) {
  const bx = -60 + rng() * 120;
  const bz = -40 + rng() * 80;
  bubblePositions.push(bx, 5 + rng() * 15, bz);
  bubbleData.push({ x: bx, z: bz, speed: 0.5 + rng() * 1.5, phase: rng() * Math.PI * 2 });
}
bubbleGeo.setAttribute('position', new THREE.Float32BufferAttribute(bubblePositions, 3));
const bubbleMat = new THREE.PointsMaterial({
  color: 0xaadde8, size: 3.0, sizeAttenuation: true, transparent: true,
  opacity: 0.6, depthWrite: false, fog: true,
});
const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
scene.add(bubbles);

// ============ 鱼群粒子 ============
const fishGeo = new THREE.BufferGeometry();
const fishPositions = [];
const fishColors = [];
const fishBase = [];
for (let i = 0; i < 40; i++) {
  const fx = -50 + rng() * 100;
  const fz = -35 + rng() * 70;
  const fy = 5 + rng() * 12;
  fishPositions.push(fx, fy, fz);
  const c = rng() < 0.5 ? new THREE.Color(0xffa040) : new THREE.Color(0xff6030);
  fishColors.push(c.r, c.g, c.b);
  fishBase.push({ x: fx, y: fy, z: fz, phase: rng() * Math.PI * 2, r: 8 + rng() * 15 });
}
fishGeo.setAttribute('position', new THREE.Float32BufferAttribute(fishPositions, 3));
fishGeo.setAttribute('color', new THREE.Float32BufferAttribute(fishColors, 3));
const fishMat = new THREE.PointsMaterial({
  vertexColors: true, size: 2.5, sizeAttenuation: true, transparent: true,
  opacity: 0.7, depthWrite: false, fog: true,
});
const fishes = new THREE.Points(fishGeo, fishMat);
scene.add(fishes);

// ============ 星子 ============
const starGeo = new THREE.BufferGeometry();
{
  const pos = [];
  for (let i = 0; i < 600; i++) {
    const a = rng() * Math.PI * 2, e = Math.asin(rng() * 0.92 + 0.08);
    const r = 460;
    pos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
}
const starMat = new THREE.PointsMaterial({
  color: 0xe8eeff, size: 2.5, sizeAttenuation: false,
  transparent: true, opacity: 0.45, depthWrite: false, fog: false,
});
const stars = new THREE.Points(starGeo, starMat);
stars.frustumCulled = false;
scene.add(stars);

// ============ 日轮 ============
function glowTexture(inner, outer) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, outer);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}
const sunTex = glowTexture('rgba(255,200,130,1)', 'rgba(255,160,80,0.45)');
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map: sunTex, transparent: true, opacity: 0.9, depthWrite: false, fog: false,
}));
sunSprite.scale.set(80, 80, 1);
sunSprite.position.set(-100, 50, 260);
scene.add(sunSprite);

// ============ 宫灯光晕 ============
const haloTex = glowTexture('rgba(255,180,90,0.8)', 'rgba(255,140,50,0.3)');
const halos = [];
const haloPositions = [
  [-6, 27, 15], [6, 27, 15],       // 主殿门灯
  [0, 28, 0],                       // 殿内大灯
  [-42, 23, 5], [-42, 23, -5],     // 左阙灯
  [42, 23, 5], [42, 23, -5],       // 右阙灯
  [-6, 21, 30], [6, 21, 30],       // 前门灯
];
for (const [x, y, z] of haloPositions) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, opacity: 0.65,
    depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  }));
  s.position.set(x, y, z);
  s.scale.set(8, 8, 1);
  scene.add(s);
  halos.push(s);
}

// ============ 自制轨道相机 ============
const VIEWS = [
  { name: '全景', pos: new THREE.Vector3(-70, 55, 75), tgt: new THREE.Vector3(0, 25, 0) },
  { name: '龙宫', pos: new THREE.Vector3(-15, 38, 40), tgt: new THREE.Vector3(0, 28, 0) },
  { name: '龙首', pos: new THREE.Vector3(35, 50, 15), tgt: new THREE.Vector3(-10, 60, 0) },
];

class Orbit {
  constructor(dom, target, yaw0, pitch0, dist0) {
    this.dom = dom;
    this.target = target.clone();
    this.yaw = yaw0; this.pitch = pitch0; this.dist = dist0;
    this.tYaw = yaw0; this.tPitch = pitch0; this.tDist = dist0;
    this.tTarget = target.clone();
    this.dragging = false; this.lx = 0; this.ly = 0;
    this.autoRotate = true;
    dom.addEventListener('pointerdown', e => {
      this.dragging = true; this.lx = e.clientX; this.ly = e.clientY;
      this.autoRotate = false;
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', e => {
      if (!this.dragging) return;
      this.tYaw -= (e.clientX - this.lx) * 0.005;
      this.tPitch += (e.clientY - this.ly) * 0.004;
      this.tPitch = Math.max(0.08, Math.min(1.4, this.tPitch));
      this.lx = e.clientX; this.ly = e.clientY;
    });
    dom.addEventListener('pointerup', () => { this.dragging = false; });
    dom.addEventListener('wheel', e => {
      e.preventDefault();
      this.tDist *= 1 + Math.sign(e.deltaY) * 0.09;
      this.tDist = Math.max(50, Math.min(300, this.tDist));
    }, { passive: false });
  }
  flyTo(pos, tgt, dur = 1.5) {
    // 从目标位置反推 yaw/pitch/dist
    const d = pos.clone().sub(tgt);
    this.tDist = d.length();
    this.tPitch = Math.asin(d.y / this.tDist);
    this.tYaw = Math.atan2(d.x, d.z);
    this.tTarget.copy(tgt);
    this.autoRotate = false;
  }
  update(dt) {
    if (this.autoRotate) this.tYaw += dt * 0.06;
    const s = 0.08;
    this.yaw += (this.tYaw - this.yaw) * s;
    this.pitch += (this.tPitch - this.pitch) * s;
    this.dist += (this.tDist - this.dist) * s;
    this.target.lerp(this.tTarget, s);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    camera.position.set(
      this.target.x + this.dist * cp * Math.sin(this.yaw),
      this.target.y + this.dist * sp,
      this.target.z + this.dist * cp * Math.cos(this.yaw)
    );
    camera.lookAt(this.target);
  }
}

const orbit = new Orbit(canvas, new THREE.Vector3(0, 25, 0), -0.6, 0.38, 140);
// 入场推轨
orbit.tDist = 200;
orbit.dist = 250;

// ============ UI ============
document.querySelectorAll('.view-btn').forEach((b, i) =>
  b.addEventListener('click', () => {
    orbit.flyTo(VIEWS[i].pos, VIEWS[i].tgt);
    document.querySelectorAll('.view-btn').forEach((bb, bi) => bb.classList.toggle('on', bi === i));
  })
);
canvas.addEventListener('dblclick', () => {
  orbit.flyTo(VIEWS[0].pos, VIEWS[0].tgt);
  orbit.autoRotate = true;
});

// ============ 主循环 ============
let last = performance.now();
let time = 0;

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;

  orbit.update(dt);

  // 水面动画
  waterMat.uniforms.uTime.value = time;

  // 气泡上升
  {
    const p = bubbleGeo.attributes.position;
    for (let i = 0; i < bubbleData.length; i++) {
      const b = bubbleData[i];
      let y = p.getY(i) + b.speed * dt;
      if (y > 22) y = 3 + rng() * 10;
      p.setXYZ(i,
        b.x + Math.sin(time * 0.8 + b.phase) * 1.5,
        y,
        b.z + Math.cos(time * 0.6 + b.phase) * 1.5
      );
    }
    p.needsUpdate = true;
  }

  // 鱼群环游
  {
    const p = fishGeo.attributes.position;
    for (let i = 0; i < fishBase.length; i++) {
      const f = fishBase[i];
      const a = time * 0.3 + f.phase;
      p.setXYZ(i,
        f.x + Math.cos(a) * f.r,
        f.y + Math.sin(time * 1.2 + f.phase) * 1.5,
        f.z + Math.sin(a) * f.r * 0.6
      );
    }
    p.needsUpdate = true;
  }

  // 云飘移
  for (const c of clouds) {
    c.position.x += dt * 0.8;
    if (c.position.x > 300) c.position.x = -300;
  }

  // 灯光晕呼吸
  for (const h of halos) {
    h.material.opacity = 0.5 + Math.sin(time * 1.5 + h.position.x * 0.1) * 0.15;
  }

  // 星光闪烁
  starMat.opacity = 0.35 + Math.sin(time * 0.4) * 0.1;

  renderer.render(scene, camera);
}

requestAnimationFrame(() => {
  loop(performance.now());
  setTimeout(() => document.getElementById('veil')?.classList.add('gone'), 400);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.__DBG = { scene, renderer, camera, solid, glow };
