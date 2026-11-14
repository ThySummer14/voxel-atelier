// Procedural WebAudio Soundscape for Mount Heng's Hanging Temple (`古寺山风 · 唐峪涧水 · 铁马风铃 · 北魏梵钟`)
// Zero external audio files — 100% pure physical/modal WebAudio synthesis!

export function createTempleSoundscape() {
  let ctx = null;
  let masterGain = null;
  let enabled = false;
  let chimeTimer = null;

  function ensureContext() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.0;
    masterGain.connect(ctx.destination);

    // 1. Continuous Jinlong Gorge Mountain Wind + Tangyu River Stream (`峡谷松风与碧涧流水`)
    const bufLen = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      // Pink/brownian filtered noise
      lastOut = (lastOut + 0.035 * white) / 1.035;
      data[i] = lastOut * 2.8;
    }

    // Wind bandpass modulated slowly by an LFO
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuf;
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 290;
    windFilter.Q.value = 2.4;

    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.11;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 135;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.24;
    windSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);

    // Stream water murmur (higher soft bandpass)
    const streamSrc = ctx.createBufferSource();
    streamSrc.buffer = noiseBuf;
    streamSrc.loop = true;
    streamSrc.playbackRate.value = 1.35;
    const streamFilter = ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.value = 980;
    streamFilter.Q.value = 1.1;
    const streamGain = ctx.createGain();
    streamGain.gain.value = 0.08;
    streamSrc.connect(streamFilter);
    streamFilter.connect(streamGain);
    streamGain.connect(masterGain);

    windSrc.start();
    windLfo.start();
    streamSrc.start();

    // 2. Delicate Flying-Eave Bronze Wind-Bell (`檐角铁马风铃` — Pentatonic D-F-G-A-C)
    const pentatonic = [587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66];
    const scheduleChime = () => {
      if (enabled && ctx && ctx.state === 'running') {
        const now = ctx.currentTime;
        const f0 = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        playWindChimeNote(f0, now, 0.055);
        if (Math.random() > 0.5) {
          const f1 = pentatonic[Math.floor(Math.random() * pentatonic.length)];
          playWindChimeNote(f1, now + 0.18 + Math.random() * 0.22, 0.04);
        }
      }
      chimeTimer = setTimeout(scheduleChime, 2400 + Math.random() * 4200);
    };
    scheduleChime();
  }

  function playWindChimeNote(freq, time, amp) {
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2.756, time); // Metallic overtone

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amp, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.4);

    const g2 = ctx.createGain();
    g2.gain.value = 0.28;
    osc2.connect(g2);
    g2.connect(gain);
    osc1.connect(gain);
    gain.connect(masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 2.5);
    osc2.stop(time + 2.5);
  }

  /**
   * Strikes the great ancient cast-bronze temple bell (`钟楼古钟`)!
   * Uses authentic Chinese elliptic/circular bronze bell modal partials (hum, prime, tierce, quint, nominal).
   */
  function strikeBronzeBell() {
    ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // Play bell directly to destination (at respectful volume) even if background wind isn't toggled on yet,
    // because clicking "叩钟" is an explicit user audio action!
    const bellBus = ctx.createGain();
    bellBus.gain.value = 0.34;
    bellBus.connect(ctx.destination);

    const now = ctx.currentTime;
    const baseFreq = 146.83; // Deep resonant D3 temple bell
    const partials = [
      { ratio: 0.5, amp: 0.45, decay: 6.8 },    // Deep hum tone (`嗡音`)
      { ratio: 1.0, amp: 0.85, decay: 5.2 },    // Prime (`正音`)
      { ratio: 1.19, amp: 0.50, decay: 4.1 },   // Minor third (`三度泛音`)
      { ratio: 1.504, amp: 0.36, decay: 3.5 },  // Fifth
      { ratio: 2.0, amp: 0.48, decay: 2.9 },    // Nominal octave
      { ratio: 2.008, amp: 0.32, decay: 2.8 },  // Shimmering beat frequency (`钟韵双音拍频`!)
      { ratio: 2.74, amp: 0.22, decay: 1.8 },   // Strike transient ring
      { ratio: 3.86, amp: 0.14, decay: 0.9 },   // Wooden ram impact brightness
    ];

    for (const p of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(p.amp, now + 0.018);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(g);
      g.connect(bellBus);
      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    }
  }

  function toggle(forceState) {
    ensureContext();
    if (!ctx) return false;
    enabled = typeof forceState === 'boolean' ? forceState : !enabled;
    if (enabled && ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(enabled ? 0.55 : 0.0, now, 0.35);
    return enabled;
  }

  return {
    toggle,
    strikeBronzeBell,
    isEnabled: () => enabled,
  };
}
