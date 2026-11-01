import assert from 'node:assert/strict';
import { call, load, mutationSuite, quiet, readText, runSuite, sameBytes, stripComments, testCount } from '../../scripts/check-helpers.mjs';

async function loadSlugify(ctx) {
  const { value: mod } = await quiet(() => load(ctx, 'slugify.mjs'));
  assert.equal(typeof mod.slugify, 'function', 'slugify.mjs must export slugify.');
  return mod.slugify;
}

function code(ctx, name) {
  return stripComments(readText(ctx, name));
}

function withoutStrings(source) {
  return source.replace(/(['"`])(?:\\.|(?!\1)[^\\])*?\1/g, "''");
}

function thrown(fn) {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
}

function suite(fn) {
  try {
    return fn();
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error;
    assert.fail(`Could not run the learner tests: ${error?.message ?? error}`);
  }
}

function importedFrom(source, specifier) {
  const names = [];
  for (const match of source.matchAll(/\bimport\s*\{([^}]*)\}\s*from\s*(['"])(.*?)\2/g)) {
    if (match[3] !== specifier) continue;
    for (const part of match[1].split(',')) names.push(part.trim().split(/\s+as\s+/)[0].trim());
  }
  return names;
}

export const checks = [
  ['slugify behavior is preserved', async (ctx) => {
    const slugify = await loadSlugify(ctx);
    await quiet(() => {
      assert.equal(call(slugify, 'H\u00e9llo   W\u00f6rld!'), 'hello-world');
      assert.equal(call(slugify, '  Already-slugged  '), 'already-slugged');
    });
  }],
  ['no debug output', async (ctx) => {
    const slugify = await loadSlugify(ctx);
    const { lines } = await quiet(() => call(slugify, 'A b'));
    assert.deepEqual(lines, [], 'slugify must not write to the console.');
    assert.doesNotMatch(code(ctx, 'slugify.mjs'), /\bconsole\s*\.|\bprocess\s*\.\s*std(?:out|err)\b/,
      'Remove debug output from slugify.mjs.');
  }],
  ['errors are not swallowed', async (ctx) => {
    const slugify = await loadSlugify(ctx);
    for (const input of [42, null, undefined]) {
      const { value: error } = await quiet(() => thrown(() => slugify(input)));
      assert.ok(error instanceof TypeError, `slugify(${String(input)}) must throw a TypeError instead of returning a value.`);
    }
    assert.doesNotMatch(code(ctx, 'slugify.mjs'), /catch\s*(\([^)]*\))?\s*\{\s*\}/, 'slugify.mjs still has an empty catch block.');
  }],
  ['shared helper is reused', async (ctx) => {
    const source = code(ctx, 'slugify.mjs');
    const imported = importedFrom(source, './text.mjs');
    for (const name of ['collapseWhitespace', 'stripAccents']) {
      assert.ok(imported.includes(name), `Import ${name} from './text.mjs' instead of keeping a local copy.`);
    }
    const bare = withoutStrings(source);
    const functions = [...bare.matchAll(/\bfunction\b\s*\*?\s*([\w$]*)/g)].map((match) => match[1] || '<anonymous>');
    assert.deepEqual(functions, ['slugify'], `slugify.mjs must declare only slugify; found ${functions.join(', ')}.`);
    assert.doesNotMatch(bare, /\b(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/,
      'Do not keep the duplicate helper as an arrow function.');
    assert.doesNotMatch(source, /\\s[+*]/, 'Whitespace collapsing is still hand-rolled; call collapseWhitespace.');
    sameBytes(ctx, 'text.mjs');
  }],
  ['learner tests assert real behavior', async (ctx) => {
    const source = code(ctx, 'slugify.test.mjs');
    assert.doesNotMatch(source, /\bassert(?:\.ok)?\s*\(\s*(?:true|1|!0|!!1)\s*[,)]/,
      'Replace assert.ok(true) with assertions on what slugify returns or throws.');
    assert.ok(testCount(source) >= 3, 'Write at least 3 tests in slugify.test.mjs.');
    const result = suite(() => runSuite(ctx.directory, 'slugify.test.mjs'));
    assert.equal(result.failed, 0, `slugify.test.mjs has failing tests: ${result.failures.join(', ')}.`);
    assert.equal(result.status, 0, 'node --test slugify.test.mjs must exit 0.');
    assert.ok(result.total >= 3, 'slugify.test.mjs must run at least 3 tests.');
  }],
  ['learner tests catch the original', async (ctx) => {
    readText(ctx, 'slugify.test.mjs');
    const result = suite(() => mutationSuite(ctx, 'slugify.test.mjs'));
    assert.ok(result.failed >= 1, 'Your tests also pass on the original slugify.mjs; add a test that fails on it.');
    assert.ok(result.passed >= 1, 'Your tests fail entirely on the original; keep tests for the behavior that was already correct.');
  }],
];
