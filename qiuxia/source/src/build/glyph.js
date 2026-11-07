// Render real glyphs (hanzi / digits) to a voxel bitmap via an offscreen canvas.

export function measureText(text, size = 24, px = 2, font = '"Songti SC","Noto Serif SC","STSong",serif') {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.font = `${size}px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width);
  return { w: Math.ceil(w / px), h: Math.ceil(size / px) };
}

// face: '-z' reads from -Z (canvas u -> +X), '+z' reads from +Z (u -> -X),
//       '-x' reads from -X (u -> +Z), '+x' reads from +X (u -> -Z)
export function stampText(world, text, ox, oy, oz, id, opts = {}) {
  const size = opts.size ?? 24;
  const px = opts.px ?? 2;
  const face = opts.face ?? '-z';
  const font = opts.font ?? '"Songti SC","Noto Serif SC","STSong",serif';
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.font = `${size}px ${font}`;
  const tw = Math.ceil(ctx.measureText(text).width) + 4;
  const th = size + 8;
  c.width = tw; c.height = th;
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  ctx.fillText(text, 2, 2);
  const img = ctx.getImageData(0, 0, tw, th).data;
  const W = Math.ceil(tw / px), H = Math.ceil(th / px);
  for (let v = 0; v < H; v++) {
    for (let u = 0; u < W; u++) {
      let on = false;
      for (let dy = 0; dy < px && !on; dy++)
        for (let dx = 0; dx < px && !on; dx++) {
          const sx = u * px + dx, sy = v * px + dy;
          if (sx < tw && sy < th && img[(sy * tw + sx) * 4 + 3] > 110) on = true;
        }
      if (!on) continue;
      const y = oy + (H - 1 - v);
      if (face === '-z') world.set(ox + u, y, oz, id);
      else if (face === '+z') world.set(ox - u, y, oz, id);
      else if (face === '-x') world.set(ox, y, oz + u, id);
      else world.set(ox, y, oz - u, id);
    }
  }
  return { w: W, h: H };
}