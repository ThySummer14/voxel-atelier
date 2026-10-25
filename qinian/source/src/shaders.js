// GLSL for the voxel renderer. Quads arrive as two packed uint32 words per instance:
// w0: x(11) y(10) z(11) · w1: w-1(6) h-1(6) dir(3) ao(8) colour(8)

const DECODE = /* glsl */ `
  uint w0 = q.x, w1 = q.y;
  vec3 p = vec3(float(w0 & 2047u), float((w0 >> 11u) & 1023u), float((w0 >> 21u) & 2047u));
  float qw = float(w1 & 63u) + 1.0;
  float qh = float((w1 >> 6u) & 63u) + 1.0;
  uint d = (w1 >> 12u) & 7u;
  uint ao = (w1 >> 15u) & 255u;
  int k = int(position.x + 0.5);
  uint a0 = ao & 3u, a1 = (ao >> 2u) & 3u, a2 = (ao >> 4u) & 3u, a3 = (ao >> 6u) & 3u;
  if (a1 + a3 > a0 + a2) k = (k + 1) % 4;
  float cu = (k == 1 || k == 2) ? 1.0 : 0.0;
  float cv = (k >= 2) ? 1.0 : 0.0;
  vec3 N, U, V;
  if (d == 0u)      { N = vec3( 1, 0, 0); U = vec3(0, 1, 0); V = vec3(0, 0, 1); }
  else if (d == 1u) { N = vec3(-1, 0, 0); U = vec3(0, 0, 1); V = vec3(0, 1, 0); }
  else if (d == 2u) { N = vec3( 0, 1, 0); U = vec3(0, 0, 1); V = vec3(1, 0, 0); }
  else if (d == 3u) { N = vec3( 0,-1, 0); U = vec3(1, 0, 0); V = vec3(0, 0, 1); }
  else if (d == 4u) { N = vec3( 0, 0, 1); U = vec3(1, 0, 0); V = vec3(0, 1, 0); }
  else              { N = vec3( 0, 0,-1); U = vec3(0, 1, 0); V = vec3(1, 0, 0); }
  vec3 vp = p + max(N, vec3(0.0)) + U * (cu * qw) + V * (cv * qh);
  vec3 world = uOrigin + vp * uVoxel;
`;

export const voxelVert = /* glsl */ `
precision highp float;
precision highp int;
in vec3 position;
in uvec2 q;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 uOrigin;
uniform float uVoxel;
out vec3 vWorld;
out float vAO;
flat out vec3 vNormal;
flat out uint vCol;
void main() {
  ${DECODE}
  uint ak = (ao >> (2u * uint(k))) & 3u;
  vCol = (w1 >> 23u) & 255u;
  vNormal = N;
  vAO = float(ak) / 3.0;
  vWorld = world;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;

export const depthVert = /* glsl */ `
precision highp float;
precision highp int;
in vec3 position;
in uvec2 q;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 uOrigin;
uniform float uVoxel;
uniform float uReveal;
out float vY;
void main() {
  ${DECODE}
  vY = world.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;

export const depthFrag = /* glsl */ `
precision highp float;
in float vY;
uniform float uReveal;
out vec4 fragColor;
void main() {
  if (vY > uReveal) discard;
  fragColor = vec4(1.0);
}
`;

export const voxelFrag = /* glsl */ `
precision highp float;
precision highp int;
precision highp sampler3D;
precision highp sampler2DShadow;
in vec3 vWorld;
in float vAO;
flat in vec3 vNormal;
flat in uint vCol;
uniform sampler2D uPal;
uniform sampler3D uSkyVol;
uniform vec3 uSkyMin;
uniform vec3 uSkySize;
uniform sampler2DShadow uShadowMap;
uniform mat4 uShadowMat;
uniform float uShadowTexel;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSkyAmb;
uniform float uAmbient;
uniform vec3 uCamPos;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uSnow;
uniform float uNight;
uniform float uFlood;
uniform float uTime;
uniform float uReveal;
uniform float uVoxel;
uniform vec3 uClipN1;
uniform vec3 uClipN2;
uniform float uClip;
uniform float uSaturation;
out vec4 fragColor;

vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

const vec2 POISSON[12] = vec2[](
  vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621),
  vec2(0.962, -0.195), vec2(0.473, -0.480), vec2(0.519, 0.767), vec2(0.185, -0.893),
  vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598));

float shadowAt(vec3 wp, vec3 n) {
  vec4 sp = uShadowMat * vec4(wp + n * 0.035, 1.0);
  vec3 c = sp.xyz / sp.w * 0.5 + 0.5;
  if (c.x <= 0.0 || c.x >= 1.0 || c.y <= 0.0 || c.y >= 1.0 || c.z >= 1.0) return 1.0;
  float s = 0.0;
  float rad = uShadowTexel * 1.35;
  float rot = hash13(floor(wp * 37.0)) * 6.2831;
  mat2 R = mat2(cos(rot), sin(rot), -sin(rot), cos(rot));
  for (int i = 0; i < 12; i++) s += texture(uShadowMap, vec3(c.xy + R * POISSON[i] * rad, c.z - 0.00025));
  return s / 12.0;
}

vec3 envColor(vec3 r) {
  float t = clamp(r.y, -1.0, 1.0);
  vec3 sky = mix(uHorizon, uZenith, pow(max(t, 0.0), 0.55));
  return t >= 0.0 ? sky : mix(uHorizon * 0.55, uGround, min(1.0, -t * 3.0));
}

float ggx(vec3 n, vec3 v, vec3 l, float rough) {
  vec3 h = normalize(v + l);
  float a = rough * rough;
  float a2 = a * a;
  float nh = max(dot(n, h), 0.0);
  float d = nh * nh * (a2 - 1.0) + 1.0;
  float nl = max(dot(n, l), 0.0), nv = max(dot(n, v), 0.001);
  float k = (rough + 1.0) * (rough + 1.0) / 8.0;
  float g = nl / (nl * (1.0 - k) + k) * nv / (nv * (1.0 - k) + k);
  return a2 / (3.14159 * d * d) * g / (4.0 * nv + 0.001);
}

void main() {
  if (vWorld.y > uReveal) discard;
  bool front = gl_FrontFacing;
  if (uClip > 0.5) {
    vec2 pxz = vWorld.xz;
    // a quarter wedge of the hall is lifted away; the terrace and the hall floor stay
    if (dot(pxz, uClipN1.xz) > 0.0 && dot(pxz, uClipN2.xz) > 0.0 && length(pxz) < 15.4 && vWorld.y > 5.92) discard;
    if (!front) {
      // section poché: dark warm ground with a fine engraving hatch
      float hatch = step(0.8, fract((vWorld.x + vWorld.y + vWorld.z) * 3.0));
      vec3 cut = mix(vec3(0.075, 0.062, 0.054), vec3(0.15, 0.12, 0.1), hatch);
      fragColor = vec4(cut * (0.6 + 0.4 * uAmbient), 1.0);
      return;
    }
  }
  vec4 pal = texelFetch(uPal, ivec2(int(vCol), 0), 0);
  vec4 prm = texelFetch(uPal, ivec2(int(vCol), 1), 0);
  int mat = int(pal.a * 255.0 + 0.5);
  float nz = prm.r;
  float snowable = prm.g;
  vec3 n = vNormal;
  vec3 cell = floor(vWorld / uVoxel - n * 0.5 + 0.001);
  float h1 = hash13(cell);
  vec3 albedo = toLin(pal.rgb) * (1.0 + (h1 - 0.5) * nz * 2.0);
  vec3 v = normalize(uCamPos - vWorld);

  // snow lies on every up-facing face of exposed stone, tile, metal and foliage
  float snow = 0.0;
  if (uSnow > 0.0 && snowable > 0.5 && n.y > 0.5) {
    snow = uSnow * smoothstep(0.08, 0.3, h1 * 0.4 + 0.3);
    albedo = mix(albedo, vec3(0.86, 0.89, 0.93) * (0.94 + h1 * 0.08), snow);
  }

  float rough = 0.85, f0 = 0.03, metal = 0.0, emit = 0.0, wrap = 0.0;
  if (mat == 1) { rough = 0.5; f0 = 0.035; wrap = 0.18; }
  else if (mat == 2) { rough = 0.38; f0 = 0.045; }
  else if (mat == 3) { rough = 0.2; f0 = 0.07; }
  else if (mat == 4) { rough = 0.3; metal = 1.0; }
  else if (mat == 5) { rough = 0.45; metal = 0.75; }
  else if (mat == 6) { emit = 1.0; rough = 0.6; }
  else if (mat == 7) { rough = 0.8; wrap = 0.3; }
  else if (mat == 8) { albedo *= 0.75; }
  else if (mat == 9) { rough = 0.7; f0 = 0.035; }
  if (snow > 0.5) { rough = 0.65; f0 = 0.03; metal = 0.0; emit = 0.0; }

  // occlusion: contact (per-vertex) × large scale (sky volume)
  vec3 sc = (vWorld + n * 0.28 - uSkyMin) / uSkySize;
  float skyVis = texture(uSkyVol, sc).r;
  float contact = mix(0.42, 1.0, vAO);
  float occl = contact * mix(0.3, 1.0, skyVis);

  float ndl = dot(n, uSunDir);
  float sh = ndl > 0.0 ? shadowAt(vWorld, n) : 0.0;
  float diffSun = max((ndl + wrap) / (1.0 + wrap), 0.0) * sh;

  // sky light is shadowed by eaves; bounce from the white terrace below is not
  vec3 skyAmb = uSkyAmb;
  float up = n.y * 0.5 + 0.5;
  float bounceVis = mix(0.62, 1.0, skyVis);
  vec3 ambient = (skyAmb * up * mix(0.3, 1.0, skyVis) + uGround * (1.0 - up) * bounceVis) * uAmbient * contact;
  vec3 col;
  vec3 r = reflect(-v, n);
  float nv = max(dot(n, v), 0.0);
  if (metal > 0.5) {
    vec3 F = albedo + (1.0 - albedo) * pow(1.0 - nv, 5.0);
    vec3 envw = mix(envColor(r), vec3(dot(envColor(r), vec3(0.333))), 0.4);
    col = albedo * (uSunColor * diffSun * 0.9 + ambient * 1.2)
        + F * envw * occl * 0.5
        + F * uSunColor * sh * ggx(n, v, uSunDir, rough) * max(ndl, 0.0);
  } else {
    float F = f0 + (max(1.0 - rough, f0) - f0) * pow(1.0 - nv, 5.0);
    col = albedo * (uSunColor * diffSun + ambient) * (1.0 - F * 0.6)
        + mix(envColor(r), vec3(dot(envColor(r), vec3(0.3333))), mat == 3 ? 0.5 : 0.0) * F * occl * (mat == 3 ? 0.85 : 0.3)
        + uSunColor * sh * ggx(n, v, uSunDir, rough) * f0 * 4.0 * max(ndl, 0.0);
  }

  // night: flood lamps on the upper tier wash the hall from below; interior lamps glow
  if (uNight > 0.0) {
    float rxz = length(vWorld.xz);
    vec2 dir = vWorld.xz / max(rxz, 0.01);
    float hall = smoothstep(16.5, 14.5, rxz) * smoothstep(5.5, 7.0, vWorld.y);
    // near floods on the upper tier wash the walls, brackets and soffits
    vec3 lf = vec3(dir.x * 21.0, 6.2, dir.y * 21.0) - vWorld;
    float dl = length(lf);
    lf /= dl;
    float flood = max(dot(n, lf), 0.0) * hall * (150.0 / (dl * dl + 30.0) + 0.22) + hall * max(-n.y, 0.0) * 0.5;
    // far floods on the lower tier graze the glazed roofs
    vec3 lf2 = vec3(dir.x * 40.0, 2.4, dir.y * 40.0) - vWorld;
    float dl2 = length(lf2);
    lf2 /= dl2;
    float flood2 = max(dot(n, lf2), 0.0) * hall * 2000.0 / (dl2 * dl2 + 300.0);
    vec3 floodCol = vec3(1.0, 0.72, 0.42) * flood * uFlood + vec3(1.0, 0.82, 0.62) * flood2 * uFlood;
    // balustrade uplights: a ring of lamps just inside each tier's rail, and a wash on each tier face
    float rail = 0.0, face = 0.0;
    for (int t = 0; t < 3; t++) {
      float R = t == 0 ? 45.15 : t == 1 ? 39.65 : 34.1;
      float Y = t == 0 ? 2.0 : t == 1 ? 3.8 : 5.6;
      float Yb = t == 0 ? 0.0 : t == 1 ? 2.0 : 3.8;
      float dr = R - rxz, dy = vWorld.y - Y;
      rail += smoothstep(-0.4, 0.1, dr) * smoothstep(3.2, 0.5, dr) * smoothstep(-0.06, 0.06, dy) * exp(-max(dy, 0.0) * 0.8)
            * (max(dot(n.xz, -dir), 0.0) * 0.8 + max(n.y, 0.0) * 0.45 + 0.12);
      face += smoothstep(0.9, 0.0, abs(dr)) * step(Yb, vWorld.y) * step(vWorld.y, Y) * max(dot(n.xz, dir), 0.0);
    }
    floodCol += vec3(1.0, 0.86, 0.68) * (rail * 1.1 + face * 0.35) * uFlood;
    // interior
    float inside = smoothstep(12.2, 11.6, rxz) * step(vWorld.y, 26.0) * step(5.85, vWorld.y);
    vec3 li = normalize(vec3(0.0, 9.5, 0.0) - vWorld);
    floodCol += vec3(1.0, 0.7, 0.4) * inside * (max(dot(n, li), 0.0) * 0.9 + 0.25) * 0.9 * uFlood;
    col += albedo * floodCol * occl * 1.6;
  }
  if (emit > 0.5) col += albedo * (0.25 + uNight * 5.5);

  // gentle saturation control per mood, then aerial perspective
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uSaturation);
  float dist = length(uCamPos - vWorld);
  float fog = 1.0 - exp(-dist * uFogDensity);
  col = mix(col, uFogColor, fog);
  // build reveal: a thin gilded line at the rising edge
  float edge = smoothstep(0.35, 0.0, uReveal - vWorld.y) * step(uReveal, 60.0);
  col += vec3(1.0, 0.75, 0.35) * edge * 2.5;
  fragColor = vec4(col, 1.0);
}
`;

export const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position, 1.0)).xyz, 1.0);
  gl_Position = p.xyww;
}
`;

export const skyFrag = /* glsl */ `
varying vec3 vDir;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunSize;
uniform float uNight;
uniform float uSnow;
uniform float uTime;
uniform float uSkyBright;
uniform vec3 uFogColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
void main() {
  vec3 d = normalize(vDir);
  float t = d.y;
  vec3 col = (t > 0.0 ? mix(uHorizon, uZenith, pow(t, 0.62)) : uHorizon) * uSkyBright;
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunColor * (pow(sd, 900.0 / uSunSize) * 6.0 + pow(sd, 12.0) * 0.18 + pow(sd, 3.0) * 0.05) * step(-0.02, t);
  if (uNight > 0.0 && t > 0.0) {
    vec2 g = d.xz / (t + 0.35) * 160.0;
    float s = step(0.9965, hash(floor(g)));
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + hash(floor(g)) * 40.0);
    col += vec3(0.85, 0.9, 1.0) * s * tw * uNight * smoothstep(0.02, 0.3, t) * 1.4;
  }
  if (t > 0.0 && uSnow < 0.5) {
    vec2 cp = d.xz / (t + 0.12) * 1.6 + vec2(uTime * 0.004, 0.0);
    float c = noise(cp) * 0.6 + noise(cp * 2.3) * 0.3 + noise(cp * 5.1) * 0.1;
    float cl = smoothstep(0.6, 0.82, c) * smoothstep(0.0, 0.25, t) * (1.0 - uNight * 0.7);
    col = mix(col, mix(uHorizon, vec3(1.0), 0.7) * (1.0 - uNight * 0.85), cl * 0.55);
  }
  col = mix(uFogColor, col, smoothstep(-0.01, 0.09, t));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const groundFrag = /* glsl */ `
precision highp sampler2DShadow;
varying vec3 vWorld;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uCamPos;
uniform float uHalf;
uniform sampler2DShadow uShadowMap;
uniform mat4 uShadowMat;
uniform float uShadowTexel;
uniform float uShadowStrength;
float shadowAt(vec3 wp) {
  vec4 sp = uShadowMat * vec4(wp, 1.0);
  vec3 c = sp.xyz / sp.w * 0.5 + 0.5;
  if (c.x <= 0.0 || c.x >= 1.0 || c.y <= 0.0 || c.y >= 1.0) return 1.0;
  float s = 0.0;
  for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++)
    s += texture(uShadowMap, vec3(c.xy + vec2(i, j) * uShadowTexel * 3.0, c.z - 0.0004));
  return s / 25.0;
}
void main() {
  vec2 a = abs(vWorld.xz);
  float m = max(a.x, a.y);
  float contact = smoothstep(uHalf + 7.0, uHalf - 0.2, m);
  float sh = shadowAt(vWorld);
  vec3 col = uColor * (1.0 - 0.34 * contact) * mix(1.0, 1.0 - uShadowStrength, 1.0 - sh);
  float dist = length(uCamPos - vWorld);
  float fog = 1.0 - exp(-dist * uFogDensity * 2.2);
  gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
}
`;

export const groundVert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const snowVert = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  float fall = mod(p.y - uTime * (1.1 + aSeed * 0.8), 46.0);
  p.y = fall - 3.0;
  p.x += sin(uTime * 0.6 + aSeed * 30.0) * 1.2;
  p.z += cos(uTime * 0.45 + aSeed * 17.0) * 1.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.6 + aSeed) / -mv.z;
  vA = smoothstep(-3.0, 2.0, p.y) * smoothstep(43.0, 36.0, p.y);
  gl_Position = projectionMatrix * mv;
}
`;

export const snowFrag = /* glsl */ `
varying float vA;
uniform float uOpacity;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.15, d) * vA * uOpacity;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(0.95, 0.97, 1.0) * 1.4, a);
}
`;

export const gradeFrag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uVignette;
uniform float uGrain;
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  vec2 q = vUv - 0.5;
  float v = 1.0 - dot(q, q) * uVignette;
  c.rgb *= v;
  c.rgb += (hash(vUv * 1000.0) - 0.5) * uGrain;
  gl_FragColor = c;
}
`;
