# Replace confidence with sources

Illustrative walkthrough - not recorded Copilot output

Real exercise: [02-ground](../../exercises/02-ground/TASK.md)

## WITHOUT A SKILL: Plausible is not verified.

Participant: How do I count unresolved incidents?

Weak example: install incident-smart-counter. Also, createdAt is epoch seconds. No source was checked.

```text
{
  "status": "verified",
  "source": "invented.example/guide",
  "dependency": "incident-smart-counter"
}
```

Terminal/observation: Do not install the illustrative package.

## INVOKE SKILL: Open the source of truth.

Participant: /evidence-first Check the supplied contract.

This fictional contract is authoritative for the exercise only. Compare the claims with its actual fields.

```text
// exercises/02-ground/contract.json
{
  "timestamps": "ISO 8601 UTC string",
  "countOpen": "Array.prototype.filter",
  "dependencies": []
}
```

Terminal/observation: Local evidence. No network request or installation needed.

## CLASSIFY: Separate contradicted from unknown.

Participant: What can we actually conclude?

Epoch-seconds claim: contradicted.
Mandatory-package claim: contradicted.
Real registry existence: not checked.

```text
claim       status         source
timestamp   contradicted   contract.json
mandatory   contradicted   contract.json
exists?     unknown        not checked
```

Terminal/observation: Absence of necessity is not proof of nonexistence.

## DECIDE: Reuse the capability already present.

Participant: /dependency-reality-check Is a package needed?

The existing array filter meets the contract. Add no dependency and record the evidence-backed choice.

```text
{
  "decision": "reuse",
  "capability": "Array.prototype.filter",
  "reason": "Meets supplied contract"
}
```

Terminal/observation: npm run check -- 02-ground

## VERIFY + DISCUSS: A citation must support the conclusion.

Participant: Review the ledger and its limitations.

Inspect each referenced field. The checker verifies expected ledger structure, not the honesty of arbitrary prose.

```text
Verified within the exercise:
- timestamp contract
- existing counting capability

Not verified:
- illustrative package registry status
```

Terminal/observation: Expected solution: 2 checks pass. Read the reasoning too.

Takeaway: Verify the claim and the dependency before trusting either.
