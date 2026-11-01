# Constitution, specification, clarification.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code | official Spec Kit commands layout. Track: spec-kit.

Commands: `/speckit.constitution`, `/speckit.specify`, `/speckit.clarify`.

In the official Copilot skills layout, use `/speckit-<step>` instead of `/speckit.<step>`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Initialize the real toolkit

Participant:

```text
From the lab directory: npm run setup -- spec-kit. Open work/spec-kit itself in VS Code Local Chat and select /speckit. from the actual picker.
```

Illustrative checkpoint:

Setup uses the official pinned Specify CLI with --integration copilot and --commands. Nine genuine prompt commands are verified; no lab /clarify substitute is installed.

Source or artifact snapshot:

```text
Installed by Spec Kit

.github/prompts/
  speckit.constitution.prompt.md
  speckit.specify.prompt.md
  speckit.clarify.prompt.md
  ... six further core commands
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

## Step 2: Invoke /speckit.constitution

Participant:

```text
/speckit.constitution Keep the public API and catalogue stable. Use integer cents, no dependencies, and node:test. Require red regressions, explicit errors, real verification and no unrelated edits.
```

Illustrative checkpoint:

Agree on constraints once. Later plans and tasks must respect them. The illustrative artifact below is a reference snapshot, not captured agent output.

Source or artifact snapshot:

```text
.specify/memory/constitution.md

Principles
  Existing public API stays stable
  Integer cents, no dependencies
  Red regressions before repair
  Real commands and exit codes
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

## Step 3: Invoke /speckit.specify

Participant:

```text
/speckit.specify Make discount-code checkout correct for the existing project in BRIEF.md. Capture the policy and measurable acceptance criteria before implementation. Do not change code yet.
```

Illustrative checkpoint:

Describe what checkout must do, not a new technology stack. The vague product request needs explicit rules for multiple codes, expiry and cent rounding.

Source or artifact snapshot:

```text
specs/<feature>/spec.md

OPEN before clarification
  Stack or best single code?
  Floor or round cents?
  Unknown code: error or ignore?
  Expiry date inclusive?
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

## Step 4: Invoke /speckit.clarify; the learner answers

Participant:

```text
/speckit.clarify Resolve stacking, duplicate codes, integer-cent rounding, unknown codes, inclusive expiry and explicit dates against BRIEF.md. Ask blocking questions before planning.
```

Illustrative checkpoint:

Learner decisions: best single code, duplicates never stack, floor cents, reject unknown/expired codes, inclusive expiry, explicitly supplied valid date. Update the spec before planning.

Source or artifact snapshot:

```text
Agreed acceptance examples

999 + SAVE10 -> discount 99
1000 + SAVE10/SAVE20 -> 200
OLD5 on 2026-11-01 -> error
SAVE10 on expiry date -> valid
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

Takeaway: Resolve stacking, rounding and expiry before design or code; app skills use /speckit-*.

Try it yourself: [Lab 1: /commands + Spec Kit](../../LAB-1-COMMANDS-SPECKIT.md). Set up first with the [lab environment guide](../../README.md).
