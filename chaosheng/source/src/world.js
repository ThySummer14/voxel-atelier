/* All visible architecture is built from boxes. The same scene description feeds
 * the WebGL artwork, the model checks, and the MagicaVoxel export. */
export const SEED = 270819;
export const WATER = { width: 94, depth: 78, bottom: -4.8 };

export function createWorld() {
  let seed = SEED;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const boxes = [], animations = [], labels = [];
  const stats = { buildings: 0, boats: 0, trees: 0, people: 0 };
  const frames = [{ x: 0, y: 0, z: 0, yaw: 0, group: null }];
  const colors = {
    stone: ['#b6a388', '#c0ae93', '#ae997e', '#cbb99c', '#baa88c'],
    roof: ['#ad4b36', '#c35c3e', '#d0734c', '#b7543c', '#bf6546', '#a94b37'],
    leaf: ['#456846', '#58754b', '#68824f', '#748950', '#3f6145'],
    wood: ['#735641', '#826149', '#927054', '#a1805d'],
    walls: ['#e3b785', '#e7d2a7', '#c67f60', '#ddaa7d', '#e5c595', '#b7c6b0', '#d59072'],
  };
  function box(x, y, z, sx, sy, sz, color, kind = 'solid', rotation = [0, 0, 0]) {
    const t = frames[frames.length - 1];
    const co = Math.cos(t.yaw), si = Math.sin(t.yaw);
    boxes.push({ p: [t.x + x * co + z * si, t.y + y, t.z + z * co - x * si],
      s: [sx, sy, sz], c: color, k: kind, r: [rotation[0], rotation[1] + t.yaw, rotation[2]], g: t.group });
  }
  function at(x, y, z, yaw, fn, group = null) {
    const p = frames[frames.length - 1], co = Math.cos(p.yaw), si = Math.sin(p.yaw);
    frames.push({ x: p.x + x * co + z * si, y: p.y + y, z: p.z + z * co - x * si,
      yaw: p.yaw + yaw, group: group || p.group });
    fn(); frames.pop();
  }
  function line(a, b, size, color, kind = 'solid') {
    const len = Math.hypot(...a.map((v, i) => v - b[i]));
    const n = Math.max(1, Math.ceil(len / (size * 0.85)));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      box(...a.map((v, j) => v + (b[j] - v) * t), size, size, size, color, kind);
    }
  }
  function disk(x, y, z, radius, height, color, step = 0.5, inner = 0) {
    for (let dx = -radius; dx <= radius; dx += step) for (let dz = -radius; dz <= radius; dz += step) {
      const d = Math.hypot(dx + step / 2, dz + step / 2);
      if (d <= radius && d >= inner) box(x + dx + step / 2, y, z + dz + step / 2, step, height, step, Array.isArray(color) ? pick(color) : color);
    }
  }

  const houses = [
    { x: -21, z: -18, y: 18, w: 4.7, d: 4.1, h: 3.7, c: '#ded2b3', roof: 'slate', name: '守塔人的家' },
    { x: -21, z: -10, y: 12, w: 5.6, d: 4.5, h: 5.1, c: '#e3c99a', balcony: true },
    { x: -12.5, z: -9.7, y: 12, w: 5.7, d: 4.3, h: 5.5, c: '#c98268', balcony: true, laundry: true },
    { x: -4.1, z: -10.6, y: 12, w: 5.4, d: 4.6, h: 6.1, c: '#e9d8ad', sign: 'POSTA', clock: true },
    { x: 4.4, z: -10.3, y: 12, w: 5.4, d: 4.6, h: 4.8, c: '#d4a16c', balcony: true },
    { x: -25, z: -1.8, y: 8, w: 5.8, d: 4.9, h: 4.2, c: '#d8b08b', roof: 'slate' },
    { x: -16.4, z: -2, y: 8, w: 5.6, d: 4.7, h: 5.3, c: '#e2c495', sign: 'FORNO', awning: true },
    { x: -8.1, z: -1.8, y: 8, w: 5.7, d: 4.5, h: 5.2, c: '#adc3ae', balcony: true },
    { x: 14.7, z: -2.5, y: 8, w: 5.3, d: 4.3, h: 4.7, c: '#d48b72', laundry: true },
    { x: -23, z: 6.3, y: 4, w: 5.8, d: 4.5, h: 4.3, c: '#e3b57d', sign: 'OLIVA', awning: true },
    { x: -14.7, z: 6.1, y: 4, w: 5.6, d: 4.7, h: 5.2, c: '#dba08b', balcony: true },
    { x: -6.6, z: 5.8, y: 4, w: 5.5, d: 4.6, h: 4.8, c: '#e9d4a5', sign: 'CAFFÈ', awning: true },
    { x: 1.4, z: 5.5, y: 4, w: 5.5, d: 4.6, h: 5.6, c: '#c77f61', balcony: true },
    { x: 9.5, z: 5.2, y: 4, w: 5.6, d: 4.7, h: 4.5, c: '#e6c894', balcony: true },
    { x: 17, z: 4.5, y: 4, w: 4.5, d: 4, h: 3.8, c: '#b7c5b1', roof: 'slate' },
    { x: -20.1, z: 13, y: 2, w: 5.8, d: 4.2, h: 3.7, c: '#c58c69', sign: 'PESCE', awning: true },
    { x: 33.5, z: -3.2, y: 6, w: 4.5, d: 3.8, h: 3.4, c: '#dbbd89', roof: 'slate' },
  ];

  // Hand composed, terraced land. Surface voxels retain the underlying rock strata.
  const heights = new Map();
  const key = (x, z) => `${x},${z}`;
  for (let x = -37; x <= 40; x++) for (let z = -32; z <= 25; z++) {
    const edgeNoise = Math.sin(x * 0.73 + z * 0.29) * 0.024 + Math.sin(z * 1.13) * 0.021;
    const main = ((x + 8) / 27) ** 2 + ((z + 8) / 22) ** 2;
    let h = 0;
    if (main < 1 + edgeNoise) {
      h = z < -15 ? 15 : z < -7 ? 12 : z < 1 ? 8 : z < 9 ? 4 : 2;
      const peak = ((x + 15) / 13) ** 2 + ((z + 18) / 9.5) ** 2;
      if (peak < 0.87) h = 18;
      if (peak >= 0.87 && peak < 1.35 && z < -12) h = 15;
      if (main > 0.86) h = Math.max(2, h - 2);
      if (main > 0.95) h = Math.max(1, h - 2);
      if (z > 8 && ((x - 6) / 20) ** 2 + ((z - 18) / 12) ** 2 < 1) h = 0;
    }
    if (((x + 22) / 7) ** 2 + ((z - 12) / 7) ** 2 < 1) h = 2;
    const isle = ((x - 30) / 8.5) ** 2 + ((z + 10) / 10.8) ** 2;
    if (isle < 1 + edgeNoise) h = isle < 0.52 ? 9 : isle < 0.8 ? 6 : 3;
    if (x >= 12 && x <= 19 && z >= -12 && z <= -7) h = 9;
    if (h) heights.set(key(x, z), h);
  }
  function pad(cx, cz, w, d, h) {
    for (let x = Math.ceil(cx - w / 2); x < cx + w / 2; x++) for (let z = Math.ceil(cz - d / 2); z < cz + d / 2; z++) heights.set(key(x, z), h);
  }
  houses.forEach(h => pad(h.x, h.z, h.w + 1.5, h.d + 1.2, h.y));
  pad(-14, -18, 9, 9, 18);
  pad(2.5, -1.8, 12.5, 6, 8);
  pad(30, -12, 7.4, 7, 9);
  pad(-3, 8.5, 44, 2, 4);
  // Keep the channel genuinely open beneath the bridge, rather than burying
  // the arch in the two islands' overlapping terrain footprints.
  for(let x=18;x<=25;x++)for(let z=-16;z<=-5;z++)heights.delete(key(x,z));
  // Small weathered sea stacks, one with a natural opening.
  for (const [cx, cz, r, h] of [[-33, 17, 3, 6], [34, 16, 2.4, 3], [-30, -28, 3, 7], [23, -26, 3, 4]]) {
    for (let x = Math.floor(cx - r); x <= cx + r; x++) for (let z = Math.floor(cz - r); z <= cz + r; z++) {
      const d = Math.hypot(x - cx, z - cz) / r;
      if (d < 1) heights.set(key(x, z), Math.max(1, Math.floor(h * (1 - d * 0.4))));
    }
  }
  const H = (x, z) => heights.get(key(x, z)) || 0;
  for (const [k, h] of heights) {
    const [x, z] = k.split(',').map(Number);
    const neighbors = [H(x - 1, z), H(x + 1, z), H(x, z - 1), H(x, z + 1)];
    const min = Math.min(...neighbors);
    for (let y = -3; y < h; y++) {
      if (y < min - 1 && y < h - 1) continue;
      if (x >= -34 && x <= -32 && z >= 15 && z <= 19 && y > 0 && y < 3) continue;
      let color;
      if (y === h - 1) {
        const paved = houses.some(a => Math.abs(x - a.x) < a.w / 2 + 0.9 && Math.abs(z - a.z) < a.d / 2 + 0.8)
          || (x > -4 && x < 9 && z > -5 && z < 2) || (z >= 8 && z <= 9 && x > -25 && x < 20);
        color = paved ? pick(['#bfb197', '#c9baa0', '#b6a68a', '#c1b196']) : pick(['#879565', '#929d6c', '#a0a274', '#7d8c5e', '#a7a77b']);
      } else if (y < 1) color = pick(['#65796b', '#778573', '#82907c', '#697c70']);
      else if (y < 4) color = pick(['#8c8773', '#a19b81', '#b0a487', '#93947c']);
      else if (y % 5 === 0) color = pick(['#a18f78', '#a6947b', '#ad9a7f']);
      else color = pick(colors.stone);
      box(x + 0.5, y + 0.5, z + 0.5, 1, 1, 1, color);
      if (y > 2 && y < h - 2 && min < y && rnd() < 0.025) box(x + 0.5, y + 0.35, z + 0.54, 1.1, 0.3, 1.1, '#9b987c');
    }
    if (h > 2 && rnd() < 0.045 && !houses.some(a => Math.abs(x - a.x) < a.w / 2 + 1 && Math.abs(z - a.z) < a.d / 2 + 1)) {
      box(x + rnd(), h + 0.16, z + rnd(), 0.36, 0.32, 0.36, pick(colors.leaf));
    }
  }

  // Retaining walls and the two stone lanes overlooking the sea.
  function wall(x, y, z, length, axis = 'x', height = 0.8) {
    for (let i = 0; i < length; i += 0.65) {
      const p = axis === 'x' ? [x + i, y + height / 2, z] : [x, y + height / 2, z + i];
      box(...p, axis === 'x' ? 0.63 : 0.5, height, axis === 'x' ? 0.5 : 0.63, pick(colors.stone));
      if (i % 2 < 0.7) box(p[0], y + height + 0.1, p[2], 0.63, 0.2, 0.63, '#d3c4a7');
    }
  }
  for (const [x, y, z, len] of [[-26, 8, 1.1, 19], [-25, 12, -6.1, 32], [-24, 4, 9.7, 43], [-25, 18, -13.2, 14]]) wall(x, y, z, len);
  // Switchback stairs are placed between the houses, with individual treads.
  function stairs(x, z, bottom, rise, length, axis = 'z', width = 1.7, direction = -1) {
    const n = Math.ceil(rise / 0.28);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, a = direction * length * t, top = bottom + rise * (i + 1) / n;
      box(x + (axis === 'x' ? a : 0), top - 0.2, z + (axis === 'z' ? a : 0),
        axis === 'x' ? length / n + 0.02 : width, 0.4, axis === 'z' ? length / n + 0.02 : width, i % 3 === 0 ? '#d3c4a7' : '#c2b49a');
      if (i % 4 === 0) {
        const px = x + (axis === 'x' ? a : width / 2 + 0.1), pz = z + (axis === 'z' ? a : width / 2 + 0.1);
        box(px, top + 0.32, pz, 0.18, 0.75, 0.18, '#8c8270');
      }
    }
  }
  stairs(-10.7, -12.9, 12, 6, 7.7, 'z', 1.6, -1);
  stairs(-3.8, 2.7, 4, 4, 5.5, 'z', 1.5, -1);
  stairs(-20.5, 10.8, 2, 2, 3.4, 'z', 1.6, -1);
  stairs(10.4, -3.8, 8, 4, 4.3, 'z', 1.4, -1);
  stairs(18.2, 12, 0.8, 3.2, 3.5, 'z', 2, -1);

  function flowerpot(x, y, z, scale = 1) {
    box(x, y + 0.22 * scale, z, 0.5 * scale, 0.44 * scale, 0.5 * scale, pick(['#aa6651', '#b77f58', '#ce9169']));
    box(x, y + 0.46 * scale, z, 0.6 * scale, 0.14 * scale, 0.6 * scale, '#c68d69');
    box(x, y + 0.65 * scale, z, 0.52 * scale, 0.36 * scale, 0.5 * scale, '#54764b');
    for (let i = 0; i < 4; i++) box(x + (rnd() - 0.5) * 0.5 * scale, y + (0.8 + rnd() * 0.15) * scale, z + (rnd() - 0.5) * 0.5 * scale, 0.18 * scale, 0.19 * scale, 0.18 * scale, pick(['#dca686', '#e5c06c', '#d48b87']));
  }
  function windowFrame(x, y, z, shutter, width = 0.95, height = 1.2) {
    box(x, y, z, width + 0.26, height + 0.25, 0.15, '#d6cfad');
    box(x, y, z + 0.09, width, height, 0.12, '#294d4d');
    box(x, y + 0.03, z + 0.16, width - 0.17, height - 0.14, 0.035, '#ffc986', 'window');
    box(x, y, z + 0.2, 0.09, height, 0.07, '#5a6860');
    box(x, y - 0.04, z + 0.2, width, 0.09, 0.07, '#5a6860');
    box(x, y - height / 2 - 0.12, z + 0.18, width + 0.45, 0.15, 0.35, '#e6d5af');
    for (const s of [-1, 1]) {
      box(x + s * (width / 2 + 0.3), y, z + 0.03, 0.35, height + 0.08, 0.14, shutter);
      for (let j = 0; j < 5; j++) box(x + s * (width / 2 + 0.3), y - height * 0.4 + j * height * 0.18, z + 0.12, 0.27, 0.055, 0.07, '#748374');
    }
  }
  function buildHouse(h) {
    stats.buildings++;
    at(h.x, h.y, h.z, h.yaw || 0, () => {
      const { w, d, h: ht } = h;
      const shutter = pick(['#526d61', '#597e73', '#54676a', '#795f50']);
      box(0, 0.17, 0, w + 0.5, 0.34, d + 0.5, '#a4947d');
      box(0, ht / 2 + 0.2, 0, w, ht, d, h.c);
      box(0, 0.55, 0.05, w + 0.05, 0.5, d + 0.05, '#b4a18a');
      box(0, ht + 0.13, 0, w + 0.23, 0.22, d + 0.26, '#e8d7b4');
      // Alternating corner quoins make the scale readable from every angle.
      for (let y = 0.8; y < ht; y += 0.75) for (const s of [-1, 1]) {
        box(s * (w / 2 - 0.17), y, d / 2 + 0.04, 0.36, 0.3, 0.17, '#d7c6a5');
        box(s * (w / 2 + 0.035), y, -d / 2 + 0.2, 0.13, 0.3, 0.42, '#d7c6a5');
      }
      const doorX = w * 0.23;
      box(doorX, 1.22, d / 2 + 0.06, 1.25, 2.1, 0.2, '#d9c9a6');
      box(doorX, 1.18, d / 2 + 0.19, 0.98, 1.9, 0.11, '#4a685f');
      for (let j = 0; j < 4; j++) box(doorX - 0.36 + j * 0.24, 1.15, d / 2 + 0.255, 0.025, 1.75, 0.02, '#344c48');
      box(doorX - 0.28, 1.1, d / 2 + 0.3, 0.1, 0.1, 0.06, '#dbb36a');
      box(doorX, 0.23, d / 2 + 0.35, 1.5, 0.25, 0.75, '#c8baa0');
      windowFrame(-w * 0.22, 1.8, d / 2 + 0.09, shutter, 1.05, 1.15);
      if (ht > 4.4) {
        for (const x of [-w * 0.23, w * 0.23]) windowFrame(x, ht - 1.05, d / 2 + 0.09, shutter, 0.95, 1.2);
        box(0, ht - 2.04, d / 2 + 0.08, w, 0.15, 0.16, '#d6c29d');
      }
      // Side and rear windows reward orbiting around the model.
      for (const side of [-1, 1]) at(side * (w / 2 + 0.06), 0, 0, side * Math.PI / 2, () => {
        windowFrame(0, ht > 4.4 ? ht - 1.15 : 2, 0, shutter, 0.8, 1.05);
      });
      at(0, 0, -d / 2 - 0.07, Math.PI, () => windowFrame(0, ht - 1.2, 0, shutter, 0.85, 1.1));
      const roofPalette = h.roof === 'slate' ? ['#576a67', '#657b72', '#748379', '#4d615e'] : colors.roof;
      const roofBase = ht + 0.38;
      for (let j = 0; j < w / 2 / 0.4; j++) {
        const ww = w - j * 0.8;
        if (ww > 0) for (const s of [-1, 1]) box(0, roofBase + j * 0.28, s * (d / 2 - 0.05), ww, 0.31, 0.24, h.c);
      }
      for (let x = -w / 2 - 0.35; x <= w / 2 + 0.35; x += 0.48) for (let z = -d / 2 - 0.38; z <= d / 2 + 0.38; z += 0.53) {
        const yy = roofBase + (w / 2 + 0.35 - Math.abs(x)) * 0.7;
        box(x, yy + 0.15, z, 0.485, 0.39, 0.528, pick(roofPalette));
      }
      for (let z = -d / 2 - 0.4; z < d / 2 + 0.5; z += 0.48) box(0, roofBase + (w / 2 + 0.35) * 0.7 + 0.24, z, 0.37, 0.34, 0.478, h.roof === 'slate' ? '#425955' : '#a84c36');
      box(-w * 0.26, roofBase + 1.2, -d * 0.22, 0.67, 2.2, 0.68, '#b6a48a');
      box(-w * 0.26, roofBase + 2.32, -d * 0.22, 0.9, 0.25, 0.87, '#c9b99a');
      box(-w * 0.26, roofBase + 2.47, -d * 0.22, 0.56, 0.1, 0.55, '#535d54');
      if (h.balcony && ht > 4.4) {
        const yy = ht - 1.92, zz = d / 2 + 0.6;
        box(0, yy, zz, w * 0.78, 0.18, 1.15, '#85725a');
        box(0, yy + 0.75, zz + 0.53, w * 0.79, 0.13, 0.13, '#52645a');
        for (let x = -w * 0.36; x < w * 0.38; x += 0.38) box(x, yy + 0.4, zz + 0.53, 0.09, 0.72, 0.1, '#52645a');
        for (const s of [-1, 1]) box(s * w * 0.38, yy + 0.4, zz, 0.1, 0.72, 1.13, '#52645a');
        flowerpot(-w * 0.26, yy + 0.12, zz, 0.8);
        flowerpot(w * 0.26, yy + 0.12, zz, 0.8);
      }
      if (h.awning) awning(-0.2, 2.8, d / 2 + 0.8, w * 0.88, 1.5, pick(['#bc6b4f', '#597c72', '#c09a54']));
      if (h.sign) {
        box(-w * 0.08, 2.65, d / 2 + 0.22, w * 0.74, 0.62, 0.2, '#645b48');
        labels.push({ text: h.sign, p: [h.x - w * 0.08, h.y + 2.65, h.z + d / 2 + 0.335], w: w * 0.69, h: 0.48, color: '#efdcac' });
      }
      if (h.clock) {
        box(0, ht + 0.7, d / 2 + 0.2, 1.3, 1.3, 0.18, '#ae8b61');
        box(0, ht + 0.7, d / 2 + 0.32, 1.08, 1.08, 0.1, '#e4d8b4');
        box(0, ht + 0.91, d / 2 + 0.39, 0.07, 0.46, 0.06, '#4c625c');
        box(0.2, ht + 0.7, d / 2 + 0.39, 0.45, 0.07, 0.06, '#4c625c');
      }
      flowerpot(-w / 2 - 0.25, 0.1, d / 2, 1.1);
      if (rnd() > 0.5) flowerpot(w / 2 + 0.25, 0.1, d / 2 - 0.2, 0.85);
      if (h.laundry) {
        const yy = ht - 0.1, zz = d / 2 + 1.2;
        for (const s of [-1, 1]) box(s * w / 2, yy - 0.55, zz, 0.1, 1.7, 0.1, '#816c51');
        for (let i = 0; i <= 45; i++) {
          const t = i / 45;
          box(-w / 2 + w * t, yy + 0.25 - Math.sin(t * Math.PI) * 0.3, zz, 0.13, 0.06, 0.06, '#817964');
        }
        for (let i = 0; i < 5; i++) {
          const xx = -w * 0.36 + i * w * 0.18, c = pick(['#eee1bd', '#95acaa', '#d49a7c', '#d5bc7d']);
          box(xx, yy - 0.3, zz, 0.59, 0.85, 0.08, c);
          if (i % 2) box(xx, yy - 0.07, zz, 0.96, 0.25, 0.09, c);
        }
      }
    });
  }
  function awning(x, y, z, w, d, color) {
    for (let i = 0; i < w / 0.42; i++) {
      const xx = x - w / 2 + i * 0.42;
      for (let j = 0; j < 4; j++) box(xx, y - j * 0.11, z - d / 2 + j * d / 4, 0.43, 0.14, d / 4 + 0.02, i % 2 ? '#e8d6ad' : color);
      box(xx, y - 0.49, z + d / 2 - 0.18, 0.43, 0.25, 0.12, i % 2 ? '#e8d6ad' : color);
    }
    for (const s of [-1, 1]) box(x + s * w / 2, y / 2 - 0.2, z + d / 2 - 0.2, 0.1, y - 0.4, 0.1, '#77694f');
  }
  houses.forEach(buildHouse);

  function tree(x, y, z, kind = 'cypress', scale = 1) {
    stats.trees++;
    at(x, y, z, rnd() * 6.28, () => {
      box(0, 1.6 * scale, 0, 0.4 * scale, 3.2 * scale, 0.4 * scale, '#7e7151');
      if (kind === 'cypress') {
        for (let j = 0; j < 10; j++) {
          const t = j / 10, r = (0.8 * Math.sin(Math.PI * (t * 0.8 + 0.15)) + 0.1) * scale;
          for (let k = 0; k < 3; k++) box((rnd() - 0.5) * r * 0.5, (1.5 + j * 0.42) * scale, (rnd() - 0.5) * r * 0.5, r * 1.4, 0.67 * scale, r * 1.4, pick(colors.leaf));
        }
      } else if (kind === 'pine') {
        for (let level = 0; level < 4; level++) {
          const rad = (2 - level * 0.37) * scale, yy = (1.9 + level * 0.95) * scale;
          for (let dx = -rad; dx <= rad; dx += 0.65 * scale) for (let dz = -rad; dz <= rad; dz += 0.65 * scale) {
            if (Math.abs(dx) + Math.abs(dz) < rad * 1.4) box(dx, yy + rnd() * 0.2, dz, 0.85 * scale, 0.65 * scale, 0.85 * scale, pick(colors.leaf));
          }
        }
      } else {
        for (let i = 0; i < 18; i++) {
          const a = rnd() * Math.PI * 2, r = rnd() * 1.8 * scale;
          box(Math.cos(a) * r, (2.3 + rnd() * 1.5) * scale, Math.sin(a) * r, 1.25 * scale, 0.85 * scale, 1.25 * scale, pick(['#788559', '#8c9665', '#9a9f70', '#64794f']));
        }
      }
    });
  }
  for (const t of [[-27,-18,'pine',1.05],[-25,-22,'pine',0.9],[-6,-21,'cypress',1.15],[-9,-26,'pine',0.75],[-29,-12,'cypress',1],[-29,-7,'cypress',0.9],[-30,0,'olive',0.8],[-28,5,'cypress',0.95],[-8,-15,'cypress',0.85],[0,-17,'cypress',1], [9,-15,'olive',0.8], [12,-12,'cypress',0.85],[-18,2,'olive',0.65],[-12,2,'cypress',0.7],[-26,11,'olive',0.85],[20,-4,'cypress',0.75],[25,-15,'cypress',0.9],[34,-17,'cypress',0.9],[36,-11,'olive',0.8],[29,-4,'cypress',0.8]]) {
    const [x,z,kind,s] = t, y = H(Math.floor(x),Math.floor(z));
    if (y) tree(x, y, z, kind, s);
  }

  // The beacon is a hollow voxel tower, with a walkable lantern gallery.
  const lx = -14, lz = -18, ly = 18;
  disk(lx, ly + 0.3, lz, 4.6, 0.6, ['#cdbb98', '#c3b18f'], 0.6);
  for (let j = 0; j < 28; j++) {
    const y = ly + 0.8 + j * 0.6, r = 2.85 - j * 0.025;
    const stripe = (j >= 7 && j < 10) || (j >= 19 && j < 22);
    disk(lx, y, lz, r, 0.6, stripe ? ['#b3553f', '#c1664b', '#b95b40'] : ['#eadfbb', '#e4d6b1', '#dfd2ae', '#eee3c2'], 0.6, r - 0.84);
  }
  box(lx, ly + 1.65, lz + 2.83, 1.25, 2.6, 0.2, '#c0ab89');
  box(lx, ly + 1.55, lz + 2.96, 0.95, 2.25, 0.15, '#3e5d58');
  for (const [yy, zz] of [[23.1,2.58],[29.2,2.35],[33.3,2.2]]) {
    box(lx, yy, lz + zz, 0.74, 1.28, 0.19, '#baa984');
    box(lx, yy + 0.03, lz + zz + 0.13, 0.45, 1.01, 0.1, '#ffcf8a', 'window');
    box(lx, yy + 0.03, lz + zz + 0.2, 0.06, 1.03, 0.05, '#58675b');
  }
  const gallery = 35.7;
  disk(lx, gallery, lz, 3.95, 0.55, ['#c8b993', '#d5c6a0'], 0.5);
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2, x = lx + Math.cos(a) * 3.66, z = lz + Math.sin(a) * 3.66;
    box(x, gallery + 0.8, z, 0.14, 1.3, 0.14, '#4c655d');
    box(x, gallery + 1.45, z, 0.58, 0.15, 0.58, '#50655b');
  }
  disk(lx, 36.25, lz, 2.5, 0.3, '#52655d', 0.5);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    box(lx + Math.cos(a) * 2.2, 37.65, lz + Math.sin(a) * 2.2, 0.22, 2.8, 0.22, '#415a52');
  }
  box(lx, 37.55, lz, 2.25, 1.1, 2.25, '#ffe2a3', 'beacon');
  box(lx, 37.55, lz, 0.55, 2.4, 0.55, '#fff1c0', 'beacon');
  disk(lx, 39.1, lz, 2.7, 0.25, '#4b6056', 0.5);
  for (let j = 0; j < 6; j++) disk(lx, 39.4 + j * 0.45, lz, 3.1 - j * 0.48, 0.48, colors.roof, 0.45);
  box(lx, 42.85, lz, 0.18, 1.4, 0.18, '#4d6056');
  box(lx + 0.45, 43.2, lz, 1.1, 0.13, 0.13, '#4d6056');
  box(lx + 0.84, 43.35, lz, 0.28, 0.42, 0.1, '#a9513e');
  stats.buildings++;

  // Arched stone bridge across the channel to the mill island.
  for (let x = 16; x <= 26.5; x += 0.5) {
    const t = (x - 21.25) / 5.5;
    const bottom = 2.9 + Math.sqrt(Math.max(0, 1 - t * t)) * 5;
    box(x, 9.1, -9.2, 0.51, 0.45, 2.6, '#c4b493');
    for (const z of [-10.5, -7.9]) {
      for (let y = bottom; y < 9; y += 0.5) box(x, y + 0.25, z, 0.51, 0.5, 0.6, pick(colors.stone));
      box(x, 9.72, z, 0.51, 0.85, 0.45, '#cdbf9f');
      box(x, 10.18, z, 0.55, 0.17, 0.53, '#decdab');
    }
  }
  for (const x of [16, 26.5]) box(x, 3.7, -9.2, 1.5, 10.4, 3.6, '#ac9b7d');

  // Windmill with individually latticed, animated canvas sails.
  const mx = 30, mz = -12, my = 9;
  disk(mx, my + 0.2, mz, 3.6, 0.4, colors.stone, 0.5);
  for (let j = 0; j < 16; j++) {
    const r = 2.5 - j * 0.055;
    disk(mx, my + 0.55 + j * 0.5, mz, r, 0.5, ['#e0d2ac', '#d4c39c', '#e7d7b3'], 0.5, r - 0.7);
  }
  box(mx, my + 1.35, mz + 2.49, 1.15, 2.3, 0.2, '#485d53');
  for (let j = 0; j < 5; j++) disk(mx, my + 8.75 + j * 0.4, mz, 2.7 - j * 0.49, 0.43, ['#695f4b', '#7d6c50', '#8d7959'], 0.45);
  const millId = 'mill-sails';
  animations.push({ id: millId, type: 'mill', p: [mx, my + 7.1, mz + 2.18], r: [0, 0, 0] });
  at(0, 0, 0, 0, () => {
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2, co = Math.cos(a), si = Math.sin(a);
      const b = (x,y,z,sx,sy,sz,c) => box(x*co-y*si,x*si+y*co,z,sx,sy,sz,c,'solid',[0,0,a]);
      b(3.05,0,0,6.2,0.19,0.2,'#745c42');
      b(4.25,0.58,0.08,3.15,0.12,0.12,'#92774f');
      b(4.25,-0.58,0.08,3.15,0.12,0.12,'#92774f');
      for (let j=0;j<9;j++) {
        b(2.8+j*0.37,0,0.06,0.11,1.3,0.12,'#8d7350');
        if (j>1) b(2.8+j*0.37,0,0.13,0.28,1.05,0.07,j%2?'#d2bd8b':'#e3d1a3');
      }
    }
    box(0,0,0.18,0.72,0.72,0.65,'#7e6244');
    box(0,0,0.55,0.38,0.38,0.2,'#b69b6a');
  }, millId);
  stats.buildings++;
  flowerpot(27.6,9.2,-9.6,1.1);

  function crate(x,y,z,s=0.85,contents=null) {
    box(x,y+s/2,z,s,s,s,'#9b7d52');
    for (const dz of [-1,1]) {
      for (let j=0;j<3;j++) box(x,y+0.17+j*s*0.3,z+dz*s/2,s+0.04,0.07,0.06,'#6e5f43');
      for (const dx of [-1,1]) box(x+dx*s*0.39,y+s/2,z+dz*s/2,0.1,s,0.07,'#baa06c');
    }
    if (contents) for(let i=0;i<9;i++) box(x+(rnd()-0.5)*s*0.78,y+s+0.06,z+(rnd()-0.5)*s*0.78,0.23,0.2,0.23,pick(contents));
  }
  function barrel(x,y,z) {
    for (let j=0;j<3;j++) box(x,y+0.22+j*0.3,z,j===1?0.8:0.68,0.3,j===1?0.8:0.68,j===1?'#98754d':'#a38557');
    for(const yy of [0.2,0.7]) box(x,y+yy,z,0.81,0.12,0.81,'#5d6a5c');
  }
  function bench(x,y,z,yaw=0) {
    at(x,y,z,yaw,()=>{
      for(const s of [-1,1]) box(s*0.7,0.3,0,0.13,0.6,0.6,'#556656');
      for(let j=0;j<3;j++) box(0,0.61,-0.2+j*0.2,1.8,0.12,0.16,'#a38759');
      box(0,1,-0.3,1.8,0.16,0.11,'#a38759');
      box(0,1.25,-0.3,1.8,0.16,0.11,'#a38759');
      for(const s of [-1,1]) box(s*0.7,0.98,-0.3,0.12,0.8,0.12,'#556656');
    });
  }
  function lamp(x,y,z) {
    box(x,y+0.12,z,0.55,0.24,0.55,'#5a6554');
    box(x,y+1.6,z,0.14,3.1,0.14,'#506153');
    box(x,y+3.3,z,0.65,0.13,0.65,'#4d5b4d');
    box(x,y+2.94,z,0.4,0.6,0.4,'#ffd28a','window');
    box(x,y+2.6,z,0.58,0.14,0.58,'#526153');
    for(const sx of [-1,1]) for(const sz of [-1,1]) box(x+sx*0.23,y+2.96,z+sz*0.23,0.07,0.7,0.07,'#526153');
  }
  for(const p of [[-24,8,1],[-15,8,1.1],[-8,12,-6.1],[5,12,-6],[-24,4,9.7],[-12,4,9.7],[0,4,9.7],[12,4,9.5],[18,4,7],[27,9,-9.2],[-24,2,14]]) lamp(...p);
  bench(0.2,8.1,1.2);
  bench(6.7,8.1,-0.1,Math.PI/2);
  bench(-7,18.1,-15,Math.PI/2);
  bench(6,4.1,9.1,Math.PI);

  // The piazza: a stepped fountain, orange seller, and a tiny cafe terrace.
  disk(1,8.2,-1.5,2.05,0.35,['#a89f83','#b2a88b'],0.45);
  disk(1,8.5,-1.5,1.75,0.4,'#d5c4a0',0.4,1.27);
  disk(1,8.5,-1.5,1.25,0.16,'#589c94',0.35);
  box(1,9.15,-1.5,0.4,1.3,0.4,'#d4c39f');
  disk(1,9.7,-1.5,0.9,0.2,'#d9cba9',0.3);
  box(1,9.95,-1.5,0.23,0.4,0.23,'#739d8b');
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]) {
    for(let j=0;j<7;j++) box(1+Math.cos(a)*j*0.13,9.74-j*j*0.023,-1.5+Math.sin(a)*j*0.13,0.09,0.14,0.09,'#a5cec0','waterfall');
  }
  at(6.1,8,-3,0,()=>{
    box(0,0.6,0,3.1,1.2,1.15,'#997952');
    awning(0,2.6,0,3.8,2.4,'#b77b48');
    for(const x of [-0.9,0,0.9]) crate(x,1.2,0,0.82,['#c7903e','#dca753','#dcbd60']);
    crate(2.1,0,0,0.8); crate(2.1,0.8,0,0.7);
  });
  for(const p of [[-8,4.1,9],[-5.6,4.1,9.3],[-6.8,4.1,11]]) {
    const [x,y,z]=p;
    box(x,y+0.5,z,0.15,1,0.15,'#5c6f5f');
    box(x,y+1.04,z,1.25,0.15,1.15,'#c4b38e');
    box(x+0.27,y+1.18,z,0.17,0.14,0.17,'#ded9b5');
    box(x-0.25,y+1.15,z+0.1,0.3,0.06,0.3,'#d9bd81');
    bench(x,y,z+0.9,Math.PI);
  }

  // Timber piers and hand-set dock planks.
  function pier(x,z,len,width=2.4,y=0.85) {
    for(let i=0;i<len;i+=0.4) box(x,y,z+i,width,0.22,0.36,pick(colors.wood));
    for(const side of [-1,1]) {
      box(x+side*(width/2-0.18),y-0.23,z+len/2,0.18,0.25,len,'#665a43');
      for(let i=0;i<len;i+=2.8) {
        box(x+side*(width/2+0.08),y-0.75,z+i,0.3,3.4,0.3,'#665e46');
        box(x+side*(width/2+0.08),y+0.98,z+i,0.4,0.18,0.4,'#b0a082');
        for(let j=0;j<3;j++) box(x+side*(width/2+0.08),y+0.45+j*0.1,z+i,0.36,0.06,0.36,'#bbac7d');
      }
    }
  }
  pier(-17.1,15,12.5,2.8);
  pier(5.2,10.1,9.5,2.3);
  pier(17.8,10.1,7,2.4);
  for(let i=0;i<8;i++) box(-12.9+i*0.4,0.85,23.4,0.37,0.22,4.5,pick(colors.wood));
  for(const p of [[-18,2,15],[-22.2,2,15.2],[-16.9,1,18],[-16.8,1,19.1],[5,1,14.2],[18,1,12.8]]) crate(...p,0.8);
  for(const p of [[-23.7,2,14.9],[-22.8,2,16.3],[-16.7,1,21.2],[5.5,1,11.7]]) barrel(...p);
  // Rope coil rendered as a square spiral.
  for(let i=0;i<18;i++) {const a=i*0.6,r=0.1+i*0.018;box(-17.5+Math.cos(a)*r,1.04,24+Math.sin(a)*r,0.16,0.08,0.16,'#c6b27e');}

  function boat(id,x,z,yaw,len=7,width=2.8,style='fishing',color='#557b75') {
    stats.boats++;
    animations.push({id,type:'boat',p:[x,0.04,z],r:[0,yaw,0],phase:rnd()*6.28});
    at(0,0,0,0,()=>{
      const step=0.36;
      for(let j=0;j<4;j++) {
        const ll=len*(0.78+j*0.07),ww=width*(0.65+j*0.105);
        for(let xx=-ll/2;xx<=ll/2;xx+=step) {
          const half=ww/2*(1-(Math.abs(xx)/(ll/2+0.1))**3);
          for(let zz=-half;zz<half;zz+=step) {
            if(j<3&&Math.abs(zz)<half-step*1.4) continue;
            box(xx,0.14+j*0.3,zz,step+0.01,0.31,step+0.01,j===0?'#3a5854':j===3?'#e0c395':color);
          }
        }
      }
      for(let xx=-len*0.38;xx<len*0.4;xx+=0.34) box(xx,0.95,0,0.31,0.13,width*0.72*(1-(Math.abs(xx)/(len*0.48))**4),'#ad8d5e');
      if(style==='sail') {
        for(const [xx,mh] of [[-len*0.22,9.6],[len*0.2,12.3]]) {
          box(xx,1+mh/2,0,0.2,mh,0.2,'#7e6241');
          box(xx+1.35,mh*0.72,0.03,3.1,0.16,0.16,'#886d46');
          for(let yy=0;yy<mh*0.67;yy+=0.4) {
            const max=(1-yy/(mh*0.67))*3.6;
            for(let dx=0.3;dx<max;dx+=0.38) box(xx+dx,2.3+yy,0.12+Math.sin(dx*0.7)*0.25,0.39,0.41,0.13,pick(['#e5d5ac','#eddfbb','#ddcda5']));
          }
          line([xx,1,-width/2],[xx,mh+0.7,0],0.065,'#746648');
          line([xx,1,width/2],[xx,mh+0.7,0],0.065,'#746648');
          line([xx,mh+0.6,0],[len*0.48,1.2,0],0.06,'#746648');
          box(xx+0.5,mh+0.5,0,0.9,0.38,0.08,'#bc6848');
        }
        box(-len*0.27,1.3,0,2.2,0.62,width*0.65,'#7e6749');
        for(const ss of [-1,1]) box(0,1.42,ss*width*0.4,len*0.63,0.15,0.12,'#805f40');
        box(-len*0.48,1.3,0,1.7,0.17,0.18,'#79623f');
      } else {
        box(-len*0.13,1.6,0,len*0.28,1.2,width*0.64,'#d9cfa9');
        box(-len*0.13,2.27,0,len*0.34,0.2,width*0.79,color);
        for(const s of [-1,1]) box(-len*0.13,1.85,s*width*0.33,len*0.2,0.46,0.08,'#3f6464');
        box(len*0.02,1.85,0,0.08,0.48,width*0.5,'#517772');
        box(-len*0.24,2.7,0,0.2,0.75,0.24,'#695e47');
        box(len*0.27,2.6,0,0.13,3.4,0.13,'#7e6946');
        box(len*0.27,3.7,0,0.16,0.12,width*1.4,'#816b45');
        line([len*0.27,4.3,0],[len*0.4,1.4,width*0.38],0.055,'#a39569');
        crate(len*0.24,1.07,0,0.65,['#8ea9a1','#bcc9b7']);
        box(-len*0.4,1.3,width*0.47,0.6,0.65,0.18,'#d9c49b');
        box(-len*0.4,1.3,width*0.49,0.28,0.3,0.2,color);
      }
      // Flat pixel wake belongs to the moving boat.
      for(let i=0;i<14;i++) box(-len*0.55-rnd()*2,0.06,(rnd()-0.5)*width*1.3,0.25+rnd()*0.7,0.035,0.13,'#b0d8c5','foam');
    },id);
  }
  boat('schooner',20.5,24,-0.35,11.8,3.9,'sail','#5c7c71');
  boat('fishing-red',-11.5,21.5,Math.PI/2,6.7,2.55,'fishing','#a85840');
  boat('fishing-teal',9.8,14,0.1,6.2,2.5,'fishing','#4d7b75');
  boat('fishing-mustard',-22.4,23.5,Math.PI/2+0.1,5.5,2.3,'fishing','#b98c48');

  function cat(x,y,z,color='#bd8c54',yaw=0) {
    at(x,y,z,yaw,()=>{
      box(0,0.32,0,0.37,0.5,0.65,color);
      box(0,0.66,0.26,0.42,0.38,0.37,color);
      for(const s of [-1,1]) {box(s*0.14,0.91,0.25,0.13,0.2,0.16,color);box(s*0.12,0.7,0.46,0.055,0.055,0.025,'#344b41');}
      box(0.05,0.48,-0.48,0.13,0.65,0.13,color);
      for(const s of [-1,1]) box(s*0.12,0.1,0.2,0.13,0.2,0.28,'#d9c69e');
    });
  }
  cat(-16.6,1.02,25.8,'#c59b62',1);
  cat(-11.6,19.8,-7.3,'#c0bda6',0.7);
  cat(-6.2,4.2,9.5,'#6c7361',-0.5);

  // Small residents follow short routes; every route stays on its own terrace.
  function person(i,start,end,coat,hat=false) {
    const id=`resident-${i}`;
    stats.people++;
    animations.push({id,type:'person',p:start,end,r:[0,0,0],phase:rnd()*6.28});
    at(0,0,0,0,()=>{
      for(const s of [-1,1]) box(s*0.15,0.29,0,0.19,0.55,0.23,'#4d6059');
      box(0,0.86,0,0.6,0.65,0.36,coat);
      for(const s of [-1,1]) box(s*0.38,0.83,0,0.17,0.58,0.22,coat);
      box(0,1.37,0,0.4,0.4,0.38,'#d0aa80');
      box(0,1.59,-0.03,0.43,0.12,0.4,'#675d47');
      if(hat){box(0,1.68,0,0.72,0.12,0.64,'#c5ad78');box(0,1.82,0,0.42,0.2,0.4,'#cbb482');}
      else box(0,1.68,-0.08,0.43,0.17,0.3,'#675d47');
    },id);
  }
  const routes=[
    [[-20,12,-6.9],[-13.5,12,-6.9],'#b0654e',true],
    [[-6.5,12,-6.5],[3,12,-6.5],'#657e77',false],
    [[-22.5,8,0.8],[-18.5,8,0.8],'#c0a365',true],
    [[-1.5,8,0],[4,8,0],'#bd7859',false],
    [[5.3,8,-2],[5.5,8,-1.8],'#758d80',true],
    [[-20,4,9.1],[-14,4,9.1],'#647c7e',false],
    [[-3,4,9.1],[3.8,4,9.1],'#c29c58',true],
    [[10,4,8.6],[15,4,8.6],'#ba7052',false],
    [[-17.2,0.98,17],[-17.2,0.98,22],'#789388',true],
    [[18,9.4,-9.2],[25.1,9.4,-9.2],'#b68659',false],
    [[-17,18,-14],[-15.7,18,-14],'#5c7772',true],
  ];
  routes.forEach((r,i)=>person(i,...r));

  // Gull silhouettes use hinged wings, never textured sprites.
  for(let i=0;i<9;i++) {
    const id=`gull-${i}`;
    animations.push({id,type:'bird',p:[-22+i*5.5,25+rnd()*11,2-rnd()*26],phase:rnd()*6.28,radius:2+rnd()*3,r:[0,rnd()*6.28,0]});
    at(0,0,0,0,()=>{
      box(0,0,0,0.23,0.25,0.8,'#eee3c4');
      box(0,0.05,0.46,0.19,0.18,0.27,'#e7ddbf');
      box(0,0.02,0.64,0.12,0.08,0.17,'#bf9b59');
    },id);
    for(const side of [-1,1]) {
      const wingId=`${id}-wing-${side}`;
      animations.push({id:wingId,type:'wing',parent:id,side,p:[side*0.1,0,0],r:[0,0,0],phase:i});
      at(0,0,0,0,()=>{
        box(side*0.39,0,-0.08,0.8,0.12,0.4,'#e4dbbd');
        box(side*0.9,0.03,-0.2,0.42,0.1,0.28,'#c9c9b1');
      },wingId);
    }
  }

  // Green ivy follows the cliff face in broken vertical pixels.
  for(const [x,z,y,len] of [[-24,-6,12,3],[-17,1,8,3],[-9,2,8,3],[8,-6,12,3],[28,-3,6,3],[-26,9,4,2],[-4,-13,15,4]]) {
    for(let i=0;i<len*5;i++) box(x+(rnd()-0.5)*1.2,y-rnd()*len,z+0.6,0.3+rnd()*0.35,0.4,0.25,pick(colors.leaf));
  }
  // Individually scattered shore pebbles and reeds.
  for(let i=0;i<140;i++) {
    const x=-37+rnd()*77,z=-30+rnd()*60;
    if(H(Math.floor(x),Math.floor(z))===0 && [H(Math.floor(x)-1,Math.floor(z)),H(Math.floor(x)+1,Math.floor(z)),H(Math.floor(x),Math.floor(z)-1),H(Math.floor(x),Math.floor(z)+1)].some(h=>h>0)) {
      box(x,0.12,z,0.3+rnd()*0.7,0.2+rnd()*0.5,0.3+rnd()*0.7,pick(['#98a88b','#b1b395','#829a85']));
    }
  }

  const landmarks = [
    { id:'lighthouse',title:'不熄的灯',subtitle:'THE LIGHTHOUSE',p:[-14,39.8,-18],view:1,
      body:'每天日落，守塔人会走上七十二级台阶。最后一艘渔船归港以前，这束光不会熄灭。',detail:'环形观景台 · 双色塔身 · 旋转灯束' },
    { id:'harbor',title:'归航的地方',subtitle:'THE OLD HARBOR',p:[-17,4,23],view:2,
      body:'码头尽头的橘猫，总比钟楼更早知道渔船回来的时间。木箱里是今天的收获，咖啡馆还留着最后一张桌子。',detail:'四艘船 · 木栈桥 · 码头上的橘猫' },
    { id:'windmill',title:'借一阵海风',subtitle:'THE WINDMILL',p:[30,20,-9.5],view:3,
      body:'石桥连接着小镇和磨坊。风吹过帆叶，刚磨好的面粉就会沿着这座桥，送进山下的面包房。',detail:'格栅帆叶 · 拱形石桥 · 岛上磨坊' },
    { id:'piazza',title:'午后的余温',subtitle:'THE PIAZZA',p:[1,10,-1.5],view:4,
      body:'喷泉旁的橘子摊还没有收。有人走过，有人停下。海很大，岛上的日子却可以很慢。',detail:'流水喷泉 · 条纹遮阳篷 · 晾晒的衣物' },
  ];
  return { boxes, animations, labels, heights, stats, landmarks, water:WATER, seed:SEED };
}
