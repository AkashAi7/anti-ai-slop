---
name: verify
description: Run the real checks and report only what was observed - command, exit code, result. Ends with VERIFIED or NOT VERIFIED.
argument-hint: <what claim to verify, and optionally which command>
agent: agent
tools: ['read/readFile', 'read/problems', 'read/terminalLastCommand', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/testFailure']
---
# /verify - evidence, not claims

## Goal
Decide whether the claim after `/verify` is true, using commands that actually ran in this workspace.

## Steps
1. Find the real verification commands: package scripts, task files, README, or the command named in the request. Do not invent commands.
2. Run each one. Wait for it to finish. Record the exact command, the exit code, and the relevant output lines.
3. Compare every claim (for example "all tests pass" or "the bug is fixed") with what you observed.
4. If a command cannot run, record why. Do not substitute a guess.

## Output format
| Command | Exit code | Observed result |
|---|---|---|

| Claim | Evidence | Holds? |
|---|---|---|

**Verdict:** `VERIFIED` only if every claim holds with evidence. Otherwise `NOT VERIFIED`, followed by what is missing.

## Stop conditions
- Do not edit files to make checks pass.
- Do not run destructive commands (delete, reset, force push, install, deploy).
- Never write "should pass", "likely works", or "tests pass" without a command and exit code in the table.
