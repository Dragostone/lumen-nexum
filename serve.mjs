import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.srt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  const url=new URL(req.url??'/', 'http://localhost');
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  const starterFile=relative==='starter/README.md'||relative==='starter/create-project.mjs';
  const path=starterFile?resolve(root,'..',relative):resolve(root,relative);
  if((!starterFile&&!path.startsWith(root.endsWith(sep)?root:root+sep))||(!types[extname(path)]&&!starterFile)){res.writeHead(403).end();return;}
  const info=await stat(path);if(!info.isFile()){res.writeHead(404).end();return;}
  let start=0,end=info.size-1,status=200;
  const range=req.headers.range;
  if(range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   status=206;
  }
  const headers={'Content-Type':types[extname(path)]??'text/plain; charset=utf-8','Content-Length':end-start+1,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
  if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{res.writeHead(404).end('Datei nicht gefunden.');}
});
server.listen(3218,'127.0.0.1',()=>console.log('Lernoberfläche: http://localhost:3218'));
process.on('SIGINT',()=>server.close());
process.on('SIGTERM',()=>server.close());
