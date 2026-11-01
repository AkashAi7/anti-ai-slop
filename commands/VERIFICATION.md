# Verification record

This file lists only what was actually run and observed. Anything not run is listed under [Not verified](#not-verified).

- **Date:** 2026-11-01
- **OS:** Windows
- **Node.js:** v26.13.0
- **Browser for smoke and GIFs:** Playwright Chromium (headless)

## Automated results

| Command | Observed result |
| --- | --- |
| `npm.cmd test` | 33 tests, 33 pass, 0 fail |
| `npm.cmd run validate` | Pass: registry, prompt-file frontmatter and tool limits, scenes, docs, and every Markdown link and anchor |
| `npm.cmd run smoke` | 21 passed, with no console errors, page errors, or network requests |
| `npm.cmd run verify:assets` | All 6 GIFs decoded and checked: frame count, looping, 1280x720 size, hash, distinct frames, posters, and transcripts |
| `npm.cmd run verify:sources` | 5 live documentation sources, every expected command name found |
| `npm.cmd run studio -- --print` | Printed a `file:///` URL to `studio/index.html` |

`verify:sources` fetched these pages:

| Source | Strings found |
| --- | --- |
| [VS Code AI features cheat sheet](https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet) | 30 |
| [VS Code approvals](https://code.visualstudio.com/docs/agents/run/approvals) | 5 |
| [VS Code prompt files](https://code.visualstudio.com/docs/agent-customization/prompt-files) | 5 |
| [VS Code agent harnesses](https://code.visualstudio.com/docs/agents/run/agent-harnesses) | 3 |
| [GitHub Copilot app slash commands](https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands) | 12 |

## Exercise checks

Observed with `node scripts/check.mjs <id> --baseline` and `--solution`. In baseline mode, the command exits 0 only when the starter fails exactly the checks it is meant to fail.

| Exercise | Baseline (pass / fail) | Solution (pass / fail) |
| --- | --- | --- |
| 01-clarify-before-code | 1 / 5 | 6 / 0 |
| 02-ground-in-the-repo | 1 / 4 | 5 / 0 |
| 03-prove-it-with-tests | 1 / 4 | 5 / 0 |
| 04-clean-context-handoff | 1 / 4 | 5 / 0 |
| 05-deps-reality-check | 1 / 4 | 5 / 0 |
| 06-deslop-the-diff | 1 / 5 | 6 / 0 |
| 07-scope-contract | 3 / 3 | 6 / 0 |
| 08-root-cause-not-symptom | 2 / 4 | 6 / 0 |

## Media

`npm.cmd run gifs` recorded each scene in headless Chromium. Before each capture, the recorder re-ran that exercise's checks against the reference solution and confirmed the scene's final terminal count.

| GIF | Frames | Size |
| --- | --- | --- |
| [plan.gif](assets/gifs/plan.gif) | 15 | 201 KiB |
| [ground.gif](assets/gifs/ground.gif) | 15 | 203 KiB |
| [verify.gif](assets/gifs/verify.gif) | 15 | 191 KiB |
| [contain.gif](assets/gifs/contain.gif) | 15 | 192 KiB |
| [context.gif](assets/gifs/context.gif) | 15 | 183 KiB |
| [studio-tour.gif](assets/gifs/studio-tour.gif) | 11 | 275 KiB |

The posters were opened and inspected visually: `plan-after.png` and `studio-tour.png`. The GIFs and studio scenes are **illustrative**. They aren't recordings of Copilot output.

## Not verified

None of these were run while preparing this record. Use the [live VS Code checklist](labs/facilitator.md#live-vs-code-checklist) to record them.

- That the 12 prompt files appear in the VS Code chat `/` menu, and run with their declared tool limits, in a live Copilot session.
- That `/disableAutoApprove` requires approval for the next action.
- How `chat.promptFilesRecommendations` in `.vscode/settings.json` behaves in your VS Code version.
- Any participant's end-to-end exercise result with Copilot.
- Any effect on productivity or defect rates. This lab makes no such claim.
