import { hash, material as M, Volume } from './voxels.mjs';

const between = (a, b, f) => a + (b - a) * f;

export function dish(vox, center, normal, radius, surface = M.alloy, shallow = .35) {
  const length = Math.hypot(...normal);
  const n = normal.map(v => v / length);
  const r = Math.ceil(radius) + 2;
  for (let z = -r; z <= r; z++) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const depth = x * n[0] + y * n[1] + z * n[2];
        const radial = Math.sqrt(Math.max(0, x*x + y*y + z*z - depth*depth));
        if (radial > radius || Math.abs(depth - shallow * radial * radial / radius) > .64) continue;
        const color = radial > radius - .9 ? M.white : surface;
        vox.set(center[0] + x, center[1] + y, center[2] + z, color);
      }
    }
  }
  const feed = center.map((v, i) => v + n[i] * radius * (shallow + .4));
  vox.rod(center, feed, M.graphite);
  const [x, y, z] = feed.map(Math.round);
  vox.box(x, y, z, x + 1, y + 1, z + 1, M.paleGold);
}

function descentStage(vox) {
  // An octagonal equipment deck with different insulation blankets in each bay.
  for (let y = 11; y <= 30; y++) {
    const r = y === 11 ? 20 : y >= 28 ? 24 : 23;
    for (let z = -r; z <= r; z++) {
      for (let x = -r; x <= r; x++) {
        if (Math.abs(x) + Math.abs(z) > r + 12) continue;
        const folds = Math.sin((x + z) * .88 + y * .73) * .24 +
          Math.sin((x - z) * .64 - y * 1.26) * .17;
        const v = Math.max(0, Math.min(1, .5 + folds + (hash(x, y, z) - .5) * .32));
        const gold = x > 13 && z < -4 ? M.paleGold : M.gold;
        let color = gold[Math.min(gold.length - 1, Math.floor(v * gold.length))];
        if (y >= 27) color = y === 29 ? M.rib : M.graphite;
        if (y < 14 && Math.abs(x) + Math.abs(z) < 25) color = M.dark;
        if (z > 5 && x < -18 && y < 24) color = M.dark;
        vox.set(x, y, z, color);
      }
    }
  }

  for (const x of [-14, 0, 14]) {
    vox.rod([x, 13, 24], [x, 27, 24], M.paleGold[3]);
    for (const y of [14, 25]) vox.set(x, y, 25, M.alloy[3]);
  }
  for (const z of [-15, 0, 15]) {
    vox.rod([24, 14, z], [24, 27, z], M.gold[0]);
  }
  vox.box(24, 16, -8, 25, 25, 5, M.graphite);
  vox.box(26, 17, -7, 26, 23, 4, M.paleGold[4]);
  for (let z = -6; z <= 3; z += 3) vox.rod([27, 18, z], [27, 22, z], M.copper[0]);
  vox.box(25, 22, 8, 27, 25, 12, M.alloy);
  // Thin mission placard, heat blanket overlap and exposed corner fittings.
  vox.box(25, 16, 8, 25, 22, 18, M.white[0]);
  for (let y = 17; y <= 21; y++) {
    for (let z = 9; z <= 17; z++) {
      const color = z >= 14 && y >= 19 ? M.blue[0] : y % 2 ? M.red[0] : M.white[3];
      vox.set(26, y, z, color);
    }
  }
  for (const z of [8,18]) {
    vox.set(26, 16, z, M.alloy[2]);
    vox.set(26, 22, z, M.alloy[2]);
  }

  // Bell skirt, cooling ribs and the hollow, dark exhaust throat.
  for (let y = 3; y <= 15; y++) {
    const r = 3 + (15 - y) * .4;
    vox.ellipsoid(0, y, 0, r, .4, r, y % 3 === 0 ? M.graphite : M.obsidian,
      (x, _, z) => y > 11 || Math.hypot(x, z) > r - 2.2);
  }
}

function landingGear(vox) {
  for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const axis = (r, y, side = 0) => [r * dx + side * dz, y, r * dz - side * dx];
    const [x, y, z] = axis(47, 1);
    vox.ellipsoid(x, y, z, 7.7, 1.35, 7.7, M.paleGold);
    vox.ellipsoid(x, y + 1, z, 6, 1.4, 6, M.gold);
    vox.ellipsoid(x, y + 2, z, 3, 2, 3, M.graphite);
    vox.rod(axis(23, 27, -1), axis(46, 2, -1), M.gold, 3);
    vox.rod(axis(25, 23, -1), axis(37, 10, -1), M.paleGold[2], 3);
    vox.rod(axis(38, 10), axis(46, 3), M.alloy[2], 2);
    for (const s of [-1, 1]) {
      vox.rod(axis(22, 16, 11 * s), axis(36, 13, s), M.rib, 2);
      vox.rod(axis(25, 26, 10 * s), axis(35, 15, s), M.alloy[1]);
      vox.rod(axis(23, 24, 8 * s), axis(23, 15, 11 * s), M.graphite, 2);
      const [jx, jy, jz] = axis(24, 25, 5 * s);
      vox.box(jx-1, jy, jz-1, jx+1, jy+2, jz+1, M.alloy);
    }
    const [jx, jy, jz] = axis(35, 14);
    vox.ellipsoid(jx, jy, jz, 2, 2, 2, M.alloy);
  }

  for (const x of [-3, 3]) {
    vox.rod([x, 32, 25], [x, 5, 45], M.alloy[3]);
    vox.rod([x, 30, 24], [x, 5, 44], M.rib[0]);
  }
  for (let y = 7; y < 33; y += 3) {
    const z = Math.round(between(45, 25, (y - 5) / 27));
    vox.rod([-3, y, z + 1], [3, y, z + 1], M.alloy[3]);
  }
  vox.box(-6, 31, 20, 6, 32, 27, M.graphite);
  for (const x of [-6, 6]) {
    vox.rod([x, 33, 26], [x, 37, 24], M.alloy[3]);
    vox.rod([x, 37, 24], [x, 38, 20], M.alloy[3]);
  }
}

function cabin(vox) {
  // Hull sections step from the hatch apron into the canted cockpit and roof.
  for (let y = 31; y <= 62; y++) {
    const w = y < 38 ? 17 : y < 52 ? 20 : y < 57 ? 19 : 18 - (y - 57);
    const aft = -18 + Math.max(0, y - 55);
    const nose = y < 38 ? 15 + (y - 31) : y < 52 ? 20 : 21 - (y - 52);
    for (let z = aft; z <= nose; z++) {
      for (let x = -w; x <= w; x++) {
        const wing = Math.abs(x);
        if (wing + z > w + nose - 6 || wing - z > w - aft - 4) continue;
        let color = y < 34 ? M.dark : M.alloy[0];
        if (z < 4) color = y > 55 ? M.rib[1] : M.graphite[1];
        if (z >= 4 && wing < 6) color = z >= 17 ? M.alloy[3] : M.alloy[0];
        if (wing + z > w + nose - 9) color = x < 0 ? M.alloy[1] : M.alloy[2];
        if (y > 53 && z > 4) color = y % 5 === 0 ? M.rib[1] : M.alloy[1];
        if (wing > 13 && y < 45) color = M.graphite[0];
        if (hash(x, y, z) < .047 && y > 34) color = M.alloy[2];
        vox.set(x, y, z, color);
      }
    }
  }

  // Faceted front panels are built around two triangular observation windows.
  for (const side of [-1, 1]) {
    for (let y = 41; y <= 55; y++) {
      for (let u = 2; u <= 20; u++) {
        if (y < 39 + u * .39 || y > 55 - Math.max(0, u - 14) * .48) continue;
        const z = 24 - Math.floor(u * .40) - Math.max(0, y - 51);
        const window = u >= 5 && u <= 17 && y >= 43 + (u - 5) * .66 && y <= 52;
        const gasket = u >= 4 && u <= 18 && y >= 42 + (u - 5) * .66 && y <= 53;
        const glazing = y === 52 ? M.glass[3] : (u + y) % 7 === 0 ? M.glass[2] : M.glass[0];
        const panel = y < 45 || u % 8 === 0 ? M.rib[1] : M.alloy[1];
        const color = window ? glazing : gasket ? M.dark[0] : panel;
        vox.box(u * side, y, z - 5, u * side, y, z, panel);
        vox.set(u * side, y, z + 1, color);
        if (!gasket && (u === 3 || u === 18 || y === 54)) vox.set(u * side, y, z + 2, M.alloy[3]);
      }
    }
  }
  vox.box(-6, 34, 19, 6, 42, 22, M.graphite[3]);
  vox.box(-5, 35, 23, 5, 41, 23, M.alloy[2]);
  vox.box(-4, 35, 24, 4, 40, 24, M.graphite[2]);
  vox.box(2, 38, 25, 4, 39, 25, M.alloy[3]);
  vox.box(-2, 43, 24, 2, 52, 25, M.alloy[1]);
  vox.rod([0, 44, 26], [0, 51, 26], M.dark);
  vox.set(0, 51, 27, M.white[3]);

  // Aft equipment house, external wiring, heat shields and four RCS quads.
  vox.box(-14, 34, -24, 13, 52, -13, M.graphite[3]);
  vox.box(-10, 37, -26, 10, 50, -24, M.alloy[2]);
  for (let x = -9; x < 11; x += 3) vox.rod([x, 38, -27], [x, 49, -27], M.rib);
  vox.box(15, 36, -15, 20, 50, 2, M.dark[1]);
  vox.box(21, 38, -12, 21, 48, -2, M.alloy[0]);
  vox.box(-21, 41, -13, -16, 54, 1, M.graphite);
  vox.box(-22, 44, -12, -22, 50, -3, M.paleGold[3]);
  for (let y = 38; y < 53; y += 4) {
    vox.set(22, y, -12, M.white[1]);
    vox.set(22, y, -3, M.white[1]);
  }
  for (let z = -11; z <= -3; z += 2) vox.rod([22, 40, z], [22, 46, z], M.rib[1]);
  vox.box(22, 40, -11, 22, 40, -3, M.graphite[0]);
  vox.box(22, 47, -11, 22, 47, -3, M.alloy[1]);
  vox.rod([22, 37, -7], [22, 40, 5], M.copper[2]);
  vox.rod([21, 40, 5], [16, 47, 11], M.copper[2]);

  for (const [dx, dz] of [[1,1],[-1,1],[-1,-1],[1,-1]]) {
    const x = dx * 22;
    const z = dz * 15;
    const y = dz === 1 ? 46 : 49;
    vox.rod([dx * 16, y - 4, dz * 10], [x, y, z], M.dark, 3);
    vox.box(x - 2, y - 2, z - 2, x + 2, y + 2, z + 2, M.alloy[2]);
    for (const k of [-1, 1]) {
      vox.box(x - 1, y + 3 * k, z - 1, x + 1, y + 3 * k, z + 1, M.graphite[1]);
      vox.box(x - 2, y + 4 * k, z - 2, x + 2, y + 4 * k, z + 2, M.dark[0]);
      vox.set(x, y + 4 * k, z, M.obsidian[0]);
    }
    vox.box(x + 3 * dx, y - 1, z - 1, x + 3 * dx, y + 1, z + 1, M.rib[1]);
    vox.box(x + 4 * dx, y - 2, z - 2, x + 4 * dx, y + 2, z + 2, M.dark[0]);
    vox.box(x - 1, y - 1, z + 3 * dz, x + 1, y + 1, z + 3 * dz, M.rib[1]);
    vox.box(x - 2, y - 2, z + 4 * dz, x + 2, y + 2, z + 4 * dz, M.dark[0]);
  }

  for (let y = 61; y <= 65; y++) {
    vox.ellipsoid(0, y, -1, y < 64 ? 9 : 7, .5, y < 64 ? 9 : 7,
      y === 63 ? M.graphite : M.alloy);
  }
  vox.ellipsoid(0, 66, -1, 5.5, .5, 5.5, M.dark);
  vox.box(-12, 60, 2, -7, 63, 9, M.alloy[2]);
  vox.rod([-10, 61, 6], [-13, 69, 8], M.rib, 2);
  dish(vox, [-13, 69, 8], [-.44, .72, .65], 7, M.alloy);
  vox.rod([13, 59, -9], [17, 70, -11], M.alloy[3], 2);
  dish(vox, [17, 70, -11], [.74,.62,-.15], 5, M.paleGold);
  vox.rod([-8, 60, -12], [-10, 79, -14], M.alloy[3]);
  vox.rod([8, 57, 13], [11, 68, 16], M.rib[1]);
  vox.rod([7, 67, 15], [14, 69, 17], M.alloy[3]);
}

export function buildLander() {
  const vox = new Volume([116, 84, 116], [-58, 0, -58]);
  descentStage(vox);
  landingGear(vox);
  cabin(vox);
  return vox;
}
