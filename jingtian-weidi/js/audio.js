// 机房声：全部用 WebAudio 合成（无外部音频文件）——打纬闷响、梭风、花本棘轮、落机磬声、屋内底噪
let AC = null, master = null, ambGain = null, ambSrc = null, ready = false;

export function initSound() {
  if (ready) return;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  AC = new Ctor();
  master = AC.createGain();
  master.gain.value = 0.55;
  master.connect(AC.destination);
  ready = true;
}
export function soundReady() { return ready; }
export function setVolume(v) { if (master) master.gain.value = v; }

function noiseBuf(sec = 1) {
  const n = Math.floor(AC.sampleRate * sec);
  const b = AC.createBuffer(1, n, AC.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// 打纬：木头的闷响（低频体 + 噪声头）
export function thud(gain = 0.9) {
  if (!ready) return;
  const t = AC.currentTime;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(58, t + 0.16);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.30);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.34);
  const nb = AC.createBufferSource(); nb.buffer = noiseBuf(0.1);
  const nf = AC.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 1100;
  const ng = AC.createGain();
  ng.gain.setValueAtTime(gain * 0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.0005, t + 0.09);
  nb.connect(nf).connect(ng).connect(master);
  nb.start(t); nb.stop(t + 0.12);
}

// 梭：掠过经面的风声（带通噪声扫频）
export function whoosh(dur = 0.4, gain = 0.5) {
  if (!ready) return;
  const t = AC.currentTime;
  const src = AC.createBufferSource(); src.buffer = noiseBuf(Math.max(0.3, dur + 0.15));
  const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(420, t);
  bp.frequency.linearRampToValueAtTime(1900, t + dur * 0.55);
  bp.frequency.linearRampToValueAtTime(560, t + dur);
  const g = AC.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.22);
  g.gain.linearRampToValueAtTime(0.0006, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t); src.stop(t + dur + 0.12);
}

// 花本棘轮：几下干涩的咔哒
export function click(n = 2, gain = 0.30) {
  if (!ready) return;
  for (let k = 0; k < n; k++) {
    const t = AC.currentTime + k * 0.055;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'square'; o.frequency.value = 1500 - k * 130;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 0.045);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.06);
  }
}

// 落机：三声磬（五声音阶）
export function chime() {
  if (!ready) return;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((f, k) => {
    const t = AC.currentTime + k * 0.42;
    const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine'; o.frequency.value = f;
    o2.type = 'sine'; o2.frequency.value = f * 2.01;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.26, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 2.1);
    const g2 = AC.createGain(); g2.gain.value = 0.28;
    o.connect(g); o2.connect(g2).connect(g);
    g.connect(master);
    o.start(t); o.stop(t + 2.2); o2.start(t); o2.stop(t + 2.2);
  });
}

// 屋内底噪：低通噪声（机房的气息）
export function ambient(on) {
  if (!ready) return;
  if (on && !ambSrc) {
    ambSrc = AC.createBufferSource();
    ambSrc.buffer = noiseBuf(2.4); ambSrc.loop = true;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    ambGain = AC.createGain(); ambGain.gain.value = 0.0;
    ambSrc.connect(lp).connect(ambGain).connect(master);
    ambSrc.start();
    ambGain.gain.linearRampToValueAtTime(0.075, AC.currentTime + 1.2);
  } else if (!on && ambSrc && ambGain) {
    ambGain.gain.linearRampToValueAtTime(0.0, AC.currentTime + 0.6);
    const s = ambSrc; ambSrc = null;
    setTimeout(() => { try { s.stop(); } catch (e) { /* 已停 */ } }, 900);
  }
}