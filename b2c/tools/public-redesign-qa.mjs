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
    const palette=await p.locator(`#${kind}-program`).evaluate((section,kind)=>{const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05),style=getComputedStyle(section),bg=rgb(style.backgroundColor),button=getComputedStyle(section.querySelector('.pc-primary')),buttonBg=rgb(button.backgroundColor),approved=({weight:[153,94,71],hair:[73,103,98],ed:[59,73,101]})[kind];return {approvedSurface:bg.every((v,i)=>v===approved[i]),bodyContrast:contrast(rgb(style.color),bg)>=4.5,ctaContrast:contrast(rgb(button.color),buttonBg)>=4.5,darkerCta:lum(buttonBg)<lum(bg),secondaryContrast:contrast(rgb(getComputedStyle(section.querySelector('.pc-actions a:not(.pc-primary)')).color),bg)>=4.5};},kind);
    for(const [key,ok] of Object.entries(palette))check(ok,'Approved programme palette (03cde97) '+kind+' '+key);

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
   // The landscape interview has its own player; selfie stories use the rail viewer.
   const interviewOpener=p.locator('#weight-program .pc-main-media .pc-story-open');
   await interviewOpener.click();await p.locator('.pc-interview-player[open]').waitFor();
   await p.waitForFunction(()=>{const v=document.querySelector('.pc-interview-player video');return v.readyState>=1&&Boolean(v.currentSrc)});
   check(await p.locator('.pc-story-viewer[open]').count()===0,'Interview does not open selfie viewer');
   check(await p.evaluate(()=>{const source=document.querySelector('#weight-program .pc-main-media video'),v=document.querySelector('.pc-interview-player video');return v.currentSrc===source.querySelector('source').src&&v.poster===source.poster&&v.controls&&v.playsInline}),'Interview player retains supplied source, poster and native controls');
   await p.keyboard.press('Escape');await p.waitForFunction(()=>{const d=document.querySelector('.pc-interview-player'),v=d.querySelector('video');return !d.open&&v.paused&&!v.hasAttribute('src')});
   check(await interviewOpener.evaluate(e=>document.activeElement===e),'Interview closing returns keyboard focus');
   const storyCards=p.locator('#weight-program .pc-stories [data-pc-video]:not([data-rail-clone])');
   const storyOpener=storyCards.first().locator('.pc-story-open');
   await storyOpener.click();await p.locator('.pc-story-viewer[open]').waitFor();
   await p.waitForFunction(()=>{const v=document.querySelector('.pc-story-viewer video'),card=document.querySelector('#weight-program .pc-stories [data-pc-video]:not([data-rail-clone])');return v.readyState>=1&&v.currentSrc===card.querySelector('source').src});
   check(await p.locator('dialog[open]').count()===1,'Programme story opens');
   check((await thai(p)).length===0,'English story modal labels: '+JSON.stringify(await thai(p)));
   const ugc=await p.evaluate(()=>{const card=document.querySelector('#weight-program .pc-stories [data-pc-video]:not([data-rail-clone])'),viewer=document.querySelector('.pc-story-viewer'),caption=viewer.querySelector('.pc-story-caption'),fade=getComputedStyle(viewer.querySelector('.pc-story-stage'),'::after'),rect=caption.getBoundingClientRect(),bounds=viewer.getBoundingClientRect();return {copy:caption.querySelector('p').innerText===card.querySelector('blockquote').innerText.trim(),person:caption.querySelector('strong').textContent===card.querySelector('.pc-video-copy>span').textContent,route:caption.querySelector('a').href===card.closest('.programme-chapter').querySelector('.pc-primary').href,unboxed:[caption,card.querySelector('.pc-video-copy')].every(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e).borderRadius==='0px'),fade:fade.backgroundImage.includes('linear-gradient')&&fade.pointerEvents==='none',contained:rect.left>=bounds.left&&rect.right<=bounds.right&&rect.bottom<=bounds.bottom};});
   for(const [key,ok] of Object.entries(ugc))check(ok,'UGC integrated caption '+key);
   await p.keyboard.press('ArrowRight');
   check(await p.locator('.pc-story-caption p').innerText()===await storyCards.nth(1).locator('blockquote').innerText(),'UGC next quote retains approved line breaks');
   await p.keyboard.press('ArrowLeft');
   check(await p.locator('.pc-story-caption p').innerText()===await storyCards.first().locator('blockquote').innerText(),'UGC previous story restores its caption');
   const sound=p.locator('dialog[open] [data-story-sound]');
   await sound.click();await p.waitForTimeout(150);check(await sound.getAttribute('aria-label')==='Mute','Unmuting updates the accessible action');
   await sound.click();await p.waitForTimeout(150);check(await sound.getAttribute('aria-label')==='Unmute','Muting updates the accessible action');
   await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.pc-story-viewer').open&&document.activeElement?.classList.contains('pc-story-open'));check(await p.locator('dialog[open]').count()===0,'Escape closes story');check(await storyOpener.evaluate(e=>document.activeElement===e),'UGC closing returns keyboard focus');
  } else if(route.startsWith('condition-detail')){
   const kind=new URLSearchParams(route.split('?')[1]).get('condition');
   if(kind!=='re-flow')check(await p.locator('.photo-reviews__set').count()===2,'Reduced motion never appends hidden loop copies');
   // cb6f4a2 restored the disclosed interview placeholder in place of category stories.
   const overviewMedia=p.locator('.programme-intro__media.programme-interview-placeholder'),overviewVideo=overviewMedia.locator('video');
   check(await overviewVideo.count()===1,'One disclosed programme interview placeholder '+kind);
   await p.waitForFunction(()=>{const v=document.querySelector('.programme-interview-placeholder video');return v.readyState>=1&&Boolean(v.currentSrc)});
   check(await overviewVideo.evaluate(v=>v.currentSrc.endsWith('/assets/landing/interview-off-camera-pexels-6602739.mp4')&&v.poster.endsWith('/assets/landing/interview-off-camera-poster.jpg')),'Programme interview retains supplied media '+kind);
   check(await overviewVideo.evaluate(v=>v.controls&&v.playsInline&&v.muted&&v.loop),'Programme interview retains silent inline playback and native controls '+kind);
   await overviewVideo.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>{const v=document.querySelector('.programme-interview-placeholder video');return !v.autoplay&&v.paused});
   const stillAt=await overviewVideo.evaluate(v=>v.currentTime);await p.waitForTimeout(250);
   check(await overviewVideo.evaluate((v,t)=>!v.autoplay&&v.paused&&Math.abs(v.currentTime-t)<.02,stillAt),'Reduced motion prevents visible interview autoplay '+kind);
   // Explicit user playback remains available even when automatic playback is disabled.
   await overviewVideo.evaluate(v=>v.play());const playingAt=await overviewVideo.evaluate(v=>v.currentTime);
   await p.waitForFunction(t=>{const v=document.querySelector('.programme-interview-placeholder video');return !v.paused&&Math.abs(v.currentTime-t)>.08},playingAt);
   check(await overviewVideo.evaluate(v=>!v.paused&&!v.autoplay),'Explicit interview play works with reduced motion '+kind);
   await overviewVideo.evaluate(v=>v.pause());
   check(await overviewVideo.getAttribute('aria-label')==='Illustrative interview video; awaiting the doctor’s programme introduction video','Interview is explicitly disclosed as illustrative '+kind);
   check(await overviewMedia.locator('.programme-interview-label span').textContent()==='Illustration · Doctor interview coming soon','Visible interview placeholder disclosure '+kind);
   const points=p.locator('.programme-selling-points');await points.scrollIntoViewIfNeeded();
   await p.waitForFunction(()=>document.querySelector('.programme-selling-points').classList.contains('is-visible'));
   check(await points.locator('li').evaluateAll(es=>es.length>0&&es.every(e=>e.textContent.trim()&&getComputedStyle(e).animationName==='none'&&Number(getComputedStyle(e).opacity)>0)),'Reduced-motion selling points remain visible and still '+kind);
   await p.emulateMedia({reducedMotion:'no-preference'});
   await p.waitForFunction(()=>[...document.querySelectorAll('.programme-selling-points li')].every(e=>getComputedStyle(e).animationName==='programme-point-in'));
   check(await points.evaluate(e=>e.getAnimations({subtree:true}).length>0),'Programme selling-point entrance animations are enabled '+kind);
   await p.emulateMedia({reducedMotion:'reduce'});
   await p.waitForFunction(()=>[...document.querySelectorAll('.programme-selling-points li')].every(e=>getComputedStyle(e).animationName==='none'));
   check(await points.evaluate(e=>e.getAnimations({subtree:true}).length===0),'Selling points respond to reduced-motion preference '+kind);
   // programme-timeline moves the practical guide into this standalone section.
   const journey=p.locator('.programme-start-section .programme-journey'),tabs=journey.locator('[role="tab"]');
   check(await tabs.count()===5,'All five practical care steps remain available '+kind);
   await tabs.last().click();
   check(await tabs.last().getAttribute('aria-selected')==='true'&&await journey.locator('#journey-panel-4').isVisible(),'Explicit journey tab selects its matching panel '+kind);
   check(await journey.locator('[role="tabpanel"]:visible').count()===1,'Only selected journey panel is visible '+kind);
   await p.keyboard.press('Home');
   check(await tabs.first().evaluate(e=>e.getAttribute('aria-selected')==='true'&&document.activeElement===e)&&await journey.locator('#journey-panel-0').isVisible(),'Journey Home key restores first step and focus '+kind);
   check((await thai(p)).length===0,'Programme guide remains English '+kind);
   // With focus outside the visible guide, reduced motion must still prevent its 6s auto-advance.
   await p.locator('[data-cd-tab="overview"]').evaluate(e=>e.focus({preventScroll:true}));await journey.scrollIntoViewIfNeeded();
   await p.waitForTimeout(6300);
   check(await tabs.first().getAttribute('aria-selected')==='true','Reduced motion prevents journey auto-advance '+kind);
   await overviewMedia.screenshot({path:join(out,`interview-${kind}-${width}.png`),animations:'disabled'});

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
