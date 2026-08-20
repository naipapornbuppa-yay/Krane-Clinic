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
    if (flow.seed) {
      await page.addInitScript(([key, seed]) => {
        try { sessionStorage.setItem(key, JSON.stringify(seed)); } catch { /* private mode */ }
      }, ['krane-p01-flow-state-v1', flow.seed]);
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
       is still Thai in English mode is named here. */
    if (rule.noThaiInEnglish) {
      const strings = await page.evaluate(() => {
        const THAI = /[ก-฾เ-๛]/;
        const found = new Set();
        /* Dialogs are hidden until something opens them, so a leak inside one
           survived this check twice. They are revealed for the walk and put
           back exactly as they were. */
        const reopened = [...document.querySelectorAll('.modal-layer[hidden]')];
        reopened.forEach(m => { m.hidden = false; });
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
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
