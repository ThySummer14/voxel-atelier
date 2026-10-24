import * as THREE from '../vendor/three.module.js';
import { World, jitter, mix, shade, hash3, clamp, smoothstep, vnoise2 } from './voxel.js';
import { buildAll, makeBoat, makeWaterWheel, makeHeron, SUN_DIR } from './world.js';

// ============================================================================
//  渲染 · 天空 · 光照 · 动画 · 交互
// ============================================================================
const app = document.getElementById('app');
const loader = document.getElementById('loader');
const bar = document.getElementById('bar');
const loaderTxt = document.getElementById('loadertxt');

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf2a765, 380, 900);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 2, 2400);

// ---------- 天空穹（着色器渐变 + 日辉 + 星） ----------
const skyUniforms = {
  uTop: { value: new THREE.Color() }, uUp: { value: new THREE.Color() },
  uMid: { value: new THREE.Color() }, uLow: { value: new THREE.Color() },
  uHz: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() },
  uGround: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() },
  uSunDir: { value: new THREE.Vector3(...SUN_DIR) },
  uSunI: { value: 1 }, uStars: { value: 0 }, uTime: { value: 0 },
};
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1400, 40, 24),
  new THREE.ShaderMaterial({
    uniforms: skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 uTop,uUp,uMid,uLow,uHz,uGlow,uGround,uSunCol,uSunDir;
      uniform float uSunI,uStars,uTime;
      varying vec3 vDir;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y, t = clamp(h,0.0,1.0);
        vec3 col = uHz;
        col = mix(col, uLow, smoothstep(0.0, 0.055, t));
        col = mix(col, uMid, smoothstep(0.05, 0.17, t));
        col = mix(col, uUp,  smoothstep(0.15, 0.40, t));
        col = mix(col, uTop, smoothstep(0.38, 0.92, t));
        col = mix(uGround, col, smoothstep(-0.12, 0.004, h));
        float sd = max(dot(d, uSunDir), 0.0);
        float glow = pow(sd,6.0)*0.07 + pow(sd,40.0)*0.22 + pow(sd,220.0)*0.70;
        col += uGlow * glow * uSunI;
        float horiz = exp(-abs(h)*20.0);
        float az = pow(max(dot(normalize(vec3(d.x,0.001,d.z)), normalize(vec3(uSunDir.x,0.001,uSunDir.z))),0.0), 3.0);
        col += uGlow * horiz * az * 0.42 * uSunI;
        if (uStars > 0.002) {
          vec3 q = floor(d * 190.0);
          float n = h21(q.xy + q.z * 19.7);
          float s = step(0.9986, n) * (0.55 + 0.45*sin(uTime*1.6 + n*57.0));
          col += vec3(0.88,0.92,1.0) * s * uStars * smoothstep(0.03, 0.4, h);
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
);
sky.frustumCulled = false;
sky.renderOrder = -10;
scene.add(sky);

// ---------- 体素方块太阳 ----------
const sunW = new World();
{
  const R = 22;
  for (let x = -R; x <= R; x++)
    for (let y = -R; y <= R; y++) {
      const d = Math.sqrt(x * x + y * y);
      if (d > R) continue;
      if (d > R * 0.86 && hash3(x, y, 5) < 0.35) continue;
      const k = d < R * 0.62 ? 1 : d < R * 0.9 ? 0.93 : 0.8;
      sunW.set(x, y, 0, jitter(shade(0xfff2c8, -(1 - k) * 0.3), x, y, 0, 0.02));
    }
}
const sunMesh = sunW.buildMesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
const sunGroup = new THREE.Group();
sunGroup.add(sunMesh);
scene.add(sunGroup);

// ---------- 光照 ----------
const sun = new THREE.DirectionalLight(0xffdcac, 2.5);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -360; sun.shadow.camera.right = 360;
sun.shadow.camera.top = 360; sun.shadow.camera.bottom = -360;
sun.shadow.camera.near = 20; sun.shadow.camera.far = 900;
sun.shadow.normalBias = 1.6;
sun.shadow.bias = -0.0018;
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun, sun.target);

const hemi = new THREE.HemisphereLight(0xc4b0c0, 0xcfa478, 0.95);
scene.add(hemi);

// 相机侧冷补光：让正面体块不死黑，与暖阳形成冷暖对比
const fill = new THREE.DirectionalLight(0xa8b2d0, 0.78);
fill.position.set(60, 150, 330);
scene.add(fill);

// ============================================================================
//  暮色：三个关键帧插值
// ============================================================================
const MOODS = [
  { // 0 日落前
    el: 11.0, sun: 0xffe6bc, sunI: 2.7, hemi: 1.7, fillI: 1.05, exp: 1.00, stars: 0, lamp: 0.0, fog: [560, 1750],
    sky: { top: 0x2a5f92, up: 0x628fb4, mid: 0x9fb0b6, low: 0xe6bd93, hz: 0xf7dcae, glow: 0xffe6b8, ground: 0x9d8a78 },
  },
  { // 0.5 落日
    el: 6.4, sun: 0xffb070, sunI: 2.5, hemi: 1.0, fillI: 1.0, exp: 1.00, stars: 0.05, lamp: 0.5, fog: [520, 1600],
    sky: { top: 0x241c50, up: 0x5a3f76, mid: 0x9c5568, low: 0xd4715c, hz: 0xf8a95c, glow: 0xffc98a, ground: 0x6d4a54 },
  },
  { // 1 蓝调
    el: 2.2, sun: 0xff7a3a, sunI: 1.1, hemi: 0.55, fillI: 0.7, exp: 0.94, stars: 0.95, lamp: 1.0, fog: [480, 1250],
    sky: { top: 0x100e2c, up: 0x281e54, mid: 0x472a58, low: 0x76334a, hz: 0xbd5f3a, glow: 0xff9a5c, ground: 0x33263f },
  },
];
const LIGHT_EL = 16.5 * Math.PI / 180;   // 投影用光位：保证掠射角下不产生阴影痤疮

const state = { mood: 0.5, spin: true, paused: false, dirty: true };

const _cA = new THREE.Color(), _cB = new THREE.Color();
function applyMood(t) {
  t = clamp(t, 0, 1) * 2;
  const i = Math.min(1, Math.floor(t)), k = t - i;
  const A = MOODS[i], B = MOODS[Math.min(2, i + 1)];
  const el = A.el + (B.el - A.el) * k;
  const elR = el * Math.PI / 180;
  // 视觉日轮
  const dir = new THREE.Vector3(
    Math.sin(0.28) * Math.cos(elR), Math.sin(elR), -Math.cos(0.28) * Math.cos(elR)
  ).normalize();
  skyUniforms.uSunDir.value.copy(dir);

  // 投影光：方向一致、仰角抬高
  const ldir = new THREE.Vector3(
    Math.sin(0.28) * Math.cos(LIGHT_EL), Math.sin(LIGHT_EL), -Math.cos(0.28) * Math.cos(LIGHT_EL)
  );
  sun.position.copy(ldir).multiplyScalar(520).add(new THREE.Vector3(0, 0, 40));
  sun.target.position.set(0, 0, 40);
  sun.intensity = A.sunI + (B.sunI - A.sunI) * k;
  _cA.setHex(A.sun); _cB.setHex(B.sun); sun.color.lerpColors(_cA, _cB, k);
  hemi.intensity = A.hemi + (B.hemi - A.hemi) * k;
  fill.intensity = A.fillI + (B.fillI - A.fillI) * k;
  renderer.toneMappingExposure = A.exp + (B.exp - A.exp) * k;
  skyUniforms.uSunI.value = 0.78 + 0.42 * (1 - clamp(t, 0, 1));
  skyUniforms.uStars.value = A.stars + (B.stars - A.stars) * k;
  for (const key of ['top', 'up', 'mid', 'low', 'hz', 'glow', 'ground']) {
    _cA.setHex(A.sky[key]); _cB.setHex(B.sky[key]);
    skyUniforms['u' + key[0].toUpperCase() + key.slice(1)].value.lerpColors(_cA, _cB, k);
  }
  // 雾：取天际色与中高空的混合，避免整幅染成单一橙色
  scene.fog.color.copy(skyUniforms.uHz.value).lerp(skyUniforms.uMid.value, 0.24);
  scene.fog.near = A.fog[0] + (B.fog[0] - A.fog[0]) * k;
  scene.fog.far = A.fog[1] + (B.fog[1] - A.fog[1]) * k;
  lampK = A.lamp + (B.lamp - A.lamp) * k;
  if (lampMat) lampMat.color.setScalar(0.10 + 0.90 * lampK);
  if (waterMat) {
    const d = clamp(t, 0, 1);
    const g = 1.22 - 0.5 * d;
    waterMat.color.setRGB(g, g * 0.99, g * 1.01);
  }
  if (sunMat) sunMat.color.setScalar(1 - 0.2 * clamp(t, 0, 1));
}
let lampK = 0.5, lampMat = null, waterMat = null, sunMat = null;

// ============================================================================
//  构建体素世界
// ============================================================================
let W = null, meshes = {}, dyn = {};
const R = () => new Promise(r => requestAnimationFrame(r));

async function boot() {
  loaderTxt.textContent = '推演盐场地形…';
  await R();
  W = buildAll();
  const vox = W.far.size + W.main.size + W.water.size + W.lamp.size + W.glint.size;
  document.getElementById('vox').textContent = (vox / 1000).toFixed(0) + 'k';

  const lambert = (o) => new THREE.MeshLambertMaterial({ vertexColors: true, ...o });
  const total = 5;
  let done = 0;
  const step = async (label) => {
    loaderTxt.textContent = label;
    await R();
    done++;
    bar.style.width = (done / total * 100).toFixed(1) + '%';
  };

  await step('铺设海面与滩涂…');
  meshes.far = await W.far.buildMeshAsync(lambert({}), { ao: false, skipBottom: true, bright: 0.94 },
    p => { bar.style.width = (p * 0.2 * 100).toFixed(1) + '%'; });

  await step('开凿盐田梯级…');
  meshes.main = await W.main.buildMeshAsync(lambert({}), { ao: true, skipBottom: true },
    p => { bar.style.width = (0.2 + p * 0.45 * 100).toFixed(1) + '%'; });

  await step('注入池水…');
  waterMat = lambert({});
  meshes.water = await W.water.buildMeshAsync(waterMat, { ao: true, skipBottom: true },
    p => { bar.style.width = (0.65 + p * 0.15 * 100).toFixed(1) + '%'; });

  await step('点灯…');
  lampMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  meshes.lamp = await W.lamp.buildMeshAsync(lampMat, { ao: true, skipBottom: true },
    p => { bar.style.width = (0.8 + p * 0.1 * 100).toFixed(1) + '%'; });

  await step('撒下波光…');
  const glintMat = new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  meshes.glint = await W.glint.buildMeshAsync(glintMat, { ao: false, skipBottom: true },
    p => { bar.style.width = (0.9 + p * 0.1 * 100).toFixed(1) + '%'; });

  // 浪花
  const surfW = new World();
  for (let x = -300; x <= 300; x++) {
    const z = -148 - Math.round(vnoise2(x * 0.05, 0, 3) * 4);
    surfW.set(x, 1, z, 0xffffff);
    if (hash3(x, 0, 7) < 0.4) surfW.set(x, 1, z - 1, 0xf0e8da);
    if (hash3(x, 0, 11) < 0.22) surfW.set(x, 1, z + 1, 0xf6f0e4);
  }
  const surfMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, fog: true });
  meshes.surf = surfW.buildMesh(surfMat, { ao: false, skipBottom: true });

  for (const k of ['far', 'main', 'water', 'lamp', 'glint', 'surf']) {
    const m = meshes[k];
    m.castShadow = (k === 'main');   // far 为单层大平面，投影只会产生痤疮
    m.receiveShadow = (k === 'far' || k === 'main' || k === 'water');
    scene.add(m);
  }
  sunMat = sunMesh.material;

  // 体素统计
  const faces = Object.values(meshes).reduce((s, m) => s + (m.userData.faces || 0), 0);
  document.getElementById('facets').textContent = (faces / 1000).toFixed(0) + 'k';

  buildDynamic();
  applyMood(state.mood);
  window.__s = { renderer, scene, camera, meshes, sun, hemi, fill, orbit, W };

  loader.classList.add('gone');
  setTimeout(() => loader.remove(), 700);
  window.__ready = true;
}

// ============================================================================
//  动态体：风车水轮 / 渔船 / 白鹭 / 海鸟 / 云 / 炊烟
// ============================================================================
const clouds = [], birds = [], herons = [], boats = [], plumes = [];

function buildDynamic() {
  const dynMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const dynBasic = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });

  // 风车水轮
  const wheel = makeWaterWheel(dynMat);
  wheel.position.set(W.wheel[0], W.wheel[1], W.wheel[2]);
  wheel.castShadow = true;
  scene.add(wheel);
  dyn.wheel = wheel;
  // 轮轴支架
  const axleW = new World();
  axleW.fill(-2, -14, -7, -1, -3, -6, 0x3f2c1f);
  axleW.fill(1, -14, -7, 2, -3, -6, 0x3f2c1f);
  const axle = axleW.buildMesh(dynMat);
  axle.position.set(W.wheel[0], W.wheel[1], W.wheel[2]);
  scene.add(axle);

  // 渔船（码头泊 2 + 海上行 1）
  const bmat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const spots = [[150, -46, 0.06], [130, -96, 0.2], [70, -178, 0.0]];
  spots.forEach((s, i) => {
    const b = makeBoat(bmat);
    b.position.set(s[0], 1.2, s[1]);
    b.rotation.y = s[2];
    b.castShadow = true;
    scene.add(b);
    boats.push({ m: b, ph: i * 2.1, sail: i === 2 });
  });

  // 白鹭
  const hmat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const hSpots = [[-6, 5, 34], [58, 6, 74], [96, 4, -6], [30, 3, 10]];
  hSpots.forEach((s, i) => {
    const h = makeHeron(hmat);
    h.position.set(s[0], s[1], s[2]);
    h.rotation.y = i * 1.7;
    scene.add(h);
    herons.push({ m: h, ox: s[0], oz: s[2], ph: i * 1.9, sp: 0.16 + i * 0.05, r: 3 + i * 2 });
  });

  // 海鸟（两群）
  const bmat2 = new THREE.MeshBasicMaterial({ color: 0x2a2430, fog: true });
  const box = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 11; i++) {
    const g = new THREE.Group();
    const wl = new THREE.Mesh(box, bmat2); wl.scale.set(2.6, 0.3, 0.7);
    const wr = new THREE.Mesh(box, bmat2); wr.scale.set(2.6, 0.3, 0.7);
    wl.position.x = -1.4; wr.position.x = 1.4;
    const bd = new THREE.Mesh(box, bmat2); bd.scale.set(0.9, 0.5, 0.7);
    g.add(wl, wr, bd);
    scene.add(g);
    birds.push({ g, wl, wr, ph: i * 0.9, flock: i < 6 ? 0 : 1, r: 96 + (i % 6) * 14, h: 44 + (i % 4) * 13 });
  }

  // 体素云（晚霞云带：上暖下冷的层积条）
  const CLOUD_TOP = 0xffdcb0, CLOUD_MID = 0xd88f6e, CLOUD_BOT = 0x6a5474;
  for (let i = 0; i < 7; i++) {
    const cw = new World();
    const seed = i * 13.7 + 3;
    const len = 4 + Math.floor(hash3(seed, 1, 2) * 5);
    let ox = 0;
    for (let b = 0; b < len; b++) {
      const r = 2 + Math.floor(hash3(seed, b, 7) * 4);
      const th = 1 + Math.floor(hash3(seed, b, 11) * 3);
      for (let dx = -r; dx <= r; dx++)
        for (let dz = -1; dz <= 1; dz++)
          for (let dy = 0; dy <= th; dy++) {
            const d2 = (dx * dx) / (r * r) + (dz * dz) / 5 + (dy * dy) / ((th + 1) * 1.8);
            if (d2 > 1) continue;
            const t = dy / (th + 0.9);
            cw.set(ox + dx, dy, dz, t > 0.6 ? CLOUD_TOP : t > 0.28 ? CLOUD_MID : CLOUD_BOT);
          }
      ox += Math.max(2, r - 1);
    }
    const m = cw.buildMesh(dynBasic);
    const sc = 4.2 + hash3(i, 3, 5) * 3.4;
    m.scale.set(sc * 1.9, sc * 0.7, sc);
    m.position.set(-700 + hash3(i, 2, 3) * 1400, 26 + hash3(i, 4, 6) * 62, -430 - hash3(i, 5, 8) * 400);
    scene.add(m);
    clouds.push({ m, sp: 1.4 + hash3(i, 6, 9) * 1.6 });
  }

  // 炊烟
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0xf0e0cc, fog: true, transparent: true, opacity: 0.55 });
  const sbox = new THREE.BoxGeometry(1, 1, 1);
  const src = [W.chimneys[0], W.chimneys[2], W.chimneys[4]];
  for (const s of src) {
    const puffs = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(sbox, smokeMat);
      m.userData.i = i;
      scene.add(m);
      puffs.push(m);
    }
    plumes.push({ x: s[0], y: s[1], z: s[2], puffs, ph: Math.random() * 6 });
  }
}

// ---------- 逐帧动画 ----------
function animate(t) {
  const sunDir = skyUniforms.uSunDir.value;
  skyUniforms.uTime.value = t;
  sky.position.copy(camera.position);
  sunGroup.position.copy(camera.position).addScaledVector(sunDir, 1250);
  sunGroup.lookAt(camera.position);

  // 水面微澜
  if (meshes.water) {
    meshes.water.position.y = Math.sin(t * 0.45) * 0.035;
    meshes.water.position.x = Math.sin(t * 0.31) * 0.02;
  }
  // 水轮
  if (dyn.wheel) dyn.wheel.rotation.z = -t * 0.62;

  // 渔船
  for (const b of boats) {
    b.m.position.y = 1.2 + Math.sin(t * 0.9 + b.ph) * 0.16;
    b.m.rotation.z = Math.sin(t * 0.75 + b.ph) * 0.045;
    b.m.rotation.x = Math.sin(t * 1.1 + b.ph * 1.4) * 0.03;
    if (b.sail) {
      const a = t * 0.012;
      b.m.position.x = 90 + Math.sin(a) * 190;
      b.m.position.z = -250 + Math.cos(a) * 120;
      b.m.rotation.y = Math.atan2(Math.cos(a) * 190, -Math.sin(a) * 120) + Math.PI / 2;
    }
  }
  // 白鹭踱步
  for (const h of herons) {
    const a = t * h.sp + h.ph;
    h.m.position.set(h.ox + Math.sin(a) * h.r, h.m.position.y + Math.sin(t * 0.8 + h.ph) * 0.02, h.oz + Math.cos(a * 0.8) * h.r * 0.6);
    h.m.rotation.y = Math.sin(a) * 1.2;
  }
  // 海鸟
  for (const b of birds) {
    const a = t * (b.flock ? 0.055 : 0.075) + b.ph;
    const cx = b.flock ? -60 : 120, cz = b.flock ? -230 : -300;
    b.g.position.set(cx + Math.cos(a) * b.r, b.h + Math.sin(a * 2.1) * 5, cz + Math.sin(a) * b.r * 0.8);
    b.g.rotation.y = -a + Math.PI / 2;
    const f = Math.sin(t * 6 + b.ph) * 0.6;
    b.wl.rotation.z = f; b.wr.rotation.z = -f;
  }
  // 云
  for (const c of clouds) {
    c.m.position.x += c.sp * 0.016;
    if (c.m.position.x > 700) c.m.position.x = -700;
  }
  // 炊烟
  for (const p of plumes) {
    for (const m of p.puffs) {
      const i = m.userData.i;
      const life = (t * 0.12 + i * 0.098 + p.ph) % 1;
      m.position.set(
        p.x + Math.sin(t * 0.45 + i * 1.6 + p.ph) * (0.6 + life * life * 5.5),
        p.y + life * 22,
        p.z + Math.cos(t * 0.32 + i * 2.1) * (0.4 + life * 2.4)
      );
      const s = 0.45 + life * 1.7;
      m.scale.setScalar(s);
      m.visible = life < 0.95;
    }
  }
  // 波光 / 浪花
  if (meshes.glint) {
    meshes.glint.material.opacity = (0.45 + 0.42 * Math.sin(t * 0.85)) * (1 - 0.55 * state.mood);
    meshes.glint.position.z = Math.sin(t * 0.22) * 1.2;
  }
  if (meshes.surf) {
    meshes.surf.material.opacity = 0.45 + 0.35 * Math.sin(t * 0.8);
    meshes.surf.position.y = Math.sin(t * 0.9) * 0.04;
  }
}

// ============================================================================
//  轨道相机（惯性 + 边界）
// ============================================================================
const VIEWS = {
  all: { yaw: 0.18, pitch: 0.20, dist: 300, tx: 0, ty: 6, tz: 20, name: '全景' },
  pans: { yaw: 0.44, pitch: 0.30, dist: 152, tx: 44, ty: 6, tz: 16, name: '盐田' },
  village: { yaw: -0.14, pitch: 0.19, dist: 148, tx: -68, ty: 7, tz: 38, name: '渔村' },
  sun: { yaw: 0.40, pitch: 0.115, dist: 268, tx: 10, ty: 5, tz: -50, name: '日落' },
};
class Orbit {
  constructor(dom) {
    this.t = { ...VIEWS.all };
    this.c = { ...VIEWS.all };
    this.drag = false; this.lx = 0; this.ly = 0; this.touched = false;
    dom.addEventListener('pointerdown', e => {
      this.drag = true; this.lx = e.clientX; this.ly = e.clientY; this.touched = true;
      state.spin = false; syncSpin();
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', e => {
      if (!this.drag) return;
      this.t.yaw -= (e.clientX - this.lx) * 0.0042;
      this.t.pitch += (e.clientY - this.ly) * 0.0032;
      this.t.pitch = clamp(this.t.pitch, 0.075, 0.62);
      this.t.yaw = clamp(this.t.yaw, -0.48, 0.98);
      this.lx = e.clientX; this.ly = e.clientY;
    });
    const up = () => { this.drag = false; };
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    dom.addEventListener('wheel', e => {
      e.preventDefault();
      this.t.dist *= 1 + Math.sign(e.deltaY) * 0.085;
      this.t.dist = clamp(this.t.dist, 85, 470);
      this.touched = true;
    }, { passive: false });
  }
  go(v) {
    const t0 = performance.now();
    const from = { ...this.c };
    const step = () => {
      const k = clamp((performance.now() - t0) / 1150, 0, 1);
      const s = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      for (const key of ['yaw', 'pitch', 'dist', 'tx', 'ty', 'tz'])
        this.t[key] = from[key] + (v[key] - from[key]) * s;
      this.c = { ...this.t };
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }
  update(dt) {
    if (state.spin) this.t.yaw = clamp(this.t.yaw + dt * 0.016, -0.48, 0.98);
    const s = 1 - Math.pow(0.0016, dt);
    for (const key of ['yaw', 'pitch', 'dist', 'tx', 'ty', 'tz'])
      this.c[key] += (this.t[key] - this.c[key]) * s;
    const { yaw, pitch, dist, tx, ty, tz } = this.c;
    const cp = Math.cos(pitch);
    camera.position.set(
      tx + dist * cp * Math.sin(yaw), ty + dist * Math.sin(pitch), tz + dist * cp * Math.cos(yaw)
    );
    camera.lookAt(tx, ty, tz);
  }
}
const orbit = new Orbit(renderer.domElement);

// ---------- URL 参数 ----------
const qs = new URLSearchParams(location.search);
if (qs.get('view')) {
  const [y, p, d] = qs.get('view').split(',').map(Number);
  Object.assign(orbit.t, { yaw: y, pitch: p, dist: d });
}
if (qs.get('mood')) state.mood = clamp(parseFloat(qs.get('mood')), 0, 1);
if (qs.get('spin') === '0') state.spin = false;
const STILL = qs.get('still') === '1';
if (STILL) state.spin = false;

// ---------- UI ----------
const $ = s => document.querySelector(s);
function syncSpin() { const b = $('#spin'); if (b) b.classList.toggle('on', state.spin); }

$('#mood').value = String(state.mood);
$('#moodval').textContent = ['日落前', '落日', '蓝调'][Math.round(state.mood * 2)];
$('#mood').addEventListener('input', e => {
  state.mood = parseFloat(e.target.value);
  $('#moodval').textContent = ['日落前', '落日', '蓝调'][Math.round(state.mood * 2)];
});
$('#spin').addEventListener('click', () => { state.spin = !state.spin; syncSpin(); });
$('#pause').addEventListener('click', () => {
  state.paused = !state.paused;
  $('#pause').classList.toggle('on', state.paused);
  $('#pause').textContent = state.paused ? '继续' : '暂停动画';
});
document.querySelectorAll('[data-view]').forEach(b => {
  b.addEventListener('click', () => {
    orbit.go(VIEWS[b.dataset.view]);
    document.querySelectorAll('[data-view]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  });
});
$('#shot').addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = '晚照盐田.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
});
$('#hide').addEventListener('click', () => document.body.classList.toggle('bare'));
addEventListener('keydown', e => {
  if (e.key === '1') $('[data-view=all]').click();
  if (e.key === '2') $('[data-view=pans]').click();
  if (e.key === '3') $('[data-view=village]').click();
  if (e.key === '4') $('[data-view=sun]').click();
  if (e.key === ' ') { e.preventDefault(); $('#pause').click(); }
  if (e.key.toLowerCase() === 'h') $('#hide').click();
});
syncSpin();

// ---------- 主循环 ----------
let last = performance.now(), fpsT = 0, fpsN = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.dirty) { applyMood(state.mood); state.dirty = false; }
  orbit.update(dt);
  if (!state.paused) animate(now / 1000);
  renderer.render(scene, camera);

  fpsN++; fpsT += dt;
  if (fpsT > 0.6) {
    $('#fps').textContent = Math.round(fpsN / fpsT);
    fpsT = 0; fpsN = 0;
  }
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// mood 滑杆需要连续刷新
setInterval(() => { state.dirty = true; }, 60);

requestAnimationFrame(loop);
boot();
