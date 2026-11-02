---
name: data-migration-safety
description: Use when planning a schema change, backfill or data conversion that must preserve existing records and support safe rollout or recovery.
---

# Data migration safety

## Plan before execution

1. Confirm the schema, source of truth, data volume, write patterns, consumers and invariants from repository evidence.
2. Ask about ambiguous conversion rules, nulls, invalid rows, rounding, uniqueness and rollback expectations. Never invent data policy.
3. Plan an expand-and-contract rollout when old and new application versions may overlap. Keep old readers and writers compatible until the migration is verified.
4. Make backfills idempotent, resumable and bounded. Consider transactions, batch size, locks, retries and concurrent writes.
5. Define a dry run and reconciliation: row counts, rejected rows, totals or checksums, sampled records and key business invariants.
6. Describe rollback or roll-forward steps, including which data can be restored and what happens to writes made after migration.

## Safety limits

- Do not run a destructive migration, production command or data rewrite without explicit approval.
- A backup is not a rollback plan. Verify how restore and forward recovery work.
- Separate a proposed plan from a tested migration. Call out unavailable database, data or operational evidence.

## Report

Return phases, preconditions, compatibility window, idempotency strategy, dry-run checks, reconciliation thresholds, rollback path and unresolved decisions. State plainly when the repository has no database and a scenario is hypothetical.
