import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

// ─── palette ───────────────────────────────────────────────
const C = {
  void: 0x0b0e16,
  fog: 0x1a2233,
  rockDark: 0x4a3f38,
  rockMid: 0x6b5b4e,
  rockLite: 0x8a7a6a,
  grassDark: 0x4a7a3c,
  grass: 0x5a8c4a,
  grassLite: 0x7bb05a,
  woodDark: 0x8b5a2b,
  wood: 0xa67c52,
  woodLite: 0xc4a574,
  roofDark: 0x2c4a5e,
  roof: 0x3d6b7e,
  roofLite: 0x4a7f96,
  sakuraDeep: 0xff4f7c,
  sakura: 0xff7a9e,
  sakuraLite: 0xff9eb8,
  sakuraPale: 0xffc0d2,
  lantern: 0xffb347,
  lanternCore: 0xffd28a,
  water: 0x6ec8e8,
  waterDeep: 0x3a8ab0,
  foam: 0xe8f8ff,
  paper: 0xf0e6d0,
  path: 0x9a8b78,
  pathDark: 0x6e6356,
  bamboo: 0x6a8f5a,
  bambooDark: 0x4f6e42,
  cloud: 0xf2f5fb,
  cloudMid: 0xe0e7f2,
  cloudShade: 0xc2cddd,
  noren: 0x8b3a3a,
  goldTrim: 0xc49a52,
  koiOrange: 0xff8c42,
  koiWhite: 0xf5f0e8,
  moss: 0x3f6b38,
  plaster: 0xe8dcc8,
};

const VOX = 0.36;          // large unit so the whole kingdom fills the frame
const CUBE = VOX * 1.015;  // slight overlap → gapless seams

// ─── voxel builder ─────────────────────────────────────────
class Voxels {
  constructor() {
    this.map = new Map();
  }
  key(x, y, z) { return `${x | 0},${y | 0},${z | 0}`; }
  set(x, y, z, color) {
    this.map.set(this.key(x, y, z), { x: x | 0, y: y | 0, z: z | 0, color });
  }
  get(x, y, z) { return this.map.get(this.key(x, y, z)); }
  clear(x, y, z) { this.map.delete(this.key(x, y, z)); }
  box(x0, y0, z0, x1, y1, z1, color) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          this.set(x, y, z, color);
  }
  boxHollow(x0, y0, z0, x1, y1, z1, color) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) {
          const edge =
            x === Math.min(x0, x1) || x === Math.max(x0, x1) ||
            y === Math.min(y0, y1) || y === Math.max(y0, y1) ||
            z === Math.min(z0, z1) || z === Math.max(z0, z1);
          if (edge) this.set(x, y, z, color);
        }
  }
  count() { return this.map.size; }
}

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 269.5 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ─── island base (large) ───────────────────────────────────
function buildIsland() {
  const v = new Voxels();
  const RX = 30, RZ = 24;

  // grass top with path ribbons, pond, terraces
  for (let x = -RX; x <= RX; x++) {
    for (let z = -RZ; z <= RZ; z++) {
      const d = (x * x) / (RX * RX) + (z * z) / (RZ * RZ);
      const wobble =
        0.07 * Math.sin(x * 0.45) * Math.cos(z * 0.38) +
        0.04 * Math.sin(x * 0.9 + z * 0.6);
      if (d + wobble > 1.0) continue;

      const n = hash2(x, z);
      const edge = d > 0.82;

      // pond basin (south-east)
      const pond =
        ((x - 10) * (x - 10)) / 90 + ((z - 8) * (z - 8)) / 55 <= 1.0;
      // stream from pond to waterfall lip
      const stream = z >= 6 && z <= 12 && x >= 14 && x <= 22 &&
        Math.abs(z - 9 - (x - 14) * 0.15) < 1.6;

      if (pond || stream) {
        v.set(x, 0, z, n > 0.5 ? C.water : C.waterDeep);
        v.set(x, -1, z, C.waterDeep);
        v.set(x, -2, z, C.rockDark);
        if (n > 0.85) v.set(x, 1, z, C.foam);
        continue;
      }

      // stone path: entry south → house west, branch to grove east
      const pathMain =
        (Math.abs(z - (14 - x * 0.35)) < 1.3 && x > -16 && x < 8) ||
        (Math.abs(x + 2) < 1.3 && z > 2 && z < 16);
      const pathGrove = Math.abs(z - 2) < 1.2 && x > 2 && x < 18;
      const isPath = pathMain || pathGrove;

      // stepping stones / dirt under grass
      let col = edge ? (n > 0.5 ? C.grassDark : C.grass) : (n > 0.72 ? C.grassLite : C.grass);
      if (isPath && !edge) col = n > 0.55 ? C.path : C.pathDark;
      if (!edge && n > 0.88 && !isPath) col = C.moss;

      // raised terrace pads near house
      const terrace = x >= -22 && x <= -2 && z >= -14 && z <= 4;
      if (terrace && d < 0.75) {
        v.set(x, 0, z, n > 0.5 ? C.path : C.pathDark);
        if (n > 0.7) v.set(x, 1, z, C.grassDark);
      } else {
        v.set(x, 0, z, col);
      }
      v.set(x, -1, z, n > 0.5 ? C.rockMid : C.rockDark);
      if (hash2(x + 3, z) > 0.6) v.set(x, -2, z, C.rockMid);
    }
  }

  // deep inverted rock mass with strata
  for (let y = -3; y >= -30; y--) {
    const t = (-y - 3) / 27;
    const rx = RX * (1 - t * 0.93) + 1.5;
    const rz = RZ * (1 - t * 0.93) + 1.2;
    for (let x = -RX - 2; x <= RX + 2; x++) {
      for (let z = -RZ - 2; z <= RZ + 2; z++) {
        const d = (x * x) / (rx * rx) + (z * z) / (rz * rz);
        const bulge =
          0.1 * Math.sin(x * 0.28 + y * 0.22) * Math.cos(z * 0.31) +
          0.05 * Math.sin(y * 0.5);
        if (d + bulge > 1.0) continue;
        const n = hash3(x, y, z);
        // occasional hollow caverns mid-rock
        if (d < 0.28 && y > -16 && y < -6 && n > 0.78) continue;

        let col = C.rockMid;
        if (y <= -18) col = n > 0.5 ? C.rockDark : C.rockMid;
        else if (y <= -10) col = n > 0.62 ? C.rockLite : C.rockMid;
        else col = n > 0.4 ? C.rockMid : C.rockLite;
        if (d > 0.86 && n > 0.35) col = C.rockDark;
        v.set(x, y, z, col);
      }
    }
  }

  // hanging roots / rubble tips
  for (let i = 0; i < 40; i++) {
    const a = hash2(i, 7) * Math.PI * 2;
    const r = 2 + hash2(i, 13) * 8;
    const x = Math.round(Math.cos(a) * r);
    const z = Math.round(Math.sin(a) * r * 0.75);
    const y = -28 - Math.floor(hash2(i, 21) * 5);
    for (let k = 0; k < 2 + Math.floor(hash2(i, 3) * 3); k++) {
      v.set(x, y - k, z, C.rockDark);
    }
  }

  return v;
}

// ─── tea house complex (larger, multi-building) ────────────
function buildTeaComplex(v) {
  // MAIN HALL — west terrace, 17 x 13
  buildHall(v, {
    ox: -24, oz: -12, w: 17, d: 13,
    wallY: 1, wallH: 7,
    shoji: true, noren: true,
  });

  // TEA ROOM annex — south of main, 9 x 8
  buildHall(v, {
    ox: -20, oz: 3, w: 9, d: 8,
    wallY: 1, wallH: 5,
    shoji: true, noren: false, simpleRoof: true,
  });

  // STOREHOUSE — north-west, 6 x 6
  buildHall(v, {
    ox: -24, oz: -20, w: 6, d: 6,
    wallY: 1, wallH: 5,
    shoji: false, noren: false, simpleRoof: true,
  });

  // engawa walkway connecting halls
  for (let x = -22; x <= -12; x++) {
    for (let z = 2; z <= 3; z++) {
      v.set(x, 0, z, hash2(x, z) > 0.5 ? C.wood : C.woodLite);
    }
  }
  for (let z = -6; z <= 2; z++) {
    v.set(-23, 0, z, C.wood);
    v.set(-22, 0, z, C.woodLite);
  }

  // stone lantern row along engawa
  for (const [lx, lz] of [[-14, 4], [-10, 4], [-6, 6], [-2, 8]]) {
    buildLantern(v, lx, lz);
  }
  // entry lanterns on path
  buildLantern(v, 0, 14);
  buildLantern(v, 4, 16);
  buildLantern(v, 8, 4);
}

function buildHall(v, opt) {
  const { ox, oz, w, d, wallY = 1, wallH = 5, shoji = true, noren = false, simpleRoof = false } = opt;
  const top = wallY + wallH - 1;

  // engawa ring
  for (let x = ox - 2; x <= ox + w + 1; x++) {
    for (let z = oz - 2; z <= oz + d + 1; z++) {
      const inside = x >= ox && x <= ox + w - 1 && z >= oz && z <= oz + d - 1;
      if (!inside) v.set(x, 0, z, hash2(x + z, 1) > 0.5 ? C.wood : C.woodLite);
    }
  }
  // floor
  v.box(ox, wallY, oz, ox + w - 1, wallY, oz + d - 1, C.woodDark);

  // posts
  for (let x = ox; x <= ox + w - 1; x += Math.max(3, Math.floor(w / 4))) {
    for (let z = oz; z <= oz + d - 1; z += Math.max(3, Math.floor(d / 3))) {
      for (let y = wallY; y <= top; y++) v.set(x, y, z, C.wood);
    }
    // corners forced
    v.set(x, wallY, oz, C.wood); v.set(x, top, oz, C.wood);
    v.set(x, wallY, oz + d - 1, C.wood); v.set(x, top, oz + d - 1, C.wood);
  }
  for (let z = oz; z <= oz + d - 1; z += Math.max(3, Math.floor(d / 3))) {
    v.set(ox, wallY, z, C.wood); v.set(ox, top, z, C.wood);
    v.set(ox + w - 1, wallY, z, C.wood); v.set(ox + w - 1, top, z, C.wood);
  }

  // walls with shoji (paper) panels
  for (let y = wallY; y <= top; y++) {
    for (let x = ox; x <= ox + w - 1; x++) {
      // back
      if (y <= wallY + 1) v.set(x, y, oz, C.woodDark);
      else if (shoji && y >= wallY + 2 && y <= top - 1 && (x + y) % 3 !== 0) v.set(x, y, oz, C.paper);
      else v.set(x, y, oz, C.wood);
      // front (door gap)
      const door = x >= ox + Math.floor(w / 2) - 1 && x <= ox + Math.floor(w / 2) + 1 && y <= top - 1;
      if (door) continue;
      if (y <= wallY + 1) v.set(x, y, oz + d - 1, C.woodDark);
      else if (shoji && y >= wallY + 2 && y <= top - 1 && (x + y) % 3 !== 0) v.set(x, y, oz + d - 1, C.paper);
      else v.set(x, y, oz + d - 1, C.wood);
    }
    for (let z = oz; z <= oz + d - 1; z++) {
      if (y <= wallY + 1) {
        v.set(ox, y, z, C.woodDark);
        v.set(ox + w - 1, y, z, C.woodDark);
      } else if (shoji && y >= wallY + 2 && y <= top - 1 && (z + y) % 3 !== 0) {
        v.set(ox, y, z, C.paper);
        v.set(ox + w - 1, y, z, C.paper);
      } else {
        v.set(ox, y, z, C.wood);
        v.set(ox + w - 1, y, z, C.wood);
      }
    }
  }

  if (noren) {
    const dx = ox + Math.floor(w / 2);
    for (let i = -1; i <= 1; i++) v.set(dx + i, top, oz + d - 1, C.noren);
  }

  // ridge beam
  const midZ = oz + Math.floor(d / 2);
  v.box(ox - 1, top + 1, midZ, ox + w, top + 1, midZ, C.woodDark);

  // ROOF
  if (simpleRoof) {
    // stepped pyramid-ish
    for (let layer = 0; layer < 4; layer++) {
      const ins = layer;
      const y = top + 2 + layer;
      const x0 = ox - 2 + ins, x1 = ox + w + 1 - ins;
      const z0 = oz - 2 + ins, z1 = oz + d + 1 - ins;
      for (let x = x0; x <= x1; x++) {
        for (let z = z0; z <= z1; z++) {
          if (layer === 3 && x !== ox + Math.floor(w / 2)) continue;
          let col = layer === 0 ? C.roof : (layer === 3 ? C.goldTrim : C.roofDark);
          if (hash2(x, z + y) > 0.8) col = C.roofLite;
          v.set(x, y, z, col);
          if (layer === 0 && ((x === x0 || x === x1) && (z === z0 || z === z1))) {
            v.set(x, y + 1, z, C.roofLite);
          }
        }
      }
    }
  } else {
    // irimoya: wide eave skirt + upper gable
    for (let layer = 0; layer < 3; layer++) {
      const ins = layer;
      const y = top + 2 + layer;
      const x0 = ox - 3 + ins, x1 = ox + w + 2 - ins;
      const z0 = oz - 3 + ins, z1 = oz + d + 2 - ins;
      for (let x = x0; x <= x1; x++) {
        for (let z = z0; z <= z1; z++) {
          if (layer === 2) {
            const mid = x > ox && x < ox + w - 1 && z > oz && z < oz + d - 1;
            if (mid) continue;
          }
          const eave = x === x0 || x === x1 || z === z0 || z === z1;
          let col = layer === 0 && eave ? C.roofLite : C.roof;
          if (hash2(x, z + y) > 0.82) col = C.roofDark;
          v.set(x, y, z, col);
          if (layer === 0 && (x === x0 || x === x1) && (z === z0 || z === z1)) {
            v.set(x, y + 1, z, C.roofLite);
          }
        }
      }
    }
    // upper gable
    for (let layer = 0; layer < 4; layer++) {
      const y = top + 5 + layer;
      const half = 4 - layer;
      for (let x = ox - 3; x <= ox + w + 2; x++) {
        for (let z = midZ - half; z <= midZ + half; z++) {
          let col = layer === 0 ? C.roof : (layer >= 2 ? C.roofLite : C.roofDark);
          if (x <= ox - 2 || x >= ox + w + 1) {
            if (layer < 2) col = C.plaster;
            else continue;
          }
          v.set(x, y, z, col);
        }
      }
    }
    // gold ridge — single clean line
    for (let x = ox - 1; x <= ox + w; x++) {
      v.set(x, top + 9, midZ, C.goldTrim);
    }
  }
}

function buildLantern(v, x, z) {
  v.box(x - 1, 0, z - 1, x + 1, 0, z + 1, C.pathDark);
  v.set(x, 1, z, C.rockLite);
  v.set(x, 2, z, C.rockMid);
  v.set(x, 3, z, C.rockLite);
  v.boxHollow(x - 1, 4, z - 1, x + 1, 5, z + 1, C.rockMid);
  v.set(x, 4, z, C.lanternCore);
  v.set(x, 5, z, C.lanternCore);
  v.set(x - 1, 4, z, C.lantern);
  v.set(x + 1, 5, z, C.lantern);
  v.box(x - 1, 6, z - 1, x + 1, 6, z + 1, C.rockLite);
  v.set(x, 7, z, C.rockMid);
  v.set(x - 1, 7, z, C.goldTrim);
  v.set(x + 1, 7, z, C.goldTrim);
}

// ─── cherry grove (3 trees, varied) ────────────────────────
function buildCherryGrove(v) {
  // spread trees so silhouettes stay distinct
  buildCherry(v, { x: 16, z: -10, scale: 1.25, lean: -3, crownY: 20 });
  buildCherry(v, { x: 26, z: 6, scale: 0.9, lean: 2, crownY: 15 });
  buildCherry(v, { x: 2, z: 8, scale: 0.75, lean: -2, crownY: 12 });
  buildCherry(v, { x: 10, z: -18, scale: 0.5, lean: 0, crownY: 10 });
}

function buildCherry(v, { x: baseX, z: baseZ, scale = 1, lean = 0, crownY = 14 }) {
  const h = Math.round(crownY * scale);
  // roots
  for (const [dx, dz] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [2, 1], [1, 2], [-2, 0], [0, -2]]) {
    v.set(baseX + dx, 0, baseZ + dz, C.woodDark);
  }
  // trunk
  for (let y = 1; y <= h; y++) {
    const t = y / h;
    const x = Math.round(baseX + lean * t * t);
    const z = Math.round(baseZ + Math.sin(t * 2) * 0.4);
    const thick = y < h * 0.35 ? 2 : 1;
    for (let i = 0; i < thick; i++) {
      v.set(x + i, y, z, i === 0 ? C.wood : C.woodDark);
    }
    if (y > h * 0.5 && y % 3 === 0) {
      // branch stubs
      const dir = y % 2 === 0 ? 1 : -1;
      for (let b = 1; b <= 3; b++) {
        v.set(x + dir * b, y + (b > 2 ? 1 : 0), z + (y % 4 === 0 ? b : -b * 0.3 | 0), C.woodDark);
      }
    }
  }

  // canopy ellipsoid
  const cx = baseX + lean;
  const cy = h + 2;
  const cz = baseZ;
  const rx = Math.round(6 * scale) + 1;
  const ry = Math.round(4.5 * scale) + 1;
  const rz = Math.round(5.5 * scale) + 1;
  for (let x = -rx; x <= rx; x++) {
    for (let y = -ry; y <= ry; y++) {
      for (let z = -rz; z <= rz; z++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz);
        const fuzz = 0.14 * Math.sin(x * 1.1 + y * 0.6) * Math.cos(z * 0.9);
        const n = hash3(cx + x, cy + y, cz + z);
        if (d + fuzz > 1.0 || n < 0.1) continue;
        if (d < 0.3 && n > 0.95) continue;
        let col;
        if (y >= 2) col = n > 0.5 ? C.sakura : C.sakuraLite;
        else if (y <= -2) col = n > 0.4 ? C.sakuraDeep : C.sakura;
        else col = n > 0.65 ? C.sakuraLite : (n > 0.22 ? C.sakura : C.sakuraDeep);
        v.set(cx + x, cy + y, cz + z, col);
      }
    }
  }

  // hanging poms
  for (let i = 0; i < 8; i++) {
    const a = hash2(i, baseX) * Math.PI * 2;
    const r = rx * 0.75;
    const px = cx + Math.round(Math.cos(a) * r);
    const pz = cz + Math.round(Math.sin(a) * r * 0.8);
    const py = cy - ry + 1;
    v.set(px, py, pz, C.sakura);
    v.set(px, py - 1, pz, C.sakuraDeep);
    v.set(px + 1, py, pz, C.sakuraLite);
  }
}

// ─── bamboo grove + fence + bridge + pond life ─────────────
function buildGarden(v) {
  // bamboo cluster NE
  for (let i = 0; i < 28; i++) {
    const bx = -4 + Math.floor(hash2(i, 50) * 14);
    const bz = -18 + Math.floor(hash2(i, 51) * 12);
    const h = 6 + Math.floor(hash2(i, 52) * 8);
    for (let y = 1; y <= h; y++) {
      v.set(bx, y, bz, y % 3 === 0 ? C.bambooDark : C.bamboo);
      if (y > h * 0.5 && hash2(i + y, bz) > 0.7) {
        v.set(bx + 1, y, bz, C.grassDark);
        v.set(bx - 1, y, bz, C.bamboo);
      }
    }
  }

  // bamboo fence along north-east rim
  for (let x = -2; x <= 24; x++) {
    const z = -16 + Math.round(Math.sin(x * 0.2) * 2);
    const d = (x * x) / (30 * 30) + (z * z) / (24 * 24);
    if (d > 0.78) continue;
    v.set(x, 1, z, C.bambooDark);
    v.set(x, 2, z, C.bamboo);
    v.set(x, 3, z, C.bambooDark);
    if (x % 2 === 0) v.set(x, 3, z, C.woodDark);
    v.set(x, 2, z + 1, C.wood); // rail
  }

  // arched wooden bridge over stream
  for (let i = 0; i < 9; i++) {
    const x = 14 + i;
    const y = 2 + (i === 4 ? 2 : i === 3 || i === 5 ? 1 : 0);
    const z = 9;
    v.set(x, y, z, C.woodLite);
    v.set(x, y, z + 1, C.wood);
    v.set(x, y + 1, z - 1, C.woodDark); // rail
    v.set(x, y + 1, z + 2, C.woodDark);
  }

  // koi in pond
  const koi = [[8, 6, C.koiOrange], [12, 8, C.koiWhite], [10, 11, C.koiOrange], [14, 6, C.koiWhite]];
  for (const [kx, kz, col] of koi) {
    v.set(kx, 1, kz, col);
    v.set(kx + 1, 1, kz, col);
    v.set(kx, 1, kz + 1, C.koiWhite === col ? C.koiOrange : C.koiWhite);
  }
  // lily pads
  for (let i = 0; i < 10; i++) {
    const lx = 6 + Math.floor(hash2(i, 60) * 10);
    const lz = 4 + Math.floor(hash2(i, 61) * 10);
    if (v.get(lx, 0, lz) && v.get(lx, 0, lz).color === C.water) {
      v.set(lx, 1, lz, C.grassDark);
      if (hash2(i, 62) > 0.6) v.set(lx, 2, lz, C.sakuraLite);
    }
  }

  // stone lantern near pond
  buildLantern(v, 6, 12);
  buildLantern(v, 16, 14);

  // tea stone / basin
  v.box(-2, 0, 10, 0, 0, 12, C.rockLite);
  v.set(-1, 1, 11, C.rockMid);
  v.set(-1, 1, 12, C.water);

  // moss & rocks scatter
  for (let i = 0; i < 50; i++) {
    const x = Math.round(hash2(i, 70) * 50 - 25);
    const z = Math.round(hash2(i, 71) * 40 - 20);
    const d = (x * x) / 900 + (z * z) / 576;
    if (d > 0.85) continue;
    const cur = v.get(x, 0, z);
    if (cur && (cur.color === C.grass || cur.color === C.grassLite)) {
      if (hash2(i, 72) > 0.7) v.set(x, 0, z, C.moss);
      if (hash2(i, 73) > 0.88) {
        v.set(x, 1, z, C.rockLite);
        v.set(x, 2, z, C.rockMid);
      }
    }
  }
}

// ─── satellite rock + pagoda ───────────────────────────────
function buildCliffTerraces(v) {
  // stepped dwellings OUTSIDE the rock face on the camera side (+x/+z)
  // platforms sit at the ellipse rim and hang over the void
  const spots = [
    { x: 24, y: -2, z: 12, w: 6, d: 5, h: 4 },
    { x: 18, y: -5, z: 18, w: 5, d: 4, h: 3 },
    { x: 26, y: -7, z: 6, w: 5, d: 5, h: 4 },
    { x: 14, y: -9, z: 20, w: 4, d: 4, h: 3 },
    { x: 22, y: -12, z: 14, w: 5, d: 4, h: 3 },
  ];
  for (const s of spots) {
    // deck jutting out
    v.box(s.x - 1, s.y, s.z - 1, s.x + s.w + 1, s.y, s.z + s.d + 1, C.rockLite);
    v.box(s.x - 1, s.y - 1, s.z - 1, s.x + s.w + 1, s.y - 1, s.z + s.d + 1, C.rockMid);
    // hut
    v.boxHollow(s.x, s.y + 1, s.z, s.x + s.w - 1, s.y + s.h, s.z + s.d - 1, C.woodDark);
    v.set(s.x + 1, s.y + 2, s.z + s.d - 1, C.paper);
    v.set(s.x + 2, s.y + 2, s.z + s.d - 1, C.lanternCore);
    v.set(s.x + 1, s.y + 2, s.z, C.paper);
    v.set(s.x + s.w - 1, s.y + 2, s.z + 1, C.paper);
    // roof
    v.box(s.x - 1, s.y + s.h + 1, s.z - 1, s.x + s.w, s.y + s.h + 1, s.z + s.d, C.roofDark);
    v.box(s.x, s.y + s.h + 2, s.z, s.x + s.w - 1, s.y + s.h + 2, s.z + s.d - 1, C.roof);
    v.box(s.x + 1, s.y + s.h + 3, s.z + 1, s.x + s.w - 2, s.y + s.h + 3, s.z + s.d - 2, C.roofLite);
    // support posts to cliff
    for (let i = 0; i < 3; i++) {
      v.set(s.x - 2, s.y - i, s.z + 1, C.woodDark);
      v.set(s.x + s.w, s.y - i, s.z + s.d, C.woodDark);
    }
    // warm windows
    v.set(s.x + s.w - 1, s.y + s.h, s.z + s.d - 1, C.lantern);
    v.set(s.x + s.w - 1, s.y + s.h - 1, s.z + s.d - 1, C.lanternCore);
  }
}

function buildFrontGarden(v) {
  // torii gate on the entry path
  const tx = 2, tz = 16;
  v.set(tx - 2, 0, tz, C.pathDark); v.set(tx + 2, 0, tz, C.pathDark);
  for (let y = 1; y <= 6; y++) {
    v.set(tx - 2, y, tz, y < 3 ? C.noren : C.wood);
    v.set(tx + 2, y, tz, y < 3 ? C.noren : C.wood);
  }
  v.box(tx - 3, 6, tz, tx + 3, 6, tz, C.woodDark);
  v.box(tx - 3, 7, tz, tx + 3, 7, tz, C.noren);
  v.set(tx - 3, 7, tz, C.goldTrim);
  v.set(tx + 3, 7, tz, C.goldTrim);

  // stone path widening plaza
  for (let x = -2; x <= 8; x++) {
    for (let z = 12; z <= 18; z++) {
      if ((x + z) % 2 === 0) {
        const cur = v.get(x, 0, z);
        if (cur && (cur.color === C.grass || cur.color === C.grassLite || cur.color === C.moss)) {
          v.set(x, 0, z, hash2(x, z) > 0.5 ? C.path : C.pathDark);
        }
      }
    }
  }

  // tea pavilion by pond (small open structure)
  const px = 6, pz = 4;
  for (let i = 0; i < 4; i++) {
    v.set(px + (i % 2) * 4, 1, pz + Math.floor(i / 2) * 4, C.wood);
    for (let y = 2; y <= 4; y++) v.set(px + (i % 2) * 4, y, pz + Math.floor(i / 2) * 4, C.wood);
  }
  v.box(px, 5, pz, px + 4, 5, pz + 4, C.roof);
  v.box(px - 1, 6, pz - 1, px + 5, 6, pz + 5, C.roofDark);
  v.box(px, 7, pz + 2, px + 4, 7, pz + 2, C.roofLite);
  v.set(px + 2, 1, pz + 2, C.rockLite); // table stone

  // extra lanterns along front
  buildLantern(v, -4, 12);
  buildLantern(v, 10, 12);
  buildLantern(v, 12, 8);

  // stone steps from path up to terrace
  for (let i = 0; i < 5; i++) {
    v.set(-8 + i, 1 + (i > 2 ? 1 : 0), 8, C.path);
    v.set(-8 + i, 1 + (i > 2 ? 1 : 0), 9, C.pathDark);
  }
}

function buildSkyIsles(v) {
  // extra floating rocks — archipelago scale
  const isles = [
    { ox: -36, oy: 6, oz: 14, rx: 6, rz: 5, pagoda: false, cherry: true },
    { ox: 28, oy: -8, oz: -20, rx: 5, rz: 4, pagoda: false, cherry: false },
    { ox: -28, oy: -12, oz: -22, rx: 4, rz: 3, pagoda: false, cherry: false },
  ];
  for (const isle of isles) {
    const { ox, oy, oz, rx, rz, cherry } = isle;
    for (let x = -rx; x <= rx; x++) {
      for (let z = -rz; z <= rz; z++) {
        const d = (x * x) / (rx * rx) + (z * z) / (rz * rz);
        if (d + 0.1 * Math.sin(x + ox) > 1) continue;
        v.set(ox + x, oy, oz + z, hash2(x + ox, z) > 0.5 ? C.grass : C.grassDark);
        v.set(ox + x, oy - 1, oz + z, C.rockMid);
      }
    }
    for (let y = -2; y >= -8; y--) {
      const t = (-y - 2) / 6;
      const srx = rx * (1 - t * 0.8) + 0.4;
      const srz = rz * (1 - t * 0.8) + 0.4;
      for (let x = -rx; x <= rx; x++) {
        for (let z = -rz; z <= rz; z++) {
          const d = (x * x) / (srx * srx) + (z * z) / (srz * srz);
          if (d > 1) continue;
          v.set(ox + x, oy + y, oz + z, hash3(x + ox, y, z) > 0.5 ? C.rockMid : C.rockDark);
        }
      }
    }
    if (cherry) buildCherry(v, { x: ox, z: oz, scale: 0.7, lean: 1, crownY: 11 });
    else {
      buildLantern(v, ox, oz);
    }
  }

  // stone bridge toward pagoda isle
  for (let i = 0; i < 8; i++) {
    const x = 28 + i;
    const y = 1 + (i === 4 ? 1 : 0);
    const z = 10;
    v.set(x, y, z, C.path);
    v.set(x, y, z + 1, C.pathDark);
  }
}

function buildSatellite(v) {
  // second focal: pagoda isle to the camera-right
  const ox = 32, oy = 4, oz = 8;
  // small floating rock
  for (let x = -8; x <= 8; x++) {
    for (let z = -6; z <= 6; z++) {
      const d = (x * x) / 64 + (z * z) / 36;
      if (d + 0.1 * Math.sin(x) > 1) continue;
      v.set(ox + x, oy, oz + z, hash2(x, z) > 0.5 ? C.grass : C.grassDark);
      v.set(ox + x, oy - 1, oz + z, C.rockMid);
    }
  }
  for (let y = -2; y >= -10; y--) {
    const t = (-y - 2) / 8;
    const rx = 8 * (1 - t * 0.85) + 0.5;
    const rz = 6 * (1 - t * 0.85) + 0.5;
    for (let x = -8; x <= 8; x++) {
      for (let z = -6; z <= 6; z++) {
        const d = (x * x) / (rx * rx) + (z * z) / (rz * rz);
        if (d > 1) continue;
        v.set(ox + x, oy + y, oz + z, hash3(x, y, z) > 0.5 ? C.rockMid : C.rockDark);
      }
    }
  }
  // stone pagoda (5-tier)
  let py = oy + 1;
  for (let tier = 0; tier < 5; tier++) {
    const s = 3 - Math.floor(tier / 2);
    v.box(ox - s, py, oz - s, ox + s, py, oz + s, tier % 2 ? C.rockLite : C.rockMid);
    v.box(ox - s + 1, py + 1, oz - s + 1, ox + s - 1, py + 1, oz + s - 1, C.rockLite);
    // eave flare
    v.box(ox - s - 1, py + 2, oz - s - 1, ox + s + 1, py + 2, oz + s + 1, C.roofDark);
    py += 3;
  }
  v.set(ox, py, oz, C.goldTrim);
  v.set(ox, py + 1, oz, C.goldTrim);
  v.set(ox, py + 2, oz, C.goldTrim);

  // tiny satellite fragment rock
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (x * x + z * z > 5) continue;
      v.set(ox - 14 + x, oy - 4, oz + 10 + z, C.rockDark);
      v.set(ox - 14 + x, oy - 3, oz + 10 + z, C.rockMid);
    }
  }
}

// fix satellite lantern separately
function buildSatelliteLantern(v) {
  const x = 32 - 10, y = 5, z = 8 + 8;
  // rebuild cleanly at absolute
  v.box(x - 1, y, z - 1, x + 1, y, z + 1, C.pathDark);
  v.set(x, y + 1, z, C.rockLite);
  v.set(x, y + 2, z, C.rockMid);
  v.boxHollow(x - 1, y + 3, z - 1, x + 1, y + 4, z + 1, C.rockMid);
  v.set(x, y + 3, z, C.lanternCore);
  v.set(x, y + 4, z, C.lantern);
  v.box(x - 1, y + 5, z - 1, x + 1, y + 5, z + 1, C.rockLite);
  v.set(x, y + 6, z, C.rockMid);
}

// ─── waterfall cascade on +x rim ───────────────────────────
function buildCascade(v) {
  // overflow lip from stream
  for (let x = 20; x <= 26; x++) {
    for (let z = 7; z <= 12; z++) {
      const d = (x * x) / 900 + (z * z) / 576;
      if (d > 1.02) continue;
      v.set(x, 0, z, C.water);
      v.set(x, -1, z, C.waterDeep);
    }
  }
  // stacked falling water on cliff
  for (let y = -1; y >= -16; y--) {
    for (let dz = -1; dz <= 1; dz++) {
      const col = (y + dz) % 3 === 0 ? C.foam : C.water;
      v.set(25, y, 9 + dz, col);
      v.set(26, y, 9 + dz, y % 2 === 0 ? C.water : C.waterDeep);
    }
    if (y > -8) v.set(27, y, 9, C.water);
  }
  // foam pool at bottom
  for (let x = 23; x <= 28; x++) {
    for (let z = 7; z <= 12; z++) {
      v.set(x, -16, z, C.foam);
    }
  }
}

// ─── clouds ────────────────────────────────────────────────
function buildClouds() {
  const clouds = [];
  const defs = [
    { x: -42, y: 8, z: -28, s: 2.4 },
    { x: 40, y: 14, z: -32, s: 2.0 },
    { x: 16, y: -14, z: 38, s: 2.2 },
    { x: -34, y: -18, z: 30, s: 1.8 },
    { x: 48, y: -4, z: 14, s: 1.6 },
    { x: -12, y: 22, z: -40, s: 1.9 },
    { x: 30, y: 4, z: 36, s: 1.5 },
  ];
  for (const d of defs) {
    const v = new Voxels();
    const rx = Math.round(7 * d.s);
    const ry = Math.round(1.1 * d.s);
    const rz = Math.round(3.5 * d.s);
    for (let x = -rx; x <= rx; x++)
      for (let y = -ry; y <= ry; y++)
        for (let z = -rz; z <= rz; z++) {
          const dist = (x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz);
          const soft = 0.1 * Math.sin(x * 0.35 + d.x * 0.2) + 0.05 * Math.cos(z * 0.4);
          if (dist + soft <= 1.0) {
            const col = y > 0.2 ? C.cloud : (y < -0.2 ? C.cloudShade : C.cloudMid);
            v.set(x, y, z, col);
          }
        }
    clouds.push({ voxels: v, origin: new THREE.Vector3(d.x, d.y, d.z), drift: 0.06 + hash2(d.x, 3) * 0.08 });
  }
  return clouds;
}

// ─── assemble ──────────────────────────────────────────────
function buildAll() {
  const v = buildIsland();
  buildTeaComplex(v);
  buildCherryGrove(v);
  buildGarden(v);
  buildFrontGarden(v);
  buildCliffTerraces(v);
  buildSkyIsles(v);
  buildSatellite(v);
  buildSatelliteLantern(v);
  buildCascade(v);
  return v;
}

// fake AO: darken voxels with many neighbors
function applyAO(map) {
  const DIRS = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ];
  for (const item of map.values()) {
    let open = 0;
    for (const [dx, dy, dz] of DIRS) {
      if (!map.has(`${item.x + dx},${item.y + dy},${item.z + dz}`)) open++;
    }
    // exposed top stays bright; enclosed sinks
    const ao = 0.82 + open * 0.04;
    item._ao = Math.min(1.05, ao);
  }
}

// ─── renderer ──────────────────────────────────────────────
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(C.fog, 0.0085);

function makeSky() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#080b14');
  g.addColorStop(0.3, '#101828');
  g.addColorStop(0.58, '#223048');
  g.addColorStop(0.8, '#4a3548');
  g.addColorStop(0.93, '#8a5340');
  g.addColorStop(1, '#c47a50');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 512);
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 8;
    const y = Math.random() * 200;
    ctx.fillStyle = `rgba(230,235,255,${0.2 + Math.random() * 0.6})`;
    ctx.fillRect(x, y, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
scene.background = makeSky();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 300);
const HOME = new THREE.Vector3(26, 18, 34);
const LOOK = new THREE.Vector3(2, 1, 0);
camera.position.copy(HOME);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(LOOK);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 16;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI * 0.54;
controls.minPolarAngle = Math.PI * 0.1;
controls.enablePan = false;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.28;
let animHome = null;
setTimeout(() => { if (!animHome) controls.autoRotate = true; }, 5000);

// lights
const hemi = new THREE.HemisphereLight(0x7a8ab0, 0x4a3828, 0.68);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffc48a, 2.6);
sun.position.set(-50, 42, 28);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 140;
sun.shadow.camera.left = -55;
sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55;
sun.shadow.camera.bottom = -55;
sun.shadow.bias = -0.0003;
sun.shadow.normalBias = 0.03;
scene.add(sun);
const rim = new THREE.DirectionalLight(0xb08aff, 0.38);
rim.position.set(30, 14, -40);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xffd0a0, 0.3);
fill.position.set(12, 8, 30);
scene.add(fill);

// practical lights (world units ≈ voxel*coord)
function vpos(x, y, z) { return new THREE.Vector3(x * VOX, y * VOX, z * VOX); }
const lanternLights = [
  new THREE.PointLight(0xffb347, 2.2, 2.8, 2),
  new THREE.PointLight(0xffb347, 2.0, 2.5, 2),
  new THREE.PointLight(0xffb347, 1.8, 2.4, 2),
  new THREE.PointLight(0xffc07a, 1.5, 2.2, 2),
];
lanternLights[0].position.copy(vpos(6, 5, 12));
lanternLights[1].position.copy(vpos(16, 5, 14));
lanternLights[2].position.copy(vpos(0, 5, 14));
lanternLights[3].position.copy(vpos(-14, 4, 3)); // house
lanternLights.forEach(l => scene.add(l));

function makeGlowSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,220,150,0.95)');
  g.addColorStop(0.35, 'rgba(255,180,80,0.35)');
  g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  }));
  sp.scale.setScalar(1.4);
  return sp;
}
const halos = [];
for (const [x, y, z] of [[6, 5, 12], [16, 5, 14], [0, 5, 14], [-14, 4, 3]]) {
  const h = makeGlowSprite();
  h.position.copy(vpos(x, y, z));
  scene.add(h);
  halos.push(h);
}

// ─── to instanced (gapless + AO) ───────────────────────────
function toInstanced(map, opts = {}) {
  const count = map.size;
  const geo = new THREE.BoxGeometry(CUBE, CUBE, CUBE);
  const mat = new THREE.MeshStandardMaterial({
    roughness: opts.roughness ?? 0.84,
    metalness: opts.metalness ?? 0,
    flatShading: true,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    emissive: new THREE.Color(opts.emissive ?? 0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(count, 1));
  mesh.castShadow = opts.castShadow !== false;
  mesh.receiveShadow = opts.receiveShadow !== false;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let i = 0;
  const ox = opts.origin?.x ?? 0;
  const oy = opts.origin?.y ?? 0;
  const oz = opts.origin?.z ?? 0;
  for (const item of map.values()) {
    dummy.position.set((item.x + ox) * VOX, (item.y + oy) * VOX, (item.z + oz) * VOX);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(item.color);
    const ao = item._ao ?? 1;
    color.multiplyScalar(ao);
    mesh.setColorAt(i, color);
    i++;
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

const world = new THREE.Group();
scene.add(world);

const islandVox = buildAll();
applyAO(islandVox.map);
const CANOPY = new Set([C.sakuraDeep, C.sakura, C.sakuraLite, C.sakuraPale]);
const canopyMap = new Map();
const structureMap = new Map();
for (const [k, item] of islandVox.map) {
  if (CANOPY.has(item.color) && item.y >= 8) canopyMap.set(k, item);
  else structureMap.set(k, item);
}
console.log('voxel count', islandVox.count(), 'canopy', canopyMap.size, 'struct', structureMap.size);

world.add(toInstanced(structureMap, {}));
world.add(toInstanced(canopyMap, {
  roughness: 0.78,
  emissive: 0xff3d6e,
  emissiveIntensity: 0.1,
}));

// clouds
const cloudMeshes = [];
for (const c of buildClouds()) {
  const map = c.voxels.map;
  const geo = new THREE.BoxGeometry(CUBE * 1.04, CUBE * 0.9, CUBE * 1.04);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false });
  const m = new THREE.InstancedMesh(geo, mat, Math.max(map.size, 1));
  m.castShadow = false;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  let i = 0;
  for (const item of map.values()) {
    dummy.position.set((item.x + c.origin.x) * VOX, (item.y + c.origin.y) * VOX, (item.z + c.origin.z) * VOX);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
    col.set(item.color);
    m.setColorAt(i, col);
    i++;
  }
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  m.userData.drift = c.drift;
  m.userData.origin = c.origin.clone();
  scene.add(m);
  cloudMeshes.push(m);
}

// ─── particles: petals + waterfall mist ────────────────────
const PETAL_N = 280;
const petalGeo = new THREE.BoxGeometry(VOX * 1.1, VOX * 0.28, VOX * 0.75);
const petalMat = new THREE.MeshStandardMaterial({
  color: 0xff8eaa,
  transparent: true,
  opacity: 0.92,
  roughness: 0.65,
  flatShading: true,
  emissive: 0xff4f7a,
  emissiveIntensity: 0.15,
});
const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETAL_N);
const petalData = [];
const petalColors = [0xff5f88, 0xff8eaa, 0xffaec2, 0xffd0dc];
{
  const col = new THREE.Color();
  for (let i = 0; i < PETAL_N; i++) {
    petalData.push({
      x: 10 + (hash2(i, 20) - 0.5) * 40,
      y: hash2(i, 21) * 28,
      z: 2 + (hash2(i, 22) - 0.5) * 30,
      speed: 0.5 + hash2(i, 23) * 1.1,
      sway: 0.35 + hash2(i, 24) * 0.7,
      phase: hash2(i, 25) * Math.PI * 2,
      spin: 0.4 + hash2(i, 26) * 1.8,
    });
    col.set(petalColors[i % petalColors.length]);
    petals.setColorAt(i, col);
  }
  if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
}
petals.castShadow = false;
scene.add(petals);

const MIST_N = 90;
const mistGeo = new THREE.BoxGeometry(VOX * 0.9, VOX * 0.5, VOX * 0.9);
const mistMat = new THREE.MeshStandardMaterial({
  color: 0xb8f0ff,
  transparent: true,
  opacity: 0.55,
  roughness: 0.3,
  flatShading: true,
  emissive: 0x4a90b8,
  emissiveIntensity: 0.35,
});
const mist = new THREE.InstancedMesh(mistGeo, mistMat, MIST_N);
const mistData = [];
for (let i = 0; i < MIST_N; i++) {
  mistData.push({
    x: 25 + (hash2(i, 80) - 0.5) * 3,
    z: 9 + (hash2(i, 81) - 0.5) * 3,
    y: -hash2(i, 82) * 18,
    speed: 4 + hash2(i, 83) * 5,
    phase: hash2(i, 84),
  });
}
scene.add(mist);

// floating shards
const shards = new THREE.Group();
for (let i = 0; i < 10; i++) {
  const g = new THREE.BoxGeometry(0.25 + hash2(i, 40) * 0.45, 0.2, 0.25 + hash2(i, 41) * 0.35);
  const m = new THREE.MeshStandardMaterial({ color: C.rockDark, roughness: 0.9, flatShading: true });
  const mesh = new THREE.Mesh(g, m);
  const a = (i / 10) * Math.PI * 2;
  mesh.position.set(Math.cos(a) * (22 + i * 1.5), -6 + hash2(i, 42) * 18, Math.sin(a) * (18 + i));
  mesh.userData.spin = 0.08 + hash2(i, 46) * 0.15;
  shards.add(mesh);
}
scene.add(shards);

// ─── UI ────────────────────────────────────────────────────
const veil = document.getElementById('veil');
const hint = document.getElementById('hint');
const meterFill = document.getElementById('meterFill');
const cursorEl = document.getElementById('cursor');
setTimeout(() => hint.classList.add('faded'), 6000);

window.addEventListener('pointermove', (e) => {
  cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  cursorEl.classList.remove('hide');
});
window.addEventListener('pointerdown', () => {
  cursorEl.classList.add('drag');
  controls.autoRotate = false;
  hint.classList.add('faded');
});
window.addEventListener('pointerup', () => cursorEl.classList.remove('drag'));
window.addEventListener('pointerleave', () => cursorEl.classList.add('hide'));
window.addEventListener('dblclick', () => {
  animHome = { t: 0, from: camera.position.clone(), fromTarget: controls.target.clone() };
  controls.autoRotate = false;
});
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── loop ──────────────────────────────────────────────────
const clock = new THREE.Clock();
const dummy = new THREE.Object3D();

function tick() {
  const t = clock.getElapsedTime();
  const dt = Math.min(clock.getDelta(), 0.05);

  // flicker
  lanternLights.forEach((l, i) => {
    l.intensity = (1.6 + i * 0.1) + Math.sin(t * (5 + i)) * 0.12;
  });
  halos.forEach((h, i) => {
    h.material.opacity = 0.7 + Math.sin(t * (4 + i * 0.7)) * 0.1;
  });

  // mist fall
  for (let i = 0; i < MIST_N; i++) {
    const p = mistData[i];
    p.y -= p.speed * dt;
    if (p.y < -20) {
      p.y = 0;
      p.x = 25 + (hash2(i, (t | 0)) - 0.5) * 3;
    }
    dummy.position.set(p.x * VOX, p.y * VOX, p.z * VOX);
    dummy.rotation.set(0, p.phase, 0);
    dummy.updateMatrix();
    mist.setMatrixAt(i, dummy.matrix);
  }
  mist.instanceMatrix.needsUpdate = true;

  // petals
  for (let i = 0; i < PETAL_N; i++) {
    const p = petalData[i];
    p.y -= p.speed * dt * 2.0;
    p.x += Math.sin(t * p.sway + p.phase) * dt * 0.5;
    p.z += Math.cos(t * p.sway * 0.7 + p.phase) * dt * 0.3;
    if (p.y < -10) {
      p.y = 24 + hash2(i, (t | 0) + 3) * 5;
      p.x = 10 + (hash2(i, (t | 0) + 5) - 0.5) * 40;
      p.z = 2 + (hash2(i, (t | 0) + 7) - 0.5) * 30;
    }
    dummy.position.set(p.x * VOX, p.y * VOX, p.z * VOX);
    dummy.rotation.set(t * p.spin, p.phase + t * p.spin * 0.5, Math.sin(t + p.phase));
    dummy.scale.setScalar(0.75 + 0.3 * Math.sin(p.phase + t));
    dummy.updateMatrix();
    petals.setMatrixAt(i, dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate = true;

  // clouds
  for (const m of cloudMeshes) {
    m.position.x = Math.sin(t * m.userData.drift * 0.25) * 0.5;
    m.position.y = Math.sin(t * m.userData.drift + m.userData.origin.x) * 0.12;
  }

  // shards
  for (const s of shards.children) {
    s.rotation.x += dt * s.userData.spin * 0.15;
    s.rotation.y += dt * s.userData.spin * 0.25;
    s.position.y += Math.sin(t * 0.35 + s.position.x) * dt * 0.04;
  }

  if (animHome) {
    animHome.t = Math.min(1, animHome.t + dt * 0.8);
    const k = 1 - Math.pow(1 - animHome.t, 3);
    camera.position.lerpVectors(animHome.from, HOME, k);
    controls.target.lerpVectors(animHome.fromTarget, LOOK, k);
    if (animHome.t >= 1) {
      animHome = null;
      controls.autoRotate = true;
    }
  }

  const dist = camera.position.distanceTo(controls.target);
  const norm = THREE.MathUtils.clamp((dist - 16) / (80 - 16), 0, 1);
  meterFill.style.width = `${18 + (1 - norm) * 82}%`;

  world.position.y = Math.sin(t * 0.3) * 0.06;
  world.rotation.y = Math.sin(t * 0.08) * 0.008;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

requestAnimationFrame(() => {
  veil.classList.add('off');
  tick();
});
