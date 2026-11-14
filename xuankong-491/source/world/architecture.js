// Classical Northern Wei / Ming-Qing Chinese Timber Architecture Primitives for Hanging Temple
// 1 voxel = 0.25m (25 cm). Every structural joint has authentic Chinese carpentry logic:
// - Deeply embedded Hemlock Cantilever Beams (半插飞梁: 2/3 embedded into drilled rock socket + golden oak expansion wedge!)
// - Slender Vertical Support Posts (立木支承柱: resting on lower rock mortise plinths + angled diagonal braces 雀替/斜撑)
// - Carved Balustrades (寻杖栏杆, 蜀柱, 华板)
// - Polychrome Dougong Bracket Sets (斗拱青绿彩画)
// - Swept Flying Eaves & Hipped-Gable Roofs (歇山顶 / 悬山顶 / 十字歇山顶, 灰筒瓦绿琉璃剪边黄琉璃正脊鸱吻, 白粉飞椽头)
// - Sacred Statues (三教同堂: Sakyamuni Buddha, Confucius, Laozi), Cast Bronze Bell, Leather Drum, Lanterns & Plaques

import { MAT } from '../core/palette.js';
import { getCliffSurfaceX, buildVoxelPerson } from './cliff.js';

/**
 * Installs a row of deeply embedded Hemlock cantilever beams ("铁杉飞梁") along Z,
 * drilling stone sockets 14–16 voxels (3.5–4.0 meters!) deep into the cliff behind `cliffX`,
 * hammering an expansion oak wedge (`OAK_WEDGE_GOLD`) at the inner socket end,
 * and cantilevering outward to `outerX` with timber deck planks on top!
 */
export function buildCantileverBeamDeck(grid, {
  z0,
  z1,
  deckY,
  outerX,
  beamSpacing = 4,
  embedDepth = 15,
  withSupportPosts = false,
  postSpacing = 8,
  withAngledBraces = true,
}) {
  const beamY = deckY - 1;

  // 1. Carve clean grotto / clearance above deck back to cliff face socliff rock never pokes into rooms
  for (let z = z0; z <= z1; z++) {
    const surfX = Math.round(getCliffSurfaceX(deckY + 2, z));
    const backWallX = Math.min(surfX, outerX - 7);
    // Lay continuous heavy timber plank deck from backWallX to outerX
    for (let x = backWallX; x <= outerX; x++) {
      grid.set(x, deckY, z, MAT.PLANK_DECK_WOOD);
    }
    // Outer rim trim fascia beam
    grid.set(outerX, beamY, z, MAT.TIMBER_DARK_ELM);
  }

  // 2. Install main hemlock cantilever beams every `beamSpacing` voxels along Z
  const beamZs = [];
  for (let z = z0 + 1; z <= z1 - 1; z += beamSpacing) {
    beamZs.push(z);
  }
  if (beamZs[beamZs.length - 1] !== z1 - 1 && z1 - z0 >= 4) {
    beamZs.push(z1 - 1);
  }

  for (const bz of beamZs) {
    const surfX = Math.round(getCliffSurfaceX(beamY, bz));
    const cliffEntryX = Math.min(surfX, outerX - 5);
    const innerTipX = cliffEntryX - embedDepth;

    // Carve architectural cutaway rock socket (`半剖石孔槽`: top, bottom & inner end-cap in SOCKET_WALL_STONE,
    // leaving side walls open to X-Ray view so viewers can see the embedded Hemlock beam & Golden Oak Wedge inside the socket!)
    for (let x = innerTipX - 1; x <= cliffEntryX; x++) {
      grid.set(x, beamY + 1, bz, MAT.SOCKET_WALL_STONE);
      grid.set(x, beamY - 2, bz, MAT.SOCKET_WALL_STONE);
      if (x === innerTipX - 1) {
        grid.set(x, beamY, bz, MAT.SOCKET_WALL_STONE);
        grid.set(x, beamY - 1, bz, MAT.SOCKET_WALL_STONE);
      }
    }

    // Fill the 2-voxel-tall sturdy hemlock beam (`HEMLOCK_BEAM_MAIN`) from innerTipX out to outerX + 1!
    for (let x = innerTipX; x <= outerX + 1; x++) {
      grid.set(x, beamY, bz, MAT.HEMLOCK_BEAM_MAIN);
      grid.set(x, beamY - 1, bz, MAT.HEMLOCK_BEAM_MAIN);
    }

    // Cut wood grain end-cap on the exposed outer tip!
    grid.set(outerX + 1, beamY, bz, MAT.HEMLOCK_BEAM_END);
    grid.set(outerX + 1, beamY - 1, bz, MAT.HEMLOCK_BEAM_END);

    // Wrought-iron reinforcement collar at cliff exit mouth
    grid.set(cliffEntryX + 1, beamY - 1, bz, MAT.IRON_TIE_RING);

    // Iconic Expansion Oak Wedge (`OAK_WEDGE_GOLD`) hammered into the inner tip of the beam inside the rock socket!
    grid.set(innerTipX, beamY, bz, MAT.OAK_WEDGE_GOLD);
    grid.set(innerTipX + 1, beamY, bz, MAT.OAK_WEDGE_GOLD);
    grid.set(innerTipX + 2, beamY - 1, bz, MAT.OAK_WEDGE_GOLD);

    // Diagonal wooden corbel brace (`斜撑`) from cliff face up to underside of cantilevered beam
    if (withAngledBraces && outerX - cliffEntryX >= 5) {
      const braceSpan = Math.min(6, outerX - cliffEntryX - 1);
      for (let i = 1; i <= braceSpan; i++) {
        grid.set(cliffEntryX + i, beamY - 1 - (braceSpan - i), bz, MAT.CORBEL_BRACE_WOOD);
      }
    }
  }

  // 3. Slender Vertical Timber Support Posts ("立木支承柱") dropping down to lower cliff rock ledges!
  if (withSupportPosts) {
    for (let pz = z0 + 2; pz <= z1 - 2; pz += postSpacing) {
      // Place 1 or 2 ranks of slender vertical posts under the outer cantilever
      const postXs = [outerX - 1];
      if (outerX >= 10) postXs.push(outerX - 5);

      for (const px of postXs) {
        // Trace downward until hitting solid cliff rock or lower building roof/deck (max drop 54 voxels = 13.5m!)
        let hitY = -1;
        for (let y = beamY - 2; y >= Math.max(16, beamY - 56); y--) {
          const m = grid.get(px, y, pz);
          if (m !== 0) {
            hitY = y;
            break;
          }
          // Check if cliff juts out right next to px at this Y; if within 3 voxels, build a small rock ledge step to catch the post!
          const sX = Math.round(getCliffSurfaceX(y, pz));
          if (sX >= px - 2 && beamY - y >= 14) {
            // Build natural rock shelf toe (`CLIFF_OCHRE_2` + stone plinth) to catch the post ("巧借岩石暗托")!
            for (let rx = sX; rx <= px + 1; rx++) {
              grid.set(rx, y, pz, MAT.CLIFF_OCHRE_2);
              grid.set(rx, y - 1, pz, MAT.CLIFF_RUST_1);
              grid.set(rx, y, pz - 1, MAT.CLIFF_OCHRE_2);
              grid.set(rx, y, pz + 1, MAT.CLIFF_OCHRE_2);
            }
            hitY = y;
            break;
          }
        }

        if (hitY > 0 && beamY - hitY >= 5) {
          // Carved stone plinth (`柱础`) sitting on the rock ledge or lower beam
          grid.set(px, hitY + 1, pz, MAT.SUPPORT_POST_BASE);
          // Slender vertical hemlock post up to beamY - 2
          for (let y = hitY + 2; y <= beamY - 2; y++) {
            grid.set(px, y, pz, MAT.SUPPORT_POST_WOOD);
          }
          // Transverse tie-bar (`穿枋`) stabilizing tall posts mid-way if taller than 18 voxels
          if (beamY - hitY >= 18) {
            const midY = Math.round((beamY + hitY) * 0.55);
            const cX = Math.round(getCliffSurfaceX(midY, pz));
            for (let tx = Math.max(px - 6, cX); tx <= px; tx++) {
              grid.setIfAir(tx, midY, pz, MAT.CORBEL_BRACE_WOOD);
            }
          }
        }
      }
    }
  }
}

/**
 * Builds ornate Chinese crimson wooden balustrade (`朱漆雕花勾栏`) along an edge.
 */
export function buildBalustradeZ(grid, x, deckY, z0, z1, withLanternEvery = 0) {
  for (let z = z0; z <= z1; z++) {
    // Bottom sill (`地栿`) + top handrail (`寻杖`)
    grid.set(x, deckY + 1, z, MAT.TIMBER_DARK_ELM);
    grid.set(x, deckY + 3, z, MAT.LACQUER_RED_RAIL);

    // Ornate middle lattice (`华板`) or vertical newel post (`望柱`)
    if (z === z0 || z === z1 || (z - z0) % 6 === 0) {
      grid.set(x, deckY + 2, z, MAT.LACQUER_RED_PILLAR);
      grid.set(x, deckY + 4, z, MAT.DOUGONG_GOLD); // Finial cap (`柱头`)
    } else if ((z - z0) % 2 === 0) {
      grid.set(x, deckY + 2, z, MAT.LACQUER_RED_RAIL);
    }

    if (withLanternEvery > 0 && z > z0 + 2 && z < z1 - 2 && (z - z0) % withLanternEvery === 0) {
      buildHangingLantern(grid, x + 1, deckY + 7, z);
    }
  }
}

export function buildBalustradeX(grid, z, deckY, x0, x1) {
  const ax = Math.min(x0, x1);
  const bx = Math.max(x0, x1);
  for (let x = ax; x <= bx; x++) {
    grid.set(x, deckY + 1, z, MAT.TIMBER_DARK_ELM);
    grid.set(x, deckY + 3, z, MAT.LACQUER_RED_RAIL);
    if (x === ax || x === bx || (x - ax) % 4 === 0) {
      grid.set(x, deckY + 2, z, MAT.LACQUER_RED_PILLAR);
      grid.set(x, deckY + 4, z, MAT.DOUGONG_GOLD);
    } else if ((x - ax) % 2 === 0) {
      grid.set(x, deckY + 2, z, MAT.LACQUER_RED_RAIL);
    }
  }
}

/**
 * Builds a traditional red silk temple lantern suspended below an eave or architrave.
 */
export function buildHangingLantern(grid, x, topY, z) {
  grid.set(x, topY, z, MAT.TIMBER_DARK_ELM);     // Cord
  grid.set(x, topY - 1, z, MAT.DOUGONG_GOLD);    // Brass cap
  grid.set(x, topY - 2, z, MAT.LANTERN_CORE_GOLD);
  // Silk lantern body
  grid.set(x + 1, topY - 2, z, MAT.LANTERN_RED_SILK);
  grid.set(x - 1, topY - 2, z, MAT.LANTERN_RED_SILK);
  grid.set(x, topY - 2, z + 1, MAT.LANTERN_RED_SILK);
  grid.set(x, topY - 2, z - 1, MAT.LANTERN_RED_SILK);
  grid.set(x, topY - 3, z, MAT.LANTERN_RED_SILK);
  grid.set(x, topY - 4, z, MAT.DOUGONG_GOLD);    // Bottom tassel ring
}

/**
 * Builds an inscribed traditional horizontal plaque (`匾额`) centered at (x, y, zCenter).
 */
export function buildPlaque(grid, x, y, zCenter, halfW = 4) {
  for (let dz = -halfW; dz <= halfW; dz++) {
    for (let dy = 0; dy <= 2; dy++) {
      const isFrame = Math.abs(dz) === halfW || dy === 0 || dy === 2;
      grid.set(x, y + dy, zCenter + dz, isFrame ? MAT.TIMBER_DARK_ELM : MAT.PLAQUE_BLACK_LACQUER);
    }
  }
  // Gold calligraphy character dots along middle row (dy = 1)
  for (let dz = -halfW + 2; dz <= halfW - 2; dz += 2) {
    grid.set(x, y + 1, zCenter + dz, MAT.PLAQUE_GOLD_INK);
  }
}

/**
 * Builds a complete multi-bay story of a cliffside Chinese hall (`殿阁层`),
 * with interior carved grotto wall, side masonry/plaster gable walls, crimson columns,
 * lattice doors & glowing rice-paper windows, polychrome architrave (`额枋彩画`), and Dougong brackets (`斗拱`)!
 */
export function buildHallStory(grid, {
  z0,
  z1,
  deckY,
  height = 10,
  backX,
  wallX,       // Front lattice wall X
  colX,        // Outer veranda column X (usually wallX + 3 for a walk-through veranda!)
  bays = 3,
  hasBalustrade = true,
  openCenterDoor = false,
  plaqueTitle = false,
  lanterns = true,
}) {
  const topY = deckY + height;

  // 1. Carve clean interior room & veranda air volume so overhanging/irregular rock never intrudes
  for (let y = deckY + 1; y <= topY; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = backX + 1; x <= colX + 1; x++) {
        grid.set(x, y, z, 0);
      }
    }
  }

  // 2. Back carved grotto wall (`石窟后壁`)
  for (let y = deckY + 1; y <= topY; y++) {
    for (let z = z0; z <= z1; z++) {
      grid.set(backX, y, z, MAT.GROTTO_CARVED_WALL);
    }
  }

  // 3. North & South side gable walls (`山墙`: grey temple brick base + white lime plaster upper)
  for (const sz of [z0, z1]) {
    for (let y = deckY + 1; y <= topY - 1; y++) {
      for (let x = backX + 1; x <= wallX; x++) {
        const mat = y <= deckY + 2
          ? (((x + y) & 1) ? MAT.WALL_GREY_BRICK_1 : MAT.WALL_GREY_BRICK_2)
          : (y === topY - 1 ? MAT.TIMBER_DARK_ELM : MAT.WALL_WHITE_PLASTER);
        grid.set(x, y, sz, mat);
      }
    }
  }

  // 4. Front Partition Wall (`槛墙` + `隔扇门窗` with warm glowing rice-paper lattice!)
  const zSpan = z1 - z0;
  const bayWidth = zSpan / bays;
  const colZs = [];
  for (let b = 0; b <= bays; b++) {
    colZs.push(Math.round(z0 + b * bayWidth));
  }

  for (let z = z0 + 1; z <= z1 - 1; z++) {
    const isCenterBay = Math.abs(z - (z0 + z1) * 0.5) <= bayWidth * 0.35;

    for (let y = deckY + 1; y <= topY - 2; y++) {
      if (openCenterDoor && isCenterBay && y <= deckY + 6) {
        // Open temple doorway showing golden statue / glowing altar inside!
        continue;
      }

      if (y <= deckY + 2) {
        // Lower wooden wainscot panel (`裙板`)
        grid.set(wallX, y, z, MAT.LACQUER_RED_DARK);
      } else if (y === topY - 2 || (z - z0) % 2 === 0) {
        // Cedar lattice mullions (`棂条`)
        grid.set(wallX, y, z, MAT.TIMBER_WARM_CEDAR);
      } else {
        // Warm glowing paper window (`窗纸` — glows softly by day, radiates warm amber at dusk/night!)
        grid.set(wallX, y, z, MAT.WINDOW_PAPER_WARM);
      }
    }
  }

  // 5. Crimson Lacquer Columns (`朱红檐柱` & `金柱`) along colZs
  for (const cz of colZs) {
    // Stone column base (`柱础`)
    grid.set(colX, deckY + 1, cz, MAT.STONE_SUMERU_BASE);
    grid.set(wallX, deckY + 1, cz, MAT.STONE_SUMERU_BASE);
    for (let y = deckY + 2; y <= topY - 1; y++) {
      grid.set(colX, y, cz, MAT.LACQUER_RED_PILLAR);
      grid.set(wallX, y, cz, MAT.LACQUER_RED_DARK);
    }
    // Tie beam (`穿插枋`) linking outer veranda column back to wall column
    for (let x = wallX; x <= colX; x++) {
      grid.set(x, topY - 2, cz, MAT.LACQUER_RED_DARK);
      grid.set(x, topY - 1, cz, MAT.DOUGONG_GREEN);
    }
  }

  // 6. Polychrome Architrave (`额枋` & `平板枋` 青绿彩画) & Dougong Bracket Sets (`斗拱`) along top of veranda!
  for (let z = z0; z <= z1; z++) {
    // Architrave beam with alternating azurite blue & mineral green painted motifs
    const paintMat = (z % 4 === 0)
      ? MAT.DOUGONG_GOLD
      : (z % 2 === 0 ? MAT.DOUGONG_GREEN : MAT.DOUGONG_BLUE);
    grid.set(colX, topY - 1, z, paintMat);
    grid.set(colX, topY, z, MAT.LACQUER_RED_PILLAR);

    // Ornate carved openwork hanger (`雀替`) flanking columns
    for (const cz of colZs) {
      if (Math.abs(z - cz) === 1) {
        grid.set(colX, topY - 2, z, MAT.DOUGONG_GREEN);
      }
    }
  }

  // Dougong Bracket Clusters (`斗拱出跳`) every half-bay along Z!
  const dgStep = Math.max(3, Math.round(bayWidth * 0.5));
  for (let z = z0; z <= z1; z += dgStep) {
    buildDougongCluster(grid, colX, topY, z);
  }
  // Ensure north & south corner Dougong brackets
  buildDougongCluster(grid, colX, topY, z0);
  buildDougongCluster(grid, colX, topY, z1);

  // 7. Outer Veranda Balustrade (`勾栏`) + Side Railings
  if (hasBalustrade && colX > wallX + 1) {
    buildBalustradeZ(grid, colX, deckY, z0, z1, lanterns ? Math.max(8, Math.round(bayWidth)) : 0);
    // Side railings closing north & south veranda ends (unless connected to bridge/corridor)
    buildBalustradeX(grid, z0, deckY, wallX + 1, colX);
    buildBalustradeX(grid, z1, deckY, wallX + 1, colX);
  }

  // 8. Optional Inscribed Plaque (`匾额`) under center eave
  if (plaqueTitle) {
    const midZ = Math.round((z0 + z1) * 0.5);
    buildPlaque(grid, colX + 1, topY - 2, midZ, Math.min(5, Math.floor(bayWidth * 0.6)));
  }

  return { topY, colZs };
}

function buildDougongCluster(grid, colX, y, z) {
  // Authentic stepped cap-block (`栌斗`) + cross-arms (`华拱` / `令拱`) jutting +1 and +2 voxels East!
  grid.set(colX + 1, y, z, MAT.DOUGONG_RED);
  grid.set(colX + 1, y + 1, z, MAT.DOUGONG_GREEN);
  grid.set(colX + 1, y + 1, z - 1, MAT.DOUGONG_RED);
  grid.set(colX + 1, y + 1, z + 1, MAT.DOUGONG_RED);
  grid.set(colX + 2, y + 1, z, MAT.DOUGONG_RED);
}

/**
 * Builds a swept classical Chinese roof (`歇山顶` hip-and-gable or `重檐腰檐` skirt eave)!
 * Features authentic concave curvature (`举折`), upturned flying corners (`翼角起翘`),
 * emerald-green glazed roof edge trim (`绿琉璃剪边`), imperial amber-yellow main ridge & owl-tail finials (`黄琉璃正脊与鸱吻`),
 * and crisp white-painted flying rafter tips (`白粉飞椽头`)!
 */
export function buildClassicalRoof(grid, {
  x0,
  x1,
  z0,
  z1,
  baseY,
  ridgeHeight = 9,
  eaveOverhang = 4,
  style = 'xieshan', // 'xieshan' (hip-and-gable), 'skirt' (waist eave around a multi-story tower), 'cross' (十字歇山顶 for Bell/Drum Towers!)
  ridgeGlaze = MAT.GLAZE_YELLOW_1,
  trimGlaze = MAT.GLAZE_GREEN_1,
}) {
  const rx0 = x0 - 1; // Tucks neatly into cliff rock on West (-X)
  const rx1 = x1 + eaveOverhang;
  const rz0 = z0 - eaveOverhang;
  const rz1 = z1 + eaveOverhang;

  const midX = (x0 + x1) * 0.5;
  const midZ = (z0 + z1) * 0.5;
  const halfX = (rx1 - rx0) * 0.5;
  const halfZ = (rz1 - rz0) * 0.5;

  if (style === 'skirt') {
    // Waist eave (`腰檐` / `平座暗层檐`) projecting around East, North, South faces of a multi-story pavilion
    const skirtDrop = 4;
    for (let z = rz0; z <= rz1; z++) {
      for (let x = rx0; x <= rx1; x++) {
        // Only outside the upper story core [x0..x1, z0..z1]
        const dx = Math.max(0, x - x1);
        const dz = Math.max(0, z0 - z, z - z1);
        const outDist = Math.max(dx, dz);
        if (outDist <= 0) continue;

        const u = outDist / eaveOverhang; // 0 at wall -> 1 at outer eave tip
        // Concave Chinese curve + dramatic corner upturn (`翼角起翘`) when both dx>0 and dz>0!
        const cornerLift = (dx > 0 && dz > 0)
          ? Math.round(Math.pow((dx * dz) / (eaveOverhang * eaveOverhang), 0.85) * 2.6)
          : 0;
        const y = baseY + Math.round((1 - Math.pow(u, 0.78)) * skirtDrop) + cornerLift;

        const isEdge = outDist === eaveOverhang;
        const isHipDiag = dx > 0 && dz > 0 && Math.abs(dx - dz) <= 1;

        // Dark timber rafters underneath
        grid.set(x, y - 1, z, isEdge ? MAT.EAVE_RAFTER_WHITE : MAT.TIMBER_DARK_ELM);

        // Tile surface
        let tileMat;
        if (isHipDiag) tileMat = ridgeGlaze;
        else if (isEdge || outDist === eaveOverhang - 1) tileMat = trimGlaze;
        else tileMat = (z & 1) === 0 ? MAT.TILE_GREY_1 : MAT.TILE_GREY_2;

        grid.set(x, y, z, tileMat);
        if (isHipDiag && isEdge) {
          // Immortal & mythical beasts (`仙人走兽`) perched at flying eave corner!
          grid.set(x, y + 1, z, ridgeGlaze);
        }
      }
    }
    return;
  }

  if (style === 'cross') {
    // Iconic Cross-Ridge Hipped-Gable Roof (`十字歇山顶`) — signature crown of Hanging Temple's Bell & Drum Towers!
    for (let z = rz0; z <= rz1; z++) {
      for (let x = rx0; x <= rx1; x++) {
        const nx = Math.abs(x - midX) / Math.max(1, halfX);
        const nz = Math.abs(z - midZ) / Math.max(1, halfZ);
        // Cross-ridge takes the MIN of the two perpendicular gable slopes so two intersecting ridges form a "+"!
        const u = Math.min(nx, nz);
        const maxU = Math.max(nx, nz);
        if (maxU > 1.0) continue;

        // Concave Chinese roof curve (`举折`: steep near ridge, sweeping flat near eaves)
        const curve = Math.pow(1 - u, 1.48);
        // Corner upturn at the 4 outer corners
        const cornerUpturn = (nx > 0.65 && nz > 0.65)
          ? Math.round(Math.pow((nx - 0.65) * (nz - 0.65) / 0.1225, 0.9) * 2.6)
          : 0;

        const y = baseY + Math.round(curve * ridgeHeight) + cornerUpturn;

        const isOuterEdge = maxU >= 0.92;
        const isTrimBand = maxU >= 0.78;
        const isCrossRidge = (nx <= 0.12 && nz <= 0.78) || (nz <= 0.12 && nx <= 0.78);
        const isDiagRidge = Math.abs(nx - nz) <= 0.10 && maxU > 0.45;

        // Fill attic gable screen & dark rafters underneath so there are zero hollow gaps under the roof!
        const fillBottom = (maxU <= 0.68) ? baseY + 1 : y - 1;
        for (let fy = fillBottom; fy < y; fy++) {
          if (maxU > 0.68) {
            grid.set(x, fy, z, MAT.TIMBER_DARK_ELM);
          } else if (Math.abs(nx - 0.68) < 0.08 || Math.abs(nz - 0.68) < 0.08) {
            // Ornate green/red carved gable pediment (`山花板`)!
            grid.set(x, fy, z, ((x + fy + z) & 1) ? MAT.DOUGONG_RED : MAT.DOUGONG_GREEN);
          } else {
            grid.set(x, fy, z, MAT.TIMBER_DARK_ELM);
          }
        }

        if (isOuterEdge) {
          grid.set(x, y - 1, z, MAT.EAVE_RAFTER_WHITE);
        }

        let mat;
        if (isCrossRidge || isDiagRidge) mat = ridgeGlaze;
        else if (isTrimBand) mat = trimGlaze;
        else mat = ((x + z) & 1) === 0 ? MAT.TILE_GREY_1 : MAT.TILE_GREY_2;

        grid.set(x, y, z, mat);
        if (isCrossRidge && maxU < 0.12) {
          // Central glazed lotus/treasure finial (`宝顶`) at the cross intersection!
          grid.set(x, y + 1, z, MAT.GLAZE_TURQUOISE);
          grid.set(x, y + 2, z, MAT.DOUGONG_GOLD);
        } else if (isCrossRidge) {
          grid.set(x, y + 1, z, ridgeGlaze);
        }
      }
    }
    return;
  }

  // Standard Hipped-Gable Roof (`歇山顶`, ridge running North-South along Z!)
  const gableHalfZ = Math.max(3, (z1 - z0) * 0.34);

  for (let z = rz0; z <= rz1; z++) {
    for (let x = rx0; x <= rx1; x++) {
      const dx = Math.abs(x - midX) / Math.max(1, halfX); // 0 at N-S ridge -> 1 at East/West eaves
      const dzGable = Math.max(0, Math.abs(z - midZ) - gableHalfZ) / Math.max(1, halfZ - gableHalfZ); // 0 in middle -> 1 at N/S eaves

      // In Xieshan (hip-and-gable), the upper half is a pure gable (`悬山`) down to dx ~ 0.45,
      // and the lower skirt flares out on all 4 sides!
      const u = Math.max(dx, dzGable * 0.92);
      if (u > 1.0) continue;

      const curve = Math.pow(1 - u, 1.45);
      // Flying corner upturn (`翼角起翘`) at outer corners
      const cornerFactor = Math.max(0, dx - 0.65) * Math.max(0, (Math.abs(z - midZ) / halfZ) - 0.68);
      const cornerLift = Math.round(cornerFactor * 22);

      const y = baseY + Math.round(curve * ridgeHeight) + cornerLift;

      // Solid gable wall / rafter backing underneath so zero daylight leaks under tiles!
      const insideCore = x >= x0 && x <= x1 && z >= z0 && z <= z1;
      const underBottom = insideCore ? baseY + 1 : y - 1;
      for (let fy = underBottom; fy < y; fy++) {
        if (!insideCore) {
          grid.set(x, fy, z, MAT.TIMBER_DARK_ELM);
        } else if (Math.abs(Math.abs(z - midZ) - gableHalfZ) <= 1 && fy > baseY + 2) {
          // Carved triangular gable screen (`博风板` & `山花`)
          grid.set(x, fy, z, ((x + fy) & 1) ? MAT.DOUGONG_GREEN : MAT.LACQUER_RED_DARK);
        }
      }

      const isOuterEave = dx >= 0.91 || Math.abs(z - midZ) >= halfZ - 0.8;
      const isTrim = dx >= 0.76 || Math.abs(z - midZ) >= halfZ - 2.0;
      const isMainRidge = dx <= 0.09 && Math.abs(z - midZ) <= gableHalfZ + 1;
      const isHipRidge = dzGable > 0.05 && Math.abs(dx - dzGable * 0.92) <= 0.11;

      if (isOuterEave && x > x0) {
        grid.set(x, y - 1, z, MAT.EAVE_RAFTER_WHITE);
      }

      let mat;
      if (isMainRidge || isHipRidge) mat = ridgeGlaze;
      else if (isTrim) mat = trimGlaze;
      else {
        // Ribbed barrel tile rows (`筒瓦垄`) running down the slope along X!
        mat = (z & 1) === 0 ? MAT.TILE_GREY_1 : MAT.TILE_GREY_2;
      }

      grid.set(x, y, z, mat);

      // Raised main ridge crest + Chiwen (`鸱吻` dragon-owl finials) at both ends of main ridge!
      if (isMainRidge) {
        grid.set(x, y + 1, z, ridgeGlaze);
        if (Math.abs(Math.abs(z - midZ) - Math.round(gableHalfZ)) <= 1) {
          grid.set(x, y + 2, z, ridgeGlaze);
          grid.set(x, y + 3, z, MAT.GLAZE_TURQUOISE);
        }
      }
      // Corner mythical beasts (`走兽`) at outer flying hip tips + Hanging Bronze Wind-Bell (`檐角铁马铜铃`)!
      if (isHipRidge && isOuterEave && x > midX) {
        grid.set(x, y + 1, z, ridgeGlaze);
        grid.setIfAir(x, y - 2, z, MAT.BRONZE_BELL);
        grid.setIfAir(x, y - 3, z, MAT.DOUGONG_GOLD);
      }
    }
  }
}

/**
 * Builds the Three Teachings Sacred Statues (`三教同堂塑像`) inside the top floor of North Pavilion:
 * Center: Sakyamuni Buddha on gilded lotus throne (`释迦牟尼`)
 * South: Confucius in scholar crown (`孔子`)
 * North: Laozi with Daoist topknot (`老子`)
 */
export function buildThreeTeachingsStatues(grid, x, floorY, centerZ) {
  // Altar platform (`须弥座神台`)
  for (let dz = -9; dz <= 9; dz++) {
    for (let dx = -1; dx <= 2; dx++) {
      grid.set(x + dx, floorY + 1, centerZ + dz, MAT.STONE_SUMERU_BASE);
      grid.set(x + dx, floorY + 2, centerZ + dz, MAT.DOUGONG_RED);
    }
  }

  // Center: Gilded Sakyamuni Buddha on Lotus Pedestal
  for (let dz = -1; dz <= 1; dz++) {
    grid.set(x + 1, floorY + 3, centerZ + dz, MAT.GOLD_STATUE_SHADOW); // Lotus base
    grid.set(x + 1, floorY + 4, centerZ + dz, MAT.GOLD_STATUE_BRIGHT); // Seated robe
    grid.set(x + 1, floorY + 5, centerZ + dz, MAT.GOLD_STATUE_BRIGHT); // Chest
  }
  grid.set(x + 1, floorY + 6, centerZ, MAT.GOLD_STATUE_BRIGHT);        // Buddha head
  grid.set(x + 1, floorY + 7, centerZ, MAT.DOUGONG_BLUE);              // Ushnisha topknot
  // Golden Mandorla (`背光`) behind Buddha
  for (let dy = 4; dy <= 7; dy++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (Math.abs(dz) === 2 || dy === 7) {
        grid.set(x, floorY + dy, centerZ + dz, MAT.GOLD_STATUE_SHADOW);
      }
    }
  }

  // South (-5): Confucius (`至圣先师孔子`)
  for (let dz = -6; dz <= -4; dz++) {
    grid.set(x + 1, floorY + 3, centerZ + dz, MAT.STATUE_ROBE_OCHRE);
    grid.set(x + 1, floorY + 4, centerZ + dz, MAT.STATUE_ROBE_OCHRE);
  }
  grid.set(x + 1, floorY + 5, centerZ - 5, MAT.GOLD_STATUE_BRIGHT);
  grid.set(x + 1, floorY + 6, centerZ - 5, MAT.PLAQUE_BLACK_LACQUER); // Imperial scholar crown (`冕冠`)

  // North (+5): Laozi (`太上老君老子`)
  for (let dz = 4; dz <= 6; dz++) {
    grid.set(x + 1, floorY + 3, centerZ + dz, MAT.STATUE_ROBE_BLUE);
    grid.set(x + 1, floorY + 4, centerZ + dz, MAT.STATUE_ROBE_BLUE);
  }
  grid.set(x + 1, floorY + 5, centerZ + 5, MAT.GOLD_STATUE_BRIGHT);
  grid.set(x + 1, floorY + 6, centerZ + 5, MAT.WALL_WHITE_PLASTER);   // White hair & Daoist bun

  // Bronze Incense Burner (`青铜香炉`) with glowing ember in front of altar!
  grid.set(x + 3, floorY + 1, centerZ, MAT.BRONZE_PATINA);
  grid.set(x + 3, floorY + 2, centerZ, MAT.BRONZE_PATINA);
  grid.set(x + 3, floorY + 3, centerZ, MAT.INCENSE_EMBER);
}

/**
 * Builds the ancient cast-bronze temple bell (`古铜洪钟`) suspended inside the Bell Tower,
 * or the great crimson-and-cream war drum (`法鼓`) inside the Drum Tower!
 */
export function buildBronzeBell(grid, cx, floorY, cz) {
  // Timber bell frame
  for (let dy = 1; dy <= 7; dy++) {
    grid.set(cx, floorY + dy, cz - 2, MAT.LACQUER_RED_DARK);
    grid.set(cx, floorY + dy, cz + 2, MAT.LACQUER_RED_DARK);
  }
  for (let dz = -2; dz <= 2; dz++) {
    grid.set(cx, floorY + 7, cz + dz, MAT.LACQUER_RED_PILLAR);
  }
  // Suspended cast bronze bell
  grid.set(cx, floorY + 6, cz, MAT.DOUGONG_GOLD);
  for (let dy = 3; dy <= 5; dy++) {
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        if (dy === 5 && Math.abs(ox) + Math.abs(oz) > 1) continue;
        grid.set(cx + ox, floorY + dy, cz + oz, dy === 3 ? MAT.BRONZE_PATINA : MAT.BRONZE_BELL);
      }
    }
  }
}

export function buildTempleDrum(grid, cx, floorY, cz) {
  // Red stand
  grid.set(cx, floorY + 1, cz - 1, MAT.LACQUER_RED_PILLAR);
  grid.set(cx, floorY + 1, cz + 1, MAT.LACQUER_RED_PILLAR);
  grid.set(cx, floorY + 2, cz - 1, MAT.LACQUER_RED_PILLAR);
  grid.set(cx, floorY + 2, cz + 1, MAT.LACQUER_RED_PILLAR);
  // Barrel drum body (`红漆牛皮大鼓`)
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = 3; oy <= 5; oy++) {
      for (let oz = -1; oz <= 1; oz++) {
        const mat = Math.abs(ox) === 1 && oy === 4 ? MAT.DRUM_HIDE_CREAM : MAT.LACQUER_RED_RAIL;
        grid.set(cx + ox, floorY + oy, cz + oz, mat);
      }
    }
  }
}
