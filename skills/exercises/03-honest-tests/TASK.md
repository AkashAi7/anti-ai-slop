# 03 - Make the test earn its green

**Slop:** the starter "test" verifies that a function exists, not what it does.

Run `npm run setup -- 03-honest-tests` and `npm run check -- 03-honest-tests --baseline`.
Expected red: resolved incidents are counted; the learner regression does not detect the defect.

Only edit `work/03-honest-tests/incident.mjs` and `regression.mjs`. The contract is an array of incidents: count only `open` and `investigating`; empty input returns zero.

Invoke `/test-driven-development`. First improve `verify(countOpen)` in the regression file. Run the learner checks **before** touching the implementation and inspect the new assertion failure. Then minimally fix `countOpen` and rerun:

```powershell
npm run check -- 03-honest-tests
```

Acceptance checks run your regression against both a known defect and a correct implementation. A function that always throws is not a valid test. Do not modify the check harness.

**Human acceptance:** retain the observed red/green command output and explain the counterexample. Automated green alone cannot prove the order in which you worked.

**Reflect:** Why did the original green test provide no protection?
