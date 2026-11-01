import { collapseWhitespace, stripAccents } from './text.mjs';

export function slugify(input) {
  if (typeof input !== 'string') throw new TypeError(`slugify expects a string, got ${typeof input}`);
  const words = stripAccents(input.toLowerCase()).replace(/[^a-z0-9]/g, ' ');
  return collapseWhitespace(words).replaceAll(' ', '-');
}
