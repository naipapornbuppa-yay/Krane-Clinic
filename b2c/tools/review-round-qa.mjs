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
await test('english-current-ui',async p=>{
 await open(p,'profile');await p.evaluate(()=>kraneSetLang(false));await p.waitForTimeout(300);
 const missing=await p.evaluate(async()=>{
 const found=new Set();const collect=root=>{
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){if(['SCRIPT','STYLE','NOSCRIPT'].includes(n.parentElement?.tagName)||!n.parentElement?.getClientRects().length)continue;const t=n.textContent.trim();if(/[ก-฾เ-๛]/.test(t))found.add(t);}
 root.querySelectorAll('[aria-label],[placeholder]').forEach(e=>{for(const k of ['aria-label','placeholder']){const t=e.getAttribute(k)||'';if(/[ก-฾เ-๛]/.test(t))found.add(t);}});
 };
 for(const m of document.querySelectorAll('.modal-layer'))m.hidden=false;
 collect(document.body);
 for(const screen of document.querySelectorAll('section.screen')){document.querySelectorAll('.screen.active').forEach(e=>e.classList.remove('active'));screen.classList.add('active');await new Promise(r=>setTimeout(r,80));collect(screen);}
 return [...found];
 });
 await writeFile(output+'/untranslated.json',JSON.stringify(missing,null,2));assert.deepEqual(missing,[]);
});
await test('status-help-consistency',async p=>{
 for(const width of [390,890]){
 await p.setViewportSize({width,height:900});
 await p.goto(`${base}/b2c/krane-b2c.html?fresh=1&demoStage=tracking&demoStatus=Dispatched#tracking`);
 await p.locator('#tracking.active').waitFor();await p.waitForTimeout(700);
 assert.equal(await p.locator('[data-delivery-eta-state]').innerText(),'กำลังจัดส่ง');
 const heights=await p.locator('.delivery-eta__head-end').evaluate(el=>[...el.children].map(n=>n.getBoundingClientRect().height));
 assert.equal(heights[0],heights[1]);
 await p.locator('#tracking [data-postpay-help]').click();
 const sheet=p.locator('#postpay-help-sheet');await sheet.waitFor({state:'visible'});
 assert.equal(await sheet.locator('.shared-sheet-handle').isVisible(),width===390);
 assert.equal(await sheet.locator('.payment-item-dialog__grabber').isVisible(),false);
 const card=await sheet.locator('[data-postpay-chat]').evaluate(el=>({border:getComputedStyle(el).borderTopWidth,radius:getComputedStyle(el).borderRadius}));
 assert.equal(card.border,'1px');assert.notEqual(card.radius,'0px');
 await p.screenshot({path:output+`/help-cards-${width}.png`});
 await sheet.locator('.shared-modal-close').click();await sheet.waitFor({state:'hidden'});
 }
});
await test('shared-modal-dismissal',async p=>{
 for(const width of [390,890]){
 await p.setViewportSize({width,height:900});await p.goto(`${base}/b2c/krane-b2c.html?fresh=1&demoStage=tracking&demoStatus=Delivered#tracking`);
 const sheet=p.locator('#csat-modal');await sheet.locator('.shared-modal-close').waitFor();
 assert.equal(await sheet.locator('.shared-sheet-handle').isVisible(),width===390);
 await sheet.locator('.shared-modal-close').click();await sheet.waitFor({state:'hidden'});
 await p.evaluate(()=>location.hash='notifications');await p.locator('[data-notif-review]:visible').click();await sheet.waitFor({state:'visible'});
 await sheet.locator('.modal-layer__scrim').click({position:{x:5,y:5}});await sheet.waitFor({state:'hidden'});
 }
});
await test('shared-health-lifestyle',async p=>{
 for(const entry of ['partner','direct']){
 await open(p,'intake-general',entry);
 assert(await p.locator('[data-general-health-hint]').isVisible());
 assert.equal(await p.locator('[data-general-health-submit]').textContent(),'ยืนยันข้อมูลและดำเนินการต่อ');
 for(const field of ['intake-smoking','intake-alcohol']){
 const select=p.locator('#'+field);assert(await select.locator('..').isVisible());
 await select.selectOption('2',{force:true});assert.equal(await select.inputValue(),'2');
 }
 }
});
await test('insurance-document-shared-modes',async p=>{
 for(const rail of [true,false]){
 await p.goto(`${base}/b2c/krane-b2c.html?entry=partner&fresh=1&demoStage=insurance${rail?'&screens=1':''}#insurance`);
 await p.locator('#insurance.active').waitFor();
 for(const doc of ['passport','id']){
 await p.locator('[data-insurance-doc="'+doc+'"]').click();
 assert.equal(await p.locator('label[for="insurance-id"]').textContent(),doc==='id'?'เลขบัตรประชาชน':'เลขหนังสือเดินทาง');
 assert.equal(await p.locator('#insurance-id').getAttribute('placeholder'),doc==='id'?'0-0000-00000-00-0':'เช่น AB1234567');
 }
 const tabs=await p.locator('#insurance .partner-binary').boundingBox();const field=await p.locator('#insurance-id').locator('xpath=ancestor::div[contains(@class,"float-field")][1]').boundingBox();
 assert(Math.abs(tabs.width-field.width)<2);
 }
});
await test('how-vertical-scroll',async p=>{
 await p.goto(`${base}/b2c/krane-b2c-landing.html`);await p.locator('#how').scrollIntoViewIfNeeded();
 const viewport=p.locator('[data-how-viewport]');await viewport.hover();
 const before=await p.evaluate(()=>scrollY);await p.mouse.wheel(0,500);await p.waitForTimeout(500);
 assert((await p.evaluate(()=>scrollY))>before+100);
 await p.locator('#how').scrollIntoViewIfNeeded();await p.locator('.figma-how__indicators [data-how-go="0"]').click();await p.waitForTimeout(1000);await p.locator('[data-how-next]').click();await p.waitForTimeout(1000);
 assert.equal(await p.locator('[data-how-count]').textContent(),'2 / 3');
});
await test('paid-order-starts-preparing',async p=>{
 await open(p,'payment-success');
 await p.evaluate(()=>window.KraneGoldenDemo.advanceFulfilment('Delivered'));
 await p.locator('[data-payment-success-cta]').click();await p.locator('#tracking.active').waitFor();
 assert.equal(await p.evaluate(()=>window.KraneGoldenDemo.readState().fulfilmentStatus),'Preparing');
 assert.equal(await p.locator('#csat-modal:visible').count(),0);
 await p.waitForTimeout(9500);
 assert.equal(await p.evaluate(()=>window.KraneGoldenDemo.readState().fulfilmentStatus),'Preparing');
});
await test('notification-delivery-states',async p=>{
 await open(p,'notifications');assert.equal(await p.locator('[data-mock-status]').count(),10);
 await p.waitForFunction(()=>document.querySelector('[data-mock-status=Preparing] .ic .lucide-pill'));
 assert.equal(await p.locator('[data-mock-status=Preparing] .ic svg').first().innerHTML(),await p.locator('#tracking [data-track-step=prepared] svg').innerHTML());
 for(const method of ['same-day','postal'])for(const status of ['Preparing','Dispatched','Delivered']){
 await p.evaluate(()=>location.hash='notifications');await p.locator('#notifications.active').waitFor();
 await p.locator(`[data-mock-delivery="${method}"][data-mock-status="${status}"]`).click();
 await p.locator('#tracking.active').waitFor();assert.equal(await p.evaluate(()=>window.KraneGoldenDemo.readState().fulfilmentStatus),status);
 assert.equal(await p.locator('#tracking [data-track-step="out"] use').getAttribute('href'),method==='postal'?'#krane-delivery-truck':'#krane-delivery-motorcycle');
 if(status==='Rider pickup'){assert(await p.locator('#tracking [data-track-step=out]').evaluate(el=>el.classList.contains('active')));assert(!(await p.locator('#tracking').innerText()).includes('ไปรับ'));}
 if(status==='Delivered'){await p.locator('#csat-modal:not([hidden])').waitFor();await p.locator('#csat-modal .modal-dialog__actions [data-csat-close]').click();}
 }
});
await test('address-delete-confirmation',async p=>{
 await p.addInitScript(()=>sessionStorage.setItem('krane-p01-flow-state-v1',JSON.stringify({savedAddresses:[{label:'QA Home',building:'123',province:'กรุงเทพมหานคร',district:'บางรัก',subdistrict:'สีลม',postcode:'10500',recipientName:'QA',recipientPhone:'0812345678'}]})));
 await p.goto(`${base}/b2c/krane-b2c.html?screens=1&demoStage=address#address`);await p.locator('#address.active').waitFor();const buttons=p.locator('[data-address-delete]');const before=await buttons.count();assert(before>0);
 await buttons.first().click();await p.locator('#address-delete-confirm[open]').waitFor();assert.equal(await buttons.count(),before);
 await p.locator('[data-delete-cancel]').click();assert.equal(await buttons.count(),before);
 await buttons.first().click();await p.keyboard.press('Escape');assert.equal(await buttons.count(),before);
 await buttons.first().click();await p.locator('[data-delete-confirm]').click();assert.equal(await buttons.count(),before-1);
});
await test('appointment-flat-available-slots',async p=>{
 await open(p,'appointment');await p.locator('[data-appointment-day]').nth(1).click();
 assert.equal(await p.locator('[data-appointment-period]').count(),0);
 assert.equal(await p.locator('[data-appointment-slot][aria-disabled="true"]').count(),0);
 const times=await p.locator('[data-appointment-slot]').evaluateAll(es=>es.map(e=>e.dataset.appointmentTime));assert(times.length>20);assert.deepEqual(times,[...times].sort());
 for(const width of [390,890]){await p.setViewportSize({width,height:844});const slots=await p.locator('[data-appointment-slot]').evaluateAll(es=>es.map(e=>({time:e.dataset.appointmentTime,y:e.getBoundingClientRect().y})));for(let i=1;i<slots.length;i++)assert.equal(slots[i].y===slots[i-1].y,slots[i].time.slice(0,2)===slots[i-1].time.slice(0,2));}
 for(const width of [390,890]){await p.setViewportSize({width,height:844});const slots=await p.locator('[data-appointment-slot]').evaluateAll(es=>es.map(e=>({row:e.style.gridRow,column:Number(e.style.gridColumn)})));let row='',column=0;for(const slot of slots){if(slot.row!==row){row=slot.row;column=0;}assert.equal(slot.column,++column);}}
 await p.locator('[data-appointment-slot]').first().click();assert.equal(await p.locator('[data-appointment-confirm]').isDisabled(),false);
 await p.locator('[data-appointment-day]').nth(2).click();assert.equal(await p.locator('[data-appointment-slot][aria-checked="true"]').count(),0);
});
await test('medicine-sheet-restore-quantity',async p=>{
 await open(p,'payment');
 for(const key of ['cough','loratadine','paracetamol','naproxen']){
 const row=p.locator('#payment [data-order-item="'+key+'"]');
 const max=Number(await row.locator('[data-qty]').getAttribute('data-max'));
 const unit=Number(await row.locator('[data-qty]').getAttribute('data-unit'));
 const initialTotal=await p.locator('#payment [data-payment-subtotal]').first().textContent();
 await row.locator('[data-order-edit]').click();
 const qty=p.locator('[data-payment-item-quantity]'),plus=p.locator('[data-payment-item-plus]'),minus=p.locator('[data-payment-item-minus]');
 while(Number(await qty.textContent())>0)await minus.click();
 assert(await minus.isDisabled());assert.equal(await plus.isDisabled(),false);
 for(let n=1;n<=max;n++){await plus.click();assert.equal(Number(await qty.textContent()),n);assert.equal(Number((await p.locator('[data-payment-item-price]').textContent()).replace(/[^0-9.]/g,'')),unit*n);}
 assert(await plus.isDisabled());
 await p.locator('[data-payment-item-save]').click();
 assert.equal(Number(await row.locator('[data-qty-n]').textContent()),max);
 await row.locator('[data-order-edit]').click();await minus.click();await p.locator('[data-payment-item-save]').click();
 await row.locator('[data-order-edit]').click();assert.equal(Number(await qty.textContent()),max-1);await plus.click();await p.locator('[data-payment-item-save]').click();
 assert.equal(Number(await row.locator('[data-qty-n]').textContent()),max);
 if(initialTotal)assert.equal(await p.locator('#payment [data-payment-subtotal]').first().textContent(),initialTotal);
 }
});
await test('modal-preview-gallery',async p=>{
 await p.goto(`${base}/b2c/krane-b2c.html?screens=1#profile`);await p.setViewportSize({width:1440,height:900});const links=p.locator('[data-modal-preview]');assert(await links.count()>=14);
 await links.first().locator('xpath=ancestor::details').evaluate(e=>e.open=true);
 for(let i=0;i<await links.count();i++){
 await links.nth(i).click();await p.locator('.review-modal-preview[open]').waitFor();
 assert.equal(await p.locator('#profile.active').count(),1);
 await p.locator('.review-modal-preview__close').click();await p.locator('.review-modal-preview').waitFor({state:'detached'});
 }
});
await test('notification-icon-colors',async p=>{
 await open(p,'notifications');
 for(const kind of ['clock','check']){
 const rows=p.locator('[data-notification-icon="'+kind+'"]');assert(await rows.count()>0);
 for(let i=0;i<await rows.count();i++){
 const ic=rows.nth(i).locator('.ic');assert.equal(await ic.evaluate(e=>getComputedStyle(e).backgroundColor),kind==='clock'?'rgb(244, 237, 180)':'rgb(231, 238, 251)');
 assert.equal(await ic.locator('[data-lucide="'+kind+'"]').count(),1);
 }
 }
});
await test('activity-order-cards-no-progress',async p=>{
 await open(p,'activity');assert.equal(await p.locator('#activity [data-activity-type="order"]').count(),5);
 assert.equal(await p.locator('#activity .order-progress').count(),0);
 await p.locator('[data-activity-filter="order"]').click();assert.equal(await p.locator('#activity [data-activity-type="order"]:visible').count(),5);
 assert.equal(await p.locator('[data-activity-empty]').isVisible(),false);
 await p.locator('[data-activity-filter="program"]').click();assert(await p.locator('#activity [data-activity-type="program"]').first().isVisible());
});
await test('feedback-route-sheet',async p=>{await p.goto(`${base}/b2c/krane-b2c.html?screens=1&fresh=1#feedback`);await p.locator('#tracking.active').waitFor();await p.locator('#csat-modal:not([hidden])').waitFor();assert.equal(await p.locator('#csat-modal .rating-row').count(),4);assert.equal(await p.locator('section#feedback').count(),0);});
await test('glass-folder-motion',async p=>{
 for(const width of [390,890]){
 await p.setViewportSize({width,height:1000});await open(p,'profile');
 const card=p.locator('#profile .treatment-card').first();await card.scrollIntoViewIfNeeded();
 const centered=await p.locator('#profile .treatment-folder__sheet').evaluateAll(es=>es.map(el=>{const p=getComputedStyle(el,'::before'),w=el.clientWidth;return Math.abs((w-parseFloat(p.width))/2-parseFloat(p.marginLeft));}));assert(centered.every(gap=>gap<1));
 await p.screenshot({path:output+'/glass-folder-'+width+'.png'});
 await card.hover();assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),'none');
 await card.click();assert(await p.locator('#profile .treatment-folder.is-opening').isVisible());
 assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),'none');
 await p.locator('#treatment-detail.active').waitFor();
 }
 await p.emulateMedia({reducedMotion:'reduce'});await open(p,'profile');
 await p.locator('#profile .treatment-card').first().click();await p.locator('#treatment-detail.active').waitFor();
 assert.equal(await p.locator('.treatment-folder.is-opening').count(),0);
});
await test('treatment-folder-latest',async p=>{
 await open(p,'profile');const folders=p.locator('#profile .treatment-folder');assert.equal(await folders.count(),4);
 const counts=await folders.evaluateAll(es=>es.map(e=>Number(e.dataset.visitCount)));assert.deepEqual(counts,[6,4,2,1]);
 assert.equal(await folders.locator('[role="tab"],button:not(.treatment-card)').count(),0);
 for(let i=0;i<4;i++){
 const folder=folders.nth(i);assert.equal(Number(await folder.locator('.treatment-card').getAttribute('data-consultation-number')),counts[i]);
 await folder.locator('.treatment-card').click();await p.locator('#treatment-detail.active').waitFor();
 await p.locator('#treatment-visit-history summary').click();assert.equal(await p.locator('#treatment-visit-history button').count(),counts[i]);
 await p.locator('#treatment-visit-history button').last().click();assert.equal(Number(await folder.locator('.treatment-card').getAttribute('data-consultation-number')),1);
 await p.evaluate(()=>location.hash='profile');await p.locator('#profile.active').waitFor();
 assert.equal(Number(await folder.locator('.treatment-card').getAttribute('data-consultation-number')),counts[i]);
 }
});
await test('profile-menu-responsive',async p=>{
 for(const width of [390,890,1440]){
 await p.setViewportSize({width,height:900});await open(p,'profile');
 const menu=p.locator('#profile .profile-shell-nav__mobile');await menu.locator('summary').click();
 const drawer=menu.locator('nav');assert(await drawer.isVisible());
 const layout=await drawer.evaluate(el=>({position:getComputedStyle(el).position,display:getComputedStyle(el.querySelector('a')).display,decoration:getComputedStyle(el.querySelector('a')).textDecorationLine,right:el.getBoundingClientRect().right,left:el.getBoundingClientRect().left}));
 assert.equal(layout.position,'absolute');assert.equal(layout.display,'flex');assert.equal(layout.decoration,'none');assert(layout.left>=0 && layout.right<=width);
 await menu.locator('summary').click();assert(!(await drawer.isVisible()));
 }
});
await test('red-flag-sheet-weight-pages',async p=>{
 await open(p,'conditions');await p.locator('[data-category-id="weight"]').first().click();await p.evaluate(()=>location.hash='intake3');await p.locator('#intake3.active').waitFor();
 await p.evaluate(()=>{const body=document.querySelector('#intake3 .screen__body');body.dataset.intakeQuestionIndex=String(body.querySelectorAll('[data-intake-question]').length-1);const b=document.querySelector('#intake3 .screen__footer [data-go]');b.removeAttribute('aria-disabled');b.disabled=false;b.dataset.go='intake4';b.click();});
 await p.locator('#obesity-risk-modal:not([hidden])').waitFor();assert.equal(await p.locator('#obesity-risk-modal [data-obesity-risk]:visible').count(),3);
 await p.locator('#obesity-risk-modal [data-obesity-risk-choice="yes"]:visible').first().click();assert(await p.locator('[data-obesity-risk-confirm]').isDisabled());
 await p.locator('#obesity-risk-modal [data-obesity-risk-choice="no"]:visible').first().click();await p.locator('[data-obesity-risk-confirm]').click();assert.equal(await p.locator('#obesity-risk-modal [data-obesity-risk]:visible').count(),1);
 await p.locator('#obesity-risk-modal [data-obesity-risk-choice="yes"]:visible').click();assert(await p.locator('[data-obesity-risk-confirm]').isDisabled());
});
await test('red-flag-sheet-ed',async p=>{
 await open(p,'conditions');await p.locator('[data-category-id="sexual-health"]').first().click();await p.evaluate(()=>location.hash='intake3');
 await p.locator('#red-flag-modal').waitFor();await p.locator('#red-flag-modal [role="radio"]').filter({hasText:/^ไม่$/}).click();await p.locator('#red-flag-modal [data-next]').click();
 await p.locator('#intake4.active').waitFor();await p.locator('#red-flag-modal').waitFor();await p.locator('#red-flag-modal [role="radio"]').filter({hasText:'ใช่'}).click();await p.locator('#red-flag-modal [data-next]').click();await p.locator('#ineligible.active').waitFor();
});
await test('red-flag-sheet-hair',async p=>{
 await open(p,'conditions');await p.locator('[data-category-id="hair-skin"]').first().click();
 await p.evaluate(()=>location.hash='intake3');
 await p.locator('#intake3 [data-question-id="hair.severity"] .option').first().click();
 await p.locator('#red-flag-modal').waitFor();
 assert.equal(await p.locator('#red-flag-modal fieldset').count(),1);
 assert(await p.locator('#red-flag-modal [data-next]').isDisabled());
 await p.locator('#red-flag-modal [role="radio"]').filter({hasText:'ใช่'}).click();
 await p.locator('#red-flag-modal [data-next]').click();await p.locator('#ineligible.active').waitFor();
});
await test('partner-review-payment-failure-route',async p=>{await open(p,'partner-phr','partner');await p.setViewportSize({width:1440,height:900});await p.locator('.rail [data-go="consultpay-fail"]').first().evaluate(el=>{for(let n=el.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;});await p.locator('.rail [data-go="consultpay-fail"]').first().click();await p.locator('#consultpay-fail.active').waitFor();assert.equal(await p.locator('#partner-phr.active').count(),0);});
await test('partner-review-no-doctor-route',async p=>{await open(p,'partner-phr','partner');await p.setViewportSize({width:1440,height:900});const link=p.locator('.rail [data-demo-nomatch]').first();await link.evaluate(el=>{for(let n=el.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;});await link.click();await p.locator('#matching.active').waitFor();assert.equal(await p.locator('#partner-phr.active').count(),0);await p.locator('#appointment.active').waitFor({timeout:15000});});
await test('direct-general-shared-concern',async p=>{await open(p,'conditions');await p.locator('[data-category-id="general"]').first().click();await p.locator('#intake-concern.active').waitFor();await p.locator('#partner-concern-text').fill('มีอาการไอและเจ็บคอ');await p.locator('[data-partner-relief-value="ยังไม่ได้ทำ"]').click();await p.locator('#intake-concern [data-intake-complete]').click();await p.locator('#signup.active').waitFor();});
await test('address-dropdown-moves-map',async p=>{let query='';await p.route('**/search?**',async route=>{query=new URL(route.request().url()).searchParams.get('q');await route.fulfill({json:[{lat:'13.86',lon:'100.51',display_name:'นนทบุรี',address:{state:'นนทบุรี'}}]});});await open(p,'address');const add=p.locator('[data-address-new]:visible').first();if(await add.count())await add.click();const before=await p.locator('[data-address-pin-tiles]').first().innerHTML();await p.locator('#addressMapProvince').selectOption('นนทบุรี',{force:true});await p.waitForFunction(()=>document.querySelector('#addressMapProvince').value==='นนทบุรี');await p.waitForTimeout(500);assert(query.includes('นนทบุรี'));assert.notEqual(await p.locator('[data-address-pin-tiles]').first().innerHTML(),before);});
await test('address-map-fills-dropdowns',async p=>{await p.route('**/reverse?**',r=>r.fulfill({json:{lat:'13.86',lon:'100.51',display_name:'บ้านตัวอย่าง',address:{state:'นนทบุรี',city_district:'เมืองนนทบุรี',suburb:'สวนใหญ่',postcode:'11000',road:'ถนนตัวอย่าง'}}}));await open(p,'address');const add=p.locator('[data-address-new]:visible').first();if(await add.count())await add.click();await p.locator('[data-address-picker-open]:visible').first().click();await p.locator('[data-sim-zoom="1"]:visible').click();await p.locator('[data-address-map-confirm]:enabled').waitFor();await p.locator('[data-address-map-confirm]').click();assert.equal(await p.locator('#addressMapProvince').inputValue(),'นนทบุรี');assert.equal(await p.locator('#addressMapDistrict').inputValue(),'เมืองนนทบุรี');assert.equal(await p.locator('#addressMapSubdistrict').inputValue(),'สวนใหญ่');assert.equal(await p.locator('#addressMapPostcode').inputValue(),'11000');});
await test('delivered-csat-prompt-and-reminder',async p=>{await p.goto(`${base}/b2c/krane-b2c.html?fresh=1&demoStage=tracking&demoStatus=Delivered#tracking`);await p.locator('#csat-modal:not([hidden])').waitFor();await p.locator('#csat-modal .modal-dialog__actions [data-csat-close]').click();await p.evaluate(()=>location.hash='notifications');await p.locator('[data-notif-review]:visible').waitFor();await p.locator('[data-notif-review]').click();await p.locator('#csat-modal:not([hidden])').waitFor();});
await test('four-section-csat-submit',async p=>{await p.goto(`${base}/b2c/krane-b2c.html?fresh=1&demoStage=tracking&demoStatus=Delivered#tracking`);await p.locator('#csat-modal:not([hidden])').waitFor();assert.equal(await p.locator('#csat-modal .rating-row').count(),4);assert.equal(await p.locator('#csat-modal .star.on').count(),0);await p.locator('[data-csat-submit]').click();assert(await p.locator('#csat-modal').isVisible());for(const group of ['waiting','av','doctor','overall'])await p.locator('[data-csat-'+group+'] .star').last().click();await p.locator('[data-csat-submit]').click();await p.locator('#csat-modal').waitFor({state:'hidden'});await p.evaluate(()=>location.hash='notifications');assert.equal(await p.locator('[data-notif-review]:visible').count(),0);});
await test('partner-first-phone-otp',async p=>{await open(p,'partner-patient-info','partner');await p.locator('#partner-first-name').fill('QA');await p.locator('#partner-last-name').fill('Patient');await p.locator('#partner-phone').fill('0812345678');await p.locator('[data-partner-info-continue]').click();await p.locator('#otp.active').waitFor();await p.locator('[data-otp-code]').fill('123456');await p.locator('[data-auth-complete]').click();await p.locator('#insurance.active').waitFor();});
for(const method of ['insurance','self-pay'])await test('partner-otp-completes-'+method,async p=>{
 await open(p,'partner-patient-info','partner');
 await p.locator('#partner-first-name').fill('QA');await p.locator('#partner-last-name').fill('Patient');await p.locator('#partner-phone').fill('0812345678');
 await p.locator('[data-partner-payment-choice-value="'+method+'"]').click();
 await p.locator('[data-partner-info-continue]').click();await p.locator('#otp.active').waitFor();
 await p.locator('[data-otp-code]').fill('123456');await p.locator('[data-auth-complete]').click();
 await p.locator('#'+(method==='insurance'?'insurance':'intake-concern')+'.active').waitFor();
 await p.waitForTimeout(500);assert.equal(await p.locator('#otp.active').count(),0);
 assert.equal((await p.locator('#partner-phone').inputValue()).replace(/\D/g,''),'0812345678');
 await p.evaluate(()=>location.hash='partner-patient-info');await p.locator('#partner-patient-info.active').waitFor();
 await p.locator('[data-partner-info-continue]').click();
 await p.locator('#'+(method==='insurance'?'insurance':'intake-concern')+'.active').waitFor();
 assert.equal(await p.locator('#otp.active').count(),0);

});
await test('partner-invalid-phone',async p=>{await open(p,'partner-patient-info','partner');await p.locator('#partner-first-name').fill('QA');await p.locator('#partner-last-name').fill('Patient');await p.locator('#partner-phone').fill('123');await p.locator('[data-partner-info-continue]').click();assert(await p.locator('#partner-patient-info.active').count());assert.equal(await p.locator('#otp.active').count(),0);});
await test('date-placeholder-and-value',async p=>{await open(p,'insurance','partner');const input=p.locator('#insurance-dob');await input.fill('');await input.dispatchEvent('input');assert.equal(await p.locator('label[for="insurance-dob"]').isVisible(),false);await input.fill('1994-03-12');assert(await p.locator('label[for="insurance-dob"]').isVisible());});
await test('documents-toolbar-mobile',async p=>{await open(p,'my-documents');const search=await p.locator('.my-documents__search').boundingBox();const sort=await p.locator('.my-documents__toolbar .custom-select__trigger').boundingBox();assert(search&&sort);assert(Math.abs(search.y-sort.y)<2);assert(search.width>sort.width);await p.locator('[data-document-search]').fill('ZZ-no-document');assert(await p.locator('[data-document-empty]').isVisible());});
await test('notification-button-appearance',async p=>{for(const width of [390,1440]){await p.setViewportSize({width,height:900});await open(p,'notifications');const rows=await p.locator('#notifications button.notif:visible').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {appearance:s.appearance,background:s.backgroundColor,left:s.borderLeftWidth,right:s.borderRightWidth,bottom:s.borderBottomWidth,top:s.borderTopStyle}}));assert(rows.length>10);for(const row of rows){assert.equal(row.appearance,'none');assert.equal(row.background,'rgba(0, 0, 0, 0)');assert.equal(row.left,'0px');assert.equal(row.right,'0px');assert.equal(row.bottom,'0px');assert(['none','solid'].includes(row.top));}await p.screenshot({path:output+'/notifications-'+width+'.png',fullPage:true});}});
await test('notification-review-reentry',async p=>{await p.goto(`${base}/b2c/krane-b2c.html?fresh=1&demoStage=tracking&demoStatus=Delivered#tracking`);for(let i=0;i<2;i++){await p.locator('#csat-modal:not([hidden])').waitFor();await p.locator('#csat-modal .modal-dialog__actions [data-csat-close]').click();await p.evaluate(()=>location.hash='notifications');await p.locator('[data-notif-review]:visible').click();await p.locator('#tracking.active').waitFor();}await p.locator('#csat-modal:not([hidden])').waitFor();});
await test('article-filter-and-detail',async p=>{await open(p,'articles');await p.locator('[data-article-filter="weight"]').click();assert.equal(await p.locator('[data-article-feed] [data-article-id]').count(),1);await p.locator('[data-article-feed] [data-article-id]').click();await p.locator('#article.active').waitFor();assert(await p.locator('[data-article-body] section').count()>=7);assert(await p.locator('[data-article-byline] img').isVisible());});
await test('appointment-buttons-stationary',async p=>{await open(p,'appointment');const day=p.locator('[data-appointment-day]').first();const before=await day.boundingBox();await day.hover();await p.mouse.down();const after=await day.boundingBox();await p.mouse.up();assert.deepEqual(after,before);});
await test('matching-choice-components',async p=>{await open(p,'intake-concern','partner');assert.equal(await p.locator('[data-partner-duration-unit="วัน"]').getAttribute('aria-selected'),'true');assert.equal(await p.locator('[data-partner-relief-value][aria-selected="true"]').count(),0);await p.locator('[data-partner-relief-value="พบแพทย์"]').click();assert.equal(await p.locator('[data-partner-relief-value][aria-selected="true"]').count(),1);const styles=await p.evaluate(()=>['#intake-concern .partner-duration-units button','#intake-concern .partner-relief-grid button'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return [document.querySelector(selector).getBoundingClientRect().height,s.borderRadius,s.fontSize,s.backgroundColor]}));assert.equal(styles[0][0],styles[1][0]);assert.equal(styles[0][1],styles[1][1]);});
await test('all-screen-layout-inventory',async p=>{await open(p,'profile');const report=await p.evaluate(()=>{const out=[];for(const screen of document.querySelectorAll('section.screen[id]')){const previous=document.querySelector('.screen.active');previous?.classList.remove('active');screen.classList.add('active');screen.hidden=false;const box=screen.getBoundingClientRect();const logo=screen.querySelector('.intake-lockup,.checkout-brandbar__logo,.payment-topbar__logo');out.push({id:screen.id,width:box.width,scrollWidth:screen.scrollWidth,overflow:screen.scrollWidth>box.width+2,logo:logo?{width:logo.getBoundingClientRect().width,height:logo.getBoundingClientRect().height}:null});screen.classList.remove('active');previous?.classList.add('active')}return out});await writeFile(output+'/screen-layout.json',JSON.stringify(report,null,2));assert(report.length>50);assert(!report.some(row=>['history','followups','intake-edu'].includes(row.id)));});
}finally{await writeFile(output+'/results.json',JSON.stringify(results,null,2));await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
