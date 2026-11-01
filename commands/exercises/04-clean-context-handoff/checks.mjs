import assert from 'node:assert/strict';
import { call, load, readText, sections, stripComments } from '../../scripts/check-helpers.mjs';

const SECTIONS = ['goal', 'state', 'decisions', 'evidence', 'open questions', 'next steps'];
const PLACEHOLDERS = [
  ['TBD, TODO, or FIXME', /\b(?:TBD|TODO|FIXME)\b/],
  ['lorem ipsum', /lorem/i],
  ['"..."', /\.\.\.|\u2026/],
  ['an angle-bracket placeholder', /<[a-z][^>]*>/i],
];

function namedImports(code, specifier) {
  const names = new Set();
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\bimport\\s*\\{([^}]*)\\}\\s*from\\s*(['"])${escaped}\\2`, 'g');
  for (const match of code.matchAll(pattern)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }
  return names;
}

async function buildReport(ctx) {
  const module = await load(ctx, 'report.mjs');
  assert.equal(typeof module.buildReport, 'function', 'report.mjs must export buildReport.');
  return module.buildReport;
}

function citedPathExists(ctx, path) {
  if (path.startsWith('/') || path.split('/').includes('..')) {
    assert.fail(`HANDOFF.md cites ${path}; use a path relative to the work folder or the lab root, without "..".`);
  }
  try {
    return ctx.exists(path) || ctx.rootExists(path);
  } catch (error) {
    assert.fail(`HANDOFF.md cites ${path}, which cannot be checked: ${error?.message ?? error}`);
  }
}

export const checks = [
  ['simple rows export', async (ctx) => {
    const build = await buildReport(ctx);
    assert.equal(call(build, [{ name: 'Ada', qty: 2, note: 'ok' }]), 'name,qty,note\nAda,2,ok');
  }],
  ['commas, quotes, and newlines are escaped', async (ctx) => {
    const build = await buildReport(ctx);
    const rows = [{ name: 'Lovelace, Ada', qty: 1, note: 'said "hi"\nthen left' }];
    assert.equal(call(build, rows), 'name,qty,note\n"Lovelace, Ada",1,"said ""hi""\nthen left"');
  }],
  ['report reuses toCsvRow', async (ctx) => {
    const code = stripComments(readText(ctx, 'report.mjs'));
    assert.ok(namedImports(code, './csv.mjs').has('toCsvRow'), "report.mjs must import { toCsvRow } from './csv.mjs'.");
    assert.match(code, /\btoCsvRow\s*\(/, 'report.mjs imports toCsvRow but never calls it.');
    assert.doesNotMatch(code, /'"'|`"`|"\\""/, 'report.mjs must not quote fields inline; toCsvRow does that.');
    const { toCsvRow } = await load(ctx, 'csv.mjs');
    assert.equal(typeof toCsvRow, 'function', 'csv.mjs must export toCsvRow.');
    assert.equal(call(toCsvRow, ['a,b', 1]), '"a,b",1');
  }],
  ['HANDOFF.md has every section', (ctx) => {
    const found = sections(readText(ctx, 'HANDOFF.md'));
    const missing = SECTIONS.filter((name) => !found.get(name));
    assert.ok(missing.length === 0, `HANDOFF.md needs non-empty "## " sections: ${missing.join(', ')}.`);
  }],
  ['HANDOFF.md is concise and grounded', (ctx) => {
    const text = readText(ctx, 'HANDOFF.md');
    const lines = text.trimEnd().split(/\r?\n/).length;
    assert.ok(lines <= 60, `HANDOFF.md has ${lines} lines; keep it to 60 or fewer.`);
    for (const [label, pattern] of PLACEHOLDERS) {
      assert.doesNotMatch(text, pattern, `HANDOFF.md still contains ${label}.`);
    }
    const paths = [...new Set([...text.matchAll(/`([\w./-]+\.(?:mjs|js|json|md))`/g)].map((match) => match[1]))];
    assert.ok(paths.length >= 2, `Cite at least two file paths in backticks; found ${paths.length}.`);
    for (const path of paths) {
      assert.ok(citedPathExists(ctx, path), `HANDOFF.md cites ${path}, which does not exist.`);
    }
  }],
];
