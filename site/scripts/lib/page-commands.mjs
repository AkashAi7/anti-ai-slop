import { join } from 'node:path';
import { ROOT, esc, inline, urlFrom } from './util.mjs';
import { docOutput } from './data.mjs';
import { PAGES, command, flow, getLab, guideList, page, player } from './layout.mjs';

const label = (item) => `${item.id.slice(0, 2)} - ${item.title}`;
const track = (name) => name[0].toUpperCase() + name.slice(1);

function commandItem(to, cmd) {
  const terms = [cmd.name, ...(cmd.aliases ?? []), cmd.purpose, cmd.antiSlop, cmd.description, cmd.slop, cmd.evidence, cmd.access];
  const search = esc(terms.filter(Boolean).join(' ').toLowerCase());
  const name = esc(cmd.name);
  if (cmd.kind === 'custom') {
    return `<li class="cmd-card" data-kind="custom" data-search="${search}">
<div class="cmd-head"><code class="cmd-name">/${name}</code><span class="badge lab">Lab prompt file</span><span class="badge">${esc(cmd.access)}</span></div>
<p>${inline(cmd.description)}</p>
<dl class="cmd-facts"><div><dt>Slop it targets</dt><dd>${inline(cmd.slop)}</dd></div><div><dt>Evidence you get back</dt><dd>${inline(cmd.evidence)}</dd></div></dl>
<p class="cmd-meta">Where: Local chat with this lab's <code>commands</code> folder open · not built into VS Code or Copilot</p>
<p class="cmd-more"><a href="${to(docOutput(cmd.path))}">Read the prompt file<span class="sr-only">: /${name}</span></a></p>
</li>`;
  }
  const aliases = cmd.aliases?.length ? ` Alias: ${cmd.aliases.map((alias) => `<code>/${esc(alias)}</code>`).join(', ')}.` : '';
  const caution = cmd.caution ? '<span class="badge warn">Caution: removes a safety checkpoint</span>' : '';
  return `<li class="cmd-card${cmd.caution ? ' caution' : ''}" data-kind="built-in" data-search="${search}">
<div class="cmd-head"><code class="cmd-name">/${name}</code><span class="badge">Built-in</span>${caution}</div>
<p>${inline(cmd.purpose)}${aliases}</p>
<p class="why">${inline(cmd.antiSlop)}</p>
<p class="cmd-meta">Example: <code>${esc(cmd.usage)}</code><br>Where: ${esc(cmd.availability)} · <a href="${esc(cmd.doc)}">VS Code docs<span class="sr-only"> for /${name}</span></a></p>
</li>`;
}

function catalog(to, lab) {
  const total = lab.custom.length + lab.builtIns.length;
  const chips = lab.mechanisms.map((m) => `<button type="button" data-filter="${m.id}" aria-pressed="false">${esc(m.title)}</button>`).join('');
  const legend = Object.entries(lab.accessClasses)
    .map(([id, access]) => `<div><dt>${esc(id)}</dt><dd>${inline(access.meaning)}</dd></div>`).join('');
  const sections = lab.mechanisms.map((m) => `<section class="mech" data-mechanism="${m.id}" aria-labelledby="mech-${m.id}">
<h3 id="mech-${m.id}">${esc(m.title)} <span class="mech-tag">${esc(m.tagline)}</span></h3>
<p class="smell"><strong>Slop smell:</strong> ${inline(m.smell)}</p>
<ul class="cmds">
${m.commands.map((cmd) => commandItem(to, cmd)).join('\n')}
</ul>
</section>`).join('\n');
  const app = lab.copilotApp;
  const note = lab.labCommands;
  return `<section class="section wrap" id="catalog" aria-labelledby="catalog-title">
<h2 id="catalog-title">Commands by mechanism</h2>
<p>The ${lab.builtIns.length} built-ins ship with VS Code chat. The ${lab.custom.length} lab commands are this repository's prompt files in <code>commands/.github/prompts</code>, and each one declares only the tools its job needs. Registry as of ${esc(lab.asOf)}.</p>
<div class="callout" role="note"><p><strong>${esc(note.headline)}</strong> ${inline(note.summary)} ${inline(note.where)} <a href="${esc(note.promptFilesDoc)}">VS Code prompt files docs</a></p>
<p>${inline(note.notSpecKit)} <a href="${esc(note.specKitDoc)}">About Spec Kit</a> · <a href="#lab-missing">If a lab command doesn't appear</a></p></div>
<details class="legend"><summary>What the access classes mean</summary><dl>${legend}</dl></details>
<div class="filters" data-catalog-filters hidden>
<div class="filter-search"><label for="cmd-search">Filter commands</label><input id="cmd-search" type="search" placeholder="Try verify, context, or yolo" autocomplete="off" spellcheck="false"></div>
<div class="chips" role="group" aria-label="Mechanism"><button type="button" data-filter="all" aria-pressed="true">All</button>${chips}</div>
<label class="check"><input type="checkbox" id="cmd-custom"> Lab commands only</label>
</div>
<p class="status" id="cmd-status" role="status" data-total="${total}">Showing ${total} of ${total} commands.</p>
<div class="empty" id="cmd-empty" hidden><p>No commands match these filters.</p><button type="button" data-clear>Clear filters</button></div>
${sections}
<section class="app-cmds" aria-labelledby="app-title">
<h3 id="app-title">Also in the GitHub Copilot app</h3>
<p>${inline(app.note)} <a href="${esc(app.doc)}">Copilot app slash commands</a></p>
<ul>
${app.commands.map((cmd) => `<li><code>/${esc(cmd.name)}</code> ${inline(cmd.purpose)}</li>`).join('\n')}
</ul>
</section>
</section>`;
}

export function commandsPage(lab) {
  const file = PAGES.commands;
  const to = (target) => urlFrom(file, target);
  const doc = (...parts) => to(docOutput(join(ROOT, 'commands', ...parts)));
  const studio = to(PAGES.studio);
  const total = lab.custom.length + lab.builtIns.length;
  const exercise = (id) => lab.exercises.find((item) => item.id === id);

  const flows = lab.walkthroughs.map((walk) => `<article class="walk" id="walk-${walk.id}" aria-labelledby="walk-${walk.id}-title">
${player(file, walk)}
<div class="walk-text">
<h3 id="walk-${walk.id}-title">${esc(walk.title)}</h3>
${flow(walk.steps)}
<p>${inline(walk.takeaway)}</p>
<p class="observed">Final frame: <code>${esc(walk.observed)}</code>, the real result of checking the reference solution.</p>
<p><a href="${to(docOutput(exercise(walk.exercise).task))}">Exercise ${esc(label(exercise(walk.exercise)))}</a> · <a href="${studio}#watch/${walk.id}">Step through it in the studio</a></p>
</div>
</article>`).join('\n');

  const rows = lab.exercises.map((item) => `<tr><td>${item.id.slice(0, 2)}</td><td><a href="${to(docOutput(item.task))}">${esc(item.title)}</a></td><td>${track(item.track)}</td><td>${flow(item.steps)}</td><td>${item.baseline.pass} of ${item.baseline.total} checks pass</td></tr>`).join('\n');

  const body = `<section class="intro wrap">
<div class="intro-text">
<p class="eyebrow">Commands lab</p>
<h1>Type <code>/</code>. Pick a contract. Get evidence back.</h1>
<p class="lead">Practice cutting AI slop with VS Code chat slash commands: built-ins such as <code>/plan</code>, <code>/compact</code>, and <code>/disableAutoApprove</code>, plus ${lab.custom.length} lab commands such as <code>/clarify</code> and <code>/verify</code>. The lab commands are prompt files in this repository, not built into VS Code or Copilot.</p>
<div class="actions">
<a class="button primary" href="${studio}">Open the Command Studio</a>
<a class="button" href="${doc('README.md')}">Read the lab guide</a>
<a class="button ghost" href="${doc('COMMANDS.md')}">Command reference</a>
</div>
</div>
<div class="intro-media">
${player(file, lab.tour, 'Command Studio tour')}
</div>
<ul class="facts">
<li><strong>${total}</strong> commands: ${lab.builtIns.length} built-in, ${lab.custom.length} lab prompt files</li>
<li><strong>${lab.exercises.length}</strong> exercises with real checks</li>
<li><strong>${lab.gifCount}</strong> GIF walkthroughs</li>
<li><strong>${lab.missions}</strong> slop smells in Mission mode</li>
</ul>
</section>

<nav class="wrap jump" aria-label="On this page"><a href="#start">Start</a><a href="#studio">Command Studio</a><a href="#flows">Flows</a><a href="#catalog">Commands</a><a href="#exercises">Exercises</a><a href="#guides">Guides</a></nav>

<section class="section wrap" id="start" aria-labelledby="start-title">
<h2 id="start-title">Start in five steps</h2>
<p>You need Node.js 22.20+ and VS Code with GitHub Copilot Chat in agent mode, allowed by your organization. The guide, the studio, and the exercises need no npm install.</p>
${getLab('commands')}
<ol class="steps">
<li>In VS Code, use <strong>File &gt; Open Folder</strong> and open the downloaded <code>commands</code> folder, not the repository root or any parent folder. The lab commands are prompt files in <code>commands/.github/prompts</code>, and VS Code loads them only when this folder is the workspace root. Run the following commands in that folder's integrated terminal.</li>
<li>Open the Command Studio. It runs offline from a local file.${command('npm.cmd run studio')}</li>
<li>Start the terminal guide, choose <code>01-clarify-before-code</code>, then run <code>setup</code>, <code>baseline</code>, and <code>prompt</code>.${command('npm.cmd run demo')}</li>
<li>In the Chat view, set the <strong>Session Target</strong> to <strong>Local</strong> and use agent mode. Type <code>/clarify</code>. It runs the lab's <code>clarify.prompt.md</code>; it isn't a built-in or a Spec Kit command. Paste the prompt and answer the agent's questions in your own words.</li>
<li>Check your work.${command('npm.cmd run check -- 01-clarify-before-code')}</li>
</ol>
<p class="note">On shells other than PowerShell, use <code>npm</code> in place of <code>npm.cmd</code>.</p>
<h3 id="lab-missing">If a lab command doesn't appear</h3>
<p>Built-ins such as <code>/plan</code> and <code>/clear</code> don't depend on these files. The lab commands need VS Code to find the prompt files. Check these in order:</p>
<ol class="steps">
${lab.labCommands.troubleshoot.map((step) => `<li>${inline(step)}</li>`).join('\n')}
</ol>
<p>More detail: <a href="${doc('COMMANDS.md')}#if-a-lab-command-doesnt-appear">If a lab command doesn't appear</a> in the command reference.</p>
</section>

<section class="section wrap" id="studio" aria-labelledby="studio-title">
<h2 id="studio-title">The Command Studio</h2>
<p>An interactive single page that runs offline. It makes no network requests and sends nothing to a model. Open a mode directly:</p>
<div class="table-wrap" role="region" aria-label="Table: Command Studio modes" tabindex="0">
<table>
<thead><tr><th scope="col">Mode</th><th scope="col">What you do</th></tr></thead>
<tbody>
<tr><td><a href="${studio}#watch/${lab.walkthroughs[0].id}">1 Watch</a></td><td>Step through or play the ${lab.walkthroughs.length} walkthroughs. These are the scenes the GIFs are recorded from.</td></tr>
<tr><td><a href="${studio}#try">2 Try it</a></td><td>A simulated chat box. Type <code>/</code> to open the palette, then press Tab to fill in a command and Enter to send it. Lab commands show their real prompt file, a "not built in" note, and a scripted sample answer.</td></tr>
<tr><td><a href="${studio}#mission">3 Mission</a></td><td>${lab.missions} slop smells. Pick the command that fixes each one, then read why.</td></tr>
<tr><td><a href="${studio}#commands">4 Commands</a></td><td>Search and filter all ${total} commands by mechanism and kind.</td></tr>
</tbody>
</table>
</div>
</section>

<section class="section wrap" id="flows" aria-labelledby="flows-title">
<h2 id="flows-title">${lab.walkthroughs.length} command flows</h2>
<p>Each walkthrough replays one exercise: the slop, the command flow, then the evidence. ${esc(lab.disclaimer)}. The code in the last frame is based on the real reference solution, and the check result shown with it is real: the recorder re-runs the checks before every capture.</p>
${flows}
</section>

${catalog(to, lab)}

<section class="section wrap" id="exercises" aria-labelledby="exercises-title">
<h2 id="exercises-title">Exercises</h2>
<p>Every exercise ships a deliberately defective starter. The baseline is what <code>npm run check -- &lt;id&gt; --baseline</code> reports for that starter, and <code>npm test</code> enforces it.</p>
<div class="table-wrap" role="region" aria-label="Table: commands lab exercises" tabindex="0">
<table>
<thead><tr><th scope="col">#</th><th scope="col">Exercise</th><th scope="col">Track</th><th scope="col">Command flow</th><th scope="col">Starter baseline</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
<p>Edit only your learner copy under <code>work/&lt;id&gt;</code>. Don't edit <code>checks.mjs</code>. Keep <code>solution/</code> closed until you've made an attempt.</p>
</section>

<section class="section wrap" id="guides" aria-labelledby="guides-title">
<h2 id="guides-title">Guides</h2>
${guideList(file, [
    [docOutput(join(ROOT, 'commands', 'README.md')), 'Lab guide', 'Setup, every lab command, how slash commands work in VS Code, and the honesty rules.'],
    [docOutput(join(ROOT, 'commands', 'labs', 'beginner.md')), 'Beginner track', 'Exercises 01-04: `/clarify` → `/spec` → `/plan`, `/ground`, `/fail-paths` → `/verify`, `/handoff` → `/clear`.'],
    [docOutput(join(ROOT, 'commands', 'labs', 'advanced.md')), 'Advanced track', 'Exercises 05-08: `/deps-check`, `/deslop` → `/simplify`, `/scope` → `/pre-commit`, `/root-cause`.'],
    [docOutput(join(ROOT, 'commands', 'demo', 'README.md')), 'Presenter walkthrough', 'A repeatable 15-minute live demo built on the studio, the GIFs, and one real exercise.'],
    [docOutput(join(ROOT, 'commands', 'labs', 'facilitator.md')), 'Facilitator guide', 'Agenda, expected baselines, recovery steps, and a checklist for a live VS Code session.'],
    [docOutput(join(ROOT, 'commands', 'COMMANDS.md')), 'Command reference', 'Every command, the flow to use it in, its access class, and how to reuse the prompt files in your own repo.'],
    [docOutput(join(ROOT, 'commands', 'VERIFICATION.md')), 'Verification record', 'What was actually run to check this lab, and what is still a manual check.'],
  ])}
</section>`;

  return page({ file, title: 'Commands lab', active: 'commands', body,
    description: 'Commands - Anti-Slop Lab: VS Code chat /commands such as /plan, /verify, and /handoff as anti-slop checkpoints, with an offline Command Studio, GIF walkthroughs, and graded exercises.' });
}
