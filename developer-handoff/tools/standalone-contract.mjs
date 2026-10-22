import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {JSDOM} from 'jsdom';
import {chromium} from 'playwright';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(dir);
const manifest=JSON.parse(await fs.readFile(path.join(dir,'standalone-dependencies.json'),'utf8'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const rel=decodeURIComponent(url.pathname).replace(/^\/Krane-Clinic\//,'/');const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep))throw Error('outside root');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/Krane-Clinic`;
const results=[],baselineRoutes={};let checks=0;const check=(value,message)=>{assert(value,message);checks++;};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const page of manifest){const html=await fs.readFile(path.join(dir,'pages',page.id,'index.html'),'utf8');const doc=new JSDOM(html).window.document;
 check(/^<!doctype html>\s*<html/i.test(html),page.id+': full document');check(doc.querySelectorAll('.screen').length===1,page.id+': one screen');check(doc.querySelector('.screen').id===page.id,page.id+': own screen');check(!!doc.querySelector('meta[name="viewport"]'),page.id+': viewport');
 const scripts=[...doc.scripts].map(s=>s.getAttribute('src'));check(!scripts.some(s=>/shared\/runtime|krane-b2c(?:-handoff)?\.html/.test(s)),page.id+': no all-screen runtime');check(!scripts.some(s=>s.includes('/pages/')&&!s.includes('/pages/'+page.id+'/')),page.id+': no other page script');
 const urls=[...doc.querySelectorAll('[src],link[href]')].map(el=>el.getAttribute('src')||el.getAttribute('href')).filter(u=>u&&!/^(https?:|data:|#)/.test(u));
 for(const url of urls){const file=path.resolve(root,'b2c',url.split('?')[0]);check(file.startsWith(root+path.sep),page.id+': asset stays in repo');await fs.access(file);checks++;}
 }
 for(const entry of manifest){const ctx=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();await p.goto(`${base}/b2c/krane-b2c.html?screens=1&demoStage=${entry.id}#${entry.id}`,{waitUntil:'load'});await p.waitForFunction(()=>typeof show==='function'&&document.querySelector('.screen.active'));baselineRoutes[entry.id]=await p.locator('.screen.active').getAttribute('id');await ctx.close();}
 for(const width of [390,1440])for(const entry of manifest){const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage(),errors=[],missing=[],forbidden=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))missing.push(r.url())});
 await context.route('**/*',route=>{const u=route.request().url();if(/\/krane-b2c(?:-handoff)?\.html(?:[?#]|$)/.test(u)){forbidden.push(u);return route.abort();}if(!u.startsWith(base))return route.abort();return route.continue();});
 await page.goto(`${base}/developer-handoff/pages/${entry.id}/index.html?screens=1&demoStage=${entry.id}`,{waitUntil:'load'});
 await page.waitForFunction(()=>document.documentElement.dataset.pageReady==='true');await page.waitForTimeout(120);
 const view=await page.evaluate(()=>({count:document.querySelectorAll('.screen').length,active:document.querySelector('.screen.active')?.id,overflow:document.documentElement.scrollWidth>innerWidth,path:location.pathname,stageWidth:document.querySelector('.stage')?.getBoundingClientRect().width,screenReaderLabelsHidden:[...document.querySelectorAll('.care-journey .sr-only')].every(el=>el.getBoundingClientRect().height<=2)}));
 const allowed=[baselineRoutes[entry.id]];
 const item={id:entry.id,width,...view,errors:[...new Set(errors)],missing:[...new Set(missing)],forbidden};results.push(item);
 if(['login','intake3','articles','treatment-detail'].includes(entry.id))await page.screenshot({path:path.join(dir,'qa',`standalone-${entry.id}-${width}.png`)});
 check(view.count===1,entry.id+': browser mounts one screen');check(allowed.includes(view.active),entry.id+': seeded entry renders expected route, got '+view.active);check(!view.overflow,entry.id+': no document overflow');check(Math.abs(view.stageWidth-width)<2,entry.id+': no unused rail gap');check(view.screenReaderLabelsHidden,entry.id+': screen reader labels remain visually hidden');check(!errors.length,entry.id+': '+errors.join(';'));check(!missing.length,entry.id+': missing assets '+missing.join(';'));check(!forbidden.length,entry.id+': attempted original-app dependency');
 await context.close();console.log('PASS entry',width,entry.id);
 }
}finally{await fs.writeFile(path.join(dir,'qa','standalone-contract.json'),JSON.stringify({generatedAt:new Date().toISOString(),checks,baselineRoutes,results},null,2)+'\n');await browser.close();await new Promise(r=>server.close(r));}
console.log('PASS standalone contracts',checks,'checks,',results.length,'browser entries');
