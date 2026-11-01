import assert from 'node:assert/strict';
export const checks = [
  ['numeric priority order is correct', async ({ module }) => {
    const rows = [{ priority: 10 }, { priority: 2 }, { priority: 1 }];
    assert.deepEqual((await module()).sortPriority(rows).map((row) => row.priority), [1, 2, 10]);
  }],
  ['input order is preserved', async ({ module }) => {
    const rows = [{ priority: 2 }, { priority: 1 }];
    const before = structuredClone(rows);
    (await module()).sortPriority(rows);
    assert.deepEqual(rows, before);
  }],
  ['empty input and equal-priority stability are preserved', async ({ module }) => {
    const { sortPriority } = await module();
    assert.deepEqual(sortPriority([]), []);
    assert.deepEqual(sortPriority([{ id: 'B', priority: 1 }, { id: 'A', priority: 1 }]).map((row) => row.id), ['B', 'A']);
  }],
];
