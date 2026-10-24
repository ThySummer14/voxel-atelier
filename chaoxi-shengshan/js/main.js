import * as THREE from '../lib/three.module.js';
import { buildWorld, createBoat } from './world.js';
import { M2_PERIOD, tideLevel, tideState, solarState, formatHour } from './tide.js';

const $ = id => document.getElementById(id);
const state = { hour: 17.4, playing: true, speed: .18, view: 'overview', touring: false, sound: false, ui: true };
const canvas = $('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
} catch (error) {
  $('loading').classList.add('done'); $('error').hidden = false; throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#92a9a5', .00145);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .5, 12000);
const hemi = new THREE.HemisphereLight('#d7e5df', '#4c5144', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffe0ae', 2.1);
sun.position.set(-90, 120, 70); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 105, bottom: -70, near: 10, far: 350 });
sun.shadow.bias = -.00035; sun.shadow.normalBias = .08;
sun.target.position.set(0, 25, 0); scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight('#799da5', .38); fill.position.set(80, 45, -90); scene.add(fill);

const skyUniforms = {
  uDay: { value: 1 }, uNight: { value: 0 }, uGolden: { value: .7 },
  uSunDir: { value: new THREE.Vector3(-.5, .4, .5) },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(7000, 32, 20), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyUniforms,
  vertexShader: `varying vec3 vDir; void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `
    varying vec3 vDir; uniform float uDay,uNight,uGolden; uniform vec3 uSunDir;
    void main(){
      float h=clamp(vDir.y*.72+.32,0.,1.);
      vec3 dayLow=vec3(.39,.57,.60),dayHigh=vec3(.10,.29,.40);
      vec3 nightLow=vec3(.055,.11,.14),nightHigh=vec3(.008,.025,.065);
      vec3 col=mix(mix(dayLow,dayHigh,pow(h,.65)),mix(nightLow,nightHigh,pow(h,.65)),uNight);
      float horizon=pow(1.-abs(vDir.y),8.);
      col+=vec3(.52,.22,.065)*uGolden*horizon;
      float sunDisk=pow(max(dot(normalize(vDir),normalize(uSunDir)),0.),650.);
      col+=vec3(1.,.73,.39)*sunDisk*(1.-uNight)*2.;
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
})); sky.frustumCulled = false; scene.add(sky);

const starGeo = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 750; i++) {
  const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * .46 + .05, r = 5000;
  starPositions.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#e8e1cc', size: 2.2, transparent: true, opacity: 0, depthWrite: false, fog: false }));
scene.add(stars);

const sandUniforms = { uTime: { value: 0 }, uNight: { value: 0 } };
const sand = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.ShaderMaterial({
  uniforms: sandUniforms,
  vertexShader: `varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader: `
    varying vec3 vWorld;uniform float uTime,uNight;
    void main(){
      float r=sin(vWorld.x*.23+sin(vWorld.z*.11)*2.2)*.5+.5;
      float channel=smoothstep(.77,.96,sin(vWorld.x*.034+sin(vWorld.z*.026)*2.4)*.5+.5);
      vec3 dry=mix(vec3(.40,.40,.33),vec3(.57,.54,.43),r*.22);
      vec3 wet=vec3(.22,.34,.34);
      vec3 col=mix(dry,wet,channel*.62);
      col*=1.-uNight*.78;
      float d=length(vWorld.xz);col=mix(col,mix(vec3(.39,.57,.60),vec3(.055,.11,.14),uNight),smoothstep(115.,245.,d));
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
})); sand.rotation.x = -Math.PI / 2; sand.position.y = -1.28; sand.receiveShadow = true; scene.add(sand);

const waterUniforms = {
  uTime: { value: 0 }, uNight: { value: 0 }, uGolden: { value: 0 }, uLevel: { value: 3 },
};
const water = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000, 300, 300), new THREE.ShaderMaterial({
  uniforms: waterUniforms, side: THREE.DoubleSide,
  vertexShader: `
    uniform float uTime;varying vec3 vWorld;varying float vWave;
    void main(){vec3 p=position;float w=sin(p.x*.12+uTime*.8)*.14+sin(p.y*.16-uTime*.63)*.10+sin((p.x+p.y)*.055+uTime*.35)*.18;p.z+=w;vWave=w;vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
  fragmentShader: `
    uniform float uTime,uNight,uGolden,uLevel;varying vec3 vWorld;varying float vWave;
    void main(){
      vec3 viewDir=normalize(cameraPosition-vWorld);
      float fres=pow(1.-max(viewDir.y,0.),3.);
      float ripple=sin(vWorld.x*.42+sin(vWorld.z*.18)+uTime)*sin(vWorld.z*.32-uTime*.7);
      vec3 deep=mix(vec3(.035,.22,.27),vec3(.015,.052,.085),uNight);
      vec3 sky=mix(vec3(.25,.49,.53),vec3(.055,.10,.15),uNight);
      vec3 col=mix(deep,sky,.38+fres*.52+vWave*.3);
      col+=vec3(.32,.23,.12)*uGolden*pow(max(0.,1.-abs(vWorld.x+vWorld.z*.32)*.012),10.)*(.45+.55*ripple);
      float ellipse=length(vec2(vWorld.x/52.,vWorld.z/45.));
      float foam=smoothstep(.975,1.,ellipse)*(1.-smoothstep(1.,1.08,ellipse));
      foam*=.35+.65*smoothstep(.15,.8,sin(vWorld.x*.8+vWorld.z*.6+uTime)*.5+.5);
      col+=vec3(.63,.68,.62)*foam*(1.-uNight*.6);
      col+=vec3(.12,.17,.16)*smoothstep(.76,.98,ripple)*.18;
      float d=length(vWorld.xz);col=mix(col,mix(vec3(.39,.57,.60),vec3(.055,.11,.14),uNight),smoothstep(130.,250.,d));
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
})); water.rotation.x = -Math.PI / 2; water.position.y = 3; water.receiveShadow = true; scene.add(water);

const world = buildWorld(); scene.add(world.group);
$('voxelCount').textContent = world.voxelCount.toLocaleString('zh-CN');

const clouds = new THREE.Group();
const cloudMat = new THREE.MeshStandardMaterial({ color: '#e5e3d6', transparent: true, opacity: .24, depthWrite: false, roughness: 1 });
for (let c = 0; c < 8; c++) {
  const cloud = new THREE.Group();
  for (let i = 0; i < 13; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(7 + Math.random() * 9, 2 + Math.random() * 4, 5 + Math.random() * 8), cloudMat);
    cube.position.set((Math.random() - .5) * 30, (Math.random() - .5) * 6, (Math.random() - .5) * 14); cloud.add(cube);
  }
  const a = c / 8 * Math.PI * 2;
  cloud.position.set(Math.cos(a) * (150 + Math.random() * 70), 75 + Math.random() * 45, Math.sin(a) * (150 + Math.random() * 70));
  cloud.userData.speed = .25 + Math.random() * .25; clouds.add(cloud);
}
scene.add(clouds);

const boats = [[78, 48, -.3], [99, 6, .55], [-72, 58, -.7]].map(([x, z, r], i) => {
  const boat = createBoat(i === 1 ? '#495f64' : '#79543c'); boat.position.set(x, 2, z); boat.rotation.y = r; boat.scale.setScalar(i === 2 ? .72 : .9); scene.add(boat); return boat;
});
const gulls = [];
const gullMat = new THREE.MeshStandardMaterial({ color: '#eee9d8', roughness: .9 });
for (let i = 0; i < 13; i++) {
  const gull = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.65, .35, 1.2), gullMat); gull.add(body);
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.7, .16, .55), gullMat); left.position.x = -1; gull.add(left);
  const right = left.clone(); right.position.x = 1; gull.add(right);
  gull.userData = { radius: 52 + Math.random() * 60, speed: .055 + Math.random() * .055, phase: Math.random() * Math.PI * 2, height: 48 + Math.random() * 45, left, right };
  scene.add(gull); gulls.push(gull);
}

const presets = {
  overview: { yaw: .73, pitch: .39, distance: 224, target: [0, 31, 0] },
  abbey: { yaw: .65, pitch: .26, distance: 142, target: [-2, 54, 0] },
  marvel: { yaw: 2.78, pitch: .28, distance: 100, target: [2, 39, -8] },
  ramparts: { yaw: 1.22, pitch: .25, distance: 94, target: [20, 16, 18] },
  aerial: { yaw: .77, pitch: 1.13, distance: 170, target: [0, 11, 0] },
};
const orbit = { yaw: .73, pitch: .39, distance: 238, target: new THREE.Vector3(0, 31, 0) };
const desired = { yaw: .73, pitch: .39, distance: 224, target: new THREE.Vector3(0, 31, 0) };
function setView(name, immediate = false) {
  const p = presets[name]; if (!p) return;
  state.view = name; state.touring = false; document.body.classList.remove('touring');
  Object.assign(desired, { yaw: p.yaw, pitch: p.pitch, distance: p.distance });
  desired.target.set(...p.target);
  if (immediate) {
    Object.assign(orbit, { yaw: p.yaw, pitch: p.pitch, distance: p.distance }); orbit.target.copy(desired.target);
  }
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === name));
}

function updateCamera(dt) {
  const k = 1 - Math.exp(-dt * 3.6);
  orbit.yaw += (desired.yaw - orbit.yaw) * k; orbit.pitch += (desired.pitch - orbit.pitch) * k;
  orbit.distance += (desired.distance - orbit.distance) * k; orbit.target.lerp(desired.target, k);
  const mobileScale = innerWidth < 760 ? 1.75 : 1;
  const d = orbit.distance * mobileScale, cp = Math.cos(orbit.pitch);
  camera.position.set(orbit.target.x + Math.sin(orbit.yaw) * cp * d, orbit.target.y + Math.sin(orbit.pitch) * d, orbit.target.z + Math.cos(orbit.yaw) * cp * d);
  camera.lookAt(orbit.target);
}

const notes = {
  abbey: '尖塔之上的天使长像俯瞰海湾。中殿、钟塔与哥特扶壁沿花岗岩主轴逐层抬升，构成山城不可错认的剪影。',
  marvel: '奇迹楼把三层修院空间叠在北侧陡坡上。庞大的体量并非装饰，而是中世纪石工对垂直地形的回答。',
  ramparts: '城墙沿潮汐线围合村落。棱堡、雉堞与狭窄窗洞都是独立体素；换个角度，还能看到朝圣石阶如何穿城而上。',
};
function selectLandmark(name) {
  $('fieldNote').textContent = notes[name]; setView(name);
  document.querySelectorAll('.hotspot').forEach(b => b.classList.toggle('selected', b.dataset.landmark === name));
}
document.querySelectorAll('.hotspot').forEach(b => b.addEventListener('click', () => selectLandmark(b.dataset.landmark)));
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); setView('overview'); });

let dragging = false, lastX = 0, lastY = 0, pinchDistance = 0;
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); if (state.touring) stopTour(); });
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  desired.yaw -= (e.clientX - lastX) * .005; desired.pitch = Math.max(.08, Math.min(1.42, desired.pitch + (e.clientY - lastY) * .004));
  lastX = e.clientX; lastY = e.clientY;
});
canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointercancel', () => dragging = false);
canvas.addEventListener('wheel', e => { e.preventDefault(); desired.distance = Math.max(58, Math.min(300, desired.distance * Math.exp(e.deltaY * .0008))); }, { passive: false });
canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
canvas.addEventListener('touchmove', e => {
  if (e.touches.length !== 2) return;
  const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  if (pinchDistance) desired.distance = Math.max(58, Math.min(300, desired.distance * pinchDistance / d)); pinchDistance = d;
}, { passive: true });

function updatePlayButton() { $('playButton').textContent = state.playing ? 'Ⅱ' : '▷'; $('playButton').setAttribute('aria-label', state.playing ? '暂停模拟' : '继续模拟'); }
function setHour(hour, pause = false) {
  state.hour = ((Number(hour) % 24) + 24) % 24;
  if (pause) state.playing = false;
  $('timeSlider').value = state.hour; updatePlayButton(); updateConditions();
}
$('playButton').addEventListener('click', () => { state.playing = !state.playing; updatePlayButton(); });
$('timeSlider').addEventListener('input', e => setHour(e.target.value));
document.querySelectorAll('[data-tide]').forEach(b => b.addEventListener('click', () => {
  setHour(b.dataset.tide === 'high' ? 6.1 : 6.1 + M2_PERIOD / 2, true);
  document.querySelectorAll('[data-tide]').forEach(x => x.classList.toggle('active', x === b));
  toast(b.dataset.tide === 'high' ? '满潮 · 山城成为岛屿' : '退潮 · 滩涂与栈桥显现');
}));

function toggleUI() { state.ui = !state.ui; document.body.classList.toggle('ui-hidden', !state.ui); }
$('hideButton').addEventListener('click', toggleUI); $('restoreButton').addEventListener('click', toggleUI);
function openStory(open) { $('storyPanel').classList.toggle('open', open); $('storyPanel').setAttribute('aria-hidden', String(!open)); }
$('noteButton').addEventListener('click', () => openStory(true)); $('closeStory').addEventListener('click', () => openStory(false));
$('captureButton').addEventListener('click', () => {
  renderer.render(scene, camera);
  const a = document.createElement('a'); a.download = `潮汐之山-${formatHour(state.hour).replace(':', '')}.png`; a.href = canvas.toDataURL('image/png'); a.click(); toast('已保存此刻的山与海');
});
let toastTimer;
function toast(text) { $('toast').textContent = text; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2200); }

let audioContext, audioGain;
async function toggleSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const length = audioContext.sampleRate * 4, buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch); let last = 0;
      for (let i = 0; i < length; i++) { const white = Math.random() * 2 - 1; last = last * .985 + white * .015; data[i] = last * 5; }
    }
    const source = audioContext.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 720;
    audioGain = audioContext.createGain(); audioGain.gain.value = .17;
    source.connect(filter).connect(audioGain).connect(audioContext.destination); source.start();
  }
  state.sound = !state.sound;
  if (state.sound) await audioContext.resume(); else await audioContext.suspend();
  $('soundButton').setAttribute('aria-pressed', String(state.sound)); $('soundButton').setAttribute('aria-label', state.sound ? '关闭海湾环境声' : '开启海湾环境声');
}
$('soundButton').addEventListener('click', toggleSound);

const tourSteps = [
  { view: 'overview', title: '海上的秩序', text: '山体、村庄与修道院，沿着同一条垂直轴线生长。' },
  { view: 'ramparts', title: '潮线之上的城', text: '棱堡守住港湾，屋顶顺着等高线挤向天空。' },
  { view: 'marvel', title: '垂直的奇迹', text: '北侧陡坡之上，三层修院叠成一部石头的书。' },
  { view: 'abbey', title: '指向天穹', text: '扶壁托起中殿，天使长的金像在最高处守望。' },
];
let tourIndex = 0, tourElapsed = 0;
function startTour() { state.touring = true; tourIndex = 0; tourElapsed = 0; document.body.classList.add('touring'); $('tourButton').innerHTML = '结束导览 <span>×</span>'; applyTourStep(); }
function stopTour() { state.touring = false; document.body.classList.remove('touring'); $('tourButton').innerHTML = '开始导览 <span>↗</span>'; }
function applyTourStep() {
  const step = tourSteps[tourIndex]; setView(step.view); state.touring = true; document.body.classList.add('touring');
  $('tourNumber').textContent = `0${tourIndex + 1} / 04`; $('tourTitle').textContent = step.title; $('tourText').textContent = step.text;
}
$('tourButton').addEventListener('click', () => state.touring ? stopTour() : startTour());

window.addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.code === 'Space') { e.preventDefault(); state.playing = !state.playing; updatePlayButton(); }
  if (e.key.toLowerCase() === 'h') toggleUI();
  if (e.key.toLowerCase() === 'n') setHour(solarState(state.hour).night > .5 ? 17.4 : 22.2, true);
  if (e.key === 'Escape') { openStory(false); stopTour(); }
  if (e.key === 'ArrowLeft') desired.yaw += .12;
  if (e.key === 'ArrowRight') desired.yaw -= .12;
  if (e.key === 'ArrowUp') desired.pitch = Math.min(1.4, desired.pitch + .08);
  if (e.key === 'ArrowDown') desired.pitch = Math.max(.08, desired.pitch - .08);
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
});

const projected = new THREE.Vector3();
function updateHotspots() {
  document.querySelectorAll('.hotspot').forEach(button => {
    projected.copy(world.landmarks[button.dataset.landmark]).project(camera);
    const visible = projected.z < 1 && Math.abs(projected.x) < .88 && Math.abs(projected.y) < .85;
    button.style.left = `${(projected.x * .5 + .5) * innerWidth + 10}px`;
    button.style.top = `${(-projected.y * .5 + .5) * innerHeight}px`;
    button.style.opacity = visible && state.view === 'overview' ? '.9' : '0';
    button.style.pointerEvents = visible && state.view === 'overview' ? 'auto' : 'none';
  });
}
function phaseName(hour) { if (hour < 5 || hour >= 21) return '静夜'; if (hour < 8) return '晨曦'; if (hour < 16.5) return '日光'; if (hour < 19.5) return '薄暮'; return '入夜'; }
function updateConditions() {
  const tide = tideState(state.hour), solar = solarState(state.hour);
  $('tideHeight').textContent = `${tide.level >= 0 ? '+' : '−'}${Math.abs(tide.level).toFixed(1)}`;
  $('tideState').textContent = tide.rising ? '涨潮' : '退潮';
  $('causewayState').textContent = tide.causewayDry ? '可通行' : '淹没';
  $('causewayState').style.color = tide.causewayDry ? '#c9d3aa' : '';
  $('clock').textContent = formatHour(state.hour); $('dayPhase').textContent = phaseName(state.hour);
  $('tideArc').style.strokeDashoffset = String(358.15 * (1 - tide.normalized));
  $('timeSlider').value = state.hour;
  document.querySelectorAll('[data-tide]').forEach(b => b.classList.remove('active'));
}

const clock = new THREE.Clock(); let elapsed = 0, frames = 0, fps = 0, fpsTime = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05); elapsed += dt; frames++; fpsTime += dt;
  if (fpsTime > 1) { fps = Math.round(frames / fpsTime); frames = 0; fpsTime = 0; }
  if (state.playing) state.hour = (state.hour + dt * state.speed) % 24;
  if (state.touring) { tourElapsed += dt; if (tourElapsed > 7) { tourElapsed = 0; tourIndex = (tourIndex + 1) % tourSteps.length; applyTourStep(); } }
  const tide = tideState(state.hour), solar = solarState(state.hour);
  updateCamera(dt);
  water.position.y = tide.level; waterUniforms.uLevel.value = tide.level;
  waterUniforms.uTime.value = elapsed; waterUniforms.uNight.value = solar.night; waterUniforms.uGolden.value = solar.golden;
  sandUniforms.uTime.value = elapsed; sandUniforms.uNight.value = solar.night;
  skyUniforms.uDay.value = solar.daylight; skyUniforms.uNight.value = solar.night; skyUniforms.uGolden.value = solar.golden;
  stars.material.opacity = Math.max(0, solar.night - .35) * 1.4; stars.rotation.y = elapsed * .003;
  const sunAngle = (state.hour - 6) / 24 * Math.PI * 2;
  sun.position.set(Math.cos(sunAngle) * 145, Math.sin(sunAngle) * 165, 65);
  skyUniforms.uSunDir.value.copy(sun.position).normalize();
  sun.intensity = .12 + solar.daylight * 2.11; hemi.intensity = .5 + solar.daylight * .67;
  sun.color.set(solar.golden > .35 ? '#ffd09a' : '#fff0d2');
  fill.intensity = .38 + solar.daylight * .08;
  scene.fog.color.set(solar.night > .55 ? '#172f3a' : solar.golden > .35 ? '#a89f88' : '#91aaa9');
  renderer.toneMappingExposure = .88 + solar.daylight * .18 + solar.golden * .12;
  world.glowMesh.material.color.setRGB(.28 + solar.night * .72, .32 + solar.night * .68, .34 + solar.night * .55);
  cloudMat.color.set(solar.night > .5 ? '#60717a' : '#e5e0d0'); cloudMat.opacity = .08 + solar.daylight * .07;
  clouds.children.forEach(cloud => { cloud.position.x += dt * cloud.userData.speed; if (cloud.position.x > 245) cloud.position.x = -245; });
  boats.forEach((boat, i) => { boat.position.y = Math.max(-.85, tide.level + .5 + Math.sin(elapsed * .9 + i) * .08); boat.rotation.z = Math.sin(elapsed * .65 + i * 2) * .025 * (tide.level > 0 ? 1 : 0); });
  gulls.forEach((gull, i) => {
    const d = gull.userData, a = elapsed * d.speed + d.phase;
    gull.position.set(Math.cos(a) * d.radius, d.height + Math.sin(a * 2.3) * 4, Math.sin(a) * d.radius);
    gull.rotation.y = -a; const flap = Math.sin(elapsed * 3.5 + i) * .28;
    d.left.rotation.z = flap; d.right.rotation.z = -flap;
  });
  sky.position.copy(camera.position); stars.position.copy(camera.position);
  updateConditions(); updateHotspots();
  renderer.render(scene, camera);
}

setView('overview'); updateConditions();
requestAnimationFrame(() => { $('loading').classList.add('done'); animate(); });

window.MSM = {
  state, scene, camera, renderer, world, setHour, setView, tideLevel, M2_PERIOD,
  pause() { state.playing = false; updatePlayButton(); },
  reset() { stopTour(); setHour(17.4, true); setView('overview', true); $('toast').classList.remove('show'); },
  probe() {
    const tide = tideState(state.hour);
    return { ready: $('loading').classList.contains('done'), hour: state.hour, tide, view: state.view, voxels: world.voxelCount,
      drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, fps,
      waterY: water.position.y, windows: world.glowMesh.material.color.getHexString(), canvas: [canvas.width, canvas.height] };
  },
};
