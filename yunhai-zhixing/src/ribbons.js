import * as THREE from 'three';

function makeRibbonGeometry(points, segments = 180) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const positions = [];
  const tangents = [];
  const sides = [];
  const ts = [];
  const indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    for (let s = -1; s <= 1; s += 2) {
      positions.push(p.x, p.y, p.z);
      tangents.push(tan.x, tan.y, tan.z);
      sides.push(s);
      ts.push(t);
    }
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aTangent', new THREE.Float32BufferAttribute(tangents, 3));
  geo.setAttribute('aSide', new THREE.Float32BufferAttribute(sides, 1));
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

const ribbonVertex = `
  attribute vec3 aTangent;
  attribute float aSide;
  attribute float aT;
  uniform float uTime;
  uniform float uWidth;
  uniform float uWave;
  uniform float uSeed;
  uniform float uPulse;
  varying float vT;
  varying float vSide;
  varying float vWave;
  varying float vFacing;
  void main() {
    vT = aT;
    vSide = aSide;
    vec3 center = position;
    float breathe = sin(aT * 7.0 + uTime * 0.28 + uSeed) * uWave;
    center.x += breathe;
    center.y += cos(aT * 5.0 + uTime * 0.21 + uSeed * 1.7) * uWave * 0.7;
    center.z += sin(aT * 6.0 + uTime * 0.17 + uSeed * 0.7) * uWave * 0.6;

    vec4 centerView = modelViewMatrix * vec4(center, 1.0);
    vec3 tanView = normalize((modelViewMatrix * vec4(aTangent, 0.0)).xyz);
    vec3 side = normalize(cross(tanView, vec3(0.0, 0.0, 1.0)) + vec3(0.0001, 0.0, 0.0));
    float twist = sin(aT * 8.0 + uTime * 0.3 + uSeed * 2.2) * 0.32;
    float ct = cos(twist), st = sin(twist);
    side.xy = mat2(ct, -st, st, ct) * side.xy;
    float taper = 0.72 + 0.28 * sin(clamp(aT, 0.0, 1.0) * 3.14159265);
    float width = uWidth * taper * (1.0 + uPulse * 0.45);
    centerView.xyz += side * aSide * width * 0.5;
    vWave = 0.5 + 0.5 * sin(aT * 13.0 + uTime * 0.6 + uSeed + aSide * 1.2);
    vFacing = abs(dot(tanView, vec3(0.0, 0.0, 1.0)));
    gl_Position = projectionMatrix * centerView;
  }
`;

const ribbonFragment = `
  precision highp float;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uPulse;
  uniform float uHalo;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying float vT;
  varying float vSide;
  varying float vWave;
  varying float vFacing;

  float hash(vec2 p) {
    p = fract(p * vec2(191.31, 311.73));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.07 + 4.3;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float across = vSide * 0.5 + 0.5;
    float flow = fbm(vec2(vT * 17.0 - uTime * 0.12, across * 3.1 + uSeed));
    float folds = fbm(vec2(vT * 6.0 - uTime * 0.07, across * 1.7 + 11.0 + uSeed));
    float warp = (flow - 0.5) * 0.07 + (folds - 0.5) * 0.05;
    float soft = 0.10 + folds * 0.13;
    float edge = smoothstep(0.0, soft, across + warp) * smoothstep(1.0, 1.0 - soft, across + warp);
    float endFade = smoothstep(0.0, 0.1, vT) * smoothstep(1.0, 0.9, vT);

    vec3 col = mix(uColorA, uColorB, smoothstep(0.02, 0.98, vT + (flow - 0.5) * 0.22));
    col = mix(col, uColorC, smoothstep(0.42, 0.98, across + (folds - 0.5) * 0.3) * 0.42);

    if (uHalo > 0.5) {
      float halo = edge * endFade * (0.055 + folds * 0.09 + flow * 0.035);
      halo *= uOpacity * (1.0 + uPulse * 1.4);
      vec3 haloCol = mix(col, vec3(dot(col, vec3(0.333))), 0.32) * (0.8 + folds * 0.3);
      if (halo < 0.003) discard;
      gl_FragColor = vec4(haloCol, halo);
      return;
    }

    // a few broad strands of silk, not a comb of wires
    float strands = pow(abs(sin(across * 3.14159 * 5.0 + folds * 2.6 + sin(vT * 9.0 - uTime * 0.3) * 0.5)), 5.0);
    float fine = pow(abs(sin(across * 3.14159 * 13.0 - flow * 3.0 + uTime * 0.04)), 12.0);
    float veil = smoothstep(0.25, 0.92, fbm(vec2(vT * 7.5 - uTime * 0.09, across * 2.0 + 8.0)));
    float shimmer = 0.62 + 0.38 * sin(vT * 31.0 - uTime * 0.85 + vSide * 2.4 + uSeed);
    float sheen = smoothstep(0.62, 1.0, sin(vT * 5.0 + folds * 3.5 + uSeed) * 0.5 + 0.5);

    float alpha = edge * endFade;
    alpha *= 0.055 + strands * 0.11 + fine * 0.035 + veil * 0.075 + shimmer * 0.025 + sheen * 0.055;
    alpha *= uOpacity * (1.0 + uPulse * 1.8);

    // tiny woven stars along the cloth
    vec2 cell = floor(vec2(vT * 190.0, across * 7.0));
    float rnd = hash(cell + floor(uSeed * 13.0));
    float star = step(0.986, rnd) * smoothstep(0.18, 0.0, length(fract(vec2(vT * 190.0, across * 7.0)) - 0.5));
    col += vec3(1.0, 0.78, 0.42) * star * 1.15;
    alpha += star * 0.14 * edge;

    vec3 finalColor = col * (0.9 + shimmer * 0.18 + sheen * 0.22 + uPulse * 0.45);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const RIBBONS = [
  {
    name: 'jade',
    points: [
      new THREE.Vector3(0, 94, 4),
      new THREE.Vector3(-16, 108, 1),
      new THREE.Vector3(-58, 132, -22),
      new THREE.Vector3(-112, 139, -44),
      new THREE.Vector3(-158, 116, -36),
      new THREE.Vector3(-184, 75, -2),
      new THREE.Vector3(-191, 31, 37),
    ],
    width: 22,
    wave: 4.8,
    colorA: 0x43b8aa,
    colorB: 0xb8eee0,
    colorC: 0x3a7f91,
    opacity: 0.62,
    seed: 1.7,
    halo: true,
  },
  {
    name: 'gold',
    points: [
      new THREE.Vector3(18, 87, 4),
      new THREE.Vector3(43, 103, -3),
      new THREE.Vector3(89, 122, -20),
      new THREE.Vector3(132, 127, -30),
      new THREE.Vector3(165, 108, -19),
      new THREE.Vector3(187, 77, 4),
    ],
    width: 7,
    wave: 5.2,
    colorA: 0xc88a4b,
    colorB: 0xffdda2,
    colorC: 0xb7744f,
    opacity: 0.48,
    seed: 3.2,
    halo: true,
  },
  {
    name: 'rose',
    points: [
      new THREE.Vector3(-30, 104, -14),
      new THREE.Vector3(-67, 122, -31),
      new THREE.Vector3(-55, 141, -44),
      new THREE.Vector3(-10, 151, -48),
      new THREE.Vector3(37, 149, -49),
      new THREE.Vector3(72, 135, -40),
      new THREE.Vector3(93, 118, -27),
    ],
    width: 29,
    wave: 6.6,
    colorA: 0xa9656d,
    colorB: 0xdfb49b,
    colorC: 0x6f809d,
    opacity: 0.18,
    seed: 5.8,
    halo: false,
  },
];

export function createRibbons(scene) {
  const group = new THREE.Group();
  group.name = 'woven-light';
  const ribbons = [];

  function materialFor(spec, halo = false) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWidth: { value: spec.width * (halo ? 2.7 : 1) },
        uWave: { value: spec.wave },
        uSeed: { value: spec.seed + (halo ? 2.3 : 0) },
        uOpacity: { value: spec.opacity * (halo ? 0.25 : 1) },
        uPulse: { value: 0 },
        uHalo: { value: halo ? 1 : 0 },
        uColorA: { value: new THREE.Color(spec.colorA).convertSRGBToLinear().multiplyScalar(1.35) },
        uColorB: { value: new THREE.Color(spec.colorB).convertSRGBToLinear().multiplyScalar(1.55) },
        uColorC: { value: new THREE.Color(spec.colorC).convertSRGBToLinear().multiplyScalar(1.05) },
      },
      vertexShader: ribbonVertex,
      fragmentShader: ribbonFragment,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }

  for (const spec of RIBBONS) {
    const geo = makeRibbonGeometry(spec.points, 200);
    let haloMesh = null;
    if (spec.halo) {
      haloMesh = new THREE.Mesh(geo, materialFor(spec, true));
      haloMesh.frustumCulled = false;
      haloMesh.renderOrder = 3;
      haloMesh.name = 'ribbon-halo-' + spec.name;
      group.add(haloMesh);
    }
    const mesh = new THREE.Mesh(geo, materialFor(spec, false));
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    mesh.name = 'ribbon-' + spec.name;
    group.add(mesh);
    ribbons.push({ mesh, halo: haloMesh, spec, pulse: 0 });
  }
  scene.add(group);

  return {
    group,
    ribbons,
    update(time) {
      ribbons.forEach((r, i) => {
        r.pulse *= 0.975;
        const mat = r.mesh.material;
        mat.uniforms.uTime.value = time + i * 2.7;
        mat.uniforms.uPulse.value = r.pulse;
        mat.uniforms.uOpacity.value = r.spec.opacity * (0.92 + Math.sin(time * 0.41 + i * 1.7) * 0.08);
        if (r.halo) {
          const hm = r.halo.material.uniforms;
          hm.uTime.value = mat.uniforms.uTime.value;
          hm.uPulse.value = r.pulse;
          hm.uOpacity.value = r.spec.opacity * 0.25 * (0.9 + Math.sin(time * 0.33 + i * 2.1) * 0.1);
        }
      });
    },
    pulse(strength = 1) {
      ribbons.forEach((r, i) => { r.pulse = Math.max(r.pulse, strength * (i === 0 ? 1.2 : 0.8)); });
    },
  };
}
