import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ROOT = resolve(SITE, '..');
export const LAB = join(ROOT, 'lab');

export const REPOSITORY = 'https://github.com/AkashAi7/anti-ai-slop';
export const PAGES_URL = 'https://akashai7.github.io/anti-ai-slop/';

const DOWNLOAD_DIR = join(SITE, 'assets', 'downloads');
export const DOWNLOADS = {
  lab: join(DOWNLOAD_DIR, 'anti-slop-lab.zip'),
  skills: join(DOWNLOAD_DIR, 'anti-slop-public-skills.zip'),
  gifs: join(DOWNLOAD_DIR, 'anti-slop-walkthroughs.zip'),
};

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

// Catalog strings use `code` spans and nothing else; render those, escape the rest.
export const inline = (value) => esc(value).replace(/`([^`]+)`/g, '<code>$1</code>');

// GitHub-style heading ids, so #anchors written in the lab guides work on the site too.
export const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');

export function urlFrom(fromFile, toPath) {
  const rel = relative(dirname(fromFile), toPath);
  return rel.split(sep).map((part) => (part === '..' ? part : encodeURIComponent(part))).join('/');
}

export const relativeToRoot = (path) => relative(ROOT, path).split(sep).join('/');
export const repoUrl = (path, kind = 'blob') => `${REPOSITORY}/${kind}/main/${relativeToRoot(path)}`;
