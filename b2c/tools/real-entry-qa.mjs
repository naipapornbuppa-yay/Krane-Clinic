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
const fail=(name,message)=>{throw Error(name+': '+message)};
try{
for(const method of ['insurance','selfpay'])await test('partner-real-'+method,async p=>{const step=async(label,id)=>{await p.locator('#'+id+'.active').waitFor();};
  await p.goto(`${base}/b2c/krane-b2c.html?entry=partner`, { waitUntil: 'domcontentloaded' });
  await step('entry', 'consent-terms');
  await p.locator('[data-consent-auto-scroll]').click();
  await p.locator('[data-consent-continue]').click();
  await step('consent', 'partner-idcard');
  await p.locator('[data-idcard-skip]').click();
  await step('ID card', 'partner-patient-info');
  await p.locator('#partner-first-name').fill('ณัฐ');await p.locator('#partner-last-name').fill('ตัวอย่าง');await p.locator('#partner-phone').fill('0812345678');if(method==='selfpay')await p.locator('[data-partner-payment-choice-value="self-pay"]').click();await p.locator('[data-partner-info-continue]').click();await p.locator('#otp.active [data-otp-code]').fill('123456');await p.locator('#otp.active [data-auth-complete]').click();await p.waitForFunction(()=>document.querySelector('.screen.active')?.id!=='otp');
if(method==='insurance'){
  await step('patient details', 'insurance');
  await p.locator('#insurance-id').fill('1234567890123');
  await p.locator('#insurance-dob').fill('1997-09-01');
  await p.locator('#insurance [data-insurance-confirm]').click();
  await step('eligibility check', 'partner-insurance');
  await p.locator('#partner-insurance [data-partner-payment="insurance"]').click();
  await step('covered plan', 'intake-concern');

}
await step('payment choice','intake-concern');
  const reliefChoices = await p.locator('#intake-concern [data-partner-relief-value]').evaluateAll(options => ({
    count:options.length,
    compact:options.every(option => !option.classList.contains('option') && !option.querySelector('.opt-check')),
    columns:options[0] ? getComputedStyle(options[0].parentElement).gridTemplateColumns.split(' ').length : 0,
    surface:options[0] ? getComputedStyle(options[0]).backgroundColor : null,
    expectedSurface:getComputedStyle(document.documentElement).getPropertyValue('--color-accent-soft').trim()
  }));
  if (reliefChoices.count !== 4 || !reliefChoices.compact || reliefChoices.columns !== 4 || !reliefChoices.surface || reliefChoices.surface === 'rgba(0, 0, 0, 0)') {
    fail('partner relief component', JSON.stringify(reliefChoices));
  }
  await p.locator('#partner-concern-text').fill('มีผื่นคันที่แขนและปวดศีรษะ');
  await p.locator('#intake-concern [data-partner-relief-value="ยังไม่ได้ทำ"]').click();

  const selectedRelief = await p.locator('#intake-concern [data-partner-relief-value][aria-selected="true"]').allTextContents();
  if (JSON.stringify(selectedRelief.map(text => text.trim())) !== JSON.stringify(['ยังไม่ได้ทำ'])) {
    fail('partner relief selection', JSON.stringify(selectedRelief));
  }
  await p.locator('#intake-concern [data-intake-complete]').click();
  await step('symptom answers', 'intake-general');

  if (await p.locator('[data-direct-health-lifestyle]').isVisible()) {
    fail('partner questions', 'direct-only lifestyle questions are visible');
  }
  const healthPrefill = await p.locator('#intake-general').evaluate(screen =>
    ['intake-sex','intake-dob','intake-height','intake-weight'].map(id => screen.querySelector(`#${id}`)?.value));

  if (JSON.stringify(healthPrefill) !== JSON.stringify(['',method==='insurance'?'1997-09-01':'','',''])) {
    fail('partner DOB prefill', JSON.stringify(healthPrefill));
  }
  if(method==='selfpay')await p.locator('#intake-dob').fill('1997-09-01');
  await p.locator('#intake-sex').selectOption('female');
  await p.locator('#intake-height').fill('175');
  await p.locator('#intake-weight').fill('70');
  await p.locator('#intake-general [data-intake-complete]').click();

  const safety = await p.locator('#health-history-modal').evaluate(modal => ({
    visible: !modal.hidden,
    title: modal.querySelector('h2')?.textContent.trim(),
    questions: [...modal.querySelectorAll('fieldset legend')].map(legend => legend.textContent.trim())
  }));
  if (!safety.visible || safety.title !== 'ยืนยันข้อมูลความปลอดภัย'
      || JSON.stringify(safety.questions) !== JSON.stringify(['โรคประจำตัว','ยาที่ใช้ประจำ','ประวัติแพ้ยา'])) {
    fail('partner questions', JSON.stringify(safety));
  }
  await p.locator('[data-health-history-confirm]').click();
  await step('safety answers', 'matching');
  await p.waitForSelector('#consultpay.active', { timeout: 12000 });
  await step('doctor and fee details', 'consultpay');

  const coveredFee = await p.locator('#consultpay').evaluate(screen => ({
    mode:screen.dataset.checkoutMode,
    coverage:screen.querySelector('[data-consult-coverage-amount]')?.textContent.trim(),
    action:screen.querySelector('[data-consultpay-label]')?.textContent.trim()
  }));
if(method==='insurance'){
  if (coveredFee.coverage !== 'ครอบคลุมเต็มจำนวน' || coveredFee.action !== 'ดำเนินการต่อ') {
    fail('partner fee review', JSON.stringify(coveredFee));
  }
  await p.locator('#consultpay [data-consultpay-go]').click();
  await step('covered fee acknowledgement', 'waitroom');
}

});
await test('direct-real-intake-entry-and-auth-guard',async p=>{
await p.goto(`${base}/b2c/krane-b2c.html?entry=direct&fresh=1#intake1`,{waitUntil:'domcontentloaded'});
await p.locator('#intake1.active').waitFor();
await p.evaluate(()=>location.hash='consent-terms');await p.locator('#signup.active').waitFor();
await p.locator('#signup-phone').fill('0812345678');await p.locator('#signup-password').fill('QaDemo123!');await p.locator('#signup-confirm').fill('QaDemo123!');await p.locator('[data-signup-phone]').click();await p.locator('#otp.active').waitFor();await p.locator('[data-otp-code]').fill('123456');await p.locator('[data-auth-complete]').click();await p.locator('#consent-terms.active').waitFor();
});
}finally{await writeFile(output+'/results.json',JSON.stringify(results,null,2));await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
