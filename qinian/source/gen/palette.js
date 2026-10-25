// Palette index 0 is air. Colours are sRGB hex; material ids are interpreted by the viewer shader.
// mat: 0 matte · 1 marble · 2 lacquer · 3 glazed tile · 4 gold · 5 bronze · 6 lamp · 7 foliage · 8 dim interior · 9 paint
// nz: per-voxel brightness jitter (0–1) · sn: receives snow on up-facing faces · em: night emission

const defs = [
  // marble & stone
  ['marble', '#e1dacb', 1, 0.05, 1],
  ['marbleLight', '#ebe6da', 1, 0.04, 1],
  ['marbleShade', '#d7cfbe', 1, 0.05, 1],
  ['marbleAged', '#cbc2ae', 1, 0.06, 1],
  ['marbleJoint', '#b9af9a', 1, 0.04, 1],
  ['marbleRelief', '#ddd5c4', 1, 0.07, 1],
  ['qingbai', '#c4c7c1', 1, 0.05, 1],
  ['qingbaiDark', '#aeb2ab', 1, 0.05, 1],
  ['aiye', '#7b8277', 0, 0.06, 0],
  ['aiyeDark', '#6c7268', 0, 0.06, 0],
  ['dragonStone', '#c3bcac', 1, 0.05, 0],
  ['dragonVein', '#4d4741', 1, 0.05, 0],
  // pavements
  ['jinzhuan', '#86837b', 0, 0.06, 1],
  ['jinzhuanB', '#8e8b82', 0, 0.06, 1],
  ['jinzhuanJoint', '#6c6a63', 0, 0.04, 1],
  ['brick', '#9c968b', 0, 0.06, 1],
  ['brickB', '#a69f93', 0, 0.06, 1],
  ['brickJoint', '#857f75', 0, 0.04, 1],
  ['yard', '#b8b0a2', 0, 0.06, 1],
  ['yardB', '#aea697', 0, 0.06, 1],
  ['yardJoint', '#8e877b', 0, 0.04, 1],
  ['path', '#d6cfc0', 1, 0.05, 1],
  ['pathEdge', '#c2baa9', 1, 0.05, 1],
  // diorama block
  ['wallBrick', '#77736b', 0, 0.08, 0],
  ['wallBrickB', '#6c6861', 0, 0.08, 0],
  ['wallMortar', '#9b968c', 0, 0.04, 0],
  ['coping', '#b3ac9d', 1, 0.05, 1],
  ['plinth', '#2b2824', 0, 0.03, 0],
  ['plinthLine', '#a58d5a', 4, 0.02, 0],
  // lacquer & woodwork
  ['red', '#9e2a1f', 2, 0.04, 0],
  ['redDark', '#7c2119', 2, 0.04, 0],
  ['redBright', '#b33626', 2, 0.04, 0],
  ['latticeBar', '#b07a3c', 2, 0.05, 0],
  ['latticeHole', '#3e1a12', 8, 0.03, 0],
  ['gold', '#d6ae4c', 4, 0.04, 0],
  ['goldDim', '#b58d34', 4, 0.05, 0],
  ['goldPale', '#e6c66e', 4, 0.03, 0],
  // painted beams (龙凤和玺)
  ['qing', '#2a58ac', 9, 0.03, 0],
  ['qingLight', '#7ca8d8', 9, 0.03, 0],
  ['qingDeep', '#1b3a78', 9, 0.03, 0],
  ['lv', '#23907a', 9, 0.03, 0],
  ['lvLight', '#80cab2', 9, 0.03, 0],
  ['lvDeep', '#155f50', 9, 0.03, 0],
  ['zhu', '#b23a2b', 9, 0.04, 0],
  ['zhuDeep', '#8f2a20', 9, 0.04, 0],
  ['white', '#e9ecea', 9, 0.03, 0],
  ['structure', '#3a2b24', 8, 0.04, 0],
  ['gongPanel', '#5a1a13', 9, 0.03, 0],
  ['plaqueBlue', '#2238a8', 9, 0.02, 0],
  ['plaqueBlueDeep', '#17267a', 9, 0.02, 0],
  // glazed tiles
  ['tile', '#1e253c', 3, 0.035, 1],
  ['tileRoll', '#2a3453', 3, 0.035, 0],
  ['tileDeep', '#151a2b', 3, 0.03, 1],
  ['tileEdge', '#1b2238', 3, 0.03, 1],
  ['ridge', '#1c2540', 3, 0.05, 1],
  ['ridgeLight', '#283458', 3, 0.05, 1],
  // bronze & lamps
  ['bronze', '#3a332c', 5, 0.04, 1],
  ['bronzeGreen', '#4f5c4b', 5, 0.06, 1],
  ['bronzeLight', '#4d4236', 5, 0.03, 1],
  ['iron', '#3a3733', 5, 0.06, 1],
  ['lampRed', '#b02d24', 2, 0.04, 1],
  ['lampGlow', '#f2c477', 6, 0.02, 0],
  ['lampPole', '#8d281f', 2, 0.04, 1],
  // foliage
  ['cypress', '#2f4a35', 7, 0.12, 1],
  ['cypressB', '#3b5a3f', 7, 0.12, 1],
  ['cypressC', '#24392b', 7, 0.1, 1],
  ['bark', '#5a4636', 0, 0.1, 0],
  // scale figures
  ['figSkin', '#c99b78', 0, 0.03, 0],
  ['figHair', '#231d18', 0, 0.03, 0],
  ['trousers', '#2b2c31', 0, 0.04, 0],
  ['coatNavy', '#2f3752', 0, 0.04, 0],
  ['coatGrey', '#55524e', 0, 0.04, 0],
  ['coatRed', '#9a302a', 0, 0.04, 0],
  ['coatCamel', '#9a7a55', 0, 0.04, 0],
  ['coatWhite', '#d6d2ca', 0, 0.03, 0],
  // interior
  ['screen', '#3b2a20', 2, 0.05, 0],
  ['ceilingGreen', '#24806a', 9, 0.05, 0],
  ['ceilingBlue', '#284c92', 9, 0.05, 0],
  ['candle', '#f6d48c', 6, 0.02, 0],
];

export const P = {};
export const PALETTE = [{ name: 'air', hex: '#000000', mat: 0, nz: 0, sn: 0 }];
for (const [name, hex, mat, nz, sn] of defs) {
  P[name] = PALETTE.length;
  PALETTE.push({ name, hex, mat, nz, sn });
}
if (PALETTE.length > 255) throw new Error('palette overflow');
