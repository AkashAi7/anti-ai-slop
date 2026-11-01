# Plan, checklist, tasks, consistency analysis.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code | official Spec Kit commands layout. Track: spec-kit.

Commands: `/speckit.plan`, `/speckit.checklist`, `/speckit.tasks`, `/speckit.analyze`.

In the official Copilot skills layout, use `/speckit-<step>` instead of `/speckit.<step>`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Invoke /speckit.plan with the existing stack

Participant:

```text
/speckit.plan Use the existing Node.js ESM project, node:test and src/coupons.mjs. No dependencies or new services. Preserve quoteDiscount(subtotalCents, codes, today). Plan red tests before the repair.
```

Illustrative checkpoint:

Keep the implementation small: validate inputs, select the best code, calculate exact integer cents, preserve the catalogue. No UI, database or invented helper.

Source or artifact snapshot:

```text
specs/<feature>/plan.md

Stack: existing Node.js ESM
Tests: node:test
Reuse: src/coupons.mjs
Allowed: discount.mjs + test file
No new service or dependency
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
not ok 2 - best single code wins without stacking
not ok 3 - discounts are floored to whole cents
not ok 4 - duplicate codes do not stack
not ok 5 - unknown and expired codes are rejected
not ok 6 - invalid inputs are rejected
not ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
not ok 9 - learner regressions catch the original bug
not ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 2
# fail 8
# cancelled 0
# skipped 0
# todo 0
```

## Step 2: Invoke /speckit.checklist; review requirements

Participant:

```text
/speckit.checklist Review whether stacking, duplicate handling, cent precision, expiry, invalid input and frozen scope are complete, clear and testable. Do not treat this as a passing code test.
```

Illustrative checkpoint:

A human reviews custom checklist items against the specification. Do not blindly mark every box to make implementation proceed. A checked requirement is not verified code.

Source or artifact snapshot:

```text
Requirements-quality checklist

[ ] Non-stacking is unambiguous
[ ] Expiry boundary is explicit
[ ] Large-cent precision is testable
[ ] Invalid-input behavior is defined

Still no runtime pass claim.
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
not ok 2 - best single code wins without stacking
not ok 3 - discounts are floored to whole cents
not ok 4 - duplicate codes do not stack
not ok 5 - unknown and expired codes are rejected
not ok 6 - invalid inputs are rejected
not ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
not ok 9 - learner regressions catch the original bug
not ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 2
# fail 8
# cancelled 0
# skipped 0
# todo 0
```

## Step 3: Invoke /speckit.tasks; keep tests first

Participant:

```text
/speckit.tasks Include at least four node:test cases in src/discount.test.mjs importing ./discount.mjs. Run them red before fixing src/discount.mjs, then run npm test and npm run check.
```

Illustrative checkpoint:

Make requirements traceable to ordered tasks. Add regression cases before the implementation task, then verify the frozen API and catalogue.

Source or artifact snapshot:

```text
Illustrative tasks.md snapshot

T001 Red regressions -> policy rules
T002 Input validation -> error rules
T003 Best-code and exact-cent repair
T004 Independent check + scope review

Order prevents happy-path-only proof.
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
not ok 2 - best single code wins without stacking
not ok 3 - discounts are floored to whole cents
not ok 4 - duplicate codes do not stack
not ok 5 - unknown and expired codes are rejected
not ok 6 - invalid inputs are rejected
not ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
not ok 9 - learner regressions catch the original bug
not ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 2
# fail 8
# cancelled 0
# skipped 0
# todo 0
```

## Step 4: Invoke /speckit.analyze before building

Participant:

```text
/speckit.analyze
```

Illustrative checkpoint:

Read-only consistency review: compare specification, plan and tasks. If a plan stacks codes but the spec forbids stacking, fix the source artifact and re-run analysis.

Source or artifact snapshot:

```text
Example contradiction

Spec: best single code
Plan: combine percentages

Action: repair plan, re-run analysis
Do not implement through the conflict.
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
not ok 2 - best single code wins without stacking
not ok 3 - discounts are floored to whole cents
not ok 4 - duplicate codes do not stack
not ok 5 - unknown and expired codes are rejected
not ok 6 - invalid inputs are rejected
not ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
not ok 9 - learner regressions catch the original bug
not ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 2
# fail 8
# cancelled 0
# skipped 0
# todo 0
```

Takeaway: A requirements checklist is not a runtime test. Resolve contradictions before implementation.

Try it yourself: [Lab 1: /commands + Spec Kit](../../LAB-1-COMMANDS-SPECKIT.md). Set up first with the [lab environment guide](../../README.md).
