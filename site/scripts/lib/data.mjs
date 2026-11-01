import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { ROOT, SITE, LABS, frontmatter } from './util.mjs';

const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const json = (...parts) => JSON.parse(read(...parts));
const lab = (...parts) => join(ROOT, ...parts);

function assert(condition, message) {
  if (!condition) throw new Error(`Site data: ${message}`);
}

const baseline = (item) => ({ pass: item.testCount - item.expectedFailures.length, total: item.testCount });

function walkthrough(labId, scene, media, poster = `${scene.id}-before.png`) {
  const asset = media.assets.find((entry) => entry.id === scene.id);
  assert(asset, `${labId} media-manifest.json has no asset "${scene.id}"`);
  return {
    id: scene.id,
    title: scene.title,
    takeaway: scene.takeaway,
    exercise: scene.exercise,
    steps: scene.commands ?? scene.skills ?? [],
    gif: lab(labId, 'assets', 'gifs', `${scene.id}.gif`),
    poster: lab(labId, 'assets', 'posters', poster),
    before: lab(labId, 'assets', 'posters', `${scene.id}-before.png`),
    after: lab(labId, 'assets', 'posters', `${scene.id}-after.png`),
    transcript: lab(labId, 'assets', 'transcripts', `${scene.id}.md`),
    observed: asset.observed ?? null,
  };
}

export function loadCommandsLab() {
  const registry = json('commands', 'commands.json');
  const catalog = json('commands', 'exercises', 'catalog.json');
  const scenes = json('commands', 'demo', 'scenarios.json').scenes;
  const media = json('commands', 'assets', 'media-manifest.json');
  const missions = json('commands', 'studio', 'missions.json');

  const custom = registry.custom.map((command) => ({
    ...command,
    kind: 'custom',
    description: frontmatter(read('commands', command.file)).data.description,
    path: lab('commands', command.file),
  }));
  const builtIns = registry.builtIns.map((command) => ({ ...command, kind: 'built-in' }));
  const mechanisms = registry.mechanisms.map((mechanism) => ({
    ...mechanism,
    commands: [
      ...custom.filter((command) => command.mechanism === mechanism.id),
      ...builtIns.filter((command) => command.mechanism === mechanism.id),
    ],
  }));
  const grouped = mechanisms.reduce((sum, mechanism) => sum + mechanism.commands.length, 0);
  assert(grouped === custom.length + builtIns.length, 'every command needs a known mechanism in commands.json');

  const tourScene = { id: 'studio-tour', title: 'Command Studio tour', takeaway: '' };
  return {
    id: 'commands',
    asOf: registry.asOf,
    surface: registry.surface,
    labCommands: registry.labCommands,
    accessClasses: registry.accessClasses,
    disclaimer: media.disclaimer,
    mechanisms,
    custom,
    builtIns,
    copilotApp: registry.copilotApp,
    missions: missions.length,
    walkthroughs: scenes.map((scene) => walkthrough('commands', scene, media)),
    tour: walkthrough('commands', tourScene, media, 'studio-tour.png'),
    gifCount: media.assets.length,
    exercises: catalog.map((item) => ({
      id: item.id,
      title: item.title,
      track: item.track,
      steps: item.commands,
      baseline: baseline(item),
      task: lab('commands', 'exercises', item.id, 'TASK.md'),
    })),
    studio: lab('commands', 'studio', 'index.html'),
  };
}

function skillMechanisms(readme) {
  const section = readme.split(/^## The \d+ mechanisms\s*$/m)[1]?.split(/^## /m)[0];
  assert(section, 'skills/README.md needs a "## The 12 mechanisms" table');
  return section.split(/\r?\n/).filter((line) => line.startsWith('|')).slice(2).map((line) => {
    const [before, skill, after] = line.split('|').slice(1, -1).map((cell) => cell.trim());
    const name = /`\/([\w-]+)`/.exec(skill)?.[1];
    assert(name, `cannot read the skill name in "${line}"`);
    return { name, before, after };
  });
}

export function loadSkillsLab() {
  const catalog = json('skills', 'exercises', 'catalog.json');
  const scenes = json('skills', 'demo', 'scenarios.json');
  const media = json('skills', 'assets', 'media-manifest.json');
  const folders = readdirSync(lab('skills', '.github', 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const skills = skillMechanisms(read('skills', 'README.md')).map((row) => {
    const path = lab('skills', '.github', 'skills', row.name, 'SKILL.md');
    assert(existsSync(path), `README lists /${row.name}, but ${relative(ROOT, path)} is missing`);
    const { data } = frontmatter(readFileSync(path, 'utf8'));
    return { ...row, path, description: data.description, explicitOnly: data['disable-model-invocation'] === 'true' };
  });
  assert(skills.length === folders.length, `README lists ${skills.length} skills but .github/skills has ${folders.length}`);

  return {
    id: 'skills',
    disclaimer: media.disclaimer,
    skills,
    walkthroughs: scenes.map((scene) => walkthrough('skills', scene, media)),
    gifCount: media.assets.length,
    exercises: catalog.map((item) => ({
      id: item.id,
      title: item.title,
      track: item.track,
      steps: item.skills,
      baseline: baseline(item),
      task: lab('skills', 'exercises', item.id, 'TASK.md'),
    })),
  };
}

const SKIP_DIRS = new Set(['node_modules', 'work', '.capture']);

function walk(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      // Reference solutions and starters stay opt-in in the labs, so the site does not publish them.
      if (/[\\/]exercises[\\/][^\\/]+$/.test(dir) && /^(starter|solution)$/.test(entry.name)) continue;
      walk(path, found);
    } else if (entry.name.endsWith('.md')) {
      found.push(path);
    }
  }
  return found;
}

export const docSources = () => LABS.flatMap((id) => walk(join(ROOT, id))).sort();

// commands/.github/prompts/verify.prompt.md -> site/docs/commands/github/prompts/verify.prompt.html
// Dot folders are renamed because static hosts commonly skip them.
export function docOutput(source) {
  const parts = relative(ROOT, source).split(sep).map((part) => part.replace(/^\./, ''));
  parts[parts.length - 1] = parts.at(-1).replace(/\.md$/, '.html');
  return join(SITE, 'docs', ...parts);
}

export const dirIndexOutput = (dir) => join(docOutput(join(dir, 'x.md')), '..', 'index.html');
