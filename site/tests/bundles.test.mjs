import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { unzipSync } from 'fflate';
import { bundles, LAB_BUNDLE, GIF_BUNDLE, SKILLS_BUNDLE } from '../scripts/bundles.mjs';
import { publicSkillNames, verifyPublicSkills } from '../../lab/scripts/public-skills.mjs';
import { ROOT } from '../scripts/lib/util.mjs';

test('downloads are deterministic and contain no learner work or installed dependencies', () => {
  const first = bundles();
  const second = bundles();
  for (const [path, bytes] of first) {
    assert.ok(bytes.equals(second.get(path)), 'Bundle changed without a source change.');
    const entries = unzipSync(bytes);
    for (const name of Object.keys(entries)) {
      assert.ok(!/(^|\/)(work|node_modules|\.git)(\/|$)/.test(name), `Private/generated content in ${name}`);
      assert.ok(!name.includes('..'));
    }
  }
  const lab = unzipSync(first.get(LAB_BUNDLE));
  for (const name of ['package.json', 'scripts/setup.mjs', 'scripts/acceptance.mjs', 'fixtures/common/AGENTS.md']) {
    assert.ok(lab[`anti-slop-lab/${name}`], `${name} missing from standalone lab.`);
  }
  const gifs = unzipSync(first.get(GIF_BUNDLE));
  const scenes = JSON.parse(readFileSync(join(ROOT, 'lab', 'walkthroughs.json'), 'utf8'));
  assert.equal(Object.keys(gifs).filter((name) => name.endsWith('.gif')).length, scenes.length);
  for (const { id } of scenes) {
    assert.ok(gifs[`anti-slop-walkthroughs/assets/gifs/${id}.gif`]);
    assert.ok(gifs[`anti-slop-walkthroughs/assets/transcripts/${id}.md`]);
  }
  const skills = unzipSync(first.get(SKILLS_BUNDLE));
  for (const name of publicSkillNames) {
    assert.ok(skills[`anti-slop-public-skills/.github/skills/${name}/SKILL.md`]);
  }
  assert.ok(skills['anti-slop-public-skills/.github/skills-manifest.json']);
  assert.ok(skills['anti-slop-public-skills/.github/skill-licenses/obra-superpowers-LICENSE']);
  assert.ok(skills['anti-slop-public-skills/.github/skill-licenses/mattpocock-skills-LICENSE']);
  assert.ok(skills['anti-slop-public-skills/.github/skills/systematic-debugging/root-cause-tracing.md']);
  const manifest = JSON.parse(readFileSync(join(ROOT, 'lab', 'vendor', 'skill-pack', 'skills-manifest.json'), 'utf8'));
  for (const [name, sha256] of Object.entries(manifest.files)) {
    const bytes = skills[`anti-slop-public-skills/.github/${name}`];
    assert.ok(bytes, `Skills-only download omitted upstream support file: ${name}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, `Skills-only download changed ${name}`);
  }
});

for (const id of ['builtins', 'skills']) test(`extracted lab: ${id} setup, baseline, refusal and verified repair`, () => {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-zip-test-'));
  try {
    for (const [name, bytes] of Object.entries(unzipSync(bundles().get(LAB_BUNDLE)))) {
      const path = resolve(temp, ...name.split('/'));
      assert.ok(path.startsWith(temp + sep));
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, bytes);
    }
    const directory = join(temp, 'anti-slop-lab');
    const setup = spawnSync(process.execPath, ['scripts/setup.mjs', id], {
      cwd: directory, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(setup.status, 0, setup.stderr || setup.stdout);
    assert.match(setup.stdout, /Baseline: 3\/7 pass, 4 expected failures/);
    const check = spawnSync(process.execPath, ['scripts/check.mjs', id, '--baseline'], {
      cwd: directory, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(check.status, 0, check.stderr || check.stdout);
    assert.match(check.stdout, /BASELINE CONFIRMED: 3\/7/);
    const repeated = spawnSync(process.execPath, ['scripts/setup.mjs', id], {
      cwd: directory, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(repeated.status, 1);
    assert.match(repeated.stderr, /Nothing overwritten/);
    const learner = join(directory, 'work', id);
    if (id === 'skills') {
      assert.equal(verifyPublicSkills(join(learner, '.github')), 29);
      const discovery = spawnSync(process.execPath, ['scripts/skills.mjs'], { cwd: directory, encoding: 'utf8' });
      assert.equal(discovery.status, 0, discovery.stderr);
      assert.match(discovery.stdout, /VERIFIED: 10 upstream skills/);
      assert.match(discovery.stdout, /No model invocation was tested/);
    }
    const before = spawnSync(process.execPath, ['scripts/check.mjs', id], { cwd: directory, encoding: 'utf8' });
    assert.equal(before.status, 1, 'Defective starter must not report success.');
    cpSync(join(directory, 'fixtures', 'builtins', 'reference', 'src'), join(learner, 'src'), { recursive: true });
    const repaired = spawnSync(process.execPath, ['scripts/check.mjs', id], { cwd: directory, encoding: 'utf8' });
    assert.equal(repaired.status, 0, repaired.stderr || repaired.stdout);
    assert.match(repaired.stdout, /VERIFIED: 7\/7/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
