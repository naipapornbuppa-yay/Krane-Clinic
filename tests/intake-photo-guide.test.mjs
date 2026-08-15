import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const b2c = path.join(process.cwd(), "public/b2c");
const names = ["front", "crown", "back", "side"];

test("hair photo guide uses the locked mascot illustration style instead of people photos", async () => {
  const html = await readFile(path.join(b2c, "krane-b2c.html"), "utf8");
  const start = html.indexOf('<section class="screen" id="intake5">');
  const end = html.indexOf('<section class="screen"', start + 1);
  const intake = html.slice(start, end);

  assert.equal((intake.match(/photo-guide__img/g) || []).length, 4);
  assert.doesNotMatch(intake, /assets\/intake\/hair-angle-[^"?]+\.jpg/);

  for (const name of names) {
    const relative = `assets/intake/illustrated-v1/hair-angle-${name}-mascot-v2.png`;
    assert.match(intake, new RegExp(`${relative.replaceAll("/", "\\/")}\\?v=20260815-mascot-photo-guide-v2`));
    const png = await readFile(path.join(b2c, relative));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), 800, `${name} width`);
    assert.equal(png.readUInt32BE(20), 800, `${name} height`);
  }
});
