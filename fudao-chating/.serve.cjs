const http=require('http');const fs=require('fs');const path=require('path');
const root='/Users/thysummer/工作流/code/浮岛茶庭';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
http.createServer((req,res)=>{
  let p=path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if(p.endsWith('/')) p+='index.html';
  if(!p.startsWith(root)) {res.writeHead(403);res.end();return;}
  fs.readFile(p,(e,d)=>{
    if(e){res.writeHead(404);res.end('no');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'text/plain'});
    res.end(d);
  });
}).listen(8877,'127.0.0.1',()=>console.log('voxel server on 8877'));
