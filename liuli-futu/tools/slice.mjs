import { buildScene } from "../js/sculpt/scene.js";
import { MATERIALS } from "../js/palette.js";
import { TOWER_Y0 } from "../js/sculpt/scene.js";
const Y = parseInt(process.argv[2] || "45", 10);
const { grid } = buildScene({ terrace: false, rock: false, courtyard: false, clouds: false, wisps: false, mountains: false });
const R = 50;
let out = `y=${Y}\n`;
for (let z = -R; z <= R; z++) {
  let line = "";
  for (let x = -R; x <= R; x++) {
    const m = grid.get(x, Y, z);
    line += m ? (MATERIALS[m].name[0] === "G" ? "o" : "#") : ".";
  }
  out += line + "\n";
}
console.log(out);
const census = {};
for (let y = TOWER_Y0; y < TOWER_Y0 + 30; y++) {
  let n = 0; grid.forEachVoxel((x, yy, z) => { if (yy === y) n++; });
  census[y] = n;
}
console.log(JSON.stringify(census));
