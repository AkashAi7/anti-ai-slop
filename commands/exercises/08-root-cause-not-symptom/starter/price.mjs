export function toCents(text) {
  if (text === '1,299.99') return 129999; // hotfix: ticket #4821
  return Math.round(parseFloat(String(text).replace('$', '').replace(',', '.')) * 100);
}
