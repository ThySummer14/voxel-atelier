// 极夜流火 · 动态极光天幕系统 (Procedural Aurora Borealis Sky Ribbon)
// 包含多频正弦叠加波动、翡翠翠绿与紫罗兰流光辉映

import * as THREE from '../vendor/three.module.js';

export class AuroraSky {
  constructor(scene) {
    this.scene = scene;
    this.ribbons = [];
    this.time = 0;
    this.init();
  }

  init() {
    // 构建 3 层不同高度与跨度的极光光幕
    const configs = [
      { yBase: 120, zMin: -240, zMax: 240, xOffset: -50, amp: 24, colorHex: 0x06d6a0, alpha: 0.65 },
      { yBase: 145, zMin: -260, zMax: 260, xOffset: 20, amp: 32, colorHex: 0x64dfdf, alpha: 0.50 },
      { yBase: 160, zMin: -220, zMax: 220, xOffset: -90, amp: 28, colorHex: 0x7209b7, alpha: 0.40 }
    ];

    for (const cfg of configs) {
      const segmentsZ = 48;
      const heightSegments = 8;
      const geom = new THREE.PlaneGeometry(
        cfg.zMax - cfg.zMin, // 沿 Z 轴跨度
        60,                  // 极光幕布垂直高度
        segmentsZ,
        heightSegments
      );

      // 调整朝向：使平面沿 Z 轴展开，法向大致朝 X 侧
      geom.rotateY(Math.PI * 0.5);

      const count = geom.attributes.position.count;
      const colors = new Float32Array(count * 3);
      const baseCol = new THREE.Color(cfg.colorHex);

      // 顶点颜色渐变 (底部翠绿明亮，顶部渐隐为深空青紫)
      for (let i = 0; i < count; i++) {
        const py = geom.attributes.position.getY(i);
        const normH = (py + 30) / 60; // 0.0 bottom, 1.0 top
        const col = baseCol.clone();
        if (normH > 0.6) {
          col.lerp(new THREE.Color(0x3a0ca3), (normH - 0.6) * 2.0);
        }
        // 底部与顶部边缘柔和过渡
        const edgeFade = Math.sin(normH * Math.PI);
        col.multiplyScalar(edgeFade);

        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: cfg.alpha,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(cfg.xOffset, cfg.yBase, 0);
      this.scene.add(mesh);

      // 保存初始顶点以供波动动画
      this.ribbons.push({
        mesh,
        geom,
        cfg,
        origPositions: geom.attributes.position.clone()
      });
    }
  }

  update(dt) {
    this.time += dt;
    for (let r = 0; r < this.ribbons.length; r++) {
      const item = this.ribbons[r];
      const pos = item.geom.attributes.position;
      const orig = item.origPositions;
      const count = pos.count;
      const t = this.time * 0.8 + r * 1.5;

      for (let i = 0; i < count; i++) {
        const oz = orig.getZ(i);
        const oy = orig.getY(i);
        // 双频正弦波叠加横向起伏
        const waveX = Math.sin(oz * 0.02 + t) * item.cfg.amp +
                      Math.sin(oz * 0.05 - t * 0.7) * (item.cfg.amp * 0.4);
        // 纵向呼吸
        const waveY = Math.cos(oz * 0.015 + t * 0.6) * 4.0;

        pos.setX(i, orig.getX(i) + waveX);
        pos.setY(i, oy + waveY);
      }
      pos.needsUpdate = true;
    }
  }
}
