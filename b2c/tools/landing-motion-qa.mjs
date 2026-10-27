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
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'});await necessaryConsent(ctx);const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/b2c/krane-b2c-landing.html?lang=en',{waitUntil:'domcontentloaded'});
 await p.locator('.programme-chapter img').evaluateAll(async es=>{for(const e of es){e.loading='eager';await e.decode().catch(()=>{})}});await p.evaluate(()=>document.fonts.ready);
 const links=await p.locator('.pc-actions a').evaluateAll(es=>es.map(e=>e.href));
 await p.waitForFunction(()=>document.querySelector('.hero__intro-copy h1').dataset.motionState==='complete');
 check(await p.locator('[data-motion-kind="hero-product"]').count()===3,'Three supplied hero products staged '+width);
 const hair=p.locator('.pc-hair .pc-checkin>div').first();await hair.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
 await p.waitForFunction(()=>document.querySelector('.pc-hair .pc-checkin>div').dataset.motionState==='running');
 const timing=await hair.evaluate(e=>e.getAnimations().find(a=>a.id==='krane-hair-record').effect.getTiming());check(timing.iterations===1&&timing.duration<=700,'Hair motion is finite and bounded '+width);
 await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('.pc-hair .pc-checkin>div').dataset.motionState==='paused');
 const time=await hair.evaluate(async e=>{const a=e.getAnimations().find(a=>a.id==='krane-hair-record');await a.ready;return a.currentTime});await p.waitForTimeout(200);
 check(await hair.evaluate((e,t)=>Math.abs(e.getAnimations().find(a=>a.id==='krane-hair-record').currentTime-t)<2,time),'Offscreen animation time freezes '+width);
 await hair.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.pc-hair .pc-checkin>div').dataset.motionState==='complete');
 check(await hair.evaluate(e=>e.getAnimations().filter(a=>a.id.startsWith('krane-')).length===0),'Finished motion releases its animation '+width);
 const chart=p.locator('[data-weight-motion]');await p.locator('.pc-chart').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(()=>Number(document.querySelector('[data-weight-number]').textContent)<82.4);
 await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('[data-weight-motion]').dataset.motionRunning==='false');const number=await p.locator('[data-weight-number]').textContent();await p.waitForTimeout(500);check(await p.locator('[data-weight-number]').textContent()===number,'Chart clock pauses offscreen '+width);
 await p.locator('.pc-chart').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('[data-weight-motion]').classList.contains('is-complete'));check(await p.locator('[data-weight-number]').textContent()==='72.0','Existing illustrative chart completes unchanged '+width);
 const phone=p.locator('.pc-phone');await phone.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.pc-typing').classList.contains('is-on'));
 await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('[data-chat-motion]').dataset.motionRunning==='false');const shown=await p.locator('.pc-messages p.is-shown').count();await p.waitForTimeout(1300);
 check(await p.locator('.pc-messages p.is-shown').count()===shown,'Consultation clock pauses offscreen '+width);
 check(await p.locator('.pc-typing i').first().evaluate(e=>getComputedStyle(e).animationPlayState)==='paused','Offscreen typing animation pauses '+width);
 await phone.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('[data-chat-motion]').classList.contains('is-complete'),null,{timeout:18000});
 check(await p.locator('.pc-messages p.is-shown').count()===await p.locator('.pc-messages p').count(),'Normal consultation sequence completes all supplied messages '+width);

 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);
 check(await p.locator('[data-motion-kind]').evaluateAll(es=>es.every(e=>e.dataset.motionState==='complete')),'Preference change completes all entrance motion '+width);
 check(await p.locator('.pc-messages p.is-shown').count()===await p.locator('.pc-messages p').count(),'Reduced motion reveals the complete existing consultation '+width);
 check(await p.locator('.programme-chapter').count()===3,'All programme chapters remain present '+width);
 check(JSON.stringify(await p.locator('.pc-actions a').evaluateAll(es=>es.map(e=>e.href)))===JSON.stringify(links),'CTA destinations unchanged '+width);
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow '+width);
 await p.locator('#ed-program .pc-head').scrollIntoViewIfNeeded();await p.screenshot({path:join(out,'private-'+width+'.png'),animations:'disabled'});
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload({waitUntil:'domcontentloaded'});
 check(await p.locator('[data-motion-kind]').evaluateAll(es=>es.every(e=>e.dataset.motionState==='complete'&&Number(getComputedStyle(e).opacity)>0)),'Initial reduced-motion content is visible '+width);
 check(await p.evaluate(()=>document.getAnimations().filter(a=>a.id.startsWith('krane-')).length===0),'Initial reduced-motion has no new animations '+width);
 await p.screenshot({path:join(out,'hero-'+width+'.png'),animations:'disabled'});await ctx.close();
}check(errors.length===0,'No browser errors: '+errors.join('; '));await writeFile(join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(`Landing motion QA: ${checks} checks passed.`)}finally{await browser.close();await new Promise(r=>server.close(r))}
