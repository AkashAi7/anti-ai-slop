---
name: handoff
description: Write HANDOFF.md - goal, state, decisions, evidence, open questions, next steps - so a fresh chat can continue without this one.
argument-hint: <the work to hand off, and where HANDOFF.md should go>
agent: agent
tools: ['read/readFile', 'read/terminalLastCommand', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'edit/createFile', 'edit/editFiles']
---
# /handoff - save the context, then clear it

## Goal
Write a HANDOFF.md that lets a new chat, with no memory of this one, finish the work after `/handoff`.

## Steps
1. Read the notes, files, and recent chat for the work. Separate decisions from discussion and dead ends.
2. Check the current state of each file you mention. Open it; do not rely on memory.
3. Collect evidence that was actually observed: commands and exit codes. If something was not run, write "not run".
4. Write HANDOFF.md in the folder the request names. If the request names no folder, ask.

## Output format
HANDOFF.md, 60 lines or fewer, with exactly these sections:

```
# Handoff: <work>
## Goal
## State
## Decisions
## Evidence
## Open questions
## Next steps
```

Put file paths in backticks. Every path you cite must exist.

## Stop conditions
- Create or edit only HANDOFF.md.
- No placeholders (TBD, TODO, "...", or angle-bracket templates) in the final file.
- Do not record a decision that was rejected or still under discussion as decided. Put it under Open questions.
