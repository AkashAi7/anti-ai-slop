import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const VENDOR = fileURLToPath(new URL('../vendor/superpowers/', import.meta.url));
export const publicSkillNames = ['systematic-debugging', 'test-driven-development', 'verification-before-completion'];
export const upstreamCommit = '2ce8aa15d05bd57213e6f746f953aafb7ded7a8b';

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
  const actual = files(directory).filter((name) => name !== 'manifest.json').sort();
  const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
  const expected = JSON.parse(readFileSync(join(VENDOR, 'manifest.json'), 'utf8'));
  if (manifest.commit !== upstreamCommit || manifest.repository !== 'https://github.com/obra/superpowers'
    || JSON.stringify(manifest) !== JSON.stringify(expected)
    || JSON.stringify(actual) !== JSON.stringify(Object.keys(expected.files).sort())) {
    throw new Error('Public skill inventory differs from the pinned upstream snapshot.');
  }
  for (const name of actual) {
    const bytes = readFileSync(join(directory, ...name.split('/')));
    if (createHash('sha256').update(bytes).digest('hex') !== expected.files[name]) {
      throw new Error(`Public skill checksum mismatch: ${name}. Restore the original download.`);
    }
  }
  for (const name of publicSkillNames) {
    const text = readFileSync(join(directory, 'skills', name, 'SKILL.md'), 'utf8');
    if (!text.startsWith(`---\nname: ${name}\ndescription: `) || !text.includes('\n---\n')) {
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
