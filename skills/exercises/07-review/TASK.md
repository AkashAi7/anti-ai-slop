# 07 - Review the review

Run `npm run setup -- 07-review` and `npm run check -- 07-review --baseline`.
Expected red: zero priority, falsy invalid inputs, and unsupported review dispositions.
Only edit learner `incident.mjs` and `review.json`.

Contract: integer priorities 0 through 3 are valid, including zero. Only null/undefined default to 3. All other invalid values throw `RangeError`.

Read [comments.json](comments.json). Invoke `/review-feedback`, then `/evidence-first` if needed. Disposition each comment and cite `TASK.md` plus a concrete counterexample or supporting test. Useful feedback may already be implemented; accepting it need not create a needless code change.

Run `npm run check -- 07-review`.

**Human acceptance:** read each explanation, not just its schema. Reject the incorrect claim respectfully; retain existing useful validation. Do not infer correctness from the reviewer's confidence.

**Reflect:** When should the right response to a valid comment be "already covered, verified"?
