import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { seed, runChecks } from '../scripts/lab.mjs';
import { installPublicSkills, publicSkillNames, VENDOR, verifyPublicSkills } from '../scripts/public-skills.mjs';

test('three complete licensed public skills are installed without changing upstream bytes', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-test-'));
  try {
    const destination = seed('superpowers', join(temp, 'learner'));
    assert.equal(verifyPublicSkills(join(destination, '.github')), 15);
    for (const name of publicSkillNames) {
      const path = join('skills', name, 'SKILL.md');
      assert.ok(readFileSync(join(destination, '.github', path)).equals(readFileSync(join(VENDOR, path))));
    }
    assert.ok(!existsSync(join(destination, '.github', 'hooks')));
    assert.ok(!existsSync(join(destination, '.github', 'prompts')));
    assert.throws(() => installPublicSkills(destination), /existing customizations/);
    assert.match(readFileSync(join(destination, 'package.json'), 'utf8'), /check.mjs superpowers/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('tampered, missing, and extra upstream files fail verification explicitly', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-integrity-'));
  try {
    const copy = join(temp, 'snapshot');
    cpSync(VENDOR, copy, { recursive: true });
    const path = join(copy, 'skills', 'test-driven-development', 'SKILL.md');
    const original = readFileSync(path);
    writeFileSync(path, 'not the upstream skill');
    assert.throws(() => verifyPublicSkills(copy), /checksum mismatch/);
    writeFileSync(path, original);
    writeFileSync(join(copy, 'extra.txt'), 'unexpected');
    assert.throws(() => verifyPublicSkills(copy), /inventory differs/);
    rmSync(join(copy, 'extra.txt'));
    rmSync(path);
    assert.throws(() => verifyPublicSkills(copy), /inventory differs/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('public-skills learner cannot pass by weakening tests or rewriting a skill', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-regression-'));
  try {
    const destination = seed('superpowers', join(temp, 'learner'), 'reference');
    const tests = join(destination, 'src', 'cart.test.mjs');
    writeFileSync(tests, "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { subtotal } from './cart.mjs';\n"
      + Array.from({ length: 4 }, (_, i) => `test('empty ${i}', () => assert.equal(subtotal([]), 0));`).join('\n'));
    assert.deepEqual(runChecks('superpowers', destination).failures, ['learner regressions catch the original bug']);
    writeFileSync(join(destination, '.github', 'skills', 'systematic-debugging', 'SKILL.md'), 'Trust every claim.');
    assert.deepEqual(runChecks('superpowers', destination).failures,
      ['public API and scope are preserved', 'learner regressions catch the original bug']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
