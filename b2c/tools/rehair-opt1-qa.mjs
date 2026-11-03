/* Additional page regression. Install at b2c/tools/rehair-opt1-qa.mjs. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-rehair-opt1-qa';
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{let f=join(root,decodeURIComponent(req.url.split('?')[0]));if((await stat(f)).isDirectory())f=join(f,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.ttf':'font/ttf'})[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
let checks=0;const check=(v,label)=>{assert(v,label);checks++;};
try {for(const width of [390,800,1440])for(const lang of ['th','en']){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const failed=[];page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 await page.goto(`http://127.0.0.1:${server.address().port}/b2c/rehair-opt1/index.html`,{waitUntil:'networkidle'});
 if(lang==='en')await page.locator('#language').click();
 await page.evaluate(()=>document.fonts.ready);
 check(await page.title()==='rehair (opt1) | Krane','page title');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page horizontal overflow');
 check(await page.locator('.eyebrow,.medication-explainer__eyebrow').count()===0,'no eyebrow nodes');
 check(await page.locator('h1').evaluate((el,lang)=>getComputedStyle(el).fontFamily.includes(lang==='th'?'Prompt':'IBM Plex Sans'),lang),'brand display font');
 check(await page.locator('body').evaluate((el,lang)=>getComputedStyle(el).fontFamily.includes(lang==='th'?'Noto Sans Thai':'IBM Plex Sans'),lang),'brand reading font');
 for(const sel of ['.video-stage','.timeline-panel'])check(await page.locator(sel).evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius)>=20),`rounded ${sel}`);
 check(await page.locator('#hero-video').evaluate(v=>v.paused),'initial reduced motion pauses');
 check((await page.locator('#video-toggle').innerText()).trim()==='','video control has no visible words');
 check(Boolean(await page.locator('#video-toggle').getAttribute('aria-label')),'video accessible name');
 await page.locator('#video-toggle').click();await page.waitForFunction(()=>!document.querySelector('#hero-video').paused);
 check(await page.locator('#hero-video').evaluate(v=>v.videoWidth>0),'video loaded and plays explicitly');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('#hero-video').paused);
 check(await page.locator('#hero-video').evaluate(v=>v.paused),'reduced-motion change pauses');
 for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());}
 for(const name of ['hair-mechanism-1.svg','hair-mechanism-2.svg','hair-mechanism-3.svg']){const response=await page.request.get(`http://127.0.0.1:${server.address().port}/b2c/rehair-opt1/assets/${name}`);check(response.ok(),`art asset ${name}`);}
 const card=page.locator('.medication-explainer__toggle').first();await card.click();check(await card.getAttribute('aria-expanded')==='true','medicine opens');await card.press('Escape');check(await card.getAttribute('aria-expanded')==='false','medicine Escape closes');
 await page.locator('.timeline-steps summary').nth(1).click();check(await page.locator('.timeline-steps details').nth(1).evaluate(e=>e.open),'timeline opens');
 await page.locator('.intro .consult').click();check(await page.locator('dialog').evaluate(e=>e.open),'quiz opens');check(await page.locator('#quiz-next').isDisabled(),'quiz requires selection');await page.locator('.concerns button').first().click();check(!(await page.locator('#quiz-next').isDisabled()),'quiz continue enabled');
 const requests=[];await page.route('**/krane-b2c.html*',route=>{requests.push(route.request().url());return route.fulfill({status:200,contentType:'text/html',body:'<title>Intake destination test</title>'});});
 await page.locator('#quiz-next').click();await page.waitForURL('**/krane-b2c.html*');const url=new URL(page.url());check(url.pathname==='/b2c/krane-b2c.html','existing intake page');check(url.hash==='#intake1?category=hair-skin&entry=direct&fresh=1','hair intake route intact');check(!url.href.includes('crown'),'quiz choice not transmitted');
 check(errors.length===0,`no page errors ${errors}`);check(failed.length===0,`assets successful ${failed}`);
 await ctx.close();
}
console.log(`PASS ${checks} rehair opt1 assertions`);
} finally {await browser.close();await new Promise(r=>server.close(r));}
