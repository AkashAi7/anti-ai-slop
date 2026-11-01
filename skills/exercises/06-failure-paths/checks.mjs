import assert from 'node:assert/strict';
export const checks = [
  ['malformed JSON surfaces an error', async ({ module }) => {
    const { parseIncidents } = await module();
    assert.throws(() => parseIncidents('{broken'), SyntaxError);
  }],
  ['wrong shape is rejected', async ({ module }) => {
    const { parseIncidents } = await module();
    for (const value of ['null', '{}', '1', '"text"']) assert.throws(() => parseIncidents(value), TypeError);
  }],
  ['valid empty data remains success', async ({ module }) => assert.deepEqual((await module()).parseIncidents('[]'), [])],
  ['valid incidents are preserved', async ({ module }) => assert.deepEqual((await module()).parseIncidents('[{"id":"EXAMPLE-1"}]'), [{ id: 'EXAMPLE-1' }])],
];
