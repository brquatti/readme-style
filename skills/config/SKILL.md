---
name: config
description: Show or change this project's readme-style settings (`lang`, `sections`, `hook`) in `.readme-style.json` at the repo root. Use when the user asks to configure readme-style, set the README language, choose which sections it writes, or turn the startup note off.
argument-hint: "[lang <code> | sections <a, b, c> | hook on|off]"
allowed-tools: Bash(node:*)
---

# Show or change the readme-style settings

!`node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-readme.mjs" --config "$ARGUMENTS"`

Relay the output above in two or three lines: which file it points at, the settings it
lists, and — when a key was set — what changed. On an error line, say what was rejected
and name the valid keys (`lang`, `sections`, `hook`).

Nothing else to do: the script already wrote the file. Do not read, write, or modify any
file yourself. Mention `/readme-style:apply` only when the user asks to regenerate the
README with the new settings.

## What each key does

- `lang` — language code (`en`, `pt`, `pt-BR`) that `apply` writes the README in.
  Unset: English, regardless of the language the existing README is in.
- `sections` — the `## <emoji> Section` headings `apply` writes, in order, comma or
  `|` separated. Unset: the default set for the language.
- `hook` — `off` silences the SessionStart note in this project. `README_STYLE_HOOK=0`
  silences it everywhere.
