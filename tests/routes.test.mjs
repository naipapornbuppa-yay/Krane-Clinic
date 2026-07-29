import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { QA_ROUTE_ALIASES, qaAssetPath } from "../worker/routes.mjs";

const root = path.resolve(import.meta.dirname, "..");

test("client-facing clean routes resolve to canonical nested assets", () => {
  assert.equal(qaAssetPath("/"), "/b2c/krane-b2c.html");
  assert.equal(qaAssetPath("/qa/"), "/b2c/krane-b2c.html");
  assert.equal(qaAssetPath("/START-HERE.html"), "/b2c/krane-b2c.html");
  assert.equal(qaAssetPath("/b2c/landing"), "/b2c/krane-b2c-landing.html");
  assert.equal(qaAssetPath("/b2c/krane-b2c/"), "/b2c/krane-b2c.html");
  assert.equal(qaAssetPath("/cms/doctor"), "/cms/cms-doctor.html");
  assert.equal(qaAssetPath("/cms/admin/"), "/cms/cms-admin.html");
  assert.equal(qaAssetPath("/ui-inventory/components"), "/ui-inventory/ui-components.html");
  assert.equal(qaAssetPath("/unknown"), null);
});

test("every route alias points to a packaged file", async () => {
  await Promise.all(Object.values(QA_ROUTE_ALIASES).map(async (assetPath) => {
    await access(path.join(root, "public", assetPath));
  }));
});
