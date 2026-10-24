// 极夜流火 · 核心场景与渲染控制器 (Master Scene Orchestrator)
// 包含物理光照、多机位运镜、动态体素装配、切断阀联动与全局遥测接口

import * as THREE from '../vendor/three.module.js';
import { SPEC } from './spec.js';
import { VoxelMesher } from './voxel/mesher.js';
import { LocomotiveSculptor } from './sculpt/locomotive.js';
import { EnvironmentSculptor } from './sculpt/environment.js';
import { WalschaertsKinematics } from './kinematics.js';
import { LinkageRenderer } from './linkage.js';
import { ParticleEngine } from './particles.js';
import { AuroraSky } from './aurora.js';
import { ProceduralTrainAudio } from './audio.js';

export class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.stats = { fps: 60, triangles: 0, drawCalls: 0 };
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.isCutaway = false;
    this.currentCamPreset = 'hero';
    this.camTargetPos = new THREE.Vector3(...SPEC.CAMERAS.hero.pos);
    this.camLookTarget = new THREE.Vector3(...SPEC.CAMERAS.hero.target);

    this.kinematics = new WalschaertsKinematics();
    this.audio = new ProceduralTrainAudio();

    this.initThree();
    this.initLighting();
    this.buildWorld();
    this.initControls();
    this.bindEvents();

    // 暴露自动化评测入口
    window.JY = {
      getTelemetry: () => this.kinematics.getTelemetry(),
      setSpeed: (v) => { this.kinematics.speedKmh = v; },
      setCutoff: (c) => { this.kinematics.cutoff = c; },
      setCutaway: (b) => { this.toggleCutaway(b); },
      setCamera: (k, immediate = true) => { this.switchCamera(k, immediate); },
      whistle: (b) => { b ? this.audio.startWhistle() : this.audio.stopWhistle(); },
      stats: () => ({ ...this.stats })
    };

    this.clock = new THREE.Clock();
    this.animate();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050a12); // 极地深宵深绀蓝
    this.scene.fog = new THREE.FogExp2(0x060e18, 0.0025); // 极地轻薄夜雾

    this.camera = new THREE.PerspectiveCamera(
      SPEC.CAMERAS.hero.fov,
      window.innerWidth / window.innerHeight,
      0.2,
      800
    );
    this.camera.position.copy(this.camTargetPos);
    this.camera.lookAt(this.camLookTarget);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;

    this.container.appendChild(this.renderer.domElement);
  }

  initLighting() {
    // 1. 冰原极月冷辉 (Cool Directional Moonlight)
    this.moonLight = new THREE.DirectionalLight(0xb4d2e7, 2.2);
    this.moonLight.position.set(22, 28, 16);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 5;
    this.moonLight.shadow.camera.far = 90;
    this.moonLight.shadow.camera.left = -25;
    this.moonLight.shadow.camera.right = 25;
    this.moonLight.shadow.camera.top = 25;
    this.moonLight.shadow.camera.bottom = -25;
    this.moonLight.shadow.bias = -0.0003;
    this.scene.add(this.moonLight);

    // 2. 侧后轮廓补光 (Rim / Accent Light)
    this.rimLight = new THREE.DirectionalLight(0x4a6fa5, 1.4);
    this.rimLight.position.set(-20, 16, -18);
    this.scene.add(this.rimLight);

    // 3. 积雪漫反射微光 (Hemisphere Light: Sky & Snow Bounce)
    this.hemiLight = new THREE.HemisphereLight(0x1a2e40, 0xd8e2dc, 1.25);
    this.scene.add(this.hemiLight);

    // 4. 车头主探照灯强光束 (Locomotive High-Beam Spotlight)
    const S = SPEC.VOXEL_SIZE_M;
    this.headlight = new THREE.SpotLight(0xfffbe6, 12.0, 75, Math.PI * 0.18, 0.45, 1.1);
    this.headlight.position.set(0, (SPEC.BOILER_CENTER_Y + 20) * S, 80 * S);
    this.headlightTarget = new THREE.Object3D();
    this.headlightTarget.position.set(0, 15 * S, 200 * S);
    this.scene.add(this.headlightTarget);
    this.headlight.target = this.headlightTarget;
    this.headlight.castShadow = true;
    this.scene.add(this.headlight);

    // 4. 司炉火箱炽烈红金火光 (Firebox Pulsing Point Light)
    this.fireboxLight = new THREE.PointLight(0xff7b00, 3.2, 14, 1.5);
    this.fireboxLight.position.set(0, 42 * S, -88 * S);
    this.scene.add(this.fireboxLight);

    // 5. 驾驶室暖色汽灯 (Cab Amber Light)
    this.cabLight = new THREE.PointLight(0xffb703, 1.8, 8, 1.8);
    this.cabLight.position.set(0, 75 * S, -104 * S);
    this.scene.add(this.cabLight);
  }

  buildWorld() {
    const S = SPEC.VOXEL_SIZE_M;

    // 通用体素材质 (支持顶点颜色与阴影投射)
    this.voxelMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.65,
      metalness: 0.25
    });

    // 1. 机车主体外壳 (完整版)
    const bodyFullGeom = VoxelMesher.buildGeometry(LocomotiveSculptor.buildBody(false));
    this.bodyFullMesh = new THREE.Mesh(bodyFullGeom, this.voxelMaterial);
    this.bodyFullMesh.castShadow = true;
    this.bodyFullMesh.receiveShadow = true;
    this.scene.add(this.bodyFullMesh);

    // 机车主体 (剖切版)
    const bodyCutGeom = VoxelMesher.buildGeometry(LocomotiveSculptor.buildBody(true));
    this.bodyCutMesh = new THREE.Mesh(bodyCutGeom, this.voxelMaterial);
    this.bodyCutMesh.castShadow = true;
    this.bodyCutMesh.receiveShadow = true;
    this.bodyCutMesh.visible = false;
    this.scene.add(this.bodyCutMesh);

    // 2. 锅炉内部剖切内构 (Cutaway Interior)
    const cutInteriorGeom = VoxelMesher.buildGeometry(LocomotiveSculptor.buildCutawayInterior());
    this.cutInteriorMesh = new THREE.Mesh(cutInteriorGeom, this.voxelMaterial);
    this.cutInteriorMesh.castShadow = true;
    this.cutInteriorMesh.visible = false;
    this.scene.add(this.cutInteriorMesh);

    // 3. 煤水车 (Tender)
    const tenderGeom = VoxelMesher.buildGeometry(LocomotiveSculptor.buildTender());
    this.tenderMesh = new THREE.Mesh(tenderGeom, this.voxelMaterial);
    this.tenderMesh.castShadow = true;
    this.tenderMesh.receiveShadow = true;
    this.scene.add(this.tenderMesh);

    // 4. 动轮组 (6 只巨型动轮，分别实时旋转)
    this.driverWheels = [];
    const wheelLeftGrid = LocomotiveSculptor.buildDriverWheelGeom(SPEC.DRIVER_RADIUS, 2, SPEC.CRANK_RADIUS, false);
    const wheelRightGrid = LocomotiveSculptor.buildDriverWheelGeom(SPEC.DRIVER_RADIUS, 2, SPEC.CRANK_RADIUS, true);
    const wheelLeftGeom = VoxelMesher.buildGeometry(wheelLeftGrid);
    const wheelRightGeom = VoxelMesher.buildGeometry(wheelRightGrid);

    for (let i = 0; i < SPEC.DRIVER_COUNT; i++) {
      const zPos = SPEC.DRIVER_Z_POS[i] * S;
      const yPos = SPEC.DRIVER_AXLE_Y * S;

      // 左轮
      const meshL = new THREE.Mesh(wheelLeftGeom, this.voxelMaterial);
      meshL.position.set(-14 * S, yPos, zPos);
      meshL.castShadow = true;
      this.scene.add(meshL);

      // 右轮
      const meshR = new THREE.Mesh(wheelRightGeom, this.voxelMaterial);
      meshR.position.set(14 * S, yPos, zPos);
      meshR.castShadow = true;
      this.scene.add(meshR);

      this.driverWheels.push({ left: meshL, right: meshR });
    }

    // 5. 铁桥与轨道环境
    const viaductGeom = VoxelMesher.buildGeometry(EnvironmentSculptor.buildViaduct());
    this.viaductMesh = new THREE.Mesh(viaductGeom, this.voxelMaterial);
    this.viaductMesh.castShadow = true;
    this.viaductMesh.receiveShadow = true;
    this.scene.add(this.viaductMesh);

    // 6. 深冰峡谷与冷杉森林
    const gorgeGeom = VoxelMesher.buildGeometry(EnvironmentSculptor.buildGorgeTerrain());
    this.gorgeMesh = new THREE.Mesh(gorgeGeom, this.voxelMaterial);
    this.gorgeMesh.receiveShadow = true;
    this.scene.add(this.gorgeMesh);

    // 7. 华氏配气杆系 3D Rig
    this.linkageRig = new LinkageRenderer(this.scene);

    // 8. 动态粒子引擎 (排汽烟羽、火星、飞雪)
    this.particles = new ParticleEngine(this.scene);

    // 9. 极光天幕
    this.aurora = new AuroraSky(this.scene);

    // 统计三角面数
    let totalTriangles = 0;
    this.scene.traverse((obj) => {
      if (obj.isMesh && obj.geometry) {
        const pos = obj.geometry.attributes.position;
        if (pos) totalTriangles += pos.count / 3;
      }
    });
    this.stats.triangles = Math.round(totalTriangles);
  }

  // 切换剖切模式
  toggleCutaway(forcedState = null) {
    this.isCutaway = forcedState !== null ? forcedState : !this.isCutaway;
    this.bodyFullMesh.visible = !this.isCutaway;
    this.bodyCutMesh.visible = this.isCutaway;
    this.cutInteriorMesh.visible = this.isCutaway;

    const btn = document.getElementById('btn-cutaway');
    if (btn) {
      btn.classList.toggle('active', this.isCutaway);
      btn.innerText = this.isCutaway ? '万钧机心 · 剖切中' : '全机展示 · 剖切';
    }
  }

  // 切换运镜机位
  switchCamera(presetKey, immediate = false) {
    const preset = SPEC.CAMERAS[presetKey];
    if (!preset) return;
    this.currentCamPreset = presetKey;
    this.camTargetPos.set(...preset.pos);
    this.camLookTarget.set(...preset.target);
    this.camera.fov = preset.fov;
    this.camera.updateProjectionMatrix();
    if (immediate) {
      this.camera.position.copy(this.camTargetPos);
      this.camera.lookAt(this.camLookTarget);
    }

    document.querySelectorAll('.cam-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cam === presetKey);
    });
  }

  initControls() {
    // 简易鼠标拖拽环视
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#hud, #camera-bar')) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      this.audio.ensureContext();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouse.x) * 0.005;
      const dy = (e.clientY - prevMouse.y) * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };

      const offset = this.camera.position.clone().sub(this.camLookTarget);
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z) - dx;
      let phi = Math.acos(Math.max(-0.99, Math.min(0.99, offset.y / radius))) - dy;
      phi = Math.max(0.1, Math.min(Math.PI * 0.48, phi));

      this.camera.position.set(
        this.camLookTarget.x + radius * Math.sin(phi) * Math.sin(theta),
        this.camLookTarget.y + radius * Math.cos(phi),
        this.camLookTarget.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      this.camera.lookAt(this.camLookTarget);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('wheel', (e) => {
      const offset = this.camera.position.clone().sub(this.camLookTarget);
      offset.multiplyScalar(e.deltaY > 0 ? 1.08 : 0.92);
      this.camera.position.copy(this.camLookTarget).add(offset);
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  bindEvents() {
    // UI 滑块与按钮
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.kinematics.speedKmh = parseFloat(e.target.value);
      });
    }

    const cutoffSlider = document.getElementById('cutoff-slider');
    if (cutoffSlider) {
      cutoffSlider.addEventListener('input', (e) => {
        this.kinematics.cutoff = parseFloat(e.target.value);
      });
    }

    const whistleBtn = document.getElementById('btn-whistle');
    if (whistleBtn) {
      const startW = () => { this.audio.startWhistle(); whistleBtn.classList.add('active'); };
      const stopW = () => { this.audio.stopWhistle(); whistleBtn.classList.remove('active'); };
      whistleBtn.addEventListener('mousedown', startW);
      whistleBtn.addEventListener('mouseup', stopW);
      whistleBtn.addEventListener('mouseleave', stopW);
    }

    const cutBtn = document.getElementById('btn-cutaway');
    if (cutBtn) cutBtn.addEventListener('click', () => this.toggleCutaway());

    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const muted = this.audio.toggleMute();
        muteBtn.innerText = muted ? '已静音' : '音效开启';
      });
    }

    document.querySelectorAll('.cam-btn').forEach((b) => {
      b.addEventListener('click', () => this.switchCamera(b.dataset.cam));
    });

    // 键盘快捷键
    window.addEventListener('keydown', (e) => {
      this.audio.ensureContext();
      if (e.code === 'Space') {
        e.preventDefault();
        this.audio.startWhistle();
      } else if (e.code === 'KeyX') {
        this.toggleCutaway();
      } else if (e.code === 'KeyM') {
        this.audio.toggleMute();
      } else if (e.key >= '1' && e.key <= '6') {
        const keys = ['hero', 'gear', 'cutaway', 'cab', 'front', 'aurora'];
        this.switchCamera(keys[parseInt(e.key) - 1]);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.audio.stopWhistle();
      }
    });
  }

  updateHUD(telem) {
    const spVal = document.getElementById('val-speed');
    if (spVal) spVal.innerText = telem.speedKmh + ' km/h';

    const cutVal = document.getElementById('val-cutoff');
    if (cutVal) cutVal.innerText = telem.cutoffPercent + '%';

    const rpmVal = document.getElementById('val-rpm');
    if (rpmVal) rpmVal.innerText = telem.rpm;

    const hpVal = document.getElementById('val-hp');
    if (hpVal) hpVal.innerText = telem.horsepower + ' HP';

    const pressVal = document.getElementById('val-press');
    if (pressVal) pressVal.innerText = telem.boilerPressureBar + ' bar';

    const strokeVal = document.getElementById('val-stroke');
    if (strokeVal) strokeVal.innerText = telem.leftPistonStrokeMm + ' mm';
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(0.1, this.clock.getDelta());

    // 1. 更新动力学与华氏配气
    this.kinematics.update(dt);
    const telem = this.kinematics.getTelemetry();

    // 2. 动轮旋转
    const thLeft = this.kinematics.theta;
    const thRight = thLeft + Math.PI * 0.5;
    for (const w of this.driverWheels) {
      w.left.rotation.x = thLeft;
      w.right.rotation.x = thRight;
    }

    // 3. 更新配气杆系 3D Rig
    this.linkageRig.update(this.kinematics);

    // 4. 排汽与音效调度
    if (telem.chuffTriggered) {
      const speedRatio = Math.max(0.2, this.kinematics.speedKmh / 72.0);
      const intensity = Math.abs(this.kinematics.cutoff);
      this.particles.emitSteamPuff(intensity);
      this.audio.playChuff(intensity, speedRatio);
    }

    // 5. 粒子与极光更新
    this.particles.update(dt, this.kinematics.speedKmh);
    this.aurora.update(dt);

    // 6. 火箱火光闪烁
    const flicker = 1.0 + (Math.sin(performance.now() * 0.015) + Math.sin(performance.now() * 0.035)) * 0.2;
    this.fireboxLight.intensity = 3.2 * flicker;

    // 7. 摄像机平滑插值聚焦
    this.camera.position.lerp(this.camTargetPos, 0.04);
    this.camera.lookAt(this.camLookTarget);

    // 8. 渲染
    this.renderer.render(this.scene, this.camera);
    this.stats.drawCalls = this.renderer.info.render.calls;

    // 9. 更新 HUD
    this.updateHUD(telem);

    // 10. FPS 统计
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      const fpsElem = document.getElementById('val-fps');
      if (fpsElem) fpsElem.innerText = this.stats.fps;
    }
  }
}

// 自动启动
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
