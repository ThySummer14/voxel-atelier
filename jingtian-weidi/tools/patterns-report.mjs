#!/usr/bin/env node
// 花本预览：ASCII 打样 + 行内彩纬段数统计（段数决定每纬梭飞行次数，越少节奏越好）
import { buildPattern, topColor, PW, PH } from '../js/patterns.js';

const CH = {
  ivory: '·', gold: '￥', verm: '朱', azure: '青', indigo: '靛', crimson: '绛',
  azure2: '经', crimson2: '经', indigo2: '经',
  jade: '玉', moon: '星', pale: '河', silver: '★', darkgold: '＋',
};
for (let k = 0; k < 3; k++) {
  const pat = buildPattern(k);
  console.log(`\n=== ${k} ${pat.name}  地=${pat.ground} 花=${pat.motifs.join('/')} ===`);
  for (let j = 0; j < PH; j++) {
    let line = '';
    for (let i = 0; i < PW; i++) line += CH[topColor(pat, i, j)] || '?';
    const runs = pat.picks[j].runs.length;
    console.log(String(j).padStart(2) + ' ' + line + ' ' + (runs > 8 ? '!!' : '  ') + String(runs).padStart(2) + '  ' + pat.picks[j].runs.map(r=>r.c[0]+(r.i1-r.i0+1)).join(''));
  }
  const counts = pat.picks.map(p => p.runs.length);
  const hist = {};
  for (const c of counts) hist[c] = (hist[c] || 0) + 1;
  const use = {};
  for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
    const c = topColor(pat, i, j); use[c] = (use[c] || 0) + 1;
  }
  console.log('段数直方图', JSON.stringify(hist), '最大', pat.maxRuns, '总计', counts.reduce((a, b) => a + b, 0));
  console.log('用色', JSON.stringify(use));
}