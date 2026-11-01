# Handoff: CSV export escaping

## Goal

Make `report.mjs` write valid CSV when a name or note contains a comma, a double quote, or a newline, by reusing the escaping in `csv.mjs`.

## State

- `csv.mjs` exports `csvEscape(value)`. It quotes fields that contain a comma, quote, CR, or LF and doubles inner quotes. It has no row helper yet.
- `report.mjs` escapes `name` only. `note` is quoted only when it contains a comma, so quotes and newlines in notes break rows.
- No code has changed. An earlier edit to `report.mjs` was reverted.

## Decisions

- Add `toCsvRow(values)` to `csv.mjs`: map each value through `csvEscape`, join with a comma.
- `report.mjs` builds every line with `toCsvRow`, including the `name,qty,note` header.
- Keep `\n` line endings.
- No new dependency; an npm CSV package was rejected.
- Numbers go through `String()` with no extra formatting.
- Rejected: `JSON.stringify` per field. It writes a quote as a backslash escape, not a doubled quote.
- Keep the name `buildReport`; callers use it.

## Evidence

- Read `csv.mjs` and `report.mjs` in this session; the State section comes from the source.
- Baseline check from the earlier session: output not saved, so treat it as not run.
- Tests for the new row helper: not run, none written yet.

## Open questions

- Should an empty or missing `note` become an empty field? Ops has not answered. Today a missing note prints `undefined`.

## Next steps

1. Add `toCsvRow` to `csv.mjs`.
2. Change `buildReport` in `report.mjs` to use `toCsvRow` for the header and every row, and remove the inline quoting.
3. Run `npm run check -- 04-clean-context-handoff` and record the exit code.
4. Ask ops about empty notes before changing that behavior.

Source notes: `NOTES.md`.
