import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installPublicSkills } from './public-skills.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const catalog = JSON.parse(readFileSync(join(ROOT, 'catalog.json'), 'utf8'));
export const specifyVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).config.specifyVersion;

export function track(id) {
  const baseId = id === 'spec-kit-skills' ? 'spec-kit' : id;
  const item = catalog.tracks.find((entry) => entry.id === baseId);
  if (!item) throw new Error(`Unknown track "${id}". Use builtins, spec-kit, spec-kit-skills, or skills.`);
  return { ...item, fixture: item.fixture ?? item.id, workspaceId: id };
}

export function plainPath(base, ...parts) {
  const path = resolve(base, ...parts);
  const rel = relative(resolve(base), path);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || rel.includes(':')) {
    throw new Error('Refusing a path outside the named lab directory.');
  }
  let cursor = resolve(base);
  for (const part of [null, ...rel.split(sep)]) {
    if (part !== null) cursor = join(cursor, part);
    if (lstatSync(cursor, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error(`Refusing a symbolic link or junction: ${cursor}`);
    }
  }
  return path;
}

export function workspace(id) {
  track(id);
  return plainPath(ROOT, 'work', id);
}

export function seed(id, destination, target = 'starter', existing = false) {
  const item = track(id);
  if (!['starter', 'reference'].includes(target)) throw new Error('Invalid fixture target.');
  if (existsSync(destination) && !existing) throw new Error(`Workspace already exists: ${destination}. Nothing overwritten.`);
  mkdirSync(destination, { recursive: true });
  const copy = (source, overwrite = false) => {
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`Refusing linked fixture: ${entry.name}`);
      cpSync(join(source, entry.name), join(destination, entry.name), {
        recursive: true, force: overwrite, errorOnExist: !overwrite,
      });
    }
  };
  copy(join(ROOT, 'fixtures', item.fixture, 'starter'));
  copy(join(ROOT, 'fixtures', 'common'));
  if (target === 'reference') copy(join(ROOT, 'fixtures', item.fixture, 'reference'), true);
  if (id === 'skills') {
    installPublicSkills(destination);
    const path = join(destination, 'package.json');
    const pkg = JSON.parse(readFileSync(path, 'utf8'));
    pkg.scripts.check = 'node ../../scripts/check.mjs skills';
    writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
    // The skills lab reuses the cart starter, with its own brief and practice files for the extra skills.
    copy(join(ROOT, 'fixtures', 'skills'), true);
  }
  return destination;
}

export function parseTap(output) {
  const count = (label) => {
    const match = output.match(new RegExp(`^# ${label} (\\d+)\\r?$`, 'm'));
    if (!match) throw new Error(`Incomplete test output: missing ${label}.`);
    return Number(match[1]);
  };
  return {
    total: count('tests'), passed: count('pass'), failed: count('fail'),
    skipped: count('skipped'), cancelled: count('cancelled'), todo: count('todo'),
    failures: [...output.matchAll(/^not ok \d+ - (.+)\r?$/gm)].map((match) => match[1].trim()),
    assertionFailures: [...output.matchAll(/^ {2}code: 'ERR_ASSERTION'\r?$/gm)].length,
  };
}

export function runNodeTests(directory, file, extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], {
    cwd: directory, env, encoding: 'utf8', timeout: 60000,
  });
  if (result.error) throw new Error(`Could not run tests: ${result.error.message}`);
  if (result.signal || result.status === null) throw new Error(`Tests terminated: ${result.signal}`);
  if (result.stderr.trim()) throw new Error(`Test process stderr:\n${result.stderr}`);
  const summary = parseTap(result.stdout);
  if (summary.skipped || summary.cancelled || summary.todo
    || summary.passed + summary.failed !== summary.total
    || (result.status === 0) !== (summary.failed === 0)) {
    throw new Error(`Incomplete or inconsistent test run: ${JSON.stringify(summary)}`);
  }
  return { ...summary, status: result.status, output: result.stdout };
}

export function runChecks(id, directory = workspace(id)) {
  const item = track(id);
  if (!existsSync(directory)) throw new Error(`Missing workspace. Run npm run setup -- ${id}.`);
  const result = runNodeTests(ROOT, join(ROOT, 'scripts', 'acceptance.mjs'), {
    PRACTICE_TRACK: item.id, PRACTICE_DIRECTORY: resolve(directory),
  });
  if (result.total !== item.testCount) throw new Error(`Expected ${item.testCount} acceptance checks, got ${result.total}.`);
  return result;
}

export function verifyBaseline(id, result) {
  const expected = [...track(id).expectedFailures].sort();
  if (result.status !== 1 || result.assertionFailures !== expected.length
    || JSON.stringify([...result.failures].sort()) !== JSON.stringify(expected)) {
    throw new Error(`Baseline mismatch. Expected: ${expected.join('; ')}. Observed: ${result.failures.join('; ')}.`);
  }
}

export function originalSuite(id, directory, testName) {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-regression-'));
  try {
    const src = plainPath(directory, 'src');
    for (const entry of readdirSync(src, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || entry.isDirectory()) throw new Error('Regression tests must use plain files under src.');
    }
    cpSync(src, join(temp, 'src'), { recursive: true });
    const moduleName = track(id).fixture === 'builtins' ? 'cart.mjs' : 'discount.mjs';
    cpSync(join(ROOT, 'fixtures', track(id).fixture, 'starter', 'src', moduleName), join(temp, 'src', moduleName));
    return runNodeTests(temp, join(temp, 'src', testName));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export function fixtureChecks(id, target) {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-fixture-'));
  try {
    seed(id, join(temp, 'workspace'), target);
    return runChecks(id, join(temp, 'workspace'));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export function validateSpecKit(directory, skills = false) {
  for (const step of catalog.specKitSteps) {
    const name = skills
      ? join('.github', 'skills', `speckit-${step}`, 'SKILL.md')
      : join('.github', 'prompts', `speckit.${step}.prompt.md`);
    const file = plainPath(directory, name);
    if (!existsSync(file)) throw new Error(`Spec Kit did not install ${name}. Do not substitute a homemade prompt.`);
    if (!/^---\r?\n[\s\S]+?\r?\n---/.test(readFileSync(file, 'utf8'))) {
      throw new Error(`Invalid frontmatter in installed ${name}.`);
    }
  }
  return catalog.specKitSteps.length;
}

export function command(name, args, directory) {
  const result = spawnSync(name, args, { cwd: directory, encoding: 'utf8', timeout: 180000 });
  if (result.error) throw new Error(`Could not run ${name}: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${name} exited ${result.status ?? result.signal}.\n${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}
