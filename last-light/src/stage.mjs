import * as T from '../vendor/three.module.min.js';
import { meshVolume } from './mesh.mjs';
import { buildWorld } from './world.mjs';

export const shots = {
  overview: { target: [0, 5, -1], yaw: .64, pitch: .48, span: 185 },
  lander: { target: [-26, 33, -11], yaw: .66, pitch: .24, span: 99 },
  rover: { target: [42, 13, 16], yaw: .55, pitch: .24, span: 43 },
  surface: { target: [-9, 28, -5], yaw: .44, pitch: -.008, span: 128, field: true },
};

const lighting = {
  sun: { position: [-132, 94, 146], power: 2.9, tint: '#ffe4c9', fill: 1.04, rim: .44 },
  rim: { position: [-109, 64, -148], power: 3.17, tint: '#ffd0a2', fill: .85, rim: .46 },
};

function background() {
  const m = new T.ShaderMaterial({
    depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { surface: { value: 0 }, aspect: { value: 1.6 } },
    vertexShader: 'varying vec2 point; void main(){ point=uv; gl_Position=vec4(position.xy,0.9999,1.0); }',
    fragmentShader: `
      varying vec2 point;
      uniform float surface;
      uniform float aspect;
      void main(){
        vec2 p = (point-vec2(.49,.52))*vec2(max(aspect,1.0)*.79,1.15);
        float pool = exp(-4.6*dot(p,p));
        float v = mix(.024,.126,pool);
        float grain = fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
        vec3 dark = vec3(v*.94,v*1.10,v*1.43);
        vec3 sky = vec3(.012,.016,.025)+vec3(.013,.015,.020)*(1.0-point.y);
        gl_FragColor=vec4(mix(dark,sky,surface)+(grain-.5)*.009,1.0);
      }
    `,
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), m);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;
  return mesh;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createStage(host, { onMotion, onFrame } = {}) {
  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new T.Scene();
  const backdrop = background();
  scene.add(backdrop);
  const ambient = new T.HemisphereLight('#dae3ff', '#80738b', .85);
  scene.add(ambient);
  const sun = new T.DirectionalLight('#ffdeb5', 2.5);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -147, right: 147, top: 140, bottom: -140, near: 20, far: 410 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.normalBias = .39;
  sun.shadow.bias = -.00024;
  sun.target.position.set(0, 4, 0);
  scene.add(sun, sun.target);
  const rim = new T.DirectionalLight('#9fb9ec', .25);
  rim.position.set(124, 46, -22);
  scene.add(rim);

  const model = meshVolume(buildWorld().scene);
  model.castShadow = model.receiveShadow = true;
  scene.add(model);
  host.appendChild(renderer.domElement);

  const camera = new T.PerspectiveCamera(36, 1, .8, 2450);
  const state = { ...shots.overview, target: new T.Vector3(...shots.overview.target) };
  let view = 'overview', light = 'sun', transition, landscape, planet, loadingField;
  let aspect = 1.5, pending = 0, spinning = false, last = 0;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motion.matches;

  function place() {
    // Fit a desktop specimen in narrow windows without shrinking wider views.
    const fit = state.span * Math.max(1, (state.field ? 1.5 : 1.48) / aspect);
    const d = fit / (2 * Math.tan(camera.fov * Math.PI / 360));
    const r = Math.cos(state.pitch) * d;
    camera.position.set(
      state.target.x + Math.sin(state.yaw) * r,
      state.target.y + Math.sin(state.pitch) * d,
      state.target.z + Math.cos(state.yaw) * r,
    );
    camera.lookAt(state.target);
  }

  function draw() {
    place();
    renderer.render(scene, camera);
    onFrame?.();
  }

  function tick(time) {
    pending = 0;
    if (transition) {
      const t = clamp((time - transition.time) / 580, 0, 1);
      const e = 1 - (1 - t) ** 3;
      const { from, to } = transition;
      for (const key of ['yaw', 'pitch', 'span']) state[key] = T.MathUtils.lerp(from[key], to[key], e);
      state.target.lerpVectors(from.target, to.target, e);
      if (t === 1) transition = null;
    } else if (spinning) {
      state.yaw += Math.min(40, time - last) * .00022;
    }
    last = time;
    draw();
    if (transition || spinning) invalidate();
  }

  function invalidate() {
    if (!pending) pending = requestAnimationFrame(tick);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    backdrop.material.uniforms.aspect.value = aspect;
    renderer.setSize(w, h, false);
    invalidate();
  }

  function setLight(name) {
    const preset = lighting[name];
    light = name;
    sun.position.set(...preset.position);
    sun.color.set(preset.tint);
    sun.intensity = preset.power;
    ambient.intensity = preset.fill;
    rim.intensity = preset.rim;
    renderer.shadowMap.needsUpdate = true;
    invalidate();
  }

  async function prepareField() {
    loadingField ??= import('./horizon.mjs').then(({ buildHorizon, buildEarth }) => {
      landscape = buildHorizon();
      planet = buildEarth();
      landscape.visible = planet.visible = false;
      scene.add(landscape, planet);
    }).catch(error => {
      loadingField = undefined;
      throw error;
    });
    await loadingField;
  }

  let requestId = 0;
  async function setView(name, instant = false) {
    const request = ++requestId;
    const shot = shots[name];
    if (shot.field) await prepareField();
    if (request !== requestId) return false;
    setSpin(false);
    view = name;
    const field = Boolean(shot.field);
    const modeChanged = Boolean(state.field) !== field;
    state.field = field;
    if (landscape) landscape.visible = planet.visible = field;
    backdrop.material.uniforms.surface.value = Number(field);
    scene.fog = field ? new T.Fog('#20212b', 315, 960) : null;
    const target = new T.Vector3(...shot.target);
    if (instant || reduced() || modeChanged) {
      Object.assign(state, shot, { target });
      transition = null;
    } else {
      const delta = Math.atan2(Math.sin(shot.yaw - state.yaw), Math.cos(shot.yaw - state.yaw));
      transition = {
        from: { ...state, target: state.target.clone() },
        to: { ...shot, yaw: state.yaw + delta, target },
        time: performance.now(),
      };
    }
    invalidate();
    return true;
  }

  function setSpin(value) {
    spinning = value;
    last = performance.now();
    onMotion?.(spinning);
    if (value) invalidate();
  }

  function orbit(dx, dy) {
    transition = null;
    setSpin(false);
    state.yaw -= dx;
    state.pitch = clamp(state.pitch + dy, state.field ? -.16 : -.06, state.field ? .65 : 1.34);
    invalidate();
  }

  function zoom(factor) {
    transition = null;
    state.span = clamp(state.span * factor, 19, 350);
    invalidate();
  }

  function capture(width = 1800, height = 1250) {
    const oldRatio = renderer.getPixelRatio();
    const oldSize = renderer.getSize(new T.Vector2());
    const oldAspect = aspect;
    aspect = camera.aspect = width / height;
    backdrop.material.uniforms.aspect.value = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    draw();
    const png = renderer.domElement.toDataURL('image/png');
    aspect = camera.aspect = oldAspect;
    backdrop.material.uniforms.aspect.value = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(oldRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    draw();
    return png;
  }

  new ResizeObserver(resize).observe(host);
  setLight('sun');
  resize();
  return { setView, setLight, setSpin, orbit, zoom, capture, get view() { return view; }, get light() { return light; } };
}
