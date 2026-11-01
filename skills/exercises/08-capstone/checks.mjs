import assert from 'node:assert/strict';
import { basename } from 'node:path';
export const checks = [
  ['handoff excludes resolved incidents', async ({ module }) => {
    const { summarize } = await module();
    assert.deepEqual(summarize([{ id: 'A', status: 'resolved' }, { id: 'B', status: 'open' }, { id: 'C', status: 'investigating' }]), { openCount: 2, ids: ['B', 'C'] });
  }],
  ['summary handles empty input', async ({ module }) => assert.deepEqual((await module()).summarize([]), { openCount: 0, ids: [] })],
  ['summary does not mutate incidents', async ({ module }) => {
    const rows = [{ id: 'B', status: 'open' }, { id: 'A', status: 'investigating' }];
    const before = structuredClone(rows);
    assert.deepEqual((await module()).summarize(rows).ids, ['B', 'A']);
    assert.deepEqual(rows, before);
  }],
  ['handoff evidence is explicit', ({ json, directory }) => {
    const report = json('handoff.json');
    const reference = basename(directory) === 'solution';
    assert.equal(report.evidenceKind, reference ? 'reference-fixture' : 'observed');
    assert.equal(report.command, `npm run check -- 08-capstone${reference ? ' --solution' : ''}`);
    for (const key of ['changed', 'observed']) assert.ok(typeof report[key] === 'string' && report[key].trim().length > 20, key);
    assert.ok(Array.isArray(report.notVerified) && report.notVerified.length > 0);
    assert.ok(report.notVerified.every((value) => typeof value === 'string' && value.trim().length > 8));
  }],
];
