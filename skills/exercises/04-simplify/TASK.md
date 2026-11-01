# 04 - Use the function, not a framework

Run `npm run setup -- 04-simplify` and `npm run check -- 04-simplify --baseline`.
Expected red: numeric order and input immutability. Only edit `work/04-simplify/incident.mjs`.

The generated strategy factory is unnecessary and sorts numbers as strings. Required behavior: ascending numeric priority, stable ties, no input mutation, and empty input supported.

Invoke `/repo-conventions` on the learner `conventions.mjs`, then `/simplify-first`. Inspect both the comparator and immutable sorting example. Reuse the helper, keep the exported interface, and add no dependency or configuration system.

Run `npm run check -- 04-simplify`.

**Human acceptance:** explain why the abstraction is unnecessary and inspect the diff for scope. Automated tests prove behavior, not whether the design is the simplest useful one.

**Reflect:** Could fewer lines still be wrong? Which checks distinguish simplicity from merely hiding complexity?
