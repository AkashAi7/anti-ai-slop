import { toCsvRow } from './csv.mjs';

export function buildReport(rows) {
  const lines = [toCsvRow(['name', 'qty', 'note'])];
  for (const row of rows) lines.push(toCsvRow([row.name, row.qty, row.note]));
  return lines.join('\n');
}
