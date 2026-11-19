import { createViewer } from './renderer.mjs';
import { OPENING_TIME, VIEWS } from './world.mjs';
import { LIGHTS } from './atmosphere.mjs';

const query = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.querySelector('#stage');
const status = document.querySelector('#render-status');
const viewGroup = document.querySelector('#views');
const lightGroup = document.querySelector('#lights');
const motion = document.querySelector('#motion');
const full = document.querySelector('#full');
const reset = document.querySelector('#reset');
const archive = document.querySelector('#archive');
const capture = document.querySelector('#capture');
const caption = document.querySelector('#caption');
let view = Object.hasOwn(VIEWS, query.get('view')) ? query.get('view') : 'harbor';
let light = Object.hasOwn(LIGHTS, query.get('light')) ? query.get('light') : 'blue';
let playing = query.get('paused') !== '1' && !reduced.matches;
let viewer;

const plate = query.get('plate') === '1';
if (plate) document.body.classList.add('plate');
document.querySelector('#open-archive').addEventListener('click', event => {
  if (typeof archive.showModal !== 'function') return;
  event.preventDefault();
  archive.showModal();
});
archive.addEventListener('click', event => {
  if (event.target !== archive) return;
  const rect = archive.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom) archive.close();
});

function sync() {
  for (const button of viewGroup.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  }
  for (const button of lightGroup.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.light === light));
  }
  caption.textContent = VIEWS[view].note;
  motion.textContent = playing ? '暂停' : '播放';
  motion.setAttribute('aria-label', playing ? '暂停港口动画' : '播放港口动画');
  motion.removeAttribute('aria-pressed');
}

function shareState() {
  const next = new URL(location.href);
  for (const [key, value, normal] of [
    ['view', view, 'harbor'], ['light', light, 'blue'], ['paused', playing ? '' : '1', ''],
  ]) {
    if (value === normal) next.searchParams.delete(key);
    else next.searchParams.set(key, value);
  }
  try {
    history.replaceState(null, '', next.href);
  } catch {
    // Embedders may restrict access to the address bar.
  }
}

viewGroup.addEventListener('click', event => {
  const button = event.target.closest('button[data-view]');
  if (!button || !viewer) return;
  view = button.dataset.view;
  viewer.setView(view);
  sync();
  shareState();
});

lightGroup.addEventListener('click', event => {
  const button = event.target.closest('button[data-light]');
  if (!button || !viewer || light === button.dataset.light) return;
  light = button.dataset.light;
  viewer.setLight(light);
  sync();
  shareState();
});

reset.addEventListener('click', () => {
  viewer?.setView(view);
  viewer?.canvas.focus({ preventScroll: true });
});

motion.addEventListener('click', () => {
  playing = !playing;
  viewer?.togglePlaying(playing);
  sync();
  shareState();
});

reduced.addEventListener('change', event => {
  viewer?.setReduced(event.matches);
  if (event.matches) {
    playing = false;
    viewer?.togglePlaying(false);
    sync();
  }
});

function syncFull() {
  const expanded = stage.classList.contains('expanded') || document.fullscreenElement === stage;
  full.textContent = expanded ? '退出全屏' : '全屏';
  full.setAttribute('aria-pressed', String(expanded));
}

full.addEventListener('click', async () => {
  if (stage.classList.contains('expanded')) {
    stage.classList.remove('expanded');
    document.documentElement.style.overflow = '';
  } else if (document.fullscreenElement === stage) {
    await document.exitFullscreen();
  } else {
    try {
      await stage.requestFullscreen();
    } catch {
      stage.classList.add('expanded');
      document.documentElement.style.overflow = 'hidden';
    }
  }
  syncFull();
});
document.addEventListener('fullscreenchange', syncFull);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && stage.classList.contains('expanded')) {
    stage.classList.remove('expanded');
    document.documentElement.style.overflow = '';
    syncFull();
    full.focus();
  }
});

capture.addEventListener('click', async () => {
  if (!viewer) return;
  const report = document.querySelector('#capture-status');
  capture.disabled = true;
  report.textContent = '正在生成画面';
  try {
    const blob = await viewer.capture();
    if (!blob) throw new Error('Canvas archive was empty');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ['tidal-shift', view, light].join('-') + '.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    report.textContent = '画面已生成';
  } catch {
    report.textContent = '画面保存失败，请重试。';
  } finally {
    capture.disabled = false;
  }
});

function start() {
  try {
    const value = query.get('t');
    const time = value === null ? OPENING_TIME : Number(value);
    const startTime = Number.isFinite(time) && time >= 0 && time <= 3600 ? time : OPENING_TIME;
    viewer = createViewer(stage, { view, light, startTime, startPaused: !playing, reduced: reduced.matches, plate });
    viewGroup.disabled = lightGroup.disabled = reset.disabled = capture.disabled = false;
    status.hidden = true;
    stage.classList.add('ready');
    document.querySelector('#stage-tools').hidden = false;
    viewer.canvas.addEventListener('webglcontextlost', () => {
      stage.classList.remove('ready');
      status.textContent = '三维画面暂时中断，正在显示图版。';
      status.hidden = false;
    });
    viewer.canvas.addEventListener('webglcontextrestored', () => {
      viewer.setView(view, false);
      stage.classList.add('ready');
      status.hidden = true;
    });
  } catch (error) {
    console.warn('Tidal Shift could not start WebGL.', error);
    stage.querySelector('canvas')?.remove();
    status.textContent = '当前浏览器无法载入三维场景。可打开「图版与模型」继续查看。';
  }
}

sync();
status.textContent = '正在载入三维场景';
status.hidden = false;
requestAnimationFrame(start);
