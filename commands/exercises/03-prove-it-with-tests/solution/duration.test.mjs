import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDuration } from './duration.mjs';

const malformed = { name: 'RangeError', message: /Invalid duration/ };

test('parses hours and minutes', () => {
  assert.equal(parseDuration('1h30m'), 5400);
});

test('parses a single unit', () => {
  assert.equal(parseDuration('45s'), 45);
  assert.equal(parseDuration('10m'), 600);
  assert.equal(parseDuration('2h'), 7200);
});

test('parses all three units, including a zero', () => {
  assert.equal(parseDuration('1h0m5s'), 3605);
});

test('ignores surrounding whitespace', () => {
  assert.equal(parseDuration(' 2h '), 7200);
});

test('rejects empty and blank input', () => {
  for (const input of ['', '   ']) assert.throws(() => parseDuration(input), malformed, JSON.stringify(input));
});

test('rejects a number without a unit', () => {
  assert.throws(() => parseDuration('90'), malformed);
});

test('rejects unknown units, decimals, and negatives', () => {
  for (const input of ['5x', '1.5h', '-5m']) assert.throws(() => parseDuration(input), malformed, input);
});

test('rejects units out of order or repeated', () => {
  for (const input of ['1m1h', '1h1h', '30s1m']) assert.throws(() => parseDuration(input), malformed, input);
});

test('rejects non-string input with a TypeError', () => {
  for (const input of [42, null, undefined, {}]) {
    assert.throws(() => parseDuration(input), { name: 'TypeError', message: /Invalid duration/ }, String(input));
  }
});
