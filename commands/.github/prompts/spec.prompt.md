---
name: spec
description: Turn an agreed request into a short, testable spec with acceptance criteria and real verification commands.
argument-hint: <the clarified request, plus any answers you already have>
agent: agent
tools: ['read/readFile', 'search/codebase', 'search/fileSearch', 'search/listDirectory', 'search/textSearch']
---
# /spec - define done before code

## Goal
Write a spec for the request after `/spec` that a reviewer can check line by line, and that a test can prove.

## Steps
1. Read the request, any answers already given in this chat, and the code the change touches.
2. Find the real test and run commands in the repository (package scripts, task files, README). Do not invent commands.
3. Write the spec in the format below. Every acceptance criterion must be observable from outside the code.
4. Mark anything that is not decided as `OPEN:` with the question. Do not fill gaps with guesses.

## Output format
Reply in chat with Markdown that the user can paste into SPEC.md:

```
# <feature> - spec
## Goal
## Non-goals
## Inputs and outputs
## Acceptance criteria
- Given ... When ... Then ...
## Edge cases
## Risks
## Verification
- `<real command>` - what a pass looks like
```

## Stop conditions
- Do not write or edit any file, including SPEC.md. The user pastes it.
- Do not write implementation code.
- If more than 3 criteria are still OPEN, stop and list the questions instead of a spec.
