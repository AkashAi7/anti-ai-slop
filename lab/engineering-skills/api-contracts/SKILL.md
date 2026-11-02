---
name: api-contracts
description: Use before changing a public function, endpoint, event or schema to map its contract, callers and compatibility requirements.
---

# API contracts and compatibility

## Before proposing a change

1. Identify the public entry point and every in-repository caller, consumer and contract test in scope.
2. Gather the current contract from source, tests, schemas and documentation. Separate verified behavior from assumptions.
3. Record inputs, outputs, errors, side effects, ordering, defaults and compatibility expectations, including boundary cases.
4. Ask about ambiguous behavior or breaking-change policy. Do not silently choose a new contract.

## Change and verification

- Prefer preserving the existing public shape unless the user approves an API change.
- Add or update tests for valid behavior, invalid inputs, boundary values and compatibility with existing callers.
- If an intentional breaking change is approved, identify affected consumers and provide a migration path.
- Verify serialized names, status codes, error shapes and versioning rules for network APIs; do not infer them from an implementation detail.

## Report

Return a compact contract table with evidence locations, consumers, proposed changes and unresolved decisions. After implementation, state which compatibility tests ran and what they do not cover. Do not describe an interface as backward compatible without checking its callers and contract tests.
