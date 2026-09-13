import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const resetScript = await readFile(
  path.join(root, "public/b2c/qa-session-reset.js"),
  "utf8"
);

function runResetHook(search) {
  const storage = new Map([
    ["krane-p01-flow-state-v1", "{\"draftReady\":true}"],
    ["krane-p01-intake-draft-v1", "{\"complete\":true}"],
    ["krane-p01-consent-records-v1", "[{\"type\":\"pdpa\"}]"],
    ["unrelated-session-key", "keep"]
  ]);
  let replacedUrl = null;
  const location = {
    pathname: "/b2c/krane-b2c",
    search,
    hash: "#intake4"
  };
  const window = {
    location,
    sessionStorage: {
      removeItem(key) { storage.delete(key); }
    },
    history: {
      replaceState(_state, _title, url) { replacedUrl = url; }
    }
  };

  vm.runInNewContext(resetScript, { URLSearchParams, window });
  return { location, replacedUrl, storage, window };
}

test("qaReset clears only prototype session state and returns to landing", () => {
  const result = runResetHook(
    "?qaReset=1&demoStage=plan&demoStatus=Dispatched&utm_source=line"
  );

  assert.equal(result.storage.has("krane-p01-flow-state-v1"), false);
  assert.equal(result.storage.has("krane-p01-intake-draft-v1"), false);
  assert.equal(result.storage.has("krane-p01-consent-records-v1"), false);
  assert.equal(result.storage.get("unrelated-session-key"), "keep");
  assert.equal(
    result.replacedUrl,
    "/b2c/krane-b2c?utm_source=line#landing"
  );
  assert.equal(result.window.kraneQaResetApplied, true);
});

test("ordinary patient links do not reset session state", () => {
  const result = runResetHook("?utm_source=line");

  assert.equal(result.storage.size, 4);
  assert.equal(result.replacedUrl, null);
  assert.equal(result.location.hash, "#intake4");
  assert.equal(result.window.kraneQaResetApplied, undefined);
});
