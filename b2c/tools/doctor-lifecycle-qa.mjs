import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),out=process.env.QA_OUTPUT||'/tmp/krane-cms-actions';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[],inventory=[];

async function test(name,fn){console.log('RUN',name);try{await p.goto('about:blank');await p.waitForTimeout(250);await fn();results.push({test:name,status:'pass'})}catch(e){results.push({test:name,status:'fail',error:e.message,severity:'P1'});console.error(name,e.message)}}
function check(x,m){if(!x)throw Error(m)}

const ctx=await browser.newContext();ctx.setDefaultTimeout(10000);const p=await ctx.newPage();
async function time(input,value){await input.locator('..').locator('.cms-picker__trigger').click();await p.locator('.cms-picker__pop:not([hidden]) [data-time=\"'+value+'\"]').click()}

try{
await test('SOAP draft survives reload and reports browser-only storage',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.locator('#soap-s').fill('QA fictional note');await p.reload();check(await p.locator('#soap-s').inputValue()==='QA fictional note','SOAP lost on reload');check(/session|เบราว์เซอร์/.test(await p.locator('[data-soap-status]').innerText()),'Misleading save status');
});
await test('invalid quantity and blank directions block chat and save',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');const rows=p.locator('[data-consult-rx-list]');await rows.locator('[data-rx-qty]').first().fill('0');await p.locator('[data-rx-card-send]').click();check(await p.locator('#consult .rx-card').count()===0,'Invalid quantity sent');await rows.locator('[data-rx-qty]').first().fill('1.5');await p.locator('[data-rx-card-send]').click();check(await p.locator('#consult .rx-card').count()===0,'Fractional quantity sent');await rows.locator('[data-rx-qty]').first().fill('1');await rows.locator('[data-rx-dir]').first().fill('');await p.locator('[data-rx-card-send]').click();check(await p.locator('#consult .rx-card').count()===0,'Blank directions sent');await p.evaluate(()=>go('prescribe'));await p.locator('[data-rx-save]').click();check(await p.locator('[data-order-open]').isDisabled(),'Invalid draft saved');
});
await test('edited prescription persists reload and chat snapshot stays immutable',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.locator('[data-consult-rx-list] [data-rx-dir]').first().fill('QA instructions A');await p.locator('[data-rx-card-send]').click();await p.locator('[data-consult-rx-list] [data-rx-dir]').first().fill('QA instructions B');check((await p.locator('#consult .rx-card').last().innerText()).includes('QA instructions A'),'Previous preview mutated');await p.reload();check(await p.locator('[data-consult-rx-list] [data-rx-dir]').first().inputValue()==='QA instructions B','Prescription draft lost');
});
await test('search handles name SKU no-match and duplicate',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.locator('#consult [data-drug-open]').click();await p.locator('[data-drug-q]').fill('NO-MATCH-XYZ');check(await p.locator('[data-drug-add]').count()===0,'No-match results wrong');await p.locator('[data-drug-q]').fill('147158');await p.locator('[data-drug-add="147158"]').click();await p.locator('[data-drug-q]').fill('FIRIDE');await p.locator('[data-drug-add="147158"]').click();await p.locator('[data-drug-modal] .cms-modal__close').click();check(await p.locator('[data-consult-rx-list] b').filter({hasText:'FIRIDE'}).count()===1,'Duplicate medicine added');
});
await test('mic camera leave and reconnect preserve consultation work',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.locator('[data-room-mic]').click();check(await p.locator('[data-room-mic]').getAttribute('aria-pressed')==='true','Mute control failed');await p.locator('[data-room-cam]').click();check(await p.locator('[data-room-cam]').getAttribute('aria-pressed')==='true','Camera control failed');await p.locator('[data-room-end]').click();check(await p.locator('[data-room-rejoin]').isVisible(),'Reconnect missing');await p.locator('[data-room-rejoin]').click();check(await p.locator('[data-room]').getAttribute('data-room-mode')==='video','Reconnect state failed');check(await p.locator('#soap-s').inputValue()==='QA fictional note','Notes lost');
});
await test('follow-up edit survives language and fixture redraw',async()=>{
await p.goto(base+'/cms/cms-doctor.html#prescribe');await p.locator('[data-golden-follow-up]').fill('20 December 2026');await p.locator('.lang__opt[data-lng=en]:visible').click();check(await p.locator('[data-golden-follow-up]').inputValue()==='20 December 2026','Follow-up overwritten');
});
await test('mobile consult editor visible and no horizontal overflow',async()=>{
await p.setViewportSize({width:390,height:844});await p.goto(base+'/cms/cms-doctor.html#consult');check(await p.locator('#consult [data-drug-open]').isVisible(),'Medicine search inaccessible');check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile overflow');await p.waitForTimeout(700);await p.locator('.consult-rx').screenshot({path:out+'/consult-editor-mobile.png'});await p.setViewportSize({width:1440,height:1000});await p.waitForTimeout(700);await p.locator('.consult-rx').screenshot({path:out+'/consult-editor-desktop.png'});
});

await test('edited allergy appears in consultation context',async()=>{
await p.goto(base+'/cms/cms-doctor.html#preconsult');await p.locator('[data-edit-patient]').click();await p.locator('[data-pe=allergies]').fill('QA allergy fixture');await p.locator('[data-patient-save]').click();await p.evaluate(()=>go('consult'));check((await p.locator('[data-consult-allergies]').innerText()).includes('QA allergy fixture'),'Consultation allergy stale');
});
await test('edit invalidates saved prescription and duplicate confirm is ignored',async()=>{
await p.goto(base+'/cms/cms-doctor.html#prescribe');await p.locator('[data-rx-save]').click();check(await p.locator('[data-order-open]').isEnabled(),'Valid draft not saved');await p.locator('[data-rx-rows] [data-rx-dir]').first().fill('QA revised directions');check(await p.locator('[data-order-open]').isDisabled(),'Edit did not invalidate save');await p.locator('[data-rx-save]').click();await p.locator('[data-order-open]').click();await p.evaluate(()=>{window.qaOrders=0;document.addEventListener('krane-doctor-order-created',()=>window.qaOrders++)});await p.locator('[data-order-confirm]').click();await p.locator('[data-order-confirm]').evaluate(el=>el.click());check(await p.evaluate(()=>window.qaOrders)===1,'Duplicate order event');
});
await test('storage failure shows failed SOAP save',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.evaluate(()=>Storage.prototype.setItem=function(){throw Error('QA storage unavailable')});await p.locator('#soap-s').fill('QA unsaved note');check(/could not|ไม่ได้/.test(await p.locator('[data-soap-status]').innerText()),'False save success');
});
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status==='fail'),out},null,2));await ctx.close();await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
