import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCents } from './price.mjs';

test('ticket #4821: 1,299.99 parses', () => {
  assert.equal(toCents('1,299.99'), 129999);
});
