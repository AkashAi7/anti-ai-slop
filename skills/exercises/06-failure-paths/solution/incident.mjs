export function parseIncidents(text) {
  const rows = JSON.parse(text);
  if (!Array.isArray(rows)) throw new TypeError('Expected an incident array');
  return rows;
}
