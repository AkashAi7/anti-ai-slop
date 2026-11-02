import { existsSync, mkdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { DOWNLOADS, ROOT, urlFrom } from './lib/util.mjs';
import { PAGES } from './lib/layout.mjs';
import { loadLab, transcriptOutput } from './lib/data.mjs';
import { listGenerated } from './build.mjs';

const WIDTHS = [320, 768, 1024, 1440];
const USAGE = 'Usage: npm run smoke [-- --shots <folder>] [--base <https://host/path/>]';
const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  if (at < 0) return null;
  if (!args[at + 1] || args[at + 1].startsWith('--')) throw new Error(USAGE);
  return args[at + 1];
};
const shotsArg = option('--shots');
const shots = shotsArg ? resolve(shotsArg) : null;
const baseArg = option('--base');
if (baseArg && !/^https?:\/\//i.test(baseArg)) throw new Error(USAGE);
// With --base, pages load from a hosted copy of this repository instead of from disk.
const base = baseArg ? new URL(baseArg.endsWith('/') ? baseArg : `${baseArg}/`) : null;

const errors = [];
const fail = (file, message) => errors.push(`${relative(ROOT, file)}: ${message}`);
const url = (file) => (base ? new URL(relative(ROOT, file).split(sep).join('/'), base).href : pathToFileURL(file).href);
const ownRequest = (address) => address.startsWith('data:') || (base ? address.startsWith(base.href) : address.startsWith('file:'));

const lab = loadLab();

// Chromium restores a window from full screen asynchronously, and refuses to resize it until it has.
async function resize(page, size) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await page.setViewportSize(size);
    } catch (error) {
      if (attempt >= 30 || !/fullscreen window/.test(error.message)) throw error;
      await page.waitForTimeout(100);
    }
  }
}

// Play must open the GIF in a theater that fills the viewport, and Esc or the close button must undo all of it.
async function testPlayer(page, file) {
  const trigger = page.locator('.player-toggle').first();
  const inline = page.locator('.player-media img').first();
  const theater = page.locator('dialog.theater');
  const stage = theater.locator('.theater-stage img');
  const playButton = theater.locator('[data-theater-play]');
  const poster = await inline.getAttribute('src');
  const before = await page.evaluate(() => ({ vw: innerWidth, vh: innerHeight }));
  if (!(await trigger.isVisible())) return fail(file, 'player button is not shown');
  const [button, still] = [await trigger.boundingBox(), await inline.boundingBox()];
  if (button.y < still.y + still.height && button.y + button.height > still.y
    && button.x < still.x + still.width && button.x + button.width > still.x) fail(file, 'Play button covers part of the poster');

  const measure = () => page.evaluate(() => {
    const frame = document.querySelector('.theater-frame');
    const img = document.querySelector('.theater-stage img');
    const box = img.getBoundingClientRect();
    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const rect = frame.getBoundingClientRect();
    return {
      w: Math.round(rect.width), h: Math.round(rect.height), vw: innerWidth, vh: innerHeight,
      shownW: img.naturalWidth * scale, shownH: img.naturalHeight * scale,
      inlineW: document.querySelector('.player-media img').getBoundingClientRect().width,
      overflow: frame.scrollWidth - frame.clientWidth,
      closeFocused: document.activeElement?.matches('[data-theater-close]') ?? false,
      locked: getComputedStyle(document.documentElement).overflow === 'hidden',
    };
  });
  const expectClosed = async (how) => {
    await theater.waitFor({ state: 'hidden' });
    const restored = await page.waitForFunction(
      ({ vw, vh }) => !document.fullscreenElement && innerWidth === vw && innerHeight === vh,
      before, { timeout: 5000 },
    ).then(() => true, () => false);
    if (!restored) fail(file, `${how} did not restore the ${before.vw}x${before.vh} window`);
    const after = await page.evaluate(() => ({
      fullscreen: Boolean(document.fullscreenElement),
      locked: getComputedStyle(document.documentElement).overflow === 'hidden',
      stageSrc: document.querySelector('.theater-stage img').getAttribute('src'),
    }));
    // Focus comes back from the fullscreenchange handler, which can land a beat after full screen ends.
    const focused = await trigger.evaluateHandle((el) => el)
      .then((handle) => page.waitForFunction((el) => el === document.activeElement, handle, { timeout: 2000 }))
      .then(() => true, () => false);
    if (!focused) fail(file, `${how} did not return focus to the Play button`);
    if (after.fullscreen) fail(file, `${how} left the browser in full screen`);
    if (after.locked) fail(file, `${how} left page scrolling locked`);
    if (after.stageSrc) fail(file, `${how} left the GIF loaded (${after.stageSrc})`);
    if ((await inline.getAttribute('src')) !== poster) fail(file, `${how} changed the inline poster`);
  };

  await trigger.click();
  if (!(await theater.isVisible())) return fail(file, 'Play did not open the full-screen theater');
  await page.waitForFunction((el) => el.getAttribute('src')?.endsWith('.gif') && el.complete && el.naturalWidth > 0, await stage.elementHandle());
  const entered = await page.waitForFunction(() => document.fullscreenElement?.classList.contains('theater-frame'), null, { timeout: 5000 })
    .then(() => true, () => false);
  if (!entered) fail(file, 'Play did not put the browser in full screen');
  const fit = await measure();
  if (fit.w < fit.vw || fit.h < fit.vh) fail(file, `theater is ${fit.w}x${fit.h}, not the full ${fit.vw}x${fit.vh} viewport`);
  if (fit.shownW < fit.vw * 0.9 && fit.shownH < fit.vh * 0.8) fail(file, `GIF is shown at ${Math.round(fit.shownW)}x${Math.round(fit.shownH)}, too small for a ${fit.vw}x${fit.vh} viewport`);
  if (fit.shownW < fit.inlineW * 1.5) fail(file, `full-screen GIF (${Math.round(fit.shownW)}px) is not much larger than the inline poster (${Math.round(fit.inlineW)}px)`);
  if (!fit.closeFocused) fail(file, 'opening the theater did not focus "Exit full screen"');
  if (!fit.locked) fail(file, 'page behind the theater can still scroll');

  await playButton.click();
  if (!(await stage.getAttribute('src')).endsWith('.png') || (await playButton.innerText()) !== 'Play again') fail(file, 'Stop did not show the still poster');
  await playButton.click();
  if (!(await stage.getAttribute('src')).endsWith('.gif') || (await playButton.innerText()) !== 'Stop') fail(file, 'Play again did not restart the GIF');

  await page.keyboard.press('Escape');
  await expectClosed('Esc');

  await inline.click();
  if (!(await theater.isVisible())) return fail(file, 'clicking the poster did not open the theater');
  await theater.locator('[data-theater-close]').click();
  await expectClosed('Exit full screen');
}

// Without the Fullscreen API (iPhone Safari, for example) the theater must still fill a phone screen without sideways scrolling.
async function testTheaterNarrow(page, file) {
  await page.evaluate(() => Object.defineProperty(document, 'fullscreenEnabled', { get: () => false }));
  await resize(page, { width: 320, height: 640 });
  await page.locator('.player-toggle').first().click();
  const stage = page.locator('.theater-stage img');
  await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await stage.elementHandle());
  const narrow = await page.evaluate(() => {
    const frame = document.querySelector('.theater-frame');
    const box = document.querySelector('.theater-stage img').getBoundingClientRect();
    const rect = frame.getBoundingClientRect();
    return {
      fullscreen: Boolean(document.fullscreenElement), overflow: frame.scrollWidth - frame.clientWidth,
      width: box.width, w: Math.round(rect.width), h: Math.round(rect.height), vw: innerWidth, vh: innerHeight,
    };
  });
  if (narrow.fullscreen) fail(file, 'theater requested full screen even though the API is unavailable');
  if (narrow.w < narrow.vw || narrow.h < narrow.vh) fail(file, `fallback theater is ${narrow.w}x${narrow.h}, not the full ${narrow.vw}x${narrow.vh} window`);
  if (narrow.overflow > 0) fail(file, `theater overflows sideways by ${narrow.overflow}px at 320px wide`);
  if (narrow.width < narrow.vw * 0.85) fail(file, `GIF box is only ${Math.round(narrow.width)}px wide at 320px`);
  if (!(await page.locator('.theater-hint').isVisible())) fail(file, 'portrait phone theater does not suggest turning the phone sideways');
  await page.keyboard.press('Escape');
  await page.locator('dialog.theater').waitFor({ state: 'hidden' });
  await resize(page, { width: 1440, height: 900 });
}

async function testSkipLink(page, file) {
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className);
  if (first !== 'skip-link') fail(file, `first Tab focuses "${first}", not the skip link`);
  await page.keyboard.press('Enter');
  const target = await page.evaluate(() => document.activeElement?.id);
  if (target !== 'main') fail(file, `skip link moved focus to "${target}"`);
}

// The home page must route people to both labs, setup, skill loading, engineering skills and all three downloads.
async function testHome(page, file) {
  const cards = await page.locator('.lab-card h3 a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  const expected = lab.labs.map(({ id }) => urlFrom(file, PAGES[id]));
  if (JSON.stringify(cards) !== JSON.stringify(expected)) fail(file, `lab cards link to ${cards.join(', ') || 'nothing'}, expected ${expected.join(', ')}`);
  for (const id of ['labs', 'setup', 'load-skills', 'engineering-skills', 'workshop']) {
    if (!(await page.locator(`#${id}`).count())) fail(file, `missing #${id} section`);
  }
  const skillRows = await page.locator('#engineering-skills tbody tr').count();
  if (skillRows !== lab.softwareDevelopmentSkills.length) fail(file, `engineering skills section has ${skillRows} rows, expected ${lab.softwareDevelopmentSkills.length}`);
  const engineeringRows = await page.locator('#engineering-skills tbody tr').allTextContents();
  for (const { command } of lab.softwareDevelopmentSkills) {
    if (!engineeringRows.some((row) => row.includes(`/${command}`))) fail(file, `engineering skill /${command} is missing from the installed skills list`);
  }
  const demo = await page.locator('#engineering-skills a[href*="walk-engineering-input-review"]').count();
  if (!demo) fail(file, 'engineering skills section does not link to its security-review GIF demo');
  const downloads = new Set(await page.locator('a[download]').evaluateAll((links) => links.map((link) => link.getAttribute('href'))));
  for (const target of Object.values(DOWNLOADS)) {
    const href = urlFrom(file, target);
    if (!downloads.has(href)) fail(file, `no download link to ${href}`);
    if (!base && !existsSync(target)) fail(file, `download ${href} has not been built`);
  }
}

// Each lab page must show exactly its own walkthroughs, and every one must play full screen and hand focus back.
async function testLabPage(page, file, item) {
  const gifs = await page.locator('#watch .player-media img').evaluateAll((images) => images.map((img) => img.dataset.gif));
  const expected = item.walkthroughs.map((walk) => urlFrom(file, walk.gif));
  if (JSON.stringify(gifs) !== JSON.stringify(expected)) fail(file, `walkthrough GIFs are ${gifs.join(', ')}, expected ${expected.join(', ')}`);
  const ids = await page.locator('#watch .walk').evaluateAll((walks) => walks.map((walk) => walk.id));
  if (JSON.stringify(ids) !== JSON.stringify(item.walkthroughs.map(({ id }) => `walk-${id}`))) fail(file, `walkthrough anchors are ${ids.join(', ')}`);
  if (!(await page.locator('.toc a[href="#watch"]').count())) fail(file, 'contents does not link to the walkthroughs');

  const before = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  const triggers = page.locator('#watch .player-toggle');
  for (let index = 0; index < expected.length; index += 1) {
    const trigger = triggers.nth(index);
    await trigger.click();
    const stage = page.locator('.theater-stage img');
    await page.waitForFunction((el) => el.complete && el.naturalWidth === 1280, await stage.elementHandle());
    const src = await stage.getAttribute('src');
    if (src !== expected[index]) fail(file, `Play ${index + 1} opened ${src}, expected ${expected[index]}`);
    const transcript = await page.locator('[data-theater-transcript]').getAttribute('href');
    const wanted = urlFrom(file, transcriptOutput(item.walkthroughs[index].id));
    if (transcript !== wanted) fail(file, `theater transcript link is ${transcript}, expected ${wanted}`);
    await page.locator('[data-theater-close]').click();
    await page.waitForFunction(({ w, h }) => !document.fullscreenElement && innerWidth === w && innerHeight === h, before);
    const focused = await page.waitForFunction((el) => el === document.activeElement, await trigger.elementHandle(), { timeout: 5000 })
      .then(() => true, () => false);
    if (!focused) fail(file, `focus not restored after walkthrough ${index + 1}`);
  }
}

// Copy must put the exact command on the clipboard, and say so plainly when the clipboard refuses.
async function testCopy(page, file) {
  await page.evaluate(() => { navigator.clipboard.writeText = async (text) => { window.__copied = text; }; });
  const block = page.locator('main .code-block').first();
  const text = await block.locator('pre').evaluate((pre) => pre.innerText.replace(/\n$/, ''));
  await block.locator('.copy').click();
  if (await page.evaluate(() => window.__copied) !== text) fail(file, 'Copy did not put the whole code block on the clipboard');
  if (await block.locator('.copy').innerText() !== 'Copied') fail(file, 'Copy does not confirm success');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Clipboard permission denied'); }; });
  await block.locator('.copy').click();
  if (await block.locator('.copy').innerText() !== 'Copy failed') fail(file, 'clipboard failure is not surfaced');
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const first = [PAGES.home, PAGES.setup, ...lab.labs.map(({ id }) => PAGES[id])];
  const files = [...first, ...listGenerated().filter((path) => !first.includes(path)).sort()];
  const hostedLinks = new Set();
  let images = 0;
  let players = 0;

  for (const file of files) {
    const page = await context.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error') fail(file, `console error: ${msg.text()}`); });
    page.on('pageerror', (error) => fail(file, `page error: ${error.message}`));
    page.on('request', (request) => {
      if (!ownRequest(request.url())) fail(file, `${base ? 'off-site' : 'network'} request: ${request.url()}`);
    });
    const response = await page.goto(url(file), { waitUntil: 'load' });
    if (base && !response?.ok()) fail(file, `HTTP ${response?.status()} for ${url(file)}`);
    if (base) {
      const targets = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], img[src], link[href], script[src]')].map((el) => el.href || el.src));
      for (const target of targets) {
        const clean = target.split('#')[0];
        if (clean.startsWith(base.href)) hostedLinks.add(clean);
      }
    }

    const broken = await page.evaluate(async () => {
      // The theater's stage image stays empty until a walkthrough is played.
      const imgs = [...document.images].filter((img) => img.hasAttribute('src'));
      for (const img of imgs) img.loading = 'eager';
      await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
      return { count: imgs.length, broken: imgs.filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src')) };
    });
    images += broken.count;
    for (const src of broken.broken) fail(file, `image did not load: ${src}`);
    players += await page.locator('.player-toggle').count();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) fail(file, `${overflow}px horizontal overflow at ${width}px wide`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });

    const blocks = await page.locator('main pre').count();
    if (blocks && (await page.locator('main .code-block .copy').count()) !== blocks) fail(file, 'not every code block has a copy button');

    if (file === PAGES.home) {
      await testSkipLink(page, file);
      await testHome(page, file);
      await testPlayer(page, file);
      await testTheaterNarrow(page, file);
    }
    if (file === PAGES.setup) await testCopy(page, file);
    const item = lab.labs.find(({ id }) => PAGES[id] === file);
    if (item) {
      await testLabPage(page, file, item);
      await testPlayer(page, file);
    }
    if (file === transcriptOutput(lab.walkthroughs[0].id)) await testPlayer(page, file);
    await page.close();
  }

  const expectedPlayers = lab.walkthroughs.length * 2 + 1;
  if (players !== expectedPlayers) errors.push(`expected ${expectedPlayers} players (1 hero, 1 per walkthrough on its lab page, 1 per transcript), found ${players}`);

  if (shots) {
    mkdirSync(shots, { recursive: true });
    const targets = [
      ['home', PAGES.home],
      ['setup', PAGES.setup],
      ...lab.labs.map(({ id }) => [id, PAGES[id]]),
      ['facilitator', PAGES.facilitator],
      ['transcript', transcriptOutput(lab.walkthroughs[0].id)],
    ];
    for (const width of [1440, 390]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      for (const [name, file] of targets) {
        await page.goto(url(file), { waitUntil: 'load' });
        await page.evaluate(async () => {
          for (const img of document.images) img.loading = 'eager';
          await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
        });
        await page.screenshot({ path: join(shots, `${name}-${width}.png`), fullPage: true });
      }
      await page.goto(url(PAGES.home), { waitUntil: 'load' });
      await page.locator('.player-toggle').first().click();
      await page.waitForFunction(() => {
        const img = document.querySelector('.theater-stage img');
        return img?.getAttribute('src')?.endsWith('.gif') && img.complete && img.naturalWidth > 0;
      });
      await page.screenshot({ path: join(shots, `theater-${width}.png`) });
      await page.close();
    }
  }

  if (base) {
    // Every same-site link and asset must be served, including lab files outside site/.
    // Dropped connections are retried; an HTTP 4xx fails immediately.
    const problemWith = async (target) => {
      let problem = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt) await new Promise((done) => setTimeout(done, 500 * attempt));
        try {
          const response = await fetch(target, { method: 'HEAD' });
          if (response.ok) return null;
          problem = `HTTP ${response.status}`;
          if (response.status < 500) return problem;
        } catch (error) {
          problem = error.cause?.code ?? error.message;
        }
      }
      return problem;
    };
    const queue = [...hostedLinks];
    const worker = async () => {
      for (let target = queue.shift(); target; target = queue.shift()) {
        const problem = await problemWith(target);
        if (problem) errors.push(`${target}: ${problem}`);
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));

    const page = await context.newPage();
    await page.goto(base.href, { waitUntil: 'load' });
    await page.waitForURL(url(PAGES.home), { timeout: 15000 })
      .catch(() => errors.push(`${base.href}: the site root did not open ${url(PAGES.home)}`));
    await page.close();
  }

  if (errors.length) {
    for (const error of errors) console.error(`x ${error}`);
    console.error(`\nSite smoke failed: ${errors.length} problem(s).`);
    process.exitCode = 1;
  } else {
    const hosted = base ? `; on ${base.href}, the root redirect works and ${hostedLinks.size} same-site links and assets return 2xx` : '';
    console.log(`Site smoke passed: ${files.length} pages, ${images} images decoded, ${players} players, no errors or ${base ? 'off-site' : 'network'} requests, no overflow at ${WIDTHS.join('/')}px; home routes to both labs, the engineering skills and all three downloads; all ${lab.walkthroughs.length} lab GIFs play full screen and return focus; copy, clipboard error, theater and skip link work${hosted}.${shots ? ` Screenshots: ${shots}` : ''}`);
  }
} finally {
  await browser.close();
}
