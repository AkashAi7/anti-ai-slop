// Date helpers for ISO calendar dates ('YYYY-MM-DD'). All math is done in UTC.

export function addDays(iso, days) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match || !Number.isInteger(days)) throw new TypeError('addDays expects an ISO date string and whole days.');
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + days));
}

export function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
