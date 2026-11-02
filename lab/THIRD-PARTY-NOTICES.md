# Third-party notices: public skills

The lab package redistributes ten skill folders from five public repositories.
They are authentic upstream files, not rewritten or renamed lab skills. Each
folder is copied complete, byte for byte, from the pinned commit below.

The six additional software-development skills under `engineering-skills/`
are original Lab 2 materials, not third-party imports. Their names and
SHA-256 hashes are recorded in `engineering-skills/skills-manifest.json`.

| Repository | Pinned commit | License | Copyright | Included skills |
| --- | --- | --- | --- | --- |
| [obra/superpowers](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b) | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | MIT | (c) 2025 Jesse Vincent | `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `receiving-code-review` |
| [mattpocock/skills](https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d) | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | MIT | (c) 2026 Matt Pocock | `grill-me`, `grilling` (upstream `skills/productivity/`) |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e) | `8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e` | MIT | (c) 2025 Addy Osmani | `code-simplification`, `source-driven-development` |
| [blader/humanizer](https://github.com/blader/humanizer/tree/0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0) | `0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0` | MIT | (c) 2025 Siqi Chen | `humanizer` (the repository root is the skill) |
| [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5) | `ca45fc496a3436251f191354091d557da31c15b5` | Apache-2.0 | See `LICENSE.txt` in the skill folder | `frontend-design` |

## Where the licenses are

- MIT licenses: `vendor/skill-pack/skill-licenses/<source>-LICENSE` in the
  complete lab, and `.github/skill-licenses/` in the skills-only ZIP and the
  generated learner workspace.
- Apache-2.0 for `frontend-design`: `skills/frontend-design/LICENSE.txt`,
  shipped inside the skill folder exactly as upstream distributes it.

## Integrity

`vendor/skill-pack/skills-manifest.json` records each source repository,
commit, license and upstream path, plus SHA-256 hashes of all 29 redistributed
files. Learner copies keep it as `.github/skills-manifest.json`, and
`npm run skills` and `npm run check` fail if any file is missing, extra or
changed.

The six lab-authored skill files are checked against the separate
`engineering-skills/skills-manifest.json` when the pack is installed and
verified. Installed copies keep it as
`.github/engineering-skills-manifest.json`, and the skills ZIP includes it
beside the upstream manifest.

## Scope

The portable installation does not install plugin hooks or bootstrap
infrastructure. Some upstream skill folders include helper scripts as
reference material; the lab does not execute them. `grill-me` is a thin entry
point that hands over to `grilling`, so both are shipped together.

Files were fetched from each commit's Git tree and raw file URLs on 2026-11-02.
Popularity on [skills.sh](https://skills.sh/) or GitHub is a point-in-time
signal, not a safety or quality guarantee.

Preserve the supplied licenses and copyright notices when copying or
redistributing these files.
