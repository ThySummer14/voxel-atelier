// 编织引擎（纯逻辑，浏览器与离线光栅器共用同一份采样）：
// 一个 function 把 (花本, 时钟) 映射成整台机器的姿态——提综、开口、梭位、棚内纬线、筘角、
// 花本带位移、卷轴转角、布面行数、线团余量、落机动画。所有断言都打在这一层。
import { PH, PW } from './patterns.js';
import { TIMING, LOOM, TAPE, SHUTTLES, WARP, warpX, slotHome } from './spec.js';

export { warpX, slotHome };

const flyT = (cells) => Math.max(TIMING.minFly, TIMING.flyBase + cells * TIMING.flyPerCell);

// 每纬：地梭一整趟 + 各彩纬段（就近出发、原路回位）
export function makeSchedule(pat) {
  const picks = [];
  let t = 0;
  const slotOf = (color) => {
    const order = [pat.ground, ...pat.motifs];
    const k = order.indexOf(color);
    return k < 0 ? order.length : k;      // 未列色（不该出现）→ 借末位梭
  };
  for (let j = 0; j < PH; j++) {
    const p = pat.picks[j];
    const t0 = t;
    const liftEnd = t + TIMING.lift;
    t = liftEnd;
    const flights = [];
    const dirG = (j % 2 === 0) ? 1 : -1;
    flights.push({
      slot: slotOf(pat.ground), kind: 'ground', c: pat.ground, i0: 0, i1: PW - 1, dir: dirG,
      t0: t, carry: j === 0 ? TIMING.carry : 0.02, out: flyT(PW), hold: true,
    });
    t += flights[0].carry + flights[0].out;
    for (const r of p.runs) {
      const slots = slotOf(r.c);
      const mid = (r.i0 + r.i1) / 2;
      const dir = mid < (PW - 1) / 2 ? 1 : -1;
      const out = flyT(r.i1 - r.i0 + 1);
      const f = { slot: slots, kind: 'motif', c: r.c, i0: r.i0, i1: r.i1, dir, t0: t, carry: TIMING.carry, out, back: out * TIMING.flyBack, home: TIMING.home };
      f.dur = f.carry + f.out + f.back + f.home;
      flights.push(f);
      t += f.dur;
    }
    const beatT0 = t;
    t += TIMING.beat;
    const advT0 = t;
    t += TIMING.advance;
    const restT0 = t;
    t += TIMING.rest;
    const ground = flights[0];
    ground.dur = ground.carry + ground.out;
    picks.push({
      j, t0, dur: t - t0, liftEnd, flights, beatT0, advT0, restT0,
      end: t,
      groundSpan: p.groundSpan,
      lift: pat.liftSets[j],
    });
  }
  const total = t;
  return {
    pat, picks, total,
    completeEnd: total + TIMING.completeHold,
    unloadEnd: total + TIMING.completeHold + TIMING.unload,
    duration: total + TIMING.completeHold + TIMING.unload,
  };
}

export function pickIndexAt(sched, clock) {
  const c = Math.max(0, Math.min(sched.total - 1e-6, clock));
  let lo = 0, hi = sched.picks.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sched.picks[mid].end <= c) lo = mid + 1; else hi = mid;
  }
  return lo;
}

const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);

// 单纬内的姿态
function pickFrame(sched, j, clock) {
  const p = sched.picks[j];
  const pat = sched.pat;
  const prevLift = j > 0 ? sched.picks[j - 1].lift : null;
  const lift = p.lift;
  const openness = new Float32Array(PW);
  let phase, phaseT = 0;
  let shuttle = null;
  let weftZ = LOOM.runZ, weftY = LOOM.warpY + 1;
  let reed = 0;
  let rowsPlaced = j, clothShift = j, tapeShift = j;
  let shedOpen = 1;
  const laid = [];                        // 本纬已落下的彩纬段（覆盖序）
  laid.push({ c: pat.ground, i0: 0, i1: PW - 1 });
  let weftHidden = false;
  let curFlight = null;

  if (clock < p.liftEnd) {                // 开口：换综
    phase = 'lift';
    phaseT = (clock - p.t0) / TIMING.lift;
    const m = ease(phaseT);
    for (let i = 0; i < PW; i++) {
      const a = prevLift ? (prevLift.includes(i) ? 1 : 0) : 0;
      const b = lift.includes(i) ? 1 : 0;
      openness[i] = a + (b - a) * m;
    }
    shedOpen = 1;
  } else {
    shedOpen = 1;
    for (const i of lift) openness[i] = 1;
    phase = 'fly';
    let cursor = p.liftEnd;
    let done = true;
    for (let fi = 0; fi < p.flights.length; fi++) {
      const f = p.flights[fi];
      const fEnd = f.kind === 'ground' ? f.t0 + f.dur : f.t0 + f.dur;
      if (clock < fEnd && done) {
        done = false;
        phase = 'fly';
        curFlight = { i: fi, slot: f.slot, kind: f.kind, carrying: false };
        const local = clock - f.t0;
        const x0 = warpX(f.i0) + (f.dir > 0 ? -4 : 2);
        const x1 = warpX(f.i1) + (f.dir > 0 ? 2 : -4);
        const home = slotHome(f.slot);
        const inZ = LOOM.runZ, inY = LOOM.warpY + 2;
        if (f.kind === 'ground') {
          const tc = Math.min(1, local / f.carry);
          if (tc < 1) {
            shuttle = { slot: f.slot, pos: [home[0] + (x0 - home[0]) * tc, home[1] + (inY - home[1]) * tc, home[2] + (inZ - home[2]) * tc], carrying: false };
          } else {
            const t2 = (local - f.carry) / f.out;
            const x = x0 + (x1 - x0) * t2;
            shuttle = { slot: f.slot, pos: [x, inY, inZ], carrying: true };
            weftZ = inZ; weftY = inY;
          }
        } else {
          const tc = Math.min(1, local / f.carry);
          const to = f.carry + f.out, tb = to + f.back;
          if (tc < 1) {
            shuttle = { slot: f.slot, pos: [home[0] + (x0 - home[0]) * tc, home[1] + (inY - home[1]) * tc, home[2] + (inZ - home[2]) * tc], carrying: false };
          } else if (local < to) {
            const t2 = (local - f.carry) / f.out;
            const x = x0 + (x1 - x0) * t2;
            shuttle = { slot: f.slot, pos: [x, inY, inZ], carrying: true };
            weftZ = inZ; weftY = inY;
          } else if (local < tb) {
            const t2 = (local - to) / f.back;
            shuttle = { slot: f.slot, pos: [x1 + (x0 - x1) * t2, inY + 2 * Math.sin(Math.PI * t2), inZ], carrying: false };
          } else {
            const t2 = Math.min(1, (local - tb) / f.home);
            shuttle = { slot: f.slot, pos: [x0 + (home[0] - x0) * t2, inY + (home[1] - inY) * t2, inZ + (home[2] - inZ) * t2], carrying: false };
          }
        }
      }
      if (clock >= fEnd) {
        curFlight = null;
        if (f.kind === 'motif') {
          for (const s of laid) if (s.c === f.c && s.motif) { s.i0 = Math.min(s.i0, f.i0); s.i1 = Math.max(s.i1, f.i1); }
          laid.push({ c: f.c, i0: f.i0, i1: f.i1, motif: true });
        }
      } else break;
      cursor = fEnd;
    }
    // 打纬
    if (clock >= p.beatT0) {
      phase = 'beat';
      const b = (clock - p.beatT0) / TIMING.beat;
      phaseT = b;
      reed = ease(Math.min(1, b * 1.25));
      shedOpen = 1 - ease(Math.max(0, (b - 0.25) / 0.75));
      for (let i = 0; i < PW; i++) openness[i] *= shedOpen;
      weftZ = LOOM.runZ + (LOOM.fellZ - LOOM.runZ) * ease(b);
      weftY = LOOM.warpY + 1 - ease(b);
      if (clock >= p.advT0) {
        phase = 'advance';
        const a = (clock - p.advT0) / TIMING.advance;
        phaseT = a;
        reed = 1 - ease(a);
        shedOpen = 0;
        for (let i = 0; i < PW; i++) openness[i] = 0;
        rowsPlaced = j + 1;
        clothShift = j + ease(a);
        tapeShift = j + ease(a);
        weftZ = LOOM.fellZ; weftY = LOOM.warpY;
        if (clock >= p.restT0) { phase = 'rest'; phaseT = (clock - p.restT0) / TIMING.rest; rowsPlaced = j + 1; clothShift = j + 1; tapeShift = j + 1; }
      }
    }
  }
  // 棚内尚未打进织口的纬线：按覆盖序压平成长条
  const strips = [];
  if (phase === 'fly' || phase === 'lift') {
    const cov = [];
    for (let i = 0; i < PW; i++) cov[i] = null;
    for (const s of laid) for (let i = s.i0; i <= s.i1; i++) cov[i] = s.c;
    let i = 0;
    while (i < PW) {
      const c = cov[i];
      let k = i;
      while (k + 1 < PW && cov[k + 1] === c) k++;
      strips.push({ c, i0: i, i1: k });
      i = k + 1;
    }
    weftHidden = false;
  } else if (phase === 'beat') {
    let i = 0;
    while (i < PW) {
      const c = pat.cells[j][i] === null ? pat.ground : pat.cells[j][i];
      let k = i;
      const same = (idx) => (pat.cells[j][idx] === null ? pat.ground : pat.cells[j][idx]) === c;
      while (k + 1 < PW && same(k + 1)) k++;
      strips.push({ c, i0: i, i1: k });
      i = k + 1;
    }
  } else weftHidden = true;

  return { phase, phaseT, j, openness, shuttle, flight: curFlight, strips, weftHidden, weftZ, weftY, reed, rowsPlaced, clothShift, tapeShift };
}

export function sampleFrame(sched, clock) {
  const t = Math.max(0, clock);
  if (t < sched.total) {
    const j = pickIndexAt(sched, t);
    const f = pickFrame(sched, j, t);
    return {
      status: 'weaving', t, pick: j,
      rollAngle: (f.tapeShift / TAPE.rollR), warpBeamAngle: f.clothShift / LOOM.warpBeam.r,
      clothBeamAngle: f.clothShift / LOOM.clothBeam.r,
      bobbinUse: bobbinUse(sched, f),
      panel: null,
      ...f,
    };
  }
  if (t < sched.completeEnd) {
    return {
      status: 'complete', t, pick: PH - 1, phase: 'hold', phaseT: (t - sched.total) / TIMING.completeHold,
      openness: new Float32Array(PW), shuttle: null, strips: [], weftHidden: true,
      weftZ: LOOM.fellZ, weftY: LOOM.warpY, reed: 0, rowsPlaced: PH, clothShift: PH, tapeShift: PH,
      rollAngle: PH / TAPE.rollR * 0 + (PH - 1) / TAPE.rollR, warpBeamAngle: PH / LOOM.warpBeam.r,
      clothBeamAngle: PH / LOOM.clothBeam.r,
      bobbinUse: fullUse(sched), panel: null,
    };
  }
  const u = Math.min(1, (t - sched.completeEnd) / TIMING.unload);
  return {
    status: 'unload', t, pick: PH - 1, phase: 'unload', phaseT: u,
    openness: new Float32Array(PW), shuttle: null, strips: [], weftHidden: true,
    weftZ: LOOM.fellZ, weftY: LOOM.warpY, reed: 0, rowsPlaced: PH, clothShift: PH, tapeShift: PH,
    rollAngle: PH / TAPE.rollR, warpBeamAngle: PH / LOOM.warpBeam.r, clothBeamAngle: PH / LOOM.clothBeam.r,
    bobbinUse: fullUse(sched), panel: { progress: u },
  };
}

function bobbinUse(sched, f) {
  const use = new Array(5).fill(0);
  const pat = sched.pat;
  const upto = f.rowsPlaced;
  const order = [pat.ground, ...pat.motifs];
  for (let j = 0; j < upto; j++) {
    for (let i = 0; i < PW; i++) {
      const c = pat.cells[j][i] === null ? pat.ground : pat.cells[j][i];
      const k = order.indexOf(c);
      if (k >= 0) use[k]++;
    }
  }
  return use.map((n, k) => n / Math.max(1, colorTotal(sched, k)));
}
function colorTotal(sched, k) {
  const pat = sched.pat;
  const order = [pat.ground, ...pat.motifs];
  let n = 0;
  for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
    const c = pat.cells[j][i] === null ? pat.ground : pat.cells[j][i];
    if (order.indexOf(c) === k) n++;
  }
  return n;
}
function fullUse(sched) { return [0, 1, 2, 3, 4].map(k => colorTotal(sched, k) > 0 ? 1 : 0); }