// Fully procedural WebAudio soundscape: gorge wind, river hiss, crank-synced
// exhaust chuffs, rail joint clacks and a two-chime steam whistle. Muted by default.

export function createSoundscape() {
  let ctx = null, master = null, windGain = null, windFilter = null;
  let enabled = false, noiseBuf = null, lastClack = 0;

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // shared white-noise buffer
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    // wind bed
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuf; wind.loop = true;
    windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass'; windFilter.frequency.value = 340; windFilter.Q.value = 0.5;
    windGain = ctx.createGain(); windGain.gain.value = 0.05;
    wind.connect(windFilter).connect(windGain).connect(master);
    wind.start();
    // river hiss
    const river = ctx.createBufferSource();
    river.buffer = noiseBuf; river.loop = true; river.playbackRate.value = 0.8;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const rg = ctx.createGain(); rg.gain.value = 0.018;
    river.connect(hp).connect(rg).connect(master);
    river.start();
  }

  function setEnabled(v) {
    enabled = v;
    if (v) { ensure(); ctx.resume(); }
    if (master) master.gain.setTargetAtTime(v ? 0.6 : 0.0, ctx.currentTime, 0.25);
  }

  function chuff(intensity = 1) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1100, t);
    lp.frequency.exponentialRampToValueAtTime(260, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.34 * intensity, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(lp).connect(g).connect(master);
    src.start(t); src.stop(t + 0.2);
  }

  function clack() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(bp).connect(g).connect(master);
    src.start(t); src.stop(t + 0.06);
  }

  function whistle() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 0.10);
    g.gain.setValueAtTime(0.11, t + 1.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.75);
    g.connect(master);
    for (const f of [520, 660, 784]) {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const vib = ctx.createOscillator(); vib.frequency.value = 5.5;
      const vg = ctx.createGain(); vg.gain.value = 4;
      vib.connect(vg).connect(o.frequency);
      const og = ctx.createGain(); og.gain.value = f === 520 ? 0.5 : 0.3;
      o.connect(og).connect(g);
      o.start(t); o.stop(t + 1.8); vib.start(t); vib.stop(t + 1.8);
    }
    // breath
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8;
    const bg = ctx.createGain(); bg.gain.value = 0.04;
    src.connect(bp).connect(bg).connect(g);
    src.start(t); src.stop(t + 1.8);
  }

  function update(dt, c) {
    if (!enabled || !ctx) return;
    const gust = 0.045 + 0.02 * Math.sin(c.t * 0.4) + 0.012 * Math.sin(c.t * 1.7);
    windGain.gain.setTargetAtTime(gust * (0.7 + 0.3 * c.day), ctx.currentTime, 0.3);
    windFilter.frequency.setTargetAtTime(300 + 120 * Math.sin(c.t * 0.23), ctx.currentTime, 0.4);
    // rail clacks at sleeper spacing (~3 voxels)
    if (c.running) {
      const phase = c.trainP / 3;
      if (Math.floor(phase) !== lastClack) { lastClack = Math.floor(phase); clack(); }
    }
  }

  return { setEnabled, chuff, whistle, update, get enabled() { return enabled; } };
}