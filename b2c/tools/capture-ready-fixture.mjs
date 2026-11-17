/* Read-only approved-source references for Figma parity, not a production gate. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, relative, extname} from 'node:path';
import {necessaryConsent} from './consent-test-fixture.mjs';
const root=resolve(process.argv[2]||'.'),out=resolve(process.env.QA_OUTPUT||'/tmp/krane-programme-reference');
await mkdir(out,{recursive:true});
const original=await readFile(resolve(root,'b2c/krane-b2c.html'),'utf8');
const fixture=original.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('<head>','<head><base href="/b2c/">');
const server=createServer(async(req,res)=>{try{
 if(req.url==='/ready-fixture.html'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}
 const f=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
 if(relative(root,f).startsWith('..'))throw Error('outside root');
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');
 res.end(await readFile(f));
}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']}),results=[];
try {for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`http://127.0.0.1:${server.address().port}/ready-fixture.html`,{waitUntil:'networkidle'});
 await p.evaluate(()=>{ 
for(const n of document.querySelectorAll('.screen'))n.classList.remove('active');
const w=document.querySelector('#waitroom');w.classList.add('active');w.dataset.queueState='ready';
w.querySelector('[data-wait-title]').textContent='ถึงคิวแล้ว!';w.querySelector('[data-wait-copy]').textContent='กดเข้าห้องได้เลย แพทย์นรินทร์ พร้อมเจอคุณแล้ว';
w.querySelector('[data-queue-clock]').hidden=true;w.querySelector('[data-queue-book]').hidden=true;
const b=w.querySelector('[data-wait-enter]');b.hidden=false;w.querySelector('[data-wait-enter-label]').textContent='เข้าห้องปรึกษา';
w.querySelector('[data-wait-visual]').classList.remove('state-view__visual--loading');w.querySelector('[data-wait-visual]').classList.add('state-view__visual--success','is-ready');w.querySelector('[data-wait-art]').setAttribute('href','#krane-state-enter-room');w.querySelector('[data-wait-timer]').textContent='05:00';
 });
 await p.evaluate(()=>document.fonts.ready);
 for(const timer of ['05:00','01:00']){
 await p.locator('[data-wait-timer]').evaluate((n,t)=>n.textContent=t,timer);
 const metrics=await p.locator('#waitroom').evaluate(w=>{const out={};for(const sel of [':scope','.screen__top','.screen__body','.state-view__visual','.krane-state-art','.state-view__copy','[data-wait-title]','[data-wait-copy]','[data-wait-enter]','[data-wait-timer]','.screen__footer']){const n=sel===':scope'?w:w.querySelector(sel);if(n){const r=n.getBoundingClientRect(),c=getComputedStyle(n);out[sel]={x:r.x,y:r.y,w:r.width,h:r.height,text:n.innerText,font:c.fontFamily,size:c.fontSize,weight:c.fontWeight,line:c.lineHeight,color:c.color,bg:c.backgroundColor,display:c.display};}}return out;});
 const name=`ready-${width}-${timer.replace(':','')}`;
 await p.screenshot({path:`${out}/${name}.png`,fullPage:true});
 await p.locator('#waitroom [data-wait-visual]').screenshot({path:`${out}/${name}-visual.png`,omitBackground:true});
 results.push({width,timer,metrics,errors});
 }
 await ctx.close();
}
await writeFile(`${out}/ready-state-reference.json`,JSON.stringify({source:'1db34f9',fixture:'All product scripts removed; static ready DOM only; no appointment or consultation actions',results},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
