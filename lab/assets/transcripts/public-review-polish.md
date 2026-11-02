# Push back, simplify, then write it plainly.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code / Copilot app | superpowers, agent-skills, humanizer. Track: skills.

Commands: `/receiving-code-review`, `/code-simplification`, `/humanizer`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Invoke /receiving-code-review

Participant:

```text
/receiving-code-review Evaluate every comment in REVIEW-FEEDBACK.md against BRIEF.md and the current code. For each one, say accept, push back or out of scope, with evidence. Apply only accepted changes inside src/cart.mjs or src/cart.test.mjs, then run npm test.
```

Illustrative checkpoint:

Expected: accept 1, a clearer error message. Push back on 2, because float dollars break the integer-cents contract. Defer 3: tax is a new feature, not this fix.

Source or artifact snapshot:

```text
REVIEW-FEEDBACK.md

1 Name the error    accept, in scope
2 Use float dollars push back: BRIEF
                    requires integer cents
3 Add taxRate       defer: new API

Not "Great point!" and all three.
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

## Step 2: Invoke /code-simplification

Participant:

```text
/code-simplification Simplify src/cart.mjs for readability without changing behavior or its public API. Keep every guard required by BRIEF.md. Run npm test and npm run check before and after, and revert any change that turns a check red.
```

Illustrative checkpoint:

Simplify for the reader, not for line count. Keep every guard BRIEF.md requires, rerun the checks and revert any change that turns them red.

Source or artifact snapshot:

```text
Before -> after (illustrative)

nested if/else per field
  -> one guard per rule
repeated Number.isSafeInteger calls
  -> one named helper

Same API, same errors,
npm run check still 7/7.
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

## Step 3: Invoke /humanizer

Participant:

```text
/humanizer Rewrite PR-DESCRIPTION.md so it reads like an engineer wrote it. Keep every fact, remove inflated claims, filler and stock AI phrasing, and only claim results that npm test and npm run check actually showed.
```

Illustrative checkpoint:

The rewrite keeps every fact and drops the filler. Claims such as "100% coverage" and "production-ready" go, because no command showed them.

Source or artifact snapshot:

```text
PR-DESCRIPTION.md

Before: "a robust, seamless and
future-proof overhaul ... 100% coverage"

After: "subtotal() ignored qty. It now
multiplies cents by quantity and
rejects invalid or unsafe input.
npm test and npm run check: 7/7."
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

## Step 4: Hand off only what you proved

Participant:

```text
Run npm test and npm run check again and show git --no-pager status --short. Summarize which review comments you accepted, rejected and deferred, and why.
```

Illustrative checkpoint:

Acceptance stays at 7/7 after simplification. The handoff states what changed, what the checks showed and what was deferred, in plain language.

Source or artifact snapshot:

```text
Handoff card

Review: 1 accepted, 1 rejected,
        1 deferred with a reason
Simplified, behavior unchanged
Acceptance: 7/7, exit 0
PR text: facts only, no filler
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

Takeaway: Slop creeps back in at handoff: weigh each review comment, simplify without changing behavior, and describe only what you proved.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
