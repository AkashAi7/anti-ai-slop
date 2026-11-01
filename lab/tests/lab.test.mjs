import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROOT, catalog, fixtureChecks, plainPath, runChecks, seed, track, verifyBaseline } from '../scripts/lab.mjs';

for (const item of catalog.tracks) {
  test(`${item.id}: exact defective baseline, not a checker crash`, () => {
    const result = fixtureChecks(item.id, 'starter');
    verifyBaseline(item.id, result);
    assert.equal(result.passed, item.testCount - item.expectedFailures.length);
  });
  test(`${item.id}: reference passes independent checks and mutation test`, () => {
    const result = fixtureChecks(item.id, 'reference');
    assert.equal(result.status, 0, result.output);
    assert.equal(result.passed, item.testCount);
  });
}

test('setup refuses an existing workspace without changing it', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-setup-test-'));
  try {
    const destination = join(temp, 'learner');
    seed('builtins', destination);
    const file = join(destination, 'src', 'cart.mjs');
    writeFileSync(file, 'learner work must survive');
    assert.throws(() => seed('builtins', destination), /already exists/);
    assert.equal(readFileSync(file, 'utf8'), 'learner work must survive');
    assert.ok(!existsSync(join(destination, '.github', 'prompts')));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('rejects unknown tracks and out-of-scope paths', () => {
  assert.throws(() => track('../outside'), /Unknown track/);
  assert.throws(() => plainPath(ROOT, '..', 'outside'), /outside/);
  assert.throws(() => plainPath(ROOT), /outside/);
  assert.equal(track('spec-kit-skills').id, 'spec-kit');
});

test('a fake happy-path-only learner suite cannot get a green check', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-weak-tests-'));
  try {
    const destination = seed('builtins', join(temp, 'learner'), 'reference');
    writeFileSync(join(destination, 'src', 'cart.test.mjs'),
      "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { subtotal } from './cart.mjs';\n"
      + Array.from({ length: 4 }, (_, index) => `test('empty ${index}', () => assert.equal(subtotal([]), 0));`).join('\n'));
    const result = runChecks('builtins', destination);
    assert.equal(result.status, 1);
    assert.deepEqual(result.failures, ['learner regressions catch the original bug']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('changing a protected file fails even with a correct implementation', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-scope-test-'));
  try {
    const destination = seed('builtins', join(temp, 'learner'), 'reference');
    writeFileSync(join(destination, 'src', 'legacy-pricing.mjs'), 'export const changed = true;');
    const result = runChecks('builtins', destination);
    assert.deepEqual(result.failures, ['public API and scope are preserved']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('fixture starters ship no custom prompt files or learner answers', () => {
  for (const { id } of catalog.tracks) {
    const starter = join(ROOT, 'fixtures', track(id).fixture, 'starter');
    assert.ok(!existsSync(join(starter, '.github')));
    assert.ok(!readdirSync(join(starter, 'src')).some((name) => name.endsWith('.test.mjs')));
  }
});
