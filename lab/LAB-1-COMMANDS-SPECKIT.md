# Lab 1: /commands + Spec Kit

**Goal:** use slash commands as checkpoints rather than shortcuts, and agree on
a specification before any code is written. You practice on deliberately
broken code. An independent checker decides when you are done, not the model.

| Part | Time | Workspace | You invoke |
| --- | --- | --- | --- |
| [A. Built-in /commands](#part-a-built-in-commands) | 25-35 min | `work\builtins` | VS Code: `/explain`, `/plan`, `/tests`, `/fix`, `/compact`. Copilot app: `/plan`, `/review`, `/rubber-duck`, `/context`, `/compact` |
| [B. Spec Kit development](#part-b-spec-kit-development) | 40-55 min | `work\spec-kit` (VS Code) or `work\spec-kit-skills` (app) | `/speckit.constitution` ... `/speckit.converge` (VS Code) or `/speckit-constitution` ... (app) |

Set up first: follow the [environment guide](README.md). Watch the six Lab 1
GIFs on the [workshop site](https://akashai7.github.io/anti-ai-slop/site/lab-1.html)
before each part.

These are real commands provided by your client or installed by the official
Spec Kit CLI. This lab installs no homemade `/clarify` or `/verify` prompts.

## Part A: built-in /commands

**Scenario:** `src/cart.mjs` ignores the quantity of each line. The agent must
explain it, plan a contained repair, prove the bug with failing tests, fix only
the cause, and show fresh evidence.

```powershell
npm.cmd run setup -- builtins
code -n .\work\builtins
```

Then, from the workspace terminal:

```powershell
npm.cmd run check -- --baseline
```

Expect **3/7 pass, 4 intended failures, BASELINE CONFIRMED, not solved**.

### In VS Code

Send each message separately and review the result before the next one. Use
Ask/Plan for read-only steps; switch to **Agent** (still Local) for edits.

1. **Explain with evidence (no edits)**

   ```text
   /explain Read BRIEF.md and src/cart.mjs. Explain the quantity bug with file:line evidence. List the existing API and unknowns. Do not edit files.
   ```

2. **Plan the smallest repair**

   ```text
   /plan Read BRIEF.md. Propose the smallest cart repair. Only src/cart.mjs and src/cart.test.mjs may change. Cite the root cause and propose boundary tests. Do not implement yet.
   ```

3. **Make tests red first**

   ```text
   /tests Add at least four node:test cases to src/cart.test.mjs, importing ./cart.mjs. Cover existing behavior, quantity greater than one, invalid input and safe integer cents. Do not change src/cart.mjs. Run npm test and report the observed failures.
   ```

   **Stop:** the new tests must fail while the bug still exists. If they all
   pass, reject them and ask for the missing boundary cases.

4. **Fix the cause, not the tests**

   ```text
   /fix Repair src/cart.mjs against BRIEF.md and the failing tests. Keep its public API and src/legacy-pricing.mjs unchanged. No dependencies. Run npm test and npm run check; report both exit codes and any unresolved issue.
   ```

5. **Save evidence, then compact.** After you save the brief, your decisions
   and the real test output, try `/compact`. Reattach BRIEF.md and ask the
   agent to restate scope and unresolved work. Compaction does not prove
   correctness.

### In the GitHub Copilot app

Add `work\builtins` as a local repository and start an **Interactive** session.

1. Use `/plan` with the same plan prompt as above. Approve it.
2. Ask in plain chat for red tests, then for the repair. The app has no
   documented `/tests` or `/fix` command, so do not invent equivalents.
3. Once the session has changes, critique them:

   ```text
   /review
   ```

   ```text
   /rubber-duck Challenge the cart repair against BRIEF.md. Look for missed boundaries, tests that also pass on the original implementation, and out-of-scope changes. Do not edit.
   ```

4. Inspect `/context`, then try `/compact`.

### Finish Part A: prove it yourself

```powershell
npm.cmd test
npm.cmd run check
git --no-pager diff
git --no-pager status --short
```

You need **VERIFIED: 7/7**, exit 0. The checker also runs your tests against
the original broken code: a suite that passes on both fails the lab. Review
untracked test files too, because `git diff` does not show them.

## Part B: Spec Kit development

**Scenario:** "Support discount codes" leaves stacking, rounding and expiry
undecided. Spec Kit makes you settle them in a specification, plan and task
list before the agent writes code.

Return to the lab directory (not the Part A workspace) and pick your client:

| Client | Setup | Command names |
| --- | --- | --- |
| VS Code | `npm.cmd run setup -- spec-kit` then `code -n .\work\spec-kit` | Dotted prompt commands: `/speckit.specify` |
| Copilot app | `npm.cmd run setup -- spec-kit-skills`, then add `work\spec-kit-skills` as a local repository | Hyphenated skills: `/speckit-specify` (run `/skills reload` if needed) |

Setup runs the official, pinned `specify-cli==1.2.3` in isolation. It never
touches a global `specify`.

```text
specify init <workspace> --integration copilot --integration-options="--commands --events false" --script ps --non-interactive --ignore-agent-tools
```

The app track uses `--skills` instead of `--commands`. macOS/Linux uses
`--script sh`. Setup verifies the nine installed workflow entries.

Baseline from the workspace terminal: **2/10 pass, 8 intended failures**.

### The nine steps, one message at a time

The examples use the VS Code dotted names. In the app, replace the dot with a
hyphen, for example `/speckit-clarify`.

1. **Constitution:** fix the project's rules once.

   ```text
   /speckit.constitution Keep the public API and catalogue stable. Use integer cents, no dependencies, and node:test. Reproduce defects with red regression tests. Reject invalid input explicitly. Require real terminal verification and no unrelated edits.
   ```

2. **Specify:** say what checkout must do, not how.

   ```text
   /speckit.specify Make discount-code checkout correct for the existing project in BRIEF.md. Capture the discount policy and measurable acceptance criteria before implementation. Do not change code yet.
   ```

3. **Clarify:** answer from BRIEF.md. Do not let the agent silently pick
   stacking, rounding or expiry rules.

   ```text
   /speckit.clarify Resolve stacking, duplicate codes, integer-cent rounding, unknown codes, inclusive expiry and explicit dates against BRIEF.md. Ask the blocking questions before planning.
   ```

4. **Plan:** reuse the existing code.

   ```text
   /speckit.plan Use the existing Node.js ESM project, node:test and src/coupons.mjs. No dependencies or new services. Preserve quoteDiscount(subtotalCents, codes, today). Plan tests that fail on the original implementation before repairing it.
   ```

5. **Checklist:** review the quality of the requirements, not the code.

   ```text
   /speckit.checklist Review whether stacking, duplicate handling, cent precision, expiry, invalid input and frozen scope are complete, clear and testable. Do not treat this as a passing code test.
   ```

6. **Tasks:** ordered, requirement-linked work items.

   ```text
   /speckit.tasks Include at least four node:test cases in src/discount.test.mjs importing ./discount.mjs. Run them red before fixing src/discount.mjs, then run npm test and npm run check.
   ```

7. **Analyze:** find contradictions between spec, plan and tasks. Fix material
   findings in those documents and rerun before you build.

   ```text
   /speckit.analyze
   ```

8. **Implement:** approve only the agreed scope.

   ```text
   /speckit.implement Follow the agreed tasks. Preserve the API and catalogue; change only src/discount.mjs and src/discount.test.mjs plus the Spec Kit feature documents. Run and report the red tests before the repair and the independent checks afterward.
   ```

9. **Converge:** check that everything is complete, then verify.

   ```text
   /speckit.converge
   ```

### Finish Part B: prove it yourself

```powershell
npm.cmd test
npm.cmd run check
git --no-pager diff
git --no-pager status --short
```

You need **VERIFIED: 10/10**, exit 0. The checker verifies the policy,
regressions that fail on the original code, the unchanged catalogue, and a
constitution plus `spec.md`, `plan.md` and `tasks.md` for one feature. Files
existing is not proof of quality, so read them and the diff.

Spec Kit records the active feature in `.specify/feature.json`, not only the
Git branch. This lab expects exactly one feature.

## Stop and correct when

- The agent edits during `/explain`, `/plan` or `/speckit.clarify`.
- New tests pass on the broken code.
- The agent says "all tests pass" without a real command and exit code.
- A Spec Kit checklist gets ticked without review. A checklist box is not a
  passing test.
- A change touches the catalogue, legacy pricing, dependencies or the checker.

## Evidence to keep

- [ ] Root cause with file:line before any edit
- [ ] Agreed scope or clarified specification before implementation
- [ ] A red test run before the repair
- [ ] Fresh `VERIFIED: 7/7` (Part A) and `VERIFIED: 10/10` (Part B), exit 0
- [ ] Reviewed diff, including untracked files
- [ ] Any limitation stated honestly

## References

- [VS Code slash commands](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet#slash-commands)
- [Copilot app slash commands](https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands)
- [Spec Kit Copilot integration](https://github.github.io/spec-kit/integrations/copilot.html)
- [Spec Kit workflow](https://github.github.io/spec-kit/quickstart.html)

Next: [Lab 2: anti-slop skills](LAB-2-ANTI-SLOP-SKILLS.md).
