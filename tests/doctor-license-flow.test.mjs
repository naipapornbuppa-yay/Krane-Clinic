import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");

test("doctor portal closes every consultation through a signed clinical outcome", async () => {
  const html = await readFile(path.join(publicRoot, "cms/cms-doctor.html"), "utf8");
  const i18n = await readFile(path.join(publicRoot, "cms/i18n.js"), "utf8");
  const pageIds = [...html.matchAll(/<section class="[^"]*\bpage\b[^"]*" id="([^"]+)"/g)].map((match) => match[1]);

  for (const id of ["preconsult", "consult", "closeout", "prescribe", "record", "doctor-profile"]) {
    assert.ok(pageIds.includes(id), `missing doctor flow page #${id}`);
  }
  assert.match(html, /id="consult"[\s\S]*data-page="closeout">Complete consultation/);
  assert.match(html, /id="closeout"[\s\S]*SOAP note completed[\s\S]*Remote-care suitability documented/);
  assert.match(html, /data-page="prescribe"[\s\S]*data-closeout-no-rx[\s\S]*data-closeout-refer/);
  assert.match(html, /id="prescribe"[\s\S]*E-prescription signer[\s\S]*medical licence 12345/);
  assert.match(html, /id="doctor-profile"[\s\S]*Professional details[\s\S]*Registration authority[\s\S]*Medical Council of Thailand/);
  assert.match(i18n, /TH_DOCTOR_CLOSEOUT/);

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, source]) => !/\btype=["']application\/ld\+json["']/i.test(attributes) && source.trim())
    .map(([, , source]) => source);
  inlineScripts.forEach((source, index) => {
    assert.doesNotThrow(
      () => new vm.Script(source, { filename: `cms-doctor-inline-${index + 1}.js` }),
      `doctor controller ${index + 1} must parse`
    );
  });
});
