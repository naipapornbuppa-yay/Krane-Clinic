/* Read-only approved-source references for Figma parity, not a production gate. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, relative, extname} from 'node:path';
import {necessaryConsent} from './consent-test-fixture.mjs';
const root=resolve(process.argv[2]||'.'),out=resolve(process.env.QA_OUTPUT||'/tmp/krane-programme-reference');
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{
 const f=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
 if(relative(root,f).startsWith('..'))throw Error('outside root');
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');
 res.end(await readFile(f));
}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({args:['--no-sandbox']}),results=[];
try{
 for(const programme of ['rebody','rehair','reflow'])for(const width of [390,1512]){
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await necessaryConsent(ctx);
  const p=await ctx.newPage(),errors=[],missing=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push({url:r.url(),status:r.status()})});
  await p.goto(`http://127.0.0.1:${server.address().port}/b2c/${programme}-opt1/index.html?lang=th`,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  await p.locator('img').evaluateAll(async imgs=>{for(const img of imgs){img.loading='eager';await img.decode().catch(()=>{})}});
  await p.evaluate(()=>{for(const video of document.querySelectorAll('video')){video.pause();video.currentTime=0}});
  const state=await p.evaluate(()=>({title:document.title,text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,sections:[...document.querySelectorAll('section')].map(el=>{const r=el.getBoundingClientRect();return{id:el.id,className:el.className,x:r.x,y:r.y+scrollY,w:r.width,h:r.height}}),brokenImages:[...document.images].filter(i=>i.currentSrc&&!i.naturalWidth).map(i=>i.getAttribute('src'))}));
  await p.screenshot({path:`${out}/approved-${programme}-th-${width}.png`,fullPage:true,animations:'disabled'});
  results.push({programme,width,...state,errors,missing});await ctx.close();
 }
 await writeFile(`${out}/approved-programmes.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.map(({programme,width,overflow,errors,missing,brokenImages})=>({programme,width,overflow,errors,missing,brokenImages})),null,2));
}finally{await browser.close();await new Promise(r=>server.close(r))}
