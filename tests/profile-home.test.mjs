import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

function screenFragment(html, id) {
  const start = html.search(new RegExp(`<section class="[^"]*\\bscreen\\b[^"]*" id="${id}"`));
  assert.ok(start >= 0, `missing #${id}`);
  const next = html.slice(start + 1).search(/<section class="[^"]*\bscreen\b[^"]*" id="[^"]+"/);
  return next < 0 ? html.slice(start) : html.slice(start, start + 1 + next);
}

test("patient home gives every care case a follow-up, refill status and doctor call", async () => {
  const patient = await readFile(path.join(root, "public/b2c/krane-b2c.html"), "utf8");
  const profile = screenFragment(patient, "profile");
  const cases = [...profile.matchAll(/<article class="care-case"[\s\S]*?<\/article>/g)].map(match => match[0]);

  assert.equal(cases.length, 2);
  for (const careCase of cases) {
    assert.match(careCase, />Next follow-up</);
    assert.match(careCase, />Refill available</);
    assert.match(careCase, />Your doctor</);
    assert.match(careCase, />Call doctor<\/button>/);
    assert.equal((careCase.match(/btn--primary/g) || []).length, 1, "each case should have one emphasized action");
  }

  assert.equal((profile.match(/class="care-case__link"/g) || []).length, 4);
  assert.doesNotMatch(profile, /class="quick-row"/);
  assert.doesNotMatch(profile, /class="treatment-actions"/);
});

test("patient home care cases collapse their fact grid on small screens", async () => {
  const components = await readFile(path.join(root, "public/b2c/components.css"), "utf8");

  assert.match(components, /#profile \.care-case__facts\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(components, /@media\(max-width:600px\)\{[\s\S]*#profile \.care-case__facts\{grid-template-columns:1fr\}/);
});

test("opening the returning-patient home unlocks continuity actions", async () => {
  const patient = await readFile(path.join(root, "public/b2c/krane-b2c.html"), "utf8");

  assert.match(patient, /if\(id === 'profile'\)\{[\s\S]*flowState\.returningIdentityValid = true;[\s\S]*persistFlowState\(\);/);
  assert.equal((screenFragment(patient, "profile").match(/data-go="matching"/g) || []).length, 3);
});
