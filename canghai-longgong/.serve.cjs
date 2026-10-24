const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.json': 'application/json' };
const PORT = 8765;
http.createServer((req, res) => {
  let fp = path.join(__dirname, decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
