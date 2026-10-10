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
await test('doctor demo OTP incomplete and valid six-digit login',async()=>{
await p.goto(base+'/cms/cms-doctor.html#login');await p.waitForTimeout(250);await p.locator('[data-auth-next]').click();await p.locator('[data-auth-otp]').fill('12');await p.locator('[data-auth-verify]').click();check(await p.locator('[data-auth-error]').isVisible(),'Incomplete OTP accepted');await p.locator('[data-auth-otp]').fill('482913');await p.locator('[data-auth-verify]').click();await p.locator('[data-auth-next]').waitFor({state:'hidden'});
});
await test('doctor primary consult prescription UI persists shared plan',async()=>{
await p.goto(base+'/cms/cms-doctor.html#queue');await p.waitForTimeout(250);await p.locator('[data-code="CONS-2041"] button').click();await p.locator('[data-selected-patient-action]').click();await p.locator('[data-finish-open]').click();await p.locator('[name=dispense][value=yes]').check();await p.locator('[data-finish-confirm]').click();
const add=p.locator('[data-rx-add-draft]');while(await add.count())await add.first().click();check(await p.locator('[data-order-open]').isDisabled(),'Order available before save');await p.locator('[data-rx-save]').click();await p.locator('[data-order-open]').click();await p.locator('[data-order-confirm]').click();await p.locator('#consult-done.is-active').waitFor({state:'visible'});check(await p.evaluate(()=>KraneGoldenDemo.readState().prescription?.items.length>0),'No persisted plan');
});
await test('admin user required fields and saved in-page row',async()=>{
await p.goto(base+'/cms/cms-admin.html#users');await p.waitForTimeout(250);await p.locator('[data-user-open="new"]').click();await p.locator('[data-user-save]').click();check(await p.locator('[data-user-editor]').isVisible(),'Invalid form closed');await p.locator('[data-user-name-input]').fill('QA fictional user');await p.locator('[data-user-contact-input]').fill('qa@example.test');await p.locator('[data-user-save]').click();check((await p.locator('#users').innerText()).includes('QA fictional user'),'User missing');
});
await test('admin refund cancel preserves order then confirm changes in-page state',async()=>{
await p.goto(base+'/cms/cms-admin.html#fulfilment');await p.waitForTimeout(250);await p.locator('[data-refund-open]').click();await p.locator('[data-refund-cancel]').click();check(await p.locator('[data-refund-panel]').isHidden(),'Cancel did not close');await p.locator('[data-refund-open]').click();await p.locator('[data-refund-confirm]').click();check(await p.locator('[data-order-id="KR-10293"]').getAttribute('data-payment')==='refunded','Refund not reflected');
});

await test('schedule invalid hours rejected and working day survives reload',async()=>{
await p.goto(base+'/cms/cms-doctor.html#schedule');await p.waitForTimeout(250);await p.locator('[data-shift-open]').click();await p.locator('[data-shift-kind=work]').click();await time(p.locator('#shift-from'),'17:00');await time(p.locator('#shift-to'),'09:00');await p.locator('[data-shift-save]').click();check(await p.locator('[data-shift-modal]').isVisible(),'Invalid hours accepted');await time(p.locator('#shift-from'),'09:00');await time(p.locator('#shift-to'),'16:00');const date=await p.locator('#shift-date').inputValue();await p.locator('[data-shift-save]').click();await p.reload();await p.locator('[data-shift-edit="'+date+'"]').click();check(await p.locator('#shift-to').inputValue()==='16:00','Shift lost');await p.locator('[data-shift-cancel]').last().click();
});
await test('availability invalid range rejected then saved',async()=>{
await p.goto(base+'/cms/cms-doctor.html#availability');await p.waitForTimeout(250);const row=p.locator('[data-avail-row]').first();await row.locator('[data-avail-toggle]').check();const times=row.locator('input[type=time]');await time(times.nth(0),'18:00');await time(times.nth(1),'09:00');await p.locator('[data-avail-save]').click();check(/after|หลัง/.test(await p.locator('[data-avail-status]').innerText()),'Invalid availability accepted');await time(times.nth(0),'08:00');await time(times.nth(1),'16:00');await p.locator('[data-avail-save]').click();await p.reload();check(await p.locator('[data-avail-row]').first().locator('input[type=time]').first().inputValue()==='08:00','Availability lost');
});
await test('profile validation and browser persistence',async()=>{
await p.goto(base+'/cms/cms-doctor.html#doctor-profile');await p.waitForTimeout(250);await p.locator('#doctor-profile-email').fill('bad');await p.locator('[data-profile-save]').click();check(/Check|ตรวจ/.test(await p.locator('[data-profile-status]').innerText()),'Invalid email accepted');await p.locator('#doctor-profile-email').fill('qa@example.test');await p.locator('[data-profile-save]').click();await p.reload();check(await p.locator('#doctor-profile-email').inputValue()==='qa@example.test','Profile lost');
});
await test('photo and signature previews persist in browser',async()=>{
await p.goto(base+'/cms/cms-doctor.html#doctor-profile');await p.waitForTimeout(250);const file={name:'qa.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN1sAAAAASUVORK5CYII=','base64')};await p.locator('[data-prtab=photo]').click();await p.locator('[data-photo-input]').setInputFiles(file);await p.waitForFunction(()=>document.querySelector('[data-photo-avatar]').classList.contains('has-photo'));await p.locator('[data-prtab=signature]').click();await p.locator('[data-signature-input]').setInputFiles(file);await p.waitForFunction(()=>document.querySelector('[data-signature-preview]').src.startsWith('data:'));await p.reload();check(await p.locator('[data-signature-preview]').getAttribute('src').then(s=>s.startsWith('data:')),'Signature lost');check(await p.locator('[data-photo-avatar]').evaluate(e=>e.classList.contains('has-photo')),'Photo lost');
});
await test('referral acknowledgement and destination required, then closes without order',async()=>{
await p.goto(base+'/cms/cms-doctor.html#referral');await p.waitForTimeout(250);await p.locator('[data-referral-ack]').uncheck();await p.locator('[data-referral-save]').click();check(await p.locator('#referral').evaluate(e=>e.classList.contains('is-active')),'Unchecked referral closed');await p.locator('[data-referral-ack]').check();await p.locator('[data-referral-destination]').fill('');await p.locator('[data-referral-save]').click();check(/destination|สถานที่/.test(await p.locator('[data-referral-status]').innerText()),'Blank destination accepted');await p.locator('[data-referral-destination]').fill('QA example clinic');await p.locator('[data-referral-save]').click();await p.locator('#consult-done.is-active').waitFor({state:'visible'});check((await p.locator('[data-done-referral]').innerText()).includes('QA example clinic'),'Referral detail lost');
});
await test('no-medicine closeout creates no order',async()=>{
await p.goto(base+'/cms/cms-doctor.html#consult');await p.waitForTimeout(250);await p.locator('[data-finish-open]').click();await p.locator('[name=dispense][value=no]').check();await p.locator('[data-finish-confirm]').click();await p.locator('#consult-done.is-active').waitFor({state:'visible'});check((await p.locator('[data-done-order]').innerText()).trim()==='-','Unexpected order');
});
await test('audit export downloads CSV',async()=>{
await p.goto(base+'/cms/cms-doctor.html#audit-log');await p.waitForTimeout(250);const download=p.waitForEvent('download');await p.locator('[data-audit-export]').click();const file=await download;check(file.suggestedFilename()==='krane-demo-audit.csv','No CSV export');
});

await test('patient and doctor filters handle matching and empty results',async()=>{
await p.goto(base+'/cms/cms-doctor.html#queue');await p.waitForTimeout(250);await p.locator('[data-cf=code]').fill('CONS-2041');check(await p.locator('[data-consult-rows] tr[data-code]:visible').count()===1,'Code filter mismatch');await p.locator('[data-cf=code]').fill('NO-SUCH-CASE');check(await p.locator('[data-consult-empty]').isVisible(),'No empty-state');await p.locator('[data-cf=code]').fill('');const statuses=await p.locator('[data-cf=status] option').evaluateAll(es=>es.map(e=>e.value));for(const status of statuses){await p.locator('[data-cf=status]').selectOption(status);const values=await p.locator('[data-consult-rows] tr[data-code]:visible').evaluateAll(es=>es.map(e=>e.dataset.status));check(!status||values.every(v=>v===status),'Status filter mismatch: '+status)}
await p.goto(base+'/cms/cms-doctor.html#doctors');await p.waitForTimeout(250);await p.locator('[data-df=name]').fill('NO-SUCH-DOCTOR');check(await p.locator('[data-doctor-empty]').isVisible(),'Doctor empty-state missing');await p.locator('[data-df=name]').fill('');check(await p.locator('[data-doctor-rows] tr[data-df-status]:visible').count()>0,'Doctor list not restored');
});
await test('reassign returns consultation to dashboard',async()=>{
await p.goto(base+'/cms/cms-doctor.html#preconsult');await p.waitForTimeout(250);await p.locator('[data-reassign]').click();await p.locator('#dashboard.is-active').waitFor({state:'visible'});
});
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status==='fail'),out},null,2));await ctx.close();await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
