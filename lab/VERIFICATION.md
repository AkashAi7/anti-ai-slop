# Verification and limitations

## What the checks establish

- Defective built-ins starter: exactly 3/7 checks pass and the four specified
  failures are assertion failures, not checker crashes.
- Defective Spec Kit starter: exactly 2/10 checks pass and the eight specified
  failures are assertion failures.
- Authored references pass 7/7 and 10/10. Learner test suites pass on repaired
  code and fail on the original implementation.
- Empty-cart and no-code behavior, integer boundaries, invalid input,
  non-stacking, duplicate handling, inclusive expiry and catalogue preservation
  are checked deterministically, without a model or network.
- Setup refuses existing learner work. The built-ins starter contains no
  `.github/prompts` or substitute slash commands.
- The Spec Kit installer verifies nine official command or skill entries.
- Public-skills setup installs ten complete upstream skill folders from five
  pinned repositories (obra/superpowers, mattpocock/skills,
  addyosmani/agent-skills, blader/humanizer, anthropics/skills), with their
  licenses and inventory, without running upstream scripts or installing hooks.
  All 29 files are checked against the pinned SHA-256 inventory, and each
  `SKILL.md` must keep its upstream `name` and `description`.
- The public-skills track deliberately reuses the cart fixture in a fresh
  workspace: 3/7 baseline, 7/7 reference. It adds skill-integrity checks to the
  existing scope gate, not a new set of seven distinct business requirements.
  The review-feedback and PR-description practice files can be edited freely;
  the checks do not grade how well `/receiving-code-review`, `/humanizer` or
  `/grill-me` were followed.

## Media provenance

The recorder reruns starter and reference checks before generating each GIF.
The displayed baseline and final check output comes from those runs.
Prompts, intermediate answers and feature documents are authored illustrations,
not captured live Copilot or Spec Kit responses.

Each GIF has still posters, a text transcript, looping animation and a checksum
in the media manifest. Animation decoding and site/browser checks are separate
from exercise checks.

## Not established by automation

- Live Copilot entitlement, sign-in, command discovery or behavior on a
  participant's client; verify these in its `/` picker during preflight.
- That a real agent will produce the reference solution or the same dialogue.
- Semantic completeness merely because spec/plan/tasks files exist.
- Screen-reader output, real phones or browsers other than the tested browser.
- Hosted deployment of local edits, or any measured productivity improvement.

Commands and skills guide an agent. Independent tests and human review decide
whether the work is complete.

## Expanded anti-slop skills: observed validation, 2026-11-02

| Check | Observed result |
| --- | --- |
| Lab tests (`npm test` in `lab`) | 16 passed, including the 3/7 learner baseline, 7/7 reference, skill integrity and tamper checks |
| Pinned skills | Ten skill folders from five repositories; all 29 redistributed files hash-checked |
| GIF tooling (`lab/tools`) | Encoder tests 2 passed; all 12 GIFs verified with 12 distinct frames, 23.6-second loops, checksums, posters and transcripts |
| Site build and check | 19 pages up to date; 575 links/assets and 88 anchors resolve |
| Bundle tests | 3 passed: deterministic ZIPs, pinned skill hashes, and extracted `builtins` and `skills` setup/baseline/refusal/repair |
| Browser smoke (Chromium) | 19 pages, 27 images and 25 players; no errors, network requests or overflow at 320/768/1024/1440 px; all 12 lab GIFs play and return focus |

These are local results. The hosted Pages deployment is updated only after
the changes are pushed and the workflow succeeds.

## Two-lab restructure: observed validation, 2026-11-01

The workshop was reorganized into one `lab/` environment with two labs:
Lab 1 (/commands + Spec Kit, 6 GIFs) and Lab 2 (anti-slop skills, 4 GIFs,
including a new built-in skill discovery scene). The older optional
`commands/`, `skills/` and `practice/` trees were removed.

| Check | Observed result |
| --- | --- |
| Lab tests (`npm test` in `lab`) | 14 passed: track baselines and references, setup refusal, weak-test rejection, scope checks, upstream skill copying and tamper detection |
| GIF tooling (`lab/tools`) | Encoder tests 2 passed; all 10 GIFs verified: 12 distinct frames, 23.6-second loop, checksum, posters and transcript |
| Site build and check | 17 pages up to date; every link, asset and anchor resolves; no raw Markdown links; three ZIPs match a fresh build |
| Bundle tests | 3 passed: deterministic clean ZIPs; skills ZIP matches the pinned hashes; extracted lab runs setup, red baseline, overwrite refusal and 7/7 repair for `builtins` and `superpowers` |
| Browser smoke (Chromium) | 17 pages, 23 images, 21 players; no errors, remote requests or overflow at 320, 768, 1024 and 1440 pixels; home routes to both labs and all three downloads; every lab GIF plays full screen and returns focus; copy, clipboard error, theater and skip link work |

Genuine Spec Kit installation was not rerun for this restructure; the
earlier record below covers it. No prompt was sent to a live Copilot model,
and the hosted site is only updated when these changes are pushed to `main`.

## Public-skills extension: observed validation, 2026-11-01

Recorded before the two-lab restructure, when this environment lived in
`practice/` and the site still carried the older optional tracks.

| Check | Observed result |
| --- | --- |
| Practice maintainer tests | 14 passed: three track baselines/references, setup refusal, weak-test rejection, scope checks, full upstream file copying and tamper detection |
| Public skill source | 15 files downloaded from the pinned Git tree, complete skill folders and MIT license retained; file hashes verified |
| Local public-skills workspace | Doctor, setup and skill verification passed; clean baseline commit; 3/7 with four expected assertion failures, deliberately not repaired |
| GIF verification | Nine GIFs, each 12 distinct frames, looping for 23.6 seconds; checksums, size limit, transcripts and poster-fidelity bounds pass |
| Standalone ZIP tests | 3 passed: deterministic clean archives; actual extracted built-ins and public-skills setup, expected red baseline, overwrite refusal and reference repair to 7/7 |
| Website | 102 generated pages; generated content, local links, assets and anchors verified |
| Browser | Chromium: no errors, remote requests or overflow at 320, 768, 1024 and 1440 pixels; all nine GIFs, public-skill and client-specific copies, copy-error notice, checklist, three downloads, full-screen controls and keyboard skip navigation pass |

The new public-skills workspace is ready locally and remains intentionally
defective for the learner. No prompt was sent to a live Copilot model; neither
actual skill invocation nor model compliance has been verified. Check the
loaded workspace skill path during participant preflight. No hosted deployment
or measured reduction in AI slop is claimed.

## Earlier built-ins / Spec Kit validation record

The following results were recorded before the public-skills extension. Toolkit
installation and the hosted site were not rerun as part of that extension.

| Check | Observed result |
| --- | --- |
| Practice maintainer tests | 9 passed; exact 3/7 and 2/10 defective baselines, 7/7 and 10/10 references, weak-test and scope rejection |
| Existing commands tests | 35 passed, including the shared encoder's pixel-color regression |
| Genuine toolkit setup | VS Code commands and app skills workspaces initialized with Specify 1.2.3; nine required entries in each layout have valid YAML and matching agent/skill names |
| Installed runtime | The real PowerShell template resolver returned constitution-template JSON successfully |
| GIF verification | All six decode to 12 distinct frames, loop for 23.6 seconds, match checksums and pass poster-fidelity bounds |
| Standalone ZIP tests | 2 passed, including actual setup and baseline verification from an extracted lab |
| Website | 97 pages; all links and assets resolve; browser checks pass at 320, 768, 1024 and 1440 pixels |
| Browser interactions | All six GIFs open; client-specific command copies, copy-error notification, evidence checklist, downloads, full-screen controls and keyboard navigation pass |
| ZIP dependency | fflate 0.8.3; final advisory scan and npm audit report no known vulnerabilities |

The earlier prepared learner repositories remain deliberately defective so
participants can practice. Verification did not replace them with solutions
or send a prompt to a live Copilot model. The website was updated locally;
these checks do not claim that the hosted deployment has changed.
