import assert from 'node:assert/strict';
export const checks = [
  ['zero remains a valid priority', async ({ module }) => {
    const { priority } = await module();
    assert.equal(priority(0), 0);
    assert.equal(priority(null), 3);
    assert.equal(priority(undefined), 3);
    assert.equal(priority(2), 2);
  }],
  ['invalid priorities are rejected', async ({ module }) => {
    const { priority } = await module();
    for (const value of [-1, 1.5, 4, '2', '', false, NaN, Infinity]) assert.throws(() => priority(value), RangeError);
  }],
  ['review dispositions reflect the contract', ({ json }) => {
    const { decisions } = json('review.json');
    assert.deepEqual(decisions.map(({ id, disposition }) => [id, disposition]), [['R1', 'reject'], ['R2', 'accept']]);
    assert.ok(decisions.every(({ evidence }) => evidence.includes('TASK.md') && evidence.length > 40));
  }],
];
