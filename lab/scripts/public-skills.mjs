import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pinned upstream skill folders from several public repositories. Copied as-is into a learner's .github folder.
export const VENDOR = fileURLToPath(new URL('../vendor/skill-pack/', import.meta.url));
export const ENGINEERING = fileURLToPath(new URL('../engineering-skills/', import.meta.url));
export const MANIFEST = 'skills-manifest.json';
export const ENGINEERING_MANIFEST = 'engineering-skills-manifest.json';
const pinned = JSON.parse(readFileSync(join(VENDOR, MANIFEST), 'utf8'));
const authored = JSON.parse(readFileSync(join(ENGINEERING, MANIFEST), 'utf8'));
export const skillSources = pinned.sources;
export const publicSkillNames = skillSources.flatMap((source) => Object.keys(source.skills));
export const skillFileCount = Object.keys(pinned.files).length;
export const engineeringSkillNames = authored.skills;
export const engineeringSkillFileCount = Object.keys(authored.files).length;
export const allSkillNames = [...publicSkillNames, ...engineeringSkillNames];

function files(directory, prefix = '') {
  if (lstatSync(directory).isSymbolicLink()) throw new Error(`Refusing linked skills: ${directory}`);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Refusing linked skill file: ${path}`);
    return entry.isDirectory() ? files(path, `${name}/`) : [name];
  });
}

function verifyPinnedSkills(directory, additionalFiles = []) {
  const actual = files(directory).filter((name) => name !== MANIFEST).sort();
  const manifest = JSON.parse(readFileSync(join(directory, MANIFEST), 'utf8'));
  const expected = Object.keys(pinned.files).sort();
  const allowed = new Set([...expected, ...additionalFiles]);
  if (JSON.stringify(manifest) !== JSON.stringify(pinned)
    || expected.some((name) => !actual.includes(name))
    || actual.some((name) => !allowed.has(name))) {
    throw new Error('Public skill inventory differs from the pinned upstream snapshots.');
  }
  for (const name of expected) {
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
  return expected.length;
}

export function verifyPublicSkills(directory = VENDOR) {
  return verifyPinnedSkills(directory);
}

export function verifyEngineeringSkills(directory = ENGINEERING) {
  const actual = files(directory).filter((name) => name !== MANIFEST).sort();
  const expected = Object.keys(authored.files).sort();
  const manifest = JSON.parse(readFileSync(join(directory, MANIFEST), 'utf8'));
  if (JSON.stringify(manifest) !== JSON.stringify(authored)
    || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Engineering skill inventory differs from the lab-authored manifest.');
  }
  for (const name of expected) {
    const bytes = readFileSync(join(directory, ...name.split('/')));
    if (createHash('sha256').update(bytes).digest('hex') !== authored.files[name]) {
      throw new Error(`Engineering skill checksum mismatch: ${name}. Restore the lab-authored skill.`);
    }
  }
  for (const name of engineeringSkillNames) {
    const text = readFileSync(join(directory, name, 'SKILL.md'), 'utf8');
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatter || !frontmatter[1].startsWith(`name: ${name}\n`) || !/^description: /m.test(frontmatter[1])) {
      throw new Error(`Missing engineering skill name or description: ${name}`);
    }
  }
  return actual.length;
}

function verifyEngineeringSkillCopies(directory) {
  for (const name of engineeringSkillNames) {
    const skillDirectory = join(directory, 'skills', name);
    const actual = files(skillDirectory).sort();
    if (JSON.stringify(actual) !== JSON.stringify(['SKILL.md'])) {
      throw new Error(`Engineering skill inventory differs from the lab-authored manifest: ${name}`);
    }
    const bytes = readFileSync(join(skillDirectory, 'SKILL.md'));
    if (createHash('sha256').update(bytes).digest('hex') !== authored.files[`${name}/SKILL.md`]) {
      throw new Error(`Engineering skill checksum mismatch: ${name}/SKILL.md.`);
    }
    const text = bytes.toString('utf8');
    const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatter || !frontmatter[1].startsWith(`name: ${name}\n`) || !/^description: /m.test(frontmatter[1])) {
      throw new Error(`Missing engineering skill name or description: ${name}`);
    }
  }
  return engineeringSkillNames.length;
}

export function verifyInstalledSkills(directory) {
  const engineeringFiles = engineeringSkillNames.map((name) => `skills/${name}/SKILL.md`);
  const actual = files(directory).filter((name) => name !== MANIFEST).sort();
  const expected = [...Object.keys(pinned.files), ...engineeringFiles, ENGINEERING_MANIFEST].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Installed skill inventory differs from the public and engineering skill manifests.');
  }
  const engineeringManifest = JSON.parse(readFileSync(join(directory, ENGINEERING_MANIFEST), 'utf8'));
  if (JSON.stringify(engineeringManifest) !== JSON.stringify(authored)) {
    throw new Error('Installed engineering skill manifest differs from the lab-authored manifest.');
  }
  const publicFiles = verifyPinnedSkills(directory, [...engineeringFiles, ENGINEERING_MANIFEST]);
  const engineeringFilesVerified = verifyEngineeringSkillCopies(directory);
  return {
    skillCount: allSkillNames.length,
    publicSkillCount: publicSkillNames.length,
    engineeringSkillCount: engineeringSkillNames.length,
    fileCount: publicFiles + engineeringFilesVerified,
  };
}

export function installSkillPack(destination) {
  verifyPublicSkills();
  verifyEngineeringSkills();
  const target = join(destination, '.github');
  if (existsSync(target)) throw new Error(`Refusing existing customizations: ${target}`);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(VENDOR, target, { recursive: true, force: false, errorOnExist: true });
  for (const name of engineeringSkillNames) {
    cpSync(join(ENGINEERING, name), join(target, 'skills', name), {
      recursive: true, force: false, errorOnExist: true,
    });
  }
  cpSync(join(ENGINEERING, MANIFEST), join(target, ENGINEERING_MANIFEST), {
    force: false, errorOnExist: true,
  });
  verifyInstalledSkills(target);
}
