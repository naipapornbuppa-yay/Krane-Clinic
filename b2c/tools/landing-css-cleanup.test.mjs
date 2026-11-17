import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanCss, keepSelector, checkRetiredReferences} from './landing-css-cleanup.mjs';
const retired = new Set(['retired']);

test('removes only selector branches requiring an explicitly retired class', () => {
  assert.equal(keepSelector('.retired:hover, .live', retired).trim(), '.live');
  assert.equal(keepSelector('.live .retired > img', retired), '');
  for (const selector of ['.live:not(.retired)', ':is(.retired,.live)', '.live:has(.retired)', '.retired-lookalike', '[class="retired"]']) {
    assert.equal(keepSelector(selector, retired), selector);
  }
});
test('keeps dynamic state and unknown class selectors', () => {
  const input = '.live.is-current{opacity:1}.live:hover{color:red}.future{display:block}';
  assert.equal(cleanCss(input, retired).css, input);
});
test('exact duplicates keep their final cascade position', () => {
  const input = '.a{color:red}.b{color:blue}.a{color:red}';
  assert.equal(cleanCss(input, retired).css, '.b{color:blue}.a{color:red}');
});
test('does not merge differing fallbacks, importance or shorthand properties', () => {
  for (const input of [
    '.a{display:block;display:grid}',
    '.a{color:red!important}.a{color:red}',
    '.a{margin:2px;margin-left:1px}',
    '@media(max-width:760px){.a{color:red}}.a{color:red}',
    '@layer first{}.a{color:red}@layer second{.a{color:red}}',
    '@keyframes fade{from{opacity:0}to{opacity:0}}',
    '@scope(.outer){.a{color:red}.a{color:red}}',
  ]) assert.equal(cleanCss(input, retired).css, input);
});
test('same-condition repeats can be deduplicated without moving rules', () => {
  const result = cleanCss('@media(max-width:760px){.a{color:red}}.b{color:blue}@media(max-width:760px){.a{color:red}}', retired);
  assert.equal(result.css, '.b{color:blue}@media(max-width:760px){.a{color:red}}');
});
test('cleanup is idempotent and keeps active mixed selectors', () => {
  const first = cleanCss('.retired,.live{padding:1px}@media(x){.retired{color:red}}', retired);
  assert.equal(first.css, '.live{padding:1px}');
  assert.equal(cleanCss(first.css, retired).css, first.css);
});
test('audited retired anchors stay absent from repository runtime sources', () => checkRetiredReferences());
