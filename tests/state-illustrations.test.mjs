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

  assert.match(html, /state-illustrations\.css\?v=20260812-moodboard-v2/);
  for (const [screen, symbol] of Object.entries(expected)) {
    assert.match(screenFragment(html, screen), new RegExp(`href="#${symbol}"`), `${screen} must use ${symbol}`);
    assert.equal((html.match(new RegExp(`<symbol id="${symbol}"`, "g")) || []).length, 1, `${symbol} must be defined once`);
  }
  assert.match(screenFragment(html, "preloader"), /assets\/loading-v5\/paper-crane-fold-v3\.svg/, "preloader must use the editorial rigid-fold vector animation directly on mobile");
  assert.equal((html.match(/<symbol id="krane-state-loading-info"/g) || []).length, 1, "the gallery loader symbol must be defined once");
  assert.notEqual(expected["delivery-quote"], expected["pharmacy-search"]);
  assert.notEqual(expected["consultpay-fail"], expected.payfail);
  assert.notEqual(expected["empty-activities"], expected["empty-history"]);
});

test("state art balances human care scenes with aligned object-only graphics", async () => {
  const html = await readFile(path.join(b2c, "krane-b2c.html"), "utf8");
  const css = await readFile(path.join(b2c, "state-illustrations.css"), "utf8");
  const gallery = await readFile(path.join(b2c, "state-illustrations.html"), "utf8");
  const defs = html.match(/<svg class="krane-state-defs"[\s\S]*?<\/svg>/)?.[0] || "";

  const editorialHrefs = [...defs.matchAll(/<image href="(assets\/state-editorial-v3-simple\/[^"]+\.png)"/g)].map((match) => match[1]);
  assert.equal(editorialHrefs.length, 5, "only relational care scenes should retain a person");
  assert.equal(new Set(editorialHrefs).size, 5, "relational care scenes should keep distinct character artwork");
  for (const href of new Set(editorialHrefs)) {
    const asset = await readFile(path.join(b2c, href));
    assert.ok([4, 6].includes(asset[25]), `${href} must preserve a transparent PNG channel`);
  }
  const objectOnlySymbols = [
    "consult-payment-failed", "payment-failed", "payment-success", "no-slots",
    "delivery-quote", "pharmacy-search", "medicine-preparing", "pharmacy-confirmed",
    "delivery-unavailable", "order-confirmed", "feedback", "empty-activities", "empty-history"
  ];
  for (const id of objectOnlySymbols) {
    const symbol = defs.match(new RegExp(`<symbol id="krane-state-${id}"[\\s\\S]*?<\\/symbol>`))?.[0] || "";
    assert.match(symbol, /href="#ksi-object-/, `${id} must use object-only art`);
    assert.doesNotMatch(symbol, /<image\b/, `${id} must not include a person`);
  }
  const alignedMarks = [...defs.matchAll(/href="#ksi-mark-(?:check|alert|clock|bubble-check|search)" transform="translate\(([^)]+)\)"/g)];
  assert.ok(alignedMarks.length >= 10);
  for (const mark of alignedMarks) assert.equal(mark[1], "420 91");
  const loader = defs.match(/<symbol id="krane-state-loading-info"[\s\S]*?<\/symbol>/)?.[0] || "";
  assert.match(loader, /assets\/loading-v5\/paper-crane-fold-v3\.svg/, "the gallery must use the editorial rigid-fold vector animation");
  assert.match(loader, /assets\/loading-v5\/paper-crane-final-v3\.svg/, "the gallery must keep a reduced-motion final crane");
  const animatedCrane = await readFile(path.join(b2c, "assets/loading-v5/paper-crane-fold-v3.svg"), "utf8");
  assert.match(animatedCrane, /vector-effect:non-scaling-stroke/);
  assert.match(animatedCrane, /<animateTransform\b/);
  assert.doesNotMatch(animatedCrane, /<animate\s+attributeName="d"|filter=|<filter\b|blur\(|feGaussianBlur|linearGradient|radialGradient/);
  assert.match(animatedCrane, /stroke-width:2\.25/);
  assert.match(animatedCrane, /class="pencil"/);
  const staticCrane = await readFile(path.join(b2c, "assets/loading-v5/paper-crane-final-v3.svg"), "utf8");
  assert.match(staticCrane, /<svg\b/);
  assert.doesNotMatch(loader, /ks-loader-bg-|ks-loader-route|ks-loader-dot|ks-crane-shadow|<rect\b/, "the paper crane must have no background scenery");
  assert.match(css, /ks-paper-crane-static\{display:none\}/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css, /filter:\s*drop-shadow|url\(/, "illustrations should stay crisp and lightweight");
  assert.equal((gallery.match(/\['krane-state-/g) || []).length, 19);
});
