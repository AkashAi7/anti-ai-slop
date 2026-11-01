import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable, Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { root, exercise, setup, reset, safePath, parseTap, verifyBaseline } from '../scripts/lab.mjs';
import { runDemo } from '../scripts/demo.mjs';

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), 'anti-slop-lab-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('setup preserves user work; reset requires exact scoped consent', (t) => {
  const base = temporary(t);
  const source = join(base, 'exercises', '01-clarify', 'starter');
  mkdirSync(source, { recursive: true });
  writeFileSync(join(source, 'brief.json'), '{"original":true}');
  const target = setup('01-clarify', base);
  writeFileSync(join(target, 'brief.json'), '{"learner":true}');
  assert.throws(() => setup('01-clarify', base), /already exists/);
  assert.throws(() => reset('01-clarify', 'yes', base), /cancelled/);
  assert.equal(readFileSync(join(target, 'brief.json'), 'utf8'), '{"learner":true}');
  reset('01-clarify', 'reset 01-clarify', base);
  assert.equal(readFileSync(join(target, 'brief.json'), 'utf8'), '{"original":true}');
});

test('unknown IDs, paths outside the lab, and root deletion are rejected', () => {
  for (const id of ['../', '..\\', '', '99-nope']) assert.throws(() => exercise(id), /Unknown/);
  assert.throws(() => safePath(root), /unscoped/);
  assert.throws(() => safePath(root, '..', 'outside'), /unscoped/);
});

test('linked work roots cannot redirect reset or setup', (t) => {
  const base = temporary(t);
  const external = join(base, 'external');
  mkdirSync(external);
  writeFileSync(join(external, 'keep.txt'), 'preserve');
  const link = join(base, 'work');
  symlinkSync(external, link, process.platform === 'win32' ? 'junction' : 'dir');
  t.after(() => { if (existsSync(link)) rmSync(link); });
  assert.throws(() => setup('01-clarify', base), /symbolic link/);
  assert.throws(() => reset('01-clarify', 'reset 01-clarify', base), /symbolic link/);
  assert.equal(readFileSync(join(external, 'keep.txt'), 'utf8'), 'preserve');
});

test('incomplete test output and unexpected baseline failures are not success', () => {
  assert.throws(() => parseTap('ok 1 - nothing useful'), /Incomplete/);
  assert.throws(() => verifyBaseline('01-clarify', { status: 1, failed: 1, failures: ['wrong reason'] }), /mismatch/);
  assert.throws(() => verifyBaseline('01-clarify', { status: 0, failed: 0, failures: [] }), /mismatch/);
  assert.throws(() => verifyBaseline('01-clarify', {
    status: 1, failed: 1, failures: ['brief has an observable contract'], assertionFailures: 0,
  }), /mismatch/, 'A syntax/setup error with the expected test name is not an intended failure.');
});

async function guide(commands) {
  let text = '';
  const output = new Writable({ write(chunk, encoding, callback) { text += chunk.toString(); callback(); } });
  const status = await runDemo(Readable.from([commands]), output);
  return { status, text };
}

test('interactive guide selects an exercise, exposes a real prompt and confirms baseline', async () => {
  const result = await guide('03-honest-tests\nprompt\nbaseline\nback\nquit\n');
  assert.equal(result.status, 0);
  assert.match(result.text, /\/test-driven-development/);
  assert.match(result.text, /Expected defective baseline confirmed/);
  assert.match(result.text, /No Copilot\/model response was simulated/);
});

test('guide handles invalid selection, unknown actions, reset cancellation and EOF', async () => {
  const invalid = await guide('not-an-id\n01-clarify\nbad-action\nreset\ncancel\nsolution\ncancel\n');
  assert.equal(invalid.status, 1);
  assert.match(invalid.text, /Unknown exercise/);
  assert.match(invalid.text, /Unknown action/);
  assert.match(invalid.text, /Reset cancelled/);
  assert.match(invalid.text, /Solution reveal cancelled/);
  assert.equal((await guide('quit\n')).status, 0);
});

test('CLI reports bad arguments with a nonzero exit', () => {
  const result = spawnSync(process.execPath, ['scripts/check.mjs', '01-clarify', '--bogus'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
