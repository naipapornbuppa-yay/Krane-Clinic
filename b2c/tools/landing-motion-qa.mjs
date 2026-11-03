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
 // Exercise the real replacement film, not the retired animated consultation.
 const film=p.locator('[data-feature-film]'),toggle=p.locator('[data-feature-film-toggle]');
 check(await film.count()===1&&await toggle.count()===1,'One feature film and playback control '+width);
 const showFilm=async()=>{await film.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(200)};
 const hideFilm=async()=>{await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('[data-feature-film]').getBoundingClientRect().top>=innerHeight);await p.waitForTimeout(200)};
 const waitPlaying=async()=>{await p.waitForFunction(()=>{const v=document.querySelector('[data-feature-film]');return !v.paused&&v.readyState>=2});const before=await film.evaluate(v=>v.currentTime);await p.waitForFunction(t=>{const v=document.querySelector('[data-feature-film]');return !v.paused&&Math.abs(v.currentTime-t)>.08},before)};
 const checkPaused=async label=>{await p.waitForFunction(()=>document.querySelector('[data-feature-film]').paused);const before=await film.evaluate(v=>v.currentTime);await p.waitForTimeout(300);check(await film.evaluate((v,t)=>v.paused&&Math.abs(v.currentTime-t)<.02,before),label+' '+width)};
 const checkToggle=async playing=>{const expected={text:playing?'Pause':'Play',label:playing?'Pause service introduction video':'Play service introduction video'};await p.waitForFunction(({text,label})=>{const b=document.querySelector('[data-feature-film-toggle]');return b.textContent===text&&b.getAttribute('aria-label')===label},expected);check(await toggle.textContent()===expected.text,'English film control text matches playback '+width);check(await toggle.getAttribute('aria-label')===expected.label,'English film accessible label matches playback '+width)};
 await showFilm();await p.waitForFunction(()=>document.querySelector('[data-feature-film]').readyState>=1);
 const metadata=await film.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,inline:v.playsInline,loop:v.loop,poster:v.getAttribute('poster'),source:v.currentSrc,error:v.error?.code}));
 check(Math.abs(metadata.duration-12)<.1&&metadata.width===720&&metadata.height===960,'Feature film has supplied 12-second portrait metadata '+width);
 check(metadata.muted&&metadata.inline&&metadata.loop&&!metadata.error,'Feature film is muted, inline, looping and error-free '+width);
 check(metadata.source.endsWith('/assets/krane-private-care-feature.mp4')&&metadata.poster==='assets/krane-private-care-feature-poster.jpg','Feature film uses supplied media and poster '+width);
 await waitPlaying();check(true,'Visible feature film advances '+width);await checkToggle(true);
 await hideFilm();await checkPaused('Offscreen film playback freezes');await checkToggle(false);
 await showFilm();await waitPlaying();check(true,'Film resumes after viewport re-entry '+width);
 await toggle.click();await checkPaused('Manual pause freezes film');await checkToggle(false);
 await hideFilm();await showFilm();await checkPaused('Manual pause survives viewport re-entry');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(200);await checkPaused('Manual pause survives motion preference changes');
 await toggle.click();await waitPlaying();check(true,'Manual play resumes film '+width);await checkToggle(true);
 await hideFilm();await checkPaused('Manually resumed film still pauses offscreen');await showFilm();await waitPlaying();check(true,'Manual play clears persistent pause for viewport resume '+width);

 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);
 check(await p.locator('[data-motion-kind]').evaluateAll(es=>es.every(e=>e.dataset.motionState==='complete')),'Preference change completes all entrance motion '+width);
 await checkPaused('Reduced-motion preference change pauses film');await checkToggle(false);
 // Reduced motion disables autoplay, but an explicit user play remains available.
 await toggle.click();await waitPlaying();check(true,'Explicit play works with reduced motion '+width);await checkToggle(true);
 await hideFilm();await checkPaused('Reduced-motion manual playback pauses offscreen');await showFilm();await checkPaused('Reduced motion prevents viewport autoplay');
 await p.emulateMedia({reducedMotion:'no-preference'});await waitPlaying();check(true,'Removing reduced motion restores eligible autoplay '+width);
 await p.emulateMedia({reducedMotion:'reduce'});await checkPaused('Restoring reduced motion pauses film again');
 check(await p.locator('.programme-chapter').count()===3,'All programme chapters remain present '+width);
 check(JSON.stringify(await p.locator('.pc-actions a').evaluateAll(es=>es.map(e=>e.href)))===JSON.stringify(links),'CTA destinations unchanged '+width);
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow '+width);
 await p.locator('#ed-program .pc-head').scrollIntoViewIfNeeded();await p.screenshot({path:join(out,'private-'+width+'.png'),animations:'disabled'});
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload({waitUntil:'domcontentloaded'});
 check(await p.locator('[data-motion-kind]').evaluateAll(es=>es.every(e=>e.dataset.motionState==='complete'&&Number(getComputedStyle(e).opacity)>0)),'Initial reduced-motion content is visible '+width);
 check(await p.evaluate(()=>document.getAnimations().filter(a=>a.id.startsWith('krane-')).length===0),'Initial reduced-motion has no new animations '+width);
 await showFilm();await checkPaused('Initial reduced motion prevents film autoplay');await checkToggle(false);
 await p.evaluate(()=>scrollTo(0,0));
 await p.screenshot({path:join(out,'hero-'+width+'.png'),animations:'disabled'});await ctx.close();
}check(errors.length===0,'No browser errors: '+errors.join('; '));await writeFile(join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(`Landing motion QA: ${checks} checks passed.`)}finally{await browser.close();await new Promise(r=>server.close(r))}
