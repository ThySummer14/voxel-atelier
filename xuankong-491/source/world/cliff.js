// Jinlong Gorge (金龙峡翠屏峰) Cliff & River Valley Generator
// Captures the real geological features of Mount Heng's Hanging Temple:
// 1. Massive vertical ochre-red dolomite cliff with horizontal sedimentary bedding & vertical fractures
// 2. Natural concave recess (腹地凹槽) sheltering the temple from wind
// 3. Dramatic overhanging stone canopy (上凸如伞盖) above Y=182 protecting the wooden halls from rain & rockfall
// 4. Supporting lower rock ledges (下托岩台) where slender vertical timber posts bear load
// 5. Deep emerald Tangyu River (唐峪河) gorge floor, ancient arched stone bridge, cliff pines, and Li Bai's "壮观" boulder!

import { MAT } from '../core/palette.js';
import { fbm2, fbm3, noise2, noise3, hash2, hash3, clamp } from '../core/noise.js';

/**
 * Computes the cliff front surface X coordinate at a given (y, z).
 * Temple faces +X (East), backed into the cliff on -X (West).
 */
export function getCliffSurfaceX(y, z) {
  // Base vertical cliff plane around X = 0
  let x = 0;

  // 1. North & South flanking rocky buttresses (两边突岩环抱)
  // Temple spans roughly Z in [-86, +88]. Outside that, dramatic flanking spurs jut forward (+X)
  const southButtress = clamp((-72 - z) / 48, 0, 1.35);
  const northButtress = clamp((z - 76) / 46, 0, 1.40);
  x += Math.pow(southButtress, 1.65) * 26;
  x += Math.pow(northButtress, 1.65) * 28;

  // 2. Natural concave amphitheater recess in the temple zone (Y in [76, 178], Z in [-75, +78])
  const zInTemple = 1 - clamp(Math.abs(z - 4) / 88, 0, 1);
  const yInPocket = Math.exp(-Math.pow(Math.abs(y - 134) / 46, 2.2));
  x -= zInTemple * yInPocket * 11.5;

  // 3. Famous Overhanging Canopy Cliff ("上凸如伞盖") above Y = 174..242!
  // Juts boldly outward (+X by 18..26 voxels = 4.5..6.5 meters!) over the entire temple!
  if (y > 166) {
    const tOver = clamp((y - 166) / 44, 0, 1);
    const canopyBell = Math.sin(tOver * Math.PI * 0.68);
    x += canopyBell * (21 + 5 * zInTemple);
    // Slight stepped summit recession near very top Y > 228 for natural mountain crest silhouette
    if (y > 224) {
      x -= Math.pow((y - 224) / 34, 1.4) * 18;
    }
  }

  // 4. Stepped lower rock ledges ("巧借岩石暗托") between Y = 38 and Y = 95
  // Creates natural shelves at Y~58, Y~74, Y~88 where vertical support posts & South Gate sit
  if (y < 96) {
    const baseSlope = clamp((96 - y) / 96, 0, 1);
    x += Math.pow(baseSlope, 1.45) * 22;
    // South approach natural rock terrace for the Mountain Gate & climbing steps (Z < -52, Y < 96)
    if (z < -46) {
      const gateShelf = clamp((-46 - z) / 38, 0, 1) * clamp((102 - y) / 42, 0, 1);
      x += gateShelf * 16;
    }
  }

  // 5. Realistic Hengshan sedimentary strata ledges (horizontal bedding planes + vertical jointing)
  const strataWave =
    Math.sin(y * 0.23 + noise2(z * 0.04, y * 0.02, 101) * 2.2) * 1.65 +
    Math.sin(y * 0.61 + 1.1) * 0.75;

  // Vertical tectonic joint / fissure crevices (刀削绝壁竖向裂隙)
  const vJoint = Math.abs(noise2(z * 0.085, y * 0.012, 211));
  const creviceCut = vJoint < 0.09 ? -(0.09 - vJoint) * 38 : 0;

  // Bold blocky rock facets
  const crag = fbm3(z * 0.045, y * 0.045, 0.5, 3, 307) * 4.8;

  return x + strataWave + creviceCut + crag;
}

/**
 * Picks sedimentary cliff material based on height, strata, crevice depth, and exposure.
 */
function pickCliffMaterial(x, y, z, surfX) {
  const depthFromFace = surfX - x;

  // Outside the temple X-Ray inspection pocket, deep interior rock stays in CLIFF_CORE.
  // Inside the temple X-Ray pocket (y in [70..162], z in [-76..74], x >= -28), assign deep rock to CLIFF_DARK_SLATE (CLIFF_OUTER group)
  // so when X-Ray fades CLIFF_OUTER to 8% blueprint glass, ONLY the chiselled `SOCKET_WALL_STONE` sleeves,
  // deeply embedded Hemlock beams, and golden Oak expansion wedges float visibly inside the translucent cliff!!
  if (depthFromFace > 4.5) {
    if (y >= 70 && y <= 162 && z >= -76 && z <= 74 && x >= -26) {
      return MAT.CLIFF_DARK_SLATE;
    }
    return ((y + x + z) & 3) === 0 ? MAT.BEDROCK_DEEP_2 : MAT.BEDROCK_DEEP_1;
  }

  // Sedimentary bedding bands (tilted slightly north-south like real Hengshan strata)
  const tiltedY = y + z * 0.055 + fbm2(z * 0.03, y * 0.03, 3, 509) * 5.5;
  const band = ((Math.floor(tiltedY) % 19) + 19) % 19;

  // Deep vertical fissure shadow
  const vJoint = Math.abs(noise2(z * 0.085, y * 0.012, 211));
  if (vJoint < 0.065 && depthFromFace < 2.5) {
    return MAT.CLIFF_SHADOW_CREVICE;
  }

  // Wet rock near river level
  if (y <= 15) {
    return y <= 12 ? MAT.RIVER_WET_ROCK : MAT.CLIFF_DARK_SLATE;
  }

  // Moss / lichen on upward-facing ledges
  if (band === 0 || band === 9) return MAT.CLIFF_DARK_SLATE;
  if (band >= 1 && band <= 3) return MAT.CLIFF_RUST_1;
  if (band === 4) return MAT.CLIFF_RUST_2;
  if (band >= 5 && band <= 7) return MAT.CLIFF_OCHRE_1;
  if (band === 8) return MAT.CLIFF_SAND_1;
  if (band >= 10 && band <= 12) return MAT.CLIFF_OCHRE_2;
  if (band >= 13 && band <= 14) return MAT.CLIFF_OCHRE_3;
  if (band === 15) return MAT.CLIFF_SAND_2;
  if (band === 16) return MAT.CLIFF_WEATHERED_GREY;

  const n = hash3(x, y, z, 613);
  return n > 0.5 ? MAT.CLIFF_OCHRE_1 : MAT.CLIFF_OCHRE_2;
}

// Crisp 11x11 bitmap glyphs for Tang poet Li Bai's iconic cliffside calligraphy 「壮观」
// Authentic Hengshan legend: 「壮」 has an extra expressive dot on the upper-right (壮 with extra dot = "More magnificent than magnificent")!
const GLYPH_ZHUANG = [
  '...#....#..',
  '...#....#.#',
  '.###....#..',
  '...#.######',
  '...#....#..',
  '..##....#..',
  '.#.#....#..',
  '...#....#..',
  '...#.######',
  '...#.......',
  '...........',
];

const GLYPH_GUAN = [
  '.....#.###.',
  '#####..#.#.',
  '.#..#..#.#.',
  '.#..#..#.#.',
  '..##...#.#.',
  '.#..#..###.',
  '#...#...#..',
  '....#..#.#.',
  '...#..#..##',
  '...........',
  '...........',
];

export function buildCliffAndValley(grid, anchors) {
  const { minX, maxX, minY, maxY, minZ, maxZ } = grid;

  // Diorama cutaway sculptural silhouette:
  // Rather than a flat rectangular brick wall at the edges, give the diorama an artistic chiselled geological specimen silhouette!
  const zEdgeMargin = (z) => {
    const dSouth = z - (minZ + 4);
    const dNorth = (maxZ - 5) - z;
    return Math.min(dSouth, dNorth);
  };

  // 1. Main Western Cliff Massif & Valley Floor Bedrock — CONTINUOUS from Y=0 river bedrock all the way to Y=248 summit!
  for (let z = minZ + 6; z <= maxZ - 7; z++) {
    // Sculpted natural geological taper at North & South diorama ends so the cliff looks like a museum rock monolith
    const distFromEnd = Math.min(z - (minZ + 6), (maxZ - 7) - z);
    const endTaper = distFromEnd < 14 ? (14 - distFromEnd) * 1.4 : 0;

    // Max crest height of the mountain along Z (rises majestically to Y=248 over the north temple!)
    const crestY = Math.floor(
      236 +
      Math.sin((z + 30) * 0.022) * 10 +
      fbm2(z * 0.04, 3.1, 3, 919) * 8 -
      endTaper * 1.8
    );

    const backX = minX + 6;

    for (let y = minY; y <= Math.min(maxY - 4, crestY); y++) {
      let surfX = Math.round(getCliffSurfaceX(y, z) - endTaper * 0.9);

      // Sculptural taper at very top crest
      if (y > crestY - 10) {
        surfX -= Math.round((10 - (crestY - y)) * 1.25);
      }

      const xEnd = Math.min(maxX - 10, surfX);
      if (xEnd < backX) continue;

      for (let x = backX; x <= xEnd; x++) {
        const depth = xEnd - x;
        const onCutawayBoundary =
          x <= backX + 1 ||
          z <= minZ + 7 ||
          z >= maxZ - 8 ||
          y <= minY + 2;

        // Solid outer shell 24 voxels thick (6m deep — fully encloses all 4m-deep beam sockets!) + watertight museum cutaway walls!
        if (depth <= 24 || onCutawayBoundary) {
          const mat = onCutawayBoundary && depth > 5
            ? MAT.BEDROCK_DEEP_2
            : pickCliffMaterial(x, y, z, xEnd);
          grid.set(x, y, z, mat);
        }
      }

      // Add moss/lichen patches on flat upward cliff ledges
      if (y > 22 && y < crestY - 3) {
        const nextSurfX = Math.round(getCliffSurfaceX(y + 1, z) - endTaper * 0.9);
        if (xEnd > nextSurfX + 1) {
          for (let lx = Math.max(backX, nextSurfX + 1); lx <= xEnd; lx++) {
            const h = hash3(lx, y, z, 733);
            if (h < 0.42) {
              grid.set(lx, y + 1, z, MAT.CLIFF_LICHEN_MOSS);
            }
          }
        }
      }
    }
  }

  // 2. Valley Floor, Tangyu River Channel (碧涧深潭), & Eastern Gorge Bank
  // Water surface sits at Y = 9.75. Ensure seamless fusion with Western Cliff from X = minX+6 to maxX-7!
  for (let z = minZ + 6; z <= maxZ - 7; z++) {
    const riverCenterX = 48 + Math.sin(z * 0.032 + 0.5) * 8 + noise2(z * 0.05, 2.3, 401) * 4;
    const riverHalfW = 15 + Math.sin(z * 0.045) * 3.5;

    for (let x = minX + 6; x <= maxX - 7; x++) {
      const distRiver = Math.abs(x - riverCenterX);
      let bedY;

      if (distRiver < riverHalfW) {
        // Smooth concave riverbed
        const t = distRiver / riverHalfW;
        bedY = Math.round(3.5 + Math.pow(t, 1.8) * 6.5 + noise2(x * 0.14, z * 0.14, 433) * 1.1);
      } else if (x > riverCenterX + riverHalfW) {
        // Low gentle pebbled eastern river terrace so it NEVER blocks low-angle river or bridge camera views!
        const bankDist = x - (riverCenterX + riverHalfW);
        bedY = Math.round(
          10 +
          clamp(bankDist * 0.22, 0, 5.5) +
          fbm2(x * 0.07, z * 0.07, 3, 457) * 1.4
        );
      } else {
        // Western rocky talus shore at foot of cliff
        const shoreDist = (riverCenterX - riverHalfW) - x;
        bedY = Math.round(10 + shoreDist * 0.36 + fbm2(x * 0.09, z * 0.09, 2, 479) * 2.0);
      }

      bedY = clamp(bedY, 2, 42);
      for (let y = minY; y <= bedY; y++) {
        if (grid.get(x, y, z) !== 0) continue;
        let mat = MAT.RIVER_STONE_1;
        if (y <= 3) mat = MAT.BEDROCK_DEEP_1;
        else if (y <= 10) {
          const r = hash3(x, y, z, 521);
          mat = r < 0.45 ? MAT.RIVER_WET_ROCK : r < 0.78 ? MAT.RIVER_STONE_2 : MAT.RIVER_STONE_1;
        } else {
          const r = hash3(x, y, z, 541);
          if (y === bedY && r < 0.22 && distRiver < riverHalfW + 10) mat = MAT.RIVER_MOSS;
          else if (y > 18) mat = pickCliffMaterial(x, y, z, bedY + 2);
          else mat = r < 0.5 ? MAT.RIVER_STONE_1 : MAT.RIVER_STONE_2;
        }
        grid.set(x, y, z, mat);
      }
    }
  }

  // 3. Giant Iconic Boulder at Cliff Foot Inscribed with Li Bai's 「壮观」 (Z = -18..+2, X = 18..30, Y = 9..28)
  buildZhuangGuanBoulder(grid, 23, 10, -8);
  anchors.stele = { x: 26, y: 19, z: -8 };

  // 4. Ancient Single-Arch Stone Bridge Across Tangyu River (浑源古道石拱桥, around Z = -62)
  buildAncientStoneBridge(grid, 48, 10, -64);
  anchors.bridge = { x: 48, y: 18, z: -64 };

  // 5. Mountain Climbing Stone Steps from River Shore up to the South Temple Gate (登云石阶)
  buildSouthClimbingSteps(grid, anchors);

  // 6. Gnarled Cliffside Hengshan Pines (苍松探海) clinging to crags & summit canopy
  const pineSpots = [
    { x: 16, y: 198, z: -56, scale: 1.15, leanX: 1, leanZ: 0.3 },
    { x: 22, y: 214, z: 12, scale: 1.35, leanX: 1.2, leanZ: -0.2 },
    { x: 18, y: 204, z: 68, scale: 1.25, leanX: 1.1, leanZ: -0.3 },
    { x: 26, y: 148, z: 96, scale: 1.05, leanX: 1.0, leanZ: -0.4 },
    { x: 28, y: 124, z: -96, scale: 1.0, leanX: 0.9, leanZ: 0.3 },
    { x: 82, y: 16, z: 68, scale: 1.1, leanX: -0.5, leanZ: -0.2 },
    { x: 82, y: 15, z: -92, scale: 1.05, leanX: -0.5, leanZ: 0.2 },
  ];
  for (const p of pineSpots) {
    // Snap pine root X to solid rock
    let rx = p.x;
    while (rx > -20 && grid.get(rx, p.y - 1, p.z) === 0) rx--;
    buildCliffPine(grid, rx, p.y, p.z, p.scale, p.leanX, p.leanZ);
  }

  // Wild golden & crimson cliff shrubs in rock crevices for warm autumn/mountain color accents
  for (let i = 0; i < 42; i++) {
    const sz = Math.round(-112 + hash2(i, 17, 901) * 224);
    const sy = Math.round(24 + hash2(i, 31, 901) * 195);
    // Skip temple core zone so shrubs never block buildings
    if (sz > -76 && sz < 82 && sy > 72 && sy < 186) continue;
    const sx = Math.round(getCliffSurfaceX(sy, sz));
    if (grid.get(sx, sy, sz) !== 0 && grid.get(sx + 1, sy, sz) === 0) {
      const mat = (i % 3 === 0) ? MAT.AUTUMN_SHRUB_RED : (i % 3 === 1) ? MAT.AUTUMN_SHRUB_GOLD : MAT.PINE_NEEDLE_2;
      buildCliffShrub(grid, sx + 1, sy, sz, mat, 2 + (i % 3));
    }
  }

  // 7. Tiny Stylized Voxel Monks & Scholar Travelers on Bridge & Valley Trail (gives breathtaking scale!)
  buildVoxelPerson(grid, 46, 19, -65, MAT.MONK_ROBE_SAFFRON, false); // Monk on bridge gazing up at temple
  buildVoxelPerson(grid, 50, 19, -62, MAT.MONK_ROBE_GREY, true);     // Bamboo-hatted traveler beside him
  buildVoxelPerson(grid, 33, 12, -10, MAT.MONK_ROBE_GREY, false);    // Scholar admiring Li Bai's 「壮观」 boulder
}

function buildZhuangGuanBoulder(grid, cx, baseY, cz) {
  // Sculpted monumental cream-ochre weathered boulder at river's edge
  for (let y = baseY - 3; y <= baseY + 25; y++) {
    for (let z = cz - 10; z <= cz + 10; z++) {
      for (let x = cx - 7; x <= cx + 6; x++) {
        const nx = (x - cx) / 6.8;
        const ny = (y - (baseY + 11)) / 13.8;
        const nz = (z - cz) / 9.8;
        const d = nx * nx + ny * ny + nz * nz + fbm3(x * 0.18, y * 0.18, z * 0.18, 2, 701) * 0.20;
        if (d <= 1.0) {
          if (x <= cx + 4) {
            const mat = (x === cx + 4 && y >= baseY + 2 && y <= baseY + 23 && Math.abs(z - cz) <= 6)
              ? MAT.WALL_AGED_CREAM
              : (y < baseY + 2 ? MAT.RIVER_WET_ROCK : MAT.CLIFF_SAND_1);
            grid.set(x, y, z, mat);
          }
        }
      }
    }
  }

  // Carve & paint vertical cinnabar-red 「壮观」 characters on the flat East (+X) stele face (x = cx + 4)
  // Looking from +X (East) toward -X (West), screen LEFT is +Z (North) and screen RIGHT is -Z (South)!
  // So column 0 -> colMax MUST step from +Z toward -Z (`gz = leftZ - col`)!
  const faceX = cx + 4;
  for (let y = baseY + 2; y <= baseY + 23; y++) {
    for (let z = cz - 6; z <= cz + 6; z++) {
      grid.set(faceX, y, z, MAT.WALL_AGED_CREAM);
      grid.set(faceX + 1, y, z, 0);
    }
  }

  const stampGlyph = (glyph, topY, leftZ) => {
    for (let row = 0; row < glyph.length; row++) {
      const line = glyph[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] === '#') {
          const gy = topY - row;
          const gz = leftZ - col;
          grid.set(faceX, gy, gz, MAT.STELE_CINNABAR_INK);
        }
      }
    }
  };

  // Top character: 壮, Bottom character: 观
  stampGlyph(GLYPH_ZHUANG, baseY + 22, cz + 5);
  stampGlyph(GLYPH_GUAN, baseY + 11, cz + 5);
}

function buildAncientStoneBridge(grid, centerX, waterY, centerZ) {
  // Classic single-arch Shanxi stone bridge spanning X = [30 .. 66], width Z = [centerZ - 4 .. centerZ + 4]
  const spanHalf = 18;
  const archRise = 7.5;

  for (let dx = -spanHalf - 4; dx <= spanHalf + 4; dx++) {
    const x = centerX + dx;
    const u = clamp(dx / spanHalf, -1, 1);

    // Parabolic arch underside & gentle camelback deck
    const archBottomY = Math.abs(dx) <= spanHalf
      ? waterY + Math.round((1 - u * u) * archRise)
      : waterY - 3;
    const deckY = waterY + 3 + Math.round((1 - Math.min(1, (dx / (spanHalf + 3)) ** 2)) * 5.5);

    for (let dz = -4; dz <= 4; dz++) {
      const z = centerZ + dz;
      // Clear water channel under arch
      for (let y = waterY - 2; y < archBottomY; y++) {
        if (Math.abs(dx) < spanHalf - 2) {
          grid.set(x, y, z, y <= waterY - 2 ? MAT.RIVER_WET_ROCK : 0);
        }
      }

      // Solid stone arch ring & spandrel masonry
      for (let y = archBottomY; y <= deckY; y++) {
        const isArchRing = y === archBottomY || Math.abs(dz) === 4;
        const mat = isArchRing
          ? (((dx + y) & 1) ? MAT.BRIDGE_STONE_1 : MAT.STONE_SUMERU_BASE)
          : MAT.BRIDGE_STONE_2;
        grid.set(x, y, z, mat);
      }

      // Carved stonebridge parapet & lotus posts along dz = -4 and dz = +4
      if (Math.abs(dz) === 4 && Math.abs(dx) <= spanHalf + 2) {
        grid.set(x, deckY + 1, z, MAT.BRIDGE_STONE_1);
        if (dx === 0 || Math.abs(dx) === 12) {
          // Classical Tang/Wei Stone Lantern Pillar (`古桥石经幢灯`) illuminating the stone arch at dusk & night!
          grid.set(x, deckY + 2, z, MAT.STONE_SUMERU_BASE);
          grid.set(x, deckY + 3, z, MAT.LANTERN_CORE_GOLD);
          grid.set(x, deckY + 4, z, MAT.STONE_SUMERU_BASE);
        } else if (dx % 6 === 0) {
          grid.set(x, deckY + 2, z, MAT.STONE_SUMERU_BASE);
        }
      }
    }
  }
}

function buildSouthClimbingSteps(grid, anchors) {
  // Winding stone staircase carved into the southern cliff buttress leading from Z=-88, Y=16 up to South Gate at Z=-70, Y=78
  const waypoints = [
    { x: 29, y: 14, z: -76 },
    { x: 26, y: 28, z: -88 },
    { x: 22, y: 44, z: -92 },
    { x: 18, y: 60, z: -84 },
    { x: 15, y: 78, z: -70 }, // Arrives at South Gate terrace!
  ];

  anchors.southGateBase = { x: 14, y: 78, z: -68 };

  for (let s = 0; s < waypoints.length - 1; s++) {
    const a = waypoints[s];
    const b = waypoints[s + 1];
    const steps = Math.max(Math.abs(b.y - a.y), Math.abs(b.z - a.z));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const sx = Math.round(a.x + (b.x - a.x) * t);
      const sy = Math.round(a.y + (b.y - a.y) * t);
      const sz = Math.round(a.z + (b.z - a.z) * t);

      // Step tread + solid stone foundation underneath back into cliff
      for (let w = -2; w <= 2; w++) {
        for (let dy = -6; dy <= 0; dy++) {
          const mat = dy === 0 ? MAT.STONE_STEPS : MAT.WALL_GREY_BRICK_2;
          grid.set(sx + (w < 0 ? w : 0), sy + dy, sz + (w > 0 ? 1 : 0), mat);
        }
        // Clear headroom above stairs
        for (let hy = 1; hy <= 8; hy++) {
          grid.set(sx + 1, sy + hy, sz, 0);
          grid.set(sx + 2, sy + hy, sz, 0);
        }
      }
      // Outer low stone parapet
      grid.set(sx + 1, sy + 1, sz, MAT.STONE_SUMERU_BASE);
      if (i % 4 === 0) {
        grid.set(sx + 1, sy + 2, sz, MAT.LACQUER_RED_RAIL);
      }
    }
  }
}

function buildCliffPine(grid, rx, ry, rz, scale = 1.0, leanX = 1.0, leanZ = 0.0) {
  // Twisted ancient cliff pine ("迎客奇松") reaching horizontally out over the abyss
  const len = Math.round(14 * scale);
  let tipX = rx;
  let tipY = ry;
  let tipZ = rz;

  for (let i = 0; i <= len; i++) {
    const t = i / len;
    const cx = Math.round(rx + leanX * i * 0.85 + Math.sin(t * 3.1) * 1.5);
    const cy = Math.round(ry + i * 0.48 + Math.cos(t * 2.4) * 1.2);
    const cz = Math.round(rz + leanZ * i * 0.8 + Math.sin(t * 4.0) * 1.2);
    tipX = cx;
    tipY = cy;
    tipZ = cz;

    const thick = t < 0.4 ? 1 : 0;
    for (let ox = -thick; ox <= thick; ox++) {
      for (let oy = -thick; oy <= thick; oy++) {
        for (let oz = -thick; oz <= thick; oz++) {
          if (Math.abs(ox) + Math.abs(oy) + Math.abs(oz) <= thick + 1) {
            grid.set(cx + ox, cy + oy, cz + oz, ((i + oy) & 1) ? MAT.PINE_BARK_1 : MAT.PINE_BARK_2);
          }
        }
      }
    }
  }

  // Layered flat horizontal cloud-like needle pads (经典中式古松平顶云片冠)
  const pads = [
    { dx: 0, dy: 2, dz: 0, rx: 6.5 * scale, ry: 2.0, rz: 6.0 * scale },
    { dx: Math.round(leanX * 4), dy: 0, dz: 3, rx: 5.2 * scale, ry: 1.8, rz: 4.8 * scale },
    { dx: Math.round(leanX * 3), dy: -2, dz: -4, rx: 4.8 * scale, ry: 1.7, rz: 4.5 * scale },
    { dx: Math.round(-leanX * 2), dy: 4, dz: -1, rx: 4.5 * scale, ry: 1.8, rz: 4.5 * scale },
  ];

  for (const pad of pads) {
    const px = tipX + pad.dx;
    const py = tipY + pad.dy;
    const pz = tipZ + pad.dz;
    // Branch connection
    grid.line(tipX, tipY, tipZ, px, py, pz, MAT.PINE_BARK_1, 0);

    const irx = Math.ceil(pad.rx);
    const iry = Math.ceil(pad.ry);
    const irz = Math.ceil(pad.rz);
    for (let ox = -irx; ox <= irx; ox++) {
      for (let oy = -iry; oy <= iry; oy++) {
        for (let oz = -irz; oz <= irz; oz++) {
          const d = (ox / pad.rx) ** 2 + (oy / pad.ry) ** 2 + (oz / pad.rz) ** 2;
          const n = hash3(px + ox, py + oy, pz + oz, 977);
          if (d + n * 0.28 <= 1.0) {
            const mat = oy > 0 ? MAT.PINE_NEEDLE_2 : oy < 0 ? MAT.PINE_NEEDLE_3 : MAT.PINE_NEEDLE_1;
            grid.setIfAir(px + ox, py + oy, pz + oz, mat);
          }
        }
      }
    }
  }
}

function buildCliffShrub(grid, cx, cy, cz, mat, r = 2) {
  for (let ox = -r; ox <= r; ox++) {
    for (let oy = -r; oy <= r; oy++) {
      for (let oz = -r; oz <= r; oz++) {
        if (ox * ox + oy * oy + oz * oz <= r * r + 1) {
          if (hash3(cx + ox, cy + oy, cz + oz, 883) > 0.35) {
            grid.setIfAir(cx + ox, cy + oy, cz + oz, mat);
          }
        }
      }
    }
  }
}

export function buildVoxelPerson(grid, x, y, z, robeMat = MAT.MONK_ROBE_SAFFRON, withHat = false) {
  // Flowing Tang/Wei dynasty monk or scholar figure (natural robe drape, never a T-pose silhouette!)
  grid.set(x, y, z, MAT.TIMBER_DARK_ELM);       // Boots / Sandals
  for (let dy = 1; dy <= 3; dy++) {
    grid.set(x, y + dy, z, robeMat);
    if (dy <= 2) {
      grid.set(x, y + dy, z - 1, robeMat);      // Flowing wide robe hem & clasped sleeves
    }
  }
  grid.set(x, y + 4, z, MAT.SKIN_WARM);         // Head

  if (withHat) {
    // Low wide bamboo rain-hat (`竹斗笠`)
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        if (Math.abs(ox) + Math.abs(oz) <= 1) {
          grid.set(x + ox, y + 5, z + oz, MAT.BAMBOO_HAT);
        }
      }
    }
  } else {
    grid.set(x, y + 5, z, robeMat === MAT.MONK_ROBE_SAFFRON ? MAT.SKIN_WARM : MAT.TIMBER_DARK_ELM);
  }
}
