---
name: failure-paths
description: 'Design and test explicit failure behavior. Use when code swallows errors, returns success-shaped defaults, conflates empty data with failure, or ignores invalid input.'
---

# Failure paths

1. Identify the boundary and accepted input/output contract.
2. Enumerate expected success, valid-empty, malformed, unavailable, and unexpected-failure cases that apply.
3. Choose the established project error mechanism: thrown typed error, explicit result, or documented status. Ask if the product policy is ambiguous.
4. Preserve meaningful causes and context without leaking secrets. Do not convert an error to an empty success.
5. Catch only errors the boundary can handle meaningfully. Avoid blanket catches, duplicate logging, or speculative retry loops.
6. Add negative-path tests asserting observable failure and positive tests protecting valid-empty behavior.
7. Verify callers can distinguish success from failure.

**Output:** case -> expected outcome -> test -> result, with any unresolved policy.

**Lab:** exercise 06 distinguishes `[]` from malformed JSON and a non-array payload. Do not add a logging framework to a small pure parser.
