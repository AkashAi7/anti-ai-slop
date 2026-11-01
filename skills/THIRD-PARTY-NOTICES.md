# Third-party notices

Four skills are **adaptations**, not unchanged upstream releases:

- [grill-me](.github/skills/grill-me/SKILL.md): Matt Pocock's `grill-me` and `grilling`, copyright (c) 2026 Matt Pocock. [MIT notice](.github/skills/grill-me/LICENSE).
- [test-driven-development](.github/skills/test-driven-development/SKILL.md), [systematic-debugging](.github/skills/systematic-debugging/SKILL.md), and [verification-before-completion](.github/skills/verification-before-completion/SKILL.md): Superpowers, copyright (c) 2025 Jesse Vincent. MIT notice accompanies each skill.

[sources.json](sources.json) records immutable upstream revisions, original file SHA-256 hashes, local destinations, and adaptations. Original-source hashes intentionally do not equal adapted local-file hashes. `npm run verify:sources` checks those public source hashes over the network without uploading workspace files.

The adapters are self-contained: upstream helper links were replaced by concise local procedures, not left dangling. No plugin hooks, shell utilities, or external agents are bundled. Preserve each license file when copying an adapted skill.

The other eight skills are original lab material. This notice does not impose a new license on the rest of the workspace. Check the owning project's redistribution terms before republishing original material.

GIF encoding is adapted from this workspace's existing AI-slop capture tooling. npm development dependencies retain their own licenses in their installed distributions and lockfile metadata.
