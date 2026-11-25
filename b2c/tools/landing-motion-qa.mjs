/* Motion behavior: real viewport exits, active-time clocks and preference changes. */
import {necessaryConsent} from './consent-test-fixture.mjs';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-motion-qa';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`).replace(/\/$/,''),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});let checks=0;const errors=[],check=(v,label)=>{assert(v,label);checks++};
// The shipped Landing uses the four-screen How carousel, not the retired
// pc-* card demos. Verify actual decoded assets and input/preference changes.
try {
for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'});await necessaryConsent(ctx);
 const p=await ctx.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/b2c/krane-b2c-landing.html?lang=en',{waitUntil:'domcontentloaded'});
 const section=p.locator('[data-how-carousel]'), slides=section.locator('[data-how-slide]'), viewport=section.locator('[data-how-viewport]');
 const stems=['assessment','video-consultation','delivery','follow-up'];
 check(await slides.count()===4,'All four service previews exist '+width);
 const current=()=>section.getAttribute('data-how-active');
 const set=async i=>{await section.locator('[data-how-go="'+i+'"]').click();await p.waitForFunction(i=>document.querySelector('[data-how-carousel]').dataset.howActive===String(i),i);};
 const source=async (i,ext)=>{
  const preview=slides.nth(i).locator('picture img');
  await preview.evaluate(img=>{img.loading='eager'});
  await p.waitForFunction(({i,ext,stem})=>{const img=document.querySelectorAll('[data-how-slide]')[i].querySelector('picture img');return img.complete&&img.naturalWidth>0&&new URL(img.currentSrc).pathname.endsWith('/'+stem+'.'+ext)},{i,ext,stem:stems[i]});
  check(await preview.evaluate((img,ext)=>new URL(img.currentSrc).pathname.endsWith('.'+ext),ext),'Selected asset decodes '+stems[i]+' '+ext+' '+width);
 };
 await set(1);await source(1,'gif');
 await p.emulateMedia({reducedMotion:'reduce'});await source(1,'png');
 for(let i=0;i<4;i++){
  await set(i);await source(i,'png');
  check(await slides.nth(i).getAttribute('aria-hidden')==='false'&&await section.locator('[aria-current="step"]').getAttribute('data-how-go')===String(i),'Accessible selection matches slide '+i+' '+width);
 }
 await viewport.focus(); await p.keyboard.press('ArrowLeft');
 await p.waitForFunction(()=>document.querySelector('[data-how-carousel]').dataset.howActive==='2');
 check(await current()==='2','Keyboard navigation works with reduced motion '+width);
 await p.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'})});await p.waitForTimeout(8300);
 check(await current()==='2','No offscreen auto-advance with reduced motion '+width);
 await viewport.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(8300);
 check(await current()==='2','No visible auto-advance with reduced motion '+width);
 await p.emulateMedia({reducedMotion:'no-preference'});await source(2,'gif');
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload({waitUntil:'domcontentloaded'});
 await set(3);await source(3,'png');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow '+width);
 await p.screenshot({path:join(out,'how-'+width+'.png'),animations:'disabled'});await ctx.close();
}
check(errors.length===0,'No browser errors: '+errors.join('; '));
await writeFile(join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(`Landing motion QA: ${checks} checks passed.`);
} finally {await browser.close();await new Promise(r=>server.close(r))}
