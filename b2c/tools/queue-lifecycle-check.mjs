import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.KRANE_BASE||'http://127.0.0.1:5178';
const url=base+'/b2c/krane-b2c.html';
const key='krane-pending-consultation-v1';
try{
 await page.goto(url);await page.waitForSelector('#landing.active');
 await page.evaluate(()=>sessionStorage.setItem('krane-p01-flow-state-v1',JSON.stringify({entryChannel:'direct',returningIdentityValid:true,directGeneralHealthComplete:true,patientInfoComplete:true,patientName:'Queue test'})));
 await page.goto(url+'?wait=long#waitroom');
 await page.waitForSelector('#waitroom.active');
 assert(await page.locator('[data-queue-elapsed]').isVisible());
 assert(await page.locator('[data-queue-delay]').isVisible());
 await page.screenshot({path:'/tmp/krane-queue-v181.png'});
 const started=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).startedAt,key);
 await page.locator('#waitroom [data-queue-close]').click();
 await page.reload();await page.waitForSelector('#queue-resume.active');
 await page.locator('[data-queue-resume]').click();await page.waitForSelector('#waitroom.active');
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).startedAt,key),started);
 await page.locator('#waitroom [data-queue-cancel]').click();
 await page.locator('[data-queue-cancel-back]').click();
 assert(await page.evaluate(k=>!!localStorage.getItem(k),key));
 // A deadline in the past cannot be renewed by reopening the queue.
 await page.evaluate(()=>sessionStorage.setItem('test-expire-queue','1'));
 await page.addInitScript(k=>{if(sessionStorage.getItem('test-expire-queue')){sessionStorage.removeItem('test-expire-queue');const q=JSON.parse(localStorage.getItem(k));q.readyAt=Date.now()-301000;localStorage.setItem(k,JSON.stringify(q))}},key);
 await page.reload();await page.locator('[data-queue-resume]').click();
 await page.waitForSelector('#waitroom-expired-modal:not([hidden])');
 assert.equal(await page.locator('[data-wait-enter]').isVisible(),false);
 await page.locator('[data-waitroom-retry]').click();
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('krane-p01-flow-state-v1')).patientName),'Queue test');
 // Re-enter and cancel; the next visit must not offer the previous queue.
 await page.goto(url+'?wait=long#waitroom');await page.waitForSelector('#waitroom.active');
 await page.locator('#waitroom [data-queue-cancel]').click();
 await page.locator('[data-queue-cancel-confirm]').click();await page.waitForURL('**#intake1');
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('krane-p01-intake-draft-v2')),null);
 await page.reload();assert.equal(await page.locator('#queue-resume.active').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: elapsed timer, long wait, close/resume, cancel dismissal, persisted expiry, rematch preservation, cancellation reset; no page errors');
}finally{await browser.close()}
