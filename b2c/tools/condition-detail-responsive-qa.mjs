/* Canonical public programme routes and responsive review coverage. */
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
const sizes=[390,599,600,760,761,800,820,821,1024,1440];
const cases=[['hair-loss','rehair'],['weight','rebody'],['re-flow','reflow']];
const near=(a,b)=>Math.abs(a-b)<2;
const origin=`http://127.0.0.1:${server.address().port}`;
try {
for (const width of sizes) {
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await necessaryConsent(ctx);
  try {
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    for (const lang of ['th','en']) {
      const routes=[cases[0], ...([390,800,1440].includes(width)?cases.slice(1):[])];
      for (const [condition,key] of routes) {
        // The supported legacy URL now routes users to the same canonical programme.
        const legacy=new URL(`/b2c/condition-detail.html?condition=${condition}&lang=${lang}#hero`,origin);
        await page.goto(legacy.href,{waitUntil:'domcontentloaded'});
        await page.waitForURL(u=>u.pathname===`/b2c/${key}-opt1/index.html`);
        const url=new URL(page.url());
        check(url.hash==='#top'&&url.searchParams.get('lang')===lang&&!url.searchParams.has('condition'),'canonical destination and safe query/section mapping');
        const programme=page.locator(`main[data-programme="${key}"]`);
        await programme.locator('.opt-feedback .public-review-card').first().waitFor();
        await page.evaluate(()=>document.fonts.ready);
        check(await page.locator('html').getAttribute('lang')===lang,'document language follows originating URL');
        if(lang==='en') {
          await page.waitForFunction(()=>document.querySelector('.opt-price h2')?.textContent.trim()==='Programme pricing');
          const leaked=await page.evaluate(()=>{
            const thai=/[\u0e01-\u0e5b]/;
            const rendered=el=>Boolean(el?.getClientRects().length)&&getComputedStyle(el).visibility==='visible'&&!el.closest('script,style,noscript,[hidden]');
            const text=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
            const values=[];
            while(text.nextNode()) {
              const n=text.currentNode;
              if(rendered(n.parentElement)&&thai.test(n.nodeValue))values.push(n.nodeValue.trim());
            }
            for(const el of document.querySelectorAll('[aria-label],[title],[alt]')){
              if(!rendered(el)||el.closest('[aria-hidden=true]'))continue;
              for(const name of ['aria-label','title','alt']) { const v=el.getAttribute(name);if(v&&thai.test(v))values.push(v); }
            }
            return [...new Set(values)];
          });
          check(leaked.length===0,`no visible or accessible Thai in English ${key} ${width}: ${leaked.join(' / ')}`);
        }
        const loc=programme.locator('.opt-hero');
        const box=await loc.boundingBox(),vid=await loc.locator('video').boundingBox();
        check(box&&vid&&box.width>0&&box.height>0&&near(vid.x,box.x)&&near(vid.y,box.y)&&near(vid.width,box.width)&&near(vid.height,box.height),`hero media fills frame ${key} ${width}`);
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`no page overflow ${key} ${width}`);
        const group=programme.locator('.opt-feedback .public-review-demo');
        const disclosure=group.locator('.public-review-demo__label');
        check(await disclosure.isVisible()&&(await disclosure.innerText())===(lang==='en'?'Fictional reviews for demo':'รีวิวจำลองเพื่อสาธิต'),'invented review copy is visibly disclosed in both languages');
        check(await group.getAttribute('aria-describedby')===await disclosure.getAttribute('id'),'disclosure bound to review group for assistive technology');
        const cards=group.locator('.public-review-card');
        check(await cards.count()===6,'exactly six disclosed demo cards');
        check(await cards.evaluateAll(list=>list.every(card=>card.querySelector('blockquote')&&card.querySelector('[role="img"][aria-label]'))),'all demo cards have a quotation and accessible rating');
        const rail=group.locator('.rebody-review-rail');
        check(await rail.evaluate(e=>e.scrollWidth>e.clientWidth+2&&['auto','scroll'].includes(getComputedStyle(e).overflowX)),'review rail is scrollable');
        const dots=group.locator('.carousel-dots button');const first=dots.first(),last=dots.last();
        await first.waitFor();
        check(await dots.count()>1,'review rail exposes multiple page controls');
        await first.focus();
        await first.press('End');
        await page.waitForFunction(()=>document.querySelector('.opt-feedback .carousel-dots button:last-child')?.getAttribute('aria-current')==='page');
        check(await last.getAttribute('aria-current')==='page','keyboard End activates last page');
        check(await rail.evaluate(e=>e.scrollLeft>0&&Math.abs(e.scrollWidth-e.clientWidth-e.scrollLeft)<3),'last review page fully reachable');
        await last.press('Home');
        await page.waitForFunction(()=>document.querySelector('.opt-feedback .carousel-dots button:first-child')?.getAttribute('aria-current')==='page');
        check(await rail.evaluate(e=>Math.abs(e.scrollLeft)<2),'keyboard Home restores first page');
        const articles=programme.locator('.opt-article-rail');
        check(await articles.locator('a[href*="?article="]').count()>0,'articles expose valid detail links');
        check(await articles.evaluate(e=>['auto','scroll'].includes(getComputedStyle(e).overflowX)),'article rail retains horizontal navigation');
        check(errors.length===0,`no programme page JavaScript errors: ${errors.join('; ')}`);
        if(key==='rehair'&&[390,600,800,1440].includes(width)) {
          await loc.screenshot({path:`${out}/hero-${width}-${lang}.png`});
          await group.screenshot({path:`${out}/reviews-${width}-${lang}.png`});
        }
      }
    }
  } finally {await ctx.close();}
}
console.log(`PASS ${checks} condition-detail assertions; screenshots ${out}`);
} finally {await browser.close();server.close();}
