---
name: verification-before-completion
description: 'Require fresh evidence before saying a change is done, fixed, or passing. Use before completion reports, handoffs, commits, or claims that requirements are met.'
---

# Verification before completion

Evidence before success claims.

1. Identify each claim and the check that could actually prove it. A lint pass does not prove runtime behavior.
2. Run the relevant command on the current files, not a remembered earlier state.
3. Read the complete result and exit status. Check counts, skips, failures, and whether the intended files were covered.
4. Compare the result against the acceptance criteria. Include boundary/failure cases and relevant regressions.
5. If a check fails or cannot run, say so plainly with the exact limitation. Do not turn a missing tool, timeout, or skipped test into success.
6. Report only claims supported by the evidence. Keep human decisions, visual checks, and automated checks separate.

**Output:** claim | exact command/check | observed result | verified scope | limitation.

If report metadata must be finalized after the behavioral run, distinguish the behavior check from the final report-shape check. Never fill in invented test output to make a handoff look complete.

**Lab:** exercise 08. Reference solution evidence is clearly labeled fixture evidence, not a record of the participant's work.

Adapted and condensed from Jesse Vincent's MIT-licensed Superpowers verification skill. Removes host/workflow-specific assumptions; retains the evidence gate and explicit inability-to-verify reporting. See [license](./LICENSE) and [source records](../../../sources.json).
