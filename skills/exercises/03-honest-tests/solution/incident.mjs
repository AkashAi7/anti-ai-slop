export function countOpen(incidents) {
  return incidents.filter(({ status }) => status === 'open' || status === 'investigating').length;
}
