import { join } from 'node:path';
import { ROOT, esc, urlFrom } from './util.mjs';
import { docOutput } from './data.mjs';
import { DOWNLOAD, PAGES, REPOSITORY, command, page, player } from './layout.mjs';

export function homePage({ commands, skills }) {
  const file = PAGES.home;
  const to = (target) => urlFrom(file, target);
  const doc = (...parts) => to(docOutput(join(ROOT, ...parts)));
  const commandCount = commands.custom.length + commands.builtIns.length;
  const track = (lab, name) => lab.exercises.filter((item) => item.track === name).length;
  const gallery = [
    ...commands.walkthroughs.map((walk) => ({ walk, lab: 'Commands lab', href: `${to(PAGES.commands)}#walk-${walk.id}` })),
    ...skills.walkthroughs.map((walk) => ({ walk, lab: 'Skills lab', href: `${to(PAGES.skills)}#walk-${walk.id}` })),
  ];

  const body = `<section class="intro wrap">
<div class="intro-text">
<p class="eyebrow">VS Code + GitHub Copilot</p>
<h1>Anti-Slop Labs</h1>
<p class="lead">Two hands-on labs that replace plausible-but-wrong AI output with checked work: ask before building, ground every claim in the repo, prove it with tests, and hand off honestly.</p>
<div class="actions">
<a class="button primary" href="${to(PAGES.commands)}">Start the Commands lab</a>
<a class="button" href="${to(PAGES.skills)}">Start the Skills lab</a>
<a class="button ghost" href="${to(PAGES.studio)}">Open the Command Studio</a>
</div>
<p><a href="#get-lab">Get the exercise files and prerequisites</a></p>
<p class="note">This site and the Command Studio send nothing to a model. After you clone the repository, both also open offline from local files.</p>
</div>
<div class="intro-media">
${player(file, commands.tour, 'Command Studio tour')}
</div>
</section>

<section class="section wrap" aria-labelledby="pick">
<h2 id="pick">Pick a lab</h2>
<p>Both labs target the same kinds of slop with the same habits. They differ in how you invoke a habit: a chat <code>/command</code> or an agent skill.</p>
<div class="table-wrap" role="region" aria-label="Table: lab comparison" tabindex="0">
<table class="compare">
<thead><tr><th scope="col"><span class="sr-only">Topic</span></th><th scope="col"><a href="${to(PAGES.commands)}">Commands lab</a></th><th scope="col"><a href="${to(PAGES.skills)}">Skills lab</a></th></tr></thead>
<tbody>
<tr><th scope="row">You type</th><td><code>/plan</code>, <code>/verify</code>, <code>/handoff</code>: chat slash commands</td><td><code>/grill-me</code>, <code>/evidence-first</code>: agent skills</td></tr>
<tr><th scope="row">What ships</th><td>${commands.custom.length} custom commands as prompt files, plus a guide to ${commands.builtIns.length} built-ins (${commandCount} in all)</td><td>${skills.skills.length} reusable skills in <code>.github/skills</code></td></tr>
<tr><th scope="row">Exercises</th><td>${commands.exercises.length}: ${track(commands, 'beginner')} beginner, ${track(commands, 'advanced')} advanced</td><td>${skills.exercises.length}: ${track(skills, 'beginner')} beginner, ${track(skills, 'advanced')} advanced</td></tr>
<tr><th scope="row">Walkthroughs</th><td>${commands.gifCount} GIFs</td><td>${skills.gifCount} GIFs</td></tr>
<tr><th scope="row">Interactive demo</th><td>The Command Studio in your browser, plus a terminal guide</td><td>A terminal guide (<code>npm run demo</code>)</td></tr>
<tr><th scope="row">Full guide</th><td><a href="${doc('commands', 'README.md')}">Commands lab README</a></td><td><a href="${doc('skills', 'README.md')}">Skills lab README</a></td></tr>
</tbody>
</table>
</div>
</section>

<section class="section wrap" id="get-lab" aria-labelledby="get-lab-title">
<h2 id="get-lab-title">Get the labs. Run the exercises locally.</h2>
<p>The <a href="${REPOSITORY}">anti-ai-slop GitHub repository</a> includes both labs: starter code, acceptance checks, hints, reference solutions, prompt files, skills, GIFs, and guides.</p>
<div class="actions"><a class="button primary" href="${REPOSITORY}">View GitHub repository</a><a class="button" href="${DOWNLOAD}">Download exercises (ZIP)</a></div>
<h3>Prerequisites</h3>
<ul class="rules">
<li><strong>Browse the demos:</strong> just a current browser. No install, account, or API key is needed.</li>
<li><strong>Run the exercises:</strong> <a href="https://nodejs.org/en/download">Node.js 22.20+</a> (includes npm).</li>
<li><strong>Practice with Copilot:</strong> <a href="https://code.visualstudio.com/download">VS Code</a> and signed-in GitHub Copilot Chat with agent access allowed by your organization. Copilot needs its normal network access and entitlement.</li>
<li><strong>Get the files:</strong> Git, or download and extract the ZIP. Software and Copilot access are not bundled in the repository.</li>
</ul>
${command(`git clone ${REPOSITORY}.git\ncd anti-ai-slop`)}
<p>Open either the <code>commands</code> or <code>skills</code> folder itself in VS Code, not the repository root. For a ZIP download, these folders are inside <code>anti-ai-slop-main</code>. Then follow the <a href="${to(PAGES.commands)}#start">Commands setup</a> or <a href="${to(PAGES.skills)}#start">Skills setup</a>.</p>
<p class="note">Learner exercises need no npm install, Azure subscription, backend, or paid API key. GitHub Pages hosts the website, not a terminal or live Copilot session.</p>
</section>

<section class="section wrap" aria-labelledby="loop">
<h2 id="loop">The loop for every exercise</h2>
<p>Every exercise ships a deliberately defective starter, so the demo never depends on talking a model into writing bad code.</p>
<ol class="loop">
<li><h3>Set up</h3><p>Copy the starter to your own learner folder. It never overwrites an existing copy.</p>${command('npm run setup -- <exercise-id>')}</li>
<li><h3>See it fail</h3><p>Confirm the starter fails exactly the intended checks.</p>${command('npm run check -- <exercise-id> --baseline')}</li>
<li><h3>Invoke the habit</h3><p>Paste the exercise prompt into Copilot agent mode. It starts with the command or skill to use.</p></li>
<li><h3>Review</h3><p>Answer the agent's questions yourself. Reject claims that come without evidence.</p></li>
<li><h3>Prove it</h3><p>The check passes only when the tests do. Your review decides the rest.</p>${command('npm run check -- <exercise-id>')}</li>
</ol>
</section>

<section class="section wrap" aria-labelledby="watch">
<h2 id="watch">Watch the walkthroughs</h2>
<p>${gallery.length} illustrative walkthroughs: ${commands.walkthroughs.length} command flows and ${skills.walkthroughs.length} skill flows. Each one replays a real exercise, from the slop to the evidence.</p>
<ul class="gallery">
${gallery.map(({ walk, lab, href }) => `<li><a href="${href}"><img src="${to(walk.poster)}" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="gallery-lab">${lab}</span><span class="gallery-title">${esc(walk.title)}</span></a></li>`).join('\n')}
</ul>
</section>

<section class="section wrap" aria-labelledby="honest">
<h2 id="honest">Honesty rules</h2>
<ul class="rules">
<li>Walkthroughs are illustrative recreations, not recorded Copilot output. In the Commands lab, the check output in each final frame is real: the recorder re-runs the checks before every capture.</li>
<li>A command or a skill guides the agent. It doesn't guarantee correct output. Tests and your own review decide whether the work is done.</li>
<li><code>/autoApprove</code> (alias <code>/yolo</code>) removes a human checkpoint. The labs list it so you can recognize it, and teach <code>/disableAutoApprove</code> instead.</li>
<li>No productivity statistics. Each lab's verification record lists only what was actually run.</li>
</ul>
</section>`;

  return page({ file, title: 'Anti-Slop Labs', active: 'home', body,
    description: 'Anti-Slop Labs: hands-on VS Code and GitHub Copilot labs that cut AI slop with chat /commands and agent skills.' });
}
