# Hints

1. `normalizeSpaces` does the same job as `collapseWhitespace` in `text.mjs`. Import the shared helper and delete the local copy.
2. Check `typeof input` up front and throw a `TypeError`; then the empty `try`/`catch` has nothing left to hide.
3. A useful test fails on the original code: try `slugify(42)`, or mock `console.log` with `t.mock.method` and count the calls.
