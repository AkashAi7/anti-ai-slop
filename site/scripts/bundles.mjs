import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { zipSync } from 'fflate';
import { DOWNLOADS, LAB, PAGES_URL } from './lib/util.mjs';
import { publicSkillNames, verifyPublicSkills } from '../../lab/scripts/public-skills.mjs';

export const LAB_BUNDLE = DOWNLOADS.lab;
export const SKILLS_BUNDLE = DOWNLOADS.skills;
export const GIF_BUNDLE = DOWNLOADS.gifs;

// What a learner needs to run both labs. The GIF tooling (tools/) and media (assets/) stay out.
export const LAB_FILES = [
  'package.json', '.gitignore', 'catalog.json', 'README.md',
  'LAB-1-COMMANDS-SPECKIT.md', 'LAB-2-ANTI-SLOP-SKILLS.md',
  'FACILITATOR.md', 'VERIFICATION.md', 'THIRD-PARTY-NOTICES.md',
];
export const LAB_DIRS = ['scripts', 'tests', 'fixtures', 'vendor'];

const SKIP = new Set(['work', 'node_modules', '.git']);
const mtime = new Date(2026, 0, 1);
const text = (value) => [new TextEncoder().encode(value), { mtime }];
const file = (path) => {
  const bytes = readFileSync(path);
  const name = relative(LAB, path).split(sep).join('/');
  const content = name.startsWith('vendor/skill-pack/') || /\.(?:gif|png)$/i.test(name)
    ? bytes
    : Buffer.from(bytes.toString('utf8').replace(/\r\n?/g, '\n'));
  return [new Uint8Array(content), { mtime }];
};

function addTree(entries, directory, prefix, base = directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (SKIP.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Bundle refuses linked content: ${path}`);
    if (entry.isDirectory()) addTree(entries, path, prefix, base);
    else if (entry.isFile()) entries[`${prefix}/${relative(base, path).split(sep).join('/')}`] = file(path);
  }
}

const GIFS_README = (count) => `# Anti-slop lab walkthroughs

${count} looping GIFs, before and after posters, and transcripts for presenters:
Lab 1 (/commands + Spec Kit) and Lab 2 (anti-slop skills).

These are illustrative reenactments, not recordings of live Copilot or Spec Kit
output. The test summaries in them come from real fixture runs.

To do the exercises yourself, download anti-slop-lab.zip from ${PAGES_URL}
`;

const SKILLS_README = (names) => `# Public anti-slop skills (pinned copies)

Ten skill folders from five pinned public repositories, with their licenses
and a SHA-256 manifest:

${names.map((name) => `- \`${name}\``).join('\n')}

## Add them to your own project

1. Copy the \`.github\` folder from this ZIP into your repository root. If you
   already have a \`.github\` folder, merge it without overwriting existing
   files. The skills land in \`.github/skills/<name>/\`. Copy whole folders,
   not just \`SKILL.md\`.
2. Do not overwrite an existing skill with the same name.
3. Confirm your client loaded them:
   - VS Code: open the repository, start a Local chat, type \`/skills\`.
   - GitHub Copilot app: in an Interactive session, run \`/skills reload\`,
     then \`/skills\`.

Practice with them in Lab 2: ${PAGES_URL}site/lab-2.html

These are public skills, not Copilot built-ins. Read them before use.
`;

export function bundles() {
  verifyPublicSkills();
  const lab = {};
  for (const name of LAB_FILES) lab[`anti-slop-lab/${name}`] = file(join(LAB, name));
  for (const name of LAB_DIRS) addTree(lab, join(LAB, name), `anti-slop-lab/${name}`);

  const gifs = {};
  addTree(gifs, join(LAB, 'assets'), 'anti-slop-walkthroughs/assets');
  const count = Object.keys(gifs).filter((name) => name.endsWith('.gif')).length;
  gifs['anti-slop-walkthroughs/README.md'] = text(GIFS_README(count));

  const skills = {};
  addTree(skills, join(LAB, 'vendor', 'skill-pack'), 'anti-slop-public-skills/.github');
  skills['anti-slop-public-skills/README.md'] = text(SKILLS_README(publicSkillNames));
  skills['anti-slop-public-skills/THIRD-PARTY-NOTICES.md'] = file(join(LAB, 'THIRD-PARTY-NOTICES.md'));

  return new Map([
    [LAB_BUNDLE, Buffer.from(zipSync(lab, { level: 9 }))],
    [SKILLS_BUNDLE, Buffer.from(zipSync(skills, { level: 9 }))],
    [GIF_BUNDLE, Buffer.from(zipSync(gifs, { level: 9 }))],
  ]);
}

export function writeBundles() {
  let written = 0;
  for (const [path, bytes] of bundles()) {
    if (existsSync(path) && readFileSync(path).equals(bytes)) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes);
    written += 1;
  }
  return written;
}
