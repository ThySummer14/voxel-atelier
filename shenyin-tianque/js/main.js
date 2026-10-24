// main.js — 神隐天阙·主入口渲染流水线与交互系统

import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { EffectComposer } from '../vendor/EffectComposer.js';
import { RenderPass } from '../vendor/RenderPass.js';
import { UnrealBloomPass } from '../vendor/UnrealBloomPass.js';
import { buildWorld } from './build.js';
import { createAmbient, PHASES } from './ambient.js';

// ─── 摄像机镜头机位预设 ───
const CAMERAS = [
  {
    name: '全景·天阙横绝',
    pos: [110, 68, 125],
    target: [0, 36, -5],
    fov: 42,
  },
  {
    name: '红桥·灵域初度',
    pos: [-18, 22, 68],
    target: [-5, 24, 0],
    fov: 46,
  },
  {
    name: '天阁·朱楼金顶',
    pos: [42, 86, 52],
    target: [0, 65, -8],
    fov: 40,
  },
  {
    name: '车行·沧海一粟',
    pos: [-72, 14, 52],
    target: [20, 10, 20],
    fov: 48,
  },
  {
    name: '俯瞰·千青万水',
    pos: [0, 140, 95],
    target: [0, 28, 0],
    fov: 50,
  },
];

async function init() {
  const canvas = document.getElementById('stage');
  const veil = document.getElementById('veil');

  // 1. 渲染器配置
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 2. 场景与雾
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x5a344d, 150, 480);

  // 3. 摄像机与控制器
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 900);
  camera.position.set(110, 68, 125);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 36, -5);
  controls.maxPolarAngle = Math.PI * 0.49; // 避免视角钻入水下
  controls.minDistance = 15;
  controls.maxDistance = 350;

  // 4. 灯光系统
  const sunLight = new THREE.DirectionalLight(0xffaa5e, 2.8);
  sunLight.position.set(-100, 75, -110);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 420;
  const shadowRange = 110;
  sunLight.shadow.camera.left = -shadowRange;
  sunLight.shadow.camera.right = shadowRange;
  sunLight.shadow.camera.top = shadowRange;
  sunLight.shadow.camera.bottom = -shadowRange;
  sunLight.shadow.bias = -0.0006;
  scene.add(sunLight);

  const hemiLight = new THREE.HemisphereLight(0x8a587c, 0x4a342a, 0.9);
  scene.add(hemiLight);

  const ambLight = new THREE.AmbientLight(0x443044, 0.35);
  scene.add(ambLight);

  // 5. 构建世界体素
  const build = buildWorld();
  scene.add(build.opaqueMesh);
  scene.add(build.glowMesh);
  scene.add(build.train.group);
  scene.add(build.dragon.group);
  scene.add(build.waterWheel.group);

  // 6. 环境天空、Shader水面与粒子
  const ambient = createAmbient(scene, build);
  build.waterMesh.material = ambient.waterMat;
  scene.add(build.waterMesh);

  // 7. 后期合成管线 (UnrealBloom)
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.28,
    0.7,
    0.78
  );
  composer.addPass(bloomPass);

  // 8. 摄像机镜头平滑运镜系统
  let camLerping = false;
  let camStartTime = 0;
  const camStartPos = new THREE.Vector3();
  const camEndPos = new THREE.Vector3();
  const camStartTgt = new THREE.Vector3();
  const camEndTgt = new THREE.Vector3();
  let camStartFov = 42, camEndFov = 42;

  function switchCamera(idx) {
    const preset = CAMERAS[idx];
    if (!preset) return;
    camLerping = true;
    camStartTime = performance.now() * 0.001;
    camStartPos.copy(camera.position);
    camEndPos.set(...preset.pos);
    camStartTgt.copy(controls.target);
    camEndTgt.set(...preset.target);
    camStartFov = camera.fov;
    camEndFov = preset.fov;
  }

  // 9. UI 事件绑定
  const camButtons = document.querySelectorAll('#views .chip');
  camButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      camButtons.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      switchCamera(idx);
    });
  });

  const phaseButtons = document.querySelectorAll('#phases .chip');
  phaseButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      phaseButtons.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      ambient.setPhase(idx);
    });
  });

  let paused = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      paused = !paused;
    }
  });

  // 窗口重置自适应
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(w, h);
  });

  // 褪去加载帷幕
  setTimeout(() => {
    veil.classList.add('gone');
  }, 350);

  // 10. 动力学时钟循环
  const clock = new THREE.Clock();
  const envCtx = {
    time: 0,
    sun: sunLight,
    hemi: hemiLight,
    ambLight: ambLight,
    bloom: bloomPass,
    renderer: renderer,
    glowMat: build.glowMat,
  };

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (!paused) {
      envCtx.time += dt;

      // 海上列车前行推进
  // 暴露全局 APP 对象用于 CLI 自动化截图与调试
  window.APP = {
    renderer,
    scene,
    camera,
    controls,
    build,
    ambient,
    switchCamera,
    setPhase: (idx) => {
      phaseButtons.forEach(b => b.classList.remove('on'));
      if (phaseButtons[idx]) phaseButtons[idx].classList.add('on');
      ambient.setPhase(idx);
    },
    setPause: (p) => { paused = p; },
  };

      build.train.pos += dt * 14.0;
      if (build.train.pos > 85) build.train.pos = -85;
      build.train.group.position.x = build.train.pos;

      // 白龙云海盘旋巡弋
      const dragonAngle = envCtx.time * 0.35;
      build.dragon.group.position.x = Math.cos(dragonAngle) * 48;
      build.dragon.group.position.z = -12 + Math.sin(dragonAngle) * 42;
      build.dragon.group.position.y = 80 + Math.sin(envCtx.time * 0.8) * 4.5;
      build.dragon.group.rotation.y = -dragonAngle + Math.PI * 0.5;

      // 水车匀速转动
      build.waterWheel.group.rotation.z -= dt * 0.8;

      // 环境与粒子推进
      ambient.update(dt, envCtx);
    }

    // 摄像机机位平滑过渡插值
    if (camLerping) {
      const now = performance.now() * 0.001;
      const progress = Math.min(1.0, (now - camStartTime) / 1.4);
      // 精致三次方平滑缓动
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(camStartPos, camEndPos, ease);
      controls.target.lerpVectors(camStartTgt, camEndTgt, ease);
      camera.fov = THREE.MathUtils.lerp(camStartFov, camEndFov, ease);
      camera.updateProjectionMatrix();

      if (progress >= 1.0) {
        camLerping = false;
      }
    }

    controls.update();
    composer.render();
  }

  animate();
}

window.addEventListener('DOMContentLoaded', init);
