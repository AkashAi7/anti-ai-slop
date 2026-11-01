import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const catalog = JSON.parse(readFileSync(join(root, 'exercises', 'catalog.json'), 'utf8'));

export function exercise(id) {
  const found = catalog.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown exercise "${id}". Choose an ID from npm run demo.`);
  return found;
}

export function safePath(base, ...parts) {
  const destination = resolve(base, ...parts);
  const rel = relative(resolve(base), destination);
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || resolve(base) === destination) {
    throw new Error('Refusing an unscoped path.');
  }
  if (rel.includes(':')) throw new Error('Refusing a path outside the lab.');
  let cursor = resolve(base);
  for (const part of [null, ...rel.split(sep)]) {
    if (part !== null) cursor = join(cursor, part);
    if (lstatSync(cursor, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error(`Refusing a symbolic link or junction: ${cursor}`);
    }
  }
  return destination;
}

function assertPlainTree(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing linked content: ${path}`);
    if (entry.isDirectory()) assertPlainTree(path);
  }
}

export function setup(id, base = root) {
  exercise(id);
  const source = safePath(base, 'exercises', id, 'starter');
  const destination = safePath(base, 'work', id);
  if (existsSync(destination)) throw new Error(`Learner copy already exists: work/${id}. Nothing overwritten.`);
  assertPlainTree(source);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, errorOnExist: true, force: false });
  return destination;
}

export function reset(id, confirmation, base = root) {
  exercise(id);
  if (confirmation !== `reset ${id}`) throw new Error('Reset cancelled: confirmation did not match.');
  const destination = safePath(base, 'work', id);
  if (!existsSync(destination)) throw new Error(`No learner copy exists for ${id}.`);
  assertPlainTree(destination);
  rmSync(destination, { recursive: true });
  return setup(id, base);
}

export function parseTap(stdout) {
  const number = (label) => {
    const match = stdout.match(new RegExp(`^# ${label} (\\d+)\\r?$`, 'm'));
    if (!match) throw new Error(`Incomplete test output: missing ${label}.`);
    return Number(match[1]);
  };
  return {
    total: number('tests'), passed: number('pass'), failed: number('fail'),
    skipped: number('skipped'), cancelled: number('cancelled'), todo: number('todo'),
    failures: [...stdout.matchAll(/^not ok \d+ - (.+)\r?$/gm)].map((match) => match[1].trim()),
    assertionFailures: [...stdout.matchAll(/^ {2}code: 'ERR_ASSERTION'\r?$/gm)].length,
  };
}

export function runChecks(id, target = 'work') {
  const item = exercise(id);
  if (!['starter', 'solution', 'work'].includes(target)) throw new Error('Invalid check target.');
  const directory = target === 'work' ? safePath(root, 'work', id) : safePath(root, 'exercises', id, target);
  if (!existsSync(directory)) throw new Error(`Missing ${target} for ${id}. Run npm run setup -- ${id}.`);
  const env = { ...process.env, LAB_EXERCISE: id, LAB_TARGET: target };
  // Each fixture needs a new runner, not the parent node:test worker context.
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'scripts/runner.mjs'], {
    cwd: root, encoding: 'utf8', timeout: 30000,
    env,
  });
  if (result.error) throw new Error(`Test process failed: ${result.error.message}`);
  if (result.signal || result.status === null) throw new Error(`Test process terminated: ${result.signal}`);
  if (result.stderr.trim()) throw new Error(`Test process stderr:\n${result.stderr}`);
  const summary = parseTap(result.stdout);
  if (summary.total !== item.testCount || summary.skipped || summary.todo || summary.cancelled) {
    throw new Error(`Incomplete checks for ${id}: ${JSON.stringify(summary)}`);
  }
  if (summary.passed + summary.failed !== summary.total || (result.status === 0) !== (summary.failed === 0)) {
    throw new Error(`Inconsistent test result for ${id}.`);
  }
  return { ...summary, status: result.status, output: result.stdout };
}

export function verifyBaseline(id, result) {
  const expected = [...exercise(id).expectedFailures].sort();
  const actual = [...result.failures].sort();
  if (result.status !== 1 || result.failed !== expected.length || result.assertionFailures !== expected.length
      || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Baseline mismatch for ${id}; expected ${expected.join(', ')}; got ${actual.join(', ')}.`);
  }
}

export function isMain(url) {
  return process.argv[1] && fileURLToPath(url) === resolve(process.argv[1]);
}
