/* Genuine first-visit consent tests: do not seed a consent fixture here. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..'),out=process.env.QA_OUTPUT||'/tmp/krane-cookie-qa',KEY='krane_cookie_preferences_v1';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const f=join(root,decodeURIComponent(req.url.split('?')[0]));if(!(await stat(f)).isFile())throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.mp4':'video/mp4'})[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=(process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`).replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});let checks=0;const results=[],errors=[],external=new Set();
const check=(value,message)=>{assert(value,message);checks++};
const consent=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
const banner=p=>p.locator('[data-cookie-banner]');const dialog=p=>p.locator('[data-cookie-preferences]');
function monitor(p){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{const url=new URL(r.url());if(['http:','https:'].includes(url.protocol)&&url.origin!==new URL(base).origin)external.add(url.origin);});}
const open=(p,route)=>p.goto(base+'/b2c/'+route,{waitUntil:'domcontentloaded'});
try{
for(const width of [390,1440])for(const lang of ['th','en']){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});ctx.setDefaultNavigationTimeout(60000);const p=await ctx.newPage();monitor(p);
 await open(p,'krane-b2c-landing.html?lang='+lang);await banner(p).waitFor();
 check(await banner(p).isVisible(),'First-visit banner '+width+'/'+lang);
 check(await consent(p)===null,'No consent inferred from visiting');
 check(await p.evaluate(()=>!KraneCookieConsent.isAllowed('analytics')&&!KraneCookieConsent.isAllowed('advertising')),'Optional categories denied by default');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No banner horizontal overflow');
 const bannerBox=await banner(p).boundingBox();check(bannerBox.width<=width&&bannerBox.y>=0&&bannerBox.y+bannerBox.height<=901,'Responsive banner fits viewport');
 check((await banner(p).innerText()).includes(lang==='en'?'No analytics or advertising':'ไม่มีเครื่องมือวิเคราะห์'),'Accurate current inventory copy');
 check((await banner(p).locator('a').boundingBox()).height>=44,'Banner policy link has a 44px touch target');
 await banner(p).screenshot({path:join(out,`banner-${width}-${lang}.png`)});
 await p.screenshot({path:join(out,`notice-page-${width}-${lang}.png`),animations:'disabled'});
 await p.evaluate(()=>localStorage.setItem('krane-cookie-qa-sentinel','preserve'));
 await banner(p).locator('[data-cookie-action=open]').click();check(await dialog(p).isVisible(),'Preferences open');
 check((await dialog(p).locator('a').boundingBox()).height>=44,'Dialog policy link has a 44px touch target');
 check(await dialog(p).locator('input:checked:disabled').count()===1,'Necessary always active');
 check(await dialog(p).locator('[data-cookie-category]:not(:checked):disabled').count()===2,'Unavailable optional categories stay off');
 await p.keyboard.press('Tab');check(await p.evaluate(()=>document.querySelector('[data-cookie-preferences]').contains(document.activeElement)),'Keyboard stays in native modal');
 await p.keyboard.press('Escape');check(!await dialog(p).isVisible()&&await banner(p).isVisible(),'Escape closes without consenting');
 check(await consent(p)===null,'Dismissal is not consent');
 check(await banner(p).locator('[data-cookie-action=open]').evaluate(e=>e===document.activeElement),'Escape returns focus to opener');
 await banner(p).locator('[data-cookie-action=open]').click();await dialog(p).screenshot({path:join(out,`preferences-${width}-${lang}.png`)});
 await dialog(p).locator('[data-cookie-action=reject]').click();let saved=await consent(p);
 check(saved.decision==='necessary_only'&&saved.necessary&&!saved.analytics&&!saved.advertising,'Necessary-only choice persisted');
 check(await p.evaluate(()=>localStorage.getItem('krane-cookie-qa-sentinel'))==='preserve','Rejecting optional storage preserves unrelated user data');
 check(!await banner(p).isVisible(),'Choice dismisses notice');
 await p.reload({waitUntil:'domcontentloaded'});check(!await banner(p).isVisible(),'Choice survives reload');
 await open(p,'condition-detail.html?condition=hair-loss&lang='+lang);check(!await banner(p).isVisible(),'Choice survives page navigation');
 const settings=p.locator('a[data-cookie-settings]').first();if(!await settings.isVisible())await p.locator('details[data-footer-group]').filter({has:settings}).locator('summary').click();await settings.click();check(await dialog(p).isVisible(),'Footer reopens settings');
 const other=lang==='en'?'th':'en';await p.evaluate(value=>{document.documentElement.lang=value;document.dispatchEvent(new CustomEvent('krane:languagechange',{detail:{lang:value}}));},other);await p.waitForTimeout(80);
 check((await dialog(p).innerText()).includes(other==='en'?'Privacy preferences':'การตั้งค่าความเป็นส่วนตัว'),'Open dialog language updates');
 await dialog(p).locator('[data-cookie-action=accept]').click();saved=await consent(p);
 check(saved.decision==='accept_all'&&!saved.analytics&&!saved.advertising,'Accept all acknowledges available storage without enabling absent trackers');
 await open(p,'cookies.html?lang='+lang+'#controls');check(await dialog(p).isVisible(),'Policy deep link opens settings');
 await dialog(p).locator('[data-cookie-action=save]').click();check((await consent(p)).decision==='save','Save preferences persists');
 await open(p,'krane-b2c.html?lang='+lang+'&public=1&screens=1#landing');check(!await banner(p).isVisible(),'Shared consent reaches application shell');
 await p.waitForFunction(()=>Boolean(document.querySelector('#landing iframe')?.contentWindow?.KraneCookieConsent));
 const frames=p.frames().filter(f=>f.url().includes('krane-b2c-landing.html'));check(frames.length===1,'Embedded landing loaded');
 for(const frame of frames){
  check(await frame.locator('[data-cookie-banner]').count()===0,'No duplicate iframe notice');
  const frameSettings=frame.locator('a[data-cookie-settings]').first();if(!await frameSettings.isVisible())await frame.locator('details[data-footer-group]').filter({has:frameSettings}).locator('summary').click();await frameSettings.click();
  check(await dialog(p).isVisible(),'Embedded footer opens shell preferences');await p.keyboard.press('Escape');
 }
 await open(p,'krane-b2c.html?lang='+lang+'&public=1&screens=1#settings');await p.locator('#settings.active').waitFor();await p.locator('#settings [data-cookie-settings]').click();check(await dialog(p).isVisible(),'Application settings reopen preferences');await p.keyboard.press('Escape');
 check((await ctx.cookies()).length===0,'No site cookies created by consent choices');
 await ctx.close();results.push({width,lang,status:'pass'});
}
// A first-time application entry owns the banner above its embedded landing.
{
 const ctx=await browser.newContext({viewport:{width:390,height:900}});const p=await ctx.newPage();monitor(p);await open(p,'krane-b2c.html?public=1&screens=1#landing');await banner(p).waitFor();
 await p.waitForFunction(()=>Boolean(document.querySelector('#landing iframe')?.contentWindow?.KraneCookieConsent));
 check(await p.locator('[data-cookie-banner]').count()===1&&await banner(p).isVisible(),'Fresh app entry displays one shell notice');
 const landing=p.frames().find(f=>f.url().includes('krane-b2c-landing.html'));check(await landing.locator('[data-cookie-banner]').count()===0,'Fresh embedded landing does not duplicate consent');
 await banner(p).locator('[data-cookie-action=reject]').click();check((await consent(p)).decision==='necessary_only','First app entry saves necessary-only');await ctx.close();
}
// Cross-tab synchronization and malformed/versioned storage are separate fresh contexts.
{
 const ctx=await browser.newContext();const p=await ctx.newPage(),other=await ctx.newPage();monitor(p);monitor(other);await open(p,'doctors.html?lang=en');await open(other,'condition-detail.html?condition=weight&lang=en');
 await banner(p).locator('[data-cookie-action=reject]').click();await other.waitForFunction(()=>document.querySelector('[data-cookie-banner]').hidden);check(!await banner(other).isVisible(),'Choice synchronized to another tab');
 await p.evaluate(key=>localStorage.removeItem(key),KEY);await banner(other).waitFor();check(await banner(other).isVisible(),'Removing choice prompts other tabs again');
 await p.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:99,necessary:true,analytics:true,advertising:true})),KEY);await p.reload({waitUntil:'domcontentloaded'});check(await banner(p).isVisible(),'Unknown/corrupt version never grants consent');check(!await p.evaluate(()=>KraneCookieConsent.isAllowed('analytics')),'Untrusted record cannot enable analytics');await ctx.close();
}
{
 const ctx=await browser.newContext();await ctx.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===localStorage)throw new DOMException('Blocked','SecurityError');return original.call(this,k,v)};});const p=await ctx.newPage();monitor(p);await open(p,'krane-b2c-landing.html?lang=en');await banner(p).locator('[data-cookie-action=reject]').click();check((await p.locator('.krane-cookie-status').innerText()).includes('tab session'),'Blocked persistent storage reports session fallback');await p.reload({waitUntil:'domcontentloaded'});check(!await banner(p).isVisible(),'Session fallback survives reload');await ctx.close();
}
{
 const ctx=await browser.newContext();await ctx.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError')};});const p=await ctx.newPage();monitor(p);await open(p,'doctors.html?lang=en');await banner(p).locator('[data-cookie-action=reject]').click();check((await p.locator('.krane-cookie-status').innerText()).includes('page only'),'Fully blocked storage reports memory-only choice');check(!await banner(p).isVisible(),'Memory-only choice dismisses banner for current page');await ctx.close();
}
check(external.size===0,'No third-party requests before or after consent: '+[...external].join(', '));check(errors.length===0,'No browser errors: '+errors.join('; '));
await writeFile(join(out,'results.json'),JSON.stringify({checks,results,externalRequests:[...external],errors},null,2));console.log(`Cookie consent QA: ${checks} checks passed; no third-party requests observed.`);
}finally{await browser.close();server.close();}
