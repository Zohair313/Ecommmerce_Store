# Privacy

safe-anything runs on your machine and does not collect anything.

- It reads the files you point it at and prints findings. Nothing is uploaded.
- The only network call is the dependency check: package names, ecosystems and versions from your
  lockfiles are sent to the OSV.dev API (`api.osv.dev`, run by Google). No code, paths or file
  contents are sent. `--offline` turns it off.
- Secrets it finds are redacted in every output (terminal, JSON, SARIF, MCP).
