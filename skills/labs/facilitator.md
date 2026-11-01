# Facilitator guide

## Prepare

- Open this lab as a separate VS Code workspace root.
- Confirm Node >=22.20 and Copilot access. Explain tool approval and workspace trust.
- Run `npm test`; intentional defective fixtures should be recognized as expected failures, while solutions pass.
- Run `npm run demo` and select a task. Keep reference solutions closed.
- Keep a [static poster](../assets/posters/01-grill-me-after.png) or [transcript](../assets/transcripts/01-grill-me.md) ready if animation is unsuitable.

## Frame the session

"Slop" means output that looks useful but fails the actual need: invented facts, empty tests, excessive design, ignored conventions, hidden failures, or unsupported completion claims. This is not a claim about a particular model or a guarantee that skills eliminate mistakes.

The GIFs are explicitly **illustrative**. The terminal checks and participants' Copilot sessions are real and may differ from the script.

## Expected checkpoints

| Exercise | Defective baseline | Reference solution checks | Human gate |
| --- | --- | --- | --- |
| 01 | Missing contract detail | 2 | Decisions and examples actually match |
| 02 | Unsupported claims and dependency choice | 2 | Source supports the conclusion; unknown remains unknown |
| 03 | Wrong count and ineffective regression | 4 | Observe red before implementation change |
| 04 | String ordering and input mutation | 3 | Small design using local patterns |
| 05 | Unit conversion and missing-input concealment | 3 | Hypothesis follows the trace |
| 06 | Swallowed syntax error and wrong shape | 4 | Failure stays distinguishable from empty success |
| 07 | Zero/falsy invalid defaults and ungrounded agreement | 3 | Comment dispositions are justified |
| 08 | Unfiltered summary and unsupported handoff | 4 | Report matches observed commands/results |

## Recovery without cheating

- **Skill unavailable:** check the workspace root, customizations list, fresh chat, harness, policy, and duplicate names. Do not claim a prompt-only fallback proves skill discovery.
- **Agent guesses choices:** pause; explicitly invoke `/grill-me` and ask it to wait for answers.
- **Agent edits acceptance checks:** reject that change and restore only the learner-authorized change through normal review. Do not reset unrelated user files.
- **Unexpected test failure:** inspect the real output; setup errors are not an expected red baseline. Use the actual error, not a scripted success.
- **Agent inspects a solution early:** disclose it and start a different independent exercise; do not present it as an unaided result.
- **No Copilot connectivity:** run local fixtures and use labeled transcripts, but mark actual skill invocation unverified.
- **Learner wants to retry:** use the guide's confirmed reset for that exercise only.

## Actual Copilot client checklist

Record these observations yourself; the Node suite cannot establish them:

1. Open `Anti-Ai-Slop\skills` as the workspace root in a fresh chat.
2. Confirm all 12 skills appear in the intended client's skill/customization list. Check the actual file path when personal names overlap.
3. Invoke `/grill-me` on exercise 01. Confirm it loads this lab's skill, asks consequential questions, waits, and does not implement prematurely.
4. Invoke the remaining skills on their mapped exercises. Confirm relevant instructions/resources are used; do not infer loading from a similar answer.
5. Run at least one beginner code exercise (03 or 04) and one advanced exercise (05-08) through real learner-file edits and local checks.
6. Complete the task-specific human rubrics. Save actual command/result evidence in learner notes.
7. Separately test automatic selection where supported. `grill-me` is intentionally explicit-only. Do not treat a missed automatic trigger as a passing discovery test.
8. Record client/version/harness and limitations in your own workshop notes; do not include participant identities, tokens, or private conversations in shared artifacts.

Suggested observed record:

```text
Workspace root:
Client / harness:
12 skills visible: yes/no
Explicit invocation evidence:
Beginner exercise + command/results:
Advanced exercise + command/results:
Automatic-selection observations:
Unverified limitations:
```

## Debrief

Ask participants to identify one changed decision, one real failure caught, and one uncertainty they retained. Discuss whether the mechanism reduced unnecessary rework in this task without inventing causal productivity statistics.
