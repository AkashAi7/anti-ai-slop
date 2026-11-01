# 06 - Deslop the previous agent's diff

**Slop:** the previous agent's `slugify` "works", but it prints debug output, hides errors in an empty `catch`, re-implements a helper that already exists in `text.mjs`, narrates every line in comments, and ships a test that cannot fail.

**Command flow:** `/deslop` → `/simplify` → `/verify`

- `/deslop` lists swallowed errors, fake tests, duplicate helpers, debug prints, and narrating comments as file:line findings, and edits nothing.
- `/simplify` removes the duplication and noise, with tests green before and after and a reason for each removal.
- `/verify` runs the checks and reports the command, exit code, and observed result for every claim.

Set up your copy and confirm the defect:

```powershell
npm run setup -- 06-deslop-the-diff
npm run check -- 06-deslop-the-diff --baseline
```

Expected red: `no debug output`, `errors are not swallowed`, `shared helper is reused`, `learner tests assert real behavior`, `learner tests catch the original`.

Edit only `work/06-deslop-the-diff/slugify.mjs` and `work/06-deslop-the-diff/slugify.test.mjs`. `text.mjs` is shared code: reuse it, do not change it.

Contract: `slugify(text)` lowercases, strips accents, turns every run of non-alphanumeric characters into one dash, and trims dashes from both ends (`'Héllo   Wörld!'` → `'hello-world'`). A non-string input throws a `TypeError`. No console output. Use `collapseWhitespace` and `stripAccents` from `./text.mjs`; `slugify` is the only function in `slugify.mjs`.

Start in Copilot Chat:

```text
/deslop work/06-deslop-the-diff/slugify.mjs and work/06-deslop-the-diff/slugify.test.mjs. Report findings with file:line only. Do not edit anything.
```

Replace the fake test with real ones first, so `/simplify` has a safety net. Then simplify, run `/verify`, and:

```powershell
npm run check -- 06-deslop-the-diff
```

**Human acceptance:** every `/deslop` finding is either fixed or explicitly rejected with a reason, and the final diff is smaller than the code it replaced.

**Reflect:** Which finding would a quick "looks good to me" review have missed?
