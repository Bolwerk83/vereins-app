import http from 'http'; import fs from 'fs'; import path from 'path'
const root = process.cwd() + '/dist'
const types = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml' }
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end('nf')}else{r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d)}})}).listen(8099,()=>console.log('up'))
