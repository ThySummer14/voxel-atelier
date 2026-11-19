import {
  AdditiveBlending, BackSide, Color, DoubleSide, Matrix4, Mesh, PlaneGeometry,
  ShaderMaterial, SphereGeometry, Vector2, Vector3, Vector4,
} from 'three';

export const LIGHTS = {
  dusk: {
    name: '斜阳', time: '17:20',
    horizon: '#f6caa3', middle: '#adbfc0', zenith: '#52778f', cloud: '#e5bab0',
    fog: '#8ca6a9', density: .00143, deep: '#123a4f', swell: '#388a94',
    sun: '#ffd8ae', sky: '#daf0fc', bounce: '#85766d', key: 1.76, fill: 1.43, lamps: .31,
  },
  blue: {
    name: '蓝时', time: '18:42',
    horizon: '#efa88f', middle: '#647fa5', zenith: '#354775', cloud: '#a599ba',
    fog: '#6e83a2', density: .00156, deep: '#122a46', swell: '#367588',
    sun: '#ffcb9f', sky: '#a7c6ef', bounce: '#77717e', key: 1.61, fill: 1.48, lamps: 1.39,
  },
  night: {
    name: '夜班', time: '22:10',
    horizon: '#596789', middle: '#2d456c', zenith: '#152744', cloud: '#525f81',
    fog: '#405777', density: .00168, deep: '#0d1d33', swell: '#294d6a',
    sun: '#afc9f0', sky: '#8daedc', bounce: '#5d617d', key: .74, fill: .96, lamps: 2.14,
  },
};

const noise = /* glsl */ `
float hash2(vec2 v) {
  return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453);
}

float field(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
             mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
`;

const skyVertex = /* glsl */ `
varying vec3 direction;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  direction = world.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const skyFragment = /* glsl */ `
varying vec3 direction;
uniform vec3 horizon;
uniform vec3 middle;
uniform vec3 zenith;
uniform vec3 cloud;
uniform float twilight;

${noise}

void main() {
  vec3 ray = normalize(direction);
  float altitude = max(-.09, ray.y);
  float above = smoothstep(-.042, .139, altitude);
  float zenithAmount = smoothstep(.015, .43, altitude);
  vec3 color = mix(mix(horizon, middle, above), zenith, zenithAmount);

  vec2 pos = vec2(atan(ray.x, -ray.z), altitude);
  float west = pow(max(0.0, dot(normalize(ray.xz), normalize(vec2(-.68, -.73)))), 2.4);
  float glow = exp(-abs(altitude - .030) * 14.0) * west * twilight;
  color += glow * vec3(.15, .065, .035);

  // Two ragged cloud decks with horizontal edges stepped at screen-readable intervals.
  vec2 sampleAt = floor(pos * vec2(410.0, 245.0)) / vec2(410.0, 245.0);
  float veil = field(vec2(sampleAt.x * 5.1 + sampleAt.y * 6.0, sampleAt.y * 45.0 + .72));
  veil = veil * .71 + field(vec2(sampleAt.x * 16.0, sampleAt.y * 177.0)) * .29;
  float band = smoothstep(.011, .062, altitude) * (1.0 - smoothstep(.13, .28, altitude));
  float streak = smoothstep(.49, .80, veil) * band * (.7 + west * .22);
  vec3 litCloud = mix(cloud, horizon, (.26 + west * .26) * twilight);
  float highSide = smoothstep(.054, .125, sampleAt.y);
  vec3 shadedCloud = mix(litCloud, mix(cloud, zenith, .53), highSide * .72);
  color = mix(color, shadedCloud, streak * .81);

  float highDeck = field(vec2(sampleAt.x * 7.0 - 3.0, sampleAt.y * 57.0 + 14.0));
  highDeck = smoothstep(.67, .83, highDeck) * smoothstep(.19, .23, altitude) * (1.0 - smoothstep(.28, .43, altitude));
  color = mix(color, cloud, highDeck * .18);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

const waterVertex = /* glsl */ `
uniform mat4 reflectionMatrix;
varying vec3 waterPosition;
varying vec4 reflectionPosition;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  waterPosition = world.xyz;
  reflectionPosition = reflectionMatrix * world;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const waterFragment = /* glsl */ `
uniform sampler2D mirrorMap;
uniform vec2 reflectionPixel;
uniform vec3 deep;
uniform vec3 swell;
uniform vec3 horizon;
uniform vec3 skyTint;
uniform float twilight;
uniform float clockTime;
uniform vec4 wakes[2];
varying vec3 waterPosition;
varying vec4 reflectionPosition;

${noise}

float wake(vec2 pos, vec4 boat, float span, float offset) {
  vec2 vector = boat.zw;
  vec2 away = pos - boat.xy + vector * offset;
  float dist = -dot(away, vector);
  float side = abs(dot(away, vec2(vector.y, -vector.x)));
  float trail = smoothstep(-.5, 1.7, dist) * (1.0 - smoothstep(span * .32, span, dist));
  float arms = exp(-pow((side - .204 * dist - 1.15) / (.55 + dist * .017), 2.0));
  arms *= .5 + .5 * sin(dist * .62 - clockTime * 1.9);
  float wash = exp(-pow(side / (1.00 + dist * .088), 2.0)) * (1.0 - smoothstep(6.0, span * .70, dist));
  return trail * (arms * .81 + wash * .64);
}

void main() {
  vec2 world = waterPosition.xz;
  vec3 toEye = cameraPosition - waterPosition;
  float distanceToEye = length(toEye);
  vec3 look = normalize(toEye);
  vec2 cell = floor(world * vec2(1.25, 1.7)) / vec2(1.25, 1.7);
  vec2 p = mix(cell, world, smoothstep(385.0, 680.0, distanceToEye));
  float phase = clockTime * .70;

  float shallowRidges = field(p * vec2(.09, .50) + vec2(-phase * .04, phase * .17));
  float crossed = field(vec2(p.x * .23 + p.y * .025, p.y * .99 - phase * .23));
  float groups = field(p * vec2(.026, .125) + vec2(phase * .055, phase * .075));
  float ridges = smoothstep(.61, .86, shallowRidges * .68 + crossed * .32);
  float fold = sin(p.y * .67 + p.x * .092 + phase + groups * 6.4);
  float shoal = field(p * vec2(.012, .021));
  float crests = smoothstep(.65, .93, .55 * shallowRidges + .33 * crossed + .12 * (fold * .5 + .5));
  vec3 color = mix(deep, swell, .24 + shallowRidges * .24 + groups * .25 + shoal * .09);
  color += swell * fold * .035;
  color += swell * ridges * .26 + skyTint * crests * .21;

  vec2 mapped = reflectionPosition.xy / reflectionPosition.w * .5 + .5;
  mapped += vec2((crossed - .5) * .008, (shallowRidges - .5) * .006) * (1.0 - look.y * .53);
  vec2 safe = clamp(mapped, reflectionPixel, 1.0 - reflectionPixel);
  vec3 mirror = texture2D(mirrorMap, safe).rgb * .62;
  mirror += texture2D(mirrorMap, safe + vec2(reflectionPixel.x * 1.55, 0)).rgb * .19;
  mirror += texture2D(mirrorMap, safe - vec2(reflectionPixel.x * 1.55, 0)).rgb * .19;
  float offscreen = smoothstep(.0, .035, min(min(mapped.x, 1.0 - mapped.x), min(mapped.y, 1.0 - mapped.y)));
  mirror = mix(mix(horizon, skyTint, smoothstep(-.035, .29, look.y)), mirror, offscreen);
  float fresnel = pow(1.0 - max(0.0, look.y), 2.25);
  color = mix(color, mirror, (.30 + .59 * fresnel) * (.77 + groups * .44));

  float glint = pow(max(0.0, dot(normalize(look.xz), normalize(vec2(.68, .73)))), 26.0);
  color += horizon * glint * ridges * pow(1.0 - look.y, 1.7) * twilight * .21;

  float walls = exp(-abs(p.x - 96.0) * .23) * step(-170.0, p.y) * step(p.y, 93.0) * step(p.x, 96.0);
  walls += exp(-abs(p.x + 106.0) * .21) * step(-172.0, p.y) * step(p.y, 23.0) * step(-106.0, p.x);
  color *= 1.0 - walls * .34;
  color += walls * ridges * swell * .17;

  float propwash = wake(p, wakes[0], 44.0, 5.70) + wake(p, wakes[1], 37.0, 8.3);
  float bubbles = smoothstep(.20, .71, .58 * shallowRidges + .42 * crossed);
  vec3 foam = mix(swell * 1.62 + skyTint * .26, vec3(.49, .69, .68), twilight * .51);
  color = mix(color, foam, min(.86, propwash * (bubbles * .81 + ridges * .38)));

  color = mix(color, mix(skyTint, horizon, .21), .76 * smoothstep(760.0, 2200.0, distanceToEye));
  gl_FragColor = vec4(max(color, vec3(0)), 1.0);
  #include <colorspace_fragment>
}
`;

const poolVertex = /* glsl */ `
varying vec2 pixel;
void main() {
  pixel = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const poolFragment = /* glsl */ `
uniform vec3 paint;
uniform float opacity;
varying vec2 pixel;
void main() {
  vec2 square = (floor(pixel * 52.0) + .5) / 26.0 - 1.0;
  float falloff = 1.0 - smoothstep(.12, 1.0, length(square));
  gl_FragColor = vec4(paint, opacity * falloff * falloff);
  #include <colorspace_fragment>
}
`;

export function makeAtmosphere(scene, pools, texture) {
  const skyUniforms = {
    horizon: { value: new Color() }, middle: { value: new Color() },
    zenith: { value: new Color() }, cloud: { value: new Color() },
    twilight: { value: 1 },
  };
  const sky = new Mesh(
    new SphereGeometry(2400, 24, 12),
    new ShaderMaterial({
      side: BackSide, depthWrite: false, vertexShader: skyVertex, fragmentShader: skyFragment, uniforms: skyUniforms,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);

  const waterUniforms = {
    mirrorMap: { value: texture }, reflectionMatrix: { value: new Matrix4() }, reflectionPixel: { value: new Vector2() },
    deep: { value: new Color() }, swell: { value: new Color() }, horizon: { value: new Color() },
    skyTint: { value: new Color() }, twilight: { value: 1 }, clockTime: { value: 0 },
    wakes: { value: [new Vector4(), new Vector4()] },
  };
  const sea = new Mesh(
    new PlaneGeometry(5000, 5000),
    new ShaderMaterial({ vertexShader: waterVertex, fragmentShader: waterFragment, uniforms: waterUniforms }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = .015;
  scene.add(sea);

  const poolGeometry = new PlaneGeometry(1, 1);
  const poolsWithStrength = pools.map(({ x, y, z, w, d, color, strength }) => {
    const pond = new Mesh(poolGeometry, new ShaderMaterial({
      uniforms: { paint: { value: new Color(color) }, opacity: { value: 0 } },
      vertexShader: poolVertex, fragmentShader: poolFragment,
      transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
    }));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(x, y, z);
    pond.scale.set(w, d, 1);
    scene.add(pond);
    return { pond, strength };
  });

  function setMood(mood) {
    for (const key of ['horizon', 'middle', 'zenith', 'cloud']) skyUniforms[key].value.copy(mood[key]);
    for (const key of ['horizon', 'deep', 'swell']) waterUniforms[key].value.copy(mood[key]);
    waterUniforms.skyTint.value.copy(mood.middle);
    skyUniforms.twilight.value = waterUniforms.twilight.value = mood.twilight;
    for (const { pond, strength } of poolsWithStrength) {
      const opacity = (mood.lamps - .28) * strength * .35;
      pond.visible = opacity > .035;
      pond.material.uniforms.opacity.value = opacity;
    }
  }

  function updateWater(poses, time) {
    const [pilot, tug] = waterUniforms.wakes.value;
    pilot.set(poses.pilot.x, poses.pilot.z, Math.sin(poses.pilot.yaw), Math.cos(poses.pilot.yaw));
    tug.set(poses.tug.x, poses.tug.z, Math.sin(poses.tug.yaw), Math.cos(poses.tug.yaw));
    waterUniforms.clockTime.value = time;
  }

  function setProjection(camera, width, height) {
    waterUniforms.reflectionMatrix.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    waterUniforms.reflectionPixel.value.set(1 / width, 1 / height);
  }

  return { sea, setMood, updateWater, setProjection };
}

export function moodFor(id) {
  const entry = LIGHTS[id];
  const colors = {};
  for (const key of ['horizon', 'middle', 'zenith', 'cloud', 'fog', 'deep', 'swell', 'sun', 'sky', 'bounce']) {
    colors[key] = new Color(entry[key]);
  }
  return { ...colors, density: entry.density, key: entry.key, fill: entry.fill, lamps: entry.lamps,
    twilight: id === 'night' ? .07 : id === 'blue' ? .61 : 1 };
}

export function blendMood(out, a, b, t) {
  for (const key of ['horizon', 'middle', 'zenith', 'cloud', 'fog', 'deep', 'swell', 'sun', 'sky', 'bounce']) {
    out[key].lerpColors(a[key], b[key], t);
  }
  for (const key of ['density', 'key', 'fill', 'lamps', 'twilight']) out[key] = a[key] + t * (b[key] - a[key]);
}
