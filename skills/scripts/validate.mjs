import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';
import { catalog, root, safePath } from './lab.mjs';

const expected = [
  'grill-me', 'scope-contract', 'evidence-first', 'dependency-reality-check',
  'test-driven-development', 'systematic-debugging', 'simplify-first', 'repo-conventions',
  'failure-paths', 'review-feedback', 'verification-before-completion', 'concise-handoff',
];
const adapted = ['grill-me', 'test-driven-development', 'systematic-debugging', 'verification-before-completion'];
const skills = join(root, '.github', 'skills');
const names = readdirSync(skills, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
assert.deepEqual(names.sort(), [...expected].sort());
for (const name of names) {
  const text = readFileSync(join(skills, name, 'SKILL.md'), 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  assert.ok(match, `${name}: missing frontmatter`);
  const metadata = parse(match[1], { uniqueKeys: true });
  assert.equal(metadata.name, name);
  assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(typeof metadata.description === 'string' && metadata.description.length >= 40 && metadata.description.length <= 1024);
  assert.match(metadata.description, /use when|use before|use for/i);
  assert.ok(match[2].length > 400 && text.split('\n').length < 500);
  if (name === 'grill-me') assert.equal(metadata['disable-model-invocation'], true);
  assert.ok(!text.includes('superpowers:'), `${name}: unsupported plugin prefix`);
  if (adapted.includes(name)) {
    const license = readFileSync(join(skills, name, 'LICENSE'), 'utf8');
    assert.match(license, /MIT License/);
    assert.match(license, /Permission is hereby granted/);
  }
}

assert.equal(catalog.length, 8);
assert.equal(new Set(catalog.map(({ id }) => id)).size, 8);
assert.equal(catalog.filter(({ track }) => track === 'beginner').length, 4);
assert.equal(catalog.filter(({ track }) => track === 'advanced').length, 4);
assert.deepEqual([...new Set(catalog.flatMap(({ skills: values }) => values))].sort(), [...expected].sort());
for (const item of catalog) {
  for (const name of item.skills) assert.ok(names.includes(name), `Unknown skill ${name}`);
  assert.ok(item.skills.some((name) => item.prompt.startsWith(`/${name} `)));
  assert.ok(item.expectedFailures.length > 0 && item.expectedFailures.length <= item.testCount);
  for (const file of ['TASK.md', 'HINTS.md', 'checks.mjs', 'starter', 'solution']) {
    assert.ok(existsSync(join(root, 'exercises', item.id, file)), `${item.id}: missing ${file}`);
  }
}

const { sources } = JSON.parse(readFileSync(join(root, 'sources.json'), 'utf8'));
for (const source of sources) {
  assert.match(source.repository, /^https:\/\/github\.com\/(mattpocock\/skills|obra\/superpowers)$/);
  assert.match(source.revision, /^[a-f0-9]{40}$/);
  assert.match(source.sha256, /^[a-f0-9]{64}$/);
  assert.equal(source.license, 'MIT');
  assert.ok(source.adaptation.length > 10);
  assert.ok(existsSync(safePath(root, source.destination)));
}
for (const name of adapted) assert.ok(sources.some((source) => source.destination === `.github/skills/${name}/SKILL.md`));

const scenes = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
assert.equal(scenes.length, 4);
assert.equal(new Set(scenes.map(({ id }) => id)).size, 4);
for (const scene of scenes) {
  assert.ok(catalog.some(({ id }) => id === scene.exercise));
  assert.ok(scene.skills.every((name) => names.includes(name)));
  assert.equal(scene.steps.length, 5);
  for (const step of scene.steps) {
    for (const key of ['phase', 'heading', 'prompt', 'response', 'code', 'terminal']) assert.ok(typeof step[key] === 'string' && step[key].trim());
  }
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'work', '.capture'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
const slug = (heading) => heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
let links = 0;
for (const path of files(root).filter((file) => extname(file) === '.md')) {
  const text = readFileSync(path, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^https?:/.test(target)) continue;
    const [file, anchor] = target.split('#');
    const destination = file ? resolve(dirname(path), decodeURIComponent(file)) : path;
    assert.ok(existsSync(destination), `${relative(root, path)}: broken link ${target}`);
    if (anchor && statSync(destination).isFile() && extname(destination) === '.md') {
      const headings = [...readFileSync(destination, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)].map((heading) => slug(heading[1].trim()));
      assert.ok(headings.includes(anchor), `${relative(root, path)}: missing anchor ${target}`);
    }
    links++;
  }
}
const stage = readFileSync(join(root, 'scripts', 'render', 'stage.html'), 'utf8');
assert.ok(stage.includes('Illustrative walkthrough - not recorded Copilot output'));
assert.ok(!/(?:src|href)\s*=\s*["']https?:|@import|fetch\(|XMLHttpRequest/.test(stage), 'Capture stage must not load remote content.');
console.log(`Validated ${names.length} skills, ${catalog.length} exercises, ${scenes.length} scenes, ${sources.length} source records, ${links} local links.`);
