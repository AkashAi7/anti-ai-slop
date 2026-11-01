# Repair the cart, not the whole application

The checkout subtotal ignores quantity. Reproduce the defect before repairing it.
The test file is deliberately absent: practice `/tests`, not a supplied answer.

## Contract

- Keep the single export `subtotal(lines)`, with one parameter.
- A line is `{ priceCents, qty }`. Use non-negative safe integer cents and a
  positive safe integer quantity. Zero price is valid; zero quantity is not.
- An empty cart costs 0. Sum `priceCents * qty` for every line.
- Reject non-arrays, null lines, missing fields, strings, fractions, negative
  values, NaN, Infinity, and unsafe products or totals. Throw TypeError or
  RangeError; do not silently turn bad input into an empty cart.
- Do not mutate the input. Do not change src/legacy-pricing.mjs.
- Only src/cart.mjs and src/cart.test.mjs may change. No dependencies.

## Red-to-green evidence

1. `/explain` and `/plan`: cite the cause and agree on the scope before editing.
2. `/tests`: write at least four node:test cases in src/cart.test.mjs, importing
   `./cart.mjs`. Preserve empty-cart and quantity-one behavior. Add quantity,
   invalid-input, and overflow regressions. Run `npm test` while the bug remains.
3. `/fix`: repair the implementation, not the assertions.
4. Run `npm test` and `npm run check`. The independent checker also runs your
   tests against the original implementation. A happy-path-only suite fails.
5. Review the diff and explain any remaining limitation.

In the Copilot app, use `/plan`, `/review`, and `/rubber-duck`. `/tests` and `/fix`
are VS Code commands, not promised app commands; request test generation and the
repair in ordinary chat after approving the plan.
