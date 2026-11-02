import { DOWNLOADS, REPOSITORY, esc, inline, urlFrom } from './util.mjs';
import { transcriptOutput } from './data.mjs';
import { PAGES, command, flow, page, player, toc } from './layout.mjs';

const LAB_INTRO = {
  'lab-1': {
    short: '/commands + Spec Kit',
    minutes: '75 minutes',
    summary: 'Use the built-in slash commands that keep an agent grounded in your code, then build a feature the spec-driven way with GitHub Spec Kit: constitution, specify, clarify, plan, tasks, implement, converge.',
    invoke: ['/explain', '/plan', '/tests', '/fix', '/review', '/rubber-duck', '/compact', '/speckit.specify', '/speckit.plan', '/speckit.implement'],
  },
  'lab-2': {
    short: 'anti-slop skills',
    minutes: '60-75 minutes',
    summary: 'Find skills with your client\'s built-in skill tools, load ten pinned public skill folders, then practice grilling, evidence-led debugging, meaningful tests, verification and polish.',
    invoke: ['/skills', '/af', '/skills reload', '/grill-me', '/systematic-debugging', '/test-driven-development', '/verification-before-completion'],
  },
};

const CLIENTS = 'VS Code + GitHub Copilot app';
const HERO = 'builtin-tests-fix';

const codes = (items) => `<ul class="code-list">${items.map((item) => `<li><code>${esc(item)}</code></li>`).join('')}</ul>`;

function downloadButtons(file, { gifs = false } = {}) {
  const to = (target) => urlFrom(file, target);
  return `<p class="actions downloads">
<a class="button primary" href="${to(DOWNLOADS.lab)}" download>Download the lab (ZIP)</a>
<a class="button" href="${to(DOWNLOADS.skills)}" download>Public skills only (ZIP)</a>${gifs ? `
<a class="button" href="${to(DOWNLOADS.gifs)}" download>All GIFs (ZIP)</a>` : ''}
<a class="button ghost" href="${REPOSITORY}">GitHub repository</a>
</p>`;
}

export function homePage(lab) {
  const file = PAGES.home;
  const to = (target) => urlFrom(file, target);
  const hero = lab.walkthroughs.find(({ id }) => id === HERO);
  const [skillsLab] = lab.labs.filter(({ id }) => id === 'lab-2');

  const cards = lab.labs.map((item) => {
    const intro = LAB_INTRO[item.id];
    const href = to(PAGES[item.id]);
    const poster = item.walkthroughs.find((walk) => walk.observed.startsWith('Real reference')) ?? item.walkthroughs[0];
    return `<li class="lab-card">
<a class="lab-card-media" href="${href}" tabindex="-1" aria-hidden="true"><img src="${to(poster.after)}" alt="" width="1280" height="720" loading="lazy" decoding="async"></a>
<div class="lab-card-body">
<p class="eyebrow">${esc(item.title.split(':')[0])} · ${esc(intro.minutes)}</p>
<h3><a href="${href}">${esc(intro.short)}</a></h3>
<p>${esc(intro.summary)}</p>
<p class="note">You invoke</p>
${codes(intro.invoke)}
<p class="actions"><a class="button primary" href="${href}">Open ${esc(item.title.split(':')[0])}</a><a class="button" href="${href}#watch">Watch ${item.walkthroughs.length} GIFs</a></p>
</div>
</li>`;
  }).join('\n');

  const skills = [
    ...lab.publicSkills,
    { name: 'grilling', job: 'Provides the structured interview used by /grill-me.' },
  ].map((skill) =>
    `<tr><th scope="row"><code>/${esc(skill.name)}</code></th><td>${inline(skill.job)}</td></tr>`).join('\n');
  const skillCount = lab.skillPack.sources.reduce((total, source) => total + Object.keys(source.skills).length, 0);
  const skillSources = lab.skillPack.sources.map((source) => {
    const repository = source.repository.replace('https://github.com/', '');
    return `<a href="${esc(source.repository)}">${esc(repository)}</a> @ <code>${esc(source.commit.slice(0, 7))}</code> (${esc(source.license)})`;
  }).join('; ');

  const body = `<section class="wrap intro" aria-labelledby="intro-title">
<div>
<p class="eyebrow">GitHub Copilot hands-on labs · ${esc(CLIENTS)}</p>
<h1 id="intro-title">Less AI slop. More proof.</h1>
<p class="lead">Two hands-on labs. Practice the built-in <code>/commands</code> and Spec Kit, then the skills that stop guessed fixes, tests that prove nothing and unverified "done" claims. Every exercise starts from broken code and ends with an independent check.</p>
<p class="actions"><a class="button primary" href="#setup">Set up the lab</a><a class="button" href="${to(PAGES['lab-1'])}">Lab 1</a><a class="button" href="${to(PAGES['lab-2'])}">Lab 2</a></p>
<p class="note">Runs locally in VS Code or the GitHub Copilot desktop app. No npm install, API key or cloud resource.</p>
</div>
${player(file, hero, { eager: true })}
<ul class="facts">
<li><strong>${lab.labs.length}</strong>hands-on labs</li>
<li><strong>${lab.walkthroughs.length}</strong>GIF walkthroughs</li>
<li><strong>${skillCount}</strong>skill folders, pinned and hash-checked</li>
<li><strong>0</strong>npm installs for learners</li>
</ul>
</section>

<section class="wrap section" id="labs" aria-labelledby="labs-title">
<h2 id="labs-title">The two labs</h2>
<p>Do them in order or pick one. Both share the same local environment and work in either client.</p>
<ul class="lab-cards">
${cards}
</ul>
</section>

<section class="wrap section" id="setup" aria-labelledby="setup-title">
<h2 id="setup-title">Set up your lab</h2>
<ol class="steps">
<li><h3>Install the prerequisites</h3>
<p><a href="https://nodejs.org/en/download">Node.js 22.20+</a> and <a href="https://git-scm.com/downloads">Git</a>, plus <a href="https://code.visualstudio.com/download">VS Code</a> signed in to GitHub Copilot <strong>or</strong> the GitHub Copilot app. Lab 1's Spec Kit part also needs <a href="https://docs.astral.sh/uv/getting-started/installation/">uv</a>.</p></li>
<li><h3>Get the lab</h3>
<p>The ZIP holds the broken starters, the independent checks and ten pinned public skill folders. Extract it and open a terminal in the <code>anti-slop-lab</code> folder.</p>
${downloadButtons(file)}
<p class="note">Or clone it:</p>
${command(`git clone ${REPOSITORY}.git\ncd anti-ai-slop/lab`)}</li>
<li><h3>Check your machine and create a workspace</h3>
<p>Each track gets a fresh Git repository under <code>work/</code> with the broken starter and a baseline commit.</p>
${command('npm.cmd run doctor -- builtins\nnpm.cmd run setup -- builtins')}
<p class="note">Tracks: <code>builtins</code>, <code>spec-kit</code>, <code>spec-kit-skills</code> (Lab 1) and <code>skills</code> (Lab 2). On macOS or Linux, use <code>npm</code>.</p></li>
<li><h3>Open the workspace in your client</h3>
<div class="table-wrap" role="region" aria-label="Table: Client, Open the workspace, Then" tabindex="0"><table>
<thead><tr><th>Client</th><th>Open the workspace</th><th>Then</th></tr></thead>
<tbody>
<tr><th scope="row">VS Code</th><td><code>code -n ./work/builtins</code>, or File &gt; Open Folder</td><td>Start a <strong>Local</strong> chat session and type <code>/</code></td></tr>
<tr><th scope="row">GitHub Copilot app</th><td>Add the <code>work/builtins</code> folder as a local repository</td><td>Start an <strong>Interactive</strong> session and type <code>/</code></td></tr>
</tbody></table></div></li>
</ol>
<p><a href="${to(PAGES.setup)}">Full setup guide: every track, the baseline check and troubleshooting</a></p>
</section>

<section class="wrap section" id="load-skills" aria-labelledby="skills-title">
<h2 id="skills-title">Load the anti-slop skills</h2>
<p>${esc(skillsLab.title)} bundles ${skillCount} public skill folders from five pinned repositories (${Object.keys(lab.skillPack.files).length} SHA-256-checked files). Sources: ${skillSources}. They are public skills, not Copilot built-ins.</p>
<div class="table-wrap" role="region" aria-label="Table: Skill, Slop it prevents" tabindex="0"><table>
<thead><tr><th>Skill</th><th>Slop it prevents</th></tr></thead>
<tbody>
${skills}
</tbody></table></div>
<ol class="steps">
<li><h3>Bundled with the lab (fastest)</h3>
<p>Copies the pinned skill folders into <code>work/skills/.github/skills</code> and checks all ${Object.keys(lab.skillPack.files).length} files against SHA-256 hashes. No network needed.</p>
${command('npm.cmd run setup -- skills\nnpm.cmd run skills')}</li>
<li><h3>Your own project</h3>
<p>Download the <a href="${to(DOWNLOADS.skills)}" download>public skills ZIP</a> and copy its <code>.github</code> folder into your repository root. Or fetch the latest upstream with the skills CLI, then review what it installed:</p>
${command('npx skills add mattpocock/skills --skill grill-me --skill grilling -a github-copilot')}</li>
<li><h3>Confirm the client loaded them</h3>
<p>VS Code: <code>/skills</code> opens Configure Skills. GitHub Copilot app: <code>/skills reload</code>, then <code>/skills</code>. Every skill must point at the workspace copy.</p></li>
</ol>
<p><a href="${to(PAGES['lab-2'])}#part-b-load-the-public-skills">Lab 2, Part B: all loading options and checks</a></p>
</section>

<section class="wrap section" id="workshop" aria-labelledby="workshop-title">
<h2 id="workshop-title">Running it as a workshop</h2>
<ul class="guides">
<li><a href="${to(PAGES.facilitator)}">Facilitator run sheet</a><span>Timings for both labs, stop conditions and a learner completion card.</span></li>
<li><a href="${to(DOWNLOADS.gifs)}" download>All ${lab.walkthroughs.length} walkthrough GIFs (ZIP)</a><span>GIFs, before and after posters, and transcripts for slides or offline demos.</span></li>
<li><a href="${to(PAGES.verification)}">Verification and limitations</a><span>What the automated checks prove, and what they do not.</span></li>
</ul>
</section>`;

  return page({
    file,
    title: 'Anti-Slop Labs',
    description: 'Two hands-on GitHub Copilot labs: built-in /commands with Spec Kit, and skills that cut AI slop. Runs locally in VS Code or the GitHub Copilot app.',
    active: 'home',
    body,
  });
}

function walkthrough(file, walk, index) {
  return `<article class="walk" id="walk-${walk.id}" aria-labelledby="walk-${walk.id}-title">
${player(file, walk)}
<div class="walk-text">
<p class="eyebrow">GIF ${index + 1} · ${esc(walk.client)}</p>
<h3 id="walk-${walk.id}-title">${esc(walk.title)}</h3>
${flow(walk.steps)}
<p>${inline(walk.takeaway)}</p>
<p class="observed">${esc(walk.observed)}</p>
</div>
</article>`;
}

export function labPage(lab, item, doc) {
  const file = PAGES[item.id];
  const to = (target) => urlFrom(file, target);
  const intro = LAB_INTRO[item.id];
  const body = `<div class="wrap">
<header class="page-head">
<p class="eyebrow">${esc(intro.minutes)} · ${esc(CLIENTS)}</p>
<h1>${doc.title}</h1>
<p class="lead">${esc(intro.summary)}</p>
<p class="actions"><a class="button primary" href="#watch">Watch the walkthroughs</a><a class="button" href="${to(PAGES.setup)}">Set up first</a><a class="button" href="${to(DOWNLOADS.lab)}" download>Download the lab (ZIP)</a></p>
</header>
<section class="section" id="watch" aria-labelledby="watch-title">
<h2 id="watch-title">Watch first: ${item.walkthroughs.length} walkthroughs</h2>
<p class="note">${esc(lab.disclaimer)} Select a poster to play it full screen.</p>
${item.walkthroughs.map((walk, index) => walkthrough(file, walk, index)).join('\n')}
</section>
<div class="doc-layout">
<article class="prose" aria-label="${esc(item.title)} guide">
${doc.html}
</article>
${toc([{ id: 'watch', label: 'Watch the walkthroughs' }, ...doc.toc])}
</div>
</div>`;
  return page({ file, title: esc(item.title), description: intro.summary, active: item.id, body });
}

const DOC_PAGES = {
  setup: { eyebrow: 'Start here · both labs', description: 'Set up the local anti-slop lab environment for VS Code or the GitHub Copilot app.', downloads: true },
  facilitator: { eyebrow: 'For workshop leads', description: 'Run sheet for both anti-slop labs: timings, stop conditions and a learner completion card.' },
  verification: { eyebrow: 'Evidence', description: 'What the anti-slop lab checks establish, and what they do not.' },
  notices: { eyebrow: 'Licenses', description: 'Third-party notices for the public skills bundled with the anti-slop lab.' },
};

export function docPage(id, doc) {
  const file = PAGES[id];
  const meta = DOC_PAGES[id];
  const body = `<div class="wrap">
<header class="page-head">
<p class="eyebrow">${esc(meta.eyebrow)}</p>
<h1>${doc.title}</h1>
${meta.downloads ? downloadButtons(file, { gifs: true }) : ''}
</header>
<div class="doc-layout${doc.toc.length ? '' : ' no-toc'}">
<article class="prose" aria-label="${doc.title}">
${doc.html}
</article>
${toc(doc.toc)}
</div>
</div>`;
  return page({ file, title: doc.title, description: meta.description, active: id, body });
}

export function transcriptPage(lab, walk, doc) {
  const file = transcriptOutput(walk.id);
  const to = (target) => urlFrom(file, target);
  const item = lab.labs.find(({ id }) => id === walk.lab);
  const body = `<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${to(PAGES.home)}">Home</a></li><li><a href="${to(PAGES[item.id])}#walk-${walk.id}">${esc(item.title)}</a></li><li aria-current="page">Transcript</li></ol></nav>
<header class="page-head">
<p class="eyebrow">Walkthrough transcript · ${esc(walk.client)}</p>
<h1>${doc.title}</h1>
</header>
<div class="transcript-player">
${player(file, walk)}
</div>
<article class="prose" aria-label="Transcript">
${doc.html}
</article>
</div>`;
  return page({ file, title: `Transcript: ${doc.title}`, description: `Transcript of the illustrative walkthrough "${walk.title}" from ${item.title}.`, active: item.id, body });
}
