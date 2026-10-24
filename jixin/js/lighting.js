// 共用着色模型：Node 离线光栅预览器与浏览器网格烘焙调用同一套常数与函数，
// 保证「秒级预览看到的明暗 == 最终渲染的明暗」。不做真实伽马线性转换，
// 全程在 sRGB 数值域内做风格化光照（体素作品要的是可控，不是物理正确）。

const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export const LIGHTS = {
  // 主光：左上前方，暖白（展厅窗光）
  key: { dir: norm([-0.52, 0.74, 0.42]), rgb: [1.0, 0.96, 0.88], i: 1.18 },
  // 辅光：右侧低位，冷调（补足金属暗面）
  fill: { dir: norm([0.82, 0.26, -0.5]), rgb: [0.72, 0.82, 1.0], i: 0.42 },
  // 轮廓光：后上方，让表壳边缘脱离背景
  rim: { dir: norm([0.15, 0.55, -0.85]), rgb: [0.9, 0.94, 1.0], i: 0.5 },
  sky: [0.34, 0.37, 0.44],
  ground: [0.2, 0.15, 0.12],
  aoLevels: [1.0, 0.86, 0.73, 0.61],
};

export const BG = [0.055, 0.05, 0.055];

/**
 * @param {number} rgb01 底色 [r,g,b] 0..1
 * @param {number} n      面法线
 * @param {number} ao     0..3 遮蔽等级
 * @param {number} spec   0..1 材质高光系数
 * @param {number} emis   0..1 夜光系数
 * @param {number} out    输出 [r,g,b] 0..1
 */
export function shadePixel(rgb, n, ao, spec, emis, out) {
  const L = LIGHTS;
  const aoF = L.aoLevels[ao | 0];
  const dk = n[0] * L.key.dir[0] + n[1] * L.key.dir[1] + n[2] * L.key.dir[2];
  const df = n[0] * L.fill.dir[0] + n[1] * L.fill.dir[1] + n[2] * L.fill.dir[2];
  const dr = n[0] * L.rim.dir[0] + n[1] * L.rim.dir[1] + n[2] * L.rim.dir[2];
  const hemi = 0.5 + 0.5 * n[1];
  const amb = L.ground[0] + (L.sky[0] - L.ground[0]) * hemi;
  const ambG = L.ground[1] + (L.sky[1] - L.ground[1]) * hemi;
  const ambB = L.ground[2] + (L.sky[2] - L.ground[2]) * hemi;

  // 金属：漫反射压低、镜面项拉高（用半向量近似，视角固定时的烘焙高光）
  const kd = 1 - spec * 0.45;
  const sd = Math.pow(Math.max(0, dk), 1 + spec * 5.5) * spec;
  const sf = Math.pow(Math.max(0, df), 1 + spec * 8) * spec * 0.5;
  const sr = Math.pow(Math.max(0, dr), 1 + spec * 10) * spec * 0.7;

  for (let c = 0; c < 3; c++) {
    const base = rgb[c];
    const a = c === 0 ? amb : c === 1 ? ambG : ambB;
    let v =
      base * (a + kd * (L.key.i * Math.max(0, dk) * L.key.rgb[c] + L.fill.i * Math.max(0, df) * L.fill.rgb[c] + L.rim.i * Math.max(0, dr) * L.rim.rgb[c])) * aoF +
      (c === 0 ? 1.0 : c === 1 ? 0.97 : 0.9) * (sd * 0.55 + sf * 0.3 + sr * 0.42);
    if (emis > 0) v = v * (1 - emis * 0.25) + emis * 0.16; // 夜光材质自带微亮
    out[c] = v / (1 + v * 0.3); // 软压高光，防金属过曝成一片白
  }
  return out;
}

export function shadeRgb(r8, g8, b8, n, ao, spec, emis, out) {
  return shadePixel([r8 / 255, g8 / 255, b8 / 255], n, ao, spec, emis, out);
}

/** 夜光模式：白天色 → 关灯色（只留夜光材质 + 极弱环境） */
// 关灯色：非夜光材质只剩极弱环境反光；夜光材质按 Super-LumiNova 的青绿发射
const GLOW = [0.26, 1.0, 0.55];
export function nightRgb(rgb, emis, aoF, out) {
  const glow = emis > 0 ? emis * emis : 0;
  for (let c = 0; c < 3; c++) {
    out[c] = Math.min(1, rgb[c] * 0.062 + glow * GLOW[c]);
  }
  return out;
}
