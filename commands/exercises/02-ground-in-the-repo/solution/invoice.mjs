import { readFileSync } from 'node:fs';
import { addDays, formatDate } from './lib/dates.mjs';
import { formatMoney } from './lib/money.mjs';

const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'));

export function buildInvoice({ id, issued, amountCents }) {
  return {
    id,
    issued,
    due: formatDate(addDays(issued, config.invoice.dueInDays)),
    amount: formatMoney(amountCents),
  };
}
