/* 青绿山水材质表 + 烘焙期程序纹理
 *
 * 色彩逻辑按考据执行：赭石打底于山坡水岸 → 山腰汁绿/石绿 → 山头厚石青，
 * 「山头颜色厚重饱满，山脚颜色轻薄」。矿物颜料的**颗粒感**是石青石绿的命门，
 * 所以头青/头绿一类厚色带粗颗粒调制，薄染的三青三绿则细腻。
 *
 * dye：染色层，供「三矾九染」显形用
 *   0 = 山水本体（赭石 → 汁绿 → 石绿 → 石青，按高度分先后）
 *   1 = 泥金复勾（建筑、桥、台轮廓）
 *   2 = 人物船只生灵（最后落笔）
 *   2.4–2.6 = 雾、瀑、飞沫（生灵之后的空气层）
 *   3 = 勾云蛤白
 */
import { hash3, fbm2, valueNoise2, valueNoise3 } from "./voxel/core.js";

export const KIND = { SOLID: 0, EMIT: 1, ALPHA: 2 };

let _i = 1;
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
    dye: opts.dye ?? 0,
  };
  list[id] = m;
  return id;
}

/* ---------------- 赭石：山脚 / 坡岸 / 崖壁打底 ---------------- */
export const OCHRE_DK = M("OCHRE_DK", 0x6d4829, { pat: "cun" });
export const OCHRE = M("OCHRE", 0x9a6b41, { pat: "cun" });
export const OCHRE_LT = M("OCHRE_LT", 0xb98a55, { pat: "cun" });
export const CLIFF = M("CLIFF", 0x8a7358, { pat: "cun" });      // 裸露崖壁：赭石带墨
export const CLIFF_DK = M("CLIFF_DK", 0x63533f, { pat: "cun" });
export const EARTH = M("EARTH", 0x7d6242, { pat: "cun" });       // 土坡、路肩

/* ---------------- 墨：勾廓 / 岩缝 / 苔点 ---------------- */
export const INK = M("INK", 0x2c2a26, { pat: "ink" });
export const INK_SOFT = M("INK_SOFT", 0x423d34, { pat: "ink" });
export const MOSS = M("MOSS", 0x3f5f3c, { pat: "leaf" });        // 墨绿混点，稀疏
export const MOSS_DK = M("MOSS_DK", 0x2c4630, { pat: "leaf" });

/* ---------------- 石绿：山腰 ---------------- */
export const GREEN_3 = M("GREEN_3", 0x8ab677, { pat: "wash" });  // 三绿·薄染
export const GREEN_2 = M("GREEN_2", 0x5f9a60, { pat: "wash" });  // 二绿
export const GREEN_1 = M("GREEN_1", 0x3a7a52, { pat: "mineral" });// 头绿·厚色带颗粒
export const GREEN_DK = M("GREEN_DK", 0x2a5c40, { pat: "mineral" });

/* ---------------- 石青：山头 ---------------- */
export const BLUE_3 = M("BLUE_3", 0x6b9cbb, { pat: "wash" });    // 三青·薄染、远峰
export const BLUE_2 = M("BLUE_2", 0x3f7aa8, { pat: "mineral" }); // 二青
export const BLUE_1 = M("BLUE_1", 0x2b5d8a, { pat: "mineral" }); // 头青·厚色带颗粒
export const BLUE_DK = M("BLUE_DK", 0x1d4266, { pat: "mineral" });

/* ---------------- 远峰：淡墨花青，空气透视 ---------------- */
export const FAR_1 = M("FAR_1", 0x8ba4ac, { pat: "far", dye: 0 });
export const FAR_2 = M("FAR_2", 0xa6bcc0, { pat: "far", dye: 0 });
export const FAR_3 = M("FAR_3", 0xc0cfcd, { pat: "far", dye: 0 });

/* ---------------- 植物：长松修竹 / 绿柳红花 ---------------- */
export const PINE_DK = M("PINE_DK", 0x2c4a38, { pat: "leaf" });
export const PINE = M("PINE", 0x3b6244, { pat: "leaf" });
export const PINE_LT = M("PINE_LT", 0x4e7a52, { pat: "leaf" });
export const WILLOW_DK = M("WILLOW_DK", 0x5c8a44, { pat: "leaf" });
export const WILLOW = M("WILLOW", 0x7fae5c, { pat: "leaf" });     // 柳叶施以石绿
export const WILLOW_LT = M("WILLOW_LT", 0x9ec472, { pat: "leaf" });
export const BAMBOO = M("BAMBOO", 0x5e8a4e, { pat: "leaf" });
export const BLOSSOM = M("BLOSSOM", 0xc0553e, { pat: "leaf" });   // 红花
export const TRUNK = M("TRUNK", 0x4a3524, { pat: "bark" });
export const TRUNK_LT = M("TRUNK_LT", 0x6a4e34, { pat: "bark" });

/* ---------------- 建筑：茅屋草舍 / 水榭楼台 ---------------- */
export const WALL = M("WALL", 0xe6dcc6, { pat: "wall" });
export const WALL_DK = M("WALL_DK", 0xc4b79a, { pat: "wall" });
export const WOOD = M("WOOD", 0x7a5a3a, { pat: "grain" });
export const WOOD_DK = M("WOOD_DK", 0x54402a, { pat: "grain" });
export const WOOD_LT = M("WOOD_LT", 0x9c7a52, { pat: "grain" });
export const REDWOOD = M("REDWOOD", 0x8a4a34, { pat: "grain" });  // 赭红柱
export const TILE = M("TILE", 0x4a5a62, { pat: "tile" });         // 青瓦
export const TILE_DK = M("TILE_DK", 0x37434a, { pat: "tile" });
export const TILE_LT = M("TILE_LT", 0x61727a, { pat: "tile" });
export const THATCH = M("THATCH", 0xb9a06a, { pat: "thatch" });
export const THATCH_DK = M("THATCH_DK", 0x96804f, { pat: "thatch" });
export const STONE = M("STONE", 0x9a9182, { pat: "course" });
export const STONE_DK = M("STONE_DK", 0x756d60, { pat: "course" });
export const STONE_LT = M("STONE_LT", 0xb8ae9a, { pat: "course" });
export const BRICK = M("BRICK", 0x8a7a66, { pat: "course" });     // 水磨砖坝

/* ---------------- 泥金：只复勾轮廓，不铺山体 ---------------- */
export const GOLD = M("GOLD", 0xc9a24a, { gloss: 0.8, pat: "gold", dye: 1 });
export const GOLD_LT = M("GOLD_LT", 0xe5c97a, { gloss: 0.9, pat: "gold", dye: 1 });

/* ---------------- 生灵：人物细小如豆，却动态鲜明 ---------------- */
export const CLOTH_W = M("CLOTH_W", 0xede6d4, { pat: "cloth", dye: 2 });
export const CLOTH_B = M("CLOTH_B", 0x4a5a72, { pat: "cloth", dye: 2 });
export const CLOTH_R = M("CLOTH_R", 0xa0503c, { pat: "cloth", dye: 2 });
export const CLOTH_G = M("CLOTH_G", 0x6a7a52, { pat: "cloth", dye: 2 });
export const SKIN = M("SKIN", 0xc79a72, { dye: 2 });
export const STRAW = M("STRAW", 0xa08b5e, { pat: "cloth", dye: 2 });   // 笠帽
export const BOAT = M("BOAT", 0x6a4e34, { pat: "grain", dye: 2 });
export const BOAT_LT = M("BOAT_LT", 0x8a6a48, { pat: "grain", dye: 2 });
export const SAIL = M("SAIL", 0xf2ecdd, { pat: "cloth", dye: 2 });
export const BEAST = M("BEAST", 0x5a4a3c, { pat: "cloth", dye: 2 });   // 牲畜

/* ---------------- 灯（夜渔火） ---------------- */
export const LAMP = M("LAMP", 0xffb45c, { kind: KIND.EMIT, emit: 1.2, dye: 2 });
export const LAMP_CORE = M("LAMP_CORE", 0xffe2ac, { kind: KIND.EMIT, emit: 2.4, dye: 2 });
export const WINDOW = M("WINDOW", 0xff9a48, { kind: KIND.EMIT, emit: 0.9, dye: 2 });

/* ---------------- 勾云：有轮廓的白色薄片，不是空气 ---------------- */
export const CLOUD = M("CLOUD", 0xf6f1e4, { pat: "silk", dye: 3 });
export const CLOUD_DK = M("CLOUD_DK", 0xdcd2ba, { pat: "silk", dye: 3 });
export const CLOUD_EDGE = M("CLOUD_EDGE", 0xc8bda4, { pat: "silk", dye: 3 });  // 勾云的墨线边
export const MIST = M("MIST", 0xeee7d4, { kind: KIND.ALPHA, alpha: 0.34, pat: "silk", dye: 2.4 });
export const SPRAY = M("SPRAY", 0xf2f7ee, { kind: KIND.ALPHA, alpha: 0.5, pat: "silk", dye: 2.6 });
export const FALL = M("FALL", 0xeaf2ea, { kind: KIND.ALPHA, alpha: 0.72, pat: "fall", dye: 2.5 });

export const MATERIALS = list;

/* ---------------- 程序纹理 ---------------- */

/** 返回 [r,g,b] 0..1，已含纹理调制 */
export function shadeOf(mat, x, y, z, faceIdx) {
  const m = list[mat];
  const hex = m.color;
  let r = ((hex >> 16) & 255) / 255;
  let g = ((hex >> 8) & 255) / 255;
  let b = (hex & 255) / 255;
  const mul = (k) => { r *= k; g *= k; b *= k; };
  const top = faceIdx === 0;

  switch (m.pat) {
    /* 皴：笔锋自上而下拖出的竖向条纹，被噪声拗弯。
       本卷皴法无学术定名（只查到「峰顶似荷叶皴」一条非权威表述），
       故此处取「荷叶皴」的形态特征：自峰顶放射下披、线条不刚不硬。 */
    case "cun": {
      const warp = fbm2(x * 0.055, z * 0.055 + y * 0.02, 3, 71);
      const s = Math.sin((x * 0.42 + z * 0.26 + warp * 7.5));
      const stroke = 0.94 + 0.06 * s;
      mul(top ? 1.0 : stroke * 0.985);
      const n = 0.9 + fbm2(x * 0.08 + y * 0.045, z * 0.08 - y * 0.05, 4, 37) * 0.2;
      mul(n);
      mul(0.97 + hash3(x, y, z) * 0.06);
      break;
    }
    /* 墨线勾廓：只用在缝隙与轮廓上，浓重 */
    case "ink": {
      mul(0.86 + valueNoise3(x * 0.3, y * 0.3, z * 0.3, 13) * 0.28);
      break;
    }
    /* 分染薄层：低频晕染，无颗粒——三青三绿是薄染，画里透绢 */
    case "wash": {
      const v = fbm2(x * 0.032 + y * 0.012, z * 0.032 - y * 0.018, 3, 53);
      mul(0.9 + v * 0.2);
      mul(0.975 + hash3(x, y, z) * 0.05);
      break;
    }
    /* 矿物厚色：石青石绿的颗粒沉淀。粗颗粒聚在低处与凹处，
       这是重彩最容易被识别的特征，缺了就像塑料。 */
    case "mineral": {
      const grain = valueNoise3(x * 0.85, y * 0.85, z * 0.85, 17);
      const pool = fbm2(x * 0.06, z * 0.06 + y * 0.03, 3, 89);
      mul(0.92 + grain * 0.10 + pool * 0.08);
      mul(0.98 + hash3(x, y, z) * 0.04);
      break;
    }
    /* 攒三聚五：叶簇按团块明暗，不做逐格噪点 */
    case "leaf": {
      const n = valueNoise3(x * 0.30, y * 0.34, z * 0.30, 31);
      const clump = valueNoise3(x * 0.11, y * 0.13, z * 0.11, 47);
      mul(0.7 + n * 0.36 + clump * 0.2);
      break;
    }
    case "bark": {
      const s = valueNoise3(x * 0.55, y * 0.15, z * 0.55, 11);
      mul(0.8 + s * 0.4);
      break;
    }
    case "grain": {
      const g2 = valueNoise3(x * 0.32, y * 0.07, z * 0.32, 3);
      mul(0.9 + g2 * 0.2);
      break;
    }
    case "wall": {
      const n = fbm2(x * 0.09, z * 0.09 + y * 0.05, 3, 5);
      mul(0.95 + n * 0.1);
      mul(y % 7 === 6 ? 0.96 : 1);
      break;
    }
    case "tile": {
      const a = Math.atan2(z, x);
      const rib = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 64);
      mul(top ? (rib % 2 === 0 ? 1.05 : 0.96) : (rib % 2 === 0 ? 1.0 : 0.94));
      mul(0.95 + hash3(x, y, z) * 0.1);
      break;
    }
    case "thatch": {
      const s = ((x + z) % 3 === 0) ? 0.9 : 1;
      const n = valueNoise3(x * 0.4, y * 0.16, z * 0.4, 19);
      mul(s * (0.88 + n * 0.24));
      break;
    }
    case "course": {
      const my = y % 4 === 3 ? 0.87 : 1;
      const row = Math.floor(y / 4) % 2;
      const mx = (x + z + row * 2) % 4 === 0 ? 0.93 : 1;
      mul(my * mx * (0.94 + hash3(x, y, z) * 0.12));
      break;
    }
    case "gold": {
      const n = valueNoise3(x * 0.4, y * 0.4, z * 0.4, 9);
      mul(0.9 + n * 0.22);
      break;
    }
    case "cloth": {
      mul(x % 2 === 0 ? 1 : 0.94);
      mul(0.95 + hash3(x, y, z) * 0.1);
      break;
    }
    /* 绢：大面积云白不落花纹。云床一屏几十格，2% 的逐格色差
       会被眼睛放大成放射状斜纹（琉璃浮屠上已付过学费）。 */
    case "silk": {
      const v = fbm2(x * 0.014, z * 0.014, 2, 61);
      mul(0.975 + v * 0.05);
      break;
    }
    case "fall": {
      const s = Math.sin((y * 0.9) + hash3(x, 0, z) * 6.28);
      mul(0.94 + 0.06 * s);
      break;
    }
    case "far": {
      const n = valueNoise2(x * 0.04, z * 0.04, 41);
      mul(0.95 + n * 0.1);
      break;
    }
    default: {
      mul(0.96 + hash3(x, y, z) * 0.08);
    }
  }
  return [r, g, b];
}

/** 高光组：泥金、青瓦、蛤白云边 —— 用 Phong 出釉光 */
export const GLOSSY = new Set([GOLD, GOLD_LT, TILE, TILE_LT, TILE_DK, CLOUD_EDGE]);

/** 立水软化组：瓦楞与皴纹陡坡，纯兰伯特会读成黑槽 */
export const SOFT_SIDE = new Set([TILE, TILE_LT, TILE_DK, THATCH, THATCH_DK]);

