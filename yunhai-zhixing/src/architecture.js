import { C, noise2, mulberry32 } from './palette.js';

const LANTERN_Y = 50;

function vox(vol, x, y, z, color, kind = 0, jitter = 0.045) {
  vol.set(x, y, z, color, kind, jitter);
}

function box(vol, x0, y0, z0, x1, y1, z1, color, kind = 0, jitter = 0.045) {
  vol.fillBox(x0, y0, z0, x1, y1, z1, color, kind, jitter);
}

function hollowBox(vol, x0, y0, z0, x1, y1, z1, color, kind = 0) {
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (let z = z0; z <= z1; z++) {
        if (x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1) {
          vox(vol, x, y, z, color, kind);
        }
      }
    }
  }
}

function lantern(vol, x, y, z, core = C.lampCore, cap = C.timber1, scale = 1) {
  if (scale <= 1) {
    vox(vol, x, y, z, core, 2, 0.015);
    vox(vol, x, y + 1, z, cap, 0, 0.01);
    if (y > 0) vox(vol, x, y - 1, z, C.vermilionDark, 0, 0.01);
    return;
  }
  for (let dx = -scale + 1; dx <= scale - 1; dx++) {
    for (let dz = -scale + 1; dz <= scale - 1; dz++) {
      vox(vol, x + dx, y, z + dz, core, 2, 0.01);
    }
  }
  for (let dx = -scale; dx <= scale; dx++) {
    for (let dz = -scale; dz <= scale; dz++) {
      vox(vol, x + dx, y + scale, z + dz, cap, 0, 0.02);
      vox(vol, x + dx, y - 1, z + dz, C.vermilionDark, 0, 0.02);
    }
  }
  for (let dx = -scale; dx <= scale; dx += 2) {
    vox(vol, x + dx, y + scale - 1, z, C.timber1, 0, 0.02);
    vox(vol, x, y + scale - 1, z + dx, C.timber1, 0, 0.02);
  }
}

function railing(vol, x0, z0, x1, z1, y, color = C.timber2) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const z = Math.round(z0 + (z1 - z0) * t);
    if (i % 3 === 0) box(vol, x, y, z, x, y + 2, z, color, 0, 0.03);
    if (i % 2 === 0) vox(vol, x, y + 2, z, C.timber3, 0, 0.02);
  }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const z = Math.round(z0 + (z1 - z0) * t);
    vox(vol, x, y + 1, z, C.timber3, 0, 0.02);
  }
}

function buildFigure(vol, x, y, z, robe = C.cloth, hat = C.timber1, lanternHand = false) {
  vox(vol, x, y, z, 0x2b2c2e, 0, 0.02);
  vox(vol, x, y + 1, z, robe, 0, 0.03);
  vox(vol, x, y + 2, z, robe, 0, 0.03);
  vox(vol, x, y + 3, z, 0xc9b094, 0, 0.02);
  vox(vol, x, y + 4, z, hat, 0, 0.02);
  if (lanternHand) {
    vox(vol, x + 1, y + 1, z, C.lampCore, 2, 0.01);
  }
}

function buildHipRoof(vol, opt) {
  const {
    x0, x1, z0, z1, ridgeX0, ridgeX1, ridgeZ, ridgeY,
    tileA = C.roof2, tileB = C.roof3, eave = C.roofEdge, ridge = C.brass2,
  } = opt;
  const eaveY = opt.eaveY ?? (ridgeY - 9);
  const wingSteps = opt.wingSteps ?? 3;
  const maxDz = Math.max(1, Math.abs(z0 - ridgeZ), Math.abs(z1 - ridgeZ));
  const maxDx = Math.max(1, ridgeX0 - x0, x1 - ridgeX1);

  function roofY(x, z) {
    const dx = x < ridgeX0 ? ridgeX0 - x : x > ridgeX1 ? x - ridgeX1 : 0;
    const dz = Math.abs(z - ridgeZ);
    const q = Math.max(dx / maxDx, dz / maxDz);
    return Math.round(ridgeY - (ridgeY - eaveY) * Math.pow(q, 0.7));
  }

  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      let y = roofY(x, z);
      const dx = x < ridgeX0 ? ridgeX0 - x : x > ridgeX1 ? x - ridgeX1 : 0;
      const dz = Math.abs(z - ridgeZ);
      const q = Math.max(dx / maxDx, dz / maxDz);
      const edgeX = x === x0 || x === x1;
      const edgeZ = z === z0 || z === z1;
      const nearCorner = edgeX && edgeZ;
      if (nearCorner) y += 2;
      else if (q > 0.88) y += 1;

      const rib = Math.abs((x + 100) % 4) < 2;
      let color = rib ? tileA : tileB;
      const hip = dx > 1 && dz > 1 && Math.abs(dx / maxDx - dz / maxDz) < 0.075;
      if (hip) color = (x + z) % 4 === 0 ? C.roofEdge : C.tileLight;
      if (edgeX || edgeZ) color = ((x + z) % 3 === 0) ? C.tileLight : eave;
      if (x >= ridgeX0 && x <= ridgeX1 && dz < 1) color = ridge;
      vox(vol, x, y, z, color, 0, 0.03);
      if (q < 0.97) vox(vol, x, y - 1, z, C.timber1, 0, 0.02);
      if (edgeX || edgeZ) {
        vox(vol, x, y - 1, z, C.timber2, 0, 0.03);
        if ((x + z) % 5 === 0) vox(vol, x, y - 2, z, C.timber1, 0, 0.02);
      }
    }
  }

  // lifted eave corners and little brass wing tips
  for (const [cx, cz] of [[x0, z0], [x0, z1], [x1, z0], [x1, z1]]) {
    const sx = cx === x0 ? -1 : 1;
    const sz = cz === z0 ? -1 : 1;
    const baseY = roofY(cx, cz) + 2;
    for (let i = 1; i <= wingSteps; i++) {
      vox(vol, cx + sx * i, baseY + Math.floor(i * 0.6), cz + sz * i, i === wingSteps ? C.brass3 : C.timber1, i === wingSteps ? 1 : 0, 0.02);
      if (i < wingSteps) vox(vol, cx + sx * i, baseY + Math.floor(i * 0.6) + 1, cz + sz * i, C.roofEdge, 0, 0.02);
    }
    vox(vol, cx, baseY + 1, cz, C.brass3, 1, 0.01);
  }

  // ridge ornaments
  for (const rx of [ridgeX0 - 1, ridgeX1 + 1]) {
    vox(vol, rx, ridgeY + 1, ridgeZ, C.gold, 1, 0.01);
    vox(vol, rx, ridgeY + 2, ridgeZ, C.brass4, 1, 0.01);
    vox(vol, rx, ridgeY + 2, ridgeZ + 1, C.brass3, 1, 0.01);
    vox(vol, rx, ridgeY + 3, ridgeZ, C.gold, 1, 0.01);
  }
  // the main ridge is a thin line of gilded tile
  for (let x = ridgeX0; x <= ridgeX1; x++) {
    if ((x - ridgeX0) % 3 === 0) vox(vol, x, ridgeY + 1, ridgeZ, C.brass2, 1, 0.015);
  }
}

function buildTowerSkirt(vol, cx, cz, baseY) {
  for (let x = cx - 10; x <= cx + 10; x++) {
    for (let z = cz - 10; z <= cz + 10; z++) {
      const dx = Math.abs(x - cx);
      const dz = Math.abs(z - cz);
      const r = Math.max(dx, dz);
      if (r < 5 || r > 10) continue;
      const q = (r - 5) / 5;
      let y = baseY + Math.round(3 - q * 4);
      if (r >= 9) y += 1;
      if (r >= 9 && dx >= 8 && dz >= 8) y += 1;
      const rib = (x + z) % 4 < 2;
      let color = rib ? C.roof2 : C.roof3;
      if (r >= 9) color = (x + z) % 3 === 0 ? C.tileLight : C.roofEdge;
      vox(vol, x, y, z, color, 0, 0.03);
      if (r < 9) vox(vol, x, y - 1, z, C.timber1, 0, 0.02);
      if (r === 10 && dx >= 8 && dz >= 8) vox(vol, x, y + 1, z, C.brass2, 1, 0.02);
    }
  }
}

function buildDais(vol) {
  const cx = 0;
  const cz = 0;
  const ground = 50;
  const top = 53;
  for (let x = -25; x <= 25; x++) {
    for (let z = -25; z <= 25; z++) {
      const r = Math.sqrt(x * x + z * z);
      if (r > 24.4) continue;
      for (let y = ground + 1; y <= top; y++) {
        let color = C.rock2;
        let kind = 0;
        if (y === top) {
          const ring = Math.abs(r - 7.5) < 0.8 || Math.abs(r - 14.5) < 0.7 || Math.abs(r - 22) < 0.8;
          const spoke = Math.abs(Math.atan2(z, x)) % (Math.PI / 6) < 0.028 && r > 8 && r < 22;
          if (ring) { color = C.brass2; kind = 1; }
          else if (spoke) { color = C.stoneFloorLight; }
          else {
            const tile = Math.floor((x + 80) / 3) + Math.floor((z + 80) / 3);
            color = tile % 2 ? C.stoneFloor : 0x626d73;
          }
        } else if (y === ground + 1) {
          color = C.rock3;
        }
        vox(vol, x, y, z, color, kind, 0.025);
      }
    }
  }
  // central inlaid compass
  for (let x = -6; x <= 6; x++) {
    for (let z = -6; z <= 6; z++) {
      if (Math.abs(x) + Math.abs(z) <= 5) {
        vox(vol, x, top + 1, z, (Math.abs(x) + Math.abs(z) < 2) ? C.glowTeal : C.stoneFloorLight, Math.abs(x) + Math.abs(z) < 2 ? 2 : 0, 0.02);
      }
    }
  }
  // front stairs
  for (let i = 0; i < 4; i++) {
    box(vol, -6, ground + 1, 25 + i, 6, top - i - 1, 25 + i, C.stonePath, 0, 0.03);
  }
  // eight stone lanterns on the rim
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8;
    const x = Math.round(Math.cos(a) * 21);
    const z = Math.round(Math.sin(a) * 21);
    box(vol, x, top + 1, z, x, top + 3, z, C.rock3, 0, 0.02);
    vox(vol, x, top + 4, z, C.lampCore, 2, 0.01);
    vox(vol, x, top + 5, z, C.tileLight, 0, 0.02);
  }
}

function buildTower(vol, cx, cz, side) {
  const gy = 50;
  const baseX0 = cx - 7;
  const baseX1 = cx + 7;
  const baseZ0 = cz - 7;
  const baseZ1 = cz + 7;

  // stepped foundation
  box(vol, baseX0, gy + 1, baseZ0, baseX1, gy + 2, baseZ1, C.rock2, 0, 0.035);
  box(vol, baseX0 + 2, gy + 3, baseZ0 + 2, baseX1 - 2, gy + 5, baseZ1 - 2, C.rock3, 0, 0.04);

  // shaft
  const sx0 = cx - 4, sx1 = cx + 4, sz0 = cz - 4, sz1 = cz + 4;
  for (let y = gy + 5; y <= 108; y++) {
    const taper = y > 88 ? 0 : 1;
    const ax0 = sx0 + (1 - taper), ax1 = sx1 - (1 - taper);
    const az0 = sz0 + (1 - taper), az1 = sz1 - (1 - taper);
    const stoneBand = (y % 11 < 4);
    const color = stoneBand ? (y % 22 < 11 ? C.rock2 : C.rock3) : C.timber2;
    for (let x = ax0; x <= ax1; x++) {
      for (let z = az0; z <= az1; z++) {
        if (x === ax0 || x === ax1 || z === az0 || z === az1) {
          let c = color;
          if (x === ax0 || x === ax1) c = stoneBand ? C.rock3 : C.timber3;
          if ((x === ax0 || x === ax1) && (z === az0 || z === az1)) c = C.timber1;
          vox(vol, x, y, z, c, 0, 0.045);
        }
      }
    }
    if (y === gy + 12 || y === gy + 34 || y === gy + 50) {
      box(vol, ax0 - 1, y, az0 - 1, ax1 + 1, y, az1 + 1, C.timber1, 0, 0.02);
      box(vol, ax0 - 1, y + 1, az0 - 1, ax1 + 1, y + 1, az1 + 1, C.timber3, 0, 0.02);
    }
  }

  // balcony at 74
  for (const by of [74, 93]) {
    box(vol, cx - 7, by, cz - 7, cx + 7, by, cz + 7, C.timber2, 0, 0.03);
    box(vol, cx - 6, by + 1, cz - 6, cx + 6, by + 1, cz + 6, C.stonePath, 0, 0.03);
    railing(vol, cx - 6, cz - 6, cx + 6, cz - 6, by + 2);
    railing(vol, cx - 6, cz + 6, cx + 6, cz + 6, by + 2);
    railing(vol, cx - 6, cz - 6, cx - 6, cz + 6, by + 2);
    railing(vol, cx + 6, cz - 6, cx + 6, cz + 6, by + 2);
    // lanterns at the corners
    for (const [lx, lz] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) {
      lantern(vol, cx + lx, by + 3, cz + lz, C.lampWarm, C.timber1, 1);
    }
  }

  // upturned pagoda eaves around the two balconies
  buildTowerSkirt(vol, cx, cz, 70);
  buildTowerSkirt(vol, cx, cz, 89);

  // narrow slit windows on the visible faces
  for (const wy of [62, 82, 100]) {
    const front = cz + 4;
    for (const ox of [-3, 0, 3]) {
      for (let y = wy; y <= wy + 4; y++) {
        if (y === wy + 2) vox(vol, cx + ox, y, front, C.timber2, 0, 0.02);
        else vox(vol, cx + ox, y, front, C.lampWarm, 2, 0.015);
      }
      vox(vol, cx + ox, wy - 1, front, C.timber1, 0, 0.02);
      vox(vol, cx + ox, wy + 5, front, C.timber1, 0, 0.02);
    }
    box(vol, cx - 4, wy - 2, front, cx + 4, wy - 2, front, C.timber1, 0, 0.02);
    const outerX = side > 0 ? cx + 4 : cx - 4;
    for (const oz of [-3, 0, 3]) {
      for (let y = wy; y <= wy + 4; y++) {
        if (y === wy + 2) vox(vol, outerX, y, cz + oz, C.timber2, 0, 0.02);
        else vox(vol, outerX, y, cz + oz, C.lampWarm, 2, 0.015);
      }
      vox(vol, outerX, wy - 1, cz + oz, C.timber1, 0, 0.02);
      vox(vol, outerX, wy + 5, cz + oz, C.timber1, 0, 0.02);
    }
  }

  // crown pavilion, open and airy
  const topY = 109;
  for (let x = cx - 5; x <= cx + 5; x++) {
    for (let z = cz - 5; z <= cz + 5; z++) {
      if (x === cx - 5 || x === cx + 5 || z === cz - 5 || z === cz + 5) {
        if ((x + z) % 2 === 0) box(vol, x, topY, z, x, topY + 5, z, C.timber2, 0, 0.03);
      }
    }
  }
  for (let x = cx - 5; x <= cx + 5; x++) {
    for (let z = cz - 5; z <= cz + 5; z++) {
      if (x === cx - 5 || x === cx + 5 || z === cz - 5 || z === cz + 5) {
        if ((x + z) % 4 === 0) vox(vol, x, topY + 4, z, C.lampWarm, 2, 0.02);
      }
    }
  }
  box(vol, cx - 4, topY + 4, cz - 4, cx + 4, topY + 4, cz + 4, C.timber1, 0, 0.02);
  lantern(vol, cx, topY + 3, cz, C.lampCore, C.timber1, 1);
  buildHipRoof(vol, {
    x0: cx - 8, x1: cx + 8, z0: cz - 8, z1: cz + 8,
    ridgeX0: cx - 3, ridgeX1: cx + 3, ridgeZ: cz, ridgeY: topY + 13,
    eaveY: topY + 5, tileA: C.roof2, tileB: C.roof3, eave: C.roofEdge, ridge: C.brass2,
    wingSteps: 2,
  });
  // a pagoda finial, tall and quiet
  const spireBase = topY + 14;
  for (let y = spireBase; y <= spireBase + 3; y++) vox(vol, cx, y, cz, C.brass4, 1, 0.01);
  for (const yy of [spireBase + 1, spireBase + 3]) {
    box(vol, cx - 2, yy, cz, cx + 2, yy, cz, C.brass3, 1, 0.01);
    box(vol, cx, yy, cz - 2, cx, yy, cz + 2, C.brass3, 1, 0.01);
  }
  vox(vol, cx, spireBase + 4, cz, C.lampCore, 2, 0.01);

  // brass axle toward the loom
  const innerX = side > 0 ? cx - 7 : cx + 7;
  box(vol, innerX, 92, cz - 2, innerX + (side > 0 ? 4 : -4), 97, cz + 2, C.brass2, 1, 0.02);
  box(vol, innerX, 94, cz, innerX + (side > 0 ? 4 : -4), 95, cz, C.brass4, 1, 0.01);

  // a long vermilion banner on the outer face, trimmed in gold
  const bx = side > 0 ? cx + 7 : cx - 7;
  for (let z = cz - 4; z <= cz + 4; z++) {
    box(vol, bx, 89, z, bx, 89, z, C.timber1, 0, 0.02);
    for (let y = 87; y >= 67; y--) {
      const wave = Math.round(Math.sin(y * 0.32 + z) * 0.8);
      const border = z === cz - 4 || z === cz + 4 || y === 87 || y === 67;
      const emblem = Math.abs(z - cz) <= 1 && y >= 76 && y <= 80;
      vox(vol, bx, y, cz + z + (z === cz ? wave : 0), border || emblem ? C.gold : C.vermilion, border ? 1 : 0, 0.04);
    }
  }
  vox(vol, bx, 90, cz - 4, C.brass3, 1, 0.01);
  vox(vol, bx, 90, cz + 4, C.brass3, 1, 0.01);
}

function buildHall(vol) {
  const gy = 50;
  const cx = 46, cz = 9;
  const px0 = 29, px1 = 63, pz0 = -6, pz1 = 25;
  // terrace and retaining wall
  box(vol, px0, gy + 1, pz0, px1, gy + 3, pz1, C.rock3, 0, 0.04);
  box(vol, px0, gy + 4, pz0, px1, gy + 4, pz1, C.stonePath, 0, 0.04);
  for (let x = px0; x <= px1; x++) {
    for (let z = pz0; z <= pz1; z++) {
      if (x === px0 || x === px1 || z === pz0 || z === pz1) {
        vox(vol, x, gy + 1, z, C.rock1, 0, 0.04);
      }
    }
  }
  // patterned terrace floor
  for (let x = px0 + 2; x < px1 - 1; x++) {
    for (let z = pz0 + 2; z < pz1 - 1; z++) {
      if (((x + z) % 9 === 0) || ((x - z) % 11 === 0)) {
        vox(vol, x, gy + 5, z, C.stonePath, 0, 0.02);
      }
    }
  }

  // hall body
  const x0 = 34, x1 = 58, z0 = 1, z1 = 18;
  const wallTop = 66;
  box(vol, x0, gy + 5, z0, x1, gy + 5, z1, C.timber1, 0, 0.02);
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      if (!(x === x0 || x === x1 || z === z0 || z === z1)) continue;
      for (let y = gy + 6; y <= wallTop; y++) {
        const isPost = (x === x0 || x === x1 || z === z0 || z === z1)
          && ((x - x0) % 6 === 0 || (z - z0) % 6 === 0 || x === x0 || x === x1 || z === z0 || z === z1)
          && ((x === x0 || x === x1) ? (z - z0) % 6 === 0 : (x - x0) % 6 === 0);
        const beam = (y === gy + 6 || y === wallTop || y === gy + 21);
        if (beam || isPost) {
          vox(vol, x, y, z, isPost ? C.vermilionDark : C.timber1, 0, 0.03);
        } else {
          vox(vol, x, y, z, C.plaster, 0, 0.045);
        }
      }
    }
  }
  // lattice windows, front and right side
  function windowPanelZ(cx0, cx1, wy0, wy1, wz) {
    for (let x = cx0; x <= cx1; x++) {
      for (let y = wy0; y <= wy1; y++) {
        const frame = x === cx0 || x === cx1 || y === wy0 || y === wy1;
        const lattice = (x - cx0) % 2 === 0 || (y - wy0) % 2 === 0;
        vox(vol, x, y, wz, frame ? C.timber1 : (lattice ? C.timber2 : C.lampCore), !frame && !lattice ? 2 : 0, 0.02);
      }
    }
  }
  function windowPanelX(cz0, cz1, wy0, wy1, wx) {
    for (let z = cz0; z <= cz1; z++) {
      for (let y = wy0; y <= wy1; y++) {
        const frame = z === cz0 || z === cz1 || y === wy0 || y === wy1;
        const lattice = (z - cz0) % 2 === 0 || (y - wy0) % 2 === 0;
        vox(vol, wx, y, z, frame ? C.timber1 : (lattice ? C.timber2 : C.lampCore), !frame && !lattice ? 2 : 0, 0.02);
      }
    }
  }
  windowPanelZ(36, 41, 56, 62, z1);
  windowPanelZ(49, 54, 56, 62, z1);
  windowPanelX(3, 8, 56, 62, x1);
  windowPanelX(11, 16, 56, 62, x1);
  // door
  for (let x = 44; x <= 48; x++) {
    for (let y = gy + 6; y <= 63; y++) {
      if (x === 44 || x === 48 || y === gy + 6 || y === 63) vox(vol, x, y, z1, C.timber1, 0, 0.02);
      else vox(vol, x, y, z1, C.lampWarm, 2, 0.01);
    }
  }
  // plaque
  box(vol, 43, 68, z1 + 1, 49, 70, z1 + 1, C.timber1, 0, 0.01);
  for (let x = 44; x <= 48; x++) vox(vol, x, 69, z1 + 1, C.gold, 1, 0.01);

  // veranda posts
  for (const x of [31, 36, 41, 46, 51, 56, 61]) {
    for (let y = gy + 5; y <= gy + 9; y++) vox(vol, x, y, pz1 - 1, C.vermilionDark, 0, 0.02);
    vox(vol, x, gy + 10, pz1 - 1, C.timber1, 0, 0.02);
  }

  // front steps
  for (let i = 0; i < 4; i++) {
    box(vol, 42, gy + 4 - i, pz1 + 1 + i, 50, gy + 4 - i, pz1 + 1 + i, C.stonePath, 0, 0.03);
  }

  // main roof
  buildHipRoof(vol, {
    x0: 29, x1: 63, z0: -8, z1: 26,
    ridgeX0: 38, ridgeX1: 54, ridgeZ: 9, ridgeY: 78,
    eaveY: 66, tileA: C.roof3, tileB: C.roof4, eave: C.tileLight, ridge: C.brass2,
  });
  // lower porch roof
  buildHipRoof(vol, {
    x0: 33, x1: 59, z0: 19, z1: 25,
    ridgeX0: 41, ridgeX1: 51, ridgeZ: 22, ridgeY: 70,
    eaveY: 65, tileA: C.roof4, tileB: C.roof3, eave: C.tileLight, ridge: C.brass3,
  });

  // roof lantern strings on the front eave
  for (const x of [32, 37, 42, 47, 52, 57, 61]) {
    for (let y = 63; y >= 60; y--) vox(vol, x, y, 24, C.timber1, 0, 0.01);
    lantern(vol, x, 59, 24, C.lampWarm, C.timber1, 1);
  }

  // a generous lantern beneath the front eave
  for (let y = 64; y >= 63; y--) vox(vol, 46, y, 26, C.timber1, 0, 0.01);
  lantern(vol, 46, 61, 26, C.lampWarm, C.timber1, 2);

  // side annex: a small open pavilion to the right of the hall
  const ax = 62, az = -2;
  box(vol, ax - 4, gy + 5, az - 4, ax + 4, gy + 5, az + 4, C.timber2, 0, 0.03);
  for (const [px, pz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
    box(vol, ax + px, gy + 6, az + pz, ax + px, gy + 12, az + pz, C.vermilionDark, 0, 0.02);
  }
  lantern(vol, ax - 3, gy + 7, az + 3, C.lampWarm, C.timber1, 1);
  buildHipRoof(vol, {
    x0: ax - 7, x1: ax + 7, z0: az - 7, z1: az + 7,
    ridgeX0: ax - 2, ridgeX1: ax + 2, ridgeZ: az, ridgeY: gy + 19,
    eaveY: gy + 12, tileA: C.roof2, tileB: C.roof3, eave: C.roofEdge, ridge: C.brass2,
  });

  // covered gallery toward the loom courtyard
  const gx0 = 17, gx1 = 34, gz = 18;
  for (let x = gx0; x <= gx1; x += 4) {
    box(vol, x, gy + 5, gz - 2, x, gy + 10, gz - 2, C.vermilionDark, 0, 0.02);
    box(vol, x, gy + 5, gz + 2, x, gy + 10, gz + 2, C.vermilionDark, 0, 0.02);
  }
  box(vol, gx0, gy + 11, gz - 3, gx1, gy + 11, gz + 3, C.timber1, 0, 0.02);
  for (let x = gx0; x <= gx1; x++) {
    for (let z = gz - 4; z <= gz + 4; z++) {
      const dz = Math.abs(z - gz);
      const y = gy + 12 + Math.max(0, 3 - Math.floor(dz * 1.1));
      vox(vol, x, y, z, (x % 2) ? C.roof2 : C.roof3, 0, 0.03);
      vox(vol, x, y - 1, z, C.timber1, 0, 0.02);
    }
  }
  // gallery lanterns
  lantern(vol, gx0 + 4, gy + 8, gz - 4, C.lampWarm, C.timber1, 1);
  lantern(vol, gx0 + 12, gy + 8, gz + 4, C.lampWarm, C.timber1, 1);
}

function buildPavilion(vol) {
  const cx = -55, cz = 53;
  const gy = 37;
  // platform
  box(vol, cx - 8, gy + 1, cz - 7, cx + 8, gy + 1, cz + 7, C.rock2, 0, 0.04);
  box(vol, cx - 7, gy + 2, cz - 6, cx + 7, gy + 2, cz + 6, C.stonePath, 0, 0.03);
  railing(vol, cx - 7, cz - 6, cx + 7, cz - 6, gy + 3);
  railing(vol, cx + 7, cz - 6, cx + 7, cz + 6, gy + 3);
  // four posts
  for (const [px, pz] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) {
    box(vol, cx + px, gy + 3, cz + pz, cx + px, gy + 10, cz + pz, C.vermilionDark, 0, 0.02);
  }
  // low walls / seats
  box(vol, cx - 6, gy + 3, cz - 5, cx + 6, gy + 4, cz - 5, C.timber2, 0, 0.02);
  box(vol, cx + 6, gy + 3, cz - 5, cx + 6, gy + 4, cz + 5, C.timber2, 0, 0.02);
  // table
  box(vol, cx - 1, gy + 3, cz - 1, cx + 1, gy + 4, cz + 1, C.timber3, 0, 0.02);
  vox(vol, cx, gy + 5, cz, C.lampCore, 2, 0.01);
  // roof
  buildHipRoof(vol, {
    x0: cx - 9, x1: cx + 9, z0: cz - 8, z1: cz + 8,
    ridgeX0: cx - 3, ridgeX1: cx + 3, ridgeZ: cz, ridgeY: gy + 18,
    eaveY: gy + 11, tileA: C.roof2, tileB: C.roof3, eave: C.roofEdge, ridge: C.brass2,
  });
  lantern(vol, cx - 4, gy + 8, cz + 4, C.lampWarm, C.timber1, 1);
  buildFigure(vol, cx + 2, gy + 3, cz + 2, C.cloth, C.timber1, false);
  buildFigure(vol, cx - 2, gy + 3, cz - 2, C.vermilion, C.timber1, false);
}

function buildWaterCourt(vol) {
  // stone-lined stream and small arched bridge
  for (let z = 30; z <= 47; z++) {
    const xCenter = -27 + Math.round(Math.sin(z * 0.33) * 1.2);
    for (let x = xCenter - 4; x <= xCenter + 4; x++) {
      const edge = Math.abs(x - xCenter) >= 3;
      const y = 50;
      if (edge) {
        vox(vol, x, y + 1, z, C.rock2, 0, 0.04);
        if (noise2(x * 0.4, z * 0.4) > 0.55) vox(vol, x, y + 2, z, C.rock3, 0, 0.04);
      } else {
        vox(vol, x, y, z, C.deepRock, 0, 0.02);
      }
    }
  }
  // spring rocks
  for (let i = 0; i < 14; i++) {
    const x = -31 + Math.floor(noise2(i * 2.1, 1.2) * 8);
    const z = 29 + Math.floor(noise2(i * 1.7, 4.1) * 4);
    const h = 1 + Math.floor(noise2(i, 9) * 3);
    box(vol, x, 51, z, x, 50 + h, z, C.rock2, 0, 0.05);
  }
  // cliff lip
  for (let x = -33; x <= -21; x++) {
    vox(vol, x, 51, 48, C.rock2, 0, 0.04);
    if (x % 3 === 0) vox(vol, x, 52, 48, C.moss2, 0, 0.04);
  }
  // small bridge across the stream
  for (let x = -36; x <= -18; x++) {
    const z = 38;
    const arch = Math.abs(x + 27) < 4 ? 1 : 0;
    vox(vol, x, 51 + arch, z, C.stonePath, 0, 0.03);
    vox(vol, x, 51 + arch, z + 1, C.stonePath, 0, 0.03);
    if (x % 4 === 0) {
      box(vol, x, 52 + arch, z, x, 53 + arch, z, C.stonePath, 0, 0.02);
    }
  }
  railing(vol, -36, 37, -18, 37, 53);
  railing(vol, -36, 39, -18, 39, 53);
  lantern(vol, -20, 52, 48, C.lampWarm, C.timber1, 1);
}

function buildPaths(vol) {
  const pts = [
    [43, 26], [39, 27], [35, 28], [31, 29], [27, 29], [23, 27],
    [20, 24], [19, 22], [20, 20], [22, 18], [25, 17], [29, 16],
  ];
  for (let i = 0; i < pts.length; i++) {
    const [x, z] = pts[i];
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const xx = x + dx, zz = z + dz;
        if (noise2(xx * 0.3, zz * 0.3, 8) > 0.22) {
          vox(vol, xx, 51, zz, (Math.abs(dx) === 2) ? C.rock2 : C.stonePath, 0, 0.03);
        }
      }
    }
  }
  // path from courtyard to water court
  for (let z = 17; z <= 30; z++) {
    for (let x = -22; x <= -17; x++) {
      if (noise2(x * 0.4, z * 0.4, 6) > 0.15) vox(vol, x, 51, z, C.stonePath, 0, 0.03);
    }
  }
}

function buildWeavers(vol) {
  // tiny robed figures give the huge loom its scale
  buildFigure(vol, -7, 54, 8, C.cloth, C.timber1, true);
  buildFigure(vol, -4, 54, 11, C.plasterShade, C.vermilionDark, false);
  buildFigure(vol, 5, 54, 9, C.clothRed, C.timber1, false);
  buildFigure(vol, 8, 54, 5, C.cloth, C.timber1, true);
  buildFigure(vol, 1, 54, 15, C.plasterShade, C.vermilionDark, false);
  buildFigure(vol, 6, 54, -8, C.clothRed, C.timber1, false);
  buildFigure(vol, 16, 54, 17, C.cloth, C.timber1, true);
  buildFigure(vol, 28, 55, 18, C.cloth, C.timber1, false);
  buildFigure(vol, 39, 55, 26, C.vermilion, C.timber1, true);
  buildFigure(vol, -51, 40, 50, C.cloth, C.timber1, true);
  buildFigure(vol, -58, 40, 55, C.plasterShade, C.timber1, false);
  buildFigure(vol, -43, 52, 41, C.clothRed, C.timber1, false);
  buildFigure(vol, 60, 55, 14, C.cloth, C.timber1, true);
  buildFigure(vol, 2, 54, 20, C.clothRed, C.timber1, true);
  buildFigure(vol, 12, 54, 23, C.plasterLight, C.vermilionDark, true);
  buildFigure(vol, 22, 54, 24, C.cloth, C.timber1, false);
  buildFigure(vol, -24, 54, 22, C.plasterShade, C.timber1, true);
}


function buildLoomArch(vol) {
  const cy = 94;
  const cx = 0;
  const cz = 0;
  const R = 28;
  for (let a = 0; a < Math.PI * 2; a += 0.0015) {
    for (let dr = -1.4; dr <= 1.4; dr += 0.7) {
      const x = Math.round(cx + Math.cos(a) * (R + dr));
      const y = Math.round(cy + Math.sin(a) * (R + dr));
      for (let z = -1; z <= 1; z++) {
        const sector = Math.floor(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 12));
        let color = sector % 2 ? C.timber2 : C.timber1;
        let kind = 0;
        if (Math.abs(dr) > 1.1) color = sector % 3 === 0 ? C.brass2 : C.timber3;
        if (Math.abs(dr) > 1.1 && sector % 3 === 0) kind = 1;
        if (Math.abs(dr) < 0.25) color = sector % 4 === 0 ? C.brass2 : C.timber3;
        vox(vol, x, y, cz + z, color, kind, 0.03);
      }
    }
  }
  // radial teeth / studs around the arch
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2 + Math.PI / 24;
    const x = Math.round(cx + Math.cos(a) * (R + 3));
    const y = Math.round(cy + Math.sin(a) * (R + 3));
    const color = i % 3 === 0 ? C.brass3 : C.timber1;
    box(vol, x, y, cz - 1, x, y, cz + 1, color, i % 3 === 0 ? 1 : 0, 0.02);
  }
  // four carved brackets at the diagonals
  for (const a of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
    for (let r = R - 3; r <= R + 3; r++) {
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r);
      box(vol, x - 1, y, cz, x + 1, y, cz, C.brass2, 1, 0.02);
    }
  }
  // hanging lanterns under the lower arc
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + 0.22 + i * (Math.PI - 0.44) / 6;
    const x = Math.round(cx + Math.cos(a) * (R - 1));
    const y = Math.round(cy + Math.sin(a) * (R - 1));
    for (let h = 1; h <= 2; h++) vox(vol, x, y - h, cz + 1, C.timber1, 0, 0.01);
    lantern(vol, x, y - 3, cz + 1, i % 2 ? C.lampWarm : C.lampCore, C.timber1, 1);
  }
  // crown ornament at the very top
  box(vol, -1, cy + R + 2, cz, 1, cy + R + 2, cz, C.brass2, 1, 0.02);
  vox(vol, 0, cy + R + 3, cz, C.goldBright, 2, 0.01);
  vox(vol, 0, cy + R + 4, cz, C.brass4, 1, 0.01);
}

function buildStarSeed(vol) {
  const ox = 0, oy = 62, oz = 9;
  for (let x = -4; x <= 4; x++) {
    for (let y = -4; y <= 4; y++) {
      for (let z = -4; z <= 4; z++) {
        const r = Math.hypot(x, y, z);
        if (r > 4.1) continue;
        if (r < 1.3) {
          vox(vol, ox + x, oy + y, oz + z, C.lampWhite, 2, 0.01);
        } else if (r > 2.9) {
          const band = Math.abs(x) < 0.8 || Math.abs(y) < 0.8 || Math.abs(z) < 0.8;
          if (band) {
            vox(vol, ox + x, oy + y, oz + z, C.brass3, 1, 0.02);
          } else if (noise2((ox + x) * 0.5, (oy + y) * 0.5, 21) > 0.35) {
            vox(vol, ox + x, oy + y, oz + z, (x + y + z) % 3 ? C.glowCyan : C.gold, 2, 0.01);
          }
        }
      }
    }
  }
  // a delicate chain back to the loom
  for (const [cx, cz] of [[-5, 5], [5, 5], [-5, 13], [5, 13]]) {
    for (let y = 64; y <= 67; y++) {
      vox(vol, cx, y, cz, C.brass2, 1, 0.01);
    }
  }
}

function buildMisc(vol) {
  // low balustrade around the loom courtyard
  railing(vol, -18, 22, 18, 22, 52);
  railing(vol, 18, 22, 18, 12, 52);

  // benches and braziers
  for (const [bx, bz] of [[-17, 5], [17, 8], [13, -12], [-13, -12]]) {
    box(vol, bx, 51, bz, bx + 3, 51, bz, C.timber2, 0, 0.03);
    box(vol, bx, 52, bz, bx, 52, bz, C.timber1, 0, 0.02);
    box(vol, bx + 3, 52, bz, bx + 3, 52, bz, C.timber1, 0, 0.02);
  }
  // standing bronze bell near the west tower
  box(vol, -21, 51, -10, -21, 56, -10, C.timber1, 0, 0.02);
  box(vol, -22, 57, -11, -20, 59, -9, C.brass2, 1, 0.02);
  vox(vol, -21, 60, -10, C.brass4, 1, 0.01);

  // stone lamp posts along the path
  for (const [lx, lz] of [[35, 28], [27, 30], [20, 22], [24, 16], [-20, 30], [-18, 22], [-38, 45]]) {
    box(vol, lx, 51, lz, lx, 53, lz, C.rock3, 0, 0.02);
    lantern(vol, lx, 54, lz, C.lampCore, C.tileLight, 1);
    vox(vol, lx, 55, lz, C.tileLight, 0, 0.02);
  }

  // giant hanging pulley above the loom (visual anchor)
  box(vol, -1, 119, -1, 1, 121, 1, C.timber1, 0, 0.02);
  box(vol, 0, 118, 0, 0, 118, 0, C.brass3, 1, 0.01);

  // mossy stone steps descending to the cloud edge
  for (let i = 0; i < 7; i++) {
    const y = 51 - i;
    for (let x = 9; x <= 14; x++) {
      for (let z = 31 + i; z <= 33 + i; z++) {
        vox(vol, x, y, z, C.stonePath, 0, 0.04);
        if (i % 3 === 0) vox(vol, x, y + 1, z, C.rock2, 0, 0.02);
      }
    }
  }
  // lanterns mark the descent
  for (let i = 0; i < 4; i++) {
    const x = 16;
    const z = 32 + i * 3;
    const y = 51 - Math.floor(i * 1.4);
    box(vol, x, y, z, x, y + 2, z, C.timber2, 0, 0.02);
    lantern(vol, x, y + 3, z, C.lampWarm, C.timber1, 1);
  }
}

export function buildArchitecture(vol) {
  buildDais(vol);
  buildLoomArch(vol);
  buildTower(vol, -35, 0, -1);
  buildTower(vol, 35, 0, 1);
  buildHall(vol);
  buildPavilion(vol);
  buildWaterCourt(vol);
  buildPaths(vol);
  buildWeavers(vol);
  buildStarSeed(vol);
  buildMisc(vol);
}
