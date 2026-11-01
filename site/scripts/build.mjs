import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './lib/util.mjs';
import { DOCS, TRANSCRIPTS, loadLab, transcriptOutput } from './lib/data.mjs';
import { createDocRenderer } from './lib/markdown.mjs';
import { PAGES } from './lib/layout.mjs';
import { docPage, homePage, labPage, transcriptPage } from './lib/pages.mjs';
import { writeBundles } from './bundles.mjs';

export function generate() {
  const lab = loadLab();
  const outputs = new Map(Object.values(DOCS).map(({ source, output }) => [source, output]));
  for (const walk of lab.walkthroughs) outputs.set(walk.transcript, transcriptOutput(walk.id));
  const { render } = createDocRenderer(outputs);

  const files = new Map([[PAGES.home, homePage(lab)]]);
  for (const item of lab.labs) {
    files.set(PAGES[item.id], labPage(lab, item, render(item.doc.source, { dropTitle: true, selfHash: '#watch' })));
  }
  for (const id of ['setup', 'facilitator', 'verification', 'notices']) {
    files.set(PAGES[id], docPage(id, render(DOCS[id].source, { dropTitle: true })));
  }
  for (const walk of lab.walkthroughs) {
    files.set(transcriptOutput(walk.id), transcriptPage(lab, walk, render(walk.transcript, { dropTitle: true })));
  }
  return files;
}

// Every HTML page the generator owns: site/*.html and site/transcripts/*.html.
export function listGenerated() {
  const found = [];
  for (const dir of [SITE, TRANSCRIPTS]) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.html')) found.push(join(dir, entry.name));
    }
  }
  return found;
}

function build() {
  const bundled = writeBundles();
  const files = generate();
  let written = 0;
  for (const [path, content] of files) {
    if (existsSync(path) && readFileSync(path, 'utf8') === content) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    written += 1;
  }
  const stale = listGenerated().filter((path) => !files.has(path));
  for (const path of stale) {
    rmSync(path);
    console.log(`Removed stale page ${relative(SITE, path)}`);
  }
  console.log(`Site build: ${files.size} pages, ${written} written, ${stale.length} stale removed, ${bundled} downloads updated.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
