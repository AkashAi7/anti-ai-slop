import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Readable, Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { root, catalog, exercise, setup, reset, safePath, parseTap, verifyBaseline } from '../scripts/lab.mjs';
import { runDemo, describeCommands } from '../scripts/demo.mjs';
import { studioUrl, openerFor } from '../scripts/studio.mjs';

const first = catalog[0].id;

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), 'commands-lab-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('setup preserves learner work; reset requires exact scoped consent', (t) => {
  const base = temporary(t);
  const source = join(base, 'exercises', first, 'starter');
  mkdirSync(source, { recursive: true });
  writeFileSync(join(source, 'file.mjs'), 'original');
  const target = setup(first, base);
  writeFileSync(join(target, 'file.mjs'), 'learner');
  assert.throws(() => setup(first, base), /already exists/);
  assert.throws(() => reset(first, 'yes', base), /cancelled/);
  assert.equal(readFileSync(join(target, 'file.mjs'), 'utf8'), 'learner');
  reset(first, `reset ${first}`, base);
  assert.equal(readFileSync(join(target, 'file.mjs'), 'utf8'), 'original');
});

test('unknown IDs and paths outside the lab are rejected', () => {
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
  assert.throws(() => setup(first, base), /symbolic link/);
  assert.throws(() => reset(first, `reset ${first}`, base), /symbolic link/);
  assert.equal(readFileSync(join(external, 'keep.txt'), 'utf8'), 'preserve');
});

test('incomplete output and unexpected baseline failures are not success', () => {
  assert.throws(() => parseTap('ok 1 - nothing useful'), /Incomplete/);
  assert.throws(() => verifyBaseline(first, { status: 1, failed: 1, failures: ['wrong reason'], assertionFailures: 1 }), /mismatch/);
  assert.throws(() => verifyBaseline(first, { status: 0, failed: 0, failures: [], assertionFailures: 0 }), /mismatch/);
  const expected = catalog[0].expectedFailures;
  assert.throws(() => verifyBaseline(first, {
    status: 1, failed: expected.length, failures: expected, assertionFailures: 0,
  }), /mismatch/, 'A crash with the expected test names is not an intended failure.');
});

test('every exercise command resolves to the registry', () => {
  for (const item of catalog) {
    const text = describeCommands(item);
    for (const name of item.commands) assert.match(text, new RegExp(`/${name}\\b`));
    assert.match(text, /Lab commands are not built in\./, `${item.id}: the guide must say lab commands are not built in`);
  }
  assert.doesNotMatch(describeCommands({ commands: ['plan', 'clear'] }), /not built in/);
  assert.throws(() => describeCommands({ commands: ['not-a-command'] }), /not in commands\.json/);
});

async function guide(commands) {
  let text = '';
  const output = new Writable({ write(chunk, encoding, callback) { text += chunk.toString(); callback(); } });
  const status = await runDemo(Readable.from([commands]), output);
  return { status, text };
}

test('guide shows the command flow, a real prompt, and confirms the baseline', async () => {
  const item = catalog.find(({ id }) => id.startsWith('03-'));
  const result = await guide(`${item.id}\ncommands\nprompt\nbaseline\nback\nquit\n`);
  assert.equal(result.status, 0, result.text);
  assert.match(result.text, /Command flow for/);
  assert.ok(result.text.includes(item.prompt));
  assert.match(result.text, /Expected defective baseline confirmed/);
  assert.match(result.text, /No Copilot\/model response was simulated/);
});

test('guide handles invalid selection, unknown actions, cancellation, and EOF', async () => {
  const invalid = await guide(`not-an-id\n${first}\nbad-action\nreset\ncancel\nsolution\ncancel\n`);
  assert.equal(invalid.status, 1);
  assert.match(invalid.text, /Unknown exercise/);
  assert.match(invalid.text, /Unknown action/);
  assert.match(invalid.text, /Reset cancelled/);
  assert.match(invalid.text, /Solution reveal cancelled/);
  assert.equal((await guide('quit\n')).status, 0);
});

test('CLI reports bad arguments with a nonzero exit', () => {
  const check = spawnSync(process.execPath, ['scripts/check.mjs', first, '--bogus'], { cwd: root, encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Usage:/);
  const studio = spawnSync(process.execPath, ['scripts/studio.mjs', '--bogus'], { cwd: root, encoding: 'utf8' });
  assert.equal(studio.status, 1);
  assert.match(studio.stderr, /Usage:/);
});

test('studio opener only opens the local file URL', () => {
  const url = studioUrl();
  assert.match(url, /^file:\/\/\/.*studio\/index\.html$/);
  assert.throws(() => openerFor('https://example.com'), /non-file/);
  assert.equal(openerFor(url, 'darwin').command, 'open');
  assert.equal(openerFor(url, 'linux').command, 'xdg-open');
  assert.equal(openerFor(url, 'win32').verbatim, true);
  const printed = spawnSync(process.execPath, ['scripts/studio.mjs', '--print'], { cwd: root, encoding: 'utf8' });
  assert.equal(printed.status, 0);
  assert.ok(printed.stdout.includes(url));
});
