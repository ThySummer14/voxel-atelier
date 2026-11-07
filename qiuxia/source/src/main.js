import * as THREE from 'three';
import { World } from './core/world.js';
import { meshWorld } from './core/mesher.js';
import { NX, NY, NZ, TRAIN_P_MIN, TRAIN_P_MAX, TRAIN_SPEED } from './build/layout.js';
import { computeHeightField, buildTerrain, buildEmbankment } from './build/terrain.js';
import { buildViaduct } from './build/viaduct.js';
import { buildTunnels, buildPortals, buildTrack } from './build/track.js';
import { buildFlora } from './build/flora.js';
import { buildStation } from './build/station.js';
import { buildDetails } from './build/details.js';
import { buildLocomotive, DRIVER_R } from './build/locomotive.js';
import { createStage } from './render/scene.js';
import { createSky, updateSky } from './render/sky.js';
import { createWater, updateWater } from './render/water.js';
import { createParticles } from './render/particles.js';
import { createSoundscape } from './audio/soundscape.js';
import { OrbitCamera, VIEW_NAMES } from './render/camera.js';
import { sampleTime, formatClock } from './render/timeofday.js';

const canvas = document.getElementById('scene');
const loaderEl = document.getElementById('loader');
const fillEl = document.getElementById('loader-fill');
const pctEl = document.getElementById('loader-pct');
const clockEl = document.getElementById('clock');
const timeEl = document.getElementById('time');

const stage = createStage(canvas);
const sky = createSky(stage.scene);
const water = createWater(stage.scene);
const particles = createParticles(stage.scene);
const audio = createSoundscape();
const orbit = new OrbitCamera(stage.camera, canvas);

const world = new World(NX, NY, NZ);
let hf = null;
let meshed = null;
let worldMeshes = null;
let loco = null;

let hour = 17.3;
let autoCycle = false;
let running = true;
let frozen = false;
let simT = 0;
let trainP = 352;
let uiManualHide = false;
let idleT = 0;
let fps = 60;
let lastChuff = -1;
let nextWhistle = 14;

const tick = () => new Promise((r) => requestAnimationFrame(() => r()));
function pct(v, label) {
  fillEl.style.width = v + '%';
  pctEl.textContent = Math.round(v) + '%';
}

async function build() {
  pct(6); await tick();
  hf = computeHeightField();
  pct(14); await tick();
  buildTerrain(world, hf);
  pct(34); await tick();
  buildEmbankment(world, hf);
  pct(38); await tick();
  buildViaduct(world);
  pct(46); await tick();
  buildTunnels(world);
  pct(56); await tick();
  buildPortals(world);
  pct(62); await tick();
  buildTrack(world);
  pct(54); await tick();
  buildFlora(world, hf);
  pct(64); await tick();
  buildStation(world, hf);
  pct(72); await tick();
  buildDetails(world, hf);
  pct(76); await tick();
  meshed = meshWorld(world);
  pct(86); await tick();
  worldMeshes = stage.addMeshed(meshed, { name: 'world' });
  pct(90); await tick();
  loco = buildLocomotive(stage);
  loco.update(trainP, trainP / DRIVER_R);
  pct(95); await tick();
  orbit.setView('overview', true, trainP);
  pct(100); await tick();
  loaderEl.classList.add('done');
  window.QX.ready = true;
}

// ---------- UI ----------
const viewButtons = [...document.querySelectorAll('#views button')];
function selectView(name, instant = false) {
  orbit.setView(name, instant, trainP);
  viewButtons.forEach((b) => b.classList.toggle('on', b.dataset.view === name));
}
viewButtons.forEach((b) => b.addEventListener('click', () => selectView(b.dataset.view)));

const btnRun = document.getElementById('btn-run');
function setRunning(v) {
  running = v;
  document.getElementById('ico-pause').style.display = v ? '' : 'none';
  document.getElementById('ico-play').style.display = v ? 'none' : '';
  btnRun.classList.toggle('on', !v);
}
btnRun.addEventListener('click', () => setRunning(!running));

timeEl.addEventListener('input', () => {
  hour = parseFloat(timeEl.value);
  clockEl.textContent = formatClock(hour);
});

const btnHide = document.getElementById('btn-hide');
btnHide.addEventListener('click', () => { uiManualHide = true; });

let soundOn = false;
const btnSound = document.getElementById('btn-sound');
btnSound.addEventListener('click', () => {
  soundOn = !soundOn;
  document.getElementById('ico-wave').style.display = soundOn ? '' : 'none';
  document.getElementById('ico-mute').style.display = soundOn ? 'none' : '';
  btnSound.classList.toggle('on', soundOn);
  if (window.QX.audio) window.QX.audio.setEnabled(soundOn);
});

addEventListener('keydown', (e) => {
  idleT = 0;
  if (e.code === 'Space') { e.preventDefault(); setRunning(!running); }
  else if (e.key >= '1' && e.key <= '7') selectView(VIEW_NAMES[+e.key - 1]);
  else if (e.key === 'h' || e.key === 'H') uiManualHide = !uiManualHide;
  else if (e.key === 'c' || e.key === 'C') autoCycle = !autoCycle;
  else if (e.key === 'w' || e.key === 'W') audio.whistle();
});
addEventListener('pointermove', () => { idleT = 0; });
addEventListener('pointerdown', () => { idleT = 0; });

// ---------- debug / verification API ----------
window.QX = {
  ready: false,
  stats: () => ({
    fps: Math.round(fps),
    triangles: stage.renderer.info.render.triangles,
    calls: stage.renderer.info.render.calls,
    voxels: world.solidCount,
    faces: meshed ? meshed.faces : 0,
    trainP: +trainP.toFixed(2),
    hour: +hour.toFixed(2),
    view: orbit.view,
  }),
  setView: (n, instant = true) => selectView(n, instant),
  setTime: (h) => { hour = h; timeEl.value = h; clockEl.textContent = formatClock(h); },
  setTrain: (p) => { trainP = p; },
  freeze: (v) => { frozen = v; if (v) orbit.spin(false); },
  spin: (v) => orbit.spin(v),
  play: () => setRunning(true),
  pause: () => setRunning(false),
  cycle: (v) => { autoCycle = v; },
  hideUI: (v) => { uiManualHide = v; },
  whistle: () => audio.whistle(),
  audio,
  pick: (x, y) => {
    const r = new THREE.Raycaster();
    r.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), stage.camera);
    const hits = r.intersectObjects(stage.scene.children, true);
    for (const h of hits) {
      if (h.object.name && h.object.name.includes(':')) {
        return { name: h.object.name, point: h.point.toArray().map((v) => +v.toFixed(1)) };
      }
    }
    return null;
  },
};

// ---------- loop ----------
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  stage.renderer.info.reset();
  fps = fps * 0.92 + (1 / Math.max(dt, 1e-4)) * 0.08;
  if (!frozen) {
    simT += dt;
    if (running) {
      trainP += TRAIN_SPEED * dt;
      if (trainP > TRAIN_P_MAX) trainP = TRAIN_P_MIN;
    }
    if (autoCycle) {
      hour = (hour + dt * 0.35) % 24;
      timeEl.value = hour;
      clockEl.textContent = formatClock(hour);
    }
  }
  if (loco) loco.update(trainP, trainP / DRIVER_R);
  const p = sampleTime(hour);
  // exhaust chuffs: 4 per driver revolution, shared by smoke and sound
  if (running && !frozen) {
    const idx = Math.floor((trainP / DRIVER_R) / (Math.PI / 2));
    if (idx !== lastChuff) {
      if (lastChuff !== -1) { particles.chuff(trainP, TRAIN_SPEED); audio.chuff(1); }
      lastChuff = idx;
    }
    if (simT > nextWhistle) { audio.whistle(); nextWhistle = simT + 20 + Math.random() * 12; }
  }
  particles.update(dt, { running: running && !frozen, trainP, day: p.day, t: simT, speed: TRAIN_SPEED });
  audio.update(dt, { running: running && !frozen, trainP, day: p.day, t: simT });
  idleT += dt;
  document.body.classList.toggle('ui-hidden', uiManualHide || idleT > 6);
  stage.applyTime(p);
  updateSky(sky, p, simT);
  updateWater(water, p, simT, stage.camera);
  orbit.update(dt, trainP);
  stage.composer.render();
}

build().then(() => {
  clockEl.textContent = formatClock(hour);
  frame();
});