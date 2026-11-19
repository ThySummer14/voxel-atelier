import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const folder = new URL('../', import.meta.url);
const output = new URL('../', folder);
const local = (path) => new URL(path, folder);
const work = (path) => new URL(path, output);

const bundle = await build({
  entryPoints: [fileURLToPath(local('src/entry.mjs'))],
  outfile: fileURLToPath(work('viewer.js')),
  bundle: true,
  write: false,
  format: 'iife',
  target: ['es2022'],
  legalComments: 'none',
  minify: true,
  banner: { js: '/* 潮线交班 / Tidal Shift · gpt-6.2 sol. Source: source/src/. Licenses: THIRD_PARTY_NOTICES.txt. */' },
});

// GLSL template literals preserve dependency formatting through esbuild.
const source = bundle.outputFiles[0].text
  .replace(/[ \t]+$/gm, '')
  .replace(/^[ \t]+/gm, indentation => indentation.replaceAll('\t', '  '));
await writeFile(work('viewer.js'), source);

await copyFile(local('node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2'),
  work('barlow-condensed.woff2'));
const [three, barlow] = await Promise.all([
  readFile(local('node_modules/three/LICENSE'), 'utf8'),
  readFile(local('node_modules/@fontsource/barlow-condensed/LICENSE'), 'utf8'),
]);
await writeFile(work('THIRD_PARTY_NOTICES.txt'),
  ['Three.js 0.187.0', three, 'Barlow Condensed', barlow].join('\n\n'), 'utf8');
