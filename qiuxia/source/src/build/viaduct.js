// Three-span masonry arch viaduct carrying the line across the gorge.
// The river passes under the middle span.

import { M } from '../core/palette.js';
import { hash2, hash3 } from '../core/rng.js';
import { GORGE_X0, GORGE_X1, TRACK_Z, RIVER_Y } from './layout.js';

const Z0 = 86, Z1 = 114;              // deck width
const DECK_TOP = 70;                  // deck slab top voxel
const SPRING = 40;                    // arch springing line
const PIER_BED = 24;

const SPANS = [
  { x0: 254, x1: 287 },
  { x0: 296, x1: 329 },
  { x0: 338, x1: 371 },
];
const PIERS = [
  { x0: 288, x1: 295 },
  { x0: 330, x1: 337 },
];

export function buildViaduct(world) {
  const inSpan = (x) => SPANS.find((s) => x >= s.x0 && x <= s.x1);

  for (let x = GORGE_X0; x <= GORGE_X1; x++) {
    const span = inSpan(x);
    for (let z = Z0; z <= Z1; z++) {
      if (span) {
        const cx = (span.x0 + span.x1) / 2;
        const r = (span.x1 - span.x0 + 1) / 2;
        const dx = x - cx;
        const intrados = SPRING + Math.sqrt(Math.max(0, r * r - dx * dx));
        const yStart = Math.floor(intrados) - 2;
        for (let y = yStart; y <= DECK_TOP; y++) {
          const ring = y < intrados;
          let id = ring ? (hash2(x, z) < 0.25 ? M.KEYSTONE : M.BRIDGE_D) : M.BRIDGE;
          if (!ring && y > DECK_TOP - 3) id = M.BRIDGE_D;
          if (!ring && hash3(x, y, z) < 0.05) id = M.BRIDGE_D;
          world.set(x, y, z, id);
        }
      } else {
        for (let y = PIER_BED; y <= DECK_TOP; y++) {
          let id = y < SPRING ? M.BRIDGE_D : M.BRIDGE;
          if (hash3(x, y, z) < 0.06) id = M.BRIDGE_D;
          if (y <= RIVER_Y + 2 && hash2(x, z) < 0.4) id = M.MOSS;
          world.set(x, y, z, id);
        }
      }
    }
  }

  // pier cutwaters (pointed prows in plan, tapering with height)
  for (const p of PIERS) {
    const cx = (p.x0 + p.x1) / 2;
    const half = (p.x1 - p.x0) / 2;
    for (let d = 1; d <= 4; d++) {
      const hd = Math.max(1, half - d);
      const yTop = SPRING - d * 3;
      for (let y = PIER_BED; y <= yTop; y++) {
        for (let x = Math.round(cx - hd); x <= Math.round(cx + hd); x++) {
          world.set(x, y, Z0 - d, M.BRIDGE_D);
          world.set(x, y, Z1 + d, M.BRIDGE_D);
        }
      }
    }
  }

  // projecting string course
  for (let x = GORGE_X0; x <= GORGE_X1; x++)
    for (let z = Z0 - 1; z <= Z1 + 1; z++) {
      world.set(x, 66, z, M.KEYSTONE);
      world.set(x, 67, z, M.BRIDGE_D);
    }

  // deck slab + ballast shoulder
  for (let x = GORGE_X0; x <= GORGE_X1; x++)
    for (let z = Z0; z <= Z1; z++) {
      world.set(x, DECK_TOP, z, M.BRIDGE_D);
      if (z >= 90 && z <= 110) world.set(x, 71, z, hash2(x, z) < 0.5 ? M.BALLAST : M.BALLAST_L);
    }

  // parapets with coping + refuge alcoves
  for (let x = GORGE_X0; x <= GORGE_X1; x++) {
    for (const [a, b] of [[Z0, Z0 + 2], [Z1 - 2, Z1]]) {
      for (let z = a; z <= b; z++)
        for (let y = 72; y <= 77; y++)
          world.set(x, y, z, hash3(x, y, z) < 0.12 ? M.BRIDGE_D : M.BRIDGE);
    }
    for (const [a, b] of [[Z0 - 1, Z0 + 3], [Z1 - 3, Z1 + 1]]) {
      for (let z = a; z <= b; z++) world.set(x, 78, z, M.KEYSTONE);
    }
    if ((x - GORGE_X0) % 22 === 11) {
      for (let y = 72; y <= 76; y++) {
        world.set(x, y, Z0 + 2, 0);
        world.set(x, y, Z1 - 2, 0);
      }
    }
  }

  // abutment wing walls tying into the lips
  for (const [xa, xb] of [[GORGE_X0 - 6, GORGE_X0], [GORGE_X1, GORGE_X1 + 6]]) {
    for (let x = xa; x <= xb; x++)
      for (let z = Z0 - 4; z <= Z1 + 4; z++)
        for (let y = 40; y <= DECK_TOP; y++) world.set(x, y, z, M.BRIDGE_D);
  }
}