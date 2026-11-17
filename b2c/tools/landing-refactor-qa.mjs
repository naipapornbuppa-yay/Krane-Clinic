/* Compare a preserved baseline and candidate without changing source or live site.
 * node b2c/tools/landing-refactor-qa.mjs /absolute/baseline /absolute/candidate
 * Output is evidence, not automatic visual approval. Review screenshots and JSON.
 */
import {chromium} from 'playwright';
import {necessaryConsent} from './consent-test-fixture.mjs';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,relative} from 'node:path';
import assert from 'node:assert/strict';
const roots=process.argv.slice(2,4).map(p=>resolve(p));
if(roots.length!==2)throw Error('Supply baseline and candidate directories');
const out=resolve(process.env.QA_OUTPUT||'/tmp/krane-refactor-qa');await mkdir(out,{recursive:true});
const servers=[];const bases=[];const results=[];
try {
 for(const root of roots){const s=createServer(async(req,res)=>{try{const f=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(relative(root,f).startsWith('..'))throw Error('outside');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2'})[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404).end()}});await new Promise(r=>s.listen(0,'127.0.0.1',r));servers.push(s);bases.push(`http://127.0.0.1:${s.address().port}`)}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 try{for(const width of [390,768,1440])for(const lang of ['th','en']){
  const captures=[];
  for(let i=0;i<2;i++){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await necessaryConsent(ctx);const p=await ctx.newPage();const errors=[],failed=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(bases[i]))failed.push({url:r.url().replace(bases[i],''),status:r.status()})});
   await p.goto(`${bases[i]}/b2c/krane-b2c-landing.html?lang=${lang}`,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
   await p.locator('img').evaluateAll(async es=>{for(const e of es){e.loading='eager';await e.decode().catch(()=>{})}});
   await p.evaluate(()=>{for(const video of document.querySelectorAll('video')){video.pause();video.currentTime=0;}});
   const state=await p.evaluate(()=>({text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,sections:[...document.querySelectorAll('main section[id], main>section')].map(e=>{const r=e.getBoundingClientRect();return{id:e.id,x:r.x,y:r.y+scrollY,w:r.width,h:r.height}}),links:[...document.querySelectorAll('a[href]')].map(e=>({text:e.textContent.trim(),href:e.getAttribute('href')})),brokenImages:[...document.images].filter(e=>e.currentSrc&&!e.naturalWidth).map(e=>e.getAttribute('src'))}));
   await p.screenshot({path:`${out}/${i?'candidate':'baseline'}-${lang}-${width}.png`,fullPage:true,animations:'disabled'});
   captures.push({...state,errors,failed});await ctx.close();
  }
  const [a,b]=captures;const compare={width,lang,textEqual:a.text===b.text,linksEqual:JSON.stringify(a.links)===JSON.stringify(b.links),sectionsEqual:JSON.stringify(a.sections)===JSON.stringify(b.sections),newErrors:b.errors.filter(e=>!a.errors.includes(e)),candidateOverflow:b.overflow,newMissing:b.failed.filter(e=>!a.failed.some(x=>x.url===e.url)),baseline:a,candidate:b};results.push(compare);
 }}finally{await browser.close()}
 await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
 assert(results.every(r=>r.textEqual&&r.linksEqual&&r.sectionsEqual&&!r.newErrors.length&&!r.newMissing.length),'Content/geometry/runtime regression; inspect results.json');
 console.log('PASS content/link/section-geometry/error checks. Screenshots and full interactions still require review.');
}finally{for(const s of servers)await new Promise(r=>s.close(r))}
