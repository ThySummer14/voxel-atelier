// A mountain halt: platform + canopy, brick-and-plaster station house with a real
// hanzi nameboard, water tower, coal stage, colour-light signal, platform furniture.

import { M } from '../core/palette.js';
import { hash2, hash3, mulberry32 } from '../core/rng.js';
import { TRACK_Y } from './layout.js';
import { heightAt } from './terrain.js';
import { stampText, measureText } from './glyph.js';

const PX0 = 176, PX1 = 236, PZ0 = 110, PZ1 = 126, PTOP = 76;

export function buildStation(world, hf) {
  const rnd = mulberry32(9090);

  // platform body
  for (let x = PX0; x <= PX1; x++)
    for (let z = PZ0; z <= PZ1; z++) {
      const g = heightAt(hf, x, z);
      for (let y = g; y <= PTOP; y++) world.set(x, y, z, y >= PTOP - 1 ? M.PLATFORM : M.BRICK_D);
      world.set(x, PTOP, z, hash2(x, z) < 0.12 ? M.PLATFORM_E : M.PLATFORM);
    }
  // coping + safety line
  for (let x = PX0; x <= PX1; x++) {
    world.set(x, PTOP, PZ0, M.PLATFORM_E);
    world.set(x, PTOP, PZ0 + 2, M.PLATFORM_L);
    world.set(x, PTOP + 1, PZ0, M.PLATFORM_E);
  }
  // ramp at the country end
  for (let d = 0; d < 8; d++)
    for (let z = PZ0 + 2; z <= PZ1 - 2; z++)
      world.set(PX0 - 1 - d, PTOP - d, z, M.PATH);

  // canopy: posts + pitched roof
  for (const x of [182, 196, 210, 224]) {
    for (let y = PTOP + 1; y <= 88; y++) world.set(x, y, 119, M.WOOD_D);
    world.line(x, 88, 119, x, 86, 113, M.WOOD_D);
    world.line(x, 88, 119, x, 86, 125, M.WOOD_D);
  }
  for (let x = PX0; x <= PX1; x++)
    for (let z = 112; z <= 126; z++) {
      const pitch = Math.round(Math.abs(z - 119) * 0.35);
      world.set(x, 89 - pitch, z, hash2(x, z) < 0.3 ? M.ROOF_D : M.ROOF);
      world.set(x, 90 - pitch, z, M.ROOF_D);
    }
  for (let x = PX0; x <= PX1; x++) { world.set(x, 88, 112, M.WOOD); world.set(x, 88, 126, M.WOOD); }

  // station house
  const BX0 = 182, BX1 = 222, BZ0 = 132, BZ1 = 152;
  for (let x = BX0; x <= BX1; x++)
    for (let z = BZ0; z <= BZ1; z++) {
      const g = heightAt(hf, x, z);
      for (let y = g; y <= 77; y++) world.set(x, y, z, M.BRICK_D);
    }
  for (let x = BX0; x <= BX1; x++)
    for (let z = BZ0; z <= BZ1; z++)
      for (let y = 78; y <= 92; y++) {
        const shell = x === BX0 || x === BX1 || z === BZ0 || z === BZ1;
        if (!shell) { world.set(x, y, z, 0); continue; }
        let id = M.PLASTER;
        if (y <= 80) id = M.BRICK;
        if ((x === BX0 || x === BX1) && (z === BZ0 || z === BZ1)) id = M.BRICK;
        if (y === 92) id = M.BRICK;
        if (hash3(x, y, z) < 0.05) id = M.BRICK_D;
        world.set(x, y, z, id);
      }
  // windows on the track face + door
  for (const wx of [187, 195, 211, 217]) {
    for (let x = wx; x <= wx + 3; x++)
      for (let y = 83; y <= 88; y++) world.set(x, y, BZ0, M.WINDOW);
    for (let x = wx - 1; x <= wx + 4; x++) { world.set(x, 82, BZ0, M.WOOD_D); world.set(x, 89, BZ0, M.WOOD_D); }
  }
  for (let x = 202; x <= 206; x++)
    for (let y = 78; y <= 87; y++) world.set(x, y, BZ0, M.WOOD_D);
  world.set(204, 83, BZ0 - 1, M.BRASS);
  // gable roof
  for (let x = BX0 - 2; x <= BX1 + 2; x++)
    for (let z = BZ0 - 2; z <= BZ1 + 2; z++) {
      const t = Math.abs(z - (BZ0 + BZ1) / 2) / ((BZ1 - BZ0) / 2 + 2);
      const y = Math.round(101 - t * 8);
      world.set(x, y, z, hash2(x, z) < 0.3 ? M.ROOF_D : M.ROOF);
      world.set(x, y - 1, z, M.ROOF_D);
    }
  for (let x = BX0 - 2; x <= BX1 + 2; x++) world.set(x, 102, (BZ0 + BZ1) / 2, M.ROOF_R);
  // chimney
  for (let y = 96; y <= 106; y++) world.box(214, y, 140, 216, y, 142, M.BRICK);
  world.box(213, 107, 139, 217, 107, 143, M.BRICK_D);

  // nameboard with real hanzi
  const name = '秋峡站';
  const m = measureText(name, 24, 2);
  const bw = m.w + 6, bh = m.h + 4;
  const bx = 202 - Math.floor(bw / 2);
  world.box(bx, 93, BZ0 - 1, bx + bw - 1, 93 + bh - 1, BZ0 - 1, M.SIGN_BOARD);
  world.box(bx - 1, 92, BZ0 - 1, bx + bw, 92, BZ0 - 1, M.WOOD_D);
  world.box(bx - 1, 93 + bh, BZ0 - 1, bx + bw, 93 + bh, BZ0 - 1, M.WOOD_D);
  stampText(world, name, bx + 3, 95, BZ0 - 2, M.SIGN_TEXT, { size: 24, px: 2, face: '-z' });

  // platform lamps
  for (const x of [180, 200, 220]) {
    for (let y = PTOP + 1; y <= 86; y++) world.set(x, y, 112, M.LAMP_POST);
    world.box(x - 1, 87, 111, x + 1, 87, 113, M.LAMP_POST);
    world.set(x, 86, 112, M.LAMP_GLOW);
    world.box(x - 1, 88, 111, x + 1, 88, 113, M.LAMP_POST);
  }

  // benches + crates + luggage
  for (const x of [190, 214]) {
    world.box(x, 79, 122, x + 5, 79, 123, M.WOOD);
    world.box(x, 80, 123, x + 5, 82, 123, M.WOOD);
    world.set(x, 78, 122, M.WOOD_D); world.set(x + 5, 78, 122, M.WOOD_D);
  }
  world.box(226, 77, 120, 228, 79, 122, M.WOOD);
  world.box(229, 77, 121, 230, 78, 122, M.WOOD_P);
  world.box(226, 80, 120, 227, 80, 121, M.WOOD_D);
  world.box(184, 77, 116, 186, 78, 118, M.TANK_RUST);

  // water tower
  const wx = 168, wz = 122;
  for (const [dx, dz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]])
    for (let y = 70; y <= 95; y++) world.set(wx + dx, y, wz + dz, M.WOOD_D);
  for (let y = 74; y <= 92; y += 6) {
    world.line(wx - 4, y, wz - 4, wx + 4, y + 3, wz - 4, M.WOOD_D);
    world.line(wx - 4, y, wz + 4, wx + 4, y + 3, wz + 4, M.WOOD_D);
    world.line(wx - 4, y, wz - 4, wx - 4, y + 3, wz + 4, M.WOOD_D);
    world.line(wx + 4, y, wz - 4, wx + 4, y + 3, wz + 4, M.WOOD_D);
  }
  world.cylY(wx, wz, 6, 96, 108, M.TANK_WOOD);
  for (const y of [97, 102, 107]) world.cylY(wx, wz, 6.4, y, y, M.TANK);
  world.cylY(wx, wz, 6.6, 109, 109, M.TANK);
  world.cylY(wx, wz, 4, 110, 111, M.ROOF_D);
  world.cylY(wx, wz, 2, 112, 112, M.ROOF_D);
  // parked spout arm
  world.line(wx + 6, 100, wz, wx + 12, 98, wz - 4, M.TANK);
  world.line(wx + 12, 98, wz - 4, wx + 12, 92, wz - 4, M.TANK);

  // coal stage on the off side
  world.box(176, 70, 82, 186, 74, 88, M.WOOD_D);
  world.box(177, 75, 83, 185, 76, 87, M.COAL);
  for (let i = 0; i < 24; i++) world.set(178 + Math.floor(rnd() * 7), 77, 83 + Math.floor(rnd() * 4), rnd() < 0.3 ? M.COAL_SHINE : M.COAL);
  world.line(186, 74, 85, 192, 71, 85, M.WOOD);

  // colour-light signal at the bridge approach
  const sx = 242, sz = 112;
  for (let y = 71; y <= 95; y++) world.set(sx, y, sz, M.LAMP_POST);
  world.box(sx - 1, 96, sz - 1, sx + 1, 101, sz + 1, M.LAMP_POST);
  world.set(sx, 99, sz - 2, M.SIGNAL_R);
  world.set(sx, 97, sz - 2, M.SIGNAL_G);
  world.box(sx - 1, 102, sz - 1, sx + 1, 102, sz + 1, M.LAMP_POST);
  for (let y = 74; y <= 94; y += 3) world.set(sx + 1, y, sz, M.LAMP_POST);

  // fence along the platform back + a footpath
  for (let x = PX0; x <= PX1; x += 3) world.box(x, 77, 128, x, 80, 128, M.FENCE);
  world.box(PX0, 79, 128, PX1, 79, 128, M.FENCE);
  for (let x = 150; x <= 176; x++) world.set(x, heightAt(hf, x, 130) + 1, 130, M.PATH);
}