import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 8964);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
    console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${pathname} ${data.length}b`);
  } catch {
    res.writeHead(404); res.end('Not found');
    console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${pathname} 404`);
  }
}).listen(port, () => console.log(`潮汐之山 http://localhost:${port}`));
