/* 材质表 + 烘焙期程序纹理
 * 每个材质：base 基色 / 可选 ramp（按面朝向）/ gloss 高光 / kind 分组 / pat 程序纹理
 * 程序纹理在烘焙时写进顶点色，负责砖缝、瓦楞、琉璃斑、木纹、叶簇等“手工感”。
 */
import { hash3, fbm2, valueNoise2, valueNoise3 } from "./voxel/core.js";

export const KIND = { SOLID: 0, EMIT: 1, ALPHA: 2 };

let _i = 1;
const defs = {};
const list = [];

function M(name, color, opts = {}) {
  const id = _i++;
  const m = {
    id,
    name,
    color,
    kind: opts.kind ?? KIND.SOLID,
    gloss: opts.gloss ?? 0,
    emit: opts.emit ?? 1,
    alpha: opts.alpha ?? 1,
    pat: opts.pat ?? null,
    lit: opts.lit !== false,
  };
  defs[name] = id;
  list[id] = m;
  return id;
}

/* ---------------- 石材：须弥座 / 台基 / 踏道 ---------------- */
export const STONE_DK = M("STONE_DK", 0x6e665a, { pat: "course" });
export const STONE = M("STONE", 0x8c8274, { pat: "course" });
export const STONE_LT = M("STONE_LT", 0xa89c89, { pat: "course" });
export const MARBLE = M("MARBLE", 0xcfc4ae, { pat: "marble", gloss: 0.25 });
export const MARBLE_LT = M("MARBLE_LT", 0xe2d8c4, { pat: "marble", gloss: 0.3 });
export const STELE = M("STELE", 0x9a9284, { pat: "stele" });

/* ---------------- 木作：柱 / 梁枋 / 斗拱 / 门窗 ---------------- */
export const WOOD_DK = M("WOOD_DK", 0x3a2619, { pat: "grain" });
export const WOOD = M("WOOD", 0x553a26, { pat: "grain" });
export const WOOD_LT = M("WOOD_LT", 0x84604a, { pat: "grain" });
export const RED_DK = M("RED_DK", 0x5f2018, { pat: "lacquer" });
export const RED = M("RED", 0x862f22, { pat: "lacquer", gloss: 0.18 });
export const RED_LT = M("RED_LT", 0xa8412c, { pat: "lacquer", gloss: 0.2 });
export const VERM = M("VERM", 0xc05a35, { pat: "lacquer", gloss: 0.22 });

/* ---------------- 檐下彩画 ---------------- */
export const PAINT_BLUE = M("PAINT_BLUE", 0x27566b, { pat: "paint", gloss: 0.15 });
export const PAINT_GREEN = M("PAINT_GREEN", 0x356b4f, { pat: "paint", gloss: 0.15 });
export const PAINT_LITE = M("PAINT_LITE", 0x8fa6a2, { pat: "paint" });
export const GOLD = M("GOLD", 0xd8ad3e, { gloss: 0.85, pat: "gold" });
export const GOLD_LT = M("GOLD_LT", 0xf7dd92, { gloss: 0.95, pat: "gold" });
export const BRONZE = M("BRONZE", 0x6d6448, { gloss: 0.6 });

/* ---------------- 琉璃五色 + 白琉璃塔身 ---------------- */
export const GLZ_WHITE = M("GLZ_WHITE", 0xdedad0, { pat: "porcelain", gloss: 0.42 });
export const GLZ_WHITE_DK = M("GLZ_WHITE_DK", 0xb6ac9e, { pat: "porcelain", gloss: 0.35 });
export const GLZ_YELLOW = M("GLZ_YELLOW", 0xcf9a2e, { pat: "glaze", gloss: 0.62 });
export const GLZ_GREEN = M("GLZ_GREEN", 0x2c7a5c, { pat: "glaze", gloss: 0.62 });
export const GLZ_BLUE = M("GLZ_BLUE", 0x2b5c8f, { pat: "glaze", gloss: 0.62 });
export const GLZ_RED = M("GLZ_RED", 0xa3352a, { pat: "glaze", gloss: 0.62 });
export const GLZ_BROWN = M("GLZ_BROWN", 0x7d4a29, { pat: "glaze", gloss: 0.55 });

/* ---------------- 屋面琉璃瓦 ---------------- */
export const TILE_Y_DK = M("TILE_Y_DK", 0xc4922f, { pat: "rib", gloss: 0.5 });
export const TILE_Y = M("TILE_Y", 0xddac36, { pat: "rib", gloss: 0.62 });
export const TILE_Y_LT = M("TILE_Y_LT", 0xf8dc8e, { pat: "rib", gloss: 0.72 });
export const TILE_G_DK = M("TILE_G_DK", 0x24614a, { pat: "rib", gloss: 0.5 });
export const TILE_G = M("TILE_G", 0x33876a, { pat: "rib", gloss: 0.62 });
export const TILE_G_LT = M("TILE_G_LT", 0x3f9c78, { pat: "rib", gloss: 0.65 });
export const RIDGE = M("RIDGE", 0xd0a840, { pat: "ridge", gloss: 0.55 });

/* ---------------- 灯 / 窗（自发光） ---------------- */
export const LANTERN = M("LANTERN", 0xffb45c, { kind: KIND.EMIT, emit: 1.25 });
export const LANTERN_CORE = M("LANTERN_CORE", 0xffe2ac, { kind: KIND.EMIT, emit: 2.4 });
export const WINDOW = M("WINDOW", 0xff9a48, { kind: KIND.EMIT, emit: 0.9 });
export const DARK = M("DARK", 0x141118, { lit: false });
export const SILHOUETTE = M("SILHOUETTE", 0x1b1722, { lit: false });

/* ---------------- 植物 / 地面 ---------------- */
export const TRUNK = M("TRUNK", 0x3b2b20, { pat: "bark" });
export const TRUNK_LT = M("TRUNK_LT", 0x55402c, { pat: "bark" });
export const PINE_DK = M("PINE_DK", 0x1b3a2c, { pat: "leaf" });
export const PINE = M("PINE", 0x2a5238, { pat: "leaf" });
export const PINE_LT = M("PINE_LT", 0x40704a, { pat: "leaf" });
export const MOSS = M("MOSS", 0x4a6a3e, { pat: "leaf" });
export const GRASS = M("GRASS", 0x5c7048, { pat: "leaf" });
export const EARTH = M("EARTH", 0x4b4038, { pat: "rock" });
export const PATH = M("PATH", 0x8a8172, { pat: "slab" });

/* ---------------- 岩 / 山 ---------------- */
export const ROCK_DK = M("ROCK_DK", 0x55505e, { pat: "rock" });
export const ROCK = M("ROCK", 0x6f6875, { pat: "rock" });
export const ROCK_LT = M("ROCK_LT", 0x918a92, { pat: "rock" });
export const FAR_DK = M("FAR_DK", 0x212540, { pat: "far" });
export const FAR = M("FAR", 0x2c3154, { pat: "far" });
export const FAR_LT = M("FAR_LT", 0x3d4570, { pat: "far" });

/* ---------------- 云 / 雾（半透明） ---------------- */
export const CLOUD_DK = M("CLOUD_DK", 0x7d7a9c, { pat: "cloudbed" });
export const CLOUD = M("CLOUD", 0xf6f1f4, { pat: "cloudbed" });
export const CLOUD_LT = M("CLOUD_LT", 0xfffaf2, { pat: "cloudbed" });
export const MIST = M("MIST", 0xcfd0e0, { kind: KIND.ALPHA, alpha: 0.3, pat: "cloud" });

/* ---------------- 香炉烟 / 幡 ---------------- */
export const SMOKE = M("SMOKE", 0xcfc8c0, { kind: KIND.ALPHA, alpha: 0.30, pat: "cloud" });
export const CLOTH_RED = M("CLOTH_RED", 0xb04030, { pat: "cloth" });
export const CLOTH_YEL = M("CLOTH_YEL", 0xd8a840, { pat: "cloth" });
export const ROBE = M("ROBE", 0x8a7f6d, { pat: "cloth" });
export const ROBE_BROWN = M("ROBE_BROWN", 0x6a4a30, { pat: "cloth" });
export const SKIN = M("SKIN", 0xc79a72, {});

export const MAT = defs;
export const MATERIALS = list;
export const MAT_COUNT = _i;

/* ---------------- 程序纹理 ---------------- */

/** 返回 [r,g,b] 0..1，已含纹理调制 */
export function shadeOf(mat, x, y, z, faceIdx) {
  const m = list[mat];
  let hex = m.color;
  let r = ((hex >> 16) & 255) / 255;
  let g = ((hex >> 8) & 255) / 255;
  let b = (hex & 255) / 255;
  const mul = (k) => { r *= k; g *= k; b *= k; };

  switch (m.pat) {
    case "course": { // 石作砌缝：水平缝 + 错缝竖缝
      const my = y % 4 === 3 ? 0.86 : 1;
      const row = Math.floor(y / 4) % 2;
      const mx = (x + row * 2) % 3 === 0 ? 0.93 : 1;
      mul(my * mx);
      const n = 0.94 + hash3(x, y, z) * 0.12;
      mul(n);
      break;
    }
    case "marble": {
      const v = valueNoise3(x * 0.12, y * 0.3, z * 0.12, 7);
      mul(0.93 + v * 0.14);
      if (valueNoise3(x * 0.06, y * 0.5, z * 0.06, 21) > 0.78) mul(0.9); // 石脉
      break;
    }
    case "stele": {
      mul(y % 3 === 0 ? 0.94 : 1);
      mul(0.95 + hash3(x, y, z) * 0.1);
      break;
    }
    case "slab": {
      const s = (x % 5 === 0 || z % 5 === 0) ? 0.86 : 1;
      mul(s * (0.94 + hash3(x, y, z) * 0.13));
      break;
    }
    case "grain": {
      const g2 = valueNoise3(x * 0.35, y * 0.06, z * 0.35, 3);
      mul(0.9 + g2 * 0.2);
      break;
    }
    case "bark": {
      const s = valueNoise3(x * 0.6, y * 0.14, z * 0.6, 11);
      mul(0.78 + s * 0.44);
      break;
    }
    case "lacquer": {
      const n = 0.96 + valueNoise3(x * 0.2, y * 0.2, z * 0.2, 5) * 0.08;
      mul(n);
      break;
    }
    case "paint": {
      mul(y % 2 === 0 ? 1 : 0.88);
      mul(0.95 + hash3(x, y, z) * 0.1);
      break;
    }
    case "gold": {
      const n = valueNoise3(x * 0.4, y * 0.4, z * 0.4, 9);
      mul(0.92 + n * 0.2);
      break;
    }
    case "porcelain": { // 白琉璃：砖缝 + 釉色流动
      const my = y % 5 === 4 ? 0.9 : 1;
      const flow = valueNoise3(x * 0.09, y * 0.13, z * 0.09, 13);
      mul(my * (0.95 + flow * 0.1));
      if (fbm2(x * 0.05 + y * 0.02, z * 0.05, 3, 17) > 0.72) mul(0.965);
      break;
    }
    case "glaze": { // 五色琉璃壁：釉面垂流斑
      const flow = valueNoise3(x * 0.13, y * 0.05, z * 0.13, 23);
      mul(0.94 + flow * 0.13);
      if (y % 9 === 8) mul(0.9); // 分格缝
      break;
    }
    case "rib": { // 筒瓦瓦楞：以塔心为原点的放射棱
      const a = Math.atan2(z, x);
      const rib = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 96);
      const top = faceIdx === 0;
      mul(top ? (rib % 2 === 0 ? 1.05 : 0.965) : (rib % 2 === 0 ? 1.0 : 0.985));
      const n = 0.95 + hash3(x, y, z) * 0.1;
      mul(n);
      break;
    }
    case "ridge": {
      mul(0.94 + valueNoise3(x * 0.3, y * 0.3, z * 0.3, 29) * 0.14);
      break;
    }
    case "leaf": { // 叶簇：块状明暗
      const n = valueNoise3(x * 0.32, y * 0.32, z * 0.32, 31);
      mul(0.74 + n * 0.5);
      break;
    }
    case "rock": {
      const n = fbm2(x * 0.09 + y * 0.05, z * 0.09 - y * 0.04, 4, 37);
      mul(0.82 + n * 0.36);
      mul(0.96 + hash3(x, y, z) * 0.08);
      break;
    }
    case "far": {
      const n = valueNoise2(x * 0.05, z * 0.05, 41);
      mul(0.94 + n * 0.12);
      break;
    }
    case "cloud": {
      const n = valueNoise3(x * 0.09, y * 0.14, z * 0.09, 43);
      mul(0.9 + n * 0.2);
      break;
    }
    case "cloudbed": {
      /* 云床不落任何花纹：远端云面一屏几十格，哪怕 2% 的逐格色差
         也会被眼睛放大成一片放射状斜纹。 */
      break;
    }
    case "cloth": {
      mul(x % 2 === 0 ? 1 : 0.93);
      mul(0.95 + hash3(x, y, z) * 0.1);
      break;
    }
    default: {
      mul(0.96 + hash3(x, y, z) * 0.08);
    }
  }
  return [r, g, b];
}

export const GLAZE_PANELS = [GLZ_YELLOW, GLZ_GREEN, GLZ_RED, GLZ_BROWN, GLZ_BLUE, GLZ_WHITE];

/** 高光组：琉璃、金、漆、汉白玉 —— 用 Phong 出瓷釉反光 */
/* 瓦面立水：筒瓦间的竖向小面，实际靠邻瓦反光补光，
   按纯兰伯特算会被判成背光的黑槽，故与云台一样把法线往上抬。 */
export const SOFT_SIDE = new Set([TILE_Y, TILE_Y_LT, TILE_Y_DK, TILE_G, TILE_G_DK, TILE_G_LT]);

export const GLOSSY = new Set([
  GLZ_WHITE, GLZ_WHITE_DK, GLZ_YELLOW, GLZ_GREEN, GLZ_BLUE, GLZ_RED, GLZ_BROWN,
  TILE_Y_DK, TILE_Y, TILE_Y_LT, TILE_G_DK, TILE_G, TILE_G_LT, RIDGE,
  GOLD, GOLD_LT, BRONZE, MARBLE, MARBLE_LT,
  RED, RED_LT, VERM, PAINT_BLUE, PAINT_GREEN,
]);
