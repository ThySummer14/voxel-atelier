import {
  AdditiveBlending, BoxGeometry, Color, DirectionalLight, FogExp2, Group, HalfFloatType, HemisphereLight,
  InstancedMesh, LinearFilter, Mesh, MeshBasicMaterial, MeshLambertMaterial, NoToneMapping,
  Object3D, PCFShadowMap, PerspectiveCamera, Plane, PlaneGeometry, Scene, ShaderMaterial, SpotLight, UnsignedByteType, Vector3,
  WebGLRenderer, WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { blendMood, makeAtmosphere, moodFor } from './atmosphere.mjs';
import { BRIDGE } from './landscape.mjs';
import { choreography, makeWorld, OPENING_TIME, VIEWS } from './world.mjs';

const unit = new BoxGeometry(1, 1, 1);
const boxMatrix = new Object3D();
const scratchColor = new Color();
const accent = new Color('#c4b8a6');
const minimum = new Vector3();
const maximum = new Vector3();


const haloUnit = new PlaneGeometry(1, 1);
const haloVertex = `
varying vec2 local;
varying vec3 paint;
void main() {
  local = uv * 2.0 - 1.0;
  vec4 center = modelViewMatrix * instanceMatrix * vec4(0, 0, 0, 1);
  // Screen-facing diffusion centred on the fixture, never painted over an opaque object.
  center.xy += position.xy * vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
  paint = instanceColor;
  gl_Position = projectionMatrix * center;
}
`;
const haloFragment = `
uniform float lampPower;
varying vec2 local;
varying vec3 paint;
void main() {
  float r = length(local);
  float center = exp(-r * r * 34.0);
  float lens = exp(-r * r * 4.3) * (1.0 - smoothstep(.35, 1.0, r));
  gl_FragColor = vec4(paint, min(.84, (center * .58 + lens * .19) * lampPower));
  #include <colorspace_fragment>
}
`;

function halos(group, fixtures, glowPaint) {
  const emitters = fixtures.filter(box => box.glow >= .73 && (box.w >= .29 || box.d >= .29));
  if (!emitters.length) return;
  const mesh = new InstancedMesh(haloUnit, glowPaint, emitters.length);
  for (let index = 0; index < emitters.length; index++) {
    const { x, y, z, w, h, d, color, glow } = emitters[index];
    boxMatrix.position.set(x + w / 2, y + h / 2, z + d / 2);
    const size = 1.7 + 1.9 * Math.min(1.3, Math.max(w, h, d)) * glow;
    boxMatrix.scale.set(size * 1.10, size, 1);
    boxMatrix.updateMatrix();
    mesh.setMatrixAt(index, boxMatrix.matrix);
    mesh.setColorAt(index, scratchColor.set(color));
  }
  mesh.computeBoundingSphere();
  group.add(mesh);
}


function batches(part, material, fixtureMaterial, castsShadow, glowPaint) {
  const group = new Group();
  for (const [list, paint, luminous] of [
    [part.solids, material, false], [part.lights, fixtureMaterial, true],
  ]) {
    if (!list.length) continue;
    const mesh = new InstancedMesh(unit, paint, list.length);
    const colorCache = new Map();
    for (let index = 0; index < list.length; index++) {
      const { x, y, z, w, h, d, color, glow } = list[index];
      const key = luminous ? color + glow : color;
      if (!colorCache.has(key)) {
        scratchColor.set(color);
        if (luminous) scratchColor.lerp(accent, .075).multiplyScalar(glow * 1.34 + .24);
        colorCache.set(key, scratchColor.clone());
      }
      boxMatrix.position.set(x + w * .5, y + h * .5, z + d * .5);
      boxMatrix.scale.set(w, h, d);
      boxMatrix.updateMatrix();
      mesh.setMatrixAt(index, boxMatrix.matrix);
      mesh.setColorAt(index, colorCache.get(key));
    }
    mesh.computeBoundingSphere();
    mesh.castShadow = castsShadow && !luminous;
    mesh.receiveShadow = !luminous;
    group.add(mesh);
  }
  if (glowPaint) halos(group, part.lights, glowPaint);
  return group;
}

function applyPose(group, { x, y, z, yaw = 0 }) {
  group.position.set(x, y, z);
  group.rotation.y = yaw;
}

const ease = (t) => t * t * (3 - 2 * t);

function cameraPose(id, ratio) {
  const pose = VIEWS[id];
  const portrait = Math.max(0, Math.min(1, (1.37 - ratio) / .55));
  return {
    target: new Vector3(...pose.target).lerp(new Vector3(...pose.mobileTarget), portrait),
    eye: new Vector3(...pose.eye).lerp(new Vector3(...pose.mobileEye), portrait),
    fov: pose.fov + portrait * 11,
  };
}

export function createViewer(frame, {
  view = 'harbor', light = 'blue', startTime = OPENING_TIME, startPaused = false, reduced = false, plate = false,
} = {}) {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', '潮线交班三维场景。用方向键转动，使用加减键缩放。');
  renderer.domElement.className = 'harbor-canvas';
  frame.append(renderer.domElement);

  const scene = new Scene();
  scene.fog = new FogExp2('#7c8b9e', .00174);
  const camera = new PerspectiveCamera(34, 1, .46, 2950);
  const mirrorCamera = new PerspectiveCamera();
  const lookTarget = new Vector3();
  const mirrorPlane = [new Plane(new Vector3(0, 1, 0), -.015)];
  const reflection = new WebGLRenderTarget(2, 2, {
    depthBuffer: true, stencilBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter,
    type: renderer.extensions.has('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType,
  });

  const hemi = new HemisphereLight('#a6bdd9', '#746875', 1.3);
  const key = new DirectionalLight('#ffd4a4', 1.2);
  key.position.set(-199, 192, 124);
  key.target.position.set(17, 0, -25);
  key.castShadow = true;
  const shadow = key.shadow;
  const shadowCamera = shadow.camera;
  shadowCamera.left = -285;
  shadowCamera.right = 285;
  shadowCamera.top = 252;
  shadowCamera.bottom = -231;
  shadowCamera.near = 12;
  shadowCamera.far = 690;
  shadowCamera.updateProjectionMatrix();
  const shadowTexture = window.matchMedia('(max-width: 700px)').matches ? 2048 : 4096;
  shadow.mapSize.set(shadowTexture, shadowTexture);
  shadow.radius = 1.5;
  shadow.bias = -.000094;
  shadow.normalBias = .14;
  const coastalFill = new DirectionalLight('#a8c7f2', .37);
  coastalFill.position.set(122, 136, -164);
  const pierLights = BRIDGE.towers.map(x => {
    const floodlight = new SpotLight('#a4d8f2', 0, 38, .48, .77, 1.08);
    floodlight.position.set(x - 2.9, 4.15, BRIDGE.z + 7.0);
    floodlight.target.position.set(x, 20, BRIDGE.z + 1.5);
    scene.add(floodlight, floodlight.target);
    return floodlight;
  });
  scene.add(key, key.target, hemi, coastalFill);

  const material = new MeshLambertMaterial({ color: '#ffffff' });
  const fixtureMaterial = new MeshBasicMaterial({ color: '#ffffff' });
  // Let near geometry hold its colours while the two ridgelines dissolve into sea haze.
  for (const paint of [material, fixtureMaterial]) {
    paint.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
        #ifdef USE_FOG
          float marineDepth = max(vFogDepth - 97.0, 0.0);
          float haze = 1.0 - exp(-fogDensity * fogDensity * marineDepth * marineDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, haze);
        #endif
      `);
    };
  }
  const glowPaint = new ShaderMaterial({
    uniforms: { lampPower: { value: 0 } },
    vertexShader: haloVertex, fragmentShader: haloFragment, transparent: true,
    depthWrite: false, blending: AdditiveBlending,
  });
  const world = makeWorld();
  for (const part of world.core) scene.add(batches(part, material, fixtureMaterial, true, glowPaint));
  scene.add(batches(world.background, material, fixtureMaterial, false));

  const parts = world.moving;
  const active = {};
  for (const name of ['trolley', 'spreader', 'suspended', 'lorry', 'tug', 'pilot']) {
    active[name] = batches(parts[name], material, fixtureMaterial, false, glowPaint);
    scene.add(active[name]);
  }
  active.traffic = Array.from({ length: 16 }, (_, index) => {
    const car = batches(parts.cars[(index + Math.floor(index / 3)) % parts.cars.length], material, fixtureMaterial, false);
    scene.add(car);
    return car;
  });

  const cablePaint = new MeshBasicMaterial({ color: '#9ea49a' });
  const cords = [];
  for (const x of [-.95, .95]) {
    for (const z of [-2.5, 2.5]) {
      const wire = new Mesh(unit, cablePaint);
      wire.scale.set(.115, 1, .115);
      scene.add(wire);
      cords.push({ wire, x, z });
    }
  }
  const atmosphere = makeAtmosphere(scene, world.pools, reflection.texture);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduced;
  controls.dampingFactor = .095;
  controls.rotateSpeed = .62;
  controls.panSpeed = .75;
  controls.zoomSpeed = .83;
  controls.minDistance = 31;
  controls.maxDistance = 740;
  controls.minPolarAngle = .13;
  controls.maxPolarAngle = Math.PI * .497;
  // A stable sea-level orbit, including when a trackpad pans down.
  controls.minTargetRadius = 0;
  controls.maxTargetRadius = 440;
  controls.cursor.set(0, 18, -16);

  let mood = moodFor(light);
  let grade = null;
  let move = null;
  let currentView = view;
  let currentTime = startTime;
  let lastFrame = 0;
  let lastMirror = -1000;
  let dirty = true;
  let mirrorDirty = true;
  let raf = 0;
  let playing = !startPaused && !reduced;
  let prefersReduced = reduced;
  let ready = false;
  let usingPreset = true;

  function lighting() {
    scene.fog.color.copy(mood.fog);
    scene.fog.density = mood.density;
    key.color.copy(mood.sun);
    key.intensity = mood.key;
    hemi.color.copy(mood.sky);
    hemi.groundColor.copy(mood.bounce);
    hemi.intensity = mood.fill;
    fixtureMaterial.color.setScalar(mood.lamps);
    glowPaint.uniforms.lampPower.value = Math.max(0, (mood.lamps - .42) * .67);
    coastalFill.intensity = .24 + mood.key * .13;
    for (const lamp of pierLights) lamp.intensity = Math.max(0, mood.lamps - .38) * 18.0;
    atmosphere.setMood(mood);
  }

  function animateWorld() {
    const poses = choreography(currentTime);
    const transfer = poses.transfer;
    active.trolley.position.set(transfer.x, transfer.railY, transfer.z);
    active.spreader.position.set(transfer.x, transfer.y + 2.76, transfer.z);
    active.suspended.position.set(transfer.x, transfer.y, transfer.z);
    const bottom = transfer.y + 3.00;
    const top = transfer.railY - .40;
    for (const { wire, x, z } of cords) {
      wire.position.set(transfer.x + x, (bottom + top) / 2, transfer.z + z);
      wire.scale.y = Math.max(.025, top - bottom);
    }
    for (const name of ['tug', 'pilot', 'lorry']) applyPose(active[name], poses[name]);
    for (let i = 0; i < active.traffic.length; i++) applyPose(active.traffic[i], poses.traffic[i]);
    atmosphere.updateWater(poses, currentTime);
  }

  function drawMirror(now) {
    mirrorCamera.copy(camera, false);
    const { x, y, z } = camera.position;
    mirrorCamera.position.set(x, .030 - y, z);
    const target = lookTarget.copy(controls.target);
    target.y = .030 - target.y;
    mirrorCamera.lookAt(target);
    mirrorCamera.updateMatrixWorld();
    atmosphere.setProjection(mirrorCamera, reflection.width, reflection.height);
    atmosphere.sea.visible = false;
    renderer.clippingPlanes = mirrorPlane;
    renderer.setRenderTarget(reflection);
    try {
      renderer.render(scene, mirrorCamera);
    } finally {
      renderer.setRenderTarget(null);
      renderer.clippingPlanes = [];
      atmosphere.sea.visible = true;
    }
    lastMirror = now;
    mirrorDirty = false;
  }

  function frameStep(now) {
    raf = 0;
    const elapsed = lastFrame === 0 ? 0 : Math.min(.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (playing && elapsed > 0) {
      currentTime += elapsed;
      animateWorld();
      dirty = true;
    }
    if (grade) {
      const t = Math.min(1, (now - grade.begin) / 950);
      blendMood(mood, grade.from, grade.to, ease(t));
      lighting();
      dirty = mirrorDirty = true;
      if (t >= 1) grade = null;
    }
    if (move) {
      const t = Math.min(1, (now - move.begin) / 1120);
      camera.position.lerpVectors(move.from.eye, move.to.eye, ease(t));
      controls.target.lerpVectors(move.from.target, move.to.target, ease(t));
      camera.fov = move.from.fov + (move.to.fov - move.from.fov) * ease(t);
      camera.updateProjectionMatrix();
      dirty = mirrorDirty = true;
      if (t >= 1) move = null;
    }
    const controlsMoving = controls.update();
    if (dirty || controlsMoving) {
      if (mirrorDirty || now - lastMirror > 69) drawMirror(now);
      renderer.render(scene, camera);
      dirty = false;
    }
    if (playing || move || grade || controlsMoving || dirty) requestFrame();
    else lastFrame = 0;
  }

  function requestFrame() {
    if (!raf) raf = requestAnimationFrame(frameStep);
  }

  function setView(id, animate = true) {
    currentView = id;
    usingPreset = true;
    const to = cameraPose(id, camera.aspect);
    if (prefersReduced || !animate || !ready) {
      move = null;
      camera.position.copy(to.eye);
      controls.target.copy(to.target);
      camera.fov = to.fov;
      camera.updateProjectionMatrix();
      controls.update();
      dirty = mirrorDirty = true;
    } else {
      move = {
        from: { eye: camera.position.clone(), target: controls.target.clone(), fov: camera.fov },
        to, begin: performance.now(),
      };
    }
    requestFrame();
  }

  function setLight(id) {
    const to = moodFor(id);
    if (prefersReduced) {
      grade = null;
      mood = to;
      lighting();
      dirty = mirrorDirty = true;
    } else {
      const from = moodFor(id);
      blendMood(from, mood, mood, 0);
      grade = { from, to, begin: performance.now() };
    }
    requestFrame();
  }

  function resolution(width, height) {
    if (plate) return Math.min(1, Math.sqrt(8_500_000 / (width * height)));
    return Math.min(window.devicePixelRatio || 1, 1.75, Math.sqrt(2_650_000 / (width * height)));
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = frame;
    if (!width || !height) return;
    const ratio = width / height;
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(resolution(width, height));
    renderer.setSize(width, height, false);
    const reflectionSize = Math.min(plate ? 1580 : 990, Math.max(440, Math.round(Math.max(width, height) * .66)));
    reflection.setSize(
      Math.max(1, Math.round(reflectionSize * Math.min(ratio, 1))),
      Math.max(1, Math.round(reflectionSize / Math.max(ratio, 1))),
    );
    if (usingPreset) setView(currentView, false);
    dirty = mirrorDirty = true;
    if (ready) requestFrame();
  }

  controls.addEventListener('start', () => {
    move = null;
    usingPreset = false;
  });
  controls.addEventListener('change', () => {
    minimum.set(-285, 1.4, -240);
    maximum.set(295, 136, 165);
    const previous = lookTarget.copy(controls.target);
    controls.target.clamp(minimum, maximum);
    camera.position.sub(previous.sub(controls.target));
    camera.position.y = Math.max(2.4, camera.position.y);
    dirty = mirrorDirty = true;
    requestFrame();
  });

  renderer.domElement.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) return;
    event.preventDefault();
    usingPreset = false;
    move = null;
    const vector = new Vector3().subVectors(camera.position, controls.target);
    const turn = event.key === 'ArrowLeft' ? -.095 : event.key === 'ArrowRight' ? .095 : 0;
    if (turn) vector.applyAxisAngle(new Vector3(0, 1, 0), turn);
    if (event.key === 'ArrowUp') vector.y += vector.length() * .06;
    if (event.key === 'ArrowDown') vector.y -= vector.length() * .06;
    if (event.key === '+' || event.key === '=') vector.multiplyScalar(.89);
    if (event.key === '-') vector.multiplyScalar(1.12);
    camera.position.copy(controls.target).add(vector);
    controls.update();
    dirty = mirrorDirty = true;
    requestFrame();
  });

  function togglePlaying(value) {
    playing = value;
    lastFrame = 0;
    requestFrame();
  }

  function capture() {
    // Capture the current composition at 2,560 pixels along its longest axis.
    const { clientWidth, clientHeight } = frame;
    const scale = 2560 / Math.max(clientWidth, clientHeight);
    const width = Math.round(clientWidth * scale);
    const height = Math.round(clientHeight * scale);
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
    return new Promise(resolve => {
      renderer.domElement.toBlob(resolve, 'image/png');
      renderer.setPixelRatio(resolution(clientWidth, clientHeight));
      renderer.setSize(clientWidth, clientHeight, false);
      renderer.render(scene, camera);
    });
  }

  lighting();
  animateWorld();
  resize();
  controls.update();
  drawMirror(performance.now());
  renderer.render(scene, camera);
  ready = true;
  new ResizeObserver(resize).observe(frame);
  if (playing) requestFrame();

  return {
    setView, setLight, togglePlaying, capture,
    setReduced(value) {
      prefersReduced = value;
      controls.enableDamping = !value;
    },
    canvas: renderer.domElement,
  };
}
