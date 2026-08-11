import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const b2cRoot = path.join(root, "public/b2c");

const medicines = {
  cough: {
    file: "assets/medicine/real-v1/tusspac-15-100-130.jpg",
    hash: "3919df0bcbf332a98af8a8dc0dbf14669c92c82ad870ebe5c060fa63f2f81149"
  },
  loratadine: {
    file: "assets/medicine/real-v1/loratadine-loreze-10mg.jpg",
    hash: "70ef35c32bcca43fe88f61a0644cafdd06d7c4221d510c5e331c20b91ed14891"
  },
  paracetamol: {
    file: "assets/medicine/real-v1/paracetamol-para-gpo-500mg.png",
    hash: "6507cf45994de0bd5af8c910439be806bd56f95a4357b9bde75130cdcd783e56"
  },
  naproxen: {
    file: "assets/medicine/real-v1/naproxen-250mg-thai-mit.jpg",
    hash: "1ab9ccf04d32b7e893f96e9500813cea2c50bcbcf65c8a78b61f764e5290b80e"
  },
  tretinoin: {
    file: "assets/medicine/real-v1/tretinoin-retin-a-0025.jpg",
    hash: "804b7db6bb700a74150e6793fea45107c5fbf1a3c915078ac2ae45ed234f9ad4"
  }
};

test("every B2C medicine item uses the matching real product photo", async () => {
  const html = await readFile(path.join(b2cRoot, "krane-b2c.html"), "utf8");
  const sources = await readFile(path.join(b2cRoot, "assets/medicine/real-v1/SOURCES.md"), "utf8");

  assert.doesNotMatch(html, /class="(?:thumb )?med-thumb"[^>]*>\s*<i\b/,
    "medicine rows must not fall back to a generic pill icon");
  assert.doesNotMatch(html, /class="checkout-order__thumb"[^>]*>\s*<i\b/,
    "checkout medicine rows must not fall back to a generic pill icon");
  assert.doesNotMatch(html, /class="plan-item"[^>]*>[\s\S]{0,180}<span class="thumb"><\/span>/,
    "plan, refill and prescription items must not keep an empty placeholder block");

  for (const [key, medicine] of Object.entries(medicines)) {
    const photoPattern = new RegExp(`data-medicine-photo="${key}"[^>]*>[\\s\\S]*?<img[^>]+src="${medicine.file.replaceAll(".", "\\.")}"`);
    assert.match(html, photoPattern, `${key} must render its matching product photo`);

    const bytes = await readFile(path.join(b2cRoot, medicine.file));
    assert.ok(bytes.length > 10_000, `${key} photo must be a real local image, not a tiny placeholder`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), medicine.hash,
      `${key} source photo must remain unaltered`);
    assert.match(sources, new RegExp(medicine.file.split("/").at(-1).replaceAll(".", "\\.")),
      `${key} photo must keep source provenance`);
  }
});
