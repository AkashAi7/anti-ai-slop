# Anti-Slop Labs website

A static website for both anti-slop labs, hosted on GitHub Pages at **https://akashai7.github.io/anti-ai-slop/**. A clone also works offline, so you can open it straight from disk with no server, no build, and no npm install. It sends nothing to a model and loads nothing from other sites.

| Page | What it shows |
| --- | --- |
| [Home](index.html) | Both labs side by side, the exercise loop, every GIF walkthrough, and the honesty rules |
| [Commands lab](commands.html) | VS Code chat `/commands`: start steps, the 5 command flows, all commands grouped by mechanism with a live filter, exercises, and guides |
| [Skills lab](skills.html) | Agent skills: start steps, the 4 skill walkthroughs, all 12 skills, exercises, and guides |
| [Command Studio](../commands/studio/index.html) | The interactive demo for the Commands lab: watch, try a simulated chat, play Mission, and browse commands |

Every Markdown guide in [commands](../commands/README.md) and [skills](../skills/README.md) is also published as an HTML page under `docs/`. That includes prompt files, SKILL.md files, exercise tasks, hints, and transcripts. The site doesn't render or link the exercise `starter/` and `solution/` folders, so reference solutions stay opt-in.

## Open it

From this folder:

```powershell
npm.cmd run open
```

Or open `index.html` in any current browser. Each walkthrough shows a still poster on the page. Select **Play full screen**, or the poster itself, to watch the GIF fill the screen. **Stop** shows the still frame again, and Esc or **Exit full screen** returns you to the page. If the browser doesn't allow full screen, the GIF fills the browser window instead. On a phone held upright, full screen turns to landscape where the browser allows it; otherwise the theater suggests turning the phone sideways. Without JavaScript, the **GIF** link under each poster opens the animation directly.

## Rebuild after a lab changes

The pages are generated from the labs' own sources, so their counts, commands, skills, exercises, and baselines can't drift from the labs:

- `commands/commands.json`, `commands/studio/missions.json`, and the prompt files' frontmatter
- the mechanisms table in `skills/README.md` and the SKILL.md frontmatter
- each lab's `exercises/catalog.json`, `demo/scenarios.json`, and `assets/media-manifest.json`
- every Markdown guide

The generated HTML is committed so learners never need to build. After you edit a lab, rebuild and check:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run check
npm.cmd run smoke
```

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerates the pages. It writes only the files that changed and removes stale pages under `docs/`. |
| `npm run check` | Confirms the committed pages match a fresh build. Then it checks that every link, image, GIF, and anchor resolves, that each page has one `h1`, a title, a language, and unique ids, that every image has alt text, that no page loads a remote resource, and that no raw Markdown leaked into the HTML. |
| `npm run smoke` | Opens every page in headless Chromium. It checks for console errors, external requests, broken images, and horizontal overflow at 320, 768, 1024, and 1440 px wide. It also tests the full-screen GIF player (the Play button never covers the poster, the theater fills the viewport, Stop and Play again work, Esc and the close button restore focus and scrolling, and a portrait phone gets the turn-sideways hint), the command filter, and keyboard skip navigation. Add `-- --shots <folder>` to save screenshots. Add `-- --base <url>` to run the same checks against a hosted copy; it then also requests every same-site link and asset and confirms the site root opens the home page. |

`npm ci` installs `marked`, which `build` and `check` use, and `playwright` for the smoke test. The smoke test uses the Chromium build that Playwright installs (`npx.cmd playwright install chromium`).

### Last observed results

| Command | Observed result |
| --- | --- |
| `npm.cmd run check` | `Site check passed: 88 pages up to date, 1811 links and assets resolve, 291 anchors found.` |
| `npm.cmd run smoke` | `Site smoke passed: 88 pages, 31 images decoded, no errors or network requests, no overflow at 320/768/1024/1440px; full-screen player, catalog filter, and skip link work.` |
| `check` with a stray `docs/bogus.html` added | Exit 1: `stale page. Run npm run build.` The file was then removed and `check` passed again. |

Not verified: screen-reader output (only DOM semantics and keyboard skip navigation were tested), browsers other than Chromium, and hosting on a real static host.

## Hosting

The site is published to GitHub Pages by [the Pages workflow](../.github/workflows/pages.yml). On every push to `main`, it:

1. Validates both labs, runs their exercise tests, and verifies the GIFs.
2. Runs `check` and `smoke` on Linux, then confirms no generated file changed.
3. Deploys the committed `index.html`, `site`, `commands`, and `skills` with `git archive`, so installed dependencies and learner `work/` folders never ship.

Pull requests run the same checks without deploying. The root `index.html` redirects to `site/index.html`.

Links reach into the labs for GIFs, posters, the studio, and raw files, so publish the whole repository with the site, not `site/` by itself. Paths are relative and the pages need no server-side code, so any static host works. Dot folders such as `.github` are also rendered under `docs/.../github/`, because some static hosts skip dot folders.

After a deployment, check the live site from this folder:

```powershell
npm.cmd run smoke -- --base https://akashai7.github.io/anti-ai-slop/
```

## Honesty

The site adds no claims of its own. Walkthroughs are labeled illustrative. The Commands lab's final-frame check results come from its recorder, which re-runs the real checks before each capture. Each lab's verification record ([Commands](../commands/VERIFICATION.md), [Skills](../skills/VERIFICATION.md)) lists what was actually run.
