# 02 - Challenge the plausible claim

**Slop:** a generated answer claims a timestamp format and recommends a mandatory package without evidence.

Run `npm run setup -- 02-ground` and `npm run check -- 02-ground --baseline`. Both baseline checks should fail. Only edit `work/02-ground/evidence.json`.

Invoke `/evidence-first` against [contract.json](contract.json), then `/dependency-reality-check`. The supplied contract is fictional and authoritative only within this exercise. No internet or package install is needed.

For each claim, record status, the exact contract path plus `#capabilities.<key>`, and a supported conclusion. Decide whether the existing runtime can meet the requirement.

Run `npm run check -- 02-ground`.

**Human acceptance:** conclusions must actually follow from the source. Do not claim a package does not exist just because it is unnecessary here. Do not call an unvisited URL a citation.

**Reflect:** Which claims were contradicted, and which real-world facts remain unknown? Checks validate the expected ledger shape; a facilitator still reads the reasoning.
