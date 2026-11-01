---
name: simplify-first
description: 'Reduce over-engineering while preserving observable behavior. Use when an AI adds unnecessary frameworks, generic factories, options, abstractions, or large diffs for a small request.'
---

# Simplify first

1. Read the accepted contract and the existing implementation/callers.
2. List essential behavior separately from speculative flexibility.
3. Search for an existing helper or pattern. Use `/repo-conventions` if conventions are unclear.
4. Identify the smallest design that satisfies actual requirements and handles required failures.
5. Add or run behavioral checks before changing structure. Preserve public interfaces and user work.
6. Remove unnecessary layers incrementally; do not use code-golf or compress logic until it is unreadable.
7. Compare before/after behavior, input mutation, dependencies, and change scope. Explain any intentional behavior change.

**Output:** unnecessary complexity identified, smaller design, behavior evidence, remaining trade-offs.

Do not treat fewer lines as proof of correctness. A necessary validation check is not "slop" merely because it adds code.

**Lab:** exercise 04. Prefer the provided numeric comparator over a configurable strategy/factory.
