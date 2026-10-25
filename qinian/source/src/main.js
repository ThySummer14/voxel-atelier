import * as THREE from 'three';
import './style.css';
import { Engine, loadModel } from './engine.js';
import { MOODS, VIEWS, sunVector } from './moods.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const HOTSPOTS = [
  { id: 1, title: '鎏金宝顶', p: [0, 36.2, 0], view: 'crown', text: '铜胎鎏金，总高约 6 米。宝珠腰径 1.98 米、下口 1.23 米，坐在蓝琉璃须弥座上。' },
  { id: 2, title: '九龙华带匾', p: [0, 24.6, 8.4], view: 'crown', text: '上檐下南向悬匾，青底金书「祈年殿」。1935 年大修时只留汉字，略去满文。' },
  { id: 3, title: '三重檐', p: [-9.2, 19.4, 9.6], view: 'front', text: '蓝琉璃瓦圆攒尖顶。明嘉靖时上青、中黄、下绿；乾隆十六年（1751）统一改为青色，以象天。' },
  { id: 4, title: '斗栱', p: [9.0, 13.15, 9.0], view: 'eaves', text: '下檐五踩、中檐七踩、上檐九踩，三层共 180 攒；栱眼壁朱地金焰。' },
  { id: 5, title: '龙凤和玺', p: [-9.3, 11.9, 8.4], view: 'eaves', text: '额枋青绿相间，方心行龙、垫板朱地金龙，沥粉贴金——彩画的最高等级。' },
  { id: 6, title: '二十八柱', p: [0, 8.4, 12.0], view: 'section', text: '内圈 4 根龙井柱象四季，中圈 12 金柱象十二月，外圈 12 檐柱象十二时辰；合为二十八宿。' },
  { id: 7, title: '汉白玉三台', p: [-26.5, 4.9, 29.5], view: 'all', text: '祈谷坛三层，径 90.3 / 79.3 / 68.2 米；每层栏板 108 块，八出陛另有 96 块，共 420 块。' },
  { id: 8, title: '御路石雕', p: [0, 2.4, 42.6], view: 'front', text: '南北御路各三帧：自上而下为双龙、双凤、山海祥云；上层望柱蟠龙、螭首出水。' },
];

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

async function boot() {
  const bar = $('#load-bar');
  const pct = $('#load-pct');
  const expect = 4.6e6;
  let model;
  try {
    model = await loadModel('./data', (got) => {
      const p = Math.min(0.99, got / expect);
      bar.style.transform = `scaleX(${p})`;
      pct.textContent = String(Math.round(p * 100)).padStart(2, '0');
    });
  } catch (err) {
    $('#loader').classList.add('error');
    $('#load-note').textContent = '模型加载失败，请刷新重试。';
    console.error(err);
    return;
  }
  const canvas = $('#scene');
  let engine;
  try {
    engine = new Engine(canvas, model, { mobile });
  } catch (err) {
    $('#loader').classList.add('error');
    $('#load-note').textContent = '当前浏览器不支持 WebGL 2。';
    console.error(err);
    return;
  }
  window.__engine = engine;
  engine.still = params.has('still');
  if (engine.still) engine.time = 7.3;
  const stats = model.meta.stats;
  $('#voxel-count').textContent = stats.visible.toLocaleString('en-US');
  const [NX, NY, NZ] = model.meta.dims;
  $('#voxel-dims').textContent = `${NX} × ${NZ} × ${NY}`;

  // ---------------------------------------------------------------- moods
  const cur = {};
  const lerpTo = { t: 1, from: null, to: null };
  function readMood(m) {
    return {
      sun: new THREE.Vector3(...sunVector(...m.sun)),
      sunColor: new THREE.Color(...m.sunColor),
      zenith: new THREE.Color(m.zenith),
      horizon: new THREE.Color(m.horizon),
      ground: new THREE.Color(m.ground),
      skyAmb: new THREE.Color(m.skyAmb),
      skyGround: new THREE.Color(m.skyGround),
      fogColor: new THREE.Color(m.fogColor),
      groundColor: new THREE.Color(m.groundColor),
      ambient: m.ambient, fog: m.fog, exposure: m.exposure, saturation: m.saturation,
      night: m.night, flood: m.flood, snow: m.snow, bloom: m.bloom, sunSize: m.sunSize, skyBright: m.skyBright, shadowFloor: m.shadowFloor,
    };
  }
  function applyMood(s) {
    const u = engine.uniforms;
    engine.setSun(s.sun);
    u.uSunColor.value.copy(s.sunColor);
    u.uZenith.value.copy(s.zenith);
    u.uHorizon.value.copy(s.horizon);
    u.uGround.value.copy(s.ground);
    u.uSkyAmb.value.copy(s.skyAmb);
    engine.skyUniforms.uGround.value.copy(s.skyGround);
    engine.skyUniforms.uSunColor.value.copy(s.sunColor).multiplyScalar(0.3);
    engine.skyUniforms.uSunSize.value = s.sunSize;
    engine.skyUniforms.uSkyBright.value = s.skyBright;
    engine.groundUniforms.uShadowStrength.value = s.shadowFloor;
    u.uFogColor.value.copy(s.fogColor);
    engine.groundUniforms.uColor.value.copy(s.groundColor);
    u.uAmbient.value = s.ambient;
    u.uFogDensity.value = s.fog;
    u.uSaturation.value = s.saturation;
    u.uNight.value = s.night;
    u.uFlood.value = s.flood;
    u.uSnow.value = s.snow;
    engine.renderer.toneMappingExposure = s.exposure;
    engine.bloom.strength = s.bloom;
    engine.snowPts.visible = s.snow > 0.02;
    engine.snowUniforms.uOpacity.value = Math.min(1, s.snow * 1.2);
    engine.dirty = true;
  }
  function mix(a, b, t) {
    const o = {};
    for (const k in a) {
      if (a[k] && a[k].isColor) o[k] = a[k].clone().lerp(b[k], t);
      else if (a[k] && a[k].isVector3) o[k] = a[k].clone().lerp(b[k], t).normalize();
      else o[k] = a[k] + (b[k] - a[k]) * t;
    }
    return o;
  }
  let moodKey = MOODS[params.get('mood')] ? params.get('mood') : 'qing';
  let state = readMood(MOODS[moodKey]);
  applyMood(state);
  function setMood(key, instant) {
    if (!MOODS[key]) return;
    moodKey = key;
    document.body.dataset.ui = MOODS[key].ui;
    document.querySelectorAll('[data-mood]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mood === key ? 'true' : 'false'));
    $('#mood-note').textContent = MOODS[key].note;
    const target = readMood(MOODS[key]);
    if (instant || reduced) { state = target; applyMood(state); return; }
    lerpTo.from = state; lerpTo.to = target; lerpTo.t = 0;
  }

  // ---------------------------------------------------------------- views
  const fly = { t: 1, p0: new THREE.Vector3(), p1: new THREE.Vector3(), t0: new THREE.Vector3(), t1: new THREE.Vector3(), fov0: 30, fov1: 30, dur: 1.6 };
  function setFov(f) {
    if (Math.abs(engine.camera.fov - f) < 1e-3) return;
    engine.camera.fov = f;
    engine.camera.updateProjectionMatrix();
  }
  function viewPose(v) {
    const a = (v.az * Math.PI) / 180, e = (v.el * Math.PI) / 180;
    const t = new THREE.Vector3(...v.target);
    let dist = v.dist;
    if (engine.camera.aspect < 0.9 && (v.id === 'all' || v.id === 'plan' || v.id === 'front' || v.id === 'section')) dist *= 1.0 + (0.9 - engine.camera.aspect) * 1.25;
    const p = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)).multiplyScalar(dist).add(t);
    return [p, t];
  }
  let viewId = 'all';
  function setView(id, instant) {
    const v = VIEWS.find((x) => x.id === id);
    if (!v) return;
    viewId = id;
    document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === id ? 'true' : 'false'));
    setClip(!!v.clip);
    const [p, t] = viewPose(v);
    if (instant || reduced) {
      engine.camera.position.copy(p);
      engine.controls.target.copy(t);
      setFov(v.fov || 30);
      fly.t = 1;
      engine.dirty = true;
      return;
    }
    fly.p0.copy(engine.camera.position); fly.t0.copy(engine.controls.target);
    fly.p1.copy(p); fly.t1.copy(t);
    fly.fov0 = engine.camera.fov; fly.fov1 = v.fov || 30;
    const d = fly.p0.distanceTo(fly.p1);
    fly.dur = Math.min(2.4, 1.0 + d / 160);
    fly.t = 0;
  }
  let clipOn = false;
  function setClip(on) {
    clipOn = on;
    engine.uniforms.uClip.value = on ? 1 : 0;
    engine.voxelMat.side = on ? THREE.DoubleSide : THREE.FrontSide;
    engine.voxelMat.needsUpdate = true;
    document.body.classList.toggle('is-section', on);
    engine.dirty = true;
  }
  function updateClipPlanes() {
    if (!clipOn) return;
    // wedge facing the camera: remove the quarter between two planes through the axis
    const c = engine.camera.position;
    const az = Math.atan2(c.x, c.z);
    const a1 = az - Math.PI / 4, a2 = az + Math.PI / 4;
    engine.uniforms.uClipN1.value.set(Math.sin(a1), 0, Math.cos(a1));
    engine.uniforms.uClipN2.value.set(Math.sin(a2), 0, Math.cos(a2));
  }

  // ---------------------------------------------------------------- UI wiring
  const moodWrap = $('#moods');
  for (const [k, m] of Object.entries(MOODS)) {
    const b = el('button', 'mood', `<i class="mood-dot mood-${k}" aria-hidden="true"></i><span>${m.label}</span><small>${m.en}</small>`);
    b.type = 'button';
    b.dataset.mood = k;
    b.addEventListener('click', () => setMood(k));
    moodWrap.appendChild(b);
  }
  const viewWrap = $('#views');
  VIEWS.forEach((v, i) => {
    const b = el('button', 'view', `<span class="view-no">0${i + 1}</span>${v.label}`);
    b.type = 'button';
    b.dataset.view = v.id;
    b.title = `${v.en} · ${i + 1}`;
    b.addEventListener('click', () => setView(v.id));
    viewWrap.appendChild(b);
  });
  const hsLayer = $('#hotspots');
  const card = $('#hs-card');
  let activeHs = null;
  const hsEls = HOTSPOTS.map((h) => {
    const b = el('button', 'hs', `<span>${h.id}</span>`);
    b.type = 'button';
    b.setAttribute('aria-label', h.title);
    b.addEventListener('click', (e) => { e.stopPropagation(); openHotspot(h); });
    hsLayer.appendChild(b);
    return b;
  });
  function openHotspot(h) {
    activeHs = h;
    card.querySelector('.hs-no').textContent = String(h.id).padStart(2, '0');
    card.querySelector('h3').textContent = h.title;
    card.querySelector('p').textContent = h.text;
    card.classList.add('show');
    hsEls.forEach((b, i) => b.classList.toggle('on', HOTSPOTS[i] === h));
    if (h.view && h.view !== viewId) setView(h.view);
  }
  $('#hs-close').addEventListener('click', () => { card.classList.remove('show'); activeHs = null; hsEls.forEach((b) => b.classList.remove('on')); });
  $('#toggle-hs').addEventListener('click', () => {
    const on = !document.body.classList.contains('no-hs');
    document.body.classList.toggle('no-hs', on);
    $('#toggle-hs').setAttribute('aria-pressed', on ? 'false' : 'true');
  });
  const dlg = $('#notes');
  $('#open-notes').addEventListener('click', () => dlg.showModal());
  $('#close-notes').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('#capture').addEventListener('click', () => {
    engine.composer.render();
    const a = document.createElement('a');
    a.download = `祈年-${moodKey}.png`;
    a.href = engine.renderer.domElement.toDataURL('image/png');
    a.click();
  });
  $('#focus').addEventListener('click', () => document.body.classList.toggle('pure'));
  window.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('dialog')) return;
    const n = Number(e.key);
    if (n >= 1 && n <= VIEWS.length) setView(VIEWS[n - 1].id);
    const mk = { q: 'qing', w: 'mu', e: 'ye', r: 'xue' }[e.key.toLowerCase()];
    if (mk) setMood(mk);
    if (e.key.toLowerCase() === 'h') document.body.classList.toggle('pure');
  });
  canvas.addEventListener('dblclick', () => setView('all'));
  let idle = 0;
  const poke = () => { idle = 0; fly.t = fly.t < 1 ? fly.t : 1; };
  canvas.addEventListener('pointerdown', () => { poke(); fly.t = 1; });
  canvas.addEventListener('wheel', () => { poke(); fly.t = 1; }, { passive: true });

  // ---------------------------------------------------------------- start
  setMood(moodKey, true);
  setView(VIEWS.find((v) => v.id === params.get('view')) ? params.get('view') : 'all', true);
  // ?cam=px,py,pz,tx,ty,tz[,fov] pins an exact camera (used to match reference photographs)
  const cam = (params.get('cam') || '').split(',').map(Number);
  if (cam.length >= 6 && cam.every(Number.isFinite)) {
    engine.camera.position.set(cam[0], cam[1], cam[2]);
    engine.controls.target.set(cam[3], cam[4], cam[5]);
    if (cam[6]) { engine.camera.fov = cam[6]; engine.camera.updateProjectionMatrix(); }
    engine.dirty = true;
  }
  if (params.has('pure')) document.body.classList.add('pure');
  const skipIntro = params.has('still') || reduced;
  const intro = { t: skipIntro ? 1 : 0 };
  engine.uniforms.uReveal.value = skipIntro ? 80 : -3.2;
  engine.animating = !skipIntro;
  $('#loader').classList.add('done');
  setTimeout(() => { $('#loader').style.display = 'none'; }, 1400);
  document.body.classList.add('ready');

  const proj = new THREE.Vector3();
  let last = performance.now();
  let slow = 0, fast = 0;
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (intro.t < 1) {
      intro.t = Math.min(1, intro.t + dt / 3.4);
      const e = 1 - Math.pow(1 - intro.t, 2.2);
      engine.uniforms.uReveal.value = -3.2 + e * 44;
      engine.uniforms.uReveal.value = intro.t >= 1 ? 80 : engine.uniforms.uReveal.value;
      engine.shadowDirty = intro.t >= 1 || Math.floor(intro.t * 8) !== Math.floor((intro.t - dt / 3.4) * 8);
      engine.animating = intro.t < 1;
    }
    if (lerpTo.t < 1) {
      lerpTo.t = Math.min(1, lerpTo.t + dt / 1.25);
      const e = lerpTo.t * lerpTo.t * (3 - 2 * lerpTo.t);
      state = mix(lerpTo.from, lerpTo.to, e);
      applyMood(state);
    }
    if (fly.t < 1) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const e = fly.t < 0.5 ? 4 * fly.t ** 3 : 1 - Math.pow(-2 * fly.t + 2, 3) / 2;
      engine.camera.position.lerpVectors(fly.p0, fly.p1, e);
      engine.controls.target.lerpVectors(fly.t0, fly.t1, e);
      setFov(fly.fov0 + (fly.fov1 - fly.fov0) * e);
      engine.dirty = true;
    }
    idle += dt;
    if (params.has('turntable') || (idle > 40 && !reduced && fly.t >= 1 && viewId === 'all')) {
      engine.controls.autoRotate = true;
      engine.controls.autoRotateSpeed = 0.35;
    } else engine.controls.autoRotate = false;
    // keep the eye above the court, the three tiers and the hall floor
    const cp = engine.camera.position;
    const cr = Math.hypot(cp.x, cp.z);
    const onBlock = Math.max(Math.abs(cp.x), Math.abs(cp.z)) < engine.half;
    const floor = !onBlock ? -3 : cr < 15.8 ? 5.9 : cr < 34.4 ? 5.6 : cr < 39.9 ? 3.8 : cr < 45.4 ? 2.0 : 0;
    if (cp.y < floor + 1.2) cp.y = floor + 1.2;
    updateClipPlanes();
    const t0 = performance.now();
    const drew = engine.frame(dt);
    // hotspots follow the model
    const w = canvas.clientWidth, h = canvas.clientHeight;
    HOTSPOTS.forEach((hs, i) => {
      proj.set(...hs.p).project(engine.camera);
      const vis = proj.z < 1 && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
      const b = hsEls[i];
      b.style.transform = `translate(${(proj.x * 0.5 + 0.5) * w}px, ${(-proj.y * 0.5 + 0.5) * h}px)`;
      b.classList.toggle('off', !vis);
    });
    // adaptive resolution
    if (drew) {
      const ft = performance.now() - t0;
      if (dt > 0.045) slow++; else slow = Math.max(0, slow - 1);
      if (slow > 20 && (engine.scale || 1) > 0.55) { engine.scale = (engine.scale || 1) * 0.85; engine.resize(); slow = 0; }
      if (dt < 0.02) fast++; else fast = 0;
      if (fast > 240 && (engine.scale || 1) < 1) { engine.scale = Math.min(1, (engine.scale || 1) / 0.85); engine.resize(); fast = 0; }
      void ft;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

boot();
