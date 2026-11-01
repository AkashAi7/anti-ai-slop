export function subtotal(items) {
  return items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
}

export function applyTax(cents, rate) {
  return cents + Math.round(cents * rate);
}

export function total(items, rate) {
  return applyTax(subtotal(items), rate);
}
