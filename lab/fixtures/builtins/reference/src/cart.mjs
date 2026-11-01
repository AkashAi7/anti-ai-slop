export function subtotal(lines) {
  if (!Array.isArray(lines)) throw new TypeError('lines must be an array.');
  let sum = 0;
  for (const line of lines) {
    if (!line || !Number.isSafeInteger(line.priceCents) || line.priceCents < 0
      || !Number.isSafeInteger(line.qty) || line.qty <= 0) {
      throw new TypeError('Each line needs safe integer priceCents and a positive qty.');
    }
    const amount = line.priceCents * line.qty;
    if (!Number.isSafeInteger(amount) || !Number.isSafeInteger(sum + amount)) {
      throw new RangeError('Cart amount exceeds safe integer cents.');
    }
    sum += amount;
  }
  return sum;
}
