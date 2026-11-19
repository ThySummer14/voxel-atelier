import { beacon, container, palette as p, pick, prng, stencil, SWATCHES, voxelBeam } from './voxel.mjs';

export const QUAY_Y = 2.80;
export const TRANSFER = {
  z: 45, shipX: 76, shipY: 12.12, truckX: 111, truckY: 4.15, clearY: 25.8, railY: 31.05,
};

function slab(blocks, x, z, w, d) {
  blocks.box(x, -5.5, z, w, 2, d, '#384b50');
  blocks.box(x, -3.5, z, w, 3.95, d, p.dockDark);
  blocks.box(x, .45, z, w, 1.80, d, p.concrete);
  blocks.box(x, 2.25, z, w, .55, d, '#666363');
}

function quayEdge(blocks, x, side, start, end) {
  const random = prng(8119 + start);
  const edge = (out) => x + side * out;
  blocks.box(Math.min(x, edge(.72)), 2.47, start, .72, .43, end - start, p.coping);
  for (let z = start + 1; z + 2 < end; z += 3.5) {
    const color = pick(['#8e8377', '#8b7d6b', '#9a8b77', '#756b61'], random);
    const j = random() * .24;
    blocks.box(Math.min(x, edge(.19)), -1.0 + j, z, .19, 3.41 - j, 3.41, color);
    blocks.box(Math.min(x, edge(.20)), .12 + j, z, .20, .30, 3.41, '#5c5751');
  }
  for (let z = start + 5; z < end - 2; z += 7) {
    blocks.box(Math.min(edge(.1), edge(1.0)), -.65, z, .9, 2.6, 1.15, p.rubber);
    blocks.box(Math.min(edge(.62), edge(1.08)), -.25, z + .16, .46, 1.85, .83, '#323b3e');
    const bollard = x - side * 1.25;
    blocks.box(bollard - .40, 2.82, z + 1.7, .8, .13, .8, p.dockDark);
    blocks.box(bollard - .17, 2.95, z + 1.93, .34, .44, .34, p.yellow);
    blocks.box(bollard - .35, 3.36, z + 1.79, .7, .14, .62, p.yellow);
  }
}

function roadway(blocks, x, z, w, d, { cross = false, dashed = true } = {}) {
  blocks.box(x, QUAY_Y, z, w, .037, d, p.road);
  if (cross) {
    blocks.box(x, QUAY_Y + .035, z + .56, w, .025, .13, '#b9a991');
    blocks.box(x, QUAY_Y + .035, z + d - .69, w, .025, .13, '#b9a991');
    if (dashed) for (let at = x + 1; at < x + w - 2; at += 7) {
      blocks.box(at, QUAY_Y + .035, z + d / 2, 3.6, .025, .14, p.stripe);
    }
  } else {
    for (const edge of [x + .55, x + w - .68]) {
      blocks.box(edge, QUAY_Y + .035, z, .13, .025, d, '#a79171');
    }
    if (dashed) for (let at = z + 1; at < z + d - 2; at += 7) {
      blocks.box(x + w / 2, QUAY_Y + .035, at, .14, .025, 3.6, p.stripe);
    }
  }
}

function lamp(blocks, pools, x, z, y = QUAY_Y, height = 10.3, cold = false) {
  const color = cold ? p.ice : p.amber;
  blocks.box(x - .29, y, z - .29, .58, .20, .58, p.concrete);
  blocks.box(x - .12, y + .18, z - .12, .24, height, .24, p.steel);
  for (const arm of [-1, 1]) {
    const offset = x + arm * 1.44;
    blocks.box(Math.min(x, offset), y + height - .22, z - .09, 1.44, .20, .18, p.steel);
    blocks.box(offset - .35, y + height - .40, z - .22, .70, .16, .44, color, .9);
    blocks.box(offset - .41, y + height - .27, z - .25, .82, .20, .50, p.graphite);
  }
  pools.push({ x, z, y: y + .10, w: height * 2.6, d: height * 1.7, color, strength: .42 });
}

function quayCrane(blocks, x, z, face, { scale = 1, raised = false, noCart = false } = {}) {
  const y = QUAY_Y;
  const body = scale < 1 ? '#546c71' : p.red;
  const shade = scale < 1 ? '#384d57' : p.redDark;
  const highlight = scale < 1 ? '#819b98' : p.redLight;
  const pos = (u, v, w) => [x + u * scale * face, y + v * scale, z + w * scale];
  const box = (u, v, w, a, b, c, color, glow = 0) => {
    const [px, py, pz] = pos(u, v, w);
    blocks.box(face === 1 ? px : px - a * scale, py, pz, a * scale, b * scale, c * scale, color, glow);
  };
  const brace = (a, b, thickness, color, step = .5) => {
    voxelBeam(blocks, pos(...a), pos(...b), thickness * scale, color, step * scale);
  };

  for (const edge of [-6.1, 6.1]) {
    for (const leg of [-9, 9]) {
      box(leg - 1.14, .08, edge - 1.66, 2.28, 1.24, 3.32, shade);
      box(leg - .93, 1.22, edge - .81, 1.86, 13.5, 1.62, body);
      box(leg - .78, 2.0, edge - .89, .19, 12.6, .16, highlight);
      for (const offset of [-1.35, .83]) box(leg - .70, .10, edge + offset, 1.40, .73, .60, p.graphite);
      box(leg - .75, .57, edge - 1.69, 1.50, .53, .36, p.yellow);
    }

    box(-10, 13.58, edge - .91, 20, 1.56, 1.82, body);
    brace([-9, 14.9, edge], [-5.7, 28.9, edge * .49], 1.14, body);
    brace([9, 14.9, edge], [6.2, 28.9, edge * .49], 1.22, body);
    brace([-9, 8.3, edge], [-3.3, 14.5, edge], .55, shade);
    brace([9, 8.3, edge], [3.3, 14.5, edge], .55, shade);
  }

  for (const leg of [-9, 9]) {
    box(leg - .88, 12.86, -7.05, 1.76, 1.77, 14.10, shade);
    brace([leg, 7.1, -6.1], [leg, 13.8, -.4], .54, body);
    brace([leg, 7.1, 6.1], [leg, 13.8, .4], .54, body);
  }

  // Backreach, machinery house and the luffing hinge above the quay.
  box(-24.5, 28.15, -3.68, 41.0, 1.45, 7.36, shade);
  box(-24.5, 29.55, -3.64, 41.0, .46, 7.28, body);
  box(-21.6, 30, -3.52, 10.4, 4.04, 7.04, p.zinc);
  box(-21.9, 33.98, -3.82, 11.0, .46, 7.64, highlight);
  box(-21.0, 31.30, -3.61, 3.18, 1.83, .15, p.graphite);
  box(-16.5, 31.30, -3.61, 3.7, 1.50, .15, '#6e817d');
  for (const w of [-3.5, 3.5]) {
    brace([-8.8, 29.7, w], [-1.6, 47.7, w * .45], .81, body);
    brace([12.0, 29.7, w], [-1.6, 47.7, w * .45], .81, body);
    brace([-21, 34.0, w], [-1.6, 47.7, w * .45], .34, shade, .32);
    box(8.22, 22.5, w * .78 - .22, .8, 5.25, .44, body);
  }
  box(-2.15, 47.45, -2.02, 1.15, .82, 4.04, highlight);
  box(-1.80, 48.10, -.28, .56, 1.16, .56, p.steel);
  box(-1.88, 49.22, -.38, .73, .37, .73, p.marker, .82);
  box(9.18, 24.1, -1.91, 3.78, 3.16, 3.82, p.zinc);
  box(12.94, 25.20, -1.81, .16, 1.54, 3.61, p.window);
  box(9.44, 25.20, 1.91, 3.38, 1.54, .16, p.window);
  box(9.05, 27.19, -2.14, 4.14, .28, 4.28, highlight);
  for (let rung = 3; rung < 28; rung += .76) box(-9.88, rung, 6.96, .76, .115, .16, p.zinc);

  const tip = raised ? [30, 65] : [60, 29];
  const [, boomEndY] = tip;
  const boomProfile = (t, w, high = false) => [
    15.5 + (tip[0] - 15.5) * t,
    29 + (boomEndY - 29) * t + (high ? 2.5 : 0),
    w,
  ];
  for (const w of [-2.7, 2.7]) {
    brace(boomProfile(0, w), boomProfile(1, w), .69, shade);
    brace(boomProfile(0, w, true), boomProfile(1, w, true), .54, highlight);
    brace([-1.6, 47.7, w * .63], boomProfile(.60, w, true), .28, p.steel, .25);
    brace([-1.6, 47.7, w * .63], boomProfile(.88, w, true), .24, shade, .25);
    const segments = raised ? 7 : 11;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      brace(boomProfile(t, w), boomProfile((i + 1) / segments, w, true), .27, body, .29);
      brace(boomProfile(t, w), boomProfile(t, w, true), .36, body, .32);
      if (i % 2 === 0) {
        const [u, v] = boomProfile(t + .025, 0);
        box(u, v - .55, w - .23, .66, .17, .46, p.amber, .8);
      }
    }
  }
  box(tip[0] - .46, tip[1] - .31, -3.16, .94, 1.0, 6.32, body);
  box(tip[0] - .49, tip[1] + .68, -.40, .78, .29, .80, p.marker, .82);

  if (!noCart && !raised) {
    box(32.3, 27.72, -2.85, 3.0, 1.0, 5.70, p.graphite);
    for (const u of [32.6, 35.0]) {
      box(u, 23.52, -.95, .11, 4.2, .11, p.steel);
      box(u, 23.52, .95, .11, 4.2, .11, p.steel);
    }
    box(32.1, 23.25, -1.34, 3.62, .41, 2.68, p.yellow);
  }
}

function yardCrane(blocks, x, z, width, y = QUAY_Y) {
  const d = 9.6;
  for (const dx of [0, width]) {
    for (const dz of [0, d]) {
      blocks.box(x + dx - .65, y + .76, z + dz - .55, 1.30, 10.8, 1.10, p.gantry);
      blocks.box(x + dx - .84, y + .15, z + dz - 1.2, 1.68, 1.15, 2.40, p.graphite);
      blocks.box(x + dx - .90, y + 1.18, z + dz - .97, 1.80, .41, 1.94, p.gantryLight);
    }
    blocks.box(x + dx - .60, y + 9.95, z - .55, 1.20, 1.25, 10.7, p.gantry);
    voxelBeam(blocks, [x + dx, y + 6.3, z], [x + dx, y + 10.4, z + 3.8], .45, p.gantry, .38);
    voxelBeam(blocks, [x + dx, y + 6.3, z + d], [x + dx, y + 10.4, z + d - 3.8], .45, p.gantry, .38);
  }
  for (const dz of [0, d]) {
    blocks.box(x - .71, y + 10.55, z + dz - .65, width + 1.42, 1.32, 1.30, p.gantry);
    blocks.box(x - .73, y + 11.80, z + dz - .68, width + 1.46, .22, 1.36, p.gantryLight);
  }
  blocks.box(x + width * .64 - 1.3, y + 10.75, z - .92, 2.6, .68, 11.44, p.redDark);
  blocks.box(x + width - 2.13, y + 8.76, z + d - 1, 2.25, 1.84, 2.43, p.zinc);
  blocks.box(x + width - 1.93, y + 9.47, z + d + 1.427, 1.78, .88, .08, p.window);
  for (const u of [x + .8, x + width - .8]) {
    blocks.box(u, y + 10.48, z + d - .25, .65, .16, .51, p.amber, .85);
  }
}

function stacks(blocks, x, z, columns, rows, schemeOrder, seed, close = true) {
  const random = prng(seed);
  const w = (columns - 1) * 2.84 + 3.02;
  const d = (rows - 1) * 6.52 + 6.54;
  blocks.box(x - .20, QUAY_Y, z - .35, w + .20, .043, d + .70, '#555656');
  for (let i = 0; i <= columns; i++) {
    blocks.box(x - .21 + i * 2.84, QUAY_Y + .04, z - .32, .105, .03, d + .64, '#847968');
  }
  blocks.box(x - .25, QUAY_Y + .045, z - .4, w + .34, .04, .14, p.yellow);
  blocks.box(x - .25, QUAY_Y + .045, z + d + .22, w + .34, .04, .14, p.yellow);
  for (let row = 0; row < rows; row++) {
    const main = schemeOrder[row % schemeOrder.length];
    for (let col = 0; col < columns; col++) {
      if (random() < .105 && col !== 0) continue;
      const height = 1 + Math.floor(random() * (row % 2 === 0 ? 4 : 3));
      for (let layer = 0; layer < height; layer++) {
        const scheme = random() < .68 ? main : pick(schemeOrder, random);
        container(blocks, x + col * 2.84, QUAY_Y + .06 + layer * 2.44, z + row * 6.52, 6.17, SWATCHES[scheme], {
          ribs: close && (col === 0 || layer === height - 1 || row === rows - 1),
          lettering: close && col === 0 && layer === height - 1 && row % 3 === 0 ? 'KWT' : '',
        });
      }
    }
  }
}

function shed(blocks, pools, x, z, w, d, sign, seed) {
  const y = QUAY_Y;
  const random = prng(seed);
  blocks.box(x - 1, y, z - 1.5, w + 2, .50, d + 3.0, '#888079');
  blocks.box(x, y + .5, z, w, 8.0, d, '#777f7c');
  blocks.box(x, y + 6.9, z, w, 1.86, d, '#95a19a');
  blocks.box(x, y + 1.4, z, w, .65, d, '#845951');
  for (let part = 0; part < 5; part++) {
    const inset = part * .90;
    blocks.box(x - .52 + inset, y + 8.55 + part * .37, z - 1.0, w + 1.04 - inset * 2, .41, d + 2, part % 2 === 0 ? '#afb4a8' : '#a0a69c');
  }
  for (let strip = 1.2; strip < d - .4; strip += 2.40) {
    blocks.box(x + 4.0, y + 10.43, z + strip, w - 8.0, .12, .19, '#777f7e');
  }
  for (let bay = 2.0; bay < d - 5.0; bay += 7) {
    blocks.box(x - .11, y + .42, z + bay, .30, 4.84, 4.70, p.graphite);
    for (let v = 1.36; v < 5; v += .47) {
      blocks.box(x - .18, y + v, z + bay + .19, .09, .26, 4.34, '#636d6c');
    }
    blocks.box(x - .32, y + 5.39, z + bay - .18, .48, .23, 5.04, p.zinc);
    if (random() < .68) {
      blocks.box(x - .44, y + 5.22, z + bay + 1.60, .21, .18, 1.10, p.amber, .74);
      pools.push({ x: x - 2.7, z: z + bay + 2.2, y: y + .065, w: 9, d: 5, color: p.amber, strength: .26 });
    }
  }
  stencil(blocks, 'west', x - .04, y + 6.6, z + d * .58, sign, .31, '#2c3d42');
}

function operations(blocks, pools) {
  const x = 146;
  const z = 91;
  const y = QUAY_Y;
  blocks.box(x - .55, y, z - .55, 12.10, .52, 10.1, p.coping);
  blocks.box(x, y + .48, z, 11, 11.5, 9, '#a7a699');
  blocks.box(x + .55, y + 5.5, z + .75, 10.1, 2.1, 8.5, '#5c6c68');
  blocks.box(x - .82, y + 11.65, z - .87, 12.64, .56, 10.74, '#d1c8b1');
  blocks.box(x - .28, y + 12.19, z - .25, 11.56, 2.62, 9.5, p.window);
  blocks.box(x - .82, y + 14.76, z - .77, 12.64, .59, 10.50, p.coping);
  blocks.box(x + .39, y + 15.35, z + .39, 10.22, .16, 8.22, p.asphalt);
  for (const dx of [-.32, 11.12]) {
    for (let dz = -.21; dz < 9.18; dz += 1.34) {
      blocks.box(x + dx, y + 12.19, z + dz, .22, 2.57, .16, '#dcd1b5');
      if (dz > 1 && dz < 7) blocks.box(x + dx - .045, y + 12.49, z + dz + .22, .05, 1.21, .94, '#ffc88c', .48);
    }
  }
  for (let dx = -.21; dx < 11.18; dx += 1.40) {
    blocks.box(x + dx, y + 12.19, z + 9.22, .15, 2.57, .13, '#dcd1b5');
    if (dx > 1 && dx < 10) blocks.box(x + dx + .21, y + 12.5, z + 9.255, 1.02, 1.23, .08, '#d4c897', .52);
  }
  for (let floor = 2.0; floor < 10.0; floor += 2.135) {
    blocks.box(x + 2.3, y + floor, z + 9, 3.5, .81, .08, p.glass);
    blocks.box(x - .065, y + floor, z + 1.23, .08, .79, 4.18, '#537377');
  }
  blocks.box(x + 5.1, y + 15.31, z + 2.45, 1.6, .97, 1.82, p.graphite);
  blocks.box(x + 5.78, y + 16.25, z + 3.17, .24, 3.75, .24, p.steel);
  blocks.box(x + 4.76, y + 18.02, z + 3.17, 2.18, .14, .18, p.zinc);
  beacon(blocks, x + 5.9, y + 20.0, z + 3.3, p.marker, .87);
  stencil(blocks, 'south', x + 7.26, y + 7.52, z + 9.02, '08', .42, p.white);
  lamp(blocks, pools, 153, 105, QUAY_Y, 6.2, true);
}

export function paintTerminals(blocks, pools) {
  slab(blocks, 96, -176, 161, 268);
  slab(blocks, 106, 92, 151, 13);
  slab(blocks, 121, 105, 128, 9);
  slab(blocks, 257, -147, 23, 158);
  slab(blocks, -251, -180, 145, 203);
  slab(blocks, -243, 23, 122, 12);
  slab(blocks, -222, 35, 86, 6);

  quayEdge(blocks, 96, -1, -166, 92);
  quayEdge(blocks, -106, 1, -169, 22);
  for (let x = 109; x < 245; x += 4.5) {
    const z = x < 121 ? 105 : 114;
    blocks.box(x, -1.05, z, 4.36, 3.87, .25, pick(['#80796e', '#a08d79', '#938474'], prng(Math.floor(x * 100))));
    if (x % 9 < 4.5) blocks.box(x + .9, 2.41, z + .14, 2.43, .44, .56, p.coping);
  }

  const random = prng(12186);
  for (let i = 0; i < 180; i++) {
    const x = 98 + random() * 152;
    const z = -161 + random() * 250;
    blocks.box(x, QUAY_Y, z, 2.6 + random() * 9.5, .02 + random() * .012, 1.9 + random() * 5.8,
      pick(['#6c6663','#706964','#605e5e','#77706a'], random));
  }
  roadway(blocks, 103, -161, 22, 253, { dashed: false });
  roadway(blocks, 130, -156, 11, 251);
  roadway(blocks, 191, -152, 12, 249);
  roadway(blocks, 101, -48.0, 147, 7.8, { cross: true });
  roadway(blocks, 131, 76.0, 116, 9.9, { cross: true });
  roadway(blocks, -139, -159, 26, 180, { dashed: false });
  roadway(blocks, -237, -174, 12, 198);
  roadway(blocks, -234, -45, 122, 9, { cross: true });

  for (const x of [102.94, 121.21, -121.05, -106.8]) {
    const east = x > 0;
    const end = east ? 89 : 16;
    blocks.box(x, QUAY_Y + .047, -153, .18, .16, end + 153, p.graphite);
    blocks.box(x + .041, QUAY_Y + .201, -153, .105, .044, end + 153, p.steel);
    for (let z = -152; z < end; z += 2.9) blocks.box(x - .24, QUAY_Y + .039, z, .67, .035, .32, p.concrete);
  }

  for (let z = -146; z <= 88; z += 4.6) {
    blocks.box(97.35, QUAY_Y + .021, z, .19, .027, 2.08, p.yellow);
    if (z > -19 && z < 84) {
      blocks.box(99.0, QUAY_Y + .033, z + .24, 1.68, .026, .14, p.zinc);
    }
  }
  stencil(blocks, 'ground', 97.37, QUAY_Y + .035, 92, 'CT-08', .49, '#cab59a');
  stencil(blocks, 'ground', 107.0, QUAY_Y + .068, 50.0, '45', .37, p.stripe);
  for (let x = 112.5; x < 122; x += 1.15) {
    blocks.box(x, QUAY_Y + .049, 59.7, .50, .035, 3.5, '#c3b294');
  }

  for (const z of [-9, 18, 45, 72]) {
    quayCrane(blocks, 112.2, z, -1, { raised: z === -9, noCart: z === TRANSFER.z });
    pools.push({ x: 108, z, y: QUAY_Y + .105, w: 38, d: 26, color: p.amber, strength: .19 });
  }
  for (const z of [-134, -106, -28, -4]) {
    quayCrane(blocks, -114.5, z, 1, { scale: .79, raised: z === -28 });
  }
  for (const z of [-149, -112, -78, -35, 10, 43, 70, 96]) {
    lamp(blocks, pools, 143.5, z, QUAY_Y, z < -60 ? 9.1 : 12.9, z === -35 || z === 70);
  }
  for (const z of [-139, -109, -49, -20, 3.6, 31.2, 60.5, 88.4]) {
    lamp(blocks, pools, 99.0, z, QUAY_Y, 6.1, z === 31.2 || z === 88.4);
  }
  for (const z of [-151, -115, -80, -47, -11, 20]) {
    lamp(blocks, pools, -109.1, z, QUAY_Y, 5.8, true);
  }
  for (const x of [132, 180, 232]) lamp(blocks, pools, x, 109.2, QUAY_Y, 8.8);
  for (const z of [-143, -95, -42, 12, 58]) {
    lamp(blocks, pools, 203.8, z, QUAY_Y, 11, z === -42);
  }
  for (const z of [-141, -107, -64, -20, 18]) lamp(blocks, pools, -145, z, QUAY_Y, 10.4);

  stacks(blocks, 148, -32, 6, 15, [1, 2, 2, 4, 0, 6, 2, 3, 1, 4], 4513);
  stacks(blocks, 170, -32, 6, 15, [3, 4, 1, 2, 0, 0, 4, 5, 3, 6], 9939);
  stacks(blocks, 149, -151, 12, 12, [2, 4, 1, 3, 4, 0, 1, 2], 1235, false);
  stacks(blocks, -172, -30, 8, 8, [0, 2, 1, 4, 0, 5], 5013);
  stacks(blocks, -206, -128, 18, 12, [4, 3, 2, 1, 0, 6], 2173, false);
  stacks(blocks, 209, -59, 12, 7, [4, 1, 0, 2, 6, 2], 5524, false);
  yardCrane(blocks, 146.9, 34.2, 20.15);
  yardCrane(blocks, 168.9, -14.6, 20.15);
  yardCrane(blocks, 147.5, -117.7, 36.6);
  yardCrane(blocks, -173.2, -3.0, 23.5);

  shed(blocks, pools, 208.9, 8.2, 37, 63, 'HUB 08', 4668);
  shed(blocks, pools, 208.9, -133.9, 42, 60, 'KWT', 9194);
  shed(blocks, pools, -236.0, -27.3, 45, 45, 'CT-09', 9877);
  operations(blocks, pools);
  // Safety rails and service cabinets along the outer break in the main apron.
  for (const [x, width, z] of [[121.2, 15.3, 112.3], [169.0, 27.6, 112.3], [216.0, 24.5, 112.3]]) {
    blocks.box(x, QUAY_Y + .86, z, width, .15, .16, p.yellow);
    for (let u = x; u < x + width; u += 1.91) {
      blocks.box(u, QUAY_Y, z, .13, .90, .15, p.yellow);
      blocks.box(u - .19, QUAY_Y + .017, z - .16, .48, .09, .50, p.dockDark);
    }
    blocks.box(x + .46, QUAY_Y + .62, z - 2.29, 3.24, 1.05, 1.64, '#6a7c78');
    blocks.box(x + .34, QUAY_Y + 1.65, z - 2.39, 3.47, .15, 1.85, '#939d8e');
    blocks.box(x + .68, QUAY_Y + .93, z - .60, 2.20, .52, .04, '#617174');
    blocks.box(x + 3.02, QUAY_Y + 1.21, z - .58, .22, .20, .035, p.amber, .86);
  }


  for (const z of [-155, -108, -42, 11, 67]) {
    const x = 126;
    blocks.box(x, QUAY_Y, z, 2.0, 2.10, 1.4, '#637e7d');
    blocks.box(x + .29, QUAY_Y + .24, z + 1.40, 1.42, 1.6, .08, '#8d9990');
    blocks.box(x - .12, QUAY_Y + 2.05, z - .09, 2.24, .16, 1.6, p.zinc);
  }
}

export function drawTractor(blocks, x, y, z, color, loaded = false) {
  // Cab points towards positive Z. The first wheel pair is underneath the cab.
  blocks.box(x - 1.22, y + .55, z - 4.1, 2.44, .43, 9.1, p.graphite);
  blocks.box(x - 1.17, y + 1.00, z + 2.29, 2.34, 2.02, 2.67, color);
  blocks.box(x - 1.2, y + 2.31, z + 4.93, 2.4, .56, .108, p.window);
  blocks.box(x - 1.225, y + 2.16, z + 3.12, .10, .64, 1.20, p.window);
  blocks.box(x - .91, y + 1.32, z + 4.98, 1.82, .27, .14, p.graphite);
  for (const side of [-1, 1]) {
    blocks.box(x + side * .88 - .22, y + 1.60, z + 5.0, .43, .23, .12, p.ice, .66);
    blocks.box(x + side * .96 - .12, y + .98, z - 4.20, .22, .16, .12, p.marker, .55);
    for (const offset of [-3.45, -2.24, 1.95, 4.11]) {
      blocks.box(x + side * 1.01 - .19, y, z + offset - .41, .38, .87, .82, p.rubber);
      blocks.box(x + side * 1.21 - .045, y + .25, z + offset - .19, .09, .34, .38, p.steel);
    }
  }
  blocks.box(x - 1.22, y + .96, z - 4.1, 2.44, .39, 6.60, '#787264');
  if (loaded) container(blocks, x - 1.225, y + 1.35, z - 3.98, 6.19, SWATCHES[2]);
}

export function drawHoist() {
  return {
    chassis(blocks) {
      blocks.box(-1.1, -.55, -2.96, 2.2, .76, 5.92, p.graphite);
      blocks.box(-.80, .19, -2.59, 1.60, .38, 5.18, p.zinc);
      for (const z of [-2.42, 2.03]) {
        blocks.box(-1.38, -.23, z, 2.76, .49, .43, p.redDark);
      }
    },
    frame(blocks) {
      blocks.box(-1.42, -.20, -3.32, 2.84, .38, 6.64, p.yellow);
      blocks.box(-.36, .19, -2.90, .72, .50, 5.80, '#916344');
      for (const z of [-3.24, 2.83]) blocks.box(-1.54, -.4, z, 3.08, .30, .41, p.gantryLight);
      blocks.box(-.17, .04, 3.30, .34, .20, .08, p.greenLight, .9);
    },
  };
}
