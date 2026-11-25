/* The approved landing uses vertical desktop tracks and a separate mobile rail.
   Verify their shared supplied-video viewer, quote access and paused fallbacks. */
import {necessaryConsent} from './consent-test-fixture.mjs';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-vertical-review-qa';
await mkdir(out,{recursive:true});
const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',types[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||'http://127.0.0.1:'+server.address().port).replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const ids=['confidence-real-med','hair-03','hair-pha','weight-02','weight-04','weight-05'];
let checks=0;
const results=[],check=(v,label)=>{assert(v,label);checks++};
try{for(const width of [320,390,800,1440])for(const lang of ['th','en']){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await necessaryConsent(ctx);const p=await ctx.newPage();p.setDefaultTimeout(12000);const errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.goto(base+'/b2c/krane-b2c-landing.html?lang='+lang,{waitUntil:'domcontentloaded'});
 const section=p.locator('#reviews.landing-stories'),desktop=section.locator('.landing-review-gallery'),mobile=section.locator('.landing-review-mobile');
 const tracks=desktop.locator('.landing-review-track'),quotes=section.locator('.landing-story-quotes');
 const clips=desktop.locator('.landing-review-cycle:not([data-copy]) [data-landing-review]');
 await section.waitFor();await p.evaluate(()=>document.fonts.ready);
 check((await tracks.count())===3,'Three vertical tracks');
 assert.deepEqual((await clips.evaluateAll(a=>a.map(x=>x.dataset.landingReview))).sort(),ids);checks++;
 check(await desktop.locator('[data-copy]').evaluateAll(a=>a.length===6&&a.every(x=>x.getAttribute('aria-hidden')==='true'&&[...x.querySelectorAll('button')].every(b=>b.tabIndex===-1))),'All desktop loop copies excluded from keyboard and AT');
 check(await desktop.locator('[data-copy]').evaluateAll(a=>a.every(x=>getComputedStyle(x).display==='none')),'Reduced motion suppresses looping copies');
 check(await tracks.evaluateAll(a=>a.every(x=>getComputedStyle(x).animationName==='none')),'Reduced motion suppresses wall animation');
 check(await section.locator('video').evaluateAll(a=>a.every(v=>v.paused)),'Reduced motion suppresses preview playback');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
 const compact=await p.evaluate(()=>matchMedia('(max-width:760px)').matches);
 check(await (compact?mobile:desktop).isVisible(),'Correct breakpoint gallery visible');
 check(await (compact?desktop:mobile).isHidden(),'Other breakpoint gallery hidden');
 check(await section.evaluate((s,c)=>{let copy=s.querySelector('.landing-stories__copy').getBoundingClientRect(),rail=s.querySelector(c?'.landing-review-mobile':'.landing-review-gallery').getBoundingClientRect();return c?copy.bottom<=rail.top+2:rail.right<=copy.left+2},compact),'Gallery and copy do not overlap');
 check(await section.evaluate(s=>s.getBoundingClientRect().height<=1000),'Gallery height bounded');
 const allDots=quotes.locator('.landing-story-quotes__dots button');
 check(await allDots.count()===4,'All four supplied testimonials available');
 check(await allDots.evaluateAll(a=>a.every(b=>b.getAttribute('aria-label')?.trim())),'Testimonial controls have accessible names');
 if(lang==='en')check(await allDots.evaluateAll(a=>a.every(b=>!/[ก-๛]/.test(b.getAttribute('aria-label')))),'English quote controls localized');
 for(let i=0;i<4;i++){await allDots.nth(i).click();check(await allDots.nth(i).getAttribute('aria-current')==='true','Each testimonial activates');check(await quotes.locator('.landing-story-quotes__slide[aria-hidden=false]').count()===1,'Only active testimonial exposed')}
 await quotes.locator('.landing-story-quotes__slides').focus();await p.keyboard.press('Home');
 check(await allDots.first().getAttribute('aria-current')==='true','Keyboard Home returns first quote');
 const launch=(compact?mobile:desktop).locator((compact?'':'.landing-review-cycle:not([data-copy]) ')+'button[data-landing-review="weight-04"]').first();
 if(compact)check(await mobile.evaluate(x=>x.scrollWidth>x.clientWidth),'Mobile review rail can scroll');
 await launch.focus();await p.keyboard.press('Enter');
 const dialog=p.locator('.pc-story-viewer[open]');await dialog.waitFor();
 const expected=lang==='en'?'Story 2 of 6':'เรื่องที่ 2 จาก 6';
 await p.waitForFunction(s=>document.querySelector('.pc-story-count')?.textContent===s,expected);
 check(await dialog.locator('video').evaluate(v=>v.src.endsWith('/weight-04.mp4')),'Selected supplied clip is preserved');
 check(await dialog.locator('.pc-story-bars > span').count()===6,'Shared viewer includes all six stories');
 await p.keyboard.press('ArrowRight');
 check(await dialog.locator('video').evaluate(v=>v.src.endsWith('/weight-05.mp4')),'Keyboard advances to correct story');
 await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 await p.waitForFunction(()=>document.activeElement?.dataset.landingReview==='weight-04');
 check(await launch.evaluate(b=>b===document.activeElement),'Close restores focus to exact launcher');
 await p.waitForFunction(()=>{const v=document.querySelector('.pc-story-viewer video');return v.paused&&!v.hasAttribute('src')});
 check(await p.locator('.pc-story-viewer video').evaluate(v=>v.paused&&!v.hasAttribute('src')),'Closing stops and unloads viewer video');
 if(!compact){
   await launch.evaluate(b=>b.blur());await desktop.scrollIntoViewIfNeeded();await p.mouse.move(0,0);
   await p.emulateMedia({reducedMotion:'no-preference'});
   await p.waitForFunction(()=>document.querySelector('.landing-review-gallery').classList.contains('is-in-view'));
   await p.waitForFunction(()=>[...document.querySelectorAll('.landing-review-track')].every(t=>getComputedStyle(t).animationPlayState==='running'));
   const transforms=()=>tracks.evaluateAll(a=>a.map(e=>getComputedStyle(e).transform));
   const before=await transforms();
   await p.waitForFunction(s=>JSON.stringify([...document.querySelectorAll('.landing-review-track')].map(e=>getComputedStyle(e).transform))!==s,JSON.stringify(before));
   check(await tracks.evaluateAll(a=>a.every(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41===0)),'Desktop wall moves on vertical axis only');
   await desktop.hover();
   await p.waitForFunction(()=>[...document.querySelectorAll('.landing-review-track')].every(e=>getComputedStyle(e).animationPlayState==='paused'));
   check(await tracks.evaluateAll(async a=>{const frames=a.flatMap(e=>e.getAnimations());await Promise.all(frames.map(m=>m.ready));const x=a.map(e=>getComputedStyle(e).transform);await new Promise(r=>setTimeout(r,150));return frames.length===a.length&&frames.every(m=>m.playState==='paused')&&a.every((e,i)=>x[i]===getComputedStyle(e).transform)}),'Hover freezes all tracks');
   await p.mouse.move(0,0);await p.evaluate(()=>scrollTo(0,0));
   await p.waitForFunction(()=>!document.querySelector('.landing-review-gallery').classList.contains('is-in-view'));
   await p.waitForFunction(()=>[...document.querySelectorAll('#reviews video')].every(v=>v.paused));
   check(await tracks.evaluateAll(a=>a.every(e=>getComputedStyle(e).animationPlayState==='paused')),'Offscreen motion stops');
 }
 check(errors.length===0,errors.join('\n'));results.push({width,lang,status:'passed'});
 }catch(e){results.push({width,lang,status:'failed',error:e.stack});throw e}finally{await ctx.close()}
}}finally{await browser.close();await new Promise(r=>server.close(r));await writeFile(join(out,'results.json'),JSON.stringify({checks,results},null,2))}
console.log('Vertical review gallery: '+checks+' checks passed');
