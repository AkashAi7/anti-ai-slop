# Explain first. Plan a contained repair.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code | Local Chat. Track: builtins.

Commands: `/explain`, `/plan`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Start with the actual defect

Participant:

```text
Open BRIEF.md and src/cart.mjs in the built-ins workspace. Run the baseline before asking for changes.
```

Illustrative checkpoint:

The starter ignores qty. Three existing checks pass; four intended failures expose the missing behavior and regression suite.

Source or artifact snapshot:

```text
src/cart.mjs:2
return lines.reduce(
  (sum, line) => sum + line.priceCents,
  0
);

No multiplication by line.qty.
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

## Step 2: Invoke the built-in /explain

Participant:

```text
/explain Read BRIEF.md and src/cart.mjs. Explain the quantity bug with file:line evidence. List the existing API and unknowns. Do not edit files.
```

Illustrative checkpoint:

Source: src/cart.mjs:2 adds each price once. The existing API is subtotal(lines). Quantity, validation and overflow need tests; legacy pricing is out of scope.

Source or artifact snapshot:

```text
Evidence, not invented APIs

Cause: src/cart.mjs:2
Export: subtotal(lines)
Frozen: src/legacy-pricing.mjs
Unknowns: resolve against BRIEF.md
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

## Step 3: Invoke /plan, not 'build everything'

Participant:

```text
/plan Read BRIEF.md. Propose the smallest cart repair. Only src/cart.mjs and src/cart.test.mjs may change. Cite the root cause and propose boundary tests. Do not implement yet.
```

Illustrative checkpoint:

Plan: preserve empty carts and quantity one; add red quantity/invalid-input/overflow tests; repair subtotal; run independent checks. No dependencies or unrelated edits.

Source or artifact snapshot:

```text
Allowed
  src/cart.mjs
  src/cart.test.mjs

Done when
  red regressions, then green
  independent check = 7/7
  reviewed diff
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

## Step 4: Human checkpoint: approve before editing

Participant:

```text
Review the plan. Confirm BRIEF.md, reject extra services, and approve only the two named files. Switch to Agent for edits in the Local session, then continue to tests/fix.
```

Illustrative checkpoint:

Planning is not implementation. The baseline is still red. An approved plan needs a real red-to-green test run before anyone claims done.

Source or artifact snapshot:

```text
Checkpoint

[ ] Source evidence is correct
[ ] Scope is limited to two files
[ ] Boundary tests are explicit
[ ] No implementation claim yet
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

Takeaway: Ask for source evidence and an approved scope before any implementation.

Try it yourself: [Lab 1: /commands + Spec Kit](../../LAB-1-COMMANDS-SPECKIT.md). Set up first with the [lab environment guide](../../README.md).
