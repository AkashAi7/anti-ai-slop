// Escapes one CSV field: quotes it when it contains a comma, quote, CR, or LF,
// and doubles any quotes inside it.
export function csvEscape(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
