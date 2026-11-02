# Review inputs with /security-review. Test and verify.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code / Copilot app | /security-review + TDD. Track: skills.

Commands: `/security-review`, `/test-driven-development`, `/verification-before-completion`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Use the installed security-review skill

Participant:

```text
/security-review Read BRIEF.md and src/cart.mjs. Perform a read-only input-boundary review with file:line evidence. Distinguish contract defects from exploitable paths. Do not edit.
```

Illustrative checkpoint:

The caller controls lines and line fields. The function does not validate them or multiply qty. No network, SQL or persistence sink exists here, so do not claim injection or a demonstrated exploit.

Source or artifact snapshot:

```text
src/cart.mjs:1-3
subtotal(lines)
  -> lines.reduce(...)
Trust boundary: caller -> lines -> arithmetic
Missing: input checks, qty multiplication,
         safe product and total checks
No network, SQL, auth or storage sink
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

## Step 2: Turn confirmed boundaries into red tests

Participant:

```text
Use /test-driven-development to add boundary regressions for missing, negative, fractional, NaN and unsafe values. Keep cart.mjs unchanged, run npm test, and report intended assertion failures.
```

Illustrative checkpoint:

A useful red run fails on the original behavior while preserving valid empty-cart and quantity-one cases. Reject syntax or import failures as evidence.

Source or artifact snapshot:

```text
src/cart.test.mjs

Reject invalid arrays and lines
Reject negative and fractional values
Reject unsafe products and totals
Keep valid empty cart behavior

Red on the original implementation
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

## Step 3: Approve the smallest contract repair

Participant:

```text
After I review the red output, repair only src/cart.mjs under BRIEF.md. Preserve subtotal(lines), do not mutate inputs, add no dependencies, and leave the tests unchanged.
```

Illustrative checkpoint:

The bounded repair validates input and safe integer arithmetic, multiplies priceCents by qty, and does not add a sanitizer, wrapper, dependency or unrelated API.

Source or artifact snapshot:

```text
Preserve subtotal(lines)
Validate line fields and safe integers
Multiply cents by quantity
Reject invalid and unsafe totals
No API or dependency changes
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

## Step 4: Verify without overstating the result

Participant:

```text
Use /verification-before-completion, then freshly run npm test and npm run check; report exit codes and counts, inspect git diff/status. State what the tests prove and what they do not prove about production security.
```

Illustrative checkpoint:

Reference acceptance reaches 7/7. This establishes the fixture's input contract and regression behavior; it does not prove a real attack path, coverage completeness or production security.

Source or artifact snapshot:

```text
npm test -> exit 0
npm run check -> 7/7, exit 0
Proved: fixture contract + regressions
Not proved: a real exploit or
            production security
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

Takeaway: Use the installed security-review skill to trace inputs with evidence, distinguish a contract defect from an exploit claim, then test and verify the smallest repair.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
