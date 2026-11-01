# Ask before you build

Illustrative walkthrough - not recorded Copilot output

Real exercise: [01-clarify](../../exercises/01-clarify/TASK.md)

## REQUEST: An attractive request. No contract.

Participant: Make our incident summaries better.

What does better mean for the person taking over the shift?

```text
{
  "goal": "Make summaries better",
  "audience": "",
  "includedStatuses": [],
  "outputFields": [],
  "unresolved": ["Who?", "What output?"]
}
```

Terminal/observation: Unresolved choices: audience, scope, output, failure behavior

## WITHOUT A SKILL: Fast output can create slow rework.

Participant: Just build something impressive.

Weak example: a dashboard, scoring engine, and notification service, none requested.

```text
// Illustrative overreach, not lab code
class IncidentDashboard {}
class SmartScoringEngine {}
class NotificationService {}

// Still unknown:
// Who reads this? What must it return?
```

Terminal/observation: No agreed acceptance criteria. No evidence of fit.

## INVOKE SKILL: Grill the request, not the person.

Participant: /grill-me Challenge this request before coding.

1. Who reads the summary?
2. Which statuses count as unresolved?
3. What output supports their next decision?
Recommendation: a small handoff contract.

```text
// Decision frontier
Audience: incoming on-call engineer
Statuses: open + investigating
Output: { openCount }
Non-goal: no network service
```

Terminal/observation: Participant answers. The agent waits instead of guessing.

## AGREE THE CONTRACT: Turn choices into examples.

Participant: /scope-contract Record our decisions.

Mixed input -> count unresolved only.
Empty input -> zero.
Invalid input -> explicit TypeError.
Confirm the brief before implementation.

```text
{
  "audience": "Incoming on-call engineer",
  "includedStatuses": [
    "open", "investigating"
  ],
  "outputFields": ["openCount"],
  "unresolved": []
}
```

Terminal/observation: npm run check -- 01-clarify

## VERIFY + DISCUSS: A complete shape is not enough.

Participant: Review the examples against our decisions.

The check verifies completeness. The participant verifies that the decisions and examples make sense.

```text
Acceptance example:
[open, resolved] -> { openCount: 1 }
[]               -> { openCount: 0 }

Human gate:
Does this answer the on-call need?
```

Terminal/observation: Expected solution: 2 checks pass. Human contract review still required.

Takeaway: A useful question prevents a polished solution to the wrong problem.
