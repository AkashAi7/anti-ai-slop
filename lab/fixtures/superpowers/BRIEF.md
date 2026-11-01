# Same cart, public skills

Repair the same defective cart as the built-ins track, in a fresh workspace.
Compare the evidence you collect, not how confident the model sounds.
The three installed skills are unmodified obra/superpowers files, not lab-authored
imitations. Open .github/skills and review the instructions before use.

## Contract

- Preserve the single export `subtotal(lines)` and its one parameter.
- Each line has non-negative safe integer `priceCents` and positive safe integer
  `qty`. Zero price is valid; zero quantity is not.
- Sum `priceCents * qty`; an empty cart costs 0. Do not mutate inputs.
- Reject non-arrays, null lines, missing fields, strings, fractions, negative
  values, NaN, Infinity, unsafe products and unsafe totals with TypeError or
  RangeError. Never disguise invalid input as empty success.
- Change only src/cart.mjs and src/cart.test.mjs. Preserve
  src/legacy-pricing.mjs, installed skills, package.json and parent checks.
- Use node:test, no dependencies, no frameworks. Do not delete pre-existing
  starter or learner work. Never run example cleanup scripts or print secrets.

## Invoke one skill per message

1. `/systematic-debugging`: reproduce the defect, cite the exact source, and
   propose one hypothesis. Stop before editing; approve the scope yourself.
2. `/test-driven-development`: add at least four real tests importing
   `./cart.mjs`. Cover preserved behavior, quantity, invalid input and overflow.
   Run `npm test` before touching cart.mjs. Stop and review the red output.
3. Approve the minimal repair in ordinary chat. Keep assertions unchanged.
4. `/verification-before-completion`: freshly run `npm test`, `npm run check`,
   `git --no-pager diff`, and `git --no-pager status --short`.
   Review untracked test files as well as the diff.

The independent check starts at 3/7 with four intended failures and must finish
at 7/7, exit 0. It also tests your regression suite against the original code:
green on both versions is not acceptable.

## Verify that a skill actually loaded

In VS Code Local Chat, type `/` and choose the installed skill. Inspect
Chat: Open Customizations > Skills and tool activity for its exact workspace
path. In the Copilot app, open this repository in a local Interactive session,
inspect `/skills` and the live `/` picker, and reload skills or start a new
session after setup. Product version and policy can affect discovery.

Some upstream text says `superpowers:<name>`; that is plugin-specific notation.
This portable folder installation uses the plain names above. If unavailable,
fix discovery rather than inventing an alias. A same-named personal skill can
be different: confirm the loaded file is in this workspace.

Record the client, loaded skill path, prompt, red output, green output and
reviewed diff. File checks do not prove that Copilot loaded or followed a skill.
