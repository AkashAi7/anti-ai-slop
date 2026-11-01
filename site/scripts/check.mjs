import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, SITE } from './lib/util.mjs';
import { PAGES } from './lib/layout.mjs';
import { DOCS, generate, listHtml } from './build.mjs';

const errors = [];
const fail = (page, message) => errors.push(`${relative(ROOT, page)}: ${message}`);
const EXTERNAL = /^(https?:|mailto:)/i;

const ids = (html) => [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]);

function textOutsideCode(html) {
  return html
    .replace(/<pre[\s\S]*?<\/pre>/g, ' ')
    .replace(/<code[\s\S]*?<\/code>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

export function check() {
  const files = generate();
  let links = 0;
  let anchors = 0;

  for (const [path, content] of files) {
    if (!existsSync(path)) fail(path, 'missing. Run npm run build.');
    else if (readFileSync(path, 'utf8') !== content) fail(path, 'out of date. Run npm run build.');
  }
  for (const path of listHtml(DOCS)) if (!files.has(path)) fail(path, 'stale page. Run npm run build.');

  const pageIds = new Map([...files].map(([path, html]) => [path, new Set(ids(html))]));

  for (const [page, html] of files) {
    if (!/<html lang="en">/.test(html)) fail(page, 'missing <html lang>');
    if (!/<title>[^<\s][^<]*<\/title>/.test(html)) fail(page, 'missing or empty <title>');
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) fail(page, `expected 1 h1, found ${h1}`);
    const seen = new Set();
    for (const id of ids(html)) {
      if (seen.has(id)) fail(page, `duplicate id "${id}"`);
      seen.add(id);
    }
    for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
      if (!/\salt="/.test(img)) fail(page, `image without alt: ${img.slice(0, 80)}`);
    }
    for (const tag of html.match(/<(img|script|link)\b[^>]*>/g) ?? []) {
      if (/\s(src|href)="(https?:)?\/\//i.test(tag)) fail(page, `loads a remote resource: ${tag.slice(0, 80)}`);
    }
    const leftovers = textOutsideCode(html).match(/\]\(|```|\*\*\S|^\s*#{1,6} \S/gm);
    if (leftovers) fail(page, `raw Markdown leaked into the page: ${[...new Set(leftovers)].join(', ')}`);

    for (const match of html.matchAll(/\s(href|src|data-gif|data-poster)="([^"]*)"/g)) {
      const value = match[2].replaceAll('&amp;', '&');
      if (EXTERNAL.test(value)) continue;
      links += 1;
      const cut = value.indexOf('#');
      const path = cut < 0 ? value : value.slice(0, cut);
      const hash = cut < 0 ? '' : decodeURIComponent(value.slice(cut + 1));
      const target = path ? resolve(dirname(page), decodeURIComponent(path)) : page;
      if (!existsSync(target)) {
        fail(page, `broken ${match[1]} "${value}"`);
        continue;
      }
      // The studio routes with its own hash fragments, so only site pages get anchor checks.
      if (hash && target !== PAGES.studio && pageIds.has(target)) {
        anchors += 1;
        if (!pageIds.get(target).has(hash)) fail(page, `missing anchor "#${hash}" in ${relative(SITE, target)}`);
      }
    }
  }
  return { pages: files.size, links, anchors };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pages, links, anchors } = check();
  if (errors.length) {
    for (const error of errors) console.error(`x ${error}`);
    console.error(`\nSite check failed: ${errors.length} problem(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Site check passed: ${pages} pages up to date, ${links} links and assets resolve, ${anchors} anchors found.`);
  }
}
