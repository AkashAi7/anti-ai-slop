# Anti-Slop Labs website

The GitHub Pages site for both labs: **https://akashai7.github.io/anti-ai-slop/**.
It is static HTML that works straight from disk after a clone. No server, no
build and no npm install are needed to view it. It sends nothing to a model and
loads nothing from other sites.

| Page | Source | What it shows |
| --- | --- | --- |
| [Home](index.html) | generated | Both labs, setup in four steps, the skill pack and software-development skills, workshop resources |
| [Setup](setup.html) | [lab/README.md](../lab/README.md) | Prerequisites, tracks, client setup, baselines, troubleshooting, all three downloads |
| [Lab 1: /commands + Spec Kit](lab-1.html) | [lab/LAB-1-COMMANDS-SPECKIT.md](../lab/LAB-1-COMMANDS-SPECKIT.md) | 6 GIF walkthroughs, then the lab guide |
| [Lab 2: anti-slop skills](lab-2.html) | [lab/LAB-2-ANTI-SLOP-SKILLS.md](../lab/LAB-2-ANTI-SLOP-SKILLS.md) | 7 GIF walkthroughs, then the lab guide and six engineering skills |
| [Facilitator](facilitator.html) | [lab/FACILITATOR.md](../lab/FACILITATOR.md) | Run sheet for workshop leads |
| [Verification](verification.html), [Notices](notices.html) | `lab/VERIFICATION.md`, `lab/THIRD-PARTY-NOTICES.md` | Evidence and licenses |
| `transcripts/*.html` | `lab/assets/transcripts/*.md` | One page per GIF, with its player and transcript |

Walkthroughs show a still poster. **Play full screen**, or the poster, opens the
GIF in a theater that fills the screen; Esc or **Exit full screen** returns.
Without JavaScript, the **GIF** link under each poster opens the animation.

## Open it offline

```powershell
npm.cmd run open
```

Or open `index.html` in any current browser.

## Rebuild after a lab changes

The pages and downloads are generated from `lab/`: the Markdown guides,
`catalog.json`, `walkthroughs.json`, `assets/media-manifest.json`, pinned
public skills and lab-authored engineering skills. The generated HTML and ZIPs
are committed, so learners never build anything.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run check
npm.cmd run test:bundles
npm.cmd run smoke
```

| Command | What it does |
| --- | --- |
| `npm run build` | Writes the changed pages and the three ZIPs under `assets/downloads`, and removes stale pages. |
| `npm run check` | Confirms pages and ZIPs match a fresh build. Checks every link, image, GIF and anchor resolves; one `h1`, a title, a language and unique ids per page; alt text on every image; no remote resources; no links outside the published files (`index.html`, `site/`, `lab/`); and no raw Markdown links or leftovers. |
| `npm run test:bundles` | Confirms the ZIPs are deterministic and clean, checks both skill manifests, and extracts the lab ZIP to run real setup, baseline and repair for two tracks. |
| `npm run smoke` | Opens every page in headless Chromium: no console errors, external requests, broken images or overflow at 320/768/1024/1440 px. Tests the home routing and downloads, plays every lab GIF full screen and checks focus returns, the theater's Stop/Play again/Esc/close and phone fallback, copy buttons including a clipboard failure, and the skip link. Add `-- --shots <folder>` for screenshots, or `-- --base <url>` to run against a hosted copy (it then also requests every same-site link and asset). |

| Download | Contents |
| --- | --- |
| `anti-slop-lab.zip` | Everything a learner needs for both labs, without the GIF media and recorder |
| `anti-slop-public-skills.zip` | Ten pinned public skills plus six lab-authored engineering skills as a `.github` folder, with upstream licenses and both SHA-256 manifests |
| `anti-slop-walkthroughs.zip` | All 13 GIFs, posters and transcripts, for slides or offline demos |

`npm ci` installs `marked` (Markdown), `fflate` (ZIPs) and `playwright`
(browser checks; run `npx.cmd playwright install chromium` once).

### Regenerate the GIFs

The recorder lives in [lab/tools](../lab/tools). It reruns the starter,
red-test and reference checks so the results shown are real; the dialogue is
authored.

```powershell
npm.cmd --prefix ..\lab\tools ci
npm.cmd --prefix ..\lab\tools run gifs
npm.cmd --prefix ..\lab\tools run verify
npm.cmd run build
```

Pass a walkthrough id after `--` to regenerate only that scene and preserve
the other GIFs, posters and transcripts; omit it to regenerate all scenes.
For example: `npm.cmd --prefix ..\lab\tools run gifs -- engineering-input-review`.

## Hosting

[The Pages workflow](../.github/workflows/pages.yml) runs on every push and
pull request. It runs the lab tests and GIF verification, then `check`,
`test:bundles` and `smoke`, and fails if any generated file changed. On `main`
it deploys `index.html`, `site/` and `lab/` with `git archive`, so installed
dependencies and learner `work/` folders never ship. The root `index.html`
redirects to `site/index.html`.

Publish `lab/` with the site: the pages embed GIFs and posters from
`lab/assets`. After a deployment, check the live site:

```powershell
npm.cmd run smoke -- --base https://akashai7.github.io/anti-ai-slop/
```
