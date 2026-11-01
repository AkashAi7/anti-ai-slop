# Anti-slop labs: set up your local environment

Two hands-on labs share this one local environment. Each lab has its own guide
and its own GIF walkthroughs:

| Lab | What you practice | Guide |
| --- | --- | --- |
| **Lab 1: /commands + Spec Kit** | Built-in slash commands (`/explain`, `/plan`, `/tests`, `/fix`, `/review`, `/rubber-duck`, `/compact`) and spec-driven development with GitHub Spec Kit (`/speckit.*` or `/speckit-*`) | [LAB-1-COMMANDS-SPECKIT.md](LAB-1-COMMANDS-SPECKIT.md) |
| **Lab 2: anti-slop skills** | Discover skills with the client's built-in skill tools (`/skills`, `/af`, `/skills reload`), load three popular public skills, then use them: `/systematic-debugging`, `/test-driven-development`, `/verification-before-completion` | [LAB-2-ANTI-SLOP-SKILLS.md](LAB-2-ANTI-SLOP-SKILLS.md) |

Both labs work in **VS Code** (Copilot Chat, Local session) and in the
**GitHub Copilot app** (desktop, local repository, Interactive session).
Every exercise starts from deliberately broken code and ends with an
independent check that rejects plausible-but-wrong results.

## 1. Install the prerequisites

| Needed for | Install |
| --- | --- |
| Both labs | [Node.js 22.20+](https://nodejs.org/en/download) and [Git](https://git-scm.com/downloads) |
| Both labs, one client | [VS Code](https://code.visualstudio.com/download) signed in to GitHub Copilot, **or** the GitHub Copilot app with a local repository |
| Lab 1 Spec Kit part only | [uv](https://docs.astral.sh/uv/getting-started/installation/) and Python 3.11+ (uv can fetch Python if your network allows it) |

You do **not** need an npm install, API key, Azure resource or backend.
GitHub Desktop and Microsoft Copilot are different products; they are not
substitutes for the GitHub Copilot app.

## 2. Get the lab

Pick one:

- **ZIP (easiest):** download `anti-slop-lab.zip` from the
  [workshop site](https://akashai7.github.io/anti-ai-slop/) and extract it.
  Open a terminal in the extracted `anti-slop-lab` folder.
- **Clone:**

  ```powershell
  git clone https://github.com/AkashAi7/anti-ai-slop.git
  cd anti-ai-slop\lab
  ```

The ZIP already contains the three public skills for Lab 2, their MIT license
and a SHA-256 inventory. Nothing else is downloaded for Lab 2.

## 3. Check your machine

Run the doctor for the track you plan to use. It prints what is missing.

```powershell
npm.cmd run doctor -- builtins
npm.cmd run doctor -- spec-kit
npm.cmd run doctor -- spec-kit-skills
npm.cmd run doctor -- superpowers
```

Windows examples use `npm.cmd` to avoid PowerShell's `npm.ps1` execution policy
prompt. On macOS/Linux, use `npm`.

## 4. Create a practice workspace

Each track gets a fresh Git repository under `work\`, with the broken starter
code and a baseline commit, so you can review your diff later.

| Track | Lab | Client | Setup command | Open this folder |
| --- | --- | --- | --- | --- |
| `builtins` | Lab 1 | VS Code or app | `npm.cmd run setup -- builtins` | `work\builtins` |
| `spec-kit` | Lab 1 | VS Code | `npm.cmd run setup -- spec-kit` | `work\spec-kit` |
| `spec-kit-skills` | Lab 1 | Copilot app | `npm.cmd run setup -- spec-kit-skills` | `work\spec-kit-skills` |
| `superpowers` | Lab 2 | VS Code or app | `npm.cmd run setup -- superpowers` then `npm.cmd run skills` | `work\superpowers` |

Setup refuses to overwrite an existing workspace. To start again, rename that
one `work\<track>` folder and rerun setup. Keep the `work` folder beside
`scripts` and `fixtures`: the independent checks live outside the workspace.

## 5. Open the workspace in your client

### VS Code

```powershell
code -n .\work\builtins
```

Or use **File > Open Folder** and pick the folder itself, not the parent lab.
Trust the workspace, open Copilot Chat, choose a **Local** session, and type
`/` to see the real command and skill picker. Keep tool approvals on.

### GitHub Copilot app

1. Add the exact `work\<track>` folder as a **local repository**.
2. Start an **Interactive** session (not Autopilot).
3. Type `/` to see the live picker. Use `/skills` to list skills, and
   `/skills reload` after adding skill files mid-session.

Do not use `/allow-all-tools` (`/yolo`) for these labs. Reviewing each change is
part of the exercise.

## 6. Confirm the broken baseline

From the workspace's terminal:

```powershell
npm.cmd run check -- --baseline
```

| Track | Expected baseline | Finished |
| --- | --- | --- |
| `builtins`, `superpowers` | 3/7 pass, 4 intended failures | `VERIFIED: 7/7`, exit 0 |
| `spec-kit`, `spec-kit-skills` | 2/10 pass, 8 intended failures | `VERIFIED: 10/10`, exit 0 |

Red is intentional. Now open your lab guide:
[Lab 1](LAB-1-COMMANDS-SPECKIT.md) or [Lab 2](LAB-2-ANTI-SLOP-SKILLS.md).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| PowerShell blocks `npm` | Use `npm.cmd` as shown. Do not change machine execution policy. |
| A slash command or skill is missing | Open the `work\<track>` folder itself, use a Local (VS Code) or Interactive (app) session, then start a fresh chat. In the app, run `/skills reload`. |
| `/speckit.*` is absent but `/speckit-*` exists | You installed the skills layout. Use the hyphenated names. |
| App `/review` is absent | It needs an active session that has changes. Make a change first. |
| Setup says the workspace exists | Setup protects your work. Rename that folder and retry. |
| Spec Kit download or TLS fails | Use your organization's approved package index and certificates. Never disable TLS verification. Preflight Spec Kit before the session. |
| A check is red after "done" | Read the failure. Fix the code or the missing tests; never weaken the checker. |

## Also in this folder

- [Facilitator run sheet](FACILITATOR.md): timings, stop conditions, completion card
- [Verification and limitations](VERIFICATION.md): what the checks prove and what they do not
- [Third-party notices](THIRD-PARTY-NOTICES.md): license for the bundled public skills

In the repository only (the lab ZIP leaves them out to stay small):

- `assets/`: the GIFs, posters and transcripts shown on the site
- `tools/`: maintainer-only GIF recorder (`npm run gifs`); learners never need it

The GIFs are illustrative reenactments. Their test results come from real
fixture runs, but the chat dialogue is authored, not a recorded Copilot session.
