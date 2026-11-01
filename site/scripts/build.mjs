import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './lib/util.mjs';
import { dirIndexOutput, docSources, loadCommandsLab, loadSkillsLab } from './lib/data.mjs';
import { createDocRenderer } from './lib/markdown.mjs';
import { PAGES } from './lib/layout.mjs';
import { homePage } from './lib/page-home.mjs';
import { commandsPage } from './lib/page-commands.mjs';
import { skillsPage } from './lib/page-skills.mjs';
import { dirIndexPage, docPage } from './lib/page-docs.mjs';

export const DOCS = join(SITE, 'docs');

export function generate() {
  const sources = [...docSources(), join(SITE, 'README.md')];
  const renderer = createDocRenderer(new Set(sources));
  const docs = sources.map((source) => renderer.render(source));
  const commands = loadCommandsLab();
  const skills = loadSkillsLab();

  const files = new Map([
    [PAGES.home, homePage({ commands, skills })],
    [PAGES.commands, commandsPage(commands)],
    [PAGES.skills, skillsPage(skills)],
  ]);
  for (const doc of docs) files.set(doc.output, docPage(doc));
  for (const dir of [...renderer.linkedDirs].sort()) {
    const output = dirIndexOutput(dir);
    if (files.has(output)) throw new Error(`Site build: ${relative(SITE, output)} would overwrite a rendered doc`);
    files.set(output, dirIndexPage(dir, docs.filter((doc) => doc.source.startsWith(dir + sep))));
  }
  return files;
}

export function listHtml(dir, found = []) {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) listHtml(path, found);
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

function pruneEmpty(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmpty(join(dir, entry.name));
  }
  if (dir !== DOCS && readdirSync(dir).length === 0) rmdirSync(dir);
}

function build() {
  const files = generate();
  let written = 0;
  for (const [path, content] of files) {
    if (existsSync(path) && readFileSync(path, 'utf8') === content) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    written += 1;
  }
  const stale = listHtml(DOCS).filter((path) => !files.has(path));
  for (const path of stale) rmSync(path);
  pruneEmpty(DOCS);
  console.log(`Site build: ${files.size} pages, ${written} written, ${stale.length} stale removed.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
