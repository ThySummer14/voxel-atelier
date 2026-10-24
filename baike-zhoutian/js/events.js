// 五层木阁的凸轮→事件调度。事件的唯一真源是凸轮：每颗凸齿一次报时。
import { GEAR, KE, shiChen, keText } from './spec.js';

const GENG_LEN = (86400 - KE.nightStart + KE.nightEnd) / KE.gengCount;

export function buildEvents() {
  const ev = [];
  for (let k = 0; k < 100; k++)
    ev.push({ t: k * 864, layer: 0, kind: 'bell', sound: 'bell' });
  for (let h = 0; h < 24; h++) {
    const sc = shiChen(h * 3600 + 60);
    ev.push({ t: h * 3600, layer: 1, kind: 'plaque', label: sc.name, sound: 'block' });
  }
  ev.push({ t: KE.dawn, layer: 2, kind: 'dawn', label: '晨钟', sound: 'chime' });
  ev.push({ t: KE.dusk, layer: 2, kind: 'dusk', label: '暮鼓', sound: 'chime' });
  for (let g = 0; g < 5; g++)
    ev.push({ t: (KE.nightStart + g * GENG_LEN) % 86400, layer: 3, kind: 'geng', label: `${'一二三四五'[g]}更`, sound: 'drum' });
  for (let g = 0; g < 5; g++)
    for (let d = 1; d <= 4; d++)
      ev.push({
        t: (KE.nightStart + g * GENG_LEN + d * (GENG_LEN / 5)) % 86400,
        layer: 4, kind: 'dian', label: `${'一二三四五'[g]}更${'一二三四'[d - 1]}点`, sound: 'gong',
      });
  ev.sort((a, b) => a.t - b.t || a.layer - b.layer);
  for (const e of ev) e.label = e.label ?? `${ev2ke(e.t)}`;
  return ev;
}

function ev2ke(t) {
  return keText(t);
}

export function nextEventIndex(events, t) {
  let lo = 0, hi = events.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (events[m].t <= t) lo = m + 1; else hi = m; }
  return lo % events.length;
}

export function audible(events, speed) {
  if (speed <= 120) return events;
  return events.filter(e => e.kind !== 'bell');
}

export function derivePeriods() {
  const wheelRevPerDay = 86400 / GEAR.wheelPeriod;
  const scoopsPerDay = wheelRevPerDay * GEAR.wheelScoops;
  const columnRevPerDay = wheelRevPerDay * GEAR.A / GEAR.B;
  const chainRevPerDay = wheelRevPerDay * GEAR.P2 / GEAR.W;
  const bucketsPerDay = chainRevPerDay * GEAR.chainBuckets;
  return { wheelRevPerDay, scoopsPerDay, columnRevPerDay, chainRevPerDay, bucketsPerDay };
}
