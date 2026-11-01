export function subtotal(lines) {
  return lines.reduce((sum, line) => sum + line.priceCents, 0);
}
