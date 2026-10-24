const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
http.createServer((req,res)=>{
  let p=path.join(root,decodeURIComponent(req.url.split('?')[0]));
  if(p.endsWith('/'))p+=path.join('index.html');
  if(!p.startsWith(root)){res.writeHead(403);res.end();return;}
  fs.readFile(p,(e,d)=>{ if(e){res.writeHead(404);res.end('404 '+p);return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'text/plain','Cache-Control':'no-store'});res.end(d);});
}).listen(8911,'127.0.0.1',()=>console.log('liuli server :8899'));
