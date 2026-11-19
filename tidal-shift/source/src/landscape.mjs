import { beacon, hash, palette as p, pick, prng, voxelBeam } from './voxel.mjs';

export const BRIDGE = { z: -68, deckY: 32.5, towers: [-108, 102] };

function towerCrossSection(blocks, x, y, z, radius, height, color, sideColor) {
  const cut = Math.round(radius * 1.05) * .5;
  const full = radius * 2;
  blocks.box(x - radius, y, z - radius + cut, full, height, full - cut * 2, sideColor);
  blocks.box(x - radius + cut, y, z - radius, full - cut * 2, height, cut, color);
  blocks.box(x - radius + cut, y, z + radius - cut, full - cut * 2, height, cut, color);
}

function tower(blocks, x) {
  const { z, deckY } = BRIDGE;
  blocks.box(x - 7.2, -.92, z - 7.23, 14.4, 4.30, 14.46, '#7b7970');
  blocks.box(x - 5.88, 3.37, z - 5.92, 11.76, 3.35, 11.84, '#a09887');
  for (let y = 6.72; y < 94; y += 1.5) {
    const t = (y - 6.72) / 87.28;
    const r = Math.round((5.24 - 3.59 * t + .06 * Math.sin(t * Math.PI * 2)) * 4) / 4;
    const steel = y > 65.1;
    const banded = Math.floor(y / 1.5) % 7 === 1;
    const base = steel ? (banded ? '#a9b8bb' : '#c3cdca') : (banded ? '#c4baa8' : '#cec7b6');
    towerCrossSection(blocks, x, y, z, r, Math.min(1.5, 94.02 - y), base, steel ? '#a5b7b9' : '#b7af9e');
    if (y > deckY + 7.5) {
      blocks.box(x - .145, y, z + r - .006, .29, 1.4, .095, steel ? '#e3c6a7' : '#cebeab');
      if (steel) blocks.box(x - .13, y + .04, z + r + .083, .26, 1.36, .023, '#ffd3a7', .49);
    }
  }
  blocks.box(x - .55, 7.3, z + 5.22, 1.10, 2.10, .11, '#867f76');
  blocks.box(x - .79, 9.36, z + 5.17, 1.58, .14, .26, p.zinc);
  blocks.box(x - .58, 7.03, z + 5.15, 1.16, .29, .64, '#ada99b');
  towerCrossSection(blocks, x, 93.95, z, 1.89, .88, '#c4c9bc', p.steel);
  towerCrossSection(blocks, x, 94.76, z, 1.50, .52, p.zinc, '#939fa0');
  for (const side of [-1, 1]) beacon(blocks, x + side * .95, 95.25, z, p.marker, 1.14);
  blocks.box(x - .10, 95.21, z - .10, .20, 2.0, .20, '#a3aca8');
}

function laneDeck(blocks, from, to, z, y) {
  const w = to - from;
  for (const offset of [-8.05, 2.98]) {
    const center = z + offset;
    blocks.box(from, y - 2.76, center + .19, w, 1.47, 4.48, '#52636b');
    blocks.box(from, y - 1.30, center - .32, w, 1.30, 5.48, '#8f9793');
    blocks.box(from, y, center - .27, w, .155, 5.38, '#555b5e');
    blocks.box(from, y + .13, center + 2.32, w, .037, .091, '#cdc3a3');
    for (const rail of [center - .38, center + 5.12]) {
      blocks.box(from, y + .04, rail, w, .58, .31, '#b8baad');
      blocks.box(from, y + .65, rail + .022, w, .075, .12, '#86918c');
    }
    for (let mark = from + 1.2; mark < to - 2.1; mark += 6) {
      blocks.box(mark, y + .157, center + 2.25, 2.3, .035, .13, p.zinc);
    }
  }
}

function approach(blocks, side) {
  const x0 = side < 0 ? -264 : 273;
  const length = side < 0 ? 68 : 86;
  const height = BRIDGE.deckY;
  for (let d = 0; d < length; d += 2) {
    const z = BRIDGE.z - Math.round((d / length) ** 1.85 * (side < 0 ? 78 : 82) * 2) / 2;
    const x = x0 + d * side;
    laneDeck(blocks, side > 0 ? x : x - 2, side > 0 ? x + 2 : x, z, height);
    if (d % 12 === 4) {
      for (const dz of [-4.25, 4.55]) {
        blocks.box(x - 1.5, -2.2, z + dz - 1.46, 3.0, 30.0, 2.92, '#808482');
        blocks.box(x - 2.26, 27.60, z + dz - 2.01, 4.52, 2.69, 4.02, '#9a9e95');
      }
    }
  }
}

/** Two independent decks and the two fans of stays on each of the single-shaft towers. */
export function paintBridge(blocks) {
  const { z, deckY: y, towers } = BRIDGE;
  laneDeck(blocks, -264, 273, z, y);
  approach(blocks, -1);
  approach(blocks, 1);
  for (let x = -262; x <= 272; x += 9) {
    blocks.box(x, y - 2.42, z - 3.22, 1.03, 1.23, 6.44, p.steel);
    blocks.box(x + .19, y - 2.38, z + 7.46, .51, .21, .20, '#aac6c0', .64);
  }
  for (const x of [-249, -219, -184, -149, 144, 178, 212, 243, 269]) {
    const base = Math.abs(x) > 235 ? 7.4 : 2.8;
    for (const edge of [-3.15, 3.15]) {
      blocks.box(x - 2.15, base - 1.5, z + edge - 1.57, 4.3, y - base - 2.0, 3.14, '#929188');
      blocks.box(x - 2.72, y - 4.90, z + edge - 1.91, 5.44, 2.1, 3.82, '#9d9d92');
    }
  }
  for (const x of towers) {
    tower(blocks, x);
    for (const side of [-1, 1]) {
      const isMain = (x < 0 && side > 0) || (x > 0 && side < 0);
      const reach = isMain ? 98.4 : 74.3;
      for (let cable = 0; cable < 13; cable++) {
        const t = cable / 12;
        const height = 63 + t * 29.3;
        const endX = x + side * (11.4 + t * (reach - 11.4));
        for (const edge of [-1, 1]) {
          const anchor = [x + side * 1.25, height, z + edge * 1.42];
          const roadway = [endX, y + .69, z + edge * 4.94];
          voxelBeam(blocks, anchor, roadway, .264, cable % 4 === 0 ? '#b7beb4' : '#929e9b', .25);
          blocks.box(endX - .24, y + .52, roadway[2] - .20, .48, .45, .40, p.steel);
        }
      }
    }
    const focusColor = '#b9e9ef';
    for (const [ox, oz] of [[-4.9, 2.35], [4.25, 3.13], [1.86, 5.1]]) {
      blocks.box(x + ox, y + .86, z + oz, .48, .19, .42, focusColor, .75);
    }
  }

  for (let x = -257; x < 271; x += 10.2) {
    if (towers.some((towerX) => Math.abs(x - towerX) < 3)) continue;
    const side = x % 2 > 0 ? 1 : -1;
    const poleZ = z + side * 8.17;
    blocks.box(x - .093, y + .63, poleZ - .09, .186, 2.91, .18, '#9eaaa7');
    blocks.box(x - .076, y + 3.44, Math.min(poleZ, poleZ - side * 1.22), .152, .124, 1.22, '#afb2a7');
    blocks.box(x - .20, y + 3.36, poleZ - side * 1.22 - .15, .40, .135, .30, '#fff1be', .83);
  }
}

function terrainHeight(x, z, peaks, cell) {
  let height = -21;
  for (const [cx, cz, rx, rz, summit] of peaks) {
    const distance = Math.hypot((x - cx) / rx, (z - cz) / rz);
    height = Math.max(height, summit * (1 - distance ** 1.55));
  }
  return Math.round((height + Math.sin(x * .065 - z * .045) * 3.1
    + Math.sin(x * .135 + z * .082) * 1.65 + (hash(Math.round(x), Math.round(z)) - .5) * cell * .74) / 2) * 2;
}

function terrain(blocks, spec) {
  const { x0, x1, z0, z1, step, peaks, swatches, offshore = false } = spec;
  const highest = Math.max(...peaks.map(peak => peak[4]));
  const colors = swatches;
  for (let x = x0; x < x1; x += step) {
    for (let z = z0; z < z1; z += step) {
      const height = terrainHeight(x + step * .5, z + step * .5, peaks, step);
      if (height < 1.0) continue;
      const px = x + step / 2;
      const pz = z + step / 2;
      const random = hash(x, z);
      const deck = offshore ? Math.floor(height / highest * 2) : Number(height > 13) + Number(height > 40);
      const color = colors[Math.min(colors.length - 2, Math.max(0, deck)) + Number(random > .74)];
      let lowest = height;
      for (const [dx, dz] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
        lowest = Math.min(lowest, terrainHeight(px + dx, pz + dz, peaks, step));
      }
      const bottom = Math.max(-2, lowest - (offshore ? 1 : 2.05));
      blocks.box(x, bottom, z, step, height - bottom, step, color);
      if (!offshore && height > 6 && random > .60) {
        const leaf = random > .83 ? '#344f46' : '#2e4842';
        blocks.box(x + .35, height - .08, z + random, step * .78, step * .36, step * .61, leaf);
        if (random > .79) blocks.box(x + 1.13, height + step * .32, z + .8, step * .42, step * .25, step * .41, leaf);
      }
    }
  }
}

const FACADES = [
  ['#a9a499', '#8a9191', '#83817f'],
  ['#b3aaa6', '#887d82', '#797b83'],
  ['#919d9d', '#728388', '#687981'],
  ['#a9a493', '#85877d', '#7e857f'],
];

function towerBlock(blocks, x, z, height, w, d, floors, random, base = 2.8) {
  const [facade, shade, cap] = pick(FACADES, random);
  const podium = Math.min(5.1, height * .16);
  blocks.box(x - .55, base, z - .70, w + 1.10, podium, d + 1.40, shade);
  blocks.box(x, base + podium, z, w, height - podium, d, facade);
  blocks.box(x - .14, base + height - 1.16, z - .14, w + .28, 1.24, d + .28, cap);
  blocks.box(x + w * .41, base + height, z + d * .26, w * .42, 2.45, d * .47, shade);
  if (height > 49) {
    blocks.box(x + w * .70, base + height + 2.45, z + d * .47, .24, 2.50, .24, p.steel);
    blocks.box(x + w * .70 - .1, base + height + 4.9, z + d * .47 - .10, .43, .30, .43, p.marker, .69);
  }

  const segments = Math.max(2, Math.floor(w / 1.9));
  const sideSegments = Math.max(2, Math.floor(d / 2.3));
  const spacing = (height - podium - 2.4) / floors;
  for (const wx of [.31, w * .51, w - .54]) {
    blocks.box(x + wx, base + podium, z + d + .028, .30, height - podium - 1.0, .17, shade);
  }
  for (let floor = 0; floor < floors; floor++) {
    const y = base + podium + .69 + floor * spacing;
    const tint = floor % 3 === 0 ? '#bbc0b7' : shade;
    if (floor % 2 === 0) blocks.box(x -.09, y - .39, z + d, w + .18, .12, .19, tint);
    const bandHeight = spacing * .38;
    blocks.box(x + .3, y, z + d + .020, w - .6, bandHeight, .052, '#52676b');
    blocks.box(x - .085, y, z + .3, .087, bandHeight, d - .6, '#546569');
    for (let pane = 0; pane < segments; pane++) {
      if (random() < .82) continue;
      const win = (pane + .27) * w / segments;
      blocks.box(x + win, y + .04, z + d + .07, w / segments * .47, bandHeight * .78, .065,
        random() > .30 ? '#ffc78b' : '#a1c5c0', .44 + random() * .32);
    }
    for (let pane = 0; pane < sideSegments; pane++) {
      if (random() < .86) continue;
      const win = (pane + .29) * d / sideSegments;
      blocks.box(x - .12, y + .04, z + win, .08, bandHeight * .78, d / sideSegments * .48,
        random() > .42 ? '#f3ce91' : '#a0bcb9', .50);
    }
  }
}

export function paintShore(blocks, background) {
  // The inland hills frame the two terminals and leave the northbound fairway open.
  terrain(blocks, {
    x0:-327, x1:-110, z0:-284, z1:-170, step:3.5,
    peaks:[[-247,-228,90,57,61],[-208,-230,74,57,57],[-154,-239,48,44,39]],
    swatches:['#3d5650','#3e584e','#405850','#4c6355'],
  });
  terrain(blocks, {
    x0:189, x1:334, z0:-290, z1:-172, step:3.5,
    peaks:[[250,-236,64,65,42],[288,-244,67,41,33],[215,-260,43,35,28]],
    swatches:['#445a54','#445b51','#4b6355','#54695b'],
  });
  terrain(blocks, {
    x0:248, x1:417, z0:-222, z1:-73, step:3.5,
    peaks:[[346,-154,67,64,44],[387,-169,46,54,38],[296,-158,55,60,19]],
    swatches:['#4d6057','#4d6359','#435c50','#50675a'],
  });
  terrain(blocks, {
    x0:-392, x1:-251, z0:-237, z1:-102, step:3.5,
    peaks:[[-330,-157,57,49,40],[-292,-200,67,63,55],[-360,-184,49,38,39]],
    swatches:['#415952','#465e54','#496358','#506960'],
  });
  terrain(background, {
    x0:-590, x1:625, z0:-727, z1:-318, step:6,
    peaks:[
      [-450,-551,169,126,80],[-326,-497,177,128,110],[-228,-452,138,111,82],
      [-124,-445,117,86,61],[-49,-466,95,89,58],[36,-453,100,88,44],
      [143,-468,125,107,64],[222,-509,140,114,96],[362,-511,158,148,114],
      [477,-573,169,132,90],[567,-627,172,112,73],
    ],
    swatches:['#4c6269','#455b65','#4b626b','#526971'], offshore:true,
  });
  terrain(background, {
    x0:-1330, x1:1650, z0:-1153, z1:-681, step:9,
    peaks:[
      [-1140,-1004,249,142,85],[-901,-902,241,156,115],[-698,-858,210,145,98],[-511,-883,238,130,146],[-331,-866,171,103,117],
      [-144,-841,234,147,143],[10,-842,159,110,99],[200,-863,224,156,147],
      [389,-873,203,154,126],[575,-845,217,140,104],[698,-835,212,136,111],[925,-915,258,161,109],[1180,-950,278,175,134],[1420,-1034,244,146,112],
    ],
    swatches:['#536775','#556975','#596d7c','#607483'], offshore:true,
  });

  // Compact residential slabs, with heights grouped in the rhythm of housing estates.
  const random = prng(81718);
  const estates = [
    { x: -193, z: -175, rows: 2, count: 5, height: 31, step: 13.7 },
    { x: -238, z: -203, rows: 1, count: 4, height: 29, step: 14.9 },
    { x: 105, z: -176, rows: 2, count: 6, height: 36, step: 13.8 },
    { x: 221, z: -177, rows: 2, count: 6, height: 32, step: 15.5 },
    { x: 310, z: -229, rows: 2, count: 7, height: 42, step: 14.8 },
    { x: 89, z: -347, rows: 2, count: 10, height: 34, step: 14.5 },
    { x: -273, z: -365, rows: 2, count: 12, height: 27, step: 15.6 },
    { x: -44, z: -372, rows: 1, count: 6, height: 29, step: 12.9 },
  ];
  for (const { x, z, rows, count, height, step } of estates) {
    const output = z < -320 ? background : blocks;
    output.box(x - 3, -.56, z - 25 * (rows - 1) - 5, step * count + 5, 3.35, 24 * rows, '#676e68');
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < count; col++) {
        if (col > 0 && random() < .12) continue;
        const h = height + row * 9 + Math.round(random() * 9) * 2.4;
        const w = 7.8 + random() * 4.8;
        const d = 8.4 + random() * 6.2;
        const dx = x + col * step + (row % 2) * 3.7 + random() * 1.7;
        const dz = z - row * 24 + random() * 2.8;
        towerBlock(output, dx, dz, h, w, d, Math.floor(h / 2.34), random);
      }
    }
  }

  // The flex of the shoreline is visible in the breakwater sections at high tide.
  for (let i = 0; i < 39; i++) {
    const x = -241 + i * 3;
    const z = 42 + Math.floor(i * .28) * 1.8;
    blocks.box(x, -2.1, z, 3.14, 2.60, 8.18, '#566561');
    blocks.box(x, .48, z + .24, 3.08, .90, 7.68, '#768071');
    if (i % 3 === 2) blocks.box(x + .2, 1.37, z + 1.22, 2.15, .57, 5.4, '#899080');
  }
  const lx = -126;
  const lz = 67.0;
  blocks.box(lx - 2.52, -.70, lz - 2.86, 5.04, 2.38, 5.72, '#5c6761');
  blocks.box(lx - 1.55, 1.65, lz - 1.55, 3.10, 4.92, 3.10, '#c6c0a9');
  blocks.box(lx - 1.55, 3.22, lz - 1.55, 3.10, 1.17, 3.10, '#98584d');
  blocks.box(lx - 1.70, 6.52, lz - 1.70, 3.4, .40, 3.4, '#beb5a1');
  blocks.box(lx - .94, 6.91, lz - .94, 1.88, 1.68, 1.88, '#9ee8e0', .72);
  blocks.box(lx - 1.16, 8.58, lz - 1.16, 2.32, .50, 2.32, '#814a46');
  beacon(blocks, lx, 9.08, lz, p.ice, 1.12);
}
