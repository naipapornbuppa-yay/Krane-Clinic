/* Run in the approved GitHub browser CI, not an ad-hoc local browser. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import assert from 'node:assert/strict';
import { necessaryConsent } from './consent-test-fixture.mjs';
const root = resolve(import.meta.dirname, '../..');
const out = process.env.QA_OUTPUT || '/tmp/krane-weight-story-qa';
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const file = join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!(await stat(file)).isFile()) throw Error();
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = (process.env.KRANE_BASE || `http://127.0.0.1:${server.address().port}`).replace(/\/$/, '');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
let checks = 0;
const check = (value, label) => { assert(value, label); checks++; };
try {
  for (const width of [390, 800, 1024, 1440]) for (const lang of ['th', 'en']) {
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await necessaryConsent(ctx);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/b2c/krane-b2c-landing.html?lang=${lang}`, { waitUntil: 'domcontentloaded' });
    const section = page.locator('#weight-program'), frame = section.locator('.weight-story-frame');
    await frame.locator('[data-weight-next]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await frame.scrollIntoViewIfNeeded();
    check(await section.locator('[data-pc-video] video').count() === 3, 'All three original videos retained');
    check(await frame.locator('[data-weight-story]').count() === 2, 'Two original review cards');
    check(await section.locator('[data-rail-clone],.pc-story-rail').count() === 0, 'No clones or moving rail');
    const sources = await frame.locator('source').evaluateAll(nodes => nodes.map(node => node.getAttribute('src')));
    check(JSON.stringify(sources) === JSON.stringify(['assets/reviews/weight-04.mp4', 'assets/reviews/weight-05.mp4']), 'Exact supplied review sources');
    check(await frame.locator('[data-weight-story]:visible').count() === 1, 'Exactly one visible review');
    check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.paused && !video.autoplay && !video.loop)), 'Reduced motion begins static');
    const box = await frame.boundingBox();
    if (width >= 1100) {
      const tracking = await section.locator('.pc-tracking').boundingBox();
      check(tracking.width > box.width * 1.8 && tracking.x < box.x, 'Large tracking block left, compact story right');
      check(Math.abs(tracking.y - (await section.locator('.weight-stories').boundingBox()).y) < 2, 'Bottom panels share their top edge');
    }
    if (width < 1100) {
      const order = await section.evaluate(element => ['.pc-head', '.pc-main-media', '.pc-tracking', '.weight-stories', '.pc-goals', '.pc-legal'].map(selector => element.querySelector(selector).getBoundingClientRect().top));
      check(order.every((top, i) => i === 0 || top > order[i - 1]), 'Mobile/tablet narrative order ends with goals and disclaimer');
    }
    check(await frame.evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'Fixed frame has no horizontal rail');
    await frame.locator('[data-weight-next]').click();
    check(await frame.getAttribute('data-active-story') === '1', 'Next changes content within frame');
    check(await frame.locator('[data-weight-next]').isDisabled(), 'Last story does not wrap unexpectedly');
    check(await frame.locator('[data-weight-story]:visible source').getAttribute('src') === sources[1], 'Second original clip selected');
    check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.paused)), 'Reduced motion navigation stays static');
    const after = await frame.boundingBox();
    check(Math.abs(box.width - after.width) < 1 && Math.abs(box.height - after.height) < 1, 'No frame resize on story change');
    await frame.locator('[data-weight-prev]').click();
    check(await frame.getAttribute('data-active-story') === '0', 'Previous restores first review');
    await frame.locator('.weight-story-bars button').nth(1).click();
    check(await frame.getAttribute('data-active-story') === '1', 'Progress segment selects story');
    await page.keyboard.press('ArrowLeft');
    check(await frame.getAttribute('data-active-story') === '0', 'Keyboard navigation selects story');
    await frame.locator('[data-weight-story]:visible .pc-sound').click();
    check(await frame.locator('video').evaluateAll(videos => videos.every(video => !video.muted)), 'Sound preference shared across stories');
    await frame.locator('[data-weight-story]:visible .pc-sound').click();
    check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.muted)), 'Mute restores silent playback');
    check(await page.locator('dialog[open]').count() === 0, 'Navigation stays in frame, never opens modal');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
    if (lang === 'en') check(!/[ก-๛]/.test(await frame.locator('button').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')).join(' '))), 'English story controls');
    await section.screenshot({ path: `${out}/weight-story-${lang}-${width}.png`, style: '.site-header,.mobile-cta,.cd-stickybar{visibility:hidden!important}' });
    if (width === 1440 && lang === 'en') {
      await frame.scrollIntoViewIfNeeded();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => !document.querySelector('[data-weight-story]:not([hidden]) video').paused);
      await frame.locator('[data-weight-story]:visible .pc-play').click();
      check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.paused)), 'Manual pause works');
      await frame.locator('[data-weight-next]').click();
      check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.paused)), 'Pause survives navigation');
      await frame.locator('[data-weight-prev]').click();
      await frame.locator('[data-weight-story]:visible .pc-play').click();
      await page.waitForFunction(() => !document.querySelector('[data-weight-story]:not([hidden]) video').paused);
      await frame.locator('[data-weight-story]:visible video').evaluate(video => video.dispatchEvent(new Event('ended')));
      check(await frame.getAttribute('data-active-story') === '1', 'Playing story advances on ended');
      check(await frame.locator('[data-weight-story][hidden] video').evaluate(video => video.paused), 'Inactive video stays paused');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      check(await frame.locator('video').evaluateAll(videos => videos.every(video => video.paused)), 'Preference change stops playback');
    }
    check(errors.length === 0, `No page errors: ${errors.join('; ')}`);
    await ctx.close();
  }
  console.log(`PASS ${checks} weight story checks; screenshots: ${out}`);
} finally { await browser.close(); await new Promise(done => server.close(done)); }
