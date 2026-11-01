---
name: test-driven-development
description: 'Use before implementing a feature or bug fix: write a behavioral test, observe the intended failure, make the smallest passing change, and verify regressions.'
---

# Test-driven development

Evidence of failure precedes a claim that a test protects behavior.

1. Read the contract and current tests. Identify the observable behavior, not an implementation detail.
2. Write one focused assertion against real production behavior. Name a plausible defect that would make it fail.
3. Run it before changing implementation. Verify it fails because of the missing/incorrect behavior, not syntax, missing tools, or broken setup. If it passes unexpectedly, investigate rather than weakening it.
4. Make the smallest change that satisfies the assertion. Keep unrelated code and existing user work.
5. Run the new check, then the relevant regression suite. Report failures and any scope you could not verify.
6. Refactor only while the checks remain green. Do not add speculative features.
7. Where practical, run the regression against a known-defective fixture to prove it detects the original bug.

Do not delete user code to restart a workflow. For an existing implementation, preserve it and add the missing regression first. In this lab, use isolated learner copies and supplied defective fixtures.

**Reject:** empty tests, skipped assertions, asserting only on mock call counts, rewriting expected values to match the bug, and swallowing assertion failures.

**Output:** failing command + intended failure, minimal change, passing command + relevant regression evidence.

**Lab:** exercise 03, including the learner-authored `regression.mjs`.

Adapted and condensed from Jesse Vincent's MIT-licensed Superpowers TDD skill. Removed destructive restart instructions, framework-specific examples, and external skill dependencies. The complete portable procedure is above; no plugin is needed. See [license](./LICENSE) and [source records](../../../sources.json).
