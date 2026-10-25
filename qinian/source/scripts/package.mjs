import { cpSync, existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(import.meta.dirname, '..');
const root = resolve(source, '..');
const dist = resolve(source, 'dist');
if (!existsSync(resolve(dist, 'index.html'))) {
  throw new Error('vite build output missing; run npm run build first');
}

for (const name of ['index.html', 'assets', 'data']) {
  const from = resolve(dist, name);
  const to = resolve(root, name);
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
if (!html.includes('祈年')) throw new Error('packaged index.html does not look like 祈年');
writeFileSync(htmlPath, html);
console.log('packaged qinian/ from source/dist');
