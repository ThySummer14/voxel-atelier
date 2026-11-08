const captions = {
  overview: '一块月壤剖面容纳了着陆点、车辙与撞击坑。',
  lander: '三角舷窗朝向扶梯。四具着陆支腿撑起金箔包覆的下降级。',
  rover: '网状车轮、双座与前置天线。车辙从挡泥板下延伸出去。',
  surface: '降到月面高度，沿着山谷望向挑战者和远处的地球。',
};

const viewport = document.querySelector('#viewport');
const host = document.querySelector('#canvas-host');
const status = document.querySelector('#load-state');
const display = document.querySelector('.display');
const buttons = [...document.querySelectorAll('[data-shot]')];
const light = document.querySelector('#light');
const spin = document.querySelector('#spin');
const screen = document.querySelector('#screen');
let stage;
let contextLost = false;
let selection = 0;

async function select(name) {
  const id = ++selection;
  status.textContent = name === 'surface' ? '正在绘制月谷' : '';
  try {
    if (!(await stage.setView(name)) || id !== selection) return;
    for (const btn of buttons) btn.setAttribute('aria-pressed', String(btn.dataset.shot === name));
    document.querySelector('#view-caption').textContent = captions[name];
    status.textContent = '';
  } catch (error) {
    if (id === selection) status.textContent = '月谷加载失败，可重新选择镜头。';
    console.error(error);
  }
}

function updateScreen() {
  const active = document.fullscreenElement === display || display.classList.contains('is-full');
  screen.textContent = active ? '退出全屏' : '全屏';
  screen.setAttribute('aria-pressed', String(active));
}
screen.addEventListener('click', async () => {
  if (document.fullscreenElement === display) await document.exitFullscreen();
  else if (display.classList.contains('is-full')) display.classList.remove('is-full');
  else {
    try { await display.requestFullscreen(); }
    catch { display.classList.add('is-full'); }
  }
  updateScreen();
});
document.addEventListener('fullscreenchange', updateScreen);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && display.classList.contains('is-full')) {
    display.classList.remove('is-full');
    updateScreen();
    screen.focus();
  }
});

function bindCamera() {
  const pointers = new Map();
  const span = () => {
    const [a, b] = pointers.values();
    return b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (contextLost || pointers.size >= 2) return;
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove', e => {
    if (contextLost) return;
    const prior = pointers.get(e.pointerId);
    if (!prior) return;
    const before = span();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (before > 5) stage.zoom(before / Math.max(5, span()));
    else if (pointers.size === 1) stage.orbit((e.clientX - prior.x) * .006, (e.clientY - prior.y) * .005);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    viewport.addEventListener(name, e => {
      pointers.delete(e.pointerId);
      if (!pointers.size) viewport.classList.remove('dragging');
    });
  }
  viewport.addEventListener('wheel', e => {
    if (contextLost) return;
    e.preventDefault();
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    stage.zoom(Math.exp(Math.max(-140, Math.min(140, delta)) * .00145));
  }, { passive: false });
  const keys = {
    ArrowLeft: () => stage.orbit(.10, 0),
    ArrowRight: () => stage.orbit(-.10, 0),
    ArrowUp: () => stage.orbit(0, .09),
    ArrowDown: () => stage.orbit(0, -.09),
    '+': () => stage.zoom(.91),
    '=': () => stage.zoom(.91),
    '-': () => stage.zoom(1.10),
    Home: () => select('overview'),
  };
  viewport.addEventListener('keydown', e => {
    if (contextLost || !keys[e.key]) return;
    e.preventDefault();
    keys[e.key]();
  });
}

async function start() {
  status.textContent = '正在装载三维展品';
  try {
    const { createStage } = await import('./stage.mjs');
    stage = createStage(host, {
      onMotion: active => spin.setAttribute('aria-pressed', String(active)),
      onFrame() {
        if (contextLost || viewport.dataset.ready) return;
        viewport.dataset.ready = 'true';
        status.textContent = '';
      },
    });
    for (const btn of buttons) btn.addEventListener('click', () => select(btn.dataset.shot));
    light.addEventListener('click', () => {
      const rim = stage.light === 'sun';
      stage.setLight(rim ? 'rim' : 'sun');
      light.setAttribute('aria-pressed', String(rim));
    });
    spin.addEventListener('click', () => stage.setSpin(spin.getAttribute('aria-pressed') !== 'true'));
    host.querySelector('canvas').addEventListener('webglcontextlost', () => {
      contextLost = true;
      stage.setSpin(false);
      delete viewport.dataset.ready;
      host.hidden = true;
      status.textContent = '三维连接已断开。刷新可重试，静态留影仍可浏览。';
      for (const btn of [...buttons, light, spin, screen]) btn.disabled = true;
    });
    for (const btn of [...buttons, light, spin, screen]) btn.disabled = false;
    updateScreen();
    bindCamera();
    if (new URLSearchParams(location.search).has('capture')) window.artwork = stage;
  } catch (error) {
    status.textContent = '此浏览器无法开启三维展品，可浏览下方留影。';
    console.error(error);
  }
}
requestAnimationFrame(() => setTimeout(start, 0));
