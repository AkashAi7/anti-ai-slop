import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { ROOT, catalog, fixtureChecks, runNodeTests, seed, track, verifyBaseline } from '../scripts/lab.mjs';
import { encodeGif } from './gif-encoder.mjs';
import { LABS, labFor, sourceFingerprint } from './media.mjs';

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const width = 1280;
const height = 720;
const maxBytes = 8 * 1024 * 1024;
const disclaimer = 'Illustrative reenactment - not a recorded Copilot session. Test results are real fixture runs.';
const allScenes = JSON.parse(readFileSync(join(ROOT, 'walkthroughs.json'), 'utf8'));
const requestedIds = process.argv.slice(2);
const requestedSet = new Set(requestedIds);
const scenes = requestedIds.length ? allScenes.filter(({ id }) => requestedSet.has(id)) : allScenes;
if (scenes.length !== requestedIds.length) throw new Error('Walkthrough ids must be unique and present in walkthroughs.json.');
const assets = join(ROOT, 'assets');
for (const dir of ['gifs', 'posters', 'transcripts']) mkdirSync(join(assets, dir), { recursive: true });
const mediaManifestPath = join(assets, 'media-manifest.json');
const previousAssets = requestedIds.length
  ? JSON.parse(readFileSync(mediaManifestPath, 'utf8')).assets.filter(({ id }) => !requestedSet.has(id))
  : [];
if (requestedIds.length && previousAssets.length !== allScenes.length - scenes.length) {
  throw new Error('A selected GIF update requires a complete existing media manifest; run without ids to rebuild all walkthroughs.');
}

function redTests(id) {
  const temp = mkdtempSync(join(tmpdir(), 'anti-slop-gif-red-'));
  try {
    const directory = seed(id, join(temp, 'workspace'));
    const fixture = track(id).fixture;
    const name = fixture === 'builtins' ? 'cart.test.mjs' : 'discount.test.mjs';
    cpSync(join(ROOT, 'fixtures', fixture, 'reference', 'src', name), join(directory, 'src', name));
    const result = runNodeTests(directory, join(directory, 'src', name));
    assert.ok(result.failed > 0 && result.passed > 0, 'Red tests must catch defects and preserve existing behavior.');
    return result;
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const excerpt = (result) => result.output.split(/\r?\n/)
  .filter((line) => /^(ok \d|not ok \d|# (tests|suites|pass|fail|skipped|cancelled|todo) )/.test(line)).join('\n');

function terminal(result) {
  const counts = result.output.split(/\r?\n/).filter((line) => /^# (tests|pass|fail) /.test(line));
  const failures = result.output.split(/\r?\n/).filter((line) => /^not ok \d/.test(line));
  return [...counts, '', ...failures.slice(0, 2),
    ...(failures.length > 2 ? [`${failures.length - 2} further failures: full summary in transcript.`] : [])].join('\n');
}

function prompt(step) {
  if (step.prompt) return step.prompt;
  const recipe = [...catalog.recipes, ...catalog.publicSkills].find((entry) => entry.name === step.recipe);
  if (!recipe) throw new Error(`Unknown walkthrough recipe: ${step.recipe}`);
  return recipe.prompt;
}

function frame(scene, step, fraction, evidence) {
  const request = prompt(step);
  const typed = request.slice(0, Math.ceil(request.length * fraction));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1280px;height:720px;display:grid;grid-template-rows:86px 48px 532px 54px;background:#0d1117;color:#e6edf3;font:16px/1.45 "Segoe UI",sans-serif}
header{display:flex;justify-content:space-between;align-items:center;padding:14px 24px;border-bottom:1px solid #30363d;background:#161b22;gap:24px}
h1{font-size:26px;line-height:1.2;margin:0 0 6px}header p{margin:0;color:#9aa5b1;font-size:13px}.label{color:#58a6ff;font:600 13px Consolas,monospace;white-space:nowrap}
.flow{display:flex;gap:8px;align-items:center;padding:6px 24px;flex-wrap:wrap}.flow code{font-size:13px;background:#1c2230;padding:4px 8px;border:1px solid #30363d;border-radius:4px}
main{display:grid;grid-template-columns:minmax(0,1.22fr) minmax(0,1fr);gap:18px;padding:8px 24px 16px;min-height:0}
.chat,.artifact,.terminal{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:18px;min-width:0;min-height:0}
.chat{display:flex;flex-direction:column;gap:14px}.chat h2{margin:0;font-size:20px}.small{font-size:12px;color:#9aa5b1;text-transform:uppercase;letter-spacing:.04em;margin:0 0 6px}
.request{padding:14px;background:#1c2230;border-left:3px solid #58a6ff;min-height:120px;max-height:190px}
.answer{padding:14px;border-left:3px solid #9aa5b1;max-height:176px}.answer p:last-child{margin:0;line-height:1.55;font-size:16px}
.right{display:grid;grid-template-rows:1.1fr 1fr;gap:16px;min-height:0}
pre{margin:0;font:13px/1.42 Consolas,"Cascadia Mono",monospace;white-space:pre-wrap;overflow-wrap:anywhere;overflow:hidden}
.request pre{font-size:15px;line-height:1.45}.artifact pre{max-height:190px}.terminal pre{max-height:172px}.terminal.final{border-color:#3fb950}.terminal.final pre{color:#7ee787}
footer{padding:12px 24px;background:#1c2230;border-top:1px solid #30363d;font-size:13px;color:#c9d1d9;display:flex;align-items:center}
</style></head><body>
<header><div><h1>${esc(scene.title)}</h1><p>${esc(scene.client)}${scene.track === 'spec-kit' ? ' | App equivalent: /speckit-* skills' : ''}</p></div><span class="label">${esc(LABS[labFor(scene)].label)}</span></header>
<nav class="flow">${scene.commands.map((name) => `<code>/${esc(name)}</code>`).join('')}</nav>
<main><section class="chat"><p class="small">Guided command walkthrough | illustrative dialogue</p><h2>${esc(step.heading)}</h2>
<div class="request"><p class="small">Participant types in chat</p><pre>${esc(typed)}${fraction < 1 ? '|' : ''}</pre></div>
<div class="answer"><p class="small">Illustrative response / learner checkpoint</p><p>${esc(fraction === 1 ? step.answer : 'Review the request before proceeding. The complete illustrative checkpoint follows.')}</p></div>
</section><div class="right"><section class="artifact"><p class="small">Source or artifact | illustrative snapshot</p><pre>${esc(step.artifact)}</pre></section>
<section class="terminal ${step.evidence === 'final' ? 'final' : ''}"><p class="small">Observed ${step.evidence === 'red' ? 'learner-suite red run' : step.evidence === 'final' ? 'reference acceptance' : 'starter acceptance'} | real test runner</p><pre>${esc(terminal(evidence))}</pre></section></div></main>
<footer>${esc(disclaimer)}</footer></body></html>`;
}

for (const scene of scenes) {
  track(scene.track);
  assert.equal(scene.steps.length, 4, `${scene.id}: expected four walkthrough steps.`);
  for (const step of scene.steps) {
    assert.ok(prompt(step), `${scene.id}: missing prompt.`);
    assert.ok(['baseline', 'red', 'final'].includes(step.evidence), `${scene.id}: unknown evidence.`);
  }
}

const browser = await chromium.launch({ headless: true });
const manifest = { disclaimer, width, height, maxBytes, sourceSha256: sourceFingerprint(), assets: previousAssets };
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  for (const scene of scenes) {
    const baseline = fixtureChecks(scene.track, 'starter');
    verifyBaseline(scene.track, baseline);
    const final = fixtureChecks(scene.track, 'reference');
    assert.equal(final.status, 0, final.output);
    const evidence = { baseline, red: redTests(scene.track), final };
    const frames = [];
    for (const [index, step] of scene.steps.entries()) {
      for (const fraction of [0.35, 0.7, 1]) {
        await page.setContent(frame(scene, step, fraction, evidence[step.evidence]));
        await page.evaluate(() => document.fonts.ready);
        const clipped = await page.locator('pre, .request, .answer').evaluateAll((elements) =>
          elements.filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1).map((el) => el.className || el.tagName));
        assert.deepEqual(clipped, [], `${scene.id}/${index}: content clipped`);
        assert.equal(await page.locator('footer').innerText(), disclaimer);
        const png = await page.screenshot({ type: 'png' });
        frames.push({ rgba: PNG.sync.read(png).data, delay: fraction === 1 ? 5000 : 450 });
        if (fraction === 1 && (index === 0 || index === scene.steps.length - 1)) {
          writeFileSync(join(assets, 'posters', `${scene.id}-${index === 0 ? 'before' : 'after'}.png`), png);
        }
      }
    }
    const bytes = encodeGif(frames, width, height);
    assert.ok(bytes.length <= maxBytes, `${scene.id} is larger than 8 MiB`);
    writeFileSync(join(assets, 'gifs', `${scene.id}.gif`), bytes);
    writeFileSync(join(assets, 'transcripts', `${scene.id}.md`), [
      `# ${scene.title}`, '', `> ${disclaimer}`, '',
      `Client: ${scene.client}. Track: ${scene.track}.`, '',
      `Commands: ${scene.commands.map((name) => `\`/${name}\``).join(', ')}.`, '',
      ...(scene.track === 'spec-kit' ? ['In the official Copilot skills layout, use `/speckit-<step>` instead of `/speckit.<step>`.', ''] : []),
      'The dialogue and artifact snapshots below are authored examples. Test summaries are verbatim excerpts from real fixture runs; stack traces and machine-local paths are omitted.', '',
      ...scene.steps.flatMap((step, index) => [
        `## Step ${index + 1}: ${step.heading}`, '',
        'Participant:', '', '```text', prompt(step), '```', '',
        'Illustrative checkpoint:', '', step.answer, '',
        'Source or artifact snapshot:', '', '```text', step.artifact, '```', '',
        'Observed test summary:', '', '```text', excerpt(evidence[step.evidence]), '```', '',
      ]),
      `Takeaway: ${scene.takeaway}`, '',
      `Try it yourself: [${LABS[labFor(scene)].title}](../../${LABS[labFor(scene)].guide}). Set up first with the [lab environment guide](../../README.md).`, '',
    ].join('\n'));
    const summary = (result) => ({ total: result.total, passed: result.passed, failed: result.failed, status: result.status });
    manifest.assets.push({
      id: scene.id, frames: frames.length, bytes: bytes.length,
      durationMs: frames.reduce((sum, entry) => sum + entry.delay, 0),
      sha256: createHash('sha256').update(bytes).digest('hex'),
      baseline: summary(baseline), red: summary(evidence.red), final: summary(final),
      displayedFinal: scene.steps.at(-1).evidence,
    });
    console.log(`${scene.id}: ${frames.length} frames, ${(bytes.length / 1024).toFixed(0)} KiB; baseline ${baseline.passed}/${baseline.total}, reference ${final.passed}/${final.total}.`);
  }
  const assetsById = new Map(manifest.assets.map((asset) => [asset.id, asset]));
  manifest.assets = allScenes.filter(({ id }) => assetsById.has(id)).map(({ id }) => assetsById.get(id));
  if (manifest.assets.length !== allScenes.length) throw new Error('Walkthrough generation left the media manifest incomplete.');
  writeFileSync(mediaManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await browser.close();
}
