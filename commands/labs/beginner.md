# Beginner track - exercises 01 to 04

These four exercises teach the four habits that prevent the most common slop:

- ask before you code
- prove that things exist before you use them
- see a test fail before you trust it
- move decisions into a file instead of a long chat

Each exercise is independent. Do them in any order.

Before you start, open `Anti-Ai-Slop\commands` as the VS Code workspace root (not the repository root) and set the Chat view's **Session Target** to **Local**. Type `/` in chat and confirm that `/clarify`, `/ground`, `/fail-paths`, and `/handoff` appear. These are this lab's prompt files, not built-in commands, so they appear only with this folder open. If they don't, see [If a lab command doesn't appear](../COMMANDS.md#if-a-lab-command-doesnt-appear).

| Exercise | Command flow | Slop it removes | Evidence to keep |
| --- | --- | --- | --- |
| [01 - Clarify before you code](../exercises/01-clarify-before-code/TASK.md) | `/clarify` → `/spec` → `/plan` | Guessed business rules: stacked codes, fractional cents, silently ignored bad codes | The `/clarify` questions, your answers, and a SPEC.md whose acceptance criteria trace to those answers |
| [02 - Ground it in the repo](../exercises/02-ground-in-the-repo/TASK.md) | `/init` → `/ground` → `/verify` | Invented helpers and config keys, a hedge fallback, and hand-rolled money formatting | The `/ground` table with a file:line for every EXISTS row, and the `/verify` verdict |
| [03 - Prove it with tests](../exercises/03-prove-it-with-tests/TASK.md) | `/fail-paths` → `/tests` → `/verify` | A test that can never fail, and a parser that accepts anything | Red output from your new tests on the original parser, then green after the fix |
| [04 - Hand off, then start clean](../exercises/04-clean-context-handoff/TASK.md) | `/handoff` → `/clear` → `/compact` | Decisions buried in a long chat, with a rejected idea waiting to come back | A HANDOFF.md of 60 lines or fewer that a fresh chat could finish the fix from |

## The loop for every exercise

1. **Set up** your learner copy. The starter is never edited:

   ```powershell
   npm.cmd run setup -- 01-clarify-before-code
   ```

2. **See the baseline fail.** Read why each check fails. That's the slop you're about to remove.

   ```powershell
   npm.cmd run check -- 01-clarify-before-code --baseline
   ```

3. **Read the TASK.md** and start a **fresh chat**. Run the first command in the flow with the prompt from `npm.cmd run demo` → `prompt`.
4. **Act as the human gate.** Answer questions yourself, read every table the command returns, and approve or reject each edit. A command's output is a claim until you have checked it.
5. **Run the checks.** A failure is feedback, not permission to weaken the checks.

   ```powershell
   npm.cmd run check -- 01-clarify-before-code
   ```

6. **Do the human acceptance step** in the TASK.md. Automated checks can't judge whether a decision was right.
7. **Stuck?** Use `hint` in the guide. Open `solution/` only after you have made an attempt.

## What each command adds

- **`/clarify`** is read-only. It asks at most 5 questions, each with a reason and a proposed default, then stops. You answer the questions; the model doesn't.
- **`/spec`** is read-only. It turns your answers into decisions and acceptance criteria. You paste them into SPEC.md yourself.
- **`/plan`** is built in. It produces a step-by-step plan for your approval before any code changes.
- **`/init`** is built in. It generates workspace instructions so later chats start from the repo's real conventions.
- **`/ground`** is read-only. It lists every helper, config key, and API the change needs, and marks each one:
  - **EXISTS**, with file:line
  - **SIMILAR**, with file:line and what differs
  - **MISSING**, with what it searched for

  Code that uses a MISSING item is using an invented API.
- **`/fail-paths`** edits tests only. It lists edge cases and writes failing tests before any fix, and it never weakens an assertion to get green.
- **`/tests`** is built in. It fills the remaining test gaps. Delete any generated assertion that can't fail.
- **`/verify`** runs commands but can't edit files. It runs the checks and reports each command, its exit code, and the observed result. The verdict is VERIFIED or NOT VERIFIED.
- **`/handoff`** writes one artifact. It produces HANDOFF.md with the goal, state, decisions, evidence, open questions, and next steps, and it cites only paths that exist.
- **`/clear`** and **`/compact`** are built in. `/clear` starts a clean session. `/compact` summarizes a long one. Check that the summary kept the decisions.

## Completion

For each exercise, you can point to:

- the green check output
- the command output you used as evidence
- one slop pattern that the command flow stopped from shipping

No speedup figure or productivity score comes out of this lab. What you leave with is the evidence.

Continue with the [advanced track](advanced.md), or practice with the [Command Studio](../studio/index.html) Mission mode.
