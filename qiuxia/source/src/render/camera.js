// Damped orbit camera with cinematic preset transitions and a follow mode.

import * as THREE from 'three';
import { clamp, lerp } from '../core/rng.js';

const PRESETS = {
  overview: () => ({ target: [270, 62, 100], radius: 380, theta: 0.45, phi: 0.85 }),
  bridge: () => ({ target: [310, 56, 100], radius: 150, theta: 0.25, phi: 1.60 }),
  platform: () => ({ target: [205, 78, 125], radius: 100, theta: 2.4, phi: 1.10 }),
  gorge: () => ({ target: [312, 52, 100], radius: 34, theta: 0.0, phi: 2.0 }),
  gear: (p) => ({ target: [p - 42, 80, 100], radius: 68, theta: 0.45, phi: 1.22 }),
  portal: () => ({ target: [160, 86, 100], radius: 85, theta: 1.57, phi: 1.42 }),
  follow: (p) => ({ target: [p - 30, 84, 100], radius: 90, theta: 0.75, phi: 1.28 }),
};

export class OrbitCamera {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.target = new THREE.Vector3(310, 58, 100);
    this.dTarget = this.target.clone();
    this.radius = 150; this.dRadius = 150;
    this.theta = 0.25; this.dTheta = 0.25;
    this.phi = 1.6; this.dPhi = 1.6;
    this.vTheta = 0; this.vPhi = 0;
    this.view = 'bridge';
    this.follow = false;
    this.spinEnabled = true;
    this.idle = 0;
    this.transition = 0;
    this._pointers = new Map();
    this._pinch = 0;
    this._bind();
  }

  _bind() {
    const el = this.dom;
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        this._pinch = Math.hypot(a[0] - b[0], a[1] - b[1]);
      }
      el.classList.add('dragging');
      this.idle = 0;
    });
    el.addEventListener('pointermove', (e) => {
      if (!this._pointers.has(e.pointerId)) return;
      const prev = this._pointers.get(e.pointerId);
      const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
      this._pointers.set(e.pointerId, [e.clientX, e.clientY]);
      this.idle = 0;
      if (this._pointers.size === 1) {
        this.dTheta -= dx * 0.0052;
        this.dPhi = clamp(this.dPhi - dy * 0.0042, 0.18, 1.78);
        this.vTheta = -dx * 0.0052;
        this.vPhi = -dy * 0.0042;
        this.follow = false;
      } else if (this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (this._pinch) this.dRadius = clamp(this.dRadius * (this._pinch / d), 34, 760);
        this._pinch = d;
      }
    });
    const up = (e) => {
      this._pointers.delete(e.pointerId);
      this._pinch = 0;
      if (this._pointers.size === 0) el.classList.remove('dragging');
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.dRadius = clamp(this.dRadius * Math.exp(e.deltaY * 0.0011), 34, 760);
      this.idle = 0;
    }, { passive: false });
  }

  setView(name, instant = false, trainP = 310) {
    const fn = PRESETS[name] || PRESETS.bridge;
    const p = fn(trainP);
    this.view = name;
    this.follow = name === 'follow' || name === 'gear';
    this.dTarget.set(...p.target);
    this.dRadius = p.radius;
    // choose nearest equivalent angle so transitions never spin the long way
    const twoPi = Math.PI * 2;
    let th = p.theta;
    while (th - this.theta > Math.PI) th -= twoPi;
    while (th - this.theta < -Math.PI) th += twoPi;
    this.dTheta = th;
    this.dPhi = p.phi;
    this.vTheta = 0; this.vPhi = 0;
    this.transition = instant ? 0 : 1;
    if (instant) {
      this.target.copy(this.dTarget);
      this.radius = this.dRadius;
      this.theta = this.dTheta;
      this.phi = this.dPhi;
    }
    this.idle = 0;
  }

  spin(on) { this.spinEnabled = on; }

  update(dt, trainP) {
    this.idle += dt;
    if (this.follow) {
      const fn = PRESETS[this.view];
      const p = fn(trainP);
      this.dTarget.set(...p.target);
    }
    if (this.spinEnabled && this.idle > 7 && !this.follow && this._pointers.size === 0) {
      this.dTheta += dt * 0.035;
    }
    // inertia
    if (this._pointers.size === 0) {
      this.dTheta += this.vTheta;
      this.dPhi = clamp(this.dPhi + this.vPhi, 0.18, 1.78);
      this.vTheta *= Math.pow(0.0025, dt);
      this.vPhi *= Math.pow(0.0025, dt);
    }
    const rate = this.transition > 0 ? 3.2 : 9.0;
    const k = 1 - Math.exp(-rate * dt);
    this.target.lerp(this.dTarget, k);
    this.radius = lerp(this.radius, this.dRadius, k);
    this.theta = lerp(this.theta, this.dTheta, k);
    this.phi = lerp(this.phi, this.dPhi, k);
    if (this.transition > 0) {
      this.transition -= dt / 1.6;
      if (this.transition <= 0) this.transition = 0;
    }
    const sp = Math.sin(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sp * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sp * Math.cos(this.theta),
    );
    this.camera.lookAt(this.target);
  }
}

export const VIEW_NAMES = Object.keys(PRESETS);