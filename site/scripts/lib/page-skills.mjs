import { join } from 'node:path';
import { ROOT, esc, inline, urlFrom } from './util.mjs';
import { docOutput } from './data.mjs';
import { PAGES, command, flow, getLab, guideList, page, player } from './layout.mjs';

const label = (item) => `${item.id.slice(0, 2)} - ${item.title}`;
const track = (name) => name[0].toUpperCase() + name.slice(1);

export function skillsPage(lab) {
  const file = PAGES.skills;
  const to = (target) => urlFrom(file, target);
  const doc = (...parts) => to(docOutput(join(ROOT, 'skills', ...parts)));
  const exercise = (id) => lab.exercises.find((item) => item.id === id);

  const flows = lab.walkthroughs.map((walk) => `<article class="walk" id="walk-${walk.id}" aria-labelledby="walk-${walk.id}-title">
${player(file, walk)}
<div class="walk-text">
<h3 id="walk-${walk.id}-title">${esc(walk.title)}</h3>
${flow(walk.steps)}
<p>${inline(walk.takeaway)}</p>
<p><a href="${to(docOutput(exercise(walk.exercise).task))}">Exercise ${esc(label(exercise(walk.exercise)))}</a></p>
</div>
</article>`).join('\n');

  const skillRows = lab.skills.map((skill) => `<tr><td>${inline(skill.before)}</td><td><a href="${to(docOutput(skill.path))}"><code>/${esc(skill.name)}</code></a>${skill.explicitOnly ? ' <span class="badge">Explicit invocation only</span>' : ''}</td><td>${inline(skill.after)}</td></tr>`).join('\n');

  const rows = lab.exercises.map((item) => `<tr><td>${item.id.slice(0, 2)}</td><td><a href="${to(docOutput(item.task))}">${esc(item.title)}</a></td><td>${track(item.track)}</td><td>${flow(item.steps)}</td><td>${item.baseline.pass} of ${item.baseline.total} checks pass</td></tr>`).join('\n');

  const body = `<section class="intro wrap">
<div class="intro-text">
<p class="eyebrow">Skills lab</p>
<h1>Better questions. Smaller changes. Real evidence.</h1>
<p class="lead">Practice replacing plausible-but-wrong output with reliable engineering workflows, using ${lab.skills.length} reusable agent skills in <code>.github/skills</code>. Skills guide the agent. Tests and human review verify the result.</p>
<div class="actions">
<a class="button primary" href="#start">Start the lab</a>
<a class="button" href="${doc('README.md')}">Read the lab guide</a>
<a class="button ghost" href="${doc('SKILLS.md')}">Skill chooser</a>
</div>
</div>
<div class="intro-media">
${player(file, lab.walkthroughs[0])}
</div>
<ul class="facts">
<li><strong>${lab.skills.length}</strong> reusable skills</li>
<li><strong>${lab.exercises.length}</strong> exercises with real checks</li>
<li><strong>${lab.gifCount}</strong> GIF walkthroughs</li>
<li><strong>1</strong> interactive terminal guide</li>
</ul>
</section>

<nav class="wrap jump" aria-label="On this page"><a href="#start">Start</a><a href="#flows">Walkthroughs</a><a href="#skills">Skills</a><a href="#exercises">Exercises</a><a href="#guides">Guides</a></nav>

<section class="section wrap" id="start" aria-labelledby="start-title">
<h2 id="start-title">Start in five steps</h2>
<p>You need Node.js 22.20+ and VS Code with GitHub Copilot Chat in agent mode, allowed by your organization. The guide, the exercises, and <code>npm test</code> need no npm install.</p>
${getLab('skills')}
<ol class="steps">
<li>In VS Code, use <strong>File &gt; Open Folder</strong> and open the downloaded <code>skills</code> folder, not its parent. Review workspace trust before you enable agent tools. Run the following commands in that folder's integrated terminal.</li>
<li>Start the interactive terminal guide.${command('npm.cmd run demo')}</li>
<li>Choose <code>01-clarify</code>, then run <code>setup</code>, <code>baseline</code>, and <code>prompt</code>.</li>
<li>Paste the prompt into a <strong>fresh Copilot chat</strong> and attach only the task and learner files. Answer the agent's questions yourself. The guide does not simulate or automate Copilot.</li>
<li>Check your work.${command('npm.cmd run check -- 01-clarify')}</li>
</ol>
<p class="note">On shells other than PowerShell, use <code>npm</code> in place of <code>npm.cmd</code>. A skill is not a deterministic safety boundary and does not guarantee correct output.</p>
</section>

<section class="section wrap" id="flows" aria-labelledby="flows-title">
<h2 id="flows-title">${lab.walkthroughs.length} skill walkthroughs</h2>
<p>${esc(lab.disclaimer)}. Every frame is an illustrative recreation. Each GIF also has a text transcript and static before and after frames.</p>
${flows}
</section>

<section class="section wrap" id="skills" aria-labelledby="skills-title">
<h2 id="skills-title">The ${lab.skills.length} skills</h2>
<p>Type the skill name after <code>/</code> in a fresh chat. Most skills can also be picked automatically from their description, but automatic selection varies, so test it on its own.</p>
<div class="table-wrap" role="region" aria-label="Table: skills, the slop they target, and the evidence they ask for" tabindex="0">
<table>
<thead><tr><th scope="col">Before</th><th scope="col">Skill</th><th scope="col">Evidence after</th></tr></thead>
<tbody>
${skillRows}
</tbody>
</table>
</div>
<p>To reuse a skill, review its whole folder and copy it to <code>.github/skills/&lt;name&gt;</code> in your own project. Keep the license notices. <a href="${doc('SKILLS.md')}#reuse-and-composition">Reuse and composition</a></p>
</section>

<section class="section wrap" id="exercises" aria-labelledby="exercises-title">
<h2 id="exercises-title">Exercises</h2>
<p>Every exercise ships a deliberately defective starter. The baseline is what <code>npm run check -- &lt;id&gt; --baseline</code> reports for that starter, and <code>npm test</code> enforces it.</p>
<div class="table-wrap" role="region" aria-label="Table: skills lab exercises" tabindex="0">
<table>
<thead><tr><th scope="col">#</th><th scope="col">Exercise</th><th scope="col">Track</th><th scope="col">Skill flow</th><th scope="col">Starter baseline</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
<p>Edit only your learner copy under <code>work/&lt;id&gt;</code> and the files the task allows. Keep the acceptance checks unchanged.</p>
</section>

<section class="section wrap" id="guides" aria-labelledby="guides-title">
<h2 id="guides-title">Guides</h2>
${guideList(file, [
    [docOutput(join(ROOT, 'skills', 'README.md')), 'Lab guide', 'Setup, the interactive guide, all the skills, and how to find and reuse them.'],
    [docOutput(join(ROOT, 'skills', 'labs', 'beginner.md')), 'Beginner track', 'Clarify requests, ground claims, write meaningful tests, and remove unneeded complexity.'],
    [docOutput(join(ROOT, 'skills', 'labs', 'advanced.md')), 'Advanced track', 'Trace root causes, test failure paths, challenge review feedback, and prove completion.'],
    [docOutput(join(ROOT, 'skills', 'demo', 'README.md')), 'Presenter walkthrough', 'A repeatable live demo with real participant decisions and real test output.'],
    [docOutput(join(ROOT, 'skills', 'labs', 'facilitator.md')), 'Facilitator guide', 'Expected failures, human rubrics, recovery steps, and a checklist for verifying the client.'],
    [docOutput(join(ROOT, 'skills', 'SKILLS.md')), 'Skill chooser', 'Pick the right skill, reuse it, and inspect the reviewed upstream sources.'],
    [docOutput(join(ROOT, 'skills', 'VERIFICATION.md')), 'Verification record', 'What was actually run to check this lab, and its limits.'],
    [docOutput(join(ROOT, 'skills', 'THIRD-PARTY-NOTICES.md')), 'Third-party notices', 'Licenses for the adapted upstream skills.'],
  ])}
</section>`;

  return page({ file, title: 'Skills lab', active: 'skills', body,
    description: 'Skills - Anti-Slop Lab: 12 reusable GitHub Copilot agent skills such as /grill-me and /evidence-first, with an interactive terminal guide, GIF walkthroughs, and graded exercises.' });
}
