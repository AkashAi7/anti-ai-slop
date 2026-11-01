# 02 - Ground it in the repo

**Slop:** the agent called a date helper that does not exist, hedged with a hand-rolled fallback, read a config key nobody defined, and formatted money with `toFixed`.

**Command flow:** `/init` → `/ground` → `/verify`

- `/init` records a repository's real conventions in workspace instructions, so every session starts from them.
- `/ground` lists everything the change needs and whether it already exists, with file:line evidence.
- `/verify` runs the checks and reports the command, exit code, and result behind every claim.

`/init` is for real repositories: run it once there and review what it writes. In this lab it would write workspace instructions at the lab root, so skip it here or discard the result. `CONVENTIONS.md` plays that role in this exercise.

```powershell
npm run setup -- 02-ground-in-the-repo
npm run check -- 02-ground-in-the-repo --baseline
```

Expected red: invoice uses the repo helpers; no hand-rolled date or money code; due date comes from config; amount uses formatMoney.

Only edit `work/02-ground-in-the-repo/invoice.mjs`. Do not change `lib/` or `config.json`; a check compares them byte for byte with the starter.

Start with this prompt:

```text
/ground Read exercises/02-ground-in-the-repo/TASK.md. For work/02-ground-in-the-repo/invoice.mjs, list every helper, config key, and API it needs and whether it already exists under work/02-ground-in-the-repo, with file:line evidence.
```

1. Read the table. Every EXISTS row needs a file:line you can open. Every MISSING row the code uses is an invented reference.
2. Ask the agent to rewrite `buildInvoice` using only what the table proved exists, following `CONVENTIONS.md`.
3. Run `/verify` with the claim "invoice.mjs uses the repo helpers and the checks pass".

```powershell
npm run check -- 02-ground-in-the-repo
```

**Human acceptance:** open each file:line the `/ground` table cites and confirm it says what the table claims.

**Reflect:** Why is a hedge like `dates.toISODate ? dates.toISODate(d) : localISO(d)` worse than an import that fails loudly?
