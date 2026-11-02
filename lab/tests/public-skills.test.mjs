import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROOT, seed, runChecks } from '../scripts/lab.mjs';
import {
  installPublicSkills, publicSkillNames, skillFileCount, skillSources, VENDOR, verifyPublicSkills,
} from '../scripts/public-skills.mjs';

const catalog = JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'));

test('the pack ships grill-me and the other anti-slop skills from licensed public sources', () => {
  for (const name of ['grill-me', 'grilling', 'systematic-debugging', 'test-driven-development',
    'verification-before-completion', 'receiving-code-review', 'code-simplification',
    'source-driven-development', 'humanizer', 'frontend-design']) {
    assert.ok(publicSkillNames.includes(name), `missing ${name}`);
  }
  assert.equal(new Set(publicSkillNames).size, publicSkillNames.length);
  assert.deepEqual(readdirSync(join(VENDOR, 'skills')).sort(), [...publicSkillNames].sort());
  for (const source of skillSources) {
    assert.match(source.commit, /^[0-9a-f]{40}$/);
    assert.ok(existsSync(join(VENDOR, ...source.licenseFile.split('/'))), `license for ${source.repository}`);
  }
  // grill-me only delegates; its target must ship with it.
  assert.match(readFileSync(join(VENDOR, 'skills', 'grill-me', 'SKILL.md'), 'utf8'), /"grilling"/);
  for (const { name, prompt } of catalog.publicSkills) {
    assert.ok(publicSkillNames.includes(name), `catalog lists unknown skill ${name}`);
    assert.ok(prompt.startsWith(`/${name} `), `${name} prompt must invoke the skill`);
  }
});

test('complete licensed public skills are installed without changing upstream bytes', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-test-'));
  try {
    const destination = seed('skills', join(temp, 'learner'));
    assert.equal(verifyPublicSkills(join(destination, '.github')), skillFileCount);
    for (const name of publicSkillNames) {
      const path = join('skills', name, 'SKILL.md');
      assert.ok(readFileSync(join(destination, '.github', path)).equals(readFileSync(join(VENDOR, path))));
    }
    assert.ok(!existsSync(join(destination, '.github', 'hooks')));
    assert.ok(!existsSync(join(destination, '.github', 'prompts')));
    for (const name of ['BRIEF.md', 'REVIEW-FEEDBACK.md', 'PR-DESCRIPTION.md']) {
      assert.ok(readFileSync(join(destination, name)).equals(readFileSync(join(ROOT, 'fixtures', 'skills', name))));
    }
    assert.throws(() => installPublicSkills(destination), /existing customizations/);
    assert.match(readFileSync(join(destination, 'package.json'), 'utf8'), /check.mjs skills/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('tampered, missing, and extra upstream files fail verification explicitly', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-integrity-'));
  try {
    const copy = join(temp, 'snapshot');
    cpSync(VENDOR, copy, { recursive: true });
    const path = join(copy, 'skills', 'grilling', 'SKILL.md');
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

test('skills learner cannot pass by weakening tests or rewriting a skill', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-regression-'));
  try {
    const destination = seed('skills', join(temp, 'learner'), 'reference');
    const tests = join(destination, 'src', 'cart.test.mjs');
    writeFileSync(tests, "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { subtotal } from './cart.mjs';\n"
      + Array.from({ length: 4 }, (_, i) => `test('empty ${i}', () => assert.equal(subtotal([]), 0));`).join('\n'));
    assert.deepEqual(runChecks('skills', destination).failures, ['learner regressions catch the original bug']);
    writeFileSync(join(destination, '.github', 'skills', 'humanizer', 'SKILL.md'), 'Make it sound impressive.');
    assert.deepEqual(runChecks('skills', destination).failures,
      ['public API and scope are preserved', 'learner regressions catch the original bug']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('practice files can be edited without failing the independent check', () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-public-practice-'));
  try {
    const destination = seed('skills', join(temp, 'learner'), 'reference');
    writeFileSync(join(destination, 'PR-DESCRIPTION.md'), 'Fix cart quantity handling. npm test: 7/7.\n');
    writeFileSync(join(destination, 'REVIEW-FEEDBACK.md'), 'Accepted 1, pushed back on 2, deferred 3.\n');
    const result = runChecks('skills', destination);
    assert.equal(result.status, 0, result.output);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
