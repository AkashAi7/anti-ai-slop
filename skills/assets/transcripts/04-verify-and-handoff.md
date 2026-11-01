# Prove done before saying done

Illustrative walkthrough - not recorded Copilot output

Real exercise: [08-capstone](../../exercises/08-capstone/TASK.md)

## WITHOUT A SKILL: Confidence is not a test result.

Participant: Is the incident handoff finished?

Weak example: everything works perfectly. No command, result, or limitation is supplied.

```text
{
  "changed": "Done, everything works!",
  "command": "",
  "observed": "",
  "evidenceKind": "unverified"
}
```

Terminal/observation: Unsupported completion claim.

## INVOKE SKILL: Map the claim to its check.

Participant: /verification-before-completion Prove it.

Check active statuses, empty input, ordering, and mutation. Inspect the result, not just the command name.

```text
Required behavior:
- open + investigating only
- exact { openCount, ids } shape
- empty input supported
- input order preserved
- no mutation
```

Terminal/observation: npm run check -- 08-capstone

## OBSERVE: A partial failure is valid evidence.

Participant: Read the actual first run.

After the behavior fix, three behavior checks pass. Report metadata is still incomplete. Record that truthfully.

```text
Behavior checks: 3 passed
Report check:   1 failed

Next action:
Record the real command and observation.
Do not invent an earlier successful run.
```

Terminal/observation: Exit status: nonzero until report metadata is complete.

## RERUN: Verify the completed artifact.

Participant: Finish metadata and rerun the same checks.

Record evidenceKind as observed, the actual outcome, and unverified integration scope. Run checks again.

```text
{
  "evidenceKind": "observed",
  "command": "npm run check -- 08-capstone",
  "observed": "Actual first-run result...",
  "notVerified": ["Live integration"]
}
```

Terminal/observation: Expected corrected result: all 4 checks pass.

## HAND OFF: Short, precise, and honest.

Participant: /concise-handoff Summarize the final run.

Changed: active-only handoff summary.
Verified: local acceptance checks.
Not verified: live integration.
Next: review and integration validation.

```text
Changed:
  Active-only summary; order preserved.
Verified:
  Exact command and observed result.
Not verified:
  Integration and product decisions.
```

Terminal/observation: Human gate: compare the report with actual terminal output.

Takeaway: Report what was verified, what was not, and the next necessary action.
