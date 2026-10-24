// 《百刻周天》浏览器运行时。所有几何/事件/传动来自纯内核模块，与本文件解耦。
import * as THREE from '../lib/three.module.js';
import { L, keText, gengOf } from './spec.js';
import { buildAll, buildScoopWater, buildTower } from './mech.js';
import { mergePart } from './mesh.js';
import { pose, scoopFill, wheelStepIndex } from './pose.js';
import { buildEvents } from './events.js';
import { STARS, GAL_POLE, AXIS, starDir, skyAngle } from './catalog.js';
import { PAL } from './palette.js';

const cv = document.getElementById('cv');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const shaderMat = () => new THREE.ShaderMaterial({
  uniforms: { uNight: { value: 0 } },
  vertexShader: `
    attribute vec3 aDay; attribute vec3 aNight; varying vec3 vC; uniform float uNight;
    void main() { vC = mix(aDay, aNight, uNight);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vC; void main() { gl_FragColor = vec4(vC, 1.0); }`,
});
const sharedMat = shaderMat();

const meshes = {};
const parts = buildAll();
for (const part of parts) {
  const m = mergePart(part);
  const p0 = pose(0)[m.key];
  const origin = p0 && p0.rot ? p0.rot.center : null;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(m.pos);
  if (origin) for (let i = 0; i < pos.length; i += 3) {
    pos[i] -= origin[0]; pos[i + 1] -= origin[1]; pos[i + 2] -= origin[2];
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aDay', new THREE.BufferAttribute(new Float32Array(m.colD), 3));
  geo.setAttribute('aNight', new THREE.BufferAttribute(new Float32Array(m.colN), 3));
  geo.setIndex(m.idx);
  const mesh = new THREE.Mesh(geo, sharedMat);
  if (origin) mesh.position.set(origin[0], origin[1], origin[2]);
  mesh.userData.key = m.key;
  scene.add(mesh);
  meshes[m.key] = { mesh, m, origin };
}

function rebuildScoop(fill) {
  const old = meshes.scoopWater;
  if (old) { scene.remove(old.mesh); old.mesh.geometry.dispose(); }
  const part = buildScoopWater(fill, Math.PI / 2);
  const m = mergePart(part);
  const origin = [L.wheel.cx, L.wheel.cy, L.wheel.cz];
  const pos = new Float32Array(m.pos);
  for (let i = 0; i < pos.length; i += 3) { pos[i] -= origin[0]; pos[i + 1] -= origin[1]; pos[i + 2] -= origin[2]; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aDay', new THREE.BufferAttribute(new Float32Array(m.colD), 3));
  geo.setAttribute('aNight', new THREE.BufferAttribute(new Float32Array(m.colN), 3));
  geo.setIndex(m.idx);
  const mesh = new THREE.Mesh(geo, sharedMat);
  mesh.position.set(origin[0], origin[1], origin[2]);
  scene.add(mesh);
  meshes.scoopWater = { mesh, m, origin };
}
rebuildScoop(0);

let cutsOn = true;
function rebuildTower() {
  const old = meshes.tower;
  if (old) { scene.remove(old.mesh); old.mesh.geometry.dispose(); }
  const part = buildTower(cutsOn);
  const m = mergePart(part);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.pos), 3));
  geo.setAttribute('aDay', new THREE.BufferAttribute(new Float32Array(m.colD), 3));
  geo.setAttribute('aNight', new THREE.BufferAttribute(new Float32Array(m.colN), 3));
  geo.setIndex(m.idx);
  const mesh = new THREE.Mesh(geo, sharedMat);
  scene.add(mesh);
  meshes.tower = { mesh, m, origin: null };
}

let starMatRef = null;
const starGroup = new THREE.Group();
{
  const N = STARS.length + 460;
  const posArr = new Float32Array(N * 3);
  const colArr = new Float32Array(N * 3);
  const sizeArr = new Float32Array(N);
  const R = 700;
  const axis = AXIS.map(v => v);
  const n = Math.hypot(axis[0], axis[1], axis[2]);
  const NU = [axis[0] / n, axis[1] / n, axis[2] / n];
  const gp = starDir(GAL_POLE[0], GAL_POLE[1], 0);
  let i = 0;
  const DC = [0, 118, 0];
  for (const [ra, dec, mag] of STARS) {
    const d = starDir(ra, dec, 0);
    posArr.set([d[0] * R + DC[0], d[1] * R + DC[1], d[2] * R + DC[2]], i * 3);
    const b = mag >= 3 ? 1.0 : mag === 2 ? 0.75 : 0.5;
    colArr.set([b, b * 0.96, b * 0.85], i * 3);
    sizeArr[i] = mag >= 3 ? 4.5 : mag === 2 ? 3.2 : 2.2;
    i++;
  }
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 380; k++) {
    let d;
    if (k < 240) {
      const psi = rnd() * Math.PI * 2;
      const v1 = [1, 0, 0];
      const v2 = [NU[1] * 0 - NU[2] * 0, NU[2] * 1 - NU[0] * 0, NU[0] * 0 - NU[1] * 1];
      let a = [Math.cos(psi) * v1[0] + Math.sin(psi) * v2[0],
        Math.cos(psi) * v1[1] + Math.sin(psi) * v2[1],
        Math.cos(psi) * v1[2] + Math.sin(psi) * v2[2]];
      const dd = a[0] * gp[0] + a[1] * gp[1] + a[2] * gp[2];
      a = [a[0] - dd * gp[0] + gp[0] * 0.14 * (rnd() - 0.5) * 2,
        a[1] - dd * gp[1] + gp[1] * 0.14 * (rnd() - 0.5) * 2,
        a[2] - dd * gp[2] + gp[2] * 0.14 * (rnd() - 0.5) * 2];
      const m = Math.hypot(a[0], a[1], a[2]);
      d = [a[0] / m, a[1] / m, a[2] / m];
    } else {
      d = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1];
      const m = Math.hypot(d[0], d[1], d[2]);
      if (m < 0.1 || m > 1) { k--; continue; }
      d = [d[0] / m, d[1] / m, d[2] / m];
    }
    posArr.set([d[0] * R + DC[0], d[1] * R + DC[1], d[2] * R + DC[2]], i * 3);
    const b = 0.28 + rnd() * 0.3;
    colArr.set([b, b * 0.97, b * 0.9], i * 3);
    sizeArr[i] = 1.6 + rnd() * 1.2;
    i++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('aCol', new THREE.BufferAttribute(colArr, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizeArr, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: `attribute vec3 aCol; attribute float aSize; varying vec3 vC;
      void main() { vC = aCol; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize; }`,
    fragmentShader: `varying vec3 vC; uniform float uOpacity;
      void main() { gl_FragColor = vec4(vC, uOpacity); }`,
    transparent: true, depthWrite: false,
  });
  starMatRef = mat;
  starGroup.add(new THREE.Points(geo, mat));
}
scene.add(starGroup);

const sunMesh = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 22),
  new THREE.MeshBasicMaterial({ color: 0xffedb0 }));
const moonMesh = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15),
  new THREE.MeshBasicMaterial({ color: 0xd8e2ef }));
scene.add(sunMesh, moonMesh);

const PART = 36;
const drops = [];
{
  const g = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const mat = new THREE.MeshBasicMaterial({ color: PAL.waterL });
  for (let i = 0; i < 90; i++) {
    const mesh = new THREE.Mesh(g, mat);
    mesh.visible = false;
    scene.add(mesh);
    drops.push({ mesh, live: false, p0: [0, 0, 0], p1: [0, 0, 0], t: 0, dur: 1, burst: false });
  }
}
function spawnDrop(p0, p1, dur, burst) {
  for (const d of drops) {
    if (d.live) continue;
    d.live = true; d.t = 0; d.dur = dur; d.p0 = p0; d.p1 = p1; d.burst = burst;
    d.mesh.visible = true;
    d.mesh.position.set(p0[0], p0[1], p0[2]);
    return d;
  }
  return null;
}

let simT = ((Date.now() / 1000) % 86400 + 86400) % 86400;
let speed = 60;
let soundOn = false;
const events = buildEvents();
let evIdx = events.findIndex(e => e.t > simT);
if (evIdx < 0) evIdx = 0;
const sliders = [0, 0, 0, 0, 0];
const doors = [0, 0, 0, 0, 0];
let lastFill = -1, lastStep = -1;
let bannerT = 0;

const cam = { yaw: 0.66, pitch: 0.28, dist: 340, look: [0, 58, 0], tyaw: 0.66, tpitch: 0.28, tdist: 340 };
let dragging = false, lastX = 0, lastY = 0, idleT = 0;
cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
addEventListener('pointerup', () => { dragging = false; });
addEventListener('pointermove', e => {
  if (!dragging) return;
  cam.tyaw -= (e.clientX - lastX) * 0.006;
  cam.tpitch = Math.max(0.03, Math.min(1.2, cam.tpitch + (e.clientY - lastY) * 0.005));
  lastX = e.clientX; lastY = e.clientY; idleT = 0;
});
cv.addEventListener('wheel', e => {
  e.preventDefault();
  cam.tdist = Math.max(70, Math.min(950, cam.tdist * (1 + e.deltaY * 0.0012)));
  idleT = 0;
}, { passive: false });

const audio = (() => {
  let ctx = null, master = null, amb = null;
  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.6;
    amb = ctx.createGain(); amb.gain.value = 0.035;
    src.connect(f); f.connect(amb); amb.connect(master); src.start();
  }
  function tone(freqs, dur, vol, type = 'sine', sweep = 0) {
    if (!ctx || !soundOn) return;
    for (const [f, v] of freqs) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      if (sweep) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * sweep), ctx.currentTime + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol * v, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + dur + 0.05);
    }
  }
  function noise(dur, vol, freq, q = 1) {
    if (!ctx || !soundOn) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }
  return {
    ensure,
    bell() { tone([[1180, 1], [1760, 0.4], [2360, 0.2]], 0.5, 0.16); },
    chime() { tone([[420, 1], [630, 0.5], [1130, 0.25]], 2.4, 0.24); setTimeout(() => tone([[396, 1], [594, 0.5]], 2.6, 0.2), 900); },
    drum() { tone([[95, 1]], 0.22, 0.5, 'sine', 0.45); noise(0.09, 0.22, 180, 1.2); setTimeout(() => { tone([[88, 1]], 0.24, 0.45, 'sine', 0.42); noise(0.09, 0.2, 170, 1.2); }, 260); },
    gong() { tone([[1450, 1], [2170, 0.35]], 0.35, 0.14, 'triangle'); noise(0.12, 0.06, 2400, 3); },
    block() { noise(0.06, 0.2, 900, 2); },
    clack() { noise(0.02, 0.28, 1800, 1.5); setTimeout(() => noise(0.02, 0.22, 1400, 1.5), 70); },
    drip() { tone([[1400, 1]], 0.05, 0.05, 'sine', 0.6); },
  };
})();

function fireEvent(e) {
  const i = e.layer;
  doorAnim[i] = { t: 0, phase: 'open' };
  sliderAnim[i] = { t: 0, phase: 'out' };
  const kind = ['摇铃', '报牌', '晨昏', '更鼓', '点钲'][i];
  showBanner(`${kind} · ${e.label ?? keText(simT)}`);
  if (soundOn && !(e.kind === 'bell' && speed > 120)) {
    const fns = { bell: audio.bell, chime: audio.chime, drum: audio.drum, gong: audio.gong, block: audio.block };
    (fns[e.sound] || audio.bell)();
  }
}
const doorAnim = [null, null, null, null, null];
const sliderAnim = [null, null, null, null, null];
function showBanner(text) {
  const b = document.getElementById('banner');
  b.textContent = text;
  b.style.opacity = 1;
  bannerT = 3.5;
}

function updateEvents() {
  const prev = prevT % 86400, cur = simT % 86400;
  const wrapped = cur < prev;
  let guard = 0;
  while (guard++ < 300) {
    const e = events[evIdx];
    const due = wrapped ? (e.t > prev || e.t <= cur) : (e.t <= cur && e.t > prev);
    if (!due) break;
    fireEvent(e);
    evIdx = (evIdx + 1) % events.length;
  }
}

let prevT = simT;
function tickSim(dt) {
  prevT = simT;
  simT += dt * speed;
  if (simT >= 86400) simT -= 86400;
  updateEvents();
}

function skyState(t) {
  const dayFrac = (t % 86400) / 86400;
  const sunAlt = Math.sin(Math.PI * (t - 21600) / 43200);
  return { sunAlt, dayFrac };
}

function applySky() {
  const { sunAlt } = skyState(simT);
  const night = Math.max(0, Math.min(1, (6 - sunAlt * 60) / 12));
  sharedMat.uniforms.uNight.value = night;
  if (starMatRef) starMatRef.uniforms.uOpacity.value = night;
  const bg = document.getElementById('bg');
  let c1, c2;
  if (sunAlt > 0.25) { c1 = '#a8c6da'; c2 = '#e6eef2'; }
  else if (sunAlt > 0) { c1 = '#7f9ab5'; c2 = '#e8c49a'; }
  else if (sunAlt > -0.15) { c1 = '#2a3350'; c2 = '#b06a3e'; }
  else { c1 = '#05070f'; c2 = '#131e33'; }
  bg.style.background = `linear-gradient(to bottom, ${c1} 0%, ${c2} 78%)`;
  const sa = skyAngle(simT);
  starGroup.quaternion.setFromAxisAngle(new THREE.Vector3(AXIS[0], AXIS[1], AXIS[2]).normalize(), sa);
  const sunAz = Math.PI * (simT - 21600) / 43200;
  const sx = Math.sin(sunAz) * 700, sy = Math.sin(Math.PI * (simT - 21600) / 43200) * 700;
  sunMesh.position.set(sx, sy + 118, Math.cos(sunAz) * 300);
  sunMesh.visible = sy > -60;
  const mAz = sunAz + Math.PI;
  moonMesh.position.set(Math.sin(mAz) * 700, Math.sin(Math.PI * (simT - 21600 + 43200) / 43200) * 700 + 118, Math.cos(mAz) * 300);
  moonMesh.visible = moonMesh.position.y > -60;
}

const kebar = document.getElementById('kebar');
for (let i = 0; i < 100; i++) {
  const t = document.createElement('div');
  t.className = 'tick';
  t.style.left = i + '%';
  kebar.appendChild(t);
}
const cur = document.createElement('div');
cur.className = 'cur';
kebar.appendChild(cur);

function updateHUD() {
  document.getElementById('keText').textContent = keText(simT);
  const g = gengOf(simT);
  const rt = new Date();
  document.getElementById('keSub').textContent =
    `${speed === 1 ? '真时' : speed + '×'} · 真实时刻 ${rt.getHours().toString().padStart(2, '0')}:${rt.getMinutes().toString().padStart(2, '0')}` +
    (g ? ` · ${g.n}更` : '');
  cur.style.left = ((simT % 86400) / 86400 * 100) + '%';
  if (bannerT > 0) { bannerT -= 0.016; if (bannerT <= 0) document.getElementById('banner').style.opacity = 0; }
}

const bar = document.getElementById('bar');
function chip(label, fn, id) {
  const c = document.createElement('span');
  c.className = 'chip'; c.textContent = label; c.id = id || '';
  c.addEventListener('click', fn);
  bar.appendChild(c);
  return c;
}
const chips = {};
chips.real = chip('真时', () => {
  speed = 1;
  simT = ((Date.now() / 1000) % 86400 + 86400) % 86400;
  evIdx = events.findIndex(e => e.t > simT); if (evIdx < 0) evIdx = 0;
  syncChips();
});
chips.s60 = chip('60×', () => { speed = 60; syncChips(); });
chips.s600 = chip('600×', () => { speed = 600; syncChips(); });
const sep1 = document.createElement('span'); sep1.className = 'sep'; bar.appendChild(sep1);
chips.cut = chip('剖面', () => { cutsOn = !cutsOn; syncChips(); });
chips.sound = chip('声', () => { soundOn = !soundOn; if (soundOn) audio.ensure(); syncChips(); });
chips.next = chip('下一报时 →', () => {
  const i = evIdx % events.length;
  const target = events[i].t <= simT ? events[i].t + 86400 : events[i].t;
  simT = target + 1;
  if (simT >= 86400) simT -= 86400;
  evIdx = (i + 1) % events.length;
});
function syncChips() {
  chips.real.classList.toggle('on', speed === 1);
  chips.s60.classList.toggle('on', speed === 60);
  chips.s600.classList.toggle('on', speed === 600);
  chips.cut.classList.toggle('on', cutsOn);
  chips.sound.classList.toggle('on', soundOn);
}
syncChips();

const intro = document.getElementById('intro');
intro.addEventListener('click', () => {
  intro.style.opacity = 0;
  setTimeout(() => intro.remove(), 900);
});

let dripAcc = 0, dropAcc = 0;
let fps = 0, fpsN = 0, fpsT = 0;
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  idleT += dt;
  if (idleT > 18) cam.tyaw += dt * 0.012;

  cam.yaw += (cam.tyaw - cam.yaw) * Math.min(1, dt * 6);
  cam.pitch += (cam.tpitch - cam.pitch) * Math.min(1, dt * 6);
  cam.dist += (cam.tdist - cam.dist) * Math.min(1, dt * 6);
  camera.position.set(
    cam.look[0] + cam.dist * Math.cos(cam.pitch) * Math.sin(cam.yaw),
    cam.look[1] + cam.dist * Math.sin(cam.pitch),
    cam.look[2] + cam.dist * Math.cos(cam.pitch) * Math.cos(cam.yaw));
  camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);

  tickSim(dt);
  applySky();

  const fill = scoopFill(simT);
  const step = wheelStepIndex(simT);
  const stepped = step !== lastStep;
  if (fill !== lastFill || stepped) rebuildScoop(fill);
  if (stepped) {
    lastStep = step;
    audio.clack();
    const phi = Math.PI / 2 + 0.9;
    for (let k = 0; k < 10; k++) {
      const px = L.wheel.cx + 17 * Math.cos(phi) + (Math.random() - 0.5) * 3;
      const py = L.wheel.cy + 17 * Math.sin(phi) + (Math.random() - 0.5) * 3;
      spawnDrop([px, py, L.wheel.cz], [px + (Math.random() - 0.5) * 6, 9, L.wheel.cz + (Math.random() - 0.5) * 3], 1.1, true);
    }
  }
  if (fill !== lastFill) lastFill = fill;

  dripAcc += dt;
  const dripRate = Math.min(14, 0.8 * speed);
  if (dripAcc > 1 / dripRate) {
    dripAcc = 0;
    const lvl = 42 + lastFill;
    spawnDrop([L.drip[0], L.drip[1], L.drip[2]], [L.drip[0] + (Math.random() - 0.5), lvl, L.drip[2]], 0.55, false);
    if (speed <= 10) audio.drip();
  }

  for (const d of drops) {
    if (!d.live) continue;
    d.t += dt;
    const u = Math.min(1, d.t / d.dur);
    const s = d.burst ? u * u : u;
    d.mesh.position.set(d.p0[0] + (d.p1[0] - d.p0[0]) * s, d.p0[1] + (d.p1[1] - d.p0[1]) * s, d.p0[2] + (d.p1[2] - d.p0[2]) * s);
    if (u >= 1) { d.live = false; d.mesh.visible = false; }
  }

  for (let i = 0; i < 5; i++) {
    const da = doorAnim[i];
    if (da) {
      da.t += dt;
      if (da.phase === 'open') { doors[i] = Math.min(1, da.t / 0.5); if (doors[i] >= 1) { da.phase = 'hold'; da.t = 0; } }
      else if (da.phase === 'hold') { if (da.t > 8) { da.phase = 'close'; da.t = 0; } }
      else { doors[i] = Math.max(0, 1 - da.t / 0.5); if (doors[i] <= 0) doorAnim[i] = null; }
    }
    const sa = sliderAnim[i];
    if (sa) {
      sa.t += dt;
      if (sa.phase === 'out') { sliders[i] = Math.min(1, sa.t / 0.8); if (sliders[i] >= 1) { sa.phase = 'in'; sa.t = 0.8; } }
      else { sa.t -= dt * 0.7; sliders[i] = Math.min(1, Math.max(0, sa.t / 0.8)); if (sliders[i] <= 0) sliderAnim[i] = null; }
    }
  }

  const tform = pose(simT, { ext: sliders, doors });
  for (const [key, rec] of Object.entries(meshes)) {
    const tf = tform[key];
    if (!tf) continue;
    const mesh = rec.mesh;
    if (tf.rot) {
      mesh.quaternion.setFromAxisAngle(
        new THREE.Vector3(tf.rot.axis[0], tf.rot.axis[1], tf.rot.axis[2]).normalize(), tf.rot.angle);
    } else mesh.quaternion.identity();
    if (tf.pos) mesh.position.set(
      (rec.origin ? rec.origin[0] : 0) + tf.pos[0],
      (rec.origin ? rec.origin[1] : 0) + tf.pos[1],
      (rec.origin ? rec.origin[2] : 0) + tf.pos[2]);
    else if (rec.origin) mesh.position.set(rec.origin[0], rec.origin[1], rec.origin[2]);
    else mesh.position.set(0, 0, 0);
  }

  updateHUD();
  renderer.render(scene, camera);
  fpsN++; fpsT += dt;
  if (fpsT > 1) { fps = fpsN / fpsT; fpsN = 0; fpsT = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.BK = {
  cam(name, opts) {
    const P = {
      cover: { yaw: 0.66, pitch: 0.28, dist: 340, look: [0, 58, 0] },
      east: { yaw: 1.53, pitch: 0.21, dist: 240, look: [0, 36, 0] },
      wheel: { yaw: 2.23, pitch: 0.24, dist: 150, look: [10, 30, -8] },
      globe: { yaw: 0.14, pitch: -0.03, dist: 95, look: [0, 76, 10] },
      arm: { yaw: 0.52, pitch: 0.45, dist: 150, look: [0, 118, 0] },
      night: { yaw: 3.58, pitch: 0.21, dist: 340, look: [0, 58, 0] },
      wide: { yaw: 0.44, pitch: 0.17, dist: 420, look: [0, 50, 0] },
      tube: { yaw: 0, pitch: -0.6, dist: 42, look: [0, 114, 6] },
    };
    const c = P[name] || name;
    if (c.yaw !== undefined) { cam.tyaw = c.yaw; cam.tpitch = c.pitch; cam.tdist = c.dist; cam.look = c.look; }
    return { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist };
  },
  time(t, sp) { if (t !== undefined) { simT = ((t % 86400) + 86400) % 86400; evIdx = events.findIndex(e => e.t > simT); if (evIdx < 0) evIdx = 0; lastFill = -1; lastStep = -1; } if (sp !== undefined) { speed = sp; syncChips(); } return { t: simT, speed }; },
  night(v) { sharedMat.uniforms.uNight.value = v; if (starMatRef) starMatRef.uniforms.uOpacity.value = v; },
  cuts(v) { if (v !== undefined && v !== cutsOn) { cutsOn = v; rebuildTower(); syncChips(); } return cutsOn; },
  state() { return { simT, speed, sliders, doors, fill: lastFill, step: lastStep, cutsOn, soundOn, banner: bannerT }; },
  stats() { let tris = 0, quads = 0; for (const r of Object.values(meshes)) { tris += r.m.idx.length / 3; quads += r.m.quads; } return { tris, quads, parts: Object.keys(meshes).length, fps }; },
  events, pose,
  sound(v) { soundOn = !!v; if (v) audio.ensure(); syncChips(); return soundOn; },
  next() { chips.next.click(); },
  probe() {
    const out = {};
    for (const [k, r] of Object.entries(meshes)) {
      const wp = new THREE.Vector3();
      r.mesh.getWorldPosition(wp);
      out[k] = [Math.round(wp.x * 10) / 10, Math.round(wp.y * 10) / 10, Math.round(wp.z * 10) / 10];
    }
    return out;
  },
  pick(px, py) {
    const ray = new THREE.Raycaster();
    const v = new THREE.Vector2((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1);
    ray.setFromCamera(v, camera);
    const hits = ray.intersectObjects(Object.values(meshes).map(r => r.mesh));
    return hits.length ? { key: hits[0].object.userData.key, dist: Math.round(hits[0].distance), point: [Math.round(hits[0].point.x), Math.round(hits[0].point.y), Math.round(hits[0].point.z)] } : null;
  },
};
