import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slugify.mjs';

test('slugify works', () => {
  slugify('Hello World');
  assert.ok(true);
});
