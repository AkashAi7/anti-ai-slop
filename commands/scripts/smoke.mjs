#!/usr/bin/env node
// Browser smoke test for the Command Studio: drives every mode the way a learner would.
// Fails on console errors, page errors, any network request, or clipped walkthrough content.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { root } from './lab.mjs';

const registry = JSON.parse(readFileSync(join(root, 'commands.json'), 'utf8'));
const missions = JSON.parse(readFileSync(join(root, 'studio', 'missions.json'), 'utf8'));
const missionList = Array.isArray(missions) ? missions : missions.missions;
const { scenes } = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
const studioUrl = pathToFileURL(join(root, 'studio', 'index.html')).href;
const totalCommands = registry.builtIns.length + registry.custom.length;

async function launch() {
  try { return await chromium.launch({ headless: true }); }
  catch (error) {
    if (!/Executable doesn't exist/.test(error.message)) throw error;
    return chromium.launch({ channel: 'msedge', headless: true });
  }
}

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(`ok - ${name}`);
  } catch (error) {
    results.push(`not ok - ${name}`);
    console.log(results.join('\n'));
    throw error;
  }
}

const browser = await launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.route(/^https?:/, (route) => {
    errors.push(`network: ${route.request().url()}`);
    return route.abort();
  });

  await step('studio loads offline from file:// and marks itself ready', async () => {
    await page.goto(studioUrl);
    await page.waitForSelector('html[data-ready="true"]', { timeout: 10000 });
    assert.equal(await page.locator('[role="tab"]').count(), 4);
    assert.equal(await page.locator('#tab-watch').getAttribute('aria-selected'), 'true');
  });

  await step('Watch: scene picker lists every walkthrough', async () => {
    assert.equal(await page.locator('#scene-picker button').count(), scenes.length);
    assert.match(await page.locator('#watch-status').textContent(), /step 1 of \d+/);
  });

  await step('Watch: next and previous step move through the scene', async () => {
    await page.locator('#step-next').click();
    assert.match(await page.locator('#watch-status').textContent(), /step 2 of/);
    await page.locator('#step-prev').click();
    assert.match(await page.locator('#watch-status').textContent(), /step 1 of/);
    assert.equal(await page.locator('#step-prev').isDisabled(), true);
  });

  await step('Watch: picking a scene shows its title and updates the URL', async () => {
    const last = scenes[scenes.length - 1];
    await page.locator(`#scene-picker button[data-scene="${last.id}"]`).click();
    assert.equal(await page.locator('#stage-title').textContent(), last.title);
    assert.ok(page.url().endsWith(`#watch/${last.id}`));
  });

  await step('Watch: no walkthrough step clips its code, chat, or terminal', async () => {
    const clipped = await page.evaluate((list) => {
      const found = [];
      for (const scene of list) {
        for (let i = 0; i < scene.steps; i++) {
          const ids = window.__studio.renderFrame(scene.id, i, 1);
          if (ids.length) found.push(`${scene.id}/${i}: ${ids.join(', ')}`);
        }
      }
      document.body.classList.remove('capture');
      return found;
    }, scenes.map((scene) => ({ id: scene.id, steps: scene.steps.length })));
    assert.deepEqual(clipped, []);
  });

  await step('Keyboard: number keys switch modes', async () => {
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('2');
    assert.equal(await page.locator('#tab-try').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#view-try').isVisible(), true);
  });

  await step('Try it: typing / opens the command palette', async () => {
    await page.locator('#try-input').click();
    await page.keyboard.type('/');
    await page.waitForSelector('#palette:not([hidden])');
    assert.ok(await page.locator('#palette li').count() > 0);
    assert.equal(await page.locator('#try-input').getAttribute('aria-expanded'), 'true');
  });

  await step('Try it: /ver filters to /verify, Tab picks it, Enter answers with the real prompt file', async () => {
    await page.keyboard.type('ver');
    assert.equal((await page.locator('#palette li .p-name').first().textContent()).trim(), '/verify');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#try-input').inputValue(), '/verify ');
    await page.keyboard.type('all tests pass');
    const before = await page.locator('#try-log .msg.agent').count();
    await page.keyboard.press('Enter');
    await page.waitForFunction((n) => document.querySelectorAll('#try-log .msg.agent').length > n, before);
    const reply = await page.locator('#try-log .msg.agent').last().textContent();
    assert.match(reply, /\/verify - prompt file/);
    assert.match(reply, /Lab commands are not built in\./);
    assert.match(reply, /not a VS Code, Copilot, or Spec Kit command/);
    assert.match(reply, /\.github\/prompts\/verify\.prompt\.md/);
    assert.match(reply, /illustrative/);
    assert.match(reply, /all tests pass/);
  });

  await step('Try it: a built-in alias resolves and warns about auto-approval', async () => {
    await page.locator('#try-input').fill('/yolo');
    await page.locator('#try-input').press('Escape');
    await page.locator('#try-input').press('Enter');
    const reply = await page.locator('#try-log .msg.agent').last().textContent();
    assert.match(reply, /\/autoApprove - built-in/);
    assert.match(reply, /alias for \/autoApprove/);
    assert.match(reply, /Caution/);
  });

  await step('Try it: an unknown command is reported, not invented', async () => {
    await page.locator('#try-input').fill('/make-it-work');
    await page.locator('#try-input').press('Escape');
    await page.locator('#try-input').press('Enter');
    const reply = await page.locator('#try-log .msg.agent').last().textContent();
    assert.match(reply, /No \/make-it-work command here/);
  });

  await step('Try it: a plain prompt suggests commands', async () => {
    await page.locator('#try-input').fill('please verify my change');
    await page.locator('#try-input').press('Enter');
    const reply = await page.locator('#try-log .msg.agent').last();
    assert.match(await reply.textContent(), /a command is a contract/);
    assert.ok(await reply.locator('button.suggest').count() > 0);
  });

  await step('Try it: every example button answers', async () => {
    const examples = page.locator('#try-examples button');
    const count = await examples.count();
    assert.ok(count >= 5);
    for (let i = 0; i < count; i++) {
      const before = await page.locator('#try-log .msg.agent').count();
      await examples.nth(i).click();
      assert.equal(await page.locator('#try-log .msg.agent').count(), before + 1);
      assert.doesNotMatch(await page.locator('#try-log .msg.agent').last().textContent(), /No \/.* command here/);
    }
  });

  await step('Mission: right answer is scored and explained', async () => {
    await page.locator('#tab-mission').click();
    assert.match(await page.locator('#mission-count').textContent(), new RegExp(`of ${missionList.length}`));
    await page.locator('#mission-choices button', { hasText: `/${missionList[0].answer}` }).first().click();
    assert.match(await page.locator('#mission-feedback').textContent(), /Correct/);
    assert.match(await page.locator('#mission-score').textContent(), /Score 1\/1/);
  });

  await step('Mission: wrong answer shows the best fit', async () => {
    await page.locator('#mission-next').click();
    const wrong = missionList[1].choices.find((choice) => choice !== missionList[1].answer);
    await page.locator('#mission-choices button', { hasText: `/${wrong}` }).first().click();
    assert.match(await page.locator('#mission-feedback').textContent(), new RegExp(`best fit is /${missionList[1].answer}`));
    assert.match(await page.locator('#mission-score').textContent(), /Score 1\/2/);
  });

  await step('Mission: restart clears the score', async () => {
    await page.locator('#mission-restart').click();
    assert.match(await page.locator('#mission-score').textContent(), /Score 0\/0/);
  });

  await step(`Commands: lists all ${totalCommands} commands and filters by search and kind`, async () => {
    await page.locator('#tab-commands').click();
    assert.equal(await page.locator('#cmd-count').textContent(), `${totalCommands} of ${totalCommands} commands`);
    await page.locator('#cmd-search').fill('context');
    const shown = Number((await page.locator('#cmd-count').textContent()).split(' ')[0]);
    assert.ok(shown > 0 && shown < totalCommands);
    assert.equal(await page.locator('#cmd-list article').count(), shown);
    await page.locator('#cmd-search').fill('');
    await page.locator('#cmd-kind button[data-value="custom"]').click();
    assert.equal(await page.locator('#cmd-count').textContent(), `${registry.custom.length} of ${totalCommands} commands`);
  });

  await step('Commands: "Try it" on a card jumps to the simulated chat', async () => {
    await page.locator('#cmd-list article').first().locator('button', { hasText: 'Try it' }).click();
    assert.equal(await page.locator('#tab-try').getAttribute('aria-selected'), 'true');
    assert.match(await page.locator('#try-log .msg.agent').last().textContent(), /prompt file/);
  });

  await step('Commands: Copilot app list is shown as a mention only', async () => {
    await page.locator('#tab-commands').click();
    assert.equal(await page.locator('#copilot-app-list li').count(), registry.copilotApp.commands.length);
  });

  await step('Deep links: a hash change switches mode and scene', async () => {
    await page.goto(`${studioUrl}#mission`);
    await page.waitForFunction(() => document.getElementById('tab-mission').getAttribute('aria-selected') === 'true');
    const scene = scenes[1];
    await page.evaluate((id) => { location.hash = `#watch/${id}`; }, scene.id);
    await page.waitForFunction((title) => document.getElementById('stage-title').textContent === title, scene.title);
    assert.equal(await page.locator('#tab-watch').getAttribute('aria-selected'), 'true');
  });

  await step('Deep links: a fresh load of #try opens Try it', async () => {
    await page.goto('about:blank');
    await page.goto(`${studioUrl}#try`);
    await page.waitForSelector('html[data-ready="true"]');
    assert.equal(await page.locator('#tab-try').getAttribute('aria-selected'), 'true');
  });

  await step('No console errors, page errors, or network requests', async () => {
    assert.deepEqual(errors, []);
  });
} finally {
  await browser.close();
}

console.log(results.join('\n'));
console.log(`\n# smoke ${results.length} passed`);
