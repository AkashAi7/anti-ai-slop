import { csvEscape } from './csv.mjs';

export function buildReport(rows) {
  const lines = ['name,qty,note'];
  for (const row of rows) {
    const note = row.note.includes(',') ? '"' + row.note + '"' : row.note;
    lines.push(csvEscape(row.name) + ',' + row.qty + ',' + note);
  }
  return lines.join('\n');
}
