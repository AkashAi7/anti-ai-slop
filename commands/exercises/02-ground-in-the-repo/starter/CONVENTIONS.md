# Conventions

- Dates are ISO `YYYY-MM-DD` strings in UTC. Use `addDays` and `formatDate` from `lib/dates.mjs`. Do not write date math by hand.
- Money is always integer cents. Format it only with `formatMoney` from `lib/money.mjs`.
- Settings come from `config.json`. Read the keys that exist there; do not invent keys or hard-code fallback values.
- Do not change `lib/` or `config.json` to make a feature fit. Change the feature.
