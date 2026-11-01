import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { ROOT, originalSuite, plainPath, runNodeTests, track } from './lab.mjs';
import { verifyPublicSkills } from './public-skills.mjs';

const id = process.env.PRACTICE_TRACK;
const item = track(id);
const directory = process.env.PRACTICE_DIRECTORY;
if (!directory) throw new Error('Acceptance tests require PRACTICE_DIRECTORY; use npm run check.');
const text = (name) => readFileSync(plainPath(directory, name), 'utf8');
const load = (name) => import(pathToFileURL(plainPath(directory, 'src', name)).href);
const fails = (fn) => assert.throws(fn, (error) => error instanceof TypeError || error instanceof RangeError);
const unchanged = (name) => assert.equal(text(name),
  readFileSync(join(ROOT, 'fixtures', item.fixture, 'starter', name), 'utf8'), `${name} must stay unchanged.`);

function regressions(moduleName) {
  const name = `${moduleName}.test.mjs`;
  assert.ok(readdirSync(plainPath(directory, 'src')).includes(name), `Create src/${name} with /tests or the approved implementation task.`);
  const current = runNodeTests(directory, plainPath(directory, 'src', name));
  assert.equal(current.status, 0, 'Learner tests must pass on the repaired code.');
  assert.ok(current.total >= 4, 'Add at least four real tests.');
  const original = originalSuite(id, directory, name);
  assert.ok(original.failed >= 1, 'Your tests also pass on the starter: they do not detect the bug.');
  assert.ok(original.passed >= 1, 'Preserve at least one existing behavior on the starter.');
}

function metadata() {
  const pkg = JSON.parse(text('package.json'));
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, 'No runtime dependencies.');
  assert.equal(Object.keys(pkg.devDependencies ?? {}).length, 0, 'Use the existing Node.js runner.');
  assert.match(pkg.scripts.check, /^node \.\.\/\.\.\/scripts\/check\.mjs (builtins|spec-kit|spec-kit-skills|superpowers)$/);
  assert.equal(pkg.scripts.test, 'node --test src/*.test.mjs', 'Do not replace the learner test runner.');
}

function featureArtifacts() {
  let constitution;
  try { constitution = text('.specify/memory/constitution.md'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    assert.fail('Run the installed Spec Kit constitution command.');
  }
  assert.ok(constitution.trim().length >= 80, 'Replace the constitution template with agreed principles.');
  assert.doesNotMatch(constitution, /\[PRINCIPLE_\d_NAME\]|\[PROJECT_NAME\]/);
  let folders;
  try { folders = readdirSync(plainPath(directory, 'specs'), { withFileTypes: true }); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    assert.fail('Run Spec Kit specify, plan and tasks before final verification.');
  }
  const features = folders.filter((entry) => entry.isDirectory() && !entry.isSymbolicLink());
  assert.equal(features.length, 1, 'Keep exactly one feature in this focused lab.');
  const complete = features.filter(({ name }) =>
    ['spec.md', 'plan.md', 'tasks.md'].every((file) => {
      try { return text(join('specs', name, file)).trim().length >= 80; }
      catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return false;
      }
    }));
  assert.equal(complete.length, 1, 'This exercise needs exactly one complete feature under specs.');
  const feature = join('specs', complete[0].name);
  assert.doesNotMatch(text(join(feature, 'spec.md')), /\[NEEDS CLARIFICATION\b/);
  assert.match(text(join(feature, 'tasks.md')), /^- \[[xX]\] .+/m, 'Complete and review the implementation tasks.');
  assert.doesNotMatch(text(join(feature, 'tasks.md')), /^- \[ \] .+/m, 'Report remaining tasks instead of claiming done.');
}

if (item.fixture === 'builtins') {
  test('existing cart behavior is preserved', async () => {
    const { subtotal } = await load('cart.mjs');
    assert.equal(subtotal([]), 0);
    assert.equal(subtotal([{ priceCents: 500, qty: 1 }]), 500);
  });
  test('quantities are applied', async () => {
    const { subtotal } = await load('cart.mjs');
    assert.equal(subtotal([{ priceCents: 250, qty: 3 }, { priceCents: 100, qty: 2 }]), 950);
    assert.equal(subtotal([{ priceCents: 0, qty: 10 }]), 0);
  });
  test('invalid cart lines are rejected', async () => {
    const { subtotal } = await load('cart.mjs');
    for (const lines of [null, undefined, {}, 'cart', [null], [{}]]) fails(() => subtotal(lines));
    for (const qty of [0, -1, 1.5, '2', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      fails(() => subtotal([{ priceCents: 100, qty }]));
    }
  });
  test('safe integer cents are enforced', async () => {
    const { subtotal } = await load('cart.mjs');
    for (const priceCents of [-1, 0.5, '100', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      fails(() => subtotal([{ priceCents, qty: 1 }]));
    }
    fails(() => subtotal([{ priceCents: Number.MAX_SAFE_INTEGER, qty: 2 }]));
    fails(() => subtotal([{ priceCents: Number.MAX_SAFE_INTEGER, qty: 1 }, { priceCents: 1, qty: 1 }]));
    assert.equal(subtotal([{ priceCents: Number.MAX_SAFE_INTEGER, qty: 1 }]), Number.MAX_SAFE_INTEGER);
  });
  test('inputs are left untouched', async () => {
    const { subtotal } = await load('cart.mjs');
    const lines = Object.freeze([Object.freeze({ priceCents: 500, qty: 1 })]);
    assert.equal(subtotal(lines), 500);
    assert.deepEqual(lines, [{ priceCents: 500, qty: 1 }]);
  });
  test('public API and scope are preserved', async () => {
    const mod = await load('cart.mjs');
    assert.deepEqual(Object.keys(mod), ['subtotal']);
    assert.equal(mod.subtotal.length, 1);
    unchanged('src/legacy-pricing.mjs');
    metadata();
    if (id === 'superpowers') verifyPublicSkills(plainPath(directory, '.github'));
  });
  test('learner regressions catch the original bug', () => regressions('cart'));
} else {
  const today = '2026-11-01';
  test('no codes leaves the subtotal unchanged', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    assert.deepEqual(quoteDiscount(1000, [], today), { code: null, discountCents: 0, totalCents: 1000 });
  });
  test('best single code wins without stacking', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    assert.deepEqual(quoteDiscount(1000, ['SAVE10', 'SAVE20'], today),
      { code: 'SAVE20', discountCents: 200, totalCents: 800 });
  });
  test('discounts are floored to whole cents', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    assert.equal(quoteDiscount(999, ['SAVE10'], today).discountCents, 99);
  });
  test('duplicate codes do not stack', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    assert.deepEqual(quoteDiscount(1000, ['SAVE10', 'SAVE10'], today),
      { code: 'SAVE10', discountCents: 100, totalCents: 900 });
  });
  test('unknown and expired codes are rejected', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    for (const codes of [['UNKNOWN'], ['OLD5'], ['SAVE10', 'UNKNOWN'], ['toString'], ['__proto__']]) {
      fails(() => quoteDiscount(1000, codes, today));
    }
    fails(() => quoteDiscount(1000, ['SAVE10'], '2027-01-01'));
    assert.equal(quoteDiscount(1000, ['SAVE10'], '2026-12-31').discountCents, 100);
  });
  test('invalid inputs are rejected', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    for (const amount of [-1, 0.5, '100', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      fails(() => quoteDiscount(amount, [], today));
    }
    for (const codes of [null, 'SAVE10', [10]]) fails(() => quoteDiscount(1000, codes, today));
    for (const date of [undefined, null, 'tomorrow', '2026-02-30', '2026-13-01']) {
      fails(() => quoteDiscount(1000, [], date));
    }
  });
  test('large cent amounts remain exact', async () => {
    const { quoteDiscount } = await load('discount.mjs');
    for (const amount of [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 2]) {
      const cents = Number(BigInt(amount) * 20n / 100n);
      assert.deepEqual(quoteDiscount(amount, ['SAVE20'], today),
        { code: 'SAVE20', discountCents: cents, totalCents: amount - cents });
    }
  });
  test('catalogue inputs and public API are preserved', async () => {
    const mod = await load('discount.mjs');
    assert.deepEqual(Object.keys(mod), ['quoteDiscount']);
    assert.equal(mod.quoteDiscount.length, 3);
    const codes = Object.freeze(['SAVE10']);
    mod.quoteDiscount(1000, codes, today);
    assert.deepEqual(codes, ['SAVE10']);
    unchanged('src/coupons.mjs');
    metadata();
  });
  test('learner regressions catch the original bug', () => regressions('discount'));
  test('constitution and feature artifacts are ready', featureArtifacts);
}
