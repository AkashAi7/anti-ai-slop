# Facilitator guide

Use this guide to run the Commands lab as a workshop of 60 to 90 minutes, or as a self-paced session with one check-in.

## Prepare

- Open `Anti-Ai-Slop\commands` as its own VS Code workspace root, not the parent folder. The 12 custom commands in [.github/prompts](../.github/prompts) load only from the workspace root.
- Confirm that Node.js 22.20 or later is installed and that participants have Copilot access their organization allows.
- Explain tool approval, workspace trust, and the Chat view's **Session Target**. This lab expects **Local**.
- Run `npm.cmd test`. Every defective baseline should report its expected failures, and every reference solution should pass.
- Run `npm.cmd run studio` and click through all four modes. The studio is offline, so it also works on a projector with no network.
- Keep the reference solutions closed.
- Keep a [poster](../assets/posters/verify-after.png) or [transcript](../assets/transcripts/verify.md) ready in case an animation is unsuitable for the room.

## Frame the session

"Slop" is output that looks useful but fails the real need:

- invented helpers, config keys, packages, or APIs
- guessed requirements
- tests that can't fail
- drive-by edits outside the task
- swallowed errors
- "done" with no evidence

A slash command is a **contract**. It names a procedure, limits the tools, and says what evidence must come back. It doesn't make the model correct. The tests and the human gate still decide.

The GIFs, the studio scenes, and the Try it samples are **illustrative**. The terminal checks and the participants' own Copilot sessions are real, and they will differ from the script.

## Suggested agenda

| Block | What happens |
| --- | --- |
| Opening | Define slop, then show the [studio tour GIF](../assets/gifs/studio-tour.gif) or play **Watch → Verify** in the studio |
| Commands tour | In **Try it**, type `/`, pick `/verify`, and read the prompt file: steps, output format, stop conditions. Then try `/yolo` and read the warning |
| Mission | Participants score the 14 slop smells in **Mission** mode, then discuss the ones they missed |
| Beginner exercise | Everyone does 01 or 03 with the [beginner loop](beginner.md#the-loop-for-every-exercise) |
| Advanced exercise | Pairs pick one of 05 to 08 from the [advanced track](advanced.md) |
| Debrief | See [Debrief](#debrief) |

## Expected checkpoints

These counts were observed with `npm.cmd run check -- <id> --baseline` and `--solution`. See [VERIFICATION.md](../VERIFICATION.md).

| Exercise | Baseline passes | Solution passes | What the baseline shows | Human gate |
| --- | --- | --- | --- | --- |
| 01 | 1 of 6 | 6 of 6 | Guessed discount rules. The check names are hidden in TASK.md on purpose | Every acceptance criterion traces to the learner's own answers |
| 02 | 1 of 5 | 5 of 5 | Invented config keys and helpers, and hand-rolled date and money code | Open every file:line the `/ground` table cites |
| 03 | 1 of 5 | 5 of 5 | A lenient parser, and a test suite that can't catch it | The new tests are red on the original parser before the fix |
| 04 | 1 of 5 | 5 of 5 | CSV escaping is missing, `toCsvRow` isn't reused, and there is no HANDOFF.md | A teammate could finish the fix from HANDOFF.md alone |
| 05 | 1 of 5 | 5 of 5 | `left-pad`, an unverified `port-validator-strict`, and `fs.readJSONSync` | Every `/deps-check` row has evidence. Nobody ran `npm install` |
| 06 | 1 of 6 | 6 of 6 | Debug output, an empty `catch`, a duplicate helper, and a fake test | Every `/deslop` finding was fixed or rejected with a reason |
| 07 | 3 of 6 | 6 of 6 | Quantity is ignored, and there is no SCOPE.md or regression test | Every edit was approved by a human, and `legacy-pricing.mjs` is untouched |
| 08 | 2 of 6 | 6 of 6 | A hotfix that special-cases `'1,299.99'` | The bug reproduces with a different input, and that input passes after the fix |

## Recovery without cheating

- **Custom commands don't appear when you type `/`:**
  1. Check that the workspace root is the `commands` folder.
  2. Check that the **Session Target** is **Local** and the chat is in agent mode.
  3. Start a fresh chat.
  4. Check whether organization policy disables prompt files.
  5. Check whether a personal prompt file uses the same name.

  Don't pretend a pasted prompt proves that the command loaded.
- **The agent guesses instead of asking:** stop it, run `/clarify` again, and tell it to wait for answers.
- **The agent edits `checks.mjs` or weakens a test:** reject the edit. The checks are the referee, not part of the exercise.
- **The agent opens `solution/`:** say so, and move that participant to a different exercise. That result isn't unaided.
- **A check fails unexpectedly:** read the real output. A setup error isn't the expected red baseline. Don't substitute a scripted success.
- **No Copilot connectivity:**
  - Run the local checks, the studio, and the transcripts.
  - Mark live command invocation as not observed.
- **A participant wants to start over:** use `reset` in `npm.cmd run demo`. It asks them to type `reset <exercise-id>` and recreates only that learner copy.

## Live VS Code checklist

The Node test suite can't observe VS Code itself. Record these yourself:

1. Open `Anti-Ai-Slop\commands` as the workspace root, and start a fresh chat with **Session Target: Local** in agent mode.
2. Type `/` and confirm that all 12 custom commands appear: `/clarify`, `/spec`, `/ground`, `/deps-check`, `/deslop`, `/verify`, `/root-cause`, `/pre-commit`, `/fail-paths`, `/simplify`, `/scope`, and `/handoff`.
3. Run `/clarify` on exercise 01. Confirm that it asks at most 5 questions, proposes a default for each, waits, and writes no code.
4. Run `/verify` on any exercise. Confirm that it ran real commands, that each command shows an exit code, and that the verdict is VERIFIED or NOT VERIFIED.
5. Confirm that a read-only command (`/ground` or `/deslop`) doesn't edit files, even when you ask it to.
6. Run `/disableAutoApprove`. Confirm that the next edit or terminal command waits for approval.
7. Check whether `/clarify`, `/ground`, `/verify`, and `/handoff` are offered as suggestions in a new chat. That comes from `chat.promptFilesRecommendations` in [.vscode/settings.json](../.vscode/settings.json). Record what you see, because the behavior depends on the VS Code version.
8. Finish one beginner exercise and one advanced exercise with real edits and green checks.

Observed record template. Don't include participant names, tokens, or private chat content:

```text
Date:
VS Code version / Copilot Chat version:
Session Target / agent:
12 custom commands visible in / menu: yes/no (missing: )
/clarify waited for answers: yes/no
/verify reported commands with exit codes: yes/no
Read-only command refused edits: yes/no
/disableAutoApprove required approval: yes/no
Prompt-file recommendations shown: yes/no/not supported
Beginner exercise + check result:
Advanced exercise + check result:
Not observed / limitations:
```

## Debrief

Ask each participant for three things:

- one slop pattern a command caught before it shipped
- one command output they checked and found wrong or incomplete
- one command they'll add to their own repository, and the evidence it should return

Discuss whether the commands reduced rework **in this task**. Don't cite productivity statistics. This lab doesn't produce any.
