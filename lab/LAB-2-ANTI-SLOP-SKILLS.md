# Lab 2: anti-slop skills

**Goal:** use skills to stop the most common kinds of AI slop: guessed fixes,
tests that prove nothing, and "done" with no evidence. First you discover
skills with your client's **built-in skill tools**. Then you load three popular
**public skills** and apply them to a real bug.

| Part | Time | You invoke |
| --- | --- | --- |
| [A. Discover skills with built-in tools](#part-a-discover-skills-with-built-in-tools) | 10 min | `/skills` (VS Code and app), `/af` and `/skills reload` (app) |
| [B. Load the public skills](#part-b-load-the-public-skills) | 5 min | `npm run setup -- superpowers`, `npm run skills` |
| [C. Practice: debug, test first, verify](#part-c-practice-debug-test-first-verify) | 25-35 min | `/systematic-debugging`, `/test-driven-development`, `/verification-before-completion` |

Set up first: follow the [environment guide](README.md). Watch the four Lab 2
GIFs on the [workshop site](https://akashai7.github.io/anti-ai-slop/site/lab-2.html).

## The three public skills

From [obra/superpowers](https://github.com/obra/superpowers), one of the most
installed skill collections on [skills.sh](https://skills.sh/obra/superpowers).
They are public skills, not Copilot built-ins.

| Skill | Slop it prevents | What you should see |
| --- | --- | --- |
| `/systematic-debugging` | A fix that is a guess | Reproduction, file:line evidence, one testable cause, no edits yet |
| `/test-driven-development` | Tests that pass on broken code | A meaningful assertion failure before the repair, a pass after |
| `/verification-before-completion` | "All done!" with no proof | Fresh command output, real exit codes, a reviewed diff |

Popular is not the same as correct. Read the skill files and check the results.

## Part A: discover skills with built-in tools

A skill is a folder with a `SKILL.md` file. Clients find skills in these places:

| Scope | Locations |
| --- | --- |
| This project | `.github/skills/`, `.claude/skills/`, `.agents/skills/` |
| You, in every project | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` |

Your client may also ship built-in skills. Use its own tools to see what is
actually loaded. Do not rely on memory or a list from someone else.

### VS Code

1. Open any workspace, start a **Local** chat and type `/skills`. This opens
   the **Configure Skills** menu. Note the built-in, personal and workspace
   entries.
2. Type `/` on its own to see which skills appear in the slash picker.

### GitHub Copilot app

1. In an **Interactive** session, type `/skills` to list and manage skills.
2. Use the built-in **Agent Finder** skill to search for anti-slop skills. Ask
   it to compare candidates. Do not install anything yet.

   ```text
   /af Find popular public agent skills that stop guessed fixes, tests that prove nothing and unverified completion claims. Show source repository, license and install method for each. Do not install anything.
   ```

3. After you add skill files during a session, run `/skills reload`.

**Checkpoint:** you can name every skill your client has loaded and say where
each one came from. A duplicate name in a personal folder is a warning sign.

## Part B: load the public skills

### Option 1: bundled, pinned copies (use this for the lab)

From the lab directory:

```powershell
npm.cmd run setup -- superpowers
npm.cmd run skills
code -n .\work\superpowers
```

Setup copies the three complete upstream skill folders, their MIT license and a
manifest into `work\superpowers\.github\skills`. `npm run skills` checks all 15
files against SHA-256 hashes pinned to upstream commit
`2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`. No network, hooks or global install
is needed.

Then confirm loading in your client:

- **VS Code:** open `work\superpowers` itself, start a fresh Local chat, and
  type `/skills`. All three must point to this workspace's `.github/skills`.
- **Copilot app:** add `work\superpowers` as a local repository, start an
  Interactive session, and run `/skills reload` then `/skills`.

Finally, ask the agent to name the skill path it would use:

```text
Which loaded skill applies to the quantity bug in BRIEF.md? Name the exact SKILL.md path you would load. Do not edit files.
```

Check tool activity for `.github/skills/systematic-debugging/SKILL.md` in this
workspace. A similar-sounding answer does not prove the skill loaded.

### Option 2: add them to your own project

- **Skills-only ZIP:** download `anti-slop-public-skills.zip` from the
  [workshop site](https://akashai7.github.io/anti-ai-slop/). Copy the three
  **whole** folders (not just `SKILL.md`) into your project's `.github/skills/`.
  Keep `LICENSE` and `manifest.json` with them.
- **Skills CLI:** fetches the latest upstream version, not the pinned copy, so
  review what it installs.

  ```powershell
  npx skills add https://github.com/obra/superpowers --skill systematic-debugging -a github-copilot
  npx skills add https://github.com/obra/superpowers --skill test-driven-development -a github-copilot
  npx skills add https://github.com/obra/superpowers --skill verification-before-completion -a github-copilot
  ```

  It installs into `.agents/skills/` in the project, or into
  `~/.copilot/skills/` with `-g`. Confirm the result with `/skills`.

Never overwrite an existing skill with the same name. Do not install these
again inside `work\superpowers`, which already has them, because duplicate
names make it unclear which copy ran.

## Part C: practice: debug, test first, verify

**Scenario:** the same cart bug as Lab 1 Part A (quantity is ignored), in a
fresh workspace. Compare how skills shape the work.

From the `work\superpowers` terminal:

```powershell
npm.cmd run check -- --baseline
```

Expect **3/7 pass, 4 intended failures, BASELINE CONFIRMED, not solved**.

### 1. Debug: investigate before editing

```text
/systematic-debugging Read BRIEF.md and src/cart.mjs. Reproduce the quantity defect, cite file:line evidence, and state one testable cause. Do not edit yet. Keep investigation inside this disposable workspace.
```

Check it: `priceCents: 250, qty: 3` should give 750, but the starter returns
250. Confirm the cited line yourself. Then approve changes to
`src/cart.mjs` and `src/cart.test.mjs` only.

### 2. Test first: red before green

```text
/test-driven-development Follow BRIEF.md. Add at least four node:test cases to src/cart.test.mjs. Preserve existing behavior and cover quantity, invalid input and overflow. Run npm test with cart.mjs unchanged; stop for review of the red output. Do not delete existing starter or learner work.
```

Reject tests that are all green on the broken starter, syntax or import errors
posing as "red", and assertions that copy the buggy behavior. After you see a
meaningful failure:

```text
I approve the minimal cart repair under BRIEF.md. Change only src/cart.mjs; keep the test assertions and legacy pricing unchanged. Run the complete learner test suite after the repair.
```

### 3. Verify: fresh evidence, honest limits

```text
/verification-before-completion Run npm test and npm run check now. Report actual exit codes, passed/failed counts and unresolved issues. Inspect git diff and git status --short, including untracked tests. Do not commit or change acceptance tooling.
```

Then run them yourself:

```powershell
npm.cmd test
npm.cmd run check
git --no-pager diff
git --no-pager status --short
```

You need **VERIFIED: 7/7**, exit 0. The checker also replays your tests
against the original code: a suite that passes on both fails. The skill files
must stay unchanged.

## Evidence to keep

- [ ] The skills your client listed, and where each came from (Part A)
- [ ] The exact loaded `SKILL.md` path in this workspace (Part B)
- [ ] Root cause with file:line before any edit
- [ ] A red test run before the repair
- [ ] Fresh `VERIFIED: 7/7`, exit 0, and a reviewed diff
- [ ] Anything still unverified, stated plainly

## Safety notes

- Skills are guidance, not a security boundary. Keep tool approvals on.
- Upstream text sometimes says `superpowers:<name>`. That is plugin notation;
  here, use the plain name the picker shows.
- Do not run upstream example scripts, delete existing work, or change
  unrelated code to satisfy a skill.
- A GIF is not proof that a skill ran. Tool activity and your own test runs are.

## Sources

- Pinned upstream: [obra/superpowers @ 2ce8aa1](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b), MIT, Copyright (c) 2025 Jesse Vincent. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
- [VS Code agent skills: locations and discovery](https://code.visualstudio.com/docs/agent-customization/agent-skills)
- [Copilot app slash commands, including `/skills` and `/af`](https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands)
- [skills.sh directory](https://skills.sh/obra/superpowers) and [Skills CLI](https://github.com/vercel-labs/skills)

Previous: [Lab 1: /commands + Spec Kit](LAB-1-COMMANDS-SPECKIT.md).
