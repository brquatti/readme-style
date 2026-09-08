# Changelog

## [0.2.0] - 2026-09-07

### Added

- `check` skill: read-only report of what the README is missing, backed by the same script as the hook.
- `.readme-style.json` in the repo root: `lang`, `sections`, `hook`. `README_STYLE_HOOK=0` silences the hook globally.
- Language choice: existing README language, then config, then the language the user writes in.
- Custom sections (Roadmap, Contributing, FAQ, ...) are preserved verbatim after the template sections.
- CI and version badges when the repo actually has workflows, tags, or a published version.
- `--dry-run` and free-text instructions (for example `only the Usage section`) for `apply`.
- Tests with `node --test`, GitHub Actions running them and `claude plugin validate --strict`.

### Changed

- `commands/apply.md` became `skills/apply/SKILL.md`: Claude can apply it when asked for a README; `/readme-style:apply` still works.
- Hook wiring moved to `hooks/hooks.json` and fires on `startup` only, not on resume, clear, or compact.
- Layout detection requires an emoji H1 inside a centered header, a shields.io badge, and at least two emoji sections; the whole file is read.
- The hook finds the repo root from subdirectories and checks the README there.
- The hook note is neutral, names what is missing, and tells the model not to run `apply` unasked.
- All texts in English.

### Fixed

- `apply` target was never resolved: `${1:-$CLAUDE_PROJECT_DIR}` is not expanded by Claude Code, and `$1` is the second argument, not the first.
- Non-Markdown READMEs (`README.rst`, bare `README`) no longer trigger a "missing README" note.

## [0.1.0] - 2026-09-07

- Initial public release.
