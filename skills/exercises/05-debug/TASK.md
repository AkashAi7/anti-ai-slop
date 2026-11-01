# 05 - Trace the boundary error

Run `npm run setup -- 05-debug` and `npm run check -- 05-debug --baseline`.
Expected red: timestamp conversion and rejection of missing timestamps.
Only edit `work/05-debug/incident.mjs`; record investigation notes separately if useful.

This independent fixture receives `createdAtSeconds`, a finite number of **epoch seconds**. Return an ISO UTC string. Zero is valid; missing, null, strings, and infinity must throw `TypeError`. Out-of-range dates may throw `RangeError`.

Invoke `/systematic-debugging`. Reproduce with 86400, trace the unit expected by `Date`, and form one falsifiable hypothesis before changing code. Do not add a retry wrapper.

Run `npm run check -- 05-debug`.

**Human acceptance:** show reproduction -> hypothesis -> minimal experiment -> cause -> regression evidence. A guessed multiplication that happens to pass is weaker evidence than a traced boundary.

**Reflect:** Why would retries never fix this deterministic error? This fixture has a different interface from exercise 02; do not transfer its assumptions blindly.
