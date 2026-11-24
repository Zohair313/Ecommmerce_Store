# Contributing

Thanks for helping. The easiest and most useful contribution is a **fixture**: a few lines of code
that safe-anything gets wrong.

## Add or fix a rule

1. Put the problem in the right fixture folder under `tests/fixtures/<family>/`, next to a safe
   look-alike that must not be flagged.
2. Add the expected `path:line rule.id` to that folder's `EXPECTED` file. Leave the safe line out.
3. Run `cargo test`. It fails, listing what is missing and what was found that shouldn't be.
4. Add or change the rule in `src/rules/<family>.rs` until it passes, and give it a CWE and a
   reference in `src/refs.rs`.
5. Run it on a real repository and read what it finds. A rule that is right on the fixture and
   noisy on real code is not done.

## Checks

```bash
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
sh scripts/check-secrets.sh --all
```

`git config core.hooksPath .githooks` runs the secret check before each commit. The fixtures hold
fake keys on purpose and are skipped by it.

## Writing

Messages and fixes say what is wrong and what to do, in plain words, one sentence each. Numbers in
docs are measured, with the date and the machine.
