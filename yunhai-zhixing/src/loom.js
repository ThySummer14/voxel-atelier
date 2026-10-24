import * as THREE from 'three';
import { VoxelVolume } from './voxel.js';
import { C, mulberry32 } from './palette.js';

function buildWheel(edgeTexture) {
  const vol = new VoxelVolume([-25, -25, -4], [25, 25, 4]);
  const R = 22;
  const spokes = 12;
  for (let a = 0; a < Math.PI * 2; a += 0.0022) {
    for (let dr = 0; dr <= 1.3; dr += 0.65) {
      const x = Math.round(Math.cos(a) * (R - dr));
      const y = Math.round(Math.sin(a) * (R - dr));
      const sector = Math.floor(((a + Math.PI * 4) % (Math.PI * 2)) / (Math.PI / 8));
      let color = sector % 3 === 0 ? C.brass2 : (sector % 3 === 1 ? C.timber2 : C.brass1);
      let kind = dr > 0.9 ? 1 : (sector % 3 === 0 ? 1 : 0);
      if (dr > 0.9) color = C.brass3;
      for (let z = 0; z <= 1; z++) vol.set(x, y, z, color, kind, 0.045);
    }
  }
  for (let a = 0; a < Math.PI * 2; a += 0.003) {
    for (let dr = 0; dr <= 1.0; dr += 0.5) {
      const x = Math.round(Math.cos(a) * (14.2 - dr));
      const y = Math.round(Math.sin(a) * (14.2 - dr));
      for (let z = 0; z <= 1; z++) vol.set(x, y, z, dr > 0.75 ? C.gold : C.brass3, 1, 0.03);
    }
  }
  // spokes
  for (let i = 0; i < spokes; i++) {
    const a = i / spokes * Math.PI * 2;
    const len = i % 2 === 0 ? 22 : 14.2;
    for (let r = 4; r <= len; r += 0.5) {
      const x = Math.round(Math.cos(a) * r);
      const y = Math.round(Math.sin(a) * r);
      vol.set(x, y, 0, C.timber1, 0, 0.03);
      vol.set(x, y, 1, i % 3 === 0 ? C.gold : C.brass3, 1, 0.03);
      if (i % 4 === 0 && r > 9 && r < 20) {
        vol.set(x, y, 2, C.brass2, 1, 0.02);
      }
      if (i % 6 === 0 && Math.abs(r - 17) < 0.4) {
        vol.set(x, y, 2, C.glowCyan, 2, 0.01);
      }
    }
  }
  // a ring of tiny star beads, like an astrolabe
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2 + 0.06;
    const x = Math.round(Math.cos(a) * 18.0);
    const y = Math.round(Math.sin(a) * 18.0);
    vol.set(x, y, 2, i % 3 === 0 ? C.gold : C.glowCyan, 2, 0.01);
  }
  // small star notches on the outer wheel
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * Math.PI * 2;
    const x = Math.round(Math.cos(a) * (R + 1.8));
    const y = Math.round(Math.sin(a) * (R + 1.8));
    vol.set(x, y, 1, i % 4 === 0 ? C.gold : C.brass2, 1, 0.02);
  }
  // central hub: brass petals around a hot star
  for (let x = -5; x <= 5; x++) {
    for (let y = -5; y <= 5; y++) {
      const r = Math.hypot(x, y);
      if (r > 5) continue;
      if (r > 3.4) {
        vol.set(x, y, 0, C.brass2, 1, 0.03);
        vol.set(x, y, 1, C.brass3, 1, 0.03);
      } else if (r > 1.4) {
        vol.set(x, y, 1, C.brass4, 1, 0.02);
        vol.set(x, y, 2, C.gold, 1, 0.02);
      } else if (r > 0.7) {
        vol.set(x, y, 1, C.lampCore, 2, 0.01);
        vol.set(x, y, 2, C.goldBright, 1, 0.01);
      } else {
        vol.set(x, y, 1, C.lampWhite, 2, 0.01);
        vol.set(x, y, 2, C.glowCyan, 2, 0.01);
      }
    }
  }
  const group = vol.buildMeshes({ edgeTexture });
  return group;
}

function buildWarp() {
  const positions = [];
  const t = [];
  const seed = [];
  const R = 24.5;
  for (let i = 0; i < 43; i++) {
    const x = -R + 1.5 + (i / 42) * (R * 2 - 3);
    const boundary = Math.sqrt(Math.max(0.5, R * R - x * x));
    positions.push(x, -boundary, 0.8, x, boundary, 0.8);
    t.push(0, 1);
    seed.push(i * 0.73, i * 0.73);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(C.glowCyan).convertSRGBToLinear() },
      uOpacity: { value: 0.38 },
    },
    vertexShader: `
      attribute float aT;
      attribute float aSeed;
      uniform float uTime;
      varying float vT;
      varying float vSeed;
      varying float vPulse;
      void main() {
        vT = aT;
        vSeed = aSeed;
        vec3 p = position;
        p.x += sin(p.y * 0.17 + uTime * 0.65 + aSeed) * 0.7;
        p.z += cos(p.y * 0.13 + uTime * 0.48 + aSeed) * 0.35;
        vPulse = 0.65 + 0.35 * sin(uTime * 1.4 + aSeed * 2.1);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vT;
      varying float vSeed;
      varying float vPulse;
      void main() {
        float edge = smoothstep(0.0, 0.12, vT) * smoothstep(1.0, 0.88, vT);
        float flow = 0.55 + 0.45 * sin(vT * 30.0 - vSeed * 2.0);
        gl_FragColor = vec4(uColor * (0.75 + flow * 0.55), edge * uOpacity * vPulse);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  return lines;
}

function buildHangingWarp() {
  const group = new THREE.Group();
  const threads = 18;
  const positions = [];
  const aT = [];
  const aSeed = [];
  const beadPositions = [];
  for (let i = 0; i < threads; i++) {
    const a = Math.PI + 0.16 + i * (Math.PI - 0.32) / (threads - 1);
    const topX = Math.cos(a) * 26.2;
    const topY = 94 + Math.sin(a) * 26.2;
    const length = 7 + (i * 7 % 13);
    const bottomY = Math.max(56, topY - length);
    const seed = i * 0.77;
    positions.push(topX, topY, 1.5, topX + Math.sin(seed) * 1.2, bottomY, 1.5);
    aT.push(0, 1);
    aSeed.push(seed, seed);
    if (i % 3 === 0) beadPositions.push([topX + Math.sin(seed) * 1.2, bottomY, 1.5, i]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(C.goldBright).convertSRGBToLinear() },
    },
    vertexShader: `
      attribute float aT;
      attribute float aSeed;
      uniform float uTime;
      varying float vT;
      varying float vSeed;
      void main() {
        vT = aT; vSeed = aSeed;
        vec3 p = position;
        float sway = sin(uTime * 0.38 + aSeed) * 0.55 * aT;
        p.x += sway;
        p.z += cos(uTime * 0.28 + aSeed) * 0.3 * aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vT;
      varying float vSeed;
      void main() {
        float a = (0.26 + 0.5 * vT) * smoothstep(0.0, 0.06, vT);
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = 3;
  group.add(lines);

  const beadGeo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
  const beadMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.lampCore).convertSRGBToLinear().multiplyScalar(1.5),
  });
  beadPositions.forEach(([x, y, z, i]) => {
    const bead = new THREE.Mesh(beadGeo, i % 2 ? beadMat : new THREE.MeshBasicMaterial({
      color: new THREE.Color(C.glowCyan).convertSRGBToLinear().multiplyScalar(1.35),
    }));
    bead.position.set(x, y - 0.6, z);
    group.add(bead);
  });
  group.userData.update = (time) => {
    mat.uniforms.uTime.value = time;
  };
  return group;
}

function makePortalTexture() {
  const S = 1024;
  const R = 492;
  const cx = S / 2, cy = S / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(7719);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // the deep between the stars
  const bg = ctx.createRadialGradient(cx - 70, cy - 80, 20, cx, cy, R);
  bg.addColorStop(0, '#0d2f37');
  bg.addColorStop(0.34, '#09222c');
  bg.addColorStop(0.72, '#071821');
  bg.addColorStop(1, '#040d15');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // breath of nebulae
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 34; i++) {
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * R * 0.92;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    const radius = 80 + rand() * 220;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    if (i % 4 === 0) {
      g.addColorStop(0, 'rgba(182,139,88,0.075)');
      g.addColorStop(1, 'rgba(182,139,88,0)');
    } else if (i % 3 === 0) {
      g.addColorStop(0, 'rgba(86,148,139,0.08)');
      g.addColorStop(1, 'rgba(86,148,139,0)');
    } else {
      g.addColorStop(0, 'rgba(34,93,111,0.09)');
      g.addColorStop(1, 'rgba(34,93,111,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  // a faint river of dust
  ctx.strokeStyle = 'rgba(113,176,165,0.13)';
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(110, 820);
  ctx.bezierCurveTo(280, 690, 420, 760, 510, 610);
  ctx.bezierCurveTo(610, 440, 750, 470, 890, 300);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(211,169,102,0.06)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(90, 760);
  ctx.bezierCurveTo(280, 650, 400, 710, 520, 560);
  ctx.bezierCurveTo(650, 400, 770, 430, 925, 260);
  ctx.stroke();

  // stars, some with the cross flare of old lenses
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 360; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * R * 0.97;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const size = rand() > 0.93 ? 2.4 + rand() * 2.8 : 0.5 + rand() * 1.5;
    const warm = rand() > 0.78;
    const b = 0.65 + rand() * 0.35;
    ctx.fillStyle = warm
      ? `rgba(255,231,183,${b})`
      : `rgba(196,242,231,${b})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    if (size > 3.3) {
      ctx.strokeStyle = warm ? 'rgba(255,229,176,0.35)' : 'rgba(193,241,230,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - size * 4, y);
      ctx.lineTo(x + size * 4, y);
      ctx.moveTo(x, y - size * 4);
      ctx.lineTo(x, y + size * 4);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // gold ecliptic rings
  ctx.strokeStyle = 'rgba(209,169,103,0.38)';
  ctx.lineWidth = 1.5;
  for (const rr of [318, 410]) {
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([3, 14]);
  ctx.strokeStyle = 'rgba(166,226,207,0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 365, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const inner = i % 3 === 0 ? 442 : 463;
    const outer = 482;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(238,204,141,0.55)' : 'rgba(142,192,178,0.26)';
    ctx.lineWidth = i % 3 === 0 ? 2.4 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }

  // a celestial crane, caught in gold thread
  const nodes = [
    [700, 330], [674, 350], [620, 408], [573, 468], [556, 520],
    [506, 550], [452, 552], [365, 600], [315, 638],
    [515, 500], [596, 388], [646, 318], [708, 294],
    [480, 566], [445, 636], [432, 694],
    [530, 556], [558, 642], [580, 686],
  ];
  const lines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [5, 13], [13, 14], [14, 15],
    [5, 16], [16, 17], [17, 18],
  ];
  ctx.strokeStyle = 'rgba(217,173,105,0.4)';
  ctx.lineWidth = 1.4;
  for (const [a, b] of lines) {
    const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  for (let i = 0; i < nodes.length; i++) {
    const [x, y] = nodes[i];
    const g = ctx.createRadialGradient(x, y, 0, x, y, 18);
    g.addColorStop(0, 'rgba(255,240,200,0.85)');
    g.addColorStop(0.22, 'rgba(239,196,126,0.35)');
    g.addColorStop(1, 'rgba(239,196,126,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,248,221,0.95)';
    ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 3.2 : 2, 0, Math.PI * 2); ctx.fill();
  }

  // woven light threads crossing the round
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const y = 300 + i * 62;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(235,190,116,0.10)' : 'rgba(94,187,172,0.075)';
    ctx.lineWidth = 1.2 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(70, y + 40);
    ctx.bezierCurveTo(300, y - 70, 670, y + 90, 955, y - 30);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // the rim of the deep
  const rim = ctx.createRadialGradient(cx, cy, R * 0.74, cx, cy, R);
  rim.addColorStop(0, 'rgba(3,10,14,0)');
  rim.addColorStop(0.78, 'rgba(3,10,14,0.28)');
  rim.addColorStop(0.96, 'rgba(2,7,10,0.74)');
  rim.addColorStop(1, 'rgba(2,7,10,0.9)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(221,184,119,0.65)';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(cx, cy, R - 7, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(126,185,173,0.24)';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(cx, cy, R - 18, 0, Math.PI * 2); ctx.stroke();

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createPortal() {
  const geo = new THREE.CircleGeometry(20.2, 128);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uMap: { value: makePortalTexture() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uPulse;
      varying vec2 vUv;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p) * 2.0;
        if (r > 1.0) discard;
        vec4 tex = texture2D(uMap, vUv);
        vec3 col = tex.rgb * 1.5;
        float lum = max(col.r, max(col.g, col.b));
        col += vec3(0.16, 0.26, 0.23) * smoothstep(0.16, 0.62, lum) * 0.24;
        // a breath of moving air over the starfield
        col *= 0.88 + 0.12 * sin(r * 18.0 - uTime * 0.32 + p.x * 3.0);
        col += vec3(0.16, 0.25, 0.22) * pow(max(0.0, 1.0 - r), 4.0) * (0.25 + uPulse * 0.8);
        // rare twinkles
        vec2 cell = floor(vUv * 120.0);
        float tw = step(0.994, hash(cell + floor(uTime * 0.3)));
        col += vec3(0.9, 0.78, 0.5) * tw * 0.55;
        float alpha = tex.a;
        gl_FragColor = vec4(col * (1.0 + uPulse * 0.4), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
  const portal = new THREE.Mesh(geo, mat);
  portal.position.set(0, 94, 0.6);
  portal.renderOrder = 0;
  portal.frustumCulled = false;
  const glowGeo = new THREE.CircleGeometry(26, 96);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv; uniform float uTime; uniform float uPulse;
      void main(){
        vec2 p = vUv - 0.5; float r = length(p) * 2.0;
        if (r > 1.0) discard;
        float a = pow(max(0.0, 1.0 - r), 3.2) * (0.12 + uPulse * 0.25);
        a += smoothstep(0.95, 1.0, r) * smoothstep(1.02, 0.97, r) * 0.08;
        vec3 c = mix(vec3(0.10, 0.38, 0.34), vec3(0.55, 0.38, 0.17), smoothstep(0.0, 1.0, r)) * a * 2.2;
        gl_FragColor = vec4(c, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 94, 0.2);
  glow.renderOrder = -1;
  glow.frustumCulled = false;
  const group = new THREE.Group();
  group.add(glow);
  group.add(portal);
  group.userData.update = (time, pulse) => {
    glowMat.uniforms.uTime.value = time;
    glowMat.uniforms.uPulse.value = pulse;
    mat.uniforms.uTime.value = time;
    mat.uniforms.uPulse.value = pulse;
  };
  group.userData.portal = portal;
  return group;
}


export function createLoom(edgeTexture) {
  const root = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.position.set(0, 94, 2);
  const wheel = buildWheel(edgeTexture);
  wheel.rotation.z = 0.1;
  pivot.add(wheel);
  root.add(pivot);

  const warp = buildWarp();
  warp.position.set(0, 94, 0.6);
  root.add(warp);

  const shuttleGroup = new THREE.Group();
  const shuttleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(C.brass4).convertSRGBToLinear(),
    emissive: new THREE.Color(C.gold).convertSRGBToLinear(),
    emissiveIntensity: 1.2,
    metalness: 0.6,
    roughness: 0.3,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 1.2), shuttleMat);
  shuttleGroup.add(body);
  const noseMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.lampCore).convertSRGBToLinear().multiplyScalar(1.4) });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.0, 4), noseMat);
  nose.rotation.z = Math.PI / 2;
  nose.position.x = -3;
  shuttleGroup.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 4), noseMat.clone());
  tail.rotation.z = -Math.PI / 2;
  tail.position.x = 2.7;
  shuttleGroup.add(tail);
  shuttleGroup.position.set(0, 88.0, 6.2);
  root.add(shuttleGroup);

  const shuttleGlow = new THREE.PointLight(new THREE.Color(C.lampCore), 5, 18, 2);
  shuttleGroup.add(shuttleGlow);

  const portal = createPortal();
  root.add(portal);

  const hangingWarp = buildHangingWarp();
  root.add(hangingWarp);

  // the luminous weft the shuttle is drawing across the loom
  const weftGeo = new THREE.BufferGeometry();
  const weftPos = new Float32Array(9);
  weftGeo.setAttribute('position', new THREE.BufferAttribute(weftPos, 3));
  const weft = new THREE.Line(weftGeo, new THREE.LineBasicMaterial({
    color: new THREE.Color(C.lampCore).convertSRGBToLinear().multiplyScalar(1.8),
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  weft.renderOrder = 7;
  weft.frustumCulled = false;
  root.add(weft);


  const centerLight = new THREE.PointLight(new THREE.Color(C.glowCyan).convertSRGBToLinear(), 110, 55, 2);
  centerLight.position.set(0, 94, 4);
  root.add(centerLight);

  return {
    root,
    pivot,
    wheel,
    warp,
    shuttle: shuttleGroup,
    centerLight,
    portal,
    hangingWarp,
    update(time) {
      hangingWarp.userData.update(time);
      portal.userData.update(time, 0);
      wheel.rotation.z = 0.1 + time * 0.035;
      const sx = Math.sin(time * 0.18) * 14.5;
      shuttleGroup.position.x = sx;
      shuttleGroup.position.y = 88.1 + Math.sin(time * 0.18 + 0.7) * 0.35;
      shuttleGroup.rotation.z = Math.cos(time * 0.18) * 0.08;
      shuttleGroup.position.z = 6.2;
      const startX = -17.2;
      const endX = shuttleGroup.position.x;
      const mid = (startX + endX) * 0.5;
      const y0 = 88.1, z0 = 6.35;
      weftPos[0] = startX; weftPos[1] = y0; weftPos[2] = z0;
      weftPos[3] = mid; weftPos[4] = y0 - 0.5; weftPos[5] = z0;
      weftPos[6] = endX; weftPos[7] = y0; weftPos[8] = z0;
      weftGeo.attributes.position.needsUpdate = true;
      warp.material.uniforms.uTime.value = time;
      centerLight.intensity = 72 + Math.sin(time * 1.7) * 12;
    },
  };
}
