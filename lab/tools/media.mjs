import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from '../scripts/lab.mjs';

// Lab 1 covers built-in commands and Spec Kit; Lab 2 covers skills. Tracks map onto those two labs.
export const LABS = {
  'lab-1': {
    title: 'Lab 1: /commands + Spec Kit',
    label: 'LAB 1 / COMMANDS + SPEC KIT',
    guide: 'LAB-1-COMMANDS-SPECKIT.md',
    tracks: ['builtins', 'spec-kit', 'spec-kit-skills'],
  },
  'lab-2': {
    title: 'Lab 2: anti-slop skills',
    label: 'LAB 2 / ANTI-SLOP SKILLS',
    guide: 'LAB-2-ANTI-SLOP-SKILLS.md',
    tracks: ['skills'],
  },
};

export function labFor(scene) {
  const id = Object.keys(LABS).find((key) => LABS[key].tracks.includes(scene.track));
  if (!id) throw new Error(`${scene.id}: track ${scene.track} belongs to no lab`);
  return id;
}

export function sourceFingerprint() {
  const files = [
    'package.json', 'catalog.json', 'walkthroughs.json', 'scripts/lab.mjs', 'scripts/acceptance.mjs', 'scripts/public-skills.mjs',
  ].map((name) => join(ROOT, name));
  const collect = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  collect(join(ROOT, 'fixtures'));
  collect(join(ROOT, 'vendor'));
  const scripts = dirname(fileURLToPath(import.meta.url));
  files.push(join(scripts, 'record-gifs.mjs'), join(scripts, 'gif-encoder.mjs'), join(scripts, 'media.mjs'));
  const relativePath = (path) => relative(ROOT, path).split(sep).join('/');
  const hash = createHash('sha256');
  for (const path of files.sort((left, right) => {
    const a = relativePath(left);
    const b = relativePath(right);
    return a < b ? -1 : a > b ? 1 : 0;
  })) {
    const name = relativePath(path);
    const source = readFileSync(path);
    const content = name.startsWith('vendor/skill-pack/')
      ? source
      : Buffer.from(source.toString('utf8').replace(/\r\n?/g, '\n'));
    hash.update(name).update('\0').update(content).update('\0');
  }
  return hash.digest('hex');
}
