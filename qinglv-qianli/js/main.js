import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildMeshes, VIEW_CENTER } from "./sculpt/build.js";
import { mulberry32 } from "./voxel/core.js";
import { WORLD, GROUPS, scrollCm } from "./sculpt/score.js";
import { FLOCKS, CRANES } from "./sculpt/life.js";

const SILK = 0xe9dfc4;          // 绢本（老化）
const OCHRE = 0x9a6b41;         // 赭石打底
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const viewportSize = () => ({
  width: Math.max(1, Math.round(visualViewport?.width || innerWidth || document.documentElement.clientWidth || 1)),
  height: Math.max(1, Math.round(visualViewport?.height || innerHeight || document.documentElement.clientHeight || 1)),
});

/* ============================== 基础 ============================== */
const canvas = document.getElementById("stage");
const loader = document.getElementById("loader");
const lbar = document.getElementById("lbar");
const lmsg = document.getElementById("lmsg");
const appStatus = document.getElementById("app-status");
const fatal = document.getElementById("fatal");
const fatalMsg = document.getElementById("fatal-msg");
const fatalRetry = document.getElementById("fatal-retry");
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");

function announce(message) {
  if (appStatus) appStatus.textContent = message;
}

function showFatal(message, retry = true) {
  loader?.classList.add("gone");
  loader?.setAttribute("aria-busy", "false");
  if (fatalMsg) fatalMsg.textContent = message;
  if (fatal) fatal.hidden = false;
  if (fatalRetry) fatalRetry.hidden = !retry;
  announce("作品加载失败");
}

fatalRetry?.addEventListener("click", () => location.reload());

const QUALITY_PRESETS = {
  high: { label: "精细", dpr: 2, composer: 1.5, samples: 2, bloom: true, secondary: true },
  balanced: { label: "均衡", dpr: 1.5, composer: 1.0, samples: 0, bloom: true, secondary: true },
  eco: { label: "流畅", dpr: 1.2, composer: 0.8, samples: 0, bloom: false, secondary: false },
};

function chooseQuality() {
  const forced = new URLSearchParams(location.search).get("quality");
  if (forced && QUALITY_PRESETS[forced]) return forced;
  const memory = Number(navigator.deviceMemory || 8);
  const cores = Number(navigator.hardwareConcurrency || 8);
  const coarse = matchMedia("(pointer: coarse)").matches;
  if (coarse || memory <= 4 || cores <= 4) return "eco";
  if (memory <= 8 || cores <= 8) return "balanced";
  return "high";
}

let qualityMode = chooseQuality();
let quality = QUALITY_PRESETS[qualityMode];
let qualityLocked = qualityMode !== "high";

const probe = document.createElement("canvas").getContext("webgl2");
if (!probe) {
  showFatal("当前浏览器未提供 WebGL 2。请使用较新的 Safari、Chrome、Edge 或 Firefox，并开启硬件加速。", false);
  throw new Error("WebGL2 unavailable");
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
} catch (error) {
  showFatal(`无法创建 WebGL 画布：${error?.message || error}`, false);
  throw error;
}
renderer.info.autoReset = false;
renderer.setPixelRatio(Math.min(devicePixelRatio, quality.dpr));
const initialViewport = viewportSize();
renderer.setSize(initialViewport.width, initialViewport.height);
/* 不做硬投影：青绿山水的光是矿物颜料的漫反射光，画里没有投影；
   体块的体积感由烘焙 AO 承担。省掉一整个渲染通道。 */
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, initialViewport.width / initialViewport.height, 1.2, 14000);
camera.position.set(760, 120, 420);

const root = new THREE.Group();
root.position.set(...VIEW_CENTER);
scene.add(root);

const dyeU = { value: 2.0 };
const emitU = { value: 0.0 };
const timeU = { value: 0 };

/* ============================== 时辰 ============================== */
/* 主视觉是白昼重彩：默认停在「亭午」——石青石绿最饱和的那一格。
   青绿山水的光是颜料自己的光：天光厚、日光薄，不做硬太阳。
   夜只是备选的一种江山，不是这件作品的底色。 */
const STOPS = [
  { t: 0.00, name: "晨雾", el: 7,   az: -78, sun: 0xffc79a, si: 1.05, zen: 0x9fb2ae, hor: 0xe6d9b6, hemiS: 0xbccbc6, hemiG: 0x8a7c5e, hi: 1.12, fog: 0xdcd6c0, fd: 0.00040, lamp: 0.30, star: 0.10, exp: 1.04 },
  { t: 0.16, name: "朝暾", el: 26,  az: -62, sun: 0xffe0b0, si: 1.45, zen: 0x86a6ac, hor: 0xf0dfba, hemiS: 0xc2d4d2, hemiG: 0x96845e, hi: 1.24, fog: 0xe4dcc2, fd: 0.00026, lamp: 0.0,  star: 0.0,  exp: 1.0 },
  { t: 0.42, name: "亭午", el: 64,  az: -26, sun: 0xfff6e6, si: 1.55, zen: 0x6f96a4, hor: 0xe8ddbe, hemiS: 0xc6d8d6, hemiG: 0x9c8a62, hi: 1.34, fog: 0xe2dcc6, fd: 0.00018, lamp: 0.0,  star: 0.0,  exp: 0.98 },
  { t: 0.60, name: "过雨", el: 48,  az: 18,  sun: 0xf2f6ff, si: 1.45, zen: 0x5f8ea6, hor: 0xdfe2d4, hemiS: 0xb4ccd6, hemiG: 0x8a8468, hi: 1.30, fog: 0xd8dde0, fd: 0.00020, lamp: 0.0,  star: 0.0,  exp: 1.0 },
  { t: 0.78, name: "暮霭", el: 9,   az: 66,  sun: 0xff9a4e, si: 1.35, zen: 0x5a6a86, hor: 0xe8a06a, hemiS: 0x9a8ea6, hemiG: 0x6e5238, hi: 0.95, fog: 0xd0a884, fd: 0.00034, lamp: 0.55, star: 0.14, exp: 1.06 },
  { t: 0.90, name: "渔火", el: 12,  az: 82,  sun: 0x9fb4e0, si: 0.86, zen: 0x223052, hor: 0x565a72, hemiS: 0x607298, hemiG: 0x2c2c38, hi: 1.06, fog: 0x3a4058, fd: 0.00026, lamp: 1.0,  star: 1.0,  exp: 1.34 },
  { t: 1.00, name: "晨雾", el: 7,   az: -78, sun: 0xffc79a, si: 1.05, zen: 0x9fb2ae, hor: 0xe6d9b6, hemiS: 0xbccbc6, hemiG: 0x8a7c5e, hi: 1.12, fog: 0xdcd6c0, fd: 0.00040, lamp: 0.30, star: 0.10, exp: 1.04 },
];
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function makeTimeState() {
  return {
    name: "亭午", el: 0, az: 0, si: 0, hi: 0, fd: 0, lamp: 0, star: 0, exp: 1,
    sun: new THREE.Color(), zen: new THREE.Color(), hor: new THREE.Color(),
    hemiS: new THREE.Color(), hemiG: new THREE.Color(), fog: new THREE.Color(),
  };
}
const timeState = makeTimeState();
function timeNameAt(t) {
  let i = 0;
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++;
  return t < STOPS[i + 1].t ? STOPS[i].name : STOPS[i + 1].name;
}
function lerpStop(t, out = timeState) {
  let i = 0;
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const k = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t || 1)));
  const e = k * k * (3 - 2 * k);
  const g = (p) => a[p] + (b[p] - a[p]) * e;
  const col = (p, target) => target.copy(_c1.setHex(a[p], THREE.SRGBColorSpace)).lerp(_c2.setHex(b[p], THREE.SRGBColorSpace), e);
  out.name = e < 0.5 ? a.name : b.name;
  out.el = g("el"); out.az = g("az"); out.si = g("si"); out.hi = g("hi");
  out.fd = g("fd"); out.lamp = g("lamp"); out.star = g("star"); out.exp = g("exp");
  col("sun", out.sun); col("zen", out.zen); col("hor", out.hor);
  col("hemiS", out.hemiS); col("hemiG", out.hemiG); col("fog", out.fog);
  return out;
}

const hemi = new THREE.HemisphereLight(0xc6d8d6, 0x9c8a62, 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff6e6, 3.2);
sun.castShadow = false;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 60;
sun.shadow.camera.far = 1800;
const SC = 260;
Object.assign(sun.shadow.camera, { left: -SC, right: SC, top: SC + 140, bottom: -SC - 60 });
/* Object.assign 改的是字段，投影矩阵不会自己重算——不调这一句，阴影相机还是默认的 ±5 */
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0007;
sun.shadow.normalBias = 1.1;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xb4ccd6, 0.4);
fill.position.set(-1, 0.6, -1);
scene.add(fill);
/* 渔火：夜里只点三处最密的村落，多了就成灯展 */
const lampLights = [
  new THREE.PointLight(0xffab52, 0, 220, 2),
  new THREE.PointLight(0xffc070, 0, 240, 2),
  new THREE.PointLight(0xffab52, 0, 200, 2),
];
lampLights[0].position.set(566, 26, 66);
lampLights[1].position.set(-286, 40, -60);
lampLights[2].position.set(-848, 22, 46);
scene.add(...lampLights);
scene.fog = new THREE.FogExp2(0xe2dcc6, 0.00042);

/* ============================== 天空 ============================== */
const skyU = {
  uZen: { value: new THREE.Color(0x6f96a4) },
  uHor: { value: new THREE.Color(0xe8ddbe) },
  uFog: { value: new THREE.Color(0xe2dcc6) },
  uSun: { value: new THREE.Vector3(1, 0.4, 0) },
  uSunCol: { value: new THREE.Color(0xfff6e6) },
  uStar: { value: 0 },
  uTime: { value: 0 },
};
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(6200, 40, 24),
  new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vD;
      uniform vec3 uZen, uHor, uFog, uSun, uSunCol; uniform float uStar, uTime;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float ridge(float a, float s){
        float v = 0.0, f = 1.0, am = 0.55;
        for (int i = 0; i < 5; i++) { v += am * abs(fract(a * f * 0.11 + s * (float(i) + 1.3)) - 0.5); am *= 0.52; f *= 1.97; }
        return 1.0 - clamp(v * 1.55, 0.0, 1.0);
      }
      void main(){
        vec3 d = normalize(vD);
        float up = clamp(d.y, -1.0, 1.0);
        float k = pow(clamp(up * 0.5 + 0.5, 0.0, 1.0), 0.9);
        vec3 col = mix(uHor, uZen, smoothstep(0.40, 0.74, k));
        float sd = max(dot(d, normalize(uSun)), 0.0);
        col += uSunCol * pow(sd, 1200.0) * 7.0;
        col += uSunCol * pow(sd, 16.0) * 0.22;
        col += uSunCol * pow(sd, 3.0) * 0.07;
        /* 天幕不再画远脊：场景里已有三重真远峰，再画两道只会读成灰带 */
        col = mix(col, uHor, smoothstep(0.30, 0.02, up) * 0.42);
        /* 地平线以下：无限远的江面，取天色掺雾再压一点，与网巾水的远端同源，不出硬边 */
        vec3 skyHor = mix(uHor, uZen, 0.26);
        vec3 plain = mix(skyHor, uFog * 0.96, 0.58);
        float sunb = pow(max(0.0, dot(vec2(d.x, d.z), normalize(vec2(uSun.x, uSun.z)))), 4.0);
        plain = mix(plain, uHor * 0.94, sunb * 0.26);
        col = mix(plain, col, smoothstep(-0.030, 0.008, up));
        if (uStar > 0.01 && up > -0.02) {
          vec2 lp = d.xy * 260.0 + d.z * 40.0;
          vec2 g = floor(lp), f = fract(lp);
          float s = h21(g);
          float tw = 0.55 + 0.45 * sin(uTime * 1.6 + s * 40.0);
          if (s > 0.9955) {
            vec2 cc = vec2(h21(g + 17.3), h21(g + 41.7));
            float dot_ = smoothstep(0.46, 0.02, length(f - cc));
            col += vec3(0.85, 0.9, 1.0) * dot_ * (s - 0.9955) * 260.0 * tw * uStar * smoothstep(0.0, 0.3, up);
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
);
sky.frustumCulled = false;
scene.add(sky);

/* ============================== 网巾水 ============================== */
/* 「微波水纹均一笔笔画出」「近景的水纹以短线条为主，而远景的水纹则以长线条勾勒」
   —— 这一句直接就是 LOD 规则：近处画格，远处只画长线。
   远水退成绢色，即「江面留白」。 */
const waterU = {
  uTime: timeU,
  uCam: { value: new THREE.Vector3() },
  uSun: { value: new THREE.Vector3(1, 0.4, 0) },
  uSunCol: { value: new THREE.Color(0xfff6e6) },
  uZen: { value: new THREE.Color(0x6f96a4) },
  uHor: { value: new THREE.Color(0xe8ddbe) },
  uFog: { value: new THREE.Color(0xe2dcc6) },
  uFogD: { value: 0.00042 },
  uGreen: { value: new THREE.Color(0x86a396) },   // 近岸水色：绢底掺一点汁绿，不是薄荷
  uDeep: { value: new THREE.Color(0x4a7a6a) },
  uSilk: { value: new THREE.Color(SILK) },
  uDye: dyeU,
  uNight: { value: 0 },
  /* 渔火在水面上的镜像：灯关于 y=0 的对称点与相机连线的交点就是像点，
     沿视线方向拉成长条，再让波浪把它抖碎。 */
  uLamps: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, 0)) },
};
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(3600, 2200, 1, 1),
  new THREE.ShaderMaterial({
    uniforms: waterU, transparent: false, fog: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      varying vec3 vW;
      uniform vec3 uCam, uSun, uSunCol, uZen, uHor, uFog, uGreen, uDeep, uSilk;
      uniform float uTime, uFogD, uDye, uNight;
      uniform vec4 uLamps[8];

      vec3 dyeStage(vec3 fin, float ap, float ct){
        float l = dot(fin, vec3(0.299,0.587,0.114));
        vec3 ochre = vec3(0.60,0.42,0.25) * (0.40 + l * 0.86);
        vec3 sap = mix(ochre, fin * vec3(0.66,0.94,0.60), 0.72);
        float u = clamp((uDye - (ct - 0.085)) / 0.085, 0.0, 1.0);
        float v = clamp((uDye - ct) / 0.075, 0.0, 1.0);
        return mix(mix(ochre, sap, u), fin, v);
      }

      void main(){
        vec3 V = normalize(uCam - vW);
        float dist = length(uCam - vW);

        /* 网巾：格距随距离放大，格线宽度用 fwidth 保持一像素，不摩爾 */
        float lod = clamp(dist / 1100.0, 0.0, 1.0);
        float cell = mix(6.0, 34.0, lod);
        vec2 p = vW.xz / cell;
        p.x += 0.055 * sin(vW.z * 0.055 + uTime * 0.55);
        p.y += 0.055 * sin(vW.x * 0.048 - uTime * 0.42);
        vec2 gg = abs(fract(p) - 0.5);
        /* 线宽用 fwidth 抗摩爾，但要封顶：不封顶的话远处 fwidth 一大，
           网巾就整片消失，江面退成一块死白。 */
        float wN = min(fwidth(gg.x) + fwidth(gg.y) + 0.02, 0.16);
        float netMesh = 1.0 - smoothstep(0.0, wN, min(gg.x, gg.y));       // 近景：短线小格
        float netLine = 1.0 - smoothstep(0.0, wN, gg.y);                   // 远景：长线
        float net = mix(netMesh, netLine * 0.9, smoothstep(0.18, 0.85, lod));

        /* 水色：近岸汁绿，很快退向绢色 —— 这就是「江面留白」。
           留白要比天略沉一点，否则没有地平线，山像浮在虚空里。
           起退的点必须近：旧版从 240 格才开始掺绢，低机位看近水是一片
           薄荷绿瓷砖地，「留白」两个字完全没实现。 */
        vec3 base = mix(uGreen, uSilk * 0.94, smoothstep(70.0, 1500.0, dist));
        base = mix(base, uDeep, 0.12);
        base = mix(base, base * 0.62 + uSilk * 0.14, net * 0.80);          // 墨线勾水

        /* 天光倒映 */
        vec3 R = reflect(-V, vec3(0.0, 1.0, 0.0));
        float skyk = smoothstep(-0.05, 0.55, R.y);
        base = mix(base, mix(uHor, uZen, skyk), 0.16 + 0.20 * skyk);

        /* 日金光鳞 */
        float sd = max(dot(normalize(vec3(uSun.x, 0.0, uSun.z)), normalize(vec3(V.x, 0.0, V.z))), 0.0);
        base += uSunCol * pow(sd, 42.0) * 0.42 * (0.5 + 0.5 * net);
        base += uSunCol * pow(sd, 6.0) * 0.05;

        /* 夜里水面压暗，只留渔火的一点反照 */
        base = mix(base, base * 0.42 + vec3(0.05,0.07,0.12), uNight);

        /* 渔火的倒影：入夜后江面靠这些光柱立起来，否则「渔火」章
           只是把白天的山涂黑，水上一个亮点都没有。 */
        if (uNight > 0.02) {
          for (int i = 0; i < 8; i++) {
            float amt = uLamps[i].w;
            if (amt <= 0.0) continue;
            vec3 L = uLamps[i].xyz;
            float k = uCam.y / max(0.001, uCam.y + L.y);
            vec2 rp = mix(uCam.xz, L.xz, k);
            vec2 dirv = normalize(L.xz - uCam.xz + vec2(0.0001, 0.0));
            vec2 dd = vW.xz - rp;
            float along = dot(dd, dirv), across = dot(dd, vec2(-dirv.y, dirv.x));
            float stretch = along * along * 0.004 + across * across;
            float shimmer = 0.70 + 0.30 * sin(along * 0.42 + uTime * 2.3) * cos(across * 0.75 - uTime * 1.1);
            base += vec3(1.0, 0.62, 0.26) * exp(-stretch * 0.075) * amt * shimmer * uNight * 0.50;
          }
        }

        base = mix(base, uFog, 1.0 - exp(-dist * uFogD * 1.35));
        if (uDye < 1.5) {
          if (uDye < 0.055) discard;
          base = dyeStage(base, 0.05, 0.30);
        }
        gl_FragColor = vec4(base, 1.0);
      }`,
  })
);
water.rotation.x = -Math.PI / 2;
water.position.y = 0;
water.receiveShadow = false;
water.frustumCulled = false;
water.renderOrder = -1;
scene.add(water);

/* ============================== 材质 ============================== */
/* onBeforeCompile 的 replace 是「找不到目标就静默什么都不做」的 API。
   真栽过一次：替换目标写成 three 展开 #include 之后才存在的
   "diffuseColor.rgb *= vColor;"，于是整条三矾九染静默失效，画面照样有顶点色、
   程序照样编译通过。这里把每一处注入是否真的命中记录下来供验收探针读取。 */
const shaderPatchLog = new Map();

function patch(mat, { emissive = false, emitScale = 1, farFog = 0 } = {}) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDye = dyeU;
    sh.uniforms.uEmit = emitU;
    sh.uniforms.uEmitScale = { value: emitScale };
    sh.uniforms.uOchre = { value: new THREE.Color(OCHRE) };
    if (farFog) sh.uniforms.uFarFog = { value: farFog };
    /* three 的 prefix 以 join('\n') 收尾（没有末尾换行），内置 shader 又以
       "#define LAMBERT\n" 开头（没有起始换行）。所以注入串首尾都必须补换行，
       否则会拼出 `}#define LAMBERT` 这种非法 token。 */
    sh.vertexShader = "\nattribute vec2 aDye;\nvarying vec2 vDye;\n" + sh.vertexShader.replace(
      "void main() {", "void main() {\n\tvDye = aDye;");
    const head = `
      varying vec2 vDye; uniform float uDye, uEmit, uEmitScale; uniform vec3 uOchre;
      ${farFog ? "uniform float uFarFog;" : ""}
      /* 三矾九染：赭石打底 → 汁绿罩染 → 本色。三段两次插值，
         阈值按体素高度错开，所以绿自山脚漫上、石青最后压在山头。 */
      vec3 dyeStage(vec3 fin){
        float l = dot(fin, vec3(0.299,0.587,0.114));
        vec3 ochre = uOchre * (0.34 + l * 0.94);
        vec3 sap = mix(ochre, fin * vec3(0.66,0.94,0.60), 0.72);
        float ct = vDye.y;
        float u = clamp((uDye - (ct - 0.085)) / 0.085, 0.0, 1.0);
        float v = clamp((uDye - ct) / 0.075, 0.0, 1.0);
        return mix(mix(ochre, sap, u), fin, v);
      }
`;
    /* onBeforeCompile 拿到的是**还没展开 #include 的原始 shader**（展开发生在
       WebGLProgram 里，晚于这一步）。所以必须替换 #include <color_fragment> 这个
       token 本身；直接替换展开后的 "diffuseColor.rgb *= vColor;" 是空操作——
       真踩过的坑：整条「三矾九染」只擦除了几何，一次也没有重新落色。 */
    let f = head + sh.fragmentShader.replace(      "void main() {", "void main() {\n\tif (uDye < 1.5 && uDye < vDye.x) discard;");
    if (emissive) {
      f = f.replace("vec4 diffuseColor = vec4( diffuse, opacity );",
        "vec4 diffuseColor = vec4( diffuse * (0.14 + uEmit * 1.45 * uEmitScale), opacity );");
      f = f.replace("#include <color_fragment>",
        "diffuseColor.rgb *= pow( clamp( vColor, 0.0, 1.0 ), vec3( 2.2 ) );");
    } else {
      f = f.replace("#include <color_fragment>",
        "diffuseColor.rgb *= pow( clamp( vColor, 0.0, 1.0 ), vec3( 2.15 ) );\n\tif (uDye < 1.5) diffuseColor.rgb = dyeStage(diffuseColor.rgb);");
    }
    /* 远峰的空气透视：three 的 FogExp2 按 density² × depth² 算，
       亭午的 0.00018 在 1000 格外只吃掉 3% 的色——远山于是硬得像身边的山。
       这里换成线性光程的浓雾，让三重远峰自近及远一路退进天色里。 */
    if (farFog) {
      f = f.replace("#include <fog_fragment>", `
#ifdef USE_FOG
\tfloat farFogK = 1.0 - exp( -vFogDepth * uFarFog );
#ifdef FOG_EXP2
\tfarFogK = clamp( farFogK, 0.0, 1.0 );
#endif
\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, clamp( farFogK, 0.0, 1.0 ) );
#endif`);
    }
    sh.fragmentShader = f;
    shaderPatchLog.set(`${mat.type}:${emissive ? emitScale : (farFog ? "far" : "lit")}`, {
      emissive,
      revealGuard: f.includes("uDye < vDye.x") && f.includes("discard"),
      dyeCalled: f.includes("diffuseColor.rgb = dyeStage"),
      srgbVertexColor: f.includes("vec3( 2.15 )") || f.includes("vec3( 2.2 )"),
      includeLeftover: f.includes("#include <color_fragment>"),
      emitScaleApplied: !emissive || /uEmit \* [\d.]+ \* uEmitScale/.test(f),
    });
  };
  mat.customProgramCacheKey = () => (emissive ? `emit:${emitScale}` : farFog ? "far" : "lit") + mat.type;
  return mat;
}

const M = {
  matte: patch(new THREE.MeshLambertMaterial({ vertexColors: true })),
  gloss: patch(new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 38, specular: new THREE.Color(0x6a6252) })),
  emit: patch(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), { emissive: true, emitScale: 0.85 }),
  emitSoft: patch(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), { emissive: true, emitScale: 0.9 }),
  emitCore: patch(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), { emissive: true, emitScale: 1.55 }),
  cloud: patch(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })),
  fall: patch(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.72, depthWrite: false, side: THREE.DoubleSide })),
  spray: patch(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.50, depthWrite: false, side: THREE.DoubleSide })),
  /* 雾是堆出来的体积，不是贴上去的薄片：DoubleSide 会让每个格子的正反两面
     各混一次，单层薄雾于是亮成一条白带。改正面 + 降不透明度。 */
  mist: patch(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.FrontSide })),
  /* 远峰不吃光：画里的远山是一层平涂的淡墨花青，不是有明暗的体块。
     一旦给它兰伯特光照，顶面被天光照亮、侧面沉下去，8 格的块在水平视角下
     立刻读成"一整片灰白楼群"。改 MeshBasicMaterial + 线性浓雾。 */
  far: patch(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true }), { farFog: 0.00125 }),
};

function toGeometry(d) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(d.position, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(d.normal, 3, true));
  g.setAttribute("color", new THREE.BufferAttribute(d.color, 3, true));
  g.setAttribute("aDye", new THREE.BufferAttribute(d.dye, 2, true));
  g.setIndex(new THREE.BufferAttribute(d.index, 1));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

/* ============================== 后期 ============================== */
const floatBuffer = renderer.extensions.has("EXT_color_buffer_float");
const composerRT = new THREE.WebGLRenderTarget(initialViewport.width, initialViewport.height, {
  type: floatBuffer ? THREE.HalfFloatType : THREE.UnsignedByteType,
  samples: quality.samples,
});
const composer = new EffectComposer(renderer, composerRT);
let PR = quality.composer;
composer.setPixelRatio(PR);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.30, 0.7, 0.92);
composer.addPass(bloom);

/* 读画：把三维世界压回绢本。色彩量化到青绿—赭石两族、覆双丝绢织纹、加老化与裂纹。
   双丝绢经 45–51 根/cm、纬 54–60 根/cm（故宫 2018 绢质检测），
   屏幕上按约 3px 一经、3.4px 一纬折成织纹。 */
const SilkShader = {
  uniforms: {
    tDiffuse: { value: null }, uMix: { value: 0 }, uTime: { value: 0 },
    uSilk: { value: new THREE.Color(SILK) }, uInk: { value: new THREE.Color(0x2a2723) },
    uGold: { value: new THREE.Color(0xc9a24a) },
  },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `
    varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uMix, uTime;
    uniform vec3 uSilk, uInk, uGold;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
    float fbm(vec2 p){ float v=0.0,a=0.55; for(int i=0;i<4;i++){ v+=a*n2(p); p*=2.03; a*=0.5; } return v; }

    vec3 painting(vec3 clin){
      /* 本 pass 位于 OutputPass 之前，拿到的是线性色；量化阈值是按显示空间写的，
         所以先转到显示空间做分色，最后再回线性，否则整幅会退成一片薄荷。 */
      vec3 c = pow(clin, vec3(0.4545));
      float l = dot(c, vec3(0.299,0.587,0.114));
      /* 冷暖二分：偏暖归赭石与绢，偏冷归石绿石青 */
      float warm = clamp((c.r - c.b) * 1.75 + 0.30, 0.0, 1.0);
      /* 石绿罩在赭石底上，画里读作偏黄的绿；世界模式是偏蓝的绿。
         这一条既是对的颜料逻辑，也是「读画」换色彩语言的主要证据。 */
      vec3 cold = mix(vec3(0.32,0.42,0.22), vec3(0.19,0.36,0.50), smoothstep(0.30,0.66,l));
      /* 天在画里是一层淡花青洗，不是一块深蓝：亮处的冷色往灰青退 */
      cold = mix(cold, vec3(0.62,0.68,0.62), smoothstep(0.50,0.82,l));
      vec3 warmc = mix(vec3(0.55,0.36,0.19), vec3(0.88,0.81,0.62), smoothstep(0.18,0.82,l));
      vec3 p = mix(cold, warmc, warm);
      /* 亮部提到绢上（留白），暗部压进墨里（勾廓） */
      p = mix(p, vec3(0.91,0.86,0.71), smoothstep(0.74,1.00,l) * 0.66);
      p = mix(p, vec3(0.15,0.14,0.12), smoothstep(0.26,0.03,l) * 0.60);
      /* 泥金只在最亮的一线上复勾 */
      p = mix(p, uGold, smoothstep(0.92,1.04,l) * 0.40);
      /* 一点对比：绢本不灰 */
      p = clamp((p - 0.5) * 1.12 + 0.5, 0.0, 1.0);
      return pow(p, vec3(2.2));
    }

    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 p = painting(c.rgb);

      vec2 px = vUv * vec2(1920.0, 1080.0);
      float warp = 0.5 + 0.5 * sin(px.x * 2.0944);            /* 经线 ~3px */
      float weft = 0.5 + 0.5 * sin(px.y * 1.8480);            /* 纬线 ~3.4px */
      float plain = 0.5 + 0.5 * sin((px.x + px.y) * 1.0472);  /* 平纹交织 */
      float silk = 0.962 + 0.030 * mix(warp, weft, plain) + 0.014 * (warp - 0.5);
      p *= silk;

      /* 老化：低频黄褐斑 + 整体暖化 */
      float age = fbm(vUv * 7.5);
      p = mix(p, p * vec3(1.02,0.95,0.80), 0.30 + 0.34 * smoothstep(0.52,0.86,age));
      /* 裂纹：颜料层开裂，细而稀 */
      float cr = fbm(vUv * 190.0);
      float crack = smoothstep(0.735, 0.755, cr) * smoothstep(0.79, 0.77, cr);
      p = mix(p, p * 0.66 + vec3(0.10,0.08,0.05), crack * 0.55);
      /* 绢底统一罩一层，边角沉下去 */
      p = mix(p, p * uSilk * 1.16, 0.30);
      float vig = smoothstep(1.05, 0.30, length(vUv - 0.5) * 1.42);
      p *= 0.86 + 0.14 * vig;

      gl_FragColor = vec4(mix(c.rgb, p, uMix), 1.0);
    }`,
};
const silkPass = new ShaderPass(SilkShader);
silkPass.enabled = false;
composer.addPass(silkPass);
composer.addPass(new OutputPass());

/* ============================== 分镜 ============================== */
/* 三远穿插：主峰用高远（低机位仰视），山坳村落用水磨用深远（俯瞰穿透），
   组间开阔江面用平远。不做匀速平移。 */
const CH = [
  {
    k: "展卷", yuan: "平远", t: "画心纵 51.5 厘米，横 1191.5 厘米。这一条十一米长的绢，从右端起首，一次只露出有限的一段——所以你看到的从来不是「一幅画」，而是一段时间。",
    p: [0, 360, 1980], q: [0, 70, 0], fov: 36, time: 0.42,
  },
  {
    k: "序曲", yuan: "平远", t: "全卷由七大组群山组成，如同一座座山岛矗立在江边湖畔，形成互有联系的岛链。卷首第一组为序曲：山势低，江面平远开阔，渔村、野渡、小桥。",
    p: [905, 62, 300], q: [790, 34, -20], fov: 34, time: 0.16,
  },
  {
    k: "高远", yuan: "高远", t: "最高的主峰在第五组，拔地而起作为全卷的高潮。山头颜色厚重饱满，压的是头青；山脚颜色轻薄，透出来的是赭石底。",
    p: [-452, 26, 96], q: [-288, 190, -84], fov: 44, time: 0.42,
  },
  {
    k: "深远", yuan: "深远", t: "山坳里有水磨：先在河上建砖坝，坝上建房，下设水轮，引水冲击水轮旋转，带动水磨。画中几十栋屋宇，没有一处门墙——这不是城池，是日子。",
    p: [408, 176, 250], q: [296, 26, -16], fov: 34, time: 0.30,
  },
  {
    k: "长桥", yuan: "平远", t: "第三组与第四组之间以长桥相连。全桥三十三组构架，共三十二跨，每跨木梁铺木板，中间建桥亭。人物虽细小如豆，却动态鲜明。",
    p: [40, 34, 330], q: [-30, 12, 52], fov: 46, time: 0.52,
  },
  {
    k: "入画", yuan: "—", t: "人四格高，约一米七五。这是全卷唯一的尺子：长桥每跨约三米九，屋宇面阔三间约五米。山高是被散点透视压过的——这是画，不是测绘。",
    p: [826, 12, 176], q: [786, 13, 96], fov: 42, time: 0.60,
  },
  {
    k: "渔火", yuan: "平远", t: "青绿之外还有一种江山。入夜，村舍窗火与船上灯次第亮起，石青石绿退成墨色，只剩绢底的一点暖。",
    p: [-700, 20, 230], q: [-830, 16, 70], fov: 42, time: 0.90,
  },
];

/* ============================== 装配 ============================== */
const frame = () => new Promise((resolve) => {
  let done = false;
  const finish = () => { if (!done) { done = true; resolve(); } };
  requestAnimationFrame(finish);
  setTimeout(finish, 32);
});
const setLoad = (p, msg) => {
  const pct = Math.round(clamp(p, 0, 1) * 100);
  if (lbar) lbar.style.width = `${pct}%`;
  const progress = document.getElementById("loader-progress");
  if (progress) {
    progress.setAttribute("aria-valuenow", String(pct));
    progress.setAttribute("aria-valuetext", msg || `${pct}%`);
  }
  if (msg && lmsg) lmsg.textContent = msg;
};

const meshes = {};
let flockMesh = null, craneMesh = null, built = null, wheelRotor = null;

function serializableBuild(source) {
  const chunks = source.chunks.map(({ x0, x1, faces, parts }) => ({
    x0, x1, faces,
    parts: Object.fromEntries(Object.entries(parts).filter(([, data]) => data)),
  }));
  return {
    chunks,
    stats: source.stats,
    timings: source.timings,
    terrain: source.terrain,
    lamps: source.lamps ?? source.ctx?.lamps ?? [],
    mill: source.ctx?.mill ?? source.mill ?? null,
    farBands: source.ctx?.far ?? source.farBands ?? null,
  };
}

function buildSync() {
  setLoad(0.18, "勾 廓 · 本机雕刻");
  const t0 = performance.now();
  const result = serializableBuild(buildMeshes());
  window.__buildMs = Math.round(performance.now() - t0);
  return result;
}

function buildOffThread() {
  if (!("Worker" in window)) return Promise.resolve(buildSync());
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker(new URL("./build-worker.js", import.meta.url), { type: "module" });
    } catch {
      resolve(buildSync());
      return;
    }
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") {
        setLoad(0.18, "勾 廓 · 后台雕山");
      } else if (data.type === "ready") {
        worker.terminate();
        resolve(data.built);
      } else if (data.type === "error") {
        worker.terminate();
        reject(new Error(data.message));
      }
    };
    worker.onerror = () => {
      worker.terminate();
      /* 不用 console.warn：验收把 warning 也计为不通过，而这条路径本身是可恢复的降级。 */
      setLoad(0.18, "勾 廓 · 本机雕刻（后台不可用）");
      resolve(buildSync());
    };
    worker.postMessage({ type: "build" });
  });
}

async function boot() {
  try {
    setLoad(0.06, "取 绢 · 打 底");
    await frame(); await frame();
    const t0 = performance.now();
    built = await buildOffThread();
    if (!window.__buildMs) window.__buildMs = Math.round(performance.now() - t0);
    setLoad(0.48, `勾 廓 · 雕 ${built.stats.voxels.toLocaleString()} 枚体素`);
    await frame();

    const add = (name, data, mat, { cast = true, receive = true, parent = root } = {}) => {
      if (!data || !data.stats.faces) return null;
      const mesh = new THREE.Mesh(toGeometry(data), mat);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      (meshes[name] ||= []).push(mesh);
      return mesh;
    };

    const mill = built.mill;
    if (mill?.wheelX != null) {
      wheelRotor = new THREE.Group();
      wheelRotor.position.set(mill.wheelX, mill.wheelY, mill.wheelZ);
      root.add(wheelRotor);
    }

    let done = 0;
    for (const ch of built.chunks) {
      add("matte", ch.parts.matte, M.matte);
      add("gloss", ch.parts.gloss, M.gloss);
      add("cloud", ch.parts.cloud, M.cloud, { cast: false, receive: false });
      add("fall", ch.parts.fall, M.fall, { cast: false, receive: false });
      add("spray", ch.parts.spray, M.spray, { cast: false, receive: false });
      add("mist", ch.parts.mist, M.mist, { cast: false, receive: false });
      add("emit", ch.parts.emit, M.emit, { cast: false, receive: false });
      add("emitSoft", ch.parts.emitSoft, M.emitSoft, { cast: false, receive: false });
      add("emitCore", ch.parts.emitCore, M.emitCore, { cast: false, receive: false });
      add("far", ch.parts.far, M.far, { cast: false, receive: false });
      if (ch.parts.wheel && wheelRotor) {
        const wheel = add("wheel", ch.parts.wheel, M.matte, { parent: wheelRotor });
        if (wheel) wheel.position.set(-mill.wheelX, -mill.wheelY, -mill.wheelZ);
      }
      done++;
      if (done % 2 === 0 || done === built.chunks.length) {
        setLoad(0.48 + 0.38 * (done / built.chunks.length), `染 色 · 第 ${done}/${built.chunks.length} 段`);
        await frame();
      }
    }

    setLoad(0.92, "点 苔 · 放 船");
    await frame();
    installLampReflections(built.lamps);
    buildFlocks();
    buildCranes();
    applyQuality(qualityMode, true);
    resizeRenderer();

    const st = built.stats;
    document.getElementById("st-vox").textContent = st.voxels.toLocaleString();
    document.getElementById("st-face").textContent = st.triangles.toLocaleString() + " △";
    document.getElementById("st-chunk").textContent = `${st.chunks} 段`;
    setLoad(1, "青 绿 千 里 · 成");
    await new Promise((r) => setTimeout(r, 260));
    loader.classList.add("gone");
    loader.setAttribute("aria-busy", "false");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    goChapter(0, true);
    composer.render();
    announce("青绿千里已载入，当前为第一章展卷。可拖拽环绕，滚轮推拉，或按 U 展卷。");
    requestAnimationFrame(tick);
  } catch (error) {
    console.error(error);
    showFatal(`场景构建失败：${error?.message || error}`);
  }
}

/* ============================== 飞鸟与鹤 ============================== */
/** 全卷有上百处灯，uniform 只放得下 8 个：按相机就近取，
 *  固定抽样的话你脚下的渔火永远照不到你眼前这段江面。 */
let ALL_LAMPS = [];
const _lampCand = [];
function updateLampReflections() {
  if (!ALL_LAMPS.length) return;
  const cx = camera.position.x, cz = camera.position.z;
  _lampCand.length = 0;
  for (const p of ALL_LAMPS) {
    const d = (p[0] - cx) ** 2 + (p[2] - cz) ** 2;
    if (d < 620 * 620) _lampCand.push([d, p]);
  }
  _lampCand.sort((a, b) => a[0] - b[0]);
  const slots = waterU.uLamps.value;
  for (let i = 0; i < slots.length; i++) {
    const hit = _lampCand[i];
    if (!hit) { slots[i].w = 0; continue; }
    slots[i].set(hit[1][0], hit[1][1] + 0.5, hit[1][2], 1);
  }
}

function installLampReflections(flat) {
  const pts = [];
  for (let i = 0; i + 2 < flat.length; i += 3) pts.push([flat[i], flat[i + 1], flat[i + 2]]);
  ALL_LAMPS = pts;
  window.__lampCount = pts.length;
  updateLampReflections();
}

function birdGeo(span) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
    0, 0, 0, -span * 0.5, 0, span * 0.25, -span * 0.36, 0, -span * 0.25,
    0, 0, 0, span * 0.5, 0, span * 0.25, span * 0.36, 0, -span * 0.25,
  ]), 3));
  g.computeVertexNormals();
  return g;
}

function makeFlock(list, span, color, tag) {
  const N = list.reduce((a, f) => a + f.n, 0);
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, fog: true });
  const im = new THREE.InstancedMesh(birdGeo(span), m, N);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false;
  const seeds = [];
  const random = mulberry32(0x51a7 + list.length * 97 + Math.round(list[0]?.cx || 0));
  for (const f of list)
    for (let i = 0; i < f.n; i++)
      seeds.push({
        cx: f.cx, cy: f.cy, cz: f.cz, r: f.r * (0.55 + random() * 0.7),
        ph: random() * Math.PI * 2, sp: f.speed * (0.8 + random() * 0.4),
        sc: f.scale * (0.75 + random() * 0.5), off: random() * 14 - 7,
      });
  im.userData = { seeds, tag };
  scene.add(im);
  return im;
}

function buildFlocks() { flockMesh = makeFlock(FLOCKS, 15, 0x2c2a26, "flock"); }
function buildCranes() { craneMesh = makeFlock(CRANES, 26, 0xf4efe2, "crane"); }

/* ============================== 交互 ============================== */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 12;
controls.maxDistance = 5200;
controls.maxPolarAngle = Math.PI * 0.492;
controls.minPolarAngle = 0.05;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.9;
controls.panSpeed = 0.7;
controls.target.set(790, 34, -20);

const cam = { from: null, to: null, qFrom: null, qTo: null, fFrom: 32, fTo: 32, t0: 0, dur: 1, active: false };
let chIdx = 1;

function setToggle(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("on", !!on);
  el.setAttribute("aria-pressed", on ? "true" : "false");
}

function goChapter(i, instant = false) {
  const c = CH[i];
  if (!c) return;
  chIdx = i;
  scroll.playing = false;
  scroll.ending = false;
  setToggle("btn-scroll", false);
  lampsForced = false;
  setToggle("btn-lamps", false);
  const p = new THREE.Vector3(...c.p), q = new THREE.Vector3(...c.q);
  if (instant || reducedMotionQuery.matches) {
    camera.position.copy(p); controls.target.copy(q); camera.fov = c.fov; camera.updateProjectionMatrix();
    cam.active = false;
  } else {
    cam.from = camera.position.clone(); cam.to = p;
    cam.qFrom = controls.target.clone(); cam.qTo = q;
    cam.fFrom = camera.fov; cam.fTo = c.fov;
    cam.t0 = performance.now(); cam.dur = 2600; cam.active = true;
  }
  setTime(c.time, !instant && !reducedMotionQuery.matches);
  const el = document.getElementById("chapter");
  document.getElementById("ch-num").textContent = String(i + 1).padStart(2, "0");
  document.getElementById("ch-title").textContent = c.k;
  document.getElementById("ch-yuan").textContent = c.yuan === "—" ? "" : c.yuan;
  document.getElementById("ch-body").textContent = c.t;
  if (!reducedMotionQuery.matches) {
    el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap");
  }
  document.querySelectorAll("#chapters button").forEach((b, k) => {
    b.classList.toggle("on", k === i);
    if (k === i) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  scroll.setU(i === 0 ? 0 : scroll.uForX(c.p[0] - 34));
  if (instant || reducedMotionQuery.matches) composer.render();
  announce(`第 ${i + 1} 章，${c.k}，${c.yuan}`);
}
CH.forEach((c, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.innerHTML = `<i>${String(i + 1).padStart(2, "0")}</i>${c.k}`;
  b.setAttribute("aria-label", `第 ${i + 1} 章：${c.k}`);
  b.onclick = () => goChapter(i);
  document.getElementById("chapters").appendChild(b);
});

/* ---- 时辰 ---- */
let timeT = 0.42, timeTarget = 0.42;
const timeEl = document.getElementById("time");
function setTime(t, animate = true) {
  timeTarget = t;
  if (!animate) timeT = t;
  timeEl.value = String(Math.round(t * 1000));
  document.getElementById("time-name").textContent = timeNameAt(t);
}
timeEl.oninput = () => {
  timeTarget = timeT = +timeEl.value / 1000;
  lampsForced = false;
  setToggle("btn-lamps", false);
  document.getElementById("time-name").textContent = timeNameAt(timeT);
  announce(`时辰：${timeNameAt(timeT)}`);
};

/* ---- 展卷 ---- */
const scroll = {
  u: 0, playing: false, dragging: false, ending: false, holdUntil: 0,
  el: document.getElementById("scroll"),
  lastReadout: "",
  setU(u, moveCamera = false) {
    this.u = clamp(u, 0, 1);
    if (moveCamera) this.apply(this.u);
    else this.readout();
  },
  uForX(x) {
    const a = WORLD.x1 - 70, b = WORLD.x0 + 70;
    return clamp((a - x) / (a - b), 0, 1);
  },
  apply(u) {
    this.u = clamp(u, 0, 1);
    const x = lerp(WORLD.x1 - 70, WORLD.x0 + 70, this.u);
    cam.active = false;
    camera.position.set(x + 34, 92, 322);
    controls.target.set(x - 70, 46, 0);
    camera.fov = 36; camera.updateProjectionMatrix();
    this.readout();
  },
  readout() {
    const value = String(Math.round(this.u * 1000));
    if (!this.dragging && this.el.value !== value) this.el.value = value;
    const x = lerp(WORLD.x1, WORLD.x0, this.u);
    const cm = scrollCm(x);
    const key = `${value}|${cm.toFixed(0)}|${x.toFixed(1)}`;
    if (key === this.lastReadout) return;
    this.lastReadout = key;
    document.getElementById("scroll-cm").textContent = `${cm.toFixed(1)} / 1191.5 cm`;
    document.getElementById("scroll-seg").textContent = segName(x);
    this.el.setAttribute("aria-valuetext", `${cm.toFixed(1)} 厘米，${segName(x)}`);
  },
  setPlaying(on) {
    this.playing = !!on;
    if (!this.playing) this.ending = false;
    if (this.playing && this.u >= 0.985) {
      this.ending = false;
      this.apply(0);
    }
    cam.active = false;
    setToggle("btn-scroll", this.playing);
    announce(this.playing ? "开始自动展卷" : "已暂停展卷");
  },
};
function segName(x) {
  let best = GROUPS[0], bd = 1e9;
  for (const g of GROUPS) { const d = Math.abs(g.cx - x); if (d < bd) { bd = d; best = g; } }
  return `第 ${best.id} 组 · ${best.name}`;
}
const endScrollDrag = () => (scroll.dragging = false);
scroll.el.addEventListener("pointerdown", () => {
  scroll.dragging = true;
  scroll.setPlaying(false);
});
scroll.el.addEventListener("pointercancel", endScrollDrag);
addEventListener("pointerup", endScrollDrag);
scroll.el.addEventListener("input", () => {
  scroll.ending = false;
  scroll.apply(+scroll.el.value / 1000);
});
document.getElementById("btn-scroll").onclick = () => scroll.setPlaying(!scroll.playing);

/* ---- 按钮 ---- */
let lampsForced = false;
document.getElementById("btn-lamps").onclick = () => {
  lampsForced = !lampsForced;
  setToggle("btn-lamps", lampsForced);
  setTime(lampsForced ? 0.90 : 0.42);
  announce(lampsForced ? "已切换到渔火" : "已恢复白昼");
};
const dye = { start: 0, dur: 0 };
function startDye() {
  scroll.setPlaying(false);
  silkTarget = 0;
  setToggle("btn-silk", false);
  if (reducedMotionQuery.matches) {
    dye.dur = 0;
    dyeU.value = 2;
    announce("已按减少动态效果偏好直接显示染色完成态");
    return;
  }
  dye.start = performance.now();
  dye.dur = 9200;
  dyeU.value = 0;
  announce("开始重新染色");
}
document.getElementById("btn-dye").onclick = startDye;
let silkTarget = 0;
document.getElementById("btn-silk").onclick = () => {
  if (dye.dur > 0) {
    dye.dur = 0;
    dyeU.value = 2;
  }
  silkTarget = silkTarget > 0.5 ? 0 : 1;
  setToggle("btn-silk", silkTarget > 0.5);
  announce(silkTarget > 0.5 ? "已压回绢本" : "已回到三维世界");
};
let spin = false;
document.getElementById("btn-spin").onclick = () => {
  spin = !spin;
  setToggle("btn-spin", spin);
  announce(spin ? "自动环视已开启" : "自动环视已关闭");
};
document.getElementById("btn-shot").onclick = () => {
  composer.render();
  canvas.toBlob((blob) => {
    if (!blob) {
      announce("存影失败，请重试");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `青绿千里_${CH[chIdx].k}_${Date.now()}.png`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce("当前画面已存为 PNG");
  }, "image/png");
};

function applyQuality(mode, silent = false) {
  qualityMode = QUALITY_PRESETS[mode] ? mode : "balanced";
  quality = QUALITY_PRESETS[qualityMode];
  PR = quality.composer;
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.dpr));
  const size = viewportSize();
  renderer.setSize(size.width, size.height);
  composer.setPixelRatio(PR);
  bloom.enabled = quality.bloom;
  for (const name of ["mist", "spray"]) {
    for (const mesh of meshes[name] || []) mesh.visible = quality.secondary;
  }
  if (!silent) announce(`画质：${quality.label}`);
}

const stopBodyDrag = () => document.body.classList.remove("dragging");
canvas.addEventListener("pointerdown", () => {
  document.body.classList.add("dragging");
  cam.active = false;
  scroll.setPlaying(false);
  spin = false;
  setToggle("btn-spin", false);
});
addEventListener("pointerup", stopBodyDrag);
addEventListener("pointercancel", stopBodyDrag);
addEventListener("blur", stopBodyDrag);
canvas.addEventListener("wheel", () => {
  scroll.setPlaying(false);
  spin = false;
  setToggle("btn-spin", false);
}, { passive: true });
canvas.addEventListener("dblclick", () => goChapter(chIdx));
addEventListener("keydown", (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target;
  if (target instanceof Element && target.closest("input, button, select, textarea, [contenteditable]")) return;
  const key = e.key.toLowerCase();
  if (e.key === "ArrowRight") { e.preventDefault(); goChapter((chIdx + 1) % CH.length); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); goChapter((chIdx - 1 + CH.length) % CH.length); }
  else if (e.key === " ") { e.preventDefault(); startDye(); }
  else if (key === "l") document.getElementById("btn-lamps").click();
  else if (key === "s") document.getElementById("btn-silk").click();
  else if (key === "u") document.getElementById("btn-scroll").click();
});

function resizeRenderer() {
  const size = viewportSize();
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.dpr));
  renderer.setSize(size.width, size.height);
  composer.setSize(size.width, size.height);
}
addEventListener("resize", resizeRenderer);
addEventListener("load", resizeRenderer);
if ("ResizeObserver" in window) new ResizeObserver(resizeRenderer).observe(document.documentElement);
setTimeout(resizeRenderer, 250);
setTimeout(resizeRenderer, 1000);
const resizeWatch = setInterval(() => {
  const size = viewportSize();
  if (canvas.width !== Math.round(size.width * renderer.getPixelRatio()) || canvas.height !== Math.round(size.height * renderer.getPixelRatio())) resizeRenderer();
}, 250);
setTimeout(() => clearInterval(resizeWatch), 6000);

canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  /* 只弹提示不停帧循环的话，每一帧都会再抛一次 GL 错误刷满控制台。 */
  contextLost = true;
  showFatal("图形上下文已中断。可关闭其他高负载标签页后重试。");
});
canvas.addEventListener("webglcontextrestored", () => location.reload());

document.addEventListener("visibilitychange", () => {
  last = performance.now();
  fpsAcc = 0;
  fpsN = 0;
});

/* ============================== 帧循环 ============================== */
const _v = new THREE.Vector3();
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _sunDir = new THREE.Vector3();
let last = performance.now(), motionClock = 0, contextLost = false;
let fpsAcc = 0, fpsN = 0, perfAcc = 0, perfN = 0;
const perfFrames = [];
let frameTris = 0, frameCalls = 0;

function updateFlock(im, tSec, dt) {
  if (!im) return;
  const seeds = im.userData.seeds;
  for (let i = 0; i < seeds.length; i++) {
    const b = seeds[i];
    const a = b.ph + tSec * b.sp;
    const flap = Math.sin(tSec * 5.4 + b.ph * 9) * 0.6;
    _v.set(b.cx + Math.cos(a) * b.r, b.cy + Math.sin(tSec * 0.3 + b.ph) * 12 + b.off * 0.4, b.cz + Math.sin(a) * b.r * 0.55);
    _e.set(flap * 0.5, -a + (b.sp > 0 ? Math.PI / 2 : -Math.PI / 2), 0);
    _q.setFromEuler(_e);
    _s.setScalar(b.sc);
    _m4.compose(_v, _q, _s);
    im.setMatrixAt(i, _m4);
  }
  im.instanceMatrix.needsUpdate = true;
}

function tick(now) {
  if (contextLost) return;
  requestAnimationFrame(tick);
  renderer.info.reset();
  const rawDt = Math.max(0, (now - last) / 1000);
  const motionDt = Math.min(0.25, rawDt);
  const dt = Math.min(0.05, motionDt);
  motionClock += motionDt;
  last = now;
  const tSec = now / 1000;
  timeU.value = tSec;

  /* 运镜 */
  if (cam.active) {
    const k = Math.min(1, (now - cam.t0) / cam.dur);
    const e = ease(k);
    camera.position.lerpVectors(cam.from, cam.to, e);
    controls.target.lerpVectors(cam.qFrom, cam.qTo, e);
    camera.fov = cam.fFrom + (cam.fTo - cam.fFrom) * e;
    camera.updateProjectionMatrix();
    if (k >= 1) cam.active = false;
  }
  /* 展卷：自右向左巡航；先完整到达卷尾并停留，再回到卷首。 */
  if (scroll.playing) {
    if (scroll.ending) {
      if (now >= scroll.holdUntil) {
        scroll.ending = false;
        scroll.apply(0);
      }
    } else {
      scroll.u += motionDt / 52;
      if (scroll.u >= 1) {
        scroll.u = 1;
        scroll.ending = true;
        scroll.holdUntil = now + 1600;
        scroll.apply(1);
        announce("已到卷尾，1191.5 厘米");
      } else {
        scroll.apply(scroll.u);
      }
    }
  }
  if (!cam.active && !scroll.playing && spin) {
    const s = reducedMotionQuery.matches ? 0.008 : 0.024;
    _v.copy(camera.position).sub(controls.target);
    const a = Math.atan2(_v.z, _v.x) + s * motionDt;
    const r = Math.hypot(_v.x, _v.z);
    camera.position.x = controls.target.x + Math.cos(a) * r;
    camera.position.z = controls.target.z + Math.sin(a) * r;
  }
  controls.update();
  /* 模型没有底：不许镜头钻到水面之下 */
  if (camera.position.y < 3.5) camera.position.y = 3.5;

  /* 时辰 */
  timeT += (timeTarget - timeT) * Math.min(1, dt * 1.7);
  const S = lerpStop(timeT);
  const el = (S.el * Math.PI) / 180, az = (S.az * Math.PI) / 180;
  const sd = _sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  /* 阴影相机跟着视点走：长卷一次只照一段，2048 的贴图才够细 */
  sun.position.copy(controls.target).addScaledVector(sd, 900);
  sun.target.position.copy(controls.target);
  sun.color.copy(S.sun);
  sun.intensity = Math.max(0, S.si * (0.34 + 0.66 * Math.max(0, sd.y)));
  hemi.color.copy(S.hemiS); hemi.groundColor.copy(S.hemiG); hemi.intensity = S.hi;
  fill.intensity = 0.16 + S.hi * 0.3;
  scene.fog.color.copy(S.fog);
  scene.fog.density = S.fd;
  renderer.toneMappingExposure = S.exp;
  skyU.uFog.value.copy(S.fog);
  skyU.uZen.value.copy(S.zen);
  skyU.uHor.value.copy(S.hor);
  skyU.uSun.value.copy(sd);
  skyU.uSunCol.value.copy(S.sun);
  skyU.uStar.value = S.star;
  skyU.uTime.value = tSec;
  sky.position.copy(camera.position);

  waterU.uCam.value.copy(camera.position);
  waterU.uSun.value.copy(sd);
  waterU.uSunCol.value.copy(S.sun);
  waterU.uZen.value.copy(S.zen);
  waterU.uHor.value.copy(S.hor);
  waterU.uFog.value.copy(S.fog);
  waterU.uFogD.value = S.fd;
  /* 「入夜程度」必须直接取时辰表里作者写好的星与灯，而不是从仰角反推：
     旧式 1 - (el+6)/18 在渔火那一格（el=12）刚好算出 0，
     于是水面在深夜仍是白天的薄荷绿，倒影分支永远不进。 */
  const night = Math.max(S.star, S.lamp);
  waterU.uNight.value = night;
  if (night > 0.02) updateLampReflections();
  /* 夜里水色要退成墨，白天才是汁绿 */
  waterU.uGreen.value.setHex(0x86a396, THREE.SRGBColorSpace).lerp(_c2.setHex(0x1c2430, THREE.SRGBColorSpace), night);

  const lampWant = lampsForced ? 1 : S.lamp;
  emitU.value += (lampWant * 1.05 - emitU.value) * Math.min(1, dt * 2.2);
  for (const l of lampLights) l.intensity = emitU.value * 190;
  bloom.strength = 0.16 + emitU.value * 0.34 + S.star * 0.06;

  /* 染色 */
  if (dye.dur > 0) {
    const k = (now - dye.start) / dye.dur;
    dyeU.value = k >= 1 ? 2.0 : ease(Math.min(1, k));
    if (k >= 1) {
      dye.dur = 0;
      announce("染色完成");
    }
  }
  /* 读画：完全关闭时不执行昂贵的绢本像素着色器。 */
  const silkMix = silkPass.uniforms.uMix;
  silkMix.value += (silkTarget - silkMix.value) * Math.min(1, dt * 3.4);
  silkPass.uniforms.uTime.value = tSec;
  silkPass.enabled = silkTarget > 0 || silkMix.value > 0.001;

  /* 夜里云要退场：半透明薄片在月光下会读成一块灰飞碟。 */
  M.cloud.opacity = 0.9 - night * 0.62;
  M.mist.opacity = 0.22 - night * 0.10;

  if (wheelRotor) wheelRotor.rotation.z -= motionDt * (reducedMotionQuery.matches ? 0.05 : 0.22);
  const lifeClock = motionClock * (reducedMotionQuery.matches ? 0.35 : 1);
  updateFlock(flockMesh, lifeClock, dt);
  updateFlock(craneMesh, lifeClock, dt);

  composer.render();
  frameTris = renderer.info.render.triangles;
  frameCalls = renderer.info.render.calls;

  if (rawDt > 0 && rawDt < 0.25) {
    fpsAcc += rawDt; fpsN++;
    perfAcc += rawDt; perfN++;
    perfFrames.push(rawDt);
  }
  if (fpsAcc > 0.5) {
    const fps = Math.round(fpsN / fpsAcc);
    document.getElementById("st-fps").textContent = fps;
    fpsAcc = 0; fpsN = 0;
  }
  if (perfAcc >= 2) {
    const sorted = perfFrames.slice().sort((a, b) => a - b);
    const p95Frame = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || 0;
    const avgFps = perfN / perfAcc;
    if (!qualityLocked && p95Frame > 1 / 40) {
      qualityLocked = true;
      applyQuality(avgFps < 27 || p95Frame > 1 / 27 ? "eco" : "balanced");
    }
    perfAcc = 0; perfN = 0; perfFrames.length = 0;
  }
}

/* ============================== 调试接口 ============================== */
function terrainTop(x, z) {
  const t = built?.terrain;
  if (!t?.top) return -1;
  const ix = Math.floor(x), iz = Math.floor(z);
  if (ix < t.x0 || ix >= t.x0 + t.nx || iz < t.z0 || iz >= t.z0 + t.nz) return -1;
  return t.top[(ix - t.x0) * t.nz + (iz - t.z0)];
}

window.QL = {
  chapter: (i) => goChapter(i),
  time: (t) => setTime(t, false),
  dye: (v) => { dye.dur = 0; dyeU.value = v; },
  redye: startDye,
  scroll: (u) => scroll.apply(u),
  play: (on = true) => scroll.setPlaying(!!on),
  silk: (on = true) => { silkTarget = on ? 1 : 0; setToggle("btn-silk", !!on); },
  lamps: (on = true) => { lampsForced = !!on; setToggle("btn-lamps", !!on); setTime(on ? 0.90 : 0.42, false); },
  spin: (on = true) => { spin = !!on; setToggle("btn-spin", !!on); },
  quality: (mode) => { qualityLocked = true; applyQuality(mode); },
  resize: () => resizeRenderer(),
  shot: () => document.getElementById("btn-shot").click(),
  ready: () => !!built && loader.classList.contains("gone"),
  hide: (name, off = true) => {
    if (name === "sky") { sky.visible = !off; return; }
    if (name === "water") { water.visible = !off; return; }
    for (const m of meshes[name] ?? []) m.visible = !off;
  },
  shadows: (on) => { renderer.shadowMap.enabled = !!on; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); },
  pr: (v) => { PR = v; composer.setPixelRatio(v); },
  terrainTop,
  webglInfo: () => {
    const gl = renderer.getContext();
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      webgl2: renderer.capabilities.isWebGL2,
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      floatBuffer,
    };
  },
  /* 屏幕取色反查：给定画布像素，射线打回去，告诉你是哪一组网格、哪个世界点。
     「这块白到底是什么」这类问题靠猜要猜半天，靠问一句只要 5 ms。 */
  pick: (sx, sy) => {
    const r = new THREE.Raycaster();
    const size = viewportSize();
    const ndc = new THREE.Vector2((sx / size.width) * 2 - 1, -(sy / size.height) * 2 + 1);
    r.setFromCamera(ndc, camera);
    const named = [];
    for (const [k, list] of Object.entries(meshes)) for (const m of list) { m.userData.qname = k; named.push(m); }
    for (const o of [sky, water]) named.push(o);
    const hits = r.intersectObjects(named, false);
    return hits.slice(0, 3).map((h) => ({
      group: h.object.userData.qname ?? h.object.type,
      point: [+h.point.x.toFixed(1), +h.point.y.toFixed(1), +h.point.z.toFixed(1)],
      dist: +h.distance.toFixed(1),
      color: h.face && h.object.geometry.attributes.color
        ? Array.from(h.object.geometry.attributes.color.array.slice(h.face.a * 3, h.face.a * 3 + 3))
        : null,
    }));
  },
  scrollPath: (samples = 400) => {
    /* 探针必须读完就还原：以前它把相机留在卷尾，后续量测全在错误的机位上做。 */
    const saved = {
      pos: camera.position.clone(), tgt: controls.target.clone(),
      fov: camera.fov, u: scroll.u, playing: scroll.playing, anim: cam.active,
    };
    scroll.setPlaying(false);
    cam.active = false;
    spin = false;
    setToggle("btn-spin", false);
    const rows = [];
    let minClear = Infinity, buried = 0, blocked = 0, outside = 0;
    const every = Math.max(1, Math.floor(samples / 8));
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      scroll.apply(u);
      const cx = camera.position.x, cz = camera.position.z;
      const top = terrainTop(cx, cz);
      const clear = top < 0 ? null : camera.position.y - top;
      if (clear === null) outside++;
      else {
        minClear = Math.min(minClear, clear);
        if (clear <= 0) buried++;
      }
      /* 展卷机位恒在世界之外（z=322 > WORLD.z1），只量"脚下有没有山"是恒真的。
         真正会出事的是视线起段被地形埋住，所以沿相机→目标再走一段去探。 */
      let blockDist = null;
      for (let k = 1; k <= 24; k++) {
        const t = k / 24;
        const px = lerp(cx, controls.target.x, t), pz = lerp(cz, controls.target.z, t);
        const py = lerp(camera.position.y, controls.target.y, t);
        const tt = terrainTop(px, pz);
        if (tt >= 0 && py <= tt + 1) { blockDist = +Math.hypot(px - cx, pz - cz).toFixed(1); break; }
      }
      if (blockDist !== null && blockDist < 40) blocked++;
      if (i === 0 || i === samples || i % every === 0) {
        rows.push({
          u, cm: Number.parseFloat(scrollCmText()), x: +cx.toFixed(1),
          y: camera.position.y, z: camera.position.z, top,
          clearance: clear === null ? null : +clear.toFixed(1), blockDist,
        });
      }
    }
    camera.position.copy(saved.pos);
    controls.target.copy(saved.tgt);
    camera.fov = saved.fov;
    camera.updateProjectionMatrix();
    scroll.playing = saved.playing;
    cam.active = saved.anim;
    scroll.setU(saved.u);
    return {
      samples: samples + 1,
      /* 两端读数取自页面上真正显示的那行字，不再硬编码 0 / 1191.5。 */
      startCm: rows[0].cm,
      endCm: rows[rows.length - 1].cm,
      minClearance: Number.isFinite(minClear) ? +minClear.toFixed(1) : null,
      outsideWorldSamples: outside,
      buriedSamples: buried,
      blockedSamples: blocked,
      path: rows,
    };
  },
  /* 编译期自检：三矾九染的落色代码到底有没有进到 GLSL 里。
     onBeforeCompile 的 replace 目标写错时，程序照样编译通过、画面照样有顶点色，
     只有染色会静悄悄地失效——所以把"有没有"做成硬检查。 */
  /* 自检：每一处 shader 注入是否真的命中了替换目标。
     染色失效时画面不会报错、也不会掉帧，只有「重新染一遍」悄悄变成
     「重新擦一遍」——所以把注入结果做成可读取的硬指标。 */
  shaderProbe: () => {
    const entries = [...shaderPatchLog.entries()];
    const lit = entries.filter(([, v]) => !v.emissive);
    const every = (list, k) => list.length > 0 && list.every(([, v]) => v[k] === true);
    return {
      compiled: entries.length,
      materials: entries.map(([k]) => k),
      revealGuard: every(entries, "revealGuard"),
      dyeCalled: every(lit, "dyeCalled"),
      srgbVertexColor: every(entries, "srgbVertexColor"),
      leftoverInclude: entries.some(([, v]) => v.includeLeftover),
      emitScaleApplied: entries.every(([, v]) => v.emitScaleApplied),
    };
  },
  get stats() {
    return {
      calls: frameCalls,
      renderTriangles: Number.isFinite(frameTris) ? frameTris : null,
      fps: document.getElementById("st-fps").textContent,
      pr: PR,
      quality: qualityMode,
      voxels: built?.stats.voxels,
      faces: built?.stats.faces,
      triangles: built?.stats.triangles,
      farBlocks: built?.stats.farBlocks,
      wheelBlocks: built?.stats.wheelBlocks,
      chunks: built?.stats.chunks,
      buildMs: window.__buildMs,
      heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
    };
  },
  cam: (x, y, z, tx, ty, tz, fov = 32) => {
    cam.active = false; scroll.setPlaying(false);
    camera.position.set(x, y, z);
    controls.target.set(tx, ty, tz);
    camera.fov = fov; camera.updateProjectionMatrix();
    scroll.setU(scroll.uForX(x - 34));
  },
  /* 验收探针：当前画面的平均色与平均色相（圆均值），用于量「读画」换没换色彩语言。 */
  probe: () => {
    composer.render();
    const cv = renderer.domElement;
    const c2 = document.createElement("canvas");
    c2.width = 160; c2.height = 100;
    const ctx = c2.getContext("2d");
    ctx.drawImage(cv, 0, 0, 160, 100);
    const d = ctx.getImageData(0, 0, 160, 100).data;
    let sr = 0, sg = 0, sb = 0, n = 0, hx = 0, hy = 0, hsx = 0, hsy = 0, ns = 0, satSum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      sr += r; sg += g; sb += b; n++;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      satSum += mx - mn;
      if (mx - mn < 0.02) continue;
      let h;
      if (mx === r) h = ((g - b) / (mx - mn)) % 6;
      else if (mx === g) h = (b - r) / (mx - mn) + 2;
      else h = (r - g) / (mx - mn) + 4;
      h *= 60;
      hx += Math.cos(h * Math.PI / 180); hy += Math.sin(h * Math.PI / 180);
      if (mx - mn > 0.12) { hsx += Math.cos(h * Math.PI / 180); hsy += Math.sin(h * Math.PI / 180); ns++; }
    }
    let hue = Math.atan2(hy, hx) * 180 / Math.PI;
    if (hue < 0) hue += 360;
    let hueSat = ns ? Math.atan2(hsy, hsx) * 180 / Math.PI : -1;
    if (hueSat < 0) hueSat += 360;
    return {
      rgb: [sr / n, sg / n, sb / n].map((v) => +v.toFixed(3)),
      hue: +hue.toFixed(1), hueSat: +hueSat.toFixed(1),
      sat: +(satSum / n).toFixed(3), satPix: ns, n,
    };
  },
  camerapos: () => [camera.position.x, camera.position.y, camera.position.z].map((v) => +v.toFixed(1)),
  scrollU: () => scroll.u,
  chapterIdx: () => chIdx,
  scrollCm: () => document.getElementById("scroll-cm").textContent,
};

function scrollCmText() {
  return document.getElementById("scroll-cm").textContent.split("/")[0].trim();
}

boot();

if ("serviceWorker" in navigator && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
