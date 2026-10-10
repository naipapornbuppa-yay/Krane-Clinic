import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),results=[];
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+req.url.split('?')[0]);if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext(),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const base=`http://127.0.0.1:${server.address().port}/cms/cms-admin.html`;
async function navigate(id){await p.goto(base+'#'+id,{waitUntil:'networkidle'});await p.locator('#'+id+'.is-active').waitFor();}
async function test(name,fn){try{await fn();results.push({name,status:'pass'});console.log('PASS',name);}catch(e){results.push({name,status:'fail',error:e.message});console.log('FAIL',name,e.message);}}
try{
await test('coupon-validation-and-persistence',async()=>{
 await navigate('coupons');await p.locator('[data-coupon-save]').click();assert.equal(await p.locator('#coupons [data-admin-feedback]').getAttribute('role'),'alert');
 const fill=async(n,v)=>p.locator(`[name="${n}"]`).fill(v);
 await fill('couponCode','HANDOFF_QA');await fill('couponValue','101');await p.locator('[name="couponType"]').selectOption('percent');await fill('couponStart','2026-10-01');await fill('couponEnd','2026-12-31');await fill('couponMaxUses','10');await p.locator('[data-coupon-save]').click();assert.equal(await p.locator('[data-saved-coupon]').count(),0);
 await fill('couponValue','15');await fill('couponEnd','2026-09-30');await p.locator('[data-coupon-save]').click();assert.equal(await p.locator('[data-saved-coupon]').count(),0);
 await fill('couponEnd','2026-12-31');await p.locator('[data-coupon-save]').click();assert.equal(await p.locator('[data-saved-coupon="HANDOFF_QA"]').count(),1);
 await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('[data-saved-coupon="HANDOFF_QA"]').count(),1);
 await fill('couponCode','handoff_qa');await fill('couponValue','0');await fill('couponStart','2026-10-01');await fill('couponEnd','2026-12-31');await fill('couponMaxUses','1');await p.locator('[data-coupon-save]').click();assert.equal(await p.locator('[data-saved-coupon]').count(),1);assert.equal(await p.locator('#coupons [data-admin-feedback]').getAttribute('role'),'alert');
 await p.locator('[data-coupon-cancel]').click();assert.equal(await p.locator('[name="couponCode"]').inputValue(),'');
});
await test('pricing-and-config-reload-isolated-from-patient',async()=>{
 await navigate('pricing');const price=p.locator('#pricing tbody input').first();await price.fill('-1');await p.locator('[data-admin-save="pricing"]').click();assert.equal(await p.locator('#pricing [data-admin-feedback]').getAttribute('role'),'alert');
 await price.fill('612.50');await p.locator('[data-admin-save="pricing"]').click();await p.reload({waitUntil:'networkidle'});assert.equal(Number(await price.inputValue()),612.5);
 await navigate('config');const check=p.locator('#config input[type="checkbox"]').first();const old=await check.isChecked();await check.setChecked(!old,{force:true});await p.locator('[data-admin-save="config"]').click();await p.reload({waitUntil:'networkidle'});assert.equal(await check.isChecked(),!old);
 assert.equal(await p.evaluate(()=>KraneGoldenDemo.fixture.treatment.medicines[0].price),590);assert.equal(await p.evaluate(()=>localStorage.getItem('krane-golden-demo-state-v1')),null);
});
await test('storage-failure-does-not-report-success',async()=>{
 await navigate('pricing');await p.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('disabled')}});await p.locator('#pricing tbody input').first().fill('900');await p.locator('[data-admin-save="pricing"]').click();assert.equal(await p.locator('#pricing [data-admin-feedback]').getAttribute('role'),'alert');await p.reload({waitUntil:'networkidle'});assert.equal(Number(await p.locator('#pricing tbody input').first().inputValue()),612.5);
});
await test('mobile-controls-fit',async()=>{
 await p.setViewportSize({width:390,height:844});await navigate('coupons');
 const fits=await p.locator('[data-coupon-form]').evaluate(el=>[...el.querySelectorAll('input,select')].every(input=>input.getBoundingClientRect().right<=innerWidth+1));assert(fits);
});
await test('no-runtime-errors',async()=>assert.deepEqual(errors,[]));
}finally{await writeFile('/tmp/krane-admin-settings-results.json',JSON.stringify(results,null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
