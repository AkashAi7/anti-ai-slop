export const CODES = {
  SAVE10: { percent: 10, expires: '2026-12-31' },
  WELCOME5: { percent: 5, expires: '2026-12-31' },
  SPRING20: { percent: 20, expires: '2026-04-30' },
};

// Applies the customer's discount codes to an order total.
export function applyDiscounts(totalCents, codes = [], today = new Date().toISOString().slice(0, 10)) {
  let percent = 0;
  for (const code of codes) {
    if (CODES[code]) percent += CODES[code].percent;
  }
  return totalCents * (1 - percent / 100);
}
