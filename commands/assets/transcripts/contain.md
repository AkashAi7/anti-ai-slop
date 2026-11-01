# Write the scope contract first

> Illustrative walkthrough - not recorded Copilot output

Real exercise: [07-scope-contract](../../exercises/07-scope-contract/TASK.md). Commands: `/scope`, `/disableAutoApprove`, `/tools`, `/pre-commit`.

## Step 1 - Before: No contract: a one-line fix becomes a drive-by refactor

File: `cart.mjs`

Participant:

```text
Fix: cart subtotal ignores quantity.
```

Response (illustrative):

```text
Fixed subtotal! While I was there I also:
- fixed the same bug in legacy-pricing.mjs
- renamed applyTax to addTax for clarity
- tidied format.mjs
Everything is cleaner now.
```

Code:

```diff
  // cart.mjs - the bug
  export function subtotal(items) {
-   return items.reduce((sum, item) => sum + item.priceCents, 0);
  }
- export function applyTax(cents, rate) {   // renamed!
+ export function addTax(cents, rate) {

  // legacy-pricing.mjs - FROZEN, owned by billing
-   for (const line of lines) sum += line.priceCents;
+   for (const line of lines) sum += line.priceCents * line.qty;
```

Terminal:

```text
> npm run check -- 07-scope-contract --baseline
# tests 6
# pass 3
# fail 3
```

## Step 2 - Scope: /scope writes the contract before any fix

File: `SCOPE.md`

Participant:

```text
/scope Bug: subtotal ignores quantity. Allow only cart.mjs and cart.test.mjs, freeze the public API. Do not fix yet.
```

Response (illustrative):

```text
Wrote SCOPE.md (26 lines):
Allowed: cart.mjs (subtotal body), cart.test.mjs
Forbidden: legacy-pricing.mjs (frozen), format.mjs
Frozen API: subtotal, applyTax, total
Done when: regression test red -> green
Rollback: restore the chat checkpoint
```

Code:

```diff
+ ## Allowed changes
+ - cart.mjs: change the body of subtotal only.
+ - cart.test.mjs: add regression tests.
+ ## Forbidden
+ - legacy-pricing.mjs: FROZEN. Report it; do not fix it.
+ - format.mjs: unrelated to this bug.
+ ## Frozen API
+ - subtotal(items), applyTax(cents, rate), total(items, rate)
+ ## Done when
+ - A regression test fails on the original subtotal
+   and passes on the fix.
```

Terminal:

```text
> (contract only - no code changed)
```

## Step 3 - Contain: /disableAutoApprove, then /tools: you approve every action

File: `cart.mjs`

Participant:

```text
/disableAutoApprove
```

Response (illustrative):

```text
Auto-approve is off for this session.
Every edit and terminal command now waits
for your Allow or Skip.

Next, /tools: turn off web search and fetch.
This fix needs read, edit, and the terminal.
```

Code:

```diff
  export function subtotal(items) {
-   return items.reduce((sum, item) => sum + item.priceCents, 0);
+   return items.reduce(
+     (sum, item) => sum + item.priceCents * item.qty, 0);
  }

  Edit cart.mjs?  [Allow]  [Skip]   <- allowed by SCOPE.md
```

Terminal:

```text
> (waiting for your approval)
```

## Step 4 - Fix: Approve in-scope edits; frozen files are reported, not fixed

File: `cart.test.mjs`

Participant:

```text
Fix subtotal and add a regression test that fails on the original code.
```

Response (illustrative):

```text
Approved by you: 2 edits, both in SCOPE.md:
- cart.mjs: subtotal body
- cart.test.mjs: 2 regression tests

Noticed: legacy-pricing.mjs has the same bug.
It is FROZEN in SCOPE.md: reported, not edited.
```

Code:

```diff
+ test('subtotal multiplies each price by its quantity', () => {
+   assert.equal(subtotal([{ priceCents: 250, qty: 3 }]), 750);
+ });
+
+ test('total taxes the quantity-adjusted subtotal', () => {
+   const items = [{ priceCents: 250, qty: 3 },
+     { priceCents: 100, qty: 2 }];
+   assert.equal(total(items, 0.1), 1045);
+ });
```

Terminal:

```text
> node --test cart.test.mjs
# tests 4
# pass 4
# fail 0
```

## Step 5 - After: /pre-commit: READY against SCOPE.md, with evidence

File: `cart.mjs`

Participant:

```text
/pre-commit
```

Response (illustrative):

```text
READY against SCOPE.md:
ok - diff touches cart.mjs, cart.test.mjs only
ok - exports and parameters unchanged
ok - regression test red before, green after
ok - checks exit 0 (output below)
Reported, not fixed: legacy-pricing.mjs
```

Code:

```diff
  export function subtotal(items) {
-   return items.reduce((sum, item) => sum + item.priceCents, 0);
+   return items.reduce(
+     (sum, item) => sum + item.priceCents * item.qty, 0);
  }

  // applyTax and total: unchanged (Frozen API)
  // legacy-pricing.mjs, format.mjs: untouched
```

Terminal:

```text
> npm run check -- 07-scope-contract
# tests 6
# pass 6
# fail 0
```

Takeaway: Write the contract, approve every edit, ship only what SCOPE.md allows.
