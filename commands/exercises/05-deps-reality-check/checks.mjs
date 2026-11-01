import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { call, load, readText, sameBytes, stripComments } from '../../scripts/check-helpers.mjs';

const RUNTIME_FIELDS = ['dependencies', 'optionalDependencies', 'peerDependencies', 'bundleDependencies', 'bundledDependencies'];
const SETTINGS = { name: 'billing', port: 3000, debug: false };

function manifest(ctx) {
  if (!ctx.exists('package.json')) assert.fail('Missing package.json.');
  try {
    return ctx.json('package.json');
  } catch (error) {
    assert.fail(`package.json is not valid JSON: ${error.message}`);
  }
}

function pathOf(ctx, name) {
  try {
    return ctx.path(name);
  } catch (error) {
    assert.fail(`Cannot resolve ${name}: ${error.message}`);
  }
}

function specifiers(source) {
  const code = stripComments(source);
  const found = [];
  const literal = [
    /(?:^|[;\s}])import\s*(?:[\w$*\s{},]+?\s*from\s*)?(['"])(.*?)\1/g,
    /(?:^|[;\s}])export\s*[\w$*\s{},]+?\s*from\s*(['"])(.*?)\1/g,
    /\bimport\s*\(\s*(['"`])(.*?)\1/g,
    /\brequire\s*\(\s*(['"`])(.*?)\1/g,
  ];
  for (const pattern of literal) {
    for (const match of code.matchAll(pattern)) found.push(match[2]);
  }
  if (/\b(?:import|require)\s*\(\s*(?!['"`])/.test(code)) found.push('<computed specifier>');
  return found;
}

async function settingsModule(ctx) {
  const mod = await load(ctx, 'settings.mjs');
  assert.equal(typeof mod.loadSettings, 'function', 'settings.mjs must export loadSettings.');
  assert.equal(typeof mod.label, 'function', 'settings.mjs must export label.');
  return mod;
}

export const checks = [
  ['no runtime dependencies', async (ctx) => {
    const pkg = manifest(ctx);
    for (const field of RUNTIME_FIELDS) {
      const value = pkg[field];
      const names = value && typeof value === 'object' ? Object.keys(value) : value ? [String(value)] : [];
      assert.deepEqual(names, [], `package.json "${field}" must be empty: this project uses the Node.js standard library only (found ${names.join(', ')}).`);
    }
  }],
  ['only node: and relative imports', async (ctx) => {
    const found = specifiers(readText(ctx, 'settings.mjs'));
    const rejected = found.filter((name) => !/^(?:node:|\.\/|\.\.\/)/.test(name));
    assert.deepEqual(rejected, [], `settings.mjs may import only node: built-ins and relative files; remove ${rejected.join(', ')}.`);
  }],
  ['settings load with defaults', async (ctx) => {
    const { loadSettings, label } = await settingsModule(ctx);
    const settings = call(loadSettings, pathOf(ctx, 'settings.json'));
    assert.deepEqual(settings, SETTINGS, 'loadSettings(settings.json) must return { name, port, debug } with debug defaulting to false.');
    assert.deepEqual(call(loadSettings), SETTINGS, 'loadSettings() must default to the settings.json next to settings.mjs.');
    assert.equal(call(label, settings), '    billing:3000', 'label() must right-align "name:port" to 16 characters.');
  }],
  ['invalid ports are rejected', async (ctx) => {
    const { loadSettings } = await settingsModule(ctx);
    let directory;
    try {
      directory = mkdtempSync(join(tmpdir(), 'commands-lab-05-'));
    } catch (error) {
      assert.fail(`Could not create a temp directory: ${error.message}`);
    }
    try {
      let count = 0;
      const write = (settings) => {
        const file = join(directory, `settings-${count++}.json`);
        try {
          writeFileSync(file, JSON.stringify(settings));
        } catch (error) {
          assert.fail(`Could not write a temp settings file: ${error.message}`);
        }
        return file;
      };
      for (const port of [70000, '80', 0, 3000.5, -1, null, undefined]) {
        const file = write({ name: 'billing', port });
        let error;
        try {
          loadSettings(file);
        } catch (caught) {
          error = caught;
        }
        assert.ok(error instanceof Error, `port ${JSON.stringify(port)} must be rejected with an Error.`);
        assert.match(String(error.message), /port/i, `The error for port ${JSON.stringify(port)} must mention "port".`);
      }
      for (const port of [1, 65535]) {
        assert.equal(call(loadSettings, write({ name: 'billing', port })).port, port, `port ${port} is valid and must be accepted.`);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }],
  ['settings.json is unchanged', async (ctx) => sameBytes(ctx, 'settings.json')],
];
