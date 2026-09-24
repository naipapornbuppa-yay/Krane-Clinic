import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(here, '../handoff/string-ids.v1.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const errors = [];
const ids = new Set();
const allowedOwners = new Set(['frontend', 'backend']);
const idPattern = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*){2,}$/;
const placeholderPattern = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;

function placeholders(text) {
  return [...String(text).matchAll(placeholderPattern)].map((match) => match[1]).sort();
}

for (const [index, entry] of (catalog.strings || []).entries()) {
  const location = `strings[${index}]`;
  if (!idPattern.test(entry.id || '')) errors.push(`${location}: invalid id "${entry.id}"`);
  if (ids.has(entry.id)) errors.push(`${location}: duplicate id "${entry.id}"`);
  ids.add(entry.id);
  if (!allowedOwners.has(entry.owner)) errors.push(`${entry.id}: owner must be frontend or backend`);
  if (!Array.isArray(entry.params)) errors.push(`${entry.id}: params must be an array`);
  if (!String(entry.th || '').trim()) errors.push(`${entry.id}: missing Thai copy`);
  if (!String(entry.en || '').trim()) errors.push(`${entry.id}: missing English copy`);

  const declared = [...(entry.params || [])].sort();
  const thai = placeholders(entry.th);
  const english = placeholders(entry.en);
  if (JSON.stringify(declared) !== JSON.stringify(thai)) {
    errors.push(`${entry.id}: params do not match Thai placeholders (${declared} vs ${thai})`);
  }
  if (JSON.stringify(declared) !== JSON.stringify(english)) {
    errors.push(`${entry.id}: params do not match English placeholders (${declared} vs ${english})`);
  }
}

function visitMap(value, trail = 'backendStatusMap') {
  for (const [key, child] of Object.entries(value || {})) {
    if (typeof child === 'string') {
      if (!ids.has(child)) errors.push(`${trail}.${key}: unknown string id "${child}"`);
    } else {
      visitMap(child, `${trail}.${key}`);
    }
  }
}

visitMap(catalog.backendStatusMap);

if (errors.length) {
  console.error(`String ID contract failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`String ID contract OK: ${ids.size} unique IDs, all locale placeholders match.`);
