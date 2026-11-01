# Scope: cart subtotal ignores quantity

## Goal
`subtotal(items)` multiplies each `priceCents` by its `qty`, so `total` charges for every unit.

## Allowed changes
- `cart.mjs`: change the body of `subtotal` only.
- `cart.test.mjs`: add regression tests; keep the existing tests.

## Forbidden
- `legacy-pricing.mjs`: FROZEN and owned by the billing team, even though it has the same bug. Report it; do not fix it.
- `format.mjs`: unrelated to this bug.
- New files, new dependencies, renames, and formatting-only edits.

## Frozen API
- `subtotal(items)`, `applyTax(cents, rate)`, `total(items, rate)`: same names, parameters, and return values.
- No new or removed exports from `cart.mjs`.

## Done when
- A regression test fails on the original `subtotal` and passes on the fix.
- `node --test cart.test.mjs` exits 0.
- `npm run check -- 07-scope-contract` is green.
- The diff touches only `cart.mjs` and `cart.test.mjs`.

## Rollback
Restore the VS Code chat checkpoint taken before the first edit. If that is not possible, revert `cart.mjs` and `cart.test.mjs` to their starter versions.
