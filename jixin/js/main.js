import * as THREE from '../vendor/three.module.js';
import { buildScene } from './sculpt/parts.js';
import { buildMeshes } from './sculpt/mesh.js';
import { PARTS, pid, HS_STATES, GEARING, CX, CZ } from './sculpt/spec.js';
import { Movement, readout, POWER_START } from './kinematics.js';
import { EscapementSound } from './audio.js';

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ───────────────────────── 雕刻 → 网格 ─────────────────────────
const boot = (msg) => { const el = document.getElementById('boot-msg'); if (el) el.textContent = msg; };

boot('雕刻体素…');
const scene0 = buildScene();
boot('合并面片与烘焙光照…');
// 主网格下标 (CX,0,CZ) 对应世界原点 → 用 sx/sz 把整块平移回世界坐标
const sources = [{ v: scene0.v, sx: -CX, sy: 0, sz: -CZ }]
  .concat(scene0.hsStates.map((s) => ({ v: s.v, sx: s.sx, sy: s.sy, sz: s.sz })));
const built = buildMeshes(sources, PARTS);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(innerWidth, innerHeight);
renderer.autoClear = false;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const root = new THREE.Group();
scene.add(root);

const VERT = `
attribute vec3 color;
attribute vec3 night;
attribute vec3 mat;      // x=spec y=0 z=emis
varying vec3 vCol; varying vec3 vNight; varying vec3 vMat;
varying vec3 vN; varying vec3 vView; varying vec3 vW;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vCol = color; vNight = night; vMat = mat;
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FRAG = `
precision highp float;
varying vec3 vCol; varying vec3 vNight; varying vec3 vMat;
varying vec3 vN; varying vec3 vView; varying vec3 vW;
uniform float uLume;
uniform float uTime;
void main(){
  float f = 1.0 - clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
  f = pow(f, 3.0);
  vec3 base = mix(vCol, vNight, uLume);
  float spec = vMat.x, emis = vMat.z;
  // 实时菲涅尔冷光：金属边缘随视角呼吸
  vec3 rim = vec3(0.84, 0.90, 1.0) * f * spec * 0.30 * (1.0 - uLume);
  // 鎏金微闪：固定在世界坐标的相位，让金件在转动时有细碎星点
  float tw = pow(max(0.0, sin(vW.x*0.9 + vW.y*1.3 + vW.z*0.7 + uTime*1.6)), 70.0);
  rim += vec3(1.0, 0.93, 0.72) * tw * spec * 0.09 * (1.0 - uLume);
  vec3 c = base + rim + vec3(0.0, 0.16, 0.07) * emis * uLume;
  gl_FragColor = vec4(c, 1.0);
}`;

const uniforms = { uLume: { value: 0 }, uTime: { value: 0 } };
const material = new THREE.ShaderMaterial({
  vertexShader: VERT, fragmentShader: FRAG, uniforms, side: THREE.FrontSide,
});

const byKey = new Map();
const objects = [];
const geoStats = [];
for (const g of built.groups) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(g.positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(g.normals, 3, true));
  geo.setAttribute('color', new THREE.BufferAttribute(g.colors, 3, true));
  geo.setAttribute('night', new THREE.BufferAttribute(g.nights, 3, true));
  geo.setAttribute('mat', new THREE.BufferAttribute(g.specs, 3, true));
  geo.setIndex(new THREE.BufferAttribute(g.indices, 1));
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, material);
  const spec = PARTS[g.id];
  const pivot = spec.pivot;
  mesh.position.set(pivot[0], pivot[1], pivot[2]);
  mesh.userData = { key: spec.key, id: g.id, base: pivot.slice(), explode: spec.explode || [0, 0, 0], axis: spec.axis || 'y', name: spec.name };
  mesh.frustumCulled = false;
  objects.push(mesh);
  geoStats.push({ name: spec.name, id: g.id, tris: g.triangles, cells: scene0.v.count(g.id) });
  if (!byKey.has(spec.key)) byKey.set(spec.key, []);
  byKey.get(spec.key).push(mesh);
}
// 父子嵌套（笼框内的摆轮/擒纵/杠杆/游丝随笼框公转）
for (const o of objects) {
  const spec = PARTS[o.userData.id];
  if (!spec.parent) { root.add(o); continue; }
  const parents = byKey.get(spec.parent);
  const host = parents && parents[0];
  if (!host) { root.add(o); continue; }
  const hp = PARTS[pid(spec.parent)].pivot;
  o.position.set(spec.pivot[0] - hp[0], spec.pivot[1] - hp[1], spec.pivot[2] - hp[2]);
  host.add(o);
}
const hsMeshes = [];
for (let i = 0; i < HS_STATES; i++) {
  const list = byKey.get('hairspring' + i) || [];
  hsMeshes.push(list[0] || null);
  list.forEach((m) => { m.visible = false; });
}

// ───────────────────────── 非体素配角 ─────────────────────────
/** 表镜：蓝宝石玻璃，一道斜向反光缓慢扫过 */
const crystalMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uTime: uniforms.uTime, uOn: { value: 1 } },
  vertexShader: `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    precision mediump float; varying vec2 vU; uniform float uTime; uniform float uOn;
    void main(){
      vec2 p = vU*2.0-1.0;
      float r = length(p);
      if (r>1.0) discard;
      float edge = smoothstep(1.0,0.86,r);
      float sweep = exp(-pow((p.x*0.72 - p.y*0.69 - (sin(uTime*0.11)*1.25)) * 2.6, 2.0));
      float halo = pow(max(0.0, 1.0-abs(r-0.93)*7.0), 2.0);
      vec3 c = vec3(0.62,0.74,0.9)*sweep*0.20 + vec3(0.7,0.78,0.95)*halo*0.10;
      gl_FragColor = vec4(c*uOn, (sweep*0.18+halo*0.10+0.022)*edge*uOn);
    }`,
});
const crystal = new THREE.Mesh(new THREE.CircleGeometry(91, 72), crystalMat);
crystal.rotation.x = -Math.PI / 2;
crystal.position.set(0, 84, 0);
scene.add(crystal);

/** 接触阴影：表壳压在大漆上的软影 */
function radialTex(inner, outer, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, inner, 64, 64, outer);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshBasicMaterial({ map: radialTex(10, 64, [[0, 'rgba(0,0,0,0.72)'], [0.42, 'rgba(0,0,0,0.5)'], [0.72, 'rgba(0,0,0,0.12)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0, 34.4, 0);
scene.add(shadow);

/** 光柱里的浮尘 */
const MOTES = 520;
const moteGeo = new THREE.BufferGeometry();
const mp = new Float32Array(MOTES * 3);
const ms = new Float32Array(MOTES);
const msp = new Float32Array(MOTES);
for (let i = 0; i < MOTES; i++) {
  mp[i * 3] = (Math.random() - 0.5) * 300;
  mp[i * 3 + 1] = 30 + Math.random() * 190;
  mp[i * 3 + 2] = (Math.random() - 0.5) * 300;
  ms[i] = 0.6 + Math.random() * 2.4;
  msp[i] = Math.random() * TAU;
}
moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
moteGeo.setAttribute('size', new THREE.BufferAttribute(ms, 1));
const moteMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: uniforms.uTime, uLume: uniforms.uLume },
  vertexShader: `attribute float size; uniform float uTime; varying float vA;
    void main(){
      vec3 p = position;
      p.y += sin(uTime*0.12 + p.x*0.05)*6.0;
      p.x += cos(uTime*0.09 + p.z*0.04)*5.0;
      vec4 mv = modelViewMatrix*vec4(p,1.0);
      gl_PointSize = size * (150.0/ -mv.z);
      vA = 0.28 + 0.3*sin(uTime*0.7 + p.x*0.1);
      gl_Position = projectionMatrix*mv;
    }`,
  fragmentShader: `precision mediump float; varying float vA; uniform float uLume;
    void main(){
      float d = length(gl_PointCoord-0.5);
      float a = smoothstep(0.5,0.06,d)*vA*(1.0-uLume*0.85);
      gl_FragColor = vec4(vec3(1.0,0.94,0.84)*a, a);
    }`,
});
const motePoints = new THREE.Points(moteGeo, moteMat);
scene.add(motePoints);

// ───────────────────────── 相机 ─────────────────────────
const cam = {
  yaw: -32 * TAU / 180, pitch: 38 * TAU / 180, dist: 402,
  look: new THREE.Vector3(0, 58, 6),
  tYaw: -32 * TAU / 180, tPitch: 38 * TAU / 180, tDist: 402, tLook: new THREE.Vector3(0, 58, 6),
  fov: 31, spin: true,
};
const camera = new THREE.PerspectiveCamera(31, innerWidth / innerHeight, 1, 4000);
const loupeCam = new THREE.PerspectiveCamera(31, 1, 1, 4000);
function applyCam(c) {
  const sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  c.position.set(
    cam.look.x + cam.dist * cp * Math.sin(cam.yaw),
    cam.look.y + cam.dist * sp,
    cam.look.z + cam.dist * cp * Math.cos(cam.yaw)
  );
  c.up.set(0, 1, 0);
  c.lookAt(cam.look);
  c.fov = cam.fov;
  c.aspect = innerWidth / innerHeight;
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
}

// ───────────────────────── 放大镜 ─────────────────────────
const LOUPE_R = 168;
const loupeRT = new THREE.WebGLRenderTarget(LOUPE_R * 2, LOUPE_R * 2, {
  minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true,
});
loupeRT.texture.colorSpace = THREE.NoColorSpace;
const loupeScene = new THREE.Scene();
const loupeQuad = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uMap: { value: loupeRT.texture }, uAspect: { value: 1 }, uLume: uniforms.uLume },
    vertexShader: `varying vec2 vU; void main(){ vU=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
    fragmentShader: `precision mediump float; varying vec2 vU; uniform sampler2D uMap; uniform float uAspect; uniform float uLume;
      void main(){
        vec2 p = vU*2.0-1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float k = 0.965;                       // 边缘轻微枕形
        vec2 q = (p * (1.0 - k*r*r*0.06)) * 0.5 + 0.5;
        vec4 c = texture2D(uMap, q);
        c.rgb = c.rgb / (1.0 + c.rgb * 0.85);          // 近景软压高光
        c.rgb = pow(c.rgb, vec3(1.12));
        c.rgb *= 1.0 - 0.42 * pow(r, 3.0);             // 镜片边缘失光
        c.rgb += vec3(0.02, 0.03, 0.05) * pow(r, 2.0); // 玻璃冷调
        float rim = smoothstep(1.0, 0.955, r);
        float brass = smoothstep(1.0, 0.988, r) * (0.55 + 0.45 * sin((atan(p.y, p.x) + 0.9) * 2.0));
        float glint = exp(-pow((p.x*0.7-p.y*0.7-0.25)*3.0, 2.0)) * 0.10;
        c.rgb = c.rgb * (1.0 - smoothstep(0.985, 1.0, r)) + vec3(0.86, 0.66, 0.28) * brass * 1.15;
        c.a = max(rim, smoothstep(0.975, 0.995, r));
        gl_FragColor = c;
      }`,
  })
);
loupeScene.add(loupeQuad);
const loupe = { on: false, x: 0.5, y: 0.5, zoom: 3.4 };
const fullCam = new THREE.Camera();

// ───────────────────────── 交互 ─────────────────────────
const mv = new Movement();
const sound = new EscapementSound();
const state = {
  explode: 0, tExplode: 0,
  lume: 0, tLume: 0,
  hideUi: false, still: false,
  winding: 0, lastRatchet: 0,
  fps: 60, frames: 0, fpsT: performance.now(),
  started: performance.now(),
};

function setCamFromDrag(dx, dy) {
  cam.tYaw -= dx * 0.006;
  cam.tPitch = clamp(cam.tPitch + dy * 0.005, 0.03, 1.48);
}
let drag = null;
const el = renderer.domElement;
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId);
  const hit = hitCrown(e.clientX, e.clientY);
  drag = { x: e.clientX, y: e.clientY, crown: !!hit, moved: 0 };
  if (hit) ensureAudio();
});
el.addEventListener('pointermove', (e) => {
  loupe.x = e.clientX / innerWidth;
  loupe.y = e.clientY / innerHeight;
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  if (drag.crown) {
    const turns = -dy * 0.0042;
    mv.wind(turns);
    state.winding = Math.abs(mv.winding);
  } else setCamFromDrag(dx, dy);
});
addEventListener('pointerup', () => { drag = null; });
el.addEventListener('wheel', (e) => {
  e.preventDefault();
  cam.tDist = clamp(cam.tDist * (1 + Math.sign(e.deltaY) * 0.09), 70, 900);
}, { passive: false });

addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === ' ') { toggleLume(); e.preventDefault(); }
  else if (k === 'x') setExplode(state.tExplode > 0.5 ? 0 : 1);
  else if (k === 'l' || k === ' ') setLume(state.tLume > 0.5 ? 0 : 1);
  else if (k === 'm') toggleAudio();
  else if (k === 'c') setCrystal(!crystal.visible);
  else if (k === 'g') setLoupe(!loupe.on);
  else if (k === 'h') setHide(!state.hideUi);
  else if (k === 'r') { mv.setTime(Date.now() / 1000); mv.power = POWER_START; }
  else if (k === '1') setHack(true);
  else if (k === '0') setHack(false);
  else if (k === 'd') mv.drainDemo = mv.drainDemo ? 0 : 1200;
  else if (k === 'arrowup') mv.wind(0.25);
  else if (k === 'arrowdown') mv.wind(-0.25);
  else if (k === 'arrowleft') setTimeOffset(-30);
  else if (k === 'arrowright') setTimeOffset(30);
});

function ensureAudio() { if (sound.muted) sound.enable(); }
function toggleAudio() { if (sound.muted) { sound.enable(); } else { sound.mute(); } }
function setHack(b) { mv.hacked = !!b; }
function setExplode(v) { state.tExplode = clamp(v, 0, 1); }
function setLume(v) { state.tLume = clamp(v, 0, 1); }
function toggleLume() { setLume(state.tLume > 0.5 ? 0 : 1); }
function setCrystal(b) { crystal.visible = !!b; crystalMat.uniforms.uOn.value = b ? 1 : 0; }
function setLoupe(b) { loupe.on = !!b; }
function setHide(b) {
  state.hideUi = !!b;
  document.body.classList.toggle('hide-ui', !!b);
}
function setTimeOffset(sec) { mv.setTime(mv.displaySec + sec); }

const ray = new THREE.Raycaster();
function hitCrown(cx, cy) {
  ray.setFromCamera(new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1), camera);
  const list = (byKey.get('crown') || []).concat(byKey.get('onyx') || [], byKey.get('stem') || []);
  const h = ray.intersectObjects(list, false);
  return h.length ? h[0] : null;
}
function pick(cx, cy) {
  ray.setFromCamera(new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1), camera);
  const h = ray.intersectObjects(objects, false);
  if (!h.length) return null;
  const o = h[0].object;
  const wp = h[0].point.clone();   // three 的交点已是世界坐标
  return {
    part: PARTS[o.userData.id].name, key: o.userData.key,
    world: [+wp.x.toFixed(1), +wp.y.toFixed(1), +wp.z.toFixed(1)],
    grid: [Math.round(wp.x + CX), Math.round(wp.y), Math.round(wp.z + CZ)],
    dist: +h[0].distance.toFixed(1),
  };
}

// ───────────────────────── HUD ─────────────────────────
const hud = {
  time: document.getElementById('v-time'),
  amp: document.getElementById('v-amp'),
  power: document.getElementById('v-power'),
  beats: document.getElementById('v-beats'),
  bar: document.getElementById('bar-fill'),
  pulse: document.getElementById('pulse'),
  chip: document.getElementById('v-chip'),
  labels: document.getElementById('labels'),
};
const labelParts = ['cageFrame', 'balance', 'escapeWheel', 'barrel', 'ratchet', 'crownWheel',
  'centerWheel', 'thirdWheel', 'tourbillonBridge', 'dialRing', 'bezel', 'crown', 'mainPlate', 'pallet'];
const labelEls = labelParts.map((k) => {
  const d = document.createElement('span');
  d.className = 'lbl';
  d.textContent = PARTS[pid(k)].name;
  d.dataset.key = k;
  hud.labels.appendChild(d);
  return d;
});

// ───────────────────────── 主循环 ─────────────────────────
let last = performance.now();
let acc = { beats: 0 };

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = (now - state.started) / 1000;
  uniforms.uTime.value = t;

  // 阻尼与自转
  if (cam.spin && !state.still && !drag) cam.tYaw += dt * 0.026;
  cam.yaw += (cam.tYaw - cam.yaw) * Math.min(1, dt * 9);
  cam.pitch += (cam.tPitch - cam.pitch) * Math.min(1, dt * 9);
  cam.dist += (cam.tDist - cam.dist) * Math.min(1, dt * 8);
  applyCam(camera);

  mv.update(dt);
  state.explode += (state.tExplode - state.explode) * Math.min(1, dt * 6);
  state.lume += (state.tLume - state.lume) * Math.min(1, dt * 5);
  uniforms.uLume.value = state.lume;

  const pose = mv.pose();
  for (const o of objects) {
    const u = o.userData;
    const a = pose[u.key];
    if (u.axis === 'x') o.rotation.x = a || 0;
    else if (a !== undefined) o.rotation.y = a;
    const f = state.explode;
    if (f > 0.0005) {
      o.position.set(u.base[0] + u.explode[0] * f, u.base[1] + u.explode[1] * f, u.base[2] + u.explode[2] * f);
      if (PARTS[u.id].parent) {
        const hp = PARTS[pid(PARTS[u.id].parent)].pivot;
        o.position.set(u.base[0] - hp[0] + u.explode[0] * f, u.base[1] - hp[1] + u.explode[1] * f, u.base[2] - hp[2] + u.explode[2] * f);
      }
    } else {
      o.position.set(u.base[0], u.base[1], u.base[2]);
      if (PARTS[u.id].parent) {
        const hp = PARTS[pid(PARTS[u.id].parent)].pivot;
        o.position.set(u.base[0] - hp[0], u.base[1] - hp[1], u.base[2] - hp[2]);
      }
    }
  }
  const hs = mv.hsState();
  for (let i = 0; i < hsMeshes.length; i++) if (hsMeshes[i]) hsMeshes[i].visible = (i === hs);
  // 拆解时游丝只留一档，避免 15 个半透明螺旋叠在一起
  if (state.explode > 0.02 && hsMeshes[0]) {
    for (let i = 0; i < hsMeshes.length; i++) if (hsMeshes[i]) hsMeshes[i].visible = (i === 0);
  }

  // 声音：按拍调度
  const nb = mv.newBeats();
  if (nb > 0 && !sound.muted) {
    const amp = clamp(mv.ampDeg / 295, 0, 1);
    for (let i = 0; i < Math.min(nb, 3); i++) {
      sound.beat(sound.ctx.currentTime + i * 0.002, amp, (mv.beats - nb + i) % 2 === 1);
    }
    acc.beats += nb;
  }
  if (!sound.muted && Math.abs(mv.winding - state.lastRatchet) > 0.26) {
    state.lastRatchet = mv.winding;
    sound.ratchet(sound.ctx.currentTime, mv.power);
  }

  renderer.setRenderTarget(null);
  renderer.clear();
  if (loupe.on) {
    // 放大镜：以光标下的表面点为心，收窄视角再渲一遍
    ray.setFromCamera(new THREE.Vector2(loupe.x * 2 - 1, -loupe.y * 2 + 1), camera);
    const h = ray.intersectObjects(objects, false);
    const target = h.length ? h[0].point.clone() : cam.look.clone();
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const d = clamp(camera.position.distanceTo(target) / loupe.zoom, 20, 900);
    loupeCam.position.copy(target).addScaledVector(dir, d);
    loupeCam.up.set(0, 1, 0);
    loupeCam.lookAt(target);
    loupeCam.fov = camera.fov;
    loupeCam.aspect = 1;
    loupeCam.updateProjectionMatrix();
    loupeCam.updateMatrixWorld();
    // 放大镜里不要叠加浮尘与表镜反光：近景下加性光斑会把画面冲白
    const motesObj = motePoints, crystalOn = crystal.visible;
    motesObj.visible = false; crystal.visible = false;
    renderer.setRenderTarget(loupeRT);
    renderer.clear();
    renderer.render(scene, loupeCam);
    renderer.setRenderTarget(null);
    motesObj.visible = true; crystal.visible = crystalOn;
  }
  renderer.render(scene, camera);
  if (loupe.on) {
    const px = loupe.x * innerWidth, py = loupe.y * innerHeight;
    const d2 = LOUPE_R * 2 * Math.min(1, innerWidth / 900);
    const vx = px - d2 / 2, vy = innerHeight - py - d2 / 2;
    renderer.setViewport(vx, vy, d2, d2);
    renderer.setScissor(vx, vy, d2, d2);
    renderer.setScissorTest(true);
    renderer.render(loupeScene, fullCam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, innerWidth, innerHeight);
  }

  // HUD
  state.frames++;
  if (now - state.fpsT > 500) {
    state.fps = +(state.frames * 1000 / (now - state.fpsT)).toFixed(1);
    state.frames = 0; state.fpsT = now;
  }
  if (!state.hideUi && state.frames % 6 === 0) updateHud();
  requestAnimationFrame(frame);
}

function updateHud() {
  const ro = readout(mv.displaySec);
  hud.time.textContent = ro.text;
  hud.amp.textContent = mv.ampDeg.toFixed(0) + '°';
  hud.power.textContent = (mv.power * 100).toFixed(1) + '%';
  hud.beats.textContent = String(mv.beats);
  hud.bar.style.width = (mv.power * 100).toFixed(2) + '%';
  hud.chip.textContent = mv.hacked ? '停秒 · HACK' : (mv.running ? (mv.drainDemo ? '演示放条 ×1200' : '走时中') : '条尽 · 已停走');
  hud.pulse.style.opacity = (mv.running ? (0.25 + 0.75 * Math.abs(Math.cos(Math.PI * mv.beatPhase))) : 0.1).toFixed(2);
  hud.pulse.style.background = mv.running ? '#f0d68a' : '#5a5f66';
  const showLabels = state.explode > 0.35;
  for (const d of labelEls) {
    if (!showLabels) { d.style.display = 'none'; continue; }
    const list = byKey.get(d.dataset.key);
    if (!list || !list[0]) { d.style.display = 'none'; continue; }
    const o = list[0];
    const wp = new THREE.Vector3(o.userData.base[0] + o.userData.explode[0] * state.explode,
      o.userData.base[1] + o.userData.explode[1] * state.explode,
      o.userData.base[2] + o.userData.explode[2] * state.explode);
    if (o.parent !== root) o.parent.localToWorld(wp.fromArray([0, 0, 0]));
    const v = wp.project(camera);
    if (v.z > 1) { d.style.display = 'none'; continue; }
    d.style.display = 'block';
    d.style.left = ((v.x * 0.5 + 0.5) * innerWidth).toFixed(0) + 'px';
    d.style.top = ((-v.y * 0.5 + 0.5) * innerHeight).toFixed(0) + 'px';
  }
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

// ───────────────────────── 调试接口 ─────────────────────────
window.JX = {
  ready: true,
  stats() {
    return {
      filled: scene0.v.filled, faces: built.stats.faceCells, quads: built.stats.quads,
      triangles: built.groups.reduce((a, g) => a + g.triangles, 0), meshes: objects.length,
      drawCalls: renderer.info.render.calls, geoms: renderer.info.memory.geometries,
      perPart: geoStats, buildMs: scene0.ms, fps: state.fps,
    };
  },
  cam(o = {}) {
    if (o.yaw !== undefined) cam.tYaw = o.yaw * TAU / 180;
    if (o.pitch !== undefined) cam.tPitch = clamp(o.pitch * TAU / 180, 0.02, 1.5);
    if (o.dist !== undefined) cam.tDist = clamp(o.dist, 20, 1200);
    if (o.fov !== undefined) cam.fov = clamp(+o.fov, 4, 120);
    if (o.look) cam.look.set(o.look[0], o.look[1], o.look[2]);
    return { yaw: +(cam.tYaw * 180 / TAU).toFixed(2), pitch: +(cam.tPitch * 180 / TAU).toFixed(2), dist: +cam.tDist.toFixed(1), fov: cam.fov };
  },
  spin(b) { cam.spin = !!b; },
  still(b) { state.still = b === undefined ? true : !!b; cam.spin = !state.still; },
  time(sec) { if (sec === undefined) return mv.displaySec; mv.setTime(+sec); return mv.displaySec; },
  power(p) { if (p === undefined) return +mv.power.toFixed(4); mv.power = clamp(+p, 0, 1); return mv.power; },
  drain(n) { mv.drainDemo = +n || 0; return mv.drainDemo; },
  wind(turns) { mv.wind(+turns); state.winding = Math.abs(mv.winding); return { winding: +mv.winding.toFixed(3), power: +mv.power.toFixed(4), amp: +mv.ampDeg.toFixed(1) }; },
  hack(b) { setHack(b); return mv.hacked; },
  lume(v) { if (v === undefined) return +state.tLume; setLume(+v); return state.tLume; },
  explode(v) { if (v === undefined) return +state.tExplode; setExplode(+v); return state.tExplode; },
  loupe(o = {}) {
    if (o.on !== undefined) setLoupe(o.on);
    if (o.x !== undefined) loupe.x = +o.x;
    if (o.y !== undefined) loupe.y = +o.y;
    if (o.zoom !== undefined) loupe.zoom = clamp(+o.zoom, 1.2, 8);
    return { on: loupe.on, x: loupe.x, y: loupe.y, zoom: loupe.zoom };
  },
  crystal(b) { setCrystal(b); return crystal.visible; },
  sound(b) { if (b === undefined) return !sound.muted; if (b) ensureAudio(); else sound.mute(); return !sound.muted; },
  soundBeats() { return { scheduled: sound.scheduled, ratchets: sound.ratchets, ctx: sound.ctx ? sound.ctx.state : 'none' }; },
  stetho(b) { sound.stetho = !!b; return sound.stetho; },
  hide(b) { setHide(b); return state.hideUi; },
  pick(x, y) { return pick(x ?? loupe.x * innerWidth, y ?? loupe.y * innerHeight); },
  pose() { return mv.pose(); },
  /** 一次采样的全部可断言量 */
  probe() {
    const p = mv.pose();
    const r3 = (x) => +x.toFixed(5);
    const wrap = (a) => ((a % TAU) + TAU) % TAU;
    return {
      t: performance.now(), displaySec: mv.displaySec, realSec: Date.now() / 1000,
      beats: mv.beats, power: +mv.power.toFixed(5), amp: +mv.ampDeg.toFixed(2),
      running: mv.running, hacked: mv.hacked, hsState: mv.hsState(),
      angles: {
        cage: r3(wrap(p.cageFrame)), fourth: r3(wrap(p.fourthWheel)), third: r3(wrap(p.thirdWheel)),
        center: r3(wrap(p.centerWheel)), barrel: r3(wrap(p.barrel)), escape: r3(wrap(p.escapeWheel)),
        minute: r3(wrap(p.handMinute)), hour: r3(wrap(p.handHour)), balance: r3(wrap(p.balance)),
        pallet: r3(wrap(p.pallet)), pr: r3(wrap(p.handPR)), crown: r3(wrap(p.crown)),
      },
      fps: state.fps,
      gearing: GEARING,
    };
  },
  parts() { return PARTS.map((p, i) => ({ i, key: p.key, name: p.name, cells: scene0.v.count(i) })); },
  _mv: mv, _gl: renderer, _scene: scene, _root: root, _cam: camera, _objects: objects,
};

boot('就绪');
requestAnimationFrame((t) => { last = t; frame(t); });
document.getElementById('boot').style.display = 'none';
