// main.js — 上河虹桥：渲染器 / 灯光阴影 / 相机系统 / UI / 主循环

import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { EffectComposer } from '../vendor/EffectComposer.js';
import { RenderPass } from '../vendor/RenderPass.js';
import { UnrealBloomPass } from '../vendor/UnrealBloomPass.js';
import { OutputPass } from '../vendor/OutputPass.js';
import { buildScene } from './build.js';
import { createAmbient, PHASES } from './ambient.js';
import { createCrowd } from './people.js';

// ============ 基础 ============
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd8e2d4, 150, 430);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 1100);
const HERO = { pos: new THREE.Vector3(-64, 49, -48), tgt: new THREE.Vector3(10, 9, 7) };
camera.position.copy(HERO.pos).multiplyScalar(1.5);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(HERO.tgt);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 18;
controls.maxDistance = 260;
controls.maxPolarAngle = 1.52;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;

// ============ 灯光 ============
const sun = new THREE.DirectionalLight(0xfff0d2, 3.0);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -115; sun.shadow.camera.right = 115;
sun.shadow.camera.top = 115; sun.shadow.camera.bottom = -115;
sun.shadow.camera.near = 30; sun.shadow.camera.far = 460;
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 1.4;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xbcd6e4, 0xb09a78, 0.9);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0xffffff, 0.10));

// ============ 场景构建 ============
const t0 = performance.now();
const build = buildScene();
scene.add(build.root);
console.log(`[上河虹桥] 体素 ${build.stats.voxels} · 四边面 ${build.stats.quads} · 三角形 ${build.stats.quads * 2} · 生成 ${Math.round(performance.now() - t0)}ms`);

// 氛围层（先建，水面材质由它提供）
const ambient = createAmbient(scene, build, {});

// 水面
const waterMesh = new THREE.Mesh(build.waterGeo.geometry, ambient.waterMat);
waterMesh.renderOrder = 10;
scene.add(waterMesh);

const crowd = createCrowd(scene, build.deckY);
crowd.addVendors(build.stalls);
const oars = crowd.addBoatCrew(build.boat.group);
const sampanCtl = crowd.addSampanCrew(build.sampanMove.group, true);
crowd.addSampanCrew(build.sampanMoored, false); // 泊船渔翁（静）

// ============ 后期 ============
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.18, 0.55, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ============ 相机机位 ============
const VIEWS = [
  { name: '全景', pos: new THREE.Vector3(-64, 49, -48), tgt: new THREE.Vector3(10, 9, 7) },
  { name: '桥心', pos: new THREE.Vector3(-16, 33, -24), tgt: new THREE.Vector3(2, 10, 6) },
  { name: '船头', pos: new THREE.Vector3(36, 9, -2), tgt: new THREE.Vector3(-6, 17, 3) },
];
let tween = null;
function flyTo(view, dur = 1.7) {
  tween = {
    t: 0, dur,
    p0: camera.position.clone(), p1: view.pos.clone(),
    t0v: controls.target.clone(), t1v: view.tgt.clone(),
  };
}
function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

// 入场推轨
let intro = { t: 0, dur: 3.4 };
flyTo(VIEWS[0], 3.4);

// ============ 时相 ============
let tour = false, tourTimer = 0;
function setPhase(i, btn) {
  ambient.setPhase(i);
  document.querySelectorAll('.phase-btn').forEach((b, bi) => b.classList.toggle('on', bi === i));
}

// ============ UI ============
document.querySelectorAll('.view-btn').forEach((b, i) => b.addEventListener('click', () => flyTo(VIEWS[i])));
document.querySelectorAll('.phase-btn').forEach((b, i) => b.addEventListener('click', () => { setPhase(i); tour = false; syncTour(); }));
const tourBtn = document.getElementById('tourBtn');
function syncTour() { tourBtn.classList.toggle('on', tour); }
tourBtn.addEventListener('click', () => { tour = !tour; tourTimer = 0; syncTour(); });
canvas.addEventListener('dblclick', () => flyTo(VIEWS[0]));
window.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '3') flyTo(VIEWS[+e.key - 1]);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ============ 主循环 ============
const clock = new THREE.Clock();
let time = 0;
const DEG = THREE.MathUtils.degToRad;

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  time += dt;

  // 漕船过桥（戏眼）：过桥后徐徐立桅
  const boat = build.boat;
  boat.x += boat.speed * dt;
  if (boat.x > 34) boat.x = -26;
  boat.group.position.x = boat.x;
  const mastTarget = boat.x < 7 ? DEG(62) : DEG(2);
  boat.mast.rotation.z += (mastTarget - boat.mast.rotation.z) * Math.min(1, dt * 0.55);
  for (const o of oars) o.mesh.rotation.x = (o.s > 0 ? 0.55 : -0.55) + Math.sin(time * 2.3 + o.s) * 0.22 * o.s;

  // 舢板逆流撑篙
  const sp = build.sampanMove;
  sp.x += sp.speed * dt;
  if (sp.x < -46) sp.x = 46;
  sp.group.position.x = sp.x;
  sp.group.position.y = 3 + Math.sin(time * 1.8) * 0.06;
  sp.group.rotation.z = Math.sin(time * 1.3) * 0.012;
  if (sampanCtl.pole) sampanCtl.pole.rotation.z = 0.35 + Math.sin(time * 1.6) * 0.28;
  build.sampanMoored.position.y = 3 + Math.sin(time * 1.2 + 2) * 0.05;

  // 柳浪
  for (const w of build.willows) w.group.rotation.z = Math.sin(time * 0.8 + w.phase) * 0.018;

  crowd.update(dt);

  // 巡时
  if (tour) {
    tourTimer += dt;
    if (tourTimer > 42) {
      tourTimer = 0;
      setPhase((ambient.phaseIdx + 1) % PHASES.length);
    }
  }

  // 相机
  if (tween) {
    tween.t += dt / tween.dur;
    const k = easeInOut(Math.min(1, tween.t));
    camera.position.lerpVectors(tween.p0, tween.p1, k);
    controls.target.lerpVectors(tween.t0v, tween.t1v, k);
    if (tween.t >= 1) tween = null;
  } else if (intro) {
    intro.t += dt;
    if (intro.t >= intro.dur) intro = null;
  }
  controls.update();

  ambient.update(dt, {
    sun, hemi, bloom, renderer, glowMat: build.glowMat,
    boatX: boat.x, boatZ: 3, time,
  });

  composer.render();
}

// 首帧后揭幕
window.__DBG = { scene, renderer, composer, build, sun, hemi, camera };
requestAnimationFrame(() => {
  loop();
  setTimeout(() => document.getElementById('veil').classList.add('gone'), 350);
});
