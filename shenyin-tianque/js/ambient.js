// ambient.js — 神隐天阙·天空穹顶 / 水面Shader / 三时相系统 / 蒸汽与仙气粒子

import * as THREE from '../vendor/three.module.js';

// ─── 三时相参数定义 ───
export const PHASES = [
  {
    name: '薄暮·神隐',
    // 英雄相：紫红绯霞向深靛蓝过渡，天边金辉，水天镜面
    skyTop: 0x141a38, skyMid: 0x6e3558, skyHor: 0xe87a58,
    fog: 0x5a344d, fogNear: 150, fogFar: 480,
    sunDir: [-0.6, 0.45, -0.65], sunColor: 0xffaa5e, sunInt: 2.8,
    hemiSky: 0x8a587c, hemiGround: 0x4a342a, hemiInt: 0.9,
    ambientColor: 0x443044, ambientInt: 0.35,
    glow: 0.85, star: 0.1, bloomStr: 0.28, bloomThr: 0.78,
    waterDeep: 0x22354a, waterShal: 0x5c4a5c, glint: 0xffc27a,
    exposure: 1.15,
  },
  {
    name: '华灯·盛宴',
    // 深邃星夜，千盏华灯与大红灯笼盛放，金碧辉煌
    skyTop: 0x070b18, skyMid: 0x101b38, skyHor: 0x223560,
    fog: 0x121a32, fogNear: 120, fogFar: 420,
    sunDir: [-0.4, 0.75, -0.5], sunColor: 0x8cb4f0, sunInt: 1.0,
    hemiSky: 0x2e3f6e, hemiGround: 0x161e30, hemiInt: 0.65,
    ambientColor: 0x1e2640, ambientInt: 0.3,
    glow: 1.35, star: 1.0, bloomStr: 0.52, bloomThr: 0.68,
    waterDeep: 0x0c1728, waterShal: 0x1a3050, glint: 0xffe2a0,
    exposure: 1.18,
  },
  {
    name: '晨曦·霁空',
    // 清亮晨雾，金光初破，水汽蒸腾
    skyTop: 0x4278a6, skyMid: 0x7faab8, skyHor: 0xf5dbb0,
    fog: 0x9ec0c8, fogNear: 160, fogFar: 520,
    sunDir: [-0.75, 0.35, -0.55], sunColor: 0xffe6b8, sunInt: 2.4,
    hemiSky: 0xa4c6d4, hemiGround: 0x78705a, hemiInt: 0.85,
    ambientColor: 0x606c78, ambientInt: 0.35,
    glow: 0.35, star: 0.0, bloomStr: 0.2, bloomThr: 0.86,
    waterDeep: 0x2d546a, waterShal: 0x6e9ea8, glint: 0xfff0d0,
    exposure: 1.10,
  },
];

function createGradientSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  function update(cTop, cMid, cHor) {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.0, '#' + cTop.getHexString());
    g.addColorStop(0.55, '#' + cMid.getHexString());
    g.addColorStop(1.0, '#' + cHor.getHexString());
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 512);
    tex.needsUpdate = true;
  }
  return { texture: tex, update };
}

function puffTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

function sparkleTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
  g.addColorStop(0, 'rgba(255,230,150,1.0)');
  g.addColorStop(0.35, 'rgba(255,160,50,0.6)');
  g.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

export function createAmbient(scene, build) {
  // 1. 动态渐变天空穹顶
  const sky = createGradientSky();
  scene.background = sky.texture;

  // 2. 自定义水面材质（流动波纹 + 天光高光 + 线性深度）
  const waterMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color(0x22354a) },
      uShallowColor: { value: new THREE.Color(0x5c4a5c) },
      uGlintColor: { value: new THREE.Color(0xffc27a) },
      uSunDir: { value: new THREE.Vector3(-0.6, 0.45, -0.65).normalize() },
      fogColor: { value: new THREE.Color(0x5a344d) },
      fogNear: { value: 150 },
      fogFar: { value: 480 },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      void main() {
        vNormal = normal;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uGlintColor;
      uniform vec3 uSunDir;
      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      void main() {
        float wave1 = sin(vWorldPos.x * 0.18 + uTime * 2.2 + vWorldPos.z * 0.12);
        float wave2 = cos(vWorldPos.z * 0.25 - uTime * 1.8 + vWorldPos.x * 0.15);
        float ripple = (wave1 + wave2) * 0.5;

        vec3 col = mix(uDeepColor, uShallowColor, ripple * 0.4 + 0.5);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 norm = normalize(vNormal + vec3(wave1 * 0.08, 1.0, wave2 * 0.08));
        vec3 halfDir = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(norm, halfDir), 0.0), 32.0);
        col += uGlintColor * spec * 0.65;

        float dist = length(cameraPosition - vWorldPos);
        float fogFactor = clamp((dist - fogNear) / (fogFar - fogNear), 0.0, 1.0);
        col = mix(col, fogColor, fogFactor);

        gl_FragColor = vec4(col, 0.92);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  // 3. 粒子系统与时相系统
  const particles = initParticles(scene, build);
  const phaseCtrl = initPhaseCtrl(scene, sky, waterMat, particles.fireflyMat);

  return {
    waterMat,
    setPhase: phaseCtrl.setPhase,
    get phaseIdx() { return phaseCtrl.phaseIdx; },
    update: (dt, env) => {
      phaseCtrl.update(dt, env);
      particles.update(dt, env, build);
    }
  };
}

// ─── 粒子系统初始化与更新 ───
function initParticles(scene, build) {
  // 1. 列车蒸汽烟雾
  const steamCount = 120;
  const steamGeo = new THREE.BufferGeometry();
  const steamPos = new Float32Array(steamCount * 3);
  const steamLife = new Float32Array(steamCount);
  const steamVel = new Float32Array(steamCount * 3);

  for (let i = 0; i < steamCount; i++) {
    steamLife[i] = Math.random();
    steamPos[i * 3 + 0] = 0;
    steamPos[i * 3 + 1] = -999;
    steamPos[i * 3 + 2] = 0;
    steamVel[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
    steamVel[i * 3 + 1] = 4.0 + Math.random() * 3.5;
    steamVel[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
  const steamMat = new THREE.PointsMaterial({
    size: 4.8,
    map: puffTexture(),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const steamPoints = new THREE.Points(steamGeo, steamMat);
  scene.add(steamPoints);

  // 2. 华灯微光与夜空流萤
  const fireflyCount = 150;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPos = new Float32Array(fireflyCount * 3);
  const fireflyBase = new Float32Array(fireflyCount * 3);
  for (let i = 0; i < fireflyCount; i++) {
    const x = -40 + Math.random() * 80;
    const y = 8 + Math.random() * 45;
    const z = -20 + Math.random() * 80;
    fireflyBase[i * 3 + 0] = x;
    fireflyBase[i * 3 + 1] = y;
    fireflyBase[i * 3 + 2] = z;
    fireflyPos[i * 3 + 0] = x;
    fireflyPos[i * 3 + 1] = y;
    fireflyPos[i * 3 + 2] = z;
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
  const fireflyMat = new THREE.PointsMaterial({
    size: 2.4,
    map: sparkleTexture(),
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  scene.add(fireflies);

  return {
    fireflyMat,
    update: (dt, env, b) => {
      const posArr = steamGeo.attributes.position.array;
      const trainPos = b.train.group.position;
      const chX = trainPos.x + b.train.chimney.x;
      const chY = trainPos.y + b.train.chimney.y;
      const chZ = trainPos.z + b.train.chimney.z;

      for (let i = 0; i < steamCount; i++) {
        steamLife[i] += dt * 0.75;
        if (steamLife[i] > 1.0) {
          steamLife[i] = 0;
          posArr[i * 3 + 0] = chX + (Math.random() - 0.5) * 1.0;
          posArr[i * 3 + 1] = chY;
          posArr[i * 3 + 2] = chZ + (Math.random() - 0.5) * 1.0;
        } else {
          posArr[i * 3 + 0] += (steamVel[i * 3 + 0] - 8.0) * dt;
          posArr[i * 3 + 1] += steamVel[i * 3 + 1] * dt;
          posArr[i * 3 + 2] += steamVel[i * 3 + 2] * dt;
        }
      }
      steamGeo.attributes.position.needsUpdate = true;

      const ffArr = fireflyGeo.attributes.position.array;
      for (let i = 0; i < fireflyCount; i++) {
        const bx = fireflyBase[i * 3 + 0];
        const by = fireflyBase[i * 3 + 1];
        const bz = fireflyBase[i * 3 + 2];
        ffArr[i * 3 + 0] = bx + Math.sin(env.time * 1.4 + i) * 2.2;
        ffArr[i * 3 + 1] = by + Math.cos(env.time * 1.8 + i * 2) * 1.5;
        ffArr[i * 3 + 2] = bz + Math.sin(env.time * 1.2 + i * 3) * 2.2;
      }
      fireflyGeo.attributes.position.needsUpdate = true;
    }
  };
}

// ─── 时相控制器初始化 ───
function initPhaseCtrl(scene, sky, waterMat, fireflyMat) {
  let currentIdx = 0, targetIdx = 0, blendT = 1.0;
  const curSkyTop = new THREE.Color();
  const curSkyMid = new THREE.Color();
  const curSkyHor = new THREE.Color();
  const curFogCol = new THREE.Color();

  return {
    setPhase: (idx) => { targetIdx = idx; blendT = 0.0; },
    get phaseIdx() { return targetIdx; },
    update: (dt, env) => {
      const pCur = PHASES[currentIdx], pTgt = PHASES[targetIdx];
      if (blendT < 1.0) {
        blendT = Math.min(1.0, blendT + dt * 0.85);
        if (blendT >= 1.0) currentIdx = targetIdx;
      }
      const k = blendT;

      curSkyTop.set(pCur.skyTop).lerp(new THREE.Color(pTgt.skyTop), k);
      curSkyMid.set(pCur.skyMid).lerp(new THREE.Color(pTgt.skyMid), k);
      curSkyHor.set(pCur.skyHor).lerp(new THREE.Color(pTgt.skyHor), k);
      sky.update(curSkyTop, curSkyMid, curSkyHor);

      curFogCol.set(pCur.fog).lerp(new THREE.Color(pTgt.fog), k);
      scene.fog.color.copy(curFogCol);
      scene.fog.near = THREE.MathUtils.lerp(pCur.fogNear, pTgt.fogNear, k);
      scene.fog.far = THREE.MathUtils.lerp(pCur.fogFar, pTgt.fogFar, k);

      if (env.sun) {
        env.sun.color.lerpColors(new THREE.Color(pCur.sunColor), new THREE.Color(pTgt.sunColor), k);
        env.sun.intensity = THREE.MathUtils.lerp(pCur.sunInt, pTgt.sunInt, k);
        const curDir = new THREE.Vector3().fromArray(pCur.sunDir);
        const tgtDir = new THREE.Vector3().fromArray(pTgt.sunDir);
        curDir.lerp(tgtDir, k).normalize();
        env.sun.position.copy(curDir).multiplyScalar(180);
        waterMat.uniforms.uSunDir.value.copy(curDir);
      }
      if (env.hemi) {
        env.hemi.color.lerpColors(new THREE.Color(pCur.hemiSky), new THREE.Color(pTgt.hemiSky), k);
        env.hemi.groundColor.lerpColors(new THREE.Color(pCur.hemiGround), new THREE.Color(pTgt.hemiGround), k);
        env.hemi.intensity = THREE.MathUtils.lerp(pCur.hemiInt, pTgt.hemiInt, k);
      }
      if (env.ambLight) {
        env.ambLight.color.lerpColors(new THREE.Color(pCur.ambientColor), new THREE.Color(pTgt.ambientColor), k);
        env.ambLight.intensity = THREE.MathUtils.lerp(pCur.ambientInt, pTgt.ambientInt, k);
      }
      if (env.bloom) {
        env.bloom.strength = THREE.MathUtils.lerp(pCur.bloomStr, pTgt.bloomStr, k);
        env.bloom.threshold = THREE.MathUtils.lerp(pCur.bloomThr, pTgt.bloomThr, k);
      }
      if (env.renderer) {
        env.renderer.toneMappingExposure = THREE.MathUtils.lerp(pCur.exposure, pTgt.exposure, k);
      }

      fireflyMat.opacity = THREE.MathUtils.lerp(pCur.star, pTgt.star, k) * 0.85;

      waterMat.uniforms.uTime.value = env.time;
      waterMat.uniforms.uDeepColor.value.lerpColors(new THREE.Color(pCur.waterDeep), new THREE.Color(pTgt.waterDeep), k);
      waterMat.uniforms.uShallowColor.value.lerpColors(new THREE.Color(pCur.waterShal), new THREE.Color(pTgt.waterShal), k);
      waterMat.uniforms.uGlintColor.value.lerpColors(new THREE.Color(pCur.glint), new THREE.Color(pTgt.glint), k);
      waterMat.uniforms.fogColor.value.copy(curFogCol);
      waterMat.uniforms.fogNear.value = scene.fog.near;
      waterMat.uniforms.fogFar.value = scene.fog.far;
    }
  };
}
