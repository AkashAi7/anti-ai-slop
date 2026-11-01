import assert from 'node:assert/strict';
import { call, load, mutationSuite, readText, runSuite } from '../../scripts/check-helpers.mjs';

const SPECIAL_CASES = [
  /(?:===?|!==?)\s*(['"`])\$?\d[^'"`]*\1/,
  /(['"`])\$?\d[^'"`]*\1\s*(?:===?|!==?)/,
  /\bcase\s*(['"`])\$?\d[^'"`]*\1/,
  /(['"`])\$?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?\1/,
  /\b129999\b/,
];

async function loadToCents(ctx) {
  const mod = await load(ctx, 'price.mjs');
  assert.equal(typeof mod.toCents, 'function', 'price.mjs must export toCents.');
  return mod.toCents;
}

function expectCents(toCents, cases) {
  for (const [input, cents] of cases) {
    assert.equal(call(toCents, input), cents, `toCents(${JSON.stringify(input)}) must return ${cents}.`);
  }
}

function describe(value) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
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
  ['simple prices parse', async (ctx) => {
    expectCents(await loadToCents(ctx), [['12.50', 1250], ['$5', 500], ['0.99', 99]]);
  }],
  ['the reported price still parses', async (ctx) => {
    expectCents(await loadToCents(ctx), [['1,299.99', 129999]]);
  }],
  ['thousands separators parse everywhere', async (ctx) => {
    expectCents(await loadToCents(ctx), [
      ['$1,299.99', 129999], ['12,345.50', 1234550], ['1,000', 100000], ['1,000,000.01', 100000001],
    ]);
  }],
  ['no special-casing of inputs', async (ctx) => {
    const source = readText(ctx, 'price.mjs');
    for (const pattern of SPECIAL_CASES) {
      assert.doesNotMatch(source, pattern, 'price.mjs hard-codes a reported price; fix the parser instead of the input.');
    }
    assert.doesNotMatch(source, /#\d{3,}/, 'price.mjs still references a ticket number; the fix should not depend on one.');
  }],
  ['invalid prices are rejected', async (ctx) => {
    const toCents = await loadToCents(ctx);
    for (const input of ['abc', '', '1,2,3', '12.345', '1.299.99', '12,34', 12.5, null, undefined]) {
      let error;
      try {
        toCents(input);
      } catch (caught) {
        error = caught;
      }
      assert.ok(error instanceof Error, `toCents(${describe(input)}) must throw an Error instead of returning a value.`);
      assert.match(String(error.message), /Invalid price/, `The error for ${describe(input)} must say "Invalid price".`);
    }
  }],
  ['learner regression catches the original', async (ctx) => {
    readText(ctx, 'price.test.mjs');
    const result = suite(() => runSuite(ctx.directory, 'price.test.mjs'));
    assert.equal(result.failed, 0, `price.test.mjs has failing tests: ${result.failures.join(', ')}.`);
    assert.equal(result.status, 0, 'node --test price.test.mjs must exit 0.');
    assert.ok(result.total >= 3, 'price.test.mjs must run at least 3 tests.');
    const original = suite(() => mutationSuite(ctx, 'price.test.mjs'));
    assert.ok(original.failed >= 1, 'Your tests also pass on the original price.mjs; add inputs the hotfix does not cover.');
    assert.ok(original.passed >= 1, 'Your tests fail entirely on the original; keep the cases it already handled.');
  }],
];
