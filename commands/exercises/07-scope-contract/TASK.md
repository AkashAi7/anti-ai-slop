# 07 - Write the scope contract first

**Slop:** a one-line bug fix turns into a drive-by refactor. The agent "also fixes" a frozen legacy file, tidies unrelated code, or changes a public signature.

**Command flow:** `/scope` → `/disableAutoApprove` → `/tools` → `/pre-commit`

- `/scope` writes `SCOPE.md` (40 lines max): goal, allowed changes, forbidden paths, frozen API, done-when, and rollback.
- `/disableAutoApprove` puts every edit and terminal command back behind your approval.
- `/tools` turns off tools the fix does not need, such as web search and fetch.
- `/pre-commit` reads `SCOPE.md` and the diff, then reports READY or NOT READY with evidence for each line. It edits and commits nothing.

Set up your copy and confirm the defect:

```powershell
npm run setup -- 07-scope-contract
npm run check -- 07-scope-contract --baseline
```

Expected red: `quantity is applied`, `learner regression catches the bug`, `SCOPE.md is a real contract`.

Edit only `work/07-scope-contract/SCOPE.md` (new), `work/07-scope-contract/cart.mjs`, and `work/07-scope-contract/cart.test.mjs`. `legacy-pricing.mjs` has the same bug but is frozen: report it, do not fix it. `format.mjs` is unrelated. Keep the exports and parameters of `cart.mjs` exactly as they are.

`SCOPE.md` needs these non-empty `##` sections: Goal, Allowed changes, Forbidden, Frozen API, Done when, Rollback.

Start in Copilot Chat:

```text
/scope Bug: cart subtotal ignores quantity. Write work/07-scope-contract/SCOPE.md that allows only cart.mjs and cart.test.mjs, forbids everything else, and freezes the public API. Do not fix the bug yet.
```

Review `SCOPE.md`. Then run `/disableAutoApprove`, and use `/tools` to turn off web and fetch tools. Ask for the `subtotal` fix plus a regression test that fails on the original code, and approve each edit only if `SCOPE.md` allows it. Finish with `/pre-commit`, then:

```powershell
npm run check -- 07-scope-contract
```

Rollback is not a slash command. If an edit goes out of scope, use VS Code chat checkpoints: restore the checkpoint from before that request instead of reverting by hand.

**Human acceptance:** `/pre-commit` reports READY against `SCOPE.md`, and you approved or rejected every edit yourself.

**Reflect:** Why is fixing the same bug in `legacy-pricing.mjs` a risk, even though it looks helpful?
