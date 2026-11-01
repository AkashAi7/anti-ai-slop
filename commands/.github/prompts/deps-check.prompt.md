---
name: deps-check
description: Verify every import, package, and API member against the manifest, the standard library, or official docs. Never installs anything.
argument-hint: <files or manifest to check>
agent: agent
tools: ['read/readFile', 'search/codebase', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'web/fetch']
---
# /deps-check - is every dependency real and needed?

## Goal
For the files after `/deps-check`, prove that every import and every API member used actually exists, and that each third-party dependency is worth having.

## Steps
1. List every import, require, and dynamic import in the named files, plus the dependencies in the nearest manifest.
2. For each import, record its kind: standard library, local file, or third-party package.
3. For each API member used (for example `fs.readJSONSync`), check that it exists in that module:
   - Standard library: the official docs for the runtime version in use.
   - Local file: open it and find the export.
   - Third-party: the installed package, if present. Otherwise the official registry or docs page. If you cannot check, say UNVERIFIED.
4. For each third-party package, ask whether the standard library or existing code already does the job. Prefer no new dependency.

## Output format
| Import | Kind | API members used | Verdict | Evidence |
|---|---|---|---|---|

Verdict is one of: `OK`, `MISSING API`, `NOT INSTALLED`, `UNVERIFIED`, `REPLACE WITH STDLIB`, `REPLACE WITH LOCAL`.

Then **Recommended changes**: the smallest edits, in order.

## Stop conditions
- Never install, add, or upgrade a package. Never run a package manager.
- Never claim a package exists or does not exist without evidence. Use UNVERIFIED.
- Do not edit files.
