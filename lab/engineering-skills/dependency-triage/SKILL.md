---
name: dependency-triage
description: Use when assessing a dependency update or vulnerability report against the exact resolved package version and its supported fix.
---

# Dependency and advisory triage

## Establish what is installed

1. Identify the package manager and inspect the relevant manifest and lockfile.
2. Record the exact resolved package, version, dependency path and runtime or development scope. Do not treat a declared range as the resolved version.
3. Check platform, optional-dependency and workspace conditions that affect whether the package is installed or used.

## Verify the advisory

- Prefer the package maintainer, official advisory database or ecosystem advisory record. Record the advisory identifier and source.
- Confirm the affected version range, fixed version, affected component and any required configuration or call path.
- Distinguish a published advisory from reachability in this project. Do not invent a CVE or call a package vulnerable based only on its name.
- If the lockfile or authoritative advisory is unavailable, state that triage is incomplete instead of guessing.

## Recommend a bounded response

- Prefer the smallest supported patched version that resolves the advisory.
- Use the repository's package manager to update the manifest and lockfile together; do not hand-edit lockfile metadata.
- Keep unrelated upgrades out of scope. Do not run newly introduced lifecycle scripts or install untrusted code without approval.
- Run the repository's relevant audit, tests and build, and inspect the complete manifest and lockfile diff.

## Report

List package, resolved version, dependency path, advisory source and affected range, reachability evidence, recommended version, compatibility risk and checks run. Mark unknowns explicitly; an audit command's output is not proof that the application is safe.
