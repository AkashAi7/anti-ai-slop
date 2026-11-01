---
name: fail-paths
description: Enumerate edge cases and failure paths, write tests for them, and run them. Never weakens an assertion to get green.
argument-hint: <function or file to probe>
agent: agent
tools: ['read/readFile', 'read/problems', 'search/codebase', 'search/fileSearch', 'search/textSearch', 'search/usages', 'edit/createFile', 'edit/editFiles', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/testFailure']
---
# /fail-paths - test what breaks, not just what works

## Goal
For the code after `/fail-paths`, write tests for the inputs most likely to break it, run them, and report what really happens.

## Steps
1. Read the code and its existing tests. Find the stated contract (docs, spec, types, or the request).
2. List the edge cases: empty input, wrong type, boundaries, malformed input, duplicates, ordering, very large values, and error paths.
3. For each case, write the expected behavior from the contract. If the contract does not say, mark it as a question instead of inventing an answer.
4. Add tests to the existing test file, in the project's existing test style.
5. Run the test command. Record which new tests fail. A failing test is a finding, not a mistake.

## Output format
| Case | Input | Expected (source) | Test name | Result |
|---|---|---|---|---|

Then the command you ran with its exit code, and **Questions for the contract**.

## Stop conditions
- Edit only test files unless the request explicitly asks for a fix.
- Never weaken, delete, or skip an assertion to get green.
- No `assert.ok(true)` or tests that cannot fail.
