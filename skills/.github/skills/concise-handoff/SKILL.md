---
name: concise-handoff
description: 'Write a short, evidence-backed engineering handoff. Use for completion reports, implementation summaries, remaining-work notes, or replacing verbose unsupported claims.'
---

# Concise handoff

1. Read the actual change and verification evidence. Use `/verification-before-completion` when evidence is missing.
2. Lead with the observable outcome, not praise or a history of every action.
3. List the meaningful changes and decisions, with file references.
4. State the checks actually run and their outcomes. Explicitly name what was not checked.
5. Separate blockers from optional improvements and provide the next necessary action.
6. Remove repetition, vague superlatives, and unsupported performance/productivity claims. Preserve warnings and useful technical detail.

**Output:**

```text
Changed:
Verified (commands/results):
Not verified / limitations:
Next action:
```

Concise does not mean omitting a failure or pretending that an illustrative transcript is real execution evidence.

**Lab:** exercise 08.
