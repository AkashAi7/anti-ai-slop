import assert from 'node:assert/strict';
export const checks = [
  ['brief has an observable contract', ({ json }) => {
    const brief = json('brief.json');
    for (const key of ['goal', 'audience', 'errorBehavior']) assert.ok(typeof brief[key] === 'string' && brief[key].trim().length > 8, key);
    for (const key of ['includedStatuses', 'outputFields']) {
      assert.ok(Array.isArray(brief[key]) && brief[key].length > 0, key);
      assert.ok(brief[key].every((value) => typeof value === 'string' && value.trim()), key);
    }
    assert.ok(Array.isArray(brief.examples) && brief.examples.length >= 2);
    assert.ok(brief.examples.every((example) => Array.isArray(example.input) && Object.hasOwn(example, 'expected')));
    assert.deepEqual(brief.unresolved, []);
  }],
  ['scope stays bounded', ({ json }) => assert.ok(json('brief.json').nonGoals.includes('no network service'))],
];
