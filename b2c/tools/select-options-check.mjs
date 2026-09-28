import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
  for(const hasTouch of [false,true]) {
    const page=await browser.newPage({hasTouch,viewport:{width:390,height:784}});
    await page.setContent('<select id="choice" required><option value=""></option><option value="0">Never</option><option value="1">Sometimes</option></select>');
    await page.addScriptTag({path:'b2c/custom-select.js'});
    await page.evaluate(()=>window.kraneEnhanceSelects(document));
    assert.equal(await page.locator('.custom-select__option').count(),2);
    assert.equal(await page.locator('#choice').inputValue(),'');
    await page.locator('#choice-trigger').press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#choice').inputValue(),'0');
    assert.equal(await page.locator('[role=option][aria-selected=true]').innerText(),'Never');
    await page.evaluate(()=>{
      const select=document.querySelector('select');
      select.innerHTML='<option value="">Choose</option><option value="a">Updated</option><option value="b" hidden>Hidden</option>';
      window.kraneRefreshSelectOptions(select);
    });
    assert.equal(await page.locator('.custom-select__option').count(),1);
    await page.locator('#choice-trigger').click();
    await page.locator('.custom-select__option').click();
    assert.equal(await page.locator('#choice').inputValue(),'a');
    await page.close();
  }
  console.log('PASS: desktop/touch, placeholder validation, keyboard selection, and cascading option refresh');
} finally {await browser.close()}
