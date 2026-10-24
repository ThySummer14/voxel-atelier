export const C = {
  ink: 0x0b141d,
  deepRock: 0x182636,
  rock1: 0x26384a,
  rock2: 0x30465a,
  rock3: 0x3b5367,
  rock4: 0x4a6071,
  rockWarm: 0x5f554b,
  rockPale: 0x6f7a7d,
  moss1: 0x294b40,
  moss2: 0x3b6351,
  moss3: 0x527b5f,
  moss4: 0x718c65,
  pine1: 0x183a35,
  pine2: 0x214941,
  pine3: 0x2f5b4f,
  pine4: 0x497462,
  soil: 0x3b352c,
  soilLight: 0x504637,
  timber1: 0x3b2c28,
  timber2: 0x543b31,
  timber3: 0x6d4d3b,
  timber4: 0x835c43,
  vermilion: 0x9b4635,
  vermilionLight: 0xb65b41,
  vermilionDark: 0x713126,
  plaster: 0xbba98c,
  plasterLight: 0xd2c3a6,
  plasterShade: 0x94856e,
  roof1: 0x192f39,
  roof2: 0x223d47,
  roof3: 0x2c4c55,
  roof4: 0x3b5d63,
  roofEdge: 0x547077,
  tileLight: 0x779092,
  brass1: 0x6a512e,
  brass2: 0x95713e,
  brass3: 0xb98f50,
  brass4: 0xd7ae69,
  gold: 0xe8c27d,
  goldBright: 0xffe0a0,
  lampWarm: 0xffa552,
  lampCore: 0xffcf83,
  lampWhite: 0xffe7bf,
  glowCyan: 0x69e6d3,
  glowTeal: 0x2fae9e,
  glowRose: 0xf0a2a6,
  cloth: 0xd9c4a2,
  clothRed: 0xb95642,
  water: 0x4b7f88,
  cloud: 0x9cb8c2,
  cloudLight: 0xcfdfe1,
  stoneFloor: 0x5b6670,
  stoneFloorLight: 0x778188,
  stonePath: 0x6b6f6c,
  white: 0xe7dfcf,
  bird: 0xbfc8c4,
  birdDark: 0x78858a,
  ember: 0xff8a4c,
};

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2i(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function smooth(t) { return t * t * (3 - 2 * t); }

export function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  const a = hash2i(xi, yi, seed);
  const b = hash2i(xi + 1, yi, seed);
  const c = hash2i(xi, yi + 1, seed);
  const d = hash2i(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export function fbm(x, y, seed = 0, octaves = 4, persisting = 0.5) {
  let value = 0;
  let amp = 0.5;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2(x, y, seed + i * 37);
    total += amp;
    x *= 2.03;
    y *= 2.03;
    amp *= persisting;
  }
  return value / total;
}

export function randomColorVariants(seed = 1) {
  const rand = mulberry32(seed);
  return (array, spread = 0.04) => {
    const hex = array[Math.floor(rand() * array.length)];
    return hex;
  };
}

export const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
