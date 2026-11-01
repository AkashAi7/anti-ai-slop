---
name: repo-conventions
description: 'Align a change with local engineering patterns. Use before introducing new naming, helpers, dependencies, error handling, test style, or architecture into an existing codebase.'
---

# Repository conventions

1. Read applicable project instructions, manifests, and nearby code relevant to the change.
2. Select two representative examples where available; do not infer a universal rule from one incidental line.
3. Record concrete conventions for naming, interfaces, failure handling, tests, and dependencies with file references.
4. Reuse shared helpers rather than duplicating behavior. Prefer the nearest maintained pattern, not an outdated outlier.
5. If instructions conflict with existing code, surface the conflict and ask when it affects behavior. Do not silently normalize unrelated files.
6. Implement only the requested change and run the repository's appropriate checks.

**Output:** a short convention/evidence list, aligned change, and explicit deviations.

Never copy secrets or private identifiers into a new example. A reference solution is not a substitute for inspecting the learner task.

**Lab:** exercise 04 supplies `conventions.mjs`; inspect its comparator and immutable sorting example.
