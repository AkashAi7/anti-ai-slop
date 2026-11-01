import assert from 'node:assert/strict';
import { call, load, readText, sameBytes, stripComments } from '../../scripts/check-helpers.mjs';

const INVOICE = { id: 'INV-1', issued: '2026-01-15', amountCents: 123450 };

function source(ctx) {
  return stripComments(readText(ctx, 'invoice.mjs'));
}

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

async function buildInvoice(ctx) {
  const module = await load(ctx, 'invoice.mjs');
  assert.equal(typeof module.buildInvoice, 'function', 'invoice.mjs must export buildInvoice.');
  return module.buildInvoice;
}

export const checks = [
  ['invoice uses the repo helpers', (ctx) => {
    const code = source(ctx);
    const dates = namedImports(code, './lib/dates.mjs');
    const money = namedImports(code, './lib/money.mjs');
    for (const name of ['addDays', 'formatDate']) {
      assert.ok(dates.has(name), `Import { ${name} } from './lib/dates.mjs' by name.`);
    }
    assert.ok(money.has('formatMoney'), "Import { formatMoney } from './lib/money.mjs' by name.");
    for (const name of ['addDays', 'formatDate', 'formatMoney']) {
      assert.match(code, new RegExp(`\\b${name}\\s*\\(`), `invoice.mjs imports ${name} but never calls it.`);
    }
  }],
  ['no hand-rolled date or money code', (ctx) => {
    const code = source(ctx);
    const banned = ['toISODate', 'toFixed(', 'getMonth(', 'getDate(', 'setDate(', 'padStart(', 'paymentTermsDays'];
    const found = banned.filter((token) => code.includes(token));
    assert.deepEqual(found, [], `Remove invented or hand-rolled code: ${found.join(', ')}`);
  }],
  ['due date comes from config', async (ctx) => {
    const build = await buildInvoice(ctx);
    assert.equal(call(build, INVOICE)?.due, '2026-02-14', 'Due date is issued + config.invoice.dueInDays (30).');
    assert.equal(call(build, { ...INVOICE, issued: '2026-12-15' })?.due, '2027-01-14', 'Due date must roll over the year.');
    assert.match(source(ctx), /\bdueInDays\b/, 'Read invoice.dueInDays from config.json instead of hard-coding it.');
  }],
  ['amount uses formatMoney', async (ctx) => {
    const build = await buildInvoice(ctx);
    assert.equal(call(build, INVOICE)?.amount, '$1,234.50');
    assert.equal(call(build, { ...INVOICE, amountCents: 5 })?.amount, '$0.05');
    assert.equal(call(build, { ...INVOICE, amountCents: 100000000 })?.amount, '$1,000,000.00');
  }],
  ['lib and config are unchanged', (ctx) => {
    for (const name of ['lib/dates.mjs', 'lib/money.mjs', 'config.json']) sameBytes(ctx, name);
  }],
];
