# Make tests red. Fix the cause. Prove green.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code | Local Agent Chat. Track: builtins.

Commands: `/tests`, `/fix`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: The starter must be red

Participant:

```text
Run npm run check -- --baseline in work/builtins. Do not fix anything yet.
```

Illustrative checkpoint:

The exact defective baseline is confirmed. This is evidence that the checks detect the intended defects, not evidence that the exercise is solved.

Source or artifact snapshot:

```text
Reported case

priceCents: 250
qty: 3

Expected subtotal: 750
Starter subtotal: 250
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

## Step 2: Invoke /tests before /fix

Participant:

```text
/tests Add at least four node:test cases to src/cart.test.mjs, importing ./cart.mjs. Cover existing behavior, quantity greater than one, invalid input and safe integer cents. Do not change src/cart.mjs. Run npm test and report the observed failures.
```

Illustrative checkpoint:

Add node:test assertions for existing behavior, mixed quantities, invalid lines and overflow. Leave cart.mjs unchanged and run the new suite.

Source or artifact snapshot:

```text
src/cart.test.mjs

assert.equal(subtotal([
  { priceCents: 250, qty: 3 },
  { priceCents: 100, qty: 2 }
]), 950);

The starter returns 350.
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

## Step 3: Invoke /fix within the agreed scope

Participant:

```text
/fix Repair src/cart.mjs against BRIEF.md and the failing tests. Keep its public API and src/legacy-pricing.mjs unchanged. No dependencies. Run npm test and npm run check; report both exit codes and any unresolved issue.
```

Illustrative checkpoint:

Validate each line. Multiply safe integer cents by qty; reject unsafe products or sums. Preserve the API and legacy file. Do not weaken assertions.

Source or artifact snapshot:

```text
src/cart.mjs

const amount = line.priceCents * line.qty;
if (!Number.isSafeInteger(amount)
  || !Number.isSafeInteger(sum + amount)) {
  throw new RangeError(...);
}
sum += amount;
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

## Step 4: The independent checker decides

Participant:

```text
Run npm test and npm run check yourself. Inspect git diff and git status --short, including new test files.
```

Illustrative checkpoint:

The reference repair passes all seven acceptance checks. Its learner suite is also replayed against the original code and detects the bug. Review is still required.

Source or artifact snapshot:

```text
Evidence required

node:test: green after repair
Original-code replay: detects defect
Independent acceptance: 7/7
Legacy file and API: unchanged
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

Takeaway: Useful tests fail on the starter and pass on the repair; the lab checks both.

Try it yourself: [Lab 1: /commands + Spec Kit](../../LAB-1-COMMANDS-SPECKIT.md). Set up first with the [lab environment guide](../../README.md).
