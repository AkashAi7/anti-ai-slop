const PRICE = /^\$?(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d{1,2}))?$/;

export function toCents(text) {
  const match = typeof text === 'string' ? PRICE.exec(text.trim()) : null;
  if (!match) throw new Error(`Invalid price: ${typeof text === 'string' ? JSON.stringify(text) : typeof text}`);
  const [, whole, fraction = ''] = match;
  const cents = Number(whole.replaceAll(',', '')) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) throw new Error(`Invalid price: ${JSON.stringify(text)} is too large`);
  return cents;
}
