# 01 - Grill the request, not the person

**Weak request:** "Make incident summaries better." A polished implementation can still solve the wrong problem.

Run `npm run setup -- 01-clarify`, then `npm run check -- 01-clarify --baseline`.
Expected red: `brief has an observable contract`. Only edit `work/01-clarify/brief.json`.

Invoke `/grill-me` with this task and the learner brief attached. Answer the current decision frontier; do not let the agent choose on your behalf. Then invoke `/scope-contract` to record the agreed choices.

Resolve audience, included statuses, output fields, invalid-input behavior, and two concrete input/output examples (including empty input). Keep "no network service" as a non-goal. Do not write application code.

Run `npm run check -- 01-clarify`. Automated checks validate shape and completeness only.

**Human acceptance:** explain why each example follows the agreed policy, confirm no consequential assumption remains, and obtain participant confirmation. A structurally complete but nonsensical brief does not pass this human gate.

**Reflect:** Which question prevented the most likely rework? Reveal the reference brief only after making your decisions; different defensible choices are allowed.
