// Deterministic PRNG & 2D/3D procedural value/gradient noise for natural rock strata & wood grain

export function createRNG(seed = 4910491) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash3(x, y, z, seed = 491) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647) + Math.imul(seed, 1597334677)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function hash2(x, z, seed = 491) {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 1597334677)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function noise2(x, z, seed = 491) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = smooth(x - xi);
  const zf = smooth(z - zi);

  const n00 = hash2(xi, zi, seed);
  const n10 = hash2(xi + 1, zi, seed);
  const n01 = hash2(xi, zi + 1, seed);
  const n11 = hash2(xi + 1, zi + 1, seed);

  return lerp(lerp(n00, n10, xf), lerp(n01, n11, xf), zf) * 2 - 1;
}

export function noise3(x, y, z, seed = 491) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const zf = smooth(z - zi);

  const c000 = hash3(xi, yi, zi, seed);
  const c100 = hash3(xi + 1, yi, zi, seed);
  const c010 = hash3(xi, yi + 1, zi, seed);
  const c110 = hash3(xi + 1, yi + 1, zi, seed);
  const c001 = hash3(xi, yi, zi + 1, seed);
  const c101 = hash3(xi + 1, yi, zi + 1, seed);
  const c011 = hash3(xi, yi + 1, zi + 1, seed);
  const c111 = hash3(xi + 1, yi + 1, zi + 1, seed);

  const x00 = lerp(c000, c100, xf);
  const x10 = lerp(c010, c110, xf);
  const x01 = lerp(c001, c101, xf);
  const x11 = lerp(c011, c111, xf);

  const y0 = lerp(x00, x10, yf);
  const y1 = lerp(x01, x11, yf);

  return lerp(y0, y1, zf) * 2 - 1;
}

export function fbm3(x, y, z, octaves = 4, seed = 491) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq, seed + i * 97);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export function fbm2(x, z, octaves = 4, seed = 491) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, z * freq, seed + i * 131);
    norm += amp;
    amp *= 0.5;
    freq *= 2.02;
  }
  return sum / norm;
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
