---
name: ground
description: Map what a change needs to what already exists in the repo, with file:line evidence. Flags invented helpers, config keys, and APIs.
argument-hint: <the file or change to ground>
agent: agent
tools: ['read/readFile', 'search/codebase', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'search/usages']
---
# /ground - anchor the change in repo truth

## Goal
Before code is written or accepted, list everything the change after `/ground` depends on and prove whether each one exists in this repository.

## Steps
1. Read the named file or request.
2. List every dependency the code needs or uses: helpers, modules, exported functions, config keys, environment variables, conventions, and test commands.
3. Search the repository for each one. Read the definition, not just the name.
4. Classify each one:
   - **EXISTS**: found with the same meaning. Cite file:line.
   - **SIMILAR**: something close exists (for example, a different name or signature). Cite file:line and say what differs.
   - **MISSING**: not found after searching. Say what you searched for.
5. Flag every reference in the current code that points at something MISSING. That is an invented API.

## Output format
| Need | Status | Evidence (file:line) | Note |
|---|---|---|---|

Then **Invented references** (bullets) and **Use instead** (bullets mapping each invented or re-implemented item to the real one).

## Stop conditions
- Never guess a path or line number. If you did not open the file, you cannot cite it.
- Do not edit files.
- Do not recommend adding a new helper when an EXISTS or SIMILAR row already covers the need.
