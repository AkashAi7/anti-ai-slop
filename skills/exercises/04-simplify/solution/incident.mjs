import { byPriority } from './conventions.mjs';
export function sortPriority(rows) {
  return [...rows].sort(byPriority);
}
