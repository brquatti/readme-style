#!/usr/bin/env node
// readme-style — SessionStart advisory hook.
// Only ever suggests; never writes, never blocks. Fail-open on every error.

import fs from 'node:fs';
import path from 'node:path';

try {
  const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  const isGitRepo = fs.existsSync(path.join(dir, '.git'));
  if (!isGitRepo) process.exit(0);

  const readmePath = ['README.md', 'Readme.md', 'readme.md']
    .map((f) => path.join(dir, f))
    .find((p) => fs.existsSync(p));

  if (!readmePath) {
    process.stdout.write(
      'Este projeto não tem README.md — rode /readme-style:apply pra gerar um no seu padrão pessoal.'
    );
    process.exit(0);
  }

  const head = fs.readFileSync(readmePath, 'utf8').slice(0, 3000);
  const hasStyle = head.includes('align="center"') && head.includes('img.shields.io');

  if (!hasStyle) {
    process.stdout.write(
      'O README deste projeto não está no seu padrão pessoal (header centralizado, badges, sumário) — rode /readme-style:apply pra atualizar.'
    );
  }

  process.exit(0);
} catch {
  process.exit(0);
}
