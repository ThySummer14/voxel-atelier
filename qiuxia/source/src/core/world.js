// Flat bounded voxel field + constructive shape operators. Dependency-free.

export class World {
  constructor(nx, ny, nz) {
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.data = new Uint16Array(nx * ny * nz);
    this.solidCount = 0;
  }

  idx(x, y, z) {
    return (z * this.ny + y) * this.nx + x;
  }

  inside(x, y, z) {
    return x >= 0 && y >= 0 && z >= 0 && x < this.nx && y < this.ny && z < this.nz;
  }

  get(x, y, z) {
    if (!this.inside(x, y, z)) return 0;
    return this.data[this.idx(x, y, z)];
  }

  set(x, y, z, id) {
    if (!this.inside(x, y, z)) return;
    x |= 0; y |= 0; z |= 0;
    const i = this.idx(x, y, z);
    const prev = this.data[i];
    if (prev === id) return;
    if (prev === 0 && id !== 0) this.solidCount++;
    else if (prev !== 0 && id === 0) this.solidCount--;
    this.data[i] = id;
  }

  // inclusive box
  box(x0, y0, z0, x1, y1, z1, id) {
    const xa = Math.max(0, Math.min(x0, x1)), xb = Math.min(this.nx - 1, Math.max(x0, x1));
    const ya = Math.max(0, Math.min(y0, y1)), yb = Math.min(this.ny - 1, Math.max(y0, y1));
    const za = Math.max(0, Math.min(z0, z1)), zb = Math.min(this.nz - 1, Math.max(z0, z1));
    for (let z = za; z <= zb; z++)
      for (let y = ya; y <= yb; y++)
        for (let x = xa; x <= xb; x++) this.set(x, y, z, id);
  }

  // only overwrite cells currently equal to `only` (or air when only===0)
  boxWhere(x0, y0, z0, x1, y1, z1, id, only) {
    const xa = Math.max(0, Math.min(x0, x1)), xb = Math.min(this.nx - 1, Math.max(x0, x1));
    const ya = Math.max(0, Math.min(y0, y1)), yb = Math.min(this.ny - 1, Math.max(y0, y1));
    const za = Math.max(0, Math.min(z0, z1)), zb = Math.min(this.nz - 1, Math.max(z0, z1));
    for (let z = za; z <= zb; z++)
      for (let y = ya; y <= yb; y++)
        for (let x = xa; x <= xb; x++)
          if (this.get(x, y, z) === only) this.set(x, y, z, id);
  }

  column(x, z, y0, y1, id) {
    this.box(x, y0, z, x, y1, z, id);
  }

  // vertical cylinder (axis Y), disc in XZ
  cylY(cx, cz, r, y0, y1, id, hollow = 0) {
    const r2 = r * r, ri2 = (r - hollow) * (r - hollow);
    const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r);
    const z0 = Math.floor(cz - r), z1 = Math.ceil(cz + r);
    for (let z = z0; z <= z1; z++)
      for (let x = x0; x <= x1; x++) {
        const d2 = (x - cx) * (x - cx) + (z - cz) * (z - cz);
        if (d2 <= r2 && (!hollow || d2 >= ri2)) this.column(x, z, y0, y1, id);
      }
  }

  // horizontal cylinder axis X (boiler), disc in YZ
  cylX(cy, cz, r, x0, x1, id, hollow = 0) {
    const r2 = r * r, ri2 = (r - hollow) * (r - hollow);
    const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
    const z0 = Math.floor(cz - r), z1 = Math.ceil(cz + r);
    for (let z = z0; z <= z1; z++)
      for (let y = y0; y <= y1; y++) {
        const d2 = (y - cy) * (y - cy) + (z - cz) * (z - cz);
        if (d2 <= r2 && (!hollow || d2 >= ri2)) this.box(x0, y, z, x1, y, z, id);
      }
  }

  // cylinder axis Z (wheels), disc in XY
  cylZ(cx, cy, r, z0, z1, id, hollow = 0) {
    const r2 = r * r, ri2 = (r - hollow) * (r - hollow);
    const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r);
    const y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 <= r2 && (!hollow || d2 >= ri2)) this.box(x, y, z0, x, y, z1, id);
      }
  }

  sphere(cx, cy, cz, r, id) {
    const r2 = r * r;
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const d2 = (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2;
          if (d2 <= r2) this.set(x, y, z, id);
        }
  }

  // 3D voxel line (DDA), thickness = cube half-size
  line(x0, y0, z0, x1, y1, z1, id, t = 0) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
    const n = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + (dx * i) / n);
      const y = Math.round(y0 + (dy * i) / n);
      const z = Math.round(z0 + (dz * i) / n);
      if (t === 0) this.set(x, y, z, id);
      else this.box(x - t, y - t, z - t, x + t, y + t, z + t, id);
    }
  }

  count() {
    return this.solidCount;
  }
}