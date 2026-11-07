// Autumn mountain valley: two tunnel hills, a station saddle, and a river gorge
// spanned by the viaduct. The whole mass sits on a cut geological base.

import { M } from '../core/palette.js';
import { fbm2, ridged2, hash2, hash3, clamp, lerp, smoothstep, mulberry32 } from '../core/rng.js';
import {
  NX, NY, NZ, PLATEAU_Y, LEFT_PORTAL, RIGHT_PORTAL,
  GORGE_X0, GORGE_X1, GORGE_CX, RIVER_BED, RIVER_Y,
  TRACK_Y, TRACK_Z,
} from './layout.js';

export function portalFaceX(z, side) {
  const n = (fbm2(z * 0.08, side === 'L' ? 7.7 : 13.3, 3) - 0.5) * 8;
  return Math.round((side === 'L' ? LEFT_PORTAL : RIGHT_PORTAL) + n);
}

export function computeHeightField() {
  const hf = new Int16Array(NX * NZ);
  for (let z = 0; z < NZ; z++) {
    for (let x = 0; x < NX; x++) {
      let h = PLATEAU_Y + (fbm2(x * 0.02, z * 0.02, 4) - 0.5) * 7;

      const hl = smoothstep(LEFT_PORTAL, 26, x);
      const hr = smoothstep(RIGHT_PORTAL, NX - 26, x);
      const ridge = ridged2(x * 0.015 + 11, z * 0.02 + 5, 4);
      h += hl * hl * (30 + ridge * 22);
      h += hr * hr * (28 + ridge * 24);

      const ez = Math.min(z, NZ - 1 - z);
      const edge = smoothstep(64, 4, ez);
      h += edge * edge * 11 * (0.55 + 0.45 * fbm2(x * 0.03 + 40, z * 0.03, 3));

      // tunnel mountains: a high ridge with an irregular cliff face at each portal
      const dzc = Math.abs(z - 100);
      const moundT = smoothstep(92, 30, dzc);
      const mound = moundT * moundT * (118 + ridged2(x * 0.03 + 31, z * 0.03, 3) * 8);
      if (x <= portalFaceX(z, 'L')) h = Math.max(h, mound);
      if (x >= portalFaceX(z, 'R')) h = Math.max(h, mound);

      const dL = x - GORGE_X0;
      const dR = GORGE_X1 - x;
      const d = Math.min(dL, dR);
      if (d >= 0) {
        const t = smoothstep(0, 34, d);
        const floor = RIVER_BED + 2 + (fbm2(x * 0.05, z * 0.05, 3) - 0.5) * 3;
        h = lerp(h, floor, t);
        h += (ridged2(x * 0.08 + 3, z * 0.08, 3) - 0.5) * 22 * t * (1 - t);
        const cx = GORGE_CX + Math.sin(z * 0.045) * 9 + (fbm2(z * 0.03, 3.7, 3) - 0.5) * 8;
        const dc = Math.abs(x - cx);
        if (dc < 13) h = Math.min(h, RIVER_BED - 2 + smoothstep(4, 13, dc) * 5);
      }
      hf[z * NX + x] = Math.round(clamp(h, 5, NY - 8));
    }
  }
  return hf;
}

export const heightAt = (hf, x, z) => {
  x = clamp(x | 0, 0, NX - 1);
  z = clamp(z | 0, 0, NZ - 1);
  return hf[z * NX + x];
};

function slopeAt(hf, x, z) {
  const h = heightAt(hf, x, z);
  return Math.max(
    Math.abs(heightAt(hf, x + 1, z) - h),
    Math.abs(heightAt(hf, x - 1, z) - h),
    Math.abs(heightAt(hf, x, z + 1) - h),
    Math.abs(heightAt(hf, x, z - 1) - h),
  );
}

function strata(y, x, z) {
  const band = Math.floor((y + (hash2(x >> 4, z >> 4) - 0.5) * 3) / 9);
  return [M.STRATA_C, M.STRATA_A, M.STRATA_B, M.STRATA_A][((band % 4) + 4) % 4];
}

export function buildTerrain(world, hf) {
  const rnd = mulberry32(20261107);
  for (let z = 0; z < NZ; z++) {
    for (let x = 0; x < NX; x++) {
      const h = hf[z * NX + x];
      const slope = slopeAt(hf, x, z);
      const inGorge = x >= GORGE_X0 && x <= GORGE_X1;
      const rocky = slope >= 3 || (inGorge && h < PLATEAU_Y - 8);
      const high = h > 96;

      let top;
      if (h <= RIVER_Y + 1) top = hash2(x, z) < 0.5 ? M.SAND : M.RIVERBED;
      else if (rocky) {
        const r = hash2(x * 3 + 1, z * 3 + 7);
        top = r < 0.4 ? M.CLIFF : r < 0.72 ? M.ROCK : r < 0.9 ? M.ROCK_DARK : M.ROCK_WARM;
      } else if (high) top = hash2(x, z) < 0.55 ? M.SCREE : M.ROCK_WARM;
      else {
        const g = fbm2(x * 0.06 + 90, z * 0.06, 3);
        top = g < 0.42 ? M.GRASS_GREEN : g < 0.66 ? M.GRASS_DRY : M.GRASS_GOLD;
      }

      for (let y = 0; y <= h; y++) {
        let id;
        if (y === h) id = top;
        else if (y >= h - 2) id = rocky || high ? M.ROCK_DARK : M.DIRT;
        else id = strata(y, x, z);
        world.set(x, y, z, id);
      }

      // sparse surface detail on gentle grass
      if (!rocky && !high && h > RIVER_Y + 2 && slope <= 1) {
        const r = rnd();
        if (r < 0.02) world.set(x, h + 1, z, r < 0.004 ? M.FLOWER : r < 0.012 ? M.BUSH : M.GRASS_GOLD);
      }
    }
  }

  // scree + boulders on the gorge floor and wall feet
  for (let i = 0; i < 260; i++) {
    const x = GORGE_X0 + 8 + Math.floor(rnd() * (GORGE_X1 - GORGE_X0 - 16));
    const z = Math.floor(rnd() * NZ);
    const h = heightAt(hf, x, z);
    if (h > RIVER_Y + 6) continue;
    const r = 1 + Math.floor(rnd() * 2.4);
    world.sphere(x, h + r * 0.4, z, r, rnd() < 0.5 ? M.ROCK : M.ROCK_DARK);
  }
  // a few boulders on the plateau
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * NX);
    const z = Math.floor(rnd() * NZ);
    if (Math.abs(z - TRACK_Z) < 18) continue;
    if (x > GORGE_X0 - 6 && x < GORGE_X1 + 6) continue;
    const h = heightAt(hf, x, z);
    if (slopeAt(hf, x, z) > 1 || h > 96) continue;
    world.sphere(x, h + 0.6, z, 1 + Math.floor(rnd() * 2), rnd() < 0.5 ? M.ROCK : M.ROCK_WARM);
  }
}

// raised formation beside the saddle so the track sits on a proper embankment
export function buildEmbankment(world, hf) {
  for (let x = LEFT_PORTAL; x <= GORGE_X0; x++) {
    const g = heightAt(hf, x, TRACK_Z);
    const topY = TRACK_Y - 3;
    if (g >= topY) continue;
    const half = 8 + (topY - g) * 1.4;
    for (let z = Math.floor(TRACK_Z - half); z <= Math.ceil(TRACK_Z + half); z++) {
      const dz = Math.abs(z - TRACK_Z);
      const yTop = Math.round(topY - Math.max(0, dz - 8) / 1.4);
      const y0 = heightAt(hf, x, z);
      for (let y = y0; y <= yTop; y++) world.set(x, y, z, y >= yTop - 1 ? M.DIRT : M.ROCK_DARK);
      world.set(x, yTop, z, dz <= 8 ? M.BALLAST : M.GRASS_DRY);
    }
  }
}