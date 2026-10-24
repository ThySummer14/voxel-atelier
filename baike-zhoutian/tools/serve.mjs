// 静态服务器 :8951，每请求一行日志（复验口径）。
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = 8951;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const path = url === '/' ? '/index.html' : url;
  const file = join(root, path);
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
    console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${url} ${data.length}b`);
  } catch {
    res.writeHead(404); res.end('404');
    console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${url} 404`);
  }
}).listen(port, () => console.log(`serve: http://localhost:${port}`));
