import * as THREE from 'three';
import { C, mulberry32 } from './palette.js';

function makeSoftPoint() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,244,220,0.9)');
  g.addColorStop(0.55, 'rgba(255,220,160,0.18)');
  g.addColorStop(1, 'rgba(255,210,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const moteVertex = `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.2 + aPhase * 5.1);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (0.8 + 0.3 * vTwinkle);
    gl_Position = projectionMatrix * mv;
  }
`;
const moteFragment = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float a = smoothstep(0.5, 0.03, d);
    a *= smoothstep(0.5, 0.3, d) * 0.55 + 0.45;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.7 + vTwinkle * 0.9), a * uOpacity * (0.55 + vTwinkle * 0.45));
  }
`;

function createMoteMaterial(pixelRatio) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uTime: { value: 0 },
      uOpacity: { value: 0.85 },
    },
    vertexShader: moteVertex,
    fragmentShader: moteFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function makeMotes({ count, seed, zone, colors, size = [1.5, 4.5], drift = 1, speed = 0.2 }) {
  const rand = mulberry32(seed);
  const base = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const radii = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    base[i * 3] = zone.x[0] + rand() * (zone.x[1] - zone.x[0]);
    base[i * 3 + 1] = zone.y[0] + rand() * (zone.y[1] - zone.y[0]);
    base[i * 3 + 2] = zone.z[0] + rand() * (zone.z[1] - zone.z[0]);
    positions[i * 3] = base[i * 3];
    positions[i * 3 + 1] = base[i * 3 + 1];
    positions[i * 3 + 2] = base[i * 3 + 2];
    const col = new THREE.Color(colors[Math.floor(rand() * colors.length)]).convertSRGBToLinear();
    color[i * 3] = col.r * 1.4;
    color[i * 3 + 1] = col.g * 1.4;
    color[i * 3 + 2] = col.b * 1.4;
    sizes[i] = size[0] + rand() * (size[1] - size[0]);
    phases[i] = rand() * 30;
    radii[i] = 1 + rand() * 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  return {
    geo, base, positions, phases, radii, count,
    update(time) {
      for (let i = 0; i < count; i++) {
        const ph = phases[i];
        const r = radii[i] * drift;
        positions[i * 3] = base[i * 3] + Math.sin(time * speed + ph) * r + Math.sin(time * speed * 2.3 + ph * 2.1) * r * 0.25;
        positions[i * 3 + 1] = base[i * 3 + 1] + Math.sin(time * speed * 0.8 + ph * 1.7) * 1.8 + Math.cos(time * speed * 0.3 + ph) * 0.6;
        positions[i * 3 + 2] = base[i * 3 + 2] + Math.cos(time * speed * 1.1 + ph * 1.3) * r + Math.cos(time * speed * 0.5 + ph) * 0.8;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

function createLanternStrings(scene) {
  const group = new THREE.Group();
  group.name = 'lantern-strings';
  const cableMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0xb7a177).convertSRGBToLinear(),
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const lampMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.lampCore).convertSRGBToLinear().multiplyScalar(2.4),
    toneMapped: true,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(C.timber1).convertSRGBToLinear(), roughness: 0.8 });
  const lampGeo = new THREE.BoxGeometry(0.9, 1.15, 0.9);
  const capGeo = new THREE.BoxGeometry(1.15, 0.2, 1.15);

  const routes = [
    [[-28, 75, 1], [-16, 67, 10], [-2, 64, 20], [14, 66, 18], [28, 74, 4]],
    [[33, 78, 0], [42, 71, 10], [52, 67, 20], [62, 67, 22]],
    [[18, 62, 19], [8, 58, 23], [-4, 56, 28], [-18, 57, 31]],
    [[-55, 58, 47], [-47, 51, 44], [-38, 48, 36], [-29, 49, 30]],
    [[-64, 63, 52], [-52, 55, 55], [-40, 50, 58], [-28, 47, 55]],
  ];
  for (let r = 0; r < routes.length; r++) {
    const pts = routes[r].map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts);
    const samples = 26;
    const linePts = [];
    for (let i = 0; i <= samples; i++) {
      const p = curve.getPoint(i / samples);
      const sag = Math.sin(i / samples * Math.PI) * 2.2;
      linePts.push(new THREE.Vector3(p.x, p.y - sag, p.z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(linePts);
    const line = new THREE.Line(geo, cableMat);
    group.add(line);
    for (let i = 4; i < samples; i += 5) {
      const p = linePts[i];
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.copy(p).add(new THREE.Vector3(0, -0.8, 0));
      group.add(lamp);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.copy(lamp.position).add(new THREE.Vector3(0, 0.7, 0));
      group.add(cap);
    }
  }
  scene.add(group);
  return {
    group,
    update(time) {
      lampMat.color.setHex(C.lampCore).convertSRGBToLinear().multiplyScalar(2.25 + Math.sin(time * 2.1) * 0.2);
    },
  };
}

function createWater(scene) {
  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0xa6e5d8).convertSRGBToLinear().multiplyScalar(1.2) },
    uDeep: { value: new THREE.Color(0x153b4a).convertSRGBToLinear() },
  };
  const fallGeo = new THREE.BufferGeometry();
  const rows = 54;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const y = 50.4 - t * 28.5;
    const z = 48.0 + t * 1.8;
    const width = 2.4 + t * 2.2;
    for (let s = -1; s <= 1; s += 2) {
      positions.push(-27 + s * width, y, z);
      uvs.push(s * 0.5 + 0.5, t);
    }
  }
  for (let i = 0; i < rows; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  fallGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fallGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  fallGeo.setIndex(indices);

  const vert = `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.x += sin(uv.y * 14.0 + uTime * 2.1) * (0.25 + uv.y * 0.9);
      p.z += cos(uv.y * 10.0 - uTime * 1.7) * 0.2;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;
  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uDeep;
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    void main() {
      vec2 uv = vUv;
      float n = noise(vec2(uv.x * 8.0, uv.y * 30.0 - uTime * 3.3));
      float n2 = noise(vec2(uv.x * 19.0 + 3.0, uv.y * 70.0 - uTime * 5.0));
      float edge = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x);
      float body = 0.45 + n * 0.35 + n2 * 0.2;
      vec3 col = mix(uDeep, uColor, smoothstep(0.2, 0.85, body));
      float foam = smoothstep(0.72, 0.95, n2) * 0.65 + smoothstep(0.9, 1.0, uv.y) * 0.8;
      col += vec3(0.7, 0.95, 0.9) * foam;
      float alpha = edge * (0.36 + n * 0.3) * smoothstep(0.0, 0.06, uv.y) * smoothstep(1.0, 0.9, uv.y);
      gl_FragColor = vec4(col, alpha);
    }
  `;
  const fallMat = new THREE.ShaderMaterial({
    uniforms, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide,
  });
  const fall = new THREE.Mesh(fallGeo, fallMat);
  fall.renderOrder = 3;
  scene.add(fall);

  // bright inner cascade
  const inner = fall.clone();
  inner.material = fallMat.clone();
  inner.material.uniforms = { ...uniforms, uColor: { value: new THREE.Color(0xd9fff4).convertSRGBToLinear() } };
  inner.scale.set(0.5, 0.98, 0.95);
  inner.position.set(-13.5, 0.6, 2.45);
  inner.renderOrder = 3;
  scene.add(inner);

  // stream surface on the plateau
  const streamGeo = new THREE.PlaneGeometry(6.2, 18, 1, 1);
  const streamMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x75b9b7).convertSRGBToLinear() },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=vUv;
        float n=noise(vec2(uv.x*10.0, uv.y*30.0 - uTime*1.4));
        float edge=smoothstep(0.0,0.12,uv.x)*smoothstep(1.0,0.88,uv.x);
        vec3 col=mix(vec3(0.03,0.11,0.14),uColor,0.4+n*0.6);
        col+=vec3(0.35,0.6,0.55)*smoothstep(0.72,1.0,n)*0.5;
        gl_FragColor=vec4(col, edge*(0.35+n*0.3));
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const stream = new THREE.Mesh(streamGeo, streamMat);
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(-27, 50.78, 38.2);
  scene.add(stream);

  // falling droplets
  const rand = mulberry32(31337);
  const count = 260;
  const pos = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = -27 + (rand() - 0.5) * 6;
    pos[i * 3 + 1] = 22 + rand() * 28;
    pos[i * 3 + 2] = 47.4 + rand() * 2.8;
    speeds[i] = 5 + rand() * 12;
  }
  const dropGeo = new THREE.BufferGeometry();
  dropGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dropMat = new THREE.PointsMaterial({
    color: new THREE.Color(0xccfff3).convertSRGBToLinear().multiplyScalar(1.8),
    size: 0.8,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: makeSoftPoint(),
    alphaTest: 0.02,
  });
  const drops = new THREE.Points(dropGeo, dropMat);
  drops.frustumCulled = false;
  scene.add(drops);

  // mist at the base
  const mistGroup = new THREE.Group();
  const mistTex = makeSoftPoint();
  for (let i = 0; i < 9; i++) {
    const mat = new THREE.SpriteMaterial({
      map: mistTex,
      color: new THREE.Color(0x9fccc8).convertSRGBToLinear(),
      transparent: true,
      opacity: 0.12 + rand() * 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(-27 + (rand() - 0.5) * 8, 21 + rand() * 3, 48 + (rand() - 0.5) * 5);
    const sc = 16 + rand() * 16;
    sprite.scale.set(sc, sc * 0.65, 1);
    sprite.userData.phase = rand() * 10;
    mistGroup.add(sprite);
  }
  scene.add(mistGroup);

  return {
    update(time) {
      fallMat.uniforms.uTime.value = time;
      inner.material.uniforms.uTime.value = time;
      streamMat.uniforms.uTime.value = time;
      const arr = dropGeo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] -= speeds[i] * 0.016;
        arr[i * 3] += Math.sin(time * 1.2 + i) * 0.008;
        if (arr[i * 3 + 1] < 21) {
          arr[i * 3 + 1] = 49.5;
          arr[i * 3] = -27 + (rand() - 0.5) * 6;
          arr[i * 3 + 2] = 47.3 + rand() * 2.7;
        }
      }
      dropGeo.attributes.position.needsUpdate = true;
      mistGroup.children.forEach((s, i) => {
        const ph = s.userData.phase;
        s.position.x = -27 + Math.sin(time * 0.25 + ph) * 4;
        s.position.y = 21.2 + Math.sin(time * 0.3 + ph) * 0.7;
        s.material.opacity = 0.1 + Math.sin(time * 0.35 + ph) * 0.035;
      });
    },
  };
}

function createCranes(scene) {
  const group = new THREE.Group();
  group.name = 'cranes';
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x4b5c5c).convertSRGBToLinear(),
    roughness: 0.9,
    metalness: 0,
    emissive: new THREE.Color(0x1c2422).convertSRGBToLinear(),
    emissiveIntensity: 0.25,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x26373c).convertSRGBToLinear(),
    roughness: 0.9,
  });
  const warmMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x8c7650).convertSRGBToLinear(),
    roughness: 0.8,
  });
  const crownMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xa94938).convertSRGBToLinear(),
    roughness: 0.7,
  });
  const birds = [];
  const rand = mulberry32(612);
  for (let i = 0; i < 7; i++) {
    const bird = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.62, 0.78), bodyMat);
    bird.add(body);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.6), bodyMat);
    back.position.set(-1.4, 0.08, 0);
    bird.add(back);
    // the crane's long, curved neck
    const neck1 = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.22, 0.24), bodyMat);
    neck1.position.set(1.72, 0.38, 0);
    neck1.rotation.z = 0.24;
    bird.add(neck1);
    const neck2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.2), bodyMat);
    neck2.position.set(2.35, 0.72, 0);
    neck2.rotation.z = 0.55;
    bird.add(neck2);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.4, 0.4), bodyMat);
    head.position.set(2.75, 0.97, 0);
    bird.add(head);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.26), crownMat);
    crown.position.set(2.82, 1.18, 0);
    bird.add(crown);
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.12, 0.12), darkMat);
    beak.position.set(3.36, 0.93, 0);
    beak.rotation.z = -0.1;
    bird.add(beak);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.18, 0.75), darkMat);
    tail.position.set(-2.1, 0.03, 0);
    bird.add(tail);
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 1.1), darkMat);
    tail2.position.set(-2.72, 0.05, 0);
    bird.add(tail2);
    for (const s of [-1, 1]) {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(0.1, 0.26, s * 0.3);
      const segments = [
        [1.55, 0.1, 1.45, -0.18, 0.72, bodyMat],
        [1.35, 0.09, 1.3, -0.52, 1.85, bodyMat],
        [1.0, 0.07, 1.25, -0.92, 2.9, darkMat],
        [0.52, 0.06, 1.35, -1.32, 3.9, darkMat],
      ];
      for (const [sx, sy, sz, ox, oz, mat] of segments) {
        const feather = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
        feather.position.set(ox, 0.06, s * oz);
        feather.rotation.y = s * -0.12;
        wingPivot.add(feather);
      }
      bird.add(wingPivot);
      bird.userData[s > 0 ? 'right' : 'left'] = wingPivot;
    }
    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.06), warmMat);
      leg.position.set(-1.8, -0.4, s * 0.2);
      leg.rotation.z = -0.07;
      bird.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), warmMat);
      foot.position.set(-2.9, -0.5, s * 0.25);
      bird.add(foot);
    }
    bird.scale.setScalar(0.68 + rand() * 0.14);
    bird.userData.phase = rand() * 10;
    bird.userData.rank = Math.ceil(i / 2);
    bird.userData.side = i === 0 ? 0 : (i % 2 === 1 ? 1 : -1);
    bird.userData.lag = i === 0 ? 0 : (Math.ceil(i / 2) * 0.033 + (i % 2) * 0.006 + (rand() - 0.5) * 0.012);
    bird.userData.sideJitter = (rand() - 0.5) * 2.6;
    bird.userData.heightJitter = (rand() - 0.5) * 1.4;
    group.add(bird);
    birds.push(bird);
  }
  // eye highlights
  const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe2a0).convertSRGBToLinear() });
  birds.forEach((b) => {
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), eyeMat);
      eye.position.set(2.91, 1.06, s * 0.19);
      b.add(eye);
    }
  });
  scene.add(group);

  return {
    group,
    update(time) {
      const speed = 0.0026;
      const leadA = time * speed + 0.46;
      const cx = -34, cz = -175, rx = 116, rz = 54;
      birds.forEach((b, i) => {
        const a = leadA - b.userData.lag;
        const px = cx + Math.cos(a) * rx;
        const pz = cz + Math.sin(a) * rz;
        const py = 149 + Math.sin(a * 2.2 + b.userData.phase) * 2.0 + b.userData.heightJitter;
        const tx = -Math.sin(a) * rx;
        const tz = Math.cos(a) * rz;
        const tl = Math.hypot(tx, tz) || 1;
        const sideX = tz / tl, sideZ = -tx / tl;
        const rank = b.userData.rank;
        const side = b.userData.side;
        b.position.set(
          px - (tx / tl) * rank * 6.2 + sideX * (side * rank * 4.8 + b.userData.sideJitter),
          py - rank * 0.7,
          pz - (tz / tl) * rank * 6.2 + sideZ * (side * rank * 4.8 + b.userData.sideJitter),
        );
        b.rotation.y = Math.atan2(tx, tz);
        b.rotation.z = Math.sin(time * 0.7 + b.userData.phase) * 0.04;
        const flap = Math.sin(time * 0.7 + b.userData.phase * 1.4) * 0.26 + 0.18;
        b.userData.left.rotation.x = flap;
        b.userData.right.rotation.x = -flap;
      });
    },
  };
}

function createBurst(scene, pixelRatio) {
  const count = 360;
  const rand = mulberry32(777);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const dirs = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand();
    const speed = 5 + rand() * 25;
    dirs.push({ vx: Math.cos(a) * speed, vy: Math.sin(a) * speed * 0.85, vz: (rand() - 0.5) * 12 });
    const col = new THREE.Color(rand() > 0.55 ? 0xffd89a : (rand() > 0.3 ? 0x8af4de : 0xd9fff7)).convertSRGBToLinear();
    colors[i * 3] = col.r * 2.1;
    colors[i * 3 + 1] = col.g * 2.1;
    colors[i * 3 + 2] = col.b * 2.1;
    sizes[i] = 1.5 + rand() * 4.2;
    phases[i] = r * 3.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  const mat = createMoteMaterial(pixelRatio);
  mat.uniforms.uOpacity.value = 0;
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 8;
  points.position.set(0, 94, 2);
  scene.add(points);

  let active = false;
  let elapsed = 0;

  return {
    points,
    trigger() {
      active = true;
      elapsed = 0;
      for (let i = 0; i < count; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }
      mat.uniforms.uOpacity.value = 1;
    },
    update(time, dt) {
      if (!active) return;
      elapsed += dt;
      const life = 1 - elapsed / 3.3;
      if (life <= 0) {
        active = false;
        mat.uniforms.uOpacity.value = 0;
        return;
      }
      for (let i = 0; i < count; i++) {
        const d = dirs[i];
        positions[i * 3] = d.vx * elapsed + Math.sin(time * 1.7 + i) * 0.7;
        positions[i * 3 + 1] = d.vy * elapsed - 5.5 * elapsed * elapsed + Math.sin(i) * 0.4;
        positions[i * 3 + 2] = d.vz * elapsed;
      }
      geo.attributes.position.needsUpdate = true;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uOpacity.value = life * life * 0.9;
    },
    get active() { return active; },
  };
}

export function createEffects(scene, pixelRatio) {
  const soft = makeSoftPoint();
  const glowGeo = new THREE.BufferGeometry();
  const puffMat = new THREE.PointsMaterial({
    color: new THREE.Color(0xc7fff2).convertSRGBToLinear().multiplyScalar(2.4),
    size: 2.8,
    map: soft,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.02,
  });

  const fireflies = makeMotes({
    count: 120, seed: 91,
    zone: { x: [-68, 66], y: [51, 83], z: [-35, 58] },
    colors: [0xffc479, 0xffe0a3, 0x9de6c5, 0xffb36e],
    size: [1.1, 3.2], drift: 1.4, speed: 0.18,
  });
  const fireflyMat = createMoteMaterial(pixelRatio);
  const firefliesPts = new THREE.Points(fireflies.geo, fireflyMat);
  firefliesPts.renderOrder = 5;
  firefliesPts.frustumCulled = false;
  scene.add(firefliesPts);

  const dust = makeMotes({
    count: 190, seed: 131,
    zone: { x: [-120, 120], y: [23, 140], z: [-80, 90] },
    colors: [0x8ce3d6, 0xbedbd2, 0xe4c083],
    size: [0.7, 2.1], drift: 2.2, speed: 0.06,
  });
  const dustMat = createMoteMaterial(pixelRatio);
  dustMat.uniforms.uOpacity.value = 0.38;
  const dustPts = new THREE.Points(dust.geo, dustMat);
  dustPts.renderOrder = 4;
  dustPts.frustumCulled = false;
  scene.add(dustPts);

  const stars = makeMotes({
    count: 150, seed: 771,
    zone: { x: [-34, 34], y: [64, 120], z: [-14, 12] },
    colors: [0xffd18a, 0x9ff4df, 0xfff0c2],
    size: [0.9, 2.8], drift: 1.8, speed: 0.11,
  });
  const starsMat = createMoteMaterial(pixelRatio);
  starsMat.uniforms.uOpacity.value = 0.85;
  const starsPts = new THREE.Points(stars.geo, starsMat);
  starsPts.renderOrder = 5;
  starsPts.frustumCulled = false;
  scene.add(starsPts);

  const strings = createLanternStrings(scene);
  const water = createWater(scene);
  const cranes = createCranes(scene);
  const burst = createBurst(scene, pixelRatio);

  return {
    group: strings.group,
    update(time, dt) {
      fireflyMat.uniforms.uTime.value = time;
      dustMat.uniforms.uTime.value = time;
      starsMat.uniforms.uTime.value = time;
      fireflies.update(time);
      dust.update(time);
      stars.update(time);
      strings.update(time);
      water.update(time);
      cranes.update(time);
      burst.update(time, dt);
    },
    setPixelRatio(pr) {
      fireflyMat.uniforms.uPixelRatio.value = pr;
      dustMat.uniforms.uPixelRatio.value = pr;
      starsMat.uniforms.uPixelRatio.value = pr;
      burst.points.material.uniforms.uPixelRatio.value = pr;
    },
    triggerBurst() { burst.trigger(); },
  };
}
