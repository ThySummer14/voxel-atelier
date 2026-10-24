// 投影 + 地形遮挡，供取景工具与搜索脚本共用。
import { SITE, PATH, streamZ, buildWorld, W as WW, D as DD } from '../js/world.js';

const world = buildWorld();
export const hAt = (x, z) =>
  world.height[Math.max(0, Math.min(DD - 1, Math.round(z))) * WW + Math.max(0, Math.min(WW - 1, Math.round(x)))];

export const SUN_EL = Number(process.env.SUNEL || 12);
export const SUN_AZ = Number(process.env.SUNAZ || 6.5);   // 正北为 0，向西为正
export const SUN = (() => {
  const r = SUN_EL * Math.PI / 180, a = SUN_AZ * Math.PI / 180;
  return [-Math.sin(a) * Math.cos(r), Math.sin(r), -Math.cos(a) * Math.cos(r)];
})();

export const ASPECT = 1.6;

export function makeProjector(pos, target, fov) {
  let f = [target[0] - pos[0], target[1] - pos[1], target[2] - pos[2]];
  const fl = Math.hypot(...f); f = f.map((n) => n / fl);
  let r = [-f[2], 0, f[0]];
  const rl = Math.hypot(...r); r = r.map((n) => n / rl);
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const tanV = Math.tan((fov * Math.PI / 180) / 2);
  const tanH = tanV * ASPECT;
  return (p) => {
    const d = [p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]];
    const z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
    const x = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
    const y = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
    return { x: x / (z * tanH) * 0.5 + 0.5, y: 0.5 - y / (z * tanV) * 0.5, dist: z };
  };
}

export function occluded(from, to) {
  const n = 260;
  for (let i = 6; i < n; i++) {
    const t = i / n;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;
    const z = from[2] + (to[2] - from[2]) * t;
    if (hAt(x, z) > y + 0.5) return t;
  }
  return 0;
}

export function landmarks() {
  const [mx, mz] = SITE.mill, [cx, cz] = SITE.cottage, [bx, bz] = SITE.barn;
  let br = [109, 136];
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i], [bx2, bz2] = PATH[i + 1];
    const s0 = az - streamZ(ax), s1 = bz2 - streamZ(bx2);
    if (s0 * s1 <= 0) { const t = s0 / (s0 - s1); br = [Math.round(ax + (bx2 - ax) * t), Math.round(az + (bz2 - az) * t)]; break; }
  }
  return {
    '风车轮毂': [mx, 57, mz + 6],
    '风车帆顶': [mx, 78, mz + 6],
    '风车帆右': [mx + 21, 57, mz + 6],
    '风车帆左': [mx - 21, 57, mz + 6],
    '风车台地': [mx, 34, mz + 4],
    '农舍屋顶': [cx, 44, cz],
    '农舍左墙': [cx - 10, 26, cz],
    '农舍右墙': [cx + 10, 26, cz],
    '谷仓顶': [bx, 44, bz],
    '小桥': [br[0], 10, br[1]],
    '太阳': [0, 0, 0],
  };
}