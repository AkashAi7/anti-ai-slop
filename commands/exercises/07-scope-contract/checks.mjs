import assert from 'node:assert/strict';
import { call, load, mutationSuite, readText, runSuite, sameBytes, sections } from '../../scripts/check-helpers.mjs';

const API = { applyTax: 2, subtotal: 1, total: 2 };
const SECTIONS = ['Goal', 'Allowed changes', 'Forbidden', 'Frozen API', 'Done when', 'Rollback'];

async function cart(ctx) {
  const mod = await load(ctx, 'cart.mjs');
  for (const name of Object.keys(API)) assert.equal(typeof mod[name], 'function', `cart.mjs must export ${name}.`);
  return mod;
}

function suite(fn) {
  try {
    return fn();
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error;
    assert.fail(`Could not run the learner tests: ${error?.message ?? error}`);
  }
}

export const checks = [
  ['existing behavior still passes', async (ctx) => {
    const { subtotal, total } = await cart(ctx);
    assert.equal(call(subtotal, []), 0, 'An empty cart must cost 0.');
    assert.equal(call(total, [{ priceCents: 500, qty: 1 }], 0.1), 550, 'One 500-cent item at 10% tax must total 550.');
  }],
  ['quantity is applied', async (ctx) => {
    const { subtotal, total } = await cart(ctx);
    assert.equal(call(subtotal, [{ priceCents: 250, qty: 3 }]), 750, 'subtotal must multiply priceCents by qty.');
    assert.equal(call(total, [{ priceCents: 250, qty: 3 }, { priceCents: 100, qty: 2 }], 0.1), 1045,
      'total must tax the quantity-adjusted subtotal.');
  }],
  ['learner regression catches the bug', async (ctx) => {
    readText(ctx, 'cart.test.mjs');
    const result = suite(() => runSuite(ctx.directory, 'cart.test.mjs'));
    assert.equal(result.failed, 0, `cart.test.mjs has failing tests: ${result.failures.join(', ')}.`);
    assert.equal(result.status, 0, 'node --test cart.test.mjs must exit 0.');
    assert.ok(result.total >= 3, 'Add at least one regression test to cart.test.mjs (3 or more tests in total).');
    const original = suite(() => mutationSuite(ctx, 'cart.test.mjs'));
    assert.ok(original.failed >= 1, 'Your tests also pass on the original cart.mjs; add a test with qty greater than 1.');
    assert.ok(original.passed >= 1, 'Your tests fail entirely on the original; keep the existing tests.');
  }],
  ['public API is frozen', async (ctx) => {
    const mod = await load(ctx, 'cart.mjs');
    assert.deepEqual(Object.keys(mod).sort(), Object.keys(API), 'cart.mjs must export exactly applyTax, subtotal, and total.');
    for (const [name, length] of Object.entries(API)) {
      assert.equal(mod[name].length, length, `${name} must keep ${length} parameter(s).`);
    }
  }],
  ['out-of-scope files are untouched', async (ctx) => {
    sameBytes(ctx, 'format.mjs');
    sameBytes(ctx, 'legacy-pricing.mjs');
  }],
  ['SCOPE.md is a real contract', async (ctx) => {
    const text = readText(ctx, 'SCOPE.md');
    const lines = text.trimEnd().split(/\r?\n/).length;
    assert.ok(lines <= 40, `SCOPE.md has ${lines} lines; keep it to 40 or fewer.`);
    const found = sections(text);
    for (const title of SECTIONS) {
      assert.ok(found.get(title.toLowerCase()), `SCOPE.md needs a non-empty "## ${title}" section.`);
    }
    const allowed = found.get('allowed changes');
    assert.match(allowed, /\bcart\.mjs\b/, 'Allowed changes must name cart.mjs.');
    assert.match(allowed, /\bcart\.test\.mjs\b/, 'Allowed changes must name cart.test.mjs.');
    const forbidden = found.get('forbidden');
    assert.match(forbidden, /\blegacy-pricing\.mjs\b/, 'Forbidden must name legacy-pricing.mjs.');
    assert.match(forbidden, /\bformat\.mjs\b/, 'Forbidden must name format.mjs.');
    for (const name of Object.keys(API)) {
      assert.match(found.get('frozen api'), new RegExp(`\\b${name}\\b`), `Frozen API must name ${name}.`);
    }
  }],
];
