import {necessaryConsent} from './consent-test-fixture.mjs';
/* Behavioral coverage for the October public-page redesign. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-public-qa';
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`).replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const results=[],errors=[];let checks=0;
const check=(value,label)=>{assert(value,label);checks++};
const thai=page=>page.evaluate(()=>{const found=new Set(),w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())if(!n.parentElement.closest('script,style,noscript')&&/[ก-๛]/.test(n.textContent))found.add(n.textContent.trim());for(const e of document.querySelectorAll('[aria-label],[placeholder],[alt],[title]'))for(const k of ['aria-label','placeholder','alt','title'])if(/[ก-๛]/.test(e.getAttribute(k)||''))found.add(e.getAttribute(k));return [...found]});
try{
for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await necessaryConsent(ctx);ctx.setDefaultNavigationTimeout(60000);ctx.setDefaultTimeout(10000);
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const route of ['krane-b2c-landing.html','doctors.html',...['weight','hair-loss','re-flow'].map(c=>'condition-detail.html?condition='+c)]){
  await p.goto(`${base}/b2c/${route}${route.includes('?')?'&':'?'}lang=en`,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1800);
  check((await thai(p)).length===0,route+' English: '+JSON.stringify(await thai(p)));
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' page overflow '+width);
  if(route.startsWith('krane-b2c-landing')){
   const expected=['weight-02','weight-04','weight-05','hair-pha','hair-03','confidence-real-med'];
   const clips=await p.locator('#reviews figure[data-start-face="video"]:not([aria-hidden="true"]) source').evaluateAll(es=>es.map(e=>e.getAttribute('src').split('/').pop().replace('.mp4','')));
   check(JSON.stringify([...clips].sort())===JSON.stringify(expected.sort()),'All six distinct supplied clips');
   for(const kind of ['weight','hair','ed']){
    const category=({weight:'weight',hair:'hair-skin',ed:'sexual-health'})[kind];
    const links=await p.locator(`#${kind}-program .pc-goals a`).evaluateAll(es=>es.map(e=>e.getAttribute('href')));
    check(links.length===4&&links.every(h=>h.includes('category='+category)&&h.endsWith('#intake1')),'Four matching goal destinations '+kind);
    if(width===390){
     const receiving=await ctx.newPage();await receiving.goto(new URL(links[0],p.url()).href,{waitUntil:'domcontentloaded'});
     await receiving.locator('#intake1.active').waitFor();
     check(await receiving.evaluate(()=>selectedCategoryId)===category,'Goal opens matching clinical intake '+kind);
     await receiving.close();
    }
   }
   const images=p.locator('.figma-how__recording img');
   for(let i=0;i<3;i++){const image=images.nth(i);await image.scrollIntoViewIfNeeded();await image.evaluate(e=>{e.loading='eager'});await p.waitForFunction(i=>{const e=document.querySelectorAll('.figma-how__recording img')[i];return e.complete&&e.naturalWidth>0},i);check(await image.evaluate(e=>e.currentSrc.endsWith('.png?v=20261026-hires')),'Reduced-motion app recording '+i)}
   await p.locator('[data-how-go="2"]').click();await p.waitForFunction(()=>document.querySelector('#how').dataset.howActive==='2');check(await p.locator('[data-how-slide]').nth(2).getAttribute('aria-hidden')==='false','Third how step selectable');
   await p.locator('[data-how-prev]').click();await p.waitForFunction(()=>document.querySelector('#how').dataset.howActive==='1');check(await p.locator('[data-how-slide]').nth(1).getAttribute('aria-hidden')==='false','How previous control');
   await p.locator('#weight-program .pc-story-open').first().click();await p.waitForTimeout(150);
   check(await p.locator('dialog[open]').count()===1,'Programme story opens');
   check((await thai(p)).length===0,'English story modal labels: '+JSON.stringify(await thai(p)));
   const sound=p.locator('dialog[open] [data-story-sound]');
   await sound.click();await p.waitForTimeout(150);check(await sound.getAttribute('aria-label')==='Mute','Unmuting updates the accessible action');
   await sound.click();await p.waitForTimeout(150);check(await sound.getAttribute('aria-label')==='Unmute','Muting updates the accessible action');
   await p.keyboard.press('Escape');check(await p.locator('dialog[open]').count()===0,'Escape closes story');
  } else if(route.startsWith('condition-detail')){
   const kind=new URLSearchParams(route.split('?')[1]).get('condition');
   const story=p.locator('[data-programme-story]'),concept=kind==='weight'?'weight':kind==='hair-loss'?'hair':'private';
   if(kind!=='re-flow')check(await p.locator('.photo-reviews__set').count()===2,'Reduced motion never appends hidden loop copies');
   check(await story.getAttribute('data-programme-story')===concept,'Distinct programme story '+kind);
   check(await p.locator('.programme-intro__media video').count()===0,'Generic stock interview replaced '+kind);
   if(kind==='re-flow')check(await story.locator('p').evaluateAll(es=>es.every(e=>getComputedStyle(e).color==='rgb(255, 255, 255)')),'Private story copy has light text on its dark surface');
   check(await story.getAttribute('data-story-running')==='false','Reduced-motion story stays still '+kind);
   const storyControls=story.locator('[data-story-select]');await storyControls.last().click();await p.waitForTimeout(150);
   check(await storyControls.last().getAttribute('aria-pressed')==='true','Story control selects a phase '+kind);
   check((await thai(p)).length===0,'Story remains English '+kind);
   await p.locator('[data-cd-tab="overview"]').focus();await p.mouse.move(0,0);await p.emulateMedia({reducedMotion:'no-preference'});await story.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>document.querySelector('[data-programme-story]').dataset.storyRunning==='true');
   check(await story.evaluate(e=>e.getAnimations({subtree:true}).length>0),'Category-specific motion runs '+kind);
   const phase=await story.getAttribute('data-story-phase');await p.waitForFunction(old=>document.querySelector('[data-programme-story]').dataset.storyPhase!==old,phase,{timeout:7000});checks++;
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);check(await story.getAttribute('data-story-running')==='false','Story responds to reduced-motion preference '+kind);
   await story.screenshot({path:join(out,`story-${kind}-${width}.png`),animations:'disabled'});

   const expected=kind==='weight'?['weight-02','weight-04','weight-05']:kind==='hair-loss'?['hair-pha','hair-03']:[];
   const photos=await p.locator('.photo-reviews__set:not([aria-hidden="true"]) .photo-review').evaluateAll(es=>es.map(e=>({id:e.dataset.reviewId,images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))})));
   check(photos.length===expected.length&&photos.every((x,i)=>x.id===expected[i]&&x.images[0].includes(x.id+'-before')&&x.images[1].includes(x.id+'-after')),'Matching supplied photo pairs '+kind);

   await p.locator('[data-cd-tab="reviews"]').click();check(await p.locator('#reviews.programme-csat').count()===1,'Review navigation targets ratings');
   const filters=p.locator('.programme-comments__filters button');await filters.nth(2).click();await p.waitForTimeout(150);check(await p.locator('.programme-comment').count()===1,'4-star comment filter');
   check((await thai(p)).length===0,'Translated filtered comments: '+JSON.stringify(await thai(p)));await filters.first().click();await p.locator('.programme-comments select').selectOption('lowest');await p.waitForTimeout(150);
   check((await p.locator('.programme-comment__stars').first().innerText()).startsWith('★★★★☆'),'Lowest-rating sort');
   check((await thai(p)).length===0,'Translated sorted comments: '+JSON.stringify(await thai(p)));
  } else {
   for(const profile of await p.locator('[data-doctor-open]').all()){await profile.click();await p.waitForTimeout(150);check((await thai(p)).length===0,'Translated doctor preview: '+JSON.stringify(await thai(p)));await p.keyboard.press('Escape');}
  }
  await p.locator('[data-language]').first().selectOption('th',{force:true});await p.waitForTimeout(250);
  check(await p.evaluate(()=>document.documentElement.lang==='th'),'Thai toggle '+route);
  check((await thai(p)).length>0,'Thai copy restored '+route);
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:join(out,`thai-${route.replace(/[^a-z0-9]/gi,'-')}-${width}.png`),animations:'disabled'});
  await p.locator('[data-language]').first().selectOption('en',{force:true});await p.waitForTimeout(250);check((await thai(p)).length===0,'English toggle restored '+route+': '+JSON.stringify(await thai(p)));
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:join(out,`${route.split('?')[0].replace('.html','')}-${route.includes('condition=')?route.split('condition=')[1]+'-':''}${width}.png`),fullPage:true,animations:'disabled'});
  results.push({route,width,status:'pass'});
 }
 await ctx.close();
}
check(errors.length===0,'No browser errors: '+errors.join('; '));
console.log(`Public redesign QA: ${checks} checks passed across ${results.length} page/viewport combinations.`);
await writeFile(join(out,'results.json'),JSON.stringify({checks,results,errors},null,2));
}finally{await browser.close();server.close()}
