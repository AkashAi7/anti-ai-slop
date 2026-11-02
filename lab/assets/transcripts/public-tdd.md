# Make a useful test fail first.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code / Copilot app | obra/superpowers. Track: skills.

Commands: `/test-driven-development`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Begin in the fresh skills cart

Participant:

```text
Stay in work/skills. Read BRIEF.md and run npm run check -- --baseline. Confirm the installed test-driven-development skill in the picker.
```

Illustrative checkpoint:

The same defect and checks make this comparable to built-ins. Do not copy the previous repair into this workspace.

Source or artifact snapshot:

```text
Before repair

subtotal([{priceCents: 250, qty: 3}])
Expected: 750
Actual: 250

Starter acceptance: 3/7
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
not ok 2 - quantities are applied
not ok 3 - invalid cart lines are rejected
not ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
not ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 3
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

## Step 2: Invoke /test-driven-development

Participant:

```text
/test-driven-development Follow BRIEF.md. Add at least four node:test cases to src/cart.test.mjs. Preserve existing behavior and cover quantity, invalid input and overflow. Run npm test with cart.mjs unchanged; stop for review of the red output. Do not delete existing starter or learner work.
```

Illustrative checkpoint:

Run the tests with cart.mjs untouched. A quantity assertion must fail for the expected mismatch, not for an import or syntax error.

Source or artifact snapshot:

```text
src/cart.test.mjs

assert.equal(subtotal([
  { priceCents: 250, qty: 3 }
]), 750);

Keep an empty-cart test too.
```

Observed test summary:

```text
ok 1 - empty cart and quantity one preserve existing behavior
not ok 2 - quantity and mixed lines are included
not ok 3 - invalid quantities are rejected
not ok 4 - invalid prices and cart shapes are rejected
not ok 5 - unsafe products and sums are rejected
# tests 5
# suites 0
# pass 1
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

## Step 3: Review red, then approve the repair

Participant:

```text
The regression failed for the correct reason. Repair only src/cart.mjs under BRIEF.md. Keep assertions and legacy pricing unchanged. Do not delete existing work.
```

Illustrative checkpoint:

Validate the input, multiply cents by quantity, reject unsafe arithmetic and rerun the complete learner suite. No extra package or abstraction.

Source or artifact snapshot:

```text
Minimal repair

Validate line fields
amount = priceCents * qty
Check product and total are safe
Return accumulated cents

No test weakening.
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
ok 2 - quantities are applied
ok 3 - invalid cart lines are rejected
ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

## Step 4: Prove the tests distinguish the versions

Participant:

```text
Run npm test and npm run check yourself. Explain the original-code replay and inspect the changed and untracked files.
```

Illustrative checkpoint:

The reference reaches 7/7. Its tests pass after repair and catch the original bug. Learners must reproduce that evidence on their own files.

Source or artifact snapshot:

```text
Acceptance criteria

Red on original implementation
Green on repaired implementation
Existing behavior retained
Independent acceptance: 7/7
Reviewed two-file change
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
ok 2 - quantities are applied
ok 3 - invalid cart lines are rejected
ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Takeaway: A green suite is useful only if it also detects the original defect.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
