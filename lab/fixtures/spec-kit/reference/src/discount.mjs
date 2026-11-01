import { coupons } from './coupons.mjs';

export function quoteDiscount(subtotalCents, codes, today) {
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 0) {
    throw new TypeError('subtotalCents must be non-negative safe integer cents.');
  }
  if (!Array.isArray(codes) || codes.some((code) => typeof code !== 'string')) {
    throw new TypeError('codes must be an array of strings.');
  }
  if (typeof today !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(today)
    || !Number.isFinite(Date.parse(today)) || new Date(today).toISOString().slice(0, 10) !== today) {
    throw new TypeError('today must be a valid YYYY-MM-DD date.');
  }
  let selected = null;
  let percent = 0;
  for (const code of codes) {
    if (!Object.hasOwn(coupons, code)) throw new RangeError(`Unknown code: ${code}`);
    const coupon = coupons[code];
    if (today > coupon.expiresOn) throw new RangeError(`Expired code: ${code}`);
    if (selected === null || coupon.percent > percent) {
      selected = code;
      percent = coupon.percent;
    }
  }
  const discountCents = Math.floor(subtotalCents / 100) * percent
    + Math.floor((subtotalCents % 100) * percent / 100);
  return { code: selected, discountCents, totalCents: subtotalCents - discountCents };
}
