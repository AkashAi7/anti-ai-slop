# Hints

1. Name files in `SCOPE.md` exactly as they appear in the folder, for example `cart.mjs` and `legacy-pricing.mjs`.
2. The fix is one expression inside `subtotal`. If the diff touches more than `cart.mjs` and `cart.test.mjs`, it is out of scope.
3. Your regression test needs an item with `qty` greater than 1, so it fails on the original `subtotal`.
