import { hash, material as M, noise, Volume } from './voxels.mjs';

const craters = [
  [60, -39, 27, 22, 9.5, 2.5], [-64, 34, 19, 16, 5.5, 2.2],
  [6, 60, 12, 9, 2.8, 1.3], [70, 43, 11, 8, 3.3, 1.3],
  [-77, -38, 15, 12, 4.1, 1.6], [12, -53, 8, 7, 2.2, 1.1],
  [90, -11, 7, 6, 2.1, 1.1], [-28, 63, 7, 6, 1.9, 1],
  [-53, -55, 8, 6, 2.2, 1.2], [85, -57, 9, 7, 2.6, 1.2],
];
const falloff = (x, z, cx, cz, sx, sz) => Math.exp(-(((x - cx) / sx) ** 2 + ((z - cz) / sz) ** 2));
const smooth = (a, b, v) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function surface(x, z) {
  const waves = (noise(x / 26, z / 25) - .5) * 4.7 +
    (noise(x / 9.3, z / 9.3) - .5) * 1.65 +
    (noise(x / 3.7, z / 3.7) - .5) * .76;
  const rear = 12 * falloff(x, z, -55, -75, 36, 26) +
    10 * falloff(x, z, 58, -83, 50, 21) + 5 * falloff(x, z, 78, 51, 22, 25);
  let height = waves + rear;
  let rim = 0;
  for (const [cx, cz, rx, rz, depth, lip] of craters) {
    const d = Math.hypot((x - cx) / rx, (z - cz) / rz) +
      .13 * (noise(x / 6.7, z / 6.7) - .5);
    height -= depth * (1 - smooth(.23, .99, d));
    const ridge = lip * Math.exp(-(((d - .96) / .18) ** 2));
    height += ridge;
    rim = Math.max(rim, ridge / lip);
  }
  // Four landing pads and the rover sit on locally level patches.
  const craft = 1 - smooth(33, 57, Math.hypot(x + 25, z + 15));
  const rover = 1 - smooth(17, 28, Math.hypot(x - 38, z - 20));
  height *= (1 - craft * .92) * (1 - rover * .84);
  return [Math.round(height), rim];
}

const outline = [[-103,-42],[-79,-76],[-35,-86],[32,-82],[82,-72],[102,-41],
  [105,15],[88,54],[55,75],[-22,77],[-79,64],[-101,41]];

export function inside(x, z) {
  for (let i = 0; i < outline.length; i++) {
    const [ax, az] = outline[i];
    const [bx, bz] = outline[(i + 1) % outline.length];
    if ((bx - ax) * (z - az) - (bz - az) * (x - ax) < 0) return false;
  }
  return true;
}

function trackX(z) {
  return 43 + 18 * Math.sin((z - 17) * .036) - 9 * Math.sin((z - 13) * .073);
}

function tread(x, z) {
  if (z < 23 || z > 77) return false;
  const d = Math.abs(Math.abs(x - trackX(z)) - 8.7);
  return d < 1.2 || (d < 1.9 && (z + Math.round(d * 2)) % 4 < 2);
}

const bootRoute = [[-29,23],[-25,29],[-20,35],[-15,40],[-9,44],
  [-3,46],[4,46],[10,45],[17,41],[23,37],[30,34]];
const bootMarks = new Set();
for (const [i, [x, z]] of bootRoute.entries()) {
  for (let k = -1; k <= 2; k++) {
    bootMarks.add((x + k) + ',' + (z + (i % 2 ? 2 : -1)));
    if (k !== 0) bootMarks.add((x + k) + ',' + (z + (i % 2 ? 3 : 0)));
  }
}

function stratum(x, y, z) {
  const n = noise(x / 16, z / 18) * 3.1 + Math.sin((x + z) / 16) * 1.7;
  const depth = y + n;
  if (depth > -2) return M.layer1;
  if (depth > -6) return M.layer2;
  if (depth > -8) return hash(x, 41, z) < .82 ? M.ochre : M.layer3;
  if (depth > -13) return M.layer3;
  if (depth > -14 && noise(x / 12, z / 12) > .32) return M.ochre;
  return M.layer4;
}

function boulder(vox, x0, z0, rx, ry, rz, seed, split = false) {
  const cy = surface(x0, z0)[0] + ry * .21;
  for (let z = z0 - rz - 2; z <= z0 + rz + 2; z++) {
    for (let y = Math.floor(cy - ry * .65); y <= cy + ry + 2; y++) {
      for (let x = x0 - rx - 2; x <= x0 + rx + 2; x++) {
        const xx = x - x0;
        const zz = z - z0;
        const yy = y - cy;
        const taper = Math.max(.53, 1 - yy / (ry * 3));
        const distance = (Math.abs((xx + zz * .18 + yy * .27) / rx) ** 2 +
          Math.abs(zz / rz) ** 2) / taper + Math.max(0, yy / ry) ** 2;
        const fracture = Math.abs(xx - zz * .32 - yy * .18);
        if (distance > .76 + .48 * noise(x / 3.9 + seed, z / 4.6 + y / 8)) continue;
        if (split && fracture < .78 && yy > -1) continue;
        const vein = (y + Math.floor(x * .2) + Math.floor(z * .16)) % 8;
        const index = Math.min(5, Math.floor(hash(x >> 1, y >> 1, z >> 1) * 4) +
          (vein === 2 ? 1 : 0));
        vox.set(x, y, z, M.rock[index]);
      }
    }
  }
}

export function buildTerrain() {
  const vox = new Volume();
  for (let z = -88; z <= 80; z++) {
    for (let x = -108; x <= 108; x++) {
      if (!inside(x + 3 * (noise(z / 10, x / 25) - .5), z)) continue;
      const [height, rim] = surface(x, z);
      for (let y = -19; y <= height; y++) {
        if (y !== height) {
          vox.set(x, y, z, stratum(x, y, z));
          continue;
        }
        const shade = (noise(x / 15, z / 14) * .59 + hash(x, 4, z) * .29 + noise(x / 4, z / 4) * .12);
        let color = M.dust[Math.min(3, Math.floor(shade * 4.9))];
        if (rim > .61 && shade > .46) color = M.rim;
        if (hash(x, 97, z) < .026) color = M.rock;
        if (tread(x, z) || bootMarks.has(x + ',' + z)) color = M.track;
        vox.set(x, y, z, color);
      }
    }
  }

  boulder(vox, -66, -48, 15, 16, 10, 18, true);
  boulder(vox, -81, -50, 7, 5, 6, 34);
  boulder(vox, -55, -45, 6, 6, 5, 11);
  boulder(vox, 82, -31, 9, 6, 5, 71);
  boulder(vox, -60, 51, 9, 5, 6, 50);
  boulder(vox, 79, 54, 7, 6, 6, 9);
  for (let i = 0; i < 630; i++) {
    const x = Math.floor((hash(i, 9, 1) - .5) * 205);
    const z = Math.floor((hash(i, 9, 2) - .5) * 161);
    if (!inside(x, z) || !inside(x + 4, z + 3) || !inside(x - 4, z - 3)) continue;
    if (Math.hypot(x + 25, z + 15) < 36 || Math.hypot(x - 38, z - 20) < 20 || tread(x, z)) continue;
    const r = hash(i, 4, 1);
    const h = surface(x, z)[0];
    if (r < .11) boulder(vox, x, z, 2 + Math.floor(r * 21), 2 + Math.floor(r * 15), 2, i);
    else if (r < .58) vox.set(x, h + 1, z, M.rock);
    else vox.set(x, h, z, M.rock);
  }
  return vox;
}
