# 03 - Prove it with tests

**Slop:** `parseDuration` accepts anything, and its only test asserts the result is truthy, so the test can never fail.

**Command flow:** `/fail-paths` → `/tests` → `/verify`

- `/fail-paths` lists the edge cases and writes tests for them before anything is fixed.
- `/tests` fills the remaining gaps. Review every assertion and delete any that cannot fail.
- `/verify` runs the suite and the checks and reports the command, exit code, and result.

Contract for `parseDuration(text)`:

- The trimmed input must match `^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$` with at least one unit. Return the total in seconds.
- A non-string throws a `TypeError` whose message contains `Invalid duration`.
- Malformed input (empty, no unit, unknown unit, decimal, negative, out of order, repeated unit) throws a `RangeError` whose message contains `Invalid duration`.

```powershell
npm run setup -- 03-prove-it-with-tests
npm run check -- 03-prove-it-with-tests --baseline
```

Expected red: malformed durations are rejected; non-strings are rejected; learner suite is substantial and green; learner suite catches the original parser.

Edit `work/03-prove-it-with-tests/duration.test.mjs` first. Only after your new tests fail, edit `work/03-prove-it-with-tests/duration.mjs`. Start with this prompt:

```text
/fail-paths parseDuration in work/03-prove-it-with-tests/duration.mjs. Add edge-case tests to work/03-prove-it-with-tests/duration.test.mjs and run them. Do not change duration.mjs yet.
```

1. Run `node --test work/03-prove-it-with-tests/duration.test.mjs` and keep the red output. Failing tests here are findings.
2. Run `/tests` for anything still missing: valid inputs, whitespace, and non-strings. Aim for at least six tests.
3. Ask the agent to make `duration.mjs` meet the contract without editing the tests, then run `/verify`.

```powershell
npm run check -- 03-prove-it-with-tests
```

**Human acceptance:** you saw your new tests fail against the original parser before the fix, and pass after it.

**Reflect:** What did `assert.ok(parseDuration('1h30m'))` actually prove?
