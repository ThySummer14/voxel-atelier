// 擒纵声：WebAudio 合成的极短金属撞击。每次摆轮换向 = 一拍 = 一声，
// tick / tock 交替（进瓦 / 出瓦音高不同），音量随摆幅衰减 → 条将尽时声音发虚。
// 只在用户手势后创建 AudioContext；静音不改变任何视觉状态。

export class EscapementSound {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.stetho = false;
    this._flip = false;
    this.scheduled = 0;      // 已调度的撞击次数（验收用：证明节拍真的驱动了音频图）
    this.ratchets = 0;
  }

  enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.muted = false;
    return true;
  }
  mute() {
    this.muted = true;
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  /** @param {number} at ctx 时间轴上的绝对时刻 @param {number} amp 0..1 摆幅归一 */
  beat(at, amp, tock) {
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    const g = ctx.createGain();
    const t = tock ? 2500 : 3300;
    const q = this.stetho ? 2.5 : 8;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(t, at);
    osc.frequency.exponentialRampToValueAtTime(t * 0.45, at + 0.012);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = t;
    bp.Q.value = q;
    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(this.stetho ? 180 : 420, at);
    const bg = ctx.createGain();
    bg.gain.value = this.stetho ? 0.5 : 0.22;
    const vol = 0.16 * (0.35 + 0.65 * amp);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.0008);
    g.gain.exponentialRampToValueAtTime(0.0006, at + (this.stetho ? 0.05 : 0.022));
    osc.connect(bp).connect(g);
    body.connect(bg).connect(g);
    g.connect(this.master);
    osc.start(at); osc.stop(at + 0.07);
    body.start(at); body.stop(at + 0.07);
    this.scheduled++;
    this._flip = !this._flip;
  }

  /** 上链棘轮：一串更密的沙沙声 */
  ratchet(at, power) {
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400 + power * 500, at);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, at);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.014);
    osc.connect(f).connect(g).connect(this.master);
    osc.start(at); osc.stop(at + 0.03);
    this.ratchets++;
  }
}
