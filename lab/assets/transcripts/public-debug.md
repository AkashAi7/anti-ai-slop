# Stop guessing. Trace the defect.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code / Copilot app | obra/superpowers. Track: skills.

Commands: `/systematic-debugging`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Start from the agreed plan

Participant:

```text
Stay in work/skills and keep the /grill-me decisions in this chat. Type /skills and confirm systematic-debugging is listed from .github/skills.
```

Illustrative checkpoint:

The grilled decisions give the investigation a fixed scope. Check the loaded path, not just a familiar skill name.

Source or artifact snapshot:

```text
.github/skills/systematic-debugging/
  SKILL.md
  root-cause-tracing.md
  defense-in-depth.md
  condition-based-waiting.md

Source: obra/superpowers (MIT)
No plugin hooks or global install.
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

## Step 2: Invoke /systematic-debugging

Participant:

```text
/systematic-debugging Read BRIEF.md and src/cart.mjs. Reproduce the quantity defect, cite file:line evidence, and state one testable cause. Do not edit yet. Keep investigation inside this disposable workspace.
```

Illustrative checkpoint:

Reproduce with priceCents 250 and qty 3. Expected 750, observed 250. The reducer adds price once instead of multiplying by quantity.

Source or artifact snapshot:

```text
src/cart.mjs:2

sum + line.priceCents

Evidence: qty is never read.
Hypothesis: the reducer ignores quantity.
Do not add retries or wrappers.
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

## Step 3: Use evidence, not a plausible story

Participant:

```text
Show how the current code produces 250. Identify preserved behavior and proposed regressions. Do not implement until I approve.
```

Illustrative checkpoint:

Empty carts and quantity one already work. New tests must cover quantity, bad input and unsafe arithmetic without changing legacy pricing.

Source or artifact snapshot:

```text
Preserve
  empty cart -> 0
  quantity one -> same price

Cover
  quantity > 1
  invalid values and overflow
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

## Step 4: Stop at the human checkpoint

Participant:

```text
I approve changes only to src/cart.mjs and src/cart.test.mjs. Next, use test-driven-development and show the red run before the repair.
```

Illustrative checkpoint:

Investigation is not completion. The independent baseline remains 3/7. Record the loaded skill path and root-cause evidence before continuing.

Source or artifact snapshot:

```text
Evidence to keep

Loaded workspace SKILL.md path
Reproduction: expected vs actual
Root-cause file:line
Approved two-file scope

Still red; not solved.
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

Takeaway: Load the actual upstream skill, reproduce the bug, then approve a bounded hypothesis.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
