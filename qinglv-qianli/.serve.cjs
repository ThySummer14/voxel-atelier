/* 本地静态服务：零依赖；仅监听回环地址，拒绝路径越界与畸形 URI。 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const defaultPort = 8912;
const parsedPort = Number(process.env.PORT || defaultPort);
const port = Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65535
  ? parsedPort
  : defaultPort;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function safeLogUrl(value) {
  return JSON.stringify(String(value || '').replace(/[\u0000-\u001f\u007f]/g, '?'));
}

function insideRoot(candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function send(req, res, status, message, extraHeaders = {}) {
  const body = Buffer.from(message);
  res.writeHead(status, {
    ...securityHeaders,
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  if (req.method === 'HEAD') res.end();
  else res.end(body);
}

const server = http.createServer((req, res) => {
  const t0 = Date.now();
  const rawUrl = String(req.url || '/');
  res.on('finish', () => console.log(`${req.method} ${safeLogUrl(rawUrl)} -> ${res.statusCode} ${Date.now() - t0}ms`));

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(req, res, 405, '405 Method Not Allowed\n', { Allow: 'GET, HEAD' });
    return;
  }

  const queryIndex = rawUrl.search(/[?#]/);
  const rawPath = queryIndex === -1 ? rawUrl : rawUrl.slice(0, queryIndex);
  if (rawPath.includes('\0')) {
    send(req, res, 400, '400 Bad Request\n');
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath || '/');
  } catch {
    send(req, res, 400, '400 Bad Request\n');
    return;
  }
  if (decodedPath.includes('\0')) {
    send(req, res, 400, '400 Bad Request\n');
    return;
  }

  let filePath = path.resolve(root, `.${decodedPath.startsWith('/') ? decodedPath : `/${decodedPath}`}`);
  if (decodedPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (!insideRoot(filePath)) {
    send(req, res, 403, '403 Forbidden\n');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      const notFound = error.code === 'ENOENT' || error.code === 'ENOTDIR' || error.code === 'EISDIR';
      send(req, res, notFound ? 404 : 500, `${notFound ? 404 : 500} ${notFound ? 'Not Found' : 'Internal Server Error'}\n`);
      return;
    }
    res.writeHead(200, {
      ...securityHeaders,
      'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') res.end();
    else res.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`青绿千里 server http://127.0.0.1:${port}/`);
});
