---
name: check
description: Read-only check of whether the project's README.md follows the readme-style layout, listing what is missing. Use when the user asks to check, lint, or verify a README without changing it.
argument-hint: "[path]"
allowed-tools: Bash(node:*)
---

# Check README.md against the readme-style layout

!`node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-readme.mjs" --report "$ARGUMENTS"`

Relay the report above in two or three lines: status, what is missing (if anything), and
the active config. If the status is not `ok`, mention that `/readme-style:apply` can fix
it. Do not read, write, or modify any file. This skill is read-only.
