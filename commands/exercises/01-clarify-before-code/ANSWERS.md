# Product owner answers - 01 Clarify before you code

Use this file only to answer the questions `/clarify` asks you. Answer in your own words; do not attach or paste this file into the chat. On a real team, the person who owns the decision answers these, not the model.

- **Do codes stack?** No. When several valid codes are given, only the single best code (highest percent) applies.
- **How is money handled?** Totals are integer cents. The discount amount is floored to a whole cent, so the customer pays `total - Math.floor(total * percent / 100)`.
- **When does a code expire?** A code is valid through its expiry date, inclusive. Compare ISO `YYYY-MM-DD` date strings; `today` is passed in as one.
- **What about unknown or expired codes?** Throw an `Error` whose message names the code and says `unknown` or `expired`.
- **One bad code among good ones?** Reject the whole request. Do not apply the valid codes.
- **Anything not listed here?** Out of scope for this change. Answer "out of scope, keep current behavior".
