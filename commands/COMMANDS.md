# Command reference

Every `/command` in this lab is an anti-slop checkpoint. Each one has a job ("ask before code", "prove it exists", "show the exit code"), and each makes the agent return evidence you can check. This page lists the commands, the order to use them in, and what each one is allowed to touch.

- **Built-in commands** ship with VS Code chat. Type `/` in the Chat view to see them.
- **Lab commands** (`/clarify`, `/spec`, `/ground`, and 9 more) are **not built in**. They are the 12 prompt files in [.github/prompts](.github/prompts), written for this lab. VS Code adds them to the `/` menu only when this `commands` folder is the folder you opened. They are also not [Spec Kit](https://github.com/github/spec-kit) commands; Spec Kit installs its own `speckit`-prefixed commands, and this lab doesn't use it.
- **Where they run:** the VS Code Chat view with the **Session Target set to Local**. Prompt files and most built-ins run only with the Local harness.

If a lab command doesn't show up when you type `/`, see [If a lab command doesn't appear](#if-a-lab-command-doesnt-appear).

Back to the [lab README](README.md).

## Command flows that beat slop

In these flows, `/clarify`, `/spec`, `/ground`, `/deps-check`, `/root-cause`, `/fail-paths`, `/deslop`, `/simplify`, `/verify`, `/pre-commit`, `/scope`, and `/handoff` are this lab's prompt files. Every other command is a VS Code built-in.

| Situation | Flow | Why |
|---|---|---|
| The requirements are fuzzy | `/clarify` → `/spec` → `/plan` → implement → `/verify` | No code until a person has answered the blocking questions. |
| You're working in unfamiliar code | `/init` (once per repo) → `/ground` → implement → `/verify` | Every helper, key, and API is proven to exist with file:line before it's used. |
| A new import or package | `/deps-check` → implement → `/verify` | Catches packages and API members that don't exist before anything gets installed. |
| A bug report | `/root-cause` → `/fail-paths` → fix → `/verify` | Fix the cause, not the symptom. The test is red before the fix and green after. |
| Reviewing an agent's diff | `/deslop` → `/simplify` → `/verify` → `/pre-commit` | Finds dead code, fake tests, and noise, then proves the cleanup changed no behavior. |
| A risky or contained change | `/scope` → `/disableAutoApprove` → `/tools` → `/pre-commit` | A written contract, a human approval on every action, and only the tools the job needs. |
| A long session, or switching tasks | `/handoff` → `/clear` (or `/fork`) → `/compact` when it grows | Decisions travel in a file, not in a drifting chat. |
| Something didn't load or behaved oddly | `/troubleshoot`, `/debug` | Shows what the agent actually saw and did instead of leaving you to guess. |

## What each custom command is allowed to do

Each prompt file declares a `tools:` list in its frontmatter. [scripts/validate.mjs](scripts/validate.mjs) checks that the list stays inside the command's access class.

| Access class | Allowed tool prefixes | Meaning |
|---|---|---|
| read-only | `read/`, `search/`, `vscode/askQuestions`, `web/fetch` | Reads and searches only. Can't edit files or run commands. |
| runs-commands | `read/`, `search/`, `execute/`, `vscode/askQuestions` | Runs terminal commands, each still needing your approval. Can't edit files. |
| writes-artifact | `read/`, `search/`, `edit/createFile`, `edit/editFiles`, `vscode/askQuestions` | Writes one named Markdown artifact, and is told not to touch code. |
| edits-code | `read/`, `search/`, `edit/`, `execute/`, `vscode/askQuestions` | Edits code and runs tests. Keep approvals on. |

Approvals are a VS Code setting, not a prompt-file feature. `/disableAutoApprove` puts every edit and terminal command back behind your approval for the session. `/autoApprove` (alias `/yolo`) removes that human checkpoint, so use it only in a sandbox you can throw away.

<!-- BEGIN GENERATED: commands.json - run npm run build:docs -->

## Lab commands (prompt files, not built in)

> **Lab commands are not built in.** `/clarify`, `/spec`, and the other lab commands are prompt files that this repository ships in `.github/prompts`.
>
> VS Code reads workspace prompt files from the `.github/prompts` folder of the folder you open, and runs them only in Local chat sessions. Open this `commands` folder itself (or a repository you copied the prompt files into). The anti-ai-slop repository root has no `.github/prompts` folder, so opening the repository root or a parent folder does not load them. See the [VS Code prompt files documentation](https://code.visualstudio.com/docs/agent-customization/prompt-files).
>
> They are not Spec Kit commands. [Spec Kit](https://github.com/github/spec-kit) installs its own `speckit`-prefixed commands when you run `specify init`. This lab does not use Spec Kit.

These 12 commands live in [.github/prompts](.github/prompts). With this folder open and the Chat view's Session Target set to Local, type `/` to run them. If one doesn't appear, see [If a lab command doesn't appear](#if-a-lab-command-doesnt-appear).

| Command | Mechanism | Access | Slop it fixes | Evidence it must return |
|---|---|---|---|---|
| [`/clarify`](.github/prompts/clarify.prompt.md) | plan | read-only | Silent assumptions baked into code. | At most 5 questions, each with a reason and a proposed default, plus an assumptions table. No code. |
| [`/spec`](.github/prompts/spec.prompt.md) | plan | read-only | "Done" that nobody can test. | Goal, non-goals, Given/When/Then acceptance criteria, edge cases, and real verification commands. Undecided items marked OPEN. |
| [`/ground`](.github/prompts/ground.prompt.md) | ground | read-only | Invented helpers, config keys, and APIs. | A Need / Status / Evidence table with file:line for every EXISTS or SIMILAR row. |
| [`/deps-check`](.github/prompts/deps-check.prompt.md) | ground | read-only | Hallucinated packages, invented API members, and trivial dependencies. | An Import / Kind / API / Verdict table. Anything unverifiable is marked UNVERIFIED. Nothing is installed. |
| [`/deslop`](.github/prompts/deslop.prompt.md) | verify | read-only | Swallowed errors, fake tests, duplicate helpers, debug prints, and narrating comments. | A findings table with file:line, pattern, why it matters, and the smallest fix. No edits. |
| [`/verify`](.github/prompts/verify.prompt.md) | verify | runs-commands | "Should work" and "all tests pass" with no evidence. | Command, exit code, and observed result for every check, then claims vs evidence, then VERIFIED or NOT VERIFIED. |
| [`/root-cause`](.github/prompts/root-cause.prompt.md) | verify | runs-commands | Special-casing the reported input instead of fixing the defect. | A reproduction, at most 3 hypotheses, the confirmed cause, and a proposed fix plus regression tests. No edits. |
| [`/fail-paths`](.github/prompts/fail-paths.prompt.md) | verify | edits-code | Happy-path-only tests. | An edge-case table, new tests, and the observed test run. Assertions are never weakened. |
| [`/scope`](.github/prompts/scope.prompt.md) | contain | writes-artifact | Scope creep and drive-by edits. | A SCOPE.md of at most 40 lines: allowed changes, forbidden paths, frozen API, done-when, and rollback. |
| [`/simplify`](.github/prompts/simplify.prompt.md) | contain | edits-code | Speculative abstraction and duplicate code. | Tests green before and after, with a list of each removal and why behavior is unchanged. |
| [`/pre-commit`](.github/prompts/pre-commit.prompt.md) | contain | runs-commands | Debug output, stubs, secrets, and skipped tests reaching a commit. | A checklist with evidence per line, then READY or NOT READY. Nothing is edited or committed. |
| [`/handoff`](.github/prompts/handoff.prompt.md) | context | writes-artifact | Context rot and lost decisions between sessions. | A HANDOFF.md of at most 60 lines whose every path exists. Missing evidence says "not run". |

Argument hints (what to type after the command):

- `/clarify <the request or task file to clarify>`
- `/spec <the clarified request, plus any answers you already have>`
- `/ground <the file or change to ground>`
- `/deps-check <files or manifest to check>`
- `/deslop <files to review, or leave empty to review the current changes>`
- `/verify <what claim to verify, and optionally which command>`
- `/root-cause <the bug report or failing behavior>`
- `/fail-paths <function or file to probe>`
- `/scope <the change, and where SCOPE.md should go>`
- `/simplify <file or function to simplify>`
- `/pre-commit <files in this change, or leave empty to use the current changes>`
- `/handoff <the work to hand off, and where HANDOFF.md should go>`

## Built-in VS Code chat commands, by mechanism

### Plan: Decide before code.

Slop smell: Code arrives before anyone agreed what done means. Assumptions stay silent.

Lab commands: `/clarify`, `/spec`

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/plan`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Research and propose an implementation plan. | Puts a reviewable plan in front of you before any edit, while wrong assumptions are still cheap to fix. | `/plan add expiry checks to discount codes; list open questions first` | Local |
| [`/explain`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Explain code. | Builds an accurate picture of existing behavior before you ask for a change. | `/explain how applyDiscounts treats unknown codes` | Local |

### Ground: Anchor every claim in repo truth.

Slop smell: Invented helpers, guessed config keys, and packages nobody checked.

Lab commands: `/ground`, `/deps-check`

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/init`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate or update workspace instructions in a local agent session. | Records real build, test, and layout conventions so every session starts grounded. | `/init` | Local agent session |
| [`/instructions`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Configure instruction files. | Shows which standing rules the agent receives, so you can fix stale ones. | `/instructions` | Local |
| [`/create-instructions`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate an instructions file in a local agent session. | Turns a correction you keep repeating into a rule the agent always sees. | `/create-instructions money is integer cents; never use floats` | Local agent session |

### Verify: Evidence, not claims.

Slop smell: "All tests pass" with no command output, tests that cannot fail, and symptom patches.

Lab commands: `/deslop`, `/verify`, `/root-cause`, `/fail-paths`

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/fix`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Suggest a fix for a problem in your code. | Aims the agent at one concrete problem instead of an open-ended rewrite. Follow it with /verify. | `/fix the failing expiry test` | Local |
| [`/tests`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate tests. | Gets tests written early. Review every assertion: a test that cannot fail proves nothing. | `/tests for parseDuration, including malformed input` | Local |
| [`/setupTests`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Get help choosing and setting up a test framework (experimental). | A repo without a test runner cannot produce evidence. Fix that first. | `/setupTests` | Local - experimental |

### Contain: Limit the blast radius.

Slop smell: A one-line fix rewrites five files, changes a public API, or edits frozen code.

Lab commands: `/scope`, `/simplify`, `/pre-commit`

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/tools`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Configure tools for a local chat. | Turn off tools a task does not need, so the agent cannot wander into the terminal or the web. | `/tools` | Local |
| [`/hooks`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Configure hooks. | Hooks enforce rules deterministically, which a prompt alone cannot. | `/hooks` | Local and Copilot |
| [`/create-hook`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate a hook in a local agent session. | Adds a deterministic guardrail, such as running the tests after every edit. | `/create-hook run npm test after file edits` | Local agent session |
| [`/disableAutoApprove`](https://code.visualstudio.com/docs/agents/run/approvals) (alias `/disableYolo`) | Restore the default permission level. | Puts every edit and terminal command back behind your approval. | `/disableAutoApprove` | Local and Copilot CLI sessions |
| [`/autoApprove`](https://code.visualstudio.com/docs/agents/run/approvals) (alias `/yolo`) | Bypass tool approvals for the current session. | Listed so you can recognize it. It removes a safety checkpoint, so use it only in a disposable, sandboxed workspace. **Caution:** removes a human checkpoint. | `/autoApprove` | Local and Copilot CLI sessions |
| [`/sandbox`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | /sandbox policy inspects the effective sandbox policy for a Copilot session. | Shows what a sandboxed session may touch. Not available with Local. | `/sandbox policy` | Copilot sessions only - not Local |

### Context: Keep the context window clean.

Slop smell: Long chats drift, stale decisions leak into new work, and nobody can resume.

Lab commands: `/handoff`

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/compact`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Compact conversation context. | Summarizes earlier turns so stale detail stops crowding out the current task. | `/compact` | Local |
| [`/fork`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Fork the conversation with its history. | Lets you try a risky alternative in a copy so the main thread stays clean. | `/fork` | Local. /fork <title> and /fork prompt <prompt> need an Agent Host session. |
| [`/clear`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Start a new chat and archive or mark the current chat as done. | Resets context between tasks. Pair it with /handoff so nothing important is lost. | `/clear` | Local |
| [`/rename`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Rename a local chat. | Name sessions by task so you resume the right context instead of a random thread. | `/rename csv-export refactor` | Local |

### Diagnose and productivity: Know what the agent saw and can do.

Slop smell: Guessing why a prompt, tool, or customization did not load.

| Command | What it does | Why it reduces slop | Example | Availability |
|---|---|---|---|---|
| [`/doc`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate documentation comments from editor inline chat. | Keeps docs next to the code they describe. Delete comments that only narrate the code. | `/doc (in editor inline chat, with a function selected)` | Editor inline chat |
| [`/new`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Scaffold a workspace or file. | Starts from a known template instead of a hand-rolled project layout. | `/new node CLI with node:test` | Local |
| [`/newNotebook`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Scaffold a Jupyter notebook. | Gives exploratory work a separate home, away from production code. | `/newNotebook explore the orders CSV` | Local |
| [`/help`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | List commands and agents in a local Ask chat. | Shows what actually exists in this session instead of guessing. | `/help` | Local Ask chat |
| [`/models`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Open the model picker. | Makes the model choice explicit and repeatable. | `/models` | Local |
| [`/agents`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Configure custom agents. | Shows which agent personas exist and what tools they hold. | `/agents` | Local |
| [`/skills`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Configure agent skills. | Confirms which skills can load. See the sibling skills lab. | `/skills` | Local |
| [`/prompts`](https://code.visualstudio.com/docs/agent-customization/prompt-files) | Configure prompt files. | Opens the prompt file menu so you can confirm the lab's prompt files (custom /commands) were discovered, instead of guessing. | `/prompts` | Local and Copilot |
| [`/create-agent`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate a custom agent in a local agent session. | Packages a role with a narrow tool list. | `/create-agent read-only reviewer that cites file:line` | Local agent session |
| [`/create-skill`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Generate an agent skill in a local agent session. | Captures a workflow the agent can load on demand. | `/create-skill evidence-first completion reports` | Local agent session |
| [`/create-prompt`](https://code.visualstudio.com/docs/agent-customization/prompt-files) | Generate a prompt file in a local agent session. | Turns a good prompt you keep retyping into a reusable /command. | `/create-prompt review a diff for swallowed errors` | Local agent session |
| [`/troubleshoot`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Analyze agent debug logs in a local or Copilot CLI session. | Explains why a prompt file, tool, or instruction did not apply, using the logs instead of guesses. | `/troubleshoot why did /verify not run the terminal tool?` | Local and Copilot CLI sessions |
| [`/debug`](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | Open the Chat Debug view. | Shows the exact prompt, context, and tool calls the model received. | `/debug` | Chat view (not the Agents window) |

## GitHub Copilot app (mention only)

The GitHub Copilot app has its own slash commands, separate from VS Code. These are the anti-slop ones. This lab does not exercise them. See the [Copilot app slash command reference](https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands).

| Command | What it does |
|---|---|
| `/plan` | Switches to Plan mode. |
| `/review` | Reviews the current session's changes. |
| `/security-review` | Runs a security-focused review of current diffs. |
| `/rubber-duck` | Asks a different model to critique your approach. |
| `/spar` | Challenges your approach with adversarial reasoning. |
| `/research` | Runs a research workflow and produces a cited report. |
| `/context` | Shows the session's context usage. |
| `/compact` | Summarizes earlier conversation to reduce token pressure. |
| `/fork` | Forks the session at the latest turn. |
| `/reset-allowed-tools` | Clears session tool approvals and turns auto-approval off. |
| `/sandbox on` | Enables local sandboxing for the session. |
| `/chronicle improve` | Suggests improvements to your instructions file. |

Registry as of 2026-10-30; VS Code docs dated 10/28/2026.

<!-- END GENERATED -->

## Anatomy of a custom command

Every prompt file in [.github/prompts](.github/prompts) follows the same contract, and [scripts/validate.mjs](scripts/validate.mjs) enforces it:

```markdown
---
name: verify                      # must match the file name
description: 40-300 characters     # shown in the / menu
argument-hint: <what to verify>    # shown after you type the command
agent: agent
tools: ['read/readFile', 'execute/runInTerminal']   # inside its access class
---
# /verify - evidence, not claims

## Goal
## Steps
## Output format       # the evidence the command must return
## Stop conditions     # what it must refuse to do
```

The body is limited to 80 lines. A short prompt with explicit stop conditions produces less slop than a long, clever one.

## If a lab command doesn't appear

The lab commands are prompt files, so VS Code has to find and load them. Built-ins such as `/plan` and `/clear` don't depend on any of this. Work through these checks in order:

1. **Open the right folder.** VS Code reads workspace prompt files from `.github/prompts` in the folder you open. Open this `commands` folder itself, for example by running `code commands` from the repository root. The repository root has no `.github/prompts` folder, so opening the root or a parent folder doesn't load the lab commands.
2. **Use a Local session.** In the Chat view, set the **Session Target** to **Local**. Prompt files run only in Local sessions, not in Copilot CLI or other harnesses.
3. **Type the full name.** Type `/` followed by the command name, for example `/clarify`, in the chat input.
4. **Ask VS Code what it loaded.** Run the built-in `/prompts` to open the **Configure Prompt Files** menu, and check that the lab's prompt files are listed.
5. **Read the discovery log.** In the Chat view, select the **...** menu, then **Show Agent Debug Logs** to see prompt file discovery errors. The built-in `/troubleshoot` can also help.

Spec Kit isn't involved. Commands such as `/speckit.clarify` (listed in [Maestro's Spec Kit command docs](https://docs.runmaestro.ai/speckit-commands)) belong to Spec Kit, which adds them to a project when you run `specify init`. They are unrelated to this lab's `/clarify`.

## Use these commands in your own repository

1. Copy the prompt files you want from [.github/prompts](.github/prompts) into your repository's `.github/prompts/` folder.
2. Open that repository in VS Code, set the Chat view's Session Target to Local, and type `/`. VS Code lists the copied prompt files in the `/` menu with the built-in commands. They still aren't built-ins; they work only where the files are.
3. Optionally, suggest some of them in the chat input. This lab's [.vscode/settings.json](.vscode/settings.json) uses `chat.promptFilesRecommendations` for `/clarify`, `/ground`, `/verify`, and `/handoff`. Check the [prompt files documentation](https://code.visualstudio.com/docs/agent-customization/prompt-files) for the current format of that setting before you rely on it.
4. Change the `## Steps` sections to use your real test and build commands. Leave the `## Stop conditions` sections alone.

To use a command in every workspace instead, create it as a user-level prompt file with the **Chat: New Prompt File** command and paste in the file's contents. See the [prompt files documentation](https://code.visualstudio.com/docs/agent-customization/prompt-files) for user-profile locations.

Custom command names avoid the skill names in the sibling [skills lab](../skills/README.md), so both labs can sit in one workspace without collisions.
