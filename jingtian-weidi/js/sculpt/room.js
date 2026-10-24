// 工坊环境：地面、墙（下段砖砌 + 上段灰泥）、木柱、左墙窗、檐枋、灯架
import { PAL } from '../voxel.js';
import { ROOM, GRID } from '../spec.js';

const C = (k) => PAL.idx[k];
function hash(x, y, z) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const wallTone = (x, y, z) => {
  if (y < 10) return brickTone(x, y, z);
  const t = hash(Math.floor(x / 13), Math.floor(y / 17), Math.floor(z / 13));
  return t < 0.62 ? C('wood.plaster') : C('wood.plaster2');
};
const brickTone = (x, y, z) => (hash(x, Math.floor(y / 5), Math.floor(z / 2)) < 0.55 ? C('wood.brick') : C('wood.brick2'));

export function buildFloor(v) {
  v.begin('floor');
  const X0 = GRID.x0 + 1, X1 = GRID.x0 + GRID.nx - 2;
  const Z0 = ROOM.wallZ, Z1 = GRID.z0 + GRID.nz - 2;
  for (let z = Z0; z <= Z1; z++) {
    const band = Math.floor((z + 4096) / 15);
    const seam = ((z + 4096) % 15) === 1;
    for (let x = X0; x <= X1; x++) {
      const seg = Math.floor((x + 4096) / 41);
      const t = hash(seg, 0, band);
      let c;
      if (seam) c = C('wood.dark');
      else if (t < 0.52) c = C('wood.mid');
      else if (t < 0.80) c = C('wood.light');
      else c = C('wood.bamboo');
      for (let y = ROOM.floorSlab; y <= -1; y++) v.set(x, y, z, y <= -2 ? C('wood.dark') : c);
    }
  }
}

export function buildWalls(v) {
  const W = ROOM.wallThick, T = ROOM.wallTop;
  const x0 = GRID.x0 + 1, x1 = GRID.x0 + GRID.nx - 2;
  const z0 = ROOM.wallZ, z1 = GRID.z0 + GRID.nz - 2;
  v.begin('wall');
  for (const s of [-1, 1]) {
    for (let z = z0; z <= z1; z++) {
      for (let k = 0; k < W; k++) {
        const xx = s * (ROOM.wallX + k);
        for (let y = 0; y < T; y++) v.set(xx, y, z, wallTone(xx, y, z));
      }
    }
  }
  for (let x = x0; x <= x1; x++) {
    for (let z = z0 - W + 1; z <= z0; z++) {
      for (let y = 0; y < T; y++) v.set(x, y, z, wallTone(x, y, z));
    }
  }
  v.begin('wall.beam');
  for (let z = z0; z <= z1; z++) {
    for (const s of [-1, 1]) for (let k = -1; k <= W; k++) {
      const xx = s * (ROOM.wallX + k);
      for (let y = T; y < T + 5; y++) v.set(xx, y, z, C('wood.dark'));
    }
  }
  for (let x = x0; x <= x1; x++) for (let z = z0 - W; z <= z0 + 1; z++) for (let y = T; y < T + 5; y++) v.set(x, y, z, C('wood.dark'));
  v.begin('wall.post');
  for (const px of [-118, -42, 42, 118]) {   // 别在织机正后方立柱
    for (let x = px - 3; x <= px + 3; x++) {
      for (let z = z0; z <= z0 + 3; z++) for (let y = 0; y < T + 5; y++) v.set(x, y, z, C('wood.dark'));
    }
  }
  for (const s of [-1, 1]) {
    for (const pz of [-64, -4, 52]) {
      for (let z = pz - 3; z <= pz + 3; z++) {
        for (let k = 0; k <= 3; k++) {
          const xx = s * (ROOM.wallX + k);
          for (let y = 0; y < T + 5; y++) v.set(xx, y, z, C('wood.dark'));
        }
      }
    }
  }
}

export function buildWindowLeft(v) {
  const z0 = -24, z1 = 36, y0 = 44, y1 = 88;
  const xf = -ROOM.wallX;
  v.begin('window');
  for (let x = xf - 3; x <= xf + 1; x++) v.clearBox(x, y0, z0, x, y1, z1);
  v.begin('window.frame');
  v.box(xf - 1, y0 - 4, z0 - 4, xf + 1, y1 + 4, z1 + 4, C('wood.dark'), (x, y, z) =>
    !(y >= y0 && y <= y1 && z >= z0 && z <= z1));
  v.begin('window.sky');
  for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) {
    for (let x = xf - 4; x <= xf - 3; x++) v.set(x, y, z, C('wood.night'));
  }
  v.begin('window.lattice');
  for (let z = z0; z <= z1; z++) {
    if ((z - z0) % 6 === 0) for (let y = y0; y <= y1; y++) v.set(xf, y, z, C('wood.ink'));
  }
  for (let y = y0; y <= y1; y++) {
    if ((y - y0) % 6 === 0) for (let z = z0; z <= z1; z++) v.set(xf, y, z, C('wood.ink'));
  }
  for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) {
    if ((z - z0) % 6 === 0 || (y - y0) % 6 === 0) continue;
    if (((z + y) % 12 === 0) || ((z - y + 2400) % 12 === 0)) v.set(xf, y, z, C('wood.ink'));
  }
}

// 落地铜灯：三足底座 → 八棱柱身 → 铜灯盘 → 灯芯（火焰为动态件）
export function buildLampStand(v, pos) {
  const [lx, ly, lz] = pos;          // ly = 灯芯处高度
  const bowlTop = ly - 2, bowlBot = ly - 9, footY = 2;
  v.begin('lamp.stand');
  // 三足
  for (const [dx, dz] of [[-13, -8], [13, -8], [0, 14]]) {
    for (let s = 0; s <= 18; s++) {
      const t = s / 18;
      const x = Math.round(lx + dx * (1 - t) * (1 - t));
      const z = Math.round(lz + dz * (1 - t) * (1 - t));
      const y = Math.round(footY + 5 * (1 - t) * (1 - t));
      v.set(x, y, z, C('wood.brass'));
      v.set(x, y + 1, z, C('wood.brass'));
    }
  }
  // 底座盘
  v.cyl(1, footY + 2, footY + 4, lx, lz, 11, C('wood.brass'), (x, y, z, a, u, w) =>
    a === footY + 4 ? Math.hypot(u + 0.5 - lx, w + 0.5 - lz) > 5 : true);
  // 柱身（八棱，带三处箍）
  for (let y = footY + 5; y <= bowlBot; y++) {
    const r = 2.5 + ((y % 18) < 3 ? 1 : 0);
    v.cyl(1, y, y, lx, lz, r, C('wood.brass'), (x, y2, z, a, u, w) => {
      const du = Math.abs(u + 0.5 - lx), dw = Math.abs(w + 0.5 - lz);
      return du < 2.2 || dw < 2.2 || du + dw < 3.4;
    });
  }
  // 灯盘
  v.begin('lamp.bowl');
  v.cyl(1, bowlBot, bowlTop, lx, lz, 11.5, C('wood.brass'), (x, y, z, a, u, w) => {
    const d = Math.hypot(u + 0.5 - lx, w + 0.5 - lz);
    if (a === bowlTop) return d > 4.5;
    if (a === bowlBot) return true;
    return d > 7.5;
  });
  v.begin('lamp.oil');
  v.cyl(1, bowlTop - 1, bowlTop - 1, lx, lz, 8.5, C('wood.brass'));
  v.begin('lamp.flame', { emissive: true, pivot: [lx, bowlTop + 1, lz] });
  v.ball(lx, bowlTop + 4, lz, 3.4, C('emissive.lamp'), (x, y, z, d) => y >= bowlTop + 1);
}

// 屋顶：前半露天（天井），后半覆瓦望板——既给织机遮荫，又让月光洒进前厅
export function buildCeiling(v) {
  const z0 = GRID.z0 + 1, z1 = 22;              // 只覆织机后段；前庭露天（天井）
  const x0 = GRID.x0 + 1, x1 = GRID.x0 + GRID.nx - 2;
  v.begin('ceil.board');
  for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
    v.set(x, 152, z, C('wood.dark')); v.set(x, 153, z, C('wood.dark'));
  }
  v.begin('ceil.rafter');
  for (let x = -140; x <= 136; x += 8) {
    for (let dx = 0; dx < 2; dx++) for (let z = z0; z <= z1; z++) {
      v.set(x + dx, 150, z, C('wood.mid')); v.set(x + dx, 151, z, C('wood.mid'));
    }
  }
  v.begin('ceil.beam');
  for (let z = -100; z <= z1; z += 44) {
    for (let dz = -3; dz <= 3; dz++) for (let x = x0; x <= x1; x++) {
      for (let y = 147; y <= 149; y++) v.set(x, y, z + dz, C('wood.dark'));
    }
  }
  v.begin('ceil.rim');                          // 檐口（屋面到此为止）
  for (let x = x0; x <= x1; x++) for (let z = z1 - 2; z <= z1 + 1; z++) for (let y = 148; y <= 155; y++) {
    v.set(x, y, z, C('wood.dark'));
  }
}

// 后墙木门（关闭）：门框 + 门板 + 门钉
export function buildDoor(v) {
  const zf = ROOM.wallZ + 1, x0 = 40, x1 = 98, y1 = 100;
  v.begin('door.frame');
  v.box(x0 - 4, 0, zf, x1 + 4, y1 + 4, zf + 2, C('wood.dark'), (x, y, z) =>
    !(x >= x0 && x <= x1 && y <= y1));
  v.begin('door.panel');
  v.box(x0, 0, zf, x1, y1, zf, C('wood.mid'), (x, y, z) => ((x + 4096) % 19) !== 0 && (y % 17) !== 0);
  v.begin('door.stud');
  for (let y = 12; y <= 88; y += 19) for (let x = x0 + 10; x <= x1 - 10; x += 19) {
    v.box(x - 1, y - 1, zf + 1, x, y, zf + 1, C('wood.brass'));
  }
  v.begin('door.ring');
  v.ball((x0 + x1) / 2 + 16, 46, zf + 2, 3.2, C('wood.brass'), (x, y, z, d) => d > 2.0 && z >= zf + 1);
}
// 右墙布架：三层格，放着卷好的锦
export function buildClothShelf(v) {
  const x0 = ROOM.wallX - 2, zc = 6, z0 = zc - 44, z1 = zc + 44;
  v.begin('shelf');
  for (const y of [26, 62, 98]) {
    v.box(x0 - 16, y, z0, x0, y + 3, z1, C('wood.mid'), (x, y2, z) => y2 === y + 2 || ((z + 4096) % 31) < 3);
  }
  for (const z of [z0 + 2, z1 - 2]) {
    v.box(x0 - 16, 0, z - 3, x0, 120, z + 3, C('wood.dark'));
  }
  // 架上卷锦（用固定丝色，像已织好的存货）
  const cols = ['crimson2', 'azure2', 'indigo2', 'gold', 'jade', 'verm'];
  for (let k = 0; k < 6; k++) {
    const y = [30, 66, 102][k % 3], z = z0 + 12 + (k * 26) % 66;
    const c = C('silk.' + cols[k]);
    for (let dz = 0; dz < 12; dz++) {
      for (let dyy = 0; dyy < 9; dyy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, 20 - (dyy - 4.5) * (dyy - 4.5)))) * 2;
        if (dx < 1) continue;
        v.box(x0 - 14 - dx, y + dyy, z + dz, x0 - 12 - dx, y + dyy + 1, z + dz + 1, c);
      }
    }
  }
}
