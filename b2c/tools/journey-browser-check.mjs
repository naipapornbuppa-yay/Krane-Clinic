import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,relative} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),output=resolve(process.env.QA_OUTPUT||'/tmp/krane-journey-qa');
await mkdir(output,{recursive:true});
const index=process.argv.indexOf('--base');let base=index<0?null:process.argv[index+1],server;
if(!base){server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(relative(root,file).startsWith('..'))throw Error('outside');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const results=[];
try{for(const width of [320,390,768,1440])for(const lang of ['th','en'])for(const condition of ['weight','hair-loss','re-flow']){
const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});ctx.setDefaultTimeout(15000);const p=await ctx.newPage(),errors=[],missing=[],mockRequests=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)missing.push({url:r.url(),status:r.status()});});p.on('request',r=>{if(r.url().includes('smiling-man-office.mp4'))mockRequests.push(r.url());});
try{
await p.goto(`${base}/b2c/condition-detail.html?condition=${condition}&lang=${lang}`,{waitUntil:'domcontentloaded'});await p.locator('[data-title]').waitFor();await p.evaluate(()=>document.fonts.ready);
assert.equal(await p.locator('#reviews .review-video').count(),1,'Only the single authorized review is mounted');assert.equal(await p.locator('[data-programme-reviews] .cd-review').count(),0,'Mock cards must not be mounted');assert.equal(await p.locator('a.cd-seeall[href="#reviews"]').count(),0,'Dead review CTA must be absent');assert.equal(mockRequests.length,0,'Mock testimonial video must not be requested');
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
await p.locator('[data-cd-tab="steps"]').click();
const tabs=p.locator('.journey-tab');
assert.equal(await tabs.count(),5);
assert.equal(await p.locator('.cd-steps').isVisible(),false);
for(let i=0;i<5;i++){
 await tabs.nth(i).click();
 const panel=p.locator(`#journey-panel-${i}`);
 await panel.waitFor({state:'visible'});
 assert.equal(await p.locator('.journey-panel:visible').count(),1);
 assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
 assert.equal(await panel.locator('h4').innerText(),await p.locator('.cd-step strong').nth(i).textContent());
 assert.equal(await panel.locator('.journey-copy p').innerText(),await p.locator('.cd-step p').nth(i).textContent());
 assert.ok(await panel.locator('.journey-illustration svg').count()>0);
 assert.equal(await p.locator('[data-journey-count]').innerText(),`${i+1} / 5`);
 if(lang==='en') assert.ok(!/[ก-๙]/.test(await p.locator('.programme-journey').innerText()),'Journey must be fully English');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Journey horizontal overflow');
 if(width===390||width===1440) await p.locator('.journey-card').screenshot({path:`${output}/${condition}-${lang}-${width}-step-${i+1}.png`});
}
await tabs.nth(4).press('Home');assert.equal(await tabs.nth(0).getAttribute('aria-selected'),'true');
await tabs.nth(0).press('ArrowRight');assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
await tabs.nth(1).press('End');assert.equal(await tabs.nth(4).getAttribute('aria-selected'),'true');
await p.locator('[data-journey-next]').click();assert.equal(await p.locator('[data-journey-count]').innerText(),'1 / 5');
await p.locator('[data-journey-prev]').click();assert.equal(await p.locator('[data-journey-count]').innerText(),'5 / 5');
const otherLang=lang==='th'?'en':'th';
await p.locator('[data-language]:visible').selectOption(otherLang);
await p.waitForFunction(l=>document.documentElement.lang===l,otherLang);
await p.waitForFunction(l=>l==='en'?!/[ก-๙]/.test(document.querySelector('.programme-journey').innerText):/[ก-๙]/.test(document.querySelector('.programme-journey').innerText),otherLang);
await p.locator('[data-language]:visible').selectOption(lang);
await p.waitForFunction(l=>document.documentElement.lang===l,lang);

const safety=p.locator('.cd-safety-link');await safety.scrollIntoViewIfNeeded();
if(condition==='hair-loss')assert.equal(await p.locator('[data-safety]').innerText(),lang==='th'?'ข้อมูลความปลอดภัยสำหรับโปรแกรมดูแลเส้นผม':'Safety information for the hair care programme');
assert.equal(new URL(await safety.getAttribute('href'),p.url()).searchParams.get('condition'),condition);await safety.screenshot({path:`${output}/${condition}-${lang}-${width}-safety.png`});
for(const section of ['overview','steps','price']){await p.locator(`[data-cd-tab="${section}"]`).click();await p.locator(`[data-cd-panel="${section}"]`).waitFor({state:'visible'});}
await p.locator('.condition-hero [data-intake-link]').click();await p.locator('#intake1.active').waitFor();
assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(missing,[],'Missing local assets');results.push({condition,lang,width,status:'pass',errors,missing,mockRequests});console.log('PASS',condition,lang,width);
}catch(e){results.push({condition,lang,width,status:'fail',error:e.stack,errors,missing,mockRequests});await p.screenshot({path:`${output}/${condition}-${lang}-${width}-FAILED.png`}).catch(()=>{});console.error('FAIL',condition,lang,width,e.message);}finally{await ctx.close();}
}}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
await writeFile(`${output}/results.json`,JSON.stringify({base,generatedAt:new Date().toISOString(),results},null,2));if(results.some(r=>r.status==='fail'))process.exitCode=1;
