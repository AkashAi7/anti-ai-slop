import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quoteDiscount } from './discount.mjs';

const today = '2026-11-01';

test('no codes preserves the subtotal', () => {
  assert.deepEqual(quoteDiscount(1000, [], today), { code: null, discountCents: 0, totalCents: 1000 });
});

test('best code wins and duplicates never stack', () => {
  assert.deepEqual(quoteDiscount(1000, ['SAVE10', 'SAVE20', 'SAVE20'], today),
    { code: 'SAVE20', discountCents: 200, totalCents: 800 });
});

test('fractional discounts are floored', () => {
  assert.equal(quoteDiscount(999, ['SAVE10'], today).discountCents, 99);
});

test('unknown and expired codes are errors', () => {
  for (const codes of [['UNKNOWN'], ['OLD5'], ['SAVE10', 'UNKNOWN'], ['__proto__']]) {
    assert.throws(() => quoteDiscount(1000, codes, today), RangeError);
  }
  assert.equal(quoteDiscount(1000, ['SAVE10'], '2026-12-31').discountCents, 100);
  assert.throws(() => quoteDiscount(1000, ['SAVE10'], '2027-01-01'), RangeError);
});

test('inputs and dates are validated', () => {
  assert.throws(() => quoteDiscount(-1, [], today), TypeError);
  assert.throws(() => quoteDiscount(1000, 'SAVE10', today), TypeError);
  assert.throws(() => quoteDiscount(1000, [], '2026-02-30'), TypeError);
});

test('large safe integer amounts keep exact cents', () => {
  for (const amount of [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 2]) {
    assert.equal(quoteDiscount(amount, ['SAVE20'], today).discountCents,
      Number(BigInt(amount) * 20n / 100n));
  }
});
