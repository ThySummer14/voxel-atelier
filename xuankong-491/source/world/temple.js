// Master Architectural Composer for Mount Heng's Hanging Temple (恒山悬空寺 · 北魏太和十五年 491 AD)
// Authentic "One Courtyard, Two Three-Story Pavilions, Bell & Drum Towers, and Twin Sky-Plank Walkways"
// Stepping dramatically northward and upward across the sheer Jinlong Gorge cliff face!

import { MAT } from '../core/palette.js';
import { buildVoxelPerson } from './cliff.js';
import {
  buildCantileverBeamDeck,
  buildBalustradeZ,
  buildBalustradeX,
  buildHangingLantern,
  buildPlaque,
  buildHallStory,
  buildClassicalRoof,
  buildThreeTeachingsStatues,
  buildBronzeBell,
  buildTempleDrum,
} from './architecture.js';

export function buildHangingTemple(grid, anchors) {
  // =========================================================================
  // ZONE 1: SOUTH MOUNTAIN GATE & ENTRY TERRACE (山门牌楼与南登云台)
  // Z = [-74 .. -56], Y = 78
  // =========================================================================
  buildSouthMountainGate(grid, anchors);

  // =========================================================================
  // ZONE 2: SOUTH COURTYARD & TWIN BELL / DRUM TOWERS (一院 · 纯阳宫院落与钟鼓双楼)
  // Z = [-55 .. -24], Base Deck Y = 86, Upper Gallery Y = 97
  // =========================================================================
  buildSouthCourtyardAndBellDrum(grid, anchors);

  // =========================================================================
  // ZONE 3: SOUTH THREE-STORY PAVILION (南楼 · 三层危阁：萨迦殿 / 伽蓝殿 / 送子观音殿)
  // Z = [-22 .. +8], Stories at Y = 98, Y = 110, Y = 122 (Roof crest ~ Y = 142)
  // =========================================================================
  buildSouthPavilion(grid, anchors);

  // =========================================================================
  // ZONE 4: ICONIC DOUBLE-DECKER CLIFFSIDE SKY WALKWAY (凌空双层飞栈 · 长虹栈道)
  // Z = [+9 .. +35], Lower Grotto Gallery Y = 110, Upper Cantilever Plank Sky-Bridge Y = 124!
  // =========================================================================
  buildDoubleSkyWalkway(grid, anchors);

  // =========================================================================
  // ZONE 5: NORTH THREE-STORY PAVILION & HALL OF THREE TEACHINGS (北楼 · 四佛殿 / 三圣殿 / 三教殿)
  // Highest, narrowest, most breathtakingly cantilevered climax of the entire temple!
  // Z = [+36 .. +70], Stories at Y = 114, Y = 126, Y = 138 (Roof crest ~ Y = 160!)
  // =========================================================================
  buildNorthPavilionThreeTeachings(grid, anchors);

  // =========================================================================
  // ZONE 6: CLIFF GROTTO SHRINES & CONNECTING STAIRWAYS (雷音洞窟与穿云木梯)
  // =========================================================================
  buildConnectingStairsAndLife(grid, anchors);
}

function buildSouthMountainGate(grid, anchors) {
  const z0 = -73;
  const z1 = -56;
  const deckY = 78;
  const outerX = 15;

  // Stone-faced masonry terrace anchored into the southern cliff spur
  for (let z = z0; z <= z1; z++) {
    for (let x = -2; x <= outerX; x++) {
      for (let y = deckY - 10; y <= deckY; y++) {
        const isOuter = x === outerX || z === z0 || z === z1;
        const mat = y === deckY
          ? MAT.STONE_STEPS
          : y === deckY - 1
          ? MAT.STONE_SUMERU_BASE
          : isOuter
          ? (((x + y + z) & 1) ? MAT.WALL_GREY_BRICK_1 : MAT.WALL_GREY_BRICK_2)
          : MAT.BEDROCK_DEEP_1;
        grid.set(x, y, z, mat);
      }
      // Clear air above terrace
      for (let y = deckY + 1; y <= deckY + 18; y++) {
        if (x >= 2) grid.set(x, y, z, 0);
      }
    }
  }

  // Outer carved stone & crimson parapet along East edge
  buildBalustradeZ(grid, outerX, deckY, z0, z1, 8);

  // Iconic Red-Wall Arched Mountain Gatehouse (`山门门楼`) at Z = -66..-58
  const gz0 = -67;
  const gz1 = -58;
  for (let z = gz0; z <= gz1; z++) {
    for (let x = 3; x <= 12; x++) {
      for (let y = deckY + 1; y <= deckY + 10; y++) {
        // Arched walk-through portal running South -> North along Z (centered at x = 7..9)
        const dxGate = x - 8;
        const inArch = Math.abs(dxGate) <= 2 && (y <= deckY + 5 || (y === deckY + 6 && Math.abs(dxGate) <= 1));
        if (inArch) {
          grid.set(x, y, z, 0);
          continue;
        }
        // Thick crimson-plastered fortress gate walls on z === gz0 and z === gz1, hollow room inside
        if (z === gz0 || z === gz1 || x === 3 || x === 12) {
          grid.set(x, y, z, y <= deckY + 2 ? MAT.STONE_SUMERU_BASE : MAT.LACQUER_RED_PILLAR);
        }
      }
    }
  }

  // Plaque 「悬空寺」 above South Entrance Arch (`gz0` face) & East face (`x = 13`)
  buildPlaque(grid, 13, deckY + 7, -62, 3);

  // Swept Xieshan Roof with green glazed trim & yellow ridge over Mountain Gatehouse
  buildClassicalRoof(grid, {
    x0: 3,
    x1: 12,
    z0: gz0,
    z1: gz1,
    baseY: deckY + 10,
    ridgeHeight: 7,
    eaveOverhang: 3,
    style: 'xieshan',
  });

  // Stone steps rising from Gate Terrace (Y=78, Z=-56) to South Courtyard (Y=86, Z=-54)
  for (let i = 0; i <= 8; i++) {
    const sy = deckY + i;
    const sz = -59 + Math.floor(i * 0.6);
    for (let x = 6; x <= 11; x++) {
      grid.set(x, sy, sz, MAT.STONE_STEPS);
      grid.set(x, sy - 1, sz, MAT.WALL_GREY_BRICK_1);
    }
  }

  anchors.mountainGate = { x: 10, y: deckY + 6, z: -63 };
}

function buildSouthCourtyardAndBellDrum(grid, anchors) {
  const z0 = -54;
  const z1 = -24;
  const deckY = 86;
  const outerX = 14;

  // 1. Deeply embedded Hemlock cantilever beam foundation + slender vertical support posts down to lower rock shelves!
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY,
    outerX,
    beamSpacing: 4,
    embedDepth: 15,
    withSupportPosts: true,
    postSpacing: 7,
  });

  // 2. Two-story main west hall recessed against cliff (Chunyang Palace / Guanyin Hall, X = -4 .. +7)
  const story1 = buildHallStory(grid, {
    z0: z0 + 2,
    z1: z1 - 2,
    deckY,
    height: 10,
    backX: -5,
    wallX: 4,
    colX: 8,
    bays: 5,
    hasBalustrade: false,
    openCenterDoor: true,
    plaqueTitle: true,
    lanterns: true,
  });

  // Open courtyard terrace (`庭院平台`) between X = 8 and outerX = 14, with bronze incense cauldron in center!
  buildBalustradeZ(grid, outerX, deckY, z0, z1, 10);
  const courtMidZ = -39;
  // Tripod bronze incense burner (`大香炉`) in courtyard
  for (let ox = -1; ox <= 1; ox++) {
    for (let oz = -1; oz <= 1; oz++) {
      grid.set(11 + ox, deckY + 1, courtMidZ + oz, MAT.STONE_SUMERU_BASE);
      grid.set(11 + ox, deckY + 2, courtMidZ + oz, MAT.BRONZE_PATINA);
    }
  }
  grid.set(11, deckY + 3, courtMidZ, MAT.INCENSE_EMBER);
  anchors.courtyardIncense = { x: 11, y: deckY + 4, z: courtMidZ };

  // Upper floor gallery over main hall (Y = 96..106)
  buildCantileverBeamDeck(grid, {
    z0: z0 + 2,
    z1: z1 - 2,
    deckY: story1.topY,
    outerX: 9,
    beamSpacing: 5,
    embedDepth: 14,
    withSupportPosts: false,
    withAngledBraces: false,
  });

  const story2 = buildHallStory(grid, {
    z0: z0 + 3,
    z1: z1 - 3,
    deckY: story1.topY,
    height: 9,
    backX: -5,
    wallX: 4,
    colX: 8,
    bays: 5,
    hasBalustrade: true,
    openCenterDoor: false,
    plaqueTitle: true,
    lanterns: true,
  });

  buildClassicalRoof(grid, {
    x0: -5,
    x1: 8,
    z0: z0 + 3,
    z1: z1 - 3,
    baseY: story2.topY,
    ridgeHeight: 8,
    eaveOverhang: 4,
    style: 'xieshan',
  });

  // 3. TWIN CANTILEVERED BELL TOWER (South, Z = -55..-45) & DRUM TOWER (North, Z = -33..-23)!
  // Jutting boldly eastward (`X = 8..18`) right over the sheer gorge with Cross-Ridge Roofs (`十字歇山顶`)!
  buildBellOrDrumTower(grid, {
    z0: -55,
    z1: -45,
    baseY: deckY,
    isBell: true,
  });
  anchors.bellTower = { x: 13, y: deckY + 14, z: -50 };

  buildBellOrDrumTower(grid, {
    z0: -33,
    z1: -23,
    baseY: deckY,
    isBell: false,
  });
  anchors.drumTower = { x: 13, y: deckY + 14, z: -28 };
}

function buildBellOrDrumTower(grid, { z0, z1, baseY, isBell }) {
  const x0 = 8;
  const x1 = 18;
  const midX = 13;
  const midZ = Math.round((z0 + z1) * 0.5);

  // Cantilevered hemlock beam platform jutting out to X = 18!
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY: baseY,
    outerX: x1,
    beamSpacing: 3,
    embedDepth: 16,
    withSupportPosts: true,
    postSpacing: 4,
    withAngledBraces: true,
  });

  // Lower story masonry/timber base pavilion (baseY .. baseY + 10)
  for (let y = baseY + 1; y <= baseY + 10; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        const onPerim = x === x0 || x === x1 || z === z0 || z === z1;
        if (!onPerim) {
          grid.set(x, y, z, 0);
          continue;
        }
        const isCorner = (x === x0 || x === x1) && (z === z0 || z === z1);
        const isDoor = x === x0 && Math.abs(z - midZ) <= 1 && y <= baseY + 6;
        const isWindow = (x === x1 || z === z0 || z === z1) && Math.abs((x === x1 ? z - midZ : x - midX)) <= 2 && y >= baseY + 4 && y <= baseY + 7;

        if (isDoor) continue;
        if (isCorner) {
          grid.set(x, y, z, MAT.LACQUER_RED_PILLAR);
        } else if (isWindow) {
          grid.set(x, y, z, ((x + y + z) & 1) ? MAT.TIMBER_WARM_CEDAR : MAT.WINDOW_PAPER_WARM);
        } else if (y <= baseY + 2) {
          grid.set(x, y, z, MAT.STONE_SUMERU_BASE);
        } else if (y >= baseY + 9) {
          grid.set(x, y, z, MAT.DOUGONG_GREEN);
        } else {
          grid.set(x, y, z, MAT.LACQUER_RED_DARK);
        }
      }
    }
  }

  // Waist skirt eave (`重檐腰檐`) + upper balcony deck (`平座`) at Y = baseY + 10
  buildClassicalRoof(grid, {
    x0: x0 + 1,
    x1: x1 - 1,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: baseY + 9,
    eaveOverhang: 3,
    style: 'skirt',
  });

  const upperY = baseY + 11;
  for (let z = z0; z <= z1; z++) {
    for (let x = x0; x <= x1; x++) {
      grid.set(x, upperY, z, MAT.PLANK_DECK_WOOD);
    }
  }
  buildBalustradeZ(grid, x1, upperY, z0, z1, 0);
  buildBalustradeX(grid, z0, upperY, x0, x1);
  buildBalustradeX(grid, z1, upperY, x0, x1);

  // Open-air upper belfry pavilion (`钟鼓楼上层敞轩`, upperY + 1 .. upperY + 9) so the Bronze Bell & Drum are visible!
  const belfryTop = upperY + 9;
  const cols = [
    [x0 + 1, z0 + 1], [x1 - 1, z0 + 1],
    [x0 + 1, z1 - 1], [x1 - 1, z1 - 1],
    [x1 - 1, midZ - 2], [x1 - 1, midZ + 2],
  ];
  for (const [cx, cz] of cols) {
    for (let y = upperY + 1; y <= belfryTop; y++) {
      grid.set(cx, y, cz, MAT.LACQUER_RED_PILLAR);
    }
  }

  // Polychrome architrave ring around belfry top + corner lanterns!
  for (let z = z0 + 1; z <= z1 - 1; z++) {
    for (let x = x0 + 1; x <= x1 - 1; x++) {
      if (x === x0 + 1 || x === x1 - 1 || z === z0 + 1 || z === z1 - 1) {
        grid.set(x, belfryTop - 1, z, ((x + z) & 1) ? MAT.DOUGONG_GREEN : MAT.DOUGONG_BLUE);
        grid.set(x, belfryTop, z, MAT.LACQUER_RED_PILLAR);
      }
    }
  }
  buildHangingLantern(grid, x1 + 1, belfryTop - 1, z0 + 1);
  buildHangingLantern(grid, x1 + 1, belfryTop - 1, z1 - 1);

  // Install the Cast-Bronze Bell (`洪钟`) or Great Leather Drum (`法鼓`) inside!
  if (isBell) {
    buildBronzeBell(grid, midX, upperY, midZ);
  } else {
    buildTempleDrum(grid, midX, upperY, midZ);
  }

  // Crown with magnificent Cross-Ridge Hipped-Gable Glazed Roof (`十字歇山琉璃脊顶`)!
  buildClassicalRoof(grid, {
    x0: x0 + 1,
    x1: x1 - 1,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: belfryTop,
    ridgeHeight: 8,
    eaveOverhang: 4,
    style: 'cross',
  });
}

function buildSouthPavilion(grid, anchors) {
  // Iconic Three-Story Cliffside Pavilion (`南楼`: Z = [-21 .. +8])
  // Story 1: Y = 98, Story 2: Y = 110, Story 3: Y = 122
  const z0 = -21;
  const z1 = 8;

  // Story 1 Foundation: Heavy Hemlock Cantilever Beams + Tall Slender Vertical Posts dropping 35 voxels down to cliff rock!
  const y1 = 98;
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY: y1,
    outerX: 12,
    beamSpacing: 3,
    embedDepth: 16,
    withSupportPosts: true,
    postSpacing: 5,
    withAngledBraces: true,
  });

  const s1 = buildHallStory(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y1,
    height: 11,
    backX: -6,
    wallX: 6,
    colX: 11,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: true,
    plaqueTitle: true,
    lanterns: true,
  });

  // Waist skirt eave between Story 1 and Story 2
  buildClassicalRoof(grid, {
    x0: -6,
    x1: 11,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: s1.topY - 1,
    eaveOverhang: 3,
    style: 'skirt',
  });

  // Story 2 (Y = 110..121) — cantilevers out slightly further (`平座挑出`) for classic Hanging Temple top-heavy drama!
  const y2 = s1.topY + 1; // 110
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY: y2,
    outerX: 13,
    beamSpacing: 4,
    embedDepth: 15,
    withSupportPosts: false,
    withAngledBraces: true,
  });

  const s2 = buildHallStory(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y2,
    height: 11,
    backX: -6,
    wallX: 7,
    colX: 12,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: false,
    plaqueTitle: true,
    lanterns: true,
  });

  buildClassicalRoof(grid, {
    x0: -6,
    x1: 12,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: s2.topY - 1,
    eaveOverhang: 3,
    style: 'skirt',
  });

  // Story 3 (Y = 122..133, Songzi Guanyin Hall `送子观音殿`)
  const y3 = s2.topY + 1; // 122
  buildCantileverBeamDeck(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y3,
    outerX: 13,
    beamSpacing: 4,
    embedDepth: 15,
    withSupportPosts: false,
    withAngledBraces: false,
  });

  const s3 = buildHallStory(grid, {
    z0: z0 + 2,
    z1: z1 - 2,
    deckY: y3,
    height: 11,
    backX: -5,
    wallX: 7,
    colX: 12,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: true,
    plaqueTitle: true,
    lanterns: true,
  });

  // Golden Guanyin statue inside 3rd floor open center bay
  const midZ = Math.round((z0 + z1) * 0.5);
  for (let dy = 1; dy <= 6; dy++) {
    grid.set(3, y3 + dy, midZ, dy <= 2 ? MAT.STONE_SUMERU_BASE : MAT.GOLD_STATUE_BRIGHT);
  }

  // Grand Sweeping Xieshan Crown Roof (`重檐歇山顶`) with emerald-green glazed trim & amber-gold dragon ridge!
  buildClassicalRoof(grid, {
    x0: -5,
    x1: 12,
    z0: z0 + 2,
    z1: z1 - 2,
    baseY: s3.topY,
    ridgeHeight: 9,
    eaveOverhang: 4,
    style: 'xieshan',
  });

  anchors.southPavilion = { x: 10, y: y2 + 6, z: midZ };
}

function buildDoubleSkyWalkway(grid, anchors) {
  // THE signature view of Hanging Temple:
  // Twin narrow cantilevered timber plank walkways (`双层飞栈`) clinging to sheer red rock between South & North Pavilions!
  // Z = [+9 .. +35]
  const z0 = 9;
  const z1 = 35;

  // 1. LOWER SKY WALKWAY (Y = 110 -> gently steps up to Y = 114 at Z = 35 to meet North Pavilion Floor 1!)
  for (let z = z0; z <= z1; z++) {
    const t = (z - z0) / (z1 - z0);
    const deckY = 110 + Math.round(t * 4);
    const outerX = 9;
    const cliffX = -4;

    // Clear walking tunnel / cliff gallery headroom
    for (let y = deckY + 1; y <= deckY + 9; y++) {
      for (let x = cliffX + 1; x <= outerX + 2; x++) {
        grid.set(x, y, z, 0);
      }
    }
    // Carved cliff grotto inner wall with recessed small stone Buddha niches (`北魏石窟造像龛`)!
    for (let y = deckY + 1; y <= deckY + 8; y++) {
      grid.set(cliffX, y, z, MAT.GROTTO_CARVED_WALL);
    }
    if ((z - z0) % 7 === 3) {
      grid.set(cliffX + 1, deckY + 2, z, MAT.STONE_SUMERU_BASE);
      grid.set(cliffX + 1, deckY + 3, z, MAT.GOLD_STATUE_BRIGHT);
      grid.set(cliffX + 1, deckY + 4, z, MAT.GOLD_STATUE_BRIGHT);
    }

    // Timber floor planks
    for (let x = cliffX + 1; x <= outerX; x++) {
      grid.set(x, deckY, z, MAT.PLANK_DECK_WOOD);
    }

    // Deeply embedded Hemlock Cantilever Beams every 3 voxels + Expansion Oak Wedges + Slender Vertical Posts!
    if ((z - z0) % 3 === 0) {
      const innerTipX = cliffX - 15;
      for (let x = innerTipX - 1; x <= cliffX; x++) {
        grid.set(x, deckY + 1, z, MAT.SOCKET_WALL_STONE);
        grid.set(x, deckY - 3, z, MAT.SOCKET_WALL_STONE);
        if (x === innerTipX - 1) {
          grid.set(x, deckY - 1, z, MAT.SOCKET_WALL_STONE);
          grid.set(x, deckY - 2, z, MAT.SOCKET_WALL_STONE);
        }
      }
      for (let x = innerTipX; x <= outerX + 1; x++) {
        grid.set(x, deckY - 1, z, MAT.HEMLOCK_BEAM_MAIN);
        grid.set(x, deckY - 2, z, MAT.HEMLOCK_BEAM_MAIN);
      }
      grid.set(outerX + 1, deckY - 1, z, MAT.HEMLOCK_BEAM_END);
      grid.set(outerX + 1, deckY - 2, z, MAT.HEMLOCK_BEAM_END);
      // Golden expansion oak wedge inside socket!
      grid.set(innerTipX, deckY - 1, z, MAT.OAK_WEDGE_GOLD);
      grid.set(innerTipX + 1, deckY - 1, z, MAT.OAK_WEDGE_GOLD);
      grid.set(cliffX + 1, deckY - 2, z, MAT.IRON_TIE_RING);

      // Diagonal wooden strut brace
      for (let b = 1; b <= 5; b++) {
        grid.set(cliffX + b, deckY - 2 - (5 - b), z, MAT.CORBEL_BRACE_WOOD);
      }
    }

    // Slender vertical support post every 6 voxels dropping far down onto steep cliff ledges (`立木千钧`)!
    if ((z - z0) % 6 === 2) {
      const px = outerX - 1;
      let hitY = -1;
      for (let y = deckY - 3; y >= 54; y--) {
        if (grid.get(px, y, z) !== 0) {
          hitY = y;
          break;
        }
      }
      if (hitY < 0) {
        // Create authentic rock toe-ledge at Y = 72..78 to catch the vertical post!
        hitY = 74 + ((z * 3) % 7);
        for (let rx = -6; rx <= px + 1; rx++) {
          grid.set(rx, hitY, z, MAT.CLIFF_OCHRE_2);
          grid.set(rx, hitY - 1, z, MAT.CLIFF_RUST_1);
          grid.set(rx, hitY, z - 1, MAT.CLIFF_OCHRE_3);
          grid.set(rx, hitY, z + 1, MAT.CLIFF_OCHRE_3);
        }
      }
      grid.set(px, hitY + 1, z, MAT.SUPPORT_POST_BASE);
      for (let y = hitY + 2; y <= deckY - 3; y++) {
        grid.set(px, y, z, MAT.SUPPORT_POST_WOOD);
      }
    }

    // Crimson balustrade & walkway columns supporting Upper Sky-Bridge!
    grid.set(outerX, deckY + 1, z, MAT.TIMBER_DARK_ELM);
    grid.set(outerX, deckY + 3, z, MAT.LACQUER_RED_RAIL);
    if ((z - z0) % 5 === 0) {
      for (let y = deckY + 1; y <= deckY + 11; y++) {
        grid.set(outerX, y, z, MAT.LACQUER_RED_PILLAR);
      }
    } else if ((z - z0) % 2 === 0) {
      grid.set(outerX, deckY + 2, z, MAT.LACQUER_RED_RAIL);
    }
  }

  // 2. UPPER CANTILEVERED SKY WALKWAY (`上层飞栈长廊`, Y = 122 -> steps up to Y = 126 at Z = 35!)
  for (let z = z0; z <= z1; z++) {
    const t = (z - z0) / (z1 - z0);
    const uDeckY = 122 + Math.round(t * 4);
    const uOuterX = 11; // Cantilevers 2 voxels further out over the abyss than the lower bridge!
    const cliffX = -3;

    for (let y = uDeckY + 1; y <= uDeckY + 9; y++) {
      for (let x = cliffX + 1; x <= uOuterX + 2; x++) {
        grid.set(x, y, z, 0);
      }
    }

    for (let x = cliffX + 1; x <= uOuterX; x++) {
      grid.set(x, uDeckY, z, MAT.PLANK_DECK_WOOD);
    }

    // Embedded Hemlock beams for Upper Sky-Walkway!
    if ((z - z0) % 3 === 1) {
      const innerTipX = cliffX - 15;
      for (let x = innerTipX - 1; x <= cliffX; x++) {
        grid.set(x, uDeckY + 1, z, MAT.SOCKET_WALL_STONE);
        grid.set(x, uDeckY - 2, z, MAT.SOCKET_WALL_STONE);
      }
      for (let x = innerTipX; x <= uOuterX + 1; x++) {
        grid.set(x, uDeckY - 1, z, MAT.HEMLOCK_BEAM_MAIN);
      }
      grid.set(uOuterX + 1, uDeckY - 1, z, MAT.HEMLOCK_BEAM_END);
      grid.set(innerTipX, uDeckY - 1, z, MAT.OAK_WEDGE_GOLD);
      grid.set(innerTipX + 1, uDeckY - 1, z, MAT.OAK_WEDGE_GOLD);
    }

    // Upper crimson balustrade + covered gallery colonnade & tiled eave roof!
    grid.set(uOuterX, uDeckY + 1, z, MAT.TIMBER_DARK_ELM);
    grid.set(uOuterX, uDeckY + 3, z, MAT.LACQUER_RED_RAIL);
    if ((z - z0) % 5 === 0) {
      for (let y = uDeckY + 1; y <= uDeckY + 8; y++) {
        grid.set(uOuterX, y, z, MAT.LACQUER_RED_PILLAR);
      }
      buildHangingLantern(grid, uOuterX + 1, uDeckY + 7, z);
    } else if ((z - z0) % 2 === 0) {
      grid.set(uOuterX, uDeckY + 2, z, MAT.LACQUER_RED_RAIL);
    }

    // Polychrome lintel (`彩画额枋`) & Sloped Grey-Tile Gallery Roof (`栈道披檐`) tucked under the cliff!
    grid.set(uOuterX, uDeckY + 8, z, (z & 1) ? MAT.DOUGONG_GREEN : MAT.DOUGONG_BLUE);
    for (let x = cliffX; x <= uOuterX + 2; x++) {
      const slopeY = uDeckY + 8 + Math.round((uOuterX + 2 - x) * 0.42);
      const isEdge = x === uOuterX + 2;
      grid.set(x, slopeY - 1, z, isEdge ? MAT.EAVE_RAFTER_WHITE : MAT.TIMBER_DARK_ELM);
      grid.set(x, slopeY, z, isEdge || x === uOuterX + 1 ? MAT.GLAZE_GREEN_1 : ((z & 1) ? MAT.TILE_GREY_1 : MAT.TILE_GREY_2));
    }
  }

  // Famous cliffside inscription plaque 「公输天巧」 carved into the rock above the Sky Walkway!
  buildPlaque(grid, 1, 137, 22, 5);

  anchors.skyWalkway = { x: 10, y: 125, z: 22 };
}

function buildNorthPavilionThreeTeachings(grid, anchors) {
  // THE CLIMAX OF XUANKONG TEMPLE:
  // North Three-Story Pavilion (`北楼`: Z = [+36 .. +68]), perched 114..160 voxels (nearly 40m in diorama, ~80m visual scale!)
  // above the emerald gorge, sheltered right beneath the giant overhanging red-rock canopy (`上凸如伞盖`)!
  const z0 = 36;
  const z1 = 68;
  const midZ = 52;

  // Story 1: Four Buddhas Hall (`四佛殿`, Y = 114..125)
  const y1 = 114;
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY: y1,
    outerX: 12,
    beamSpacing: 3,
    embedDepth: 17, // Deepest, strongest hemlock beam anchorage!
    withSupportPosts: true,
    postSpacing: 5,
    withAngledBraces: true,
  });

  const s1 = buildHallStory(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y1,
    height: 11,
    backX: -6,
    wallX: 6,
    colX: 11,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: true,
    plaqueTitle: true,
    lanterns: true,
  });

  buildClassicalRoof(grid, {
    x0: -6,
    x1: 11,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: s1.topY - 1,
    eaveOverhang: 3,
    style: 'skirt',
  });

  // Story 2: Three Saints Hall (`三圣殿`, Y = 126..137)
  const y2 = s1.topY + 1; // 126
  buildCantileverBeamDeck(grid, {
    z0,
    z1,
    deckY: y2,
    outerX: 13,
    beamSpacing: 4,
    embedDepth: 16,
    withSupportPosts: false,
    withAngledBraces: true,
  });

  const s2 = buildHallStory(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y2,
    height: 11,
    backX: -6,
    wallX: 7,
    colX: 12,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: false,
    plaqueTitle: true,
    lanterns: true,
  });

  buildClassicalRoof(grid, {
    x0: -6,
    x1: 12,
    z0: z0 + 1,
    z1: z1 - 1,
    baseY: s2.topY - 1,
    eaveOverhang: 3,
    style: 'skirt',
  });

  // Story 3: HALL OF THREE TEACHINGS (`三教殿`, Y = 138..150) — Buddha, Confucius & Laozi seated side by side!
  const y3 = s2.topY + 1; // 138
  buildCantileverBeamDeck(grid, {
    z0: z0 + 1,
    z1: z1 - 1,
    deckY: y3,
    outerX: 14, // Boldest upper cantilever!
    beamSpacing: 4,
    embedDepth: 16,
    withSupportPosts: false,
    withAngledBraces: true,
  });

  const s3 = buildHallStory(grid, {
    z0: z0 + 2,
    z1: z1 - 2,
    deckY: y3,
    height: 12,
    backX: -5,
    wallX: 8,
    colX: 13,
    bays: 3,
    hasBalustrade: true,
    openCenterDoor: true, // Wide-open central bay revealing the Three Teachings gilded altar!
    plaqueTitle: true,    // 「三教殿」 plaque!
    lanterns: true,
  });

  // Populate the sacred Three Teachings Statues (`释迦牟尼 · 孔子 · 老子`) inside!
  buildThreeTeachingsStatues(grid, 1, y3, midZ);

  // Grand Imperial-Glazed Hipped-Gable Crown Roof (`重檐歇山黄绿琉璃剪边顶`)!
  buildClassicalRoof(grid, {
    x0: -5,
    x1: 13,
    z0: z0 + 2,
    z1: z1 - 2,
    baseY: s3.topY,
    ridgeHeight: 10,
    eaveOverhang: 4,
    style: 'xieshan',
    ridgeGlaze: MAT.GLAZE_YELLOW_1,
    trimGlaze: MAT.GLAZE_GREEN_1,
  });

  anchors.threeTeachings = { x: 11, y: y3 + 6, z: midZ };
  anchors.mechanicsFocus = { x: 4, y: 112, z: 24 };
}

function buildConnectingStairsAndLife(grid, anchors) {
  // 1. Exterior covered timber stairway linking South Courtyard (Z=-24, Y=86) up to South Pavilion Floor 1 (Z=-21, Y=98)
  for (let i = 0; i <= 12; i++) {
    const sy = 86 + i;
    const sz = -25 + Math.floor(i * 0.35);
    for (let x = 8; x <= 11; x++) {
      grid.set(x, sy, sz, MAT.PLANK_DECK_WOOD);
      grid.set(x, sy - 1, sz, MAT.TIMBER_DARK_ELM);
    }
    grid.set(11, sy + 1, sz, MAT.LACQUER_RED_RAIL);
    grid.set(11, sy + 2, sz, MAT.LACQUER_RED_RAIL);
  }

  // 2. Monk & Pilgrim figures inside the temple walkways to bring living narrative & human scale!
  // Saffron-robed monk standing on the Upper Sky Walkway gazing across Jinlong Gorge
  buildVoxelPerson(grid, 9, 125, 20, MAT.MONK_ROBE_SAFFRON, false);
  // Senior abbot monk beside the courtyard incense cauldron
  buildVoxelPerson(grid, 10, 87, -42, MAT.MONK_ROBE_SAFFRON, false);
  // Pilgrim bowing on the veranda outside the Hall of Three Teachings
  buildVoxelPerson(grid, 11, 139, 52, MAT.MONK_ROBE_GREY, false);
}
