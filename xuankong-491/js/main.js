// Main Application Entry for 《悬空千仞 · XUANKONG 491》
// Real-time WebGL2 Voxel Renderer, Post-Processing Bloom, 7 Curated Camera Views,
// X-Ray Hemlock Cantilever Mechanics Mode, Acoustic Bell Ripple, High-Res Poster Export, & QA Automation API (`window.XK`).

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { GROUPS } from '../source/core/palette.js';
import { generateWorld, VOXEL_SIZE } from '../source/world/build-world.js';
import { createVoxelGroupMaterial, buildGroupGeometry } from '../source/render/materials.js';
import { createEnvironment, LIGHTING_PRESETS } from '../source/render/environment.js';
import { createTempleSoundscape } from '../source/audio/soundscape.js';
import { buildVoxBinary } from '../source/core/vox-exporter.js';

// Curated Cinematographic Camera Views (World space in meters, where 1 voxel = 0.25m)
// Temple spans roughly X = [-2 .. +4.5], Y = [19.5 .. 40.0], Z = [-18.5 .. +17.5]
// Valley water at Y = 2.45, Overhanging cliff crest up to Y = 62.0!
export const CAMERA_VIEWS = {
  panorama: {
    label: '金龙全揽',
    pos: [82.0, 33.5, -14.0],
    target: [2.0, 28.5, 0.0],
    fov: 46,
  },
  threeTeachings: {
    label: '三教凌虚',
    pos: [19.5, 36.8, 8.5],
    target: [1.8, 36.2, 13.0],
    fov: 38,
  },
  skyWalkway: {
    label: '双栈穿云',
    pos: [18.5, 30.2, 0.5],
    target: [1.8, 31.0, 6.2],
    fov: 40,
  },
  mechanics: {
    label: '飞梁探秘',
    pos: [12.5, 32.2, -1.8],
    target: [-2.2, 28.2, 6.2],
    fov: 44,
    autoXRay: true,
  },
  bellDrum: {
    label: '钟鼓对峙',
    pos: [21.5, 25.5, -6.5],
    target: [2.8, 24.5, -10.2],
    fov: 40,
  },
  valleyUp: {
    label: '壮观仰止',
    pos: [16.8, 5.4, -3.2],
    target: [2.8, 22.0, -1.8],
    fov: 54,
  },
  bridge: {
    label: '古桥听涧',
    pos: [16.2, 6.8, -26.2],
    target: [10.8, 5.0, -14.8],
    fov: 48,
  },
};

async function init() {
  const wrap = document.getElementById('canvas-wrap');
  const loaderEl = document.getElementById('loader');
  const loaderStatus = document.getElementById('loader-status');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Allow browser to paint loading screen before synchronous world generation (~700ms)
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));

  const world = generateWorld();
  if (loaderStatus) {
    loaderStatus.textContent = `已构筑 ${(world.stats.solidVoxels / 10000).toFixed(1)} 万枚体素，正在点亮山门长明灯…`;
  }
  await new Promise((r) => requestAnimationFrame(r));

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    CAMERA_VIEWS.panorama.fov,
    window.innerWidth / window.innerHeight,
    0.4,
    420
  );
  camera.position.set(...CAMERA_VIEWS.panorama.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...CAMERA_VIEWS.panorama.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 6.0;
  controls.maxDistance = 115.0;
  controls.maxPolarAngle = Math.PI * 0.94;
  controls.minPolarAngle = 0.08;
  controls.update();

  // Shared shader uniforms across all voxel groups & water
  const sharedUniforms = {
    uTime: { value: 0 },
    uGlowIntensity: { value: 0.42 },
    uXRayMix: { value: 0.0 },
    uBellPulse: { value: 0.0 },
    uSnowAmount: { value: 0.0 },
  };

  // Build Three.js Meshes for each semantic Voxel Group
  const voxelRoot = new THREE.Group();
  scene.add(voxelRoot);
  const groupMeshes = {};

  for (const [gKey, desc] of Object.entries(world.meshed.groups)) {
    if (!desc || desc.quadCount === 0) continue;
    const gId = Number(gKey);
    const isGhostableCliff = gId === GROUPS.CLIFF_OUTER;
    const isArchitectureGroup = gId === GROUPS.ARCHITECTURE;
    const isMechanicsGroup = gId === GROUPS.BEAMS_MECHANICS;
    const isLanternGroup = gId === GROUPS.LANTERNS;

    const geo = buildGroupGeometry(desc);
    const mat = createVoxelGroupMaterial({
      isGhostableCliff,
      isArchitectureGroup,
      isMechanicsGroup,
      isLanternGroup,
      sharedUniforms,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = !isLanternGroup;
    mesh.receiveShadow = true;
    if (isGhostableCliff) {
      mesh.renderOrder = 2;
    }
    voxelRoot.add(mesh);
    groupMeshes[gId] = mesh;
  }

  // Build Living Environment (Sky, Sun, Shadows, River, Clouds, Swallows, Incense, Snow, Plinth)
  const env = createEnvironment(scene, sharedUniforms, world.anchors);

  // Subtle Post-Processing Bloom (makes paper lanterns, incense embers & X-Ray force waves glow poetically!)
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.26, // strength (restrained so daytime cliffs stay crisp!)
    0.55, // radius
    0.82  // threshold (only emissive lanterns/gold/highlights bloom)
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Soundscape
  const sound = createTempleSoundscape();

  // Interactive State
  let xrayTarget = 0.0;
  let xrayManual = false;
  let bellPulse = 0.0;
  let frozen = prefersReducedMotion;
  let currentViewId = 'panorama';

  // Smooth Camera Tweening
  const camAnim = {
    active: false,
    t: 0,
    duration: 1.35,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    fromFov: 40,
    toFov: 40,
  };

  // Cancel camera tween if user drags manually
  controls.addEventListener('start', () => {
    camAnim.active = false;
  });

  const xrayBtn = document.getElementById('btn-xray');
  const xrayLegend = document.getElementById('xray-legend');

  function setXRay(on, isManual = true) {
    if (isManual) xrayManual = on;
    xrayTarget = on ? 1.0 : 0.0;
    xrayBtn?.classList.toggle('active', on);
    xrayLegend?.classList.toggle('hidden', !on);
    // Toggle CLIFF_OUTER shadow casting when ghosted so sunlight illuminates embedded beams inside sockets!
    if (groupMeshes[GROUPS.CLIFF_OUTER]) {
      groupMeshes[GROUPS.CLIFF_OUTER].castShadow = !on;
      groupMeshes[GROUPS.CLIFF_OUTER].material.depthWrite = !on;
    }
  }

  function setView(viewId, instant = false) {
    const v = CAMERA_VIEWS[viewId];
    if (!v) return;
    currentViewId = viewId;

    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Auto-enable X-Ray when entering `mechanics` view, restore if leaving (unless manually toggled on)
    if (v.autoXRay) {
      setXRay(true, false);
    } else if (!xrayManual && xrayTarget > 0.5) {
      setXRay(false, false);
    }

    if (instant || prefersReducedMotion) {
      camAnim.active = false;
      camera.position.set(...v.pos);
      controls.target.set(...v.target);
      camera.fov = v.fov;
      camera.updateProjectionMatrix();
      controls.update();
      return;
    }

    camAnim.fromPos.copy(camera.position);
    camAnim.toPos.set(...v.pos);
    camAnim.fromTarget.copy(controls.target);
    camAnim.toTarget.set(...v.target);
    camAnim.fromFov = camera.fov;
    camAnim.toFov = v.fov;
    camAnim.t = 0;
    camAnim.active = true;
  }

  function setLighting(presetId, instant = false) {
    if (!LIGHTING_PRESETS[presetId]) return;
    env.setPreset(presetId, instant);
    document.querySelectorAll('.pill[data-preset]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.preset === presetId);
    });
    // Slightly boost bloom at night so warm lanterns sing
    bloomPass.strength = presetId === 'night' ? 0.42 : presetId === 'dusk' ? 0.34 : 0.24;
  }

  function triggerBell() {
    bellPulse = 1.0;
    sound.strikeBronzeBell();
  }

  // Bind UI Controls
  document.querySelectorAll('.pill[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => setLighting(btn.dataset.preset, false));
  });

  document.querySelectorAll('.cam-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view, false));
  });

  xrayBtn?.addEventListener('click', () => {
    const next = xrayTarget < 0.5;
    setXRay(next, true);
  });

  document.getElementById('btn-bell')?.addEventListener('click', triggerBell);

  const audioBtn = document.getElementById('btn-audio');
  audioBtn?.addEventListener('click', () => {
    const on = sound.toggle();
    audioBtn.classList.toggle('active', on);
    audioBtn.textContent = on ? '止风' : '听风';
  });

  const noteDrawer = document.getElementById('note-drawer');
  const noteBtn = document.getElementById('btn-note');
  noteBtn?.addEventListener('click', () => {
    const isHidden = noteDrawer.classList.toggle('hidden');
    noteBtn.classList.toggle('active', !isHidden);
  });
  document.getElementById('btn-close-note')?.addEventListener('click', () => {
    noteDrawer.classList.add('hidden');
    noteBtn?.classList.remove('active');
  });

  // High-Resolution 3200px Clean Artwork Poster Download
  document.getElementById('btn-shot')?.addEventListener('click', () => {
    const w = 3200;
    const h = Math.round((3200 * window.innerHeight) / Math.max(1, window.innerWidth));
    const prevPR = renderer.getPixelRatio();
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.render();

    renderer.domElement.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `悬空千仞-XUANKONG491-${currentViewId}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      renderer.setPixelRatio(prevPR);
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }, 'image/png');
  });

  // 1:1 Full-Resolution MagicaVoxel (.vox) Download
  document.getElementById('btn-download-vox')?.addEventListener('click', () => {
    const { bytes } = buildVoxBinary(world.grid, 1);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '悬空千仞-XUANKONG-491.vox';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });

  // Double-click on the Bell Tower in 3D scene also rings the ancient bronze bell!
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  renderer.domElement.addEventListener('dblclick', (ev) => {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(voxelRoot.children, false);
    if (hits.length > 0) {
      const p = hits[0].point;
      // If clicked near Bell Tower (z ~ -12.5, y ~ 25), ring bell! Otherwise smoothly focus camera target!
      if (p.distanceTo(new THREE.Vector3(3.25, 25.0, -12.5)) < 4.5) {
        triggerBell();
      } else {
        camAnim.fromPos.copy(camera.position);
        const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(18.0);
        camAnim.toPos.copy(p).add(offset);
        camAnim.fromTarget.copy(controls.target);
        camAnim.toTarget.copy(p);
        camAnim.fromFov = camera.fov;
        camAnim.toFov = 38;
        camAnim.t = 0;
        camAnim.active = true;
      }
    }
  });

  // Keyboard Shortcuts
  const viewKeys = Object.keys(CAMERA_VIEWS);
  const lightKeys = Object.keys(LIGHTING_PRESETS);
  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k >= '1' && k <= '7') {
      const idx = parseInt(k, 10) - 1;
      if (viewKeys[idx]) setView(viewKeys[idx], false);
    } else if (k === 'x') {
      setXRay(xrayTarget < 0.5, true);
    } else if (k === 'b') {
      triggerBell();
    } else if (k === 'm') {
      audioBtn?.click();
    } else if (k === 't') {
      const cur = env.getCurrentPreset();
      const next = lightKeys[(lightKeys.indexOf(cur) + 1) % lightKeys.length];
      setLighting(next, false);
    } else if (k === 'h') {
      document.body.classList.toggle('ui-hidden');
    } else if (k === 'i') {
      noteBtn?.click();
    } else if (k === 'escape') {
      noteDrawer?.classList.add('hidden');
      noteBtn?.classList.remove('active');
    }
  });

  // Resize Handling
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });

  // Render Loop & FPS Telemetry
  let lastTime = performance.now();
  let elapsed = 0;
  let fpsFrames = 0;
  let fpsAccum = 0;
  let measuredFps = 60;

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    fpsFrames++;
    fpsAccum += dt;
    if (fpsAccum >= 0.5) {
      measuredFps = Math.round(fpsFrames / fpsAccum);
      fpsFrames = 0;
      fpsAccum = 0;
    }

    if (!frozen) {
      elapsed += dt;
      sharedUniforms.uTime.value = elapsed;
    }

    // Smooth X-Ray transition
    sharedUniforms.uXRayMix.value += (xrayTarget - sharedUniforms.uXRayMix.value) * Math.min(1, dt * 6.0);

    // Acoustic Bell Ripple decay
    if (bellPulse > 0.001) {
      bellPulse = Math.max(0, bellPulse - dt * 0.42);
      sharedUniforms.uBellPulse.value = bellPulse;
    } else {
      sharedUniforms.uBellPulse.value = 0;
    }

    // Camera preset smooth tween
    if (camAnim.active) {
      camAnim.t += dt / camAnim.duration;
      const u = easeInOutCubic(Math.min(1, camAnim.t));
      camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, u);
      controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, u);
      camera.fov = camAnim.fromFov + (camAnim.toFov - camAnim.fromFov) * u;
      camera.updateProjectionMatrix();
      if (camAnim.t >= 1) camAnim.active = false;
    }

    controls.update();
    env.update(dt, elapsed, renderer, frozen);
    composer.render();
  }

  requestAnimationFrame(animate);

  // Fade out loading screen once first frame renders
  requestAnimationFrame(() => {
    loaderEl?.classList.add('fade-out');
    setTimeout(() => loaderEl?.remove(), 650);
  });

  // Expose deterministic inspection & screenshot automation API (`window.XK`)
  window.XK = {
    ready: true,
    setView: (id, instant = true) => setView(id, instant),
    setLighting: (id, instant = true) => setLighting(id, instant),
    setXRay: (on) => {
      setXRay(on, true);
      sharedUniforms.uXRayMix.value = on ? 1.0 : 0.0;
    },
    strikeBell: () => {
      bellPulse = 0.65;
      sharedUniforms.uBellPulse.value = 0.65;
    },
    hideUI: (hide) => document.body.classList.toggle('ui-hidden', Boolean(hide)),
    freeze: (f) => {
      frozen = Boolean(f);
    },
    setCustomCamera: (pos, target, fov = 40) => {
      camAnim.active = false;
      camera.position.set(...pos);
      controls.target.set(...target);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      controls.update();
    },
    auditScreenGrid: (cols = 32, rows = 20) => {
      // Raycasts a cols x rows grid across the viewport and reports semantic group hit percentages & bounding box of Temple!
      const counts = { sky: 0, cliffOuter: 0, cliffCore: 0, mechanics: 0, architecture: 0, lanterns: 0, nature: 0, waterOrPlinth: 0 };
      let archMinX = 1, archMaxX = 0, archMinY = 1, archMaxY = 0, archHits = 0;
      const allTargets = [...voxelRoot.children, ...env.group.children.filter(c => c.isMesh)];
      const rc = new THREE.Raycaster();
      const pt = new THREE.Vector2();
      const xrayOn = sharedUniforms.uXRayMix.value > 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = (c + 0.5) / cols;
          const v = (r + 0.5) / rows;
          pt.set(u * 2 - 1, (1 - v) * 2 - 1);
          rc.setFromCamera(pt, camera);
          const hits = rc.intersectObjects(allTargets, false);
          // Filter out sky dome (radius ~260) and ghosted cliffOuter when xrayOn!
          let chosen = null;
          for (const h of hits) {
            if (h.distance > 220) continue; // sky sphere
            if (xrayOn && h.object === groupMeshes[GROUPS.CLIFF_OUTER]) {
              const wp = h.point;
              if (wp.y > 16 && wp.y < 43 && wp.z > -19 && wp.z < 19 && wp.x > -6) continue;
            }
            chosen = h;
            break;
          }
          if (!chosen) {
            counts.sky++;
          } else if (chosen.object === groupMeshes[GROUPS.CLIFF_OUTER]) {
            counts.cliffOuter++;
          } else if (chosen.object === groupMeshes[GROUPS.CLIFF_CORE]) {
            counts.cliffCore++;
          } else if (chosen.object === groupMeshes[GROUPS.BEAMS_MECHANICS]) {
            counts.mechanics++;
            archHits++;
            archMinX = Math.min(archMinX, u); archMaxX = Math.max(archMaxX, u);
            archMinY = Math.min(archMinY, v); archMaxY = Math.max(archMaxY, v);
          } else if (chosen.object === groupMeshes[GROUPS.ARCHITECTURE]) {
            counts.architecture++;
            archHits++;
            archMinX = Math.min(archMinX, u); archMaxX = Math.max(archMaxX, u);
            archMinY = Math.min(archMinY, v); archMaxY = Math.max(archMaxY, v);
          } else if (chosen.object === groupMeshes[GROUPS.LANTERNS]) {
            counts.lanterns++;
            archHits++;
          } else if (chosen.object === groupMeshes[GROUPS.NATURE]) {
            counts.nature++;
          } else {
            counts.waterOrPlinth++;
          }
        }
      }
      const total = cols * rows;
      const pct = {};
      for (const [k, val] of Object.entries(counts)) pct[k] = Number(((val / total) * 100).toFixed(1));
      return {
        pct,
        templeScreenBox: archHits > 0 ? {
          left: Number(archMinX.toFixed(2)),
          right: Number(archMaxX.toFixed(2)),
          top: Number(archMinY.toFixed(2)),
          bottom: Number(archMaxY.toFixed(2)),
        } : null,
      };
    },
    stats: () => ({
      fps: measuredFps,
      voxelSizeMeters: VOXEL_SIZE,
      ...world.stats,
      drawCalls: renderer.info.render.calls,
      renderedTriangles: renderer.info.render.triangles,
      currentView: currentViewId,
      currentLighting: env.getCurrentPreset(),
      xray: sharedUniforms.uXRayMix.value,
    }),
  };
}

init().catch((err) => {
  console.error('XUANKONG 491 initialization failed:', err);
  const st = document.getElementById('loader-status');
  if (st) st.textContent = `加载异常：${err.message}`;
});
