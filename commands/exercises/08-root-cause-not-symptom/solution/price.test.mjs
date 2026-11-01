import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCents } from './price.mjs';

test('ticket #4821: 1,299.99 parses', () => {
  assert.equal(toCents('1,299.99'), 129999);
});

test('thousands separators parse with or without a dollar sign', () => {
  assert.equal(toCents('$1,299.99'), 129999);
  assert.equal(toCents('12,345.50'), 1234550);
  assert.equal(toCents('1,000,000.01'), 100000001);
});

test('simple prices parse without float drift', () => {
  assert.equal(toCents('0.29'), 29);
  assert.equal(toCents('$5'), 500);
  assert.equal(toCents('12.5'), 1250);
});

test('malformed prices are rejected', () => {
  for (const bad of ['abc', '', '1,2,3', '12.345', '1.299.99', '12,34', 12.5]) {
    assert.throws(() => toCents(bad), /Invalid price/);
  }
});
