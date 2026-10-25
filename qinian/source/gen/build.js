import { writeFileSync, mkdirSync } from 'node:fs';
import { Volume } from './volume.js';
import { NX, NY, NZ, TIERS } from './config.js';
import { buildBase, buildCourt, buildLanterns, buildCensers, buildFigures } from './site.js';
import { buildTerrace, buildPodium } from './terrace.js';
import { buildHall } from './hall.js';

const OUT = process.argv[2] || '/tmp/qn';
mkdirSync(OUT, { recursive: true });

const t0 = Date.now();
const lap = (label) => console.log(`${label.padEnd(18)} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
const vol = new Volume();
buildBase(vol); lap('base');
buildCourt(vol); lap('court');
const terr = buildTerrace(vol); lap('terrace');
buildPodium(vol); lap('podium');
buildHall(vol); lap('hall');
const censers = buildCensers(vol, TIERS);
const lanterns = buildLanterns(vol);
const figures = buildFigures(vol); lap('props');

writeFileSync(`${OUT}/volume.raw`, vol.data);
let solid = 0;
for (let i = 0; i < vol.data.length; i++) if (vol.data[i]) solid++;
console.log(JSON.stringify({ dims: [NX, NY, NZ], solid, balustrade: terr.posts, censers, lanterns, figures }));
lap('written');
