// ambient.js — 天空穹顶 / 三时相（午后·薄暮·华灯）/ 水面 shader / 粒子（蒸汽·炊烟·船痕·燕·萤）/ 云

import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry, mulberry32 } from './voxel.js';

// —— 三时相参数（英雄相 = 午后）——
export const PHASES = [
  {
    name: '午后',
    skyTop: 0x6fa8d0, skyHor: 0xd7e4da, fog: 0xdde4d8, fogNear: 170, fogFar: 500,
    sunDir: [-0.55, 0.72, -0.42], sunColor: 0xfff0d2, sunInt: 2.5,
    hemiSky: 0xd4d8d4, hemiGround: 0x9a8468, hemiInt: 0.85,
    glow: 0.14, star: 0.0, bloomStr: 0.18, bloomThr: 0.9,
    waterDeep: 0x41666a, waterShal: 0x5d8781, glint: 0xfff2cc, exposure: 1.14,
    sunSprite: 1.0, moonSprite: 0.0, halo: 0.0, cloudTint: 0xffffff,
  },
  {
    name: '薄暮',
    skyTop: 0x4c5b96, skyHor: 0xf0a870, fog: 0xe0b18a, fogNear: 130, fogFar: 400,
    sunDir: [-0.9, 0.24, -0.25], sunColor: 0xff9a4e, sunInt: 1.6,
    hemiSky: 0x9088b8, hemiGround: 0x8a6a52, hemiInt: 0.62,
    glow: 0.7, star: 0.12, bloomStr: 0.32, bloomThr: 0.82,
    waterDeep: 0x35566b, waterShal: 0x6a7a7a, glint: 0xffc890, exposure: 1.05,
    sunSprite: 1.0, moonSprite: 0.0, halo: 0.35, cloudTint: 0xffd9b8,
  },
  {
    name: '华灯',
    skyTop: 0x101a36, skyHor: 0x2c3e66, fog: 0x232f52, fogNear: 120, fogFar: 380,
    sunDir: [-0.4, 0.7, -0.5], sunColor: 0xa8bce8, sunInt: 0.75,
    hemiSky: 0x3a4a78, hemiGround: 0x1c2438, hemiInt: 0.62,
    glow: 1.0, star: 1.0, bloomStr: 0.55, bloomThr: 0.72,
    waterDeep: 0x1e3a55, waterShal: 0x2a5068, glint: 0xcfe0ff, exposure: 1.08,
    sunSprite: 0.0, moonSprite: 1.0, halo: 1.0, cloudTint: 0x8fa0c8,
  },
];

function glowTexture(inner, outer) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, outer);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  return tex;
}

function puffTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}

// —— 通用粒子簇：循环升腾 ——
class Puffs {
  constructor(parent, tex, sources, opt) {
    this.sources = sources; this.opt = opt; this.pool = [];
    for (let i = 0; i < opt.count; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false,
        color: opt.color || 0xffffff,
      }));
      m.userData.t = (i / opt.count) * opt.life;
      m.userData.sid = i;
      m.userData.src = i % Math.max(1, sources.length);
      parent.add(m);
      this.pool.push(m);
    }
  }
  update(dt, mul = 1) {
    const { rise, spread, size, life, op } = this.opt;
    for (const m of this.pool) {
      m.userData.t += dt;
      if (m.userData.t > life) m.userData.t = 0;
      const k = m.userData.t / life;
      const s = this.sources[m.userData.src] || { x: 0, y: 8, z: 0 };
      m.position.set(
        s.x + Math.sin(k * 9 + m.userData.sid * 2.3) * spread * k,
        s.y + rise * k,
        s.z + Math.cos(k * 7 + m.userData.sid * 1.7) * spread * k
      );
      const sc = size * (0.5 + k * 0.9);
      m.scale.set(sc, sc, 1);
      m.material.opacity = op * mul * Math.sin(Math.PI * Math.min(1, k * 1.15));
    }
  }
}

export function createAmbient(scene, build, opts = {}) {
  const rng = mulberry32(4242);
  const group = new THREE.Group();
  scene.add(group);

  // ===== 天空穹顶 =====
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      topColor: { value: new THREE.Color(PHASES[0].skyTop) },
      bottomColor: { value: new THREE.Color(PHASES[0].skyHor) },
      offset: { value: 22 }, exponent: { value: 0.78 },
    },
    vertexShader: `
      varying vec3 vP;
      void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent;
      varying vec3 vP;
      void main(){
        float h = normalize(vP + vec3(0.0, offset, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, pow(max(h, 0.0), exponent)), 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(520, 24, 14), skyMat);
  sky.frustumCulled = false;
  group.add(sky);

  // ===== 星子 =====
  const starGeo = new THREE.BufferGeometry();
  {
    const pos = [];
    for (let i = 0; i < 800; i++) {
      const a = rng() * Math.PI * 2, e = Math.asin(rng() * 0.95 + 0.05);
      const r = 470;
      pos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  }
  const starMat = new THREE.PointsMaterial({ color: 0xf2f5ff, size: 3.0, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  group.add(stars);

  // ===== 日 / 月 =====
  const sunTex = glowTexture('rgba(255,244,214,1)', 'rgba(255,214,140,0.45)');
  const moonTex = glowTexture('rgba(235,240,255,1)', 'rgba(170,190,235,0.4)');
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
  sunSprite.scale.set(90, 90, 1);
  const moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  moonSprite.scale.set(55, 55, 1);
  group.add(sunSprite, moonSprite);

  // ===== 水面材质 =====
  const waterMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(PHASES[0].waterDeep) },
        uShal: { value: new THREE.Color(PHASES[0].waterShal) },
        uGlint: { value: new THREE.Color(PHASES[0].glint) },
        uOpacity: { value: 0.86 },
      },
    ]),
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec3 vW;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      #include <fog_pars_fragment>
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uShal; uniform vec3 uGlint; uniform float uOpacity;
      varying vec3 vW;
      void main(){
        float band = sin(vW.x*0.35 + uTime*1.1) * sin(vW.z*0.55 - uTime*0.8);
        vec3 col = mix(uDeep, uShal, 0.5 + 0.24*band);
        float flow = sin(vW.x*0.9 - uTime*2.2 + sin(vW.z*0.8 + uTime*0.7)*0.55);
        col += uGlint * smoothstep(0.92, 0.985, flow) * 0.10;
        vec2 cell = floor(vW.xz * 3.0);
        float sp = fract(sin(dot(cell, vec2(12.9898,78.233)) + floor(uTime*2.5))*43758.5);
        col += uGlint * step(0.992, sp) * 0.22;
        gl_FragColor = vec4(col, uOpacity);
        #include <fog_fragment>
      }`,
  });

  // ===== 灯火光晕（华灯相）=====
  const haloTex = glowTexture('rgba(255,200,120,0.9)', 'rgba(255,160,70,0.35)');
  const halos = [];
  {
    const pts = [];
    for (const st of build.stalls) pts.push([st.x, st.y + 1.5, st.z]);
    pts.push([18, 13, 40], [18, 13, 48]);
    pts.push([-4, 12, -12], [4, 12, 12], [-4, 12, 12], [4, 12, -12]);
    for (const [x, y, z] of pts) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      s.position.set(x, y, z);
      s.scale.set(5.5, 5.5, 1);
      group.add(s);
      halos.push(s);
    }
  }

  // ===== 萤火（华灯相，河岸草间）=====
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyBase = [];
  {
    const pos = [];
    for (let i = 0; i < 36; i++) {
      const s = rng() < 0.5 ? -1 : 1;
      const p = new THREE.Vector3(-50 + rng() * 100, 8.5 + rng() * 3.5, s * (16 + rng() * 12));
      fireflyBase.push(p);
      pos.push(p.x, p.y, p.z);
    }
    fireflyGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  }
  const fireflyMat = new THREE.PointsMaterial({
    color: 0xffd98a, size: 5.0, sizeAttenuation: true, transparent: true, opacity: 0,
    map: glowTexture('rgba(255,225,150,1)', 'rgba(255,190,90,0.5)'), depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  });
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  group.add(fireflies);

  // ===== 蒸汽 / 炊烟 =====
  const puffTex = puffTexture();
  const steam = new Puffs(group, puffTex, build.steamSources, { count: 22, rise: 6, spread: 1.0, size: 2.8, life: 4.5, op: 0.42, color: 0xffffff });
  const smoke = new Puffs(group, puffTex, build.chimneys, { count: 24, rise: 15, spread: 1.6, size: 4.2, life: 9, op: 0.12, color: 0xd8d4cc });

  // ===== 船行水痕 =====
  const wakeTex = puffTexture();
  const wakes = [];
  {
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: wakeTex, transparent: true, opacity: 0, depthWrite: false, color: 0xf2f7f4 }));
      m.userData.t = (i / 26) * 2.4;
      m.userData.x = build.boat.x - 13.5;
      m.userData.z = 3 + (rng() - 0.5) * 3;
      group.add(m);
      wakes.push(m);
    }
  }
  function updateWakes(dt, boatX, boatZ) {
    for (const m of wakes) {
      m.userData.t += dt;
      if (m.userData.t > 2.4) {
        m.userData.t = 0;
        m.userData.x = boatX - 13.5;
        m.userData.z = boatZ + (rng() - 0.5) * 3;
      }
      const k = m.userData.t / 2.4;
      m.position.set(m.userData.x - k * 2.5, 6.15, m.userData.z + (rng() - 0.5) * 0.06);
      const sc = 2 + k * 5;
      m.scale.set(sc, sc, 1);
      m.material.opacity = 0.42 * (1 - k) * Math.min(1, k * 8);
    }
  }

  // ===== 燕子 =====
  const swallows = [];
  {
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x2c3440, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.25), wingMat);
      g.add(body);
      const wl = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.7), wingMat); wl.position.x = -0.5;
      const wr = wl.clone(); wr.position.x = 0.5;
      g.add(wl, wr);
      g.userData = { wl, wr, phase: rng() * 6.28, r: 14 + rng() * 10, h: 9 + rng() * 4, sp: 0.5 + rng() * 0.25, cx: (rng() - 0.5) * 30, cz: (rng() - 0.5) * 14 };
      group.add(g);
      swallows.push(g);
    }
  }

  // ===== 流云 =====
  const clouds = [];
  {
    const cMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.94 });
    for (let i = 0; i < 5; i++) {
      const w = new VoxelWorld();
      const n = 3 + Math.floor(rng() * 3);
      for (let b = 0; b < n; b++) {
        const bx = Math.floor((rng() - 0.5) * 22), bz = Math.floor((rng() - 0.5) * 8);
        const by = Math.floor(rng() * 2);
        const rx = 3 + Math.floor(rng() * 4), ry = 1 + Math.floor(rng() * 2), rz = 2 + Math.floor(rng() * 3);
        for (let x = -rx; x <= rx; x++) for (let y = -ry; y <= ry; y++) for (let z = -rz; z <= rz; z++) {
          if ((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2 <= 1.05) {
            w.set(bx + x, by + y, bz + z, y < 0 ? 0xdfe7ea : 0xf6f9f7);
          }
        }
      }
      const { geometry } = buildGeometry(w, { jitter: 0.02, ao: false });
      const m = new THREE.Mesh(geometry, cMat);
      const y = 56 + rng() * 26;
      m.position.set(-220 + rng() * 440, y, (rng() < 0.5 ? -1 : 1) * (60 + rng() * 90));
      m.userData.speed = 0.6 + rng() * 0.7;
      clouds.push(m);
      group.add(m);
    }
  }
  const cloudMat = clouds[0].material;

  // ===== 时相状态机（指数趋近）=====
  const cur = JSON.parse(JSON.stringify(PHASES[0], (k, v) => (typeof v === 'number' ? v : v)));
  const curCol = {
    skyTop: new THREE.Color(PHASES[0].skyTop), skyHor: new THREE.Color(PHASES[0].skyHor),
    fog: new THREE.Color(PHASES[0].fog), sunColor: new THREE.Color(PHASES[0].sunColor),
    hemiSky: new THREE.Color(PHASES[0].hemiSky), hemiGround: new THREE.Color(PHASES[0].hemiGround),
    waterDeep: new THREE.Color(PHASES[0].waterDeep), waterShal: new THREE.Color(PHASES[0].waterShal),
    glint: new THREE.Color(PHASES[0].glint), cloudTint: new THREE.Color(PHASES[0].cloudTint),
  };
  let target = PHASES[0];
  const tmpA = new THREE.Color(), tmpB = new THREE.Color();
  const lerpC = (c, hexT, k) => { tmpA.copy(c); tmpB.setHex(hexT); c.lerpColors(tmpA, tmpB, k); };

  let phaseIdx = 0;
  function setPhase(i) { phaseIdx = i; target = PHASES[i]; }

  function update(dt, ctx) {
    const k = 1 - Math.exp(-dt * 1.1);
    // 颜色
    lerpC(curCol.skyTop, target.skyTop, k); lerpC(curCol.skyHor, target.skyHor, k);
    lerpC(curCol.fog, target.fog, k); lerpC(curCol.sunColor, target.sunColor, k);
    lerpC(curCol.hemiSky, target.hemiSky, k); lerpC(curCol.hemiGround, target.hemiGround, k);
    lerpC(curCol.waterDeep, target.waterDeep, k); lerpC(curCol.waterShal, target.waterShal, k);
    lerpC(curCol.glint, target.glint, k); lerpC(curCol.cloudTint, target.cloudTint, k);
    // 数值
    for (const key of ['sunInt', 'hemiInt', 'glow', 'star', 'bloomStr', 'bloomThr', 'exposure', 'sunSprite', 'moonSprite', 'halo', 'fogNear', 'fogFar']) {
      cur[key] += (target[key] - cur[key]) * k;
    }
    cur.sunDir[0] += (target.sunDir[0] - cur.sunDir[0]) * k;
    cur.sunDir[1] += (target.sunDir[1] - cur.sunDir[1]) * k;
    cur.sunDir[2] += (target.sunDir[2] - cur.sunDir[2]) * k;

    // 应用
    skyMat.uniforms.topColor.value.copy(curCol.skyTop);
    skyMat.uniforms.bottomColor.value.copy(curCol.skyHor);
    const fog = scene.fog;
    fog.color.copy(curCol.fog); fog.near = cur.fogNear; fog.far = cur.fogFar;
    ctx.sun.color.copy(curCol.sunColor);
    ctx.sun.intensity = cur.sunInt;
    ctx.sun.position.set(cur.sunDir[0], cur.sunDir[1], cur.sunDir[2]).multiplyScalar(200);
    ctx.hemi.color.copy(curCol.hemiSky);
    ctx.hemi.groundColor.copy(curCol.hemiGround);
    ctx.hemi.intensity = cur.hemiInt;
    ctx.renderer.toneMappingExposure = cur.exposure;
    ctx.bloom.strength = cur.bloomStr;
    ctx.bloom.threshold = cur.bloomThr;
    ctx.glowMat.color.setScalar(cur.glow);
    // glow 材质整体调亮度（窗火/灯笼暖色保持）
    starMat.opacity = cur.star;
    sunSprite.material.opacity = cur.sunSprite * 0.95;
    moonSprite.material.opacity = cur.moonSprite;
    const sd = cur.sunDir;
    sunSprite.position.set(sd[0], sd[1], sd[2]).normalize().multiplyScalar(430);
    moonSprite.position.copy(sunSprite.position);
    for (const h of halos) h.material.opacity = cur.halo * 0.5;
    fireflyMat.opacity = cur.halo * 0.9;
    cloudMat.color.copy(curCol.cloudTint);
    // 水面
    waterMat.uniforms.uTime.value += dt;
    waterMat.uniforms.uDeep.value.copy(curCol.waterDeep);
    waterMat.uniforms.uShal.value.copy(curCol.waterShal);
    waterMat.uniforms.uGlint.value.copy(curCol.glint);

    // 粒子（夜相烟雾减弱）
    const puffMul = 1 - cur.halo * 0.62;
    steam.update(dt, puffMul);
    smoke.update(dt, puffMul);
    updateWakes(dt, ctx.boatX, ctx.boatZ);
    // 燕
    const t = ctx.time;
    for (const s of swallows) {
      const u = s.userData;
      const a = t * u.sp + u.phase;
      const x = u.cx + Math.cos(a) * u.r;
      const z = u.cz + Math.sin(a) * u.r * 0.6;
      const y = u.h + Math.sin(a * 2.3) * 1.6;
      s.position.set(x, y, z);
      s.rotation.y = -a + Math.PI / 2;
      const flap = Math.sin(t * 9 + u.phase) * 0.55;
      u.wl.rotation.z = flap; u.wr.rotation.z = -flap;
    }
    // 萤火漂移
    {
      const p = fireflyGeo.attributes.position;
      for (let i = 0; i < fireflyBase.length; i++) {
        const b = fireflyBase[i];
        p.setXYZ(i, b.x + Math.sin(t * 0.7 + i * 2.1) * 1.6, b.y + Math.sin(t * 1.1 + i) * 0.8, b.z + Math.cos(t * 0.5 + i * 1.3) * 1.6);
      }
      p.needsUpdate = true;
    }
    // 云
    for (const c of clouds) {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 260) c.position.x = -260;
    }
  }

  return { group, skyMat, waterMat, update, setPhase, get phaseIdx() { return phaseIdx; } };
}
