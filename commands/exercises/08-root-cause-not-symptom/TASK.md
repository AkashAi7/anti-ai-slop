# 08 - Fix the root cause, not the ticket

**Slop:** ticket #4821 reported that `toCents('1,299.99')` was wrong, so the previous agent special-cased that exact string. The ticket closes; the parser is still broken for `'$1,299.99'`, `'12,345.50'`, and `'abc'`.

**Command flow:** `/root-cause` → `/fail-paths` → `/verify`

- `/root-cause` reproduces the defect, tests at most 3 hypotheses, names the confirmed cause, and proposes a fix plus regression tests. It edits nothing.
- `/fail-paths` adds edge-case tests (malformed, boundary, wrong type) and runs them. Assertions are never weakened.
- `/verify` runs the checks and reports the command, exit code, and observed result for every claim.

Set up your copy and confirm the defect:

```powershell
npm run setup -- 08-root-cause-not-symptom
npm run check -- 08-root-cause-not-symptom --baseline
```

Expected red: `thousands separators parse everywhere`, `no special-casing of inputs`, `invalid prices are rejected`, `learner regression catches the original`.

Edit only `work/08-root-cause-not-symptom/price.mjs` and `work/08-root-cause-not-symptom/price.test.mjs`.

Contract: `toCents(text)` takes a string. After trimming, it accepts an optional leading `$`, digits with optional correct thousands grouping (`1,299`), and an optional `.` followed by 1 or 2 decimals. It returns integer cents with no float drift (`'0.29'` → `29`). Anything else, including non-strings, throws an `Error` whose message contains "Invalid price". The hotfix line goes away.

Start in Copilot Chat:

```text
/root-cause Ticket #4821 says toCents('1,299.99') was wrong. Reproduce the defect in work/08-root-cause-not-symptom/price.mjs with other inputs before proposing any fix. Do not edit code.
```

Then run `/fail-paths` on `toCents` so the tests fail on the current code, fix the parser, run `/verify`, and:

```powershell
npm run check -- 08-root-cause-not-symptom
```

**Human acceptance:** the `/root-cause` report reproduces the bug with an input other than the ticket's, and that same input passes after the fix.

**Reflect:** What would the next ticket have said if the hotfix had shipped?
