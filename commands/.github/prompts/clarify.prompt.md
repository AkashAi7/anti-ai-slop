---
name: clarify
description: Surface ambiguities and silent assumptions before any code is written. Asks at most 5 questions.
argument-hint: <the request or task file to clarify>
agent: agent
tools: ['read/readFile', 'search/codebase', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'vscode/askQuestions']
---
# /clarify - questions before code

## Goal
Find the decisions that block a correct implementation of the request below, and get them answered before anyone writes code.

Request: the text after `/clarify`. If it names files, read them first.

## Steps
1. Read the request and every file it names. Read the code it would change.
2. List the decisions the code would have to make: data types, units, rounding, ordering, limits, error behavior, edge cases, and anything that conflicts with existing code.
3. Drop every decision the repository already answers. Cite the file and line that answers it.
4. Keep at most 5 questions, ordered by how much a wrong guess would cost.
5. Ask them with the ask-questions tool when it is available. Otherwise ask in chat and stop.

## Output format
- **Questions**: numbered. Each has the question, why it matters (one line), and a proposed default.
- **Assumptions**: a table with the columns Assumption | Source (file:line or "default") | Risk if wrong.
- **Already answered by the repo**: bullets with file:line.

## Stop conditions
- Do not write, edit, or propose code.
- Do not invent requirements, product rules, or file paths. If something is unknown, ask.
- Stop after asking. Wait for the answers before any plan or implementation.
