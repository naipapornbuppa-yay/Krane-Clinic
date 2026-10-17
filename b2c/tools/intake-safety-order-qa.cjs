/* Run against a local server with fictional answers; no backend writes. */
const {chromium}=require(process.cwd()+'/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=(process.env.KRANE_QA_BASE||'http://127.0.0.1:8873')+'/b2c/krane-b2c.html?entry=direct&fresh=1&category=';
  const active=()=>page.locator('.screen.active').getAttribute('id');
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});await page.goto(base+'hair-skin#intake3');await page.waitForTimeout(400);
    if(await page.locator('#red-flag-modal').count())throw Error('Safety appeared before photographs');
    await page.locator('#intake3 .option').first().click();await page.waitForTimeout(300);if(await active()!=='intake5')throw Error('Photographs are not next');
    await page.locator('#intake5 [data-direct-intake-complete]').last().click();const modal=page.locator('#red-flag-modal');await modal.waitFor();
    if(await modal.locator('fieldset').count()!==3)throw Error('Hair safety questions are not grouped');
    if(!(await modal.locator('[data-next]').isDisabled()))throw Error('Unanswered batch can continue');
    for(const row of await modal.locator('fieldset').all()){
      if((await row.locator('[role=radio]').allTextContents()).join('|')!=='ไม่ใช่|ใช่')throw Error('Incorrect binary labels');
      await row.getByRole('radio',{name:'ไม่ใช่',exact:true}).click();
    }
    await page.screenshot({path:'/tmp/intake-safety-batch-'+width+'.png'});await modal.locator('[data-next]').click();if(await active()!=='signup')throw Error('Hair clear batch did not finish');
    await page.locator('#signup [data-back]').click();await modal.waitFor();if(await modal.locator('fieldset').count()!==3)throw Error('Back reopened one question instead of the batch');await modal.locator('[data-prev]').click();if(await active()!=='intake5')throw Error('Safety Back did not return to photos');
    await page.goto(base+'sexual-health#intake3');await page.waitForTimeout(400);
    if(await active()!=='intake4'||await modal.locator('fieldset').count()!==2)throw Error('ED safety is split');
    await modal.locator('fieldset').nth(0).getByRole('radio',{name:'ไม่ใช่',exact:true}).click();if(!(await modal.locator('[data-next]').isDisabled()))throw Error('Second ED answer not required');
    await modal.locator('fieldset').nth(1).getByRole('radio',{name:'ไม่ใช่',exact:true}).click();await modal.locator('[data-next]').click();if(await active()!=='signup')throw Error('ED clear batch did not finish');
    await page.goto(base+'sexual-health#intake4');await page.waitForTimeout(300);
    await modal.locator('fieldset').nth(0).getByRole('radio',{name:'ไม่ใช่',exact:true}).click();await modal.locator('fieldset').nth(1).getByRole('radio',{name:'ใช่',exact:true}).click();await modal.locator('[data-next]').click();if(await active()!=='ineligible')throw Error('Nitrate affirmative did not stop care');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Page overflow');console.log(width,'grouped hair/ED safety, required answers, red-flag stop PASS');
  }
  await page.goto(base+'weight#intake3');await page.waitForTimeout(300);await page.locator('#obesity-height').fill('170');await page.locator('#obesity-weight').fill('90');await page.locator('#intake3 .screen__footer .btn--primary').click();await page.locator('#obesity-target').fill('75');await page.locator('#intake3 .screen__footer .btn--primary').click();
  const weight=page.locator('#obesity-risk-modal');if(await weight.locator('fieldset:visible').count()!==3)throw Error('Weight page one must show three');await weight.locator('[data-obesity-risk-confirm]').click();if(await weight.locator('fieldset:visible').count()!==1)throw Error('Weight page two must show the remainder');console.log('More than three safety rows paginate 3 + 1 PASS');
  await page.goto(base+'sexual-health&lang=en#intake4');await page.waitForTimeout(500);const english=page.locator('#red-flag-modal');if(await english.locator('fieldset').count()!==2||/[ก-๛]/.test(await english.innerText()))throw Error('English grouped sheet failed');console.log('English grouped sheet PASS');
  if(errors.length)throw Error(errors.join('\n'));await browser.close();
})();
