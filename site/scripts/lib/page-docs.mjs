import { relative, sep } from 'node:path';
import { ROOT, esc, inline, urlFrom } from './util.mjs';
import { dirIndexOutput, docOutput } from './data.mjs';
import { PAGES, page } from './layout.mjs';

const LAB_PAGES = {
  commands: { page: PAGES.commands, name: 'Commands lab' },
  skills: { page: PAGES.skills, name: 'Skills lab' },
};

const parts = (path) => relative(ROOT, path).split(sep);

function crumbs(file, path) {
  const [labId, ...rest] = parts(path);
  const lab = LAB_PAGES[labId];
  const trail = [`<li><a href="${urlFrom(file, PAGES.home)}">Home</a></li>`];
  if (lab) trail.push(`<li><a href="${urlFrom(file, lab.page)}">${lab.name}</a></li>`);
  trail.push(`<li aria-current="page">${esc(lab ? rest.join('/') : 'About this site')}</li>`);
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.join('')}</ol></nav>`;
}

function metaList(doc) {
  const { meta, source } = doc;
  if (!meta.name) return '';
  const rows = [];
  const add = (term, value) => value && rows.push(`<div><dt>${term}</dt><dd>${value}</dd></div>`);
  if (source.endsWith('.prompt.md')) {
    add('Slash command', `<code>/${esc(meta.name)}</code>`);
    add('Description', inline(meta.description));
    add('Argument hint', meta['argument-hint'] && `<code>${esc(meta['argument-hint'])}</code>`);
    add('Agent', meta.agent && esc(meta.agent));
    add('Allowed tools', Array.isArray(meta.tools) && meta.tools.map((tool) => `<code>${esc(tool)}</code>`).join(' '));
  } else {
    add('Skill', `<code>/${esc(meta.name)}</code>`);
    add('Description', inline(meta.description));
    add('Invocation', meta['disable-model-invocation'] === 'true'
      ? 'Explicit only. Type the slash command. The agent does not load it on its own.'
      : 'Type the slash command, or let the agent load it when the description matches.');
  }
  return `<dl class="doc-meta">${rows.join('')}</dl>\n`;
}

function placeMeta(html, meta, title) {
  const at = html.indexOf('</h1>');
  if (at < 0) return `<h1>${title}</h1>\n${meta}${html}`;
  const end = at + '</h1>'.length;
  return `${html.slice(0, end)}\n${meta}${html.slice(end)}`;
}

export function docPage(doc) {
  const file = doc.output;
  const [labId] = parts(doc.source);
  const lab = LAB_PAGES[labId];
  const article = placeMeta(doc.html, metaList(doc), doc.title);
  const toc = doc.toc.length > 1
    ? `<nav class="toc" aria-label="On this page"><p class="toc-title">On this page</p><ol>${doc.toc.map((item) => `<li><a href="#${item.id}">${item.label}</a></li>`).join('')}</ol></nav>`
    : '';
  const sourcePath = parts(doc.source).join('/');
  const body = `<div class="wrap">${crumbs(file, doc.source)}</div>
<div class="wrap doc-layout${toc ? '' : ' no-toc'}">
${toc}
<article class="prose">
${article}
<p class="doc-source">Source: <a href="${urlFrom(file, doc.source)}"><code>${esc(sourcePath)}</code></a></p>
</article>
</div>`;
  return page({
    file,
    title: lab ? `${doc.title} - ${lab.name}` : doc.title,
    active: lab ? labId : null,
    description: doc.meta.description ?? `${lab ? lab.name : 'Anti-Slop Labs'}: ${sourcePath}`,
    body,
  });
}

export function dirIndexPage(dir, docs) {
  const file = dirIndexOutput(dir);
  const rel = parts(dir).join('/');
  const items = docs.map((doc) => {
    const name = parts(doc.source).slice(parts(dir).length).join('/');
    const about = doc.meta.description ? `<span>${inline(doc.meta.description)}</span>` : '';
    return `<li><a href="${urlFrom(file, doc.output)}">${doc.title}</a> <code>${esc(name)}</code>${about}</li>`;
  }).join('\n');
  const body = `<div class="wrap">${crumbs(file, dir)}</div>
<div class="wrap doc-layout no-toc">
<article class="prose">
<h1>${esc(rel)}</h1>
<p>${docs.length} files in this folder are published on this site.</p>
<ul class="guides">
${items}
</ul>
</article>
</div>`;
  return page({ file, title: esc(rel), active: LAB_PAGES[parts(dir)[0]] ? parts(dir)[0] : null, description: `Files in ${rel}`, body });
}
