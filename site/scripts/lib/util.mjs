import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ROOT = resolve(SITE, '..');
export const LABS = ['commands', 'skills'];

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

// Registry strings use `code` spans and nothing else; render those, escape the rest.
export const inline = (value) => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>');

// Same rule as the labs' validate scripts, so their existing #anchors keep working.
export const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');

export function urlFrom(fromFile, toPath) {
  const rel = relative(dirname(fromFile), toPath);
  return rel.split(sep).map((part) => (part === '..' ? part : encodeURIComponent(part))).join('/');
}

export function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    let value = pair[2].trim();
    if (value.startsWith('[')) value = [...value.matchAll(/'([^']*)'|"([^"]*)"/g)].map((m) => m[1] ?? m[2]);
    else value = value.replace(/^'(.*)'$/s, (_, inner) => inner.replace(/''/g, "'")).replace(/^"(.*)"$/s, '$1');
    data[pair[1]] = value;
  }
  return { data, body: text.slice(match[0].length) };
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
