# 2. Two test seams

Status: accepted, 2026-11-22

Tests run only through two public boundaries:

1. `safe_anything::scan(folder, options)`, against fixture folders under `tests/fixtures/<family>`.
   Each folder has an `EXPECTED` file listing every `path:line rule` that must be found; anything
   found that is not listed fails the test, so each fixture also guards against false positives.
   When a fixture line moves, its EXPECTED entry moves with it.
2. The binary, end to end, for the terminal report, `--json`, `--severity`, `--fail-on` and exit codes.

The dependency check takes an `Advisories` implementation, so tests use an in-memory source and
never touch the network.
