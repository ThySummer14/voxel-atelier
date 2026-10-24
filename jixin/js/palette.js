// 调色板：每件材料的 4 级明度，索引 = mat*4 + shade。255 保留给"空格子"。
// 全部为本作新配，不复用其他作品配色。

const HEX = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// spec: 高光强度（烘焙进顶点色 + 实时菲涅尔）；emis: 夜光强度
export const MATERIALS = [
  { name: '大漆', key: 'lacquer', spec: 0.30, emis: 0, shades: ['#0b0908', '#141010', '#1e1816', '#2c2320'] },
  { name: '漆灰胎', key: 'lacquerBody', spec: 0.10, emis: 0, shades: ['#080706', '#0f0d0c', '#171413', '#211c1a'] },
  { name: '描金', key: 'goldLine', spec: 0.85, emis: 0.05, shades: ['#6b4a12', '#9c7322', '#cfa63c', '#f0d475'] },
  { name: '铜镀金', key: 'gilt', spec: 0.95, emis: 0, shades: ['#7a5317', '#a87a26', '#d8a83f', '#f7dc93'] },
  { name: '玫瑰金', key: 'roseGold', spec: 0.92, emis: 0, shades: ['#75352a', '#a5583f', '#d08765', '#f2c39f'] },
  { name: '抛光钢', key: 'steel', spec: 1.0, emis: 0, shades: ['#3d434a', '#6d7681', '#a3aeba', '#dce5ee'] },
  { name: '蓝钢', key: 'blued', spec: 0.95, emis: 0, shades: ['#16264c', '#26437f', '#4a76c4', '#93bdf0'] },
  { name: '铑白', key: 'rhodium', spec: 1.0, emis: 0, shades: ['#5c6167', '#8f959c', '#c2c8ce', '#eef3f7'] },
  { name: '黑抛光钢', key: 'ancelle', spec: 1.0, emis: 0, shades: ['#08090b', '#12141a', '#1e222a', '#333a45'] },
  { name: '红宝石', key: 'ruby', spec: 1.0, emis: 0.22, shades: ['#4d0713', '#7d1022', '#b81f35', '#f0647c'] },
  { name: '蓝玛瑙', key: 'onyx', spec: 0.9, emis: 0.05, shades: ['#081124', '#13264c', '#254a86', '#5a8ac8'] },
  { name: '夜光', key: 'lume', spec: 0.15, emis: 1.0, shades: ['#4a5a4f', '#7f9f88', '#b6dcc0', '#e8ffee'] },
  { name: '珐琅白', key: 'enamel', spec: 0.35, emis: 0.02, shades: ['#5b5348', '#8e8474', '#c6bcab', '#eae3d6'] },
  { name: '镍银轮', key: 'maillechort', spec: 0.85, emis: 0, shades: ['#3f3a28', '#635a40', '#8e8362', '#c2b795'] },
  { name: '氧化棕', key: 'patina', spec: 0.25, emis: 0, shades: ['#2b1a10', '#4a2c17', '#6f4526', '#96663c'] },
  { name: '灰尘', key: 'dust', spec: 0.1, emis: 0, shades: ['#1a1614', '#26211d', '#332c27', '#443b34'] },
];

export const SHADES = 4;
export const EMPTY = 255;

export const MAT_INDEX = new Map(MATERIALS.map((m, i) => [m.key, i]));

/** 取调色板索引：mat key + 明度级 0..3 */
export function P(key, shade = 2) {
  const mi = MAT_INDEX.get(key);
  if (mi === undefined) throw new Error('未知材质: ' + key);
  return mi * SHADES + (shade < 0 ? 0 : shade > 3 ? 3 : shade);
}

export const PALETTE = [];
export const PAL_SPEC = [];
export const PAL_EMIS = [];
for (const m of MATERIALS) {
  for (let s = 0; s < SHADES; s++) {
    PALETTE.push(HEX(m.shades[s]));
    PAL_SPEC.push(m.spec);
    PAL_EMIS.push(m.emis);
  }
}
export const PAL_SIZE = PALETTE.length;

/** 按高度循环取明度，做出体素手绘感；period 控制条纹粗细 */
export function bandShade(y, period = 4, phase = 0) {
  return (Math.floor(y / (period / SHADES)) + phase) % SHADES;
}

/** 按半径取明度（同心环纹理，鱼鳞纹/日辉纹用） */
export function ringShade(r, period = 6) {
  return Math.floor(r / (period / SHADES)) % SHADES;
}

export function matOf(pal) {
  return MATERIALS[(pal / SHADES) | 0];
}
