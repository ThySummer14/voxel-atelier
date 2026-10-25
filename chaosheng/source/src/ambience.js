// A quiet, generated coastal soundscape. Audio is created only after a click.
export class CoastalAmbience {
  constructor() { this.enabled = false; this.context = null; this.birdTimer = null; }
  async toggle() {
    if (!this.context) this.create();
    if (!this.enabled) {
      await this.context.resume();
      this.master.gain.setTargetAtTime(0.12, this.context.currentTime, 0.7);
      this.enabled = true;
      this.scheduleGull();
    } else {
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.3);
      clearTimeout(this.birdTimer);
      this.enabled = false;
    }
    return this.enabled;
  }
  create() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('当前浏览器不支持 Web Audio');
    const ctx = this.context = new AudioContext();
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    const length = ctx.sampleRate * 8;
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel=0; channel<2; channel++) {
      const data=buffer.getChannelData(channel);
      let last=0;
      for(let i=0;i<length;i++){last=(last+Math.random()*0.08-0.04)/1.02;data[i]=last*5;}
    }
    this.noise=ctx.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1150;filter.Q.value=0.4;
    const waveGain=ctx.createGain();waveGain.gain.value=0.75;
    this.noise.connect(filter);filter.connect(waveGain);waveGain.connect(this.master);this.noise.start();
    const tide=ctx.createOscillator();tide.frequency.value=0.09;
    const depth=ctx.createGain();depth.gain.value=0.35;tide.connect(depth);depth.connect(waveGain.gain);tide.start();
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)ctx.suspend();else if(this.enabled)ctx.resume();
    });
  }
  scheduleGull() {
    clearTimeout(this.birdTimer);
    this.birdTimer=setTimeout(()=>{
      if(!this.enabled)return;
      const ctx=this.context,t=ctx.currentTime;
      for(let i=0;i<2;i++) {
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
        osc.frequency.setValueAtTime(850+i*95,t+i*0.32);
        osc.frequency.exponentialRampToValueAtTime(1450,t+i*0.32+0.11);
        osc.frequency.exponentialRampToValueAtTime(740,t+i*0.32+0.43);
        gain.gain.setValueAtTime(0,t+i*0.32);gain.gain.linearRampToValueAtTime(0.065,t+i*0.32+0.07);
        gain.gain.exponentialRampToValueAtTime(0.001,t+i*0.32+0.5);
        osc.connect(gain);gain.connect(this.master);osc.start(t+i*0.32);osc.stop(t+i*0.32+0.55);
      }
      this.scheduleGull();
    },8500+Math.random()*13000);
  }
}
