---
name: root-cause
description: Reproduce a bug, test at most 3 hypotheses, and confirm the root cause before any fix. Rejects special-casing the reported input.
argument-hint: <the bug report or failing behavior>
agent: agent
tools: ['read/readFile', 'read/problems', 'read/terminalLastCommand', 'search/codebase', 'search/fileSearch', 'search/textSearch', 'search/usages', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/testFailure']
---
# /root-cause - fix the defect, not the ticket

## Goal
Find the actual cause of the bug after `/root-cause`. Prove it with a reproduction before proposing a fix.

## Steps
1. **Reproduce**: run the smallest command that shows the failure for the reported input. Record the command and its output.
2. **Generalize**: try at least 3 other inputs of the same shape. A bug that only fails for one exact value is rare. Record which inputs fail.
3. **Trace**: read the code path for a failing input and find where the value first goes wrong.
4. **Hypothesize**: write at most 3 hypotheses. For each, name the observation that would confirm or reject it.
5. **Confirm**: run that check. Keep only the hypothesis the evidence supports.
6. **Propose**: describe the smallest fix at the root cause, the regression tests that would fail before and pass after it, and other inputs or callers that are affected.

## Output format
- **Reproduction**: command, input, observed output.
- **Other failing inputs**: table with Input | Expected | Observed.
- **Hypotheses**: numbered, each marked Confirmed or Rejected, with its evidence.
- **Root cause**: file:line and one sentence.
- **Proposed fix** and **Regression tests**: described, not applied.

## Stop conditions
- Do not edit files. The fix is a proposal.
- Reject any fix that compares against the reported input or ticket value (for example `if (input === '1,299.99')`). That is a symptom patch.
- If you cannot reproduce the bug, stop and say what you tried.
