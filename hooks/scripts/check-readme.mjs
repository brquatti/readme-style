#!/usr/bin/env node
// readme-style — SessionStart advisory hook, `check` report, `config` reader/writer.
// The hook prints only: never writes, never blocks, fails open on every error.
//
//   node check-readme.mjs                  hook mode: one-line note or nothing
//   node check-readme.mjs --report [dir]   report mode: full status for the skills
//   node check-readme.mjs --config         config mode: print .readme-style.json
//   node check-readme.mjs --config <k> <v> config mode: write one key into it

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG_FILE = '.readme-style.json';

// Pictographs (⚙, 📐, ZWJ sequences start with one), flags (regional indicators), keycaps
// (#️⃣). Unicode `u` flag only: `\p{RGI_Emoji}` needs the `v` flag, which Node 18 lacks.
const EMOJI = '(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator}|[#*0-9]\\uFE0F?\\u20E3)';
const TOC = /table of contents|sum[\u00e1a]rio/i;

// Titles of the `## <emoji> Title` headings, in order.
function sectionTitles(t) {
  return [...t.matchAll(new RegExp(`^## ${EMOJI}\\s*(.*)$`, 'gmu'))].map((m) => m[1].trim());
}

const CHECKS = {
  centeredHeader: (t) => t.includes('align="center"'),
  emojiTitle: (t) => new RegExp(`^# ${EMOJI}`, 'mu').test(t),
  badges: (t) => t.includes('img.shields.io'),
  emojiSections: (t) => sectionTitles(t).length >= 2,
  // 5 or more real sections require a table of contents; fewer must not have one forced.
  tableOfContents: (t) => {
    const titles = sectionTitles(t);
    return titles.some((x) => TOC.test(x)) || titles.filter((x) => !TOC.test(x)).length < 5;
  },
};

export const LABELS = {
  centeredHeader: 'centered header (align="center")',
  emojiTitle: 'H1 title starting with an emoji',
  badges: 'at least one shields.io badge',
  emojiSections: 'at least two "## <emoji> Section" headings',
  tableOfContents: 'a "## <emoji> Table of contents" heading (required from 5 sections up)',
};

export function analyze(text) {
  const missing = Object.keys(CHECKS).filter((k) => !CHECKS[k](text));
  return { ok: missing.length === 0, missing };
}

// Walks up from `dir` until a `.git` entry (dir or worktree file) is found.
export function findRepoRoot(dir) {
  let cur = path.resolve(dir);
  for (;;) {
    if (fs.existsSync(path.join(cur, '.git'))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

export function loadConfig(dir) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, CONFIG_FILE), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function findReadme(dir) {
  const names = fs.readdirSync(dir);
  const md = names.find((n) => n.toLowerCase() === 'readme.md');
  if (md) return { file: path.join(dir, md), markdown: true };
  const other = names.find((n) => /^readme(\.|$)/i.test(n));
  return other ? { file: path.join(dir, other), markdown: false } : null;
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// The `.readme-style.json` keys `config` accepts, each returning null on an invalid value.
const KEYS = {
  lang: (v) => (/^[a-z]{2}(-[A-Za-z]{2})?$/.test(v) ? v : null),
  sections: (v) => {
    const list = v.split(/\s*[|,]\s*/).map((x) => x.trim()).filter(Boolean);
    return list.length ? list : null;
  },
  hook: (v) => (/^(on|true)$/i.test(v) ? true : /^(off|false)$/i.test(v) ? false : null),
};

function configLines(config) {
  return [
    `lang: ${config.lang || 'not set (use the existing README language, else the language the user writes in)'}`,
    `sections: ${Array.isArray(config.sections) && config.sections.length ? config.sections.join(' | ') : 'default'}`,
    `hook: ${config.hook === false ? 'off' : 'on'}`,
  ];
}

// Config mode. `args` is the raw skill argument string: empty prints the current config,
// `<key> <value>` writes that key into `.readme-style.json` at the repo root. Throws on a
// bad key or value — unlike the hook, this one is asked for, so it must fail loudly.
export function config(cwd, args = '') {
  const root = findRepoRoot(cwd) || path.resolve(cwd);
  const file = path.join(root, CONFIG_FILE);
  const [key, ...rest] = args.trim().split(/\s+/).filter(Boolean);
  const current = loadConfig(root);

  if (!key) {
    const exists = fs.existsSync(file);
    return ['readme-style config', `file: ${file}${exists ? '' : ' (not created yet)'}`, ...configLines(current)].join('\n') + '\n';
  }
  if (!Object.hasOwn(KEYS, key)) throw new Error(`unknown key "${key}". Keys: ${Object.keys(KEYS).join(', ')}`);
  const value = KEYS[key](rest.join(' '));
  if (value === null) throw new Error(`invalid value for "${key}": "${rest.join(' ')}"`);

  const next = { ...current, [key]: value };
  fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
  return [`readme-style config: ${key} set`, `file: ${file}`, ...configLines(next)].join('\n') + '\n';
}

// Hook mode. Returns '' when there is nothing to say, else a one-line note for the user.
export function hook(cwd, env = {}) {
  if (env.README_STYLE_HOOK === '0') return '';
  const root = findRepoRoot(cwd);
  if (!root) return '';
  if (loadConfig(root).hook === false) return '';

  const readme = findReadme(root);
  if (!readme) {
    return `readme-style: no README.md in ${root}. Run /readme-style:apply to generate one.`;
  }
  if (!readme.markdown) return '';

  const { ok, missing } = analyze(fs.readFileSync(readme.file, 'utf8'));
  if (ok) return '';
  const labels = missing.map((k) => LABELS[k]).join('; ');
  return `readme-style: README.md in ${root} is not in the readme-style layout (missing: ${labels}). Run /readme-style:apply to update it.`;
}

// Report mode. `args` is the raw skill argument string; its first token becomes the
// target when it is an existing directory, otherwise the repo root (or cwd).
export function report(cwd, args = '') {
  const first = path.resolve(cwd, args.trim().split(/\s+/)[0] || '.');
  const target = args.trim() && isDir(first) ? first : findRepoRoot(cwd) || path.resolve(cwd);
  const root = findRepoRoot(target);
  const config = { ...(root ? loadConfig(root) : {}), ...loadConfig(target) };

  const lines = ['readme-style report', `target: ${target}`];
  const readme = findReadme(target);
  if (!readme) {
    lines.push('readme: none', 'status: missing');
  } else if (!readme.markdown) {
    lines.push(`readme: ${readme.file} (not Markdown; readme-style only manages README.md)`, 'status: skipped');
  } else {
    const { ok, missing } = analyze(fs.readFileSync(readme.file, 'utf8'));
    lines.push(`readme: ${readme.file}`, `status: ${ok ? 'ok' : 'off-layout'}`);
    if (!ok) lines.push(`missing: ${missing.map((k) => LABELS[k]).join('; ')}`);
  }
  lines.push(...configLines(config));
  return lines.join('\n') + '\n';
}

function main() {
  const argv = process.argv.slice(2);
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (argv[0] === '--config') {
    try {
      return process.stdout.write(config(cwd, argv.slice(1).join(' ')));
    } catch (e) {
      process.exitCode = 1;
      return process.stdout.write(`readme-style config error: ${e.message}\n`);
    }
  }
  try {
    if (argv[0] === '--report') return process.stdout.write(report(cwd, argv.slice(1).join(' ')));
    const note = hook(cwd, process.env);
    if (!note) return;
    // systemMessage is shown to the user; additionalContext goes to the model.
    process.stdout.write(JSON.stringify({
      systemMessage: note,
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `${note} (This note was shown to the user. Do not run it unless the user asks.)`,
      },
    }));
  } catch {
    // fail open: say nothing, exit 0
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
