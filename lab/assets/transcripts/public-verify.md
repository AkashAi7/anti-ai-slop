# Replace 'done' with fresh evidence.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code / Copilot app | public Superpowers skill. Track: superpowers.

Commands: `/verification-before-completion`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: Reject an unsupported success claim

Participant:

```text
The agent says the cart should work. Do not accept that as evidence. Read BRIEF.md and run the checks on the current files.
```

Illustrative checkpoint:

On the starter, four acceptance checks still fail. A reassuring response cannot turn that result green.

Source or artifact snapshot:

```text
Not evidence

'Should pass'
'Looks correct'
A previous green run
A screenshot of someone else's tests

Run checks on your own files.
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

## Step 2: Invoke /verification-before-completion

Participant:

```text
/verification-before-completion Run npm test and npm run check now. Report actual exit codes, passed/failed counts and unresolved issues. Inspect git diff and git status --short, including untracked tests. Do not commit or change acceptance tooling.
```

Illustrative checkpoint:

The reference repair has fresh passing acceptance output. Report the actual result in your session, including any failures or blocked checks.

Source or artifact snapshot:

```text
Run in the learner terminal

npm test
npm run check
git --no-pager diff
git --no-pager status --short

Read output and exit codes.
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

## Step 3: Inspect what the test summary misses

Participant:

```text
Check the allowed files, new tests, upstream skill integrity and remaining risks. Do not say checks prove Copilot loaded a skill.
```

Illustrative checkpoint:

Review untracked files too. The checker verifies code and snapshot bytes; only client activity can show which skill was loaded.

Source or artifact snapshot:

```text
Separate the claims

Code acceptance: 7/7
Skill files: checksummed snapshot
Skill loaded: inspect client activity
Quality of review: human judgment

No automatic guarantee.
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

## Step 4: Keep an honest handoff

Participant:

```text
Summarize the root cause, changed files, exact commands and outcomes, plus limitations. Do not commit or deploy.
```

Illustrative checkpoint:

Keep the red output, fresh green output, loaded skill path and reviewed diff. GIF dialogue is illustrative; your live evidence is the deliverable.

Source or artifact snapshot:

```text
Completion card

Cause and bounded repair
Observed red then green
Acceptance: 7/7, exit 0
Loaded skill path
Reviewed diff and limitations
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

Takeaway: Record real commands, exit codes and limitations; confidence is not verification.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
