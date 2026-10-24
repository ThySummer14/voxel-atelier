/* Node 侧验收：D3 体量 / D5 峰高曲线 / D9 桥、寺观、村落围墙。 */
import { buildMeshes } from "../js/sculpt/build.js";
import { buildHeightfield, topAt } from "../js/sculpt/terrain.js";
import { GROUPS, WORLD, LONG_BRIDGE, VILLAGES, TEMPLES } from "../js/sculpt/score.js";
import { GOLD, WALL, REDWOOD, TILE, STONE } from "../js/palette.js";

const out = { pass: false };

function templeSummary(grid, spec) {
  let gold = 0, walls = 0, roof = 0, minY = Infinity, maxY = -Infinity;
  for (let x = spec.x - spec.w - 12; x <= spec.x + spec.w + 12; x++)
    for (let z = spec.z - spec.d - 12; z <= spec.z + spec.d + 12; z++)
      for (let y = 0; y < 340; y++) {
        const m = grid.get(x, y, z);
        if (!m) continue;
        if (m === GOLD) gold++;
        if (m === WALL || m === REDWOOD) walls++;
        if (m === TILE || m === STONE) roof++;
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
  return { name: spec.name, x: spec.x, z: spec.z, gold, walls, roof, minY, maxY, nonEmpty: gold > 0 && walls > 0 && roof > 0 };
}

try {
  const B = buildMeshes({});
  const byKind = B.stats.byKind || {};
  out.D3 = {
    voxels: B.stats.voxels,
    tris: B.stats.triangles,
    quads: B.stats.faces,
    farBlocks: B.stats.farBlocks,
    farFaces: byKind.far || 0,
    wheelBlocks: B.stats.wheelBlocks,
    wheelFaces: byKind.wheel || 0,
    triangleBudget: 3_800_000,
    passVox: B.stats.voxels >= 900_000,
    passTris: B.stats.triangles >= 1_500_000 && B.stats.triangles <= 3_800_000,
    passFar: B.stats.farBlocks > 0 && (byKind.far || 0) > 0,
    passWheel: B.stats.wheelBlocks > 0 && (byKind.wheel || 0) > 0,
  };
  out.D3.pass = out.D3.passVox && out.D3.passTris && out.D3.passFar && out.D3.passWheel;

  buildHeightfield();
  const bounds = GROUPS.map((g, i) => {
    const hi = i > 0 ? (GROUPS[i - 1].cx + g.cx) / 2 : WORLD.x1;
    const lo = i < GROUPS.length - 1 ? (GROUPS[i + 1].cx + g.cx) / 2 : WORLD.x0;
    return [Math.max(WORLD.x0, Math.round(Math.min(lo, hi))), Math.min(WORLD.x1, Math.round(Math.max(lo, hi)))];
  });
  const peaks = bounds.map(([x0, x1], i) => {
    let real = -1, bx = 0, bz = 0;
    for (let x = x0; x <= x1; x++) for (let z = WORLD.z0; z <= WORLD.z1; z++) {
      const h = topAt(x, z);
      if (h > real) { real = h; bx = x; bz = z; }
    }
    return { id: GROUPS[i].id, name: GROUPS[i].name, real, bx, bz };
  });
  const curve = peaks.map((p) => p.real);
  const maxIndex = curve.indexOf(Math.max(...curve));
  out.D5 = {
    curve, peaks,
    highestIsGroup5: maxIndex === 4,
    endsLowest: curve[0] < curve[1] && curve[6] < curve[5],
    pass: maxIndex === 4 && curve[0] < curve[1] && curve[6] < curve[5],
  };

  const L = Math.hypot(LONG_BRIDGE.x1 - LONG_BRIDGE.x0, LONG_BRIDGE.z1 - LONG_BRIDGE.z0);
  const n = LONG_BRIDGE.spans;
  const hw = Math.floor(LONG_BRIDGE.deck / 2);
  const dx = (LONG_BRIDGE.x1 - LONG_BRIDGE.x0) / L, dz = (LONG_BRIDGE.z1 - LONG_BRIDGE.z0) / L;
  let detectedPiers = 0;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const cx = LONG_BRIDGE.x0 + (LONG_BRIDGE.x1 - LONG_BRIDGE.x0) * t;
    const cz = LONG_BRIDGE.z0 + (LONG_BRIDGE.z1 - LONG_BRIDGE.z0) * t;
    let hit = false;
    for (const sv of [-hw, 0, hw]) {
      const px = Math.round(cx - dz * sv), pz = Math.round(cz + dx * sv);
      if (B.grid.has(px, 2, pz) || B.grid.has(px, 4, pz)) hit = true;
    }
    if (hit) detectedPiers++;
  }
  const templeList = TEMPLES.map((spec) => templeSummary(B.grid, spec));
  const actualTemples = templeList.filter((t) => t.nonEmpty);
  const wallish = new Set([WALL, REDWOOD, STONE, TILE]);
  let worstBins = 0, worstV = null;
  for (const v of VILLAGES) {
    const bins = new Array(72).fill(false);
    for (let x = Math.round(v.cx - v.spread - 8); x <= v.cx + v.spread + 8; x++)
      for (let z = Math.round(v.cz - v.spread - 8); z <= v.cz + v.spread + 8; z++) {
        const d = Math.hypot(x - v.cx, z - v.cz);
        if (d < v.spread + 2 || d > v.spread + 7) continue;
        let hit = false;
        for (let y = 0; y <= 8 && !hit; y++) if (wallish.has(B.grid.get(x, y, z))) hit = true;
        if (hit) bins[((Math.round(Math.atan2(z - v.cz, x - v.cx) / (Math.PI * 2) * 72) % 72) + 72) % 72] = true;
      }
    const filled = bins.filter(Boolean).length;
    if (filled > worstBins) { worstBins = filled; worstV = `${v.cx},${v.cz}`; }
  }
  const actualTempleCount = actualTemples.length;
  out.D9 = {
    spans: n,
    ctx: {
      longBridge: {
        piers: B.ctx.longBridge?.piers,
        deckLen: B.ctx.longBridge?.deckLen,
        pavilion: { x: B.ctx.longBridge?.px, y: B.ctx.longBridge?.py, z: B.ctx.longBridge?.pz },
      },
      temples: actualTemples,
    },
    ctxLongBridge: {
      piers: B.ctx.longBridge?.piers,
      deckLen: B.ctx.longBridge?.deckLen,
      pavilion: { x: B.ctx.longBridge?.px, y: B.ctx.longBridge?.py, z: B.ctx.longBridge?.pz },
    },
    detectedPiers,
    piersPass: B.ctx.longBridge?.piers === n + 1 && detectedPiers === n + 1,
    templeCandidates: templeList,
    actualTemples: actualTemples.length,
    actualTempleSummaries: actualTemples,
    templesPass: actualTempleCount === 2,
    worstWallBins: worstBins, of: 72, at: worstV, wallsPass: worstBins < 40,
  };
  out.D9.pass = out.D9.piersPass && out.D9.templesPass && out.D9.wallsPass;
  out.pass = out.D3.pass && out.D5.pass && out.D9.pass;
} catch (error) {
  out.fatal = String(error?.stack || error);
}

console.log(JSON.stringify(out, null, 1));
process.exitCode = out.pass ? 0 : 1;
