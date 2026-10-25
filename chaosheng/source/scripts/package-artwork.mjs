import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let html=await readFile(path.join(root,'dist/index.html'),'utf8');
const notices=await readFile(path.join(root,'public/THIRD_PARTY_NOTICES.txt'),'utf8');
html=html.replace('<head>',()=>`<head>\n<!-- Three.js runtime license\n${notices}\n-->`);
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
if(scripts.length!==1)throw new Error('Expected one self-contained application bundle');
for(const script of scripts){
  const code=(await readFile(path.join(root,'dist',script[1]),'utf8'))
    .replaceAll('</script','<\\/script')
    .replace(/[ \t]+$/gm,'').replace(/^ +(?=\t)/gm,'');
  html=html.replace(script[0],()=>`<script type="module">${code}</script>`);
}
const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
if(styles.length!==1)throw new Error('Expected one stylesheet');
for(const style of styles){
  const css=await readFile(path.join(root,'dist',style[1]),'utf8');
  html=html.replace(style[0],()=>`<style>${css}</style>`);
}
const icon=await readFile(path.join(root,'public/favicon.svg'));
html=html.replace('href="/favicon.svg"',()=>`href="data:image/svg+xml;base64,${icon.toString('base64')}"`);
const model=await readFile(path.join(root,'public/潮生-TIDEBORN.vox'));
html=html.replace('</body>',()=>`<script id="embedded-model" type="application/octet-stream">${model.toString('base64')}</script></body>`);
if(/(?:src|href)="\/assets\//.test(html))throw new Error('Standalone still contains a network asset');
await mkdir(path.join(root,'output'),{recursive:true});
await writeFile(path.join(root,'output/潮生-TIDEBORN.html'),html);
console.log(`Offline artwork packaged: output/潮生-TIDEBORN.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB), with embedded model download.`);
