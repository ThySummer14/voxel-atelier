// Rich curated architectural & geological palette for Mount Heng's Hanging Temple (491 AD)
// Each material carries RGB, roughness, metalness, emissive, and semantic group ID.

export const GROUPS = {
  CLIFF_OUTER: 0,     // Outer Jinlong Gorge ochre-red dolomite cliff (fades in X-Ray mode)
  CLIFF_CORE: 1,      // Deep inner mountain bedrock & stone sockets (stays solid in X-Ray mode to show sockets!)
  BEAMS_MECHANICS: 2, // Hemlock cantilever beams, oak expansion wedges, vertical support posts (highlighted in X-Ray)
  ARCHITECTURE: 3,    // Ancient temple timber, white plaster walls, grey tiles, green/yellow glazed roof ridges, statues
  LANTERNS: 4,        // Warm glowing paper/wood window lattices, oil lamps, incense embers
  NATURE: 5,          // Riverbed stones, ancient stone bridge, cliff pines, calligraphy stele, monks & travelers
};

// Material IDs (1..95)
export const MAT = {
  AIR: 0,

  // 1-12: Mount Heng Jinlong Gorge Dolomite / Reddish-Ochre Cliff Strata (Outer)
  CLIFF_OCHRE_1: 1,
  CLIFF_OCHRE_2: 2,
  CLIFF_OCHRE_3: 3,
  CLIFF_RUST_1: 4,
  CLIFF_RUST_2: 5,
  CLIFF_SAND_1: 6,
  CLIFF_SAND_2: 7,
  CLIFF_DARK_SLATE: 8,
  CLIFF_SHADOW_CREVICE: 9,
  CLIFF_WEATHERED_GREY: 10,
  CLIFF_LICHEN_MOSS: 11,
  CLIFF_CAP_STONE: 12,

  // 13-16: Inner Bedrock & Drilled Socket Lining (remains visible in X-Ray cutaway!)
  BEDROCK_DEEP_1: 13,
  BEDROCK_DEEP_2: 14,
  SOCKET_WALL_STONE: 15,
  GROTTO_CARVED_WALL: 16,

  // 17-24: Core Structural Mechanics (Tung-oil treated Hemlock beams, Oak wedges, Vertical posts)
  HEMLOCK_BEAM_MAIN: 17,     // Deeply embedded + cantilevered main beams
  HEMLOCK_BEAM_END: 18,      // Cut grain cross-section at beam tip
  OAK_WEDGE_GOLD: 19,        // Expansion wedge hammered inside cliff socket!
  SUPPORT_POST_WOOD: 20,     // Slender vertical support columns under walkways
  SUPPORT_POST_BASE: 21,     // Stone plinth / mortise seat on cliff ledge
  CORBEL_BRACE_WOOD: 22,     // Angled strut / cantilever brace (雀替/斜撑)
  PLANK_DECK_WOOD: 23,       // Walkway & balcony heavy timber floor planks
  IRON_TIE_RING: 24,         // Wrought iron anchor ring / reinforcement band

  // 25-42: Ming-Qing / Northern Wei Temple Timber & Walls
  LACQUER_RED_PILLAR: 25,    // Aged cinnabar red main columns
  LACQUER_RED_DARK: 26,      // Shaded weathered red lacquer
  LACQUER_RED_RAIL: 27,      // Ornate red balustrade railings
  DOUGONG_RED: 28,           // Bracket set red blocks (斗)
  DOUGONG_GREEN: 29,         // Bracket set mineral green painted arms (拱/彩画青绿)
  DOUGONG_BLUE: 30,          // Mineral azurite blue beam polychrome (青金彩画)
  DOUGONG_GOLD: 31,          // Gilded polychrome accent dot
  TIMBER_DARK_ELM: 32,       // Aged dark brown elm beams & rafters
  TIMBER_WARM_CEDAR: 33,     // Lattice doors & window frames
  WALL_WHITE_PLASTER: 34,    // Lime-plastered temple wall
  WALL_AGED_CREAM: 35,       // Slightly weathered warm plaster
  WALL_GREY_BRICK_1: 36,     // Blue-grey temple masonry brick
  WALL_GREY_BRICK_2: 37,     // Darker masonry brick
  STONE_SUMERU_BASE: 38,     // Carved white-grey stone pedestal
  STONE_STEPS: 39,           // Worn mountain steps

  // 43-54: Classical Glazed & Grey Tile Roofs (灰筒瓦绿琉璃剪边 & 黄琉璃脊)
  TILE_GREY_1: 43,
  TILE_GREY_2: 44,
  TILE_GREY_DARK: 45,
  GLAZE_GREEN_1: 46,         // Emerald glazed roof trim & eaves (绿琉璃剪边)
  GLAZE_GREEN_2: 47,         // Deep jade glazed ridge
  GLAZE_YELLOW_1: 48,        // Imperial amber-gold glazed ridge & chiwen (黄琉璃正脊/鸱吻)
  GLAZE_YELLOW_2: 49,
  GLAZE_TURQUOISE: 50,       // Cyan-blue glazed finial accent
  EAVE_RAFTER_WHITE: 51,     // Painted white飞椽 ends! Iconic tiny white dots under Chinese eaves

  // 55-65: Sacred Statues (Three Teachings: Buddha, Confucius, Laozi), Bell, Plaque, Incense
  GOLD_STATUE_BRIGHT: 55,    // Gilded Sakyamuni Buddha
  GOLD_STATUE_SHADOW: 56,
  STATUE_ROBE_BLUE: 57,      // Laozi Daoist robe / Confucius scholar robe
  STATUE_ROBE_OCHRE: 58,
  BRONZE_BELL: 59,           // Ancient cast bronze bell in Bell Tower
  BRONZE_PATINA: 60,         // Verdigris bronze incense burner
  DRUM_HIDE_CREAM: 61,       // Great leather drum in Drum Tower
  PLAQUE_BLACK_LACQUER: 62,  // Inscribed wooden plaque background (匾额「悬空寺」「三教殿」「公输天巧」)
  PLAQUE_GOLD_INK: 63,       // Gold calligraphy strokes on plaques
  STELE_CINNABAR_INK: 64,    // Li Bai's 「壮观」 giant cliffside red calligraphy!

  // 66-72: Emissive Lanterns, Window Glow, Incense Fire
  WINDOW_PAPER_WARM: 66,     // Warm glowing rice-paper lattice window (lights up strongly at dusk/night)
  WINDOW_PAPER_DAY: 67,      // Subtle cream paper lattice
  LANTERN_RED_SILK: 68,      // Hanging red temple lantern
  LANTERN_CORE_GOLD: 69,     // Bright oil lamp flame core
  INCENSE_EMBER: 70,         // Glowing red incense tip

  // 73-88: Jinlong Gorge Nature (Pines, Riverbed, Bridge, Figures)
  PINE_BARK_1: 73,
  PINE_BARK_2: 74,
  PINE_NEEDLE_1: 75,
  PINE_NEEDLE_2: 76,
  PINE_NEEDLE_3: 77,
  AUTUMN_SHRUB_GOLD: 78,     // Golden cliff-side wild cotoneaster / autumn bush
  AUTUMN_SHRUB_RED: 79,
  RIVER_STONE_1: 80,
  RIVER_STONE_2: 81,
  RIVER_WET_ROCK: 82,
  RIVER_MOSS: 83,
  BRIDGE_STONE_1: 84,
  BRIDGE_STONE_2: 85,
  MONK_ROBE_SAFFRON: 86,     // Buddhist monk robe
  MONK_ROBE_GREY: 87,        // Daoist / scholar traveler robe
  SKIN_WARM: 88,
  BAMBOO_HAT: 89,
  SNOW_CAP: 90,
};

const RAW_PALETTE = [
  // 0: AIR
  { id: MAT.AIR, hex: '#000000', rough: 1.0, metal: 0.0, emit: 0.0, group: GROUPS.CLIFF_OUTER },

  // Outer Cliff Strata — Authentic Hengshan Jinlong Gorge warm ochre-terracotta-buff dolomite
  { id: MAT.CLIFF_OCHRE_1, hex: '#9e6240', rough: 0.92, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_OCHRE_2, hex: '#8b5336', rough: 0.93, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_OCHRE_3, hex: '#ad714c', rough: 0.90, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_RUST_1, hex: '#7c432b', rough: 0.94, metal: 0.03, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_RUST_2, hex: '#693724', rough: 0.95, metal: 0.03, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_SAND_1, hex: '#bd8761', rough: 0.89, metal: 0.01, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_SAND_2, hex: '#caa07a', rough: 0.88, metal: 0.01, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_DARK_SLATE, hex: '#523830', rough: 0.95, metal: 0.04, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_SHADOW_CREVICE, hex: '#3b2722', rough: 0.97, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_WEATHERED_GREY, hex: '#7b6c63', rough: 0.92, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_LICHEN_MOSS, hex: '#656e46', rough: 0.94, metal: 0.00, emit: 0, group: GROUPS.CLIFF_OUTER },
  { id: MAT.CLIFF_CAP_STONE, hex: '#886752', rough: 0.92, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },

  // Inner Bedrock & Carved Grottoes (SOCKET_WALL_STONE stays in CLIFF_CORE, while GROTTO_CARVED_WALL joins CLIFF_OUTER so X-Ray sees right through grotto walls into the embedded beams!)
  { id: MAT.BEDROCK_DEEP_1, hex: '#4a352e', rough: 0.95, metal: 0.02, emit: 0, group: GROUPS.CLIFF_CORE },
  { id: MAT.BEDROCK_DEEP_2, hex: '#3d2b25', rough: 0.96, metal: 0.02, emit: 0, group: GROUPS.CLIFF_CORE },
  { id: MAT.SOCKET_WALL_STONE, hex: '#63483d', rough: 0.90, metal: 0.03, emit: 0, group: GROUPS.CLIFF_CORE },
  { id: MAT.GROTTO_CARVED_WALL, hex: '#765341', rough: 0.90, metal: 0.02, emit: 0, group: GROUPS.CLIFF_OUTER },

  // Structural Mechanics (Hemlock beams soaked in tung oil = rich amber-chestnut)
  { id: MAT.HEMLOCK_BEAM_MAIN, hex: '#8c5327', rough: 0.68, metal: 0.05, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.HEMLOCK_BEAM_END, hex: '#b57842', rough: 0.72, metal: 0.03, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.OAK_WEDGE_GOLD, hex: '#e09f3e', rough: 0.58, metal: 0.08, emit: 0.15, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.SUPPORT_POST_WOOD, hex: '#784421', rough: 0.72, metal: 0.04, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.SUPPORT_POST_BASE, hex: '#8b837a', rough: 0.86, metal: 0.02, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.CORBEL_BRACE_WOOD, hex: '#6e3d1e', rough: 0.70, metal: 0.04, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.PLANK_DECK_WOOD, hex: '#684329', rough: 0.80, metal: 0.02, emit: 0, group: GROUPS.BEAMS_MECHANICS },
  { id: MAT.IRON_TIE_RING, hex: '#2e3136', rough: 0.45, metal: 0.78, emit: 0, group: GROUPS.BEAMS_MECHANICS },

  // Temple Timber & Walls
  { id: MAT.LACQUER_RED_PILLAR, hex: '#9e2a22', rough: 0.56, metal: 0.06, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.LACQUER_RED_DARK, hex: '#781e18', rough: 0.62, metal: 0.05, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.LACQUER_RED_RAIL, hex: '#b3342a', rough: 0.54, metal: 0.06, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.DOUGONG_RED, hex: '#8f261f', rough: 0.60, metal: 0.05, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.DOUGONG_GREEN, hex: '#2c6e58', rough: 0.62, metal: 0.04, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.DOUGONG_BLUE, hex: '#264b73', rough: 0.64, metal: 0.04, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.DOUGONG_GOLD, hex: '#d4a243', rough: 0.38, metal: 0.65, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.TIMBER_DARK_ELM, hex: '#4a3223', rough: 0.78, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.TIMBER_WARM_CEDAR, hex: '#7a4928', rough: 0.70, metal: 0.03, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.WALL_WHITE_PLASTER, hex: '#dfd6c7', rough: 0.88, metal: 0.00, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.WALL_AGED_CREAM, hex: '#cbbda8', rough: 0.90, metal: 0.00, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.WALL_GREY_BRICK_1, hex: '#63686e', rough: 0.88, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.WALL_GREY_BRICK_2, hex: '#50555b', rough: 0.90, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.STONE_SUMERU_BASE, hex: '#948d84', rough: 0.85, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.STONE_STEPS, hex: '#827b72', rough: 0.88, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },

  // Roofs (Grey unglazed barrel tiles + emerald green & imperial amber glazed trim)
  { id: MAT.TILE_GREY_1, hex: '#43484f', rough: 0.78, metal: 0.06, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.TILE_GREY_2, hex: '#363a40', rough: 0.80, metal: 0.06, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.TILE_GREY_DARK, hex: '#282b30', rough: 0.84, metal: 0.05, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.GLAZE_GREEN_1, hex: '#1e7a56', rough: 0.24, metal: 0.14, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.GLAZE_GREEN_2, hex: '#14593e', rough: 0.26, metal: 0.14, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.GLAZE_YELLOW_1, hex: '#d99829', rough: 0.25, metal: 0.18, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.GLAZE_YELLOW_2, hex: '#b57919', rough: 0.28, metal: 0.16, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.GLAZE_TURQUOISE, hex: '#25858a', rough: 0.24, metal: 0.15, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.EAVE_RAFTER_WHITE, hex: '#e8e0d3', rough: 0.75, metal: 0.00, emit: 0, group: GROUPS.ARCHITECTURE },

  // Statues, Bell, Plaques
  { id: MAT.GOLD_STATUE_BRIGHT, hex: '#e6b44c', rough: 0.28, metal: 0.82, emit: 0.08, group: GROUPS.ARCHITECTURE },
  { id: MAT.GOLD_STATUE_SHADOW, hex: '#b88628', rough: 0.35, metal: 0.78, emit: 0.04, group: GROUPS.ARCHITECTURE },
  { id: MAT.STATUE_ROBE_BLUE, hex: '#2e5077', rough: 0.68, metal: 0.05, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.STATUE_ROBE_OCHRE, hex: '#b5632a', rough: 0.68, metal: 0.05, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.BRONZE_BELL, hex: '#7c6238', rough: 0.38, metal: 0.78, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.BRONZE_PATINA, hex: '#486b5b', rough: 0.52, metal: 0.55, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.DRUM_HIDE_CREAM, hex: '#d8c59e', rough: 0.70, metal: 0.02, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.PLAQUE_BLACK_LACQUER, hex: '#1d1b1a', rough: 0.36, metal: 0.10, emit: 0, group: GROUPS.ARCHITECTURE },
  { id: MAT.PLAQUE_GOLD_INK, hex: '#e8b94f', rough: 0.30, metal: 0.75, emit: 0.06, group: GROUPS.ARCHITECTURE },
  { id: MAT.STELE_CINNABAR_INK, hex: '#b82921', rough: 0.65, metal: 0.04, emit: 0.03, group: GROUPS.NATURE },

  // Lanterns & Glowing Windows
  { id: MAT.WINDOW_PAPER_WARM, hex: '#ffb85c', rough: 0.65, metal: 0.00, emit: 1.0, group: GROUPS.LANTERNS },
  { id: MAT.WINDOW_PAPER_DAY, hex: '#e5dac3', rough: 0.82, metal: 0.00, emit: 0.18, group: GROUPS.LANTERNS },
  { id: MAT.LANTERN_RED_SILK, hex: '#e03526', rough: 0.48, metal: 0.02, emit: 0.85, group: GROUPS.LANTERNS },
  { id: MAT.LANTERN_CORE_GOLD, hex: '#ffe394', rough: 0.30, metal: 0.00, emit: 1.35, group: GROUPS.LANTERNS },
  { id: MAT.INCENSE_EMBER, hex: '#ff5722', rough: 0.50, metal: 0.00, emit: 1.20, group: GROUPS.LANTERNS },

  // Nature & Figures
  { id: MAT.PINE_BARK_1, hex: '#4d3629', rough: 0.92, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.PINE_BARK_2, hex: '#3b281e', rough: 0.94, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.PINE_NEEDLE_1, hex: '#2d5236', rough: 0.85, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.PINE_NEEDLE_2, hex: '#3b6642', rough: 0.84, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.PINE_NEEDLE_3, hex: '#203d27', rough: 0.88, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.AUTUMN_SHRUB_GOLD, hex: '#c7882c', rough: 0.82, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.AUTUMN_SHRUB_RED, hex: '#a83c28', rough: 0.82, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.RIVER_STONE_1, hex: '#6c6862', rough: 0.82, metal: 0.02, emit: 0, group: GROUPS.NATURE },
  { id: MAT.RIVER_STONE_2, hex: '#57534e', rough: 0.85, metal: 0.02, emit: 0, group: GROUPS.NATURE },
  { id: MAT.RIVER_WET_ROCK, hex: '#383a3d', rough: 0.32, metal: 0.12, emit: 0, group: GROUPS.NATURE },
  { id: MAT.RIVER_MOSS, hex: '#4b633b', rough: 0.88, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.BRIDGE_STONE_1, hex: '#8f887d', rough: 0.84, metal: 0.02, emit: 0, group: GROUPS.NATURE },
  { id: MAT.BRIDGE_STONE_2, hex: '#787167', rough: 0.86, metal: 0.02, emit: 0, group: GROUPS.NATURE },
  { id: MAT.MONK_ROBE_SAFFRON, hex: '#c96a24', rough: 0.78, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.MONK_ROBE_GREY, hex: '#525d68', rough: 0.80, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.SKIN_WARM, hex: '#d9a882', rough: 0.72, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.BAMBOO_HAT, hex: '#c9ae74', rough: 0.82, metal: 0.00, emit: 0, group: GROUPS.NATURE },
  { id: MAT.SNOW_CAP, hex: '#eef3f8', rough: 0.75, metal: 0.02, emit: 0, group: GROUPS.NATURE },
];

export const PALETTE = new Array(128).fill(null);
for (const entry of RAW_PALETTE) {
  const hex = entry.hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  // Convert sRGB to linear RGB for accurate Three.js PBR vertex colors
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  PALETTE[entry.id] = {
    ...entry,
    srgb: [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ],
    rgb: [toLin(r), toLin(g), toLin(b)],
  };
}
