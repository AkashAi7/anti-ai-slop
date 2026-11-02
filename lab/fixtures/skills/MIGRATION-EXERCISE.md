# Data migration exercise

This is a hypothetical planning scenario. The workspace has no database, and
you must not generate or execute SQL.

A service stores an order's amount in `orders.total_text`. Two million rows
exist, and old application instances continue writing during a rolling
deployment. Values include `"12.34"`, `"5"`, `"1.999"`, an empty string and
`"unknown"`. A new service version expects an integer `total_cents` column.
The old version still reads `total_text`.

Use `/data-migration-safety` to ask which conversion policy applies to values
with more than two decimal places and invalid or empty values. Then outline an
expand/backfill/verify/contract plan, including idempotency, concurrent writes,
dry-run counts, reconciliation and rollback. Do not choose an unstated rounding
or rejection policy.
