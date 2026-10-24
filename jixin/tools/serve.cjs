// 极简静态服务 + 每请求一行日志（响应完成时打，方便定位"到底服务的是哪份代码"）
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8931);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const t0 = Date.now();
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? '/index.html' : url;
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  const log = (code, len) =>
    console.log(`${new Date().toISOString().slice(11, 23)} ${req.method} ${url} -> ${code} ${len}B ${Date.now() - t0}ms`);
  res.on('finish', () => { if (!res.writableEnded) log(res.statusCode, 0); });
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return log(404, 0);
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
    log(200, buf.length);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`机心 static -> http://127.0.0.1:${PORT}/  root=${ROOT}`);
});
