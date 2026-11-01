# Anti-AI-Slop

Hands-on GitHub Copilot labs for asking better questions, grounding changes in the repository, and proving results with real checks.

**[Open the website](https://akashai7.github.io/anti-ai-slop/)** | **[Download the exercises (ZIP)](https://github.com/AkashAi7/anti-ai-slop/archive/refs/heads/main.zip)**

## What is included

| Folder | Contents |
| --- | --- |
| [commands](commands/README.md) | 12 custom slash commands, a reference for 31 built-ins, 8 exercises, 6 GIFs, and an interactive browser Command Studio |
| [skills](skills/README.md) | 12 reusable agent skills, 8 exercises, 4 GIFs, and an interactive terminal guide |
| [site](site/README.md) | The GitHub Pages website, full-screen walkthroughs, and HTML versions of the lab guides |

Both labs include starter code, acceptance checks, progressive hints, opt-in reference solutions, and facilitator guides. The website is for browsing and demonstrations; real exercise files run locally in VS Code, not on GitHub Pages.

## Prerequisites

- **Just browsing:** a current browser. No account, install, or API key is needed for the website or simulated Command Studio.
- **Running exercises:** [Node.js 22.20 or newer](https://nodejs.org/en/download) (includes npm).
- **Practicing with Copilot:** [VS Code](https://code.visualstudio.com/download), signed-in GitHub Copilot Chat with agent access, and permission under your organization's policies. Copilot requires its normal network access and entitlement.
- **Getting the files:** [Git](https://git-scm.com/downloads), or use the ZIP download instead.

The repository supplies the lab files, not Node.js, VS Code, or a Copilot subscription. The exercises need no Azure subscription, backend, paid API key, or npm dependency install.

## Get started

```powershell
git clone https://github.com/AkashAi7/anti-ai-slop.git
cd anti-ai-slop
```

Without Git, download and extract the ZIP above. Its default folder is `anti-ai-slop-main`; use that folder instead of `anti-ai-slop` in the steps below.

Choose **one** lab:

### Commands

Open the downloaded `commands` folder itself with **VS Code > File > Open Folder**. Do not open only the repository root: the lab's `.github/prompts` must be in the active workspace.

In the integrated terminal:

```powershell
node --version
npm.cmd run studio
npm.cmd run demo
```

Choose `01-clarify-before-code`, then `setup`, `baseline`, and `prompt`. In Copilot Chat, select **Session Target: Local**, use agent mode, and follow the prompt. Run the exercise check on your learner copy:

```powershell
npm.cmd run check -- 01-clarify-before-code
```

### Skills

Open the downloaded `skills` folder itself in a separate VS Code window, so `.github/skills` belongs to the active workspace.

```powershell
node --version
npm.cmd run demo
```

Choose `01-clarify`, then `setup`, `baseline`, and `prompt`. Work in a fresh Copilot chat, then check:

```powershell
npm.cmd run check -- 01-clarify
```

On macOS/Linux, use `npm` instead of `npm.cmd`. No `npm install` is required for these learner commands or `npm test`. An intentionally failing starter is expected; `--baseline` confirms those expected failures rather than claiming the exercise is solved.

## Website and maintenance

The website is hosted at **https://akashai7.github.io/anti-ai-slop/**. The root entry opens the showcase under `site/`, preserving the relative links to both labs.

After cloning, you can also open `site/index.html` or `commands/studio/index.html` directly in a browser, offline.

The [Pages workflow](.github/workflows/pages.yml) validates both labs, tests the exercises, verifies the GIFs, checks generated pages, and runs browser smoke tests before deployment. Pull requests run the checks without deploying; pushes to `main` deploy after the checks pass. See the [site maintenance guide](site/README.md) for rebuild commands and the [hosted check](site/README.md#hosting) that runs the browser tests against the live site.

## Honesty and reuse

Walkthroughs and simulated chat answers are illustrative, not recordings of live Copilot output. Commands-lab GIF check results are captured from actual reference-solution checks. Commands and skills guide an agent; tests and human review verify the result. No productivity statistics are claimed.

Preserve the licenses shipped with adapted skills. See [third-party notices](skills/THIRD-PARTY-NOTICES.md) and each lab's verification record: [Commands](commands/VERIFICATION.md), [Skills](skills/VERIFICATION.md).
