import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pinned upstream skill folders from several public repositories. Copied as-is into a learner's .github folder.
export const VENDOR = fileURLToPath(new URL('../vendor/skill-pack/', import.meta.url));
export const MANIFEST = 'skills-manifest.json';
const pinned = JSON.parse(readFileSync(join(VENDOR, MANIFEST), 'utf8'));
export const skillSources = pinned.sources;
export const publicSkillNames = skillSources.flatMap((source) => Object.keys(source.skills));
export const skillFileCount = Object.keys(pinned.files).length;

function files(directory, prefix = '') {
  if (lstatSync(directory).isSymbolicLink()) throw new Error(`Refusing linked skills: ${directory}`);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Refusing linked skill file: ${path}`);
    return entry.isDirectory() ? files(path, `${name}/`) : [name];
  });
}

export function verifyPublicSkills(directory = VENDOR) {
  const actual = files(directory).filter((name) => name !== MANIFEST).sort();
  const manifest = JSON.parse(readFileSync(join(directory, MANIFEST), 'utf8'));
  if (JSON.stringify(manifest) !== JSON.stringify(pinned)
    || JSON.stringify(actual) !== JSON.stringify(Object.keys(pinned.files).sort())) {
    throw new Error('Public skill inventory differs from the pinned upstream snapshots.');
  }
  for (const name of actual) {
    const bytes = readFileSync(join(directory, ...name.split('/')));
    if (createHash('sha256').update(bytes).digest('hex') !== pinned.files[name]) {
      throw new Error(`Public skill checksum mismatch: ${name}. Restore the original download.`);
    }
  }
  for (const name of publicSkillNames) {
    const text = readFileSync(join(directory, 'skills', name, 'SKILL.md'), 'utf8');
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatter || !frontmatter[1].startsWith(`name: ${name}\n`) || !/^description: /m.test(frontmatter[1])) {
      throw new Error(`Missing skill name or description: ${name}`);
    }
  }
  return actual.length;
}

export function installPublicSkills(destination) {
  verifyPublicSkills();
  const target = join(destination, '.github');
  if (existsSync(target)) throw new Error(`Refusing existing customizations: ${target}`);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(VENDOR, target, { recursive: true, force: false, errorOnExist: true });
  verifyPublicSkills(target);
}
