// 运动学：t（模拟秒）→ 各活动部件的位姿。键名必须与 PARTS[].key 完全一致。
import { L } from './spec.js';
import { bucketPath } from './mech.js';

const AXU = (() => {
  const a = L.arm.axis;
  const m = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / m, a[1] / m, a[2] / m];
})();

export const STEP = 1200;

function smooth(u) {
  const x = Math.max(0, Math.min(1, u));
  return x * x * (3 - 2 * x);
}

export function wheelAngle(t) {
  const k = Math.floor(t / STEP);
  const frac = t / STEP - k;
  const turn = frac < 0.94 ? 0 : smooth((frac - 0.94) / 0.06);
  return (k + turn) * 2 * Math.PI / L.wheel.scoops;
}

export function scoopFill(t) {
  const frac = (t / STEP) - Math.floor(t / STEP);
  return Math.max(0, Math.min(4, Math.floor(frac * 5.4)));
}

export function wheelStepIndex(t) {
  return Math.floor(t / STEP);
}

export function chainSpeed() {
  const c = L.chain;
  const per = 2 * (c.top[1] - c.bottom[1] + Math.PI * c.bucketOffset);
  return 4 * per / 86400;
}

export function leverAngle(t) {
  const frac = (t / STEP) - Math.floor(t / STEP);
  const tremble = 0.012 * Math.sin(t / 140 * Math.PI * 2);
  if (frac < 0.94) return tremble;
  const u = (frac - 0.94) / 0.06;
  return tremble - 0.16 * Math.sin(u * Math.PI);
}

export function pose(t, opts = {}) {
  const ext = opts.ext || [0, 0, 0, 0, 0];
  const doors = opts.doors || [0, 0, 0, 0, 0];
  const dayAng = 2 * Math.PI * (t / 86400);
  const wAng = wheelAngle(t);
  const cAng = chainSpeed() * t;
  const c = L.chain;
  const per = 2 * (c.top[1] - c.bottom[1] + Math.PI * c.bucketOffset);
  const out = {};
  out.wheel = { rot: { axis: [0, 0, 1], center: [L.wheel.cx, L.wheel.cy, L.wheel.cz], angle: wAng } };
  out.scoopWater = { rot: { axis: [0, 0, 1], center: [L.wheel.cx, L.wheel.cy, L.wheel.cz], angle: wAng } };
  out.column = { rot: { axis: [0, 1, 0], center: [0, 0, 0], angle: -dayAng } };
  out.globe = { rot: { axis: AXU, center: L.globe.c, angle: dayAng } };
  out.sanchen = { rot: { axis: AXU, center: L.arm.ringC, angle: dayAng } };
  out.siyou = { rot: { axis: AXU, center: L.arm.ringC, angle: dayAng + 0.31 } };
  out.lever = { rot: { axis: [0, 0, 1], center: L.lever.pivot, angle: leverAngle(t) } };
  out.chainWheel1 = { rot: { axis: [0, 0, 1], center: [c.bottom[0], c.bottom[1], c.bottom[2]], angle: -cAng } };
  out.chainWheel2 = { rot: { axis: [0, 0, 1], center: [c.top[0], c.top[1], c.top[2]], angle: cAng } };
  for (let i = 0; i < 5; i++) {
    out['slider' + i] = { pos: [0, 0, ext[i] * 6] };
    out['door' + i] = { pos: [0, doors[i] * 6, 0] };
  }
  for (let i = 0; i < c.buckets; i++) {
    const pt = bucketPath(i / c.buckets * per + cAng);
    out['bucket' + i] = { pos: [Math.round(pt[0]), Math.round(pt[1]), Math.round(pt[2])] };
  }
  return out;
}

export function allFinite(t, opts) {
  const p = pose(t, opts);
  for (const [k, v] of Object.entries(p)) {
    if (v.rot) {
      for (const a of [v.rot.axis, v.rot.center]) {
        if (!a.every(Number.isFinite)) return `${k}.rot`;
      }
      if (!Number.isFinite(v.rot.angle)) return `${k}.angle`;
    }
    if (v.pos && !v.pos.every(Number.isFinite)) return `${k}.pos`;
  }
  return null;
}
