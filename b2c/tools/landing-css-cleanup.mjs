/** Conservative, repeatable landing cleanup. Never infer "unused" from a screenshot. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export const retiredClasses = new Set([
  'care-banner-grid--auto-products', 'care-banner-grid--static-products',
  'trust-section--figma', 'hero--campaign', 'treatment-pill', 'treatment-grid',
  'trust-card__logo-stage', 'trust-card__iso-grid', 'hero__signals',
  'weight-result-pair', 'program-value-grid', 'program-result-diptych',
  'hero-feature-layout', 'mobile-treatment-menu', 'program-section__head',
  'campaign-slide', 'care-banner--ed', 'care-banner--hair',
  'confidence-campaign--scroll-story', 'inet-certification',
  'program-product', 'hero-care-card', 'weight-quick',
  'program-section--hair', 'program-section--weight', 'program-section--ed',
  'care-discovery__grid', 'compliance__logos', 'hair-story-grid',
  'program-catalogue--ed', 'ed-story-strip', 'iso-standard',
  'program-outcome-grid', 'hero__brand-lockup', 'step-art', 'figma-how__phone',
  'trust-card--pharmacy', 'care-banner__badges', 'weight-catalogue__heading',
  'weight-catalogue__controls',
]);

// A class inside :not(), :has(), :is(), etc. is NOT an absence witness.
// Keep those branches, all IDs/attributes, and every unlisted class untouched.
export function keepSelector(selector, retired = retiredClasses) {
  const ast = selectorParser().astSync(selector);
  for (const branch of [...ast.nodes]) {
    if (branch.nodes.some(node => node.type === 'class' && retired.has(node.value))) branch.remove();
  }
  return ast.toString();
}

export function cleanCss(css, retired = retiredClasses) {
  const root = postcss.parse(css);
  let selectorsRemoved = 0, declarationsRemoved = 0;
  root.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    const before = selectorParser().astSync(rule.selector).nodes.length;
    const kept = keepSelector(rule.selector, retired);
    selectorsRemoved += before - (kept ? selectorParser().astSync(kept).nodes.length : 0);
    if (!kept) rule.remove();
    else if (kept !== rule.selector) rule.selector = kept;
  });
  // Delete only byte-equivalent declarations already repeated LATER for the exact
  // same selector and condition. Preserve differing fallbacks, importance, ordering,
  // shorthand/longhand interactions, @layer, @scope, keyframes, and nested rules.
  const seen = new Set();
  function visit(node, scope = []) {
    if (node.type === 'atrule' && !['media', 'supports', 'container'].includes(node.name)) return;
    if (node.type === 'rule') {
      if (node.nodes.some(child => !['decl', 'comment'].includes(child.type))) return;
      for (const decl of [...node.nodes].reverse()) {
        if (decl.type !== 'decl') continue;
        const key = JSON.stringify([scope, node.selector, decl.prop, decl.value, !!decl.important]);
        if (seen.has(key)) { decl.remove(); declarationsRemoved++; }
        else seen.add(key);
      }
      return;
    }
    for (const child of [...(node.nodes || [])].reverse()) {
      visit(child, node.type === 'atrule' ? [...scope, node.name + ' ' + node.params] : scope);
    }
  }
  visit(root);
  // Empty wrappers/comments left behind by deleted rules have no runtime effect.
  let changed;
  do {
    changed = false;
    root.walk(node => {
      if ((node.type === 'rule' || (node.type === 'atrule' && ['media', 'supports', 'container'].includes(node.name))) && node.nodes?.every(child => child.type === 'comment')) {
        node.remove(); changed = true;
      }
    });
  } while (changed);
  // Whitespace between AST nodes only; never rewrite declaration/string values.
  root.walk(node => { if (node.raws.before) node.raws.before = node.raws.before.replace(/[ \t]+\n/g, '\n'); });
  return {css: root.toString(), selectorsRemoved, declarationsRemoved};
}

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
export function checkRetiredReferences(directory = rootDir) {
  const failures = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      if (['.git', 'node_modules', 'tools', 'handoff'].includes(entry.name)) continue;
      const name = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(name);
      else if (/\.(?:[cm]?js|jsx|tsx?|html|json|svg)$/.test(entry.name)) {
        const source = fs.readFileSync(name, 'utf8');
        for (const token of retiredClasses) if (source.includes(token)) failures.push(`${path.relative(directory, name)}: ${token}`);
      }
    }
  }
  walk(directory);
  if (failures.length) throw new Error('Retired class referenced; review before reusing/removing styling:\n' + failures.join('\n'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkRetiredReferences();
  const write = process.argv.includes('--write');
  let needsCleanup = false;
  for (const file of ['krane-b2c-landing.css', 'landing-release.css']) {
    const filename = path.join(rootDir, 'b2c', file);
    const before = fs.readFileSync(filename, 'utf8');
    const result = cleanCss(before);
    const changed = before !== result.css;
    needsCleanup ||= changed;
    if (write && changed) fs.writeFileSync(filename, result.css);
    console.log(JSON.stringify({file, beforeBytes:Buffer.byteLength(before), afterBytes:Buffer.byteLength(result.css), selectorsRemoved:result.selectorsRemoved, declarationsRemoved:result.declarationsRemoved, changed}));
  }
  if (needsCleanup && !write) {
    console.error('Landing CSS cleanup needed. Review then run npm run clean:landing-css.');
    process.exitCode = 1;
  }
}
