# Hints

1. "Truthy" passes for 1, 5400, and 99999. Assert exact numbers with `assert.equal`.
2. For rejections, use `assert.throws(() => parseDuration(input), /Invalid duration/)` and loop over a list of bad inputs.
3. Check `typeof text !== 'string'` before trimming. Every group in the pattern is optional, so the empty string matches it; reject it separately.
