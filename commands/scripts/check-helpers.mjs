import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { parseTap } from './lab.mjs';

// Every failure a learner can trigger must surface as an AssertionError so the
// baseline check can tell "defect detected" apart from "checker crashed".
export async function load(ctx, name) {
  if (!ctx.exists(name)) assert.fail(`Missing ${name}.`);
  try {
    return await ctx.module(name);
  } catch (error) {
    assert.fail(`Could not load ${name}: ${error?.message ?? error}`);
  }
}

export function call(fn, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    assert.fail(`Unexpected ${error?.name ?? 'error'}: ${error?.message ?? error}`);
  }
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function readText(ctx, name) {
  if (!ctx.exists(name)) assert.fail(`Missing ${name}.`);
  return ctx.text(name);
}

export function sections(markdown) {
  const found = new Map();
  let current;
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      found.set(current, '');
    } else if (current !== undefined) {
      found.set(current, `${found.get(current)}${line}\n`);
    }
  }
  for (const [key, value] of found) found.set(key, value.trim());
  return found;
}

export async function quiet(fn) {
  const names = ['log', 'info', 'debug', 'warn', 'error'];
  const saved = names.map((name) => console[name]);
  const lines = [];
  for (const name of names) console[name] = (...args) => lines.push(args.map(String).join(' '));
  try {
    const value = await fn();
    return { value, lines };
  } finally {
    names.forEach((name, index) => { console[name] = saved[index]; });
  }
}

function listFiles(directory, base = directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path, base));
    else if (entry.isFile()) files.push(relative(base, path));
  }
  return files;
}

export function runSuite(cwd, file) {
  if (!existsSync(join(cwd, file))) assert.fail(`Missing test file ${file}.`);
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], {
    cwd, encoding: 'utf8', timeout: 20000, env,
  });
  if (result.error) assert.fail(`Could not run ${file}: ${result.error.message}`);
  let summary;
  try {
    summary = parseTap(result.stdout);
  } catch (error) {
    assert.fail(`${file} did not produce a test summary: ${error.message}`);
  }
  return { ...summary, status: result.status, stdout: result.stdout };
}

// Runs the learner's test file against the ORIGINAL starter implementation.
// A useful regression test must fail there and pass on the fixed code.
export function mutationSuite(ctx, testFile) {
  const temp = mkdtempSync(join(tmpdir(), 'commands-lab-'));
  try {
    cpSync(ctx.directory, temp, { recursive: true });
    for (const name of listFiles(ctx.originalDir)) {
      if (name !== testFile) cpSync(join(ctx.originalDir, name), join(temp, name));
    }
    return runSuite(temp, testFile);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export function testCount(source) {
  return [...source.matchAll(/\b(?:test|it)\s*\(\s*(['"`])/g)].length;
}

export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

export function sameBytes(ctx, name) {
  if (!ctx.exists(name)) assert.fail(`${name} was deleted or moved.`);
  assert.equal(sha256(readFileSync(ctx.path(name))), sha256(ctx.original(name)), `${name} must stay byte-identical.`);
}
