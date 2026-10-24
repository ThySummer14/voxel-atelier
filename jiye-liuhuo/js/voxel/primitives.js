// 极夜流火 · 3D 体素几何光栅化器 (Procedural Voxel Rasterizer Primitives)
// 包含精准的圆柱、圆环、厚壁管道、车轮辐条与配重块光栅化算法

export class VoxelPrimitives {
  // 实体立方盒
  static box(grid, x0, y0, z0, x1, y1, z1, colorId) {
    const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          grid.set(x, y, z, colorId);
        }
      }
    }
  }

  // 空心立方盒
  static hollowBox(grid, x0, y0, z0, x1, y1, z1, wall, colorId) {
    const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const isWall = (x < minX + wall || x > maxX - wall ||
                          y < minY + wall || y > maxY - wall ||
                          z < minZ + wall || z > maxZ - wall);
          if (isWall) {
            grid.set(x, y, z, colorId);
          }
        }
      }
    }
  }

  // 沿 Z 轴的圆柱 (如锅炉主体)
  static cylinderZ(grid, cx, cy, z0, z1, radius, colorId) {
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);
    for (let dx = -rInt; dx <= rInt; dx++) {
      for (let dy = -rInt; dy <= rInt; dy++) {
        if (dx * dx + dy * dy <= r2) {
          for (let z = minZ; z <= maxZ; z++) {
            grid.set(cx + dx, cy + dy, z, colorId);
          }
        }
      }
    }
  }

  // 沿 Z 轴的空心圆管 (如锅炉壳体壁)
  static tubeZ(grid, cx, cy, z0, z1, innerR, outerR, colorId) {
    const minZ = Math.min(z0, z1), maxZ = Math.max(z0, z1);
    const rIn2 = innerR * innerR;
    const rOut2 = outerR * outerR;
    const rInt = Math.ceil(outerR);
    for (let dx = -rInt; dx <= rInt; dx++) {
      for (let dy = -rInt; dy <= rInt; dy++) {
        const d2 = dx * dx + dy * dy;
        if (d2 >= rIn2 && d2 <= rOut2) {
          for (let z = minZ; z <= maxZ; z++) {
            grid.set(cx + dx, cy + dy, z, colorId);
          }
        }
      }
    }
  }

  // 沿 Y 轴的圆柱 (如烟囱、汽包、砂箱、穹顶)
  static cylinderY(grid, cx, y0, y1, cz, radius, colorId) {
    const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);
    for (let dx = -rInt; dx <= rInt; dx++) {
      for (let dz = -rInt; dz <= rInt; dz++) {
        if (dx * dx + dz * dz <= r2) {
          for (let y = minY; y <= maxY; y++) {
            grid.set(cx + dx, y, cz + dz, colorId);
          }
        }
      }
    }
  }

  // 沿 X 轴的圆盘/车轮 (如车轮轮缘与轮心)
  static discX(grid, x0, x1, cy, cz, radius, colorId) {
    const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);
    for (let dy = -rInt; dy <= rInt; dy++) {
      for (let dz = -rInt; dz <= rInt; dz++) {
        if (dy * dy + dz * dz <= r2) {
          for (let x = minX; x <= maxX; x++) {
            grid.set(x, cy + dy, cz + dz, colorId);
          }
        }
      }
    }
  }

  // 实体球体 (如排障器铆钉球头、装饰铜球)
  static sphere(grid, cx, cy, cz, radius, colorId) {
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);
    for (let dx = -rInt; dx <= rInt; dx++) {
      for (let dy = -rInt; dy <= rInt; dy++) {
        for (let dz = -rInt; dz <= rInt; dz++) {
          if (dx * dx + dy * dy + dz * dz <= r2) {
            grid.set(cx + dx, cy + dy, cz + dz, colorId);
          }
        }
      }
    }
  }

  // 3D 粗线/连杆 (Bresenham 3D 扫掠圆柱，用于精钢运动连杆)
  static rod3D(grid, x0, y0, z0, x1, y1, z1, radius, colorId) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;
    const dist = Math.hypot(dx, dy, dz);
    if (dist === 0) {
      grid.set(Math.round(x0), Math.round(y0), Math.round(z0), colorId);
      return;
    }
    const steps = Math.ceil(dist * 2);
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);

    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const px = Math.round(x0 + dx * t);
      const py = Math.round(y0 + dy * t);
      const pz = Math.round(z0 + dz * t);

      if (radius <= 0.6) {
        grid.set(px, py, pz, colorId);
      } else {
        for (let ox = -rInt; ox <= rInt; ox++) {
          for (let oy = -rInt; oy <= rInt; oy++) {
            for (let oz = -rInt; oz <= rInt; oz++) {
              if (ox * ox + oy * oy + oz * oz <= r2) {
                grid.set(px + ox, py + oy, pz + oz, colorId);
              }
            }
          }
        }
      }
    }
  }

  // 排障器楔形扫雪铲 (Snowplow Cowcatcher)
  static cowcatcher(grid, apexZ, rearZ, width, height, baseY, colorId, pinstripeColorId) {
    const length = Math.abs(rearZ - apexZ);
    const halfW = width / 2;
    for (let z = apexZ; z >= rearZ; z--) {
      const progress = (apexZ - z) / length; // 0.0 at apex, 1.0 at rear
      const currentHalfW = Math.round(progress * halfW);
      const currentH = Math.round(progress * height);

      for (let y = baseY; y <= baseY + currentH; y++) {
        // V 型前刃与左右斜面
        for (let x = -currentHalfW; x <= currentHalfW; x++) {
          const isEdge = (Math.abs(x) === currentHalfW || x === 0 || y === baseY + currentH);
          const cid = (isEdge && pinstripeColorId) ? pinstripeColorId : colorId;
          // 只生成表面壳体，减轻格数
          if (Math.abs(x) >= currentHalfW - 1 || y === baseY || y === baseY + currentH) {
            grid.set(x, y, z, cid);
          }
        }
      }
    }
  }

  // 完整动轮光栅化：外轮箍、白边轮缘、轮心轴套、扇形配重块与曲柄销座
  static buildDriverWheel(grid, cx, cy, cz, radius, width, crankRadius, crankAngleRad, paletteIds) {
    const r2 = radius * radius;
    const innerRim2 = (radius - 3) * (radius - 3);
    const hubR2 = 5 * 5;
    const crankY = cy + Math.sin(crankAngleRad) * crankRadius;
    const crankZ = cz + Math.cos(crankAngleRad) * crankRadius;

    for (let x = cx - width; x <= cx + width; x++) {
      const isOuterEdge = (x === cx + width); // 面向外侧的一面
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const d2 = dy * dy + dz * dz;
          if (d2 > r2) continue;

          // 1. 轮缘与轮箍 (Rim & Tire)
          if (d2 >= innerRim2) {
            const isTire = d2 >= (radius - 1) * (radius - 1);
            grid.set(x, cy + dy, cz + dz, isTire && isOuterEdge ? paletteIds.rimWhite : paletteIds.darkSteel);
          }
          // 2. 轮毂中心轴套 (Wheel Hub，预留中心穿轴孔)
          else if (d2 <= 1.4 * 1.4) {
            // 轮心轴孔预留，供车轴穿插
            continue;
          }
          else if (d2 <= hubR2) {
            grid.set(x, cy + dy, cz + dz, paletteIds.darkSteel);
          }
          // 3. 扇形重锤配重 (Counterweight: 位于曲柄销对角 180 度方向的扇形扇面)
          else {
            const angle = Math.atan2(dy, dz);
            const counterAngle = crankAngleRad + Math.PI;
            let diffAngle = Math.abs(angle - counterAngle);
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
            diffAngle = Math.abs(diffAngle);

            // 配重覆盖角度 ±50 度 (0.87 rad)，半径较大处
            if (diffAngle < 0.88 && d2 >= (radius - 9) * (radius - 9)) {
              grid.set(x, cy + dy, cz + dz, paletteIds.darkSteel);
            } else {
              // 辐条 (16 根放射状车轮辐条)
              const spokeAngle = (angle + Math.PI * 2) % (Math.PI / 8);
              if (Math.abs(spokeAngle) < 0.08 || Math.abs(spokeAngle - Math.PI / 8) < 0.08) {
                grid.set(x, cy + dy, cz + dz, paletteIds.darkSteel);
              }
            }
          }
        }
      }
      // 4. 曲柄销凸起与红漆衬垫 (Crankpin Boss & Pin)
      if (isOuterEdge) {
        for (let px = x; px <= x + 2; px++) {
          for (let pdy = -2; pdy <= 2; pdy++) {
            for (let pdz = -2; pdz <= 2; pdz++) {
              if (pdy * pdy + pdz * pdz <= 4) {
                grid.set(px, Math.round(crankY) + pdy, Math.round(crankZ) + pdz, paletteIds.polishedSteel);
              }
            }
          }
        }
      }
    }
  }
}
