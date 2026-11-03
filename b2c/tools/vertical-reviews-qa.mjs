/* Landing vertical review wall: content, motion, playback and accessible fallback. */
import {necessaryConsent} from './consent-test-fixture.mjs';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-vertical-review-qa';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`).replace(/\/$/,''),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const expected=['weight-02','weight-04','weight-05','hair-pha','hair-03','confidence-real-med'].sort(),results=[];let checks=0;
const check=(value,label)=>{assert(value,label);checks++};
try{for(const width of [320,390,800,1440])for(const lang of ['th','en']){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'});await necessaryConsent(ctx);const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 try{
  await p.goto(`${base}/b2c/krane-b2c-landing.html?lang=${lang}`,{waitUntil:'domcontentloaded'});
  const section=p.locator('#reviews[data-vertical-gallery]'),wall=section.locator('.review-collage'),tracks=section.locator('.review-vertical-track'),pause=section.locator('.review-vertical-motion');
  await section.waitFor();await p.evaluate(()=>document.fonts.ready);await section.scrollIntoViewIfNeeded();await p.mouse.move(width-1,1);await p.waitForFunction(()=>document.querySelector('#reviews').dataset.galleryRunning==='true');
  // Gallery drift starts on intersection, before the independently staggered
  // copy entrance has settled. Measure the final layout, not its translateY.
  // Only await these two elements, never the infinite descendant wall tracks.
  await p.waitForFunction(()=>[...document.querySelectorAll('#reviews .reviews__copy,#reviews .review-collage')].every(e=>e.classList.contains('is-revealed')));
  await section.locator('.reviews__copy,.review-collage').evaluateAll(async elements=>{
   await Promise.all(elements.flatMap(element=>element.getAnimations()).map(animation=>animation.finished.catch(()=>{})));
  });
  check(await section.locator('.review-vertical-rail').count()===3,'Three portrait columns '+width+' '+lang);
  const originals=section.locator('figure[data-start-face="video"]:not([aria-hidden="true"])');
  check(JSON.stringify((await originals.evaluateAll(es=>es.map(e=>e.dataset.reviewId))).sort())===JSON.stringify(expected),'All six original clips preserved');
  check(await section.locator('[data-loop-clone]').evaluateAll(es=>es.every(e=>e.getAttribute('aria-hidden')==='true'&&e.tabIndex===-1)),'Loop copies are hidden and not keyboard stops');
  check(await section.evaluate(e=>e.getBoundingClientRect().height<=950),'Section height is bounded');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
  const geometry=await section.evaluate(e=>{const a=e.querySelector('.review-collage').getBoundingClientRect(),b=e.querySelector('.reviews__copy').getBoundingClientRect();return {wallLeft:a.left,wallRight:a.right,wallTop:a.top,copyLeft:b.left,copyBottom:b.bottom}});
  check(width>700?geometry.wallRight<=geometry.copyLeft:geometry.copyBottom<=geometry.wallTop+2,'Desktop side-by-side and mobile stacked '+width+' '+lang+' '+JSON.stringify(geometry));
  const transform=()=>tracks.evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));const before=await transform();await p.waitForTimeout(300);check(JSON.stringify(await transform())!==JSON.stringify(before),'Columns move vertically');
  check(await tracks.evaluateAll(es=>es.every(e=>{const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return m.m41===0})),'Motion has no horizontal travel');
  await pause.click();
  // CSS pause first schedules a compositor pause task. Its final hold time
  // becomes stable when Animation.ready resolves, not at the click boundary.
  const pauseReady=await tracks.evaluateAll(async elements=>{
   const animations=elements.flatMap(element=>element.getAnimations());
   await Promise.all(animations.map(animation=>animation.ready));
   return animations.length===elements.length&&animations.every(animation=>animation.playState==='paused'&&!animation.pending)&&elements.every(element=>getComputedStyle(element).animationPlayState==='paused');
  });
  check(pauseReady,'Every wall animation acknowledges pause '+width+' '+lang);
  const frozen=await transform();await p.waitForTimeout(250);check(JSON.stringify(await transform())===JSON.stringify(frozen),'Explicit pause freezes the wall '+width+' '+lang);
  check(await section.locator('video').evaluateAll(es=>es.every(v=>v.paused)),'Explicit pause stops all preview videos');
  const seen=new Set();for(let i=0;i<6;i++){seen.add(await section.locator('.review-vertical-excerpt:not([hidden])').getAttribute('id'));await section.locator('.review-vertical-arrow').last().click()}
  check(seen.size===6,'Every existing review excerpt is reachable');
  const watch=section.locator('.review-vertical-watch');await watch.click();await p.locator('.pc-story-viewer[open]').waitFor();
  check(await p.locator('.pc-story-count').innerText()=== (lang==='en'?'Story 2 of 6':'เรื่องที่ 2 จาก 6'),'The shared story viewer retains all six reviews');
  check(await p.locator('.pc-story-viewer video').evaluate(v=>v.currentSrc.endsWith('/weight-04.mp4')),'Watch opens the selected supplied video');
  await p.keyboard.press('Escape');await p.locator('.pc-story-viewer[open]').waitFor({state:'hidden'});check(await watch.evaluate(e=>document.activeElement===e),'Closing restores keyboard focus');
  check(await section.getAttribute('data-gallery-paused')==='true'&&await section.locator('video').evaluateAll(es=>es.every(v=>v.paused)),'Manual pause survives viewer close');
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);
  check(await pause.isHidden(),'Reduced motion removes the unused motion control');
  check(await tracks.evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')),'Reduced motion has no wall animation');
  check(await originals.evaluateAll(es=>es.every(e=>e.tabIndex===0&&e.getBoundingClientRect().height>0)),'Reduced motion exposes every original keyboard target');
  check(await section.locator('.review-vertical-set[aria-hidden=true]').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')),'Reduced motion removes every loop copy');
  check(await section.locator('video').evaluateAll(es=>es.every(v=>v.paused)),'Reduced motion previews stay still');
  check(await section.locator('.review-vertical-controls button:visible').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>=44&&e.getBoundingClientRect().height>=44)),'Controls meet minimum touch target');
  if(lang==='en'){await p.waitForTimeout(100);check(await section.evaluate(e=>{const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())if(/[ก-๛]/.test(n.textContent))return false;return [...e.querySelectorAll('[aria-label]')].every(n=>!/[ก-๛]/.test(n.getAttribute('aria-label')))}),'Visible and hidden review copy is English')}
  await p.emulateMedia({reducedMotion:'no-preference'});check(await section.getAttribute('data-gallery-paused')==='true','Manual pause survives motion preference changes');
  await pause.click();await p.mouse.move(width-1,1);await watch.evaluate(e=>e.blur());await p.waitForFunction(()=>document.querySelector('#reviews').dataset.galleryRunning==='true');
  await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('#reviews').dataset.galleryRunning==='false');check(await section.locator('video').evaluateAll(es=>es.every(v=>v.paused)),'Offscreen previews stop');
  check(errors.length===0,errors.join('\n'));results.push({width,lang,status:'passed'});
 }catch(error){results.push({width,lang,status:'failed',error:error.stack});throw error}finally{await ctx.close()}
}}finally{await browser.close();await new Promise(r=>server.close(r));await writeFile(join(out,'results.json'),JSON.stringify({checks,results},null,2));}
console.log(`Vertical review gallery: ${checks} checks passed`);
