# Illustrative discount specification

This is an authored reference fixture, not recorded Spec Kit agent output.

FR-001: Select the best single code; never stack or duplicate discounts.
FR-002: Floor discounts to whole cents, including large safe integer amounts.
FR-003: Reject unknown and expired codes; expiry is inclusive.
FR-004: Validate explicit ISO dates, amounts and code arrays.
FR-005: Preserve the public API, inputs and existing catalogue.

Acceptance: 999 cents with SAVE10 discounts 99 cents. SAVE10 plus SAVE20 on
1000 cents discounts 200 cents. OLD5 on 2026-11-01 is rejected.
