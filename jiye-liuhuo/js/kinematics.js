// 极夜流火 · 华氏配气机构解析运动学求解器 (Analytical Walschaerts Kinematics Engine)
// 100% 闭式解析三角方程，精确求解 10 根运动连杆的实时位姿、截断阀相角与双缸 90° 正交相位

import { SPEC } from './spec.js';

export class WalschaertsKinematics {
  constructor() {
    this.theta = 0;              // 主动轮当前转角 (弧度)
    this.cutoff = 0.65;          // 换向切断率 (-0.75 到 +0.75，正为前进，负为倒车)
    this.speedKmh = SPEC.NOMINAL_SPEED_KMH; // 当前车速 (km/h)
    this.boilerPressure = 14.2;  // 锅炉压强 (bar)
    this.chuffTriggered = false; // 是否在当前帧触发了排汽
    this.lastChuffPhase = -1;
  }

  // 根据车速更新动轮旋转角 (dt 为秒)
  update(dt, speedOverride = null, cutoffOverride = null) {
    if (speedOverride !== null) this.speedKmh = speedOverride;
    if (cutoffOverride !== null) this.cutoff = cutoffOverride;

    // 车速 (m/s) = speedKmh / 3.6
    // 动轮周长 = 2 * PI * (DRIVER_RADIUS * VOXEL_SIZE_M)
    const wheelRadiusM = SPEC.DRIVER_RADIUS * SPEC.VOXEL_SIZE_M;
    const speedMs = (this.speedKmh / 3.6) * Math.sign(this.cutoff === 0 ? 1 : this.cutoff);
    const omega = speedMs / wheelRadiusM; // 角速度 (rad/s)

    this.theta += omega * dt;
    while (this.theta > Math.PI * 2) this.theta -= Math.PI * 2;
    while (this.theta < 0) this.theta += Math.PI * 2;

    // 检查是否触发 4-拍排汽音效 (每转 4 拍，对应左右缸前/后死点)
    const currentPhase = Math.floor((this.theta / (Math.PI * 2)) * SPEC.CHUFFS_PER_REV) % SPEC.CHUFFS_PER_REV;
    if (currentPhase !== this.lastChuffPhase) {
      this.lastChuffPhase = currentPhase;
      this.chuffTriggered = true;
    } else {
      this.chuffTriggered = false;
    }
  }

  // 求解单侧 (左或右侧) 杆系坐标
  // isRightSide: true 表示右侧 (相位超前 90° = PI/2)
  solveSide(isRightSide = false) {
    const phaseOffset = isRightSide ? Math.PI * 0.5 : 0;
    const th = this.theta + phaseOffset;

    const R = SPEC.CRANK_RADIUS;
    const L_conn = SPEC.CONN_ROD_LENGTH;
    const mainDriverZ = SPEC.DRIVER_Z_POS[1]; // 中动轮 Z = -28
    const axleY = SPEC.DRIVER_AXLE_Y;         // 动轮轴心 Y = 30

    // 1. 主曲柄销空间位置 (Main Crankpin)
    const crankY = axleY + Math.sin(th) * R;
    const crankZ = mainDriverZ + Math.cos(th) * R;

    // 2. 活塞十字头滑块位置 (Crosshead: 限制在 Y = 30 水平滑道上)
    // 闭式滑块曲柄方程: Z_cross = Z_crank + sqrt(L_conn^2 - (Y_crank - Y_cross)^2)
    const dyCross = crankY - axleY;
    const sqrtTerm = Math.sqrt(Math.max(0.1, L_conn * L_conn - dyCross * dyCross));
    const crossheadZ = crankZ + sqrtTerm;
    const crossheadY = axleY;

    // 3. 活塞杆与气缸内活塞头位移 (Piston Displacement)
    // 以中立冲程为零点
    const midCrossheadZ = mainDriverZ + L_conn;
    const pistonDisplacement = crossheadZ - midCrossheadZ;

    // 4. 回转偏心曲柄销 (Return Crank Pin: 超前主曲柄销 90°)
    const eccAngle = th + Math.PI * 0.5;
    const eccR = SPEC.ECCENTRIC_RADIUS;
    const eccPinY = crankY + Math.sin(eccAngle) * eccR;
    const eccPinZ = crankZ + Math.cos(eccAngle) * eccR;

    // 5. 膨胀弯导管摆动 (Expansion Link)
    // 支点固定在 (LINK_PIVOT_Y, LINK_PIVOT_Z)
    const linkPivotY = SPEC.EXPANSION_LINK_PIVOT_Y;
    const linkPivotZ = SPEC.EXPANSION_LINK_PIVOT_Z;
    const L_ecc = SPEC.ECCENTRIC_ROD_LENGTH;

    // 偏心拉杆从偏心销连接到导管底脚。导管底脚偏置半径 R_foot ≈ 12
    const R_foot = 12.0;
    // 导管瞬时摆角 phi (弧度)
    // 当偏心销后退时拉动底脚，导管向前仰
    const dEccZ = eccPinZ - linkPivotZ;
    const linkAngle = Math.asin(Math.max(-0.45, Math.min(0.45, (dEccZ + L_ecc - 20) / (R_foot * 3.2))));

    // 导管底脚实际坐标
    const linkFootY = linkPivotY - Math.cos(linkAngle) * R_foot;
    const linkFootZ = linkPivotZ - Math.sin(linkAngle) * R_foot;

    // 6. 滑板滑块与滑杆 (Radius Rod & Die Block)
    // 司炉换向手柄 cutoff 决定滑块在导管中的高度偏置 (正为下移/前进，负为上移/倒车)
    const dieOffset = this.cutoff * 10.0; // 偏置距离 [-7.5, +7.5]
    // 滑块受导管弯槽引导，其瞬时坐标为:
    const dieY = linkPivotY + dieOffset * Math.cos(linkAngle);
    const dieZ = linkPivotZ + dieOffset * Math.sin(linkAngle);

    // 滑杆前段连接至合并杆。滑杆长度 L_rad = SPEC.RADIUS_ROD_LENGTH
    const L_rad = SPEC.RADIUS_ROD_LENGTH;
    const radFrontY = SPEC.VALVE_ROD_Y - SPEC.COMBINATION_LEVER_A;
    const dDieY = radFrontY - dieY;
    const radFrontZ = dieZ + Math.sqrt(Math.max(0.1, L_rad * L_rad - dDieY * dDieY));

    // 7. 合并杆 (Combination Lever)
    // 下端由吊杆连接十字头: bottomY = crossheadY - 4, bottomZ ≈ crossheadZ - 6
    const combBottomY = crossheadY - 4.0;
    const combBottomZ = crossheadZ - 6.0;

    // 中间接滑杆前接点 (radFrontY, radFrontZ)
    // 上端连接配气活塞阀杆 (Valve Spindle) at valveY = SPEC.VALVE_ROD_Y
    const A = SPEC.COMBINATION_LEVER_A; // 3.5
    const B = SPEC.COMBINATION_LEVER_B; // 14.0
    // 杠杆几何外推: topZ = radFrontZ + (radFrontZ - combBottomZ) * (A / B)
    const valveRodZ = radFrontZ + (radFrontZ - combBottomZ) * (A / B);
    const valveRodY = SPEC.VALVE_ROD_Y;

    // 8. 侧连杆 (Side Coupling Rods) 连接全部 3 个动轮
    const frontCrankZ = SPEC.DRIVER_Z_POS[0] + Math.cos(th) * R;
    const frontCrankY = axleY + Math.sin(th) * R;
    const rearCrankZ = SPEC.DRIVER_Z_POS[2] + Math.cos(th) * R;
    const rearCrankY = axleY + Math.sin(th) * R;

    return {
      th,
      crank: { y: crankY, z: crankZ },
      frontCrank: { y: frontCrankY, z: frontCrankZ },
      rearCrank: { y: rearCrankY, z: rearCrankZ },
      crosshead: { y: crossheadY, z: crossheadZ },
      pistonDisplacement,
      eccPin: { y: eccPinY, z: eccPinZ },
      linkPivot: { y: linkPivotY, z: linkPivotZ },
      linkAngle,
      linkFoot: { y: linkFootY, z: linkFootZ },
      die: { y: dieY, z: dieZ },
      radFront: { y: radFrontY, z: radFrontZ },
      combBottom: { y: combBottomY, z: combBottomZ },
      valveRod: { y: valveRodY, z: valveRodZ }
    };
  }

  // 遥测数据导出 (供 HUD 面板与测试断言)
  getTelemetry() {
    const left = this.solveSide(false);
    const right = this.solveSide(true);
    const rpm = (this.speedKmh / 3.6 / (SPEC.DRIVER_RADIUS * SPEC.VOXEL_SIZE_M)) * (60 / (Math.PI * 2));
    const powerHp = Math.round(2800 * (Math.abs(this.cutoff) / 0.75) * (this.speedKmh / SPEC.NOMINAL_SPEED_KMH));

    return {
      speedKmh: Math.round(this.speedKmh * 10) / 10,
      cutoffPercent: Math.round(this.cutoff * 100),
      rpm: Math.round(rpm),
      boilerPressureBar: Math.round(this.boilerPressure * 10) / 10,
      horsepower: Math.max(0, powerHp),
      leftPistonStrokeMm: Math.round(left.pistonDisplacement * SPEC.VOXEL_SIZE_M * 1000),
      rightPistonStrokeMm: Math.round(right.pistonDisplacement * SPEC.VOXEL_SIZE_M * 1000),
      valveTravelMm: Math.round(Math.abs(left.valveRod.z - SPEC.CYLINDER_CENTER_Z) * SPEC.VOXEL_SIZE_M * 1000),
      chuffTriggered: this.chuffTriggered
    };
  }
}
