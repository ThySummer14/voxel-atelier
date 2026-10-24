/**
 * 浮屿灯寮 — 舞台、灯光、镜头叙事、交互
 */
import * as THREE from "three";
import { OrbitControls } from "../assets/controls/OrbitControls.js";
import { EffectComposer } from "../assets/postprocessing/EffectComposer.js";
import { RenderPass } from "../assets/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../assets/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "../assets/postprocessing/OutputPass.js";
import { buildGeometry, MAT } from "./voxel.js";
import { buildIsland, collectLanternPositions } from "./island.js";

// ————— 章节文案与镜头 —————
const CHAPTERS = [
  {
    id: 0,
    title: "浮屿",
    index: "01 / 04",
    text: "山自暮色里浮起，把一小块人间悬在云上。远看是剪影，近看每一粒方块都亮着呼吸。",
    cam: { pos: [42, 28, 50], target: [2, 9, 0], fov: 36 },
  },
  {
    id: 1,
    title: "茶寮",
    index: "02 / 04",
    text: "木柱撑起一角屋檐，窗纸透出琥珀色的静。廊下两盏灯，把归人从石阶上一点点接进来。",
    cam: { pos: [2, 20, -40], target: [6, 14, -1], fov: 34 },
  },
  {
    id: 2,
    title: "飞瀑",
    index: "03 / 04",
    text: "水从崖口被夜色剪开，一条银线坠入云海。山是静的，只有它一直在说话。",
    cam: { pos: [-34, 10, 18], target: [-13, 2, 0], fov: 34 },
  },
  {
    id: 3,
    title: "掌灯",
    index: "04 / 04",
    text: "天再暗一寸，灯火就再亮一寸。萤火与窗火彼此应答，岛屿于是有了脉搏。",
    cam: { pos: [10, 13, -30], target: [6, 12, -3], fov: 34 },
  },
];

// ————— 基础 —————
const stage = document.getElementById("stage");
const veil = document.getElementById("veil");
const hud = document.getElementById("hud");
const narrative = document.getElementById("narrative");
const chapterBtns = [...document.querySelectorAll(".chapter-btn")];

// ?shot=1 / ?lite=1：无头验收用，跳过 Bloom、减轻粒子
const qs = new URLSearchParams(location.search);
const LITE = qs.has("shot") || qs.has("lite");
const SHOT_CH = Math.max(0, Math.min(3, Number(qs.get("ch") || 0)));

function postShot(name, dataUrl) {
  return fetch("/save-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, data: dataUrl.split(",")[1] }),
  }).then((r) => r.json());
}

if (LITE) {
  const ping = btoa(
    JSON.stringify({ ch: SHOT_CH, t: Date.now(), ua: navigator.userAgent })
  );
  fetch("/save-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "ping.json", data: ping }),
  }).catch(() => {});
}

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
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = false;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2744);
scene.fog = new THREE.FogExp2(0x2a4060, 0.008);

const camera = new THREE.PerspectiveCamera(
  CHAPTERS[0].cam.fov,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.set(...CHAPTERS[0].cam.pos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 14;
controls.maxDistance = 90;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(...CHAPTERS[0].cam.target);
controls.update();

// ————— 灯光：冷环境 + 暖点光 —————
const hemi = new THREE.HemisphereLight(0xa8c0d8, 0x3a3530, 1.05);
scene.add(hemi);

const moon = new THREE.DirectionalLight(0xffe0b8, 1.55);
moon.position.set(-25, 45, 30);
scene.add(moon);

const fill = new THREE.DirectionalLight(0x7a9ab8, 0.55);
fill.position.set(25, 15, -20);
scene.add(fill);

const warmAmbient = new THREE.AmbientLight(0x403830, 0.45);
scene.add(warmAmbient);

// 灯光池（茶寮室内 + 廊灯 + 石灯）
const lightGroup = new THREE.Group();
scene.add(lightGroup);
const pointLights = [];

function addLanternLight(x, y, z, intensity = 1.4, distance = 10) {
  const l = new THREE.PointLight(0xffb454, intensity, distance, 2);
  l.position.set(x + 0.5, y + 0.5, z + 0.5);
  lightGroup.add(l);
  pointLights.push({ light: l, base: intensity, phase: Math.random() * Math.PI * 2 });
  return l;
}

// ————— 几何 —————
const { island, clouds } = buildIsland();

function toMesh(data, material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(data.normals, 3));
  g.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
  g.setIndex(new THREE.BufferAttribute(data.indices, 1));
  g.computeBoundingSphere();
  return new THREE.Mesh(g, material);
}

const solidData = buildGeometry(island, { group: "solid" });
const emiData = buildGeometry(island, { group: "emissive" });
const waterData = buildGeometry(island, { group: "water" });
const cloudData = buildGeometry(clouds, { group: "solid" });

const solidMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.92,
  metalness: 0.02,
  flatShading: true,
  side: THREE.DoubleSide,
});

const emiMat = new THREE.MeshBasicMaterial({
  vertexColors: true,
  toneMapped: true,
  side: THREE.DoubleSide,
  color: new THREE.Color(1.05, 0.9, 0.6),
});

const waterMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.15,
  metalness: 0.05,
  transparent: true,
  opacity: 0.78,
  emissive: 0x1a4055,
  emissiveIntensity: 0.15,
  side: THREE.DoubleSide,
});

const cloudMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 1,
  metalness: 0,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const islandGroup = new THREE.Group();
islandGroup.add(toMesh(solidData, solidMat));
islandGroup.add(toMesh(emiData, emiMat));
const waterMesh = toMesh(waterData, waterMat);
islandGroup.add(waterMesh);
const cloudMesh = toMesh(cloudData, cloudMat);
islandGroup.add(cloudMesh);
scene.add(islandGroup);

// 调试：统计写入 meta
if (LITE) {
  window.__dbg = {
    solid: solidData.indices.length / 3,
    emi: emiData.indices.length / 3,
    bounds: solidData.bounds,
  };
}

// 点光：室内 + 廊灯 + 石灯（根据灯笼位置）
const lanterns = collectLanternPositions(island);
const used = new Set();
for (const L of lanterns) {
  const key = `${L.x},${L.y},${L.z}`;
  if (used.has(key)) continue;
  used.add(key);
  // 主光只挂在 CORE 附近，避免过密
  if (L.kind === "core") {
    addLanternLight(L.x, L.y, L.z, 2.2, 12);
    addLanternLight(L.x, L.y - 1, L.z, 0.8, 6);
  }
}
// 茶寮主暖光
const hearth = new THREE.PointLight(0xff8a3d, 3.2, 22, 2);
hearth.position.set(6.5, 11, 0.5);
lightGroup.add(hearth);
pointLights.push({ light: hearth, base: 3.2, phase: 0.4 });

// ————— 粒子：萤火 + 花瓣 —————
function makePoints(count, color, size, spread, yRange) {
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * spread;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
    pos[i * 3 + 2] = Math.sin(a) * r;
    seeds[i * 3] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 1] = 0.4 + Math.random() * 0.8;
    seeds[i * 3 + 2] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.base = pos.slice();
  pts.userData.seeds = seeds;
  return pts;
}

const fireflies = makePoints(LITE ? 40 : 180, 0xffd27a, 0.12, 16, [5, 16]);
const petals = makePoints(LITE ? 20 : 80, 0xe8a0bf, 0.1, 14, [8, 20]);
petals.material.blending = THREE.NormalBlending;
petals.material.opacity = 0.75;
scene.add(fireflies, petals);

// 远景星点
const stars = makePoints(LITE ? 80 : 400, 0x9db7d0, 0.08, 80, [20, 60]);
stars.material.opacity = 0.5;
scene.add(stars);

// ————— 后处理 —————
let composer = null;
let bloom = null;
if (!LITE) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55,
    0.7,
    0.82
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
} else {
  // lite：跳过 Bloom，略提曝光
  renderer.toneMappingExposure = 1.15;
}

// ————— 状态 —————
let chapter = 0;
let camFrom = camera.position.clone();
let camTo = new THREE.Vector3(...CHAPTERS[0].cam.pos);
let tgtFrom = controls.target.clone();
let tgtTo = new THREE.Vector3(...CHAPTERS[0].cam.target);
let fovFrom = camera.fov;
let fovTo = CHAPTERS[0].cam.fov;
let tweenT = 1;
const TWEEN_DUR = 1.8;
let idleTime = 0;
let autoOrbit = false;
let pointer = { x: 0, y: 0 };
let parallax = new THREE.Vector2();
let chapterLock = 0;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function setNarrative(ch) {
  const c = CHAPTERS[ch];
  narrative.classList.remove("is-show");
  narrative.classList.add("is-hide");
  window.setTimeout(() => {
    narrative.querySelector(".ch-index").textContent = c.index;
    narrative.querySelector("h2").textContent = c.title;
    narrative.querySelector("p").textContent = c.text;
    narrative.classList.remove("is-hide");
    narrative.classList.add("is-show");
  }, 280);
  chapterBtns.forEach((b, i) => b.classList.toggle("is-active", i === ch));
}

function goChapter(ch, { fromScroll = false } = {}) {
  ch = Math.max(0, Math.min(CHAPTERS.length - 1, ch));
  if (ch === chapter && tweenT >= 1 && !fromScroll) return;
  chapter = ch;
  const c = CHAPTERS[ch];
  camFrom.copy(camera.position);
  camTo.set(...c.cam.pos);
  tgtFrom.copy(controls.target);
  tgtTo.set(...c.cam.target);
  fovFrom = camera.fov;
  fovTo = c.cam.fov;
  tweenT = 0;
  autoOrbit = false;
  idleTime = 0;
  setNarrative(ch);

  // 掌灯章：加暖、加深蓝
  const isNight = ch === 3;
  if (bloom) bloom.strength = isNight ? 0.9 : 0.55;
  hemi.intensity = isNight ? 0.45 : 1.05;
  moon.intensity = isNight ? 0.55 : 1.55;
  scene.fog.color.setHex(isNight ? 0x152038 : 0x2a4060);
  scene.background.setHex(isNight ? 0x0c1424 : 0x1a2744);
  for (const p of pointLights) {
    p.light.intensity = p.base * (isNight ? 1.55 : 1);
  }
}

chapterBtns.forEach((btn) => {
  btn.addEventListener("click", () => goChapter(Number(btn.dataset.ch)));
});

// 滚动
const scrollSpace = document.getElementById("scroll-space");
let scrollChapter = 0;
function onScroll() {
  const max = scrollSpace.scrollHeight - scrollSpace.clientHeight;
  const t = max > 0 ? scrollSpace.scrollTop / max : 0;
  const ch = Math.round(t * (CHAPTERS.length - 1));
  if (ch !== scrollChapter) {
    scrollChapter = ch;
    goChapter(ch, { fromScroll: true });
  }
}
scrollSpace.addEventListener("scroll", onScroll, { passive: true });
// 让滚轮落在 window 上也能翻章（canvas 吃事件）
window.addEventListener(
  "wheel",
  (e) => {
    idleTime = 0;
    autoOrbit = false;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (Math.abs(e.deltaY) < 2) return;
    // 累加少量滚动并映射
    const next = scrollChapter + dir;
    if (next >= 0 && next < CHAPTERS.length) {
      scrollChapter = next;
      goChapter(next, { fromScroll: true });
      scrollSpace.scrollTop =
        (scrollChapter / (CHAPTERS.length - 1)) *
        (scrollSpace.scrollHeight - scrollSpace.clientHeight);
    }
  },
  { passive: true }
);

// 指针
renderer.domElement.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  idleTime = 0;
});
renderer.domElement.addEventListener("pointerdown", () => {
  idleTime = 0;
  autoOrbit = false;
});

// 点灯脉冲
const raycaster = new THREE.Raycaster();
const pulseList = [];
renderer.domElement.addEventListener("click", (e) => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(lightGroup, true);
  // 无灯几何则对附近点光做脉冲
  const origin = raycaster.ray.origin;
  const dir = raycaster.ray.direction;
  let best = null;
  let bestD = 3.5;
  for (const p of pointLights) {
    const v = p.light.position.clone().sub(origin);
    const t = v.dot(dir);
    if (t < 0) continue;
    const closest = origin.clone().add(dir.clone().multiplyScalar(t));
    const d = closest.distanceTo(p.light.position);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  if (best) {
    pulseList.push({ p: best, t: 0 });
  }
});

// 空闲自转
window.addEventListener("keydown", () => {
  idleTime = 0;
});

function animatePoints(points, t, mode) {
  const attr = points.geometry.getAttribute("position");
  const base = points.userData.base;
  const seeds = points.userData.seeds;
  for (let i = 0; i < attr.count; i++) {
    const s0 = seeds[i * 3];
    const s1 = seeds[i * 3 + 1];
    const s2 = seeds[i * 3 + 2];
    const bx = base[i * 3];
    const by = base[i * 3 + 1];
    const bz = base[i * 3 + 2];
    if (mode === "fire") {
      attr.setXYZ(
        i,
        bx + Math.sin(t * s1 + s0) * 0.6,
        by + Math.sin(t * 0.7 + s0 * 2) * 0.45,
        bz + Math.cos(t * s1 * 0.8 + s0) * 0.6
      );
    } else if (mode === "petal") {
      let y = by - ((t * s1 * 0.35 + s2 * 20) % 18);
      if (y < 2) y += 18;
      attr.setXYZ(
        i,
        bx + Math.sin(t * 0.6 + s0) * 1.2,
        y,
        bz + Math.cos(t * 0.5 + s0) * 1.2
      );
    }
  }
  attr.needsUpdate = true;
}

// ————— 主循环 —————
const clock = new THREE.Clock();
let elapsed = 0;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  idleTime += dt;

  // 相机补间
  if (tweenT < 1) {
    tweenT = Math.min(1, tweenT + dt / TWEEN_DUR);
    const e = easeInOut(tweenT);
    camera.position.lerpVectors(camFrom, camTo, e);
    controls.target.lerpVectors(tgtFrom, tgtTo, e);
    camera.fov = fovFrom + (fovTo - fovFrom) * e;
    camera.updateProjectionMatrix();
  } else if (idleTime > 4) {
    autoOrbit = true;
  }

  // 视差
  parallax.x += (pointer.x * 0.35 - parallax.x) * 0.04;
  parallax.y += (-pointer.y * 0.2 - parallax.y) * 0.04;

  if (autoOrbit) {
    const r = camera.position.clone().sub(controls.target);
    const angle = dt * 0.08;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = r.x * cos - r.z * sin;
    const z = r.x * sin + r.z * cos;
    r.x = x;
    r.z = z;
    camera.position.copy(controls.target).add(r);
    camera.position.x += parallax.x;
    camera.position.y += parallax.y * 0.5;
  } else if (tweenT >= 1) {
    // 轻微视差偏移目标
    controls.target.x = tgtTo.x + parallax.x * 0.4;
    controls.target.y = tgtTo.y + parallax.y * 0.3;
    controls.target.z = tgtTo.z;
  }

  controls.update();

  // 灯火呼吸
  for (const p of pointLights) {
    const flicker = 1 + Math.sin(elapsed * 2.3 + p.phase) * 0.06 + Math.sin(elapsed * 7.1 + p.phase) * 0.03;
    let boost = 1;
    for (let i = pulseList.length - 1; i >= 0; i--) {
      const pl = pulseList[i];
      if (pl.p === p) {
        pl.t += dt;
        const k = Math.max(0, 1 - pl.t / 0.7);
        boost += k * 1.8;
        if (pl.t > 0.7) pulseList.splice(i, 1);
      }
    }
    const isNight = chapter === 3 ? 1.55 : 1;
    p.light.intensity = p.base * isNight * flicker * boost;
  }

  // 水面微闪
  waterMat.emissiveIntensity = 0.12 + Math.sin(elapsed * 1.7) * 0.05;

  // 云缓移
  cloudMesh.position.x = Math.sin(elapsed * 0.05) * 1.2;
  cloudMesh.position.z = Math.cos(elapsed * 0.04) * 0.8;

  animatePoints(fireflies, elapsed, "fire");
  animatePoints(petals, elapsed, "petal");

  // 岛体极轻微悬浮
  islandGroup.position.y = Math.sin(elapsed * 0.35) * 0.12;

  if (composer) composer.render();
  else renderer.render(scene, camera);

  window.__frames = (window.__frames || 0) + 1;
  if (window.__frames === 3) window.__ready = true;
  if (!LITE || window.__frames < 24) requestAnimationFrame(tick);
  else {
    window.__ready = true;
  }
}

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
  if (bloom) bloom.setSize(w, h);
});

// 入场
setNarrative(SHOT_CH);
if (LITE) {
  // 截图模式：无条件锁定机位
  const c = CHAPTERS[SHOT_CH];
  chapter = SHOT_CH;
  camera.position.set(...c.cam.pos);
  controls.target.set(...c.cam.target);
  camera.fov = c.cam.fov;
  camera.updateProjectionMatrix();
  camTo.copy(camera.position);
  tgtTo.copy(controls.target);
  controls.enabled = false;
  autoOrbit = false;
  idleTime = -999;
  const isNight = SHOT_CH === 3;
  if (bloom) bloom.strength = isNight ? 0.9 : 0.55;
  hemi.intensity = isNight ? 0.45 : 1.05;
  moon.intensity = isNight ? 0.55 : 1.55;
  scene.fog.color.setHex(isNight ? 0x152038 : 0x2a4060);
  scene.background.setHex(isNight ? 0x0c1424 : 0x1a2744);
  for (const p of pointLights) p.light.intensity = p.base * (isNight ? 1.55 : 1);
}
requestAnimationFrame(() => {
  tick();
  window.setTimeout(() => {
    veil.classList.add("is-gone");
    hud.classList.add("is-live");
    window.__uiReady = true;
  }, LITE ? 80 : 600);
});

// 截图模式：主动渲一帧并回传像素
if (LITE) {
  window.setTimeout(() => {
    try {
      if (composer) composer.render();
      else renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL("image/png");
      window.__shotLen = url.length;
      postShot(`ch${SHOT_CH}.png`, url)
        .then(() => (window.__shotPosted = true))
        .catch((e) => (window.__shotErr = String(e)));
    } catch (e) {
      window.__shotErr = String(e);
      postShot(
        `err${SHOT_CH}.json`,
        "data:application/json;base64," + btoa(String(e))
      );
    }
  }, 400);
}
