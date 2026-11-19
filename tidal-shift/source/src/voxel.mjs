/** Coordinates are X east, Y up and Z out to sea. Box coordinates specify a lower corner. */
export class Blocks {
  solids = [];
  lights = [];

  box(x, y, z, w, h, d, color, glow = 0) {
    (glow ? this.lights : this.solids).push({ x, y, z, w, h, d, color, glow });
  }

  translate(dx, dy, dz) {
    const shifted = new Blocks();
    for (const box of [...this.solids, ...this.lights]) {
      shifted.box(box.x + dx, box.y + dy, box.z + dz, box.w, box.h, box.d, box.color, box.glow);
    }
    return shifted;
  }
}

export const palette = {
  steel: '#adb2ac', zinc: '#d6d7c9', zincLight: '#e0dacf',
  graphite: '#283640', asphalt: '#44494a', road: '#333b42',
  concrete: '#766f65', coping: '#b6a796', stripe: '#e6cba1', yellow: '#d5a54d',
  dockDark: '#423e3d', ballast: '#596561', rubber: '#263033',
  red: '#b34a38', redDark: '#6e3138', redLight: '#ea805d',
  gantry: '#be8a38', gantryLight: '#e4b361',
  white: '#dfdcd0', window: '#284a58', glass: '#49717a', navy: '#233846',
  rust: '#963d39', copper: '#b86649', orange: '#e98547', cream: '#ddc9a7',
  amber: '#ffe093', ice: '#a9eff8', greenLight: '#80efae', marker: '#ff6155',
};

export const SWATCHES = [
  ['#71333d', '#a44f49', '#bf6860'],  // oxblood
  ['#a44c36', '#ce7547', '#e9a36c'],  // baked orange
  ['#2e515f', '#427b8b', '#6ca6ae'],  // harbour blue
  ['#3b665e', '#588e79', '#82af96'],  // eucalyptus
  ['#8a8270', '#b8ae93', '#d8c9a6'],  // canvas
  ['#4d4d5b', '#626576', '#858693'],  // slate
  ['#a7773f', '#c49752', '#dab673'],  // ochre
];

export function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function pick(source, random) {
  return source[Math.floor(random() * source.length)];
}

export function hash(x, z) {
  const key = Math.imul(x, 2120969693) ^ Math.imul(z, 5862347);
  return ((key ^ key >>> 13) >>> 0) / 4294967296;
}

/** A stay, brace or cable whose centreline advances on a cubic grid. */
export function voxelBeam(blocks, from, to, size, color, step = size, glow = 0) {
  const delta = to.map((end, axis) => end - from[axis]);
  const axis = delta.map(Math.abs).indexOf(Math.max(...delta.map(Math.abs)));
  const steps = Math.ceil(Math.abs(delta[axis]) / step);
  let run = null;
  const emit = (a, b) => {
    const min = a.map((value, i) => Math.min(value, b[i]) - size / 2);
    const extent = a.map((value, i) => Math.abs(value - b[i]) + size);
    blocks.box(...min, ...extent, color, glow);
  };
  for (let i = 0; i <= steps; i++) {
    const fraction = steps ? i / steps : 0;
    const point = from.map((begin, j) => Math.round((begin + delta[j] * fraction) / step) * step);
    if (run && point.every((value, j) => j === axis || value === run.last[j])) {
      run.last = point;
    } else {
      if (run) emit(run.first, run.last);
      run = { first: point, last: point };
    }
  }
  emit(run.first, run.last);
}

const glyphs = {
  '0': ['111','101','101','101','111'], '1': ['010','110','010','010','111'],
  '2': ['111','001','111','100','111'], '3': ['111','001','111','001','111'],
  '4': ['101','101','111','001','001'], '5': ['111','100','111','001','111'],
  '6': ['111','100','111','101','111'], '7': ['111','001','010','010','010'],
  '8': ['111','101','111','101','111'], '9': ['111','101','111','001','111'],
  A: ['010','101','111','101','101'], B: ['110','101','110','101','110'],
  C: ['111','100','100','100','111'], D: ['110','101','101','101','110'],
  E: ['111','100','110','100','111'], F: ['111','100','110','100','100'],
  G: ['111','100','101','101','111'], H: ['101','101','111','101','101'],
  I: ['111','010','010','010','111'], K: ['101','110','100','110','101'],
  L: ['100','100','100','100','111'], N: ['101','111','111','111','101'],
  O: ['111','101','101','101','111'], P: ['111','101','111','100','100'],
  R: ['110','101','110','101','101'], S: ['111','100','111','001','111'],
  T: ['111','010','010','010','010'], U: ['101','101','101','101','111'],
  W: ['101','101','111','111','101'], Y: ['101','101','010','010','010'],
  '-': ['000','000','111','000','000'],
};

/** Raised, originally drawn 3×5 pixels. Faces are read from the water or road. */
export function stencil(blocks, face, x, y, z, message, pitch, color, glow = 0) {
  const depth = Math.max(.045, pitch * .14);
  for (let i = 0; i < message.length; i++) {
    const glyph = glyphs[message[i]];
    if (!glyph) continue;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (glyph[row][col] === '0') continue;
        const u = (i * 4 + col) * pitch;
        const v = (4 - row) * pitch;
        if (face === 'west') blocks.box(x - depth, y + v, z + u, depth, pitch, pitch, color, glow);
        if (face === 'east') blocks.box(x, y + v, z - u - pitch, depth, pitch, pitch, color, glow);
        if (face === 'south') blocks.box(x + u, y + v, z, pitch, pitch, depth, color, glow);
        if (face === 'ground') blocks.box(x + u, y, z - v - pitch, pitch, depth, pitch, color, glow);
      }
    }
  }
}

export function container(blocks, x, y, z, length, scheme, { ribs = true, lettering = '' } = {}) {
  const w = 2.45;
  const h = 2.36;
  const [shade, side, top] = scheme;
  blocks.box(x, y, z, w, h, length, side);
  blocks.box(x + .09, y + h - .02, z + .1, w - .18, .075, length - .2, top);
  if (ribs) {
    for (let offset = .37; offset < length - .21; offset += .46) {
      blocks.box(x - .05, y + .17, z + offset, .085, h - .33, .10, shade);
      blocks.box(x + .18, y + h + .049, z + offset, w - .36, .038, .11, side);
    }
    for (const offset of [.33, .93, 1.53, 2.12]) {
      blocks.box(x + offset, y + .22, z + length, .06, h - .37, .10, top);
    }
  }
  for (const dx of [-.025, w - .14]) {
    for (const dz of [-.025, length - .135]) {
      blocks.box(x + dx, y + .02, z + dz, .165, h - .035, .165, shade);
      blocks.box(x + dx, y + h - .01, z + dz, .165, .10, .165, top);
    }
  }
  if (lettering) stencil(blocks, 'west', x - .055, y + .84, z + .65, lettering, .145, '#d9cbb2');
}

export function beacon(blocks, x, y, z, color, strength = 1) {
  blocks.box(x - .28, y, z - .28, .56, .24, .56, palette.graphite);
  blocks.box(x - .19, y + .24, z - .19, .38, .32, .38, color, strength);
  blocks.box(x - .23, y + .56, z - .23, .46, .12, .46, palette.zinc);
}
