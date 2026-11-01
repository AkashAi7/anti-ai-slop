import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDuration } from './duration.mjs';

test('parses a duration', () => {
  assert.ok(parseDuration('1h30m'));
});
