import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const b2c = path.join(root, "public/b2c");

function screenFragment(html, id) {
  const start = html.indexOf(`<section class="screen" id="${id}"`);
  const next = html.indexOf('<section class="screen', start + 1);
  return html.slice(start, next < 0 ? undefined : next);
}

test("every B2C state uses its intended editorial scene", async () => {
  const html = await readFile(path.join(b2c, "krane-b2c.html"), "utf8");
  const expected = {
    ineligible: "krane-state-in-person",
    matching: "krane-state-doctor-matching",
    noslots: "krane-state-no-slots",
    "consultpay-fail": "krane-state-consult-payment-failed",
    waitroom: "krane-state-waiting-room",
    "rx-writing": "krane-state-treatment-plan",
    "delivery-quote": "krane-state-delivery-quote",
    "pharmacy-search": "krane-state-pharmacy-search",
    "payment-success": "krane-state-payment-success",
    payfail: "krane-state-payment-failed",
    pharmacypending: "krane-state-medicine-preparing",
    pharmacyaccepted: "krane-state-pharmacy-confirmed",
    pharmacyissue: "krane-state-delivery-unavailable",
    confirm: "krane-state-order-confirmed",
    feedbackdone: "krane-state-feedback",
    "empty-activities": "krane-state-empty-activities",
    "empty-history": "krane-state-empty-history",
  };

  assert.match(html, /state-illustrations\.css\?v=20260814-editorial-hairline-v7/);
  assert.match(html, /\.state-view__visual:has\(\.krane-state-art\)\{[\s\S]*width:min\(70vw,365px\)!important/);
  assert.match(html, /@media\(max-width:600px\)\{\.state-view__visual:has\(\.krane-state-art\)\{width:min\(75vw,332px\)!important\}\}/);
  for (const [screen, symbol] of Object.entries(expected)) {
    assert.match(screenFragment(html, screen), new RegExp(`href="#${symbol}"`), `${screen} must use ${symbol}`);
    assert.equal((html.match(new RegExp(`<symbol id="${symbol}"`, "g")) || []).length, 1, `${symbol} must be defined once`);
  }
  assert.match(screenFragment(html, "preloader"), /assets\/state-editorial-v5-ink\/loading-info-flipbook-v1\.webp\?v=20260815-ink-crane-motion-v1/, "preloader must use the active monochrome ink crane flipbook on mobile");
  assert.match(screenFragment(html, "preloader"), /media="\(prefers-reduced-motion: reduce\)"[^>]*loading-info\.png\?v=20260815-ink-crane-motion-v1/, "preloader must preserve a static reduced-motion fallback");
  assert.match(html, /--state-editorial-canvas:#f3f0e6/, "state screens must use the warm cream editorial canvas");
  assert.equal((html.match(/<symbol id="krane-state-loading-info"/g) || []).length, 1, "the gallery loader symbol must be defined once");
  assert.notEqual(expected["delivery-quote"], expected["pharmacy-search"]);
  assert.notEqual(expected["consultpay-fail"], expected.payfail);
  assert.notEqual(expected["empty-activities"], expected["empty-history"]);
});

test("the live app uses Set B while the Set A gallery stays independently archived", async () => {
  const html = await readFile(path.join(b2c, "krane-b2c.html"), "utf8");
  const css = await readFile(path.join(b2c, "state-illustrations.css"), "utf8");
  const gallery = await readFile(path.join(b2c, "state-illustrations.html"), "utf8");
  const defs = html.match(/<svg class="krane-state-defs"[\s\S]*?<\/svg>/)?.[0] || "";
  const states = [
    "loading-info", "doctor-matching", "nurse-ready", "no-slots", "waiting-room",
    "treatment-plan", "delivery-quote", "pharmacy-search", "medicine-preparing",
    "pharmacy-confirmed", "delivery-unavailable", "consult-payment-failed",
    "payment-failed", "payment-success", "order-confirmed", "in-person", "feedback",
    "empty-activities", "empty-history"
  ];
  const roleAligned = new Set(["doctor-matching", "waiting-room", "treatment-plan", "in-person", "feedback"]);
  for (const id of states) {
    const symbol = defs.match(new RegExp(`<symbol id="krane-state-${id}"[\\s\\S]*?<\\/symbol>`))?.[0] || "";
    const assetName = roleAligned.has(id) ? `${id}-roles-v1` : id;
    const href = `assets/state-editorial-v5-ink/${assetName}.png`;
    if (id === "loading-info") {
      assert.match(symbol, /loading-info-flipbook-v1\.webp\?v=20260815-ink-crane-motion-v1/, "loading info must use the animated Set B flipbook");
      assert.match(symbol, /loading-info\.png\?v=20260815-ink-crane-motion-v1/, "loading info must retain a static reduced-motion frame");
    } else {
      const cacheKey = roleAligned.has(id) ? "20260815-role-alignment-v1" : id === "payment-success" ? "20260815-clean-payment-v1" : "20260815-active-ink-v1";
      assert.match(symbol, new RegExp(`<image href="${href.replaceAll("/", "\\/")}\\?v=${cacheKey}"`), `${id} must use its Set B ink scene`);
    }
    const asset = await readFile(path.join(b2c, href));
    assert.equal(asset.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(asset.readUInt32BE(16), 1080);
    assert.equal(asset.readUInt32BE(20), 720);
    assert.equal(asset[25], 6, `${href} must preserve RGBA for seamless placement`);
  }
  const activeHrefs = [...defs.matchAll(/<image href="(assets\/state-editorial-v5-ink\/[^"]+\.png)\?v=20260815-[^"]+"/g)].map((match) => match[1]);
  assert.equal(activeHrefs.length, 20, "the sprite must include 19 states plus the backwards-compatible empty alias");
  assert.equal(new Set(activeHrefs).size, 19, "every active state must have one distinct Set B asset");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css, /filter:\s*drop-shadow|url\(/, "illustrations should stay crisp and lightweight");
  assert.equal((gallery.match(/<article>/g) || []).length, 19, "Set A must retain every archived state");
  assert.match(gallery, /Set A · Archived option/);
  assert.equal((gallery.match(/assets\/state-editorial-v3-simple\//g) || []).length, 5, "Set A must retain its five character scenes");
  assert.equal((gallery.match(/assets\/state-editorial-v4-objects\//g) || []).length, 13, "Set A must retain its thirteen object scenes");
  assert.match(gallery, /assets\/loading-v5\/paper-crane-flight-v5\.svg/);
  assert.match(gallery, /assets\/loading-v5\/paper-crane-final-v5\.svg/);
  assert.doesNotMatch(gallery, /state-editorial-v5-ink/, "Set A must never inherit active Set B assets");
  assert.doesNotMatch(gallery, /fetch\('krane-b2c\.html/, "Set A must not fetch the live app sprite");
  assert.match(gallery, /href="state-illustrations-ink\.html"/);
  assert.match(gallery, /get\("archive"\) !== "set-a"/, "the legacy URL should open the current Set B by default");
  assert.match(gallery, /location\.replace\(`state-illustrations-ink\.html/, "the legacy URL should redirect to the active gallery");
});
