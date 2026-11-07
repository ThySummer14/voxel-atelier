// Lineside life: telegraph poles with sagging wires, milestones, whistle board,
// a maintenance hut, and a few voxel people on the platform.

import { M } from '../core/palette.js';
import { mulberry32 } from '../core/rng.js';
import { heightAt } from './terrain.js';

function pole(world, x, z, base) {
  const top = base + 16;
  for (let y = base; y <= top; y++) world.set(x, y, z, M.POLE);
  world.box(x - 3, top - 1, z, x + 3, top - 1, z, M.POLE);
  world.box(x - 2, top - 4, z, x + 2, top - 4, z, M.POLE);
  for (const dx of [-3, -1, 1, 3]) world.set(x + dx, top, z, M.INSULATOR);
  for (const dx of [-2, 0, 2]) world.set(x + dx, top - 3, z, M.INSULATOR);
  return top;
}

function wire(world, x0, y0, x1, y1, z) {
  const n = Math.abs(x1 - x0);
  const sag = 2 + n * 0.06;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = Math.round(y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * sag);
    world.set(x0 + Math.round((x1 - x0) * t), y, z, M.WIRE);
  }
}

function person(world, x, z, y, coat, hat, opts = {}) {
  for (let dy = 0; dy <= 2; dy++) { world.set(x, y + dy, z, M.WOOD_D); world.set(x + 1, y + dy, z, M.WOOD_D); }
  for (let dy = 3; dy <= 6; dy++) { world.set(x, y + dy, z, coat); world.set(x + 1, y + dy, z, coat); }
  if (opts.wave) {
    world.line(x + 2, y + 6, z, x + 3, y + 9, z, coat);
    world.set(x - 1, y + 4, z, coat); world.set(x - 1, y + 5, z, coat);
  } else {
    world.set(x - 1, y + 4, z, coat); world.set(x - 1, y + 5, z, coat);
    world.set(x + 2, y + 4, z, coat); world.set(x + 2, y + 5, z, coat);
  }
  for (let dy = 7; dy <= 8; dy++) { world.set(x, y + dy, z, M.PLASTER); world.set(x + 1, y + dy, z, M.PLASTER); }
  world.set(x, y + 9, z, hat); world.set(x + 1, y + 9, z, hat);
  if (opts.basket) world.box(x + 3, y + 1, z, x + 4, y + 3, z + 1, M.WOOD);
}

export function buildDetails(world, hf) {
  const rnd = mulberry32(3131);
  const zs = 84;
  const xs = [164, 190, 216, 242];
  const tops = [];
  for (const x of xs) tops.push(pole(world, x, zs, heightAt(hf, x, zs) + 1));
  for (let i = 0; i < tops.length - 1; i++) {
    for (const [dy, dz] of [[0, 0], [-3, 0]]) {
      wire(world, xs[i] - 3 + (dy === -3 ? 1 : 0), tops[i] + dy, xs[i + 1] - 3 + (dy === -3 ? 1 : 0), tops[i + 1] + dy, zs);
    }
  }
  // drop into the left portal
  wire(world, 160, tops[0] - 2, xs[0] - 3, tops[0], zs);

  // milestone + whistle board
  world.box(170, 72, 90, 171, 74, 90, M.PLATFORM_E);
  world.set(170, 75, 90, M.SIGN_TEXT);
  world.box(152, 72, 90, 152, 78, 90, M.POLE);
  world.box(151, 78, 89, 153, 80, 91, M.SIGN_BOARD);

  // maintenance hut on the saddle
  const hx = 150, hz = 74;
  const g = heightAt(hf, hx, hz);
  world.box(hx, g, hz, hx + 8, g + 6, hz + 6, M.WOOD);
  world.box(hx + 1, g + 1, hz + 1, hx + 7, g + 5, hz + 5, 0);
  world.box(hx + 3, g + 1, hz, hx + 5, g + 4, hz, M.WOOD_D);
  for (let x = hx - 1; x <= hx + 9; x++)
    for (let z = hz - 1; z <= hz + 7; z++) {
      const t = Math.abs(z - (hz + 3)) / 4;
      world.set(x, g + 8 - Math.round(t * 2), z, M.ROOF_D);
    }

  // people
  person(world, 196, 116, 77, M.SIGN_BOARD, M.LOCO_RED, { wave: true });   // station staff
  person(world, 208, 118, 77, M.LEAF_RUST, M.WOOD_D, { basket: true });    // passenger
  person(world, 222, 114, 77, M.TENDER, M.WOOD_D);                        // waiting traveller
  person(world, 236, 92, 72, M.LEAF_ORANGE, M.PLATFORM_L);                // platelayer
}