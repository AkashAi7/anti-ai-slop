# 05 - Reality-check the dependencies

**Slop:** the previous agent pulled in a trivial dependency (`left-pad`), a port validator nobody checked (`port-validator-strict`), and called `fs.readJSONSync`, which is an `fs-extra` API, not a `node:fs` one.

**Command flow:** `/deps-check` → `/verify`

- `/deps-check` builds an Import / Kind / API / Verdict table for every import and API member, marks anything it cannot prove as UNVERIFIED, and installs nothing.
- `/verify` runs the checks and reports the command, exit code, and observed result before anyone says "fixed".

Set up your copy and confirm the defect:

```powershell
npm run setup -- 05-deps-reality-check
npm run check -- 05-deps-reality-check --baseline
```

Expected red: `no runtime dependencies`, `only node: and relative imports`, `settings load with defaults`, `invalid ports are rejected`.

Edit only `work/05-deps-reality-check/settings.mjs` and `work/05-deps-reality-check/package.json`. Leave `settings.json` unchanged. Whether or not these packages exist on npm, this project's rule is stdlib only: no runtime dependencies, and imports come only from `node:` built-ins or relative files.

Contract: `loadSettings(file)` returns `{ name, port, debug }`, with `debug` defaulting to `false`. `port` must be an integer from 1 to 65535; anything else throws an `Error` whose message mentions "port". `label(settings)` right-aligns `name:port` to 16 characters.

Start in Copilot Chat:

```text
/deps-check work/05-deps-reality-check/settings.mjs and work/05-deps-reality-check/package.json. Verify every import and API member against the Node.js standard library and the manifest. Do not install anything.
```

Fix only what the table proves wrong, then run `/verify` and:

```powershell
npm run check -- 05-deps-reality-check
```

**Human acceptance:** every row in the `/deps-check` table cites evidence (a Node.js docs page or a manifest line), and nobody ran `npm install`.

**Reflect:** Which import would have passed review just because its name sounded real?
