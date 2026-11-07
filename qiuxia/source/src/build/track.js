// Permanent way: ballast, sleepers, rail, fishplates, guard rails on the bridge,
// plus the two tunnel bores and their masonry portals.

import { M } from '../core/palette.js';
import { hash2, hash3 } from '../core/rng.js';
import { NX, NZ, TRACK_Y, TRACK_Z, RAIL_Z, GORGE_X0, GORGE_X1, LEFT_PORTAL, RIGHT_PORTAL } from './layout.js';
import { portalFaceX } from './terrain.js';

const BORE_Z0 = 88, BORE_Z1 = 112;
const BORE_FLOOR = 72;
const BORE_WALL_TOP = 98;
const BORE_ROOF_TOP = 106;

function boreAir(z, y) {
  if (z < BORE_Z0 || z > BORE_Z1 || y < BORE_FLOOR) return false;
  if (y <= BORE_WALL_TOP) return true;
  const cz = (BORE_Z0 + BORE_Z1) / 2;
  const rz = (BORE_Z1 - BORE_Z0) / 2;
  const ry = BORE_ROOF_TOP - BORE_WALL_TOP;
  const dz = (z - cz) / rz, dy = (y - BORE_WALL_TOP) / ry;
  return dz * dz + dy * dy <= 1;
}

export function buildTunnels(world) {
  for (let z = 0; z < NZ; z++) {
    const fl = portalFaceX(z, 'L');
    const fr = portalFaceX(z, 'R');
    for (let x = 0; x < NX; x++) {
      const inL = x <= fl;
      const inR = x >= fr;
      if (!inL && !inR) continue;
      for (let y = BORE_FLOOR; y <= BORE_ROOF_TOP; y++) {
        if (!boreAir(z, y)) continue;
        world.set(x, y, z, 0);
      }
    }
  }
  // lining: one shell of masonry on the rock side of every void cell
  for (let z = BORE_Z0; z <= BORE_Z1; z++) {
    const fl = portalFaceX(z, 'L');
    const fr = portalFaceX(z, 'R');
    for (let x = 0; x < NX; x++) {
      const inL = x <= fl;
      const inR = x >= fr;
      if (!inL && !inR) continue;
      const depth = inL ? fl - x : x - fr;
      for (let y = BORE_FLOOR; y <= BORE_ROOF_TOP; y++) {
        if (world.get(x, y, z) !== 0) continue;
        for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
          const nx = x + dx, ny = y + dy, nz = z + dz;
          if (world.get(nx, ny, nz) !== 0 && !boreAir(nz, ny)) {
            world.set(nx, ny, nz, depth > 26 ? M.TUNNEL_DARK : M.TUNNEL_STONE);
          }
        }
      }
    }
  }
  // invert / floor
  for (let z = BORE_Z0; z <= BORE_Z1; z++) {
    const fl = portalFaceX(z, 'L');
    const fr = portalFaceX(z, 'R');
    for (let x = 0; x < NX; x++) {
      if (x <= fl || x >= fr) world.set(x, BORE_FLOOR - 1, z, M.TUNNEL_DARK);
    }
  }
}

export function buildPortals(world) {
  for (const side of ['L', 'R']) {
    const cx = side === 'L' ? LEFT_PORTAL : RIGHT_PORTAL;
    const x0 = cx - 4, x1 = cx + 4;
    for (let x = x0; x <= x1; x++) {
      for (let z = 76; z <= 124; z++) {
        for (let y = 60; y <= 112; y++) {
          if (boreAir(z, y)) continue;
          // arched opening relief: keep void a touch wider than bore
          const edge = Math.abs(z - 100) > 26 || y > 108;
          let id = hash3(x, y, z) < 0.14 ? M.TUNNEL_STONE : M.PORTAL_TRIM;
          if (edge) id = M.TUNNEL_STONE;
          world.set(x, y, z, id);
        }
      }
    }
    // arch ring around the opening
    for (let x = x0; x <= x1; x++)
      for (let z = 84; z <= 116; z++)
        for (let y = 96; y <= 110; y++) {
          const cz = 100, rz = 16, ry = 12;
          const dz = (z - cz) / rz, dy = (y - 98) / ry;
          const d = dz * dz + dy * dy;
          if (d <= 1 && d >= 0.62) world.set(x, y, z, M.KEYSTONE);
        }
    // coping + parapet
    for (let x = x0 - 1; x <= x1 + 1; x++)
      for (let z = 74; z <= 126; z++) world.set(x, 113, z, M.KEYSTONE);
    for (let x = x0; x <= x1; x++)
      for (const z of [75, 76, 124, 125])
        for (let y = 114; y <= 117; y++) world.set(x, y, z, M.PORTAL_TRIM);
    // wing walls splaying out from the face
    const dir = side === 'L' ? -1 : 1;
    for (let d = 1; d <= 10; d++) {
      const x = cx + dir * (4 + d);
      const spread = Math.round(d * 0.9);
      for (const zz of [76 - spread, 124 + spread]) {
        for (let y = 60; y <= 112 - d * 3; y++) world.set(x, y, zz, M.TUNNEL_STONE);
      }
    }
  }
}

export function buildTrack(world) {
  for (let x = 0; x < NX; x++) {
    const onBridge = x >= GORGE_X0 && x <= GORGE_X1;
    for (let z = 90; z <= 110; z++) {
      if (!onBridge || (z >= 90 && z <= 110)) world.set(x, 71, z, hash2(x, z) < 0.5 ? M.BALLAST : M.BALLAST_L);
    }
    if (x % 3 === 0) {
      for (let z = 92; z <= 108; z++) world.set(x, 72, z, hash2(x, z) < 0.3 ? M.SLEEPER_D : M.SLEEPER);
    }
    for (const rz of RAIL_Z) {
      world.set(x, 73, rz, M.RAIL);
      world.set(x, 74, rz, M.RAIL_TOP);
    }
    if (x % 30 === 0) {
      for (const rz of RAIL_Z)
        for (let z = rz - 1; z <= rz + 1; z++) world.set(x, 73, z, M.ROD_D);
    }
    if (onBridge) {
      for (const rz of [97, 103]) world.set(x, 74, rz, M.RAIL);
    }
  }
}