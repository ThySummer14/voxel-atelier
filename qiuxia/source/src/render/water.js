// Animated river surface: sine-sum normals, fresnel sky mix, sun glint, flow along Z.

import * as THREE from 'three';
import { GORGE_X0, GORGE_X1, NZ, RIVER_Y } from '../build/layout.js';

const VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vWorld;
uniform float uTime, uNight, uSunI;
uniform vec3 uSunDir, uSun, uSky, uDeep;
uniform vec3 uCam;

float wave(vec2 p, vec2 dir, float freq, float speed) {
  return sin(dot(p, dir) * freq + uTime * speed);
}

void main() {
  vec2 p = vWorld.xz;
  float t = uTime;
  float h = 0.0;
  vec2 grad = vec2(0.0);
  // four travelling components, flow biased along +Z
  vec2 d1 = normalize(vec2(0.15, 1.0));
  vec2 d2 = normalize(vec2(-0.35, 1.0));
  vec2 d3 = normalize(vec2(0.6, 0.8));
  vec2 d4 = normalize(vec2(-0.1, 1.0));
  float a1 = 0.30, a2 = 0.18, a3 = 0.10, a4 = 0.06;
  float f1 = 0.55, f2 = 0.95, f3 = 1.7, f4 = 3.1;
  float s1 = 1.6, s2 = 2.3, s3 = 3.0, s4 = 4.2;
  grad += d1 * f1 * a1 * cos(dot(p, d1) * f1 + t * s1);
  grad += d2 * f2 * a2 * cos(dot(p, d2) * f2 + t * s2);
  grad += d3 * f3 * a3 * cos(dot(p, d3) * f3 + t * s3);
  grad += d4 * f4 * a4 * cos(dot(p, d4) * f4 + t * s4);
  vec3 n = normalize(vec3(-grad.x * 0.35, 1.0, -grad.y * 0.35));

  vec3 v = normalize(uCam - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 base = mix(uDeep, uDeep * 1.7, 0.4 + 0.3 * wave(p, d1, f1, s1));
  vec3 col = mix(base, uSky, clamp(fres * 0.85 + 0.10, 0.0, 1.0));

  vec3 r = reflect(-normalize(uSunDir), n);
  float spec = pow(max(dot(r, v), 0.0), 90.0);
  col += uSun * spec * (0.9 * uSunI);
  float glint = pow(max(dot(r, v), 0.0), 700.0);
  col += uSun * glint * 2.0 * uSunI;

  // moon glitter at night
  col += vec3(0.5, 0.6, 0.8) * pow(max(dot(reflect(-normalize(vec3(0.3, 0.8, -0.4)), n), v), 0.0), 120.0) * uNight * 0.6;

  float alpha = 0.88 - fres * 0.18;
  gl_FragColor = vec4(col, alpha);
}
`;

export function createWater(scene) {
  const w = GORGE_X1 - GORGE_X0 - 4;
  const geo = new THREE.PlaneGeometry(w, NZ - 2, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const uniforms = {
    uTime: { value: 0 },
    uNight: { value: 0 },
    uSunI: { value: 1 },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSun: { value: new THREE.Color(1, 1, 1) },
    uSky: { value: new THREE.Color(0.5, 0.6, 0.7) },
    uDeep: { value: new THREE.Color(0.05, 0.13, 0.14) },
    uCam: { value: new THREE.Vector3() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((GORGE_X0 + GORGE_X1) / 2, RIVER_Y + 0.35, NZ / 2);
  mesh.renderOrder = 2;
  scene.add(mesh);
  return { mesh, uniforms };
}

export function updateWater(water, p, t, cam) {
  const u = water.uniforms;
  u.uTime.value = t;
  u.uNight.value = p.night;
  u.uSunI.value = Math.max(p.sunI, p.moonI * 0.5);
  u.uSunDir.value.set(...(p.sunI > 0.05 ? p.sunDir : p.moonDir));
  u.uSun.value.setRGB(...(p.sunI > 0.05 ? p.sun : [0.7, 0.8, 1.0]));
  u.uSky.value.setRGB(...p.mid).multiplyScalar(0.8);
  u.uDeep.value.setRGB(0.04 + 0.05 * p.day, 0.10 + 0.08 * p.day, 0.11 + 0.08 * p.day);
  u.uCam.value.copy(cam.position);
}