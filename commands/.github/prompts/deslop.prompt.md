---
name: deslop
description: Review a change for AI-slop patterns (swallowed errors, fake tests, duplicate helpers, debug prints, narrating comments) and report findings only.
argument-hint: <files to review, or leave empty to review the current changes>
agent: agent
tools: ['read/readFile', 'read/problems', 'search/changes', 'search/codebase', 'search/fileSearch', 'search/textSearch', 'search/usages']
---
# /deslop - find the slop before it ships

## Goal
Review the files after `/deslop` (or, in a git repository, the current changes) for patterns that look finished but hide defects. Report findings. Do not fix them.

## Steps
1. Read each file in full. For tests, also read the code under test.
2. Check for each pattern:
   - Swallowed errors: empty `catch`, `catch` that only logs, fallbacks that hide failure.
   - Fake tests: `assert.ok(true)`, assertions that cannot fail, tests that only check a function exists, skipped or `.only` tests.
   - Duplicate helpers: code that re-implements something already exported elsewhere. Search for it.
   - Debug output: `console.log`, `print`, leftover tracing.
   - Narrating comments: comments that restate the next line.
   - Dead code, unused parameters, unreachable branches.
   - Magic values with no name or source.
   - Speculative abstraction: options, layers, or parameters nothing uses.
   - TODO stubs or placeholder returns.
   - Invented APIs: calls to members that do not exist.
3. For each finding, confirm it by reading the code. Do not report a pattern you only suspect.

## Output format
| # | file:line | Pattern | Why it matters | Smallest fix |
|---|---|---|---|---|

Then **Clean**: patterns you checked and did not find.

## Stop conditions
- Do not edit any file.
- Do not report style preferences as slop.
- If there is nothing to report, say so plainly.
