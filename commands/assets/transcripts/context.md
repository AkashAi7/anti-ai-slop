# Hand off, then start clean

> Illustrative walkthrough - not recorded Copilot output

Real exercise: [04-clean-context-handoff](../../exercises/04-clean-context-handoff/TASK.md). Commands: `/handoff`, `/clear`, `/compact`.

## Step 1 - Before: A long chat drifts back to ideas you already rejected

File: `report.mjs`

Participant:

```text
Continue the CSV fix from earlier (turn 47).
```

Response (illustrative):

```text
Picking up where we left off! I'll wrap each
field with JSON.stringify and add a CSV
package from npm to be safe.

(Both ideas were rejected 40 turns ago.)
```

Code:

```diff
  import { csvEscape } from './csv.mjs';

  export function buildReport(rows) {
    const lines = ['name,qty,note'];
    for (const row of rows) {
-     const note = row.note.includes(',')
-       ? '"' + row.note + '"' : row.note;
      lines.push(csvEscape(row.name) + ',' + row.qty + ',' + note);
    }
    return lines.join('\n');
  }
```

Terminal:

```text
> npm run check -- 04-clean-context-handoff --baseline
# tests 5
# pass 1
# fail 4
```

## Step 2 - Handoff: /handoff distills the decisions into a grounded file

File: `HANDOFF.md`

Participant:

```text
/handoff Write HANDOFF.md for the CSV refactor in NOTES.md. Verify every path you cite. Do not edit code.
```

Response (illustrative):

```text
Wrote HANDOFF.md (40 lines), paths verified.
Decisions: toCsvRow(values) in csv.mjs;
  no new dependency; JSON.stringify rejected
Evidence: baseline output not saved -> not run
Open: empty note? Ops has not answered.
Next: toCsvRow -> report.mjs -> run check
```

Code:

```diff
+ ## Decisions
+ - Add toCsvRow(values) to csv.mjs.
+ - report.mjs builds every line with toCsvRow.
+ - No new dependency; an npm CSV package was rejected.
+ - Rejected: JSON.stringify per field.
+ ## Evidence
+ - Baseline check: output not saved, treat as not run.
+ ## Open questions
+ - Should an empty note become an empty field?
+ ## Next steps
+ 1. Add toCsvRow to csv.mjs.
```

Terminal:

```text
> (handoff only - no code changed)
```

## Step 3 - Clear: /clear: a fresh chat with none of the stale turns

File: `HANDOFF.md`

Participant:

```text
/clear
```

Response (illustrative):

```text
(new chat session)

The 47 old turns are gone from context,
including both rejected ideas.
HANDOFF.md is on disk - attach it next.
```

Code:

```diff
  # Handoff: CSV export escaping

  ## Goal
  Make report.mjs write valid CSV when a name or note
  contains a comma, a double quote, or a newline,
  by reusing the escaping in csv.mjs.
```

Terminal:

```text
> (fresh session - no stale context)
```

## Step 4 - Resume: Resume from HANDOFF.md alone

File: `report.mjs`

Participant:

```text
Follow the next steps in #file:HANDOFF.md, then run the check.
```

Response (illustrative):

```text
From HANDOFF.md only:
1. Added toCsvRow(values) to csv.mjs
2. buildReport uses it for header and rows
3. Ran the check (see terminal)
No dependency added; no JSON.stringify.
Still open: empty notes (ops to answer).
```

Code:

```diff
- import { csvEscape } from './csv.mjs';
+ import { toCsvRow } from './csv.mjs';

  export function buildReport(rows) {
-   const lines = ['name,qty,note'];
+   const lines = [toCsvRow(['name', 'qty', 'note'])];
-   (hand-rolled quoting for note only)
+   for (const row of rows)
+     lines.push(toCsvRow([row.name, row.qty, row.note]));
    return lines.join('\n');
  }
```

Terminal:

```text
> npm run check -- 04-clean-context-handoff
# tests 5
# pass 5
# fail 0
```

## Step 5 - After: /compact keeps the decisions when the chat grows again

File: `csv.mjs`

Participant:

```text
/compact
```

Response (illustrative):

```text
Summarized this chat. Kept:
- goal and decisions (toCsvRow; no new
  dependency; no JSON.stringify)
- check result: exit 0, 5/5 (output below)
- open question: empty notes
```

Code:

```diff
  export function csvEscape(value) {
    const text = String(value);
    return /[",\r\n]/.test(text)
      ? `"${text.replace(/"/g, '""')}"` : text;
  }

+ export function toCsvRow(values) {
+   return values.map((value) => csvEscape(value)).join(',');
+ }
```

Terminal:

```text
> npm run check -- 04-clean-context-handoff
# tests 5
# pass 5
# fail 0
```

Takeaway: Carry decisions in a short, grounded HANDOFF.md - not a stale chat.
