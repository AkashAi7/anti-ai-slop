# Anti-AI-Slop labs

Two hands-on GitHub Copilot labs that you run locally in **VS Code** or the
**GitHub Copilot app**:

| Lab | What you practice | Guide | GIFs |
| --- | --- | --- | --- |
| **Lab 1: /commands + Spec Kit** | Built-in slash commands (`/explain`, `/plan`, `/tests`, `/fix`, `/review`, `/rubber-duck`, `/compact`), then spec-driven development with [GitHub Spec Kit](https://github.com/github/spec-kit) | [LAB-1-COMMANDS-SPECKIT.md](lab/LAB-1-COMMANDS-SPECKIT.md) | 6 |
| **Lab 2: anti-slop skills** | Load ten pinned public skills and six lab-authored software-development skills, then practice requirements, debugging, testing, verification, security review, API compatibility, dependency triage, migration safety, profiling and accessibility | [LAB-2-ANTI-SLOP-SKILLS.md](lab/LAB-2-ANTI-SLOP-SKILLS.md) | 7 |

The core coding tracks start from deliberately broken code and end with an
independent check. Lab 2 also includes focused engineering reviews and
planning exercises with explicit evidence and scope limits.

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

### Load the skills into your own project

Download `anti-slop-public-skills.zip` from the site and copy its `.github`
folder into your repository root. The ZIP contains ten pinned upstream skills
and six lab-authored engineering skills. To fetch upstream skills separately,
use the skills CLI one repository at a time:

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
| [lab](lab/README.md) | The local lab environment for both labs: setup, broken starters, independent checks, ten pinned public skills, six lab-authored engineering skills, lab guides, facilitator sheet, and the GIFs (`assets/`) with their maintainer recorder (`tools/`) |
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
