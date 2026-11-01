---
name: systematic-debugging
description: 'Investigate root causes before changing code. Use for failing tests, unexpected behavior, flaky fixes, boundary errors, or repeated speculative patches.'
---

# Systematic debugging

Do not patch a symptom before gathering evidence.

1. Reproduce the issue and retain the exact command, error, input, and observed behavior. If not reproducible, state the gap.
2. Trace the relevant data backward across boundaries: who produces it, what units/schema it has, and who consumes it. Inspect the nearest working example.
3. Form one falsifiable hypothesis: "X happens because Y; check Z would distinguish this from W."
4. Test that hypothesis with one small experiment. Avoid bundled fixes and arbitrary sleeps/retries.
5. Once supported, add a behavioral regression (use `/test-driven-development`) and change the responsible boundary.
6. Run the reproduction and regression checks. Use `/verification-before-completion` before claiming the issue is fixed.
7. If repeated distinct attempts fail, stop stacking patches. Summarize evidence and ask whether to revisit assumptions or architecture.

Log only what is needed; do not expose credentials or private payloads. "Unknown root cause" is an acceptable honest outcome, not a reason to manufacture certainty.

**Output:** reproduction -> trace -> hypothesis -> experiment -> cause -> minimal fix -> verification.

**Lab:** exercise 05. Trace units before considering any retry mechanism.

Adapted and condensed from Jesse Vincent's MIT-licensed Superpowers systematic debugging skill. Replaces plugin-qualified calls with local skill names, omits platform-specific shell utilities, and removes unsupported quantitative claims. This is self-contained; no upstream helper scripts are required. See [license](./LICENSE) and [source records](../../../sources.json).
