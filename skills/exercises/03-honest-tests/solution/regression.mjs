import assert from 'node:assert/strict';
export function verify(countOpen) {
  assert.equal(countOpen([{ status: 'resolved' }, { status: 'open' }, { status: 'investigating' }]), 2);
  assert.equal(countOpen([]), 0);
}
