# Anti-AI-Slop labs

Two hands-on GitHub Copilot labs that you run locally in **VS Code** or the
**GitHub Copilot app**:

| Lab | What you practice | Guide | GIFs |
| --- | --- | --- | --- |
| **Lab 1: /commands + Spec Kit** | Built-in slash commands (`/explain`, `/plan`, `/tests`, `/fix`, `/review`, `/rubber-duck`, `/compact`), then spec-driven development with [GitHub Spec Kit](https://github.com/github/spec-kit) | [LAB-1-COMMANDS-SPECKIT.md](lab/LAB-1-COMMANDS-SPECKIT.md) | 6 |
| **Lab 2: anti-slop skills** | Find skills with the built-in skill tools (`/skills`, `/af`, `/skills reload`), then load ten popular public skills from five repositories and use them from plan to handoff: `/grill-me` ([mattpocock/skills](https://github.com/mattpocock/skills)) before any code; `/systematic-debugging`, `/test-driven-development`, `/verification-before-completion` and `/receiving-code-review` ([obra/superpowers](https://github.com/obra/superpowers)); `/code-simplification` and `/source-driven-development` ([addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)); `/humanizer` ([blader/humanizer](https://github.com/blader/humanizer)); `/frontend-design` ([anthropics/skills](https://github.com/anthropics/skills)) | [LAB-2-ANTI-SLOP-SKILLS.md](lab/LAB-2-ANTI-SLOP-SKILLS.md) | 6 |

Every exercise starts from deliberately broken code and ends with an
independent check that rejects plausible-but-wrong results.

**[Open the workshop site](https://akashai7.github.io/anti-ai-slop/)**: the
GIF walkthroughs, setup guide, both lab guides and the downloads, in one place.

## Quick start

You need [Node.js 22.20+](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads),
and either [VS Code](https://code.visualstudio.com/download) signed in to GitHub
Copilot or the GitHub Copilot app. Lab 1's Spec Kit part also needs
[uv](https://docs.astral.sh/uv/getting-started/installation/). No npm install,
API key or cloud resource is needed.

```powershell
git clone https://github.com/AkashAi7/anti-ai-slop.git
cd anti-ai-slop\lab
npm.cmd run doctor -- builtins
npm.cmd run setup -- builtins
code -n .\work\builtins
```

Or download `anti-slop-lab.zip` from the site and run the same commands in the
extracted `anti-slop-lab` folder. On macOS or Linux, use `npm` instead of
`npm.cmd`.

| Track | Lab | Setup | Open this folder |
| --- | --- | --- | --- |
| `builtins` | Lab 1, part A | `npm.cmd run setup -- builtins` | `work\builtins` |
| `spec-kit` | Lab 1, part B (VS Code) | `npm.cmd run setup -- spec-kit` | `work\spec-kit` |
| `spec-kit-skills` | Lab 1, part B (Copilot app) | `npm.cmd run setup -- spec-kit-skills` | `work\spec-kit-skills` |
| `skills` | Lab 2 | `npm.cmd run setup -- skills` then `npm.cmd run skills` | `work\skills` |

In VS Code, start a **Local** chat. In the GitHub Copilot app, add the folder
as a local repository and start an **Interactive** session. The full guide,
with baselines and troubleshooting, is [lab/README.md](lab/README.md).

### Load the public skills into your own project

Download `anti-slop-public-skills.zip` from the site and copy its `.github`
folder into your repository root, or install the latest upstream with the
skills CLI, one repository at a time:

```powershell
npx skills add mattpocock/skills --skill grill-me --skill grilling -a github-copilot
npx skills add obra/superpowers --skill systematic-debugging --skill test-driven-development --skill verification-before-completion --skill receiving-code-review -a github-copilot
npx skills add addyosmani/agent-skills --skill code-simplification --skill source-driven-development -a github-copilot
npx skills add blader/humanizer -a github-copilot
npx skills add anthropics/skills --skill frontend-design -a github-copilot
```

Then confirm they loaded: `/skills` in VS Code, or `/skills reload` then
`/skills` in the GitHub Copilot app.

## Repository layout

| Folder | Contents |
| --- | --- |
| [lab](lab/README.md) | The local lab environment for both labs: setup, broken starters, independent checks, the pinned public skills, lab guides, facilitator sheet, and the GIFs (`assets/`) with their maintainer recorder (`tools/`) |
| [site](site/README.md) | The GitHub Pages site generator and its checks |

The [Pages workflow](.github/workflows/pages.yml) runs the lab tests, verifies
the GIFs, checks every generated page and download, and runs browser tests
before it deploys from `main`.

## Honesty

The GIFs are illustrative reenactments: the chat dialogue is authored, not
recorded Copilot output, but every test result shown comes from a real fixture
run. Commands and skills guide an agent; tests and human review decide whether
the work is done. No productivity statistics are claimed. See
[Verification and limitations](lab/VERIFICATION.md) and the
[third-party notices](lab/THIRD-PARTY-NOTICES.md) for the bundled skills.
