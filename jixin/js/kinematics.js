// 运动学：纯函数/纯类，不依赖 DOM 与 three，可在 Node 里直接单测。
// 时间基线：走时读数来自真实系统时间；摆轮/擒纵来自同一相位，所以「滴答」与
// 「笼框指秒」严格同步。拔出表冠即停秒（hack），摆轮与轮系一起冻住。

import { GEARING, HS_STATES } from './sculpt/spec.js';

const TAU = Math.PI * 2;
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const POWER_START = 0.62;

export class Movement {
  constructor(nowMs = Date.now()) {
    this.baseSec = nowMs / 1000;         // 走时基准（真实时刻）
    this.clock = 0;                      // 机芯自走的累计秒（停秒时不涨）
    this.beatPhase = 0;                  // 单位：拍
    this.power = POWER_START;            // 动力储存 0..1
    this.hacked = false;                 // 表冠拉出 = 停秒
    this.winding = 0;                    // 上链累计（表冠弧度）
    this.beats = 0;
    this.drainDemo = 0;                  // >0 时按倍速放条（演示用）
    // 时区：displaySec 是 UTC 纪元秒，时针必须按本地时区偏移，否则整点差 8/12 圈
    this.tz = -new Date().getTimezoneOffset() * 60;
    this.lastBeatIndex = 0;
    this.ampDeg = 0;
  }

  /** 真实时刻（秒，连续）；停秒/拨针时用 setTime 覆盖 */
  get displaySec() { return this.baseSec + this.clock; }

  setTime(sec) { this.baseSec = sec; this.clock = 0; }

  /** 摆幅：满条 ~300°，条尽时衰减到停走 */
  get amplitudeRad() {
    const p = Math.max(0, this.power);
    return (295 * Math.pow(p, 0.62) + 5) * Math.PI / 180 * (p > 0.015 ? 1 : 0);
  }
  get running() { return !this.hacked && this.power > 0.015; }

  /** 上链：turns = 表冠转过的圈数 */
  wind(turns) {
    this.winding += turns * TAU;
    this.power = Math.min(1, this.power + (turns / GEARING.windingTurnsFull));
  }

  update(dt) {
    if (this.running) {
      this.clock += dt;
      this.beatPhase += dt * GEARING.beatsPerSec;
      this.beats = Math.floor(this.beatPhase);
      this.power = Math.max(0, this.power - dt / (GEARING.powerReserveHours * 3600) * (1 + this.drainDemo));
    }
    this.ampDeg = this.amplitudeRad * 180 / Math.PI;
    return this;
  }

  /**
   * 各零件角度（rad，符号即 three.js rotation.y 方向）。
   * 分针/时针/笼框由 displaySec 驱动 → 画面读的是真实时间。
   */
  pose() {
    const G = GEARING;
    const s = this.displaySec + this.tz;
    const bal = this.running ? Math.cos(Math.PI * this.beatPhase) * this.amplitudeRad : this._frozenBal ?? 0;
    if (!this.running) this._frozenBal = this._frozenBal ?? bal;
    else this._frozenBal = 0;
    const bp = this.beatPhase;
    const bi = Math.floor(bp);
    const frac = bp - bi;
    // 擒纵：每拍推进半齿，拍的中段快速走完（听得到的"嘀—嗒"）
    const halfTooth = TAU / (G.escapeTeeth * 2);
    const escStep = this.running ? (bi + smooth(0.34, 0.62, frac)) * halfTooth : this._frozenEsc ?? 0;
    if (this.running) this._frozenEsc = escStep;
    // 杠杆：在两个限位之间换向，与摆轮同相
    const palSwing = this.running
      ? (bi % 2 === 0 ? 1 : -1) * (0.55 + 0.45 * Math.cos(Math.PI * (frac * 2)))
      : 0;
    const windAngle = this.winding;
    // 键名必须与 spec.PARTS[].key 一一对应，否则零件会静默不转
    // （accept-node 会逐条检查 spin 零件的角度存在且变化）
    return {
      cageFrame: -TAU * (s / G.cageRevSec),
      cageTop: -TAU * (s / G.cageRevSec),
      fourthWheel: -TAU * (s / G.fourthRevSec),
      thirdWheel: TAU * (s / G.thirdRevSec),
      centerWheel: -TAU * (s / G.centerRevSec),
      barrel: TAU * (s / G.barrelRevSec) + windAngle * 0.06,
      escapeWheel: escStep,
      balance: bal,
      roller: bal * 0.42,
      pallet: palSwing * 0.16,
      hairspring: bal,
      handMinute: -TAU * (s / 3600),
      handHour: -TAU * (s / (12 * 3600)),
      handPR: -(this.power - 0.5) * 2.1,
      crown: windAngle,
      stem: windAngle,
      crownWheel: -windAngle * 0.55,
      idleWheel: windAngle * 0.42,
      ratchet: -windAngle * 0.09,
      click: -Math.max(0, Math.sin(windAngle * 12)) * 0.12,
    };
  }

  /** 游丝呼吸态索引：把摆轮角量化到 HS_STATES 档 */
  hsState() {
    const a = this.running ? Math.cos(Math.PI * this.beatPhase) : 0;
    const amp = Math.max(0.25, this.ampDeg / 300);
    const q = Math.round((a * amp * 0.5 + 0.5) * (HS_STATES - 1));
    return Math.max(0, Math.min(HS_STATES - 1, q));
  }

  /** 本帧新产生的拍（用于驱动声音） */
  newBeats() {
    const n = this.beats - this.lastBeatIndex;
    if (n > 0) this.lastBeatIndex = this.beats;
    return n;
  }
}

/** 由时刻算出的显示时间，供 HUD 与验收断言共用 */
export function readout(sec) {
  const d = new Date(sec * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return {
    h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), ms: d.getMilliseconds(),
    text: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}
