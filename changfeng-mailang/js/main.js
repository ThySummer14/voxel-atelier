// 《长风麦浪》主场景：光照 / 阴影 / 后处理 / 相机 / 动画。

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { buildWorld, W, D, H, streamZ } from './world.js';
import {
  buildWindmill, buildCottage, buildBarn, buildBridge, bridgeCrossing,
  buildTrees, buildFences, buildHaystacks, buildWell,
} from './props.js';
import { meshWorld, meshSet } from './mesher.js';
import { makeSky, makeSun, makeSkyline, makeClouds, makeBirds, updateBirds, SUN_DIR } from './sky.js';

const qs = new URLSearchParams(location.search);
const num = (k, d) => (qs.has(k) ? parseFloat(qs.get(k)) : d);

const OPT = {
  seed: num('seed', 20261001),
  sunI: num('sun', 7.6),
  hemiI: num('hemi', 2.7),
  fillI: num('fill', 1.5),
  exposure: num('exp', 1.0),
  bloom: num('bloom', 0.30),
  bloomTh: num('bloomTh', 1.0),
  fogNear: num('fogNear', 150),
  fogFar: num('fogFar', 560),
  cam: num('cam', 0),
  clay: num('clay', 0),
  post: num('post', 1),
  shadows: num('shadows', 1),
  normBias: num('nbi', 0.16),
  time: num('t', 0),
  shot: num('shot', 1),
};

// 相机机位（pos / target / fov）—— 高度与朝向按 check.mjs 实测的地表高度排过
const CAMS = [
  { pos: [112, 50, 214], target: [136, 32, 102], fov: 50 },   // 主画面（tools/search.mjs 解出来的机位）
  { pos: [112, 50, 214], target: [136, 32, 102], fov: 43 },   // 同一构图收紧
  { pos: [104, 44, 206], target: [150, 34, 94], fov: 44 },    // 贴近风车
  { pos: [70, 38, 198], target: [126, 34, 110], fov: 48 },    // 从西侧看溪谷
  { pos: [118, 66, 216], target: [128, 30, 98], fov: 52 },    // 俯视全景
  { pos: [152, 42, 178], target: [120, 34, 88], fov: 46 },    // 从东侧逆光看麦田
];

const status = document.getElementById('status');
const diag = document.getElementById('diag');
const say = (s) => { if (status) status.textContent = s; };
const diagSet = (s) => { if (diag) diag.textContent = s; };
addEventListener('error', (e) => diagSet('ERROR: ' + (e.message || e) + ' @ ' + (e.filename || '') + ':' + (e.lineno || '')));
addEventListener('unhandledrejection', (e) => diagSet('REJECT: ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason)));

// ---------- 构建 ----------
say('生成地形与麦田…');
const ctx = buildWorld(OPT.seed);
ctx.W = W; ctx.D = D; ctx.H = H;
const { world, water, glow, sails } = ctx;

say('盖房子、种树…');
const mill = buildWindmill(ctx);
const cot = buildCottage(ctx);
const barn = buildBarn(ctx);
buildBridge(ctx, bridgeCrossing(ctx));
buildTrees(ctx);
buildFences(ctx);
buildHaystacks(ctx);
buildWell(ctx);

// 屋顶下不能漏出麦子/花：把建筑范围内的空中体素清掉
for (const b of [cot, barn]) {
  for (let z = b.cz - b.hz; z <= b.cz + b.hz; z++)
    for (let x = b.cx - b.hx; x <= b.cx + b.hx; x++) {
      if (x < 0 || z < 0 || x >= W || z >= D) continue;
      for (let y = b.top; y < H; y++) world.solid[world.idx(x, y, z)] = 0;
    }
}

say('网格化体素…');
const landGeo = meshWorld(world);
const waterGeo = meshSet(water);
const glowGeo = meshSet(glow);
const sailGeo = meshSet(sails);

// ---------- 材质 ----------
const uTime = { value: OPT.time };

// 云影：低空大云缓慢掠过田野，只压直射光、不动环境光——黄昏逆光下最提气氛的一笔
const CLOUD_SHADOW_GLSL = /* glsl */`
  float cf_h21( vec2 p ) {
    p = fract( p * vec2( 123.34, 345.45 ) );
    p += dot( p, p + 34.345 );
    return fract( p.x * p.y );
  }
  float cf_vn( vec2 p ) {
    vec2 i = floor( p ), f = fract( p );
    vec2 u = f * f * ( 3.0 - 2.0 * f );
    return mix( mix( cf_h21( i ), cf_h21( i + vec2( 1.0, 0.0 ) ), u.x ),
                mix( cf_h21( i + vec2( 0.0, 1.0 ) ), cf_h21( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
  }
  float cloudShade( vec2 wp, float t ) {
    float n = cf_vn( wp * 0.0042 + vec2( t * 0.0040, t * 0.0016 ) ) * 0.68
            + cf_vn( wp * 0.0125 - vec2( t * 0.0022, 0.0 ) ) * 0.32;
    return mix( 0.74, 1.0, smoothstep( 0.46, 0.74, n ) );
  }
`;

function swayMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.uniforms.uSunGlow = { value: new THREE.Vector3().copy(SUN_DIR) };
    shader.vertexShader = 'uniform float uTime;\nattribute vec3 aWind;\nvarying vec3 vWPs;\nvarying float vSway;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', /* glsl */`
      vec3 transformed = vec3( position );
      vSway = aWind.x;
      vWPs = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
      float amp = aWind.x;
      if ( amp > 0.001 ) {
        float ph = position.x * 0.155 + position.z * 0.108;
        float w = sin( uTime * 1.45 + ph ) * 0.62 + sin( uTime * 2.65 + ph * 1.73 ) * 0.26;
        transformed.x += w * amp * 0.78;
        transformed.z += cos( uTime * 1.15 + ph * 0.82 ) * amp * 0.46;
        transformed.y -= abs( w ) * amp * 0.09;
      }
    `);
    shader.fragmentShader = 'uniform float uTime;\nuniform vec3 uSunGlow;\nvarying vec3 vWPs;\nvarying float vSway;\n'
      + CLOUD_SHADOW_GLSL + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>', /* glsl */`
      #include <lights_fragment_end>
      float cf = cloudShade( vWPs.xz, uTime );
      reflectedLight.directDiffuse *= cf;
      // 麦穗透光：太阳在镜头背后这一侧，穗子会透出一层暖光，这是黄昏麦田最要紧的一层
      if ( vSway > 0.02 ) {
        vec3 V = normalize( cameraPosition - vWPs );
        float tr = pow( max( dot( V, -uSunGlow ), 0.0 ), 3.0 );
        reflectedLight.directDiffuse += diffuseColor.rgb * vec3( 1.0, 0.76, 0.42 )
          * tr * vSway * 2.2 * cf;
      }
    `);
  };
  m.customProgramCacheKey = () => 'voxelSwayCloud';
  return m;
}

function waterMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = 'varying vec3 vWP;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n  vWP = ( modelMatrix * vec4( position, 1.0 ) ).xyz;',
    );
    shader.fragmentShader = 'varying vec3 vWP;\nuniform float uTime;\n' + shader.fragmentShader.replace(
      '#include <color_fragment>', /* glsl */`
        #include <color_fragment>
        float rip  = sin( vWP.x * 0.52 + uTime * 1.5 ) * sin( vWP.z * 0.44 - uTime * 1.05 );
        float rip2 = sin( vWP.x * 1.27 - uTime * 2.1 + vWP.z * 0.85 );
        diffuseColor.rgb *= 0.86 + 0.22 * smoothstep( 0.05, 1.0, rip );
        diffuseColor.rgb += vec3( 1.0, 0.88, 0.66 ) * 0.30 * smoothstep( 0.80, 1.0, rip2 );
      `,
    );
  };
  m.customProgramCacheKey = () => 'voxelWater';
  return m;
}

// ---------- 场景 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = OPT.exposure;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const HAZE = 0xdfc090;
scene.fog = new THREE.Fog(HAZE, OPT.fogNear, OPT.fogFar);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.6, 2200);
const camCfg = CAMS[OPT.cam % CAMS.length];
camera.position.set(...camCfg.pos);
camera.fov = camCfg.fov;
camera.updateProjectionMatrix();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(...camCfg.target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 18;
controls.maxDistance = 480;
controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotate = !OPT.shot;
controls.autoRotateSpeed = 0.14;
controls.addEventListener('start', () => { controls.autoRotate = false; });
window.__controls = controls;

// 光
const sun = new THREE.DirectionalLight(0xffd9a4, OPT.sunI);
const sunTarget = new THREE.Vector3(110, 20, 96);
sun.position.copy(sunTarget).addScaledVector(SUN_DIR, 320);
sun.target.position.copy(sunTarget);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;
sun.shadow.camera.near = 90;
sun.shadow.camera.far = 560;
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = OPT.normBias;
scene.add(sun, sun.target);

const hemi = new THREE.HemisphereLight(0x9ec6ea, 0xa78b58, OPT.hemiI);
scene.add(hemi);

const fill = new THREE.DirectionalLight(0xa6c6e8, OPT.fillI);
fill.position.set(230, 110, 260);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffc98a, 0.45);
rim.position.set(120, 22, 260);
scene.add(rim);

// 网格
const land = new THREE.Mesh(landGeo, swayMaterial());
land.castShadow = true;
land.receiveShadow = true;
scene.add(land);

const waterMesh = new THREE.Mesh(waterGeo, waterMaterial());
waterMesh.receiveShadow = true;
scene.add(waterMesh);

const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
glowMat.color.setScalar(1.55);   // 窗户是亮点，但不是白洞
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
scene.add(glowMesh);

const sailGroup = new THREE.Group();
sailGroup.position.set(mill.hub[0], mill.hub[1], mill.hub[2]);
const sailMesh = new THREE.Mesh(sailGeo, new THREE.MeshLambertMaterial({ vertexColors: true }));
sailMesh.castShadow = true;
sailGroup.add(sailMesh);
scene.add(sailGroup);

// 天空
scene.add(makeSky());
// 远景地面圆盘：盖住世界边缘，让地平线自然接到远山
const farGround = new THREE.Mesh(
  new THREE.CircleGeometry(700, 48),
  new THREE.MeshBasicMaterial({ color: 0x9c8a62, fog: true }),
);
farGround.rotation.x = -Math.PI / 2;
farGround.position.y = 2;
scene.add(farGround);
const sunSprite = makeSun();
scene.add(sunSprite);
scene.add(makeSkyline(ctx.N, camCfg.pos[1]));
const clouds = makeClouds(ctx.N, camCfg.pos);
scene.add(clouds);
const birds = makeBirds(ctx.N);
for (const b of birds) scene.add(b.g);

// 炊烟
const smokeMat = new THREE.MeshBasicMaterial({ color: 0xd9cdb8, transparent: true, opacity: 0.16, depthWrite: false, fog: false });
const smoke = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), smokeMat, 46);
smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
smoke.frustumCulled = false;
scene.add(smoke);
const smokeSeeds = [];
for (let i = 0; i < 46; i++) smokeSeeds.push({ o: i / 46, dx: ctx.N.value2(i, 1) - 0.5, dz: ctx.N.value2(i, 2) - 0.5, sp: 0.55 + ctx.N.value2(i, 3) * 0.5 });

// 水面反光碎点
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
sparkMat.color.setScalar(1.35);
const sparks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 0.35), sparkMat, 70);
sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
sparks.frustumCulled = false;
scene.add(sparks);
const sparkSeeds = [];
for (let i = 0; i < 70; i++) {
  const x = 8 + ctx.N.value2(i * 3.1, 7.7) * (W - 16);
  sparkSeeds.push({ x, z: streamZ(x) + (ctx.N.value2(i, 5.5) - 0.5) * 6.4, o: ctx.N.value2(i, 9.1), sp: 3 + ctx.N.value2(i, 2.2) * 6 });
}

// ---------- 后处理 ----------
// 半浮点缓冲拿不到时退回 8 位，别让用户直接黑屏
const glctx = renderer.getContext();
const canFloat = !!(glctx.getExtension('EXT_color_buffer_half_float') || glctx.getExtension('EXT_color_buffer_float'));
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, {
  type: canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: 4,
}));
if (OPT.clay) OPT.post = 0;
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), OPT.bloom, 0.20, OPT.bloomTh);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- 太阳 ----------
// 太阳必须挂在「相机」的方向上；挂在世界原点会因为视差落到低得多的仰角去
function placeSun() {
  sunSprite.position.copy(camera.position).addScaledVector(SUN_DIR, 820);
  sunSprite.lookAt(camera.position);
}
placeSun();

// 白模 / ID 模式：绕开光照与雾，直接量几何，用来客观核对构图与遮挡
if (OPT.clay) {
  renderer.toneMapping = THREE.NoToneMapping;
  scene.fog = null;
  const mat = (hex) => new THREE.MeshBasicMaterial({ color: hex, fog: false });
  land.material = mat(0x8a8a8a);
  waterMesh.material = mat(0x2f6bff);
  sailMesh.material = mat(0xffffff);
  glowMesh.material = mat(0xff2f2f);
  for (const o of [clouds, sunSprite, smoke, sparks, farGround]) o.visible = false;
  for (const b of birds) b.g.visible = false;
  for (const child of scene.children) {
    if (child.renderOrder === -80) child.visible = false;
    if (child.material && child.material.type === 'ShaderMaterial') child.material = mat(0x242424);
  }
  bloom.strength = 0;
}

if (!OPT.shadows) {
  renderer.shadowMap.enabled = false;
  sun.castShadow = false;
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// ---------- 循环 ----------
const dummy = new THREE.Object3D();
const smokeColor = new THREE.Color(0xd9cdb8);
const hazeColor = new THREE.Color(HAZE);
const tmpColor = new THREE.Color();
let t0 = performance.now();
let frames = 0;

function animate() {
  const now = performance.now();
  const t = OPT.shot ? OPT.time : (now - t0) / 1000;
  uTime.value = t;

  sailGroup.rotation.z = -t * 0.55;
  clouds.position.x = ((t * 1.6) % 900) - 450;
  updateBirds(birds, t);

  // 炊烟
  const [chx, chy, chz] = cot.chimney;
  for (let i = 0; i < smokeSeeds.length; i++) {
    const s = smokeSeeds[i];
    const life = ((t * s.sp * 0.16 + s.o) % 1);
    const rise = life * 26;
    const drift = life * life * 12;
    dummy.position.set(chx + s.dx * 8 + Math.sin(life * 5 + s.o * 9) * 2.2 + drift, chy + rise, chz + s.dz * 8 + Math.cos(life * 4 + s.o * 7) * 2.0);
    const sc = 1.4 + life * 7.5;
    dummy.scale.set(sc, sc, sc);
    dummy.rotation.set(0, life * 1.2 + s.o * 6, 0);
    dummy.updateMatrix();
    smoke.setMatrixAt(i, dummy.matrix);
    tmpColor.copy(smokeColor).lerp(hazeColor, Math.min(1, life * 1.5));
    smoke.setColorAt(i, tmpColor);
  }
  smoke.instanceMatrix.needsUpdate = true;
  if (smoke.instanceColor) smoke.instanceColor.needsUpdate = true;

  // 水面碎光
  for (let i = 0; i < sparkSeeds.length; i++) {
    const s = sparkSeeds[i];
    const ph = ((t * 0.35 + s.o) % 1);
    const x = s.x + ph * 14;
    const z = s.z + Math.sin(t * 0.8 + s.o * 12) * 0.7;
    const on = Math.pow(Math.max(0, Math.sin(t * 2.2 + s.o * 31)), 6);
    dummy.position.set(x, 6.6, z);
    dummy.scale.set(0.5 + on * 0.9, 0.25, 1.2);
    dummy.rotation.set(0, Math.sin(t + s.o * 9) * 0.9, 0);
    dummy.updateMatrix();
    sparks.setMatrixAt(i, dummy.matrix);
  }
  sparks.instanceMatrix.needsUpdate = true;

  controls.update();
  placeSun();
  if (OPT.post) composer.render(); else renderer.render(scene, camera);
  frames++;
  if (frames === 3) {
    document.body.classList.add('ready');
    if (OPT.shot) document.body.classList.add('shot');
    window.__ready = true;
    const info = `READY quad=${landGeo.userData.quads} tris=${landGeo.index.count / 3 | 0} water=${water.size} glow=${glow.size} sails=${sails.size} draw=${renderer.info.render.triangles} seed=${OPT.seed}`;
    diagSet(info + ' || ' + reportFraming());
    console.log('[长风麦浪] ' + info);
  }
  requestAnimationFrame(animate);
}
say('');
animate();

window.__setCam = (i) => {
  const c = CAMS[i % CAMS.length];
  camera.position.set(...c.pos);
  controls.target.set(...c.target);
  camera.fov = c.fov;
  camera.updateProjectionMatrix();
  controls.update();
};
window.__gotoCam = (i) => {
  const c = CAMS[i % CAMS.length];
  camera.position.set(...c.pos);
  controls.target.set(...c.target);
  camera.fov = c.fov;
  camera.updateProjectionMatrix();
  controls.autoRotate = false;
  controls.update();
  // 云的位置是按初始机位摆的，换机位后把它们带过去
  clouds.position.set(0, 0, 0);
  diagSet(`cam ${i} 已切换`);
};
window.__setTime = (v) => { OPT.time = v; };

// 用真实相机把地标投影到屏幕坐标，写进诊断——用来核对真实取景和离线推算是否一致
function reportFraming() {
  const pts = {
    轮毂: [mill.hub[0], mill.hub[1], mill.hub[2]],
    帆顶: [mill.hub[0], mill.hub[1] + 21, mill.hub[2]],
    帆右: [mill.hub[0] + 21, mill.hub[1], mill.hub[2]],
    帆左: [mill.hub[0] - 21, mill.hub[1], mill.hub[2]],
    农舍: [cot.cx, cot.floor + 10, cot.cz],
    谷仓: [barn.cx, barn.floor + 10, barn.cz],
    水面: [110, 6, 137],
    太阳: [camera.position.x + SUN_DIR.x * 900, camera.position.y + SUN_DIR.y * 900, camera.position.z + SUN_DIR.z * 900],
  };
  const out = [];
  for (const [k, p] of Object.entries(pts)) {
    const v = new THREE.Vector3(...p).project(camera);
    out.push(`${k}=(${(v.x * 0.5 + 0.5).toFixed(3)},${(0.5 - v.y * 0.5).toFixed(3)},z=${v.z.toFixed(2)})`);
  }
  const ch = [camera.position.x, camera.position.y, camera.position.z].map((n) => n.toFixed(1)).join(',');
  const tg = [controls.target.x, controls.target.y, controls.target.z].map((n) => n.toFixed(1)).join(',');
  const sw = landGeo.attributes.aWind.array;
  let mx = 0, sum = 0, n = 0, nz = 0;
  for (let i = 0; i < sw.length; i += 53) { const v = sw[i]; if (v > mx) mx = v; sum += v; n++; if (v > 0.02) nz++; }
  return `aWind max=${mx.toFixed(3)} mean=${(sum / n).toFixed(4)} frac>0.02=${(nz / n).toFixed(3)} | cam(${ch})→(${tg}) fov=${camera.fov} vp=${innerWidth}x${innerHeight} ` + out.join(' ');
}
window.__framing = reportFraming;