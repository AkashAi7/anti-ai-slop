# Make discount behavior explicit before implementation

Product request: "Support discount codes. Make checkout correct."

That request is intentionally ambiguous. Do not copy the reference solution.
Use Spec Kit to capture the decisions below before changing code.

## Decisions for the learner to give `/speckit.clarify`

- Keep `quoteDiscount(subtotalCents, codes, today)` and its three parameters.
- It returns `{ code, discountCents, totalCents }`. No codes means `code: null`.
- Use the best **single** valid code, never stack discounts. Duplicate codes do
  not stack. Ties select the first code in the input list.
- Floor discounts to whole cents. Accept non-negative safe integer subtotals,
  including Number.MAX_SAFE_INTEGER, without losing cent precision.
- `codes` is an array of strings. Unknown codes and expired codes are errors,
  even if another valid code is present. Throw TypeError or RangeError.
- `today` is an explicitly supplied, valid YYYY-MM-DD date. Expiry is inclusive:
  a code can be used on its expiresOn date, but not after it. No system clock.
- Do not mutate inputs or the existing catalogue in src/coupons.mjs.
- Only src/discount.mjs, src/discount.test.mjs, and Spec Kit's constitution and
  feature documents may change. No dependencies, API, UI, network or database.

## Workflow and evidence

Run the installed Spec Kit slash commands separately:
constitution → specify → clarify → plan → checklist → tasks → analyze →
implement → converge.

For planning, choose Node.js ESM, node:test, integer cents, and the existing
catalogue. Include at least four regression tests in src/discount.test.mjs,
importing `./discount.mjs`. Tests must fail on the original starter and pass
after repair. Resolve analysis findings before implementation.

`checklist` reviews the quality of the requirements; it does not prove that
code works. A human reviews custom checklist items. `converge` is another
review, not a substitute for `npm test` and the independent `npm run check`.

Commands layout in VS Code: `/speckit.constitution`, `/speckit.specify`, etc.
Default skills layout in the Copilot app: `/speckit-constitution`,
`/speckit-specify`, etc. Select the actual installed entry in the `/` picker.
