#!/usr/bin/env node
/*
 * Regression lock for the Krane B2C prototype.
 *
 * Reads b2c/ui-contract.json and asserts every screen, component, flow and rule
 * in it against the real page in a real browser. Exits non-zero with a list of
 * what is missing. This exists because agreed work has silently disappeared
 * between releases (CSAT, the category grid, the receipt buttons) and the
 * client found it before we did.
 *
 *   node b2c/tools/contract-check.mjs               # serves the repo itself
 *   node b2c/tools/contract-check.mjs --base <url>  # check a running server
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname, normalize } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const contract = JSON.parse(await readFile(join(repoRoot, 'b2c/ui-contract.json'), 'utf8'));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

const argBase = process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : null;
let server = null;
let base = argBase;
if (!base) {
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const file = join(repoRoot, path);
    try {
      const info = await stat(file);
      if (info.isDirectory()) throw new Error('dir');
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  base = `http://127.0.0.1:${server.address().port}`;
}

const failures = [];
const fail = (area, detail) => failures.push(`${area}: ${detail}`);
let checks = 0;
const did = () => { checks += 1; };

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox']
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const consoleErrors = [];
ctx.on('page', page => page.on('pageerror', e => consoleErrors.push(String(e))));

const app = await ctx.newPage();
await app.goto(`${base}/b2c/krane-b2c.html`, { waitUntil: 'domcontentloaded' });
await app.waitForTimeout(1800);

/* ---- screens -------------------------------------------------------------- */
const presentScreens = await app.evaluate(() =>
  [...document.querySelectorAll('section.screen[id]')].map(s => s.id));
for (const id of contract.screens) {
  did();
  if (!presentScreens.includes(id)) fail('screen missing', `#${id}`);
}

/* ---- reviewer Screen Tab --------------------------------------------------
   The left rail is the reviewer's map of the implementation. Every real
   screen belongs there exactly once. Journey groups stay an accordion — one
   open at a time — but inside a group there is no second accordion: opening
   it shows the error and edge-case screens with the default ones
   (client, 5 Oct). */
const railAudit = await app.evaluate(() => {
  const screens = [...document.querySelectorAll('section.screen[id]')].map(screen => screen.id);
  const links = [...document.querySelectorAll('#prototype-rail a[data-go]')].map(link => link.dataset.go);
  const groups = [...document.querySelectorAll('#prototype-rail > .rail-group')];
  return {
    missing:screens.filter(id => !links.includes(id)),
    stale:links.filter(id => !screens.includes(id)),
    duplicates:links.filter((id, index) => links.indexOf(id) !== index),
    groups:groups.length,
    openGroups:groups.filter(group => group.open).length,
    nestedBuckets:groups.filter(group => group.querySelector(':scope > .rail-group__body > .rail-page')).length
  };
});
did();
if (railAudit.missing.length || railAudit.stale.length || railAudit.duplicates.length) {
  fail('Screen Tab coverage', JSON.stringify(railAudit));
}
did();
if (railAudit.openGroups !== 1 || railAudit.nestedBuckets) {
  fail('Screen Tab group accordion, flat inside', JSON.stringify(railAudit));
}

/* The partner group lists only its unique views. Shared intake and care views
   already appear in their primary groups, and the start link begins the full
   sequence shown in the partner reference video. */
const partnerRail = await app.evaluate(() => {
  const group = [...document.querySelectorAll('#prototype-rail > .rail-group')]
    .find(item => item.querySelector('.rail-step')?.textContent === '09');
  return group ? [...group.querySelectorAll('a[data-go]')].map(link => link.dataset.go) : [];
});
did();
if (JSON.stringify(partnerRail) !== JSON.stringify(['partner-idcard','partner-patient-info','partner-insurance','partner-phr'])) {
  fail('partner Screen Tab order', JSON.stringify(partnerRail));
}
did();
const partnerStartLink = await app.evaluate(() => {
  const group = [...document.querySelectorAll('#prototype-rail > .rail-group')]
    .find(item => item.querySelector('.rail-step')?.textContent === '09');
  return group?.querySelector('a.is-key-route[href*="entry=partner"]')?.getAttribute('href') || '';
});
if (!partnerStartLink.includes('fresh=1#consent-terms')) fail('partner start link', partnerStartLink || 'missing');
const completePartnerIdentity = async page => {
  await page.locator('#partner-first-name').fill('ณัฐ');
  await page.locator('#partner-last-name').fill('ตัวอย่าง');
  await page.locator('#partner-phone').fill('0812345678');
  await page.locator('#partner-patient-info [data-phone-edit]').click();
  await page.locator('#otp.active [data-otp-code]').fill('123456');
  await page.locator('#otp.active [data-auth-complete]').click();
  await page.locator('#partner-patient-info.active').waitFor();
  await page.locator('#partner-patient-info [data-partner-info-continue]').click();
};
const freshPartnerHealth = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
try {
  const blankHealth = await freshPartnerHealth.newPage();
  await blankHealth.goto(`${base}/b2c/krane-b2c.html?entry=partner&demoStage=intake-general#intake-general`, { waitUntil: 'domcontentloaded' });
  const empty = await blankHealth.locator('#intake-general').evaluate(screen => ({
    values:['intake-sex','intake-dob','intake-height','intake-weight'].map(id => screen.querySelector(`#${id}`)?.value),
    datePrompt:screen.querySelector('#intake-dob')?.closest('.date-control')?.querySelector('.date-control__value')?.textContent.trim()
  }));
  did();
  if (JSON.stringify(empty.values) !== JSON.stringify(['','','','']) || !empty.datePrompt?.includes('วว')) {
    fail('partner health empty state', JSON.stringify(empty));
  }
} finally {
  await freshPartnerHealth.close();
}
const legacyPartner = await ctx.newPage();
try {
  await legacyPartner.goto(`${base}/b2c/krane-b2c-paper-crane-preview.html#partner-idcard`, { waitUntil: 'domcontentloaded' });
  await legacyPartner.waitForURL(url => url.pathname.endsWith('/krane-b2c.html') && url.searchParams.get('screens') === '1');
  await legacyPartner.waitForTimeout(800);
  did();
  const first = await legacyPartner.evaluate(() => document.querySelector('.screen.active')?.id);
  if (first !== 'partner-idcard') fail('partner preview handoff', `expected partner-idcard, got ${first}`);
  await legacyPartner.locator('#partner-idcard [data-idcard-skip]').click();
  await legacyPartner.waitForTimeout(800);
  did();
  const next = await legacyPartner.evaluate(() => document.querySelector('.screen.active')?.id);
  if (next !== 'partner-patient-info') fail('partner ID-card flow', `expected partner-patient-info, got ${next}`);
  const blankIdentity = await legacyPartner.locator('#partner-patient-info').evaluate(screen =>
    ['partner-first-name','partner-last-name','partner-phone'].map(id => screen.querySelector(`#${id}`)?.value));
  did();
  if (JSON.stringify(blankIdentity) !== JSON.stringify(['','',''])) fail('partner identity empty state', JSON.stringify(blankIdentity));
  await completePartnerIdentity(legacyPartner);
  await legacyPartner.waitForTimeout(800);
  did();
  const coverage = await legacyPartner.evaluate(() => document.querySelector('.screen.active')?.id);
  if (coverage !== 'insurance') fail('partner patient flow', `expected insurance, got ${coverage}`);
} catch (error) {
  fail('partner preview handoff', error.message);
} finally {
  await legacyPartner.close();
}

/* The partner handoff must use the shared intake views but preserve the
   reference order and questions, then continue directly to doctor matching. */
// The waiting room persists an in-progress queue. Keep this end-to-end patient
// journey in its own browser storage so later independent flow checks start fresh.
const partnerCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const partnerJourney = await partnerCtx.newPage();
try {
  const active = () => partnerJourney.locator('.screen.active').getAttribute('id');
  const step = async (label, expected) => {
    did();
    const actual = await active();
    if (actual !== expected) fail('partner journey', `${label}: expected ${expected}, got ${actual}`);
  };
  await partnerJourney.goto(`${base}/b2c/krane-b2c.html?entry=partner`, { waitUntil: 'domcontentloaded' });
  await step('entry', 'consent-terms');
  await partnerJourney.locator('[data-consent-auto-scroll]').click();
  await partnerJourney.locator('[data-consent-continue]').click();
  await step('consent', 'partner-idcard');
  await partnerJourney.locator('[data-idcard-skip]').click();
  await step('ID card', 'partner-patient-info');
  await completePartnerIdentity(partnerJourney);
  await step('patient details', 'insurance');
  await partnerJourney.locator('#insurance-id').fill('1234567890123');
  await partnerJourney.locator('#insurance-dob').fill('1997-09-01');
  await partnerJourney.locator('#insurance [data-insurance-confirm]').click();
  await step('eligibility check', 'partner-insurance');
  await partnerJourney.locator('#partner-insurance [data-partner-payment="insurance"]').click();
  await step('covered plan', 'intake-concern');
  did();
  const reliefChoices = await partnerJourney.locator('#intake-concern [data-partner-relief-value]').evaluateAll(options => ({
    count:options.length,
    compact:options.every(option => !option.classList.contains('option') && !option.querySelector('.opt-check')),
    columns:options[0] ? getComputedStyle(options[0].parentElement).gridTemplateColumns.split(' ').length : 0,
    surface:options[0] ? getComputedStyle(options[0]).backgroundColor : null
  }));
  if (reliefChoices.count !== 4 || !reliefChoices.compact || reliefChoices.columns !== 2 || reliefChoices.surface !== 'rgb(255, 255, 255)') {
    fail('partner relief component', JSON.stringify(reliefChoices));
  }
  await partnerJourney.locator('#partner-concern-text').fill('มีผื่นคันที่แขนและปวดศีรษะ');
  await partnerJourney.locator('#intake-concern [data-partner-relief-value="ยังไม่ได้ทำ"]').click();
  did();
  const selectedRelief = await partnerJourney.locator('#intake-concern [data-partner-relief-value][aria-selected="true"]').allTextContents();
  if (JSON.stringify(selectedRelief.map(text => text.trim())) !== JSON.stringify(['ยังไม่ได้ทำ'])) {
    fail('partner relief selection', JSON.stringify(selectedRelief));
  }
  await partnerJourney.locator('#intake-concern [data-intake-complete]').click();
  await step('symptom answers', 'intake-general');
  did();
  if (await partnerJourney.locator('[data-direct-health-lifestyle]').isVisible()) {
    fail('partner questions', 'direct-only lifestyle questions are visible');
  }
  const healthPrefill = await partnerJourney.locator('#intake-general').evaluate(screen =>
    ['intake-sex','intake-dob','intake-height','intake-weight'].map(id => screen.querySelector(`#${id}`)?.value));
  did();
  if (JSON.stringify(healthPrefill) !== JSON.stringify(['','1997-09-01','',''])) {
    fail('partner DOB prefill', JSON.stringify(healthPrefill));
  }
  await partnerJourney.locator('#intake-sex').selectOption('female');
  await partnerJourney.locator('#intake-height').fill('175');
  await partnerJourney.locator('#intake-weight').fill('70');
  await partnerJourney.locator('#intake-general [data-intake-complete]').click();
  did();
  const safety = await partnerJourney.locator('#health-history-modal').evaluate(modal => ({
    visible: !modal.hidden,
    title: modal.querySelector('h2')?.textContent.trim(),
    questions: [...modal.querySelectorAll('fieldset legend')].map(legend => legend.textContent.trim())
  }));
  if (!safety.visible || safety.title !== 'ยืนยันข้อมูลความปลอดภัย'
      || JSON.stringify(safety.questions) !== JSON.stringify(['โรคประจำตัว','ยาที่ใช้ประจำ','ประวัติแพ้ยา'])) {
    fail('partner questions', JSON.stringify(safety));
  }
  await partnerJourney.locator('[data-health-history-confirm]').click();
  await step('safety answers', 'matching');
  await partnerJourney.waitForSelector('#consultpay.active', { timeout: 12000 });
  await step('doctor and fee details', 'consultpay');
  did();
  const coveredFee = await partnerJourney.locator('#consultpay').evaluate(screen => ({
    mode:screen.dataset.checkoutMode,
    coverage:screen.querySelector('[data-consult-coverage-amount]')?.textContent.trim(),
    action:screen.querySelector('[data-consultpay-label]')?.textContent.trim()
  }));
  if (coveredFee.coverage !== 'ครอบคลุมเต็มจำนวน' || coveredFee.action !== 'รับทราบและไปต่อ') {
    fail('partner fee review', JSON.stringify(coveredFee));
  }
  await partnerJourney.locator('#consultpay [data-consultpay-go]').click();
  await step('covered fee acknowledgement', 'waitroom');
} catch (error) {
  fail('partner journey', error.message);
} finally {
  await partnerCtx.close();
}

/* ---- components ----------------------------------------------------------- */
for (const item of contract.components) {
  did();
  const count = await app.evaluate(sel => document.querySelectorAll(sel).length, item.selector);
  const need = item.minCount || 1;
  if (count < need) fail('component missing', `${item.selector} (found ${count}, need ${need}) — ${item.why}`);
}

/* ---- flows ---------------------------------------------------------------- */
async function check(page, flow, assertion) {
  if (assertion.activeScreen) {
    const active = await page.evaluate(() => document.querySelector('.screen.active')?.id);
    if (active !== assertion.activeScreen) fail('flow', `${flow.name}: expected ${assertion.activeScreen}, got ${active}`);
  }
  // Screen-scoped: every screen keeps its own pagination state, so a global
  // count would see one visible question per set-up screen.
  if (assertion.countAtLeast) {
    const [sel, n] = assertion.countAtLeast;
    const found = await page.evaluate(s => (document.querySelector('.screen.active') || document).querySelectorAll(s).length, sel);
    if (found < n) fail('flow', `${flow.name}: ${sel} found ${found}, need ${n}`);
  }
  if (assertion.visibleOnly) {
    const shown = await page.evaluate(s => [...(document.querySelector('.screen.active') || document).querySelectorAll(s)].filter(e => !e.hidden).length, assertion.visibleOnly);
    if (shown !== 1) fail('flow', `${flow.name}: ${assertion.visibleOnly} shows ${shown} at once, expected 1`);
  }
  if (assertion.visible) {
    const shown = await page.evaluate(s => {
      const el = document.querySelector(s);
      return Boolean(el && !el.hidden && el.getBoundingClientRect().height > 0);
    }, assertion.visible);
    if (!shown) fail('flow', `${flow.name}: ${assertion.visible} is not visible`);
  }
}

for (const flow of contract.flows) {
  did();
  const page = await ctx.newPage();
  try {
    /* Seeded flow state, so a deep link lands where the flow really is instead
       of being bounced back to the questionnaire by the route guard. The seed
       merges over the app's defaults, exactly like a resumed session. */
    /* Every flow shares one browser context, so whatever a flow leaves in
       storage is the next flow's starting state. "Confirming receipt asks for
       the review" clicks the confirm button, which writes the order to
       Delivered — and the flow after it then opened tracking on an order that
       was already confirmed and reported the confirm button missing. It was not
       missing; it was correctly gone. Each flow starts from a clean demo order
       now, so a flow's result depends only on itself. */
    await page.addInitScript(key => {
      try { sessionStorage.removeItem(key); localStorage.removeItem(key); } catch { /* private mode */ }
    }, 'krane-golden-demo-state-v1');
    if (flow.seed) {
      await page.addInitScript(([key, seed]) => {
        try { sessionStorage.setItem(key, JSON.stringify(seed)); } catch { /* private mode */ }
      }, ['krane-p01-flow-state-v1', flow.seed]);
    }
    if (flow.authSeed) {
      await page.addInitScript(([key, seed]) => {
        try { sessionStorage.setItem(key, JSON.stringify(seed)); } catch { /* private mode */ }
      }, ['krane-auth-profile-v1', flow.authSeed]);
    }
    await page.goto(`${base}/b2c/krane-b2c.html${flow.enter}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(flow.waitBefore || 1600);
    for (const assertion of flow.assertBeforeClick || []) await check(page, flow, assertion);
    if (flow.click) {
      await page.evaluate(sel => {
        const scope = document.querySelector('.screen.active') || document;
        (scope.querySelector(sel) || document.querySelector(sel))?.click();
      }, flow.click);
      await page.waitForTimeout(700);
    }
    for (const step of flow.steps || []) {
      if (step.click) {
        await page.evaluate(sel => {
          const scope = document.querySelector('.screen.active') || document;
          (scope.querySelector(sel) || document.querySelector(sel))?.click();
        }, step.click);
      }
      await page.waitForTimeout(step.waitAfter || 700);
      for (const assertion of step.assert || []) await check(page, flow, assertion);
    }
    for (const assertion of flow.assert) await check(page, flow, assertion);
  } catch (error) {
    fail('flow', `${flow.name}: ${error.message}`);
  }
  await page.close();
}

/* ---- rules ---------------------------------------------------------------- */
for (const rule of contract.rules) {
  did();
  const page = await ctx.newPage();
  try {
    await page.goto(`${base}/b2c/${rule.page}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    if (rule.openDrawer) {
      await page.evaluate(() => document.querySelector('[data-menu-open]')?.click());
      await page.waitForTimeout(500);
    }
    if (rule.fillsParent) {
      const [sel, ratio] = rule.fillsParent;
      const measured = await page.evaluate(s => {
        const el = document.querySelector(s);
        if (!el) return null;
        return [el.getBoundingClientRect().width, el.parentElement.getBoundingClientRect().width];
      }, sel);
      if (!measured) fail('rule', `${rule.name}: ${sel} not found`);
      else if (measured[0] < measured[1] * ratio) {
        fail('rule', `${rule.name}: ${sel} is ${Math.round(measured[0])}px inside ${Math.round(measured[1])}px`);
      }
    }
    if (rule.absent) {
      const found = await page.evaluate(s => document.querySelectorAll(s).length, rule.absent);
      if (found) fail('rule', `${rule.name}: ${found} × "${rule.absent}" still on the page`);
    }
    if (rule.count) {
      const [sel, n] = rule.count;
      const found = await page.evaluate(s => document.querySelectorAll(s).length, sel);
      if (found !== n) fail('rule', `${rule.name}: ${sel} found ${found}, expected ${n}`);
    }
    if (rule.maxHeight) {
      const [sel, max] = rule.maxHeight;
      const height = await page.evaluate(s => {
        const el = document.querySelector(s);
        return el ? el.getBoundingClientRect().height : 0;
      }, sel);
      if (height > max) fail('rule', `${rule.name}: ${sel} is ${Math.round(height)}px tall unfocused, max ${max}`);
    }
    /* A component moved onto Material 3 is pinned to the spec's own numbers, so
       it cannot drift back to the house style by accident (client, 20 Aug). */
    if (rule.box) {
      const [sel, want] = rule.box;
      const got = await page.evaluate(s => {
        const el = document.querySelector(s);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { width: Math.round(b.width), height: Math.round(b.height) };
      }, sel);
      if (!got) fail('rule', `${rule.name}: ${sel} not found`);
      else {
        for (const key of Object.keys(want)) {
          if (Math.abs(got[key] - want[key]) > 1) {
            fail('rule', `${rule.name}: ${sel} ${key} is ${got[key]}px, spec says ${want[key]}px`);
          }
        }
      }
    }
    if (rule.containedImage) {
      const [imageSelector, frameSelector] = rule.containedImage;
      const got = await page.evaluate(([imageSel, frameSel]) => {
        const image = document.querySelector(imageSel);
        const frame = document.querySelector(frameSel);
        if (!image || !frame) return null;
        const art = image.getBoundingClientRect();
        const card = frame.getBoundingClientRect();
        return {
          fit:getComputedStyle(image).objectFit,
          inside:art.left >= card.left - 1 && art.top >= card.top - 1 &&
            art.right <= card.right + 1 && art.bottom <= card.bottom + 1
        };
      }, [imageSelector, frameSelector]);
      if (!got) fail('rule', `${rule.name}: image or frame not found`);
      else if (got.fit !== 'contain' || !got.inside) {
        fail('rule', `${rule.name}: expected contained artwork inside its card, got object-fit=${got.fit}, inside=${got.inside}`);
      }
    }
    /* Checkout reads in the order a delivery app puts it — where it goes, what
       is in it, how it is paid, then the bill (client, 20 Aug: "ทำลอก grab
       มาเลย"). Sections are easy to reshuffle by accident, so the sequence is
       asserted by document position rather than trusted. */
    if (rule.order) {
      const [scope, wanted] = rule.order;
      const got = await page.evaluate(([s, list]) => {
        const root = document.querySelector(s);
        if (!root) return null;
        return list.map(sel => {
          const el = root.querySelector(sel);
          if (!el) return -1;
          return [...root.querySelectorAll('*')].indexOf(el);
        });
      }, [scope, wanted]);
      if (!got) fail('rule', `${rule.name}: ${scope} not found`);
      else {
        const missing = wanted.filter((_, i) => got[i] < 0);
        if (missing.length) fail('rule', `${rule.name}: missing ${missing.join(', ')}`);
        else for (let i = 1; i < got.length; i += 1) {
          if (got[i] < got[i - 1]) fail('rule', `${rule.name}: ${wanted[i]} comes before ${wanted[i - 1]}`);
        }
      }
    }
    if (rule.noPillButtons) {
      const pills = await page.evaluate(() => [...document.querySelectorAll('.btn')]
        .filter(button => {
          const box = button.getBoundingClientRect();
          if (box.height < 8) return false;
          const radius = parseFloat(getComputedStyle(button).borderTopLeftRadius) || 0;
          return radius >= box.height / 2 - 0.5;
        })
        .map(button => button.textContent.trim().slice(0, 24)));
      if (pills.length) fail('rule', `${rule.name}: pill-shaped actions — ${pills.join(', ')}`);
    }
    /* English has to mean English. Thai written straight into the markup has no
       English source to fall back to, so it used to survive the toggle and left
       most of a page in Thai (client audit, 19 Aug). Every visible string that
       is still Thai in English mode is named here.

       Only one screen is on show at a time, so checking what is visible checked
       one screen out of seventy and let 73 untranslated strings pile up behind
       it (found 31 Aug). Every screen is activated in turn now, the same way
       hidden dialogs are revealed, and put back afterwards. */
    if (rule.noThaiInEnglish) {
      const strings = await page.evaluate(async () => {
        const THAI = /[ก-฾เ-๛]/;
        const found = new Set();
        const settle = () => new Promise(resolve => setTimeout(resolve, 60));

        const reopened = [...document.querySelectorAll('.modal-layer[hidden]')];
        reopened.forEach(m => { m.hidden = false; });

        const collect = root => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.nodeName)) return NodeFilter.FILTER_REJECT;
              if (!parent.getClientRects().length) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            }
          });
          let node;
          while ((node = walker.nextNode())) {
            const text = node.nodeValue.trim().replace(/\s+/g, ' ');
            if (text && THAI.test(text)) found.add(text);
          }
          /* A placeholder or a label is read out loud even though it is not a
             text node, so those carry Thai just as visibly. */
          root.querySelectorAll('[placeholder], [aria-label]').forEach(el => {
            [el.getAttribute('placeholder'), el.getAttribute('aria-label')].forEach(value => {
              const text = (value || '').trim().replace(/\s+/g, ' ');
              if (text && THAI.test(text)) found.add(text);
            });
          });
        };

        collect(document.body);

        const screens = [...document.querySelectorAll('section.screen')];
        const wasActive = screens.filter(s => s.classList.contains('active'));
        for (const screen of screens) {
          screens.forEach(other => other.classList.remove('active'));
          screen.classList.add('active');
          await settle();
          collect(screen);
        }
        screens.forEach(s => s.classList.remove('active'));
        wasActive.forEach(s => s.classList.add('active'));

        reopened.forEach(m => { m.hidden = true; });
        return [...found].slice(0, 8);
      });
      if (strings.length) fail('rule', `${rule.name}: still Thai in English — ${strings.map(s => `"${s.slice(0, 40)}"`).join(', ')}`);
    }
  } catch (error) {
    fail('rule', `${rule.name}: ${error.message}`);
  }
  await page.close();
}

if (consoleErrors.length) consoleErrors.forEach(error => fail('page error', error));

await browser.close();
if (server) server.close();

if (failures.length) {
  console.error(`\nUI contract: ${failures.length} failure(s) out of ${checks} checks\n`);
  failures.forEach(line => console.error('  ✗ ' + line));
  console.error('\nIf a removal was deliberate, take it out of b2c/ui-contract.json in the same commit and say why.\n');
  process.exit(1);
}
console.log(`UI contract: all ${checks} checks passed (${contract.screens.length} screens, ${contract.components.length} components, ${contract.flows.length} flows, ${contract.rules.length} rules)`);
