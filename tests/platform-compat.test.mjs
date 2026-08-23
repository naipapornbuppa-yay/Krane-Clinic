import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const b2cRoot = path.resolve(import.meta.dirname, "..", "public", "b2c");
const primaryPages = [
  "krane-b2c-landing.html",
  "krane-b2c.html",
  "condition-detail.html",
  "doctors.html",
  "doctor-detail.html",
  "advisor-detail.html",
];

test("primary patient pages share the cross-platform browser contract", async () => {
  for (const file of primaryPages) {
    const html = await readFile(path.join(b2cRoot, file), "utf8");
    assert.match(html, /viewport-fit=cover/, `${file} must respect iOS and Android safe areas`);
    assert.match(
      html,
      /platform-compat\.css\?v=20260823-cross-platform-v1/,
      `${file} must load the shared compatibility layer`,
    );
  }
});

test("platform compatibility CSS protects mobile controls and dynamic viewports", async () => {
  const css = await readFile(path.join(b2cRoot, "platform-compat.css"), "utf8");

  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /min-height:100dvh/);
  assert.match(css, /-webkit-overflow-scrolling:touch/);
  assert.match(css, /font-size:16px!important/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media\(min-width:1720px\)/);
});
