# 04 - Hand off, then start clean

**Slop:** a long chat stopped halfway through a CSV fix. The decisions are buried in rambling notes, next to an idea that was already rejected, and a new session would have to guess them again.

**Command flow:** `/handoff` → `/clear` → `/compact`

- `/handoff` writes a short HANDOFF.md (goal, state, decisions, evidence, open questions, next steps) whose paths all exist.
- `/clear` starts a fresh chat, so stale context and rejected ideas do not leak into the fix.
- `/compact` summarizes the new chat if it grows long, instead of letting old turns crowd out the task.

```powershell
npm run setup -- 04-clean-context-handoff
npm run check -- 04-clean-context-handoff --baseline
```

Expected red: commas, quotes, and newlines are escaped; report reuses toCsvRow; HANDOFF.md has every section; HANDOFF.md is concise and grounded.

Only edit files under `work/04-clean-context-handoff/`: create `HANDOFF.md`, then change `csv.mjs` and `report.mjs`. Treat `NOTES.md` as the previous chat. Start with this prompt:

```text
/handoff Write work/04-clean-context-handoff/HANDOFF.md for the half-finished CSV refactor described in work/04-clean-context-handoff/NOTES.md. Verify every path you cite. Do not edit code.
```

1. Review HANDOFF.md: at most 60 lines, all six `##` sections filled, no TBD, TODO, "...", or angle-bracket placeholders, and at least two backticked file paths that exist (relative to the work folder or the lab root). Missing evidence says "not run".
2. Run `/clear`. In the new chat, attach only HANDOFF.md and ask the agent to carry out its next steps. Do not mention NOTES.md.
3. If that chat grows long, run `/compact` and check that the summary still carries the decisions.

```powershell
npm run check -- 04-clean-context-handoff
```

**Human acceptance:** a teammate could finish the fix from HANDOFF.md alone, without reading NOTES.md.

**Reflect:** Which rejected idea in NOTES.md would a long, uncleared chat have been most likely to bring back?
