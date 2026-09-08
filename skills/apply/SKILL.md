---
name: apply
description: Generate or update README.md in the readme-style layout (centered header, real badges, table of contents, emoji sections) from the project's actual code. Use when the user asks to write, create, generate, update, refresh, or fix a README.
argument-hint: "[path] [instructions | --dry-run]"
allowed-tools: Read, Edit(README.md), Grep, Glob, Bash(git:*), Bash(ls:*), Bash(tree:*), Bash(find:*), Bash(node:*)
---

# Apply the readme-style layout

Arguments: `$ARGUMENTS` (a target path, free-text instructions, `--dry-run`, or nothing).
Target: the `target:` line of the report below.

Current status, from the plugin's own checker:

!`node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-readme.mjs" --report "$ARGUMENTS"`

## 1. Understand the project for real

Read the actual code before writing anything: entry points, dependencies, config, main
modules, scripts, CI workflows, git tags. If a README already exists, read it, but do not
trust it blindly: confirm every claim against the code and fix what is stale.

## 2. Pick language and sections

- Language: `lang` from the report if set; else the language of the existing README; else
  the language the user is writing in.
- Sections: `sections` from the report if set; else the defaults below, in this order.

| default (en) | default (pt) |
|---|---|
| ✨ Features | ✨ Funcionalidades |
| 🧠 How it works | 🧠 Como funciona |
| 📦 Installation | 📦 Instalação |
| 🚀 Usage | 🚀 Uso |
| 🗂️ Project structure | 🗂️ Estrutura do projeto |

Table of contents heading: `📋 Table of contents` / `📋 Sumário`. Count the `##` sections
you are about to write (template plus preserved). 5 or more: include it, with anchor links.
4 or fewer: leave it out. The five default sections alone already qualify.

## 3. Write README.md in this layout

```
<div align="center">

# <emoji> AppName

## <strong one-line tagline>

*<short italic subtitle, 3-5 keywords separated by · >*

<br/>

![badge](https://img.shields.io/badge/...) ![badge](...) ![badge](...)

</div>

---

> <opening paragraph: the problem the app solves and why it exists>

<optional: a code block with a real usage example, only if it fits the kind of app>

---

## 📋 Table of contents   (only with 5+ sections)

---

## ✨ Features
## 🧠 How it works
## 📦 Installation
## 🚀 Usage
## 🗂️ Project structure   (wrap in <details><summary>...</summary> if the tree is large)

<custom sections preserved from the existing README, see step 4>

<div align="center">

*<short, honest closing line>*

</div>
```

## 4. Preserve what is not yours

- An existing section that covers the same ground as a template section (Install, Getting
  started, Overview, Setup, ...) is merged into that template section, not kept as a copy.
- Every other existing section (Roadmap, Contributing, Changelog, FAQ, ...) is kept
  verbatim, in its original order, after the template sections and before the closing
  line. Verbatim means byte for byte: do not tick checkboxes or reword items even when the
  code shows they are done; mention it in your report instead.
- Never drop links, images, or examples that are still true just because they do not fit
  the template.

## Hard rules

- NEVER invent features. Every claim must be backed by code you read.
- Do not run the project's code, tests, or build. Read them; running is not yours to do.
- NEVER add a License or Author/Contact section.
- Badges via `img.shields.io` only for verifiable facts: language, platform, key libraries,
  status. A CI badge only if `.github/workflows/*.yml` exists. A version badge only if there
  is a git tag or a `version` field in the package manifest (`package.json`, `pyproject`,
  `Cargo.toml`, ...). Never "tests passing" or "PRs welcome".
- A version number inside a badge (for example `node-≥18`) needs a source you read:
  `engines`, a CI matrix, `.nvmrc`, `pyproject`, a lockfile. No source, no number: use the
  bare name (`node`, `python`).
- Empty or early-stage repo: say so in a short, honest README instead of forcing the full
  structure with empty sections.
- Direct, confident tone. No corporate marketing.
- Do not touch any file other than README.md.
- If the arguments contain `--dry-run`, print the full proposed README in the chat and
  write nothing.
- If the arguments contain instructions (for example `only the Usage section`), follow
  them and edit only what they ask for.

## 5. Report

Summarize in a few lines what changed. Do not commit or push unless the user explicitly
asks.
