---
name: review-feedback
description: 'Evaluate code review feedback against requirements and tests before applying it. Use when feedback conflicts, suggests an unneeded change, or an agent agrees without checking.'
---

# Review feedback

1. Restate each requested change neutrally and identify its claimed problem.
2. Read the actual code, contract, callers, and tests. Do not accept a suggestion merely because it is confidently phrased.
3. Classify it: accept, reject with evidence, or clarify.
4. For a valid defect, reproduce it, add a regression, and apply the smallest fix.
5. For an invalid suggestion, explain the counterexample and retain a regression proving intended behavior.
6. For ambiguity, ask a focused question rather than inventing the reviewer's intent.
7. Verify the resulting behavior and report each comment's disposition without personal judgments.

**Output:** comment ID -> disposition -> contract/code/test evidence -> action.

Do not invent review comments or pretend to have run a test. Keep unrelated cleanup separate.

**Lab:** exercise 07 contains one misleading suggestion and one useful suggestion. Both require evidence, not reflexive agreement.
