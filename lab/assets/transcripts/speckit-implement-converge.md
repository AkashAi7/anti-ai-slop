# Implement agreed tasks. Converge. Verify.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code | official Spec Kit commands layout. Track: spec-kit.

Commands: `/speckit.implement`, `/speckit.converge`.

In the official Copilot skills layout, use `/speckit-<step>` instead of `/speckit.<step>`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Review the gate before implementation

Participant:

```text
Confirm the constitution, clarified spec, plan, tasks and resolved analysis findings. A human reviews custom requirements checklists. Keep approvals enabled.
```

Illustrative checkpoint:

Do not bypass an unchecked requirements gate. Confirm that only discount code, its tests and feature documents are allowed to change.

Source or artifact snapshot:

```text
Before implementation

Constitution agreed
Spec clarified
Plan respects existing code
Tasks trace requirements
Analysis conflicts resolved
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

## Step 2: Invoke /speckit.implement; tests go red first

Participant:

```text
/speckit.implement Follow the agreed tasks. Preserve the API and catalogue; change only src/discount.mjs and src/discount.test.mjs plus feature documents. Report the red tests before repair and independent checks afterward.
```

Illustrative checkpoint:

Run the new node:test suite while the starter is unchanged. It detects stacking, rounding, invalid-input and precision defects before the implementation is repaired.

Source or artifact snapshot:

```text
src/discount.test.mjs

999 + SAVE10 -> 99 cents
SAVE10 + SAVE20 -> best only
Unknown / expired -> error
MAX_SAFE_INTEGER - 2 -> exact cents

Red before repair.
```

Observed test summary:

```text
ok 1 - no codes preserves the subtotal
not ok 2 - best code wins and duplicates never stack
not ok 3 - fractional discounts are floored
not ok 4 - unknown and expired codes are errors
not ok 5 - inputs and dates are validated
not ok 6 - large safe integer amounts keep exact cents
# tests 6
# suites 0
# pass 1
# fail 5
# cancelled 0
# skipped 0
# todo 0
```

## Step 3: Invoke /speckit.converge

Participant:

```text
/speckit.converge
```

Illustrative checkpoint:

Review code against specification, plan and tasks. Resolve remaining tasks and repeat as needed. A convergence report is not a substitute for actual terminal verification.

Source or artifact snapshot:

```text
Illustrative repaired policy

Validate amount, codes and date
Reject unknown / expired codes
Choose one best valid code
Floor cents without unsafe products
Keep API and catalogue unchanged
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
ok 2 - best single code wins without stacking
ok 3 - discounts are floored to whole cents
ok 4 - duplicate codes do not stack
ok 5 - unknown and expired codes are rejected
ok 6 - invalid inputs are rejected
ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
ok 9 - learner regressions catch the original bug
ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

## Step 4: Run the independent checks yourself

Participant:

```text
Run npm test and npm run check in work/spec-kit. Inspect git diff and git status --short. Review the constitution and complete feature artifacts.
```

Illustrative checkpoint:

The authored reference passes 10/10 independent checks and its tests detect the original code. The real learner must obtain the same acceptance result and review the actual agent changes.

Source or artifact snapshot:

```text
Required final evidence

Acceptance: 10/10, exit 0
Original-code replay detects defect
Catalogue and API unchanged
Constitution + spec + plan + tasks
Human review of coverage and diff
```

Observed test summary:

```text
ok 1 - no codes leaves the subtotal unchanged
ok 2 - best single code wins without stacking
ok 3 - discounts are floored to whole cents
ok 4 - duplicate codes do not stack
ok 5 - unknown and expired codes are rejected
ok 6 - invalid inputs are rejected
ok 7 - large cent amounts remain exact
ok 8 - catalogue inputs and public API are preserved
ok 9 - learner regressions catch the original bug
ok 10 - constitution and feature artifacts are ready
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Takeaway: Spec Kit reviews completeness; independent checks and the human-reviewed diff establish the final evidence.

Try it yourself: [Lab 1: /commands + Spec Kit](../../LAB-1-COMMANDS-SPECKIT.md). Set up first with the [lab environment guide](../../README.md).
