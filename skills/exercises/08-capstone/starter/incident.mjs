export function summarize(rows) {
  return { openCount: rows.length, ids: rows.map((row) => row.id) };
}
