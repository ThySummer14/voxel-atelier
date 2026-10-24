// 极夜流火 · 高性能体素网格系统 (High-Performance Packed Voxel Grid)
// 采用 30-bit 整数位图紧凑编码，支持空间检索、边界判定与集合运算

export class VoxelGrid {
  constructor() {
    // 键为 30-bit SMI 正整数，值为调色板颜色索引 (Uint8)
    this.voxels = new Map();
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.minZ = Infinity;
    this.maxZ = -Infinity;
  }

  // 坐标紧凑编码 (X: [-512, 511], Y: [-256, 255], Z: [-1024, 1023])
  static pack(x, y, z) {
    const px = (x + 512) & 0x3FF;
    const py = (y + 256) & 0x1FF;
    const pz = (z + 1024) & 0x7FF;
    return px | (py << 10) | (pz << 19);
  }

  // 坐标解包
  static unpack(k) {
    const x = (k & 0x3FF) - 512;
    const y = ((k >> 10) & 0x1FF) - 256;
    const z = ((k >> 19) & 0x7FF) - 1024;
    return [x, y, z];
  }

  set(x, y, z, colorId) {
    if (colorId <= 0) {
      this.delete(x, y, z);
      return;
    }
    const k = VoxelGrid.pack(x, y, z);
    this.voxels.set(k, colorId);

    if (x < this.minX) this.minX = x;
    if (x > this.maxX) this.maxX = x;
    if (y < this.minY) this.minY = y;
    if (y > this.maxY) this.maxY = y;
    if (z < this.minZ) this.minZ = z;
    if (z > this.maxZ) this.maxZ = z;
  }

  get(x, y, z) {
    const k = VoxelGrid.pack(x, y, z);
    return this.voxels.get(k) || 0;
  }

  has(x, y, z) {
    const k = VoxelGrid.pack(x, y, z);
    return this.voxels.has(k);
  }

  delete(x, y, z) {
    const k = VoxelGrid.pack(x, y, z);
    return this.voxels.delete(k);
  }

  clear() {
    this.voxels.clear();
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.minZ = Infinity;
    this.maxZ = -Infinity;
  }

  size() {
    return this.voxels.size;
  }

  bounds() {
    if (this.voxels.size === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    }
    return {
      minX: this.minX, maxX: this.maxX,
      minY: this.minY, maxY: this.maxY,
      minZ: this.minZ, maxZ: this.maxZ
    };
  }

  forEach(callback) {
    for (const [k, colorId] of this.voxels) {
      const x = (k & 0x3FF) - 512;
      const y = ((k >> 10) & 0x1FF) - 256;
      const z = ((k >> 19) & 0x7FF) - 1024;
      callback(x, y, z, colorId);
    }
  }

  // 从另一个网格合并复制 (可带坐标偏移)
  merge(otherGrid, dx = 0, dy = 0, dz = 0) {
    otherGrid.forEach((x, y, z, colorId) => {
      this.set(x + dx, y + dy, z + dz, colorId);
    });
  }
}
