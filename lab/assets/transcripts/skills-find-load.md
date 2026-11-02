# Find skills. Load reviewed copies. Prove the path.

> Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.

Client: VS Code + Copilot app | built-in skill tools. Track: skills.

Commands: `/skills`, `/af`, `/skills reload`.

The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.

## Step 1: See what is already loaded

Participant:

```text
/skills
```

Illustrative checkpoint:

VS Code Local chat opens Configure Skills; the Copilot app lists skills. Note built-in, personal and workspace entries. A same-named personal skill is a warning sign.

Source or artifact snapshot:

```text
Skill locations

Project   .github/skills/
          .claude/skills/  .agents/skills/
Personal  ~/.copilot/skills/
          ~/.claude/skills/  ~/.agents/skills/

Built-in skills vary by client and version.
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
not ok 2 - quantities are applied
not ok 3 - invalid cart lines are rejected
not ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
not ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 3
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

## Step 2: Search with the built-in Agent Finder (app)

Participant:

```text
/af Find popular public agent skills that stop vague plans, guessed fixes, tests that prove nothing, unverified "done" claims and AI-sounding prose. Show source repository, license and install method for each. Do not install anything.
```

Illustrative checkpoint:

Treat search results as leads, not proof. Prefer a known source and license, then compare with the pinned copies already bundled in this lab instead of installing unreviewed files.

Source or artifact snapshot:

```text
Candidates (illustrative)

mattpocock/skills        MIT  grill-me
obra/superpowers         MIT  debugging, TDD,
                              verification, review
addyosmani/agent-skills  MIT  code-simplification
blader/humanizer         MIT  humanizer

Lab copies: pinned and checksummed
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
not ok 2 - quantities are applied
not ok 3 - invalid cart lines are rejected
not ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
not ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 3
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

## Step 3: Load the reviewed copies, then reload

Participant:

```text
From the lab directory: npm run setup -- skills, then npm run skills. Open work/skills itself. In the app type /skills reload; in VS Code start a fresh Local chat and type /skills.
```

Illustrative checkpoint:

Ten complete upstream folders from five repositories are copied with their licenses. The hash check covers all 29 files. No network, hooks or global install are needed.

Source or artifact snapshot:

```text
npm run skills

VERIFIED: 10 upstream skills, 29 files
obra/superpowers        @ 2ce8aa1 MIT
mattpocock/skills       @ 4ae2317 MIT
addyosmani/agent-skills @ 8bfcc1f MIT
blader/humanizer        @ 0ef9fe5 MIT
anthropics/skills       @ ca45fc4 Apache-2.0
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
not ok 2 - quantities are applied
not ok 3 - invalid cart lines are rejected
not ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
not ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 3
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

## Step 4: Prove which skill the agent will use

Participant:

```text
Which loaded skill should I use first for the cart task in BRIEF.md, before any code is written? Name the exact SKILL.md path you would load. Do not edit files.
```

Illustrative checkpoint:

Expected: grill-me, which hands over to grilling, both from this workspace's .github/skills. Confirm the paths in tool activity. A plausible answer alone does not prove the skill loaded.

Source or artifact snapshot:

```text
Evidence to keep

Client and session type
Skills listed and their folders
Loaded paths:
  .github/skills/grill-me/SKILL.md
  .github/skills/grilling/SKILL.md

Baseline still 3/7. Next: grill the plan.
```

Observed test summary:

```text
ok 1 - existing cart behavior is preserved
not ok 2 - quantities are applied
not ok 3 - invalid cart lines are rejected
not ok 4 - safe integer cents are enforced
ok 5 - inputs are left untouched
ok 6 - public API and scope are preserved
not ok 7 - learner regressions catch the original bug
# tests 7
# suites 0
# pass 3
# fail 4
# cancelled 0
# skipped 0
# todo 0
```

Takeaway: Use the client's own skill tools to see what is loaded, prefer pinned and reviewed copies, and confirm the exact SKILL.md path.

Try it yourself: [Lab 2: anti-slop skills](../../LAB-2-ANTI-SLOP-SKILLS.md). Set up first with the [lab environment guide](../../README.md).
