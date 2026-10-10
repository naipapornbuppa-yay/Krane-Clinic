#!/usr/bin/env node
/* Browser QA for repeated logo, public header, app bar and bottom navigation. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try {
    const file = join(root, path);
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type':types[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}/b2c/`;
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH || undefined, args:['--no-sandbox'] });
const results = [];
const screenshotDir = process.env.QA_SCREENSHOT_DIR || '';
if (screenshotDir) await mkdir(screenshotDir, { recursive:true });
try {
  for (const width of [320, 360, 390, 768, 1100, 1440]) {
    const page = await browser.newPage({ viewport:{ width, height:900 } });
    for (const route of ['krane-b2c-landing.html', 'condition-detail.html?condition=weight', 'doctors.html', 'glp1-safety.html']) {
      await page.goto(base + route, { waitUntil:'domcontentloaded' });
      await page.locator('.site-header .brand-lockup').waitFor();
      results.push(await page.evaluate(({route,width}) => {
        const box = element => { if (!element || getComputedStyle(element).display === 'none') return null; const r=element.getBoundingClientRect(); return {x:Math.round(r.x*10)/10,y:Math.round(r.y*10)/10,width:Math.round(r.width*10)/10,height:Math.round(r.height*10)/10}; };
        return {route,width,header:box(document.querySelector('.site-header')),logo:box(document.querySelector('.site-header .brand-lockup')),menu:box(document.querySelector('.site-header .menu-toggle'))};
      }, {route,width}));
    }
    for (const route of ['doctor-detail.html', 'advisor-detail.html']) {
      await page.goto(base + route, { waitUntil:'domcontentloaded' });
      await page.locator('.detail-nav .detail-logo').waitFor();
      results.push(await page.evaluate(({route,width}) => {
        const box = element => { const r=element.getBoundingClientRect(); return {x:Math.round(r.x*10)/10,y:Math.round(r.y*10)/10,width:Math.round(r.width*10)/10,height:Math.round(r.height*10)/10}; };
        return {route,width,header:box(document.querySelector('.detail-nav')),logo:box(document.querySelector('.detail-logo'))};
      }, {route,width}));
    }
    for (const stage of ['profile','activity','notifications','settings','empty-activities','intake1','intake-concern','intake-general','partner-idcard','partner-patient-info','partner-insurance','consultpay','payment']) {
      await page.goto(`${base}krane-b2c.html?demoStage=${stage}&fresh=1&entry=${stage.startsWith('partner') ? 'partner' : 'direct'}#${stage}`, {waitUntil:'domcontentloaded'});
      await page.locator('.screen.active').waitFor();
      results.push(await page.evaluate(({stage,width}) => {
        const box = element => { if (!element || getComputedStyle(element).display === 'none') return null; const r=element.getBoundingClientRect(); return {x:Math.round(r.x*10)/10,y:Math.round(r.y*10)/10,width:Math.round(r.width*10)/10,height:Math.round(r.height*10)/10}; };
        const screen=document.querySelector('.screen.active');
        const header=screen?.querySelector('.screen__top');
        const option=screen?.querySelector(stage==='partner-patient-info' ? '[data-partner-payment-choice-value="self-pay"]' : stage==='intake1' ? '.option' : '.__none__');
        const optionStyle=option && getComputedStyle(option);
        return {stage,width,active:screen?.id,header:box(header),padding:header && getComputedStyle(header).paddingLeft,logo:box(screen?.querySelector('.checkout-brandbar__logo,.ttl--lockup .intake-lockup,.profile-shell-nav__brand .brand-lockup')),links:box(screen?.querySelector('.profile-shell-nav__links')),actions:box(screen?.querySelector('.profile-shell-nav__actions')),bottom:box(screen?.querySelector('.bottomnav')),option:option && {box:box(option),border:optionStyle.borderWidth,radius:optionStyle.borderRadius,padding:optionStyle.padding,shadow:optionStyle.boxShadow,minHeight:optionStyle.minHeight}};
      }, {stage,width}));
      if (stage === 'partner-patient-info') {
        await page.locator('[data-partner-payment-choice-value="self-pay"]').click();
        if (await page.locator('[data-partner-payment-choice-value="self-pay"]').getAttribute('aria-selected') !== 'true'
          || await page.locator('[data-partner-payment-choice-value="insurance"]').getAttribute('aria-selected') !== 'false') {
          throw new Error(`${width}px partner payment choice failed to select self-pay`);
        }
      }
      if (screenshotDir && [390,1440].includes(width) && ['profile','notifications','intake-concern','partner-idcard','partner-patient-info','payment'].includes(stage)) {
        await page.waitForTimeout(450);
        await page.screenshot({path:join(screenshotDir,`${stage}-${width}.png`)});
      }
    }
    await page.close();
  }
  const failures = [];
  const publicRoutes = new Set(['krane-b2c-landing.html','condition-detail.html?condition=weight','doctors.html','glp1-safety.html']);
  const detailRoutes = new Set(['doctor-detail.html','advisor-detail.html']);
  const brandedStages = new Set(['intake1','intake-concern','intake-general','partner-idcard','partner-patient-info','partner-insurance','consultpay','payment']);
  const navStages = new Set(['profile','activity','notifications','settings','empty-activities']);
  const same = (a,b) => Math.abs(a-b) <= .2;
  for (const width of [320, 360, 390, 768, 1100, 1440]) {
    const at = results.filter(row => row.width === width);
    const reference = at.find(row => row.route === 'krane-b2c-landing.html');
    const refLogo = reference.logo;
    const refInset = refLogo.x - reference.header.x;
    const navReference = at.find(row => row.stage === 'profile');
    const intakeOption = at.find(row => row.stage === 'intake1')?.option;
    const partnerOption = at.find(row => row.stage === 'partner-patient-info')?.option;
    if (!intakeOption || !partnerOption) {
      failures.push(`${width}px partner payment: intake option or partner option missing`);
    } else {
      for (const property of ['border','radius','padding','shadow','minHeight']) {
        if (partnerOption[property] !== intakeOption[property]) failures.push(`${width}px partner payment: ${property} differs from intake`);
      }
      if (partnerOption.shadow !== 'none') failures.push(`${width}px partner payment: option still has a card shadow`);
    }
    for (const row of at) {
      const name = row.route || row.stage;
      if (publicRoutes.has(row.route) || detailRoutes.has(row.route) || brandedStages.has(row.stage) || row.stage === 'profile') {
        if (!row.logo || !same(row.logo.width,refLogo.width) || !same(row.logo.height,refLogo.height)) {
          failures.push(`${width}px ${name}: logo size differs from shared ${refLogo.width}×${refLogo.height}`);
        }
        if (!row.header || !same(row.header.height,reference.header.height)) {
          failures.push(`${width}px ${name}: header height differs from ${reference.header.height}`);
        }
      }
      if (publicRoutes.has(row.route) || row.stage === 'profile') {
        if (!same(row.logo.x-row.header.x,refInset)) failures.push(`${width}px ${name}: logo left inset differs from ${refInset}`);
      }
      if (brandedStages.has(row.stage) && !same(row.logo.x + row.logo.width/2,row.header.x + row.header.width/2)) {
        failures.push(`${width}px ${name}: flow logo is not centred`);
      }
      if (navStages.has(row.stage)) {
        if (!row.bottom || JSON.stringify(row.bottom) !== JSON.stringify(navReference.bottom)) {
          failures.push(`${width}px ${name}: bottom navigation box differs`);
        }
        if (!same(row.header.height,reference.header.height)) failures.push(`${width}px ${name}: hub app bar height differs`);
      }
    }
    if (navReference.logo.x + navReference.logo.width > navReference.actions.x) {
      failures.push(`${width}px profile: logo overlaps header actions`);
    }
    if (!same(navReference.header.x,navReference.bottom.x) || !same(navReference.header.width,navReference.bottom.width)) {
      failures.push(`${width}px profile: top and bottom navigation shells do not align`);
    }
  }
  if (process.argv.includes('--json')) console.log(JSON.stringify(results,null,2));
  console.log(`Chrome QA: ${failures.length ? failures.length + ' failure(s)' : 'passed'} across ${results.length} page/viewport cases`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
