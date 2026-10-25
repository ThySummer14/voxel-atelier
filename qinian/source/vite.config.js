import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    fs: { allow: ['..'] },
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
  },
});
