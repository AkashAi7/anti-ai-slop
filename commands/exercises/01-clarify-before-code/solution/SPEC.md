# Discount codes - spec

## Goal

`applyDiscounts(totalCents, codes, today)` in `discount.mjs` returns what the customer pays, in integer cents, after applying at most one discount code.

## Non-goals

- Adding, removing, or editing entries in `CODES`.
- Per-item discounts, currency conversion, or tax.

## Inputs and outputs

- `totalCents`: order total as an integer number of cents.
- `codes`: array of code strings, possibly empty.
- `today`: ISO date string `YYYY-MM-DD`.
- Returns an integer number of cents, or throws an `Error`.

## Acceptance criteria

- Given no codes, When 10000 cents is discounted on 2026-06-01, Then the result is 10000.
- Given WELCOME5 and SAVE10, When 10000 cents is discounted, Then codes do not stack: only the best code (SAVE10) applies and the result is 9000.
- Given SAVE10, When 1999 cents is discounted, Then the discount is floored to a whole cent (199) and the result is 1800 cents.
- Given SPRING20 (expires 2026-04-30), When today is 2026-04-30, Then the result for 10000 is 8000.
- Given SPRING20, When today is 2026-05-01, Then it throws an error that names SPRING20 and says it expired.
- Given an unknown code such as BOGUS, When it is applied, Then it throws an error that names the code and says it is unknown.
- Given one invalid code alongside valid codes, When they are applied, Then the whole request is rejected.

## Edge cases

- The same code twice counts once.
- Order of codes does not change the result.
- `OPEN:` are codes case-sensitive? Not asked; current behavior is an exact match.

## Risks

- Callers that relied on stacking or on silently ignored codes will now get a smaller discount or an error.

## Verification

- `npm run check -- 01-clarify-before-code` - all 6 checks pass.
