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
// Assert the shipping Landing composition, not the October prototype cards.
const programmes=[['weight','weight','rebody'],['hair','hair-skin','rehair'],['ed','sexual-health','reflow']];
const checkLandingPolish=async(page,width)=>{
 for(const [kind,category,slug] of programmes){
  const chapter=page.locator('#'+kind+'-program'), goals=chapter.locator('.care-chapter__goals a[data-category]');
  check(await chapter.isVisible(),'Programme chapter visible '+kind);
  check(await goals.count()===4,'Four meaningful programme goal controls '+kind);
  check(await goals.evaluateAll((links,category)=>links.every(a=>{const u=new URL(a.href),r=a.getBoundingClientRect();return u.pathname.endsWith('/krane-b2c.html')&&u.searchParams.get('category')===category&&u.hash==='#intake1'&&a.textContent.trim();}),category),'Every goal opens correct intake '+kind);
  check(await chapter.locator('.care-chapter__banner img').count()===1,'One programme hero asset '+kind);
  const image=chapter.locator('.care-chapter__banner img');await image.evaluate(e=>{e.loading='eager'});
  await page.waitForFunction(kind=>{const e=document.querySelector('#'+kind+'-program .care-chapter__banner img');return e?.complete&&e.naturalWidth>0},kind);
  const details=chapter.locator('.care-chapter__more');
  check(new URL(await details.getAttribute('href'),page.url()).pathname.endsWith('/'+slug+'-opt1/index.html'),'Details uses canonical programme '+kind);
  if(width===390){
    const primary=page.locator('#services a[data-category="'+category+'"]');
    check(await primary.isVisible(),'Visible mobile top entry '+kind);
    const url=await primary.evaluate(e=>e.href);
    const receiving=await page.context().newPage();try{
     await receiving.goto(url,{waitUntil:'domcontentloaded'});await receiving.locator('#intake1.active').waitFor();
     check(await receiving.evaluate(()=>selectedCategoryId)===category,'Real intake selects the programme '+kind);
    }finally{await receiving.close();}
  }
 }
};
const checkEditorialSnapshots=async()=>{
 const ctx=await browser.newContext();
 try{
  await necessaryConsent(ctx);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  const id='library-obesity-05',url=`${base}/b2c/articles.html?lang=th&article=${id}`;
  const read=async()=>({title:await p.locator('[data-article-title]').textContent(),body:await p.locator('[data-article-body]').textContent()});
  await p.goto(url,{waitUntil:'domcontentloaded'});
  const clean=await read();
  check(clean.title.includes('NuSH-based therapies')&&clean.body.includes('ประเด็นสำคัญ'),'Clean Thai reader shows the approved Obesity 05 manuscript');
  const stale='QA legacy editorial snapshot',current='QA current editorial snapshot';
  await p.evaluate(({id,stale})=>{
   const article={...KraneArticleStore.records().find(r=>r.id===id).draft,title:stale,manuscriptMarkdown:'## '+stale};
   localStorage.setItem('krane-editorial-demo-v1',JSON.stringify({[id]:{id,status:'Published',draft:article,published:article}}));
  },{id,stale});
  await p.reload({waitUntil:'domcontentloaded'});
  const after=await read();
  check(after.title===clean.title&&after.body===clean.body,'A pre-version CMS snapshot cannot override the approved title or manuscript');
  const draft=await p.evaluate(({id,current})=>{
   const existing=KraneArticleStore.records().find(r=>r.id===id).draft;
   KraneArticleStore.save(id,{...existing,title:current,manuscriptMarkdown:'## '+current},'Draft');
   return {retained:existing.title,published:KraneArticleStore.published().find(a=>a.id===id).title};
  },{id,current});
  check(draft.retained===stale&&draft.published===clean.title,'Stale drafts remain editable and a new Draft stays private');
  await p.evaluate(id=>{const record=KraneArticleStore.records().find(r=>r.id===id);KraneArticleStore.save(id,record.draft,'Published');},id);
  await p.locator('[data-article-title]').filter({hasText:current}).waitFor();
  await p.reload({waitUntil:'domcontentloaded'});
  const published=await read();
  check(published.title===current&&published.body.includes(current),'Current CMS demo Publish propagates and survives reload');
 }finally{await ctx.close();}
};
try{
await checkEditorialSnapshots();
for(const width of [390,800,1024,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await necessaryConsent(ctx);ctx.setDefaultNavigationTimeout(60000);ctx.setDefaultTimeout(10000);
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 const routes=width===800||width===1024?['krane-b2c-landing.html']:['krane-b2c-landing.html','doctors.html',...['weight','hair-loss','re-flow'].map(c=>'condition-detail.html?condition='+c)];
 for(const route of routes){
  const condition=route.startsWith('condition-detail')?new URLSearchParams(route.split('?')[1]).get('condition'):null;
  const expectedProgramme=condition&&({'weight':'rebody','hair-loss':'rehair','re-flow':'reflow'})[condition];
  await p.goto(`${base}/b2c/${route}${route.includes('?')?'&':'?'}lang=en${condition?'#pricing':''}`,{waitUntil:'domcontentloaded'});
  if(condition){
   await p.waitForURL(url=>url.pathname.endsWith('/'+expectedProgramme+'-opt1/index.html')&&url.hash==='#program-pricing');
   check(new URL(p.url()).searchParams.get('lang')==='en','Condition redirect retains language '+condition);
   await p.locator('#program-pricing').waitFor({state:'visible'});
  }
  await p.waitForTimeout(1800);
  check((await thai(p)).length===0,route+' English: '+JSON.stringify(await thai(p)));
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' page overflow '+width);
  if(route.startsWith('krane-b2c-landing')){
   await checkLandingPolish(p,width);
   const steps=p.locator('[data-how-slide]'),expectedPreviews=['assessment','video-consultation','delivery','follow-up'];
   check(await steps.count()===expectedPreviews.length,'Four approved how steps including follow-up');
   for(const [i,stem] of expectedPreviews.entries()){
    const step=steps.nth(i),image=step.locator('.figma-how__recording img');
    await p.locator('[data-how-go="'+i+'"]').click();
    await p.waitForFunction(i=>document.querySelector('#how').dataset.howActive===String(i),i);
    check(await step.getAttribute('aria-hidden')==='false','How step '+(i+1)+' selectable');
    await image.evaluate(e=>{e.loading='eager'});
    await p.waitForFunction(i=>{const e=document.querySelectorAll('[data-how-slide]')[i].querySelector('.figma-how__recording img');return e.complete&&e.naturalWidth>0},i);
    check(await image.evaluate((e,stem)=>new URL(e.currentSrc).pathname.endsWith('/'+stem+'.png')&&new URL(e.src).pathname.endsWith('/'+stem+'.gif'),stem),stem+' uses reduced-motion still and matching normal-motion preview');
   }
   check(await p.locator('.how-video-preview-label').textContent()==='Video consultation preview','Video consultation preview label is localized in EN');
   await p.locator('[data-how-viewport]').focus();await p.keyboard.press('ArrowLeft');await p.waitForFunction(()=>document.querySelector('#how').dataset.howActive==='2');check(await steps.nth(2).getAttribute('aria-hidden')==='false','How keyboard previous moves from follow-up to delivery');
   const reviews=p.locator('#reviews');
   check(await reviews.isVisible(),'Approved review section remains present');
   const articles=p.locator('#articles-preview .articles-row a');
   check(await articles.count()===15,'All fifteen approved article links are discoverable');
   check(await articles.evaluateAll(links=>new Set(links.map(a=>new URL(a.href).searchParams.get('article'))).size===links.length&&links.every(a=>a.textContent.trim()&&new URL(a.href).pathname.endsWith('/articles.html'))),'Article destinations unique and nonempty');
  } else if(route.startsWith('condition-detail')){
   const programme=p.locator('[data-programme="'+expectedProgramme+'"]');
   check(await programme.isVisible(),'Expected programme root visible '+condition);
   const timeline=programme.locator('#steps');
   check(await timeline.isVisible(),'Canonical practical care timeline is visible '+condition);
   const primary=programme.locator('a[href*="#intake1"]:visible').first();
   check(await primary.count()===1,'Programme has a visible consultation entry '+condition);
   const category=({'weight':'weight','hair-loss':'hair-skin','re-flow':'sexual-health'})[condition];
   check(new URL(await primary.evaluate(e=>e.href)).searchParams.get('category')===category,'Programme entry selects matching intake '+condition);
  } else {
   for(const profile of await p.locator('[data-doctor-open]').all()){await profile.click();await p.waitForTimeout(150);check((await thai(p)).length===0,'Translated doctor preview: '+JSON.stringify(await thai(p)));await p.keyboard.press('Escape');}
  }
  await p.locator('[data-language]').first().selectOption('th',{force:true});await p.waitForTimeout(250);
  check(await p.evaluate(()=>document.documentElement.lang==='th'),'Thai toggle '+route);
  check((await thai(p)).length>0,'Thai copy restored '+route);
  if(route.startsWith('krane-b2c-landing'))await checkLandingPolish(p,width);
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
