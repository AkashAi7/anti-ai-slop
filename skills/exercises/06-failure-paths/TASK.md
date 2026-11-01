# 06 - Do not disguise failure as success

Run `npm run setup -- 06-failure-paths` and `npm run check -- 06-failure-paths --baseline`.
Expected red: malformed input is swallowed and valid JSON of the wrong shape is accepted.
Only edit `work/06-failure-paths/incident.mjs`.

Invoke `/failure-paths`. Contract: parse an incident JSON array; `[]` is valid success. Malformed JSON must retain a `SyntaxError`; non-array JSON must throw `TypeError`. Preserve array contents. Record case expectations before changing code.

Run `npm run check -- 06-failure-paths`.

**Human acceptance:** explain how a caller distinguishes "no incidents" from "could not read incidents". Do not add logging inside this pure function; let the actual caller choose its error presentation.

**Reflect:** Why is a success-shaped empty array dangerous when input is broken?
