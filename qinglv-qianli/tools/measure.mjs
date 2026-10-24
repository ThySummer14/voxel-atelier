/* 真实几何量测：CPU 几何估算、JS heap/RSS、far/wheel/spray/emit 分组。
 * 用法: node tools/measure.mjs [--census]
 */
import { buildMeshes } from "../js/sculpt/build.js";
import { materialCensus } from "../js/voxel/mesh.js";
import { MATERIALS, KIND } from "../js/palette.js";

const argv = process.argv.slice(2);
const BUDGET_TRIANGLES = 3_800_000;
const PER_FACE = 4 * (12 + 3 + 3 + 2) + 6 * 4;
const t0 = Date.now();
const s = buildMeshes({});
const buildMs = Date.now() - t0;
const k = s.stats.byKind || {};
const rows = [
  ["细·哑光", k.matte], ["细·高光", k.gloss], ["细·发光", k.emit], ["细·软发光", k.emitSoft],
  ["细·发光芯", k.emitCore], ["云·粗3", k.cloud], ["瀑布", k.fall], ["飞沫", k.spray],
  ["雾", k.mist], ["远峰·粗8", k.far], ["水轮", k.wheel],
].filter(([, faces]) => Number.isFinite(faces));
const totalFaces = rows.reduce((n, [, faces]) => n + faces, 0);
const cpuTriangles = totalFaces * 2;
const memory = process.memoryUsage();
const out = {
  buildMs, voxels: s.stats.voxels, faces: totalFaces, triangles: cpuTriangles,
  triangleBudget: BUDGET_TRIANGLES,
  groups: Object.fromEntries(rows.map(([name, faces]) => [name, { faces, triangles: faces * 2, mb: +(faces * PER_FACE / 1048576).toFixed(1) }])),
  stats: { farBlocks: s.stats.farBlocks, wheelBlocks: s.stats.wheelBlocks, sprayFaces: k.spray || 0, emitFaces: (k.emit || 0) + (k.emitSoft || 0) + (k.emitCore || 0) },
  memory: { jsHeapMB: +(memory.heapUsed / 1048576).toFixed(1), rssMB: +(memory.rss / 1048576).toFixed(1), externalMB: +(memory.external / 1048576).toFixed(1) },
  pass: cpuTriangles <= BUDGET_TRIANGLES,
};
console.log(`buildMeshes ${buildMs} ms   CPU 几何 ${cpuTriangles.toLocaleString()} △（预算 ${BUDGET_TRIANGLES.toLocaleString()}）`);
console.log(`体素 ${s.stats.voxels.toLocaleString()}  岩芯 ${s.core.size.toLocaleString()}  远峰 ${s.far.size.toLocaleString()}  水轮 ${s.wheel.count.toLocaleString()}`);
console.log("\n分组             面数        三角形       几何MB");
for (const [name, faces] of rows.sort((a, b) => b[1] - a[1]))
  console.log(`${name.padEnd(14)} ${String(faces).padStart(10)} ${String(faces * 2).padStart(12)} ${(faces * PER_FACE / 1048576).toFixed(1).padStart(8)}`);
console.log(`合计             ${String(totalFaces).padStart(10)} ${String(cpuTriangles).padStart(12)} ${(totalFaces * PER_FACE / 1048576).toFixed(1).padStart(8)}`);
console.log(`JS heap ${out.memory.jsHeapMB} MB   RSS ${out.memory.rssMB} MB`);
console.log(`判定：${out.pass ? "PASS" : "FAIL"}（总三角形 ≤ ${(BUDGET_TRIANGLES / 1e6).toFixed(1)}M）`);

if (argv.includes("--census")) {
  console.log("\n体素普查（前 22）");
  for (const e of materialCensus(s.grid).slice(0, 22))
    console.log(`  ${String(e.id).padStart(3)} ${e.name.padEnd(12)} ${String(e.n).padStart(9)}`);
}
console.log(JSON.stringify(out, null, 1));
process.exitCode = out.pass ? 0 : 1;
