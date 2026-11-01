export function summarize(rows) {
  const active = rows.filter(({ status }) => status === 'open' || status === 'investigating');
  return { openCount: active.length, ids: active.map(({ id }) => id) };
}
