# Changelog

## [0.2.3] - 2026-09-08

### Fixed

- The hook printed `node: command not found` at every session start on machines without Node on the PATH (Claude Code's native installer does not need it). It now stays silent and exits 0.
- The layout check failed to parse on Node 18 (`\p{RGI_Emoji}` needs the regex `v` flag). Same emoji coverage with the `u` flag.
- `apply` ran the project's tests and CLI while "reading the code": unasked permission prompts, foreign code executing. The skill now reads only.
- `apply`: the version-badge rule names its sources (git tag, or the manifest's `version` field); it used to flip between runs on "published package version".

## [0.2.2] - 2026-09-08

### Fixed

- The plugin failed to load on Claude Code 2.1.x: `hooks/hooks.json` is loaded on its own, and listing it again in `plugin.json` counts as a duplicate. `claude plugin validate --strict` does not catch it; the tests now do.
- `apply` target: only the first argument can be a path. Any later word that happened to name a directory (`tests`, `docs`, `src`) used to become the target.
- `apply`: a section that covers the same ground as a template section (Getting started, Install, Overview) is merged into it instead of being kept as a duplicate.
- Layout check: flags and keycaps (`🇧🇷`, `#️⃣`) count as emoji.

### Changed

- The hook note is now shown to the user at session start (`systemMessage`) as well as given to the model; wording and behaviour otherwise unchanged.
- `apply` may only write `README.md` without asking: `Edit(README.md)` replaces the blanket Write/Edit grant. `Bash(cat:*)` dropped, Read covers it.
- CI runs on Node 22 and 24 (20 is end-of-life) and once per PR.

## [0.2.1] - 2026-09-08

### Fixed

- `apply`: a version number in a badge now needs a source in the repo (`engines`, CI matrix, `.nvmrc`, ...); it invented `node ≥18` twice.
- `apply`: the table of contents rule counts the sections it is about to write, so the five default sections alone get one.
- `apply`: preserved sections are byte-for-byte, no ticking Roadmap checkboxes.

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
