// Gradient sky dome with sun/moon/stars, plus drifting voxel clouds.

import * as THREE from 'three';
import { World } from '../core/world.js';
import { meshWorld } from '../core/mesher.js';
import { mulberry32 } from '../core/rng.js';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vDir;
uniform vec3 uTop, uMid, uHor, uSun, uSunDir, uMoonDir;
uniform float uStar, uSunI, uMoonI, uTime;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 col = mix(uHor, uMid, smoothstep(-0.02, 0.16, y));
  col = mix(col, uTop, smoothstep(0.10, 0.62, y));
  col = mix(col, uHor * 0.55, smoothstep(-0.02, -0.35, y));

  float sd = max(dot(d, normalize(uSunDir)), 0.0);
  float above = smoothstep(-0.06, 0.02, uSunDir.y);
  col += uSun * (pow(sd, 420.0) * 2.4 + pow(sd, 32.0) * 0.30 + pow(sd, 6.0) * 0.10) * above * clamp(uSunI, 0.0, 3.0);
  col += uSun * smoothstep(0.9993, 0.99975, sd) * 3.0 * above;

  float md = max(dot(d, normalize(uMoonDir)), 0.0);
  col += vec3(0.82, 0.88, 1.0) * (smoothstep(0.99955, 0.99985, md) * 1.6 + pow(md, 90.0) * 0.12) * uMoonI;

  if (uStar > 0.001 && y > 0.0) {
    vec3 cell = floor(d * 260.0);
    float h = hash(cell);
    float star = step(0.9975, h);
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 90.0);
    col += vec3(0.9, 0.94, 1.0) * star * tw * uStar * smoothstep(0.0, 0.25, y);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createSky(scene) {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uMid: { value: new THREE.Color() },
    uHor: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
    uStar: { value: 0 },
    uSunI: { value: 1 },
    uMoonI: { value: 0 },
    uTime: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), mat);
  dome.frustumCulled = false;
  scene.add(dome);

  // voxel clouds
  const rnd = mulberry32(777);
  const cw = new World(150, 14, 80);
  for (let c = 0; c < 8; c++) {
    const cx = 12 + rnd() * 126, cz = 10 + rnd() * 60, cy = 5 + rnd() * 4;
    const rx = 6 + rnd() * 9, rz = 4 + rnd() * 6, ry = 2.0 + rnd() * 1.8;
    for (let z = Math.floor(cz - rz); z <= cz + rz; z++)
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
        for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
          const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
          if (d <= 1 && rnd() < 0.92) cw.set(x, y, z, 1);
        }
  }
  // cloud palette entry is id 1 in this local world; remap colours to white via material
  const cm = meshWorld(cw, { ao: true });
  const cloudMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
  // override baked colours to a soft white with subtle underside shade
  const g = cm.groups.opaque;
  if (g) {
    for (let i = 0; i < g.color.length; i += 3) {
      const shade = g.normal[i + 1] > 0.5 ? 1.0 : g.normal[i + 1] < -0.5 ? 0.62 : 0.82;
      g.color[i] = 0.92 * shade; g.color[i + 1] = 0.94 * shade; g.color[i + 2] = 0.98 * shade;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(g.position, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(g.normal, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(g.color, 3));
    geo.setIndex(new THREE.BufferAttribute(g.index, 1));
    const clouds = new THREE.Mesh(geo, cloudMat);
    clouds.scale.set(4.2, 2.6, 4.2);
    clouds.position.set(-260, 168, -140);
    clouds.castShadow = false;
    clouds.receiveShadow = false;
    scene.add(clouds);
    return { dome, uniforms, clouds };
  }
  return { dome, uniforms, clouds: null };
}

export function updateSky(sky, p, t) {
  const u = sky.uniforms;
  u.uTop.value.setRGB(...p.top);
  u.uMid.value.setRGB(...p.mid);
  u.uHor.value.setRGB(...p.hor);
  u.uSun.value.setRGB(...p.sun);
  u.uSunDir.value.set(...p.sunDir);
  u.uMoonDir.value.set(...p.moonDir);
  u.uStar.value = p.star;
  u.uSunI.value = p.sunI;
  u.uMoonI.value = p.moonI;
  u.uTime.value = t;
  if (sky.clouds) {
    sky.clouds.position.x = -260 + ((t * 1.6) % 620);
    sky.clouds.material.color.setRGB(
      0.10 + 0.90 * p.day + 0.30 * (1 - p.night) * (1 - p.day),
      0.10 + 0.88 * p.day + 0.20 * (1 - p.night) * (1 - p.day),
      0.14 + 0.86 * p.day + 0.14 * (1 - p.night) * (1 - p.day),
    );
  }
}