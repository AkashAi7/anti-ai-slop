# Choose the mechanism, not the biggest collection

Load a skill because it addresses a failure mode. Loading all 12 into every task wastes context and creates conflicting priorities.

## Decision guide

| Need | Start with | Then, if relevant |
| --- | --- | --- |
| I cannot explain what "done" means | [grill-me](.github/skills/grill-me/SKILL.md) | [scope-contract](.github/skills/scope-contract/SKILL.md) |
| I do not trust a factual claim | [evidence-first](.github/skills/evidence-first/SKILL.md) | [dependency-reality-check](.github/skills/dependency-reality-check/SKILL.md) |
| I need to change behavior | [test-driven-development](.github/skills/test-driven-development/SKILL.md) | [verification-before-completion](.github/skills/verification-before-completion/SKILL.md) |
| Fixes keep missing the problem | [systematic-debugging](.github/skills/systematic-debugging/SKILL.md) | [failure-paths](.github/skills/failure-paths/SKILL.md) |
| The patch is unnecessarily large | [repo-conventions](.github/skills/repo-conventions/SKILL.md) | [simplify-first](.github/skills/simplify-first/SKILL.md) |
| A reviewer sounds confident but may be wrong | [review-feedback](.github/skills/review-feedback/SKILL.md) | [evidence-first](.github/skills/evidence-first/SKILL.md) |
| I am ready to report completion | [verification-before-completion](.github/skills/verification-before-completion/SKILL.md) | [concise-handoff](.github/skills/concise-handoff/SKILL.md) |

## Reviewed upstream sources

These are source-reviewed MIT-licensed candidates, not an endorsement of every file in their repositories. The bundled versions are purposefully smaller, host-portable adaptations.

| Source skill | Why useful | Upstream / lab difference |
| --- | --- | --- |
| Matt Pocock: grill-me + grilling | Decision-frontier interviews prevent guessed requirements | [Pinned source](https://github.com/mattpocock/skills/tree/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/grilling). The upstream wrapper alone is insufficient; the lab combines both into a standalone skill. |
| Superpowers: test-driven-development | Requires a meaningful failure before a passing change | [Pinned source](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/test-driven-development). The lab preserves user work instead of demanding code deletion. |
| Superpowers: systematic-debugging | Reproduction and hypothesis testing replace patch guessing | [Pinned source](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/systematic-debugging). The lab removes host-qualified calls and platform-specific utilities. |
| Superpowers: verification-before-completion | Evidence gates completion claims | [Pinned source](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/verification-before-completion). The lab makes blocked checks and verified scope explicit. |

Discover more at [skills.sh](https://skills.sh/) or the upstream repositories. These are browsing destinations, not reviewed additions. Before adding another skill, inspect its full instructions, dependencies, scripts, license, and supported host. Popularity does not prove quality, and adoption counts are not needed to justify this pack.

## Reuse and composition

1. Copy the selected folder to your project's native `.github/skills` location after reviewing it. Do not copy personal settings or use a global installer by default.
2. Adapt the "Lab" note to your project, and inspect its invocation description.
3. Retain the accompanying MIT notice for an adapted skill. Its link to `../../../sources.json` resolves to the lab root; when exporting, copy the relevant source records to your project root or replace that link with the pinned upstream URLs and adaptation notes.
4. If copying `systematic-debugging`, also take TDD and verification, or replace its explicit follow-up invocations with your project's equivalents.
5. `simplify-first` can optionally use `repo-conventions`; `concise-handoff` can optionally use verification. Copy companions when you want those composed workflows.
6. Start a fresh chat. Verify discovery, invoke explicitly, and inspect activity for the expected skill file.
7. Test a positive case and a negative case. For example, an ambiguous design should use grill-me when explicitly invoked; a request to explain an existing variable should not launch a full design interview.

Never weaken tests, ignore errors, or overwrite work merely because a skill says so. Project policy and human approval still apply.

## Extend the pack

Add a skill only when you can name its failure mode and show a useful observable result.

- Use lowercase hyphenated names matching the folder.
- Make descriptions specific about when to invoke the skill.
- Keep the procedure focused; load supporting resources only when needed.
- Include at least one exercise or evaluation example and a boundary where the skill should not apply.
- Add provenance and license records for adapted material.
- Update the catalog, coverage validation, and documentation together. The current validator intentionally expects this approved 12-skill/eight-exercise release; change those counts explicitly when expanding.
