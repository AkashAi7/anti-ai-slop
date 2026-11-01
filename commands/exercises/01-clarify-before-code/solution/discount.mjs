export const CODES = {
  SAVE10: { percent: 10, expires: '2026-12-31' },
  WELCOME5: { percent: 5, expires: '2026-12-31' },
  SPRING20: { percent: 20, expires: '2026-04-30' },
};

// Returns the integer-cent total after the single best valid code.
// Any unknown or expired code rejects the whole request.
export function applyDiscounts(totalCents, codes = [], today = new Date().toISOString().slice(0, 10)) {
  let bestPercent = 0;
  for (const code of codes) {
    if (!Object.hasOwn(CODES, code)) throw new Error(`Discount code ${code} is unknown.`);
    const { percent, expires } = CODES[code];
    // ISO YYYY-MM-DD strings compare correctly as text; the expiry day is still valid.
    if (today > expires) throw new Error(`Discount code ${code} expired on ${expires}.`);
    bestPercent = Math.max(bestPercent, percent);
  }
  return totalCents - Math.floor((totalCents * bestPercent) / 100);
}
