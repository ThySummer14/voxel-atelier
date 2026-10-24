import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.querySelector('#scene');
const loading = document.querySelector('#loading');
const loadingBar = document.querySelector('#loadingBar');
const intro = document.querySelector('#intro');
const diveButton = document.querySelector('#diveButton');
const aboutButton = document.querySelector('#aboutButton');
const aboutPanel = document.querySelector('#aboutPanel');
const closeAbout = document.querySelector('#closeAbout');
const letterCard = document.querySelector('#letterCard');
const closeLetter = document.querySelector('#closeLetter');
const letterBody = document.querySelector('#letterBody');
const letterTitle = document.querySelector('#letterTitle');
const letterMeta = document.querySelector('#letterMeta');
const mailHint = document.querySelector('#mailHint');
const toast = document.querySelector('#toast');
const depthValue = document.querySelector('#depthValue');
const zoneName = document.querySelector('#zoneName');
const tourButton = document.querySelector('#tourButton');
const lampButton = document.querySelector('#lampButton');
const soundButton = document.querySelector('#soundButton');
const hideButton = document.querySelector('#hideButton');
const shotButtons = [...document.querySelectorAll('.shot-button')];
const tideButtons = [...document.querySelectorAll('.tide-button')];
const waterGrade = document.querySelector('.water-grade');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = window.matchMedia('(max-width: 700px)').matches;
const rng = mulberry32(1093);
const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x062b35);
scene.fog = new THREE.FogExp2(0x0a3b43, 0.016);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNarrow ? 1 : 1.25));
renderer.setSize(window.innerWidth || 1280, window.innerHeight || 720);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;

const camera = new THREE.PerspectiveCamera(39, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(25, 13.5, 30);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0.5, 4.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = true;
controls.panSpeed = 0.45;
controls.rotateSpeed = 0.42;
controls.zoomSpeed = 0.65;
controls.minDistance = 7;
controls.maxDistance = 52;
controls.minPolarAngle = 0.38;
controls.maxPolarAngle = Math.PI * 0.49;
controls.maxTargetRadius = 24;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.78,
  0.52,
  0.72,
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const ambient = new THREE.HemisphereLight(0x9ae4d4, 0x0a2025, 2.25);
scene.add(ambient);
const moonShaft = new THREE.DirectionalLight(0x9cebe0, 4.2);
moonShaft.position.set(-8, 30, 12);
scene.add(moonShaft);
const rimLight = new THREE.DirectionalLight(0x3e7fa0, 2.2);
rimLight.position.set(20, 8, -20);
scene.add(rimLight);
const postLight = new THREE.PointLight(0xffa55f, 76, 22, 1.6);
postLight.position.set(1.6, 6.4, 2.2);
scene.add(postLight);
const warmFill = new THREE.PointLight(0xffb36a, 34, 13, 1.8);
warmFill.position.set(3.8, 3.8, 2.8);
scene.add(warmFill);
const bioLight = new THREE.PointLight(0x4dffd2, 30, 16, 2);
bioLight.position.set(9.5, 2.4, 5.5);
scene.add(bioLight);

const animatables = [];
const mailboxes = [];
const clickableObjects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let activeMailbox = mailboxes[0];
let hoveredMailbox = null;
let currentShot = 0;
let currentTide = 0;
let tourActive = false;
let tourTimer = 0;
let interfaceHidden = false;
let lanternOn = true;
let letterIndex = 0;
let deliveryPulse = 0;
let cameraMove = null;
let lastPointerDown = null;
let audioEngine = null;
let transitionStarted = false;
let postprocessingEnabled = false;
let performanceFrames = 0;
let performanceElapsed = 0;

const tideConfig = [
  { name: '静潮', depth: '1093', zone: '鲸落庭', fog: 0x0a3b43, density: 0.016, bloom: 0.72, light: 2.25 },
  { name: '鲸歌', depth: '1094', zone: '回声廊', fog: 0x0b4748, density: 0.014, bloom: 0.96, light: 2.55 },
  { name: '黑潮', depth: '1097', zone: '无名渊', fog: 0x03121d, density: 0.028, bloom: 0.62, light: 1.15 },
];

class VoxelBatch {
  constructor(parentScene, materialColor, emissive) {
    this.items = [];
    this.parentScene = parentScene;
    this.materialColor = materialColor;
    this.emissive = emissive;
  }

  add(x, y, z, sx, sy, sz, color, rotation = null) {
    this.items.push({
      position: new THREE.Vector3(x, y, z),
      scale: new THREE.Vector3(sx, sy, sz),
      color: new THREE.Color(color),
      rotation,
    });
  }

  build(name) {
    if (!this.items.length) return null;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = this.emissive
      ? new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
      : new THREE.MeshStandardMaterial({ color: this.materialColor, roughness: 0.88, metalness: 0.02 });
    const mesh = new THREE.InstancedMesh(geometry, material, this.items.length);
    mesh.name = name;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    this.items.forEach((item, index) => {
      position.copy(item.position);
      scale.copy(item.scale);
      quaternion.setFromEuler(item.rotation || new THREE.Euler(0, 0, 0));
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, item.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    this.parentScene.add(mesh);
    return mesh;
  }
}

const solidBatch = new VoxelBatch(scene, 0xffffff, false);
const boneBatch = new VoxelBatch(scene, 0xffffff, false);
const glowBatch = new VoxelBatch(scene, 0xffffff, true);

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function choose(list) {
  return list[Math.floor(rng() * list.length)];
}

function randomBetween(min, max) {
  return min + (max - min) * rng();
}

function tint(hex, amount = 0.12) {
  const color = new THREE.Color(hex);
  color.offsetHSL(randomBetween(-amount, amount), randomBetween(-amount, amount), randomBetween(-amount, amount));
  return color;
}

function buildSeabed() {
  const sandColors = [0x254b4a, 0x315552, 0x3b5d57, 0x203f41, 0x45645b];
  for (let x = -23; x <= 23; x += 2) {
    for (let z = -19; z <= 19; z += 2) {
      const wave = Math.sin(x * 0.28) * 0.28 + Math.cos(z * 0.32) * 0.22;
      const y = -0.35 + wave + randomBetween(-0.18, 0.18);
      solidBatch.add(x, y, z, 1.98, 0.65, 1.98, tint(choose(sandColors), 0.05));
    }
  }

  for (let i = 0; i < 70; i += 1) {
    const x = randomBetween(-21, 21);
    const z = randomBetween(-17, 17);
    const height = randomBetween(0.15, 0.75);
    const width = randomBetween(0.25, 1.15);
    const colors = [0x17383a, 0x234642, 0x3b4d43, 0x29433f, 0x4b5b4b];
    solidBatch.add(x, 0.12 + height * 0.5, z, width, height, width * randomBetween(0.7, 1.3), tint(choose(colors), 0.08));
  }
}

function addVoxelLine(batch, start, end, thickness, color, step = thickness * 0.58) {
  const distance = start.distanceTo(end);
  const count = Math.max(1, Math.ceil(distance / step));
  const point = new THREE.Vector3();
  for (let i = 0; i <= count; i += 1) {
    point.lerpVectors(start, end, i / count);
    const jitter = thickness * randomBetween(-0.12, 0.12);
    batch.add(point.x, point.y, point.z, thickness + jitter, thickness + jitter, thickness + jitter, tint(color, 0.05));
  }
}

function buildWhaleFall() {
  const boneColors = [0xb5c4b4, 0xcbd2bd, 0x8faaa0, 0xd5d1b7];
  const spine = [];
  for (let i = 0; i <= 34; i += 1) {
    const x = -14 + i * 0.78;
    const y = 6.2 + Math.sin(i * 0.12) * 0.9;
    const z = Math.cos(i * 0.08) * 0.55;
    spine.push(new THREE.Vector3(x, y, z));
    const vertebraSize = 0.78 - i * 0.004;
    boneBatch.add(x, y, z, vertebraSize, 0.5, 1.15, tint(choose(boneColors), 0.035));
    boneBatch.add(x, y - 0.34, z, 0.32, 0.35, 1.5, tint(choose(boneColors), 0.03));
    if (i > 2 && i % 3 === 0) {
      const fin = new THREE.Vector3(x, y - 0.2, z + (i % 6 === 0 ? 0.95 : -0.95));
      addVoxelLine(boneBatch, new THREE.Vector3(x, y - 0.12, z), fin, 0.22, choose(boneColors), 0.32);
    }
  }

  for (let i = 0; i < spine.length - 1; i += 1) {
    addVoxelLine(boneBatch, spine[i], spine[i + 1], 0.26, choose(boneColors), 0.42);
  }

  for (let ribIndex = 0; ribIndex < 13; ribIndex += 1) {
    const x = -4.8 + ribIndex * 1.15;
    const normalized = (ribIndex - 4) / 9;
    const radius = Math.max(3.2, 7.5 - Math.abs(normalized) * 2.9) * (0.96 + rng() * 0.08);
    const baseY = 6.3 + Math.sin(ribIndex * 0.34) * 0.36;
    for (let segment = 0; segment <= 25; segment += 1) {
      const angle = 0.06 + (Math.PI - 0.12) * (segment / 25);
      const y = baseY - Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius * 0.78;
      const width = 0.35 + Math.sin(angle) * 0.1;
      boneBatch.add(x, y, z, width, 0.38 + Math.sin(angle) * 0.12, 0.62, tint(choose(boneColors), 0.04));
      if (segment % 4 === 0 && segment < 20) {
        boneBatch.add(x - 0.15, y - 0.3, z * 0.98, 0.18, 0.32, 0.5, tint(choose(boneColors), 0.03));
      }
    }
  }

  for (let i = 0; i < 6; i += 1) {
    const x = -11.5 - i * 0.7;
    const y = 5.8 - i * 0.08;
    const width = 0.38 + i * 0.16;
    boneBatch.add(x, y, 0, width, 0.46, width * 0.72, tint(choose(boneColors), 0.04));
  }

  for (let i = 0; i < 16; i += 1) {
    const x = 11.0 + i * 0.22;
    const width = 1.6 - i * 0.045;
    boneBatch.add(x, 5.8 + i * 0.08, 0.15, 0.42, 0.5, width, tint(choose(boneColors), 0.035));
    if (i % 3 === 0) {
      boneBatch.add(x + 0.2, 5.25 - i * 0.01, -0.2, 0.3, 1.3, 0.28, tint(choose(boneColors), 0.03));
    }
  }

  const lowerJawStart = new THREE.Vector3(13.8, 5.25, 0.15);
  const lowerJawEnd = new THREE.Vector3(15.2, 4.75, 0.2);
  addVoxelLine(boneBatch, lowerJawStart, lowerJawEnd, 0.55, choose(boneColors), 0.4);

  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i += 1) {
      boneBatch.add(10.7 + i * 0.7, 5.7 + i * 0.08, side * (0.65 + i * 0.16), 0.35, 0.38, 1.2, tint(choose(boneColors), 0.04));
    }
  }

  const mast = new THREE.Group();
  const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x372d27, roughness: 0.95 });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.32, 0.32), mastMaterial);
  beam.position.set(-16.5, 4.2, 0);
  beam.rotation.z = -0.17;
  mast.add(beam);
  const brokenMast = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.6, 0.32), mastMaterial);
  brokenMast.position.set(-14.2, 5.7, 0);
  brokenMast.rotation.z = -0.32;
  mast.add(brokenMast);
  scene.add(mast);
}

function buildPostOffice() {
  const baseX = 0.5;
  const baseY = 2.15;
  const baseZ = 0;
  const wallColors = [0x214e4b, 0x2d6259, 0x1b403f, 0x38685c];
  const trimColors = [0x633f2f, 0x7b4a33, 0x8b5538, 0x4e352b];

  for (let x = -3.5; x <= 4.5; x += 0.5) {
    for (let z = -2.5; z <= 2.5; z += 0.5) {
      solidBatch.add(baseX + x, 1.58, baseZ + z, 0.48, 0.5, 0.48, tint(0x76513b, 0.08));
    }
  }

  for (let y = 0; y < 4; y += 0.5) {
    for (let x = -3.5; x <= 3.5; x += 0.5) {
      if (y < 2 && Math.abs(x) < 1) continue;
      solidBatch.add(baseX + x, baseY + y, baseZ - 2.25, 0.48, 0.48, 0.45, tint(choose(wallColors), 0.05));
      if (Math.abs(x) > 1.25) {
        solidBatch.add(baseX + x, baseY + y, baseZ + 2.25, 0.48, 0.48, 0.45, tint(choose(wallColors), 0.05));
      }
    }
  }
  for (let y = 0; y < 4; y += 0.5) {
    for (let z = -2; z <= 2; z += 0.5) {
      if (y < 2 && Math.abs(z) < 0.9) continue;
      if (Math.abs(z) < 1.5 || y > 1.4) {
        solidBatch.add(baseX - 3.25, baseY + y, baseZ + z, 0.45, 0.48, 0.48, tint(choose(wallColors), 0.05));
      }
    }
  }

  for (let x = -4; x <= 4; x += 0.5) {
    for (let z = -2.5; z <= 2.5; z += 0.5) {
      const ridge = 1.0 - Math.abs(x) * 0.11;
      solidBatch.add(baseX + x, 6.2 + ridge, baseZ + z, 0.48, 0.48, 0.48, tint(choose(trimColors), 0.07));
    }
  }
  for (let z = -2.5; z <= 2.5; z += 0.5) {
    for (let level = 0; level < 3; level += 1) {
      solidBatch.add(baseX - 3.2, 5.7 + level * 0.18, baseZ + z, 0.42, 0.35, 0.48, tint(0x8b5637, 0.06));
    }
  }

  for (let x = -3.5; x <= 3.5; x += 0.5) {
    solidBatch.add(baseX + x, 5.0, baseZ - 2.45, 0.48, 0.25, 0.2, 0x9a613d);
  }

  for (let x = -4.5; x <= 4.5; x += 0.5) {
    solidBatch.add(baseX + x, 1.45, baseZ + 3.5, 0.48, 0.22, 1.0, tint(choose(trimColors), 0.08));
  }
  for (let z = 3; z <= 4; z += 0.5) {
    for (let x = -4.5; x <= 4.5; x += 0.5) {
      solidBatch.add(baseX + x, 1.1, baseZ + z, 0.48, 0.45, 0.48, tint(0x684832, 0.09));
    }
  }
  for (let x = -4.5; x <= 4.5; x += 0.5) {
    for (const z of [3, 4]) {
      solidBatch.add(baseX + x, 0.55, baseZ + z, 0.14, 1.0, 0.14, 0x3a302a);
    }
  }

  for (let i = 0; i < 5; i += 1) {
    solidBatch.add(0.5, 1.35 - i * 0.2, 3.1 + i * 0.38, 1.3, 0.22, 0.45, tint(0x825438, 0.05));
  }

  for (const x of [-1.85, 2.85]) {
    solidBatch.add(baseX + x, 3.75, 2.49, 1.55, 1.75, 0.12, 0x152e2d);
    for (let i = -1; i <= 1; i += 1) {
      glowBatch.add(baseX + x, 3.75, 2.57, 1.32, 1.5, 0.08, i === 0 ? 0xffa45d : 0xffca7d);
    }
    for (let y = 0; y < 2; y += 0.5) {
      solidBatch.add(baseX + x, 3.25 + y, 2.65, 0.12, 0.48, 0.12, 0x744a31);
    }
    solidBatch.add(baseX + x, 3.75, 2.66, 0.12, 1.7, 0.12, 0x744a31);
  }

  solidBatch.add(0.5, 4.15, 2.66, 0.28, 3.3, 0.28, 0x513a2e);
  createOfficeSign(0.5, 5.25, 2.72, 2.35, 0.72);
  createGlowSprite(0.5, 3.5, 2.9, 12, 0xff9d59, 0.22);
  createGlowSprite(0.2, 5.5, -1.8, 15, 0x5de4d1, 0.12);

  for (let i = 0; i < 5; i += 1) {
    const x = -3.6 + i * 2;
    solidBatch.add(x, 5.05, 3.25, 0.13, 1.0, 0.13, 0x3b3029);
    solidBatch.add(x, 4.58, 3.25, 0.38, 0.4, 0.38, 0xffa658);
    glowBatch.add(x, 4.58, 3.25, 0.22, 0.22, 0.22, 0xffd18d);
    animatables.push({
      type: 'lantern',
      mesh: glowBatch.items[glowBatch.items.length - 1],
      phase: i * 0.7,
    });
  }

  for (let i = 0; i < 3; i += 1) {
    solidBatch.add(-2.1 + i * 0.55, 2.1, 2.9, 0.5, 0.35, 0.35, i === 1 ? 0xb8593b : 0x345d4c);
    if (i === 1) glowBatch.add(-1.55, 2.12, 2.9, 0.12, 0.14, 0.12, 0xff8b58);
  }

  const chimney = new THREE.Group();
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x3b2f29, roughness: 1 });
  const chimneyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.2, 0.75), chimneyMat);
  chimneyMesh.position.set(-2.0, 7.25, -0.5);
  chimney.add(chimneyMesh);
  scene.add(chimney);
}

function createGlowSprite(x, y, z, size, color, opacity = 0.35) {
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const context = glowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(glowCanvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(size, size, 1);
  scene.add(sprite);
  return sprite;
}

function createOfficeSign(x, y, z, width, height) {
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 320;
  const context = signCanvas.getContext('2d');
  context.fillStyle = '#173a38';
  context.fillRect(0, 0, signCanvas.width, signCanvas.height);
  context.strokeStyle = '#c38b59';
  context.lineWidth = 12;
  context.strokeRect(18, 18, 988, 284);
  context.fillStyle = '#f0c88e';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '600 120px serif';
  context.fillText('深 海 邮 政', 512, 136);
  context.font = '34px monospace';
  context.fillStyle = '#9bb6a5';
  context.fillText('THE ABYSSAL POST  ·  SINCE 1093 M', 512, 238);
  const texture = new THREE.CanvasTexture(signCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  sign.position.set(x, y, z);
  scene.add(sign);
}

function buildMailboxes() {
  const locations = [
    { x: 3.2, z: 4.15, color: 0xcc553d },
    { x: -2.5, z: 4.15, color: 0x376a5c },
    { x: 6.4, z: 1.1, color: 0xbe6a36, rot: -0.5 },
  ];
  locations.forEach((location, index) => {
    const group = new THREE.Group();
    const shellMaterial = new THREE.MeshStandardMaterial({ color: location.color, roughness: 0.75, metalness: 0.18 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x142c2d, roughness: 0.9 });
    const slotMaterial = new THREE.MeshBasicMaterial({ color: index === 0 ? 0xffb36b : 0x70e5c7, toneMapped: false });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.65, 0.28), darkMaterial);
    post.position.y = 0.82;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.8), shellMaterial);
    box.position.y = 1.72;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.22, 0.9), darkMaterial);
    lid.position.y = 2.22;
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.05), slotMaterial);
    slot.position.set(0, 1.88, 0.42);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), shellMaterial);
    flag.position.set(0.58, 2.28, 0);
    const flagTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.08), slotMaterial);
    flagTop.position.set(0.75, 2.48, 0);
    group.add(post, box, lid, slot, flag, flagTop);
    group.position.set(location.x, 0.35, location.z);
    group.rotation.y = location.rot || 0;
    group.userData.mailbox = { index, pulse: 0, slotMaterial };
    group.traverse((object) => {
      if (object.isMesh) {
        object.userData.mailbox = group.userData.mailbox;
        clickableObjects.push(object);
      }
    });
    scene.add(group);
    mailboxes.push(group);
  });
  activeMailbox = mailboxes[0];
}

function buildPostman() {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xb64d35, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x152b2c, roughness: 0.8 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd9ae7f, roughness: 0.9 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xffd98d, toneMapped: false });
  const pieces = [
    [0, 0.65, 0, 0.58, 0.78, 0.36, body],
    [0, 1.22, 0, 0.48, 0.5, 0.42, skin],
    [0, 1.58, 0, 0.62, 0.28, 0.55, dark],
    [-0.18, 0.28, 0, 0.22, 0.55, 0.24, dark],
    [0.18, 0.28, 0, 0.22, 0.55, 0.24, dark],
    [-0.4, 0.72, 0, 0.22, 0.6, 0.22, body],
    [0.4, 0.72, 0, 0.22, 0.6, 0.22, body],
    [0.37, 1.0, 0.28, 0.28, 0.5, 0.16, dark],
    [0, 0.95, 0.34, 0.32, 0.18, 0.12, glow],
  ];
  pieces.forEach(([x, y, z, sx, sy, sz, material]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    mesh.position.set(x, y, z);
    group.add(mesh);
  });
  group.position.set(-4.2, 1.35, 3.3);
  group.rotation.y = Math.PI * 0.05;
  group.scale.setScalar(0.92);
  group.userData.origin = group.position.clone();
  group.userData.target = new THREE.Vector3(-2.5, 1.35, 4.15);
  group.userData.moving = false;
  scene.add(group);
  animatables.push({ type: 'postman', object: group });
}

function addCoral(x, z, scale = 1, hue = 0) {
  const baseColor = hue === 0 ? 0xa9584c : hue === 1 ? 0xcf7663 : 0x6b9a77;
  const height = randomBetween(1.2, 2.9) * scale;
  solidBatch.add(x, 0.15, z, 0.3 * scale, 0.3 * scale, 0.3 * scale, baseColor);
  const branchCount = Math.floor(randomBetween(3, 6));
  for (let i = 0; i < branchCount; i += 1) {
    const angle = (i / branchCount) * Math.PI * 2 + rng();
    const branchHeight = height * randomBetween(0.45, 1);
    let px = x;
    let pz = z;
    let py = 0.15;
    for (let segment = 0; segment < 4; segment += 1) {
      const nextX = x + Math.cos(angle) * branchHeight * 0.22 * (segment + 1) * scale;
      const nextZ = z + Math.sin(angle) * branchHeight * 0.22 * (segment + 1) * scale;
      const nextY = 0.15 + branchHeight * ((segment + 1) / 4);
      addVoxelLine(solidBatch, new THREE.Vector3(px, py, pz), new THREE.Vector3(nextX, nextY, nextZ), 0.18 * scale, tint(baseColor, 0.08), 0.2 * scale);
      px = nextX;
      pz = nextZ;
      py = nextY;
    }
  }
}

function buildEcology() {
  const coralSpots = [
    [-12, 8], [-8, 10], [8, 8], [13, 6], [15, -3], [7, -7], [-5, -9], [-14, -5],
  ];
  coralSpots.forEach(([x, z], index) => addCoral(x, z, 0.8 + (index % 3) * 0.16, index % 3));

  for (let i = 0; i < 34; i += 1) {
    const x = randomBetween(-18, 18);
    const z = randomBetween(-14, 14);
    if (Math.abs(x) < 6 && Math.abs(z) < 5) continue;
    const height = randomBetween(0.35, 1.1);
    const color = choose([0x526f59, 0x3d6d62, 0x677557, 0x2d5a55]);
    solidBatch.add(x, height * 0.5, z, 0.16, height, 0.16, color);
    if (rng() > 0.45) {
      solidBatch.add(x + randomBetween(-0.25, 0.25), height + 0.12, z, 0.32, 0.16, 0.32, 0xc1a26d);
    }
  }

  for (let i = 0; i < 22; i += 1) {
    const x = randomBetween(-17, 17);
    const z = randomBetween(-13, 13);
    const glow = choose([0x55e2c0, 0x75a7ff, 0xc4ec8b, 0x63d6dc]);
    glowBatch.add(x, 0.3, z, 0.16, 0.16, 0.16, glow);
    for (let j = 0; j < 3; j += 1) {
      solidBatch.add(x + randomBetween(-0.18, 0.18), 0.5 + j * 0.18, z, 0.08, 0.22, 0.08, glow);
    }
  }

  for (let i = 0; i < 4; i += 1) {
    const x = 12 + i * 1.2;
    const z = -6 - i * 0.6;
    const height = 1.8 + i * 0.45;
    solidBatch.add(x, height * 0.5, z, 1.2, height, 1.0, 0x152f30);
    for (let ring = 0; ring < 3; ring += 1) {
      glowBatch.add(x, height - 0.15 - ring * 0.45, z, 1.35, 0.16, 1.12, ring === 2 ? 0x5bd6c1 : 0x274f4a);
    }
    for (let plume = 0; plume < 7; plume += 1) {
      const p = animatables.length;
      solidBatch.add(x + randomBetween(-0.5, 0.5), height + randomBetween(0.4, 1.3), z + randomBetween(-0.4, 0.4), 0.12, 0.12, 0.12, 0x7b8b7a);
      animatables.push({ type: 'smoke', index: p, x, y: height, z, phase: rng() * 7, speed: randomBetween(0.18, 0.32) });
    }
  }
}

function buildJellyfish() {
  for (let i = 0; i < (isNarrow ? 4 : 7); i += 1) {
    const group = new THREE.Group();
    const color = i % 2 ? 0x9e9ed8 : 0x75d9cf;
    const capMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, toneMapped: false });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.1), capMaterial);
    group.add(cap);
    for (let t = 0; t < 5; t += 1) {
      const tentacle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), capMaterial);
      tentacle.position.set(-0.42 + t * 0.21, -0.55, 0);
      group.add(tentacle);
    }
    group.position.set(
      randomBetween(-16, 16),
      randomBetween(5, 11),
      i % 2 ? randomBetween(7, 12) : randomBetween(-10, -7),
    );
    group.scale.setScalar(randomBetween(0.55, 1.1));
    scene.add(group);
    animatables.push({ type: 'jelly', object: group, baseY: group.position.y, phase: rng() * 9 });
  }
}

function buildFishSchools() {
  const schoolColors = [0x6fc5c0, 0x86a8c6, 0xc7bf8e];
  for (let schoolIndex = 0; schoolIndex < 4; schoolIndex += 1) {
    const group = new THREE.Group();
    const count = isNarrow ? 18 : 30;
    const geometry = new THREE.BoxGeometry(0.12, 0.08, 0.35);
    const material = new THREE.MeshBasicMaterial({ color: schoolColors[schoolIndex % schoolColors.length], toneMapped: false });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i += 1) {
      matrix.makeTranslation(
        (rng() - 0.5) * 4.8,
        (rng() - 0.5) * 1.6,
        (rng() - 0.5) * 2.4,
      );
      mesh.setMatrixAt(i, matrix);
    }
    group.add(mesh);
    group.position.set(
      schoolIndex < 2 ? randomBetween(-11, 12) : randomBetween(-16, 16),
      randomBetween(3.5, 10),
      schoolIndex % 2 ? randomBetween(7, 11) : randomBetween(-11, -7),
    );
    scene.add(group);
    animatables.push({ type: 'school', object: group, speed: randomBetween(0.18, 0.35), phase: rng() * 9 });
  }
}

function buildParticles() {
  const count = isNarrow ? 360 : 760;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = randomBetween(-25, 25);
    positions[i * 3 + 1] = randomBetween(0.5, 22);
    positions[i * 3 + 2] = randomBetween(-20, 20);
    color.set(choose([0x9bcfc8, 0xc4ddd2, 0x5a9b9b, 0xe3d6b3]));
    color.toArray(colors, i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  animatables.push({ type: 'snow', object: particles, base: positions.slice() });

  const bubbles = [];
  for (let i = 0; i < 18; i += 1) {
    bubbles.push(new THREE.Vector3(randomBetween(-15, 15), randomBetween(1, 12), randomBetween(-10, 10)));
  }
  const bubbleGeometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
  const bubbleMaterial = new THREE.MeshBasicMaterial({ color: 0x9ad8d2, transparent: true, opacity: 0.34, toneMapped: false });
  const bubbleInstances = new THREE.InstancedMesh(bubbleGeometry, bubbleMaterial, bubbles.length);
  scene.add(bubbleInstances);
  animatables.push({ type: 'bubbles', object: bubbleInstances, data: bubbles });
}

function buildAtmosphere() {
  const causticMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, strength: { value: 0.14 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float strength;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 18.0;
        float a = sin(p.x * 1.4 + time * 0.55) * sin(p.y * 1.1 - time * 0.42);
        float b = sin(length(p) * 1.8 - time * 0.7);
        float c = smoothstep(1.15, 1.65, a + b);
        gl_FragColor = vec4(0.22, 0.78, 0.72, c * strength);
      }
    `,
  });
  const caustic = new THREE.Mesh(new THREE.PlaneGeometry(54, 42, 1, 1), causticMaterial);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.y = 0.08;
  scene.add(caustic);
  animatables.push({ type: 'caustic', object: caustic });

  const shaftMaterial = new THREE.MeshBasicMaterial({
    color: 0x66cfc5,
    transparent: true,
    opacity: 0.035,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  for (let i = 0; i < 3; i += 1) {
    const shaft = new THREE.Mesh(new THREE.ConeGeometry(3.5 + i, 25, 5, 1, true), shaftMaterial.clone());
    shaft.position.set(-7 + i * 8, 11.5, -3 + i * 2);
    shaft.rotation.z = -0.2 + i * 0.16;
    shaft.rotation.x = 0.08 * i;
    scene.add(shaft);
    animatables.push({ type: 'shaft', object: shaft, phase: i * 2, material: shaft.material });
  }
}

function buildShipwreck() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x283a32, roughness: 1 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 2.2), material);
  hull.rotation.z = 0.12;
  group.add(hull);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 1.5), material);
  cabin.position.set(-0.8, 0.95, 0);
  group.add(cabin);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.5, 0.16), material);
  mast.position.set(1.7, 1.8, 0);
  mast.rotation.z = 0.35;
  group.add(mast);
  group.position.set(-13, 0.45, -7.5);
  group.rotation.y = 0.6;
  scene.add(group);
}

buildSeabed();
buildWhaleFall();
buildPostOffice();
buildMailboxes();
buildPostman();
buildEcology();
buildJellyfish();
buildFishSchools();
buildParticles();
buildAtmosphere();
buildShipwreck();
const solidMesh = solidBatch.build('Seabed and post office voxels');
const boneMesh = boneBatch.build('Whale fall voxels');
const glowMesh = glowBatch.build('Bioluminescent voxels');
if (solidMesh) solidMesh.receiveShadow = true;
const voxelCount = solidBatch.items.length + boneBatch.items.length + glowBatch.items.length;
document.querySelectorAll('.about-facts strong')[1].nextElementSibling.textContent = `${voxelCount.toLocaleString('zh-CN')} 体素构件`;

const letters = [
  {
    title: '给仍然抬头的人',
    meta: '收件人：远岸 · 第 1093 号航次',
    body: '灯塔熄灭以后，星星并没有走远。它们只是把光，送往更漫长的地方。',
    sign: '—— 沉入海沟的船长',
  },
  {
    title: '迟到的春天',
    meta: '收件人：北岸森林 · 春季第一百零九天',
    body: '等潮水退去，我会把那枚种子交给下一艘船。若它先抵达，请替我松开泥土上的绳结。',
    sign: '—— 留在候鸟身上的邮差',
  },
  {
    title: '关于告别',
    meta: '收件人：时间 · 投递方式：缓慢',
    body: '我们总以为告别需要一句完整的话。后来才明白，没说完的部分会自己下沉，成为远方的一部分。',
    sign: '—— 第九百九十六个潮汐日',
  },
  {
    title: '给一百年后的你',
    meta: '收件人：未来居民 · 有效期：永久',
    body: '这里曾经有一座邮局。木头会朽，海雪会落，灯也终会熄灭；但曾有人在漆黑里，认真读完一封信。',
    sign: '—— 最后一位值班员',
  },
];

function createScreens() {
  const dockScreen = document.createElement('canvas');
  dockScreen.width = 512;
  dockScreen.height = 512;
  const ctx = dockScreen.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  gradient.addColorStop(0, 'rgba(255,200,120,0.8)');
  gradient.addColorStop(0.35, 'rgba(80,220,190,0.22)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(dockScreen);
  const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.4, 3.4, 1);
  sprite.position.set(3.2, 2.5, 4.15);
  scene.add(sprite);
  animatables.push({ type: 'mailGlow', object: sprite });
}

createScreens();

const shots = [
  {
    name: '全景',
    position: isNarrow ? new THREE.Vector3(29, 14, 36) : new THREE.Vector3(25, 13.5, 30),
    target: new THREE.Vector3(0.5, 4.4, 0),
  },
  {
    name: '骨门',
    position: new THREE.Vector3(10.5, 6.4, 14.5),
    target: new THREE.Vector3(0.5, 3.4, 1.1),
  },
  {
    name: '邮筒',
    position: new THREE.Vector3(8.2, 4.6, 10.3),
    target: new THREE.Vector3(1.2, 2.4, 3.0),
  },
  {
    name: '鲸尾',
    position: new THREE.Vector3(-27, 10, 15),
    target: new THREE.Vector3(-9.5, 4.6, 0),
  },
];

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
}

function setCameraShot(index, duration = 2.4) {
  currentShot = index;
  const shot = shots[index];
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  cameraMove = {
    startTime: performance.now(),
    duration: reducedMotion ? 100 : duration * 1000,
    startPosition,
    endPosition: shot.position.clone(),
    startTarget,
    endTarget: shot.target.clone(),
  };
  controls.enabled = false;
  shotButtons.forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === index));
  showToast(`镜头 ${String(index + 1).padStart(2, '0')} · ${shot.name}`);
}

function setTide(index) {
  currentTide = index;
  const config = tideConfig[index];
  depthValue.textContent = config.depth;
  zoneName.textContent = config.zone;
  tideButtons.forEach((button, buttonIndex) => {
    button.classList.toggle('is-active', buttonIndex === index);
    button.setAttribute('aria-checked', String(buttonIndex === index));
  });
  document.body.classList.toggle('is-song', index === 1);
  document.body.classList.toggle('is-storm', index === 2);
  document.body.classList.toggle('is-black', index === 2);
  showToast(`${config.name} · 声景已切换`);
  audioEngine?.playWhale(index === 2 ? 0.65 : 1);
  if (index === 2 && !reducedMotion) {
    toast.classList.add('is-alert');
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function openLetter(mailbox = activeMailbox) {
  const letter = letters[letterIndex % letters.length];
  letterIndex += 1;
  letterTitle.textContent = letter.title;
  letterMeta.textContent = letter.meta;
  letterBody.textContent = letter.body;
  document.querySelector('.letter-sign').textContent = letter.sign;
  letterCard.hidden = false;
  letterCard.style.animation = 'none';
  requestAnimationFrame(() => { letterCard.style.animation = ''; });
  if (mailbox) {
    mailbox.userData.mailbox.pulse = 1;
    mailbox.userData.mailbox.slotMaterial.color.set(0xffe2a2);
  }
  deliveryPulse = 1;
  audioEngine?.playBell();
  showToast('投递完成 · 收件人将在某次潮汐中抵达');
  const postman = animatables.find((item) => item.type === 'postman')?.object;
  if (postman) {
    postman.userData.moving = true;
    postman.userData.target.copy(mailbox?.position || new THREE.Vector3(3.2, 1.35, 4.15));
    postman.userData.target.y = 1.35;
  }
  setTimeout(() => mailbox?.userData.mailbox.slotMaterial.color.set(0xffb36b), 1300);
}

function closeLetterCard() {
  letterCard.hidden = true;
}

class AbyssAudio {
  constructor() {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(this.context.destination);
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 380;
    this.filter.Q.value = 0.6;
    this.filter.connect(this.master);
    this.createAmbient();
  }

  createAmbient() {
    const hum = this.context.createOscillator();
    const humGain = this.context.createGain();
    hum.type = 'sine';
    hum.frequency.value = 42;
    humGain.gain.value = 0.12;
    hum.connect(humGain).connect(this.filter);
    hum.start();

    const overtone = this.context.createOscillator();
    const overtoneGain = this.context.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = 63;
    overtoneGain.gain.value = 0.035;
    overtone.connect(overtoneGain).connect(this.filter);
    overtone.start();

    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 9;
    lfo.connect(lfoGain).connect(hum.frequency);
    lfo.start();

    const bufferLength = this.context.sampleRate * 3;
    const buffer = this.context.createBuffer(1, bufferLength, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.985 + white * 0.015;
      channel[i] = previous * 0.24;
    }
    const noise = this.context.createBufferSource();
    const noiseGain = this.context.createGain();
    noise.buffer = buffer;
    noise.loop = true;
    noiseGain.gain.value = 0.12;
    noise.connect(noiseGain).connect(this.filter);
    noise.start();
  }

  async toggle() {
    if (this.context.state === 'suspended') await this.context.resume();
    const target = this.master.gain.value < 0.01 ? 0.42 : 0.0001;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), this.context.currentTime + 0.8);
    return target > 0.01;
  }

  setTide(index) {
    const now = this.context.currentTime;
    const frequencies = [360, 620, 220];
    const gains = [0.42, 0.5, 0.28];
    this.filter.frequency.linearRampToValueAtTime(frequencies[index], now + 1.2);
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(gains[index], now + 1.2);
  }

  playBell() {
    if (!this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    [659, 988, 1318].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.13 / (index + 1), now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 + index * 0.25);
      oscillator.connect(gain).connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + 2.2);
    });
  }

  playWhale(strength = 1) {
    if (!this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(115, now);
    oscillator.frequency.exponentialRampToValueAtTime(48, now + 2.8);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 * strength, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 3.8);
  }
}

async function toggleSound() {
  if (!audioEngine) audioEngine = new AbyssAudio();
  const isOn = await audioEngine.toggle();
  soundButton.classList.toggle('is-active', isOn);
  soundButton.setAttribute('aria-pressed', String(isOn));
  showToast(isOn ? '深海声景已开启' : '深海声景已关闭');
}

function toggleTour(force) {
  tourActive = typeof force === 'boolean' ? force : !tourActive;
  tourTimer = 0;
  tourButton.classList.toggle('is-active', tourActive);
  tourButton.setAttribute('aria-pressed', String(tourActive));
  showToast(tourActive ? '自动巡游已开始' : '自动巡游已停止');
}

function toggleLantern(force) {
  lanternOn = typeof force === 'boolean' ? force : !lanternOn;
  lampButton.classList.toggle('is-active', lanternOn);
  lampButton.setAttribute('aria-pressed', String(lanternOn));
  postLight.intensity = lanternOn ? 76 : 2;
  warmFill.intensity = lanternOn ? 34 : 0;
  bioLight.intensity = lanternOn ? 30 : 0;
  glowMesh.material.opacity = lanternOn ? 1 : 0.18;
  glowMesh.material.transparent = !lanternOn;
  showToast(lanternOn ? '提灯已点亮' : '提灯已收拢');
}

function toggleInterface() {
  interfaceHidden = !interfaceHidden;
  document.body.classList.toggle('ui-hidden', interfaceHidden);
  showToast(interfaceHidden ? '界面已隐藏 · 按 H 恢复' : '界面已恢复');
}

function openAbout() {
  aboutPanel.hidden = false;
  closeAbout.focus();
}

function closeAboutPanel() {
  aboutPanel.hidden = true;
  aboutButton.focus();
}

diveButton.addEventListener('click', () => {
  intro.classList.add('is-hidden');
  intro.hidden = true;
  if (!transitionStarted) {
    transitionStarted = true;
    setCameraShot(0, 3.2);
  }
  audioEngine?.playWhale(0.7);
});
aboutButton.addEventListener('click', openAbout);
closeAbout.addEventListener('click', closeAboutPanel);
aboutPanel.addEventListener('click', (event) => {
  if (event.target === aboutPanel) closeAboutPanel();
});
closeLetter.addEventListener('click', closeLetterCard);
mailHint.addEventListener('click', () => openLetter(activeMailbox));
mailHint.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') openLetter(activeMailbox);
});
shotButtons.forEach((button) => button.addEventListener('click', () => {
  setCameraShot(Number(button.dataset.shot));
  if (tourActive) toggleTour(false);
}));
tideButtons.forEach((button) => button.addEventListener('click', () => {
  setTide(Number(button.dataset.tide));
  audioEngine?.setTide(Number(button.dataset.tide));
}));
tourButton.addEventListener('click', () => toggleTour());
lampButton.addEventListener('click', () => toggleLantern());
soundButton.addEventListener('click', toggleSound);
hideButton.addEventListener('click', toggleInterface);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!aboutPanel.hidden) closeAboutPanel();
    if (!letterCard.hidden) closeLetterCard();
    return;
  }
  if (event.target instanceof HTMLInputElement) return;
  if (['1', '2', '3', '4'].includes(event.key)) {
    setCameraShot(Number(event.key) - 1);
    if (tourActive) toggleTour(false);
  }
  if (event.key.toLowerCase() === 'c') toggleTour();
  if (event.key.toLowerCase() === 'h') toggleInterface();
  if (event.key.toLowerCase() === 'l') toggleLantern();
  if (event.key.toLowerCase() === 'm') toggleSound();
  if (event.key.toLowerCase() === 'r') setCameraShot(0, 2);
  if (event.key === '?') openAbout();
});

canvas.addEventListener('pointerdown', (event) => {
  lastPointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
});
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickableObjects, false)[0];
  const nextHovered = hit?.object.userData.mailbox ? mailboxes[hit.object.userData.mailbox.index] : null;
  if (nextHovered !== hoveredMailbox) {
    hoveredMailbox = nextHovered;
    if (hoveredMailbox) activeMailbox = hoveredMailbox;
  }
  if (hoveredMailbox) {
    const screen = new THREE.Vector3();
    hoveredMailbox.getWorldPosition(screen);
    screen.y += 2.65;
    screen.project(camera);
    const x = (screen.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screen.y * 0.5 + 0.5) * window.innerHeight;
    mailHint.style.left = `${Math.min(window.innerWidth - 130, Math.max(10, x))}px`;
    mailHint.style.top = `${Math.max(80, Math.min(window.innerHeight - 80, y))}px`;
    mailHint.classList.add('is-visible');
  } else {
    mailHint.classList.remove('is-visible');
  }
});
canvas.addEventListener('pointerleave', () => {
  hoveredMailbox = null;
  mailHint.classList.remove('is-visible');
});
canvas.addEventListener('pointerup', (event) => {
  if (!lastPointerDown) return;
  const moved = Math.hypot(event.clientX - lastPointerDown.x, event.clientY - lastPointerDown.y);
  const elapsed = performance.now() - lastPointerDown.time;
  if (moved < 6 && elapsed < 420 && hoveredMailbox) {
    openLetter(hoveredMailbox);
  }
  lastPointerDown = null;
});

function updateCameraMove(now) {
  if (!cameraMove) return;
  const progress = Math.min(1, (now - cameraMove.startTime) / cameraMove.duration);
  const eased = easeInOutCubic(progress);
  camera.position.lerpVectors(cameraMove.startPosition, cameraMove.endPosition, eased);
  controls.target.lerpVectors(cameraMove.startTarget, cameraMove.endTarget, eased);
  camera.lookAt(controls.target);
  if (progress >= 1) {
    cameraMove = null;
    controls.enabled = true;
  }
}

function updateAnimations(delta, elapsed) {
  const tideSpeed = currentTide === 0 ? 1 : currentTide === 1 ? 1.5 : 2.8;
  animatables.forEach((item) => {
    if (item.type === 'snow') {
      const positions = item.object.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * (0.15 + (i % 7) * 0.012) * tideSpeed;
        positions[i] += Math.sin(elapsed * 0.24 + i) * delta * 0.025 * tideSpeed;
        if (positions[i + 1] < 0.4) positions[i + 1] = 22;
      }
      item.object.geometry.attributes.position.needsUpdate = true;
      item.object.material.opacity = currentTide === 2 ? 0.25 : 0.45;
    }
    if (item.type === 'bubbles') {
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      item.data.forEach((bubble, index) => {
        bubble.y += delta * (0.22 + (index % 4) * 0.08) * tideSpeed;
        bubble.x += Math.sin(elapsed * 0.6 + index) * delta * 0.06;
        if (bubble.y > 17) bubble.y = 0.5;
        position.copy(bubble);
        matrix.makeTranslation(position.x, position.y, position.z);
        item.object.setMatrixAt(index, matrix);
      });
      item.object.instanceMatrix.needsUpdate = true;
    }
    if (item.type === 'jelly') {
      item.object.position.y = item.baseY + Math.sin(elapsed * 0.52 + item.phase) * 0.7;
      item.object.position.x += Math.sin(elapsed * 0.22 + item.phase) * delta * 0.05;
      item.object.rotation.y += delta * 0.06;
      item.object.children.forEach((child, childIndex) => {
        if (childIndex > 0) child.scale.y = 0.85 + Math.sin(elapsed * 1.4 + childIndex + item.phase) * 0.18;
      });
    }
    if (item.type === 'school') {
      const object = item.object;
      object.position.x += Math.sin(elapsed * 0.12 + item.phase) * delta * item.speed;
      object.position.y += Math.cos(elapsed * 0.25 + item.phase) * delta * item.speed * 0.25;
      object.rotation.y = Math.cos(elapsed * 0.12 + item.phase) > 0 ? 0 : Math.PI;
    }
    if (item.type === 'postman') {
      const object = item.object;
      object.position.y = 1.35 + Math.abs(Math.sin(elapsed * 5.2)) * 0.045;
      if (object.userData.moving) {
        const direction = object.userData.target.clone().sub(object.position);
        direction.y = 0;
        if (direction.length() < 0.2) {
          object.userData.moving = false;
          object.userData.target.copy(object.userData.origin);
        } else {
          object.position.add(direction.normalize().multiplyScalar(delta * 2.15));
          object.rotation.y = Math.atan2(direction.x, direction.z);
        }
      }
    }
    if (item.type === 'caustic') {
      item.object.material.uniforms.time.value = elapsed;
      item.object.material.uniforms.strength.value = currentTide === 2 ? 0.035 : currentTide === 1 ? 0.18 : 0.13;
    }
    if (item.type === 'shaft') {
      item.object.material.opacity = (currentTide === 2 ? 0.012 : 0.035) + Math.sin(elapsed * 0.18 + item.phase) * 0.008;
      item.object.rotation.z += Math.sin(elapsed * 0.1 + item.phase) * delta * 0.008;
    }
    if (item.type === 'mailGlow') {
      deliveryPulse = Math.max(0, deliveryPulse - delta * 0.45);
      const scale = 2.9 + Math.sin(elapsed * 1.4) * 0.18 + deliveryPulse * 1.2;
      item.object.scale.set(scale, scale, 1);
      item.object.material.opacity = 0.7 + Math.sin(elapsed * 1.4) * 0.12;
    }
  });

  mailboxes.forEach((mailbox) => {
    const data = mailbox.userData.mailbox;
    if (data.pulse > 0) {
      mailbox.scale.setScalar(1 + data.pulse * 0.08);
      data.pulse = Math.max(0, data.pulse - delta * 1.2);
    } else {
      mailbox.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
    }
  });

  const tide = tideConfig[currentTide];
  scene.fog.color.lerp(new THREE.Color(tide.fog), delta * 0.5);
  scene.background.lerp(new THREE.Color(tide.fog).multiplyScalar(0.68), delta * 0.5);
  scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, tide.density, delta * 0.7);
  ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, tide.light, delta * 0.7);
  bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, tide.bloom, delta * 0.6);
  moonShaft.intensity = THREE.MathUtils.lerp(moonShaft.intensity, currentTide === 2 ? 0.55 : 2.5, delta * 0.8);
  waterGrade.style.opacity = currentTide === 2 ? '0.45' : '1';

  if (postmanBreathEnabled()) {
    postLight.intensity = lanternOn ? 68 + Math.sin(elapsed * 1.3) * 6 : 2;
  }
}

function postmanBreathEnabled() {
  return !reducedMotion && lanternOn;
}

function onResize() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1280;
  const height = window.innerHeight || document.documentElement.clientHeight || 720;
  camera.aspect = width / height;
  camera.fov = width < 620 ? 47 : width < 900 ? 43 : 39;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 620 ? 1 : 1.25));
  renderer.setSize(width, height);
  composer.setSize(width, height);
}
window.addEventListener('resize', onResize);
window.visualViewport?.addEventListener('resize', onResize);
const resizeObserver = typeof ResizeObserver !== 'undefined'
  ? new ResizeObserver(onResize)
  : null;
resizeObserver?.observe(document.querySelector('#app'));
onResize();
setTimeout(onResize, 0);
setTimeout(onResize, 240);

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  updateCameraMove(now);
  if (cameraMove) {
    controls.enabled = false;
  } else {
    controls.enabled = true;
    controls.update();
  }
  if (tourActive) {
    tourTimer += delta;
    if (tourTimer > 7.5) {
      tourTimer = 0;
      setCameraShot((currentShot + 1) % shots.length, 2.8);
    }
  }
  updateAnimations(delta, elapsed);

  performanceFrames += 1;
  performanceElapsed += delta;
  if (performanceFrames >= 45) {
    const averageFrame = performanceElapsed / performanceFrames;
    if (!postprocessingEnabled && averageFrame < 0.024) {
      postprocessingEnabled = true;
    } else if (postprocessingEnabled && averageFrame > 0.07) {
      postprocessingEnabled = false;
    }
    performanceFrames = 0;
    performanceElapsed = 0;
  }

  if (postprocessingEnabled) composer.render();
  else renderer.render(scene, camera);
}

let loadingProgress = 7;
const loadingTimer = setInterval(() => {
  loadingProgress = Math.min(91, loadingProgress + Math.random() * 12);
  loadingBar.style.width = `${loadingProgress}%`;
}, 70);

clearInterval(loadingTimer);
loadingBar.style.width = '100%';
loading.classList.add('is-hidden');
setCameraShot(0, 3.6);
setTimeout(() => animate(performance.now()), reducedMotion ? 0 : 120);

window.__ABYSSAL_POST__ = {
  ready: true,
  voxelCount,
  setShot: setCameraShot,
  setTide,
  openLetter: () => openLetter(activeMailbox),
  toggleTour,
  toggleLantern,
  hide: toggleInterface,
};
