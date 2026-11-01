import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { root, runChecks } from './lab.mjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const scenes = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
const width = 1280;
const height = 720;
const maxBytes = 8 * 1024 * 1024;
const disclaimer = 'Illustrative walkthrough - not recorded Copilot output';
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

const browser = await launch();
const manifest = { disclaimer, width, height, maxBytes, assets: [] };
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route(/^https?:/, (route) => {
    errors.push(`Unexpected network request: ${route.request().url()}`);
    return route.abort();
  });
  await page.goto(pathToFileURL(join(root, 'scripts', 'render', 'stage.html')).href);
  await page.evaluate(() => document.fonts.ready);
  for (const scene of scenes) {
    const checks = runChecks(scene.exercise, 'solution');
    if (checks.status !== 0) throw new Error(`Cannot illustrate a broken solution: ${scene.exercise}\n${checks.output}`);
    const frames = [];
    for (let index = 0; index < scene.steps.length; index++) {
      for (const fraction of [0.35, 0.7, 1]) {
        await page.evaluate(({ scene, index, fraction }) => window.renderFrame(scene, index, fraction), { scene, index, fraction });
        const layout = await page.evaluate(() => {
          const selectors = ['.intro', '#code', '.chat-body', '.terminal', '.bottom', 'footer'];
          return selectors.filter((selector) => {
            const element = document.querySelector(selector);
            const bounds = element.getBoundingClientRect();
            return element.scrollWidth > element.clientWidth + 1 || bounds.right > 1280 || bounds.bottom > 720
              || (selector === '#code' && bounds.bottom > document.querySelector('main').getBoundingClientRect().bottom)
              || (selector === '.chat-body' && bounds.bottom > document.querySelector('main').getBoundingClientRect().bottom);
          });
        });
        if (layout.length) throw new Error(`${scene.id}/${index}: clipped content ${layout.join(', ')}`);
        if (await page.locator('#disclaimer').textContent() !== disclaimer) throw new Error('Missing capture disclaimer.');
        const png = await page.screenshot({ type: 'png' });
        frames.push({ rgba: PNG.sync.read(png).data, delay: fraction === 1 ? 3400 : 350 });
        if (fraction === 1 && (index === 0 || index === scene.steps.length - 1)) {
          writeFileSync(join(directories.posters, `${scene.id}-${index === 0 ? 'before' : 'after'}.png`), png);
        }
      }
    }
    const samples = frames.filter((_, index) => index % 3 === 2);
    const palette = quantize(Buffer.concat(samples.map((frame) => frame.rgba)), 255, { format: 'rgb565' });
    while (palette.length < 255) palette.push([0, 0, 0]);
    const encoder = GIFEncoder();
    let previous;
    for (const frame of frames) {
      const indexed = applyPalette(frame.rgba, palette, 'rgb565');
      if (!previous) {
        encoder.writeFrame(indexed, width, height, { palette: [...palette, [0, 0, 0]], delay: frame.delay, repeat: 0, dispose: 1 });
      } else {
        const delta = indexed.map((pixel, index) => pixel === previous[index] ? 255 : pixel);
        encoder.writeFrame(delta, width, height, { delay: frame.delay, transparent: true, transparentIndex: 255, dispose: 1 });
      }
      previous = indexed;
    }
    encoder.finish();
    const bytes = Buffer.from(encoder.bytes());
    if (bytes.length > maxBytes) throw new Error(`${scene.id}: ${bytes.length} bytes exceeds 8 MiB.`);
    const gif = join(directories.gifs, `${scene.id}.gif`);
    writeFileSync(gif, bytes);
    const transcript = [
      `# ${scene.title}`, '', disclaimer, '',
      `Real exercise: [${scene.exercise}](../../exercises/${scene.exercise}/TASK.md)`, '',
      ...scene.steps.flatMap((step) => [`## ${step.phase}: ${step.heading}`, '', `Participant: ${step.prompt}`, '', step.response, '', '```text', step.code, '```', '', `Terminal/observation: ${step.terminal}`, '']),
      `Takeaway: ${scene.takeaway}`, '',
    ].join('\n');
    writeFileSync(join(directories.transcripts, `${scene.id}.md`), transcript);
    manifest.assets.push({ id: scene.id, exercise: scene.exercise, frames: frames.length, bytes: statSync(gif).size, sha256: createHash('sha256').update(bytes).digest('hex') });
    console.log(`${scene.id}: ${frames.length} frames, ${(bytes.length / 1024 / 1024).toFixed(2)} MiB`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  writeFileSync(join(root, 'assets', 'media-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally {
  await browser.close();
}
