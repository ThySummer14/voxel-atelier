export class StarloomAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
    this.timer = null;
    this.nodes = [];
    this.volume = 0.55;
  }

  async enable() {
    if (!this.ctx) this.build();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.enabled = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.8);
    this.scheduleNext(2200);
    return true;
  }

  disable() {
    if (!this.ctx) return;
    this.enabled = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.ratio.value = 3;
    comp.attack.value = 0.15;
    comp.release.value = 0.8;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;

    // low, breathing drone
    for (const [freq, gainValue, type] of [[55, 0.055, 'sine'], [82.5, 0.032, 'sine'], [110, 0.014, 'triangle']]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = gainValue;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 380;
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(master);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.035 + Math.random() * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.012;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.start();
      lfo.start();
      this.nodes.push(osc, lfo);
    }

    // a soft wind bed
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.985 * last + white * 0.015;
      data[i] = last * 2.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 420;
    noiseFilter.Q.value = 0.55;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    this.nodes.push(noise);

    // a very quiet high shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 1760;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.0035;
    const shimmerLfo = ctx.createOscillator();
    shimmerLfo.frequency.value = 0.12;
    const shimmerLfoGain = ctx.createGain();
    shimmerLfoGain.gain.value = 0.0025;
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmerGain.gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start();
    shimmerLfo.start();
    this.nodes.push(shimmer, shimmerLfo);
  }

  scheduleNext(delay) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.enabled) return;
      this.chime(true);
      this.scheduleNext(4500 + Math.random() * 6500);
    }, delay);
  }

  note(freq, time, duration, volume = 0.06, pan = 0) {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createStereoPanner();
    osc.type = 'sine';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 2600;
    panner.pan.value = pan;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.master);
    osc.start(time);
    osc.stop(time + duration + 0.05);
    // glassy overtone
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = freq * 2.01;
    overtoneGain.gain.setValueAtTime(0, time);
    overtoneGain.gain.linearRampToValueAtTime(volume * 0.22, time + 0.02);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.55);
    overtone.connect(overtoneGain);
    overtoneGain.connect(panner);
    overtone.start(time);
    overtone.stop(time + duration);
  }

  chime(ambient = false) {
    if (!this.ctx || !this.enabled) return;
    const scale = [523.25, 587.33, 698.46, 783.99, 880, 1046.5];
    const now = this.ctx.currentTime + 0.02;
    const picks = ambient ? 1 + Math.floor(Math.random() * 2) : 5;
    for (let i = 0; i < picks; i++) {
      const f = scale[Math.floor(Math.random() * scale.length)];
      const t = now + i * (ambient ? 0.3 + Math.random() * 0.5 : 0.16);
      this.note(f, t, ambient ? 3.5 + Math.random() * 2 : 2.6, ambient ? 0.025 : 0.05, (Math.random() - 0.5) * 1.2);
    }
  }

  weave() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime + 0.03;
    const melody = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    melody.forEach((f, i) => {
      this.note(f, now + i * 0.11, 2.2 + i * 0.12, 0.045, (i - 2.5) * 0.16);
    });
    this.note(196, now, 3.4, 0.03, 0);
  }
}
