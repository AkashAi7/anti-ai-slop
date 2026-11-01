// Formats integer cents as US dollars: 123450 -> '$1,234.50'.
export function formatMoney(cents) {
  if (!Number.isInteger(cents)) throw new TypeError('formatMoney expects integer cents.');
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const dollars = String(Math.floor(absolute / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const remainder = absolute % 100;
  return `${sign}$${dollars}.${remainder < 10 ? '0' : ''}${remainder}`;
}
