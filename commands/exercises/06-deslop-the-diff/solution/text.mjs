export function collapseWhitespace(s) {
  return s.trim().replace(/\s+/g, ' ');
}

export function stripAccents(s) {
  return s.normalize('NFD').replace(/\p{M}/gu, '');
}
