## What and why

<!-- What was wrong or missing, and how this change fixes it. Link the issue: Fixes #123 -->

## Verified

<!-- What you ran and what you saw. For a rule change: the fixture, and a run on a real repository. -->

## Not verified

<!-- What you couldn't try, and why. "Nothing" is a fine answer. -->

## Checklist

- [ ] `cargo fmt`, `cargo clippy --all-targets -- -D warnings` and `cargo test` pass
- [ ] A fixture with the unsafe case and a safe look-alike that must not be flagged
- [ ] No real secrets in fixtures (fake tokens are built at run time, see `tests/common`)
- [ ] `docs/rules.md` and `CHANGELOG.md` updated if users will notice the change
