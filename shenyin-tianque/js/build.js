// build.js — 神隐天阙·统一装配接口

import * as THREE from '../vendor/three.module.js';
import { VoxelWorld, buildGeometry } from './voxel.js';
import { buildBaseAndSea } from './build-base.js';
import { buildBathhouse } from './build-bathhouse.js';
import { buildProps } from './build-props.js';
import { buildDynamicWaterWheel } from './build-wheel.js';

export function buildWorld() {
  const solid = new VoxelWorld();
  const glow = new VoxelWorld();
  const water = new VoxelWorld();

  // 1. 基底与广袤水域
  buildBaseAndSea(solid, water);

  // 2. 油屋神殿主体
  buildBathhouse(solid, glow, water);

  // 3. 朱桥、鸟居、列车、白龙与生灵
  const props = buildProps(solid, glow);

  // 4. 独立动力学水车
  const waterWheel = buildDynamicWaterWheel();

  // 5. 网格几何体生成与顶点色烘焙
  const solidGeo = buildGeometry(solid, { jitter: 0.035, ao: true });
  const glowGeo = buildGeometry(glow, { jitter: 0.0, ao: false });
  const waterGeo = buildGeometry(water, { jitter: 0.0, ao: false });

  const root = new THREE.Group();
  const solidMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 });
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x22354a, transparent: true, opacity: 0.8 });

  const opaqueMesh = new THREE.Mesh(solidGeo.geometry, solidMat);
  opaqueMesh.castShadow = true;
  opaqueMesh.receiveShadow = true;

  const glowMesh = new THREE.Mesh(glowGeo.geometry, glowMat);
  const waterMesh = new THREE.Mesh(waterGeo.geometry, waterMat);

  root.add(opaqueMesh, glowMesh, waterMesh, props.dragon.group, props.train.group, waterWheel.group);

  return {
    root,
    opaqueMesh,
    glowMesh,
    waterMesh,
    solidMat,
    glowMat,
    waterGeo,
    train: props.train,
    dragon: props.dragon,
    waterWheel,
    stats: {
      voxels: solidGeo.voxels + glowGeo.voxels + waterGeo.voxels,
      quads: solidGeo.quads + glowGeo.quads + waterGeo.quads,
    }
  };
}

export { buildWorld as buildScene };
