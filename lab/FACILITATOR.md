# Facilitator run sheet

## Preflight, before participants arrive

1. Download `anti-slop-lab.zip` (or clone the repo and `cd lab`). Follow the
   [environment guide](README.md) and run `npm run doctor` for each track.
2. Run setup for `builtins`, `skills`, and either `spec-kit` (VS Code) or
   `spec-kit-skills` (Copilot app). For Lab 2 also run `npm run skills`.
3. Confirm the baselines: cart 3/7, discount 2/10. Red is intentional.
4. In the real client, confirm sign-in, organization policy, network and
   model access. Type `/` and `/skills` in each workspace. Setup and GIFs do
   not validate a live Copilot session.
5. Open the [workshop site](https://akashai7.github.io/anti-ai-slop/). Each
   GIF plays full screen with Stop, replay and Esc. Transcripts work without
   animation.

## Lab 1: /commands + Spec Kit (75 minutes)

| Time | Show (GIF) | Participants do | Evidence |
| --- | --- | --- | --- |
| 0-10 | Built-in vs Spec Kit vs skills | Open `work\builtins`, run the baseline, type `/` | Exact workspace, client, red baseline |
| 10-25 | Explain first, plan a contained repair | `/explain`, `/plan` (VS Code) or `/plan` (app) | Root cause file:line, frozen scope |
| 25-35 | Make tests red, fix the cause, prove green | `/tests`, `/fix`, run checks | Red before fix, `VERIFIED: 7/7`, diff |
| 35-45 | Constitution, specification, clarification | `/speckit.constitution`, `.specify`, `.clarify` | Explicit stacking, rounding, expiry decisions |
| 45-55 | Plan, checklist, tasks, analysis | `/speckit.plan` ... `/speckit.analyze` | Requirement-linked tasks, resolved findings |
| 55-70 | Implement agreed tasks, converge, verify | `/speckit.implement`, `/speckit.converge` | `VERIFIED: 10/10`, reviewed documents and diff |
| 70-75 | Review, challenge, manage context (app) | `/review`, `/rubber-duck`, `/compact` | Unresolved work stated honestly |

Short on time? Run Part A only and schedule Spec Kit separately. Do not rush
clarification or the red-test checkpoint.

## Lab 2: anti-slop skills (60-75 minutes)

| Time | Show (GIF) | Participants do | Evidence |
| --- | --- | --- | --- |
| 0-10 | Find skills. Load reviewed copies. Prove the path. | `/skills` in VS Code or app; `/af` in the app | Loaded skills and their source folders |
| 10-15 | (same) | `npm run setup -- skills`, `npm run skills`, `/skills reload` | Sixteen workspace entries: ten pinned upstream and six lab-authored |
| 15-25 | Grill the plan before any code | `/grill-me`, answer each round, then confirm | Agreed decisions; no edits before "Confirmed" |
| 25-35 | Stop guessing, trace the defect | `/systematic-debugging`, no edits | Reproduction and root-cause citation |
| 35-50 | Make a useful test fail first | `/test-driven-development`, then approve the repair | Meaningful red run, then green |
| 50-60 | Replace "done" with fresh evidence | `/verification-before-completion`, run checks yourself | Fresh `VERIFIED: 7/7`, reviewed diff |
| 60-75 | Push back, simplify, then write it plainly | `/receiving-code-review`, `/code-simplification`, `/humanizer` | A decision per review comment, still 7/7, PR text with only proven claims |

Short on time? Skip Part E and assign it, with Part F, as take-home practice.
Do not skip the grilling confirmation or the red-test checkpoint.

Optional 30-45 minute extension: use the six engineering skills in Part G for
security review, API compatibility, dependency triage, migration planning,
performance measurement and accessibility review. The GIF demonstrates the
installed `/security-review` skill before test-first repair. Keep security and
accessibility checks read-only; the migration case is hypothetical, and the
performance result is synthetic. Use a fresh extracted lab copy if the original
`work\skills` has already been repaired; never overwrite learner work.

`/grill-me` hands over to the `grilling` skill. If the agent starts editing
instead of asking questions, check tool activity for
`.github/skills/grilling/SKILL.md` and resend the prompt with `/grilling`.
`superpowers:<name>` in upstream text is plugin notation, not a slash command
here. Use the plain name from the picker. Do not let participants delete
existing work or run upstream example scripts.

These are suggested timings, not measured productivity claims.

## Stop conditions

- A command or skill is missing: fix the client, folder or layout. Do not
  substitute a homemade `/verify` or `/clarify`.
- The agent edits during explain, plan, clarify or debugging: stop, inspect
  the change, and return to the agreed plan.
- New tests pass on the broken code: ask for stronger assertions.
- "All tests pass" without a real command and exit code: run the check yourself.
- A Spec Kit checklist is ticked without review. A checkbox is not a test.
- A change touches the catalogue, legacy files, dependencies, checker or skill
  files: reject it.

## Learner completion card

- [ ] Used real commands and skills in the actual local client.
- [ ] Explained the defect with source evidence before editing.
- [ ] Approved scope, or a clarified specification, before implementation.
- [ ] Captured a regression that failed before the fix.
- [ ] Passed independent acceptance, including the original-code replay.
- [ ] Reviewed changed and untracked files.
- [ ] Lab 1: reviewed constitution, spec, plan, tasks and analysis findings.
- [ ] Lab 2: confirmed the exact workspace skill path, not a same-named
      personal copy, and answered the grilling rounds before any edit.
- [ ] Lab 2: decided each review comment with evidence and kept only claims
      the checks proved in the PR description.
- [ ] Lab 2 optional extension: recorded results and limitations for each of the
      six engineering skills.
- [ ] Recorded remaining limitations; did not treat a GIF as proof.

## Reference solutions

Reference code and example documents are in `fixtures/<track>/reference`.
They are never copied into a learner workspace. Show them only after learners
try the exercise.

Run `npm.cmd test` in the lab directory to check every baseline and reference,
non-overwriting setup, weak-test and scope rejection, and skill integrity. It
does not call Copilot.
