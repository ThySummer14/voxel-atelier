import * as T from '../vendor/three.module.min.js';
import { makeMesh } from './mesh.mjs';
import { inside, surface } from './terrain.mjs';
import { hash, noise } from './voxels.mjs';

function massif(x, z, cx, cz, rx, rz, h) {
  const r = Math.hypot((x - cx) / rx, (z - cz) / rz);
  return h * Math.max(0, 1 - r) ** 1.3;
}

function height(x, z) {
  const rough = (noise(x / 33, z / 33) - .5) * 6.4 + (noise(x / 12, z / 12) - .5) * 1.6;
  const hills = massif(x, z, -378, -451, 425, 350, 142) +
    massif(x, z, 40, -520, 285, 320, 128) + massif(x, z, -600, 75, 389, 411, 104) +
    massif(x, z, 470, -468, 437, 342, 140) + massif(x, z, 660, 40, 370, 510, 134) +
    massif(x, z, -48, 586, 390, 327, 116);
  const near = Math.max(Math.abs(x), Math.abs(z));
  if (near < 129) {
    const amount = Math.max(0, (near - 102) / 27);
    return Math.round(surface(x, z)[0] * (1 - amount) + (hills + rough - 2) * amount - 1);
  }
  return Math.round(hills + rough - 3);
}

export function buildHorizon() {
  const positions = [], normals = [], colors = [], indices = [];
  const dark = new T.Color('#625f68');
  const light = new T.Color('#87838b');
  const shade = new T.Color();
  const quad = (corners, normal) => {
    const start = positions.length / 3;
    for (const p of corners) {
      positions.push(...p);
      normals.push(...normal);
      colors.push(shade.r, shade.g, shade.b);
    }
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  };
  const tile = (x, z, step) => {
    if (inside(x, z) && inside(x - 2, z - 2) && inside(x + 2, z + 2)) return;
    const y = height(x, z);
    const nx = x + step;
    const nz = z + step;
    shade.copy(dark).lerp(light, .24 * hash(x, 7, z) + .71 * noise(x / 35, z / 35));
    quad([[x,y,z], [x,y,nz], [nx,y,nz], [nx,y,z]], [0,1,0]);
    // Mix terrace wall normals toward the slope at distant viewing scales.
    const bevel = step > 2 ? .58 : .14;
    const wall = Math.sqrt(1 - bevel * bevel);
    for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const bottom = height(x + dx * step, z + dz * step);
      if (bottom >= y) continue;
      if (dx === 1) quad([[nx,bottom,z],[nx,y,z],[nx,y,nz],[nx,bottom,nz]], [wall,bevel,0]);
      if (dx === -1) quad([[x,bottom,z],[x,bottom,nz],[x,y,nz],[x,y,z]], [-wall,bevel,0]);
      if (dz === 1) quad([[x,bottom,nz],[nx,bottom,nz],[nx,y,nz],[x,y,nz]], [0,bevel,wall]);
      if (dz === -1) quad([[x,bottom,z],[x,y,z],[nx,y,z],[nx,bottom,z]], [0,bevel,-wall]);
    }
  };
  for (let z = -960; z < 960; z += 12) {
    for (let x = -960; x < 960; x += 12) {
      if (x >= -168 && x < 168 && z >= -168 && z < 168) continue;
      tile(x, z, 12);
    }
  }
  for (let z = -168; z < 168; z += 2) {
    for (let x = -168; x < 168; x += 2) tile(x, z, 2);
  }
  const mesh = makeMesh(positions, normals, colors, indices);
  mesh.receiveShadow = true;
  return mesh;
}

// A small, deliberately enlarged Earth, sculpted from ocean, cloud and land cells.
export function buildEarth() {
  const mesh = new T.InstancedMesh(new T.BoxGeometry(.98,.98,.98),
    new T.MeshBasicMaterial(), 2700);
  const matrix = new T.Matrix4();
  const color = new T.Color();
  let count = 0;
  const radius = 8.7;
  for (let z = -9; z <= 9; z++) {
    for (let y = -9; y <= 9; y++) {
      for (let x = -9; x <= 9; x++) {
        const r = Math.hypot(x, y, z);
        if (r > radius || r < 7.65) continue;
        const light = Math.max(0, (-x * .63 + y * .56 + z * .53) / r);
        const clouds = noise(x / 2.6 + z * .12 + y * .23, y / 1.6 - z / 2.6);
        const land = noise(x / 4.2 + y * .17, (z + y) / 5.5);
        color.set(clouds > .60 || Math.abs(y) > 7 ? '#ddeaff' :
          land > .58 ? '#56857c' : '#397bc9').multiplyScalar(.05 + light * 1.5);
        matrix.makeTranslation(x, y, z);
        mesh.setMatrixAt(count, matrix);
        mesh.setColorAt(count++, color);
      }
    }
  }
  mesh.count = count;
  mesh.position.set(-79, 169, -506);
  return mesh;
}
