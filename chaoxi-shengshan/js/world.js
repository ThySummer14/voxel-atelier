import * as THREE from '../lib/three.module.js';

const C = {
  rock: ['#777568', '#898577', '#696e63', '#999383', '#5f685f'],
  grass: ['#66765a', '#758365', '#536b55', '#87906c'],
  stone: ['#c4baa5', '#bcb29e', '#cec3aa', '#b5ad9c', '#d2c6ad'],
  slate: ['#435d68', '#4d6670', '#3a525d', '#58717a'],
  dark: '#263237', wood: '#574c3d', gold: '#c9a55d',
  leaf: ['#3f6652', '#52765a', '#668467', '#345b4d'],
};

function rng(seed = 9137) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const random = rng();
const pick = a => a[Math.floor(random() * a.length)];

class Batch {
  constructor(material) { this.material = material; this.items = []; }
  box(x, y, z, sx, sy, sz, color, ry = 0) {
    this.items.push({ x, y, z, sx, sy, sz, color, ry });
  }
  flush(name, shadows = true) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.InstancedMesh(geometry, this.material, this.items.length);
    mesh.name = name;
    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3(), scale = new THREE.Vector3();
    const quat = new THREE.Quaternion(), euler = new THREE.Euler();
    this.items.forEach((b, i) => {
      pos.set(b.x, b.y, b.z); scale.set(b.sx, b.sy, b.sz);
      euler.set(0, b.ry, 0); quat.setFromEuler(euler);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color(b.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = shadows; mesh.receiveShadow = shadows;
    mesh.computeBoundingSphere();
    return mesh;
  }
}

export function groundHeight(x, z) {
  const r = Math.sqrt((x / 52) ** 2 + (z / 45) ** 2);
  if (r >= 1) return -1;
  const n = Math.sin(x * .31) * Math.cos(z * .27) * 1.25 + Math.sin((x + z) * .16) * .8;
  return 3 + 24 * Math.pow(1 - r, .65) + n;
}

export function buildWorld() {
  const group = new THREE.Group();
  group.name = 'Mont-Saint-Michel';
  const solid = new Batch(new THREE.MeshStandardMaterial({ roughness: .91, metalness: .02 }));
  const glow = new Batch(new THREE.MeshBasicMaterial({ color: '#5f6b68', toneMapped: false }));
  const box = (...args) => solid.box(...args);
  const light = (...args) => glow.box(...args);

  // 岩山：每一根地层都由独立方块堆成，顶部长出苔藓与草。
  for (let x = -52; x <= 52; x += 2) {
    for (let z = -46; z <= 46; z += 2) {
      const h = groundHeight(x, z);
      if (h < 0) continue;
      const r = Math.sqrt((x / 52) ** 2 + (z / 45) ** 2);
      for (let y = -2; y < h; y += 2) {
        const top = y + 2 >= h;
        const color = top && r < .82 && random() > .26 ? pick(C.grass) : pick(C.rock);
        box(x, y + 1, z, 2.04, 2.04, 2.04, color);
      }
      if (r > .72 && random() > .82) {
        box(x + .5, h + .3, z, 2.8, 1.2, 2.1, pick(C.rock));
      }
    }
  }

  // 城墙和八座棱堡。
  for (let a = 0; a < Math.PI * 2; a += .032) {
    const x = Math.round(Math.cos(a) * 48);
    const z = Math.round(Math.sin(a) * 42);
    for (let y = 2; y <= 10; y += 2) box(x, y, z, 2.15, 2.05, 2.15, pick(C.stone));
    if (Math.round(a / .032) % 3 !== 0) box(x, 12, z, 2.1, 2, 2.1, pick(C.stone));
    if (Math.round(a / .032) % 11 === 0) box(x * .985, 7, z * .985, 1, 2.4, 1, C.dark);
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + .16;
    const cx = Math.cos(a) * 47, cz = Math.sin(a) * 41;
    for (let dx = -4; dx <= 4; dx += 2) for (let dz = -4; dz <= 4; dz += 2) {
      if (dx * dx + dz * dz > 21) continue;
      for (let y = 2; y <= 13; y += 2) box(cx + dx, y, cz + dz, 2.1, 2.1, 2.1, pick(C.stone));
      if ((dx + dz) % 4 === 0) box(cx + dx, 15, cz + dz, 2.1, 2, 2.1, pick(C.stone));
    }
  }

  function house(x, z, w, d, h, timber = false) {
    const y0 = Math.max(5, Math.round(groundHeight(x, z)) + .4);
    const u = 1.25, nx = Math.round(w / u), nz = Math.round(d / u), ny = Math.round(h / u);
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
        if (ix !== 0 && iz !== 0 && ix !== nx - 1 && iz !== nz - 1) continue;
        const xx = x + (ix - (nx - 1) / 2) * u;
        const zz = z + (iz - (nz - 1) / 2) * u;
        box(xx, y0 + iy * u + u / 2, zz, u * 1.02, u * 1.02, u * 1.02, pick(C.stone));
      }
    }
    for (let iz = 0; iz < nz; iz++) {
      const zz = z + (iz - (nz - 1) / 2) * u;
      const rise = (nz / 2 - Math.abs(iz - (nz - 1) / 2)) * .72;
      for (let ix = -1; ix <= nx; ix++) {
        const xx = x + (ix - (nx - 1) / 2) * u;
        box(xx, y0 + ny * u + rise, zz, u * 1.08, .85, u * 1.08, pick(C.slate));
      }
    }
    const front = z + (nz - 1) * u / 2 + .66;
    for (let floor = 0; floor < Math.max(1, Math.floor(ny / 2)); floor++) {
      for (const side of [-1, 1]) {
        const xx = x + side * Math.min(1.7, w * .23), yy = y0 + 1.8 + floor * 2.45;
        box(xx, yy, front - .03, 1.05, 1.55, .18, C.dark);
        light(xx, yy, front + .09, .68, 1.12, .12, '#ffd58c');
        box(xx, yy, front + .18, .09, 1.15, .09, C.wood);
      }
    }
    box(x, y0 + 1.25, front, 1.25, 2.5, .25, C.wood);
    if (timber) {
      for (const side of [-1, 1]) box(x + side * w * .36, y0 + h * .48, front + .08, .22, h * .88, .2, C.wood);
      box(x, y0 + h * .53, front + .09, w * .85, .22, .2, C.wood);
    }
    if (random() > .55) box(x + w * .25, y0 + h + 2.2, z - d * .15, 1.2, 4, 1.2, pick(C.stone));
  }

  // 沿等高线自然拥挤的中世纪街巷，中央留出上山的朝圣轴。
  for (let ring = 0; ring < 4; ring++) {
    const radius = 23 + ring * 5.3;
    const count = 12 + ring * 5;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2 + ring * .21 + (random() - .5) * .08;
      if (Math.abs(Math.sin(a)) < .14 && ring < 2) continue;
      const x = Math.cos(a) * radius * 1.08 + (random() - .5) * 2;
      const z = Math.sin(a) * radius * .91 + (random() - .5) * 2;
      house(x, z, 4.8 + random() * 2.7, 4.5 + random() * 2, 4.6 + random() * 4.2, random() > .77);
    }
  }

  function masonry(cx, y0, cz, w, h, d, unit = 1.5) {
    const nx = Math.round(w / unit), ny = Math.round(h / unit), nz = Math.round(d / unit);
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
        if (ix !== 0 && iz !== 0 && ix !== nx - 1 && iz !== nz - 1 && iy !== ny - 1) continue;
        box(cx + (ix - (nx - 1) / 2) * unit, y0 + iy * unit + unit / 2,
          cz + (iz - (nz - 1) / 2) * unit, unit * 1.015, unit * 1.015, unit * 1.015, pick(C.stone));
      }
    }
  }

  // 修道院主体：长中殿、后殿、北侧奇迹楼与层层扶壁。
  masonry(0, 27.5, 0, 36, 18, 15);
  masonry(2, 25.5, -14, 34, 24, 10);
  masonry(-14, 27, 10, 12, 12, 10);
  for (let x = -18; x <= 18; x += 1.5) for (let z = -7.5; z <= 7.5; z += 1.5) {
    const y = 46.5 + (7.5 - Math.abs(z)) * .55;
    box(x, y, z, 1.56, 1.05, 1.56, pick(C.slate));
  }
  for (let x = -15; x <= 15; x += 5) {
    box(x, 35.5, 8.25, 1.35, 16, 1.5, pick(C.stone));
    box(x, 32.5, 13.4, 1.8, 10, 1.8, pick(C.stone));
    for (let s = 0; s < 6; s++) box(x, 38 + s * 1.25, 13 - s * .85, 1.25, 1.35, 1.8, pick(C.stone));
    box(x, 42.5, 15, 1.2, 1.5, 1.2, pick(C.stone));
    for (const xx of [x - 1.4, x + 1.4]) {
      box(xx, 39, 7.62, 1.25, 6.2, .28, C.dark);
      light(xx, 39, 7.8, .58, 4.8, .12, '#f3c379');
      box(xx, 42.2, 7.8, .6, .8, .14, '#f3c379');
    }
  }
  for (let x = -13; x <= 17; x += 5) for (const y of [29.5, 36, 43]) {
    box(x, y, -19.1, 1.6, 3.5, .25, C.dark);
    light(x, y, -19.28, .72, 2.35, .12, '#ffd58c');
  }

  // 后殿的阶梯式半圆合唱席。
  for (let x = 16; x <= 26; x += 1.5) for (let z = -7.5; z <= 7.5; z += 1.5) {
    const dx = x - 16;
    if (dx * dx + z * z > 105 || dx < 0) continue;
    for (let y = 28; y <= 45; y += 1.5) {
      const edge = dx * dx + z * z > 78 || x > 24 || y > 43;
      if (edge) box(x, y, z, 1.55, 1.55, 1.55, pick(C.stone));
    }
    box(x, 46 + (7.5 - Math.abs(z)) * .35, z, 1.55, 1.1, 1.55, pick(C.slate));
  }

  // 十字翼部与钟塔。
  masonry(-2, 43, 0, 10, 16, 10);
  for (const side of [-1, 1]) for (const x of [-4.8, -2, .8]) {
    box(x, 54, side * 5.15, 1.4, 5.4, .25, C.dark);
    light(x, 54, side * 5.31, .62, 3.6, .12, '#e8bd79');
  }
  for (let y = 59; y < 68; y += 1.4) {
    const size = 8.8 - (y - 59) * .3;
    box(-2, y, 0, size, 1.45, size, pick(C.stone));
  }
  for (const dx of [-5.1, 5.1]) for (const dz of [-5.1, 5.1]) {
    box(-2 + dx, 59, dz, 1.2, 6, 1.2, pick(C.stone));
    for (let y = 62; y < 69; y += 1.2) box(-2 + dx, y, dz, Math.max(.35, 2.1 - (y - 62) * .28), 1.25, Math.max(.35, 2.1 - (y - 62) * .28), pick(C.slate));
  }
  for (let y = 68; y < 86; y += 1.15) {
    const t = (y - 68) / 18, size = Math.max(.55, 6.2 * (1 - t));
    box(-2, y, 0, size, 1.2, size, pick(C.slate));
  }
  box(-2, 87, 0, .5, 3.2, .5, C.gold);
  box(-2, 88.6, 0, 1.05, 1.05, 1.05, '#e2c477');
  box(-3.3, 87.9, 0, 2.2, .38, 1.1, C.gold);
  box(-.7, 87.9, 0, 2.2, .38, 1.1, C.gold);
  box(-2, 86.5, 0, 2.3, .35, .35, C.gold);

  // 西立面、阶地花园与一条可辨认的登山石阶。
  for (const x of [-18.8, -13.8]) {
    masonry(x, 28, 0, 3.2, 22, 10, 1.6);
    for (let y = 50; y < 57; y += 1.4) box(x, y, 0, Math.max(.7, 4.5 - (y - 50) * .55), 1.45, Math.max(.7, 4.5 - (y - 50) * .55), pick(C.slate));
  }
  for (let i = 0; i < 32; i++) {
    const t = i / 31, a = .78 + t * 1.65;
    const r = 35 - t * 18;
    box(Math.cos(a) * r, 9 + t * 20, Math.sin(a) * r, 3.4, .75, 2.2, '#c6bca6');
  }
  for (let x = -25; x <= -12; x += 2) for (let z = -15; z <= -8; z += 2) {
    box(x, 29, z, 1.9, .8, 1.9, '#7f8b69');
    if ((x === -25 || x === -13) && z % 4 === 1) box(x, 31, z, .65, 4, .65, '#d5c9ad');
  }

  function tree(x, z, size = 1) {
    const y = groundHeight(x, z);
    box(x, y + 2 * size, z, .8 * size, 4 * size, .8 * size, C.wood);
    for (let i = 0; i < 12; i++) {
      const a = random() * Math.PI * 2, r = random() * 2.1 * size;
      box(x + Math.cos(a) * r, y + 4.2 * size + random() * 3 * size, z + Math.sin(a) * r,
        (1.8 + random()) * size, (1.6 + random()) * size, (1.8 + random()) * size, pick(C.leaf));
    }
  }
  for (let i = 0; i < 34; i++) {
    const a = random() * Math.PI * 2, r = 28 + random() * 15;
    const x = Math.cos(a) * r, z = Math.sin(a) * r * .85;
    if (Math.sin(a) > .4 && x > 2) continue;
    tree(x, z, .7 + random() * .55);
  }

  // 通往陆地的细栈桥；潮位高于桥面时会真正没入水中。
  const causeway = new THREE.Group();
  for (let i = 0; i < 68; i++) {
    const t = i / 67, x = 43 - t * 30, z = 29 + t * 125 + Math.sin(t * Math.PI) * 9;
    box(x, .48, z, 2.15, .65, 3.1, '#a79d87', .22);
    if (i % 6 === 0) {
      box(x, 1.7, z + 1.7, .18, 2.6, .18, '#4b514b');
      light(x, 3.05, z + 1.7, .5, .55, .5, '#ffd68e');
    }
    if (i % 9 === 4) {
      box(x + .5, 1.12, z, .32, .72, .32, i % 2 ? '#6d493e' : '#384f59');
      box(x + .5, 1.62, z, .29, .29, .29, '#c6a985');
    }
  }
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    const x = Math.cos(a) * 44, z = Math.sin(a) * 38;
    box(x, 12.3, z, .34, .8, .34, i % 3 ? '#4c5b60' : '#7b4c3e');
    box(x, 12.85, z, .3, .3, .3, '#c6a985');
  }

  const solidMesh = solid.flush('voxel-architecture');
  const glowMesh = glow.flush('windows-and-lanterns', false);
  group.add(solidMesh, glowMesh, causeway);

  return {
    group, solidMesh, glowMesh,
    voxelCount: solid.items.length + glow.items.length,
    landmarks: {
      abbey: new THREE.Vector3(-2, 58, 0),
      marvel: new THREE.Vector3(6, 39, -15),
      ramparts: new THREE.Vector3(33, 10, 30),
    },
  };
}

export function createBoat(color = '#794f37') {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .85 });
  const white = new THREE.MeshStandardMaterial({ color: '#ded8c4', side: THREE.DoubleSide });
  const add = (x, y, z, sx, sy, sz, material = mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    m.position.set(x, y, z); m.castShadow = true; group.add(m); return m;
  };
  add(0, 0, 0, 5, .8, 1.8); add(0, .4, 0, 3.5, .5, 2.4);
  add(0, 3, 0, .22, 6, .22, new THREE.MeshStandardMaterial({ color: '#4b4438' }));
  const sail = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(.1, 5.6, 0), new THREE.Vector3(.1, 1.3, 0), new THREE.Vector3(2.5, 1.5, 0),
  ]), white);
  sail.geometry.setIndex([0, 1, 2]); sail.geometry.computeVertexNormals(); group.add(sail);
  return group;
}
