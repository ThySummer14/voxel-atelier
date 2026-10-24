// 极夜流火 · 华氏配气机构 3D 动态渲染器 (Walschaerts Linkage 3D Mesh Engine)
// 高效复用 Three.js 精钢材质网格，每帧实时驱动 10 根联动杆系与 6 只巨型动轮

import * as THREE from '../vendor/three.module.js';
import { SPEC } from './spec.js';

export class LinkageRenderer {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    // 材质定义
    this.steelMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      metalness: 0.88,
      roughness: 0.22
    });
    this.darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x414853,
      metalness: 0.80,
      roughness: 0.45
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.75,
      roughness: 0.30
    });
    this.redMat = new THREE.MeshStandardMaterial({
      color: 0x9e2226,
      metalness: 0.50,
      roughness: 0.40
    });

    // 左右两侧连杆容器
    this.sides = {
      left: this.createSideRig(-24 * SPEC.VOXEL_SIZE_M, false),
      right: this.createSideRig(24 * SPEC.VOXEL_SIZE_M, true)
    };
  }

  // 创建单侧杆系网格
  createSideRig(xPos, isRight) {
    const grp = new THREE.Group();
    grp.position.x = xPos;
    this.root.add(grp);

    // 辅助创建两点间圆柱连杆的几何
    const makeRod = (radius, colorMat = this.steelMat) => {
      const geom = new THREE.CylinderGeometry(radius, radius, 1, 10);
      geom.rotateZ(Math.PI * 0.5); // 沿 X 轴方向对准
      const mesh = new THREE.Mesh(geom, colorMat);
      mesh.castShadow = true;
      grp.add(mesh);
      return mesh;
    };

    // 1. 十字头滑块 (Crosshead)
    const crossheadGeom = new THREE.BoxGeometry(
      0.18,
      0.35,
      SPEC.CROSSHEAD_GUIDE_LENGTH * SPEC.VOXEL_SIZE_M * 0.5
    );
    const crossheadMesh = new THREE.Mesh(crossheadGeom, this.steelMat);
    grp.add(crossheadMesh);

    // 2. 活塞杆 (Piston Rod: 伸入汽缸)
    const pistonRodGeom = new THREE.CylinderGeometry(0.045, 0.045, 1.2, 8);
    pistonRodGeom.rotateX(Math.PI * 0.5);
    const pistonRodMesh = new THREE.Mesh(pistonRodGeom, this.steelMat);
    grp.add(pistonRodMesh);

    // 3. 主连杆 (Main Connecting Rod: 十字头到主曲柄销)
    const mainRod = makeRod(0.065);

    // 4. 侧连杆 (Side Coupling Rods: 前中、中后动轮)
    const frontSideRod = makeRod(0.055);
    const rearSideRod = makeRod(0.055);

    // 5. 回转偏心曲柄 (Return Crank)
    const eccCrank = makeRod(0.045, this.darkSteelMat);

    // 6. 偏心拉杆 (Eccentric Rod: 偏心销到导管底脚)
    const eccRod = makeRod(0.038);

    // 7. 膨胀导弯管 (Curved Expansion Link)
    const linkGeom = new THREE.BoxGeometry(0.08, 0.95, 0.16);
    const linkMesh = new THREE.Mesh(linkGeom, this.darkSteelMat);
    grp.add(linkMesh);

    // 8. 滑板连杆 (Radius Rod: 导管滑块到合并杆)
    const radRod = makeRod(0.042);

    // 9. 合并杆 (Combination Lever: 垂向连杆)
    const combLever = makeRod(0.045);

    // 10. 配气活塞阀杆 (Valve Spindle: 伸入阀箱)
    const valveRodGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8);
    valveRodGeom.rotateX(Math.PI * 0.5);
    const valveRodMesh = new THREE.Mesh(valveRodGeom, this.steelMat);
    grp.add(valveRodMesh);

    // 11. 双层镜面十字头滑道导轨 (Crosshead Guide Bars)
    const guideGeom = new THREE.BoxGeometry(0.08, 0.08, 1.4);
    const topGuide = new THREE.Mesh(guideGeom, this.steelMat);
    const btmGuide = new THREE.Mesh(guideGeom, this.steelMat);
    topGuide.position.set(0, (SPEC.CROSSHEAD_Y + 4) * SPEC.VOXEL_SIZE_M, 1.8);
    btmGuide.position.set(0, (SPEC.CROSSHEAD_Y - 4) * SPEC.VOXEL_SIZE_M, 1.8);
    grp.add(topGuide);
    grp.add(btmGuide);

    return {
      grp,
      crossheadMesh,
      pistonRodMesh,
      mainRod,
      frontSideRod,
      rearSideRod,
      eccCrank,
      eccRod,
      linkMesh,
      radRod,
      combLever,
      valveRodMesh
    };
  }

  // 辅助函数：根据两点 (y0, z0) 到 (y1, z1) 定位与缩放连杆
  orientRod(mesh, y0, z0, y1, z1) {
    const dy = y1 - y0;
    const dz = z1 - z0;
    const length = Math.hypot(dy, dz);
    const midY = (y0 + y1) * 0.5;
    const midZ = (z0 + z1) * 0.5;

    mesh.position.set(0, midY, midZ);
    mesh.rotation.x = Math.atan2(dy, dz);
    mesh.scale.set(1, 1, Math.max(0.01, length));
  }

  // 每帧更新左右杆系姿态
  update(kinematics) {
    const S = SPEC.VOXEL_SIZE_M;

    for (const [sideKey, isRight] of [['left', false], ['right', true]]) {
      const state = kinematics.solveSide(isRight);
      const rig = this.sides[sideKey];

      // 1. 十字头与活塞杆
      const crossY = state.crosshead.y * S;
      const crossZ = state.crosshead.z * S;
      rig.crossheadMesh.position.set(0, crossY, crossZ);
      rig.pistonRodMesh.position.set(0, crossY, crossZ + 0.55);

      // 2. 主连杆 (十字头到中轮主曲柄销)
      const crankY = state.crank.y * S;
      const crankZ = state.crank.z * S;
      this.orientRod(rig.mainRod, crossY, crossZ, crankY, crankZ);

      // 3. 侧连杆 (前轮到中轮，中轮到后轮)
      const frontCrankY = state.frontCrank.y * S;
      const frontCrankZ = state.frontCrank.z * S;
      const rearCrankY = state.rearCrank.y * S;
      const rearCrankZ = state.rearCrank.z * S;
      this.orientRod(rig.frontSideRod, crankY, crankZ, frontCrankY, frontCrankZ);
      this.orientRod(rig.rearSideRod, crankY, crankZ, rearCrankY, rearCrankZ);

      // 4. 回转偏心曲柄 (主曲柄销到偏心销)
      const eccY = state.eccPin.y * S;
      const eccZ = state.eccPin.z * S;
      this.orientRod(rig.eccCrank, crankY, crankZ, eccY, eccZ);

      // 5. 偏心拉杆 (偏心销到导管底脚)
      const footY = state.linkFoot.y * S;
      const footZ = state.linkFoot.z * S;
      this.orientRod(rig.eccRod, eccY, eccZ, footY, footZ);

      // 6. 膨胀导管 (围绕固定支点偏转)
      rig.linkMesh.position.set(0, state.linkPivot.y * S, state.linkPivot.z * S);
      rig.linkMesh.rotation.x = state.linkAngle;

      // 7. 滑板连杆 (导管滑块到合并杆接点)
      const dieY = state.die.y * S;
      const dieZ = state.die.z * S;
      const radFrontY = state.radFront.y * S;
      const radFrontZ = state.radFront.z * S;
      this.orientRod(rig.radRod, dieY, dieZ, radFrontY, radFrontZ);

      // 8. 合并杆 (十字头吊点到配气阀杆)
      const combBottomY = state.combBottom.y * S;
      const combBottomZ = state.combBottom.z * S;
      const valveRodY = state.valveRod.y * S;
      const valveRodZ = state.valveRod.z * S;
      this.orientRod(rig.combLever, combBottomY, combBottomZ, valveRodY, valveRodZ);

      // 9. 配气活塞阀杆
      rig.valveRodMesh.position.set(0, valveRodY, valveRodZ + 0.4);
    }
  }
}
