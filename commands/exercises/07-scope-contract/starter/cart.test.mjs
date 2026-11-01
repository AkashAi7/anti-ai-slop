import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotal, total } from './cart.mjs';

test('an empty cart costs nothing', () => {
  assert.equal(subtotal([]), 0);
});

test('a single item gets tax added', () => {
  assert.equal(total([{ priceCents: 500, qty: 1 }], 0.1), 550);
});
