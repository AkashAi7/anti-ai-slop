---
name: scope
description: Write SCOPE.md - a short contract of allowed changes, forbidden paths, frozen API, done-when, and rollback - before any edit.
argument-hint: <the change, and where SCOPE.md should go>
agent: agent
tools: ['read/readFile', 'search/codebase', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'search/usages', 'edit/createFile', 'edit/editFiles']
---
# /scope - contract before change

## Goal
Write a SCOPE.md for the change after `/scope`, so that every later edit can be checked against it.

## Steps
1. Read the request and the code involved. Find the public API (exports, endpoints, CLI flags) of the files that will change.
2. Search for other files with similar code or the same bug. List them under Forbidden unless the request explicitly includes them.
3. Write SCOPE.md in the folder the request names. If the request names no folder, ask.

## Output format
SCOPE.md, 40 lines or fewer, with exactly these sections:

```
# Scope: <change>
## Goal
## Allowed changes
- <file> - <what may change>
## Forbidden
- <file or area> - <why>
## Frozen API
- <export or signature that must not change>
## Done when
- <observable check, with the real command>
## Rollback
- <how to undo, such as restoring a checkpoint or reverting the listed files>
```

## Stop conditions
- Create or edit only SCOPE.md. Do not touch code, tests, or any other file.
- Do not start the fix.
- Do not list a command under Done when unless you found it in the repository.
