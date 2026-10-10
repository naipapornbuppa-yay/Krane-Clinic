import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),out=process.env.QA_OUTPUT||'/tmp/krane-cross-surface';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[],inventory=[];

async function test(name,fn){console.log('RUN',name);try{await fn();results.push({test:name,status:'pass'})}catch(e){results.push({test:name,status:'fail',error:e.message,severity:'P1'});console.error(name,e.message)}}
function check(x,m){if(!x)throw Error(m)}
const ctx=await browser.newContext();ctx.setDefaultTimeout(10000);const admin=await ctx.newPage(),patient=await ctx.newPage(),doctor=await ctx.newPage();
try{
await admin.goto(base+'/cms/cms-admin.html#content',{waitUntil:'networkidle'});
for(const width of [390,1440]){await admin.setViewportSize({width,height:900});await admin.waitForTimeout(700);await admin.screenshot({path:out+'/editor-'+width+'.png',fullPage:true})}
const seed=await admin.evaluate(()=>KraneArticleStore.records()[0]);
await patient.goto(base+'/b2c/krane-b2c.html?screens=1&article='+seed.id+'#article',{waitUntil:'networkidle'});
await test('article draft remains private',async()=>{
await admin.locator('[data-editorial-form] [name=title]').fill('QA draft private');await admin.locator('[data-editorial-form] button[value=Draft]').click();
check(await admin.evaluate(()=>KraneArticleStore.records()[0].draft.title)==='QA draft private','Draft not saved');
check(await patient.evaluate(()=>KraneArticleStore.published()[0].title)===seed.published.title,'Draft leaked');
await patient.reload();check(await patient.locator('#article').innerText().then(t=>!t.includes('QA draft private')),'Draft rendered after reload');
});
await test('article publish propagates to B2C and survives reload',async()=>{
await admin.locator('[data-editorial-form] button[value=Published]').click();await patient.waitForFunction(()=>document.querySelector('#article').textContent.includes('QA draft private'));
await patient.reload();await patient.waitForFunction(()=>document.querySelector('#article').textContent.includes('QA draft private'));
await admin.reload();check(await admin.locator('[data-editorial-form] [name=title]').inputValue()==='QA draft private','CMS reload lost title');
});
await test('landing featured article follows published title',async()=>{const landing=await ctx.newPage();await landing.goto(base+'/b2c/krane-b2c-landing.html');await landing.waitForFunction(id=>document.querySelector('[data-article-id="'+id+'"]')?.textContent.includes('QA draft private'),seed.id);await landing.close()});
await test('pending revision preserves published snapshot',async()=>{
await admin.locator('[data-editorial-form] [name=title]').fill('QA pending private');await admin.locator('[data-editorial-form] button[value="Pending approval"]').click();
await patient.reload();check((await patient.locator('#article').innerText()).includes('QA draft private'),'Published snapshot missing');check(!(await patient.locator('#article').innerText()).includes('QA pending private'),'Pending leaked');
});
await test('invalid article save rejects empty title',async()=>{check(await admin.evaluate(()=>{const r=KraneArticleStore.records()[0];try{KraneArticleStore.save(r.id,{...r.draft,title:''},'Published');return false}catch{return true}}),'Invalid title accepted')});

await test('new draft never public before approval, then resolves by stable id',async()=>{
await admin.locator('[data-editorial-new]').click();
await admin.locator('[name=title]').fill('QA newly authored');await admin.locator('[name=summary]').fill('QA summary');await admin.locator('[name="heading-0"]').fill('QA heading');await admin.locator('[name="copy-0"]').fill('QA body text');
await admin.locator('button[value=Draft]').click();const id=await admin.evaluate(()=>KraneArticleStore.records().find(r=>r.draft.title==='QA newly authored').id);
check(await patient.evaluate(id=>!KraneArticleStore.published().some(r=>r.id===id),id),'New draft exposed');
await admin.locator('button[value=Published]').click();await patient.goto(base+'/b2c/krane-b2c.html?screens=1&article='+id+'#article');await patient.waitForFunction(()=>document.querySelector('#article').textContent.includes('QA newly authored'));
});
await admin.goto(base+'/cms/cms-admin.html#fulfilment',{waitUntil:'networkidle'});
await patient.goto(base+'/b2c/krane-b2c.html?screens=1&demoOrder=golden&demoStage=tracking#tracking',{waitUntil:'networkidle'});
await patient.locator('#tracking.active').waitFor({state:'visible'});
await doctor.goto(base+'/cms/cms-doctor.html#done',{waitUntil:'networkidle'});
for(const stage of ['Rider pickup','Out for delivery','Delivered'])await test('fulfilment '+stage+' propagates to patient and doctor',async()=>{
await admin.locator('[data-status-select]').selectOption(stage);await admin.locator('[data-update-status]').click();
const shared=stage==='Out for delivery'?'Dispatched':stage;
await patient.waitForFunction(s=>KraneGoldenDemo.readState().fulfilmentStatus===s,shared);
await doctor.waitForFunction(s=>KraneGoldenDemo.readState().fulfilmentStatus===s,shared);
const expectedDoctor={'Rider pickup':'ไรเดอร์กำลังเข้าไปรับของ','Out for delivery':'กำลังจัดส่ง','Delivered':'จัดส่งถึงผู้ป่วยแล้ว'};const expectedPatient={'Rider pickup':'ไรเดอร์กำลังไปรับยา','Out for delivery':'ไรเดอร์กำลังไปส่ง','Delivered':'จัดส่งสำเร็จแล้ว'};
await doctor.waitForFunction(t=>document.querySelector('[data-done-order-status]').textContent.includes(t),expectedDoctor[stage]);await patient.waitForFunction(t=>document.querySelector('#tracking').textContent.includes(t),expectedPatient[stage]);const d=await doctor.locator('[data-done-order-status]').innerText();
results.push({test:'visible stage evidence '+stage,status:'pass',doctor:d,patient:(await patient.locator('#tracking').innerText()).slice(0,1300)});
});
await test('golden order rendered values match admin and summary',async()=>{
check((await patient.locator('[data-postpay-total]').first().innerText()).replace(/[^0-9]/g,'')==='1160','Total mismatch: '+await patient.locator('[data-postpay-total]').first().innerText());check((await patient.locator('[data-delivery-address]').innerText()).includes('22/418'),'Address mismatch');check(!await patient.locator('[data-tracking-reference]').isVisible(),'Postal card shown for same-day');await patient.locator('#tracking [data-go="order-summary"]').click();await patient.waitForFunction(()=>document.getElementById('order-summary').classList.contains('active') || document.getElementById('order-summary').classList.contains('is-active'));await patient.waitForFunction(()=>document.querySelector('[data-delivery-items]').textContent.includes('590'));const lines=await patient.locator('[data-delivery-items]').innerText();check((/Finasteride|ฟี|ฟิ/.test(lines))&&(/Minoxidil|ไมน/.test(lines))&&lines.includes('590')&&lines.includes('450'),'Medicine snapshot mismatch');
});
await test('doctor plan event updates explicit golden snapshot without delivery reset',async()=>{
await doctor.evaluate(()=>document.dispatchEvent(new CustomEvent('krane-doctor-order-created',{detail:{items:[{key:'qa',sku:'qa',name:'QA fictional item',price:100,qty:2,directions:'Demo only'}],total:200}})));
await patient.waitForFunction(()=>document.querySelector('[data-postpay-total]').textContent.replace(/[^0-9]/g,'')==='320');await admin.waitForFunction(()=>document.querySelector('[data-golden-order-total]').textContent.replace(/[^0-9]/g,'')==='320');check(await patient.evaluate(()=>KraneGoldenDemo.readState().fulfilmentStatus)==='Delivered','Doctor plan reset delivery');await patient.reload();await patient.waitForFunction(()=>document.querySelector('[data-delivery-items]').textContent.includes('QA fictional item'));
});
await test('delivery status persists across all three reloads',async()=>{for(const p of [admin,patient,doctor]){await p.reload();check(await p.evaluate(()=>KraneGoldenDemo.readState().fulfilmentStatus)==='Delivered','Lost delivery state')}});
for(const role of ['doctor','admin'])await test(role+' legacy root redirect preserves context',async()=>{const page=await ctx.newPage();await page.goto(base+'/cms-'+role+'.html?qa=keep#'+(role==='doctor'?'queue':'cases'));await page.waitForURL('**/cms/cms-'+role+'.html?qa=keep#*');check(new URL(page.url()).search==='?qa=keep','Search lost');await page.close()});
await test('normal patient basket isolated from golden snapshot',async()=>{const normal=await ctx.newPage();await normal.goto(base+'/b2c/krane-b2c.html?screens=1&demoStage=tracking#tracking');await normal.locator('#tracking.active').waitFor({state:'visible'});check((await normal.locator('[data-postpay-total]').first().innerText()).replace(/[^0-9]/g,'')==='558','Golden total overwrote normal basket');check(!(await normal.locator('[data-delivery-address]').innerText()).includes('22/418'),'Golden address overwrote normal address');await normal.close()});
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status==='fail'),out},null,2));await ctx.close();await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
