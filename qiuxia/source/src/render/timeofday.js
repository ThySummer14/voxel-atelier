// Art-directed day/night parameter stops, sampled by hour.

import { clamp, lerp } from '../core/rng.js';

const C = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];

// skyTop / skyMid / skyHorizon / sun / hemiSky / hemiGround / fog
const STOPS = [
  { h: 0.0, top: C(0x05070f), mid: C(0x0a1020), hor: C(0x141c30), sun: C(0x9ab0d8), sunI: 0.0, moonI: 0.5, hs: C(0x1a2440), hg: C(0x0d1118), hi: 0.30, fog: C(0x0a0f1a), fd: 0.0035, lamp: 1, star: 1, exp: 1.0 },
  { h: 4.6, top: C(0x0a1020), mid: C(0x1a2440), hor: C(0x3a3a55), sun: C(0xb0a0c0), sunI: 0.0, moonI: 0.35, hs: C(0x243050), hg: C(0x141820), hi: 0.34, fog: C(0x141a2a), fd: 0.0042, lamp: 1, star: 0.7, exp: 1.0 },
  { h: 6.2, top: C(0x2a3a60), mid: C(0x7a6a80), hor: C(0xff9a50), sun: C(0xff8a40), sunI: 1.1, moonI: 0.0, hs: C(0x8090b0), hg: C(0x5a4a3a), hi: 0.5, fog: C(0xc08060), fd: 0.0045, lamp: 0.7, star: 0.1, exp: 1.02 },
  { h: 8.0, top: C(0x4a7ab0), mid: C(0x8ab0d0), hor: C(0xd8d8c8), sun: C(0xffe0b0), sunI: 2.3, moonI: 0.0, hs: C(0xbcd3e8), hg: C(0x8a7a5e), hi: 0.6, fog: C(0xc8d0d4), fd: 0.0022, lamp: 0.0, star: 0, exp: 1.05 },
  { h: 12.5, top: C(0x3a72b8), mid: C(0x7aa8d8), hor: C(0xc8d8e0), sun: C(0xfff2dd), sunI: 2.8, moonI: 0.0, hs: C(0xbcd3e8), hg: C(0x8a7a5e), hi: 0.65, fog: C(0xcfd8de), fd: 0.0016, lamp: 0, star: 0, exp: 1.06 },
  { h: 16.4, top: C(0x3a6ab0), mid: C(0x90a8c8), hor: C(0xe8c890), sun: C(0xffd090), sunI: 2.5, moonI: 0.0, hs: C(0xc0c8d8), hg: C(0x8a7452), hi: 0.6, fog: C(0xd8c8a8), fd: 0.0020, lamp: 0.05, star: 0, exp: 1.05 },
  { h: 17.8, top: C(0x35507e), mid: C(0xa08080), hor: C(0xffb060), sun: C(0xffa050), sunI: 2.1, moonI: 0.0, hs: C(0xd8b090), hg: C(0x6a5a44), hi: 0.55, fog: C(0xd8a880), fd: 0.0026, lamp: 0.35, star: 0, exp: 1.04 },
  { h: 18.9, top: C(0x25305c), mid: C(0x6a4a70), hor: C(0xff7a3c), sun: C(0xff6a30), sunI: 1.2, moonI: 0.05, hs: C(0x806080), hg: C(0x4a3a34), hi: 0.45, fog: C(0xa06858), fd: 0.0034, lamp: 0.8, star: 0.15, exp: 1.02 },
  { h: 20.2, top: C(0x0a1024), mid: C(0x1a2040), hor: C(0x3a2a4a), sun: C(0x9ab0d8), sunI: 0.0, moonI: 0.4, hs: C(0x202c4c), hg: C(0x10141c), hi: 0.32, fog: C(0x101624), fd: 0.0040, lamp: 1, star: 0.8, exp: 1.0 },
  { h: 24.0, top: C(0x05070f), mid: C(0x0a1020), hor: C(0x141c30), sun: C(0x9ab0d8), sunI: 0.0, moonI: 0.5, hs: C(0x1a2440), hg: C(0x0d1118), hi: 0.30, fog: C(0x0a0f1a), fd: 0.0035, lamp: 1, star: 1, exp: 1.0 },
];

function lerpC(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleTime(hour) {
  hour = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < STOPS.length - 2 && STOPS[i + 1].h < hour) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const t = clamp((hour - a.h) / (b.h - a.h || 1), 0, 1);
  const s = t * t * (3 - 2 * t);
  const out = {
    top: lerpC(a.top, b.top, s),
    mid: lerpC(a.mid, b.mid, s),
    hor: lerpC(a.hor, b.hor, s),
    sun: lerpC(a.sun, b.sun, s),
    hs: lerpC(a.hs, b.hs, s),
    hg: lerpC(a.hg, b.hg, s),
    fog: lerpC(a.fog, b.fog, s),
    sunI: lerp(a.sunI, b.sunI, s),
    moonI: lerp(a.moonI, b.moonI, s),
    hi: lerp(a.hi, b.hi, s),
    fd: lerp(a.fd, b.fd, s),
    lamp: lerp(a.lamp, b.lamp, s),
    star: lerp(a.star, b.star, s),
    exp: lerp(a.exp, b.exp, s),
  };
  const ang = ((hour - 6) / 12) * Math.PI;
  const elev = Math.sin(ang);
  const horiz = Math.cos(ang);
  const len = Math.hypot(horiz, Math.max(elev, -0.35), 0.42);
  out.sunDir = [-horiz / len, Math.max(elev, -0.35) / len, 0.42 / len];
  out.elev = elev;
  out.night = 1 - clamp((elev + 0.10) / 0.16, 0, 1);
  out.day = clamp((elev - 0.02) / 0.3, 0, 1);
  // moon sits opposite the sun, lifted so it reads at night
  const ml = Math.hypot(horiz, Math.max(-elev, 0.15), -0.42);
  out.moonDir = [horiz / ml, Math.max(-elev, 0.15) / ml, -0.42 / ml];
  return out;
}

export function formatClock(hour) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}