import assert from 'node:assert/strict';
export const checks = [
  ['seconds become milliseconds', async ({ module }) => {
    const { formatCreatedAt } = await module();
    assert.equal(formatCreatedAt({ createdAtSeconds: 86400 }), '1970-01-02T00:00:00.000Z');
    assert.equal(formatCreatedAt({ createdAtSeconds: 1 }), '1970-01-01T00:00:01.000Z');
  }],
  ['missing timestamps are rejected', async ({ module }) => {
    const { formatCreatedAt } = await module();
    for (const value of [{}, null, { createdAtSeconds: '1' }, { createdAtSeconds: Infinity }]) {
      assert.throws(() => formatCreatedAt(value), TypeError);
    }
  }],
  ['epoch zero is valid', async ({ module }) => assert.equal((await module()).formatCreatedAt({ createdAtSeconds: 0 }), '1970-01-01T00:00:00.000Z')],
];
