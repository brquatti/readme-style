import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { analyze, findRepoRoot, loadConfig, hook, report } from '../hooks/scripts/check-readme.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(ROOT, 'hooks/scripts/check-readme.mjs');

const STYLED = `<div align="center">

# 📐 demo

## Tagline

![Node](https://img.shields.io/badge/node-18-339933)

</div>

---

## ✨ Features

## 🚀 Usage
`;
const PLAIN = '# demo\n\nSome project.\n';
const FAKE = '<p align="center"><img src="https://img.shields.io/badge/a-b-c"></p>\n\n# demo\n\ntext\n';

function tmp(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `readme-style-${name}-`));
}
function repo(name, files = {}) {
  const dir = tmp(name);
  fs.mkdirSync(path.join(dir, '.git'));
  for (const [f, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), content);
  }
  return dir;
}

test('analyze: styled README passes', () => {
  assert.deepEqual(analyze(STYLED), { ok: true, missing: [] });
});

test('analyze: plain README fails every check', () => {
  assert.deepEqual(analyze(PLAIN).missing, ['centeredHeader', 'emojiTitle', 'badges', 'emojiSections']);
});

test('analyze: centered header + badge alone is not enough', () => {
  assert.deepEqual(analyze(FAKE).missing, ['emojiTitle', 'emojiSections']);
});

test('analyze: flags, keycaps, ZWJ sequences, and bare symbols all count as emoji', () => {
  for (const e of ['🇧🇷', '#️⃣', '👨‍💻', '👍🏽', '🗂️', '⚙']) {
    assert.equal(analyze(STYLED.replace('# 📐', `# ${e}`).replace('## ✨', `## ${e}`)).ok, true, e);
  }
  assert.deepEqual(analyze(STYLED.replace('# 📐', '# 1')).missing, ['emojiTitle']);
});

test('analyze: reads the whole file, not only the first 3000 chars', () => {
  const late = '# intro\n\n' + 'a'.repeat(3100) + '\n\n' + STYLED;
  assert.equal(analyze(late).ok, true);
});

test('findRepoRoot: walks up from a subdirectory and accepts a .git worktree file', () => {
  const dir = repo('root');
  fs.mkdirSync(path.join(dir, 'packages/app'), { recursive: true });
  assert.equal(findRepoRoot(path.join(dir, 'packages/app')), dir);

  const wt = tmp('worktree');
  fs.writeFileSync(path.join(wt, '.git'), 'gitdir: /elsewhere\n');
  assert.equal(findRepoRoot(wt), wt);

  assert.equal(findRepoRoot(tmp('nogit')), null);
});

test('loadConfig: missing or invalid file yields {}', () => {
  const dir = tmp('cfg');
  assert.deepEqual(loadConfig(dir), {});
  fs.writeFileSync(path.join(dir, '.readme-style.json'), '{not json');
  assert.deepEqual(loadConfig(dir), {});
  fs.writeFileSync(path.join(dir, '.readme-style.json'), '{"lang":"pt","hook":false}');
  assert.deepEqual(loadConfig(dir), { lang: 'pt', hook: false });
});

test('hook: the three promised scenarios', () => {
  assert.match(hook(repo('none')), /no README\.md/);
  assert.match(hook(repo('plain', { 'README.md': PLAIN })), /not in the readme-style layout/);
  assert.equal(hook(repo('styled', { 'README.md': STYLED })), '');
});

test('hook: note names what is missing', () => {
  assert.match(hook(repo('fake', { 'README.md': FAKE })), /H1 title starting with an emoji/);
});

test('hook: checks the repo root README when started in a subdirectory', () => {
  const dir = repo('sub', { 'README.md': PLAIN, 'packages/app/index.js': '' });
  assert.match(hook(path.join(dir, 'packages/app')), new RegExp(`README\\.md in ${dir}`));
});

test('hook: silent outside git, for non-Markdown READMEs, and when opted out', () => {
  assert.equal(hook(tmp('nogit')), '');
  assert.equal(hook(repo('rst', { 'README.rst': 'x' })), '');
  assert.equal(hook(repo('cfg-off', { 'README.md': PLAIN, '.readme-style.json': '{"hook":false}' })), '');
  assert.equal(hook(repo('env-off', { 'README.md': PLAIN }), { README_STYLE_HOOK: '0' }), '');
});

test('hook: lowercase readme.md is found', () => {
  assert.equal(hook(repo('lower', { 'readme.md': STYLED })), '');
});

test('report: describes status, config, and honours an explicit target dir', () => {
  const dir = repo('rep', {
    'README.md': STYLED,
    '.readme-style.json': '{"lang":"en","sections":["✨ Features","🚀 Usage"],"hook":false}',
    'packages/app/README.md': PLAIN,
  });
  const top = report(dir);
  assert.match(top, /status: ok/);
  assert.match(top, /lang: en/);
  assert.match(top, /sections: ✨ Features \| 🚀 Usage/);
  assert.match(top, /hook: off/);

  const sub = report(dir, 'packages/app some free text');
  assert.match(sub, /status: off-layout/);
  assert.match(sub, /missing: centered header/);
  assert.match(sub, /lang: en/, 'inherits the repo-root config');
  assert.match(report(dir, 'fix the packages section'), /status: ok/, 'only the first token can be a path');

  assert.match(report(repo('rep-none')), /status: missing/);
  assert.match(report(repo('rep-rst', { 'README.rst': 'x' })), /status: skipped/);
});

test('cli: exits 0 and prints the note for the user and the model, honouring CLAUDE_PROJECT_DIR', () => {
  const dir = repo('cli', { 'README.md': PLAIN });
  const out = JSON.parse(execFileSync('node', [SCRIPT], { env: { ...process.env, CLAUDE_PROJECT_DIR: dir } }).toString());
  assert.match(out.systemMessage, /not in the readme-style layout/);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(out.hookSpecificOutput.additionalContext, /Do not run it unless the user asks/);
  const rep = execFileSync('node', [SCRIPT, '--report'], { cwd: dir, env: { ...process.env, CLAUDE_PROJECT_DIR: '' } }).toString();
  assert.match(rep, /^readme-style report/);
});

test('cli: fails open on an unreadable project dir', () => {
  const out = execFileSync('node', [SCRIPT], { env: { ...process.env, CLAUDE_PROJECT_DIR: '/nonexistent/x' } }).toString();
  assert.equal(out, '');
});

test('manifests: hooks.json wires the script on startup only and is not also listed in plugin.json', () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(plugin.hooks, undefined, 'hooks/hooks.json loads on its own; listing it again fails the plugin load');
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks/hooks.json'), 'utf8'));
  const [entry] = hooks.hooks.SessionStart;
  assert.equal(entry.matcher, 'startup');
  assert.match(entry.hooks[0].command, /\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/scripts\/check-readme\.mjs/);
  const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(marketplace.plugins[0].name, plugin.name);
  assert.match(fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8'), new RegExp(`## \\[${plugin.version}\\]`));
});

test('skills: every SKILL.md has frontmatter whose name matches its directory', () => {
  const skillsDir = path.join(ROOT, 'skills');
  const names = fs.readdirSync(skillsDir);
  assert.ok(names.includes('apply') && names.includes('check'));
  for (const name of names) {
    const text = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(fm, `${name}: missing frontmatter`);
    assert.match(fm[1], new RegExp(`^name: ${name}$`, 'm'));
    assert.match(fm[1], /^description: .{20,}/m);
    assert.doesNotMatch(text, /\$\{1:-/, `${name}: shell-style defaults are not expanded by Claude Code`);
    assert.doesNotMatch(text, /(^|[^{$])\$CLAUDE_[A-Z_]+/, `${name}: env vars only expand as \${VAR}`);
  }
});
