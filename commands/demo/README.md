# Presenter walkthrough - 15 minutes

A repeatable live demo of the Commands lab. It runs in three parts:

- **the problem**: an illustrative walkthrough
- **the commands**: the offline Command Studio
- **the proof**: one real exercise with real checks

Nothing here needs network access except the Copilot chat itself.

## Before the audience arrives

1. Open `Anti-Ai-Slop\commands` as the VS Code workspace root.
2. In the Chat view, set **Session Target** to **Local**, choose agent mode, and type `/` to confirm that `/fail-paths` and `/verify` appear.
3. Prepare a fresh copy of exercise 03. If `work/03-prove-it-with-tests` already exists from a rehearsal, run `npm.cmd run demo`, pick 03, and use `reset`.

   ```powershell
   npm.cmd run setup -- 03-prove-it-with-tests
   ```

4. Open the studio. In the browser, add `#watch/verify` to the end of the address so it opens on the Verify scene.

   ```powershell
   npm.cmd run studio
   ```

5. Keep a terminal open at the lab root, and keep `work/03-prove-it-with-tests/duration.test.mjs` open in the editor.

## The script

| Minute | Show | Say |
| --- | --- | --- |
| 0-2 | Studio **Watch → Verify**, played through. Or show [verify.gif](../assets/gifs/verify.gif) | "This test has passed since the day it was written, because `assert.ok(parseDuration('1h30m'))` can't fail. That's slop: it looks like coverage and proves nothing. This walkthrough is illustrative, but the check output at the end is real." |
| 2-5 | **Try it** (press `2`). Type `/`, arrow to `/verify`, press Tab to fill it in, then press Enter. Scroll through the reply, which shows the prompt file and a sample answer | "A custom command is a prompt file. It sets the tools (`/verify` can run commands but can't edit), the steps, the evidence format (command, exit code, observed result), and the stop conditions: it never says 'should pass' without an exit code." |
| 5 | Type `/yolo` and press Enter | "Some built-ins remove a safety checkpoint. `/yolo` is an alias for `/autoApprove`. We teach `/disableAutoApprove` instead." |
| 5-7 | **Mission** (press `3`). Ask the audience about two or three smells | "Which command fixes this smell?" Click their answer and read the explanation. |
| 7-13 | VS Code: exercise 03 live | See [Live exercise](#live-exercise). |
| 13-15 | **Commands** (press `4`). Type `context`, then clear the search | "43 commands: 31 built-ins, 12 prompt files. To reuse the prompt files, copy `.github/prompts` into your repo. Every claim gets evidence, and the checks decide." |

## Live exercise

1. Show the defect is real:

   ```powershell
   npm.cmd run check -- 03-prove-it-with-tests --baseline
   ```

   1 of 5 checks pass. Point out `learner suite catches the original parser`. The existing test can't catch anything.

2. In a fresh Local chat, run:

   ```text
   /fail-paths parseDuration in work/03-prove-it-with-tests/duration.mjs. Add edge-case tests to work/03-prove-it-with-tests/duration.test.mjs and run them. Do not change duration.mjs yet.
   ```

   Read the case table out loud. Approve the test edits only. When the new tests go **red** against the original parser, those failures are findings.

3. Ask the agent to make `duration.mjs` meet the contract in the [TASK.md](../exercises/03-prove-it-with-tests/TASK.md) without editing the tests. Review the diff, then run `/verify`. Show that every claim has a command and an exit code.

4. Close with the real check:

   ```powershell
   npm.cmd run check -- 03-prove-it-with-tests
   ```

The agent's output will differ from the walkthrough, and that's expected. If it weakens an assertion or edits `checks.mjs`, reject that change on screen. That's the lesson working.

## Fallbacks

| Problem | Do this instead |
| --- | --- |
| Animations are unsuitable for the room | Show the [before](../assets/posters/verify-before.png) and [after](../assets/posters/verify-after.png) posters and read the [transcript](../assets/transcripts/verify.md) |
| The studio doesn't open | Run `npm.cmd run studio -- --print` and paste the `file:///` URL into a browser |
| Copilot is unavailable or slow | Walk through the transcript, then run `npm.cmd run check -- 03-prove-it-with-tests --solution` and say plainly that this is the **reference solution**, not a live agent result |
| Custom commands are missing from `/` | Check that the workspace root is `commands` and the Session Target is Local, then start a new chat. See [Recovery](../labs/facilitator.md#recovery-without-cheating) |
| You have more time | Swap in exercise 07: `/scope`, then `/disableAutoApprove`, then `/pre-commit`. Use the [contain.gif](../assets/gifs/contain.gif) for the intro |

## What this folder contains

- [scenarios.json](scenarios.json) has the five walkthrough scenes. The studio's Watch mode and the GIF recorder both read them.
- [samples.json](samples.json) has the illustrative sample answers that Try it shows for each custom command. They cite real paths and lines from the exercise starters.

After you edit either file, run `npm.cmd run build`. If the scenes changed, also run `npm.cmd run gifs` and `npm.cmd run verify:assets`.
