import { C, fbm, noise2, smoothstep, clamp } from './palette.js';

const MASSIFS = [
  { cx: 7, cz: 2, rx: 68, rz: 53, top: 50, base: 4, inner: 0.57, p: 3.5, seed: 11 },
  { cx: -42, cz: -36, rx: 37, rz: 34, top: 78, base: 4, inner: 0.38, p: 2.5, seed: 23 },
  { cx: -71, cz: -2, rx: 15, rz: 20, top: 89, base: 6, inner: 0.36, p: 2.7, seed: 31 },
  { cx: 62, cz: -37, rx: 33, rz: 30, top: 66, base: 4, inner: 0.4, p: 2.7, seed: 43 },
  { cx: -55, cz: 52, rx: 24, rz: 26, top: 37, base: 3, inner: 0.48, p: 2.9, seed: 57 },
  { cx: -16, cz: -62, rx: 28, rz: 22, top: 58, base: 4, inner: 0.36, p: 2.4, seed: 71 },
];

export const PADS = [
  { x0: -16, x1: 17, z0: -16, z1: 17, y: 50 },       // loom courtyard
  { x0: 25, x1: 64, z0: -13, z1: 27, y: 50 },        // hall terrace
  { x0: -44, x1: 22, z0: 20, z1: 31, y: 50 },        // cloister path
  { x0: -43, x1: -24, z0: -11, z1: 11, y: 50 },      // west tower
  { x0: 25, x1: 43, z0: -11, z1: 11, y: 50 },        // east tower
  { x0: -66, x1: -45, z0: 43, z1: 63, y: 37 },       // foreground pavilion
  { x0: -34, x1: -19, z0: 32, z1: 47, y: 50 },       // water court
];

const STONE_BANDS = [
  [C.rock1, C.rock2, C.deepRock, C.rock2],
  [C.rock2, C.rock3, C.rock1, C.deepRock],
  [C.deepRock, C.rock1, C.rock2, C.rock3],
  [C.rock3, C.rock2, C.rock4, C.rock1],
];
const MOSS = [C.moss1, C.moss2, C.moss3, C.moss2, C.moss4];
const HIGH_MOSS = [C.moss2, C.pine3, C.moss3, C.rock3];
const SOILS = [C.soil, C.soilLight, 0x463d31, 0x514638];

function radial(x, z, m) {
  let nx = (x - m.cx) / m.rx;
  let nz = (z - m.cz) / m.rz;
  nx += (noise2(x * 0.035, z * 0.035, m.seed + 1) - 0.5) * 0.15;
  nz += (noise2(x * 0.032 + 9, z * 0.032 - 4, m.seed + 2) - 0.5) * 0.15;
  let r = Math.pow(Math.pow(Math.abs(nx), m.p) + Math.pow(Math.abs(nz), m.p), 1 / m.p);
  r *= 1 + (fbm(x * 0.062, z * 0.062, m.seed + 4, 3) - 0.5) * 0.24;
  return r;
}

function massifHeight(x, z, m) {
  const r = radial(x, z, m);
  if (r >= 1.06) return -100;
  const t = smoothstep(m.inner, 1.0, clamp(r, 0, 1.05));
  let h = m.top - t * (m.top - m.base);
  h = h * 0.71 + Math.round(h / 3.5) * 3.5 * 0.29;
  const detail = (fbm(x * 0.115, z * 0.115, m.seed + 8, 3) - 0.5) * 2.6;
  h += detail * (1 - t * 0.82);
  h += (noise2(x * 0.31, z * 0.31, m.seed + 10) - 0.5) * 0.8;
  return h;
}

export function createTerrain(heightOverride) {
  function rawHeight(x, z) {
    let h = 0;
    for (const m of MASSIFS) {
      const mh = massifHeight(x, z, m);
      if (mh > h) h = mh;
    }
    for (const pad of PADS) {
      if (x >= pad.x0 && x <= pad.x1 && z >= pad.z0 && z <= pad.z1) {
        h = Math.max(h, pad.y);
      }
    }
    if (heightOverride) h = heightOverride(x, z, h);
    return Math.round(h);
  }

  function heightAt(x, z) {
    return rawHeight(x, z);
  }

  return { heightAt, rawHeight };
}

function slopeAt(heightAt, x, z) {
  const h = heightAt(x, z);
  return Math.max(
    Math.abs(h - heightAt(x + 1, z)),
    Math.abs(h - heightAt(x - 1, z)),
    Math.abs(h - heightAt(x, z + 1)),
    Math.abs(h - heightAt(x, z - 1)),
  );
}

export function buildTerrain(vol, heightAt) {
  const { min, max } = vol;
  const seed = 931;
  for (let x = min.x; x <= max.x; x++) {
    for (let z = min.z; z <= max.z; z++) {
      const h = heightAt(x, z);
      if (h < 1) continue;
      const slope = slopeAt(heightAt, x, z);
      const steep = slope > 2;
      const grain = noise2(x * 0.21, z * 0.21, seed);
      const strataNoise = noise2(x * 0.035, z * 0.035, seed + 2);
      for (let y = 0; y <= h; y++) {
        const d = h - y;
        let color;
        let kind = 0;
        if (d === 0 && !steep && grain > 0.23) {
          if (h > 70) color = HIGH_MOSS[(Math.floor(noise2(x * 0.17, z * 0.17, seed + 5) * HIGH_MOSS.length)) % HIGH_MOSS.length];
          else color = MOSS[Math.floor((grain * 31 + x * 0.13 + z * 0.17) % 1 * MOSS.length)];
        } else if (d < 2 && grain < 0.72) {
          color = SOILS[Math.floor((noise2(x * 0.24, z * 0.24, seed + 6) * SOILS.length)) % SOILS.length];
        } else if (d < 4 && !steep) {
          color = SOILS[Math.floor(noise2(x * 0.18, z * 0.18, seed + 7) * SOILS.length) % SOILS.length];
        } else {
          const bandIndex = Math.floor((y + strataNoise * 9 + 2000) / 7.5) % STONE_BANDS.length;
          const band = STONE_BANDS[bandIndex];
          const pick = Math.floor(noise2(x * 0.09 + y * 0.13, z * 0.09, seed + 9) * band.length) % band.length;
          color = band[pick];
          if (y < 16) color = C.deepRock;
          if (grain > 0.88 && y > 15) color = C.rockWarm;
          if (h > 69 && y > h - 7) color = grain > 0.5 ? C.rockPale : C.rock4;
        }
        if (d < 2 && steep && noise2(x * 0.27, z * 0.27, seed + 11) > 0.79) {
          color = C.moss2;
        }
        if (d === 0 && steep && grain > 0.76) color = C.moss1;
        if (y < 3) color = C.deepRock;
        vol.set(x, y, z, color, kind, 0.055);
      }
      if (h > 0 && grain > 0.82 && slope < 3) {
        vol.set(x, h + 1, z, grain > 0.93 ? C.moss4 : C.moss3, 0, 0.08);
      }
    }
  }
}
