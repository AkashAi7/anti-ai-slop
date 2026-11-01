# Live VS Code/Copilot walkthrough

This is a runnable terminal guide plus actual Copilot tasks, not a canned chat app.

## Open

Open the `skills` folder in VS Code. In the integrated terminal:

```powershell
npm.cmd run demo
```

Select an exercise by its full ID. `task` shows the brief, `setup` creates a safe learner copy, `baseline` executes the defective fixture, and `prompt` gives the explicit skill invocation to paste into Chat.

## Flow A: question -> contract

1. Choose `01-clarify`, `setup`, `baseline`, then `prompt`.
2. Show the empty fields in the learner brief and ask the audience what the request leaves unresolved.
3. Paste `/grill-me` prompt into a fresh Chat. Show the actual loaded skill and question frontier.
4. Supply decisions, then invoke `/scope-contract`. Keep application code out of scope.
5. Run `check`. Explain that structural completeness does not prove the decisions are useful.

## Flow B: false green -> meaningful red -> verified green

1. Choose `03-honest-tests`; prepare and run the baseline.
2. Inspect the ineffective learner regression.
3. Invoke `/test-driven-development`. Add the behavioral assertion **before** the code change and run it.
4. Show the real intended failure; implement the minimal filter and check again.
5. Point out that the harness also runs the learner regression against a known defect and a correct function.

## Flow C: cause -> explicit failure -> honest handoff

Use independent exercises `05-debug`, `06-failure-paths`, and `08-capstone` as appropriate.

- Trace the timestamp unit boundary; do not add retries.
- Distinguish malformed input from a valid empty array.
- Fix the bounded summary defect and record a real partially failing first run if report metadata is incomplete.
- Rerun after completing metadata, then use `/concise-handoff` for the final evidence-backed summary.

## Audience controls

- Pause at every baseline and predict the failure.
- Ask for a counterexample before viewing a solution.
- Use `hint` without revealing the reference solution.
- Use `solution` only with explicit `reveal`.
- Use `reset` only after confirming the exact exercise ID.
- Use `back` to choose another exercise, or `quit` to end.

The guide never sends a message to Copilot, chooses a model, spends API credits, or claims simulated text is a real response. Follow normal client approvals.

## Media

[scenarios.json](scenarios.json) drives four build-only illustrative animations. The [main README](../README.md#gif-walkthroughs) links their GIFs, posters, and transcripts. They illustrate the flows above; they do not prove a specific model followed a skill.
