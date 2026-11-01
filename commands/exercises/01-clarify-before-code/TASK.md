# 01 - Clarify before you code

**Slop:** the agent guessed the discount rules. It stacks every code, returns fractional cents, and silently ignores unknown and expired codes.

**Command flow:** `/clarify` → `/spec` → `/plan`

- `/clarify` asks the questions that block a correct implementation, before any code exists.
- `/spec` turns your answers into acceptance criteria that a test can prove.
- `/plan` proposes the edit from the spec, so you review it before anything changes.

Set up your copy and confirm the starting state:

```powershell
npm run setup -- 01-clarify-before-code
npm run check -- 01-clarify-before-code --baseline
```

Expected red: 5 of 6 checks fail. Their names are left out of this file on purpose, because they would answer the questions `/clarify` should ask. The baseline output shows them to you, not to the agent.

Only edit `work/01-clarify-before-code/discount.mjs` and `work/01-clarify-before-code/SPEC.md`.

Start with this prompt:

```text
/clarify Read exercises/01-clarify-before-code/TASK.md and work/01-clarify-before-code/discount.mjs. Ask only the questions that block a correct implementation. Do not write code or open the solution folder.
```

1. Answer each question yourself, using only `exercises/01-clarify-before-code/ANSWERS.md`. It plays the product owner, so keep it out of the chat. On a real team, a person answers these questions, not the model.
2. Run `/spec` with your answers. Paste the result into `work/01-clarify-before-code/SPEC.md` and keep its `## Acceptance criteria` section.
3. Run `/plan` for `discount.mjs`. Compare the plan with SPEC.md, then let the agent implement it.

```powershell
npm run check -- 01-clarify-before-code
```

**Human acceptance:** every acceptance criterion in SPEC.md traces back to an answer you gave. Nothing in it was invented by the model.

**Reflect:** Which of the starter's guesses would have shipped if you had asked for code first?
