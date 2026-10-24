// 极夜流火 · 纯程序化 Web Audio 工业声学合成器 (Procedural Audio Engine)
// 包含 4-拍排汽爆破音、五音阶客运汽笛 (A大调五和弦)、连杆金属撞击与极地风啸

export class ProceduralTrainAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.whistleActive = false;
    this.whistleOscs = [];
    this.whistleGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initAmbientWind();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio 启动受限 (需用户手势交互):', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. 极地风啸背景音 (Filtered Pink/White Noise)
  initAmbientWind() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    whiteNoise.start();
  }

  // 2. 动轮单拍排汽爆破声 (Puff / Chuff)
  playChuff(intensity = 1.0, speedRatio = 1.0) {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // 白噪声突发 (高压蒸汽冲击)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // 带通滤波
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600 + speedRatio * 400, now);
    filter.Q.setValueAtTime(1.8, now);

    // 增益包络
    const gain = this.ctx.createGain();
    const dur = Math.max(0.06, 0.16 / speedRatio);
    gain.gain.setValueAtTime(0.35 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // 低频活塞重击 (Sub-bass thump 70Hz)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(75, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + dur);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.28 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    noise.start(now);
    subOsc.start(now);
    noise.stop(now + dur);
    subOsc.stop(now + dur);
  }

  // 3. 经典五音阶客运汽笛 (A 大调 5 和弦: 370, 440, 554, 659, 880 Hz)
  startWhistle() {
    if (!this.ctx || this.isMuted || this.whistleActive) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    this.whistleActive = true;

    const freqs = [370.0, 440.0, 554.37, 659.25, 880.0];
    this.whistleGain = this.ctx.createGain();
    this.whistleGain.gain.setValueAtTime(0.001, now);
    this.whistleGain.gain.linearRampToValueAtTime(0.45, now + 0.12);
    this.whistleGain.connect(this.masterGain);

    this.whistleOscs = freqs.map((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      // 轻微音高颤音
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(5.5, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(3.0, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      osc.connect(this.whistleGain);
      osc.start(now);
      return { osc, lfo };
    });
  }

  stopWhistle() {
    if (!this.whistleActive || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.whistleActive = false;
    if (this.whistleGain) {
      this.whistleGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
    }
    setTimeout(() => {
      for (const item of this.whistleOscs) {
        try {
          item.osc.stop();
          item.lfo.stop();
        } catch (_) {}
      }
      this.whistleOscs = [];
    }, 280);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}
