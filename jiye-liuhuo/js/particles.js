// 极夜流火 · 动态体素粒子系统 (Voxel Particle Engine)
// 包含烟囱排汽烟羽、汽缸放水阀侧喷蒸汽、飞逸熔金火星与暴风雪飞雪

import * as THREE from '../vendor/three.module.js';
import { SPEC } from './spec.js';

export class ParticleEngine {
  constructor(scene) {
    this.scene = scene;

    // 1. 烟囱排汽烟羽 (Steam Puffs)
    this.maxSteam = 180;
    this.steamParticles = [];
    this.initSteamSystem();

    // 2. 飞逸熔金火星 (Firebox Sparks)
    this.maxSparks = 100;
    this.sparks = [];
    this.initSparkSystem();

    // 3. 极地暴风雪 (Blizzard Snowflakes)
    this.maxSnow = 400;
    this.snow = [];
    this.initSnowSystem();

    this.drainCocksOpen = true; // 汽缸排水阀开启状态 (起步时大喷蒸汽)
  }

  initSteamSystem() {
    // 采用 InstancedMesh 小立方体呈现体素水汽团
    const boxGeom = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const steamMat = new THREE.MeshLambertMaterial({
      color: 0xe8edf3,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    this.steamMesh = new THREE.InstancedMesh(boxGeom, steamMat, this.maxSteam);
    this.steamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.steamMesh);

    this.dummy = new THREE.Object3D();

    for (let i = 0; i < this.maxSteam; i++) {
      this.steamParticles.push({
        active: false,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        scale: 0.2,
        life: 0,
        maxLife: 1.0
      });
      this.dummy.position.set(0, -999, 0);
      this.dummy.updateMatrix();
      this.steamMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.steamMesh.instanceMatrix.needsUpdate = true;
  }

  initSparkSystem() {
    const sparkGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxSparks * 3);
    const colors = new Float32Array(this.maxSparks * 3);

    for (let i = 0; i < this.maxSparks; i++) {
      positions[i * 3 + 1] = -999;
      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.2;
      this.sparks.push({
        active: false,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0, maxLife: 1.2
      });
    }

    sparkGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.sparkPoints = new THREE.Points(sparkGeom, sparkMat);
    this.scene.add(this.sparkPoints);
  }

  initSnowSystem() {
    const snowGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxSnow * 3);

    for (let i = 0; i < this.maxSnow; i++) {
      const sx = (Math.random() - 0.5) * 80;
      const sy = Math.random() * 40 - 10;
      const sz = (Math.random() - 0.5) * 120;
      positions[i * 3 + 0] = sx;
      positions[i * 3 + 1] = sy;
      positions[i * 3 + 2] = sz;

      this.snow.push({
        x: sx, y: sy, z: sz,
        vx: -1.2 + (Math.random() - 0.5) * 0.8,
        vy: -2.0 - Math.random() * 2.0,
        vz: -4.0 - Math.random() * 3.0
      });
    }

    snowGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xf0f4f8,
      size: 0.12,
      transparent: true,
      opacity: 0.85
    });

    this.snowPoints = new THREE.Points(snowGeom, snowMat);
    this.scene.add(this.snowPoints);
  }

  // 释放一团烟囱排汽
  emitSteamPuff(intensity = 1.0) {
    const chimneyPos = {
      x: 0,
      y: (SPEC.BOILER_CENTER_Y + 38) * SPEC.VOXEL_SIZE_M, // Y ≈ 4.6m
      z: 62 * SPEC.VOXEL_SIZE_M                            // Z ≈ 3.1m
    };

    let spawned = 0;
    for (let i = 0; i < this.steamParticles.length && spawned < 3; i++) {
      const p = this.steamParticles[i];
      if (!p.active) {
        p.active = true;
        p.x = chimneyPos.x + (Math.random() - 0.5) * 0.2;
        p.y = chimneyPos.y;
        p.z = chimneyPos.z;
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = 2.5 + Math.random() * 2.0;
        p.vz = -5.0 - Math.random() * 4.0; // 随车速高速后冲
        p.scale = 0.3 * intensity;
        p.life = 0;
        p.maxLife = 1.2 + Math.random() * 0.6;
        spawned++;
      }
    }

    // 随机释放火星
    for (let i = 0; i < this.sparks.length; i++) {
      const s = this.sparks[i];
      if (!s.active && Math.random() < 0.4) {
        s.active = true;
        s.x = chimneyPos.x + (Math.random() - 0.5) * 0.15;
        s.y = chimneyPos.y;
        s.z = chimneyPos.z;
        s.vx = (Math.random() - 0.5) * 1.5;
        s.vy = 4.0 + Math.random() * 3.5;
        s.vz = -8.0 - Math.random() * 6.0;
        s.life = 0;
        s.maxLife = 0.8 + Math.random() * 0.5;
        break;
      }
    }
  }

  update(dt, speedKmh = 72) {
    const speedRatio = speedKmh / 72.0;

    // 1. 更新烟囱排汽
    let updatedAnySteam = false;
    for (let i = 0; i < this.steamParticles.length; i++) {
      const p = this.steamParticles[i];
      if (p.active) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          this.dummy.position.set(0, -999, 0);
          this.dummy.scale.set(1, 1, 1);
          this.dummy.updateMatrix();
          this.steamMesh.setMatrixAt(i, this.dummy.matrix);
          updatedAnySteam = true;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += (p.vz - speedRatio * 3.0) * dt;
          p.scale += dt * 1.4; // 逐渐扩散膨胀
          this.dummy.position.set(p.x, p.y, p.z);
          this.dummy.scale.set(p.scale, p.scale, p.scale);
          this.dummy.updateMatrix();
          this.steamMesh.setMatrixAt(i, this.dummy.matrix);
          updatedAnySteam = true;
        }
      }
    }
    if (updatedAnySteam) this.steamMesh.instanceMatrix.needsUpdate = true;

    // 2. 更新火星
    const sparkPos = this.sparkPoints.geometry.attributes.position;
    for (let i = 0; i < this.sparks.length; i++) {
      const s = this.sparks[i];
      if (s.active) {
        s.life += dt;
        if (s.life >= s.maxLife) {
          s.active = false;
          sparkPos.setXYZ(i, 0, -999, 0);
        } else {
          s.x += s.vx * dt;
          s.y += (s.vy - 4.0 * s.life) * dt; // 重力下坠
          s.z += s.vz * dt;
          sparkPos.setXYZ(i, s.x, s.y, s.z);
        }
      }
    }
    sparkPos.needsUpdate = true;

    // 3. 更新风雪
    const snowPos = this.snowPoints.geometry.attributes.position;
    for (let i = 0; i < this.snow.length; i++) {
      const sn = this.snow[i];
      sn.x += sn.vx * dt;
      sn.y += sn.vy * dt;
      sn.z += (sn.vz - speedRatio * 4.0) * dt;

      // 边界循环重置
      if (sn.y < -30) sn.y = 30;
      if (sn.z < -60) sn.z = 60;
      if (sn.x < -40) sn.x = 40;

      snowPos.setXYZ(i, sn.x, sn.y, sn.z);
    }
    snowPos.needsUpdate = true;
  }
}
