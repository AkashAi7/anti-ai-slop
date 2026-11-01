import assert from 'node:assert/strict';
import { call, load, mutationSuite, runSuite } from '../../scripts/check-helpers.mjs';

async function parser(ctx) {
  const { parseDuration } = await load(ctx, 'duration.mjs');
  assert.equal(typeof parseDuration, 'function', 'duration.mjs must export parseDuration.');
  return parseDuration;
}

function rejects(label, fn, pattern) {
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
  assert.match(message, pattern, `${label}: error message "${message}" should match ${pattern}.`);
  return error;
}

export const checks = [
  ['valid durations parse', async (ctx) => {
    const parseDuration = await parser(ctx);
    for (const [input, seconds] of [['1h30m', 5400], ['45s', 45], ['2h', 7200], ['1h0m5s', 3605], [' 2h ', 7200]]) {
      assert.equal(call(parseDuration, input), seconds, `parseDuration(${JSON.stringify(input)})`);
    }
  }],
  ['malformed durations are rejected', async (ctx) => {
    const parseDuration = await parser(ctx);
    for (const input of ['', '90', '5x', '1.5h', '-5m', '1m1h', '1h1h']) {
      rejects(`parseDuration(${JSON.stringify(input)})`, () => parseDuration(input), /Invalid duration/);
    }
  }],
  ['non-strings are rejected', async (ctx) => {
    const parseDuration = await parser(ctx);
    for (const input of [42, null, undefined]) {
      const error = rejects(`parseDuration(${String(input)})`, () => parseDuration(input), /Invalid duration/);
      assert.ok(error instanceof TypeError, `parseDuration(${String(input)}) should throw a TypeError.`);
    }
  }],
  ['learner suite is substantial and green', (ctx) => {
    const result = runSuite(ctx.directory, 'duration.test.mjs');
    assert.ok(result.total >= 6, `duration.test.mjs needs at least 6 tests; found ${result.total}.`);
    assert.equal(result.failed, 0, `duration.test.mjs has failing tests: ${result.failures.join('; ')}`);
    assert.equal(result.status, 0, 'node --test duration.test.mjs must exit 0.');
  }],
  ['learner suite catches the original parser', (ctx) => {
    const result = mutationSuite(ctx, 'duration.test.mjs');
    assert.ok(result.failed >= 1, 'At least one of your tests must fail against the original parser.');
    assert.ok(result.passed >= 1, 'Your valid-input tests should still pass against the original parser.');
  }],
];
