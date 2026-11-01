# Verification record

## Automated checks

Executed on Windows with Node.js 26.13.0 and npm 11.20.0. The declared minimum is Node 22.20; that exact runtime was not separately exercised.

| Command/check | Observed result |
| --- | --- |
| `npm run validate` | 12 skills, 8 exercises, 4 scenes, 7 source records, and 75 local links validated |
| `npm test` | 23 tests passed; zero failures, skipped tests, cancellations, or todos |
| Fixture checks inside the suite | All eight starters failed exactly their intended assertion checks; all eight reference solutions passed their 25 acceptance checks |
| `npm run demo` with scripted terminal input | Selected beginner 01 and advanced 05, displayed the skill prompt, executed both defective baselines, returned to the menu, and exited successfully |
| `npm run gifs` | Generated all four GIFs, eight before/after posters, four transcripts, and the media manifest; capture checked layout, console errors, disclaimer, and blocked remote loads |
| `npm run verify:assets` | Decoded all 60 GIF frames; verified actual animation, looping, 1280x720 dimensions, hashes, byte limits, posters, and transcripts |
| Visual inspection | Reviewed representative before/after posters from all four scenes; code, chat, and disclaimer were readable without clipping |
| `npm run verify:sources` | All seven immutable public upstream file hashes matched the provenance manifest |

The test suite includes overwrite protection, exact reset consent, path/junction rejection, incomplete-result rejection, unexpected-baseline rejection, guide selection/cancellation, and CLI error exits.

Run commands yourself when changing the lab; these results do not prove a modified checkout still passes. The scripted terminal smoke test did not simulate or invoke a Copilot conversation.

## Actual Copilot client

**Deferred by the user for later participant/facilitator verification.** The authoring environment has exercised the Node guide and fixtures, but has not established discovery or invocation of this new workspace's skills in a fresh VS Code/Copilot chat. This gate is not recorded as passed.

Complete the [actual client checklist](labs/facilitator.md#actual-copilot-client-checklist). Illustrative GIFs, parsed frontmatter, and passing fixture tests are not substitutes.
