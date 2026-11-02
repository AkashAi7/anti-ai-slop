# Review feedback on the cart repair

Three comments from a reviewer on the repaired `src/cart.mjs`. They are not all
correct. Use `/receiving-code-review` to evaluate each one against BRIEF.md and
the code before changing anything.

1. **Name the error.** The quantity check throws a bare `RangeError`. Add a
   message that names the bad field and line index, for example
   `RangeError('line 2: qty must be a positive safe integer')`, so a failing
   checkout is easy to diagnose.

2. **Use dollars.** Cents are awkward to read. Change `subtotal` to accept
   `price` in dollars as a float, such as `4.99`, and return dollars as well.

3. **Add tax while you are in there.** Add an optional `taxRate` parameter to
   `subtotal` so the checkout page can show a total including tax.
