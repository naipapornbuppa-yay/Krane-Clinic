#!/usr/bin/env node
/**
 * Existing Tin handoff branch intake compatibility smoke/regression suite. Fictional answers; local static
 * server and ephemeral browser storage only. No deployments or real accounts.
 *
 *   node developer-handoff/tools/behavior-test.mjs --app b2c/krane-b2c.html
 *   node developer-handoff/tools/behavior-test.mjs --app b2c/krane-b2c-handoff.html
 *   node developer-handoff/tools/behavior-test.mjs --compare
 *
 * --compare runs both entrypoints and asserts equivalent observed state.
 * CHROMIUM_PATH overrides the detected Linux browser. QA_OUTPUT overrides /tmp.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname,extname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const compare=process.argv.includes('--compare');
const apps=compare?['b2c/krane-b2c.html','b2c/krane-b2c-handoff.html']:[arg('--app','b2c/krane-b2c-handoff.html').replace(/^\/+/, '')];
const widths=arg('--widths','390,1440').split(',').map(Number);
const filter=arg('--filter','');
const output=resolve(process.env.QA_OUTPUT||'/tmp/krane-handoff-behavior');
await mkdir(output,{recursive:true});
for(const app of apps)await stat(resolve(root,app));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(relative(root,file).startsWith('..'))throw Error('outside root');res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end('not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const executablePath=process.env.CHROMIUM_PATH||['/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
let browser;
try{browser=await chromium.launch({executablePath,args:['--no-sandbox','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});}
catch(error){await writeFile(output+'/results.json',JSON.stringify({status:'blocked',stage:'browser launch',error:error.message,apps,widths},null,2));await new Promise(r=>server.close(r));console.error('Browser launch blocked; no browser test results. See '+output+'/results.json');process.exit(1);} 
const results=[];
const active=p=>p.locator('.screen.active').getAttribute('id');
const step=(p,id)=>p.locator('#'+id+'.active').waitFor();
const question=p=>p.locator('.screen.active [data-intake-question]:not([hidden])');
const signature=p=>p.evaluate(()=>{const s=document.querySelector('.screen.active');return s?.id+':'+(s?.querySelector('.screen__body')?.dataset.intakeQuestionIndex||'0');});
async function advance(p){const before=await signature(p);await p.locator('.screen.active .screen__footer .btn--primary').click();await p.waitForFunction(prior=>{const s=document.querySelector('.screen.active');return s?.id+':'+(s?.querySelector('.screen__body')?.dataset.intakeQuestionIndex||'0')!==prior;},before);}
async function choose(p,id,{multi=false,last=false}={}){const q=question(p);assert.equal(await q.getAttribute('data-question-id'),id);const options=q.locator('.option');const before=await signature(p);await (last?options.last():options.first()).click();if(multi)await advance(p);else await p.waitForFunction(prior=>{const s=document.querySelector('.screen.active');return s?.id+':'+(s?.querySelector('.screen__body')?.dataset.intakeQuestionIndex||'0')!==prior;},before);}
async function clearSafety(p,selector='#red-flag-modal'){const modal=p.locator(selector);await modal.waitFor({state:'visible'});const rows=modal.locator('fieldset:visible');for(let i=0;i<await rows.count();i++)await rows.nth(i).getByRole('radio',{name:/^(ไม่|ไม่มี|ไม่ใช่)$/}).click();}
async function health(p){await p.locator('#intake-sex').selectOption('female');await p.locator('#intake-dob').fill('1997-09-01');await p.locator('#intake-height').fill('175');await p.locator('#intake-weight').fill('70');await p.locator('#intake-general [data-intake-complete]').click();await clearSafety(p,'#health-history-modal');await p.locator('[data-health-history-confirm]').click();}
async function snapshot(p){return p.evaluate(()=>{const screen=document.querySelector('.screen.active');const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden';return{active:screen?.id,hash:location.hash,questions:[...screen.querySelectorAll('[data-question-id]')].filter(visible).map(e=>e.dataset.questionId),selected:[...screen.querySelectorAll('[aria-selected="true"],[aria-checked="true"]')].filter(visible).map(e=>e.dataset.answerId||e.dataset.partnerReliefValue||e.textContent.trim()),modal:[...document.querySelectorAll('.modal-layer')].filter(visible).map(e=>e.id),overflow:document.documentElement.scrollWidth>innerWidth};});}
async function run(app,width,name,fn){if(filter&&!name.includes(filter))return;const context=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce'});context.setDefaultTimeout(12000);context.setDefaultNavigationTimeout(30000);await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const tag=app.includes('-handoff')?'handoff':'original';const observation=[];const capture=async(label)=>{const data=await snapshot(p);assert.equal(data.overflow,false,`${label}: horizontal document overflow`);observation.push({label,...data});await p.screenshot({path:`${output}/${tag}-${width}-${name}-${label}.png`,fullPage:false});};const open=async(params='',hash='intake1')=>{await p.goto(`${base}/${app}${params?'?'+params:''}${hash?'#'+hash:''}`,{waitUntil:'domcontentloaded'});await p.locator('.screen.active').waitFor();};try{await fn(p,open,capture,observation);assert.deepEqual(errors,[],'uncaught browser errors');results.push({app,width,name,status:'pass',observation});console.log('PASS',tag,width,name);}catch(e){await p.screenshot({path:`${output}/${tag}-${width}-${name}-FAILED.png`}).catch(()=>{});results.push({app,width,name,status:'fail',error:e.stack,observation,errors});console.error('FAIL',tag,width,name,e.message);}finally{await context.close();}}
try{
for(const app of apps)for(const width of widths){
await run(app,width,'owned-account-login-and-reentry',async(p,open,capture)=>{
 await open('public=1','login');await step(p,'login');
 // A matched invalid submit must consume, even if a generic route is also present.
 await p.locator('[data-login-submit]').evaluate(el=>el.dataset.go='settings');
 await p.locator('[data-login-submit]').click();assert.equal(await active(p),'login');
 await p.locator('#login-phone').fill('0812345678');
 await p.locator('[data-login-submit]').click();assert.equal(await active(p),'login');
 await p.locator('#login-password').fill('QaDemo123!');
 await p.locator('[data-login-submit]').click();await step(p,'profile');
 await p.evaluate(()=>location.hash='account');await step(p,'account');
 await p.locator('#account-document').fill('1234567890123');
 const id=await p.locator('#account-document').inputValue();
 await p.locator('[data-account-doc="passport"]').click();
 assert.equal(await p.locator('#account-document').inputValue(),'');
 assert.equal(await p.locator('#account-document').getAttribute('inputmode'),'text');
 await p.locator('#account-document').fill('QA1234567');
 await p.locator('[data-account-doc="id"]').click();
 assert.equal(await p.locator('#account-document').inputValue(),id);
 await p.locator('[data-account-doc="passport"]').click();
 assert.equal(await p.locator('#account-document').inputValue(),'QA1234567');
 await capture('account-passport');
 await p.locator('#account .screen__footer [data-go="settings"]').first().click();await step(p,'settings');
 await p.locator('#settings [data-go="account"]').first().click();await step(p,'account');
 assert.equal(await p.locator('#account-document').inputValue(),'QA1234567');
 await p.locator('[data-account-doc="id"]').click();
 assert.equal(await p.locator('#account-document').inputValue(),id);
 await capture('account-reentered');
});
await run(app,width,'owned-password-reset-validation',async(p,open,capture)=>{
 await open('public=1','login');await step(p,'login');
 await p.locator('[data-login-forgot]').click();assert.equal(await active(p),'login');
 await p.locator('#login-phone').fill('0812345678');await p.locator('[data-login-forgot]').click();await step(p,'otp');
 await p.locator('#otp [data-auth-complete]').evaluate(el=>el.dataset.go='settings');
 assert(await p.locator('#otp [data-auth-complete]').isDisabled());assert.equal(await active(p),'otp');
 await p.locator('#otp [data-otp-code]').fill('123456');await p.locator('#otp [data-auth-complete]').click();await step(p,'set-password');
 await p.locator('#new-password').fill('QaDemo123!');await p.locator('#confirm-password').fill('Different123!');
 assert(await p.locator('[data-password-save]').isDisabled());
 await p.locator('#confirm-password').fill('QaDemo123!');await p.locator('[data-password-save]').click();await step(p,'profile');
 await capture('reset-complete');
});
await run(app,width,'hair-full-safety-and-back',async(p,open,capture)=>{
 await open('entry=direct&fresh=1&category=hair-skin');await step(p,'intake1');
 await choose(p,'hair.current_goal');await choose(p,'hair.previous_treatment',{multi:true,last:true});await choose(p,'hair.onset');await choose(p,'hair.loss_area',{multi:true});await choose(p,'hair.family_history',{last:true});await choose(p,'hair.severity');
 await step(p,'intake3');const modal=p.locator('#red-flag-modal');await modal.waitFor();assert.equal(await question(p).getAttribute('data-question-id'),'hair.scalp_symptoms');assert.equal(await modal.locator('fieldset').count(),1);assert(await modal.locator('[data-next]').isDisabled());await capture('scalp-safety-before-photos');
 await clearSafety(p);await modal.locator('[data-next]').click();await step(p,'intake4');await choose(p,'hair.female_cycle_weight',{last:true});await choose(p,'hair.female_pregnancy',{last:true});await step(p,'intake5');assert.equal(await modal.count(),0);await capture('photos-after-safety');
 await p.locator('#intake5 [data-direct-intake-complete]').last().click();await step(p,'signup');await capture('signup');await p.locator('#signup [data-back]').click();await step(p,'intake5');await capture('back-to-photos');await p.locator('#intake5 [data-back]').click();await step(p,'intake4');assert.equal(await question(p).getAttribute('data-question-id'),'hair.female_pregnancy');await capture('back-to-pregnancy-question');
});
await run(app,width,'weight-full-risk-and-back',async(p,open,capture)=>{
 await open('entry=direct&fresh=1&category=weight');await choose(p,'weight.preferred_treatment');await choose(p,'weight.previous_glp1');await choose(p,'weight.motivation',{multi:true});
 await p.locator('#obesity-height').fill('170');await p.locator('#obesity-weight').fill('90');assert.equal(await p.locator('[data-obesity-bmi-value]').innerText(),'31.1');await capture('measurements');await advance(p);
 await p.locator('#obesity-target').fill('75');await p.locator('#intake3 .screen__footer .btn--primary').click();const modal=p.locator('#obesity-risk-modal');await modal.waitFor({state:'visible'});assert.equal(await modal.locator('fieldset:visible').count(),3);
 await modal.locator('fieldset:visible').first().locator('[data-obesity-risk-choice="yes"]').click();assert(await modal.locator('[data-obesity-risk-confirm]').isDisabled());assert(await modal.locator('[data-obesity-risk-warning]').isVisible());await capture('risk-blocks');
 await modal.locator('fieldset:visible').first().locator('[data-obesity-risk-choice="no"]').click();await modal.locator('[data-obesity-risk-confirm]').click();assert.equal(await modal.locator('fieldset:visible').count(),1);await capture('risk-page-two');await modal.locator('.modal-dialog__actions [data-obesity-risk-close]').click();assert.equal(await modal.locator('fieldset:visible').count(),3);await modal.locator('[data-obesity-risk-confirm]').click();await modal.locator('[data-obesity-risk-confirm]').click();await step(p,'signup');await capture('signup');
});
await run(app,width,'general-validation-and-auth-guard',async(p,open,capture)=>{
 await open('entry=direct&fresh=1&category=general');await step(p,'intake-concern');
 await p.locator('#intake-concern [data-intake-complete]').click();assert.equal(await active(p),'intake-concern');
 await p.locator('#partner-concern-text').fill('Fictional QA symptom description');await p.locator('[data-partner-relief-value="ยังไม่ได้ทำ"]').click();await capture('concern');await p.locator('#intake-concern [data-intake-complete]').click();await step(p,'signup');await capture('signup-guard');
});
for(const method of ['insurance','self-pay'])await run(app,width,'partner-'+method,async(p,open,capture)=>{
 await open('entry=partner','');await step(p,'consent-terms');await p.locator('[data-consent-auto-scroll]').click();await p.locator('[data-consent-continue]').click();await step(p,'partner-idcard');await p.locator('[data-idcard-skip]').click();await step(p,'partner-patient-info');
 await p.locator('#partner-first-name').fill('QA');await p.locator('#partner-last-name').fill('Fictional');await p.locator('#partner-phone').fill('0812345678');if(method==='self-pay')await p.locator('[data-partner-payment-choice-value="self-pay"]').click();await p.locator('[data-partner-info-continue]').click();await step(p,'otp');await p.locator('#otp [data-otp-code]').fill('123456');await p.locator('#otp [data-auth-complete]').click();
 if(method==='insurance'){await step(p,'insurance');await p.locator('#insurance-id').fill('1234567890123');await p.locator('#insurance-dob').fill('1997-09-01');await p.locator('#insurance [data-insurance-confirm]').click();await step(p,'partner-insurance');await p.locator('[data-partner-payment="insurance"]').click();}
 await step(p,'intake-concern');await p.locator('#partner-concern-text').fill('Fictional QA symptom description');await p.locator('[data-partner-relief-value="ยังไม่ได้ทำ"]').click();await p.locator('#intake-concern [data-intake-complete]').click();await step(p,'intake-general');assert.equal(await p.locator('#intake-dob').inputValue(),method==='insurance'?'1997-09-01':'');await capture('health');await health(p);await step(p,'matching');await step(p,'consultpay');await capture('fee-review');
});
await run(app,width,'guarded-deep-links-and-auth',async(p,open,capture)=>{
await open('entry=direct&fresh=1&category=sexual-health','intake3'); await step(p,'intake3'); const safety=p.locator('#red-flag-modal'); await safety.waitFor(); assert.equal(await safety.locator('fieldset').count(),1); assert.equal(await question(p).getAttribute('data-question-id'),'ed.heart_history'); await clearSafety(p); await safety.locator('[data-next]').click(); await step(p,'intake4'); await safety.waitFor(); assert.equal(await safety.locator('fieldset').count(),1); assert.equal(await question(p).getAttribute('data-question-id'),'ed.nitrate_use'); await safety.getByRole('radio',{name:'ใช่',exact:true}).click(); await safety.locator('[data-next]').click(); await step(p,'ineligible'); await capture('ed-nitrate-stop');

 await open('entry=direct&fresh=1','intake1');await step(p,'intake1');await p.evaluate(()=>location.hash='consent-terms');await step(p,'signup');await capture('consent-guard');
 await p.locator('#signup-phone').fill('0812345678');await p.locator('#signup-password').fill('QaDemo123!');await p.locator('#signup-confirm').fill('QaDemo123!');await p.locator('[data-signup-phone]').click();await step(p,'otp');await p.locator('#otp [data-otp-code]').fill('123456');await p.locator('#otp [data-auth-complete]').click();await step(p,'consent-terms');await capture('verified-consent');
});
await run(app,width,'repeated-category-and-hash-history',async(p,open,capture,observation)=>{
 await open('entry=direct&fresh=1&category=hair-skin');await step(p,'intake1');
 for(const [category,id,questionId] of [['weight','intake1','weight.preferred_treatment'],['hair-skin','intake1','hair.current_goal'],['general','intake-concern',null],['weight','intake1','weight.preferred_treatment'],['hair-skin','intake1','hair.current_goal']]){
  await p.evaluate(category=>location.hash=`intake1?entry=direct&category=${category}`,category);await step(p,id);if(questionId)await p.waitForFunction(q=>document.querySelector('.screen.active [data-intake-question]:not([hidden])')?.dataset.questionId===q,questionId);assert.equal(await p.locator('.screen.active').count(),1);await capture(`switch-${category}-${observation.length}`);
 }
 await p.evaluate(()=>location.hash='intake3?category=hair-skin&entry=direct');await step(p,'intake3');await p.goBack();await step(p,'intake1');await p.goForward();await step(p,'intake3');await capture('browser-hash-back-forward');
 const before=await p.evaluate(()=>window.history.length);await choose(p,'hair.severity');await clearSafety(p);await p.locator('#red-flag-modal [data-next]').click();await step(p,'intake4');const after=await p.evaluate(()=>window.history.length);assert.equal(after,before,'prototype uses replaceState for ordinary in-app navigation');observation.push({label:'native-history-contract',inAppNavigationAddsBrowserEntry:after>before});await p.locator('#intake4 [data-back]').click();await step(p,'intake3');await p.locator('#red-flag-modal').waitFor();await p.locator('#red-flag-modal [data-prev]').click();assert.equal(await question(p).getAttribute('data-question-id'),'hair.severity');await capture('app-back');
});
}
if(compare){for(const result of results.filter(r=>r.app===apps[1]&&r.status==='pass')){const original=results.find(r=>r.app===apps[0]&&r.width===result.width&&r.name===result.name);if(!original||original.status!=='pass')continue;try{assert.deepEqual(result.observation,original.observation);result.parity='pass';console.log('PARITY',result.width,result.name);}catch(e){result.parity='fail';result.error=e.message;console.error('PARITY FAIL',result.width,result.name);}}}
}finally{await writeFile(output+'/results.json',JSON.stringify({generatedAt:new Date().toISOString(),apps,widths,results},null,2));await browser.close();await new Promise(r=>server.close(r));}
console.log('Results:',output+'/results.json');if(results.some(r=>r.status==='fail'||r.parity==='fail'))process.exitCode=1;
