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
    preloader: "krane-state-loading-info",
  };

  assert.match(html, /state-illustrations\.css\?v=20260812-moodboard-v2/);
  for (const [screen, symbol] of Object.entries(expected)) {
    assert.match(screenFragment(html, screen), new RegExp(`href="#${symbol}"`), `${screen} must use ${symbol}`);
    assert.equal((html.match(new RegExp(`<symbol id="${symbol}"`, "g")) || []).length, 1, `${symbol} must be defined once`);
  }
  assert.notEqual(expected["delivery-quote"], expected["pharmacy-search"]);
  assert.notEqual(expected["consultpay-fail"], expected.payfail);
  assert.notEqual(expected["empty-activities"], expected["empty-history"]);
});

test("state art uses reusable cartoon actors and reduced-motion-safe animation", async () => {
  const html = await readFile(path.join(b2c, "krane-b2c.html"), "utf8");
  const css = await readFile(path.join(b2c, "state-illustrations.css"), "utf8");
  const gallery = await readFile(path.join(b2c, "state-illustrations.html"), "utf8");
  const defs = html.match(/<svg class="krane-state-defs"[\s\S]*?<\/svg>/)?.[0] || "";

  assert.ok((defs.match(/id="krane-scene-[^"]+" class="ksi-character"/g) || []).length >= 10);
  assert.ok((defs.match(/<use href="#krane-scene-/g) || []).length >= 18);
  assert.match(css, /\.ksi-skin\{fill:#fffaf1\}/, "faces should use the mood board's unpainted paper tone");
  assert.match(css, /\.ksi-hair\{fill:#0b2d5d\}/, "hair should use the mood board's navy ink");
  assert.match(css, /\.ksi-hair-detail\{[^}]*stroke:#54739a/, "adult characters should retain hand-drawn hair texture");
  assert.ok((defs.match(/class="ksi-hair-detail"/g) || []).length >= 10, "the actor set should include visible ink texture");
  assert.match(css, /@keyframes ksi-route/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css, /filter:\s*drop-shadow|url\(/, "illustrations should stay crisp and lightweight");
  assert.equal((gallery.match(/\['krane-state-/g) || []).length, 19);
});
