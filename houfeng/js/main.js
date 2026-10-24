// main.js — 候风地动仪 · 主程序（three.js）
// 签名交互「候震」：都柱倾 → 八道发 → 龙吐丸 → 蟾衔丸 → 金声。
// 顶点色与离线光栅共用 js/bake.js，静态观感离线在线一致。

import * as THREE from 'three';
import { build } from './sculpt.js';
import { bakeAll } from './bake.js';
import {
  L, DIRS, dirVec, orbitCam, NOTES, NOTE_NAMES, QUAKE_WORDS,
  clamp, lerp, easeOutCubic, easeInQuad,
} from './spec.js';

// ── 渲染器 / 场景 ──────────────────────────────────────────────────────
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 1200);

const view = { yaw: -35, pitch: 18, dist: 118, tx: 0, ty: 12, tz: 0 };
const viewTarget = { ...view };
let stillMode = false;
let lastInteract = performance.now();

// ── 体素 → 贪心合并网格 ────────────────────────────────────────────────
const DIRS6 = [
  { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], key: 'px' },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], key: 'nx' },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], key: 'py' },
  { n: [0, -1, 0], u: [0, 0, 1], v: [1, 0, 0], key: 'ny' },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], key: 'pz' },
  { n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0], key: 'nz' },
];

function mergePart(voxels, baked) {
  const occ = new Map();
  for (const v of voxels) occ.set(`${v.x},${v.y},${v.z}`, v.c);
  const pos = [], nrm = [], col = [];
  for (const d of DIRS6) {
    const cells = new Map(); // "dC,u,w" → {x,y,z,c}
    for (const v of voxels) {
      if (occ.has(`${v.x + d.n[0]},${v.y + d.n[1]},${v.z + d.n[2]}`)) continue;
      const rec = baked.get(`${v.x},${v.y},${v.z}`);
      if (!rec || !rec[d.key]) continue;
      const u = v.x * d.u[0] + v.y * d.u[1] + v.z * d.u[2];
      const w = v.x * d.v[0] + v.y * d.v[1] + v.z * d.v[2];
      const dC = v.x * d.n[0] + v.y * d.n[1] + v.z * d.n[2];
      cells.set(dC + ',' + u + ',' + w, { x: v.x, y: v.y, z: v.z, c: rec[d.key] });
    }
    const visited = new Set();
    for (const [key, cell0] of cells) {
      if (visited.has(key)) continue;
      const [dc0, u0s, w0s] = key.split(',');
      const dc = Number(dc0), u0 = Number(u0s), w0 = Number(w0s);
      const c0 = cell0.c;
      let u1 = u0;
      while (true) {
        const k2 = dc + ',' + (u1 + 1) + ',' + w0;
        if (!cells.has(k2) || cells.get(k2).c !== c0 || visited.has(k2)) break;
        u1++;
      }
      let w1 = w0;
      outer: while (true) {
        for (let u = u0; u <= u1; u++) {
          const k2 = dc + ',' + u + ',' + (w1 + 1);
          if (!cells.has(k2) || cells.get(k2).c !== c0 || visited.has(k2)) break outer;
        }
        w1++;
      }
      for (let u = u0; u <= u1; u++) for (let w = w0; w <= w1; w++) visited.add(dc + ',' + u + ',' + w);
      const corners = [];
      for (const [a, b] of [[0, 0], [u1 - u0 + 1, 0], [u1 - u0 + 1, w1 - w0 + 1], [0, w1 - w0 + 1]]) {
        corners.push([
          cell0.x + (d.n[0] > 0 ? 1 : 0) + (d.u[0] ? a : 0) + (d.v[0] ? b : 0),
          cell0.y + (d.n[1] > 0 ? 1 : 0) + (d.u[1] ? a : 0) + (d.v[1] ? b : 0),
          cell0.z + (d.n[2] > 0 ? 1 : 0) + (d.u[2] ? a : 0) + (d.v[2] ? b : 0),
        ]);
      }
      for (const t of [0, 1, 2, 0, 2, 3]) {
        const p = corners[t];
        pos.push(p[0], p[1], p[2]);
        nrm.push(d.n[0], d.n[1], d.n[2]);
        col.push(c0[0] / 255, c0[1] / 255, c0[2] / 255);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

// ── 构建场景 ────────────────────────────────────────────────────────────
const { static: parts, dynamic, meta } = build();
const allVoxels = [
  ...parts.flatMap((p) => p.voxels),
  ...dynamic.jaws.flatMap((j) => j.voxels.map((v) => ({ ...v, x: v.x + j.pivot.x, y: v.y + j.pivot.y, z: v.z + j.pivot.z }))),
  ...dynamic.balls.flatMap((b) => b.voxels),
  ...dynamic.toadGlows.flatMap((g) => g.voxels),
  ...dynamic.fires.flatMap((f) => f.voxels),
];
const baked = bakeAll(allVoxels, { firePos: meta.firePos });

const rockGroup = new THREE.Group(); // 不动
const shakeGroup = new THREE.Group(); // 震时抖动（仪器整体）
scene.add(rockGroup, shakeGroup);

function addStatic(part, parent = shakeGroup) {
  const mesh = new THREE.Mesh(mergePart(part.voxels, baked), material);
  parent.add(mesh);
  return mesh;
}

addStatic(parts.find((p) => p.key === 'rock'), rockGroup);
const shardMesh = addStatic(parts.find((p) => p.key === 'shards'), rockGroup);
addStatic(parts.find((p) => p.key === 'pedestal'));
addStatic(parts.find((p) => p.key === 'shellLow'));
addStatic(parts.find((p) => p.key === 'shellMid'));
addStatic(parts.find((p) => p.key === 'frame'));
const shellUpMesh = addStatic(parts.find((p) => p.key === 'shellUp'));
const lidMesh = addStatic(parts.find((p) => p.key === 'lid'));

// 都柱（底部枢轴，倾倒用）
const pillarGeo = mergePart(parts.find((p) => p.key === 'pillar').voxels, baked);
pillarGeo.translate(0, -L.pivotY, 0);
const pillarMesh = new THREE.Mesh(pillarGeo, material);
pillarMesh.position.set(0, L.pivotY, 0);
shakeGroup.add(pillarMesh);

// 八道（八根杠杆，轮毂枢轴）
const leverMeshes = [];
for (let k = 0; k < 8; k++) {
  const vox = parts.find((p) => p.key === 'levers').voxels.filter((v) => {
    const a = Math.atan2(-v.z, v.x);
    const target = (k * 45 * Math.PI) / 180;
    let da = Math.abs(a - target) % (2 * Math.PI);
    if (da > Math.PI) da = 2 * Math.PI - da;
    return da < (24 * Math.PI) / 180;
  });
  const g = mergePart(vox, baked);
  g.translate(0, -L.leverY, 0);
  const m = new THREE.Mesh(g, material);
  m.position.set(0, L.leverY, 0);
  shakeGroup.add(m);
  leverMeshes.push(m);
}

// 八龙（首+颈一组，下颚挂在组内随动）+ 八蟾 + 铜丸 + 蟾口
const headGroups = [], jawMeshes = [], ballMeshes = [], glowMeshes = [], pickProxies = [];
for (let k = 0; k < 8; k++) {
  const grp = new THREE.Group();
  shakeGroup.add(grp);
  const dv = dirVec(k);
  addStatic({ key: `neck${k}`, voxels: parts.find((p) => p.key === `neck${k}`).voxels }, grp);
  addStatic({ key: `head${k}`, voxels: parts.find((p) => p.key === `head${k}`).voxels }, grp);
  const jawDef = dynamic.jaws.find((j) => j.k === k);
  const jg = mergePart(jawDef.voxels, baked);
  const jaw = new THREE.Mesh(jg, material);
  jaw.position.set(jawDef.pivot.x, jawDef.pivot.y, jawDef.pivot.z);
  grp.add(jaw);
  jawMeshes.push(jaw);
  // 铜丸（几何平移至球心为原点，position 即球心）
  const ballDef = dynamic.balls.find((b) => b.k === k);
  const ballGeo = mergePart(ballDef.voxels, baked);
  const bh = meta.ballHome[k];
  ballGeo.translate(-bh.x, -bh.y, -bh.z);
  const ball = new THREE.Mesh(ballGeo, material);
  ball.position.set(bh.x, bh.y, bh.z);
  shakeGroup.add(ball);
  ballMeshes.push(ball);
  // 蟾口承光板（几何以蟾口为原点，脉冲绕口心）
  const glowDef = dynamic.toadGlows.find((g) => g.k === k);
  const glowGeo = mergePart(glowDef.voxels, baked);
  const tm = meta.toadMouth[k];
  glowGeo.translate(-tm.x, -tm.y, -tm.z);
  const gm = new THREE.Mesh(glowGeo, material);
  gm.position.set(tm.x, tm.y, tm.z);
  shakeGroup.add(gm);
  glowMeshes.push(gm);
  // 拾取代理（不可见盒，小巧避免遮挡邻龙）
  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(6, 7, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  proxy.position.set(meta.ballHome[k].x, meta.ballHome[k].y + 1, meta.ballHome[k].z);
  proxy.userData.k = k;
  grp.add(proxy);
  pickProxies.push(proxy);
  headGroups.push(grp);
  // 蟾蜍
  const toad = addStatic({ key: `toad${k}`, voxels: parts.find((p) => p.key === `toad${k}`).voxels });
  toad.userData.k = k;
}
addStatic(parts.find((p) => p.key === 'braziers'));
const fireMesh = new THREE.Mesh(mergePart(dynamic.fires.find((f) => f.key === 'fireAll').voxels, baked), material);
shakeGroup.add(fireMesh);

// ── 天空 / 星月 / 光晕 ──────────────────────────────────────────────────
const skyGeo = new THREE.SphereGeometry(500, 32, 20);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    varying vec3 vP;
    void main(){
      float h = normalize(vP).y;
      vec3 top = vec3(0.028,0.045,0.105);
      vec3 mid = vec3(0.058,0.082,0.19);
      vec3 hor = vec3(0.148,0.118,0.185);
      vec3 c = h > 0.22 ? mix(mid, top, smoothstep(0.22, 0.85, h))
                        : mix(hor, mid, smoothstep(-0.04, 0.22, h));
      gl_FragColor = vec4(c, 1.0);
    }`,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// 星
{
  const N = 420, sp = [], sc = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * 0.48 + 0.04;
    const r = 460;
    sp.push(r * Math.cos(e) * Math.cos(a), r * Math.sin(e), r * Math.cos(e) * Math.sin(a));
    const b = 0.5 + Math.random() * 0.5, tint = Math.random();
    sc.push(b * (tint > 0.7 ? 0.9 : 1), b * 0.95, b * (tint > 0.7 ? 1 : 0.9));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })));
}

// 月亮
{
  const dir = new THREE.Vector3(-0.42, 0.52, -0.62).normalize().multiplyScalar(430);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(), color: 0xf5e6c0, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glow.position.copy(dir); glow.scale.setScalar(90);
  scene.add(glow);
  const core = new THREE.Mesh(new THREE.CircleGeometry(11, 24), new THREE.MeshBasicMaterial({ color: 0xfdf3d0 }));
  core.position.copy(dir); core.lookAt(0, 0, 0);
  scene.add(core);
}
function makeGlowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,240,200,1)');
  g.addColorStop(0.25, 'rgba(255,200,120,0.55)');
  g.addColorStop(0.6, 'rgba(255,150,60,0.16)');
  g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); return t;
}
const glowTex = makeGlowTexture();

// 火盆光晕 + 底部暖光
const fireSprites = meta.firePos.map((f, i) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffa050, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  s.position.set(f.x, f.y + 2.2, f.z);
  s.scale.setScalar(4.2);
  s.userData.i = i;
  scene.add(s);
  return s;
});
{
  const under = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xff8830, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  under.position.set(0, -14, 0); under.scale.set(120, 60, 1);
  scene.add(under);
}

// ── 音频（合成铜声 / 低频震感）─────────────────────────────────────────
let actx = null, master = null, muted = false;
function initAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0.9;
    master.connect(actx.destination);
  } catch { /* 无音频环境 */ }
}
function clink(freq, vel = 1) {
  if (!actx || muted) return;
  const t0 = actx.currentTime;
  const partials = [1, 2.32, 4.11, 5.93, 8.07];
  const gains = [1, 0.55, 0.34, 0.2, 0.1];
  for (let i = 0; i < partials.length; i++) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = freq * partials[i];
    g.gain.setValueAtTime(0.22 * vel * gains[i], t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32 + i * 0.06);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.6);
  }
  // 敲击瞬态
  const nb = noiseBurst(0.05);
  const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2800;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(0.12 * vel, t0);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
  nb.connect(hp); hp.connect(ng); ng.connect(master);
  nb.start(t0);
}
function rumble(mag) {
  if (!actx || muted) return;
  const t0 = actx.currentTime, dur = 0.55 + mag * 0.06;
  const nb = noiseBurst(dur);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 90 + mag * 14;
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.5 * (mag / 9), t0 + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  nb.connect(lp); lp.connect(g); g.connect(master);
  nb.start(t0);
}
function noiseBurst(dur) {
  const len = Math.max(1, Math.floor(actx.sampleRate * dur));
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = actx.createBufferSource(); src.buffer = buf;
  return src;
}

// ── 候震状态机 ──────────────────────────────────────────────────────────
// 每丸状态：held → dropping → caught → returning → held
const balls = [];
for (let k = 0; k < 8; k++) {
  balls.push({ k, state: 'held', t: 0, mag: 0, scale: 1 });
}
const CN_NUM = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
let magDefault = 4;
let autoMode = false, autoTimer = 5;
let explodeOn = false, explodeF = 0;
let shake = null; // {t, dur, amp}
let dropCount = 0;

const ripples = [];
for (let i = 0; i < 8; i++) {
  const m = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.8, 28),
    new THREE.MeshBasicMaterial({ color: 0xffc060, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2;
  scene.add(m);
  ripples.push({ mesh: m, t: 1e9 });
}

function quake(k, mag, opts = {}) {
  const b = balls[k];
  if (b.state !== 'held') return false;
  mag = clamp(Math.round(mag), 1, 9);
  b.state = 'dropping'; b.t = 0; b.mag = mag; b.dropDur = 0.85;
  dropCount++;
  shake = { t: 0, dur: 0.55 + mag * 0.07, amp: 0.1 + mag * 0.045 };
  rumble(mag);
  if (!opts.silent) {
    log(`<span class="dir">震自${DIRS[k].name}</span> · ${CN_NUM[mag - 1]}级 · ${QUAKE_WORDS[mag]}震`);
    showLabel(k, mag);
  }
  return true;
}

function onCatch(k) {
  const b = balls[k];
  b.state = 'caught'; b.t = 0;
  clink(NOTES[k], 0.5 + b.mag * 0.07);
  const r = ripples[k];
  r.t = 0;
  r.mesh.position.set(meta.toadMouth[k].x, meta.toadMouth[k].y + 0.6, meta.toadMouth[k].z);
}

function updateQuake(dt, t) {
  // 整体抖动
  if (shake) {
    shake.t += dt;
    const p = shake.t / shake.dur;
    if (p >= 1) { shake = null; shakeGroup.position.set(0, 0, 0); shakeGroup.rotation.set(0, 0, 0); }
    else {
      const env = Math.exp(-4.5 * p);
      shakeGroup.position.set(
        (Math.sin(shake.t * 43) + Math.sin(shake.t * 29) * 0.6) * shake.amp * env,
        0,
        (Math.cos(shake.t * 37) + Math.sin(shake.t * 51) * 0.6) * shake.amp * env
      );
      shakeGroup.rotation.z = Math.sin(shake.t * 31) * shake.amp * 0.06 * env;
      shakeGroup.rotation.x = Math.cos(shake.t * 41) * shake.amp * 0.06 * env;
    }
  }
  // 都柱 / 杠杆 / 颚 / 丸
  for (const b of balls) {
    const k = b.k, dv = dirVec(k);
    const axisPillar = new THREE.Vector3(dv.z, 0, -dv.x); // 绕此轴向 k 倾
    if (b.state === 'dropping') {
      b.t += dt;
      const jt = Math.min(b.t / 0.24, 1);
      jawMeshes[k].rotation.set(0, 0, 0);
      jawMeshes[k].rotateOnWorldAxis(new THREE.Vector3(-dv.z, 0, dv.x), -0.96 * easeOutCubic(jt));
      const ang = b.mag * 0.5 * easeOutCubic(Math.min(b.t / 0.22, 1));
      pillarMesh.rotation.set(0, 0, 0);
      pillarMesh.rotateOnWorldAxis(axisPillar, ang * (Math.PI / 180));
      leverMeshes[k].rotation.set(0, 0, 0);
      leverMeshes[k].rotateOnWorldAxis(axisPillar, 0.06 * easeOutCubic(jt));
      const dp = Math.min(Math.max((b.t - 0.16) / b.dropDur, 0), 1);
      if (dp > 0) {
        const e = easeInQuad(dp);
        const home = meta.ballHome[k], mouth = meta.toadMouth[k];
        ballMeshes[k].position.set(
          lerp(home.x, mouth.x, e) + dv.x * Math.sin(dp * Math.PI) * 0.7,
          lerp(home.y, mouth.y, e),
          lerp(home.z, mouth.z, e) + dv.z * Math.sin(dp * Math.PI) * 0.7
        );
        ballMeshes[k].scale.setScalar(Math.min(1, dp * 8));
      }
      if (dp >= 1) { ballMeshes[k].scale.setScalar(0.001); onCatch(k); }
    } else if (b.state === 'caught') {
      b.t += dt;
      if (b.t > 2.3) { b.state = 'returning'; b.t = 0; }
    } else if (b.state === 'returning') {
      b.t += dt;
      const rt = Math.min(b.t / 0.5, 1);
      ballMeshes[k].scale.setScalar(Math.max(0.001, easeOutCubic(rt)));
      // 丸沿八道归位（蟾口 → 龙口）
      ballMeshes[k].position.set(
        lerp(meta.toadMouth[k].x, meta.ballHome[k].x, easeOutCubic(rt)),
        lerp(meta.toadMouth[k].y, meta.ballHome[k].y, easeOutCubic(rt)),
        lerp(meta.toadMouth[k].z, meta.ballHome[k].z, easeOutCubic(rt))
      );
      const jt = Math.min(Math.max((b.t - 0.35) / 0.3, 0), 1);
      jawMeshes[k].rotation.set(0, 0, 0);
      if (jt < 1) jawMeshes[k].rotateOnWorldAxis(new THREE.Vector3(-dv.z, 0, dv.x), -0.96 * (1 - easeOutCubic(jt)));
      const ra = b.mag * 0.5 * (1 - easeOutCubic(Math.min(Math.max((b.t - 0.5) / 0.5, 0), 1)));
      pillarMesh.rotation.set(0, 0, 0);
      pillarMesh.rotateOnWorldAxis(axisPillar, ra * (Math.PI / 180));
      leverMeshes[k].rotation.set(0, 0, 0);
      if (jt < 1) leverMeshes[k].rotateOnWorldAxis(axisPillar, 0.06 * (1 - easeOutCubic(jt)));
      if (b.t > 1.0) {
        b.state = 'held'; b.t = 0;
        ballMeshes[k].scale.setScalar(1);
        ballMeshes[k].position.set(meta.ballHome[k].x, meta.ballHome[k].y, meta.ballHome[k].z);
        jawMeshes[k].rotation.set(0, 0, 0);
        leverMeshes[k].rotation.set(0, 0, 0);
        pillarMesh.rotation.set(0, 0, 0);
      }
    }
  }
  // 涟漪
  for (const r of ripples) {
    if (r.t > 1) continue;
    r.t += dt / 0.75;
    const s = 0.5 + r.t * 7;
    r.mesh.scale.setScalar(s);
    r.mesh.material.opacity = 0.85 * Math.max(0, 1 - r.t);
  }
  // 丸光晕：dropping 跟球、caught 在蟾口脉冲、returning 跟球归位
  for (const b of balls) {
    const g = ballGlows[b.k];
    if (b.state === 'dropping') {
      g.position.copy(ballMeshes[b.k].position);
      g.material.opacity = 0.55;
      g.scale.setScalar(4.5 + Math.sin(t * 20) * 0.8);
    } else if (b.state === 'caught') {
      const m = meta.toadMouth[b.k];
      g.position.set(m.x, m.y + 1, m.z);
      g.material.opacity = 0.85 * Math.max(0, 1 - b.t / 1.2);
      g.scale.setScalar(5 + b.t * 4);
    } else if (b.state === 'returning') {
      g.position.copy(ballMeshes[b.k].position);
      g.material.opacity = 0.55;
      g.scale.setScalar(4.5);
    } else {
      g.material.opacity = 0;
    }
  }
}

// 铜丸光晕（吐丸/归位时跟随，远处可读）
const ballGlows = [];
for (let k = 0; k < 8; k++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0xffcf70, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  s.scale.setScalar(5);
  scene.add(s);
  ballGlows.push(s);
}

// 八龙齐奏：五声音阶，自宫至角
let melody = null;
function startMelody() {
  if (melody) return;
  melody = { step: 0, t: 0 };
}
function updateMelody(dt) {
  if (!melody) return;
  melody.t += dt;
  if (melody.t >= 0.5 && melody.step < 8) {
    const k = melody.step;
    if (quake(k, 2, { silent: true })) {
      clink(NOTES[k], 0.9); // 齐奏时先发一声，衔住节拍
      log(`<span class="dir">八龙齐奏</span> · ${NOTE_NAMES[k]}声`);
      melody.step++;
    } else melody.step++;
    melody.t = 0.15;
  }
  if (melody.step >= 8) {
    const done = balls.every((b) => b.state === 'held');
    if (done || melody.t > 3) melody = null;
  }
}

// ── HUD ─────────────────────────────────────────────────────────────────
const logEl = document.getElementById('hud-log');
const labelEl = document.getElementById('hud-label');
let logTimer = null;
function log(html) {
  logEl.innerHTML = html;
  logEl.classList.add('show');
  clearTimeout(logTimer);
  logTimer = setTimeout(() => logEl.classList.remove('show'), 4200);
}
let labelTimer = null;
function showLabel(k, mag) {
  const p = worldToScreen(meta.ballHome[k].x, meta.ballHome[k].y + 4, meta.ballHome[k].z);
  labelEl.style.left = p.x + 'px';
  labelEl.style.top = p.y + 'px';
  labelEl.querySelector('.t').textContent = `震自${DIRS[k].name}`;
  labelEl.querySelector('.s').textContent = `${CN_NUM[mag - 1]}级 · ${QUAKE_WORDS[mag]}震 · ${NOTES[k].toFixed(0)}Hz`;
  labelEl.classList.add('show');
  clearTimeout(labelTimer);
  labelTimer = setTimeout(() => labelEl.classList.remove('show'), 2400);
}
function worldToScreen(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(camera);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
}

const magInput = document.getElementById('mag');
const magVal = document.getElementById('mag-val');
magInput.addEventListener('input', () => {
  magDefault = parseInt(magInput.value, 10);
  magVal.textContent = CN_NUM[magDefault - 1] + '级';
});
magVal.textContent = CN_NUM[magDefault - 1] + '级';

const btnMelody = document.getElementById('btn-melody');
const btnAuto = document.getElementById('btn-auto');
const btnExplode = document.getElementById('btn-explode');
const btnMute = document.getElementById('btn-mute');
btnMelody.addEventListener('click', () => { initAudio(); startMelody(); });
btnAuto.addEventListener('click', () => {
  initAudio();
  autoMode = !autoMode;
  btnAuto.classList.toggle('on', autoMode);
  autoTimer = 2.5;
  log(autoMode ? '<span class="dir">自动候震</span> · 已开启' : '自动候震 · 已关闭');
});
btnExplode.addEventListener('click', () => {
  explodeOn = !explodeOn;
  btnExplode.classList.toggle('on', explodeOn);
});
btnMute.addEventListener('click', () => {
  muted = !muted;
  btnMute.classList.toggle('on', muted);
});

// ── 输入：轨道 / 点选 / 键盘 / 触屏 ─────────────────────────────────────
const raycaster = new THREE.Raycaster();
let dragging = false, dragMoved = 0, lastX = 0, lastY = 0;
let pinchDist = 0;

canvas.addEventListener('pointerdown', (e) => {
  initAudio();
  dragging = true; dragMoved = 0; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  lastInteract = performance.now();
});
canvas.addEventListener('pointermove', (e) => {
  lastInteract = performance.now();
  if (dragging) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    dragMoved += Math.abs(dx) + Math.abs(dy);
    lastX = e.clientX; lastY = e.clientY;
    viewTarget.yaw -= dx * 0.22;
    viewTarget.pitch = clamp(viewTarget.pitch + dy * 0.22, -8, 62);
  } else {
    hoverPick(e);
  }
});
canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  canvas.classList.remove('dragging');
  if (dragMoved < 6) tapPick(e);
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  viewTarget.dist = clamp(viewTarget.dist * (1 + e.deltaY * 0.001), 55, 230);
  lastInteract = performance.now();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (pinchDist > 0) viewTarget.dist = clamp(viewTarget.dist * (pinchDist / d), 55, 230);
    pinchDist = d;
  }
}, { passive: true });
canvas.addEventListener('touchend', () => { pinchDist = 0; });

function pickAt(e) {
  const ndc = new THREE.Vector2(
    (e.clientX / innerWidth) * 2 - 1,
    -(e.clientY / innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(pickProxies, false);
  return hits.length ? hits[0].object.userData.k : -1;
}
function tapPick(e) {
  const k = pickAt(e);
  if (k >= 0) {
    initAudio();
    quake(k, magDefault);
  }
}
let hoverTick = 0;
function hoverPick(e) {
  const now = performance.now();
  if (now - hoverTick < 90) return;
  hoverTick = now;
  canvas.classList.toggle('hover-dragon', pickAt(e) >= 0);
}

addEventListener('keydown', (e) => {
  initAudio();
  lastInteract = performance.now();
  if (e.key >= '1' && e.key <= '8') quake(parseInt(e.key, 10) - 1, magDefault);
  else if (e.key === 'q' || e.key === 'Q') startMelody();
  else if (e.key === 'a' || e.key === 'A') btnAuto.click();
  else if (e.key === 'e' || e.key === 'E') btnExplode.click();
  else if (e.key === 'm' || e.key === 'M') btnMute.click();
  else if (e.key === ' ') { stillMode = !stillMode; e.preventDefault(); }
});

// ── 解构视图 ────────────────────────────────────────────────────────────
function updateExplode(dt) {
  explodeF = lerp(explodeF, explodeOn ? 1 : 0, 1 - Math.exp(-5 * dt));
  const e = easeOutCubic(clamp(explodeF, 0, 1));
  lidMesh.position.y = e * 8;
  shellUpMesh.position.y = e * 4;
  pillarMesh.position.y = L.pivotY + e * 10;
  for (let k = 0; k < 8; k++) {
    const dv = dirVec(k);
    headGroups[k].position.set(dv.x * e * 5, e * 6, dv.z * e * 5);
    leverMeshes[k].position.set(dv.x * e * 1.2, L.leverY + e * 2.5, dv.z * e * 1.2);
  }
}

// ── 主循环 ──────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let fpsEMA = 60;
let firstFrame = true;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  fpsEMA = lerp(fpsEMA, 1 / Math.max(dt, 1e-4), 0.05);

  // 相机阻尼 + 闲置自转
  if (!dragging && !stillMode && performance.now() - lastInteract > 4000) {
    viewTarget.yaw += dt * 1.1;
  }
  view.yaw = lerp(view.yaw, viewTarget.yaw, 1 - Math.exp(-9 * dt));
  view.pitch = lerp(view.pitch, viewTarget.pitch, 1 - Math.exp(-9 * dt));
  view.dist = lerp(view.dist, viewTarget.dist, 1 - Math.exp(-9 * dt));
  view.tx = lerp(view.tx, viewTarget.tx, 1 - Math.exp(-9 * dt));
  view.ty = lerp(view.ty, viewTarget.ty, 1 - Math.exp(-9 * dt));
  view.tz = lerp(view.tz, viewTarget.tz, 1 - Math.exp(-9 * dt));
  const cam = orbitCam(view.yaw, view.pitch, view.dist, { x: view.tx, y: view.ty, z: view.tz });
  camera.position.set(cam.pos.x, cam.pos.y, cam.pos.z);
  camera.lookAt(view.tx, view.ty, view.tz);

  updateQuake(dt, t);
  updateMelody(dt);
  updateExplode(dt);

  // 自动候震
  if (autoMode) {
    autoTimer -= dt;
    if (autoTimer <= 0) {
      autoTimer = 6 + Math.random() * 8;
      quake(Math.floor(Math.random() * 8), 2 + Math.floor(Math.random() * 4));
    }
  }

  // 火光闪烁
  for (const s of fireSprites) {
    const i = s.userData.i;
    s.scale.setScalar(3.9 + Math.sin(t * 13 + i * 1.7) * 0.55 + Math.sin(t * 29 + i * 0.9) * 0.3);
    s.material.opacity = 0.58 + Math.sin(t * 17 + i * 2.3) * 0.18;
  }
  fireMesh.scale.y = 1 + Math.sin(t * 11) * 0.16;
  fireMesh.position.y = Math.sin(t * 11) * 0.08;

  // 浮石碎块轻浮动
  shardMesh.position.y = Math.sin(t * 0.6) * 0.5;
  shardMesh.rotation.y = t * 0.02;

  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    document.getElementById('loading').classList.add('done');
  }
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ── 调试 / 验收接口 ──────────────────────────────────────────────────────
window.HF = {
  cam(yaw = -35, pitch = 18, dist = 118, ty = 12, tx = 0, tz = 0) {
    viewTarget.yaw = yaw; viewTarget.pitch = pitch; viewTarget.dist = dist;
    viewTarget.ty = ty; viewTarget.tx = tx; viewTarget.tz = tz;
  },
  still(b) { stillMode = b; },
  quake: (k, mag) => quake(k, mag ?? magDefault),
  auto(b) { autoMode = b; },
  melody: () => startMelody(),
  explode(b) { explodeOn = b; },
  mute(b) { muted = b; },
  mag(m) { magDefault = m; magInput.value = m; magVal.textContent = CN_NUM[m - 1] + '级'; },
  state() {
    return {
      balls: balls.map((b) => b.state),
      auto: autoMode, explode: explodeOn, muted, mag: magDefault,
      fps: Math.round(fpsEMA), drops: dropCount,
      triangles: renderer.info.render.triangles,
      yaw: view.yaw, pitch: view.pitch,
    };
  },
  screenPos(k) {
    const p = worldToScreen(meta.ballHome[k].x, meta.ballHome[k].y, meta.ballHome[k].z);
    return p;
  },
  log: (s) => log(s),
  version: '1.0.0',
};