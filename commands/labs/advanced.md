# Advanced track - exercises 05 to 08

These four exercises cover the slop that gets past review:

- dependencies and APIs that sound real but aren't
- a "working" diff full of noise
- a small fix that turns into a drive-by refactor
- a ticket closed by special-casing one input

Each exercise is independent. The [beginner track's loop](beginner.md#the-loop-for-every-exercise) applies to every one of them: setup, baseline, fresh chat, human gate, check.

| Exercise | Command flow | Slop it removes | Evidence to keep |
| --- | --- | --- | --- |
| [05 - Reality-check the dependencies](../exercises/05-deps-reality-check/TASK.md) | `/deps-check` → `/verify` | `left-pad` for a one-liner, an unverified `port-validator-strict`, and `fs.readJSONSync` (an `fs-extra` API, not `node:fs`) | A `/deps-check` table in which every row cites a Node.js docs page or a manifest line. Nobody ran `npm install` |
| [06 - Deslop the previous agent's diff](../exercises/06-deslop-the-diff/TASK.md) | `/deslop` → `/simplify` → `/verify` | Debug output, an empty `catch`, a duplicate helper, narrating comments, and a test that can't fail | Every `/deslop` finding fixed or rejected with a reason, and a final diff smaller than the code it replaced |
| [07 - Write the scope contract first](../exercises/07-scope-contract/TASK.md) | `/scope` → `/disableAutoApprove` → `/tools` → `/pre-commit` | A one-line fix that also "fixes" a frozen legacy file and tidies unrelated code | SCOPE.md, every edit approved or rejected by you, and a `/pre-commit` READY verdict |
| [08 - Fix the root cause, not the ticket](../exercises/08-root-cause-not-symptom/TASK.md) | `/root-cause` → `/fail-paths` → `/verify` | `if (text === '1,299.99') return 129999;` closes the ticket, but other inputs stay broken | A reproduction with an input other than the ticket's, and the same input passing after the fix |

## What each command adds

- **`/deps-check`** is read-only. It checks every import and API member against the standard library, the manifest, and the official docs, and gives each one a verdict:
  - `OK`
  - `MISSING API`
  - `NOT INSTALLED`
  - `UNVERIFIED`
  - `REPLACE WITH STDLIB`
  - `REPLACE WITH LOCAL`

  It never runs a package manager.
- **`/deslop`** is read-only. It reports debug output, swallowed errors, duplicate helpers, dead code, narrating comments, and fake tests with file:line, and it edits nothing.
- **`/simplify`** edits code. It removes the noise while keeping behavior. It runs the tests before and after, and reverts any change that breaks them. It doesn't change the public API or add files.
- **`/scope`** writes one artifact, SCOPE.md, with allowed changes, forbidden files, frozen API, done-when criteria, and rollback.
- **`/disableAutoApprove`** is built in. It turns auto-approval off, so every tool action waits for you. Its opposite, `/autoApprove` (alias `/yolo`), removes that checkpoint. Use it only in a disposable sandbox.
- **`/tools`** is built in. Use it to pick only the tools this task needs.
- **`/pre-commit`** runs commands. It checks the diff against SCOPE.md, debug output, secrets, stubs, skipped tests, and the test run, then answers READY or NOT READY.
- **`/root-cause`** runs commands. It reproduces the defect, tests competing hypotheses, names the cause, lists other affected inputs, and rejects symptom patches.

## Going further

- Chain commands on your own code: `/deslop` on your last agent-written diff, `/deps-check` on your newest import, `/scope` before your next refactor.
- Reuse the prompt files in your own repository. See [Use these commands in your own repository](../COMMANDS.md#use-these-commands-in-your-own-repository).
- Read the flows in [COMMANDS.md](../COMMANDS.md#command-flows-that-beat-slop), and compare them with the skills-based approach in the [Skills lab](../../skills/README.md).

## Completion

You're done when you can show the following for each exercise:

- the green check output
- the command table or verdict you used as evidence
- the human acceptance step from its TASK.md, done by you

If the agent edited `checks.mjs` or opened `solution/` early, say so, and start a different exercise. A result built that way isn't unaided.
