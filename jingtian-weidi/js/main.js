// 《经天纬地》浏览器端：three 视图 + 编织动画 + 交互 + 声音
import * as THREE from '../vendor/three.module.js';
import { buildScene, buildDyn, panelPart } from './build.js';
import { makeSchedule, sampleFrame } from './weave.js';
import { poseAll, clothRows, weftPart, rackPose, clothSample } from './pose.js';
import { CAMERAS, LIGHT, WARP, LOOM } from './spec.js';
import { PW, PH, topColor } from './patterns.js';
import { PAL, sampleLight } from './voxel.js';
import * as Snd from './audio.js';

const $ = (id) => document.getElementById(id);
const lerp = (a, b, t) => a + (b - a) * t;

const app = {
  clock: 0, speed: 1, playing: true, patternIdx: 1,
  sound: false, lampOn: true, frameView: true, cordsOn: true,
  hung: [0, null, null], pendingSlot: 1,
  cam: { yaw: 0, pitch: 0, dist: 0, look: [0, 0, 0] }, camTarget: null,
  fps: 0, ready: false, stats: null,
};

// ---------- three 基础 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
$('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b0f);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 2, 3000);
const matStatic = new THREE.MeshBasicMaterial({ vertexColors: true });
const matEmissive = new THREE.MeshBasicMaterial({ vertexColors: true });
const groups = { statics: new THREE.Group(), dyn: new THREE.Group(), rackPanels: new THREE.Group() };
scene.add(groups.statics, groups.dyn, groups.rackPanels);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- 网格装配 ----------
function toGeometry(part) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(part.positions, 3));
  g.setAttribute('color', new THREE.BufferAttribute(part.colors, 3));
  g.setIndex(new THREE.BufferAttribute(part.indices, 1));
  g.computeBoundingSphere();
  return g;
}
function meshOf(part) {
  const m = new THREE.Mesh(toGeometry(part), part.emissive ? matEmissive : matStatic);
  m.userData.key = part.key;
  m.userData.pivot = new THREE.Vector3(part.pivot[0], part.pivot[1], part.pivot[2]);
  m.position.copy(m.userData.pivot);
  return m;
}
function replaceGeometry(mesh, part) {
  mesh.geometry.dispose();
  mesh.geometry = toGeometry(part);
}

const ctx = {};
let sched = null, pattern = null;
const byKey = new Map();

async function frameTick(msg, p) {
  $('lmsg').textContent = msg;
  $('lbar').style.width = Math.round(p * 100) + '%';
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
}

async function boot() {
  await frameTick('伐木凿榫、立柱起架…', 0.05);
  const built = buildScene();
  Object.assign(ctx, built.ctx);
  for (const p of built.statics) groups.statics.add(meshOf(p));
  app.stats = built.stats;
  await frameTick('挂花本、上经线…', 0.8);
  hangFinished(0, 0);                       // 架上先挂一匹（开局构图完整）
  buildPatternMeshes(app.patternIdx);
  await frameTick('上机…', 0.94);
  const c = CAMERAS.cover;
  app.cam = { yaw: c.yaw, pitch: c.pitch, dist: c.dist, look: [...c.look] };
  app.camTarget = { yaw: c.yaw, pitch: c.pitch, dist: c.dist, look: [...c.look] };
  for (const b of document.querySelectorAll('#cam button')) b.classList.toggle('on', b.dataset.cam === 'cover');
  app.ready = true;
  $('loading').classList.add('gone');
  setTimeout(() => { const l = $('loading'); if (l) l.remove(); }, 900);
}

function buildPatternMeshes(k) {
  for (const m of [...groups.dyn.children]) { groups.dyn.remove(m); m.geometry.dispose(); }
  byKey.clear();
  const { pattern: pat, parts } = buildDyn(ctx, k);
  pattern = pat;
  sched = makeSchedule(pat);
  for (const p of parts) {
    const m = meshOf(p);
    groups.dyn.add(m);
    byKey.set(p.key, m);
  }
  const pm = meshOf(panelPart(ctx, pat, 'flypanel-' + k));
  pm.visible = false;
  pm.userData.patternIdx = k;
  groups.dyn.add(pm);
  byKey.set('panel', pm);
  app.clock = 0;
  lastRows = -1; lastStrips = '';
  $('sPattern').textContent = pat.name;
}

function hangFinished(patIdx, slot) {
  const pat = buildDyn(ctx, patIdx).pattern;
  const m = meshOf(panelPart(ctx, pat, 'hung' + slot + '-' + patIdx));
  const rp = rackPose(slot);
  m.position.set(rp.t[0], rp.t[1], rp.t[2]);
  m.rotation.set(rp.r[0], rp.r[1], rp.r[2]);
  groups.rackPanels.add(m);
  app.hung[slot] = patIdx;
}

// ---------- 相机 ----------
function setCamera(name) {
  const c = CAMERAS[name];
  if (!c) return;
  app.camTarget = { yaw: c.yaw, pitch: c.pitch, dist: c.dist, look: [...c.look] };
  for (const b of document.querySelectorAll('#cam button')) b.classList.toggle('on', b.dataset.cam === name);
}
function updateCamera(dt) {
  const t = app.camTarget; if (!t) return;
  const k = 1 - Math.pow(0.0022, dt);
  app.cam.yaw = lerp(app.cam.yaw, t.yaw, k);
  app.cam.pitch = lerp(app.cam.pitch, t.pitch, k);
  app.cam.dist = lerp(app.cam.dist, t.dist, k);
  for (let i = 0; i < 3; i++) app.cam.look[i] = lerp(app.cam.look[i], t.look[i], k);
  const { yaw, pitch, dist, look } = app.cam;
  camera.position.set(
    look[0] + dist * Math.sin(yaw) * Math.cos(pitch),
    look[1] + dist * Math.sin(pitch),
    look[2] + dist * Math.cos(yaw) * Math.cos(pitch));
  camera.lookAt(look[0], look[1], look[2]);
}

// ---------- 交互 ----------
let drag = null;
function firstGesture() {
  Snd.initSound();
  if (!app.sound) {
    app.sound = true;
    $('bSound').classList.add('on');
    Snd.ambient(app.playing);
  }
}
renderer.domElement.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, moved: 0, t: performance.now() };
  try { renderer.domElement.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  drag.x = e.clientX; drag.y = e.clientY;
  app.camTarget.yaw -= dx * 0.0045;
  app.camTarget.pitch = Math.max(-0.34, Math.min(1.34, app.camTarget.pitch + dy * 0.0035));
});
renderer.domElement.addEventListener('pointerup', (e) => {
  const quick = drag && drag.moved < 6 && performance.now() - drag.t < 380;
  const wasDrag = drag && drag.moved >= 6;
  drag = null;
  firstGesture();
  if (!quick) return;
  const r = renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([groups.dyn, groups.statics, groups.rackPanels], true);
  for (const h of hits) {
    const k = h.object.userData.key || '';
    if (k.startsWith('tape.cards')) { cyclePattern(); return; }
    break;
  }
  if (hits.length) togglePlay();
});
renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  app.camTarget.dist = Math.max(70, Math.min(900, app.camTarget.dist * (1 + Math.sign(e.deltaY) * 0.08)));
}, { passive: false });
addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); firstGesture(); }
  else if (e.key === '1') setCamera('cover');
  else if (e.key === '2') setCamera('fell');
  else if (e.key === '3') setCamera('tape');
  else if (e.key === '4') setCamera('tower');
  else if (e.key === '5') setCamera('rack');
  else if (e.key === 'l' || e.key === 'L') toggleLamp();
});

function togglePlay() {
  app.playing = !app.playing;
  $('bPlay').textContent = app.playing ? '停机' : '开织';
  if (app.sound) Snd.ambient(app.playing);
}
function cyclePattern() {
  app.patternIdx = (app.patternIdx + 1) % 3;
  buildPatternMeshes(app.patternIdx);
  app.playing = true;
  $('bPlay').textContent = '停机';
}
function toggleLamp() {
  app.lampOn = !app.lampOn;
  $('bLamp').classList.toggle('on', !app.lampOn);
  if (app.lampOn) { matStatic.color.setRGB(1, 1, 1); matEmissive.color.setRGB(1, 1, 1); }
  else { matStatic.color.setRGB(0.30, 0.34, 0.44); matEmissive.color.setRGB(0.52, 0.5, 0.56); }
  const flame = byKey.get('lamp.flame');
  if (flame) flame.visible = app.lampOn;
}
const FRAME_OFF = /^(loom\.post|loom\.rail|loom\.brace|loom\.roof|loom\.tower|loom\.beaterAxle|tape\.house|tape\.bracket|tape\.gate|wall\.post|dryrack|shelf|shuttleRack)$/;
function toggleFrame() {
  app.frameView = !app.frameView;
  $('bFrame').classList.toggle('on', !app.frameView);
  for (const m of groups.statics.children) m.visible = app.frameView || !FRAME_OFF.test(m.userData.key || '');
  for (const key of ['tape.roll.L', 'tape.roll.R']) { const m = byKey.get(key); if (m) m.visible = app.frameView; }
}
function toggleCords() {
  app.cordsOn = !app.cordsOn;
  $('bCord').classList.toggle('on', !app.cordsOn);
  for (const m of groups.statics.children) {
    const k = m.userData.key || '';
    if (k === 'harness.cord' || k === 'harness.fan' || k === 'harness.hook' || k === 'harness.bar') m.visible = app.cordsOn;
  }
}
function toggleSound() {
  if (!Snd.soundReady()) firstGesture();
  else {
    app.sound = !app.sound;
    $('bSound').classList.toggle('on', app.sound);
    Snd.ambient(app.sound && app.playing);
  }
}

// ---------- 主循环 ----------
let last = performance.now(), fpsAcc = 0, fpsN = 0;
let lastRows = -1, lastStrips = '';
let sPhase = '', sPick = -1, sFlight = -1, sStatus = '';
function loop() {
  requestAnimationFrame(loop);
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!app.ready || !sched) { renderer.render(scene, camera); return; }
  if (app.playing) app.clock += dt * app.speed;
  if (app.clock >= sched.duration) {
    const pm = byKey.get('panel');
    if (pm && pm.userData.patternIdx !== undefined) hangFinished(pm.userData.patternIdx, app.pendingSlot);
    app.pendingSlot = (app.pendingSlot + 1) % 3;
    app.patternIdx = (app.patternIdx + 1) % 3;
    buildPatternMeshes(app.patternIdx);
  }
  const f = sampleFrame(sched, app.clock);
  const poses = poseAll(f, pattern);
  for (const [key, pz] of poses) {
    const m = byKey.get(key);
    if (!m) continue;
    const p = m.userData.pivot;
    m.position.set(p.x + pz.t[0], p.y + pz.t[1], p.z + pz.t[2]);
    m.rotation.set(pz.r[0], pz.r[1], pz.r[2]);
    m.scale.set(pz.s[0], pz.s[1], pz.s[2]);
  }
  if (f.rowsPlaced !== lastRows) {
    lastRows = f.rowsPlaced;
    const cm = byKey.get('cloth');
    if (cm) replaceGeometry(cm, clothRows(ctx, pattern, f.rowsPlaced));
  }
  const wm = byKey.get('weft');
  if (wm) {
    const sig = f.strips.map(s => s.c + s.i0 + '-' + s.i1).join('|') + (f.weftHidden ? 'h' : '');
    if (sig !== lastStrips) { lastStrips = sig; replaceGeometry(wm, weftPart(ctx, f)); }
    wm.position.set(0, f.weftY, f.weftZ);
  }
  const pm = byKey.get('panel');
  if (pm) pm.visible = !!f.panel;
  if (app.sound) routeSounds(f);
  updateCamera(dt);
  renderer.render(scene, camera);

  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) { app.fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  const ph = { lift: '提综', fly: '引纬', beat: '打纬', advance: '卷布', rest: '歇', hold: '成匹', unload: '落机' }[f.phase] || '';
  $('sPhase').textContent = app.playing ? (f.status === 'unload' ? '落机' : ph) : '停机';
  $('sStat').textContent = app.fps.toFixed(0) + ' fps · 三角 ' + (app.stats ? (app.stats.tris / 1000).toFixed(0) : 0) + 'k';
  $('sPick').textContent = `第 ${Math.min(PH, f.rowsPlaced)} / ${PH} 纬`;
  $('sBar').style.width = Math.min(100, app.clock / sched.total * 100).toFixed(1) + '%';
  sPhase = f.phase; sPick = f.pick; sStatus = f.status;
  sFlight = f.flight ? f.flight.i : -1;
}
function routeSounds(f) {
  if (f.status === 'weaving') {
    if (f.phase === 'beat' && sPhase !== 'beat') Snd.thud();
    if (f.phase === 'advance' && sPhase !== 'advance') Snd.click(2);
    if (f.flight && f.flight.i !== sFlight && f.flight.kind === 'ground') Snd.whoosh(0.3, 0.26);
    if (f.flight && f.flight.i !== sFlight && f.flight.kind === 'motif') Snd.whoosh(0.16, 0.2);
  } else if (f.status === 'unload' && sStatus !== 'unload') Snd.chime();
}

// ---------- UI ----------
$('bPlay').onclick = () => { firstGesture(); togglePlay(); };
$('bNext').onclick = () => { firstGesture(); cyclePattern(); };
$('bFast').onclick = () => { firstGesture(); app.clock = Math.max(0, sched.total - 0.02); lastRows = -1; };
$('bFrame').onclick = () => toggleFrame();
$('bCord').onclick = () => toggleCords();
$('bLamp').onclick = () => toggleLamp();
$('bSound').onclick = () => toggleSound();
for (const b of document.querySelectorAll('#cam button')) b.onclick = () => setCamera(b.dataset.cam);
for (const b of document.querySelectorAll('#panel .spd')) b.onclick = () => {
  app.speed = parseFloat(b.dataset.spd);
  for (const o of document.querySelectorAll('#panel .spd')) o.classList.toggle('on', o === b);
};

// ---------- 调试接口（离线断言用） ----------
window.JT = {
  ready: () => app.ready,
  stats: () => app.stats,
  frame: () => (sched ? sampleFrame(sched, app.clock) : null),
  setTime: (t) => { app.clock = t; lastRows = -1; lastStrips = ''; app.playing = false; $('bPlay').textContent = '开织'; },
  time: () => app.clock,
  total: () => (sched ? sched.total : 0),
  duration: () => (sched ? sched.duration : 0),
  speed: (v) => { app.speed = v; },
  play: (b) => { app.playing = b; $('bPlay').textContent = b ? '停机' : '开织'; },
  playing: () => app.playing,
  pattern: (k) => { if (k !== undefined) { app.patternIdx = k; buildPatternMeshes(k); } return app.patternIdx; },
  patternName: () => (pattern ? pattern.name : ''),
  liftSets: () => (pattern ? pattern.liftSets : null),
  camera: (n) => setCamera(n),
  look: () => ({ ...app.cam }),
  toggleFrame, toggleCords, toggleLamp, toggleSound,
  lampOn: () => app.lampOn,
  keys: () => [...byKey.keys()],
  counts: () => ({
    statics: groups.statics.children.filter(m => m.visible).length,
    dyn: groups.dyn.children.length,
    rack: groups.rackPanels.children.length,
    quads: [...groups.statics.children, ...groups.dyn.children, ...groups.rackPanels.children]
      .reduce((a, m) => a + (m.geometry.index ? m.geometry.index.count / 6 : 0), 0),
  }),
  frustum: (on) => { for (const g of [groups.statics, groups.dyn, groups.rackPanels]) g.traverse(o => { o.frustumCulled = on; }); },
  clothCheck: () => {
    const part = clothRows(ctx, pattern, PH);
    const grid = clothSample(part, pattern);
    const unit = (v) => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
    let tested = 0, bad = 0, worst = 0, missing = 0;
    for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
      tested++;
      const got = grid[j][i];
      if (!got) { missing++; bad++; continue; }
      const name = topColor(pattern, i, j);
      const base = PAL.linear[PAL.idx['silk.' + name] - 1];
      const lt = sampleLight(ctx.v, ctx.vis, WARP.x0 + WARP.pitch * i, LOOM.warpY, LOOM.fellZ - j, [0, 1, 0]);
      const want = unit([base[0] * lt[0], base[1] * lt[1], base[2] * lt[2]]);
      const g = unit(got);
      const d = Math.hypot(g[0] - want[0], g[1] - want[1], g[2] - want[2]);
      worst = Math.max(worst, d);
      if (d > 0.08) bad++;
    }
    return { tested, bad, worst: +worst.toFixed(3), missing };
  },
  rowTopColors: (j) => { const out = []; for (let i = 0; i < PW; i++) out.push(topColor(pattern, i, j)); return out; },
  clothRowCount: () => (byKey.get('cloth') ? byKey.get('cloth').geometry.index.count : 0),
  dumpCloth: (n = 6) => {
    const cm = byKey.get('cloth');
    if (!cm) return null;
    const pos = cm.geometry.getAttribute('position');
    const out = [];
    for (let q = 0; q + 3 < pos.count && out.length < n; q += 4) {
      out.push([0, 1, 2, 3].map(k => [pos.getX(q + k), pos.getY(q + k), pos.getZ(q + k)].map(v => +v.toFixed(2))));
    }
    return { count: pos.count, meshPos: cm.position.toArray(), out };
  },
  topName: (i, j) => topColor(pattern, i, j),
  palette: (name) => PAL.linear[PAL.idx['silk.' + name] - 1],
  weftStrips: () => { const f = sched ? sampleFrame(sched, app.clock) : null; return f ? f.strips.map(s => [s.c, s.i0, s.i1]) : null; },
  pick: (nx, ny) => {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const hits = ray.intersectObjects([groups.dyn, groups.statics, groups.rackPanels], true);
    return hits.length ? { key: hits[0].object.userData.key, d: +hits[0].distance.toFixed(1) } : null;
  },
  probe: () => ({
    phase: sPhase, fps: app.fps, clock: app.clock, playing: app.playing,
    rows: lastRows, pattern: app.patternIdx, sound: app.sound, lamp: app.lampOn,
    cam: { yaw: +app.cam.yaw.toFixed(3), dist: +app.cam.dist.toFixed(1) },
  }),
};
loop();
boot();