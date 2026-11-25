/* Weight reviews now have a labelled fictional rail on both surfaces and
   a separate supplied-video viewer on the dedicated re:body page. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
import {necessaryConsent} from './consent-test-fixture.mjs';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-weight-story-qa';
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',types[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||'http://127.0.0.1:'+server.address().port).replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
let checks=0;
const results=[],check=(v,label)=>{assert(v,label);checks++};
const ids=['weight-02','weight-04','weight-05','hair-pha','hair-03','confidence-real-med'];
try{for(const width of [390,800,1024,1440])for(const lang of ['th','en']){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await necessaryConsent(ctx);const p=await ctx.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
 const label=lang==='en'?'Fictional reviews for demo':'รีวิวจำลองเพื่อสาธิต';
 const verifyFictional=async(group,rail)=>{
   await group.waitFor();await p.evaluate(()=>document.fonts.ready);await rail.scrollIntoViewIfNeeded();
   check(await group.locator('.public-review-demo__label').innerText()===label,'Fictional reviews clearly distinguished and localized');
   check(await rail.getAttribute('tabindex')==='0','Rail reachable via keyboard');
   const cards=rail.locator(':scope > .public-review-card');
   check(await cards.count()===6,'All six fictional text cards retained on one rail');
   check(await cards.evaluateAll(es=>{const top=es[0].getBoundingClientRect().top;return es.every(e=>Math.abs(e.getBoundingClientRect().top-top)<1)}),'Only one card row');
   check(await cards.evaluateAll(es=>es.every(e=>e.querySelector('[role=img]')?.getAttribute('aria-label')&&e.querySelector('blockquote')?.textContent.trim()&&e.querySelector('small')?.textContent.trim())), 'Every card keeps rating, quote and location');
   check(await cards.evaluateAll(es=>es.every(e=>/^[A-F]\*\*\*$/.test(e.querySelector('.public-review-card__meta strong')?.textContent||''))),'Only fictional aliases in demo group');
   check(await group.locator('video,button[data-story]').count()===0,'No supplied video embedded inside fictional reviews');
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Review rail causes no page overflow');
   const canScroll=await rail.evaluate(r=>r.scrollWidth>r.clientWidth+2);
   if(width<=800)check(canScroll,'Mobile and tablet retain horizontal review overflow');
   if(canScroll){
     await rail.focus();await p.keyboard.press('ArrowRight');
     await p.waitForFunction(sel=>document.querySelector(sel).scrollLeft>0,await rail.evaluate(r=>'.'+r.classList[0]));
     check(await rail.evaluate(r=>r.scrollLeft>0),'Arrow advances the visible rail');
     await p.keyboard.press('ArrowLeft');
     await p.waitForFunction(sel=>document.querySelector(sel).scrollLeft<=2,await rail.evaluate(r=>'.'+r.classList[0]));
     check(await rail.evaluate(r=>r.scrollLeft<=2),'Arrow returns to the start');
   }
 };
 await p.goto(base+'/b2c/krane-b2c-landing.html?lang='+lang,{waitUntil:'domcontentloaded'});
 const chapter=p.locator('#weight-program'),group=chapter.locator('.public-review-demo');
 await verifyFictional(group,group.locator('.care-chapter__review-rail'));
 const details=chapter.locator('a[href="rebody-opt1/index.html"]').first();
 check(await details.count()===1,'Approved re:body details remains reachable from the weight chapter');
 await p.goto(base+'/b2c/rebody-opt1/index.html?lang='+lang,{waitUntil:'domcontentloaded'});
 const opt=p.locator('main[data-programme="rebody"]'),fg=opt.locator('.opt-feedback .public-review-demo');
 await verifyFictional(fg,fg.locator('.rebody-review-rail'));
 const rail=opt.locator('#programme-stories .opt-story-rail');
 const originals=rail.locator('button[data-story]:not([data-story-copy])');
 await rail.waitFor();
 assert.deepEqual(await originals.evaluateAll(xs=>xs.map(x=>x.dataset.story)),ids);checks++;
 check(await originals.evaluateAll(xs=>xs.every(x=>x.getAttribute('aria-label')?.trim())),'Supplied clips exposed through named buttons');
 check(await rail.locator('[data-story-copy]').evaluateAll(xs=>xs.every(x=>x.getAttribute('aria-hidden')==='true'&&x.tabIndex===-1)),'Motion copies are not keyboard targets');
 check(await rail.locator('video').count()===0,'Reduced-motion supplied carousel does not autoplay');
 const chosen=rail.locator('button[data-story="weight-04"]:not([data-story-copy])');
 await chosen.focus();await p.keyboard.press('Enter');
 const dlg=p.locator('.pc-story-viewer[open]');await dlg.waitFor();
 check(await dlg.locator('video').evaluate(v=>v.src.endsWith('/weight-04.mp4')&&v.muted),'Chosen original clip opens muted');
 check(await dlg.locator('.pc-story-bars > span').count()===6,'All supplied clips remain reachable');
 check(await dlg.locator('.pc-story-caption a').evaluate(a=>new URL(a.href).searchParams.get('category')==='weight'),'Weight story uses the existing weight intake link');
 await p.keyboard.press('ArrowRight');
 check(await dlg.locator('video').evaluate(v=>v.src.endsWith('/weight-05.mp4')),'Next selects the next supplied weight clip');
 await p.keyboard.press('ArrowLeft');
 check(await dlg.locator('video').evaluate(v=>v.src.endsWith('/weight-04.mp4')),'Previous returns to the first selected clip');
 const sound=dlg.locator('[data-story-sound]');await sound.click();
 check(await dlg.locator('video').evaluate(v=>!v.muted),'Sound toggles on explicitly');
 await sound.click();check(await dlg.locator('video').evaluate(v=>v.muted),'Sound toggles off explicitly');
 await p.keyboard.press('Escape');await dlg.waitFor({state:'hidden'});
 await p.waitForFunction(()=>document.activeElement?.dataset.story==='weight-04');
 check(await chosen.evaluate(e=>e===document.activeElement),'Viewer restores exact trigger focus');
 await p.waitForFunction(()=>{const v=document.querySelector('.pc-story-viewer video');return v.paused&&!v.hasAttribute('src')});
 check(await p.locator('.pc-story-viewer video').evaluate(v=>v.paused&&!v.hasAttribute('src')),'Viewer close stops and unloads video');
 check(errors.length===0,errors.join('\n'));results.push({width,lang,status:'passed'});
 }catch(e){results.push({width,lang,status:'failed',error:e.stack});throw e}finally{await ctx.close()}
}}finally{await browser.close();await new Promise(r=>server.close(r));await writeFile(join(out,'results.json'),JSON.stringify({checks,results},null,2))}
console.log('Weight reviews and stories: '+checks+' checks passed');
