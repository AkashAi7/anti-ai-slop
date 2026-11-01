# Hints

1. `node:fs` has `readFileSync`, not `readJSONSync`. Read the file as UTF-8 and parse it with `JSON.parse`.
2. `String.prototype.padStart` replaces `left-pad`. `Number.isInteger` plus a range check replaces the validator.
3. `"80"` and `3000.5` are not valid ports. Delete the dependencies from `package.json`; moving them to another section does not make the imports real.
