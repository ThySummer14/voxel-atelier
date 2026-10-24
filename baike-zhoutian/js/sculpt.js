// 建筑层：石庭、台基、报时木阁、斗拱、琉璃攒尖顶、浑象室、露台。
// 体素单元用 Map（"x,y,z" → 调色板索引），网格阶段再做贪心合并。
import { L, CUTS } from './spec.js';
import { PI } from './palette.js';

export function P(key, dyn) {
  return { key, dyn: dyn || null, cells: new Map() };
}

export function set(p, x, y, z, c) {
  p.cells.set(`${Math.round(x)},${Math.round(y)},${Math.round(z)}`, c);
}

export function bx(p, x0, x1, y0, y1, z0, z1, c) {
  for (let x = Math.round(x0); x <= Math.round(x1); x++)
    for (let y = Math.round(y0); y <= Math.round(y1); y++)
      for (let z = Math.round(z0); z <= Math.round(z1); z++)
        set(p, x, y, z, c);
}

export function azim(x, z) {
  return Math.atan2(x, z) * 180 / Math.PI;
}

function sqRing(p, half, y0, y1, c, hole) {
  const h = Math.round(half);
  for (let x = -h; x <= h; x++)
    for (let z = -h; z <= h; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) < h - 1) continue;
      if (hole && Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
      for (let y = y0; y <= y1; y++) set(p, x, y, z, c);
    }
}

function sqPlate(p, half, y0, y1, c, hole) {
  const h = Math.round(half);
  const fn = typeof c === 'function' ? c : () => c;
  for (let x = -h; x <= h; x++)
    for (let z = -h; z <= h; z++) {
      if (hole && Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
      for (let y = y0; y <= y1; y++) set(p, x, y, z, fn(x, y, z));
    }
}

export function buildCourt() {
  const p = P('court');
  for (let x = -L.courtHalf; x <= L.courtHalf; x++)
    for (let z = -L.courtHalf; z <= L.courtHalf; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) <= L.base.half + 1) continue;
      if (Math.abs(x) <= 9 && z >= L.stair.zIn - 1 && z <= L.stair.zOut + 1) continue;
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m > L.base.half + 1 && (Math.floor((x + 240) / 10) + Math.floor((z + 240) / 10)) % 2 === 0)
        set(p, x, 0, z, PI.stoneD);
      else set(p, x, 0, z, PI.stoneL);
    }
  return p;
}

export function buildBase() {
  const p = P('base');
  const h = L.base.half;
  sqPlate(p, h, 0, 5, ((x, y, z) => (Math.abs(x) + Math.abs(z)) % 7 < 2 ? PI.stoneD : PI.stoneL));
  for (let x = -h; x <= h; x++)
    for (let z = -h; z <= h; z++) {
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m === h || m === h - 1) {
        set(p, x, 6, z, PI.stoneD);
        if ((x % 6 === 0 || z % 6 === 0) && m === h) {
          set(p, x, 7, z, PI.stoneL); set(p, x, 8, z, PI.stoneL);
        } else if (m === h - 1) set(p, x, 7, z, PI.stoneD);
      }
    }
  for (let k = 1; k <= 6; k++)
    bx(p, -7, 7, 0, k - 1, L.stair.zOut - 2 * k, L.stair.zOut - 2 * k + 1,
      k % 2 ? PI.stoneL : PI.stoneD);
  bx(p, -8, 8, 0, 5, L.stair.zOut - 12, L.stair.zOut - 1, PI.stoneD);
  for (const s of [-1, 1]) {
    bx(p, s * 11 - 1, s * 11 + 1, 6, 9, L.stair.zOut - 9, L.stair.zOut - 7, PI.stoneL);
    set(p, s * 11, 10, L.stair.zOut - 8, PI.lamp);
    set(p, s * 11, 10, L.stair.zOut - 9, PI.lamp);
  }
  return p;
}

function latticeWindow(p, x0, x1, y0, y1, z, facing) {
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++) {
      const frame = x === x0 || x === x1 || y === y0 || y === y1;
      const bar = (x - x0) % 3 === 0 || (y - y0) % 3 === 0;
      set(p, x, y, z, frame ? PI.lattice : bar ? PI.lattice : PI.paper);
    }
}

function buildWalls(p) {
  const { wallIn, wallTop, arcadeTop } = L.lower;
  const rows = L.doorRows;
  for (let x = -31; x <= 31; x++)
    for (let z = -31; z <= 31; z++) {
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m < wallIn) continue;
      for (let y = arcadeTop; y <= wallTop; y++) {
        let c = null;
        const south = z === 31, east = x === 31, north = z === -31, west = x === -31;
        if (south) {
          const rowHit = rows.find(r => y >= r && y <= r + 5);
          if (rowHit !== undefined && Math.abs(x) <= 4) c = null;
          else if (rowHit !== undefined) {
            const inner = x === 30;
            const wy = y - rowHit;
            const wx = (x + 30) % 21;
            if (inner) c = wy === 0 || wy === 5 || (x + 30) % 21 === 0 ? PI.lattice : PI.wall;
            else c = PI.wall;
            if (!inner && y > rowHit && y < rowHit + 5 && wx >= 2 && wx <= 18 && wy >= 1 && wy <= 4) {
              const bar = wx % 3 === 1 || wy % 2 === 1;
              c = bar ? PI.lattice : PI.paper;
            }
          } else c = PI.wall;
          if (y === wallTop || y === arcadeTop) c = PI.vermD;
        } else if (east || west || north) {
          const u = east || west ? z : x;
          const rowBand = rows.find(r => y >= r + 1 && y <= r + 4);
          if (y > arcadeTop + 1 && y < wallTop - 1 && rowBand !== undefined && Math.abs(u) <= 18) {
            const bar = (u + 40) % 3 === 0 || (y - rowBand) % 2 === 0;
            const frame = Math.abs(u) === 18 || y === rowBand + 1 || y === rowBand + 4;
            c = frame ? PI.lattice : bar ? PI.lattice : PI.paper;
          } else c = (y === arcadeTop || y === wallTop || Math.abs(u) >= 27) ? PI.vermD : PI.wall;
          if (east && z >= 27 && z <= 31) c = y === wallTop ? PI.vermD : PI.wall;
          if (west && z >= 27 && z <= 31) c = y === wallTop ? PI.vermD : PI.wall;
        }
        if (c) set(p, x, y, z, c);
      }
    }
}

function buildArcade(p) {
  const { arcadeTop } = L.lower;
  for (let x = -29; x <= 29; x += 7) {
    const cols = [[x, 30], [x, -30], [30, x], [-30, x]];
    for (const [a, b] of cols) {
      const big = Math.abs(a) === 29 || Math.abs(b) === 29;
      bx(p, a - 1, a + 1, 8, arcadeTop, b - 1, b + 1, big ? PI.vermD : PI.verm);
    }
  }
  for (let x = -28; x <= 28; x += 4) {
    if (Math.abs(x) <= 4) continue;
    bx(p, x, x, 16, 17, 29, 30, PI.vermD);
  }
  for (let x = -28; x <= 28; x++) {
    if (Math.abs(x) <= 5) continue;
    set(p, x, 18, 30, PI.verm);
    set(p, x, 19, 30, PI.verm);
  }
}

function buildFloor(p) {
  for (let x = -31; x <= 31; x++)
    for (let z = -31; z <= 31; z++) {
      if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
      const m = Math.max(Math.abs(x), Math.abs(z));
      set(p, x, 6, z, m >= 28 ? PI.vermD : PI.woodD);
      set(p, x, 7, z, m >= 28 ? PI.verm : PI.wood);
    }
}

function buildBrackets(p, yBase, wallHalf, outHalf) {
  for (let x = -outHalf; x <= outHalf; x += 4)
    for (const zz of [wallHalf - 1, -wallHalf + 1]) {
      if (Math.abs(x) > outHalf) continue;
      bx(p, x, x + 1, yBase, yBase + 1, zz, zz, PI.vermD);
      bx(p, x, x + 1, yBase + 2, yBase + 2, zz, zz, PI.gold);
    }
  for (let z = -outHalf; z <= outHalf; z += 4)
    for (const xx of [wallHalf - 1, -wallHalf + 1]) {
      bx(p, xx, xx, yBase, yBase + 1, z, z + 1, PI.vermD);
      bx(p, xx, xx, yBase + 2, yBase + 2, z, z + 1, PI.gold);
    }
  for (let x = -outHalf; x <= outHalf; x++)
    for (let z = -outHalf; z <= outHalf; z++) {
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m < wallHalf - 1 || m > outHalf) continue;
      set(p, x, yBase + 3, z, m === outHalf ? PI.tileD : PI.wood);
    }
}

function buildRoof(p, y0, y1, r0, r1, segs) {
  const levels = y1 - y0;
  for (let i = 0; i <= levels; i++) {
    const half = r0 - (r0 - r1) * i / levels;
    const h = Math.round(half);
    for (let x = -h - 1; x <= h + 1; x++)
      for (let z = -h - 1; z <= h + 1; z++) {
        const m = Math.max(Math.abs(x), Math.abs(z));
        if (m < h - 1 || m > h) continue;
        const a = azim(x, z);
        let c = PI.tile;
        const seg = Math.floor(((a + 180) / 360) * segs);
        if (seg % 2 === 1) c = PI.tileD;
        if (m === h && i % 2 === 0) c = PI.tileL;
        const corner = Math.abs(Math.abs(x) - Math.abs(z)) <= 1 && m >= h - 1;
        const y = y0 + i + (corner ? 1 : 0);
        set(p, x, y, z, c);
        if (corner && m === h) set(p, x + Math.sign(x), y, z + Math.sign(z), c);
      }
  }
}

function buildGlobRoom(p) {
  const { globRoom: G } = L;
  const gc = L.globe.c;
  const fc = [gc[0] - L.arm.axis[0] * 8 / Math.hypot(...L.arm.axis), gc[1] - L.arm.axis[1] * 8 / Math.hypot(...L.arm.axis), gc[2] - L.arm.axis[2] * 8 / Math.hypot(...L.arm.axis)];
  for (let x = -(G.half + 1); x <= G.half + 1; x++)
    for (let z = -(G.half + 1); z <= G.half + 1; z++)
      for (let y = 70; y <= 71; y++) {
        if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue;
        if (Math.hypot(x - gc[0], y - gc[1], z - gc[2]) < 9.5) continue;
        if (Math.hypot(x - fc[0], y - fc[1], z - fc[2]) < 6.5) continue;
        set(p, x, y, z, PI.woodD);
      }
  for (let x = -25; x <= 25; x++)
    for (let z = -25; z <= 25; z++) {
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m < G.wallIn || m > G.half) continue;
      for (let y = 72; y <= 85; y++) {
        const u = z === 25 || z === -25 ? x : z;
        let c;
        const win = y >= 74 && y <= 83 && Math.abs(u) <= 13;
        if (win) {
          const bar = (u + 40) % 3 === 0 || (y - 74) % 2 === 0;
          const frame = Math.abs(u) === 13 || y === 74 || y === 83;
          c = frame ? PI.lattice : bar ? PI.lattice : PI.paper;
        } else c = (y === 72 || y === 85 || Math.abs(u) >= 22) ? PI.vermD : PI.wall;
        if (z === 25 || z === -25) {
          if (y === 72 || y === 85) c = PI.vermD;
        }
        set(p, x, y, z, c);
      }
    }
  for (const s of [-1, 1])
    for (let t = -1; t <= 1; t++)
      bx(p, s * 23, s * 24, 72, 85, t * 23, t * 24, PI.verm);
}

function buildTerrace(p) {
  const T = L.terrace;
  sqPlate(p, T.half, 94, 97, PI.stoneL, true);
  for (let x = -T.half; x <= T.half; x++)
    for (let z = -T.half; z <= T.half; z++) {
      const m = Math.max(Math.abs(x), Math.abs(z));
      if (m < T.half - 1 || m > T.half) continue;
      if (Math.abs(Math.abs(x) - 20) <= 1 && Math.abs(Math.abs(z) - 20) <= 1) continue;
      if (x % 5 === 0 || z % 5 === 0) {
        set(p, x, 98, z, PI.verm);
        set(p, x, 99, z, PI.verm);
      } else {
        set(p, x, 98, z, PI.vermD);
        set(p, x, 99, z, PI.gold);
      }
    }
}

export function buildTower(cutOn = true) {
  const p = P('tower');
  buildFloor(p);
  buildArcade(p);
  buildWalls(p);
  buildBrackets(p, 54, 31, 38);
  buildRoof(p, 58, 70, 38, 26, 16);
  buildGlobRoom(p);
  buildBrackets(p, 86, 25, 31);
  buildRoof(p, 88, 94, 31, 19, 12);
  buildTerrace(p);
  if (cutOn) applyCuts(p);
  return p;
}

export function applyCuts(p) {
  for (const key of [...p.cells.keys()]) {
    const [x, y, z] = key.split(',').map(Number);
    const mn = Math.max(Math.abs(x), Math.abs(z));
    for (const cut of CUTS) {
      let a = azim(x, z);
      if (a < 0) a += 360;
      let a0 = cut.a0, a1 = cut.a1;
      if (a0 < 0) { if (a >= 360 + a0 || a <= a1) { if (mn < cut.r && y >= cut.y0 && y <= cut.y1) p.cells.delete(key); } }
      else if (a >= a0 && a <= a1 && mn < cut.r && y >= cut.y0 && y <= cut.y1) p.cells.delete(key);
    }
  }
}

export function azimuthDeg(x, z) {
  let a = azim(x, z);
  if (a < 0) a += 360;
  return a;
}
