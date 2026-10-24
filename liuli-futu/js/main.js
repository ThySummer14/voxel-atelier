import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildMeshes, VIEW_CENTER, Y_MIN, Y_SPAN } from "./sculpt/build.js";
import { TOWER_Y0 } from "./sculpt/scene.js";
import { tierBaseY, tier, STORIES } from "./sculpt/tower.js";

/* ============================== 基础 ============================== */
const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 1.5, 9000);
camera.position.set(360, 250, 430);

const root = new THREE.Group();
root.position.set(VIEW_CENTER[0], VIEW_CENTER[1], VIEW_CENTER[2]);
scene.add(root);

const revealU = { value: 2.0 };
const emitU = { value: 1.0 };

/* ============================== 时辰 ============================== */
/* 关键帧：破晓 → 晨 → 午 → 未 → 暮 → 夜 → 子 → 晓 */
const STOPS = [
  { t: 0.00, name: "破晓", el: 9,   az: -64, sun: 0xffb070, si: 2.9,  zen: 0x141d3a, hor: 0xd88a5a, hemiS: 0x5f72a8, hemiG: 0x3a3038, hi: 0.55, fog: 0xa8949a, fd: 0.00078, lamp: 0.55, star: 0.25, exp: 1.05 },
  { t: 0.13, name: "晨光", el: 27,   az: -56, sun: 0xffd9a8, si: 3.2,  zen: 0x1a3a78, hor: 0xffd2a2, hemiS: 0xa8c6ee, hemiG: 0x8a7460, hi: 0.74, fog: 0xdcd6da, fd: 0.00055, lamp: 0.05, star: 0.0,  exp: 1.0 },
  { t: 0.34, name: "亭午", el: 62,   az: -22, sun: 0xfff4e0, si: 3.3,  zen: 0x2f63aa, hor: 0xbcd2e6, hemiS: 0xa8c6ea, hemiG: 0x6a6258, hi: 0.92, fog: 0xccd4de, fd: 0.00042, lamp: 0.0,  star: 0.0,  exp: 0.98 },
  { t: 0.55, name: "日昳", el: 40,   az: 26,  sun: 0xffeccb, si: 3.1,  zen: 0x35659e, hor: 0xd8cdb4, hemiS: 0x9fb6d4, hemiG: 0x6e6050, hi: 0.85, fog: 0xd6ccba, fd: 0.00048, lamp: 0.0,  star: 0.0,  exp: 1.0 },
  { t: 0.72, name: "暮色", el: 6,    az: 62,  sun: 0xff8a3c, si: 3.0,  zen: 0x2a2a5c, hor: 0xe8703a, hemiS: 0x6a5a94, hemiG: 0x4a3230, hi: 0.62, fog: 0xba8072, fd: 0.00070, lamp: 0.75, star: 0.35, exp: 1.06 },
  { t: 0.85, name: "上灯", el: -6,   az: 74,  sun: 0x6a7ab0, si: 0.35, zen: 0x0a1024, hor: 0x30324e, hemiS: 0x2a3454, hemiG: 0x14141e, hi: 0.30, fog: 0x2a2c40, fd: 0.00058, lamp: 1.0,  star: 1.0,  exp: 1.16 },
  { t: 0.95, name: "夜分", el: -14,  az: 96,  sun: 0x8ea4d8, si: 0.22, zen: 0x05070f, hor: 0x181c30, hemiS: 0x202a46, hemiG: 0x0e0e14, hi: 0.24, fog: 0x1a1c2a, fd: 0.00052, lamp: 0.92, star: 1.0,  exp: 1.2 },
  { t: 1.00, name: "破晓", el: 9,   az: -64, sun: 0xffb070, si: 2.9,  zen: 0x141d3a, hor: 0xd88a5a, hemiS: 0x5f72a8, hemiG: 0x3a3038, hi: 0.55, fog: 0xa8949a, fd: 0.00078, lamp: 0.55, star: 0.25, exp: 1.05 },
];
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function lerpStop(t) {
  let i = 0;
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const k = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t || 1)));
  const e = k * k * (3 - 2 * k);
  const g = (p) => a[p] + (b[p] - a[p]) * e;
  const col = (p) => _c1.setHex(a[p], THREE.SRGBColorSpace).lerp(_c2.setHex(b[p], THREE.SRGBColorSpace), e).clone();
  return {
    name: e < 0.5 ? a.name : b.name,
    el: g("el"), az: g("az"), si: g("si"), hi: g("hi"), fd: g("fd"), lamp: g("lamp"), star: g("star"), exp: g("exp"),
    sun: col("sun"), zen: col("zen"), hor: col("hor"), hemiS: col("hemiS"), hemiG: col("hemiG"), fog: col("fog"),
  };
}

const hemi = new THREE.HemisphereLight(0x8fb0dc, 0x5a4c44, 0.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a8, 3.0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 40;
sun.shadow.camera.far = 1500;
const SC = 210;
Object.assign(sun.shadow.camera, { left: -SC, right: SC, top: SC + 120, bottom: -SC - 40 });
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 1.2;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0x9fb6d8, 0.35);
fill.position.set(-1, 0.5, -1);
scene.add(fill);
const lampA = new THREE.PointLight(0xffab52, 0, 260, 2);
const lampB = new THREE.PointLight(0xffc070, 0, 320, 2);
lampA.position.set(0, TOWER_Y0 + 30, 60);
lampB.position.set(0, TOWER_Y0 + 170, -50);
scene.add(lampA, lampB);
scene.fog = new THREE.FogExp2(0xcfd2de, 0.00046);

/* ============================== 天空 ============================== */
const skyU = {
  uZen: { value: new THREE.Color(0x2c4a80) },
  uHor: { value: new THREE.Color(0xf2c090) },
  uFog: { value: new THREE.Color(0xd8dae6) },
  uSun: { value: new THREE.Vector3(1, 0.3, 0) },
  uSunCol: { value: new THREE.Color(0xffd9a8) },
  uStar: { value: 0 },
  uTime: { value: 0 },
};
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(4200, 40, 24),
  new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vD;
      uniform vec3 uZen, uHor, uFog, uSun, uSunCol; uniform float uStar, uTime;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float ridge(float a, float s){
        float v = 0.0, f = 1.0, am = 0.55;
        for (int i = 0; i < 5; i++) {
          v += am * abs(fract(a * f * 0.11 + s * (float(i) + 1.3)) - 0.5);
          am *= 0.52; f *= 1.97;
        }
        return 1.0 - clamp(v * 1.55, 0.0, 1.0);          /* 尖峰状山脊 */
      }
      void main(){
        vec3 d = normalize(vD);
        float up = clamp(d.y, -1.0, 1.0);
        float k = pow(clamp(up * 0.5 + 0.5, 0.0, 1.0), 0.9);
        vec3 col = mix(uHor, uZen, smoothstep(0.415, 0.70, k));
        float sd = max(dot(d, normalize(uSun)), 0.0);
        col += uSunCol * pow(sd, 900.0) * 9.0;
        col += uSunCol * pow(sd, 14.0) * 0.30;
        col += uSunCol * pow(sd, 3.0) * 0.09;
        /* 三层山脊：远淡近浓，压在云海尽头 */
        float az = atan(d.z, d.x);
        float h3 = 0.012 + 0.075 * ridge(az, 1.7);
        float h2 = 0.004 + 0.052 * ridge(az, 4.3);
        float h1 = -0.002 + 0.032 * ridge(az, 8.9);
        vec3 m3 = mix(uHor, uZen, 0.52) * 0.80;
        vec3 m2 = mix(uHor, uZen, 0.62) * 0.68;
        vec3 m1 = mix(uHor, uZen, 0.72) * 0.56;
        if (up > -0.006) {                       /* 山脊只画在地平线以上 */
          if (up < h3) col = mix(m3, col, smoothstep(h3, h3 + 0.0045, up));
          if (up < h2) col = mix(m2, col, smoothstep(h2, h2 + 0.0040, up));
          if (up < h1) col = mix(m1, col, smoothstep(h1, h1 + 0.0035, up));
        }
        col = mix(col, uHor, smoothstep(0.30, 0.020, up) * 0.35);
        /* 地平线以下 = 无限远的云海。取雾色再压 0.84：体素云床受光后的
           实际亮度就在这个数上，两边对齐才看不出云床的圆形边界。 */
        float sunb = pow(max(0.0, dot(vec2(d.x, d.z), normalize(vec2(uSun.x, uSun.z)))), 4.0);
        /* 远云海取"地平线处的天色"再掺雾，而不是独立一套色：
           接缝两侧同一来源，才不会出现一条地平线硬边。 */
        vec3 skyHor = mix(uHor, uZen, 0.28);
        vec3 plain = mix(skyHor, uFog * 0.94, 0.62);
        plain = mix(plain, uHor * 0.90, sunb * 0.30);
        plain = mix(plain, plain * 0.88, smoothstep(0.0, -0.30, up));
        col = mix(plain, col, smoothstep(-0.034, 0.010, up));
        if (uStar > 0.01 && up > -0.02) {
          vec2 lp = d.xy * 260.0 + d.z * 40.0;
          vec2 g = floor(lp), f = fract(lp);
          float s = h21(g);
          float tw = 0.55 + 0.45 * sin(uTime * 1.6 + s * 40.0);
          if (s > 0.9955) {
            /* 点落在格心并带径向衰减：否则一颗星就是一块 6px 的方斑 */
            vec2 c = vec2(h21(g + 17.3), h21(g + 41.7));
            float dot_ = smoothstep(0.46, 0.02, length(f - c));
            col += vec3(0.85, 0.9, 1.0) * dot_ * (s - 0.9955) * 260.0 * tw * uStar * smoothstep(0.0, 0.3, up);
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
);
sky.frustumCulled = false;
scene.add(sky);

/* ============================== 材质 ============================== */
function patch(mat, { emissive = false } = {}) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uReveal = revealU;
    sh.uniforms.uEmit = emitU;
    sh.vertexShader = "attribute vec2 aReveal;\nvarying vec2 vRev;\n" + sh.vertexShader.replace(
      "void main() {", "void main() {\n\tvRev = aReveal;");
    let f = "varying vec2 vRev;\nuniform float uReveal;\nuniform float uEmit;\n" + sh.fragmentShader.replace(
      "void main() {",
      "void main() {\n\tif (uReveal < 1.5 && (vRev.x - vRev.y * 0.045) > uReveal) discard;");
    if (emissive) {
      f = f.replace("vec4 diffuseColor = vec4( diffuse, opacity );",
        "vec4 diffuseColor = vec4( diffuse * pow( clamp(vColor, 0.0, 1.0), vec3( 2.2 ) ) * uEmit * 3.4, opacity );");
    } else {
      f = f.replace("diffuseColor.rgb *= vColor;",
        "diffuseColor.rgb *= pow( clamp(vColor, 0.0, 1.0), vec3( 2.15 ) );");
    }
    sh.fragmentShader = f;
  };
  mat.customProgramCacheKey = () => (emissive ? "emit" : "lit") + mat.type;
  return mat;
}

const M = {
  matte: patch(new THREE.MeshLambertMaterial({ vertexColors: true })),
  gloss: patch(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 46, specular: new THREE.Color(0x5c5346) })),
  far: patch(new THREE.MeshLambertMaterial({ vertexColors: true })),
  emit: patch(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), { emissive: true }),
  mist: patch(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.34, depthWrite: false })),
};

function toGeometry(d) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(d.position, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(d.normal, 3, true));
  g.setAttribute("color", new THREE.BufferAttribute(d.color, 3, true));
  g.setAttribute("aReveal", new THREE.BufferAttribute(d.reveal, 2, true));
  g.setIndex(new THREE.BufferAttribute(d.index, 1));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

/* ============================== 后期 ============================== */
/* 离屏目标必须自带 MSAA：合成器若用普通目标，canvas 上的 antialias 完全不生效，
   粗格云床在掠射角下会摩尔成一片斜纹。 */
const composerRT = new THREE.WebGLRenderTarget(innerWidth, innerHeight, {
  type: THREE.HalfFloatType, samples: 4,
});
const composer = new EffectComposer(renderer, composerRT);
/* 2x 内部分辨率再降采样：云床在掠射角下一屏几十格，1x 必然摩尔。
   MSAA 只补几何边缘，补不了这种面内高频。 */
composer.setPixelRatio(2);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.62, 0.62, 0.80);
composer.addPass(bloom);

const RubShader = {
  uniforms: { tDiffuse: { value: null }, uMix: { value: 0 }, uPaper: { value: new THREE.Color(0xf2e8d5) }, uInk: { value: new THREE.Color(0x241c14) } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `
    varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uMix; uniform vec3 uPaper, uInk;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299,0.587,0.114));
      vec2 px = vec2(1.0/1920.0, 1.0/1080.0);
      float l0 = dot(texture2D(tDiffuse, vUv + vec2(-px.x,0.0)).rgb, vec3(0.299,0.587,0.114));
      float l1 = dot(texture2D(tDiffuse, vUv + vec2(px.x,0.0)).rgb, vec3(0.299,0.587,0.114));
      float l2 = dot(texture2D(tDiffuse, vUv + vec2(0.0,-px.y)).rgb, vec3(0.299,0.587,0.114));
      float l3 = dot(texture2D(tDiffuse, vUv + vec2(0.0,px.y)).rgb, vec3(0.299,0.587,0.114));
      float edge = clamp(sqrt((l1-l0)*(l1-l0) + (l3-l2)*(l3-l2)) * 3.1, 0.0, 1.0);
      float wash = smoothstep(0.30, 0.98, l);
      vec3 rub = mix(uPaper, uInk, clamp(edge * 1.25 + (1.0 - wash) * 0.55, 0.0, 1.0));
      rub = mix(rub, uInk * 1.15, edge * 0.42);
      gl_FragColor = vec4(mix(c.rgb, rub, uMix), 1.0);
    }`,
};
const rubPass = new ShaderPass(RubShader);
composer.addPass(rubPass);
composer.addPass(new OutputPass());

/* ============================== 分镜 ============================== */
const ys = tierBaseY().map((y) => y + TOWER_Y0);
const CH = [
  {
    k: "浮屠", t: "全塔正面，八面九层。永乐十九年落成，宣德年间完满：自下而上九层，每层四面开门，门向逐层旋开四十五度，绕塔一周，永不重面。",
    p: [438, 250, 490], q: [-26, 166, 4], fov: 34, time: 0.10,
  },
  {
    k: "琉璃壁", t: "非门四面，各嵌一壁琉璃：黄、绿、赤、褐、青，五色轮转，一壁一色。白琉璃为地，五色为纹，日光下如披彩瓷。",
    p: [96, 96, 128], q: [6, 84, 22], fov: 32, time: 0.16,
  },
  {
    k: "檐铃", t: "每层八角，角悬风铃。塔成之日，铃铎一百五十二枚，风过处声闻数里。仰观之，则椽条如林，瓦楞放射，滴水一线压住天光。",
    p: [78, 116, 74], q: [26, 158, 26], fov: 40, time: 0.22,
  },
  {
    k: "平座", t: "塔身之上设平座，周回栏杆，望柱与栏板相间。登临其上，可俯瞰云海；宋人所谓「登塔如登云」，即此。",
    p: [128, 214, 96], q: [10, 208, 8], fov: 34, time: 0.30,
  },
  {
    k: "塔刹", t: "顶立塔刹：仰莲、覆钵、九层相轮、宝珠。八道铁索自刹分垂，系于上三层檐角，谓之「稳固」，亦为雷劫之备。",
    p: [112, 330, 132], q: [0, 296, 0], fov: 30, time: 0.55,
  },
  {
    k: "万灯", t: "入夜，檐灯、窗火、佛龛次第点亮。史载塔上灯百盏，彻夜不熄，远望如白琉璃柱擎天。此为「金陵永夜」。",
    p: [-336, 236, 366], q: [0, 182, 0], fov: 34, time: 0.88,
  },
];

/* ============================== 装配 ============================== */
const loader = document.getElementById("loader");
const lbar = document.getElementById("lbar");
const lmsg = document.getElementById("lmsg");
const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
const setLoad = (p, msg) => { lbar.style.width = `${Math.round(p * 100)}%`; if (msg) lmsg.textContent = msg; };

let meshes = {}, birdMesh, motes, scene_ = null;

async function boot() {
  setLoad(0.06, "相 地 · 立 基");
  await frame(); await frame();
  const t0 = performance.now();
  const built = buildMeshes();
  const ms = Math.round(performance.now() - t0);
  setLoad(0.55, `结 胎 · 雕 塑 体 素 ${built.grid.count.toLocaleString()} 枚`);
  await frame();

  const add = (name, data, mat, { cast = true, receive = true } = {}) => {
    if (!data || !data.stats.faces) return;
    const mesh = new THREE.Mesh(toGeometry(data), mat);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    mesh.frustumCulled = false;
    root.add(mesh);
    meshes[name] = mesh;
  };
  add("matte", built.matte, M.matte);
  setLoad(0.68, "上 梁 · 砌 壁");
  await frame();
  add("gloss", built.gloss, M.gloss);
  setLoad(0.8, "铺 瓦 · 悬 铃");
  await frame();
  add("far", built.far, M.far, { cast: false, receive: false });
  add("mist", built.mist, M.mist, { cast: false, receive: false });
  add("emit", built.emit, M.emit, { cast: false, receive: false });
  setLoad(0.9, "点 灯 · 引 风");
  await frame();

  buildCloudDeck();
  buildBirds();
  buildMotes();
  scene_ = built;

  const faces = built.matte.stats.faces + built.gloss.stats.faces + built.far.stats.faces + built.emit.stats.faces + built.mist.stats.faces;
  document.getElementById("st-vox").textContent = built.grid.count.toLocaleString();
  document.getElementById("st-face").textContent = faces.toLocaleString() + " △";
  setLoad(1, "琉 璃 浮 屠 · 成");
  await new Promise((r) => setTimeout(r, 420));
  loader.classList.add("gone");
  reveal.start = performance.now();
  reveal.dur = 4600;
  revealU.value = 0;
  goChapter(0, true);
}

/* ============================== 生灵 ============================== */
/* 云床：一张光滑云面。它整层等高，逐格化只会留下一张格纹网
   （每格一个对角缝，掠射角下放射成梳齿），所以退回连续曲面，
   体素的云只保留近塔的雾丘。 */
function buildCloudDeck() {
  const pts = [];
  const N = 240;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const R = 1180 * (1 + 0.055 * Math.sin(a * 3 + 1.2) + 0.038 * Math.sin(a * 5 - 0.7) + 0.026 * Math.sin(a * 8 + 2.4));
    pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R));
  }
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts), 1);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.MeshLambertMaterial({ color: 0xfffaf2 });
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.y = -22;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  scene.add(mesh);
}

function buildBirds() {
  const g = new THREE.BufferGeometry();
  const v = new Float32Array([
    0, 0, 0, -7, 0, 3.5, -5, 0, -3.5,
    0, 0, 0, 5, 0, 3.5, 7, 0, -3.5,
  ]);
  g.setAttribute("position", new THREE.BufferAttribute(v, 3));
  g.computeVertexNormals();
  const m = new THREE.MeshBasicMaterial({ color: 0x14161f, side: THREE.DoubleSide, fog: true });
  const N = 16;
  birdMesh = new THREE.InstancedMesh(g, m, N);
  birdMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  birdMesh.userData.seed = Array.from({ length: N }, (_, i) => ({
    r: 170 + Math.random() * 300, y: 120 + Math.random() * 250, ph: Math.random() * Math.PI * 2,
    sp: 0.05 + Math.random() * 0.06, dir: Math.random() > 0.5 ? 1 : -1, sc: 0.26 + Math.random() * 0.22,
  }));
  scene.add(birdMesh);
}

function softSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,236,200,1)");
  g.addColorStop(0.35, "rgba(255,200,130,0.45)");
  g.addColorStop(1, "rgba(255,180,90,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function buildMotes() {
  const N = 700;
  const pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 40 + Math.pow(Math.random(), 0.6) * 300;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = -20 + Math.random() * 380;
    pos[i * 3 + 2] = Math.sin(a) * r;
    spd[i] = 0.4 + Math.random() * 2.2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    size: 2.4, map: softSprite(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.5,
  });
  motes = new THREE.Points(g, m);
  motes.userData.spd = spd;
  root.add(motes);
}

/* ============================== 交互 ============================== */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 46;
controls.maxDistance = 1500;
controls.maxPolarAngle = Math.PI * 0.472;
controls.minPolarAngle = 0.08;
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.85;
controls.target.set(0, 176, 0);

const cam = { from: null, to: null, qFrom: null, qTo: null, fFrom: 30, fTo: 30, t0: 0, dur: 1, active: false };
function goChapter(i, instant = false) {
  const c = CH[i];
  chIdx = i;
  const p = new THREE.Vector3(...c.p), q = new THREE.Vector3(...c.q);
  if (instant) {
    camera.position.copy(p); controls.target.copy(q); camera.fov = c.fov; camera.updateProjectionMatrix();
  } else {
    cam.from = camera.position.clone(); cam.to = p;
    cam.qFrom = controls.target.clone(); cam.qTo = q;
    cam.fFrom = camera.fov; cam.fTo = c.fov;
    cam.t0 = performance.now(); cam.dur = 2100; cam.active = true;
  }
  setTime(c.time, !instant);
  const el = document.getElementById("chapter");
  document.getElementById("ch-num").textContent = String(i + 1).padStart(2, "0");
  document.getElementById("ch-title").textContent = c.k;
  document.getElementById("ch-body").textContent = c.t;
  el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap");
  document.querySelectorAll("#chapters button").forEach((b, k) => b.classList.toggle("on", k === i));
  idle.at = performance.now();
}
CH.forEach((c, i) => {
  const b = document.createElement("button");
  b.textContent = c.k;
  b.onclick = () => goChapter(i);
  document.getElementById("chapters").appendChild(b);
});

let timeT = 0.13, timeTarget = 0.13;
const timeEl = document.getElementById("time");
function setTime(t, animate = true) {
  timeTarget = t;
  if (!animate) { timeT = t; timeEl.value = String(Math.round(t * 1000)); }
  else timeEl.value = String(Math.round(t * 1000));
}
timeEl.oninput = () => { timeTarget = timeT = +timeEl.value / 1000; };

let lampsForced = false;
document.getElementById("btn-lamps").onclick = (e) => {
  lampsForced = !lampsForced;
  e.currentTarget.classList.toggle("on", lampsForced);
  if (lampsForced) setTime(0.88);
};
const reveal = { start: 0, dur: 0 };
document.getElementById("btn-reveal").onclick = () => { reveal.start = performance.now(); reveal.dur = 4200; revealU.value = 0; };
let rubOn = 0, rubTarget = 0;
document.getElementById("btn-rub").onclick = (e) => { rubTarget = rubTarget > 0.5 ? 0 : 1; e.currentTarget.classList.toggle("on", rubTarget > 0.5); };
let spin = false;
document.getElementById("btn-spin").onclick = (e) => { spin = !spin; e.currentTarget.classList.toggle("on", spin); };
document.getElementById("btn-shot").onclick = () => {
  composer.render();
  const a = document.createElement("a");
  a.download = `琉璃浮屠_${CH[chIdx].k}_${Date.now()}.png`;
  a.href = renderer.domElement.toDataURL("image/png");
  a.click();
};

const idle = { at: performance.now() };
canvas.addEventListener("pointerdown", () => { document.body.classList.add("dragging"); idle.at = performance.now(); cam.active = false; });
addEventListener("pointerup", () => document.body.classList.remove("dragging"));
canvas.addEventListener("wheel", () => (idle.at = performance.now()), { passive: true });
canvas.addEventListener("dblclick", () => goChapter(chIdx));
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goChapter((chIdx + 1) % CH.length);
  if (e.key === "ArrowLeft") goChapter((chIdx - 1 + CH.length) % CH.length);
  if (e.key === " ") { e.preventDefault(); document.getElementById("btn-reveal").click(); }
  if (e.key.toLowerCase() === "l") document.getElementById("btn-lamps").click();
});
let chIdx = 0;

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloom.setSize(innerWidth, innerHeight);
});

/* ============================== 帧循环 ============================== */
const _v = new THREE.Vector3();
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
let last = performance.now(), fpsAcc = 0, fpsN = 0;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const tSec = now / 1000;

  /* 相机运镜 */
  if (cam.active) {
    const k = Math.min(1, (now - cam.t0) / cam.dur);
    const e = ease(k);
    camera.position.lerpVectors(cam.from, cam.to, e);
    controls.target.lerpVectors(cam.qFrom, cam.qTo, e);
    camera.fov = cam.fFrom + (cam.fTo - cam.fFrom) * e;
    camera.updateProjectionMatrix();
    if (k >= 1) cam.active = false;
  }
  /* 空闲缓转 */
  const idleFor = now - idle.at;
  if (!cam.active && (spin || idleFor > 5200)) {
    const s = spin ? 0.026 : 0.011;
    _v.copy(camera.position).sub(controls.target);
    const a = Math.atan2(_v.z, _v.x) + s * dt * 4;
    const r = Math.hypot(_v.x, _v.z);
    camera.position.x = controls.target.x + Math.cos(a) * r;
    camera.position.z = controls.target.z + Math.sin(a) * r;
  }
  controls.update();
  /* 模型没有底：不许镜头钻到云面之下 */
  if (camera.position.y < 18) camera.position.y = 18;

  /* 时辰 */
  timeT += (timeTarget - timeT) * Math.min(1, dt * 1.6);
  const S = lerpStop(timeT);
  const el = (S.el * Math.PI) / 180, az = (S.az * Math.PI) / 180;
  const sd = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  sun.position.copy(controls.target).addScaledVector(sd, 700);
  sun.target.position.copy(controls.target);
  sun.color.copy(S.sun);
  sun.intensity = Math.max(0, S.si * (0.35 + 0.65 * Math.max(0, sd.y)));
  hemi.color.copy(S.hemiS); hemi.groundColor.copy(S.hemiG); hemi.intensity = S.hi;
  fill.intensity = 0.14 + S.hi * 0.3;
  scene.fog.color.copy(S.fog);
  skyU.uFog.value.copy(S.fog);
  scene.fog.density = S.fd;
  renderer.toneMappingExposure = S.exp;
  skyU.uZen.value.copy(S.zen);
  skyU.uHor.value.copy(S.hor);
  skyU.uSun.value.copy(sd);
  skyU.uSunCol.value.copy(S.sun);
  skyU.uStar.value = S.star;
  skyU.uTime.value = tSec;
  sky.position.copy(camera.position);

  const lampWant = lampsForced ? 1 : S.lamp;
  emitU.value += (lampWant * 1.05 - emitU.value) * Math.min(1, dt * 2.2);
  lampA.intensity = emitU.value * 260;
  lampB.intensity = emitU.value * 200;
  bloom.strength = 0.42 + emitU.value * 0.85 + S.star * 0.12;
  if (motes) motes.material.opacity = 0.05 + S.hi * 0.30;   // 浮尘只在日光下可见，夜里不该成星

  /* 显形 */
  if (reveal.dur > 0) {
    const k = (now - reveal.start) / reveal.dur;
    revealU.value = k >= 1 ? 2.0 : Math.min(1.02, ease(Math.min(1, k)) * 1.02);
    if (k >= 1) reveal.dur = 0;
  }

  /* 白描淡入淡出 */
  rubOn += (rubTarget - rubOn) * Math.min(1, dt * 4);
  rubPass.uniforms.uMix.value = rubOn;

  /* 飞鸟 */
  if (birdMesh) {
    const seeds = birdMesh.userData.seed;
    for (let i = 0; i < seeds.length; i++) {
      const b = seeds[i];
      const a = b.ph + tSec * b.sp * b.dir;
      const flap = Math.sin(tSec * 6 + b.ph * 9) * 0.5;
      _v.set(Math.cos(a) * b.r, b.y + Math.sin(tSec * 0.35 + b.ph) * 22, Math.sin(a) * b.r);
      _q.setFromEuler(new THREE.Euler(0, -a + (b.dir > 0 ? Math.PI / 2 : -Math.PI / 2), flap * 0.55));
      _s.setScalar(b.sc);
      _m4.compose(_v, _q, _s);
      birdMesh.setMatrixAt(i, _m4);
    }
    birdMesh.instanceMatrix.needsUpdate = true;
  }
  /* 光尘 */
  if (motes) {
    const p = motes.geometry.attributes.position, spd = motes.userData.spd;
    for (let i = 0; i < spd.length; i++) {
      let y = p.array[i * 3 + 1] + spd[i] * dt * 6;
      if (y > 370) y = -30;
      p.array[i * 3 + 1] = y;
      p.array[i * 3] += Math.sin(tSec * 0.4 + i) * dt * 1.6;
    }
    p.needsUpdate = true;
  }

  composer.render();

  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.6) {
    document.getElementById("st-fps").textContent = Math.round(fpsN / fpsAcc);
    fpsAcc = 0; fpsN = 0;
  }
}

window.LL = {
  chapter: (i) => goChapter(i),
  time: (t) => setTime(t),
  reveal: () => document.getElementById("btn-reveal").click(),
  lamps: (on = true) => { lampsForced = on; setTime(on ? 0.88 : 0.13); },
  rub: (on = true) => { rubTarget = on ? 1 : 0; },
  spin: (on = true) => { spin = !!on; },
  shot: () => document.getElementById("btn-shot").click(),
  hide: (name, off = true) => { if (name === 'sky') { sky.visible = !off; return; } if (meshes[name]) meshes[name].visible = !off; },
  shadows: (on) => { renderer.shadowMap.enabled = !!on; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); },
  get stats() { return { tris: renderer.info.render.triangles, calls: renderer.info.render.calls, fps: document.getElementById("st-fps").textContent }; },
  cam: (x, y, z, tx, ty, tz, fov = 30) => {
    cam.active = false;
    camera.position.set(x, y, z);
    controls.target.set(tx, ty, tz);
    camera.fov = fov; camera.updateProjectionMatrix();
  },
};

boot();
requestAnimationFrame(tick);
