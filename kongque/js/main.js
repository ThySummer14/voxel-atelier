import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (s) => document.querySelector(s);
const loader = $('#loader'), loaderFill = $('#loaderFill'), loaderNote = $('#loaderNote');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const setProgress = (p, note) => { loaderFill.style.width = (p * 100).toFixed(0) + '%'; if (note) loaderNote.textContent = note; };

/* ---------------- data ---------------- */
async function loadData() {
  setProgress(0.1, '读取调色板…');
  const palette = await (await fetch('./js/palette.json')).json();
  const stats = await (await fetch('./js/stats.json')).json();
  setProgress(0.3, '读取体素…');
  const buf = await (await fetch('./js/voxels.bin')).arrayBuffer();
  const dv = new DataView(buf);
  let off = 0;
  const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4)); off = 4;
  if (magic !== 'KQV1') throw new Error('bad magic ' + magic);
  const n = dv.getUint32(off, true); off += 4;
  off += 6; // dims
  off += 6; // origin
  const pos = new Int16Array(buf, off, n * 3); off += n * 6;
  const pal = new Uint8Array(buf, off, n); off += n;
  const ao = new Uint8Array(buf, off, n); off += n;
  const mat = new Uint8Array(buf, off, n); off += n;
  const seed = new Uint8Array(buf, off, n); off += n;
  setProgress(0.6, '装配实例…');
  return { palette, stats, n, pos, pal, ao, mat, seed };
}

/* ---------------- renderer / scene ---------------- */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 1, 4000);
camera.position.set(300, 175, 430);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// dusk gradient sky
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(1600, 32, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#081c26') }, mid: { value: new THREE.Color('#15403f') }, bot: { value: new THREE.Color('#20180f') } },
    vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
      void main(){ float h=normalize(vP).y; vec3 c=mix(bot,mid,smoothstep(-0.05,0.22,h)); c=mix(c,top,smoothstep(0.22,0.75,h));
        c += vec3(0.55,0.32,0.12)*exp(-pow((h-0.03)*7.0,2.0))*0.5; gl_FragColor=vec4(c,1.0); }`
  })
);
scene.add(sky);
scene.fog = new THREE.FogExp2(0x241c12, 0.0011);

// lights
scene.add(new THREE.HemisphereLight(0xcfe0d8, 0x3a2a18, 0.28));
const key = new THREE.DirectionalLight(0xffe6b8, 1.7);
key.position.set(-260, 420, 320);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -320; key.shadow.camera.right = 320;
key.shadow.camera.top = 340; key.shadow.camera.bottom = -80;
key.shadow.camera.near = 50; key.shadow.camera.far = 1200;
key.shadow.bias = -0.0006; key.shadow.normalBias = 1.5;
scene.add(key);
const fill = new THREE.DirectionalLight(0x9fd0e8, 0.45); fill.position.set(320, 160, -180); scene.add(fill);
const rim = new THREE.DirectionalLight(0x9fd8c0, 0.5); rim.position.set(0, 220, -420); scene.add(rim);

// dusk ground plane (receives shadow, fades into fog at horizon)
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1500, 64),
  new THREE.MeshStandardMaterial({ color: 0x2f3d26, roughness: 1.0, metalness: 0.0 })
);
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.05; floor.receiveShadow = true;
scene.add(floor);

/* ---------------- iridescent voxel material ---------------- */
const shaders = [];
function makeMaterial() {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.22, envMapIntensity: 0.3 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = { value: 0 };
    sh.uniforms.uIrid = { value: 1 };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aAO; attribute float aMat; attribute float aSeed; attribute float aEmis;
        varying float vAO; varying float vMat; varying float vSeed; varying float vEmis;
        varying vec3 vWPos; varying vec3 vWNormal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vAO=aAO; vMat=aMat; vSeed=aSeed; vEmis=aEmis;
        #ifdef USE_INSTANCING
          vWPos=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;
        #else
          vWPos=(modelMatrix*vec4(transformed,1.0)).xyz;
        #endif`)
      .replace('#include <defaultnormal_vertex>', `#include <defaultnormal_vertex>
        vWNormal=normalize(mat3(modelMatrix)*objectNormal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying float vAO; varying float vMat; varying float vSeed; varying float vEmis;
        varying vec3 vWPos; varying vec3 vWNormal;
        uniform float uTime; uniform float uIrid;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        {
          diffuseColor.rgb *= mix(0.5, 1.0, vAO);
          vec3 V = normalize(cameraPosition - vWPos);
          vec3 N = normalize(vWNormal);
          float fres = pow(1.0 - abs(dot(N, V)), 2.0);
          float ang = fres*2.0 + vSeed*0.35 + uTime*0.22;
          float u = 0.5 + 0.5*sin(ang*0.8);
          vec3 rainbow = mix(vec3(0.05,0.35,0.75), vec3(0.10,0.80,0.50), smoothstep(0.0,0.5,u));
          rainbow = mix(rainbow, vec3(0.85,0.65,0.20), smoothstep(0.5,1.0,u));
          vec3 goldsheen = mix(vec3(0.72,0.52,0.18), vec3(1.0,0.92,0.55), fres);
          float isMetal = step(1.5, vMat);
          vec3 irid = mix(rainbow, goldsheen, isMetal);
          float amt = mix(vMat, (vMat-1.0)*0.7, isMetal) * fres * uIrid;
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*0.35 + irid*0.75, clamp(amt,0.0,0.85));
        }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * vEmis * (0.7 + 0.3*sin(uTime*1.5 + vSeed*6.28318));`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = mix(0.92, mix(0.52, 0.34, step(1.5, vMat)), step(0.5, vMat));`)
      .replace('#include <metalnessmap_fragment>', `float metalnessFactor = mix(0.0, 0.30, step(0.5, vMat));`);
    shaders.push(sh);
  };
  return m;
}

/* ---------------- build instanced meshes ---------------- */
const FAN_PREFIX = ['shaft_', 'barb_', 'oc_', 'cape_'];
const CREST_PREFIX = ['crest_'];
function groupOf(name) {
  if (FAN_PREFIX.some(p => name.startsWith(p))) return 1;
  if (CREST_PREFIX.some(p => name.startsWith(p))) return 2;
  return 0;
}

const meshes = [];
function buildMesh(data, indices, pivot) {
  const { palette, pos, pal, ao, mat, seed } = data;
  const count = indices.length;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const aAO = new Float32Array(count), aMat = new Float32Array(count), aSeed = new Float32Array(count), aEmis = new Float32Array(count);
  const mesh = new THREE.InstancedMesh(geo, makeMaterial(), count);
  const M = new THREE.Matrix4(); const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = indices[i];
    M.makeTranslation(pos[s * 3] + 0.5, pos[s * 3 + 1] + 0.5, pos[s * 3 + 2] + 0.5);
    mesh.setMatrixAt(i, M);
    const p = palette[pal[s]];
    col.setRGB(p.rgb[0] / 255, p.rgb[1] / 255, p.rgb[2] / 255, THREE.SRGBColorSpace);
    mesh.setColorAt(i, col);
    aAO[i] = ao[s] / 255; aMat[i] = mat[s]; aSeed[i] = seed[s] / 255; aEmis[i] = p.emis || 0;
  }
  geo.setAttribute('aAO', new THREE.InstancedBufferAttribute(aAO, 1));
  geo.setAttribute('aMat', new THREE.InstancedBufferAttribute(aMat, 1));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
  geo.setAttribute('aEmis', new THREE.InstancedBufferAttribute(aEmis, 1));
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const grp = new THREE.Group();
  if (pivot) { grp.position.set(...pivot); mesh.position.set(-pivot[0], -pivot[1], -pivot[2]); }
  grp.add(mesh); scene.add(grp);
  meshes.push(mesh);
  return grp;
}

/* ---------------- falling petals ---------------- */
let petals, petalState;
function buildPetals() {
  const N = 60;
  const geo = new THREE.BoxGeometry(2.0, 0.4, 1.4);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 });
  petals = new THREE.InstancedMesh(geo, m, N);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const col = new THREE.Color();
  petalState = [];
  for (let i = 0; i < N; i++) {
    petalState.push({
      x: (Math.random() * 2 - 1) * 230, y: Math.random() * 300, z: -80 + Math.random() * 190,
      vy: 14 + Math.random() * 16, ph: Math.random() * 6.28, sw: 8 + Math.random() * 14, rs: (Math.random() * 2 - 1) * 2
    });
    col.set(Math.random() < 0.6 ? '#c9899a' : '#a8842e');
    petals.setColorAt(i, col);
  }
  petals.castShadow = false; petals.frustumCulled = false;
  scene.add(petals);
}
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(), _pe = new THREE.Euler(), _ps = new THREE.Vector3(1, 1, 1), _pp = new THREE.Vector3();
function updatePetals(t, dt) {
  for (let i = 0; i < petalState.length; i++) {
    const p = petalState[i];
    p.y -= p.vy * dt;
    if (p.y < 2) { p.y = 300; p.x = (Math.random() * 2 - 1) * 230; p.z = -80 + Math.random() * 190; }
    const x = p.x + Math.sin(t * 0.7 + p.ph) * p.sw;
    const z = p.z + Math.cos(t * 0.5 + p.ph) * p.sw * 0.5;
    _pe.set(t * p.rs + p.ph, t * p.rs * 0.7, p.ph);
    _pq.setFromEuler(_pe);
    _pp.set(x, p.y, z);
    _pm.compose(_pp, _pq, _ps);
    petals.setMatrixAt(i, _pm);
  }
  petals.instanceMatrix.needsUpdate = true;
}

/* ---------------- controls / views ---------------- */
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 120, 0);
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.minDistance = 50; controls.maxDistance = 1100;
controls.maxPolarAngle = Math.PI * 0.55;
controls.autoRotate = !reduced; controls.autoRotateSpeed = 0.55;

const VIEWS = {
  front: { p: [0, 150, 430], t: [0, 140, 0] },
  threeq: { p: [300, 175, 430], t: [0, 120, 0] },
  side: { p: [560, 150, 60], t: [0, 120, 0] },
  top: { p: [0, 640, 140], t: [0, 60, 0] },
  eye: { p: [0, 272, 120], t: [0, 272, 12] }
};
let tween = null;
function goView(name) {
  const v = VIEWS[name]; if (!v) return;
  tween = { p: new THREE.Vector3(...v.p), t: new THREE.Vector3(...v.t) };
}
controls.addEventListener('start', () => { tween = null; });

const ray = new THREE.Raycaster(); const pointer = new THREE.Vector2();
let downPos = null;
canvas.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!downPos) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  downPos = null;
  if (dx * dx + dy * dy > 25) return; // was a drag
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObjects(meshes, false);
  if (hits.length) {
    const pt = hits[0].point;
    const dir = camera.position.clone().sub(pt).normalize();
    tween = { p: pt.clone().add(dir.multiplyScalar(110)), t: pt.clone() };
  }
});

/* ---------------- post ---------------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.7, 0.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------------- ui ---------------- */
function bindToggle(id, fn, initial) {
  const b = $(id); let on = initial;
  const apply = () => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); fn(on); };
  b.addEventListener('click', () => { on = !on; apply(); });
  apply();
  return (v) => { on = v; apply(); };
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => goView(b.dataset.view)));
$('#btnReset').addEventListener('click', () => goView('threeq'));

/* ---------------- boot ---------------- */
let fanGroup = null, crestGroup = null;
(async function boot() {
  const data = await loadData();
  const groups = [[], [], []];
  for (let i = 0; i < data.n; i++) groups[groupOf(data.palette[data.pal[i]].name)].push(i);
  buildMesh(data, groups[0], null);
  fanGroup = buildMesh(data, groups[1], [0, 60, 12]);
  crestGroup = buildMesh(data, groups[2], [0, 132, 32]);
  buildPetals();
  $('#statVox').textContent = data.stats.surface_voxels.toLocaleString();
  $('#statFeather').textContent = data.stats.feathers;
  setProgress(1, '完成');
  setTimeout(() => loader.classList.add('hide'), 250);

  bindToggle('#tglRotate', v => controls.autoRotate = v, !reduced);
  bindToggle('#tglIrid', v => shaders.forEach(s => s.uniforms.uIrid.value = v ? 1 : 0), true);
  bindToggle('#tglPetal', v => petals.visible = v, !reduced);
  bindToggle('#tglBloom', v => bloom.enabled = v, true);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05); const t = clock.elapsedTime;
    shaders.forEach(s => s.uniforms.uTime.value = t);
    if (fanGroup && !reduced) {
      fanGroup.rotation.z = Math.sin(t * 0.5) * 0.012;
      fanGroup.rotation.x = Math.sin(t * 0.33 + 1) * 0.008;
    }
    if (crestGroup && !reduced) crestGroup.rotation.z = Math.sin(t * 0.9) * 0.03;
    if (petals.visible) updatePetals(t, dt);
    if (tween) {
      camera.position.lerp(tween.p, 0.06);
      controls.target.lerp(tween.t, 0.08);
      if (camera.position.distanceTo(tween.p) < 1) tween = null;
    }
    controls.update();
    composer.render();
  });
})().catch(err => {
  loaderNote.textContent = '加载失败：' + err.message;
  console.error(err);
});