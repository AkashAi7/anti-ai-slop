#!/usr/bin/env node
// Records the walkthrough GIFs from the Command Studio Watch mode, plus a tour of the interactive studio.
// Every scene is checked against its real exercise solution before it is captured.
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { root, runChecks, exercise } from './lab.mjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const { scenes } = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
const width = 1280;
const height = 720;
const maxBytes = 8 * 1024 * 1024;
const disclaimer = 'Illustrative walkthrough - not recorded Copilot output';
const studioUrl = pathToFileURL(join(root, 'studio', 'index.html')).href;
const directories = Object.fromEntries(['gifs', 'posters', 'transcripts'].map((name) => [name, join(root, 'assets', name)]));
for (const path of Object.values(directories)) mkdirSync(path, { recursive: true });

async function launch() {
  try { return await chromium.launch({ headless: true }); }
  catch (error) {
    if (!/Executable doesn't exist/.test(error.message)) throw error;
    console.warn('Playwright Chromium is not installed; trying installed Microsoft Edge.');
    try { return await chromium.launch({ channel: 'msedge', headless: true }); }
    catch (edgeError) {
      throw new Error(`No capture browser available. Run npx playwright install chromium.\n${edgeError.message}`);
    }
  }
}

function encode(frames) {
  const samples = frames.filter((_, index) => index % 2 === 1 || frames.length < 4);
  const palette = quantize(Buffer.concat(samples.map((frame) => frame.rgba)), 255, { format: 'rgb565' });
  while (palette.length < 255) palette.push([0, 0, 0]);
  const encoder = GIFEncoder();
  let previous;
  for (const frame of frames) {
    const indexed = applyPalette(frame.rgba, palette, 'rgb565');
    if (!previous) {
      encoder.writeFrame(indexed, width, height, { palette: [...palette, [0, 0, 0]], delay: frame.delay, repeat: 0, dispose: 1 });
    } else {
      const delta = indexed.map((pixel, index) => (pixel === previous[index] ? 255 : pixel));
      encoder.writeFrame(delta, width, height, { delay: frame.delay, transparent: true, transparentIndex: 255, dispose: 1 });
    }
    previous = indexed;
  }
  encoder.finish();
  return Buffer.from(encoder.bytes());
}

function save(id, bytes, frames, extra) {
  if (bytes.length > maxBytes) throw new Error(`${id}: ${bytes.length} bytes exceeds 8 MiB.`);
  const gif = join(directories.gifs, `${id}.gif`);
  writeFileSync(gif, bytes);
  console.log(`${id}: ${frames} frames, ${(bytes.length / 1024 / 1024).toFixed(2)} MiB`);
  return { id, ...extra, frames, bytes: statSync(gif).size, sha256: createHash('sha256').update(bytes).digest('hex') };
}

async function recordScene(page, scene) {
  const checks = runChecks(scene.exercise, 'solution');
  if (checks.status !== 0) throw new Error(`Cannot illustrate a broken solution: ${scene.exercise}\n${checks.output}`);
  const last = scene.steps[scene.steps.length - 1];
  if (!last.terminal.includes(`# pass ${checks.passed}`)) {
    throw new Error(`${scene.id}: final terminal must show the observed "# pass ${checks.passed}" for ${scene.exercise}.`);
  }
  const frames = [];
  for (let index = 0; index < scene.steps.length; index++) {
    for (const fraction of [0.35, 0.7, 1]) {
      const clipped = await page.evaluate(({ id, index, fraction }) => window.__studio.renderFrame(id, index, fraction), { id: scene.id, index, fraction });
      if (clipped.length) throw new Error(`${scene.id}/${index}@${fraction}: clipped content ${clipped.join(', ')}`);
      if (await page.locator('#disclaimer').textContent() !== disclaimer) throw new Error('Missing capture disclaimer.');
      const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } });
      frames.push({ rgba: PNG.sync.read(png).data, delay: fraction === 1 ? 3400 : 450 });
      if (fraction === 1 && (index === 0 || index === scene.steps.length - 1)) {
        writeFileSync(join(directories.posters, `${scene.id}-${index === 0 ? 'before' : 'after'}.png`), png);
      }
    }
  }
  const transcript = [
    `# ${scene.title}`, '', `> ${disclaimer}`, '',
    `Real exercise: [${scene.exercise}](../../exercises/${scene.exercise}/TASK.md). Commands: ${scene.commands.map((c) => `\`/${c}\``).join(', ')}.`, '',
    ...scene.steps.flatMap((step, i) => [
      `## Step ${i + 1} - ${step.phase}: ${step.heading}`, '',
      `File: \`${step.file}\``, '',
      'Participant:', '', '```text', step.prompt, '```', '',
      'Response (illustrative):', '', '```text', step.response, '```', '',
      'Code:', '', '```diff', step.code, '```', '',
      'Terminal:', '', '```text', step.terminal, '```', '',
    ]),
    `Takeaway: ${scene.takeaway}`, '',
  ].join('\n');
  writeFileSync(join(directories.transcripts, `${scene.id}.md`), transcript);
  return save(scene.id, encode(frames), frames.length, {
    kind: 'walkthrough', exercise: scene.exercise, observed: `# pass ${checks.passed} of ${exercise(scene.exercise).testCount}`,
  });
}

async function recordTour(page) {
  const frames = [];
  const shot = async (delay) => {
    const png = await page.screenshot({ type: 'png' });
    frames.push({ rgba: PNG.sync.read(png).data, delay });
    return png;
  };
  const steps = [];
  await page.goto('about:blank');
  await page.goto(`${studioUrl}#try`);
  await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  await shot(1600); steps.push('Open the Try it tab. The chat input simulates the VS Code Chat view.');
  await page.locator('#try-input').click();
  await page.keyboard.type('/');
  await shot(1400); steps.push('Type / and the command palette lists built-in commands and the 12 lab prompt files.');
  for (const key of ['v', 'e', 'r']) { await page.keyboard.type(key); await shot(350); }
  steps.push('Type ver to filter the palette to /verify.');
  await page.keyboard.press('Tab');
  await page.keyboard.type('all tests pass');
  await shot(1400); steps.push('Press Tab to pick /verify, then type the claim to check.');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#try-log .msg.agent:nth-of-type(3)');
  const poster = await shot(4200); steps.push('Press Enter. The studio shows the real prompt file and an illustrative sample answer ending in a verdict.');
  await page.locator('#tab-mission').click();
  await shot(1600); steps.push('Mission mode shows a slop smell and asks which command fixes it.');
  await page.locator('#mission-choices button', { hasText: '/clarify' }).click();
  await shot(3200); steps.push('Pick /clarify. The answer is scored and explained.');
  await page.locator('#tab-commands').click();
  await page.locator('#cmd-search').fill('context');
  await shot(3200); steps.push('The Commands tab searches every command. Searching "context" finds the context-hygiene commands.');
  await page.locator('#tab-watch').click();
  await shot(2600); steps.push('Watch mode replays the five walkthroughs, which are also exported as GIFs.');
  writeFileSync(join(directories.posters, 'studio-tour.png'), poster);
  writeFileSync(join(directories.transcripts, 'studio-tour.md'), [
    '# Command Studio tour', '', '> Recorded from the real studio page. Sample answers inside it are illustrative, not recorded Copilot output.', '',
    ...steps.map((step, i) => `${i + 1}. ${step}`), '',
    'Open it yourself with `npm run studio`.', '',
  ].join('\n'));
  return save('studio-tour', encode(frames), frames.length, { kind: 'tour', exercise: null });
}

const only = process.argv.slice(2);
const browser = await launch();
const manifest = { disclaimer, width, height, maxBytes, assets: [] };
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route(/^https?:/, (route) => {
    errors.push(`Unexpected network request: ${route.request().url()}`);
    return route.abort();
  });
  await page.goto(studioUrl);
  await page.waitForSelector('html[data-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  for (const scene of scenes) {
    if (only.length && !only.includes(scene.id)) continue;
    manifest.assets.push(await recordScene(page, scene));
  }
  if (!only.length || only.includes('studio-tour')) manifest.assets.push(await recordTour(page));
  if (errors.length) throw new Error(errors.join('\n'));
  if (!only.length) writeFileSync(join(root, 'assets', 'media-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally {
  await browser.close();
}
