---
description: Gera ou atualiza o README.md do projeto atual no padrão pessoal (header centralizado, badges reais, sumário, seções com emoji, sem license/autor).
argument-hint: "[path]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Aplicar o padrão de README

Alvo: `${1:-$CLAUDE_PROJECT_DIR}`.

## 1. Entenda o projeto de verdade

Leia o código real (entry points, dependências, configs, módulos principais) antes de
escrever qualquer coisa. Se já existir um README, leia-o também, mas não confie cegamente
nele — confirme contra o código, e corrija o que estiver desatualizado.

## 2. Escreva/reescreva o README.md neste formato

```
<div align="center">

# <emoji> NomeDoApp

## <tagline forte de uma linha, em negrito>

*<subtítulo curto em itálico, 3-5 palavras-chave separadas por · >*

<br/>

![badge](https://img.shields.io/badge/...) ![badge](...) ![badge](...)

</div>

---

> <parágrafo de abertura: o problema que o app resolve e por que existe>

<opcional: bloco de código mostrando um exemplo real de uso, só se fizer sentido pro tipo de app>

---

## 📋 Sumário   (inclua só se o README tiver 5+ seções, com links âncora)

---

## ✨ Funcionalidades
## 🧠 Como funciona
## 📦 Instalação
## 🚀 Uso
## 🗂️ Estrutura do projeto   (use <details><summary>...</summary> se a árvore for grande)

<div align="center">

*<frase de fechamento curta e honesta>*

</div>
```

## Regras obrigatórias

- NUNCA invente funcionalidade que não existe no código real.
- NUNCA adicione seção de License nem de Autor/Contato.
- Badges via `img.shields.io` só com fatos reais e verificáveis (linguagem, plataforma,
  libs-chave, status tipo `status-projeto%20pessoal`). NUNCA badge de "tests passing",
  "version" ou "PRs welcome" a menos que o projeto realmente tenha CI/versionamento público.
- Se o repositório estiver vazio ou em estágio inicial, escreva isso honestamente em vez
  de forçar a estrutura completa com seções vazias.
- Português, tom direto e confiante, sem exagero de marketing corporativo.
- Não toque em nenhum arquivo além do README.md.

## 3. Reporte

Resuma em poucas linhas o que mudou no README. Não commite nem dê push automaticamente —
deixe a revisão e o commit para o usuário, a menos que ele peça explicitamente.
