import assert from 'node:assert/strict';
const fixture = [{ status: 'resolved' }, { status: 'open' }, { status: 'investigating' }, { status: 'closed' }];
const correct = (rows) => rows.filter((row) => ['open', 'investigating'].includes(row.status)).length;
export const checks = [
  ['resolved incidents are excluded', async ({ module }) => assert.equal((await module()).countOpen(fixture), 2)],
  ['empty incidents return zero', async ({ module }) => assert.equal((await module()).countOpen([]), 0)],
  ['learner regression catches the known defect', async ({ module }) => {
    const { verify } = await module('regression.mjs');
    assert.throws(() => verify((rows) => rows.length), { code: 'ERR_ASSERTION' });
  }],
  ['learner regression accepts correct behavior', async ({ module }) => {
    const { verify } = await module('regression.mjs');
    assert.doesNotThrow(() => verify(correct));
    verify((await module()).countOpen);
  }],
];
