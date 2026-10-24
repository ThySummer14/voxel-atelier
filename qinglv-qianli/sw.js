const CACHE_VERSION = 'qinglv-qianli-shell-v2';
const SHELL_FILES = [
  './',
  './index.html',
  './css/style.css',
  './favicon.svg',
  './manifest.webmanifest',
  './assets/three.module.js',
  './assets/controls/OrbitControls.js',
  './assets/postprocessing/EffectComposer.js',
  './assets/postprocessing/MaskPass.js',
  './assets/postprocessing/OutputPass.js',
  './assets/postprocessing/Pass.js',
  './assets/postprocessing/RenderPass.js',
  './assets/postprocessing/ShaderPass.js',
  './assets/postprocessing/UnrealBloomPass.js',
  './assets/shaders/CopyShader.js',
  './assets/shaders/LuminosityHighPassShader.js',
  './assets/shaders/OutputShader.js',
  './js/main.js',
  './js/build-worker.js',
  './js/palette.js',
  './js/sculpt/arch.js',
  './js/sculpt/build.js',
  './js/sculpt/life.js',
  './js/sculpt/scene.js',
  './js/sculpt/score.js',
  './js/sculpt/terrain.js',
  './js/sculpt/water.js',
  './js/voxel/blocks.js',
  './js/voxel/core.js',
  './js/voxel/mesh.js',
];
const CACHEABLE_FILES = new Set(SHELL_FILES.map((file) => new URL(file, self.location.href).href));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const cacheUrl = new URL(request.url).href;
      if (response.ok && CACHEABLE_FILES.has(cacheUrl)) {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
