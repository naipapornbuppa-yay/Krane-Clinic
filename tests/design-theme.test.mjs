import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const b2cRoot = path.join(root, "public", "b2c");

test("B2C design system uses the approved cream, navy and royal-blue theme", async () => {
  const tokens = await readFile(path.join(b2cRoot, "design-tokens.css"), "utf8");

  for (const declaration of [
    "--theme-canvas: #F7F9FB",
    "--theme-canvas-inset: #EFF3F7",
    "--theme-surface: #FFFFFF",
    "--theme-ink: #121824",
    "--theme-ink-muted: #495366",
    "--theme-accent-vivid: #1973FF",
    "--theme-accent: #0164FF",
    "--theme-action: #121824",
  ]) {
    assert.match(tokens, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(tokens, /--color-bg: var\(--theme-canvas\)/);
  assert.match(tokens, /--color-surface: var\(--theme-surface\)/);
  assert.match(tokens, /--color-ink: var\(--theme-ink\)/);
  assert.match(tokens, /--color-accent: var\(--preset-blue-accent\)/);
  assert.match(tokens, /--btn-primary-bg: var\(--theme-action\)/);
});

test("primary B2C documents expose the approved browser chrome colour and cache key", async () => {
  for (const file of ["krane-b2c.html", "krane-b2c-landing.html", "condition-detail.html"]) {
    const html = await readFile(path.join(b2cRoot, file), "utf8");
    assert.match(html, /<meta name="theme-color" content="#F7F9FB">/);
    assert.match(html, /design-tokens\.css\?v=20260816-sections-idcard-v8/);
  }
});
