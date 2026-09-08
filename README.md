<div align="center">

# 📐 readme-style

## Keep every README on your GitHub profile in the same visual style, with no effort

*centered header · real badges · table of contents · emoji sections · zero invention*

<br/>

![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-d97757?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?style=for-the-badge&logo=node.js&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/brquatti/readme-style/ci.yml?style=for-the-badge&label=CI)
![Version](https://img.shields.io/github/v/tag/brquatti/readme-style?style=for-the-badge&label=version)
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

> Good READMEs cost time, and without a shared standard every repo ends up at a
> different level of polish — some cared for, others forgotten. **readme-style**
> fixes that: a skill that reads the real code and writes the README in the same
> consistent format, plus an automatic nudge (it never writes anything on its
> own) every time you open a project whose README is not in that style yet.

```console
$ cd my-project && claude

# one-line note at session start, shown to you and given to the model:
readme-style: no README.md in /path/to/my-project. Run /readme-style:apply to generate one.

> /readme-style:apply
  Reading the project's real code...
  ✓ README.md updated to the readme-style layout.
```

---

## 📋 Table of contents

- [✨ Features](#-features)
- [🧠 How it works](#-how-it-works)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🗂️ Project structure](#️-project-structure)
- [⚙️ Configuration](#️-configuration)
- [🎨 The generated layout](#-the-generated-layout)

---

## ✨ Features

| | |
|---|---|
| 🔍 **Automatic nudge** | Opening any project in Claude Code runs a `SessionStart` hook that checks whether the README exists and follows the layout. If not, it shows a one-line note that only *suggests* running the skill. Never writes anything on its own, never blocks the session. |
| ✍️ **Generation from the real code** | The `readme-style:apply` skill reads the project's actual code (dependencies, entry points, modules, CI workflows, git tags) before writing — no invented features. |
| 🗣️ **No slash command needed** | Ask "write a README for this project" in plain language and Claude applies the skill; `/readme-style:apply` still works. |
| 🔎 **Read-only check** | The `readme-style:check` skill reports what is missing from the current README, backed by the same script as the hook, and changes nothing. |
| ⚙️ **Per-project config** | An optional `.readme-style.json` sets `lang`, `sections`, and `hook`; `README_STYLE_HOOK=0` silences the hook globally. |
| 🌐 **Language that follows you** | Uses `lang` from `.readme-style.json` if set, else the existing README's language, else the language you're writing in. |
| 🧩 **Preserves custom sections** | Roadmap, Contributing, FAQ, and any other section not part of the template are kept verbatim after the generated ones. A section that covers the same ground as a template one (Getting started, Install, Overview) is merged into it, not duplicated. |
| 🎨 **One consistent visual style** | Centered header, real badges (no fake test/version metrics), anchored table of contents, emoji sections, `<details>` blocks for long content. |
| 🤷 **Honest with empty repos** | An early-stage repo gets a short, honest README, not a forced structure with empty sections. |

---

## 🧠 How it works

- **`SessionStart` hook** (`hooks/scripts/check-readme.mjs`, wired through
  `hooks/hooks.json`) runs once per new session (`startup` matcher only, not on
  resume, clear, compact, or fork). It fails open: any error is swallowed, a
  missing `node` included, and never blocks the session start. It walks up from the current directory to find the
  git repo root, checks for a `README.md` there, and looks for the layout's
  marks (a centered header with an emoji `# H1`, a shields.io badge, at least two
  emoji `##` sections) reading the whole file. If something is missing, it
  emits a one-line, neutral note naming exactly what is missing: shown to you
  (`systemMessage`) and added to the model's context (`additionalContext`) with
  an instruction not to run `apply` unless asked. `README_STYLE_HOOK=0` or
  `{"hook": false}` in `.readme-style.json` silences it.
- **`readme-style:apply` skill** (`skills/apply/SKILL.md`) instructs Claude to
  explore the project's real code and write or rewrite `README.md` following
  the template below — and nothing else: it doesn't commit, and its write
  permission is scoped to `README.md`. Accepts a target path (first argument
  only), free-text instructions (for example "only the Usage section"), and
  `--dry-run` to print the proposed README without writing it.
- **`readme-style:check` skill** (`skills/check/SKILL.md`) runs the same script
  in report mode (`--report`) and relays the status, what's missing, and the
  active config, without touching any file.

---

## 📦 Installation

```bash
claude plugin marketplace add brquatti/readme-style
claude plugin install readme-style@readme-style
```

Skills from a freshly installed plugin aren't available in the session that
installed it — open a new session (or run `/reload-plugins`) before using
`/readme-style:apply`.

---

## 🚀 Usage

Inside any project:

```text
/readme-style:apply
```

Or just ask in plain language ("write a README for this project"); the skill
is auto-invocable. The `SessionStart` hook flags a README that needs attention,
so in practice you run it when it suggests it.

To check without changing anything:

```text
/readme-style:check
```

---

## 🗂️ Project structure

```text
readme-style/
├─ .claude-plugin/
│  ├─ plugin.json         # plugin manifest
│  └─ marketplace.json    # marketplace listing (this repo itself)
├─ skills/
│  ├─ apply/SKILL.md      # readme-style:apply
│  └─ check/SKILL.md      # readme-style:check
├─ hooks/
│  ├─ hooks.json          # SessionStart wiring
│  └─ scripts/
│     └─ check-readme.mjs # shared logic: hook note + --report
├─ tests/
│  └─ check-readme.test.mjs
├─ CHANGELOG.md
└─ .github/workflows/ci.yml   # node --test + claude plugin validate --strict
```

Run the tests locally with `node --test tests/*.test.mjs`.

---

## ⚙️ Configuration

An optional `.readme-style.json` at the repo root:

```json
{
  "lang": "en",
  "sections": ["✨ Features", "🚀 Usage"],
  "hook": false
}
```

- `lang` — forces the README language (otherwise: existing README language,
  then the language you write in, as above).
- `sections` — overrides the default section list and order. Keep the emoji in each
  entry: the layout check wants at least two `## <emoji> Section` headings.
- `hook` — set to `false` to silence the `SessionStart` nudge for this repo.
  `README_STYLE_HOOK=0` silences it globally, for every project.

---

## 🎨 The generated layout

```text
<div align="center">

# <emoji> AppName
## <strong one-line tagline>
*<italic subtitle, 3-5 keywords>*

![badge] ![badge] ![badge]

</div>
---
> <opening paragraph: the problem the app solves>
---
## 📋 Table of contents      (only if the README has 5+ sections)
## ✨ Features
## 🧠 How it works
## 📦 Installation
## 🚀 Usage
## 🗂️ Project structure

<custom sections preserved from the existing README>

<div align="center">*<short, honest closing line>*</div>
```

Rules the skill always follows: no invented features, no License or
Author/Contact section, never a "tests passing" or "PRs welcome" badge, a CI or
version badge only when a real workflow or git tag/package version backs it, and
a version number inside a badge (`node-≥22`) only with a source in the repo
(`engines`, CI matrix, `.nvmrc`, ...).

<div align="center">

*Personal project, open because it might be useful to more people.*

</div>
