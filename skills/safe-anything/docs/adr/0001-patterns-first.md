# 1. Patterns first, parsers where patterns fail

Status: accepted, 2026-11-22

safe-anything matches compiled regexes against whole files, and parses a file only where a regex
cannot tell right from wrong: MCP configs (JSON with comments), Dockerfile stage names, lockfiles.

Why: one rule engine for nine languages and a dozen config formats stays small, fast (a 1,200-file
repository in under 0.1 s) and easy to extend with a fixture per rule. A real parser per language
would find more with fewer false positives, but would take months and pull in heavy dependencies.

Cost: no data flow. A rule sees one line (or one match), so `exec(cmd)` is not flagged unless the
command is built in the same expression, and HTML built from trusted data is flagged like HTML built
from user input. Every rule ships with safe look-alikes in its fixture to keep the noise measured.
