import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),output=process.env.QA_OUTPUT||'/tmp/krane-review-round';await mkdir(output,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream');res.end(await readFile(path))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});const results=[];
async function test(name,fn){if(process.argv[2]&&!name.includes(process.argv[2]))return;const context=await browser.newContext({viewport:{width:390,height:844}});context.setDefaultTimeout(6000);context.setDefaultNavigationTimeout(15000);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));try{await fn(page);assert.equal(errors.length,0,errors.join('; '));results.push({name,status:'pass'});console.log('PASS',name)}catch(e){results.push({name,status:'fail',error:e.message});console.log('FAIL',name,e.message.slice(0,200));await page.screenshot({path:output+'/'+name+'.png',fullPage:true}).catch(()=>{})}finally{await context.close()}}
async function open(p,id,entry='direct'){await p.goto(`${base}/b2c/krane-b2c.html?public=1&screens=1&fresh=1&entry=${entry}&demoStage=${id}#${id}`,{waitUntil:'domcontentloaded'});await p.locator('#'+id+'.active').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);}
try{
await test('dynamic-order-progress-language',async p=>{
await p.goto(`${base}/b2c/krane-b2c.html?demoOrder=golden&demoStage=tracking#tracking`,{waitUntil:'domcontentloaded'});
await p.locator('#tracking.active').waitFor();
for(const status of ['Preparing','Rider pickup','Out for delivery','Delivered']){
const en=await p.evaluate(status=>{window.kraneSetLang(false);window.KraneGoldenDemo.advanceFulfilment(status);return [...document.querySelectorAll('[data-order-progress]')].map(x=>x.getAttribute('aria-label'))},status);assert(en.length);assert(en.every(s=>s.startsWith('Order progress')&&!/[\u0e00-\u0e7f]/.test(s)),status+': '+en);
await p.evaluate(()=>window.kraneSetLang(true));const th=await p.locator('[data-order-progress]').evaluateAll(b=>b.map(x=>x.getAttribute('aria-label')));assert(th.every(s=>s.startsWith('ความคืบหน้าคำสั่งซื้อ')));
await p.evaluate(()=>window.kraneSetLang(false));await p.waitForTimeout(100);assert((await p.locator('[data-order-progress]').first().getAttribute('aria-label')).startsWith('Order progress'));
}
});
}finally{await writeFile(output+'/results.json',JSON.stringify(results,null,2));await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
