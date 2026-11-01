# Make green mean something

Illustrative walkthrough - not recorded Copilot output

Real exercise: [03-honest-tests](../../exercises/03-honest-tests/TASK.md)

## WITHOUT A SKILL: A green assertion that proves nothing.

Participant: Test this counter.

Weak example: the function exists, therefore the feature is done.

```text
export function countOpen(rows) {
  return rows.length;
}

assert.equal(typeof countOpen, 'function');
// Passes even when resolved rows count.
```

Terminal/observation: Green, but no behavioral protection.

## INVOKE SKILL: Choose a counterexample.

Participant: /test-driven-development Prove the behavior.

Use open, investigating, and resolved rows. The expected count is 2. Run the assertion before changing code.

```text
assert.equal(countOpen([
  { status: 'open' },
  { status: 'resolved' },
  { status: 'investigating' }
]), 2);
```

Terminal/observation: RED: actual 3, expected 2. The failure is meaningful.

## TRACE THE CAUSE: Count the required subset.

Participant: /systematic-debugging Explain the failure.

The implementation counts every row. The contract counts two active statuses. A retry or mock would not address the cause.

```text
// Hypothesis:
// rows.length includes resolved rows.
// Distinguishing case: mixed statuses.

// Fix the predicate, not the assertion.
```

Terminal/observation: One hypothesis. One behavioral counterexample.

## MINIMAL FIX: Only the change the contract needs.

Participant: Implement the smallest passing change.

Filter active statuses. Keep empty input at zero. Preserve the meaningful regression.

```text
export function countOpen(rows) {
  return rows.filter(({ status }) =>
    status === 'open' ||
    status === 'investigating'
  ).length;
}
```

Terminal/observation: npm run check -- 03-honest-tests

## VERIFY + DISCUSS: Test the test, not just the code.

Participant: Does the regression detect the original bug?

The lab runs it against a known defect and a correct function. An always-throwing test cannot pass both checks.

```text
Known defective function -> regression fails
Correct implementation  -> regression passes
Empty input             -> zero

Retain the observed red/green evidence.
```

Terminal/observation: Expected solution: 4 checks pass, none skipped.

Takeaway: A useful regression fails on the defect and accepts correct behavior.
