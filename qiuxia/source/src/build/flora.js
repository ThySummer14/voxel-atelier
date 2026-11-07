// Autumn flora: conifers, gold/orange/red broadleaf, birch, undergrowth, leaf litter.

import { M } from '../core/palette.js';
import { mulberry32, fbm2, hash2 } from '../core/rng.js';
import { NX, NZ, TRACK_Z, GORGE_X0, GORGE_X1 } from './layout.js';
import { heightAt, portalFaceX } from './terrain.js';

const LEAVES = [M.LEAF_GOLD, M.LEAF_ORANGE, M.LEAF_RED, M.LEAF_RUST, M.LEAF_YELLOW];

function pine(world, x, z, h, rnd) {
  const th = 6 + Math.floor(rnd() * 5);
  for (let y = h; y < h + th; y++) world.set(x, y, z, y % 3 === 0 ? M.TRUNK_D : M.TRUNK);
  let r = 3.6 + rnd() * 1.6;
  let y = h + th - 1;
  const tiers = 4 + Math.floor(rnd() * 2);
  for (let t = 0; t < tiers; t++) {
    const rr = r * (1 - t / (tiers + 0.6));
    const lh = 2;
    for (let dy = 0; dy < lh; dy++)
      for (let dz = -Math.ceil(rr); dz <= Math.ceil(rr); dz++)
        for (let dx = -Math.ceil(rr); dx <= Math.ceil(rr); dx++) {
          const d = Math.hypot(dx, dz);
          if (d <= rr - dy * 0.5 && rnd() < 0.94) {
            const c = d > rr - 1.4 ? M.PINE_T : rnd() < 0.4 ? M.PINE_D : M.PINE;
            world.set(x + dx, y + dy, z + dz, c);
          }
        }
    y += 2;
  }
  world.set(x, y, z, M.PINE_T);
  world.set(x, y + 1, z, M.PINE_T);
}

function broadleaf(world, x, z, h, rnd, color) {
  const th = 5 + Math.floor(rnd() * 4);
  const lean = rnd() < 0.5 ? 1 : -1;
  for (let y = h; y < h + th; y++) {
    world.set(x, y, z, M.TRUNK);
    if (y > h + 2 && rnd() < 0.4) world.set(x + lean, y, z, M.TRUNK_D);
  }
  const cx = x + lean, cy = h + th + 1, cz = z;
  world.line(x, h + th - 2, z, cx - 2, cy, cz - 1, M.TRUNK_D);
  world.line(x, h + th - 1, z, cx + 2, cy, cz + 1, M.TRUNK_D);
  const r = 3.4 + rnd() * 2.2;
  const second = LEAVES[(LEAVES.indexOf(color) + 1 + Math.floor(rnd() * 2)) % LEAVES.length];
  for (let dz = -Math.ceil(r); dz <= Math.ceil(r); dz++)
    for (let dy = -Math.ceil(r * 0.8); dy <= Math.ceil(r * 0.8); dy++)
      for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
        const d = Math.hypot(dx, dy * 1.25, dz);
        if (d <= r && rnd() < 0.9) {
          const c = rnd() < 0.28 ? second : rnd() < 0.12 ? M.LEAF_YELLOW : color;
          world.set(cx + dx, cy + dy, cz + dz, c);
        }
      }
  // leaf litter
  const n = 6 + Math.floor(rnd() * 10);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = 1 + rnd() * (r + 2);
    const lx = Math.round(x + Math.cos(a) * d), lz = Math.round(z + Math.sin(a) * d);
    const lh = heightAt(worldHf, lx, lz);
    if (world.get(lx, lh, lz) !== 0 && world.get(lx, lh + 1, lz) === 0) world.set(lx, lh + 1, lz, color);
  }
}

function birch(world, x, z, h, rnd) {
  const th = 7 + Math.floor(rnd() * 4);
  for (let y = h; y < h + th; y++) world.set(x, y, z, rnd() < 0.22 ? M.BIRCH_MARK : M.BIRCH);
  const r = 2.4 + rnd() * 1.4;
  const cy = h + th;
  for (let dz = -3; dz <= 3; dz++)
    for (let dy = -2; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.hypot(dx, dy * 1.2, dz) <= r && rnd() < 0.85)
          world.set(x + dx, cy + dy, z + dz, rnd() < 0.7 ? M.LEAF_YELLOW : M.LEAF_GOLD);
      }
}

let worldHf = null;

export function buildFlora(world, hf) {
  worldHf = hf;
  const rnd = mulberry32(4242);
  let placed = 0;
  for (let i = 0; i < 2600 && placed < 250; i++) {
    const x = 4 + Math.floor(rnd() * (NX - 8));
    const z = 4 + Math.floor(rnd() * (NZ - 8));
    if (Math.abs(z - TRACK_Z) < 17) continue;
    if (x > GORGE_X0 - 4 && x < GORGE_X1 + 4) continue;
    if (x > 168 && x < 246 && z > 104 && z < 162) continue;   // station yard
    const h = heightAt(hf, x, z);
    if (h <= 30) continue;
    const slope = Math.max(
      Math.abs(heightAt(hf, x + 1, z) - h), Math.abs(heightAt(hf, x - 1, z) - h),
      Math.abs(heightAt(hf, x, z + 1) - h), Math.abs(heightAt(hf, x, z - 1) - h));
    if (slope > 2) continue;
    const grove = fbm2(x * 0.035 + 5, z * 0.035 + 9, 3);
    if (grove < 0.46 && rnd() < 0.8) continue;
    if (world.get(x, h + 1, z) !== 0) continue;
    const kind = rnd();
    if (h > 92 || kind < 0.42) pine(world, x, z, h + 1, rnd);
    else if (kind < 0.86) broadleaf(world, x, z, h + 1, rnd, LEAVES[Math.floor(rnd() * LEAVES.length)]);
    else birch(world, x, z, h + 1, rnd);
    placed++;
  }
  // undergrowth + rocks along the formation and platform back
  for (let i = 0; i < 420; i++) {
    const x = Math.floor(rnd() * NX);
    const z = Math.floor(rnd() * NZ);
    if (Math.abs(z - TRACK_Z) < 12) continue;
    if (x > GORGE_X0 && x < GORGE_X1) continue;
    const h = heightAt(hf, x, z);
    if (h <= 30 || world.get(x, h + 1, z) !== 0) continue;
    const r = rnd();
    if (r < 0.5) world.sphere(x, h + 1, z, 1, r < 0.2 ? M.LEAF_RUST : M.BUSH);
    else if (r < 0.7) world.set(x, h + 1, z, M.GRASS_GOLD);
  }
  // framing trees at the gorge lips and station
  const spots = [[240, 78], [246, 128], [378, 70], [382, 132], [172, 140], [238, 142], [200, 168], [150, 60], [150, 146]];
  for (const [x, z] of spots) {
    const h = heightAt(hf, x, z);
    if (h <= 30) continue;
    if (rnd() < 0.5) pine(world, x, z, h + 1, rnd);
    else broadleaf(world, x, z, h + 1, rnd, LEAVES[Math.floor(rnd() * LEAVES.length)]);
  }
}