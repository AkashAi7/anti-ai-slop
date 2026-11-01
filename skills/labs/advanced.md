# Advanced track

Each fixture is independent; do not transfer a prior exercise's contract without reading this one.

| Exercise | Skills | Human challenge |
| --- | --- | --- |
| [05 - Debug](../exercises/05-debug/TASK.md) | `/systematic-debugging` | Distinguish a traced cause from a lucky patch |
| [06 - Failure paths](../exercises/06-failure-paths/TASK.md) | `/failure-paths` | Explain valid-empty versus failed-read semantics |
| [07 - Review](../exercises/07-review/TASK.md) | `/review-feedback`, `/evidence-first` | Reject incorrect advice and recognize already-covered valid advice |
| [08 - Capstone](../exercises/08-capstone/TASK.md) | `/scope-contract`, `/verification-before-completion`, `/concise-handoff` | Prove only what was tested and retain unverified limitations |

Run `npm run demo`, select the exercise, and use `setup`, `baseline`, `prompt`, and `check`. Keep solution inspection opt-in.

## Challenge variants

- **05:** State an alternative hypothesis and the observation that rules it out.
- **06:** Explain where the calling application, rather than a pure parser, should log or notify.
- **07:** Add a counterexample to the misleading feedback before implementing anything.
- **08:** Ask a peer to compare the handoff claim-by-claim against actual terminal output.

These extensions are discussion/learner-test work; do not silently expand the production contract or edit the supplied acceptance harness.

## Exit criteria

Show the cause or decision, the smallest justified change, current verification, and remaining uncertainty. In particular, a local green suite is not proof of live integration, security, or production readiness.
