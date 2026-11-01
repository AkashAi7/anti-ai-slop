import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { root, exercise, safePath } from './lab.mjs';

const item = exercise(process.env.LAB_EXERCISE);
const target = process.env.LAB_TARGET;
if (!['starter', 'solution', 'work'].includes(target)) throw new Error('Invalid LAB_TARGET.');
const directory = target === 'work' ? safePath(root, 'work', item.id) : safePath(root, 'exercises', item.id, target);
const originalDir = safePath(root, 'exercises', item.id, 'starter');
const { checks } = await import(pathToFileURL(join(root, 'exercises', item.id, 'checks.mjs')));
const context = {
  id: item.id,
  directory,
  originalDir,
  path: (name) => safePath(directory, name),
  exists: (name) => existsSync(safePath(directory, name)),
  text: (name) => readFileSync(safePath(directory, name), 'utf8'),
  json: (name) => JSON.parse(readFileSync(safePath(directory, name), 'utf8')),
  module: (name) => import(pathToFileURL(safePath(directory, name)).href),
  original: (name) => readFileSync(safePath(originalDir, name)),
  rootExists: (relativePath) => existsSync(safePath(root, relativePath)),
};
if (checks.length !== item.testCount) throw new Error('Check count does not match the catalog.');
for (const [name, run] of checks) test(name, () => run(context));
