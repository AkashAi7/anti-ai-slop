# Clarify before you code

> Illustrative walkthrough - not recorded Copilot output

Real exercise: [01-clarify-before-code](../../exercises/01-clarify-before-code/TASK.md). Commands: `/clarify`, `/spec`, `/plan`.

## Step 1 - Before: Code first: the agent guessed every business rule

File: `discount.mjs`

Participant:

```text
Add discount codes to applyDiscounts.
```

Response (illustrative):

```text
Done! applyDiscounts now supports every code.
Codes stack for maximum savings, and invalid
codes are skipped gracefully.
```

Code:

```diff
  export function applyDiscounts(totalCents, codes, today) {
    let percent = 0;
    for (const code of codes) {
-     if (CODES[code]) percent += CODES[code].percent;
    }
-   return totalCents * (1 - percent / 100);
  }

  // stacks every code, returns fractional cents,
  // ignores expiry, silently skips unknown codes
```

Terminal:

```text
> npm run check -- 01-clarify-before-code --baseline
# tests 6
# pass 1
# fail 5
```

## Step 2 - Clarify: /clarify asks only what blocks a correct implementation

File: `discount.mjs`

Participant:

```text
/clarify Read TASK.md and discount.mjs. Ask only the questions that block a correct implementation. Do not write code.
```

Response (illustrative):

```text
Blocking questions (no code written):
1. Do codes stack, or does one code win?
2. How are fractional cents rounded?
3. Is a code still valid on its expiry date?
4. Unknown or expired code: skip or reject?
5. One bad code among good ones: reject all?

A person answers these - not the model.
```

Code:

```diff
  export const CODES = {
    SAVE10: { percent: 10, expires: '2026-12-31' },
    WELCOME5: { percent: 5, expires: '2026-12-31' },
    SPRING20: { percent: 20, expires: '2026-04-30' },
  };
```

Terminal:

```text
> (read-only: /clarify changed no files)
```

## Step 3 - Spec: /spec turns your answers into testable criteria

File: `SPEC.md`

Participant:

```text
/spec Best single code wins; floor the discount to whole cents; valid through expiry; reject unknown or expired codes.
```

Response (illustrative):

```text
Draft spec - 7 acceptance criteria, e.g.:
- WELCOME5 + SAVE10 on 10000 -> 9000
- SAVE10 on 1999 -> discount 199 -> 1800
- SPRING20 on 2026-04-30 -> 8000
- SPRING20 on 2026-05-01 -> throws "expired"
- BOGUS -> throws "unknown"
Each criterion traces to one of your answers.
You paste it into SPEC.md.
```

Code:

```diff
+ ## Acceptance criteria
+ - Codes do not stack: only SAVE10 applies -> 9000.
+ - Discount is floored to a whole cent: 1999 -> 1800.
+ - SPRING20 is valid on 2026-04-30 -> 8000.
+ - SPRING20 on 2026-05-01 throws: expired.
+ - BOGUS throws: unknown.
+ - One invalid code rejects the whole request.
+
+ ## Edge cases
+ - OPEN: are codes case-sensitive? Not asked.
```

Terminal:

```text
> (read-only: /spec drafts, you paste into SPEC.md)
```

## Step 4 - Plan: /plan proposes the edit; you review it before anything runs

File: `discount.mjs`

Participant:

```text
/plan Implement SPEC.md in discount.mjs. Keep CODES and the signature.
```

Response (illustrative):

```text
Plan - review before approving:
1. Throw on unknown codes (Object.hasOwn).
2. Throw when today > expires (ISO strings).
3. Keep only the best percent (Math.max).
4. Floor the discount to whole cents.
Touches discount.mjs only.
Verify: npm run check -- 01-clarify-before-code
```

Code:

```diff
  for (const code of codes) {
-   if (CODES[code]) percent += CODES[code].percent;
+   if (!Object.hasOwn(CODES, code)) throw new Error(...);
+   const { percent, expires } = CODES[code];
+   if (today > expires) throw new Error(...);
+   bestPercent = Math.max(bestPercent, percent);
  }
- return totalCents * (1 - percent / 100);
+ return totalCents - Math.floor((totalCents * bestPercent) / 100);
```

Terminal:

```text
> (plan only - nothing is edited until you approve)
```

## Step 5 - After: Approved plan, real checks: 6 of 6 pass

File: `discount.mjs`

Participant:

```text
Implement the approved plan, then run the exercise checks.
```

Response (illustrative):

```text
Edited discount.mjs as planned.
Ran: npm run check -- 01-clarify-before-code
Exit 0 - 6/6 checks pass (output below).
Still OPEN in SPEC.md: case-sensitive codes.
Not changed - nobody decided it yet.
```

Code:

```diff
  export function applyDiscounts(totalCents, codes, today) {
+   let bestPercent = 0;
    for (const code of codes) {
+     if (!Object.hasOwn(CODES, code))
+       throw new Error(`Discount code ${code} is unknown.`);
+     const { percent, expires } = CODES[code];
+     if (today > expires)
+       throw new Error(`Discount code ${code} expired ...`);
+     bestPercent = Math.max(bestPercent, percent);
    }
+   return totalCents - Math.floor((totalCents * bestPercent) / 100);
  }
```

Terminal:

```text
> npm run check -- 01-clarify-before-code
# tests 6
# pass 6
# fail 0
```

Takeaway: Ask, specify, plan - then code. Every rule traces to a human answer.
