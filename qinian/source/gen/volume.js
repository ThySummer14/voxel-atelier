import { NX, NY, NZ } from './config.js';

export class Volume {
  constructor(nx = NX, ny = NY, nz = NZ) {
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.layer = nx * nz;
    this.data = new Uint8Array(nx * ny * nz);
  }
  idx(x, y, z) {
    return y * this.layer + z * this.nx + x;
  }
  inside(x, y, z) {
    return x >= 0 && y >= 0 && z >= 0 && x < this.nx && y < this.ny && z < this.nz;
  }
  get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.nx || y >= this.ny || z >= this.nz) return 0;
    return this.data[y * this.layer + z * this.nx + x];
  }
  set(x, y, z, v) {
    if (x < 0 || y < 0 || z < 0 || x >= this.nx || y >= this.ny || z >= this.nz) return;
    this.data[y * this.layer + z * this.nx + x] = v;
  }
  fillBox(x0, y0, z0, x1, y1, z1, v) {
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); z0 = Math.max(0, z0);
    x1 = Math.min(this.nx, x1); y1 = Math.min(this.ny, y1); z1 = Math.min(this.nz, z1);
    for (let y = y0; y < y1; y++) {
      for (let z = z0; z < z1; z++) {
        const o = y * this.layer + z * this.nx;
        this.data.fill(v, o + x0, o + x1);
      }
    }
  }
}
