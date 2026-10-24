/* 量测：高度场 → 雕刻 → 统计，并同步实际网格分组。 */
import { GROUPS, WORLD } from "../js/sculpt/score.js";
import { buildHeightfield, topAt, slopeAt, carve, CORE, CFG } from "../js/sculpt/terrain.js";
import { Grid } from "../js/voxel/core.js";
import { BlockField } from "../js/voxel/blocks.js";
import { buildMeshes } from "../js/sculpt/build.js";

const argv = process.argv.slice(2);
const TRIANGLE_BUDGET = 3_800_000;
const BOUNDS = GROUPS.map((g, i) => {
  const hi = i > 0 ? (GROUPS[i - 1].cx + g.cx) / 2 : WORLD.x1;
  const lo = i < GROUPS.length - 1 ? (GROUPS[i + 1].cx + g.cx) / 2 : WORLD.x0;
  return [Math.max(WORLD.x0, Math.round(Math.min(lo, hi))), Math.min(WORLD.x1, Math.round(Math.max(lo, hi)))];
});

function scan() {
  let land = 0, sumH = 0, sumS = 0, maxH = -1, mx = 0, mz = 0;
  const per = BOUNDS.map(() => ({ real: -1, bx: 0, bz: 0, n: 0, sum: 0 }));
  for (let x = WORLD.x0; x <= WORLD.x1; x++) for (let z = WORLD.z0; z <= WORLD.z1; z++) {
    const h = topAt(x, z);
    if (h < 0) continue;
    land++; sumH += h; sumS += slopeAt(x, z);
    if (h > maxH) { maxH = h; mx = x; mz = z; }
    const gi = BOUNDS.findIndex(([x0, x1]) => x >= x0 && x <= x1);
    if (gi >= 0) { per[gi].n++; per[gi].sum += h; if (h > per[gi].real) { per[gi].real = h; per[gi].bx = x; per[gi].bz = z; } }
  }
  return { land, sumH, sumS, maxH, mx, mz, per };
}

function report(tag, doCarve) {
  const t = Date.now();
  buildHeightfield();
  const hfMs = Date.now() - t;
  const s = scan();
  const m = s.per.map((p) => p.real);
  const maxIndex = m.indexOf(Math.max(...m));
  const worldArea = (WORLD.x1 - WORLD.x0 + 1) * (WORLD.z1 - WORLD.z0 + 1);
  console.log(`\n===== ${tag} =====`);
  console.log(`高度场 ${hfMs} ms   陆格 ${s.land.toLocaleString()} / ${worldArea.toLocaleString()} (${(100 * s.land / worldArea).toFixed(1)}%)`);
  console.log(`平均高 ${(s.sumH / s.land).toFixed(1)}   平均坡 ${(s.sumS / s.land / 60).toFixed(2)}   全卷最高 ${s.maxH} @(${s.mx},${s.mz})`);
  console.log(`海拔曲线 ${m.join(" → ")}`);
  console.log(`D5-a 最高组 = 第 ${maxIndex + 1} 组：${maxIndex === 4 ? "PASS" : "FAIL"}`);
  console.log(`D5-b 首尾为全卷最低：${m[0] < m[1] && m[6] < m[5] ? "PASS" : "FAIL"}`);
  for (let i = 0; i < GROUPS.length; i++) {
    const p = s.per[i];
    console.log(`   组${GROUPS[i].id} ${GROUPS[i].name.padEnd(3, "　")} 峰 ${String(p.real).padStart(4)} @(${p.bx},${p.bz}) 陆格 ${p.n}`);
  }
  if (!doCarve) return;
  const g = new Grid();
  const core = new BlockField(CORE);
  const t2 = Date.now();
  carve(g, core);
  const vol = g.count + core.size * CORE ** 3;
  const estFaces = Math.round(g.count * 1.25 + core.size * 0.32);
  console.log(`雕刻 ${Date.now() - t2} ms   细格 ${g.count.toLocaleString()}   岩芯块 ${core.size.toLocaleString()}   实心体积 ${vol.toLocaleString()}`);
  console.log(`高度场几何估算 ~${estFaces.toLocaleString()} △面 = ${(estFaces * 2 / 1e6).toFixed(2)}M 三角`);
}

if (argv.includes("--sweep")) {
  for (const r of [1.0, 0.88, 0.78, 0.68, 0.60, 0.52]) { CFG.rMul = r; report(`rMul ${r.toFixed(2)}`, true); }
} else {
  report(`rMul ${CFG.rMul.toFixed(2)}`, argv.includes("--carve"));
}

CFG.rMul = 1.08;
const mesh = buildMeshes({});
const byKind = mesh.stats.byKind;
console.log(`\n实际网格分组：far ${byKind.far || 0} 面 / ${mesh.stats.farBlocks || 0} 块，wheel ${byKind.wheel || 0} 面 / ${mesh.stats.wheelBlocks || 0} 块，spray ${byKind.spray || 0} 面，emit ${(byKind.emit || 0) + (byKind.emitSoft || 0) + (byKind.emitCore || 0)} 面`);
console.log(`总三角形 ${mesh.stats.triangles.toLocaleString()} / 预算 ${TRIANGLE_BUDGET.toLocaleString()}：${mesh.stats.triangles <= TRIANGLE_BUDGET ? "PASS" : "FAIL"}`);
process.exitCode = mesh.stats.triangles <= TRIANGLE_BUDGET ? 0 : 1;
