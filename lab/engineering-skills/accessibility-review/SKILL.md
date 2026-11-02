---
name: accessibility-review
description: Use when reviewing a web interface for barriers in semantics, names, keyboard use, focus, errors, contrast, zoom or motion.
---

# Accessibility review

## Review a real user task

1. Identify the page, component and user task. Inspect the rendered markup and styles that implement it.
2. Check semantic structure, accessible names, labels, instructions, required state and programmatically associated errors.
3. Walk the complete task using only the keyboard. Check tab order, visible focus, activation, escape behavior and focus after errors or navigation.
4. Measure text and control contrast from the actual foreground and background colors. Check zoom or reflow and reduced-motion behavior where relevant.
5. Use automated checks as supporting evidence, not as a substitute for keyboard and assistive-technology review.

## Report carefully

- Cite the element, selector or file and line for each issue; describe the user impact and a minimal fix.
- Separate observed barriers from items that need manual testing. Do not claim WCAG conformance from a source-only review or one automated scan.
- Default to read-only review. Ask before changing product behavior or adding accessibility dependencies.

Return prioritized findings, the checks performed, and any untested screen-reader, browser or device combinations.
