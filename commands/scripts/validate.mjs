#!/usr/bin/env node
// Static validation for the Commands lab: prompt files, registry, exercises, studio data, docs, and links.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';
import { catalog, root } from './lab.mjs';
import { DATA_FILE, renderDataFile } from './build-studio-data.mjs';
import { COMMANDS_DOC, applyBlock } from './build-docs.mjs';

const registry = JSON.parse(readFileSync(join(root, 'commands.json'), 'utf8'));
const mechanisms = registry.mechanisms.map(({ id }) => id);
const accessClasses = registry.accessClasses;
const customNames = registry.custom.map(({ name }) => name);
const builtInNames = registry.builtIns.flatMap(({ name, aliases }) => [name, ...(aliases || [])]);
const allNames = [...customNames, ...builtInNames];
const skillNames = [
  'grill-me', 'scope-contract', 'evidence-first', 'dependency-reality-check',
  'test-driven-development', 'systematic-debugging', 'simplify-first', 'repo-conventions',
  'failure-paths', 'review-feedback', 'verification-before-completion', 'concise-handoff',
];

// ---------- Registry ----------
assert.match(registry.asOf, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(new Set(mechanisms).size, mechanisms.length);
assert.equal(new Set(allNames.map((name) => name.toLowerCase())).size, allNames.length, 'Command names and aliases must be unique.');
for (const entry of registry.builtIns) {
  assert.match(entry.name, /^[A-Za-z][\w-]*$/);
  assert.ok(mechanisms.includes(entry.mechanism), `/${entry.name}: unknown mechanism`);
  for (const key of ['purpose', 'antiSlop', 'usage', 'availability']) assert.ok(String(entry[key] || '').trim(), `/${entry.name}: missing ${key}`);
  assert.ok(entry.usage.startsWith(`/${entry.name}`) || (entry.aliases || []).some((alias) => entry.usage.startsWith(`/${alias}`)), `/${entry.name}: usage must start with the command`);
  assert.match(entry.doc, /^https:\/\/code\.visualstudio\.com\/docs\//);
}
assert.equal(registry.custom.length, 12);
for (const entry of registry.custom) {
  assert.match(entry.name, /^[a-z]+(?:-[a-z]+)*$/);
  assert.ok(mechanisms.includes(entry.mechanism), `/${entry.name}: unknown mechanism`);
  assert.ok(accessClasses[entry.access], `/${entry.name}: unknown access class`);
  assert.equal(entry.file, `.github/prompts/${entry.name}.prompt.md`);
  assert.ok(entry.slop.trim() && entry.evidence.trim());
  assert.ok(!skillNames.includes(entry.name), `/${entry.name} collides with a skill in ../skills`);
}
for (const mechanism of mechanisms) {
  assert.ok(registry.custom.some((entry) => entry.mechanism === mechanism) || registry.builtIns.some((entry) => entry.mechanism === mechanism));
}
// Lab commands must never read as Copilot built-ins or Spec Kit commands.
const lab = registry.labCommands;
assert.ok(lab && typeof lab === 'object', 'commands.json needs a labCommands note');
assert.equal(lab.headline, 'Lab commands are not built in.');
for (const key of ['summary', 'where', 'notSpecKit']) assert.ok(String(lab[key] || '').trim(), `labCommands.${key} is required`);
assert.match(lab.summary, /\.github\/prompts/);
assert.match(lab.where, /Local/);
assert.ok(lab.notSpecKit.includes('Spec Kit installs'), 'labCommands.notSpecKit must say what Spec Kit installs');
assert.equal(lab.promptFilesDoc, 'https://code.visualstudio.com/docs/agent-customization/prompt-files');
assert.equal(lab.specKitDoc, 'https://github.com/github/spec-kit');
assert.ok(Array.isArray(lab.troubleshoot) && lab.troubleshoot.length >= 3 && lab.troubleshoot.every((step) => step.trim()));
for (const name of customNames) assert.ok(!/^speckit/i.test(name), `/${name} must not look like a Spec Kit command`);

// ---------- Prompt files ----------
const promptDir = join(root, '.github', 'prompts');
const promptFiles = readdirSync(promptDir).filter((name) => name.endsWith('.prompt.md'));
assert.deepEqual(promptFiles.map((name) => name.replace(/\.prompt\.md$/, '')).sort(), [...customNames].sort());
for (const entry of registry.custom) {
  const text = readFileSync(join(root, entry.file), 'utf8').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/);
  assert.ok(match, `${entry.file}: missing frontmatter`);
  const meta = parse(match[1], { uniqueKeys: true });
  const body = match[2];
  assert.equal(meta.name, entry.name, `${entry.file}: name must match the file name`);
  assert.ok(typeof meta.description === 'string' && meta.description.length >= 40 && meta.description.length <= 300, `${entry.file}: description length`);
  assert.ok(typeof meta['argument-hint'] === 'string' && meta['argument-hint'].trim(), `${entry.file}: argument-hint`);
  assert.equal(meta.agent, 'agent', `${entry.file}: agent must be "agent"`);
  assert.ok(Array.isArray(meta.tools) && meta.tools.length > 0, `${entry.file}: tools list`);
  const allowed = accessClasses[entry.access].allowed;
  for (const tool of meta.tools) {
    assert.ok(allowed.some((prefix) => (prefix.endsWith('/') ? tool.startsWith(prefix) : tool === prefix)),
      `${entry.file}: tool ${tool} is outside the ${entry.access} access class`);
  }
  for (const heading of ['## Goal', '## Steps', '## Output format', '## Stop conditions']) {
    assert.ok(body.includes(`\n${heading}\n`), `${entry.file}: missing ${heading}`);
  }
  assert.ok(body.startsWith(`# /${entry.name} `), `${entry.file}: title must start with # /${entry.name}`);
  assert.ok(text.split('\n').length <= 80, `${entry.file}: keep prompt files short`);
}

// ---------- Settings ----------
const settings = JSON.parse(readFileSync(join(root, '.vscode', 'settings.json'), 'utf8'));
for (const name of Object.keys(settings['chat.promptFilesRecommendations'] || {})) {
  assert.ok(customNames.includes(name), `.vscode/settings.json recommends unknown prompt ${name}`);
}

// ---------- Exercises ----------
assert.equal(catalog.length, 8);
assert.equal(new Set(catalog.map(({ id }) => id)).size, 8);
assert.equal(catalog.filter(({ track }) => track === 'beginner').length, 4);
assert.equal(catalog.filter(({ track }) => track === 'advanced').length, 4);
for (const item of catalog) {
  assert.ok(mechanisms.includes(item.mechanism), `${item.id}: unknown mechanism`);
  for (const name of item.commands) assert.ok(allNames.includes(name), `${item.id}: unknown command /${name}`);
  assert.ok(item.commands.some((name) => item.prompt.startsWith(`/${name} `)), `${item.id}: prompt must start with one of its commands`);
  assert.ok(item.expectedFailures.length > 0 && item.expectedFailures.length < item.testCount);
  for (const file of ['TASK.md', 'HINTS.md', 'checks.mjs', 'starter', 'solution']) {
    assert.ok(existsSync(join(root, 'exercises', item.id, file)), `${item.id}: missing ${file}`);
  }
  const checks = readFileSync(join(root, 'exercises', item.id, 'checks.mjs'), 'utf8');
  for (const name of item.expectedFailures) assert.ok(checks.includes(name), `${item.id}: expected failure "${name}" is not a check name`);
}
const practiced = new Set(catalog.flatMap(({ commands }) => commands));
for (const name of customNames) assert.ok(practiced.has(name), `/${name} is not practiced by any exercise`);

// ---------- Studio data ----------
const { scenes } = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
assert.equal(scenes.length, 5);
assert.equal(new Set(scenes.map(({ id }) => id)).size, 5);
for (const scene of scenes) {
  const item = catalog.find(({ id }) => id === scene.exercise);
  assert.ok(item, `${scene.id}: unknown exercise`);
  assert.ok(mechanisms.includes(scene.mechanism));
  assert.ok(scene.title.trim() && scene.takeaway.trim());
  assert.ok(scene.commands.every((name) => allNames.includes(name)), `${scene.id}: unknown command`);
  assert.equal(scene.steps.length, 5);
  for (const step of scene.steps) {
    for (const key of ['phase', 'heading', 'prompt', 'response', 'code', 'terminal', 'file']) {
      assert.ok(typeof step[key] === 'string' && step[key].trim(), `${scene.id}: step missing ${key}`);
    }
    assert.ok(['slop', 'command', 'evidence'].includes(step.tone), `${scene.id}: bad tone`);
    const command = step.prompt.match(/^\/([A-Za-z][\w-]*)/);
    if (command) assert.ok(allNames.includes(command[1]), `${scene.id}: unknown command /${command[1]}`);
    assert.ok(step.code.split('\n').length <= 16, `${scene.id}: code too long for the stage`);
    assert.ok(step.response.split('\n').length <= 12, `${scene.id}: response too long for the stage`);
    assert.ok(step.terminal.split('\n').length <= 4, `${scene.id}: terminal too long for the stage`);
  }
  assert.equal(scene.steps[0].tone, 'slop');
  assert.equal(scene.steps.at(-1).tone, 'evidence');
  assert.ok(scene.steps.at(-1).terminal.includes(`# pass ${item.testCount}`), `${scene.id}: final terminal must show # pass ${item.testCount}`);
  assert.ok(scene.steps.some((step) => scene.commands.some((name) => step.prompt.startsWith(`/${name}`))), `${scene.id}: no step runs a scene command`);
}
const missions = JSON.parse(readFileSync(join(root, 'studio', 'missions.json'), 'utf8'));
assert.ok(missions.length >= 12);
assert.equal(new Set(missions.map(({ id }) => id)).size, missions.length);
for (const mission of missions) {
  assert.equal(mission.choices.length, 4);
  assert.equal(new Set(mission.choices).size, 4);
  assert.ok(mission.choices.includes(mission.answer), `${mission.id}: answer not in choices`);
  for (const name of mission.choices) assert.ok(allNames.includes(name), `${mission.id}: unknown command /${name}`);
  assert.ok(mission.smell.trim() && mission.why.includes(`/${mission.answer}`), `${mission.id}: why must name the answer`);
}
const samples = JSON.parse(readFileSync(join(root, 'demo', 'samples.json'), 'utf8'));
delete samples.$comment;
assert.deepEqual(Object.keys(samples).sort(), [...customNames].sort());
for (const [name, sample] of Object.entries(samples)) {
  assert.ok(typeof sample.args === 'string' && typeof sample.text === 'string' && sample.text.trim(), `sample ${name}`);
}
const dataFile = readFileSync(DATA_FILE, 'utf8').replace(/\r\n/g, '\n');
assert.equal(dataFile, renderDataFile(), 'studio/assets/data.js is stale. Run npm run build:studio.');

// ---------- Studio safety ----------
const studioFiles = ['index.html', 'assets/core.js', 'assets/studio.js', 'assets/styles.css'].map((rel) => [rel, readFileSync(join(root, 'studio', rel), 'utf8')]);
for (const [rel, text] of studioFiles) {
  assert.ok(!/(?:src|href)\s*=\s*["']https?:|@import|url\(\s*["']?https?:|fetch\(|XMLHttpRequest|import\(/.test(text), `studio/${rel} must not load remote content`);
  assert.ok(!/\.innerHTML\s*=|eval\(|new Function/.test(text), `studio/${rel} must not inject HTML or eval`);
}
const html = studioFiles[0][1];
assert.ok(html.includes('Illustrative walkthrough - not recorded Copilot output'));
assert.ok(!/type=["']module["']/.test(html), 'Classic scripts only, so the studio works from file://');

// ---------- Sources ----------
const { sources } = JSON.parse(readFileSync(join(root, 'sources.json'), 'utf8'));
const documented = new Set(sources.flatMap(({ expect }) => expect));
for (const name of builtInNames) assert.ok(documented.has(`/${name}`), `/${name} is not covered by sources.json`);
for (const entry of registry.copilotApp.commands) assert.ok(documented.has(`/${entry.name}`), `Copilot app /${entry.name} not covered`);

// ---------- Docs ----------
const commandsDoc = readFileSync(COMMANDS_DOC, 'utf8').replace(/\r\n/g, '\n');
assert.equal(applyBlock(commandsDoc), commandsDoc, 'COMMANDS.md generated block is stale. Run npm run build:docs.');

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
  const text = readFileSync(path, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(https?:|mailto:)/.test(target)) continue;
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

// ---------- Lab command wording ----------
// /clarify and friends are this lab's prompt files. The docs must never present them as built-ins or Spec Kit commands.
const labReadme = readFileSync(join(root, 'README.md'), 'utf8');
assert.ok(commandsDoc.includes("## If a lab command doesn't appear"), 'COMMANDS.md needs the "If a lab command doesn\'t appear" section');
for (const [rel, text] of [['README.md', labReadme], ['COMMANDS.md', commandsDoc]]) {
  assert.match(text, /not built in/i, `${rel} must say lab commands are not built in`);
  assert.match(text, /Spec Kit/, `${rel} must distinguish lab commands from Spec Kit`);
  assert.match(text, /#if-a-lab-command-doesnt-appear/, `${rel} must link the troubleshooting section`);
}
for (const path of files(root).filter((file) => extname(file) === '.md')) {
  const text = readFileSync(path, 'utf8');
  assert.ok(!/(?:next to|alongside) the built-ins/i.test(text), `${relative(root, path)}: don't say lab commands sit "next to the built-ins"; say they are prompt files that are not built in`);
}

console.log(`Validated ${registry.builtIns.length} built-in and ${registry.custom.length} custom commands, ${promptFiles.length} prompt files, `
  + `${catalog.length} exercises, ${scenes.length} scenes, ${missions.length} missions, ${sources.length} doc sources, ${links} local links.`);
