---
name: simplify
description: Remove duplication, dead code, and speculative abstraction without changing behavior. Tests must be green before and after.
argument-hint: <file or function to simplify>
agent: agent
tools: ['read/readFile', 'read/problems', 'search/codebase', 'search/fileSearch', 'search/textSearch', 'search/usages', 'edit/editFiles', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/testFailure']
---
# /simplify - less code, same behavior

## Goal
Make the code after `/simplify` smaller and clearer without changing what it does.

## Steps
1. Run the tests first. If they are not green, or there are no tests that cover this code, stop and say so.
2. Find what can go:
   - duplicate helpers (search for an existing export first)
   - dead code and unused parameters
   - debug output and narrating comments
   - speculative options and layers
   - error handling that hides failures (replace it with a clear throw, not with nothing)
3. Make the smallest edits. Reuse existing helpers instead of writing new ones.
4. Run the same tests again. Record both runs.

## Output format
- **Before**: command and exit code.
- **Changes**: table with file:line | Removed or changed | Why behavior is unchanged.
- **After**: the same command and exit code.

## Stop conditions
- No public API changes (names, parameters, return shapes).
- No new dependencies and no new files.
- If the tests fail after a change, revert that change and report it.
