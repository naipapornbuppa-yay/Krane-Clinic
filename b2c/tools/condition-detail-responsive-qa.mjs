/* Hero breakpoint and illustrative-comment regression coverage. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
import {necessaryConsent} from './consent-test-fixture.mjs';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-condition-detail-qa';
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
let checks=0;const check=(v,label)=>{assert(v,label);checks++;};
try{
for(const width of [390,599,600,760,761,800,820,821,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await necessaryConsent(context);
 const page=await context.newPage();
 for(const lang of ['th','en']){
 await page.goto(`http://127.0.0.1:${server.address().port}/b2c/condition-detail.html?condition=hair-loss&lang=${lang}`,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.programme-comment');await page.evaluate(()=>document.fonts.ready);
 const boxes=await page.evaluate(()=>{const hero=document.querySelector('.condition-hero'),copy=hero.querySelector('.public-hero__copy'),image=hero.querySelector('.public-hero__media');const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};return {hero:box(hero),copy:box(copy),image:box(image)};});
 if(width>760){check(Math.abs(boxes.image.y-boxes.copy.y)<1,`same hero row ${width}`);check(Math.abs(boxes.copy.right-boxes.image.x)<1,`no blank column ${width}`);check(Math.abs(boxes.image.right-boxes.hero.right)<1,`image fills right ${width}`);}else{check(Math.abs(boxes.image.width-boxes.hero.width)<1,`full mobile image ${width}`);check(Math.abs(boxes.copy.width-boxes.hero.width)<1,`full mobile copy ${width}`);}
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`page overflow ${width}`);
 check(await page.locator('.programme-comments__list').evaluate(list=>{
  const r=list.getBoundingClientRect(),cards=[...list.querySelectorAll('.programme-comment')],heading=document.querySelector('.programme-comments__toolbar').getBoundingClientRect();
  return Math.abs(r.left)<1&&Math.abs(r.right-innerWidth)<1&&Math.abs(cards[0].getBoundingClientRect().left-heading.left)<1&&cards.some(card=>{const c=card.getBoundingClientRect();return c.left<r.right&&c.right>r.right+1;})&&getComputedStyle(list).overflowX==='auto';
 }),'review rail reaches viewport edge with next-card peek and aligned first card');
 const articles=page.locator('.cd-articles .cd-rail');
 if(await articles.count())check(await articles.evaluate(list=>{const r=list.getBoundingClientRect();return Math.abs(r.left)<1&&Math.abs(r.right-innerWidth)<1&&getComputedStyle(list).overflowX==='auto';}),'article rail bleeds to viewport edges');

 check(await page.locator('.programme-comment').count()===12,'12 illustrative comments');
 check((await page.locator('.programme-comments__disclosure').innerText()).includes(lang==='en'?'not real patient':'ไม่ใช่รีวิว'),'clear mock disclosure');
 const dots=page.locator('.programme-comments__dots button');check(await dots.count()===(width<600?12:width<=1100?6:3),'responsive page count');
 check(await page.locator('.programme-comments__dots').evaluate(nav=>{
  const buttons=[...nav.querySelectorAll('button')],rect=nav.getBoundingClientRect();
  return nav.classList.contains('carousel-dots')&&rect.width<=buttons.length*16+1&&buttons.every(button=>{
   const r=button.getBoundingClientRect(),dot=getComputedStyle(button,'::before');
   return Math.abs(r.width-16)<1&&Math.abs(r.height-24)<1&&['6px','8px'].includes(dot.width);
  });
 }),'canonical compact dot targets');
 check(await page.locator('.programme-comment blockquote').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)<=15),'readable compact review type');
 check(await page.locator('.programme-intro__copy .programme-designer').count()===0,'no duplicate right-side doctor card');
 check(await page.locator('.programme-interview-label strong').count()===0,'removed doctor introduction caption heading');
 check(await page.locator('.programme-interview-placeholder > .programme-designer').count()===1,'one existing designer profile over video');
 check(await page.locator('.programme-interview-label').innerText()===(lang==='en'?'Illustration · Doctor interview coming soon':'ภาพประกอบ · เตรียมพบกับบทสัมภาษณ์คุณหมอ'),'stock footage disclosure remains visible');
 check(await page.locator('.programme-interview-placeholder').evaluate(media=>{
  const frame=media.getBoundingClientRect(),link=media.querySelector('.programme-designer'),r=link.getBoundingClientRect();
  return r.left>=frame.left&&r.right<=frame.right&&r.top>=frame.top&&r.bottom<=frame.bottom-44&&Boolean(link.getAttribute('href'))&&getComputedStyle(media,'::after').backgroundImage.includes('linear-gradient');
 }),'designer overlay and dark gradient remain inside video above controls');
 if(width>760)check(await page.locator('.programme-intro').evaluate(intro=>{
  const media=intro.querySelector('.programme-intro__media').getBoundingClientRect(),copy=intro.querySelector('.programme-intro__copy').getBoundingClientRect();
  return Math.abs(media.top-copy.top)<1&&Math.abs(media.bottom-copy.bottom)<1;
 }),'desktop video and benefit copy align to equal height');
 if(width>=600&&width<=1100)check(await page.locator('.programme-comments__list').evaluate(list=>{
  const cards=list.querySelectorAll('.programme-comment');return cards[1].getBoundingClientRect().right<=list.getBoundingClientRect().right+1;
 }),'two readable review cards on intermediate widths');
 await dots.last().click();await page.waitForTimeout(100);check(await dots.last().getAttribute('aria-current')==='page','last dot active');
 check(await page.locator('.programme-comments__list').evaluate(e=>Math.abs(e.scrollWidth-e.clientWidth-e.scrollLeft)<2),'last page reachable');
 await page.locator('.programme-comments__filters button').last().click();check(await page.locator('.programme-comment').count()===1,'one-star filter');
 await page.locator('.programme-comments__filters button').first().click();
 await page.locator('.programme-comments__toolbar select').selectOption('lowest');check(await page.locator('.programme-comment').first().getAttribute('data-rating')==='1','ascending sort');
 await page.locator('.programme-comments__toolbar select').selectOption('highest');check(await page.locator('.programme-comment').first().getAttribute('data-rating')==='5','descending sort');
 await page.locator('.programme-comments__toolbar select').selectOption('newest');check(await page.locator('.programme-comment time').first().getAttribute('datetime')==='2026-10-22','date sort');
 if([390,600,800,1440].includes(width)){await page.locator('.condition-hero').screenshot({path:`${out}/hero-${width}-${lang}.png`});await page.locator('.programme-comments').screenshot({path:`${out}/comments-${width}-${lang}.png`});}
 }
 await context.close();
}
console.log(`PASS ${checks} condition-detail assertions; screenshots ${out}`);
}finally{await browser.close();server.close();}
