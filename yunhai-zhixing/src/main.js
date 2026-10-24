import * as THREE from 'three';
THREE.ColorManagement.enabled = false;

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { VoxelVolume, makeEdgeTexture } from './voxel.js';
import { createTerrain, buildTerrain } from './terrain.js';
import { buildArchitecture } from './architecture.js';
import { buildNature } from './nature.js';
import { createLoom } from './loom.js';
import { createSky } from './sky.js';
import { createClouds } from './clouds.js';
import { createRibbons } from './ribbons.js';
import { createEffects } from './effects.js';
import { StarloomAudio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const freezeAt = params.has('freeze') ? Math.max(0, parseFloat(params.get('freeze')) || 0) : null;
const showUI = params.get('ui') !== '0';

const VIEWS = {
  wide: {
    pos: new THREE.Vector3(142, 111, 213),
    target: new THREE.Vector3(0, 75, 2),
    fov: 35,
  },
  loom: {
    pos: new THREE.Vector3(74, 103, 145),
    target: new THREE.Vector3(0, 92, 2),
    fov: 34,
  },
  hall: {
    pos: new THREE.Vector3(138, 93, 145),
    target: new THREE.Vector3(36, 67, 11),
    fov: 34,
  },
};

const el = {
  loading: document.getElementById('loading'),
  progress: document.getElementById('progress'),
  loadingCopy: document.getElementById('loading-copy'),
  weave: document.getElementById('weave'),
  sound: document.getElementById('sound'),
  views: [...document.querySelectorAll('[data-view]')],
  noWebgl: document.getElementById('no-webgl'),
};

let progressValue = 0;
function setProgress(value, copy) {
  progressValue = value;
  if (el.progress) el.progress.style.width = `${value}%`;
  if (copy && el.loadingCopy) el.loadingCopy.textContent = copy;
}

const tick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

function makeFinalShader() {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uExposure: { value: 1.16 },
      uPulse: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uExposure;
      uniform float uPulse;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(443.897, 441.423));
        p += dot(p, p + 19.19);
        return fract(p.x * p.y);
      }
      vec3 aces(vec3 x) {
        const float a = 2.51;
        const float b = 0.03;
        const float c = 0.43;
        const float d = 0.59;
        const float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }

      void main() {
        vec2 uv = vUv;
        vec2 dir = uv - 0.5;
        float rr = dot(dir, dir);
        vec2 ca = dir * rr * 0.0013;
        vec3 col;
        col.r = texture2D(tDiffuse, uv + ca).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - ca).b;

        col *= uExposure * (1.0 + uPulse * 0.06);
        col = aces(col);

        // split-tone: cold shade, warm candlelight
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, col * vec3(0.83, 0.94, 1.09), smoothstep(0.5, 0.02, lum) * 0.26);
        col = mix(col, col * vec3(1.08, 1.0, 0.88), smoothstep(0.4, 0.96, lum) * 0.22);
        col = mix(vec3(lum), col, 1.035);
        col = clamp(col, 0.0, 1.0);
        col = pow(col, vec3(1.0 / 2.2));

        float vignette = smoothstep(0.92, 0.22, length(dir) * 1.34);
        col *= mix(0.72, 1.0, vignette);
        col += vec3(0.012, 0.018, 0.02) * (1.0 - smoothstep(0.0, 0.55, lum)) * 0.35;

        float grain = hash(gl_FragCoord.xy + uTime * 73.0);
        col += (grain - 0.5) * 0.012;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };
}

function makeEnvironment(renderer) {
  const envScene = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: `varying vec3 vPos; void main(){ vPos=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vPos;
      void main() {
        float h = vPos.y * 0.5 + 0.5;
        vec3 top = vec3(0.03, 0.075, 0.11);
        vec3 mid = vec3(0.13, 0.2, 0.23);
        vec3 low = vec3(0.01, 0.02, 0.025);
        vec3 col = mix(low, mid, smoothstep(0.0, 0.5, h));
        col = mix(col, top, smoothstep(0.5, 1.0, h));
        float moon = pow(max(0.0, dot(normalize(vPos), normalize(vec3(0.4, 0.75, -0.4)))), 50.0);
        col += vec3(0.8, 0.85, 0.8) * moon * 1.6;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sphere = new THREE.Mesh(geo, mat);
  envScene.add(sphere);
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const rt = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  return rt.texture;
}

async function boot() {
  const canvas = document.getElementById('scene');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
  } catch (err) {
    el.noWebgl.hidden = false;
    el.loading.classList.add('done');
    return;
  }
  if (!renderer.capabilities.isWebGL2) {
    el.noWebgl.hidden = false;
    el.loading.classList.add('done');
    return;
  }

  const dprParam = parseFloat(params.get('dpr') || '0');
  const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 720;
  const maxDpr = coarse ? 1.5 : 2;
  const dpr = THREE.MathUtils.clamp(dprParam || window.devicePixelRatio || 1, 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x050b12, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(0x12222d).convertSRGBToLinear(), 330, 760);

  const camera = new THREE.PerspectiveCamera(VIEWS.wide.fov, window.innerWidth / window.innerHeight, 1, 1900);
  const initial = VIEWS.wide;
  camera.position.copy(initial.pos);
  camera.lookAt(initial.target);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(initial.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.rotateSpeed = 0.38;
  controls.zoomSpeed = 0.65;
  controls.minDistance = 78;
  controls.maxDistance = 480;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = Math.PI * 0.485;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.12;
  controls.update();

  // environment for the brass and lacquer
  const env = makeEnvironment(renderer);
  scene.environment = env;
  scene.environmentIntensity = 0.36;

  // lighting: moon from the upper right, tucked behind the scene
  const hemi = new THREE.HemisphereLight(
    new THREE.Color(0x7694aa).convertSRGBToLinear(),
    new THREE.Color(0x0d171b).convertSRGBToLinear(),
    0.82,
  );
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight(new THREE.Color(0xc6d9e8).convertSRGBToLinear(), 3.25);
  moonLight.position.set(190, 330, -240);
  moonLight.target.position.set(0, 55, 0);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  moonLight.shadow.camera.left = -190;
  moonLight.shadow.camera.right = 190;
  moonLight.shadow.camera.top = 190;
  moonLight.shadow.camera.bottom = -160;
  moonLight.shadow.camera.near = 80;
  moonLight.shadow.camera.far = 720;
  moonLight.shadow.bias = -0.0002;
  moonLight.shadow.normalBias = 0.55;
  scene.add(moonLight);
  scene.add(moonLight.target);

  const frontFill = new THREE.DirectionalLight(new THREE.Color(0x527a91).convertSRGBToLinear(), 0.82);
  frontFill.position.set(-160, 90, 230);
  frontFill.target.position.set(10, 50, 0);
  scene.add(frontFill);
  scene.add(frontFill.target);

  const hallLight = new THREE.PointLight(new THREE.Color(0xffab63).convertSRGBToLinear(), 235, 95, 2);
  hallLight.position.set(45, 63, 28);
  scene.add(hallLight);
  const courtLight = new THREE.PointLight(new THREE.Color(0xffc17e).convertSRGBToLinear(), 120, 65, 2);
  courtLight.position.set(-2, 61, 14);
  scene.add(courtLight);
  const pavilionLight = new THREE.PointLight(new THREE.Color(0xffa45e).convertSRGBToLinear(), 85, 48, 2);
  pavilionLight.position.set(-55, 45, 56);
  scene.add(pavilionLight);
  const fallLight = new THREE.PointLight(new THREE.Color(0x79d9cc).convertSRGBToLinear(), 130, 60, 2);
  fallLight.position.set(-27, 36, 50);
  scene.add(fallLight);
  const daisLight = new THREE.PointLight(new THREE.Color(0xffbf7a).convertSRGBToLinear(), 95, 38, 2);
  daisLight.position.set(0, 59, 23);
  scene.add(daisLight);
  const cliffLight = new THREE.PointLight(new THREE.Color(0xffa967).convertSRGBToLinear(), 55, 26, 2);
  cliffLight.position.set(72, 40, 47);
  scene.add(cliffLight);
  const seedLight = new THREE.PointLight(new THREE.Color(0xa4f6e4).convertSRGBToLinear(), 150, 28, 2);
  seedLight.position.set(0, 63, 12);
  scene.add(seedLight);
  const towerLightL = new THREE.PointLight(new THREE.Color(0xffb26e).convertSRGBToLinear(), 65, 35, 2);
  towerLightL.position.set(-37, 77, 6);
  scene.add(towerLightL);
  const towerLightR = new THREE.PointLight(new THREE.Color(0xffb26e).convertSRGBToLinear(), 65, 35, 2);
  towerLightR.position.set(37, 77, 6);
  scene.add(towerLightR);

  // build the artwork in visible steps
  setProgress(6, '铺开云海');
  await tick();
  const edgeTexture = makeEdgeTexture();
  const volume = new VoxelVolume([-100, 0, -92], [100, 127, 92]);
  const terrain = createTerrain();
  setProgress(13, '凿开山骨');
  await tick();
  buildTerrain(volume, terrain.heightAt);
  setProgress(38, '架起灯阁');
  await tick();
  buildArchitecture(volume);
  setProgress(56, '种下松影');
  await tick();
  buildNature(volume, terrain.heightAt);
  setProgress(68, '拾起散落的星砂');
  await tick();
  const voxelWorld = volume.buildMeshes({ edgeTexture });
  scene.add(voxelWorld);
  setProgress(78, '架起天机');
  await tick();

  const loom = createLoom(edgeTexture);
  scene.add(loom.root);

  // a halo and a slow gold orbit for the star seed
  function radialGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,240,206,0.9)');
    g.addColorStop(0.15, 'rgba(152,246,225,0.55)');
    g.addColorStop(0.45, 'rgba(81,180,176,0.16)');
    g.addColorStop(1, 'rgba(20,80,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const seedHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialGlowTexture(),
    color: new THREE.Color(0xbff8e8).convertSRGBToLinear(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.6,
  }));
  seedHalo.position.set(0, 62, 10);
  seedHalo.scale.set(27, 27, 1);
  scene.add(seedHalo);

  const seedRing = new THREE.Mesh(
    new THREE.TorusGeometry(5.1, 0.15, 6, 64),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xe7c27d).convertSRGBToLinear().multiplyScalar(1.5),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  seedRing.position.set(0, 62, 9);
  seedRing.rotation.set(1.02, 0.4, 0);
  scene.add(seedRing);


  const sky = createSky(scene);
  sky.setPixelRatio(dpr);
  const clouds = createClouds(scene);
  const ribbons = createRibbons(scene);
  const effects = createEffects(scene, dpr);
  const audio = new StarloomAudio();
  setProgress(91, '点亮最后一盏灯');
  await tick();

  // post-processing
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    samples: coarse ? 2 : 4,
    colorSpace: THREE.LinearSRGBColorSpace,
  });
  const composer = new EffectComposer(renderer, rt);
  composer.setSize(window.innerWidth, window.innerHeight);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), coarse ? 0.36 : 0.42, 0.7, 0.92);
  composer.addPass(bloom);
  const finalPass = new ShaderPass(makeFinalShader());
  finalPass.renderToScreen = true;
  composer.addPass(finalPass);
  finalPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);

  // one precompile + first frame while the curtain is still closed
  setProgress(97, '收最后一针');
  await tick();
  try {
    await renderer.compileAsync(scene, camera);
  } catch (e) { /* compileAsync is an optimisation only */ }

  const now0 = performance.now();
  const baseTime = freezeAt !== null ? freezeAt : 0;
  loom.update(baseTime);
  sky.update(baseTime, camera);
  clouds.update(baseTime);
  ribbons.update(baseTime);
  effects.update(baseTime, 0.016);
  finalPass.uniforms.uTime.value = baseTime;
  composer.render();

  setProgress(100, '织成');
  await new Promise((resolve) => setTimeout(resolve, 180));
  el.loading.classList.add('done');
  if (!showUI) document.body.classList.add('ui-hidden');
  else document.body.classList.remove('ui-hidden');
  document.body.classList.add('ready');

  // ---------- camera choreography ----------
  let currentView = 'wide';

  function computedView(name) {
    const base = VIEWS[name];
    const aspect = window.innerWidth / window.innerHeight;
    const pos = base.pos.clone();
    const target = base.target.clone();
    let fov = base.fov;
    if (aspect < 0.8) {
      if (name === 'wide') {
        pos.set(112, 104, 205);
        target.set(0, 82, 2);
        fov = 42;
      } else if (name === 'loom') {
        pos.set(61, 99, 132);
        target.set(0, 91, 2);
        fov = 40;
      } else {
        pos.set(88, 74, 82);
        target.set(43, 63, 11);
        fov = 40;
      }
    } else {
      const fit = aspect < 1.05 ? 1.34 : aspect < 1.35 ? 1.12 : 1;
      pos.sub(target).multiplyScalar(fit).add(target);
    }
    return { pos, target, fov };
  }

  const cameraState = {
    tween: null,
    lastInteract: performance.now(),
    introDone: freezeAt !== null || reduceMotion,
  };

  function tweenCamera(view, duration = 1.5) {
    const v = computedView(view);
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    cameraState.tween = {
      elapsed: 0,
      duration,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: v.pos,
      toTarget: v.target,
    };
    controls.autoRotate = false;
  }

  if (freezeAt === null && !reduceMotion) {
    const v = computedView('wide');
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    camera.position.set(v.pos.x * 1.45, v.pos.y + 42, v.pos.z * 1.45);
    controls.target.set(0, 69, 0);
    controls.update();
    cameraState.tween = {
      elapsed: 0,
      duration: 4.6,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: v.pos,
      toTarget: v.target,
    };
  } else if (freezeAt === null) {
    const v = computedView('wide');
    camera.position.copy(v.pos);
    controls.target.copy(v.target);
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    controls.update();
  }

  function completeTween() {
    if (!cameraState.tween) return;
    controls.target.copy(cameraState.tween.toTarget);
    camera.position.copy(cameraState.tween.toPos);
    cameraState.tween = null;
    controls.update();
  }

  function setView(view, instant = false) {
    if (!VIEWS[view]) return;
    el.views.forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    completeTween();
    currentView = view;
    if (instant || reduceMotion) {
      const v = computedView(view);
      camera.position.copy(v.pos);
      controls.target.copy(v.target);
      camera.fov = v.fov;
      camera.updateProjectionMatrix();
      cameraState.tween = null;
      controls.update();
    } else {
      tweenCamera(view, 1.45);
      cameraState.lastInteract = performance.now();
    }
    cameraState.introDone = true;
  }

  el.views.forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view);
      cameraState.lastInteract = performance.now();
    });
  });

  controls.addEventListener('start', () => {
    cameraState.tween = null;
    cameraState.lastInteract = performance.now();
    cameraState.introDone = true;
    controls.autoRotate = false;
  });
  controls.addEventListener('end', () => {
    cameraState.lastInteract = performance.now();
  });
  canvas.addEventListener('wheel', () => { cameraState.lastInteract = performance.now(); }, { passive: true });

  // ---------- interaction: pull a thread of starlight ----------
  let pulseEnergy = 0;

  function weave() {
    ribbons.pulse(1);
    effects.triggerBurst();
    pulseEnergy = 1;
    el.weave.classList.remove('pulse');
    void el.weave.offsetWidth;
    el.weave.classList.add('pulse');
    audio.weave();
    cameraState.lastInteract = performance.now();
  }
  el.weave.addEventListener('click', weave);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') weave();
    if (e.key === '1') setView('wide');
    if (e.key === '2') setView('loom');
    if (e.key === '3') setView('hall');
    if (e.key === 'r' || e.key === 'R') setView('wide');
  });

  // ---------- ambient sound ----------
  let soundOn = false;
  el.sound.addEventListener('click', async () => {
    soundOn = !soundOn;
    if (soundOn) {
      try {
        await audio.enable();
        el.sound.setAttribute('aria-pressed', 'true');
        el.sound.setAttribute('aria-label', '关闭声音');
      } catch (err) {
        soundOn = false;
        el.sound.setAttribute('aria-pressed', 'false');
        el.sound.setAttribute('aria-label', '开启声音');
      }
    } else {
      audio.disable();
      el.sound.setAttribute('aria-pressed', 'false');
      el.sound.setAttribute('aria-label', '开启声音');
    }
  });

  // ---------- adaptation ----------
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = VIEWS.wide.fov;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    finalPass.uniforms.uResolution.value.set(w, h);
    const s = renderer.getDrawingBufferSize(new THREE.Vector2());
    bloom.setSize(s.x, s.y);
    if (!cameraState.tween) {
      const v = computedView(currentView);
      camera.position.copy(v.pos);
      controls.target.copy(v.target);
      camera.fov = v.fov;
      camera.updateProjectionMatrix();
      controls.update();
    }
  }
  window.addEventListener('resize', onResize);

  // expose for capture / debugging
  const api = {
    ready: true,
    camera,
    controls,
    scene,
    renderer,
    composer,
    loom,
    ribbons,
    effects,
    weaver: weave,
    setView,
    setUI(visible) {
      document.body.classList.toggle('ui-hidden', !visible);
    },
    flash(v = 1) {
      pulseEnergy = v;
      ribbons.pulse(v);
      effects.triggerBurst();
    },
    stats: {
      voxels: volume.count,
      meshes: voxelWorld.children.length,
    },
    setTime(t) {
      // useful for deterministic captures once the artwork is ready
      api.frozenTime = t;
    },
  };
  window.__YH = api;

  // ---------- animation ----------
  const clock = new THREE.Clock();
  let elapsed = baseTime;
  let last = performance.now();
  let firstFrame = true;

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.08) dt = 0.08;
    if (api.frozenTime !== undefined) {
      elapsed = api.frozenTime;
    } else if (freezeAt === null) {
      elapsed += dt;
    } else {
      elapsed = baseTime;
    }
    const time = elapsed;

    if (cameraState.tween) {
      cameraState.tween.elapsed += dt;
      const raw = Math.min(1, cameraState.tween.elapsed / cameraState.tween.duration);
      const t = 1 - Math.pow(1 - raw, 3);
      camera.position.lerpVectors(cameraState.tween.fromPos, cameraState.tween.toPos, t);
      controls.target.lerpVectors(cameraState.tween.fromTarget, cameraState.tween.toTarget, t);
      if (raw >= 1) cameraState.tween = null;
      controls.update();
    } else {
      if (!reduceMotion && freezeAt === null && cameraState.introDone
        && now - cameraState.lastInteract > 15000) {
        controls.autoRotate = true;
      } else {
        controls.autoRotate = false;
      }
      controls.update();
    }

    pulseEnergy *= Math.pow(0.055, dt);
    loom.update(time);
    sky.update(time, camera);
    clouds.update(time);
    ribbons.update(time);
    effects.update(time, dt);
    seedRing.rotation.z = time * 0.16;
    seedRing.rotation.y = 0.4 + Math.sin(time * 0.12) * 0.16;
    seedHalo.material.opacity = 0.5 + Math.sin(time * 0.8) * 0.08;
    finalPass.uniforms.uTime.value = time;
    finalPass.uniforms.uPulse.value = pulseEnergy;
    bloom.strength = 0.42 + pulseEnergy * 0.12;
    composer.render();

    if (firstFrame) {
      firstFrame = false;
      window.__YH.firstFrameAt = performance.now();
    }
  }
  animate();

  // pause the clock when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { last = performance.now(); }
  });
}

boot().catch((err) => {
  console.error(err);
  if (el.loadingCopy) el.loadingCopy.textContent = '星线断了 · 请刷新重试';
  if (el.loading) el.loading.classList.add('done');
  if (el.noWebgl) {
    el.noWebgl.hidden = false;
    el.noWebgl.querySelector('p').textContent = '织机未能启动';
    el.noWebgl.querySelector('small').textContent = '请刷新页面，或使用最新版 Chrome / Safari 打开。';
  }
});
