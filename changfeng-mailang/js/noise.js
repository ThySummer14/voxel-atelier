// 确定性哈希噪声：同一 seed 永远生成同一片山谷，方便截图复现。

export function makeNoise(seed = 1337) {
  const s = seed >>> 0;

  function hash2(xi, yi) {
    let h = Math.imul(xi | 0, 374761393) + Math.imul(yi | 0, 668265263) + s;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  function hash3(xi, yi, zi) {
    let h = Math.imul(xi | 0, 374761393) + Math.imul(yi | 0, 668265263) + Math.imul(zi | 0, 2147483647) + s;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  const smooth = (t) => t * t * (3 - 2 * t);

  function value2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = smooth(x - xi), fy = smooth(y - yi);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    const top = a + (b - a) * fx;
    const bot = c + (d - c) * fx;
    return top + (bot - top) * fy;
  }

  function value3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = smooth(x - xi), fy = smooth(y - yi), fz = smooth(z - zi);
    const n = (a, b, c) => hash3(xi + a, yi + b, zi + c);
    const c00 = n(0, 0, 0) + (n(1, 0, 0) - n(0, 0, 0)) * fx;
    const c10 = n(0, 1, 0) + (n(1, 1, 0) - n(0, 1, 0)) * fx;
    const c01 = n(0, 0, 1) + (n(1, 0, 1) - n(0, 0, 1)) * fx;
    const c11 = n(0, 1, 1) + (n(1, 1, 1) - n(0, 1, 1)) * fx;
    const c0 = c00 + (c10 - c00) * fy;
    const c1 = c01 + (c11 - c01) * fy;
    return c0 + (c1 - c0) * fz;
  }

  function fbm2(x, y, oct = 4, lac = 2.03, gain = 0.5) {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += a * value2(x * f, y * f);
      norm += a;
      a *= gain; f *= lac;
    }
    return sum / norm;
  }

  function fbm3(x, y, z, oct = 3, lac = 2.01, gain = 0.5) {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += a * value3(x * f, y * f, z * f);
      norm += a;
      a *= gain; f *= lac;
    }
    return sum / norm;
  }

  // 山脊噪声：给远山一点锐利的分形感
  function ridge2(x, y, oct = 4) {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      const n = 1 - Math.abs(value2(x * f, y * f) * 2 - 1);
      sum += a * n * n;
      norm += a;
      a *= 0.52; f *= 2.07;
    }
    return sum / norm;
  }

  return { hash2, hash3, value2, value3, fbm2, fbm3, ridge2 };
}