import test from "node:test";
import assert from "node:assert/strict";
import { buildMeshes } from "../js/sculpt/build.js";
import { buildScene } from "../js/sculpt/scene.js";
import { buildHeightfield, topAt, slopeAt } from "../js/sculpt/terrain.js";
import { CLOUD, MATERIALS, GOLD, WALL, REDWOOD, TILE, STONE } from "../js/palette.js";
import { TEMPLES } from "../js/sculpt/score.js";

function templeSummary(grid, spec) {
  let gold = 0, walls = 0, roof = 0;
  for (let x = spec.x - spec.w - 12; x <= spec.x + spec.w + 12; x++)
    for (let z = spec.z - spec.d - 12; z <= spec.z + spec.d + 12; z++)
      for (let y = 0; y < 340; y++) {
        const m = grid.get(x, y, z);
        if (m === GOLD) gold++;
        if (m === WALL || m === REDWOOD) walls++;
        if (m === TILE || m === STONE) roof++;
      }
  return { name: spec.name, gold, walls, roof, nonEmpty: gold > 0 && walls > 0 && roof > 0 };
}

function sceneSummary(s) {
  return {
    voxels: s.grid.count, coreBlocks: s.core.size, farBlocks: s.far.size,
    wheelBlocks: s.wheel.count, cloudBlocks: s.cloud.size,
    piers: s.ctx.longBridge?.piers, deckLen: s.ctx.longBridge?.deckLen,
    far: s.ctx.far?.total, farSegments: s.ctx.far?.segments?.length,
    figures: s.ctx.pop?.figures, boats: s.ctx.pop?.boats,
  };
}

test("buildMeshes exposes populated far, wheel, spray and emissive groups", { timeout: 180000 }, () => {
  const s = buildMeshes({});
  const k = s.stats.byKind;
  assert.ok(s.stats.farBlocks > 0);
  assert.ok(k.far > 0);
  assert.equal(s.ctx.far.segments.length, 3);
  assert.ok(s.ctx.far.segments.every((band) => band.blocks > 0));
  assert.ok(s.stats.wheelBlocks > 0);
  assert.ok(k.wheel > 0);
  assert.ok("spray" in k && "emitSoft" in k && "emitCore" in k);
  assert.ok(Number.isFinite(k.spray) && Number.isFinite(k.emitSoft) && Number.isFinite(k.emitCore));
});

test("terrain probes accept fractional coordinates and clamp out-of-range queries", () => {
  buildHeightfield();
  assert.equal(topAt(-100000, 0), -1);
  assert.equal(slopeAt(-100000, 0), 0);
  assert.equal(topAt(Infinity, 0), -1);
  assert.equal(slopeAt(0, Infinity), 0);
  const top = topAt(0.9, 0.9);
  const slope = slopeAt(0.9, 0.9);
  assert.equal(Number.isInteger(top), true);
  assert.ok(Number.isFinite(slope) && slope >= 0);
});

test("cloud materials use the final dye stage", () => {
  assert.equal(MATERIALS[CLOUD].dye, 3);
});

test("same-seed scene generation is deterministic", { timeout: 180000 }, () => {
  const a = buildScene({});
  const b = buildScene({});
  assert.deepEqual(sceneSummary(a), sceneSummary(b));
});

test("real scene contains two nonempty temples, 33 piers, and life", { timeout: 180000 }, () => {
  const s = buildMeshes({});
  const templeCandidates = TEMPLES.map((spec) => templeSummary(s.grid, spec));
  const actualTemples = templeCandidates.filter((t) => t.nonEmpty);
  assert.equal(actualTemples.length, 2);
  assert.equal(s.ctx.longBridge.piers, 33);
  assert.ok(s.ctx.longBridge.deckLen > 0);
  assert.ok(Number.isFinite(s.ctx.longBridge.px));
  assert.ok(Number.isFinite(s.ctx.longBridge.py));
  assert.ok(Number.isFinite(s.ctx.longBridge.pz));
  assert.ok(s.ctx.pop.figures > 0);
  assert.ok(s.ctx.pop.boats > 0);
});
