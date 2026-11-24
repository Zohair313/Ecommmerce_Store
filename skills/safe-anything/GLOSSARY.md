# Glossary

- **Rule**: one kind of problem, with an id (`code.sql-injection`), a family, a severity, the files it applies to, a pattern, a message and a fix. Several rule entries can share an id when the pattern differs per language.
- **Family**: the area a rule belongs to: code, secret, agent, mobile, config, dependency.
- **Finding**: one rule matched at one file and line. Carries the message, the fix and a snippet (redacted for secrets).
- **Severity**: low, medium, high, critical. `--fail-on` compares against it.
- **Structured check**: a rule that parses the file instead of matching a pattern (MCP configs, Dockerfile stages, lockfiles).
- **Agent setup**: everything that tells a coding agent what it may run or read: MCP server configs, agent settings and permissions, hooks, skills, commands, rules files and instruction files (CLAUDE.md, AGENTS.md, GEMINI.md).
- **Test path**: a file under a test, spec, fixture or mock folder, or named like `*.test.*`, `*_test.*`, `test_*`. Only critical secrets are reported there unless `--include-tests`.
- **Advisory source**: where dependency advisories come from. `OsvClient` in production, an in-memory source in tests.
- **Suppression**: `safe-anything:ignore` on the line or the line above.
