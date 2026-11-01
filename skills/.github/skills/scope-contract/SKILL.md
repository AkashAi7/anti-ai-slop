---
name: scope-contract
description: 'Turn agreed requirements into a small observable contract. Use when defining acceptance criteria, non-goals, edge cases, or preventing scope creep before coding.'
---

# Scope contract

1. Read the request, agreed decisions, and relevant existing interfaces. Do not invent missing product decisions.
2. State the outcome, allowed inputs, output shape, and error behavior. Separate known constraints from assumptions.
3. Add concrete examples: normal input, empty/boundary input, and invalid input. Make each acceptance criterion independently observable.
4. Name non-goals and permitted change surfaces. Exclude speculative extensibility.
5. Map each criterion to a test, inspection, or human decision. Explain what cannot be automatically verified.
6. Ask about only material unresolved choices; otherwise give the user the concise contract for confirmation.

**Output:**

```text
Goal:
Inputs / outputs:
Acceptance examples:
Failure behavior:
Non-goals / allowed files:
Verification:
Unresolved choices:
```

Do not treat matching a JSON schema or a checklist as proof of product correctness. Do not implement while the user is still choosing the contract.

**Lab:** exercises 01 and 08.
