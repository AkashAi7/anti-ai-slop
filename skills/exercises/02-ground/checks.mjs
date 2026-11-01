import assert from 'node:assert/strict';
export const checks = [
  ['claims distinguish evidence from invention', ({ json }) => {
    const { claims } = json('evidence.json');
    assert.deepEqual(claims.map((claim) => claim.id).sort(), ['package', 'timestamp']);
    for (const claim of claims) {
      assert.equal(claim.status, 'contradicted');
      assert.equal(claim.source, `exercises/02-ground/contract.json#capabilities.${claim.id === 'timestamp' ? 'timestamps' : 'countOpen'}`);
      assert.ok(typeof claim.conclusion === 'string' && claim.conclusion.length > 20);
    }
  }],
  ['dependency decision uses the supplied capability', ({ json }) => {
    const { dependency } = json('evidence.json');
    assert.equal(dependency.decision, 'reuse');
    assert.equal(dependency.capability, 'Array.prototype.filter');
    assert.ok(dependency.reason.length > 30);
  }],
];
