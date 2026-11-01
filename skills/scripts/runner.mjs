import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { root, exercise, safePath } from './lab.mjs';

const item = exercise(process.env.LAB_EXERCISE);
const target = process.env.LAB_TARGET;
if (!['starter', 'solution', 'work'].includes(target)) throw new Error('Invalid LAB_TARGET.');
const directory = target === 'work' ? safePath(root, 'work', item.id) : safePath(root, 'exercises', item.id, target);
const { checks } = await import(pathToFileURL(join(root, 'exercises', item.id, 'checks.mjs')));
const context = {
  directory,
  json: (name) => JSON.parse(readFileSync(safePath(directory, name), 'utf8')),
  module: (name = 'incident.mjs') => import(pathToFileURL(safePath(directory, name))),
};
if (checks.length !== item.testCount) throw new Error('Check count does not match the catalog.');
for (const [name, run] of checks) test(name, () => run(context));
