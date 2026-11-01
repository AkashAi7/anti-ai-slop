import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subtotal } from './cart.mjs';

test('empty cart and quantity one preserve existing behavior', () => {
  assert.equal(subtotal([]), 0);
  assert.equal(subtotal([{ priceCents: 500, qty: 1 }]), 500);
});

test('quantity and mixed lines are included', () => {
  assert.equal(subtotal([{ priceCents: 250, qty: 3 }, { priceCents: 100, qty: 2 }]), 950);
});

test('invalid quantities are rejected', () => {
  for (const qty of [0, -1, 1.5, '2', NaN, Infinity]) {
    assert.throws(() => subtotal([{ priceCents: 100, qty }]), TypeError);
  }
});

test('invalid prices and cart shapes are rejected', () => {
  for (const lines of [null, {}, [null], [{}], [{ priceCents: -1, qty: 1 }]]) {
    assert.throws(() => subtotal(lines), TypeError);
  }
});

test('unsafe products and sums are rejected', () => {
  assert.throws(() => subtotal([{ priceCents: Number.MAX_SAFE_INTEGER, qty: 2 }]), RangeError);
  assert.throws(() => subtotal([
    { priceCents: Number.MAX_SAFE_INTEGER, qty: 1 }, { priceCents: 1, qty: 1 },
  ]), RangeError);
});
