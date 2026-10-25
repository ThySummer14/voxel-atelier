export const TAU = Math.PI * 2;

// Deterministic integer hash → [0,1)
export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}
export function hash2(x, y) {
  return hash3(x, y, 911);
}

export function smooth(t) {
  return t * t * (3 - 2 * t);
}

// 2D value noise in [0,1)
export function vnoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash3(xi, yi, seed), b = hash3(xi + 1, yi, seed);
  const c = hash3(xi, yi + 1, seed), d = hash3(xi + 1, yi + 1, seed);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, seed = 0, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f, seed + i * 17);
    f *= 2;
    a *= 0.5;
  }
  return s;
}

// wrap angle to (-PI, PI]
export function wrap(a) {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
