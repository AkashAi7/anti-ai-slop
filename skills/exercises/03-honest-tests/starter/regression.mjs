import assert from 'node:assert/strict';
export function verify(countOpen) {
  assert.equal(typeof countOpen, 'function');
}
