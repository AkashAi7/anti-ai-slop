# Ground it in the repo

> Illustrative walkthrough - not recorded Copilot output

Real exercise: [02-ground-in-the-repo](../../exercises/02-ground-in-the-repo/TASK.md). Commands: `/init`, `/ground`, `/verify`.

## Step 1 - Before: An invented helper, a hedge, and a config key nobody defined

File: `invoice.mjs`

Participant:

```text
Add a due date and a formatted amount to buildInvoice.
```

Response (illustrative):

```text
Done! I used the shared date helper
(dates.toISODate) with a local fallback in case
it is missing, read paymentTermsDays from config,
and formatted the amount with toFixed(2).
```

Code:

```diff
  import * as dates from './lib/dates.mjs';

- // Fallback in case the shared date helper is not available.
- function localISO(date) { /* hand-rolled YYYY-MM-DD */ }

  export function buildInvoice({ id, issued, amountCents }) {
-   const termsDays = config.paymentTermsDays ?? 14;
-   const dueDate = new Date(issued);
-   dueDate.setDate(dueDate.getDate() + termsDays);
-   const due = dates.toISODate
-     ? dates.toISODate(dueDate) : localISO(dueDate);
-   const amount = '$' + (amountCents / 100).toFixed(2);
    return { id, issued, due, amount };
  }
```

Terminal:

```text
> npm run check -- 02-ground-in-the-repo --baseline
# tests 5
# pass 1
# fail 4
```

## Step 2 - Init: /init records the real conventions once per repo

File: `CONVENTIONS.md`

Participant:

```text
/init
```

Response (illustrative):

```text
Drafted workspace instructions from the repo:
- Dates: addDays + formatDate (lib/dates.mjs)
- Money: integer cents, formatMoney only
- Config: read keys that exist; invent none
Review before saving.

In this lab, skip /init: CONVENTIONS.md
already plays that role.
```

Code:

```diff
  # Conventions

  - Dates are ISO YYYY-MM-DD strings in UTC.
    Use addDays and formatDate from lib/dates.mjs.
  - Money is always integer cents.
    Format it only with formatMoney from lib/money.mjs.
  - Settings come from config.json. Read the keys
    that exist there; do not invent keys.
```

Terminal:

```text
> (review the draft - nothing runs)
```

## Step 3 - Ground: /ground: does each thing the code needs exist?

File: `lib/dates.mjs`

Participant:

```text
/ground For invoice.mjs, list every helper, config key, and API it needs and whether it exists, with file:line evidence.
```

Response (illustrative):

```text
Needed                   Status   Evidence
dates.toISODate          MISSING  -
dates.addDays            EXISTS   lib/dates.mjs:3
dates.formatDate         EXISTS   lib/dates.mjs:10
money.formatMoney        EXISTS   lib/money.mjs:2
config.paymentTermsDays  MISSING  -
config.invoice.dueInDays EXISTS   config.json:3

Two MISSING rows are used today: invented.
```

Code:

```diff
  // Date helpers for ISO calendar dates. All math is in UTC.

  export function addDays(iso, days) {
    ...
  }

  export function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  // No toISODate here - the hedge called a ghost.
```

Terminal:

```text
> (read-only: /ground changed no files)
```

## Step 4 - Rewrite: Rewrite using only the rows /ground proved exist

File: `invoice.mjs`

Participant:

```text
Rewrite buildInvoice using only the EXISTS rows. Follow CONVENTIONS.md.
```

Response (illustrative):

```text
Edited invoice.mjs:
- removed localISO and the toISODate hedge
- due: formatDate(addDays(issued, dueInDays))
- amount: formatMoney(amountCents)
Not verified yet - next: /verify.
```

Code:

```diff
- import * as dates from './lib/dates.mjs';
+ import { addDays, formatDate } from './lib/dates.mjs';
+ import { formatMoney } from './lib/money.mjs';

  export function buildInvoice({ id, issued, amountCents }) {
-   (hand-rolled date math, hedge, toFixed)
+   return {
+     id,
+     issued,
+     due: formatDate(addDays(issued, config.invoice.dueInDays)),
+     amount: formatMoney(amountCents),
+   };
  }
```

Terminal:

```text
> (edit applied - not verified yet)
```

## Step 5 - After: /verify: the claim, the command, the exit code

File: `invoice.mjs`

Participant:

```text
/verify invoice.mjs uses the repo helpers and the checks pass
```

Response (illustrative):

```text
Claim: invoice.mjs uses the repo helpers.
Command: npm run check -- 02-ground-in-the-repo
Exit code: 0
Result: 5/5 checks pass (output below).
Verdict: VERIFIED.
```

Code:

```diff
  import { addDays, formatDate } from './lib/dates.mjs';
  import { formatMoney } from './lib/money.mjs';

  export function buildInvoice({ id, issued, amountCents }) {
    return {
      id,
      issued,
      due: formatDate(addDays(issued, config.invoice.dueInDays)),
      amount: formatMoney(amountCents),
    };
  }
```

Terminal:

```text
> npm run check -- 02-ground-in-the-repo
# tests 5
# pass 5
# fail 0
```

Takeaway: Prove each helper exists with file:line - then use only what exists.
