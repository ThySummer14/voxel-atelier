import { dish } from './lander.mjs';
import { hash, material as M, stamp, Volume } from './voxels.mjs';

function rover() {
  const v = new Volume([46, 31, 48], [-23, 0, -24]);
  for (const x of [-8, 8]) v.box(x - 1, 5, -17, x + 1, 6, 17, M.alloy);
  v.box(-8, 5, -11, 8, 5, 13, M.graphite[2]);
  for (let z = -14; z < 15; z += 4) {
    v.rod([-9, 6, z], [9, 6, z], M.alloy[1]);
    v.rod([-9, 4, z], [9, 4, z + 4], M.rib[2]);
  }

  // Wire-mesh wheels with chevron treads, raised hubs and orange fenders.
  for (const side of [-1, 1]) {
    const cx = side * 10;
    for (const cz of [-11, 11]) {
      const cy = 4;
      v.rod([side * 5, 7, cz - 2], [cx, cy, cz], M.rib, 2);
      v.rod([side * 6, 6, cz + 3], [cx, cy, cz], M.alloy[1]);
      for (let y = 0; y <= 10; y++) {
        for (let z = cz - 7; z <= cz + 7; z++) {
          const d = Math.hypot(y - cy, z - cz);
          for (let x = cx - 2; x <= cx + 2; x++) {
            if (d > 4.8) continue;
            const tread = (z + y + Math.abs(x - cx)) % 3 === 0;
            if (d > 3.12) {
              v.set(x, y, z, tread ? M.wire[1] : M.wire[2]);
            } else if (Math.abs(x - cx) >= 1) {
              v.set(x, y, z, d < 1.7 ? M.alloy[3] : M.rib[2]);
            }
          }
          if (d >= 5.25 && d < 6.55 && y > 4) {
            v.box(cx - 2, y, z, cx + 2, y, z, M.orange);
            v.set(cx + side * 3, y, z, M.copper[1]);
          }
        }
      }
      v.set(cx + side * 3, cy, cz, M.graphite[1]);
    }
  }

  for (const x of [-4, 4]) {
    v.box(x-2, 7, -5, x+2, 7, 2, M.fabric);
    v.box(x-2, 8, -6, x+2, 9, -5, M.ceramic);
    v.box(x-2, 10, -7, x+2, 13, -6, M.fabric);
    for (const s of [-1, 1]) {
      v.rod([x + 3*s, 7, 2], [x + 3*s, 14, -7], M.alloy[3]);
      v.rod([x + 3*s, 7, -5], [x + 3*s, 13, -6], M.rib[1]);
    }
    v.rod([x - 2, 8, 1], [x + 2, 10, -6], M.graphite[2]);
  }

  v.box(-2, 7, 4, 2, 10, 6, M.alloy[0]);
  v.box(-2, 11, 4, 2, 11, 6, M.dark[0]);
  for (const x of [-1, 1]) v.set(x, 11, 5, M.white[3]);
  v.rod([0, 11, 6], [0, 14, 6], M.alloy[2]);
  v.rod([-1, 14, 6], [1, 14, 6], M.dark[1]);
  v.box(-7, 7, 8, 7, 8, 14, M.alloy);
  v.box(-5, 9, 9, -2, 11, 14, M.ceramic);
  v.box(1, 9, 9, 6, 11, 14, M.alloy[2]);
  v.box(2, 10, 14, 5, 12, 15, M.dark);
  v.box(3, 11, 16, 4, 12, 16, M.glass[2]);
  v.rod([6, 9, 12], [7, 23, 13], M.alloy[1], 2);
  dish(v, [7, 23, 13], [.42, .7, .56], 5.8, M.wire);
  v.rod([-6, 11, 11], [-6, 23, 9], M.alloy[3]);
  for (const [x, y, z] of [[-10, 24, 10],[-3, 23, 10],[-6, 23, 5]]) {
    v.rod([-6, 20, 9], [x, y, z], M.rib[1]);
    v.rod([x, y, z], [-6, 27, 9], M.paleGold[3]);
  }

  v.box(-7, 7, -16, 7, 8, -9, M.graphite);
  v.box(-6, 9, -15, -1, 11, -10, M.gold);
  v.box(1, 9, -15, 6, 12, -10, M.ceramic);
  v.rod([5, 10, -16], [5, 13, -10], M.copper[1]);
  v.rod([6, 9, -16], [8, 17, -19], M.alloy);
  v.box(7, 16, -20, 9, 17, -18, M.graphite);
  v.rod([-6, 9, -16], [-7, 18, -18], M.rib[0]);
  return v;
}

function astronaut({ commander = false, working = false } = {}) {
  const v = new Volume([25, 25, 21], [-12, 0, -10]);
  const suit = M.white;
  for (const side of [-1, 1]) {
    const step = side === 1 ? 2 : -1;
    v.box(side*2 - 1, 0, step - 2, side*2 + 1, 1, step + 3, M.rib);
    v.box(side*2 - 1, 2, step - 1, side*2 + 1, 3, step + 2, suit);
    v.rod([side*2 - 1, 3, step - 1], [side*2 - 1, 9, -1], suit, 3);
    v.rod([side*2 - 1, 4, step + 2], [side*2 + 1, 4, step + 2], M.fabric);
    for (let y = 5; y <= 8; y += 2) v.set(side*3, y, 1, M.ceramic[2]);
  }
  v.ellipsoid(0, 11, 0, 4.2, 4.7, 2.6, suit);
  v.box(-3, 9, -2, 3, 15, 1, suit);
  v.box(-3, 10, -5, 3, 16, -2, M.ceramic);
  v.box(-2, 11, -6, 2, 16, -6, M.alloy);
  v.box(-3, 16, -5, 3, 17, -3, M.white);
  v.rod([-3, 10, -6], [-3, 16, -6], M.rib[1]);
  v.rod([3, 11, -5], [3, 11, 3], M.graphite[1]);
  v.box(-2, 11, 3, 2, 14, 4, M.ceramic);
  v.set(-1, 13, 5, M.red[0]);
  v.set(1, 13, 5, M.blue[1]);
  v.rod([-2, 10, 3], [2, 10, 3], M.fabric);

  for (const side of [-1, 1]) {
    const reach = working && side === 1;
    const elbow = [side * (reach ? 6 : 5), reach ? 12 : 10, reach ? 1 : 0];
    const hand = [side * (reach ? 8 : 5), reach ? 11 : 8, reach ? 4 : 2];
    v.rod([side * 3, 14, -1], elbow, suit, 2);
    v.rod(elbow, hand, suit, 2);
    v.box(hand[0], hand[1], hand[2], hand[0] + 1, hand[1] + 1, hand[2] + 1, M.rib[1]);
    if (commander) v.box(side * 4, 13, -1, side * 4, 14, 1, M.red);
  }
  v.ellipsoid(0, 17.3, .15, 3.75, 3.75, 3.4, suit);
  for (let y = 16; y <= 19; y++) {
    for (let x = -3; x <= 3; x++) {
      if (Math.abs(x) + Math.abs(y - 18) > 4) continue;
      const z = Math.abs(x) === 3 ? 3 : 4;
      const shade = y === 19 ? 1 : y === 18 ? 0 : y === 17 ? 2 : 3;
      v.set(x, y, z, M.visor[shade]);
    }
  }
  v.set(-1, 18, 4, M.visor[4]);
  v.set(-2, 19, 4, M.visor[3]);
  return v;
}

function flag(v, x0, z0) {
  v.rod([x0, 0, z0], [x0, 28, z0], M.paleGold[2]);
  v.rod([x0, 27, z0], [x0 + 21, 27, z0 + 1], M.alloy[2]);
  for (let x = 1; x <= 21; x++) {
    for (let y = 14; y <= 26; y++) {
      if (y < 14 + Math.round(Math.sin(x * .29) * 1.15)) continue;
      const z = Math.round(1.2 * Math.sin(x * .54 + (26 - y) * .27) * (26 - y) / 10 + x / 19);
      const field = x < 10 && y > 19;
      let color = (y % 2 === 0 ? M.red : M.ceramic);
      if (field) color = (x + y % 2) % 3 === 0 && y % 2 === 0 ? M.white[0] : M.blue;
      v.set(x0 + x, y, z0 + z, color);
      if (x > 1 && y < 25 && hash(x, y, z) < .05) v.set(x0 + x, y, z0 + z, field ? M.blue[0] : color);
    }
  }
}

function fieldEquipment(v) {
  const [x, z] = [-77, 17];
  // Small instrument group with buried cable, ribbed power source and tripod.
  v.box(x - 5, 1, z - 4, x + 5, 4, z + 4, M.graphite);
  v.box(x - 5, 5, z - 4, x + 5, 5, z + 4, M.paleGold);
  for (let k = -3; k < 5; k += 2) v.rod([x-6, 1, z+k], [x-6, 4, z+k], M.alloy[2]);
  for (const [dx, dz] of [[0, 5], [-4, -4], [4, -4]]) {
    v.rod([x + 9, 6, z + 2], [x + 9 + dx, 0, z + 2 + dz], M.alloy[1]);
  }
  v.box(x + 8, 6, z + 1, x + 11, 8, z + 3, M.ceramic);
  v.rod([x + 9, 8, z + 2], [x + 9, 13, z + 2], M.alloy[2]);
  dish(v, [x + 9, 13, z + 2], [.4, .6, .72], 3, M.alloy);
  v.rod([x + 5, 0, z], [x + 9, 0, z - 4], M.copper[2]);
  v.rod([x + 9, 0, z - 4], [x + 16, 0, z - 3], M.copper[2]);

  const px = -3;
  const pz = 51;
  for (const [dx, dz] of [[0, 3], [-3, -2], [3, -2]]) {
    v.rod([px, 5, pz], [px + dx, 0, pz + dz], M.alloy[1]);
  }
  v.box(px - 1, 5, pz - 1, px + 1, 7, pz + 1, M.rib);
  v.set(px + 1, 7, pz + 2, M.glass[0]);
}

export function buildExpedition(v) {
  stamp(v, rover(), 39, 1, 18, .29);
  stamp(v, astronaut({ commander: true }), -16, 1, 41, .57);
  stamp(v, astronaut({ working: true }), 55, 1, 17, -.48);
  flag(v, 6, 40);
  fieldEquipment(v);
}
