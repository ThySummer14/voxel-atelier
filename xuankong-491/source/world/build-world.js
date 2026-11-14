// Master World Builder for 《悬空千仞 · XUANKONG 491》
// Coordinates VoxelGrid creation, Cliff & Valley generation, Hanging Temple construction, and Greedy Meshing.

import { VoxelGrid, buildGreedyMeshes } from '../core/voxel-engine.js';
import { buildCliffAndValley } from './cliff.js';
import { buildHangingTemple } from './temple.js';

export const VOXEL_SIZE = 0.25; // 1 voxel = 25 cm

export const WORLD_BOUNDS = {
  minX: -52,
  maxX: 96,   // 148 voxels = 37m East-West cutaway depth
  minY: 0,
  maxY: 256,  // 256 voxels = 64m sheer vertical height!
  minZ: -124,
  maxZ: 124,  // 248 voxels = 62m North-South gorge length
};

export function generateWorld() {
  const t0 = performance.now();
  const grid = new VoxelGrid(WORLD_BOUNDS);
  const anchors = {};

  // Step 1: Sculpt Jinlong Gorge ochre-red dolomite cliff, overhanging canopy, Tangyu River, stone bridge, pines, & Li Bai stele
  buildCliffAndValley(grid, anchors);

  // Step 2: Construct the complete 491 AD Hanging Temple & deeply embedded hemlock beam mechanics
  buildHangingTemple(grid, anchors);

  const t1 = performance.now();
  const stats = grid.countStats();

  // Step 3: Multi-group Greedy Meshing with 27-neighbor smooth baked Ambient Occlusion
  const meshed = buildGreedyMeshes(grid, VOXEL_SIZE);
  const t2 = performance.now();

  // Convert voxel anchor coords to Three.js world space
  const worldAnchors = {};
  for (const [k, v] of Object.entries(anchors)) {
    worldAnchors[k] = {
      x: v.x * VOXEL_SIZE,
      y: v.y * VOXEL_SIZE,
      z: v.z * VOXEL_SIZE,
    };
  }

  return {
    grid,
    meshed,
    anchors: worldAnchors,
    voxelAnchors: anchors,
    stats: {
      solidVoxels: stats.solid,
      byGroup: stats.byGroup,
      totalQuads: meshed.totalQuads,
      totalTris: meshed.totalTris,
      buildMs: Math.round(t1 - t0),
      meshMs: Math.round(t2 - t1),
    },
  };
}
