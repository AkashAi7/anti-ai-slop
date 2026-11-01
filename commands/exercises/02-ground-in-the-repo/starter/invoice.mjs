import { readFileSync } from 'node:fs';
import * as dates from './lib/dates.mjs';

const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'));

// Fallback in case the shared date helper is not available.
function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildInvoice({ id, issued, amountCents }) {
  const termsDays = config.paymentTermsDays ?? 14;
  const dueDate = new Date(issued);
  dueDate.setDate(dueDate.getDate() + termsDays);
  const due = dates.toISODate ? dates.toISODate(dueDate) : localISO(dueDate);
  return { id, issued, due, amount: '$' + (amountCents / 100).toFixed(2) };
}
