// Lighting presets. Sun azimuth in degrees from north, clockwise; elevation in degrees.
// skyAmb lights shaded faces from above, ground is the bounce from the paving below.
export const MOODS = {
  qing: {
    label: '晴昼', en: 'Clear afternoon', note: '京城秋晴 · 蓝瓦映天',
    sun: [224, 38], sunColor: [2.05, 1.93, 1.74], zenith: '#0b2d9f', horizon: '#95b7de', ground: '#746750', skyAmb: '#6585c2',
    skyGround: '#95b7de', ambient: 0.98, fogColor: '#9fbadc', fog: 0.0008, exposure: 1.0, saturation: 1.0,
    night: 0, flood: 0, snow: 0, bloom: 0.08, sunSize: 1, groundColor: '#90a8c4', skyBright: 1.55, shadowFloor: 0.32, ui: 'light',
  },
  mu: {
    label: '暮色', en: 'Golden hour', note: '西照斜阳 · 宝顶生辉',
    sun: [250, 12], sunColor: [2.9, 1.82, 1.02], zenith: '#4d6fae', horizon: '#f0c49c', ground: '#a08a78', skyAmb: '#7f93c4',
    skyGround: '#f0c49c', ambient: 0.8, fogColor: '#eec8a8', fog: 0.0009, exposure: 1.0, saturation: 1.02,
    night: 0, flood: 0, snow: 0, bloom: 0.16, sunSize: 1.6, groundColor: '#d2bfb3', skyBright: 1.15, shadowFloor: 0.4, ui: 'light',
  },
  ye: {
    label: '夜灯', en: 'Floodlit night', note: '夜灯初上 · 金檐浮空',
    sun: [128, 34], sunColor: [0.2, 0.25, 0.4], zenith: '#132a5e', horizon: '#3f5a8f', ground: '#3a332e', skyAmb: '#2e4475',
    skyGround: '#3f5a8f', ambient: 0.75, fogColor: '#2b4070', fog: 0.0016, exposure: 1.08, saturation: 1.0,
    night: 1, flood: 1, snow: 0, bloom: 0.42, sunSize: 0.4, groundColor: '#1c2843', skyBright: 1.0, shadowFloor: 0.18, ui: 'dark',
  },
  xue: {
    label: '初雪', en: 'First snow', note: '瑞雪覆台 · 一殿素裹',
    sun: [200, 48], sunColor: [0.72, 0.74, 0.8], zenith: '#56647f', horizon: '#c9d1dc', ground: '#a9b0bb', skyAmb: '#9ea9bd',
    skyGround: '#c9d1dc', ambient: 1.0, fogColor: '#bfc8d4', fog: 0.0026, exposure: 1.05, saturation: 1.0,
    night: 0, flood: 0, snow: 1, bloom: 0.08, sunSize: 0.01, groundColor: '#c9d1dc', skyBright: 1.15, shadowFloor: 0.18, ui: 'light',
  },
};

export function sunVector(az, el) {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
}

// Camera views: azimuth from north (camera position), elevation, distance, target.
export const VIEWS = [
  { id: 'all', label: '全景', en: 'Overview', az: 162, el: 11, dist: 76, target: [0, 13.2, 5], fov: 34 },
  { id: 'front', label: '正立面', en: 'South front', az: 180, el: 4.2, dist: 64, target: [0, 16.2, 2], fov: 38 },
  { id: 'eaves', label: '檐下', en: 'Under the eaves', az: 160, el: -45, dist: 14.1, target: [4.1, 17.2, 11.28], fov: 50 },
  { id: 'crown', label: '宝顶', en: 'Gilded crown', az: 172, el: 9, dist: 34, target: [0, 31.5, 2] },
  { id: 'plan', label: '俯瞰', en: 'Plan', az: 180, el: 89.5, dist: 172, target: [0, 0, 0] },
  { id: 'section', label: '剖面', en: 'Section', az: 140, el: 19, dist: 92, target: [0, 13, 0], clip: true },
];
