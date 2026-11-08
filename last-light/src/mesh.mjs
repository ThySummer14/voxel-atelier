import * as T from '../vendor/three.module.min.js';
import { material as M, palette } from './voxels.mjs';

const AXES = [
  [[1,0,0], [0,1,0], [0,0,1]],
  [[-1,0,0], [0,0,1], [0,1,0]],
  [[0,1,0], [0,0,1], [1,0,0]],
  [[0,-1,0], [1,0,0], [0,0,1]],
  [[0,0,1], [1,0,0], [0,1,0]],
  [[0,0,-1], [0,1,0], [1,0,0]],
];
const CORNERS = [[0,0], [1,0], [1,1], [0,1]];
const values = palette.map(hex => new T.Color(hex));
const reflective = new Set([...M.gold, ...M.paleGold, ...M.copper, ...M.alloy,
  ...M.visor]);

export function meshVolume(vox) {
  const positions = [];
  const normals = [];
  const colors = [];
  const matte = [];
  const foil = [];
  const sh = [1, .85, .70, .53];
  let start = 0;

  vox.forEach((x, y, z, id) => {
    const base = values[id];
    const indices = reflective.has(id) ? foil : matte;
    for (const [n, u, v] of AXES) {
      const xx = x + n[0];
      const yy = y + n[1];
      const zz = z + n[2];
      if (vox.at(xx, yy, zz)) continue;
      const ao = [];
      for (const [s, t] of CORNERS) {
        const su = 2 * s - 1;
        const tv = 2 * t - 1;
        const ax = su * u[0], ay = su * u[1], az = su * u[2];
        const bx = tv * v[0], by = tv * v[1], bz = tv * v[2];
        const a = Number(Boolean(vox.at(xx + ax, yy + ay, zz + az)));
        const b = Number(Boolean(vox.at(xx + bx, yy + by, zz + bz)));
        const c = Number(Boolean(vox.at(xx + ax + bx, yy + ay + by, zz + az + bz)));
        const occlusion = sh[a && b ? 3 : a + b + c];
        ao.push(occlusion);
        positions.push(
          x + Math.max(n[0], 0) + u[0] * s + v[0] * t,
          y + Math.max(n[1], 0) + u[1] * s + v[1] * t,
          z + Math.max(n[2], 0) + u[2] * s + v[2] * t,
        );
        normals.push(...n);
        colors.push(base.r * occlusion, base.g * occlusion, base.b * occlusion);
      }
      if (ao[0] + ao[2] > ao[1] + ao[3]) {
        indices.push(start, start + 1, start + 3, start + 1, start + 2, start + 3);
      } else {
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
      }
      start += 4;
    }
  });
  const mesh = makeMesh(positions, normals, colors, matte.concat(foil));
  const metal = new T.MeshPhongMaterial({
    vertexColors: true, specular: '#8f8271', shininess: 27,
  });
  mesh.material = [mesh.material, metal];
  mesh.geometry.addGroup(0, matte.length, 0);
  mesh.geometry.addGroup(matte.length, foil.length, 1);
  return mesh;
}

export function makeMesh(positions, normals, colors, indices) {
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true }));
}
