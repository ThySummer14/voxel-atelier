// 极夜流火 · 体素网格渲染几何提取器 (Voxel AO Mesher)
// 包含 6 面可见性剔除、4 顶点环境光遮蔽 (AO) 梯度计算与线性色彩顶点烘焙

import * as THREE from '../../vendor/three.module.js';
import { PALETTE_LINEAR, PALETTE_EMIT } from '../palette.js';
import { SPEC } from '../spec.js';

// 6 个面法向及其基底轴
const FACES = [
  // 0: +Y (Top)
  { dir: [0, 1, 0], norm: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], light: 1.00 },
  // 1: -Y (Bottom)
  { dir: [0, -1, 0], norm: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1], light: 0.58 },
  // 2: +Z (Front)
  { dir: [0, 0, 1], norm: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], light: 0.88 },
  // 3: -Z (Rear)
  { dir: [0, 0, -1], norm: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], light: 0.80 },
  // 4: +X (Right)
  { dir: [1, 0, 0], norm: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], light: 0.74 },
  // 5: -X (Left)
  { dir: [-1, 0, 0], norm: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], light: 0.78 }
];

export class VoxelMesher {
  // 计算某面某角的顶点 AO 级数 (0: 重度遮挡, 3: 无遮挡)
  static vertexAO(side1, side2, corner) {
    if (side1 && side2) return 0;
    return 3 - (side1 + side2 + corner);
  }

  // 映射 AO 级数至明度缩放系数 [0.55 .. 1.0]
  static aoFactor(ao) {
    switch (ao) {
      case 0: return 0.55;
      case 1: return 0.70;
      case 2: return 0.85;
      case 3: default: return 1.00;
    }
  }

  // 构建 BufferGeometry
  static buildGeometry(grid, voxelScale = SPEC.VOXEL_SIZE_M) {
    const positions = [];
    const normals = [];
    const colors = [];
    const uvs = [];

    // 预备查询辅助闭包
    const isSolid = (x, y, z) => grid.has(x, y, z);

    grid.forEach((x, y, z, colorId) => {
      const baseR = PALETTE_LINEAR[colorId * 3 + 0];
      const baseG = PALETTE_LINEAR[colorId * 3 + 1];
      const baseB = PALETTE_LINEAR[colorId * 3 + 2];
      const emit = PALETTE_EMIT[colorId];

      for (let f = 0; f < 6; f++) {
        const face = FACES[f];
        const [dx, dy, dz] = face.dir;
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;

        // 如果邻居非实体，该面暴露在外，需渲染
        if (!isSolid(nx, ny, nz)) {
          const [ux, uy, uz] = face.u;
          const [vx, vy, vz] = face.v;
          const [normX, normY, normZ] = face.norm;
          const lightWeight = emit > 0.3 ? 1.0 : face.light;

          // 计算面的 4 个顶点在该外侧表面的 AO (4 角)
          // 4 个角的偏移分别为: (-0.5, -0.5), (0.5, -0.5), (0.5, 0.5), (-0.5, 0.5) 在 (u, v) 平面
          const sU_neg = isSolid(nx - ux, ny - uy, nz - uz) ? 1 : 0;
          const sU_pos = isSolid(nx + ux, ny + uy, nz + uz) ? 1 : 0;
          const sV_neg = isSolid(nx - vx, ny - vy, nz - vz) ? 1 : 0;
          const sV_pos = isSolid(nx + vx, ny + vy, nz + vz) ? 1 : 0;

          const c_nn = isSolid(nx - ux - vx, ny - uy - vy, nz - uz - vz) ? 1 : 0;
          const c_pn = isSolid(nx + ux - vx, ny + uy - vy, nz + uz - vz) ? 1 : 0;
          const c_pp = isSolid(nx + ux + vx, ny + uy + vy, nz + uz + vz) ? 1 : 0;
          const c_np = isSolid(nx - ux + vx, ny - uy + vy, nz - uz + vz) ? 1 : 0;

          const ao0 = emit > 0.3 ? 1.0 : this.aoFactor(this.vertexAO(sU_neg, sV_neg, c_nn));
          const ao1 = emit > 0.3 ? 1.0 : this.aoFactor(this.vertexAO(sU_pos, sV_neg, c_pn));
          const ao2 = emit > 0.3 ? 1.0 : this.aoFactor(this.vertexAO(sU_pos, sV_pos, c_pp));
          const ao3 = emit > 0.3 ? 1.0 : this.aoFactor(this.vertexAO(sU_neg, sV_pos, c_np));

          // 顶点局部中心点在体素外表面 (x + dx*0.5, y + dy*0.5, z + dz*0.5)
          const cx = (x + dx * 0.5) * voxelScale;
          const cy = (y + dy * 0.5) * voxelScale;
          const cz = (z + dz * 0.5) * voxelScale;

          const halfU = voxelScale * 0.5;
          const halfV = voxelScale * 0.5;

          // 4 个顶点空间位置
          const p0 = [
            cx - ux * halfU - vx * halfV,
            cy - uy * halfU - vy * halfV,
            cz - uz * halfU - vz * halfV
          ];
          const p1 = [
            cx + ux * halfU - vx * halfV,
            cy + uy * halfU - vy * halfV,
            cz + uz * halfU - vz * halfV
          ];
          const p2 = [
            cx + ux * halfU + vx * halfV,
            cy + uy * halfU + vy * halfV,
            cz + uz * halfU + vz * halfV
          ];
          const p3 = [
            cx - ux * halfU + vx * halfV,
            cy - uy * halfU + vy * halfV,
            cz - uz * halfU + vz * halfV
          ];

          // 颜色加权计算 (底色 × 方向光权重 × 顶点 AO + 自发光增强)
          const pushVert = (p, ao) => {
            positions.push(p[0], p[1], p[2]);
            normals.push(normX, normY, normZ);
            const intensity = lightWeight * ao;
            if (emit > 0) {
              // 自发光材质保持高饱和度与亮度
              colors.push(
                Math.min(1.0, baseR * (1.0 + emit * 0.5)),
                Math.min(1.0, baseG * (1.0 + emit * 0.5)),
                Math.min(1.0, baseB * (1.0 + emit * 0.5))
              );
            } else {
              colors.push(baseR * intensity, baseG * intensity, baseB * intensity);
            }
          };

          // 三角剖分 (考虑 AO 对角线平滑插值: 选择较亮的对角线以避免非对称三角暗角)
          if (ao0 + ao2 > ao1 + ao3) {
            // 三角形 1: p0 -> p1 -> p2
            pushVert(p0, ao0); uvs.push(0, 0);
            pushVert(p1, ao1); uvs.push(1, 0);
            pushVert(p2, ao2); uvs.push(1, 1);
            // 三角形 2: p0 -> p2 -> p3
            pushVert(p0, ao0); uvs.push(0, 0);
            pushVert(p2, ao2); uvs.push(1, 1);
            pushVert(p3, ao3); uvs.push(0, 1);
          } else {
            // 三角形 1: p1 -> p2 -> p3
            pushVert(p1, ao1); uvs.push(1, 0);
            pushVert(p2, ao2); uvs.push(1, 1);
            pushVert(p3, ao3); uvs.push(0, 1);
            // 三角形 2: p1 -> p3 -> p0
            pushVert(p1, ao1); uvs.push(1, 0);
            pushVert(p3, ao3); uvs.push(0, 1);
            pushVert(p0, ao0); uvs.push(0, 0);
          }
        }
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return geom;
  }
}
