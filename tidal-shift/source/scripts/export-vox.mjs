import { writeFile } from 'node:fs/promises';
import { choreography, makeWorld, OPENING_TIME } from '../src/world.mjs';
import { hash } from '../src/voxel.mjs';

const SCALE = 2; // one exported voxel represents half a scene unit
const LIFT = 12;
const TILE = 128;
const HEIGHT = 64;
const SLICE = TILE * TILE;
const TILE_VOLUME = SLICE * HEIGHT;
const layers = [
  'Quays and yards', 'Stonecutters Bridge', 'Shore and city', 'TIDEWAY',
  'Feeder', 'Aids to navigation', 'Working machinery', 'Water',
];
const waterColors = ['#31546a', '#375e75', '#416b80', '#4d7687'];
const tiles = new Map();
const palette = new Map();
const materialColors = new Map();

function colorIndex(color, glow = 0) {
  if (!palette.has(color)) palette.set(color, palette.size + 1);
  const index = palette.get(color);
  if (index > 255) throw new Error('The MagicaVoxel palette exceeds 255 visible entries.');
  if (glow) materialColors.set(index, Math.max(glow, materialColors.get(index) || 0));
  return index;
}

function tileAt(tx, ty, tz) {
  const key = [tx, ty, tz].join('/');
  if (!tiles.has(key)) {
    tiles.set(key, { origin: [tx * TILE, ty * TILE, tz * HEIGHT], blocks: new Uint16Array(TILE_VOLUME) });
  }
  return tiles.get(key);
}

function span(a, b) {
  const min = Math.round(a * SCALE - .000001);
  const max = Math.round(b * SCALE - .000001);
  if (max > min) return [min, max];
  const center = Math.floor(SCALE * (a + b) / 2);
  return [center, center + 1];
}

function fill(x0, x1, y0, y1, z0, z1, value) {
  for (let z = z0; z < z1;) {
    const tz = Math.floor(z / HEIGHT);
    const endZ = Math.min(z1, (tz + 1) * HEIGHT);
    for (let y = y0; y < y1;) {
      const ty = Math.floor(y / TILE);
      const endY = Math.min(y1, (ty + 1) * TILE);
      for (let x = x0; x < x1;) {
        const tx = Math.floor(x / TILE);
        const endX = Math.min(x1, (tx + 1) * TILE);
        const { origin: [ox, oy, oz], blocks } = tileAt(tx, ty, tz);
        for (let level = z; level < endZ; level++) {
          for (let row = y; row < endY; row++) {
            const base = (level - oz) * SLICE + (row - oy) * TILE;
            blocks.fill(value, base + x - ox, base + endX - ox);
          }
        }
        x = endX;
      }
      y = endY;
    }
    z = endZ;
  }
}

function paintBox(box, layer, pose = {}) {
  const value = (layer << 8) | colorIndex(box.color, box.glow);
  const { x: dx = 0, y: dy = 0, z: dz = 0, yaw = 0 } = pose;
  const [bottom, top] = span(box.y + dy, box.y + dy + box.h).map(y => y + LIFT);
  if (!yaw) {
    const [left, right] = span(box.x + dx, box.x + dx + box.w);
    const [back, front] = span(-(box.z + dz + box.d), -(box.z + dz));
    if (layer === 0 && box.y < 2.25 && box.w > 20 && box.d > 11 && top - bottom > 2) {
      // Preserve the six faces of the massive concrete lifts and omit their buried cores.
      fill(left, right, back, front, bottom, bottom + 1, value);
      fill(left, right, back, front, top - 1, top, value);
      fill(left, left + 1, back, front, bottom + 1, top - 1, value);
      fill(right - 1, right, back, front, bottom + 1, top - 1, value);
      fill(left + 1, right - 1, back, back + 1, bottom + 1, top - 1, value);
      fill(left + 1, right - 1, front - 1, front, bottom + 1, top - 1, value);
    } else {
      fill(left, right, back, front, bottom, top, value);
    }
    return;
  }

  // Voxelize the stopped heading of boats and traffic in their own local axes.
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const cx = box.x + box.w * .5;
  const cz = box.z + box.d * .5;
  const centerX = dx + cx * cos + cz * sin;
  const centerZ = dz - cx * sin + cz * cos;
  const halfX = Math.max(.32, box.w * .5);
  const halfZ = Math.max(.32, box.d * .5);
  const extentX = Math.abs(cos) * halfX + Math.abs(sin) * halfZ;
  const extentZ = Math.abs(sin) * halfX + Math.abs(cos) * halfZ;
  for (let x = Math.floor((centerX - extentX) * SCALE); x < Math.ceil((centerX + extentX) * SCALE); x++) {
    for (let z = Math.floor((centerZ - extentZ) * SCALE); z < Math.ceil((centerZ + extentZ) * SCALE); z++) {
      const u = (x + .5) / SCALE - centerX;
      const v = (z + .5) / SCALE - centerZ;
      if (Math.abs(u * cos - v * sin) > halfX || Math.abs(u * sin + v * cos) > halfZ) continue;
      fill(x, x + 1, -z - 1, -z, bottom, top, value);
    }
  }
}

function paintPart(blocks, layer, pose) {
  for (const list of [blocks.solids, blocks.lights]) {
    for (const box of list) paintBox(box, layer, pose);
  }
}

function paintWater() {
  const colors = waterColors.map(color => ((layers.length - 1) << 8) | colorIndex(color));
  const minX = -412 * SCALE;
  const maxX = 420 * SCALE;
  const minY = -168 * SCALE;
  const maxY = 291 * SCALE;
  const level = LIFT - 1;
  for (let ty = Math.floor(minY / TILE); ty < Math.ceil(maxY / TILE); ty++) {
    for (let tx = Math.floor(minX / TILE); tx < Math.ceil(maxX / TILE); tx++) {
      const { origin: [ox, oy], blocks } = tileAt(tx, ty, 0);
      for (let y = Math.max(minY, oy); y < Math.min(maxY, oy + TILE); y++) {
        for (let x = Math.max(minX, ox); x < Math.min(maxX, ox + TILE); x++) {
          const base = level * SLICE + (y - oy) * TILE + x - ox;
          if (blocks[base]) continue;
          const swell = Math.sin(x * .012 + y * .052) + Math.sin(y * .123 - x * .020);
          const crest = hash(Math.floor(x / 6), y);
          const wave = swell > 1.46 && crest > .67 ? 3 : swell > .5 ? 2 : swell > -1.0 ? 1 : 0;
          blocks[base] = colors[wave];
        }
      }
    }
  }
}

const world = makeWorld();
world.core.forEach((part, layer) => paintPart(part, layer));
const { transfer, pilot, tug, lorry, traffic } = choreography(OPENING_TIME);
const { x, y, z, railY } = transfer;
paintPart(world.moving.trolley, 6, { x, y: railY, z });
paintPart(world.moving.spreader, 6, { x, y: y + 2.76, z });
paintPart(world.moving.suspended, 6, { x, y, z });
for (const dx of [-.95, .95]) for (const dz of [-2.5, 2.5]) {
  paintBox({ x: x + dx, y: y + 3.0, z: z + dz, w: .14,
    h: railY - y - 3.4, d: .14, color: '#9ea49a', glow: 0 }, 6);
}
paintPart(world.moving.pilot, 6, pilot);
paintPart(world.moving.tug, 6, tug);
paintPart(world.moving.lorry, 6, lorry);
for (let i = 0; i < traffic.length; i++) {
  const cars = world.moving.cars;
  paintPart(cars[(i + Math.floor(i / 3)) % cars.length], 6, traffic[i]);
}
paintWater();

const i32 = (n) => {
  const data = Buffer.allocUnsafe(4);
  data.writeInt32LE(n);
  return data;
};

const text = (value) => {
  const data = Buffer.from(value, 'utf8');
  return Buffer.concat([i32(data.length), data]);
};

function dict(fields) {
  const pairs = Object.entries(fields);
  return Buffer.concat([i32(pairs.length), ...pairs.flatMap(([key, value]) => [text(key), text(value)])]);
}

function chunk(name, items = []) {
  const content = Buffer.concat(items);
  return Buffer.concat([Buffer.from(name), i32(content.length), i32(0), content]);
}

function transform(id, child, layer, name, offset) {
  return chunk('nTRN', [i32(id), dict(name ? { _name: name } : {}), i32(child), i32(-1), i32(layer), i32(1),
    dict(offset ? { _t: offset.join(' ') } : {})]);
}

function group(id, children) {
  return chunk('nGRP', [i32(id), dict({}), i32(children.length), ...children.map(i32)]);
}

const models = [];
const records = [];
let voxelCount = 0;

for (const { origin, blocks } of tiles.values()) {
  const regions = Array.from({ length: layers.length }, () => ({
    min: [TILE, TILE, HEIGHT], max: [-1, -1, -1], count: 0,
  }));
  for (let i = 0; i < blocks.length; i++) {
    const value = blocks[i];
    if (!value) continue;
    const region = regions[value >>> 8];
    const x = i % TILE;
    const y = (i >>> 7) & 127;
    const z = i >>> 14;
    region.min[0] = Math.min(region.min[0], x);
    region.min[1] = Math.min(region.min[1], y);
    region.min[2] = Math.min(region.min[2], z);
    region.max[0] = Math.max(region.max[0], x);
    region.max[1] = Math.max(region.max[1], y);
    region.max[2] = Math.max(region.max[2], z);
    region.count++;
  }
  for (let layer = 0; layer < regions.length; layer++) {
    const { min, max, count } = regions[layer];
    if (!count) continue;
    const size = max.map((m, axis) => m - min[axis] + 1);
    const body = Buffer.allocUnsafe(4 + count * 4);
    body.writeInt32LE(count);
    let offset = 4;
    for (let z = min[2]; z <= max[2]; z++) {
      for (let y = min[1]; y <= max[1]; y++) {
        for (let x = min[0]; x <= max[0]; x++) {
          const voxel = blocks[z * SLICE + y * TILE + x];
          if (!voxel || (voxel >>> 8) !== layer) continue;
          body[offset++] = x - min[0];
          body[offset++] = y - min[1];
          body[offset++] = z - min[2];
          body[offset++] = voxel & 255;
        }
      }
    }
    if (offset !== body.length) throw new Error('Tile voxel count changed during export.');
    const index = records.length;
    const pivot = origin.map((coordinate, axis) => coordinate + min[axis] + Math.floor(size[axis] / 2));
    models.push(chunk('SIZE', size.map(i32)), chunk('XYZI', [body]));
    records.push({ layer, index, pivot });
    voxelCount += count;
  }
}

const layerNode = (layer) => 2 + 2 * layer;
const tileNode = (index) => 2 + 2 * layers.length + 2 * index;
const graph = [transform(0, 1, -1, 'Tidal Shift / gpt-6.2 sol'), group(1, layers.map((_, layer) => layerNode(layer)))];
for (let layer = 0; layer < layers.length; layer++) {
  const id = layerNode(layer);
  const children = records.filter(record => record.layer === layer).map(record => tileNode(record.index));
  graph.push(transform(id, id + 1, layer, layers[layer]), group(id + 1, children));
  graph.push(chunk('LAYR', [i32(layer), dict({ _name: layers[layer] }), i32(-1)]));
}
for (const { layer, index, pivot } of records) {
  const id = tileNode(index);
  graph.push(transform(id, id + 1, layer, layers[layer] + ' / ' + (index + 1), pivot));
  graph.push(chunk('nSHP', [i32(id + 1), dict({}), i32(1), i32(index), dict({})]));
}

const rgba = Buffer.alloc(1024);
for (const [color, index] of palette) {
  const offset = (index - 1) * 4;
  const packed = parseInt(color.slice(1), 16);
  rgba[offset] = (packed >> 16) & 255;
  rgba[offset + 1] = (packed >> 8) & 255;
  rgba[offset + 2] = packed & 255;
  rgba[offset + 3] = 255;
}
const emissions = [...materialColors].map(([index, power]) => chunk('MATL', [
  i32(index), dict({ _type: '_emit', _emit: String(Math.min(power, 1)), _flux: '1' }),
]));
const allChunks = [chunk('PACK', [i32(records.length)]), ...models, ...graph, chunk('RGBA', [rgba]), ...emissions];
const bytes = allChunks.reduce((sum, bytes) => sum + bytes.length, 0);
const vox = Buffer.concat([Buffer.from('VOX '), i32(150), Buffer.from('MAIN'), i32(0), i32(bytes), ...allChunks]);

await writeFile(new URL('../../tidal-shift.vox', import.meta.url), vox);
console.log(JSON.stringify({ title: 'Tidal Shift', author: 'gpt-6.2 sol', layers: layers.length,
  models: records.length, voxels: voxelCount, colors: palette.size, bytes: vox.length }));
