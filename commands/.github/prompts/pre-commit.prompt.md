---
name: pre-commit
description: Final gate before a commit - checks scope, debug output, secrets, stubs, skipped tests, and real test results. Ends with READY or NOT READY.
argument-hint: <files in this change, or leave empty to use the current changes>
agent: agent
tools: ['read/readFile', 'read/problems', 'read/terminalLastCommand', 'search/changes', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'execute/runInTerminal', 'execute/getTerminalOutput']
---
# /pre-commit - the last checkpoint

## Goal
Decide whether the change after `/pre-commit` is ready to commit. Every line of the checklist needs evidence.

## Steps
1. Find the change: the files named in the request, or the current changes when this is a git repository.
2. If a SCOPE.md exists next to the change, read it. Compare every changed file and every public API with its Allowed, Forbidden, and Frozen API sections.
3. Search the changed files for:
   - debug output (`console.log`, `print`, `debugger`)
   - secrets (keys, tokens, passwords, connection strings)
   - stubs (`TODO`, `FIXME`, `throw new Error('not implemented')`, placeholder returns)
   - skipped or focused tests (`.skip`, `.only`, `todo`)
   - empty `catch` blocks
4. Run the real test command for the project. Record the command and exit code.

## Output format
| Check | Result | Evidence |
|---|---|---|
| Scope matches SCOPE.md | pass / fail / no SCOPE.md | |
| No debug output | | |
| No secrets | | |
| No stubs | | |
| No skipped or focused tests | | |
| No empty catch | | |
| Tests pass | | command + exit code |

**Verdict:** `READY` only if every row passes. Otherwise `NOT READY`, with the rows to fix.

## Stop conditions
- Do not edit, stage, or commit anything.
- Do not mark a row as pass without evidence.
