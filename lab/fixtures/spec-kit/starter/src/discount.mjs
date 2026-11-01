import { coupons } from './coupons.mjs';

export function quoteDiscount(subtotalCents, codes, today) {
  const percent = codes.reduce((sum, code) => sum + (coupons[code]?.percent ?? 0), 0);
  const discountCents = Math.ceil(subtotalCents * percent / 100);
  return { code: codes.length ? codes.join('+') : null, discountCents, totalCents: subtotalCents - discountCents };
}
