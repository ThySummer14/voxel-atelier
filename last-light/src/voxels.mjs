// Coordinates name integer cells. The browser and VOX exporter share this lattice.
export const SIZE = [224, 128, 192];
export const MIN = [-112, -30, -96];

export const palette = ['#000000'];
export const material = {};
const swatches = {
  dust: '777780 818087 8b898e 96939a 6c6b74 a09da0',
  rim: '979299 a39ea2 8d8a92 89868b',
  track: '5a5964 63616a 6a6770',
  rock: '65616a 79737a 827d84 918b8d 9d9697 54525c',
  layer1: '77717b 716b76 837a82 746e79',
  layer2: '534f5c 5c5764 605968 56515d',
  layer3: '4c4652 594f5b 504953 60545e',
  layer4: '32313e 383543 403a48 443e4b',
  ochre: '6c5760 80646a 725a63 9a786d',
  obsidian: '22232c 30323b 3c414b',
  dark: '161a24 202432 282c3a',
  graphite: '424550 525664 606571 353846',
  alloy: 'a7a9b2 c2c3c7 888d9b d6d6d9 b5bac3',
  rib: '777e8c 9096a1 646b79',
  white: 'e4e2db f2eee2 d3d4d1 fcf4e5 c5c6c4',
  ceramic: 'f3eadd e5dfd2 d5d3cc',
  gold: '87411d a85a24 c4752a de8f36 eba641 f3bc53 f8ce70 f8d987',
  paleGold: 'eeb05c f7cd80 f5dc98 c48b44 d79c50',
  copper: 'b76837 ce7f4a 9f542e e59c5f',
  glass: '131d29 1c293b 2b4158 3e5a73',
  visor: '5e321c 8b5424 c9822e f4b64c ffdf91',
  red: 'bd3c3b d75c50 973b3e',
  blue: '244469 305481 3c5d81',
  orange: 'db8240 e59c52 b9683b',
  fabric: 'c6bcb2 e0d1bf b0a49d',
  wire: '77757c 8a8a92 5c5d67 a5a1a4',
};
for (const [name, colors] of Object.entries(swatches)) {
  material[name] = colors.split(' ').map(hex => palette.push('#' + hex) - 1);
}

export function hash(x, y, z) {
  let n = Math.imul(x, 0x1f123bb5) ^ Math.imul(y, 0x5f356495) ^ Math.imul(z, 0x627793b7);
  n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
  n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
}

export function swatch(colors, x, y, z) {
  return typeof colors === 'number' ? colors : colors[Math.floor(hash(x, y, z) * colors.length)];
}

export function noise(x, z) {
  const a = Math.floor(x);
  const b = Math.floor(z);
  const ease = t => t * t * (3 - 2 * t);
  const u = ease(x - a);
  const v = ease(z - b);
  const mix = (s, t, f) => s + (t - s) * f;
  return mix(mix(hash(a, 83, b), hash(a + 1, 83, b), u),
    mix(hash(a, 83, b + 1), hash(a + 1, 83, b + 1), u), v);
}

export class Volume {
  constructor(size = SIZE, min = MIN) {
    this.size = size;
    this.min = min;
    this.data = new Uint8Array(size[0] * size[1] * size[2]);
  }

  index(x, y, z) {
    x -= this.min[0];
    y -= this.min[1];
    z -= this.min[2];
    const [w, h, d] = this.size;
    return x < 0 || x >= w || y < 0 || y >= h || z < 0 || z >= d ? -1 : x + w * (y + h * z);
  }

  at(x, y, z) {
    return this.data[this.index(x, y, z)] || 0;
  }

  set(x, y, z, color) {
    const i = this.index(x, y, z);
    if (i >= 0) this.data[i] = swatch(color, x, y, z);
  }

  box(x0, y0, z0, x1, y1, z1, color) {
    for (let z = z0; z <= z1; z++) {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) this.set(x, y, z, color);
      }
    }
  }

  ellipsoid(cx, cy, cz, rx, ry, rz, color, mask = () => true) {
    for (let z = Math.ceil(cz - rz); z <= cz + rz; z++) {
      for (let y = Math.ceil(cy - ry); y <= cy + ry; y++) {
        for (let x = Math.ceil(cx - rx); x <= cx + rx; x++) {
          if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2 <= 1 && mask(x, y, z)) {
            this.set(x, y, z, color);
          }
        }
      }
    }
  }

  rod(a, b, color, width = 1) {
    const steps = Math.max(1, ...a.map((v, i) => Math.abs(v - b[i]))) * 2;
    for (let i = 0; i <= steps; i++) {
      const [x, y, z] = a.map((v, j) => Math.round(v + (b[j] - v) * i / steps));
      this.box(x, y, z, x + width - 1, y + width - 1, z + width - 1, color);
    }
  }

  forEach(visit) {
    const [w, h, d] = this.size;
    const [x0, y0, z0] = this.min;
    let i = 0;
    for (let z = z0; z < z0 + d; z++) {
      for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++, i++) {
          if (this.data[i]) visit(x, y, z, this.data[i], i);
        }
      }
    }
  }
}

// Rotate on the horizontal lattice when stamping individually modeled objects.
export function stamp(target, part, x0, y0, z0, angle = 0) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [sx, sy, sz] = part.size;
  const [mx, my, mz] = part.min;
  const corners = [[mx, mz], [mx + sx - 1, mz], [mx, mz + sz - 1], [mx + sx - 1, mz + sz - 1]];
  const xs = corners.map(([x, z]) => x * c + z * s);
  const zs = corners.map(([x, z]) => z * c - x * s);
  for (let z = Math.floor(Math.min(...zs)); z <= Math.ceil(Math.max(...zs)); z++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      const px = Math.round(x * c - z * s);
      const pz = Math.round(z * c + x * s);
      for (let y = my; y < my + sy; y++) {
        const color = part.at(px, y, pz);
        if (color) target.set(x + x0, y + y0, z + z0, color);
      }
    }
  }
}
