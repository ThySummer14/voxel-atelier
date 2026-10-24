/**
 * 北冥载山 —— 舞台、光影、星渊、镜头叙事
 */
import * as THREE from "three";
import { OrbitControls } from "../assets/controls/OrbitControls.js";
import { EffectComposer } from "../assets/postprocessing/EffectComposer.js";
import { RenderPass } from "../assets/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../assets/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "../assets/postprocessing/OutputPass.js";
import { Voxels, buildGeometry, MAT } from "./voxel.js";
import { buildKun, collectGlowSpots } from "./kun.js";
import { buildMountainWorld, collectLanterns } from "./mountain.js";

const VOX = 0.42;
const ORIGIN = [-6, -2, 0]; // 整体偏移，使构图居中

const CHAPTERS = [
  {
    id: 0,
    title: "北冥",
    index: "01 / 04",
    text: "北冥有鱼，其名为鲲。它不急着化鹏，只把一座人间负在背上，缓缓航过星渊。",
    cam: { pos: [10, 8, 74], target: [-2, 3, 0], fov: 40 },
  },
  {
    id: 1,
    title: "载山",
    index: "02 / 04",
    text: "山从鲲脊生长。三重檐的楼阁点亮窗火，石阶沿着苔色爬上云雾，像一枚被驮着的印章。",
    cam: { pos: [22, 32, 48], target: [2, 14, 0], fov: 32 },
  },
  {
    id: 2,
    title: "万灯",
    index: "03 / 04",
    text: "天再暗一寸，灯便再亮一寸。檐角、石阶、廊下——万点琥珀把神话钉在夜色里。",
    cam: { pos: [4, 22, 38], target: [2, 12, 0], fov: 30 },
  },
  {
    id: 3,
    title: "星瀑",
    index: "04 / 04",
    text: "水从崖口被虚空剪开，化作星瀑坠落。鲲目青荧，身侧浮光应答，像深海在呼吸。",
    cam: { pos: [32, -2, 46], target: [4, -10, 4], fov: 38 },
  },
];

const stage = document.getElementById("stage");
const veil = document.getElementById("veil");
const narrative = document.getElementById("narrative");
const chapterBtns = [...document.querySelectorAll(".chapter-btn")];

const qs = new URLSearchParams(location.search);
const LITE = qs.has("shot") || qs.has("lite");
const SHOT_CH = Math.max(0, Math.min(3, Number(qs.get("ch") || 0)));

// ————— renderer —————
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = false;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03050c);
scene.fog = new THREE.FogExp2(0x0a1528, 0.0055);

const camera = new THREE.PerspectiveCamera(
  CHAPTERS[0].cam.fov,
  window.innerWidth / window.innerHeight,
  0.1,
  600
);
camera.position.set(...CHAPTERS[0].cam.pos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 28;
controls.maxDistance = 180;
controls.minPolarAngle = 0.25;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(...CHAPTERS[0].cam.target);
controls.update();
controls.autoRotate = false;
controls.autoRotateSpeed = 0.22;
controls.enablePan = false;

// ————— lights —————
const hemi = new THREE.HemisphereLight(0x3a5a8a, 0x0a0814, 0.55);
scene.add(hemi);

const moonLight = new THREE.DirectionalLight(0xa8c8ff, 2.15);
moonLight.position.set(-70, 100, 55);
scene.add(moonLight);

const rim = new THREE.DirectionalLight(0x6a8ab8, 0.55);
rim.position.set(60, 20, -50);
scene.add(rim);

const fill = new THREE.DirectionalLight(0x2a3858, 0.28);
fill.position.set(40, -10, 30);
scene.add(fill);

const warmLights = [];
function addWarmLight(x, y, z, intensity = 1.1, dist = 28) {
  const L = new THREE.PointLight(0xffb347, intensity, dist, 2);
  L.position.set(x, y, z);
  scene.add(L);
  warmLights.push(L);
  return L;
}

// ————— build voxels —————
const world = new Voxels();
const kunApi = buildKun(world);
const deckYAt = kunApi.deckY;
buildMountainWorld(world, deckYAt);

const solidData = buildGeometry(world, {
  scale: VOX,
  origin: ORIGIN,
  group: "solid",
});
const emisData = buildGeometry(world, {
  scale: VOX,
  origin: ORIGIN,
  group: "emissive",
});
const waterData = buildGeometry(world, {
  scale: VOX,
  origin: ORIGIN,
  group: "water",
});

function toMesh(data, opts) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(data.normals, 3));
  g.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
  g.setIndex(new THREE.BufferAttribute(data.indices, 1));
  g.computeBoundingSphere();
  let m;
  if (opts.basic) {
    m = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: !!opts.transparent,
      opacity: opts.opacity ?? 1,
      depthWrite: opts.depthWrite !== false,
    });
  } else {
    m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: opts.roughness ?? 0.9,
      metalness: opts.metalness ?? 0.05,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: !!opts.transparent,
      opacity: opts.opacity ?? 1,
      depthWrite: opts.depthWrite !== false,
    });
  }
  return new THREE.Mesh(g, m);
}

const solidMesh = toMesh(solidData, { roughness: 0.9, metalness: 0.06 });
// 发光体：Basic 全亮，交给 Bloom
const emisMesh = toMesh(emisData, { basic: true });
const waterMesh = toMesh(waterData, {
  basic: true,
  transparent: true,
  opacity: 0.88,
  depthWrite: true,
});

scene.add(solidMesh, emisMesh, waterMesh);

// 暖点光：关键灯火位
const lanterns = collectLanterns(world);
const keyLanterns = lanterns.filter((l) => l.mat === MAT.LANTERN_CORE).slice(0, 8);
for (const l of keyLanterns) {
  addWarmLight(
    (l.pos[0] + ORIGIN[0]) * VOX,
    (l.pos[1] + ORIGIN[1]) * VOX,
    (l.pos[2] + ORIGIN[2]) * VOX,
    0.85,
    22
  );
}
// 楼阁主光
addWarmLight((4 + ORIGIN[0]) * VOX, (30 + ORIGIN[1]) * VOX, (0 + ORIGIN[2]) * VOX, 1.4, 36);

// 鲲目光
{
  const glows = collectGlowSpots(world).filter((p) => p[1] > 2 && p[0] > 40);
  if (glows.length) {
    const p = glows[0];
    addWarmLight(
      (p[0] + ORIGIN[0]) * VOX,
      (p[1] + ORIGIN[1]) * VOX,
      (p[2] + ORIGIN[2]) * VOX + 2,
      0.55,
      14
    ).color.set(0x7ec8ff);
  }
}

// ————— 月轮与星渊 —————
function makeMoon() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, "rgba(230,240,255,1)");
  g.addColorStop(0.35, "rgba(200,220,255,0.85)");
  g.addColorStop(0.7, "rgba(140,170,230,0.25)");
  g.addColorStop(1, "rgba(20,30,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(70, 70, 1);
  spr.position.set(-120, 110, -80);
  return spr;
}
scene.add(makeMoon());

function makeNebula() {
  const group = new THREE.Group();
  const colors = [0x1a1430, 0x0a2040, 0x203050, 0x142840];
  for (let i = 0; i < 8; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    const col = colors[i % colors.length];
    const r = (col >> 16) & 255, gg = (col >> 8) & 255, b = col & 255;
    g.addColorStop(0, `rgba(${r},${gg},${b},0.55)`);
    g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.7,
    });
    const spr = new THREE.Sprite(mat);
    const s = 90 + (i % 4) * 40;
    spr.scale.set(s, s * 0.55, 1);
    spr.position.set(
      Math.cos(i * 1.7) * 160,
      10 + Math.sin(i * 2.1) * 70,
      Math.sin(i * 1.3) * 160 - 40
    );
    group.add(spr);
  }
  return group;
}
scene.add(makeNebula());

// 星场
function makeStars(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 180 + Math.random() * 220;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.6 + 30;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    const w = 0.7 + Math.random() * 0.3;
    const tint = Math.random();
    col[i * 3] = w * (0.75 + tint * 0.25);
    col[i * 3 + 1] = w * (0.8 + tint * 0.15);
    col[i * 3 + 2] = w * (0.95 + tint * 0.05);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({
    size: 0.85,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  return new THREE.Points(g, m);
}
const stars = makeStars(LITE ? 800 : 2200);
scene.add(stars);

// 落光尘 / 流萤
function makeMotes(count) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 1] = Math.random() * 50 - 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    seed[i] = Math.random() * Math.PI * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const m = new THREE.PointsMaterial({
    size: 0.28,
    color: 0xffd28a,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.userData.base = pos.slice();
  pts.userData.seed = seed;
  return pts;
}
const motes = makeMotes(LITE ? 80 : 220);
scene.add(motes);

// 星瀑飞沫
function makeSpray() {
  const anchors = [
    [12, 18, 7],
    [-4, 16, -7],
    [15, 17, -2],
  ];
  const count = LITE ? 80 : 240;
  const pos = new Float32Array(count * 3);
  const info = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = anchors[i % anchors.length];
    pos[i * 3] = a[0] + (Math.random() - 0.5) * 4;
    pos[i * 3 + 1] = a[1] - Math.random() * 30;
    pos[i * 3 + 2] = a[2] + (Math.random() - 0.5) * 4;
    info[i * 3] = a[0];
    info[i * 3 + 1] = a[1];
    info[i * 3 + 2] = a[2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    size: 0.32,
    color: 0xa0d8ff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.userData.info = info;
  return pts;
}
const spray = makeSpray();
scene.add(spray);

// ————— composer —————
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  LITE ? 0.5 : 0.82,
  0.5,
  0.5
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ————— chapter system —————
let chapter = SHOT_CH;
let camTween = null;
let userIdle = 0;
let clock = new THREE.Clock();

function setChapter(id, instant = false) {
  chapter = id;
  const ch = CHAPTERS[id];
  chapterBtns.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.ch) === id));
  narrative.classList.remove("is-show");
  narrative.querySelector(".ch-index").textContent = ch.index;
  narrative.querySelector("h2").textContent = ch.title;
  narrative.querySelector("p").textContent = ch.text;
  void narrative.offsetWidth;
  narrative.classList.add("is-show");

  const fromPos = camera.position.clone();
  const fromTgt = controls.target.clone();
  const toPos = new THREE.Vector3(...ch.cam.pos);
  const toTgt = new THREE.Vector3(...ch.cam.target);
  const fromFov = camera.fov;
  const toFov = ch.cam.fov;

  if (instant) {
    camera.position.copy(toPos);
    controls.target.copy(toTgt);
    camera.fov = toFov;
    camera.updateProjectionMatrix();
    controls.update();
    return;
  }

  camTween = {
    t: 0,
    dur: 1.6,
    fromPos,
    fromTgt,
    toPos,
    toTgt,
    fromFov,
    toFov,
  };
}

chapterBtns.forEach((b) => {
  b.addEventListener("click", () => {
    setChapter(Number(b.dataset.ch));
    userIdle = 0;
    controls.autoRotate = false;
  });
});

// 滚轮换章（在 chapter 到边界时交还 zoom）
let wheelLock = false;
window.addEventListener(
  "wheel",
  (e) => {
    if (wheelLock || camTween) return;
    // 仅当接近默认远距时用滚轮换章，近距时留给 OrbitControls
    const dist = camera.position.distanceTo(controls.target);
    if (dist < 55) return;
    if (Math.abs(e.deltaY) < 8) return;
    wheelLock = true;
    const next = e.deltaY > 0 ? Math.min(3, chapter + 1) : Math.max(0, chapter - 1);
    if (next !== chapter) setChapter(next);
    userIdle = 0;
    controls.autoRotate = false;
    setTimeout(() => (wheelLock = false), 900);
  },
  { passive: true }
);

// 拖拽接管
controls.addEventListener("start", () => {
  camTween = null;
  userIdle = 0;
  controls.autoRotate = false;
  document.body.classList.add("is-dragging");
});
controls.addEventListener("end", () => {
  document.body.classList.remove("is-dragging");
  userIdle = 0;
});

// 双击回位
renderer.domElement.addEventListener("dblclick", () => {
  setChapter(chapter);
  userIdle = 0;
  controls.autoRotate = false;
});

// 点击灯火脉冲
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pulse = 0;
renderer.domElement.addEventListener("pointerdown", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects([solidMesh, emisMesh], false);
  if (hit.length) {
    pulse = 1;
    // 临时加一盏闪灯
    const p = hit[0].point;
    const flash = addWarmLight(p.x, p.y + 1, p.z, 2.2, 18);
    flash.color.set(0xffc880);
    setTimeout(() => {
      flash.intensity = 0;
      scene.remove(flash);
    }, 480);
  }
});

// 鼠标视差
const parallax = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  parallax.x = (e.clientX / window.innerWidth - 0.5) * 2;
  parallax.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ————— animate —————
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;

  // 相机补间
  if (camTween) {
    camTween.t += dt;
    const u = Math.min(1, camTween.t / camTween.dur);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, e);
    controls.target.lerpVectors(camTween.fromTgt, camTween.toTgt, e);
    camera.fov = camTween.fromFov + (camTween.toFov - camTween.fromFov) * e;
    camera.updateProjectionMatrix();
    if (u >= 1) camTween = null;
  }

  // 空闲自转
  userIdle += dt;
  if (userIdle > 4 && !camTween) controls.autoRotate = true;
  controls.update();

  // 轻微视差：仅在未拖拽/补间时向章节目标微调
  if (!camTween && !controls.autoRotate) {
    const base = CHAPTERS[chapter].cam.target;
    controls.target.x += (base[0] + parallax.x * 1.4 - controls.target.x) * 0.03;
    controls.target.y += (base[1] - parallax.y * 0.7 - controls.target.y) * 0.03;
  }

  // 星场缓转
  stars.rotation.y = t * 0.008;
  stars.rotation.x = Math.sin(t * 0.05) * 0.02;

  // 光尘漂移
  {
    const attr = motes.geometry.attributes.position;
    const base = motes.userData.base;
    const seed = motes.userData.seed;
    for (let i = 0; i < seed.length; i++) {
      const s = seed[i];
      attr.array[i * 3] = base[i * 3] + Math.sin(t * 0.4 + s) * 1.8;
      attr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.25 + s * 1.3) * 2.2;
      attr.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.35 + s) * 1.5;
    }
    attr.needsUpdate = true;
  }

  // 星瀑飞沫下落
  {
    const attr = spray.geometry.attributes.position;
    const info = spray.userData.info;
    for (let i = 0; i < attr.count; i++) {
      attr.array[i * 3 + 1] -= dt * (10 + (i % 5) * 2);
      attr.array[i * 3] += Math.sin(t + i) * dt * 0.8;
      if (attr.array[i * 3 + 1] < info[i * 3 + 1] - 34) {
        attr.array[i * 3] = info[i * 3] + (Math.random() - 0.5) * 3;
        attr.array[i * 3 + 1] = info[i * 3 + 1] - 2;
        attr.array[i * 3 + 2] = info[i * 3 + 2] + (Math.random() - 0.5) * 3;
      }
    }
    attr.needsUpdate = true;
  }

  // 灯火呼吸 + 点击脉冲
  pulse = Math.max(0, pulse - dt * 2.2);
  const breathe = 0.88 + Math.sin(t * 1.6) * 0.1;
  emisMesh.material.opacity = 1;
  for (let i = 0; i < warmLights.length; i++) {
    warmLights[i].intensity =
      (i === warmLights.length - 1 ? 1.5 : 0.9) * breathe + pulse * 1.3;
  }
  // 鲲目冷光
  // （点光已设色）

  // 鲲体极缓慢起伏（整组微浮）
  const floatY = Math.sin(t * 0.25) * 0.35;
  solidMesh.position.y = floatY;
  emisMesh.position.y = floatY;
  waterMesh.position.y = floatY;

  composer.render();
}

// ————— resize —————
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ————— 入场 —————
const initCh = Number.isFinite(SHOT_CH) ? SHOT_CH : 0;
setChapter(initCh, true);
animate();

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    veil.classList.add("is-gone");
    document.body.classList.add("is-ready");
    console.log(
      `[北冥载山] voxels=${world.size} tris=${solidData.indices.length / 3 + emisData.indices.length / 3 + waterData.indices.length / 3}`
    );
  });
});
