// build-wheel.js — 独立水车动态装配
import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry } from './voxel.js';
import { C } from './palette.js';

export function buildDynamicWaterWheel() {
  const wheelWorld = new VoxelWorld();
  const R = 9;

  // 12 根主辐条与轮辋
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    const dy = Math.round(Math.sin(rad) * R);
    const dz = Math.round(Math.cos(rad) * R);
    wheelWorld.box(-1, dy, dz, 1, dy, dz, C.timberDark);

    // 水斗叶片
    if (a % 30 === 0) {
      wheelWorld.box(-1, dy - 1, dz - 1, 1, dy + 1, dz + 1, C.timberWarm);
    }
  }

  // 轮毂中轴
  wheelWorld.box(-2, -1, -1, 2, 1, 1, C.timberDark);

  const geo = buildGeometry(wheelWorld, { jitter: 0.02, ao: true });
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.Mesh(geo.geometry, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const group = new THREE.Group();
  group.position.set(16, 15, -4);
  group.add(mesh);

  return {
    group,
    mesh,
  };
}
