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
const urlBase=`http://127.0.0.1:${server.address().port}`;
try {
 for (const width of [390,800,1440]) for (const lang of ['th','en']) {
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  try {
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(urlBase))failed.push(r.url());});
   await page.goto(`${urlBase}/b2c/rehair-opt1/index.html?lang=${lang}`,{waitUntil:'domcontentloaded'});
   const main=page.locator('main[data-programme="rehair"]');
   const hero=main.locator('.opt-hero');
   await hero.waitFor();
   await page.evaluate(()=>document.fonts.ready);
   check(await page.title()==='re:hair | Krane Clinic','canonical brand page title');
   check(await page.locator('html').getAttribute('lang')===lang,'document locale');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
   check(await main.locator('h1').count()===1&&/re:hair/.test(await main.locator('h1').textContent()),'one accessible programme heading');
   check(await hero.locator('.opt-hero-badges li').count()===3,'three hero benefits');
   const video=hero.locator('video.rebody-hero-video');
   check(await video.evaluate(v=>v.paused&&v.muted&&v.playsInline&&v.getAttribute('aria-hidden')==='true'),'reduced motion freezes decorative muted hero');
   const poster=await video.getAttribute('poster');
   check(Boolean(poster)&&(await page.request.get(new URL(poster,urlBase+'/b2c/').href)).ok(),'fallback hero image exists');
   // The current feature uses preference-driven autoplay, not the retired video toggle.
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.waitForFunction(()=>{const v=document.querySelector('.opt-hero video');return v&&!v.paused&&v.videoWidth>0;});
   check(await video.evaluate(v=>v.videoWidth>0),'video decodes and plays when motion is permitted');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('.opt-hero video')?.paused);
   check(await video.evaluate(v=>v.paused),'reducing motion during playback pauses the video');
   const timeline=main.locator('.opt-timeline-list details');
   check(await timeline.count()===3,'all three timeline stages present');
   check(await timeline.first().evaluate(e=>e.open),'first stage open on arrival');
   await timeline.nth(1).locator('summary').press('Enter');
   await page.waitForFunction(()=>document.querySelectorAll('.opt-timeline-list details[open]').length===1&&document.querySelectorAll('.opt-timeline-list details')[1].open);
   check(!(await timeline.first().evaluate(e=>e.open)),'keyboard opens second stage and closes first');
   const faq=main.locator('.opt-faq details').first();
   await faq.locator('summary').press('Enter');
   check(await faq.evaluate(el=>el.open),'FAQ remains keyboard-operable');
   const cta=main.locator('.opt-price .pricing-action').first();
   await cta.waitFor();
   if(lang==='en') {
    const waitFaq=text=>page.waitForFunction(text=>document.querySelector('.opt-faq h2')?.textContent.trim()===text,text);
    await waitFaq('Common questions');
    check((await cta.innerText()).trim()==='Start consultation','existing English pricing action visible');
    const language=page.locator('select[data-language]').first();
    await language.selectOption('th');
    await waitFaq('คำถามที่พบบ่อย');
    check((await cta.innerText()).trim()==='เริ่มปรึกษา','switching to Thai restores original unchanged strings');
   }
   // Intercept at the app boundary: do not enter patient intake or transmit opt-in.
   const requests=[];
   await page.route('**/krane-b2c.html*',route=>{requests.push(route.request().url());return route.fulfill({status:200,contentType:'text/html',body:'<title>Synthetic intake destination</title>'});});
   await cta.click();
   await page.waitForURL(u=>u.pathname==='/b2c/krane-b2c.html');
   const destination=new URL(page.url());
   check(destination.hash==='#intake1','existing hair intake anchor');
   check([...destination.searchParams].sort().toString()===[['category','hair-skin'],['entry','direct'],['fresh','1']].toString(),'only public routing keys sent, never visit answer or identifying info');
   check(requests.length===1,'single synthetic app-boundary request');
   check(errors.length===0,`no page errors: ${errors.join('; ')}`);
   check(failed.length===0,`successful same-origin assets: ${failed.join('; ')}`);
  } finally {await ctx.close();}
 }
console.log(`PASS ${checks} rehair opt1 assertions`);
} finally {await browser.close();await new Promise(r=>server.close(r));}
