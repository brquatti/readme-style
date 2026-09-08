#!/usr/bin/env node
// readme-style — SessionStart advisory hook and `check` report.
// Prints only. Never writes, never blocks. Fails open on every error.
//
//   node check-readme.mjs                  hook mode: one-line note or nothing
//   node check-readme.mjs --report [dir]   report mode: full status for the skills

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG_FILE = '.readme-style.json';

const CHECKS = {
  centeredHeader: (t) => t.includes('align="center"'),
  // RGI_Emoji covers flags and keycaps; Extended_Pictographic covers bare symbols like ⚙.
  emojiTitle: (t) => /^# (?:\p{RGI_Emoji}|\p{Extended_Pictographic})/mv.test(t),
  badges: (t) => t.includes('img.shields.io'),
  emojiSections: (t) => (t.match(/^## (?:\p{RGI_Emoji}|\p{Extended_Pictographic})/gmv) || []).length >= 2,
};

export const LABELS = {
  centeredHeader: 'centered header (align="center")',
  emojiTitle: 'H1 title starting with an emoji',
  badges: 'at least one shields.io badge',
  emojiSections: 'at least two "## <emoji> Section" headings',
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

const NOTE_TAIL = 'Do not run it unless the user asks.';

// Hook mode. Returns '' when there is nothing to say.
export function hook(cwd, env = {}) {
  if (env.README_STYLE_HOOK === '0') return '';
  const root = findRepoRoot(cwd);
  if (!root) return '';
  if (loadConfig(root).hook === false) return '';

  const readme = findReadme(root);
  if (!readme) {
    return `readme-style: no README.md in ${root}. The user can run /readme-style:apply to generate one. ${NOTE_TAIL}`;
  }
  if (!readme.markdown) return '';

  const { ok, missing } = analyze(fs.readFileSync(readme.file, 'utf8'));
  if (ok) return '';
  const labels = missing.map((k) => LABELS[k]).join('; ');
  return `readme-style: README.md in ${root} is not in the readme-style layout (missing: ${labels}). The user can run /readme-style:apply to update it. ${NOTE_TAIL}`;
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
  lines.push(
    `lang: ${config.lang || 'not set (use the existing README language, else the language the user writes in)'}`,
    `sections: ${Array.isArray(config.sections) && config.sections.length ? config.sections.join(' | ') : 'default'}`,
    `hook: ${config.hook === false ? 'off' : 'on'}`
  );
  return lines.join('\n') + '\n';
}

function main() {
  try {
    const argv = process.argv.slice(2);
    const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const out = argv[0] === '--report' ? report(cwd, argv.slice(1).join(' ')) : hook(cwd, process.env);
    if (out) process.stdout.write(out);
  } catch {
    // fail open: say nothing, exit 0
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
