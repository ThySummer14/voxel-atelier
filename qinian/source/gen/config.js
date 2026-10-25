// All lengths in metres. One voxel = S metres.
export const S = 0.1;
export const NX = 1060;
export const NZ = 1060;
export const BASE = 3.0;               // diorama block below the courtyard surface
export const NY = 404;
export const Y0 = Math.round(BASE / S); // first cell above the courtyard surface

// Courtyard surface is Y = 0. Cell iy spans [(iy - Y0) * S, (iy - Y0 + 1) * S).
export const cellY = (iy) => (iy - Y0 + 0.5) * S;
export const cellX = (ix) => (ix + 0.5 - NX / 2) * S;
export const cellZ = (iz) => (iz + 0.5 - NZ / 2) * S;
export const iyOf = (m) => Y0 + Math.round(m / S);
export const ixOf = (m) => Math.floor(m / S + NX / 2);
export const izOf = (m) => Math.floor(m / S + NZ / 2);

export const HALF = (NX * S) / 2;      // 53 m

// Altar of Prayer for Grain (祈谷坛): three tiers, outer radius at the top fascia.
export const TIERS = [
  { r: 45.15, y0: 0.0, y1: 2.0, steps: 10, post: 'cloud' },
  { r: 39.65, y0: 2.0, y1: 3.8, steps: 9, post: 'phoenix' },
  { r: 34.1, y0: 3.8, y1: 5.6, steps: 9, post: 'dragon' },
];
export const RISER = 0.2;
export const TREAD = 0.3;

// Hall podium: three thin stone rings, then the hall floor.
export const PODIUM = [
  { r: 15.74, y0: 5.6, y1: 5.7 },
  { r: 14.94, y0: 5.7, y1: 5.8 },
  { r: 14.14, y0: 5.8, y1: 5.9 },
];
export const FLOOR = 5.9;

// Column rings (centres) and diameters.
export const R_EAVE_COL = 12.1;
export const D_EAVE_COL = 0.76;
export const R_GOLD_COL = 9.8;
export const D_GOLD_COL = 0.9;
export const R_WELL_COL = 6.2;
export const D_WELL_COL = 1.2;

// Three storeys, heights above the hall floor. Column tops follow the documented
// 6.6 / 11.6 / 18.4 m column heights; bracket stacks use a 0.08 m 斗口.
export const STOREYS = [
  {
    name: 'lower', rCol: R_EAVE_COL, face: 12.42, tiao: 2, sets: 84,
    beams: [['xiao', 4.4, 5.0], ['dian', 5.0, 5.5], ['da', 5.5, 6.6]],
    pingban: [6.6, 6.86], dougong: [6.86, 7.66], purlin: [7.66, 7.96],
  },
  {
    name: 'middle', rCol: R_GOLD_COL, face: 10.12, tiao: 3, sets: 60,
    ridge: [10.35, 10.8], tileWall: [10.8, 11.24],
    beams: [['shang', 11.24, 12.3]],
    pingban: [12.3, 12.55], dougong: [12.55, 13.55], purlin: [13.55, 13.85],
  },
  {
    name: 'upper', rCol: R_WELL_COL, face: 6.86, tiao: 4, sets: 36,
    ridge: [16.8, 17.25], tileWall: [17.25, 17.75],
    beams: [['shang', 17.75, 19.05]],
    pingban: [19.05, 19.3], dougong: [19.3, 20.5], purlin: [20.5, 20.8],
  },
];
export const TIAO = 0.3; // one bracket jump, 3 voxels

// Roofs: eave radius, tile-surface height at the eave, junction radius / height, curve shape.
export const ROOFS = [
  { name: 'lower', rOut: 14.8, hOut: 8.05, rIn: 10.52, hIn: 10.45, lin: 0.72, pw: 2.0, rows: 192, rafters: 300 },
  { name: 'middle', rOut: 12.74, hOut: 13.8, rIn: 7.26, hIn: 16.9, lin: 0.72, pw: 2.0, rows: 156, rafters: 260 },
  { name: 'upper', rOut: 9.45, hOut: 20.75, rIn: 1.42, hIn: 26.6, lin: 0.56, pw: 2.6, rows: 132, rafters: 200 },
];
export const LIP = 0.45;

// Interior ceilings (天花) sit on the bracket tops of each ring.
export const CEIL = { outer: 7.66, middle: 13.55, centre: 20.5 };
export const WALL_IN = 11.98;
export const R_MID_IN = 9.32;
export const R_TOP_IN = 5.66;

export const FINIAL = {
  base: [26.5, 28.05],
  collar: [28.05, 29.02],
  ball: [29.02, 31.2],
};

export const BAY = (Math.PI * 2) / 12;
