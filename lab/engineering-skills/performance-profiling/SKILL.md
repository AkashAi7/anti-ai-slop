---
name: performance-profiling
description: Use when investigating a performance concern; measure a representative baseline and profile a real bottleneck before proposing an optimization.
---

# Performance profiling

## Measure first

1. Clarify the user-visible symptom, target workload, environment and performance budget.
2. Reproduce the workload and record a baseline with the same input, warm-up, sample count and environment that will be used for comparison.
3. Use a profiler, trace or targeted measurement to identify the dominant CPU, allocation, I/O or network cost. Do not infer a hot path from code appearance.
4. Check measurement noise, caching, JIT warm-up, concurrency and data-size effects. Prefer repeated measurements and report the median and spread.

## Validate one change at a time

- Make the smallest change tied to the measured bottleneck.
- Repeat the identical workload and compare correctness as well as performance.
- Keep the change only when the improvement is repeatable and relevant to the stated budget.
- Do not add a benchmark dependency or optimize a tiny synthetic fixture without user approval.

## Report

State the workload, environment, commands, baseline, repeated results, identified bottleneck, change and post-change comparison. Label synthetic or noisy measurements and do not claim production impact without representative production evidence.
