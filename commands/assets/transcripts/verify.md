# Prove it with tests

> Illustrative walkthrough - not recorded Copilot output

Real exercise: [03-prove-it-with-tests](../../exercises/03-prove-it-with-tests/TASK.md). Commands: `/fail-paths`, `/tests`, `/verify`.

## Step 1 - Before: A test that cannot fail, for a parser that accepts anything

File: `duration.test.mjs`

Participant:

```text
Write tests for parseDuration.
```

Response (illustrative):

```text
Added a test - all tests pass!
parseDuration is fully covered.
```

Code:

```diff
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { parseDuration } from './duration.mjs';

  test('parses a duration', () => {
-   assert.ok(parseDuration('1h30m'));
  });

  // truthy for any non-zero number: it can never fail
  // parseDuration('1.5h') returns 18000, not an error
```

Terminal:

```text
> npm run check -- 03-prove-it-with-tests --baseline
# tests 5
# pass 1
# fail 4
```

## Step 2 - Fail paths: /fail-paths writes the edge cases first - and runs them

File: `duration.test.mjs`

Participant:

```text
/fail-paths parseDuration in duration.mjs. Add edge-case tests and run them. Do not change duration.mjs yet.
```

Response (illustrative):

```text
Failure paths (tests added, nothing fixed):
- '' and '   ' must throw RangeError
- '90' (no unit), '5x', '1.5h', '-5m'
- '1m1h' (out of order), '1h1h' (repeated)
- 42, null, undefined must throw TypeError

Ran the suite: the new tests FAIL today.
That red is the finding.
```

Code:

```diff
+ const malformed = { name: 'RangeError', message: /Invalid/ };
+
+ test('rejects a number without a unit', () => {
+   assert.throws(() => parseDuration('90'), malformed);
+ });
+
+ test('rejects non-string input with a TypeError', () => {
+   for (const input of [42, null, undefined, {}]) {
+     assert.throws(() => parseDuration(input),
+       { name: 'TypeError' });
+   }
+ });
```

Terminal:

```text
> node --test duration.test.mjs
# tests 6
# pass 1
# fail 5
```

## Step 3 - Tests: /tests fills the gaps; every assertion must be able to fail

File: `duration.test.mjs`

Participant:

```text
/tests Fill the gaps in duration.test.mjs: exact values and whitespace. Delete any assertion that cannot fail.
```

Response (illustrative):

```text
Added exact-value tests: 9 tests total.
Removed assert.ok(parseDuration('1h30m')):
it passes for any non-zero number.

Red on the original parser: 5 of 9.
Green: exact values and whitespace.
```

Code:

```diff
- test('parses a duration', () => {
-   assert.ok(parseDuration('1h30m'));
- });
+ test('parses hours and minutes', () => {
+   assert.equal(parseDuration('1h30m'), 5400);
+ });
+ test('ignores surrounding whitespace', () => {
+   assert.equal(parseDuration(' 2h '), 7200);
+ });
```

Terminal:

```text
> node --test duration.test.mjs
# tests 9
# pass 4
# fail 5
```

## Step 4 - Fix: Only now fix the parser - without touching the tests

File: `duration.mjs`

Participant:

```text
Make duration.mjs meet the contract. Do not edit the tests.
```

Response (illustrative):

```text
Edited duration.mjs only (tests untouched):
- anchored pattern: optional h, m, s in order
- TypeError for non-strings
- RangeError for empty or malformed input
```

Code:

```diff
+ const PATTERN = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
  export function parseDuration(text) {
+   if (typeof text !== 'string')
+     throw new TypeError(`Invalid duration: ...`);
+   const trimmed = text.trim();
+   const match = PATTERN.exec(trimmed);
+   if (trimmed === '' || !match)
+     throw new RangeError(`Invalid duration: ...`);
+   const [, hours = '0', minutes = '0', seconds = '0'] = match;
+   return Number(hours) * 3600 + Number(minutes) * 60
+     + Number(seconds);
  }
```

Terminal:

```text
> node --test duration.test.mjs
# tests 9
# pass 9
# fail 0
```

## Step 5 - After: /verify: suite green, and it catches the original bug

File: `duration.mjs`

Participant:

```text
/verify parseDuration meets the contract and the suite catches the original parser
```

Response (illustrative):

```text
Command: npm run check -- 03-prove-it-with-tests
Exit code: 0 - 5/5 checks pass.
The checks also ran your suite against the
original parser: it fails there, as it should.
Verdict: VERIFIED (output below).
```

Code:

```diff
  const PATTERN = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;

  parseDuration('1h30m')  // 5400
  parseDuration(' 2h ')   // 7200
  parseDuration('1.5h')   // RangeError: Invalid duration
  parseDuration(null)     // TypeError: Invalid duration
```

Terminal:

```text
> npm run check -- 03-prove-it-with-tests
# tests 5
# pass 5
# fail 0
```

Takeaway: A test that cannot fail proves nothing. See it red, then green.
