import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { Marked } from 'marked';
import { PAGES_URL, ROOT, SITE, esc, relativeToRoot, repoUrl, slug, urlFrom } from './util.mjs';

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

// `outputs` maps each rendered Markdown source to the page it becomes.
export function createDocRenderer(outputs) {
  function resolveHref(href, source, output, selfHash) {
    if (!href || href.startsWith('#')) return href;
    const cut = href.indexOf('#');
    const path = cut < 0 ? href : href.slice(0, cut);
    const hash = cut < 0 ? '' : href.slice(cut);
    let dest;
    if (path.startsWith(PAGES_URL)) {
      // The guides link to the published site; on the site itself those become relative links.
      const rest = path.slice(PAGES_URL.length);
      dest = rest ? join(ROOT, ...rest.split('/')) : join(SITE, 'index.html');
    } else if (path.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(path)) {
      return href;
    } else {
      const target = resolve(dirname(source), decodeURIComponent(path));
      if (outputs.has(target)) dest = outputs.get(target);
      else if (existsSync(target)) return repoUrl(target, statSync(target).isDirectory() ? 'tree' : 'blob') + hash;
      else throw new Error(`${relativeToRoot(source)}: broken link "${href}"`);
    }
    if (dest === output) return hash || selfHash || '#main';
    return urlFrom(output, dest) + hash;
  }

  // Renders one Markdown source. With `dropTitle`, the first h1 is returned as `title` instead of rendered,
  // so the page header can own the page's only h1.
  function render(source, { dropTitle = false, selfHash } = {}) {
    const output = outputs.get(source);
    if (!output) throw new Error(`${relativeToRoot(source)} has no output page`);
    const toc = [];
    const ids = new Map();
    let title = null;

    const marked = new Marked({ gfm: true });
    marked.use({
      walkTokens(token) {
        if (token.type === 'link' || token.type === 'image') token.href = resolveHref(token.href, source, output, selfHash);
      },
      renderer: {
        heading({ tokens, depth, text }) {
          const content = this.parser.parseInline(tokens);
          if (depth === 1 && title === null) {
            title = stripTags(content);
            if (dropTitle) return '';
          }
          let id = slug(text.trim());
          const n = ids.get(id) ?? 0;
          ids.set(id, n + 1);
          if (n) id = `${id}-${n}`;
          if (depth === 2) toc.push({ id, label: stripTags(content) });
          return `<h${depth} id="${id}">${content}</h${depth}>\n`;
        },
        // The guides contain prose such as `<track>` placeholders; show raw HTML as text instead of injecting tags.
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

    const html = wrapTables(marked.parse(readFileSync(source, 'utf8')));
    if (title === null) throw new Error(`${relativeToRoot(source)} has no h1 title`);
    return { source, output, html, toc, title };
  }

  return { render };
}
