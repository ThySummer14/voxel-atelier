import { Blocks, beacon, container, palette as p, pick, prng, stencil, SWATCHES, voxelBeam } from './voxel.mjs';
import { TRANSFER } from './terminal.mjs';

export const MAIN_SHIP = { x: 76, z: 34.5 };
const HULL = ['#683036', '#863939', '#b5564b', '#333743', '#253542', '#364958'];

function shipHull(blocks, length, width, deck, colors = HULL) {
  const step = length > 50 ? 1.25 : .5;
  const bands = [
    [-deck * .48, -deck * .28, .62, colors[0]],
    [-deck * .28, -deck * .06, .85, colors[1]],
    [-deck * .06, deck * .22, .94, colors[2]],
    [deck * .22, deck * .35, 1.0, colors[3]],
    [deck * .35, deck * .88, 1.0, colors[4]],
    [deck * .88, deck, 1.025, colors[5]],
  ];
  const sections = [];
  for (let z = -length / 2; z < length / 2 - .0001; z += step) {
    const t = (z + step * .5) / length + .5;
    const stern = t < .135 ? .48 + .52 * Math.pow(t / .135, .55) : 1;
    const bow = t > .77 ? Math.pow(Math.max(.008, (1 - t) / .23), .61) : 1;
    sections.push({ z, half: width / 2 * stern * bow });
  }
  for (const [bottom, top, hullFlare, color] of bands) {
    let from = sections[0].z;
    let half = 0;
    for (const section of [...sections, { z: length / 2, half: 0 }]) {
      const quantum = length > 50 ? .25 : .125;
      const nextHalf = Math.max(quantum, Math.round(section.half * hullFlare / quantum) * quantum);
      if (nextHalf !== half || section.half === 0) {
        if (half !== 0) blocks.box(-half, bottom, from, half * 2, top - bottom, section.z - from, color);
        from = section.z;
        half = nextHalf;
      }
    }
  }
  return sections;
}

function rail(blocks, x, y, a, b, color = '#c1c5b5') {
  blocks.box(x - .066, y + .62, a, .132, .11, b - a, color);
  blocks.box(x - .047, y + .34, a, .094, .075, b - a, color);
  for (let z = a; z < b - .08; z += 1.63) blocks.box(x - .077, y, z, .154, .66, .13, color);
}

function stairsOnDeck(blocks, x, y, z, direction) {
  for (let step = 0; step < 11; step++) {
    blocks.box(x, y + step * .245, z + direction * step * .32, .88, .14, .38, '#888b7d');
  }
  voxelBeam(blocks, [x-.06, y+.71, z], [x-.06, y+3.17, z+direction*3.25], .12, p.zinc, .16);
}

function deckMachinery(blocks, z, width, deck) {
  blocks.box(-width / 2, deck, z - 1.1, width, .39, 2.2, '#54564d');
  blocks.box(-width * .31, deck + .39, z - .62, width * .62, .79, 1.24, '#7e513f');
  for (let count = -1; count < 2; count++) {
    blocks.box(count * width / 4 - .20, deck + .75, z - .77, .40, .82, 1.54, p.graphite);
  }
  const roller = width * .38;
  for (const direction of [-1, 1]) {
    blocks.box(direction * roller - .35, deck + .39, z - .8, .70, .63, 1.60, p.rust);
    blocks.box(direction * roller - .25, deck + 1.02, z - .68, .50, .16, 1.36, p.steel);
  }
}

function wheelhouse(blocks) {
  const z = -47.3;
  const y = 7.24;
  blocks.box(-8.85, y, z - 7.7, 17.7, 2.22, 15.4, '#b8b9aa');
  blocks.box(-6.85, y + 2.14, z - 6.20, 13.7, 9.72, 13.96, '#d8d6c6');
  for (let i = 0; i < 5; i++) {
    const floor = y + 2.45 + i * 1.77;
    blocks.box(-7.18, floor, z - 6.52, 14.36, .15, 14.64, p.white);
    for (const side of [-1, 1]) {
      for (let window = 0; window < 7; window++) {
        blocks.box(side * 6.85 - .05, floor + .42, z - 5.72 + window * 1.8, .11, .57, 1.04, p.window);
      }
    }
    for (let window = 0; window < 9; window++) {
      const x = -6.15 + window * 1.37;
      blocks.box(x, floor + .41, z + 7.735, .93, .57, .09, p.window);
      if ((i + window * 2) % 5 === 2) {
        blocks.box(x + .10, floor + .49, z + 7.831, .72, .40, .04, p.amber, .63);
      }
    }
  }

  const bridgeY = y + 11.85;
  blocks.box(-10.4, bridgeY, z - 4.9, 20.8, .45, 11.9, '#b6b9ad');
  blocks.box(-9.36, bridgeY + .39, z - 4.28, 18.72, 2.15, 10.6, '#405b65');
  blocks.box(-9.86, bridgeY + 2.54, z - 4.82, 19.72, .52, 11.45, p.white);
  blocks.box(-8.90, bridgeY + 3.06, z - 4.31, 17.8, .20, 10.38, p.steel);
  for (let pane = 0; pane < 15; pane++) {
    const x = -9.27 + pane * 1.31;
    blocks.box(x, bridgeY + .36, z + 6.33, .16, 2.13, .15, p.zinc);
    if ((pane % 4) < 2) {
      blocks.box(x + .2, bridgeY + .80, z + 6.334, 1.05, 1.14, .07, '#acd1c6', .59);
    }
  }
  for (const side of [-1, 1]) {
    for (let pane = 0; pane < 7; pane++) {
      blocks.box(side * 9.39 - .065, bridgeY + .39, z - 4.11 + pane * 1.49, .13, 2.18, .13, p.zinc);
    }
    blocks.box(side * 10 - .27, bridgeY + 1.01, z + 4.96, .54, .42, .43, side < 0 ? p.marker : p.greenLight, 1.2);
    rail(blocks, side * 10.28, bridgeY + .42, z - 4.5, z + 7, p.white);
    const lifeboatX = side * 8.22;
    blocks.box(lifeboatX - 1.07, y + 5.28, z - 1.63, 2.14, .62, 5.72, p.rust);
    blocks.box(lifeboatX - 1.23, y + 5.90, z - 2.15, 2.46, .80, 6.6, p.orange);
    blocks.box(lifeboatX - .84, y + 6.69, z - 1.8, 1.68, .51, 5.64, '#eea166');
    blocks.box(lifeboatX - .81, y + 6.74, z + 1.43, 1.62, .24, 1.33, p.window);
    stairsOnDeck(blocks, side * 7.9 - .43, y + 2.20, z + 6.28, -1);
  }
  blocks.box(-2.46, y + 9.82, z - 9.61, 4.92, 5.96, 3.81, '#994439');
  blocks.box(-2.55, y + 13.45, z - 9.69, 5.10, .64, 3.97, '#d0bea0');
  blocks.box(-2.49, y + 14.10, z - 9.65, 4.98, 1.71, 3.87, p.graphite);
  for (const x of [-1.24, .55]) {
    blocks.box(x, y + 15.75, z - 8.64, .66, .52, .57, '#848882');
  }
  blocks.box(-.28, y + 14.96, z + 1.11, .55, 4.86, .53, p.zinc);
  blocks.box(-2.12, y + 18.15, z + 1.16, 4.22, .26, .45, p.zinc);
  blocks.box(-1.28, y + 18.51, z + 1.22, 2.56, .27, .32, p.graphite);
  blocks.box(-.11, y + 19.73, z + 1.24, .22, 2.14, .19, p.zinc);
  blocks.box(-.23, y + 21.74, z + 1.12, .44, .35, .43, p.ice, 1.06);
  beacon(blocks, -5.92, bridgeY + 3.2, z - 3.6, p.marker, .72);
}

export function mainShip() {
  const blocks = new Blocks();
  const deck = 7.24;
  const length = 128;
  const width = 22;
  const sections = shipHull(blocks, length, width, deck);
  for (const { z, half } of sections) {
    if (half < 1.3) continue;
    const w = Math.max(1.3, Math.floor(half * 4) / 4 - .45);
    blocks.box(-w, deck, z, w * 2, .038, Math.min(1.25, length / 2 - z), '#59655e');
    if (z > 40 || z < -52) {
      for (const side of [-1, 1]) {
        blocks.box(side * w - .13, deck, z, .26, .57, Math.min(1.25, length / 2 - z), p.steel);
      }
    }
  }

  for (const side of [-1, 1]) {
    rail(blocks, side * 10.87, deck, -44.8, 39.0, '#bac0ae');
    blocks.box(side * 11 - .16, deck - .55, -45, .32, .24, 83, p.steel);
    blocks.box(side * 11.04 - .059, 2.22, -43.6, .12, .41, 78.20, '#a6534b');
    blocks.box(side * 10.27 - .11, deck + .03, -37.3, .22, .034, 78.55, p.yellow);
    for (const z of [-49.0, 48.3, 55.83]) {
      const x = side * (z > 52 ? 4.8 : 7.4);
      blocks.box(x - .53, deck + .05, z - .64, 1.06, .17, 1.28, p.zinc);
      blocks.box(x - .32, deck + .21, z - .46, .64, .61, .92, p.graphite);
      blocks.box(x - .46, deck + .78, z - .57, .92, .16, 1.14, p.redDark);
    }
  }
  stencil(blocks, 'west', -11.01, 3.14, -8.6, 'TIDEWAY', .58, '#ddcdb0');
  stencil(blocks, 'east', 11.009, 3.15, 1.5, 'TIDEWAY', .58, '#ddcdb0');
  stencil(blocks, 'ground', -4.99, deck + .04, 59.48, 'KW-08', .46, '#d3cbb0');

  const random = prng(750314);
  const rowTones = [2, 2, 4, 0, 3, 1, 1, 4, 5, 6, 0, 2];
  for (let row = 0; row < 8; row++) {
    const centerZ = TRANSFER.z - MAIN_SHIP.z + (row - 7) * 6.70;
    const dz = centerZ - 3.09;
    blocks.box(-9.84, deck + .04, dz - .15, 19.68, .09, 6.49, '#824d47');
    blocks.box(-9.82, deck + .129, dz - .25, 19.64, .065, .16, '#bc7861');
    for (let col = -3; col <= 3; col++) {
      const centerX = col * 2.72;
      const levels = row === 7 && col === 0 ? 2
        : 2 + Math.floor(random() * (Math.abs(col) === 3 ? 2 : 4)) - Number(row === 7 && Math.abs(col) > 1);
      for (let tier = 0; tier < levels; tier++) {
        const scheme = random() < .55 ? rowTones[row] : pick([0, 1, 2, 3, 4, 6], random);
        container(blocks, centerX - 1.225, deck + tier * 2.44, dz, 6.18, SWATCHES[scheme], {
          ribs: Math.abs(col) === 3 || tier === levels - 1 || row === 7,
          lettering: col === -3 && (row + tier) % 4 === 0 ? 'TWL' : '',
        });
      }
    }
  }

  // The remaining forward holds leave a gap in front of the working bay.
  for (let row = 0; row < 4; row++) {
    const z = 14.06 + row * 6.6;
    for (let col = -2; col <= 3; col++) {
      const height = 1 + Math.floor(random() * (row === 0 ? 4 : 3));
      for (let layer = 0; layer < height; layer++) {
        const color = layer === height - 1 ? [4, 2, 1, 0][row] : pick([0, 1, 2, 3, 4], random);
        container(blocks, col * 2.72 - 1.225, deck + layer * 2.44, z, 6.18, SWATCHES[color],
          { ribs: col === -2 || layer === height - 1, lettering: col === -2 && layer === height - 1 ? 'TWL' : '' });
      }
    }
  }
  wheelhouse(blocks);
  deckMachinery(blocks, 50.59, 12.1, deck);
  deckMachinery(blocks, -59.32, 9.5, deck);
  blocks.box(-.25, deck, 59.8, .48, 3.59, .48, p.steel);
  blocks.box(-.75, deck + 2.68, 59.91, 1.58, .19, .22, p.zinc);
  blocks.box(-.20, deck + 3.55, 59.85, .38, .53, .37, p.ice, .8);

  // Mooring lines are fixed to painted bollard stations on the quay.
  for (const [lineZ, quayX, quayZ] of [[52.28, 21.25, 52.8], [-50.9, 21.25, -52.8]]) {
    voxelBeam(blocks, [8.02, 8.08, lineZ], [quayX, 3.27, quayZ], .24, '#b5a18a', .24);
    voxelBeam(blocks, [8.18, 8.08, lineZ + .36], [quayX, 3.27, quayZ + 6.1], .19, '#857765', .24);
  }
  return blocks.translate(MAIN_SHIP.x, 0, MAIN_SHIP.z);
}

export function feederShip() {
  const blocks = new Blocks();
  const deck = 4.30;
  shipHull(blocks, 72, 13, deck, ['#542f35','#844640','#ad6954','#435248','#355453','#527366']);
  rail(blocks, -6.42, deck, -25.0, 25.3, '#b6bfb3');
  rail(blocks, 6.42, deck, -25.0, 25.3, '#b6bfb3');
  const random = prng(87168);
  for (let row = 0; row < 7; row++) {
    for (let col = -2; col < 2; col++) {
      const layers = 2 + Math.floor(random() * 2);
      for (let tier = 0; tier < layers; tier++) {
        container(blocks, col * 2.62, deck + tier * 2.42, -18.5 + row * 6.30, 6,
          SWATCHES[pick([0, 2, 3, 4, 6], random)], { ribs: false });
      }
    }
  }
  blocks.box(-5, deck, -32.0, 10, 1.69, 10.60, p.zinc);
  blocks.box(-4.27, deck + 1.60, -31.4, 8.54, 5.09, 9.19, p.white);
  blocks.box(-4.80, deck + 6.54, -31.9, 9.6, 2.13, 9.95, p.window);
  blocks.box(-5.2, deck + 8.65, -32.13, 10.4, .44, 10.41, p.zinc);
  for (let x = -4.6; x < 4.45; x += 1.31) {
    blocks.box(x, deck + 6.53, -21.925, .12, 2.13, .13, p.white);
    if (x > -.9 && x < 3.9) blocks.box(x + .15, deck + 7.02, -21.914, 1.05, .81, .11, p.amber, .57);
  }
  blocks.box(-.18, deck + 9.03, -27, .36, 3.92, .36, p.steel);
  blocks.box(-1.23, deck + 11.81, -26.91, 2.46, .21, .19, p.zinc);
  beacon(blocks, 0, deck + 12.90, -26.8, p.ice, .76);
  deckMachinery(blocks, 29.8, 6.75, deck);
  stencil(blocks, 'west', -6.51, 2.15, -12, 'TSING', .38, p.white);
  return blocks.translate(-92.5, 0, -112);
}

export function serviceBoat(kind) {
  const blocks = new Blocks();
  const tug = kind === 'tug';
  const length = tug ? 20 : 14;
  const width = tug ? 7.3 : 4.5;
  const deck = tug ? 2.25 : 1.37;
  shipHull(blocks, length, width, deck,
    tug ? ['#543d3e','#733f39','#a04c3b','#433e44','#334653','#58625b']
      : ['#60363c','#8a493d','#b9664d','#2d3a47','#384957','#c08356']);
  const y = deck;
  blocks.box(-width * .47, y, -length * .40, width * .94, .18, length * .73, '#535e59');
  blocks.box(-width * .35, y + .14, -1.70, width * .70, tug ? 3.64 : 2.13, tug ? 6.1 : 4.37, p.white);
  const cab = tug ? 5.86 : 3.50;
  blocks.box(-width * .39, cab, -1.88, width * .78, tug ? 1.46 : .99, tug ? 6.23 : 4.70, p.window);
  const roof = cab + (tug ? 1.46 : .99);
  const off = tug ? 4.39 : 2.86;
  blocks.box(-width * .42, roof, -2.04, width * .84, .38, off + 2.23, tug ? '#c88e58' : '#d6bf9d');
  for (let x = -width * .37; x < width * .37; x += width * .18) {
    blocks.box(x, cab, off + .005, .13, roof - cab, .115, p.zinc);
    if (x > -1.15 && x < 1.20) blocks.box(x + .18, cab + .21, off + .016, width * .12, .51, .06, p.amber, .68);
  }
  for (const side of [-1, 1]) {
    rail(blocks, side * width * .455, y + .10, -length / 2 + 1.88, length / 2 - 2.60, '#b9bdb0');
    blocks.box(side * width * .42 - .12, roof - .87, .42, .26, .23, .38,
      side === -1 ? p.marker : p.greenLight, 1.08);
    for (let z = -length * .38; z < length * .26; z += tug ? 2.1 : 2.2) {
      blocks.box(side * width * .513 - .17, y - .7, z, .34, .76, .77, p.rubber);
    }
  }
  blocks.box(-.17, roof + .30, .52, .34, tug ? 3.62 : 2.18, .34, p.steel);
  blocks.box(-1.12, roof + (tug ? 3.35 : 1.98), .59, 2.26, .16, .15, p.zinc);
  const lightY = roof + (tug ? 3.92 : 2.41);
  blocks.box(-.135, lightY, .50, .27, .33, .29, p.ice, 1.08);
  if (tug) {
    blocks.box(-1.75, y + .16, -6.63, 3.5, .67, 2.2, p.redDark);
    blocks.box(-.72, y + .63, -6.55, 1.44, .72, 1.73, p.steel);
    blocks.box(1.65, roof - 1.35, -2.46, .86, 1.60, 1.24, p.graphite);
  } else {
    stencil(blocks, 'west', -width * .513, y - .66, -.70, 'P-08', .15, p.white);
  }
  return blocks;
}

export function channelBuoys(blocks) {
  const positions = [
    [-49, 143, true], [45, 124, false], [47, -20, false],
    [-53, 9, true], [56, -140, false], [-47, -144, true],
  ];
  for (const [x, z, port] of positions) {
    const paint = port ? '#965343' : '#3e7e75';
    const light = port ? p.marker : p.greenLight;
    blocks.box(x - 1.16, -.48, z - 1.18, 2.32, .88, 2.36, p.rubber);
    blocks.box(x - .92, .39, z - .91, 1.84, .49, 1.82, paint);
    blocks.box(x - .58, .88, z - .56, 1.16, .38, 1.12, paint);
    blocks.box(x - .16, 1.25, z - .16, .32, 1.05, .32, p.steel);
    beacon(blocks, x, 2.30, z, light, 1.2);
  }
}
