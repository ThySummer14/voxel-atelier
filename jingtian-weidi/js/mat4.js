// 极简 mat4（列主序，与 three.Matrix4.fromArray 兼容）；浏览器与离线光栅器共用
export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
export function multiply(a, b, out = new Array(16)) {   // out = a * b
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i * 4 + j] = a[j] * b[i * 4] + a[4 + j] * b[i * 4 + 1] + a[8 + j] * b[i * 4 + 2] + a[12 + j] * b[i * 4 + 3];
    }
  }
  return out;
}
export function fromTRS(t, r, s = [1, 1, 1]) {
  // 旋转按 R = Rz * Ry * Rx
  const [sx, sy, sz] = [Math.sin(r[0]), Math.sin(r[1]), Math.sin(r[2])];
  const [cx, cy, cz] = [Math.cos(r[0]), Math.cos(r[1]), Math.cos(r[2])];
  const m = [
    cy * cz, cy * sz, -sy, 0,
    sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, 0,
    cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy, 0,
    t[0], t[1], t[2], 1,
  ];
  if (s[0] !== 1 || s[1] !== 1 || s[2] !== 1) {
    for (let i = 0; i < 3; i++) { m[i] *= s[0]; m[4 + i] *= s[1]; m[8 + i] *= s[2]; }
  }
  return m;
}
export function transformPoint(m, p, out = [0, 0, 0]) {
  const [x, y, z] = p;
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
export function lookAt(eye, target, up = [0, 1, 0]) {
  let z0 = eye[0] - target[0], z1 = eye[1] - target[1], z2 = eye[2] - target[2];
  let l = Math.hypot(z0, z1, z2) || 1; z0 /= l; z1 /= l; z2 /= l;
  let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
  l = Math.hypot(x0, x1, x2) || 1; x0 /= l; x1 /= l; x2 /= l;
  const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
  return [
    x0, y0, z0, 0,
    x1, y1, z1, 0,
    x2, y2, z2, 0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1,
  ];
}
export function perspective(fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, 2 * far * near / (near - far), 0,
  ];
}
export function cameraMatrix(yaw, pitch, dist, look) {
  const eye = [
    look[0] + dist * Math.sin(yaw) * Math.cos(pitch),
    look[1] + dist * Math.sin(pitch),
    look[2] + dist * Math.cos(yaw) * Math.cos(pitch),
  ];
  return { eye, view: lookAt(eye, look) };
}