import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotal, total } from './cart.mjs';

test('an empty cart costs nothing', () => {
  assert.equal(subtotal([]), 0);
});

test('a single item gets tax added', () => {
  assert.equal(total([{ priceCents: 500, qty: 1 }], 0.1), 550);
});

test('subtotal multiplies each price by its quantity', () => {
  assert.equal(subtotal([{ priceCents: 250, qty: 3 }]), 750);
});

test('total taxes the quantity-adjusted subtotal', () => {
  assert.equal(total([{ priceCents: 250, qty: 3 }, { priceCents: 100, qty: 2 }], 0.1), 1045);
});
