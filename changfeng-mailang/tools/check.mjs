// 不开浏览器，先用 node 跑一遍世界生成，检查体素规模与关键坐标的地表高度。
import { buildWorld, W, D, H, streamZ } from '../js/world.js';
import {
  buildWindmill, buildCottage, buildBarn, buildBridge, bridgeCrossing,
  buildTrees, buildFences, buildHaystacks, buildWell,
} from '../js/props.js';

const seed = Number(process.argv[2] || 20261001);
const t0 = Date.now();
const ctx = buildWorld(seed);
ctx.W = W; ctx.D = D; ctx.H = H;
console.log('地形 + 麦田:', Date.now() - t0, 'ms');

const mill = buildWindmill(ctx);
const cot = buildCottage(ctx);
const barn = buildBarn(ctx);
const cross = bridgeCrossing(ctx);
buildBridge(ctx, cross);
buildTrees(ctx);
buildFences(ctx);
buildHaystacks(ctx);
buildWell(ctx);
console.log('全部生成:', Date.now() - t0, 'ms');

let solid = 0, sway = 0;
for (let i = 0; i < ctx.world.solid.length; i++) {
  if (ctx.world.solid[i]) { solid++; if (ctx.world.sway[i]) sway++; }
}

const at = (x, z) => ctx.height[z * W + x];
console.log('体素总量:', solid.toLocaleString(), ' 其中带风摆:', sway.toLocaleString());
console.log('水面:', ctx.water.size, ' 窗玻璃:', ctx.glow.size, ' 风车叶片:', ctx.sails.size);
console.log('桥位置:', cross, ' streamZ:', streamZ(cross[0]).toFixed(1));
console.log('地表高度 —— 相机脚下(92,208):', at(92, 208), ' 风车山(152,96):', at(152, 96), mill.hub);
console.log('农舍(54,152):', at(54, 152), 'floor=', cot.floor, '烟囱', cot.chimney);
console.log('谷仓(124,116):', at(124, 116), 'floor=', barn.floor);
console.log('风车塔顶 y ≈', mill.hub[1] + 8);
console.log('前景 92,180 →', at(92, 180), ' 92,150 →', at(92, 150), ' 92,120 →', at(92, 120), ' 92,60 →', at(92, 60));
console.log('高度范围:', Math.min(...ctx.height), '→', Math.max(...ctx.height));