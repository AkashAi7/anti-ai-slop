import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LAB, SITE } from './util.mjs';
import { LABS, labFor } from '../../../lab/tools/media.mjs';

const json = (...parts) => JSON.parse(readFileSync(join(LAB, ...parts), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(`Site data: ${message}`);
}

// Every lab document published on the site, and the page it becomes.
export const DOCS = {
  setup: { source: join(LAB, 'README.md'), output: join(SITE, 'setup.html') },
  'lab-1': { source: join(LAB, LABS['lab-1'].guide), output: join(SITE, 'lab-1.html') },
  'lab-2': { source: join(LAB, LABS['lab-2'].guide), output: join(SITE, 'lab-2.html') },
  facilitator: { source: join(LAB, 'FACILITATOR.md'), output: join(SITE, 'facilitator.html') },
  verification: { source: join(LAB, 'VERIFICATION.md'), output: join(SITE, 'verification.html') },
  notices: { source: join(LAB, 'THIRD-PARTY-NOTICES.md'), output: join(SITE, 'notices.html') },
};

export const TRANSCRIPTS = join(SITE, 'transcripts');
export const transcriptOutput = (id) => join(TRANSCRIPTS, `${id}.html`);

export function loadLab() {
  const catalog = json('catalog.json');
  const engineeringManifest = json('engineering-skills', 'skills-manifest.json');
  const scenes = json('walkthroughs.json');
  const media = json('assets', 'media-manifest.json');
  const catalogSkillNames = catalog.softwareDevelopmentSkills.map(({ command }) => command).sort();
  const manifestSkillNames = [...engineeringManifest.skills].sort();
  assert(JSON.stringify(catalogSkillNames) === JSON.stringify(manifestSkillNames),
    'catalog.json and engineering-skills/skills-manifest.json must list the same skills');
  assert(media.assets.length === scenes.length, 'media-manifest.json is out of step with walkthroughs.json; run npm run gifs in lab/tools');

  const walkthroughs = scenes.map((scene) => {
    const asset = media.assets.find(({ id }) => id === scene.id);
    assert(asset, `media-manifest.json has no asset "${scene.id}"`);
    const file = (dir, name) => join(LAB, 'assets', dir, name);
    return {
      id: scene.id,
      lab: labFor(scene),
      track: scene.track,
      title: scene.title,
      client: scene.client,
      takeaway: scene.takeaway,
      steps: scene.commands,
      gif: file('gifs', `${scene.id}.gif`),
      poster: file('posters', `${scene.id}-before.png`),
      before: file('posters', `${scene.id}-before.png`),
      after: file('posters', `${scene.id}-after.png`),
      transcript: file('transcripts', `${scene.id}.md`),
      observed: asset.displayedFinal === 'final'
        ? `Real reference acceptance: ${asset.final.passed}/${asset.final.total} pass, exit 0.`
        : `Real starter check: ${asset.baseline.passed}/${asset.baseline.total}. This flow stops before any code changes.`,
    };
  });

  return {
    asOf: catalog.asOf,
    sources: catalog.sources,
    recipes: catalog.recipes,
    publicSkills: catalog.publicSkills,
    softwareDevelopmentSkills: catalog.softwareDevelopmentSkills,
    tracks: catalog.tracks,
    specifyVersion: json('package.json').config.specifyVersion,
    skillPack: json('vendor', 'skill-pack', 'skills-manifest.json'),
    disclaimer: media.disclaimer,
    walkthroughs,
    labs: Object.entries(LABS).map(([id, lab]) => ({
      id, ...lab, doc: DOCS[id], walkthroughs: walkthroughs.filter((walk) => walk.lab === id),
    })),
  };
}
