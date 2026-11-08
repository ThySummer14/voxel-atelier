import { buildLander } from './lander.mjs';
import { buildTerrain } from './terrain.mjs';
import { buildExpedition } from './expedition.mjs';
import { stamp, Volume } from './voxels.mjs';

export function buildWorld() {
  const terrain = buildTerrain();
  const hardware = new Volume();
  stamp(hardware, buildLander(), -25, 0, -15);
  buildExpedition(hardware);
  const scene = new Volume();
  scene.data.set(terrain.data);
  hardware.forEach((x, y, z, color, i) => { scene.data[i] = color; });
  return { scene, terrain, hardware };
}
