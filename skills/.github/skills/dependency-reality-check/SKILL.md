---
name: dependency-reality-check
description: 'Verify package and API recommendations before installation. Use when an agent suggests a dependency, invents an SDK method, or adds packages for functionality already available.'
---

# Dependency reality check

1. Identify the actual capability required by the accepted contract.
2. Inspect the manifest, lockfile, runtime, and existing helpers for that capability.
3. Prefer an existing supported API when it meets the requirement. Do not add a package just to make a suggestion look sophisticated.
4. If a new dependency is necessary, verify its exact package identity, supported API/version, source repository, license, and maintenance evidence using the authoritative registry and documentation.
5. Separate "not verified" from "does not exist". Registry existence is not proof of trustworthiness or compatibility.
6. Give the user a decision and evidence before installing. Respect repository approval rules and never execute a remote install script merely because a page recommends it.
7. After an approved change, update the manifest/lockfile and run the relevant compatibility checks.

**Output:** capability -> existing option -> proposed package if needed -> checked sources/version -> risks -> decision.

**Lab:** exercise 02. The invented example package is teaching data; do not install it or assume its real-world registry status.
