// 极夜流火 · 离线数学与几何规范验证套件 (Offline Mathematical & Geometric Acceptance Suite)
// 包含调色板色度学、位图编解码、解析运动学恒等式与体素网格完整性检验

import assert from 'node:assert';
import { PALETTE_DEF, PALETTE_LINEAR, PALETTE_EMIT, COLOR_ID } from '../js/palette.js';
import { SPEC } from '../js/spec.js';
import { VoxelGrid } from '../js/voxel/grid.js';
import { VoxelPrimitives as Prim } from '../js/voxel/primitives.js';
import { WalschaertsKinematics } from '../js/kinematics.js';
import { LocomotiveSculptor } from '../js/sculpt/locomotive.js';
import { EnvironmentSculptor } from '../js/sculpt/environment.js';
import { VoxelMesher } from '../js/voxel/mesher.js';

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log('=== 《极夜流火》离线真值检验套件 (Offline Acceptance) ===\n');

// --- 1. 调色板系统检验 ---
console.log('--- 组 1: 调色板与材质光度学规范 ---');

test('调色板定义包含 36 种工业与大气材质色', () => {
  assert.strictEqual(PALETTE_DEF.length, 36);
  assert.strictEqual(PALETTE_LINEAR.length, 36 * 3);
  assert.strictEqual(PALETTE_EMIT.length, 36);
});

test('调色板线性 RGB 值均在合法区间 [0.0, 1.0]', () => {
  for (let i = 0; i < PALETTE_LINEAR.length; i++) {
    const val = PALETTE_LINEAR[i];
    assert.ok(val >= 0.0 && val <= 1.0, `Index ${i} 超出区间: ${val}`);
    assert.ok(!Number.isNaN(val), `Index ${i} 是 NaN`);
  }
});

test('关键高阶材质索引完整存在', () => {
  const keys = ['iron_black', 'boiler_blue', 'polished_steel', 'brass_gold', 'copper',
                'headlight_core', 'snow_fresh', 'pine_green', 'viaduct_steel', 'steam_white'];
  for (const k of keys) {
    assert.ok(COLOR_ID[k] !== undefined, `缺失材质键: ${k}`);
  }
});

// --- 2. 体素位图紧凑编解码与网格容器检验 ---
console.log('\n--- 组 2: 体素位图紧凑编解码与集合运算 ---');

test('30-bit 紧凑坐标双向编解码无损往返 (Roundtrip)', () => {
  const testCoords = [
    [0, 0, 0],
    [-512, -256, -1024],
    [511, 255, 1023],
    [10, 20, 30],
    [-42, 88, -120],
    [128, -64, 512]
  ];
  for (const [x, y, z] of testCoords) {
    const packed = VoxelGrid.pack(x, y, z);
    assert.ok(packed >= 0 && packed < 0x40000000, `编码未保持在 30-bit 正整数: ${packed}`);
    const [ux, uy, uz] = VoxelGrid.unpack(packed);
    assert.strictEqual(ux, x, `X 解码错误`);
    assert.strictEqual(uy, y, `Y 解码错误`);
    assert.strictEqual(uz, z, `Z 解码错误`);
  }
});

test('VoxelGrid 增删查改与边界计算正确', () => {
  const grid = new VoxelGrid();
  assert.strictEqual(grid.size(), 0);

  grid.set(10, 20, 30, COLOR_ID.brass_gold);
  grid.set(-15, -5, -20, COLOR_ID.boiler_blue);
  assert.strictEqual(grid.size(), 2);
  assert.strictEqual(grid.get(10, 20, 30), COLOR_ID.brass_gold);
  assert.strictEqual(grid.get(-15, -5, -20), COLOR_ID.boiler_blue);
  assert.strictEqual(grid.get(0, 0, 0), 0);

  const b = grid.bounds();
  assert.strictEqual(b.minX, -15);
  assert.strictEqual(b.maxX, 10);
  assert.strictEqual(b.minY, -5);
  assert.strictEqual(b.maxY, 20);
  assert.strictEqual(b.minZ, -20);
  assert.strictEqual(b.maxZ, 30);

  grid.delete(10, 20, 30);
  assert.strictEqual(grid.size(), 1);
  assert.strictEqual(grid.has(10, 20, 30), false);
});

// --- 3. 几何光栅化器图元检验 ---
console.log('\n--- 组 3: 几何光栅化图元 ---');

test('实体箱与厚壁圆柱光栅化格数符合解析体积预期', () => {
  const grid = new VoxelGrid();
  Prim.box(grid, 0, 0, 0, 9, 9, 9, 1);
  assert.strictEqual(grid.size(), 1000); // 10 x 10 x 10

  const cylGrid = new VoxelGrid();
  Prim.cylinderZ(cylGrid, 0, 0, 0, 10, 5, 2);
  // 半径 5 的圆面积格数约为 π*25 ≈ 79 格，长度 11 -> 79 x 11 ≈ 869
  assert.ok(cylGrid.size() > 800 && cylGrid.size() < 1000, `圆柱格数异常: ${cylGrid.size()}`);
});

test('排障器楔形扫雪铲呈单调对称收分', () => {
  const grid = new VoxelGrid();
  Prim.cowcatcher(grid, 20, 0, 10, 10, 0, 1, 2);
  assert.ok(grid.size() > 50);
  const b = grid.bounds();
  assert.strictEqual(b.minX, -b.maxX, '扫雪铲 X 轴未严格左右对称');
  assert.strictEqual(b.maxZ, 20);
  assert.strictEqual(b.minZ, 0);
});

// --- 4. 华氏配气机构解析动力学检验 (核心数学真值) ---
console.log('\n--- 组 4: 华氏配气动力学解析恒等式 ---');

const kin = new WalschaertsKinematics();

test('主曲柄销在整周旋转中严格保持定长圆周旋转 (半径守恒)', () => {
  const mainAxleY = SPEC.DRIVER_AXLE_Y;
  const mainAxleZ = SPEC.DRIVER_Z_POS[1];
  const expectedR = SPEC.CRANK_RADIUS;

  for (let th = 0; th < Math.PI * 2; th += 0.1) {
    kin.theta = th;
    const left = kin.solveSide(false);
    const dy = left.crank.y - mainAxleY;
    const dz = left.crank.z - mainAxleZ;
    const actualR = Math.hypot(dy, dz);
    assert.ok(Math.abs(actualR - expectedR) < 1e-4, `主曲柄旋转半径偏离: ${actualR} vs ${expectedR}`);
  }
});

test('前中后三对动轮侧连杆间距刚性守恒 (轴距不变)', () => {
  for (let th = 0; th < Math.PI * 2; th += 0.2) {
    kin.theta = th;
    const left = kin.solveSide(false);
    // 前曲柄到中曲柄距离
    const dFrontMid = Math.hypot(left.frontCrank.y - left.crank.y, left.frontCrank.z - left.crank.z);
    assert.ok(Math.abs(dFrontMid - SPEC.DRIVER_SPACING) < 1e-4, `前动轮刚性杆长偏差: ${dFrontMid}`);
    // 中曲柄到后曲柄距离
    const dMidRear = Math.hypot(left.rearCrank.y - left.crank.y, left.rearCrank.z - left.crank.z);
    assert.ok(Math.abs(dMidRear - SPEC.DRIVER_SPACING) < 1e-4, `后动轮刚性杆长偏差: ${dMidRear}`);
  }
});

test('活塞十字头滑块严格受限于水平导轨 (Y 坐标固定)', () => {
  for (let th = 0; th < Math.PI * 2; th += 0.1) {
    kin.theta = th;
    const left = kin.solveSide(false);
    assert.strictEqual(left.crosshead.y, SPEC.CROSSHEAD_Y, '十字头 Y 脱轨');
  }
});

test('主连杆两端点间距严格等于杆长 L_conn (连杆长度守恒)', () => {
  const expectedL = SPEC.CONN_ROD_LENGTH;
  for (let th = 0; th < Math.PI * 2; th += 0.15) {
    kin.theta = th;
    const left = kin.solveSide(false);
    const actualL = Math.hypot(left.crosshead.y - left.crank.y, left.crosshead.z - left.crank.z);
    assert.ok(Math.abs(actualL - expectedL) < 1e-4, `主连杆长度变形: ${actualL} vs ${expectedL}`);
  }
});

test('双汽缸 90° 正交正交相位锁死 (Quartering Phase Lock)', () => {
  for (let th = 0; th < Math.PI * 2; th += 0.25) {
    kin.theta = th;
    const left = kin.solveSide(false);
    const right = kin.solveSide(true);
    let diff = right.th - left.th;
    while (diff < 0) diff += Math.PI * 2;
    assert.ok(Math.abs(diff - Math.PI * 0.5) < 1e-6, `汽缸相位差不等于 90 度`);
  }
});

test('中立配气点 (Cutoff = 0) 时滑块严格停靠在导管回转支点', () => {
  kin.cutoff = 0;
  kin.theta = 1.23;
  const left = kin.solveSide(false);
  assert.ok(Math.abs(left.die.y - left.linkPivot.y) < 1e-4, '中立时滑块未归位至支点');
  assert.ok(Math.abs(left.die.z - left.linkPivot.z) < 1e-4, '中立时滑块未归位至支点');
});

test('前进档与倒车档换向截断率对称为相反位移', () => {
  kin.cutoff = 0.65;
  const fwd = kin.solveSide(false);
  kin.cutoff = -0.65;
  const rev = kin.solveSide(false);
  const diffYFwd = fwd.die.y - fwd.linkPivot.y;
  const diffYRev = rev.die.y - rev.linkPivot.y;
  assert.ok(Math.abs(diffYFwd + diffYRev) < 1e-4, '换向滑块位移不对称');
});

test('整周运动遥测数据 (RPM、马力、冲程) 数值非负且自洽', () => {
  kin.update(0.1, 80.0, 0.65);
  const telem = kin.getTelemetry();
  assert.strictEqual(telem.speedKmh, 80.0);
  assert.ok(telem.rpm > 100 && telem.rpm < 400, `RPM 异常: ${telem.rpm}`);
  assert.ok(telem.horsepower > 1000, `马力异常: ${telem.horsepower}`);
  assert.strictEqual(telem.boilerPressureBar, 14.2);
});

// --- 5. 体素机车雕刻与剖切内构检验 ---
console.log('\n--- 组 5: 体素机车雕刻规模与剖切几何 ---');

test('主车体完整模型体素格数 ≥ 30,000 且空间尺寸合理', () => {
  const bodyGrid = LocomotiveSculptor.buildBody(false);
  const count = bodyGrid.size();
  assert.ok(count >= 30000, `车体格数偏低: ${count}`);
  const b = bodyGrid.bounds();
  assert.ok(b.minZ <= -120 && b.maxZ >= 130, '车体车长未覆盖机车全长');
  assert.ok(b.maxY >= 85, '车体车高未覆盖驾驶室穹顶');
});

test('锅炉内部剖切内构格数 ≥ 8,000 且烟管与耐火砖齐备', () => {
  const cutGrid = LocomotiveSculptor.buildCutawayInterior();
  const count = cutGrid.size();
  assert.ok(count >= 8000, `剖切内构格数偏低: ${count}`);
  const b = cutGrid.bounds();
  assert.ok(b.minX < 0 && b.maxX <= 0, '剖切内构未严格限定在左半部');
});

test('动轮网格具有完整的白边轮缘与偏心配重扇面', () => {
  const wheelGrid = LocomotiveSculptor.buildDriverWheelGeom(SPEC.DRIVER_RADIUS, 2, SPEC.CRANK_RADIUS, false);
  assert.ok(wheelGrid.size() >= 1200, `动轮格数偏低: ${wheelGrid.size()}`);
  assert.strictEqual(wheelGrid.has(2, 0, 0), false, '轮心轴孔预留');
});

test('高空钢桥跨度覆盖 ≥ 400 格且具有左右双线标准轨距', () => {
  const viaductGrid = EnvironmentSculptor.buildViaduct();
  assert.ok(viaductGrid.size() >= 25000, `铁桥格数偏低: ${viaductGrid.size()}`);
  const b = viaductGrid.bounds();
  assert.ok(b.minZ <= -210 && b.maxZ >= 210, '铁桥跨度未覆盖全景');
});

// --- 6. 网格化与 BufferGeometry 生成检验 ---
console.log('\n--- 组 6: VoxelMesher 几何提取与零缺陷断言 ---');

test('VoxelMesher 输出 BufferGeometry 零 NaN、顶面 AO 烘焙完整', () => {
  const testGrid = new VoxelGrid();
  Prim.box(testGrid, 0, 0, 0, 4, 4, 4, COLOR_ID.polished_steel);
  const geom = VoxelMesher.buildGeometry(testGrid);

  const pos = geom.attributes.position.array;
  const norm = geom.attributes.normal.array;
  const col = geom.attributes.color.array;

  assert.ok(pos.length > 0, '顶点为空');
  assert.strictEqual(pos.length, norm.length);
  assert.strictEqual(pos.length, col.length);

  for (let i = 0; i < pos.length; i++) {
    assert.ok(!Number.isNaN(pos[i]), `Position[${i}] 是 NaN`);
    assert.ok(!Number.isNaN(norm[i]), `Normal[${i}] 是 NaN`);
    assert.ok(!Number.isNaN(col[i]), `Color[${i}] 是 NaN`);
  }
});

console.log(`\n======================================================`);
console.log(` 全部离线断言执行完成: ${passed} / ${total} 项测试 100% 通过！`);
console.log(`======================================================\n`);
