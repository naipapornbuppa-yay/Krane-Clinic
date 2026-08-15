import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const assetRoot = new URL('../public/b2c/assets/state-editorial-v5-ink/', import.meta.url);
const galleryUrl = new URL('../public/b2c/state-illustrations-ink.html', import.meta.url);
const states = [
  'loading-info', 'doctor-matching', 'no-slots', 'waiting-room', 'nurse-ready',
  'treatment-plan', 'delivery-quote', 'pharmacy-search', 'medicine-preparing',
  'pharmacy-confirmed', 'delivery-unavailable', 'consult-payment-failed',
  'payment-failed', 'payment-success', 'order-confirmed', 'in-person', 'feedback',
  'empty-activities', 'empty-history'
];
const roleAligned = new Set(['doctor-matching', 'waiting-room', 'treatment-plan', 'in-person', 'feedback']);

test('ink editorial alternative ships one transparent normalized PNG per B2C state', async () => {
  for (const state of states) {
    const png = await readFile(new URL(`${state}.png`, assetRoot));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${state} must be a PNG`);
    assert.equal(png.readUInt32BE(16), 1080, `${state} width`);
    assert.equal(png.readUInt32BE(20), 720, `${state} height`);
    assert.equal(png[25], 6, `${state} must use RGBA color type`);
  }
});

test('ink editorial gallery includes every state and links back to set A', async () => {
  const gallery = await readFile(galleryUrl, 'utf8');
  for (const state of states) {
    const assetName = roleAligned.has(state) ? `${state}-roles-v1` : state;
    assert.match(gallery, new RegExp(`assets/state-editorial-v5-ink/${assetName}\\.png`));
  }
  assert.match(gallery, /href="state-illustrations\.html\?archive=set-a"/);
  assert.match(gallery, /Set B · Live active/);
  assert.doesNotMatch(gallery, /state-editorial-v3-simple|state-editorial-v4-objects|loading-v5/);
});
