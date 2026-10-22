import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,relative} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),output=resolve(process.env.QA_OUTPUT||'/tmp/krane-review-qa');
await mkdir(output,{recursive:true});
const index=process.argv.indexOf('--base');let base=index<0?null:process.argv[index+1],server;
if(!base){server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(relative(root,file).startsWith('..'))throw Error('outside');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4'})[extname(file)]||'application/octet-stream');const body=await readFile(file),range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');res.setHeader('Accept-Ranges','bytes');if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):body.length-1,body.length-1);res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(body.subarray(start,end+1));}else{res.setHeader('Content-Length',body.length);res.end(body);}}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const results=[];
try{for(const width of (process.env.QA_WIDTHS||'320,390,1440').split(',').map(Number))for(const lang of (process.env.QA_LANGS||'th,en').split(','))for(const condition of (process.env.QA_ROUTES||'landing,weight,hair-loss,re-flow').split(',')){
const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});ctx.setDefaultTimeout(20000);const p=await ctx.newPage(),errors=[],missing=[],stock=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)missing.push({url:r.url(),status:r.status()});});p.on('request',r=>{if(/smiling-man-office|pexels-6602739/.test(r.url()))stock.push(r.url());});
try{
const path=condition==='landing'?`krane-b2c-landing.html?lang=${lang}`:`condition-detail.html?condition=${condition}&lang=${lang}`;
await p.goto(`${base}/b2c/${path}`,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const expected=1;
assert.equal(await p.locator('.review-video video').count(),expected,'Exactly one supplied review on relevant surfaces');
assert.equal(await p.locator('[data-review-open],.cd-review--story:not(.review-video)').count(),0,'No fabricated reviewer cards');
if(expected){
 const root=p.locator('.review-video'),v=root.locator('video');await root.scrollIntoViewIfNeeded();
 assert.equal(await v.getAttribute('preload'),'none');assert.equal(await v.getAttribute('autoplay'),null);assert.equal(await v.evaluate(x=>x.controls),false);assert.equal(await v.getAttribute('playsinline'),'');
 assert.equal(await v.evaluate(x=>x.muted),false);assert.equal(await v.evaluate(x=>getComputedStyle(x).objectFit),'contain');
 assert.equal(await root.locator('source').getAttribute('src'),'assets/reviews/confidence-real-med.mp4');
 if(lang==='en')assert.ok(!/[ก-๙]/.test(await root.innerText()),'English review copy');
 const dims=await v.boundingBox();assert.equal(dims.height,width<=760?320:360,'Original compact media frame height');
 assert.ok(dims.width<=408,'Compact review card width');
 assert.ok(!/37|Thai audio/.test(await root.innerText()),'No language or duration label');
 await p.locator('#reviews').screenshot({style:'.site-header,.mobile-cta,.cd-stickybar{visibility:hidden!important}',path:`${output}/${condition}-${lang}-${width}-poster.png`});
 await root.locator('.review-video__play').click();await p.waitForFunction(()=>{const v=document.querySelector('.review-video video');return !v.paused&&v.currentTime>.2});
 assert.equal(await v.evaluate(x=>x.controls),true);const info=await v.evaluate(x=>({duration:x.duration,width:x.videoWidth,height:x.videoHeight,error:x.error&&x.error.code}));assert.ok(Math.abs(info.duration-37.135)<.1);assert.equal(info.width,540);assert.equal(info.height,960);assert.equal(info.error,null);
 await root.locator('.review-video__play').waitFor({state:'hidden'});
 await v.press('Space');await p.waitForFunction(()=>document.querySelector('.review-video video').paused);await root.locator('.review-video__play').waitFor({state:'visible'});await p.waitForFunction(()=>{const v=document.querySelector('.review-video video');return v.seekable.length&&v.seekable.end(0)>5});await v.evaluate(x=>{x.currentTime=10;});await p.waitForFunction(()=>document.querySelector('.review-video video').currentTime>=10);await v.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.body.classList.contains('is-review-in-view'));assert.equal(await p.locator('.cd-stickybar:visible,.mobile-cta:visible').count(),0,'Floating CTA does not cover playback controls');
 await root.locator('.review-video__play').press('Enter');await p.waitForFunction(()=>!document.querySelector('.review-video video').paused);await v.press('Space');
 await root.locator('.review-video__toggle').click();await p.waitForFunction(()=>!document.querySelector('.review-video video').paused);
 await root.locator('.review-video__toggle').click();await p.waitForFunction(()=>document.querySelector('.review-video video').paused);
}
if(condition==='landing'){
 const gallery=p.locator('#weight-program [data-interview-reviews]');
 assert.equal(await p.locator('[data-interview-reviews]').count(),3);assert.equal(await gallery.locator('video,img').count(),0,'General review is not used as weight-loss evidence');
 await gallery.scrollIntoViewIfNeeded();await gallery.locator('[data-interview-next]').click();await p.waitForFunction(()=>document.querySelector('#weight-program [data-interview-reviews]').dataset.interviewActive==='1');await p.waitForTimeout(250);
 await gallery.locator('[data-interview-prev]').click();await p.waitForFunction(()=>document.querySelector('#weight-program [data-interview-reviews]').dataset.interviewActive==='0');
 if(lang==='en')assert.ok(!/[ก-๙]/.test(await gallery.innerText()),'English gallery copy');
 await p.locator('#weight-program').screenshot({style:'.site-header,.mobile-cta,.cd-stickybar{visibility:hidden!important}',path:`${output}/terracotta-${lang}-${width}.png`});
}
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');assert.deepEqual(stock,[]);assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
results.push({condition,lang,width,status:'pass',errors,missing,stock});console.log('PASS',condition,lang,width);
}catch(e){results.push({condition,lang,width,status:'fail',error:e.stack,errors,missing,stock});console.error('FAIL',condition,lang,width,e.message);}finally{await ctx.close();}
}}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
await writeFile(`${output}/results.json`,JSON.stringify({base,generatedAt:new Date().toISOString(),results},null,2));if(results.some(x=>x.status==='fail'))process.exitCode=1;
