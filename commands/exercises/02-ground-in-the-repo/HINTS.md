# Hints

1. A MISSING row in the `/ground` table means "use what exists instead", not "write a fallback".
2. The payment term lives under the `invoice` key in `config.json`. Read the key that exists; do not add a default.
3. `formatDate(addDays(issued, days))` keeps all date math in `lib/dates.mjs`. Money formatting is one call to `formatMoney`.
