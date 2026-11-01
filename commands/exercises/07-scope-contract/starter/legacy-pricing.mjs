// FROZEN: legacy pricing used by the old invoicing export. Do not change without the billing team.
export function legacySubtotal(lines) {
  let sum = 0;
  for (const line of lines) sum += line.priceCents;
  return sum;
}
