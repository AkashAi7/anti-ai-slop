import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slugify.mjs';

test('lowercases, strips accents, and joins words with single dashes', () => {
  assert.equal(slugify('Héllo   Wörld!'), 'hello-world');
});

test('trims separators from both ends', () => {
  assert.equal(slugify('  --Already-slugged--  '), 'already-slugged');
  assert.equal(slugify('   '), '');
});

test('rejects non-string input with a TypeError', () => {
  assert.throws(() => slugify(42), TypeError);
  assert.throws(() => slugify(null), TypeError);
});

test('does not write to the console', (t) => {
  const log = t.mock.method(console, 'log', () => {});
  slugify('A b');
  assert.equal(log.mock.callCount(), 0);
});
