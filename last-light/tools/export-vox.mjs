import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { buildWorld } from '../src/world.mjs';
import { palette } from '../src/voxels.mjs';

const { scene, hardware } = buildWorld();
const voxels = [];
let lowest = [Infinity, Infinity, Infinity];
let highest = [-Infinity, -Infinity, -Infinity];
scene.forEach((x, y, z, color) => {
  assert(color > 0 && color < palette.length && color < 256);
  const point = [x, -z, y]; // MagicaVoxel uses Z as its vertical axis.
  lowest = lowest.map((v, i) => Math.min(v, point[i]));
  highest = highest.map((v, i) => Math.max(v, point[i]));
  voxels.push([...point, color]);
});
const size = highest.map((n, i) => n - lowest[i] + 1);
assert(size.every(n => n > 0 && n <= 256));

function int32(...values) {
  const buf = Buffer.alloc(values.length * 4);
  values.forEach((v, i) => buf.writeInt32LE(v, i * 4));
  return buf;
}
function chunk(name, body, children = Buffer.alloc(0)) {
  return Buffer.concat([Buffer.from(name), int32(body.length, children.length), body, children]);
}

const xyzi = Buffer.alloc(4 + voxels.length * 4);
xyzi.writeInt32LE(voxels.length);
for (const [i, [x, y, z, color]] of voxels.entries()) {
  const offset = i * 4 + 4;
  xyzi.set([x - lowest[0], y - lowest[1], z - lowest[2], color], offset);
}
const rgba = Buffer.alloc(1024);
for (let i = 1; i < palette.length; i++) {
  const hex = palette[i].slice(1);
  rgba.set([...Buffer.from(hex, 'hex'), 255], 4 * (i - 1));
}
const children = Buffer.concat([chunk('SIZE', int32(...size)), chunk('XYZI', xyzi), chunk('RGBA', rgba)]);
const file = Buffer.concat([Buffer.from('VOX '), int32(150), chunk('MAIN', Buffer.alloc(0), children)]);
const output = new URL('../last-light.vox', import.meta.url);

if (process.argv.includes('--check')) {
  assert.deepEqual(readFileSync(output), file, 'Published VOX differs from the source lattice');
} else {
  writeFileSync(output, file);
}

const occupied = new Set();
for (let i = 4; i < xyzi.length; i += 4) {
  const [x, y, z] = xyzi.subarray(i, i + 3);
  assert(x < size[0] && y < size[1] && z < size[2]);
  occupied.add(x | (y << 8) | (z << 16));
}
assert.equal(occupied.size, voxels.length);
let components = 0;
hardware.forEach(() => components++);
console.log(JSON.stringify({ size, voxels: voxels.length, hardware: components, colors: palette.length - 1, bytes: file.length }));
