import assert from 'node:assert/strict';
import { call, load, readText, sections } from '../../scripts/check-helpers.mjs';

const DAY = '2026-06-01';

async function discounts(ctx) {
  const { applyDiscounts } = await load(ctx, 'discount.mjs');
  assert.equal(typeof applyDiscounts, 'function', 'discount.mjs must export applyDiscounts.');
  return applyDiscounts;
}

function rejects(label, fn, ...patterns) {
  let error;
  let threw = false;
  try {
    fn();
  } catch (caught) {
    threw = true;
    error = caught;
  }
  if (!threw) assert.fail(`${label} should throw, but it returned normally.`);
  const message = String(error?.message ?? error);
  for (const pattern of patterns) assert.match(message, pattern, `${label}: error message "${message}" should match ${pattern}.`);
}

export const checks = [
  ['no codes keeps the total', async (ctx) => {
    const applyDiscounts = await discounts(ctx);
    assert.equal(call(applyDiscounts, 10000, [], DAY), 10000);
  }],
  ['best single code wins (no stacking)', async (ctx) => {
    const applyDiscounts = await discounts(ctx);
    assert.equal(call(applyDiscounts, 10000, ['WELCOME5', 'SAVE10'], DAY), 9000, 'WELCOME5 + SAVE10 must apply only SAVE10.');
    assert.equal(call(applyDiscounts, 10000, ['SAVE10', 'WELCOME5'], DAY), 9000, 'Code order must not matter.');
    assert.equal(call(applyDiscounts, 10000, ['SAVE10', 'SAVE10'], DAY), 9000, 'A repeated code must not stack.');
  }],
  ['discount is floored to whole cents', async (ctx) => {
    const applyDiscounts = await discounts(ctx);
    const ten = call(applyDiscounts, 1999, ['SAVE10'], DAY);
    assert.ok(Number.isInteger(ten), `Expected integer cents, got ${ten}.`);
    assert.equal(ten, 1800, '10% of 1999 is 199.9; the discount floors to 199.');
    const five = call(applyDiscounts, 1999, ['WELCOME5'], DAY);
    assert.ok(Number.isInteger(five), `Expected integer cents, got ${five}.`);
    assert.equal(five, 1900, '5% of 1999 is 99.95; the discount floors to 99.');
  }],
  ['expired codes are rejected', async (ctx) => {
    const applyDiscounts = await discounts(ctx);
    rejects('SPRING20 on 2026-05-01', () => applyDiscounts(10000, ['SPRING20'], '2026-05-01'), /expired/i, /SPRING20/);
    rejects('SAVE10 + SPRING20 on 2026-05-01', () => applyDiscounts(10000, ['SAVE10', 'SPRING20'], '2026-05-01'), /expired/i, /SPRING20/);
    assert.equal(call(applyDiscounts, 10000, ['SPRING20'], '2026-04-30'), 8000, 'A code is valid on its expiry date.');
  }],
  ['unknown codes are rejected', async (ctx) => {
    const applyDiscounts = await discounts(ctx);
    rejects('BOGUS', () => applyDiscounts(10000, ['BOGUS'], DAY), /unknown/i, /BOGUS/);
    rejects('SAVE10 + BOGUS', () => applyDiscounts(10000, ['SAVE10', 'BOGUS'], DAY), /unknown/i, /BOGUS/);
  }],
  ['SPEC.md records the decisions', (ctx) => {
    const spec = readText(ctx, 'SPEC.md');
    assert.ok(!spec.includes('(Paste'), 'Replace the SPEC.md placeholder with the /spec output.');
    const criteria = sections(spec).get('acceptance criteria');
    assert.ok(criteria, 'SPEC.md needs a non-empty "## Acceptance criteria" section.');
    for (const [topic, pattern] of [['stacking', /stack/i], ['cents', /cent/i], ['expiry', /expir/i], ['unknown codes', /unknown|invalid/i]]) {
      assert.match(criteria, pattern, `Acceptance criteria must cover ${topic}.`);
    }
  }],
];
