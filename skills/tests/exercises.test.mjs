import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalog, runChecks, verifyBaseline } from '../scripts/lab.mjs';

for (const item of catalog) {
  test(`${item.id}: defective fixture fails exactly the intended checks`, () => {
    const result = runChecks(item.id, 'starter');
    verifyBaseline(item.id, result);
  });
  test(`${item.id}: solution passes every acceptance check`, () => {
    const result = runChecks(item.id, 'solution');
    assert.equal(result.status, 0, result.output);
    assert.equal(result.passed, item.testCount);
  });
}
