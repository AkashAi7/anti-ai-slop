import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve, sep } from 'node:path';
import { Marked } from 'marked';
import { esc, frontmatter, slug, urlFrom } from './util.mjs';
import { dirIndexOutput, docOutput } from './data.mjs';

const stripTags = (html) => html.replace(/<[^>]+>/g, '').trim();

function wrapTables(html) {
  const seen = new Map();
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (table, inner) => {
    const headers = [...inner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => stripTags(m[1])).filter(Boolean);
    let label = `Table: ${headers.join(', ') || 'details'}`;
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    if (count > 1) label += ` (${count})`;
    return `<div class="table-wrap" role="region" aria-label="${label}" tabindex="0">${table}</div>`;
  });
}

export function createDocRenderer(rendered) {
  const linkedDirs = new Set();
  const hasDocsUnder = (dir) => [...rendered].some((file) => file.startsWith(dir + sep));

  function resolveHref(href, source, output) {
    if (!href || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
    const cut = href.indexOf('#');
    const path = cut < 0 ? href : href.slice(0, cut);
    const hash = cut < 0 ? '' : href.slice(cut);
    const target = resolve(dirname(source), decodeURIComponent(path));
    let dest = target;
    if (rendered.has(target)) {
      dest = docOutput(target);
    } else if (existsSync(target) && statSync(target).isDirectory() && hasDocsUnder(target)) {
      linkedDirs.add(target);
      dest = dirIndexOutput(target);
    }
    const url = dest === output ? '' : urlFrom(output, dest);
    return url + hash || basename(output);
  }

  function render(source) {
    const { data, body } = frontmatter(readFileSync(source, 'utf8'));
    const output = docOutput(source);
    const toc = [];
    const ids = new Map();
    let title = null;

    const marked = new Marked({ gfm: true });
    marked.use({
      walkTokens(token) {
        if (token.type === 'link' || token.type === 'image') token.href = resolveHref(token.href, source, output);
      },
      renderer: {
        heading({ tokens, depth, text }) {
          let id = slug(text.trim());
          const n = ids.get(id) ?? 0;
          ids.set(id, n + 1);
          if (n) id = `${id}-${n}`;
          const content = this.parser.parseInline(tokens);
          if (depth === 1 && title === null) title = stripTags(content);
          if (depth === 2) toc.push({ id, label: stripTags(content) });
          return `<h${depth} id="${id}">${content}</h${depth}>\n`;
        },
        // Lab docs contain prose like `/fork <title>`; show it as text instead of injecting tags.
        html({ text }) {
          if (/^\s*<!--[\s\S]*-->\s*$/.test(text)) return '';
          if (/^\s*<br\s*\/?>\s*$/i.test(text)) return '<br>';
          return esc(text);
        },
        image({ href, text }) {
          return `<img src="${esc(href)}" alt="${esc(text)}" loading="lazy" decoding="async">`;
        },
      },
    });

    const html = wrapTables(marked.parse(body));
    return { source, output, html, toc, meta: data, title: title ?? esc(basename(source)) };
  }

  return { render, linkedDirs };
}
