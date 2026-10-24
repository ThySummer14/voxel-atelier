import * as THREE from '../vendor/three.module.js';
import { buildWorld } from './world.js';
import { World, jitter, hash3 } from './voxel.js';

// ---------- 基础 ----------
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf2ddb0, 250, 540);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1600);

// ---------- 天空（屏幕空间暖秋渐变） ----------
function makeSkyTexture() {
  const cv = document.createElement('canvas');
  cv.width = 32; cv.height = 512;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, '#7fa8c4');
  g.addColorStop(0.34, '#c9ccb4');
  g.addColorStop(0.54, '#ead2a4');
  g.addColorStop(0.74, '#f6dcab');
  g.addColorStop(1.0, '#f2d5a0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 512);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
scene.background = makeSkyTexture();

// ---------- 体素世界 ----------
const probe = new URLSearchParams(location.search).get('probe');
const world = buildWorld();
if (probe === '9' || probe === '10' || probe === '11' || probe === '13') {
  // 最小复现：南向阶梯坡 + 平台 + 独立墙
  world.clear();
  for (let i = 0; i < 10; i++) world.fill(-10, 0, 12 - i, 10, i, 12 - i, 0x5a6570);
  world.fill(-10, 10, 0, 10, 10, 2, 0x8e8574);        // 平台顶
  world.fill(-10, 0, -6, 10, 6, -6, 0xf0e8d5);        // 南向白墙
}
const voxelMat = probe === '1'
  ? new THREE.MeshBasicMaterial({ vertexColors: true })
  : new THREE.MeshLambertMaterial({ vertexColors: true, side: probe === '14' ? THREE.DoubleSide : THREE.FrontSide });
if (probe === '1') { renderer.toneMapping = THREE.NoToneMapping; scene.fog = null; }
const worldMesh = world.buildMesh(voxelMat);
worldMesh.castShadow = true;
worldMesh.receiveShadow = true;
scene.add(worldMesh);

// ---------- 光照：低角度暖阳（偏南，晒热南坡与瓦面） ----------
// 注意：r155+ 物理光照下 Lambert 按 1/π 衰减，光强需按 legacy 数值 ×π
const sun = new THREE.DirectionalLight(0xffd9a6, 8.2);
sun.position.set(-130, 110, 95);
sun.target.position.set(0, 10, -25);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
const sc = sun.shadow.camera;
sc.left = -200; sc.right = 200; sc.top = 200; sc.bottom = -200;
sc.near = 20; sc.far = 520;
sun.shadow.normalBias = 1.4;
sun.shadow.bias = -0.0002;
sc.updateProjectionMatrix();
scene.add(sun, sun.target);

const hemi = new THREE.HemisphereLight(0xcfe0ee, 0xcbb086, 3.1);
scene.add(hemi);

// 冷调补光（从东北补一点体积感）
const fill = new THREE.DirectionalLight(0xb9c9dd, 1.0);
fill.position.set(120, 60, -90);
scene.add(fill);

// 调试探针（?probe=N）
if (probe === '2') { renderer.shadowMap.enabled = false; }
if (probe === '3') { hemi.intensity = 0; fill.intensity = 0; }
if (probe === '10') { sun.position.set(0, 200, 0); sun.shadow.normalBias = 1.4; }
if (probe === '11') { sun.position.set(0, 60, 200); sun.shadow.normalBias = 1.4; }
if (probe === '12') { renderer.shadowMap.enabled = false; hemi.intensity = 0; fill.intensity = 0; }
if (probe === '4') { renderer.shadowMap.type = THREE.BasicShadowMap; sun.shadow.normalBias = 0; sun.shadow.bias = 0; }
if (probe === '5') { sun.shadow.normalBias = 0; sun.shadow.bias = 0; }
if (probe === '6') { sun.shadow.normalBias = 0.4; sun.shadow.bias = 0; }
if (probe === '7') { sun.shadow.bias = 0.0015; }
if (probe === '8') { sun.shadow.bias = 0.004; }
if (probe === '9' || probe === '10' || probe === '11' || probe === '13') {
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  sun.shadow.camera.updateProjectionMatrix();
  sun.target.position.set(0, 5, 4);
}
if (probe === '13') {
  sun.position.set(0, 60, 200);
  renderer.shadowMap.enabled = false;
  hemi.intensity = 0; fill.intensity = 0;
  window.__m = worldMesh;
}
if (probe === '15' || probe === '16' || probe === '17') {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshLambertMaterial({ color: 0x5a6570 })
  );
  plane.position.set(-28, 40, 10);
  scene.add(plane);
  if (probe === '15') sun.position.set(0, 60, 200);       // 正南
  if (probe === '16') sun.position.set(-130, 110, 95);    // 西南(默认)
  if (probe === '17') sun.position.set(-60, 130, 160);    // 偏南西南、更高
  renderer.shadowMap.enabled = false;
  hemi.intensity = 0; fill.intensity = 0;
  window.__sun = sun;
  sun.target.position.set(0, 5, 4);
}

// ---------- 体素云（不受光、不入雾，永远亮） ----------
const cloudMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
function makeCloud(seed) {
  const cw = new World();
  const blobs = 3 + Math.floor(hash3(seed, 1, 2) * 3);
  let ox = 0;
  for (let b = 0; b < blobs; b++) {
    const r = 3 + Math.floor(hash3(seed, b, 7) * 4);
    const cy = 2 + Math.floor(hash3(seed, b, 13) * 2);
    const cxx = ox + r, czz = Math.floor(hash3(seed, b, 21) * 3);
    for (let dx = -r - 1; dx <= r + 1; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 0; dy <= 2; dy++) {
          const d2 = (dx * dx) / (r * r) + (dz * dz) / 9 + dy * dy / 6;
          if (d2 > 1 - dy * 0.22) continue;
          cw.set(cxx + dx, cy + dy, czz + dz, jitter(0xf8f3e7, dx, dy, dz, 0.03));
        }
    ox += r + 2;
  }
  const m = cw.buildMesh(cloudMat);
  return m;
}
const clouds = [];
for (let i = 0; i < 5; i++) {
  const c = makeCloud(i * 3.7 + 1);
  const scale = 2.2 + hash3(i, 5, 9) * 1.6;
  c.scale.setScalar(scale);
  c.position.set(-320 + hash3(i, 2, 3) * 640, 105 + hash3(i, 4, 6) * 45, -210 + hash3(i, 7, 8) * 130);
  scene.add(c);
  clouds.push(c);
}

// ---------- 炊烟（细缕循环上升） ----------
const smokeMat = new THREE.MeshBasicMaterial({ color: 0xf2ead8, fog: true });
const smokeGeo = new THREE.BoxGeometry(1, 1, 1);
const plumes = [];
function addPlume(x, y, z, phase) {
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(smokeGeo, smokeMat);
    m.userData.i = i;
    scene.add(m);
    puffs.push(m);
  }
  plumes.push({ x, y, z, phase, puffs });
}
addPlume(-25, 35, -32, 0);
addPlume(-45, 34, -33, 2.6);
addPlume(28, 36, -62, 4.4);

function updateSmoke(t) {
  for (const p of plumes) {
    for (const m of p.puffs) {
      const i = m.userData.i;
      const life = ((t * 0.13 + i * 0.082 + p.phase) % 1);
      const ease = life * life;
      m.position.set(
        p.x + Math.sin(t * 0.5 + i * 1.7 + p.phase) * (0.8 + ease * 5),
        p.y + life * 24,
        p.z + Math.cos(t * 0.35 + i * 2.3) * (0.5 + ease * 2.5)
      );
      const s = 0.5 + life * 1.6;
      m.scale.setScalar(s);
      m.visible = life < 0.96;
    }
  }
}

// ---------- 飞鸟（黑色小 v，绕场缓飞） ----------
const birdMat = new THREE.MeshBasicMaterial({ color: 0x2e2a26, fog: true });
const birds = [];
for (let i = 0; i < 3; i++) {
  const g = new THREE.Group();
  const wl = new THREE.Mesh(smokeGeo, birdMat); wl.scale.set(2.6, 0.35, 0.6);
  const wr = new THREE.Mesh(smokeGeo, birdMat); wr.scale.set(2.6, 0.35, 0.6);
  wl.position.x = -1.2; wr.position.x = 1.2;
  g.add(wl, wr);
  scene.add(g);
  birds.push({ g, off: i * 2.1, r: 150 + i * 22, h: 62 + i * 9, sp: 0.05 + i * 0.012 });
}
function updateBirds(t) {
  for (const b of birds) {
    const a = t * b.sp + b.off;
    b.g.position.set(Math.cos(a) * b.r, b.h + Math.sin(a * 2.3) * 4, Math.sin(a) * b.r - 30);
    b.g.rotation.y = -a + Math.PI / 2;
    b.g.children[0].rotation.z = Math.sin(t * 7 + b.off) * 0.5;
    b.g.children[1].rotation.z = -Math.sin(t * 7 + b.off) * 0.5;
  }
}

// ---------- 自制轨道相机 ----------
class Orbit {
  constructor(dom, target, yaw0 = 0, pitch0 = 0.40, dist0 = 168) {
    this.dom = dom;
    this.target = target;
    this.yaw = yaw0; this.pitch = pitch0; this.dist = dist0;
    this.tYaw = yaw0; this.tPitch = pitch0; this.tDist = dist0;
    this.dragging = false; this.lx = 0; this.ly = 0;
    dom.addEventListener('pointerdown', e => {
      this.dragging = true; this.lx = e.clientX; this.ly = e.clientY;
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', e => {
      if (!this.dragging) return;
      this.tYaw -= (e.clientX - this.lx) * 0.005;
      this.tPitch += (e.clientY - this.ly) * 0.004;
      this.tPitch = Math.max(0.1, Math.min(1.32, this.tPitch));
      this.lx = e.clientX; this.ly = e.clientY;
    });
    dom.addEventListener('pointerup', () => { this.dragging = false; });
    dom.addEventListener('wheel', e => {
      e.preventDefault();
      this.tDist *= 1 + Math.sign(e.deltaY) * 0.09;
      this.tDist = Math.max(70, Math.min(360, this.tDist));
    }, { passive: false });
  }
  update() {
    const s = 0.12;
    this.yaw += (this.tYaw - this.yaw) * s;
    this.pitch += (this.tPitch - this.pitch) * s;
    this.dist += (this.tDist - this.dist) * s;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    camera.position.set(
      this.target.x + this.dist * cp * Math.sin(this.yaw),
      this.target.y + this.dist * sp,
      this.target.z + this.dist * cp * Math.cos(this.yaw)
    );
    camera.lookAt(this.target);
  }
}
const viewP = new URLSearchParams(location.search).get('view');
let vy = 0, vp = 0.40, vd = 168;
if (viewP) { [vy, vp, vd] = viewP.split(',').map(Number); }
const orbit = new Orbit(renderer.domElement, new THREE.Vector3(0, 13, -16), vy, vp, vd);

// ---------- 主循环 ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  orbit.update();
  updateSmoke(t);
  updateBirds(t);
  for (const c of clouds) {
    c.position.x += dt * 1.1;
    if (c.position.x > 360) c.position.x = -360;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
