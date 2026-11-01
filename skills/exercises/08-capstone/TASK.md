# 08 - Prove done, then hand off

Run `npm run setup -- 08-capstone` and `npm run check -- 08-capstone --baseline`.
Expected red: resolved incidents are included and the "done" report lacks evidence.
Only edit learner `incident.mjs` and `handoff.json`.

Contract: `summarize(rows)` returns exactly `{ openCount, ids }` for statuses `open` or `investigating`. Preserve input order, do not mutate inputs, and return `{ openCount: 0, ids: [] }` for empty input. Inputs are well-formed incident arrays. No new dependency or service.

Use `/scope-contract` if needed, implement the bounded fix, then invoke `/verification-before-completion`.

```powershell
npm run check -- 08-capstone
```

Initially the handoff check will still fail. Record that real result honestly: for example, three behavior checks passed while report metadata remained incomplete. Set `evidenceKind` to `observed`, record the exact command, changed behavior, observed result, and at least one limitation (such as live integration not tested). Do not copy fixture evidence.

Rerun the same command after completing metadata. Use `/concise-handoff` to summarize the final observed run in Chat. There is no need to invent a successful first run or recursively rewrite metadata to claim it predicted the final run.

**Human acceptance:** compare the report with actual terminal output and inspect the diff. The automated report-shape test cannot prove a command was honestly recorded.

**Reflect:** Which claims do these local checks support, and which still require integration or human review?
