---
name: grill-me
description: 'Stress-test a request, plan, or design before implementation. Use when asked to grill me, challenge assumptions, clarify ambiguity, or interview me about trade-offs.'
disable-model-invocation: true
---

# Grill me

Challenge the proposal respectfully, not the person. Do not start implementation.

1. Read the supplied task and relevant local evidence. Distinguish facts you can inspect from choices only the user can make.
2. Map the decisions as a tree: goal -> scope -> observable behavior -> constraints -> verification. Identify dependencies between questions.
3. Ask the current frontier: only decisions whose prerequisites are settled. Number the questions, explain the consequence, and recommend a choice. Use the host's structured question tool when available; otherwise ask in chat.
4. Wait for the user's answers. Do not answer on their behalf. Recompute the frontier and ask the next round. Do not repeatedly ask settled questions.
5. If the user pauses, declines, or wants a bounded pass, stop and mark remaining assumptions unresolved. Do not make the interview an obstacle to progress.
6. Summarize the agreed decision brief: goal, audience, inputs, outputs, failure behavior, examples, non-goals, and unresolved choices.
7. Ask the user to confirm the brief. Only implement after explicit authorization.

Inspect code directly for small factual lookups. A subagent is optional when supported and justified by a substantial independent investigation; it is not a prerequisite.

**Output:** decision brief and unresolved choices, not speculative implementation.

**Lab:** exercise 01. Then invoke `/scope-contract` to make the decisions testable.

Adapted from Matt Pocock's MIT-licensed `grill-me` and `grilling`. This combines the wrapper and procedure, removes host-specific tool dependencies, and adds bounded, respectful interaction. See [license](./LICENSE) and [source records](../../../sources.json).
